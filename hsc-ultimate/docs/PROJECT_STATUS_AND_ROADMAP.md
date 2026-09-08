# 📋 HSC Ultimate — সম্পূর্ণ প্রজেক্ট স্ট্যাটাস + গভীর গবেষণা + ভবিষ্যৎ রোডম্যাপ
### (নতুন চ্যাট শুরু করার আগে এই ডকুমেন্ট পড়ে নিন — সব প্রেক্ষাপট এখানে আছে)

> তৈরি হয়েছে: ৮ জুলাই ২০২৬ | উদ্দেশ্য: ব্যবহারকারী নতুন চ্যাট খুলবেন বলে জানিয়েছেন,
> তাই এই একটা ডকুমেন্টে (১) আমরা কী বানাতে চাইছি, (২) এ পর্যন্ত কী কী হয়েছে,
> (৩) আরও গভীর গবেষণা করে যা নতুন জানা গেছে (বিশেষত একটা **অত্যন্ত গুরুত্বপূর্ণ**
> আবিষ্কার), (৪) ভবিষ্যতে কী করলে ভালো হবে, এবং (৫) ব্যবহারকারীর কাছে কী কী
> সিদ্ধান্ত/উত্তর দরকার — সব একসাথে লেখা হলো।

---

## ⚠️ সবচেয়ে জরুরি টেকনিক্যাল নোট (নতুন চ্যাট শুরু করার আগে পড়ুন)

এই ডকুমেন্ট লেখার সময় **bash/terminal sandbox সম্পূর্ণ অকার্যকর ছিল** (১৫০+ বার
চেষ্টা করেও কোনো কমান্ড রান হয়নি, একাধিকবার ৩০ মিনিট অপেক্ষা করেও)। তাই এই
সেশনে **কোনো নতুন কোড লেখা/রান/টেস্ট করা হয়নি** — শুধু research ও planning।
নতুন চ্যাটে প্রথমে normal ভাবে bash test করে দেখা উচিত (`echo test`) — যদি কাজ
করে, তাহলে নিচের "Recovery Checklist" অনুসরণ করে normal কাজ চালিয়ে যাওয়া যাবে।

### Recovery Checklist (নতুন সেশন শুরুতে সবসময় করণীয়)
```bash
ls /home/user   # শুধু hsc-ultimate/ ফোল্ডার থাকা উচিত, root এ অন্য কিছু না
sudo npm install -g pnpm
cd /home/user/hsc-ultimate && pnpm install && pnpm exec prisma generate
pip install psycopg2-binary -q
```
তারপর migration status চেক করা (`pnpm exec prisma migrate status`), এবং
pgvector HNSW ইনডেক্স বহাল আছে কিনা ভেরিফাই করা (নিচে বিস্তারিত)।

---

## 📌 অংশ ১: আমরা কী বানাতে চাইছি (Project Vision)

**HSC Ultimate** — বাংলাদেশের HSC 2028 ব্যাচের Science Group শিক্ষার্থীদের
জন্য একটা সম্পূর্ণ All-in-One প্রস্তুতি প্ল্যাটফর্ম। ব্যবহারকারী নিজে
Khulna, Bangladesh থেকে HSC 2028 ব্যাচের একজন Science ছাত্র, এবং তিনি নিজে
প্রধানত ব্যবহার করবেন (personal project, কিন্তু production-grade quality
এ বানানো হচ্ছে)।

**মূল বৈশিষ্ট্য**:
- Next.js 16 (App Router, TypeScript, Turbopack) + Prisma + Supabase
  PostgreSQL + NextAuth v5 + multi-AI provider (Groq→Mistral→Cerebras→
  OpenRouter fallback)
- Subject কভারেজ: Bangla, English, ICT, Physics, Chemistry, Biology,
  Higher Mathematics (প্রতিটার ১ম+২য় পত্র যেখানে প্রযোজ্য)
- Learning Hub + AI Tutor + Practice Engine + Flashcards (SRS) + Planner +
  Gamification + Analytics + Admin Panel + Community Forum + আরও অনেক কিছু
  (নিচে সম্পূর্ণ লিস্ট)

