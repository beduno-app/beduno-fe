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

# The origin id, the bucket domain and the CallerReference are NOT duplicated
# here — they live in distribution-config.json, which is the single source of
# truth for distribution shape. CallerReference is fixed on purpose: reusing it
# makes CloudFront return DistributionAlreadyExists, which is free server-side
# idempotency a timestamped value would throw away.

# AWS managed policies (IDs verified against this account).
CACHE_POLICY_OPTIMIZED="658327ea-f89d-4fab-a63d-7e88639e58f6"
RESPONSE_HEADERS_SECURITY="67f7725c-6f97-4210-82d7-5512b31e9d03"

# Cache-Control values. The split is carried by S3 object metadata, not by
# behaviour TTLs — CachingOptimized honours origin Cache-Control.
CC_IMMUTABLE="public,max-age=31536000,immutable"
CC_ICONS="public,max-age=604800"
CC_NEVER="no-cache"

# Unhashed files that must never be cached. Note this is a longer list than
# context/foundation/infrastructure.md step 4 gives: registerSW.js and
# manifest.webmanifest are also unhashed and referenced from index.html.
NEVER_CACHE_FILES="registerSW.js manifest.webmanifest sw.js index.html"

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
