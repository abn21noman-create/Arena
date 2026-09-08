# HSC Ultimate — Project Rescue Report

**তারিখ:** ৪ আগস্ট ২০২৬  
**Scope:** Build, TypeScript, lint, tests, security, dependency, PWA, Docker এবং Android configuration rescue

## চূড়ান্ত অবস্থা

| Check | Result |
|---|---|
| Node target | 22+ |
| Next.js | 16.2.12 |
| Production build | ✅ Webpack, 206/206 page generation, exit 0 |
| TypeScript | ✅ 0 error |
| ESLint | ✅ 0 error, 0 warning |
| Unit tests | ✅ Web 93/93 + Android JVM 6/6 |
| Pure-logic assertions | ✅ 162/162 |
| Live E2E | ✅ Core 46/46 + Focus/Analytics/Scheduling 37/37; test data cleaned |
| Seed integrity | ✅ 688 core MCQ + 220 admission MCQ = 908, 64 CQ |
| Prisma schema | ✅ valid |
| Database migrations | ✅ 29/29 applied; schema up to date |
| AI provider health | ✅ Text 4/4, Vision 2/2 |
| npm audit | ✅ 0 vulnerability |
| Capacitor Doctor | ✅ Android looking great |
| Android build/lint | ✅ assembleDebug + lintDebug |
| PWA referenced assets | ✅ 0 missing |
| Standalone production smoke | ✅ landing/login/manifest/health; protected route redirect; API 401 |

## প্রধান যেসব সমস্যা ঠিক হয়েছে

1. `lib/singularity/living-notes.ts`-এর অসম্পূর্ণ method/class পুনর্গঠন।
2. `lib/study-plan-generator.ts`-এর কাটা `catch` block এবং misplaced intervention code ঠিক করা।
3. 69টি latent TypeScript error ও সংশ্লিষ্ট export/import/schema mismatch ঠিক করা।
4. Formula Search, CQ hub ও Mock Exam hub-এর broken component integration ঠিক করা।
5. পুরোনো Vitest suite বর্তমান implementation-এর সঙ্গে sync করে passing test বানানো।
6. সব lint error/warning পরিষ্কার করা।
7. Docker-এর জন্য `output: "standalone"` এবং Webpack memory optimization যোগ করা।
8. low-memory build-এর জন্য `cpus: 1` ও `webpackMemoryOptimizations` চালু করা।
9. Next.js, NextAuth এবং Capacitor dependency align করা।
10. patched PostCSS, Sharp ও UUID override করে npm audit 0 করা।
11. npm-কে একমাত্র package manager করা; stale pnpm lock/workspace সরানো।
12. Prisma seed config `prisma.config.ts`-এ migrate করা।
13. 29টি Singularity API-তে authentication ও rate limiting যোগ করা।
14. Auth registration/login/reset এবং AI chat-এ rate limiting যোগ করা।
15. Client-supplied Singularity `userId` বাদ দিয়ে authenticated session ID ব্যবহার।
16. hard-coded master-email admin bypass সরিয়ে role-only admin authorization করা।
17. PWA-এর ৫টি missing icon/startup/screenshot asset তৈরি করা।
18. Capacitor CLI/Core/Android 8.5.0 align এবং Android web assets sync করা।
19. Android release-এর debug signing সরিয়ে environment-secret release signing করা।
20. Docker-এর unused, unauthenticated Redis service সরানো।
21. Docker startup-এর unsafe automatic production seeding বাদ দেওয়া।
22. CI workflow Node 22, tests, blocking security audit ও valid job hierarchy দিয়ে ঠিক করা।
23. README/SETUP-এ Node 22 + npm setup update করা।

## যাচাই করা live flow

Live Supabase database ব্যবহার করে temporary test user দিয়ে নিচের flow সফল হয়েছে:

- Registration ও duplicate/weak-password validation
- Wrong password rejection
- Credentials login ও session
- Anonymous API authorization
- Practice start ও anti-cheat payload
- Server-side scoring
- XP award
- Mistake Vault persistence
- Analytics, GPA, retention, recap, drill, admission, notifications, tasks, flashcard ও study-plan APIs
- Student থেকে Admin API rejection
- Landing, login, register, dashboard, practice ও leaderboard page rendering
- সব test data cascade cleanup; database আবার মূল ১ জন user-এ ফিরে গেছে

## Live database snapshot

- User: 1
- Subject: 13
- Chapter: 89
- Topic: 185
- Core MCQ (`Question`): 688
- Admission MCQ (`AdmissionQuestion`): 220
- CQ: 64
- Badge: 14
- Migration: 23, সব applied

MCQ reconciliation-এ ধরা পড়ে পুরোনো 908−677 হিসাবটি 220টি AdmissionQuestion-সহ source total-কে শুধু core Question count-এর সাথে তুলনা করেছিল। প্রকৃত core gap ছিল 11; reviewed append-only transaction-এ সেগুলো import করার পর source/live এখন 688/688 core এবং 220/220 admission exact match। বিস্তারিত: `docs/MCQ_SAFE_IMPORT_2026-08-04.md`।

## API key সম্পর্কে

ব্যবহারকারীর নির্দেশ অনুযায়ী `.env` ও `.env.local` রাখা হয়েছে এবং কোনো key rotate/delete/change করা হয়নি। Secret values কোনো report/log-এ প্রকাশ করা হয়নি। সব ১৬টি secret health check পাস করেছে।

## Build memory note

এই sandbox-এ RAM প্রায় 1.9 GB এবং default swap ছিল 0। Full build kernel/V8 OOM করছিল। 2 GB temporary swap, 1400 MB V8 heap, এক worker এবং Webpack memory optimization দিয়ে Node 22 production build সফল হয়েছে। সাধারণ 4–8 GB CI/developer machine-এ swap workaround সাধারণত লাগবে না।

## এখনো external/manual কাজ

1. Native Firebase push-এর জন্য নিজের `android/app/google-services.json` যোগ করতে হবে।
2. Android APK/AAB compile করতে JDK 21+, Android SDK এবং release keystore লাগবে; বর্তমান sandbox-এ JDK 11 ও Android SDK অনুপস্থিত ছিল।
3. Deploy-এর সময় `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` ও Capacitor server URL বাস্তব domain-এ বসাতে হবে। Trusted reverse proxy/container হলে `AUTH_TRUST_HOST=true` দিতে হবে।
4. Multi-instance Redis/Upstash adapter এখন implemented; distributed mode সক্রিয় করতে deployment secret manager-এ external `UPSTASH_REDIS_REST_URL` ও token বসাতে হবে। Credential না থাকলে bounded local-memory mode নিরাপদ fallback হিসেবে চলে।
5. Academic content-এর factual correctness subject expert দিয়ে আলাদাভাবে review করা উচিত; structural seed test factual review নয়।
6. Native Push/FCM ও optional broadcast email channel external provider setup-এর পর end-to-end test করতে হবে।

## Strict Focus extension (৪ আগস্ট ২০২৬)

Project rescue-এর পরে consent-based Strict Focus feature যোগ ও যাচাই করা হয়েছে:

- ২০–১২০ মিনিট Self Focus
- User Focus Contract-এর পর Admin force-start
- Mandatory emergency exit + audit log
- Android foreground timer, Accessibility package blocker ও reboot restore
- HSC Ultimate, Phone/Emergency, keyboard, system UI ও Clock/Alarm allowlist
- Optional Firebase Admin/FCM data command when app is closed
- Prisma models এখন ৫৮; migrations এখন ২১
- Unit tests এখন ২৫/২৫ pass; Pure logic ১৬২/১৬২ pass
- Live Focus E2E: ১৯/১৯ pass; Core E2E: ৪৬/৪৬ pass
- Final web production build: ১৯৩/১৯৩ page-data generation, exit 0
- Android `assembleDebug`: success; debug APK ৬.৩ MB (JDK 21, SDK 36, AGP 8.13, Gradle 8.13)
- Android `lintDebug`: success
- npm audit: ০ vulnerability; Prisma migration ২১/২১ applied
- বিস্তারিত: [`STRICT_FOCUS.md`](./STRICT_FOCUS.md)

