#!/usr/bin/env bash
#
# Read-only post-deploy assertions. Exits non-zero if any fail.
#
# Rows (e) and (f) are the reason this whole design exists: nothing may turn a
# missing asset or an API response into an HTML 200, because
# src/shared/composables/useApi.ts gates its token-refresh path on the status
# literally being 401. Rows (g)-(i) catch someone later reintroducing the
# problem through the console.
#
# Usage: scripts/deploy/verify.sh [<cloudfront-domain>]

set -uo pipefail
export AWS_PAGER=""
export AWS_DEFAULT_OUTPUT=json

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
# shellcheck source=config.sh
. "$HERE/config.sh"
# shellcheck source=lib.sh
. "$HERE/lib.sh"

cd "$ROOT" || exit 1
require_cmd aws curl

DIST_ID="${CF_DISTRIBUTION_ID:-$(find_distribution_id)}"
[ -n "$DIST_ID" ] || die "no distribution with Comment=${CF_DISTRIBUTION_COMMENT}"
D="${1:-$(distribution_domain "$DIST_ID")}"

fail=0
chk() {
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: got '$2' want '$3'"
    fail=1
  fi
}
bad() {
  echo "  FAIL $1"
  fail=1
}

hdr() { curl -sSI "$1" | tr -d '\r' | awk -v k="$2" 'BEGIN{IGNORECASE=1} tolower($1)==tolower(k":"){print $2}'; }
code() { curl -sS -o "${2:-/dev/null}" -w '%{http_code}' "$1"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "verifying https://$D  (distribution $DIST_ID)"
echo ""

# (a) root serves the SPA
echo "(a) root"
chk "GET / is 200" "$(code "https://$D/" "$TMP/root.html")" "200"
if [ -f dist/index.html ]; then
  if cmp -s "$TMP/root.html" dist/index.html; then
    echo "  ok   / is byte-identical to dist/index.html"
  else
    bad "/ differs from the dist/index.html we shipped"
  fi
fi

# (b) client-side routes fall back to index.html
echo "(b) SPA deep links"
for p in "/ops/arrivals" "/workers/42/badge" "/ops/" "/login?redirect=%2Fops%2Farrivals"; do
  chk "GET $p is 200" "$(code "https://$D$p" "$TMP/deep.html")" "200"
  if [ -f dist/index.html ] && ! cmp -s "$TMP/deep.html" dist/index.html; then
    bad "$p did not serve index.html"
  fi
done

# (c) hashed assets are immutable and compressed
echo "(c) hashed assets"
if [ -f dist/index.html ]; then
  ASSET="$(sed -nE 's|.*src="(/assets/[^"]+\.js)".*|\1|p' dist/index.html | head -1)"
  if [ -n "$ASSET" ]; then
    chk "asset cache-control" "$(hdr "https://$D$ASSET" cache-control)" "$CC_IMMUTABLE"
    # GET, not HEAD. CloudFront compresses while streaming a body, so a HEAD
    # against a cold cache returns the object uncompressed and this row fails
    # for a distribution that compresses perfectly well. A fresh deploy always
    # hits that case: the entry chunk's hash changes, so it is always a cold
    # miss. -o /dev/null keeps the body off the terminal; -D - keeps the headers.
    enc="$(curl -sS -o /dev/null -D - -H 'Accept-Encoding: br, gzip' "https://$D$ASSET" |
      tr -d '\r' | awk 'BEGIN{IGNORECASE=1}/^content-encoding:/{print $2}')"
    if [ -n "$enc" ]; then echo "  ok   asset content-encoding: $enc"; else bad "asset is not compressed"; fi
  else
    bad "could not extract an asset path from dist/index.html"
  fi
fi
WB="$(basename dist/workbox-*.js 2>/dev/null || true)"
if [ -n "$WB" ] && [ "$WB" != "workbox-*.js" ]; then
  chk "workbox immutable" "$(hdr "https://$D/$WB" cache-control)" "$CC_IMMUTABLE"
fi

# (d) the never-cache set
echo "(d) never-cache files"
for f in $NEVER_CACHE_FILES; do
  chk "/$f no-cache" "$(hdr "https://$D/$f" cache-control)" "$CC_NEVER"
done
chk "manifest content-type" \
  "$(curl -sS -o /dev/null -w '%{content_type}' "https://$D/manifest.webmanifest")" \
  "application/manifest+json"

# (e) a missing asset must NOT be rewritten to index.html
echo "(e) missing asset is not masked"
c="$(code "https://$D/assets/does-not-exist-00000000.js" "$TMP/miss")"
if [ "$c" = "200" ]; then
  bad "missing asset returned 200 (expected 403)"
else
  echo "  ok   missing asset returned $c"
fi
grep -q 'id="app"' "$TMP/miss" 2>/dev/null && bad "index.html was served for a missing asset"

# (f) /api/* must NOT be rewritten to index.html
#     If this fails, every API 401 becomes an HTML 200 and auth refresh is dead.
echo "(f) /api/* is not rewritten"
c="$(code "https://$D/api/v1/auth/login" "$TMP/api")"
ct="$(curl -sS -o /dev/null -w '%{content_type}' "https://$D/api/v1/auth/login")"
if [ "$c" = "200" ]; then
  bad "/api/v1/auth/login returned 200 — the /api/ denylist is not in effect"
else
  echo "  ok   /api/v1/auth/login returned $c ($ct)"
fi
grep -q 'id="app"' "$TMP/api" 2>/dev/null &&
  bad "/api/* was rewritten to index.html — token refresh in useApi.ts is broken"

# (g)-(i) configuration regressions
echo "(g-i) configuration"
chk "no custom error responses" \
  "$(aws cloudfront get-distribution-config --id "$DIST_ID" \
    --query 'DistributionConfig.CustomErrorResponses.Quantity' --output text)" "0"
chk "assets/* has no function attached" \
  "$(aws cloudfront get-distribution-config --id "$DIST_ID" \
    --query "DistributionConfig.CacheBehaviors.Items[?PathPattern=='assets/*'].FunctionAssociations.Quantity | [0]" \
    --output text)" "0"
chk "bucket is not publicly readable" \
  "$(code "https://$S3_ORIGIN_DOMAIN/index.html")" "403"

echo ""
if [ "$fail" -eq 0 ]; then
  echo "all checks passed — https://$D"
else
  echo "VERIFICATION FAILED"
fi
exit "$fail"
