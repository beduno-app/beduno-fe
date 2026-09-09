---
project: Beduno
planned_at: 2026-08-30
deployed_at: 2026-09-09
platform: AWS
scope: spa-only
distribution_id: E2RRGGPKJTC86F
domain: https://d3c7tvg5e5bxr3.cloudfront.net
aws_account: "500060134341"
aws_region: eu-central-1
source: context/foundation/infrastructure.md
---

# Deploy Plan — Beduno SPA (first deployment)

The audit trail for what the first production deployment was *supposed* to do, per the
Module 1 Lesson 5 chain. The platform decision itself lives in
`context/foundation/infrastructure.md`; this file records how it was executed and what was
deliberately left undone.

## Scope: SPA only

The frontend ships to S3 + CloudFront. **`beduno-be` is not deployed.** Two reasons, both
discovered during pre-flight and neither anticipated by the research:

1. **The API has a hard Postgres dependency the research scoped out.** `beduno-be` is Spring
   Boot 3.4.4 on Gradle (the research said Maven — corrected) with
   `spring-boot-starter-data-jpa`, `runtimeOnly(postgresql)`, Flyway migrations and
   `ddl-auto: validate`. `application-prod.yml` requires `DATABASE_URL`, `DATABASE_USERNAME`
   and `DATABASE_PASSWORD`. Without a database the container cannot pass `/actuator/health`,
   so ECS Express Mode would never go healthy — yet `infrastructure.md` lists the database
   under "Out of Scope". Deploying the API means planning RDS first.
2. **Cost.** The account carries budgets of $5/mo and $1/mo (zero-spend). The API path's floor
   is ALB ~$20 + Fargate ~$18 + RDS ~$15 ≈ $50–55/mo — 10x the existing budget. The SPA alone
   is ≈$0 on CloudFront's permanent free tier.

**Consequence: the deployed SPA cannot log in.** There is no `/api/*` origin, so the axios
default (`/api/v1`, same-origin) returns 403. This is a deliberate, reversible checkpoint — a
static-shell smoke test, not a usable product.

## What was provisioned

Provisioned 2026-08-31 (bucket, OAC, function) and completed 2026-09-09 (function published,
distribution, bucket policy). All identifiers below are live.

| Resource | Identifier |
| --- | --- |
| S3 bucket | `beduno-fe-prod-500060134341` (private, ACLs disabled, all public access blocked) |
| Origin Access Control | `beduno-fe-prod-s3-oac` = `EP4DJMDOP6EAR` (sigv4, always) |
| CloudFront Function | `beduno-spa-router` (`cloudfront-js-2.0`, viewer-request) |
| Distribution | `E2RRGGPKJTC86F` → `d3c7tvg5e5bxr3.cloudfront.net` (looked up by `Comment == beduno-fe-prod-spa`) |
| Cache policy | `Managed-CachingOptimized` `658327ea-f89d-4fab-a63d-7e88639e58f6` |
| Response headers | `Managed-SecurityHeadersPolicy` `67f7725c-6f97-4210-82d7-5512b31e9d03` |
| Price class | `PriceClass_100` (covers Poland; cheapest) |

No IAM role or policy was created. The one policy is an S3 resource policy granting
`s3:GetObject` to `cloudfront.amazonaws.com`, conditioned on `AWS:SourceArn`. This keeps the
deployment clear of `infrastructure.md`'s human-only IAM boundary.

Both existing budgets were left untouched. Expect **`My Zero-Spend Budget` ($1) to fire** —
S3 storage plus ~80 PUTs per deploy is sub-cent but non-zero. That is the budget working.

## The two rules the design exists to protect

**1. Nothing may turn an error into an HTML 200.** `src/shared/composables/useApi.ts` gates its
entire token-refresh path on `error.response?.status !== 401`. Two separate mechanisms can
break it, and both are guarded:

- CloudFront **custom error responses** (the usual 403/404 → `/index.html 200` SPA recipe) are
  never configured. The distribution is created with `CustomErrorResponses: {"Quantity": 0}`
  explicitly, and `verify.sh` asserts it stays 0.
- The **CloudFront Function** skips `/api/*` before any extension test. Without that line
  `/api/v1/stays` (no dot) would be rewritten to `/index.html` — the identical failure, one
  layer down. `bootstrap.sh` proves this with `test-function` *before publishing*, and
  `verify.sh` row (f) proves it against the live distribution.

