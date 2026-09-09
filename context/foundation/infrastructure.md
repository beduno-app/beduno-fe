---
project: Beduno
researched_at: 2026-08-26
recommended_platform: AWS (S3 + CloudFront for the SPA, ECS Express Mode on Fargate for the JVM API)
runner_up: Railway
context_type: mvp
tech_stack:
  language: TypeScript 5.7 (strict)
  framework: Vue 3.5 SPA (vue-router, Pinia, vue-i18n) built by Vite 6.2
  runtime: static build artifact (dist/) in the browser; separate JVM/Gradle API in beduno-be
---

## Recommendation

**Deploy on AWS.** The SPA ships to S3 behind a CloudFront distribution; the `beduno-be`
JVM API runs as an Amazon ECS Express Mode service on Fargate. CloudFront fronts both
with path-based behaviours, so `/api/*` reaches the API and everything else falls back
to the SPA — reproducing today's `nginx.conf` semantics on a single origin domain with
no CORS surface.

Three interview answers drove this over two platforms that scored higher on the raw
criteria. The co-location requirement is a hard filter: `beduno-be` is JVM/Maven, and
Cloudflare, Vercel and Netlify have no JVM runtime, which removes three of this skill's
six default candidates before scoring begins. Among the survivors, an AWS Solutions
Architect Associate certification plus $120 in credits is decisive — the operator's
ability to debug the platform outweighs the platform's lower need for debugging.
ECS Express Mode was chosen over the cheaper Lightsail Containers shape (~$15/mo)
because Lightsail cannot reach a VPC-private database, and the PRD has not yet decided
`beduno-be`'s data layer; the cheaper option would have forced a re-platform mid-pilot.

## Platform Comparison

Two filters ran before scoring.

**Persistent connections — dropped nothing.** The PRD is silent on realtime, and the
code confirms it: zero matches for WebSocket, EventSource, socket.io, STOMP or SSE
across `src/` and `e2e/`. Reconnect detection is client-side only
(`window.addEventListener('online')` in `src/shared/layouts/OpsLayout.vue:69`;
`navigator.onLine` in `sync.store.ts:65`, `arrivals.store.ts:71`, `inhouse.store.ts:48`).
The only recurring traffic is browser-side `setInterval` polling in
`src/modules/arrivals/views/ArrivalsToday.vue:134`. No always-on process is required of
the host.

**Co-location — dropped three candidates.** The SPA and the JVM API must share a
platform. Cloudflare Workers/Pages, Vercel and Netlify cannot run a JVM.

| Platform | CLI-first | Managed/Serverless | Agent-readable docs | Stable deploy API | MCP / integration | Weighted |
|---|---|---|---|---|---|---|
| **AWS** | Pass | Partial | Pass | Pass | Pass | **4.5** |
| Railway | Pass | Pass | Pass | Pass | Pass | 5.0 |
| Fly.io | Pass | Pass | Pass | Pass | Pass | 5.0 |
| Render | Partial | Pass | Pass | Pass | Partial | 4.0 |
| Cloudflare | — | — | — | — | — | dropped: no JVM runtime |
| Vercel | — | — | — | — | — | dropped: no JVM runtime |
| Netlify | — | — | — | — | — | dropped: no JVM runtime |

**AWS — CLI Pass, Managed Partial.** Every operation has a documented non-interactive
command (`aws s3 sync`, `aws cloudfront create-invalidation`,
`aws ecs create-express-gateway-service`, `aws ecs monitor-express-gateway-service`).
Docs are markdown on GitHub under `awsdocs/`. The AWS MCP Server reached GA on
2026-05-06 as a managed remote server exposing all 15,000+ AWS APIs, alongside a
dedicated Amazon ECS MCP server — this is what lifts the fifth criterion to Pass, and
it would have been the weakest column a year ago. "Managed" is only Partial and the
score should not be read charitably: assembling S3, CloudFront, ECS, IAM and ECR is
materially more surface than a single `railway up`, and that surface is where the risk
register below comes from.

**Railway (runner-up) — 5.0.** Genuinely one platform and one deploy command for both
services, Dockerfile-native, MCP bundled into the CLI, roughly $10-15/mo for a web
service plus a worker. It loses only on credits and familiarity. If the AWS bill or the
IAM surface becomes a problem during the pilot, this is the migration target.

**Fly.io (third) — 5.0.** Cheapest at this scale: per-second billing with auto-suspend
on idle and no plan fee, so a low-qps pilot approaches zero when nobody is awake.
Strongest CLI of the three and an official MCP. Loses on the same two axes as Railway,
plus it is a fourth vendor to learn.

