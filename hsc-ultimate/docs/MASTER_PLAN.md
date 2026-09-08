# 🎓 HSC Ultimate — Science Group এর জন্য All-in-One HSC Preparation Platform
### (HSC 2028 ব্যাচ, Science Group শিক্ষার্থীদের জন্য বিশেষভাবে ডিজাইন করা Learning + Research + Planner Super-App)

> এই ডকুমেন্টটি Deep Research এর ভিত্তিতে তৈরি করা হয়েছে (10 Minute School, Shikho, Khan Academy,
> Notion, Todoist, MyStudyLife, Anki, Quizlet, Duolingo গেমিফিকেশন মডেল বিশ্লেষণ করে)।
> এটাই হবে পুরো প্রজেক্টের "সংবিধান" — এই ফাইল অনুসরণ করেই ধাপে ধাপে পুরো অ্যাপ বিল্ড হবে।
>
> ⚠️ **স্কোপ আপডেট:** পুরো HSC (সব গ্রুপ) না বানিয়ে, এখন থেকে শুধুমাত্র **Science Group**
> এর জন্য বানানো হবে। Commerce/Arts গ্রুপের সাবজেক্ট বাদ দেওয়া হয়েছে।

---

## 📌 অংশ ০: রিসার্চ সামারি — কার থেকে কী নিচ্ছি

| প্ল্যাটফর্ম | যা ভালো লাগলো | আমাদের অ্যাপে যেভাবে থাকবে |
|---|---|---|
| **10 Minute School** | বিশাল ভিডিও লাইব্রেরি, লাইভ ক্লাস, মডেল টেস্ট, লিডারবোর্ড, পারফরম্যান্স রিপোর্ট, doubt-solving, AI (TenTen AI, SuperSolve) | ভিডিও লেসন সেকশন, মডেল টেস্ট মডিউল, AI Doubt Solver, লিডারবোর্ড |
| **Shikho** | Shikho AI (বাংলায় প্রশ্নের উত্তর), Smart Notes, Report Card, Calendar view, badges/points, Mentor Stories, Most Important Classes | AI চ্যাট টিউটর (বাংলা+ইংরেজি), Smart Notes ফিচার, Report Card/Analytics, ক্যালেন্ডার, গুরুত্বপূর্ণ টপিক হাইলাইট |
| **Khan Academy** | Adaptive Practice (ভুল দিলে সহজ প্রশ্ন, ঠিক দিলে কঠিন), Mastery System, pretest দিয়ে skip করার সুযোগ, প্রগ্রেস ট্র্যাকিং | Adaptive Quiz Engine, Mastery-based topic progress bar, Chapter Pretest |
| **Notion** | সব কিছু কাস্টমাইজেবল ডাটাবেজ/পেজ, নোট + প্ল্যানিং এক জায়গায় | Custom Notes System (rich text/markdown), Database-style Subject/Chapter organizer |
| **Todoist / TickTick / MyStudyLife** | ক্লিন টাস্ক লিস্ট, ক্লাস রুটিন, ডেডলাইন রিমাইন্ডার, রিভিশন শিডিউলিং, GPA/exam tracker | Task Manager + Class Routine + Exam Countdown + Study Session Scheduler |
| **Anki / Quizlet** | Spaced Repetition (SM-2/FSRS অ্যালগরিদম), ফ্ল্যাশকার্ড, Image Occlusion, Learn/Match/Test মোড | ফ্ল্যাশকার্ড মডিউল + আসল Spaced Repetition Algorithm (SM-2 বেসড) |
| **Duolingo** | XP পয়েন্ট, Daily Streak, Leagues/Leaderboard, Badges, Hearts/Lives, mini-challenge ফরম্যাট | Gamification Engine: XP, Streak, League, Badge, Level system |
| **Google Calendar / Forest** | Time-blocking, Pomodoro ফোকাস টাইমার, distraction-free study mode | Pomodoro Timer + Focus Mode + Calendar Sync |

---

## 📌 অংশ ১: প্রজেক্ট ভিশন

**নাম (প্রস্তাবিত):** `HSC Ultimate` / `ProttyoshaHub` / `ExamBondhu` (আপনি চাইলে নাম পরে ঠিক করবেন)

**একলাইনে:** HSC 2028 ব্যাচের জন্য একটি সম্পূর্ণ AI-চালিত সেলফ-স্টাডি ইকোসিস্টেম, যেখানে
পড়াশোনা (Learning), গবেষণা/অনুশীলন (Research/Practice), এবং সময়-ব্যবস্থাপনা (Planning) —
এই তিনটি একসাথে একটি প্ল্যাটফর্মে থাকবে।

**Core Design Principles:**
1. **Bangla + English উভয় ভাষা সাপোর্ট** (UI টগল)
2. **NCTB HSC Syllabus অনুযায়ী** কনটেন্ট স্ট্রাকচার (Science/Commerce/Arts — সব গ্রুপ)
3. **Offline-first** যতটা সম্ভব (PWA) — বাংলাদেশে ইন্টারনেট সমস্যার কথা মাথায় রেখে
4. **Free/Open-source টুল** দিয়ে বানানো, personal project হিসেবে scalable
5. **Gamified কিন্তু distraction-free** — motivation বাড়াবে, focus নষ্ট করবে না
6. **Data-driven**: প্রতিটা একশন থেকে analytics বের করে দুর্বলতা দেখানো

---

## 📌 অংশ ২: HSC সিলেবাস ম্যাপিং — শুধু Science Group (Content Structure এর ভিত্তি)

### Compulsory (সবার জন্য বাধ্যতামূলক):
- Bangla 1st Paper (101) + Bangla 2nd Paper (102)
- English 1st Paper (107) + English 2nd Paper (108)
- ICT (275)
- Islam Shikkha / Hindu Dhormo / Buddhist Dhormo / Christian Dhormo (ঐচ্ছিক ধর্ম বিষয় — যেটা প্রযোজ্য)

### Science Group — মূল ৪টি বিষয় (৩টি বাধ্যতামূলক + ১টি ঐচ্ছিক চতুর্থ বিষয়):
- **Physics 1st Paper & 2nd Paper** (174/175)
- **Chemistry 1st Paper & 2nd Paper** (176/177)
- **Biology 1st Paper & 2nd Paper** (178/179) — যারা Biology নেয়
- **Higher Mathematics 1st Paper & 2nd Paper** (265/266) — যারা Higher Math নেয় (৪র্থ বিষয় হিসেবেও নেওয়া যায়)

> 🔸 নোট: Science Group এ সাধারণত Physics + Chemistry + (Biology OR Higher Math) বাধ্যতামূলক,
> আর ৪র্থ বিষয় হিসেবে বাকিটা (Higher Math বা Biology) অথবা অন্য কিছু নেওয়া যায়। যেহেতু আপনি
> নিজেই HSC 2028 এর science student, অ্যাপে **Physics, Chemistry, Biology, Higher Math — এই
> ৪টি বিষয়ই রাখা হবে** (সবার জন্য সবচেয়ে কমন কম্বিনেশন), যাতে যেকোনো সায়েন্স স্টুডেন্ট ব্যবহার করতে পারে।

### চূড়ান্ত Subject List (অ্যাপে যা থাকবে):
1. Bangla (1st + 2nd Paper)
2. English (1st + 2nd Paper)
3. ICT
4. Physics (1st + 2nd Paper)
5. Chemistry (1st + 2nd Paper)
6. Biology (1st + 2nd Paper)
7. Higher Mathematics (1st + 2nd Paper)

**অ্যাপে Data Model:** `Subject → Paper → Chapter → Topic → Sub-topic → Lesson/Content Item`
(যেহেতু এখন শুধু Science Group, তাই "Group" লেয়ারটা স্কিমাতে রাখা হবে ঠিকই — যাতে ভবিষ্যতে
Commerce/Arts অ্যাড করতে চাইলে সহজে করা যায় — কিন্তু UI তে শুধু Science গ্রুপের কনটেন্টই দেখানো হবে।)

---

## 📌 অংশ ৩: সম্পূর্ণ ফিচার লিস্ট (মেগা লিস্ট — Module ভিত্তিক)

### 🅰️ MODULE 1: Authentication & User Profile
- [ ] Email/Password + Google/Facebook OAuth লগইন — শুধু Email/Password
      বাস্তবায়িত (OAuth ইচ্ছাকৃতভাবে স্কিপ, personal-use app এ কম
      priority, ভবিষ্যতে চাইলে NextAuth এ Google provider যোগ করা সহজ)
- [x] Onboarding wizard: নাম, ক্লাস, বোর্ড, HSC ব্যাচ — ✅ সম্পন্ন
      (`/onboarding` পেজ, `app/api/user/onboarding/route.ts`)
- [x] User Profile পেজ: স্ট্যাটস (streak, XP, badges) — ✅ সম্পন্ন
      (Dashboard header + `/badges` পেজ + Public Profile `/u/[slug]`)
- [x] Settings: থিম (Dark/Light/System), নোটিফিকেশন প্রেফারেন্স —
      ✅ সম্পন্ন (`/settings` পেজ — Profile/Password/Theme/
      Accessibility/Public Profile/Email Notification ট্যাব সহ;
      ভাষা টগল (Bangla/English) ইচ্ছাকৃতভাবে বাদ — UI সম্পূর্ণ বাংলা
      একটাই ভাষায় ডিজাইন করা হয়েছে শুরু থেকেই)

### 🅱️ MODULE 2: Learning Hub (কোর কন্টেন্ট)
- [x] Subject → Chapter → Topic নেভিগেশন — ✅ সম্পন্ন (`/learn` →
      `/learn/[subjectId]` → `/learn/[subjectId]/[topicId]`)
- [x] প্রতিটি টপিকে: Video Lesson embed, Text Notes, Formula Sheet —
      ✅ সম্পন্ন (Topic মডেলে `videoUrl`/`notesMarkdown`/
      `formulaSheet` ফিল্ড, Topic Detail পেজে রেন্ডার করা হয়)
- [x] "Important" ট্যাগ করা টপিক — ✅ সম্পন্ন (`Topic.isImportant`,
      Star আইকন দিয়ে হাইলাইট)
- [x] Bookmark/Save for later ফিচার — ✅ সম্পন্ন (`/saved` পেজ,
      `app/api/bookmarks`)
- [x] Reading progress bar (per chapter completion %) — ✅ সম্পন্ন
      (দেখুন নিচের "Reading Progress Bar (Per Chapter Completion %)"
      সেকশন)
- [x] Text-to-Speech (নোট শোনার সুবিধা) — ✅ সম্পন্ন
      (`components/learn/text-to-speech-button.tsx`, Web Speech API)
- [x] Downloadable PDF Notes (offline access) — ✅ সম্পন্ন (দেখুন নিচের
      "Downloadable PDF Notes (Topic Notes + Formula Sheet)" সেকশন)
- [x] Search বার (সব কনটেন্টে কীওয়ার্ড সার্চ) — ✅ সম্পন্ন (Global
      Search, Ctrl+K, `components/layout/global-search.tsx`)

### 🅲️ MODULE 3: AI Study Assistant ("Doubt Solver" / টিউটর বট)
- [x] AI চ্যাটবট (বাংলা+ইংরেজি) — ✅ সম্পন্ন (`/ai-tutor`, multi-
      provider fallback chain: Groq→Mistral→Cerebras→OpenRouter)
- [x] প্রশ্নের ছবি তুলে/আপলোড করে সমাধান (Vision) — ✅ সম্পন্ন
      (`lib/ai-provider.ts` এ vision-capable মডেল সাপোর্ট)
- [x] Socratic মোড ("সহজ ভাষায় ব্যাখ্যা" এর কাছাকাছি, guided
      explanation) — ✅ সম্পন্ন (`AiTutorMode.SOCRATIC`,
      Khanmigo-অনুপ্রাণিত, সরাসরি উত্তর না দিয়ে গাইড করে)
- [x] প্রতিটি ভুল উত্তরকে flashcard এ কনভার্ট করার সাজেশন — ✅ সম্পন্ন
      (দেখুন নিচের "Wrong-Answer → Flashcard কনভার্টার" সেকশন)

### 🅳️ MODULE 4: Practice & Assessment Engine
- [x] Chapter-wise MCQ Practice (adaptive difficulty) — ✅ সম্পন্ন
      (Practice + Smart/Adaptive Practice + Simplified Item-Difficulty
      Calibration)
- [x] CQ (Creative Question) Practice ব্যাংক with model answers —
      ✅ সম্পন্ন (`/cq-practice`, AI evaluation সহ)
- [x] Full Model Test (timed, board-exam ফরম্যাট) — ✅ সম্পন্ন
      (`/mock-exam`, MCQ+CQ পূর্ণ পরীক্ষা)
- [x] Instant scoring + explanation for each answer — ✅ সম্পন্ন
      (Result পেজ গুলোতে সব জায়গায়)
- [x] Mastery System (Not Started → Learning → Practicing →
      Mastered) — ✅ সম্পন্ন (`MasteryStatus` enum, `TopicProgress`)
