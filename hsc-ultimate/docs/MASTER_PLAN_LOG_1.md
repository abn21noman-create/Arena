# 📗 MASTER PLAN — বাস্তবায়ন লগ ১ (Deep Research → Phase B)

> [`MASTER_PLAN.md`](./MASTER_PLAN.md) এর ধারাবাহিকতা। এখানে Deep Research
> phase, প্রথম দিকের Extra Phase (League/Percentile/Accessibility/PWA) এবং
> সম্পূর্ণ Phase B এর বিস্তারিত বাস্তবায়ন রেকর্ড আছে।
>
> ➡️ পরের অংশ: [`MASTER_PLAN_LOG_2.md`](./MASTER_PLAN_LOG_2.md)

---

## 🔬 Deep Research Phase সম্পন্ন — Feature Research Document

৩৫+ শীর্ষ education/learning platform (Khan Academy, Duolingo, Habitica, Byju's, Vedantu,
Toppr, Testbook, Physics Wallah, 10 Minute School, Shikho, Anki, Quizlet, RemNote, NotebookLM,
Photomath, Forest, ClassDojo, ইত্যাদি) এবং gamification/pedagogy থিওরি (Octalysis Framework,
ALEKS-এর Knowledge Space Theory) নিয়ে গভীর গবেষণা সম্পন্ন হয়েছে — YouTube, Reddit, GitHub,
App Store review, ইন্ডাস্ট্রি রিপোর্ট থেকে তথ্য সংগ্রহ করে।

সম্পূর্ণ ক্যাটাগরি-ভিত্তিক Master Feature List + Gap Analysis (HSC Ultimate-এ কী আছে vs কী
নেই) + Prioritized Recommendation (Tier 1/2/3) লেখা আছে:
📄 **[`docs/FEATURE_RESEARCH.md`](./FEATURE_RESEARCH.md)**

সংক্ষিপ্ত ফলাফল: HSC Ultimate ইতিমধ্যে Assessment, Spaced Repetition, Planner, Community,
Analytics, Admin ক্যাটাগরিতে শক্তিশালী। সবচেয়ে বড় gap: **গভীর Gamification** (avatar/pet/
league/party system), **Accessibility** (dyslexia font, TTS, keyboard nav), এবং
**Content Delivery** (video/live class)। পরবর্তী ধাপে ব্যবহারকারী এই লিস্ট থেকে কোন
ফিচার implement করতে চান তা বেছে নেবেন।

> ⚠️ **গুরুত্বপূর্ণ প্রজেক্ট সীমাবদ্ধতা (ব্যবহারকারীর স্পষ্ট নির্দেশ)**: HSC Ultimate
> **শুধুমাত্র ছাত্রদের জন্য** (student-only platform)। কোনো Parent/Guardian Dashboard,
> Teacher Portal, বা অভিভাবক/শিক্ষক-সম্পর্কিত কোনো ফিচার এই প্রজেক্টে যোগ করা হবে না —
> এটা গবেষণায় (V1/V2) চিহ্নিত হলেও ব্যবহারকারী স্পষ্টভাবে বাদ দিতে বলেছেন। ভবিষ্যতে
> এই ধরনের কোনো ফিচার সাজেস্ট বা implement করা যাবে না।

### 🔬🔬 Deep Research V2 — Top 100+ Platform Analysis + Architecture/Roadmap

ব্যবহারকারীর অনুরোধে আরও গভীর গবেষণা (V2) সম্পন্ন হয়েছে — ১০৬+ প্ল্যাটফর্ম তালিকাভুক্ত
(Global MOOC/LMS, ভারতীয় exam-prep giants, BD edtech, AI tutor, flashcard/SRS, note app,
habit app, gamification app, whiteboard, tutor marketplace ইত্যাদি ১৩টা ক্যাটাগরি জুড়ে),
প্রতিটা "Top X" ক্যাটাগরির (Top AI Tutor, Top LMS, Top Flashcard App, ইত্যাদি) rank দেওয়া
হয়েছে, একটা সম্পূর্ণ **Competitor Matrix** (HSC Ultimate vs Shikho/10MS/Khan Academy/
Duolingo/Anki/Vedantu) ও **AI Feature Matrix** বানানো হয়েছে, Database Architecture
(multi-tenant/RLS/compliance pattern), Security (FERPA/GDPR-aware, RAG pattern), ও
Performance (caching/CDN) সুপারিশ দেওয়া হয়েছে। এছাড়া Mobile/Web/Desktop/Offline/AI
Agents/Voice AI/OCR/PDF AI/Whiteboard AI/Live Class/Study Group/Social Learning/
Marketplace/API/Plugin System — প্রতিটা বিষয় আলাদাভাবে বিশ্লেষণ করা হয়েছে, এবং একটা
৩-ফেজ (A/B/C) সম্পূর্ণ ফিচার রোডম্যাপ + ৫-১০ বছরের ভবিষ্যৎ ভিশন (multi-agent AI, AI
avatar tutor, AR/VR lab simulation, cross-institution B2B ইত্যাদি) প্রস্তাব করা হয়েছে।

📄 সম্পূর্ণ ডকুমেন্ট: **[`docs/FEATURE_RESEARCH_V2.md`](./FEATURE_RESEARCH_V2.md)**

মূল takeaway: HSC Ultimate-এর বর্তমান architecture (Next.js+Prisma+PostgreSQL+multi-AI-
provider) ইন্ডাস্ট্রি-স্ট্যান্ডার্ড ও ভবিষ্যৎ-স্কেল-উপযোগী। সবচেয়ে impactful পরবর্তী
পদক্ষেপ (Phase A): Streak Freeze+League system, Accessibility Pack, PWA conversion,
Percentile/Rank system — কম effort এ উচ্চ ইউজার-ইমপ্যাক্ট।

---

## 🎮 Extra Phase — Streak Freeze + Weekly League/Tier System (Duolingo-স্টাইল)

Phase A রোডম্যাপ অনুযায়ী প্রথম ফিচার হিসেবে **Streak Freeze** ও **সাপ্তাহিক League/Tier
System** বানানো হয়েছে — Deep Research V1/V2-তে চিহ্নিত সবচেয়ে বেশি প্রমাণিত gamification
মেকানিক্স (Duolingo case study, DAU ৩৫% YoY growth, churn ৪৭%→২৮%)।

### ফিচার বিবরণ

**১. Streak Freeze** — মিস হয়ে যাওয়া দিনেও streak বাঁচানোর "insurance" আইটেম
- প্রতিটা ইউজার সর্বোচ্চ **২টা** Streak Freeze জমা রাখতে পারে, প্রতি **৭ দিনে** ১টা করে
  auto-refill হয় (max ২টা পর্যন্ত)।
- লজিক: ইউজার ঠিক ১ দিন মিস করলে (gap = ২ দিন) এবং freeze মজুদ থাকলে, freeze স্বয়ংক্রিয়ভাবে
  ব্যবহৃত হয়ে streak ভাঙার বদলে চালু থাকে (freeze count ১ কমে)। freeze না থাকলে বা গ্যাপ
  ১ দিনের বেশি হলে streak reset হয়ে ১ হয়।
- Freeze ব্যবহার হলে ইউজারকে নোটিফিকেশন পাঠানো হয় ("🧊 Streak Freeze ব্যবহৃত হয়েছে")।
- Dashboard-এ streak কার্ডে ফ্রিজ কাউন্ট দেখানো হয় (🧊×সংখ্যা)।

**২. Weekly League/Tier System** — সাপ্তাহিক XP-ভিত্তিক গ্রুপ প্রতিযোগিতা
- ৫টা টিয়ার: 🥉 ব্রোঞ্জ → 🥈 সিলভার → 🥇 গোল্ড → 💎 প্ল্যাটিনাম → 👑 ডায়মন্ড।
- প্রতিটা ইউজারের `weeklyXp` ট্র্যাক করা হয় (সপ্তাহ শুরু রবিবার ০০:০০ UTC হিসেবে ধরা)।
- প্রতিটা টিয়ারের একটা প্রমোশন থ্রেশহোল্ড আছে (ব্রোঞ্জ ১০০, সিলভার ২০০, গোল্ড ৩০০,
  প্ল্যাটিনাম ৪০০ সাপ্তাহিক XP) — থ্রেশহোল্ড ছুঁলে সপ্তাহ শেষে পরের টিয়ারে প্রমোশন হয়।
- সপ্তাহে ন্যূনতম ২০ XP-ও অর্জন না করলে ডিমোশন হয় (ব্রোঞ্জের নিচে যাওয়া যায় না)।
- **Lazy reset প্যাটার্ন** — cron job ছাড়াই, যখনই ইউজার active হয় (gamification sync API
  কল হয়) তখন `processWeeklyLeagueReset()` চেক করে সপ্তাহ পুরনো হয়ে গেছে কিনা, হলে
  promotion/demotion প্রসেস করে ও notification পাঠায়।
- **সরলীকরণ সিদ্ধান্ত**: আসল Duolingo ৩০-জনের random cohort matchmaking করে (জটিল
  infrastructure লাগে) — HSC Ultimate-এর স্কেলে প্রতিটা টিয়ারের মধ্যে সব ইউজার একসাথে
  প্রতিযোগিতা করে (deterministic, সহজ, কিন্তু একই psychological effect দেয়)।

**৩. কেন্দ্রীভূত `awardXp()` ফাংশন** — রিফ্যাক্টরিং
- আগে ১১টা আলাদা API route এ সরাসরি `prisma.user.update({ data: { xp: { increment } } })`
  কল হতো — এতে `weeklyXp` কখনো আপডেট হতো না।
- নতুন `lib/league.ts` এ `awardXp(userId, amount)` ফাংশন বানানো হয়েছে যা `xp` ও `weeklyXp`
  উভয়ই একসাথে বাড়ায় (এবং award করার আগে lazy league reset চেক করে)।
- সব XP-award জায়গা (practice submit, CQ submit, flashcard review, forum post/reply/best
  answer, mock exam CQ submit, study plan item, study session/pomodoro, task completion,
  topic mastery) `awardXp()` ব্যবহার করতে রিফ্যাক্টর করা হয়েছে।

### Database Schema পরিবর্তন
- নতুন enum: `LeagueTier` (BRONZE/SILVER/GOLD/PLATINUM/DIAMOND)
- `User` মডেলে নতুন কলাম: `streakFreezes` (Int, default ২), `lastFreezeRefillAt` (DateTime),
  `leagueTier` (LeagueTier, default BRONZE), `weeklyXp` (Int, default ০), `weekStartDate`
  (DateTime)
- নতুন index: `@@index([leagueTier, weeklyXp])` — লিগ-ভিত্তিক লিডারবোর্ড কোয়েরি দ্রুত করতে
- Migration: `20260705145410_add_streak_freeze_and_league`

