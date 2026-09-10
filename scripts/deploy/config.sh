# shellcheck shell=bash
# Shared configuration for the Beduno SPA deployment.
# Sourced by bootstrap.sh, deploy.sh and verify.sh. Contains no secrets —
# every value here is a public identifier and is safe to commit.

AWS_ACCOUNT_ID="500060134341"
AWS_REGION="eu-central-1"

S3_BUCKET="beduno-fe-prod-500060134341"
# Regional endpoint on purpose: the global form (bucket.s3.amazonaws.com) causes
# 307 redirects that break signed OAC requests.
S3_ORIGIN_DOMAIN="${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com"

CF_OAC_NAME="beduno-fe-prod-s3-oac"
CF_FUNCTION_NAME="beduno-spa-router"

# The distribution lookup key. Machine-shaped (no spaces) because it is embedded
# in a JMESPath --query string. Human documentation lives in tags, so this never
# has to change. Must match "Comment" in distribution-config.json.
CF_DISTRIBUTION_COMMENT="beduno-fe-prod-spa"

# The origin id and the CallerReference are NOT duplicated here — they live in
# distribution-config.json, which is the single source of truth for distribution
# shape. CallerReference is fixed on purpose: reusing it makes CloudFront return
# DistributionAlreadyExists, which is free server-side idempotency a timestamped
# value would throw away. S3_ORIGIN_DOMAIN above IS a second copy of the origin's
# DomainName, deliberately: deploy.sh compares it against the live distribution
# so a bucket/distribution mismatch aborts before anything is uploaded.
#
# The cache-policy and response-headers-policy IDs are NOT mirrored here. They
# are literals in distribution-config.json, and a copy in this file would be pure
# drift bait: editing it would look like it changed the distribution while
# changing nothing at all.

# Cache-Control values. The split is carried by S3 object metadata, not by
# behaviour TTLs — CachingOptimized honours origin Cache-Control.
CC_IMMUTABLE="public,max-age=31536000,immutable"
CC_ICONS="public,max-age=604800"
CC_NEVER="no-cache"

# Unhashed files that must never be cached. Note this is a longer list than
# context/foundation/infrastructure.md step 4 gives: registerSW.js and
# manifest.webmanifest are also unhashed and referenced from index.html.
#
# ORDER IS LOAD-BEARING: deploy.sh pass 3 uploads these in sequence, and sw.js
# MUST be last. sw.js is the precache manifest and it pins index.html by content
# revision. Ship sw.js first and a phone that opens the app in the gap fetches
# the new sw.js, precaches index.html with cache:'reload' (workbox-precaching
# PrecacheController.js), receives the OLD index.html because the new one is not
# up yet, and stores it under the NEW revision key. The revision then matches, so
# it never re-fetches: that phone serves stale HTML from precache on every
# navigation until a later deploy changes the manifest again — and with --prune
# the old chunks it references are gone, so the app is blank. This is the exact
# 6am failure in prd.md:153. The reverse gap (new index.html, old sw.js) is a
# transient downgrade that self-heals on the next open.
NEVER_CACHE_FILES="registerSW.js manifest.webmanifest index.html sw.js"

# Icons are unhashed but workbox revisions them in the precache manifest, so only
# the browser's direct <link rel=icon> fetch is uncovered.
ICON_FILES="favicon.ico pwa-192.svg pwa-512.svg"

# 8 paths per deploy against the free 1000/month ~= 125 free deploys/month.
INVALIDATION_PATHS="/ /index.html /sw.js /registerSW.js /manifest.webmanifest /favicon.ico /pwa-192.svg /pwa-512.svg"

# Routing assertions for cloudfront-function.js, as "<request uri>|<expected uri>"
# pairs. bootstrap.sh step 5 runs these against CloudFront's TestFunction API
# before publishing and, when that API is unavailable, against a local node
# evaluation of the same file. One table so the two can never drift apart.
# The two /api rows are the load-bearing ones — see cloudfront-function.js.
ROUTING_CASES="/ops/arrivals|/index.html
/|/index.html
/ops/|/index.html
/workers/42/badge|/index.html
/assets/index-abc123.js|/assets/index-abc123.js
/sw.js|/sw.js
/manifest.webmanifest|/manifest.webmanifest
/api/v1/auth/login|/api/v1/auth/login
/api|/api"

# --- API origin ---------------------------------------------------------------
# The SPA calls its API same-origin (axios baseURL defaults to /api/v1), so
# CloudFront routes api/* to the beduno-be backend instead of to S3. Same-origin
# is the security posture, not an accident: it is why the backend's
# CORS_ALLOWED_ORIGINS can stay empty, which is what stops any third-party site
# making credentialed calls to the API. Do not "fix" a CORS error by opening that
# allowlist — a CORS error here means this behaviour is missing or misrouted.
#
# A DuckDNS hostname, not the instance IP: the box is stopped when idle to keep
# it at ~$2.6/month, and a stop changes its public IP. beduno-be's boot.sh
# repoints the DNS record on the way back up, so the origin stays valid by name.
# The authoritative value is SSM /beduno/prod/DUCKDNS_DOMAIN in the backend
# account; this is a public hostname and safe to commit.
#
# Duplicated from distribution-config.json for the same reason S3_ORIGIN_DOMAIN
# is: deploy.sh and verify.sh compare it against the live distribution, so a
# mismatch aborts instead of deploying against the wrong backend.
API_ORIGIN_DOMAIN="beduno.duckdns.org"
API_ORIGIN_ID="api-beduno"

# No leading slash, matching "assets/*" above it. CloudFront treats "api/*" and
# "/api/*" identically; consistency within the file is the only reason to pick.
API_PATH_PATTERN="api/*"
