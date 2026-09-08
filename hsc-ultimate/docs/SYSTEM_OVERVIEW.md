# 🎓 HSC Ultimate — সম্পূর্ণ সিস্টেম অডিট

**তারিখ:** ৩০ জুলাই ২০২৬ · সব সংখ্যা কোডবেস স্ক্যান করে যাচাই করা

---

## 📊 এক নজরে

| | সংখ্যা |
|---|---|
| **পেজ** | **৮০** |
| **API রুট** | **১৮৩** |
| **React কম্পোনেন্ট** | ১৫০ |
| **lib মডিউল** | ৮৮ |
| **ডেটাবেজ মডেল** | ৫২ |
| **DB migration** | ২০ |
| **Seed script** | ৩০ |
| **Python রিগ্রেশন টেস্ট** | ২০৬ |
| **Pure-logic assertion** | ১৫৪ |

### কনটেন্ট
| | সংখ্যা |
|---|---|
| Subject | ১৩ |
| Chapter | ৮৯ (**সবগুলোয় MCQ ✅**) |
| Topic | ১৮৫ (৮২টা গুরুত্বপূর্ণ — **৮২/৮২ এ MCQ ✅**) |
| MCQ (HSC প্র্যাকটিস) | **৫৩৯** ✅ DB-তে যাচাইকৃত |
| MCQ (ভর্তি পরীক্ষা) | **২২০** ✅ DB-তে পূর্ণ |
| **MCQ মোট** | **৭৫৯** (লাইভ DB) |
| CQ (সৃজনশীল) | ৬৪ |
| Badge | ১৪ |
| Notes seed ফাইল | ১০ |

---

## 🧩 ফিচার তালিকা (৯টা বিভাগ)

### ১. শেখা ও কনটেন্ট
| ফিচার | রুট |
|---|---|
| Learning Hub — সাবজেক্ট তালিকা | `/learn` |
| চ্যাপ্টার ব্রাউজিং | `/learn/[subjectId]` |
| টপিক ডিটেইল + নোট + ফর্মুলা শিট | `/learn/[subjectId]/[topicId]` |
| Mastery ট্র্যাকিং (শিখছি → অনুশীলন → আয়ত্ত) | টপিক পেজে |
| ফর্মুলা কুইক সার্চ | `/formula-search` |
| Mind Map (AI hierarchical concept tree) | টপিক/PDF এ |
| PDF নোট ডাউনলোড | API |
| সেভ করা টপিক + Bookmark Folder | `/saved` |
| ব্যক্তিগত নোট (per-topic) | টপিক পেজে |
| Peer Note Sharing (নোট শেয়ার + helpful vote) | টপিক পেজে |

### ২. প্র্যাকটিস ও পরীক্ষা
| ফিচার | রুট |
|---|---|
| MCQ Practice (চ্যাপ্টার-ভিত্তিক) | `/practice/[subjectId]/[chapterId]` |
| Pre-test (প্র্যাকটিসের আগে যাচাই) | `/practice/.../pretest` |
| ফলাফল + ব্যাখ্যা + ভুল→ফ্ল্যাশকার্ড | `/practice/result/[attemptId]` |
| Smart / Adaptive Practice (দুর্বল টপিক) | `/adaptive-practice` |
| Timed Drill (Duolingo-স্টাইল speed) | `/drill` |
| মিস্টেক ভল্ট (ভুলের পুনরাবৃত্তি) | `/mistake-vault` |
| CQ Practice + AI মূল্যায়ন | `/cq-practice` |
| হাতে লেখা CQ উত্তর (OCR + AI grading) | CQ runner এ |
| Full Mock Exam (MCQ+CQ, বোর্ড ফরম্যাট) | `/mock-exam` |
| Live Exam (বইয়ের ছবি → AI প্রশ্ন) | `/live-exam` |
| **ভর্তি প্রস্তুতি** (Medical/BUET/DU, নেগেটিভ মার্কিং) | `/admission` |
| Previous-Year Board Question ফিল্টার | প্র্যাকটিসে |
| Option Shuffle + KaTeX গণিত রেন্ডারিং | সব MCQ runner |
| Confidence-Based Answering | প্র্যাকটিসে |
| MCQ কীবোর্ড নেভিগেশন (WCAG) | সব runner |

