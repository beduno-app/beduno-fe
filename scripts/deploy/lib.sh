# shellcheck shell=bash
# Shared helpers. Sourced after config.sh.
# Targets bash 3.2 (the version macOS ships): no associative arrays, no mapfile.

die() {
  echo "error: $*" >&2
  exit 1
}

require_cmd() {
  for c in "$@"; do
    command -v "$c" >/dev/null 2>&1 || die "required command not found: $c"
  done
}

# Guard against deploying into the wrong account with a stray AWS_PROFILE.
assert_account() {
  local actual
  actual="$(aws sts get-caller-identity --query Account --output text)"
  [ "$actual" = "$AWS_ACCOUNT_ID" ] ||
    die "wrong AWS account: $actual != $AWS_ACCOUNT_ID (check AWS_PROFILE)"
}

# `aws ... --output text` prints the literal string "None" for an empty result
# and exits 0, so `set -e` will not catch it. Normalise that to an empty string
# or the caller ends up with DIST_ID=None and proceeds against nothing.
cf_text() {
  local out
  out="$("$@" --output text)"
  out="$(printf '%s' "$out" | tr -d '[:space:]')"
  [ "$out" = "None" ] && out=""
  printf '%s' "$out"
}

# Look the distribution up by its Comment. No state file to drift out of sync.
find_distribution_id() {
  local id
  id="$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='${CF_DISTRIBUTION_COMMENT}'].Id" \
    --output text)"
  id="$(printf '%s' "$id" | tr -d '\n' | sed 's/[[:space:]]\{1,\}/ /g; s/^ //; s/ $//')"
  [ "$id" = "None" ] && id=""
  case "$id" in
    *' '*) die "more than one distribution has Comment=${CF_DISTRIBUTION_COMMENT}: $id" ;;
  esac
  printf '%s' "$id"
}

distribution_domain() {
  aws cloudfront get-distribution --id "$1" \
    --query 'Distribution.DomainName' --output text
}
