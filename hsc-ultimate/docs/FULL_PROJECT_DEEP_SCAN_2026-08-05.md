# HSC Ultimate — Full Project Deep Scan

> **Resolution update:** এই scan-এর Phase 18 P0 findings বাস্তবায়িত হয়েছে। 29 fake/no-op API ও prototype runtime removed, live landing/PWA/session/broadcast/seed/test/accessibility gates complete। Current evidence: [`PRODUCTION_TRUTH_SAFETY_GATE.md`](./PRODUCTION_TRUTH_SAFETY_GATE.md)। নিচের finding অংশ historical before-state হিসেবে রাখা হয়েছে।

**তারিখ:** ৫ আগস্ট ২০২৬  
**Scope:** 89 pages, 241 API routes, 202 components, 151 library files, 64 Prisma models, 30 migrations, Android/PWA/CI/docs/content/testing  
**Mode:** read-only source/report scan; preview/server বন্ধ; database write 0; `.env` values পড়া বা প্রকাশ করা হয়নি

## Executive verdict

প্রজেক্টের verified core শক্তিশালী: build, type/lint, schema/migration, route auth manifest, rate-limit coverage, DB indexes, academic structure, Privacy Center এবং Android compile সব pass। কিন্তু **`LOCAL_READY` মানে production-ready নয়**। Deep scan-এ এমন কিছু production-integrity gap পাওয়া গেছে যেগুলো existing “241/241 security PASS” audit-এর scope-এর বাইরে ছিল—কারণ সেই audit auth/rate/header দেখে, endpoint সত্যি কাজ করে কিনা, fake response দেয় কিনা, বা test tooling live data মুছে ফেলতে পারে কিনা তা দেখে না।

### বর্তমান সঠিক status

| Area | Status |
|---|---|
| Compile/build/schema | Strong — 210/210 build, 30/30 migration |
| API auth/rate/index baseline | Strong static baseline |
| Production behavior integrity | **Blocked by P0 findings below** |
| Academic structure | Strong; automated blocker 0 |
| Academic factual verification | **0/1,157 human-reviewed** |
| Privacy code/docs | Local-ready; operator/contact/legal review pending |
| PWA | Install/offline shell works; private-cache and duplicate sync issues remain |
| Android | Debug compile/lint works; Firebase/physical/Play declaration pending |
| Test system | Unit/pure strong; several live/browser harnesses stale or unsafe |
| Deployment | Not active; external services pending |
| Play Store | Correctly deferred |

---

# P0 — Public beta/deployment-এর আগে ঠিক করা জরুরি

## 1. Reusable test Admin credential source-এ hardcoded

**Severity: Critical**

চারটি browser/live-test script environment variable না থাকলে source-এ থাকা একই reusable Admin credential fallback ব্যবহার করে:

- `scripts/take-screenshots-live.py`
- `scripts/test-live-api.py`
- `scripts/test-live-pages.py`
- `scripts/test-mobile-layout.py`

Credential value এই report-এ intentionally redacted। Existing secret scanners generic password fallback ধরেনি; API security report তাই “hardcoded secret pattern 0” বললেও এই class miss করেছে।

### করণীয়

1. Source থেকে fallback email/password সম্পূর্ণ সরানো;
2. `ADMIN_EMAIL`/`ADMIN_PASS` missing হলে hard fail;
3. সংশ্লিষ্ট live Admin password rotate করা;
4. test-only ephemeral Admin তৈরি করা;
5. generic credential literal/`ADMIN_PASS` fallback CI scanner যোগ করা;
6. Git/Drive/archive history থাকলে credential exposed ধরে নেওয়া।

## 2. Singularity experimental API tree fake/no-op behaviorসহ live-accessible

**Severity: Critical / product-trust + abuse-cost risk**

Scan result:

```text
Singularity API routes: 29
Literal frontend/internal references: 2
Unreferenced routes: 27
Zod/input schemas: 0/29
```

Examples:

- random “online peers” count;
- fabricated names/activity feed;
- hardcoded tournament squad/boss;
- fake admission probability/rank ranges;
- dashboard/layout “saved” response, কিন্তু DB write নেই;
- offline sync “integrated successfully” response, কিন্তু action process হয় না;
- flash generation response, কিন্তু deck-এ save হয় না;
- shop purchase always succeeds/free, persistence নেই;
- hardcoded “critical moment” battle result;
- AI prediction phrased as 20-year trend without a verified dataset;
- several AI fallbacks return invented/default content.

সব route authenticated হলেও প্রতিটি AI route-এর আলাদা rate bucket থাকায় একজন user বহু endpoint ঘুরে free API quota ব্যবহার করতে পারে।

### করণীয়

Recommended default: **পুরো experimental tree quarantine**।

- `EXPERIMENTAL_SINGULARITY=false` হলে API-তে 404/410;
- fake/random/no-op routes remove;
- সত্যি ব্যবহৃত `/insight`-কে core validated endpoint-এ migrate;
- old `/sync` remove করে real IndexedDB queue ব্যবহার;
- feature claim/nav/docs থেকে prototype language সরানো;
- রাখতে হলে প্রতিটি route-এ Zod, ownership, bounded input, truthful persistence, unit/E2E এবং explicit beta label বাধ্যতামূলক।

## 3. Service Worker authenticated/private HTML cache করে

**Severity: Critical privacy risk**

`public/sw.js` সব same-origin navigation response cache করে। ফলে `/dashboard`, `/settings`, `/admin`, AI/history/result pages-এর personalized HTML browser Cache Storage-এ যেতে পারে। Logout/account-switch-এর পরে offline অবস্থায় আগের user-এর cached page দেখা যাওয়ার ঝুঁকি আছে। API cache না করাই যথেষ্ট নয়; private HTML-ও sensitive।

### করণীয়

- Protected/admin/result/profile route কখনো page cache না করা;
- শুধু explicit public offline-safe pages cache;
- `Cache-Control: private/no-store` honor করা;
- logout/account change-এ private cache purge;
- cache key-তে account partition না করে private cache পুরো বাদ দেওয়া সহজ ও নিরাপদ;
- automated “User A → logout → User B/offline” leakage test।

## 4. Ban/role/password change-এর পরে JWT session stale থাকে

**Severity: Critical authorization risk**

- NextAuth JWT-তে role login-time snapshot;
- `requireAdmin()` শুধু JWT role দেখে, live DB role নয়;
- Admin role সরালেও পুরোনো JWT দিয়ে Admin API চলতে পারে;
- proxy ban check student page route-এ হয়, `/api/*` branch-এ নয়;
- `protectApiRoute()` user existence/ban/current role DB থেকে যাচাই করে না;
- password change existing JWT sessions revoke করে না।

### করণীয়

- `sessionVersion/authEpoch` field;
- password/role/ban/delete-এ epoch increment;
- Admin destructive API-তে current DB role + banned state বাধ্যতামূলক;
- all authenticated API-তে centralized user-exists/not-banned guard;
- optional 30–60 second bounded cache, কিন্তু destructive Admin path always live;
- Admin MFA/passkey/TOTP এবং sensitive action re-auth পরের ধাপে।

## 5. 17টি destructive seed script live database-এ guard ছাড়া চালানো যায়

**Severity: Critical data-loss risk**

`prisma/seed.ts` পুরো Subject tree delete করে; admission/question/CQ seeds topic/question rows delete করে। Question delete user answer history cascade করতে পারে। Command নাম সাধারণ `db:seed*`; production host/confirmation guard নেই।

### করণীয়

- default dry-run/append-only;
- `ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND` + environment allowlist;
- known live Supabase host-এ hard block;
- backup checksum + explicit manifest ছাড়া delete নিষিদ্ধ;
- legacy destructive scripts `scripts/legacy-dangerous/`-এ quarantine;
- package scripts থেকে production-safe wrapper ছাড়া direct entry বাদ।

## 6. Live/browser test harness এখন stale এবং একটি script real Admin data reset করে

**Severity: Critical test-safety risk**

Findings:

- 3 registration-based E2E script নতুন Privacy/Terms fields পাঠায় না; এখন registration 400 হবে;
- 4 browser script npm-only project হওয়া সত্ত্বেও `pnpm dev` চালায়;
- 4 script hardcoded Admin fallback ব্যবহার করে;
- `test-live-api.py` real/default Admin-এর XP, progress, sessions, badges ও notifications direct SQL দিয়ে reset/delete করে;
- live tests production datasource ও test datasource আলাদা করে না;
- existing 83 Core/Focus baseline historical; current Privacy registration change-এর পরে সব script rerunnable নয়।

### করণীয়

- isolated `TEST_DATABASE_URL` বা disposable schema;
- production host refusal;
- ephemeral Admin/student fixture;
- current policy payload shared helper;
- npm-only server launcher;
- API cleanup নিজের test IDs ছাড়া কিছু touch করবে না;
- every run pre/post row manifest;
- CI/staging smoke; local live DB test explicit opt-in।

## 7. Advanced Broadcast UI unsupported channel-কে delivered হিসেবে উপস্থাপন করতে পারে

**Severity: High**

`/admin/broadcast` Email এবং Native FCM toggle দেখায়, কিন্তু backend-এ দুটোই TODO/no-op এবং delivery false থাকে। Web push helper silent-fail করলেও caller `pushDelivered=true` সেট করে। Per-user `sentCount` channel failure হলেও বাড়ে। `scheduledFor` save হলেও broadcast সঙ্গে সঙ্গে send হয়; broadcast scheduler নেই।

আরেকটি আলাদা `/admin/notifications` basic broadcast system-ও আছে—দুটি overlapping Admin flow।

### করণীয়

- unsupported Email/Native/Scheduled toggle disable + “not configured” label;
- অথবা real Resend/FCM integration;
- `sendPushToUser()` structured sent/failed/skipped result ফেরত দেবে;
- campaign success per-channel হিসাব করবে;
- scheduled broadcast worker/lease/idempotency;
- দুই Admin broadcast UI consolidate;
- Zod + URL validation + styled confirmation।

## 8. Landing page-এ প্রমাণহীন testimonials ও contradictory claims

**Severity: High product/legal trust risk**

Hardcoded student names/quotes-এর source/evidence নেই। আরও claims:

- “AI-Verified” — কিন্তু human review 0/1,157;
- “চিরকালের জন্য” free;
- “sub-second response” — AI response এ প্রযোজ্য নয়;
- infinity AI — actual rate limit আছে;
- competitor brands-এর “best features” comparative claim;
- terms নিজেই AI/academic content verified guarantee নয় বলে।

### করণীয়

- fabricated testimonials remove;
- real consented beta feedback না আসা পর্যন্ত “What you can do” demo section;
- “AI-assisted”, “structurally checked”, exact content counts;
- free/current availability wording, forever guarantee নয়;
- measured performance ছাড়া latency claim নয়।

---

# P1 — Core quality ও usability

## 9. Accessibility Settings-এর চারটি app-level control কার্যত কাজ করে না

**Severity: High**

Provider:

- `--a11y-font-size` set করে, কিন্তু CSS variable কোথাও consume হয় না;
- `.dyslexia-font`, `.high-contrast`, `.reduced-motion` class toggle করে, কিন্তু corresponding CSS rules নেই;
- OS `prefers-reduced-motion/contrast` media query আছে, app toggle আলাদা করে কাজ করে না;
- “OpenDyslexic” claim আছে, font source নেই।

আরও scan:

```text
8–11px text instances: 325
Affected TSX files: 108
```

Absolute `text-[8px]`–`text-[11px]` root font-size বাড়ালেও scale হবে না।

### করণীয়

- actual CSS wiring + tests;
- real licensed/self-hosted dyslexia-friendly font অথবা claim remove;
- essential text minimum 12–14px; most body/supporting text rem-based;
- 325 instances semantic typography token-এ migrate;
- axe-core + keyboard + zoom 200% + screen-reader smoke।

## 10. Multi-language toggle মূলত cosmetic

**Severity: High product-integrity gap**

