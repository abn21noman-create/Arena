# 🎓 HSC Ultimate

**HSC 2028 ব্যাচ (Science Group) এর জন্য All-in-One প্রস্তুতি প্ল্যাটফর্ম**

Learning Hub + AI Doubt Solver + Practice Engine + Flashcards + Planner + Gamification —
সব একসাথে একটা প্ল্যাটফর্মে।

| | |
|---|---|
| 📘 **ফিচার প্ল্যান ও রিসার্চ** | [`docs/MASTER_PLAN.md`](./docs/MASTER_PLAN.md) — প্রজেক্টের "সংবিধান" |
| 📚 **বাস্তবায়ন লগ** | [লগ ১](./docs/MASTER_PLAN_LOG_1.md) · [২](./docs/MASTER_PLAN_LOG_2.md) · [৩](./docs/MASTER_PLAN_LOG_3.md) · [৪](./docs/MASTER_PLAN_LOG_4.md) |
| 📜 **ডেভেলপমেন্ট হিস্ট্রি** | [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) |
| 🗺️ **সিস্টেম ওভারভিউ** | [`docs/SYSTEM_OVERVIEW.md`](./docs/SYSTEM_OVERVIEW.md) — সব ফিচার ও পেজের তালিকা |
| 🔐 **Secret Rotation** | [`docs/SECRET_ROTATION.md`](./docs/SECRET_ROTATION.md) — API key বদলানোর নির্দেশিকা |
| 🔍 **সর্বশেষ অডিট** | [`docs/FULL_PROJECT_DEEP_SCAN_2026-08-05.md`](./docs/FULL_PROJECT_DEEP_SCAN_2026-08-05.md) · [`docs/PRODUCTION_TRUTH_SAFETY_GATE.md`](./docs/PRODUCTION_TRUTH_SAFETY_GATE.md) |
| 🔒 **Strict Focus** | [`docs/STRICT_FOCUS.md`](./docs/STRICT_FOCUS.md) — consent-based Android app blocker + Admin control |
| ⚡ **Fast Workflow** | [`docs/DEVELOPMENT_WORKFLOW.md`](./docs/DEVELOPMENT_WORKFLOW.md) — setup, ১৪-second cached verify, safe build |
| ✨ **Premium Loading & Theme** | [`docs/PREMIUM_LOADING_THEME.md`](./docs/PREMIUM_LOADING_THEME.md) — Obsidian Prism, rich loading profiles |
| 🧭 **Dashboard 2.0** | [`docs/DASHBOARD_2.md`](./docs/DASHBOARD_2.md) — real-data learning command center |
| 📊 **Focus Analytics** | [`docs/FOCUS_ANALYTICS.md`](./docs/FOCUS_ANALYTICS.md) — private user/admin reports + CSV |
| 📅 **Focus Scheduling** | [`docs/FOCUS_SCHEDULING.md`](./docs/FOCUS_SCHEDULING.md) — one-time/daily/weekly consent schedules |
| 🛰️ **Scheduler Operations** | [`docs/FOCUS_SCHEDULER_OPERATIONS.md`](./docs/FOCUS_SCHEDULER_OPERATIONS.md) — heartbeat, cross-instance lease, Admin run + deployment templates |
| ✅ **MCQ Safe Import** | [`docs/MCQ_SAFE_IMPORT_2026-08-04.md`](./docs/MCQ_SAFE_IMPORT_2026-08-04.md) — 908 category reconciliation, reviewed 11-row append-only import |
| 🛡️ **Distributed Rate Limiting** | [`docs/DISTRIBUTED_RATE_LIMITING.md`](./docs/DISTRIBUTED_RATE_LIMITING.md) — atomic Upstash sliding window + bounded memory fallback |
| 📲 **Native Push Delivery** | [`docs/NATIVE_PUSH_DELIVERY_READINESS.md`](./docs/NATIVE_PUSH_DELIVERY_READINESS.md) — replay-safe FCM, delivery receipts, stale-token diagnostics |
| 🖥️ **System Operations Center** | [`docs/SYSTEM_OPERATIONS_CENTER.md`](./docs/SYSTEM_OPERATIONS_CENTER.md) — real DB/runtime/security/deployment telemetry; zero fake metrics |
| 🧪 **Academic Content Quality** | [`docs/ACADEMIC_CONTENT_QUALITY.md`](./docs/ACADEMIC_CONTENT_QUALITY.md) — 1,157-item risk triage + Admin + strict Multi-AI review/provenance workflow |
| 🔏 **Review Integrity** | [`docs/ACADEMIC_REVIEW_INTEGRITY.md`](./docs/ACADEMIC_REVIEW_INTEGRITY.md) — content-bound hashes, stale approval detection, immutable history + safe CSV |
| 💾 **Disaster Recovery** | [`docs/DISASTER_RECOVERY.md`](./docs/DISASTER_RECOVERY.md) — verified academic snapshot, SHA-256 manifest, tamper/reference/PII guard |
| 🚦 **Release Readiness** | [`docs/RELEASE_READINESS.md`](./docs/RELEASE_READINESS.md) — local/deploy gate, live preflight, source supply-chain manifest + hardened CI |
| ⚡ **Performance & DB Reliability** | [`docs/PERFORMANCE_DATABASE_RELIABILITY.md`](./docs/PERFORMANCE_DATABASE_RELIABILITY.md) — 75/75 FK indexes, query plans, pagination, DB aggregation |
| 🛡️ **Security & Abuse 2.0** | [`docs/SECURITY_ABUSE_TESTING_2.md`](./docs/SECURITY_ABUSE_TESTING_2.md) — global API rate baseline, Origin/body guards, strict route manifest |
| ✅ **Runtime Truth & Safety** | [`docs/PRODUCTION_TRUTH_SAFETY_GATE.md`](./docs/PRODUCTION_TRUTH_SAFETY_GATE.md) — no fake/no-op API, live landing counts, session revocation, safe PWA/seed/broadcast |
| 🧑‍🏫 **Academic Trust Loop** | [`docs/ACADEMIC_TRUST_LOOP.md`](./docs/ACADEMIC_TRUST_LOOP.md) — exact-hash student issue reports, Admin queue, decision notification |
| 🤖 **Multi-AI Approval** | [`docs/MULTI_AI_ACADEMIC_APPROVAL.md`](./docs/MULTI_AI_ACADEMIC_APPROVAL.md) — 2-provider consensus, AI/Admin identity, immutable evidence |
| 🔐 **Privacy & Compliance** | [`docs/PRIVACY_COMPLIANCE_CENTER.md`](./docs/PRIVACY_COMPLIANCE_CENTER.md) — public policies, versioned acknowledgement, export/deletion reconciliation, Play drafts |

---

## 📊 এক নজরে

| | |
|---|---|
| পেজ | **৮৯টা** |
| API রুট | **২১৩টা** — সব reachable route real; Multi-AI review APIসহ |
| lib মডিউল | **১১৩টা** |
| DB migration | **৩৩টা** |
| Seed script | **৩১টা** |
| Live E2E | **৯৯টা pass** (Core ৪৬ + Focus/Analytics/Scheduling ৩৭ + Privacy ১৬) |
| Unit test | **১০৬/১০৬ pass** + Android JVM **৬/৬** — security/performance/release/content/native/privacy/runtime-integrityসহ |
| Pure-logic টেস্ট | **১৬২টা** assertion — `npm run test:logic` (DB লাগে না) |
| Seed ডেটা যাচাই | ৬৮৮ Core MCQ + ২২০ Admission MCQ = ৯০৮ · ৬৪ CQ · ৮১ topic reference — `npm run test:seed` |
| Live কনটেন্ট | ১৩ Subject · ৮৯ Chapter · ১৮৫ Topic · ৬৮৮ Core MCQ · ২২০ Admission MCQ · ৬৪ CQ · ১৪ Badge |

---

## 🚀 বর্তমান স্ট্যাটাস

<details>
<summary><b>সম্পূর্ণ ফেজ তালিকা দেখুন (২৪২টা এন্ট্রি)</b> — Phase 0–8 ✅ সম্পন্ন, Phase 9 (Deploy) ⏳ বাকি</summary>

