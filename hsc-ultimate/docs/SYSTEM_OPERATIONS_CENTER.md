# Admin System Operations Center 2.0

**তারিখ:** ৪ আগস্ট ২০২৬  
**Status:** Real telemetry implementation complete; fake system metrics removed

## কেন পরিবর্তন করা হয়েছে

পুরোনো `GET /api/admin/system` hard-coded demo data ফেরত দিত:

- 1,250 users
- 45.2k API calls
- 15,400 questions
- বানানো user/action/time log
- XP ≥ 100,000-কে placeholder “threat” হিসেবে দেখানো

এসব live database-এর সঙ্গে সম্পর্কিত ছিল না এবং Admin-কে ভুল operational সিদ্ধান্ত দিতে পারত। Production API, components, tests ও libs থেকে ঐ fake strings/flow সম্পূর্ণ সরানো হয়েছে।

## Real operations API

```text
GET /api/admin/system
```

Security:

- Admin role বাধ্যতামূলক
- authenticated session বাধ্যতামূলক
- distributed/local Admin rate limit
- `Cache-Control: no-store`
- failure response generic
- URL, DB credential, token, private key, raw device token, audit metadata/IP ফেরত দেয় না

## Live data sources

### Database/content

- users ও banned users
- subjects/topics
- core MCQ, admission MCQ, CQ
- active Focus sessions/schedules
- native device count
- গত ২৪ ঘণ্টার failed native deliveries
- গত ২৪ ঘণ্টার audit event count

### Migration health

Prisma `_prisma_migrations` থেকে:

- applied count
- expected count
- parity
- latest migration name/time

Source baseline এখন **29 migrations**।

### Runtime

- app version
- Node version
- runtime environment
- process uptime
- heap used/total
- RSS memory
- memory percentage

### Components

- local/distributed rate limiter status/backend/circuit
- Focus scheduler mode/heartbeat/queue/config status
- native Firebase status/error state
- maintenance/announcement/feature-flag controls

### Audit activity

সর্বশেষ ১২টি real `AuditLog` event থেকে শুধু:

- actor display name বা System
- action
- target type
- timestamp
- visual severity

Metadata, actor email, IP ও target ID dashboard response-এ নেই।

## Deployment readiness

কোনো secret value না দেখিয়ে boolean checklist:

- core environment
- public HTTPS URL
- external Focus scheduler
- distributed rate limiter
- Firebase Admin
- production runtime
- public Privacy/Terms/account-deletion policy readiness

Local source workspace-এ external items false থাকা expected; এটি app health failure নয়। Public deployment-এর আগে checklist progress হিসেবে ব্যবহৃত হবে।

## Overall health derivation

| Condition | Result |
|---|---|
| Database down | `unhealthy` |
| Migration mismatch | `degraded` |
| Rate limiter degraded/misconfigured | `degraded` |
| External scheduler unhealthy | `degraded` |
| Firebase partial/runtime failure | `degraded` |
| Memory ≥ 90% | `degraded` |
| Optional Firebase unconfigured | health impact নেই |
| সব runtime component safe | `healthy` |

## Premium Admin UI

`/admin/system` এখন দুই অংশ:

1. **System Operations Center** — read-only real telemetry
2. **System Control** — Maintenance, Announcement, Feature Flags

Operations dashboard:

- overall health badge
- real users/question/curriculum/focus/audit metrics
- Database/migration card
- Rate limiter card
- Scheduler heartbeat card
- Native push card
- Deployment readiness checklist
- Runtime/memory progress
- Recent real audit activity
- ৩০ সেকেন্ড auto-refresh
- Admin-only verified Academic Content snapshot download
- premium Admin route loading state

## Live snapshot verification

Read-only live Supabase snapshot:

```text
Overall:              healthy
Database:             up
Migrations:            33/33
Users:                1
Banned users:         0
Subjects:             13
Topics:               185
Core MCQ:             688
Admission MCQ:        220
CQ:                   64
Active Focus:         0
Active schedules:     0
Native devices:       0
Native deliveries:    0
Real audit events:    610
Rate limiter:         local / memory
Scheduler:            LAZY_MODE / healthy
Native push:          unconfigured / optional
```

Local deployment readiness:

```text
Core environment:       ready
Public URL:              pending
External scheduler:     pending
Distributed limiter:    pending
Firebase Admin:          pending
Production runtime:      pending
Privacy/Terms routes:     ready
Current readiness:        2/7
```

System response/UI আরও দেখায় current Privacy/Terms/Age versions, exact current-version acceptance count এবং missing/stale user count; কোনো acceptance auto-backfill হয় না।

No database row was created, updated or deleted during this read-only snapshot.

## Unit coverage

Pure tests validate:

- local readiness without leaking URL/secret values
- fully configured production readiness
- healthy/degraded/unhealthy derivation
- optional unconfigured বনাম partial Firebase behavior
- real audit action severity classification

## Final verification

- TypeScript: 0 error
- ESLint: 0 warning
- Current unit tests: **106/106**
- Pure logic: 162/162
- Secret shape: 17/17
- Production dependency vulnerabilities: 0
- Current production build: compile + TypeScript + **181/181**, exit 0
- Preview/dev server: চালু করা হয়নি

## Relevant files

- `app/api/admin/system/route.ts`
- `app/admin/system/page.tsx`
- `app/admin/system/loading.tsx`
- `components/admin/system-operations-dashboard.tsx`
- `components/admin/system-control-panel.tsx`
- `lib/system-operations.ts`
- `tests/unit/system-operations.test.ts`