### Files তৈরি/পরিবর্তিত
- **নতুন**: `lib/league.ts` (league tier info, promotion/demotion logic, awardXp, weekStart হিসাব)
- **পরিবর্তিত**: `lib/streak.ts` (freeze refill+ব্যবহার লজিক যোগ)
- **পরিবর্তিত**: `app/api/gamification/sync/route.ts` (weekly league reset কল যোগ)
- **পরিবর্তিত**: `app/(dashboard)/leaderboard/page.tsx` (Tabs: "সাপ্তাহিক লিগ" + "গ্লোবাল",
  tier progress bar, countdown)
- **পরিবর্তিত**: `app/(dashboard)/dashboard/page.tsx` (streak freeze count + league tier
  shortcut card)
- **রিফ্যাক্টর্ড** (awardXp ব্যবহার করতে): practice/submit, cq/submit, flashcards/review,
  forum/posts (create+reply+best-answer), mock-exam/submit-cq, study-plan/items,
  study-sessions, tasks, topics/progress

### Live Test ফলাফল (curl দিয়ে বাস্তব ডেটা দিয়ে যাচাই)
১. **Registration+Login**: টেস্ট ইউজার তৈরি ও session cookie ভেরিফাই ✅
২. **Gamification Sync**: নতুন ইউজারের streak=1, FIRST_STEP badge ✅
৩. **Practice Submit → awardXp**: ২টা MCQ সঠিক উত্তর → `xp=10` এবং `weeklyXp=10` উভয়ই
   সিঙ্কে বেড়েছে (DB সরাসরি ভেরিফাই করা হয়েছে) ✅
৪. **League Promotion**: DB-তে `weeklyXp=150` (BRONZE থ্রেশহোল্ড ১০০ এর উপরে) ও
   `weekStartDate` ১০ দিন আগে সেট করে sync কল করাতে BRONZE→SILVER প্রমোশন + সঠিক
   নোটিফিকেশন তৈরি হয়েছে ✅
৫. **League Demotion**: SILVER থেকে `weeklyXp=5` (ডিমোশন থ্রেশহোল্ড ২০ এর নিচে) দিয়ে পুরনো
   সপ্তাহ সেট করে sync কল করাতে SILVER→BRONZE ডিমোশন + সঠিক নোটিফিকেশন তৈরি হয়েছে ✅
৬. **Streak Freeze ব্যবহার**: `lastActiveAt` ২ দিন আগে সেট করে (gap=২ দিন, ১ দিন মিস),
   `streakFreezes=2` রেখে sync কল করাতে freeze ব্যবহৃত হয়ে streak ৫→৬ বেড়েছে (ভাঙেনি),
   freeze count ২→১ কমেছে, নোটিফিকেশন তৈরি হয়েছে ✅
৭. **Streak Reset (freeze ছাড়া)**: `streakFreezes=0` রেখে একই ২ দিনের গ্যাপ দিয়ে sync কল
   করাতে freeze না থাকায় streak ঠিকভাবে reset হয়ে ১ হয়েছে ✅
৮. **Leaderboard পেজ**: `/leaderboard` রুট 200 status এ render হয়েছে, দুটো ট্যাব
   ("সাপ্তাহিক লিগ", "গ্লোবাল") ও টিয়ার ব্যাজ ("ব্রোঞ্জ") HTML এ দেখা গেছে ✅
৯. **Dashboard পেজ**: `/dashboard` রুট 200 status এ render হয়েছে, league tier shortcut
   card দেখা গেছে ✅
১০. **Authorization**: unauthenticated অবস্থায় `/api/gamification/sync` → 401,
    `/leaderboard` পেজ → 307 redirect (লগইন পেজে) ✅
১১. **Build+Lint**: `pnpm build` ক্লিন (কোনো TypeScript এরর নেই), `pnpm lint` প্রথমে
    react-hooks/purity এরর ধরেছিল (`Date.now()` render এর মধ্যে সরাসরি কল করা হচ্ছিল
    leaderboard পেজে) — `new Date()` কে একবার ভ্যারিয়েবলে নিয়ে ফিক্স করা হয়েছে, তারপর
    ক্লিন ✅

### টেস্ট ডেটা পরিষ্কার
টেস্ট ইউজার (`streaktest@example.com`) Python psycopg2 দিয়ে সরাসরি DB থেকে delete করা
হয়েছে (cascade delete এ সংশ্লিষ্ট notification-ও মুছে গেছে)। সিলেবাস কন্টেন্ট (Subject/
Topic/Question) অক্ষত রাখা হয়েছে।

---

## 📊 Extra Phase — Mock Exam Percentile / Rank System

Phase A রোডম্যাপের দ্বিতীয় ফিচার — Deep Research V2-তে চিহ্নিত Testbook/Vedantu-স্টাইল
"all-user percentile compare" ফিচার। Mock Exam ফলাফল পেজে এখন ইউজার দেখতে পারবে সে একই
Subject+Mode এর সব পরীক্ষার্থীর মধ্যে কোথায় আছে।

### ফিচার বিবরণ
- **Rank**: একই Subject + Mode (FULL/QUICK) এর সব COMPLETED MockExamAttempt এর মধ্যে
  তুলনা করে rank বের করা হয় (rank ১ = সেরা)।
- **Percentile**: "তোমার চেয়ে কম/সমান স্কোর করা কত শতাংশ শিক্ষার্থী" হিসেবে দেখানো হয়
  (percentile ৯০ মানে তুমি ৯০% শিক্ষার্থীর চেয়ে ভালো করেছো)।
- **প্রতি-ইউজার সেরা attempt নীতি**: একজন ইউজার একাধিকবার একই Subject+Mode এ পরীক্ষা
  দিলে তার **সর্বোচ্চ** percentage-টাই তুলনায় ব্যবহার হয় (বার বার দিয়ে rank কৃত্রিমভাবে
  খারাপ দেখানো ঠেকাতে)।
- Result পেজে নতুন কার্ড: Rank + Total Participants + Percentile — সহজবোধ্য বাংলা
  ব্যাখ্যাসহ ("তুমি X% শিক্ষার্থীর চেয়ে ভালো করেছো")।
- যদি প্রথম participant হয় (কেউ আগে দেয়নি), percentile 100 দেখানো হয়।

### Files তৈরি/পরিবর্তিত
- **নতুন**: `lib/percentile.ts` (`calculateMockExamPercentile()` — rank+percentile
  হিসাব লজিক)
- **পরিবর্তিত**: `app/api/mock-exam/[attemptId]/result/route.ts` (response এ
  `percentile` object যোগ)
- **পরিবর্তিত**: `components/mock-exam/mock-exam-result.tsx` (Percentile/Rank কার্ড UI)

### Live Test ফলাফল (৩-ইউজার সিমুলেশনে বাস্তব ডেটা দিয়ে যাচাই)
৩ জন টেস্ট ইউজার তৈরি করে একই Subject (পদার্থবিজ্ঞান ১ম পত্র) এ QUICK mode Mock Exam
বাস্তব API দিয়ে চালানো হয়েছে:
- User0: MCQ 10/10 সঠিক (CQ 0/10 ম্যানুয়ালি সম্পন্ন) → মোট ১০/২০ (৫০%)
- User1: MCQ 5/10 সঠিক → মোট ৫/২০ (২৫%)
- User2: MCQ 0/10 সঠিক → মোট ০/২০ (০%)

ফলাফল (API থেকে সরাসরি):
- User0: **rank #1**, **percentile 100** ✅ (সর্বোচ্চ স্কোরার)
- User1: **rank #2**, **percentile 50** ✅ (মাঝামাঝি)
- User2: **rank #3**, **percentile 0** ✅ (সর্বনিম্ন স্কোরার)

Authorization টেস্ট: অন্য ইউজারের attempt ID দিয়ে result দেখতে চেষ্টা করলে **404** (নিজের
attempt না হলে দেখা যায় না), unauthenticated রিকোয়েস্টে **401** — উভয়ই সঠিকভাবে কাজ করেছে।

Build+Lint: `pnpm build` ও `pnpm lint` উভয়ই ক্লিন (কোনো এরর নেই)।

### টেস্ট ডেটা পরিষ্কার
৩টা টেস্ট ইউজার (`pctest1/2/3@example.com`) ও তাদের mock exam attempt Python psycopg2
দিয়ে delete করা হয়েছে (cascade delete এ attempt-ও মুছে গেছে, ভেরিফাই করা হয়েছে)।

---

## ♿ Extra Phase — Accessibility Pack (WCAG 2.2-অনুপ্রাণিত)

Phase A রোডম্যাপের তৃতীয় ফিচার — Deep Research V1/V2-তে legal (২০২৪ সালে ৪,০০০+ ADA
lawsuit) ও ethical গুরুত্ব হিসেবে চিহ্নিত। লক্ষ্য: দৃষ্টিপ্রতিবন্ধী, dyslexia, ও
motion-sensitivity থাকা শিক্ষার্থীদের জন্য প্ল্যাটফর্ম ব্যবহারযোগ্য করা।

### ফিচার বিবরণ

**১. Font Size Control** — ৩ ধাপ (স্বাভাবিক ১৬px, বড় ১৮px, অতিরিক্ত বড় ২০px), পুরো
অ্যাপের `html { font-size }` CSS variable দিয়ে নিয়ন্ত্রিত — rem-based সব লেআউট
স্বয়ংক্রিয়ভাবে scale হয়।

**২. Dyslexia-বান্ধব ফন্ট** — [OpenDyslexic](https://opendyslexic.org) ফন্ট (ওপেন
সোর্স, ওজনযুক্ত নিচের অংশ যা অক্ষর গুলিয়ে ফেলা কমায়) স্থানীয়ভাবে সেল্ফ-হোস্ট করা
হয়েছে (`public/fonts/`, ২টা woff2 ফাইল ~২২KB করে — কোনো external CDN নির্ভরতা নেই)।
বাংলা টেক্সট (Hind Siliguri) অপরিবর্তিত থাকে কারণ OpenDyslexic শুধু ল্যাটিন
স্ক্রিপ্ট কভার করে — CSS `font-family` fallback chain স্বয়ংক্রিয়ভাবে বাংলা glyph-এর
জন্য পরের ফন্টে switch করে।

**৩. High Contrast Mode** — টেক্সট/বর্ডার কনট্রাস্ট বাড়িয়ে দেয়, link/button
আন্ডারলাইন করে (কম দৃষ্টিশক্তি সম্পন্ন ইউজারদের জন্য)।

**৪. Reduced Motion** — সব animation/transition duration কমিয়ে ~০ করে দেয়
(motion sensitivity/vestibular disorder থাকা ইউজারদের জন্য)। এছাড়া OS-লেভেল
`prefers-reduced-motion: reduce` মিডিয়া কোয়েরিও স্বয়ংক্রিয়ভাবে respect করা হয়।

**৫. Text-to-Speech (Read-Aloud)** — Browser-এর built-in Web Speech API
(`SpeechSynthesisUtterance`) ব্যবহার করে, কোনো external API cost ছাড়াই। প্রয়োগ
করা হয়েছে দুই জায়গায়:
   - Topic Detail পেজে নোট সেকশনে "নোট শুনো" বাটন
   - AI Tutor চ্যাটের প্রতিটা assistant মেসেজে "শুনো" বাটন
   বাংলা ভয়েস (`bn-*`) পাওয়া গেলে সেটাই ব্যবহার হয়, না থাকলে ব্রাউজার ডিফল্ট ভয়েসে
   `lang="bn-BD"` সেট করে পড়ার চেষ্টা করা হয় (ব্রাউজার/OS-নির্ভর সাপোর্ট)।