**⚠️ স্থায়ী constraint (কখনো ভুলে যাওয়া যাবে না)**:
1. **সম্পূর্ণ student-only প্ল্যাটফর্ম** — কোনো Parent/Guardian Dashboard বা
   Teacher Portal কখনো যোগ করা যাবে না (ব্যবহারকারীর স্পষ্ট ও স্থায়ী নির্দেশ)
2. **কোনো Rate Limiting কখনো যোগ করা যাবে না** — ব্যবহারকারী নিজে যত ইচ্ছা
   তত ব্যবহার করবেন, তাই কোনো endpoint এ rate limit বসানো যাবে না (আগে একবার
   ভুলবশত যোগ করা হয়েছিল, পরে সম্পূর্ণ সরিয়ে ফেলা হয়েছে)
3. **কখনো zip বানানো যাবে না** — সব কাজ সরাসরি `/home/user/hsc-ultimate/`
   ফোল্ডারে, workspace root এ শুধু এই একটা প্রজেক্ট ফোল্ডারই থাকবে
4. **Deploy নিয়ে নিজে থেকে প্রসঙ্গ তোলা যাবে না** যতক্ষণ না ব্যবহারকারী
   নিজে চান (আগে "deploy বাদ দাও পরে করবো" বলা হয়েছিল)
5. প্রতিটা ফিচারের checkpoint pattern: build+lint+multi-user live
   test+DB verify+docs আপডেট — কখনো "সম্পন্ন" দাবি করা যাবে না টেস্ট ছাড়া

---

## 📌 অংশ ২: এ পর্যন্ত কী কী হয়েছে (সম্পূর্ণ সারসংক্ষেপ)

সব মিলিয়ে **Phase 0 থেকে Phase E পর্যন্ত + বহু Extra Phase** সম্পন্ন হয়েছে।
নিচে ক্যাটাগরি অনুযায়ী সারসংক্ষেপ (বিস্তারিত `docs/MASTER_PLAN.md` এ, ~২৭০০+ লাইন):

### 🅰️ Core Infrastructure
- Auth (NextAuth v5, Credentials), Onboarding, Route Protection
- Supabase PostgreSQL (pooled+direct connection), Prisma ORM v6.19.3
  (ইচ্ছাকৃতভাবে pinned, v7 এ upgrade করা হয়নি — নিচে কারণ ব্যাখ্যা করা আছে)
- Multi-AI Provider fallback chain (`lib/ai-provider.ts`)

### 🅱️ Learning + Practice
- Learning Hub (Subject→Chapter→Topic নেভিগেশন, ১৩ Subject/৮৯ Chapter/
  ১৮৫ Topic সিড করা)
- Practice Engine (MCQ, ১২৬+ প্রশ্ন), CQ Practice (AI evaluation সহ, ৯+ প্রশ্ন)
- Full Mock Exam (বাস্তব HSC ফরম্যাট: MCQ ২৫+CQ ৫টা) + Predicted GPA
  (Bangladesh Education Board গ্রেডিং স্কেল অনুযায়ী)
- Mock Exam Percentile/Rank System
- **Smart/Adaptive Practice** (দুর্বল টপিক চিহ্নিত করে targeted quiz)

### 🅲️ Flashcards & Memory
- SM-2 Spaced Repetition (Anki-স্টাইল), AI Flashcard Generation, OCR
  Pipeline (হাতের লেখা ছবি → ফ্ল্যাশকার্ড)

### 🅳️ AI Features
- AI Chat Tutor (টেক্সট+ছবি/vision, চ্যাট হিস্ট্রি persist)
- Socratic AI Tutor Mode (Khanmigo-অনুপ্রাণিত, সরাসরি উত্তর না দিয়ে গাইড করে)
- **PDF Chat (RAG)** — নিজের PDF আপলোড করে AI এর সাথে চ্যাট (pgvector দিয়ে)
- Custom Question Generation (বইয়ের পাতার ছবি → AI দিয়ে MCQ/CQ)

### 🅴️ Planner & Productivity
- Task Manager, Exam Countdown, Pomodoro Timer, Class Routine
- Auto Study Plan Generator (AI, দুর্বল টপিক+exam countdown বিশ্লেষণ করে)
- Virtual Pet Pomodoro Gamification (পেঁচা মাসকট, evolution stages)

