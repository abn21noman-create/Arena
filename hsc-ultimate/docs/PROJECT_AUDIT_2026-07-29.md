# 🔍 HSC Ultimate — সম্পূর্ণ প্রজেক্ট অডিট

**তারিখ:** ২৯ জুলাই ২০২৬
**পরিধি:** পুরো কোডবেস, ডিপেন্ডেন্সি, ডেটাবেজ কানেকশন, অব্যবহৃত ফাইল, সাইজ অপ্টিমাইজেশন

---

## ১. স্বাস্থ্য পরীক্ষার ফলাফল

| চেক | ফলাফল |
|---|---|
| `pnpm install` | ✅ পাস (৪১টা প্যাকেজ, lockfile সিঙ্কে আছে) |
| `prisma generate` | ✅ পাস (Client v6.19.3) |
| `tsc --noEmit` | ✅ **০ এরর** |
| `pnpm lint` (ESLint 9) | ✅ **০ warning, ০ error** |
| `pnpm build` | ⚠️ স্যান্ডবক্সে OOM (কোড সমস্যা নয় — নিচে দেখুন) |
| Supabase TCP | ✅ পোর্ট 6543 ও 5432 দুটোই খোলা |
| Postgres handshake | ⚠️ স্যান্ডবক্স থেকে টাইমআউট (নিচে দেখুন) |

### কোড কোয়ালিটি — চমৎকার
- `: any` টাইপ — **০টা**
- `console.log` — **১টা** (পুরো কোডবেসে)
- `.bak` / `.old` / `.orig` / `~` ফাইল — **০টা**
- খালি ফাইল — **০টা**
- অব্যবহৃত `lib/` মডিউল — **০টা** (৬০+ ফাইল, সব ইমপোর্টেড)
- অব্যবহৃত কম্পোনেন্ট — **১টা** (`components/ui/separator.tsx`, shadcn বেস কম্পোনেন্ট — রাখা উচিত)
- সত্যিকারের TODO/FIXME — **০টা** (যেগুলো ম্যাচ করেছে সব `TaskStatus.TODO` enum)

---

## ২. প্রজেক্টে কী কী আছে

### কোড (স্বাস্থ্যবান)
| অংশ | পরিমাণ | সাইজ |
|---|---|---|
| `app/` — ৮০টা পেজ + ১৮৩টা API রুট | ২৬৪ tsx / ৩১১ ts | 1.7M |
| `components/` — ৩০টা ফিচার ফোল্ডার | | 1.5M |
| `lib/` — ৬০+ বিজনেস লজিক মডিউল | | 1.7M |
| `prisma/` — schema + ৩১টা seed script | ২০টা migration | 1.3M |
| `hooks/`, `types/`, `proxy.ts` | | 32K |

### নন-কোড অ্যাসেট (এখানেই সব ওজন)
| ফোল্ডার | সাইজ | কোডে ব্যবহৃত? |
|---|---|---|
| `design-mockups/` (৭৪টা ফাইল) | **53M** | ❌ শুধু একটা CSS কমেন্টে উল্লেখ |
| `screenshots/mobile-audit/` (৩৩টা PNG) | **12M** | ❌ শুধু স্ক্রিনশট স্ক্রিপ্টের আউটপুট |
| `docs/MASTER_PLAN.md` | 2.5M | ✅ প্রজেক্টের "সংবিধান" |
| `README.md` | 1.5M | ✅ কিন্তু অস্বাভাবিক বড় |
| `scripts/` (২১৬টা `.py` টেস্ট) | 1.6M | ✅ রিগ্রেশন টেস্ট স্যুট |
| `design-refs/` (৯টা competitor স্ক্রিনশট) | 956K | ❌ রিসার্চ রেফারেন্স |

---

## ৩. যা সমস্যা পাওয়া গেছে

### 🔴 ১. `.env` ও `.env.local` প্রজেক্ট ফোল্ডারে আছে এবং শেয়ার হয়েছে
`.gitignore` এ `.env*` আছে (ঠিক আছে), কিন্তু জিপ ফাইলে এগুলো ঢুকে Google Drive-এর পাবলিক লিংকে চলে গেছে। এতে আছে:

`DATABASE_URL` · `DIRECT_URL` · `NEXTAUTH_SECRET` · `GROQ_API_KEY` · `MISTRAL_API_KEY` · `CEREBRAS_API_KEY` · `OPENROUTER_API_KEY` · `RESEND_API_KEY` · `VAPID_PRIVATE_KEY`

**করণীয়:** প্রতিটা provider-এর ড্যাশবোর্ডে গিয়ে key regenerate করুন, Supabase-এর ডাটাবেজ পাসওয়ার্ড রিসেট করুন, `NEXTAUTH_SECRET` নতুন করে জেনারেট করুন (`openssl rand -base64 32`)।

### 🟡 ২. স্যান্ডবক্সে `pnpm build` OOM হয়েছে
Turbopack ৮০টা পেজ + ১৮৩টা রুট কম্পাইল করতে গিয়ে এই স্যান্ডবক্সের মেমরি শেষ করে ফেলেছে (exit 137 = OOM kill)। **এটা কোডের সমস্যা নয়** — `tsc` ও `eslint` দুটোই পুরোপুরি ক্লিন, আর README অনুযায়ী আপনার মেশিনে ১৫৩টা রুট সফলভাবে বিল্ড হয়। আপনার লোকাল মেশিনে `pnpm build` চালিয়ে নিশ্চিত হয়ে নেবেন।

### 🟡 ৩. স্যান্ডবক্স থেকে Supabase handshake টাইমআউট
TCP কানেকশন খুলছে কিন্তু Postgres wire-protocol হ্যান্ডশেক আটকে যাচ্ছে — README-এ বর্ণিত ঠিক একই লক্ষণ (পুরনো প্রজেক্টে যেটা হয়েছিল)। সম্ভবত এই স্যান্ডবক্সের নেটওয়ার্ক রেস্ট্রিকশন, ডাটাবেজের সমস্যা নয়। আপনার মেশিনে `npx prisma studio` চালিয়ে যাচাই করে নেবেন।

### 🟢 ৪. ৩টা অব্যবহৃত ডিপেন্ডেন্সি
`zustand` · `react-hook-form` · `@hookform/resolvers` — পুরো কোডবেসে (`.ts`/`.tsx`/`.css`) একটাও ইমপোর্ট নেই। Tech Stack-এ Zustand লেখা থাকলেও আসলে ব্যবহার হচ্ছে না।

### 🟢 ৫. Next.js স্টার্টার টেমপ্লেটের অবশিষ্ট
`public/next.svg` · `vercel.svg` · `file.svg` · `globe.svg` · `window.svg` — `create-next-app` এর ডিফল্ট, কোথাও ব্যবহৃত হয় না (১৭K)।

### 🟢 ৬. বিল্ড আর্টিফ্যাক্ট কমিট হয়েছে
`tsconfig.tsbuildinfo` (540K) — `.gitignore` এ `*.tsbuildinfo` আছে, তাও ফাইলটা প্রজেক্টে রয়ে গেছে।

### 🟢 ৭. ডকুমেন্টেশন ডুপ্লিকেশন
`.env.local.example` (২৭ লাইন) ও `docs/env.reference.txt` (৩১ লাইন) — একই কাজ করছে।

### 🟢 ৮. README অস্বাভাবিক বড়
১.৫ MB / ১২,০৮৯ লাইন — এর ৯৯% (৯,৭০০ লাইন, ১,৬৬৮টা বুলেট) হলো ডেভেলপমেন্ট হিস্ট্রি। GitHub ১ MB এর বেশি README রেন্ডার করে না।

---

## ৪. যা পরিষ্কার করা হয়েছে

| আইটেম | সাইজ |
|---|---|
| `tsconfig.tsbuildinfo` (বিল্ড আর্টিফ্যাক্ট) | 540K |
| `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` | 17K |
| `docs/env.reference.txt` (ডুপ্লিকেট) | 1.4K |
| `screenshots/` (৩৩টা অডিট PNG, পুনরায় জেনারেট করা যায়) | 12M |
| `design-mockups/` এর ৫৯টা অস্থায়ী QA/verify স্ক্রিনশট | ~15M |
| `.next/` বিল্ড ক্যাশ | 964K |
| **মোট সাশ্রয়** | **~29M** |

### যা ইচ্ছাকৃতভাবে রাখা হয়েছে
- **`design-mockups/react-artifact.html` (18M)** — চলমান Emerald Redesign-এর মূল ৮০-স্ক্রিন রেফারেন্স কিট। এটা এখনো দরকার।
- **`design-mockups/01-…14-*.png` + `artifact-cat-*.png`** — মূল ডিজাইন রেফারেন্স, redesign শেষ না হওয়া পর্যন্ত দরকার।
- **`design-refs/`** — competitor রিসার্চ (10 Minute School, Shikho), MASTER_PLAN থেকে রেফারেন্স করা।
- **`scripts/` এর ২১৬টা Python টেস্ট** — এগুলো আপনার রিগ্রেশন টেস্ট স্যুট, ফিচার ভাঙলে ধরার একমাত্র উপায়।
- **`components/ui/separator.tsx`** — shadcn বেস কম্পোনেন্ট।
- **`prisma/` এর ৩১টা seed script** — সব `package.json` স্ক্রিপ্টে রেজিস্টার্ড।
- **`preview.html`** — সাইডবার ডিজাইন রেফারেন্স হিসেবে কোড কমেন্টে উল্লেখিত।

---

## ৫. দ্বিতীয় রাউন্ড — যা করা হয়েছে

### A. ৩টা অব্যবহৃত npm প্যাকেজ সরানো ✅
`zustand` · `react-hook-form` · `@hookform/resolvers` — `pnpm remove` করা হয়েছে।
ডিপেন্ডেন্সি ৩০ → **২৭টা**। `README.md` এর Tech Stack থেকেও "State: Zustand" লাইনটা
সংশোধন করা হয়েছে (প্রজেক্ট আসলে RSC + `useState` ব্যবহার করে, আলাদা global state
library নেই)।

### B. README ভাগ করা ✅ — **১.৫ MB → ১০৮ KB** (৯৩% ছোট)

| নতুন ফাইল | সাইজ | কী আছে |
|---|---|---|
| `README.md` | **108 KB** | পরিচিতি, এক-নজরে টেবিল, ফেজ তালিকা (কোলাপসিবল), সেটআপ, স্ট্রাকচার, AI/DB, Tech Stack |
| `docs/CHANGELOG.md` | 493 KB | সাম্প্রতিক ফিচার-বাই-ফিচার হিস্ট্রি |
| `docs/CHANGELOG_ARCHIVE.md` | 486 KB | পুরোনো এন্ট্রি (Phase 0 থেকে) |
| `docs/ROADMAP_ARCHIVE.md` | 172 KB | সম্পূর্ণ চেকলিস্ট রোডম্যাপ |

**যা করা হয়েছে:**
- ৯,৪৫৭ লাইনের "যা যা তৈরি ও লাইভ টেস্ট" হিস্ট্রি → `CHANGELOG.md` + `CHANGELOG_ARCHIVE.md`
  (দুটোই ৫০০KB এর নিচে রাখা হয়েছে যাতে GitHub রেন্ডার করতে পারে)
- ১,৭৭৬ লাইনের চেকলিস্ট রোডম্যাপ → `ROADMAP_ARCHIVE.md`
- ২৪২টা ফেজ-বুলেটের দীর্ঘ বর্ণনা সংক্ষিপ্ত করে শিরোনাম+এক-লাইন সারাংশে নামানো,
  `<details>` ট্যাগে কোলাপসিবল করা
- সব ফাইলের মধ্যে ক্রস-লিংক যোগ (যাচাই করা হয়েছে — **০টা ভাঙা লিংক**)
- উপরে একটা "এক নজরে" টেবিল যোগ (৮০ পেজ · ১৮৩ API · ৬০+ lib · ২০ migration · ২১৬ টেস্ট)

### যাচাই
`tsc --noEmit` ✅ ০ এরর · `pnpm lint` ✅ ০ warning · সব internal লিংক ✅ কাজ করছে