### ৩. ফ্ল্যাশকার্ড ও রিভিশন
| ফিচার | রুট |
|---|---|
| ডেক ব্যবস্থাপনা | `/flashcards` |
| FSRS স্পেসড রিপিটিশন রিভিউ | `/flashcards/[deckId]/review` |
| AI ফ্ল্যাশকার্ড জেনারেশন (নোট → কার্ড) | ডেক পেজে |
| Cloze Deletion কার্ড (`{{ফাঁকা}}`) | ডেক পেজে |
| Image Occlusion কার্ড | ডেক পেজে |
| Community Shared Deck + Discover | `/flashcards/discover` |
| নোট → ফ্ল্যাশকার্ড কনভার্টার | টপিক পেজে |
| Retention Forecast (পরীক্ষার দিনে কত% মনে থাকবে) | `/analytics` |

### ৪. AI সহায়তা
| ফিচার | রুট |
|---|---|
| AI Doubt Solver (চ্যাট + হিস্ট্রি) | `/ai-tutor` |
| Vision — ছবি থেকে সমাধান | `/ai-tutor` |
| Socratic Mode (Khanmigo-স্টাইল) | `/ai-tutor` |
| Voice Input (কথা বলে প্রশ্ন) | একাধিক পেজে |
| **PDF Chat (RAG)** — নিজের বই আপলোড | `/pdf-chat` |
| PDF Audio Overview (NotebookLM-স্টাইল) | `/pdf-chat/[documentId]` |
| AI Content Moderation (ফোরাম) | ব্যাকগ্রাউন্ড |
| Explain My Mistake | ফলাফল পেজে |

> **Multi-provider fallback:** Groq → Mistral → Cerebras → OpenRouter