### 🅵️ Gamification
- XP/Level/Streak/Badge system, Leaderboard
- Streak Freeze + Weekly League/Tier System (Duolingo-স্টাইল)
- Study Group/Party System (Habitica-অনুপ্রাণিত)
- Peer Quiz Duel (১-বনাম-১, Kahoot-অনুপ্রাণিত)
- **Live Exam System + Quiz Battle** (room code দিয়ে multi-person, ৫০ জন পর্যন্ত)

### 🅶️ Community & Analytics
- Discussion Forum (Post/Reply/Vote/Best Answer)
- Analytics Dashboard (charts, weak topic detection)
- Report Card PDF Export (বাংলা ফন্ট এমবেডেড)
- Global Search (Ctrl+K)
- Bookmark + Note + Notification System

### 🅷️ Admin Panel
- Subject/Chapter/Topic/Question CRUD, CSV bulk upload
- User Management, Admin Analytics (DAU/WAU/MAU), Forum Moderation,
  Notification Broadcast

### 🅸️ Platform Quality
- Accessibility Pack (Dyslexia font, TTS, High Contrast, Reduced Motion,
  Skip-to-Content — WCAG 2.2 অনুপ্রাণিত)
- PWA Conversion (Manifest, Service Worker, Offline Fallback)
- Security Hardening (Audit Logging + Security HTTP Headers — **rate
  limiting সরিয়ে ফেলা হয়েছে**)
- Performance Optimization (২১+ নতুন DB index, query consolidation)

**মোট**: ৯৪+ রুট, build+lint সবসময় clean রাখা হয়েছে, প্রতিটা ফিচার real
multi-user সিমুলেশনে টেস্ট করা হয়েছে (Python requests/psycopg2 দিয়ে), এবং
প্রতিটা bug transparently ডকুমেন্ট করে ফিক্স করা হয়েছে।

---

## 📌 অংশ ৩: জানা টেকনিক্যাল সমস্যা/প্যাটার্ন (নতুন সেশনে মনে রাখা জরুরি)

### ৩.১ pgvector HNSW ইনডেক্স বার বার ড্রপ হওয়া (এ পর্যন্ত ৫ বার ঘটেছে)
**কারণ**: এটা Prisma এর নিজস্ব documented/unresolved bug (GitHub issue
`prisma/prisma#28414`, `#23326`, এবং নতুন করে `#28867` — Prisma v7.1.0 তেও
এই বাগ এখনো আছে, "Drift detected... Altered column embedding" এরর দেয়)।
Prisma schema তে `Unsupported("vector(N)")` টাইপের উপর raw SQL দিয়ে বসানো
HNSW ইনডেক্স `prisma migrate dev` প্রতিবার "schema তে নেই" মনে করে ড্রপ করে দেয়।

**সমাধান (tooling তৈরি করা আছে)**: যেকোনো `prisma migrate dev` চালানোর পরে
**অবশ্যই**:
```bash
pnpm exec tsx scripts/fix-vector-index.ts
```
অথবা `pnpm db:migrate` ব্যবহার করা (migrate+fix chain করা)।