---

## ৬. এখনো বাকি (আপনার সিদ্ধান্ত)

| # | কাজ | সাশ্রয় / প্রভাব |
|---|---|---|
| 🔴 | **সব API key ও DB পাসওয়ার্ড rotate করা** | নিরাপত্তা — সবচেয়ে জরুরি |
| ⬜ | Redesign শেষ হলে `design-mockups/` মুছে ফেলা | ৩৯M (প্রজেক্ট ১৪M এ নামবে) |
| ⬜ | `docs/MASTER_PLAN.md` (2.5M) একইভাবে ভাগ করা | GitHub-এ রেন্ডার হবে |
| ⬜ | লোকাল মেশিনে `pnpm build` চালিয়ে নিশ্চিত হওয়া | স্যান্ডবক্সে OOM হয়েছিল |

---

*অডিট সম্পন্ন — কোডবেস স্বাস্থ্যবান, কোনো কাঠামোগত সমস্যা নেই।*

---

## ৭. Emerald Brand Refresh — বাস্তবায়ন (২০২৬-০৭-৩০)

ব্যবহারকারীর নির্দেশ: *"Ami design jate full premium hoi… full premium chai"* এবং
module রঙের ব্যাপারে *"tumi tomar moto kore dao"*।

### নকশা-নীতি
মকআপ (`react-artifact.html`) বিশ্লেষণে দেখা গেছে সেখানে **কোনো per-module
categorical রঙ নেই** — সব `emerald-400/500`। কিন্তু ২০টা মডিউল ও ২৫টা পেজ
হুবহু একই সবুজ করলে নেভিগেশন-পরিচিতি হারায়। তাই **emerald পরিবারের ভেতরে
tonal ramp** ব্যবহার করা হয়েছে (emerald ↔ teal ↔ green, শেড ৬০০–৯০০):
ব্র্যান্ড consistency + পেজভেদে গভীরতার ভিন্নতা। গাঢ় প্রান্ত = উঁচু-চাপের
পেজ (Admission, Mock Exam, Quiz Battle), হালকা প্রান্ত = দৈনন্দিন পেজ।

### রাউন্ড ১ — মূল ব্র্যান্ড সারফেস
| আইটেম | পরিমাণ |
|---|---|
| Hero banner গ্রেডিয়েন্ট | ২২টা পেজ |
| Module tile (`lib/nav-modules.ts`) | ২১টা |
| Landing page ফিচার কার্ড | ৭টা |
| বিচ্ছিন্ন brand-signal | ৯টা |
| glass-hero orb (cyan → teal) | ২টা |

### রাউন্ড ২ — গভীর সারফেস
| আইটেম | পরিবর্তন |
|---|---|
| **Aurora ব্যাকগ্রাউন্ড blob** | purple (hue 290/300) → emerald 162.5; blue (230) → teal 195 — ৪টা stop (`.aurora-bg`, `.aurora-bg-contained`) |
| **Chart টোকেন** | `--chart-2…5` সম্পূর্ণ ধূসর ছিল → emerald tonal ramp (light + dark) |
| **PIE_COLORS** | প্রথম স্লাইস emerald দিয়ে অ্যাংকর, বাকিগুলো ব্র্যান্ড-সংলগ্ন থেকে দূরের hue তে |
| **ডিফল্ট `colorHex`** | ৬টা জায়গায় `#6366f1` (ইন্ডিগো) → `#047857` — নতুন subject/bookmark folder/routine slot এর ডিফল্ট |
| **Calendar** | LOW priority + study-plan ইভেন্ট → teal/emerald |
| **Forum ক্যাটাগরি** | QUESTION/DISCUSSION/NOTE_SHARE blue/purple → emerald→teal→cyan ramp |
| **Admin panel** | nav কার্ড ৩টা + engagement স্ট্যাট ৪টা + audit-log badge ২টা |
| **Analytics** | ৪টা section আইকন → emerald ramp; misconception "কত বার ভুল" fuchsia → rose (semantic) |

### WCAG যাচাই
প্রতিটা নতুন রঙ প্রয়োগের **আগে** সংখ্যা দিয়ে contrast হিসাব করা হয়েছে:
- সব hero banner সাদা টেক্সটে **≥ ৫.৪৮:১** (AA পাস) — ৭০০+ শেডে সীমাবদ্ধ রাখা হয়েছে
- Cloze badge প্রথমে teal-600 এ **৩.৭৪:১** এ ফেল করেছিল (১০px ছোট টেক্সট) → teal-700/teal-300 এ ঠিক (৫.৪৭:১ / ১২.২৫:১)
- Forum tag pill তিনটাই **≥ ৫.২১:১** উভয় মোডে
- আইকন/large-text ≥ ৩:১ (WCAG non-text) নিশ্চিত

### যা ইচ্ছাকৃতভাবে অপরিবর্তিত
- **Subject `colorHex`** (১৩টা) — বিষয় চেনার categorical পরিচয়
- **Semantic রঙ** — সবুজ=সঠিক, লাল=ভুল, কমলা=streak আগুন, Alert এর info/warning/error/success
- **League tier** — ব্রোঞ্জ/সিলভার/গোল্ড ধাতুর নাম বহন করে, রঙ বদলালে অর্থ ভাঙে
- **Avatar gradient** (hash-based ৬টা) — ইউজার আলাদা করার জন্য ইচ্ছাকৃত বৈচিত্র্য
- **Breathing exercise** sky→emerald — শান্তি/বাতাসের semantic ইঙ্গিত
- **GPA গ্রেড ব্যাজ** — গ্রেড স্কেল
- **Quiz Duel "ড্র" নীল** — জয়(সবুজ)/হার(লাল) থেকে নিরপেক্ষতা বোঝায়
- **FSRS রেটিং বাটন** — Again/Hard/Good/Easy স্কেল

### যাচাই
`tsc --noEmit` ✅ ০ এরর · `pnpm lint` ✅ ০ warning (প্রতি রাউন্ডে)
ভিজ্যুয়াল রেফারেন্স: `design-mockups/emerald-preview.html`

### বাকি (পরের ধাপ)
লাইভ ব্রাউজার QA — dev server চালিয়ে প্রকৃত পেজে light+dark উভয় মোডে
স্ক্রিনশট নিয়ে যাচাই (এই স্যান্ডবক্সে `next build` OOM হয় বলে করা যায়নি)।

### রাউন্ড ৩ — Micro-interaction ও Glow

মকআপের "premium dark showcase" অনুভূতির শেষ স্তর — hover অবস্থায় emerald আভা।

| আইটেম | পরিবর্তন |
|---|---|
| **`.hover-lift:hover`** | established দুই-স্তরের neutral shadow অক্ষত রেখে **তৃতীয় একটা emerald ambient glow স্তর** যোগ (`--primary` থেকে derive করা, তাই Accent Color পাল্টালে স্বয়ংক্রিয়ভাবে মানায়)। border-color আরও স্পষ্ট (transparent 55% → 45%) |
| **`.group:hover .icon-pop`** | আইকন টাইলে emerald halo — hover এ টাইলটা "জ্বলে ওঠে"। সাথে `.icon-pop` এর transition এ `box-shadow` যোগ (আগে শুধু `transform` ছিল, তাই glow লাফিয়ে আসত) |
| **`.glass-hero-card:hover`** | **একটা প্রকৃত অসম্পূর্ণতা ঠিক করা হয়েছে** — `box-shadow` transition ঘোষণা করা থাকলেও hover state এ কোনো shadow সেট করা ছিল না, অর্থাৎ ঘোষণাটা নিষ্ক্রিয় ছিল। এখন hero কার্ডের আকার অনুযায়ী গভীর emerald glow |

**clickable-কার্ড অডিট:** সব `<Link><Card>` ও `onClick` কার্ড স্ক্যান করে দেখা
গেছে `hover-lift` কভারেজ ইতিমধ্যেই সম্পূর্ণ — একমাত্র ব্যতিক্রম admin এর
pending-report alert কার্ড, যেটার নিজস্ব `hover:bg-amber-500/10` আছে
(ইচ্ছাকৃত, semantic alert affordance)। **নতুন কোনো `hover-lift` যোগ করার
দরকার হয়নি** — negative result।

**Reduced-motion:** `prefers-reduced-motion` ব্লকে transform বন্ধ থাকে কিন্তু
glow (রঙ, motion নয়) থাকে — WCAG দৃষ্টিতে এটাই সঠিক আচরণ, তাই অপরিবর্তিত।

### CSS কম্পাইল যাচাই (নতুন)
`next build` স্যান্ডবক্সে OOM হওয়ায় সরাসরি PostCSS + `@tailwindcss/postcss`
দিয়ে `app/globals.css` কম্পাইল করে যাচাই করা হয়েছে:
- ✅ **২৩০,১০৪ বাইট আউটপুট, ০ warning** — CSS সিনট্যাক্স বৈধ
- ✅ কম্পাইল করা আউটপুটে ১০/১০ নতুন মান উপস্থিত (glow স্তর, aurora hue, chart ramp, primary)
- ✅ পুরোনো purple/blue aurora hue (290/300/230) **সম্পূর্ণ অনুপস্থিত**
- ✅ ব্রেস ব্যালান্স ৭৩/৭৩

`tsc --noEmit` ✅ ০ এরর · `pnpm lint` ✅ ০ warning

### রাউন্ড ৪ — টাইপোগ্রাফি, Radius যাচাই ও Semantic অডিট

#### টাইপোগ্রাফি — mockup স্পেক প্রয়োগ
মকআপের Design Tokens প্যানেলে **"DISPLAY / HEADING • Geist • 600-700 • -0.03em"**
স্পেক আছে। কোডে ফন্ট-ফ্যামিলি (`Baloo Da 2`) প্রয়োগ হচ্ছিল কিন্তু **tracking
একেবারেই ছিল না** — premium display টাইপোগ্রাফির মূল বৈশিষ্ট্যই হলো টাইট
letter-spacing, তাই হেডিং mockup এর তুলনায় ঢিলেঢালা দেখাচ্ছিল।

`h1..h4` এ `letter-spacing: -0.02em` যোগ করা হয়েছে (globals.css এর
established `@apply font-heading` ব্লকেই)।

> **কেন -0.03em নয়:** mockup এর স্পেক ল্যাটিন Geist ফন্টের জন্য। বাংলায়
> যুক্তাক্ষর ও মাত্রা (উপরের আনুভূমিক রেখা) থাকে — অতিরিক্ত negative
> tracking এ অক্ষর জোড়া লেগে পড়া কঠিন হয়। -0.02em premium অনুভূতি দেয়
> কিন্তু বাংলা লিপি অক্ষত রাখে, এবং established `tracking-tight`
> (-0.025em) ব্যবহারকারী দুটো হেডিং এর কাছাকাছি থাকে।

#### 🐛 অ্যাক্সেসিবিলিটি সংঘাত ধরা পড়েছে ও ঠিক করা হয়েছে
নতুন `h1..h4` selector টা `html.dyslexia-font body` এর চেয়ে **বেশি
নির্দিষ্ট** — ফলে Dyslexia মোড চালু করলেও হেডিংগুলো টাইট (-0.02em) থেকে
যেত, অথচ dyslexia ইউজারদের জন্য অক্ষরের মধ্যে **বেশি** ফাঁক দরকার (মোডটার
মূল উদ্দেশ্যই সেটা)। `html.dyslexia-font h1..h4 { letter-spacing: 0.02em }`
override যোগ করে অ্যাক্সেসিবিলিটি উদ্দেশ্য পুনরুদ্ধার করা হয়েছে।
কম্পাইল করা CSS এ cascade ক্রম যাচাই করা হয়েছে (override পরে আসছে ✅)।

#### Radius — যাচাই, পরিবর্তন লাগেনি
mockup স্পেক: phone 32px · **card 20px** · pill 999px।
হিসাব করে দেখা গেছে `--radius: 0.893rem` = 14.29px → `rounded-xl`
(`--radius × 1.4`) = **ঠিক 20.0px** — Foundation ধাপে সঠিকভাবেই সেট করা
হয়েছিল। Hero banner `rounded-2xl` (25.7px) ব্যবহার করে, যা বড় সারফেসে
সামান্য বেশি radius — স্বাভাবিক ডিজাইন-নীতি, ইচ্ছাকৃতভাবে অপরিবর্তিত।
**Negative result — কোনো কোড পরিবর্তন লাগেনি।**