- Language context ব্যবহার করে মাত্র 3টি file;
- actual translator ব্যবহার মূলত one dashboard component/toggle;
- 73 file-এ অন্তত 302 literal English JSX strings;
- অধিকাংশ Bangla/English text hardcoded;
- locale switch করলে পুরো app translate হয় না;
- SSR `<html lang="bn">`, client hydration-এর পরে বদলায়।

### সিদ্ধান্ত দরকার

1. Full BN/EN rollout with typed translation keys; অথবা
2. Toggle সাময়িকভাবে সরিয়ে “Bangla-first” truthful product।

Banglish আলাদা পূর্ণ locale হিসেবে maintain করা cost-heavy; প্রথমে BN/EN recommended।

## 11. Academic factual review backlog 1,157/1,157

**Severity: High educational risk**

```text
Core MCQ: 688
Admission MCQ: 220
CQ: 64
Topic notes: 185
Human reviewed: 0
Automated blockers: 0
Automated warnings: 4
```

Structure clean মানে fact verified নয়। দুই cross-context duplicate group আছে।

### করণীয়

- subject-wise batches (প্রথমে Physics/Chemistry/Higher Math/ICT);
- board/NCTB source URL + reviewer identity/qualification;
- question, answer, explanation, formula, unit, year/source পৃথক checklist;
- approved hash stale হলে re-review;
- expert CSV workflow;
- dashboard-এ “reviewed” content badge only when current hash approved।

## 12. Student-facing academic error report নেই

Forum report আছে, কিন্তু MCQ/CQ/note/formula-তে “উত্তর ভুল/টাইপো/report” নেই।

### করণীয়

- every result/topic page-এ Report content;
- Question/CQ/Topic target + reason + optional note;
- Content Quality queue integration;
- duplicate report collapse, reporter notification, no auto-edit।

## 13. Video lesson coverage effectively zero

Seed source-এ `videoUrl` assignment 0। 185 topic-এ video card “শীঘ্রই” fallback দেখায়।

### করণীয়

- empty video panel hide করে notes-first premium layout; অথবা
- verified/licensed official video mapping;
- iframe allowlist, `title`, lazy load, privacy-enhanced embed, referrer policy।

## 14. “Full offline sync” overclaim এবং duplicate queue

দুটি আলাদা system:

1. real IndexedDB URL/method queue — বর্তমানে Habit tracker-এ ব্যবহৃত;
2. old localStorage Singularity queue — server no-op হলেও success পেয়ে queue clear করে।

Root layout দুটো indicator mount করে। Full app offline mutation support নেই।

### করণীয়

- old OfflineStatus/engine/no-op API remove;
- একটাই IndexedDB queue;
- supported endpoint allowlist;
- idempotency key/server dedupe;
- conflict UI এবং abandoned-action recovery;
- feature copy “limited offline queue” যতক্ষণ full coverage না হয়।

## 15. General timezone consistency

Focus analytics Asia/Dhaka-aware, কিন্তু general analytics/heatmap/weekly recap-এর বহু grouping `toISOString().slice(0,10)`/server local midnight ব্যবহার করে। Dhaka 00:00–05:59 activity আগের UTC দিনে যেতে পারে।

### করণীয়

- shared `Asia/Dhaka` date-key library;
- DST-independent fixed business timezone tests;
- analytics, streak, planner, weekly recap একই boundary।

## 16. Auth foundation আরও শক্ত করা যায়

- password minimum মাত্র 6;
- email verification নেই;
- reset token plaintext DB-তে;
- expired/used reset-token periodic purge নেই;
- password change session revoke করে না;
- Admin MFA নেই;
- weekly digest default opt-out (`true`) এবং email unverified।

### করণীয়

- 10–12+ password/passphrase policy + breached-password optional check;
- email verification;
- reset token hash + delete on use/expiry;
- session epoch/revocation;
- Admin MFA/re-auth;
- digest default off until verified opt-in।

## 17. Notification SSE ও Battle SSE scale test দরকার