**৬. Skip-to-Content Link** (WCAG 2.4.1) — কীবোর্ড ইউজাররা Tab চাপলে প্রথমে এই
লিংক ফোকাস পায়, Enter চাপলে মূল কনটেন্টে জাম্প করে (রিপিটেটিভ নেভিগেশন মেনু
বাইপাস করার জন্য)। ডিফল্টে অদৃশ্য, শুধু ফোকাস পেলে দৃশ্যমান হয়।

### ডিজাইন প্যাটার্ন — next-themes এর মতোই
`AccessibilityProvider` (React Context) সব preference `localStorage` এ persist
করে এবং mount হওয়ার পরে `<html>` এলিমেন্টে CSS class/variable বসিয়ে দেয় —
`ThemeProvider`-এর সাথে সামঞ্জস্যপূর্ণ প্যাটার্ন, দুটো provider একসাথে nest করা
হয়েছে `app/providers.tsx` এ। Settings পেজে নতুন "অ্যাক্সেসিবিলিটি" ট্যাব যোগ করা
হয়েছে (Switch টগল + Font Size বাটন, instant apply — আলাদা সেভ বাটন লাগে না)।

### Files তৈরি/পরিবর্তিত
- **নতুন**: `lib/accessibility.ts` (টাইপ, ডিফল্ট প্রেফারেন্স, ফন্ট-সাইজ ম্যাপিং)
- **নতুন**: `components/accessibility-provider.tsx` (Context + localStorage persist)
- **নতুন**: `components/settings/accessibility-tab.tsx` (Settings UI)
- **নতুন**: `components/learn/text-to-speech-button.tsx` (Web Speech API wrapper)
- **নতুন**: `public/fonts/OpenDyslexic-Regular.woff2`, `OpenDyslexic-Bold.woff2`
  (সেল্ফ-হোস্টেড, ~২২KB প্রতিটা)
- **পরিবর্তিত**: `app/globals.css` (font-face, dyslexia-font/high-contrast/
  reduced-motion CSS নিয়ম, skip-to-content স্টাইল)
- **পরিবর্তিত**: `app/layout.tsx` (skip-to-content link + `#main-content` anchor)
- **পরিবর্তিত**: `app/providers.tsx` (AccessibilityProvider যোগ)
- **পরিবর্তিত**: `components/settings/settings-form.tsx` (নতুন "অ্যাক্সেসিবিলিটি" ট্যাব)
- **পরিবর্তিত**: `app/(dashboard)/learn/[subjectId]/[topicId]/page.tsx` (TTS বাটন নোট সেকশনে)
- **পরিবর্তিত**: `app/ai-tutor/page.tsx` (TTS বাটন প্রতিটা AI উত্তরে)

### Live Test ফলাফল
১. **Font ফাইল serving**: `/fonts/OpenDyslexic-Regular.woff2` → 200 status, বৈধ
   WOFF2 ফরম্যাট ভেরিফাই ✅
২. **CSS compilation**: বিল্ড হওয়া CSS বান্ডলে dyslexia-font/high-contrast/
   reduced-motion/OpenDyslexic/skip-to-content নিয়মসমূহ (১৭টা match) পাওয়া গেছে ✅
৩. **Settings পেজ**: টেস্ট ইউজার দিয়ে `/settings` → 200, "অ্যাক্সেসিবিলিটি" ট্যাব
   টেক্সট HTML এ উপস্থিত ✅
৪. **Topic পেজে TTS বাটন**: টেস্ট নোট যোগ করে `/learn/[subjectId]/[topicId]` →
   200, "নোট শুনো" বাটন টেক্সট উপস্থিত ✅
৫. **Skip-to-content**: `/dashboard` পেজে "মূল কনটেন্টে যাও" লিংক ও
   `skip-to-content` ক্লাস উপস্থিত ✅
৬. **Authorization**: unauthenticated `/learn/...` ও `/ai-tutor` → 307 redirect
   (লগইন পেজে) ✅
৭. **Build+Lint**: প্রথমে `Loader2` unused import warning ধরা পড়েছিল
   (text-to-speech-button.tsx এ) — সরিয়ে ফিক্স করা হয়েছে, তারপর `pnpm build` ও
   `pnpm lint` সম্পূর্ণ ক্লিন (০ error, ০ warning) ✅

### টেস্ট ডেটা পরিষ্কার
টেস্ট ইউজার (`a11ytest@example.com`) delete করা হয়েছে, এবং টেস্ট করার জন্য
সাময়িকভাবে যোগ করা topic `notesMarkdown` মান রিভার্ট করে `NULL` এ ফিরিয়ে দেওয়া
হয়েছে (মূল সিলেবাস ডেটা অপরিবর্তিত রাখতে)।

### গুরুত্বপূর্ণ নোট
- OpenDyslexic শুধু ল্যাটিন/ইংরেজি টেক্সটে কার্যকর — যেহেতু HSC Ultimate এর প্রধান
  ভাষা বাংলা, dyslexia font এর প্রভাব সীমিত (ইংরেজি টার্ম/সংখ্যা/ফর্মুলায় প্রযোজ্য)।
  ভবিষ্যতে বাংলা-নির্দিষ্ট dyslexia-friendly typography (letter-spacing/line-height
  adjustment) নিয়ে আরও গবেষণা করা যেতে পারে।
- Text-to-Speech বাংলা ভয়েস সাপোর্ট সম্পূর্ণভাবে ব্যবহারকারীর ব্রাউজার/OS-এর উপর
  নির্ভরশীল (Chrome/Edge এ সাধারণত ভালো কাজ করে, কিছু ব্রাউজারে বাংলা ভয়েস নাও
  থাকতে পারে — তখন ডিফল্ট ভয়েসে `lang="bn-BD"` attribute সহ পড়ার চেষ্টা হয়)।

---

## 📱 Extra Phase — PWA (Progressive Web App) Conversion

Phase A রোডম্যাপের চতুর্থ ও শেষ ফিচার — Deep Research V1/V2-তে চিহ্নিত: বাংলাদেশি
ছাত্ররা মূলত মোবাইলে পড়াশোনা করে (10 Minute School কেস স্টাডি — native app-এ
সরে যাওয়ার কারণ ছিল speed+offline+smooth experience)। PWA দিয়ে অ্যাপ-স্টোর ছাড়াই
"Add to Home Screen" ও অফলাইন ক্যাশিং সম্ভব — সবচেয়ে কম effort এ নেটিভ-অ্যাপ-সদৃশ
অভিজ্ঞতা।

### ফিচার বিবরণ

**১. Web App Manifest** (`app/manifest.ts`) — Next.js 16 এর native App Router
manifest route ব্যবহার করা হয়েছে (কোনো external library ছাড়াই)। এতে আছে:
   - অ্যাপের নাম/শর্ট নাম/বর্ণনা (বাংলায়)
   - `display: "standalone"` — ব্রাউজার UI (address bar) ছাড়া নেটিভ-অ্যাপ-সদৃশ লুক
   - `start_url: "/dashboard"` — হোম স্ক্রিন থেকে খুললে সরাসরি ড্যাশবোর্ডে যাবে
   - থিম কালার (`#6366f1` — ব্র্যান্ড ইন্ডিগো), background কালার
   - ৩টা আইকন সাইজ (192x192, 512x512, ও একটা maskable variant Android adaptive
     icon সাপোর্টের জন্য)

**২. App Icon** — AI দিয়ে জেনারেট করা (open book + graduation cap + AI-sparkle
মোটিফ, ইন্ডিগো-পার্পল গ্র্যাডিয়েন্ট), Python/Pillow দিয়ে ক্রপ করে ৪টা ভ্যারিয়েন্ট
তৈরি করা হয়েছে: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180x180,
iOS এর জন্য), ও `icon-maskable-512.png` (৭০% safe-zone সহ, Android adaptive icon
স্ট্যান্ডার্ড অনুযায়ী)।

**৩. Service Worker** (`public/sw.js`) — হাতে-লেখা (কোনো Serwist/next-pwa library
ছাড়া, কারণ Next.js 16 ডিফল্টে Turbopack ব্যবহার করে যা Serwist-এর webpack
নির্ভরতার সাথে সাংঘর্ষিক)। ক্যাশিং স্ট্র্যাটেজি:
   - **API/Auth রুট** (`/api/`, `/auth`, `/callback/`) — কখনো intercept/cache করা
     হয় না, সরাসরি network এ পাঠানো হয় (NextAuth session/CSRF নিরাপত্তার জন্য
     অত্যন্ত গুরুত্বপূর্ণ — ভুল করে cache করলে login/logout ভেঙে যেতে পারত)
   - **Navigation (HTML পেজ)** — network-first, ব্যর্থ হলে (অফলাইনে) cache থেকে
     বা `offline.html` fallback পেজ দেখায়
   - **Static assets** (`_next/static/`, fonts, icons, images) — cache-first
     (দ্রুত লোড, ব্যাকগ্রাউন্ডে রিভ্যালিডেট)
   - Cache নাম ভার্সন-ট্যাগড (`hsc-ultimate-v1-*`) — নতুন ভার্সন এলে `activate`
     ইভেন্টে পুরনো cache স্বয়ংক্রিয়ভাবে মুছে যায়

**৪. Offline Fallback Page** (`public/offline.html`) — ইন্টারনেট না থাকলে
ব্যবহারকারীকে বন্ধুত্বপূর্ণ বাংলা মেসেজ দেখানো হয় ("ইন্টারনেট সংযোগ নেই") +
"আবার চেষ্টা করো" বাটন। প্ল্যাটফর্মের মূল CSS-এর উপর নির্ভর না করে standalone
inline-styled HTML (যাতে অফলাইনেও ঠিকভাবে দেখায়)।

**৫. Service Worker Registration** (`components/pwa-register.tsx`) — শুধুমাত্র
**production build**-এ রেজিস্টার হয় (`NODE_ENV === "production"` চেক)। Development
মোডে রেজিস্টার না করার কারণ: Turbopack HMR এর সাথে conflict এড়ানো এবং পুরনো
কোড ভুলবশত cache হয়ে যাওয়া থেকে বাঁচা।

**৬. Security Header** — `next.config.ts` এ `/sw.js` এর জন্য `Cache-Control:
no-cache, no-store, must-revalidate` হেডার যোগ করা হয়েছে, যাতে ব্রাউজার/CDN
কখনো পুরনো service worker cache করে না রাখে (নতুন deploy এর পরেও ইউজার bug-fix
version না পাওয়ার সমস্যা প্রতিরোধ)।

