#!/usr/bin/env bash
#
# Repeatable SPA deploy: build -> three upload passes -> invalidate -> verify.
#
# Deliberately never touches the CloudFront Function, the distribution config or
# the bucket policy. Routing changes are a bootstrap.sh (human) action, per
# context/foundation/infrastructure.md ("Approval").
#
# Usage: scripts/deploy/deploy.sh [--skip-build] [--prune] [--invalidate-all]
#                                 [--no-wait] [--dry-run]

set -Eeuo pipefail
export AWS_PAGER=""
export AWS_DEFAULT_OUTPUT=json
trap 'echo "FAILED: ${BASH_SOURCE[0]}:${LINENO}" >&2' ERR

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
# shellcheck source=config.sh
. "$HERE/config.sh"
# shellcheck source=lib.sh
. "$HERE/lib.sh"

SKIP_BUILD=0
PRUNE=0
INVALIDATE_ALL=0
NO_WAIT=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    --prune) PRUNE=1 ;;
    --invalidate-all) INVALIDATE_ALL=1 ;;
    --no-wait) NO_WAIT=1 ;;
    --dry-run) DRY_RUN=1 ;;
    *) die "unknown argument: $arg" ;;
  esac
done

require_cmd aws npm
assert_account
cd "$ROOT"

# --- resolve and cross-check the target -------------------------------------
DIST_ID="${CF_DISTRIBUTION_ID:-$(find_distribution_id)}"
[ -n "$DIST_ID" ] ||
  die "no distribution with Comment=${CF_DISTRIBUTION_COMMENT}; run scripts/deploy/bootstrap.sh first"

origin="$(aws cloudfront get-distribution-config --id "$DIST_ID" \
  --query 'DistributionConfig.Origins.Items[0].DomainName' --output text)"
[ "$origin" = "$S3_ORIGIN_DOMAIN" ] ||
  die "distribution $DIST_ID points at $origin, not $S3_ORIGIN_DOMAIN"

echo "==> distribution $DIST_ID -> s3://$S3_BUCKET"
# --porcelain, not `git diff --quiet`: the latter ignores staged and untracked
# changes, so a `git add`-ed edit would be reported as a clean SHA it is not in.
dirty=""
[ -n "$(git status --porcelain)" ] && dirty=" (DIRTY)"
echo "==> shipping $(git rev-parse --short HEAD)$dirty"
# VITE_API_BASE_URL is baked into the bundle, so print what is actually shipping.
echo "==> VITE_API_BASE_URL=${VITE_API_BASE_URL-<unset -> /api/v1>}"

# --- build ------------------------------------------------------------------
# VITE_API_BASE_URL is read with ?? in src/shared/composables/useApi.ts, so an
# empty string would NOT fall back to /api/v1 — it would produce URLs relative to
# the current page. Unset is correct; empty is a footgun.
if [ -n "${VITE_API_BASE_URL+x}" ] && [ -z "${VITE_API_BASE_URL}" ]; then
  die "VITE_API_BASE_URL is set to the empty string; unset it (?? does not treat '' as nullish)"
fi
# .env.production.local is the HIGHEST priority file Vite loads in production
# mode, and it is gitignored — so it is invisible in git status and would ship a
# developer's localhost API URL without any other signal.
for f in .env .env.local .env.production .env.production.local; do
  [ -f "$f" ] && die "unexpected $f would change the build; remove it or deploy deliberately"
done

if [ "$SKIP_BUILD" -eq 1 ]; then
  echo "==> build skipped (--skip-build)"
else
  # rm -rf is not just hygiene: `aws s3 sync` compares size + mtime only, so
  # without fresh mtimes a changed Cache-Control silently never re-uploads.
  echo "==> building"
  rm -rf dist
  npm run build
fi

[ -f dist/index.html ] && [ -d dist/assets ] || die "build produced no dist/"

