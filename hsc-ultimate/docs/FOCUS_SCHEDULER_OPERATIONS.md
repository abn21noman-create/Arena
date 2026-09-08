# Production Focus Scheduler Operations

**তারিখ:** ৪ আগস্ট ২০২৬  
**Status:** Code + database + local/live endpoint verification complete; external public scheduler activation deployment-এর পরে

## উদ্দেশ্য

Strict Focus schedule-এর lazy processor আগে থেকেই app/user/admin polling-এর সময় due session চালাতে পারত। কিন্তু app সম্পূর্ণ বন্ধ থাকলে নির্ধারিত সময়ে processor চালানোর জন্য প্রতি মিনিটের external scheduler দরকার। এই phase সেই production gap-এর code-side অংশ পূরণ করেছে এবং cron বন্ধ/বিফল/overlap হলে Admin ও health monitor-এ তা দৃশ্যমান করেছে।

## নতুন operational state

Migration:

```text
20260804030000_add_focus_scheduler_operations
```

নতুন bounded singleton table:

```text
focus_scheduler_state
```

প্রতি মিনিটে নতুন log row তৈরি না করে একই `global` row-এ রাখা হয়:

- last start/completion/success/failure heartbeat
- run source (`CRON` / `ADMIN`)
- duration
- reminder/due/processed/started/failed count
- safe error code
- consecutive failure
- total run ও overlap skip count
- current cross-instance lease/token expiry

ফলে বছরজুড়ে minute cron চললেও audit table অযথা কয়েক লাখ row বড় হবে না।

## Cross-instance overlap protection

Cron ও Admin manual run একই সময়ে এলে দুইটি worker যেন একই queue process না করে, তার জন্য database-backed lease আছে:

1. Runner random lease token তৈরি করে;
2. `leaseExpiresAt` expired/null হলেই atomic `updateMany` claim সফল হয়;
3. অন্য runner `202 SKIPPED_OVERLAP` পায়;
4. success/failure শেষে owner token মিলিয়ে lease release হয়;
5. crashed worker-এর lease default ১২০ সেকেন্ড পরে recoverable হয়।

Schedule-level row lock এবং unique active-session guard আগের মতো দ্বিতীয় স্তরের নিরাপত্তা দেয়।

## Hardened cron endpoint

```text
GET  /api/cron/focus-schedules
POST /api/cron/focus-schedules
Authorization: Bearer <CRON_SECRET>
```

নিরাপত্তা:

- `CRON_SECRET` না থাকলে 503;
- missing/wrong secret-এ 401;
- Authorization value SHA-256 digest-এর পরে constant-time compare;
- query-string secret গ্রহণ করা হয় না;
- response `Cache-Control: no-store`;
- response-এ user/session/schedule ID নেই, শুধু aggregate run metrics;
- execution failure persistent state-এ generic safe code হিসেবে থাকে।

## Scheduler modes

```env
FOCUS_SCHEDULER_MODE="lazy"      # local development
FOCUS_SCHEDULER_MODE="external"  # production
FOCUS_SCHEDULER_STALE_AFTER_SECONDS="180"
FOCUS_SCHEDULER_LEASE_SECONDS="120"
```

Explicit mode না থাকলে:

- development/test → `lazy`
- `NODE_ENV=production` → `external`

Production-এ secret/heartbeat না থাকলে health silently green থাকে না।

## Health states

| State | অর্থ |
|---|---|
| `LAZY_MODE` | Local/dev; polling fallback intentional |
| `AWAITING_FIRST_RUN` | External mode configured, heartbeat এখনো আসেনি |
| `HEALTHY` | Recent successful heartbeat |
| `DEGRADED` | Heartbeat expected interval-এর তুলনায় দেরি |
| `STALE` | Configured stale threshold পার হয়েছে |
| `FAILING` | Recent run failed / consecutive failure আছে |
| `RUNNING` | Valid lease-সহ run এখন চলছে |
| `MISCONFIGURED` | invalid mode/threshold/lease বা missing secret |

`GET /api/health` user/session detail ছাড়া scheduler status, heartbeat age, active queue এবং due count দেখায়। External mode unhealthy হলে overall health `degraded` হয়। Lazy mode local development-এ healthy।

## Admin Operations UI

`/admin/focus`-এ নতুন **Scheduler Operations** card:

- current mode ও secret readiness
- heartbeat freshness
- active/due/next-24h queue
- last run source/status/duration
- last started/reminder/failure counts
- total runs, overlap skip, consecutive failures
- warning/misconfiguration reason
- manual **Run now**
- ৩০ সেকেন্ড auto-refresh

Admin manual run audit action:

```text
FOCUS_SCHEDULER_MANUAL_RUN
```

## External deployment options

### ১. Supabase Cron — recommended free-compatible path

Project ইতিমধ্যে Supabase PostgreSQL ব্যবহার করে। Public app URL তৈরি হওয়ার পরে template:

```text
deploy/supabase-focus-cron.sql.example
```

এটি `pg_cron` + `pg_net` দিয়ে প্রতি মিনিটে endpoint POST করার template। Public URL এবং `CRON_SECRET` Supabase Vault-এ encrypted secret হিসেবে রাখে; checked-in SQL cron command-এ plaintext secret থাকে না।

Activation এখন করা হয়নি, কারণ public deployment URL এখনো নেই।

### ২. Vercel Cron — Pro/Enterprise template

```text
deploy/vercel-pro-cron.json.example
```

Vercel project-এ `CRON_SECRET` বসালে Vercel invocation-এ Bearer Authorization header পাঠায়। তবে Vercel Hobby cron বর্তমানে দিনে একবারের বেশি চালাতে দেয় না; minute schedule deploy করতে Pro/Enterprise plan দরকার। তাই minute config root `vercel.json` হিসেবে জোর করে যোগ করা হয়নি।

### ৩. অন্য scheduler

যে provider প্রতি মিনিটে HTTPS request ও custom Authorization header পাঠাতে পারে, সে একই endpoint ব্যবহার করতে পারবে। Secret URL/query parameter-এ না দিয়ে header-এ দিতে হবে।

## Lazy safety fallback

External heartbeat না থাকলেও নিচের app activity due schedule process করে:

- user Focus schedules poll
- user Focus session poll/start
- Admin Focus schedules poll

এটি app-open safety fallback; closed-app exact timing-এর বিকল্প নয়। Admin health card তাই external production heartbeat আলাদাভাবে monitor করে।

## Live verification

Migration:

```text
24/24 applied · database schema up to date
```

Cron route:

```text
No Authorization     → 401
Wrong Bearer         → 401
Forced active lease  → 202 SKIPPED_OVERLAP
Authorized GET       → 200 SUCCESS
Authorized POST      → 200 SUCCESS
```

Test run-এ queue empty ছিল:

```text
remindersSent: 0
dueCandidates: 0
processed: 0
sessionsStarted: 0
scheduleFailures: 0
leaseReleased: true
consecutiveFailures: 0
```

Local health integration:

```text
HTTP: 200
Database: up
Rate limiter: local
Focus scheduler: LAZY_MODE
Active/due schedules: 0/0
```

একই persisted heartbeat-কে temporary `external` mode-এ evaluate করে ১৮০ সেকেন্ড threshold পার হলে `STALE` + `healthy: false` পাওয়া গেছে; কোনো environment file পরিবর্তন করা হয়নি।

Unit tests cover recurrence, config defaults, missing/invalid config, lazy/awaiting/healthy/degraded/stale/running/failing states এবং cron authorization।

Final verification:

- TypeScript: 0 error
- ESLint: 0 warning
- Current web unit tests: **93/93**
- Pure logic: 162/162
- Secret shape: 17/17
- Production dependency vulnerabilities: 0
- Current production build: compile + TypeScript + **206/206**, exit 0
- Preview/dev server: চালু করা হয়নি

## Relevant files

- `prisma/schema.prisma`
- `prisma/migrations/20260804030000_add_focus_scheduler_operations/migration.sql`
- `lib/focus-scheduler-ops.ts`
- `lib/focus-schedule.ts`
- `lib/cron-auth.ts`
- `app/api/cron/focus-schedules/route.ts`
- `app/api/admin/focus/scheduler-health/route.ts`
- `app/api/health/route.ts`
- `components/admin/focus-scheduler-health.tsx`
- `app/admin/focus/page.tsx`
- `deploy/supabase-focus-cron.sql.example`
- `deploy/vercel-pro-cron.json.example`
- `tests/unit/focus-schedule.test.ts`
- `tests/unit/cron-auth.test.ts`