### ৩.২ Prisma v7 upgrade — ইচ্ছাকৃতভাবে করা হয়নি
বর্তমানে Prisma v6.19.3 pinned আছে। Deep research (এই সেশনে করা) নিশ্চিত
করেছে যে **v7 এ pgvector সমস্যা আরও খারাপ** (উপরের GitHub issue #28867
অনুযায়ী)। এছাড়া v7 এ import path পরিবর্তন (`@/generated/prisma/client`),
mapped enum breaking bug (#28591) আছে। **সুপারিশ: যতক্ষণ pgvector ব্যবহার
হচ্ছে (PDF Chat ফিচারে), Prisma v6 এ থাকাই ভালো, v7 এ upgrade না করা।**
সবসময় `pnpm exec prisma` ব্যবহার করতে হবে (`npx prisma` না, কারণ সেটা
গ্লোবাল v7 ব্যবহার করে)।

### ৩.৩ AI Provider maxTokens
`lib/ai-provider.ts` এর `getAIResponse()` এ `maxTokens` না দিলে ডিফল্ট
১০২৪ — বাংলা টেক্সটে বড় JSON output (MCQ/CQ generation) এ অপর্যাপ্ত, output
কেটে যায়। MCQ এ ২৫৬০, CQ এ ৩০০০ ব্যবহার করা হচ্ছে এখন।

### ৩.৪ Postgres এ Prisma foreign key auto-index করে না
MySQL এর বিপরীতে, তাই সব hot-path FK কলামে ম্যানুয়ালি `@@index` যোগ করতে
হয়েছে (ইতিমধ্যে ২১+ যোগ করা হয়েছে)।

### ৩.৫ Sandbox মাঝে মাঝে/দীর্ঘক্ষণ অস্থির হয়ে যায়
এই সেশনে bash সম্পূর্ণ কাজ করেনি অস্বাভাবিক দীর্ঘ সময় ধরে (১+ ঘণ্টা,
১৫০+ চেষ্টা)। আগে এই সমস্যা ৫-১০ মিনিটে ঠিক হয়ে যেত। নতুন চ্যাটে এই সমস্যা
নাও থাকতে পারে (fresh sandbox)।

---

## 🔬 অংশ ৪: এই সেশনে করা নতুন গভীর গবেষণা — গুরুত্বপূর্ণ আবিষ্কার

### 🚨🚨 ৪.১ সবচেয়ে গুরুত্বপূর্ণ আবিষ্কার: NCTB "নতুন শিক্ষাক্রম" বাতিল হয়ে গেছে!

**যা প্রথমে ভয় পাইয়ে দিয়েছিল**: web_search করতে গিয়ে দেখা গেল, বাংলাদেশে
২০২২ সালে NCTB একটা সম্পূর্ণ নতুন শিক্ষাক্রম (Competency-Based Curriculum)
approve করেছিল, যেটা ধাপে ধাপে রোলআউট হচ্ছিল: Class 1-2, 6-7 (২০২৩) →
Class 3-4, 8-9 (২০২৪) → Class 5, 10 (২০২৫) → **Class 11 (২০২৬) → Class 12
(২০২৭)** → ফলে **HSC পরীক্ষা ২০২৮ থেকে নতুন শিক্ষাক্রমে হওয়ার কথা ছিল**।
এই নতুন শিক্ষাক্রমে:
- Science/Arts/Commerce বিভাগ বিভাজন Class 9-10 থেকে **তুলে দেওয়া হয়েছিল**
  (সবাই ১০টা কমন বিষয় পড়তো, বিভাগ বেছে নেওয়া হতো শুধু HSC/college level এ)
- MCQ+CQ (সৃজনশীল প্রশ্ন) ফরম্যাটের বদলে continuous assessment + project-
  based evaluation আনার কথা ছিল
- এটা সত্যি হলে **HSC Ultimate এর পুরো architecture ভুল দিক নির্দেশ হয়ে
  যেত** (subject list, MCQ/CQ practice format, mock exam format — সব কিছু
  বর্তমান board format এর উপর ভিত্তি করে বানানো)

**স্বস্তির খবর (verified, একাধিক সূত্র থেকে ক্রস-চেক করা)**: ২০২৪ সালের
আগস্টে ছাত্র আন্দোলনের পর অন্তর্বর্তী সরকার গঠিত হওয়ার পরে এই নতুন
শিক্ষাক্রম **সম্পূর্ণভাবে বাতিল/reverse করা হয়েছে**:
- ২০২৪ সালের ১ সেপ্টেম্বর সরকারি পরিপত্র: Class 9 (২০২৪ থেকে) আবার পুরনো
  ২০১২ শিক্ষাক্রম অনুযায়ী **Science/Arts/Commerce বিভাগ বিভাজন সহ** ফিরিয়ে
  আনা হয়েছে
- ২০২৫ সালের অক্টোবরে নিশ্চিত করা হয়েছে: Class 10 (২০২৫) ও তার পরের সব
  ব্যাচ পুরনো শিক্ষাক্রম (স্ট্রিম বিভাজনসহ) অনুসরণ করবে
- বাস্তব প্রমাণ (এই সেশনে ভেরিফাই করা): কলেজ ভর্তির (একাদশ শ্রেণি ২০২৫-২৬
  শিক্ষাবর্ষ) নোটিশে স্পষ্ট **"বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা"** বিভাগ
  বিভাজন উল্লেখ আছে, ভর্তি পরীক্ষার বিষয় তালিকায় **"বাংলা, ইংরেজি, উচ্চতর
  গণিত, পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞান"** (ঠিক HSC Ultimate এ যে সাবজেক্ট
  আছে) উল্লেখ আছে