#### 🐛 Drill Runner flash — ব্র্যান্ড ফিক্স (semantic ফাঁদ এড়ানো)
Timed Drill এ উত্তর নির্বাচনের flash `bg-blue-50` ছিল — ব্র্যান্ড প্যালেটের
বাইরে। **প্রথমে emerald (সঠিক) + rose (ভুল) করতে গিয়েছিলাম, কিন্তু কোড
পড়ে ধরা পড়ে সেটা ভুল হতো** — কমেন্টে স্পষ্ট লেখা আছে এই flash
ইচ্ছাকৃতভাবে neutral: নিরাপত্তার জন্য সঠিক উত্তর submit না হওয়া পর্যন্ত
ক্লায়েন্টে পাঠানো হয় না, তাই flash মানে শুধু *"উত্তর গৃহীত হয়েছে"*,
সঠিক/ভুল নয়। সবুজ করলে ইউজার ভুল উত্তরেও "সঠিক" সংকেত পেত।

সমাধান: **semantic-নিরপেক্ষ teal** (`bg-teal-50 dark:bg-teal-950/30`) —
ব্র্যান্ড-সংলগ্ন কিন্তু established "সবুজ=সঠিক, লাল=ভুল" নিয়মের সাথে
গুলিয়ে যায় না। সাথে stale কমেন্টও sync করা হয়েছে ("নীল ফ্ল্যাশ" → "teal
ফ্ল্যাশ", এবং state ভ্যালু `"correct"` এর প্রকৃত অর্থ স্পষ্ট করা হয়েছে)।

#### চূড়ান্ত রঙ পরিসংখ্যান
| শ্রেণি | সংখ্যা | মন্তব্য |
|---|---|---|
| টোকেন-ভিত্তিক (`--primary` ইত্যাদি) | **১,৪৯১** | Accent Color পাল্টালে স্বয়ংক্রিয়ভাবে মানায় |
| emerald / teal / green | **৪৮১** | ব্র্যান্ড পরিবার |
| semantic (red/amber/rose/orange) | ~২৯১ | সঠিক/ভুল/সতর্কতা — ইচ্ছাকৃত |
| অন্য hue | **৩৫** | প্রতিটা ম্যানুয়ালি যাচাই করা |

বাকি ৩৫টার প্রতিটা পরীক্ষা করে বৈধ প্রমাণিত: GPA গ্রেড স্কেল (A+→F),
FSRS রেটিং স্কেল (আবার/কঠিন/মোটামুটি/সহজ), ভর্তি পরীক্ষার পরিচিতি
(Medical/DU/BUET), avatar hash-gradient, Alert এর `info` variant,
breathing exercise এর sky (শান্তির semantic), Quiz Duel এর "ড্র" নীল
(জয়=সবুজ/হার=লাল থেকে নিরপেক্ষতা), forum NOTE_SHARE এর cyan (emerald
ramp এরই অংশ)।

**✅ Emerald Brand Refresh সম্পূর্ণ** — কোডবেসে ছড়ানোর কাজ শেষ।

#### যাচাই
CSS কম্পাইল ✅ ২৩০,২০৪ বাইট · ০ warning · `tsc` ✅ ০ এরর · `lint` ✅ ০ warning

---

## ৮. MASTER_PLAN বিভাজন ও চূড়ান্ত ঝুঁকি স্ক্যান (২০২৬-০৭-৩০)

### MASTER_PLAN.md ভাগ করা — ২.৫ MB → ১০৬ KB

`MASTER_PLAN.md` ছিল ২৯,২৮৭ লাইন / ২.৫ MB — README এর মতোই GitHub এ
রেন্ডার হতো না। বিশ্লেষণে দেখা গেছে ফাইলটার দুটো আলাদা ভূমিকা মিশে ছিল:
**মূল পরিকল্পনা** (অংশ ০–৯, ~১,০০০ লাইন) এবং **ধাপে-ধাপে বাস্তবায়ন লগ**
(~২৮,২০০ লাইন)। ভূমিকা অনুযায়ী ভাগ করা হয়েছে:

| ফাইল | সাইজ | ভূমিকা |
|---|---|---|
| `MASTER_PLAN.md` | **106 KB** | অংশ ০–৯ — প্রজেক্টের "সংবিধান" |
| `MASTER_PLAN_LOG_1.md` | 90 KB | Deep Research → Phase B |
| `MASTER_PLAN_LOG_2.md` | 828 KB | Phase C → Phase J |
| `MASTER_PLAN_LOG_3.md` | 762 KB | UI/UX ও ফিচার সম্প্রসারণ |
| `MASTER_PLAN_LOG_4.md` | 718 KB | Race condition অডিট → Emerald Refresh |

প্রতিটা লগ ফাইলে আগের/পরের/মূল ফাইলের নেভিগেশন লিংক যোগ করা হয়েছে।

**কনটেন্ট অখণ্ডতা যাচাই (সবচেয়ে গুরুত্বপূর্ণ ধাপ):**
- ✅ `## ` হেডিং: মূল **২৪৫** → ভাগ করার পর **২৪৫** (০ হারানো, ০ বাড়তি)
- ✅ কনটেন্ট লাইন বাই-লাইন তুলনা: **০ লাইন হারিয়েছে**
- ✅ সব internal লিংক (README + ১৭টা docs ফাইল) যাচাই — **০ ভাঙা লিংক**
- ✅ **কোনো markdown ফাইল আর ১ MB ছাড়ায় না** — সব GitHub এ রেন্ডার হবে

### চূড়ান্ত ঝুঁকি স্ক্যান — negative result
| চেক | ফল |
|---|---|
| `@ts-ignore` / `@ts-expect-error` | **০টা** |
| খালি `catch {}` | **০টা** |
| `dangerouslySetInnerHTML` (XSS ভেক্টর) | **০টা** |
| Floating promise (unawaited DB write) | ০টা — grep এ ৪টা ম্যাচ হলেও প্রতিটা `prisma.$transaction([...])` array এর ভেতরে, যা সঠিক প্যাটার্ন (false positive) |
| `eslint-disable` | ১৬টা — সবগুলো `react-hooks/exhaustive-deps` (১২) ও `@next/next/no-img-element` (৪), স্বাভাবিক |

### সামগ্রিক অবস্থা
- প্রজেক্ট: **৫৩ MB · ৮৯২ ফাইল** (শুরুতে ছিল ৭৯ MB · ১,০০৩ ফাইল)
- `tsc --noEmit` ✅ ০ এরর · `pnpm lint` ✅ ০ warning · CSS কম্পাইল ✅ ০ warning

---

## ৯. 🐛 প্রকৃত বাগ আবিষ্কার — SM-2 Interval Overflow (২০২৬-০৭-৩০)

স্ট্যাটিক বিশ্লেষণে (tsc/lint/grep) কোডবেস পরিষ্কার দেখাচ্ছিল, তাই
pure-logic মডিউলগুলো **সরাসরি execute** করে edge case যাচাই করা হয়েছে।
এতেই একটা প্রকৃত production বাগ ধরা পড়েছে যা কোনো স্ট্যাটিক টুল ধরতে পারত না।

### সমস্যা
`lib/spaced-repetition.ts` এর SM-2 অ্যালগরিদমে interval চক্রবৃদ্ধি হারে
বাড়ে (`intervalDays × easeFactor`)। কোনো উপরের সীমা ছিল না। ফলে:

| রিভিউ # | intervalDays | dueDate |
|---|---|---|
| ১২ | ৫,৫১,০৪৮ | ✅ |
| ১৫ | ৩,০২,১৬,১৭০ | ✅ |
| **১৬** | **১২,০৮,৬৪,৬৮০** | ❌ **Invalid Date** |

JavaScript এর `Date` সীমা ±১০ কোটি দিন (ECMA-262)। ১৬তম রিভিউয়ে
`dueDate.setDate(now + 120864680)` সেই সীমা ছাড়িয়ে **Invalid Date**
তৈরি করত।

### প্রভাব (কেন এটা গুরুতর)
`app/api/flashcards/[cardId]/review/route.ts` এ এই মান সরাসরি Prisma এর
**non-null `DateTime`** কলামে লেখা হয় (লাইন ১৩৭)। Invalid Date লিখতে গেলে
transaction throw করত — অর্থাৎ **ইউজার ওই কার্ডটা আর কখনো রিভিউ করতে
পারত না**, প্রতিবার 500 error পেত। কার্ডটা স্থায়ীভাবে আটকে যেত।

SM-2 path এখনো **লাইভ** — FSRS migration এর আগের সব কার্ড
(`srsAlgorithm !== "FSRS"`) এই কোডপথ ব্যবহার করে।

### সমাধান
```ts
export const MAX_INTERVAL_DAYS = 18250; // ~৫০ বছর
intervalDays = Math.min(intervalDays, MAX_INTERVAL_DAYS);
```
Anki একই কারণে ডিফল্ট max interval ৩৬,৫০০ দিন রাখে। HSC প্রস্তুতির
প্রেক্ষাপটে ৫০ বছরের বেশি দূরের শিডিউলের কোনো ব্যবহারিক অর্থ নেই, আর
এটা Date সীমা থেকে বহু নিরাপদ দূরত্বে।

### FSRS যাচাই — নিরাপদ
২০০ রিভিউ চালিয়ে দেখা গেছে `ts-fsrs` লাইব্রেরির নিজস্ব ক্যাপ আছে
(সর্বোচ্চ scheduledDays ৮,০৭৭) — **একই দুর্বলতা নেই**।

> **আলাদা পর্যবেক্ষণ:** `lastReviewed` ভবিষ্যতের তারিখ হলে `ts-fsrs`
> `FSRSValidationError` থ্রো করে। তবে ট্রেস করে দেখা গেছে `lastReviewed`
> সবসময় সার্ভার-সাইড `new Date()` — কখনো ইউজার-নিয়ন্ত্রিত নয়, আর
> `retention-forecast.ts` শুধু stability পড়ে, scheduler কল করে না।
> **বর্তমানে পৌঁছানো যায় না**, তাই ইচ্ছাকৃতভাবে অপরিবর্তিত রাখা হলো।

### নতুন রিগ্রেশন টেস্ট — `pnpm test:logic`
`scripts/test-pure-logic.ts` — **৫০টা assertion**, DB/সার্ভার ছাড়াই চলে
(প্রজেক্টের বাকি ২১৬টা Python টেস্টের পরিপূরক, যেগুলোর লাইভ সার্ভার লাগে)।

কভারেজ: GPA গ্রেড সীমানা (১৪টা সীমানা মান) · GPA ৪র্থ-বিষয় বোনাস ও
Fail নিয়ম · **SM-2 overflow গার্ড** · ease-factor floor · ২০০০ মিশ্র
রিভিউ fuzz · FSRS ২০০ রিভিউ · ইনপুট ভ্যালিডেশন · Image Occlusion।

**টেস্টটা vacuous নয় তা প্রমাণ করা হয়েছে:** ফিক্স সাময়িকভাবে সরিয়ে
যাচাই করা হয়েছে — ঠিক ২টা assertion ব্যর্থ হয় (`ভাঙন rep=16`), ফিক্স
ফিরিয়ে দিলে ৫০/৫০ পাস।

### Build সম্পর্কে চূড়ান্ত সিদ্ধান্ত
স্যান্ডবক্সে `next build` চালানো **অসম্ভব** প্রমাণিত — মোট RAM ২ GB,
swap নেই, `/tmp` নিজেই RAM-backed tmpfs, root অ্যাক্সেস নেই।
`NODE_OPTIONS=--max-old-space-size=1400` দিয়েও ২৪০ সেকেন্ডে মেমরি
২০ MB এ নেমে আসে। এটা পরিবেশের সীমাবদ্ধতা, কোডের সমস্যা নয় —
`tsc`, `eslint` ও Tailwind CSS কম্পাইল তিনটাই স্বাধীনভাবে ক্লিন।

### যাচাই
`tsc` ✅ ০ এরর · `lint` ✅ ০ warning · `pnpm test:logic` ✅ ৫০/৫০

---

## ১০. 🐛 Admission Prep — মার্কিং স্কিম ভুল (২০২৬-০৭-৩০)

Pure-logic harness সম্প্রসারণ করে `lib/admission.ts`, `lib/league.ts` ও
`lib/item-difficulty.ts` execute করার সময় ভর্তি পরীক্ষার কনফিগে **দুটো
বাস্তব ভুল** ধরা পড়েছে। ওয়েব সার্চ দিয়ে ২০২৫-২৬ সেশনের অফিসিয়াল
circular এর বিরুদ্ধে যাচাই করে নিশ্চিত করা হয়েছে।

### বাগ ১ — Medical বিষয় বণ্টন ভুল (প্রশ্ন বাছাইকে প্রভাবিত করত)

| বিষয় | কোডে ছিল | অফিসিয়াল ২০২৫-২৬ |
|---|---|---|
| জীববিজ্ঞান | 30 | 30 ✅ |
| রসায়ন | 25 | 25 ✅ |
| **পদার্থবিজ্ঞান** | **20** ❌ | **15** |
| ইংরেজি | 15 | 15 ✅ |
| **সাধারণ জ্ঞান** | **10** ❌ | **15** (মানবিক গুণাবলী যুক্ত হয়েছে) |
| **মোট** | **105** ❌ | **100** |

চারটা স্বাধীন সূত্র একমত (প্রথম আলো, ঢাকা টাইমস, admissionbd.org,
academicschoolbd.com)। ২০২৫-২৬ সেশনে "মানবিক গুণাবলী ও প্রবণতা" যুক্ত
হয়ে GK অংশ ১০ → ১৫ হয়েছে (এ কারণেই সময় ৬০ → ৭৫ মিনিট হয়েছে, যা কোডে
সঠিকভাবেই ছিল)।

**প্রভাব:** `app/api/admission/start/route.ts` এই কনফিগ দিয়েই প্রতিটা
সাবজেক্ট থেকে প্রশ্ন বাছাই করে (লাইন ৩৬-৫৫)। ফলে ছাত্ররা **ভুল অনুপাতে**
প্র্যাকটিস করত — পদার্থবিজ্ঞানে বেশি, সাধারণ জ্ঞানে কম। মোট ১০৫ হওয়ায়
সিমুলেশনের পূর্ণমানও বাস্তবের সাথে মিলত না।

### বাগ ২ — DU 'ক' ইউনিটে MCQ পাস মার্ক অনুপস্থিত

`passMark: null` ছিল, অর্থাৎ ফলাফলে পাস/ফেল দেখানোই হতো না। কিন্তু
অফিসিয়াল নিয়ম: **MCQ অংশে ৬০ এর মধ্যে ২৪ পেতেই হবে** — না পেলে লিখিত
উত্তরপত্র মূল্যায়নই করা হয় না। যেহেতু এই মোড শুধু MCQ অংশ সিমুলেট করে,
MCQ পাস মার্কই প্রযোজ্য। `passMark: 24` সেট করা হয়েছে।

### যা ইচ্ছাকৃতভাবে অপরিবর্তিত
- **BUET `negativeMarkPerWrong: 0`** — সঠিক। ২০২৫-২৬ থেকে বুয়েটের মূল
  পরীক্ষা সম্পূর্ণ লিখিত (MCQ প্রিলি বাতিল), তাই এটা "concept practice"
  মোড — কোডের disclaimer এ এটা স্পষ্ট বলা আছে।
- **DU/Medical `negativeMarkPerWrong: 0.25`** — দুটোই যাচাই করে সঠিক।

### League ও Item-difficulty — negative result
`getCurrentWeekStart()` ৮টা ক্যালেন্ডার edge case এ যাচাই (মাস/বছর
সীমানা, লিপ ইয়ার ২০২৮-০২-২৯, শনিবার ২৩:৫৯, UTC সময়-অংশ শূন্যকরণ) —
**সব সঠিক**। Tier সিঁড়ির promotion XP ক্রমবর্ধমান, DIAMOND এ `null`।
`sortByTargetDifficulty` আইটেম হারায় না, মূল array মিউটেট করে না,
ক্যালিব্রেট-না-হওয়া প্রশ্ন মাঝামাঝি অগ্রাধিকারে রাখে — **সব সঠিক**।

### টেস্ট স্যুট সম্প্রসারণ — ৫০ → **১০৪ assertion**
`pnpm test:logic` এ যুক্ত হয়েছে: ভর্তি পরীক্ষার কনফিগ যাচাই (তিনটা
পরীক্ষার প্রশ্নসংখ্যা/নেগেটিভ/পাস মার্ক), নেগেটিভ মার্কিং edge case
(সব ভুল → ঋণাত্মক স্কোর, শতাংশ ০ এ ক্ল্যাম্প, পাস সীমানার ঠিক দুই পাশে),
সপ্তাহ সীমানা, tier সিঁড়ি, difficulty sorting।

**vacuous নয় তা প্রমাণিত:** পুরোনো ভুল মান ফিরিয়ে দিলে ঠিক **৬টা
assertion ব্যর্থ** হয় (মোট ১০৫ ধরা পড়ে সহ), ফিক্স দিলে ১০৪/১০৪ পাস।

### যাচাই
`tsc` ✅ ০ এরর · `lint` ✅ ০ warning (০টা `any`) · `pnpm test:logic` ✅ ১০৪/১০৪

---

## ১১. XP/Level, Shuffle ও Pet লজিক যাচাই (২০২৬-০৭-৩০)

`lib/gamification.ts`, `lib/mock-exam.ts`, `lib/study-pet.ts` ও
`lib/formula-search.ts` execute করে যাচাই — টেস্ট স্যুট **১০৪ → ১৫৪
assertion**।

### 🛡️ `calculateLevel(Infinity)` — অসীম লুপ (ডিফেন্সিভ ফিক্স)
`while (xpRequiredForLevel(level + 1) <= xp)` শর্তটা `xp = Infinity` এ
**কখনো false হয় না** — ফাংশনটা চিরকাল লুপ করে, পুরো Node.js প্রসেস
হ্যাং করে। টেস্ট harness নিজেই ৬০০ সেকেন্ড আটকে গিয়ে এটা ধরিয়ে দেয়।

> **সততার সাথে severity:** এটা **বর্তমানে পৌঁছানো যায় না**। সব কল সাইট
> (`dashboard/page.tsx`, `u/[slug]/page.tsx`, `analytics.ts` ×২,
> `gamification.ts` ×২) `user.xp` পাঠায়, যা Prisma/Postgres এ `Int` —
> Infinity/NaN সংরক্ষণ করাই অসম্ভব। Int সর্বোচ্চ মান (২,১৪৭,৪৮৩,৬৪৭)
> এও লুপ ৬,৫৫৪ iteration এ, ১ms এ শেষ হয়। তাই এটা **প্রকৃত production
> বাগ নয়, একটা latent landmine** — কিন্তু একটা `isFinite` চেকের খরচ
> শূন্য আর একটা সার্ভার-হ্যাং এর ক্ষতি অসীম, তাই গার্ড যোগ করা হলো।

### 🐛 `getLevelProgress().progressPct` — UI তে অবৈধ মান
এই মান সরাসরি progress-bar এর width হিসেবে যায় (Dashboard, Public
Profile, Analytics)। ভাগফলে কোনো ক্ল্যাম্প ছিল না:

| ইনপুট | আগে | এখন |
|---|---|---|
| xp = -100 | **-10%** ❌ (ভাঙা CSS bar) | 0% ✅ |
| xp = Infinity | **Infinity** ❌ | 0% ✅ |
| xp = NaN | **NaN** ❌ | 0% ✅ |

ঋণাত্মক XP তাত্ত্বিকভাবে সম্ভব (`awardXp` এ ঋণাত্মক ডেল্টা পাঠালে), তাই
এটা আগেরটার চেয়ে বেশি বাস্তবসম্মত। ০-১০০ এ ক্ল্যাম্প + non-finite এ ০।

### ✅ যা যাচাই করে সঠিক পেয়েছি — negative result
- **`shuffleOptions` বণ্টন সুষম** — ৪,০০০ শাফলে প্রতি আইটেম প্রতি পজিশনে
  ৯৩২-১,০৪১ বার (আদর্শ ১,০০০)। Fisher-Yates বাস্তবায়নে **কোনো bias নেই**
  (একটা সাধারণ ভুল হলো `Math.random() * length` ব্যবহার, যা bias তৈরি
  করে — এখানে সঠিকভাবে `* (i + 1)` আছে)। আইটেম হারায় না, মূল array
  মিউটেট করে না।
- **`pickRandom`** — n > pool size এ ক্ল্যাম্প করে, ডুপ্লিকেট দেয় না,
  খালি pool এ ক্র্যাশ করে না, মূল array অক্ষত।
- **`calculatePercentage(0, 0)`** — ডিভাইড-বাই-জিরো গার্ড আছে ✅
- **XP↔Level round-trip** — ১-৬০ সব লেভেলে নিখুঁত, monotonic
- **Mock exam কনফিগ** — বাস্তব HSC ফরম্যাটের সাথে মেলে (MCQ ২৫ + CQ ৫)
- **Study Pet** — সব stage × carePoints কম্বিনেশনে `progressPct` finite
- **Formula parser** — খালি ইনপুট, শুধু-হেডার, fenced code block সব ঠিক

### রিগ্রেশন গার্ড প্রমাণিত
গার্ড দুটো সরিয়ে টেস্ট চালালে **"XP / Level" গ্রুপে হ্যাং করে যায়**
(৩০s টাইমআউট), গার্ড ফিরিয়ে দিলে ১৫৪/১৫৪ পাস।

### যাচাই
`tsc` ✅ ০ এরর · `lint` ✅ ০ warning · `pnpm test:logic` ✅ ১৫৪/১৫৪

---

## ১২. 🟣 Violet + Glass থিম (V15/V16 কিট) — ২০২৬-০৭-৩০

ব্যবহারকারী তিনটা রেফারেন্স ফাইল শেয়ার করেছেন এবং নির্দেশ দিয়েছেন:
*"violet + glass + কালোও চাই… glass কাঠামো নেব আর white-ও করো মানে টগল"*
— অর্থাৎ **light ও dark দুই মোডেই** কাজ করতে হবে।

| ফাইল | ভূমিকা |
|---|---|
| `ekhane-ache.html` | বর্তমান emerald কিট (আগের রেফারেন্স) |
| `Hsc-V15-Ultimate-Pro-Max` | **light** থিম (`#f6f5fb`) + violet |
| `Hsc-V16-Student-Only-Ultra` | **dark** থিম (`bg-black`) + glass + violet |

দুটো নতুন কিটেই accent **violet→fuchsia**, ফন্ট **Plus Jakarta Sans**।

### ধাপ ১ — টাইপোগ্রাফি (⚠️ একটা বাধা ছিল)
Plus Jakarta Sans বসানোর আগে ফন্ট ফাইল ডাউনলোড করে fontTools দিয়ে
যাচাই: **মোট ৭২১ গ্লিফ, বাংলা ব্লকে (U+0980–09FF) ০টি**। সরাসরি
প্রয়োগ করলে পুরো অ্যাপের বাংলা ভেঙে ব্রাউজার-ফলব্যাকে চলে যেত।

Google Fonts এ বাংলা-সমর্থিত মাত্র **১১টা** ফন্ট আছে। তার মধ্যে
**Anek Bangla** বেছে নেওয়া হয়েছে — একই ক্যাটাগরি (আধুনিক geometric
Sans Serif), variable (wght ১০০–৮০০, কিটের ৪০০/৬০০/৭০০/৮০০ স্কেল
কভার করে), বাংলা+latin সম্পূর্ণ। বডি ও হেডিং দুটোই এখন এক ফ্যামিলি
(কিটের `*{font-family:...}` প্যাটার্ন), hierarchy শুধু weight দিয়ে।
established `Baloo Da 2` মুছে ফেলা হয়নি — `--font-display-alt` হিসেবে
রয়ে গেছে।

### ধাপ ২ — Foundation টোকেন (light + dark)
| টোকেন | Light | Dark |
|---|---|---|
| `--primary` | violet-600 `oklch(0.541 0.247 293)` | violet-400 `oklch(0.709 0.159 293.5)` |
| `--background` | `#f6f5fb` (V15) | `#08080c` (V16-ঘেঁষা) |
| `--card` | সাদা | `#111116` |
| `--radius` | `1.25rem` → `rounded-xl` = **28px** (কিটের bento) | একই |
| chart ramp | violet → fuchsia → cyan → blue | একই (উজ্জ্বল প্রান্তে) |
| aurora orb | violet 293° + fuchsia 322° | একই |

**WCAG যাচাই (প্রয়োগের আগে):** light এ violet-600 সাদা টেক্সটে
**৫.৭০:১**, dark এ violet-400 কালো টেক্সটে **৭.৭২:১** — দুটোই AA পাস।
violet-500 (৪.২৩:১) ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে।

### ধাপ ৩ — Glassmorphism (দুই মোডে)
কিটে `.glass` hardcoded সাদা-alpha — যা **শুধু কালো bg তে কাজ করে**।
ব্যবহারকারী টগল চেয়েছেন, তাই টোকেন-ভিত্তিক করা হয়েছে:
- **dark**: `rgba(255,255,255,0.06)` + `blur(22px)` (কিটের হুবহু মান)
- **light**: `color-mix(card, transparent 25%)` + নরম shadow
  (V15 এর `bg-white border shadow-[0_8px_30px_rgba(0,0,0,0.04)]` থেকে)

সাথে `.glass-strong`, `.bento` (28px), `.shimmer` (+ reduced-motion গার্ড)।

### ধাপ ৪ — কোডজুড়ে রঙ ম্যাপিং
স্বয়ংক্রিয় স্ক্রিপ্টে **৪৫০টা** ক্লাস রূপান্তর (৯২ ফাইল):
emerald→violet, teal→fuchsia, green→violet (একই lightness ধাপ)।
সাথে **৪২টা hex** (email টেমপ্লেট, ২টা PDF export, `offline.html`,
`manifest.ts`, `themeColor`, ডিফল্ট `colorHex`, চার্ট stroke)।

`#047857` → `#6d28d9`: contrast **৫.৪৮ → ৭.১০:১** (উন্নত)।

### 🛡️ Semantic রঙ সুরক্ষিত — ৩১টা
স্ক্রিপ্টে regex গার্ড (`isCorrect|isPass|CheckCircle|সঠিক|সফল|...`)
দিয়ে **৩১টা semantic সবুজ ইচ্ছাকৃতভাবে অক্ষত** রাখা হয়েছে — সঠিক
উত্তরের টিক, পাস ব্যাজ, GPA গ্রেড স্কেল, "প্রস্তুত" স্ট্যাটাস।
এগুলো violet করলে অর্থ ভেঙে যেত।

চূড়ান্ত: violet **৩৫৩** · fuchsia **৯৭** · semantic সবুজ **৩১** · teal **০**

### 🐛 আবারও stale metadata
`lib/accent-theme.ts` এ Accent Picker এর "ডিফল্ট" অপশনের label এখনো
`"ডিফল্ট (emerald)"` 🟢 বলছিল — ঠিক সেই একই documentation-drift যা
Emerald রাউন্ডেও ধরা পড়েছিল (টাইপ-সেফ স্ট্রিং, কম্পাইলার ধরে না)।
`"ডিফল্ট (ভায়োলেট)"` 🟣 + swatch `#6d28d9` (৭.১০:১) এ সংশোধন।

### যাচাই
- CSS কম্পাইল ✅ **২৩৮,১১১ বাইট, ০ warning**
- কম্পাইল আউটপুটে **১২/১২** নতুন টোকেন উপস্থিত
- পুরোনো emerald hue (162.5°) ও teal aurora — **সম্পূর্ণ অনুপস্থিত**
- `tsc` ✅ ০ এরর · `lint` ✅ ০ warning · `test:logic` ✅ ১৫৪/১৫৪

ভিজ্যুয়াল রেফারেন্স: `design-mockups/violet-glass-preview.html`
(লাইট/ডার্ক টগল সহ), `design-mockups/font-preview.html`

### ধাপ ৫ — Glass সব ৮০ পেজে (কম্পোনেন্ট-স্তরে)

আগের ধাপে `.glass` ইউটিলিটি তৈরি হয়েছিল, কিন্তু কোনো কার্ডে প্রয়োগ
হয়নি। ৮০টা পেজ আলাদা করে এডিট না করে **`components/ui/card.tsx` এর
ভিত্তি ক্লাসে** পরিবর্তন করা হয়েছে (`bg-card` → `.glass-surface`) —
shadcn `<Card>` সব পেজে ব্যবহৃত হয় বলে **একটা পরিবর্তনেই পুরো অ্যাপে
প্রয়োগ**।

**⚖️ readability trade-off (ইচ্ছাকৃত):** V16 কিটের হুবহু ৬% স্বচ্ছতা
ব্যবহার করা হয়নি, কারণ কার্ডের ভেতরে দীর্ঘ বাংলা পড়ার কনটেন্ট থাকে
(নোট/প্রশ্ন/ব্যাখ্যা) — কিটের কার্ডগুলো ছোট স্ট্যাট টাইল।
- **dark**: ১২% স্বচ্ছতা + `blur(20px)` — glass অনুভূতি থাকে, টেক্সটের
  পেছনে যথেষ্ট ঘনত্বও থাকে
- **light**: প্রায়-অস্বচ্ছ সাদা + নরম shadow — V15 কিটও light এ
  স্বচ্ছ glass না, কঠিন `bg-white border shadow` ব্যবহার করেছে

**কম্পোজিট contrast যাচাই** (alpha ব্লেন্ড করে প্রকৃত রেন্ডার রঙ বের করে):

| পরিস্থিতি | মূল টেক্সট | muted |
|---|---|---|
| dark — সাধারণ bg | ১৬.২৬:১ ✅ | ৭.৪৭:১ ✅ |
| dark — **aurora orb এর উপরে** | ১৫.৫৩:১ ✅ | ৭.১৪:১ ✅ |
| light — সাদা কার্ড | ১৭.৭২:১ ✅ | ৪.৮৩:১ ✅ |

সবচেয়ে কঠিন কেসেও (স্বচ্ছ কার্ড + উজ্জ্বল orb পেছনে) AA পাস।

### দুটো ছোট বাগ ধরা পড়েছে
- `duel-lobby.tsx` — `from-violet-800 to-violet-800`, অর্থাৎ **flat
  গ্রেডিয়েন্ট** (স্বয়ংক্রিয় ম্যাপিং এ দুটো ভিন্ন রঙ একই শেডে মিলে
  গিয়েছিল) → `to-fuchsia-900`
- `formula-search-page.tsx` — hero তে `to-cyan-800` রয়ে গিয়েছিল
  (cyan ম্যাপিং তালিকায় ছিল না) → `to-violet-900`

সব ২৫টা hero gradient এখন সাদা টেক্সটে **≥ ৫.৭০:১** (AA পাস)।

### চূড়ান্ত যাচাই
CSS কম্পাইল ✅ ২৩৮,৯১০ বাইট · ০ warning · `tsc` ✅ · `lint` ✅ ·
`test:logic` ✅ ১৫৪/১৫৪

### ধাপ ৬ — Glass নেভিগেশন (`.glass-nav`)

Sidebar (ডেস্কটপ), Bottom Nav (মোবাইল), "আরও" bottom-sheet ও Reading
Room এর ২টা sticky header — মোট **৫টা floating সারফেসে** glass প্রয়োগ।
কার্ডের চেয়ে বেশি blur (২৬px), কারণ nav এর নিচ দিয়ে কনটেন্ট স্ক্রল করে।

#### 🐛 contrast সমস্যা ধরা পড়েছে ও ঠিক করা হয়েছে
প্রথমে কার্ডের মতোই স্বচ্ছতা (dark ৩৮%, light ৩২%) দেওয়া হয়েছিল।
কিন্তু **কম্পোজিট contrast হিসাব করে** দেখা গেল nav এর নিচে উজ্জ্বল
violet কার্ড স্ক্রল করে গেলে bottom-nav এর **নিষ্ক্রিয় ট্যাব লেবেল**
(`text-muted-foreground`) AA ফেল করে:

| | আগে | পরে |
|---|---|---|
| dark — উজ্জ্বল কনটেন্ট নিচে | **৩.৭২:১** ❌ | ৫.৪৪:১ ✅ |
| light — উজ্জ্বল কনটেন্ট নিচে | **২.৯৩:১** ❌ | ৪.৮৩:১ ✅ |

**সমাধান:**
- **dark** — স্বচ্ছতা ৩৮% → **২০%** (হিসাব করে পাওয়া সীমা; ২৬% এ
  ৪.৭৯:১, ৩২% এ ফেল)
- **light** — **অস্বচ্ছ** রাখা হয়েছে। কারণ `--muted-foreground`
  (`#6b7280`) সাদাতেই মাত্র ৪.৮৩:১ — সামান্য স্বচ্ছতাও AA এর নিচে
  নামায় (৮% এ ৪.৩০:১)। শুধু `blur+saturate` দিয়ে কাচের অনুভূতি রাখা
  হয়েছে; V15 কিটও light এ কঠিন `bg-white/70 + border` ব্যবহার করেছে।

#### `@supports` fallback গার্ড
`backdrop-filter` সমর্থন না থাকলে সারফেস প্রায়-অস্বচ্ছ থাকে — নাহলে
পুরনো ব্রাউজারে nav এর পেছনের কনটেন্ট সরাসরি দেখা যেত ও টেক্সট
অপাঠ্য হতো।

#### Sidebar টোকেন সংরক্ষণ
`.glass-nav` ডিফল্টে `--card` ব্যবহার করে, কিন্তু sidebar এর নিজস্ব
`--sidebar` টোকেন আছে (dark এ background থেকে সামান্য গাঢ় —
established layering নীতি)। সরাসরি প্রয়োগ করলে সেই স্তরভেদ হারিয়ে
যেত। `data-glass-nav="sidebar"` attribute + CSS override দিয়ে
টোকেনটা ফিরিয়ে দেওয়া হয়েছে।

### যাচাই
CSS কম্পাইল ✅ ২৩৯,৭৬৯ বাইট · ০ warning · ৫/৫ নতুন ইউটিলিটি উপস্থিত ·
`tsc` ✅ · `lint` ✅ · `test:logic` ✅ ১৫৪/১৫৪

### ধাপ ৭ — Overlay প্যানেল ও চূড়ান্ত sweep

#### `.glass-overlay` — Dialog / Dropdown / Select
৩টা কম্পোনেন্ট, ৪টা প্যানেলে প্রয়োগ। স্বচ্ছতার সীমা আবারও contrast
হিসাব করে নির্ধারিত — dropdown এ scrim থাকে না, তাই সরাসরি উজ্জ্বল
কনটেন্টের উপরে বসতে পারে (worst case):
- **dark** — ১৮% স্বচ্ছতা (muted ৫.৬৩:১ ✅)
- **light** — অস্বচ্ছ, `.glass-nav` এর মতোই কারণে

**একটা ভুল ধরে সংশোধন করা হয়েছে:** প্রথমে `bg-popover` এর সব occurrence
বদলে ফেলা হয়েছিল, কিন্তু `select.tsx` এর ২টা **scroll arrow** dropdown
প্যানেলের *ভেতরে* বসে — সেখানে blur দিলে ডাবল-blur ও দৃশ্যমান edge
তৈরি হতো। সেগুলো `bg-popover` এ ফিরিয়ে দেওয়া হয়েছে।

#### 🐛 stale কমেন্ট sweep (তৃতীয়বার)
এই drift প্যাটার্ন আগে দুবার বাগ তৈরি করেছে (Accent Picker label,
email template)। তাই এবার পুরো কোডবেসে "emerald" শব্দ খুঁজে **৬টা
stale কমেন্ট** সংশোধন — `app/page.tsx` (২), `analytics-dashboard`,
`drill-runner`, `forum-feed`, `notification-center`।

`forum-feed` এর কমেন্ট কোডের সাথে **সরাসরি অমিল** ছিল — লেখা ছিল
"emerald → teal → cyan এর ধাপ", অথচ কোডে ইতিমধ্যে
`violet → fuchsia → cyan`।

**ইচ্ছাকৃতভাবে অপরিবর্তিত:** `alert.tsx` (success variant সত্যিই সবুজ)
ও `predicted-gpa-card` (GPA গ্রেড স্কেল) — এখানে "emerald" শব্দটা
semantic অর্থে সঠিক।

### চূড়ান্ত অবস্থা

| | |
|---|---|
| violet | ৩৫৩ |
| fuchsia | ৯৮ |
| semantic সবুজ (সুরক্ষিত) | ৩১ |
| teal | **০** |
| পুরোনো emerald hex | **০** |
| stale brand কমেন্ট | **০** |

| glass স্তর | কভারেজ |
|---|---|
| `.glass-surface` | `<Card>` → **সব ৮০ পেজ** |
| `.glass-nav` | Sidebar · Bottom Nav · Sheet · ২টা sticky header |
| `.glass-overlay` | Dialog · Dropdown · Select |

CSS কম্পাইল ✅ ২৪০,৪৪৮ বাইট · ০ warning · ৬/৬ ইউটিলিটি উপস্থিত ·
`tsc` ✅ · `lint` ✅ · `test:logic` ✅ ১৫৪/১৫৪

> **অসম্পূর্ণ যাচাই (সৎ ঘোষণা):** এই স্যান্ডবক্সে `next build` চালানো
> অসম্ভব (২GB RAM, swap নেই) — তাই আসল পেজ ব্রাউজারে রেন্ডার করে দেখা
> হয়নি। সব রঙ/contrast **সংখ্যাগতভাবে** যাচাই করা (alpha কম্পোজিট সহ)
> এবং CSS কম্পাইল করে নিশ্চিত করা, কিন্তু চাক্ষুষ QA ব্যবহারকারীর
> মেশিনে `pnpm dev` চালিয়ে করতে হবে।

### ধাপ ৮ — Accent প্রিসেট যাচাই ও nested-glass অডিট

#### Accent প্রিসেট — negative result
Settings → থিম এ ৫টা accent প্রিসেট (`indigo`/`amber`/`maroon`/
`forest`/`ocean`) `--primary`, `--ring`, `--chart-1` inline override
করে। নতুন violet foundation এর সাথে এগুলো ভাঙে কিনা যাচাই করা হয়েছে।

OKLCH → sRGB রূপান্তর করে **১২টা কম্বিনেশনেই** (৬ প্রিসেট × light/dark)
বাটনে টেক্সট contrast হিসাব:

| প্রিসেট | light | dark |
|---|---|---|
| default (violet) | ৫.৩৭:১ ✅ | ৭.২৩:১ ✅ |
| indigo | ৭.৩৩:১ ✅ | ৭.৬১:১ ✅ |
| amber | ৪.৮১:১ ✅ | ৮.৫৮:১ ✅ |
| maroon | ৮.৬০:১ ✅ | ৬.৪১:১ ✅ |
| forest | ৬.৫৬:১ ✅ | ৮.৩৪:১ ✅ |
| ocean | ৬.০৮:১ ✅ | ৮.১৪:১ ✅ |

**সব পাস** — কারণ `applyAccentColor()` primary এর lightness থেকে
foreground স্বয়ংক্রিয়ভাবে বেছে নেয় (`< 0.6` হলে সাদা, নাহলে কালো),
তাই যেকোনো নতুন primary এর সাথে মানিয়ে যায়। **কোনো পরিবর্তন লাগেনি।**

`AccentThemeProvider` `resolvedTheme` পরিবর্তনেও re-apply করে, তাই
light/dark টগলে accent সঠিক থাকে। FOUC `next-themes` সামলায়।

#### 🐛 Nested glass — ১টা প্রকৃত কেস
`<Card>` এখন `backdrop-filter` ব্যবহার করে, তাই nested Card মানে **দুই
স্তর blur চেপে বসা** (ঘোলাটে, edge artifact)। পুরো কোডবেসে JSX
টোকেনাইজ করে খোঁজা হয়েছে।

প্রথম pass এ ১২টা "nested" দেখিয়েছিল, কিন্তু যাচাই করে দেখা যায়
সেগুলো **false positive** — early-return এ থাকা self-closing
`<Card ... />` কে parser ভুলভাবে খোলা ট্যাগ ধরছিল। parser ঠিক করে
(self-closing আলাদা করে) আবার চালানোয় **১টা প্রকৃত কেস** পাওয়া যায়:

`cq-practice/result/[attemptId]/page.tsx` — score Card এর ভেতরে AI
ফিডব্যাক Card। ভেতরেরটা নিজেই `bg-muted/50` দিয়ে আলাদা হয়, তাই
সাধারণ `div` এ পরিবর্তন (ভিজ্যুয়াল ক্ষতি নেই, ডাবল-blur এড়ানো গেল)।

Dialog/Sheet এর ভেতরে `<Card>` আছে কিনাও যাচাই করা হয়েছে
(`glass-overlay` + `glass-surface` স্ট্যাক হতো) — **০টা পাওয়া গেছে**।

### যাচাই
CSS ✅ ২৪০,৪৪৮ বাইট · ০ warning · `tsc` ✅ · `lint` ✅ ·
`test:logic` ✅ ১৫৪/১৫৪

### ধাপ ৯ — PWA আইকন (শেষ emerald অবশেষ)

CSS/কোডে সব violet হলেও **PNG আইকনগুলো এখনো emerald ছিল** — এগুলো
বাইনারি অ্যাসেট, তাই কোনো grep/টেক্সট sweep এ ধরা পড়ে না। Pillow দিয়ে
পিক্সেল বিশ্লেষণ করে ধরা পড়েছে (`#08b576`, `#11aa72` প্রাধান্য)।

এগুলো হোম-স্ক্রিনে, অ্যাপ সুইচারে ও ইনস্টল প্রম্পটে দেখা যায় — অর্থাৎ
ইউজারের প্রথম ব্র্যান্ড ছাপ। `theme_color` আগে violet করা হয়েছিল,
কিন্তু আইকন সবুজ থাকায় দুটো পরস্পরবিরোধী দেখাত।

**পদ্ধতি — AI দিয়ে নতুন আইকন বানানো হয়নি**, কারণ তাতে graduation-cap
শিল্পকর্ম/লেআউট বদলে যেত। বদলে HSV hue-rotation প্রয়োগ করা হয়েছে:
- saturation < 0.12 (সাদা cap, বই, ধূসর) **অক্ষত**
- শুধু রঙিন পিক্সেল ঘোরানো → gradient, glow, আকৃতি সব হুবহু একই

**🐛 প্রথম চেষ্টায় ভুল হয়েছিল:** ২৮৫° লক্ষ্য ধরেছিলাম, ফলে আইকন
ম্যাজেন্টা-ঘেঁষা হয়ে ব্র্যান্ড violet-এর (২৬২°) সাথে **২৩° অমিল**
হচ্ছিল। পিক্সেল hue পরিমাপ করে ধরা পড়ে; ব্যাকআপ থেকে পুনরুদ্ধার করে
২৬২° এ পুনরায় প্রয়োগ করা হয়েছে।

| আইকন | hue | ব্র্যান্ড violet-600 |
|---|---|---|
| `apple-touch-icon.png` | ২৬২° ✅ | ২৬২° |
| `icon-192.png` | ২৬২° ✅ | ২৬২° |
| `icon-512.png` | ২৬২° ✅ | ২৬২° |
| `icon-maskable-512.png` | ২৬২° ✅ | ২৬২° |

মূল ফাইলগুলো `/tmp/icon-backup/` এ রাখা হয়েছিল (round-trip সম্ভব)।

**Violet Glass থিম এখন সম্পূর্ণ** — CSS টোকেন, ৪৫০ ক্লাস, ৪২ hex,
ফন্ট, glass (Card/Nav/Overlay), এবং বাইনারি আইকন সহ প্রতিটা স্তরে।

### যাচাই
`tsc` ✅ · `lint` ✅ · `test:logic` ✅ ১৫৪/১৫৪ · আইকন hue ৪/৪ ✅

---

## ১৩. Seed ডেটা অখণ্ডতা যাচাই (২০২৬-০৭-৩০)

কোড ও থিম যাচাই শেষ হওয়ায় এবার **কনটেন্ট ডেটা** পরীক্ষা করা হয়েছে।
এখানে বাগ থাকলে কোনো টাইপ-এরর বা lint warning দেখা যায় না — প্রশ্ন
নীরবে ভুল আচরণ করে।

### সবচেয়ে বড় ঝুঁকি: string-matched উত্তর
MCQ স্কোরিং `correctAnswer` ও `options` এর **string comparison** এ হয়
(index না — কারণ option shuffle হয়)। তাই একটা টাইপো মানে ওই প্রশ্নের
সঠিক উত্তর দেওয়াই **অসম্ভব** — ছাত্র সবসময় ভুল পেত, অথচ কোনো এরর নেই।

| যাচাই | ফলাফল |
|---|---|
| MCQ `correctAnswer` ∈ `options` | **৪১৩/৪১৩** ✅ |
| Unicode normalization অমিল | ০ ✅ |
| ডুপ্লিকেট option | ০ ✅ |
| ৪টার কম option | ০ ✅ |
| CQ তে ক/খ/গ/ঘ + model answer | **৬৪/৬৪** ✅ |
| topic নাম `seed.ts` এ আছে | **৮১/৮১** ✅ |

**সব পরিষ্কার — negative result।** বিশেষভাবে unicode normalization
চেক করা হয়েছে কারণ বাংলা যুক্তাক্ষরে NFC/NFD পার্থক্য সহজেই হতে পারে
(দেখতে অভিন্ন, বাইট ভিন্ন → string match ব্যর্থ)।

**⚠️ নিজের parser এর ভুল ধরা:** প্রথম pass এ ২টা "ব্যর্থ" দেখিয়েছিল
(`[M]`, `[ML⁻¹T⁻²]`)। কোড খুলে দেখা যায় ডেটা ঠিকই আছে — আমার regex
নেস্টেড ব্র্যাকেটে ভেঙে যাচ্ছিল। bracket-depth-সচেতন parser লিখে
পুনরায় চালানোয় ৪১৩/৪১৩ পাস। **ডেটা নয়, টুলের বাগ ছিল।**

একইভাবে CQ চেকে প্রথমে ৬৪/৬৪ "ব্যর্থ" দেখিয়েছিল — কারণ আমি ফিল্ডের
নাম `answerA` ধরেছিলাম, স্কিমায় আসলে `modelAnswerA`। স্কিমা পড়ে
সংশোধনের পর সব পাস।

### 📉 প্রকৃত সমস্যা: Admission প্রশ্নব্যাংক অসম্পূর্ণ
| পরীক্ষা | আছে / দরকার |
|---|---|
| MEDICAL | ২৮ / ১০০ (২৮%) |
| DU_A_UNIT | ১৬ / ৬০ (২৬%) |
| BUET | ৯ / ৬০ (১৫%) |

এটা **কোড বাগ নয়, কনটেন্ট গ্যাপ**। কোড সঠিকভাবেই degrade করে —
`pickRandom` উপলব্ধ সংখ্যায় ক্ল্যাম্প করে, `maxScore` প্রকৃত সংখ্যায়
সেট হয়, এবং ইউজারকে স্পষ্ট বার্তা দেখানো হয় (*"কিছু সাবজেক্টে যথেষ্ট
প্রশ্ন নেই: পদার্থবিজ্ঞান (৫/১৫)…"*)। তবু পূর্ণাঙ্গ মক পরীক্ষার
অভিজ্ঞতা পেতে আরও প্রশ্ন যোগ করা দরকার।

### নতুন টুল — `pnpm test:seed`
`scripts/verify-seed-integrity.py` — DB/সার্ভার ছাড়াই চলে, ৫টা শ্রেণির
যাচাই করে, সমস্যা পেলে exit code 1 দেয় (CI-ready)।

**vacuous নয় প্রমাণিত:** একটা `correctAnswer` ইচ্ছাকৃতভাবে
`"নিউটন"` → `"নিউটনন"` করে চালানো হয়েছে — সঠিক ফাইল ও লাইন নম্বর সহ
ধরা পড়ে (exit 1), ফিরিয়ে দিলে পাস।

### যাচাই
`pnpm test:seed` ✅ · `tsc` ✅ · `lint` ✅ · `test:logic` ✅ ১৫৪/১৫৪

---

## ১৪. ✅ লাইভ রেন্ডার যাচাই — অবশেষে সম্ভব হলো (২০২৬-০৭-৩০)

এতদিন প্রতিটা রাউন্ডে লিখেছি *"আসল পেজ চোখে দেখিনি"*, কারণ
`next build` এই স্যান্ডবক্সে OOM করে। কিন্তু একটা গুরুত্বপূর্ণ পার্থক্য
খেয়াল করা হয়েছে:

> `next build` **সব ৮০টা পেজ একসাথে** কম্পাইল করে (তাই ১.৪GB সীমা
> ছাড়ায়), কিন্তু `next dev` **on-demand** — একবারে শুধু requested
> পেজটা। সেটা মেমরির মধ্যে ধরে।

### dev server সফলভাবে চলেছে
```
✓ Ready in 673ms
GET /          200 in 7.9s
GET /login     200 in 1.3s
GET /dashboard 307  ← auth guard সঠিকভাবে redirect করছে
```

**কোনো runtime error নেই** — অ্যাপ প্রকৃতপক্ষে চলে।

### ব্রাউজারে যাওয়া প্রকৃত CSS টোকেন
OKLCH ঠিকভাবে hex এ কম্পাইল হয়েছে (পুরনো ব্রাউজার সাপোর্ট নিশ্চিত):

| টোকেন | light | dark |
|---|---|---|
| `--primary` | **`#7c3aed`** ✅ | **`#a78bfa`** ✅ |
| `--background` | `#f6f5fb` ✅ | `#08080c` ✅ |
| `--card` | `#fff` ✅ | `#111116` ✅ |
| `--accent` | `#efecff` ✅ | `#312256` ✅ |

`.glass-surface` · `.glass-nav` · `.glass-overlay` · `.bento` (28px) ·
heading tracking · dyslexia override · `@supports` গার্ড — **সবই
কম্পাইল করা CSS এ উপস্থিত**।

### প্রকৃত রেন্ডার করা DOM (সবচেয়ে শক্ত প্রমাণ)
`<body>` এর ২৯৯টা আলাদা ক্লাস বিশ্লেষণ করে:

| | |
|---|---|
| **emerald / teal** | **০** ✅ |
| violet / fuchsia গ্রেডিয়েন্ট | ৭টা (hero banner) |
| `glass-surface` | ✅ কার্ডে প্রয়োগ হয়েছে |
| বাংলা টেক্সট | ১৫০+ স্ট্রিং, সঠিক রেন্ডার |
| `<html>` ক্লাস | `anek_bangla_*__variable` ✅ ফন্ট লোডেড |

### 🔍 একটা false alarm তদন্ত করা হয়েছে
কম্পাইল করা CSS এ `radial-gradient(#10b9811f, …)` (emerald) দেখা যায়।
প্রথমে বাগ মনে হয়েছিল — কিন্তু এটা `rgba(16,185,129,0.12)` আকারে ছিল
বলে আগের hex sweep ধরেনি।

উৎসে খুঁজে দেখা গেছে **কোথাও নেই** (`ellipse_at_center` স্ট্রিং
কোডবেসে অনুপস্থিত) — এটা পরিবর্তনের আগের Turbopack cache এ আটকে থাকা
পুরনো chunk। fresh `.next` এ থাকবে না।

একইভাবে CSS এ ১২৪টা `emerald-*` ক্লাস ডেফিনিশন আছে, কিন্তু **DOM এ
একটাও ব্যবহৃত হয় না** — Tailwind এর অব্যবহৃত utility, ক্ষতিকর নয়।

### যা এখনো যাচাই হয়নি (সৎ ঘোষণা)
HTML ও CSS **পড়ে** যাচাই করা হয়েছে, কিন্তু **ছবি দেখা হয়নি** (এই
পরিবেশে ব্রাউজার স্ক্রিনশট নেওয়ার টুল নেই)। তাই glass কার্ডের blur
কতটা লাগছে, light মোডে বেশি সাদা কিনা, বাংলা হেডিং এর tracking
দৃষ্টিনন্দন কিনা — এগুলো ব্যবহারকারীর চাক্ষুষ মতামতের অপেক্ষায়।

**স্ট্যাটিক স্ন্যাপশট:** `design-mockups/live-render-landing.html`
(প্রকৃত dev render + ইনলাইন CSS, script বাদ)

---

## ১৫. 📚 ভর্তি প্রশ্নব্যাংক সম্পূর্ণ (২০২৬-০৭-৩০)

অডিটে চিহ্নিত সবচেয়ে বড় **কনটেন্ট গ্যাপ** পূরণ করা হয়েছে।

### আগে vs পরে
| পরীক্ষা | আগে | পরে |
|---|---|---|
| MEDICAL | ২৮ / ১০০ (২৮%) | **১০০ / ১০০** ✅ |
| DU_A_UNIT | ১৬ / ৬০ (২৬%) | **৬০ / ৬০** ✅ |
| BUET | ৯ / ৬০ (১৫%) | **৬০ / ৬০** ✅ |
| **মোট** | ৫৩ / ২২০ | **২২০ / ২২০** 🎉 |

প্রজেক্টের মোট MCQ: **৪১৩ → ৫৮০**

### পদ্ধতি
নতুন ফাইল `prisma/seed-admission-questions-2.ts` (১,৬২৬ লাইন, ১৬৭টা
প্রশ্ন) — মূল ফাইলটা **স্পর্শ করা হয়নি**, কারণ সেটা idempotent
(`deleteMany` করে)। দুটো আলাদা রাখায় মূল ৫৩টা প্রশ্ন অক্ষত থাকে।

সব প্রশ্ন HSC সিলেবাস-ভিত্তিক, প্রতিটিতে **বাংলা ব্যাখ্যা** ও
difficulty ট্যাগ (EASY/MEDIUM/HARD মিশ্রিত)। MEDICAL এর English ও GK
অংশ ইংরেজি/বাংলা যথাযথভাবে।

### ⚠️ পুনরায়-চালানো নিরাপদ (idempotency)
মূল স্ক্রিপ্টের বিপরীতে এটা `deleteMany` করে **না** — তাহলে দুটো
একসাথে চালালে একটা আরেকটাকে মুছে দিত। বদলে DB থেকে বিদ্যমান `text`
পড়ে **ডুপ্লিকেট ফিল্টার** করে, তাই বারবার চালালেও নিরাপদ।

সঠিক ক্রম:
```bash
pnpm db:seed-admission-questions      # ৫৩টা (আগে)
pnpm db:seed-admission-questions-2    # ১৬৭টা (পরে)
```
স্ক্রিপ্টটা শেষে কনফিগের চাহিদার সাথে তুলনা করে কভারেজ রিপোর্ট ছাপে।

### যাচাই
- **ডুপ্লিকেট: ০** — পুরোনো ৫৩টার সাথে ও নিজেদের মধ্যে (whitespace/case
  normalize করে তুলনা)
- **অখণ্ডতা: ০ সমস্যা** — প্রতিটা `correctAnswer` তার `options` এ আছে,
  প্রতিটায় ঠিক ৪টা স্বতন্ত্র option (জেনারেশনের সময় assertion দিয়ে
  প্রয়োগ করা)
- `pnpm test:seed` ✅ ৫৮০ MCQ যাচাই করে পাস
- `tsc` ✅ ০ এরর · `lint` ✅ ০ warning · `test:logic` ✅ ১৫৪/১৫৪

> **সীমাবদ্ধতা:** DB এই স্যান্ডবক্স থেকে unreachable, তাই seed
> স্ক্রিপ্টটা **চালিয়ে** দেখা যায়নি। TypeScript কম্পাইল ও ডেটা
> অখণ্ডতা যাচাই করা হয়েছে; ব্যবহারকারীকে নিজের মেশিনে চালাতে হবে।

---

## ১৬. 📖 isImportant টপিকের MCQ কভারেজ ১০০% (২০২৬-০৭-৩০)

### 🔍 প্রথমে নিজের টুলের বাগ ধরা পড়ল
কভারেজ মাপতে গিয়ে প্রথম স্ক্যানে দেখাল **২৭টা** গুরুত্বপূর্ণ টপিকে MCQ
নেই। কিন্তু তালিকায় "গ্যাসের গতিতত্ত্ব" দেখে সন্দেহ হলো — কারণ
`seed-questions-physics-gaps.ts` ফাইলটার নামই বলছে সেটা ওই টপিক কভার করে।

খুঁজে দেখা গেল প্রশ্ন seed ফাইলে **দুটো আলাদা গঠন** আছে:
- `questionsByTopic: Record<string, ...>` (পুরোনো ফাইল)
- `topicName` / `subjectName` / `questions[]` (gaps ফাইলগুলো)

আমার ডিটেক্টর শুধু প্রথমটা পড়ছিল। দুটোই পড়ার পর প্রকৃত সংখ্যা:
**৮০/৮১ কভার (৯৮%)**, ২৭ নয়। *ডেটার নয়, টুলের বাগ ছিল।*

দ্বিতীয় ভুলও ধরা পড়ল — `isImportant` গণনার regex `nameEn` ফিল্ডটা
হিসাবে নেয়নি, ফলে ৮১ এর বদলে ভুল সেট আসছিল।

### প্রকৃত গ্যাপ ও সমাধান
| | আগে | পরে |
|---|---|---|
| MCQ-শূন্য isImportant টপিক | ২ | **০** ✅ |
| ৩টার কম MCQ | ২৯ | **০** ✅ |
| isImportant কভারেজ | ৯৮% | **১০০%** 🎉 |
| প্রজেক্টের মোট MCQ | ৫৮০ | **৬৭৭** |

MCQ-শূন্য দুটো ছিল **অ্যালকোহল ও কার্বক্সিলিক এসিড** ও **প্রবন্ধ রচনা**
— দুটোতেই Notes ও CQ থাকলেও একটাও MCQ ছিল না।

নতুন ফাইল `prisma/seed-questions-topic-gaps.ts` (৯৮৯ লাইন) — ৩১টা
টপিকে ৯৭টা প্রশ্ন, প্রতিটিতে বাংলা ব্যাখ্যা ও difficulty ট্যাগ।

### ⚠️ established প্যাটার্ন থেকে ইচ্ছাকৃত বিচ্যুতি
বিদ্যমান `*-gaps.ts` স্ক্রিপ্টগুলো প্রতি টপিকে `deleteMany` করে
(idempotent)। কিন্তু এখানে **২৯টা টপিকে আগে থেকেই ২টা করে ভালো প্রশ্ন
আছে** — `deleteMany` করলে সেগুলো মুছে যেত।

তাই এই স্ক্রিপ্ট `deleteMany` করে **না**; বদলে DB থেকে বিদ্যমান `text`
পড়ে ডুপ্লিকেট ফিল্টার করে শুধু নতুনগুলো যোগ করে — বারবার চালানোও নিরাপদ।
টপিক লুকআপে subject filter আছে (নাম-collision এড়াতে, established পাঠ)।

শেষে স্ক্রিপ্টটা DB থেকে সব `isImportant` টপিকের MCQ গণনা করে কভারেজ
রিপোর্ট ছাপে।

### যাচাই
- ডুপ্লিকেট **০** (বিদ্যমান সব seed ফাইলের সাথে ও নিজেদের মধ্যে)
- অখণ্ডতা **০ সমস্যা** (জেনারেশনেই assertion)
- `pnpm test:seed` ✅ **৬৭৭ MCQ** · `tsc` ✅ · `lint` ✅ · `test:logic` ✅

> DB unreachable বলে স্ক্রিপ্ট চালিয়ে দেখা যায়নি — ব্যবহারকারীকে
> `pnpm db:seed-questions-topic-gaps` চালাতে হবে।

---

## ১৭. 🎉 লাইভ ডাটাবেজে যাচাই — seed চালানো ও E2E (২০২৬-০৭-৩০)

আগের সব রাউন্ডে লিখতে হয়েছিল *"DB unreachable, তাই seed চালিয়ে দেখা
যায়নি"*। **এবার DB সংযোগ কাজ করেছে** — তাই সব দাবি প্রকৃতপক্ষে যাচাই
করা গেছে।

### স্ট্যাটিক বিশ্লেষণ লাইভ DB দিয়ে নিশ্চিত
seed চালানোর **আগে** DB পড়ে দেখা গেছে: MCQ-শূন্য `isImportant` টপিক
ঠিক **২টা** — "অ্যালকোহল ও কার্বক্সিলিক এসিড" ও "প্রবন্ধ রচনা"।
এটা আমার স্ট্যাটিক স্ক্যানের ভবিষ্যদ্বাণীর সাথে **হুবহু মিলেছে**।

### দুটো seed স্ক্রিপ্ট প্রকৃতপক্ষে চালানো হয়েছে

**১. `pnpm db:seed-admission-questions-2`**
```
✅ 167টা নতুন প্রশ্ন যোগ
📊 কভারেজ: ১২/১২ সাবজেক্টেই ✅
   মোট প্রশ্ন: 220
   🎉 সব পরীক্ষার পূর্ণ কভারেজ হয়েছে!
```

**২. `pnpm db:seed-questions-topic-gaps`**
```
✅ ৩১টা টপিকে ৯৭টা নতুন MCQ যোগ
📊 isImportant টপিক: 82 | MCQ নেই: 0 | ৩টার কম: 1
```

### 🐛 লাইভ DB আরেকটা গ্যাপ ধরিয়ে দিল
স্ক্রিপ্টের রিপোর্টে দেখা গেল **৮১ নয়, ৮২টা** `isImportant` টপিক, আর
একটায় (**C প্রোগ্রামিং বেসিক**, ICT) তখনো মাত্র ২টা MCQ। আমার স্ট্যাটিক
detector এটা মিস করেছিল — `seed-bangla-english-ict.ts` এ ইন্ডেন্টেশন
ভিন্ন হওয়ায় regex ধরেনি।

৩টা প্রশ্ন যোগ করে পুনরায় চালানো হয়েছে:
```
🎉 মোট 3টা নতুন MCQ যোগ (97টা আগে থেকেই ছিল)
📊 isImportant: 82 | MCQ নেই: 0 | ৩টার কম: 0   ← সম্পূর্ণ
```

**idempotency প্রমাণিত:** দ্বিতীয়বার চালানোয় আগের ৯৭টা সঠিকভাবে স্কিপ
হয়েছে, কোনো ডুপ্লিকেট তৈরি হয়নি — `deleteMany` না করার সিদ্ধান্তটা
বাস্তবে কাজ করেছে।

### E2E যাচাই — ১২/১২ পাস
লাইভ DB এর বিরুদ্ধে:
- Practice ফ্লো: প্রশ্নসহ চ্যাপ্টার লোড, **সব `correctAnswer` তার
  `options` এ আছে** (DB তে JSON কলাম থেকে পড়ে যাচাই)
- Admission: তিনটা পরীক্ষারই পূর্ণ প্রশ্ন আছে; স্কোরিং যাচাই
  (৬০ সঠিক + ২০ ভুল → ৫৫, নেগেটিভ মার্কিং সহ, isPass সঠিক)
- রেফারেন্সিয়াল অখণ্ডতা: টপিকবিহীন চ্যাপ্টার **০**, চ্যাপ্টারবিহীন
  সাবজেক্ট **০**
- সব ৬৪টা CQ তে model answer পূর্ণ

### চূড়ান্ত লাইভ DB অবস্থা
| | |
|---|---|
| Subject · Chapter · Topic | ১৩ · ৮৯ · ১৮৫ |
| MCQ (প্র্যাকটিস) | **৪৪৯** |
| MCQ (ভর্তি) | **২২০** |
| CQ | ৬৪ |
| Badge | ১৪ |
| **isImportant কভারেজ** | **৮২/৮২ (১০০%)** ✅ |

`test:seed` ✅ · `test:logic` ✅ ১৫৪/১৫৪ · `lint` ✅ · `tsc` ✅

---

## ১৮. 🔬 লাইভ DB গভীর অডিট ও চ্যাপ্টার কভারেজ (২০২৬-০৭-৩০)

DB সংযোগ কাজ করায় এমন যাচাই সম্ভব হলো যা স্ট্যাটিক বিশ্লেষণে অসম্ভব।

### ১৭টা অখণ্ডতা চেক — সব পাস
প্রকৃত DB এর বিরুদ্ধে: `options` JSON কলাম array কিনা, প্রতিটা
`correctAnswer` তার options এ আছে কিনা, ডুপ্লিকেট option, ব্যাখ্যাবিহীন
প্রশ্ন, একই টপিকে ডুপ্লিকেট প্রশ্ন (SQL `GROUP BY … HAVING`), একই
চ্যাপ্টারে ডুপ্লিকেট টপিক নাম, CQ পূর্ণতা, ডুপ্লিকেট badge code,
isImportant টপিকে Notes, ঋণাত্মক XP, level < 1 — **১৭/১৭ পাস**।

> raw SQL এ প্রথমে `relation "Question" does not exist` এরর আসে —
> স্কিমায় `@@map("questions")` দিয়ে snake_case টেবিল নাম ম্যাপ করা।
> সঠিক নাম ব্যবহার করে সমাধান।

### 🐛 নতুন গ্যাপ: ১৫টা চ্যাপ্টারে একটিও MCQ ছিল না
সাবজেক্ট-ভিত্তিক বণ্টন বিশ্লেষণে ধরা পড়ে **৮৯টা চ্যাপ্টারের মধ্যে
১৫টায় শূন্য MCQ**। এগুলোর কোনোটিতেই `isImportant` টপিক নেই — তাই
আগের কভারেজ অডিটে ধরা পড়েনি।

**কিন্তু বাস্তব প্রভাব ছিল:** ছাত্র Practice এ ওই চ্যাপ্টার বেছে নিলে
**খালি কুইজ** পেত। কম-অগ্রাধিকার হলেও এটা প্রকৃত UX গ্যাপ।

`prisma/seed-questions-empty-chapters.ts` — ৩০টা টপিকে ৯০টা MCQ।
চালানোর পর: **MCQ-শূন্য চ্যাপ্টার ০/৮৯** ✅

### ✅ assertion নিজের ভুল ধরল
প্রশ্ন জেনারেট করার সময় assertion ব্যর্থ হয়:
`AssertionError: সৌরজগৎ: আলোকবর্ষ কীসের একক?` — আমি `correctAnswer`
লিখেছিলাম `"আলোকবর্ষ"`, কিন্তু options ছিল `["দূরত্ব","সময়",…]`।
জেনারেশন-টাইম assertion না থাকলে এই ভুল প্রশ্ন DB তে চলে যেত এবং
ছাত্র কখনোই সঠিক উত্তর দিতে পারত না।

### চূড়ান্ত লাইভ DB অবস্থা
| | |
|---|---|
| MCQ (প্র্যাকটিস) | **৫৩৯** |
| MCQ (ভর্তি) | **২২০** |
| CQ | ৬৪ |
| **MCQ-শূন্য চ্যাপ্টার** | **০ / ৮৯** ✅ |
| **isImportant কভারেজ** | **৮২ / ৮২** ✅ |
| **correctAnswer অমিল** | **০** ✅ |

অবশিষ্ট: ২টা চ্যাপ্টারে ৫টার কম MCQ (৩ ও ৪টা) — গ্রহণযোগ্য।

`test:seed` ✅ · `test:logic` ✅ ১৫৪/১৫৪ · `lint` ✅ · `tsc` ✅

---

## ১৯. 🔐 Secret Rotation — যা নিজে করা সম্ভব, করা হয়েছে (২০২৬-০৭-৩০)

ব্যবহারকারীর নির্দেশ: *"Tumi nije thik korba sob kisu"*। তাই সবচেয়ে
জরুরি বাকি কাজ — credential rotation — ধরা হয়েছে।

### ✅ স্বয়ংক্রিয়ভাবে rotate করা হয়েছে
| Secret | পদ্ধতি |
|---|---|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| VAPID কী-জোড়া | `webpush.generateVAPIDKeys()` |

**rotate করার আগে প্রভাব যাচাই করা হয়েছে** (অন্ধভাবে বদলানো হয়নি):
ইউজার ১ জন · push subscription ০ · অব্যবহৃত reset টোকেন ০ — অর্থাৎ
ক্ষতির ঝুঁকি ন্যূনতম।

**পরে যাচাই:** `pnpm dev` চালিয়ে landing **200**, login **200**,
dashboard **307** (auth guard অক্ষত) ✅

### 🔍 একটা false alarm তদন্ত করা হয়েছে
প্রথম যাচাইয়ে `Vapid subject is not a valid URL` এরর আসে — মনে হচ্ছিল
push notification কখনোই কাজ করেনি। কিন্তু খুঁজে দেখা যায় আমার টেস্ট
স্ক্রিপ্ট `.env.local` **কাঁচাভাবে** পড়ছিল, তাই মানটা উদ্ধৃতিচিহ্ন সহ
(`"mailto:..."`) আসছিল। Next.js/dotenv স্বয়ংক্রিয়ভাবে quote strip করে —
`dotenv` দিয়ে সঠিকভাবে লোড করে যাচাই করায় **VAPID বৈধ প্রমাণিত**।
*বাগ রিপোর্ট করার আগে যাচাই করে ভালো হয়েছে।*

### ⚠️ যা করা যায়নি (ও কেন)
Supabase পাসওয়ার্ড, Groq, Mistral, Cerebras, OpenRouter, Resend —
এগুলো rotate করতে **provider ড্যাশবোর্ডে লগইন** লাগে, যা আমার পক্ষে
সম্ভব নয়। `docs/SECRET_ROTATION.md` এ প্রতিটার জন্য সরাসরি লিংক ও
ধাপে-ধাপে নির্দেশনা লেখা হয়েছে।

> ⚠️ **DB credential এখনো সক্রিয়** — এই সেশনেই DB সংযোগ সফল হয়েছে।
> অর্থাৎ ফাঁস হওয়া পাসওয়ার্ড কাজ করে, তাই Supabase reset সবচেয়ে জরুরি।

### 🛡️ নতুন স্থায়ী রক্ষাকবচ — `pnpm check:secrets`
`scripts/check-secrets.ts` — **কোনো গোপন মান print করে না**।
১৬টা চেক: সব ভেরিয়েবলের উপস্থিতি, placeholder সনাক্তকরণ,
`NEXTAUTH_SECRET` দৈর্ঘ্য, **VAPID কী-জোড়ার প্রকৃত বৈধতা** (web-push
দিয়ে, শুধু দৈর্ঘ্য নয়), URL গঠন। সমস্যা পেলে exit 1 — CI-ready।

**vacuous নয় প্রমাণিত:** ইচ্ছাকৃতভাবে secret ভেঙে চালানো হয়েছে —
দুটোই ধরা পড়ে (`NEXTAUTH_SECRET খুব ছোট`, `VAPID কী-জোড়া অবৈধ`),
ঠিক করার পর ১৬/১৬ পাস।

### যাচাই
`check:secrets` ✅ ১৬/১৬ · `tsc` ✅ · `lint` ✅ ·
`test:logic` ✅ ১৫৪/১৫৪ · `test:seed` ✅
