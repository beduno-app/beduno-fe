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
# Row (f) asserts the dangerous SHAPE (200-with-HTML, or the SPA shell) rather
# than a fixed status: the API instance is stopped when idle, and a sleeping
# backend is not a frontend regression. It warns in that case instead.
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
require_cmd aws curl jq

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
# Prefer the live HTML row (a) already downloaded, so this row still runs on a
# fresh clone or in CI where dist/ does not exist. Previously the whole row was
# skipped without a word and the script still printed "all checks passed".
ASSET_SRC=""
if [ -f dist/index.html ]; then
  ASSET_SRC="dist/index.html"
elif [ -s "$TMP/root.html" ]; then
  ASSET_SRC="$TMP/root.html"
  echo "  note dist/ absent — deriving the asset path from the live / response"
fi
if [ -n "$ASSET_SRC" ]; then
  ASSET="$(sed -nE 's|.*src="(/assets/[^"]+\.js)".*|\1|p' "$ASSET_SRC" | head -1)"
  if [ -n "$ASSET" ]; then
    chk "asset cache-control" "$(hdr "https://$D$ASSET" cache-control)" "$CC_IMMUTABLE"
    # GET, not HEAD. CloudFront compresses while streaming a body, so a HEAD
    # against a cold cache returns the object uncompressed and this row fails
    # for a distribution that compresses perfectly well. A fresh deploy always
    # hits that case: the entry chunk's hash changes, so it is always a cold
    # miss. -o /dev/null keeps the body off the terminal; -D - keeps the headers.
    # tolower(), not IGNORECASE: the latter is a gawk extension that macOS awk
    # and mawk silently ignore, so this matched only because HTTP/2 lowercases
    # header names. Over HTTP/1.1 the header is "Content-Encoding" and the row
    # would report a compressing distribution as uncompressed.
    enc="$(curl -sS -o /dev/null -D - -H 'Accept-Encoding: br, gzip' "https://$D$ASSET" |
      tr -d '\r' | awk 'tolower($1)=="content-encoding:"{print $2}')"
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
# Assert the expected status, not merely "not 200". code() yields 000 on a DNS,
# TLS or timeout failure, which the old `!= 200` test happily reported as ok —
# so the row could pass without the request ever reaching S3.
chk "missing asset is 403" "$c" "403"
grep -q 'id="app"' "$TMP/miss" 2>/dev/null && bad "index.html was served for a missing asset"

# (f) /api/* reaches the API, and can never arrive as a successful SPA response
#
# The probe is an authenticated endpoint called WITHOUT a token, because that is
# the exact case the architecture exists to protect: it must come back as a
# literal 401 so the refresh interceptor in useApi.ts fires. /api/v1/auth/login
# is a worse probe — it is POST-only, and a GET against it currently 500s.
#
# Deliberately NOT /api/v1/auth/me, which 401s just as cleanly: the backend
# throttles the whole /api/v1/auth/ prefix at 10 requests/minute, so probing
# under it would spend from a bucket that real logins and token refreshes need.
# /api/v1/workers is outside that prefix and equally unauthenticated.
#
# Status is deliberately NOT asserted to a fixed value. The backend instance is
# stopped when idle to keep it cheap, and a stopped origin yields a CloudFront
# 502/504 whose error page is text/html. Hard-failing on "not 200" or on
# "content-type is html" would report a sleeping box as a routing failure and
# break every frontend deploy for a reason that has nothing to do with the
# frontend. Only the genuinely dangerous shape fails: a 200 carrying HTML, or the
# SPA shell served in place of an API response. A 502 is not 401, so useApi.ts
# never mistakes it for an expired token.
echo "(f) /api/* routing"
API_PROBE="/api/v1/workers"
c="$(code "https://$D$API_PROBE" "$TMP/api")"
ct="$(curl -sS -o /dev/null -w '%{content_type}' "https://$D$API_PROBE")"

case "$c:$ct" in
  200:text/html*) bad "$API_PROBE returned HTML 200 — token refresh in useApi.ts is broken" ;;
esac
grep -q 'id="app"' "$TMP/api" 2>/dev/null &&
  bad "$API_PROBE served the SPA shell — token refresh in useApi.ts is broken"

# Tell "the behaviour is missing" apart from "the backend is asleep". With no
# api/* behaviour the request falls through to the S3 origin, which answers 403
# with an XML <Error><Code>AccessDenied</Code> body. That is the pre-API state
# and a real failure; a 502 from a stopped instance is not.
if grep -q "AccessDenied" "$TMP/api" 2>/dev/null; then
  bad "$API_PROBE fell through to the S3 origin — the $API_PATH_PATTERN behaviour is missing or misrouted"
else
  case "$c" in
    401) echo "  ok   $API_PROBE is 401 $ct — a real API 401, so token refresh works" ;;
    000) bad "$API_PROBE: no response at all (DNS, TLS or timeout)" ;;
    502|503|504)
      echo "  WARN $API_PROBE is $c — CloudFront reached no backend."
      echo "       The EC2 instance is stopped when idle; start it and re-run verify.sh."
      ;;
    *) echo "  ok   $API_PROBE is $c $ct — routed to the API origin, not to S3" ;;
  esac
fi

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

# The api/* behaviour must never gain a function association: the CloudFront
# function rewrites extension-less paths to /index.html, which is precisely how
# an API 401 would become an HTML 200. The default behaviour's copy skips /api/
# internally, but a function attached HERE would have no such guard.
chk "$API_PATH_PATTERN has no function attached" \
  "$(aws cloudfront get-distribution-config --id "$DIST_ID" \
    --query "DistributionConfig.CacheBehaviors.Items[?PathPattern=='${API_PATH_PATTERN}'].FunctionAssociations.Quantity | [0]" \
    --output text)" "0"
# Caching an authenticated API response at the edge would serve one user's data
# to another. Compare against distribution-config.json rather than a literal, so
# the policy id has exactly one home.
chk "$API_PATH_PATTERN caching is disabled" \
  "$(aws cloudfront get-distribution-config --id "$DIST_ID" \
    --query "DistributionConfig.CacheBehaviors.Items[?PathPattern=='${API_PATH_PATTERN}'].CachePolicyId | [0]" \
    --output text)" \
  "$(jq -r --arg p "$API_PATH_PATTERN" \
    '.DistributionConfig.CacheBehaviors.Items[] | select(.PathPattern == $p) | .CachePolicyId' \
    "$HERE/distribution-config.json")"

# (j) the LIVE function is the one in this repo.
# Rows (b) and (f) catch the two catastrophic edits, but a partial console edit —
# say, moving the extension test from the last segment to the whole URI — passes
# every other row while quietly changing routing. Compare the bytes.
echo "(j) edge function matches the repo"
if aws cloudfront get-function --name "$CF_FUNCTION_NAME" --stage LIVE \
  "$TMP/live.js" >/dev/null 2>&1; then
  if cmp -s "$TMP/live.js" "$HERE/cloudfront-function.js"; then
    echo "  ok   LIVE $CF_FUNCTION_NAME is byte-identical to cloudfront-function.js"
  else
    bad "LIVE $CF_FUNCTION_NAME differs from scripts/deploy/cloudfront-function.js (console edit?)"
  fi
else
  bad "could not read the LIVE stage of $CF_FUNCTION_NAME"
fi

echo ""
if [ "$fail" -eq 0 ]; then
  echo "all checks passed — https://$D"
else
  echo "VERIFICATION FAILED"
fi
exit "$fail"