- **সরাসরি "HSC 2028" batch উল্লেখ করা কোচিং সেন্টার বিজ্ঞাপন পাওয়া গেছে**
  (10 Minute School, ft.education ইত্যাদি) যেখানে স্পষ্ট লেখা "HSC 2028
  (SSC 2026)" ব্যাচের জন্য **Physics, Chemistry, Biology, Higher Math**
  আলাদা আলাদা কোর্স বিক্রি হচ্ছে ঠিক পুরনো board-exam ফরম্যাটে (chapter-wise
  MCQ+CQ ভিত্তিক)
- ২০২৬ সালের HSC পরীক্ষা সম্পূর্ণ সিলেবাসে, পূর্ণ নম্বরে, পূর্ণ সময়ে
  (COVID-পরবর্তী সংক্ষিপ্ত সিলেবাস যুগ শেষ) — অর্থাৎ সম্পূর্ণ normal board
  format এ ফিরে গেছে

**উপসংহার**: ✅ **HSC Ultimate এর বর্তমান architecture সম্পূর্ণ সঠিক ও safe**।
HSC 2028 ব্যাচ (ব্যবহারকারী নিজে যার অংশ) পুরনো/প্রচলিত শিক্ষাক্রম, Science
Group বিভাজন, এবং MCQ+CQ board exam format অনুযায়ীই পরীক্ষা দেবে —
ঠিক যা যা ধরে নিয়ে এই পুরো প্ল্যাটফর্ম বানানো হয়েছে। **কোনো architecture
পরিবর্তনের দরকার নেই।** তবে এটা ভবিষ্যতে (HSC 2029+ ব্যাচ থেকে) আবার বদলাতে
পারে যদি সরকার আবার নতুন শিক্ষাক্রম আনার চেষ্টা করে — political/policy
পরিস্থিতির উপর নির্ভরশীল, তাই মাঝে মাঝে (৬ মাস অন্তর)再-verify করা ভালো
অভ্যাস হবে।

> 📌 **Action item**: এই তথ্য `docs/MASTER_PLAN.md` এ একটা নোট আকারে যোগ
> করা উচিত (নতুন সেশনে), যাতে ভবিষ্যতে কেউ (বা আমরা নিজেরাই) বিভ্রান্ত না
> হই যে platform এর subject/format assumption ঠিক আছে কিনা।

### ৪.২ FSRS Algorithm (Spaced Repetition আপগ্রেড) — বিস্তারিত প্ল্যান তৈরি
পূর্ণ ডকুমেন্ট: **`docs/FSRS_UPGRADE_PLAN.md`** (এই সেশনেই লেখা হয়েছে)
- SM-2 (বর্তমানে ব্যবহৃত, ১৯৮৭ সালের অ্যালগরিদম) এর তুলনায় FSRS
  ২০-৩০% কম review এ একই retention rate দেয়, prediction error ৪% বনাম ১৪%
  (500M+ real Anki review benchmark)
- Anki নিজেই v23.10+ থেকে FSRS কে ডিফল্ট বানিয়েছে
- `ts-fsrs` npm লাইব্রেরি (official, TypeScript, MIT license) ব্যবহার করে
  ইমপ্লিমেন্ট করা সম্ভব
- Backward-compatible ডিজাইন: নতুন `srsAlgorithm` কলাম (SM2/FSRS enum),
  পুরনো কার্ড SM2 তেই থাকবে, নতুন কার্ড FSRS পাবে — কোনো bulk migration
  ঝুঁকি নেই
- সম্পূর্ণ schema change, code পরিবর্তনের জায়গা, ও ১১-ধাপের live test
  plan তৈরি করা আছে ওই ডকুমেন্টে — **ready to implement**

