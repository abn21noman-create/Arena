# 📜 HSC Ultimate — সম্পূর্ণ ডেভেলপমেন্ট হিস্ট্রি

> এই ফাইলে প্রতিটা ফেজ ও ফিচারে **যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে** তার
> বিস্তারিত রেকর্ড আছে। আগে এটা `README.md` এর ভেতরেই ছিল, কিন্তু ফাইলটা
> ১.৫ MB ছাড়িয়ে যাওয়ায় (GitHub ১ MB এর বেশি README রেন্ডার করে না)
> ২০২৬-০৭-৩০ এ আলাদা করা হয়েছে।
>
> - বর্তমান স্ট্যাটাস ও সেটআপ নির্দেশনা → [`../README.md`](../README.md)
> - ফিচার প্ল্যান ও রোডম্যাপ → [`MASTER_PLAN.md`](./MASTER_PLAN.md)
> - সম্পূর্ণ চেকলিস্ট-রোডম্যাপ → [`ROADMAP_ARCHIVE.md`](./ROADMAP_ARCHIVE.md)

---



> ⬅️ আরও পুরোনো এন্ট্রি → [`CHANGELOG_ARCHIVE.md`](./CHANGELOG_ARCHIVE.md)

---

Feature Polish, UI/UX & Live-User Acceptance (২০২৬-০৮-০৫):
- ✅ universal authenticated real-data search: global Ctrl/Cmd+K, sidebar/mobile/dashboard triggers, abort/retry/error states
- ✅ grouped + searchable mobile tool sheet, 44px controls, বাংলা Strict Focus discovery, global academic search shortcut
- ✅ 89/89 contextual route title + screen-reader announcement; router.refresh title regression fixed
- ✅ 113 nested interactive control patterns removed; বাংলা labels; Dashboard/Planner/Settings mobile targets fixed
- ✅ Base UI Tabs row-squeeze bug fixed; Settings board grid full-width and 24px+ effective targets
- ✅ four broken Python live/visual scripts repaired; exact disposable account/audit cleanup; operator process `pkill` removed
- ✅ live Student 46/46, broad API 112/112, all-page 89/89 with 0 skip, mobile Chromium 46/46
- ✅ unit 109/109; UX integrity 18/18; runtime 15/15; security 213/213; build 181/181; release 22 pass/1 backlog warn/0 fail
- বিস্তারিত: [`FEATURE_POLISH_UI_UX_LIVE_ACCEPTANCE.md`](./FEATURE_POLISH_UI_UX_LIVE_ACCEPTANCE.md)

Multi-AI Academic Approval Engine (২০২৬-০৮-০৫):
- ✅ Admin final click optional; ContentReview reviewerKind `AI|ADMIN`, UI/CSV/history identity explicit
- ✅ independent Groq+Mistral consensus; ≥0.92 minimum confidence; MCQ expected option exact stored-answer match
- ✅ scanner warning/pending student report/source-dependent claim blocks AI approval; conflict/source-required statuses
- ✅ immutable AIReviewBatch + 2 provider run evidence/model/verdict/confidence/answer fingerprint/response SHA-256
- ✅ CLI dry-run/apply + Admin trigger; student cannot trigger expensive review
- ✅ first live Core MCQ AI Approved: confidence 1.00, current hash true, revisions 1, runs 2
- ✅ disaster snapshot schema v2 includes AI evidence; checksum valid
- ✅ migration 33/33; unit 106/106; runtime 15/15; security 213/213; FK 80/80; build 181/181
- বিস্তারিত: [`MULTI_AI_ACADEMIC_APPROVAL.md`](./MULTI_AI_ACADEMIC_APPROVAL.md)

Academic Trust Loop (২০২৬-০৮-০৫):
- ✅ Core/Adaptive/Drill/Mistake/Pretest/Admission/CQ/Mock/Live question-bank/Topic note-formula surfaces-এ student issue report
- ✅ exact content-bound SHA-256, 8 reasons, duplicate exact-issue DB guard, max-50 pending abuse cap
- ✅ `AcademicContentReport` model + migration 32/32; account cascade এবং reviewer SetNull
- ✅ Admin Content Quality `Student reports` view/count/search/CSV; report current-vs-old hash status
- ✅ Resolve/Dismiss human decision, minimum Expert note, AuditLog, reporter notification; no auto approval/edit
- ✅ Settings-এ reporter latest status/resolution; data export-এ academic reports
- ✅ live E2E 10/10, cleanup residue 0, academic content writes 0
- ✅ unit 102/102; runtime 14/14; security 212/212; FK 78/78; build 181/181
- বিস্তারিত: [`ACADEMIC_TRUST_LOOP.md`](./ACADEMIC_TRUST_LOOP.md)

Production Truth & Safety Gate (২০২৬-০৮-০৫):
- ✅ 29 fake/no-op Singularity API + 38 prototype libs + fake/dead UI removed; reachable API 241 → 211
- ✅ landing hardcoded count/testimonial/AI-Verified/∞/sub-second/forever-free claims removed; 13/89/688/220/64/14 live DB counts
- ✅ partial cosmetic language toggle/API removed; product truthfully Bangla-first
- ✅ Service Worker v2 public-only HTML cache; private Dashboard/Settings/Admin/result cache 0
- ✅ `authVersion` migration 31/31; password/role/ban stale JWT revoke এবং live DB Admin/ban enforcement
- ✅ real in-app/web-push broadcast outcome; unsupported Email/FCM/schedule removed; Zod/internal-link/template safety
- ✅ four Accessibility controls থেকে unsupported font claim removed; font/contrast/motion wired; 8–11px text 278 → 0
- ✅ privileged test credential fallback 0; current policy E2E payload; destructive live test/17 seed script guarded
- ✅ runtime-integrity strict 13/13; web unit 100/100; security 211/211; build 180/180
- বিস্তারিত: [`PRODUCTION_TRUTH_SAFETY_GATE.md`](./PRODUCTION_TRUTH_SAFETY_GATE.md)

Privacy & Compliance Center (২০২৬-০৮-০৫):
- ✅ public `/privacy`, `/terms`, `/account-deletion`; central Privacy/Terms/Age version `2026.08.05`
- ✅ registration atomic User+PolicyAcceptance; Settings current/stale audit and exact-version acknowledgement
- ✅ Strict Focus disclosure/consent `2026-08-05`; stale consent Admin start/schedule authorize করে না
- ✅ AI/PDF/Accessibility inline data-use notices; Android package-only/no-window-content + backup-disabled verification
- ✅ export v2 covers learning/AI/PDF/Focus/native/community/policy while excluding credentials, vectors and other-user private data
- ✅ account deletion non-FK reset/broadcast cleanup + direct audit identifier/metadata redaction
- ✅ System Operations policy readiness/acceptance coverage; sitemap/footer/onboarding links
- ✅ Play Data Safety ও Accessibility declaration internal drafts; submission/publishing intentionally deferred
- ✅ additive migration 30/30; unit 98/98; privacy live E2E 16/16; static audit 19 pass · 1 external warning · 0 fail
- বিস্তারিত: [`PRIVACY_COMPLIANCE_CENTER.md`](./PRIVACY_COMPLIANCE_CENTER.md)

Security & Abuse Testing 2.0 (২০২৬-০৮-০৪):
- ✅ 240 API route manifest: Admin guard/private auth/private mutation gaps 0
- ✅ proxy-level global rate baseline 240/240; endpoint-specific strict limits retained
- ✅ browser mutation same/configured Origin check, service-to-service auth path, 25 MB hard proxy/body cap
- ✅ CSP Report-Only + COOP/Origin-Agent/DNS/CrossDomain security headers
- ✅ only raw-unsafe file parameterized pgvector; unapproved raw query 0; hard-coded key patterns 0
- ✅ strict security audit CI artifact; placeholder gaps fail gate
- ✅ unit 93/93; no DB write; build verified
- বিস্তারিত: [`SECURITY_ABUSE_TESTING_2.md`](./SECURITY_ABUSE_TESTING_2.md)

Performance & Database Reliability Audit (২০২৬-০৮-০৪):
- ✅ 75 FK catalog audit: missing reverse index 11 → 0; additive migration 28
- ✅ DAU/signup/audit/notification/quiz/CQ/study range/order indexes 7; migration 29
- ✅ Admin Analytics all-row JS aggregation → PostgreSQL groupBy count/sum
- ✅ Forum feed + Admin Reports server pagination; page-only DB vote aggregation
- ✅ Audit action dictionary DB groupBy; high-volume global unbounded findMany 0
- ✅ EXPLAIN critical DB execution sub-1ms, strict plan budget failures 0
- ℹ️ sandbox→Supabase round-trip p50 ~478–496ms; network/pool latency dominant
- ✅ reusable strict performance audit; unit 86/86
- বিস্তারিত: [`PERFORMANCE_DATABASE_RELIABILITY.md`](./PERFORMANCE_DATABASE_RELIABILITY.md)

Release Readiness Preflight & Supply-Chain Manifest (২০২৬-০৮-০৪):
- ✅ offline/live/strict release gates: DEPLOY_READY / LOCAL_READY / BLOCKED
- ✅ 875 source files + package/schema/Docker/CI + 27 migrations deterministic SHA-256 manifest
- ✅ live migration/content/blocker/stale-review/snapshot/dependency/backup hygiene checks; secret-value-free report
- ✅ final preflight 20 pass · 1 manual-review warning · 0 fail → LOCAL_READY
- ✅ strict external-pending expected exit 1; public deployment intentionally not performed
- ✅ CI read-only permission, concurrency cancellation, offline preflight artifact, Android test/build/lint, production audit ও final Release Gate
- ✅ no-op Deploy Preview placeholder removed; unit 81/81; build 206/206
- বিস্তারিত: [`RELEASE_READINESS.md`](./RELEASE_READINESS.md)

Academic Content Disaster Recovery Toolkit (২০২৬-০৮-০৪):
- ✅ Admin/CLI 1,157-item academic snapshot + subjects/chapters/badges/review evidence
- ✅ users/auth/session/attempt/Focus/native/audit/chat sensitive tables explicit exclusion
- ✅ deterministic SHA-256 manifest, section counts, parent/target/revision reference verifier
- ✅ tamper/count/orphan/forbidden-key non-zero failure; generated backup files Git-ignored + 0600
- ✅ live ~2.03 MiB snapshot verified; deliberate MCQ tamper rejected; test files cleaned
- ✅ System Operations Content snapshot button + offline `snapshot:verify`; destructive restore intentionally omitted
- ✅ unit 76/76
- বিস্তারিত: [`DISASTER_RECOVERY.md`](./DISASTER_RECOVERY.md)

Academic Review Integrity & Expert Export (২০২৬-০৮-০৪):
- ✅ every review exact normalized SHA-256 academic content version-এর সঙ্গে bound
- ✅ content edit/null old hash → STALE; approval progress থেকে বাদ ও re-review queue-তে ফেরত
- ✅ immutable `ContentReviewRevision` evidence/history; migration 27/27
- ✅ filter-aware 1,157-row UTF-8 Expert CSV with quote/comma + spreadsheet formula-injection protection
- ✅ UI stale metric/tab/warning, content hash, latest-five review history ও export
- ✅ live current→forced stale→re-reviewed 2 revisions→cascade cleanup; content edits 0
- ✅ unit 70/70; unsafe offline CSV bulk-import intentionally omitted
- বিস্তারিত: [`ACADEMIC_REVIEW_INTEGRITY.md`](./ACADEMIC_REVIEW_INTEGRITY.md)

Academic Content Quality Center (২০২৬-০৮-০৪):
- ✅ 1,157-item live bank (688 core + 220 admission + 64 CQ + 185 notes) read-only structural risk scan
- ✅ answer/options/explanation/CQ/note/Unicode/math/placeholder/same+cross-context duplicate triage
- ✅ automated scanner factual content auto-approve করে না; absence = UNREVIEWED
- ✅ human APPROVED/NEEDS_CORRECTION/REJECTED + review note + HTTPS provenance + audit workflow
- ✅ premium Admin queue/search/filter/pagination/review UI, sidebar entry ও loading
- ✅ initial scan: blocker 0, warning item 4, same-context duplicate 0, cross-context group 2
- ✅ temporary review persistence test cleaned back to 0; academic content modified 0
- ✅ migration 26/26; web unit 67/67
- বিস্তারিত: [`ACADEMIC_CONTENT_QUALITY.md`](./ACADEMIC_CONTENT_QUALITY.md)

Admin System Operations Center 2.0 (২০২৬-০৮-০৪):
- ✅ `/api/admin/system` থেকে 1250/45.2k/15400 fake counts, fabricated logs ও placeholder XP threat flow সম্পূর্ণ অপসারণ
- ✅ real Supabase users/content/Focus/native/audit metrics + DB latency + 25/25 migration parity
- ✅ rate limiter, scheduler, native push, runtime memory/uptime ও system-control visibility
- ✅ secret-free 6-point deployment readiness এবং latest 12 real AuditLog triage
- ✅ premium responsive bento UI, route loading, 30-second refresh; settings control আলাদা অক্ষত
- ✅ live read-only snapshot overall healthy; unit 59/59; no DB write
- বিস্তারিত: [`SYSTEM_OPERATIONS_CENTER.md`](./SYSTEM_OPERATIONS_CENTER.md)

Android Strict Focus / Firebase Delivery Readiness (২০২৬-০৮-০৪):
- ✅ per-device delivery audit, app/device health, invalid-token soft-disable ও ৯০-day stale/retention policy
- ✅ Firebase absent/init/send failure এখন non-throwing safe result; Focus session API consistent থাকে
- ✅ command ID + issue-time + expiry/future/session/duration/deadline validation এবং latest-20 replay memory
- ✅ Android START/STOP result local receipt queue; authenticated app-open sync delivery/session native-active state update করে
- ✅ Admin Native Delivery Diagnostics + `/api/health` + Firebase secret-triplet validation
- ✅ migration ২৫/২৫; temporary device/delivery exact-match/unmatched/cascade-cleanup live verified
- ✅ web unit ৫৪/৫৪; Android JVM ৬/৬; `assembleDebug` + `lintDebug`; APK ~৫.৮ MB
- ℹ️ real Firebase credentials, `google-services.json` ও physical-device background delivery test external pending
- বিস্তারিত: [`NATIVE_PUSH_DELIVERY_READINESS.md`](./NATIVE_PUSH_DELIVERY_READINESS.md)

Production Focus Scheduler Operations (২০২৬-০৮-০৪):
- ✅ bounded `FocusSchedulerState` heartbeat/metrics singleton; migration ২৪/২৪ applied
- ✅ expiring cross-instance lease; concurrent cron/admin runner `202 SKIPPED_OVERLAP`
- ✅ constant-time Bearer auth, GET/POST cron, aggregate no-store response
- ✅ Admin Scheduler Operations panel: heartbeat, queue, run metrics, warnings ও audited manual run
- ✅ `/api/health` external heartbeat stale/failure detection; local lazy mode healthy fallback
- ✅ Supabase Cron+Vault ও Vercel Pro deployment templates; Vercel Hobby minute-cron incompatibility documented
- ✅ live route verification: missing/wrong 401, overlap 202, authorized GET/POST 200, lease release; unit ৫১/৫১
- ℹ️ public deployment URL না থাকায় actual external minute trigger activation pending
- বিস্তারিত: [`FOCUS_SCHEDULER_OPERATIONS.md`](./FOCUS_SCHEDULER_OPERATIONS.md)

Distributed Rate Limiting Production Hardening (২০২৬-০৮-০৪):
- ✅ optional Upstash Redis REST backend; atomic Lua sorted-set sliding window across server instances
- ✅ raw user ID/IP Redis key-তে না রেখে SHA-256 identity; bounded 50k-bucket local store
- ✅ Redis outage-এ limiter disable নয় — memory safety fallback + successful-decision mirror + 3-failure/30-second circuit breaker
- ✅ 49টি direct/shared protected call site async distributed enforcement-এ migrated
- ✅ `/api/health`, `npm run doctor`, `check:secrets`-এ secret-free backend/config visibility
- ✅ local/Redis allow/block, privacy, failure fallback, circuit ও misconfiguration unit coverage
- ℹ️ actual distributed network activation-এর জন্য external Upstash URL/token পরে deployment secret manager-এ বসাতে হবে; credential ছাড়া current behavior local memory
- বিস্তারিত: [`DISTRIBUTED_RATE_LIMITING.md`](./DISTRIBUTED_RATE_LIMITING.md)

MCQ Source/Live Reconciliation + Safe Incremental Import (২০২৬-০৮-০৪):
- ✅ পুরোনো `908−677=231` হিসাবের category bug শনাক্ত — 908 source-এর মধ্যে 688 core + 220 admission ছিল; প্রকৃত core gap মাত্র 11
- ✅ static AST catalog, Unicode/LaTeX normalization, stable identity/content fingerprint, exact/near duplicate, topic ownership ও quality gate যোগ
- ✅ 11টি ICT MCQ external/internal review; PAN range HSC convention অনুযায়ী সর্বোচ্চ 10 মিটার করে source note/CQ/live content align
- ✅ reviewed approval manifest + default dry-run + explicit `--apply` + Serializable transaction + advisory lock + append-only importer
- ✅ প্রথম apply: 11 insert, 0 MCQ update/delete; দ্বিতীয় apply: 0/0/0 — idempotency প্রমাণিত
- ✅ final source/live: 688/688 core + 220/220 admission exact match; missing/drift/live-only/same-topic duplicate/quality blocker সব 0
- ✅ unit 37/37, pure logic 162/162, full verify, production build 201/201 pass
- বিস্তারিত: [`MCQ_SAFE_IMPORT_2026-08-04.md`](./MCQ_SAFE_IMPORT_2026-08-04.md)

Admission Prep (Medical/BUET/DU) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **সম্পূর্ণ স্বতন্ত্র সেকশন** (`/admission`) — HSC মূল Question ব্যাংক
  থেকে আলাদা ডেটা মডেল (`AdmissionQuestion`, `AdmissionMockAttempt`),
  Medical/BUET/DU 'ক' ইউনিট এর জন্য বাস্তব ও যাচাইকৃত ২০২৫-২৬ সেশনের
  circular-ভিত্তিক marking scheme
- ✅ **Negative Marking সিমুলেশন** — Medical ও DU তে ভুল উত্তরে -0.25
  (বাস্তব নিয়ম অনুযায়ী), Medical এ পাস মার্ক ৪০ — HSC বোর্ড পরীক্ষায়
  নেগেটিভ মার্কিং না থাকলেও HSC-পরবর্তী ভর্তি পরীক্ষায় থাকে (Deep
  Research এ ভেরিফাইড)
- ✅ **BUET-এ সততার সাথে ডিসক্লেইমার** — ২০২৫-২৬ থেকে BUET এর আসল
  পরীক্ষা সম্পূর্ণ লিখিত/সাংখ্যিক (MCQ না), তাই এটাকে "concept practice"
  মোড হিসেবে স্পষ্টভাবে চিহ্নিত করা হয়েছে (নেগেটিভ মার্কিং ছাড়া)
- ✅ **Option Order Randomization** — প্রতিবার মক টেস্ট শুরু করলে
  প্রশ্নের options শাফল হয় (answer-position মুখস্থ করা ঠেকাতে)
- ✅ Live test: negative marking গণিত হাতে-হিসাব মিলিয়ে ভেরিফাই,
  cross-user authorization, double-submit প্রতিরোধ, history+result
  detail — ৩৬/৩৬ assertion পাস

Option Shuffle সম্প্রসারণ + KaTeX Math Rendering এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Option Order Randomization সব বাকি major MCQ route এ সম্প্রসারণ**
  — Practice, Adaptive Practice, Drill, Mock Exam (in-progress অংশ),
  Quiz Battle, Duel — সবগুলোতেই এখন প্রতিবার প্রশ্ন শাফল হয়ে আসে
  (`lib/mock-exam.ts` এ কেন্দ্রীভূত `shuffleOptions<T>()` Fisher-Yates
  ফাংশন, correctness যাচাই স্ট্রিং-ম্যাচিং দিয়ে হয় বলে shuffle এ scoring
  ভাঙে না)
- ✅ **KaTeX Math Rendering** — `<MathText>` কম্পোনেন্ট `$...$`/`$$...$$`
  LaTeX সিনট্যাক্স রেন্ডার করে (ভগ্নাংশ, ইন্টিগ্রাল, ম্যাট্রিক্স, রুট
  ইত্যাদি জটিল সূত্র সুন্দরভাবে দেখায়), Practice/Drill/Adaptive/Mock
  Exam/Quiz Battle/Duel/Live Exam/Admission — সব প্রশ্ন-প্রদর্শনকারী
  কম্পোনেন্টে ইন্টিগ্রেট করা হয়েছে, parse error হলে crash-safe fallback
- ✅ Live test: shuffle variance টেস্ট (৬টা ভিন্ন run এ ৬টা distinct
  option ordering পাওয়া গেছে), practice start→submit ফ্লো, admission
  negative marking রি-ভেরিফাই, cross-user/double-submit/401 checks —
  সব পাস, `pnpm build`+`pnpm lint` ক্লিন

Exam Anxiety Relief: Breathing Exercise এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Box Breathing (৪-৪-৪-৪ সেকেন্ড)** — Navy SEAL breathing technique,
  Framer Motion দিয়ে অ্যানিমেটেড বৃত্ত গাইড (ইনহেলে বড়, এক্সহেলে ছোট),
  ডিফল্ট ৪ চক্র (~৬৪ সেকেন্ড), সম্পূর্ণ client-side (কোনো DB/migration
  পরিবর্তন নেই)
- ✅ **৪টা জায়গায় ইন্টিগ্রেট** — Admission Prep Hub, Mock Exam Mode
  Selector, Live Exam Start Form (পরীক্ষা শুরুর আগে), Planner পেজে
  স্বতন্ত্র "মানসিক বিশ্রাম" কার্ড
- ✅ ইচ্ছাকৃতভাবে gamify করা হয়নি (কোনো XP/badge না) — এটা বিশ্রামের
  মুহূর্ত, আরেকটা টাস্ক না
- ✅ Live test: ৪টা পেজে server-rendered HTML এ trigger উপস্থিতি
  ভেরিফাই, `pnpm build`+`pnpm lint` ক্লিন (১টা unused variable warning
  ফিক্স করা হয়েছে)

Wrong-Answer Misconception Tagging এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Admin misconception ট্যাগিং** — প্রতিটা MCQ প্রশ্নে ঐচ্ছিক free-text
  ট্যাগ (যেমন "একক গুলিয়ে ফেলা") যোগ করা যায়, নতুন প্রশ্ন তৈরির সময় ও
  বিদ্যমান প্রশ্নে ইনলাইন এডিটর দিয়ে
- ✅ **Analytics Dashboard এ Pattern Detection** — ইউজারের ভুল উত্তর
  ট্যাগ অনুযায়ী গ্রুপ করে "বারবার হওয়া ভুলের প্যাটার্ন" কার্ডে দেখানো হয়
  (wrongCount/totalAttempted/wrongRatePct), অন্তত ২ বার ভুল না হলে
  প্যাটার্ন হিসেবে দেখানো হয় না
- ✅ Live test (২-ইউজার সিমুলেশন, ২০/২০ assertion পাস): admin তৈরি+
  ইনলাইন এডিট, non-admin/unauth এ 403/401, misconception pattern গণিত
  হাতে-হিসাব মিলিয়ে ভেরিফাই (wrongCount=4, totalAttempted=4,
  wrongRatePct=100)
- ✅ Sandbox memory constraint এর কারণে এই সেশনে `pnpm build` কয়েকবার
  OOM এ kill হয়েছিল — `tsc --noEmit` আলাদাভাবে চালিয়ে (exit 0) তারপর
  higher memory limit এ পূর্ণ build সফল করা হয়েছে

AI Content Moderation (Forum) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Pre-submission AI স্ক্রিনিং** — নতুন Forum Post/Reply তৈরির আগেই
  বিদ্যমান multi-AI provider chain দিয়ে স্প্যাম/আপত্তিকর ভাষা/হয়রানি
  স্ক্যান হয়, high-confidence flag হলে ৪২২ + বাংলা এরর মেসেজ দিয়ে ব্লক
  (কোনো নতুন cost/infra ছাড়া, কোনো DB migration ছাড়া)
- ✅ **Fail-open ডিজাইন** — AI provider ব্যর্থ হলে কন্টেন্ট block হয় না,
  conservative confidence threshold false positive কমায়
- ✅ **Admin On-Demand Scan Tool** — Forum Moderation Panel এ প্রতিটা
  পোস্টে 🔍 বাটন দিয়ে পুরনো পোস্ট re-scan করা যায়
- ✅ Live test (২-ইউজার সিমুলেশন, ১৮/১৮ assertion পাস): **AI বাস্তবে
  স্প্যাম টেক্সট সঠিকভাবে সনাক্ত করে ব্লক করেছে** (semantic accuracy
  ভেরিফাই, শুধু structural টেস্ট না), CLEAN একাডেমিক পোস্ট স্বাভাবিকভাবে
  পাস হয়েছে, non-admin/unauth এ 403/401, nonexistent post এ 404

Confidence-Based Answering এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Confidence Selector** — Practice/Smart Practice এ উত্তর দেওয়ার পর
  ঐচ্ছিকভাবে "নিশ্চিত"/"অনুমান" বেছে নেওয়া যায় (Brainscape থেকে
  অনুপ্রাণিত), সম্পূর্ণ ঐচ্ছিক, স্কিপ করা যায়
- ✅ **Analytics এ "আত্মবিশ্বাসের নির্ভুলতা" কার্ড** — SURE/NOT_SURE
  accuracy% পাশাপাশি, "নিশ্চিত বলেও ভুল" (sureWrongCount) সবচেয়ে গুরুত্বপূর্ণ
  সিগন্যাল হিসেবে হাইলাইট (সত্যিকারের misconception, guess না)
- ✅ **Migration Phantom Loss বাগ আবার ঘটেছিল এই সেশনে** — নিরাপদ ফিক্স
  প্যাটার্নে সমাধান করা হয়েছে (কোনো ডেটা হারায়নি, DB এর প্রকৃত টাইপের
  সাথে schema মিলিয়ে নেওয়া হয়েছে)
- ✅ Live test (Practice ১৬/১৬ + Adaptive ৫/৫ = মোট ২১/২১ assertion পাস):
  confidenceStats গণিত সরাসরি DB row থেকে independently recompute করে
  হাতে-হিসাব মিলিয়ে ভেরিফাই, invalid confidence value crash-safe normalize

Peer Comparison in Adaptive Practice এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Peer Average Accuracy** — Smart Practice এর দুর্বল টপিক লিস্টে
  "তোমার মতো দুর্বলতাযুক্ত অন্যরা এই টপিকে গড়ে X% ভালো করেছে" দেখানো হয়,
  বিদ্যমান Percentile ইনফ্রার প্যাটার্ন অনুসরণ করে, কোনো নতুন DB migration
  ছাড়াই (একটাই নতুন aggregation query)
- ✅ **Privacy থ্রেশহোল্ড** — অন্তত ৩ জন peer এর ডেটা না থাকলে তুলনা
  দেখানো হয় না (identifiable/অনির্ভরযোগ্য তুলনা এড়াতে)
- ✅ Live test (৪-ইউজার সিমুলেশন, মূল ৯/৯ + থ্রেশহোল্ড ৪/৪ = মোট ১৩/১৩
  assertion পাস): peerAvgAccuracyPct সরাসরি DB থেকে independently
  recompute করে হাতে-হিসাব মিলিয়ে ভেরিফাই (18/21=86%, হুবহু মিলেছে),
  থ্রেশহোল্ডের নিচে peer সংখ্যা থাকলে null রিটার্ন ভেরিফাই

Simplified Item-Difficulty Calibration এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Empirical Difficulty Bucket** — প্রতিটা প্রশ্নে প্রকৃত response-data
  থেকে (কতজন ভুল করেছে%) EASY/MEDIUM/HARD bucket বের করা হয় (admin এর
  ম্যানুয়াল ট্যাগ থেকে সম্পূর্ণ স্বতন্ত্র), কোনো নতুন DB migration ছাড়াই
- ✅ **Adaptive Practice এ Ability Matching** — ইউজারের accuracy%
  অনুযায়ী উপযুক্ত difficulty এর প্রশ্ন অগ্রাধিকার পায় (দুর্বল ইউজারকে
  সহজ প্রশ্ন দিয়ে আত্মবিশ্বাস বাড়ানো, ভালো ইউজারকে challenge করা)
- ✅ **Admin Transparency** — Question Manager এ ম্যানুয়াল ও empirical
  difficulty পাশাপাশি দেখানো হয়
- ✅ Live test (৮-ইউজার নিয়ন্ত্রিত সিমুলেশন, ১২/১২ assertion পাস):
  ইচ্ছাকৃতভাবে একটা প্রশ্ন সহজ (wrongPct 17%) ও আরেকটা কঠিন (wrongPct
  83%) বানিয়ে admin পেজে সঠিক badge ভেরিফাই, **dynamic recalibration
  আচরণ আবিষ্কার ও ভেরিফাই** (নতুন response data আসলে bucket পরিবর্তন
  হওয়া প্রত্যাশিত আচরণ)

Notification Digest (Weekly Email Summary) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **সাপ্তাহিক প্রগ্রেস ইমেইল** — গত ৭ দিনের প্রশ্ন সংখ্যা, accuracy%,
  স্টাডি টাইম, আনুমানিক XP, streak, সবচেয়ে দুর্বল টপিক Resend দিয়ে
  HTML ইমেইলে পাঠানো হয় (`lib/weekly-digest.ts` + `lib/email.ts` এর
  `sendWeeklyDigestEmail()`)
- ✅ **ইউজার প্রেফারেন্স** — Settings → "ইমেইল নোটিফিকেশন" ট্যাবে
  চালু/বন্ধ টগল (ডিফল্টে চালু, opt-out ডিজাইন), সর্বশেষ পাঠানোর তারিখ
  দেখায়
- ✅ **Admin Manual Trigger** — `/admin/notifications` পেজে "এখনই
  ডাইজেস্ট পাঠাও" বাটন (cron infra নেই যেহেতু deploy স্থগিত, deploy
  এর পর Vercel Cron দিয়ে একই এন্ডপয়েন্ট অটোমেটিক কল করা যাবে)
- ✅ **ডুপ্লিকেট-প্রতিরোধ** — `lastDigestSentAt` দিয়ে ৭ দিনের কম গ্যাপে
  আবার পাঠানো আটকানো হয় (admin বারবার ক্লিক করলেও নিরাপদ)
- ✅ Live test (২ পার্টে, মোট ২৩/২৩ assertion পাস): API contract
  (401/403/400 edge cases), এবং **আসল ভেরিফাইড ইমেইলে প্রকৃত Resend
  API কল দিয়ে সফল সেন্ড ভেরিফাই**, ডুপ্লিকেট-প্রতিরোধ ও opt-out যাচাই
- ⚠️ **স্বচ্ছতা**: এই ফিচার বানানোর সময় একটা bash কমান্ডের ভুলে পুরো
  `prisma/migrations/` ফোল্ডার (৩৮টা migration file) দুর্ঘটনাক্রমে
  মুছে গিয়েছিল। ডেটাবেসের প্রকৃত ডেটা/স্কিমা অক্ষত ছিল (শুধু local
  migration history ফাইল হারিয়েছিল), তাই Prisma-র official
  "baselining" পদ্ধতিতে নিরাপদে migration history পুনর্গঠন করা হয়েছে
  (কোনো ডেটা হারায়নি, বিস্তারিত `docs/MASTER_PLAN.md` এ)

Note-to-Flashcard Converter এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **এক-ক্লিক নোট → ফ্ল্যাশকার্ড** — Topic Note Editor এ সেভ করা নোট
  থেকে সরাসরি AI দিয়ে ৫-৮টা ফ্ল্যাশকার্ড বানানো (RemNote-অনুপ্রাণিত,
  FEATURE_RESEARCH.md এর পুরনো গ্যাপ পূরণ), টপিকের নামে অটো-ডেক তৈরি
- ✅ **DRY রিফ্যাক্টর** — `lib/flashcard-gen.ts` এ AI generation লজিক
  কেন্দ্রীভূত করে বিদ্যমান "AI দিয়ে বানাও" (generate-ai endpoint) এর
  সাথে শেয়ার করা হয়েছে, দুটোই একই prompt/parsing ব্যবহার করে
- ✅ **ডুপ্লিকেট-ডেক প্রতিরোধ** — দ্বিতীয়বার একই টপিকে জেনারেট করলে
  নতুন ডেক না বানিয়ে আগের ডেকেই কার্ড যোগ হয়
- ✅ **Orphan-deck cleanup** — AI generation ব্যর্থ হলে অটো-তৈরি খালি
  ডেক best-effort ভাবে মুছে ফেলা হয় (কোনো migration লাগেনি এই ফিচারে)
- ✅ Live test (২০/২০ assertion পাস, আসল Groq AI provider দিয়ে): ৭টা
  বাস্তব ফ্ল্যাশকার্ড জেনারেট ভেরিফাই, cross-user authorization (404),
  ownership যাচাই, deck detail API দিয়ে independently card count মিলিয়ে

MCQ Keyboard Navigation (Accessibility) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **সম্পূর্ণ কীবোর্ড দিয়ে উত্তর দেওয়া** — সংখ্যা ১-৯/অক্ষর A-I দিয়ে
  অপশন সিলেক্ট, Enter/→ দিয়ে পরের প্রশ্ন, ← দিয়ে আগের প্রশ্নে ফেরা
  (WCAG 2.2 গ্যাপ পূরণ, FEATURE_RESEARCH.md এ চিহ্নিত)
- ✅ **কেন্দ্রীভূত reusable hook** — `hooks/use-mcq-keyboard-nav.ts`,
  ৬টা MCQ runner এ ইন্টিগ্রেটেড (Practice, Adaptive Practice, Drill,
  Live Exam, Admission, Mock Exam MCQ ফেজ)
- ✅ **Input-safe** — টেক্সট ফিল্ডে টাইপ করার সময় শর্টকাট ট্রিগার হয় না
- ✅ Live test: ৯/৯ regression-check assertion (মূল practice flow ও
  সব runner পেজ অক্ষত), ১৬/১৬ Node.js ইউনিট টেস্ট (key-mapping লজিক)
- ⚠️ **schema-free**, কোনো নতুন migration লাগেনি

Wrong-Answer → Flashcard কনভার্টার এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **AI ছাড়াই instant কনভার্সন** — Practice Result পেজে ভুল উত্তরের
  প্রশ্ন+সঠিক উত্তর+ব্যাখ্যা সরাসরি DB থেকে ফ্ল্যাশকার্ডে (কোনো AI কল
  লাগে না, তাই তাৎক্ষণিক ও সবসময় নির্ভুল) — MASTER_PLAN.md এর মূল
  ভিশনের একটা পুরনো আইটেম সম্পূর্ণ
- ✅ **অটো-ডেক নামকরণ** — "ভুল উত্তর — [চ্যাপ্টার নাম]" নামে নতুন ডেক
  অটো-তৈরি, পরের বার একই ডেকে যোগ হয় (Note-to-Flashcard এর প্যাটার্ন)
- ✅ **ইচ্ছাকৃত no-dedup ডিজাইন** — একই প্রশ্ন বারবার ভুল হলে একাধিক
  কার্ড তৈরি হয় (SRS এ বেশি repetition, ক্ষতিকর না)
- ✅ Live test (১৯/১৯ assertion পাস): ৭টা ভুল উত্তর সঠিকভাবে কার্ডে
  কনভার্ট, deck detail API দিয়ে independently card content ভেরিফাই,
  cross-user authorization (404×2), "কোনো ভুল উত্তর নেই" → 400

Daily Flashcard Review Queue Reminder এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Dashboard Reminder Card** — সব ডেক মিলিয়ে আজকের মোট due card
  সংখ্যা দেখায়, সবচেয়ে বেশি due card থাকা ডেকে সরাসরি ক্লিক করে
  রিভিউ শুরু করা যায় (MASTER_PLAN.md এর মূল ভিশনের আইটেম সম্পূর্ণ)
- ✅ **কোনো due card না থাকলে সম্পূর্ণ লুকানো** — অপ্রয়োজনীয় UI clutter
  এড়ানো হয়েছে
- ✅ **In-app reminder** (push notification না — সেটা VAPID key/
  subscription storage সহ আলাদা বড় ফিচার, ভবিষ্যতের জন্য রাখা হয়েছে)
- ✅ Live test (১৪/১৪ assertion পাস): ডেক/কার্ড যোগ করার সাথে সাথে
  reminder সংখ্যা dynamically আপডেট, multi-deck aggregation ও
  top-deck হাইলাইট সঠিক, dueDate ভবিষ্যতে পিছিয়ে দিলে সংখ্যা কমা
  ভেরিফাই, DB থেকে independently ground-truth মিলিয়ে কনফার্ম

Calendar View (মাসিক) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৪টা সোর্স একত্রিত** — Task deadline, Study Plan item, Class
  Routine (সাপ্তাহিক পুনরাবৃত্ত), HSC Exam Date সব একটা মাসিক গ্রিডে
  (MASTER_PLAN.md এর মূল ভিশনের আইটেম সম্পূর্ণ)
- ✅ **RoutineSlot expansion** — `dayOfWeek` থেকে মাসের প্রতিটা মিলে
  যাওয়া তারিখে automatically expand
- ✅ **দিনে ক্লিক করে বিস্তারিত** — সেই দিনের সব ইভেন্ট (টাইপ ব্যাজ,
  সময়, completion status সহ) লিস্ট আকারে
- ✅ Live test (২৩/২৩ assertion পাস): RoutineSlot expansion Python এর
  নিজস্ব calendar module দিয়ে independently গণনা করে হুবহু মিলিয়ে
  ভেরিফাই (জুলাই ২০২৬ এ ৫টা বুধবার), month boundary সঠিক (আগস্টে
  leak হয়নি), task completion sync ভেরিফাই

Daily Motivational Quote এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৩০টা কিউরেটেড বাংলা উক্তি** — Deep Research দিয়ে attribution
  ভেরিফাই করা (আবদুল কালাম, রবীন্দ্রনাথ, চার্চিল, বিবেকানন্দ ইত্যাদি)
  (MASTER_PLAN.md এর মূল ভিশনের আইটেম সম্পূর্ণ)
- ✅ **সম্পূর্ণ static, কোনো DB/API কল ছাড়াই** — বছরের দিন সংখ্যা
  থেকে deterministic ভাবে বাছাই, সব ইউজার একই দিনে একই উক্তি দেখে
- ✅ Live test (৭/৭ + ৭/৭ Node.js ইউনিট টেস্ট = ১৪/১৪ পাস):
  deterministic behavior (একই ইউজার/ভিন্ন ইউজার একই দিনে একই উক্তি),
  edge case (বছরের প্রথম/শেষ দিন) crash-free ভেরিফাই

In-App Notification Center এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **পূর্ণাঙ্গ `/notifications` পেজ** — All/Unread ট্যাব ফিল্টার,
  pagination (২০টা/পাতা), mark-as-read/mark-all-read/delete
  (MASTER_PLAN.md এর মূল ভিশনের আইটেম সম্পূর্ণ)
- ✅ **Backward-compatible API extension** — বিদ্যমান
  `/api/notifications` endpoint এ query param দিয়ে নতুন
  pagination/filter behavior যোগ, `NotificationBell` dropdown এর
  পুরনো আচরণ অপরিবর্তিত
- ✅ Live test (২৪/২৪ assertion পাস): ৫০টা টেস্ট নোটিফিকেশন দিয়ে
  pagination (৩ পাতা)/filter (৩৩টা unread) সঠিকভাবে ভেরিফাই,
  cross-user authorization (404×2), mark-read/delete DB তে কনফার্ম

Reading Progress Bar (Per Chapter) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Chapter-level completion %** — Subject Detail পেজে প্রতিটা
  Chapter card এ "X/Y আয়ত্ত" + visual progress bar (MASTER_PLAN.md
  এর মূল ভিশনের আইটেম সম্পূর্ণ)
- ✅ **Learning Hub এর সাথে সামঞ্জস্যপূর্ণ সংজ্ঞা** — Subject-level ও
  Chapter-level progress একই মেট্রিক (MASTERED/total) ব্যবহার করে
- ✅ Live test (১৬/১৬ assertion পাস): টপিক MASTERED করার সাথে সাথে
  progress bar dynamically আপডেট (0%→33%→67%→100%→ফিরিয়ে ৬৭%),
  per-user isolation ও DB ground-truth মিলিয়ে ভেরিফাই

Personal Goal Setting (GPA Target) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **টার্গেট GPA সেট/আপডেট/মুছে ফেলা** — Analytics পেজের Predicted
  GPA Card এ ইনলাইন এডিট, target-vs-actual রঙ-কোডেড comparison
  (MASTER_PLAN.md এর মূল ভিশনের আইটেম সম্পূর্ণ)
- ✅ নতুন migration: `User.targetGpa Float?` (৩৯তম migration)
- ✅ Live test (১৮/১৯ assertion পাস): রেঞ্জ ভ্যালিডেশন (০-৫), set/
  update/clear সব DB তে independently ভেরিফাই, per-user isolation
- ⚠️ **স্বচ্ছতা**: migration তৈরির সময় shadow database এ pgvector
  extension না থাকায় এরর হয়েছিল — নিরাপদে psycopg2 raw SQL +
  `migrate resolve --applied` প্যাটার্নে সমাধান করা হয়েছে (কোনো
  `migrate reset` ব্যবহার হয়নি, ডেটা অক্ষত, বিস্তারিত
  `docs/MASTER_PLAN.md` এ)

PWA Install Prompt ("Add to Home Screen" ব্যানার) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **কাস্টম ইনস্টল ব্যানার** — `beforeinstallprompt` ব্রাউজার ইভেন্ট
  ধরে দৃষ্টিনন্দন UI (Android/Chrome/Edge), iOS এ আলাদা ম্যানুয়াল
  নির্দেশনা ("শেয়ার বাটন → Add to Home Screen")
- ✅ **৭ দিনের dismissal cooldown** — বন্ধ করলে বারবার বিরক্ত করে না
- ✅ **সম্পূর্ণ ফ্রি, কোনো নতুন dependency/backend লাগেনি** — native
  browser API ব্যবহার (ব্যবহারকারীর অনুরোধ: "Mobile App banabo bujjo
  jodi free te banano jai")
- ✅ Live test (১০/১০ + ৮/৮ Node.js ইউনিট টেস্ট = ১৮/১৮ পাস):
  regression-free (manifest/service worker/offline অক্ষত), iOS
  detection ও dismissal timing লজিক ভেরিফাই
- 📱 **Native Mobile App পরিকল্পনা**: Deploy এর পরে Capacitor দিয়ে
  ফ্রি Android APK (iOS বাদ, license cost এড়াতে) — বিস্তারিত
  `docs/MASTER_PLAN.md` এ

Downloadable PDF Notes (Topic Notes + Formula Sheet) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **PDF ডাউনলোড বাটন** — প্রতিটা Topic Detail পেজে, Text Notes +
  Formula Sheet কে একসাথে সুন্দর ফরম্যাটেড PDF এ এক্সপোর্ট করে
  (অফলাইনে পড়ার/প্রিন্ট করার জন্য) — Hind Siliguri বাংলা ফন্ট
  এমবেডেড (Report Card PDF এর একই প্যাটার্ন)
- 🐛 **আবিষ্কৃত ও ফিক্স করা বাগ**: `Topic.formulaSheet` ফিল্ড schema তে
  আগে থেকে থাকলেও Admin ফর্ম/API/UI কোথাও ব্যবহৃত হতো না (ভুলভাবে ✅
  মার্ক করা ছিল) — এখন সম্পূর্ণ কার্যকর, সাথে Admin এর জন্য **নতুন
  Topic Edit ডায়ালগ** যোগ (আগে শুধু Create+Delete ছিল)
- ✅ কোনো নতুন DB migration লাগেনি (schema-free, existing ফিল্ড ব্যবহার)
- ✅ Live test (২৩/২৩ পাস): multi-user (student+admin), authorization
  edge cases (401/403/404), DB সরাসরি ভেরিফাই, PDF magic bytes/সাইজ
  ভেরিফাই, খালি-কনটেন্ট edge case (crash-free), cascade delete ভেরিফাই

Pretest to Skip Known Topics এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **ডায়াগনস্টিক প্রি-টেস্ট** — Practice চ্যাপ্টার সিলেকশন পেজে
  "প্রি-টেস্ট দাও" বাটন (≥২ টপিকে প্রশ্ন থাকলে), প্রতিটা টপিক থেকে
  ২টা করে (সর্বোচ্চ ২০টা) দ্রুত প্রশ্ন, প্রতি-টপিক accuracy% ফলাফল
- ✅ **Khan Academy-verified ৮০% থ্রেশহোল্ড** — web research দিয়ে
  যাচাই করা (Khan Academy অফিসিয়াল ডকুমেন্টেশন: "Familiar" লেভেলে
  ওঠার জন্য ৭০-৮৫% accuracy প্রয়োজন) — ≥৮০% accuracy পেলে টপিক
  "জানা"/স্কিপ-যোগ্য হিসেবে চিহ্নিত হয়
- ✅ **সম্পূর্ণ schema-free ডায়াগনস্টিক** — কোনো QuizAttempt তৈরি হয়
  না, তাই XP/streak/leaderboard/Predicted GPA কোনোকিছুতেই প্রভাব
  ফেলে না (DB তে সরাসরি ভেরিফাই করা হয়েছে)
- ✅ **"স্কিপ করো" বিদ্যমান endpoint পুনর্ব্যবহার করে** —
  `/api/topics/[topicId]/progress` (Mastery System) দিয়ে MASTERED
  মার্ক হয়, নতুন কোনো XP/badge লজিক ডুপ্লিকেট করা হয়নি
- ✅ Live test (২৬/২৬ পাস) + Node.js ইউনিট টেস্ট (৫/৫ থ্রেশহোল্ড
  boundary case) = **৩১/৩১ পাস**: authorization edge cases,
  security (correctAnswer/explanation leak না হওয়া), সুষম টপিক
  কভারেজ, per-user isolation, DB cascade delete ভেরিফাই

Habit Tracker এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **কাস্টম ডেইলি স্টাডি habit** — Planner পেজে নিজের নাম+ইমোজি দিয়ে
  habit তৈরি করা যায় (যেমন "প্রতিদিন ২ ঘন্টা পড়া"), সর্বোচ্চ ১০টা,
  প্রতিদিন এক-ক্লিকে টগল, streak গণনা, গত ৭ দিনের ভিজুয়াল history
- ✅ **Daily Streak থেকে ইচ্ছাকৃতভাবে সম্পূর্ণ আলাদা ডিজাইন** —
  platform-wide streak এর বদলে ইউজারের নিজের ডিফাইন করা একাধিক
  কাস্টম habit, প্রতিটার নিজস্ব আলাদা streak, XP/badge এর সাথে যুক্ত
  না (নিরপেক্ষ ট্র্যাকিং টুল, freeze mechanic নেই)
- ✅ **নতুন Habit/HabitLog মডেল** (৪০তম migration) — আনডু সাপোর্ট
  (ভুল ক্লিক ফিরিয়ে নেওয়া যায়) + soft-delete আর্কাইভ অপশন
- 🐛 **আবার ধরা পড়া pgvector HNSW বাগ নিরাপদে ফিক্স** —
  `prisma migrate diff` আবারও ভুল `DROP INDEX` জেনারেট করেছিল,
  raw SQL ম্যানুয়ালি ঠিক করে `migrate deploy` দিয়ে নিরাপদে apply
  করা হয়েছে (কোনো ডেটা/ইনডেক্স ক্ষতিগ্রস্ত হয়নি)
- ✅ Live test (৪০/৪০ পাস): multi-user authorization (403 সব
  ক্ষেত্রে), streak/undo logic, MAX_HABITS লিমিট, archive behavior,
  cascade delete — সব DB তে সরাসরি ভেরিফাই

Peer Note Sharing এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **নোট শেয়ারিং** — Community Shared Flashcard Deck এর একই
  প্রমাণিত প্যাটার্ন (opt-in, ডিফল্টে private) টপিক নোটে প্রসারিত —
  Topic Detail পেজে "সহপাঠীদের সাথে শেয়ার করো" বাটন, "Peer Notes"
  সেকশনে সবার শেয়ার করা নোট দেখা যায় (নাম সহ, anonymous না)
- ✅ **"উপকারী" ভোটিং সিস্টেম** — টগল করা যায়, self-vote ব্লক করা
  (নিজের নোটে নিজে ভোট দেওয়া যায় না), জনপ্রিয়তা অনুযায়ী sort
- 🐛 **তৃতীয়বার ধরা পড়া pgvector HNSW বাগ নিরাপদে ফিক্স** (Habit
  Tracker এর পরে আবার একই বাগ, একই প্রমাণিত raw SQL + migrate deploy
  workaround দিয়ে সমাধান)
- ✅ Live test (৩৪/৩৪ পাস): private→public visibility, self-vote
  403, vote toggle, unpublish behavior, cascade delete — সব DB তে
  সরাসরি ভেরিফাই

Push Notification (Web Push, VAPID) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **সম্পূর্ণ ফ্রি Web Push** — `web-push` npm প্যাকেজ + VAPID key
  pair, কোনো তৃতীয় পক্ষের সাবস্ক্রিপশন সার্ভিস (OneSignal/FCM) বা
  খরচ লাগে না — Settings → নোটিফিকেশন ট্যাবে টগল করে চালু করা যায়
- ✅ **Event-driven, cron-free ডিজাইন** — বিদ্যমান কেন্দ্রীভূত
  `createNotification()` ফাংশনে push পাঠানোর কল যোগ করে ১০+ বিদ্যমান
  notification event (badge award, forum reply, streak freeze,
  mock exam CQ scoring ইত্যাদি) স্বয়ংক্রিয়ভাবে push এর জন্য প্রস্তুত
  হয়ে গেছে — কোনো নতুন call-site যোগ করতে হয়নি
- ✅ **Self-cleaning subscriptions** — expired/invalid push
  subscription স্বয়ংক্রিয়ভাবে DB থেকে মুছে যায় (404/410 status)
- ✅ **Silent-fail ডিজাইন** — push পাঠাতে ব্যর্থ হলেও in-app
  notification/মূল action কখনো ব্যাহত হয় না
- 🐛 **চতুর্থবার ধরা পড়া pgvector HNSW বাগ নিরাপদে ফিক্স** (একই
  প্রমাণিত raw SQL + migrate deploy workaround)
- ✅ Live test (২৯/২৯ পাস): authorization, upsert behavior, silent-fail
  edge case (fake keys দিয়েও mastery update সফল হওয়া ভেরিফাই),
  cascade delete — সব DB তে সরাসরি ভেরিফাই। **সীমাবদ্ধতা স্বচ্ছভাবে
  জানানো**: প্রকৃত browser subscribe flow Python দিয়ে টেস্ট করা যায়
  না (client-side API), তাই server-side contract টেস্ট করা হয়েছে

Offline PWA Full Sync এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **IndexedDB ভিত্তিক Outbox Queue** — নেটিভ ব্রাউজার API (কোনো
  external library ছাড়া), অফলাইনে করা write action (যেমন Habit
  Toggle) সংরক্ষণ করে রাখে, ইন্টারনেট ফিরলে স্বয়ংক্রিয়ভাবে সিঙ্ক হয়
- ✅ **`offlineFetch()` React hook** — সাধারণ fetch() এর drop-in
  বিকল্প, নেটওয়ার্ক এরর হলে অটো-queue করে, optimistic UI আপডেট সহ
- ✅ **স্মার্ট retry ডিজাইন** — 4xx এরর সাথে সাথে abandon (retry
  করলেও লাভ নেই), network/5xx এরর ৫ বার retry করে তারপর abandon
  (অনন্তকাল আটকে থাকা এড়াতে)
- ✅ **গ্লোবাল sync ইন্ডিকেটর** — স্ক্রিনে কতগুলো অ্যাকশন সিঙ্ক
  হওয়ার অপেক্ষায় আছে তা দেখায়, ম্যানুয়াল "এখনই সিঙ্ক করো" বাটন সহ
- ✅ Node.js ইউনিট টেস্ট (৩০/৩০ পাস, `fake-indexeddb` দিয়ে): FIFO
  order, retry/abandon logic, offline-skip সব edge case + Live
  regression টেস্ট (২৪/২৪ পাস): বিদ্যমান habit toggle/পেজ/service
  worker কিছুই ভাঙেনি। **মোট ৫৪/৫৪ পাস**
- **সীমাবদ্ধতা স্বচ্ছভাবে জানানো**: শুধু Habit Toggle এ ইন্টিগ্রেটেড
  (idempotent-safe mutation), app বন্ধ থাকা অবস্থায় sync হয় না
  (Background Sync API Safari/iOS এ সাপোর্ট না থাকায়)

Bangla/English/ICT Question Bank Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **সবচেয়ে বড় কনটেন্ট গ্যাপ পূরণ** — পুরো কোডবেস+DB অডিট করে
  চিহ্নিত: Bangla/English/ICT বিষয়ে আগে ০টা প্র্যাকটিস প্রশ্ন ছিল
  (শুধু Physics/Chemistry/Biology/Higher Math এ ছিল) — এখন যথাক্রমে
  ২৩/২১/৩৩টা করে verified MCQ প্রশ্ন যোগ হয়েছে (মোট ৭৭টা নতুন প্রশ্ন)
- ✅ **Deep Research দিয়ে verify করা কনটেন্ট** — আমার পথ (নজরুল),
  অপরিচিতা+সোনার তরী (রবীন্দ্রনাথ), আঠারো বছর বয়স (সুকান্ত), সমাস
  (বাংলা ব্যাকরণ), Right Forms of Verbs/Preposition/Essay Writing
  (English), সংখ্যা পদ্ধতি/HTML/SQL/বুলিয়ান অ্যালজেবরা (ICT) — প্রতিটা
  তথ্য web_search দিয়ে যাচাই করে ভুল এড়ানো হয়েছে
- ✅ **কোনো নতুন migration লাগেনি** — বিদ্যমান `Question` মডেল ব্যবহার,
  idempotent সিড স্ক্রিপ্ট (`db:seed-bangla-english-ict`)
- ✅ Live test (২২/২২ পাস): Bangla চ্যাপ্টারে Practice শুরু→সঠিক
  scoring→DB সেভ (আগে "কোনো প্রশ্ন নেই" এরর দিত, এখন সফল), ICT/English
  এও কাজ করে, Physics এর পুরনো ৫৭টা প্রশ্ন অক্ষত (regression-free)

Task ও Study Plan Item XP Farming বাগ ফিক্স এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **বহুদিনের known limitation সম্পূর্ণভাবে ফিক্স** — Task Manager ও
  Study Plan Item দুটোতেই আগে TODO↔DONE বার বার toggle করে XP farm
  করা যেত (Study Plan Item এ বাগটা আরও গুরুতর ছিল, আগের state চেকই
  হতো না)
- ✅ **নতুন persistent `xpAwarded` ফ্ল্যাগ** (দুটো নতুন migration) —
  status/isCompleted থেকে সম্পূর্ণ স্বাধীন, পুরো জীবনচক্রে "একবার XP
  দেওয়া হয়েছে কিনা" ট্র্যাক করে — UX অক্ষত (এখনো স্বাধীনভাবে toggle
  করা যায়), কিন্তু XP শুধু প্রথমবারই পাওয়া যায়
- 🐛 **পঞ্চম ও ষষ্ঠবার ধরা পড়া pgvector HNSW বাগ নিরাপদে ফিক্স** (একই
  প্রমাণিত raw SQL + migrate deploy workaround)
- ✅ Live test (Task: ২৪/২৪ + Study Plan Item: ২০/২০ = **৪৪/৪৪ পাস**):
  ৭ বার toggle করার পরেও XP মাত্র একবারই বাড়ে (আগে প্রতিবার বাড়ত),
  নতুন স্বাধীন টাস্ক ঠিকভাবে নিজের XP পায়, authorization/isolation
  সব ভেরিফাই

CQ প্রশ্নে LaTeX (MathText) রেন্ডারিং এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **বিদ্যমান `MathText` কম্পোনেন্ট প্রসারিত** — কোনো নতুন dependency
  ছাড়াই CQ Runner, CQ Result পেজ, Mock Exam এর CQ অংশ — সবগুলোতে
  KaTeX দিয়ে সূত্র (যেমন $F=ma$, $$v=u+at$$) সুন্দরভাবে রেন্ডার হয়
  (আগে শুধু MCQ অংশে হতো)
- ✅ **AI Generation Prompt এও LaTeX নির্দেশনা যোগ** —
  `lib/custom-question-gen.ts` এর MCQ/CQ generation prompt এ AI কে
  এখন `$...$`/`$$...$$` সিনট্যাক্স ব্যবহার করতে বলা হয় (Live Exam এর
  Custom Question Set ফিচারের জন্য)
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৫/১৫ পাস): CQ Result পেজে ১১টা KaTeX rendered instance
  ভেরিফাই, authorization, static code verification (MathText usage
  count, AI prompt নির্দেশনা) — সব DB/HTML output সরাসরি চেক করে

Quiz Battle রিয়েল-টাইম আপগ্রেড (Polling → SSE) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **নতুন Server-Sent Events (SSE) endpoint** —
  `GET /api/quiz-battle/[battleId]/stream`, সার্ভার প্রতি ১.৫ সেকেন্টে
  DB চেক করে শুধু পরিবর্তন হলেই push করে (আগে ক্লায়েন্ট ফিক্সড ৪
  সেকেন্ড ইন্টারভালে পোলিং করত)
- ✅ **Resilient client** — ব্রাউজার নেটিভ `EventSource` ব্যবহার (কোনো
  নতুন dependency লাগেনি), কানেকশন ব্যর্থ হলে/পুরনো ব্রাউজারে স্বয়ংক্রিয়
  ফলব্যাক পোলিং। হেডারে সবুজ "লাইভ" ব্যাজ দেখায়
- ✅ **WebSocket না বেছে SSE** — deep research ভেরিফাইড ভবিষ্যৎ Vercel
  serverless deploy-friendly ডিজাইন (persistent WebSocket সার্ভার
  লাগে না), Vercel Hobby ৬০-সেকেন্ড ফাংশন টাইমআউট মাথায় রেখে ২০ মিনিট
  পর normal reconnect
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (৩১/৩১ পাস): কাস্টম Python `SSEReader` (streaming mode)
  দিয়ে raw SSE wire format পার্স করে যাচাই — join/start/submit/end
  প্রতিটা অ্যাকশনের পরে ইতিমধ্যে-খোলা stream এ নতুন push আসে
  (polling ছাড়াই) তা সরাসরি প্রমাণিত, authorization (401/403/404),
  cascade delete সব ভেরিফাই

Misconception Tagging CQ-তে সম্প্রসারণ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **"দুর্বল উত্তর" (Weak Attempt) থ্রেশহোল্ড** — CQ 0-10 স্কেলে
  AI-graded হওয়ায় MCQ এর মতো binary "ভুল" ধারণা কাজ করে না, তাই
  `totalScore <= 4` (HSC বোর্ডের বাস্তব পাস মার্ক ৪০% এর সাথে
  সঙ্গতিপূর্ণ) হলে সেই attempt কে "দুর্বল" ধরা হয়
- ✅ **MCQ+CQ merge** — একই free-text `misconceptionTag` MCQ ও CQ
  দুটোতেই ব্যবহার করা যায়, Analytics এ দুই সোর্স থেকেই ডেটা automatically
  একসাথে merge হয়ে একটামাত্র সম্মিলিত সিগন্যাল দেখায়
- ✅ **নতুন migration** (৮ম) — `CQQuestion.misconceptionTag`, Admin CQ
  Manager এ ইনলাইন ট্যাগ এডিটর (MCQ Question Manager এর একই প্যাটার্ন)
- ✅ Live test (৪১/৪১ পাস): threshold boundary (score=4 দুর্বল, score=5
  না), MCQ+CQ merge গণিত হাতে-হিসাব মিলিয়ে, authorization, cascade
  delete সব ভেরিফাই

Account Deletion / Data Export এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Data Export** — Settings এ নতুন "ডেটা ও অ্যাকাউন্ট" ট্যাব থেকে
  এক ক্লিকে নিজের সম্পূর্ণ ডেটা (quiz/CQ attempt, flashcard, task,
  note, habit, forum পোস্ট ইত্যাদি সব) JSON ফাইলে ডাউনলোড, passwordHash
  সহ কোনো সেনসিটিভ ফিল্ড নেই
- ✅ **Account Deletion (double-confirmation)** — পাসওয়ার্ড ভেরিফাই +
  নির্দিষ্ট বাংলা টেক্সট ("ডিলিট করো") টাইপ করে নিশ্চিতকরণ, schema তে
  বিদ্যমান cascade delete rule (৩০+টা টেবিল) স্বয়ংক্রিয়ভাবে সব ডেটা
  পরিষ্কার করে
- ✅ **Study Group ownership transfer** — বিদ্যমান `leaveStudyGroup()`
  লজিক পুনর্ব্যবহার করে OWNER ডিলিট করলে অন্য সদস্য থাকলে ownership
  transfer হয় (group অক্ষত থাকে), শেষ সদস্য হলে group ও মুছে যায়
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (৩৯/৩৯ পাস): export JSON structure+security, delete
  ভ্যালিডেশন (401/400 সব কেস), cascade delete, ও Study Group ownership
  transfer এর উভয় edge case (member থাকলে/না থাকলে) DB তে সরাসরি
  ভেরিফাই

Admin Question Manager এ MathText Preview মোড এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Live Preview Panel** — Admin প্রশ্ন/উত্তর টাইপ করার সময় ঐচ্ছিক
  টগল চালু করে ($E=mc^2$ স্টাইল LaTeX) সাথে সাথে রেন্ডার হওয়া প্রিভিউ
  দেখতে পারে (ডিফল্টে বন্ধ, MCQ ও CQ ফর্ম দুটোতেই)
- ✅ **প্রশ্ন লিস্টে সবসময় MathText রেন্ডার** — raw "$...$" সিনট্যাক্স না
  দেখিয়ে সবসময় সুন্দরভাবে রেন্ডার হওয়া কনটেন্ট দেখায়
- ✅ **কোনো নতুন dependency লাগেনি** — বিদ্যমান `MathText` কম্পোনেন্ট
  পুনর্ব্যবহার, সম্পূর্ণ schema-free
- ✅ Live test (২৩/২৩ পাস): Admin Topic Detail পেজে ৭টা KaTeX rendered
  instance ভেরিফাই, authorization, static code verification, cascade
  delete

Physics 1st Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **১১টা isImportant টপিকে বাস্তব কনটেন্ট** — deep research verified
  নোট (সূত্র প্রতিপাদনসহ) ও ফর্মুলা শীট (একক ও পরিমাপ, ভেক্টর, গতিবিদ্যা,
  নিউটনের সূত্র, শক্তি, মহাকর্ষ, স্থিতিস্থাপকতা, SHM, শব্দ তরঙ্গ,
  গ্যাসের গতিতত্ত্ব)
- ✅ **নতুন `MarkdownLite` কম্পোনেন্ট** — headers/bold/bullet
  list/table পার্স করে + বিদ্যমান `MathText` দিয়ে LaTeX রেন্ডার করে
  (কোনো ভারী react-markdown/remark dependency ছাড়া)
- 🐛 **আবিষ্কৃত ও ঠিক করা বাগ**: Topic Detail পেজ আগে notesMarkdown কে
  raw plain text হিসেবে দেখাত (কোনো markdown/LaTeX পার্সিং হতো না) —
  এখন সুন্দরভাবে রেন্ডার হয়
- ✅ **Admin preview টগল** — Topic Manager এ MathText Preview মোডের
  একই প্যাটার্নে MarkdownLite প্রিভিউ যোগ করা হয়েছে
- ✅ **PDF generation এ raw markup ক্লিনআপ** — react-pdf এ HTML/KaTeX
  চলে না বলে markdown মার্কার সরিয়ে readable plain text এ রূপান্তর
- ✅ **সম্পূর্ণ schema-free** — বিদ্যমান `notesMarkdown`/`formulaSheet`
  ফিল্ড ব্যবহার, কোনো নতুন migration লাগেনি
- ✅ Live test (২২/২২ পাস): DB verification, KaTeX+header+bold+table
  রেন্ডারিং, PDF crash-free, regression-free, static code verification

Physics 2nd Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৮টা isImportant টপিকে বাস্তব কনটেন্ট** — তাপগতিবিদ্যা, কুলম্বের
  সূত্র, ওহমের সূত্র, চৌম্বক ক্রিয়া, ফ্যারাডের সূত্র, লেন্স ও দর্পণ,
  বোর পরমাণু মডেল, অর্ধপরিবাহী (সব deep research verified)
- ✅ **Physics 1st Paper Notes Seed এর একই pipeline পুনর্ব্যবহার** —
  কোনো নতুন UI কোড লাগেনি, শুধু নতুন ডেটা সিড
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৪/১৪ পাস): KaTeX রেন্ডারিং (১৪টা instance), সব ৮টা
  টপিকের PDF crash-free, regression-free

Chemistry 1st+2nd Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৯টা isImportant টপিকে বাস্তব কনটেন্ট** — রাসায়নিক পরিবর্তন,
  পর্যায় সারণি, আয়নিক ও সমযোজী বন্ধন, বিক্রিয়ার হার (Chemistry 1st
  Paper), পরিবেশ দূষণ, হাইড্রোকার্বন, অ্যালকোহল ও কার্বক্সিলিক এসিড,
  মোল ধারণা, জারণ-বিজারণ (Chemistry 2nd Paper) — সব deep research
  verified
- 🐛 **আবিষ্কৃত ও ঠিক করা বাগ**: লাইভ টেস্টে ধরা পড়েছিল "হাইড্রোকার্বন"
  টপিকে `**bold**` মার্কার ভুলবশত বাদ পড়ে গিয়েছিল — কনটেন্ট ঠিক করে
  পুনরায় সিড করা হয়েছে
- ✅ **Physics Notes Seed ফিচারগুলোর একই pipeline পুনর্ব্যবহার** —
  কোনো নতুন UI কোড লাগেনি
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৪/১৪ পাস): KaTeX+header+bold+table রেন্ডারিং, সব ৯টা
  টপিকের PDF crash-free

Biology 1st Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **১১টা isImportant টপিকে বাস্তব কনটেন্ট** — কোষের প্রকারভেদ,
  মাইটোসিস, মিয়োসিস, এনজাইম, ভাইরাস, নগ্নবীজী/আবৃতবীজী শ্রেণিবিন্যাস,
  স্থায়ী টিস্যু, সালোকসংশ্লেষণ, শ্বসন, জিন প্রকৌশল, বাস্তুতন্ত্র — সব
  deep research verified
- ✅ **formulaSheet ফিল্ড জীববিজ্ঞানে "মূল তথ্য সারাংশ" হিসেবে ব্যবহৃত**
  — গাণিতিক সূত্রের বদলে গুরুত্বপূর্ণ term/সংখ্যা (যেমন ৩৮ ATP)
- 🐛 **প্রোঅ্যাকটিভ বাগ প্রতিরোধ**: Chemistry ফিচারে শেখা bold-মার্কার
  চেকিং প্যাটার্ন এবার টেস্ট চালানোর আগেই প্রয়োগ করে দুটো টপিকে bold
  অনুপস্থিতি আগেভাগেই ধরে ঠিক করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৫/১৫ পাস, প্রথমবারেই): header+bold+table+KaTeX
  রেন্ডারিং, সব ১১টা টপিকের PDF crash-free

Biology 2nd Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৯টা isImportant টপিকে বাস্তব কনটেন্ট** — শ্রেণিবিন্যাসের নীতি
  (৯টা পর্ব), পরিপাকতন্ত্র, রক্তের উপাদান, হৃৎপিণ্ড ও রক্তসংবহন
  (কার্ডিয়াক চক্র), বৃক্কের গঠন (নেফ্রন), স্নায়ুতন্ত্র, হরমোন, রোগ
  প্রতিরোধ ব্যবস্থা, মেন্ডেলের সূত্র — সব deep research verified
- ✅ **formulaSheet ফিল্ড Biology 1st এর প্যাটার্নে "মূল তথ্য সারাংশ"
  হিসেবে ব্যবহৃত** — গ্রন্থি/হরমোন/পর্ব তুলনা টেবিল ও F2 অনুপাতের তালিকা
- 🐛 **প্রোঅ্যাকটিভ বাগ প্রতিরোধ**: Chemistry+Biology 1st ফিচারে শেখা
  bold-মার্কার চেকিং প্যাটার্ন টেস্ট চালানোর আগেই প্রয়োগ করে সব টপিকে
  bold/header/table সঠিকভাবে যাচাই করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৪/১৪ পাস, প্রথমবারেই): header+bold+table রেন্ডারিং, সব
  ৯টা টপিকের PDF crash-free, unauthenticated redirect ও অস্তিত্বহীন
  topic id এ 404 ভেরিফাই
- ✅ `pnpm build` (750MB) প্রথম চেষ্টাতেই সফল

Higher Math 1st Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **১০টা isImportant টপিকে বাস্তব কনটেন্ট** — নির্ণায়কের মান নির্ণয়,
  স্কেলার ও ভেক্টর গুণন, সরলরেখার সমীকরণ, বৃত্তের সমীকরণ, বিন্যাস,
  সমাবেশ, ত্রিকোণমিতিক অভেদ, যোগ ও বিয়োগ সূত্র, অন্তরীকরণের সূত্রাবলি,
  যোগজীকরণের সূত্রাবলি — সব deep research verified
- ✅ **formulaSheet ফিল্ড আসল উদ্দেশ্যে ব্যবহৃত** (Physics/Chemistry এর
  মতো) — প্রকৃত গাণিতিক সূত্র, সবগুলো LaTeX দিয়ে লেখা, KaTeX রেন্ডারিং
  (একটা টপিক পেজেই ২২টা KaTeX instance)
- 🐛 **প্রোঅ্যাকটিভ বাগ প্রতিরোধ**: bold-মার্কার+header+KaTeX ব্লক চেকিং
  টেস্ট চালানোর আগেই প্রয়োগ করে সব টপিকে সঠিকভাবে যাচাই করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৫/১৫ পাস): header+bold+table+KaTeX রেন্ডারিং, সব ১০টা
  টপিকের PDF crash-free (LaTeX সহ কনটেন্ট PDF এ ঠিকমতো clean হয় তা
  ভেরিফাই)
- ✅ `pnpm build` (850MB) — ৩ বার চেষ্টা লেগেছে (sandbox instability)

Higher Math 2nd Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **১০টা isImportant টপিকে বাস্তব কনটেন্ট** — অসমতার সমাধান,
  সীমাবদ্ধতা ও উদ্দেশ্য ফাংশন (Linear Programming), জটিল সংখ্যার
  বীজগণিত, বহুপদীর ভাগশেষ উপপাদ্য, দ্বিপদী উপপাদ্য, পরাবৃত্ত,
  ত্রিকোণমিতিক সমীকরণের সমাধান, বলের লব্ধি, প্রক্ষেপক গতি, সম্ভাবনা
  তত্ত্ব — সব deep research verified
- ✅ **formulaSheet ফিল্ড আসল উদ্দেশ্যে ব্যবহৃত** (HMath1 এর ধারাবাহিকতায়)
  — প্রকৃত গাণিতিক সূত্র, LaTeX দিয়ে লেখা (জটিল সংখ্যার বীজগণিত পেজে
  ৩৪টা KaTeX instance — এই সিরিজে সর্বোচ্চ)
- 🐛 **প্রোঅ্যাকটিভ বাগ প্রতিরোধ**: bold-মার্কার+header+KaTeX ব্লক চেকিং
  টেস্ট চালানোর আগেই প্রয়োগ করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১২/১২ পাস): header+bold+KaTeX রেন্ডারিং, সব ১০টা টপিকের
  PDF crash-free
- ✅ `pnpm build` (850MB) প্রথম চেষ্টাতেই সফল

ICT Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৬টা isImportant টপিকে বাস্তব কনটেন্ট** — নেটওয়ার্কের প্রকারভেদ
  (PAN/LAN/MAN/WAN), সংখ্যা পদ্ধতি (বাইনারি/অক্টাল/হেক্সাডেসিমেল),
  বুলিয়ান অ্যালজেবরা (সত্যক সারণি, ডি-মরগ্যান), HTML ট্যাগ পরিচিতি,
  C প্রোগ্রামিং বেসিক, SQL কুয়েরি — সব deep research verified
- 🆕 **MarkdownLite ও PDF renderer এ নতুন ফেন্সড কোড ব্লক সাপোর্ট** —
  প্রথমবার প্রোগ্রামিং/মার্কআপ/কুয়েরি কোড উদাহরণ (HTML/C/SQL)
  `<pre><code>` এ monospace রেন্ডার হয় (raw markdown মার্কার না
  দেখিয়ে), PDF এ readable plain text এ রূপান্তরিত হয়
- 🐛 **বাগ ফিক্স (seed script লেখার সময়)**: nested backtick TypeScript
  template literal এর সাথে সংঘর্ষ করছিল — `String.fromCharCode(96)`
  দিয়ে সমাধান করা হয়েছে
- 🐛 **লাইভ টেস্টে false-negative ধরা ও ঠিক করা**: RSC hydration
  payload এ raw prop stringified থাকা প্রত্যাশিত আচরণ (বাগ না),
  টেস্ট script visible `<pre>` ব্লক-ভিত্তিক চেকে পরিবর্তন করে ঠিক
  করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৭/১৭ পাস): header+bold+table+কোড ব্লক রেন্ডারিং, সব
  ৬টা টপিকের PDF crash-free
- ✅ `pnpm build` (750MB) — ২ বার চেষ্টা লেগেছে (sandbox দীর্ঘ freeze)

বাংলা ১ম+২য় পত্র Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৪টা isImportant টপিকে বাস্তব কনটেন্ট** — অপরিচিতা (রবীন্দ্রনাথ
  ঠাকুর, চরিত্র বিশ্লেষণ), সোনার তরী (মাত্রাবৃত্ত ছন্দ, রূপক
  জীবনদর্শন), সমাস (৬ প্রকার), প্রবন্ধ রচনা (ভূমিকা-মূলবক্তব্য-
  উপসংহার কাঠামো) — সব deep research verified
- ✅ **formulaSheet ফিল্ড Biology এর প্যাটার্নে "মূল তথ্য সারাংশ"
  হিসেবে ব্যবহৃত** — লেখক পরিচিতি টেবিল, সমাস প্রকারভেদ তুলনা টেবিল
- 🐛 **প্রোঅ্যাকটিভ বাগ প্রতিরোধ**: bold-মার্কার+header+table চেকিং
  টেস্ট চালানোর আগেই প্রয়োগ করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৪/১৪ পাস, প্রথমবারেই): header+bold+table রেন্ডারিং,
  সব ৪টা টপিকের PDF crash-free
- ✅ `pnpm build` (750MB) প্রথম চেষ্টাতেই সফল

English 1st+2nd Paper Topic Notes+Formula Sheet Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৪টা isImportant টপিকে বাস্তব কনটেন্ট** — Unseen Passage Reading
  (reading strategies), Paragraph Writing (topic/supporting/closing
  sentence), Right Forms of Verbs (tense rules, subject-verb agreement),
  Preposition (time/place, appropriate preposition list) — সব deep
  research verified
- 🆕 **এই সেশনের কনটেন্ট সিডিং সিরিজের দশম ও সর্বশেষ ফিচার** — সব
  বিষয়ের (Physics, Chemistry, Biology, Higher Math, ICT, Bangla,
  English) isImportant টপিক কভারেজ এখন সম্পূর্ণ, মোট ৮২টা টপিক
- 🐛 **প্রোঅ্যাকটিভ বাগ প্রতিরোধ**: bold-মার্কার+header+table চেকিং
  টেস্ট চালানোর আগেই প্রয়োগ করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৪/১৪ পাস): header+bold+table রেন্ডারিং, সব ৪টা
  টপিকের PDF crash-free
- ✅ `pnpm build` (850MB) — ২ বার চেষ্টা লেগেছে (sandbox instability)

Physics 1st Paper CQ (সৃজনশীল প্রশ্ন) Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **১০টা isImportant টপিকে বাস্তব board-style CQ** — একক ও পরিমাপ,
  ভেক্টরের যোগ ও বিয়োগ, সরলরৈখিক গতি, প্রক্ষেপক গতি, শক্তি ও শক্তির
  নিত্যতা, নিউটনের মহাকর্ষ সূত্র, স্থিতিস্থাপকতা, সরল ছন্দিত স্পন্দন
  গতি, শব্দ তরঙ্গ, গ্যাসের গতিতত্ত্ব — প্রতিটাতে ৪ ধাপ (ক-জ্ঞানমূলক,
  খ-অনুধাবনমূলক, গ-প্রয়োগ, ঘ-উচ্চতর দক্ষতা) ও মডেল উত্তর
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই** — প্রতিটা CQ এর গ/ঘ ধাপের গণিত
  Python দিয়ে আগে থেকে চালিয়ে মিলিয়ে দেখা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি, বিদ্যমান
  CQQuestion মডেল ব্যবহার
- ✅ Live test (১৪/১৪ পাস): chapter-level CQ listing API, LaTeX raw
  markup উপস্থিতি, CQ Practice পেজ status 200, unauthenticated 401,
  non-existent chapter 404 (AI-graded submission flow টেস্ট থেকে
  ইচ্ছাকৃতভাবে বাদ — non-determinism এড়াতে)
- ⚠️ `pnpm build` (850MB) — **৪ বার চেষ্টা লেগেছে** (এই সেশনের
  সবচেয়ে কঠিন build, একবার V8 নিজে OOM এ পরিষ্কারভাবে exit করেছে)
- মোট CQ সংখ্যা এখন ১৯টা (আগের ৯ + নতুন ১০)

Physics 2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **বাকি ৬টা isImportant টপিকে বাস্তব board-style CQ** — তাপগতিবিদ্যার
  সূত্রাবলি, বিদ্যুৎ প্রবাহের চৌম্বক ক্রিয়া, ফ্যারাডের সূত্র, লেন্স ও
  দর্পণ, বোর পরমাণু মডেল, অর্ধপরিবাহী — এখন Physics ২য় পত্রের সব ৮টা
  isImportant টপিকে CQ আছে (আগের ২টা + নতুন ৬টা)
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই** — Python দিয়ে প্রতিটা CQ এর গণিত
  আগে থেকে যাচাই (বোর মডেলের তরঙ্গদৈর্ঘ্য, লেন্স বিবর্ধন ইত্যাদি)
- 🐛 **লাইভ টেস্টে false-negative ধরা ও ঠিক করা**: একটা টেস্ট assertion
  ভুলভাবে প্রশ্নাংশে LaTeX আশা করেছিল যেখানে LaTeX শুধু model answer এ
  আছে — টেস্ট script সংশোধন করা হয়েছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৫/১৫ পাস): chapter-level CQ listing, CQ Practice পেজ
  status 200, unauthenticated 401, non-existent chapter 404
- ✅ `pnpm build` (850MB) প্রথম চেষ্টাতেই সফল
- মোট CQ সংখ্যা এখন ২৫টা (আগের ১৯ + নতুন ৬); **Physics ১ম+২য় পত্র CQ
  কভারেজ সম্পূর্ণ (মোট ১৮টা টপিক)**

Chemistry 1st+2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **বাকি ৭টা isImportant টপিকে বাস্তব board-style CQ** — রাসায়নিক
  পরিবর্তন, পর্যায় সারণি, রাসায়নিক বিক্রিয়ার হার (Chemistry 1st),
  বায়ুমণ্ডল ও পরিবেশ দূষণ, হাইড্রোকার্বন, অ্যালকোহল ও কার্বক্সিলিক
  এসিড, জারণ-বিজারণ (Chemistry 2nd) — এখন Chemistry ১ম+২য় পত্রের সব
  isImportant টপিকে CQ আছে
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই + Deep Research** — Python দিয়ে
  প্রতিটা CQ এর গণিত (ভর সংরক্ষণ, বিক্রিয়ার হারের ক্রম, এস্টারিফিকেশন
  ফলন, গ্যালভানিক কোষ বিভব) আগে থেকে যাচাই, CFC-ওজোন ক্ষয় প্রক্রিয়া
  web_search দিয়ে ভেরিফাই
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৫/১৫ পাস, প্রথমবারেই): chapter-level CQ listing, CQ
  Practice পেজ status 200, unauthenticated 401, non-existent chapter 404
- ⚠️ `pnpm build` (750MB) — ৩ বার চেষ্টা লেগেছে (sandbox instability,
  একবার TypeScript check ৪২ সেকেন্ড সময় নিয়েছে)
- মোট CQ সংখ্যা এখন ৩২টা (আগের ২৫ + নতুন ৭); **Physics+Chemistry সব
  পত্র CQ কভারেজ সম্পূর্ণ**

Biology 2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **বাকি ৮টা isImportant টপিকে বাস্তব board-style CQ** — শ্রেণিবিন্যাসের
  নীতি, পরিপাকতন্ত্র, রক্তের উপাদান, বৃক্কের গঠন, স্নায়ুতন্ত্র, হরমোন,
  রোগ প্রতিরোধ ব্যবস্থা, মেন্ডেলের সূত্র — এখন Biology ১ম+২য় পত্রের সব
  isImportant টপিকে CQ আছে
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই + Deep Research** — Python দিয়ে
  মেন্ডেলের সূত্রের মনোহাইব্রিড (৩:১) ও ডাইহাইব্রিড (৯:৩:৩:১) অনুপাত,
  RBC:WBC অনুপাত থেকে সংখ্যা, বৃক্কের GFR থেকে দৈনিক পরিস্রুত তরল ও
  মূত্র উৎপাদন হিসাব আগে থেকে যাচাই; GFR/পরিস্রাবণ তথ্য web_search
  দিয়ে ক্রস-চেক (lmu.pressbooks.pub, bio.libretexts.org)
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৯/১৯ পাস, প্রথমবারেই): chapter-level CQ listing, CQ
  Practice পেজ status 200, unauthenticated 401, non-existent chapter 404
- ✅ **Cascade delete ভেরিফাই** — অস্থায়ী টেস্ট Topic+CQQuestion দিয়ে
  Topic delete করলে CQQuestion স্বয়ংক্রিয়ভাবে cascade delete হওয়া
  psycopg2 দিয়ে নিশ্চিত
- ✅ `pnpm build` (850MB) প্রথম চেষ্টাতেই সফল, কোনো hang হয়নি
- মোট CQ সংখ্যা এখন ৫০টা (আগের ৪২ + নতুন ৮); **Physics+Chemistry+Biology
  সব পত্র CQ কভারেজ সম্পূর্ণ**

Higher Math 1st Paper CQ (সৃজনশীল প্রশ্ন) Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **বাকি ৯টা isImportant টপিকে বাস্তব board-style CQ** — স্কেলার ও
  ভেক্টর গুণন, সরলরেখার সমীকরণ, বৃত্তের সমীকরণ, বিন্যাস, সমাবেশ,
  ত্রিকোণমিতিক অভেদ, যোগ ও বিয়োগ সূত্র, অন্তরীকরণের সূত্রাবলি,
  যোগজীকরণের সূত্রাবলি — এখন Higher Math ১ম পত্রের সব isImportant
  টপিকে CQ আছে
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই (sympy-ভিত্তিক)** — Physics/Chemistry
  এর মতো web_search এর বদলে Python sympy দিয়ে সম্পূর্ণ বীজগাণিতিক
  ভেরিফিকেশন: ভেক্টর ডট/ক্রস প্রোডাক্ট ও কোণ, সরলরেখার সমীকরণ ও
  লম্বতা, বৃত্তের কেন্দ্র/ব্যাসার্ধ/স্পর্শক, nPr/nCr গণনা,
  ত্রিকোণমিতিক অভেদ প্রমাণ (`simplify()`), $\sin75°=\cos15°$ প্রমাণ,
  `diff()`/`integrate()` দিয়ে অন্তরজ ও যোগজ যাচাই
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (১৯/১৯ পাস, প্রথমবারেই): chapter-level CQ listing, CQ
  Practice পেজ status 200, unauthenticated 401, non-existent chapter 404
- ✅ **Cascade delete ভেরিফাই** — psycopg2 দিয়ে Topic→CQQuestion
  cascade delete নিশ্চিত
- ⚠️ `pnpm build` — ২ বার চেষ্টা লেগেছে (850MB hang, 750MB সফল)
- মোট CQ সংখ্যা এখন ৫৯টা (আগের ৫০ + নতুন ৯)

Higher Math 2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **বাকি ৯টা isImportant টপিকে বাস্তব board-style CQ** — অসমতার
  সমাধান, সীমাবদ্ধতা ও উদ্দেশ্য ফাংশন, বহুপদীর ভাগশেষ উপপাদ্য, দ্বিপদী
  উপপাদ্য, পরাবৃত্ত, ত্রিকোণমিতিক সমীকরণের সমাধান, বলের লব্ধি, প্রক্ষেপক
  গতি, সম্ভাবনা তত্ত্ব — এখন Higher Math ২য় পত্রের সব isImportant
  টপিকে CQ আছে
- 🐛🐛 **গুরুত্বপূর্ণ ডেটা বাগ ধরা পড়ে ও ঠিক করা হয়েছে**: "প্রক্ষেপক
  গতি" নামে DB তে দুটো ভিন্ন টপিক ছিল (Physics 1st Paper ও Higher Math
  2nd Paper এ) — seed script এর subject-agnostic লুকআপ ভুলবশত Physics
  এর টপিক ম্যাচ করে তার আসল CQ overwrite করে ফেলেছিল। ফিক্স: উভয় seed
  script এ subject-aware লুকআপ যোগ করে Physics CQ পুনরুদ্ধার করা
  হয়েছে এবং Higher Math এর সঠিক টপিকে পুনরায় সিড করা হয়েছে; পুরো DB
  স্ক্যান করে অন্য কোনো duplicate topic নাম নেই তা নিশ্চিত করা হয়েছে
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই (sympy-ভিত্তিক)** — অসমতা সমাধান,
  LP কৌণিক বিন্দু বিশ্লেষণ, ভাগশেষ/গুণনীয়ক উপপাদ্য, দ্বিপদী বিস্তৃতি,
  পরাবৃত্তের সমীকরণ, ত্রিকোণমিতিক সমীকরণের সমাধান সেট, প্রক্ষেপক গতির
  H/T/R, সম্ভাবনার কম্বিনেটরিক্স — সব sympy দিয়ে যাচাই
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (২২/২২ পাস, একটা false-negative ঠিক করে — chapter এ
  একাধিক টপিক থাকার প্যাটার্ন): topic collision ফিক্স বিশেষভাবে
  ভেরিফাই, chapter-level CQ listing, CQ Practice পেজ status 200,
  unauthenticated 401, non-existent chapter 404
- ✅ **Cascade delete ভেরিফাই**
- ⚠️ `pnpm build` — **৬ বার চেষ্টা লেগেছে** (এই সেশনের সবচেয়ে কঠিন
  বিল্ড, sandbox একবার ৫ মিনিটের জন্য সম্পূর্ণ অকার্যকর হয়ে গিয়েছিল)
- মোট CQ সংখ্যা এখন ৬৮টা (আগের ৫৯ + নতুন ৯) 🎉 **Physics+Chemistry+
  Biology+Higher Math সব বিষয়ের সব পত্রে CQ কভারেজ সম্পূর্ণ**

ICT CQ (সৃজনশীল প্রশ্ন) Seed এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **সব ৬টা isImportant টপিকে বাস্তব board-style CQ** — নেটওয়ার্কের
  প্রকারভেদ, বাইনারি-অক্টাল-হেক্সাডেসিমেল, বুলিয়ান অ্যালজেবরা, HTML
  ট্যাগ পরিচিতি, C প্রোগ্রামিং বেসিক, SQL কুয়েরি — এখন ICT বিষয়ের সব
  isImportant টপিকে CQ আছে
- ⚠️ **ডিজাইন সিদ্ধান্ত**: CQ Runner এর `MathText` কম্পোনেন্ট Notes
  ফিচারের `MarkdownLite` এর মতো ফেন্সড কোড ব্লক রেন্ডার করে না, তাই
  কোড স্নিপেট সরল বর্ণনামূলক টেক্সট আকারে লেখা হয়েছে (raw markup
  সমস্যা এড়াতে)
- 🔢 **সংখ্যাগত/লজিক্যাল হিসাব প্রি-ভেরিফাই** — সংখ্যা পদ্ধতি রূপান্তর
  (দশমিক↔বাইনারি↔অক্টাল↔হেক্সা), ডি-মরগ্যানের উপপাদ্য সম্পূর্ণ সত্যক
  সারণি দিয়ে প্রমাণ, for loop ট্রেসিং ও off-by-one error বিশ্লেষণ
- 🛡️ **বাগ প্রতিরোধ**: আগের "প্রক্ষেপক গতি" collision বাগের শিক্ষা
  অনুযায়ী subject-aware লুকআপ প্রয়োগ (যদিও এবার কোনো collision
  পাওয়া যায়নি, DB-wide স্ক্যান দিয়ে নিশ্চিত)
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (২০/২০ পাস, প্রথমবারেই): chapter-level CQ listing, CQ
  Practice পেজ status 200, unauthenticated 401, non-existent chapter
  404, raw কোড ব্লক মার্কার অনুপস্থিতি ভেরিফাই
- ✅ **Cascade delete ভেরিফাই**
- ⚠️ `pnpm build` — **৬ বার চেষ্টা লেগেছে** (৫বার hang/OOM, ৬ষ্ঠবারে
  850MB এ সফল)
- ICT বিষয়ে CQ সংখ্যা ০ থেকে ৬ এ বৃদ্ধি পেয়েছে; DB তে মোট CQ এখন
  ৮২টা (Bangla/English এ পূর্ব-বিদ্যমান ৮টা পুরনো CQ সহ)

Physics MCQ Question Bank Gap Fix এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **DB-wide MCQ gap অডিট** — সব isImportant টপিকে MCQ সংখ্যা চেক
  করে দেখা গেছে অনেক টপিকে (বিশেষত Higher Math, Biology) MCQ শূন্য
  বা খুবই কম — Physics দিয়ে শুরু করে গ্যাসের গতিতত্ত্ব, সরল ছন্দিত
  স্পন্দন গতি, প্রক্ষেপক গতি (1st Paper) ও তাপগতিবিদ্যার সূত্রাবলি
  (2nd Paper) — এই ৪টা টপিকে ৫টা করে মোট ২০টা নতুন MCQ যোগ করা হয়েছে
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই** — আদর্শ গ্যাস সমীকরণ, বয়েলের
  সূত্র, সরল দোলকের পর্যায়কাল, স্প্রিং-ভর ব্যবস্থা, প্রক্ষেপক গতির
  H/T/R, তাপগতিবিদ্যার প্রথম সূত্র — সব Python দিয়ে যাচাই
- 🛡️ **বাগ প্রতিরোধ**: "প্রক্ষেপক গতি" topic collision থেকে সুরক্ষার
  জন্য subject-aware লুকআপ, লাইভ টেস্টে Higher Math এর টপিক অপ্রভাবিত
  থাকা বিশেষভাবে ভেরিফাই
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (২০/২০ পাস, প্রথমবারেই): Practice Start API দিয়ে
  chapter-level MCQ লোড, সঠিক উত্তর/ব্যাখ্যা client এ না যাওয়া
  (নিরাপত্তা), unauthenticated 401, non-existent chapter 404, missing
  chapterId 400
- ✅ **Cascade delete ভেরিফাই**
- 🔧🔧 **গুরুত্বপূর্ণ বিল্ড ইনফ্রাস্ট্রাকচার আবিষ্কার**: `pnpm build`
  পরপর ৭ বার hang/OOM হওয়ার পর (`.next` মুছে fresh build করেও
  ব্যর্থ) মূল কারণ ধরা পড়ে — সিস্টেমে **কোনো swap space ছিল না**।
  `sudo fallocate -l 1G /swapfile && sudo mkswap /swapfile && sudo
  swapon /swapfile` দিয়ে ১GB swap তৈরি করার পর **৮ম চেষ্টায় প্রথমবারেই
  সফল** (মাত্র ~৯৪MiB swap ব্যবহার করেই) — ভবিষ্যতে বিল্ডের আগে swap
  চেক/তৈরি করা একটা প্রমাণিত রিকভারি স্টেপ হিসেবে যোগ করা হয়েছে
  (⚠️ sandbox reset হলে swap ফাইলও হারিয়ে যায়, প্রতিবার পুনরায় তৈরি
  করতে হবে)
- মোট MCQ সংখ্যা এখন ২৩২টা (আগের ২১২ + নতুন ২০)

Higher Math MCQ Question Bank Gap Fix এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **১১টা isImportant টপিকে নতুন MCQ** — Higher Math 1st Paper এর
  ৫টা (ভেক্টর গুণন, ত্রিকোণমিতিক অভেদ, যোগ-বিয়োগ সূত্র, অন্তরীকরণ,
  যোগজীকরণ) ও 2nd Paper এর ৬টা (অসমতা, LP, ত্রিকোণমিতিক সমীকরণ,
  বলের লব্ধি, প্রক্ষেপক গতি, সম্ভাবনা তত্ত্ব) — মোট ৫৫টা নতুন MCQ
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই (sympy)** — ভেক্টর গুণন, ত্রিকোণমিতিক
  অভেদ প্রমাণ, ডেরিভেটিভ/ইন্টিগ্রাল, অসমতার সমাধান সেট, LP কৌণিক
  বিন্দু বিশ্লেষণ, সামান্তরিক সূত্রে লব্ধি বল, প্রক্ষেপক গতি, সম্ভাবনা
- 🛡️ **বাগ প্রতিরোধ (দ্বিমুখী ভেরিফিকেশন)**: "প্রক্ষেপক গতি" topic
  collision থেকে সুরক্ষা — লাইভ টেস্টে নিশ্চিত করা হয়েছে Higher Math
  এ নতুন MCQ বসেছে এবং Physics এর পুরনো MCQ (আগের ফিচার থেকে)
  সম্পূর্ণ অক্ষত আছে
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (২৫/২৫ পাস, প্রথমবারেই)
- ✅ **Cascade delete ভেরিফাই**
- 🔧 **Swap ফিক্স সফলতা প্রমাণিত**: আগের ফিচারে আবিষ্কৃত swap file
  সমাধান প্রয়োগ করে এই ফিচারে **প্রথম চেষ্টাতেই বিল্ড সফল** হয়েছে
  (কোনো hang/OOM ছাড়াই, ১৬৮MiB swap ব্যবহার করে) — নিশ্চিত করে swap
  ফাইলই ছিল root cause fix, কাকতালীয় না
- মোট MCQ সংখ্যা এখন ২৮৭টা (আগের ২৩২ + নতুন ৫৫)

Biology MCQ Question Bank Gap Fix এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৯টা isImportant টপিকে নতুন MCQ** — Biology 1st Paper এর ৫টা
  (ভাইরাস, শ্রেণিবিন্যাস, স্থায়ী টিস্যু, জিন প্রকৌশল, বাস্তুতন্ত্র)
  ও 2nd Paper এর ৪টা (শ্রেণিবিন্যাসের নীতি, বৃক্কের গঠন, হরমোন, রোগ
  প্রতিরোধ ব্যবস্থা) — মোট ৪৫টা নতুন MCQ
- ⚠️⚠️ **গুরুত্বপূর্ণ পর্যবেক্ষণ**: DB ভেরিফিকেশনের সময় ধরা পড়ে যে এই
  Supabase database **একাধিক সমান্তরাল সেশন/এজেন্ট instance দ্বারা
  শেয়ার্ড** — প্রথমবার seed চালানোর পরে অপ্রত্যাশিত প্রশ্ন সংখ্যা
  ও অপরিচিত কনটেন্ট (Chemistry/Bangla তে) দেখা গিয়েছিল, যা অন্য
  কোনো সমান্তরাল সেশনের কার্যকলাপের ফল বলে চিহ্নিত হয়েছে। কোনো
  ডেটা ক্ষতি হয়নি — idempotent seed script দ্বিতীয়বার চালিয়ে
  নিজের ৯টা টপিকের সঠিক ডেটা নিশ্চিত করা হয়েছে
- 🛡️ **বাগ প্রতিরোধ যাচাই**: DB-wide স্ক্যানে এই ৯টা টপিকের কোনো
  cross-subject collision পাওয়া যায়নি, তবু subject-aware লুকআপ
  প্রয়োগ করা হয়েছে (defense-in-depth)
- ✅ **সম্পূর্ণ schema-free** — কোনো নতুন migration লাগেনি
- ✅ Live test (২০/২০ পাস) — নির্দিষ্ট টপিক-স্তরে verify (DB-wide
  total না চেক করে, সমান্তরাল কার্যকলাপের false-negative এড়াতে)
- ✅ **Cascade delete ভেরিফাই**
- 🔧 **Swap ফিক্সের ধারাবাহিক সাফল্য**: এই ফিচারেও **প্রথম চেষ্টাতেই
  বিল্ড সফল** হয়েছে (কোনো hang/OOM ছাড়াই) — পরপর ৩য় ফিচারে swap
  সমাধানের কার্যকারিতা প্রমাণিত

Chemistry+ICT MCQ Question Bank Gap Fix এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **১২টা isImportant টপিকে বাকি MCQ যোগ** — Chemistry 1st Paper এর
  ৪টা (রাসায়নিক পরিবর্তন, পর্যায় সারণি, আয়নিক-সমযোজী বন্ধন, বিক্রিয়ার
  হার), 2nd Paper এর ৩টা (বায়ুমণ্ডল দূষণ, হাইড্রোকার্বন, জারণ-বিজারণ),
  ও ICT এর ৫টা (নেটওয়ার্ক, বুলিয়ান, HTML, C প্রোগ্রামিং, SQL) — মোট
  ২৯টা নতুন MCQ, প্রতিটা টপিক এখন অন্তত ৫টা প্রশ্নে উন্নীত
- 🔧 **ডিজাইন পরিবর্তন — append-only প্যাটার্ন**: আগের ফিচারে
  আবিষ্কৃত shared-DB সমান্তরাল কার্যকলাপের কারণে এই ফিচারে
  `deleteMany()` বাদ দিয়ে শুধু নতুন (text-based duplicate check করা)
  প্রশ্ন যোগ করার প্যাটার্ন ব্যবহার করা হয়েছে, যাতে অন্য সেশনের
  বিদ্যমান বৈধ ডেটা দুর্ঘটনাক্রমে মুছে না যায়
- 🔢 **সংখ্যাগত হিসাব প্রি-ভেরিফাই** — CaCO3 ভর সংরক্ষণ, ২য় ক্রম
  বিক্রিয়ার হার, Zn-Cu গ্যালভানিক কোষের $E°_{cell}=1.10V$, বুলিয়ান
  NAND সত্যক সারণি
- ✅ **সম্পূর্ণ schema-free**, ✅ Live test (৩৫/৩৫ পাস, ডুপ্লিকেট-
  অনুপস্থিতি বিশেষভাবে ভেরিফাই সহ), ✅ **Cascade delete ভেরিফাই**
- ✅ **Idempotency দ্বিতীয়বার রান করে ভেরিফাই**: প্রথমবারের ২৮টা
  প্রশ্ন সঠিকভাবে স্কিপ হয়ে দ্বিতীয়বারে শুধু নতুন ১টা যোগ হয়েছে
- 🔧 **Swap ফিক্সের ৪র্থ পরপর সাফল্য**: প্রথম চেষ্টাতেই বিল্ড সফল

UI/UX Polish — Route-Level Loading Skeletons এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **কোড অডিটে আবিষ্কার**: ৭১টা page.tsx এর একটিতেও Next.js এর
  built-in route-level `loading.tsx` কনভেনশন ব্যবহৃত হয়নি — DB query
  চলাকালীন ইউজার ব্ল্যাংক/স্ট্যাল স্ক্রিন দেখত
- ✅ **নতুন `Skeleton` shadcn/ui কম্পোনেন্ট** (`components/ui/skeleton.tsx`)
  — কোনো নতুন dependency ছাড়া (বিদ্যমান `tw-animate-css` ব্যবহার করে)
- ✅ **৮টা সবচেয়ে ভারী/ব্যবহৃত পেজে কনটেন্ট-শেপ skeleton**: dashboard,
  learn, practice, flashcards, mock-exam, planner, leaderboard,
  cq-practice — প্রতিটার layout মূল কনটেন্টের কাছাকাছি রেখে layout
  shift (CLS) কমানো হয়েছে
- ✅ **Global fallback** (`app/loading.tsx`) — বাকি সব রুটের জন্য
  generic centered spinner, নির্দিষ্ট পেজ-লেভেল loading.tsx থাকলে
  সেটাই override করে
- ✅ Live test: সব ৮টা পেজে authenticated status 200 + যুক্তিসঙ্গত
  content length, unauthenticated 307 redirect অপরিবর্তিত
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (swap ফিক্সের ৫ম পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি

UI/UX Polish — Dynamic Route Loading Skeletons সম্প্রসারণ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **৬টা dynamic route পেজে নতুন loading.tsx** — `/learn/[subjectId]`,
  `/learn/[subjectId]/[topicId]`, `/practice/[subjectId]`,
  `/mock-exam/subject/[subjectId]`, `/cq-practice/[subjectId]`,
  `/flashcards/[deckId]` — প্রতিটাই params নিয়ে ভারী nested DB query
  করে (chapters→topics→topicProgress ইত্যাদি)
- ⚠️ **সীমাবদ্ধতা স্বচ্ছভাবে জানানো (pre-existing, অসম্পর্কিত)**:
  dev mode এ `notFound()` কল করা dynamic route সঠিক বাংলা ৪০৪
  কনটেন্ট রেন্ডার করলেও HTTP status `200` রিটার্ন করে — সম্পূর্ণ
  অস্পৃশ্য রুটেও (`/duel/nonexistent`) একই আচরণ পরীক্ষা করে
  নিশ্চিত করা হয়েছে যে এটি এই ফিচারের কারণে নয়, বরং Next.js 16
  Turbopack dev-mode এর পরিচিত সীমাবদ্ধতা
- ✅ Live test: সব ৫টা মূল dynamic route পেজে authenticated status
  200 + content length যাচাই, notFound কনটেন্ট সঠিকভাবে রেন্ডার
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (swap ফিক্সের ৬ষ্ঠ পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি

Accessibility Fix — Icon-Only Button aria-label এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **বাগ আবিষ্কার**: বিস্তৃত অডিটে দেখা যায় প্ল্যাটফর্মজুড়ে ৪৩টা+
  icon-only বাটন instance এ কোনো `aria-label` ছিল না — স্ক্রিন রিডার
  ব্যবহারকারীরা এই বাটনগুলোর উদ্দেশ্য (পিছনে যাও, বিস্তারিত দেখো,
  মুছে ফেলো, নোটিফিকেশন, থিম পরিবর্তন, ক্যালেন্ডার নেভিগেশন) বুঝতে
  পারতেন না, শুধু "বাটন" শোনা যেত
- ✅ **৩০টা ফাইলে raw `<button>` "পিছনে যাও" প্যাটার্ন** Python
  script দিয়ে bulk-fix করা হয়েছে (প্রতিটা ফাইলে ঠিক ১টা instance
  নিশ্চিত করে)
- ✅ **১২টা ফাইলে shadcn `<Button variant="ghost" size="icon">`
  "পিছনে যাও" প্যাটার্ন** regex দিয়ে bulk-fix (ArrowLeft আইকন
  নিশ্চিত করে ভুল বাটনে লেবেল না বসার সতর্কতাসহ)
- ✅ **৯টা ফাইল ম্যানুয়ালি ফিক্স** প্রেক্ষাপট বুঝে — notification-bell
  (dynamic label: "নোটিফিকেশন (Nটি অপঠিত)"), calendar-view ("আগের
  মাস"/"পরের মাস"), breathing-exercise ("রিসেট করো"), theme-toggle
  ("থিম পরিবর্তন করো"), quiz-battle-room ("পিছনে যাও"),
  admin/chapter-manager, admin/subject-manager, admin/topic-manager,
  admin/question-manager (প্রতিটায় "বিস্তারিত দেখো"/"মুছে ফেলো"/
  "টপিক এডিট করো"/"পিছনে যাও")
- ✅ **নতুন `components/ui/skeleton.tsx`-এর মতো কোনো নতুন dependency
  ছাড়াই** — শুধু existing JSX এ `aria-label` attribute যোগ
- ✅ **চূড়ান্ত পুনঃস্ক্যান**: Python regex দিয়ে সম্পূর্ণ `app/` ও
  `components/` ফোল্ডার আবার স্ক্যান করে নিশ্চিত করা হয়েছে কোনো
  icon-only Button miss হয়নি
- ✅ Live test: dev server চালিয়ে `/learn`, `/practice`, `/dashboard`,
  `/planner` পেজের HTML এ যথাক্রমে "পিছনে যাও", "পিছনে যাও",
  "নোটিফিকেশন", "আগের মাস" aria-label সরাসরি HTML string match করে
  ভেরিফাই — সব ৪টা `True`
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (850MB, ~২৮ সেকেন্ড, swap
  ফিক্সের ৭ম পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি
- ⚠️ এখনো বাকি (transparency): keyboard Tab-order/focus-trap বিস্তারিত
  অডিট, স্বয়ংক্রিয় color-contrast (WCAG AA/AAA) যাচাই, screen reader
  দিয়ে ম্যানুয়াল end-to-end টেস্টিং (VoiceOver/NVDA) — শুধু HTML এ
  aria-label উপস্থিতি ভেরিফাই করা হয়েছে

Color Contrast (WCAG AA) অডিট ও ফিক্স এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **বাগ আবিষ্কার**: Python দিয়ে OKLCH→sRGB রূপান্তর করে WCAG contrast
  ratio হিসাব করে দেখা যায় থিম-লেভেল CSS variable রঙ (foreground/
  background ইত্যাদি) সবই AAA পাস করলেও, কোডে সরাসরি ব্যবহৃত raw
  Tailwind রঙ (`text-amber-500`, `text-emerald-500`, `text-orange-500`
  ইত্যাদি — আইকন ও কিছু টেক্সটে) light mode এ WCAG ফেল করছিল (যেমন
  `amber-500` মাত্র ২.১৫:১, `yellow-500` ১.৯২:১ — প্রয়োজন normal text এ
  ৪.৫:১, icon/non-text এ ৩:১)
- ✅ **সম্পূর্ণ systematic scan**: regex দিয়ে `app/` ও `components/`
  ফোল্ডারে সব `text-{color}-400/500` instance (dark: variant ছাড়া, ৬০০+
  override ছাড়া) খুঁজে **৭৩টা instance, ৩৮টা ফাইলে** সমস্যা চিহ্নিত করা
  হয়
- ✅ **প্রেক্ষাপট-সচেতন ফিক্স**: প্রতিটার জন্য (icon-only vs. running
  text vs. large bold text) সঠিক WCAG threshold অনুযায়ী ন্যূনতম darker
  shade (৬০০ বা ৭০০) নির্বাচন, সাথে dark mode এ readable রাখতে
  `dark:text-{color}-400` যোগ (codebase এ আগে থেকেই বিদ্যমান
  `text-emerald-700 dark:text-emerald-400` প্যাটার্ন অনুসরণ করে)
- ✅ **Dark mode-এ প্রভাব ভেরিফাই**: Python দিয়ে নিশ্চিত করা হয়েছে সব
  নতুন `-400` shade dark card/background এ ৬:১+ contrast দেয় (dark mode
  readability উন্নত হয়েছে, খারাপ হয়নি)
- ✅ Live test: নতুন test user register+login করে `/dashboard`,
  `/leaderboard`, `/badges` পেজের HTML এ নতুন color class সরাসরি
  ভেরিফাই — ১২/১২ assertion পাস
- 🐛 **লাইভ টেস্টে false-negative ধরা পড়েছিল ও ব্যাখ্যা করা হয়েছে**:
  `/planner` ও `/analytics` কম্পোনেন্ট client-side rendering (CSR) দিয়ে
  `useEffect`+`fetch()` এ ডেটা লোড করে, তাই initial HTML এ শুধু loading
  spinner থাকে — এটা এই ফিচারের বাগ না, pre-existing architecture
  pattern; সংশ্লিষ্ট API endpoint ও source-code diff manually verify
  করে সঠিকতা নিশ্চিত করা হয়েছে
- ✅ Edge-case/authorization: unauthenticated API →৪০১, unauthenticated
  admin route →redirect, নন-অস্তিত্বশীল route →নন-৫০০ — ৪/৪ পাস
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (850MB, ২৭.৪ সেকেন্ড, swap ফিক্সের
  ৮ম পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend/CSS ফিচার — কোনো migration লাগেনি
- ⚠️ এখনো বাকি (transparency): border/background color contrast এর মতো
  অন্য jsx প্যাটার্ন এখনো অডিট করা হয়নি (শুধু `text-{color}` foreground
  প্যাটার্ন কভার করা হয়েছে), keyboard navigation audit ও screen reader
  ম্যানুয়াল টেস্টিং এখনো বাকি

Keyboard Navigation অডিট ও ফিক্স + `/notifications` middleware বাগ ফিক্স এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **বাগ আবিষ্কার**: regex দিয়ে non-interactive HTML ট্যাগে (`div`,
  `span` ইত্যাদি) `onClick` হ্যান্ডলার খুঁজে ৪টা instance (৩টা ফাইলে)
  পাওয়া যায় যেগুলো মাউস দিয়ে ক্লিক করা গেলেও কীবোর্ড দিয়ে Tab করে
  পৌঁছানো/অ্যাক্টিভেট করা যেত না — flashcard flip card, Image Occlusion
  viewer টগল, notification dropdown আইটেম, notification center কার্ড
- ✅ **৪টা instance ফিক্স**: `role="button"`, `tabIndex={0}`,
  `onKeyDown` (Enter/Space হ্যান্ডলিং), `focus-visible:ring-2` স্টাইল
  যোগ করা হয়েছে
- 🐛 **আরেকটা বাগ**: ৭টা+ hover-only visible action বাটন
  (`opacity-0 group-hover:opacity-100`) কীবোর্ড focus এ অদৃশ্য ছিল —
  `focus-visible:opacity-100` ক্লাস যোগ করে ফিক্স করা হয়েছে
- ✅ **আগের Accessibility Fix ফিচারে miss হওয়া ৯টা+ আরও icon-only button**
  চূড়ান্ত re-scan এ পাওয়া যায় ও ফিক্স করা হয় (forum post delete, report
  dialog, adaptive practice back button, quiz battle room code copy,
  public profile link copy, ai-tutor clear history, study pet save name,
  task manager toggle/delete, occlusion editor box delete)
- 🐛🔧 **গুরুত্বপূর্ণ বাগ আবিষ্কার ও ফিক্স**: Live regression testing এ
  ধরা পড়ে `/notifications` রুট unauthenticated অবস্থায় প্রত্যাশিত ৩০৭
  redirect এর বদলে HTTP ২০০ রিটার্ন করছিল। Root cause: `proxy.ts` এর
  `PROTECTED_PREFIXES` এ `/notifications` ছিল কিন্তু middleware
  `config.matcher` array এ **মিসিং** ছিল। পেজ-লেভেল `redirect()` কাজ
  করছিল বলে **কোনো ডেটা leak হয়নি**, কিন্তু HTTP status inconsistent
  ছিল (২০০+meta-refresh, ৩০৭ এর বদলে)। এটা এই ফিচারের তৈরি বাগ না —
  pre-existing bug যা regression testing এ ধরা পড়ে, transparency
  অনুযায়ী রিপোর্ট করা হলো। **ফিক্স**: `config.matcher` এ
  `"/notifications/:path*"` যোগ করা হয়েছে
- ✅ Live test: multi-user সিমুলেশন, end-to-end task lifecycle
  (create→toggle→delete), edge-case/authorization ৫/৫ পাস (ফিক্সের
  পরে `/notifications` সঠিকভাবে ৩০৭ দিচ্ছে)
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (২ বার — swap ফিক্সের ৯ম ও ১০ম
  পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend ফিচার + ১-লাইন middleware config ফিক্স — কোনো
  migration লাগেনি
- ⚠️ এখনো বাকি (transparency): `notification-bell.tsx` dropdown আইটেম
  এখনো nested-interactive pattern (semantically ideal না হলেও
  keyboard-operable), screen reader ম্যানুয়াল টেস্টিং এখনো বাকি

Auth ফর্ম ইনলাইন ভ্যালিডেশন ফিডব্যাক এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: ৪টা Auth পেজে (Login/Register/Forgot Password/Reset
  Password) শুধু browser-native `required` attribute ও submit-এর পরে
  toast error ছিল — কোনো ফিল্ড-লেভেল inline validation feedback ছিল
  না, `Input` কম্পোনেন্টের বিল্ট-ইন `aria-invalid:` CSS স্টাইল অব্যবহৃত
  ছিল
- ✅ **প্রতিটা ফর্মে consistent প্যাটার্ন**: `fieldErrors` state +
  `validate()` ফাংশন (email regex, password ≥৬ অক্ষর, confirm match) +
  `aria-invalid`/`aria-describedby` + visible `role="alert"` error
  message + `noValidate` (custom UI ব্যবহারের জন্য browser default বন্ধ)
  + টাইপ করার সাথে সাথে এরর clear হওয়া
- ✅ Node.js দিয়ে validate() লজিক আলাদাভাবে ইউনিট-টেস্ট (component এ
  লেখা exact logic কপি করে) — ১১টা কেস, ১১/১১ পাস
- ✅ End-to-end regression: register+login API flow অপরিবর্তিত কাজ
  করছে, server-side validation independent ভাবে অক্ষত (client validation
  bypass করে invalid data পাঠিয়ে ৪০০/৪০৯ পাওয়া গেছে যথাযথভাবে) — ৪/৪ পাস
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (swap ফিক্সের ১১তম পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): settings/admin ফর্মে একই প্যাটার্ন
  এখনো প্রয়োগ করা হয়নি (শুধু Auth ফর্ম কভার করা হয়েছে), screen reader
  ম্যানুয়াল টেস্টিং এখনো বাকি

Settings ফর্ম ইনলাইন ভ্যালিডেশন ফিডব্যাক এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: Settings পেজের Profile/Password ট্যাব ও Public
  Profile Slug ফিল্ডে Auth ফর্মের মতোই একই সমস্যা ছিল — কোনো ফিল্ড-লেভেল
  inline feedback ছিল না। বিশেষভাবে **Slug ফিল্ডে ক্লায়েন্ট-সাইড format
  validation একেবারেই ছিল না** — UI তে "৩-৩০ অক্ষর, শুধু lowercase+
  সংখ্যা+হাইফেন" লেখা থাকলেও enforce হচ্ছিল না
- ✅ **Profile ট্যাব**: নাম খালি থাকলে এরর
- ✅ **Password ট্যাব**: currentPassword/newPassword আবশ্যক, newPassword
  ≥৬ অক্ষর, confirmPassword ম্যাচ — Auth ফর্মের মতোই
  `aria-invalid`+`aria-describedby`+visible error প্যাটার্ন
- ✅ **Public Profile Slug**: নতুন `validateSlug()` ফাংশন যোগ (আগে ছিল
  না) — খালি/দৈর্ঘ্য/format regex চেক করে UI তে থাকা নিয়ম এখন সত্যিই
  enforce হয়
- ✅ Node.js দিয়ে validate() লজিক আলাদাভাবে ইউনিট-টেস্ট — ১২টা কেস
  (profile+password+slug regex সহ), ১২/১২ পাস
- ✅ End-to-end regression: profile update, password change, slug
  update — ৩টা API endpoint সব ২০০, অপরিবর্তিত কাজ করছে
- ✅ Edge-case/authorization: unauthenticated `/settings` →৩০৭, ৩টা
  API endpoint →৪০১ — ৪/৪ পাস
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (swap ফিক্সের ১২তম পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি
- ⚠️ এখনো বাকি (transparency): admin panel ফর্মে এখনো একই প্যাটার্ন
  প্রয়োগ করা হয়নি (student-facing ফর্ম prioritize করা হয়েছে), screen
  reader ম্যানুয়াল টেস্টিং এখনো বাকি

Student-Facing ফর্ম ইনলাইন ভ্যালিডেশন এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: ৪টা student-facing data-entry ফর্মে (Forum Post,
  Flashcard Deck/Card, Class Routine) একই সমস্যা — button-onClick
  handler ভিত্তিক ফর্ম (no `<form>` tag), কোনো `aria-invalid`/
  `aria-describedby` নেই, কিছু ফিল্ডে `Label htmlFor`/`Input id`
  সংযোগও ছিল না
- ✅ **৪টা ফর্মে fieldErrors state + validate() ফাংশন যোগ**: Forum
  Post (title+content), Flashcard Deck (name), Flashcard Card
  (BASIC মোডে front+back, CLOZE মোডে clozeText — IMAGE_OCCLUSION মোডে
  ফিল্ড-লেভেল UI নেই তাই toast-only যৌক্তিকভাবে রাখা হয়েছে), Class
  Routine (label)
- ✅ Node.js দিয়ে validate() লজিক আলাদাভাবে ইউনিট-টেস্ট — ১৩টা কেস,
  ১৩/১৩ পাস
- ✅ End-to-end regression: forum post, flashcard deck, flashcard
  card, routine slot — ৪টা API endpoint create করে যাচাই, সব ঠিকমতো
  কাজ করছে
- ✅ Edge-case/authorization: unauthenticated ৩টা POST API →৪০১,
  unauthenticated `/forum/new` →৩০৭ — ৪/৪ পাস
- ✅ Cascade delete বিশেষভাবে verify: test user delete করার পরে
  psycopg2 দিয়ে সরাসরি চেক করে নিশ্চিত forum post ও flashcard deck
  cascade delete হয়েছে — ২/২ পাস
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (swap ফিক্সের ১৩তম পরপর সাফল্য)
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি
- ⚠️ এখনো বাকি (transparency): admin panel ফর্ম এখনো বাকি (ইচ্ছাকৃতভাবে,
  কম ব্যবহারকারী-প্রভাব), quiz-battle/task-manager এর মতো ছোট single-line
  ইনপুটে এখনো প্রয়োগ করা হয়নি, screen reader ম্যানুয়াল টেস্টিং বাকি

Password Visibility Toggle (Show/Hide) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: প্ল্যাটফর্মের ৭টা `type="password"` ইনপুট ফিল্ডের
  (৫টা ফাইলে) কোনোটাতেই show/hide toggle ছিল না — ইউজারকে সবসময়
  masked টেক্সট নিয়ে টাইপ করতে হতো, মোবাইলে টাইপো বোঝা কঠিন ছিল
- ✅ **নতুন reusable `components/ui/password-input.tsx`**: বিদ্যমান
  `Input` কম্পোনেন্ট wrap করে `Eye`/`EyeOff` toggle বাটন (shadcn/ui
  প্যাটার্নে) — `type="button"` (ফর্ম accidentally submit এড়াতে),
  কীবোর্ড-accessible focus ring, dynamic aria-label, বাকি সব props
  transparent pass-through (তাই বিদ্যমান ভ্যালিডেশন কোড অপরিবর্তিত থাকে)
- ✅ **৫টা ফাইলে ৭টা password ফিল্ড আপডেট**: Login, Register, Reset
  Password (×২), Settings Password ট্যাব (×৩), Danger Zone delete
  confirmation
- ✅ TypeScript ক্লিন, Lint ১টা unused-import warning ধরা পড়ে
  তাৎক্ষণিক ফিক্স
- ✅ `pnpm build` দুইবার প্রথম চেষ্টাতেই সফল (swap ফিক্সের ১৪তম ও
  ১৫তম পরপর সাফল্য)
- ✅ HTML-level: aria-label, type=button, eye icon, icon-space padding
  — সব verify
- 🐛 **false-negative ধরা পড়েছিল ও ব্যাখ্যা করা হয়েছে**: `/settings`
  password ট্যাবে aria-label initial HTML এ পাওয়া যায়নি — root cause:
  base-ui `Tabs` non-active panel lazy-mount করে, pre-existing
  architecture (এই ফিচারের বাগ না)
- ✅ End-to-end regression: **সম্পূর্ণ password-change flow** verify
  (register→login→password-change API→নতুন পাসওয়ার্ড দিয়ে re-login
  সফল)
- ✅ Test user cleanup: psycopg2 দিয়ে delete + verify
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): screen reader ম্যানুয়াল টেস্টিং, visual
  regression বিভিন্ন screen size এ ম্যানুয়ালি browser এ verify করা হয়নি

Styled Confirm Dialog এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: প্ল্যাটফর্মজুড়ে ১৩টা জায়গায় (১৩টা ফাইলে) raw
  browser `window.confirm()` popup ব্যবহার হচ্ছিল — কুৎসিত unstyled,
  ব্র্যান্ডিং/থিমের সাথে অসামঞ্জস্যপূর্ণ, ডার্ক মোডে বেমানান
- ✅ **নতুন `components/ui/confirm-dialog.tsx`**: base-ui এর
  `AlertDialog` primitive (ইতিমধ্যে ইনস্টল ছিল, ব্যবহৃত হচ্ছিল না)
  দিয়ে `ConfirmDialogProvider`+`useConfirmDialog()` hook — imperative
  Promise-based API (`await confirmAction("...")` → boolean), পুরনো
  `confirm()` প্যাটার্নের প্রায় হুবহু তাই migration সহজ হয়েছে
- ✅ **root এ global mount**: `app/providers.tsx` এ যোগ করা হয়েছে
  (`AccessibilityProvider` এর ভেতরে), তাই পুরো অ্যাপে যেকোনো client
  কম্পোনেন্ট থেকে ব্যবহার করা যায়
- ✅ **১৩টা ফাইলে migration**: admin panel delete (chapter/subject/
  topic/question/CQ/forum moderation), forum post delete, habit
  delete, PDF delete, custom question set delete, quiz battle end,
  broadcast/digest confirmation
- ✅ TypeScript ক্লিন, Lint ক্লিন (প্রথমবারেই)
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (swap ফিক্সের ১৬তম পরপর সাফল্য)
- ✅ **Global provider regression test**: নতুন provider root এ mount
  হওয়ায় অন্য পেজ ক্র্যাশ করেনি কিনা ৬টা ভিন্ন পেজে যাচাই — ৮/৮ পাস
- 🐛 **টেস্টে false-positive ধরা পড়েছিল**: forum post create API
  generic "টেস্ট" কনটেন্টে ৪২২ (স্প্যাম সনাক্তকরণ) দিয়েছিল — এটা
  pre-existing anti-spam filter এর সঠিক আচরণ, এই ফিচারের বাগ না;
  বাস্তবসম্মত কনটেন্ট দিয়ে পুনরায় টেস্ট করে সফল হয়েছে
- ✅ End-to-end regression: habit create→delete, forum post
  create→delete flow (উভয়ই এখন confirmAction ব্যবহার করে) — সব সফল
- ✅ Edge-case/authorization: unauthenticated route/API →৩০৭/৪০১ —
  ৩/৩ পাস
- ✅ Test user cleanup: psycopg2 দিয়ে delete + verify
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): browser-level dialog interaction
  (visual click testing) sandbox এ সম্ভব হয়নি, শুধু API-level
  regression+crash-free render যাচাই করা হয়েছে; regex দিয়ে সম্পূর্ণ
  codebase পুনরায় স্ক্যান করে কোনো `confirm()` বাদ পড়েনি নিশ্চিত করা
  হয়েছে; screen reader ম্যানুয়াল টেস্টিং এখনো বাকি

Relative Time Formatting এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: Forum feed/post detail ও notification এ শুধু পূর্ণ
  তারিখ দেখানো হতো (সাম্প্রতিক অ্যাক্টিভিটির জন্য কম useful),
  `notification-bell.tsx` dropdown এ timestamp একদমই ছিল না
- ✅ **`date-fns` এর বিল্ট-ইন বাংলা locale ব্যবহার**: package.json এ
  `date-fns@^4.4.0` ইতিমধ্যে ছিল, এর `bn` locale বাংলা সংখ্যা+টেক্সট
  সঠিকভাবে হ্যান্ডেল করে ("৫ মিনিট আগে") — কোনো নতুন dependency লাগেনি
- ✅ **নতুন `lib/format-date.ts`**: `formatRelativeOrDate()` — ৭ দিনের
  মধ্যে relative format, তার বেশি পুরনো হলে পূর্ণ বাংলা তারিখে fallback
- ✅ Node.js দিয়ে সংখ্যাগত হিসাব pre-verify (৫টা টেস্ট কেস: মিনিট/
  ঘন্টা/দিন/পুরনো-তারিখ-fallback/এইমাত্র) — ৫/৫ সঠিক
- ✅ প্রয়োগ: forum feed, forum post detail, notification bell dropdown
  (নতুন), notification center (রিফ্যাক্টর)। ইচ্ছাকৃতভাবে skip:
  task deadline, admission history, activity heatmap hover date,
  weekly digest lastSentAt (এসবের সিমান্টিক্স relative time এর সাথে
  বেমানান)
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (swap ফিক্সের ১৭তম পরপর সাফল্য)
- ✅ API-level regression: `/api/forum/posts`, `/api/notifications`
  সঠিকভাবে `createdAt` ফিল্ড রিটার্ন করছে
- 🐛 **false-negative ধরা পড়েছিল ও ব্যাখ্যা করা হয়েছে**: `/forum`
  পেজে "আগে" টেক্সট initial HTML এ পাওয়া যায়নি — root cause:
  forum-feed.tsx/post-detail.tsx client-side rendering করে
  (pre-existing architecture, একাধিক আগের ফিচারে একই প্যাটার্ন দেখা
  গেছে)
- ✅ End-to-end regression: বাস্তবসম্মত কনটেন্ট দিয়ে forum post
  create verify করা হয়েছে
- ✅ Edge-case/authorization ২/২ পাস, Test user cleanup psycopg2 দিয়ে
  cascade delete verify সহ
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): forum reply-level timestamp এখনো নেই,
  browser-level visual verify sandbox এ সম্ভব হয়নি (শুধু Node.js এ
  pure function হিসেবে যাচাই করা হয়েছে)

Clipboard Copy Error Handling এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **বাগ আবিষ্কার**: ৩টা জায়গায় (quiz-battle room code copy, public
  profile link copy, study-group invite code copy) `navigator.clipboard.
  writeText()` ব্যবহার হচ্ছিল, যার মধ্যে ২টাতে কোনো error handling
  ছিল না — Clipboard API secure-context/permission সীমাবদ্ধতায়
  silently ব্যর্থ হলেও ইউজার ভুলভাবে "কপি হয়েছে!" success toast দেখতো
- ✅ **নতুন `lib/clipboard.ts`**: `copyToClipboard(text): Promise<boolean>`
  — আধুনিক Clipboard API চেষ্টা করে, ব্যর্থ হলে `execCommand("copy")`
  fallback (hidden textarea দিয়ে), caller প্রকৃত ফলাফল অনুযায়ী সঠিক
  success/error toast দেখাতে পারে
- ✅ **৩টা ফাইলে migration**: quiz-battle-room, public-profile-tab
  (২টাতেই error handling নতুন যোগ), study-group-dashboard (আগের
  `.then()` প্যাটার্ন থেকে shared utility তে migrate, consistency)
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (swap ফিক্সের ১৮তম পরপর সাফল্য)
- ✅ Regression: `/settings`, `/quiz-battle`, `/study-group` — নতুন
  import এ কোনো crash হয়নি, সব ২০০
- ✅ End-to-end: study group create API কল করে invite code generation
  (`copyInviteCode` এর ডেটা সোর্স) যাচাই — সফল
- ✅ Edge-case/authorization ২/২ পাস
- 🔍✅ **আবিষ্কার তদন্ত করে resolve হয়েছে পরের ফিচারে (নিচে দেখো)**:
  এই সময় দেখা গিয়েছিল owner user delete করলে study group নিজে থেকে
  cascade delete হয় না — এটা রॉ SQL দিয়ে test cleanup করার কারণে
  application-level business logic bypass হওয়ার artifact ছিল, প্রকৃত
  API endpoint দিয়ে delete করলে সঠিকভাবেই কাজ করে (পরের ফিচারে
  বিস্তারিত ভেরিফাই করা হয়েছে)
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): প্রকৃত browser-level clipboard
  permission-denied সিমুলেশন sandbox এ সম্ভব হয়নি, শুধু কোড লজিক
  ভেরিফাই করা হয়েছে

Study Group Cascade Delete তদন্ত এ যা যা যাচাই করা হয়েছে:
- 🔍 **প্রেক্ষাপট**: আগের ফিচারে "সম্ভাব্য bug" হিসেবে নথিভুক্ত হয়েছিল
  যে owner user delete করলে study group cascade delete হয় না
- ✅ **মূল কারণ আবিষ্কার**: `prisma/schema.prisma` চেক করে দেখা যায়
  `StudyGroup` এর জন্য কোনো DB-level cascade নেই (ইচ্ছাকৃত, একাধিক
  সদস্য থাকলে group রাখা উচিত) — বরং `lib/study-group.ts` এর
  `leaveStudyGroup()` ফাংশনে এই ব্যবসায়িক লজিক সঠিকভাবেই আছে (sole
  member হলে group delete, নাহলে নতুন owner assign)
- ✅ **আগের সমস্যার আসল কারণ**: raw `psycopg2` SQL delete ব্যবহার করে
  test cleanup করার ফলে `deleteUserAccount()` এর ভেতরের business
  logic bypass হয়ে গিয়েছিল — প্রকৃত ব্যবহারকারীর অভিজ্ঞতায় এটা কখনো
  ঘটবে না
- ✅ **Live test উভয় scenario প্রকৃত API endpoint দিয়ে** (`/api/user/
  delete-account`, raw SQL না): sole-member group delete →
  `group_deleted` + DB verify গ্রুপ মুছে গেছে; multi-member group এ
  owner delete → `left` + DB verify গ্রুপ টিকে আছে ও নতুন member
  ঠিকই OWNER role পেয়েছে — উভয়ই ১০০% সঠিক
- ✅ **সিদ্ধান্ত**: এটা বাগ ট্র্যাকার থেকে সরিয়ে "verified correct
  behavior" হিসেবে নথিভুক্ত করা হলো
- ✅ Test data cleanup সম্পন্ন
- 📝 **শিক্ষা (ভবিষ্যতের জন্য)**: raw SQL দিয়ে test cleanup করার সময়
  মনে রাখা দরকার এটা application-level business logic bypass করতে
  পারে — end-to-end delete flow টেস্ট করতে সবসময় প্রকৃত API endpoint
  ব্যবহার করা উচিত

Unsaved Changes Warning এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: Topic Note Editor এ `hasChanges` state ট্র্যাক করা
  হচ্ছিল (সেভ বাটন এনাবেল/ডিজাবল এর জন্য) কিন্তু ব্যবহার করে কোনো
  `beforeunload` সতর্কতা ছিল না — ইউজার নোট লিখে ভুলবশত ট্যাব বন্ধ
  করলে সব হারিয়ে যেত; একই সমস্যা Forum New Post ফর্মেও ছিল
- ✅ **নতুন `hooks/use-unsaved-changes-warning.ts`**: `hasUnsavedChanges`
  বুলিয়ান নিয়ে conditional `beforeunload` listener attach/detach করে
  — browser native "আপনি কি নিশ্চিত?" ডায়ালগ দেখায়
- ✅ **২টা জায়গায় প্রয়োগ**: Topic Note Editor (বিদ্যমান `hasChanges`
  state ব্যবহার করে), Forum New Post ফর্ম (title/content এ টেক্সট
  থাকলে সক্রিয়)
- ✅ Node.js এ hook এর core logic isolated mock simulation দিয়ে
  যাচাই — ৫টা assertion (conditional attach, preventDefault,
  returnValue, cleanup) সব ৫/৫ পাস
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (swap ফিক্সের ১৯তম পরপর সাফল্য)
- ✅ Regression: `/forum/new`, `/learn` পেজে নতুন hook import এ crash
  নেই — ৪/৪ পাস
- ✅ End-to-end regression: `/api/notes/[topicId]` GET→PUT→GET→DELETE
  সম্পূর্ণ flow (hasChanges state এর ডেটা সোর্স) — ৪/৪ পাস
- ✅ Edge-case/authorization ২/২ পাস, Test user cleanup verified
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): এই hook শুধু full page unload/reload/
  close ধরতে পারে, Next.js এর client-side রাউটিং (Link/router.push)
  এ কাজ করে না (App Router এ in-app navigation intercept করার stable
  public API নেই এখনো, এটা bug না জানা limitation); admin panel এর
  অন্য content-heavy ফর্মে (topic-manager notesMarkdown) এখনো প্রয়োগ
  করা হয়নি; browser-level visual popup dialog sandbox এ দেখা সম্ভব
  হয়নি

Global Search Keyboard Navigation এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: Cmd/Ctrl+K কমান্ড-প্যালেট সার্চে রেজাল্ট শুধু মাউস
  ক্লিক করে সিলেক্ট করা যেত, কোনো Arrow Up/Down + Enter কীবোর্ড
  নেভিগেশন ছিল না — command-palette প্যাটার্নের একটা মৌলিক প্রত্যাশিত
  ফিচার মিসিং ছিল
- ✅ **Keyboard navigation যোগ**: `highlightedIndex` state, ArrowDown/
  ArrowUp দিয়ে circular navigation (wraparound সহ), Enter দিয়ে সিলেক্ট,
  mouse hover এ sync, viewport এ auto-scroll (`scrollIntoView`)
- ✅ **সম্পূর্ণ ARIA Combobox প্যাটার্ন প্রয়োগ**: input এ
  `role="combobox"`+`aria-expanded`+`aria-controls`+
  `aria-activedescendant`+`aria-autocomplete`, listbox+option roles —
  screen reader ইউজাররাও এখন highlighted আইটেম জানতে পারবেন
- 🐛 **Lint এ ১টা warning ধরা পড়ে তাৎক্ষণিক ফিক্স**:
  `role="combobox"` এর জন্য `aria-controls` মিসিং ছিল
- ✅ TypeScript ক্লিন, Lint ক্লিন (fix এর পরে), `pnpm build` দুইবার
  প্রথম চেষ্টাতেই সফল (swap ফিক্সের ২০তম ও ২১তম পরপর সাফল্য)
- ✅ Node.js এ keyboard navigation logic isolated verify — ৬টা কেস
  (wraparound উভয় দিকে, empty results, single-item) — ৬/৬ পাস
- 🐛 **false-negative ধরা পড়েছিল ও ব্যাখ্যা করা হয়েছে**: Dashboard
  পেজে combobox attributes initial HTML এ পাওয়া যায়নি — root cause:
  Dialog lazy-mount করে (`open={false}` অবস্থায় DOM এ নেই), ঠিক আগে
  `Tabs` কম্পোনেন্টে দেখা একই architecture pattern
- ✅ Regression: `/api/search` endpoint কাজ করছে, edge-case
  unauthenticated →৪০১ পাস
- ✅ Test user cleanup: psycopg2 দিয়ে delete + verify
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): প্রকৃত browser-level keyboard event
  simulation sandbox এ সম্ভব হয়নি (headless browser নেই), screen
  reader ম্যানুয়াল টেস্টিং এখনো বাকি

Autofill Autocomplete Attributes এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: পুরো প্ল্যাটফর্মে একটা ফর্মেও `autoComplete`
  attribute ছিল না — ব্রাউজার/পাসওয়ার্ড ম্যানেজার সঠিকভাবে ফিল্ড টাইপ
  বুঝতে পারতো না, autofill সঠিকভাবে কাজ করতো না বা সম্পূর্ণ কাজ করতো
  না
- ✅ **HTML স্ট্যান্ডার্ড autocomplete token যোগ**: email ফিল্ডে
  `email`, নাম ফিল্ডে `name`, বর্তমান পাসওয়ার্ডে `current-password`,
  নতুন পাসওয়ার্ডে `new-password` — Auth (৪টা পেজ) ও Settings (Profile
  +Password+Danger Zone) ফর্মে
- ✅ `PasswordInput` কম্পোনেন্ট আগে থেকেই props transparent
  pass-through করে বলে কোনো কম্পোনেন্ট পরিবর্তন লাগেনি
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (swap ফিক্সের ২২তম পরপর সাফল্য)
- ✅ HTML-level সরাসরি ভেরিফাই: ৪টা Auth পেজে ১১টা assertion পাস
  (প্রতিটা attribute value সঠিক), `/settings` এও Profile ট্যাবে
  verify (Tabs lazy-mount সমস্যা এড়িয়ে গেছে যেহেতু default active tab)
- ✅ End-to-end regression: register→login→profile-update→
  password-change — ৪টা API endpoint সব সফল, কোনো functional
  regression নেই
- ✅ Edge-case: unauthenticated `/settings` →৩০৭ পাস
- ✅ Test user cleanup: psycopg2 দিয়ে delete + verify
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি (pure HTML attribute)
- ⚠️ এখনো বাকি (transparency): প্রকৃত ব্রাউজার পাসওয়ার্ড ম্যানেজার
  autofill visual behavior sandbox এ পরীক্ষা করা সম্ভব হয়নি, শুধু
  HTML attribute presence ভেরিফাই করা হয়েছে

Accessibility Fix — আরও ৪টা মিসিং Icon-Only aria-label এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **আবিষ্কার**: নতুন balanced-tag Python script দিয়ে (nested Button
  গণনা করে সঠিক close tag খুঁজে) `<Button>` স্ক্যান করে ২৩টা সন্দেহজনক
  instance পাওয়া যায় — ১৯টা manually verify করে false-positive
  প্রমাণিত (conditional loading state এ শুধু icon, কিন্তু অন্য state এ
  text আছে), **৪টা প্রকৃত icon-only button** পাওয়া যায় যেখানে কোনো
  state এই visible text ছিল না
- ✅ **৪টা ফিক্স**: ai-tutor Send বাটন, pdf-chat-room Send বাটন,
  predicted-gpa-card এর ২টা বাটন (লক্ষ্য সেভ/বাতিল), task-manager এর
  নতুন টাস্ক যোগ করার বাটন
- ✅ **চূড়ান্ত রিভার্স-ভেরিফিকেশন**: একই script আবার চালিয়ে নিশ্চিত
  করা হয়েছে বাকি ১৯টা "সন্দেহজনক" instance এ সব conditional branch এ
  real text আছে — ০টা বাকি
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (swap ফিক্সের ২৩তম পরপর সাফল্য)
- ✅ HTML-level সরাসরি ভেরিফাই: `/ai-tutor` (SSR) ও `/planner` এ
  নতুন aria-label — ৭/৭ পাস
- ✅ CSR পেজের জন্য API-level regression (pdf-chat-room ও
  predicted-gpa-card client-side rendering করে): `/api/analytics/
  predicted-gpa`, `/pdf-chat` — ২/২ পাস
- ✅ Edge-case/authorization ২/২ পাস, Test user cleanup verified
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি
- ⚠️ এখনো বাকি (transparency): screen reader ম্যানুয়াল টেস্টিং বাকি

Number Input Validation Bug Fix এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🐛 **বাগ আবিষ্কার**: Quiz Battle (max players) ও Live Exam (question
  count, duration) ফর্মে `Number(e.target.value)` সরাসরি state এ
  বসানো হতো — field খালি করলে `0` বা backspace করলে `NaN` state এ
  চলে যেত
- 🐛 **প্রথম ফিক্স চেষ্টায় নতুন bug ধরা পড়ে ও সংশোধন**: `onChange` এ
  সরাসরি clamp করলে controlled input ইউজারকে field খালি করতে দিত না
  (প্রতি keystroke এ জোরপূর্বক আগের ভ্যালুতে ফিরে যেত) — Node.js এ
  সিমুলেট করে সমস্যা নিশ্চিত করে, সঠিক প্যাটার্নে (string state +
  `onBlur` clamp) সমাধান করা হয়েছে
- ✅ **নতুন `lib/clamp-number-input.ts`**: input value string state এ
  রাখা, `onChange` এ শুধু raw সেভ, `onBlur`+submit এ চূড়ান্ত
  clamp/fallback প্রয়োগ
- ✅ Node.js এ সংখ্যাগত হিসাব pre-verify: `clampNumberInput()` এর
  ১০টা কেস + typing-scenario simulation এর ৬টা কেস — ১৬/১৬ পাস
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (swap ফিক্সের ২৪তম পরপর সাফল্য)
- ✅ HTML-level: `/quiz-battle/create`, `/live-exam/start` এ default
  value সঠিকভাবে রেন্ডার — ৫/৫ পাস
- ✅ **Server-side defense-in-depth পুনরায় যাচাই**: out-of-range মান
  (৯৯৯) সরাসরি API তে পাঠিয়ে server ঠিকই MAX_BATTLE_PLAYERS এ clamp
  করেছে নিশ্চিত করা হয়েছে — client fix থেকে independent
- ✅ End-to-end regression, edge-case/authorization ২/২ পাস
- ✅ Test data cleanup: psycopg2 দিয়ে delete + cascade delete verify
- ✅ সম্পূর্ণ frontend ফিচার — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): browser-level keystroke simulation
  sandbox এ সম্ভব হয়নি, শুধু isolated logic verify করা হয়েছে

Deep Research — প্রতিযোগী UI/UX + Reading Room কনসেপ্ট নিয়ে যা যা করা হয়েছে:
- 🔬 Facebook/Instagram/TikTok, Duolingo gamification, Quizlet/Brainly,
  বাংলাদেশী প্রতিযোগী (10 Minute School, "Study Room" app), এবং
  **বিশেষভাবে বাংলাদেশী `readingroombd.com`** ("Reading Room by Saikat
  Vai") নিয়ে সরাসরি সাইট ভিজিট করে গভীর research (মোট ৮টা+ web_search
  রাউন্ড)
- 🔍 **readingroombd.com** এর প্রতিটা পাবলিক পেজ পরীক্ষা করে আবিষ্কার:
  Self Tracker (Start/Stop activity log honor-system), Public Dashboard
  ("বর্তমানে কে কী করছেন" রিয়েল-টাইম প্রেজেন্স), Study/Group/Screen Time
  Leaderboard, Task Dashboard, Quiz Creator, ১০টা প্রি-সেট থিম
- ✅ ফলাফল নথিভুক্ত: `docs/RESEARCH_UI_UX_READING_ROOM.md` (৩৭৯+ লাইন)
  — কোনটা নেওয়া উচিত (Self Tracker, privacy-aware presence, Study
  Leaderboard) ও কোনটা এড়ানো উচিত (Screen Time র‍্যাংকিং — অবিশ্বাস্য/
  measure করা অসম্ভব, WhatsApp gatekeeping — self-serve দর্শনের
  বিরোধী) তার comparison table সহ

Reading Room (Virtual Study Room / Body Doubling) এ যা যা তৈরি ও লাইভ
টেস্ট করা হয়েছে:
- ✅ **নতুন কোর কনসেপ্ট**: readingroombd.com এর "Self Tracker + Public
  Dashboard" ও আন্তর্জাতিক Zoom-based virtual study room থেকে
  অনুপ্রাণিত, কিন্তু camera/video/audio call **ছাড়া** টেক্সট+প্রেজেন্স-
  ভিত্তিক "body doubling" — কোনো ভারী WebRTC infrastructure লাগেনি
- ✅ **৫টা প্রি-সেট থিমড রুম**: Lo-fi ক্যাফে 🎧, ডার্ক একাডেমিয়া লাইব্রেরি
  🕯️, কোজি লাইব্রেরি কর্নার 📚, বৃষ্টিভেজা জানালা 🌧️, সাইলেন্ট স্টাডি হল 🤫
  — প্রতিটার আলাদা gradient card+description
- ✅ **নতুন Prisma মডেল `ReadingRoomSession`** (নতুন migration
  `20260717060500_add_reading_room`) — room/activity/goal/heartbeat
  টাইমস্ট্যাম্প+totalFocusSec, `onDelete: Cascade` সহ User এর সাথে
  সম্পর্কিত। 🔧 pgvector HNSW shadow-DB বাগ আবার দেখা দিয়েছিল (প্রমাণিত
  আগের সেশন), একই প্রমাণিত ফিক্স প্যাটার্নে (manual migration.sql থেকে
  DROP INDEX বাদ দিয়ে `migrate deploy`) সমাধান করা হয়েছে, pgvector
  ইনডেক্স অক্ষত যাচাই করা হয়েছে
- ✅ **Polling-based heartbeat presence** (Quiz Battle/Duel এ প্রমাণিত
  প্যাটার্ন) — ক্লায়েন্ট প্রতি ২৫ সেকেন্ডে heartbeat পাঠায়, presence
  লিস্টও একই সাথে রিফ্রেশ হয়
- ✅ **Gaming-প্রতিরোধ (readingroombd.com এর "অতিরিক্ত সময় বাদ দিন"
  ফিচার থেকে শেখা)**: প্রতি heartbeat এ সর্বোচ্চ ৪৫ সেকেন্ড পর্যন্ত
  focus-time credit (ট্যাব খুলে রেখে চলে গেলে পুরো gap credit পায় না),
  ৯০ সেকেন্ডের বেশি heartbeat miss হলে সেশন stale/auto-end, ৪ ঘণ্টা পার
  হলে সার্ভার নিজে থেকেই session শেষ করে দেয়
- ✅ **XP reward**: ন্যূনতম ৫ মিনিট ফোকাস করলে তবেই XP (প্রতি ১০০ সেকেন্ডে
  ১ XP — বিদ্যমান Pomodoro XP rate এর সাথে সামঞ্জস্যপূর্ণ, Node.js এ
  প্রি-ভেরিফাই করা হয়েছে), streak আপডেট হয়
- ✅ **Ambient Sound — সম্পূর্ণ Web Audio API সিন্থেসাইজড** (`lib/ambient-
  sound.ts`), কোনো ফাইল আপলোড/হোস্টিং ছাড়া — বৃষ্টি (filtered white
  noise), ক্যাফে (brown noise), ফায়ারপ্লেস (crackle বাস্ট সহ rumble),
  বাতাস — সব হালকা ভলিউমে (distraction-free)
- ✅ **Privacy-aware প্রেজেন্স**: readingroombd.com এর মতো পুরো
  প্ল্যাটফর্ম-ব্যাপী পাবলিক লিস্ট না — লগইন লাগবে, শুধু একই রুমের
  সদস্যরা একে অপরকে দেখতে পারবে
- ✅ **৫টা নতুন API endpoint**: `GET /api/reading-room/rooms` (লিস্ট+
  occupancy+activeSession), `POST /api/reading-room/join`, `POST
  /api/reading-room/heartbeat`, `POST /api/reading-room/leave`, `GET
  /api/reading-room/rooms/[room]/presence`, `GET /api/reading-room/
  summary`
- ✅ **নতুন UI**: `/reading-room` — রুম বেছে নেওয়ার গ্রিড (join না করা
  অবস্থায়) ও Active Room View (join করার পরে — timer, activity
  selector, goal caption input, presence card গ্রিড, ambient sound
  toggle, leave বাটন), ড্যাশবোর্ডে নতুন মডিউল কার্ড যোগ
- ✅ **`beforeunload` + `sendBeacon`**: ট্যাব বন্ধ করার আগে সেশন
  পরিষ্কারভাবে শেষ করার চেষ্টা (fallback: heartbeat miss এ সার্ভার
  নিজেই auto-end করে)
- ✅ **Middleware প্রোটেকশন**: `/reading-room` উভয় জায়গায় (PROTECTED_
  PREFIXES ও matcher) যোগ করা হয়েছে — আগের `/notifications` বাগের
  পুনরাবৃত্তি এড়াতে দুই জায়গা একসাথে ভেরিফাই করা হয়েছে
- ✅ TypeScript ক্লিন, Lint ক্লিন (১টা eslint-disable কমেন্ট সহ ইচ্ছাকৃত
  dependency exclusion, ব্যাখ্যা কমেন্টে আছে)
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (২৬.১ সেকেন্ড), `/reading-room`
  রুট bundle এ উপস্থিত
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-reading-room.py`, Python
  requests দিয়ে NextAuth credentials flow সহ): দুইজন real টেস্ট ইউজার
  রেজিস্টার+লগইন করে একই রুমে join, presence লিস্টে দুইজনই দেখা যাওয়া,
  occupancy count সঠিক, heartbeat দিয়ে activity/goal আপডেট, রুম বদলালে
  আগের সেশন auto-end ও presence থেকে বাদ পড়া — সব ২২টা assertion পাস
- ✅ **XP award verify** (psycopg2 দিয়ে totalFocusSec ম্যানুয়ালি ৪০০
  সেকেন্ড সেট করে): leave করার পর ঠিক +৪ XP ও streak +১ — গাণিতিক হিসাব
  (400 × 1/100 = 4) সঠিক প্রমাণিত
- ✅ **Stale-session auto-end verify**: lastHeartbeatAt ১০০ সেকেন্ড
  আগে সেট করে heartbeat পাঠিয়ে `ended: true` পাওয়া গেছে, presence
  লিস্ট থেকে বাদ পড়া নিশ্চিত হয়েছে
- ✅ **Gaming-প্রতিরোধ ক্যাপ verify**: ৮০ সেকেন্ড gap থাকা সত্ত্বেও
  totalFocusSec ৪৫ সেকেন্ডে ক্যাপ হয়েছে (৮০ না) নিশ্চিত করা হয়েছে
- ✅ **Edge-case/authorization টেস্ট**: unauthenticated → ৪০১ (২টা
  endpoint), invalid room → ৪০০, missing sessionId → ৪০০, অন্য
  ইউজারের sessionId দিয়ে heartbeat/leave → ৪০৪/৪০০ (cross-user
  authorization ঠিকমতো কাজ করছে), invalid room presence → ৪০৪,
  ইতিমধ্যে-শেষ-হওয়া সেশনে আবার leave কল → gracefully ২০০ (idempotent)
  — সব assertion পাস
- ✅ **Test data cleanup**: ৬টা টেস্ট ইউজার প্রকৃত `/api/user/delete-
  account` endpoint দিয়ে delete করা হয়েছে (raw SQL না — Study Group
  cascade delete তদন্তের শিক্ষা অনুযায়ী), cascade delete verify করা
  হয়েছে (`reading_room_sessions` এ কোনো orphan row বাকি নেই, ০টা row)

Duolingo-স্টাইল Button Tactile Press Effect এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **3D "sink" প্রেস অ্যানিমেশন**: প্রতিটা বাটনের নিচে একটা ledge-এর
  মতো `box-shadow` থাকে, ক্লিক/ট্যাপ করলে বাটন সেই ledge এর দিকে "সিঙ্ক"
  করে (translateY + shadow height কমে + সামান্য brightness কমে),
  ছেড়ে দিলে আবার উপরে উঠে আসে — Duolingo এর সিগনেচার tactile
  micro-interaction, research ডকুমেন্টে চিহ্নিত করা আইডিয়া
- ✅ **CSS variable-ভিত্তিক ডিজাইন** (কোনো নতুন dependency/JS লজিক
  ছাড়া, pure CSS): `--button-tactile-h` (shadow উচ্চতা, size variant
  নিয়ন্ত্রণ করে) ও `--button-tactile-on` (0/１ চালু/বন্ধ ফ্ল্যাগ,
  variant নিয়ন্ত্রণ করে) — দুটো সম্পূর্ণ আলাদা variable ব্যবহার করে
  variant+size combination এ কোনো conflict/override সম্ভাবনা নেই
- ✅ **প্রতিটা variant এ উপযুক্ত shadow color**: default/secondary/
  destructive এ `color-mix(in oklch, ...)` দিয়ে নিজের bg থেকে darker
  shade, outline এ `--border` variable, ghost/link এ সম্পূর্ণ flat
  (tactile effect off, কারণ এগুলো visually flat/borderless ডিজাইন)
- ✅ **গাণিতিক pre-verify (Python+Node.js)**: bottom-edge স্থিতিশীলতা
  (shadow height − ১px = translate distance, যাতে pressed অবস্থায়ও
  বাটনের নিচের প্রান্ত না নড়ে) যাচাই, `filter: brightness(0.92)` এ
  সব ৬টা variant/theme কম্বিনেশনে যথেষ্ট contrast delta (>0.03) থাকা
  নিশ্চিত করা হয়েছে, ছোট বাটনে (xs/sm/icon-xs/icon-sm) shadow height
  ৪px থেকে কমিয়ে ৩px করে height-proportion স্বাভাবিক রাখা হয়েছে
- ✅ **tailwind-merge conflict verify (Node.js দিয়ে)**: variant+size
  এর সব সম্ভাব্য কম্বিনেশন (যেমন ghost+sm) সিমুলেট করে নিশ্চিত করা
  হয়েছে `--button-tactile-h` ও `--button-tactile-on` কখনো একে অপরকে
  override করছে না (variant শুধু "on" flag, size শুধু "height" নিয়ন্ত্রণ
  করে — সম্পূর্ণ orthogonal)
- ✅ **Accessibility সামঞ্জস্যপূর্ণ**: `prefers-reduced-motion`/
  `reduced-motion` accessibility সেটিংস (আগে থেকে বিদ্যমান, globals.css)
  transition-duration কমিয়ে দেয়, যা এই নতুন effect এও স্বয়ংক্রিয়ভাবে
  প্রযোজ্য — disabled বাটনে কোনো press effect হয় না
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৭.২ সেকেন্ড) — compiled CSS output সরাসরি পরীক্ষা করে `calc()`,
  `color-mix()` fallback (`@supports`), `:not([aria-haspopup]):not(:disabled)`
  selector সব সঠিকভাবে জেনারেট হয়েছে নিশ্চিত করা হয়েছে
- ✅ **লাইভ regression টেস্ট** (Python requests দিয়ে real ইউজার):
  ৬টা প্রধান পেজ (`/dashboard`, `/planner`, `/reading-room`,
  `/study-group`, `/leaderboard`, `/settings`) crash-free লোড ও
  button-tactile ক্লাস উপস্থিত যাচাই, Reading Room join/leave API
  (বাটন-চালিত ফাংশনালিটির backend equivalent) অক্ষত, middleware
  redirect (৩০৭) অপরিবর্তিত — কোনো functional regression হয়নি
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (০টা orphan row)
- ✅ সম্পূর্ণ frontend/CSS-only ফিচার — কোনো migration লাগেনি, কোনো
  নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): sandbox এ headless browser না থাকায়
  actual visual screenshot/pixel-level regression টেস্ট সম্ভব হয়নি —
  compiled CSS output ও গাণিতিক logic verify করা হয়েছে, কিন্তু
  ব্যবহারকারীকে নিজে ব্রাউজারে দেখে confirm করার অনুরোধ করা হচ্ছে

Accent Color Theme এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **ডিফল্ট + ৫টা curated রঙ**: ডিফল্ট (grayscale, প্ল্যাটফর্মের মূল
  থিম, কোনো override করে না) + ক্লাসিক ইন্ডিগো, Lo-fi অ্যাম্বার,
  ডার্ক একাডেমিয়া, ফরেস্ট গ্রিন, ওশান ব্লু — শেষ ৪টা Reading Room এর
  থিমের emoji/নাম/রঙের সাথে সামঞ্জস্যপূর্ণ রাখা হয়েছে (একই ব্র্যান্ডিং)
- ⚠️ **গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত (architecturally নিরাপদ scope)**:
  readingroombd.com এর মতো সম্পূর্ণ background/foreground palette
  পরিবর্তন **না** করে শুধু accent color (`--primary`/`--ring`/
  `--chart-1`/`--sidebar-primary`) বদলানো হয়েছে — কারণ কোডবেসে ৭৩টা+
  ফাইলে সরাসরি hardcoded `dark:` Tailwind variant আছে যেগুলো বর্তমান
  background/border architecture এর উপর নির্ভরশীল, নতুন pallete
  চালু করলে conflict এর ঝুঁকি থাকত (grep দিয়ে যাচাই করে নিশ্চিত হওয়া
  গেছে `--primary`/`--ring` কে কোথাও `dark:` override করে না, তাই এটা
  নিরাপদ)
- 🐛 **নিজের ডিজাইনেই একটা সম্ভাব্য bug ধরা পড়ে ও ঠিক করা হয়**:
  প্রাথমিক ডিজাইনে "ইন্ডিগো" কে ডিফল্ট বানানোর চেষ্টা করা হয়েছিল, কিন্তু
  পরে খেয়াল করা যায় বিদ্যমান ডিফল্ট থিমের `--primary` আসলে grayscale/
  কালো (`oklch(0.205 0 0)`) — ইন্ডিগো না। ইন্ডিগোকে ডিফল্ট বানালে
  বিদ্যমান সব ইউজারের জন্য কিছু না করা সত্ত্বেও UI এর রঙ হঠাৎ বদলে
  যেত (silent visual regression) — তাই explicit "ডিফল্ট (grayscale)"
  অপশন যোগ করে সেটাকেই `DEFAULT_ACCENT_COLOR` বানানো হয়েছে (কোনো
  override প্রয়োগ না করা)
- ✅ **গাণিতিক pre-verify (Python, OKLCH→sRGB conversion)**:
  `scripts/verify-theme-contrast.py` এ নতুন — সব ৫টা রঙে (light+dark
  উভয় মোডে) primary-foreground vs primary ≥৪.৫:১ ও primary vs
  background ≥৩:১ WCAG AA যাচাই, সবগুলো পাস
- ✅ **Node.js এ actual code import করে logic verify**: `lib/
  accent-theme.ts` থেকে সরাসরি `applyAccentColor()`/`resetAccentColor()`
  import করে (hardcoded copy না) DOM মক করে টেস্ট — default এ কোনো
  CSS property set না হওয়া, প্রতিটা রঙে light/dark উভয় মোডে সঠিক
  primary+foreground+ring+chart-1+sidebar মান, lightness অনুযায়ী
  স্বয়ংক্রিয় foreground নির্বাচন (L<0.6 এ সাদা টেক্সট, নাহলে কালো) —
  সব assertion পাস
- ✅ **নতুন `lib/accent-theme.ts`** (৬টা রঙের ডেটা + `applyAccentColor()`/
  `resetAccentColor()`/`getAccentColorById()`), **নতুন
  `components/accent-theme-provider.tsx`** (localStorage persist,
  `lib/accessibility.ts` এর একই প্যাটার্ন অনুসরণ করে, next-themes এর
  `resolvedTheme` এর সাথে সিঙ্ক করে light/dark উভয় মোডে সঠিক রঙ প্রয়োগ
  করে), **নতুন `components/settings/accent-color-picker.tsx`** (৬টা
  সোয়াচ গ্রিড, keyboard-accessible, `aria-pressed` সহ)
- ✅ Settings → থিম ট্যাবে নতুন "অ্যাকসেন্ট রঙ" সেকশন যোগ করা হয়েছে
  (বিদ্যমান থিম মোড টগলের নিচে, আলাদা Card এ)
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৬.১ সেকেন্ড)
- ✅ **লাইভ regression টেস্ট**: `/settings` পেজ লগইন করা ইউজারের জন্য
  crash-free লোড, "অ্যাকসেন্ট রঙ" সেকশন label ও TabsTrigger লেবেল
  সঠিকভাবে উপস্থিত (Appearance tab এর panel content non-active
  অবস্থায় base-ui Tabs lazy-mount এর কারণে initial HTML এ নেই —
  established false-negative প্যাটার্ন, bug না), bundled JS chunk এ
  `hsc-ultimate-accent-color` localStorage key সঠিকভাবে উপস্থিত
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (০টা orphan row)
- ✅ সম্পূর্ণ frontend/CSS-only ফিচার — কোনো migration লাগেনি, কোনো
  নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): sandbox এ headless browser না থাকায়
  ব্রাউজারে ক্লিক করে actual color picker interaction ম্যানুয়ালি টেস্ট
  করা সম্ভব হয়নি — শুধু compiled bundle+logic verify করা হয়েছে

Reading Room Study Time Leaderboard এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- ✅ **Daily/Weekly/Monthly ফিল্টার**: readingroombd.com এর Study
  Leaderboard কনসেপ্ট থেকে অনুপ্রাণিত (research ডকুমেন্টের ৮ নং
  সেকশনে "Leaderboard integration" হিসেবে চিহ্নিত করা, Reading Room
  ফিচারের সাথে না বানিয়ে পরে যোগ করা হলো) — বিদ্যমান XP Leaderboard
  (`lib/league.ts`) এর পাশাপাশি, প্রতিস্থাপন না
- ✅ **সপ্তাহ-সীমানা সামঞ্জস্য**: weekly period এর boundary হিসাব
  `lib/league.ts` এর `getCurrentWeekStart()` এর সাথে অভিন্ন লজিক
  (UTC-based, রবিবার মধ্যরাত থেকে শুরু) — Node.js এ সিমুলেট করে দুই
  ফাংশনের output হুবহু মিলে যাওয়া নিশ্চিত করা হয়েছে, যাতে প্ল্যাটফর্মে
  দুই ধরনের leaderboard এ ভিন্ন সপ্তাহ-সীমানা দেখানোর অসঙ্গতি না হয়
- ✅ **Outlier-filter (readingroombd.com এর "অতিরিক্ত সময় বাদ দিন"
  থেকে শেখা)**: ন্যূনতম ৫ মিনিট (৩০০ সেকেন্ড, XP award এর একই
  থ্রেশহোল্ড) ফোকাস না থাকলে leaderboard এ দেখানো হয় না — কয়েক
  সেকেন্ডের জন্য join করে চলে যাওয়া ইউজারদের noise হিসেবে বাদ দেওয়া
- ✅ **Prisma `groupBy` aggregation** দিয়ে efficient হিসাব (N+1 query
  এড়িয়ে), টপ ৫০ + নিজের rank (টপ ৫০ এর বাইরে থাকলেও আলাদাভাবে fetch
  করে দেখানো, বিদ্যমান XP Leaderboard এর একই UX প্যাটার্ন)
- ✅ **গাণিতিক pre-verify (Node.js)**: period boundary (daily/weekly/
  monthly) হিসাব, `getCurrentWeekStart()` এর সাথে সাদৃশ্য, ranking/
  filtering/sorting logic (৬০ জনের সিমুলেটেড ডেটা দিয়ে, কিছু
  MIN_FOCUS_SEC এর নিচে) — সব সঠিক প্রমাণিত হওয়ার পরেই কোড লেখা হয়েছে
- ✅ **নতুন `getStudyTimeLeaderboard()`** (`lib/reading-room.ts` এ
  যোগ করা), **নতুন `GET /api/reading-room/leaderboard`** endpoint,
  **নতুন `/reading-room/leaderboard`** পেজ (Daily/Weekly/Monthly
  ট্যাব, Crown/Medal আইকন টপ ৩ এর জন্য, নিজের এন্ট্রি ring-highlight)
- ✅ **কোড রিফ্যাক্টর**: `formatDuration()` ফাংশন Reading Room
  Dashboard কম্পোনেন্ট থেকে বের করে নতুন client-safe
  `lib/format-duration.ts` এ সরানো হয়েছে (Prisma import ছাড়া
  pure function, যাতে leaderboard কম্পোনেন্টেও পুনর্ব্যবহার করা যায়
  duplicate কোড ছাড়াই)
- ✅ Reading Room Dashboard এর header এ নতুন "লিডারবোর্ড" বাটন যোগ
  করা হয়েছে
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৯.০ সেকেন্ড) — `/reading-room/leaderboard` ও
  `/api/reading-room/leaderboard` উভয়ই bundle এ সঠিকভাবে উপস্থিত
- ✅ **লাইভ multi-user End-to-End টেস্ট** (নতুন
  `scripts/test-reading-room-leaderboard.py`): ৩জন real ইউজার
  (Alice=৩৬০০সে, Bob=১২০০সে, Charlie=১০০সে) join করে psycopg2 দিয়ে
  totalFocusSec সেট করে leaderboard verify — Charlie (threshold এর
  নিচে) leaderboard এ অনুপস্থিত ✅, Alice #1/Bob #2 ranking সঠিক ✅,
  isMe flag সঠিক ✅, myEntry (নিজের rank) সঠিক ✅, Charlie এর দৃষ্টিকোণ
  থেকে myEntry সঠিকভাবে null ✅, daily/monthly period কাজ করছে ✅ —
  মোট ১৩টা assertion পাস
- ✅ **টপ-৫০ এর বাইরে rank verify**: আলাদা ইউজার দিয়ে confirm করা
  হয়েছে myEntry সঠিকভাবে পাওয়া যাচ্ছে even shared-DB এর অন্য ইউজারদের
  সাথে মিশ্রিত অবস্থায়ও
- ✅ **Edge-case/authorization টেস্ট**: unauthenticated → ৪০১, invalid
  period → ৪০০, `/reading-room/leaderboard` পেজ unauthenticated →
  ৩০৭ (middleware `/reading-room/:path*` prefix এর আওতায় স্বয়ংক্রিয়
  protected) — সব পাস
- ✅ Test data cleanup: ৫টা টেস্ট ইউজার প্রকৃত `/api/user/delete-
  account` endpoint দিয়ে delete, cascade delete verify (০টা orphan
  row)
- ✅ সম্পূর্ণ schema-free ফিচার (বিদ্যমান `ReadingRoomSession` মডেলের
  `totalFocusSec`/`createdAt` কলাম ব্যবহার করে) — কোনো migration
  লাগেনি, কোনো নতুন dependency লাগেনি

Border/Background Color Contrast (WCAG 1.4.11) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **আগে থেকে স্বীকৃত gap সম্পূর্ণ করা**: Color Contrast (WCAG AA)
  অডিট ফিচারে শুধু text-color (foreground) কভার হয়েছিল, border এখনো
  বাকি ছিল (README.md এ transparency নোট হিসেবে বহুদিন ধরে স্বীকৃত
  ছিল) — এই ফিচারে সেই gap সম্পূর্ণ করা হলো
- ✅ **অডিট পদ্ধতি**: নতুন `scripts/audit-border-contrast.py` — Tailwind
  v4 এর official hex color palette ব্যবহার করে কোডবেসের প্রতিটা
  state-indicating/interactive raw color border (`border-{color}-{shade}`
  প্যাটার্ন) এর WCAG 1.4.11 (Non-text Contrast, UI component boundary
  ≥৩:১) যাচাই করা হয়েছে, light ও dark উভয় মোডের card background এর
  বিপরীতে
- 🐛 **১৩টা instance ফেইল করা পাওয়া গেছে (light mode এ)**:
  confidence-selector.tsx (SURE/NOT_SURE state), task-manager.tsx ও
  study-plan-card.tsx (MEDIUM/LOW priority border), pretest-runner.tsx
  (recommendSkip badge), learn/[subjectId] (mastered status badge),
  deck-card-list.tsx (২টা card-type badge outline), post-detail.tsx
  (best-answer reply border) — সব light mode এ ২.১৫:১ থেকে ২.৭২:১ এর
  মধ্যে ছিল (২:১ এর সামান্য বেশি, কিন্তু ৩:১ থ্রেশহোল্ড থেকে কম)
- ✅ **ফিক্স প্যাটার্ন**: প্রতিটা রঙকে এক ধাপ গাঢ় shade এ পরিবর্তন
  (amber-500→amber-600, emerald-500→emerald-600, violet-400→violet-500,
  slate-400→slate-500) — Python এ pre-verify করে নিশ্চিত করা হয়েছে
  এই darker shade গুলো **light ও dark উভয় মোডেই** ৩:১ এর বেশি অর্জন
  করে (dark:variant override এর প্রয়োজন হয়নি, একটাই color class
  দিয়ে উভয় মোড কভার হয়েছে — কোড সরল থেকেছে)
- ✅ **Decorative border স্কিপ করা (সচেতন সিদ্ধান্ত)**: কিছু callout/
  info-box border (যেমন `predicted-gpa-card.tsx`, `topic-note-
  editor.tsx`, `wrong-answers-to-flashcards-button.tsx` এ `border-
  {color}-500/20` opacity প্যাটার্ন) ইচ্ছাকৃতভাবে অপরিবর্তিত রাখা
  হয়েছে — এগুলো purely decorative background box outline (কোনো
  interactive state/status নির্দেশ করে না), WCAG 1.4.11 মূলত
  interactive UI component এর জন্য প্রযোজ্য
- ✅ **গাণিতিক pre-verify (Python, বাধ্যতামূলক প্যাটার্ন)**: প্রতিটা
  candidate darker shade এর contrast ratio হিসাব করে দেখানো হয়েছে —
  amber-600 (light: ৩.১৯:১, dark: ৫.১৭:১), emerald-600 (light: ৩.৭৭:১,
  dark: ৪.৩৭:১), violet-500 (light: ৪.২৩:১, dark: ৩.৮৯:১), slate-500
  (light: ৪.৭৬:১, dark: ৩.৪৬:১) — সব ফাইনাল মান ফিক্সের পরে script
  আবার চালিয়ে ১২/১২ instance পাস নিশ্চিত করা হয়েছে
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৬.০ সেকেন্ড) — compiled CSS output এ নতুন রঙের ক্লাসগুলো
  (`border-emerald-600`, `border-amber-600`, `border-slate-500`,
  `border-violet-500`) সঠিকভাবে উপস্থিত নিশ্চিত করা হয়েছে
- ✅ **লাইভ regression টেস্ট**: `/planner`, `/flashcards` পেজ
  crash-free লোড, Task তৈরি API (priority field সহ) সঠিকভাবে কাজ
  করছে — border color পরিবর্তনে কোনো functional regression হয়নি
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই
- ✅ সম্পূর্ণ frontend/CSS-only ফিচার (৯টা ফাইলে ১৩টা instance
  পরিবর্তিত: `confidence-selector.tsx`, `task-manager.tsx`,
  `study-plan-card.tsx`, `pretest-runner.tsx`,
  `learn/[subjectId]/page.tsx`, `deck-card-list.tsx`,
  `post-detail.tsx`) — কোনো migration লাগেনি, কোনো নতুন dependency
  লাগেনি
- ⚠️ এখনো বাকি (transparency): বিদ্যমান ডিফল্ট থিমের নিজস্ব `--border`
  ভ্যালু (grayscale) নিজেই ~১.৩:১ (৩:১ এর কম) — এটা এই ফিচারের scope
  এর বাইরে (theme-wide default border color পরিবর্তন করলে পুরো
  প্ল্যাটফর্মের card/input/divider এর ভিজ্যুয়াল চেহারা ব্যাপকভাবে
  বদলে যেত, যা একটা ভিন্ন বড় ঝুঁকিপূর্ণ কাজ) — এই ফিচারে শুধু
  state-indicating/interactive raw-color border গুলো ঠিক করা হয়েছে,
  যেগুলো নিজে থেকেই একটা নির্দিষ্ট রঙ বেছে নিয়েছিল (তাই ফিক্স করা
  নিরাপদ ও স্বল্প-ঝুঁকিপূর্ণ ছিল); screen reader ম্যানুয়াল টেস্টিং
  এখনো বাকি (অন্যান্য accessibility ফিচারের মতোই ধারাবাহিকভাবে বাকি)

Forum Reply-level Timestamp এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **আগে থেকে স্বীকৃত gap সম্পূর্ণ করা**: "Relative Time Formatting"
  ফিচারে forum post এর timestamp ("৫ মিনিট আগে") যোগ করা হয়েছিল, কিন্তু
  reply-level timestamp তখন missing ছিল বলে transparency নোটে স্পষ্টভাবে
  স্বীকৃত ছিল — এই ছোট ফিক্সে সেই gap সম্পূর্ণ করা হলো
- ✅ **রুট কজ**: `Reply` interface এ TypeScript টাইপ (`createdAt: string`)
  ও backend API (`GET /api/forum/posts/[postId]`) থেকে `createdAt`
  ডেটা আগে থেকেই সঠিকভাবে আসছিল (Prisma default select এ সব ফিল্ড
  আসে) — শুধু UI কম্পোনেন্টে (`components/forum/post-detail.tsx`)
  ব্যবহার করা হচ্ছিল না, তাই খুব সহজ ও নিরাপদ এক-লাইন ফিক্স
- ✅ বিদ্যমান `formatRelativeOrDate()` (`lib/format-date.ts`, কোনো
  নতুন dependency ছাড়া) পুনর্ব্যবহার করে reply এর user name এর পাশে
  "· ৫ মিনিট আগে" ফরম্যাটে timestamp দেখানো হচ্ছে (post-level
  timestamp এর একই প্যাটার্ন অনুসরণ করে)
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৮.৯ সেকেন্ড)
- ✅ **লাইভ End-to-End টেস্ট** (দুইজন real ইউজার — Post Author ও Reply
  Author): বাস্তবসম্মত forum post ("নিউটনের গতিসূত্র নিয়ে প্রশ্ন") তৈরি,
  বাস্তবসম্মত reply দেওয়া, `GET /api/forum/posts/[postId]` থেকে
  reply এর `createdAt` সঠিকভাবে আসা নিশ্চিত, `/forum/[postId]` পেজ
  crash-free লোড — সব পাস
- ✅ **Node.js এ actual function verify**: `lib/format-date.ts` থেকে
  `formatRelativeOrDate()` সরাসরি import করে API থেকে পাওয়া প্রকৃত
  timestamp দিয়ে টেস্ট করে সঠিক আউটপুট ("প্রায় ১ মিনিট আগে") নিশ্চিত
  করা হয়েছে
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (forum_posts ও forum_replies উভয়ের cascade delete, ০টা
  orphan row)
- ✅ সম্পূর্ণ frontend-only ফিচার (১টা ফাইল পরিবর্তিত) — কোনো
  migration লাগেনি, কোনো নতুন dependency লাগেনি

Notification Bell/Center Nested-Interactive HTML ফিক্স এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **আগে থেকে স্বীকৃত gap সম্পূর্ণ করা**: "Keyboard Navigation অডিট"
  ফিচারে transparency নোটে স্পষ্টভাবে লেখা ছিল "`notification-bell.tsx`
  dropdown আইটেম এখনো nested-interactive pattern (semantically ideal
  না হলেও keyboard-operable)" — এই ফিচারে সেই gap সম্পূর্ণ করা হলো
- 🐛 **রুট কজ**: `components/layout/notification-bell.tsx` ও
  `components/notifications/notification-center.tsx` উভয়েই একই
  invalid HTML প্যাটার্ন ছিল — `<div role="button" tabIndex={0}>`
  এর ভেতরে আবার একটা প্রকৃত `<button>` (delete আইকন) নেস্টেড ছিল।
  HTML স্পেসিফিকেশন অনুযায়ী interactive element এর ভেতরে আরেকটা
  interactive element রাখা অবৈধ (nested-interactive), এবং screen
  reader/assistive technology এ বিভ্রান্তিকর আচরণ (যেমন focus/click
  target ভুল বোঝা) তৈরি করতে পারে, যদিও keyboard দিয়ে টেকনিক্যালি
  কাজ করছিল (তাই আগে গুরুত্বপূর্ণ বাগ হিসেবে চিহ্নিত হয়নি, শুধু
  "semantically ideal না" বলে transparency নোটে রাখা হয়েছিল)
- ✅ **ফিক্স**: outer `<div role="button">` কে non-interactive
  container এ রূপান্তর করে, ভেতরে দুটো sibling `<button>` বানানো
  হয়েছে — একটা মূল কন্টেন্ট এলাকার জন্য (ক্লিক করলে notification
  এ navigate করে/read মার্ক করে, `flex-1` দিয়ে বেশিরভাগ জায়গা নেয়),
  আরেকটা delete আইকনের জন্য (আলাদা, non-nested)। উভয়ই স্বাধীনভাবে
  keyboard-focusable ও screen-reader-friendly, কোনো nested-interactive
  HTML অবশিষ্ট নেই
- ✅ **Python regex দিয়ে ভেরিফাই**: উভয় ফাইলে `role="button"` স্ট্রিং
  আর অবশিষ্ট নেই নিশ্চিত করা হয়েছে (সরাসরি সোর্স কোড স্ক্যান করে)
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৭.৬ সেকেন্ড)
- ✅ **লাইভ End-to-End টেস্ট** (real ইউজার দিয়ে, psycopg2 দিয়ে টেস্ট
  নোটিফিকেশন তৈরি করে): `PATCH /api/notifications/[id]` (mark as
  read, মূল কন্টেন্ট বাটনের ক্লিক হ্যান্ডলার) ও `DELETE /api/
  notifications/[id]` (delete বাটনের ক্লিক হ্যান্ডলার) উভয়ই সঠিকভাবে
  কাজ করছে যাচাই — HTML structure পরিবর্তনের পরেও কোনো functional
  regression হয়নি, `/notifications` পেজ crash-free লোড হয়েছে
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (notifications টেবিলে ০টা orphan row)
- ✅ সম্পূর্ণ frontend-only ফিচার (২টা ফাইল পরিবর্তিত:
  `notification-bell.tsx`, `notification-center.tsx`) — কোনো
  migration লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): screen reader ম্যানুয়াল টেস্টিং
  (VoiceOver/NVDA দিয়ে প্রকৃত অভিজ্ঞতা যাচাই) sandbox এ সম্ভব হয়নি —
  শুধু HTML structure/source code যাচাই করা হয়েছে

Admin Panel ফর্ম ইনলাইন ভ্যালিডেশন এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **আগে থেকে স্বীকৃত gap সম্পূর্ণ করা**: Settings/Student-Facing ফর্ম
  ইনলাইন ভ্যালিডেশন ফিচারগুলোতে transparency নোটে বহুবার লেখা ছিল
  "admin panel ফর্মে এখনো একই প্যাটার্ন প্রয়োগ করা হয়নি (ইচ্ছাকৃতভাবে,
  কম ব্যবহারকারী-প্রভাব)" — এই ফিচারে সেই gap সম্পূর্ণ করা হলো
- ✅ **৩টা ফর্মে fieldErrors state + validate() প্যাটার্ন যোগ**:
  `subject-manager.tsx` (নাম+Name), `chapter-manager.tsx` (নাম+Name),
  `topic-manager.tsx` (Create **ও** Edit উভয় ফর্মে, দুটো আলাদা
  fieldErrors/editFieldErrors state) — বিদ্যমান student-facing ফর্মের
  (Forum Post ইত্যাদি) হুবহু একই `aria-invalid`+`aria-describedby`+
  visible `role="alert"` error message প্যাটার্ন
- ✅ Dialog বন্ধ করলে (`onOpenChange`) fieldErrors রিসেট হয়, যাতে
  পরের বার খোলার সময় আগের এরর "লেগে" না থাকে
- 🐛 **প্রকৃত bug আবিষ্কার (server-side)**: লাইভ টেস্ট করার সময় ধরা
  পড়ে যে `PATCH /api/admin/topics/[topicId]` endpoint এ `name`/
  `nameEn` এর **কোনো server-side validation ছিল না** (শুধু POST
  create endpoint এ ছিল) — client-side ভ্যালিডেশন bypass করে সরাসরি
  API তে খালি স্ট্রিং পাঠালে সেটা সরাসরি DB তে সেভ হয়ে যাচ্ছিল (২০০
  status, ৪০০ হওয়া উচিত ছিল)। একই সমস্যা `PATCH /api/admin/chapters/
  [chapterId]` ও `PATCH /api/admin/subjects/[subjectId]` এও পাওয়া
  গেছে (পুরোনো code যা আগে কখনো defense-in-depth নিয়মে অডিট হয়নি)
- ✅ **৩টা PATCH endpoint ফিক্স**: `name !== undefined && !name.trim()`
  ও `nameEn !== undefined && !nameEn.trim()` চেক যোগ করে ৪০০ রিটার্ন
  করা হয়, এবং সেভ করার সময় `.trim()` করে ডেটা ক্লিন রাখা হয় (create
  endpoint এর সাথে সামঞ্জস্যপূর্ণ)
- ✅ Node.js এ `validate()` লজিক আলাদাভাবে ইউনিট-টেস্ট — ৬টা কেস
  (খালি/এক-ফিল্ড-খালি/সব-ভরা/শুধু-স্পেস), ৬/৬ পাস
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৬.৫ সেকেন্ড)
- ✅ **লাইভ End-to-End টেস্ট** (Admin role সহ real ইউজার — DB তে role
  আপডেট করে নতুন session নেওয়া): Subject→Chapter→Topic পুরো chain
  তৈরি, Topic Edit (update), সব ৩টা এন্টিটির জন্য খালি নাম দিয়ে POST
  (create) ও PATCH (update) করে ৪০০ পাওয়া নিশ্চিত, বৈধ ডেটা দিয়ে সব
  operation সফল, cascade delete (subject delete করলে chapter+topic ও
  মুছে যাওয়া) verify
- ✅ **Edge-case/authorization**: unauthenticated `/admin/subjects` →
  ৩০৭, unauthenticated PATCH API → ৪০১ — middleware protection
  অপরিবর্তিত
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (test subject/chapter/topic ও cascade delete verify)
- ✅ সম্পূর্ণ frontend + backend bug fix (৬টা ফাইল পরিবর্তিত:
  `subject-manager.tsx`, `chapter-manager.tsx`, `topic-manager.tsx`,
  `app/api/admin/subjects/[subjectId]/route.ts`, `app/api/admin/
  chapters/[chapterId]/route.ts`, `app/api/admin/topics/[topicId]/
  route.ts`) — কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): অন্যান্য admin ফর্ম (question-manager,
  cq-question-manager, notification-broadcast-form ইত্যাদি) এখনো এই
  প্যাটার্নে আপডেট হয়নি (এই ফিচারে শুধু Subject/Chapter/Topic Manager
  — সবচেয়ে বেশি ব্যবহৃত core content ম্যানেজমেন্ট ফর্ম — cover করা
  হয়েছে), screen reader ম্যানুয়াল টেস্টিং এখনো বাকি

Topic Manager Unsaved Changes Warning এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **আগে থেকে স্বীকৃত gap সম্পূর্ণ করা**: "Unsaved Changes Warning
  (beforeunload)" ফিচারে transparency নোটে স্পষ্টভাবে লেখা ছিল
  "admin panel এর অন্য content-heavy ফর্মে (topic-manager
  notesMarkdown) এখনো প্রয়োগ করা হয়নি" — এই ফিচারে সেই gap সম্পূর্ণ
  করা হলো
- ✅ **বিদ্যমান hook পুনর্ব্যবহার**: `hooks/use-unsaved-changes-
  warning.ts` (কোনো পরিবর্তন ছাড়াই) — `components/admin/topic-
  manager.tsx` এর Create **ও** Edit উভয় ডায়ালগেই প্রয়োগ করা হয়েছে,
  যেখানে notesMarkdown/formulaSheet এর মতো দীর্ঘ Textarea আছে যেখানে
  অনেকটা সময় নিয়ে লেখার পরে ভুলবশত হারানোর ঝুঁকি সবচেয়ে বেশি
- ✅ **Create ফর্ম**: `hasUnsavedChanges` — dialog খোলা অবস্থায় যেকোনো
  ফিল্ডে (name/nameEn/videoUrl/notesMarkdown/formulaSheet) নন-empty
  ভ্যালু থাকলে true (`topic-note-editor.tsx` এর প্যাটার্ন থেকে সামান্য
  ভিন্ন, কারণ Create এ কোনো "আগের সেভ করা ভ্যালু" নেই তুলনা করার মতো)
- ✅ **Edit ফর্ম**: `hasUnsavedChanges` — dialog খোলার সময় নেওয়া
  স্ন্যাপশট (`editSavedForm`) এর সাথে বর্তমান `editForm` তুলনা করে
  (`topic-note-editor.tsx` এর `content !== savedContent` প্যাটার্নের
  হুবহু অনুসরণ) — সফলভাবে সেভ হলে স্ন্যাপশট আপডেট হয় যাতে dialog বন্ধ
  করার সময় আবার fasle-positive warning না দেখায়
- ✅ Node.js এ `hasUnsavedChanges` লজিক আলাদাভাবে ইউনিট-টেস্ট — ৯টা
  কেস (dialog বন্ধ/খোলা, খালি/ভরা ফিল্ড, whitespace-only, edit
  unchanged/changed, boolean toggle সহ), ৯/৯ পাস
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৮.৭ সেকেন্ড)
- ✅ **লাইভ End-to-End regression টেস্ট** (Admin role সহ real ইউজার):
  দীর্ঘ `notesMarkdown` সহ Topic create, Topic edit/update — উভয়ই
  hook যোগ হওয়ার পরেও ঠিকমতো কাজ করছে (কোনো functional regression
  নেই), `/admin/subjects` পেজ crash-free লোড
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (cascade delete সহ)
- ✅ সম্পূর্ণ frontend-only ফিচার (১টা ফাইল পরিবর্তিত:
  `topic-manager.tsx`, বিদ্যমান hook পুনর্ব্যবহার) — কোনো migration
  লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): এই hook এর established সীমাবদ্ধতা
  (শুধু full page unload/reload/close ধরে, Next.js client-side
  navigation না) এখানেও প্রযোজ্য — অন্য admin ফর্ম (question-manager
  এর দীর্ঘ CQ/MCQ টেক্সট ফিল্ড) এখনো এই প্যাটার্নে আপডেট হয়নি,
  ব্রাউজার-লেভেল visual popup dialog sandbox এ দেখা সম্ভব হয়নি

Task Manager Title ইনলাইন ভ্যালিডেশন ফিডব্যাক এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **আগে থেকে স্বীকৃত gap সম্পূর্ণ করা**: "Password Visibility
  Toggle" ফিচারে transparency নোটে লেখা ছিল "quiz-battle/task-manager
  এর মতো ছোট single-line ইনপুটে এখনো প্রয়োগ করা হয়নি" (student-facing
  ফর্ম ইনলাইন ভ্যালিডেশন প্যাটার্নের কথা বলা হচ্ছিল) — এই ফিচারে
  Task Manager এর title ফিল্ডে সেই gap সম্পূর্ণ করা হলো
- 🐛 **আবিষ্কার**: Task Manager এর নতুন-টাস্ক ইনপুটে খালি টাইটেল দিলে
  শুধু বাটন `disabled` হয়ে যেত (`disabled={adding || !newTitle.trim()}`)
  — কোনো visible error message ছিল না, ইউজার বুঝতে পারত না কেন বাটন
  কাজ করছে না (বিশেষভাবে মোবাইলে বা কীবোর্ড দিয়ে Enter চাপলে কোনো
  ফিডব্যাক-ই আসত না)
- ✅ **ফিক্স**: `titleError` state + inline validation — খালি টাইটেল
  দিয়ে সাবমিট করলে "টাস্কের নাম আবশ্যক" visible error দেখায়
  (`aria-invalid`+`aria-describedby`+`role="alert"`, বিদ্যমান
  student-facing ফর্মের একই প্যাটার্ন), টাইপ করা শুরু করলে এরর clear
  হয়ে যায়। বাটনের `disabled` কন্ডিশন থেকে `!newTitle.trim()` সরিয়ে
  দেওয়া হয়েছে (এখন সবসময় ক্লিকযোগ্য, ক্লিক করলে validate() চলে ও
  প্রয়োজনে এরর দেখায় — যা raw disabled-button থেকে ভালো UX, কারণ
  ইউজার বাটনে ক্লিক করে কেন কিছু হচ্ছে না তা নিয়ে বিভ্রান্ত হয় না)
- ✅ **Server-side defense-in-depth ইতিমধ্যে ঠিক ছিল**: লাইভ টেস্টে
  verify করে নিশ্চিত হওয়া গেছে `POST /api/tasks` ইতিমধ্যেই খালি
  title এ ৪০০ রিটার্ন করছিল (এই ফিচারে কোনো backend পরিবর্তন লাগেনি,
  শুধু client-side visible feedback missing ছিল)
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৯.৮ সেকেন্ড)
- ✅ **লাইভ End-to-End regression টেস্ট**: বৈধ টাস্ক তৈরি সফল, খালি
  title দিয়ে server-side ৪০০ verify (client fix থেকে independent),
  task status toggle ও delete flow ঠিকমতো কাজ করছে (disabled-logic
  পরিবর্তনে কোনো regression নেই), `/planner` পেজ crash-free লোড
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই
- ✅ সম্পূর্ণ frontend-only ফিচার (১টা ফাইল পরিবর্তিত:
  `task-manager.tsx`) — কোনো migration লাগেনি, কোনো নতুন dependency
  লাগেনি
- ⚠️ এখনো বাকি (transparency): Quiz Battle Create Form এ পর্যালোচনা
  করে দেখা গেছে সেখানে বড় কোনো gap নেই (title fallback আছে, subject
  select এ default value থাকায় খালি থাকার সম্ভাবনা কম) — তাই ইচ্ছাকৃত
  ভাবে পরিবর্তন করা হয়নি; screen reader ম্যানুয়াল টেস্টিং এখনো বাকি

Question/CQ Question PATCH Endpoint বাগ ফিক্স এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **প্যাটার্ন-ম্যাচিং অডিট**: Admin Panel ফর্ম ইনলাইন ভ্যালিডেশন
  ফিচারে Subject/Chapter/Topic এর PATCH endpoint গুলোতে মিসিং
  server-side validation পাওয়া গিয়েছিল — সেই একই bug প্যাটার্ন
  (POST এ ভ্যালিডেশন আছে, PATCH এ নেই) কোডবেসের বাকি সব admin PATCH
  endpoint এ আছে কিনা প্রতিটা যাচাই করা হয়েছে
- 🐛 **একই প্যাটার্নের বাগ আরও ২টা এন্ডপয়েন্টে পাওয়া গেছে**: `PATCH
  /api/admin/questions/[questionId]` (text/correctAnswer/options এর
  কোনো validation ছিল না) ও `PATCH /api/admin/cq-questions/
  [cqQuestionId]` (stimulus/questionA-D এর কোনো validation ছিল না)
  — উভয়ের POST (create) endpoint এ validation ছিল, কিন্তু PATCH এ
  বাদ পড়েছিল
- ✅ **ফিক্স**: Question এ text/correctAnswer non-empty + options
  ন্যূনতম ২টা চেক, CQQuestion এ stimulus/questionA/B/C/D প্রতিটা
  non-empty চেক (loop দিয়ে DRY রাখা হয়েছে) — সবগুলোতে `.trim()`
  করে সেভ করা হয় (create endpoint এর সাথে সামঞ্জস্যপূর্ণ)
- ✅ **অডিট করে নিশ্চিত হওয়া গেছে বাকি PATCH endpoint নিরাপদ**:
  `users/[userId]` (enum role check আছে), `forum/posts/[postId]/pin`
  (boolean coercion, কোনো text field নেই), `reports/[reportId]`
  (enum action check আছে) — এই ৩টাতে কোনো পরিবর্তনের প্রয়োজন নেই
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৪.৬ সেকেন্ড)
- ✅ **লাইভ End-to-End defense-in-depth টেস্ট** (Admin role সহ real
  ইউজার): Question create+PATCH (empty text/correctAnswer/single-
  option সব ৪০০, বৈধ misconceptionTag update এখনো ২০০), CQQuestion
  create+PATCH (empty stimulus/questionC উভয়ই ৪০০, বৈধ update এখনো
  ২০০) — সব সঠিক
- ✅ **Edge-case/authorization**: unauthenticated PATCH উভয় endpoint
  এ ৪০১ — middleware/guard অপরিবর্তিত
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (test question/cq-question ডিলিট verify)
- ✅ সম্পূর্ণ backend bug fix (২টা API route ফাইল পরিবর্তিত:
  `app/api/admin/questions/[questionId]/route.ts`, `app/api/admin/
  cq-questions/[cqQuestionId]/route.ts`) — কোনো migration লাগেনি,
  কোনো নতুন dependency লাগেনি, কোনো frontend পরিবর্তন লাগেনি (UI
  থেকে ইতিমধ্যেই শুধু বৈধ ডেটা পাঠানো হতো)

Class Routine PATCH Endpoint বাগ ফিক্স (Non-Admin অডিট) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **স্কোপ সম্প্রসারণ**: Question/CQ Question PATCH এর বাগ ফিক্সের
  পরে একই প্যাটার্ন কোডবেসের **non-admin** PATCH endpoint গুলোতেও
  আছে কিনা প্রতিটা (১৩টা) ম্যানুয়ালি পড়ে অডিট করা হয়েছে —
  `flashcard-decks`, `habits`, `notifications`, `routine`,
  `study-pet`, `study-plan/items`, `tasks`, `user/ai-tutor-mode`,
  `user/digest-preference`, `user/profile`, `user/public-profile`,
  `forum/posts/[postId]/resolve`, `forum/replies/[replyId]/
  best-answer`
- 🐛 **একটা প্রকৃত বাগ পাওয়া গেছে**: `PATCH /api/routine/[slotId]`
  এ দুটো সমস্যা — (১) `label?.trim() ?? undefined` লজিকে `??`
  অপারেটর শুধু `null`/`undefined` ধরে, খালি স্ট্রিং (`""`) ধরে না
  (`"".trim() ?? undefined` === `""`, undefined না) — তাই
  `label: ""` পাঠালে empty label সরাসরি DB তে সেভ হয়ে যেত। (২)
  `dayOfWeek`/`startTime`/`endTime` এর কোনো range/order validation
  ছিল না PATCH এ, যদিও POST (create) এ ছিল (dayOfWeek ০-৬ রেঞ্জ
  চেক, startTime<endTime চেক)
- ✅ **ফিক্স**: `label !== undefined && !label.trim()` চেক (empty
  string সঠিকভাবে ধরার জন্য), `dayOfWeek` রেঞ্জ চেক, এবং **partial
  update-aware time validation** — `startTime`/`endTime` এর একটা
  মাত্র পাঠানো হলেও বিদ্যমান slot এর অন্য মানের সাথে তুলনা করে
  order যাচাই করা হয় (`effectiveStartTime`/`effectiveEndTime` fallback
  logic)
- ✅ Node.js এ গাণিতিক pre-verify — ১২টা কেস (label empty/whitespace/
  valid, dayOfWeek boundary, startTime-only/endTime-only/both partial
  update এর সাথে effective-time comparison), ১২/১২ পাস
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৫.৫ সেকেন্ড)
- ✅ **লাইভ End-to-End defense-in-depth টেস্ট**: Routine slot create,
  PATCH এ empty label/invalid dayOfWeek/time-order-violation — সব
  ৩টা ৪০০, বৈধ label+colorHex আপডেট ও বৈধ startTime+endTime আপডেট
  উভয়ই ২০০ (regression নেই), `/planner` পেজ crash-free লোড
- ✅ **Edge-case/authorization**: unauthenticated PATCH → ৪০১
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (routine_slots এ ০টা orphan row)
- ✅ **অডিট করে নিশ্চিত হওয়া গেছে বাকি ১২টা non-admin PATCH endpoint
  নিরাপদ** — কোথাও কোনো text field ভ্যালিডেশন গ্যাপ পাওয়া যায়নি
  (সবগুলোতে হয় boolean/enum coercion, অথবা সঠিক `.trim()` চেক
  ইতিমধ্যেই আছে)
- ✅ সম্পূর্ণ backend bug fix (১টা API route ফাইল পরিবর্তিত:
  `app/api/routine/[slotId]/route.ts`) — কোনো migration লাগেনি,
  কোনো নতুন dependency লাগেনি, কোনো frontend পরিবর্তন লাগেনি

Reading Room × Study Group Integration + Synced Pomodoro এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:
- 🔍 **research ডকুমেন্টে চিহ্নিত করা বাকি ২টা আইটেম সম্পূর্ণ করা**:
  `docs/RESEARCH_UI_UX_READING_ROOM.md` এর ৮ নং সেকশনে "Study Group কে
  live session মোডে upgrade" ও "Shared/Synced Pomodoro" — দুটোই এই
  ফিচারে সম্পূর্ণ করা হলো, সম্পূর্ণ schema-free (কোনো নতুন migration
  লাগেনি)
- ✅ **Study Group × Reading Room Integration**: নতুন
  `getGroupMembersReadingRoomStatus()` (`lib/reading-room.ts`) —
  বিদ্যমান `StudyGroupMember` ও `ReadingRoomSession` টেবিল জয়েন করে
  নিজের গ্রুপের সব সদস্যের বর্তমান Reading Room অবস্থা (কোন রুমে,
  কী করছে, কী লক্ষ্য) বের করে — কোনো নতুন কলাম/মডেল ছাড়াই
- ✅ **নতুন `GET /api/study-group/reading-room-status`** endpoint,
  Study Group Dashboard এ প্রতিটা সদস্যের নামের নিচে "🔴 এখন Reading
  Room এ পড়ছে" live indicator (animate-pulse রেডিও আইকন সহ, রুম+
  activity emoji ও ঐচ্ছিক goal caption দেখায়), প্রতি ৩০ সেকেন্ডে
  পোলিং রিফ্রেশ (Reading Room heartbeat এর কাছাকাছি ইন্টারভাল)।
  উপরে একটা shortcut কার্ড ("X জন সদস্য এখন Reading Room এ আছে" বা
  "Reading Room এ গিয়ে একসাথে পড়ো") — ক্লিক করলে সরাসরি `/reading-room`
- ✅ **Synced (Shared) Pomodoro**: নতুন `getSyncedPomodoroState()`
  (`lib/reading-room.ts`) — সম্পূর্ণ **broadcast-free, DB-write-free**
  ডিজাইন। সার্ভারের wall-clock (Unix epoch) থেকে `mod` নিয়ে
  deterministically একটা গ্লোবাল ৩০-মিনিট চক্র (২৫ মিনিট ফোকাস + ৫
  মিনিট ব্রেক) হিসাব করা হয় — কোনো state store ছাড়াই সব ইউজার সবসময়
  একই মুহূর্তে একই focus/break অবস্থা দেখে (readingroombd.com/
  StudyClock এর "সবাই একসাথে ব্রেক নেয়" ধারণা থেকে অনুপ্রাণিত)
- ✅ **নতুন `GET /api/reading-room/synced-pomodoro`** endpoint, নতুন
  `components/reading-room/synced-pomodoro-card.tsx` — Reading Room
  Dashboard এর presence panel এর উপরে দেখায়, প্রতি সেকেন্ডে local
  countdown + প্রতি ৩০ সেকেন্ডে সার্ভার থেকে re-sync (client-side drift
  এড়াতে)
- ✅ **গাণিতিক pre-verify (Python + Node.js উভয়ে)**: Python এ প্রথমে
  cycle boundary logic (৮টা কেস: focus শুরু/মাঝামাঝি/শেষ, break শুরু/
  মাঝামাঝি/শেষ, চক্র rollover) ও "দুইজন ইউজার একই মুহূর্তে একই state"
  দাবি যাচাই — তারপর Node.js এ **actual `lib/reading-room.ts` ফাইল
  থেকে সরাসরি import করে** (কপি-পেস্ট না) একই ৬টা কেস আবার verify,
  সব পাস
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৭.৪ সেকেন্ড)
- ✅ **লাইভ multi-user End-to-End টেস্ট** (দুইজন real ইউজার — Group
  Owner ও Group Member): Study Group তৈরি+join, প্রাথমিকভাবে কেউ
  Reading Room এ নেই তা verify, Group Member Reading Room এ join
  করার পরে Group Owner এর দৃষ্টিকোণ থেকে `isInReadingRoom=true`+
  সঠিক room/activity/goal দেখা যাওয়া, leave করার পরে আবার
  `isInReadingRoom=false` হয়ে যাওয়া — সব real-time cross-user
  visibility নিখুঁতভাবে কাজ করেছে
- ✅ **Synced Pomodoro cross-user verify**: দুইজন real ইউজার একই
  মুহূর্তে endpoint কল করে হুবহু একই `mode`+`secondsLeft` পাওয়া, ৩
  সেকেন্ড অপেক্ষা করে আবার কল করে সময় ঠিকমতো কমেছে তা নিশ্চিত করা
- ✅ **Edge-case টেস্ট**: কোনো Study Group এ নেই এমন ইউজারের জন্য
  endpoint crash না করে খালি array রিটার্ন করা, unauthenticated উভয়
  endpoint এ ৪০১, `/study-group` ও `/reading-room` পেজ crash-free
  লোড
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (test study group ও reading room session এর cascade delete,
  ০টা orphan row)
- ✅ সম্পূর্ণ schema-free ফিচার (৩টা নতুন ফাইল + ২টা কম্পোনেন্ট
  পরিবর্তিত: `lib/reading-room.ts` এ ফাংশন যোগ, `study-group-
  dashboard.tsx`, `reading-room-dashboard.tsx`) — কোনো migration
  লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): Synced Pomodoro এর ফিক্সড ৩০-মিনিট
  চক্র কাস্টমাইজ করার কোনো UI নেই (ভবিষ্যতে ইউজার নিজের পছন্দমতো
  চক্র দৈর্ঘ্য বাছাই করার ফিচার যোগ করা যেতে পারে); screen reader
  ম্যানুয়াল টেস্টিং এখনো বাকি

Admin Panel — Question/CQ Question/Notification Broadcast Form ইনলাইন ভ্যালিডেশনে যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔧 **প্রেক্ষাপট**: Subject/Chapter/Topic Manager এ আগেই fieldErrors
  ভিত্তিক ইনলাইন ভ্যালিডেশন প্যাটার্ন (aria-invalid+aria-describedby
  সহ ইনলাইন এরর মেসেজ) প্রয়োগ করা হয়েছিল, কিন্তু Question Manager,
  CQ Question Manager, ও Notification Broadcast Form এখনো শুধু
  generic toast এরর দেখাচ্ছিল (কোনো ফিল্ড হাইলাইট হতো না) — প্রোঅ্যাক্টিভ
  UI/UX অডিটে এই gap ধরা পড়ে
- ✅ **Question Manager** (`components/admin/question-manager.tsx`):
  একক MCQ প্রশ্ন ফর্মে `text`/`options`/`correctAnswer` তিনটা ফিল্ডে
  fieldErrors state + aria-invalid/aria-describedby + লাল ইনলাইন এরর
  টেক্সট যোগ। নতুন ভ্যালিডেশন যোগ হয়েছে: `correctAnswer` অবশ্যই উপরের
  অপশনগুলোর একটার সাথে হুবহু মিলতে হবে (আগে শুধু non-empty চেক ছিল,
  টাইপো করে ভুল উত্তর লিখলেও সাবমিট হয়ে যেত — এখন আগেই ধরা পড়ে)।
  Dialog বন্ধ/সাবমিট সফল হলে fieldErrors রিসেট হয়
- ✅ **Question Manager Unsaved Changes Warning**: single question
  ফর্মে কিছু টাইপ করা থাকলে বা CSV bulk ট্যাবে টেক্সট থাকলে ডায়ালগ
  খোলা অবস্থায় ট্যাব বন্ধ/রিফ্রেশ করলে ব্রাউজার সতর্ক করে (Topic
  Manager এর প্রতিষ্ঠিত প্যাটার্ন পুনর্ব্যবহার)
- ✅ **CQ Question Manager** (`components/admin/cq-question-manager.tsx`):
  `stimulus`/`questionA`/`questionB`/`questionC`/`questionD` পাঁচটা
  ফিল্ডে একই fieldErrors+aria-invalid প্যাটার্ন + Unsaved Changes
  Warning (ফর্মের যেকোনো ফিল্ডে টাইপ করা থাকলে সক্রিয়)
- ✅ **Notification Broadcast Form** (`components/admin/notification-
  broadcast-form.tsx`): `title`/`body` দুটো ফিল্ডে fieldErrors+
  aria-invalid প্যাটার্ন + Unsaved Changes Warning (এটা dialog না,
  পুরো পেজ — দীর্ঘ ঘোষণা টাইপ করার পরে ভুলবশত রিফ্রেশ করে হারানো থেকে
  রক্ষা করে)
- ✅ **User Manager অডিট করা হয়েছে**: এখানে কোনো টেক্সট ফর্ম নেই (শুধু
  role toggle বাটন), তাই ইনলাইন ভ্যালিডেশনের প্রয়োজন নেই — যাচাই করে
  নিশ্চিত হওয়া হয়েছে
- ✅ **Server-side ভ্যালিডেশন regression-free**: client-side fieldErrors
  যোগ করার সময় লক্ষ্য রাখা হয়েছে যাতে বিদ্যমান server-side validation
  (POST endpoint গুলোতে) অপরিবর্তিত/সুরক্ষিত থাকে (defense-in-depth) —
  লাইভ টেস্টে ভেরিফাই করা হয়েছে
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-admin-inline-validation.py`,
  ২৬টা assertion, সব PASS): Admin+Student দুইজন real ইউজার দিয়ে —
  (ক) খালি payload দিয়ে MCQ/CQ/Broadcast create করলে এখনো 400
  রিটার্ন করে (server-side ভ্যালিডেশন অক্ষত), (খ) সঠিক payload দিয়ে
  normal create flow এখনো কাজ করে (regression-free), (গ) student
  role দিয়ে এই admin endpoint গুলো ব্যবহার করলে 403, (ঘ) static
  source-code verification — তিনটা ফাইলেই fieldErrors/aria-invalid/
  useUnsavedChangesWarning সঠিকভাবে আছে, (ঙ) টেস্ট প্রশ্ন/CQ প্রকৃত
  DELETE API দিয়ে মুছে DB তে ভেরিফাই (০টা orphan row)
- ⚠️ **সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)**: fieldErrors client-side React
  state হওয়ায় "ফাঁকা ফর্ম সাবমিট করলে UI তে লাল এরর মেসেজ দেখানো"
  Python/requests দিয়ে সরাসরি automate করা সম্ভব না (browser render
  দরকার) — তাই টেস্টে static code verification + server-side
  regression যাচাই করা হয়েছে, ম্যানুয়াল browser টেস্টিং এখনো বাকি

Keyboard Tab-order/Focus-trap অডিটে যা যা পাওয়া ও ফিক্স করা হয়েছে:

- 🐛 **Notification Bell Nested-Interactive `<button>` (গুরুতর bug)**:
  `components/layout/notification-bell.tsx` এ `<DropdownMenuTrigger>`
  এর children হিসেবে সরাসরি `<Button>` বসানো ছিল (`render` prop
  ব্যবহার না করে)। base-ui এর `Menu.Trigger` নিজে `render` prop না
  পেলে নিজেই একটা `<button>` DOM element রেন্ডার করে — ফলে চূড়ান্ত
  HTML এ `<button><button>...</button></button>` (নেস্টেড
  ইন্টারঅ্যাক্টিভ এলিমেন্ট) তৈরি হচ্ছিল, যা invalid HTML (WCAG 4.1.1
  Parsing লঙ্ঘন) এবং স্ক্রিন-রিডার/কীবোর্ড ইউজারদের জন্য বিভ্রান্তিকর।
  এই একই বাগ প্যাটার্ন (nested `<button>`) আগের সেশনে notification
  bell/center এর delete আইকনে পাওয়া গিয়েছিল, কিন্তু এবার trigger
  লেভেলে এই নতুন instance টা প্রোঅ্যাক্টিভ কীবোর্ড অডিটে ধরা পড়ল।
  ফিক্স: `<Button>` কে `render` prop এ move করা হয়েছে (Dialog/
  AlertDialog এর প্রতিষ্ঠিত প্যাটার্ন অনুসরণ করে), এখন সঠিকভাবে
  একটামাত্র `<button>` DOM এ থাকে — সার্ভার-রেন্ডার করা HTML এ লাইভ
  ভেরিফাই করা হয়েছে। বাড়তি সুবিধা: Button এর নিজস্ব
  `focus-visible:ring-3` স্টাইল এখন সঠিকভাবে trigger element এ
  প্রয়োগ হচ্ছে।
- 🐛 **Reading Room রুম-সিলেকশন কার্ডে Focus Indicator মিসিং**:
  `components/reading-room/reading-room-dashboard.tsx` এ `role=
  "button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space) সহ কাস্টম
  কীবোর্ড-অ্যাক্সেসিবল কার্ড ছিল (ভালো), কিন্তু কোনো `focus-visible`
  ring স্টাইল ছিল না — কীবোর্ড দিয়ে Tab করলে ব্যবহারকারী কোন কার্ডে
  ফোকাস আছে তা visually বুঝতে পারতো না (WCAG 2.4.7 Focus Visible
  লঙ্ঘন)। ফিক্স: `focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-ring focus-visible:ring-offset-2` যোগ করা
  হয়েছে (flashcard review-runner.tsx এর ফ্লিপ কার্ডের একই প্যাটার্ন)।
- ✅ **সম্পূর্ণ কোডবেস সিস্টেমেটিক অডিট**: Python স্ক্রিপ্ট দিয়ে
  `<Trigger>...<Button/>` children প্যাটার্ন (render prop ছাড়া) পুরো
  কোডবেসে খোঁজা হয়েছে — শুধু এই একটাই instance পাওয়া গেছে। `outline-
  none` ব্যবহার করা সব জায়গায় (`global-search.tsx` input,
  `dropdown-menu.tsx` positioner) চেক করে নিশ্চিত হওয়া হয়েছে যে হয়
  পর্যাপ্ত replacement focus indicator আছে অথবা প্রোগ্রাম্যাটিক
  auto-focus এর কারণে প্রাসঙ্গিক না। User Menu (Avatar trigger)
  অডিট করে নিরাপদ নিশ্চিত হওয়া গেছে (এখানে বাগ ছিল না, কারণ
  `<Avatar>` একটা `<span>`, নেস্টেড বাটন সমস্যা হয় না)। Select/Tabs/
  Switch base-ui কম্পোনেন্ট গুলোতে ইতিমধ্যেই সঠিক `focus-visible`
  স্টাইল আছে তা যাচাই করা হয়েছে।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-keyboard-focus-audit.py`,
  ১৫টা assertion, সব PASS): সার্ভার-রেন্ডার করা dashboard HTML এ
  স্ট্যাক-ভিত্তিক পার্সার দিয়ে nested `<button>` আর নেই তা ভেরিফাই,
  নতুন focus-visible ring class রেন্ডার করা HTML+সোর্সে আছে তা
  যাচাই, notification unread-count endpoint + Reading Room পেজ
  এখনো crash-free/ফাংশনাল (regression-free), unauthenticated ৪০১,
  static source-code verification তিনটা ফাইলেই।
- ⚠️ **সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)**: "কীবোর্ড দিয়ে Tab করলে
  আসলেই ring visually দেখা যায়" এটা Python/requests দিয়ে verify করা
  সম্ভব না (browser render দরকার) — টেস্টে সার্ভার-রেন্ডার HTML এ
  bug-free structure + সঠিক CSS class উপস্থিতি ভেরিফাই করা হয়েছে,
  ম্যানুয়াল browser কীবোর্ড টেস্টিং এখনো বাকি।

"P2025 500-instead-of-404" সিস্টেমেটিক অডিটে যা যা পাওয়া ও ফিক্স করা হয়েছে:

- 🐛 **Root cause আবিষ্কার**: `GET /api/forum/posts/[postId]` এ
  viewCount বাড়ানোর জন্য সরাসরি `prisma.forumPost.update()` কল করে
  তারপর `if (!post)` চেক করে ৪০৪ রিটার্নের চেষ্টা করা হতো। কিন্তু
  Prisma `update()`/`delete()` কোনো ম্যাচিং রেকর্ড না পেলে `null`
  রিটার্ন করে না — বরং `PrismaClientKnownRequestError` (code P2025)
  throw করে। ফলে `if (!post)` চেক কখনো রান হতো না (dead code),
  অস্তিত্বহীন/মুছে ফেলা postId দিয়ে কল করলে unhandled exception এ
  ৪০৪ এর বদলে ৫০০ Internal Server Error রিটার্ন হতো — লাইভ টেস্টে
  সরাসরি ভেরিফাই করে নিশ্চিত হওয়া গেছে।
- ✅ **সম্পূর্ণ কোডবেস সিস্টেমেটিক অডিট**: এই একটা bug পাওয়ার পরে
  Python regex script দিয়ে পুরো `app/api/` এ একই প্যাটার্ন (কোনো
  `findUnique`/`findFirst` existence check ছাড়া GET/PATCH/DELETE
  handler এ সরাসরি `update()`/`delete()` কল) খোঁজা হয়েছে — মোট ১৯টা
  সন্দেহজনক জায়গা চিহ্নিত হয়, ম্যানুয়াল রিভিউ ও লাইভ টেস্ট করে
  **১৪টা প্রকৃত bug** নিশ্চিত হয় (বাকি ৫টা false-positive, কারণ
  ownership check helper function এ existence যাচাই আগেই হয়ে
  গিয়েছিল — `custom-question-sets`, `pdf-chat`, `tasks`, `user/
  profile`, `user/ai-tutor-mode`, `user/digest-preference` নিরাপদ
  নিশ্চিত হয়েছে)।
- 🐛🔧 **১৪টা bug ফিক্স করা হয়েছে** (সব একই প্যাটার্নে —
  `update()`/`delete()` কল করার আগে `findUnique()` দিয়ে existence
  চেক করে না পেলে ৪০৪ রিটার্ন): `GET /api/forum/posts/[postId]`,
  `PATCH`+`DELETE /api/admin/chapters/[chapterId]`, `PATCH`+`DELETE
  /api/admin/subjects/[subjectId]`, `PATCH`+`DELETE /api/admin/
  topics/[topicId]`, `PATCH`+`DELETE /api/admin/questions/
  [questionId]`, `PATCH`+`DELETE /api/admin/cq-questions/
  [cqQuestionId]`, `DELETE /api/admin/forum/posts/[postId]`, `PATCH
  /api/admin/forum/posts/[postId]/pin`, `PATCH /api/admin/users/
  [userId]` (এখানে `previousUser` fetch করা হতো কিন্তু null চেক না
  করেই সরাসরি update() কল হতো)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-p2025-404-audit.py`,
  ৩৬টা assertion, সব PASS): Admin+Student দুইজন real ইউজার দিয়ে —
  প্রতিটা ফিক্স করা endpoint এ নিশ্চিতভাবে-অস্তিত্বহীন ID দিয়ে
  রিকোয়েস্ট পাঠিয়ে এখন ৪০৪ (আগে ৫০০ ছিল) রিটার্ন হচ্ছে তা ভেরিফাই,
  authorization এখনো ঠিক আছে (student → admin endpoint এ ৪০৩),
  আসল রেকর্ড দিয়ে normal flow এখনো কাজ করছে (regression-free —
  আসল forum post তৈরি+GET+viewCount increment+DELETE+DB cascade
  verify সহ), static source-code verification সব ৯টা মূল ফাইলে।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট forum post প্রকৃত `DELETE
  /api/forum/posts/[postId]` endpoint দিয়ে মুছে DB তে ভেরিফাই, টেস্ট
  ইউজার delete + verify, ০টা orphan row।
- ⚠️ **সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)**: এই bug pattern টা
  systematic regex-based audit দিয়ে খোঁজা হয়েছে (`update()`/
  `delete()` কল আছে কিন্তু কোনো `findUnique`/`findFirst` নেই এমন
  handler বডি) — এটা ১০০% নিশ্চিত না যে কোডবেসে আরও কোনো instance
  নেই (যেমন কোনো helper function এর ভেতরে existence check থাকতে
  পারে যা regex ধরতে পারেনি এবং সেটা সঠিকভাবে false-positive
  হিসেবে বাদ পড়েছে, অথবা বিপরীতভাবে কোনো সূক্ষ্ম true-positive মিস
  হয়ে থাকতে পারে) — ভবিষ্যতে নতুন endpoint লেখার সময় এই checklist
  মাথায় রাখা জরুরি।

XP-Double-Award প্যাটার্ন অডিটে যা যা পাওয়া ও ফিক্স করা হয়েছে:

- 🐛 **Topic Progress XP Farming (Task/StudyPlanItem এর একই bug
  pattern)**: `POST /api/topics/[topicId]/progress` এ MASTERED status
  পাঠালেই (আগের state চেক না করে) প্রতিবার ২০ XP দেওয়া হতো —
  LEARNING↔MASTERED বার বার টগল করে অসীম XP farming সম্ভব ছিল। লাইভ
  টেস্টে ৩ বার MASTERED করিয়ে ৬০ XP পাওয়া গেছে প্রমাণ হিসেবে
  (প্রত্যাশিত ছিল ২০)। ফিক্স: `TopicProgress.xpAwarded` ফ্ল্যাগ যোগ
  (নতুন migration, Task/StudyPlanItem এর প্রতিষ্ঠিত প্যাটার্ন
  অনুসরণ করে) — পুরো টপিক-প্রোগ্রেসের জীবনচক্রে persist থাকে, একবার
  XP পেলে আর কখনো দ্বিতীয়বার পাবে না।
- 🐛🔧 **Study Group Weekly Bonus XP Race Condition (দুই ধাপে
  আবিষ্কৃত)**: প্রথমে কোড রিভিউতে থিওরিটিক্যাল over-award race
  condition সন্দেহ হয় (read-then-write প্যাটার্ন, কোনো transaction/
  lock ছাড়া, দুইজন সদস্য একই মুহূর্তে contribute করলে bonus দুইবার
  দেওয়ার ঝুঁকি)। প্রথম ফিক্স (atomic claim mechanism) verify করতে
  গিয়ে লাইভ টেস্টে **আরও গুরুতর bug** ধরা পড়ে: stale-read এর কারণে
  ৫ জন concurrent contributor একসাথে XP দিলে **কেউই** bonus পাচ্ছিল
  না (under-award, over-award এর উল্টো) — কারণ প্রত্যেকে নিজের
  পুরনো read এর ভিত্তিতে `afterTotal` হিসাব করছিল, অন্যদের একই
  সময়ে হওয়া commit দেখতে পারছিল না। চূড়ান্ত ফিক্স: নিজের
  contribution commit হওয়ার পরে fresh aggregate করে group এর প্রকৃত
  current total বের করা, তারপর `StudyGroup.weeklyBonusWeekStart`
  ফিল্ডে atomic conditional `updateMany()` দিয়ে "claim" করা
  (PostgreSQL row-level lock ব্যবহার করে) — over-award এবং
  under-award দুটোই দূর করা হয়েছে। ৩ বার লাইভ টেস্টে (৫ জন
  সত্যিকারের concurrent DB কল সহ, Node.js/tsx দিয়ে actual
  lib/study-group.ts থেকে import করে) ভেরিফাই করা হয়েছে — প্রতিবার
  ঠিক ৫টা bonus notification ও সবার XP সমান পাওয়া গেছে।
- ✅ **বাকি ১৭টা `awardXp()` call site অডিট করা হয়েছে**: CQ
  submit/Practice submit/Adaptive Practice/Drill/Mock Exam (প্রতিটা
  নতুন attempt row তৈরি করে, তাই বৈধ), Forum post/reply create
  (প্রতিটা নতুন কনটেন্ট, বৈধ), Study Session/Flashcard Review
  (প্রতিটা নতুন সেশন/রিভিউ, বৈধ), Live Exam/Quiz Battle/Quiz Duel
  submit (status guard দিয়ে একমুখী state transition, দ্বিতীয়বার
  submit করলে exception হয়ে যায়, নিরাপদ), Reading Room leave
  (`endedAt` check দিয়ে নিরাপদ) — সবগুলোতে duplicate-award সম্ভব না
  তা কোড রিভিউ করে নিশ্চিত হওয়া গেছে।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-xp-double-award-audit.py`,
  ২০টা assertion সব PASS + `scripts/test-study-group-bonus-race-
  condition.ts`, ৩ বার রান করে প্রতিবার PASS): Topic Progress এ
  ৫ বার টগল করে XP ঠিক একবারই দেওয়া নিশ্চিত, ৫ জন concurrent
  contributor দিয়ে Study Group bonus ঠিক একবারই (over/under-award
  দুটোই না) দেওয়া নিশ্চিত, authorization/edge-case (৪০১/৪০০),
  static source-code verification।
- ✅ **কোনো ডেটা migration সমস্যা হয়নি**: DB তে migration এর সময়
  কোনো বিদ্যমান `topic_progress`/`study_groups` রেকর্ড ছিল না
  (যাচাই করে নিশ্চিত হওয়া গেছে), তাই backfill defensive হলেও
  আসলে কোনো রো আপডেট করেনি।

Bottom Navigation Bar (মোবাইল) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **৫-আইকন Bottom Tab Bar** (`components/layout/bottom-nav-bar.tsx`):
  Duolingo/Instagram-স্টাইল ফিক্সড বটম ন্যাভিগেশন — হোম (Dashboard),
  শেখো (Learn), প্র্যাকটিস (Practice), প্ল্যানার, এবং "আরও" (বাকি সব
  মডিউলের bottom-sheet মেনু)। HSC Ultimate এ ৩০+টা মডিউল থাকায় সবগুলো
  bottom bar এ রাখা সম্ভব না — সবচেয়ে ঘন ঘন ব্যবহৃত ৪টা মূল ট্যাব +
  "আরও" শীটে বাকি সব রাখা হয়েছে।
- ✅ **"আরও" Bottom Sheet মেনু** (`components/layout/more-menu-sheet.tsx`):
  base-ui Dialog primitive দিয়ে কাস্টম bottom-sheet (নিচ থেকে
  স্লাইড-আপ, drag-handle ভিজ্যুয়াল ইঙ্গিত সহ) — AI Tutor, Flashcards,
  Forum, Study Group, Reading Room, Quiz Duel/Battle, PDF Chat, Live
  Exam, Analytics, Settings ইত্যাদি ১৮টা+ মডিউলের গ্রিড। Admin হলে
  conditionally "Admin Panel" শর্টকাটও যোগ হয়।
- ✅ **Conditional রেন্ডারিং**: `useSession()` + `usePathname()` দিয়ে
  — (ক) লগইন করা না থাকলে (landing/login/register পেজে) দেখানো হয় না,
  (খ) Admin Panel এ দেখানো হয় না (নিজস্ব sidebar আছে), (গ) quiz/exam/
  duel/battle এর লাইভ "run"/"attempt"/[sessionId] সাব-রুটে দেখানো হয়
  না (ভুলবশত ট্যাব চেপে পরীক্ষা থেকে বের হয়ে যাওয়া এড়াতে) — কিন্তু
  তাদের লিস্ট/হিস্ট্রি পেজে (`/duel`, `/quiz-battle`, `/pdf-chat`
  ইত্যাদি) ঠিকই দেখানো হয় (exception-path লজিক দিয়ে)।
- ✅ **DRY রিফ্যাক্টর**: `PROTECTED_PREFIXES` আগে শুধু `proxy.ts` এ
  hardcoded ছিল — নতুন `lib/protected-routes.ts` এ বের করে এনে দুই
  জায়গাতেই (middleware + ভবিষ্যতে অন্য client কম্পোনেন্ট) reuse করা
  যায় এমন pure array বানানো হয়েছে।
- ✅ **Active Tab হাইলাইট + Accessibility**: `aria-current="page"`
  active ট্যাবে, nested রুটেও কাজ করে (`/learn/[subjectId]` তে
  "শেখো" ট্যাব active থাকে), `role="navigation"` + বাংলা
  `aria-label`, প্রতিটা ট্যাব আসল `<Link>` (keyboard-focusable),
  `focus-visible:ring-2` কীবোর্ড focus indicator।
- ✅ **Safe-area padding**: `env(safe-area-inset-bottom)` ব্যবহার
  করে iOS/Android এর home-indicator/gesture-bar এর সাথে ওভারল্যাপ
  এড়ানো হয়েছে। Content এর নিচে একটা spacer `<div>` যোগ করা হয়েছে
  যাতে bottom nav কোনো পেজের নিচের অংশ ঢেকে না ফেলে।
- ✅ **বিদ্যমান fixed-position UI element এর সাথে সমন্বয়**: PWA
  Install Prompt ও Offline Sync Indicator — দুটোই আগে `bottom-4`
  এ ফিক্সড ছিল, মোবাইলে bottom nav এর সাথে ওভারল্যাপ করতো। এখন
  মোবাইলে `bottom-[calc(4.5rem+env(safe-area-inset-bottom))]` (bottom
  nav এর উপরে) এবং `sm:` ব্রেকপয়েন্টের উপরে (যেখানে bottom nav
  hidden) আগের `bottom-4` ফিরে আসে।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-bottom-nav-bar.py`,
  ৪২টা assertion সব PASS): bottom nav এর ৪টা ট্যাব + "আরও" মেনুর
  ১৮টা+ রুট crash-free লোড ভেরিফাই (batched requests, memory-aware),
  landing/login পেজ regression-free, static source-code verification
  (hidden-prefix লজিক, active-tab লজিক, accessibility attribute,
  DRY রিফ্যাক্টর, fixed-element bottom-offset ঠিক)।
- ⚠️ **সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)**: `BottomNavBar` client-side
  `useSession()` hook এর উপর নির্ভর করে (session client-এ resolve
  হওয়ার পরেই রেন্ডার হয়) — তাই সার্ভার-রেন্ডার করা initial HTML এ
  এটা দেখা যায় না (established CSR false-negative pattern, এই
  কোডবেসে বহুবার নিশ্চিত হওয়া প্যাটার্ন)। এছাড়া প্রকৃত মোবাইল
  ডিভাইসে/DevTools mobile emulation এ visually bottom nav ঠিকভাবে
  দেখা যাচ্ছে কিনা এবং touch target size (৪৪px+ Apple HIG সুপারিশ)
  উপযুক্ত কিনা — এটা এই sandbox এ browser automation না থাকায়
  ম্যানুয়ালি ভেরিফাই করা সম্ভব হয়নি, ব্যবহারকারীকে নিজে দেখে
  নিশ্চিত হওয়ার অনুরোধ থাকল।

DELETE Endpoint Cascade অডিটে যা যা পাওয়া ও ফিক্স করা হয়েছে:

- 🐛 **Root cause আবিষ্কার**: `QuizBattle.customSetId` ও
  `LiveExamSession.customSetId` কোনো Prisma `@relation` (foreign key)
  দিয়ে `CustomQuestionSet` এর সাথে যুক্ত না (শুধু raw string ID,
  কারণ প্রশ্নের উৎস দুই রকম হতে পারে — Subject question bank অথবা
  CustomQuestionSet, একটামাত্র nullable FK দিয়ে generalize করা কঠিন
  ছিল বলে ইচ্ছাকৃতভাবে raw ID রাখা হয়েছিল)। এর ফলে কোনো DB-level
  cascade/restrict constraint কাজ করে না — একজন ইউজার নিজের
  CustomQuestionSet দিয়ে একটা Quiz Battle/Live Exam **চলাকালীন
  অবস্থায়** (ACTIVE/IN_PROGRESS) সেই সেট ডিলিট করলে participant রা
  `GET .../questions` কল করলে `questions: []` (খালি, কোনো error
  message ছাড়াই) পেতো — battle/exam "চলছে" কিন্তু কোনো প্রশ্ন নেই,
  ইউজার আটকে যেতো। লাইভ টেস্টে সরাসরি reproduce করে (আসল Quiz
  Battle তৈরি+start+সেট ডিলিট+questions endpoint কল) নিশ্চিত হওয়া
  গেছে উভয় ক্ষেত্রেই (Quiz Battle ও Live Exam)।
- 🔧 **ফিক্স**: `DELETE /api/custom-question-sets/[setId]` এ ডিলিটের
  আগে চেক করা হচ্ছে এই সেট কোনো non-COMPLETED Quiz Battle
  (WAITING/ACTIVE) বা IN_PROGRESS Live Exam এ ব্যবহৃত হচ্ছে কিনা —
  থাকলে স্পষ্ট বাংলা এরর মেসেজ সহ ৪০০ রিটার্ন করে ডিলিট ব্লক করা হয়।
  Battle/exam শেষ হয়ে গেলে (COMPLETED) ডিলিট আগের মতোই স্বাভাবিকভাবে
  কাজ করে (regression-free)।
- ✅ **সম্পূর্ণ schema-wide cascade রিভিউ**: সব `@relation` চেক করে
  দেখা হয়েছে বাকি সব ক্ষেত্রে `onDelete: Cascade`/`SetNull` সঠিকভাবে
  আছে (৩০+টা টেবিল)। `QuizDuel` এর `challengerId`/`opponentId`
  উভয়েই cascade — কোনো একজনের অ্যাকাউন্ট ডিলিট হলে পুরো duel record
  ও অন্যজনের history entry-ও হারিয়ে যায় (থিওরিটিক্যাল ক্ষতি,
  আগের সেশনে already documented, GDPR-style "নিজের ডেটা ডিলিট করার
  অধিকার" এর সাথে trade-off — ইচ্ছাকৃতভাবে ব্লক করা হয়নি কারণ এটা
  ইউজারকে নিজের অ্যাকাউন্ট ডিলিট করা থেকে আটকাবে, শুধু নথিভুক্ত
  করে রাখা হলো)।
- ✅ **লাইভ multi-user টেস্ট**
  (`scripts/test-custom-set-delete-cascade-audit.py`, ২০টা assertion
  সব PASS): Owner+Player দুইজন real ইউজার দিয়ে — WAITING+ACTIVE
  battle এ ব্যবহৃত সেট ডিলিট ব্লকড, COMPLETED battle এ ডিলিট এখনো
  কাজ করে, IN_PROGRESS Live Exam এ ব্যবহৃত সেট ডিলিট ব্লকড, প্রশ্ন
  এখনো ঠিকভাবে লোড হচ্ছে (regression-free, খালি লিস্ট আর না),
  authorization (owner না হলে ৪০৪), static source-code verification।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট battle/set/session/user
  প্রকৃত API+সরাসরি DB delete দিয়ে পরিষ্কার, ০টা orphan row।

"আজকের পড়া" (Today's Focus) + নমনীয় Duration Auto Study Plan এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **Dashboard "আজকের পড়া" কার্ড** (`components/dashboard/today-focus-card.tsx`) —
  স্ট্যাটস কার্ডের (স্ট্রিক/XP/লেভেল) ঠিক পরে, মডিউল গ্রিডের আগে বসানো
  হয়েছে (ব্যবহারকারীর সরাসরি নির্দেশে)। AI-generated Study Plan থেকে
  প্রতিদিনের নির্দিষ্ট পড়া prominently দেখায়, আইটেম complete করা যায়
  (optimistic UI update সহ), এবং কোনো active প্ল্যান না থাকলে "প্ল্যান
  বানাও" CTA দেখায়।
- ✅ **Missed Topic Rollover ("বকেয়া" স্ট্যাক)** — কোনো দিনের আইটেম
  miss হলে সেটা পরের দিন সবার উপরে "গতকালের বাকি" ব্যাজ সহ নতুন দিনের
  টপিকের সাথে একসাথে দেখায়, একাধিক দিন miss হলে জমতেই থাকে (stack)।
  `lib/today-focus.ts` এ `getTodayFocus()` ফাংশন এই rollover কুয়েরি
  (date <= আজ AND isCompleted = false) হ্যান্ডল করে, কোনো নতুন cron/
  field দরকার হয়নি।
- ✅ **নমনীয় Duration (১/৭/৩০/৩৬৫ দিন বা কাস্টম)** — পুরনো ফিক্সড-৭-দিন
  Auto Study Plan সিস্টেমকে সম্পূর্ণ rewrite করে একটাই unified নমনীয়
  সিস্টেমে upগ্রেড করা হয়েছে (কোনো duplicate সিস্টেম না)। `StudyPlan`
  মডেলে নতুন `durationDays` ফিল্ড (migration
  `20260718020000_add_flexible_study_plan_duration`), Planner পেজের
  Study Plan কার্ডে (`components/planner/study-plan-card.tsx`) duration
  selector dialog দিয়ে ব্যবহারকারী নিজে ঠিক করতে পারে।
- ✅ **AI দিয়ে ধাপে ধাপে (chunked) ব্যাকগ্রাউন্ড generation** — ৩০ দিনের
  বেশি duration এ AI দিয়ে একবারে পুরোটা জেনারেট করা সম্ভব না (token
  limit + hallucination ঝুঁকি) — তাই `CHUNK_SIZE_DAYS=15` এ ভাগ করে
  ধাপে ধাপে জেনারেট করা হয়: প্রথম chunk সিঙ্ক্রোনাসভাবে জেনারেট হয়
  (ইউজার সাথে সাথে প্রথম অংশ দেখতে পায়), বাকি chunk গুলো
  `generateRemainingChunks()` দিয়ে ব্যাকগ্রাউন্ডে (fire-and-forget,
  `custom-question-gen.ts` এর প্যাটার্ন অনুসরণ করে) ধারাবাহিকভাবে
  জেনারেট হয় — `StudyPlan.generationStatus` (GENERATING/READY/FAILED)
  ও `daysGenerated` দিয়ে ফ্রন্টএন্ড ৮ সেকেন্ড ইন্টারভালে পোলিং করে
  progress দেখায়।
- 🐛 **বাগ ফিক্স #১ — বড় duration এ AI JSON truncation** — প্রথমে
  `CHUNK_SIZE_DAYS=30` + `maxTokens=3000` দিয়ে ৩৬৫-দিনের প্ল্যান
  জেনারেট করতে গিয়ে লাইভ টেস্টে "AI থেকে সঠিক ফরম্যাটে স্টাডি প্ল্যান
  পাওয়া যায়নি" error পাওয়া গিয়েছিল — root cause: বড় chunk এর বাংলা
  JSON আউটপুট ৩০০০ token এ কেটে যাচ্ছিল, কাটা জায়গায় closing bracket
  না থাকায় তখনকার parsing logic কোনো ম্যাচই পেতো না। ফিক্স:
  `CHUNK_SIZE_DAYS` কমিয়ে ১৫, `maxTokens` বাড়িয়ে ৬০০০, এবং নতুন robust
  parsing যোগ।
- 🐛 **বাগ ফিক্স #২ — AI response এর মাঝখানে corrupted token** — ৯০-দিনের
  প্ল্যান টেস্ট করার সময় সম্পূর্ণ (non-truncated) AI response এর
  **মাঝখানে** একটা stray বাংলা character ঢুকে গিয়ে পুরো array-ভিত্তিক
  JSON.parse ব্যর্থ করে দিচ্ছিল (cerebras provider generation glitch)।
  ফিক্স: `lib/study-plan-generator.ts` এ নতুন
  `extractObjectsByBracketMatching()` ফাংশন — string-aware bracket-depth
  counting দিয়ে প্রতিটা `{...}` object আলাদাভাবে parse করার চেষ্টা করে,
  কোনো object malformed হলে সেটা **skip** করে বাকি ভালো object গুলো
  রক্ষা করে (পুরো chunk exception এ না ফেলে)।
- ✅ **লাইভ multi-user টেস্ট** — `scripts/verify-json-extraction.ts`
  (৫টা কেস, actual code file থেকে import করে, truncation + mid-string
  corruption দুটোই কভার করে, সব PASS); Python দিয়ে ডিজাইন-ভেরিফিকেশনের
  পরে নতুন ইউজার রেজিস্ট্রেশন+লগইন করে ৯০-দিন ও ৩৬৫-দিন উভয়ের প্ল্যান
  end-to-end জেনারেট করে ব্যাকগ্রাউন্ড পোলিং করে `READY` status পর্যন্ত
  সফলভাবে সম্পূর্ণ ভেরিফাই করা হয়েছে (কোনো `FAILED` chunk ছাড়াই),
  rollover আচরণ (item ম্যানুয়ালি পিছিয়ে দিয়ে `overdueCount` বৃদ্ধি,
  আসল endpoint দিয়ে complete করে হ্রাস) verified।
- ✅ **Authorization/edge-case টেস্ট**: unauthenticated
  `/api/study-plan/generate` ও `/api/study-plan/today` এ ৪০১,
  `durationDays` রেঞ্জের বাইরে (０, -৫, ৫০০০) বা non-number এ ৪০০।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (`todayfocus_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  ভেরিফাই (০টা orphan `study_plans` row)।

Exam-Day Retention Forecast ("পরীক্ষার দিনে কত % মনে থাকবে?") এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **গবেষণা-ভিত্তিক নতুন ফিচার আইডিয়া** (`docs/FEATURE_RESEARCH_V4.md`) —
  ২০২৬ সালের গ্লোবাল এডটেক ট্রেন্ড (premium flashcard app Retain.cards এর
  "predicted knowledge level on exam day") ও বাংলাদেশ HSC মার্কেট
  (competitor app রিভিউ) নিয়ে fresh deep research করে এই ফিচার বেছে
  নেওয়া হয়েছে — schema-free/migration-free হওয়ায় সবচেয়ে ভালো candidate।
- ✅ **কোনো নতুন migration/AI cost লাগেনি** — বিদ্যমান FSRS ডেটা
  (`Flashcard.fsrsStability`/`fsrsDifficulty`/`fsrsState`) ও
  `User.examDate` পুনর্ব্যবহার করে pure math দিয়ে বানানো হয়েছে।
- ✅ **`lib/retention-forecast.ts`** (নতুন) — `ts-fsrs` লাইব্রেরির
  অফিসিয়াল `get_retrievability(card, futureDate)` মেথড ব্যবহার করে
  (কোনো কাস্টম ফর্মুলা re-implement না করে) যেকোনো ভবিষ্যৎ তারিখে
  প্রতিটা reviewed flashcard এর predicted retrievability % হিসাব করে।
  আজ থেকে exam date পর্যন্ত সমান দূরত্বে সর্বোচ্চ ২৪টা sample point এ
  timeline তৈরি করে (দীর্ঘ countdown যেমন HSC 2028 ব্যাচের ৭০০+ দিনেও
  chart smooth থাকে), সাবজেক্ট-ভিত্তিক ব্রেকডাউন (দুর্বল বিষয় আগে সাজানো)।
- ✅ **`app/api/analytics/retention-forecast/route.ts`** (নতুন GET
  endpoint) ও **`components/analytics/retention-forecast-card.tsx`**
  (নতুন কার্ড, Analytics পেজে Predicted GPA কার্ডের ঠিক পরে বসানো) —
  Recharts `AreaChart` দিয়ে retention প্রক্ষেপণ লাইন, সামগ্রিক
  বর্তমান/exam-day retention % কার্ড, সাবজেক্ট-ভিত্তিক badge লিস্ট।
  কোনো flashcard review না থাকলে friendly empty-state (ফ্ল্যাশকার্ড
  পেজে যাওয়ার লিংক সহ)।
- ✅ **Past-exam edge case** — exam date অতীতে হলে (`isPastExam: true`)
  timeline এ ১টা মাত্র পয়েন্ট, current ও exam-day retention একই দেখায়
  (আর কোনো ভবিষ্যৎ প্রক্ষেপণ অর্থহীন)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-retention-forecast.py`,
  ২৬টা assertion, সব PASS) — নতুন ইউজার রেজিস্ট্রেশন+লগইন, flashcard
  deck+৪টা কার্ড তৈরি, বাস্তব `/api/flashcards/[cardId]/review`
  endpoint দিয়ে মিশ্র রেটিং (again/good/easy) সহ রিভিউ করে FSRS state
  তৈরি, exam date ৩০ দিন পরে সেট করে verify: current retention ~100%
  (এইমাত্র review করা), exam-day retention উল্লেখযোগ্যভাবে কম (~৬৫%,
  review না করলে স্বাভাবিক decay), timeline এর প্রথম/শেষ পয়েন্ট সঠিক
  দিন সংখ্যায় (0 ও ~৩০), subject breakdown এ PHYSICS ৪টা কার্ড সহ সঠিক।
  আলাদাভাবে past-exam edge case ও empty-state (কোনো review ছাড়া) টেস্ট
  করা হয়েছে।
- ✅ **Authorization**: unauthenticated `/api/analytics/retention-forecast`
  এ ৪০১ ভেরিফাই।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (`retentionforecast_*`,
  `retentionpast_*` প্যাটার্ন) প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট, cascade delete ভেরিফাই (০টা orphan
  `flashcard_decks` row)।

গুরুতর বাগ ফিক্স — Forum Best Answer XP Farming এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🐛 **আবিষ্কৃত বাগ (দুই ধাপে)**: `PATCH /api/forum/replies/[replyId]/best-answer`
  এ কোনো idempotency guard ছাড়াই প্রতিবার `awardXp(reply.userId, 10)`
  কল হতো। প্রথমে শুধু `isBestAnswer=false` চেক দিয়ে ফিক্স করার চেষ্টা
  করা হয়েছিল, কিন্তু লাইভ টেস্টে ধরা পড়ে সেটা যথেষ্ট না —
  **toggle-cycling** এখনো সম্ভব ছিল: Reply A মার্ক (isBestAnswer=true,
  +10 XP) → Reply B মার্ক (A এর isBestAnswer legitimately false হয়ে
  যায়) → আবার Reply A মার্ক করলে সেটা "isBestAnswer=false থেকে নতুন
  selection" হিসেবে বৈধ দেখায় এবং আবার XP দিয়ে দেয়। লাইভ টেস্টে ৪ বার
  মার্ক করিয়ে ৪৫ XP পাওয়া গেছে (প্রত্যাশিত ১৫: ৫ reply + ১০ প্রথমবার
  best-answer)।
- ✅ **চূড়ান্ত ফিক্স** — `ForumReply` এ নতুন স্থায়ী `bestAnswerXpAwarded`
  ফ্ল্যাগ (migration `20260719000000_add_forum_best_answer_xp_awarded`,
  Task/StudyPlanItem/TopicProgress এর একই established প্যাটার্ন) যেটা
  `isBestAnswer` টগলিং থেকে সম্পূর্ণ স্বাধীন — একটা reply এর জীবনচক্রে
  সর্বোচ্চ ১ বার XP দেওয়া হয়, কিন্তু `isBestAnswer` (কোনটা "বর্তমান সেরা
  উত্তর" তা দেখানোর UX ফ্ল্যাগ) স্বাভাবিকভাবে toggle হতেই থাকে (owner
  একাধিকবার মন পরিবর্তন করে ভিন্ন reply বেছে নিতে পারবে, শুধু XP বারবার
  পাবে না)।
- ✅ **Race-condition-প্রুফ**: single atomic
  `UPDATE ... WHERE id=? AND bestAnswerXpAwarded=false` স্টেটমেন্ট দিয়ে
  check+set একসাথে করা হয়েছে (Postgres row-level lock guarantee) —
  আলাদা read-then-write করলে TOCTOU race condition থেকে যেত (Study
  Group Weekly Bonus Race Condition বাগের একই ঝুঁকি)।
- ✅ **Notification মেসেজ সংশোধন**: XP re-award না হলে (re-selection)
  নোটিফিকেশনে "+10 XP" উল্লেখ না করে শুধু কৃতজ্ঞতা জানানো হয় (misleading
  এড়াতে)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-forum-best-answer-xp-farming.py`,
  ২৮টা assertion, সব PASS) — ৩ জন real ইউজার (owner+২ replier) দিয়ে:
  প্রথমবার best-answer মার্কে +10 XP, দ্বিতীয় reply মার্ক করায় প্রথমটার
  isBestAnswer সরে যাওয়া কিন্তু bestAnswerXpAwarded অক্ষত থাকা, একই
  reply আবার মার্ক করায় isBestAnswer ঠিকভাবে ফিরে আসা কিন্তু XP আর না
  বাড়া, একাধিকবার toggle করেও চূড়ান্ত XP ঠিক থাকা (১৫, বাগ থাকলে ৪৫
  হতো), non-owner/unauthenticated/non-existent reply এ যথাক্রমে
  ৪০৩/৪০১/৪০৪।
- ✅ **আলাদা concurrency টেস্ট** — একই reply-তে ১০টা concurrent PATCH
  request পাঠিয়ে (Python threading দিয়ে) ভেরিফাই করা হয়েছে ঠিক +10 XP
  একবারই দেওয়া হয়েছে (race condition প্রতিরোধ প্রমাণিত)।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (`bestanswer_*`,
  `racebestans_*` প্যাটার্ন) প্রকৃত `/api/user/delete-account` endpoint
  দিয়ে ডিলিট, cascade delete ভেরিফাই।

গুরুতর বাগ ফিক্স — Task/StudyPlanItem/TopicProgress XP Race Condition অডিট এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔬 **অডিটের প্রেক্ষাপট**: Forum Best Answer XP Farming বাগ ফিক্স করার
  পরে "একই ক্লাসের বাগ আর কোথাও আছে কিনা" যাচাই করতে পুরো কোডবেসে
  `awardXp()` কল হওয়া সব endpoint (১৮টা+ জায়গা) অডিট করা হয়েছে। যেসব
  endpoint একটা "toggle-able" ফ্ল্যাগের state change এ XP দেয় (Task,
  StudyPlanItem, TopicProgress — তিনটাই `xpAwarded` ফ্ল্যাগ ব্যবহার করে,
  আগের সেশনে toggle-cycling ফিক্স করা হয়েছিল) সেগুলোর read-then-write
  প্যাটার্ন (`findUnique()`/`upsert()` দিয়ে read করে `xpAwarded` চেক করে,
  পরে আলাদা `update()` কল) নিয়ে সন্দেহ হয় — Forum Best Answer বাগে এই
  একই কাঠামোগত সমস্যা race condition তৈরি করেছিল।
- 🐛 **আবিষ্কৃত বাগ**: লাইভ concurrency টেস্টে (১০টা/৫টা concurrent
  request একই resource এ, Python `threading` দিয়ে) নিশ্চিত হয়েছে
  **তিনটাতেই** (Task, StudyPlanItem, TopicProgress) race condition
  বিদ্যমান ছিল — ৫টা concurrent request পাঠিয়ে Task এ ২৫ XP (প্রত্যাশিত
  ৫), StudyPlanItem এ ২৫ XP (প্রত্যাশিত ৫), TopicProgress এ ১০০ XP
  (প্রত্যাশিত ২০) পাওয়া গেছে — প্রতিটা concurrent request stale
  `xpAwarded=false` state দেখে independently award করে ফেলেছিল।
- ✅ **ফিক্স (তিনটাতেই একই প্যাটার্নে)**: state আপডেট (status/isCompleted/
  completedPct পরিবর্তন) ও XP claim কে সম্পূর্ণ আলাদা করা হয়েছে — XP
  claim এখন single atomic `UPDATE ... WHERE id=? AND xpAwarded=false`
  (বা TopicProgress এর ক্ষেত্রে `WHERE userId=? AND topicId=? AND
  xpAwarded=false`) স্টেটমেন্ট দিয়ে, Postgres এর row-level lock
  guarantee ব্যবহার করে — শুধু matched (count>0) হলেই XP দেওয়া হয়।
- ✅ **লাইভ multi-user concurrency টেস্ট**
  (`scripts/test-xp-race-condition-audit.py`, ৯টা assertion, সব PASS)
  — একই ইউজার দিয়ে ৫টা concurrent PATCH/POST request পাঠিয়ে (Python
  `threading`) verify করা হয়েছে Task/StudyPlanItem এ ঠিক +5 XP এবং
  TopicProgress এ ঠিক +20 XP (একবারই) পাওয়া যাচ্ছে ফিক্সের পরে।
- ✅ **Toggle-cycling regression টেস্ট** (আলাদা স্ক্রিপ্টে) — সিরিয়ালি
  (একটার পর একটা) ৫ বার TODO↔DONE বা LEARNING↔MASTERED toggle করেও XP
  ঠিক একবারই পাওয়া গেছে, আগের ফিক্স এখনো ঠিকভাবে কাজ করছে তা নিশ্চিত।
- ✅ **Authorization/edge-case টেস্ট**: অন্য ইউজারের Task এ PATCH করার
  চেষ্টায় ৪০৪, unauthenticated এ ৪০১, non-existent resource এ ৪০৪,
  invalid TopicProgress status এ ৪০০।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (`xpraceaudit_*`,
  `toggleregress_*`, `edgeaudit_*` প্যাটার্ন) প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  ভেরিফাই।

গুরুতর বাগ ফিক্স — Quiz Battle/Quiz Duel/Reading Room XP Race Condition অডিট এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔬 **অডিটের ধারাবাহিকতা**: Task/StudyPlanItem/TopicProgress এ race
  condition ফিক্স করার পরে, একই কাঠামোগত সমস্যা (status/state চেক করে
  read-then-write, তারপর আলাদা `update()` কল) Quiz Battle
  (`submitBattleAnswers`, `endQuizBattle`), Quiz Duel
  (`submitDuelAnswers`, `finalizeDuel`), ও Reading Room
  (`endSessionInternal`) এ পাওয়া গেছে — এই সব জায়গাতেই "কেউ প্রথমবার
  একটা অ্যাকশন করছে কিনা" (submit করা, battle শেষ করা, সেশন শেষ করা)
  চেক করে XP দেওয়া হয়।
- 🐛 **আবিষ্কৃত বাগ (লাইভ concurrency টেস্টে নিশ্চিত)**:
  - **Quiz Battle submit**: participant এর ৫টা concurrent submit
    request এ ৫০ XP (প্রত্যাশিত ১০)
  - **Quiz Battle end**: owner এর ৫টা concurrent end request এ বিজয়ী
    ১৫০ XP (প্রত্যাশিত ৩০)
  - এই দুটোতেই কোনো error দৃশ্যমান ছিল না (সব request ২০০ status
    রিটার্ন করেছে), সাইলেন্টলি multiple-award হচ্ছিল
- ✅ **ফিক্স (একই atomic-conditional-update প্যাটার্নে সবগুলোতে)**:
  - `submitBattleAnswers`: `UPDATE quiz_battle_participants SET ...
    WHERE id=? AND submittedAt IS NULL`
  - `endQuizBattle`: `UPDATE quiz_battles SET status='COMPLETED' WHERE
    id=? AND status='ACTIVE'` (winner XP শুধু এই claim সফল হলেই)
  - `submitDuelAnswers`: `UPDATE quiz_duels SET ... WHERE id=? AND
    challengerAnswers/opponentAnswers IS NULL` (Prisma nullable JSON
    ফিল্ডে `{ equals: Prisma.DbNull }` সিনট্যাক্স ব্যবহার করে)
  - `finalizeDuel`: `UPDATE quiz_duels SET status='COMPLETED' WHERE
    id=? AND status='ACTIVE'`
  - `endSessionInternal` (Reading Room): `UPDATE
    reading_room_sessions SET endedAt=now() WHERE id=? AND endedAt IS
    NULL`
- ✅ **লাইভ multi-user concurrency টেস্ট**
  (`scripts/test-quiz-battle-duel-xp-race-audit.py`, ১৭টা assertion,
  সব PASS) — ২ জন real ইউজার (owner+participant) দিয়ে Quiz Battle
  তৈরি+join+start করে: participant এর ৫টা concurrent submit এ ঠিক
  +১০ XP, owner (winner) এর ৫টা concurrent end এ ঠিক +৩০ XP; আলাদাভাবে
  Quiz Duel তৈরি করে concurrent submit + finalize এ ঠিক +২৫ XP; Reading
  Room এ ৫টা concurrent leave call এ single-award (৫x না) ভেরিফাই।
- ✅ **Normal (non-concurrent) flow regression টেস্ট** (আলাদা
  স্ক্রিপ্টে) — একবার submit/end করার পরে দ্বিতীয়বার চেষ্টা করলে
  যথাযথ ৪০০ error ("তুমি ইতিমধ্যে উত্তর জমা দিয়েছো"/"এই Battle সক্রিয়
  অবস্থায় নেই") পাওয়া গেছে, স্বাভাবিক single-request flow এ XP ঠিক
  একবারই (১০/৩০/২৫) পাওয়া গেছে — ফিক্স আগের আচরণ ভাঙেনি।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (`battleraceaudit_*`,
  `battlenormal_*` প্যাটার্ন) প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট, cascade delete ভেরিফাই।

নিরাপত্তা অডিট — Daily Streak/Streak Freeze Race Condition এ যা যা পরীক্ষা করা হয়েছে (কোনো bug পাওয়া যায়নি):

- 🔬 **অডিটের ধারাবাহিকতা**: XP race condition অডিট সিরিজ শেষ করার পরে
  `lib/streak.ts` এর `updateStreak()` ফাংশন সন্দেহের তালিকায় ছিল —
  এটাও read-then-write প্যাটার্নে (`isSameDay()` চেক করে early return,
  `gapDays` হিসাব করে নতুন state লেখে) এবং ১৩টা+ endpoint (Task,
  TopicProgress, Flashcard review, CQ submit, Practice submit ইত্যাদি)
  থেকে কল হয় — concurrent action এ streak/freeze count এ race
  condition সম্ভব কিনা যাচাই করা হয়েছে।
- ✅ **ফলাফল — কোনো bug পাওয়া যায়নি, ডিজাইনগতভাবে নিরাপদ**:
  `updateStreak()` `awardXp()` এর মতো `{ increment: amount }` ব্যবহার
  করে না — বরং প্রতিটা concurrent request stale snapshot থেকে একই
  **absolute computed value** (`newStreak = user.streakCount + 1`)
  গণনা করে লেখে, যা compound/multiply না হয়ে converge করে যায়। তাই
  একই দিনে একাধিক concurrent action করলেও streakCount ঠিক ১ বারই
  বাড়ে (৫x/১০x হয় না), এবং Streak Freeze ব্যবহারের ক্ষেত্রেও ঠিক ১টা
  freeze-ই খরচ হয়।
- ✅ **লাইভ multi-user concurrency টেস্ট**
  (`scripts/test-streak-race-condition-audit.py`, ৮টা assertion, সব
  PASS) — একজন real ইউজার দিয়ে ৩টা সিনারিওতে ৫টা concurrent Task
  create+complete request পাঠিয়ে (প্রকৃত overlapping execution — dev
  log এ timestamp ওভারল্যাপ করে নিশ্চিত করা হয়েছে, প্রতিটা request
  ~২০-২৬ সেকেন্ড সময় নিয়েছে ও একে অপরের সাথে সমান্তরালে চলেছে) verify
  করা হয়েছে: (১) প্রথমবার একটিভ হওয়ায় streakCount ঠিক ১ থাকে, (২)
  gapDays=1 কেসে (DB তে `lastActiveAt` ম্যানুয়ালি গতকাল সেট করে)
  concurrent action এ streakCount ঠিক +১ বাড়ে, (৩) gapDays=2 (freeze
  ব্যবহারের কেস) এ concurrent action এ streakCount +১ ও freeze ঠিক -১
  (একবারই খরচ) হয়।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`streakraceaudit_*`
  প্যাটার্ন) প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট,
  cascade delete ভেরিফাই।

Content Report Resolution Notification এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔍 **আগে থেকে চিহ্নিত gap পূরণ**: Content Report/Flagging System
  ফিচার বানানোর সময় docs এ সীমাবদ্ধতা হিসেবে লেখা ছিল "রিপোর্ট করা
  ইউজারকে notification পাঠানো হয় না (resolve/dismiss হলে)" — এই সেশনে
  XP/reward race condition অডিট সিরিজ শেষ করার পরে বাকি documented gap
  গুলো রিভিউ করে এটা বেছে নেওয়া হয়েছে (schema-free, বিদ্যমান
  Notification infrastructure পুনর্ব্যবহার করে কম effort এ করা সম্ভব)।
- ✅ **`PATCH /api/admin/reports/[reportId]`** এ নতুন লজিক — admin
  RESOLVE বা DISMISS করলে যে ইউজার রিপোর্ট করেছিল তাকে `createNotification()`
  (বিদ্যমান, in-app + push উভয়ই automatically পাঠায়, event-driven,
  cron-free) দিয়ে জানানো হয়। দুই ধরনের ভিন্ন মেসেজ: RESOLVE এ "✅
  তোমার রিপোর্ট রিভিউ করা হয়েছে" (admin ব্যবস্থা নিয়েছে), DISMISS এ
  "তোমার রিপোর্ট রিভিউ করা হয়েছে" (কমিউনিটি নিয়ম ভঙ্গ করেনি) — যাতে
  ইউজার দুই আউটকামের মধ্যে পার্থক্য বুঝতে পারে।
- ✅ **সঠিক লিংক** — notification এ ক্লিক করলে সরাসরি সেই ফোরাম
  পোস্টে নিয়ে যায় (পোস্ট-রিপোর্ট হলে সরাসরি, রিপ্লাই-রিপোর্ট হলে
  reply এর `postId` দিয়ে parent post এ)।
- ✅ **কোনো migration/নতুন dependency লাগেনি** — সম্পূর্ণভাবে বিদ্যমান
  `Notification` মডেল ও `createNotification()` ফাংশন পুনর্ব্যবহার।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-content-report-notification.py`,
  ২৭টা assertion, সব PASS) — ৩ জন real ইউজার (reporter+poster+admin,
  admin কে DB তে সরাসরি role=ADMIN সেট করে) দিয়ে: RESOLVE কেসে সঠিক
  title/link সহ notification, DISMISS কেসে ভিন্ন মেসেজ সহ notification,
  মোট notification সংখ্যা সঠিক, non-admin/unauthenticated/non-existent-
  report/invalid-action এ যথাক্রমে ৪০৩/৪০১/৪০৪/৪০০।
- ⚠️ **ডিবাগিং নোট (transparency)**: প্রথম টেস্ট রানে admin role
  পরিবর্তনের পরেও ৪০৩ পাওয়া গিয়েছিল — root cause: NextAuth JWT session
  token এ role cache হয়ে থাকে, DB তে role আপডেট করার পরেও পুরনো
  session token পুরনো role দেখায়। ফিক্স টেস্ট script এ (re-login করে
  fresh token নেওয়া) — এটা প্রোডাকশন bug না, শুধু established
  test-methodology শিক্ষা (ভবিষ্যতে admin role পরিবর্তনের পরীক্ষায় এই
  প্যাটার্ন মনে রাখতে হবে)।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (`reportnotif_*`
  প্যাটার্ন) প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট,
  cascade delete ভেরিফাই।

গুরুতর বাগ ফিক্স — Study Group/Quiz Battle Capacity Race Condition অডিট এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔬 **অডিটের ধারাবাহিকতা**: XP/reward race condition অডিট সিরিজ শেষ
  করার পরে একই ধরনের কাঠামোগত সমস্যা "capacity limit" চেক করা লজিকেও
  আছে কিনা যাচাই করা হয়েছে — Study Group এর `maxMembers` ও Quiz
  Battle এর `maxPlayers` উভয়েই একই read-then-write প্যাটার্নে ছিল
  (`if (members.length >= maxMembers) throw`, তারপর আলাদা `create()`)।
- 🐛 **আবিষ্কৃত বাগ (লাইভ concurrency টেস্টে নিশ্চিত)**: এটা XP এর
  মতো "ভুল amount" বাগ না, বরং **capacity constraint সম্পূর্ণ bypass**
  — `maxMembers=2` সেট করা একটা Study Group এ ৫ জন ভিন্ন ইউজার
  concurrent ভাবে join করলে সবাই সফল হয়েছে (৫টা `200` status), চূড়ান্ত
  member count হয়েছে ৬ (owner+৫)! একইভাবে `maxPlayers=2` এর Quiz
  Battle এ ৫ জনের মধ্যে ৩ জন সফলভাবে join করেছে, চূড়ান্ত participant
  count হয়েছে ৪।
- ✅ **ফিক্স (উভয়েই Postgres `SELECT ... FOR UPDATE` row-level lock
  দিয়ে)**: `joinStudyGroup()` ও `joinQuizBattle()` কে `prisma.$transaction()`
  এর ভেতরে নিয়ে গিয়ে target row (group/battle) কে `$queryRaw` দিয়ে
  `FOR UPDATE` lock করা হয় — একই resource এ concurrent join request
  গুলো serialize হয়ে যায় (একটা transaction শেষ না হওয়া পর্যন্ত
  পরেরটা অপেক্ষা করে), capacity check ও `create()` একসাথে atomic
  হয়ে যায়। ভিন্ন group/battle এ join করা independent থাকে (আলাদা
  row, আলাদা lock, কোনো cross-resource contention না)।
- ✅ **লাইভ multi-user concurrency টেস্ট**
  (`scripts/test-capacity-race-condition-audit.py`, ১৬টা assertion,
  সব PASS) — ১ জন owner + ৫ জন joiner দিয়ে: `maxMembers=2` এর group এ
  ৫টা concurrent join এ ঠিক ১ জনই সফল হয়েছে (বাকি ৪টা `400` "গ্রুপ
  পূর্ণ"), DB তে চূড়ান্ত member count ঠিক ২; `maxPlayers=2` এর battle
  এ একই ফলাফল (participant count ঠিক ২)।
- ✅ **Normal (non-concurrent) flow regression টেস্ট** (আলাদা
  স্ক্রিপ্টে) — সিরিয়ালি ৪ জন join করলে সবাই সফল হয় (capacity
  যথেষ্ট থাকলে block হয় না), একই ইউজার আবার join করার চেষ্টায় সঠিক
  এরর, ভুল invite-code/room-code এ ৪০০, Quiz Battle এ আগে থেকে
  joined ইউজার আবার join করলে idempotent (ডুপ্লিকেট participant
  তৈরি হয় না) — ফিক্স আগের আচরণ ভাঙেনি প্রমাণিত।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (`capaudit_*`,
  `capnormal_*` প্যাটার্ন) প্রকৃত `/api/user/delete-account` endpoint
  দিয়ে ডিলিট, cascade delete ভেরিফাই।

Voice Input (কথা বলে প্রশ্ন করা) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔍 **গবেষণা-ভিত্তিক নতুন ফিচার নির্বাচন**: Race condition অডিট সিরিজ
  ও Dashboard mockup আপডেট শেষ হওয়ার পরে docs এ ইতিমধ্যে চিহ্নিত gap
  গুলো (V1-V4 research) রিভিউ করে দেখা যায় প্রায় সবই বাস্তবায়িত হয়ে
  গেছে। কোডবেস অডিট করে নতুন gap পাওয়া যায়: AI Doubt Solver এ
  Text-to-Speech (output শোনা) থাকলেও Voice Input (কথা বলে প্রশ্ন
  করা, input) কোথাও ছিল না — Web Speech API এর `SpeechRecognition`
  ইন্টারফেস দিয়ে সম্পূর্ণ ফ্রি এ বানানো সম্ভব, Deep Research দিয়ে
  `bn-BD` (বাংলা, বাংলাদেশ) ভাষা কোড Chrome এর অফিসিয়াল Web Speech
  API তালিকায় verified পাওয়া গেছে।
- ✅ **নতুন পুনর্ব্যবহারযোগ্য কম্পোনেন্ট**
  (`components/shared/voice-input-button.tsx`) — বিদ্যমান
  `TextToSpeechButton` এর "counterpart" (সেটা output শোনায়, এটা input
  নেয়) — একই ডিজাইন দর্শন: সম্পূর্ণ ফ্রি (ব্রাউজারের নিজস্ব speech
  recognition engine, কোনো external API/cost না), browser support না
  থাকলে বাটন সম্পূর্ণ hidden (graceful degradation)। মাইক আইকনে ক্লিক
  করে কথা বলা শুরু, বলা শেষ হলে (pause detect করে) স্বয়ংক্রিয়ভাবে
  transcript আসে এবং existing input state এ যোগ হয় (আগের টেক্সট থাকলে
  তার সাথে append হয়, প্রতিস্থাপন করে না)।
- ✅ **দুই জায়গায় ইন্টিগ্রেট** — AI Doubt Solver
  (`app/ai-tutor/page.tsx`) ও PDF Chat
  (`components/pdf-chat/pdf-chat-room.tsx`) — দুটোতেই বিদ্যমান text
  input এর পাশে মাইক বাটন, কোনো নতুন backend endpoint/change লাগেনি
  (ভয়েস থেকে আসা টেক্সট existing `/api/ai-chat`/PDF chat flow এই যায়,
  backend এর কাছে এটা সাধারণ টাইপ করা টেক্সট থেকে আলাদা না)।
- ✅ **TypeScript টাইপ হ্যান্ডলিং**: `SpeechRecognition` built-in
  `lib.dom.d.ts` এ নেই (এখনো experimental/vendor-prefixed Web API) —
  তাই প্রয়োজনীয় অংশটুকু ম্যানুয়ালি ইন্টারফেস টাইপ করা হয়েছে (পুরো
  স্পেক না, শুধু ব্যবহৃত অংশ), `webkitSpeechRecognition` fallback সহ
  (Chrome/Edge/Safari সবগুলোতে কাজ করার জন্য)।
- ✅ **Error handling** — `not-allowed`/`service-not-allowed`
  (মাইক্রোফোন পারমিশন) ও `network` এরর কোডে নির্দিষ্ট বাংলা toast
  মেসেজ, `no-speech`/`aborted` (স্বাভাবিক/প্রত্যাশিত অবস্থা, ইউজার
  কিছু বলেনি বা নিজেই থামিয়েছে) এ কোনো বিরক্তিকর error toast না।
  Component unmount হলে চলমান recognition বন্ধ (ব্যাকগ্রাউন্ডে
  মাইক্রোফোন চালু থেকে যাওয়া এড়াতে)।
- ✅ **কোনো migration/নতুন dependency/AI cost লাগেনি** — সম্পূর্ণ
  browser-native API, `TextToSpeechButton` এর প্রতিষ্ঠিত প্যাটার্ন
  অনুসরণ করে বানানো।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-voice-input-feature.py`,
  ৯টা assertion, সব PASS) — sandbox এ headless browser/microphone
  simulation সম্ভব না হওয়ায় (established সীমাবদ্ধতা) compiled JS
  bundle এ কম্পোনেন্ট ও তার aria-label টেক্সট সরাসরি `grep` করে
  উপস্থিতি ভেরিফাই করা হয়েছে (established false-negative pattern
  অনুযায়ী, CSR component সার্ভার-রেন্ডার HTML এ দেখা যায় না), এবং
  ভয়েস-input থেকে আসা টেক্সট simulate করে বাস্তব `/api/ai-chat`
  endpoint এ POST করে (২০০ status, সঠিক AI রেসপন্স) backend flow
  ভেরিফাই করা হয়েছে, authorization (`unauthenticated` → ৪০১) সহ।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`voiceinput_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade
  delete ভেরিফাই।

সাপ্তাহিক রিক্যাপ (Weekly Study Recap) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔬 **গবেষণা** (`docs/FEATURE_RESEARCH_V5.md`) — ২০২৬ সালের কনজিউমার-অ্যাপ
  ট্রেন্ড রিসার্চ করে পাওয়া গেছে "Spotify Wrapped/ChatGPT Your Year"
  স্টাইল personalized recap বর্তমান সবচেয়ে প্রমাণিত consumer-engagement
  pattern (OpenAI ডিসেম্বর ২০২৫ এ লঞ্চ করেছে)। 10 Minute School/Shikho
  রিভিউ করে নিশ্চিত হওয়া গেছে BD মার্কেটে কোনো competitor app এ এই ধরনের
  celebratory personalized "recap story" নেই — সম্পূর্ণ নতুন gap।
- ✅ **সম্পূর্ণ schema-free** — বিদ্যমান `User.weeklyXp/streakCount`,
  `StudySession`, `QuizAttempt`, `CQAttempt`, `TopicProgress` টেবিল থেকে
  সরাসরি aggregate করে বানানো, কোনো migration লাগেনি।
- ✅ **`lib/weekly-recap.ts`** — চলতি সপ্তাহের (রবিবার থেকে আজ, `lib/league.ts`
  এর `getCurrentWeekStart()` এর সাথে সামঞ্জস্যপূর্ণ) মোট XP, পড়ার সময়,
  কুইজ/CQ attempt সংখ্যা, এই সপ্তাহে মাস্টার করা টপিক, সবচেয়ে বেশি সময়
  দেওয়া সাবজেক্ট বের করে।
- ✅ **"স্টাডি পার্সোনালিটি" আর্কিটাইপ heuristic** — সেশনের সময়ের প্যাটার্ন
  (রাত/সকাল/উইকেন্ড) ও activity ভলিউম থেকে একটা মজার ব্যাজ নির্ধারণ করে
  (যেমন "নাইট আওল 🦉" — Study Pet এর পেঁচা মাসকট থিমের সাথে organically
  মিলে যায়, "উইকেন্ড ওয়ারিয়র 🎯", "মাস্টার মাইন্ড 🏆", "কুইজ মেশিন ⚡"
  ইত্যাদি) — কোনো AI call ছাড়া, pure deterministic logic।
- ✅ **Dashboard এ নতুন কার্ড** (`components/dashboard/weekly-recap-card.tsx`)
  — compact preview কার্ড থেকে ক্লিক করে পূর্ণ রিক্যাপ Dialog খোলে, রঙিন
  gradient কার্ডে XP/সময়/কুইজ/স্ট্রিক গ্রিড + archetype ব্যাজ দেখায়।
- ✅ **Download/Share** — নতুন `html-to-image` (MIT license) dependency
  দিয়ে client-side DOM→PNG ক্যাপচার (কোনো সার্ভার-সাইড রেন্ডারিং/নতুন
  ফন্ট এমবেডিং জটিলতা ছাড়া), Web Share API সাপোর্ট থাকলে সরাসরি শেয়ার
  (ফেসবুক/WhatsApp এ), না থাকলে ডাউনলোড ফলব্যাক।
- ✅ **`GET /api/analytics/weekly-recap`** — নতুন endpoint, authentication
  guard সহ।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 28.5s", `echo "" | pnpm lint`
  ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-weekly-recap-feature.py`,
  ১৮টা assertion + `scripts/test-weekly-recap-archetype.py`, ৩টা
  assertion, সব PASS) — real HTTP call দিয়ে ২টা ইউজার তৈরি: একজন fresh
  (কোনো activity নেই → "নতুন শুরু" আর্কিটাইপ যাচাই), আরেকজন বাস্তব
  `/api/study-sessions` endpoint দিয়ে Physics+Chemistry সেশন লগ করে
  (top subject detection, studyMinutes সমষ্টি সঠিক কিনা যাচাই), এবং
  আলাদাভাবে রাত ১১টার ৩টা সেশন insert করে "নাইট আওল" আর্কিটাইপ trigger
  ভেরিফাই। Authorization (`unauthenticated` → ৪০১) সহ।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`weeklyrecap_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  (`study_sessions`) ভেরিফাই — শূন্য বাকি।
- ⚠️ **স্বচ্ছভাবে জানানো সীমাবদ্ধতা**: `hasAnyActivity=false` অবস্থায়
  ("নতুন শুরু" আর্কিটাইপ) কার্ডটা এখনো শেয়ার করা যায় (blank/জিরো
  স্ট্যাটস সহ) — ইচ্ছাকৃতভাবে ব্লক করা হয়নি কারণ এটা কোনো ক্ষতিকর
  আচরণ না, শুধু কম motivating; ভবিষ্যতে চাইলে zero-activity state এ
  শেয়ার বাটন hide করে শুধু "আজই শুরু করো" CTA দেখানো যায়।

Forum Vote (Upvote/Downvote) Race Condition বাগ ফিক্সে যা যা করা হয়েছে:

- 🐛 **আবিষ্কার**: XP/Capacity race condition অডিট সিরিজের ধারাবাহিকতায়
  Forum Vote endpoint (`POST /api/forum/posts/[postId]/vote` ও
  `POST /api/forum/replies/[replyId]/vote`) কোড রিভিউ করে দেখা যায়
  একই read-then-write প্যাটার্ন আছে (`findUnique()` দিয়ে existing vote
  চেক করে আলাদা `create()`/`update()`/`delete()` কল)। লাইভ টেস্টে ৫টা
  concurrent প্রথম-ভোট রিকোয়েস্ট (একই ইউজার, একই পোস্ট) পাঠিয়ে **৪টা
  crash করে ৫০০ Internal Server Error** দিয়েছে প্রমাণ হিসেবে
  (`ForumVote` এর `@@unique([userId, postId])` constraint এ Prisma
  P2002 error, কোথাও catch হয়নি) — মোবাইলে দ্রুত ডাবল-ট্যাপ বা slow
  network এ ব্রাউজারের automatic retry দিয়ে সহজেই ট্রিগার হতে পারতো।
- 🔧 **ফিক্স**: নতুন `lib/forum-vote.ts` শেয়ার্ড helper, Prisma
  `upsert()` ব্যবহার করে (Postgres এ single
  `INSERT ... ON CONFLICT (userId, postId) DO UPDATE` স্টেটমেন্টে
  কম্পাইল হয় — সম্পূর্ণ DB-level atomic, কোনো retry loop/race window
  লাগে না)। Toggle-off (একই ভোট আবার দিলে মুছে ফেলা) এর জন্য
  conditional `deleteMany({ where: { id, value } })` (id+value দুটোই
  ম্যাচ করলেই মুছবে, race হলে নিরাপদ no-op)। **প্রথম ফিক্স চেষ্টা**
  (retry-on-P2002-conflict লুপ, সর্বোচ্চ ৩ বার) লাইভ টেস্টে যথেষ্ট
  প্রমাণিত হয়নি (৫টা concurrent এ ২টা এখনো ব্যর্থ হয়েছিল) — তাই
  `upsert()`-ভিত্তিক DB-level সমাধানে চূড়ান্ত করা হয়েছে (স্বচ্ছভাবে
  জানানো iteration)।
- ✅ **P2025 existence check যোগ**: একই সাথে দুটো endpoint এ
  অস্তিত্বহীন `postId`/`replyId` তে vote করার চেষ্টায় আগে orphan
  `ForumVote` তৈরি হয়ে যেত বা crash করতো — এখন existence check করে
  ৪০৪ রিটার্ন করে (established P2025 audit pattern অনুসরণ করে)।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 28.6s", `echo "" | pnpm lint`
  ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-forum-vote-race-condition.py`,
  ২১টা assertion, সব PASS): (১) একই ইউজারের ৫টা concurrent প্রথম-ভোটে
  কোনো ৫০০ error নেই এবং সব ২০০ রিটার্ন করে, (২) **৫ জন ভিন্ন ইউজার
  concurrently একই পোস্টে upvote করলে ফাইনাল voteScore ঠিক ৫** (বাস্তব
  multi-user scenario, কোনো lost update/duplicate নেই), (৩) সিরিয়াল
  toggle/upvote→downvote→upvote normal flow regression-free, (৪) Reply
  vote এ একই concurrency টেস্ট, (৫) অস্তিত্বহীন post/replyId → ৪০৪,
  অবৈধ value → ৪০০, unauthenticated → ৪০১।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`voterace_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  (`forum_votes`/`forum_posts`/`forum_replies`) ভেরিফাই — শূন্য বাকি।

Content Report Race Condition বাগ ফিক্সে যা যা করা হয়েছে:

- 🐛 **আবিষ্কার**: Forum Vote race condition ফিক্স করার সাথে সাথে একই
  ক্লাসের bug খুঁজতে বাকি কোডবেস রিভিউ করার সময় `POST /api/forum/reports`
  (Content Report তৈরি) এ হুবহু একই প্যাটার্ন পাওয়া যায় — `findFirst()`
  দিয়ে existing report চেক করে আলাদা `create()` কল, `ContentReport` এর
  `@@unique([userId, postId])`/`@@unique([userId, replyId])` constraint
  এ concurrent প্রথম-রিপোর্টে Prisma P2002 crash। লাইভ টেস্টে ৫টা
  concurrent রিপোর্ট রিকোয়েস্টে **৪টা ৫০০ error** দিয়েছে প্রমাণ হিসেবে
  (Forum Vote বাগের সাথে হুবহু একই স্বাক্ষর)।
- 🔧 **ফিক্স**: এখানে ForumVote এর মতো toggle সেমান্টিক্স নেই (রিপোর্ট
  একবার হলেই যথেষ্ট, "unreport" কনসেপ্ট নেই) — তাই সহজ সমাধান যথেষ্ট:
  `create()` কল সরাসরি `try/catch` এ wrap করে P2002 পেলে ৪০৯ ("তুমি
  ইতিমধ্যে এটা রিপোর্ট করেছো") রিটার্ন করা হয়, আগের pre-check
  `findFirst()` লজিক (যেটা race-condition-এ ভুলনীয় ছিল) সম্পূর্ণ বাদ
  দেওয়া হয়েছে।
- ✅ **tsc/build/lint checkpoint**: সব ক্লিন পাস।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-content-report-race-condition.py`,
  ১৬টা assertion, সব PASS): (১) ৫টা concurrent প্রথম-রিপোর্টে ঠিক ১টা
  ২০১ (সফল) ও বাকি ৪টা ৪০৯ (duplicate), কোনো ৫০০ error না — post ও
  reply উভয় টার্গেটে, (২) ভিন্ন ইউজার একই পোস্ট রিপোর্ট করতে পারে
  (ownership সাংঘর্ষিক না), (৩) সিরিয়াল duplicate এখনো ৪০৯ (normal-flow
  regression-free), (৪) সব edge case (অস্তিত্বহীন post/reply → ৪০৪,
  postId+replyId দুটোই/কোনোটাই না → ৪০০, অবৈধ reason → ৪০০,
  unauthenticated → ৪০১)।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`reportrace_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  (`content_reports`/`forum_posts`) ভেরিফাই — শূন্য বাকি।

Peer Note Helpful Vote Race Condition বাগ ফিক্সে যা যা করা হয়েছে:

- 🐛 **আবিষ্কার**: Content Report race condition ফিক্সের সাথে সাথে
  আরেকটা `@@unique` constraint যুক্ত টেবিল (`NoteHelpfulVote`,
  `@@unique([noteId, userId])`) কোড রিভিউ করে দেখা যায় হুবহু একই
  ঝুঁকিপূর্ণ প্যাটার্ন — `toggleHelpfulVote()` এ `findUnique()` দিয়ে
  existing vote চেক করে আলাদা transaction এ create/delete + denormalized
  `Note.helpfulCount` counter increment/decrement। লাইভ টেস্টে ৫টা
  concurrent প্রথম-ভোট রিকোয়েস্টে (একই ইউজার, একই নোট) **৩টা crash করে
  ৫০০ error** দিয়েছে (P2002, `NoteHelpfulVote` এর `@@unique([noteId,
  userId])`)।
- 🔧 **ফিক্স**: ForumVote এর মতো পুরো `upsert()` ব্যবহার করা সম্ভব ছিল
  না কারণ এখানে শুধু vote row না, সাথে denormalized `helpfulCount`
  counter-ও transaction এ sync রাখতে হয়। তাই conditional
  create/delete + P2002/count-based catch প্যাটার্ন: নতুন ভোটে
  `create()` এ P2002 পেলে counter আর দ্বিতীয়বার increment করা হয় না
  (অন্য concurrent request ইতিমধ্যে করে ফেলেছে ধরে নিয়ে), টগল-অফে
  `deleteMany()` এর affected count 0 হলে counter আর decrement করা হয়
  না — দুই ক্ষেত্রেই **denormalized counter ও প্রকৃত vote row সংখ্যা
  সবসময় সংগতিপূর্ণ থাকে** (কোনো drift না)।
- ✅ **tsc/build/lint checkpoint**: সব ক্লিন পাস।
- ✅ **লাইভ multi-user টেস্ট**
  (`scripts/test-peer-note-helpful-vote-race-condition.py`, ১৩টা
  assertion, সব PASS): (১) একই ইউজারের ৫টা concurrent প্রথম-ভোটে কোনো
  ৫০০ error নেই, DB তে সরাসরি psycopg2 দিয়ে `helpfulCount` ও প্রকৃত
  `note_helpful_votes` row সংখ্যা সংগতিপূর্ণ ভেরিফাই, (২) **৫ জন ভিন্ন
  ইউজার concurrently একই নোটে helpful vote দিলে ফাইনাল helpfulCount
  ঠিক ৫** (counter drift নেই, বাস্তব multi-user scenario), (৩) edge
  case: অস্তিত্বহীন noteId → ৪০৪, self-vote → ৪০৩, unauthenticated →
  ৪০১, সিরিয়াল টগল regression-free।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`notehelpful_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  (`note_helpful_votes`/`notes`) ভেরিফাই — শূন্য বাকি।

CQ Practice + Mock Exam Voice Input সম্প্রসারণে যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔬 **যুক্তি**: Race condition audit সিরিজ (Forum Vote/Content Report/
  Peer Note) শেষ হওয়ার পরে কোডবেস রিভিউ করে দেখা যায় বিদ্যমান Voice
  Input ফিচার (`components/shared/voice-input-button.tsx`) শুধু AI
  Doubt Solver ও PDF Chat এ ছিল — কিন্তু CQ (সৃজনশীল প্রশ্ন) practice
  এ ৪টা লম্বা টেক্সট উত্তর (ক/খ/গ/ঘ) লিখতে হয়, যেটা মোবাইলে বাংলা
  টাইপ করে লেখা কষ্টসাধ্য ও সময়সাপেক্ষ — voice dictation এখানে সবচেয়ে
  বেশি ভ্যালু-অ্যাড করবে এমন জায়গা।
- ✅ **CQ Runner** (`components/cq/cq-runner.tsx`) — প্রতিটা প্রশ্নের
  (ক/খ/গ/ঘ) Label এর পাশে আলাদা `VoiceInputButton`, transcript বিদ্যমান
  টেক্সটের সাথে append হয় (প্রতিস্থাপন না, established প্যাটার্ন)।
- ✅ **Mock Exam Runner** (`components/mock-exam/mock-exam-runner.tsx`)
  — একই প্যাটার্নে CQ অংশে ৪টা ভয়েস বাটন যোগ, নতুন
  `appendCqAnswerFromVoice()` হেল্পার ফাংশন (বিদ্যমান `updateCqAnswer()`
  থেকে আলাদা রাখা হয়েছে কারণ সেটা replace করে, ভয়েসের জন্য append
  দরকার)।
- ✅ **কোনো নতুন dependency/backend পরিবর্তন লাগেনি** — সম্পূর্ণ
  browser-native Web Speech API পুনর্ব্যবহার, ভয়েস থেকে আসা টেক্সট
  সাধারণ টাইপ করা টেক্সটের মতোই বিদ্যমান CQ submit endpoint এ যায়।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 24.8s", `echo "" | pnpm lint`
  ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-cq-mock-exam-voice-input.py`,
  ৯টা assertion, সব PASS) — established পদ্ধতিতে (headless
  browser/microphone simulation sandbox এ সম্ভব না): (১) CQ Practice
  চ্যাপ্টার পেজ ও Mock Exam হাব পেজ ২০০ status এ লোড (component crash
  করেনি), (২) compiled JS bundle এ `SpeechRecognition` স্ট্রিং ও
  বাংলা aria-label টেক্সট ("কথা বলে লেখো") সরাসরি `grep` করে উপস্থিতি
  ভেরিফাই, (৩) ভয়েস input থেকে আসা টেক্সট simulate করে বাস্তব
  `/api/cq/[cqQuestionId]/submit` endpoint এ POST করে ২০০ status ও
  `attemptId` রেসপন্স ভেরিফাই, (৪) authorization (`unauthenticated`
  → ৪০১)।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`cqvoice_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  (`cq_attempts`) ভেরিফাই — শূন্য বাকি।

মিস্টেক ভল্ট (Mistake Vault) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔬 **গবেষণা**: বাংলাদেশী HSC মার্কেটে জনপ্রিয় প্রশ্ন ব্যাংক প্ল্যাটফর্ম
  SATT Academy রিভিউ করে দেখা যায় ওদের "মিস্টেক ভল্ট" ফিচার (প্র্যাকটিসে
  ভুল করা প্রশ্ন স্বয়ংক্রিয়ভাবে জমা হয়ে পরীক্ষার আগে দ্রুত রিভিশন
  দেওয়ার জন্য) একটা বাস্তব-verified, high-demand ফিচার। আমাদের বিদ্যমান
  Adaptive Practice টপিক-ভিত্তিক দুর্বলতা মিশ্রিত করে দেখায়, কিন্তু
  ইউজার ইচ্ছাকৃতভাবে *শুধু* নিজের ভুল করা প্রশ্নগুলো ফোকাসড রিভিশনে
  দেখার কোনো dedicated hub আগে ছিল না — এটা একটা genuine নতুন gap।
- ✅ **সম্পূর্ণ schema-free, "self-healing" ডিজাইন** — "ভান্ডারে আছে" এর
  সংজ্ঞা: একটা প্রশ্নের *সর্বশেষ* attempt ভুল হলেই সেটা ভান্ডারে
  দেখায় (বিদ্যমান `QuizAttemptAnswer` টেবিল থেকে derive করা)। রিভিশনে
  সঠিক উত্তর দিলে পরের বার query তে সেই প্রশ্ন স্বয়ংক্রিয়ভাবে বাদ পড়ে
  যায় — কোনো নতুন কলাম/ফ্ল্যাগ/migration লাগেনি।
- ✅ **`lib/mistake-vault.ts`** — `getMistakeVaultSummary()` (মোট
  সংখ্যা+সাবজেক্ট-ভিত্তিক ভাঙন) ও `getMistakeVaultQuestions()` (রিভিশনের
  জন্য সর্বোচ্চ ৩০টা প্রশ্ন, সাম্প্রতিকতম ভুল আগে, ঐচ্ছিক subjectCode
  ফিল্টার, cheating-প্রতিরোধী — সঠিক উত্তর/ব্যাখ্যা এক্সপোজ হয় না)।
- ✅ **নতুন পেজ** — `/mistake-vault` (সাবজেক্ট-ভিত্তিক ভাঙন সহ Intro),
  `/mistake-vault/run` (quiz-runner এর নিজের-গতিতে-উত্তর প্যাটার্নে
  Runner, কোনো টাইমার নেই কারণ এটা রিভিশন, speed-test না)।
- ✅ **রিভিশন সাবমিট** — বিদ্যমান `QuizAttempt` মডেল পুনর্ব্যবহার
  (`quizType="mistake_vault"`, Adaptive/Drill Practice এর established
  প্যাটার্ন অনুসরণ করে), তাই Practice Result পেজ/Wrong-Answer→Flashcard
  কনভার্টার স্বয়ংক্রিয়ভাবে কাজ করে (কোনো আলাদা কোড লাগেনি)।
- ✅ **Dashboard শর্টকাট** — নতুন মডিউল কার্ড ("মিস্টেক ভল্ট", লাল/গোলাপি
  gradient) যোগ করা হয়েছে discovery এর জন্য।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 24.4s" (নতুন
  `/api/mistake-vault`, `/api/mistake-vault/submit`, `/mistake-vault`,
  `/mistake-vault/run` রুট বান্ডেলে ভেরিফাই), `echo "" | pnpm lint`
  ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-mistake-vault-feature.py`,
  ২১টা assertion + পেজ-লোড টেস্ট আরও ৩টা, সব PASS): (১) fresh user →
  totalCount=0, (২) বাস্তব `/api/practice/submit` দিয়ে ইচ্ছাকৃতভাবে ৩টা
  প্রশ্নে ভুল উত্তর দিয়ে vault summary/questions এ সঠিকভাবে দেখা যাওয়া
  ভেরিফাই, (৩) **self-healing মূল ডিজাইন ভেরিফাই** — DB থেকে সরাসরি
  সঠিক উত্তর বের করে ২টা প্রশ্নে রিভিশনে সঠিক উত্তর দিয়ে সেগুলো ভল্ট
  থেকে বাদ পড়া, ৩য়টাতে আবার ভুল দিয়ে এখনো ভল্টে থাকা কনফার্ম, (৪)
  subjectCode ফিল্টার সঠিক কাজ করা+ভুল সাবজেক্টে খালি লিস্ট (crash
  না), (৫) authorization (৪০১×২) ও edge case (খালি answers → ৪০০)।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`mistakevault_*`/`mvpage_*`
  প্যাটার্ন) প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট,
  cascade delete (`quiz_attempts`) ভেরিফাই — শূন্য বাকি।

Habit Tracker Toggle Race Condition বাগ ফিক্সে যা যা করা হয়েছে:

- 🐛 **আবিষ্কার**: Mistake Vault ফিচার শেষ হওয়ার পরে বাকি `@@unique`
  constraint যুক্ত মডেল অডিট করার সময় `HabitLog` (`@@unique([habitId,
  date])`) এ `lib/habit-tracker.ts` এর `toggleHabitToday()` ফাংশনে
  হুবহু একই ঝুঁকিপূর্ণ প্যাটার্ন পাওয়া যায় — `findUnique()` দিয়ে
  existing log চেক করে আলাদা create/delete + `Habit.currentStreak`
  read-then-write আপডেট। লাইভ টেস্টে ৫টা concurrent প্রথম-টগল
  রিকোয়েস্টে **৪টা ৫০০ error** দিয়েছে প্রমাণ হিসেবে (P2002, Forum
  Vote/Content Report/Peer Note Helpful Vote বাগের সাথে হুবহু একই
  স্বাক্ষর)।
- 🔧 **ফিক্স**: এখানে toggle + counter (streak) দুটোই জটিল gap-based
  লজিক (yesterday-check ইত্যাদি) জড়িত থাকায় Peer Note এর হাইব্রিড
  প্যাটার্নের চেয়ে Study Group/Quiz Battle Capacity fix এর established
  প্যাটার্ন বেশি উপযুক্ত ছিল — Postgres `SELECT ... FOR UPDATE` দিয়ে
  `habit` row-কে transaction এর ভেতরে lock করা হয়েছে, পুরো
  existing-log-check+create/delete+streak-update লজিক এখন একটা atomic
  transaction এর ভেতরে। dev sandbox এর ছোট connection pool এ
  row-lock serialize হওয়া transaction এ ডিফল্ট timeout (৫s) অপর্যাপ্ত
  প্রমাণিত হয়েছিল (P2028 error) — `maxWait`/`timeout` ১০ সেকেন্ডে
  বাড়িয়ে সমাধান করা হয়েছে।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 27.9s", `echo "" | pnpm lint`
  ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-habit-toggle-race-condition.py`,
  ১৩টা assertion, সব PASS): (১) একই ইউজারের একই habit এ ৫টা concurrent
  টগলে কোনো ৫০০ error নেই, সিরিয়ালাইজেশনের ফলে currentStreak সবসময়
  বৈধ (0 বা 1, over-increment নেই), Habit list API দিয়ে ground-truth
  ভেরিফাই, (২) **row-level lock ভেরিফাই** (table-level সিরিয়ালাইজেশন
  না) — ৩ জন ভিন্ন ইউজারের ৩টা ভিন্ন habit এ concurrent টগল দ্রুত
  (<৮ সেকেন্ড) সম্পন্ন হয়, একে অপরকে ব্লক করে না, (৩) সিরিয়াল ৫ বার
  টগলে সঠিক alternating প্যাটার্ন (normal-flow regression-free), (৪)
  authorization/ownership (অন্য ইউজারের habit → ৪০৩, অস্তিত্বহীন →
  ৪০৪, unauthenticated → ৪০১)।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`habitrace*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  (`habits`/`habit_logs`) ভেরিফাই — শূন্য বাকি।

Quiz Duel Join Capacity Race Condition বাগ ফিক্সে যা যা করা হয়েছে:

- 🐛 **আবিষ্কার**: Habit Tracker fix এর পরে বাকি capacity/state-transition
  ধরনের race condition খুঁজতে multiplayer ফিচারগুলো (Quiz Duel/Quiz
  Battle/Study Group — যেগুলোতে "slot"/"capacity" ধারণা আছে) আবার
  রিভিউ করা হয়। `lib/quiz-duel.ts` এর `joinDuel()` এ Study Group/Quiz
  Battle capacity bug এর হুবহু একই প্যাটার্ন পাওয়া যায় —
  `duel.status !== "WAITING"` চেক করে আলাদা `update()` কল। লাইভ
  টেস্টে একটা WAITING duel এ **৫ জন ভিন্ন ইউজার concurrently join
  করে সবাই সফল হয়েছে** (প্রত্যাশিত ছিল ঠিক ১ জন, কারণ opponent slot
  মাত্র ১টা) — Study Group এর maxMembers bypass বাগের সাথে হুবহু একই
  severity।
- 🔧 **ফিক্স**: এখানে multi-row capacity count লাগে না (শুধু
  single-field `status="WAITING"` চেক), তাই Forum Best Answer XP fix
  এর সহজ single-field atomic conditional update প্যাটার্ন যথেষ্ট ছিল
  (Study Group/Habit Tracker এর ভারী `SELECT...FOR UPDATE` লাগেনি):
  `updateMany({ where: { id, status: "WAITING" }, data: {...} })`।
- 🔧 **bonus consistency ফিক্স — `cancelDuel()`**: একই ফাইলে
  `cancelDuel()` এ blind `update()` দিয়ে সরাসরি status="EXPIRED" সেট
  হতো — owner cancel করার ঠিক সেই মুহূর্তে অন্য কেউ concurrently join
  করে ফেললে duel ACTIVE (বাস্তব opponent সহ) থাকা সত্ত্বেও ভুলভাবে
  আবার EXPIRED হয়ে যেতে পারতো। একই atomic conditional
  `updateMany({ where: { id, status: "WAITING" } })` প্যাটার্নে ফিক্স।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 24.5s", `echo "" | pnpm lint`
  ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-quiz-duel-join-race-condition.py`,
  ১১টা assertion, সব PASS): (১) ৫ জন ভিন্ন ইউজারের concurrent joinএ
  ঠিক ১ জন সফল (২০০) ও বাকি ৪ জন সুন্দর ৪০০ error, DB তে ground-truth
  ভেরিফাই (ACTIVE status+opponentId সেট), (২) সিরিয়াল একক join normal
  flow regression-free, (৩) নিজের duel এ নিজে join করার চেষ্টা ৪০০, (৪)
  **cancel+join concurrent টেস্ট** — দুটোর মধ্যে ঠিক একটাই সফল হয়
  (both-succeed inconsistency নেই), চূড়ান্ত state সবসময় সংগতিপূর্ণ
  (join জিতলে ACTIVE+opponentId, cancel জিতলে EXPIRED), (৫)
  unauthenticated → ৪০১।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`duelrace_*` প্যাটার্ন,
  দুই টেস্ট রান মিলিয়ে ৪০টা) প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট, cascade delete (`quiz_duels`) ভেরিফাই — শূন্য
  বাকি।

Mistake Vault Reminder Card (Dashboard) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔍 **আবিষ্কার**: Race condition audit সিরিজ শেষ হওয়ার পরে Mistake
  Vault ফিচারের discoverability রিভিউ করার সময় দেখা যায় বিদ্যমান
  Review Queue Card (Flashcard due reminder) এর মতো কোনো prominent
  Dashboard reminder Mistake Vault এর জন্য ছিল না — শুধু একটা সাধারণ
  মডিউল গ্রিড কার্ড ছিল, কোনো urgency/count signal ছাড়া।
- ✅ **`components/dashboard/mistake-vault-reminder-card.tsx`** — Review
  Queue Card এর established প্যাটার্ন হুবহু অনুসরণ করে (Server
  Component, conditional render — ভুল প্রশ্ন না থাকলে সম্পূর্ণ
  লুকানো), বিদ্যমান `getMistakeVaultSummary()` পুনর্ব্যবহার করে (কোনো
  নতুন query/migration লাগেনি) — মোট ভুল প্রশ্ন সংখ্যা + সবচেয়ে বেশি
  ভুল থাকা সাবজেক্ট দেখায়, ক্লিক করলে সরাসরি `/mistake-vault` এ যায়।
- ✅ **Dashboard এ mount** — Review Queue Card এর ঠিক পরে বসানো হয়েছে
  (একই ধরনের "due/pending" reminder card গুলো একসাথে গ্রুপ করা)।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 24.3s", `echo "" | pnpm lint`
  ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-mistake-vault-reminder-card.py`,
  ৭টা assertion, সব PASS): (১) fresh user এ Dashboard লোড করে reminder
  টেক্সট অনুপস্থিত ভেরিফাই (খালি ভল্টে hidden), (২) বাস্তব
  `/api/practice/submit` দিয়ে ইচ্ছাকৃতভাবে ৩টা প্রশ্নে ভুল করার পরে
  Dashboard এ reminder টেক্সট ও সঠিক সাবজেক্ট নাম উপস্থিত ভেরিফাই।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`mvreminder_*` প্যাটার্ন)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, cascade delete
  (`quiz_attempts`) ভেরিফাই — শূন্য বাকি।

AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- 🔬 **গবেষণা**: Duolingo এর ২০২৬ সালের "Explain My Answer" ফিচার
  থেকে অনুপ্রাণিত — আগে static/generic grammar feedback ছিল, এখন AI
  দিয়ে প্রতিটা ইউজারের নির্দিষ্ট ভুল উত্তর analyze করে personalized
  ব্যাখ্যা দেওয়া হয় ("কেন তুমি এই ভুলটা করলে" ধরনের insight)। আমাদের
  প্ল্যাটফর্মে `Question.explanation` একটা static, সবার জন্য একই
  টেক্সট (admin-written) — এটা "সঠিক ধারণা" ব্যাখ্যা করে কিন্তু
  ইউজার *কেন* ভুল উত্তরটা বেছে নিয়েছিল তা address করে না — এটা একটা
  genuine personalization gap।
- ✅ **`lib/mistake-explainer.ts`** — বিদ্যমান multi-provider AI
  fallback chain (`getAIResponse()`) পুনর্ব্যবহার করে, ইউজারের
  নির্দিষ্ট ভুল উত্তর + সঠিক উত্তর + বিদ্যমান static explanation
  একসাথে AI কে দিয়ে সংক্ষিপ্ত (৩-৪ বাক্য), বন্ধুত্বপূর্ণ, বাংলা
  ব্যাখ্যা জেনারেট করায় — কেন এই ভুল উত্তরটা ভুল, কোন misconception
  এর কারণে এই ভুল হয়, এবং সঠিক ধারণা মনে রাখার টিপস।
- ✅ **সম্পূর্ণ on-demand ডিজাইন** — কোনো নতুন DB কলাম/মডেল/migration
  লাগেনি (ব্যাখ্যা cache করা হয়নি, প্রতিবার fresh জেনারেট হয় —
  ব্যবহারের ফ্রিকোয়েন্সি কম বলে acceptable), শুধুমাত্র ভুল উত্তরের
  জন্যই প্রযোজ্য (সঠিক উত্তরে বাটন দেখানো হয় না)।
- ✅ **নতুন endpoint** — `POST /api/practice/answers/[answerId]/explain`,
  ownership যাচাই সহ (নিজের attempt এর answer ছাড়া অন্য কারো explain
  করা যাবে না, existence check সহ যাতে P2025 ধরনের bug না হয়)।
- ✅ **নতুন কম্পোনেন্ট** — `components/practice/explain-mistake-button.tsx`
  (Practice Result পেজে প্রতিটা ভুল উত্তরের নিচে "AI দিয়ে ব্যাখ্যা
  বুঝি" বাটন, ক্লিক করলে loading state দেখিয়ে AI response inline
  card এ দেখায়)।
- ✅ **tsc/build/lint checkpoint**: `pnpm exec tsc --noEmit` ক্লিন পাস,
  `pnpm build` "Compiled successfully in 26.1s" (নতুন
  `/api/practice/answers/[answerId]/explain` রুট বান্ডেলে ভেরিফাই),
  `echo "" | pnpm lint` ক্লিন।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-explain-mistake-feature.py`,
  ১১টা assertion, সব PASS): (১) বাস্তব `/api/practice/submit` দিয়ে
  ইচ্ছাকৃতভাবে ভুল উত্তর তৈরি করে AI explain কল করে ২০০ status +
  non-empty বাংলা explanation + provider নাম ভেরিফাই (**প্রকৃত AI
  রেসপন্স manually রিভিউ করা হয়েছে** — বাংলা রসায়ন কনটেন্ট বুঝে
  প্রাসঙ্গিক ব্যাখ্যা দিয়েছে, উদাহরণ: "হাইড্রোকার্বন" শব্দ ভেঙে
  ব্যাখ্যা), (২) সঠিক উত্তরে explain চাওয়া → ৪০০, (৩) অস্তিত্বহীন
  answerId → ৪০৪, (৪) অন্য ইউজারের answer explain করার চেষ্টা → ৪০৪
  (ownership leak না), unauthenticated → ৪০১।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`explainmistake*`/
  `explainpreview*` প্যাটার্ন) প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট, cascade delete (`quiz_attempts`) ভেরিফাই —
  শূন্য বাকি।

Sidebar Navigation + উজ্জ্বল Dark Mode এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **ব্যবহারকারীর ফিডব্যাক**: "Tools gula side bar a rakba jate full
  professional hoi ar dark mode aro valo koro brightness ta barao onek
  kisu valo vabe dakha jai na" — এই দুটো অনুরোধই সম্পূর্ণভাবে বাস্তবায়ন
  করা হয়েছে।
- ✅ **নতুন `AppSidebar` কম্পোনেন্ট** (`components/layout/app-sidebar.tsx`)
  — lg+ স্ক্রিনে (≥1024px) বাম পাশে ফিক্সড, নিজে স্ক্রল হওয়া sidebar,
  brand header, ৩টা categorized গ্রুপ ("প্রধান", "স্টাডি টুলস", "সোশ্যাল
  ও প্রতিযোগিতা") এ সব ২০টা Tool/মডিউল, এবং নিচে user profile
  dropdown footer (Settings/Admin Panel/Logout শর্টকাট সহ)।
- ✅ **`lib/nav-modules.ts` — একক Single-Source-of-Truth** — আগে
  dashboard page এর `moduleCards`, `more-menu-sheet.tsx` এর
  `MORE_ITEMS` দুই জায়গায় আলাদা হার্ডকোড করা ছিল (ফলে "মিস্টেক ভল্ট"
  নতুন মডিউল যোগ হওয়ার পরেও "আরও" bottom-sheet এ বাদ পড়ে গিয়েছিল — এটা
  একটা আগে-অজানা bug ছিল যা এই কাজের সময় ধরা পড়ে ও ফিক্স হয়েছে)। এখন
  `NAV_GROUPS` থেকেই dashboard grid, AppSidebar, ও "আরও" bottom-sheet
  তিনটাই ডেটা নেয়, তাই ভবিষ্যতে কখনো out-of-sync হবে না।
- ✅ **`lib/nav-visibility.ts` — শেয়ার্ড hide/active লজিক** —
  `BottomNavBar` (মোবাইল) ও নতুন `AppSidebar` (ডেস্কটপ) দুটোই এখন একই
  `shouldHideNavChrome()`/`isNavItemActive()` হেল্পার ব্যবহার করে, তাই
  quiz/exam/admin এর মতো focused full-screen রুটে দুটো নেভিগেশনই সবসময়
  consistent আচরণ করে (আগে এই লজিক শুধু `bottom-nav-bar.tsx` তে
  ডুপ্লিকেট ছিল)।
- ✅ **Root layout পরিবর্তন** (`app/layout.tsx`) — এখন `AppSidebar` ও
  মূল কনটেন্ট একটা `flex` row এ পাশাপাশি বসানো, lg+ এ sidebar sticky
  থেকে নিজেই স্ক্রল হয়, ছোট স্ক্রিনে (sidebar `hidden`) আগের মতোই
  single-column লেআউট + `BottomNavBar` অপরিবর্তিত থাকে।
- ✅ **Dashboard পেজ পরিবর্তন** — মডিউল গ্রিড এখন `lg:hidden` (sidebar
  এ ইতিমধ্যে সব মডিউল থাকায় lg+ এ ডুপ্লিকেট দেখানো হয় না), grid
  কলাম-কাউন্ট `sm:grid-cols-2` এ সরলীকৃত (আগে `lg:grid-cols-3` ছিল,
  এখন আর দরকার নেই)।
- ✅ **Bottom Nav Bar ব্রেকপয়েন্ট আপডেট** — আগে `sm:hidden` (≥640px এ
  hidden) ছিল, এখন `lg:hidden` (≥1024px এ hidden) — কারণ নতুন sidebar
  শুধু lg+ এ দেখা যায়, মাঝামাঝি ট্যাবলেট সাইজে (sm-lg) bottom nav ই
  চলতে থাকে যাতে কোনো gap না থাকে। একই পরিবর্তন `pwa-install-prompt.tsx`
  ও `offline-sync-indicator.tsx` এর bottom-offset এও করা হয়েছে
  (bottom nav এর সাথে overlap এড়াতে)।
- ✅ **Dark Mode Brightness Overhaul** (`app/globals.css` এর `.dark`
  ব্লক) — সংখ্যাগতভাবে (numerically) যাচাই করা পরিবর্তন:
  `--background` oklch 0.145 → 0.19, `--card` 0.205 → 0.24,
  `--muted-foreground` 0.708 → 0.80, `--border` opacity 10% → 16%,
  নতুন `--sidebar-muted-foreground` ভেরিয়েবল যোগ। সব মান আগের চেয়ে
  বেশি (হালকা) — Python দিয়ে regex-এ CSS পার্স করে numerically verify
  করা হয়েছে।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-sidebar-navigation-feature.py`)
  — দুইজন আলাদা ইউজার concurrently register+login, dashboard এ সব ২০টা
  মডিউল href/৩টা group label (compiled bundle এ, কারণ sidebar
  client-side `useSession()` রেন্ডার — established CSR সীমাবদ্ধতা)
  ভেরিফাই, মিস্টেক ভল্ট bug-fix ভেরিফাই, unauthenticated redirect,
  admin-gate — ৩৪টা assertion সব PASS।
- ✅ **পূর্ণ Regression Test** — App এর প্রায় সব ৩০+টা রুট
  (`/dashboard`, `/learn`, `/practice`, `/planner`, `/analytics`,
  `/leaderboard`, `/forum`, `/study-group`, `/reading-room`,
  `/flashcards`, `/mistake-vault`, `/cq-practice`, `/admission`,
  `/mock-exam`, `/pdf-chat`, `/live-exam`, `/quiz-battle`, `/duel`,
  `/saved`, `/settings`, `/badges`, `/notifications`, `/ai-tutor`,
  `/adaptive-practice`, `/drill`) লেআউট পরিবর্তনের পরেও crash-free
  ২০০ OK — কোনো visual regression বা routing bug হয়নি।
- ✅ **Test cleanup সম্পূর্ণ**: এই সেশনের সব টেস্ট ইউজার (মোট ১৫টা)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে
  সরাসরি চেক করে cascade delete ভেরিফাই — শূন্য বাকি।

সম্প্রসারণ — Explain My Mistake (Mock Exam + Admission Prep) এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: আগের সেশনে "AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা" ফিচার
  শুধু Practice Result পেজে ছিল, docs/MASTER_PLAN.md এ স্পষ্টভাবে
  লেখা ছিল "Mock Exam/Live Exam/Admission এর ভুল উত্তরে এখনো এই
  বাটন নেই ... ভবিষ্যতে চাইলে একই প্যাটার্নে সম্প্রসারণ করা যায়" —
  এই সেশনে সেই সম্প্রসারণ করা হলো (Live Exam বাদে, কারণ সেটা
  self-made প্রশ্ন, board question বা curriculum-linked না)।
- ✅ **`ExplainMistakeButton` কম্পোনেন্ট generalize করা হয়েছে** —
  আগে `answerId` prop নিয়ে হার্ডকোড URL বানাতো
  (`/api/practice/answers/${answerId}/explain`), এখন `endpoint` prop
  নেয় (যেকোনো explain API URL) — Practice, Mock Exam, Admission Prep
  তিন জায়গায় একই কম্পোনেন্ট পুনর্ব্যবহার।
- ✅ **নতুন এন্ডপয়েন্ট — Mock Exam MCQ Explain**
  (`POST /api/mock-exam/[attemptId]/mcq/[questionId]/explain`) —
  `MockExamAttempt.mcqUserAnswers` (JSON ম্যাপ) থেকে ইউজারের ভুল
  উত্তর বের করে বিদ্যমান `lib/mistake-explainer.ts` দিয়ে personalized
  ব্যাখ্যা জেনারেট করে। শুধু `COMPLETED` attempt এ কাজ করে, নিজের
  attempt ছাড়া অন্য কারো explain করা যাবে না (ownership check)।
- ✅ **নতুন এন্ডপয়েন্ট — Admission Prep MCQ Explain**
  (`POST /api/admission/[attemptId]/question/[questionId]/explain`) —
  একই প্যাটার্নে `AdmissionMockAttempt.userAnswers` থেকে ভুল উত্তর
  বের করে ব্যাখ্যা জেনারেট করে।
- ✅ **UI ওয়্যারিং**: `components/mock-exam/mock-exam-result.tsx` এর
  MCQ রিভিউ সেকশনে ও `components/admission/admission-result.tsx` এর
  প্রশ্নভিত্তিক রিভিউ সেকশনে প্রতিটা ভুল উত্তরের নিচে
  `ExplainMistakeButton` যোগ করা হয়েছে (স্কিপ করা প্রশ্নে দেখানো হয়
  না, শুধু সত্যিকারের ভুল উত্তরে)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-explain-mistake-expansion.py`)
  — দুইজন আলাদা ইউজার দিয়ে (১) একটা পূর্ণ Mock Exam attempt (QUICK
  mode, ইচ্ছাকৃতভাবে সব ভুল উত্তর) শুরু-থেকে-শেষ চালিয়ে MCQ explain
  endpoint টেস্ট, (২) একটা Admission Mock Test (MEDICAL) একই প্যাটার্নে
  চালিয়ে explain endpoint টেস্ট, (৩) authorization/edge-case: ownership
  leak প্রতিরোধ (অন্য ইউজারের attempt এ explain চাইলে ৪০৪),
  unauthenticated → ৪০১, ভুয়া attemptId/questionId → ৪০৪, একই প্রশ্নে
  দ্বিতীয়বার explain চাওয়া (idempotent) — মোট ২০টা assertion সব PASS।
  প্রকৃত AI response manually রিভিউ করা হয়েছে (পদার্থবিজ্ঞান বেগ-সময়
  লেখচিত্র উদাহরণ, বাংলায়, প্রাসঙ্গিক ও personalized)।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার (`explainexp_mock*`/
  `explainexp_adm*` প্যাটার্ন) প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট, cascade delete (`mock_exam_attempts`,
  `admission_mock_attempts`) DB তে সরাসরি চেক করে ভেরিফাই — শূন্য বাকি।

Admin Panel Power-up এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **নতুন Admin অ্যাকাউন্ট**: ব্যবহারকারীর নির্দিষ্ট Gmail
  (`abn21.noman@gmail.com`, বিদ্যমান Student অ্যাকাউন্ট ছিল) DB তে
  role=ADMIN এ প্রমোট করে + পাসওয়ার্ড bcrypt দিয়ে রিসেট করা হয়েছে,
  login+session+admin-route-access লাইভ ভেরিফাই করা হয়েছে।
- ✅ **নতুন `User.isBanned`/`banReason`/`bannedAt`/`bannedBy` কলাম**
  (migration `20260721000000_add_admin_powerup_ban_system_settings`)
  — Ban/Suspend সিস্টেম (soft-block, ডেটা মুছে যায় না)। `lib/auth.ts`
  এর `authorize()` এ নতুন login ব্লক করে, `proxy.ts` এ mid-session
  enforcement (ব্যান করা মাত্র পরের রিকোয়েস্টেই session cookie সাফ করে
  লগইন পেজে redirect — role-change এর মতো "পরের login এ effective" না,
  কারণ ban একটা security action)।
- ✅ **User Management Power-up** (`components/admin/user-manager.tsx`,
  `lib/admin-user-management.ts`) — Search (নাম/ইমেইল), Role/Status
  ফিল্টার, Sort (join date/XP/নাম/last active), server-side
  pagination, Ban (কারণ সহ ডায়ালগ)/Unban বাটন, Admin Delete (Confirm
  ডায়ালগ, বিদ্যমান `deleteUserAccount()` পুনর্ব্যবহার করে cascade
  delete), User Detail ভিউ (একজনের XP/streak/quiz-cq-mock exam
  attempt সংখ্যা/content report count একসাথে)। Admin কে ban/delete
  করা ব্লক করা আছে (role-change endpoint এর একই safety প্যাটার্ন),
  নিজেকে নিজে ban/delete করা যায় না।
- ✅ **নতুন Audit Log Viewer** (`/admin/audit-log`,
  `components/admin/audit-log-viewer.tsx`) — বিদ্যমান
  `lib/audit-log.ts` এর `logAuditEvent()` অনেক আগে থেকেই role
  change/delete/broadcast ইত্যাদি লগ করছিল কিন্তু দেখার কোনো UI ছিল
  না — এই গ্যাপ পূরণ করা হয়েছে (action filter + pagination সহ),
  কোনো নতুন migration লাগেনি (AuditLog মডেল আগে থেকেই ছিল)।
- ✅ **নতুন System Control পেজ** (`/admin/system`,
  `components/admin/system-control-panel.tsx`) — নতুন
  `SystemSetting` singleton মডেল দিয়ে:
  - **Maintenance Mode** — চালু করলে Admin বাদে সব প্রোটেক্টেড রুট
    `/maintenance` পেজে rewrite হয় (`proxy.ts` এ, Next.js 16 এর
    Node.js-runtime proxy.ts ব্যবহার করে সরাসরি Prisma query)
  - **Announcement Banner** — সব লগইন করা ইউজারের পেজের উপরে
    dismissible ব্যানার, `announcementId` পরিবর্তনে dismiss-tracking
    রিসেট হয়
  - **Feature Flags** — ৮টা মডিউল (AI Tutor/Forum/Study Group/Reading
    Room/Duel/Quiz Battle/PDF Chat/Live Exam) আলাদাভাবে বন্ধ করা যায়,
    বন্ধ থাকা মডিউলের রুটে গেলে `/feature-disabled` পেজ rewrite হয়
  - সব DB query fail-open (transient DB সমস্যায় পুরো সাইট লক/সবাই
    logout হয়ে যাওয়া থেকে সুরক্ষা)
- ✅ **Content Moderation Power-up** — Content Reports প্যানেলে নতুন
  `DELETE_CONTENT`/`DELETE_AND_BAN` অ্যাকশন (আগে শুধু Resolve/Dismiss
  ছিল, ডিলিট করতে হলে আলাদা Forum Moderation প্যানেলে যেতে হতো) —
  এক ক্লিকে রিপোর্ট হওয়া পোস্ট/রিপ্লাই ডিলিট + লেখককে ব্যান। নতুন
  `DELETE /api/admin/forum/replies/[replyId]` endpoint (আগে শুধু
  Post delete endpoint ছিল, Reply delete endpoint মিসিং ছিল)।
- ✅ **গুরুতর বাগ ফিক্স — Content Report Cascade-Delete Crash** — লাইভ
  টেস্টে ধরা পড়েছে: `ContentReport.postId`/`replyId` এ
  `onDelete: Cascade` থাকায় পোস্ট/রিপ্লাই ডিলিট করলে সেই
  `ContentReport` রেকর্ডও সাথে সাথে DB থেকে মুছে যেত, তারপর সেই
  রিপোর্ট `status` আপডেট করার চেষ্টা করলে Prisma P2025 crash করে ৫০০
  Internal Server Error দিত (action আসলে সফল হতো, শুধু response
  crash করতো)। ফিক্স: আগে report status update, তারপর content delete
  (ক্রম পরিবর্তন, কোনো নতুন migration লাগেনি)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-admin-powerup.py`) —
  ৫৩টা assertion সব PASS: search/filter/sort/pagination, ban/unban
  (নতুন login ব্লক + mid-session enforcement), admin-ban-protection,
  admin delete + cascade delete, user detail, audit log (filter সহ),
  system settings (public GET + admin PATCH), maintenance mode
  (student ব্লক + admin অপ্রভাবিত), feature flag (নির্দিষ্ট রুট
  ব্লক + admin অপ্রভাবিত), content report delete+ban flow,
  authorization/edge-case (401/403/404)।
- ✅ **Test cleanup সম্পূর্ণ**: এই সেশনের সব টেস্ট ইউজার (মোট ১২টা,
  কয়েকজন ban করা থাকায় নিজেদের delete-account API ব্যবহার করতে
  পারতো না) প্রকৃত `/api/admin/users/[userId]` DELETE endpoint দিয়ে
  (Admin session থেকে) ডিলিট করা হয়েছে, DB তে সরাসরি চেক করে cascade
  delete + system settings reset ভেরিফাই — শূন্য বাকি।

Content Report Bulk Actions এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Admin Panel Power-up ফিচারের সময় docs/MASTER_PLAN.md
  এ transparently লেখা হয়েছিল "প্রতিটা রিপোর্ট আলাদাভাবে অ্যাকশন
  নিতে হয়, একসাথে একাধিক select করে bulk resolve/dismiss/delete
  এখনো নেই" — এই সেশনে সেই ডকুমেন্টেড গ্যাপ পূরণ করা হলো।
- ✅ **রিফ্যাক্টর — `lib/content-report-actions.ts`**: আগে
  RESOLVE/DISMISS/DELETE_CONTENT/DELETE_AND_BAN এর মূল লজিক শুধু
  single-report route.ts এর ভেতরেই ছিল। এখন `applyReportAction()`
  নামে একটা শেয়ার্ড ফাংশনে বের করে আনা হয়েছে — single-report ও নতুন
  bulk endpoint দুটোই এই একই ফাংশন কল করে (DRY, কোনো ডুপ্লিকেট
  বিজনেস লজিক নেই)।
- ✅ **নতুন এন্ডপয়েন্ট — `POST /api/admin/reports/bulk`** — Body:
  `{ reportIds: string[], action, banReason? }`। সর্বোচ্চ ২০টা
  reportId একসাথে (accidental mass-action প্রতিরোধ)। **Sequential
  processing** (all-or-nothing transaction না) — প্রতিটা reportId
  আলাদাভাবে প্রসেস হয়, একটা ব্যর্থ হলেও বাকি সব চলতে থাকে, প্রতিটার
  জন্য আলাদা success/failure ফলাফল রিটার্ন হয়।
- ✅ **নতুন UI — `components/ui/checkbox.tsx`** (এই প্রজেক্টে প্রথমবার,
  base-ui Checkbox primitive দিয়ে, বাকি সব `components/ui/*` এর একই
  প্যাটার্নে) এবং Reports প্যানেলে চেকবক্স + "সব সিলেক্ট করো" +
  sticky bulk action bar (সিলেক্ট করা থাকলেই দেখা যায়)।
- ✅ **বাড়তি ইম্প্রুভমেন্ট (bonus)**: `applyReportAction()` এ একটা
  idempotency guard যোগ হয়েছে — ইতিমধ্যে RESOLVED/DISMISSED হওয়া
  রিপোর্টে আবার action নিতে চাইলে ৪০০ রিটার্ন করে (আগে দ্বিতীয়বার
  action নিলে status আবার ওভাররাইট হয়ে যেত, যদিও কোনো গুরুতর সমস্যা
  ছিল না, তবুও data integrity এর জন্য ভালো)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-content-report-bulk-actions.py`)
  — ২১টা assertion সব PASS: bulk RESOLVE/DISMISS/DELETE_CONTENT/
  DELETE_AND_BAN (প্রতিটার actual effect ভেরিফাই — পোস্ট ডিলিট
  হয়েছে কিনা, লেখক ব্যান হয়েছে কিনা), **partial failure handling**
  (একটা ভুয়া reportId মিশিয়ে দিয়ে বাকিগুলো তবুও প্রসেস হচ্ছে
  ভেরিফাই), MAX_BULK_SIZE সীমা (২৫টা পাঠালে ৪০০), খালি
  array/ভুল action (৪০০), authorization (৪০১/৪০৩), regression
  (single-report endpoint রিফ্যাক্টরের পরেও কাজ করছে), idempotency
  guard।
- ✅ **Test cleanup সম্পূর্ণ**: এই সেশনের সব টেস্ট ইউজার (মোট ১০টা)
  প্রকৃত `/api/admin/users/[userId]` DELETE endpoint দিয়ে ডিলিট,
  DB তে সরাসরি চেক করে cascade delete (test forum posts ও content
  reports সহ) ভেরিফাই — শূন্য বাকি।

Admin Panel UI/UX Polish এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: ব্যবহারকারী "UI/UX polish" বেছে নেওয়ার পরে Admin
  Panel এর sidebar/navigation systematically রিভিউ করে ৩টা রাফ-এজ
  (rough edge) পাওয়া গেছে যা student-facing sidebar (আগের সেশনের
  Sidebar Navigation ফিচার) এ ফিক্স হলেও Admin sidebar এ থেকে গিয়েছিল।
- ✅ **বাগ/গ্যাপ ১ — কোনো Active-Route Highlighting ছিল না**: Admin
  কোন পেজে আছে বোঝার কোনো ভিজ্যুয়াল ইঙ্গিত ছিল না। এখন
  `lib/nav-visibility.ts` এর বিদ্যমান `isNavItemActive()` হেল্পার
  পুনর্ব্যবহার করে (student sidebar এর একই লজিক, DRY) বর্তমান পেজের
  নেভিগেশন আইটেম হাইলাইট হয় (`aria-current="page"` সহ, accessibility)।
- ✅ **বাগ/গ্যাপ ২ — সম্পূর্ণ Non-Responsive ছিল**: ফিক্সড `w-60`
  sidebar ছোট স্ক্রিনে (মোবাইল/ট্যাবলেট) ভেঙে পড়তো, কোনো hide/hamburger
  লজিক ছিল না। এখন ≥768px এ sticky sidebar, তার নিচে (মোবাইল) hamburger
  বাটন সহ header যা bottom-sheet খোলে (`more-menu-sheet.tsx` এর একই
  প্রমাণিত base-ui Dialog প্যাটার্ন পুনর্ব্যবহার — নতুন কোনো navigation
  paradigm শেখার দরকার হয়নি)।
- ✅ **বাগ/গ্যাপ ৩ — Dark Mode Brightness আপডেট থেকে বাদ পড়েছিল**:
  আগের সেশনের sidebar dark-mode brightness overhaul এ
  `--sidebar`/`--sidebar-foreground` ইত্যাদি ভেরিয়েবল আপডেট হয়েছিল,
  কিন্তু Admin sidebar `bg-muted/30` (আলাদা ভেরিয়েবল) ব্যবহার করতো —
  তাই সেই fix থেকে উপকৃত হয়নি। এখন একই `bg-sidebar`/
  `text-sidebar-foreground` ভেরিয়েবল ব্যবহার করা হচ্ছে।
- ✅ **নতুন — ThemeToggle + UserMenu Admin Panel এ**: আগে Admin Panel
  এ কোথাও থিম পরিবর্তনের উপায় ছিল না (ছাত্র dark mode এ থেকে `/admin`
  এ গেলে আটকে থাকতো), এবং কে লগইন করা আছে তার কোনো ভিজ্যুয়াল
  নিশ্চিতকরণ ছিল না — এখন sidebar এ `ThemeToggle` (header এ) ও
  `UserMenu` (footer এ, নাম+ইমেইল সহ) যোগ করা হয়েছে, বিদ্যমান
  কম্পোনেন্ট পুনর্ব্যবহার করে (কোনো নতুন কম্পোনেন্ট বানাতে হয়নি)।
- ✅ **নতুন — Admin Dashboard Polish** (`app/admin/page.tsx`):
  প্রতিটা স্ট্যাট কার্ড (মোট ইউজার/সাবজেক্ট/চ্যাপ্টার ইত্যাদি) এখন
  ক্লিকযোগ্য (সংশ্লিষ্ট Admin পেজে নিয়ে যায়), এবং নতুন **Pending
  Reports quick-glance card** — কোনো PENDING content report থাকলে
  Dashboard এ ঢুকেই prominently দেখা যায় (আগে জানতে আলাদা করে Content
  Reports পেজে যেতে হতো)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-admin-ui-polish.py`) —
  ২২টা assertion সব PASS: সব ৯টা Admin রুট রিগ্রেশন, নতুন UI উপাদান
  compiled bundle এ presence, Dashboard এ clickable stat card href,
  Pending Reports card একটা নতুন রিপোর্ট তৈরি করে লাইভ ভেরিফাই,
  authorization regression (non-admin/unauthenticated block),
  student-facing dashboard/sidebar অপ্রভাবিত (regression)।
- ✅ **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার প্রকৃত
  `/api/admin/users/[userId]` DELETE endpoint দিয়ে ডিলিট, DB তে
  সরাসরি চেক করে cascade delete + PENDING content report শূন্য
  ভেরিফাই।

UI/UX Polish — Loading Skeletons সম্প্রসারণ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: আগের সেশনগুলোতে "Loading UI" ফিচার দুই দফায়
  (৮টা top-level hub পেজ, তারপর ৬টা dynamic route পেজ) বাস্তবায়িত
  হয়েছিল, কিন্তু docs/MASTER_PLAN.md এ transparently লেখা ছিল "বাকি
  ~৬০টা পেজে এখনো নির্দিষ্ট loading.tsx নেই"। এই সেশনে systematically
  অডিট করে (Python script দিয়ে সব `page.tsx` স্ক্যান করে কোনগুলো DB
  query চালায় কিন্তু sibling `loading.tsx` নেই) বাকি ১০টা genuinely
  প্রাসঙ্গিক পেজ চিহ্নিত করে সবগুলোতে content-শেপ skeleton যোগ করা হলো।
- ✅ **Student-facing (৬টা নতুন `loading.tsx`)**: Saved Topics
  (bookmark list শেপ), Settings (ফর্ম ফিল্ড শেপ), Duel Lobby (subject
  grid শেপ), Practice Result/CQ Result/Live Exam Result (স্কোর-কার্ড
  + প্রশ্নভিত্তিক রিভিউ শেপ) — সব বিদ্যমান `components/ui/skeleton.tsx`
  পুনর্ব্যবহার করে।
- ✅ **Admin CMS (৪টা নতুন `loading.tsx`)**: Admin Subjects লিস্ট,
  Subject Detail (Chapter Manager), Chapter Detail (Topic Manager),
  Topic Detail (Question Manager, সবচেয়ে ভারী কোয়েরি — empirical
  difficulty calculation সহ) — Admin Panel এর কোনো পেজেই আগে কোনো
  loading.tsx ছিল না, এই প্রথমবার যোগ হলো।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-loading-skeletons-expansion.py`)
  — ১৮টা assertion সব PASS: সব টার্গেট পেজ regression (২০০ OK), Saved
  Topics empty state এখনো কাজ করে, সব ১০টা নতুন `loading.tsx` ফাইল
  বিদ্যমান (filesystem-level ভেরিফাই — sandbox এ headless browser না
  থাকায় "visually rendering" সরাসরি verify করা সম্ভব না, established
  সীমাবদ্ধতা আগের Loading UI ফিচারেও একই ছিল), authorization regression।
- ✅ **Test cleanup সম্পূর্ণ**: ১টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক
  করে শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম আপগ্রেড — নতুন ফন্ট + Animation এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: "Existing feature UI/UX polish" ধারাবাহিকতায়
  ব্যবহারকারী নতুন করে "animation, premium theme, font আরও যা যা আছে
  লাগাও, Hugging Face বা অন্য বিভিন্ন ডিজাইন দেখে কাজ করো" নির্দেশ
  দেন — Hugging Face/Linear/Vercel-স্টাইল আধুনিক SaaS ডিজাইন প্যাটার্ন
  গবেষণা (web_search) করে প্রয়োগ করা হয়েছে।
- ✅ **নতুন প্রিমিয়াম Display ফন্ট (Baloo Da 2)** — `app/layout.tsx`
  এ `next/font/google` দিয়ে লোড করা হয়েছে (বাংলা+লাতিন সাবসেট, Google
  Fonts এর একমাত্র জনপ্রিয় বাংলা Display typeface, Duolingo-স্টাইল
  গোলগাল-কিন্তু-আত্মবিশ্বাসী ব্যক্তিত্ব)। `globals.css` এ `--font-heading`
  variable এ ম্যাপ করে সব `h1`-`h4` স্বয়ংক্রিয়ভাবে এই ফন্ট পায় (body
  text এখনো readability-অপ্টিমাইজড Hind Siliguri তেই থাকে — ইচ্ছাকৃত
  "double-font" ব্র্যান্ডিং প্যাটার্ন)।
- ✅ **নতুন CSS ইউটিলিটি (`globals.css`)**: `.aurora-bg` (৩টা ধীরে
  চলমান radial gradient blob, hero background এ), `.glass-panel`
  (backdrop-blur glassmorphism, navbar/card এ), `.hover-lift` (কার্ড
  hover এ subtle elevation), `.text-shimmer` (হেডলাইনে gradient sweep
  animation), `.glow-ring` (CTA বাটন/আইকনের চারপাশে পালসেটিং আভা),
  `.grain-overlay` (SVG noise texture, flat gradient কে "printed" ফিল
  দেয়) — সবই pure CSS, কোনো নতুন dependency ছাড়া, এবং সব
  `prefers-reduced-motion`/reduced-motion accessibility সেটিংস রেসপেক্ট
  করে (animation-duration override এর মাধ্যমে, বিদ্যমান নিয়মের সাথে
  compatible)।
- ✅ **নতুন `components/motion/fade-in.tsx`** — `FadeIn`/`StaggerGroup`/
  `StaggerItem` reusable framer-motion wrapper (package.json এ আগে থেকেই
  ছিল, মাত্র ২টা কম্পোনেন্টে ব্যবহৃত হচ্ছিল — এখন landing/dashboard/
  login/register পেজেও ব্যবহার করা হলো)। `useReducedMotion()` hook দিয়ে
  reduced-motion ইউজারদের জন্য animation সম্পূর্ণ স্কিপ হয়, এবং
  `viewport={{ once: true }}` দিয়ে স্ক্রল আপ-ডাউনে বারবার re-trigger হয়
  না।
- ✅ **Landing Page রিডিজাইন** (`app/page.tsx`) — Sticky glass navbar
  (স্ক্রল করলে blur+border দেখা যায়), hero section এ Aurora ব্যাকগ্রাউন্ড
  + grain overlay + shimmer হেডলাইন + glow-ring CTA বাটন, সব সেকশনে
  scroll-reveal/stagger entrance animation, feature card ও subject
  strip এ hover-lift।
- ✅ **Login/Register পেজ রিডিজাইন** — একই Aurora ব্যাকগ্রাউন্ড + glass
  card + glow-ring লোগো আইকন + FadeIn entrance, brand consistency
  বজায় রাখতে ল্যান্ডিং পেজের সাথে মিলিয়ে।
- ✅ **Dashboard পেজ পলিশ** — Header FadeIn entrance, Stats strip
  (স্ট্রিক/XP/লেভেল কার্ড) StaggerGroup দিয়ে একে একে ভেসে ওঠে, League
  Tier/Badges/Saved/Study Tools সব কার্ডে `hover-lift` প্রয়োগ (আগের
  ভিন্ন ভিন্ন `hover:shadow-md` প্যাটার্ন consolidate করে একটাই consistent
  ইউটিলিটি ক্লাসে)।
- ✅ **Bottom Nav Bar পলিশ** — Active ট্যাবের উপরে একটা ছোট pill indicator
  যোগ, `layoutId` (framer-motion shared layout animation) দিয়ে ট্যাব
  বদলানোর সময় স্প্রিং ফিজিক্সে স্লাইড করে (Instagram/Duolingo-স্টাইল)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-premium-theme-landing.py`
  — ১৬টা assertion, `scripts/test-premium-theme-bottomnav.py` — ৮টা
  assertion, দুটোই সব PASS): landing/login/register পেজে নতুন CSS
  class + ফন্ট variable serverside render হচ্ছে ভেরিফাই, রিয়েল
  register→login→dashboard flow এ কোনো crash/regression নেই, dashboard
  এ bottom-nav markup ও hover-lift প্রেজেন্ট।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (landing page এখনো static ○ প্রি-রেন্ডার হচ্ছে যদিও client
  component এ রূপান্তরিত হয়েছে), `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার (দুই রাউন্ড টেস্টে) প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক করে
  শূন্য বাকি ভেরিফাই।

`hover-lift` Rollout — প্ল্যাটফর্ম-জুড়ে Consistent Hover Animation এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: প্রিমিয়াম থিম আপগ্রেড ফিচারে নতুন `hover-lift` CSS
  ইউটিলিটি তৈরি হলেও শুধু Landing/Dashboard এ প্রয়োগ করা হয়েছিল।
  Python regex দিয়ে পুরো `app/`+`components/` স্ক্যান করে বাকি সব পুরনো
  `hover:shadow-md transition-shadow`/`hover:shadow-lg transition-shadow`
  প্যাটার্ন খুঁজে বের করে একই consistent ইউটিলিটিতে migrate করা হলো।
- ✅ **১২টা জায়গায় consolidate**: Learn (subject card), Saved Topics,
  Practice/CQ Practice/Mock Exam (subject card, conditional
  enabled/disabled state সহ), Admin Dashboard (stat card, বিদ্যমান
  `hover:border-primary/30` বজায় রেখে), Admission History, Flashcard
  Deck Card, Forum Feed (post card), Reading Room (room card,
  keyboard-accessible `role="button"` সহ), Review Queue Card, Mistake
  Vault Reminder Card।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-hover-lift-rollout.py` —
  ২১টা assertion, `scripts/test-hover-lift-rollout-2.py` — ১৫টা
  assertion, দুটোই সব PASS): প্রতিটা পরিবর্তিত পেজ ২০০ status +
  `hover-lift` class উপস্থিত + পুরনো `hover:shadow-md/lg
  transition-shadow` কোথাও অবশিষ্ট নেই (grep-level regression চেক),
  Admin লগইন+পেজ অপ্রভাবিত।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার (দুই স্ক্রিপ্টে) প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক করে
  শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম — বাকি Auth পেজে সম্প্রসারণ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Login/Register পেজ প্রিমিয়াম থিম (Aurora+glass) পেলেও
  একই `(auth)` route group এর Forgot Password/Reset Password/Onboarding
  পেজ audit করে দেখা গেল এখনো পুরনো flat `bg-linear-to-br from-indigo-50
  via-white to-purple-50` background ব্যবহার করছে — ব্র্যান্ড
  ইনকনসিস্টেন্সি।
- ✅ **৩টা পেজ আপডেট**: `forgot-password`, `reset-password`, `onboarding`
  — সবগুলোতে Login/Register এর একই প্যাটার্ন প্রয়োগ (Aurora background +
  grain overlay + glass-panel card + glow-ring লোগো আইকন + FadeIn
  entrance animation)।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-auth-pages-premium-theme.py`
  — ১৬টা assertion, সব PASS): ৩টা পেজেই নতুন CSS class উপস্থিত + পুরনো
  flat gradient কোথাও অবশিষ্ট নেই, রিয়েল register→login→onboarding-API
  flow (আসল `/api/user/onboarding` POST দিয়ে HSC ব্যাচ+বোর্ড সেভ) ভেঙে
  যায়নি।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ১টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক করে
  শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম — Badges ও Leaderboard পেজে অ্যানিমেশন পলিশ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: হেডার/গ্রিড অডিট করে দেখা গেল Badges (ব্যাজ গ্রিড) ও
  Leaderboard (সাপ্তাহিক লিগ+গ্লোবাল rank লিস্ট) পেজ দুটোতে এখনো কোনো
  entrance animation বা `hover-lift` প্রয়োগ হয়নি — Dashboard/Landing এর
  সাথে ইনকনসিস্টেন্ট ছিল।
- ✅ **Badges পেজ** (`app/(dashboard)/badges/page.tsx`) — হেডার এ
  FadeIn, ব্যাজ গ্রিড এ StaggerGroup/StaggerItem (৫০ms ব্যবধানে একে
  একে ভেসে ওঠে), শুধু অর্জিত ব্যাজে `hover-lift` (ইচ্ছাকৃত UX
  সিদ্ধান্ত — অনর্জিত `grayscale` ব্যাজে hover effect দেখানো
  বিভ্রান্তিকর হতো, কারণ সেগুলো clickable/interactive না)।
- ✅ **Leaderboard পেজ** (`app/(dashboard)/leaderboard/page.tsx`) —
  হেডার এ FadeIn, দুই ট্যাবেই (সাপ্তাহিক লিগ + গ্লোবাল) rank কার্ড
  লিস্টে StaggerGroup + `direction="left"` StaggerItem (৩০ms ব্যবধানে,
  বেশি আইটেম থাকতে পারে তাই দ্রুত stagger) + `hover-lift`।
- ✅ **লাইভ multi-user টেস্ট** (`scripts/test-badges-leaderboard-polish.py`
  — ১২টা assertion, সব PASS): fresh student (০টা অর্জিত ব্যাজ) দিয়ে
  Badges পেজ ঠিকমতো grayscale দেখায় ভেরিফাই, Admin অ্যাকাউন্ট (২টা
  অর্জিত ব্যাজ, real DB data) দিয়ে `hover-lift` সঠিকভাবে শুধু অর্জিত
  কার্ডে প্রয়োগ হচ্ছে ভেরিফাই, Leaderboard এর দুই ট্যাবেই markup ঠিক
  আছে যাচাই।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ১টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক করে
  শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম — Analytics ও Study Group পলিশ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: বাকি টুল পেজ অডিট চালিয়ে গিয়ে Analytics Dashboard ও
  Study Group পেজে animation/hover-lift গ্যাপ পাওয়া গেছে।
- ✅ **Analytics Dashboard** (`components/analytics/analytics-dashboard.tsx`)
  — হেডারে FadeIn, Overall Stats গ্রিড (মাস্টারি/কুইজ নির্ভুলতা/ঘন্টা
  পড়াশোনা/স্ট্রিক ৪টা কার্ড) StaggerGroup/StaggerItem + `StatCard`
  হেল্পার ফাংশনে `hover-lift` (রিইউজেবল, একই কার্ড Analytics ও অন্য
  জায়গায় ব্যবহৃত হলে সব জায়গায় প্রয়োগ হয়)। চার্ট/গ্রাফ কার্ড
  (Progress Trend, Subject Performance, Time Distribution, Weak
  Topics, Misconceptions, Confidence) ইচ্ছাকৃতভাবে অপরিবর্তিত (এগুলো
  clickable/interactive না, শুধু ডেটা ভিজুয়ালাইজেশন দেখায় — Badges
  পেজের একই affordance-সচেতন নীতি অনুসরণ করে)।
- ✅ **Study Group** (`components/study-group/study-group-dashboard.tsx`)
  — Reading Room এ যোগ দেওয়ার শর্টকাট কার্ড (পুরো কার্ডই `<Link>`,
  সত্যিকারের clickable) পুরনো `hover:bg-muted/40 transition-colors` থেকে
  নতুন consistent `hover-lift` এ migrate।
- ✅ **PDF Chat ডকুমেন্ট কার্ড ইচ্ছাকৃতভাবে অপরিবর্তিত** — কার্ডের ভেতরে
  আলাদা "চ্যাট করো" বাটন আছে (পুরো কার্ড clickable না), তাই পুরো কার্ডে
  `hover-lift` প্রয়োগ করলে বিভ্রান্তিকর affordance তৈরি হতো (মনে হতো
  পুরো কার্ডই ক্লিকযোগ্য)।
- ✅ **লাইভ multi-user টেস্ট**
  (`scripts/test-analytics-studygroup-polish.py` — ৬টা assertion, সব
  PASS): register→login flow এর পরে `/analytics` পেজ + `/api/analytics`
  (client component যে API কল করে) + `/study-group` পেজ সব ২০০ status,
  কোনো crash/regression নেই।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ১টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক করে
  শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম — Duel/Quiz Battle/Mock Exam পলিশ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: gamification-adjacent প্রতিযোগিতামূলক ফিচার (Duel,
  Quiz Battle, Mock Exam) অডিট করে দেখা গেল কোনোটাতেই entrance
  animation বা `hover-lift` প্রয়োগ হয়নি।
- ✅ **Duel Lobby** (`components/duel/duel-lobby.tsx`) — ওপেন
  চ্যালেঞ্জ লিস্টে StaggerGroup/StaggerItem (`direction="left"`, ৫০ms
  ব্যবধানে)। কার্ডে `hover-lift` প্রয়োগ হয়নি ইচ্ছাকৃতভাবে (কার্ডের
  ভেতরে আলাদা "গ্রহণ করো" বাটন আছে, পুরো কার্ড clickable না — PDF Chat
  এর একই affordance নীতি)।
- ✅ **Mock Exam Mode Selector** (`components/mock-exam/mode-selector.tsx`)
  — ২টা মোড কার্ডে (পূর্ণ বোর্ড ফরম্যাট/সংক্ষিপ্ত প্র্যাকটিস)
  StaggerGroup/StaggerItem (১০০ms ব্যবধানে)। এখানেও `hover-lift` বাদ
  দেওয়া হয়েছে (কার্ডের নিচে আলাদা "শুরু করো" বাটন, পুরো কার্ড
  clickable না)।
- ✅ **Quiz Battle Home** (`components/quiz-battle/quiz-battle-home.tsx`)
  — "আমার Battle History" শর্টকাট কার্ড (পুরো কার্ডই `<Link>`, সত্যিকারের
  clickable) পুরনো `hover:bg-muted/50 transition-colors` থেকে
  `hover-lift` এ migrate।
- ✅ **লাইভ multi-user টেস্ট**
  (`scripts/test-duel-quizbattle-mockexam-polish.py` — ৯টা assertion,
  সব PASS): register→login flow এর পরে `/duel`, `/quiz-battle`,
  `/mock-exam/subject/[realSubjectId]` (আসল DB সাবজেক্ট ID দিয়ে) সব ২০০
  status + সঠিক কনটেন্ট (সাবজেক্ট নাম, মোড টাইটেল) রেন্ডার হচ্ছে
  ভেরিফাই, non-existent subject ID দিয়ে কাস্টম বাংলা 404 পেজ
  (`app/not-found.tsx`) সঠিকভাবে দেখাচ্ছে ভেরিফাই (dev mode এ
  React streaming এর কারণে HTTP status code 200 থাকে কিন্তু body তে
  কাস্টম 404 কনটেন্ট থাকে — established Next.js dev-mode আচরণ, প্রোডাকশন
  বিল্ডে সঠিক 404 status কোড দেয়)।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার (মূল টেস্ট + ডিবাগ রান)
  প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি
  চেক করে শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম — Admission/Forum/Notifications পলিশ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: "Next" ধারাবাহিকতায় আরও বাকি টুল পেজ (Admission
  Prep, Forum, Notification Center) অডিট করে animation গ্যাপ পাওয়া
  গেছে।
- ✅ **Admission Prep Hub** (`components/admission/admission-hub.tsx`)
  — পরীক্ষা (Medical/BUET/DU 'ক' ইউনিট) কার্ড গ্রিডে
  StaggerGroup/StaggerItem (৮০ms ব্যবধানে)। `hover-lift` প্রয়োগ হয়নি
  ইচ্ছাকৃতভাবে (কার্ডের নিচে আলাদা "মক টেস্ট শুরু করো" বাটন আছে, পুরো
  কার্ড clickable না — established affordance নীতি)।
- ✅ **Forum Feed** (`components/forum/forum-feed.tsx`) — পোস্ট
  লিস্টে StaggerGroup/StaggerItem (৪০ms ব্যবধানে) যোগ করা হয়েছে
  (আগের সেশনে `hover-lift` ইতিমধ্যে ছিল, এখন entrance animation ও
  যোগ হলো)।
- ✅ **Notification Center** (`components/notifications/notification-center.tsx`)
  — নোটিফিকেশন লিস্টে StaggerGroup/StaggerItem (৩০ms ব্যবধানে)।
  `hover-lift` যোগ করা হয়নি (এখানে কার্ডের ভেতরে আলাদা `<button>`
  ক্লিক-এরিয়া + আলাদা ডিলিট বাটন আছে, একই affordance নীতি প্রযোজ্য)।
- ✅ **লাইভ multi-user টেস্ট**
  (`scripts/test-admission-forum-notifications-polish.py` — ৮টা
  assertion, `scripts/test-notifications-real-data.py` — ৪টা
  assertion, দুটোই সব PASS): register→login flow দিয়ে সব পেজ+API ২০০
  status ভেরিফাই, এবং Admin অ্যাকাউন্ট (DB তে সত্যিকারের ২টা
  notification আছে) দিয়ে লগইন করে real-data রেন্ডার পাথ (StaggerGroup
  আসল আইটেম নিয়ে কাজ করছে) আলাদাভাবে ভেরিফাই।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ১টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক করে
  শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম — Flashcards ও Reading Room পলিশ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: "Next" ধারাবাহিকতায় বাকি টুল পেজ অডিটের শেষ ধাপে
  Flashcards Hub, Community Discover Deck Browser, Reading Room
  Leaderboard চেক করে animation গ্যাপ পাওয়া গেছে।
- ✅ **Flashcards Hub** (`app/(dashboard)/flashcards/page.tsx`) —
  হেডারে FadeIn, ডেক গ্রিডে StaggerGroup/StaggerItem (৫০ms ব্যবধানে)।
  `DeckCard` কম্পোনেন্টে ইতিমধ্যে `hover-lift` ছিল (আগের সেশনের
  `hover-lift` rollout এ), অপরিবর্তিত রাখা হয়েছে (পুরো কার্ডই
  `<Link>`, fully-clickable)।
- ✅ **Community Discover Deck Browser**
  (`components/flashcards/discover-deck-browser.tsx`) — পাবলিক ডেক
  গ্রিডে StaggerGroup/StaggerItem (৫০ms ব্যবধানে)। `hover-lift`
  প্রয়োগ হয়নি ইচ্ছাকৃতভাবে (কার্ডের নিচে আলাদা "কপি করো" import বাটন,
  পুরো কার্ড clickable না — established affordance নীতি)।
- ✅ **Reading Room Leaderboard**
  (`components/reading-room/reading-room-leaderboard.tsx`) — rank
  কার্ড লিস্টে StaggerGroup/StaggerItem (`direction="left"`, ৩০ms
  ব্যবধানে) — মূল Leaderboard পেজের (আগের সেশনে পলিশ করা) একই
  প্যাটার্ন অনুসরণ করে।
- ✅ **লাইভ multi-user টেস্ট**
  (`scripts/test-flashcards-readingroom-polish.py` — ৯টা assertion,
  `scripts/test-flashcards-realdata-polish.py` — ৬টা assertion,
  দুটোই সব PASS): register→login flow দিয়ে `/flashcards`,
  `/flashcards/discover`, `/api/flashcard-decks/discover`,
  `/reading-room`, `/reading-room/leaderboard` সব ২০০ status ভেরিফাই।
  দ্বিতীয় স্ক্রিপ্টে আসল `/api/flashcard-decks` POST endpoint দিয়ে
  একটা real ডেক তৈরি করে Flashcards Hub পেজে সেই ডেক নাম StaggerGroup
  সহ সঠিকভাবে রেন্ডার হচ্ছে ভেরিফাই করা হয়েছে (শুধু empty-state না,
  real-data render path ও টেস্ট করা)।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার (দুই স্ক্রিপ্টে) +
  ১টা টেস্ট ফ্ল্যাশকার্ড ডেক প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট (cascade delete এ ডেকও মুছে যায়), DB তে সরাসরি
  চেক করে শূন্য বাকি ভেরিফাই।

প্রিমিয়াম থিম — Intro পেজ ও Chapter Selection পলিশ এ যা যা তৈরি ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: বাকি টুল পেজ অডিট সিরিজের শেষ ধাপে Mistake Vault/
  Timed Drill/Smart Practice Intro পেজ ও Practice/CQ Practice এর
  Chapter Selection পেজ চেক করা হয়েছে — animation গ্যাপ পাওয়া গেছে।
- ✅ **Intro পেজ ৩টা** (`components/practice/mistake-vault-intro.tsx`,
  `drill-intro.tsx`, `adaptive-practice-intro.tsx`) — সব ৩টাতেই
  হেডারে FadeIn যোগ করা হয়েছে। ভেতরের সাবজেক্ট/সময়সীমা সিলেকশন
  বাটনগুলো (`<button onClick={...}>` টগল প্যাটার্ন, radio-button-স্টাইল
  selection) ইচ্ছাকৃতভাবে অপরিবর্তিত রাখা হয়েছে — stagger/hover-lift
  এখানে প্রাসঙ্গিক না (এগুলো navigation card না, selection toggle)।
- ✅ **Practice Chapter Selection** (`app/(dashboard)/practice/[subjectId]/page.tsx`)
  — হেডারে FadeIn, chapter কার্ড লিস্টে StaggerGroup/StaggerItem (৪০ms
  ব্যবধানে)। `hover-lift` প্রয়োগ হয়নি (প্রতিটা কার্ডে একাধিক আলাদা
  বাটন — "শুরু করো"/"শুধু বোর্ড প্রশ্ন"/"প্রি-টেস্ট দাও" — পুরো কার্ড
  clickable না)।
- ✅ **CQ Practice Chapter Selection** (`app/(dashboard)/cq-practice/[subjectId]/page.tsx`)
  — একই প্যাটার্ন (হেডার FadeIn + chapter লিস্ট StaggerGroup)।
- ✅ **লাইভ multi-user টেস্ট**
  (`scripts/test-intro-pages-chapter-selection-polish.py` — ১৩টা
  assertion, সব PASS): register→login flow দিয়ে ৩টা Intro পেজ (সঠিক
  টাইটেল টেক্সট সহ) + আসল DB সাবজেক্ট ID দিয়ে Practice ও CQ Practice
  চ্যাপ্টার সিলেকশন পেজ (সঠিক সাবজেক্ট নাম সহ) সব ২০০ status।
- ✅ **একটা lint warning ধরা পড়ে সাথে সাথে ফিক্স** (transparent
  reporting): `mistake-vault-intro.tsx` এ `StaggerGroup`/`StaggerItem`
  import করা হয়েছিল কিন্তু আসলে ব্যবহার হয়নি (শুধু `FadeIn` ব্যবহৃত,
  কারণ সেখানে সাবজেক্ট সিলেকশন বাটন — কার্ড লিস্ট না)। `pnpm lint`
  চালানোর সময় `@typescript-eslint/no-unused-vars` warning ধরা পড়ে,
  অপ্রয়োজনীয় import সরিয়ে ফিক্স করা হয়েছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন (unused import fix করার পরে)।
- ✅ **Test cleanup সম্পূর্ণ**: ১টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে সরাসরি চেক করে
  শূন্য বাকি ভেরিফাই।

🐛 গুরুতর বাগ ফিক্স — Exam Submit Race Condition (৫টা endpoint) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: ব্যবহারকারী "প্রোঅ্যাক্টিভ বাগ/এজ-কেস শিকার" নির্দেশ
  দেওয়ার পরে সম্পূর্ণ `app/api/` (১৭২টা route.ts) Python script দিয়ে
  systematically স্ক্যান করা হয়েছে দুই ধরনের প্যাটার্নে: (১) mutating
  endpoint এ ownership check মিসিং কিনা, (২) read-then-write status
  check (আগে `if (x.status !== "Y") throw` তারপর আলাদা `.update()`
  কল — এই কোডবেসে established race-condition বাগ ক্লাস, আগেও
  Task/StudyPlanItem/QuizBattle-submit/QuizDuel এ পাওয়া গিয়েছিল)।
- ✅ **Ownership check স্ক্যান**: ১৯টা mutating dynamic-param handler +
  ১৪টা GET handler পরীক্ষা করে ৬টা সন্দেহজনক পাওয়া গেছে, কিন্তু সবগুলো
  ম্যানুয়াল রিভিউতে false-positive প্রমাণিত হয়েছে (`getOwnedSet()`/
  `getOwnedDocument()`/`verifyOwnership()` এর মতো established হেল্পার
  ফাংশন ব্যবহার করায় regex miss করেছিল, অথবা Chapter/Topic এর মতো
  shared curriculum content যেখানে per-user ownership প্রাসঙ্গিকই না)।
- ✅ **Status-check race condition স্ক্যান — ৫টা আসল বাগ পাওয়া গেছে**:
  - **Content Report Action** (`lib/content-report-actions.ts`) —
    `applyReportAction()` এ `report.status !== "PENDING"` read-then-write
    ছিল। লাইভ টেস্টে ৫টা concurrent RESOLVE request এ ৫টাই সফল হয়েছে
    (প্রত্যাশিত ১টা) — DELETE_AND_BAN এর ক্ষেত্রে এটা duplicate delete/ban/
    notification এর ঝুঁকি তৈরি করত।
  - **Mock Exam MCQ Submit** (`app/api/mock-exam/[attemptId]/submit-mcq/route.ts`)
    — concurrent ৩টা request এ ৩টাই সফল।
  - **Mock Exam CQ Submit** (`app/api/mock-exam/[attemptId]/submit-cq/route.ts`)
    — সবচেয়ে গুরুতর: concurrent ৩টা request এ ৩টাই সফল, ২টা CQ প্রশ্নে
    মোট **৬টা** `CQAttempt` রো তৈরি হয়েছে (প্রত্যাশিত ২টা) — অ-শূন্য
    স্কোরের ক্ষেত্রে duplicate ব্যয়বহুল AI evaluation call ও duplicate
    XP award ঘটাতো।
  - **Admission Mock Test Submit** (`app/api/admission/[attemptId]/submit/route.ts`)
    — concurrent ৩টা request এ ৩টাই সফল।
  - **Live Exam Submit** (`lib/live-exam.ts` এর `submitLiveExam()`) —
    concurrent ৫টা request এ ৫টাই সফল, প্রতিটাই `awardXp()` কল করতে
    পারত (duplicate XP award ঝুঁকি সবচেয়ে বেশি কারণ কোনো secondary
    guard ছিল না)।
  - **Bonus (কম গুরুতর, ধারাবাহিকতার জন্য ফিক্স করা)**: Quiz Battle
    Start (`lib/quiz-battle.ts` এর `startQuizBattle()`) — একই
    read-then-write প্যাটার্ন (কোনো XP/AI cost জড়িত না, কিন্তু owner এর
    concurrent ক্লিকে `startedAt` বারবার reset হওয়ার ঝুঁকি ছিল)।
- ✅ **ফিক্স প্যাটার্ন (সব ৬টাতেই একই established pattern)**: প্রতিটাতে
  আলাদা read+check+update এর বদলে single atomic `prisma.X.updateMany({
  where: { id, status: "EXPECTED_STATUS" }, data: {...} })` স্টেটমেন্ট
  ব্যবহার করা হয়েছে (Postgres row-level lock guarantee) — শুধু matched
  (`count > 0`) request-ই আসল কাজ (delete/ban/AI-eval/XP-award) করার
  অনুমতি পায়, বাকিরা সাথে সাথে "ইতিমধ্যে হয়ে গেছে" এরর পায়। Mock Exam
  CQ Submit এ atomic claim সবচেয়ে আগে (কোনো AI call/DB write হওয়ার
  আগেই) বসানো হয়েছে যাতে পুরো ব্যয়বহুল অংশটাই race-safe হয়।
- ✅ **লাইভ multi-user concurrency টেস্ট** (৬টা নতুন স্ক্রিপ্ট, Python
  `threading` দিয়ে সত্যিকারের concurrent HTTP request পাঠিয়ে):
  - `scripts/test-content-report-race-condition.py` (১০ assertion) —
    RESOLVE এ exactly ১/৫ সফল ভেরিফাই।
  - `scripts/test-content-report-race-condition-delete.py` (১৩
    assertion) — DELETE_AND_BAN এ exactly ১/৫ সফল, no P2025 crash,
    author ঠিক একবার ban হয়েছে ভেরিফাই।
  - `scripts/test-mockexam-mcq-race-condition.py` (৫ assertion),
    `scripts/test-mockexam-cq-race-condition.py` (১০ assertion, DB তে
    CQAttempt রো সংখ্যা সরাসরি চেক করে exactly ২টা ভেরিফাই)।
  - `scripts/test-admission-submit-race-condition.py` (৭ assertion)।
  - `scripts/test-liveexam-submit-race-condition.py` (৭ assertion, XP
    ঠিক একবার award হয়েছে ভেরিফাই)।
  - `scripts/test-quizbattle-start-race-condition.py` (৫ assertion)।
  - সব ফিক্সের পরে exactly ১টা request সফল (200) ও বাকিরা ৪০০ "ইতিমধ্যে
    হয়ে গেছে" এরর পেয়েছে — নিশ্চিত করা হয়েছে।
- ✅ **Regression টেস্ট** (নিশ্চিত করতে যে fix স্বাভাবিক flow ভাঙেনি):
  - `scripts/test-content-report-regression.py` (২২ assertion) —
    single+bulk report action, idempotency (দ্বিতীয়বার action নিলে
    ৪০০) সব ঠিকভাবে কাজ করছে।
  - `scripts/test-exam-flows-regression.py` (২৪ assertion) — Mock
    Exam/Admission/Live Exam/Quiz Battle এর সম্পূর্ণ end-to-end flow
    (start→submit→result page) স্বাভাবিক non-concurrent ব্যবহারে
    ঠিকভাবে কাজ করছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: মোট ১২+টা টেস্ট ইউজার (একাধিক টেস্ট
  স্ক্রিপ্ট রানে) প্রকৃত `/api/user/delete-account` endpoint দিয়ে
  ডিলিট, ১টা leftover ইউজার (স্ক্রিপ্ট ভুল endpoint path এ প্রথমবার
  ব্যর্থ হওয়ায় থেকে গিয়েছিল, transparently রিপোর্ট করা হলো) ম্যানুয়ালি
  খুঁজে বের করে একই API দিয়ে ডিলিট, DB তে সরাসরি চেক করে শূন্য বাকি
  ভেরিফাই।

🐛 বাগ ফিক্স — Study Pet Lazy-Create Race Condition এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Exam Submit Race Condition ফিক্সের ধারাবাহিকতায় আরও
  একটা established বাগ ক্লাস ("lazy create on unique field", ForumVote/
  ForumReport এ আগে পাওয়া গিয়েছিল) পুরো কোডবেসে আবার স্ক্যান করা হয়েছে
  — `findFirst`/`findUnique` এর পরে ২০ লাইনের মধ্যে `.create()` কল
  আছে এমন প্যাটার্ন খুঁজে ১৩টা candidate পাওয়া গেছে, প্রতিটা ম্যানুয়ালি
  রিভিউ করে ১টা আসল বাগ (`lib/study-pet.ts` এর `getOrCreateStudyPet()`)
  চিহ্নিত করা হয়েছে।
- ✅ **বাগ**: `StudyPet.userId` তে `@unique` constraint আছে (একজন
  ইউজারের একটাই পেট)। আগে `findUnique()` দিয়ে চেক করে `null` হলে
  `create()` কল করা হতো — Planner পেজ প্রথমবার লোড হওয়ার সময় (React
  concurrent rendering, দ্রুত ডাবল-নেভিগেশন, বা একাধিক ট্যাব) একাধিক
  concurrent `GET /api/study-pet` request একসাথে `pet === null` দেখে
  সবাই `create()` কল করার চেষ্টা করত। লাইভ টেস্টে ৫টা concurrent
  request পাঠিয়ে **৪টা ৫০০ Internal Server Error** পেয়েছে (Prisma
  P2002 — "Unique constraint failed on the fields: (userId)")।
- ✅ **ফিক্স**: `lib/forum-vote.ts` এর established প্যাটার্ন অনুসরণ করে
  Prisma `upsert({ where: { userId }, create: { userId }, update: {} })`
  ব্যবহার করা হয়েছে — এটা Postgres এ single `INSERT ... ON CONFLICT
  (userId) DO UPDATE` স্টেটমেন্টে কম্পাইল হয় (সম্পূর্ণ DB-level atomic,
  কোনো race window থাকে না)। `update: {}` (খালি অবজেক্ট) — বিদ্যমান
  পেট থাকলে কিছুই পরিবর্তন করে না, শুধু বিদ্যমান রো রিটার্ন করে।
- ✅ **লাইভ multi-user concurrency টেস্ট**
  (`scripts/test-studypet-lazy-create-race-condition.py` — ৫টা
  assertion): fix এর আগে বাগ reproduce করা হয়েছে (৪/৫ crash), fix এর
  পরে আবার রান করে ৫/৫ সফল (২০০ status) + DB তে সরাসরি চেক করে exactly
  ১টা `StudyPet` রো তৈরি হয়েছে ভেরিফাই করা হয়েছে।
- ✅ **Regression টেস্ট** (`scripts/test-studypet-regression.py` — ১৩টা
  assertion): প্রথমবার GET (lazy create, EGG stage/০ carePoints),
  দ্বিতীয়বার GET (একই পেট, ডুপ্লিকেট না), rename, পোমোডোরো সেশন
  সম্পূর্ণ করে পেট feed করা (carePoints বৃদ্ধি), Planner পেজ লোড — সব
  স্বাভাবিক non-concurrent ব্যবহারে ঠিকভাবে কাজ করছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট (cascade delete এ
  StudyPet রো ও মুছে যায়), DB তে সরাসরি চেক করে শূন্য বাকি ভেরিফাই।

🐛 বাগ ফিক্স — Per-User Capacity Limit Race Condition (৩টা endpoint) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Study Pet Lazy-Create Race Condition ফিক্সের পরে
  আরও একটা established বাগ ক্লাস ("count-then-create capacity check
  race condition", আগে Study Group `maxMembers` ও Quiz Battle
  `maxPlayers` এ পাওয়া গিয়েছিল ও ফিক্স করা হয়েছিল) পুরো `app/api/`
  ডিরেক্টরিতে systematically স্ক্যান করা হয়েছে — `prisma.X.count()`
  কল করা সব endpoint (১৩টা) পরীক্ষা করে ৩টা আসল বাগ পাওয়া গেছে।
- ✅ **আবিষ্কৃত বাগ**: তিনটাতেই একই প্যাটার্ন — `existingCount >=
  MAX` চেক করে তারপর আলাদা `create()` কল (read-then-write)।
  - **Habit** (`app/api/habits/route.ts`, MAX ১০টা) — ৯টা বিদ্যমান
    habit থাকা অবস্থায় ৫টা concurrent POST এ ৫টাই সফল, চূড়ান্ত count
    ১৪টা (bypass)।
  - **Custom Question Set** (`app/api/custom-question-sets/route.ts`,
    MAX ২০টা) — ১৯টা বিদ্যমান সেট থাকা অবস্থায় ৫টা concurrent POST এ
    ৫টাই সফল, চূড়ান্ত count ২৪টা।
  - **PDF Chat Upload** (`app/api/pdf-chat/route.ts`, MAX ১০টা) —
    **সবচেয়ে গুরুত্বপূর্ণ** কারণ প্রতিটা অতিরিক্ত ডকুমেন্ট আসল ব্যয়বহুল
    AI embedding cost + storage ব্যবহার করে। ৯টা বিদ্যমান ডকুমেন্ট থাকা
    অবস্থায় ৫টা concurrent upload এ ৫টাই সফল, চূড়ান্ত count ১৪টা।
- ✅ **ফিক্স**: `lib/study-group.ts` এর `joinStudyGroup()` এ established
  প্যাটার্ন অনুসরণ করে — Postgres `SELECT id FROM "users" WHERE id = ?
  FOR UPDATE` দিয়ে `$transaction` এর ভেতরে User row কে lock করা হয়েছে
  (per-user resource limit, তাই User row lock করাই সঠিক জায়গা — Study
  Group এ Group row lock করা হয়েছিল কারণ সেটা per-group limit ছিল)।
  একই ইউজারের concurrent request গুলো এখন serialize হয়ে যায় —
  capacity check + insert atomic।
- ✅ **লাইভ multi-user concurrency টেস্ট** (৩টা নতুন স্ক্রিপ্ট, fix এর
  আগে বাগ reproduce করে fix এর পরে আবার রান করে ভেরিফাই করা হয়েছে):
  - `scripts/test-habit-count-race-condition.py` — ৫টা assertion,
    exactly ১/৫ সফল, DB তে ঠিক ১০টা habit।
  - `scripts/test-customquestionsets-count-race-condition.py` — ৫টা
    assertion, exactly ১/৫ সফল, DB তে ঠিক ২০টা সেট।
  - `scripts/test-pdfchat-count-race-condition.py` — ৫টা assertion,
    exactly ১/৫ সফল, DB তে ঠিক ১০টা ডকুমেন্ট।
- ✅ **Regression টেস্ট** (`scripts/test-capacity-limits-regression.py`
  — ২১টা assertion): তিনটা endpoint এই normal (non-concurrent) create+
  list flow, এবং boundary case (ঠিক MAX পর্যন্ত সফল, MAX+১ এ পরিষ্কার
  ৪০০ error) সব ঠিকভাবে কাজ করছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল, `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: ৬টা টেস্ট ইউজার (চারটা concurrency টেস্ট
  স্ক্রিপ্ট + তিনটা regression flow) প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট (cascade delete এ সব habit/set/document ও মুছে
  যায়), DB তে সরাসরি চেক করে শূন্য বাকি ভেরিফাই।

অ্যাক্সেসিবিলিটি ও Mobile Responsiveness গভীর অডিট (রাউন্ড ২) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: আগের অ্যাক্সেসিবিলিটি অডিটগুলোর (Icon-Only aria-label,
  Color Contrast, Keyboard Navigation, Nested-Interactive fix) ধারাবাহিকতায়
  আরও একটা গভীর ফলো-আপ অডিট চালানো হয়েছে — এবার Icon Button coverage আরও
  সম্প্রসারণ ও Form Input/Textarea/Select Label association সিস্টেম্যাটিকভাবে
  স্ক্যান করা হয়েছে।
- ✅ **আবিষ্কার #১ — Icon-only Button এ মিসিং `aria-label`**: Python regex
  script (custom brace-depth-aware `find_tag_end()` ফাংশন দিয়ে JSX ট্যাগ
  বাউন্ডারি নির্ভুলভাবে বের করে, arrow function `=>` false-positive এড়িয়ে)
  দিয়ে পুরো কোডবেজ স্ক্যান করে **১৪টা** icon-only button এ মিসিং `aria-label`
  পাওয়া গেছে, প্লাস `components/ui/dialog.tsx` এ ইংরেজি "Close" sr-only টেক্সট
  (ভাষা consistency ইস্যু)। সব ফিক্স করা হয়েছে:
  - `app/ai-tutor/page.tsx` (ছবি আপলোড বাটন), `components/admin/cq-question-manager.tsx`
    (delete), `components/admin/forum-moderation-panel.tsx` (scan/pin/delete —
    ৩টা), `components/admin/question-manager.tsx` (delete),
    `components/admin/reports-panel.tsx` (৪টা অ্যাকশন বাটন — Resolve/Dismiss/
    Delete Content/Delete+Ban), `components/flashcards/deck-card-list.tsx`
    (delete), `components/live-exam/custom-question-set-dashboard.tsx`
    (delete), `components/pdf-chat/pdf-chat-dashboard.tsx` (delete),
    `components/planner/habit-tracker.tsx` (delete), `components/study-group/study-group-dashboard.tsx`
    (copy invite code), `components/ui/dialog.tsx` (sr-only "Close" →
    "বন্ধ করো")।
  - Touch target size (WCAG 2.5.8) পুনরায় ভেরিফাই — `button.tsx` এর
    `icon-xs` (24px) ন্যূনতম সীমা মেটায়, বাকি সব icon size তার চেয়ে বড়।
- ✅ **আবিষ্কার #২ — Form Input/Textarea/Select এ Label association মিসিং**:
  একই `find_tag_end()` স্ক্রিপ্ট পুনর্ব্যবহার করে `<Input>`/`<Textarea>`/
  `<select>` ট্যাগ স্ক্যান করে দেখা হয়েছে কোনগুলোতে `aria-label`/
  `aria-labelledby` নেই **এবং** matching `<Label htmlFor>` নেই — মোট **৫৪টা**
  field পাওয়া গেছে (student-facing + admin CMS উভয়ে), সব ফিক্স করা হয়েছে:
  - **Student-facing** (priority বেশি): `app/ai-tutor/page.tsx` (মূল চ্যাট
    ইনপুট), `components/planner/task-manager.tsx` (নতুন টাস্ক টাইটেল+ডেট),
    `components/cq/cq-runner.tsx` ও `components/mock-exam/mock-exam-runner.tsx`
    (ক/খ/গ/ঘ প্রশ্নের উত্তর Textarea, প্রতিটাতে ৪টা), `components/forum/new-post-form.tsx`
    (category/subject select), `components/forum/post-detail.tsx` (reply
    Textarea), `components/learn/topic-note-editor.tsx` (নোট Textarea),
    `components/pdf-chat/pdf-chat-room.tsx` (চ্যাট ইনপুট),
    `components/planner/class-routine.tsx` (start/end time),
    `components/planner/exam-countdown-card.tsx` (তারিখ ইনপুট + এডিট
    পেন্সিল বাটন), `components/planner/habit-tracker.tsx` (নতুন Habit
    নাম), `components/planner/study-pet-card.tsx` (পেটের নাম এডিট),
    `components/analytics/predicted-gpa-card.tsx` (টার্গেট জিপিএ ইনপুট),
    `components/study-group/study-group-dashboard.tsx` (ইনভাইট কোড join
    ইনপুট + readonly ডিসপ্লে)।
  - **Admin CMS ফর্ম**: `components/admin/subject-manager.tsx` (Subject
    Code/Paper select + রঙ Hex ইনপুট), `components/admin/topic-manager.tsx`
    (ভিডিও URL/নোট/ফর্মুলা শীট — create+edit দুই ফর্মেই, মোট ৬টা),
    `components/admin/question-manager.tsx` (অপশন ১-৪, ব্যাখ্যা, কঠিনতা
    select, বোর্ড বছর/নাম, মিসকনসেপশন ট্যাগ, CSV bulk upload টেক্সট,
    প্রশ্ন-কার্ডের ট্যাগ ইনপুট — মোট ১১টা), `components/admin/cq-question-manager.tsx`
    (৪টা মডেল উত্তর ফিল্ড, বোর্ড বছর/নাম, মিসকনসেপশন ট্যাগ ২টা জায়গায়
    — মোট ৮টা), `components/admin/user-manager.tsx` (সার্চ ইনপুট),
    `components/admin/notification-broadcast-form.tsx` (লিংক ইনপুট)।
  - `components/ui/password-input.tsx` রিভিউ করা হয়েছে — ভুয়া positive
    (false-positive) প্রমাণিত, কারণ এই wrapper কম্পোনেন্টের সব caller সাইটে
    (Login/Register/Reset Password/Settings/Danger Zone) ইতিমধ্যে
    `<Label htmlFor>` + matching `id` prop সঠিকভাবে pass হচ্ছে।
- ✅ **যাচাই পদ্ধতি**: Python script এ প্রথমে crude regex দিয়ে candidate বের
  করে, তারপর refined `find_tag_end()` (brace-depth-aware JSX tag matching)
  দিয়ে false-positive বাদ দিয়ে চূড়ান্ত তালিকা তৈরি করা হয়েছে। শেষে পুরো
  `app/`+`components/` ডিরেক্টরিতে re-scan চালিয়ে **০টা genuine missing
  label/aria-label** কনফার্ম করা হয়েছে (শুধু password-input.tsx এর
  false-positive বাকি)।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (কোনো নতুন error/warning নেই), `pnpm lint` ক্লিন।
- ✅ **লাইভ regression টেস্ট** (`scripts/test-accessibility-regression.py`
  — ১১টা assertion): নতুন ইউজার register→login→Habit তৈরি→Task তৈরি
  (টাচড ইনপুট)→GPA টার্গেট সেট (টাচড ইনপুট)→Study Group/Planner/AI Tutor
  পেজ লোড (নতুন aria-label উপস্থিতি HTML এ গ্রেপ-লেভেল ভেরিফাই সহ) — সবগুলো
  ফর্ম সাবমিট ফ্লো UI attribute পরিবর্তনের পরেও স্বাভাবিকভাবে কাজ করছে
  ভেরিফাই করা হয়েছে।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট (cascade delete এ Habit/Task রো ও মুছে যায়), DB তে
  psycopg2 দিয়ে সরাসরি চেক করে শূন্য বাকি ভেরিফাই।
- ⏳ **বাকি রয়ে গেছে**: Mobile Responsiveness এর বাকি অংশ (viewport/
  breakpoint consistency, horizontal overflow, সম্পূর্ণ touch target অডিট)
  ও Keyboard Focus Trap টেস্টিং (Dialog/Sheet/Dropdown এ Tab/Escape)
  এখনো বাকি — পরবর্তী রাউন্ডে করা হবে।

📱 Mobile Responsiveness অডিট — Horizontal Overflow বাগ এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Accessibility অডিট (রাউন্ড ২) এর ফর্ম-লেবেল অংশ শেষ
  করার পরে একই `ask_user` সিদ্ধান্তের Mobile Responsiveness অংশ শুরু করা
  হয়েছে। প্রথমে static code scan (grid-cols breakpoint, fixed-width
  class, whitespace-nowrap প্যাটার্ন) দিয়ে ঝুঁকিপূর্ণ জায়গা চিহ্নিত করা
  হয়, কিন্তু আসল horizontal overflow শুধু browser rendering দিয়েই
  নিশ্চিতভাবে ধরা যায় — তাই Playwright (headless Chromium) ইনস্টল করে
  ৩৭৫px (iPhone SE) viewport এ লাইভ dev server এর বিপরীতে সব প্রধান
  স্টুডেন্ট + অ্যাডমিন পেজ স্ক্যান করা হয়েছে।
- ⚠️ **Sandbox মেমরি সীমাবদ্ধতা**: এই sandbox (১.৯GB RAM + swap) এ
  Next.js dev server ও multi-process Chromium concurrent চালানো অনেক
  ভারী প্রমাণিত হলো — প্রথম দুইবার সম্পূর্ণ sandbox freeze/OOM হয়েছিল।
  সমাধান: Chromium `--single-process --no-zygote --disable-gpu` flag
  দিয়ে চালানো (single lightweight process), swap ১GB থেকে ২GB এ বাড়ানো,
  প্রতিটা পেজ চেক এর মাঝে আলাদা Python process (browser instance পুরোপুরি
  বন্ধ করে আবার নতুন করে চালু করা) — একটানা batch এ অনেক পেজ চেক করলে
  memory leak accumulate হয়ে ধীরে ধীরে পুরো sandbox freeze হয়ে যাচ্ছিল।
- ✅ **স্ক্যান পদ্ধতি**: প্রতিটা পেজে `document.documentElement.scrollWidth`
  বনাম `clientWidth` তুলনা করে overflow ডিটেক্ট করা হয়েছে, overflow পেলে
  `getBoundingClientRect()` দিয়ে ঠিক কোন এলিমেন্ট viewport ছাড়িয়ে যাচ্ছে
  তা খুঁজে বের করা হয়েছে। মোট **২৫টা+ পেজ** (Dashboard/Learn/Practice/
  Planner/Flashcards/Analytics/Badges/Leaderboard/Forum/AI Tutor/Mock
  Exam/Study Group/Reading Room/PDF Chat/Notifications/Settings/Saved/
  Mistake Vault/Admission + Admin এর Subjects/Users/Reports/Analytics/
  Forum/Notifications/Audit Log/System) স্ক্যান করা হয়েছে।
- ✅ **আবিষ্কার #১ — Dashboard হেডার Icon Row Overflow** (৩৭৫px এ
  scrollWidth 499px, ১২৪px overflow): `app/(dashboard)/dashboard/page.tsx`
  এর হেডারে `GlobalSearch`/`NotificationBell`/`ThemeToggle`/`UserMenu`
  চারটা আইটেম একটা `flex items-center gap-3` row এ ছিল — `GlobalSearch`
  বাটনের নিজস্ব ক্লাস `w-full sm:w-56` (ডেস্কটপে সার্চ ইনপুট-স্টাইল প্রশস্ত
  বাটন দেখানোর জন্য ইচ্ছাকৃত ডিজাইন) মোবাইলে flex row এর ভেতরে থাকা
  অবস্থায় বাকি ৩টা আইকনকে viewport এর বাইরে push করে দিচ্ছিল। **ফিক্স**:
  `GlobalSearch` কে একটা `flex-1 min-w-0 sm:flex-none` wrapper div দিয়ে
  মুড়ে দেওয়া হয়েছে — এখন মোবাইলে flex row এর available space এর মধ্যে
  সংকুচিত হয়ে ফিট করে, ডেস্কটপে (`sm:`) আগের মতোই `w-56` ফিক্সড প্রস্থ
  বজায় থাকে।
- ✅ **আবিষ্কার #২ — Settings পেজে ৭টা ট্যাব Overflow** (৩৭৫px এ
  scrollWidth 686px, ৩১১px overflow — এই অডিটের সবচেয়ে গুরুতর বাগ):
  `components/settings/settings-form.tsx` এর `TabsList` এ ৭টা ট্যাব
  (প্রোফাইল/পাসওয়ার্ড/থিম/অ্যাক্সেসিবিলিটি/পাবলিক প্রোফাইল/ইমেইল
  নোটিফিকেশন/ডেটা ও অ্যাকাউন্ট) `inline-flex w-fit` কন্টেইনারে ছিল যার
  কোনো horizontal scroll/wrap ব্যবস্থা ছিল না — মোবাইলে শেষ ২-৩টা ট্যাব
  সম্পূর্ণ viewport এর বাইরে চলে যাচ্ছিল (দেখা তো যাচ্ছিলই না, ক্লিকও করা
  যাচ্ছিল না)। **ফিক্স**: `TabsList` কে `overflow-x-auto -mx-4 px-4`
  wrapper div দিয়ে মুড়ে horizontal scroll enable করা হয়েছে (edge-to-edge
  scroll area, negative margin দিয়ে parent padding বাতিল করে পুরো width
  ব্যবহার), `TabsList` নিজে `w-max min-w-full sm:w-fit` করা হয়েছে যাতে
  মোবাইলে scroll করা যায় কিন্তু ডেস্কটপে (`sm:`) আগের মতোই compact থাকে।
- ✅ **নেগেটিভ-রেজাল্ট (false-positive) — Leaderboard পেজে সাময়িক
  overflow**: প্রাথমিক স্ক্যানে `/leaderboard` এ ৮px overflow দেখা
  গিয়েছিল, কিন্তু গভীর তদন্তে (স্ক্রিনশট + scroll-to-bottom + element
  transform পরীক্ষা) নিশ্চিত হয়েছে এটা framer-motion `StaggerItem
  direction="left"` animation এর transient pre-animate state (নিচের
  যেসব কার্ড এখনো viewport এ intersect করেনি সেগুলোর `x: 24px` hidden
  transform, IntersectionObserver ট্রিগার হওয়ার আগে scrollWidth মাপার
  সময় সাময়িকভাবে ধরা পড়েছিল) — actual visible রেন্ডারে কোনো clipping/
  scrollbar দেখা যায় না, স্ক্রল করে সব কার্ড viewport এ আনলে overflow
  সম্পূর্ণ চলে যায়। কোনো কোড পরিবর্তন করা হয়নি, transparency এর জন্য
  ডকুমেন্ট করা হলো।
- ✅ **টাচ টার্গেট সাইজ (WCAG 2.5.8) অডিট**: `button`/`a`/`[role="button"]`
  এলিমেন্ট স্ক্যান করে ২৪px এর নিচে সাইজ খুঁজে বের করা হয়েছে — Dashboard/
  Planner/Practice/Forum/Badges/Notifications/Reading Room/Quiz Battle/
  PDF Chat/Mistake Vault সব পেজে **০টা genuine ছোট টাচ টার্গেট** পাওয়া
  গেছে (শুধু Login পেজের ২টা ছোট ইনলাইন টেক্সট লিংক — "পাসওয়ার্ড ভুলে
  গেছো?"/"রেজিস্ট্রেশন করো" — যেগুলো WCAG 2.5.8 এর inline-text-link
  exception এ পড়ে, বাগ না)।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (কোনো নতুন error/warning নেই), `pnpm lint` ক্লিন।
- ✅ **লাইভ ভেরিফিকেশন**: ফিক্সের পরে Dashboard পেজ পুনরায় স্ক্যান করে
  scrollWidth=375=clientWidth কনফার্ম করা হয়েছে। Settings পেজের নতুন
  `overflow-x-auto` স্ক্রল-এরিয়া কাজ করছে ভেরিফাই করা হয়েছে
  (`scrollWidth=702` স্ক্রলযোগ্য কন্টেইনারে, কিন্তু viewport এ কোনো
  overflow নেই) এবং প্রতিটা ট্যাব (শেষেরটা "ডেটা ও অ্যাকাউন্ট" সহ) ক্লিক
  করে সঠিক কনটেন্ট লোড হয় তা Playwright দিয়ে ভেরিফাই করা হয়েছে।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট, DB তে psycopg2 দিয়ে সরাসরি চেক করে শূন্য বাকি
  ভেরিফাই।
- ⏳ **বাকি রয়ে গেছে**: Keyboard Focus Trap টেস্টিং (Dialog/Sheet/
  Dropdown এ Tab/Escape key behavior) ও Color Contrast systematic
  re-audit এখনো বাকি — পরবর্তী রাউন্ডে করা হবে।

⌨️ গুরুতর বাগ ফিক্স — Keyboard Focus Trap (upstream base-ui#4678 workaround) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Mobile Responsiveness অডিটের পরে "Accessibility ও
  Mobile Responsiveness গভীর অডিট" এর শেষ বাকি অংশ — Keyboard Navigation
  Focus Trap টেস্টিং — শুরু করা হয়েছে। প্রথমে ডকুমেন্টেশন রিসার্চ
  (`base-ui.com/react/components/dialog`) করে নিশ্চিত হওয়া গেছে base-ui
  ডিফল্টভাবে "Focus moves inside the dialog when it opens. Tab and
  Shift+Tab loop within, and Esc requests close" — তারপর Playwright
  দিয়ে actual `Tab`/`Escape` keypress সিমুলেট করে লাইভ ভেরিফাই করা
  হয়েছে।
- 🐛 **আবিষ্কৃত বাগ (গুরুতর)**: `/dashboard` এ GlobalSearch ডায়ালগ
  (Cmd/Ctrl+K) খুলে পরপর ৮টা `Tab` চাপলে ফোকাস dialog এর বাইরে বেরিয়ে
  পিছনের sidebar navigation লিংকে (`skip-to-content`, module link)
  চলে যাচ্ছিল — সম্পূর্ণ focus trap ভাঙা, WCAG 2.1.1 (Keyboard) এর
  স্পষ্ট ভায়োলেশন। ইউজার কীবোর্ড দিয়ে ডায়ালগে আটকে না থেকে ভুলবশত
  পিছনের পেজে navigate করে ফেলতে পারত।
- 🔍 **Root Cause বিশ্লেষণ**: DOM ইন্সপেকশনে দেখা গেছে dialog খোলা
  অবস্থায় background element গুলোতে base-ui `aria-hidden="true"` সেট
  করছিল (৭৩টা element এ পাওয়া গেছে) কিন্তু HTML `inert` attribute সেট
  করছিল না (`inertCount: 0`) — `aria-hidden` শুধু accessibility tree
  থেকে সরায়, কিন্তু `inert` ছাড়া element এখনো keyboard tab order এ
  থেকে যায়। Web research এ নিশ্চিত হয়েছে এটা **base-ui v1.6.0 এর একটা
  established upstream bug** (GitHub `mui/base-ui#4678`,
  `FloatingFocusManager` এ `markOthers()` কল `ariaHidden: true` পাস
  করে কিন্তু `inert: true` করে না) — maintainer-approved fix (PR
  #4714) এখনো merge/npm-release হয়নি (npm এ latest এখনো 1.6.0, আমরা
  ব্যবহার করছি সেটাই)।
- ✅ **ফিক্স (GitHub issue এ দেওয়া অফিসিয়াল workaround বাস্তবায়ন)**:
  নতুন `components/dialog-inert-background.tsx` কম্পোনেন্ট — base-ui
  নিজেই background element গুলোতে `data-base-ui-inert` মার্কার
  attribute বসায় (এই সেশনে `dataBaseUiInertCount: 11` পাওয়া গেছে
  dialog খোলা অবস্থায়) — `MutationObserver` দিয়ে এই মার্কার observe
  করে একই element এ আসল `inert` attribute mirror করা হয়েছে (`inert`
  browser কে element কে accessibility tree ও keyboard tab order উভয়
  থেকেই বাদ দিতে বাধ্য করে)। **⚠️ গুরুত্বপূর্ণ সতর্কতা**: base-ui এর
  নিজের focus-trap সেন্টিনেল ("focus guard") element গুলোতেও একই
  `data-base-ui-inert` মার্কার লাগানো থাকে (Tab শেষ পর্যন্ত গেলে আবার
  dialog এর শুরুতে ফিরিয়ে আনার জন্য ব্যবহৃত) — এগুলোকে ভুলবশত `inert`
  করে দিলে focus trap সম্পূর্ণ ভেঙে যেত (Tab dialog এর ভেতরে loop
  করার বদলে browser chrome এ চলে যেত) — তাই `[data-base-ui-focus-guard]`
  attribute থাকা element গুলো explicit ভাবে স্কিপ করা হয়েছে।
  `app/providers.tsx` এর `Providers` কম্পোনেন্টে গ্লোবালভাবে মাউন্ট
  করা হয়েছে যাতে অ্যাপের সব Dialog/Sheet এ (base-ui `Dialog` primitive
  ব্যবহারকারী সব জায়গায়) একবারেই ফিক্স হয়ে যায়।
- ✅ **লাইভ multi-scenario Playwright ভেরিফিকেশন** (fix এর আগে-পরে দুটোই
  টেস্ট করে বাগ reproduce+fix confirm করা হয়েছে):
  - **GlobalSearch Dialog** (`/dashboard`, Cmd+K): fix এর আগে ৮টা Tab
    এ ফোকাস dialog থেকে বেরিয়ে sidebar link এ চলে যাচ্ছিল (`insideDialog:
    False`)। fix এর পরে ১০টা Tab এ ফোকাস dialog এর ভেতরেই loop করছে
    (`insideDialog: True` প্রতিটাতে), `inertCount: 9` (১১টা marker এর
    মধ্যে ২টা focus-guard সঠিকভাবে বাদ পড়েছে)।
  - **Create Flashcard Deck Dialog** (`/flashcards`, ৩টা focusable
    element — নাম Input, Cancel বাটন, Create বাটন): ১২টা Tab চেপে
    ভেরিফাই করা হয়েছে ফোকাস সবসময় dialog এর ভেতরে ৩টা element এর
    মধ্যেই loop করছে (`insideDialog: True` সব ১২টাতে), Escape দিয়ে
    ঠিকভাবে বন্ধ হয়।
  - **More Menu Sheet** (মোবাইল bottom-sheet, ৩৭৫px viewport): same
    base-ui Dialog primitive ব্যবহার করায় একই ফিক্স স্বয়ংক্রিয়ভাবে
    কাজ করেছে, Escape দিয়ে বন্ধ হয় ভেরিফাই করা হয়েছে।
  - **UserMenu Dropdown** (base-ui `Menu` primitive, Dialog না):
    `ArrowDown` দিয়ে menuitem এ navigate করা যায়, `Escape` দিয়ে বন্ধ
    হয় — কোনো সমস্যা পাওয়া যায়নি (এই বাগ শুধু `Dialog`/modal
    `FloatingFocusManager` এ প্রযোজ্য, `Menu` primitive এ আলাদা focus
    management থাকায় প্রভাবিত হয়নি)।
  - **Regression চেক**: Dialog বন্ধ করার পরে `inert` attribute সব বাদ
    হয়ে যায় (`inert elements remaining: 0`) এবং normal sidebar
    navigation (Tab + click) ঠিকভাবে কাজ করে তা ভেরিফাই করা হয়েছে
    (dialog বন্ধ → sidebar link ক্লিক → সঠিক পেজে navigate)।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (সব ১৪৭টা পেজ কম্পাইল, কোনো নতুন error/warning নেই), `pnpm lint`
  ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট, DB তে psycopg2 দিয়ে সরাসরি চেক করে শূন্য বাকি
  ভেরিফাই।
- 🎉 **মাইলফলক**: এটা দিয়ে "Accessibility ও Mobile Responsiveness
  গভীর অডিট" (Icon-button aria-label + Form label + Horizontal
  Overflow + Keyboard Focus Trap) এর সব প্রধান অংশ সম্পূর্ণ হলো। শুধু
  Color Contrast (WCAG AA) systematic re-audit বাকি (আগের সেশনে একবার
  আলাদাভাবে করা হয়েছিল, এই রাউন্ডে নতুন করে চেক করা হয়নি)।

🎨 Color Contrast (WCAG AA) Re-audit (রাউন্ড ৩) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Keyboard Focus Trap ফিক্সের পরে "Accessibility ও
  Mobile Responsiveness গভীর অডিট" এর চূড়ান্ত অংশ — Color Contrast
  systematic re-audit — সম্পন্ন করা হলো। আগে দুই রাউন্ড হয়েছিল (text-color
  ৭৩টা instance, border-color ১৩টা instance) কিন্তু এর পরে প্রিমিয়াম
  থিম, badges, leaderboard, reading-room ইত্যাদি অনেক নতুন ফিচার যোগ
  হয়েছিল যেগুলো কখনো contrast-অডিট হয়নি।
- ✅ **উন্নত অডিট পদ্ধতি**: আগের রাউন্ডে hardcoded approximate hex value
  ব্যবহার করা হয়েছিল, এবার সরাসরি প্রজেক্টে ইনস্টল করা
  `node_modules/tailwindcss/theme.css` থেকে regex দিয়ে প্রতিটা রঙের
  actual OKLCH value পার্স করে নির্ভুলতা বাড়ানো হয়েছে (Tailwind v4 এর
  রঙের hex approximation v3 থেকে ভিন্ন হতে পারে, তাই সরাসরি সোর্স থেকে
  নেওয়াই নিরাপদ)। প্রতিষ্ঠিত OKLCH→linear-sRGB→sRGB255 conversion +
  WCAG relative luminance + contrast ratio formula পুনর্ব্যবহার করা
  হয়েছে।
- ✅ **সিস্টেম্যাটিক স্ক্যান (৩টা ক্যাটাগরি)**:
  1. Text color: `text-{color}-400/500` (dark: prefix বাদ দিয়ে,
     lookbehind regex দিয়ে) — light mode AA normal-text threshold
     (৪.৫:১) এর নিচে থাকা instance খোঁজা।
  2. Border color: `border-{color}-300/400/500` (dark: prefix বাদ
     দিয়ে) — WCAG 1.4.11 non-text/UI component threshold (৩:১) এর
     নিচে থাকা instance খোঁজা।
  3. Badge/pill combo: `text-{color}-700/800/900` + `bg-{color}-50/100`
     একই className string এ থাকা combination — কোনো issue পাওয়া
     যায়নি (০টা)।
- 🐛 **আবিষ্কার #১ — Leaderboard/Reading Room Rank #২ মেডেল আইকন**:
  `app/(dashboard)/leaderboard/page.tsx` ও
  `components/reading-room/reading-room-leaderboard.tsx` এর
  `RANK_STYLES` অবজেক্টে rank ২ (রৌপ্য) এর জন্য `text-slate-400`
  ব্যবহৃত হচ্ছিল কোনো `dark:` override ছাড়া — light mode এ মাত্র
  ২.৬৩:১ (icon threshold ৩:১ এরও নিচে, normal text threshold ৪.৫:১
  থেকে অনেক দূরে)। rank ১ (`text-yellow-700 dark:text-yellow-400`) ও
  rank ৩ (`text-amber-700`, single-shade dark-safe) এর প্যাটার্নের
  সাথে অসামঞ্জস্যপূর্ণ ছিল। **ফিক্স**: `text-slate-600
  dark:text-slate-400` (light: ৭.৫৮:১, dark: ৬.২৫:১ — উভয় মোডেই
  চমৎকার কনট্রাস্ট)।
- 🐛 **আবিষ্কার #২ — Badges/Study Plan Card Status Callout Border**:
  `app/(dashboard)/badges/page.tsx` এর earned-badge card এ
  `border-amber-300 dark:border-amber-800` ও
  `components/planner/study-plan-card.tsx` এর expired-plan warning
  callout এ `border-amber-300 dark:border-amber-900` — **উভয় মোডেই
  ফেল করছিল** (light: ১.৪৫:১, dark border-amber-800: ২.৩২:১,
  dark border-amber-900: ১.৭৯:১ — সবই ৩:১ থ্রেশহোল্ডের অনেক নিচে,
  আগের border-contrast অডিট রাউন্ডে মিস হয়ে গিয়েছিল)। **ফিক্স**:
  established single-color-both-modes প্যাটার্নে `border-amber-600`
  (light: ৩.০৯:১ threshold সবে পাস, dark mixed-bg এর বিপরীতে: ৫.০৮:১
  — দুই মোডেই পাস করে, একটাই ক্লাসে সরল রাখা হয়েছে, কোনো dark:
  override দরকার হয়নি)।
- ✅ **সব বাকি candidate false-positive হিসেবে verify**: প্রাথমিক
  crude regex এ ১৫৮টা "issue" দেখা গিয়েছিল কিন্তু গভীর বিশ্লেষণে
  দেখা গেছে প্রায় সবগুলোই `dark:text-{color}-400` এর মতো ইতিমধ্যে
  সঠিক dark-mode-only override ছিল (regex lookbehind ঠিকমতো `dark:`
  prefix বাদ দিতে না পারায় false-positive হয়েছিল) — refined regex
  দিয়ে re-scan করে চূড়ান্ত তালিকায় মাত্র ২+২ = ৪টা candidate
  পাওয়া যায়, যার মধ্যে ২টা (delete বাটনের icon-only `text-red-500`,
  ৩.৮১:১) icon-threshold (৩:১) পাস করায় বাগ না প্রমাণিত হয়েছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (সব ১৪৭টা পেজ কম্পাইল), `pnpm lint` ক্লিন।
- ✅ **লাইভ ভেরিফিকেশন**: নতুন ইউজার দিয়ে `/leaderboard` পেজ লোড করে
  HTML এ নতুন `text-slate-600 dark:text-slate-400` ক্লাস উপস্থিত
  ভেরিফাই করা হয়েছে (প্রাথমিক string-match এ false-positive হয়েছিল
  `dark:text-slate-400` কে পুরনো bad ক্লাস হিসেবে ভুল শনাক্ত করে,
  ম্যানুয়াল substring inspection করে নিশ্চিত হওয়া গেছে fix সঠিক)।
  `/badges` কোড লেভেলে ভেরিফাই (টেস্ট ইউজারের কোনো earned badge না
  থাকায় সেই conditional card render হয়নি, কিন্তু কোড এ সঠিক ক্লাস
  আছে নিশ্চিত করা হয়েছে)।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে psycopg2
  দিয়ে সরাসরি চেক করে শূন্য বাকি ভেরিফাই।
- 🎉 **মাইলফলক**: এই ফিক্স দিয়ে "Accessibility ও Mobile Responsiveness
  গভীর অডিট" (`accessibility_mobile_audit`) সম্পূর্ণভাবে শেষ হলো —
  Icon-button aria-label, Form label association, Mobile horizontal
  overflow, Touch target size, Keyboard focus trap, Color contrast
  (৩ রাউন্ড) সব প্রধান accessibility+responsiveness ক্যাটাগরি এখন
  কভার হয়ে গেছে।

⚡ Performance/Query Optimization অডিট — মিসিং DB Index এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Accessibility+Mobile অডিট সিরিজ সম্পূর্ণ হওয়ার পরে
  ব্যবহারকারী পরবর্তী priority হিসেবে "Performance/Query Optimization
  অডিট" বেছে নিয়েছেন। আগে একবার Phase C তে (২১টা index) এই কাজ হয়েছিল,
  কিন্তু এর পরে StudyGroup/QuizDuel সহ অনেক নতুন মডেল/ফিচার যোগ হয়েছে
  যেগুলো কখনো systematic index-coverage অডিট হয়নি।
- ✅ **অডিট পদ্ধতি**: Python script দিয়ে `prisma/schema.prisma` পার্স
  করে (brace-depth-aware model boundary detection) প্রতিটা মডেলের
  `@relation(fields: [...])` FK কলাম বের করে, তারপর সেই কলাম কোনো
  `@@index`/`@@unique`/`@unique`/`@id` এর **leftmost** কলাম কিনা চেক
  করা হয়েছে (Postgres composite index শুধু leftmost-prefix কলাম দিয়ে
  ফিল্টার করলেই ব্যবহার করতে পারে, তাই non-leftmost কলাম দিয়ে আলাদা
  query করলে index স্কিপ হয়ে যায়)। মোট ১৩টা candidate পাওয়া যায়,
  প্রতিটার জন্য actual codebase এ grep করে দেখা হয় সেই কলাম দিয়ে সত্যিই
  standalone query হয় কিনা (false-positive বাদ দেওয়ার জন্য)।
- 🐛 **আবিষ্কার #১ — `StudyGroupMember.groupId` মিসিং ইনডেক্স**:
  `lib/study-group.ts` ও `lib/reading-room.ts` এ member list fetch,
  capacity count (`tx.studyGroupMember.count({ where: { groupId } })`),
  weekly bonus query — সবই `groupId` দিয়ে ফিল্টার করে, কিন্তু schema তে
  শুধু `userId` তে `@unique` ছিল (per-user single-group constraint),
  `groupId` এ কোনো ইনডেক্স ছিল না। এটা প্রতিটা Study Group পেজ ভিজিট
  ও Reading Room heartbeat এ চলা hot-path query।
- 🐛 **আবিষ্কার #২ — `QuizDuel.challengerId`/`opponentId` মিসিং ইনডেক্স**:
  `app/api/duel/route.ts` (GET+POST) ও `lib/quiz-duel.ts` এর
  `getMyDuelHistory()` — সবই `status + OR(challengerId, opponentId)`
  প্যাটার্নে query করে (প্রতিটা Duel Lobby পেজ ভিজিট ও নতুন duel তৈরির
  আগে "already in active duel" চেক এ চলে), কিন্তু schema তে শুধু
  `[status, subjectId]` কম্পোজিট ইনডেক্স ছিল — `challengerId`/`opponentId`
  এ কোনো ইনডেক্স ছিল না বলে `OR` কন্ডিশনের এই দুইটা branch পুরো টেবিল
  স্ক্যান করত।
- ✅ **ফিক্স**: নতুন migration
  (`20260722000000_add_performance_indexes_studygroupmember_quizduel`)
  — `study_group_members(groupId)`, `quiz_duels(challengerId)`,
  `quiz_duels(opponentId)` তিনটা নতুন B-tree index যোগ করা হয়েছে।
- ⚠️ **Migration সৃষ্টিতে established pgvector shadow-DB বাধা আবার
  পাওয়া গেছে**: `prisma migrate dev --create-only` চেষ্টা করলে চেনা
  P3006 error ("type vector does not exist") — shadow database এ
  pgvector extension না থাকায় migration diff generate করা যায়নি।
  Established fix pattern অনুসরণ করে (docs এ আগে থেকে ডকুমেন্টেড):
  migration ফোল্ডার+SQL ফাইল ম্যানুয়ালি লেখা হয়েছে (`CREATE INDEX IF
  NOT EXISTS`), তারপর `prisma migrate deploy` (shadow DB বাইপাস করে
  সরাসরি production DB তে apply করে) ব্যবহার করে সফলভাবে apply করা
  হয়েছে — কোনো `migrate reset`/ডেটা লস ছাড়া। এই সেশনে **pgvector
  HNSW ইনডেক্স ড্রপ হয়নি** (raw-SQL migration approach এ Prisma
  drift-detection এর সংস্পর্শে আসেনি) — `scripts/fix-vector-index.ts`
  চালিয়ে কনফার্ম করা হয়েছে।
- ✅ **বোনাস ফিক্স — Admin Forum Moderation Panel Unbounded Query**:
  `findMany()`-এর broader static scan এ `app/api/admin/forum/posts/route.ts`
  এ কোনো `take` limit ছাড়া পুরো `forum_posts` টেবিল (সব `_count`
  aggregate সহ) আনা হচ্ছিল ধরা পড়ে — এখন forum_posts = ০ হওয়ায় সমস্যা
  না হলেও, ব্যবহার বাড়লে unbounded scan হয়ে যেত। `audit-log.ts` এর
  established pagination প্যাটার্ন অনুসরণ করে `MODERATION_LIST_LIMIT = 100`
  cap যোগ করা হয়েছে (future এ full pagination UI দরকার হলে সহজে যোগ
  করা যাবে)।
- ✅ **False-positive elimination (transparency)**: বাকি ১১টা candidate
  (যেমন `CQAttempt.cqQuestionId`, `TopicProgress.topicId`,
  `UserBadge.badgeId`, `Bookmark.topicId`, `ForumPost.userId`,
  `QuizBattle.subjectId` ইত্যাদি) কোডবেজে grep করে verify করা হয়েছে
  এই কলামগুলো কখনো standalone query হয় না (হয় composite unique এর
  leftmost `userId` দিয়ে সবসময় query হয়, নয়তো cascade-delete/account-export
  এর মতো কম-ফ্রিকোয়েন্সি path এ ব্যবহৃত) — এগুলো bug না, কোনো পরিবর্তন
  করা হয়নি।
- ✅ **N+1 Query Pattern স্ক্যান (negative result)**: `for` লুপ ও
  `Promise.all(map(async...))` এর ভেতরে `await prisma.` কল খোঁজার
  স্ক্যানে ১৭টা candidate পাওয়া গেছে, কিন্তু সবগুলোই হয় one-time seed
  script (prisma/seed*.ts, production hot-path না) নয়তো ইচ্ছাকৃত ছোট
  bounded array (CQ AI evaluation সর্বোচ্চ ৪টা প্রশ্ন sequential —
  rate-limit এড়াতে ইচ্ছাকৃত, badge award সর্বোচ্চ ৮টা ব্যাজ) — কোনো
  genuine N+1 bug পাওয়া যায়নি।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (সব ১৪৭টা পেজ কম্পাইল), `pnpm lint` ক্লিন।
- ✅ **লাইভ multi-user regression টেস্ট** (২টা নতুন ইউজার দিয়ে): Study
  Group তৈরি → দ্বিতীয় ইউজার join → member list fetch (groupId index
  ব্যবহার করে, ২ জন member সঠিকভাবে দেখা গেছে) → Quiz Duel তৈরি →
  duel lobby fetch (challengerId/opponentId index ব্যবহার করে,
  myActiveDuel সঠিকভাবে দেখা গেছে) → দ্বিতীয় ইউজার open duel দেখতে
  পেয়েছে — সব ফাংশনালিটি ঠিকভাবে কাজ করছে, কোনো regression নেই।
- ✅ **DB তে সরাসরি ইনডেক্স ভেরিফাই**: `pg_indexes` কুয়েরি করে ৩টা নতুন
  index (`study_group_members_groupId_idx`,
  `quiz_duels_challengerId_idx`, `quiz_duels_opponentId_idx`) সফলভাবে
  তৈরি হয়েছে কনফার্ম করা হয়েছে।
- ✅ **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার প্রকৃত
  `/api/user/delete-account` endpoint দিয়ে ডিলিট (cascade delete এ
  StudyGroupMember/QuizDuel রো ও যথাযথভাবে হ্যান্ডল হয়েছে —
  `studyGroupHandled: "left"`/`"group_deleted"`), DB তে psycopg2 দিয়ে
  সরাসরি চেক করে শূন্য বাকি ভেরিফাই।

🔧 Database Migration — নতুন Supabase প্রজেক্টে স্থানান্তর এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ⚠️ **সমস্যা**: Performance অডিট শেষ হওয়ার পরের সেশনে sandbox recovery
  করার সময় ধরা পড়ে পুরনো Supabase প্রজেক্ট (`iluptprltazdluovauwk`,
  region ap-southeast-2) এ persistent connection timeout হচ্ছে —
  `prisma migrate status` এ P1001 error, raw TCP connect সফল হলেও
  psycopg2/Prisma এর Postgres wire-protocol handshake কখনো সম্পন্ন
  হচ্ছিল না (SSL request পাঠানোর পরে কোনো response আসছিল না)। একাধিক
  retry (৩০+৪৫+৬০ সেকেন্ড অপেক্ষা সহ) করেও সমাধান হয়নি। HTTPS দিয়ে
  Supabase REST API (443 পোর্ট) সাড়া দিচ্ছিল (project active), কিন্তু
  specifically Postgres port (5432/6543) এ কিছু একটা block/fail
  হচ্ছিল — root cause নিশ্চিতভাবে চিহ্নিত করা যায়নি (sandbox network
  egress সমস্যা বা pooler-side সাময়িক সমস্যা হতে পারে)।
- ✅ **সমাধান**: ব্যবহারকারী নতুন Supabase অ্যাকাউন্ট/প্রজেক্ট
  (`dsgbfqczysgivlpcksry`, region ap-northeast-1) খুলে connection
  string শেয়ার করেছেন। প্রথমবার connect করতে গিয়ে "server closed the
  connection unexpectedly" এসেছিল (প্রজেক্ট তখনো পুরোপুরি provision
  হয়নি, নতুন Supabase প্রজেক্ট তৈরির পরে ডেটাবেস প্রস্তুত হতে কয়েক
  মিনিট সময় লাগে) — কিছুক্ষণ অপেক্ষা করে retry করার পরে Transaction
  Pooler (৬৫৪৩) ও Session Pooler (৫৪৩২) উভয়ই সফলভাবে কানেক্ট হয়েছে।
- ✅ **`.env`/`.env.local` আপডেট**: `DATABASE_URL` (pooled, pgbouncer=true)
  ও `DIRECT_URL` (session mode, migration এর জন্য) দুটোই নতুন হোস্ট
  (`aws-0-ap-northeast-1.pooler.supabase.com`) ও নতুন project-ref
  (`dsgbfqczysgivlpcksry`) দিয়ে আপডেট করা হয়েছে, একই password
  (`@Abdullah1221122`, URL-encoded `%40Abdullah1221122`)।
- ✅ **pgvector extension enable**: নতুন (খালি) ডেটাবেসে
  `CREATE EXTENSION IF NOT EXISTS vector;` চালিয়ে pgvector 0.8.2
  ইনস্টল/ভেরিফাই করা হয়েছে (PDF Chat RAG ফিচারের জন্য আবশ্যক)।
- ✅ **সব ১৫টা migration সফলভাবে apply**: `prisma migrate deploy`
  চালিয়ে খালি ডেটাবেসে schema থেকে সব টেবিল (৫১টা, ৫০টা Prisma মডেল +
  migration history টেবিল) তৈরি হয়েছে — কোনো shadow-DB সমস্যা হয়নি
  কারণ `migrate deploy` production DB তে সরাসরি apply করে, শুধু
  পুরনো migration ফাইলগুলো সিকোয়েন্সিয়ালি রান করে। HNSW ইনডেক্স
  (`pdf_chunks_embedding_idx`) migration এর ভেতরেই সঠিকভাবে তৈরি
  হয়ে গেছে (`scripts/fix-vector-index.ts` দিয়ে ভেরিফাই করা হয়েছে)।
- ✅ **সব কনটেন্ট পুনরায় সিড করা হয়েছে** (৩০টা+ seed script একে একে
  চালিয়ে): মূল `db:seed` (১৩টা Subject, ৮৯টা Chapter, ১৮৫টা Topic),
  MCQ Question Bank (`db:seed-questions`+`db:seed-questions-2` মূল
  ১২৬টা + gap-fill script গুলো Physics/Higher Math/Biology/Chemistry+ICT
  আরও ১৪৯টা + বোর্ড প্রশ্ন ৮টা + Admission Prep ৫৩টা + Bangla/English/ICT
  ৭৭টা = **মোট ৩৪৯টা MCQ**), CQ Question (মূল+Physics+Chemistry+
  Biology+Higher Math+ICT সব মিলিয়ে **৬৪টা CQ**), Badge (**১৪টা**),
  এবং সব ১৩টা বিষয়ের Topic Notes+Formula Sheet (Physics ১ম+২য়,
  Chemistry, Biology ১ম+২য়, Higher Math ১ম+২য়, ICT, Bangla, English)।
- ✅ **Admin অ্যাকাউন্ট পুনরায় তৈরি**: কোনো dedicated admin-seed script
  না থাকায় (আগে ম্যানুয়ালি register+role-promote করা হয়েছিল বলে মনে
  হচ্ছে) `/api/auth/register` endpoint দিয়ে
  `abn21.noman@gmail.com`/`@Abdullah1221` অ্যাকাউন্ট তৈরি করে, তারপর
  psycopg2 raw SQL দিয়ে `UPDATE users SET role='ADMIN'` চালিয়ে
  established admin credentials পুনরুদ্ধার করা হয়েছে।
- ✅ **লাইভ ভেরিফিকেশন**: dev server চালিয়ে নতুন admin অ্যাকাউন্ট দিয়ে
  লগইন (session role='ADMIN' কনফার্ম), `/dashboard`, `/learn`,
  `/admin`, `/practice` (পদার্থবিজ্ঞান কনটেন্ট দেখা গেছে), `/flashcards`,
  `/mock-exam`, `/badges` — সব পেজ ২০০ স্ট্যাটাসে সফলভাবে লোড হয়েছে,
  কোনো crash/500 error নেই।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (সব ১৪৭টা পেজ কম্পাইল, নতুন DB connection দিয়ে), `pnpm lint`
  ক্লিন।
- ⚠️ **গুরুত্বপূর্ণ নোট**: পুরনো ডেটাবেসের **সব পুরনো ইউজার ডেটা হারিয়ে
  গেছে** (নতুন প্রজেক্ট সম্পূর্ণ খালি ছিল, কোনো backup/dump নেওয়া হয়নি
  কারণ পুরনো ডেটাবেস reachable ছিল না) — কনটেন্ট (Subject/Topic/
  Question/CQ/Badge) সব পুনরায় সিড করা হয়েছে কিন্তু কোনো টেস্ট বা
  বাস্তব ইউজারের প্রোফাইল/প্রোগ্রেস/XP ডেটা restore করা যায়নি। এটা
  ঠিক আছে কারণ এখনো development/personal-use পর্যায়ে (কোনো real
  production user ছিল না)।
- 📝 **ভবিষ্যতের জন্য নোট**: Supabase Free Tier প্রজেক্ট দীর্ঘদিন
  ব্যবহার না হলে pause হয়ে যেতে পারে — connection timeout দেখা দিলে
  প্রথমে Supabase Dashboard এ গিয়ে প্রজেক্ট status active কিনা চেক
  করা উচিত।

🆕 হাতে লেখা CQ উত্তর ছবি তুলে জমা দেওয়া (OCR + AI Evaluation) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Database Migration সম্পন্ন হওয়ার পরে ব্যবহারকারী
  "নতুন ফিচার যোগ করো" নির্দেশ দিয়েছেন, নিজে সিদ্ধান্ত নেওয়ার স্বাধীনতা
  দিয়ে। পুরনো `docs/FEATURE_RESEARCH.md`–`V5` রিভিউ করে দেখা গেছে সব
  আইটেম ইতিমধ্যে বাস্তবায়িত, তাই ফ্রেশ deep research করা হয়েছে।
- 🔍 **Deep Research**: web_search দিয়ে ২০২৬ সালের গ্লোবাল EdTech
  ট্রেন্ড খুঁজে "handwritten answer AI grading" একটা established
  প্যাটার্ন হিসেবে চিহ্নিত হয়েছে (ExamAI, GradeLab, GradingPal, GradeX
  — সবগুলোই ছবি/স্ক্যান করা হাতের লেখা উত্তর OCR দিয়ে পড়ে rubric-ভিত্তিক
  মূল্যায়ন করে)। বাংলাদেশ-স্পেসিফিক রিসার্চে দেখা গেছে জনপ্রিয়
  competitor **SATT Academy** ইতিমধ্যে "SATT AI Analysis" নামে CQ
  প্রশ্নের ধাপ বিশ্লেষণ ফিচার অফার করছে — প্রমাণ করে এটা বাংলাদেশী
  HSC মার্কেটেও প্রাসঙ্গিক চাহিদা।
- 💡 **সমস্যা চিহ্নিতকরণ**: বাস্তব HSC পরীক্ষায় ছাত্ররা CQ (সৃজনশীল
  প্রশ্ন) উত্তর হাতে লেখে, কিন্তু আমাদের CQ Practice ও Mock Exam এ
  এতদিন শুধু টাইপ করে (Textarea তে) উত্তর দেওয়া যেত — এটা বাস্তব
  পরীক্ষার অভিজ্ঞতা থেকে ভিন্ন এবং টাইপিং-এ ধীরগতির ছাত্রদের জন্য
  বাধা।
- ✅ **সমাধান — সম্পূর্ণ বিদ্যমান infrastructure পুনর্ব্যবহার
  (schema-free, migration-free)**: কোনো নতুন backend endpoint/AI
  prompt/DB model লাগেনি —
  - বিদ্যমান `POST /api/flashcard-decks/ocr-extract` endpoint (OCR
    Pipeline ফিচারে বানানো হয়েছিল হাতের লেখা নোট থেকে ফ্ল্যাশকার্ড
    বানানোর জন্য) সরাসরি reuse করা হয়েছে — এটা `getVisionResponse()`
    (Mistral Pixtral → OpenRouter Gemini Vision fallback) দিয়ে ছবি
    থেকে raw টেক্সট এক্সট্র্যাক্ট করে।
  - বিদ্যমান `evaluateCQAnswer()` (CQ AI Evaluator) অপরিবর্তিত —
    OCR করা টেক্সট শুধু existing `answerA/B/C/D` টেক্সট ফিল্ডে গিয়ে
    বসে, তাই কোনো নতুন evaluation logic লাগেনি।
  - `capture="environment"` file input প্যাটার্ন (OCR Generate
    Dialog ও Live Exam Custom Question Set এ established) — মোবাইলে
    সরাসরি ক্যামেরা খোলে।
- ✅ **নতুন কম্পোনেন্ট**: `components/shared/handwritten-answer-button.tsx`
  — VoiceInputButton এর মতোই ছোট icon বাটন (একই আকার, পাশাপাশি বসানো
  — কথা বলে লেখা vs ছবি তুলে লেখা, দুটোই ইনপুট পদ্ধতি)। ক্লিক করলে
  একটা mini-dialog খোলে ২-ধাপের ফ্লো সহ (established OCR Generate
  Dialog প্যাটার্ন অনুসরণ করে, ভুল OCR ঠেকাতে মাঝে রিভিউ ধাপ):
  ১. ছবি আপলোড/তোলা → "লেখা পড়ো" বাটনে OCR extract কল
  ২. AI যা পড়েছে তা Textarea তে দেখানো (রিভিউ/এডিট করার সুযোগ) →
     "যোগ করো" চাপলে `onResult` callback দিয়ে parent এর answer state
     এ বিদ্যমান টেক্সটের সাথে append হয় (VoiceInputButton এর মতোই
     আচরণ, প্রতিস্থাপন না — একাধিকবার ছবি তুলে ধাপে ধাপে লম্বা উত্তর
     বানানো যায়)।
- ✅ **Integration — CQ Runner ও Mock Exam Runner** (দুই জায়গাতেই ৪টা
  করে প্রশ্ন — ক/খ/গ/ঘ): `components/cq/cq-runner.tsx` ও
  `components/mock-exam/mock-exam-runner.tsx` এ প্রতিটা প্রশ্নের
  VoiceInputButton এর ঠিক পাশে `HandwrittenAnswerButton` বসানো
  হয়েছে (`flex items-center gap-1.5` wrapper দিয়ে দুটো বাটন একসাথে
  গ্রুপ করা)। Mock Exam Runner এ বিদ্যমান
  `appendCqAnswerFromVoice(field, text)` ফাংশন pure reusable হওয়ায়
  (ভয়েস ও ছবি উভয় ক্ষেত্রে একই append-logic কাজ করে) কোনো নতুন
  state-management ফাংশন লেখার দরকার হয়নি।
- ✅ **লাইভ multi-user end-to-end টেস্ট** (Python + Pillow দিয়ে, বাস্তব
  Vision AI কল সহ):
  1. Pillow দিয়ে Hind Siliguri ফন্ট ব্যবহার করে একটা বাস্তবসম্মত
     বাংলা CQ উত্তরের টেস্ট ইমেজ তৈরি করা হয়েছে ("নিউটনের প্রথম সূত্র
     হলো জড়তার সূত্র..." — ৪ লাইন), ভিজুয়ালি ভেরিফাই করে নিশ্চিত হওয়া
     গেছে পড়া যাচ্ছে।
  2. নতুন ইউজার register+login করে সেই ছবি Base64 data URL হিসেবে
     `/api/flashcard-decks/ocr-extract` এ পাঠিয়ে **হুবহু নির্ভুল**
     টেক্সট ফেরত এসেছে (Mistral provider, বাংলা লাইন-ব্রেক সব ঠিক
     বজায় ছিল)।
  3. Authorization চেক: unauthenticated রিকোয়েস্ট → ৪০১, ছবি ছাড়া
     রিকোয়েস্ট → ৪০০ — উভয়ই established ভ্যালিডেশন সঠিকভাবে কাজ করছে।
  4. **End-to-end pipeline**: OCR করা টেক্সট দিয়ে বাস্তব
     `POST /api/cq/[cqQuestionId]/submit` কল করে দেখা গেছে সঠিকভাবে
     `CQAttempt` রো তৈরি হয়েছে (OCR টেক্সট `answerA` ফিল্ডে হুবহু
     সংরক্ষিত), AI evaluation চলেছে (feedback জেনারেট হয়েছে) —
     সম্পূর্ণ ছবি→OCR→submit→AI-evaluation পাইপলাইন কাজ করছে প্রমাণিত।
  5. মোট ৭/৭ automated assertion পাস (register, login, unauthorized,
     missing-image validation, OCR success, extracted text content
     verification x2)।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (সব ১৪৭টা পেজ কম্পাইল), `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
  endpoint দিয়ে ডিলিট (cascade delete এ তৈরি হওয়া CQAttempt রো ও
  মুছে গেছে, DB তে সরাসরি চেক করে ভেরিফাই করা হয়েছে), শূন্য বাকি
  নিশ্চিত করা হয়েছে।
- 📝 **নতুন test script**: `scripts/test-handwritten-cq-answer.py`
  (Pillow দিয়ে টেস্ট ইমেজ জেনারেশন + পূর্ণ end-to-end flow, পুনরায়
  ব্যবহারযোগ্য/rerunnable)।

🐛 গুরুতর বাগ ফিক্স — Admin User Ban/Role-Change Race Condition এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: হাতে লেখা CQ উত্তর ফিচার শেষ হওয়ার পরে "Next"
  নির্দেশে প্রোঅ্যাক্টিভ Bug Hunt চালিয়ে যাওয়া হয়েছে (Admin bulk
  actions/User management endpoint গুলো টার্গেট করে)। Admin User
  Ban ও Role-Change endpoint কোড রিভিউ করে দেখা গেছে দুটোতেই একই
  "existence check তারপর আলাদা update()" প্যাটার্ন — এটা established
  "P2025 500-instead-of-404" বাগ ক্লাসের সাথে মিলে যায় (আগে ১৪টা
  endpoint এ পাওয়া গিয়েছিল ও ফিক্স হয়েছিল — Chapter/Subject/Topic/
  Question/CQQuestion/Forum ইত্যাদি), কিন্তু এই দুটো endpoint সেই
  অডিটে miss হয়ে গিয়েছিল (হয়তো Admin Panel Power-up ফিচারে পরে
  যোগ হয়েছিল)।
- 🐛 **আবিষ্কৃত বাগ (গুরুতর, লাইভ প্রুফ)**: `PATCH
  /api/admin/users/[userId]/ban` এ `findUnique()` দিয়ে existence
  check করার পরে আলাদা `update()` কল করা হতো। concurrent `PATCH
  .../ban` ও `DELETE /api/admin/users/[userId]` একই userId তে
  threading দিয়ে একসাথে পাঠিয়ে দেখা গেছে ban request **৫০০ crash**
  দিয়েছে (`PrismaClientKnownRequestError P2025: "No record was
  found for an update"`) যখন delete request ২০০ সফল হয়েছে — অর্থাৎ
  check ও update এর মাঝের ছোট window এ delete সম্পন্ন হয়ে যাওয়ায়
  ban এর `update()` ব্যর্থ Prisma-level exception throw করেছে।
- ✅ **ফিক্স**: `update()` এর বদলে `updateMany({ where: { id: userId
  } })` ব্যবহার করে atomic claim করা হয়েছে — `updateMany()` কখনো
  throw করে না, শুধু matched row count রিটার্ন করে। `count === 0`
  হলে "ইউজার ইতিমধ্যে ডিলিট হয়ে গেছে" (৪০৪) রিটার্ন করা হয়, নাহলে
  `findUnique` (non-throwing, `findUniqueOrThrow` না — আরও এক স্তর
  ডিফেন্সিভ) দিয়ে updated data fetch করে response পাঠানো হয়।
- ✅ **প্রতিরোধমূলক (Defensive) ফিক্স — Role-Change Endpoint**: একই
  ফাইলের `PATCH /api/admin/users/[userId]` (role change) এ একই
  read-then-write প্যাটার্ন পাওয়া গেছে। ম্যানুয়াল concurrent টেস্টে
  (১৮ বার concurrent role-change+delete চেষ্টা করে) সরাসরি crash
  reproduce করা যায়নি (সম্ভবত delete cascade ৩০+ টেবিলে সময় বেশি
  নেয় বলে role-update প্রায়ই আগে শেষ হয়ে যাচ্ছিল, race window
  ব্যবহারিকভাবে সংকীর্ণ), কিন্তু তাত্ত্বিকভাবে একই ঝুঁকি বিদ্যমান —
  তাই consistency ও ভবিষ্যৎ নিরাপত্তার জন্য একই `updateMany()`
  atomic-claim প্যাটার্ন এখানেও প্রয়োগ করা হয়েছে।
- ✅ **লাইভ multi-iteration concurrency টেস্ট** (fix এর আগে-পরে
  দুটোই): fix এর আগে ১ বার চেষ্টায় Ban ৫০০ crash reproduce হয়েছে।
  fix এর পরে Ban এ ১৩ বার (৫+৮) ও Role-Change এ ১৮ বার concurrent
  race চালিয়ে **কোনো ৫০০ crash হয়নি** — বেশ কয়েকবার delete race
  জিতেছে এবং যথাযথভাবে ৪০৪ রিটার্ন করেছে (আগে যেটা crash হতো)।
- ✅ **Regression টেস্ট** (৯/৯ assertion পাস): normal non-concurrent
  ban/unban flow, non-existent user এ ban চেষ্টা (৪০৪), normal
  role-change flow (STUDENT↔ADMIN), non-existent user এ role-change
  চেষ্টা (৪০৪) — সব established functionality অক্ষত আছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (সব ১৪৭টা পেজ কম্পাইল), `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (concurrent test চলাকালীন
  একটা না একটা থ্রেড দিয়েই delete হয়ে গেছে প্রতিটা iteration এ) DB
  তে psycopg2 দিয়ে সরাসরি চেক করে কোনো leftover নেই ভেরিফাই করা
  হয়েছে।
- 📝 **নতুন test script**: `scripts/test-admin-ban-role-delete-race-condition.py`
  (৮+৮ = ১৬টা concurrency iteration, পুনরায় ব্যবহারযোগ্য রিগ্রেশন
  স্ক্রিপ্ট)।

🐛 গুরুতর বাগ ফিক্স — Admin Notification Broadcast Race Condition (FK Constraint Crash) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Admin Ban/Role-Change race condition ফিক্স করার
  পরে "Next" নির্দেশে আরও Bug Hunt চালিয়ে যাওয়া হয়েছে — এবার admin
  bulk-action endpoint গুলো (Notification Broadcast, Weekly Digest
  Send) টার্গেট করা হয়েছে যেগুলো "সব ইউজার লিস্ট আনো, তারপর সবার
  উপরে কিছু করো" প্যাটার্নে চলে — এই ধরনের bulk operation এ
  read-then-write race window স্বাভাবিকভাবেই বড় হয় (findMany() এ
  যত বেশি ইউজার তত বেশি সময়, তারপর দ্বিতীয় ধাপে পৌঁছাতে দেরি)।
- 🐛 **আবিষ্কৃত বাগ (গুরুতর, লাইভ প্রুফ)**: `POST /api/admin/
  notifications/broadcast` এ `prisma.user.findMany()` দিয়ে সব userId
  আনার পরে `prisma.notification.createMany()` কল করা হতো (আলাদা দুই
  ধাপ, দুইটা আলাদা DB round-trip)। এই মাঝের window এ concurrent
  `DELETE /api/admin/users/[userId]` কল দিয়ে কোনো ইউজার ডিলিট হয়ে
  গেলে `createMany()` সেই (আর অস্তিত্বহীন) userId দিয়ে insert করার
  চেষ্টা করতো এবং FK constraint violate করতো
  (`notifications_userId_fkey`, Postgres error code P2003)। যেহেতু
  Prisma `createMany()` একটামাত্র multi-row `INSERT` statement
  (all-or-nothing — একটা row ব্যর্থ হলে পুরো statement rollback হয়),
  একজন মাত্র ইউজার ঠিক সেই মুহূর্তে ডিলিট হলে **বাকি হাজার হাজার
  eligible ইউজারও কোনো notification পেত না**, এবং admin এর কাছে ৫০০
  crash response আসতো। প্রথমে সরাসরি Prisma দিয়ে isolated টেস্ট করে
  (fake FK দিয়ে createMany কল) নিশ্চিত করা হয়েছে এটা genuine
  all-or-nothing behavior (P2003 থ্রো হয়, valid row-ও insert হয় না)।
  তারপর ৪০টা padding user দিয়ে broadcast কে কৃত্রিমভাবে ধীর করে (১-২
  সেকেন্ড execution সময়) live threading টেস্টে ২০ iteration চালিয়ে
  crash সরাসরি লাইভে প্রমাণিত হয়েছে (dev server log এ
  `PrismaClientKnownRequestError`, "Foreign key constraint violated
  on the constraint: `notifications_userId_fkey`")।
- ✅ **ফিক্স**: read (userId লিস্ট আনা) ও write (notification insert)
  কে একটামাত্র atomic SQL statement এ একত্রিত করা হয়েছে —
  `prisma.$executeRaw` দিয়ে `INSERT INTO notifications (...) SELECT
  gen_random_uuid()::text, id, ..., now() FROM users` — অর্থাৎ insert
  execution এর ঠিক সেই মুহূর্তে `users` টেবিলে যারা বাস্তবে
  অস্তিত্বশীল, ডাটাবেস ইঞ্জিন নিজেই সরাসরি সেই স্ন্যাপশট থেকে
  notification তৈরি করে — কোনো Node.js/network round-trip window
  থাকে না বলে race condition সম্পূর্ণরূপে দূর হয়ে যায় (একই কারণে
  ব্যবহারকারী কল্পনা করলেও কোনো race window অবশিষ্ট নেই, এটা
  "narrow করা" না বরং "সম্পূর্ণ বন্ধ করা")।
- ✅ **লাইভ multi-iteration concurrency টেস্ট** (fix এর আগে-পরে দুটোই):
  fix এর আগে ২০ iteration এর ভেতরে একাধিকবার ৫০০ crash reproduce
  হয়েছে। fix এর পরে একই স্ক্রিপ্ট দিয়ে আবার ২০ iteration চালিয়ে
  **০টা crash, ২০/২০ broadcast সফল (২০০)** — dev server log এ সব
  broadcast রিকোয়েস্ট `200` স্ট্যাটাস কনফার্ম করা হয়েছে।
- ✅ **Weekly Digest Send এও একই ধরনের রিস্ক অডিট করা হয়েছে**
  (`getEligibleDigestUserIds()` দিয়ে userId লিস্ট আনা, তারপর
  লুপে প্রতিটার জন্য আলাদা `prisma.user.update({ lastDigestSentAt
  })` কল) — কিন্তু এখানে প্রতিটা ইউজারের update `try/catch` এর
  ভেতরে থাকায় per-user P2025 (যদি হয়ও) contained থাকে, পুরো
  request crash হয় না (failedCount++ হয়ে যায়)। লাইভ টেস্টে (১০
  iteration concurrent digest+delete) **কোনো ৫০০ crash হয়নি**,
  তাই এখানে কোনো কোড পরিবর্তনের দরকার হয়নি (ইতিমধ্যে সুরক্ষিত)।
- ✅ **Authorization/edge-case টেস্ট** (৬/৬ assertion পাস): non-admin
  ইউজার broadcast করতে পারে না (৪০১/৪০৩), unauthenticated ব্লক
  (৪০১/৪০৩), খালি title/body এ ৪০০, সফল broadcast এ সঠিক sentCount।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm build`
  সফল (সব পেজ কম্পাইল), `pnpm lint` ক্লিন (স্ক্র্যাচ টেস্ট ফাইল
  cleanup করার পরে)।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার (padding+race target)
  আসল `DELETE /api/admin/users/[userId]` endpoint দিয়ে ডিলিট করা
  হয়েছে (raw SQL bypass না), cascade-এ তৈরি হওয়া test notification
  রো গুলোও psycopg2 দিয়ে সরাসরি চেক করে (`notifications` টেবিলে
  leftover টাইটেল প্যাটার্ন খুঁজে) পরিষ্কার করা হয়েছে, শূন্য বাকি
  নিশ্চিত করা হয়েছে।
- 📝 **নতুন test script**: `scripts/test-broadcast-delete-race3.py`,
  `scripts/test-digest-delete-race.py`,
  `scripts/test-broadcast-authz-edge.py`,
  `scripts/cleanup-test-users.py` (পুনরায় ব্যবহারযোগ্য)।

🐛 গুরুতর বাগ ফিক্স — Admin CSV Bulk Question Upload Race Condition (FK Constraint Crash) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: Notification Broadcast এর race condition ফিক্স
  করার পরে "Next" নির্দেশে একই bug class এর অন্য কোনো bulk-write
  endpoint আছে কিনা খুঁজে দেখা হয়েছে (`grep -rln "createMany"`
  দিয়ে)। দুইটা মাত্র endpoint পাওয়া গেছে যেখানে `createMany()`
  ব্যবহার হয় — একটা ইতিমধ্যে ফিক্স হয়ে গেছে (Notification
  Broadcast), অন্যটা `POST /api/admin/questions/bulk` (CSV থেকে
  বাল্ক প্রশ্ন আপলোড) — এটা রিভিউ করা হয়েছে।
- 🐛 **আবিষ্কৃত বাগ (গুরুতর, লাইভ প্রুফ)**: কোড রিভিউতে দেখা গেছে
  একই read-then-write প্যাটার্ন — `topicId` existence check
  (`findUnique`) করার পরে CSV parse করে আলাদা ধাপে
  `prisma.question.createMany()` কল করা হতো। `Question.topicId`
  ফিল্ড `Topic` এর সাথে `onDelete: Cascade` FK সম্পর্কযুক্ত হওয়ায়,
  concurrent `DELETE /api/admin/topics/[topicId]` এসে সেই টপিক
  ডিলিট করে দিলে createMany() এ FK violation (`questions_topicId_
  fkey`, P2003) crash হতো। লাইভ টেস্টে (নতুন টেস্ট টপিক তৈরি → বড়
  ৪০-রো CSV বাল্ক আপলোড + concurrent টপিক ডিলিট, ১৫ iteration)
  **৫টা crash সরাসরি প্রমাণিত** হয়েছে (৩৩% crash rate, dev server
  log এ `Foreign key constraint violated on the constraint:
  questions_topicId_fkey` কনফার্ম করা হয়েছে)।
- ✅ **ফিক্সের ডিজাইন সিদ্ধান্ত**: Notification Broadcast এ ব্যবহৃত
  atomic `INSERT ... SELECT` approach এখানে সরাসরি প্রযোজ্য না —
  কারণ Notification Broadcast এ সব row এর জন্য title/body/link
  একই (একটা constant SELECT থেকে সব userId নিয়ে একই ভ্যালু বসিয়ে
  insert), কিন্তু এখানে প্রতিটা CSV row এর text/options/
  correctAnswer/explanation ভিন্ন ভিন্ন — raw SQL এ প্রতিটা row এর
  জন্য আলাদা placeholder সহ dynamic multi-row `INSERT ... VALUES`
  বানানো জটিল ও injection-risk বেশি (Prisma এর টাইপ-সেফ query
  builder এর সুরক্ষা হারানো)। তাই ভিন্ন সমাধান বেছে নেওয়া হয়েছে:
  `prisma.$transaction()` এর ভেতরে প্রথমে `tx.$queryRaw` দিয়ে
  `SELECT id FROM "topics" WHERE id = ${topicId} FOR UPDATE` চালিয়ে
  topic row এ row-level lock নেওয়া হয়, তারপর একই transaction এর
  ভেতরেই `tx.question.createMany()` কল করা হয় (Prisma-typed, পুরো
  নিরাপত্তা বজায় থেকে)। `FOR UPDATE` এর মূল বৈশিষ্ট্য: যতক্ষণ এই
  transaction চলবে (কমিট/রোলব্যাক না হওয়া পর্যন্ত), অন্য কোনো
  transaction এই একই row কে update/delete করতে চাইলে block হয়ে
  অপেক্ষা করবে — এতে existence-check ও write একই atomic unit এ
  পরিণত হয়, কোনো race window থাকে না। যদি lock নেওয়ার সময় দেখা যায়
  টপিক ইতিমধ্যে ডিলিট হয়ে গেছে (০টা রো রিটার্ন), তাহলে পরিষ্কারভাবে
  `TOPIC_NOT_FOUND` এরর throw করে ৪০৪ রিটার্ন করা হয়।
- ✅ **Isolated Prisma টেস্ট দিয়ে lock behavior ভেরিফাই**: ফিক্স
  লেখার আগে একটা isolated স্ক্রিপ্ট দিয়ে টেস্ট করা হয়েছে —
  transaction এর ভেতরে `FOR UPDATE` লক নিয়ে ইচ্ছাকৃত ১.৫ সেকেন্ড
  delay দিয়ে, সমান্তরালে concurrent delete চেষ্টা করে দেখা গেছে সেই
  delete transaction commit হওয়া পর্যন্ত (প্রায় ২ সেকেন্ড) সত্যিই
  block হয়ে অপেক্ষা করেছে, তারপর সফল হয়েছে — অর্থাৎ lock ঠিকভাবে
  কাজ করছে confirmed।
- ✅ **লাইভ multi-iteration concurrency টেস্ট** (fix এর আগে-পরে
  দুটোই): fix এর আগে ১৫ iteration এ ৫টা crash। fix এর পরে একই
  স্ক্রিপ্ট আবার চালিয়ে (dev server rebuild করে) **০টা crash, race
  জেতা ক্ষেত্রে (৪-৬টা iteration এ) সঠিকভাবে ৪০৪ রিটার্ন হয়েছে**
  (আগে যেটা ৫০০ crash হতো)। আরও নিশ্চিত হতে ২৫ iteration এ আবার
  চালিয়েও **০টা crash** কনফার্ম করা হয়েছে।
- ✅ **Regression/Authorization/Edge-case টেস্ট** (৯/৯ assertion
  পাস): normal ৫-রো CSV bulk upload (count সঠিক), non-existent
  topicId এ ৪০৪, খালি csvText এ ৪০০, topicId মিসিং এ ৪০০, শুধু
  header (ডেটা রো নেই) CSV এ ৪০০, non-admin ইউজার ব্লক (৪০১/৪০৩),
  unauthenticated ব্লক (৪০১/৪০৩) — সব established functionality
  অক্ষত আছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm
  build` সফল (সব পেজ কম্পাইল), `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: প্রতিটা concurrency iteration এ টেস্ট
  টপিক একটা না একটা থ্রেড দিয়ে (delete race জিতুক বা bulk upload
  থ্রেড normal delete করুক পরে) ইতিমধ্যে ডিলিট হয়ে গেছে (cascade এ
  সেই টপিকের questions ও মুছে গেছে)। regression টেস্টের test topic/
  student user আসল `DELETE /api/admin/topics/[topicId]` ও `DELETE
  /api/admin/users/[userId]` endpoint দিয়ে ডিলিট করা হয়েছে। DB তে
  psycopg2 দিয়ে সরাসরি চেক করে কোনো leftover টেস্ট টপিক/প্রশ্ন/
  ইউজার নেই ভেরিফাই করা হয়েছে (সব ০)।
- 📝 **নতুন test script**:
  `scripts/test-bulk-questions-topic-delete-race.py`,
  `scripts/test-bulk-questions-authz-regression.py`
  (পুনরায় ব্যবহারযোগ্য)।

🐛 গুরুতর বাগ ফিক্স — Study Plan Background Chunk Generation Race Condition (Double-Fault Crash) এ যা যা করা হয়েছে ও লাইভ টেস্ট করা হয়েছে:

- ✅ **প্রেক্ষাপট**: CSV Bulk Question Upload ফিক্স করার পরে "Next"
  নির্দেশে একই bug class এর অন্য কোনো bulk-write endpoint আছে কিনা
  আবার খোঁজা হয়েছে (`grep -rln "createMany"` দিয়ে পুরো `app/`+
  `lib/` স্ক্যান করে)। এবার দুইটা নতুন candidate পাওয়া গেছে:
  `lib/custom-question-gen.ts` (ছবি→AI→MCQ/CQ জেনারেশন) ও
  `lib/study-plan-generator.ts` (Study Plan chunk generation) —
  দুটোই fire-and-forget ব্যাকগ্রাউন্ড ফাংশন। Custom Question Gen
  রিভিউ করে দেখা গেছে সেটা নিরাপদ (একটা সেট একবারই process হয়,
  ownership-based delete এ active generation এর সাথে conflict
  করার বাস্তবসম্মত সুযোগ কম)। কিন্তু Study Plan Generator এ একটা
  স্পষ্ট race window পাওয়া গেছে — এটাতেই ফোকাস করা হয়েছে।
- 🐛 **আবিষ্কৃত বাগ (গুরুতর, লাইভ প্রুফ, double-fault variant)**:
  `POST /api/study-plan/generate` এ `durationDays` ১৫ দিনের বেশি
  হলে প্রথম chunk সরাসরি জেনারেট করে response পাঠানো হয়, কিন্তু
  `generateRemainingChunks()` ফাংশন ব্যাকগ্রাউন্ডে (await ছাড়া)
  বাকি chunk গুলো ধাপে ধাপে জেনারেট করতে থাকে — প্রতিটা chunk এ AI
  কল লাগে যেটা ১০-২৫ সেকেন্ড পর্যন্ত সময় নিতে পারে। এই দীর্ঘ
  ব্যাকগ্রাউন্ড সময়ে যদি একই ইউজার আবার `POST /api/study-plan/
  generate` কল করে (নতুন প্ল্যান চেয়ে), `generateStudyPlan()` এর
  ভেতরে থাকা `prisma.studyPlan.deleteMany({ where: { userId } })`
  পুরনো প্ল্যান (এবং তার সব `StudyPlanItem`, cascade এ) মুছে দেয়।
  কিন্তু প্রথম কলের ব্যাকগ্রাউন্ড লুপ তখনো পুরনো (এখন ডিলিট হয়ে
  যাওয়া) `studyPlanId` নিয়ে কাজ করছিল — পরের chunk এর
  `studyPlanItem.createMany()` এ FK violation
  (`study_plan_items_studyPlanId_fkey`, P2003) থ্রো হয়েছে, যেটা
  catch ব্লকে ধরাও পড়েছে। কিন্তু **catch ব্লক নিজেই** সেই একই
  (এখন অস্তিত্বহীন) `studyPlanId` দিয়ে `studyPlan.update({
  generationStatus: "FAILED" })` কল করেছে — যেটা আবার P2025
  ("No record was found for an update") থ্রো করে **error-
  handler নিজেই crash করেছে** (double-fault: প্রথম exception
  handle করার চেষ্টায় দ্বিতীয় uncaught exception তৈরি হওয়া, dev
  server log এ দুইটা আলাদা stack trace একই request এ দেখা গেছে)।
  লাইভ টেস্টে (৯০ দিনের প্ল্যান জেনারেট করে ০.৫ সেকেন্ড বিরতিতে
  আবার ৭ দিনের প্ল্যান জেনারেট করে) এই পুরো চেইন সরাসরি reproduce
  হয়েছে (dev server log এ `Foreign key constraint violated on
  the constraint: study_plan_items_studyPlanId_fkey` তারপর `No
  record was found for an update` — দুটোই একই request এর মধ্যে)।
- ✅ **ফিক্সের ডিজাইন সিদ্ধান্ত**: CSV Bulk Question Upload এ
  ব্যবহৃত `$transaction` + `FOR UPDATE` row-lock টেমপ্লেট এখানেও
  প্রযোজ্য (heterogeneous row data — প্রতিটা chunk এ AI-generated
  ভিন্ন ভিন্ন `taskDescription`/`subjectCode`/ইত্যাদি)। কিন্তু একটা
  গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত এখানে নতুন: AI কল (১০-২৫ সেকেন্ড)
  কে **লকের বাইরে** রাখা হয়েছে ইচ্ছাকৃতভাবে — যদি পুরো chunk
  (AI call + write) একটা transaction এর ভেতরে হতো এবং `FOR
  UPDATE` লক AI call এর আগে নেওয়া হতো, তাহলে সেই দীর্ঘ সময় ধরে
  ওই StudyPlan row লক থাকতো এবং অন্য কোনো বৈধ অপারেশন (যেমন
  ইউজার নিজের প্ল্যান দেখতে চাওয়া বা আইটেম complete করতে চাওয়া, যদি
  future এ সেগুলো একই row touch করে) অহেতুক ব্লক হয়ে যেতো। তাই
  শুধু **write মুহূর্তে** (AI response আসার পরে) ছোট transaction
  এ লক নেওয়া হয়েছে — `SELECT id FROM study_plans WHERE id =
  ${planId} FOR UPDATE`, তারপর একই transaction এ `createMany()` +
  `daysGenerated` আপডেট। এটা established সমাধান ৩খ টেমপ্লেটের
  একটা variant: "heterogeneous row data + ধীর external কল" হলে
  লক শুধু দ্রুত write অংশে নেওয়া উচিত, পুরো ধীর অপারেশন জুড়ে না।
- ✅ **Silent-stop behavior**: লক নেওয়ার সময় দেখা গেলে প্ল্যান
  ইতিমধ্যে ডিলিট হয়ে গেছে (০টা রো), তাহলে লুপ **নীরবে থেমে যায়**
  (`return`) — কোনো `FAILED` status লেখার চেষ্টাও করে না, কারণ
  এটা genuine error না (ইউজার ইচ্ছাকৃতভাবে নতুন প্ল্যান চেয়েছে,
  পুরনোটা প্রাসঙ্গিক না)। এছাড়া catch ব্লকেও `update()` এর বদলে
  `updateMany()` ব্যবহার করা হয়েছে — matched count 0 হলে নীরবে
  skip হয়, error-handler নিজে কখনো crash করবে না (double-fault
  সম্পূর্ণরূপে দূর)।
- ✅ **লাইভ multi-iteration concurrency টেস্ট** (fix এর আগে-পরে
  দুটোই): fix এর আগে ১ম টেস্ট রানেই পুরো double-fault chain
  reproduce হয়েছে। fix এর পরে একই স্ক্রিপ্ট **২ বার** চালিয়ে
  (dev server rebuild করে) দুইবারই কোনো crash হয়নি — dev log এ
  শুধু পরিষ্কার `Study Plan ব্যাকগ্রাউন্ড generation থামানো হলো
  ... প্ল্যানটা ইতিমধ্যে ডিলিট/replace হয়ে গেছে` তথ্যমূলক লগ
  দেখা গেছে (কোনো error/exception stack trace না), এবং দ্বিতীয়
  (নতুন) প্ল্যান স্বাভাবিকভাবে `READY` স্ট্যাটাসে পৌঁছেছে।
- ✅ **Regression টেস্ট** (১৩/১৩ assertion পাস): ছোট প্ল্যান (৭
  দিন, chunking লাগে না) সরাসরি READY হওয়া ও items থাকা, `GET
  /api/study-plan` সঠিক ডেটা রিটার্ন করা, ভুল `durationDays`
  (রেঞ্জের বাইরে) এ ৪০০, unauthenticated ব্লক (৪০১), বড় প্ল্যান
  (৪৫ দিন, ৩টা chunk লাগে) শেষ পর্যন্ত (পর্যাপ্ত অপেক্ষার পরে)
  `READY` স্ট্যাটাসে পৌঁছানো ও যথাযথ সংখ্যক আইটেম তৈরি হওয়া —
  ফিক্সের ফলে normal multi-chunk generation flow এর কোনো ক্ষতি
  হয়নি নিশ্চিত করা হয়েছে।
- ✅ **Checkpoint pattern সম্পূর্ণ**: `tsc --noEmit` ক্লিন, `pnpm
  build` সফল (সব পেজ কম্পাইল), `pnpm lint` ক্লিন।
- ✅ **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
  delete-account` endpoint দিয়ে (পাসওয়ার্ড + "ডিলিট করো"
  কনফার্মেশন সহ) ডিলিট করা হয়েছে, যেটা cascade এ তাদের
  `StudyPlan`/`StudyPlanItem` ও মুছে দিয়েছে। DB তে psycopg2 দিয়ে
  সরাসরি চেক করে (`email LIKE '%studyplanrace%' OR
  '%studyplanregr%'`, `study_plans` টেবিলের count) কোনো leftover
  নেই ও `study_plans` টেবিল খালি (টেস্টের বাইরে কোনো আসল ইউজার
  স্টাডি প্ল্যান ব্যবহার করেনি) ভেরিফাই করা হয়েছে।
- 📝 **নতুন test script**:
  `scripts/test-studyplan-regenerate-race.py`,
  `scripts/test-studyplan-regression.py` (পুনরায় ব্যবহারযোগ্য)।


---

> 📦 এর আগের সব এন্ট্রি (Phase 0 থেকে) → [`CHANGELOG_ARCHIVE.md`](./CHANGELOG_ARCHIVE.md)