## Fast workflow extension

Repeated development checks দ্রুত করার জন্য smart workflow যোগ করা হয়েছে:

- `npm run setup` — package-lock hash unchanged হলে install skip
- `npm run doctor` — secret value প্রকাশ না করে environment diagnosis
- `npm run verify` — incremental TypeScript + cached ESLint + unit tests
- Warm-cache quick verify measured: প্রায় ১৪ সেকেন্ড
- `npm run verify:full` — content, Prisma, audit ও secret checks
- `npm run build` — progress heartbeat + low-memory temporary swap + automatic cleanup
- `npm run android:check` — web workflow থেকে Android compile/lint আলাদা
- বিস্তারিত: [`DEVELOPMENT_WORKFLOW.md`](./DEVELOPMENT_WORKFLOW.md)

## Premium loading/theme extension

- Global + ২৬টি route-level loading state এখন information-rich premium UI
- ১৫টি module-specific loading profile
- Obsidian Prism dark theme এবং Pearl/Lilac light glass polish
- Secure sync steps, workspace preview, study insight ও indeterminate progress
- Cloud preview HMR-এর `*.e2b.app` origin support; loading state-এ আটকে থাকার কারণ fix
- TypeScript, ESLint, ২৫/২৫ tests এবং ১৯৩/১৯৩ production generation pass
- বিস্তারিত: [`PREMIUM_LOADING_THEME.md`](./PREMIUM_LOADING_THEME.md)

## Premium Dashboard 2.0 extension

- Hard-coded Singularity demo widgets বাদ দিয়ে real database-driven dashboard
- Command Hero, exam countdown, target GPA, active focus ও next mission
- ৫টি live metric এবং ১২-column responsive bento system
- Daily mission completion, weak-topic insight, revision pulse, week momentum
- Upcoming task ও quiz/study/focus/task activity timeline
- Real subject mastery links ও progress
- Production build ১৯৩/১৯৩; Core live E2E ৪৬/৪৬
- বিস্তারিত: [`DASHBOARD_2.md`](./DASHBOARD_2.md)

## Focus Analytics extension

- User 7/30/90-day analytics, daily chart, completion/emergency/average/streak
- Self বনাম Admin source এবং subject-wise focus breakdown
- Optional subject/label on Self ও Admin session start
- Historical Admin analytics default private; explicit user opt-in required
- Admin aggregate report, opted-in user list এবং UTF-8 CSV export
- Migration ২২/২২ applied; unit tests ২৯/২৯; Focus E2E ২৮/২৮
- Production build ১৯৮/১৯৮
- বিস্তারিত: [`FOCUS_ANALYTICS.md`](./FOCUS_ANALYTICS.md)

## Admin Focus Scheduling extension

- One-time, daily ও weekly consent-based schedule
- ৫ মিনিট আগে atomic reminder
- Lazy processor + `CRON_SECRET`-protected production cron
- User cancel, Admin pause/resume/cancel, contract revoke auto-cancel
- Row-lock recurrence claim, double-session guard এবং FCM start path
- Migration ২৩/২৩; scheduling phase-এ unit ৩৭/৩৭; Focus E2E ৩৭/৩৭; build ২০১/২০১
- বিস্তারিত: [`FOCUS_SCHEDULING.md`](./FOCUS_SCHEDULING.md)

## MCQ safe reconciliation extension

- 908 source count-কে 688 core + 220 admission হিসেবে model অনুযায়ী আলাদা করা হয়েছে
- প্রকৃত 11টি ICT core gap reviewed append-only transaction-এ import
- Source/live এখন 688/688 core + 220/220 admission exact match
- Missing, drift, live-only, same-topic duplicate ও quality blocker সব 0
- দ্বিতীয় apply-তে insert/update/delete 0 — idempotency verified
- বিস্তারিত: [`MCQ_SAFE_IMPORT_2026-08-04.md`](./MCQ_SAFE_IMPORT_2026-08-04.md)