**Render — 4.0, not shortlisted.** $7/mo Starter is the cheapest always-on tier, but the
CLI covers less of the surface than the others and the MCP story is thinner.

### AWS options considered and rejected

- **App Runner — unavailable.** Closed to new customers as of **2026-04-30** and in
  maintenance mode with no new features planned. This is the obvious "simple containers
  on AWS" answer and it is no longer an option; AWS directs new customers to ECS Express
  Mode. Any recommendation sourced from training data rather than current docs gets this
  wrong.
- **Lightsail Containers — rejected on architecture, not cost.** $15/mo Small
  (0.5 vCPU / 1 GB) including a built-in HTTPS endpoint, load balancing across nodes,
  free managed certificates and 500 GB transfer. Roughly a third of the Express Mode
  bill. Rejected because container services sit outside your VPC with no IAM task roles,
  so a VPC-private Postgres for `beduno-be` would force a re-platform during the pilot.
  Note for the record: Lightsail's pricing page lists an `$18/mo` load balancer that does
  **not** apply to container services — that product is for Lightsail instances.
- **Amplify Hosting — rejected for the SPA.** Convenient Git-based deploys, but data
  transfer is billed from the first GB at $0.15/GB, where CloudFront's always-free tier
  covers 1 TB egress and 10M requests permanently. At this scale the SPA is effectively
  $0 on CloudFront and is not on Amplify.

## Anti-Bias Cross-Check: AWS

Run against the Lightsail shape first, then re-run against ECS Express Mode after the
platform shape changed. Findings from both are retained; resolved items are marked.

### Devil's Advocate — Weaknesses

1. **"Same platform" is only half-true.** Co-location delivers one bill and one IAM
   boundary, but two deployment mechanisms: `aws s3 sync` plus a CloudFront invalidation
   for the SPA, and `create-express-gateway-service` / task-definition updates for the
   API. Railway would be one command for both. Credits and familiarity are being bought
   with roughly double the deploy surface.
2. **The CloudFront SPA fallback will silently break auth refresh.** The standard
   S3+CloudFront recipe maps 403/404 to `/index.html` with status 200, and that rule is
   distribution-wide. The axios interceptor in `src/shared/composables/useApi.ts`
   refreshes once on a 401 and logs out when refresh fails. Behind that rule an API 401
   arrives as an HTML document with status 200: the interceptor never fires, the refresh
   queue never drains, and the user gets a parse error instead of a re-login. Use a
   CloudFront Function rewrite scoped to extension-less paths — never distribution-wide
   custom error responses.
3. **The service worker can pin front-desk phones to a stale build.**
   `vite-plugin-pwa` is configured `registerType: 'autoUpdate'` (`vite.config.ts:20`), so
   clients update silently — but only if they can see the new `sw.js`. If `sw.js` and
   `index.html` inherit a long CloudFront TTL, phones keep the old bundle indefinitely.
   That is the exact failure `prd.md:153` describes: "offline-broken at 6am, so staff
   route around it".
4. **Default sizing is 1 vCPU / 2 GB.** Roughly $36/mo Fargate compute plus $18-22 ALB,
   ≈ $55-60/mo before logs, ECR and IPv4. At that rate $120 in credits is about two
   months, not the eight the Lightsail shape would have bought. `--cpu 0.5 --memory 1`
   must be passed explicitly.
5. **The ALB is a fixed floor.** It bills identically at zero traffic and at a million
   requests. Express Mode's ALB-sharing saving applies only from the second service
   sharing the same networking config; with one API service you pay the whole ALB.
6. **The credits are a cliff, not a floor.** The free plan expires six months after
   signup or when credits are depleted, whichever comes first; credits expire twelve
   months from account opening. The decision must be one worth making at full price,
   because full price arrives during the pilot.
7. *(Resolved by the ECS Express choice)* Lightsail containers cannot reach a
   VPC-private database, which would have forced a re-platform when `beduno-be` gained
   Postgres.

### Pre-Mortem — How This Could Fail

It is February 2027. The pilot agency went live in October and the deployment has been
quietly wrong since week one. The team took the standard CloudFront SPA recipe from a
blog post — custom error responses mapping 403 and 404 to `index.html` — because it was
three clicks and it made client-side routing work. Nobody connected it to auth. Front
desk staff began reporting being "logged out into a blank screen" every few days, which
nobody could reproduce on desktop, because the admin app refreshes often enough to mask
it. The real cause was every API 401 arriving as an HTML 200 the refresh interceptor
could not recognise.