- ✅ **Phase 0** — Project Setup (Next.js, Tailwind, shadcn/ui, Prisma, Multi-AI System)
- ✅ **Phase 1** — Authentication + Onboarding + Supabase Database
- ✅ **Phase 2** — Learning Hub (Subject/Chapter/Topic + Progress Tracking)
- ✅ **Phase 3** — Practice Engine (MCQ Quiz + Scoring + Question Bank)
- ✅ **Phase 4** — Flashcards (SM-2 Spaced Repetition + AI Generation)
- ✅ **Phase 5** — Planner (Task Manager + Exam Countdown + Pomodoro Timer)
- ✅ **Phase 6** — Gamification (XP/Level/Streak/Badge/Leaderboard)
- ✅ **Phase 7** — AI Tutor Enhancement (Chat History + Vision)
- ✅ **Phase 8** — Analytics Dashboard (Charts + Weak Topic Detection)
- ✅ **Extra Phase** — Admin Panel (Role-based Access + Content Management)
- ✅ **Extra Phase** — CQ (সৃজনশীল প্রশ্ন) Practice with AI Evaluation
- ✅ **Extra Phase** — Community/Discussion Forum
- ✅ **Extra Phase** — Profile/Settings + Dark Mode + Forgot Password
- ✅ **Extra Phase** — Bookmark + Note + Notification System
- ✅ **Extra Phase** — Full Mock Exam + Predicted GPA
- ✅ **Extra Phase** — Auto Study Plan + Class Routine
- ✅ **Extra Phase** — Global Search + Dark Mode Polish
- ✅ **Extra Phase** — Admin Panel সম্প্রসারণ (CQ/Analytics/Moderation/Broadcast)
- ✅ **Extra Phase** — PDF Chat (RAG) — নিজের নোট/বই আপলোড করে AI এর সাথে চ্যাট
- ✅ **Extra Phase** — Security Hardening (Audit Logging + Security Headers)
- ✅ **Extra Phase** — Performance Optimization (DB Indexes + Query Consolidation)
- ✅ **Extra Phase** — Live Exam System (Custom Question Generation + Solo Live Exam)
- ✅ **Extra Phase** — Quiz Battle (Room Code দিয়ে Multi-Person Self-Paced MCQ)
- ✅ **Extra Phase** — Smart/Adaptive Practice (দুর্বল টপিক-ভিত্তিক টার্গেটেড কুইজ)
- ✅ **Extra Phase** — FSRS Algorithm Upgrade (SM-2 থেকে আধুনিক Spaced Repetition)
- ✅ **Extra Phase** — Previous-Year Board Question Tagging + Filter
- ✅ **Extra Phase** — PDF Chat Audio Overview (NotebookLM-অনুপ্রাণিত)
- ✅ **Extra Phase** — Study Plan Agent Upgrade (Proactive Monitoring)
- ✅ **Extra Phase** — Mind Map Generation (NotebookLM-অনুপ্রাণিত)
- ✅ **Extra Phase** — Activity Heatmap (GitHub Contribution Graph-স্টাইল)
- ✅ **Extra Phase** — Timed Drill Mode (Duolingo-স্টাইল Speed Practice)
- ✅ **Extra Phase** — Strict Focus (২০–১২০ মিনিট, consent contract, Admin control, Android app blocker)
- ✅ **Extra Phase** — Premium Loading + Obsidian Prism Theme (global + ২৭ route loading profiles)
- ✅ **Extra Phase** — Premium Dashboard 2.0 (real data, bento intelligence, focus/mission/activity command center)
- ✅ **Extra Phase** — Focus Analytics (7/30/90D, subject/source/streak, privacy-controlled Admin report, CSV)
- ✅ **Extra Phase** — Admin Focus Scheduling (one-time/daily/weekly, reminder, cron/lazy processing, revoke/cancel)
- ✅ **Extra Phase** — Privacy & Compliance Center (public Privacy/Terms/deletion guide, versioned acceptance, export/delete integrity, Play drafts)
- ✅ **Extra Phase** — Production Truth & Safety Gate (29 fake/no-op APIs + prototype UI removed, live landing data, private PWA cache fix, session revocation, truthful broadcast, guarded seeds)
- ✅ **Extra Phase** — Academic Trust Loop (student issue report on all academic surfaces, exact content hash, Admin queue/decision, reporter notification)
- ✅ **Extra Phase** — Multi-AI Academic Approval (Groq+Mistral consensus, AI/Admin reviewer identity, immutable provider evidence, first live AI approval)
- ✅ **Extra Phase** — Global 404/Error Page (কাস্টম বাংলা এরর পেজ)
- ✅ **Extra Phase** — Cloze Deletion Flashcard (Anki-অনুপ্রাণিত ফাঁকা-পূরণ কার্ড)
- ✅ **Extra Phase** — Content Report/Flagging System (Forum Moderation সম্প্রসারণ)
- ✅ **Extra Phase** — Public Profile/Portfolio Share (Seesaw-অনুপ্রাণিত)
- ✅ **Extra Phase** — Community Shared Deck (AnkiWeb-অনুপ্রাণিত)
- ✅ **Extra Phase** — Image Occlusion Flashcard (Anki-অনুপ্রাণিত)
- ✅ **Extra Phase** — Admission Prep: Medical/BUET/DU (নেগেটিভ মার্কিং সিমুলেশন)
- ✅ **Extra Phase** — Option Shuffle সম্প্রসারণ + KaTeX Math Rendering
- ✅ **Extra Phase** — Exam Anxiety Relief: Breathing Exercise (Box Breathing)
- ✅ **Extra Phase** — Wrong-Answer Misconception Tagging
- ✅ **Extra Phase** — AI Content Moderation (Forum)
- ✅ **Extra Phase** — Confidence-Based Answering
- ✅ **Extra Phase** — Peer Comparison in Adaptive Practice
- ✅ **Extra Phase** — Simplified Item-Difficulty Calibration
- ✅ **Extra Phase** — Notification Digest (Weekly Email Summary)
- ✅ **Extra Phase** — Note-to-Flashcard Converter
- ✅ **Extra Phase** — MCQ Keyboard Navigation (Accessibility)
- ✅ **Extra Phase** — Wrong-Answer → Flashcard কনভার্টার
- ✅ **Extra Phase** — Daily Flashcard Review Queue Reminder
- ✅ **Extra Phase** — Calendar View (মাসিক)
- ✅ **Extra Phase** — Daily Motivational Quote
- ✅ **Extra Phase** — In-App Notification Center
- ✅ **Extra Phase** — Reading Progress Bar (Per Chapter)
- ✅ **Extra Phase** — Personal Goal Setting (GPA Target)
- ✅ **Extra Phase** — PWA Install Prompt ("Add to Home Screen" ব্যানার)
- ✅ **Extra Phase** — Downloadable PDF Notes (Topic Notes + Formula Sheet)
- ✅ **Extra Phase** — Pretest to Skip Known Topics
- ✅ **Extra Phase** — Habit Tracker
- ✅ **Extra Phase** — Peer Note Sharing
- ✅ **Extra Phase** — Push Notification (Web Push, VAPID)
- ✅ **Extra Phase** — Public offline shell + explicit Habit mutation IndexedDB queue (unsupported actions-এর fake full-sync claim removed)
- ✅ **Content Update** — Bangla/English/ICT Question Bank Seed
- ✅ **Bug Fix** — Task ও Study Plan Item XP Farming বাগ
- ✅ **UX Improvement** — CQ প্রশ্নে LaTeX (MathText) রেন্ডারিং
- ✅ **Real-time Upgrade** — Quiz Battle (Polling → Server-Sent Events)
- ✅ **Feature Extension** — Misconception Tagging CQ-তে সম্প্রসারণ
- ✅ **Privacy/Security** — Account Deletion / Data Export
- ✅ **UX Improvement** — Admin Question Manager এ MathText Preview মোড
- ✅ **Content Update** — Physics 1st Paper Topic Notes+Formula Sheet Seed (১১টা টপিক)
- ✅ **Content Update** — Physics 2nd Paper Topic Notes+Formula Sheet Seed (৮টা টপিক)
- ✅ **Content Update** — Chemistry 1st+2nd Paper Topic Notes+Formula Sheet Seed (৯টা টপিক)
- ✅ **Content Update** — Biology 1st Paper Topic Notes+Formula Sheet Seed (১১টা টপিক)
- ✅ **Content Update** — Biology 2nd Paper Topic Notes+Formula Sheet Seed (৯টা টপিক)
- ✅ **Content Update** — Higher Math 1st Paper Topic Notes+Formula Sheet Seed (১০টা টপিক)
- ✅ **Content Update** — Higher Math 2nd Paper Topic Notes+Formula Sheet Seed (১০টা টপিক)
- ✅ **Content Update** — ICT Topic Notes+Formula Sheet Seed (৬টা টপিক, নতুন কোড ব্লক সাপোর্ট সহ)
- ✅ **Content Update** — বাংলা ১ম+২য় পত্র Topic Notes+Formula Sheet Seed (৪টা টপিক)
- ✅ **Content Update** — English 1st+2nd Paper Topic Notes+Formula Sheet Seed (৪টা টপিক) — সম্পন্ন (সব বিষয়ের isImportan
- ✅ **Content Update** — Physics 1st Paper CQ (সৃজনশীল প্রশ্ন) Seed (বাকি ১০টা isImportant টপিক)
- ✅ **Content Update** — Physics 2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed (বাকি ৬টা isImportant টপিক) — সম্পন্ন (Physics ১ম+২য়
- ✅ **Content Update** — Chemistry 1st+2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed (বাকি ৭টা isImportant টপিক) — সম্পন্ন (Physics+
- ✅ **Content Update** — Biology 2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed (বাকি ৮টা isImportant টপিক) — সম্পন্ন (Physics+Chemis
- ✅ **Content Update** — Higher Math 1st Paper CQ (সৃজনশীল প্রশ্ন) Seed (বাকি ৯টা isImportant টপিক)
- ✅ **Content Update** — Higher Math 2nd Paper CQ (সৃজনশীল প্রশ্ন) Seed (বাকি ৯টা isImportant টপিক) — সম্পন্ন 🐛 একটি টপিক
- ✅ **Content Update** — ICT CQ (সৃজনশীল প্রশ্ন) Seed (সব ৬টা isImportant টপিক)
- 🎉 **মাইলফলক** — সব ১৩টা বিষয়ের সব ৮২টা isImportant টপিকে Notes+Formula Sheet এবং CQ (সৃজনশীল প্রশ্ন) কভারেজ ১০০
- ✅ **Content Update** — Physics MCQ Question Bank Gap Fix (৪টা isImportant টপিক, ২০টা নতুন প্রশ্ন)
- ✅ **Content Update** — Higher Math MCQ Question Bank Gap Fix (১১টা isImportant টপিক, ৫৫টা নতুন প্রশ্ন)
- ✅ **Content Update** — Biology MCQ Question Bank Gap Fix (৯টা isImportant টপিক, ৪৫টা নতুন প্রশ্ন) — সম্পন্ন ⚠️ Shared D
- ✅ **Content Update** — Chemistry+ICT MCQ Question Bank Gap Fix (১২টা isImportant টপিক, ২৯টা নতুন প্রশ্ন, append-only প্যাটা
- ✅ **UI/UX Polish** — Route-Level Loading Skeletons (৮টা ভারী পেজে + global fallback)
- ✅ **UI/UX Polish** — Dynamic Route Loading Skeletons সম্প্রসারণ (৬টা dynamic route পেজে)
- ✅ **Accessibility Fix** — Icon-Only Button `aria-label` (৫৩টা ফাইলে ৪৩টা+ instance ফিক্স)
- ✅ **Accessibility Fix** — Color Contrast (WCAG AA) অডিট ও ফিক্স (৩৮টা ফাইলে ৭৩টা instance)
- ✅ **Accessibility Fix** — Keyboard Navigation অডিট ও ফিক্স + `/notifications` middleware বাগ ফিক্স
- ✅ **UI/UX Polish** — Auth ফর্ম ইনলাইন ভ্যালিডেশন ফিডব্যাক (Login/Register/Forgot/Reset Password)
- ✅ **UI/UX Polish** — Settings ফর্ম ইনলাইন ভ্যালিডেশন ফিডব্যাক (Profile/Password/Public Profile Slug)
- ✅ **UI/UX Polish** — Student-Facing ফর্ম ইনলাইন ভ্যালিডেশন (Forum Post/Flashcard Deck+Card/Class Routine)
- ✅ **UI/UX Polish** — Password Visibility Toggle (Show/Hide) — সব ৭টা password ফিল্ডে
- ✅ **UI/UX Polish** — Styled Confirm Dialog (browser confirm() প্রতিস্থাপন, ১৩টা জায়গায়)
- ✅ **UI/UX Polish** — Relative Time Formatting ("৫ মিনিট আগে") — Forum/Notification এ
- ✅ **বাগ ফিক্স** — Clipboard Copy Error Handling (নতুন `lib/clipboard.ts` utility)
- ✅ **UI/UX Polish** — Unsaved Changes Warning (beforeunload) — নোট এডিটর ও ফোরাম পোস্টে
- ✅ **UI/UX Polish** — Global Search Keyboard Navigation (Arrow Keys + Enter, ARIA Combobox)
- ✅ **UI/UX Polish** — Autofill Autocomplete Attributes (Auth/Settings ফর্মে)
- ✅ **Accessibility Fix** — আরও ৪টা মিসিং Icon-Only aria-label (follow-up অডিট)
- ✅ **বাগ ফিক্স** — Number Input Validation (Empty/NaN handling, Quiz Battle+Live Exam ফর্ম)
- 🔬 **Deep Research** — প্রতিযোগী প্ল্যাটফর্ম (Facebook/Instagram/TikTok/Duolingo, বিশেষভাবে বাংলাদেশী readingroombd.com
- ✅ **নতুন ফিচার — Reading Room (Virtual Study Room / Body Doubling)** — camera/video ছাড়া ৫টা প্রি-সেট থিমড রুমে নীরবে একসাথে পড়াশোনা, live presence, ambient sound, XP re
- ✅ **UI/UX Polish** — Duolingo-স্টাইল Button Tactile Press Effect (3D "sink" অ্যানিমেশন, সব বাটনে)
- ✅ **নতুন ফিচার — Accent Color Theme** — ডিফল্ট + ৫টা curated রঙ (Reading Room থিমের সাথে মিলিয়ে), Settings এ পিকার, localStorage persist
- ✅ **নতুন ফিচার — Reading Room Study Time Leaderboard** — Daily/Weekly/Monthly, readingroombd.com এর Study Leaderboard কনসেপ্ট থেকে অনুপ্রাণিত
- ✅ **Accessibility Fix** — Border/Background Color Contrast (WCAG 1.4.11, ১২টা ফাইলে ১৩টা instance)
- ✅ **বাগ ফিক্স** — Forum Reply-level Timestamp (আগে থেকে স্বীকৃত gap সম্পূর্ণ করা)
- ✅ **Accessibility Fix** — Notification Bell/Center Nested-Interactive HTML ফিক্স (আগে থেকে স্বীকৃত gap সম্পূর্ণ করা) — সম্পন
- ✅ **UI/UX Polish + বাগ ফিক্স** — Admin Panel ফর্ম ইনলাইন ভ্যালিডেশন (Subject/Chapter/Topic Manager) + ৩টা PATCH endpoint এ মিসিং serv
- ✅ **UI/UX Polish** — Topic Manager Unsaved Changes Warning (আগে থেকে স্বীকৃত gap সম্পূর্ণ করা)
- ✅ **UI/UX Polish** — Task Manager Title ইনলাইন ভ্যালিডেশন ফিডব্যাক (আগে থেকে স্বীকৃত gap সম্পূর্ণ করা)
- ✅ **বাগ ফিক্স** — Question/CQ Question PATCH endpoint এ মিসিং server-side validation ফিক্স
- ✅ **বাগ ফিক্স** — Class Routine PATCH endpoint এ মিসিং validation (empty label bypass + day/time range check) ফিক্স
- ✅ **নতুন ফিচার — Reading Room × Study Group Integration + Synced Pomodoro** — গ্রুপ সদস্যদের live Reading Room presence + সবার জন্য সিঙ্ক করা global Pomodoro টাইমার
- ✅ **UI/UX Polish** — Question Manager, CQ Question Manager, Notification Broadcast Form এ ইনলাইন ভ্যালিডেশন + Unsaved Cha
- ✅ **অ্যাক্সেসিবিলিটি বাগ ফিক্স — Keyboard Tab-order/Focus-trap অডিট** — Notification Bell এ Nested-Interactive `<button>` bug (গুরুতর, invalid HTML) + Reading Room রুম-কার্
- ✅ **গুরুতর বাগ ফিক্স — "P2025 500-instead-of-404" সিস্টেমেটিক অডিট** — ১৪টা endpoint এ existence check ছাড়া সরাসরি Prisma `update()`/`delete()` কল করায় অস্তিত্বহীন ID দি
- ✅ **গুরুতর বাগ ফিক্স — XP-Double-Award প্যাটার্ন অডিট** — Topic Progress XP Farming (MASTERED টগল করে অসীম XP) + Study Group Weekly Bonus Race Condition (over
- ✅ **নতুন ফিচার — Bottom Navigation Bar (মোবাইল)** — Duolingo/Instagram-স্টাইল ৫-আইকন bottom tab bar (হোম/শেখো/প্র্যাকটিস/প্ল্যানার/আরও), শুধু মোবাইলে, "
- ✅ **গুরুতর বাগ ফিক্স — DELETE Endpoint Cascade অডিট** — Custom Question Set ডিলিট করলে চলমান Quiz Battle/Live Exam এর প্রশ্ন হারিয়ে যাওয়ার bug (orphan ref
- ✅ **নতুন ফিচার — "আজকের পড়া" (Today's Focus) + নমনীয় Duration Auto Study Plan** — Dashboard এ প্রতিদিনের নির্দিষ্ট পড়া prominently দেখানো কার্ড, miss করা টপিক পরের দিন "গতকালের বাকি
- ✅ **নতুন ফিচার — Exam-Day Retention Forecast** ("পরীক্ষার দিনে কত % মনে থাকবে?") — Analytics পেজে FSRS ফ্ল্যাশকার্ড ডেটা থেকে exam date পর্যন্ত predicted retention % এর প্রক্ষেপণ (line chart + subject breakdown), কোনো migration/AI cost ছাড়াই বিদ্যমান FSRS stability ডেটা পুনর্ব্যবহার করে — **সম্পন্ন**
- ✅ **গুরুতর বাগ ফিক্স — Forum Best Answer XP Farming** — একই reply বারবার "সেরা উত্তর" মার্ক/আনমার্ক করে (toggle-cycling) অসীম XP পাওয়ার bug আবিষ্কার+ফিক্স,
- ✅ **গুরুতর বাগ ফিক্স — Task/StudyPlanItem/TopicProgress XP Race Condition অডিট** — একই ক্লাসের bug (concurrent request দিয়ে) Task/StudyPlanItem/TopicProgress তিনটাতেই পাওয়া গেছে ও ফ
- ✅ **গুরুতর বাগ ফিক্স — Quiz Battle/Quiz Duel/Reading Room XP Race Condition অডিট** — একই ক্লাসের bug Quiz Battle (submit+end), Quiz Duel (submit+finalize), ও Reading Room (leave/auto-en
- ✅ **নিরাপত্তা অডিট — Daily Streak/Streak Freeze Race Condition** — Task/StudyPlanItem/TopicProgress/Quiz Battle/Duel/Reading Room XP অডিটের ধারাবাহিকতায় `updateStreak
- ✅ **নতুন ফিচার — Content Report Resolution Notification** — Forum এ কনটেন্ট রিপোর্ট করার পরে admin resolve/dismiss করলে রিপোর্টকারীকে বিদ্যমান Notification সিস্
- ✅ **গুরুতর বাগ ফিক্স — Study Group/Quiz Battle Capacity Race Condition অডিট** — `maxMembers`/`maxPlayers` capacity limit concurrent join দিয়ে সম্পূর্ণ bypass হয়ে যাওয়ার bug আবিষ
- ✅ **নতুন ফিচার — Voice Input (কথা বলে প্রশ্ন করা)** — AI Doubt Solver ও PDF Chat উভয় জায়গায় ব্রাউজারের নিজস্ব Web Speech API (bn-BD) দিয়ে কথা বলে টেক্
- ✅ **নতুন ফিচার — সাপ্তাহিক রিক্যাপ (Weekly Study Recap)** — Spotify Wrapped/ChatGPT "Your Year"-স্টাইল থেকে অনুপ্রাণিত, Dashboard এ এই সপ্তাহের XP/পড়ার সময়/কু
- ✅ **গুরুতর বাগ ফিক্স — Forum Vote (Upvote/Downvote) Race Condition** — concurrent একই পোস্ট/রিপ্লাইতে প্রথমবার ভোট দিলে unique constraint crash (৫০০ Internal Server Error)
- ✅ **গুরুতর বাগ ফিক্স — Content Report Race Condition** — Forum Vote বাগের একই ক্লাস (concurrent প্রথম-রিপোর্টে unique constraint crash, ৫০০ error), `try/catc
- ✅ **গুরুতর বাগ ফিক্স — Peer Note Helpful Vote Race Condition** — Forum Vote/Content Report বাগের একই ক্লাস (concurrent প্রথম-ভোটে crash), try/catch + conditional cou
- ✅ **নতুন ফিচার — CQ Practice + Mock Exam Voice Input সম্প্রসারণ** — বিদ্যমান ভয়েস ইনপুট বাটন CQ (সৃজনশীল প্রশ্ন) এর ৪টা প্রশ্নের উত্তর লেখার Textarea তে যোগ করা হয়েছে
- ✅ **নতুন ফিচার — মিস্টেক ভল্ট (Mistake Vault)** — BD competitor (SATT Academy) থেকে অনুপ্রাণিত, ভুল করা প্রশ্নগুলো স্বয়ংক্রিয়ভাবে জমা হয়ে ডেডিকেটেড
- ✅ **গুরুতর বাগ ফিক্স — Habit Tracker Toggle Race Condition** — Forum Vote/Content Report/Peer Note Helpful Vote বাগের একই ক্লাস (concurrent প্রথম-টগলে unique const
- ✅ **গুরুতর বাগ ফিক্স — Quiz Duel Join Capacity Race Condition** — একটা WAITING duel এ concurrent একাধিক ইউজার join করলে capacity bypass হয়ে সবাই সফল হতো (opponent sl
- ✅ **নতুন ফিচার — Mistake Vault Reminder Card (Dashboard)** — Review Queue Card এর প্যাটার্নে, ভুল প্রশ্ন জমা থাকলে Dashboard এ prominently reminder দেখিয়ে disco
- ✅ **নতুন ফিচার — AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake)** — Duolingo ২০২৬ "Explain My Answer" থেকে অনুপ্রাণিত, Practice Result পেজে ভুল MCQ উত্তরের জন্য AI on-d
- ✅ **UI/UX বড় রিডিজাইন — Sidebar Navigation + উজ্জ্বল Dark Mode** — ব্যবহারকারীর ফিডব্যাক অনুযায়ী সব ২০টা Tool/মডিউল এখন lg+ স্ক্রিনে একটা professional, categorized (প
- ✅ **সম্প্রসারণ — Explain My Mistake এখন Mock Exam ও Admission Prep এও** — আগে শুধু Practice Result পেজে ছিল, এখন Mock Exam MCQ Review ও Admission Prep প্রশ্নভিত্তিক রিভিউতেও
- ✅ **Admin Panel Power-up** — নতুন Admin অ্যাকাউন্ট তৈরি (abn21.noman@gmail.com), User Management এ Search/Filter/Sort/Pagination/
- ✅ **Content Report Bulk Actions** — Admin Panel Power-up এ ডকুমেন্টেড সীমাবদ্ধতা পূরণ করা হলো, Reports প্যানেলে এখন চেকবক্স দিয়ে একাধিক
- ✅ **Admin Panel UI/UX Polish** — Admin sidebar এ Active-Route Highlighting যোগ, সম্পূর্ণ Mobile-Responsive (hamburger + bottom-sheet)
- ✅ **UI/UX Polish — Loading Skeletons সম্প্রসারণ** — বাকি থাকা ১০টা DB-query পেজে (Saved Topics/Settings/Duel Lobby, Practice+CQ+Live Exam Result পেজ, Ad
- ✅ **প্রিমিয়াম থিম আপগ্রেড — নতুন ফন্ট + Animation** — নতুন প্রিমিয়াম Display হেডিং ফন্ট (Baloo Da 2, বাংলা+লাতিন) সব h1-h4 এ অটো-প্রয়োগ, Landing/Login/R
- ✅ **`hover-lift` Rollout — প্ল্যাটফর্ম-জুড়ে Consistent Hover Animation** — আগের ভিন্ন ভিন্ন `hover:shadow-md transition-shadow`/`hover:shadow-lg transition-shadow` প্যাটার্ন (
- ✅ **প্রিমিয়াম থিম — বাকি Auth পেজে সম্প্রসারণ** — Forgot Password/Reset Password/Onboarding পেজেও এখন একই Aurora gradient + glassmorphism + glow-ring
- ✅ **প্রিমিয়াম থিম — Badges ও Leaderboard পেজে অ্যানিমেশন পলিশ** — Badges পেজে অর্জিত ব্যাজে stagger entrance + hover-lift (অনর্জিত grayscale ব্যাজে কোনো hover effect
- ✅ **প্রিমিয়াম থিম — Analytics ও Study Group পলিশ** — Analytics Dashboard এ FadeIn হেডার + Overall Stats কার্ডে stagger+hover-lift, Study Group এ Reading
- ✅ **প্রিমিয়াম থিম — Duel/Quiz Battle/Mock Exam পলিশ** — Duel Lobby এর ওপেন চ্যালেঞ্জ লিস্টে stagger animation, Mock Exam Mode Selector এ stagger animation,
- ✅ **প্রিমিয়াম থিম — Admission/Forum/Notifications পলিশ** — Admission Prep Hub এর পরীক্ষা কার্ডে stagger animation, Forum Feed এর পোস্ট লিস্টে stagger animation
- ✅ **প্রিমিয়াম থিম — Flashcards ও Reading Room পলিশ** — Flashcards Hub হেডারে FadeIn + ডেক গ্রিডে stagger animation, Community Discover Deck Browser এ stagg
- ✅ **প্রিমিয়াম থিম — Intro পেজ ও Chapter Selection পলিশ** — Mistake Vault/Timed Drill/Smart Practice এর হেডারে FadeIn, Practice ও CQ Practice এর Chapter Selecti
- ✅ **🐛 গুরুতর বাগ ফিক্স — Exam Submit Race Condition (৫টা endpoint)** — প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত: Content Report action, Mock Exam MCQ/CQ submit, Admission Moc
- ✅ **🐛 বাগ ফিক্স — Study Pet Lazy-Create Race Condition** — প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত: `GET /api/study-pet` এ নতুন ইউজারের প্রথমবার concurrent একাধি
- ✅ **🐛 বাগ ফিক্স — Per-User Capacity Limit Race Condition (৩টা endpoint)** — প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত: Habit (MAX ১০টা), Custom Question Set (MAX ২০টা), PDF Chat Up
- ✅ **অ্যাক্সেসিবিলিটি ও Mobile Responsiveness গভীর অডিট (রাউন্ড ২)** — Icon-only Button `aria-label` (দ্বিতীয় ফলো-আপ, ১১টা ফাইলে ১৪টা+১টা `dialog.tsx` fix) ও Form Input/T
- ✅ **📱 Mobile Responsiveness অডিট — Horizontal Overflow বাগ (২টা)** — Playwright দিয়ে ৩৭৫px viewport এ ২৫টা+ পেজ (student+admin) সিস্টেম্যাটিক স্ক্যান করে Dashboard হেডা
- ✅ **🐛⌨️ গুরুতর বাগ ফিক্স — Keyboard Focus Trap (upstream base-ui#4678 workaround)** — Playwright দিয়ে লাইভ Tab-key সিমুলেশনে আবিষ্কৃত: Dialog/Modal (GlobalSearch, Create Deck ইত্যাদি) খ
- ✅ **🎨 Color Contrast (WCAG AA) Re-audit (রাউন্ড ৩)** — আগের ২ রাউন্ড অডিটের (text-color, border-color) পরে নতুন যোগ হওয়া সব ফিচার/কম্পোনেন্ট (প্রিমিয়াম থ
- ✅ **⚡ Performance/Query Optimization অডিট — মিসিং DB Index (৩টা কলাম)** — Prisma schema সিস্টেম্যাটিক স্ক্যান করে (FK কলাম বনাম `@@index`/`@@unique` leftmost coverage) `Study
- 🔧 **Database Migration — নতুন Supabase প্রজেক্টে স্থানান্তর** — পুরনো Supabase প্রজেক্ট (region ap-southeast-2) এ persistent connection timeout (Postgres wire-proto
- 🆕 **নতুন ফিচার — হাতে লেখা CQ উত্তর ছবি তুলে জমা দেওয়া (OCR + AI Evaluation)** — বাস্তব HSC পরীক্ষায় ছাত্ররা CQ উত্তর হাতে লেখে, কিন্তু আমাদের CQ Practice এ এতদিন শুধু টাইপ করে উত্
- ✅ **🐛 গুরুতর বাগ ফিক্স — Admin User Ban/Role-Change Race Condition** — প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত: Ban endpoint এ existence check (`findUnique`) থাকা সত্ত্বেও r
- ✅ **🐛 গুরুতর বাগ ফিক্স — Admin Notification Broadcast Race Condition (FK Constraint Crash)** — Bug Hunt চালিয়ে আবিষ্কৃত: `POST /api/admin/notifications/broadcast` এ আগে `prisma.user.findMany()`
- ✅ **🐛 গুরুতর বাগ ফিক্স — Admin CSV Bulk Question Upload Race Condition (FK Constraint Crash)** — একই "bulk read-then-bulk-write with FK dependency" বাগ ক্লাসের আরেকটা instance (Notification Broadca
- ✅ **🐛 গুরুতর বাগ ফিক্স — Study Plan Background Chunk Generation Race Condition (Double-Fault Crash)** — একই "bulk read-then-bulk-write with FK dependency" বাগ ক্লাসের তৃতীয় instance, কিন্তু এবার আরও গুরু
- ✅ **🎨 UI Polish — shadcn Tooltip/Select Migration + গুরুতর প্রি-এক্সিস্টিং বাগ ফিক্স (Select Label Bug)** — ব্যবহারকারীর প্রশ্নে ("shadcn কীভাবে সাহায্য করতে পারে") কোডবেস স্ক্যান করে দুইটা gap পাওয়া গেছে: (
- ✅ **🎨 UI Polish — shadcn Checkbox Migration (Topic Manager)** — shadcn কাজ চালিয়ে যাওয়ার সময় `grep -rln 'type="checkbox"'` দিয়ে পুরো কোডবেস আবার স্ক্যান করে `co
- ✅ **🐛 গুরুতর বাগ ফিক্স — Reading Room Multi-Active-Session Race Condition (Data Integrity Bug)** — আরেকটা Bug Hunt রাউন্ডে আবিষ্কৃত: `joinReadingRoom()` এ read-then-write প্যাটার্ন ছিল (পুরনো active
- ✅ **🐛 গুরুতর বাগ ফিক্স — Reading Room Heartbeat vs Leave Race Condition (Second Instance in Same File)** — Reading Room Join race fix করার পরপরই একই ফাইলে (`lib/reading-room.ts`) আরেকটা সম্পর্কিত race condit
- ✅ **🐛 গুরুতর বাগ ফিক্স — Notification/Habit PATCH-DELETE Race Condition (নতুন ২টা endpoint)** — Reading Room এর দুইটা race condition ফিক্স করার পরে আরও Bug Hunt চালিয়ে established "existence chec
- ✅ **🐛 গুরুতর বাগ ফিক্স — Class Routine Slot PATCH-DELETE Race Condition (৪র্থ instance)** — Notification/Habit fix এর ধারাবাহিকতায় আরও Bug Hunt চালিয়ে `PATCH/DELETE /api/routine/[slotId]` এ
- ✅ **🐛 গুরুতর বাগ ফিক্স — User Settings vs Delete Account Race Condition (৭টা endpoint)** — Class Routine Slot fix এর ধারাবাহিকতায় আরও Bug Hunt চালিয়ে একটা নতুন ভ্যারিয়েন্ট আবিষ্কার হয়েছে:
- ✅ **🐛 গুরুতর বাগ ফিক্স — Forum Post GET/DELETE/Resolve Race Condition** — User Settings fix এর ধারাবাহিকতায় Forum Post endpoint গুলো (`GET/DELETE /api/forum/posts/[postId]`,
- ✅ **🐛 গুরুতর বাগ ফিক্স — Flashcard Deck/Card Race Condition (৪টা endpoint)** — Forum Post fix এর ধারাবাহিকতায় Flashcard Deck এলাকা রিভিউ করে ৪টা endpoint এ একই bug class এর insta
- ✅ **🐛 গুরুতর বাগ ফিক্স — Public Profile PATCH vs Delete Account Race Condition (মিসড ৮ম endpoint)** — Flashcard fix এর ধারাবাহিকতায় Study Group/PDF Chat/Peer Notes এলাকা রিভিউ করার সময় `app/api/user/p
- ✅ **🎨 UI Polish — shadcn Alert Component Migration (১১টা লোকেশন, ১৪টা callout instance)** — Public Profile fix এর পরে ব্যবহারকারীর পছন্দে শুরু হওয়া non-race-condition UI polish টাস্ক
- ✅ **🎨 UI Polish — shadcn Alert Component Migration রাউন্ড ২ (৩টা নতুন লোকেশন, ৪টা callout instance)** — রাউন্ড ১ এ বাদ দেওয়া `predicted-gpa-card.tsx` এর Target vs Actual (৩-way conditional neutral/succes
- ✅ **🐛 গুরুতর বাগ ফিক্স — Study Group Leave Race Condition (Multi-Step Business Logic)** — Alert Migration এর পরে আরও Bug Hunt চালিয়ে `lib/study-group.ts` এর `leaveStudyGroup()` এ একটা নতুন
- ✅ **🐛 গুরুতর বাগ ফিক্স — PDF Chat Message vs Document Delete Race Condition (Long-Running AI Call এর জন্য নতুন সমাধান)** — Study Group Leave fix এর ধারাবাহিকতায় PDF Chat এলাকায় `POST /api/pdf-chat/[documentId]/messages` এ
- ✅ **🐛 গুরুতর বাগ ফিক্স — Mind Map/Flashcard AI-Generation vs Delete Race Condition (৬টা endpoint, "সমাধান ৪" এর সিস্টেম্যাটিক অডিট)** — established "সমাধান ৪" ক্লাসের broad grep audit চালিয়ে আরও ৫টা "existence check → দীর্ঘ AI call → u
- ✅ **🐛 গুরুতর বাগ ফিক্স — Quiz Duel Multi-Create Race Condition (One-Active-Duel Invariant Bypass)** — Mind Map/Flashcard audit এর ধারাবাহিকতায় Quiz Duel এলাকায় `POST /api/duel` এ Study Group Create এর
- ✅ **🐛 গুরুতর বাগ ফিক্স — Study Plan Generate Multi-Create Race Condition (একই "One-Resource-Per-User" ক্লাস, ৩য় independent instance)** — Quiz Duel fix এর শেষে নথিভুক্ত "একই ইনভ্যারিয়েন্ট ভিন্ন ফিচারে আলাদাভাবে bug হতে পারে" শিক্ষা অনুসর
- 🔍 **Alert Component Migration — চূড়ান্ত Negative-Result Audit** — Study Plan fix এর পরে ব্যবহারকারীর নির্দেশে Alert Migration আবার পুনরায় সিস্টেম্যাটিকভাবে audit করা
- ✅ **🐛 গুরুতর বাগ ফিক্স — Account Deletion Dual-Caller Race Condition (Admin Delete vs Self Delete-Account)** — Admin Panel এলাকা রিভিউ করার সময় `app/api/admin/users/[userId]/route.ts` (DELETE) ও `app/api/user/d
- ✅ **🐛 গুরুতর বাগ ফিক্স — Custom Question Set Delete Race Condition (Double-Delete Crash)** — Admin/User endpoint broad grep audit চালিয়ে `app/api/custom-question-sets/[setId]/route.ts` এর DELE
- ✅ **🐛 গুরুতর বাগ ফিক্স — Study Plan Item PATCH vs Regenerate Race Condition** — broad grep audit চালিয়ে `app/api/study-plan/items/[itemId]/route.ts` এর PATCH এ পাওয়া গেছে যে `xpA
- ✅ **🐛 গুরুতর বাগ ফিক্স — Task PATCH/DELETE Race Condition (Dual Bug)** — broad grep audit ধারাবাহিকভাবে চালিয়ে `app/api/tasks/[taskId]/route.ts` এ একই ফাইলে দুইটা আলাদা bug
- ✅ **🐛 গুরুতর বাগ ফিক্স — Admin Content Management Delete/PATCH Race Condition (৭টা endpoint)** — broad grep audit ধারাবাহিকভাবে চালিয়ে `app/api/admin/` এলাকায় (Forum Post/Reply moderation delete,
- ✅ **🐛 গুরুতর বাগ ফিক্স — Admin Forum Pin ও Note Publish Race Condition (২টা মিসড endpoint)** — Admin Content Management অডিটের পরে ব্যবহারকারীর "Next" নির্দেশে আবার broad grep চালিয়ে ২টা মিসড en
- ✅ **🐛 গুরুতর বাগ ফিক্স — Image Upload Size Validation Missing (৪টা endpoint, non-race-condition)** — ব্যাপক race-condition/authorization audit শেষ হওয়ার পরে সম্পূর্ণ ভিন্ন ধরনের bug (input validation)
- ✅ **🐛 গুরুতর বাগ ফিক্স — Missing Text Length Validation (৬টা endpoint, non-race-condition)** — Image Upload Size Validation এর একই "input validation consistency" পাঠ প্রয়োগ করে টেক্সট length lim
- ✅ **🐛 গুরুতর বাগ ফিক্স — Missing Enum Validation (৭টা endpoint, non-race-condition)** — Missing Text Length Validation এর একই "input validation consistency" পদ্ধতি প্রয়োগ করে ইউজার-ইনপুট
- ✅ **🐛 গুরুতর বাগ ফিক্স — Missing Date String Validation (৩টা endpoint, non-race-condition)** — Missing Enum Validation এর একই সিস্টেম্যাটিক পদ্ধতি প্রয়োগ করে `new Date(userInput)` কল করা সব endp
- ✅ **🐛 গুরুতর বাগ ফিক্স — Missing Numeric Input Validation (২টা endpoint, non-race-condition)** — এই সিরিজের পঞ্চম রাউন্ডে numeric ইউজার-ইনপুট (`durationSec`, `maxPlayers`) নেওয়া endpoint ক্রস-চেক
- ✅ **🐛 গুরুতর বাগ ফিক্স — Missing Array Validation (৩টা endpoint, non-race-condition)** — এই সিরিজের ষষ্ঠ রাউন্ডে `for (const a of answers ?? [])` প্যাটার্ন খুঁজে (Mock Exam submit-mcq/submi
- ✅ **🐛 গুরুতর বাগ ফিক্স — Missing Malformed JSON Handling (৭০টা endpoint, non-race-condition, এই সেশনের সবচেয়ে বড় fix)** — এই সিরিজের সপ্তম রাউন্ডে সবচেয়ে ব্যাপক gap পাওয়া গেছে — request body আসলে valid JSON কিনা তা নিয়ে
- ✅ **🐛 গুরুতর বাগ ফিক্স — Missing Enum Validation in GET Query Parameters (৩টা endpoint, non-race-condition)** — এই সিরিজের অষ্টম রাউন্ডে established Enum Validation bug class এর একটা নতুন variant পাওয়া গেছে — আগ
- ✅ **🐛 গুরুতর বাগ ফিক্স — Pagination Integer Overflow Crash (৩টা endpoint, non-race-condition)** — এই সিরিজের নবম রাউন্ডে `skip:`/`take:` (pagination) ব্যবহার করা সব endpoint broad-grep দিয়ে ক্রস-চে
- ✅ **🐛 গুরুতর বাগ ফিক্স — hscBatch Numeric Validation Missing (২টা endpoint, non-race-condition)** — এই সিরিজের দশম রাউন্ডে বাকি থাকা `Number()` conversion call গুলো broad-grep দিয়ে ক্রস-চেক করার সময়
- ✅ **নতুন ফিচার — Formula Quick Search** — পরীক্ষার ঠিক আগে সব বিষয়ের ফর্মুলা শীট (`Topic.formulaSheet`, ৮২টা টপিক) এক জায়গা থেকে সার্চ করে দ
- ✅ **নতুন ফিচার — Bookmark Collections/Folders** — Saved Topics পেজে ইউজার এখন কাস্টম ফোল্ডার তৈরি করে সেভ করা টপিক গুলো গুছিয়ে রাখতে পারবে (যেমন "পরী
- ✅ **নতুন ফিচার — Exam Day Checklist Mode** — Planner পেজে HSC পরীক্ষার আগের রাত ও পরীক্ষার দিনের জন্য একটা চেকলিস্ট (Admit Card, কলম-পেন্সিল, bre
- ✅ **UI/UX রিডিজাইন — Community/Leaderboard/Profile-Settings প্রফেশনাল লুক** — ব্যবহারকারীর ফিডব্যাক ("aro professional kora lagbe") অনুযায়ী বিভিন্ন জনপ্রিয় প্ল্যাটফর্মের ডিজাইন
- ✅ **UI/UX রিডিজাইন রাউন্ড ২ — Glassmorphism প্রিমিয়াম ডিজাইন** — ব্যবহারকারীর ফিডব্যাক ("aro premium design kora, glass morphin use korba") অনুযায়ী Community/Leader
- ✅ **Glassmorphism রাউন্ড ২ এক্সটেনশন — Dashboard/Planner/Learning Hub** — consistency এর জন্য established glassmorphism প্যাটার্ন (Leaderboard/Forum/Settings এ প্রয়োগ করা) আ
- ✅ **Glassmorphism সম্পূর্ণ প্ল্যাটফর্ম-ব্যাপী সম্প্রসারণ** — ব্যবহারকারীর নির্দেশ ("Aro koro sob page a koro") অনুযায়ী established glassmorphism hero-card প্যাট
- ✅ **নতুন ফিচার — Live Study Leaderboard ("এখন কে কে পড়ছে")** — ব্যবহারকারীর অনুরোধ ("Keda kotokkon porbe leaderboard thakbe. Ahon ke ke porte ase") অনুযায়ী establ
- ✅ **UI/UX Polish — Premium Card Micro-interactions** — ব্যবহারকারীর অনুরোধে ("aro premium mone howar jonno micro-interaction/transition gobeshona koro") `w
- ✅ **🐛 গুরুতর বাগ ফিক্স — Boolean Field Validation Missing/Type-Coercion Bug (৯টা endpoint, non-race-condition)** — এই সিরিজের একাদশ রাউন্ডে established Enum/Numeric Validation এর একই "input validation consistency" প
- ✅ **🐛 গুরুতর বাগ ফিক্স — boardYear/Calendar Numeric Validation Missing (৭টা endpoint, non-race-condition)** — এই সিরিজের দ্বাদশ রাউন্ডে established hscBatch Numeric Validation bug-এর একই ক্লাসের বাকি `Number()`
- ✅ **🐛 গুরুতর বাগ ফিক্স — User Name/Board Missing Length+Enum Validation (৪টা endpoint, non-race-condition, self-lockout সাইড-ইফেক্ট সহ)** — এই সিরিজের ত্রয়োদশ রাউন্ডে established "একই লজিক্যাল ইনভ্যারিয়েন্ট, create ও update endpoint এ ভিন
- ✅ **🐛 গুরুতর বাগ ফিক্স — Flashcard front/back Missing Text Length Validation (২টা কেস, non-race-condition)** — এই সিরিজের চতুর্দশ রাউন্ডে established Missing Text Length Validation bug class broad-grep দিয়ে আবা
- ✅ **UI/UX পলিশ — Mobile Responsiveness Audit (২টা bug ফিক্স)** — ব্যবহারকারীর অনুরোধে ("UI UX polish ba redesign koro") ২০২৬ সালের mobile UX best practice নিয়ে গবেষ
- ✅ **নতুন ফিচার আপগ্রেড — Live Exam ছবি-আপলোড এখন Extract vs Generate স্মার্ট ডিটেকশন করে** — ব্যবহারকারীর অনুরোধে ("jodi kew kono page er image upload kore tahole AI oita scan kore Mcq generate
- ✅ **নতুন ফিচার — Quiz Duel (১-বনাম-১) এখন নিজের CustomQuestionSet দিয়েও খেলা যায়** — Smart Live Exam ভিশনের ধারাবাহিকতায় ব্যবহারকারী নিজে scope বেছে দিয়েছেন ("Duel + ছবির প্রশ্ন সংযোগ
- ✅ **নতুন ফিচার — Live Exam Result এ AI দিয়ে ব্যাখ্যা** — Smart Live Exam ভিশনের বাকি অংশ থেকে (`ask_user` দিয়ে জিজ্ঞেস করে "Live Exam Result এ AI ব্যাখ্যা"
- ✅ **নতুন ফিচার — Live Exam এ CQ (সৃজনশীল প্রশ্ন) সাপোর্ট** — Smart Live Exam ভিশনের বাকি অংশ থেকে (`ask_user` দিয়ে জিজ্ঞেস করে নির্বাচিত), established design de
- 🔄 **বড় UI/UX Redesign শুরু — HSC Ultimate Emerald Brand Refresh (Foundation ধাপ সম্পন্ন)** — ব্যবহারকারী একটা সম্পূর্ণ "HSC Ultimate — 80 Screens Mobile-First Reference Kit" (একটা self-containe
- ✅ **Landing Page Redesign (Emerald Brand Refresh এর ধারাবাহিকতায়)** — ব্যবহারকারীর অনুরোধে ("Landing page ta aro valo vabe design koro") established Landing page (`app/pa
- ✅ **Site-wide Brand Identity Consistency (Emerald Brand Refresh এর ধারাবাহিকতায়)** — ব্যবহারকারীর "continue" নির্দেশে, Landing Page Redesign এর পরে established পুরো কোডবেসে ছড়িয়ে থাকা
- ✅ **App Icon/Favicon/PWA theme_color + Chart/PDF-Export ব্র্যান্ড কালার Emerald Refresh (Emerald Brand Refresh এর ধারাবাহিকতায়)** — Site-wide Brand Identity Consistency সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- ✅ **Generic Hero Banner/Decorative Element Emerald Consistency (Emerald Brand Refresh এর ধারাবাহিকতায়)** — App Icon/theme_color/Chart রাউন্ড সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- ✅ **Generic "AI ব্যাখ্যা/ফিডব্যাক" Callout Emerald Consistency (Emerald Brand Refresh এর ধারাবাহিকতায়)** — Generic Hero Banner রাউন্ড সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- ✅ **Generic Success Indicator Green→Emerald Consistency (Emerald Brand Refresh এর ধারাবাহিকতায়)** — AI Callout রাউন্ড সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- ✅ **nav-modules.ts Hero Gradient WCAG Non-Text Contrast Fix (Emerald Brand Refresh এর ধারাবাহিকতায়)** — Success Indicator রাউন্ড সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- 🐛 **বাগ ফিক্স — Accent Color Picker এ ভুল "ডিফল্ট (grayscale)" লেবেল (Emerald Brand Refresh এর পরে stale বর্ণনা)** — nav-modules.ts Hero Gradient Fix রাউন্ড সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- 🐛 **বাগ ফিক্স — Transactional Email Template এ পুরনো ব্র্যান্ড রঙ (Emerald Brand Refresh এর পরে stale)** — Accent Color Picker বাগ ফিক্সের পরে ব্যবহারকারী "Next" বলেছেন
- 🐛 **বাগ ফিক্স — PDF Export এ দ্বিতীয় ইন্ডিগো hex variant (Emerald Brand Refresh এর পরে stale)** — Email Template বাগ ফিক্স রাউন্ড সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- 🐛 **বাগ ফিক্স — PWA Offline Fallback Page এ পুরনো ব্র্যান্ড রঙ (Emerald Brand Refresh এর পরে stale)** — PDF Export বাগ ফিক্স রাউন্ড সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" বলেছেন
- ⏳ **Phase 9** — Deploy (এখনও শুরু হয়নি, প্রয়োজনমতো আরও ফিচার যোগ হবে)
- 📱 **Mobile App পরিকল্পনা**: Deploy এর পরে Capacitor দিয়ে ফ্রি
</details>

> প্রতিটা ফেজে ঠিক কী কী তৈরি ও লাইভ টেস্ট করা হয়েছে তার বিস্তারিত
> রেকর্ড আছে [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) এ।

---

## 🖥️ লোকালি সেটআপ ও রান করার নিয়ম (VS Code)

### ধাপ ১: প্রয়োজনীয় টুল ইনস্টল আছে কিনা চেক করুন
- **Node.js** (v22 বা তার বেশি) — [nodejs.org](https://nodejs.org)
- **VS Code** — [code.visualstudio.com](https://code.visualstudio.com)

```bash
node -v   # v22.x বা তার বেশি হতে হবে
```

### ধাপ ২: প্রজেক্ট ফোল্ডার VS Code এ খুলুন
`hsc-ultimate` ফোল্ডারটা VS Code দিয়ে খুলুন (`File → Open Folder`)

### ধাপ ৩: Smart setup চালান
```bash
npm run setup
```
Lockfile unchanged থাকলে পরেরবার dependency install স্বয়ংক্রিয়ভাবে skip হবে।

### ধাপ ৪: Database
এই প্রজেক্ট **Supabase PostgreSQL** ব্যবহার করছে (cloud-hosted)। `.env` ও `.env.local`
ফাইলে ইতিমধ্যে connection string বসানো আছে, তাই আলাদা কিছু সেটআপ করা লাগবে না।

সব টেবিল ইতিমধ্যে migrate করা আছে। যদি স্কিমাতে নতুন পরিবর্তন আনেন, তাহলে চালান:
```bash
npx prisma migrate dev --name your_change_name
```

> চাইলে `npx prisma studio` চালিয়ে ব্রাউজারে ডেটাবেজ ভিজুয়ালি দেখতে পারবেন (Supabase
> এর নিজস্ব Table Editor থেকেও দেখা যায় — supabase.com/dashboard এ লগইন করে)।

> ⚠️ যদি নিজের Supabase প্রজেক্ট ব্যবহার করতে চান, `.env` ও `.env.local` এ
> `DATABASE_URL` ও `DIRECT_URL` পাল্টে দিন (Supabase Dashboard → Project Settings →
> Database → Connection String থেকে পাবেন)।

**Existing/live database MCQ sync (নিরাপদ পদ্ধতি)** — পুরোনো destructive seed script না চালিয়ে আগে read-only reconciliation করুন:

```bash
npm run audit:mcq
npm run db:import-mcq                         # dry-run; কোনো write নয়
npm run db:import-mcq -- --apply              # reviewed manifest ছাড়া apply হবে না
```

Importer append-only, transaction + advisory lock ব্যবহার করে এবং existing MCQ update/delete করে না। বিস্তারিত: [`docs/MCQ_SAFE_IMPORT_2026-08-04.md`](./docs/MCQ_SAFE_IMPORT_2026-08-04.md)।

**Fresh/empty database seed করা** — Legacy seed delete/recreate করে, তাই default-এ blocked। শুধু disposable/local database ও verified backup-এর পরে:
```bash
ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND_THIS_DELETES_DATA npm run db:seed
```
Remote database-এ অতিরিক্ত `ALLOW_REMOTE_DESTRUCTIVE_SEED=REMOTE_DATABASE_BACKUP_VERIFIED` ছাড়া চলবে না। Existing live content sync-এর জন্য seed নয়—reviewed append-only import ব্যবহার করুন।

MCQ প্রশ্নের legacy seed-গুলোতেও একই destructive guard প্রযোজ্য:
```bash
npm run db:seed-questions
npm run db:seed-questions-2
```
প্রথমটা ১১টা গুরুত্বপূর্ণ টপিকে ৩২টা বাস্তব MCQ, দ্বিতীয়টা আরও ৪৪টা টপিকে ৯৪টা
বাস্তব MCQ যোগ করে (Mock Exam এর জন্য কভারেজ বাড়াতে) — মোট ১২৬টা প্রশ্ন। **এগুলো legacy fresh-DB seed; সংশ্লিষ্ট topic-এর row delete/recreate করে। Live DB sync-এর জন্য উপরের `audit:mcq` + `db:import-mcq` workflow-ই ব্যবহার করুন।**

Badge সিড করতে (Gamification এর জন্য):
```bash
npm run db:seed-badges
```
এটা ১৪টা badge তৈরি করবে (streak, mastery, quiz, flashcard, task, pomodoro, level milestone)।

CQ (সৃজনশীল প্রশ্ন) সিড করতে:
```bash
npm run db:seed-cq
npm run db:seed-cq-2
```
প্রথমটা ৩টা (Physics, Biology, Chemistry), দ্বিতীয়টা আরও ৬টা (Physics 2nd,
Chemistry 1st, Biology 2nd, Higher Math 1st ও 2nd) CQ প্রশ্ন model answer
সহ তৈরি করে — মোট ৯টা, এখন সব ৮টা বিজ্ঞান বিষয়ে অন্তত ১টা CQ আছে।

Previous-Year Board Question সিড করতে:
```bash
npm run db:seed-board-questions
```
৪টা গুরুত্বপূর্ণ টপিকে (একক ও পরিমাপ, নিউটনের গতিসূত্র, মোল ধারণা,
সালোকসংশ্লেষণ) ২টা করে মোট ৮টা বাস্তব-ধরনের HSC বোর্ড MCQ প্রশ্ন যোগ করে,
প্রতিটায় বাস্তব বোর্ডের নাম ও বছর ট্যাগ করা।

**নিজেকে Admin বানাতে** (Admin Panel অ্যাক্সেস করার জন্য) — প্রথমে সাইট থেকে সাধারণভাবে
রেজিস্ট্রেশন করুন, তারপর টার্মিনালে:
```bash
npm run make-admin -- your-email@example.com
```
এরপর লগআউট করে আবার লগইন করলে Dashboard এ "Admin Panel" বাটন দেখতে পাবেন।

### ধাপ ৫: Environment Variables
`.env.local` ফাইল **ইতিমধ্যে তৈরি করা আছে** এবং তাতে AI API key গুলো (Groq, Mistral,
Cerebras, OpenRouter) ও Resend API key বসানো আছে — তাই AI Doubt Solver ও Forgot
Password ইমেইল সাথে সাথেই কাজ করবে।

> ⚠️ **নিরাপত্তা নোট:** এই key গুলো একবার চ্যাটে শেয়ার হয়েছিল, তাই সময়-সুযোগ পেলে
> প্রতিটা provider এর dashboard এ গিয়ে key **regenerate/rotate** করে নেওয়া ভালো।

> 💡 **Resend সম্পর্কে**: ফ্রি tier এ নিজের ডোমেইন ভেরিফাই না করা পর্যন্ত শুধু নিজের
> Resend অ্যাকাউন্টের ইমেইলেই Forgot Password লিংক পাঠানো যাবে। প্রোডাকশনে অন্য সব
> ইউজারকে ইমেইল পাঠাতে [resend.com/domains](https://resend.com/domains) এ একটা
> ডোমেইন ভেরিফাই করে `lib/email.ts` এর `FROM_ADDRESS` আপডেট করতে হবে।

### ধাপ ৬: Development সার্ভার চালু করুন
```bash
npm run dev
```
ব্রাউজারে যান: **http://localhost:3000**

### ধাপ ৭: টেস্ট করুন
1. হোমপেজ থেকে **"ফ্রি অ্যাকাউন্ট বানাও"** ক্লিক করে রেজিস্ট্রেশন করুন
2. Onboarding এ HSC ব্যাচ ও বোর্ড সিলেক্ট করুন
3. Dashboard এ নিজের XP/Streak/Level দেখুন
4. **"Learning Hub"** এ ক্লিক করে একটা সাবজেক্ট (যেমন Physics) খুলুন, চ্যাপ্টার/টপিক
   ব্রাউজ করুন, একটা টপিক খুলে "আয়ত্ত হয়েছে" বাটনে ক্লিক করুন — XP +20 পাবেন!
5. **"Practice"** এ ক্লিক করে একটা চ্যাপ্টার বেছে MCQ কুইজ দিন — শেষে score, XP এবং
   প্রতিটা প্রশ্নের ব্যাখ্যাসহ রিভিউ দেখতে পাবেন
6. **"Flashcards"** এ ক্লিক করে নতুন ডেক বানান, তারপর কোনো নোট পেস্ট করে "AI দিয়ে বানাও"
   চাপুন — AI স্বয়ংক্রিয়ভাবে ফ্ল্যাশকার্ড তৈরি করে দেবে। "রিভিউ করো" চাপলে flip-card
   UI তে Again/Hard/Good/Easy রেটিং দিয়ে পড়া রিভিশন করতে পারবেন
7. **"Planner"** এ ক্লিক করে টাস্ক যোগ করুন, সম্পন্ন করে +5 XP নিন, Pomodoro Timer
   চালু করে ফোকাস সেশন ট্র্যাক করুন, এবং চাইলে নিজের বোর্ডের exam date বসিয়ে দিন
8. **"Badges"** কার্ডে ক্লিক করে তোমার অর্জিত ব্যাজ দেখো (রেজিস্ট্রেশনেই একটা ব্যাজ পাবে!)
9. **"Leaderboard"** এ ক্লিক করে দেখো XP অনুযায়ী তোমার র‍্যাংক কত
10. **"AI Doubt Solver"** এ ক্লিক করে বাংলায় প্রশ্ন করুন (যেমন: "নিউটনের ১ম সূত্র কী?"),
    তারপর ফলো-আপ প্রশ্ন করে দেখুন AI আগের কথা মনে রাখে কিনা। ছবি আইকনে ক্লিক করে
    কোনো অংকের ছবি আপলোড করলে AI ধাপে ধাপে সমাধান দেবে। পেজ রিফ্রেশ করলেও
    কথোপকথন থেকে যাবে (trash আইকনে চাপলে মুছে ফেলা যাবে)
11. **"Analytics"** এ ক্লিক করে দেখুন তোমার পারফরম্যান্স গ্রাফ, দুর্বল টপিক লিস্ট,
    এবং সামগ্রিক পরিসংখ্যান (কিছু Practice/Pomodoro করার পরে ডেটা দেখা যাবে)
12. Dashboard এ Avatar আইকনে ক্লিক করে **"প্রোফাইল ও সেটিংস"** এ যান — নাম/বোর্ড/ব্যাচ
    পরিবর্তন করুন, পাসওয়ার্ড পরিবর্তন করুন, বা Sun/Moon আইকনে ক্লিক করে Dark Mode
    টগল করুন
13. লগআউট অবস্থায় Login পেজে **"পাসওয়ার্ড ভুলে গেছো?"** ক্লিক করে Forgot Password
    ফ্লো টেস্ট করুন (নিজের Resend অ্যাকাউন্টের ইমেইল ব্যবহার করলেই ইমেইল পাবেন)
14. `npm run make-admin -- your-email` চালিয়ে নিজেকে Admin বানিয়ে আবার লগইন করুন, তারপর
    Dashboard এর "Admin Panel" বাটনে ক্লিক করে নতুন Subject/Chapter/Topic/Question
    তৈরি করে দেখুন (CSV bulk upload ও ট্রাই করতে পারেন)
15. **"CQ Practice"** এ ক্লিক করে একটা চ্যাপ্টার বেছে সৃজনশীল প্রশ্নের ক/খ/গ/ঘ এর
    উত্তর লিখুন — জমা দিলে AI বোর্ড মার্কিং স্কিম অনুযায়ী নম্বর ও ফিডব্যাক দেবে
16. **"Community"** এ ক্লিক করে একটা প্রশ্ন পোস্ট করুন, অন্য অ্যাকাউন্ট দিয়ে লগইন করে
    উত্তর দিন, upvote দিন, এবং পোস্টের মালিক হিসেবে সেরা উত্তর নির্বাচন করে দেখুন
17. লগআউট করে আবার লগইন করে দেখুন সেশন ঠিকভাবে কাজ করছে কিনা
18. **Learning Hub** এ কোনো টপিক খুলে "সেভ করো" বাটনে ক্লিক করুন — তারপর Dashboard এর
    "সেভ করা টপিক" কার্ডে বা সরাসরি `/saved` এ গিয়ে দেখুন টপিকটা লিস্টে আছে কিনা।
    একই টপিক পেজে "আমার নোট" সেকশনে কিছু লিখে সেভ করুন, পেজ রিফ্রেশ করে দেখুন নোট
    থেকে যায় কিনা
19. Dashboard এ Bell আইকনে ক্লিক করে নোটিফিকেশন দেখুন — কোনো টপিক "আয়ত্ত হয়েছে" মার্ক
    করলে বা Forum এ কেউ আপনার পোস্টে রিপ্লাই দিলে এখানে নোটিফিকেশন আসবে
20. **"Full Mock Exam"** এ ক্লিক করে একটা সাবজেক্ট বেছে "Quick Practice" মোডে
    (কম সময়ে) একটা পরীক্ষা দিন — MCQ অংশ শেষ করলে (timer আছে) স্বয়ংক্রিয়ভাবে
    CQ অংশে চলে যাবে, CQ শেষ করলে AI মূল্যায়ন করে বিস্তারিত ফলাফল দেখাবে
21. **"Analytics"** এ গিয়ে **"প্রেডিক্টেড GPA"** কার্ডে দেখুন — যথেষ্ট প্র্যাকটিস/
    Mock Exam ডেটা থাকলে বাংলাদেশ শিক্ষা বোর্ডের গ্রেডিং অনুযায়ী সম্ভাব্য GPA
    দেখাবে, না থাকলে কোন বিষয়ে আরও প্র্যাকটিস দরকার তা বলে দেবে
22. **"Planner"** এ গিয়ে **"সাপ্তাহিক ক্লাস রুটিন"** এ "স্লট যোগ করো" চেপে বার/সময়/
    সাবজেক্ট দিয়ে একটা রুটিন এন্ট্রি যোগ করুন
23. একই পেজে **"Auto Study Plan"** এ "প্ল্যান বানাও" চাপুন — AI আপনার দুর্বল
    টপিক ও পরীক্ষার সময় বিশ্লেষণ করে পরবর্তী ৭ দিনের একটা প্ল্যান বানিয়ে দেবে,
    প্রতিটা আইটেম চেকবক্স দিয়ে সম্পূর্ণ মার্ক করলে +5 XP পাবেন
24. Dashboard এ **"খোঁজো..."** বাটনে ক্লিক করুন অথবা কীবোর্ডে **Ctrl+K** (Mac এ
    Cmd+K) চাপুন — Subject/Topic/Flashcard Deck/Forum Post একসাথে খুঁজে বের
    করতে পারবেন, ফলাফলে ক্লিক করলে সরাসরি সেই পেজে নিয়ে যাবে
25. Landing page এ (লগইন করার আগেই) Sun/Moon আইকনে ক্লিক করে Dark Mode টেস্ট
    করে দেখুন
26. Admin Panel এ গিয়ে কোনো টপিক খুলে **CQ ট্যাবে** ক্লিক করে সৃজনশীল প্রশ্ন
    (উদ্দীপক + ক/খ/গ/ঘ + মডেল উত্তর) যোগ করুন
27. Admin সাইডবারে **"অ্যানালিটিক্স"** এ গিয়ে DAU/WAU/MAU, সাবজেক্ট পপুলারিটি,
    ও সবচেয়ে বেশি প্র্যাকটিস হওয়া টপিক দেখুন
28. **"Forum Moderation"** এ গিয়ে যেকোনো পোস্ট পিন করুন বা অনুপযুক্ত পোস্ট
    ডিলিট করুন
29. **"Notification Broadcast"** এ গিয়ে সব ইউজারকে একসাথে একটা ঘোষণা পাঠান

---

## 📂 প্রজেক্ট স্ট্রাকচার

```
hsc-ultimate/
├── app/
│   ├── page.tsx                        # ল্যান্ডিং পেজ
│   ├── layout.tsx                      # রুট লেআউট + SessionProvider + ThemeProvider + PWA meta
│   ├── providers.tsx                   # NextAuth SessionProvider + next-themes wrapper
│   ├── manifest.ts                     # ✅ PWA Web App Manifest রুট
│   ├── not-found.tsx                   # ✅ কাস্টম বাংলা ৪০৪ পেজ (গ্লোবাল)
│   ├── error.tsx                       # ✅ কাস্টম বাংলা এরর বাউন্ডারি (segment-level)
│   ├── global-error.tsx                # ✅ Root layout crash এর জন্য এরর বাউন্ডারি
│   ├── u/[slug]/page.tsx               # ✅ Public Profile পাবলিক পেজ (SSR, কোনো auth লাগে না)
│   ├── (auth)/
│   │   ├── login/page.tsx              # ✅ লগইন পেজ (Forgot Password লিংক সহ)
│   │   ├── register/page.tsx           # ✅ রেজিস্ট্রেশন পেজ
│   │   ├── onboarding/page.tsx         # ✅ HSC ব্যাচ/বোর্ড সিলেকশন
│   │   ├── forgot-password/page.tsx    # ✅ ইমেইল দিয়ে রিসেট লিংক চাওয়া (পাবলিক)
│   │   └── reset-password/page.tsx     # ✅ টোকেন দিয়ে নতুন পাসওয়ার্ড সেট (পাবলিক)
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx          # ✅ মূল ড্যাশবোর্ড (protected)
│   │   ├── settings/page.tsx           # ✅ প্রোফাইল/পাসওয়ার্ড/থিম সেটিংস (protected)
│   │   ├── saved/page.tsx              # ✅ Saved Topics (Bookmark লিস্ট, protected)
│   │   ├── mock-exam/
│   │   │   ├── page.tsx                # ✅ Mock Exam Hub (সাবজেক্ট লিস্ট + MCQ/CQ কাউন্ট)
│   │   │   ├── subject/[subjectId]/page.tsx   # ✅ Full/Quick মোড সিলেকশন
│   │   │   ├── attempt/[attemptId]/page.tsx   # ✅ MCQ+CQ Runner (timer সহ)
│   │   │   └── result/[attemptId]/page.tsx    # ✅ বিস্তারিত ফলাফল + AI ফিডব্যাক
│   │   └── learn/
│   │       ├── page.tsx                # ✅ Learning Hub (সব সাবজেক্ট)
│   │       └── [subjectId]/
│   │           ├── page.tsx            # ✅ Subject Detail (chapter/topic লিস্ট)
│   │           └── [topicId]/page.tsx  # ✅ Topic Detail (video/notes/mastery/bookmark)
│   │   └── practice/
│   │       ├── page.tsx                # ✅ Practice Hub (সব সাবজেক্ট + প্রশ্ন সংখ্যা)
│   │       ├── [subjectId]/
│   │       │   ├── page.tsx            # ✅ Chapter Selection
│   │       │   └── [chapterId]/page.tsx # ✅ Quiz Runner পেজ
│   │       └── result/[attemptId]/page.tsx # ✅ ফলাফল + রিভিউ পেজ
│   │   └── flashcards/
│   │       ├── page.tsx                # ✅ Flashcards Hub (সব ডেক)
│   │       └── [deckId]/
│   │           ├── page.tsx            # ✅ Deck Detail (কার্ড লিস্ট, add, AI generate)
│   │           └── review/page.tsx     # ✅ Review Runner পেজ
│   │   └── planner/page.tsx            # ✅ Planner (Task/Countdown/Pomodoro/Routine/StudyPlan/Pet)
│   │   ├── study-group/page.tsx        # ✅ Study Group / Party System পেজ
│   │   ├── duel/page.tsx               # ✅ Quiz Duel Lobby পেজ
│   │   ├── duel/[duelId]/page.tsx      # ✅ Active Duel Room পেজ
│   │   ├── duel/history/page.tsx       # ✅ Duel History পেজ
│   │   ├── pdf-chat/page.tsx           # ✅ PDF Chat Dashboard (আপলোড + লিস্ট)
│   │   ├── pdf-chat/[documentId]/page.tsx  # ✅ PDF Chat Room (RAG চ্যাট)
│   │   ├── drill/page.tsx              # ✅ Timed Drill সাবজেক্ট+duration selector পেজ
│   │   ├── drill/run/page.tsx          # ✅ Timed Drill runner পেজ
│   │   ├── badges/page.tsx             # ✅ Badges পেজ (অর্জিত/অনর্জিত)
│   │   ├── leaderboard/page.tsx        # ✅ Leaderboard (গ্লোবাল XP র‍্যাংকিং)
│   │   └── analytics/page.tsx          # ✅ Analytics Dashboard (charts)
│   ├── ai-tutor/page.tsx               # ✅ AI Doubt Solver চ্যাট পেজ (history + vision)
│   ├── admin/                          # ✅ Admin Panel (শুধু ADMIN role)
│   │   ├── layout.tsx                  # Admin সাইডবার লেআউট
│   │   ├── page.tsx                    # Admin Dashboard (stats)
│   │   ├── subjects/page.tsx           # Subject লিস্ট + তৈরি
│   │   ├── subjects/[subjectId]/page.tsx  # Chapter ম্যানেজমেন্ট
│   │   ├── chapters/[chapterId]/page.tsx  # Topic ম্যানেজমেন্ট
│   │   ├── topics/[topicId]/page.tsx      # ✅ Question ম্যানেজমেন্ট (MCQ single+bulk CSV, CQ ট্যাব)
│   │   ├── users/page.tsx              # User role management
│   │   ├── analytics/page.tsx          # ✅ Admin Analytics (DAU/WAU/MAU, popularity)
│   │   ├── forum/page.tsx              # ✅ Forum Moderation (pin/delete)
│   │   └── notifications/page.tsx      # ✅ Notification Broadcast
│   ├── cq-practice/                    # ✅ CQ Practice (সৃজনশীল প্রশ্ন)
│   │   ├── page.tsx                    # CQ Hub (সাবজেক্ট লিস্ট)
│   │   ├── [subjectId]/page.tsx        # Chapter Selection
│   │   ├── [subjectId]/[chapterId]/page.tsx  # CQ Runner (answering UI)
│   │   └── result/[attemptId]/page.tsx # ফলাফল + AI ফিডব্যাক + model answer
│   ├── forum/                          # ✅ Community/Discussion Forum
│   │   ├── page.tsx                    # Forum Hub (ক্যাটাগরি ফিল্টার সহ)
│   │   ├── new/page.tsx                # নতুন পোস্ট তৈরি ফর্ম
│   │   └── [postId]/page.tsx           # Post Detail (reply, vote, best answer)
│   └── api/
│       ├── auth/[...nextauth]/route.ts # NextAuth হ্যান্ডলার
│       ├── auth/register/route.ts      # ✅ রেজিস্ট্রেশন API
│       ├── auth/forgot-password/route.ts # ✅ রিসেট টোকেন তৈরি + ইমেইল পাঠানো API
│       ├── auth/reset-password/route.ts  # ✅ টোকেন ভেরিফাই + পাসওয়ার্ড রিসেট API
│       ├── user/onboarding/route.ts    # ✅ Onboarding ডেটা সেভ API
│       ├── user/profile/route.ts       # ✅ প্রোফাইল (নাম/বোর্ড/ব্যাচ) আপডেট API
│       ├── user/public-profile/route.ts # ✅ Public Profile চালু/বন্ধ + slug সেট API
│       ├── public-profile/[slug]/route.ts # ✅ পাবলিক প্রোফাইল ডেটা fetch (auth-ফ্রি)
│       ├── user/change-password/route.ts # ✅ লগইন অবস্থায় পাসওয়ার্ড পরিবর্তন API
│       ├── user/exam-date/route.ts     # ✅ Exam date সেট করার API
│       ├── bookmarks/route.ts          # ✅ Bookmark list/create (upsert) API
│       ├── bookmarks/[topicId]/route.ts # ✅ Bookmark status check/delete API
│       ├── notes/[topicId]/route.ts    # ✅ Note get/save(upsert)/delete API
│       ├── notifications/route.ts      # ✅ Notification list + unread count API
│       ├── notifications/unread-count/route.ts  # ✅ Lightweight count-only API (পোলিং এর জন্য)
│       ├── notifications/[notificationId]/route.ts # ✅ Read/Delete (owner-only) API
│       ├── notifications/read-all/route.ts # ✅ সব notification read মার্ক API
│       ├── mock-exam/start/route.ts    # ✅ Mock Exam শুরু (এলোমেলো প্রশ্ন বাছাই)
│       ├── mock-exam/[attemptId]/route.ts        # ✅ পরীক্ষার তথ্য/প্রশ্ন লোড
│       ├── mock-exam/[attemptId]/submit-mcq/route.ts # ✅ MCQ জমা + স্কোরিং
│       ├── mock-exam/[attemptId]/submit-cq/route.ts  # ✅ CQ জমা + AI evaluation
│       ├── mock-exam/[attemptId]/result/route.ts     # ✅ বিস্তারিত ফলাফল API
│       ├── analytics/predicted-gpa/route.ts    # ✅ Predicted GPA API
│       ├── routine/route.ts            # ✅ Class Routine list/create API
│       ├── routine/[slotId]/route.ts   # ✅ Routine slot update/delete API
│       ├── study-plan/route.ts         # ✅ বর্তমান Study Plan লোড
│       ├── study-plan/generate/route.ts # ✅ AI দিয়ে নতুন Study Plan জেনারেট
│       ├── study-plan/items/[itemId]/route.ts # ✅ Study Plan item টগল (+5 XP)
│       ├── search/route.ts             # ✅ Global Search (Subject/Topic/Deck/Post)
│       ├── topics/[topicId]/progress/route.ts  # ✅ Mastery progress + XP API
│       ├── topics/[topicId]/mind-map/route.ts  # ✅ Topic Mind Map জেনারেশন (POST)
│       ├── practice/start/route.ts     # ✅ Quiz প্রশ্ন লোড API
│       ├── practice/submit/route.ts    # ✅ Quiz জমা + scoring + XP + badge API
│       ├── flashcard-decks/route.ts    # ✅ Deck list/create API
│       ├── flashcard-decks/[deckId]/route.ts       # ✅ Deck detail/আপডেট (isPublic/description)/delete API
│       ├── flashcard-decks/[deckId]/cards/route.ts # ✅ ম্যানুয়াল কার্ড যোগ API
│       ├── flashcard-decks/[deckId]/due/route.ts   # ✅ Due cards API
│       ├── flashcard-decks/[deckId]/import/route.ts # ✅ Community Shared Deck ক্লোন/import API
│       ├── flashcard-decks/discover/route.ts       # ✅ Community Shared Deck Discover লিস্ট API
│       ├── flashcard-decks/generate-ai/route.ts    # ✅ AI ফ্ল্যাশকার্ড জেনারেশন API (lib/flashcard-gen.ts ব্যবহার করে)
│       ├── flashcard-decks/ocr-extract/route.ts    # ✅ ছবি→টেক্সট OCR এক্সট্র্যাকশন API
│       ├── flashcards/[cardId]/route.ts            # ✅ কার্ড ডিলিট API
│       ├── flashcards/[cardId]/review/route.ts     # ✅ SM-2 রিভিউ + XP + badge API
│       ├── notes/[topicId]/to-flashcards/route.ts  # ✅ Note-to-Flashcard কনভার্টার API
│       ├── tasks/route.ts              # ✅ Task list/create API
│       ├── tasks/[taskId]/route.ts     # ✅ Task update/delete + badge API
│       ├── study-sessions/route.ts     # ✅ Pomodoro সেশন লগ + XP + badge + study-pet API
│       ├── study-pet/route.ts          # ✅ Study Pet অবস্থা (GET) + নাম পরিবর্তন (PATCH)
│       ├── study-group/route.ts        # ✅ Study Group GET (membership) + POST (create)
│       ├── study-group/join/route.ts   # ✅ ইনভাইট কোড দিয়ে গ্রুপে যোগদান
│       ├── study-group/leave/route.ts  # ✅ গ্রুপ ছাড়া (owner-transfer/group-delete)
│       ├── duel/route.ts               # ✅ Duel Lobby (GET) + Create Challenge (POST)
│       ├── duel/[duelId]/route.ts      # ✅ Duel বিস্তারিত অবস্থা (polling)
│       ├── duel/[duelId]/join/route.ts # ✅ Duel এ যোগদান (WAITING→ACTIVE)
│       ├── duel/[duelId]/cancel/route.ts # ✅ নিজের WAITING Duel বাতিল
│       ├── duel/[duelId]/submit/route.ts # ✅ MCQ উত্তর জমা + সার্ভার-সাইড স্কোরিং
│       ├── duel/[duelId]/questions/route.ts # ✅ প্রশ্ন সার্ভ (correctAnswer বাদে)
│       ├── duel/history/route.ts       # ✅ Win/Draw/Loss স্ট্যাটস+হিস্ট্রি
│       ├── pdf-chat/route.ts           # ✅ PDF Chat Document লিস্ট (GET) + আপলোড (POST)
│       ├── pdf-chat/[documentId]/route.ts  # ✅ স্ট্যাটাস পোলিং (GET) + ডিলিট (DELETE)
│       ├── pdf-chat/[documentId]/messages/route.ts  # ✅ চ্যাট হিস্ট্রি (GET) + RAG উত্তর (POST)
│       ├── pdf-chat/[documentId]/summary/route.ts  # ✅ Audio Overview সারাংশ জেনারেশন (POST)
│       ├── pdf-chat/[documentId]/mind-map/route.ts  # ✅ PDF Mind Map জেনারেশন (POST)
│       ├── custom-question-sets/route.ts  # ✅ ছবি→MCQ/CQ সেট লিস্ট (GET) + আপলোড (POST)
│       ├── custom-question-sets/[setId]/route.ts  # ✅ সেট বিস্তারিত (GET) + ডিলিট (DELETE)
│       ├── live-exam/start/route.ts    # ✅ Solo Live Exam শুরু
│       ├── live-exam/[sessionId]/route.ts  # ✅ সেশন বিস্তারিত
│       ├── live-exam/[sessionId]/questions/route.ts  # ✅ প্রশ্ন সার্ভ (correctAnswer বাদে)
│       ├── live-exam/[sessionId]/submit/route.ts  # ✅ উত্তর জমা + সার্ভার-সাইড স্কোরিং
│       ├── quiz-battle/route.ts        # ✅ নতুন Battle room তৈরি (POST)
│       ├── quiz-battle/join/route.ts   # ✅ Room code দিয়ে যোগদান
│       ├── quiz-battle/preview/[roomCode]/route.ts  # ✅ যোগ দেওয়ার আগে Battle প্রিভিউ
│       ├── quiz-battle/[battleId]/route.ts  # ✅ Battle বিস্তারিত + leaderboard (polling)
│       ├── quiz-battle/[battleId]/start/route.ts  # ✅ WAITING→ACTIVE (owner-only)
│       ├── quiz-battle/[battleId]/end/route.ts  # ✅ ACTIVE→COMPLETED (owner-only)
│       ├── quiz-battle/[battleId]/submit/route.ts  # ✅ Self-paced উত্তর জমা
│       ├── quiz-battle/[battleId]/questions/route.ts  # ✅ প্রশ্ন সার্ভ (correctAnswer বাদে)
│       ├── quiz-battle/history/route.ts  # ✅ আমার Battle history (rank সহ)
│       ├── adaptive-practice/preview/route.ts  # ✅ দুর্বল টপিক প্রিভিউ
│       ├── adaptive-practice/start/route.ts  # ✅ Smart Practice প্রশ্ন সেট তৈরি
│       ├── adaptive-practice/submit/route.ts  # ✅ সার্ভার-সাইড স্কোরিং + XP/Streak/Badge সিঙ্ক
│       ├── drill/subjects/route.ts     # ✅ Timed Drill এর জন্য সাবজেক্ট লিস্ট (প্রশ্ন সংখ্যা সহ)
│       ├── drill/start/route.ts        # ✅ Timed Drill প্রশ্ন pool শুরু (POST)
│       ├── drill/submit/route.ts       # ✅ সার্ভার-সাইড স্কোরিং + speed bonus XP (POST)
│       ├── admission/exams/route.ts    # ✅ Admission Prep exam configs + প্রশ্ন সংখ্যা
│       ├── admission/start/route.ts    # ✅ Admission মক টেস্ট শুরু (option shuffle সহ)
│       ├── admission/[attemptId]/route.ts        # ✅ Admission ফলাফল বিস্তারিত (correctAnswer+ব্যাখ্যা)
│       ├── admission/[attemptId]/submit/route.ts # ✅ Negative marking সহ server-side scoring
│       ├── admission/history/route.ts  # ✅ Admission মক টেস্ট history (examType ফিল্টার)
│       ├── gamification/sync/route.ts  # ✅ Streak/Level/Badge সিঙ্ক API
│       ├── analytics/route.ts          # ✅ Analytics aggregation API
│       └── admin/                      # ✅ Admin-only API (সব রুটে requireAdmin() guard)
│           ├── stats/route.ts
│           ├── subjects/route.ts, subjects/[subjectId]/route.ts
│           ├── subjects/[subjectId]/chapters/route.ts
│           ├── chapters/[chapterId]/route.ts, chapters/[chapterId]/topics/route.ts
│           ├── topics/[topicId]/route.ts, topics/[topicId]/questions/route.ts
│           ├── questions/[questionId]/route.ts, questions/bulk/route.ts (CSV)
│           ├── users/route.ts, users/[userId]/route.ts
│           ├── topics/[topicId]/cq-questions/route.ts, cq-questions/[cqQuestionId]/route.ts
│           ├── analytics/route.ts      # ✅ DAU/WAU/MAU + subject/topic popularity
│           ├── forum/posts/route.ts, posts/[postId]/route.ts, posts/[postId]/pin/route.ts
│           ├── reports/route.ts, reports/[reportId]/route.ts # ✅ Content Report moderation queue
│           └── notifications/broadcast/route.ts # ✅ সব ইউজারকে bulk notification
│       ├── cq/chapter/[chapterId]/route.ts   # ✅ CQ প্রশ্ন লোড API
│       ├── cq/subject/[subjectId]/route.ts   # ✅ Subject এর CQ count API
│       ├── cq/[cqQuestionId]/submit/route.ts # ✅ CQ জমা + AI evaluation + XP API
│       ├── cq/attempt/[attemptId]/route.ts   # ✅ CQ ফলাফল বিস্তারিত API
│       ├── ai-chat/route.ts            # ✅ AI চ্যাট API (GET/POST/DELETE, vision+mode সাপোর্ট)
│       ├── user/ai-tutor-mode/route.ts # ✅ DIRECT/SOCRATIC মোড টগল API
│       ├── report-card/route.ts        # ✅ Report Card PDF জেনারেশন+ডাউনলোড API
│       └── forum/                      # ✅ Community Forum API
│           ├── posts/route.ts          # লিস্ট + তৈরি (+3 XP)
│           ├── posts/[postId]/route.ts # বিস্তারিত (view++) + ডিলিট
│           ├── posts/[postId]/replies/route.ts   # রিপ্লাই তৈরি (+5 XP)
│           ├── posts/[postId]/vote/route.ts      # পোস্ট vote (toggle)
│           ├── posts/[postId]/resolve/route.ts   # সমাধান মার্ক (owner only)
│           ├── replies/[replyId]/vote/route.ts   # রিপ্লাই vote (toggle)
│           ├── replies/[replyId]/best-answer/route.ts # সেরা উত্তর (+10 XP)
│           └── reports/route.ts        # ✅ Content Report তৈরি (post/reply, duplicate-প্রতিরোধ)
├── components/
│   ├── ui/                             # shadcn/ui কম্পোনেন্ট
│   ├── theme-provider.tsx              # ✅ next-themes wrapper
│   ├── theme-toggle.tsx                # ✅ Sun/Moon থিম টগল বাটন
│   ├── accessibility-provider.tsx      # ✅ Font Size/Dyslexia/Contrast/Motion Context
│   ├── pwa-register.tsx                # ✅ Service Worker রেজিস্ট্রেশন (production-only)
│   ├── layout/
│   │   ├── user-menu.tsx               # ✅ Avatar dropdown (Settings/Admin/Logout)
│   │   ├── notification-bell.tsx       # ✅ Notification Bell (unread badge, dropdown লিস্ট)
│   │   └── global-search.tsx           # ✅ Global Search (Ctrl/Cmd+K command palette)
│   ├── settings/
│   │   ├── settings-form.tsx           # ✅ Profile/Password/Theme/Accessibility/Public Profile ট্যাব ফর্ম
│   │   ├── accessibility-tab.tsx       # ✅ Accessibility সেটিংস UI
│   │   └── public-profile-tab.tsx      # ✅ Public Profile চালু/বন্ধ + slug ম্যানেজমেন্ট UI
│   ├── learn/
│   │   ├── topic-progress-controls.tsx # ✅ Mastery status বাটন (client)
│   │   ├── bookmark-button.tsx         # ✅ Bookmark টগল বাটন (client)
│   │   ├── topic-note-editor.tsx       # ✅ প্রতিটা টপিকে নিজের নোট লেখা/সেভ/মুছা
│   │   └── text-to-speech-button.tsx   # ✅ Web Speech API দিয়ে টেক্সট শোনার বাটন
│   ├── shared/
│   │   ├── mind-map-tree.tsx           # ✅ রিকার্সিভ collapsible mind map renderer
│   │   └── mind-map-card.tsx           # ✅ পুনর্ব্যবহারযোগ্য Mind Map কার্ড (Topic+PDF)
│   ├── practice/
│   │   ├── quiz-runner.tsx             # ✅ Quiz taking UI (client)
│   │   ├── drill-intro.tsx             # ✅ Timed Drill সাবজেক্ট+duration selector
│   │   └── drill-runner.tsx            # ✅ Timed Drill fast-paced runner (auto-advance)
│   ├── mock-exam/
│   │   ├── mode-selector.tsx           # ✅ Full Timed vs Quick Practice সিলেকশন
│   │   ├── mock-exam-runner.tsx        # ✅ MCQ+CQ ফেজ রানার (countdown timer সহ)
│   │   └── mock-exam-result.tsx        # ✅ ফলাফল রিভিউ UI (MCQ+CQ breakdown)
│   ├── flashcards/
│   │   ├── create-deck-dialog.tsx      # ✅ নতুন ডেক তৈরি ডায়ালগ
│   │   ├── deck-card.tsx               # ✅ ডেক প্রিভিউ কার্ড
│   │   ├── share-deck-dialog.tsx       # ✅ Community Shared Deck শেয়ার টগল ডায়ালগ
│   │   ├── discover-deck-browser.tsx   # ✅ Community Shared Deck Discover ব্রাউজার UI
│   │   ├── add-card-dialog.tsx         # ✅ ম্যানুয়াল কার্ড যোগ ডায়ালগ (BASIC/CLOZE/IMAGE_OCCLUSION)
│   │   ├── occlusion-editor.tsx        # ✅ Image Occlusion বক্স আঁকার এডিটর (Pointer Events)
│   │   ├── occlusion-viewer.tsx        # ✅ Image Occlusion রিভিউ ভিউয়ার (reveal/hide)
│   │   ├── ai-generate-dialog.tsx      # ✅ AI জেনারেশন ডায়ালগ
│   │   ├── ocr-generate-dialog.tsx     # ✅ ছবি→OCR→ফ্ল্যাশকার্ড ৩-ধাপের ডায়ালগ
│   │   ├── deck-card-list.tsx          # ✅ ডেকের কার্ড লিস্ট
│   │   └── review-runner.tsx           # ✅ Flip-card review UI (Framer Motion)
│   ├── planner/
│   │   ├── exam-countdown-card.tsx     # ✅ Exam Countdown কার্ড (এডিটযোগ্য)
│   │   ├── task-manager.tsx            # ✅ Task CRUD UI
│   │   ├── pomodoro-timer.tsx          # ✅ Pomodoro Timer (circular progress)
│   │   ├── study-pet-card.tsx          # ✅ Virtual Pet (evolution/happiness UI)
│   │   ├── class-routine.tsx           # ✅ সাপ্তাহিক ক্লাস রুটিন (Dialog দিয়ে স্লট যোগ)
│   │   └── study-plan-card.tsx         # ✅ AI Auto Study Plan (৭ দিনের প্ল্যান, checkbox টগল)
│   ├── study-group/
│   │   └── study-group-dashboard.tsx   # ✅ Create/Join ফর্ম + Group Dashboard UI
│   ├── duel/
│   │   ├── duel-lobby.tsx              # ✅ Create Challenge + Public Lobby UI
│   │   ├── duel-room.tsx               # ✅ WAITING/ACTIVE/COMPLETED তিন অবস্থার UI
│   │   └── duel-history.tsx            # ✅ Win/Loss/Draw স্ট্যাটস
│   ├── pdf-chat/
│   │   ├── pdf-chat-dashboard.tsx      # ✅ আপলোড ফর্ম + ডকুমেন্ট লিস্ট (পোলিং সহ)
│   │   ├── pdf-chat-room.tsx           # ✅ RAG চ্যাট UI (page citation + TTS)
│   │   └── pdf-summary-card.tsx        # ✅ Audio Overview কার্ড (AI সারাংশ + TTS)
│   └── gamification/
│       └── gamification-sync.tsx       # ✅ Background streak/badge sync (client)
│   ├── analytics/
│   │   ├── analytics-dashboard.tsx     # ✅ Recharts দিয়ে graphs (line/bar/pie)
│   │   ├── activity-heatmap.tsx        # ✅ GitHub-স্টাইল Activity Heatmap (CSS grid)
│   │   └── predicted-gpa-card.tsx      # ✅ Predicted GPA কার্ড (grade badges সহ)
│   └── admin/
│       ├── subject-manager.tsx         # ✅ Subject CRUD UI
│       ├── chapter-manager.tsx         # ✅ Chapter CRUD UI
│       ├── topic-manager.tsx           # ✅ Topic CRUD UI
│       ├── question-manager.tsx        # ✅ MCQ CRUD + CSV bulk upload UI (MCQ/CQ ট্যাব)
│       ├── cq-question-manager.tsx     # ✅ CQ (সৃজনশীল প্রশ্ন) CRUD UI
│       ├── user-manager.tsx            # ✅ User role management UI
│       ├── admin-analytics-dashboard.tsx # ✅ DAU/WAU/MAU + popularity charts
│       ├── forum-moderation-panel.tsx  # ✅ Forum পোস্ট pin/delete UI
│       ├── reports-panel.tsx           # ✅ Content Report moderation queue UI
│       └── notification-broadcast-form.tsx # ✅ সব ইউজারকে broadcast পাঠানোর ফর্ম
│   └── cq/
│       └── cq-runner.tsx               # ✅ CQ answering UI (৪টা Textarea)
│   └── forum/
│       ├── forum-feed.tsx              # ✅ Post list + ক্যাটাগরি ফিল্টার
│       ├── new-post-form.tsx           # ✅ নতুন পোস্ট ফর্ম
│       ├── post-detail.tsx             # ✅ Post + Reply + Vote + Best Answer UI
│       └── report-dialog.tsx           # ✅ Content Report করার reusable Dialog
├── lib/
│   ├── prisma.ts                       # Prisma Client singleton
│   ├── auth.ts                         # ✅ NextAuth কনফিগারেশন
│   ├── ai-provider.ts                  # ✅ Multi-AI fallback logic (টেক্সট + vision)
│   ├── spaced-repetition.ts            # ✅ SM-2 অ্যালগরিদম (পুরনো কার্ডের জন্য, backward compat)
│   ├── flashcard-gen.ts                # ✅ AI ফ্ল্যাশকার্ড জেনারেশন — কেন্দ্রীভূত (generate-ai + Note-to-Flashcard শেয়ার্ড)
│   ├── fsrs.ts                         # ✅ FSRS অ্যালগরিদম (নতুন কার্ডের ডিফল্ট, ts-fsrs লাইব্রেরি)
│   ├── cloze.ts                        # ✅ Cloze Deletion পার্সিং (parseClozeText, isValidClozeText)
│   ├── image-occlusion.ts              # ✅ Image Occlusion বক্স validation (কো-অর্ডিনেট রেঞ্জ/সাইজ/সংখ্যা)
│   ├── public-profile.ts               # ✅ Public Profile slug validation + fetch (privacy-enforcing)
│   ├── exam-countdown.ts               # ✅ Exam countdown হিসাব utility
│   ├── gamification.ts                 # ✅ Level ফর্মুলা + Badge award logic
│   ├── streak.ts                       # ✅ Daily streak + Streak Freeze হিসাব logic
│   ├── league.ts                       # ✅ Weekly League/Tier + কেন্দ্রীভূত awardXp()
│   ├── badge-toast.ts                  # ✅ Badge notification shared helper
│   ├── analytics.ts                    # ✅ Analytics aggregation logic + getAnalyticsDashboardData() (consolidated, performance)
│   ├── admin-auth.ts                   # ✅ Admin API guard (requireAdmin)
│   ├── cq-evaluator.ts                 # ✅ AI দিয়ে CQ answer মূল্যায়ন লজিক
│   ├── email.ts                        # ✅ Resend দিয়ে ইমেইল পাঠানো (Forgot Password + Weekly Digest)
│   ├── weekly-digest.ts                # ✅ Notification Digest ডেটা অ্যাগ্রিগেশন (getWeeklyDigestData, getEligibleDigestUserIds)
│   ├── notifications.ts                # ✅ createNotification() কেন্দ্রীভূত হেল্পার
│   ├── mock-exam.ts                    # ✅ MOCK_EXAM_CONFIG + pickRandom() শাফল লজিক
│   ├── percentile.ts                   # ✅ Mock Exam Rank/Percentile হিসাব লজিক
│   ├── gpa.ts                          # ✅ HSC GPA calculation (grading scale + 4th subject rule)
│   ├── gpa-predictor.ts                # ✅ Practice/Mock Exam/CQ থেকে weighted প্রেডিকশন
│   ├── study-plan-generator.ts         # ✅ AI দিয়ে ৭ দিনের Auto Study Plan জেনারেট
│   ├── study-plan-agent.ts             # ✅ Proactive monitoring agent (renewal + critical topic alert, lazy-check)
│   ├── mind-map.ts                     # ✅ AI দিয়ে hierarchical concept tree জেনারেশন (Topic+PDF শেয়ার্ড)
│   ├── accessibility.ts                # ✅ Accessibility প্রেফারেন্স টাইপ+কনস্ট্যান্ট
│   ├── report-card.ts                  # ✅ Report Card ডেটা অ্যাগ্রিগেটর (analytics+GPA)
│   ├── report-card-pdf.tsx             # ✅ @react-pdf/renderer PDF Document কম্পোনেন্ট
│   ├── fonts/                          # ✅ Hind Siliguri TTF (PDF এ এমবেডেড বাংলা ফন্ট)
│   ├── study-pet.ts                    # ✅ Virtual Pet evolution/happiness-decay/feed লজিক
│   ├── study-group.ts                  # ✅ Study Group create/join/leave/XP-contribution লজিক
│   ├── quiz-duel.ts                    # ✅ Peer Quiz Duel create/join/submit/finalize লজিক
│   ├── pdf-chat.ts                     # ✅ PDF Chat RAG পাইপলাইন (extract/chunk/embed/retrieve/answer/summary)
│   ├── audit-log.ts                    # ✅ Admin action audit logging (fire-safe, try/catch wrapped)
│   ├── custom-question-gen.ts          # ✅ ছবি→OCR→AI MCQ/CQ generation পাইপলাইন
│   ├── live-exam.ts                    # ✅ Solo Live Exam start/questions/submit লজিক
│   ├── quiz-battle.ts                  # ✅ Quiz Battle create/join/start/submit/end (multi-person)
│   ├── adaptive-practice.ts            # ✅ দুর্বল টপিক নির্ণয় + priority-based প্রশ্ন বাছাই
│   ├── drill-practice.ts               # ✅ Timed Drill কনস্ট্যান্ট + cross-chapter random question pool
│   ├── admission.ts                    # ✅ Admission Prep কনফিগ (marking scheme), scoring logic, option shuffle
│   └── utils.ts
├── prisma/
│   ├── schema.prisma                   # ✅ সম্পূর্ণ ডেটাবেজ স্কিমা
│   ├── seed.ts                         # ✅ NCTB সিলেবাস সিড স্ক্রিপ্ট
│   ├── seed-badges.ts                  # ✅ ব্যাজ সিড স্ক্রিপ্ট
│   ├── seed-questions.ts               # ✅ MCQ Question Bank সিড স্ক্রিপ্ট
│   ├── seed-board-questions.ts         # ✅ Previous-Year Board Question সিড স্ক্রিপ্ট
│   └── migrations/                     # মাইগ্রেশন হিস্ট্রি
├── scripts/
│   └── fix-vector-index.ts             # ✅ pgvector HNSW index recovery script (Performance)
├── hooks/
│   └── use-mcq-keyboard-nav.ts         # ✅ MCQ Keyboard Navigation — কেন্দ্রীভূত reusable hook
├── types/next-auth.d.ts                # NextAuth টাইপ extension
├── proxy.ts                            # ✅ Route protection middleware
├── docs/
│   ├── MASTER_PLAN.md                  # 📋 মূল পরিকল্পনা — প্রজেক্টের "সংবিধান"
│   ├── MASTER_PLAN_LOG_1..4.md         # 📚 ধাপে-ধাপে বাস্তবায়ন লগ (৪ ভাগে)
│   ├── CHANGELOG.md + _ARCHIVE.md      # 📜 ফিচার-বাই-ফিচার হিস্ট্রি
│   ├── ROADMAP_ARCHIVE.md              # 🛣️ সম্পূর্ণ চেকলিস্ট রোডম্যাপ
│   ├── FEATURE_RESEARCH*.md            # 🔬 প্রতিযোগী/ফিচার রিসার্চ
│   └── PROJECT_AUDIT_*.md              # 🔍 কোডবেস অডিট রিপোর্ট
├── .env.local                          # আসল API key + DB path (git এ যাবে না)
└── package.json
```

---

## 🧠 AI Provider System

`lib/ai-provider.ts` এ fallback chain: **Groq → Mistral → Cerebras → OpenRouter**
(একটা fail করলে অটো পরেরটায় চলে যায়)। সবগুলো OpenAI-compatible endpoint।

| Provider | স্ট্যাটাস |
|---|---|
| Groq | ✅ দ্রুত, রিলায়েবল — Primary |
| Mistral | ✅ ভালো বাংলা রেসপন্স, vision সাপোর্ট আছে |
| Cerebras | ✅ অতি দ্রুত ব্যাকআপ |
| OpenRouter | ⚠️ ফ্রি মডেলে প্রায়ই rate-limit — শুধু শেষ upay |

`lib/email.ts` এ **Resend.com** দিয়ে ইমেইল পাঠানো (`RESEND_API_KEY`) — Forgot
Password রিসেট লিংক এবং Notification Digest (Weekly Email Summary) দুটোর
জন্যই ব্যবহার হচ্ছে। ফ্রি tier এ নিজের ডোমেইন ভেরিফাই না করা পর্যন্ত শুধু
নিজের Resend অ্যাকাউন্টের ইমেইলেই পাঠানো যাবে (deploy এর আগে অবশ্যই ভেরিফাই
করতে হবে)।

---

## 🗄️ ডেটাবেজ

**বর্তমানে:** Supabase PostgreSQL (cloud-hosted, production-ready থেকেই শুরু হয়েছে)।

- `DATABASE_URL` — Pooled connection (PgBouncer, transaction mode, port 6543) —
  app runtime এর জন্য ব্যবহার হয় (দ্রুত, বেশি concurrent connection সামলাতে পারে)
- `DIRECT_URL` — Session-mode pooler connection (port 5432) — শুধু migration চালানোর
  জন্য দরকার (Prisma Migrate এর নিজস্ব connection দরকার হয়)

মূল মডেলগুলো (Science Group centric):
- `User` — প্রোফাইল, XP, স্ট্রিক, লেভেল, বোর্ড, HSC ব্যাচ, Public
  Profile (`publicProfileEnabled`/`profileSlug`)
- `Subject`, `Chapter`, `Topic` — Bangla/English/ICT/Physics/Chemistry/Biology/HigherMath
- `TopicProgress` — Mastery tracking (NOT_STARTED → LEARNING → PRACTICING → MASTERED)
- `Question`, `QuizAttempt` — MCQ/CQ প্র্যাকটিস ও স্কোরিং
- `FlashcardDeck`, `Flashcard` — SM-2/FSRS ভিত্তিক spaced repetition ফিল্ড
  সহ, `cardType` (BASIC/CLOZE/IMAGE_OCCLUSION) দিয়ে Cloze Deletion+Image
  Occlusion সাপোর্ট (`occlusionBoxes` Json ফিল্ড), `isPublic`/
  `description`/`importCount` দিয়ে Community Shared Deck সাপোর্ট
- `Task`, `StudySession` — Planner মডিউল
- `Badge`, `UserBadge` — Gamification
- `ChatMessage` — AI Doubt Solver হিস্ট্রি
- `ForumPost`, `ForumReply`, `ForumVote` — Community/Discussion Forum
- `ContentReport` — Forum পোস্ট/রিপ্লাই রিপোর্ট (reason/status enum, admin review ট্র্যাকিং)
- `PasswordResetToken` — Forgot Password রিসেট টোকেন (১ ঘণ্টা মেয়াদ, এক-বার-ব্যবহারযোগ্য)
- `PolicyAcceptance` — exact Privacy/Terms/age-assurance version, source ও time-এর immutable acknowledgement history
- `MockExamAttempt` — বাস্তব HSC ফরম্যাটে (MCQ+CQ) Full Mock Exam এর রেকর্ড
- `RoutineSlot` — সাপ্তাহিক ক্লাস/পড়াশোনার রুটিন (দিন/সময়/সাবজেক্ট)
- `StudyPlan` + `StudyPlanItem` — AI জেনারেটেড ৭ দিনের দৈনিক পড়াশোনার পরিকল্পনা
  (StudyPlan এ Study Plan Agent এর জন্য `renewalSuggested` flag ও আছে)
- `Bookmark` — সেভ করা টপিক (`/saved` পেজ), `Note` — প্রতিটা টপিকে ব্যক্তিগত নোট,
  `Notification` — সিস্টেম নোটিফিকেশন (badge/forum reply/best answer, `link` ফিল্ড সহ)
- `StudyPet` — Virtual Pet Pomodoro Gamification (evolution stage/happiness)
- `StudyGroup` + `StudyGroupMember` — Study Group/Party System (সাপ্তাহিক XP লক্ষ্য)
- `QuizDuel` — Peer Quiz Duel (১-বনাম-১ MCQ প্রতিযোগিতা)
- `AuditLog` — Admin action ট্র্যাকিং (actor/action/target/metadata/IP)
- `PdfDocument` + `PdfChunk` + `PdfChatMessage` — PDF Chat (RAG): আপলোড করা PDF,
  vector embedding chunk (pgvector `vector(1024)` কলাম), কথোপকথন হিস্ট্রি
  (PdfDocument এ Audio Overview এর জন্য `summary`/`summaryGeneratedAt` ও Mind Map
  এর জন্য `mindMap`/`mindMapGeneratedAt` cache ফিল্ড আছে; `Topic` মডেলেও একই
  Mind Map cache ফিল্ড দুটো আছে)
- `CustomQuestionSet` + `CustomQuestion` — বইয়ের পাতার ছবি থেকে AI-generated
  MCQ/CQ (admin ব্যাংক থেকে স্বতন্ত্র)
- `LiveExamSession` — Solo Live Exam (custom set অথবা subject bank থেকে)
- `QuizBattle` + `QuizBattleParticipant` — Room code দিয়ে multi-person
  self-paced MCQ প্রতিযোগিতা (সর্বোচ্চ ৫০ জন)
- `AdmissionQuestion` + `AdmissionMockAttempt` — Admission Prep
  (Medical/BUET/DU) এর জন্য HSC Question ব্যাংক থেকে সম্পূর্ণ স্বতন্ত্র
  মডেল, negative marking সহ

**pgvector Extension**: PDF Chat ফিচারের জন্য Supabase এ `CREATE EXTENSION vector;`
enable করা হয়েছে (built-in সাপোর্ট আছে) — `PdfChunk.embedding` কলামে Mistral
Embeddings (`mistral-embed`, 1024-dim) সংরক্ষিত হয়, HNSW ইনডেক্স দিয়ে দ্রুত cosine
similarity সার্চ করা হয়। Prisma `Unsupported("vector(1024)")` টাইপ ব্যবহার করা
হয়েছে যেহেতু Prisma Client নিজে vector টাইপ সাপোর্ট করে না — insert/query raw SQL
(`$executeRawUnsafe`/`$queryRawUnsafe`) দিয়ে করা হয় (`lib/pdf-chat.ts`)।

স্কিমা পরিবর্তন করলে নতুন মাইগ্রেশন লাগবে:
```bash
npx prisma migrate dev --name your_change_description
```

**বর্তমান ডেটা (Phase 2 থেকে):** ১৩টা Subject, ৮৯টা Chapter, ১৮৫টা Topic — সব NCTB
সিলেবাস অনুযায়ী `prisma/seed.ts` দিয়ে সিড করা। আবার সিড করতে চাইলে `npm run db:seed` চালান।

---


## 🛣️ রোডম্যাপ

Phase 0–8 এবং ১০০+ Extra Phase **সম্পন্ন**। বাকি আছে শুধু:

- [ ] **Phase 9** — Deploy

সম্পূর্ণ চেকলিস্ট → [`docs/ROADMAP_ARCHIVE.md`](./docs/ROADMAP_ARCHIVE.md)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui + Framer Motion
- **Database:** Supabase PostgreSQL (cloud), Prisma ORM v6
- **Rate limiting:** Atomic Upstash Redis REST sliding window (optional multi-instance) + bounded local-memory safety fallback
- **Auth:** NextAuth.js v5 (Credentials Provider + bcrypt)
- **State:** React Server Components + `useState`/`useEffect` (আলাদা global state library ব্যবহার হয় না)
- **Charts:** Recharts
- **AI:** Groq, Mistral, Cerebras, OpenRouter (multi-provider fallback)
- **PDF Processing:** pdf-parse v2 (টেক্সট এক্সট্রাকশন), Mistral Embeddings
  (`mistral-embed`, RAG এর জন্য ভেক্টর এমবেডিং)
- **Vector Search:** Supabase pgvector (HNSW ইনডেক্স, cosine similarity)
- **PDF Generation:** @react-pdf/renderer (Report Card এক্সপোর্ট)
- **Math Rendering:** KaTeX + react-katex (LaTeX সূত্র/সমীকরণ রেন্ডারিং)