- notification stream প্রতি tab 5s-এ দুই DB query, max duration নেই;
- CUID `id > lastId` cursor chronology-এর reliable contract নয়;
- battle stream প্রতি player 1.5s-এ full detail query; 30 player হলে high DB polling;
- public staging concurrency benchmark নেই।

### করণীয়

- `(createdAt,id)` cursor;
- connection cap/max duration;
- visibility-based disconnect;
- Supabase Realtime/Redis pub-sub অথবা shared event fanout;
- 1/10/30/100 connection load profile।

## 18. Export/deletion mature-user scalability

Export v2 truthful ও comprehensive, কিন্তু 40+ parallel DB query + all PDF chunks/chat/images memory-তে JSON করে। Mature account-এ timeout/OOM হতে পারে। Account deletion cascade-ও বড় account-এ long transaction হতে পারে।

### করণীয়

- queued export job, cursor/stream, compressed archive, expiring signed download;
- progress/status + retry;
- deletion “pending/locked” state, resumable worker, provider deletion log;
- test with synthetic large account।

## 19. Observability এখনো local console-কেন্দ্রিক

- Sentry/structured production logging active নয়;
- `lib/logger.ts` centralভাবে ব্যবহৃত হয় না;
- several console logs include user IDs;
- CSP Report-Only header-এ report endpoint/`report-to` নেই, তাই telemetry আসবে না;
- no uptime alert/error budget/trace correlation।

### করণীয়

- privacy-redacted structured logger;
- request/correlation ID;
- Sentry/OpenTelemetry/Plausible decision;
- CSP report endpoint, staging analysis, then enforcing CSP;
- alert policy for DB/scheduler/rate limiter/FCM/email।

## 20. Feature flag/maintenance kill switch API-তে প্রযোজ্য নয়

Proxy page route বন্ধ করে, কিন্তু corresponding `/api/*` endpoint চলতে পারে। Maintenance mode-ও direct API mutation থামায় না। UI list-এ Focus flag নেই, route map-এ আছে।

### করণীয়

- module-to-page-and-API shared map;
- disabled feature API 503/423;
- maintenance mutation policy (Admin/health/cron allowlist);
- Focus flag UI parity;
- kill-switch E2E।

---

# P2 — Architecture, polish, and maintainability

## 21. Prototype/dead code cleanup

Static graph-এ কমপক্ষে 20টি orphan/prototype component candidate এবং বহু Singularity library পাওয়া গেছে। Examples: adaptive cockpit placeholder, old dashboard widgets, fake peer radar/shop/living room, duplicate notification bell।

### করণীয়

- used/import graph manual confirm;
- delete or `experimental/` quarantine;
- old Dashboard 1 components remove;
- `reading-room.ts` (728 lines), `analytics.ts` (675), `account-privacy.ts` (623), large Admin components split;
- dead-code CI (`knip`-style) after Next dynamic import allowlist।

## 22. Admin UX consistency

- two broadcast surfaces;
- advanced broadcast page mostly English;
- raw browser `confirm()`/`prompt()` remains in broadcast and Focus controls despite shared dialog system;
- Settings page + SettingsForm duplicate headers/padding;
- only 31 route loading files; root fallback exists, but heavy dynamic pages need measured priorities;
- only one segment error boundary plus global error।

## 23. SEO/brand/legal polish

- auth pages currently indexable;
- public domain fallback is not live;
- operator/contact pending;
- structured data absent;
- comparative competitor claims unsubstantiated;
- real consented testimonials/beta metrics নেই।

## 24. CI/supply-chain enhancements

Current CI strong baseline, তবে:

- GitHub Actions major tags এবং `trufflehog@main` mutable; commit SHA pin নয়;
- no CodeQL/dependency-review/SBOM/container scan;
- TODO count warning only;
- semantic API integrity, fake response, malformed JSON coverage নেই;
- no browser/axe/Lighthouse CI stage;
- no Docker image build/run smoke।

## 25. Full user/attempt disaster recovery

Academic snapshot verified, কিন্তু full encrypted `pg_dump`, user/attempt restore drill, provider PITR evidence নেই। Public beta-এর আগে mandatory।