Meanwhile the first month's bill landed at $58 because nobody overrode the default
1 vCPU / 2 GB sizing, and the credits were gone by December. No billing alarm had been
set, so the January invoice was the notification. A second Express service was spun up
for staging and quietly doubled the Fargate line while the team assumed ALB sharing was
covering it.

None of these were AWS's fault. Each was a small convenience taken under time pressure
on a platform with enough surface area to permit it — which is the cost of choosing
assembly over a single deploy command.

### Unknown Unknowns

- **Express Mode is roughly two months old (GA June 2026).** It postdates most model
  training cutoffs. An agent's recall of it is weak and the CLI verb —
  `create-express-gateway-service` — is not guessable. Read the docs or use the ECS MCP
  server; do not trust recall, including this file's, without checking.
- **IAM roles are eventually consistent.** The first `create-express-gateway-service`
  call can fail with "Unable to assume the service linked role" immediately after role
  creation. Documented behaviour: wait about a minute and retry. An agent that treats
  this as a real failure will start "fixing" a deployment that was fine.
- **Custom task definitions have a strict contract.** The container must be named
  `Main`, must have a single TCP port mapping with a port *name*, and the task definition
  must list `FARGATE` in its compatibilities. Separately, `--task-definition-arn` cannot
  be combined with `--primary-container`, `--execution-role-arn`, `--task-role-arn`,
  `--cpu` or `--memory` in the same call — Express Mode derives those from the task
  definition.
- **A default VPC is required** unless you pass your own subnets. Express Mode creates an
  internet-facing ALB in the account's default VPC and public subnets; some accounts and
  regions have none.
- **Public IPv4 addresses bill separately** at roughly $3.60/mo each — a line item absent
  from most Fargate cost comparisons.
- **`nginx.conf` becomes dead code, and that is a hazard.** CloudFront's path behaviours
  replace both the SPA fallback and the `/api/` proxy. If `Dockerfile` and `nginx.conf`
  remain in the repo "just in case", there are two divergent routing definitions and no
  marker saying which is live. Someone will eventually fix a routing bug in the wrong
  file.

## Operational Story

- **Preview deploys**: no built-in PR previews on this shape. Deploy a branch build to a
  second S3 prefix and a second CloudFront distribution, or a second Express service —
  each additional always-on Express service adds Fargate cost, so prefer S3-prefix
  previews for SPA-only changes and reserve API previews for changes that touch
  `beduno-be`. Protect previews with a CloudFront Function checking a shared header;
  they are otherwise publicly reachable.
- **Secrets**: `VITE_API_BASE_URL` is build-time and ends up in the bundle — it is not a
  secret and must stay non-sensitive (it defaults to `/api/v1`, a same-origin path, which
  is correct here). Runtime secrets for `beduno-be` go in AWS Secrets Manager or SSM
  Parameter Store, referenced from the task definition and read via the task execution
  role — never as plaintext `--primary-container` environment entries, which are visible
  in `describe-express-gateway-service` output. Deploy credentials live in GitHub
  Actions secrets via an OIDC role, not long-lived access keys.
- **Rollback**: the SPA rolls back by re-syncing the previous `dist/` and invalidating
  CloudFront — seconds, and safe because the artifact is immutable. The API rolls back by
  updating the service to the previous task definition revision; Express Mode adds 5XX
  rollback alarms and canary deployments on updates, so a bad revision can auto-revert.
  Caveat: neither rolls back a database migration, and `beduno-be` owns its own schema —
  a rollback that crosses a migration is a manual, human operation.
- **Approval**: an agent may build, sync the SPA, invalidate CloudFront, update the API
  task definition, read logs and describe services unattended. Human-only: creating or
  deleting the CloudFront distribution, editing IAM roles or trust policies, rotating
  secrets, deleting the Express service, and any change to the CloudFront error-response
  or cache-behaviour configuration — that last one because getting it wrong breaks auth
  in a way that looks like an application bug (see weakness 2).
- **Logs**: `aws ecs monitor-express-gateway-service --service-arn <arn>` for deployment
  status, `aws ecs describe-express-gateway-service --service-arn <arn>` for current
  configuration, and `aws logs tail /ecs/<service-name> --follow` for runtime output.
  CloudFront access logs go to S3 and are queryable with Athena. All read-only; the ECS
  MCP server exposes the same surface as structured tools.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| CloudFront error-response rule turns API 401/403 into HTML 200, breaking the axios refresh interceptor | Devil's advocate | H | H | Use a CloudFront Function rewriting extension-less paths to `/index.html`. Never set distribution-wide custom error responses. Add an e2e assertion that an unauthenticated `/api/*` call returns a real 401. |
