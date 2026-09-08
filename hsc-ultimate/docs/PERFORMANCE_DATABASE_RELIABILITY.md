# Performance & Database Reliability Audit

**মূল phase:** ৪ আগস্ট ২০২৬ · **PolicyAcceptance FK regression audit:** ৫ আগস্ট ২০২৬  
**Status:** Live index/catalog audit, critical query plans, source query scan and additive fixes complete

## Scope

- Live Supabase PostgreSQL catalog
- Foreign-key reverse-index coverage
- Critical read/order/range indexes
- `pg_stat_statements` workload history
- PostgreSQL `EXPLAIN ANALYZE + BUFFERS`
- Prisma round-trip latency
- Static `findMany` boundedness audit
- Admin Analytics, Forum এবং Content Reports query shape

কোনো academic/user row update/delete করা হয়নি। শুধু additive index DDL migration apply হয়েছে।

## Database index audit

### Before

```text
Foreign keys:                80
Missing reverse FK indexes:  11
```

Missing relations:

- Bookmark → Topic
- Bookmark → Folder
- CQAttempt → CQQuestion
- ForumPost → User
- ForumReply → User
- NoteHelpfulVote → User
- QuizBattleParticipant → User
- QuizBattle → Subject
- QuizDuel → Subject
- TopicProgress → Topic
- UserBadge → Badge

Composite indexes যেমন `(userId, topicId)` reverse `topicId` lookup cover করে না, কারণ PostgreSQL B-tree index-এর leading column userId। Parent delete/cascade ও reverse join scale হলে scan/lock বাড়ত।

### Added reverse-FK indexes

Migration:

```text
20260804070000_add_reverse_fk_performance_indexes
```

Indexes added: **11**।

### Added critical query indexes

প্রমাণিত source query patterns:

- DAU/WAU/MAU → `users.lastActiveAt`
- Signup trend → `users.createdAt`
- Recent AuditLog → `audit_logs.createdAt DESC`
- User unread/recent notification feed
- User quiz/CQ/study time-window analytics

Migration:

```text
20260804080000_add_critical_query_performance_indexes
```

Indexes added: **7**।

### After

```text
Foreign-key coverage: 80/80
Critical indexes:     18/18
Missing:               0
Database migrations:  33/33
```

No existing index drop করা হয়নি।

## Critical query plans

Live `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`:

| Query | Index | DB execution |
|---|---|---:|
| Questions by topic | `questions_topicId_idx` | ~0.69 ms |
| Recent AuditLog | `audit_logs_createdAt_idx` | ~0.25 ms |
| Active-user 30-day count | tiny-table aggregate; index available | ~0.42 ms |

সব measured DB execution **50 ms budget-এর নিচে**। Tiny one-row users table-এ planner sequential aggregate বেছে নেওয়া স্বাভাবিক; `users_lastActiveAt_idx` scale-এর জন্য available।

## Cloud round-trip observation

Sandbox → Supabase query round-trip:

| Query | p50 | observed p95 |
|---|---:|---:|
| Questions by topic | ~478 ms | transient ~1437 ms |
| Recent Audit | ~480 ms | transient ~975 ms |
| Active users | ~496 ms | ~497 ms |

PostgreSQL execution sub-millisecond হলেও network/pool round-trip শত শত millisecond। অর্থাৎ এই environment-এ dominant cost query execution নয়—workspace থেকে remote Supabase region/pool connection।

Mitigation already used:

- independent queries `Promise.all`
- nested reads instead of N+1
- DB-side aggregation
- bounded pagination
- pooled datasource

Public deployment-এর পরে deployment region ও Supabase region কাছাকাছি রেখে real p50/p95 পুনরায় মাপতে হবে।

## Workload history observation

`pg_stat_statements` available। Highest total application statement:

```text
SELECT id FROM users WHERE id = $1 FOR UPDATE
```

Historical mean-এ lock-wait সময় অন্তর্ভুক্ত (~224 ms), মূল query CPU নয়। এটি XP/streak/focus/race safety transaction serialization-এর জন্য intentional row lock। Lock সরানো হয়নি; correctness performance-এর চেয়ে গুরুত্বপূর্ণ।

## Query-shape fixes

### Admin Analytics

Before:

```text
সব historical QuizAttempt row server process-এ এনে JS Map aggregation
```

After:

```text
PostgreSQL groupBy subjectId + _count + _sum(score,totalMarks)
```

ফলে data transfer historical attempt count-এর সঙ্গে unbounded বাড়বে না।

### Community Forum

Before:

- পুরো filtered ForumPost table
- প্রতিটি post-এর সব vote row transfer

After:

- ২০-item page
- total count
- DB-side vote `groupBy` only current page IDs
- Previous/Next UI
- existing `(isPinned, createdAt)` index used

### Admin Content Reports

Before:

- পুরো report table load
- client-side status sorting

After:

- ২০-item server pagination
- max page size ৫০
- count + page response
- Previous/Next UI

### Audit action dictionary

`findMany(distinct action)` replaced with PostgreSQL `groupBy(action)`; full AuditLog rows transfer হয় না।

## Static Prisma scan

AST-based scan:

```text
findMany calls:          234
Bounded:                  48
Intentional full reads:   40
Scoped unbounded:        131
Global unbounded:         13
Dynamic argument:          2
High-volume global risk:   0
```

Global unbounded samples এখন Subject/Badge/BroadcastTemplate-এর মতো bounded configuration/catalog tables। Full academic scans ও account data export explicitly intentional whitelist।

Scoped unbounded reads user-specific analytics/export-এর জন্য থাকতে পারে; production data growth-এর পরে query budget monitor করতে হবে।

## Reusable audit

```bash
npm run audit:performance
npm run audit:performance:strict
```

Strict blocker:

- missing reverse FK index
- missing critical index
- critical DB plan > 50 ms
- high-volume global unbounded `findMany`

Machine report:

```text
reports/performance-audit-2026-08-04.json
```

## Reliability notes

- Index DDL additive; table rows unchanged
- No index dropped based only on current `idx_scan=0`—new/small features often have valid future indexes
- `pg_stat_statements` cumulative history includes tests, migrations, lock waits and dashboard tooling
- Tiny current tables may correctly choose sequential scan despite index availability
- Synthetic high-concurrency production load test public staging URL ছাড়া করা হয়নি

## Final verification

- Database migrations: **33/33**
- Foreign-key reverse indexes: **80/80**
- Critical performance indexes: **18/18**
- Strict performance blockers: 0
- TypeScript: 0 error
- ESLint: 0 warning
- Web unit tests: **106/106**
- Performance helper tests: 5/5
- Pure logic: 162/162
- Production vulnerabilities: 0
- Production build: compile + TypeScript + **181/181**, exit 0
- Preview/dev server: off

## Relevant files

- `prisma/migrations/20260804070000_add_reverse_fk_performance_indexes/migration.sql`
- `prisma/migrations/20260804080000_add_critical_query_performance_indexes/migration.sql`
- `prisma/schema.prisma`
- `app/api/admin/analytics/route.ts`
- `app/api/admin/audit-log/route.ts`
- `app/api/admin/reports/route.ts`
- `components/admin/reports-panel.tsx`
- `app/api/forum/posts/route.ts`
- `components/forum/forum-feed.tsx`
- `lib/performance-audit.ts`
- `scripts/audit-performance.ts`
- `tests/unit/performance-audit.test.ts`