### Files তৈরি/পরিবর্তিত
- **নতুন**: `app/manifest.ts` (Web App Manifest রুট)
- **নতুন**: `public/sw.js` (হাতে-লেখা Service Worker)
- **নতুন**: `public/offline.html` (অফলাইন fallback পেজ)
- **নতুন**: `components/pwa-register.tsx` (SW registration client component)
- **নতুন**: `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`,
  `icon-maskable-512.png` (AI-জেনারেটেড+Python/Pillow দিয়ে প্রসেসড)
- **পরিবর্তিত**: `app/layout.tsx` (manifest link, apple-web-app meta, theme-color
  viewport, `<PWARegister />` যোগ)
- **পরিবর্তিত**: `next.config.ts` (sw.js এর জন্য no-cache header)

### Live Test ফলাফল (Production Build দিয়ে — dev মোডে SW রেজিস্টার হয় না বলে)
১. **Build**: `pnpm build` ক্লিন, `/manifest.webmanifest` static route হিসেবে
   সফলভাবে তৈরি হয়েছে ✅
২. **Production সার্ভার** (`pnpm start`, `AUTH_TRUST_HOST=true` local টেস্টের
   জন্য প্রয়োজন হয়েছিল — production মোডে NextAuth হোস্ট-ভ্যালিডেশন dev মোডের
   চেয়ে কড়া, deploy এর সময় সঠিক `NEXTAUTH_URL`/হোস্টিং প্ল্যাটফর্ম কনফিগারেশনে
   এটা প্রয়োজন হবে না) থেকে সব PWA asset ভেরিফাই করা হয়েছে:
   - `/manifest.webmanifest` → 200, বৈধ JSON, সব ফিল্ড সঠিক ✅
   - `/sw.js` → 200, `Cache-Control: no-cache, no-store, must-revalidate` ও
     `Service-Worker-Allowed: /` হেডার সঠিক ✅
   - `/offline.html` → 200 ✅
   - সব ৪টা আইকন (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`,
     `icon-maskable-512.png`) → 200 ✅
৩. **HTML head injection**: হোমপেজের raw HTML এ `<link rel="manifest">`,
   `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-title">`,
   `<link rel="apple-touch-icon">` — সব সঠিকভাবে auto-injected (Next.js
   Metadata API দিয়ে) ✅
৪. **Unauthenticated অ্যাক্সেসযোগ্যতা**: সব PWA asset (manifest/sw.js/offline.html/
   icons) লগইন ছাড়াই 200 status এ অ্যাক্সেসযোগ্য — ব্রাউজার install prompt
   দেখানোর আগে এগুলো ফেচ করতে পারতে হয়, `proxy.ts` এর protected route list এ
   এগুলো নেই তা নিশ্চিত করা হয়েছে ✅
৫. **Login/Dashboard flow অক্ষত**: production মোডেও registration→login→dashboard
   (200 status, skip-to-content link উপস্থিত) স্বাভাবিকভাবে কাজ করেছে — service
   worker এর presence NextAuth session flow ভাঙেনি ✅
৬. **Service Worker syntax validation**: `node -c public/sw.js` দিয়ে JS syntax
   বৈধতা যাচাই করা হয়েছে ✅
৭. **Build+Lint**: dev মোডে ফিরে গিয়ে চূড়ান্ত `pnpm build` ও `pnpm lint` — উভয়ই
   সম্পূর্ণ ক্লিন (০ error, ০ warning) ✅

### টেস্ট ডেটা পরিষ্কার
টেস্ট ইউজার (`pwatest@example.com`) delete করা হয়েছে। Production সার্ভার প্রসেস
বন্ধ করা হয়েছে, dev মোডে ফিরে আসা হয়েছে।

### গুরুত্বপূর্ণ নোট (Deploy এর সময় মনে রাখতে হবে)
- Production এ deploy করার সময় হোস্টিং প্ল্যাটফর্মের (Vercel ইত্যাদি) নিজস্ব
  `NEXTAUTH_URL`/হোস্ট হ্যান্ডলিং ঠিকভাবে কনফিগার থাকলে `AUTH_TRUST_HOST` আলাদা
  করে সেট করার দরকার নেই (এটা শুধু sandbox-এ লোকাল `next start` টেস্টের জন্য
  প্রয়োজন হয়েছিল)।
- iOS Safari এ PWA push notification/background sync সীমিত — এটা platform
  limitation, HSC Ultimate এর কোড সমস্যা না।
- ভবিষ্যতে IndexedDB ব্যবহার করে flashcard review অফলাইনে করে পরে sync করার
  ফিচার (V1/V2 গবেষণায় উল্লেখিত) — এই ফেজে implement করা হয়নি, কারণ সেটার জন্য
  conflict-resolution লজিক দরকার (ভবিষ্যতের বড় ফিচার হিসেবে বিবেচিত)।

---

## 🧠 Phase B, Feature 1 — Socratic AI Tutor Mode (Khanmigo-অনুপ্রাণিত)

Phase A (Streak Freeze+League, Percentile/Rank, Accessibility, PWA) সম্পূর্ণ হওয়ার
পরে Phase B শুরু হয়েছে। প্রথম ফিচার — Deep Research এ চিহ্নিত সবচেয়ে গুরুত্বপূর্ণ
pedagogy-gap: বেশিরভাগ AI tutor (Photomath, সাধারণ ChatGPT ব্যবহার) সরাসরি সমাধান
দিয়ে দেয়, যেখানে Khan Academy এর **Khanmigo** Socratic method ব্যবহার করে ছাত্রকে
নিজে চিন্তা করতে বাধ্য করে (deep learning, answer-copying প্রতিরোধ)।

> ⚠️ ব্যবহারকারীর নির্দেশ অনুযায়ী: Parent/Guardian Dashboard বাদ দেওয়া হয়েছে
> (HSC Ultimate সম্পূর্ণ student-only), তাই Phase B থেকে সেই আইটেম স্কিপ করে
> পরবর্তী সবচেয়ে impactful ফিচার (Socratic mode) নিয়ে কাজ শুরু হয়েছে।

### ফিচার বিবরণ
- **দুইটা AI Tutor মোড**: **DIRECT** (আগের ডিফল্ট আচরণ — ধাপে ধাপে সম্পূর্ণ সমাধান
  দেয়) এবং **SOCRATIC** (নতুন — সরাসরি উত্তর না দিয়ে গাইডিং প্রশ্ন করে, ছাত্র নিজে
  উত্তরে পৌঁছায়)।
- `/ai-tutor` পেজের হেডারে টগল বাটন — যেকোনো সময় এক ক্লিকে মোড পরিবর্তন করা যায়,
  পছন্দ ইউজারের প্রোফাইলে (`aiTutorMode` কলাম) স্থায়ীভাবে সংরক্ষিত থাকে।
- প্রতিটা assistant মেসেজে কোন মোডে উত্তর তৈরি হয়েছে তা ডাটাবেজে (`ChatMessage.
  tutorMode`) রেকর্ড থাকে এবং UI তে ছোট "Socratic" ব্যাজ দেখানো হয় — history
  স্ক্রল করলে বোঝা যাবে কোন অংশ কোন মোডে হয়েছিল।
- ছবি-ভিত্তিক প্রশ্নেও (Vision) Socratic নিয়ম প্রযোজ্য — ছবি দেখে সরাসরি সমাধান
  না দিয়ে "প্রথম ধাপ কী হওয়া উচিত মনে হয়?" জিজ্ঞেস করে।
- Welcome message ও মোড অনুযায়ী ভিন্ন (Socratic মোডে চালু হলে ছাত্রকে জানিয়ে দেয়
  যে এখন গাইডিং প্রশ্ন করে শেখানো হবে)।

### Prompt Engineering — একটা গুরুত্বপূর্ণ ইটারেশন
প্রথম সংস্করণের Socratic prompt (নরম নির্দেশনা: "সরাসরি উত্তর দেবে না") বাস্তব
টেস্টে ব্যর্থ হয়েছিল — Groq (Llama 3.3 70B) মডেল তাও সরাসরি সমাধান করে দিচ্ছিল
(x²-5x+6=0 কে ফ্যাক্টর করে x=2/x=3 বলে দিয়েছিল একই মেসেজে)। এটা ঠিক করতে prompt
কে উল্লেখযোগ্যভাবে শক্তিশালী করা হয়েছে:
- 🚫 explicit "কঠোরভাবে নিষিদ্ধ" তালিকা (সমীকরণ সমাধান করা, একাধিক ধাপ একসাথে করা)
- ✅ একটা concrete before/after উদাহরণ prompt এর ভেতরেই দেওয়া (few-shot প্যাটার্ন)
  — কীভাবে ভুল উত্তর দেখতে হবে (❌) এবং সঠিক উত্তর দেখতে হবে তার সরাসরি তুলনা
- "প্রতি মেসেজে শুধু একটা প্রশ্ন/ইঙ্গিত" এর কড়া নিয়ম
- ছাত্র জোর করে উত্তর চাইলেও (“শুধু উত্তরটা বলে দাও”) কীভাবে refuse করতে হবে তার
  নির্দিষ্ট নির্দেশনা

এই ইটারেশনের পরে multi-turn কথোপকথনে (৪ turn টেস্ট করা হয়েছে) মডেল সামঞ্জস্যপূর্ণভাবে
Socratic আচরণ বজায় রেখেছে, এমনকি ছাত্র সরাসরি উত্তর দাবি করলেও।

### Files তৈরি/পরিবর্তিত
- **Schema**: নতুন enum `AiTutorMode` (DIRECT/SOCRATIC), `User.aiTutorMode` কলাম
  (default DIRECT), `ChatMessage.tutorMode` কলাম (nullable, assistant মেসেজে সেট হয়)
  — মাইগ্রেশন: `20260705174321_add_ai_tutor_mode`
- **নতুন**: `app/api/user/ai-tutor-mode/route.ts` (PATCH — মোড টগল API)
- **পরিবর্তিত**: `lib/ai-provider.ts` (`HSC_TUTOR_SOCRATIC_PROMPT` যোগ, পরে
  শক্তিশালী করা হয়েছে উপরে বর্ণিত ইটারেশন অনুযায়ী)
- **পরিবর্তিত**: `app/api/ai-chat/route.ts` (ইউজারের `aiTutorMode` পড়ে সঠিক system
  prompt বেছে নেওয়া, GET এ `aiTutorMode` রিটার্ন, POST response এ `tutorMode` যোগ)
- **পরিবর্তিত**: `app/ai-tutor/page.tsx` (মোড টগল UI, মোড-অনুযায়ী welcome message,
  assistant মেসেজে Socratic ব্যাজ)

### Live Test ফলাফল (বাস্তব AI provider কল দিয়ে, Groq ব্যবহার হয়েছে)
১. **ডিফল্ট মোড**: নতুন ইউজারের `aiTutorMode` স্বয়ংক্রিয়ভাবে `DIRECT` ✅
২. **DIRECT মোড প্রশ্ন**: "নিউটনের দ্বিতীয় সূত্র" প্রশ্নে সম্পূর্ণ ধাপে-ধাপে সমাধান
   পাওয়া গেছে (আগের আচরণ অক্ষত) ✅
৩. **মোড টগল API**: PATCH দিয়ে DIRECT→SOCRATIC পরিবর্তন, DB তে persist ভেরিফাই ✅
৪. **SOCRATIC মোড (প্রথম iteration — ব্যর্থ)**: দ্বিঘাত সমীকরণ প্রশ্নে AI সরাসরি
   সমাধান করে ফেলেছিল — বাগ ধরা পড়েছে, prompt শক্তিশালী করা হয়েছে
৫. **SOCRATIC মোড (revised prompt — সফল)**: একই প্রশ্নে AI এখন সঠিকভাবে গাইডিং
   প্রশ্ন করেছে ("এটা কোন ধরনের সমীকরণ? কোন পদ্ধতি জানা আছে?") ✅
৬. **Multi-turn কথোপকথন টেস্ট (৪ turn)**:
   - Turn 1: গাইডিং প্রশ্ন ✅
   - Turn 2 (ছাত্র সঠিক উত্তর দিলে): পরের ধাপের দিকে গাইড করেছে ✅
   - Turn 3 (ছাত্র ভুল করলে — যোগফল ৫ বলেছে যেখানে -৫ দরকার): বন্ধুত্বপূর্ণভাবে
     সংশোধন করে পরের ইঙ্গিত দিয়েছে ✅
   - Turn 4 (ছাত্র জোর করে "শুধু উত্তর বলো" বললে): refuse করে গাইডিং প্রশ্ন
     চালিয়ে গেছে, কিন্তু context থেকে হারায়নি ✅
৭. **DIRECT এ ফিরে যাওয়া**: SOCRATIC→DIRECT টগল সফল, normal আচরণ ফিরে এসেছে ✅
৮. **Validation**: invalid mode ("INVALID") → 400 ✅
৯. **Authorization**: unauthenticated PATCH → 401 ✅
১০. **UI রেন্ডার**: `/ai-tutor` পেজে "Direct" ও "Socratic" উভয় লেবেল টেক্সট
    উপস্থিত, 200 status ✅
১১. **Build+Lint**: `pnpm build` ও `pnpm lint` সম্পূর্ণ ক্লিন ✅

### টেস্ট ডেটা পরিষ্কার
টেস্ট ইউজার (`socratictest@example.com`) ও তার সব চ্যাট মেসেজ (cascade delete)
DB থেকে মুছে ফেলা হয়েছে।

### গুরুত্বপূর্ণ শিক্ষা (ভবিষ্যতের prompt-engineering কাজের জন্য)
নরম/সাধারণ নির্দেশনা ("সরাসরি উত্তর দেবে না") ছোট/মাঝারি ওপেন-সোর্স মডেলে
(Llama 3.3 70B via Groq) যথেষ্ট না — explicit negative examples (❌ ভুল কী রকম
দেখতে) ও concrete before/after demonstration prompt এর ভেতরেই দেওয়া লাগে
তখনই সামঞ্জস্যপূর্ণভাবে কাজ করে। এই প্যাটার্ন ভবিষ্যতের অন্য কোনো constrained-
behavior AI ফিচারেও (যেমন CQ evaluator strictness) কাজে লাগানো যেতে পারে।

---

## 📄 Phase B, Feature 2 — Report Card PDF Export

Phase B এর দ্বিতীয় ফিচার — বিদ্যমান Analytics/Predicted GPA ফিচারের উপর ভিত্তি
করে একটা ডাউনলোডযোগ্য PDF রিপোর্ট কার্ড বানানো (V1/V2 গবেষণায় Shikho/Vedantu
এর মতো প্ল্যাটফর্মে "detailed report card" ফিচার হিসেবে চিহ্নিত ছিল, ব্যক্তিগত
রেকর্ড রাখার জন্য — Parent এর জন্য না, যেহেতু HSC Ultimate সম্পূর্ণ student-only)।

### ফিচার বিবরণ
- **`/analytics`** পেজের হেডারে "রিপোর্ট কার্ড PDF" বাটন — ক্লিক করলে সাথে সাথে
  PDF জেনারেট হয়ে ব্রাউজারে ডাউনলোড হয়।
- PDF এ থাকে: ছাত্রের নাম/ব্যাচ/বোর্ড, সামগ্রিক পরিসংখ্যান (Mastery%, Quiz
  Accuracy, Study Hours, Streak ইত্যাদি ৮টা স্ট্যাট কার্ড), **Predicted GPA**
  (বড় হাইলাইটেড বক্সে) + প্রতিটা বিষয়ের গ্রেড টেবিল, বিষয়ভিত্তিক Practice
  পারফরম্যান্স টেবিল, এবং দুর্বল টপিক লিস্ট (লাল রঙে হাইলাইট করা)।
- বাংলা টেক্সট PDF এ সঠিকভাবে রেন্ডার করার জন্য **Hind Siliguri ফন্ট এমবেড**
  করা হয়েছে (`lib/fonts/`, Google Fonts official GitHub repo থেকে ডাউনলোড
  করা Regular/Medium/Bold — মোট ~৮০০KB)।
- কোনো ডেটা না থাকলে (নতুন ইউজার) সুন্দর empty-state মেসেজ দেখায় ("যথেষ্ট
  ডেটা নেই — Practice/Mock Exam দিলে GPA হিসাব করা যাবে") — crash করে না।
- ফাইলনেম বাংলা অক্ষর সহ (RFC 5987 `filename*=UTF-8''...` এনকোডিং ব্যবহার
  করে, `filename=` ASCII fallback সহ ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য)।
- Footer এ স্পষ্ট disclaimer: এটা কোনো বোর্ড-অনুমোদিত অফিসিয়াল রিপোর্ট কার্ড
  না, বরং নিজস্ব practice ডেটার ভিত্তিতে সম্ভাব্য (predicted) সারসংক্ষেপ।

### কারিগরি সিদ্ধান্ত
- **লাইব্রেরি**: `@react-pdf/renderer` ব্যবহার করা হয়েছে (Puppeteer/headless
  Chrome এর বদলে) — কারণ এটা lightweight, কোনো browser binary লাগে না, React
  কম্পোনেন্ট সিনট্যাক্সেই ডিজাইন করা যায়, এবং serverless-friendly (Vercel এ
  deploy করার সময় কোনো অতিরিক্ত কনফিগারেশন লাগবে না)।
- **কোনো ডুপ্লিকেট লজিক নেই**: নতুন `lib/report-card.ts` শুধু বিদ্যমান
  `lib/analytics.ts` ও `lib/gpa-predictor.ts` এর ফাংশনগুলো পুনরায় ব্যবহার
  করে ডেটা একত্রিত করে — GPA/স্ট্যাট হিসাবের কোনো লজিক নতুন করে লেখা হয়নি।
- **Node.js runtime** (Edge না) — PDF রেন্ডারিং এর জন্য filesystem access
  (ফন্ট ফাইল পড়া) দরকার, যা Edge runtime এ সম্ভব না।

### সমাধান করা বাগ (লাইভ টেস্টে ধরা পড়েছে)
১. **Font italic এরর**: `emptyNote` স্টাইলে `fontStyle: "italic"` ব্যবহার করা
   হয়েছিল কিন্তু italic ফন্ট ভ্যারিয়েন্ট রেজিস্টার করা হয়নি — react-pdf
   "Could not resolve font" এরর দিয়েছিল। সমাধান: italic স্টাইল সরিয়ে ফেলা
   হয়েছে (শুধু normal/medium/bold ব্যবহার হচ্ছে)।
২. **HTTP header ByteString এরর**: `Content-Disposition` হেডারে সরাসরি বাংলা
   ইউজারনেম বসানোর চেষ্টা করাতে "Cannot convert argument to a ByteString"
   এরর হয়েছিল (HTTP header শুধু ASCII সাপোর্ট করে)। সমাধান: RFC 5987
   `filename*=UTF-8''<percent-encoded>` প্যাটার্ন ব্যবহার করে ASCII fallback
   filename ও UTF-8 এনকোডেড আসল নাম দুটোই পাঠানো হচ্ছে; ফ্রন্টএন্ডেও
   `filename*` regex দিয়ে পার্স করে `decodeURIComponent()` করা হয়েছে।

### Files তৈরি/পরিবর্তিত
- **নতুন**: `lib/report-card.ts` (ডেটা অ্যাগ্রিগেটর — analytics+GPA একত্রিত)
- **নতুন**: `lib/report-card-pdf.tsx` (`@react-pdf/renderer` Document কম্পোনেন্ট)
- **নতুন**: `app/api/report-card/route.ts` (GET — PDF বাফার জেনারেট+ডাউনলোড)
- **নতুন**: `components/analytics/report-card-download-button.tsx` (blob
  fetch+download-trigger বাটন)
- **নতুন**: `lib/fonts/HindSiliguri-{Regular,Medium,Bold}.ttf` (এমবেডেড ফন্ট)
- **পরিবর্তিত**: `components/analytics/analytics-dashboard.tsx` (হেডারে বাটন)
- **নতুন dependency**: `@react-pdf/renderer` (v4.5.1)

### Live Test ফলাফল
১. **Empty state PDF**: নতুন ইউজার (কোনো ডেটা ছাড়া) দিয়ে PDF জেনারেট — 200
   status, ২ পেজের বৈধ PDF, "যথেষ্ট ডেটা নেই" মেসেজ + সব বিষয়ের "—" প্লেসহোল্ডার
   pdftoppm দিয়ে ইমেজে কনভার্ট করে ভিজুয়ালি ভেরিফাই করা হয়েছে — বাংলা টেক্সট
   পরিষ্কার, লেআউট সঠিক ✅
২. **ডেটাসহ PDF**: বাস্তব practice attempt (৪টা MCQ, ২টা সঠিক) ও pomodoro
   session লগ করে আবার PDF জেনারেট — Physics 50% predicted percentage,
   Grade B, 3.00 point, XP=25 (practice+pomodoro combined), Subject
   Performance টেবিলে সঠিক ডেটা, Weak Topic এ "একক ও পরিমাপ" (50% সঠিক)
   সঠিকভাবে দেখা গেছে — ভিজুয়ালি ভেরিফাই করা হয়েছে ✅
৩. **Bug fix ভেরিফিকেশন**: italic font এরর ও ByteString এরর দুটোই ফিক্সের
   পরে সমাধান হয়েছে তা পুনরায় টেস্ট করে নিশ্চিত করা হয়েছে ✅
৪. **Authorization**: unauthenticated `/api/report-card` → 401 ✅
৫. **Build+Lint**: `pnpm build` ও `pnpm lint` সম্পূর্ণ ক্লিন ✅

### টেস্ট ডেটা পরিষ্কার
টেস্ট ইউজার (`reporttest@example.com`) ও তার practice attempt/study session
(cascade delete) DB থেকে মুছে ফেলা হয়েছে। টেস্ট PDF/PNG ফাইল `/tmp/` এ ছিল,
ওয়ার্কস্পেসে কোনো temp ফাইল থেকে যায়নি।

---

## 🦉 Phase B, Feature 3 — Virtual Pet Pomodoro Gamification

Phase B এর তৃতীয় ফিচার — Deep Research এ চিহ্নিত Forest/Study Bunny কেস স্টাডি
থেকে অনুপ্রাণিত। মূল psychology: শুধু XP/badge এর বদলে একটা "জীবন্ত" ভার্চুয়াল
সঙ্গী থাকলে ছাত্র পোমোডোরো সেশন করতে বেশি motivated হয় (nurturing/caretaking
instinct কাজে লাগে — Octalysis Framework এর "Ownership & Possession" core drive)।

### ফিচার বিবরণ
- **পেঁচা মাসকট** (বাংলাদেশে জ্ঞানের প্রতীক হিসেবে পরিচিত) — ইউজার কাস্টম নাম
  দিতে পারে (ডিফল্ট: "বুদ্ধি")।
- **৫টা Evolution Stage**: 🥚 ডিম (০) → 🐣 ছানা পেঁচা (৪ সেশন) → 🦉 কিশোর পেঁচা
  (১২ সেশন) → 🦉 পূর্ণবয়স্ক পেঁচা (৩০ সেশন) → 🦉 ঋষি পেঁচা (৬০ সেশন) — প্রতিটা
  সম্পূর্ণ (২৫ মিনিট+) পোমোডোরো সেশনে ১ carePoint বাড়ে।
- **Happiness স্ট্যাট** (০-১০০): প্রতিটা সেশনে +15 বাড়ে (max ১০০), কিন্তু miss
  করা দিনে ধীরে ধীরে কমে (প্রতিদিন -৫) — **কখনো ২০ এর নিচে নামে না** (Finch app
  এর "non-punishing" দর্শন অনুসরণ করে, Duolingo streak এর মতো কঠোর anxiety
  তৈরি করা এড়ানো হয়েছে ইচ্ছাকৃতভাবে)।
- **Lazy decay** — cron ছাড়াই, GET request এর সময় `lastCareAt` থেকে দিন গণনা
  করে happiness আপডেট হয়।
- Evolution ঘটলে toast notification + persistent notification (bell icon এ)।
- Planner পেজে নতুন কার্ড — পেট ইমোজি (stage অনুযায়ী সাইজ বড় হয়), happiness bar,
  পরের stage এ যেতে কত সেশন বাকি তার progress bar, মোট সেশন সংখ্যা।
- Pomodoro Timer থেকে `study-pet-fed` custom window event dispatch করে
  StudyPetCard কে রিফ্রেশ করানো হয় (prop drilling ছাড়া loosely-coupled UI sync)।

### Database Schema
- নতুন enum: `PetStage` (EGG/HATCHLING/OWLET/ADULT/SAGE)
- নতুন মডেল: `StudyPet` (userId unique — প্রতি ইউজারের ঠিক ১টা পেট, `name`,
  `stage`, `carePoints`, `happiness`, `totalSessions`, `lastCareAt`)
- `User` মডেলে `studyPet StudyPet?` relation যোগ
- Migration: `20260705190347_add_study_pet`

### Files তৈরি/পরিবর্তিত
- **নতুন**: `lib/study-pet.ts` (evolution/happiness-decay/feed core logic,
  lazy pet creation)
- **নতুন**: `app/api/study-pet/route.ts` (GET — অবস্থা+decay, PATCH — নাম পরিবর্তন)
- **নতুন**: `components/planner/study-pet-card.tsx` (UI — emoji, happiness bar,
  evolution progress, inline নাম-এডিট)
- **পরিবর্তিত**: `app/api/study-sessions/route.ts` (`feedStudyPet()` হুক করা
  হয়েছে POMODORO টাইপ+২৫ মিনিট+ সেশনে)
- **পরিবর্তিত**: `components/planner/pomodoro-timer.tsx` (evolution toast +
  `study-pet-fed` event dispatch)
- **পরিবর্তিত**: `app/(dashboard)/planner/page.tsx` (StudyPetCard যোগ)

### Live Test ফলাফল
১. **Lazy pet creation**: নতুন ইউজারের প্রথম GET কলে স্বয়ংক্রিয়ভাবে EGG-stage
   পেট তৈরি হয়েছে (carePoints=0, happiness=100) ✅
২. **Feed on session complete**: ১টা পূর্ণ পোমোডোরো সেশন (১৫০০ সেকেন্ড) →
   carePoints 0→1, totalSessions 0→1, happiness ঠিকভাবে ১০০ এ cap ✅
৩. **Evolution trigger**: ৪টা মোট সেশনের পর carePoints=4 এ পৌঁছে সঠিকভাবে
   EGG→HATCHLING evolution ঘটেছে (`evolved: true`), পাশাপাশি সঠিক বাংলা
   evolution নোটিফিকেশন DB তে তৈরি হয়েছে ("🐣 তোমার স্টাডি পেট বড় হয়েছে!") ✅
৪. **Happiness decay**: `lastCareAt` ৩ দিন আগে সেট করে GET কল করাতে happiness
   ১০০→৮৫ (100 - 3×5) সঠিকভাবে কমেছে ✅
৫. **Happiness floor**: `lastCareAt` ৩০ দিন আগে সেট করে (যা রেখাগণিতিকভাবে
   ঋণাত্মক করে দিত) happiness সঠিকভাবে MIN_HAPPINESS=20 এ আটকে গেছে, তার নিচে
   নামেনি ✅
৬. **নাম পরিবর্তন**: PATCH দিয়ে নাম পরিবর্তন সফল, খালি/স্পেস-only নাম → 400
   validation এরর ✅
৭. **Authorization**: unauthenticated GET/PATCH উভয়ই → 401 ✅
৮. **UI render**: `/planner` পেজ 200 status এ render, StudyPetCard client
   component loading skeleton দেখাচ্ছে (hydration এর পরে actual data — এটা
   প্রকল্পের বিদ্যমান client-component প্যাটার্ন, bug না) ✅
৯. **Build+Lint**: `pnpm build` ও `pnpm lint` সম্পূর্ণ ক্লিন ✅

### টেস্ট ডেটা পরিষ্কার
টেস্ট ইউজার (`pettest@example.com`) ও তার StudyPet রেকর্ড (cascade delete
ভেরিফাই করা হয়েছে — `study_pets` টেবিলে ০ রেকর্ড অবশিষ্ট) DB থেকে মুছে ফেলা
হয়েছে।

---

## 👥 Phase B, Feature 4 — Study Group / Party System (Habitica-অনুপ্রাণিত)

Phase B এর চতুর্থ ফিচার — Deep Research এ চিহ্নিত Habitica এর "Party System"
থেকে অনুপ্রাণিত: ছোট গ্রুপ (১-১০ জন) একসাথে quest এ boss battle করে, কেউ task
miss করলে shared damage হয় — এই "সবাই মিলে একসাথে অর্জন" মেকানিক্স সামাজিক
accountability তৈরি করে (একা একা পড়াশোনার চেয়ে দলগত commitment বেশি motivating)।

### ফিচার বিবরণ
- **Create/Join flow**: ইউজার নতুন গ্রুপ তৈরি করতে পারে (নাম+বিবরণ) অথবা
  ইনভাইট কোড দিয়ে বিদ্যমান গ্রুপে যোগ দিতে পারে। **একজন ইউজার সর্বোচ্চ ১টা
  গ্রুপে** থাকতে পারবে (সরলতার জন্য — Habitica এ multi-party থাকলেও HSC
  Ultimate এর স্কেলে single-group যথেষ্ট)।
- **সাপ্তাহিক সম্মিলিত লক্ষ্য**: প্রতিটা গ্রুপের একটা `weeklyGoalXp` (ডিফল্ট
  ৫০০) থাকে — সব সদস্যের সেই সপ্তাহের XP contribution যোগ করে লক্ষ্যের
  বিপরীতে progress bar দেখানো হয়। লক্ষ্য পূরণ হলে **সবাই +২০ বোনাস XP** পায়
  (Habitica এর party boss battle এর simplified version)।
- **Member Ranking**: গ্রুপের ভেতরে সদস্যদের এই সপ্তাহের contribution অনুযায়ী
  র‍্যাংক করে দেখানো হয় (mini-leaderboard)।
- **Owner role+succession**: গ্রুপ তৈরিকারী OWNER হয়, OWNER গ্রুপ ছেড়ে দিলে
  সবচেয়ে পুরনো সদস্য স্বয়ংক্রিয়ভাবে নতুন OWNER হয়ে যায়। শেষ সদস্যও ছেড়ে দিলে
  পুরো গ্রুপ delete হয়ে যায়।
- **Invite code sharing**: প্রতিটা গ্রুপের একটা ইউনিক ইনভাইট কোড থাকে,
  কপি-বাটন দিয়ে সহজে বন্ধুদের সাথে শেয়ার করা যায়।
- **কেন্দ্রীভূত awardXp() হুক**: `lib/league.ts` এর `awardXp()` ফাংশনে
  `contributeGroupXp()` hook করা হয়েছে — তাই platform-এর **যেকোনো** XP-award
  করা action (practice, CQ, forum, mock exam, task, topic mastery, pomodoro
  ইত্যাদি ১১টা জায়গা) স্বয়ংক্রিয়ভাবে group contribution-এও যোগ হয়, আলাদা করে
  প্রতিটা জায়গায় কল করার দরকার নেই।

### Database Schema
- নতুন enum: `GroupMemberRole` (OWNER/MEMBER)
- নতুন মডেল: `StudyGroup` (name, description, inviteCode unique, weeklyGoalXp,
  maxMembers)
- নতুন মডেল: `StudyGroupMember` (userId **unique** — enforce করে একজন
  ইউজার সর্বোচ্চ ১টা গ্রুপে থাকতে পারবে, role, weeklyXpContributed,
  weekStartDate — lib/league.ts এর lazy-weekly-reset প্যাটার্ন অনুসরণ করে)
- `User` মডেলে `studyGroupMember StudyGroupMember?` relation যোগ
- Migration: `20260705195013_add_study_group`

### Files তৈরি/পরিবর্তিত
- **নতুন**: `lib/study-group.ts` (create/join/leave/contributeGroupXp/
  lazy-weekly-reset core logic)
- **নতুন**: `app/api/study-group/route.ts` (GET — membership+group data,
  POST — create)
- **নতুন**: `app/api/study-group/join/route.ts` (POST — ইনভাইট কোড দিয়ে join)
- **নতুন**: `app/api/study-group/leave/route.ts` (POST — leave+ownership
  transfer/group deletion)
- **নতুন**: `app/(dashboard)/study-group/page.tsx` (server wrapper)
- **নতুন**: `components/study-group/study-group-dashboard.tsx` (create/join
  ফর্ম + group dashboard UI — progress bar, ranking, invite code copy)
- **পরিবর্তিত**: `lib/league.ts` (`awardXp()` এ `contributeGroupXp()` hook,
  ও bug-fix এর জন্য `skipGroupContribution` optional flag)
- **পরিবর্তিত**: `app/(dashboard)/dashboard/page.tsx` (নতুন "Study Group"
  module card)
- **পরিবর্তিত**: `proxy.ts` (`/study-group` route protection যোগ)

### সমাধান করা বাগ (লাইভ multi-user টেস্টে ধরা পড়েছে — গুরুত্বপূর্ণ)
**Feedback Loop বাগ**: প্রাথমিক ইমপ্লিমেন্টেশনে গ্রুপের weekly goal পূরণ হলে
দেওয়া বোনাস XP (`awardXp()` দিয়ে) নিজেই আবার `contributeGroupXp()` ট্রিগার
করছিল — অর্থাৎ বোনাস XP আবার group contribution-এ যোগ হয়ে যাচ্ছিল, যা আবার
থ্রেশহোল্ড ক্রস করাতে পারত এবং আরেকটা বোনাস দিতে পারত (potential infinite
loop/incorrect XP inflation)। বাস্তব টেস্টে এই বাগ ধরা পড়ে — ২ জন ইউজার
মোট ৩০ XP contribute করার কথা থাকলেও group total দেখাচ্ছিল ৭০। সমাধান:
`awardXp()` ফাংশনে `{ skipGroupContribution: true }` নামে একটা optional
flag যোগ করা হয়েছে, যা group bonus award করার সময় ব্যবহার হয় — ফলে বোনাস
XP ইউজারের personal XP/League-এ যোগ হয় কিন্তু group progress-কে প্রভাবিত
করে না। ফিক্সের পরে পুনরায় টেস্ট করে নিশ্চিত করা হয়েছে total ঠিক ৩০ (এক্সপেক্টেড)
দেখাচ্ছে, ৭০ (বাগযুক্ত) না।

### Live Test ফলাফল (২-ইউজার সিমুলেশনে বাস্তব ডেটা দিয়ে)
১. **Group creation**: user1 গ্রুপ তৈরি করলে OWNER role + unique invite code
   সঠিকভাবে জেনারেট হয়েছে ✅
২. **Join validation**: ভুল ইনভাইট কোড → 400, ইতিমধ্যে গ্রুপে থাকা ইউজার আবার
   join/create করতে চাইলে → 400 ("তুমি ইতিমধ্যে একটা গ্রুপে আছো") ✅
৩. **Join success + notification**: user2 সঠিক কোড দিয়ে join করলে গ্রুপের সব
   সদস্যকে "নতুন সদস্য যোগ দিয়েছে" নোটিফিকেশন পাঠানো হয়েছে (DB তে ভেরিফাই) ✅
৪. **XP contribution hook**: user1 এর practice/pomodoro session থেকে অর্জিত
   XP স্বয়ংক্রিয়ভাবে group এর weeklyXpContributed এ যোগ হয়েছে, user2 এর
   contribution অপরিবর্তিত (০) — সঠিক isolation ✅
৫. **Feedback loop বাগ ধরা+ফিক্স**: উপরে বর্ণিত বাগ বাস্তব টেস্টে ধরা পড়েছে ও
   ফিক্স করে পুনরায় ভেরিফাই করা হয়েছে (৩০ সঠিক, ৭০ ভুল ছিল) ✅
৬. **Weekly goal bonus**: থ্রেশহোল্ড (টেস্টের জন্য ২০ এ নামানো) ক্রস করার সাথে
   সাথে **উভয় সদস্য** +২০ বোনাস XP পেয়েছে (DB তে personal xp ভেরিফাই: user1
   85, user2 55) + সঠিক বাংলা নোটিফিকেশন তৈরি হয়েছে ✅
৭. **Owner succession**: OWNER (user1) গ্রুপ ছেড়ে দিলে বাকি থাকা user2
   স্বয়ংক্রিয়ভাবে নতুন OWNER হয়ে গেছে (role ভেরিফাই করা হয়েছে) ✅
৮. **Group deletion on last-member-leave**: শেষ সদস্য (user2) leave করলে
   `groupDeleted: true` রিটার্ন হয়েছে এবং DB তে `study_groups`+
   `study_group_members` উভয় টেবিলে ০ রেকর্ড অবশিষ্ট (cascade ভেরিফাই) ✅
৯. **Re-leave validation**: গ্রুপে না থাকা অবস্থায় আবার leave করতে চাইলে →
   400 ("তুমি কোনো গ্রুপে নেই") ✅
১০. **Authorization**: unauthenticated GET/POST (create/join/leave) সবগুলো
    → 401, unauthenticated পেজ অ্যাক্সেস → 307 redirect ✅
১১. **UI render**: `/study-group` পেজ 200, `/dashboard` এ নতুন "Study Group"
    module card টেক্সট উপস্থিত (server-rendered, তাই সরাসরি HTML এ দেখা
    গেছে) ✅
১২. **Build+Lint**: `pnpm build` ও `pnpm lint` সম্পূর্ণ ক্লিন ✅

### টেস্ট ডেটা পরিষ্কার
২টা টেস্ট ইউজার (`grouptest1/2@example.com`) DB থেকে মুছে ফেলা হয়েছে। গ্রুপ
ইতিমধ্যেই leave-flow টেস্টের মাধ্যমে delete হয়ে গিয়েছিল, তাই অতিরিক্ত
cleanup লাগেনি।

---

## ⚔️ Phase B, Feature 5 — Peer Quiz Duel (Kahoot-অনুপ্রাণিত) — **Phase B সম্পূর্ণ! 🎉**

Phase B এর পঞ্চম ও শেষ ফিচার — Deep Research এ চিহ্নিত Kahoot!/Blooket এর মতো
লাইভ কুইজ কম্পিটিশন ফরম্যাট থেকে অনুপ্রাণিত, কিন্তু HSC Ultimate এর জন্য
১-বনাম-১ asynchronous ("duel") সংস্করণে সরল করা হয়েছে — কোনো WebSocket/
real-time infrastructure ছাড়াই polling-based approach দিয়ে বাস্তবায়িত।

### ফিচার বিবরণ
- **Create Challenge**: ইউজার একটা Subject বেছে নিলে সেই বিষয়ের ১০টা এলোমেলো
  MCQ প্রশ্ন দিয়ে একটা "Duel" তৈরি হয় (`WAITING` status) — Public Lobby তে
  অন্য সবাই এটা দেখতে পাবে।
- **Public Lobby**: `/duel` পেজে WAITING অবস্থায় থাকা সব Duel দেখা যায়
  (challenger এর নাম+লেভেল সহ), "গ্রহণ করো" বাটনে ক্লিক করে join করা যায়
  (`ACTIVE` status এ চলে যায়)।
- **Simultaneous MCQ Round**: উভয় অংশগ্রহণকারী একই ১০টা প্রশ্নের উত্তর দেয়
  (সঠিক উত্তর ফ্রন্টএন্ডে পাঠানো হয় না — API থেকে `correctAnswer` field বাদ
  দিয়ে প্রশ্ন সার্ভ করা হয়, নিরাপত্তার জন্য)।
- **Server-side scoring + Tie-breaker**: সার্ভারেই সঠিক উত্তরের সাথে মিলিয়ে
  স্কোর হিসাব হয়। স্কোর সমান হলে **কম সময় নেওয়া** প্রতিযোগী জেতে (tie-breaker),
  সময়ও সমান হলে প্রকৃত ড্র।
- **Polling-based sync**: ফ্রন্টএন্ড প্রতি ৩-৫ সেকেন্ডে duel এর অবস্থা চেক করে
  (WAITING→ACTIVE→COMPLETED ট্রানজিশন detect করতে) — কোনো WebSocket ছাড়াই
  বাস্তবসম্মত "live" অনুভূতি তৈরি করে।
- **XP পুরস্কার**: বিজয়ী +২৫ XP, পরাজিত +৫ XP (অংশগ্রহণের জন্যও কিছু XP —
  সম্পূর্ণ শূন্য দিলে demotivating হতে পারে), ড্র হলে উভয়ে +১৫ XP।
- **Duel History**: `/duel/history` পেজে win/draw/loss স্ট্যাটস + সাম্প্রতিক
  duel এর তালিকা।
- **Cancel flow**: WAITING অবস্থায় নিজের তৈরি করা duel বাতিল করা যায়
  (`EXPIRED` status এ চলে যায়)।
- **একসাথে ১টা duel সীমাবদ্ধতা**: একজন ইউজার একসাথে একটার বেশি active/waiting
  duel এ থাকতে পারবে না (সরল ও স্পষ্ট UX এর জন্য)।

### Database Schema
- নতুন enum: `QuizDuelStatus` (WAITING/ACTIVE/COMPLETED/EXPIRED)
- নতুন মডেল: `QuizDuel` (subjectId, challengerId, opponentId nullable,
  questionIds JSON, challengerAnswers/opponentAnswers JSON, challengerScore/
  opponentScore, challengerTimeSec/opponentTimeSec, winnerId nullable, status,
  timestamps)
- `Subject` ও `User` মডেলে relation যোগ (`quizDuels`, `duelsAsChallenger`,
  `duelsAsOpponent`)
- Migration: `20260705203514_add_quiz_duel`

### Files তৈরি/পরিবর্তিত
- **নতুন**: `lib/quiz-duel.ts` (create/join/cancel/submit/finalize/history
  core logic — `lib/mock-exam.ts` এর `pickRandom()` পুনরায় ব্যবহার করা হয়েছে)
- **নতুন**: `app/api/duel/route.ts` (GET — lobby+myActiveDuel, POST — create)
- **নতুন**: `app/api/duel/[duelId]/route.ts` (GET — বিস্তারিত অবস্থা, polling)
- **নতুন**: `app/api/duel/[duelId]/join/route.ts`,
  `app/api/duel/[duelId]/cancel/route.ts`,
  `app/api/duel/[duelId]/submit/route.ts`,
  `app/api/duel/[duelId]/questions/route.ts` (correctAnswer বাদ দিয়ে সার্ভ)
- **নতুন**: `app/api/duel/history/route.ts`
- **নতুন**: `app/(dashboard)/duel/page.tsx`, `app/(dashboard)/duel/[duelId]/page.tsx`,
  `app/(dashboard)/duel/history/page.tsx` (server wrappers)
- **নতুন**: `components/duel/duel-lobby.tsx` (create+lobby UI, polling)
- **নতুন**: `components/duel/duel-room.tsx` (WAITING/ACTIVE/COMPLETED তিনটা
  অবস্থার UI, MCQ answering, result screen)
- **নতুন**: `components/duel/duel-history.tsx` (win/loss/draw stats)
- **পরিবর্তিত**: `app/(dashboard)/dashboard/page.tsx` (নতুন "Quiz Duel"
  module card)
- **পরিবর্তিত**: `proxy.ts` (`/duel` route protection যোগ)

### সমাধান করা বাগ (লাইভ টেস্টে ধরা পড়েছে)
**React Hooks Purity এরর**: `duel-room.tsx` এ `useRef<number>(Date.now())`
লেখা হয়েছিল — কিন্তু React এর নিয়ম অনুযায়ী কম্পোনেন্ট রেন্ডারের সময়
`Date.now()` এর মতো impure ফাংশন সরাসরি কল করা যায় না (re-render এ
অসামঞ্জস্যপূর্ণ ফলাফল দিতে পারে)। `pnpm lint` এই এরর ধরেছে ("Cannot call
impure function during render")। সমাধান: `useRef(0)` দিয়ে শুরু করে আসল
সময় `useEffect` এর ভেতরে (প্রশ্ন লোড হওয়ার পরে) সেট করা হয়েছে — এটা impure
না কারণ effect callback render-phase এর বাইরে চলে।

### Live Test ফলাফল (২-ইউজার সিমুলেশনে বাস্তব ডেটা দিয়ে)
১. **Duel creation**: Physics ১ম পত্র (৩৩টা MCQ থেকে) দিয়ে duel তৈরি — সঠিক
   ১০টা প্রশ্ন এলোমেলোভাবে বাছাই হয়েছে, status WAITING ✅
২. **Lobby visibility**: u2 lobby তে u1 এর duel দেখতে পেয়েছে (challenger নাম
   সহ), নিজের তৈরি করা duel নিজের lobby তে দেখা যায়নি (ফিল্টার সঠিক) ✅
৩. **Join flow**: u2 join করলে status ACTIVE হয়ে গেছে, challenger কে
   "Challenge গৃহীত হয়েছে" নোটিফিকেশন পাঠানো হয়েছে ✅
৪. **Question security**: `/api/duel/[duelId]/questions` থেকে আসা প্রশ্নে
   `correctAnswer` field অনুপস্থিত (ভেরিফাই করা হয়েছে) — সঠিক উত্তর leak হয়
   না ✅
৫. **Server-side scoring**: u1 (৮/১০ সঠিক) বনাম u2 (৪/১০ সঠিক) — প্রথম submit
   এ status ACTIVE-ই থেকেছে (অন্যজন এখনো বাকি), দ্বিতীয় submit এ COMPLETED
   হয়ে challengerScore=8, opponentScore=4, winnerId সঠিকভাবে u1 নির্ধারিত ✅
৬. **XP বিতরণ**: বিজয়ী (u1) +২৫ XP, পরাজিত (u2) +৫ XP — DB তে ভেরিফাই করা
   হয়েছে (25, 5) ✅
৭. **নোটিফিকেশন**: বিজয়ী+পরাজিত উভয়ের জন্য সঠিক বাংলা নোটিফিকেশন তৈরি হয়েছে ✅
৮. **Duel History**: সম্পন্ন duel এর পরে `myActiveDuel` null, history stats
   সঠিক (`{wins: 1, draws: 0, losses: 0, total: 1}`) ✅
৯. **Cancel + re-join validation**: ভিন্ন duel তৈরি করে — অ-owner cancel
   করতে চেষ্টা করলে 400, owner cancel করলে সফল (EXPIRED), EXPIRED duel এ
   join করতে চেষ্টা করলে 400 ✅
১০. **Cross-user access protection**: সম্পূর্ণ ভিন্ন (৩য়) ইউজার দিয়ে অন্যের
    duel এর detail দেখতে চেষ্টা করলে 403 ("তুমি এই Duel এর অংশগ্রহণকারী না") ✅
১১. **Authorization**: unauthenticated GET/POST সব endpoint এ 401,
    unauthenticated পেজ অ্যাক্সেসে 307 redirect ✅
১২. **UI render**: `/duel` পেজ 200, `/dashboard` এ "Quiz Duel" module card
    টেক্সট উপস্থিত (server-rendered) ✅
১৩. **Build+Lint**: bug ফিক্সের পরে `pnpm build` ও `pnpm lint` সম্পূর্ণ ক্লিন ✅

### টেস্ট ডেটা পরিষ্কার
৩টা টেস্ট ইউজার (`dueltest1/2@example.com`, `outsider@example.com`) ও তাদের
QuizDuel রেকর্ড DB থেকে মুছে ফেলা হয়েছে (cascade delete ভেরিফাই — `quiz_duels`
টেবিলে ০ রেকর্ড অবশিষ্ট)।

---

## 📷 Phase B, Feature 6 — OCR Pipeline (হাতের লেখা নোট → ফ্ল্যাশকার্ড)

Phase B এর অতিরিক্ত ষষ্ঠ ফিচার (আগে তালিকাভুক্ত ছিল কিন্তু বাস্তবায়ন বাকি ছিল) —
Deep Research এ চিহ্নিত RemNote/Quizlet Magic Notes এর "handwriting → flashcard"
প্যাটার্ন থেকে অনুপ্রাণিত। বিদ্যমান Vision AI ইনফ্রাস্ট্রাকচার (Phase 7 এ তৈরি)
পুনরায় ব্যবহার করে বানানো হয়েছে — কোনো নতুন ভারী dependency ছাড়াই।

### ফিচার বিবরণ
- **৩-ধাপের ফ্লো** (ইচ্ছাকৃতভাবে সরাসরি "ছবি→ফ্ল্যাশকার্ড" না করে মাঝে রিভিউ
  ধাপ রাখা হয়েছে, কারণ OCR ভুল পড়তে পারে বিশেষত হাতের লেখায়):
  ১. **ছবি আপলোড** — হাতের লেখা নোট/বইয়ের পাতা/প্রিন্ট করা টেক্সটের ছবি
     (মোবাইলে সরাসরি ক্যামেরা দিয়ে তোলার জন্য `capture="environment"`
     attribute ব্যবহার করা হয়েছে)
  ২. **OCR Extraction + Review** — Vision AI (Mistral Pixtral/OpenRouter
     Gemini fallback chain, বিদ্যমান `getVisionResponse()`) দিয়ে ছবি থেকে
     টেক্সট বের করা হয়, ইউজার সেটা টেক্সটএরিয়ায় দেখে এডিট করতে পারে
     (ভুল ধরা পড়লে জমা দেওয়ার আগেই ঠিক করা যায়)
  ৩. **AI Flashcard Generation** — এডিট করা টেক্সট বিদ্যমান `generate-ai`
     endpoint এ পাঠিয়ে ৫-৮টা ফ্ল্যাশকার্ড তৈরি (কোনো নতুন AI prompt লেখা
     হয়নি, বিদ্যমান লজিক পুনরায় ব্যবহার করা হয়েছে)
- Flashcard Deck Detail পেজে নতুন "ছবি থেকে বানাও" বাটন (আগের "AI দিয়ে বানাও"
  টেক্সট-বেসড অপশনের পাশে)।
- OCR-নির্দিষ্ট system prompt: শুধু raw টেক্সট এক্সট্র্যাক্ট করে (নিজের থেকে
  কিছু যোগ/ব্যাখ্যা করে না), বানান/ব্যাকরণ ভুল থাকলেও অনুমান করে ঠিক করে না
  (বিশ্বস্ত OCR এর মূল নীতি), গাণিতিক সূত্র স্পষ্টভাবে টেক্সট আকারে তোলে,
  অস্পষ্ট অংশ `[অস্পষ্ট]` ট্যাগ দিয়ে চিহ্নিত করে।

### Files তৈরি/পরিবর্তিত
- **নতুন**: `app/api/flashcard-decks/ocr-extract/route.ts` (OCR system prompt
  + `getVisionResponse()` কল)
- **নতুন**: `components/flashcards/ocr-generate-dialog.tsx` (৩-ধাপের Dialog UI
  — upload/review/done state machine)
- **পরিবর্তিত**: `app/(dashboard)/flashcards/[deckId]/page.tsx` (নতুন বাটন যোগ)

### Live Test ফলাফল (বাস্তব ছবি দিয়ে, বাস্তব Vision AI কল)
১. **টেস্ট ইমেজ তৈরি**: Python/Pillow দিয়ে Hind Siliguri ফন্ট ব্যবহার করে
   একটা বাস্তবসম্মত বাংলা+ইংরেজি মিশ্রিত নোট (নিউটনের সূত্র, F=ma সহ) এর
   ছবি বানানো হয়েছে, ভিজুয়ালি ভেরিফাই করা হয়েছে পড়া যাচ্ছে কিনা ✅
২. **OCR Extraction**: বাস্তব ছবি `/api/flashcard-decks/ocr-extract` এ
   পাঠিয়ে Mistral Pixtral থেকে **হুবহু নির্ভুল** টেক্সট ফেরত এসেছে (বাংলা
   লাইন-ব্রেক+সূত্র সব ঠিক বজায় ছিল) ✅
৩. **End-to-end pipeline**: এক্সট্র্যাক্ট করা টেক্সট দিয়ে
   `generate-ai` endpoint কল করে ৭টা প্রাসঙ্গিক প্রশ্ন-উত্তর ফ্ল্যাশকার্ড
   তৈরি হয়েছে (যেমন: "নিউটনের গতিসূত্রের সূত্র কী?" → "F = ma") ✅
৪. **Validation**: ছবি ছাড়া রিকোয়েস্ট → 400 ("ছবি পাওয়া যায়নি") ✅
৫. **Authorization**: unauthenticated রিকোয়েস্ট → 401 ✅
৬. **UI render**: Deck Detail পেজে "ছবি থেকে বানাও" বাটন উপস্থিত, তৈরি হওয়া
   ফ্ল্যাশকার্ড পেজে সঠিকভাবে দেখা গেছে ✅
৭. **Build+Lint**: `pnpm build` ও `pnpm lint` সম্পূর্ণ ক্লিন ✅

### টেস্ট ডেটা পরিষ্কার
টেস্ট ইউজার (`ocrtest@example.com`) ও তার FlashcardDeck (cascade delete
ভেরিফাই — ০ রেকর্ড অবশিষ্ট) DB থেকে মুছে ফেলা হয়েছে। টেস্ট ইমেজ ফাইল
(`tmp_test_note.png`, ওয়ার্কস্পেসে সাময়িকভাবে রাখা হয়েছিল ভিজুয়াল
ভেরিফিকেশনের জন্য) মুছে ফেলা হয়েছে — ওয়ার্কস্পেসে কোনো leftover temp
ফাইল নেই।

---

## 🎉 Phase B সম্পূর্ণ — সারসংক্ষেপ

Phase B এর সবগুলো ফিচার সম্পন্ন হয়েছে:
1. ✅ Socratic AI Tutor Mode (Khanmigo-অনুপ্রাণিত)
2. ✅ Report Card PDF Export
3. ✅ Virtual Pet Pomodoro Gamification
4. ✅ Study Group / Party System (Habitica-অনুপ্রাণিত)
5. ✅ Peer Quiz Duel (Kahoot-অনুপ্রাণিত)
6. ✅ OCR Pipeline (হাতের লেখা নোট → ফ্ল্যাশকার্ড)

প্রতিটা ফিচারে checkpoint pattern (build+lint+multi-user live test+docs)
কঠোরভাবে অনুসরণ করা হয়েছে, এবং টেস্টের সময় ধরা পড়া প্রতিটা রিয়েল বাগ
(feedback loop, font error, ByteString error, React hooks purity error)
স্বচ্ছভাবে ডকুমেন্ট করে ফিক্স করা হয়েছে।

---