**2. Unhashed files must never be cached.** The research named two (`index.html`, `sw.js`);
there are four — `registerSW.js` and `manifest.webmanifest` are also unhashed and referenced
from `index.html`. `workbox-<hash>.js` is at the root but content-addressed and caches
immutably. Icons get 7 days rather than `immutable`, because workbox already revisions them in
the precache manifest and only the browser's direct `<link rel=icon>` fetch is uncovered.

Uploads run in three passes with **`sw.js` genuinely last** — corrected 2026-09-09; it was
`index.html` last, which is the wrong invariant. `sw.js` is the precache manifest and pins
`index.html` by content revision, so shipping it first lets a phone precache the *old* HTML
under the *new* revision key and serve it from precache indefinitely. Assets go up in pass 1,
so `index.html` is never the file at risk. `--delete` is opt-in (`--prune`): with
`registerType: 'autoUpdate'` a phone can hold an old `index.html` mid-deploy, and deleting its
hashed assets 404s the precache fetch.

## Operational contract

| Action | Who | Where |
| --- | --- | --- |
| Build, upload, invalidate, verify | agent-safe | `deploy.sh`, `verify.sh` |
| Create distribution, write bucket policy, change routing | **human** | `bootstrap.sh` |

`deploy.sh` deliberately never touches the CloudFront Function, the distribution config or the
bucket policy — matching the approval policy in `infrastructure.md`.

Rollback is re-running `deploy.sh` from an earlier commit: the artifact is immutable and the
invalidation is seconds. Nothing here rolls back a database migration, because nothing here has
a database.

## First deployment record — 2026-09-09

`bootstrap.sh` → `deploy.sh` → `verify.sh` completed; **all assertions pass** against
`https://d3c7tvg5e5bxr3.cloudfront.net`, including the two the design exists to protect:
`/api/v1/auth/login` returns a real 403 (`application/xml`, not HTML), and
`CustomErrorResponses.Quantity` is 0.

Three defects surfaced during the run, all in the scripts rather than in the design:

1. **`head-bucket` detection (`bootstrap.sh` step 1).** The step read success as "empty
   output"; aws-cli ≥ 2.36 prints a JSON body (`BucketArn`/`BucketRegion`/
   `AccessPointAlias`) on success, so a healthy bucket fell through to the catch-all
   `die`. Now branches on the exit code; the text is consulted only to tell 403 from 404,
   which `head-bucket` does not expose structurally.

2. **The step 7 approval prompt is unreachable under a supervising harness.** CloudFront's
   `TestFunction` outage (still ongoing, first seen 2026-08-31) makes step 5 spend ~150s in
   its retry backoff. That is long enough for a supervising harness to move the run into the
   background, at which point stdin is no longer a TTY and `read` fails on EOF — after the
   slow work is done and the function is already republished. A pre-flight now checks
   `[ -t 0 ]` before step 1 and fails in ~2s with the remedy (`--yes`, which records approval
   at invocation instead). Approval stays a human decision either way.

3. **`verify.sh` row (c) gave a false negative on compression.** It probed with `curl -sSI`
   (HEAD). CloudFront compresses while streaming a body, so a HEAD against a cold cache
   returns the object uncompressed — and a fresh deploy always hits that case, because the
   entry chunk's hash changes and is therefore always a cold miss. Confirmed by hand: a cold
   `GET` returns `content-encoding: br` on the same object the cold `HEAD` reported
   uncompressed. The row now uses `GET` with `-o /dev/null -D -`.

The edge-runtime function test remains **skipped** — `TestFunction` was unavailable across
both attempts, so routing was proven by evaluating `cloudfront-function.js` under node
against the same `ROUTING_CASES` table (9/9). `create-function` validated that the edge
runtime accepts the file, and `verify.sh` row (f) proves `/api/*` against the live
distribution. Re-run `bootstrap.sh` once the API recovers if you want the edge-runtime
check on record.

## Post-deploy review — 2026-09-09

A three-way review of the shipped scripts found five further defects, all fixed in this
branch. Two would have caused real production failures:

1. **`sw.js` was uploaded before `index.html`** (`config.sh` `NEVER_CACHE_FILES` order). The
   invariant recorded above was the wrong one. `sw.js` is the precache manifest and pins
   `index.html` by revision, so a phone opening the app in the ~1s gap fetches the new
   `sw.js`, precaches `index.html` with `cache:'reload'`, receives the **old** HTML, and
   stores it under the **new** revision key — after which the revision matches and it never
   re-fetches. That phone serves stale HTML from precache until a later deploy changes the
   manifest, and with `--prune` the chunks it references are gone, so the app is blank. This
   is the failure the whole cache-header design exists to prevent, and `verify.sh` cannot see
   it. `sw.js` now uploads last.

2. **`lib.sh` helpers swallowed AWS failures.** Bash does not inherit `set -e` into a command
   substitution, so `cf_text` and `find_distribution_id` — which pipe their `aws` output
   through `tr`/`sed` — kept only the last command's status. A throttled `list-distributions`
   returned an empty string and exit 0, which is indistinguishable from "the resource does not
   exist": `deploy.sh` would tell you to run `bootstrap.sh`, and `bootstrap.sh` would offer to
   create a distribution that already exists. Every `aws` call in `lib.sh` now states its own
   failure. Note the fix does not help `[ -z "$(helper)" ]`, which discards the status
   regardless — that shape was removed from `bootstrap.sh`'s pre-flight.

3. **The human gate covered only distribution creation.** `deploy-plan.md` and `CLAUDE.md`
   both claimed routing changes were human-approved, but a re-run published whatever
   `cloudfront-function.js` was on the branch to LIVE and replaced the bucket policy, both
   unprompted — as this file's own deployment record shows happening. All three actions now
   route through one `confirm_action` gate, and each is skipped outright when it would change
   nothing, so an unrelated re-run neither prompts nor pushes.

4. **`verify.sh`'s compression probe was case-sensitive.** `awk`'s `IGNORECASE` is a gawk
   extension that macOS awk silently ignores; the row passed only because HTTP/2 lowercases
   header names. Proven over `--http1.1`, where CloudFront sends `Content-Encoding: br` and the
   old probe returned nothing. Now uses `tolower($1)`.

5. **Rows (e) and (f) accepted transport failures as passes.** Both asserted only `!= 200`, and
   `curl` yields `000` on a DNS/TLS/timeout failure — so the two rows the design exists to
   protect could report `ok` without the request ever reaching S3. Both now assert `403`
   explicitly, and (f) additionally rejects a `text/html` content-type.

Also fixed: `verify.sh` silently skipped the byte-identity and hashed-asset rows when `dist/`
was absent while still printing "all checks passed" (it now derives the asset path from the
live response and says so); the env-file guard missed `.env.production.local`, the
highest-priority file Vite loads in production and gitignored, so invisible in `git status`;
`deploy.sh`'s dirty-tree check used `git diff --quiet`, which ignores staged and untracked
changes; the invalidation waiter's 10-minute timeout sank an otherwise-successful deploy and
skipped verification; and a new `verify.sh` row (j) compares the LIVE function byte-for-byte
against `cloudfront-function.js`, which catches a partial console edit that every other row
would pass.

## Known gaps

- **The routing function's extension test looks at the last URI segment**, so a route whose
  FINAL segment carries a dot would 403 instead of loading the SPA. `/workers/:id`,
  `/properties/:id` and `/stays/:id` all end in their parameter. Safe today because those ids
  are UUIDs; a dotted id would need a route-aware allowlist, not a longer extension list.

- **No CI deploy.** Deploys are manual by decision this round. The scripts are written to become
  the body of a GitHub Actions job with an OIDC role; credentials today are a long-lived IAM
  user access key (`dawid`), which `infrastructure.md` explicitly recommends against for CI.
- **No custom domain or ACM certificate** — the distribution serves its `*.cloudfront.net` name.
- **No CloudFront access logging.**
- **`s3 sync` compares size + mtime only**, so `deploy.sh` does `rm -rf dist` before building. A
  cache-header change with `--skip-build` will not re-upload; use `--invalidate-all` and a full
  rebuild.

## Next steps

1. Decide the API's database shape (RDS instance class, or a cheaper Postgres) — this is the
   real blocker, not the ECS work.
2. Raise the monthly budget to match before any API deploy, or the $5 alarm becomes noise.
3. Add the `/api/*` cache behaviour: `CachingDisabled`, `AllViewerExceptHostHeader`, all seven
   methods, **no function attached**.
4. Move `deploy.sh` into GitHub Actions behind an OIDC role and retire the IAM user key.
