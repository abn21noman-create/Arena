# 🎓 HSC Ultimate — Project Overview

**Last updated:** 5 August 2026 (verified source inventory)

---

## 📊 At a Glance

| Metric | Count |
|---|---|
| **Total Pages (routes)** | **89** |
| **API Routes (backend)** | **213** |
| **React Components** | **178** |
| **Library/Utility Files** | **113** |
| **Prisma Database Models** | **67** |
| **Prisma Migrations** | **33** |
| **Seed Scripts** | **30+** (subjects + questions + CQ + badges) |
| **Tech Stack** | Next.js 16 + React 19 + TypeScript + Prisma + Supabase PostgreSQL + Tailwind CSS |
| **LOC** | ~50,000+ (excluding node_modules) |

---

## 🌐 89 Pages — Organized by Section

### 🔓 Public / Auth & Legal
- `/` — Landing page
- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/onboarding`
- `/privacy`, `/terms`, `/account-deletion` — public policy/data-control resources
- `/maintenance`, `/feature-disabled`
- `/u/[slug]` — Public user profile

### 🎓 Student Dashboard (52 pages)

**Core (4)**
- `/dashboard` — Premium hero + stats + quick actions
- `/analytics` — Performance graphs
- `/notifications`, `/saved`

**Learn / Study (5)**
- `/learn` — Subject catalog
- `/learn/[subjectId]` — Chapter list
- `/learn/[subjectId]/[topicId]` — Topic detail with notes/video
- `/pdf-chat` — PDF library
- `/pdf-chat/[documentId]`

**Practice System (10)**
- `/practice` — Practice home
- `/practice/[subjectId]`
- `/practice/[subjectId]/[chapterId]`
- `/practice/[subjectId]/[chapterId]/pretest`
- `/practice/result/[attemptId]`
- `/adaptive-practice` + `/adaptive-practice/run`
- `/drill` + `/drill/run`
- `/mistake-vault` + `/mistake-vault/run`

**Mock & Live Exam (8)**
- `/mock-exam` + `/mock-exam/subject/[subjectId]`
- `/mock-exam/attempt/[attemptId]`
- `/mock-exam/result/[attemptId]`
- `/live-exam` + `/live-exam/start` + `/live-exam/[sessionId]` + `/live-exam/[sessionId]/result`

**CQ Practice (4)**
- `/cq-practice` + `/cq-practice/[subjectId]` + `/cq-practice/[subjectId]/[chapterId]`
- `/cq-practice/result/[attemptId]`

**Admission Prep (4)**
- `/admission` + `/admission/history`
- `/admission/run/[attemptId]` + `/admission/result/[attemptId]`

**Flashcards (4)**
- `/flashcards` + `/flashcards/discover`
- `/flashcards/[deckId]` + `/flashcards/[deckId]/review`

**Social (8)**
- `/forum` + `/forum/new` + `/forum/[postId]`
- `/duel` + `/duel/[duelId]` + `/duel/history`
- `/quiz-battle` + `/quiz-battle/create` + `/quiz-battle/[battleId]` + `/quiz-battle/history`
- `/study-group`
- `/leaderboard`

**Tools (8)**
- `/planner` — Tasks + Pomodoro + Study pet + Class routine + Exam countdown
- `/reading-room` + `/reading-room/leaderboard`
- `/formula-search`
- `/ai-tutor`
- `/badges`
- `/settings`

### 🛠️ Admin (13 pages)
- `/admin` — Dashboard
- `/admin/users` + `/admin/subjects` + `/admin/subjects/[subjectId]`
- `/admin/chapters/[chapterId]` + `/admin/topics/[topicId]`
- `/admin/content-quality` — automated risk queue + human academic review/provenance
- `/admin/analytics` + `/admin/reports` + `/admin/audit-log`
- `/admin/forum` + `/admin/notifications`
- `/admin/broadcast` — Premium broadcast system
- `/admin/system`

---

## ✨ Major Features (by category)

### 🤖 AI / Intelligence
- **AI Tutor** — Multi-subject doubt solver (Physics/Chemistry/Bio/Math)
- **AI Doubt Solver** — Step-by-step solutions with formula rendering
- **Adaptive Practice** — AI selects questions based on weak topics
- **AI Q&A** in PDF chat
- **CQ evaluation** — user answer-এর উপর AI-generated feedback
- **Study-plan generation** — real weak-topic/exam context থেকে plan
- **Custom question generation** — user-uploaded image/text থেকে MCQ/CQ
- Experimental Singularity prototype tree removed; current overview only reachable, persisted features lists

### 📚 Content & Learning
- **13 Subjects** (Physics 1+2, Chem 1+2, Bio 1+2, H.Math 1+2, Bangla, English, ICT, etc.)
- **89 Chapters** with structured content
- **185 Topics** with notes + video references
- **688 Core MCQ Questions** (source/live exact match after safe incremental audit)
- **220 Admission MCQ Questions** (Medical/DU/BUET; separate model)
- **64 CQ (Creative) Questions** for essay-style practice
- **Academic Content Quality Center** — 1,157-item structural risk triage, Admin or strict Multi-AI approval/correction/conflict, provenance and audit
- **Academic Trust Loop** — student issue report, exact content hash, Admin Reported queue, decision ও reporter notification
- **Multi-AI Approval** — two-provider answer consensus, ≥0.92 confidence, AI/Admin reviewer identity ও immutable evidence
- **14 Badges** with achievement system
- **PDF Chat** — Upload textbook PDFs, ask questions
- **Formula Search** — Quick search across all formulas
- **Reading Room** — Focused reading with leaderboard
- **Spaced Repetition Flashcards** with review queue

### 🎮 Practice & Exam Systems
- **Practice** — MCQ by subject/chapter
- **Adaptive Practice** — AI-curated questions
- **Drill Mode** — Timed MCQ sprints
- **Mock Exam** — Board-format full mock
- **Live Exam** — Real-time multi-user exam sessions
- **CQ Practice** — Creative question with AI evaluation
- **Admission Mock** — Medical/BUET/DU format with negative marking
- **Pretest** — Topic-level diagnostic
- **Mistake Vault** — All wrong answers, revision-focused
- **Custom Question Set** — User-created question banks

### 🎯 Gamification
- **XP System** — Earn for every action
- **Levels** — Progressive with progress %
- **Streaks** — Daily streak counter
- **League Tiers** — Bronze → Silver → Gold → Platinum → Diamond
- **Leaderboard** — Weekly XP competition
- **14 Badges** — Achievement unlocks
- **Study Pet** — Virtual pet that grows with study activity
- **Habit Tracker** — Daily habit streaks
- **Fatigue Monitor** — Prevents over-studying

### 🧠 Social & Competitive
- **Forum** — Post + replies + voting + helpful marks
- **Quiz Duel** — 1v1 real-time MCQ battle
- **Quiz Battle** — Multi-player quiz rooms
- **Study Group** — Form groups, study together
- **Reading Room** — Co-reading with leaderboard


### 🔒 Strict Focus / Device Wellbeing
- Self Strict Focus: 20–120 minute non-pausable sessions
- One-time Focus Contract for consent-based Admin start
- Android Accessibility package-only app blocking
- Phone/Emergency/Keyboard/Clock allowlist
- Foreground service, reboot restore, monotonic timer guard
- Optional replay/expiry-safe FCM command while the app is closed
- Per-device delivery audit, invalid-token soft-disable, queued native receipt sync ও Admin diagnostics
- Mandatory emergency exit and audit logging

### 📅 Consent-Based Focus Scheduling
- One-time, daily and weekly Admin schedules
- Five-minute reminders, lazy activation and constant-time protected GET/POST cron
- Persistent heartbeat/metrics, stale/failure health detection and Admin manual run
- Cross-instance expiring runner lease + schedule row-lock/active-session race protection
- Supabase Cron/Vault and Vercel Pro deployment templates
- User cancellation, Admin pause/resume/cancel, contract-revoke auto-cancel

### 📊 Focus Analytics & Privacy
- User 7/30/90-day focus dashboard
- Effective minutes, completion, emergency exits, average and streak
- Self/Admin source split and subject-wise focus time
- Privacy-first Admin analytics opt-in (default private)
- Admin aggregate report, opted-in leaderboard and UTF-8 CSV export

### 🛡️ Privacy & Compliance Center
- Public versioned Privacy Policy, Terms and account-deletion web guide
- Registration + Settings exact-version Privacy/Terms/age-assurance records
- Stale Strict Focus consent cannot authorize Admin start or scheduling
- AI/PDF/Accessibility data-flow disclosures and processor/retention inventory
- Portable export v2 with credential/other-user exclusions
- Account deletion cascade + non-FK cleanup and audit de-identification
- Admin policy-version coverage telemetry and strict CI/release privacy audit
- Play Data Safety/Accessibility drafts only; Play publishing remains deferred

### 📅 Planning & Productivity
- **Pomodoro Timer** — 25-min focus sessions
- **Task Manager** — Daily study tasks
- **Study Plan** — Auto-generated study plan
- **Class Routine** — Weekly class schedule
- **Exam Countdown** — HSC 2028 countdown
- **Exam Checklist** — Pre-exam prep items
- **Calendar View** — Monthly study calendar
- **Habit Tracker** — Daily habit streaks
- **Breathing Exercise** — Stress relief

### 🛠️ Admin / System
- **User Management** — View/edit/ban users
- **Subject/Chapter/Topic CRUD** — Full content management
- **Question Bank Editor** — Add/edit MCQ/CQ
- **Analytics Dashboard** — Platform-wide stats
- **Reports** — User reports
- **Audit Log** — Track admin actions
- **System Operations Center** — real DB/content/runtime/migration/security/deployment telemetry; no demo metrics
- **Academic Disaster Recovery** — Admin/CLI content snapshot, deterministic SHA-256, sensitive-table exclusion and offline integrity verifier
- **Release Readiness Gate** — source supply-chain manifest, live migration/content/snapshot/audit preflight and external blocker classification
- **Performance Reliability Audit** — FK/index coverage, pg_stat/query-plan benchmarks, static Prisma scan and strict regression gate
- **Security & Abuse Gate** — all-API baseline rate limiting, mutation Origin/body guard, route auth manifest, raw SQL/secret/header audit
- **System Control** — Maintenance, announcement and feature flags
- **Forum Moderation** — Pin/lock/delete posts
- **Notification System** — Push to all/targeted users
- **Broadcast** — Mass messaging with templates (premium UI built)
- **System Settings** — Feature flags
- **PDF Document Manager**

### 🎨 Design System (2026 Aurora Glass)
- **Glassmorphism** + **Aurora gradients** (15 active gradients)
- **Bento grid** layouts (12-col asymmetric)
- **Dark mode first** + 3-mode (light/dark/system) toggle
- **Bangla-first truthful UI** — incomplete locale toggle removed until a full translation exists
- **220 KB compiled CSS** with 50+ design tokens (HSL vars, easings, animations)
- **8 keyframe animations** (aurora, shimmer, float, pulse-glow, gradient, marquee, fade-up, scale-in, slide-in, blur-in)
- Reusable UI primitives: GlassCard, AuroraBackground, Skeleton, EmptyState, CountUp, dialogs, tooltips ও navigation
- **3 dashboard components** (DashboardHero, DashboardStats, QuickActions)
- **Mobile-first** responsive (2 col mobile → 3 tablet → 4 desktop)
- **WCAG 2.2 AA** compliance goal
- **28+ pages wrapped** with `PageShell` for consistent premium UX

### 📡 Real-time / Communication
- **SSE Notification Stream** — Server-Sent Events live notifications
- **Broadcast System** — Admin → targeted user messaging
- **Push Notifications** — Web push subscriptions
- **Notification Center** — In-app notification feed

### 🔐 Auth & Security
- **NextAuth.js** with credentials provider
- **Password Reset** flow
- **Session management** with cookies
- **Role-based access** (user/admin)
- **CSRF protection**
- **Audit logging** for admin actions
- **Distributed rate limiting** — atomic Upstash Redis sliding window in multi-instance production, bounded hashed in-memory safety fallback, circuit breaker, secret-free health status

---

## 🗄️ Database (PostgreSQL via Supabase)

**67 Prisma models** including:
- Core: User, Account, Session
- Content: Subject, Chapter, Topic, Question, CQQuestion, CQAttempt, ContentReview, ContentReviewRevision
- Practice: QuizAttempt, QuizAttemptAnswer, MockExamAttempt, AdmissionMockAttempt
- Social: ForumPost, ForumReply, ForumVote, StudyGroup, StudyGroupMember, QuizBattle, QuizDuel
- Flashcards: FlashcardDeck, Flashcard
- Productivity: Task, StudySession, RoutineSlot, StudyPlan, StudyPlanItem, Habit, HabitLog, ExamChecklistItem
- Stats: UserBadge, Badge, TopicProgress
- AI: PdfDocument, PdfChunk, PdfChatMessage, Note, NoteHelpfulVote
- Live: LiveExamSession, CustomQuestionSet, CustomQuestion, ReadingRoomSession
- Focus: FocusContract, FocusSession, FocusSchedule, FocusSchedulerState, NativeDevice, NativePushDelivery
- System/Privacy: Notification, PushSubscription, Bookmark, BookmarkFolder, ContentReport, AcademicContentReport, AIReviewBatch, AIContentReviewRun, ChatMessage, BroadcastCampaign, BroadcastRecipient, BroadcastTemplate, SystemSetting, PasswordResetToken, PolicyAcceptance, AuditLog, StudyPet

**Live data (preserved in Supabase):**
- 1 admin user
- 13 subjects
- 89 chapters
- 185 topics
- 688 core MCQ questions
- 220 admission MCQ questions
- 64 CQ questions
- 14 badges

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.2.12 (App Router, Turbopack)
- **UI:** React 19.2.4, TypeScript 5, Tailwind CSS 4
- **Backend:** Prisma 6.19.3 ORM, Supabase PostgreSQL (ap-northeast-1)
- **Auth:** NextAuth.js 5.0.0-beta.32
- **Icons:** Lucide React (26+ used)
- **Animation:** CSS keyframes + framer-motion (where used)
- **Real-time:** Server-Sent Events (SSE)
- **Charts:** recharts (lazy loaded)
- **PDF:** pdf-parse (lazy loaded)
- **Mobile:** Capacitor + Android build (documented)
- **Package Manager:** npm
- **Product language:** Bangla-first, with necessary English academic/technical terms

---

## 📂 Major File Counts

| Directory | Count |
|---|---|
| `app/**/page.tsx` (routes) | 89 |
| `app/api/**/route.ts` (API) | 213 |
| `components/**/*.{ts,tsx}` | 178 |
| `lib/**/*.{ts,tsx}` (utilities) | 113 |
| `prisma/seed-*.ts` (data) | 30+ |
| `prisma/schema.prisma` models | 55 |
| `docs/*.md` (documentation) | 8 |

---

## 🚧 What Was Built Recently (2026)

- **Aurora Glass 2026** design system (full design tokens, animations, components)
- **Premium Dashboard** with hero + 4-stat bento + 6 quick actions + 12 study tools
- **Runtime truth cleanup** — partial translation toggle এবং fake/no-op prototype surface removed
- **3-mode theme** (light/dark/system) with smooth transitions + FOUC prevention
- **Broadcast system** (admin → users) with premium admin UI
- **SSE notification stream**
- **28+ pages wrapped with PageShell** for consistent premium design
- **Bug fixes** (iconKey migration for Server→Client component prop, 3 wrong component imports)
- **Production build fixes** (formula-search duplicate function name, singularity ai-provider path)

---

*Inventory verified from the source tree on 5 August 2026.*