# Every file at the dist root must be claimed by exactly one upload pass. Pass 1
# starts with --exclude "*", so an unrecognised root file is not merely
# mis-cached — it is never uploaded at all, and index.html would reference a 403.
# If this fires, add the file to ICON_FILES or NEVER_CACHE_FILES in config.sh.
for path in dist/*; do
  f="$(basename "$path")"
  [ "$f" = "assets" ] && continue
  case " $NEVER_CACHE_FILES $ICON_FILES " in
    *" $f "*) continue ;;
  esac
  case "$f" in
    workbox-*.js) continue ;;  # content-addressed, caches immutably with pass 1
  esac
  die "dist/$f is not covered by any upload pass; add it to NEVER_CACHE_FILES or ICON_FILES in scripts/deploy/config.sh"
done

# The root guard above says nothing about dist/assets/, and pass 1 gives that
# whole directory a one-year immutable header. Vite hashes everything it emits
# there, but a file copied from public/assets/ or added via assetsInclude would
# land unhashed and be pinned in every browser cache for a year with no way to
# bust it. Require the -<hash>. shape.
for path in dist/assets/*; do
  f="${path##*/}"
  case "$f" in
    *-[A-Za-z0-9_-][A-Za-z0-9_-][A-Za-z0-9_-][A-Za-z0-9_-][A-Za-z0-9_-][A-Za-z0-9_-][A-Za-z0-9_-][A-Za-z0-9_-].*) ;;
    *) die "dist/assets/$f is not content-hashed but pass 1 would cache it immutably for a year; move it out of assets/ or give it a hashed name" ;;
  esac
done

s3() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "DRY-RUN: aws $*"
    return 0
  fi
  aws "$@"
}

# --- pass 1: immutable, content-hashed --------------------------------------
# --delete is opt-in. With registerType 'autoUpdate' a phone can be holding an
# old index.html mid-deploy; deleting its hashed assets 404s the precache fetch.
# When enabled it is scoped by the same filters, so it can only ever touch
# assets/* and workbox-*.js — never a root file.
echo "==> [1/3] assets (immutable)"
if [ "$PRUNE" -eq 1 ]; then
  s3 s3 sync dist/ "s3://$S3_BUCKET/" \
    --exclude "*" --include "assets/*" --include "workbox-*.js" \
    --cache-control "$CC_IMMUTABLE" --delete --only-show-errors
else
  s3 s3 sync dist/ "s3://$S3_BUCKET/" \
    --exclude "*" --include "assets/*" --include "workbox-*.js" \
    --cache-control "$CC_IMMUTABLE" --only-show-errors
fi

# --- pass 2: icons ----------------------------------------------------------
echo "==> [2/3] icons (7 days)"
inc=""
for f in $ICON_FILES; do inc="$inc --include $f"; done
# shellcheck disable=SC2086
s3 s3 sync dist/ "s3://$S3_BUCKET/" \
  --exclude "*" $inc \
  --cache-control "$CC_ICONS" \
  --only-show-errors

# --- pass 3: never-cache, sw.js genuinely last ------------------------------
# `cp` not `sync`: unconditional upload, no mtime comparison. Content types are
# passed explicitly rather than trusting the CLI's bundled mimetypes table.
echo "==> [3/3] html + service worker (no-cache)"
for f in $NEVER_CACHE_FILES; do
  [ -f "dist/$f" ] || die "expected dist/$f in the build"
  case "$f" in
    *.html) ct="text/html; charset=utf-8" ;;
    *.webmanifest) ct="application/manifest+json" ;;
    *.js) ct="text/javascript" ;;
    *) die "no content-type mapping for $f" ;;
  esac
  s3 s3 cp "dist/$f" "s3://$S3_BUCKET/$f" \
    --cache-control "$CC_NEVER" --content-type "$ct" --only-show-errors
  echo "    $f ($ct)"
done

# --- invalidate -------------------------------------------------------------
if [ "$INVALIDATE_ALL" -eq 1 ]; then
  paths="/*"
else
  paths="$INVALIDATION_PATHS"
fi
echo "==> invalidating: $paths"
if [ "$DRY_RUN" -eq 1 ]; then
  echo "DRY-RUN: create-invalidation"
else
  # shellcheck disable=SC2086
  INV_ID="$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" \
    --paths $paths --query 'Invalidation.Id' --output text)"
  if [ "$NO_WAIT" -eq 1 ]; then
    echo "    $INV_ID (not waiting)"
  else
    echo "    $INV_ID, waiting..."
    # The waiter gives up after 30 x 20s = 10 min and exits 255. The upload is
    # already complete and correct at that point, so letting set -e kill the run
    # would skip verification over a slow invalidation. Warn and continue; the
    # only cost is that verify.sh may read a not-yet-evicted edge copy, which it
    # reports as a mismatch rather than a pass.
    if ! aws cloudfront wait invalidation-completed \
      --distribution-id "$DIST_ID" --id "$INV_ID"; then
      echo "    WARNING: invalidation $INV_ID did not complete within the waiter's"
      echo "    10 minute budget. The upload succeeded. Verification may see stale"
      echo "    edge copies; re-run scripts/deploy/verify.sh once it settles."
    fi
  fi
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo "dry run complete."
  exit 0
fi

echo ""
exec "$HERE/verify.sh"
