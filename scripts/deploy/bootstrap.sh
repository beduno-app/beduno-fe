#!/usr/bin/env bash
#
# One-time infrastructure bootstrap for the Beduno SPA.
#
# Creates: S3 bucket (private) -> Origin Access Control -> CloudFront Function
# -> CloudFront distribution -> S3 bucket policy. Idempotent: every step checks
# for its resource first and reuses it.
#
# Creating the distribution and writing the bucket policy are human-approved
# actions per context/foundation/infrastructure.md ("Approval"). They live here,
# never in deploy.sh, so the routine deploy path cannot touch routing.
#
# Usage: scripts/deploy/bootstrap.sh [--dry-run] [--yes]

set -Eeuo pipefail
export AWS_PAGER=""
export AWS_DEFAULT_OUTPUT=json
trap 'echo "FAILED: ${BASH_SOURCE[0]}:${LINENO}" >&2' ERR

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
. "$HERE/config.sh"
# shellcheck source=lib.sh
. "$HERE/lib.sh"

DRY_RUN=0
ASSUME_YES=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --yes) ASSUME_YES=1 ;;
    *) die "unknown argument: $arg" ;;
  esac
done

require_cmd aws
assert_account

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Pre-flight the step 7 approval prompt. Step 5 can spend minutes retrying a
# CloudFront outage, which is long enough for a supervising harness to move this
# run into the background; stdin then stops being a TTY and the `read` at step 7
# fails on EOF, after the slow work is already done. Check reachability up front
# so a non-interactive run says so immediately instead of at minute three.
# Only matters when a distribution actually has to be created.
if [ "$DRY_RUN" -ne 1 ] && [ "$ASSUME_YES" -ne 1 ] && [ ! -t 0 ]; then
  # Assign, then test. `[ -z "$(find_distribution_id)" ]` would discard the
  # helper's exit status, so a throttled list-distributions would read as "no
  # distribution exists" and produce a confidently wrong diagnosis.
  preflight_dist="$(find_distribution_id)"
  if [ -z "$preflight_dist" ]; then
    die "stdin is not a terminal, so the approval prompt cannot be answered.
       Re-run in an interactive terminal, or pass --yes to record approval at
       invocation instead (the gated actions stay human decisions either way)."
  fi
fi

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "DRY-RUN: $*"
    return 0
  fi
  "$@"
}

# The human gate. Every action that changes live behaviour routes through this,
# not just distribution creation: publishing the function to LIVE changes edge
# routing, and replacing the bucket policy changes who can read the origin.
# --yes records approval at invocation (the only workable form when a supervising
# harness has taken stdin); a TTY gets the prompt; neither means abort rather
# than proceed. Callers must skip no-op changes BEFORE calling this, so a re-run
# that changes nothing never asks.
confirm_action() {
  local what="$1" reply
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "    DRY-RUN: would ask to $what"
    return 0
  fi
  if [ "$ASSUME_YES" -eq 1 ]; then
    echo "    approved at invocation (--yes): $what"
    return 0
  fi
  [ -t 0 ] || die "stdin is not a terminal, so '$what' cannot be approved.
       Re-run in an interactive terminal, or pass --yes."
  echo ""
  echo "    About to $what."
  echo "    Human-approved action (context/foundation/infrastructure.md, Approval)."
  printf "    Type 'yes' to continue: "
  read -r reply
  [ "$reply" = "yes" ] || die "aborted by user"
}

echo "==> account $AWS_ACCOUNT_ID, region $AWS_REGION"

# --- 1. S3 bucket -----------------------------------------------------------
echo "==> [1/8] bucket $S3_BUCKET"
# Branch on the exit code, not on the output. aws-cli >= 2.36 prints a JSON body
# (BucketArn/BucketRegion/AccessPointAlias) on success where older versions printed
# nothing, so an "empty output means OK" test reports a healthy bucket as an error.
# head-bucket gives no structured error, so 403-vs-404 still comes from the text.
head_rc=0
head_out="$(aws s3api head-bucket --bucket "$S3_BUCKET" 2>&1)" || head_rc=$?
if [ "$head_rc" -eq 0 ]; then
  echo "    exists and is ours, reusing"