| CloudFront Function rewrites `/api/*` to `/index.html`, turning API 401s into HTML 200s — the same failure as the error-response rule, one layer down | Implementation 2026-08-30 | H | H | The SPA-routing function must skip `/api/*` before any extension test, mirroring `navigateFallbackDenylist` in `vite.config.ts`. Asserted by `bootstrap.sh` (`test-function`, pre-publish) and `verify.sh` row (f). |
| Stale `sw.js` pins front-desk phones to an old build, reproducing the 6am offline failure in `prd.md:153` | Devil's advocate | H | H | Set `Cache-Control: no-cache` on `sw.js` and `index.html` at upload; long `max-age, immutable` only on hashed Vite assets. Invalidate `/index.html` and `/sw.js` on every deploy. |
| First month bills ~$58 because default 1 vCPU / 2 GB sizing was not overridden | Pre-mortem | H | M | Pass `--cpu 0.5 --memory 1` on creation. Set an AWS Budgets alarm at $25/mo before the first deploy. |
| Credits deplete mid-pilot and the first full invoice is a surprise | Devil's advocate | M | M | Budget alarm plus a calendar reminder at the six-month mark. Confirm the decision holds at ~$40/mo unsubsidised. |
| `create-express-gateway-service` fails on IAM eventual consistency and an agent "fixes" a working deployment | Unknown unknowns | M | M | Documented: wait ~60s and retry the identical command before changing anything. |
| No default VPC in the target region, blocking the first deploy | Unknown unknowns | L | M | Pre-flight `aws ec2 describe-vpcs --filters Name=is-default,Values=true --region eu-central-1`; create one or pass explicit subnets. |
| Divergent routing between the retained `nginx.conf` and CloudFront behaviours | Unknown unknowns | M | M | Delete `Dockerfile` and `nginx.conf` when CloudFront goes live, or add a header comment naming CloudFront as authoritative. |
| Custom task definition rejected on the `Main` container / named-port contract | Unknown unknowns | M | L | Start with `--primary-container` and let Express Mode generate the task definition; adopt a custom one only once the service is running. |
| ALB fixed cost assumed to be shared when only one service exists | Pre-mortem | M | L | Treat the ALB as a flat ~$20/mo floor in any estimate. Sharing applies only from the second service with matching networking config. |
| Two deploy mechanisms drift; SPA and API ship from different pipelines | Devil's advocate | M | L | One GitHub Actions workflow with two jobs and a shared OIDC role; never deploy either surface by hand. |
| ECS Express Mode's youth means thin community troubleshooting material | Research finding | M | L | Prefer official docs and the ECS MCP server over blog posts and model recall. Record any workaround found in `context/foundation/lessons.md`. |

## Getting Started

Commands validated against the current AWS CLI surface and this repo's pinned versions
on 2026-08-26. Region assumed `eu-central-1` (Frankfurt) as the closest to Poland;
Express Mode is available in every region supporting ECS and Fargate.

1. **Pre-flight the VPC** (Express Mode needs a default VPC or explicit subnets):
   `aws ec2 describe-vpcs --filters Name=is-default,Values=true --region eu-central-1`

2. **Create the two IAM roles** Express Mode requires — `ecsTaskExecutionRole` with
   `AmazonECSTaskExecutionRolePolicy`, and `ecsInfrastructureRoleForExpressServices` with
   `AmazonECSInfrastructureRoleforExpressGatewayServices`. Trust policies are
   `ecs-tasks.amazonaws.com` and `ecs.amazonaws.com` respectively. Then wait ~60 seconds
   for propagation before step 3.

3. **Launch the JVM API**, sized down from the 1 vCPU / 2 GB default:
   `aws ecs create-express-gateway-service --service-name beduno-api --cpu 0.5 --memory 1 --health-check-path /actuator/health --primary-container '{"image":"<ecr-uri>:<tag>","containerPort":8080}' --execution-role-arn <exec-role-arn> --infrastructure-role-arn <infra-role-arn> --monitor-resources`
   Returns a URL shaped `https://beduno-api.ecs.eu-central-1.on.aws/` with SSL/TLS
   terminated automatically — no ACM certificate needed for the default hostname.