### ৪.৩ Previous-Year Board Question Filter — বিস্তারিত প্ল্যান তৈরি
পূর্ণ ডকুমেন্ট: **`docs/BOARD_QUESTION_FILTER_PLAN.md`** (এই সেশনেই লেখা হয়েছে)
- আবিষ্কার: `boardYear`/`boardName` কলাম **ইতিমধ্যে** schema তে আছে
  (Question ও CQQuestion দুটোতেই), এবং CQ Admin UI তে **ইতিমধ্যে** কাজ করছে
  (কোড পড়ে ভেরিফাই করা হয়েছে) — শুধু MCQ single-form/CSV bulk ও
  student-facing filter/badge UI বাকি
- **কোনো migration লাগবে না** এই ফিচারে (schema আগে থেকেই আছে)
- সম্পূর্ণ files-to-change list ও live test plan তৈরি — **ready to implement**

### ৪.৪ 2026 EdTech Trend Research (গুরুত্বপূর্ণ insight)
- **Agentic AI প্রবণতা**: 2026 সালের সবচেয়ে বড় ট্রেন্ড হলো AI যে
  proactively student এর progress দেখে নিজে থেকে intervene করে ("তুমি
  ২ বার ট্যাক্স ফর্মুলায় ভুল করেছো, আবার রিভিশন করি চলো") — এটা আমাদের
  Auto Study Plan এর পরের evolution হতে পারে (এখন এটা একবার generate করে,
  continuous monitoring/re-planning agent বানানো ভবিষ্যতের ভালো দিক)
- **NotebookLM-স্টাইল ফিচার সম্প্রসারণ**: ২০২৬ এ NotebookLM নতুন করে
  **Audio Overview** (podcast-স্টাইল সারাংশ), **Mind Map generation**, ও
  **Video Overview** যোগ করেছে। আমাদের PDF Chat (RAG) ইতিমধ্যে আছে, কিন্তু
  Audio/Video Overview এখনো নেই — কম effort এ বড় value addition হতে পারে
  (TTS তো ইতিমধ্যে আছে Accessibility Pack এ, সেটা পুনর্ব্যবহার করে PDF এর
  সারাংশ audio তে convert করা সম্ভব)
- **Voice AI Tutoring**: sub-500ms latency conversational AI tutor এখন
  বাস্তবসম্মত (ElevenLabs Realtime, Deepgram ইত্যাদি) — কিন্তু cost বেশি
  এবং আমাদের multi-provider free-tier strategy এর সাথে সাংঘর্ষিক, তাই
  এখনই priority কম, ভবিষ্যতে বিবেচনাযোগ্য
- **Mathpix-স্টাইল ডেডিকেটেড OCR**: আমাদের বর্তমান OCR (Vision AI দিয়ে,
  general purpose) যথেষ্ট ভালো কাজ করছে (লাইভ টেস্টে verified), dedicated
  math OCR API (Mathpix, $0.002/image) যোগ করার খুব বেশি দরকার নেই এখনই —
  cost/benefit কম
- **At-risk/dropout prediction AI**: বড় প্রতিষ্ঠানের জন্য প্রাসঙ্গিক
  (হাজার হাজার ছাত্র), single-user personal project এর জন্য অতিরিক্ত —
  স্কিপ করা ভালো

### ৪.৫ Infrastructure/Hosting Cost Research (Deploy phase এর জন্য প্রস্তুতি, এখনই deploy না)
- **Vercel Free (Hobby)**: 100GB bandwidth/মাস, ~100K function invocation,
  10 সেকেন্ড function timeout — personal-use app এর জন্য যথেষ্ট
- **Supabase Free**: 500MB database, 1GB storage, 50K MAU, **৭ দিন
  inactivity তে project pause হয়ে যায়** (⚠️ গুরুত্বপূর্ণ — deploy করার পরে
  যদি কিছুদিন app ব্যবহার না হয়, DB ঘুমিয়ে পড়বে, পরের বার অ্যাক্সেসে
  ~৩০ সেকেন্ড wake-up delay লাগবে; workaround: cron job দিয়ে প্রতি কয়েকদিনে
  ping করা)
- **AI Provider free tier** (updated numbers): Groq ~1000 req/day free,
  Mistral free tier ভালো (~1B token/মাস), Cerebras ~1M token/day — personal
  ব্যবহারের জন্য যথেষ্ট, কিন্তু bulk generation (যেমন অনেকগুলো Custom
  Question Set একসাথে বানানো) করলে দ্রুত ফুরিয়ে যেতে পারে, তখন fallback
  chain কাজে লাগবে
- **Prisma v7 pgvector bug এখনো unresolved** (উপরে ৩.২ দেখুন) — deploy
  করার সময় v6 এ থাকাই নিরাপদ

### ৪.৬ Bangladesh Personal Data Protection Act, 2026 (নতুন আইন, সচেতনতার জন্য)
বাংলাদেশে ২০২৬ সালে একটা নতুন Personal Data Protection Act (PDPA) পাশ
হয়েছে (GDPR-স্টাইল)। এটা মূলত ব্যবসায়িক প্রতিষ্ঠান/বড় platform এর জন্য
প্রযোজ্য, personal-use single-developer project এর জন্য legal risk কম,
কিন্তু ভবিষ্যতে যদি অন্য কেউ (বন্ধু ইত্যাদি) ব্যবহার করা শুরু করে, ভালো
অভ্যাস হবে: children's data protection ধারা সম্পর্কে সচেতন থাকা (HSC
ছাত্ররা প্রায়ই minor, ১৭-১৮ বছর বয়সী)। এখনই কিছু করার দরকার নেই, শুধু
সচেতনতার জন্য নোট রাখা হলো।

