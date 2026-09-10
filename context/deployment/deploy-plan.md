---
project: Beduno
planned_at: 2026-08-30
deployed_at: 2026-09-09
platform: AWS
scope: spa + api origin
api_connected_at: 2026-09-10
api_origin: https://beduno.duckdns.org
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

> **Resolved 2026-09-10.** The two blockers above were answered outside this plan: `beduno-be`
> runs on a single EC2 instance behind Caddy (Postgres in a container alongside it, not RDS),
> reached by a DuckDNS hostname, at roughly $2.6/month rather than the $50–55 an ALB + Fargate
> + RDS path implied. That made the `/api/*` behaviour affordable, and it is now live — see
> "API origin — 2026-09-10" below. The paragraph above is kept as the record of what the
> spa-only checkpoint deliberately was.

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
3. ~~Add the `/api/*` cache behaviour~~ — done 2026-09-10, see below.
4. Move `deploy.sh` into GitHub Actions behind an OIDC role and retire the IAM user key.

## API origin — 2026-09-10

The SPA now reaches its API. `beduno-be` went live at `https://beduno.duckdns.org` (EC2
`i-0f55c17cf69cb20c8`, Caddy + Let's Encrypt), which unblocked step 3 above.

| Piece | Value |
| --- | --- |
| Origin id | `api-beduno` |
| Origin domain | `beduno.duckdns.org` (custom origin, `https-only`, TLSv1.2) |
| Path pattern | `api/*`, first in `CacheBehaviors` |
| Cache policy | `Managed-CachingDisabled` |
| Origin request policy | `Managed-AllViewerExceptHostHeader` |
| Methods | all seven |
| Function association | none |

Verified live after the change: `verify.sh` 23/23, a real API `401` arriving as a `401` on
`/api/v1/workers`, `api/*` carrying no function association, `CachingDisabled` confirmed, and
a real browser login returning `200` with `x-cache: Miss from cloudfront`.

Applied through `bootstrap.sh` step 9, which is human-gated like steps 6–8 and idempotent: it
keys on the behaviour rather than the origin (a half-applied run can leave an orphan origin),
and refuses rather than reporting success if `api/*` already routes somewhere other than the
configured domain.

### Why same-origin rather than CORS

The backend's `CORS_ALLOWED_ORIGINS` is empty, and `WebConfig` registers no CORS mapping at
all when the list is empty — so every cross-origin request is rejected. That is the desired
posture and routing `api/*` through CloudFront is what preserves it. **A CORS error against
this API means this behaviour is missing or misrouted; it is never a reason to open the
backend allowlist.**

### Four things that bit, or nearly did

1. **Host header.** `AllViewerExceptHostHeader` is required, not cosmetic. Caddy matches its
   site block on `{$SITE_ADDRESS}`; a forwarded viewer `Host` matches no block and Caddy
   answers 404. (TLS is fine either way — CloudFront uses the origin domain for the
   handshake.)
2. **Methods.** The default behaviour is GET/HEAD only, so a login `POST` returned a
   CloudFront HTML error page before this landed.
3. **`deploy.sh` read `Origins.Items[0]`.** A second origin made every future deploy hostage
   to list order. Now searched by domain, and the default behaviour's target is asserted too.

   This one was nearly missed. The reasoning that it was safe — "the origin is appended, so
   index 0 stays the bucket" — is wrong: **CloudFront returns origins sorted by `Id`**, and
   `api-beduno` sorts before `s3-beduno-fe-prod`. Measured against the live distribution
   immediately after the behaviour landed, `Items[0].DomainName` is `beduno.duckdns.org`, so
   the old check would have aborted every subsequent deploy with a message blaming the wrong
   origin. Append-versus-prepend was never the variable. **Treat any index into a CloudFront
   origins array as unsafe, however the entry was added.**
4. **`verify.sh` hard-asserted `/api/*` is 403.** True only while there was no API origin. It
   now asserts the dangerous shape — a 200 carrying HTML, or the SPA shell — because that is
   the only thing `useApi.ts` can be fooled by. The instance is stopped when idle and a
   stopped origin gives a CloudFront 502 with an HTML error page; that warns instead of
   failing, while an S3 fall-through (XML `AccessDenied`) still fails hard.

### Auth through the CDN — verified 2026-09-10

`RateLimitFilter` throttles the `/api/v1/auth/` prefix at 10 requests/minute keyed on
`getRemoteAddr()`. With CloudFront in front, Tomcat's `RemoteIpValve` resolved the right-most
untrusted hop — the CloudFront edge — so **every visitor through the CDN shared one throttle
bucket**, and the SPA's own token refreshes spent it during ordinary use. A handful of
concurrent users would have locked each other out.

Fixed backend-side: Caddy now trusts CloudFront's origin-facing ranges, so `{client_ip}`
resolves the viewer, and `X-Forwarded-For` is overwritten with that single value rather than
appended.

Verified by the `beduno-be` session with a test whose signal is binary: exhaust the throttle
through CloudFront, then immediately call the origin directly. Direct answered **429**, not
401 — the two paths therefore resolve to the same key. Had it still been edge-keyed, the
direct caller's own bucket would have been untouched and answered 401. Not re-run from this
side: it would 429 a real user's next login for a minute to re-measure a settled result.

**Auth through the CDN is per-client and correct.**

### Backend fixes deployed alongside (image `c6ccc1a`)

Four faults found while wiring this up, all fixed backend-side and confirmed live from here:

| Was | Now |
| --- | --- |
| `workers?sort=lastName` → 500 | 200 |
| `stays?sort=dateFrom` → 500 | 200 |
| `/api/v1/audit` → 500 on *every* request | 200 |
| `GET` on POST-only login → 500 | 405 |
| 401 declared `charset=ISO-8859-1` | `charset=UTF-8` |
| column names (`last_name`) silently accepted | 400 `error.sort.unsupported_field` |

The sort bug: list endpoints are backed by native queries, and Spring Data appends a
`Pageable`'s sort straight into the SQL, so the field name had to already *be* a column.
`lastName` folded to `lastname` and failed as an unknown column. **The contract is camelCase
API field names — never column names.** Do not "fix" a sort 500 by sending snake_case; that
now returns 400 by design.

The audit endpoint had never worked in production and no test had ever called it.

### Open — Room contract divergence

The two repos were built against specs that disagree on `Room`, in three places:

| Field | `docs/should-be/` + SPA | Backend (before fix) |
| --- | --- | --- |
| identifier | `roomNumber` | `name` |
| `floor` | `number` | `String` |
| gender rule | `MALE_ONLY \| FEMALE_ONLY \| MIXED` | `ANY \| MALE_ONLY \| FEMALE_ONLY` |

`currentOccupancy` and `occupants[]` are typed and rendered by the SPA but absent from the
backend entirely.

Resolved in the SPA's favour: **the backend adopts `docs/should-be/` wholesale**, so the spec
stands as written and the SPA needs no change. That work needs a Flyway migration and real
occupancy queries, and is not yet deployed. When `RoomResponse` changes shape the two sides
land in step — `beduno-be` messages before deploying, not after.

Note for that migration: the SPA **sends** `floor` as a number on room create and update
(`RoomManagement.vue:154` uses `v-model.number`), so both shapes must be accepted during the
transition or room creation breaks in the window between the two deploys.