- [x] Pretest to skip known topics — ✅ সম্পন্ন (দেখুন নিচের "Pretest
      to Skip Known Topics" সেকশন)
- [x] Weakness Detector — ✅ সম্পন্ন (`getWeakTopics()`,
      Wrong-Answer Misconception Tagging দিয়ে সম্প্রসারিত)
- [x] Previous Years' Board Questions ডাটাবেজ — ✅ সম্পন্ন
      (`boardYear`/`boardName` ফিল্ড + ফিল্টার UI)

### 🅴️ MODULE 5: Flashcards & Spaced Repetition (Anki-style)
- [x] কাস্টম ফ্ল্যাশকার্ড ডেক তৈরি — ✅ সম্পন্ন (`/flashcards`)
- [x] SM-2 / FSRS ভিত্তিক Spaced Repetition — ✅ সম্পন্ন (dual
      algorithm, নতুন কার্ড FSRS ডিফল্ট)
- [x] Again/Hard/Good/Easy রেটিং সিস্টেম — ✅ সম্পন্ন
      (`ReviewRating` টাইপ, Review Runner এ ৪টা বাটন)
- [x] Image Occlusion — ✅ সম্পন্ন (`lib/image-occlusion.ts`)
- [x] AI দিয়ে নোট থেকে অটো-ফ্ল্যাশকার্ড জেনারেশন — ✅ সম্পন্ন
      (`lib/flashcard-gen.ts`, Note-to-Flashcard Converter সহ)
- [x] Daily review queue + reminder — ✅ সম্পন্ন (দেখুন নিচের "Daily
      Flashcard Review Queue Reminder" সেকশন)

### 🅵️ MODULE 6: Planner & Productivity
- [x] ক্লাস রুটিন / স্টাডি রুটিন বিল্ডার — ✅ সম্পন্ন
      (`components/planner/class-routine.tsx`, drag-drop না হলেও
      ফর্ম-ভিত্তিক টাইম-ব্লক এন্ট্রি আছে)
- [x] Exam Countdown Timer — ✅ সম্পন্ন
      (`components/planner/exam-countdown-card.tsx`)
- [x] Daily/Weekly/Monthly টাস্ক ম্যানেজার — ✅ সম্পন্ন
      (`components/planner/task-manager.tsx`, priority+due date সহ)
- [x] Study Session Scheduler (AI Auto Study Plan) — ✅ সম্পন্ন
      (`lib/study-plan-generator.ts` + Study Plan Agent)
- [x] Calendar View (মাসিক) — ✅ সম্পন্ন (দেখুন নিচের "Calendar View
      (মাসিক)" সেকশন; শুধু মাসিক ভিউ, সাপ্তাহিক ভিউ ভবিষ্যতের জন্য
      রাখা হয়েছে)
- [x] Pomodoro Focus Timer — ✅ সম্পন্ন
      (`components/planner/pomodoro-timer.tsx`, Focus Mode distraction
      ব্লকার ছাড়া — ওয়েব অ্যাপে সীমিত সম্ভাবনা)
- [x] Habit Tracker (ডেইলি স্টাডি habit যেমন "আজ ২ ঘন্টা পড়া") — ✅
      সম্পন্ন (দেখুন নিচের "Habit Tracker" সেকশন)
- [x] Goal Setting (weekly/monthly targets, GPA target) — ✅ সম্পন্ন
      (Study Group এ collective weekly XP target + Personal Goal
      Setting এ personal GPA target — দুটো অংশই সম্পন্ন)

### 🅶️ MODULE 7: Gamification & Motivation
- [x] XP পয়েন্ট সিস্টেম — ✅ সম্পন্ন (`lib/league.ts` এর `awardXp()`
      কেন্দ্রীভূত, প্রতিটা practice/quiz/flashcard action এ)
- [x] Daily Streak ট্র্যাকার — ✅ সম্পন্ন (`lib/streak.ts`, Streak
      Freeze সহ)
- [x] Level System — ✅ সম্পন্ন (`lib/gamification.ts`)
- [x] Badges/Achievements — ✅ সম্পন্ন (১৪টা badge, `/badges` পেজ)
- [x] Leaderboard — ✅ সম্পন্ন (`/leaderboard`, Weekly League/Tier
      সহ)
- [x] Study Groups/Challenges — ✅ সম্পন্ন (`/study-group`,
      সাপ্তাহিক collective XP target)
- [x] Motivational quotes/notifications — ✅ সম্পন্ন (দেখুন নিচের
      "Daily Motivational Quote" সেকশন; notification অংশ ইতিমধ্যে
      বিদ্যমান Notification System দিয়ে কভার করা হয়েছে)

### 🅷️ MODULE 8: Analytics & Report Card
- [x] Performance Dashboard (subject-wise pie/bar chart) — ✅ সম্পন্ন
      (`components/analytics/analytics-dashboard.tsx`, Recharts দিয়ে)
- [x] Time spent analytics — ✅ সম্পন্ন (`getTimeDistribution()`)
- [x] Progress over time graph — ✅ সম্পন্ন (`getProgressOverTime()`)
- [x] Predicted GPA/Score estimator — ✅ সম্পন্ন
      (`lib/gpa-predictor.ts`, weighted multi-source)
- [x] Comparison with average performance (peer benchmark) — ✅
      সম্পন্ন (Mock Exam Percentile/Rank + Peer Comparison in
      Adaptive Practice)
- [x] Exportable Report (PDF) — ✅ সম্পন্ন (`lib/report-card-pdf.tsx`,
      বাংলা ফন্ট এমবেডেড)

### 🅸️ MODULE 9: Community & Collaboration
- [x] Discussion Forum — ✅ সম্পন্ন (`/forum`, vote/best-answer সহ)
- [x] Study Group creation & collective challenge — ✅ সম্পন্ন
      (`/study-group`; রিয়েল-টাইম চ্যাট নেই, শুধু collective XP target
      — চ্যাট ফিচার যোগ করলে অতিরিক্ত জটিলতা/moderation burden বাড়বে
      যা এই স্কেলে প্রয়োজনের অতিরিক্ত)
- [x] Peer note sharing — ✅ সম্পন্ন (দেখুন নিচের "Peer Note Sharing"
      সেকশন)
- [ ] ~~Teacher/Mentor Q&A section~~ — **স্থায়ীভাবে বাদ**
      (ব্যবহারকারীর স্পষ্ট নির্দেশ: সম্পূর্ণ student-only প্ল্যাটফর্ম,
      কোনো Teacher/Parent ফিচার কখনো যোগ হবে না)

### 🅹️ MODULE 10: Notifications & Engagement
- [x] Push Notification (browser push, streak/exam reminder) — ✅
      সম্পন্ন (দেখুন নিচের "Push Notification" সেকশন)
- [x] Email digest (weekly progress summary) — ✅ সম্পন্ন (দেখুন
      "Notification Digest (Weekly Email Summary)" সেকশন, Resend দিয়ে)
- [x] In-app notification center — ✅ সম্পন্ন (দেখুন নিচের "In-App
      Notification Center" সেকশন)

### 🅺️ MODULE 11: Admin Panel
- [x] Subject/Chapter/Topic CRUD ইন্টারফেস — ✅ সম্পন্ন
      (`/admin/subjects`, `/admin/chapters`, `/admin/topics`)
- [x] Question Bank ম্যানেজার (bulk CSV import) — ✅ সম্পন্ন
      (`/admin/topics/[topicId]`, Question Manager + CSV bulk upload)
- [x] User ম্যানেজমেন্ট — ✅ সম্পন্ন (`/admin/users`)
- [x] Analytics ওভারভিউ — ✅ সম্পন্ন (`/admin/analytics`, DAU/WAU/MAU)

### 🅻️ MODULE 12 (Future/Stretch Goals):
- [x] University Admission Test প্রস্তুতি সেকশন — ✅ সম্পন্ন
      (`/admission`, Medical/BUET/DU, নেগেটিভ মার্কিং সহ)
- [ ] ~~Live Class integration~~ — ইচ্ছাকৃতভাবে স্কিপ (single-developer
      personal-use app এ ROI কম, architecture জটিলতা বেশি)
- [ ] ~~Voice-based AI tutor~~ — ইচ্ছাকৃতভাবে স্কিপ (cost/complexity
      বেশি, personal-use app এ ROI কম)
- [ ] ~~Mobile native app~~ — ইচ্ছাকৃতভাবে স্কিপ (PWA ইতিমধ্যে ভালো
      বিকল্প, dynamic route/SSR এর কারণে static export জটিল)
- [x] Offline PWA full sync — ✅ সম্পন্ন (দেখুন নিচের "Offline PWA
      Full Sync" সেকশন)
- [ ] ~~Multi-language content (English medium)~~ — ইচ্ছাকৃতভাবে
      স্কিপ (UI সম্পূর্ণ বাংলায় ডিজাইন করা, HSC 2028 Bangla-medium
      ব্যাচের জন্য প্রাসঙ্গিক না)

**⚠️ Documentation Debt Note (এই সেশনে ঠিক করা হয়েছে)**: উপরের পুরো
Module ১-১২ checklist টা Phase 0 তে (প্রজেক্ট শুরুর সময়) লেখা হয়েছিল
এবং বিভিন্ন সেশনে ফিচার implement হওয়ার পরও checkbox আপডেট হয়নি
(শুধু নতুন ফিচার যোগ হওয়ার সময় "Extra Phase" হিসেবে আলাদা এন্ট্রি
লেখা হতো, কিন্তু মূল Module checklist ছোঁয়া হতো না)। এই সেশনে পুরো
কোডবেস অডিট করে প্রতিটা আইটেম verify করে সঠিকভাবে `[x]`/`[ ]` মার্ক
করা হয়েছে (কোনো কোড পরিবর্তন হয়নি, শুধু ডকুমেন্টেশন accuracy ফিক্স)।
এখন সত্যিকারের বাকি থাকা আইটেম: **Downloadable PDF Notes, Pretest
skip, Habit Tracker, Personal Goal Setting (GPA target), Peer Note
Sharing, Push Notification (browser), Offline full sync** — বাকিগুলো
হয় সম্পন্ন অথবা ইচ্ছাকৃতভাবে স্কিপ করা।

---

## 📌 অংশ ৪: টেক স্ট্যাক (সহজ, ফ্রি, VS Code-এ রান করার উপযোগী)

যেহেতু আপনি "কোনো পছন্দ নেই, best practice অনুযায়ী" বলেছেন — নিচের স্ট্যাকটি বেছে নেওয়া হলো
কারণ এটা **শেখা সহজ, ফ্রি hosting আছে, এবং AI দিয়ে কোড জেনারেট করা সহজ**:

### Frontend + Backend (একসাথে, Full-stack Framework):
- **Next.js 14+ (App Router, TypeScript)** — React ভিত্তিক, SEO friendly, API routes বিল্ট-ইন
- **Tailwind CSS** — দ্রুত UI স্টাইলিং
- **shadcn/ui** — রেডিমেড সুন্দর কম্পোনেন্ট (buttons, cards, modals)
- **Framer Motion** — smooth animation (gamification badges পপ-আপ ইত্যাদির জন্য)
- **Zustand / React Context** — state management
- **React Hook Form + Zod** — ফর্ম ও ভ্যালিডেশন

### Database & Backend Services:
- **PostgreSQL** (via Supabase বা Neon — দুটোই ফ্রি টিয়ার আছে)
- **Prisma ORM** — ডাটাবেজ স্কিমা ও কুয়েরি সহজ করার জন্য
- **Supabase Auth** অথবা **NextAuth.js** — অথেন্টিকেশন
- **Supabase Storage / Cloudinary** — ভিডিও, ছবি, PDF আপলোডের জন্য

### AI Features — Multi-Provider Fallback System (✅ টেস্ট করা হয়েছে, সব key কাজ করছে):

আপনার দেওয়া ৪টা API key টেস্ট করে দেখা হয়েছে — ফলাফল নিচে:

| Provider | স্ট্যাটাস | ব্যবহারের ভূমিকা | নোট |
|---|---|---|---|
| **Groq** | ✅ কাজ করছে, খুবই দ্রুত | 🥇 Primary — AI Tutor/Doubt Solver এর মূল ইঞ্জিন | `llama-3.3-70b-versatile` মডেল টেস্ট করা হয়েছে, বাংলায় ভালো উত্তর দেয়। অতি দ্রুত (real inference chip)। ⚠️ আপনি "grok" বলেছিলেন কিন্তু key ফরম্যাট (`gsk_...`) আসলে **Groq**-এর (xAI এর আসল Grok না — এটা আলাদা কোম্পানি) |
| **Mistral** | ✅ কাজ করছে | 🥈 Secondary — Groq ব্যর্থ হলে ব্যাকআপ | `mistral-small-latest`/`mistral-medium` টেস্ট করা হয়েছে, বাংলা রেসপন্স ভালো, vision capability ও আছে (ছবি থেকে অংক সমাধানে কাজে লাগবে) |
| **Cerebras** | ✅ কাজ করছে, অতি দ্রুত | 🥉 Tertiary — দ্বিতীয় ব্যাকআপ | `gpt-oss-120b` মডেল অ্যাভেইলেবল, রিজনিং সহ উত্তর দেয় |
| **OpenRouter** | ⚠️ Key ভ্যালিড কিন্তু ফ্রি মডেলে frequent rate-limit (429 error) | 4th fallback (শেষ upay হিসেবে) | ফ্রি টিয়ারের মডেলগুলো (llama/deepseek/qwen `:free`) হাই-ডিমান্ডে প্রায়ই rate-limited হচ্ছে। শুধু জরুরি backup হিসেবে রাখা হবে, primary নির্ভরতা নয় |

**Implementation Strategy:**
- একটা `lib/ai-provider.ts` ফাইলে multi-provider fallback logic থাকবে:
  `Groq → (fail হলে) Mistral → (fail হলে) Cerebras → (fail হলে) OpenRouter`
- সব provider এর API OpenAI-compatible ফরম্যাট মেনে চলে (`/chat/completions` endpoint),
  তাই একই কোড স্ট্রাকচার দিয়ে সবগুলো কল করা যাবে — provider সুইচ করা সহজ হবে
- **ছবি থেকে অংক সমাধান (OCR+Vision)** এর জন্য Mistral এর vision-capable মডেল
  (`mistral-medium-2505` — vision:true) ব্যবহার করা হবে
- সব API key `.env.local` ফাইলে রাখা হবে (কখনো কোডে hardcode করা হবে না, `.gitignore` এ
  `.env.local` থাকবে যাতে GitHub এ push না হয়)
- ⚠️ **নিরাপত্তা সতর্কতা:** যেহেতু key গুলো একবার চ্যাটে শেয়ার হয়েছে, প্রজেক্ট শেষ করার পর
  (বা এখনই সময় পেলে) প্রতিটা provider এর dashboard থেকে **key regenerate/rotate** করে নেওয়া
  উচিত, যাতে পুরনো key অকার্যকর হয়ে যায়।

### OCR/Vision (বিকল্প):
- **Tesseract.js** (ফ্রি, ক্লায়েন্ট-সাইড OCR) — সাধারণ টেক্সট এক্সট্র্যাকশনের জন্য
- **Mistral Vision** (উপরে উল্লেখিত key দিয়ে) — জটিল অংক/ডায়াগ্রাম বোঝার জন্য প্রাইমারি চয়েস

### Notifications:
- **OneSignal** (ফ্রি) — Push notification
- **Resend / Nodemailer** — Email

### Deployment (Free):
- **Vercel** — Next.js হোস্টিং (ফ্রি টিয়ার)
- **Supabase** — DB + Auth + Storage (ফ্রি টিয়ার)

### Dev Tools:
- **VS Code + ESLint + Prettier**
- **Git + GitHub** (version control)
- **pnpm** (fast package manager)

> 🔸 বিকল্প (সহজ ভার্সন): যদি Next.js জটিল লাগে, শুরুতে **plain React (Vite) + Node/Express +
> MongoDB** দিয়েও করা যায়। কিন্তু Next.js এ frontend+backend একসাথে থাকায় deployment ও কোড
> ম্যানেজমেন্ট সহজ হবে — তাই এটাই recommend করছি।

---

## 📌 অংশ ৫: ডেটাবেজ স্কিমা (High-level)

```
User (id, name, email, passwordHash, group, targetYear, xp, level, streakCount, lastActiveDate, role)
Subject (id, name, group[], code)
Chapter (id, subjectId, name, order)
Topic (id, chapterId, name, order, importance, videoUrl, notesMarkdown)
Question (id, topicId, type[MCQ/CQ], text, options[], correctAnswer, explanation, difficulty, boardYear, boardName)
QuizAttempt (id, userId, quizId, score, timeTaken, answers[], createdAt)
Flashcard (id, userId, deckId, front, back, easeFactor, interval, dueDate, reviewHistory[])
FlashcardDeck (id, userId, subjectId, name)
Task (id, userId, title, dueDate, priority, status, category)
StudySession (id, userId, subjectId, startTime, endTime, type[pomodoro/reading])
Badge (id, name, description, iconUrl, criteria)
UserBadge (id, userId, badgeId, earnedAt)
Notification (id, userId, title, body, read, createdAt)
Bookmark (id, userId, topicId)
Note (id, userId, topicId, content, createdAt, updatedAt)
```

---

## 📌 অংশ ৬: প্রস্তাবিত ফোল্ডার স্ট্রাকচার (Next.js প্রজেক্ট)

```
hsc-ultimate/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── learn/[subject]/[chapter]/[topic]/
│   │   ├── practice/[subject]/
│   │   ├── flashcards/
│   │   ├── planner/
│   │   ├── analytics/
│   │   ├── ai-tutor/
│   │   └── profile/
│   ├── admin/
│   │   ├── subjects/
│   │   ├── questions/
│   │   └── users/
│   ├── api/
│   │   ├── auth/
│   │   ├── questions/
│   │   ├── flashcards/
│   │   ├── ai-chat/
│   │   └── analytics/
│   ├── layout.tsx
│   └── page.tsx (landing page)
├── components/
│   ├── ui/ (shadcn components)
│   ├── learn/
│   ├── planner/
│   ├── gamification/
│   └── shared/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── spaced-repetition.ts (SM-2 algorithm)
│   ├── ai-provider.ts (Groq→Mistral→Cerebras→OpenRouter fallback logic)
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
├── styles/
├── .env.local
├── next.config.js
├── package.json
└── README.md
```

---

## 📌 অংশ ৭: ধাপে ধাপে বিল্ড রোডম্যাপ (Development Phases)

### Phase 0 — Setup (Day 1) ✅ সম্পন্ন
- ✅ Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui প্রজেক্ট ইনিশিয়ালাইজ করা হয়েছে
- ✅ Prisma ORM সেটআপ + সম্পূর্ণ Science-Group ভিত্তিক ডেটাবেজ স্কিমা লেখা হয়েছে
- ✅ Multi-AI Provider সিস্টেম (Groq→Mistral→Cerebras→OpenRouter) বাস্তবায়ন ও লাইভ টেস্ট
- ✅ SM-2 Spaced Repetition অ্যালগরিদম লেখা হয়েছে
- ✅ **লাইভ ডেমো:** AI Doubt Solver চ্যাট পেজ (`/ai-tutor`) কাজ করছে (আসল Groq API দিয়ে)
- ✅ ল্যান্ডিং পেজ, README.md — সব রেডি, `hsc-ultimate/` ফোল্ডারে
- 📦 প্রজেক্ট রয়েছে সরাসরি workspace এ (`hsc-ultimate/` ফোল্ডার) — পুরো SaaS সম্পূর্ণ হলে
  একবারে পুরো workspace ডাউনলোড করা হবে (আলাদা zip বানানো হচ্ছে না)

> এখনো বাকি: Git repo/GitHub push (ঐচ্ছিক), dark/light theme toggle UI (পরের ফেজে)

### Phase 1 — Auth & Onboarding (Day 2-3) ✅ সম্পন্ন
- ✅ প্রথমে SQLite দিয়ে শুরু হয়েছিল, পরে **আসল Supabase PostgreSQL ডাটাবেজে migrate**
  করা হয়েছে (ইউজার নিজেই Supabase প্রজেক্ট বানিয়ে দিয়েছেন)
- ✅ Pooled connection (PgBouncer, port 6543) app runtime এর জন্য + Session-mode
  pooler connection (port 5432) migration এর জন্য — যেহেতু direct connection
  (5432, `db.xxx.supabase.co`) IPv6-only এবং sandbox এ unreachable ছিল
- ✅ সব ১৮টা টেবিল সফলভাবে Supabase এ তৈরি হয়েছে (`npx prisma migrate dev`)
- ✅ NextAuth v5 (Credentials Provider) — Email/Password login সেটআপ
- ✅ Register API (`/api/auth/register`) — bcrypt দিয়ে পাসওয়ার্ড হ্যাশ করা হয়
- ✅ Login পেজ (`/login`) ও Register পেজ (`/register`) — লাইভ টেস্ট করা হয়েছে
- ✅ Onboarding পেজ (`/onboarding`) — HSC ব্যাচ ও বোর্ড সিলেকশন
- ✅ Dashboard পেজ (`/dashboard`) — Server component, ইউজারের real ডেটা (XP, streak, level) দেখায়
- ✅ Route Protection (`proxy.ts` middleware) — লগইন ছাড়া `/dashboard` এ ঢোকা যায় না
- ✅ পুরো flow curl দিয়ে end-to-end টেস্ট করা হয়েছে: Register → Login (session cookie) →
  Dashboard access → Onboarding data save — সব সফল

### Phase 2 — Core Learning Hub (Day 4-7) ✅ সম্পন্ন
- ✅ NCTB সিলেবাস অনুযায়ী real ডেটা সিড করা হয়েছে (`prisma/seed.ts`):
  ১৩টা Subject (Physics/Chemistry/Biology/HigherMath ১ম+২য় পত্র, Bangla, English, ICT),
  ৮৯টা Chapter, ১৮৫টা Topic — সব Supabase এ আছে
- ✅ Learning Hub পেজ (`/learn`) — সব সাবজেক্ট কার্ড + প্রতি সাবজেক্টের progress %
- ✅ Subject Detail পেজ (`/learn/[subjectId]`) — চ্যাপ্টার-ভিত্তিক টপিক লিস্ট,
  গুরুত্বপূর্ণ টপিক (⭐) হাইলাইট, mastery status badge
- ✅ Topic Detail পেজ (`/learn/[subjectId]/[topicId]`) — ভিডিও/নোট প্লেসহোল্ডার,
  AI Tutor শর্টকাট, Mastery status বাটন (শিখছি/অনুশীলন করছি/আয়ত্ত হয়েছে)
- ✅ Topic Progress API (`/api/topics/[topicId]/progress`) — status আপডেট + XP reward hook
  (একটা টপিক Mastered করলে +20 XP অটোমেটিক যোগ হয় — Gamification এর প্রথম অংশ)
- ✅ পুরো flow end-to-end টেস্ট করা হয়েছে real Supabase ডেটা দিয়ে (curl + direct DB query
  verification): Learn Hub → Subject → Topic → Mark as Mastered → XP +20 → Progress bar আপডেট

### Phase 3 — Practice Engine (Day 8-11) ✅ সম্পন্ন
- ✅ Question Bank সিড (`prisma/seed-questions.ts`) — ১১টা গুরুত্বপূর্ণ টপিকে ৩২টা বাস্তব
  MCQ প্রশ্ন (সঠিক ব্যাখ্যা সহ), Physics/Chemistry/Biology/Higher Math থেকে
- ✅ Practice Hub পেজ (`/practice`) — সাবজেক্ট অনুযায়ী প্রশ্ন সংখ্যা দেখায়
- ✅ Chapter Selection পেজ (`/practice/[subjectId]`) — চ্যাপ্টার-ভিত্তিক প্রশ্ন সংখ্যা
- ✅ Quiz Runner (Client Component) — এক এক করে প্রশ্ন দেখানো, উত্তর সিলেকশন, প্রগ্রেস বার
- ✅ Practice Start API (`/api/practice/start`) — নিরাপত্তার জন্য সঠিক উত্তর/ব্যাখ্যা
  ছাড়া প্রশ্ন পাঠায় (client-side cheating আটকাতে)
- ✅ Practice Submit API (`/api/practice/submit`) — সার্ভার-সাইডে answer validation,
  score হিসাব, QuizAttempt+Answers nested-write দিয়ে সেভ, XP reward (+5/সঠিক উত্তর)
- ✅ Result পেজ (`/practice/result/[attemptId]`) — score, percentage, XP badge,
  প্রতিটা প্রশ্নের ব্যাখ্যাসহ রিভিউ (ভুল উত্তরে সঠিক উত্তর হাইলাইট)
- ✅ End-to-end টেস্ট: Register → Login → Practice Hub → Chapter → Quiz(4 প্রশ্ন) →
  Submit(2 সঠিক) → Score 2/4, +10 XP, DB তে verify করা হয়েছে

### Phase 4 — Flashcards (Day 12-14) ✅ সম্পন্ন
- ✅ Deck CRUD API (`/api/flashcard-decks`) — তৈরি, লিস্ট (due count সহ), ডিলিট
- ✅ Flashcards Hub পেজ (`/flashcards`) — সব ডেক, due badge (🔥 কতগুলো আজ রিভিউ করার মতো)
- ✅ Deck Detail পেজ — কার্ড লিস্ট, ম্যানুয়াল কার্ড যোগ, ডিলিট
- ✅ **AI Flashcard Generation** (`/api/flashcard-decks/generate-ai`) — নোট পেস্ট করলে
  Groq/Mistral/Cerebras multi-provider দিয়ে ৫-৮টা প্রাসঙ্গিক ফ্ল্যাশকার্ড অটো তৈরি হয়
- ✅ Review Runner (Client Component) — Framer Motion দিয়ে flip-card animation,
  Again/Hard/Good/Easy রেটিং বাটন (Anki স্টাইল)
- ✅ Review API (`/api/flashcards/[cardId]/review`) — SM-2 অ্যালগরিদম দিয়ে পরের
  due date হিসাব, XP reward (+2/রিভিউ)
- ✅ End-to-end টেস্ট: Deck তৈরি → Manual card যোগ → AI দিয়ে সালোকসংশ্লেষণ নোট থেকে
  ৭টা ফ্ল্যাশকার্ড জেনারেট (Groq) → "easy" রেটিং দিয়ে রিভিউ → easeFactor 2.5→2.6,
  interval 0→1 দিন, +2 XP — SM-2 ফর্মুলা সঠিকভাবে কাজ করেছে তা DB তে ভেরিফাই করা হয়েছে

### Phase 5 — Planner (Day 15-18) ✅ সম্পন্ন
- ✅ Exam Countdown কার্ড — hscBatch থেকে auto-estimate (HSC ২০২৬ এর প্রকৃত রুটিন
  রিসার্চ করে ১ জুলাই বেসলাইন ধরা হয়েছে), ইউজার নিজের বোর্ডের আসল তারিখ দিয়ে
  override করতে পারে (`User.examDate` ফিল্ড যোগ করে migration করা হয়েছে)
- ✅ Task Manager — CRUD, priority (LOW/MEDIUM/HIGH), due date, status toggle
  (TODO/DONE), টাস্ক সম্পন্ন করলে +5 XP reward
- ✅ Pomodoro Timer — ২৫ মিনিট ফোকাস + ৫ মিনিট ব্রেক সাইকেল, circular progress UI,
  সেশন শেষ হলে backend এ লগ হয় ও পূর্ণ সেশনে (≥1500 সেকেন্ড) +15 XP পুরস্কার
- ✅ Study Session API — শুধু সম্পূর্ণ পোমোডোরো সেশনে XP দেয়, আধাখেঁচড়া সেশনে না
  (XP farming আটকাতে)
- ✅ End-to-end টেস্ট: Task তৈরি→সম্পন্ন (+5 XP), পূর্ণ Pomodoro সেশন (+15 XP),
  অসম্পূর্ণ সেশন (0 XP), Exam date override → countdown "৭৪২ দিন বাকি" সঠিকভাবে
  দেখিয়েছে — সব DB তে ভেরিফাই করা হয়েছে
- ✅ **[ফিক্স করা হয়েছে, দেখুন নিচের "Task XP Farming বাগ ফিক্স" সেকশন]**
  আগে এখানে জানা সীমাবদ্ধতা ছিল: Task TODO↔DONE বার বার toggle করলে
  প্রতিবার XP পাওয়া যেত — এই সেশনে `Task.xpAwarded` ফ্ল্যাগ দিয়ে
  সম্পূর্ণভাবে ফিক্স করা হয়েছে

### Phase 6 — Gamification (Day 19-21) ✅ সম্পন্ন
- ✅ Level System (`lib/gamification.ts`) — XP থেকে ক্রমবর্ধমান difficulty ফর্মুলা দিয়ে
  Level হিসাব (level² × 50), Dashboard এ progress bar সহ
- ✅ Daily Streak (`lib/streak.ts`) — গতকাল active ছিল কিনা চেক করে +1, ফাঁক পড়লে
  রিসেট, দিনে একবারই count হয় (duplicate-safe)
- ✅ Badge System — ১৪টা badge সিড করা হয়েছে (`prisma/seed-badges.ts`): streak
  milestones, topic mastery, quiz score, flashcard review, task completion,
  pomodoro session, level milestones
- ✅ `checkAndAwardBadges()` — কেন্দ্রীভূত ফাংশন যেটা সব XP-arning API তে হুক করা
  আছে (practice submit, flashcard review, topic mastery, task complete, pomodoro)
- ✅ Badges পেজ (`/badges`) — অর্জিত/অনর্জিত ব্যাজ আলাদাভাবে দেখায় (grayscale + lock icon)
- ✅ Leaderboard পেজ (`/leaderboard`) — XP অনুযায়ী গ্লোবাল র‍্যাংকিং, নিজের অবস্থান হাইলাইট
- ✅ GamificationSync — Dashboard লোড হলে অদৃশ্যভাবে streak/level/badge সিঙ্ক করে,
  toast notification দিয়ে নতুন badge জানায়
- ✅ End-to-end টেস্ট: Register করেই **FIRST_STEP** badge পাওয়া গেছে, streak শুরু
  হয়েছে (1 দিন), Physics চ্যাপ্টারে ৪/৪ পারফেক্ট স্কোর করায় একসাথে **FIRST_QUIZ** ও
  **PERFECT_SCORE** — দুটো badge award হয়েছে। Level formula ভেরিফাই করা হয়েছে
  (XP 20→Level 1, XP 50→Level 2, XP 200→Level 3)

### Phase 7 — AI Tutor Enhancement (Day 22-24) ✅ সম্পন্ন
- ✅ Chat History persistence — `ChatMessage` মডেলে সব কথোপকথন DB তে সেভ হয়,
  রিফ্রেশ/লগআউট করলেও হারায় না, GET `/api/ai-chat` দিয়ে লোড হয়
- ✅ Conversation Context Memory — পুরনো মেসেজ history AI কে context হিসেবে
  পাঠানো হয়, তাই "এটার একটা উদাহরণ দাও" জাতীয় follow-up প্রশ্ন বুঝতে পারে
- ✅ Vision/Image সমাধান — ছবি আপলোড করলে Mistral Pixtral (vision-capable মডেল)
  দিয়ে ছবি পড়ে ধাপে ধাপে সমাধান দেয় (`getVisionResponse()`, আলাদা fallback chain:
  Mistral Pixtral → OpenRouter Gemini Vision)
- ✅ `/ai-tutor` রুট এখন protected (লগইন লাগবে, chat history persist করার জন্য)
- ✅ Delete History বাটন — DELETE `/api/ai-chat` দিয়ে পুরো কথোপকথন মুছে ফেলা যায়
- ✅ End-to-end টেস্ট: "নিউটনের ২য় সূত্র কী?" → সঠিক উত্তর (Groq) → "এটার একটা উদাহরণ
  দাও" → AI সঠিকভাবে context বুঝে F=ma দিয়ে উদাহরণ দিয়েছে → ছবিতে "2x+5=15" সমীকরণ
  পাঠিয়ে Vision AI (Mistral) থেকে ধাপে ধাপে সঠিক সমাধান (x=5) পাওয়া গেছে →
  History তে ৬টা মেসেজ সঠিকভাবে persist হয়েছে (ছবি সহ) → Delete করে 0 তে নামানো
  গেছে — সব DB তে ভেরিফাই করা হয়েছে

### Phase 8 — Analytics Dashboard (Day 25-26) ✅ সম্পন্ন
- ✅ `lib/analytics.ts` — কেন্দ্রীভূত aggregation logic: subject performance,
  progress over time (১৪ দিন), time distribution, weak topics, overall stats
- ✅ Analytics API (`/api/analytics`) — সব ডেটা একসাথে একটা কলে রিটার্ন করে
- ✅ Analytics Dashboard পেজ (`/analytics`) — Recharts দিয়ে ৩ ধরনের গ্রাফ:
  - Line Chart: গত ১৪ দিনের কুইজ স্কোর ট্রেন্ড
  - Bar Chart: সাবজেক্ট-ভিত্তিক গড় স্কোর (horizontal, subject color-coded)
  - Pie Chart: সাবজেক্ট-ভিত্তিক সময় বন্টন (Pomodoro session থেকে)
- ✅ দুর্বল টপিক ডিটেক্টর — quiz answer accuracy অনুযায়ী sorted, progress bar সহ
- ✅ ৪টা Overall Stat কার্ড — Mastery %, Quiz Accuracy %, Study Hours, Streak
- ✅ Empty state handling — কোনো ডেটা না থাকলে friendly message দেখায়
- ✅ End-to-end টেস্ট: Physics কুইজ (50%) + Biology কুইজ (100%) + দুইটা Pomodoro
  session (Physics 25min, Biology 30min) + ১টা topic mastery দিয়ে যাচাই করা
  হয়েছে — সব সংখ্যা (quizAccuracyPct=71%, totalStudyHours=0.9,
  timeDistribution, weakTopics sorting) নিখুঁতভাবে মিলেছে

### Extra Phase — Admin Panel ✅ সম্পন্ন
- ✅ Role-based Access Control — `User.role` (STUDENT/ADMIN) এখন NextAuth session
  এ propagate হয় (JWT callback আপডেট করা হয়েছে)
- ✅ `/admin/*` route protection — middleware এ role চেক (non-admin হলে
  `/dashboard` এ redirect), সব admin API তে `requireAdmin()` guard
- ✅ `pnpm make-admin <email>` CLI script — যেকোনো ইউজারকে প্রথমবার ADMIN বানানোর
  জন্য (UI দিয়ে করা যায় না কারণ প্রথম admin কে কেউ বানাবে না)
- ✅ Admin Dashboard — সামগ্রিক পরিসংখ্যান (users/subjects/chapters/topics/
  questions/quiz attempts), সাম্প্রতিক ইউজার লিস্ট
- ✅ Subject/Chapter/Topic CRUD UI — nested navigation (Subject → Chapter → Topic
  → Question), প্রতিটা লেভেলে তৈরি/ডিলিট, cascade delete
- ✅ Question Bank Management — single question form + **CSV Bulk Upload**
  (custom CSV parser যেটা quoted field এ কমা handle করে)
- ✅ User Management — role toggle (STUDENT↔ADMIN), নিজের role নিজে পরিবর্তন
  করা আটকানো (accidental self-lockout প্রতিরোধ), password hash কখনো API
  response এ leak হয় না (`select` দিয়ে explicit field picking)
- ✅ End-to-end টেস্ট: non-admin ইউজার `/admin` এ ঢুকতে চেষ্টা করলে 307/403,
  `make-admin` দিয়ে admin বানিয়ে পুরো CRUD chain (Subject→Chapter→Topic→
  Question) টেস্ট করা হয়েছে, CSV bulk upload এ কমা-সহ ৩টা প্রশ্ন সঠিকভাবে parse
  হয়েছে, Subject delete করলে cascade এ chapter/topic/question সব মুছে গেছে —
  সব DB তে ভেরিফাই করা হয়েছে

### Extra Phase — CQ (সৃজনশীল প্রশ্ন) Practice ✅ সম্পন্ন
- ✅ নতুন `CQQuestion` ও `CQAttempt` মডেল — বোর্ড স্টাইল উদ্দীপক + ৪ ধাপ (ক/খ/গ/ঘ)
  এবং প্রতিটার জন্য model answer সংরক্ষণ করার সুযোগ
- ✅ `prisma/seed-cq.ts` — ৩টা বাস্তবসম্মত CQ প্রশ্ন সিড (Physics: নিউটনের সূত্র,
  Biology: সালোকসংশ্লেষণ, Chemistry: মোল ধারণা) — প্রতিটাতে সম্পূর্ণ model answer সহ
- ✅ `lib/cq-evaluator.ts` — AI দিয়ে answer মূল্যায়নের কেন্দ্রীয় লজিক, বোর্ড মার্কিং
  স্কিম অনুযায়ী প্রম্পট ডিজাইন (ক=১, খ=২, গ=৩, ঘ=৪, মোট ১০), JSON structured output,
  স্কোর ক্ল্যাম্পিং (AI ভুল করলেও সীমার বাইরে যেতে না পারে)
- ✅ CQ Practice Hub → Subject → Chapter → CQ Runner (client component, ৪টা
  Textarea দিয়ে ক/খ/গ/ঘ উত্তর লেখা) → AI Evaluation → Result পেজ (স্কোর ব্রেকডাউন,
  AI ফিডব্যাক, প্রতিটা অংশে student answer vs model answer পাশাপাশি তুলনা)
- ✅ XP reward system — প্রাপ্ত নম্বরের ৩ গুণ XP (সর্বোচ্চ ১০ নম্বরে ৩০ XP)
- ✅ End-to-end টেস্ট: দুর্বল উত্তর (আংশিক + খালি উত্তর) জমা দিয়ে **2/10** স্কোর ও
  যথাযথ গঠনমূলক ফিডব্যাক পাওয়া গেছে, তারপর প্রায়-পারফেক্ট উত্তর জমা দিয়ে **10/10**
  পূর্ণ স্কোর পাওয়া গেছে — AI মূল্যায়ন প্রতিটা অংশে সঠিকভাবে partial credit ও পূর্ণ
  credit দিতে পেরেছে তা যাচাই করা হয়েছে, XP হিসাব (6+30=36) DB তে মিলেছে

### Extra Phase — Community/Discussion Forum ✅ সম্পন্ন
- ✅ নতুন মডেল: `ForumPost`, `ForumReply`, `ForumVote` (Stack Overflow/Reddit স্টাইল
  প্রশ্নোত্তর সিস্টেম) — Post এর ৪টা ক্যাটাগরি (QUESTION/DISCUSSION/NOTE_SHARE/
  ANNOUNCEMENT), ঐচ্ছিক subjectCode ফিল্টার
- ✅ Forum Hub — ক্যাটাগরি ফিল্টার, প্রতিটা পোস্টে vote score/reply count/view count
- ✅ Post তৈরি + Reply + Upvote/Downvote (toggle করলে ভোট মুছে যায়) — সব XP-rewarded
  (post +3, reply +5, best answer পেলে +10)
- ✅ Best Answer System — শুধু পোস্টের মালিক reply কে "সেরা উত্তর" মার্ক করতে পারবে,
  করলে পোস্ট স্বয়ংক্রিয়ভাবে "সমাধান হয়েছে" মার্ক হয়ে যায় এবং উত্তরদাতা বোনাস XP পায়
- ✅ Authorization — শুধু পোস্টের মালিক (বা Admin) পোস্ট ডিলিট/resolve করতে পারবে,
  অন্য কেউ চেষ্টা করলে 403 Forbidden
- ✅ End-to-end টেস্ট (দুইজন আলাদা ইউজার দিয়ে বাস্তব সিমুলেশন): Asker একটা Physics
  প্রশ্ন পোস্ট করলো → Helper উত্তর দিলো (+5 XP) → Asker upvote দিলো → Asker সেরা
  উত্তর মার্ক করলো (+10 XP বোনাস, পোস্ট auto-resolved) → Helper এর মোট XP=15,
  Asker এর XP=3 — সব DB তে মিলেছে। Vote toggle (একই vote আবার দিলে মুছে যাওয়া),
  এবং non-owner এর delete/resolve চেষ্টায় 403 — দুটোই ভেরিফাই করা হয়েছে

### Extra Phase — Profile/Settings + Dark Mode + Forgot Password ✅ সম্পন্ন
- ✅ **Dark Mode**: `next-themes` দিয়ে Light/Dark/System থিম সাপোর্ট। `app/providers.tsx`
  এ `ThemeProvider` (attribute="class", defaultTheme="system", enableSystem) যোগ করা
  হয়েছে, `app/layout.tsx` এর `<html>` এ `suppressHydrationWarning` দেওয়া হয়েছে (FOUC/
  hydration mismatch এড়াতে)। CSS variable ভিত্তিক dark mode আগে থেকেই `globals.css`
  এ ছিল (`.dark { ... }`), শুধু provider লাগানো বাকি ছিল। `components/theme-toggle.tsx`
  — Sun/Moon আইকন টগল বাটন, mounted state দিয়ে hydration-safe করা হয়েছে
- ✅ **Shared User Menu**: `components/layout/user-menu.tsx` — Avatar এ ক্লিক করলে
  Dropdown এ প্রোফাইল/সেটিংস লিংক, Admin হলে Admin Panel লিংক, ও লগআউট। Dashboard
  header এ আগের ইনলাইন signOut form ও Admin বাটন সরিয়ে এই কম্পোনেন্ট + `ThemeToggle`
  বসানো হয়েছে
- ✅ **Settings পেজ** (`/settings`, প্রোটেক্টেড রুট): তিনটা ট্যাব —
  - **প্রোফাইল ট্যাব**: নাম এডিট, বোর্ড পরিবর্তন (button-grid, onboarding পেজের মতো
    ডিজাইন), HSC ব্যাচ পরিবর্তন — `PATCH /api/user/profile` (explicit `select` দিয়ে
    passwordHash leak প্রতিরোধ, আগের admin bug থেকে শেখা lesson অনুসরণ করা হয়েছে)
  - **পাসওয়ার্ড ট্যাব**: বর্তমান পাসওয়ার্ড ভেরিফাই করে নতুন পাসওয়ার্ড সেট —
    `POST /api/user/change-password` (bcrypt compare, ভুল current password হলে 400)
  - **থিম ট্যাব**: `ThemeToggle` এখানেও রাখা হয়েছে সুবিধার জন্য
- ✅ **Forgot Password ফ্লো** (Resend.com API দিয়ে, ব্যবহারকারীর নিজের ফ্রি অ্যাকাউন্ট):
  - নতুন Prisma model: `PasswordResetToken` (email, token — unique random 64-hex-char,
    expiresAt — ১ ঘণ্টা, usedAt — একবার ব্যবহারযোগ্য)
  - `lib/email.ts` — Resend SDK wrapper, `RESEND_API_KEY` env var থেকে নেওয়া, ফ্রম
    অ্যাড্রেস `onboarding@resend.dev` (Resend এর built-in টেস্টিং ডোমেইন, নিজের ডোমেইন
    ভেরিফাই না করা পর্যন্ত শুধু নিজের রেজিস্টার্ড ইমেইলেই পাঠানো যায়)
  - `POST /api/auth/forgot-password` — ইমেইল existence যাচাই না করেই সবসময় একই
    সাফল্য বার্তা রিটার্ন করে (user enumeration attack প্রতিরোধ), পুরনো unused token
    গুলো invalidate করে নতুন token বানায়
  - `POST /api/auth/reset-password` — token verify (exists/not used/not expired),
    `prisma.$transaction` দিয়ে atomic ভাবে password update + token mark-as-used
  - `/forgot-password` ও `/reset-password` পেজ (পাবলিক রুট, middleware এ প্রোটেক্ট করা
    হয়নি) — Login পেজে "পাসওয়ার্ড ভুলে গেছো?" লিংক যোগ করা হয়েছে
- ✅ Prisma migration: `20260705071123_add_password_reset_token` (db push +
  migrate resolve দিয়ে migration history সিঙ্ক রাখা হয়েছে, আগের pattern অনুসরণ করে)
- ✅ **End-to-end টেস্ট** (আসল Resend API দিয়ে, বাস্তব ইমেইলে):
  - Register → Login → Profile Update (নাম/বোর্ড/ব্যাচ পরিবর্তন) → DB তে ভেরিফাই ✅
  - Change Password: ভুল current password → 400 error; সঠিক current password →
    200 success → নতুন পাসওয়ার্ড দিয়ে লগইন সফল ✅
  - Forgot Password: `abn21.noman@gmail.com` (Resend এ ভেরিফাই করা ইমেইল) এ আসল
    ইমেইল পাঠানো হয়েছে (Resend API থেকে `{"id": "..."}` রেসপন্স কনফার্ম করা হয়েছে),
    DB তে token তৈরি হয়েছে তা যাচাই করা হয়েছে
  - Reset Password: ছোট পাসওয়ার্ড (< ৬ অক্ষর) → 400 reject; সঠিক পাসওয়ার্ড → 200
    success → নতুন পাসওয়ার্ড দিয়ে লগইন সফল; **same token আবার ব্যবহার করলে** → 400
    "ইতিমধ্যে ব্যবহৃত হয়ে গেছে"; **ভুল/অস্তিত্বহীন token** → 400 "সঠিক না" — সব case
    ভেরিফাই করা হয়েছে
  - Middleware protection: `/settings` unauthenticated অবস্থায় `/login` এ redirect
    (307) হয় ✅, `/forgot-password` পাবলিকলি অ্যাক্সেসযোগ্য (200) ✅
  - `pnpm build` (clean, সব নতুন রুট `/settings`, `/forgot-password`,
    `/reset-password`, `/api/auth/forgot-password`, `/api/auth/reset-password`,
    `/api/user/profile`, `/api/user/change-password` build output এ দেখা গেছে) ও
    `pnpm lint` (০ error/warning) — দুটোই ক্লিন
  - টেস্ট শেষে সব টেস্ট ইউজার ও password reset token DB থেকে মুছে ফেলা হয়েছে

> ⚠️ **Production নোট**: Resend এর ফ্রি tier এ নিজের ডোমেইন ভেরিফাই না করা পর্যন্ত
> শুধু নিজের Resend অ্যাকাউন্টের ইমেইলেই পাঠানো যাবে। Deploy করার সময় Resend এ একটা
> ডোমেইন (subdomain হলেও চলবে) ভেরিফাই করে `lib/email.ts` এর `FROM_ADDRESS` আপডেট
> করতে হবে, নাহলে অন্য কোনো ইউজারের ইমেইলে reset link যাবে না।

### Extra Phase — Bookmark + Note + Notification System ✅ সম্পন্ন
- ✅ **Bookmark (সেভ করা টপিক)**: আগে থেকেই DB তে থাকা `Bookmark` মডেল প্রথমবারের মতো
  UI/API এ যুক্ত করা হলো। `POST/GET /api/bookmarks`, `GET/DELETE /api/bookmarks/[topicId]`
  — `upsert` ব্যবহার করে duplicate bookmark করলে error না দিয়ে existing রেকর্ড রিটার্ন
  করে। Topic Detail পেজে `BookmarkButton` (client, toggle করলে সাথে সাথে UI বদলায়),
  নতুন `/saved` পেজে সব সেভ করা টপিক এক জায়গায় (subject/chapter breadcrumb সহ),
  Dashboard এ shortcut card যোগ করা হয়েছে
- ✅ **Note (টপিক-ভিত্তিক ব্যক্তিগত নোট)**: `Note` মডেলে `@@unique([userId, topicId])`
  constraint যোগ করা হয়েছে (একটা টপিকে একজন ইউজারের একটাই নোট থাকবে) যাতে upsert
  পরিষ্কারভাবে কাজ করে। `GET/PUT/DELETE /api/notes/[topicId]` — PUT upsert করে
  (create/update দুটোই handle করে)। Topic Detail পেজে `TopicNoteEditor` (client,
  Textarea + "নোট সেভ করো" বাটন, পরিবর্তন না থাকলে বাটন disabled)
- ✅ **Notification System**: `Notification` মডেলে নতুন `link` ফিল্ড (ক্লিক করলে কোথায়
  যাবে) ও `@@index([userId, read])` যোগ করা হয়েছে। কেন্দ্রীভূত হেল্পার
  `lib/notifications.ts` এর `createNotification()` — silent fail করে যাতে notification
  ব্যর্থ হলেও মূল অ্যাকশন (badge award, forum reply ইত্যাদি) থেমে না যায়। API:
  `GET /api/notifications` (সাম্প্রতিক ৩০টা + unreadCount), `PATCH/DELETE
  /api/notifications/[notificationId]` (owner-only, cross-user access এ 404),
  `POST /api/notifications/read-all`। `components/layout/notification-bell.tsx` —
  Bell আইকনে unread count badge, ৩০ সেকেন্ড পোলিং, DropdownMenu এ ক্লিক করলে
  পুরো লিস্ট লোড হয়, ক্লিক করলে read মার্ক + link এ নেভিগেট, প্রতিটা আইটেমে delete বাটন
- ✅ **তিনটা জায়গায় Notification হুক করা হয়েছে**:
  - Badge award হলে (`lib/gamification.ts` এর `checkAndAwardBadges()`) — প্রতিটা নতুন
    badge এ একটা notification (`link: "/badges"`)
  - Forum এ কেউ রিপ্লাই দিলে পোস্টের মালিককে notification (`link: "/forum/[postId]"`,
    নিজের পোস্টে নিজে রিপ্লাই দিলে notification যায় না)
  - Best Answer নির্বাচিত হলে reply-এর মালিককে notification (+10 XP বোনাস উল্লেখসহ)
- ✅ **End-to-end টেস্ট** (দুইজন ইউজার দিয়ে বাস্তব সিমুলেশন):
  - Bookmark: status check (false→true→duplicate upsert→list with nested
    topic/chapter/subject→delete→false) — সব ধাপ ভেরিফাই করা হয়েছে
  - Note: GET (null)→PUT create→PUT update (upsert, same id, content বদলায়)→GET→
    DELETE→GET (null) — সব ঠিক
  - Notification: Topic mastered করে ২টা badge (FIRST_STEP + FIRST_TOPIC_MASTERED)
    award হওয়ায় ২টা notification স্বය়ংক্রিয়ভাবে তৈরি হয়েছে তা ভেরিফাই করা হয়েছে
  - Forum reply notification: User2 → User1-এর পোস্টে রিপ্লাই দিলে User1 এর কাছে
    notification এসেছে (সঠিক link সহ) — ভেরিফাই করা হয়েছে
  - Best Answer notification: User1 → User2 এর রিপ্লাই সেরা উত্তর মার্ক করলে User2
    এর কাছে বোনাস XP notification এসেছে — ভেরিফাই করা হয়েছে
  - Mark-as-read/read-all/delete: unread count সঠিকভাবে কমেছে (2→1→0), delete করলে
    লিস্ট থেকে বাদ গেছে
  - **Authorization**: User2, User1 এর notification PATCH/DELETE করার চেষ্টা করলে
    404 (owner check ছাড়া অন্য কারো notification touch করা যায় না) — ভেরিফাই করা
    হয়েছে, এবং User1 এর notification অক্ষত থেকেছে তাও কনফার্ম করা হয়েছে
  - Middleware protection: `/saved` unauthenticated অবস্থায় `/login` এ redirect (307)
  - `pnpm build` (সব নতুন রুট `/saved`, `/api/bookmarks`, `/api/bookmarks/[topicId]`,
    `/api/notes/[topicId]`, `/api/notifications`, `/api/notifications/[notificationId]`,
    `/api/notifications/read-all` build output এ দেখা গেছে) ও `pnpm lint` (০ error/
    warning) — দুটোই ক্লিন
  - টেস্ট শেষে সব টেস্ট ইউজার (cascade delete এ bookmarks/notes/notifications/forum
    posts সহ) DB থেকে মুছে ফেলা হয়েছে, সিলেবাস কন্টেন্ট ডেটা (13 subjects, 185 topics,
    14 badges) অক্ষত আছে তা ভেরিফাই করা হয়েছে

### Extra Phase — Full Mock Exam + Predicted GPA ✅ সম্পন্ন
- ✅ **Deep Research সম্পন্ন** (web_search দিয়ে, ২০২৬ সালের প্রকৃত তথ্য verify করে):
  - HSC পরীক্ষার ফরম্যাট: Physics/Chemistry/Biology/Higher Math প্রতি পত্রে
    MCQ ২৫টি (২৫ মিনিট, ২৫ নম্বর) + CQ ৮টি থেকে ৫টি উত্তর (প্রতিটি ১০ নম্বর
    = ৫০ নম্বর) + Practical ২৫ নম্বর = মোট ১০০ নম্বর — একাধিক সূত্র থেকে
    ক্রস-ভেরিফাই করা হয়েছে
  - GPA Grading Scale (Bangladesh Education Board, অফিসিয়াল): A+ (80-100,
    5.00), A (70-79, 4.00), A- (60-69, 3.50), B (50-59, 3.00), C (40-49,
    2.00), D (33-39, 1.00), F (0-32, 0.00)
  - GPA ফর্মুলা: ৬টি মূল বিষয় (Bangla+English+ICT+Physics+Chemistry+Biology)
    এর গ্রেড পয়েন্ট যোগফল + ৪র্থ/ঐচ্ছিক বিষয় (Higher Math) থেকে "GPA-2 rule"
    বোনাস (গ্রেড পয়েন্ট থেকে ২ বিয়োগ, নূন্যতম ০, ঋণাত্মক হলে বোনাস শূন্য),
    সব ৬ দিয়ে ভাগ করে চূড়ান্ত GPA — একাধিক independent সূত্র (calculator
    সাইট, GPA guide) থেকে একই ফর্মুলা confirm করা হয়েছে
- ✅ **Question Bank সম্প্রসারণ** (`prisma/seed-questions-2.ts`, `db:seed-questions-2`):
  Physics/Chemistry/Biology/Higher Math এর ৪৪টা টপিকে বাস্তব বোর্ড-স্টাইল
  ৯৪টা নতুন MCQ প্রশ্ন (বিভিন্ন প্রশ্নব্যাংক/গাইড থেকে গবেষণা করে verified)
  যোগ করা হয়েছে, প্রতিটা বিষয়ে Mock Exam চালানোর জন্য যথেষ্ট প্রশ্ন পুল
  নিশ্চিত করা হয়েছে (১০-৩৩টা প্রতি বিষয়ে, আগে কিছু বিষয়ে ছিল ০)
- ✅ **CQ Bank সম্প্রসারণ** (`prisma/seed-cq-2.ts`, `db:seed-cq-2`): Physics
  2nd, Chemistry 1st, Biology 2nd, Higher Math 1st ও 2nd — এই ৫টা বিষয়ে
  (আগে CQ ছিল না) বাস্তব বোর্ড-স্টাইল CQ (উদ্দীপক + ক/খ/গ/ঘ + মডেল উত্তর)
  যোগ করা হয়েছে, এখন সব ৮টা বিষয়ে অন্তত ১-২টা CQ আছে
- ✅ **নতুন Prisma model**: `MockExamAttempt` (subjectId, mode: FULL/QUICK,
  mcqQuestionIds/mcqUserAnswers/mcqScore/mcqTotal, cqQuestionIds/cqScore/
  cqTotal, status: IN_PROGRESS/MCQ_DONE/COMPLETED, timeTakenSec)
- ✅ **`lib/mock-exam.ts`**: MOCK_EXAM_CONFIG (FULL: ২৫ MCQ + ৫ CQ, MCQ ২৫ মিনিট
  + CQ আড়াই ঘণ্টা যা বাস্তব বোর্ড সময়; QUICK: ১০ MCQ + ২ CQ, MCQ ১০ মিনিট +
  CQ ৩০ মিনিট), Fisher-Yates shuffle ভিত্তিক `pickRandom()` এলোমেলো প্রশ্ন
  বাছাইয়ের জন্য
- ✅ **Mock Exam ফ্লো**: `/mock-exam` (Subject Hub, MCQ+CQ কাউন্ট দেখায়) →
  `/mock-exam/subject/[subjectId]` (Full Timed vs Quick Practice মোড
  সিলেকশন, প্রশ্ন কম থাকলে "graceful scaling" — যতগুলো আছে ততগুলো দিয়ে
  চলবে, UI তে transparent warning) → `/mock-exam/attempt/[attemptId]`
  (MCQ ফেজ: countdown timer সহ, সময় শেষ হলে auto-submit; CQ ফেজ: countdown
  timer + Textarea ইনপুট, সময় শেষ হলে auto-submit) → `/mock-exam/result/[attemptId]`
  (MCQ রিভিউ সঠিক/ভুল + ব্যাখ্যা, CQ রিভিউ AI ফিডব্যাক + মডেল উত্তর তুলনা)
- ✅ **API নিরাপত্তা**: MCQ চলাকালীন `correctAnswer`/`explanation` ক্লায়েন্টকে
  পাঠানো হয় না (status COMPLETED না হওয়া পর্যন্ত), duplicate submit ব্লক করা
  (status check), owner-only access (userId মিলিয়ে 404)
- ✅ **CQ Evaluation reuse**: Mock Exam এর CQ অংশ existing `lib/cq-evaluator.ts`
  পুনঃব্যবহার করে (আলাদা কোড লেখা হয়নি), sequential AI call (rate limit
  এড়াতে), খালি উত্তরে AI কল স্কিপ করে সরাসরি ০ দেওয়া হয় (খরচ বাঁচাতে)
- ✅ **XP economy**: MCQ প্রতি সঠিক উত্তরে +2 XP, CQ প্রতি নম্বরে +2 XP (normal
  practice এর চেয়ে বেশি, কারণ Mock Exam সম্পূর্ণ করা কঠিন), badge/streak/
  level সিঙ্ক হুক করা হয়েছে, সম্পন্ন হলে Notification পাঠানো হয় (স্কোর সহ)
- ✅ **`lib/gpa.ts`**: `calculateHscGpa()` — বোর্ড নিয়ম অনুযায়ী GPA হিসাব,
  `marksToGrade()` মার্ক থেকে গ্রেড/পয়েন্ট, `getGpaRemark()` বাংলা মন্তব্য
- ✅ **`lib/gpa-predictor.ts`**: `predictSubjectPerformances()` — Practice
  MCQ (weight ১), Mock Exam (weight ৩ — সবচেয়ে বাস্তবসম্মত), CQ Attempt
  (weight ২) থেকে weighted average % বের করে প্রতিটা SubjectCode এর জন্য;
  `getPredictedGpaSummary()` — সব ৬টা মূল বিষয়ে ডেটা না থাকলে GPA null
  রাখে (অসম্পূর্ণ/ভুল প্রেডিকশন এড়াতে), confidence level (high/medium/low/none)
  দেখায় কত ডেটাপয়েন্ট থেকে হিসাব হয়েছে
- ✅ **Predicted GPA UI**: Analytics Dashboard এ নতুন কার্ড — GPA সংখ্যা +
  বাংলা মন্তব্য, প্রতিটা বিষয়ের গ্রেড ব্যাজ, অনুপস্থিত বিষয়ের তালিকা (কোথায়
  আরও প্র্যাকটিস দরকার)
- ✅ **রুট নামকরণ সমস্যা সমাধান**: প্রথমে `/mock-exam/[subjectId]` ও
  `/mock-exam/[attemptId]` একসাথে রাখায় Next.js "Ambiguous route pattern"
  build error দিয়েছিল (দুটো dynamic segment একই level এ distinguish করা
  যায় না) — সমাধান: `/mock-exam/subject/[subjectId]` ও
  `/mock-exam/attempt/[attemptId]` এ আলাদা static segment দিয়ে রুট
  রিস্ট্রাকচার করা হয়েছে
- ✅ **End-to-end টেস্ট** (আসল AI দিয়ে, বাস্তব ডেটা দিয়ে):
  - Mock Exam শুরু (QUICK mode, Physics 1st Paper) — ১০ MCQ + ১ CQ বাছাই
    হয়েছে (২টা CQ চেয়েও পুল এ ১টা থাকায় graceful scaling কাজ করেছে)
  - MCQ লোড করার সময় `correctAnswer` client কে পাঠানো হয়নি (নিরাপত্তা
    ভেরিফাই করা হয়েছে)
  - ৭টা সঠিক + ৩টা ভুল উত্তর সাবমিট করে স্কোর 7/10 সঠিকভাবে হিসাব হয়েছে
  - Duplicate MCQ submit চেষ্টা করলে 400 error ("ইতিমধ্যে জমা হয়ে গেছে")
  - CQ তে প্রায়-পারফেক্ট উত্তর দিয়ে AI evaluation এ 8/10 স্কোর ও যথাযথ
    বাংলা ফিডব্যাক পাওয়া গেছে, totalScore=15/20, XP=30 (7×2+8×2) সঠিক
  - Result API তে completed হওয়ার পর correctAnswer/explanation/modelAnswer
    দেখা গেছে, percentage সঠিক (75%)
  - Predicted GPA: একটা বিষয়ে ডেটা থাকলে gpaResult null (অসম্পূর্ণ বলে) ও
    missingSubjects লিস্ট সঠিক; সব ৬টা মূল বিষয়ে ডেটা ইনজেক্ট করে GPA
    ম্যানুয়ালি ভেরিফাই করা হয়েছে (core sum 21.5 + optional bonus 3 = 24.5,
    ÷6 = 4.08 — API রেসপন্সের সাথে হুবহু মিলেছে)
  - Fail rule টেস্ট: Biology weighted average 25% (F) করলে সামগ্রিক
    gpaResult.gpa=0, isPass=false, remark="একটি বা একাধিক বিষয়ে Fail" —
    সঠিকভাবে কাজ করেছে
  - Middleware protection: `/mock-exam` unauthenticated অবস্থায় `/login`
    এ redirect (307)
  - `pnpm build` (সব নতুন রুট clean, route ambiguity ফিক্স করার পর) ও
    `pnpm lint` (০ error/warning) — দুটোই ক্লিন
  - টেস্ট শেষে সব টেস্ট ইউজার, mock exam attempts, quiz attempts, cq
    attempts cascade delete দিয়ে DB থেকে মুছে ফেলা হয়েছে, সিলেবাস কন্টেন্ট
    ডেটা (13 subjects, 126 MCQ questions, 9 CQ questions) অক্ষত আছে
    ভেরিফাই করা হয়েছে

> ⚠️ **সীমাবদ্ধতা নোট**: Practical অংশ (২৫ নম্বর প্রতি বিজ্ঞান বিষয়ে) অনলাইনে
> সিমুলেট করা সম্ভব না (এটা কলেজ ল্যাবে হয়), তাই Mock Exam এ শুধু থিওরি অংশ
> (MCQ+CQ, ৭৫ নম্বর) কভার করা হয়েছে। Predicted GPA calculator practical marks
> অন্তর্ভুক্ত করে না, শুধু থিওরি পারফরম্যান্স থেকে অনুমান করে — তাই এটা একটা
> নির্দেশক (indicator), প্রকৃত বোর্ড ফলাফলের নিশ্চয়তা না।

### Extra Phase — Auto Study Plan + Class Routine ✅ সম্পন্ন
- ✅ **নতুন Prisma model**: `RoutineSlot` (সাপ্তাহিক ক্লাস রুটিন — dayOfWeek,
  startTime, endTime, subjectCode/label/colorHex, রিকারিং প্রতি সপ্তাহে),
  `StudyPlan` + `StudyPlanItem` (AI জেনারেটেড ৭ দিনের দৈনিক প্ল্যান —
  startDate/endDate/daysUntilExam/aiProvider এবং প্রতিটা আইটেমে date/
  subjectCode/topicName/taskDescription/durationMinutes/priority/isCompleted)
- ✅ **Class Routine** — সাপ্তাহিক ক্লাস/পড়াশোনার রুটিন বানানোর UI, প্রতিটা
  বারে (রবি-শনি) একাধিক স্লট যোগ করা যায় (সাবজেক্ট থেকে auto-fill label+color
  অথবা কাস্টম লেবেল যেমন "কোচিং"/"বিশ্রাম"), Dialog দিয়ে যোগ, bar-ভিত্তিক
  গ্রুপ করে তালিকা আকারে দেখানো, hover করলে delete বাটন
  - API: `GET/POST /api/routine`, `PATCH/DELETE /api/routine/[slotId]`
  - Validation: endTime অবশ্যই startTime এর পরে হতে হবে, owner-only access
- ✅ **Auto Study Plan (AI জেনারেটেড)** — `lib/study-plan-generator.ts` এর
  `generateStudyPlan()`:
  - ইউজারের `getWeakTopics()` (Analytics থেকে) ও `getCountdown()` (exam
    countdown) ডেটা একত্র করে AI কে প্রম্পট পাঠানো হয়
  - AI (Groq primary, fallback chain) পরবর্তী ৭ দিনের জন্য JSON array রিটার্ন
    করে (dayOffset, subjectCode, topicName, taskDescription, durationMinutes,
    priority) — দুর্বল টপিককে HIGH priority দেওয়ার নির্দেশ দেওয়া আছে prompt এ
  - **Input validation ও sanitization**: প্রতিটা AI আইটেমের subjectCode বৈধ
    enum এ আছে কিনা, priority বৈধ কিনা, durationMinutes ক্ল্যাম্প (২৫-৯০ মিনিট)
    — AI ভুল output দিলেও app crash না করে graceful fallback
  - **JSON truncation handling**: বড় ৭ দিনের প্ল্যান অনেক সময় output token
    limit এ কেটে যেতে পারে — regex দিয়ে array ম্যাচের পর `JSON.parse()` fail
    করলে শেষ সম্পূর্ণ object পর্যন্ত কেটে repair করে আবার parse করার চেষ্টা
    করা হয় (truncated JSON থেকেও partial প্ল্যান উদ্ধার করা যায়)
  - Idempotent: নতুন প্ল্যান জেনারেট করলে আগের প্ল্যান মুছে ফেলে (একবারে একটাই
    active প্ল্যান থাকে)
  - API: `GET /api/study-plan` (বর্তমান প্ল্যান লোড), `POST /api/study-plan/generate`
    (নতুন প্ল্যান বানানো), `PATCH /api/study-plan/items/[itemId]` (সম্পূর্ণ/
    অসম্পূর্ণ টগল, +5 XP প্রতি আইটেমে, badge/streak সিঙ্ক)
- ✅ **`lib/ai-provider.ts` উন্নতি**: `getAIResponse()` এ ঐচ্ছিক `maxTokens`
  প্যারামিটার যোগ করা হয়েছে (আগে hardcoded 1024 ছিল, যা বড় ৭ দিনের JSON প্ল্যানে
  truncation ঘটাচ্ছিল) — Study Plan generation এ 3000 token পাঠানো হয়, timeout
  ও ২০→৩০ সেকেন্ড বাড়ানো হয়েছে (বড় রেসপন্সের জন্য), backward-compatible (অন্য
  সব existing callers — CQ evaluator, AI chat — অপরিবর্তিত থাকে, default 1024)
- ✅ **UI**: `components/planner/class-routine.tsx` (Dialog দিয়ে স্লট যোগ,
  বার-ভিত্তিক লিস্ট), `components/planner/study-plan-card.tsx` (দিন অনুযায়ী
  গ্রুপ করা আইটেম, checkbox টগল, "নতুন প্ল্যান বানাও" রিজেনারেট বাটন,
  priority/duration badge) — দুটোই Planner পেজে (Exam Countdown/Pomodoro এর
  নিচে) যোগ করা হয়েছে
- ✅ **End-to-end টেস্ট** (আসল AI দিয়ে, বাস্তব ডেটা দিয়ে):
  - Class Routine: empty state → slot যোগ (Monday, Physics, 16:00-17:30) →
    invalid slot reject (endTime<startTime, 400) → list → update label → delete
    — সব সঠিকভাবে কাজ করেছে
  - Study Plan generation: প্রথমবার চেষ্টায় AI response `max_tokens: 1024`
    এ truncate হয়ে JSON parse fail করেছিল (bug পাওয়া গেছে) — `maxTokens`
    parameter যোগ করে 3000 tokens এ ফিক্স করা হয়েছে এবং JSON repair fallback
    যোগ করা হয়েছে অতিরিক্ত সুরক্ষার জন্য
  - Weak topic ইনজেক্ট করে (Physics এর "নিউটনের গতিসূত্র" এ ৪টির মধ্যে ১টা
    সঠিক উত্তর) Study Plan generate করে ভেরিফাই করা হয়েছে AI সঠিকভাবে এই
    টপিককে ৪ বার HIGH priority দিয়ে প্ল্যানে রেখেছে (মোট ১৪টা আইটেম, সব ৭ দিন
    কভার হয়েছে)
  - Item toggle-complete: XP award (+5) ও badge award (FIRST_STEP, FIRST_QUIZ)
    সঠিকভাবে হয়েছে
  - Regenerate: নতুন প্ল্যান বানালে পুরনো প্ল্যান মুছে গিয়ে DB তে একটাই
    active প্ল্যান থেকেছে (idempotent ভেরিফাই করা হয়েছে)
  - Authorization: User2, User1 এর study plan item টগল করার চেষ্টা করলে 404
  - Middleware protection: `/planner` unauthenticated অবস্থায় `/login` এ
    redirect (307) — আগে থেকেই protected list এ ছিল
  - `pnpm build` (সব নতুন রুট clean) ও `pnpm lint` (০ error/warning) — দুটোই
    ক্লিন
  - টেস্ট শেষে সব টেস্ট ইউজার, routine slots, study plans/items, quiz
    attempts cascade delete দিয়ে DB থেকে মুছে ফেলা হয়েছে, সিলেবাস কন্টেন্ট
    ডেটা (13 subjects, 126 MCQ questions, 9 CQ questions) অক্ষত আছে ভেরিফাই
    করা হয়েছে

> ✅ **[ফিক্স করা হয়েছে]** আগে এখানে known limitation ছিল: Study Plan
> Item toggle এও Task/CQ এর মতো বার বার TODO↔DONE করলে প্রতিবার XP
> পাওয়া যেত (duplicate-farming সম্ভব ছিল, এবং এটা Task এর বাগের চেয়েও
> গুরুতর ছিল কারণ আগের state চেকই করা হতো না) — দেখুন নিচের "Task ও
> Study Plan Item XP Farming বাগ ফিক্স" সেকশন।

### Extra Phase — Global Search + Dark Mode Polish ✅ সম্পন্ন
- ✅ **Dark Mode Polish অডিট**: পুরো codebase (`app/`, `components/`) এ hardcoded
  color class (`bg-white`, `text-black`, `bg-gray-*`, `text-slate-900` ইত্যাদি,
  যেগুলো dark mode এ খারাপ দেখাতে পারতো) খুঁজে দেখা হয়েছে — শুধু
  `exam-countdown-card.tsx` এ পাওয়া গেছে যা ইচ্ছাকৃতভাবে fixed gradient কার্ড
  (থিম নির্বিশেষে সবসময় একই রকম দেখানোর জন্য ডিজাইন করা), বাকি সব জায়গায়
  CSS variable-ভিত্তিক (`bg-background`, `text-foreground`, `dark:` prefix)
  color ব্যবহার হচ্ছে যা আগে থেকেই সঠিক ছিল
- ✅ **Landing Page এ Theme Toggle যোগ করা হলো**: আগে landing page (`app/page.tsx`)
  এ কোনো থিম টগল ছিল না (শুধু Dashboard এ ছিল), এখন nav bar এ লগইন/রেজিস্ট্রেশন
  বাটনের পাশে `ThemeToggle` যোগ করা হয়েছে যাতে লগইন করার আগেও ইউজার dark/light
  মোড বেছে নিতে পারে
- ✅ **Global Search** (`Ctrl/Cmd+K` দিয়ে খোলা যায়) — `components/layout/global-search.tsx`:
  - Command-palette স্টাইল Dialog, keyboard shortcut listener (`useEffect` এ
    `keydown` event, `metaKey || ctrlKey` চেক করে)
  - Debounced search (৩০০ms) — প্রতি কি-স্ট্রোকে API কল না করে বরং টাইপিং থামলে
    কল হয় (unnecessary DB load কমাতে)
  - ৪ ধরনের কনটেন্ট একসাথে খোঁজে: **Subject** (নাম/nameEn), **Topic** (নাম/nameEn,
    chapter+subject breadcrumb সহ), **Flashcard Deck** (শুধু নিজের, প্রাইভেট),
    **Forum Post** (সবার, পাবলিক শিরোনাম)
  - `GET /api/search?q=...` — প্রতিটা ক্যাটাগরি থেকে সর্বোচ্চ ৫টা রেজাল্ট,
    PostgreSQL `mode: "insensitive"` দিয়ে case-insensitive Bangla/English সার্চ,
    ২ অক্ষরের কম query হলে খালি রেজাল্ট (avoid noisy matches)
  - ফলাফলে ক্লিক করলে সরাসরি সেই পেজে navigate করে (topic হলে `/learn/subjectId/topicId`,
    deck হলে `/flashcards/deckId`, post হলে `/forum/postId`)
  - Dashboard header এ `GlobalSearch` ট্রিগার বাটন (`Ctrl K` কীবোর্ড হিন্ট badge সহ)
- ✅ **নিরাপত্তা**: Flashcard Deck সার্চে `where: { userId: session.user.id }`
  ফিল্টার আছে (নিজেরটা ছাড়া অন্য কারো ডেক দেখা যায় না), unauthenticated রিকোয়েস্টে
  401, Forum Post ও Subject/Topic সবার জন্য পাবলিক তাই ফিল্টার ছাড়াই দেখা যায়
- ✅ **End-to-end টেস্ট** (দুইজন ইউজার দিয়ে বাস্তব সিমুলেশন):
  - "পদার্থ" সার্চ করে Subject (২টা পত্র) ও Topic দুটোই একসাথে পাওয়া গেছে
  - "নিউটন" সার্চ করে User1: Topic (২টা) + নিজের তৈরি Flashcard Deck + Forum
    Post — চারটা ক্যাটাগরির ফলাফলই একসাথে এসেছে তা ভেরিফাই করা হয়েছে
  - **Privacy isolation**: একই "নিউটন" সার্চ User2 দিয়ে করলে User1 এর
    Flashcard Deck দেখা যায়নি (শুধু পাবলিক Topic ও Forum Post দেখা গেছে) —
    এটাই প্রত্যাশিত আচরণ, সঠিকভাবে কাজ করেছে
  - Query length validation: ১ অক্ষরের কম query দিলে খালি রেজাল্ট, ২+ অক্ষরে
    রেজাল্ট আসে
  - Unauthenticated request এ 401 "লগইন করা নেই"
  - Dashboard পেজে "খোঁজো" বাটন ও landing page এ Theme Toggle প্লেসহোল্ডার
    সঠিকভাবে render হয়েছে তা ভেরিফাই করা হয়েছে
  - `pnpm build` (নতুন `/api/search` রুট সহ clean) ও `pnpm lint` (০ error/
    warning) — দুটোই ক্লিন
  - টেস্ট শেষে সব টেস্ট ইউজার (cascade delete এ flashcard decks/forum posts
    সহ) DB থেকে মুছে ফেলা হয়েছে, সিলেবাস কন্টেন্ট ডেটা (13 subjects, 185 topics)
    অক্ষত আছে ভেরিফাই করা হয়েছে

### Extra Phase — Admin Panel সম্প্রসারণ ✅ সম্পন্ন
- ✅ **CQ Question Management UI** — Admin Topic Detail পেজে (`/admin/topics/[topicId]`)
  এখন MCQ ও CQ দুটো ট্যাব — আগে শুধু MCQ ম্যানেজ করা যেত। নতুন
  `components/admin/cq-question-manager.tsx` — উদ্দীপক + ক/খ/গ/ঘ প্রশ্ন +
  প্রতিটার মডেল উত্তর (ঐচ্ছিক) + বোর্ড বছর/নাম দিয়ে CQ যোগ/মুছার সম্পূর্ণ UI
  - API: `POST /api/admin/topics/[topicId]/cq-questions` (তৈরি),
    `PATCH/DELETE /api/admin/cq-questions/[cqQuestionId]` (আপডেট/মুছা) —
    existing MCQ প্যাটার্ন অনুসরণ করে বানানো, `requireAdmin()` guard দিয়ে সুরক্ষিত
  - `question-manager.tsx` কে refactor করে বাইরে `<Tabs>` (MCQ/CQ) দিয়ে মোড়ানো
    হয়েছে, ভেতরের সব existing single-add/CSV-bulk-upload লজিক অক্ষত রাখা হয়েছে
- ✅ **Admin Analytics** (`/admin/analytics`) — `lib থেকে আলাদা, সরাসরি API তে
  aggregation করা হয়েছে (নতুন `app/api/admin/analytics/route.ts`):
  - **Engagement metrics**: DAU (আজ `lastActiveAt` থাকা ইউজার), WAU (৭ দিনে),
    MAU (৩০ দিনে), মোট ইউজার সংখ্যা
  - **Activity counts**: মোট MCQ Quiz/CQ/Mock Exam/Forum Post সংখ্যা
  - **Subject Popularity**: কোন সাবজেক্টে সবচেয়ে বেশি প্র্যাকটিস হচ্ছে + গড়
    accuracy % (QuizAttempt থেকে group করে হিসাব)
  - **Most Practiced Topics**: `prisma.quizAttemptAnswer.groupBy()` দিয়ে
    টপিক-ভিত্তিক উত্তর সংখ্যা বের করে টপ ৮টা টপিক দেখানো
  - **Signup Trend**: গত ৭ দিনের দৈনিক নতুন রেজিস্ট্রেশন সংখ্যা (Recharts Bar Chart)
  - UI: `components/admin/admin-analytics-dashboard.tsx` — stat card grid +
    bar chart + দুইটা ranked list
- ✅ **Forum Moderation** (`/admin/forum`) — সব পোস্ট এক জায়গায় (pin করা পোস্ট
  উপরে), প্রতিটাতে reply/vote/view count, author নাম+ইমেইল দেখা যায়
  - API: `GET /api/admin/forum/posts` (সব পোস্ট, owner ফিল্টার ছাড়া),
    `PATCH /api/admin/forum/posts/[postId]/pin` (পিন/আনপিন টগল),
    `DELETE /api/admin/forum/posts/[postId]` (মুছে ফেলা, confirm dialog সহ)
  - UI: `components/admin/forum-moderation-panel.tsx` — পিন/ডিলিট বাটন,
    পোস্টে ক্লিক করলে নতুন ট্যাবে আসল ফোরাম পোস্ট খোলে (`target="_blank"`)
- ✅ **Notification Broadcast** (`/admin/notifications`) — Admin একসাথে সব
  ইউজারকে ঘোষণা/নোটিফিকেশন পাঠাতে পারে (শিরোনাম + বার্তা + ঐচ্ছিক লিংক)
  - API: `POST /api/admin/notifications/broadcast` — `prisma.user.findMany()`
    দিয়ে সব userId নিয়ে `prisma.notification.createMany()` দিয়ে bulk insert
    (একবারে সবার কাছে, N+1 query এড়িয়ে), validation (title/body আবশ্যক)
  - UI: `components/admin/notification-broadcast-form.tsx` — ফর্ম + confirm
    dialog (ভুলবশত broadcast এড়াতে) + সর্বশেষ কতজনকে পাঠানো হয়েছিল তার কাউন্ট
- ✅ **Admin Sidebar আপডেট** — `app/admin/layout.tsx` এ ৩টা নতুন নেভিগেশন
  লিংক যোগ করা হয়েছে (অ্যানালিটিক্স, Forum Moderation, Notification Broadcast)
- ✅ **End-to-end টেস্ট** (Admin + Regular User দুইজন দিয়ে বাস্তব সিমুলেশন):
  - CQ Question: create (admin) → update (boardName পরিবর্তন) → delete —
    সব সফল; unauthenticated request এ 401, non-admin (logged in student) এ 403
  - Admin Analytics: Regular user দিয়ে Physics এর "নিউটনের গতিসূত্র" টপিকে
    কুইজ দিয়ে (3 প্রশ্নে 2 সঠিক) analytics ডেটা populate করে ভেরিফাই করা
    হয়েছে — DAU/WAU/MAU=1 (আজ active), quizAttempts=1, subjectPopularity তে
    Physics avgAccuracyPct=67% (2/3 সঠিক গণনা মিলেছে), mostPracticedTopics
    এ "নিউটনের গতিসূত্র" ৩বার উত্তর দেওয়া দেখাচ্ছে, signupTrend এ আজকের
    তারিখে ২টা signup (admin+regular) সঠিক
  - Forum Moderation: Regular user পোস্ট তৈরি করলো → Admin সেটা list এ দেখলো
    (author নাম/ইমেইল সহ) → pin করলো (isPinned: true) → delete করলো →
    পোস্ট সংখ্যা 0 হয়ে গেলো — সব সঠিক
  - Notification Broadcast: Admin broadcast পাঠালো (sentCount=2) → Regular
    user এর notification inbox এ দেখা গেলো → Admin নিজেও পেয়েছে (সব ইউজার
    অন্তর্ভুক্ত) → খালি title/body দিলে 400 validation error
  - Authorization: প্রতিটা নতুন admin endpoint এ non-admin/unauthenticated
    রিকোয়েস্ট ঠিকমতো 401/403 রিটার্ন করেছে তা ভেরিফাই করা হয়েছে
  - UI render: `/admin/analytics`, `/admin/forum`, `/admin/notifications`,
    এবং Topic Detail পেজে MCQ+CQ ট্যাব — সব 200 রিটার্ন করেছে; non-admin
    ইউজার admin পেজে গেলে `/dashboard` এ redirect (307) হয়েছে
  - `pnpm build` (সব নতুন রুট clean) ও `pnpm lint` (০ error/warning) — দুটোই ক্লিন
  - টেস্ট শেষে সব টেস্ট ইউজার, forum posts, notifications, cq questions,
    quiz attempts cascade delete দিয়ে DB থেকে মুছে ফেলা হয়েছে, সিলেবাস
    কন্টেন্ট ডেটা (13 subjects, 126 MCQ questions, 9 CQ questions) অক্ষত আছে
    ভেরিফাই করা হয়েছে

### Phase 9 — Polish & Deploy (Day 27-30)
- Responsive/mobile testing
- Bug fixes
- Vercel এ deploy
- PWA কনফিগ (offline support)

> ⏱️ এই টাইমলাইন solo developer + AI-assisted coding ধরে বানানো। আমরা প্রতিটা ফেজ ধরে ধরে
> কোড লিখবো, যাতে আপনি প্রতি ধাপে VS Code এ রান করে দেখতে পারেন।

---

## 📌 অংশ ৮: 🔥 MASTER PROMPT 🔥
### (এই প্রম্পটটি ব্যবহার করে আমরা পরবর্তী ধাপে কোড বিল্ড শুরু করবো)

```
তুমি একজন সিনিয়র ফুল-স্ট্যাক ডেভেলপার। আমি একজন HSC 2028 ব্যাচের Science Group এর
শিক্ষার্থী এবং আমি একটা Science-Only HSC Preparation Platform বানাচ্ছি যার নাম "HSC Ultimate"।

সাবজেক্ট কভারেজ (শুধু এইগুলোই থাকবে, অন্য গ্রুপের কিছু না):
- Bangla (1st + 2nd Paper), English (1st + 2nd Paper), ICT (compulsory)
- Physics (1st + 2nd Paper), Chemistry (1st + 2nd Paper),
  Biology (1st + 2nd Paper), Higher Mathematics (1st + 2nd Paper)

এই প্ল্যাটফর্মে থাকবে:
1. Learning Hub — সাবজেক্ট/চ্যাপ্টার/টপিক অনুযায়ী ভিডিও, নোট, ফর্মুলা শীট
2. AI Study Assistant — বাংলা+ইংরেজিতে প্রশ্নের উত্তর দেওয়া, ছবি থেকে অংক সমাধান
   (Multi-provider fallback: Groq প্রাইমারি → Mistral → Cerebras → OpenRouter)
3. Practice & Assessment Engine — MCQ/CQ প্র্যাকটিস, Adaptive difficulty, Model Test, Mastery tracking
4. Flashcards — SM-2 ভিত্তিক Spaced Repetition সিস্টেম (Anki স্টাইল)
5. Planner — ক্লাস রুটিন, টাস্ক ম্যানেজার, exam countdown, Pomodoro timer, auto study plan generator
6. Gamification — XP, streak, badge, level, leaderboard (Duolingo স্টাইল)
7. Analytics Dashboard — পারফরম্যান্স গ্রাফ, দুর্বলতা analysis, predicted GPA
8. Admin Panel — কন্টেন্ট (সাবজেক্ট/চ্যাপ্টার/প্রশ্ন) আপলোড ও ম্যানেজমেন্টের জন্য

টেক স্ট্যাক:
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Prisma ORM + PostgreSQL (Supabase)
- NextAuth.js (Authentication)
- AI: Groq (primary) + Mistral (secondary/vision) + Cerebras (tertiary) + OpenRouter (fallback)
  — সব OpenAI-compatible endpoint, একটা lib/ai-provider.ts এ fallback chain লজিক থাকবে
- Zustand (state management)
- Recharts (analytics গ্রাফ)

নিয়মাবলী:
- কোড অবশ্যই clean, modular, এবং কমেন্টসহ (বাংলা+ইংরেজি মিশ্রিত কমেন্ট চলবে) হতে হবে
- প্রতিটা ফিচার আলাদা component/module এ থাকবে, যাতে VS Code এ সহজে বুঝে এডিট করা যায়
- প্রতিটা ধাপ শেষে বলবে কী কী ফাইল তৈরি/এডিট হলো এবং কীভাবে লোকালি রান করে টেস্ট করবো
   (যেমন: `pnpm install`, `pnpm dev`, `.env` এ কী কী ভ্যারিয়েবল লাগবে)
- ডেটাবেজ স্কিমা Prisma schema.prisma ফাইলে ধাপে ধাপে বাড়াতে হবে, প্রতিটা নতুন ফিচারের সাথে
   প্রয়োজনীয় মডেল অ্যাড করবে
- UI অবশ্যই Bangla ভাষায় দেখানোর জন্য প্রস্তুত থাকবে (i18n বা সরাসরি বাংলা টেক্সট), সাথে responsive
   (মোবাইল + ডেস্কটপ) হতে হবে
- শুধুমাত্র Science Group এর সাবজেক্ট (Bangla, English, ICT, Physics, Chemistry, Biology,
   Higher Math) দিয়ে স্যাম্পল ডেটা সিড করবে যাতে টেস্ট করা যায় — অন্য গ্রুপের কিছু রাখার দরকার নেই
- API key গুলো কখনো সরাসরি কোডে লেখা হবে না — সবসময় `process.env.VARIABLE_NAME` দিয়ে ব্যবহার
   হবে এবং `.env.local.example` ফাইলে placeholder সহ ভ্যারিয়েবলের নাম উল্লেখ থাকবে
   (`GROQ_API_KEY`, `MISTRAL_API_KEY`, `CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`)

এখন আমরা Phase 0 (Project Setup) থেকে শুরু করবো:
1. Next.js প্রজেক্ট ইনিশিয়ালাইজ কর (TypeScript, Tailwind, App Router সহ)
2. shadcn/ui সেটআপ কর
3. বেসিক ফোল্ডার স্ট্রাকচার তৈরি কর (উপরের প্রস্তাবিত স্ট্রাকচার অনুযায়ী)
4. Prisma ইনস্টল করে schema.prisma এ প্রাথমিক User, Subject, Chapter, Topic মডেল লেখ
5. একটা সুন্দর ল্যান্ডিং পেজ বানাও যেখানে প্ল্যাটফর্মের ফিচারগুলো প্রিভিউ করা যাবে
6. README.md এ লিখে দাও কীভাবে প্রজেক্টটা লোকালি সেটআপ ও রান করতে হবে

প্রতিটা ফেজ শেষ হওয়ার পর আমাকে জিজ্ঞেস করবে "পরবর্তী ফেজে যাবো কিনা" — যাতে আমি প্রতিটা ধাপ
নিজে টেস্ট করে এগোতে পারি।
```

---

---

> 📚 **এই ফাইলটা প্রজেক্টের মূল পরিকল্পনা — "সংবিধান"।**
> প্রতিটা ফিচার কীভাবে বাস্তবায়িত হয়েছে তার ধাপে-ধাপে রেকর্ড আগে এই
> ফাইলেই ছিল, কিন্তু ফাইলটা ২.৫ MB ছাড়িয়ে যাওয়ায় (GitHub ১ MB এর বেশি
> markdown রেন্ডার করে না) ২০২৬-০৭-৩০ এ আলাদা করা হয়েছে:
>
> - [`MASTER_PLAN_LOG_1.md`](./MASTER_PLAN_LOG_1.md) — Deep Research, প্রথম দিকের Extra Phase, Phase B
> - [`MASTER_PLAN_LOG_2.md`](./MASTER_PLAN_LOG_2.md) — Phase C থেকে বর্তমান পর্যন্ত
> - [`CHANGELOG.md`](./CHANGELOG.md) — সংক্ষিপ্ত ফিচার-বাই-ফিচার হিস্ট্রি

---

## 📌 অংশ ৯: পরবর্তী পদক্ষেপ

এই মাস্টার প্ল্যান রেডি। এখন থেকে আমরা এই ফাইলটাকে "সোর্স অফ ট্রুথ" হিসেবে ব্যবহার করবো।

**আপনি এখন যা করতে পারেন:**
1. ✅ পুরো লিস্ট পড়ে দেখুন — কোনো ফিচার বাদ পড়েছে কিনা বা কোনোটা লাগবে না বললে জানান
2. ✅ প্রজেক্টের একটা নাম ঠিক করুন (যদি চান)
3. ✅ বলুন **"Phase 0 শুরু করো"** — তাহলে আমি সরাসরি এখানে ওয়ার্কস্পেসে Next.js প্রজেক্ট
   বানানো শুরু করবো, যা আপনি ডাউনলোড করে VS Code এ খুলে `pnpm install && pnpm dev` দিয়ে
   রান করতে পারবেন।

> 💡 পরামর্শ: পুরো প্ল্যাটফর্ম একসাথে বানানোর চেষ্টা না করে, উপরের Phase অনুযায়ী ধাপে ধাপে
> এগোনো ভালো — এতে প্রতিটা ফিচার ঠিকভাবে কাজ করছে কিনা টেস্ট করতে করতে এগোনো যাবে, এবং
> কোনো ধাপে সমস্যা হলে সহজে ধরা যাবে।

---