---

## 🎯 অংশ ৫: ভবিষ্যতে কী করলে ভালো হবে (Prioritized Recommendations)

এই গবেষণার ভিত্তিতে, নিচে অগ্রাধিকার অনুযায়ী সাজানো সুপারিশ:

### 🥇 Tier 1 (Ready-to-implement, কম effort, ইতিমধ্যে ডিজাইন করা আছে)
1. **FSRS Algorithm Upgrade** — `docs/FSRS_UPGRADE_PLAN.md` অনুযায়ী,
   backward-compatible, বিদ্যমান Flashcard ফিচারকে state-of-the-art বানাবে
2. **Previous-Year Board Question Filter** — `docs/BOARD_QUESTION_FILTER_PLAN.md`
   অনুযায়ী, কোনো migration লাগবে না, দ্রুত করা সম্ভব

### 🥈 Tier 2 (নতুন আইডিয়া, মাঝারি effort)
3. **PDF Chat Audio Overview** — বিদ্যমান PDF Chat (RAG) + বিদ্যমান TTS
   (Accessibility Pack এ Web Speech API) মিলিয়ে "এই PDF এর সারাংশ শোনো"
   ফিচার — কোনো নতুন major infrastructure লাগবে না, দুটো বিদ্যমান ফিচার
   জোড়া দেওয়া
4. **Study Plan Agent Upgrade** — বর্তমান Auto Study Plan static (একবার
   generate), সেটাকে continuous monitoring agent এ upgrade করা (প্রতিদিন
   analytics চেক করে প্রয়োজনে re-plan করার সাজেশন, cron ছাড়া lazy-check
   প্যাটার্নে যেমন league reset করা হয়)
5. **Mind Map Generation** — Topic বা PDF এর টেক্সট থেকে AI দিয়ে একটা
   visual concept map বানানো (Mermaid.js বা React Flow দিয়ে render করা
   সম্ভব, বাড়তি heavy dependency ছাড়া)

### 🥉 Tier 3 (বড় effort বা কম priority, ভবিষ্যতের জন্য)
6. **Native Mobile App (Capacitor দিয়ে)** — Next.js থেকে সরাসরি wrap করা
   সম্ভব (`output: 'export'` + Capacitor), কিন্তু dynamic route/SSR থাকায়
   আমাদের প্রজেক্টে straightforward না (static export এ compatible না অনেক
   ফিচার) — PWA already যথেষ্ট ভালো বিকল্প, তাই এটা কম priority
7. **Voice AI Tutor** — cost ও complexity বেশি, personal-use app এ ROI কম
8. **Live Class/Video** — সবচেয়ে বড় effort, single developer project এ
   অবাস্তবসম্মত, স্কিপ করাই ভালো
9. **WhatsApp notification integration** — Meta API cost বেশি হয়ে গেছে
   ২০২৬ এ (marketing/utility conversation চার্জ), personal app এ email/
   web push যথেষ্ট, WhatsApp করার দরকার নেই