4. **Build and upload the SPA** with split cache headers. `npm run build` runs
   `vue-tsc --noEmit && vite build` and emits `dist/`. Upload hashed assets first with a
   long TTL, then the two files that must never be cached:
   **Corrected 2026-08-30 — the no-cache set is four files, not two.** The build also emits
   unhashed `registerSW.js` and `manifest.webmanifest` at the dist root, both referenced from
   `index.html`; `workbox-<hash>.js` also sits at the root but is content-addressed and caches
   immutably. Implemented in `scripts/deploy/deploy.sh` as three passes — hashed assets
   `immutable`, icons 7 days, then `registerSW.js`/`manifest.webmanifest`/`sw.js`/`index.html`
   `no-cache` with **`sw.js` last** (corrected 2026-09-09 — `sw.js` is the precache manifest
   and pins `index.html` by revision, so it must follow the file it pins). Getting this split
   wrong is risk row 2.

5. **Create the CloudFront distribution** with an S3 origin (via Origin Access Control)
   as the default behaviour and the Express service URL as a second origin bound to an
   `/api/*` behaviour with caching disabled and all headers forwarded. Attach a
   CloudFront Function on the default behaviour that rewrites extension-less request
   paths to `/index.html`. Do **not** configure custom error responses — that is risk
   row 1.
   **Amended 2026-09-09 — the second origin was deliberately not built.** The first
   deployment is SPA-only: `beduno-be` needs Postgres to pass `/actuator/health`, and
   RDS is still out of scope, so there is no Express service to point an origin at. The
   distribution ships with one origin and two behaviours (default and `assets/*`); see
   `context/deployment/deploy-plan.md`. Adding the `/api/*` behaviour —
   `CachingDisabled`, `AllViewerExceptHostHeader`, all seven methods, **no function
   attached** — is the first step of the API round. The consequence today is that the
   deployed SPA cannot log in.

6. **Invalidate on every deploy**:
   `aws cloudfront create-invalidation --distribution-id <id> --paths '/index.html' '/sw.js'`

7. **Set the budget alarm before traffic arrives** — an AWS Budgets monthly cost budget
   at $25 with an email notification, so the credit cliff cannot arrive unannounced.
   **Amended 2026-09-09 — not applied for the SPA-only round.** $25 was sized for the
   ECS + ALB + RDS shape. The account already carries a $5 monthly budget and a $1
   zero-spend budget, and the SPA alone is ≈$0 on CloudFront's permanent free tier, so
   both were left as they are. Expect the $1 budget to fire on the first deploy —
   storage plus ~80 PUTs is sub-cent but non-zero, and that is the budget working.
   Raise the ceiling to $25 as part of the API round, not before.

## Hints Recorded But Not Acted On

- `context/foundation/tech-stack.md` does not exist; this project ran the brownfield
  chain, so `stack-assessment.md` was read as the stack constraint instead.
- `beduno-be` (JVM/**Gradle**, not Maven — corrected 2026-08-30) lives in a separate
  repository. Its `/actuator/health` path and port 8080 were since **confirmed** against
  `beduno-be/docker/Dockerfile`. Image publication to ECR is still unbuilt.
- ~~The PRD records no data-layer decision for `beduno-be`.~~ **Corrected 2026-08-30:** the
  code does decide it. `beduno-be` is Spring Boot with `spring-boot-starter-data-jpa`,
  `runtimeOnly(postgresql)`, Flyway migrations and `ddl-auto: validate`; `application-prod.yml`
  requires `DATABASE_URL`/`DATABASE_USERNAME`/`DATABASE_PASSWORD`. Postgres is a hard
  dependency, so the API cannot pass its health check without a database. Keeping a
  VPC-private database open was therefore the right call — but RDS must be planned before
  any API deploy, and it is still out of scope below.
- `prd.md` Open Question 2 ("What is the pilot's date, scale and shape?") is unresolved.
  Sizing in step 3 is a floor for a single-agency pilot at `qps: low`, not a capacity
  plan.

## Out of Scope

The following were not evaluated in this research:
- Docker image configuration for `beduno-be` (this repo's `Dockerfile` is superseded by
  the CloudFront path; see the routing-drift risk row)
- CI/CD pipeline setup — the GitHub Actions deploy workflow named in the operational
  story is described, not authored
- Production-scale architecture (multi-region, HA, DR), explicitly a non-goal at
  `prd.md:525`
- Database and persistence platform for `beduno-be`