### ৫. পরিকল্পনা ও অভ্যাস
| ফিচার | রুট |
|---|---|
| Task Manager | `/planner` |
| Pomodoro Timer + Virtual Study Pet | `/planner` |
| Exam Countdown | `/planner` |
| সাপ্তাহিক ক্লাস রুটিন | `/planner` |
| Auto Study Plan (AI, ৭ দিন) + Agent monitoring | `/planner` |
| মাসিক Calendar View | `/planner` |
| Habit Tracker | `/planner` |
| Exam Day Checklist | `/planner` |
| "আজকের পড়া" (Today's Focus) | `/dashboard` |
| Breathing Exercise (পরীক্ষা-উদ্বেগ) | একাধিক পেজে |

### ৬. গেমিফিকেশন
| ফিচার | রুট |
|---|---|
| XP + Level সিস্টেম | সর্বত্র |
| Streak + Streak Freeze | `/dashboard` |
| ১৪টা Badge | `/badges` |
| Leaderboard + সাপ্তাহিক League (৫ টিয়ার) | `/leaderboard` |
| Activity Heatmap (GitHub-স্টাইল) | `/dashboard` |
| দৈনিক প্রেরণামূলক উক্তি (৩০টা) | `/dashboard` |
| সাপ্তাহিক রিক্যাপ | `/dashboard` |

### ৭. সামাজিক ও প্রতিযোগিতা
| ফিচার | রুট |
|---|---|
| Community Forum (পোস্ট/রিপ্লাই/ভোট/সেরা উত্তর) | `/forum` |
| Study Group (সাপ্তাহিক XP লক্ষ্য) | `/study-group` |
| **Reading Room** (ভার্চুয়াল স্টাডি রুম + লাইভ presence) | `/reading-room` |
| Reading Room Leaderboard | `/reading-room/leaderboard` |
| Quiz Duel (১-বনাম-১) | `/duel` |
| **Quiz Battle** (room code, ৫০ জন পর্যন্ত) | `/quiz-battle` |
| Public Profile শেয়ার | `/u/[slug]` |
| Content Report / Flagging | ফোরামে |

### ৮. বিশ্লেষণ ও ব্যক্তিগত
| ফিচার | রুট |
|---|---|
| Analytics Dashboard (চার্ট + দুর্বল টপিক) | `/analytics` |
| Predicted GPA + লক্ষ্য নির্ধারণ | `/analytics` |
| Misconception প্যাটার্ন বিশ্লেষণ | `/analytics` |
| Report Card PDF এক্সপোর্ট | `/analytics` |
| Global Search (Ctrl+K) | সর্বত্র |
| Notification Center + Push | `/notifications` |
| সাপ্তাহিক ইমেইল ডাইজেস্ট | Resend |
| Settings (প্রোফাইল/থিম/অ্যাক্সেসিবিলিটি) | `/settings` |

### ৯. অ্যাডমিন প্যানেল (১২ পেজ · ২৯ API)
| ফিচার | রুট |
|---|---|
| ড্যাশবোর্ড | `/admin` |
| Subject / Chapter / Topic ব্যবস্থাপনা | `/admin/subjects` |
| প্রশ্ন + CQ ব্যবস্থাপনা (CSV bulk upload) | `/admin/topics/[id]` |
| ইউজার ব্যবস্থাপনা (ban/role) | `/admin/users` |
| Analytics (DAU/WAU/MAU) | `/admin/analytics` |
| Forum Moderation | `/admin/forum` |
| Content Report queue | `/admin/reports` |
| Notification Broadcast | `/admin/notifications` |
| Audit Log | `/admin/audit-log` |
| System Settings (maintenance mode, feature flag) | `/admin/system` |

---

## 🛠️ প্রযুক্তি

**Framework** Next.js 16 (App Router) · TypeScript · React 19
**স্টাইল** Tailwind v4 · shadcn/ui · Framer Motion · **Violet Glass থিম**
**ফন্ট** Anek Bangla (বাংলা+লাতিন variable)
**ডেটাবেজ** Supabase PostgreSQL · Prisma v6 · pgvector (HNSW)
**Auth** NextAuth v5 · bcrypt
**AI** Groq · Mistral · Cerebras · OpenRouter (fallback chain)
**অন্যান্য** Recharts · KaTeX · @react-pdf/renderer · ts-fsrs · Resend · web-push · PWA

---

## ✅ স্বাস্থ্য

| | |
|---|---|
| `tsc --noEmit` | ✅ ০ এরর |
| `pnpm lint` | ✅ ০ warning |
| `pnpm test:logic` | ✅ ১৫৪/১৫৪ |
| `npm run test:seed` | ✅ ৬৮৮ core MCQ + ২২০ admission MCQ = ৯০৮ · ৬৪ CQ · ৮১ topic reference |
| CSS কম্পাইল | ✅ ০ warning |
| লাইভ রেন্ডার (`next dev`) | ✅ HTTP 200 |
| **লাইভ DB E2E** | ✅ **১২/১২ চেক পাস** |
| **Seed স্ক্রিপ্ট চালানো** | ✅ প্রকৃত DB-তে সফল |
| `: any` টাইপ | ০ |
| `@ts-ignore` | ০ |
| `dangerouslySetInnerHTML` | ০ |

**অ্যাক্সেসিবিলিটি:** WCAG AA contrast (সব রঙ সংখ্যাগতভাবে যাচাই) ·
কীবোর্ড নেভিগেশন · Dyslexia ফন্ট · High Contrast · Reduced Motion ·
Text-to-Speech · Skip-to-content

---

## ⚠️ যা বাকি

| অগ্রাধিকার | কাজ |
|---|---|
| ✅ | ~~NEXTAUTH_SECRET + VAPID rotate~~ → **সম্পন্ন** (`pnpm check:secrets` ✅ ১৬/১৬) |
| 🔴 **জরুরি** | **Supabase পাসওয়ার্ড + ৫টা API key rotate** → [নির্দেশিকা](./SECRET_ROTATION.md) |
| ~~🟡~~ | ~~ভর্তি প্রশ্নব্যাংক অসম্পূর্ণ~~ → ✅ **সম্পন্ন** (২২০/২২০, পূর্ণ কভারেজ) |
| 🟡 | চাক্ষুষ QA — `pnpm dev` চালিয়ে থিম চোখে দেখা |
| ⬜ | Phase 9 — Deploy (ব্যবহারকারীর নির্দেশে স্থগিত) |
| ⬜ | Resend ডোমেইন ভেরিফিকেশন (নাহলে শুধু নিজের ইমেইলে মেইল যায়) |

---

## 📁 প্রজেক্ট

**৫৪ MB · ৮৯৭ ফাইল** (`node_modules` ছাড়া)

সবচেয়ে বড় অংশ `design-mockups/` (৩৯ MB) — redesign রেফারেন্স কিট,
কাজ শেষ হলে মুছে ফেললে প্রজেক্ট ~১৫ MB এ নামবে।