---

# External configuration/hardware ছাড়া এখনই করা যায়

1. **Production Truth & Safety Sweep** — P0 #1–#8 code changes;
2. **Test Harness 3.0** — isolated DB, credential-free, npm-only, current policy payload;
3. **Accessibility Controls Repair** — actual CSS + tiny text migration;
4. **Singularity/dead-code quarantine**;
5. **PWA private-cache fix + single offline queue**;
6. **Auth epoch/current-role guard code**;
7. **Broadcast truthful state/consolidation**;
8. **Academic error-report workflow**;
9. **Timezone unification**;
10. **Landing trust rewrite**;
11. **Staging smoke/rollback scripts** লিখে রাখা;
12. **Subject review packet/batch preparation**।

# External credential/provider/hardware লাগবে

- Admin password rotation;
- public HTTPS domain/deployment;
- Upstash activation;
- Firebase service account + `google-services.json`;
- verified Resend domain/from address;
- Supabase Cron/Vault activation;
- provider-managed PITR/full backup;
- real staging load/CSP telemetry;
- physical Android OEM tests;
- signing/AAB/assetlinks;
- verified operator/privacy contact and legal review;
- Play Data Safety/Accessibility declaration and closed testing much later।

# এখন যা করা উচিত নয়

- Play Store publish;
- public traffic নেওয়া;
- fake Singularity endpoints expose রাখা;
- destructive seed live DB-তে চালানো;
- current live Admin দিয়ে API regression test চালানো;
- academic content auto-approve;
- old snapshot automatic restore;
- unsupported Email/FCM broadcast “delivered” দেখানো;
- consent auto-backfill;
- CSP enforce করা report/compatibility test ছাড়া।

---

# Recommended execution order

## Phase 18 — Production Truth & Safety Gate (**Next recommended**)

- credential fallback removal + rotation checklist;
- Singularity quarantine;
- private page cache fix;
- live role/ban/session epoch;
- destructive seed guards;
- broadcast unsupported channel disable;
- landing claim rewrite;
- semantic security audit additions।

**Exit gate:** no hardcoded reusable credentials, no fake/no-op reachable API, no private HTML cache, role/ban immediate, destructive scripts default-safe।

## Phase 19 — Test Harness & Recovery 3.0

- disposable DB/schema fixtures;
- current registration policy helper;
- all tests npm-only;
- no real-user mutation;
- all-route malformed JSON/schema/ownership matrix;
- 89-page production smoke + selected Playwright/axe;
- full backup/restore drill scripts।

## Phase 20 — Accessibility & Language Integrity

- four controls truly functional;
- 325 tiny text migration;
- BN/EN strategy and truthful toggle;
- keyboard/screen-reader/zoom/color automation।

## Phase 21 — Academic Trust Loop

- user report button;
- expert review batches;
- provenance/current-hash badges;
- warnings resolve;
- notes/formula/CQ/MCQ subject-by-subject factual review।

## Phase 22 — Notification, Offline, Observability

- one broadcast system;
- real channel outcomes;
- one offline queue with idempotency;
- structured logs/CSP reporting;
- SSE scale remediation।

## Phase 23 — Staging Deployment & Reliability

Public staging URL পাওয়ার পরে:

- deploy near Supabase region;
- Upstash/cron/Firebase/Resend;
- load/latency/CSP/rollback/backup tests;
- closed beta feedback;
- production decision।

## Phase 24 — Android Closed Test (Play publish নয়)

- physical OEM behavior;
- battery/background/Accessibility disclosure;
- FCM closed-app delivery;
- signing/assetlinks/AAB;
- Play declarations draft validation;
- only then future closed testing consideration।

---

## Bottom line

Next feature যোগ করার চেয়ে এখন **truthfulness, session authorization, PWA privacy, test safety এবং fake prototype removal** অনেক বেশি গুরুত্বপূর্ণ। Recommended next action: **Phase 18 — Production Truth & Safety Gate**। এটি external deployment ছাড়াই করা যায় এবং project-এর actual risk সবচেয়ে বেশি কমাবে।
