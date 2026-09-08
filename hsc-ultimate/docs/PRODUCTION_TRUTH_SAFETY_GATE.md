# Production Truth & Safety Gate

**তারিখ:** ৫ আগস্ট ২০২৬  
**Status:** Runtime-integrity `PASS` — 13/13 checks, 0 fail  
**Deployment:** এখনও local-ready; public/Play publish নয়

## Goal

Reachable product runtime-এ কোনো fabricated user/activity/count, random presence, fake probability, no-op “success”, unsupported delivery claim বা cosmetic feature রাখা হবে না। Real implementation না থাকলে feature remove/disable—বানানো data দিয়ে UI পূরণ নয়।

## Removed

### Experimental runtime

- 29 Singularity API routes
- 38 Singularity library files
- fake/random presence, pulse feed, tournament, admission probability, shop, layout-save, fake sync, fake generation persistence
- 27 unreferenced API and all no-schema/no-op responses

### Prototype/dead UI

- adaptive cockpit placeholder
- fake peer radar/shop/living-room/activity widgets
- old dashboard prototype cards
- unused AI reader/simulation/snap-study/voice surfaces
- duplicate old notification bell
- old fake OfflineStatus/localStorage sync

### Partial language claim

Incomplete BN/EN/Banglish toggle removed। Current product truthfully Bangla-first; schema-তে legacy preference field থাকলেও কোনো cosmetic “full translation” UI নেই। Full translation হলে আলাদা complete phase লাগবে।

## Landing now uses live data

`app/page.tsx` current PostgreSQL থেকে parallel count করে:

- Subject
- Chapter
- Core MCQ
- Admission MCQ
- CQ
- Badge

Verified live values:

```text
13 subjects
89 chapters
688 core MCQ
220 admission MCQ
64 CQ
14 badges
```

DB down হলে invented fallback count নয়—`—`। Removed:

- fabricated testimonials/names/quotes
- `AI-Verified`
- infinite AI claim
- sub-second claim
- forever-free guarantee
- unsupported competitor comparison
- dead `href="#"` feature links

Every feature card now links to a real route and describes actual DB/algorithm/provider behavior।

## Runtime-integrity audit

New commands:

```bash
npm run audit:integrity
npm run audit:integrity:strict
```

Strict checks:

1. no Singularity runtime tree;
2. no fake/no-op marker;
3. live DB landing + no fabricated social proof;
4. no cosmetic language toggle;
5. every JSON mutation handles malformed body;
6. no privileged test credential fallback;
7. registration E2E uses current policy fields;
8. private navigation not cached;
9. accessibility controls really wired, 8–11px text 0;
10. current DB session authorization;
11. broadcast real channels only;
12. page+API feature kill switch;
13. all destructive seeds guarded।

CI, `verify:full` এবং release preflight-এ gate যুক্ত।

## PWA privacy

Service worker v2 only explicit public routes cache করে:

- `/`
- `/privacy`
- `/terms`
- `/account-deletion`

Dashboard, Settings, Admin, result/history বা অন্য personalized HTML কখনো Cache Storage-এ যায় না। Offline protected navigation generic offline page পায়। Notification link same-origin internal path না হলে `/dashboard` fallback।

## Real session authorization

Migration:

```text
20260805010000_add_auth_session_version
```

`User.authVersion`:

- password change/reset
- role change
- ban/unban

এ version increment করে। Proxy ও `requireAdmin()` current DB row থেকে existence, ban, role এবং version যাচাই করে। পুরোনো JWT 401 `SESSION_REVOKED`; password-change UI নিজে sign-out করে।

## Real operational kill switch

Feature flag এখন page এবং matching student API দুটোতেই প্রযোজ্য। Strict Focus flag Admin UI-তে যোগ হয়েছে। Maintenance mode non-Admin mutation 503 করে; read/status/auth/Admin operation চালু থাকে। Settings read fail হলে authorization check fail-open নয়।

## Broadcast truth

Active channels:

- real in-app notification
- configured web push

Removed/disabled claims:

- generic Email broadcast
- generic Android FCM broadcast
- fake scheduled broadcast

`sendPushToUser()` real configured/subscription/sent/failed/invalid-token result ফেরত দেয়। Recipient delivered কেবল in-app create বা অন্তত একটি push success হলে। No channel delivered হলে failure reason থাকে; `sentCount` আর attempted user count নয়। Input Zod, internal link only, template mass assignment removed।

## Accessibility now functional

Previous controls class/variable set করলেও CSS consume করত না। Fixed:

- root 16/18/20px font scale
- high-contrast token override
- app-level reduced-motion class
- unsupported OpenDyslexic claim/toggle removed
- active source-এর 8–11px arbitrary text **278 → 0**, rem-based `text-xs`

## Test and secret safety

Four browser/live scripts থেকে reusable Admin fallback removed। এখন explicit:

```text
TEST_ADMIN_EMAIL
TEST_ADMIN_PASS
```

না থাকলে hard fail। Live API destructive test additionally:

- disposable `@hsc-e2e-test.local` Admin only
- `ALLOW_TEST_DATA_MUTATION=EPHEMERAL_ONLY` required

All test server launch npm-only। Three registration E2E current Privacy/Terms/Age assurance payload পাঠায়। Secret scanner generic privileged fallback check করে। Historical password value report/log-এ প্রকাশ করা হয়নি; external rotation still required।

## Seed safety

17টি delete/recreate seed `assertDestructiveSeedAllowed()` ছাড়া চলবে না। Required:

```text
ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND_THIS_DELETES_DATA
```

Remote DB-তে আরও:

```text
ALLOW_REMOTE_DESTRUCTIVE_SEED=REMOTE_DATABASE_BACKUP_VERIFIED
```

Safe reviewed incremental import workflow আলাদা ও default dry-run।

## Verification

```text
Runtime truth/integrity: 15/15 PASS
API security:            213/213
Admin/auth/mutation gap: 0
Unit:                     106/106
Pure logic:               162/162
Privacy E2E:              16/16
Migrations:               33/33
FK indexes:               80/80
Critical indexes:         18/18
Dependencies:             0 production vulnerabilities
Secret checks:            18/18
Android debug/lint:       PASS
Production build:         181/181
Release preflight:        LOCAL_READY · 22 PASS · 1 WARN · 0 FAIL
```

## Intentionally not claimed

- 1,157 academic items factually expert-approved—এখনও নয়;
- full multi-language—removed until complete;
- full offline app—only public shell + explicitly integrated Habit mutation queue;
- generic FCM/email broadcast—disabled until real;
- production/distributed/Firebase readiness—external pending;
- Play approval/publishing—deferred।

## Remaining required next work

1. Historical test Admin password rotate externally;
2. academic human review 1,157 items;
3. student-facing academic error report;
4. full DB backup/PITR restore drill;
5. public staging + Upstash/cron/Firebase/Resend;
6. physical Android validation;
7. real BN/EN translation only if full coverage is implemented।