## Distributed rate-limit extension

- Existing local limiter এখন optional atomic Upstash Redis sliding window সমর্থন করে
- Raw user/IP Redis key-তে যায় না; SHA-256 scoped identity ব্যবহৃত
- Redis failure-এ bounded memory safety fallback + 3-failure circuit breaker
- 49টি direct/shared protected call site async enforcement-এ migrated
- Health/doctor/secret checker-এ credential value ছাড়া runtime/config state
- Unit tests এখন 42/42; external Upstash credential না থাকায় current runtime intentional local mode
- বিস্তারিত: [`DISTRIBUTED_RATE_LIMITING.md`](./DISTRIBUTED_RATE_LIMITING.md)

## Focus scheduler operations extension

- Bounded singleton heartbeat/metrics state + cross-instance expiring lease
- Constant-time Bearer cron auth; GET/POST; aggregate no-store response
- Admin Scheduler Operations health card, queue metrics ও audited manual run
- `/api/health`-এ lazy/external heartbeat freshness ও stale/failure visibility
- Supabase Cron/Vault free-compatible এবং Vercel Pro deployment templates
- Migration ২৪/২৪; unit ৫১/৫১; live cron 401/202/200 paths verified
- Public deployment URL না থাকায় external minute trigger activation ইচ্ছাকৃতভাবে pending
- বিস্তারিত: [`FOCUS_SCHEDULER_OPERATIONS.md`](./FOCUS_SCHEDULER_OPERATIONS.md)

## Native push delivery readiness extension

- Per-device `NativePushDelivery` audit + NativeDevice push/receipt/disable diagnostics
- Firebase errors এখন Focus API-তে throw না করে stable safe result দেয়
- Invalid token hard-delete নয়; soft-disable + valid re-registration recovery
- Android command ID, issue-time, 120-second age, future-skew, session/duration/deadline ও bounded replay guard
- App-open authenticated receipt sync server session-এর native-active state update করে
- Admin Native Delivery Diagnostics; health/secret-shape visibility
- Migration ২৫/২৫; web unit ৫৪/৫৪; Android JVM ৬/৬; APK compile/lint pass
- Real FCM credential/physical-device test external pending
- বিস্তারিত: [`NATIVE_PUSH_DELIVERY_READINESS.md`](./NATIVE_PUSH_DELIVERY_READINESS.md)

## Admin System Operations Center 2.0 extension

- `/api/admin/system`-এর hard-coded 1250 users/45.2k calls/15400 questions ও fake logs সম্পূর্ণ সরানো
- Real DB/content/Focus/native/audit counts, migration parity ও database latency
- Runtime memory/uptime, rate limiter, scheduler, native push ও controls status
- Secret-free deployment readiness checklist এবং recent real audit activity
- Premium responsive bento dashboard + Admin route loading + 30-second refresh
- Phase snapshot healthy; full database এখন 29/29; web unit এখন 86/86
- বিস্তারিত: [`SYSTEM_OPERATIONS_CENTER.md`](./SYSTEM_OPERATIONS_CENTER.md)

## Academic Content Quality Center extension

- 688 core MCQ + 220 admission + 64 CQ + 185 notes = 1,157-item risk scan
- Structural/Unicode/math/answer/options/CQ/note/duplicate triage; factual auto-approval নিষিদ্ধ
- Human APPROVED/NEEDS_CORRECTION/REJECTED status, note, HTTPS provenance ও audit
- Premium Admin queue/search/filter/pagination/review UI + sidebar/loading
- Live scan: blocker 0, warning item 4, same-context duplicate 0, cross-context groups 2
- Migration ২৬/২৬; temporary review workflow cleanup 0; web unit এখন 67/67
- Full subject-expert factual review manual backlog হিসেবে থাকে
- বিস্তারিত: [`ACADEMIC_CONTENT_QUALITY.md`](./ACADEMIC_CONTENT_QUALITY.md)

## Academic review integrity extension