elif echo "$head_out" | grep -q '403'; then
  die "bucket name $S3_BUCKET is owned by another account"
elif echo "$head_out" | grep -q '404'; then
  # BucketOwnerEnforced disables ACLs entirely — the modern default and a
  # prerequisite for a clean OAC-only access story.
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "    DRY-RUN: would create in $AWS_REGION"
  else
    aws s3api create-bucket \
      --bucket "$S3_BUCKET" \
      --region "$AWS_REGION" \
      --create-bucket-configuration "LocationConstraint=$AWS_REGION" \
      --object-ownership BucketOwnerEnforced >/dev/null
    echo "    created"
  fi
else
  die "unexpected head-bucket response: $head_out"
fi

# --- 2. Block all public access ---------------------------------------------
# PUT semantics, so re-running is harmless. Compatible with the OAC policy in
# step 8: that grants a service principal, not "*", so S3 does not call it public.
echo "==> [2/8] public access block"
run aws s3api put-public-access-block --bucket "$S3_BUCKET" \
  --public-access-block-configuration \
  'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'

# --- 3. Origin Access Control ------------------------------------------------
echo "==> [3/8] origin access control $CF_OAC_NAME"
OAC_ID="$(cf_text aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${CF_OAC_NAME}'].Id")"
if [ -n "$OAC_ID" ]; then
  echo "    exists: $OAC_ID"
elif [ "$DRY_RUN" -eq 1 ]; then
  OAC_ID="DRYRUN-OAC"
  echo "    DRY-RUN: would create"
else
  cat >"$TMP/oac.json" <<EOF
{
  "Name": "$CF_OAC_NAME",
  "Description": "OAC for the Beduno SPA S3 origin ($S3_BUCKET)",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}
EOF
  OAC_ID="$(aws cloudfront create-origin-access-control \
    --origin-access-control-config "file://$TMP/oac.json" \
    --query 'OriginAccessControl.Id' --output text)"
  echo "    created: $OAC_ID"
fi

# --- 4. CloudFront Function: create or update -------------------------------
echo "==> [4/8] function $CF_FUNCTION_NAME"
SRC="$HERE/cloudfront-function.js"
[ -f "$SRC" ] || die "missing $SRC"

FN_CFG="{\"Comment\":\"beduno SPA router: extension-less paths -> /index.html, /api/* untouched\",\"Runtime\":\"cloudfront-js-2.0\"}"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "    DRY-RUN: would create or update"
  ETAG="DRYRUN-ETAG"
elif aws cloudfront describe-function --name "$CF_FUNCTION_NAME" --stage DEVELOPMENT >/dev/null 2>&1; then
  ETAG="$(aws cloudfront describe-function --name "$CF_FUNCTION_NAME" --stage DEVELOPMENT \
    --query ETag --output text)"
  # update-function requires --if-match AND a re-supplied --function-config.
  ETAG="$(aws cloudfront update-function --name "$CF_FUNCTION_NAME" --if-match "$ETAG" \
    --function-config "$FN_CFG" --function-code "fileb://$SRC" \
    --query ETag --output text)"
  echo "    updated"
else
  ETAG="$(aws cloudfront create-function --name "$CF_FUNCTION_NAME" \
    --function-config "$FN_CFG" --function-code "fileb://$SRC" \
    --query ETag --output text)"
  echo "    created"
fi

# --- 5. Test the routing table before publishing ----------------------------
# The cheapest possible place to catch a rewrite regression: no distribution
# needs to exist yet. The /api/ case is the one that matters most - see the
# header comment in cloudfront-function.js.
#
# CloudFront's TestFunction API returns a retryable ServiceUnavailable
# independently of the rest of the CloudFront API (observed 2026-08-31, while
# describe-function was answering normally). Losing the edge-runtime check to an
# AWS outage must not mean publishing untested routing, so a persistent outage
# falls back to evaluating the same file against the same table under node. That
# proves the routing logic; it does not prove the edge runtime accepts the file,
# which create-function in step 4 already validated.
echo "==> [5/8] test-function"