### 🚫 করা যাবে না (স্থায়ী constraint, উপরে অংশ ১ এ উল্লেখ করা)
- Parent/Guardian Dashboard, Teacher Portal
- Rate Limiting যেকোনো ফর্মে
- Prisma v7 upgrade (যতক্ষণ pgvector bug থাকে)

---

## ❓ অংশ ৬: ব্যবহারকারীর কাছ থেকে যেসব সিদ্ধান্ত/উত্তর দরকার (পরবর্তী চ্যাটে জিজ্ঞাসা করার মতো)

নতুন চ্যাট শুরু করার সময় যদি ব্যবহারকারী "Next"/"Tumi koro" বলেন, প্রতিষ্ঠিত
প্যাটার্ন অনুযায়ী **নিজে সিদ্ধান্ত নিয়ে** Tier 1 থেকে (FSRS অথবা Board
Question Filter) একটা বেছে নিয়ে এগোনো উচিত — জিজ্ঞাসা করার দরকার নেই।

তবে যদি ব্যবহারকারী স্পষ্ট মতামত দিতে চান, এই প্রশ্নগুলো প্রাসঙ্গিক হতে পারে:
1. FSRS আপগ্রেড আগে করবো, নাকি Board Question Filter আগে?
2. PDF Chat Audio Overview ফিচারটা আগ্রহজনক মনে হচ্ছে কিনা?
3. Deploy নিয়ে এখন কথা বলার সময় হয়েছে কিনা (এখনো জিজ্ঞাসা করবো না, শুধু
   যদি ব্যবহারকারী নিজে তোলেন)

---

## 📂 অংশ ৭: সব গুরুত্বপূর্ণ ফাইল/ডকুমেন্টের ম্যাপ

```
hsc-ultimate/
├── docs/
│   ├── MASTER_PLAN.md                    # সবচেয়ে বিস্তারিত ইতিহাস (২৭০০+ লাইন)
│   ├── README.md (root এ)                # ফিচার লিস্ট + সেটআপ নির্দেশনা
│   ├── FEATURE_RESEARCH.md               # V1 গবেষণা (৩৫+ প্ল্যাটফর্ম)
│   ├── FEATURE_RESEARCH_V2.md            # V2 গবেষণা (১০৬+ প্ল্যাটফর্ম, roadmap)
│   ├── FSRS_UPGRADE_PLAN.md              # ⭐ নতুন — implementation-ready
│   ├── BOARD_QUESTION_FILTER_PLAN.md     # ⭐ নতুন — implementation-ready
│   └── PROJECT_STATUS_AND_ROADMAP.md     # ⭐ এই ডকুমেন্ট — সম্পূর্ণ ব্রিফিং
├── prisma/schema.prisma                  # সম্পূর্ণ DB schema (৩০+ model)
├── scripts/fix-vector-index.ts           # ⚠️ pgvector recovery — মনে রাখা জরুরি
└── (বাকি সব app/lib/components — MASTER_PLAN.md এ ফাইল ম্যাপ আছে)
```

---

## ✅ সংক্ষেপে (TL;DR নতুন চ্যাটের জন্য)

1. **প্রজেক্ট অবস্থা**: HSC Ultimate অত্যন্ত সমৃদ্ধ, Phase 0-E + বহু Extra
   Phase সম্পন্ন, ৯৪+ রুট, সব ফিচার live-tested
2. **Architecture ঠিক আছে কিনা**: ✅ হ্যাঁ, নিশ্চিত করা হয়েছে — HSC 2028
   ব্যাচ পুরনো/প্রচলিত board exam format (Science group, MCQ+CQ) ব্যবহার
   করবে, নতুন NCTB curriculum reform বাতিল হয়ে গেছে
3. **এই সেশনে bash কাজ করেনি** — তাই কোনো নতুন কোড লেখা হয়নি, শুধু গভীর
   research+planning (২টা নতুন implementation-ready design doc তৈরি হয়েছে)
4. **পরবর্তী পদক্ষেপ**: FSRS Algorithm Upgrade অথবা Board Question Filter
   — দুটোই ready to implement, checkpoint pattern অনুসরণ করে করতে হবে
5. **কখনো ভুলে যাওয়া যাবে না**: student-only, no rate limiting, no zip,
   no unsolicited deploy talk, Prisma v6 pinned (v7 না), pgvector fix
   script migration এর পরে সবসময় চালাতে হবে