- Review decision exact SHA-256 content version-এর সঙ্গে bound
- Content বদলালে stale review approved progress থেকে auto-exclude এবং re-review queue-তে ফেরে
- Immutable `ContentReviewRevision` history; migration ২৭/২৭
- Filter-aware 1,157-row Expert CSV export with formula-injection protection
- Live current→stale→re-reviewed flow, two revisions ও cleanup verified; content write 0
- Web unit এখন 70/70; CSV import intentionally omitted to prevent unsafe bulk apply
- বিস্তারিত: [`ACADEMIC_REVIEW_INTEGRITY.md`](./ACADEMIC_REVIEW_INTEGRITY.md)

## Academic disaster-recovery extension

- Admin/CLI content-only snapshot for subjects/chapters/topics/908 MCQ/64 CQ/badges/review evidence
- Users/auth/sessions/attempts/Focus/native/audit/chat tables explicit exclusion
- Deterministic SHA-256 manifest, section counts ও academic reference graph verifier
- Tamper/count/orphan/forbidden-key failure with non-zero exit; spreadsheet/content secrets নেই
- Live 2.03 MiB snapshot: 1,157 items + 14 badges, checksum/reference PASS; deliberate tamper rejected
- Generated backup test files cleaned; no restore/apply/delete automation
- Web unit এখন 76/76; full provider backup/PITR remains external operational requirement
- বিস্তারিত: [`DISASTER_RECOVERY.md`](./DISASTER_RECOVERY.md)

## Release readiness preflight extension

- Offline/live/strict preflight modes; `DEPLOY_READY` / `LOCAL_READY` / `BLOCKED`
- 875 source files + critical configs + 27 migrations deterministic SHA-256 manifest
- Live migration/content/blocker/stale-review/snapshot/dependency/backup hygiene checks
- Final gate: 20 pass, 1 manual-review warning, 0 fail → LOCAL_READY
- Strict external-pending gate expected exit 1; no deployment performed
- CI read-only permission/concurrency, offline preflight artifact, Android test+build+lint, production audit, real Release Gate
- Placeholder Deploy Preview job removed
- Web unit এখন 81/81; build 206/206
- বিস্তারিত: [`RELEASE_READINESS.md`](./RELEASE_READINESS.md)

## Performance & database reliability extension

- Live 75 foreign key reverse-index audit; before missing 11, after coverage 75/75
- 11 reverse-FK + 7 critical range/order/feed indexes; migrations 28/29
- Admin Analytics row transfer → PostgreSQL groupBy aggregation
- Forum feed + Admin Reports server pagination; current-page vote aggregation
- Audit action dictionary DB groupBy
- EXPLAIN DB execution < 1 ms critical paths; plan budget failures 0
- Static 234 findMany scan; high-volume global unbounded risk 0
- Remote sandbox round-trip p50 ~478–496 ms, indicating network/pool—not DB execution—dominance
- Strict performance audit PASS; web unit 86/86
- বিস্তারিত: [`PERFORMANCE_DATABASE_RELIABILITY.md`](./PERFORMANCE_DATABASE_RELIABILITY.md)

## Security & abuse testing 2.0 extension

- 240 API route manifest; Admin guard/private auth/private mutation gaps all 0
- Proxy-level 240/240 API rate baseline; route-specific stricter limits retained
- Browser mutation same/configured Origin guard; service-to-service missing-Origin auth path retained
- Next proxy + declared Content-Length 25 MB absolute cap; shared 1/8 MB guards
- CSP Report-Only + COOP/Origin-Agent/DNS/CrossDomain security headers
- Raw unsafe query whitelist only parameterized pgvector file; hard-coded key patterns 0
- Strict API security audit PASS; CI manifest artifact
- Web unit এখন 93/93; no data write
- বিস্তারিত: [`SECURITY_ABUSE_TESTING_2.md`](./SECURITY_ABUSE_TESTING_2.md)

## Recommended commands

```bash
npm ci
npx prisma generate
npm run type-check
npm run lint
npm run test:run
npm run test:logic
npm run test:seed
npm audit --omit=dev
npm run build
```

Android configuration check, Node 22 দিয়ে:

```bash
npx cap sync android
npx cap doctor
```