# Rewrites $1 via the DEVELOPMENT stage, echoing the resulting uri.
# Exit 2 means the API was unavailable, as distinct from the function answering
# wrongly - the caller must not read that as a passing test.
aws_route() {
  local in="$1" out rc=0
  printf '{"version":"1.0","request":{"method":"GET","uri":"%s","querystring":{},"headers":{},"cookies":{}}}' \
    "$in" >"$TMP/ev.json"
  out="$(aws cloudfront test-function --name "$CF_FUNCTION_NAME" --if-match "$ETAG" \
    --stage DEVELOPMENT --event-object "fileb://$TMP/ev.json" \
    --query 'TestResult.FunctionOutput' --output text 2>"$TMP/err")" || rc=$?
  if [ "$rc" -ne 0 ]; then
    grep -qE 'ServiceUnavailable|InternalError|Throttling' "$TMP/err" && return 2
    cat "$TMP/err" >&2
    return 1
  fi
  printf '%s' "$out" | sed -nE 's/.*"uri":"([^"]*)".*/\1/p'
}

# The same contract, evaluated locally. cloudfront-js-2.0 is ES5.1-era JS, so
# plain node is a faithful interpreter for routing logic.
node_route() {
  node -e '
    var fs = require("fs")
    var src = fs.readFileSync(process.argv[1], "utf8")
    var handler = new Function(src + "\nreturn handler")()
    var out = handler({ version: "1.0", request: { method: "GET", uri: process.argv[2], querystring: {}, headers: {}, cookies: {} } })
    process.stdout.write(String(out.uri))
  ' "$SRC" "$1"
}

# Runs ROUTING_CASES through $1. Returns 1 on a wrong answer, 2 if the router
# itself was unavailable. Fed by heredoc, not a pipe, so $fail survives the loop.
run_table() {
  local router="$1" fail=0 in want got rc
  while IFS= read -r pair; do
    [ -n "$pair" ] || continue
    in="${pair%%|*}"
    want="${pair##*|}"
    rc=0
    got="$("$router" "$in")" || rc=$?
    [ "$rc" -eq 2 ] && return 2
    if [ "$got" = "$want" ]; then
      echo "    ok   $in -> $got"
    else
      echo "    FAIL $in -> '$got', expected '$want'"
      fail=1
    fi
  done <<EOT
$ROUTING_CASES
EOT
  return "$fail"
}

if [ "$DRY_RUN" -eq 1 ]; then
  echo "    DRY-RUN: skipped"
else
  attempt=1
  table_rc=0
  while [ "$attempt" -le 4 ]; do
    table_rc=0
    run_table aws_route || table_rc=$?
    [ "$table_rc" -ne 2 ] && break
    # Do not announce (or sleep through) a retry after the last attempt — that
    # burned a pointless minute on every run during the 2026-08-31 outage.
    if [ "$attempt" -eq 4 ]; then
      attempt=5
      break
    fi
    echo "    TestFunction unavailable (attempt $attempt/4), retrying in $((attempt * 15))s"
    sleep $((attempt * 15))
    attempt=$((attempt + 1))
  done

  if [ "$table_rc" -eq 2 ]; then
    require_cmd node
    echo "    CloudFront TestFunction still unavailable; evaluating locally instead"
    table_rc=0
    run_table node_route || table_rc=$?
    [ "$table_rc" -eq 0 ] || die "function routing tests failed; not publishing"
    echo ""
    echo "    NOTE: routing verified locally; the edge-runtime test was SKIPPED"
    echo "    because CloudFront TestFunction was unavailable. verify.sh row (f)"
    echo "    re-proves /api/* against the live distribution after deploy.sh."
  else
    [ "$table_rc" -eq 0 ] || die "function routing tests failed; not publishing"
  fi
fi

# --- 6. Publish --------------------------------------------------------------
echo "==> [6/8] publish-function"
if [ "$DRY_RUN" -eq 1 ]; then
  FN_ARN="arn:aws:cloudfront::${AWS_ACCOUNT_ID}:function/DRYRUN"
  echo "    DRY-RUN: skipped"
else
  # Publishing changes edge routing for every viewer, so it is gated — but only
  # when it would actually change something. Compare LIVE with the file we are
  # about to ship: a re-run for an unrelated reason must neither prompt nor
  # silently push whatever happens to be on the branch.
  fn_differs=1
  if aws cloudfront get-function --name "$CF_FUNCTION_NAME" --stage LIVE \
    "$TMP/live.js" >/dev/null 2>&1; then
    cmp -s "$TMP/live.js" "$SRC" && fn_differs=0
  fi

  if [ "$fn_differs" -eq 0 ]; then
    echo "    LIVE already matches cloudfront-function.js; not republishing"
    FN_ARN="$(cf_text aws cloudfront describe-function --name "$CF_FUNCTION_NAME" \
      --stage LIVE --query 'FunctionSummary.FunctionMetadata.FunctionARN')"
  else
    confirm_action "publish $CF_FUNCTION_NAME to LIVE, changing edge routing for all viewers"
    FN_ARN="$(aws cloudfront publish-function --name "$CF_FUNCTION_NAME" --if-match "$ETAG" \
      --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)"
    echo "    $FN_ARN"
  fi
fi

# --- 7. Distribution (HUMAN-APPROVED) ---------------------------------------
echo "==> [7/8] distribution (Comment=$CF_DISTRIBUTION_COMMENT)"
DIST_ID="$(find_distribution_id)"
if [ -n "$DIST_ID" ]; then
  echo "    exists: $DIST_ID"
else
  confirm_action "CREATE a CloudFront distribution"

  sed -e "s|__OAC_ID__|$OAC_ID|g" \
    -e "s|__FN_ARN__|$FN_ARN|g" \
    "$HERE/distribution-config.json" >"$TMP/dist.json"

  if [ "$DRY_RUN" -eq 1 ]; then
    # Not $TMP: the EXIT trap deletes it before the user can read this line.
    cp "$TMP/dist.json" ./distribution-config.rendered.json
    echo "    DRY-RUN: config rendered to ./distribution-config.rendered.json"
    DIST_ID="DRYRUN-DIST"
  else
    DIST_ID="$(aws cloudfront create-distribution-with-tags \
      --distribution-config-with-tags "file://$TMP/dist.json" \
      --query 'Distribution.Id' --output text)"
    echo "    created: $DIST_ID"
  fi
fi

# --- 8. Bucket policy --------------------------------------------------------
# Must come after the distribution: it references the distribution ARN. Note the
# CloudFront ARN has an EMPTY region field. PUT semantics, so idempotent.
echo "==> [8/8] bucket policy"
if [ "$DRY_RUN" -eq 1 ]; then
  echo "    DRY-RUN: skipped"
else
  cat >"$TMP/policy.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${S3_BUCKET}/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::${AWS_ACCOUNT_ID}:distribution/${DIST_ID}"
        }
      }
    }
  ]
}
EOF
  # s3:GetObject only — no ListBucket, so a missing key returns 403 rather than
  # leaking a listing. verify.sh asserts that 403.
  #
  # put-bucket-policy REPLACES the document wholesale, so an unprompted re-run
  # would drop any statement a human added by hand. Compare first (whitespace
  # normalised, since S3 does not return the document byte-for-byte as sent) and
  # only ask when the write would actually change something.
  policy_differs=1
  if current_policy="$(aws s3api get-bucket-policy --bucket "$S3_BUCKET" \
    --query Policy --output text 2>/dev/null)"; then
    want="$(tr -d ' \t\n' <"$TMP/policy.json")"
    have="$(printf '%s' "$current_policy" | tr -d ' \t\n')"
    [ "$want" = "$have" ] && policy_differs=0
  fi

  if [ "$policy_differs" -eq 0 ]; then
    echo "    already matches; not rewriting"
  else
    confirm_action "REPLACE the S3 bucket policy on $S3_BUCKET"
    aws s3api put-bucket-policy --bucket "$S3_BUCKET" --policy "file://$TMP/policy.json"
    echo "    applied"
  fi
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo ""
  echo "dry run complete — nothing was created."
  exit 0
fi

echo ""
echo "==> waiting for distribution $DIST_ID to deploy (5-15 min)..."
aws cloudfront wait distribution-deployed --id "$DIST_ID"

DOMAIN="$(distribution_domain "$DIST_ID")"
echo ""
echo "bootstrap complete."
echo "  distribution: $DIST_ID"
echo "  domain:       https://$DOMAIN"
echo ""
echo "next: scripts/deploy/deploy.sh"
