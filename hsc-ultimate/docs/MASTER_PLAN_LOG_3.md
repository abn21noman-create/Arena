# 📙 MASTER PLAN — বাস্তবায়ন লগ ৩ (UI/UX ও ফিচার সম্প্রসারণ)

> Accent Color Theme থেকে শুরু করে Reading Room, Glassmorphism, Mobile Responsiveness, Voice Input, Mistake Vault, Habit Tracker ও ধারাবাহিক UI polish রাউন্ডগুলো।
>
> ⬅️ [লগ ২](./MASTER_PLAN_LOG_2.md) · 🏠 [মূল পরিকল্পনা](./MASTER_PLAN.md) · ➡️ [লগ ৪](./MASTER_PLAN_LOG_4.md)

---

## 🎨 Accent Color Theme (readingroombd.com multi-theme থেকে অনুপ্রাণিত) ✅ সম্পন্ন

**Button Tactile Press Effect এর পরে "Next" নির্দেশে নিজের সিদ্ধান্তে
বেছে নেওয়া পরবর্তী কাজ — research ডকুমেন্টে চিহ্নিত করা readingroombd.com
এর ১০-থিম সিস্টেম থেকে সরাসরি অনুপ্রাণিত আইডিয়া (৮ নং সেকশন, ৩ নং
পয়েন্ট)।**

### ⚠️ গুরুত্বপূর্ণ Architectural সিদ্ধান্ত — পূর্ণাঙ্গ Theme System না বানানোর কারণ
প্রাথমিকভাবে readingroombd.com এর মতো সম্পূর্ণ background/foreground/
card/border palette সহ ৫-১০টা থিম বানানোর কথা বিবেচনা করা হয়েছিল।
কিন্তু কোডবেস পরীক্ষা করে দেখা যায় **৭৩টা+ ফাইলে সরাসরি hardcoded
`dark:` Tailwind variant** আছে (যেমন `dark:bg-input/30`,
`dark:border-input`, `dark:hover:bg-muted/50` ইত্যাদি) — এগুলো
বর্তমান light/dark background/border architecture এর উপর নির্ভরশীল।
সম্পূর্ণ নতুন color palette (নতুন background/card/border shade) চালু
করলে এই hardcoded override গুলোর সাথে conflict/অসামঞ্জস্য হওয়ার
বাস্তব ঝুঁকি ছিল (`grep` দিয়ে যাচাই করে প্রতিটা `dark:` ব্যবহার
পরীক্ষা করা হয়েছে)।

তাই **scope সংকুচিত করে নিরাপদ পথ বেছে নেওয়া হয়েছে**: শুধু accent
color (`--primary`, `--ring`, `--chart-1`, `--sidebar-primary`,
`--sidebar-ring` ও তাদের foreground) পরিবর্তনযোগ্য — এগুলোকে কোথাও
`dark:` variant override করে না (grep করে confirm করা হয়েছে), তাই
background/border architecture সম্পূর্ণ অক্ষত থাকে।

### ডিফল্ট নির্ধারণে নিজের ডিজাইনেই bug ধরা পড়া 🐛
প্রাথমিক ডিজাইনে "ক্লাসিক ইন্ডিগো" কে ডিফল্ট বানানোর পরিকল্পনা ছিল
(যেহেতু এটা সবচেয়ে "স্বাভাবিক" accent color মনে হয়)। কিন্তু
`app/globals.css` পুনরায় পরীক্ষা করে দেখা যায় বিদ্যমান ডিফল্ট থিমের
`--primary` আসলে **grayscale/কালো** (`oklch(0.205 0 0)` light,
`oklch(0.922 0 0)` dark) — কোনো রঙিন accent না। যদি "ইন্ডিগো" ডিফল্ট
বানানো হতো, তাহলে বিদ্যমান সব ইউজারের জন্য **কিছু না করা সত্ত্বেও**
পুরো প্ল্যাটফর্মের রঙ হঠাৎ বদলে যেত — একটা silent visual regression।
এটা ধরা পড়ার পরে সমাধান: explicit `"default"` (grayscale, `light`/
`dark` উভয়ই `null`, কোনো CSS override প্রয়োগ করে না) অপশন যোগ করে
সেটাকেই `DEFAULT_ACCENT_COLOR` বানানো হয়েছে।

### `lib/accent-theme.ts` — Core Logic
- ৬টা অপশন: `default` (grayscale, override নেই) + `indigo`/`amber`/
  `maroon`/`forest`/`ocean` — শেষ ৪টা Reading Room এর থিমের emoji/
  নাম/রঙের ভাষার সাথে সামঞ্জস্যপূর্ণ (Lo-fi ক্যাফে→অ্যাম্বার, ডার্ক
  একাডেমিয়া→মেরুন, কোজি লাইব্রেরি→ফরেস্ট, বৃষ্টিভেজা জানালা→ওশান)
- প্রতিটা রঙের আলাদা light+dark OKLCH ভ্যালু (L/C/H)
- `applyAccentColor(id, isDark)` — `document.documentElement.style.
  setProperty()` দিয়ে inline override করে, primary এর lightness
  অনুযায়ী foreground রঙ স্বয়ংক্রিয়ভাবে নির্বাচন করে (L<0.6 এ সাদা
  টেক্সট, নাহলে কালো — contrast maximize)
- `resetAccentColor()` — সব inline override সরিয়ে দেয় (globals.css এর
  মূল ভ্যালুতে ফিরে যায়)

### গাণিতিক Pre-verify (Python, OKLCH→sRGB conversion, বাধ্যতামূলক প্যাটার্ন)
`scripts/verify-theme-contrast.py` এ নতুন সেকশন যোগ করে সব ৫টা রঙে
(light+dark উভয় মোডে) দুটো critical contrast check:
1. primary-foreground vs primary (বাটনের টেক্সট) ≥৪.৫:১ (AA normal
   text) — সব ১০টা কম্বিনেশনে (৫ রঙ × ২ মোড) পাস
2. primary vs background (বাটনের দৃশ্যমানতা) ≥৩:১ (AA UI component) —
   সব ১০টা কম্বিনেশনে পাস

একই script এ পূর্বে ৪টা পূর্ণাঙ্গ থিম (lofi-cafe, dark-academia,
cozy-library, ocean-breeze) ডিজাইন করে দেখা গিয়েছিল border/background
contrast (~1.3-1.5:1) কড়া WCAG AA (৩:১) মানদণ্ড পাস করছে না — কিন্তু
বিদ্যমান ডিফল্ট থিমেই এই gap আছে (light default border vs bg মাত্র
~1.26:1, আগের Color Contrast অডিটেও এই gap স্বীকৃত ও README.md এ
নথিভুক্ত)। এটাই মূলত পূর্ণাঙ্গ theme system এর বদলে accent-only
approach এর দিকে সিদ্ধান্ত ফেরানোর একটা অতিরিক্ত প্রমাণ ছিল।

### Node.js এ Actual Code Import করে Logic Verify (কপি-পেস্ট না)
`lib/accent-theme.ts` থেকে সরাসরি `applyAccentColor()`/
`resetAccentColor()`/`DEFAULT_ACCENT_COLOR` import করে (`tsx` দিয়ে
রান করে) `document.documentElement.style` মক করে যাচাই:
- `DEFAULT_ACCENT_COLOR === "default"` ✅
- `default` apply করলে কোনো CSS property set হয় না ✅ (backward
  compatibility নিশ্চিত)
- `amber` (light) এ সঠিক primary+foreground+ring+chart-1+sidebar মান ✅
- `amber` (dark) এ ভিন্ন সঠিক মান, foreground flip (সাদা→কালো, কারণ
  dark mode এ lightness বেশি) ✅
- `resetAccentColor()` সব property clean করে ✅
- সব ৫টা রঙে (১০টা কম্বিনেশন) batch verify — প্রতিটাতে Python এ
  pre-calculate করা exact OKLCH ভ্যালু ও foreground selection যাচাই ✅

### UI — Settings → থিম ট্যাব
`components/settings/accent-color-picker.tsx` — ৬টা সোয়াচ গ্রিড
(২-৩ কলাম, responsive), প্রতিটাতে রঙের বৃত্ত + label + description,
নির্বাচিত হলে `Check` আইকন + primary border highlight,
`aria-pressed` + keyboard-accessible (native `<button>`)।
`components/settings/settings-form.tsx` এর Appearance tab এ বিদ্যমান
Theme Mode (Light/Dark) কার্ডের নিচে নতুন "অ্যাকসেন্ট রঙ" কার্ড যোগ
করা হয়েছে।

### `components/accent-theme-provider.tsx` — Context + Persistence
`lib/accessibility.ts`/`AccessibilityProvider` এর হুবহু একই প্যাটার্ন
(localStorage key `hsc-ultimate-accent-color`, mount-then-apply,
silent fail on localStorage error)। অতিরিক্তভাবে `next-themes` এর
`useTheme().resolvedTheme` এর সাথে সিঙ্ক করা হয় — light/dark মোড
বদলালে accent color ও reapply হয় (প্রতিটা রঙের আলাদা light/dark
ভ্যালু আছে বলে প্রয়োজন)। `app/providers.tsx` এ `ThemeProvider` এর
ভেতরে (যাতে `useTheme()` কাজ করে) ও `AccessibilityProvider` এর বাইরে
mount করা হয়েছে।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (২৬.১ সেকেন্ড)
- ✅ **লাইভ regression** (Python requests দিয়ে real ইউজার
  রেজিস্টার+লগইন): `/settings` পেজ crash-free লোড (২০০), TabsTrigger
  লেবেল ("থিম") সঠিকভাবে DOM এ উপস্থিত, Appearance panel এর ভেতরের
  কন্টেন্ট ("অ্যাকসেন্ট রঙ" লেবেল) non-active tab অবস্থায় initial
  HTML এ অনুপস্থিত — base-ui Tabs lazy-mount এর established
  false-negative প্যাটার্ন (bug না, এই সেশনে বহুবার নিশ্চিত হওয়া
  আচরণ)
- ✅ **Bundled JS চেক**: compiled `.next` chunk এ
  `hsc-ultimate-accent-color` localStorage key স্ট্রিং সঠিকভাবে
  উপস্থিত, মানে client bundle এ কোড সঠিকভাবে অন্তর্ভুক্ত হয়েছে
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete +
  DB ভেরিফাই (০টা orphan row)
- ✅ সম্পূর্ণ frontend/CSS-only ফিচার (নতুন `lib/accent-theme.ts`,
  `components/accent-theme-provider.tsx`,
  `components/settings/accent-color-picker.tsx`, ২টা ফাইলে সামান্য
  পরিবর্তন — `app/providers.tsx`, `components/settings/settings-
  form.tsx`) — কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): sandbox এ headless browser না থাকায়
  ব্রাউজারে ক্লিক করে actual color picker interaction (সোয়াচে ক্লিক
  করলে সত্যিই রঙ বদলে যায় কিনা ভিজ্যুয়ালি) ম্যানুয়ালি টেস্ট করা সম্ভব
  হয়নি — শুধু compiled bundle presence + isolated logic (actual code
  import করে) verify করা হয়েছে, যা যথেষ্ট শক্তিশালী প্রমাণ কিন্তু
  ব্যবহারকারীর নিজের ব্রাউজারে confirm করা ভালো

## 🏆 Reading Room Study Time Leaderboard ✅ সম্পন্ন

**Accent Color Theme এর পরে "Next" নির্দেশে নিজের সিদ্ধান্তে বেছে নেওয়া
পরবর্তী কাজ — research ডকুমেন্টে (৮ নং সেকশন, ১ নং পয়েন্টের ভেতরে)
"Leaderboard integration" হিসেবে চিহ্নিত করা আইটেম, যেটা Reading Room
মূল ফিচার বানানোর সময় scope এর বাইরে রাখা হয়েছিল এবং পরে যোগ করার
পরিকল্পনা ছিল।**

### ডিজাইন দর্শন
readingroombd.com এর Daily/Weekly/Monthly Study Leaderboard থেকে
অনুপ্রাণিত — কিন্তু এটা বিদ্যমান XP Leaderboard (`lib/league.ts`,
`/leaderboard` পেজ) এর **পাশাপাশি**, প্রতিস্থাপন না। XP Leaderboard
বিভিন্ন activity থেকে (quiz, flashcard, task ইত্যাদি) অর্জিত পয়েন্টের
সমষ্টি দেখায়, যেখানে এই নতুন leaderboard **শুধু Reading Room এ কাটানো
প্রকৃত ফোকাস সময়** এর direct হিসাব দেখায় — দুটো ভিন্ন মেট্রিক, দুটোই
প্রাসঙ্গিক।

### সপ্তাহ-সীমানা সামঞ্জস্য (গুরুত্বপূর্ণ প্রযুক্তিগত সিদ্ধান্ত)
`lib/league.ts` এ ইতিমধ্যে `getCurrentWeekStart()` ফাংশন আছে (UTC-based,
রবিবার মধ্যরাত থেকে সপ্তাহ শুরু, weekly XP league এর জন্য ব্যবহৃত)।
নতুন `getPeriodStartUtc("weekly", ...)` ফাংশন **হুবহু একই লজিক**
ব্যবহার করে (কোড duplicate হলেও, সরাসরি import না করে আলাদা রাখা
হয়েছে কারণ `lib/league.ts` অন্য domain এর জন্য) — যাতে প্ল্যাটফর্মে
দুই জায়গায় "সপ্তাহ কবে শুরু হয়" এই প্রশ্নের ভিন্ন উত্তর না আসে (যেমন
কেউ যদি XP Leaderboard এ শনিবার রাতে "সপ্তাহ শেষ" দেখে, Reading Room
Leaderboard এও একই মুহূর্তে সপ্তাহ শেষ হওয়া উচিত)। Node.js এ উভয়
ফাংশনের output সরাসরি তুলনা করে (`getTime() ===`) হুবহু মিল নিশ্চিত
করা হয়েছে।

### Outlier-Filter (readingroombd.com থেকে দ্বিতীয়বার শেখা শিক্ষা)
readingroombd.com এর "অতিরিক্ত সময় বাদ দিন" ফিচার থেকে Reading Room
মূল ফিচারেই (gaming-প্রতিরোধ ক্যাপ হিসেবে) একবার শেখা হয়েছিল। এখানে
আবার প্রাসঙ্গিক: leaderboard এ ন্যূনতম ৫ মিনিট (৩০০ সেকেন্ড — XP award
এর একই থ্রেশহোল্ড, সামঞ্জস্যতার জন্য পুনর্ব্যবহার করা) ফোকাস না
থাকলে entry দেখানো হয় না। এটা "কয়েক সেকেন্ডের জন্য রুমে ঢুকে বের হয়ে
যাওয়া" ইউজারদের leaderboard এ noise/unfair entry হিসেবে না দেখানোর
জন্য।

### `lib/reading-room.ts` এ নতুন যোগ করা অংশ
- `getPeriodStartUtc(period, now)` — daily/weekly/monthly boundary
  হিসাব (UTC-based)
- `getStudyTimeLeaderboard(period, currentUserId)` — Prisma `groupBy`
  দিয়ে `userId` অনুযায়ী `totalFocusSec` sum + session count, MIN_FOCUS_SEC
  (৩০০) দিয়ে ফিল্টার, sort করে rank assign, টপ ৫০ (`LEADERBOARD_LIMIT`)
  রিটার্ন করে। ইউজার টপ ৫০ এর বাইরে থাকলেও `myEntry` আলাদাভাবে ফেচ করে
  রিটার্ন করে (বিদ্যমান XP Leaderboard পেজের "তুমি #১২৩ নম্বরে আছো"
  UX প্যাটার্ন অনুসরণ করে)

### গাণিতিক Pre-verify (Node.js, কোড লেখার আগেই)
1. **Period boundary logic**: `daily`/`weekly`/`monthly` তিনটার জন্যই
   স্যাম্পল তারিখ (শনিবার) দিয়ে সিমুলেট করে সঠিক boundary (রবিবার
   সপ্তাহের জন্য, মাসের ১ তারিখ মাসের জন্য) নিশ্চিত করা হয়েছে
2. **`lib/league.ts` এর সাথে সাদৃশ্য**: `getCurrentWeekStart()` ও
   `getPeriodStartUtc("weekly", ...)` এর output হুবহু মিলে যাওয়া
   নিশ্চিত (`.getTime() === .getTime()`)
3. **Ranking/filtering simulation**: ৬০ জনের সিমুলেটেড ডেটা (৪ জন
   MIN_FOCUS_SEC এর নিচে) দিয়ে filter+sort+rank logic verify — সঠিক
   সংখ্যক এন্ট্রি বাদ পড়া, সঠিক ranking, টপ ৫০ এর বাইরের ইউজারের rank
   সঠিকভাবে খুঁজে পাওয়া

### API ও UI
- `GET /api/reading-room/leaderboard?period=daily|weekly|monthly` —
  `auth()` চেক, invalid period এ ৪০০
- `/reading-room/leaderboard` পেজ (`components/reading-room/
  reading-room-leaderboard.tsx`) — ৩টা period ট্যাব (বাটন-স্টাইল
  টগল), Crown আইকন #১ এর জন্য, Medal আইকন #২-৩ এর জন্য, নিজের এন্ট্রি
  `ring-2 ring-primary` হাইলাইট, টপ ৫০ এর বাইরে থাকলে "···" বিভাজক
  দিয়ে নিজের এন্ট্রি আলাদাভাবে নিচে দেখানো
- Reading Room Dashboard এর header এ নতুন "লিডারবোর্ড" বাটন
  (`Trophy` আইকন) যোগ করা হয়েছে

### কোড রিফ্যাক্টর — `formatDuration` Extraction
Reading Room Dashboard কম্পোনেন্টে থাকা `formatDuration()` ফাংশনটা
নতুন Leaderboard কম্পোনেন্টেও দরকার হওয়ায়, duplicate না করে
`lib/format-duration.ts` এ (নতুন ফাইল, `formatDurationBn` নামে) সরানো
হয়েছে। **⚠️ গুরুত্বপূর্ণ কারণ**: `lib/reading-room.ts` সার্ভার-অনলি
কোড (Prisma import করে) — client component এ সেটা import করলে bundle
এ Prisma চলে আসত, যা ভুল হতো। তাই আলাদা pure-function ফাইল তৈরি করা
হয়েছে যেটা client ও server উভয় জায়গায় নিরাপদে ব্যবহারযোগ্য।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (২৯.০ সেকেন্ড) — `/reading-room/
  leaderboard` ও `/api/reading-room/leaderboard` উভয়ই route list এ
  সঠিকভাবে উপস্থিত
- ✅ **লাইভ multi-user End-to-End টেস্ট** (নতুন `scripts/test-reading-
  room-leaderboard.py`, real HTTP + psycopg2 দিয়ে totalFocusSec সরাসরি
  সেট করে): ৩জন ইউজার (Alice=৩৬০০সে/১ঘণ্টা, Bob=১২০০সে/২০মি,
  Charlie=১০০সে/থ্রেশহোল্ডের নিচে) — Charlie leaderboard এ অনুপস্থিত
  (outlier filter ✅), Alice #1/Bob #2 ranking সঠিক ✅, `isMe` flag
  সঠিক ✅, `myEntry` সঠিক (Alice এর জন্য rank #1, Charlie এর জন্য
  null) ✅, daily/monthly period উভয়ই কাজ করছে ✅ — মোট ১৩টা assertion
  পাস
- ✅ **টপ-৫০ এর বাইরে rank verify**: আলাদা ইউজার দিয়ে shared-DB এর
  অন্য ডেটার সাথে মিশ্রিত অবস্থাতেও `myEntry` সঠিকভাবে পাওয়া যাচ্ছে
  নিশ্চিত করা হয়েছে
- ✅ **Edge-case/authorization**: unauthenticated API → ৪০১, invalid
  period → ৪০০, unauthenticated পেজ → ৩০৭ (middleware `/reading-room/
  :path*` prefix এর আওতায় স্বয়ংক্রিয় protected, আলাদা matcher entry
  লাগেনি) — সব পাস
- ✅ Test data cleanup: ৫টা টেস্ট ইউজার `/api/user/delete-account`
  দিয়ে delete, cascade delete verify (০টা orphan `reading_room_
  sessions` row)
- ✅ সম্পূর্ণ schema-free ফিচার (বিদ্যমান `ReadingRoomSession` মডেলের
  `totalFocusSec`/`createdAt`/`userId` কলাম পুনর্ব্যবহার করে, কোনো নতুন
  কলাম/মডেল লাগেনি) — কোনো migration লাগেনি, কোনো নতুন dependency
  লাগেনি

## ♿ Border/Background Color Contrast (WCAG 1.4.11) — আগে থেকে স্বীকৃত gap সম্পূর্ণ করা ✅ সম্পন্ন

**Reading Room Study Time Leaderboard এর পরে "Next" নির্দেশে নিজের
সিদ্ধান্তে বেছে নেওয়া পরবর্তী কাজ — এবার নতুন কোনো feature research
থেকে না, বরং কোডবেসে বহুদিন ধরে transparency নোট হিসেবে স্বীকৃত একটা
পুরনো accessibility gap সম্পূর্ণ করা হলো।**

### প্রেক্ষাপট
অনেক আগে "Color Contrast (WCAG AA) অডিট ও ফিক্স" ফিচারে OKLCH→sRGB
conversion দিয়ে theme CSS variable এবং raw Tailwind `text-{color}`
foreground প্যাটার্ন যাচাই করে ৩৮টা ফাইলে ৭৩টা instance ফিক্স করা
হয়েছিল। কিন্তু তখনই স্পষ্টভাবে transparency নোটে লেখা ছিল: "border/
background color contrast এর মতো অন্য jsx প্যাটার্ন এখনো অডিট করা
হয়নি"। এই সেশনে অন্য কোনো ফিচার আইডিয়া না খুঁজে, সরাসরি এই পুরনো
স্বীকৃত gap সম্পূর্ণ করার সিদ্ধান্ত নেওয়া হয়েছে।

### অডিট পদ্ধতি — `scripts/audit-border-contrast.py`
Tailwind v4 এর official hex color palette হার্ডকোড করে (যেহেতু
runtime এ actual browser render থেকে computed style বের করার উপায়
sandbox এ নেই), কোডবেসে `grep` দিয়ে খোঁজা সব `border-{color}-{shade}`
(raw Tailwind color, theme CSS variable না) প্যাটার্নের contrast ratio
হিসাব করা হয়েছে — card background (light `#ffffff`, dark `#1f1f1f`
approx) এর বিপরীতে, WCAG 1.4.11 (Non-text Contrast) এর ≥৩:১ UI
component boundary থ্রেশহোল্ড অনুযায়ী।

### আবিষ্কার — ১৩টা Instance Light Mode এ Fail করছিল
`confidence-selector.tsx` (SURE/NOT_SURE state indicator),
`task-manager.tsx`+`study-plan-card.tsx` (MEDIUM/LOW priority border),
`pretest-runner.tsx` (recommendSkip badge), `learn/[subjectId]`
(mastered status badge), `deck-card-list.tsx` (২টা card-type badge
outline — cloze/image-occlusion), `post-detail.tsx` (best-answer reply
border) — সবগুলো light mode এ ২.১৫:১ থেকে ২.৭২:১ এর মধ্যে ছিল
(dark mode এ সবগুলোই আগে থেকে পাস করছিল, কারণ dark background এর
বিপরীতে একই মাঝারি-উজ্জ্বল রঙ স্বাভাবিকভাবেই বেশি কনট্রাস্ট পায়)।

### ফিক্স প্যাটার্ন — এক ধাপ গাঢ় Shade, dark:variant ছাড়াই উভয় মোড কভার
প্রতিটা রঙকে ঠিক এক ধাপ গাঢ় করা হয়েছে:
- `amber-500` → `amber-600`
- `emerald-500` → `emerald-600`
- `violet-400` → `violet-500`
- `slate-400` → `slate-500`

**গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত**: প্রতিটা candidate darker shade
Python এ আগে থেকে যাচাই করা হয়েছে যে সেটা **light ও dark উভয় মোডেই**
৩:১ এর বেশি অর্জন করে (dark card background `#1f1f1f` এর বিপরীতেও
একটা গাঢ় রঙ প্রায়ই যথেষ্ট কনট্রাস্ট রাখে, কারণ dark card তুলনামূলক
কম উজ্জ্বল)। এর ফলে কোনো নতুন `dark:` variant override যোগ করতে
হয়নি — একটামাত্র color class দিয়ে উভয় মোড কভার হয়েছে, কোড পরিবর্তন
সর্বনিম্ন ও সরল থেকেছে।

### Decorative Border ইচ্ছাকৃতভাবে স্কিপ করা (সচেতন Scope সিদ্ধান্ত)
`predicted-gpa-card.tsx`, `topic-note-editor.tsx`,
`wrong-answers-to-flashcards-button.tsx` এ পাওয়া `border-{color}-500/20`
(low-opacity) প্যাটার্ন গুলো ইচ্ছাকৃতভাবে **অপরিবর্তিত** রাখা হয়েছে।
এগুলো purely decorative info-callout box এর হালকা রূপরেখা (কোনো
interactive state/pass-fail/priority নির্দেশ করে না, শুধু একটা
তথ্যপূর্ণ background box কে subtle ভাবে define করে) — WCAG 1.4.11
মূলত "UI Component" এর boundary তে প্রযোজ্য (checkbox, active state,
focus indicator ইত্যাদি), pure decorative container বর্ডার
technically exempted।

### গাণিতিক Pre-verify (Python, বাধ্যতামূলক প্যাটার্ন, দুই ধাপে)
1. **ফিক্সের আগে**: সব candidate instance এর contrast ratio হিসাব করে
   ঠিক কোনগুলো fail করছে (light/dark উভয় মোডে) তালিকা তৈরি
2. **ফিক্সের পরে**: চূড়ান্ত darker shade গুলো দিয়ে script আবার চালিয়ে
   ১২/১২ instance (confidence-selector ২টা + priority border ৫টা +
   recommendation/status badge ২টা + drawing box ১টা + card-type
   badge ২টা) light ও dark উভয় মোডে ৩:১ এর বেশি নিশ্চিত করা হয়েছে
   (post-detail.tsx এর best-answer border আলাদাভাবে blended-background
   গণনা দিয়ে যাচাই করা হয়েছে, কারণ সেটার নিজস্ব alpha-tinted background
   আছে)

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন
- ✅ `pnpm build` প্রথম চেষ্টাতেই সফল (২৬.০ সেকেন্ড)
- ✅ **Compiled CSS verify**: `.next/static/chunks/*.css` এ
  `border-emerald-600`, `border-amber-600`, `border-slate-500`,
  `border-violet-500` ক্লাসগুলো সঠিকভাবে জেনারেট হয়েছে নিশ্চিত করা
  হয়েছে
- ✅ **লাইভ regression** (Python requests দিয়ে real ইউজার): `/planner`,
  `/flashcards` পেজ crash-free লোড, Task তৈরি API (priority field সহ)
  ঠিকমতো কাজ করছে — border color পরিবর্তনে কোনো functional regression
  হয়নি
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই
- ✅ সম্পূর্ণ frontend/CSS-only ফিচার (৭টা কম্পোনেন্ট ফাইলে ১৩টা
  instance পরিবর্তিত: `confidence-selector.tsx`, `task-manager.tsx`,
  `study-plan-card.tsx`, `pretest-runner.tsx`, `learn/[subjectId]/
  page.tsx`, `deck-card-list.tsx`, `post-detail.tsx`) — কোনো migration
  লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): বিদ্যমান ডিফল্ট থিমের নিজস্ব `--border`
  CSS variable (grayscale) নিজেই আনুমানিক ~১.৩:১ (৩:১ থ্রেশহোল্ডের
  অনেক নিচে) — এটা এই ফিচারের ইচ্ছাকৃত scope এর বাইরে রাখা হয়েছে,
  কারণ theme-wide default border color পরিবর্তন করলে card/input/
  divider সহ পুরো প্ল্যাটফর্মের ভিজ্যুয়াল চেহারা ব্যাপকভাবে বদলে
  যেত (আলাদা, অনেক বড় ও ঝুঁকিপূর্ণ কাজ — Accent Color Theme ফিচারে
  ঠিক এই কারণেই পূর্ণাঙ্গ palette redesign এড়ানো হয়েছিল)। এই ফিচারে
  শুধু নিজে থেকে একটা নির্দিষ্ট রঙ বেছে নেওয়া state-indicating/
  interactive raw-color border গুলো ঠিক করা হয়েছে, যা নিরাপদ ও
  স্বল্প-ঝুঁকিপূর্ণ ছিল। Screen reader ম্যানুয়াল টেস্টিং এখনো বাকি
  (অন্যান্য accessibility ফিচারের মতোই ধারাবাহিকভাবে transparency
  নোটে উল্লেখ করা হচ্ছে)।

## 💬 Forum Reply-level Timestamp — আগে থেকে স্বীকৃত gap সম্পূর্ণ করা ✅ সম্পন্ন

**Border/Background Color Contrast এর পরে "Next" নির্দেশে বেছে নেওয়া
আরেকটা পুরনো transparency নোট সম্পূর্ণ করা — "Relative Time
Formatting" ফিচারে স্পষ্টভাবে স্বীকৃত ছিল "forum reply-level timestamp
এখনো নেই"।**

### রুট কজ ও ফিক্স
`components/forum/post-detail.tsx` এর `Reply` TypeScript interface এ
ইতিমধ্যে `createdAt: string` টাইপ ঘোষিত ছিল, এবং backend API
(`GET /api/forum/posts/[postId]`) থেকে Prisma default select এর
মাধ্যমে `createdAt` ডেটা আগে থেকেই সঠিকভাবে আসছিল — শুধু JSX এ reply
রেন্ডার করার সময় সেই ফিল্ডটা ব্যবহার করা হচ্ছিল না। তাই এটা একটা
"ডেটা আছে কিন্তু দেখানো হচ্ছে না" ধরনের সহজ, নিরাপদ এক-লাইন ফিক্স
ছিল — কোনো নতুন API পরিবর্তন বা migration লাগেনি।

```tsx
<span>
  {reply.user.name} · {formatRelativeOrDate(reply.createdAt)}
</span>
```

বিদ্যমান `formatRelativeOrDate()` (`lib/format-date.ts`, date-fns এর
বিল্ট-ইন বাংলা locale ব্যবহার করে, "Relative Time Formatting" ফিচারে
বানানো) পুনর্ব্যবহার করা হয়েছে — post-level timestamp এর ঠিক একই
প্যাটার্ন অনুসরণ করে (৭ দিনের মধ্যে relative, তার বেশি পুরনো হলে
পূর্ণ তারিখ)।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৮.৯ সেকেন্ড)
- ✅ **লাইভ End-to-End টেস্ট** (দুইজন real ইউজার, বাস্তবসম্মত কনটেন্ট
  দিয়ে — anti-spam moderation filter false-positive এড়াতে): "Post
  Author" একটা প্রকৃত পদার্থবিজ্ঞান প্রশ্ন পোস্ট করে, "Reply Author"
  একটা প্রকৃত উত্তর দেয়, `GET /api/forum/posts/[postId]` কল করে
  reply এর `createdAt` ফিল্ড সঠিকভাবে উপস্থিত ও non-empty নিশ্চিত
  করা হয়েছে, `/forum/[postId]` পেজ crash-free লোড হয়েছে
- ✅ **Node.js এ actual function verify**: `lib/format-date.ts` থেকে
  `formatRelativeOrDate()` সরাসরি import করে, API থেকে পাওয়া প্রকৃত
  ISO timestamp দিয়ে কল করে সঠিক বাংলা আউটপুট ("প্রায় ১ মিনিট আগে")
  নিশ্চিত করা হয়েছে
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে দুইজন ইউজার
  delete, DB তে `forum_posts` ও `forum_replies` উভয়ের cascade delete
  verify (০টা orphan row)
- ✅ সম্পূর্ণ frontend-only ফিচার (`components/forum/post-detail.tsx`
  একমাত্র পরিবর্তিত ফাইল, ৩ লাইন পরিবর্তন) — কোনো migration লাগেনি,
  কোনো নতুন dependency লাগেনি

## ♿ Notification Bell/Center — Nested-Interactive HTML ফিক্স ✅ সম্পন্ন

**Forum Reply-level Timestamp এর পরে "Next" নির্দেশে বেছে নেওয়া
আরেকটা পুরনো accessibility transparency নোট সম্পূর্ণ করা — অনেক আগে
"Keyboard Navigation অডিট ও ফিক্স" ফিচারে স্পষ্টভাবে স্বীকৃত ছিল:
"`notification-bell.tsx` dropdown আইটেম এখনো nested-interactive
pattern (semantically ideal না হলেও keyboard-operable)"।**

### সমস্যা — Nested Interactive Elements (Invalid HTML)
`components/layout/notification-bell.tsx` ও `components/notifications/
notification-center.tsx` উভয় ফাইলেই একই প্যাটার্ন ছিল:

```tsx
<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>
  {/* notification content */}
  <button onClick={deleteHandler} aria-label="মুছে ফেলো">
    <Trash2 />
  </button>
</div>
```

HTML স্পেসিফিকেশন অনুযায়ী একটা interactive element (এখানে
`role="button"` দেওয়া `<div>`) এর ভেতরে আরেকটা প্রকৃত interactive
element (`<button>`) রাখা **অবৈধ** (nested-interactive/nested-button
সমস্যা)। এটা কীবোর্ড দিয়ে টেকনিক্যালি কাজ করছিল (তাই আগে কোনো
গুরুত্বপূর্ণ bug হিসেবে ধরা পড়েনি, `e.stopPropagation()` দিয়ে click
event bubble সামলানো হচ্ছিল), কিন্তু screen reader/assistive
technology এ semantically বিভ্রান্তিকর — কিছু স্ক্রিন রিডার নেস্টেড
interactive element ঠিকমতো announce নাও করতে পারে, বা focus order
অপ্রত্যাশিত হতে পারে।

### ফিক্স — Sibling Button Structure
Container `<div>` কে সম্পূর্ণ non-interactive রেখে, ভেতরে দুটো
**sibling** (nested না) `<button>` বানানো হয়েছে:

```tsx
<div className="border-b group relative">
  <div className="flex items-start gap-2">
    <button type="button" onClick={handleClick} className="flex-1 ...">
      {/* notification content */}
    </button>
    <button onClick={deleteHandler} aria-label="মুছে ফেলো">
      <Trash2 />
    </button>
  </div>
</div>
```

মূল কন্টেন্ট বাটন `flex-1` দিয়ে বেশিরভাগ প্রস্থ নেয় (আগের ক্লিকযোগ্য
এলাকার কাছাকাছি অনুভূতি বজায় রাখতে), delete বাটন আলাদা sibling হিসেবে
পাশে থাকে। উভয়ই স্বাধীনভাবে keyboard-focusable (native `<button>`
হওয়ায় `role`/`tabIndex`/`onKeyDown` ম্যানুয়ালি বসাতে হয়নি — এটা
অতিরিক্ত উপকার, কোড আরও সরল হয়েছে) এবং কোনো nested-interactive HTML
অবশিষ্ট নেই।

### ভেরিফিকেশন পদ্ধতি
Python দিয়ে সরাসরি সোর্স কোড স্ক্যান করে (`role="button"` স্ট্রিং
সার্চ) উভয় ফাইলে নিশ্চিত করা হয়েছে কোনো অবশিষ্ট nested-interactive
pattern নেই।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৭.৬ সেকেন্ড)
- ✅ **লাইভ End-to-End টেস্ট** (real ইউজার + psycopg2 দিয়ে টেস্ট
  নোটিফিকেশন insert করে): `PATCH /api/notifications/[id]` (মূল
  কন্টেন্ট বাটনের ক্লিক হ্যান্ডলার backend) ও `DELETE /api/
  notifications/[id]` (delete বাটনের ক্লিক হ্যান্ডলার backend) উভয়ই
  সঠিকভাবে কাজ করছে যাচাই — mark-as-read verify, delete verify (তালিকা
  থেকে সত্যিই বাদ পড়া নিশ্চিত), `/notifications` পেজ crash-free লোড
- ✅ **Source code verify**: Python regex দিয়ে উভয় ফাইলে
  `role="button"` অনুপস্থিত নিশ্চিত করা হয়েছে
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (notifications টেবিলে ০টা orphan row)
- ✅ সম্পূর্ণ frontend-only ফিচার (২টা ফাইল পরিবর্তিত) — কোনো
  migration লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): screen reader ম্যানুয়াল টেস্টিং
  (VoiceOver/NVDA) sandbox এ সম্ভব হয়নি — শুধু HTML structure/source
  code যাচাই করা হয়েছে, তবে semantically সঠিক sibling-button প্যাটার্নে
  রূপান্তরের ফলে theoretically screen reader compatibility উন্নত
  হওয়ার কথা

## 🛠️ Admin Panel ফর্ম ইনলাইন ভ্যালিডেশন + PATCH Endpoint বাগ ফিক্স ✅ সম্পন্ন

**Notification Bell/Center Nested-Interactive HTML ফিক্সের পরে "Next"
নির্দেশে বেছে নেওয়া আরেকটা পুরনো accessibility gap — "Auth ফর্ম
ইনলাইন ভ্যালিডেশন", "Settings ফর্ম ইনলাইন ভ্যালিডেশন", ও
"Student-Facing ফর্ম ইনলাইন ভ্যালিডেশন" — এই তিনটা ফিচারেই
transparency নোটে বারবার লেখা ছিল "admin panel ফর্মে এখনো একই
প্যাটার্ন প্রয়োগ করা হয়নি (ইচ্ছাকৃতভাবে, কম ব্যবহারকারী-প্রভাব)"।**

### Scope সিদ্ধান্ত
প্ল্যাটফর্মে ১১টা admin কম্পোনেন্ট আছে, কিন্তু এই ফিচারে সবচেয়ে বেশি
ব্যবহৃত **core content management** ৩টা ফর্ম prioritize করা হয়েছে:
`subject-manager.tsx`, `chapter-manager.tsx`, `topic-manager.tsx`
(এগুলোই সিলেবাস কাঠামোর ভিত্তি — নতুন সাবজেক্ট/চ্যাপ্টার/টপিক যোগ করার
একমাত্র উপায়)। অন্যান্য admin ফর্ম (question-manager,
cq-question-manager, notification-broadcast-form ইত্যাদি) ইচ্ছাকৃতভাবে
এই ফিচারের scope এর বাইরে রাখা হয়েছে (transparency নোটে স্পষ্ট করা
আছে)।

### ফিক্স প্যাটার্ন (বিদ্যমান student-facing ফর্মের হুবহু অনুসরণ)
তিনটা ফর্মেই একই প্যাটার্ন প্রয়োগ:
```tsx
const [fieldErrors, setFieldErrors] = useState<{ name?: string; nameEn?: string }>({});

function validate() {
  const errors: { name?: string; nameEn?: string } = {};
  if (!form.name.trim()) errors.name = "বাংলা নাম আবশ্যক";
  if (!form.nameEn.trim()) errors.nameEn = "ইংরেজি নাম আবশ্যক";
  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
}
```
প্রতিটা `Input` এ `aria-invalid`+`aria-describedby`+conditional visible
`role="alert"` error message, এবং Dialog `onOpenChange` এ fieldErrors
রিসেট করা হয় (dialog বন্ধ করে আবার খুললে পুরনো এরর না দেখানোর জন্য)।

`topic-manager.tsx` তে **দুটো** ফর্ম আছে (Create + Edit) — দুটোর জন্য
আলাদা `fieldErrors`/`editFieldErrors` state, কিন্তু শেয়ার্ড
`validate(f)` ফাংশন (parameter নেয়) দিয়ে duplicate validation logic
এড়ানো হয়েছে।

### 🐛 লাইভ টেস্টে ধরা পড়া প্রকৃত Server-Side বাগ
Live end-to-end টেস্ট করার সময় (client-side ভ্যালিডেশন bypass করে
সরাসরি API তে খালি ডেটা পাঠিয়ে "server ঠিকই ব্লক করছে কিনা" verify
করার established defense-in-depth চেকপয়েন্ট অনুসরণ করে) একটা প্রকৃত
bug ধরা পড়ে:

`PATCH /api/admin/topics/[topicId]` — POST (create) endpoint এ
`if (!name?.trim() || !nameEn?.trim())` চেক ছিল, কিন্তু **PATCH
(update) endpoint এ কোনো validation ছিল না**। যেহেতু PATCH এর ফিল্ড
ঐচ্ছিকভাবে আপডেট হয় (`name !== undefined && { name }` spread
প্যাটার্ন), `name: ""` (খালি স্ট্রিং, `undefined` না) পাঠালে সেই চেক
সম্পূর্ণ bypass হয়ে যেত — সরাসরি DB তে খালি নাম সেভ হয়ে যাচ্ছিল
(২০০ status, ৪০০ হওয়া উচিত ছিল)। একই প্যাটার্নের সমস্যা `PATCH /api/
admin/chapters/[chapterId]` ও `PATCH /api/admin/subjects/[subjectId]`
এও পাওয়া গেছে — এই তিনটা এন্ডপয়েন্টই কখনো defense-in-depth নিয়মে
আগে অডিট হয়নি (কারণ UI তে আগে এই ফিল্ডে ভ্যালিডেশন-ই ছিল না, তাই
bypass টেস্ট করার প্রয়োজনও পড়েনি — এই ফিচারেই প্রথমবার সেই টেস্ট
চালানো হয়েছে)।

**ফিক্স** (তিনটা PATCH endpoint এ অভিন্ন প্যাটার্ন):
```ts
if (name !== undefined && !name.trim()) {
  return NextResponse.json({ error: "বাংলা নাম খালি রাখা যাবে না" }, { status: 400 });
}
if (nameEn !== undefined && !nameEn.trim()) {
  return NextResponse.json({ error: "ইংরেজি নাম খালি রাখা যাবে না" }, { status: 400 });
}
// ... data তে .trim() করে সেভ (create endpoint এর সাথে সামঞ্জস্যপূর্ণ)
```

### Node.js এ সংখ্যাগত/লজিক Pre-verify
`validate()` ফাংশনের জন্য ৬টা কেস (উভয় খালি, একটা খালি, দুটোই ভরা,
শুধু whitespace) — সব ৬/৬ পাস, `trim()` সঠিকভাবে whitespace-only
input কে empty হিসেবে ধরছে নিশ্চিত করা হয়েছে।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৬.৫ সেকেন্ড)
- ✅ **লাইভ End-to-End টেস্ট** (Admin role সহ real ইউজার — টেস্ট
  সেটআপে psycopg2 দিয়ে `role` কলাম সরাসরি `ADMIN` করে re-login করে
  নতুন JWT নেওয়া হয়েছে, এটা business-logic bypass না বরং শুধু
  পরীক্ষার জন্য admin session তৈরি): Subject→Chapter→Topic সম্পূর্ণ
  chain তৈরি, Topic Edit (update) সফল, cascade delete (subject
  delete করলে chapter+topic ও মুছে যাওয়া) verify
- ✅ **Defense-in-depth ভেরিফিকেশন (নতুন)**: সব ৩টা এন্টিটির জন্য
  POST (create, আগে থেকেই ছিল) ও **PATCH (update, নতুন ফিক্স)**
  উভয়েই খালি নাম দিয়ে কল করে ৪০০ পাওয়া নিশ্চিত করা হয়েছে — এবং
  বৈধ ডেটা দিয়ে এখনো সব operation সঠিকভাবে কাজ করছে (regression নেই)
- ✅ **Edge-case/authorization**: unauthenticated `/admin/subjects`
  → ৩০৭, unauthenticated PATCH API → ৪০১ — middleware protection
  অপরিবর্তিত
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (test subject/chapter/topic এর cascade delete verify)
- ✅ সম্পূর্ণ frontend+backend ফিক্স (৬টা ফাইল পরিবর্তিত: ৩টা
  কম্পোনেন্ট + ৩টা API route) — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): অন্যান্য admin ফর্ম (question-manager,
  cq-question-manager, notification-broadcast-form, user-manager
  ইত্যাদি) এখনো এই ইনলাইন ভ্যালিডেশন প্যাটার্নে আপডেট হয়নি (ইচ্ছাকৃত
  scope সীমাবদ্ধতা, ভবিষ্যতে প্রয়োজনে করা যাবে), screen reader
  ম্যানুয়াল টেস্টিং এখনো বাকি

## 📝 Topic Manager Unsaved Changes Warning — আগে থেকে স্বীকৃত gap সম্পূর্ণ করা ✅ সম্পন্ন

**Admin Panel ফর্ম ইনলাইন ভ্যালিডেশন এর পরে "Next" নির্দেশে বেছে নেওয়া
আরেকটা পুরনো transparency নোট — "Unsaved Changes Warning
(beforeunload)" ফিচারে স্পষ্টভাবে লেখা ছিল: "admin panel এর অন্য
content-heavy ফর্মে (topic-manager notesMarkdown) এখনো প্রয়োগ করা
হয়নি"।**

### প্রেক্ষাপট
`topic-manager.tsx` এ Create ও Edit দুটো ডায়ালগেই `notesMarkdown`
(টপিকের বিস্তারিত নোট) ও `formulaSheet` (গুরুত্বপূর্ণ সূত্র) এর জন্য
বড় `Textarea` আছে — admin অনেকটা সময় নিয়ে দীর্ঘ markdown/LaTeX
কনটেন্ট লিখতে পারেন। এই ধরনের content-heavy ফর্মেই ভুলবশত ট্যাব বন্ধ/
রিফ্রেশ করে সব হারানোর ঝুঁকি সবচেয়ে বেশি — ঠিক এই কারণেই বিদ্যমান
`hooks/use-unsaved-changes-warning.ts` হুকটা `topic-note-editor.tsx`
(ছাত্র-facing Topic Note Editor) তে বানানো হয়েছিল, কিন্তু admin panel
এর সমতুল্য ফর্মে তখন প্রয়োগ করা হয়নি (transparency নোটে স্বীকৃত)।

### বাস্তবায়ন
বিদ্যমান hook **কোনো পরিবর্তন ছাড়াই** পুনর্ব্যবহার করা হয়েছে —
`useUnsavedChangesWarning(hasUnsavedChanges: boolean)`। দুটো আলাদা
`hasChanges` ভ্যারিয়েবল তৈরি করে OR দিয়ে একত্রিত করা হয়েছে (Create ও
Edit dialog একই সময়ে দুটোই খোলা থাকে না, কিন্তু defensive coding
হিসেবে):

```tsx
const createHasChanges = open && (
  form.name.trim() !== "" || form.nameEn.trim() !== "" ||
  form.videoUrl.trim() !== "" || form.notesMarkdown.trim() !== "" ||
  form.formulaSheet.trim() !== ""
);
const editHasChanges = editingId !== null && (
  editForm.name !== editSavedForm.name ||
  editForm.nameEn !== editSavedForm.nameEn ||
  editForm.isImportant !== editSavedForm.isImportant ||
  editForm.videoUrl !== editSavedForm.videoUrl ||
  editForm.notesMarkdown !== editSavedForm.notesMarkdown ||
  editForm.formulaSheet !== editSavedForm.formulaSheet
);
useUnsavedChangesWarning(createHasChanges || editHasChanges);
```

**Create ফর্ম**: কোনো "আগের সেভ করা ভ্যালু" নেই তুলনা করার মতো (নতুন
তৈরি হচ্ছে), তাই dialog খোলা অবস্থায় যেকোনো ফিল্ডে non-empty ভ্যালু
থাকলেই "পরিবর্তন আছে" ধরা হয়।

**Edit ফর্ম**: `openEdit()` কল হওয়ার সময় একটা স্ন্যাপশট
(`editSavedForm`) নেওয়া হয় (`topic-note-editor.tsx` এর `content !==
savedContent` প্যাটার্নের হুবহু অনুসরণ) — বর্তমান `editForm` এর সাথে
সেই স্ন্যাপশটের তুলনা করে পরিবর্তন detect করা হয়। সফলভাবে সেভ হলে
`editSavedForm` কে নতুন মান দিয়ে আপডেট করা হয় (`setEditSavedForm
(editForm)`), যাতে dialog বন্ধ করার সময় আর false-positive warning না
দেখায়।

### Node.js এ Pre-verify (৯টা কেস)
Create ফর্মের ৫টা কেস (dialog বন্ধ/খোলা, খালি/ভরা ফিল্ড, whitespace-
only trim হ্যান্ডলিং) ও Edit ফর্মের ৪টা কেস (কোনো editingId নেই,
unchanged, textarea পরিবর্তন, boolean toggle) — সব ৯/৯ পাস, লজিক
লেখার আগেই যাচাই করা হয়েছে।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৮.৭ সেকেন্ড)
- ✅ **লাইভ End-to-End regression টেস্ট** (Admin role সহ real ইউজার):
  দীর্ঘ `notesMarkdown` (৫× repeat করা বাক্য) সহ Topic create সফল,
  Topic update (edit flow) সফল — hook যোগ হওয়ার পরেও কোনো functional
  regression হয়নি, `/admin/subjects` পেজ crash-free লোড
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (test subject/chapter/topic cascade delete)
- ✅ সম্পূর্ণ frontend-only ফিচার (১টা ফাইল পরিবর্তিত:
  `topic-manager.tsx`) — কোনো migration লাগেনি, কোনো নতুন dependency
  লাগেনি (বিদ্যমান hook পুনর্ব্যবহার)
- ⚠️ এখনো বাকি (transparency): hook এর established সীমাবদ্ধতা (শুধু
  full page unload/reload/close ধরে, Next.js client-side navigation
  এ কাজ করে না — App Router এ stable public API নেই) এখানেও প্রযোজ্য;
  অন্য admin ফর্ম (question-manager এর দীর্ঘ CQ/MCQ টেক্সট ফিল্ড)
  এখনো এই প্যাটার্নে আপডেট হয়নি; ব্রাউজার-লেভেল visual popup dialog
  sandbox এ headless browser না থাকায় দেখা সম্ভব হয়নি

## ✅ Task Manager Title ইনলাইন ভ্যালিডেশন ফিডব্যাক ✅ সম্পন্ন

**Topic Manager Unsaved Changes Warning এর পরে "Next" নির্দেশে বেছে
নেওয়া আরেকটা পুরনো transparency নোট — "Password Visibility Toggle"
ফিচারে লেখা ছিল "quiz-battle/task-manager এর মতো ছোট single-line
ইনপুটে এখনো প্রয়োগ করা হয়নি" (student-facing ফর্ম ইনলাইন ভ্যালিডেশন
প্যাটার্নের রেফারেন্স)।**

### আবিষ্কার
`components/planner/task-manager.tsx` এর নতুন-টাস্ক ইনপুটে খালি
title দিলে শুধু বাটন `disabled={adding || !newTitle.trim()}` হয়ে
যেত — কোনো visible error message ছাড়াই। ইউজার (বিশেষ করে মোবাইলে বা
Enter কী চেপে) বুঝতে পারত না কেন কিছু হচ্ছে না।

### ফিক্স
`titleError` state যোগ করে বিদ্যমান student-facing ফর্মের (Forum Post
ইত্যাদি) একই প্যাটার্ন প্রয়োগ — খালি title দিয়ে সাবমিট করলে "টাস্কের
নাম আবশ্যক" visible error (`aria-invalid`+`aria-describedby`+
`role="alert"`), টাইপ শুরু করলে এরর clear হয়। বাটনের disabled
কন্ডিশন থেকে `!newTitle.trim()` সরিয়ে দেওয়া হয়েছে (সবসময় ক্লিকযোগ্য,
ক্লিকে validate() চলে) — raw disabled-button থেকে ভালো UX।

Server-side (`POST /api/tasks`) ইতিমধ্যেই খালি title এ ৪০০ রিটার্ন
করছিল বলে লাইভ টেস্টে verify করা গেছে — এই ফিচারে কোনো backend
পরিবর্তন লাগেনি।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৯.৮ সেকেন্ড)
- ✅ **লাইভ End-to-End regression** (real ইউজার): বৈধ টাস্ক তৈরি সফল,
  খালি title এ server-side ৪০০ (client fix থেকে independent verify),
  toggle/delete flow disabled-logic পরিবর্তনের পরেও ঠিকমতো কাজ করছে,
  `/planner` পেজ crash-free লোড
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই
- ✅ সম্পূর্ণ frontend-only ফিচার (১টা ফাইল পরিবর্তিত) — কোনো
  migration লাগেনি, কোনো নতুন dependency লাগেনি
- ⚠️ পর্যালোচনা করে সিদ্ধান্ত: Quiz Battle Create Form এ বড় gap নেই
  (title fallback আছে, subject select এ default value) — তাই
  ইচ্ছাকৃতভাবে পরিবর্তন করা হয়নি; screen reader ম্যানুয়াল টেস্টিং
  এখনো বাকি

## 🔒 Question/CQ Question PATCH Endpoint বাগ ফিক্স (প্রোঅ্যাক্টিভ অডিট) ✅ সম্পন্ন

**Task Manager Title ইনলাইন ভ্যালিডেশনের পরে "Next" নির্দেশে বেছে নেওয়া
কাজ — Admin Panel ফর্ম ইনলাইন ভ্যালিডেশন ফিচারে Subject/Chapter/Topic
এর PATCH endpoint এ পাওয়া bug প্যাটার্ন (POST এ validation আছে, PATCH
এ নেই) কোডবেসের **বাকি সব** admin PATCH endpoint এ প্রোঅ্যাক্টিভলি
অডিট করে দেখা হলো।**

### অডিট পদ্ধতি
`find app/api/admin -name "route.ts" | xargs grep -l "export async
function PATCH"` দিয়ে প্ল্যাটফর্মের সব ৮টা admin PATCH endpoint
তালিকাভুক্ত করে প্রতিটা ম্যানুয়ালি পড়ে দেখা হয়েছে — কোন ফিল্ড
আবশ্যক (non-nullable/required in schema বা business logic অনুযায়ী)
এবং সেই ফিল্ডের জন্য PATCH এ কোনো `.trim()`/empty-check validation
আছে কিনা।

### আবিষ্কার — আরও ২টা এন্ডপয়েন্টে একই বাগ
- **`PATCH /api/admin/questions/[questionId]`**: `text`,
  `correctAnswer`, `options` এর কোনো validation ছিল না। POST (create,
  `app/api/admin/topics/[topicId]/questions/route.ts`) এ
  `!text?.trim() || !correctAnswer?.trim()` চেক ছিল, কিন্তু PATCH এ
  একই bug প্যাটার্ন (undefined vs empty-string distinction bypass)।
- **`PATCH /api/admin/cq-questions/[cqQuestionId]`**: `stimulus`,
  `questionA`, `questionB`, `questionC`, `questionD` — এই ৫টা আবশ্যক
  ফিল্ডের কোনোটারই validation ছিল না PATCH এ, যদিও POST এ সবগুলোর
  জন্য চেক ছিল।

### ফিক্স
Question এ:
```ts
if (text !== undefined && !text.trim()) { return 400; }
if (correctAnswer !== undefined && !correctAnswer.trim()) { return 400; }
if (options !== undefined && (!Array.isArray(options) || options.length < 2)) { return 400; }
```
CQQuestion এ (৫টা ফিল্ডের জন্য loop দিয়ে DRY রাখা হয়েছে, duplicate
if-statement এড়াতে):
```ts
const requiredFields: [string, string | undefined][] = [
  ["stimulus", stimulus], ["questionA", questionA], ["questionB", questionB],
  ["questionC", questionC], ["questionD", questionD],
];
for (const [fieldName, value] of requiredFields) {
  if (value !== undefined && !value.trim()) {
    return NextResponse.json({ error: `${fieldName} খালি রাখা যাবে না` }, { status: 400 });
  }
}
```
উভয় জায়গাতেই ডেটা সেভ করার সময় `.trim()` করা হয় (create endpoint এর
সাথে সামঞ্জস্যপূর্ণ)।

### বাকি ৩টা PATCH Endpoint অডিট করে নিরাপদ নিশ্চিত হওয়া গেছে
- `users/[userId]` — `role` এর enum check (`["STUDENT", "ADMIN"]
  .includes()`) ইতিমধ্যে আছে, কোনো ফিক্স দরকার নেই
- `forum/posts/[postId]/pin` — শুধু `isPinned` boolean
  (`!!isPinned` coercion দিয়ে সবসময় নিরাপদ), কোনো text field নেই
- `reports/[reportId]` — `action` এর enum check
  (`"RESOLVE"`/`"DISMISS"`) ইতিমধ্যে আছে, কোনো ফিক্স দরকার নেই

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৪.৬ সেকেন্ড)
- ✅ **লাইভ End-to-End defense-in-depth টেস্ট** (Admin role সহ real
  ইউজার): Question create সফল, তারপর PATCH এ খালি text/correctAnswer/
  single-option — সব ৩টা ৪০০ (fix verify), বৈধ misconceptionTag
  update এখনো ২০০ (regression নেই); CQQuestion create সফল, তারপর
  PATCH এ খালি stimulus/questionC — উভয়ই ৪০০, বৈধ misconceptionTag
  update এখনো ২০০
- ✅ **Edge-case/authorization**: unauthenticated PATCH উভয় endpoint
  এ ৪০১ — guard অপরিবর্তিত
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (test question/cq-question সরাসরি DELETE endpoint দিয়ে
  পরিষ্কার করা হয়েছে, ও DB তে verify করা হয়েছে কোনো অবশিষ্ট নেই)
- ✅ সম্পূর্ণ backend bug fix (২টা API route ফাইল পরিবর্তিত) — কোনো
  migration লাগেনি, কোনো নতুন dependency লাগেনি, কোনো frontend
  পরিবর্তন লাগেনি (UI থেকে ইতিমধ্যেই শুধু বৈধ ডেটা পাঠানো হতো, তাই
  এই bug টা শুধু client-bypass/direct-API-call এর ক্ষেত্রেই
  exploitable ছিল — কিন্তু defense-in-depth নীতি অনুযায়ী গুরুত্বপূর্ণ
  ফিক্স)

## 🔒 Class Routine PATCH Endpoint বাগ ফিক্স (Non-Admin Endpoint অডিট) ✅ সম্পন্ন

**Question/CQ Question PATCH Endpoint বাগ ফিক্সের পরে "Next" নির্দেশে
বেছে নেওয়া কাজ — একই bug প্যাটার্ন (POST এ validation আছে, PATCH এ
নেই/দুর্বল) স্কোপ সম্প্রসারণ করে কোডবেসের **non-admin** সব PATCH
endpoint এও অডিট করে দেখা হলো।**

### অডিট পদ্ধতি
`find app/api -name "route.ts" | xargs grep -l "export async function
PATCH" | grep -v "app/api/admin"` দিয়ে ১৩টা non-admin PATCH endpoint
তালিকাভুক্ত করে প্রতিটা ম্যানুয়ালি পড়ে দেখা হয়েছে: `flashcard-decks`,
`habits`, `notifications`, `routine`, `study-pet`, `study-plan/items`,
`tasks`, `user/ai-tutor-mode`, `user/digest-preference`, `user/
profile`, `user/public-profile`, `forum/posts/[postId]/resolve`,
`forum/replies/[replyId]/best-answer`।

### আবিষ্কার — `routine/[slotId]` এ দুটো সমস্যা
1. **`??` অপারেটর দিয়ে empty-string bypass**: `label?.trim() ??
   undefined` — এখানে `??` (nullish coalescing) শুধু `null`/
   `undefined` কে fallback এ পাঠায়, কিন্তু `"".trim()` এর ফলাফল
   `""` (একটা valid, non-nullish স্ট্রিং) — তাই `??` কখনো ট্রিগার
   হয় না। ফলে `label: ""` পাঠালে `data: { label: "" }` সরাসরি DB তে
   সেভ হয়ে যেত (Node.js এ verify করে নিশ্চিত করা হয়েছে)।
2. **Range/order validation সম্পূর্ণ মিসিং**: POST endpoint এ
   `dayOfWeek` এর ০-৬ রেঞ্জ চেক ও `startTime >= endTime` হলে reject
   করার লজিক ছিল, কিন্তু PATCH এ কিছুই ছিল না।

### ফিক্স — Partial-Update-Aware Validation
```ts
if (label !== undefined && !label.trim()) { return 400; }
if (dayOfWeek !== undefined && (typeof dayOfWeek !== "number" || dayOfWeek < 0 || dayOfWeek > 6)) { return 400; }

// PATCH আংশিক আপডেট সমর্থন করে (শুধু startTime বা শুধু endTime পাঠানো
// যায়) — তাই যেটা পাঠানো হয়নি, সেটার জন্য বিদ্যমান slot এর মান ব্যবহার
// করে effective time বের করে তুলনা করা হয়
const effectiveStartTime = startTime !== undefined ? startTime : slot.startTime;
const effectiveEndTime = endTime !== undefined ? endTime : slot.endTime;
if ((startTime !== undefined || endTime !== undefined) && effectiveStartTime >= effectiveEndTime) {
  return 400;
}
```
এই "effective value" প্যাটার্নটা গুরুত্বপূর্ণ — PATCH এ শুধু একটা
ফিল্ড পাঠানো স্বাভাবিক (যেমন শুধু `startTime` বদলানো), তাই শুধু
পাঠানো ২টা ফিল্ড সরাসরি তুলনা করলে ভুল ফলাফল আসত (undefined এর
সাথে string comparison)।

### Node.js এ Pre-verify (১২টা কেস)
label (empty/whitespace/valid), dayOfWeek (boundary -1/7/valid),
এবং সবচেয়ে গুরুত্বপূর্ণ — partial time update এর ৬টা কম্বিনেশন
(startTime-only বিদ্যমান endTime এর সাথে valid/invalid, endTime-only,
উভয়ই একসাথে valid/invalid) — সব ১২/১২ পাস, কোড লেখার আগেই লজিক
নিশ্চিত করা হয়েছে।

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৫.৫ সেকেন্ড)
- ✅ **লাইভ End-to-End defense-in-depth টেস্ট**: Routine slot create,
  PATCH এ empty label (৪০০ ✅), invalid dayOfWeek=৮ (৪০০ ✅), শুধু
  startTime পাঠিয়ে সেটা বিদ্যমান endTime এর পরে হওয়া (৪০০ ✅) — সব
  ফিক্স verify; বৈধ label+colorHex আপডেট ও বৈধ startTime+endTime
  আপডেট উভয়ই ২০০ (কোনো regression নেই)
- ✅ **Edge-case/authorization**: unauthenticated PATCH → ৪০১
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে delete + DB
  ভেরিফাই (routine_slots এ ০টা orphan row)
- ✅ **বাকি ১২টা non-admin PATCH endpoint অডিট করে নিরাপদ নিশ্চিত**:
  কোথাও empty-string bypass বা missing range validation পাওয়া
  যায়নি — সবগুলোতে হয় boolean/enum coercion (`!!value`,
  `.includes()`), অথবা `typeof x !== "string" || !x.trim()` প্যাটার্ন
  ইতিমধ্যেই সঠিকভাবে প্রয়োগ করা আছে
- ✅ সম্পূর্ণ backend bug fix (১টা API route ফাইল পরিবর্তিত:
  `app/api/routine/[slotId]/route.ts`) — কোনো migration লাগেনি,
  কোনো নতুন dependency লাগেনি, কোনো frontend পরিবর্তন লাগেনি (UI
  থেকে বর্তমানে এই PATCH endpoint ব্যবহারই হয় না, তাই এই bug টা
  শুধু ভবিষ্যতে UI feature যোগ হলে বা direct API call এর ক্ষেত্রে
  exploitable ছিল)

## 🔗 Reading Room × Study Group Integration + Synced Pomodoro ✅ সম্পন্ন

**Class Routine PATCH Endpoint বাগ ফিক্সের পরে "Aro ki ki kora jai
bolo" জিজ্ঞাসার প্রেক্ষিতে ব্যবহারকারীকে ৫টা বিকল্প (আরও Bug Hunt,
Reading Room সম্প্রসারণ, আরও UI/UX পলিশ, কনটেন্ট কাজ, স্ব-সিদ্ধান্ত)
দেওয়া হয়েছিল — ব্যবহারকারী "reading_room_expand" বেছে নেন। এই ফিচারে
`docs/RESEARCH_UI_UX_READING_ROOM.md` এর ৮ নং সেকশনে চিহ্নিত করা বাকি
২টা আইটেম ("Study Group কে live session মোডে upgrade" ও "Shared/Synced
Pomodoro") সম্পূর্ণ করা হয়েছে।**

### অংশ ১ — Study Group × Reading Room Integration (Schema-Free)
**ডিজাইন সিদ্ধান্ত**: কোনো নতুন কলাম/মডেল/migration ছাড়াই — বিদ্যমান
দুটো টেবিল (`StudyGroupMember`, `ReadingRoomSession`) জয়েন করে
রিয়েল-টাইম তথ্য বের করা হয়েছে।

`lib/reading-room.ts` এ নতুন `getGroupMembersReadingRoomStatus(userId)`:
1. ইউজারের `StudyGroupMember` থেকে `groupId` বের করা (না থাকলে খালি
   array রিটার্ন — গ্রেসফুল)
2. সেই গ্রুপের সব সদস্য (`StudyGroupMember.findMany`) নিয়ে আসা
3. তাদের `userId` লিস্ট দিয়ে `ReadingRoomSession` এ active (endedAt:
   null, lastHeartbeatAt stale threshold এর মধ্যে) সেশন খোঁজা
4. প্রতিটা সদস্যের জন্য `{userId, name, isInReadingRoom, room,
   activity, goal}` রিটার্ন করা

নতুন `GET /api/study-group/reading-room-status` endpoint। Study Group
Dashboard এ প্রতিটা সদস্যের কার্ডে conditional "🔴 এখন Reading Room এ
পড়ছে" indicator (animate-pulse `Radio` আইকন, রুম+activity emoji,
ঐচ্ছিক goal caption) — প্রতি ৩০ সেকেন্ডে পোলিং রিফ্রেশ (Reading Room
এর heartbeat interval এর কাছাকাছি রাখা হয়েছে যাতে দুইটা polling
system এর মধ্যে সামঞ্জস্য থাকে)। উপরে একটা shortcut কার্ড ("X জন সদস্য
এখন Reading Room এ আছে" বা প্রম্পট) থেকে সরাসরি `/reading-room` এ
যাওয়া যায়।

Client component এ server-only `lib/reading-room.ts` (Prisma import
করে) সরাসরি import না করে, `reading-room-dashboard.tsx` এর established
প্যাটার্ন অনুসরণ করে locally `ROOM_EMOJI`/`ACTIVITY_EMOJI` lookup
টেবিল define করা হয়েছে (bundle এ Prisma leak এড়াতে)।

### অংশ ২ — Synced (Shared) Pomodoro (Broadcast-Free ডিজাইন)
**মূল প্রযুক্তিগত চ্যালেঞ্জ**: readingroombd.com/StudyClock এর "সবাই
একসাথে ব্রেক নেয়" অভিজ্ঞতা তৈরি করতে সাধারণত একটা centralized timer
state (DB তে বা WebSocket broadcast দিয়ে) দরকার হয় — কিন্তু HSC
Ultimate এর architecture এ rate-limiting নিষিদ্ধ থাকলেও, প্রতিটা
ইউজারের জন্য আলাদা DB write/read করা অপ্রয়োজনীয় ওভারহেড হতো।

**সমাধান — সম্পূর্ণ Deterministic, Stateless Design**:
```ts
export function getSyncedPomodoroState(now: Date = new Date()): SyncedPomodoroState {
  const epochSec = Math.floor(now.getTime() / 1000);
  const position = epochSec % SYNCED_CYCLE_SEC; // ৩০ মিনিট = ১৮০০ সেকেন্ড চক্র
  if (position < SYNCED_FOCUS_SEC) {
    return { mode: "focus", secondsLeft: SYNCED_FOCUS_SEC - position, cycleSec: SYNCED_CYCLE_SEC };
  }
  return { mode: "break", secondsLeft: SYNCED_CYCLE_SEC - position, cycleSec: SYNCED_CYCLE_SEC };
}
```
এটা একটা **pure function** — কোনো DB read/write নেই, কোনো state
store নেই, কোনো randomness নেই। Unix epoch (সব সার্ভার/ক্লায়েন্টে
সমান, timezone-independent) থেকে modulo নিয়ে বর্তমান চক্রের অবস্থান
বের করা হয় — এই একই ফাংশন যেকোনো সময়, যেকোনো সার্ভার ইনস্ট্যান্স
থেকে কল করলে হুবহু একই ফলাফল দেয়। এটাই "synced" হওয়ার গ্যারান্টি,
কোনো broadcast ছাড়াই।

নতুন `GET /api/reading-room/synced-pomodoro` endpoint, নতুন
`components/reading-room/synced-pomodoro-card.tsx` — Reading Room
Dashboard এ presence panel এর উপরে দেখায়। প্রতি সেকেন্ডে local
countdown (UI smooth রাখতে) + প্রতি ৩০ সেকেন্ডে সার্ভার থেকে re-sync
(client clock drift বা tab-inactive হওয়ার কারণে accumulate হওয়া
error সংশোধন করতে)।

**⚠️ React useEffect ডিজাইন সতর্কতা**: প্রাথমিক ডিজাইনে local
countdown এর `useEffect` dependency তে `state` রাখার কথা ভাবা
হয়েছিল, কিন্তু সেটা প্রতি সেকেন্ডে (state পরিবর্তনের সাথে সাথে)
interval পুনরায় তৈরি করত (memory churn, timing bug ঝুঁকি)। ফিক্স:
empty dependency array (`[]`) দিয়ে একবারই interval শুরু করা, এবং
`setState((prev) => ...)` functional update প্যাটার্ন ব্যবহার করে
সবসময় সর্বশেষ state এর উপর ভিত্তি করে আপডেট করা (stale closure এড়াতে)।

### গাণিতিক Pre-verify (দুই ধাপে — Python তারপর Node.js)
1. **Python এ প্রাথমিক ডিজাইন-ভেরিফিকেশন**: cycle boundary এর ৮টা
   কেস (focus শুরু/মাঝামাঝি/শেষ সেকেন্ড, break শুরু/মাঝামাঝি/শেষ
   সেকেন্ড, চক্র rollover) এবং "দুইজন ইউজার একই মুহূর্তে কল করলে
   হুবহু একই ফলাফল" এর দাবি প্রথমে সিমুলেট করে নিশ্চিত করা হয়েছে,
   তারপরই কোড লেখা হয়েছে
2. **Node.js এ actual code import করে দ্বিতীয়বার verify**: `tsx`
   দিয়ে সরাসরি `lib/reading-room.ts` থেকে `getSyncedPomodoroState()`
   import করে (কপি-পেস্ট implementation না) একই ৬টা কেস আবার চালানো
   হয়েছে — সব পাস, ও `SYNCED_CYCLE_SEC === SYNCED_FOCUS_SEC +
   SYNCED_BREAK_SEC` invariant ও assert করা হয়েছে

### Live Test
- ✅ TypeScript ক্লিন, Lint ক্লিন, `pnpm build` প্রথম চেষ্টাতেই সফল
  (২৭.৪ সেকেন্ড)
- ✅ **লাইভ multi-user End-to-End টেস্ট** (দুইজন real ইউজার — "Group
  Owner" ও "Group Member"): Study Group তৈরি করে দ্বিতীয় ইউজারকে
  invite code দিয়ে join করানো, প্রাথমিকভাবে `reading-room-status`
  এ দুইজনই `isInReadingRoom: false` verify, Group Member এর Reading
  Room (COZY_LIBRARY) এ join করার পরে **Group Owner এর দৃষ্টিকোণ
  থেকে** `isInReadingRoom: true` + সঠিক `room`/`activity`/`goal`
  ("অধ্যায় ৫ শেষ করব") দেখা যাওয়া নিশ্চিত করা হয়েছে — প্রকৃত
  cross-user real-time visibility প্রমাণিত
- ✅ **Leave flow verify**: Group Member Reading Room ছেড়ে দেওয়ার
  পরে Group Owner এর দৃষ্টিকোণ থেকে আবার `isInReadingRoom: false`
  হয়ে যাওয়া নিশ্চিত করা হয়েছে
- ✅ **Synced Pomodoro cross-user verify**: দুইজন real ইউজার (আলাদা
  session) একই মুহূর্তে endpoint কল করে হুবহু একই `mode` ও `secondsLeft`
  (নেটওয়ার্ক latency বাদে ≤২ সেকেন্ড পার্থক্য) পাওয়া নিশ্চিত করা
  হয়েছে, ৩ সেকেন্ড অপেক্ষা করে আবার কল করে সময় ঠিকমতো কমেছে তা যাচাই
- ✅ **Edge-case টেস্ট**: কোনো Study Group এ নেই এমন একটা তৃতীয়
  ইউজার দিয়ে `reading-room-status` কল করে crash না হয়ে খালি
  `members: []` রিটার্ন করা নিশ্চিত করা হয়েছে, unauthenticated উভয়
  নতুন endpoint এ ৪০১, `/study-group` ও `/reading-room` পেজ
  crash-free লোড
- ✅ Test data cleanup: `/api/user/delete-account` দিয়ে সব টেস্ট
  ইউজার delete + DB ভেরিফাই (test study group ও reading room session
  এর cascade delete — Study Group Cascade Delete তদন্তে আগে প্রমাণিত
  business logic এর মাধ্যমে, raw SQL bypass না — ০টা orphan row)
- ✅ সম্পূর্ণ schema-free ফিচার (৩টা নতুন ফাইল: `app/api/study-group/
  reading-room-status/route.ts`, `app/api/reading-room/synced-
  pomodoro/route.ts`, `components/reading-room/synced-pomodoro-
  card.tsx` + ৩টা ফাইল পরিবর্তিত: `lib/reading-room.ts` এ ২টা নতুন
  ফাংশন/একটা ইন্টারফেস যোগ, `study-group-dashboard.tsx`,
  `reading-room-dashboard.tsx`) — কোনো migration লাগেনি, কোনো নতুন
  dependency লাগেনি
- ⚠️ এখনো বাকি (transparency): Synced Pomodoro এর চক্র দৈর্ঘ্য
  (২৫+৫ মিনিট) বর্তমানে ফিক্সড কনস্ট্যান্ট, ইউজার কাস্টমাইজ করতে
  পারে না (ভবিষ্যতে UI দিয়ে বিভিন্ন চক্র দৈর্ঘ্য বেছে নেওয়ার ফিচার
  যোগ করা যেতে পারে, কিন্তু তখন "সবাই একই চক্র বেছে নিয়েছে" নিশ্চিত
  করার জটিলতা তৈরি হবে); screen reader ম্যানুয়াল টেস্টিং এখনো বাকি

## 🩹 Admin Panel — Question/CQ Question/Notification Broadcast Form ইনলাইন ভ্যালিডেশন ✅ সম্পন্ন

### প্রেক্ষাপট
Subject/Chapter/Topic Manager এ আগেই `fieldErrors` state ভিত্তিক
ইনলাইন ভ্যালিডেশন প্যাটার্ন (aria-invalid+aria-describedby সহ লাল
ইনলাইন এরর মেসেজ, স্ক্রিন-রিডার+কীবোর্ড ইউজারদের জন্য) প্রয়োগ করা
হয়েছিল। কিন্তু কোডবেসের বাকি তিনটা admin ফর্ম — Question Manager
(MCQ), CQ Question Manager, ও Notification Broadcast Form — এখনো
পুরনো প্যাটার্নে ছিল: খালি/invalid ফিল্ড দিয়ে সাবমিট করলে শুধু একটা
generic `toast.error()` দেখাতো, কোনো নির্দিষ্ট ফিল্ড হাইলাইট হতো না
বা `aria-invalid` সেট হতো না। এই gap প্রোঅ্যাক্টিভ UI/UX polish
অডিটে ধরা পড়ে এবং সম্পূর্ণ করা হলো।

### Question Manager (`components/admin/question-manager.tsx`)
- একক MCQ প্রশ্ন তৈরির ফর্মে নতুন `fieldErrors` state:
  `{ text?, options?, correctAnswer? }`
- `validateSingle(options)` ফাংশন — তিনটা রুল:
  1. `text` খালি হলে "প্রশ্নের টেক্সট আবশ্যক"
  2. অন্তত ২টা non-empty অপশন না থাকলে "অন্তত ২টা অপশন দিতে হবে"
  3. `correctAnswer` খালি হলে "সঠিক উত্তর আবশ্যক", অথবা **নতুন
     ভ্যালিডেশন**: `correctAnswer` যদি options array এর কোনো একটার
     সাথে হুবহু না মেলে তাহলে "সঠিক উত্তর অবশ্যই উপরের অপশনগুলোর
     একটার সাথে হুবহু মিলতে হবে" — এই bug আগে থেকেই ছিল (admin
     টাইপো করে ভুল answer লিখলে সাইলেন্টলি সাবমিট হয়ে যেত, পরে
     ছাত্ররা কখনো সঠিক উত্তর দিতে না পেরে বিভ্রান্ত হতো, কারণ
     `correctAnswer` স্ট্রিং options এর কোনোটার সাথে না মিললে
     grading logic এ কোনো অপশনই "সঠিক" হিসেবে চিহ্নিত হতো না)
- প্রতিটা রিলেভেন্ট `<Textarea>`/`<Input>` এ `id`, `aria-invalid`,
  `aria-describedby` যোগ, `onChange` এ typing শুরু হলে সংশ্লিষ্ট
  error সাথে সাথে clear হয়ে যায় (Subject/Chapter/Topic Manager এর
  same UX প্যাটার্ন)
- Dialog এর `onOpenChange` এ বন্ধ করলে `fieldErrors` রিসেট, সফল
  সাবমিটের পরেও রিসেট
- **Unsaved Changes Warning** নতুন যোগ: `useUnsavedChangesWarning`
  hook ইমপোর্ট করে, single question ফর্মে কিছু টাইপ করা থাকলে অথবা
  CSV bulk ট্যাবে টেক্সট থাকলে (dialog `open` অবস্থায়) সক্রিয় —
  Topic Manager এর প্রতিষ্ঠিত প্যাটার্ন পুনর্ব্যবহার করে (schema-free,
  শুধু client-side state comparison)

### CQ Question Manager (`components/admin/cq-question-manager.tsx`)
- নতুন `fieldErrors` state: `{ stimulus?, questionA?, questionB?,
  questionC?, questionD? }` — প্রতিটা আবশ্যক ফিল্ডের জন্য আলাদা এরর
  মেসেজ ("ক প্রশ্ন আবশ্যক" ইত্যাদি)
- `validate()` ফাংশন প্রতিটা ফিল্ড আলাদাভাবে চেক করে (আগে শুধু
  combined boolean চেক ছিল, এখন কোন নির্দিষ্ট ফিল্ড মিসিং তা UI তে
  দেখানো যায়)
- পাঁচটা `<Textarea>` এ `id`+`aria-invalid`+`aria-describedby`+
  ইনলাইন লাল এরর প্যারাগ্রাফ
- Dialog `onOpenChange`/সফল সাবমিটে `fieldErrors` রিসেট
- **Unsaved Changes Warning**: `formHasChanges` — dialog খোলা
  অবস্থায় `Object.entries(form).some(([, v]) => v.trim() !== "")`
  দিয়ে ফর্মের যেকোনো ফিল্ডে (stimulus/questionA-D/modelAnswerA-D/
  boardYear/boardName/misconceptionTag) কিছু থাকলে সক্রিয়

### Notification Broadcast Form (`components/admin/notification-broadcast-form.tsx`)
- নতুন `fieldErrors` state: `{ title?, body? }`
- `handleSend()` এ ভ্যালিডেশন এখন `setFieldErrors` কল করে (আগে শুধু
  toast) + এখনো toast ও দেখায় (defense-in-depth UX, দুইভাবেই
  ইউজারকে জানানো)
- `title`+`body` ইনপুটে `id`+`aria-invalid`+`aria-describedby`+
  ইনলাইন লাল এরর
- সফল সাবমিটের পরে `fieldErrors` রিসেট
- **Unsaved Changes Warning** নতুন যোগ — এই ফর্মটা dialog না, পুরো
  স্বতন্ত্র পেজ (`/admin/notifications/broadcast`), তাই এখানে
  gap টা বিশেষভাবে গুরুত্বপূর্ণ ছিল: দীর্ঘ ঘোষণা টাইপ করার সময়
  ভুলবশত ব্যাক বাটন/রিফ্রেশ করলে আগে কোনো সতর্কতা ছাড়াই সব হারিয়ে
  যেত। এখন `title.trim() !== "" || body.trim() !== "" ||
  link.trim() !== ""` থাকলে `beforeunload` সতর্কতা দেখায়।

### User Manager অডিট (`components/admin/user-manager.tsx`)
এই কম্পোনেন্টে কোনো টেক্সট ইনপুট ফর্ম নেই — শুধু প্রতিটা ইউজারের
পাশে একটা role-toggle বাটন (`Admin`/`Student` টগল)। যেহেতু কোনো
free-text ফিল্ড নেই, ইনলাইন ভ্যালিডেশনের কোনো প্রয়োজন নেই — সোর্স
কোড পড়ে এই সিদ্ধান্তে পৌঁছানো হয়েছে এবং স্বচ্ছভাবে ডকুমেন্ট করা হলো
(যাতে ভবিষ্যতে কেউ ভুল করে এখানে "মিসিং ফিচার" মনে না করে)।

### Server-side ভ্যালিডেশন Regression-Free নিশ্চিতকরণ
Client-side `fieldErrors` UX উন্নত করার সময় সতর্ক থাকা হয়েছে যাতে
বিদ্যমান server-side validation (POST endpoint গুলোতে, যেমন
`/api/admin/topics/[topicId]/questions`, `/api/admin/topics/
[topicId]/cq-questions`, `/api/admin/notifications/broadcast`)
অপরিবর্তিত/সুরক্ষিত থাকে — defense-in-depth নীতি অনুযায়ী client-side
validation UX এর জন্য, কিন্তু server-side validation সবসময়
নিরাপত্তার শেষ লাইন। এটা লাইভ টেস্টে সরাসরি ভেরিফাই করা হয়েছে (নিচে
দেখো)।

### লাইভ Multi-User টেস্ট (`scripts/test-admin-inline-validation.py`)
২৬টা assertion, সব PASS। টেস্ট করে:
1. Admin+Student দুইজন real ইউজার রেজিস্ট্রেশন+লগইন
2. **Server-side ভ্যালিডেশন এখনো অক্ষত**: খালি payload দিয়ে MCQ/CQ/
   Broadcast POST করলে এখনো 400 রিটার্ন করে
3. **Regression-free**: সঠিক payload দিয়ে normal create flow
   এখনো ঠিকভাবে কাজ করে (201 রিটার্ন)
4. **Authorization**: Student role দিয়ে এই admin endpoint গুলো
   ব্যবহার করার চেষ্টা করলে 403
5. **Static source-code verification**: তিনটা ফাইলেই `fieldErrors`
   state, `aria-invalid`/`aria-describedby` attribute,
   `useUnsavedChangesWarning` import সরাসরি সোর্স ফাইল পড়ে যাচাই
   করা হয়েছে (Node.js/actual-file-import প্যাটার্নের পাইথন-সংস্করণ,
   কারণ এই ক্ষেত্রে টাইপস্ক্রিপ্ট JSX ফাইল import করা সম্ভব না, তাই
   string-matching দিয়ে সোর্সে প্যাটার্ন উপস্থিতি নিশ্চিত করা হয়েছে)
6. **Cascade delete**: টেস্ট MCQ ও CQ প্রশ্ন প্রকৃত
   `DELETE /api/admin/questions/[id]` ও `DELETE /api/admin/
   cq-questions/[id]` endpoint দিয়ে মুছে DB তে সরাসরি ভেরিফাই
   (raw SQL bypass না)
7. Test users (admin+student) সবশেষে DB থেকে delete + verify

### সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)
`fieldErrors` client-side React state হওয়ায় "ফাঁকা ফর্ম সাবমিট
করলে UI তে লাল এরর মেসেজ আসলেই দেখা যাচ্ছে" এটা Python/requests
দিয়ে সরাসরি automate করে verify করা সম্ভব না (আসল browser render +
DOM inspection দরকার, যা এই সেশনের টুলসেটে নেই)। তাই টেস্টে দুটো
automatable প্রক্সি ব্যবহার করা হয়েছে: (ক) static source-code
verification যে প্যাটার্নটা সঠিকভাবে কোডে আছে, (খ) server-side
validation এখনো regression-free — যেহেতু client-side ভ্যালিডেশন UI
এর একই যুক্তি (empty check ইত্যাদি) সোর্সে নিশ্চিত করা গেছে এবং
component টা tsc+build+lint তিনটাই pass করেছে, তাই functional
correctness এ high confidence আছে। ম্যানুয়াল browser টেস্টিং
(ইউজার নিজে চেষ্টা করে দেখলে) এখনো বাকি থাকল যদি কোনো সূক্ষ্ম CSS/
layout ইস্যু থাকে।

### পরিবর্তিত ফাইল
- `components/admin/question-manager.tsx` — fieldErrors +
  correctAnswer must-match-option validation + Unsaved Changes Warning
- `components/admin/cq-question-manager.tsx` — fieldErrors (৫টা
  ফিল্ড) + Unsaved Changes Warning
- `components/admin/notification-broadcast-form.tsx` — fieldErrors
  (২টা ফিল্ড) + Unsaved Changes Warning
- নতুন: `scripts/test-admin-inline-validation.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি, `pnpm exec tsc
--noEmit`, `pnpm build` (২৯.৩ সেকেন্ডে কম্পাইল), `pnpm lint` তিনটাই
প্রথম চেষ্টাতেই clean পাস করেছে।

## ⌨️ Keyboard Tab-order / Focus-trap Audit ✅ সম্পন্ন

### প্রেক্ষাপট
আগের সেশন গুলোতে base-ui Dialog/AlertDialog/Tabs/Select/Menu
primitive গুলোর keyboard/focus-trap আচরণ ইতিমধ্যেই ভালোভাবে প্রতিষ্ঠিত
ছিল (library-level, well-tested)। কিন্তু কোডবেসে কয়েক জায়গায়
কাস্টম ইন্টারঅ্যাক্টিভ এলিমেন্ট (custom `role="button"` card,
component composition prop misuse) আছে যেগুলো ম্যানুয়ালি
keyboard-accessible রাখতে হয় — এগুলোতে সূক্ষ্ম bug লুকিয়ে থাকার
ঝুঁকি বেশি। প্রোঅ্যাক্টিভ সিস্টেমেটিক অডিট চালানো হলো (Python script
দিয়ে কোডবেস-ওয়াইড regex সার্চ + ম্যানুয়াল রিভিউ) এবং দুইটা concrete
bug পাওয়া গেছে।

### বাগ ১: Notification Bell Nested-Interactive `<button>` (গুরুতর)
**Root cause**: `components/layout/notification-bell.tsx` এ:
```tsx
<DropdownMenuTrigger className="outline-none">
  <Button variant="outline" size="icon" ...>
    <Bell />
  </Button>
</DropdownMenuTrigger>
```
base-ui এর `Menu.Trigger` (যা `DropdownMenuTrigger` ওয়্যাপ করে)
নিজে যদি `render` prop না পায়, তাহলে নিজেই একটা `<button>` DOM
element রেন্ডার করে এবং `children` কে ভেতরে বসিয়ে দেয়। এখানে
`children` হিসেবে `<Button>` (যেটা নিজেও `@base-ui/react/button`
এর `<button>` রেন্ডার করে) বসানো ছিল — ফলে চূড়ান্ত সার্ভার-রেন্ডার
HTML এ:
```html
<button ... data-slot="dropdown-menu-trigger" class="outline-none">
  <button ... data-slot="button" aria-label="নোটিফিকেশন" class="...">
    <svg>...</svg>
  </button>
</button>
```
— একটা `<button>` এর ভেতরে আরেকটা `<button>` (নেস্টেড ইন্টারঅ্যাক্টিভ
এলিমেন্ট)। এটা:
1. **Invalid HTML** — HTML স্পেসিফিকেশন অনুযায়ী `<button>` এর
   ভেতরে interactive content (আরেকটা `<button>`) থাকা নিষিদ্ধ
   (WCAG 4.1.1 Parsing এর সাথে সরাসরি সম্পর্কিত, এবং
   `<button>`-in-`<button>` HTML parser দ্বারা silently "fix" হতে
   পারে ব্রাউজার-ভেদে ভিন্নভাবে, যা অপ্রত্যাশিত DOM tree তৈরি করে)।
2. **Accessibility সমস্যা** — স্ক্রিন-রিডার সফটওয়্যার নেস্টেড
   ইন্টারঅ্যাক্টিভ এলিমেন্ট নিয়ে বিভ্রান্ত হয় (কোন এলিমেন্টে ফোকাস/
   ঘোষণা করবে তা অস্পষ্ট হয়ে যায়), এবং outer trigger এর নিজস্ব
   `aria-haspopup`/`id` attribute inner button এর `aria-label` এর
   সাথে conflict করতে পারে।
3. এই একই বাগ **প্যাটার্ন** (nested `<button>`) আগের সেশনে
   Notification Bell/Center এর delete আইকনে (`<div role="button">`
   এর ভেতরে `<button>`) পাওয়া গিয়েছিল এবং sibling-button-structure
   এ রূপান্তর করে ফিক্স করা হয়েছিল — কিন্তু trigger লেভেলে এই আলাদা
   instance টা তখন মিস হয়ে গিয়েছিল, এবার প্রোঅ্যাক্টিভ অডিটে ধরা পড়ল।

**Fix**: `<Button>` কে `children` থেকে সরিয়ে `render` prop এ move
করা হলো — Dialog/AlertDialog এ প্রতিষ্ঠিত প্যাটার্ন
(`<DialogTrigger render={<Button>...</Button>} />`) অনুসরণ করে:
```tsx
<DropdownMenuTrigger
  className="outline-none"
  render={
    <Button variant="outline" size="icon" className="h-9 w-9 relative" aria-label="...">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && <span>...</span>}
    </Button>
  }
/>
```
এখন base-ui `Menu.Trigger` নিজে কোনো `<button>` রেন্ডার করে না —
বরং `render` prop এ দেওয়া `<Button>` element কেই trigger হিসেবে
ব্যবহার করে (base-ui props merge করে দেয় সেই element এ)। ফলাফল
সার্ভার-রেন্ডার HTML এ লাইভ ভেরিফাই করা হয়েছে:
```html
<button type="button" tabindex="0" data-slot="dropdown-menu-trigger"
  aria-label="নোটিফিকেশন" aria-haspopup="menu" id="base-ui-..."
  class="group/button inline-flex ... focus-visible:ring-3 ...">
  <svg>...</svg>
</button>
```
— এখন শুধু **একটামাত্র** `<button>`, এবং Button কম্পোনেন্টের
নিজস্ব সব className (focus-visible ring সহ) + trigger এর
`outline-none` সঠিকভাবে merge হয়ে গেছে (আগের nested structure এ
Button এর className inner button এ যেত, trigger নিজের ডিফল্ট
button styling এর সাথে conflict করতো না ঠিকই, কিন্তু structurally
ভুল ছিল)।

### বাগ ২: Reading Room রুম-সিলেকশন কার্ডে Focus Indicator মিসিং
**Root cause**: `components/reading-room/reading-room-dashboard.tsx`
এ রুম বাছাই করার কার্ড:
```tsx
<Card
  className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
  role="button"
  tabIndex={0}
  onClick={() => void handleJoin(room.id)}
  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") {...} }}
>
```
কীবোর্ড অ্যাক্সেসিবিলিটি বেসিক ঠিকই ছিল (`role="button"` +
`tabIndex={0}` + Enter/Space হ্যান্ডলার) — কিন্তু কোনো
`focus-visible` স্টাইল ছিল না। যেহেতু `<Card>` একটা প্লেইন `<div>`
রেন্ডার করে (native button/anchor না), ব্রাউজারের ডিফল্ট focus
outline প্রযোজ্য হয় না যদি কোথাও `outline: none`/Tailwind
preflight override না থাকে — কিন্তু এই ক্ষেত্রে সমস্যা হলো কোনো
positive focus indicator না থাকা (WCAG 2.4.7 Focus Visible লঙ্ঘন)
— কীবোর্ড ইউজার Tab চেপে এই কার্ডগুলোর মধ্যে দিয়ে গেলে কোনটাতে
ফোকাস আছে তা বুঝতে পারতো না।

**Fix**: কোডবেসের অন্যান্য কাস্টম ইন্টারঅ্যাক্টিভ এলিমেন্টের
(flashcard `review-runner.tsx` এর ফ্লিপ কার্ড) প্রতিষ্ঠিত প্যাটার্ন
অনুসরণ করে যোগ করা হলো:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### সম্পূর্ণ কোডবেস সিস্টেমেটিক অডিট (পদ্ধতি)
1. **Trigger-children-Button মিসইউজ প্যাটার্ন**: Python regex script
   দিয়ে `<XTrigger ...>` (কোনো `render=` prop ছাড়া) এর ঠিক পরেই
   `<Button` বা `<button` আছে কিনা পুরো `components/`+`app/`
   কোডবেসে খোঁজা হয়েছে — শুধু Notification Bell এই একটা instance
   পাওয়া গেছে। `DialogTrigger`/`AlertDialog` এর সব ব্যবহার আগে
   থেকেই সঠিকভাবে `render` prop ব্যবহার করছিল।
2. **`onClick` সহ non-native-interactive এলিমেন্ট**: `<Card|div|
   span|p>` এ সরাসরি `onClick` আছে এমন সব জায়গা regex দিয়ে খোঁজা
   হয়েছে — `review-runner.tsx` (ইতিমধ্যে `role="button"`+
   `tabIndex`+`onKeyDown`+`focus-visible` ঠিক ছিল) ও Reading Room
   (উপরে ফিক্স করা হলো) ছাড়া আর কিছু পাওয়া যায়নি। বাকি সব
   `onClick` `<Card>` গুলো আসলে `<Link>` দিয়ে wrap করা (native
   anchor, ব্রাউজার নিজেই keyboard-accessible + focus-visible
   হ্যান্ডল করে)।
3. **`outline-none` ব্যবহার audit**: পুরো কোডবেসে `outline-none`
   ব্যবহৃত সব জায়গা (৩টা পাওয়া গেছে: `global-search.tsx` dialog
   এর ভেতরের input, পুরনো `notification-bell.tsx` trigger যেটা
   এখন ফিক্সড, `dropdown-menu.tsx` positioner) রিভিউ করে নিশ্চিত
   হওয়া হয়েছে যে হয় replacement focus ring আছে (Button এর নিজস্ব
   focus-visible স্টাইল, এখন সঠিকভাবে trigger এ প্রয়োগ হচ্ছে) অথবা
   প্রাসঙ্গিক না (dialog input প্রোগ্রাম্যাটিকভাবে auto-focus হয়
   dialog খোলার সময়, positioner নিজে ফোকাসেবল না, শুধু popup
   positioning এর জন্য একটা wrapper)।
4. **User Menu (Avatar trigger) ক্রস-চেক**: একই `DropdownMenuTrigger`
   ব্যবহার করা সত্ত্বেও `user-menu.tsx` এ বাগ ছিল না, কারণ children
   হিসেবে `<Avatar>` বসানো ছিল যেটা একটা `<span>` রেন্ডার করে
   (`@base-ui/react` Avatar primitive, button না) — তাই নেস্টেড
   `<button>` সমস্যা তৈরি হয়নি। সার্ভার-রেন্ডার HTML এ ভেরিফাই করে
   নিশ্চিত হওয়া হয়েছে।
5. **Select/Tabs/Switch base-ui কম্পোনেন্ট**: এই তিনটাতে ইতিমধ্যেই
   সঠিক `focus-visible:border-ring focus-visible:ring-3` (Select/
   Switch) ও `focus-visible:border-ring focus-visible:ring-[3px]`
   (Tabs) স্টাইল প্রয়োগ করা আছে তা কোড রিভিউ করে নিশ্চিত করা হয়েছে,
   কোনো পরিবর্তন দরকার হয়নি।

### লাইভ Multi-User টেস্ট (`scripts/test-keyboard-focus-audit.py`)
১৫টা assertion, সব PASS। মূল যাচাই:
1. Student রেজিস্ট্রেশন+লগইন, Dashboard পেজ crash-free লোড
   (regression check)
2. **স্ট্যাক-ভিত্তিক পার্সার** (`find_nested_buttons()`) দিয়ে
   সার্ভার-রেন্ডার HTML এ `<button>` ট্যাগগুলোর মধ্যে nesting আছে
   কিনা সরাসরি চেক — Notification Bell trigger এর আশেপাশে
   `nested_count == 0` ভেরিফাই করা হয়েছে
3. রেন্ডার করা HTML এ নতুন `focus-visible:ring-3` ক্লাস (Button
   থেকে সঠিকভাবে merge হয়ে trigger এ এসেছে) ও `aria-label` এখনো
   আছে তা ভেরিফাই
4. Reading Room পেজ crash-free লোড, `/api/notifications/unread-
   count` endpoint এখনো ফাংশনাল (regression-free)
5. Unauthenticated request এ ৪০১ (এই সেশনে rate limiting কখনো
   ছিল না/আর যোগ করা হবে না, তাই শুধু authorization চেক)
6. Static source-code verification: `notification-bell.tsx` এ
   `render=` prop ব্যবহার হচ্ছে এবং children হিসেবে সরাসরি
   `<Button>` আর নেই (regex দিয়ে), `reading-room-dashboard.tsx`
   এ নতুন focus-visible ring class আছে, `user-menu.tsx` এ এখনো
   Avatar+DropdownMenuTrigger প্যাটার্ন অক্ষত (কোনো বাগ ছিল না)
7. Test user cleanup + DB verify

### সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)
"কীবোর্ড দিয়ে Tab করলে আসলেই ring visually দেখা যাচ্ছে" এবং "Enter/
Space চাপলে আসলেই কার্ড join হচ্ছে" — এই দুটো true end-to-end
কীবোর্ড ইন্টারঅ্যাকশন Python/requests দিয়ে automate করা সম্ভব না
(আসল browser + focus event simulation দরকার)। তাই টেস্টে দুটো
automatable প্রক্সি ব্যবহার করা হয়েছে: (ক) সার্ভার-রেন্ডার HTML এ
bug-free DOM structure (নেস্টেড button নেই) সরাসরি ভেরিফাই, (খ)
সঠিক CSS class উপস্থিতি সোর্স+রেন্ডার করা HTML উভয়ে ভেরিফাই। যেহেতু
`role="button"`+`tabIndex={0}`+`onKeyDown` (Enter/Space হ্যান্ডলার)
Reading Room কার্ডে আগে থেকেই ছিল এবং অপরিবর্তিত রাখা হয়েছে (শুধু
CSS class যোগ করা হয়েছে), কীবোর্ড ইন্টারঅ্যাকশন functional
correctness এ high confidence আছে। ম্যানুয়াল browser কীবোর্ড
টেস্টিং (Tab চেপে visually ring দেখা) এখনো বাকি থাকল।

### পরিবর্তিত ফাইল
- `components/layout/notification-bell.tsx` — DropdownMenuTrigger
  children থেকে render prop এ Button move (bug fix)
- `components/reading-room/reading-room-dashboard.tsx` — room card
  এ focus-visible ring class যোগ
- নতুন: `scripts/test-keyboard-focus-audit.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি, `pnpm exec tsc
--noEmit`, `pnpm build` (২৬.১ সেকেন্ডে কম্পাইল), `pnpm lint` তিনটাই
clean পাস করেছে (build এর সময় একবার sandbox memory contention হয়ে
প্রথম attempt hang হয়েছিল dev server + build একসাথে চলার কারণে —
dev server বন্ধ করে দ্বিতীয়বার সফল হয়েছে, transparency নোট হিসেবে
এখানে উল্লেখ করা হলো)।

## 🐛🔧 "P2025 500-instead-of-404" সিস্টেমেটিক বাগ অডিট ✅ সম্পন্ন

### আবিষ্কারের প্রেক্ষাপট
Keyboard Tab-order/Focus-trap অডিটের পরে আরও Bug Hunt করার সময়
GET endpoint authorization/error-handling অডিট শুরু করা হয়। প্রথমে
`GET /api/forum/posts/[postId]` রিভিউ করার সময় লক্ষ করা গেল কোডে:
```ts
const post = await prisma.forumPost.update({
  where: { id: postId },
  data: { viewCount: { increment: 1 } },
  include: { ... },
});

if (!post) {
  return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
}
```
এই প্যাটার্নটা সন্দেহজনক মনে হয়, কারণ Prisma `update()` মেথডের
আচরণ হলো: রেকর্ড না পেলে `null` রিটার্ন করে না, বরং
`PrismaClientKnownRequestError` (code `P2025`, "Record to update
not found") throw করে। তাই `if (!post)` এই কনটেক্সটে **কখনো true
হবে না** (dead code) — exception unhandled থেকে Next.js এর ডিফল্ট
error handler ধরে ফেলে এবং ৫০০ Internal Server Error রিটার্ন করে
(client কে generic "Internal Server Error" দেখায়, ৪০৪ "পোস্ট পাওয়া
যায়নি" এর বদলে)।

### লাইভ ভেরিফিকেশন (root cause নিশ্চিতকরণ)
```python
r = s.get(f"{BASE}/api/forum/posts/nonexistent_post_id_xyz")
# ফলাফল: 500 (প্রত্যাশিত ছিল 404)
```
সরাসরি reproduce করে নিশ্চিত হওয়া গেছে।

### সম্পূর্ণ কোডবেস সিস্টেমেটিক অডিট (পদ্ধতি)
Python regex script দিয়ে `app/api/**/route.ts` এর প্রতিটা
GET/PATCH/PUT/DELETE হ্যান্ডলারের বডি স্ক্যান করে খোঁজা হয়েছে:
"এই হ্যান্ডলারে `prisma.X.update()` অথবা `prisma.X.delete()` কল
আছে, কিন্তু কোনো `prisma.X.findUnique()`/`findFirst()` (existence
check) নেই"। এই heuristic এ **১৯টা** সন্দেহজনক ফাইল/হ্যান্ডলার
চিহ্নিত হয়। প্রতিটা ম্যানুয়ালি রিভিউ করে দুই ভাগে ভাগ করা হয়:

**False positive (৫টা)** — এদের নিজস্ব ownership-check helper
function এ আগে থেকেই `findUnique`/`findFirst` ছিল, regex সেটা আলাদা
স্কোপে থাকায় ধরতে পারেনি (নিরাপদ, কোনো পরিবর্তন লাগেনি):
- `custom-question-sets/[setId]` (GET/DELETE) — `getOwnedSet()`
  helper এ চেক আছে
- `pdf-chat/[documentId]` (GET/DELETE) — `getOwnedDocument()`
  helper এ চেক আছে
- `tasks/[taskId]` (PATCH/DELETE) — `verifyOwnership()` helper এ
  চেক আছে
- `user/profile`, `user/ai-tutor-mode`, `user/digest-preference`
  (PATCH) — সবসময় `session.user.id` ব্যবহার করে, logged-in ইউজার
  সবসময় DB তে বিদ্যমান থাকে (session valid থাকলে)

**প্রকৃত bug (১৪টা)** — এই সবগুলোতে existence check যোগ করে ফিক্স
করা হয়েছে (নিচে বিস্তারিত)।

### ফিক্স করা ১৪টা Bug (chronological, ফিক্স প্যাটার্ন সব জায়গায় অভিন্ন)

1. **`GET /api/forum/posts/[postId]`** — সরাসরি `update()` ব্যবহার
   করে viewCount বাড়ানো হতো, `if (!post)` dead code ছিল। ফিক্স:
   `update()` এর আগে `findUnique({ select: { id: true } })` দিয়ে
   existence চেক, না পেলে ৪০৪, তারপরই `update()` কল।

2-3. **`PATCH`/`DELETE /api/admin/chapters/[chapterId]`** — দুটোতেই
   কোনো existence check ছাড়া সরাসরি `chapter.update()`/`delete()`।
   ফিক্স: `findUnique` দিয়ে existence চেক যোগ, "চ্যাপ্টার পাওয়া
   যায়নি" ৪০৪ মেসেজ।

4-5. **`PATCH`/`DELETE /api/admin/subjects/[subjectId]`** — একই
   প্যাটার্ন, "সাবজেক্ট পাওয়া যায়নি" ৪০৪।

6-7. **`PATCH`/`DELETE /api/admin/topics/[topicId]`** — একই
   প্যাটার্ন, "টপিক পাওয়া যায়নি" ৪০৪।

8-9. **`PATCH`/`DELETE /api/admin/questions/[questionId]`** — একই
   প্যাটার্ন, "প্রশ্ন পাওয়া যায়নি" ৪০৪।

10-11. **`PATCH`/`DELETE /api/admin/cq-questions/[cqQuestionId]`**
   — একই প্যাটার্ন, "CQ প্রশ্ন পাওয়া যায়নি" ৪০৪।

12. **`DELETE /api/admin/forum/posts/[postId]`** (admin moderation
    delete, `GET /api/forum/posts/[postId]` থেকে আলাদা ফাইল) — একই
    প্যাটার্ন, "পোস্ট পাওয়া যায়নি" ৪০৪।

13. **`PATCH /api/admin/forum/posts/[postId]/pin`** — একই প্যাটার্ন।

14. **`PATCH /api/admin/users/[userId]`** (role change) — সামান্য
    ভিন্ন root cause: `previousUser` ইতিমধ্যে fetch করা হতো
    (audit log এর জন্য `previousRole` দরকার ছিল) কিন্তু তার null
    চেক না করেই সরাসরি `user.update()` কল করা হতো। ফিক্স: fetch
    করা `previousUser` এর null চেক যোগ করে ৪০৪ রিটার্ন (নতুন কোনো
    query লাগেনি, বিদ্যমান fetch টাই ব্যবহার করা হয়েছে)।

### ফিক্স প্যাটার্ন (কোড উদাহরণ, chapters route থেকে)
```ts
// আগে (bug):
const chapter = await prisma.chapter.update({
  where: { id: chapterId },
  data: { ... },
});
return NextResponse.json({ chapter });

// পরে (ফিক্সড):
const existing = await prisma.chapter.findUnique({ where: { id: chapterId } });
if (!existing) {
  return NextResponse.json({ error: "চ্যাপ্টার পাওয়া যায়নি" }, { status: 404 });
}
const chapter = await prisma.chapter.update({
  where: { id: chapterId },
  data: { ... },
});
return NextResponse.json({ chapter });
```

### লাইভ Multi-User টেস্ট (`scripts/test-p2025-404-audit.py`)
৩৬টা assertion, সব PASS। মূল যাচাই:
1. Admin+Student দুইজন real ইউজার রেজিস্ট্রেশন+লগইন
2. **প্রতিটা ফিক্স করা endpoint এ** (`GET /api/forum/posts/[fake]`,
   admin chapters/subjects/topics/questions/cq-questions এর
   PATCH+DELETE, admin forum posts DELETE+pin, admin users PATCH)
   একটা নিশ্চিতভাবে-অস্তিত্বহীন ID (`nonexistent_id_p2025_audit_xyz`)
   দিয়ে রিকোয়েস্ট পাঠিয়ে এখন ৪০৪ (আগে ৫০০ ছিল) রিটার্ন হচ্ছে তা
   ভেরিফাই — ১৩টা এন্ডপয়েন্ট-কেস
3. **Authorization regression**: student role দিয়ে admin PATCH
   endpoint কল করলে এখনো ৪০৩ (existence check যোগ করার সময়
   authorization guard এর আগে/পরে ক্রম ঠিক আছে তা নিশ্চিত)
4. **Regression-free normal flow**: আসল subject/topic ID দিয়ে GET
   ২০০ রিটার্ন করে, আসল forum post তৈরি করে GET করলে viewCount
   ঠিকভাবে increment হয় (নতুন existence-check যোগ করার পরেও মূল
   ফাংশনালিটি অক্ষত)
5. **Cascade delete test cleanup**: টেস্ট forum post প্রকৃত
   `DELETE /api/forum/posts/[postId]` endpoint দিয়ে মুছে DB তে
   ভেরিফাই (raw SQL bypass না)
6. **Static source-code verification**: ৯টা মূল ফাইলে নতুন
   existence-check এরর মেসেজ স্ট্রিং সরাসরি সোর্স ফাইল পড়ে যাচাই
7. Test users cleanup + DB verify

### গুরুত্ব ও প্রভাব
এই bug pattern টা প্রতিটা admin CRUD endpoint কে প্রভাবিত করেছিল —
যদি admin panel এ কোনো race condition ঘটতো (যেমন দুইজন admin
একসাথে একই রেকর্ড এডিট করছে, একজন delete করে ফেলার পরে আরেকজন
সেভ করার চেষ্টা করছে), অথবা কোনো stale/cached client-side ID দিয়ে
রিকোয়েস্ট যেত, তাহলে ইউজার একটা generic "Internal Server Error"
(৫০০) দেখতো, স্পষ্ট "এটা পাওয়া যায়নি" (৪০৪) বার্তার বদলে —
UX-এর দিক থেকে বিভ্রান্তিকর এবং debugging-এর দিক থেকেও কম তথ্যবহুল
(৫০০ error লগ এ generic Prisma exception দেখাত, root cause অস্পষ্ট
থাকতো)। এখন সব জায়গায় সুনির্দিষ্ট ৪০৪ + বাংলা এরর মেসেজ পাওয়া যায়।

### সীমাবদ্ধতা ও ভবিষ্যৎ সতর্কতা (স্বচ্ছভাবে জানানো)
regex-based systematic audit ১০০% guarantee দেয় না যে কোডবেসে আর
কোনো instance নেই — এটা একটা heuristic যেটা এই নির্দিষ্ট প্যাটার্নের
(handler বডিতে findUnique/findFirst টেক্সট না থাকা) উপর ভিত্তি করে
কাজ করে। **ভবিষ্যতে নতুন PATCH/DELETE endpoint লেখার সময় বাধ্যতামূলক
checklist**: `prisma.X.update()`/`delete()` কল করার ঠিক আগে সবসময়
`findUnique()`/`findFirst()` দিয়ে existence (এবং প্রয়োজনে ownership)
যাচাই করা, `update()`/`delete()` এর রেজাল্টের উপর `if (!result)`
চেক কখনো না করা (এটা কার্যকর হয় না, বরং exception throw হয়ে যাবে)।

### পরিবর্তিত ফাইল
- `app/api/forum/posts/[postId]/route.ts`
- `app/api/admin/chapters/[chapterId]/route.ts`
- `app/api/admin/subjects/[subjectId]/route.ts`
- `app/api/admin/topics/[topicId]/route.ts`
- `app/api/admin/questions/[questionId]/route.ts`
- `app/api/admin/cq-questions/[cqQuestionId]/route.ts`
- `app/api/admin/forum/posts/[postId]/route.ts`
- `app/api/admin/forum/posts/[postId]/pin/route.ts`
- `app/api/admin/users/[userId]/route.ts`
- নতুন: `scripts/test-p2025-404-audit.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি, `pnpm exec tsc
--noEmit`, `pnpm build` (২৭.৭ সেকেন্ডে কম্পাইল), `pnpm lint` তিনটাই
clean পাস করেছে।

## 🐛🔧 XP-Double-Award প্যাটার্ন অডিট ✅ সম্পন্ন

### প্রেক্ষাপট
"P2025 500-instead-of-404" অডিটের পরে আরও Bug Hunt করার সময়
XP-double-award pattern (আগের সেশনে Task/StudyPlanItem এ পাওয়া bug
এর একই ধরনের সম্ভাব্য instance আরও কোথাও আছে কিনা) প্রোঅ্যাক্টিভভাবে
অডিট করা হয়। কোডবেসের সব `awardXp()` call site (মোট ১৯টা, `lib/`+
`app/api/` মিলিয়ে) একে একে রিভিউ করে দুইটা bug পাওয়া যায়।

### Bug ১: Topic Progress XP Farming

**Root cause**: `app/api/topics/[topicId]/progress/route.ts` এ:
```ts
if (status === "MASTERED") {
  await awardXp(session.user.id, 20);
}
```
কোনো আগের-state চেক ছাড়া — এটা ঠিক Task/StudyPlanItem এ আগে পাওয়া
"wasCompleted" bug এর মতোই: TODO→DONE→TODO→DONE টগল করলে প্রতিবার
নতুন XP পাওয়া যায় (XP farming)।

**লাইভ ভেরিফিকেশন (root cause নিশ্চিতকরণ)**:
```python
# ৫ বার টগল: MASTERED -> LEARNING -> MASTERED -> LEARNING -> MASTERED
# ফলাফল: XP gained = 60 (৩ x ২০, প্রত্যাশিত ছিল ২০)
```

**ফিক্স**: `TopicProgress` মডেলে নতুন `xpAwarded Boolean @default(false)`
ফিল্ড যোগ (Task/StudyPlanItem এর প্রতিষ্ঠিত প্যাটার্ন অবিকল অনুসরণ
করে) — নতুন migration `20260718000000_add_topic_progress_xp_awarded`।
`shouldAwardXp = willBeMastered && !existing?.xpAwarded` লজিক দিয়ে
একবার XP দেওয়া হয়ে গেলে `xpAwarded=true` সেট হয়ে যায়, ভবিষ্যতে
যতবারই status toggle হোক না কেন আর কখনো XP দেওয়া হবে না।

### Bug ২: Study Group Weekly Bonus XP Race Condition (দুই ধাপে আবিষ্কৃত)

**ধাপ ১ — প্রাথমিক সন্দেহ (over-award)**: `lib/study-group.ts` এর
`contributeGroupXp()` ফাংশনে read-then-write প্যাটার্ন পাওয়া যায়
(কোনো transaction/lock ছাড়া):
```ts
const before = await prisma.studyGroupMember.aggregate({...}); // read
await prisma.studyGroupMember.update({...}); // write নিজের contribution
const afterTotal = beforeTotal + amount; // in-memory হিসাব
if (beforeTotal < goal && afterTotal >= goal) { /* bonus দাও */ }
```
থিওরিটিক্যালি দুইজন সদস্য প্রায় একই মুহূর্তে contribute করলে উভয়েই
independently থ্রেশহোল্ড ক্রস করা দেখতে পারতো এবং bonus দুইবার
দেওয়া হতে পারতো। এই bug টা Python দিয়ে বারবার (৩ বার) reproduce
করার চেষ্টা করা হয় কিন্তু race window খুবই ছোট হওয়ায় সফল হয়নি
(শুধু কোড রিভিউ ভিত্তিক সন্দেহ ছিল)।

ব্যবহারকারীকে জিজ্ঞেস করা হয় এই থিওরিটিক্যাল (কম severity) bug
এখনই ফিক্স করা হবে কিনা — ব্যবহারকারী "এখনই ফিক্স করো" বেছে নেন।

**প্রাথমিক ফিক্স (atomic claim mechanism)**: `StudyGroup` মডেলে
নতুন `weeklyBonusWeekStart DateTime?` ফিল্ড যোগ, atomic conditional
`updateMany()` দিয়ে "claim" করার লজিক লেখা হয়:
```ts
const claim = await prisma.studyGroup.updateMany({
  where: { id: groupId, OR: [{ weeklyBonusWeekStart: null }, { weeklyBonusWeekStart: { lt: currentWeekStart } }] },
  data: { weeklyBonusWeekStart: currentWeekStart },
});
if (claim.count === 1) { /* bonus দাও */ }
```

**ধাপ ২ — আরও গুরুতর bug আবিষ্কার (under-award)**: প্রাথমিক ফিক্স
verify করার জন্য একটা Node.js/tsx script লেখা হয় যেটা actual
`lib/study-group.ts` থেকে `contributeGroupXp()` import করে ৫ জন
টেস্ট ইউজার দিয়ে সত্যিকারের concurrent (`Promise.all`) DB কল
সিমুলেট করে। ফলাফল ছিল **০টা bonus notification** (প্রত্যাশিত ৫টা)
— সম্পূর্ণ বিপরীত সমস্যা! Root cause: প্রাথমিক ফিক্সে `afterTotal
= beforeTotal + amount` এখনো in-memory হিসাব করা হচ্ছিল, যেটা নিজের
`aggregate()` রিডের সময়কার stale snapshot ব্যবহার করে — concurrent
অন্য সদস্যদের একই সময়ে হওয়া commit দেখতে পারে না। ৫ জন একসাথে ২৫
XP করে contribute করলে (মোট ১২৫, threshold ১০০) প্রত্যেকেই নিজের
হিসেবে `beforeTotal=0, afterTotal=25` (থ্রেশহোল্ডের অনেক নিচে)
দেখতো, যদিও group এর প্রকৃত মোট ১২৫ ছিল — ফলে কেউই bonus trigger
করতো না।

**চূড়ান্ত ফিক্স**: নিজের `weeklyXpContributed` increment **commit
হওয়ার পরে** আবার fresh `aggregate()` করে group এর প্রকৃত বর্তমান
total বের করা হয় (PostgreSQL read-committed isolation এ এতক্ষণে
commit হওয়া সব concurrent write দেখা যায়):
```ts
await prisma.studyGroupMember.update({ where: { userId }, data: { weeklyXpContributed: { increment: amount }, ... } });
const after = await prisma.studyGroupMember.aggregate({ where: { groupId }, _sum: { weeklyXpContributed: true } });
const currentTotal = after._sum.weeklyXpContributed ?? 0;
if (currentTotal >= goal) {
  const claim = await prisma.studyGroup.updateMany({ where: { ... }, data: { weeklyBonusWeekStart: currentWeekStart } });
  if (claim.count === 1) { /* bonus দাও */ }
}
```
এই ডিজাইনে over-award (atomic claim দিয়ে) এবং under-award (fresh
read দিয়ে) দুটোই দূর হয়েছে।

### লাইভ ভেরিফিকেশন (`scripts/test-study-group-bonus-race-condition.ts`)
Node.js/tsx দিয়ে actual `lib/study-group.ts` থেকে import করে ৫ জন
টেস্ট ইউজার + একটা group (weeklyGoalXp=100) তৈরি করে সবাইকে
`Promise.all` দিয়ে ২৫ XP করে সত্যিকারের concurrent contribute
করানো হয় (মোট ১২৫, থ্রেশহোল্ড ক্রস)। ৩ বার রান করে প্রতিবার:
- ঠিক ৫টা "লক্ষ্য পূরণ" নোটিফিকেশন (প্রতি সদস্যে ১টা, না কম না বেশি)
- সবার XP সমান (২০, GROUP_BONUS_XP ঠিক একবার)
- `weeklyBonusWeekStart` সঠিকভাবে claim হয়েছে

### বাকি ১৭টা `awardXp()` Call Site অডিট (নিরাপদ নিশ্চিত করা)
- **CQ submit, Practice submit, Adaptive Practice submit, Drill
  submit, Mock Exam submit-mcq/submit-cq, Live Exam submit, Study
  Session (Pomodoro)**: প্রতিটা একটা নতুন attempt/session row
  `create()` করে (প্রতিটা genuine নতুন কার্যকলাপ), তাই একই কাজ বারবার
  করলে বৈধভাবে বারবার XP পাওয়া উচিত — bug না।
- **Forum post create, Forum reply create**: প্রতিটা নতুন কনটেন্ট,
  বৈধ প্রতিবার XP।
- **Flashcard Review**: প্রতিটা রিভিউ কল একটা নতুন spaced-repetition
  ইভেন্ট, বৈধ প্রতিবার XP।
- **Quiz Battle submitBattleAnswers**: `if (participant.submittedAt)
  throw` গার্ড — দ্বিতীয়বার submit করা যায় না, নিরাপদ।
- **Quiz Battle endBattle (winner bonus)**: `battle.status !==
  "ACTIVE"` গার্ড + status একমুখী transition (ACTIVE→COMPLETED),
  নিরাপদ।
- **Quiz Duel submitDuelAnswers/finalizeDuel**: `duel.
  challengerAnswers`/`opponentAnswers` না-null চেক দিয়ে duplicate
  submission ঠেকানো, `bothSubmitted && status === "ACTIVE"` গার্ড
  দিয়ে finalize একবারই হয়, নিরাপদ।
- **Reading Room leaveReadingRoom/endSessionInternal**: `if
  (sessionRow.endedAt) return { xpEarned: 0 }` চেক, নিরাপদ।
- **Weekly Digest**: শুধু read/notify করে, কোনো awardXp নেই (ভুল
  ধারণা ছিল, রিভিউ করে নিশ্চিত হওয়া গেছে আসলে awardXp import করা
  থাকলেও ব্যবহার হয় না বর্তমান কোডে)।

### লাইভ Multi-User টেস্ট (`scripts/test-xp-double-award-audit.py`)
২০টা assertion, সব PASS। মূল যাচাই:
1. Topic Progress: ৫ বার টগল (৩ বার MASTERED) করে XP ঠিক একবারই
   (২০, আগে হতো ৬০) দেওয়া হয়েছে তা DB তে সরাসরি ভেরিফাই
2. `TopicProgress.xpAwarded` ফ্ল্যাগ সঠিকভাবে persist হয়েছে
3. আরও একবার টগল করেও XP অপরিবর্তিত (regression-free double-check)
4. Authorization (৪০১)/edge-case (invalid status ৪০০)
5. Static source-code verification — উভয় ফাইলে (progress route +
   study-group.ts) নতুন লজিক সঠিকভাবে আছে
6. Test cleanup + DB verify

### Sandbox/Dev Server সতর্কতা (এই ফিচারে নতুন শেখা, transparency নোট)
Migration apply করার আগে থেকেই একটা পুরনো dev server প্রসেস চলমান
ছিল — সেটা পুরনো (migration-এর আগের) Prisma Client ব্যবহার করছিল,
ফলে `xpAwarded` ফিল্ড সহ নতুন কোড চালানোর সময় `PrismaClientValidation
Error: Unknown argument xpAwarded` (৫০০ error) হচ্ছিল প্রথম টেস্ট
রানে। **শেখা শিক্ষা**: schema migration + `prisma generate` করার
পরে, migration করার আগে থেকে চলমান যেকোনো dev server অবশ্যই
kill করে fresh restart করতে হবে (এবং সতর্কতার জন্য `.next` cache ও
মুছে ফেলা ভালো) — নাহলে পুরনো generated Prisma Client ইন-মেমরি থেকে
যায় এবং নতুন ফিল্ড চিনতে পারে না।

### পরিবর্তিত ফাইল
- `prisma/schema.prisma` — `TopicProgress.xpAwarded`,
  `StudyGroup.weeklyBonusWeekStart` দুটো নতুন ফিল্ড
- নতুন migration: `prisma/migrations/20260718000000_add_topic_progress_xp_awarded/`
- নতুন migration: `prisma/migrations/20260718010000_add_study_group_weekly_bonus_claim/`
- `app/api/topics/[topicId]/progress/route.ts` — xpAwarded লজিক
- `lib/study-group.ts` — `contributeGroupXp()` সম্পূর্ণ redesign
  (fresh-aggregate-after-commit + atomic claim)
- নতুন: `scripts/test-xp-double-award-audit.py`
- নতুন: `scripts/test-study-group-bonus-race-condition.ts`

দুটো নতুন migration লেগেছে (উভয়ে PostgreSQL এর documented
`prisma migrate diff` pgvector bug এর ফাঁদ এড়িয়ে হাতে তৈরি করা
হয়েছে, HNSW index অক্ষত রাখা নিশ্চিত করে)। কোনো নতুন dependency
লাগেনি। `pnpm exec tsc --noEmit`, `pnpm build` (২৮.৩ সেকেন্ডে
কম্পাইল), `pnpm lint` তিনটাই clean পাস করেছে। migration apply করার
সময় DB তে কোনো বিদ্যমান `topic_progress`/`study_groups` রেকর্ড ছিল
না (যাচাই করে নিশ্চিত হওয়া গেছে), তাই backfill statement defensive
হলেও বাস্তবে কোনো রো touch করেনি।

## 📱 Bottom Navigation Bar (মোবাইল) ✅ সম্পন্ন

### প্রেক্ষাপট
আগের সেশনগুলোতে UI/UX পলিশ candidate list এ "Bottom Navigation Bar
(মোবাইল)" আইটেমটা বেশ কয়েকবার উঠেছিল কিন্তু implement করা হয়নি।
এই সেশনে সেটা সম্পূর্ণ করা হলো। HSC Ultimate সম্পূর্ণভাবে
`(dashboard)` route group ভিত্তিক (৩০+টা মডিউল/রুট) এবং কোনো shared
`(dashboard)/layout.tsx` নেই (প্রতিটা পেজ standalone, নিজস্ব header
সহ) — তাই root `app/layout.tsx` এ globally mount করা client
component হিসেবে ডিজাইন করা হয়েছে যেটা pathname+session অনুযায়ী
conditionally রেন্ডার হয়।

### ডিজাইন সিদ্ধান্ত
1. **৫টা ট্যাব**: হোম (Dashboard), শেখো (Learn), প্র্যাকটিস
   (Practice), প্ল্যানার, "আরও"। HSC Ultimate এ ৩০+টা মডিউল আছে —
   সবগুলো ৫-আইকন bar এ রাখা অসম্ভব, তাই সবচেয়ে বেশি ব্যবহৃত ৪টা +
   "আরও" bottom-sheet এ বাকি সব।
2. **Conditional visibility**:
   - লগইন না থাকলে (landing/login/register) — দেখানো হয় না
   - Admin Panel (`/admin`) এ — দেখানো হয় না (নিজস্ব sidebar আছে)
   - Quiz/Exam/Duel/Battle এর **লাইভ** সাব-রুটে (`/practice/result`,
     `/mock-exam/attempt`, `/mock-exam/result`, `/adaptive-practice/run`,
     `/drill/run`, `/cq-practice/result`, `/admission/run`,
     `/admission/result`, `/duel/[duelId]`, `/quiz-battle/[battleId]`,
     `/live-exam/[sessionId]`, `/pdf-chat/[documentId]`) — দেখানো হয়
     না, যাতে পরীক্ষা/কুইজ চলাকালীন ভুলবশত ট্যাব চেপে বের হয়ে না যায়
   - কিন্তু এদের **লিস্ট/হিস্ট্রি** পেজে (`/duel`, `/duel/history`,
     `/quiz-battle`, `/quiz-battle/history`, `/quiz-battle/create`,
     `/live-exam`, `/live-exam/start`, `/pdf-chat`) ঠিকই দেখানো হয়
     (`EXCEPTION_EXACT_PATHS` দিয়ে trailing-prefix match থেকে exempt)
3. **Active tab detection**: `isTabActive()` — `/dashboard` এর জন্য
   exact match (নাহলে অন্য সব রুট `/dashboard` এর prefix হিসেবে match
   করে যেত, ভুল), বাকি ট্যাবের জন্য prefix match (nested রুটেও কাজ
   করে, যেমন `/learn/[subjectId]`)।
4. **Accessibility**: `role="navigation"` + বাংলা `aria-label`,
   `aria-current="page"` active ট্যাবে, `<Link>` (native anchor,
   keyboard-focusable), `focus-visible:ring-2` (Keyboard Tab-order
   অডিটের প্রতিষ্ঠিত প্যাটার্ন অনুসরণ করে)।
5. **Safe-area padding**: `env(safe-area-inset-bottom)` — iOS হোম
   ইন্ডিকেটর/Android gesture বার এর সাথে ওভারল্যাপ এড়াতে।

### "আরও" Bottom Sheet মেনু (`components/layout/more-menu-sheet.tsx`)
`@base-ui/react/dialog` primitive সরাসরি ব্যবহার করে কাস্টম
bottom-sheet ডিজাইন করা হয়েছে (`components/ui/dialog.tsx` এর
`DialogContent` কেন্দ্রীভূত মোডালের জন্য ডিজাইন করা, bottom sheet এর
জন্য আলাদা positioning দরকার ছিল — `fixed inset-x-0 bottom-0
rounded-t-2xl` + tw-animate-css এর `slide-in-from-bottom`/
`slide-out-to-bottom` utility ব্যবহার করে)। বাকি ১৮টা+ মডিউল
(AI Tutor, Smart Practice, Timed Drill, CQ Practice, Admission Prep,
Mock Exam, Flashcards, Leaderboard, Community, Study Group, Reading
Room, Quiz Duel, PDF Chat, Live Exam, Quiz Battle, Analytics, সেভ
করা, সেটিংস) ৪-কলাম গ্রিডে, Admin হলে conditionally "Admin Panel"
শর্টকাটও যোগ হয়।

### DRY রিফ্যাক্টর: `lib/protected-routes.ts`
`PROTECTED_PREFIXES` আগে শুধু `proxy.ts` এ hardcoded array হিসেবে
ছিল। Bottom Nav Bar এর hidden-prefix লজিকের সাথে conceptually
সম্পর্কিত (যদিও আলাদা উদ্দেশ্যে ব্যবহৃত) হওয়ায়, এবং ভবিষ্যতে অন্য
client component এও এই তথ্য দরকার হতে পারে ভেবে, একটা নতুন pure
(server/client উভয় জায়গায় safe) `lib/protected-routes.ts` ফাইলে বের
করে আনা হয়েছে। `proxy.ts` এখন সেখান থেকে import করে। **সতর্কতা**:
`config.matcher` (Next.js এর static-analyzable রিকোয়ারমেন্ট) এখনো
আলাদা array হিসেবে রাখতে হয়েছে — matcher রানটাইম import থেকে
জেনারেট করা যায় না।

### বিদ্যমান Fixed-Position UI Element এর সাথে সমন্বয়
`components/pwa-install-prompt.tsx` ও `components/shared/
offline-sync-indicator.tsx` — দুটোই আগে `bottom-4` এ ফিক্সড ছিল।
মোবাইলে bottom nav bar (৩.৫rem উচ্চতা + safe-area) এর সাথে
ওভারল্যাপ করতো। ফিক্স: `bottom-[calc(4.5rem+env(safe-area-inset-
bottom))] sm:bottom-4` — মোবাইলে bottom nav এর উপরে বসে, `sm`
ব্রেকপয়েন্টের উপরে (যেখানে bottom nav `sm:hidden` এ hidden) আগের
`bottom-4` আচরণ ফিরে আসে।

### Content Spacer
Bottom nav নিজে `fixed` position হওয়ায় normal document flow থেকে
বাদ পড়ে যায় — এর মানে কোনো পেজের নিচের অংশ (বিশেষ করে ছোট স্ক্রিনে
স্ক্রল করে শেষ পর্যন্ত গেলে) bottom nav দ্বারা ঢাকা পড়তে পারতো। এটা
এড়াতে `BottomNavBar` কম্পোনেন্টের নিজের ভেতরেই একটা `sm:hidden`
spacer `<div>` (bottom nav এর সমান height + safe-area) যোগ করা
হয়েছে — যেহেতু bottom nav সবসময় শেষে (`</body>` এর কাছাকাছি)
রেন্ডার হয়, এই spacer সম্পূর্ণ page content এর পরে আসে এবং প্রতিটা
পেজের bottom padding effectively বাড়িয়ে দেয় (প্রতিটা আলাদা page.tsx
এ ম্যানুয়ালি padding যোগ করার দরকার নেই)।

### লাইভ Multi-User টেস্ট (`scripts/test-bottom-nav-bar.py`)
৪২টা assertion, সব PASS। মূল যাচাই:
1. Bottom nav এর ৪টা ট্যাব (`/dashboard`, `/learn`, `/practice`,
   `/planner`) crash-free লোড (batched, ৩০০ms delay সহ memory-aware)
2. "আরও" মেনুর ১৮টা+ href crash-free লোড, বিশেষভাবে hidden-prefix
   exception পেজ (`/duel`, `/quiz-battle`, `/live-exam`, `/pdf-chat`
   এর লিস্ট ভ্যারিয়েন্ট) ঠিকভাবে লোড হচ্ছে তা যাচাই
3. Unauthenticated landing/login পেজ regression-free
4. Static source-code verification — hidden-prefix লজিক, active-tab
   লজিক, accessibility attribute, safe-area padding, DRY রিফ্যাক্টর
   (`lib/protected-routes.ts` + `proxy.ts` import), fixed-element
   bottom-offset সমন্বয় (PWA prompt + offline indicator)

### সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)
`BottomNavBar` client-side `useSession()` hook এর উপর নির্ভর করে
(session client-এ resolve হওয়ার পরেই রেন্ডার হয়) — তাই সার্ভার-রেন্ডার
করা initial HTML এ কম্পোনেন্ট মার্কআপ দেখা যায় না (established CSR
false-negative প্যাটার্ন, এই কোডবেসে বহুবার documented)। শুধু compiled
JS bundle এ কম্পোনেন্ট কোড আছে তা যাচাই করা সম্ভব হয়েছে, actual
client-side hydrated DOM output না। এছাড়া প্রকৃত মোবাইল ডিভাইসে
visually bottom nav ঠিকভাবে দেখা যাচ্ছে কিনা, touch target size
(Apple HIG ৪৪px+ সুপারিশ অনুযায়ী h-14 grid cell যথেষ্ট বড় কিনা), এবং
safe-area padding প্রকৃত notched ডিভাইসে সঠিকভাবে কাজ করছে কিনা —
এই sandbox এ browser automation/real device testing না থাকায়
ম্যানুয়ালি ভেরিফাই করা সম্ভব হয়নি, ব্যবহারকারীকে নিজে দেখে নিশ্চিত
হওয়ার অনুরোধ থাকল।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `components/layout/bottom-nav-bar.tsx`
- নতুন: `components/layout/more-menu-sheet.tsx`
- নতুন: `lib/protected-routes.ts`
- `app/layout.tsx` — `<BottomNavBar />` mount
- `proxy.ts` — `PROTECTED_PREFIXES` এখন `lib/protected-routes.ts`
  থেকে import (DRY)
- `components/pwa-install-prompt.tsx` — bottom-offset সমন্বয়
- `components/shared/offline-sync-indicator.tsx` — bottom-offset সমন্বয়
- নতুন: `scripts/test-bottom-nav-bar.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি (base-ui Dialog
primitive আগে থেকেই ব্যবহৃত হচ্ছিল, tw-animate-css এর slide utility
আগে থেকেই উপলব্ধ)। `pnpm exec tsc --noEmit`, `pnpm build` (২৪.৬
সেকেন্ডে কম্পাইল), `pnpm lint` তিনটাই clean পাস করেছে।

## 🐛🔧 DELETE Endpoint Cascade Audit ✅ সম্পন্ন

### প্রেক্ষাপট
Bottom Navigation Bar ফিচারের পরে আরও Bug Hunt candidate হিসেবে
DELETE endpoint cascade audit বেছে নেওয়া হয়। এই আগেই একবার আংশিকভাবে
হয়েছিল (`deleteUserAccount()` রিভিউ, "P2025 500-instead-of-404"
অডিট) কিন্তু কখনো সম্পূর্ণভাবে সিস্টেমেটিকভাবে করা হয়নি।

### সিস্টেমেটিক অডিট (পদ্ধতি)
1. `prisma/schema.prisma` এ সব `@relation(fields: [...])` লাইন গ্রেপ
   করে দেখা হয়েছে সবগুলোতে `onDelete: Cascade`/`SetNull` সঠিকভাবে
   আছে কিনা — ৩০+টা relation পাওয়া গেছে, সবগুলোতেই ঠিক আছে (একমাত্র
   ব্যতিক্রম `QuizBattle.subjectId` যেটা ইচ্ছাকৃতভাবে `SetNull`,
   Subject ডিলিট হলেও battle history রাখার জন্য — এটা bug না,
   design সিদ্ধান্ত)।
2. **raw string ID reference** (কোনো `@relation` FK ছাড়া) খোঁজা
   হয়েছে — `customSetId` ফিল্ড দুই জায়গায় পাওয়া গেছে
   (`QuizBattle.customSetId`, `LiveExamSession.customSetId`), উভয়েই
   `CustomQuestionSet` এর সাথে সম্পর্কিত কিন্তু কোনো FK constraint
   নেই (schema তে ইচ্ছাকৃত ডিজাইন — প্রশ্নের উৎস দুই রকম হতে পারে,
   Subject question bank অথবা CustomQuestionSet, একটামাত্র nullable
   polymorphic FK Prisma তে generalize করা কঠিন)।

### বাগ: Orphan Reference — চলমান Battle/Exam এ ব্যবহৃত সেট ডিলিট করলে প্রশ্ন হারিয়ে যায়

**লাইভ ভেরিফিকেশন (root cause নিশ্চিতকরণ)**:
```python
# ১. Owner একটা CustomQuestionSet তৈরি করে (৩টা প্রশ্ন সহ, সরাসরি DB তে READY স্ট্যাটাসে)
# ২. সেই সেট দিয়ে Quiz Battle তৈরি (customSetId সেট), Player join করে, Owner start করে (ACTIVE)
# ৩. Owner নিজের সেট DELETE করে (প্রকৃত API endpoint দিয়ে) -> 200 (তখন কোনো বাধা ছিল না)
# ৪. Player GET .../questions কল করে -> {"questions": []}  (bug!)
```
একই bug pattern Live Exam এও reproduce হয়েছে (IN_PROGRESS সেশনে
ব্যবহৃত সেট ডিলিট করলে `GET .../questions` খালি array রিটার্ন করে)।

**প্রভাব**: battle/exam "চলছে" স্ট্যাটাসে থাকে কিন্তু কোনো প্রশ্ন
দেখা যায় না — participant রা confusion/dead-end অভিজ্ঞতা পায়, কোনো
স্পষ্ট error message ছাড়াই (silent data loss, সবচেয়ে খারাপ ধরনের
bug কারণ ইউজার বুঝতেই পারে না কী ঘটেছে)।

### ফিক্স
`DELETE /api/custom-question-sets/[setId]` এ ownership চেকের পরে,
delete করার আগে দুইটা নতুন existence চেক যোগ করা হয়েছে:
```ts
const [activeBattle, activeLiveExam] = await Promise.all([
  prisma.quizBattle.findFirst({
    where: { customSetId: setId, status: { in: ["WAITING", "ACTIVE"] } },
    select: { id: true },
  }),
  prisma.liveExamSession.findFirst({
    where: { customSetId: setId, status: "IN_PROGRESS" },
    select: { id: true },
  }),
]);

if (activeBattle) {
  return NextResponse.json(
    { error: "এই সেট দিয়ে একটা Quiz Battle এখনো চলছে — সেটা শেষ হওয়ার পরে ডিলিট করো" },
    { status: 400 }
  );
}
if (activeLiveExam) {
  return NextResponse.json(
    { error: "এই সেট দিয়ে একটা Live Exam এখনো চলছে — সেটা শেষ করার পরে ডিলিট করো" },
    { status: 400 }
  );
}
```
এই ডিজাইনে **WAITING** battle-ও ব্লক করা হয়েছে (শুধু ACTIVE না) —
কারণ WAITING battle এ ইতিমধ্যে অন্য participant join করে থাকতে
পারে এবং owner যেকোনো সময় start করতে পারে, তাই সেট ডিলিট করার আগে
battle টা COMPLETED বা বাতিল হওয়া উচিত। COMPLETED battle/exam এ
ব্যবহৃত সেট ডিলিট করা নিরাপদ (নতুন কোনো active session আর তৈরি হবে
না, শুধু ফলাফল/review পেজ প্রশ্নের বদলে ফাঁকা দেখাবে যা ইতিমধ্যে
শেষ হওয়া সেশনের ক্ষেত্রে গ্রহণযোগ্য ট্রেড-অফ)।

### QuizDuel Cross-User Cascade — নথিভুক্ত (ইচ্ছাকৃতভাবে ব্লক করা হয়নি)
অডিটের সময় আরেকটা থিওরিটিক্যাল ইস্যু লক্ষ করা গেছে:
`QuizDuel.challengerId` ও `QuizDuel.opponentId` উভয়েই `onDelete:
Cascade`। এর মানে যেকোনো একজন প্রতিপক্ষ (challenger বা opponent)
নিজের অ্যাকাউন্ট ডিলিট করলে, পুরো `QuizDuel` রেকর্ডটাই মুছে যায় —
অন্যজনের (যে অ্যাকাউন্ট ডিলিট করেনি) duel history থেকেও সেই এন্ট্রি
হারিয়ে যায়। একই প্যাটার্ন `QuizBattle.ownerId` (owner ডিলিট হলে
পুরো battle+সব participant এর score history হারিয়ে যায়)।

**সিদ্ধান্ত: ইচ্ছাকৃতভাবে ফিক্স করা হয়নি।** কারণ এটা ফিক্স করতে হলে
হয় (ক) `onDelete: SetNull` এ পরিবর্তন করে "ডিলিট হওয়া ইউজার" এর
জন্য placeholder দেখাতে হবে (স্কিমা পরিবর্তন + সব query তে null
handling), অথবা (খ) অ্যাকাউন্ট ডিলিট করার আগে "তোমার active duel/
battle আছে, আগে সেগুলো শেষ করো" বলে ব্লক করতে হবে — কিন্তু এটা
GDPR-style "নিজের ডেটা ডিলিট করার অধিকার" এর নীতির সাথে সাংঘর্ষিক
(ইউজারকে নিজের অ্যাকাউন্ট ডিলিট করা থেকে আটকানো ঠিক হবে না,
বিশেষত persistent active session না থাকলে)। এই ট্রেড-অফ স্বচ্ছভাবে
এখানে ডকুমেন্ট করে রাখা হলো যাতে ভবিষ্যতে কেউ বিভ্রান্ত না হয়।

### লাইভ Multi-User টেস্ট (`scripts/test-custom-set-delete-cascade-audit.py`)
২০টা assertion, সব PASS। মূল যাচাই:
1. WAITING battle এ ব্যবহৃত সেট ডিলিট -> ৪০০ (ব্লকড)
2. Player join + Owner start (ACTIVE) করার পরেও সেট ডিলিট -> ৪০০
   (ব্লকড)
3. Battle এর প্রশ্ন এখনো ঠিকভাবে (৩টা) লোড হচ্ছে, খালি না
   (regression-free)
4. Player submit + Owner end (COMPLETED) করার পরে সেট ডিলিট -> ২০০
   (এখন কাজ করে, regression-free)
5. Live Exam IN_PROGRESS অবস্থায় সেট ডিলিট -> ৪০০ (ব্লকড)
6. Live Exam এর প্রশ্ন এখনো ঠিকভাবে (৩টা) লোড হচ্ছে
7. Authorization: owner না হলে ৪০৪
8. Static source-code verification
9. Test cleanup (battle/participant/session/set/question/user সব
   সরাসরি DB delete দিয়ে, ০টা orphan row)

### পরিবর্তিত ফাইল
- `app/api/custom-question-sets/[setId]/route.ts` — DELETE এ
  activeBattle/activeLiveExam চেক যোগ
- নতুন: `scripts/test-custom-set-delete-cascade-audit.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি। `pnpm exec tsc
--noEmit`, `pnpm build` (২৫.১ সেকেন্ডে কম্পাইল), `pnpm lint` তিনটাই
clean পাস করেছে।

## 📅 "আজকের পড়া" (Today's Focus) + নমনীয় Duration Auto Study Plan ✅ সম্পন্ন

### সমস্যা / উদ্দেশ্য
পুরনো Auto Study Plan (Planner পেজ) ফিক্সড ৭ দিনের প্ল্যান বানাতো এবং
সেটা শুধু Planner পেজে গিয়ে দেখতে হতো — Dashboard এ প্রতিদিনের নির্দিষ্ট
কাজ prominently দেখানোর কোনো ব্যবস্থা ছিল না, এবং miss করা টপিক কোথাও
ট্র্যাক হতো না (ভুলে গেলে হারিয়ে যেতো)। ব্যবহারকারী সরাসরি "আজকের পড়া"
ফিচার চেয়েছেন — Dashboard কার্ড যেটা AI প্ল্যান থেকে আজকের নির্দিষ্ট
পড়া দেখাবে, complete করা যাবে, miss হলে পরের দিন বকেয়া হিসেবে stack
হয়ে থাকবে। সাথে ডিজাইন সিদ্ধান্ত: duration নমনীয় হতে হবে (১/৭/৩০/৩৬৫
দিন, ইউজার নিজে বেছে নেবে)।

### ডিজাইন সিদ্ধান্ত (ব্যবহারকারীর সাথে স্পষ্টভাবে নিশ্চিত করা)
- **Duration**: ফিক্সড না, ইউজার ১/৭/৩০/৩৬৫ দিন (বা কাস্টম সংখ্যা)
  বেছে নেবে — "আমি যেভাবে বানাবো সেটাই দেখাবে"।
- **AI generation approach**: "AI দিয়ে ধাপে ধাপে (মাসিক)" — bulk
  algorithmic approach না, প্রতি মাসের শুরুতে AI call।
- **Dashboard placement**: স্ট্যাটস কার্ড (স্ট্রিক/XP/লেভেল) এর ঠিক
  পরে, মডিউল গ্রিডের আগে।
- **Missed topic behavior**: পরের দিন সবার উপরে "গতকালের বাকি" ব্যাজ
  সহ যোগ হবে, একাধিক miss stack হতে থাকবে।
- **পুরনো ৭-দিনের সিস্টেমের সাথে সম্পর্ক**: একটাই unified system —
  পুরনো ফিক্সড-৭-দিন সিস্টেমকে নমনীয়-duration সিস্টেমে upgrade করা
  হয়েছে, কোনো duplicate সিস্টেম বানানো হয়নি।

### Schema পরিবর্তন (migration `20260718020000_add_flexible_study_plan_duration`)
```prisma
enum StudyPlanGenerationStatus {
  GENERATING
  READY
  FAILED
}

model StudyPlan {
  // ... বিদ্যমান ফিল্ড ...
  durationDays       Int                       @default(7)
  generationStatus   StudyPlanGenerationStatus @default(READY)
  daysGenerated      Int                       @default(0)
  generationError    String?
}
```
pgvector HNSW `DROP INDEX` bogus-লাইন বাগ (Prisma issue #28414) এই
migration এও এসেছিল, established fix pattern দিয়ে সমাধান করা হয়েছে
(manual migration.sql লিখে `prisma migrate deploy`)।

### মূল লজিক (`lib/study-plan-generator.ts`, সম্পূর্ণ rewrite)
- `DURATION_PRESETS = [1, 7, 30, 365]`, `MIN_DURATION_DAYS = 1`,
  `MAX_DURATION_DAYS = 365`, `CHUNK_SIZE_DAYS = 15`।
- `generateStudyPlan(userId, durationDays)` — প্রথম chunk সিঙ্ক্রোনাসভাবে
  জেনারেট করে রিটার্ন করে; duration > CHUNK_SIZE_DAYS হলে
  `generationStatus: "GENERATING"` সহ রিটার্ন করে।
- `generateRemainingChunks(studyPlanId)` — বাকি chunk গুলো ব্যাকগ্রাউন্ডে
  (fire-and-forget, `await` ছাড়া `custom-question-gen.ts`-এর
  `processImageToQuestions()` প্যাটার্ন অনুসরণ করে) while loop এ
  ধারাবাহিকভাবে জেনারেট করে, প্রতিটা chunk শেষে `daysGenerated` DB তে
  আপডেট করে, সব শেষে `generationStatus: "READY"`, কোনো chunk এ exception
  হলে `generationStatus: "FAILED"` + `generationError`।
- `lib/today-focus.ts` এ `getTodayFocus(userId)` — rollover কুয়েরি
  (`date <= আজ AND isCompleted = false`) দিয়ে overdue+today items merge
  করে দেখায়, কোনো নতুন cron/field লাগেনি।

### 🐛 আবিষ্কৃত ও ফিক্সড AI JSON Generation বাগ (দুইটা, ধাপে ধাপে)

**বাগ #১ — Token limit এ truncation (৩৬৫-দিনের প্ল্যান টেস্ট করার সময়)**:
প্রাথমিকভাবে `CHUNK_SIZE_DAYS=30` এর সাথে `maxTokens=3000` ব্যবহার করা
হয়েছিল — কিন্তু ৩০ দিন × ~৩.৫ আইটেম = ~১০৫টা আইটেম, বাংলা
taskDescription+topicName সহ JSON আউটপুট ৩০০০ token এ কেটে যাচ্ছিল, এবং
কাটা জায়গায় closing `]` bracket-ই ছিল না — তাই তখনকার
`\[[\s\S]*\]` regex কোনো ম্যাচই পেতো না, exception সরাসরি thrown হতো।

Fix: (১) `CHUNK_SIZE_DAYS` কমানো ৩০ থেকে ১৫ (নিরাপদ token margin),
(২) `maxTokens` বাড়ানো ৩০০০ থেকে ৬০০০, (৩) `extractJsonArrayItems()`
ফাংশন redesign করে `[` থেকে content নিয়ে (closing bracket থাকুক বা না
থাকুক) শেষ সম্পূর্ণ object পর্যন্ত কেটে repair করার ক্ষমতা যোগ করা।

**বাগ #২ — Response এর মাঝখানে corrupted token (৯০-দিনের প্ল্যান টেস্ট
করার সময়, আরও সূক্ষ্ম ও ভিন্ন root cause)**: এবার response সম্পূর্ণ
ছিল (truncated না, dev log এ শেষে `]` সহ পুরো array দেখা গেছে), কিন্তু
JSON-এর **মাঝখানে** একটা stray বাংলা character (`আ`) একটা নতুন লাইনে
ঢুকে গিয়েছিল, ঠিক `"topicName": "রাসায়নিক বন্ধন",` এর পরে এবং
`"taskDescription": ...` এর আগে — cerebras provider এর একটা generation
glitch/hallucination (হয়তো internal token generation এ extra token
লিক)। যেহেতু এই stray টোকেন এর কারণে পুরো array-ভিত্তিক JSON.parse
পুরোপুরি ব্যর্থ হয় (single malformed token পুরো parse নষ্ট করে দেয়),
আর error position স্ট্রিং এর **মাঝখানে** (শেষে না) হওয়ায় বাগ #১ এর
"শেষ পর্যন্ত কেটে repair" কৌশলও কাজ করে না।

Fix: `lib/study-plan-generator.ts` এ নতুন
`extractObjectsByBracketMatching(content)` ফাংশন — string-aware
bracket-depth counting দিয়ে (`"` escape handling সহ) প্রতিটা `{...}`
object আলাদাভাবে বের করে, প্রতিটা আলাদাভাবে `JSON.parse()` করার চেষ্টা
করে — কোনো object malformed হলে সেটা **skip** করে পরেরটায় যায় (পুরো
batch নষ্ট না করে), অসম্পূর্ণ (truncated) object পাওয়া গেলে সেখানে
থেমে যায়। `extractJsonArrayItems()` এখন ধাপে ধাপে চেষ্টা করে: (১)
সম্পূর্ণ array parse (fast path), (২) ব্যর্থ হলে object-by-object
bracket-matching দিয়ে partial recovery, (৩) দুটোই ০টা item দিলে error।

Python এ প্রথমে ডিজাইন-ভেরিফাই করা হয়েছিল (আসল করাপ্টেড raw response
স্যাম্পল দিয়ে, ৪৪টা object উদ্ধার করেছিল ৩৬৬ লাইনের response থেকে),
তারপর `scripts/verify-json-extraction.ts` এ actual code file থেকে
import করে Node.js এ দ্বিতীয়বার verify করা হয়েছে (established two-step
pattern) — নতুন কেস যোগ করে (আসল bug #২ এর raw response প্যাটার্নের
প্রতিরূপ) মোট ৫টা কেস, সব PASS।

### লাইভ multi-user টেস্ট (নতুন ইউজার রেজিস্ট্রেশন+লগইন, real dev server)
- ৯০-দিনের প্ল্যান: `generate` -> ২০০, `generationStatus: GENERATING`,
  প্রথম chunk `daysGenerated: 15`; ব্যাকগ্রাউন্ড পোলিং (৮ সেকেন্ড
  ইন্টারভাল) করে ১৪ পোল পরে `generationStatus: READY`,
  `daysGenerated: 90` — chunk 1 এ একটা corrupted object skip হয়েও
  পুরো chunk exception এ পড়েনি (fix কাজ করছে প্রমাণিত)। DB তে সরাসরি
  ১৮০টা item verify করা হয়েছে।
- ৩৬৫-দিনের প্ল্যান: একই প্যাটার্নে regenerate করে ~২৫টা chunk এর
  ব্যাকগ্রাউন্ড generation সম্পূর্ণ শেষ পর্যন্ত `READY` status এ
  পৌঁছানো ভেরিফাই করা হয়েছে (`generationError: null`), মাঝে একাধিক
  chunk এ (২, ৪, ৯, ১৮, ২২ নম্বর chunk) corrupted object skip হয়েছে
  কিন্তু কোনোবারই পুরো chunk/plan generation `FAILED` হয়নি।
- ১-দিনের প্ল্যান: `generate` -> `generationStatus: READY` সরাসরি
  (chunk লাগে না), `GET /api/study-plan/today` তে সেই আইটেম ঠিকভাবে
  দেখানো ভেরিফাই।
- Rollover: একটা item DB তে ম্যানুয়ালি ৩ দিন পিছিয়ে দিয়ে
  `overdueCount: 1` দেখানো এবং প্রকৃত `PATCH /api/study-plan/items/[id]`
  endpoint দিয়ে complete করার পরে `overdueCount: 0` হওয়া ভেরিফাই।
- Authorization/edge-case: unauthenticated `generate`/`today` -> ৪০১;
  `durationDays` রেঞ্জের বাইরে (০, -৫, ৫০০০) বা non-number ('abc') ->
  ৪০০, সব ভেরিফাই।

### tsc/build/lint checkpoint
`pnpm exec tsc --noEmit` ✅ পাস, `pnpm build` ✅ "Compiled successfully
in 28.7s" পাস, `echo "" | pnpm lint` ✅ ক্লিন পাস — bug #২ ফিক্সের পরে
সব আবার re-run করে পাস কনফার্ম করা হয়েছে।

### DB cleanup
সেশনে তৈরি হওয়া সব `todayfocus_*` প্যাটার্নের টেস্ট ইউজার (smoke,
gen1, rollover, 365, 365b, 365c, bug2fix, 365regress, quickcheck) আসল
`/api/user/delete-account` endpoint দিয়ে ডিলিট করে cascade delete
ভেরিফাই করা হয়েছে (০টা orphan `study_plans`/`study_plan_items` row)।

### পরিবর্তিত/নতুন ফাইল
- `prisma/schema.prisma` — `StudyPlan` মডেলে নতুন ফিল্ড +
  `StudyPlanGenerationStatus` enum
- `prisma/migrations/20260718020000_add_flexible_study_plan_duration/`
- `lib/study-plan-generator.ts` — সম্পূর্ণ rewrite (chunked generation +
  দুই ধাপের JSON parsing robustness ফিক্স)
- নতুন: `lib/today-focus.ts`, `lib/study-plan-ui-constants.ts`
- `lib/study-plan-agent.ts` — renewal notification dynamic durationDays
- `app/api/study-plan/generate/route.ts` — rewrite, `durationDays` param
- নতুন: `app/api/study-plan/today/route.ts`
- নতুন: `components/dashboard/today-focus-card.tsx`
- `components/planner/study-plan-card.tsx` — সম্পূর্ণ rewrite (duration
  selector dialog + generation progress badge)
- `app/(dashboard)/dashboard/page.tsx` — `TodayFocusCard` mount
- নতুন: `scripts/verify-json-extraction.ts`,
  `scripts/test-studyplan-bugfix2-json-corruption.py`

কোনো নতুন dependency লাগেনি। Rate limiting/Parent-Teacher ফিচার
সম্পর্কিত কোনো কোড এখানে নেই (platform নীতি অনুসরণ করা হয়েছে)।

## 🧠 Exam-Day Retention Forecast ("পরীক্ষার দিনে কত % মনে থাকবে?") ✅ সম্পন্ন

### সমস্যা / উদ্দেশ্য
"আজকের পড়া" ফিচার শেষ হওয়ার পরে ব্যবহারকারী পরবর্তী কাজের সিদ্ধান্ত
নিজে দিতে বললেন ("Next" নির্দেশ) — কনটেন্ট (MCQ/CQ) কাজ এখনো স্থগিত
থাকায় (ব্যবহারকারীর নির্দেশ, একসাথে সব সাবজেক্ট/অধ্যায়/পৃষ্ঠা কভার করে
পরে বড় আকারে করা হবে) নতুন সিস্টেম ফিচার খোঁজা হয়েছে। প্রথমে `docs/
FEATURE_RESEARCH.md`/`V2`/`V3` রিভিউ করে দেখা গেছে সেখানে চিহ্নিত প্রায়
সবকিছুই ইতিমধ্যে বাস্তবায়িত (FSRS, Board Question Filter, Mind Map,
Negative Marking, KaTeX, Option Shuffle, Breathing Exercise, Misconception
Tagging, Confidence-Based Answering, Peer Comparison, Item-Difficulty
Calibration, Notification Digest, AI Content Moderation, Quiz Battle
SSE) — তাই ব্যবহারকারীর সাথে আলোচনা করে সিদ্ধান্ত হয় সম্পূর্ণ নতুন
(fresh) deep research করা হবে, পুরনো research doc এর leftover আইটেম
implement করার বদলে।

### গবেষণা (`docs/FEATURE_RESEARCH_V4.md`)
২০২৬ সালের গ্লোবাল এডটেক ট্রেন্ড (web_search দিয়ে, একাধিক সোর্স) ও
বাংলাদেশ HSC মার্কেট (জনপ্রিয় competitor app যেমন HSC Test Paper, HSC
All Guide, bigganclass.com "টাইপ-ভিত্তিক কমন সাজেশন") নিয়ে গবেষণা করা
হয়েছে। মূল আবিষ্কার: একটা নতুন premium flashcard app **Retain.cards**
এর স্ট্যান্ডআউট ফিচার হিসেবে চিহ্নিত হয়েছে *"view your predicted
knowledge level on the day of the exam"* — এটা spaced-repetition এর
stability/retrievability ডেটা ব্যবহার করে ভবিষ্যতে (exam date এ) কতটা
মনে থাকবে তার forecast দেখায়। এটা সম্পূর্ণ নতুন, V1/V2/V3 এ কোথাও
চিহ্নিত হয়নি, এবং সবচেয়ে গুরুত্বপূর্ণ — **schema-free/migration-free**
বানানো সম্ভব (বিদ্যমান FSRS Algorithm Upgrade ফিচারের ডেটা পুনর্ব্যবহার
করে)।

দ্বিতীয় candidate ছিল "Board Question Type/Pattern Tagging" (bigganclass.com
এর মতো জনপ্রিয় সাইটের সেলিং পয়েন্ট) কিন্তু এটা কনটেন্ট-ভারী (যথেষ্ট
বোর্ড প্রশ্ন ডেটা দরকার "pattern frequency" বলার জন্য) — content কাজ
স্থগিত থাকায় এই মুহূর্তে বাদ দেওয়া হয়েছে।

### ফিচার ডিজাইন
FSRS (Free Spaced Repetition Scheduler) ইতিমধ্যে প্রতিটা flashcard এ
`stability`/`difficulty` রাখে (কত দিনে retrievability ৯০%→ কমবে তার
measure)। `ts-fsrs` লাইব্রেরির অফিসিয়াল `get_retrievability(card,
futureDate)` মেথড ব্যবহার করে (নতুন কাস্টম forgetting-curve ফর্মুলা
re-implement না করে, established library reuse করে — established
pattern অনুসরণ করে, `lib/fsrs.ts` এর review-flow এর মতোই কিন্তু
সম্পূর্ণ read-only/side-effect-free) যেকোনো ভবিষ্যৎ তারিখে প্রতিটা
কার্ডের predicted retrievability % হিসাব করা সম্ভব — pure math, কোনো
AI call/migration লাগে না।

**দুই স্তরে ফোরকাস্ট (প্রাথমিক ডিজাইনে ভাবা হয়েছিল, শেষে flashcard-level
এই focus করা হয়েছে — নিচে "স্কোপ সংকোচন" দেখুন)**।

### `lib/retention-forecast.ts` (নতুন)
- `getRetentionForecast(userId)` — মূল ফাংশন:
  - ইউজারের সব FSRS flashcard (`srsAlgorithm: "FSRS"`) লোড করে, শুধু
    অন্তত একবার review হওয়া (stability/lastReviewed সেট আছে) কার্ড
    ফিল্টার করে
  - কোনো reviewed card না থাকলে `hasData: false` রিটার্ন করে (empty
    state)
  - `buildSampleDates(start, end, maxPoints=24)` — আজ থেকে exam date
    পর্যন্ত সমান দূরত্বে সর্বোচ্চ ২৪টা sample point বানায় (দীর্ঘ
    countdown যেমন HSC 2028 ব্যাচের ৭০০+ দিনেও chart এ পয়েন্ট সংখ্যা
    সীমিত থেকে smooth থাকে) — Python এ design-verify করা লজিক (edge
    case: exam past হলে ১টা পয়েন্ট, খুব কাছের exam এ কম পয়েন্ট)
  - প্রতিটা sample date এ সব reviewed card এর retrievability গড় করে
    timeline বানায়
  - overall current (আজ) ও exam-day retention % হিসাব করে
  - `FlashcardDeck.subjectCode` অনুযায়ী গ্রুপ করে সাবজেক্ট-ভিত্তিক
    ব্রেকডাউন (দুর্বল বিষয় আগে সাজানো, `examDayRetentionPct` অনুযায়ী
    ascending sort)
  - exam past হলে (`isPastExam: true`) timeline এ ১টা মাত্র পয়েন্ট,
    current ও exam-day retention একই দেখায় (আর কোনো ভবিষ্যৎ প্রক্ষেপণ
    অর্থহীন হওয়ায়)

### API ও UI
- `app/api/analytics/retention-forecast/route.ts` (নতুন GET) —
  authentication চেক করে `getRetentionForecast()` কল করে
- `components/analytics/retention-forecast-card.tsx` (নতুন) — Analytics
  Dashboard এ Predicted GPA কার্ডের ঠিক পরে বসানো হয়েছে (GPA/retention
  দুটোই "ভবিষ্যৎ প্রক্ষেপণ" ধরনের ইনসাইট, একসাথে থাকা যুক্তিসঙ্গত)।
  Recharts `AreaChart` দিয়ে gradient fill সহ retention timeline, দুটো
  বড় সংখ্যা কার্ড (এখনকার/পরীক্ষার দিনের retention %, রঙ-কোডেড:
  ≥৮০% সবুজ, ৬০-৮০% amber, <৬০% লাল), সাবজেক্ট-ভিত্তিক badge লিস্ট।
  কোনো review না থাকলে friendly empty-state (ফ্ল্যাশকার্ড পেজের লিংক সহ)।
- `components/analytics/analytics-dashboard.tsx` এ import+mount।

### স্কোপ সংকোচন (ডিজাইনের সময় নেওয়া সিদ্ধান্ত)
প্রাথমিক গবেষণায় TopicProgress এর accuracy থেকে topic-level (flashcard
ছাড়া অংশ) approximate forecast করার কথাও ভাবা হয়েছিল, কিন্তু implement
করার সময় সিদ্ধান্ত নেওয়া হয় শুধু **flashcard-level (FSRS ডেটা থেকে)
নির্ভুল** ফোরকাস্টেই ফোকাস করা হবে — কারণ TopicProgress এ কোনো
সময়-ভিত্তিক decay মডেল নেই (accuracy% স্ট্যাটিক, "কবে শেষ পড়েছে" সেই
তথ্য cleanly ব্যবহার করার মতো ডেটা স্ট্রাকচার নেই), তাই একটা approximate
"exponential decay" বানালে সেটা misleading হতে পারতো (fake precision)।
FSRS-ভিত্তিক forecast pure math এবং প্রকৃতপক্ষে accurate (established
spaced-repetition science এর উপর ভিত্তি করে) — তাই শুধু এটাই রাখা
হয়েছে, স্বচ্ছভাবে "এটা flashcard review ডেটা থেকে" বলা হয়েছে UI তে।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` — প্রথমে Recharts `Tooltip` এর
  `labelFormatter` prop এ TypeScript টাইপ মিসম্যাচ এরর এসেছিল
  (`(label: number) => string` বনাম প্রত্যাশিত `ReactNode` টাইপ) —
  explicit টাইপ অ্যানোটেশন সরিয়ে Recharts এর inferred টাইপ ব্যবহার
  করে ফিক্স করা হয়েছে। এরপর ✅ ক্লিন পাস।
- `pnpm build` ✅ "Compiled successfully in 25.3s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-retention-forecast.py`, ২৬টা assertion, সব PASS)
১. নতুন ইউজার রেজিস্ট্রেশন+লগইন, কোনো review ছাড়া GET করে
   `hasData: false` (empty state) ভেরিফাই
২. Flashcard deck (PHYSICS) + ৪টা কার্ড তৈরি
৩. বাস্তব `/api/flashcards/[cardId]/review` endpoint দিয়ে মিশ্র রেটিং
   (good/easy/good/again) দিয়ে রিভিউ করে FSRS state তৈরি
৪. exam date ৩০ দিন পরে সেট (`/api/user/exam-date`)
৫. Retention forecast: `hasData: true`, `totalReviewedCards: 4`,
   `daysUntilExam ~30`
৬. **currentRetentionPct = 100%** (এইমাত্র review করা কার্ড, প্রত্যাশিত),
   **examDayRetentionPct = 64.8%** (৩০ দিন পরে review না করলে স্বাভাবিক
   decay, প্রত্যাশিতভাবে কম) — এই সংখ্যা দুটো FSRS forgetting-curve এর
   সাথে সামঞ্জস্যপূর্ণ (stability অনুযায়ী যুক্তিসঙ্গত)
৭. Timeline: প্রথম পয়েন্ট `daysFromNow: 0`, শেষ পয়েন্ট `~30`, মোট ২৪টা
   পয়েন্ট
৮. Subject breakdown: PHYSICS ১টা এন্ট্রি, `cardCount: 4` সঠিক
৯. Authorization: unauthenticated → ৪০১
১০. আলাদা টেস্টে **past-exam edge case** ভেরিফাই: exam date ৫ দিন আগে
    সেট করলে `isPastExam: true`, `daysUntilExam: 0`, timeline এ ১টা
    পয়েন্ট, current==examDay retention (উভয়ই ১০০%)
১১. Test cleanup: `retentionforecast_*`, `retentionpast_*` প্যাটার্নের
    সব টেস্ট ইউজার আসল `/api/user/delete-account` endpoint দিয়ে ডিলিট,
    cascade delete ভেরিফাই (০টা orphan `flashcard_decks` row)
১২. Client bundle verification: CSR component হওয়ায় (useEffect+fetch
    প্যাটার্ন, established false-negative সতর্কতা অনুযায়ী) সার্ভার-
    রেন্ডার HTML এ দেখা যায় না — compiled JS chunk এ `retention-forecast`
    স্ট্রিং সরাসরি `grep` করে কম্পোনেন্ট সঠিকভাবে bundle হয়েছে ভেরিফাই
    করা হয়েছে (`.next/dev/static/chunks/components_*.js`)

### পরিবর্তিত/নতুন ফাইল
- নতুন: `lib/retention-forecast.ts`
- নতুন: `app/api/analytics/retention-forecast/route.ts`
- নতুন: `components/analytics/retention-forecast-card.tsx`
- পরিবর্তিত: `components/analytics/analytics-dashboard.tsx` — import+mount
- নতুন: `docs/FEATURE_RESEARCH_V4.md` (গবেষণা ডকুমেন্ট)
- নতুন: `scripts/test-retention-forecast.py`

কোনো migration লাগেনি (schema-free, বিদ্যমান FSRS+examDate ডেটা
পুনর্ব্যবহার), কোনো নতুন dependency লাগেনি (বিদ্যমান `ts-fsrs`
পুনর্ব্যবহার), কোনো নতুন AI cost লাগেনি (pure deterministic math)।

## 🐛 গুরুতর বাগ ফিক্স — Forum Best Answer XP Farming ✅ সম্পন্ন

### আবিষ্কারের প্রেক্ষাপট
Exam-Day Retention Forecast ফিচার শেষ হওয়ার পরে ব্যবহারকারী "Next"
বলার সাথে সাথে "লাইভ ইউজার দিয়ে টেস্ট করার" গুরুত্ব পুনরায় জোর দিয়ে
বলেন। তাই এই রাউন্ডে নতুন ফিচার না বানিয়ে, established "XP-Double-Award
প্যাটার্ন" (আগে Topic Progress ও Study Group Weekly Bonus এ পাওয়া গেছে)
পুনরায় অন্য জায়গায় আছে কিনা তার জন্য পুরো কোডবেস জুড়ে `awardXp()` কল
হওয়া সব endpoint অডিট করা হয়েছে। `PATCH /api/forum/replies/[replyId]/
best-answer` এ সন্দেহজনক প্যাটার্ন পাওয়া যায় — এটাই একমাত্র endpoint
যেটা একটা "toggle-able" ফ্ল্যাগ (`isBestAnswer`) এর state change এ XP
দেয়, কিন্তু কোনো idempotency guard ছাড়া।

### বাগ (দুই ধাপে আবিষ্কৃত ও ফিক্স করা, Study Group Weekly Bonus বাগের
মতোই দুই-ধাপের ঘটনা)

**ধাপ ১ — কোনো guard ছিল না**: মূল কোডে `awardXp(reply.userId, 10)`
সরাসরি, unconditionally কল হতো। প্রথম লাইভ টেস্টে (Owner+২ Replier দিয়ে)
প্রমাণিত হয় যে একই reply-কে ৪ বার best-answer মার্ক করিয়ে ৪৫ XP পাওয়া
গেছে (প্রত্যাশিত ছিল ১৫: ৫ reply-XP + ১০ প্রথমবার best-answer-XP)।

**প্রাথমিক ফিক্স (অপর্যাপ্ত)**: প্রথমে ভাবা হয়েছিল `if (reply.isBestAnswer)
return early` চেক যথেষ্ট হবে। কিন্তু re-run করা লাইভ টেস্টে (একই ২৪টা
assertion স্ক্রিপ্ট) দেখা যায় বাগ **তখনও বহাল** — কারণ:
- Reply A কে mark করা হয় (isBestAnswer: false→true, +10 XP)
- Reply B কে mark করা হয় (A এর isBestAnswer legitimately false হয়ে
  যায় — এটা normal, সঠিক UX আচরণ)
- আবার Reply A কে mark করার সময় সেই মুহূর্তে `reply.isBestAnswer` সত্যিই
  `false` থাকে (কারণ ধাপ ২ এ সেটা legitimately সরে গেছে) — তাই এই চেক
  সেটাকে "সম্পূর্ণ নতুন selection" ধরে নেয় এবং **আবার** XP দিয়ে দেয়

এই "toggle-cycling" প্যাটার্নটা Task/StudyPlanItem এর
TODO↔DONE↔TODO↔DONE বাগের কাঠামোগতভাবে একই রকম, কিন্তু এখানে সরাসরি
`isBestAnswer` বুলিয়ান ফ্ল্যাগের বদলে "কোন reply বর্তমানে best-answer"
এই mutual-exclusion state এর মধ্য দিয়ে ঘটে — তাই প্রথম নজরে এটা ধরা
পড়েনি, দ্বিতীয়বার লাইভ টেস্ট চালিয়ে (established checkpoint pattern
অনুযায়ী প্রতিটা ফিক্সের পরে পুনরায় regression test) ধরা পড়ে।

### চূড়ান্ত ফিক্স — স্থায়ী স্বাধীন ফ্ল্যাগ

`isBestAnswer` (UX-এর জন্য legitimately toggle হওয়া উচিত) থেকে
সম্পূর্ণ আলাদা একটা **স্থায়ী, কখনো reset না হওয়া** ফ্ল্যাগ
`bestAnswerXpAwarded` যোগ করা হয়েছে — Task/StudyPlanItem/TopicProgress
এ ব্যবহৃত একই established প্যাটার্ন। schema:

```prisma
model ForumReply {
  // ... বিদ্যমান ফিল্ড ...
  isBestAnswer        Boolean @default(false)
  bestAnswerXpAwarded Boolean @default(false) // নতুন — isBestAnswer টগলিং থেকে স্বাধীন
}
```

Migration: `20260719000000_add_forum_best_answer_xp_awarded` — pgvector
HNSW `DROP INDEX` bogus-লাইন বাগ (established Prisma issue #28414) এই
migration এও এসেছিল, established fix pattern দিয়ে বাদ দেওয়া হয়েছে।
Backfill: বিদ্যমান `isBestAnswer=true` রিপ্লাইগুলোকে
`bestAnswerXpAwarded=true` করে দেওয়া হয়েছে (defensive, migration সময়ে
DB তে ০টা এমন রেকর্ড ছিল)।

### Race Condition প্রতিরোধ

প্রথমে ভাবা হয়েছিল `if (currentState) return; else update+award` এই
read-then-write প্যাটার্নে যাবো, কিন্তু Study Group Weekly Bonus Race
Condition বাগ থেকে শেখা শিক্ষা মনে রেখে (TOCTOU race condition ঝুঁকি)
তার বদলে single atomic statement ব্যবহার করা হয়েছে:

```ts
const xpAwardResult = await prisma.forumReply.updateMany({
  where: { id: replyId, bestAnswerXpAwarded: false },
  data: { bestAnswerXpAwarded: true },
});
const shouldAwardXp = xpAwardResult.count > 0;
```

`WHERE id=? AND bestAnswerXpAwarded=false` সহ `UPDATE` স্টেটমেন্ট
Postgres এ row-level lock নিয়ে atomic ভাবে execute হয় — দুটো concurrent
request একই reply-তে একসাথে এলেও একটা matched হবে (count=1, XP দেবে),
আরেকটার WHERE condition আর ম্যাচ করবে না (count=0, XP দেবে না)। `isBestAnswer`
ফ্ল্যাগ টগল করা এখনো প্রতিবার (normal reselection এ) হয় — এটা শুধু "বর্তমান
সেরা উত্তর কোনটা" দেখানোর UX স্টেট, XP লজিকের সাথে যুক্ত না।

Notification মেসেজও সংশোধন করা হয়েছে: `shouldAwardXp=false` (re-selection)
হলে "+10 XP বোনাস পেয়েছো" উল্লেখ না করে শুধু কৃতজ্ঞতা জানানো হয়
(misleading তথ্য এড়াতে)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 26.4s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-forum-best-answer-xp-farming.py`, ২৮টা assertion, সব PASS)
৩ জন real ইউজার (Post Owner + দুইজন Replier) দিয়ে:
১. Reply তৈরিতে +5 XP (স্বাভাবিক, unlimited action)
২. প্রথমবার Reply1 কে best-answer মার্কে +10 XP (প্রত্যাশিত)
৩. Reply2 কে best-answer মার্ক করলে Reply1 এর `isBestAnswer` legitimately
   false হয় কিন্তু `bestAnswerXpAwarded` অক্ষত থাকে (true-ই থাকে)
৪. আবার Reply1 কে best-answer মার্ক করলে `isBestAnswer` ঠিকভাবে আবার
   true হয় (UX সঠিক) কিন্তু XP **আর বাড়ে না** (মূল ফিক্স ভেরিফিকেশন)
৫. আরও ২ বার toggle করেও (মোট ৪ বার mark) চূড়ান্ত XP ঠিক ১৫-ই থাকে
   (বাগ থাকলে ৪৫ হতো)
৬. Reply2 এর owner-ও cross-check এ সঠিক XP পেয়েছে (৫+১০=১৫, বারবার
   toggle হওয়া সত্ত্বেও একবারই)
৭. Authorization: non-owner → ৪০৩, unauthenticated → ৪০১, non-existent
   reply → ৪০৪

**আলাদা concurrency টেস্ট** (Python `threading` দিয়ে, ১০টা simultaneous
PATCH request একই reply-তে) — সবগুলো ২০০ status রিটার্ন করেছে, কিন্তু
XP ঠিক **+১০ (একবারই)** বেড়েছে, race condition থেকে সম্পূর্ণ সুরক্ষিত
প্রমাণিত।

### Test cleanup
`bestanswer_*` ও `racebestans_*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করে cascade delete
ভেরিফাই করা হয়েছে (০টা orphan)।

### পরিবর্তিত/নতুন ফাইল
- `prisma/schema.prisma` — `ForumReply` মডেলে `bestAnswerXpAwarded` ফিল্ড
- `prisma/migrations/20260719000000_add_forum_best_answer_xp_awarded/`
- `app/api/forum/replies/[replyId]/best-answer/route.ts` — atomic
  conditional update দিয়ে rewrite
- নতুন: `scripts/test-forum-best-answer-xp-farming.py`

কোনো নতুন dependency লাগেনি। এই বাগ ফিক্সের সময় UI (`components/forum/
post-detail.tsx`) তে কোনো পরিবর্তন লাগেনি — বিদ্যমান `!reply.isBestAnswer`
বাটন-hide লজিক এখনো ঠিক আছে (এটা শুধু UX convenience ছিল, নিরাপত্তার
মূল স্তর সবসময় backend এ থাকা উচিত, যা এখন প্রতিষ্ঠিত হলো)।

## 🐛 গুরুতর বাগ ফিক্স — Task/StudyPlanItem/TopicProgress XP Race Condition অডিট ✅ সম্পন্ন

### প্রেক্ষাপট
Forum Best Answer XP Farming বাগ ফিক্স করার সময় দেখা গেছে চূড়ান্ত সমাধান
(atomic `UPDATE...WHERE bestAnswerXpAwarded=false`) দরকার হয়েছিল কারণ
নাইভ read-then-write প্যাটার্ন (`if (reply.isBestAnswer) return;`)
race condition এর ঝুঁকিতে ছিল। ব্যবহারকারী "লাইভ ইউজার দিয়ে টেস্ট করা"
এর গুরুত্ব পুনরায় বলার পরে, একই কাঠামোগত সমস্যা অন্য কোথাও আছে কিনা
তা যাচাই করতে পুরো কোডবেসে `awardXp()` কল হওয়া সব endpoint (১৮টা+
জায়গা) অডিট করা হয়েছে।

### অডিটের ফলাফল
তিনটা endpoint — `Task` (PATCH), `StudyPlanItem` (PATCH), `TopicProgress`
(POST) — এই একই প্যাটার্নে ছিল: এগুলো সবই `xpAwarded` বুলিয়ান ফ্ল্যাগ
ব্যবহার করে (আগের সেশনে toggle-cycling — TODO↔DONE↔TODO↔DONE — ফিক্স
করার জন্য যোগ করা হয়েছিল), কিন্তু implementation ছিল read-then-write:
`findUnique()`/`upsert()` দিয়ে বর্তমান state read করে
`existing.xpAwarded` চেক করা হতো, তারপর সেই বুলিয়ান ভ্যালুর ভিত্তিতে
আলাদা `update()` কল করা হতো। এটা ঠিক Forum Best Answer বাগের একই
কাঠামোগত দুর্বলতা — দুইটা concurrent request একই মুহূর্তে stale
`xpAwarded=false` state পড়ে ফেললে দুটোই award করে ফেলে।

### লাইভ concurrency টেস্টে বাগ প্রমাণিত (`scripts/test-xp-race-condition-audit.py`)
Python `threading` দিয়ে একই ইউজারের সেশন ব্যবহার করে একই resource এ
৫টা (প্রাথমিকভাবে ১০টা চেষ্টা করা হয়েছিল কিন্তু dev sandbox এর Prisma
connection pool limit — মাত্র ৩টা connection — এ timeout হচ্ছিল, তাই
বাস্তবসম্মত concurrency সংখ্যা ৫ এ নামানো হয়েছে) concurrent
PATCH/POST request পাঠিয়ে দেখা যায়:
- **Task**: ৫টা concurrent DONE মার্কে ২৫ XP (প্রত্যাশিত ৫) — ৫x over-award
- **StudyPlanItem**: ৫টা concurrent complete মার্কে ২৫ XP (প্রত্যাশিত ৫) — ৫x over-award
- **TopicProgress**: ৫টা concurrent MASTERED মার্কে ১০০ XP (প্রত্যাশিত ২০) — ৫x over-award

সব ৫টা request `200` status রিটার্ন করেছে (কোনো error visible ছিল না,
শুধু সাইলেন্টলি ডাবল/মাল্টিপল-award হচ্ছিল) — এটা বিশেষভাবে বিপজ্জনক
কারণ প্রোডাকশনে ইউজার mobile এ ডাবল-ট্যাপ করলে বা একাধিক ট্যাব/ডিভাইস
থেকে একসাথে একই কাজ করলে (যেমন slow network এ retry) সহজেই ট্রিগার
হতে পারতো।

### ফিক্স (তিনটাতেই একই প্যাটার্নে, Forum Best Answer এর approach অনুসরণ করে)
State আপডেট (status/isCompleted/completedPct পরিবর্তন — যেটা যতবার
খুশি toggle করা যায়, এটা শুধু "বর্তমান অবস্থা" ট্র্যাক করে) ও XP claim
কে সম্পূর্ণ আলাদা করা হয়েছে। XP claim এখন single atomic
`UPDATE ... WHERE id=? AND xpAwarded=false` (TopicProgress এর ক্ষেত্রে
`WHERE userId=? AND topicId=? AND xpAwarded=false`, কারণ composite
unique key) স্টেটমেন্ট দিয়ে করা হয় — Postgres এই ধরনের conditional
UPDATE কে row-level lock নিয়ে atomic ভাবে execute করে, তাই দুটো
concurrent request একই resource এ একসাথে এলেও একটা matched হবে
(count=1, XP দেবে), আরেকটার WHERE condition আর ম্যাচ করবে না (count=0,
XP দেবে না)।

```ts
// উদাহরণ (Task এর জন্য, StudyPlanItem/TopicProgress এ একই প্যাটার্ন)
let shouldAwardXp = false;
if (willBeCompleted) {
  const xpClaimResult = await prisma.task.updateMany({
    where: { id: taskId, xpAwarded: false },
    data: { xpAwarded: true },
  });
  shouldAwardXp = xpClaimResult.count > 0;
}
// এরপর আলাদাভাবে বাকি state (title/description/status ইত্যাদি) update করা হয়
```

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 30.1s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-xp-race-condition-audit.py`, ৯টা assertion, সব PASS)
একই ইউজার দিয়ে ৩টা resource এ (Task, TopicProgress এ বাস্তব DB এর
Physics টপিক, StudyPlanItem সরাসরি DB insert করে) প্রতিটাতে ৫টা
concurrent request পাঠিয়ে verify:
- Task: ৫টা concurrent DONE মার্কে ঠিক +5 XP (ফিক্সের পরে)
- TopicProgress: ৫টা concurrent MASTERED মার্কে ঠিক +20 XP
- StudyPlanItem: ৫টা concurrent complete মার্কে ঠিক +5 XP

**আলাদা toggle-cycling regression টেস্ট** (সিরিয়ালি, concurrency ছাড়া)
— Task ও TopicProgress এ ৫ বার (TODO↔DONE বা LEARNING↔MASTERED) toggle
করেও XP ঠিক একবারই (৫ এবং ২০ যথাক্রমে) পাওয়া গেছে, প্রমাণ করে যে নতুন
ফিক্স আগের toggle-cycling ফিক্সের normal (non-concurrent) আচরণ ভাঙেনি।

**আলাদা authorization/edge-case টেস্ট** — অন্য ইউজারের Task এ PATCH
করার চেষ্টায় ৪০৪ (ownership leak না করে, established pattern), 
unauthenticated এ ৪০১, non-existent resource এ ৪০৪, invalid
TopicProgress status এ ৪০০ — সব যথাযথ।

### Test cleanup
`xpraceaudit_*`, `toggleregress_*`, `edgeaudit_*` প্যাটার্নের সব টেস্ট
ইউজার প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট করে
cascade delete ভেরিফাই করা হয়েছে।

### পরিবর্তিত ফাইল
- `app/api/tasks/[taskId]/route.ts` — XP claim atomic updateMany এ rewrite
- `app/api/study-plan/items/[itemId]/route.ts` — একই প্যাটার্নে rewrite
- `app/api/topics/[topicId]/progress/route.ts` — state upsert ও XP claim আলাদা করা
- নতুন: `scripts/test-xp-race-condition-audit.py`

কোনো নতুন migration লাগেনি (বিদ্যমান `xpAwarded` কলাম পুনর্ব্যবহার),
কোনো নতুন dependency লাগেনি।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- `checkAndAwardBadges()` এ concurrent call এ `userBadge.create()` এ
  মাঝে মাঝে "Unique constraint failed" error লগ হতে দেখা গেছে
  concurrency টেস্টের সময় — এটা bug না, বরং ইচ্ছাকৃত try/catch দিয়ে
  ইতিমধ্যে race-condition-safe করা আছে (DB এর unique constraint নিজেই
  duplicate badge award আটকায়, catch ব্লকে silently ignore করা হয়)।
  শুধু dev log এ noise তৈরি করে, কোনো ডেটা করাপশন হয় না।
- বাকি `awardXp()` callers (adaptive-practice, cq submit, drill submit,
  practice submit, mock-exam submit-cq, study-sessions, flashcard
  review, forum post/reply create, quiz-battle/duel, live-exam,
  reading-room) সবগুলো **unlimited action** (একাধিকবার করা বৈধ, যেমন
  একাধিক flashcard review বা quiz attempt) ভিত্তিতে XP দেয়, কোনো
  "toggle-able single-completion flag" ভিত্তিক না — তাই এই ক্লাসের
  race condition এর ঝুঁকিতে নেই, আলাদা অডিট প্রয়োজন হয়নি।

## 🐛 গুরুতর বাগ ফিক্স — Quiz Battle/Quiz Duel/Reading Room XP Race Condition অডিট ✅ সম্পন্ন

### প্রেক্ষাপট
Task/StudyPlanItem/TopicProgress XP Race Condition ফিক্স করার পরে
ব্যবহারকারী "Next" বলার সাথে সাথে অডিট আরও প্রসারিত করা হয় — বাকি
`awardXp()` callers এর মধ্যে আরও কোথায় "প্রথমবার একটা অ্যাকশন করা
হচ্ছে কিনা" চেক করে XP দেওয়া হয় তা খুঁজে বের করে। Quiz Battle, Quiz
Duel, ও Reading Room তিনটাতেই এই প্যাটার্ন পাওয়া গেছে (একজন অংশগ্রহণকারী
"প্রথমবার" উত্তর জমা দিচ্ছে, একজন owner "প্রথমবার" battle শেষ করছে,
একজন ইউজার "প্রথমবার" reading session শেষ করছে) — এবং প্রতিটাই
read-then-write প্যাটার্নে ছিল।

### আবিষ্কৃত বাগ (লাইভ concurrency টেস্টে নিশ্চিত)
`scripts/test-quiz-battle-duel-xp-race-audit.py` দিয়ে ২ জন real ইউজার
(owner+participant) ব্যবহার করে Quiz Battle তৈরি+join+start করে দেখা যায়:

- **`submitBattleAnswers`**: participant এর ৫টা concurrent submit
  request পাঠিয়ে ৫০ XP পাওয়া গেছে (প্রত্যাশিত ১০) — প্রতিটা request
  stale `participant.submittedAt === null` state দেখে independently
  award করেছে।
- **`endQuizBattle`**: owner এর ৫টা concurrent end request পাঠিয়ে
  বিজয়ী ১৫০ XP পেয়েছে (প্রত্যাশিত ৩০) — প্রতিটা request stale
  `battle.status === "ACTIVE"` state দেখে independently winner
  নির্ধারণ করে XP দিয়েছে।

উভয় ক্ষেত্রেই সব request `200` status রিটার্ন করেছে — কোনো visible
error ছাড়াই সাইলেন্টলি multiple-award হচ্ছিল, ঠিক Task/StudyPlanItem/
TopicProgress বাগের মতোই।

Quiz Duel এর প্রাথমিক টেস্টে সরাসরি bug প্রকাশ পায়নি (test সিনারিওতে
race window miss হয়ে থাকতে পারে), কিন্তু কোড রিভিউতে একই কাঠামোগত
দুর্বলতা স্পষ্ট ছিল (`submitDuelAnswers` এ
`if (isChallenger && duel.challengerAnswers) throw` read-then-write,
এবং `finalizeDuel` এ কোনো atomic status-transition guard ছাড়াই) — তাই
প্রতিরোধমূলকভাবে (defense-in-depth) এখানেও একই ফিক্স প্রয়োগ করা
হয়েছে, শুধু bug নিশ্চিত হওয়ার অপেক্ষা না করে। Reading Room এও
`endSessionInternal` এ কোনো `endedAt: null` guard ছাড়াই unconditional
`update()` হচ্ছিল।

### ফিক্স (সবগুলোতে একই atomic-conditional-update প্যাটার্ন)

```ts
// lib/quiz-battle.ts — submitBattleAnswers()
const claimResult = await prisma.quizBattleParticipant.updateMany({
  where: { id: participant.id, submittedAt: null },
  data: { answers, score, timeTakenSec, submittedAt: new Date() },
});
if (claimResult.count === 0) throw new Error("তুমি ইতিমধ্যে উত্তর জমা দিয়েছো");

// lib/quiz-battle.ts — endQuizBattle()
const claimResult = await prisma.quizBattle.updateMany({
  where: { id: battleId, status: "ACTIVE" },
  data: { status: "COMPLETED", completedAt: new Date() },
});
if (claimResult.count === 0) return prisma.quizBattle.findUniqueOrThrow({ where: { id: battleId } });
// ... claim সফল হলেই winner নির্ধারণ + awardXp()

// lib/quiz-duel.ts — submitDuelAnswers() — nullable JSON ফিল্ডের জন্য
// বিশেষ Prisma সিনট্যাক্স লাগে (সরাসরি `field: null` টাইপ-এরর দেয়)
const nullFieldGuard = isChallenger
  ? { challengerAnswers: { equals: Prisma.DbNull } }
  : { opponentAnswers: { equals: Prisma.DbNull } };
const claimResult = await prisma.quizDuel.updateMany({
  where: { id: duelId, ...nullFieldGuard },
  data: updateData,
});

// lib/reading-room.ts — endSessionInternal()
const claimResult = await prisma.readingRoomSession.updateMany({
  where: { id: sessionId, endedAt: null },
  data: { endedAt: new Date() },
});
if (claimResult.count === 0) return { session: ended, xpEarned: 0 }; // idempotent, XP না দিয়ে
```

**Prisma nullable JSON ফিল্ড ফিল্টারিং নিয়ে শেখা**: `QuizDuel.challengerAnswers`/
`opponentAnswers` টাইপ `Json?` — এই ধরনের ফিল্ডে সরাসরি `{ field: null }`
ফিল্টার করলে TypeScript error দেয় (`JsonNullableFilter` টাইপ `null`
সরাসরি accept করে না)। সঠিক সিনট্যাক্স: `{ field: { equals:
Prisma.DbNull } }` — `Prisma` namespace কে `@prisma/client` থেকে
আলাদাভাবে import করতে হয়েছে।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` — প্রথমে `{ field: null }` সিনট্যাক্সে
  TypeScript error এসেছিল (উপরে বর্ণিত), `Prisma.DbNull` cast দিয়ে
  ফিক্স করার পরে ✅ ক্লিন পাস।
- `pnpm build` ✅ "Compiled successfully in 24.9s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-quiz-battle-duel-xp-race-audit.py`, ১৭টা assertion, সব PASS)
২ জন real ইউজার (owner+participant) দিয়ে:
১. Quiz Battle তৈরি+join+start, participant এর ৫টা concurrent submit
   এ ঠিক +১০ XP (৪টা request ৪০০ "ইতিমধ্যে জমা দিয়েছো" এরর পেয়েছে,
   ১টা সফল হয়েছে — ঠিক আচরণ)
২. Owner (winner) এর ৫টা concurrent end এ ঠিক +৩০ XP
৩. Quiz Duel তৈরি+join, concurrent submit + finalize এ ঠিক +২৫ XP
৪. Reading Room এ join করে ৫ মিনিট+ focus সিমুলেট করে (DB তে সরাসরি
   `totalFocusSec` সেট করে) ৫টা concurrent leave call এ single-award
   (৫x না) ভেরিফাই

**Normal (non-concurrent) flow regression টেস্ট** (আলাদা স্ক্রিপ্টে)
— একবার submit/end করার পরে দ্বিতীয়বার চেষ্টা করলে যথাযথ ৪০০ error
("তুমি ইতিমধ্যে উত্তর জমা দিয়েছো"/"এই Battle সক্রিয় অবস্থায় নেই")
পাওয়া গেছে, স্বাভাবিক single-request flow এ XP ঠিক একবারই (১০/৩০/২৫)
পাওয়া গেছে — নিশ্চিত হয়েছে ফিক্স আগের normal ব্যবহারের আচরণ ভাঙেনি।

### Test cleanup
`battleraceaudit_*` ও `battlenormal_*` প্যাটার্নের সব টেস্ট ইউজার
প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট করে cascade
delete ভেরিফাই করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `lib/quiz-battle.ts` — `submitBattleAnswers()` ও `endQuizBattle()`
  atomic conditional update এ rewrite
- `lib/quiz-duel.ts` — `submitDuelAnswers()` ও `finalizeDuel()` একই
  প্যাটার্নে rewrite, `Prisma` import যোগ
- `lib/reading-room.ts` — `endSessionInternal()` atomic guard যোগ
- নতুন: `scripts/test-quiz-battle-duel-xp-race-audit.py`

কোনো নতুন migration লাগেনি (বিদ্যমান কলাম পুনর্ব্যবহার), কোনো নতুন
dependency লাগেনি।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- এই অডিটের সাথে বাকি থাকা `awardXp()` callers (adaptive-practice, cq
  submit, drill submit, practice submit, mock-exam submit-cq,
  study-sessions, flashcard review, forum post/reply create) — এগুলো
  সব **unlimited action** ভিত্তিক (প্রতিটা quiz attempt/flashcard
  review/post একটা নতুন DB row তৈরি করে, কোনো "একবারই" ফ্ল্যাগ চেক করে
  না) — তাই এই ক্লাসের race condition এর ঝুঁকিতে নেই। এখন পর্যন্ত
  পুরো কোডবেসের সব `awardXp()` caller (১৮টা+) সিস্টেমেটিক্যালি অডিট
  সম্পন্ন হয়েছে (Task/StudyPlanItem/TopicProgress + Forum Best Answer
  + Quiz Battle/Duel/Reading Room) — কোনো আর জানা race condition বাকি
  নেই।

## 🔬 নিরাপত্তা অডিট — Daily Streak/Streak Freeze Race Condition (কোনো বাগ পাওয়া যায়নি) ✅ সম্পন্ন

### প্রেক্ষাপট
Quiz Battle/Quiz Duel/Reading Room XP Race Condition অডিট শেষ করার
পরে, একই ক্লাসের সমস্যা প্ল্যাটফর্মের অন্য কোথাও আছে কিনা যাচাই করতে
`lib/streak.ts` এর `updateStreak()` ফাংশন পরীক্ষা করা হয়। এই ফাংশন
Task/StudyPlanItem/TopicProgress/Flashcard review/CQ submit/Practice
submit/Forum post-reply/Study Session ইত্যাদি ১৩টা+ endpoint থেকে কল
হয় — এতগুলো জায়গা থেকে ট্রিগার হওয়ায় concurrent action (দুই ট্যাব/
ডিভাইস থেকে একসাথে একাধিক কাজ করা) এ race condition এর ঝুঁকি স্বাভাবিক
সন্দেহ ছিল, বিশেষ করে এটাও read-then-write প্যাটার্নে থাকায়
(`isSameDay(user.lastActiveAt, now)` চেক করে early return, তারপর
`gapDays` হিসাব করে নতুন state আলাদা `update()` কলে লেখে)।

### লাইভ concurrency টেস্ট ও ফলাফল — কোনো বাগ পাওয়া যায়নি
`scripts/test-streak-race-condition-audit.py` দিয়ে একজন real ইউজার
ব্যবহার করে ৩টা সিনারিওতে ৫টা concurrent Task create+complete request
(Python `threading`) পাঠানো হয়েছে:

১. **প্রথমবার একটিভ** (fresh user, `lastActiveAt=null`) — ৫টা
   concurrent request এর পরেও `streakCount` ঠিক ১ (৫x/multi-set হয়নি)
২. **gapDays=1** (DB তে `lastActiveAt` ম্যানুয়ালি গতকাল সেট করে) — ৫টা
   concurrent request এর পরেও `streakCount` ঠিক আগেরটার +১ (২x/৫x
   বাড়েনি)
৩. **gapDays=2 (Streak Freeze ব্যবহারের কেস)** — `lastActiveAt` ২ দিন
   আগে ও `streakFreezes=2` সেট করে — ৫টা concurrent request এর পরেও
   `streakCount` ঠিক +১ বেড়েছে **এবং** `streakFreezes` ঠিক -১ কমেছে
   (multiple freeze consumption হয়নি)

dev server log এ timestamp পরীক্ষা করে নিশ্চিত হওয়া গেছে এই request
গুলো প্রকৃতপক্ষে **সমান্তরালে** (overlapping, sequential না) execute
হয়েছে — প্রতিটা request ~২০-২৬ সেকেন্ড সময় নিয়েছে এবং log এ একে
অপরের সাথে interleaved দেখা গেছে (তাই এই টেস্ট একটা genuine concurrency
পরিস্থিতি তৈরি করেছে, dev sandbox এর connection pool এ artificial
serialization হয়নি)। মোট ৮টা assertion — সবগুলো PASS।

### কেন এটা নিরাপদ (root cause analysis)
`awardXp()` এর সাথে মূল পার্থক্য — `awardXp()` Prisma এর
`{ increment: amount }` অপারেটর ব্যবহার করে (এটা atomic, কিন্তু
"এই ইউজার প্রথমবার এই কাজ করছে কিনা" এই condition আলাদাভাবে check
করা হতো বলেই বাগ হয়েছিল)। `updateStreak()` সম্পূর্ণ ভিন্নভাবে কাজ
করে — এটা প্রতিটা call এ stale snapshot (`user.streakCount`,
`user.lastActiveAt`) থেকে একটা **absolute computed target value**
বসায় (`newStreak = user.streakCount + 1`, `newFreezeCount =
currentFreezes - 1`)। concurrent request গুলো একই stale state থেকে
**একই** target value গণনা করে, তাই শেষ write যেটাই জিতুক না কেন,
ফলাফল সবসময় একই (convergent, compound/multiply হয় না) — এটা
accidental-but-effective race-condition-safety, `{ increment }`
এর বদলে "recompute-and-overwrite" প্যাটার্নের একটা happy side-effect।

### সিদ্ধান্ত
যেহেতু কোনো bug পাওয়া যায়নি, কোনো কোড পরিবর্তন করা হয়নি — শুধু
transparency এর জন্য অডিটের ফলাফল ডকুমেন্ট করা হলো (negative result
ও গুরুত্বপূর্ণ, ভবিষ্যতে কেউ আবার এই একই জায়গা অডিট করার প্রয়োজন
মনে করলে এই নোট দেখে সময় বাঁচাতে পারবে)।

### tsc/build/lint checkpoint
কোনো কোড পরিবর্তন হয়নি বলে checkpoint প্রযোজ্য না — শুধু টেস্ট
স্ক্রিপ্ট (`scripts/test-streak-race-condition-audit.py`) নতুন যোগ
করা হয়েছে, যেটা কোনো প্রোডাকশন কোড টাচ করে না।

### Test cleanup
`streakraceaudit_*` প্যাটার্নের টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করে cascade delete
ভেরিফাই করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `scripts/test-streak-race-condition-audit.py`
- কোনো lib/app কোড পরিবর্তন হয়নি (audit-only, negative result)

### এই মুহূর্তে সম্পন্ন সামগ্রিক XP/Reward Race Condition অডিট সারসংক্ষেপ
এই তিন-পর্বের অডিট সিরিজ শেষে (Forum Best Answer → Task/StudyPlanItem/
TopicProgress → Quiz Battle/Duel/Reading Room → Streak/Freeze) পুরো
প্ল্যাটফর্মের সব reward-granting logic সিস্টেমেটিক্যালি পরীক্ষা করা
হয়েছে। মোট ৬টা আসল bug পাওয়া গেছে ও ফিক্স করা হয়েছে (Forum Best
Answer, Task, StudyPlanItem, TopicProgress, Quiz Battle x2, Quiz Duel
[প্রতিরোধমূলক], Reading Room), এবং Streak system পরীক্ষা করে
নিশ্চিত হয়েছে সেটা ইতিমধ্যে নিরাপদ। এখন কোনো জানা reward-related race
condition অবশিষ্ট নেই।

## 🔔 নতুন ফিচার — Content Report Resolution Notification ✅ সম্পন্ন

### প্রেক্ষাপট
XP/Reward Race Condition অডিট সিরিজ (Forum Best Answer → Task/
StudyPlanItem/TopicProgress → Quiz Battle/Duel/Reading Room →
Streak) সম্পূর্ণ শেষ হওয়ার পরে ব্যবহারকারী "Next" বলায়, docs জুড়ে
আগে থেকে চিহ্নিত "ভবিষ্যতে যোগ করা যায়" ধরনের gap গুলো রিভিউ করা
হয়। "Content Report/Flagging System" ফিচারের সীমাবদ্ধতা তালিকায়
স্পষ্টভাবে লেখা ছিল: *"রিপোর্ট করা ইউজারকে notification পাঠানো হয়
না (resolve/dismiss হলে) — ভবিষ্যতে বিদ্যমান Notification সিস্টেমের
সাথে যোগ করা যায়"* — এটাই এই সেশনের candidate হিসেবে বেছে নেওয়া
হয়েছে কারণ: (১) schema-free (কোনো migration লাগে না), (২) বিদ্যমান
`createNotification()` infrastructure পুনর্ব্যবহার করা যায় (in-app+
push উভয়ই automatic), (৩) ইউজার-facing visible improvement (একজন
ইউজার রিপোর্ট করে কখনো ফলাফল জানতে না পারা একটা বাস্তব UX গ্যাপ)।

### ফিচার বিবরণ
`PATCH /api/admin/reports/[reportId]` এন্ডপয়েন্টে (Content Report
resolve/dismiss করার জন্য ব্যবহৃত) নতুন লজিক যোগ করা হয়েছে — admin
action এর পরে যে ইউজার সেই কনটেন্ট রিপোর্ট করেছিল তাকে জানানো হয়:

- **RESOLVE** (admin সমস্যা স্বীকার করে ব্যবস্থা নিয়েছে): title "✅
  তোমার রিপোর্ট রিভিউ করা হয়েছে", body তে "admin তা রিভিউ করে যথাযথ
  ব্যবস্থা নিয়েছে" মেসেজ
- **DISMISS** (admin রিভিউ করে দেখেছে সমস্যা নেই): title "তোমার
  রিপোর্ট রিভিউ করা হয়েছে" (কোনো ✅ ছাড়া), body তে "কমিউনিটি নিয়ম
  ভঙ্গ করেনি" মেসেজ — যাতে ইউজার স্পষ্টভাবে দুই ফলাফলের মধ্যে পার্থক্য
  বুঝতে পারে

উভয় ক্ষেত্রেই notification এর `link` সরাসরি সেই ফোরাম পোস্টে নিয়ে
যায় — যদি post রিপোর্ট করা হয়ে থাকে সরাসরি সেই postId দিয়ে, যদি
reply রিপোর্ট করা হয়ে থাকে reply এর parent `postId` দিয়ে।

### কোনো নতুন migration/dependency লাগেনি
সম্পূর্ণভাবে বিদ্যমান `Notification` মডেল ও `lib/notifications.ts`
এর `createNotification()` ফাংশন পুনর্ব্যবহার — এই ফাংশন ইতিমধ্যে
push notification (`sendPushToUser()`) automatic ভাবে পাঠায় (event-
driven, কোনো cron লাগে না) এবং silent-fail করে (মূল admin action
ব্যাহত হয় না যদি notification তৈরিতে সমস্যা হয়)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 38.8s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-content-report-notification.py`, ২৭টা assertion, সব PASS)
৩ জন real ইউজার (reporter+poster+admin) দিয়ে:
১. Reporter একটা পোস্ট রিপোর্ট করে, admin RESOLVE করে -> reporter এর
   কাছে সঠিক title ("✅ তোমার রিপোর্ট রিভিউ করা হয়েছে") ও link
   (`/forum/{postId}`) সহ notification আসে
২. দ্বিতীয় পোস্ট রিপোর্ট করে admin DISMISS করে -> ভিন্ন title (কোনো
   ✅ ছাড়া) ও body ("কমিউনিটি নিয়ম ভঙ্গ করেনি") সহ notification আসে
৩. মোট ২টা নতুন notification তৈরি হয়েছে তা DB তে সরাসরি ভেরিফাই
৪. Authorization: non-admin PATCH -> ৪০৩, unauthenticated -> ৪০১,
   non-existent report -> ৪০৪, invalid action -> ৪০০

**ডিবাগিং নোট (transparency, established শিক্ষা হিসেবে ডকুমেন্ট
করা)**: প্রথম টেস্ট রানে admin ইউজারকে DB তে সরাসরি `role='ADMIN'`
সেট করার পরেও `PATCH` কল ৪০৩ ("Admin অনুমতি লাগবে") রিটার্ন করেছিল।
Root cause: NextAuth JWT session token role সহ ইস্যু হওয়ার সময়ই
cache হয়ে যায় — DB তে role আপডেট হলেও ইতিমধ্যে issued token পুরনো
role বহন করতে থাকে যতক্ষণ না নতুন login হয়। ফিক্স: টেস্ট script এ
role আপডেট করার পরে admin session কে re-login করানো (fresh JWT token
নেওয়া) — এটা প্রোডাকশন কোডের bug না, শুধু test methodology এর
শিক্ষা (ভবিষ্যতে কোনো টেস্টে DB তে সরাসরি role/permission পরিবর্তন
করলে অবশ্যই re-login করাতে হবে)।

### Test cleanup
`reportnotif_*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করে cascade delete
ভেরিফাই করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `app/api/admin/reports/[reportId]/route.ts` — `createNotification()`
  কল যোগ, `report` কে `post`/`reply` include সহ fetch করে link বানানো
- নতুন: `scripts/test-content-report-notification.py`

### ডকুমেন্টেশন আপডেট
পুরনো "Content Report/Flagging System" ফিচার সেকশনের সীমাবদ্ধতা
তালিকায় থাকা এই gap এন্ট্রি স্ট্রাইকথ্রু করে "পরে ফিক্স করা হয়েছে"
নোট সহ আপডেট করা হয়েছে (এই সেকশনের রেফারেন্স দিয়ে)।

## 🐛 গুরুতর বাগ ফিক্স — Study Group/Quiz Battle Capacity Race Condition অডিট ✅ সম্পন্ন

### প্রেক্ষাপট
XP/Reward Race Condition অডিট সিরিজ (Forum Best Answer → Task/
StudyPlanItem/TopicProgress → Quiz Battle/Duel/Reading Room → Streak)
এবং Content Report Resolution Notification ফিচার শেষ হওয়ার পরে,
ব্যবহারকারী Dashboard HTML mockup আপডেট চাওয়ার পরে "Next" বলায়,
XP ছাড়া অন্য ধরনের race condition আছে কিনা যাচাই করা হয় — বিশেষভাবে
**capacity limit** (কতজন একটা resource এ থাকতে পারবে) চেক করা লজিক।
Study Group এর `maxMembers` ও Quiz Battle এর `maxPlayers` উভয়েই একই
কাঠামোগত read-then-write প্যাটার্নে পাওয়া যায় (`if (members.length
>= maxMembers) throw`, তারপর আলাদা `create()` কল)।

### আবিষ্কৃত বাগ (লাইভ concurrency টেস্টে নিশ্চিত)
এটা XP এর মতো "ভুল amount" বাগ না — বরং **capacity constraint সম্পূর্ণ
bypass** হয়ে over-capacity resource তৈরি হওয়ার ডেটা-ইন্টিগ্রিটি বাগ।
`scripts/test-capacity-race-condition-audit.py` দিয়ে ১ জন owner + ৫ জন
joiner ব্যবহার করে:

- **Study Group**: `maxMembers=2` সেট করা একটা group এ (owner+১ জন
  থাকার কথা) ৫ জন ভিন্ন ইউজার concurrent ভাবে join করলে **সবাই সফল
  হয়েছে** (৫টা `200` status) — চূড়ান্ত member count হয়েছে **৬**
  (owner+৫ joiner), maxMembers=2 সম্পূর্ণ bypass।
- **Quiz Battle**: `maxPlayers=2` সেট করা battle এ ৫ জনের মধ্যে ৩ জন
  সফলভাবে join করেছে, চূড়ান্ত participant count হয়েছে **৪**।

### ফিক্স — Postgres `SELECT ... FOR UPDATE` Row-Level Lock

আগের XP race condition গুলো `updateMany({ where: { xpAwarded: false }
})` এর মতো single-field atomic conditional update দিয়ে ফিক্স করা
গিয়েছিল (একটা মাত্র বুলিয়ান ফ্ল্যাগ চেক+সেট)। কিন্তু capacity check
এর জন্য এটা যথেষ্ট না — কারণ এখানে **count() এর ভিত্তিতে সিদ্ধান্ত**
নিতে হয় (কতজন ইতিমধ্যে আছে), যেটা একটামাত্র atomic `UPDATE...WHERE`
স্টেটমেন্টে প্রকাশ করা কঠিন। তাই ভিন্ন approach ব্যবহার করা হয়েছে:
Postgres এর `SELECT ... FOR UPDATE` দিয়ে target row (group/battle)-কে
`prisma.$transaction()` এর ভেতরে explicitly lock করা হয়:

```ts
// lib/study-group.ts — joinStudyGroup()
const group = await prisma.$transaction(async (tx) => {
  const locked = await tx.$queryRaw<{ id: string; name: string; maxMembers: number }[]>`
    SELECT id, name, "maxMembers" FROM "study_groups"
    WHERE "inviteCode" = ${trimmedCode}
    FOR UPDATE
  `;
  const groupRow = locked[0];
  if (!groupRow) throw new Error("এই ইনভাইট কোড দিয়ে কোনো গ্রুপ পাওয়া যায়নি");

  const memberCount = await tx.studyGroupMember.count({ where: { groupId: groupRow.id } });
  if (memberCount >= MAX_GROUP_MEMBERS || memberCount >= groupRow.maxMembers) {
    throw new Error("এই গ্রুপ পূর্ণ হয়ে গেছে");
  }

  await tx.studyGroupMember.create({ data: { groupId: groupRow.id, userId, role: "MEMBER" } });
  return tx.studyGroup.findUniqueOrThrow({ where: { id: groupRow.id }, include: { members: { ... } } });
});
```

`FOR UPDATE` lock একই row-এ পরের যেকোনো transaction-কে block করে
রাখে যতক্ষণ না প্রথম transaction commit/rollback হয় — তাই একই
group/battle-এ আসা concurrent join request গুলো কার্যকরভাবে
**serialize** হয়ে যায় (একটার পরে আরেকটা প্রসেস হয়), capacity
check+insert একসাথে atomic হয়ে যায়। ভিন্ন group/battle-এ join করা
সম্পূর্ণ independent থাকে (আলাদা row, আলাদা lock, কোনো cross-resource
contention হয় না, তাই throughput এ কোনো global bottleneck তৈরি হয়নি)।

`lib/quiz-battle.ts` এর `joinQuizBattle()` এ একই প্যাটার্নে fix করা
হয়েছে (`roomCode` দিয়ে battle row lock করে)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 28.8s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-capacity-race-condition-audit.py`, ১৬টা assertion, সব PASS)
১ জন owner + ৫ জন joiner (real ইউজার, dev server এর বিরুদ্ধে) দিয়ে:
১. `maxMembers=2` এর Study Group এ ৫টা concurrent join request পাঠিয়ে
   — ঠিক ১ জনই সফল (`200`), বাকি ৪টা `400` "গ্রুপ পূর্ণ হয়ে গেছে";
   DB তে চূড়ান্ত member count ঠিক ২ (owner+১)
২. `maxPlayers=2` এর Quiz Battle এ একই সিনারিও — ঠিক ১ জনই সফল, DB তে
   চূড়ান্ত participant count ঠিক ২

**Normal (non-concurrent) flow regression টেস্ট** (আলাদা স্ক্রিপ্টে)
— ৪ জন ইউজার সিরিয়ালি (একটার পর একটা) join করলে সবাই সফল হয়
(capacity যথেষ্ট থাকলে block হওয়া উচিত না), একই ইউজার আবার group এ
join করার চেষ্টায় "ইতিমধ্যে একটা গ্রুপে আছো" এরর, ভুল invite-code/
room-code এ `400`, Quiz Battle এ আগে থেকে joined ইউজার আবার join
করলে idempotent ভাবে সফল রেসপন্স (ডুপ্লিকেট participant তৈরি হয় না,
`@@unique([battleId, userId])` DB constraint এর সাথেও সামঞ্জস্যপূর্ণ)
— নিশ্চিত হয়েছে ফিক্স আগের normal flow এর আচরণ ভাঙেনি।

### Test cleanup
`capaudit_*` ও `capnormal_*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করে cascade delete
ভেরিফাই করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `lib/study-group.ts` — `joinStudyGroup()` কে `$transaction`+
  `SELECT...FOR UPDATE` এ rewrite
- `lib/quiz-battle.ts` — `joinQuizBattle()` একই প্যাটার্নে rewrite
- নতুন: `scripts/test-capacity-race-condition-audit.py`

কোনো নতুন migration/dependency লাগেনি — বিদ্যমান স্কিমা ও Prisma
`$transaction`/`$queryRaw` API পুনর্ব্যবহার।

### এখন পর্যন্ত সম্পন্ন সামগ্রিক Race Condition অডিট সারসংক্ষেপ
XP/Reward সিরিজ (৬টা bug ফিক্স) + Streak (কোনো bug নেই, ইতিমধ্যে নিরাপদ)
+ Capacity Limit সিরিজ (২টা bug ফিক্স — Study Group, Quiz Battle) —
মোট ৮টা race condition bug পাওয়া গেছে ও ফিক্স করা হয়েছে পুরো এই
মাল্টি-সেশন অডিট জুড়ে, দুই ভিন্ন সমাধান প্যাটার্নে (single-field atomic
conditional `UPDATE...WHERE` এবং multi-row `SELECT...FOR UPDATE`
transaction lock, নির্ভর করে সমস্যার প্রকৃতির উপর)।

## 🎤 নতুন ফিচার — Voice Input (কথা বলে প্রশ্ন করা) ✅ সম্পন্ন

### প্রেক্ষাপট
Study Group/Quiz Battle Capacity Race Condition অডিট শেষ হওয়ার পরে
(এবং আরও Custom Question Set/Habit/PDF Document এর per-user limit
race condition candidate গুলো পাওয়া গেলেও সেগুলো self-scoped বলে
কম-priority ধরে স্কিপ করা হয়) ব্যবহারকারী Dashboard HTML mockup
আপডেট করানোর পরে "Next" বলায়, নতুন ভিজিবল ফিচারের দিকে মনোযোগ দেওয়া
হয়। docs এর V1-V4 research এ চিহ্নিত প্রায় সব ফিচার ইতিমধ্যে
বাস্তবায়িত পাওয়া যায় (roadmap review করে নিশ্চিত করা হয়েছে) — তাই
সরাসরি কোডবেস অডিট করে নতুন gap খোঁজা হয়। আবিষ্কার: AI Doubt Solver
এ Text-to-Speech (output শোনা, `TextToSpeechButton`) থাকলেও **Voice
Input** (কথা বলে প্রশ্ন করা, input) প্ল্যাটফর্মের কোথাও ছিল না —
স্পষ্ট অসামঞ্জস্য (output এর জন্য audio আছে, input এর জন্য নেই)।

### গবেষণা (Deep Research, web_search দিয়ে ভেরিফাইড)
Web Speech API এর `SpeechRecognition` ইন্টারফেস (Chrome/Edge/Safari
সাপোর্ট করে, `webkitSpeechRecognition` prefix সহ) দিয়ে সম্পূর্ণ ফ্রি
speech-to-text করা সম্ভব — কোনো server-side processing/API cost
লাগে না (recognition ব্রাউজারের/OS এর নিজস্ব engine ব্যবহার করে)।
`bn-BD` (বাংলা, বাংলাদেশ) ভাষা কোড Chrome এর অফিসিয়াল Web Speech API
ডেমো/ভাষা তালিকায় verified পাওয়া গেছে (`['বাংলা', ['bn-BD',
'বাংলাদেশ'], ['bn-IN', 'ভারত']]`) — তাই বাংলাদেশী accent এর জন্য
নির্দিষ্ট ভাষা কোড ব্যবহার করা সম্ভব।

### নতুন কম্পোনেন্ট: `components/shared/voice-input-button.tsx`
বিদ্যমান `TextToSpeechButton` (`components/learn/text-to-speech-button.tsx`)
এর সরাসরি "counterpart" — একই ডিজাইন দর্শন অনুসরণ করে:
- সম্পূর্ণ ফ্রি, কোনো external API/cost/migration লাগে না
- Browser support না থাকলে বাটন সম্পূর্ণ hidden (graceful degradation,
  broken UI দেখায় না) — `useEffect` এ `window.SpeechRecognition ??
  window.webkitSpeechRecognition` চেক করে
- মাইক আইকনে ক্লিক করলে recording শুরু (visual feedback: বাটন
  `variant="default"` + `animate-pulse` ক্লাস), আবার ক্লিক করলে বা
  স্বয়ংক্রিয়ভাবে (`continuous: false`, একটা pause এ থেমে যায়) বন্ধ
- `onResult` callback দিয়ে parent component কে transcript পাঠায় —
  parent নিজের input state আপডেট করে (আগের টেক্সট থাকলে সাথে append
  হয়, প্রতিস্থাপন করে না — ইউজার প্রথমে টাইপ করে তারপর ভয়েস দিয়ে
  যোগ করতে পারবে)
- Component unmount হলে চলমান `recognition.stop()` কল হয়
  (ব্যাকগ্রাউন্ডে মাইক্রোফোন চালু থেকে যাওয়া/মেমরি লিক এড়াতে)

### TypeScript টাইপ হ্যান্ডলিং (গুরুত্বপূর্ণ কারিগরি নোট)
`SpeechRecognition` built-in `lib.dom.d.ts` এ নেই (এখনো experimental/
vendor-prefixed Web API হিসেবে বিবেচিত, W3C স্ট্যান্ডার্ড draft
পর্যায়ে) — তাই TypeScript কম্পাইলার এই টাইপ চেনে না। সমাধান:
প্রয়োজনীয় অংশটুকু (পুরো স্পেক না, শুধু ব্যবহৃত মেথড/প্রপার্টি —
`lang`, `continuous`, `interimResults`, `start()`, `stop()`, `onresult`,
`onerror`, `onend`) ম্যানুয়ালি `interface SpeechRecognitionLike`
হিসেবে ডিক্লেয়ার করা হয়েছে, এবং `window` অবজেক্টে
`interface WindowWithSpeechRecognition extends Window` দিয়ে
`SpeechRecognition?`/`webkitSpeechRecognition?` অপশনাল constructor
প্রপার্টি যোগ করা হয়েছে।

### Error Handling
- `not-allowed`/`service-not-allowed` (মাইক্রোফোন পারমিশন প্রত্যাখ্যাত)
  → নির্দিষ্ট বাংলা toast ("মাইক্রোফোন ব্যবহারের অনুমতি লাগবে")
- `network` (recognition service এ পৌঁছানো যায়নি) → "ইন্টারনেট সংযোগ
  দরকার" toast
- `no-speech` (ইউজার কিছু বলেনি) ও `aborted` (ইউজার নিজেই থামিয়েছে) —
  এগুলো স্বাভাবিক/প্রত্যাশিত অবস্থা, কোনো বিরক্তিকর error toast
  দেখানো হয় না

### দুই জায়গায় ইন্টিগ্রেশন
- `app/ai-tutor/page.tsx` — বিদ্যমান text input এর ঠিক পাশে (image
  upload বাটন ও text input এর মাঝে) মাইক বাটন
- `components/pdf-chat/pdf-chat-room.tsx` — বিদ্যমান text input এর
  পাশে একই প্যাটার্নে

কোনো নতুন backend endpoint/change লাগেনি — ভয়েস থেকে আসা transcript
সাধারণ টাইপ করা টেক্সটের মতোই existing `/api/ai-chat`/PDF chat POST
endpoint এ যায়, backend এর কাছে input এর উৎস অদৃশ্য/অপ্রাসঙ্গিক।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস (প্রথম চেষ্টাতেই — কাস্টম টাইপ
  ডিক্লারেশন সঠিকভাবে লেখা হয়েছিল)
- `pnpm build` ✅ "Compiled successfully in 29.9s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-voice-input-feature.py`, ৯টা assertion, সব PASS)
sandbox এ headless browser/microphone simulation সম্ভব না হওয়ায়
(established সীমাবদ্ধতা, browser automation নেই) নিম্নলিখিত পদ্ধতিতে
ভেরিফাই করা হয়েছে:
১. AI Doubt Solver ও PDF Chat পেজ ঠিকভাবে লোড হচ্ছে (২০০ status,
   component crash করেনি)
২. **Compiled JS bundle verification** (established false-negative
   pattern অনুযায়ী — CSR component এর `useEffect`+state ব্যবহার সার্ভার-
   রেন্ডার HTML এ দেখা যায় না) — `.next/dev/static/` এ সরাসরি `grep`
   করে `SpeechRecognition` স্ট্রিং ও কম্পোনেন্টের বাংলা aria-label
   টেক্সট ("কথা বলে লেখো") উভয়ই compiled bundle এ পাওয়া গেছে
৩. **Backend flow verification** — ভয়েস input থেকে আসা টেক্সট
   simulate করে (সাধারণ string হিসেবে, যেহেতু backend এর কাছে এটা
   আলাদা করার উপায় নেই) বাস্তব `/api/ai-chat` endpoint এ POST করে
   ২০০ status ও সঠিক AI রেসপন্স ভেরিফাই
৪. Authorization: unauthenticated `/api/ai-chat` → ৪০১

### Test cleanup
`voiceinput_*` প্যাটার্নের টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
endpoint দিয়ে ডিলিট করে cascade delete ভেরিফাই করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `components/shared/voice-input-button.tsx`
- `app/ai-tutor/page.tsx` — `VoiceInputButton` ইন্টিগ্রেট
- `components/pdf-chat/pdf-chat-room.tsx` — `VoiceInputButton` ইন্টিগ্রেট
- নতুন: `scripts/test-voice-input-feature.py`

কোনো migration লাগেনি, কোনো নতুন npm dependency লাগেনি (browser-native
API), কোনো নতুন AI/infrastructure cost লাগেনি।

### সীমাবদ্ধতা (স্বচ্ছভাবে জানানো)
- **Safari/Firefox এ সীমিত সাপোর্ট** — `SpeechRecognition` মূলত
  Chrome/Edge/Chromium-ভিত্তিক ব্রাউজারে ভালো কাজ করে; Safari এ আংশিক
  সাপোর্ট আছে, Firefox এ ঐতিহাসিকভাবে সাপোর্ট নেই — কিন্তু graceful
  degradation থাকায় (বাটন hidden হয়ে যায়) কোনো ব্রাউজারে broken UI
  দেখাবে না
- **সার্ভারে audio পাঠানো হয় না** — recognition সম্পূর্ণ client-side/
  browser-vendor-server এ হয় (privacy trade-off ব্রাউজার ভেন্ডরের
  উপর নির্ভর করে, আমাদের নিজস্ব সার্ভারে কোনো audio data স্টোর/প্রসেস
  হয় না)
- **প্রকৃত মাইক্রোফোন/speech recognition accuracy sandbox এ টেস্ট করা
  সম্ভব হয়নি** (headless browser/audio input simulation নেই) — শুধু
  code-level ও compiled-bundle ভেরিফিকেশন করা হয়েছে, ব্যবহারকারীর
  নিজের ডিভাইসে actual voice recognition accuracy পরীক্ষা করে দেখা
  উচিত

---

## 🎉 সাপ্তাহিক রিক্যাপ (Weekly Study Recap) ✅ সম্পন্ন

### প্রেক্ষাপট ও গবেষণা
ব্যবহারকারী "Next"/"continue" মোডে থাকায় (নিজে সিদ্ধান্ত নিয়ে পরবর্তী
ফিচার বেছে নেওয়া) নতুন করে deep web research করা হয়েছে
(`docs/FEATURE_RESEARCH_V5.md`)। মূল আবিষ্কার:

1. **HSC ২০২৮ কারিকুলাম আপডেট** (awareness-only, কোনো action দরকার
   নেই এখনই) — শিক্ষা মন্ত্রণালয় ২০২৬-০৭-০১ এ প্রেস কনফারেন্সে নিশ্চিত
   করেছে নতুন কারিকুলাম ২০২৮ থেকে চালু হবে ("সময়ের অভাবে ২০২৭ থেকে সম্ভব
   হয়নি")। আমাদের টার্গেট ব্যাচ (HSC 2028) সম্ভবত নতুন কারিকুলামে HSC
   দেওয়া প্রথম বা কাছাকাছি ব্যাচ হতে পারে — কনটেন্ট কাজ (এখন স্থগিত)
   আবার শুরু হলে এই তথ্য reconfirm করা উচিত।
2. **"Personal Recap" প্যাটার্ন** — OpenAI এর "Your Year with ChatGPT"
   (ডিসেম্বর ২০২৫ লঞ্চ, Spotify Wrapped-স্টাইল) বর্তমান সবচেয়ে প্রমাণিত
   consumer-engagement/growth pattern। 10 Minute School ও Shikho এর
   অ্যাপ পুনরায় রিভিউ করে নিশ্চিত হওয়া গেছে — leaderboard/report card
   থাকলেও কোনো celebratory personalized "recap story" ফিচার নেই BD
   মার্কেটে। সম্পূর্ণ নতুন gap হিসেবে চিহ্নিত।

### সিদ্ধান্ত: Weekly Study Recap
Dashboard এ প্রতি সপ্তাহে ইউজার একটা রঙিন, Instagram-Story-স্টাইল কার্ড
দেখতে পাবে যেটায় থাকে এই সপ্তাহের XP, পড়ার সময়, কুইজ/CQ সংখ্যা, নতুন
মাস্টার করা টপিক, streak, সবচেয়ে বেশি সময় দেওয়া সাবজেক্ট, এবং একটা মজার
"স্টাডি পার্সোনালিটি" আর্কিটাইপ ব্যাজ — সাথে Download/Share বাটন।

**কেন এটা ভালো candidate ছিল**:
- সম্পূর্ণ **schema-free** — সব দরকারি ডেটা ইতিমধ্যে বিদ্যমান টেবিলে
  আছে (`User.weeklyXp/streakCount`, `StudySession`, `QuizAttempt`,
  `CQAttempt`, `TopicProgress`)
- কোনো নতুন AI cost না — pure aggregation + deterministic heuristic
- Study Pet এর পেঁচা মাসকট থিমের সাথে "নাইট আওল" আর্কিটাইপ organically
  মিলে যায় (বিদ্যমান ব্র্যান্ড আইডেন্টিটির সম্প্রসারণ)

### `lib/weekly-recap.ts` — কোর লজিক
`getWeeklyRecap(userId)` ফাংশন `lib/league.ts` এর
`getCurrentWeekStart()` (রবিবার ০০:০০ UTC ভিত্তিতে) দিয়ে সপ্তাহের শুরু
নির্ধারণ করে, তারপর একটা `Promise.all()` দিয়ে চারটা টেবিল থেকে ডেটা আনে:

```ts
const [sessions, quizAttempts, cqAttempts, topicsMasteredThisWeek] = await Promise.all([
  prisma.studySession.findMany({ where: { userId, startTime: { gte: weekStart } }, ... }),
  prisma.quizAttempt.count({ where: { userId, createdAt: { gte: weekStart } } }),
  prisma.cQAttempt.count({ where: { userId, createdAt: { gte: weekStart } } }),
  prisma.topicProgress.count({ where: { userId, status: "MASTERED", updatedAt: { gte: weekStart } } }),
]);
```

সাবজেক্ট-ভিত্তিক সময় (top subject বের করতে) ও আর্কিটাইপ heuristic এর
জন্য সময়ের প্যাটার্ন (রাত/সকাল/উইকেন্ড session count) — দুটোই একই
`sessions` array থেকে একবারই লুপ করে বের করা হয় (আলাদা query লাগেনি)।

### "স্টাডি পার্সোনালিটি" আর্কিটাইপ heuristic
`deriveArchetype()` — priority-ordered rule chain (deterministic, কোনো
AI call না):
1. কোনো activity না থাকলে → "নতুন শুরু" 🌱
2. অন্তত ৫০% সেশন রাত ১০টা-ভোর ৪টার মধ্যে → "নাইট আওল" 🦉 (Study Pet
   এর পেঁচার সাথে ব্র্যান্ডিং মিল)
3. অন্তত ৫০% সেশন সকাল ৫টা-৯টার মধ্যে → "ভোরের পাখি" 🌅
4. অন্তত ৫০% সেশন শুক্র/শনিবারে → "উইকেন্ড ওয়ারিয়র" 🎯
5. ৩+ টপিক মাস্টার → "মাস্টার মাইন্ড" 🏆
6. ১৫+ কুইজ attempt → "কুইজ মেশিন" ⚡
7. ৫+ CQ attempt → "সৃজনশীল যোদ্ধা" ✍️
8. ৫+ ঘণ্টা পড়ার সময় → "মনোযোগী শিক্ষার্থী" 📚
9. ফলব্যাক → "স্টেডি লার্নার" 🌟

### UI — `components/dashboard/weekly-recap-card.tsx`
- Dashboard এ একটা compact preview কার্ড (`bg-linear-to-br from-amber-500/10
  to-pink-500/10`, MotivationalQuoteCard-এর মতো একই gradient-card
  প্যাটার্ন অনুসরণ করে) — "রিক্যাপ দেখো" বাটনে ক্লিক করলে Dialog খোলে
- Dialog এর ভেতরে একটা `ref` দিয়ে ধরা `div` (gradient
  `from-indigo-600 via-purple-600 to-pink-600`) — এটাই PNG এ ক্যাপচার
  হয়, XP/সময়/কুইজ/স্ট্রিক এর ২x২ গ্রিড + archetype emoji/title/description
  + top subject line
- **Download/Share**: নতুন dependency `html-to-image` (npm, MIT license,
  client-side canvas capture, dynamic `import()` দিয়ে লোড হয় যাতে
  bundle size এ প্রভাব না পড়ে যতক্ষণ না ইউজার Dialog খোলে) — `toPng()`
  দিয়ে `pixelRatio: 2` (retina-quality) PNG বানানো হয়। Web Share API
  (`navigator.share`+`canShare({files})`) সাপোর্ট থাকলে সরাসরি native
  শেয়ার শিট খোলে (ফেসবুক/WhatsApp এ bragging rights শেয়ার করা BD
  ছাত্রদের সংস্কৃতির সাথে মিলিয়ে), না থাকলে বা "ডাউনলোড" বাটনে ক্লিক
  করলে সরাসরি `<a download>` দিয়ে ফাইল সেভ হয়
- AbortError (ইউজার নিজে share sheet বাতিল করলে) সাইলেন্টলি হ্যান্ডেল
  করা হয় (কোনো বিরক্তিকর error toast না)

### API — `GET /api/analytics/weekly-recap`
সাধারণ auth-guarded GET endpoint, `getWeeklyRecap()` কল করে JSON রিটার্ন
করে। কোনো ইউজার না পাওয়া গেলে ৪০৪, error হলে ৫০০।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 28.5s", নতুন
  `/api/analytics/weekly-recap` route bundle এ উপস্থিত ভেরিফাই করা
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (২টা script, মোট ২১টা assertion, সব PASS)

**`scripts/test-weekly-recap-feature.py`** (১৮টা assertion):
১. Fresh user (কোনো activity নেই) → `hasAnyActivity=false`,
   `weeklyXp=0`, `studyMinutes=0`, `topSubject=null`, archetype="নতুন
   শুরু" — সব ঠিক
২. Active user — বাস্তব `/api/study-sessions` endpoint দিয়ে ৩টা সেশন
   লগ করা (Physics ২টা মোট ২৪০০ সেকেন্ড=৪০ মিনিট, Chemistry ১টা ৬০০
   সেকেন্ড=১০ মিনিট) → `studyMinutes=50` (সমষ্টি সঠিক), `topSubject`
   = PHYSICS এবং minutes=40 (সবচেয়ে বেশি সাবজেক্ট সঠিকভাবে নির্ণয়)
৩. Authorization: unauthenticated → ৪০১

**`scripts/test-weekly-recap-archetype.py`** (৩টা assertion, "নাইট আওল"
আর্কিটাইপ বিশেষভাবে যাচাই):
- StudySession API সরাসরি `startTime` override করতে দেয় না (সার্ভারে
  `Date.now() - durationSec*1000` থেকে হিসাব হয়), তাই এই নির্দিষ্ট
  টেস্টে সরাসরি DB তে raw INSERT করে ৩টা রাত ১১টার সেশন বানানো হয়েছে
  (শুধু read-path ভেরিফাই, delete প্রকৃত API দিয়েই হয়েছে) — ফলাফল:
  archetype="নাইট আওল" 🦉 সঠিকভাবে trigger হয়েছে, `studyMinutes=75`

### Test cleanup
`weeklyrecap_*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। cascade delete
ভেরিফাই: `study_sessions` টেবিলে (JOIN দিয়ে) বাকি ০টা রেকর্ড কনফার্ম
করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `lib/weekly-recap.ts`
- নতুন: `app/api/analytics/weekly-recap/route.ts`
- নতুন: `components/dashboard/weekly-recap-card.tsx`
- `app/(dashboard)/dashboard/page.tsx` — `WeeklyRecapCard` mount (Today's
  Focus এর পরে)
- নতুন dependency: `html-to-image` (`package.json`)
- নতুন: `docs/FEATURE_RESEARCH_V5.md` (গবেষণা ডকুমেন্ট)
- নতুন: `scripts/test-weekly-recap-feature.py`,
  `scripts/test-weekly-recap-archetype.py`

কোনো migration লাগেনি (সম্পূর্ণ schema-free), কোনো নতুন AI/
infrastructure cost লাগেনি।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- `hasAnyActivity=false` অবস্থায় ("নতুন শুরু" আর্কিটাইপ) কার্ডটা এখনো
  শেয়ার করা যায় (zero-stats সহ) — ইচ্ছাকৃতভাবে ব্লক করা হয়নি (কোনো
  ক্ষতিকর আচরণ না, শুধু কম motivating একটা edge case), ভবিষ্যতে চাইলে
  UI তে শেয়ার বাটন hide করে শুধু "আজই শুরু করো" CTA দেখানো যায়
- আর্কিটাইপ heuristic এর priority-order নির্দিষ্ট rule chain
  (সময়ভিত্তিক প্যাটার্ন সবার আগে চেক হয়, তারপর volume-ভিত্তিক) — এটা
  ইচ্ছাকৃত ডিজাইন সিদ্ধান্ত (সময়ের প্যাটার্ন বেশি "identity-defining"
  মনে করা হয়েছে volume এর চেয়ে), ভবিষ্যতে ইউজার ফিডব্যাক অনুযায়ী
  priority পুনর্বিন্যাস করা যেতে পারে
- সাপ্তাহিক রিক্যাপ শুধু on-demand (ইউজার নিজে "রিক্যাপ দেখো" ক্লিক
  করলে) দেখা যায় — automatic weekly notification/email এখনো নেই (এটা
  cron infrastructure লাগবে, Deploy-পরবর্তী Vercel Cron দিয়ে ভবিষ্যতে
  সম্ভব, `lib/weekly-digest.ts` এর মতোই একই constraint)

---

## 🐛🔧 গুরুতর বাগ ফিক্স — Forum Vote (Upvote/Downvote) Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
Weekly Study Recap ফিচার শেষ হওয়ার পরে ব্যবহারকারী "Next" বললে নিজে
সিদ্ধান্ত নিয়ে পরবর্তী কাজ বেছে নেওয়া হয়েছে। এই সেশনে আগের ৮টা race
condition bug fix (Forum Best Answer XP, Task/StudyPlanItem/
TopicProgress XP, Quiz Battle/Duel/Reading Room XP, Study Group/Quiz
Battle Capacity) এর একই ধরনের "read-then-write" প্যাটার্নের জন্য বাকি
কোডবেস আবার রিভিউ করার সময় `ForumVote` এর দুটো endpoint
(`app/api/forum/posts/[postId]/vote`, `app/api/forum/replies/[replyId]/vote`)
এ একই ঝুঁকিপূর্ণ প্যাটার্ন পাওয়া যায়:

```ts
const existing = await prisma.forumVote.findUnique({ where: { userId_postId: {...} } });
if (existing && existing.value === value) { await prisma.forumVote.delete(...) }
else if (existing) { await prisma.forumVote.update(...) }
else { await prisma.forumVote.create(...) } // ⚠️ concurrent হলে দুটো request-ই এখানে আসতে পারে
```

`ForumVote` মডেলে `@@unique([userId, postId])` ও `@@unique([userId, replyId])`
constraint আছে — তাই দুটো concurrent request একই সাথে `existing === null`
দেখলে দুটোই `create()` কল করে, দ্বিতীয়টা Prisma থেকে P2002 (Unique
constraint failed) error পায়, যা কোথাও catch করা হয়নি।

### লাইভ প্রমাণ (ফিক্সের আগে)
৫টা concurrent প্রথম-ভোট রিকোয়েস্ট (একই ইউজার, একই পোস্টে upvote) পাঠিয়ে:

```
status=500 body=
status=500 body=
status=500 body=
status=500 body=
status=200 body={"voteScore":1}
```

**৪টা crash করে ৫০০ Internal Server Error** দিয়েছে, dev log এ নিশ্চিত
করা গেছে `PrismaClientKnownRequestError P2002: Unique constraint failed
on the fields: (userId, postId)`। এটা বিশেষভাবে বিপজ্জনক কারণ প্রোডাকশনে
মোবাইলে দ্রুত ডাবল-ট্যাপ বা slow network এ ব্রাউজারের automatic retry
দিয়ে সহজেই ট্রিগার হতে পারতো — একটা সাধারণ ভোট বাটনে ক্লিক করে ইউজার
crash/error toast দেখতো।

### ফিক্স ইটারেশন ১ (অপর্যাপ্ত, স্বচ্ছভাবে জানানো)
প্রথম চেষ্টা ছিল retry-on-P2002-conflict লুপ (create() এ P2002 পেলে
আবার read করে update/delete এ fallback, সর্বোচ্চ ৩ বার retry)। লাইভ
টেস্টে এটা যথেষ্ট প্রমাণিত হয়নি — ৫টা concurrent request এর worst-case
thundering-herd এ ৩ বারের বেশি retry দরকার হচ্ছিল, ২টা request তখনো
`"অতিরিক্ত concurrent ভোট রিকোয়েস্টের কারণে..."` explicit error এ ব্যর্থ
হচ্ছিল (৫০০)।

### চূড়ান্ত ফিক্স — Prisma `upsert()` (DB-level atomic)
নতুন `lib/forum-vote.ts` শেয়ার্ড helper (`applyForumVote()`,
`getPostVoteScore()`, `getReplyVoteScore()`) — মূল সমাধান:

```ts
const existing = await prisma.forumVote.findUnique({ where: whereUnique });

if (existing && existing.value === value) {
  // টগল-অফ: conditional delete (id+value দুটোই ম্যাচ করলেই মুছবে,
  // race হলে নিরাপদ no-op — count=0 হলেও কোনো error/crash না)
  await prisma.forumVote.deleteMany({ where: { id: existing.id, value } });
  return;
}

// নতুন ভোট বা ভিন্ন ভোটে পরিবর্তন — একটাই atomic upsert যথেষ্ট
await prisma.forumVote.upsert({
  where: whereUnique,
  create: { userId, postId, replyId, value },
  update: { value },
});
```

`upsert()` Postgres এ single `INSERT ... ON CONFLICT (userId, postId)
DO UPDATE` স্টেটমেন্টে কম্পাইল হয় — সম্পূর্ণ DB-level atomic,
create-vs-create conflict এ কোনো retry loop/race window লাগে না
(retry-loop প্যাটার্নের চেয়ে সহজ ও শক্তিশালী সমাধান, XP-award এর
`updateMany({where:{xpAwarded:false}})` প্যাটার্নের চেয়ে ভিন্ন কিন্তু
সমতুল্য শক্তির atomic primitive)।

### P2025 existence check যোগ (bonus fix, একই সাথে আবিষ্কৃত)
মূল bug ফিক্স করার সময় লক্ষ্য করা যায় দুটো vote endpoint এ postId/replyId
এর existence কখনো চেক করা হতো না — অস্তিত্বহীন ID তে vote করার চেষ্টায়
আগে হয় orphan `ForumVote` তৈরি হয়ে যেত (foreign key constraint থাকলে
আসলে সেটাও fail করতো একটা raw DB error দিয়ে) অথবা `getPostVoteScore()`
এ পরে সাইলেন্টলি খালি array রিটার্ন হতো। এখন route এ existence check
যোগ করে ৪০৪ রিটার্ন করা হয় (established P2025 audit pattern অনুসরণ
করে, আগের "P2025 500-instead-of-404" সিস্টেমেটিক অডিট থেকে শেখা)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 28.6s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-forum-vote-race-condition.py`, ২১টা assertion, সব PASS)
১. **মূল bug ভেরিফাই**: একই ইউজারের ৫টা concurrent প্রথম-ভোটে কোনো
   ৫০০ error নেই, সব ২০০ রিটার্ন করে
২. **ডিজাইন nuance স্বচ্ছভাবে হ্যান্ডেল করা**: vote endpoint টগল-ভিত্তিক
   (একই value আবার দিলে ভোট মুছে যায়) — তাই একই ইউজারের ৫টা
   truly-simultaneous *identical* ভোট রিকোয়েস্ট আসলে টগল বাটনে ৫ বার
   ক্লিক করার সমতুল্য, ফলাফল execution-order-নির্ভর (0 বা 1 যেকোনোটা
   valid) — এটা bug না, তাই টেস্টে `voteScore in (0, 1)` (কোনো
   duplicate/corruption না) চেক করা হয়েছে, নির্দিষ্ট একটা মান না
৩. **বাস্তবসম্মত multi-user race scenario** (সবচেয়ে গুরুত্বপূর্ণ
   assertion): ৫ জন **ভিন্ন** ইউজার concurrently একই পোস্টে upvote
   করলে ফাইনাল voteScore **ঠিক ৫** — কোনো lost update/duplicate/crash
   ছাড়া প্রতিটা ভোট গণনা হয়েছে
৪. সিরিয়াল টগল (upvote→toggle-off→downvote→upvote) normal flow
   regression-free
৫. Reply vote এ একই concurrency টেস্ট (৫টা concurrent, কোনো ৫০০ error
   নেই)
৬. Edge case: অস্তিত্বহীন postId/replyId → ৪০৪, অবৈধ value (৫) → ৪০০,
   unauthenticated → ৪০১

### Test cleanup
`voterace_*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
endpoint দিয়ে ডিলিট করা হয়েছে। cascade delete ভেরিফাই: `forum_votes`,
`forum_posts`, `forum_replies` তিনটাতেই (JOIN দিয়ে) বাকি ০টা রেকর্ড
কনফার্ম করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `lib/forum-vote.ts`
- `app/api/forum/posts/[postId]/vote/route.ts` — `applyForumVote()`/
  `getPostVoteScore()` ব্যবহার করে rewrite + existence check
- `app/api/forum/replies/[replyId]/vote/route.ts` — একই প্যাটার্নে
  rewrite + existence check
- নতুন: `scripts/test-forum-vote-race-condition.py`

কোনো migration লাগেনি (বিদ্যমান `ForumVote` schema/unique constraint
পুনর্ব্যবহার — `upsert()` শুধু query-level পরিবর্তন)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- Vote count/score কোনো XP/reward দেয় না (শুধু ranking/social-proof
  UI উপাদান) — তাই এই bug এর severity XP-farming bug গুলোর চেয়ে কম
  ছিল (কোনো unfair advantage/game-breaking impact ছিল না), কিন্তু
  user-facing crash (৫০০ error, খারাপ UX) হিসেবে গুরুত্বপূর্ণ ছিল
- একই `upsert()`-ভিত্তিক প্যাটার্ন ভবিষ্যতে অনুরূপ "vote/reaction/like"
  ধরনের কোনো নতুন ফিচারে (যদি ভবিষ্যতে যোগ হয়) সরাসরি reuse করা যায়
  — retry-loop এর চেয়ে সহজ ও বেশি robust প্রমাণিত reference pattern
  হিসেবে নথিভুক্ত করা হলো

---

## 🐛🔧 গুরুতর বাগ ফিক্স — Content Report Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
Forum Vote Race Condition ফিক্স করার পরে ব্যবহারকারী "Next" বললে একই
ক্লাসের bug আর কোথাও আছে কিনা কোডবেস আবার সিস্টেমেটিকভাবে রিভিউ করা
হয়েছে (`findUnique`/`findFirst` চেক করে আলাদা `create()` কল প্যাটার্ন,
`grep -rln "findUnique\|findFirst" app/api --include=route.ts | xargs
grep -l "\.create(\|\.upsert("` দিয়ে সম্ভাব্য জায়গা খুঁজে)। বেশিরভাগ
জায়গা ইতিমধ্যে `upsert()` ব্যবহার করছিল (safe: `bookmarks`, `notes`) বা
self-scoped/no-shared-resource ছিল (কোনো race risk নেই)। কিন্তু
`app/api/forum/reports/route.ts` (Content Report তৈরি) এ হুবহু
ForumVote এর মতো একই ঝুঁকিপূর্ণ প্যাটার্ন পাওয়া যায়:

```ts
const existing = await prisma.contentReport.findFirst({ where: { userId, postId } });
if (existing) return 409;
const report = await prisma.contentReport.create({ data: {...} }); // ⚠️ race window
```

`ContentReport` মডেলে `@@unique([userId, postId])` ও
`@@unique([userId, replyId])` constraint আছে (ForumVote এর সাথে হুবহু
একই ডিজাইন — একজন ইউজার একটা পোস্ট/রিপ্লাই একবারই রিপোর্ট করতে পারবে)।

### লাইভ প্রমাণ (ফিক্সের আগে)
৫টা concurrent প্রথম-রিপোর্ট রিকোয়েস্ট (একই ইউজার, একই পোস্ট) পাঠিয়ে:

```
status=201 body={"report":{...}}
status=500 body=
status=500 body=
status=500 body=
status=500 body=
```

**৪টা crash করে ৫০০ Internal Server Error** — dev log এ নিশ্চিত করা
গেছে `PrismaClientKnownRequestError P2002: Unique constraint failed on
the fields: (userId, postId)`, ForumVote বাগের সাথে হুবহু একই স্বাক্ষর।

### ফিক্স — try/catch দিয়ে P2002 handle (ForumVote এর `upsert()` চেয়ে সরল সমাধান)
ForumVote এ `upsert()` লাগত কারণ সেখানে toggle সেমান্টিক্স ছিল (একই ভোট
আবার দিলে মুছে ফেলা, ভিন্ন ভোট দিলে আপডেট করা)। কিন্তু Content Report এ
কোনো "unreport"/toggle কনসেপ্ট নেই — একবার রিপোর্ট হয়ে গেলে সেটাই
চূড়ান্ত (admin resolve/dismiss করবে, ইউজার নিজে আনরিপোর্ট করতে পারবে
না)। তাই এখানে সহজ সমাধানই যথেষ্ট: আগের pre-check `findFirst()` লজিক
সম্পূর্ণ বাদ দিয়ে সরাসরি `create()` কল করে P2002 ক্যাচ করা:

```ts
try {
  const report = await prisma.contentReport.create({ data: {...} });
  return NextResponse.json({ report }, { status: 201 });
} catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return NextResponse.json({ error: "তুমি ইতিমধ্যে এটা রিপোর্ট করেছো" }, { status: 409 });
  }
  throw err;
}
```

এটা race-condition-safe কারণ DB constraint নিজেই atomic ভাবে দ্বিতীয়
concurrent `create()` কে reject করে (P2002), আমরা শুধু সেই expected
error কে গ্রেসফুলভাবে ৪০৯ এ রূপান্তর করছি — কোনো retry loop/upsert
লাগেনি (ForumVote এর চেয়ে সরল কারণ ভিন্ন সেমান্টিক্স)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 26.6s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-content-report-race-condition.py`, ১৬টা assertion, সব PASS)
১. **মূল bug ভেরিফাই**: ৫টা concurrent প্রথম-রিপোর্টে কোনো ৫০০ error
   নেই, ঠিক ১টা ২০১ (সফল) ও বাকি ৪টা ৪০৯ (duplicate) — post টার্গেটে
২. একই concurrency টেস্ট reply টার্গেটেও (৫টা concurrent, ১টা ২০১+৪টা
   ৪০৯)
৩. Normal-flow regression: ভিন্ন ইউজার একই পোস্ট রিপোর্ট করতে পারে
   (ownership সাংঘর্ষিক না), সিরিয়াল duplicate এখনো ৪০৯ দেয়
৪. Edge case: অস্তিত্বহীন postId/replyId → ৪০৪, postId+replyId
   দুটোই/কোনোটাই না → ৪০০, অবৈধ reason → ৪০০, unauthenticated → ৪০১

### Test cleanup
`reportrace_*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। cascade
delete ভেরিফাই: `content_reports`, `forum_posts` দুটোতেই (JOIN দিয়ে)
বাকি ০টা রেকর্ড কনফার্ম করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `app/api/forum/reports/route.ts` — pre-check `findFirst()` বাদ দিয়ে
  try/catch+P2002 প্যাটার্নে rewrite
- নতুন: `scripts/test-content-report-race-condition.py`

কোনো migration লাগেনি (বিদ্যমান `ContentReport` schema/unique
constraint পুনর্ব্যবহার)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- Content Report ও ForumVote — দুটো bug fix থেকে একটা established
  reference pattern পাওয়া গেছে ভবিষ্যতের জন্য: **toggle সেমান্টিক্স
  থাকলে `upsert()`+conditional `deleteMany()` ব্যবহার করা** (ForumVote
  প্যাটার্ন), **শুধু "once only" create semantics থাকলে সরাসরি
  `create()`+P2002 catch যথেষ্ট** (ContentReport প্যাটার্ন) — দুটোই
  DB-level unique constraint কে বিশ্বাস করে, কোনো application-level
  pre-check/retry-loop এর দরকার নেই।
- কোডবেসে অন্যান্য `@@unique` constraint যুক্ত create-flow (যেমন
  `StudyGroupMember` এর `@unique userId`, `QuizBattleParticipant` এর
  `@@unique [battleId, userId]`) ইতিমধ্যে আগের capacity-race-condition
  অডিটে (`SELECT...FOR UPDATE`) কভার হয়ে গেছে — এই মুহূর্তে আর কোনো
  known-unaudited unique-constraint race pattern বাকি নেই বলে ধারণা
  করা হচ্ছে, তবে ভবিষ্যতে নতুন unique constraint যোগ হলে এই দুটো
  reference pattern মাথায় রেখে ডিজাইন করা উচিত।

---

## 🐛🔧 গুরুতর বাগ ফিক্স — Peer Note Helpful Vote Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
Content Report Race Condition ফিক্স করার পরে ব্যবহারকারী "Next" বললে
আবার একই ক্লাসের bug কোথাও বাকি আছে কিনা কোডবেসে অন্য `@@unique`
constraint যুক্ত মডেলগুলো খোঁজা হয়েছে। `NoteHelpfulVote` মডেলে
(`@@unique([noteId, userId])`) `lib/peer-notes.ts` এর
`toggleHelpfulVote()` ফাংশনে হুবহু একই ঝুঁকিপূর্ণ প্যাটার্ন পাওয়া যায় —
তবে এখানে একটা অতিরিক্ত জটিলতা ছিল: শুধু vote row না, সাথে
`Note.helpfulCount` denormalized counter-ও transaction এ sync রাখতে
হয়।

```ts
const existing = await prisma.noteHelpfulVote.findUnique({ where: { noteId_userId: {...} } });
if (existing) { /* delete vote + decrement counter (transaction) */ }
else { /* create vote + increment counter (transaction) */ } // ⚠️ race window
```

### লাইভ প্রমাণ (ফিক্সের আগে)
৫টা concurrent প্রথম-helpful-ভোট রিকোয়েস্ট (একই ইউজার, একই নোট) পাঠিয়ে:

```
status=500, status=500, status=500, status=200 (voted:true, helpfulCount:1), status=500
```

**৩টা crash করে ৫০০ Internal Server Error** — dev log এ নিশ্চিত করা
গেছে `PrismaClientKnownRequestError P2002: Unique constraint failed on
the fields: (noteId, userId)`, `lib/peer-notes.ts:92` এর
`noteHelpfulVote.create()` কল থেকে।

### ফিক্স — conditional create/delete + P2002/count-based catch (হাইব্রিড প্যাটার্ন)
ForumVote এর `upsert()` এখানে সরাসরি প্রযোজ্য না, কারণ এখানে দুটো
আলাদা টেবিল/অপারেশন transaction এ সিঙ্ক রাখতে হয় (vote row +
denormalized counter)। তাই একটা হাইব্রিড প্যাটার্ন ব্যবহার করা হয়েছে —
মূল নীতি: **counter শুধুমাত্র তখনই increment/decrement হবে যখন এই
নির্দিষ্ট request-ই আসলে vote row create/delete করতে "জিতেছে"**:

```ts
if (existing) {
  const deleted = await prisma.noteHelpfulVote.deleteMany({ where: { id: existing.id } });
  if (deleted.count > 0) {
    await prisma.note.update({ where: { id: noteId }, data: { helpfulCount: { decrement: 1 } } });
    voted = false;
  } else {
    voted = false; // অন্য concurrent request ইতিমধ্যে মুছে ফেলেছে — counter touch করা হবে না
  }
} else {
  try {
    await prisma.noteHelpfulVote.create({ data: { noteId, userId } });
    await prisma.note.update({ where: { id: noteId }, data: { helpfulCount: { increment: 1 } } });
    voted = true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      voted = true; // অন্য concurrent request ইতিমধ্যে জিতে গেছে — counter touch করা হবে না
    } else throw err;
  }
}
```

এই প্যাটার্নের মূল insight: `deleteMany()` এর affected count এবং
`create()` এর P2002 error — দুটোই ব্যবহার করা হয়েছে "এই request কি
আসলে state পরিবর্তন করতে পেরেছে" তা নির্ণয় করতে, এবং **শুধু তখনই**
counter touch করা হয় যখন সেটা true — ফলে counter ও প্রকৃত vote row
সংখ্যা কখনো diverge করে না (double-increment বা missed-decrement কোনোটাই
সম্ভব না)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 26.8s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-peer-note-helpful-vote-race-condition.py`, ১৩টা assertion, সব PASS)
১. **মূল bug ভেরিফাই**: একই ইউজারের ৫টা concurrent প্রথম-ভোটে কোনো
   ৫০০ error নেই, সব ২০০ রিটার্ন করে
২. **Counter integrity ভেরিফাই** (Python psycopg2 দিয়ে সরাসরি DB
   query করে): concurrent race এর পরে `notes.helpfulCount` ও প্রকৃত
   `note_helpful_votes` row সংখ্যা সবসময় সংগতিপূর্ণ (দুটোই সমান)
৩. **বাস্তবসম্মত multi-user race scenario** (সবচেয়ে গুরুত্বপূর্ণ
   assertion, ForumVote অডিটের একই প্যাটার্ন অনুসরণ করে): ৫ জন
   **ভিন্ন** ইউজার concurrently একই নোটে helpful vote দিলে ফাইনাল
   `helpfulCount` **ঠিক ৫** এবং প্রকৃত vote row সংখ্যাও ৫ — কোনো
   lost update/counter drift ছাড়া
৪. Edge case: অস্তিত্বহীন noteId → ৪০৪, নিজের নোটে নিজে ভোট → ৪০৩,
   unauthenticated → ৪০১, সিরিয়াল টগল normal-flow regression-free

### Test cleanup
`notehelpful_*` প্যাটার্নের সব টেস্ট ইউজার (দুই টেস্ট রান মিলিয়ে ২৪টা)
প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। cascade
delete ভেরিফাই: `note_helpful_votes`, `notes` দুটোতেই (JOIN দিয়ে) বাকি
০টা রেকর্ড কনফার্ম করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `lib/peer-notes.ts` — `toggleHelpfulVote()` conditional
  create/delete + P2002/count-based catch প্যাটার্নে rewrite
- নতুন: `scripts/test-peer-note-helpful-vote-race-condition.py`

কোনো migration লাগেনি (বিদ্যমান `NoteHelpfulVote`/`Note.helpfulCount`
schema পুনর্ব্যবহার)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- এই ফিক্স থেকে একটা তৃতীয় reference pattern পাওয়া গেছে (ForumVote এর
  `upsert()`, ContentReport এর সরাসরি `create()`+P2002 catch এর
  পাশাপাশি): **toggle সেমান্টিক্স + denormalized counter sync একসাথে
  থাকলে "conditional create/delete + P2002/affected-count-based
  catch, counter শুধু winning request-ই touch করে" প্যাটার্ন ব্যবহার
  করা উচিত**। তিনটা প্যাটার্নই DB-level unique constraint কে বিশ্বাস
  করে, কোনো application-level pre-check/retry-loop লাগে না।
- কোডবেসে আর কোনো `@@unique` constraint যুক্ত create-flow পাওয়া যায়নি
  যেটা এখনো অডিট করা হয়নি (`ForumVote`, `ContentReport`,
  `NoteHelpfulVote` — তিনটাই এখন ফিক্স করা হয়েছে; `StudyGroupMember`,
  `QuizBattleParticipant` আগের capacity-race-condition অডিটে কভার
  হয়ে গেছে; `Bookmark`, `Note` ইতিমধ্যে `upsert()` ব্যবহার করে
  নিরাপদ ছিল)।

---

## 🎙️ নতুন ফিচার — CQ Practice + Mock Exam Voice Input সম্প্রসারণ ✅ সম্পন্ন

### প্রেক্ষাপট
তিনটা race condition bug fix (Forum Vote, Content Report, Peer Note
Helpful Vote) শেষ হওয়ার পরে ব্যবহারকারী "Next" বললে কোডবেস আবার রিভিউ
করে পরবর্তী সুযোগ খোঁজা হয়েছে। বিদ্যমান Voice Input ফিচার
(`components/shared/voice-input-button.tsx`, আগের সেশনে বানানো) শুধু
AI Doubt Solver ও PDF Chat এ ইন্টিগ্রেট করা ছিল — কিন্তু কোডবেস অডিটে
দেখা যায় CQ (সৃজনশীল প্রশ্ন) Practice ও Mock Exam এর CQ অংশে ৪টা করে
লম্বা টেক্সট উত্তর (ক/খ/গ/ঘ, বিশেষ করে "গ" ও "ঘ" প্রায়ই কয়েক লাইনের
রচনামূলক উত্তর) লিখতে হয় — এটাই voice dictation এর জন্য সবচেয়ে
উচ্চ-impact জায়গা (mobile এ বাংলা টাইপ করা কষ্টসাধ্য/ধীর, বিশেষ করে
৪ নম্বরের "উচ্চতর দক্ষতা" প্রশ্নে যেখানে বিস্তারিত ব্যাখ্যা লিখতে হয়)।

### বাস্তবায়ন
বিদ্যমান `VoiceInputButton` কম্পোনেন্ট অপরিবর্তিত রেখে (কোনো নতুন
dependency/backend পরিবর্তন লাগেনি), দুটো জায়গায় ইন্টিগ্রেট করা হয়েছে:

1. **`components/cq/cq-runner.tsx`** — প্রতিটা প্রশ্নের (ক/খ/গ/ঘ) Label
   এর ঠিক পাশে (flex justify-between দিয়ে) একটা `VoiceInputButton`,
   `onResult` callback এ transcript বিদ্যমান `answers.a/b/c/d` এর সাথে
   append হয় (আগের টেক্সট থাকলে স্পেস দিয়ে জোড়া লাগানো, প্রতিস্থাপন
   না — established AI Tutor/PDF Chat প্যাটার্ন অনুসরণ করে)।
2. **`components/mock-exam/mock-exam-runner.tsx`** — একই ভিজ্যুয়াল
   প্যাটার্নে ৪টা ভয়েস বাটন যোগ। এখানে একটা কারিগরি nuance ছিল:
   বিদ্যমান `updateCqAnswer(field, value)` ফাংশন `value` সরাসরি
   **replace** করে (input onChange এর জন্য ডিজাইন করা), কিন্তু ভয়েস
   ইনপুটের জন্য **append** সেমান্টিক্স দরকার। তাই একটা নতুন হেল্পার
   ফাংশন `appendCqAnswerFromVoice(field, transcript)` যোগ করা হয়েছে
   যেটা `cqAnswers` state থেকে বর্তমান value পড়ে, transcript যোগ করে,
   তারপর সেট করে — বিদ্যমান `updateCqAnswer()` অপরিবর্তিত রেখে (input
   onChange এখনো ঠিকভাবে কাজ করে, কোনো regression নেই)।

কোনো নতুন backend endpoint/migration/dependency লাগেনি — ভয়েস থেকে
আসা transcript সাধারণ টাইপ করা টেক্সটের মতোই বিদ্যমান
`/api/cq/[cqQuestionId]/submit` ও mock-exam submit endpoint এ যায়,
ব্যাকএন্ডের কাছে input এর উৎস অদৃশ্য/অপ্রাসঙ্গিক (established design
principle, আগের Voice Input ফিচারেও একই)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 24.8s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-cq-mock-exam-voice-input.py`, ৯টা assertion, সব PASS)
sandbox এ headless browser/microphone simulation সম্ভব না হওয়ায়
(established সীমাবদ্ধতা, আগের Voice Input ফিচারের টেস্ট প্যাটার্ন
পুনর্ব্যবহার করে) নিম্নলিখিত পদ্ধতিতে ভেরিফাই করা হয়েছে:
১. CQ Practice চ্যাপ্টার পেজ (`/cq-practice/[subjectId]/[chapterId]`)
   ও Mock Exam হাব পেজ ২০০ status এ লোড হচ্ছে (component crash করেনি)
২. **Compiled JS bundle verification** — `.next/dev/static/chunks/`
   এ সরাসরি `grep` করে `SpeechRecognition` স্ট্রিং ও কম্পোনেন্টের
   বাংলা aria-label টেক্সট ("কথা বলে লেখো") উভয়ই compiled bundle এ
   পাওয়া গেছে (প্রথম টেস্ট রানে false-negative পাওয়া গিয়েছিল — ভুল
   route URL ব্যবহারের কারণে dev mode lazy-compile trigger হয়নি,
   সঠিক nested route `/cq-practice/[subjectId]/[chapterId]` ভিজিট
   করে ঠিক করা হয়েছে)
৩. **Backend flow verification** — ভয়েস input থেকে আসা টেক্সট
   simulate করে (সাধারণ string হিসেবে) বাস্তব
   `/api/cq/[cqQuestionId]/submit` endpoint এ POST করে ২০০ status ও
   `attemptId` রেসপন্স ভেরিফাই
৪. Authorization: unauthenticated `/api/cq/chapter/[chapterId]` → ৪০১

### Test cleanup
`cqvoice_*` প্যাটার্নের টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
endpoint দিয়ে ডিলিট করে cascade delete (`cq_attempts`) ভেরিফাই করা
হয়েছে।

### পরিবর্তিত ফাইল
- `components/cq/cq-runner.tsx` — ৪টা `VoiceInputButton` যোগ
- `components/mock-exam/mock-exam-runner.tsx` — ৪টা `VoiceInputButton`
  যোগ + নতুন `appendCqAnswerFromVoice()` হেল্পার
- নতুন: `scripts/test-cq-mock-exam-voice-input.py`

কোনো migration লাগেনি, কোনো নতুন npm dependency লাগেনি (browser-native
API পুনর্ব্যবহার), কোনো নতুন AI/infrastructure cost লাগেনি।

### সীমাবদ্ধতা (স্বচ্ছভাবে জানানো, আগের Voice Input ফিচারের মতোই)
- Safari/Firefox এ সীমিত সাপোর্ট, কিন্তু graceful degradation (বাটন
  hidden) থাকায় broken UI দেখাবে না
- প্রকৃত মাইক্রোফোন/speech recognition accuracy sandbox এ টেস্ট করা
  সম্ভব হয়নি — ব্যবহারকারীর নিজের ডিভাইসে actual accuracy পরীক্ষা করে
  দেখা উচিত

---

## 📕 নতুন ফিচার — মিস্টেক ভল্ট (Mistake Vault) ✅ সম্পন্ন

### গবেষণা ও প্রেক্ষাপট
CQ/Mock Exam Voice Input সম্প্রসারণের পরে ব্যবহারকারী "Next" বললে নতুন
web_search করা হয়েছে। বাংলাদেশী HSC মার্কেটে জনপ্রিয় প্রশ্ন ব্যাংক
প্ল্যাটফর্ম **SATT Academy** (`sattacademy.com`) এর FAQ রিভিউ করে একটা
সরাসরি-verified, high-demand ফিচার পাওয়া যায় — **"মিস্টেক ভল্ট"
(Mistake Vault)**: *"প্র্যাকটিস করার সময় আপনি যে প্রশ্নগুলো ভুল করবেন,
সেগুলো অটোমেটিক 'Mistake Vault'-এ জমা থাকবে। এতে করে পরীক্ষার আগে আপনার
দুর্বল জায়গাগুলো দ্রুত রিভিশন দেওয়া অনেক সহজ হয়ে যাবে।"*

**Gap analysis**: আমাদের বিদ্যমান Adaptive/Smart Practice টপিক-ভিত্তিক
দুর্বলতা মিশ্রিত প্রশ্ন সেট দেয় (correct+wrong প্রশ্ন মিশ্রিত, একই
সাথে না-দেখা গুরুত্বপূর্ণ প্রশ্নও থাকে)। কিন্তু ইউজার ইচ্ছাকৃতভাবে
*শুধু* নিজের ভুল করা প্রশ্নগুলো একসাথে, ফোকাসড রিভিশন দেওয়ার জন্য কোনো
dedicated hub আগে ছিল না — এটা genuine, প্রমাণিত demand সহ একটা নতুন
gap হিসেবে চিহ্নিত হয়।

### ডিজাইন সিদ্ধান্ত — সম্পূর্ণ schema-free, "self-healing" প্যাটার্ন
সবচেয়ে গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত: **"ভান্ডারে আছে" এর সংজ্ঞা কোনো
স্থায়ী ফ্ল্যাগ/কলাম না, বরং একটা dynamic derived state**:

> একটা প্রশ্নের *সর্বশেষ* (most recent) `QuizAttemptAnswer` যদি
> `isCorrect=false` হয়, তাহলে সেই প্রশ্ন এখনো ভান্ডারে আছে।

এই ডিজাইনের ফলে:
- কোনো নতুন migration/কলাম লাগেনি — বিদ্যমান `QuizAttemptAnswer`
  টেবিল (Practice/Adaptive/Drill/Mock Exam — যেকোনো quizType থেকে
  আসা) থেকেই সরাসরি derive করা হয়
- **স্বয়ংক্রিয় "self-healing"**: ইউজার রিভিশনে এসে সঠিক উত্তর দিলে
  একটা নতুন `QuizAttemptAnswer` (isCorrect=true) তৈরি হয় — পরের বার
  vault query তে সেই প্রশ্নের "সর্বশেষ attempt" এখন সঠিক, তাই
  স্বয়ংক্রিয়ভাবে ভান্ডার থেকে বাদ পড়ে যায়। আবার ভুল করলে আবার ভান্ডারে
  ফিরে আসে। কোনো ম্যানুয়াল "remove from vault" অ্যাকশন/API লাগে না।

### `lib/mistake-vault.ts` — কোর লজিক
`getLatestAttemptPerQuestion(userId)` — ইউজারের সব `QuizAttemptAnswer`
(createdAt ascending order এ) একবারে এনে মেমরিতে `questionId` দিয়ে
group করে, প্রতিটার জন্য সর্বশেষ `isCorrect`/`lastAttemptAt` ও মোট
`wrongCount` বের করে (একই dataset getWeakTopics()/analytics.ts এর
established in-memory-grouping প্যাটার্ন অনুসরণ করে)।

```ts
const byQuestion = new Map<string, { isCorrect: boolean; lastAttemptAt: Date; wrongCount: number }>();
for (const ans of answers) { // ascending order এ iterate
  const wrongCount = (existing?.wrongCount ?? 0) + (ans.isCorrect ? 0 : 1);
  byQuestion.set(ans.questionId, { isCorrect: ans.isCorrect, lastAttemptAt: ..., wrongCount });
  // ↑ প্রতিবার overwrite হয়, শেষে সবচেয়ে সাম্প্রতিকটাই থাকে
}
```

দুটো পাবলিক ফাংশন:
- `getMistakeVaultSummary(userId)` — মোট ভুল প্রশ্ন সংখ্যা +
  সাবজেক্ট-ভিত্তিক ভাঙন (Intro পেজের জন্য)
- `getMistakeVaultQuestions(userId, subjectCode?)` — রিভিশনের জন্য
  প্রকৃত প্রশ্ন লিস্ট (সর্বোচ্চ ৩০টা, সবচেয়ে সাম্প্রতিক ভুল আগে,
  সঠিক উত্তর/ব্যাখ্যা এক্সপোজ হয় না — established cheating-প্রতিরোধ
  প্যাটার্ন, options প্রতিবার `shuffleOptions()` দিয়ে শাফল হয়)

### API — `GET /api/mistake-vault`, `POST /api/mistake-vault/submit`
- `GET /api/mistake-vault` — সারসংক্ষেপ
- `GET /api/mistake-vault?start=true&subjectCode=PHYSICS` — রিভিশন
  প্রশ্ন লিস্ট (ঐচ্ছিক ফিল্টার)
- `POST /api/mistake-vault/submit` — Adaptive/Drill Practice এর
  established প্যাটার্নে `QuizAttempt` তৈরি (`quizType="mistake_vault"`,
  `subjectId`/`chapterId=null` কারণ মিশ্র সাবজেক্ট/চ্যাপ্টারের প্রশ্ন
  থাকতে পারে) — এই নতুন attempt এর সঠিক উত্তরগুলোই পরের query তে
  self-healing trigger করে।

### UI — Intro + Runner (২টা নতুন পেজ)
- `/mistake-vault` (`MistakeVaultIntro`) — মোট ভুল প্রশ্ন সংখ্যা,
  সাবজেক্ট-ভিত্তিক ভাঙন কার্ড (ক্লিক করে ফিল্টার সিলেক্ট করা যায়),
  খালি থাকলে celebratory "দারুণ! তোমার ভল্ট খালি" state
- `/mistake-vault/run` (`MistakeVaultRunner`) — `components/practice/
  quiz-runner.tsx` এর নিজের-গতিতে-উত্তর-দেওয়া প্যাটার্ন অনুসরণ করে
  (drill-runner এর টাইমার এখানে নেই — এটা রিভিশন, speed-test না),
  প্রতিটা প্রশ্নে `wrongCount > 1` হলে "X বার ভুল হয়েছে" ব্যাজ দেখায়
  (severity সংকেত)
- **Practice Result পেজ পুনর্ব্যবহার**: `mistake_vault` quizType এর
  জন্য `retryLink`/`retryLabel` যোগ করা হয়েছে (`app/(dashboard)/
  practice/result/[attemptId]/page.tsx`) — Wrong-Answer→Flashcard
  কনভার্টার বাটনও স্বয়ংক্রিয়ভাবে কাজ করে (chapterId=null এ আগে থেকেই
  nullable-safe fallback "ভুল উত্তর — প্র্যাকটিস" ডেক নাম ছিল)
- Dashboard এ নতুন মডিউল কার্ড ("মিস্টেক ভল্ট", rose/red gradient)

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 24.4s" — নতুন
  `/api/mistake-vault`, `/api/mistake-vault/submit`, `/mistake-vault`,
  `/mistake-vault/run` রুট বান্ডেলে ভেরিফাই
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-mistake-vault-feature.py`, ২১টা + পেজ-লোড ৩টা, সব PASS)
১. Fresh user → `totalCount=0` (খালি ভল্ট)
২. বাস্তব `/api/practice/start`+`/api/practice/submit` দিয়ে একটা real
   Chemistry চ্যাপ্টারে (১১টা প্রশ্ন) ৩টা প্রশ্নে ইচ্ছাকৃতভাবে ভুল
   উত্তর দিয়ে — `GET /api/mistake-vault` summary তে ঠিক সেই ৩টা প্রশ্ন
   গণনা হচ্ছে, `bySubject` তে CHEMISTRY দেখাচ্ছে যাচাই
৩. `GET /api/mistake-vault?start=true` এ ইচ্ছাকৃতভাবে ভুল করা ৩টা
   প্রশ্নই vault এ আছে ভেরিফাই, এবং `correctAnswer`/`explanation`
   ফিল্ড ক্লায়েন্টে এক্সপোজ হয়নি (cheating-প্রতিরোধ) ভেরিফাই
৪. **self-healing মূল ডিজাইন ভেরিফাই** (সবচেয়ে গুরুত্বপূর্ণ অংশ):
   Python psycopg2 দিয়ে সরাসরি DB থেকে সঠিক উত্তর বের করে, ৩টা ভুল
   প্রশ্নের মধ্যে ২টাতে রিভিশনে সঠিক উত্তর ও ১টাতে আবার ভুল উত্তর দিয়ে
   `/api/mistake-vault/submit` কল করা হয় — এরপর আবার
   `/api/mistake-vault?start=true` কল করে ভেরিফাই করা হয়েছে যে সঠিক
   উত্তর দেওয়া ২টা প্রশ্ন এখন আর ভল্টে নেই, কিন্তু যেটাতে আবার ভুল
   করা হয়েছে সেটা এখনো ভল্টে আছে — **সম্পূর্ণ pass**
৫. `subjectCode` ফিল্টার সঠিকভাবে কাজ করছে (CHEMISTRY ফিল্টারে সব
   ফলাফল CHEMISTRY), ভুল সাবজেক্ট ফিল্টারে (PHYSICS, যেখানে কোনো ভুল
   প্রশ্ন নেই) খালি লিস্ট রিটার্ন করে (crash না)
৬. Authorization: unauthenticated `GET`/`POST` উভয়ে ৪০১, খালি
   `answers` array এ ৪০০
৭. পেজ-লোড টেস্ট (আলাদা script): Dashboard এ মিস্টেক ভল্ট শর্টকাট
   কার্ড উপস্থিত, `/mistake-vault` হোম পেজ ২০০ status এ লোড

### Test cleanup
`mistakevault_*`/`mvpage_*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। cascade
delete ভেরিফাই: `quiz_attempts` টেবিলে (JOIN দিয়ে) বাকি ০টা রেকর্ড
কনফার্ম করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `lib/mistake-vault.ts`
- নতুন: `app/api/mistake-vault/route.ts`
- নতুন: `app/api/mistake-vault/submit/route.ts`
- নতুন: `app/(dashboard)/mistake-vault/page.tsx`
- নতুন: `app/(dashboard)/mistake-vault/run/page.tsx`
- নতুন: `components/practice/mistake-vault-intro.tsx`
- নতুন: `components/practice/mistake-vault-runner.tsx`
- `app/(dashboard)/practice/result/[attemptId]/page.tsx` —
  `mistake_vault` quizType এর জন্য retryLink/retryLabel যোগ
- `app/(dashboard)/dashboard/page.tsx` — নতুন মডিউল কার্ড যোগ
- নতুন: `scripts/test-mistake-vault-feature.py`

কোনো migration লাগেনি (সম্পূর্ণ schema-free), কোনো নতুন AI/
infrastructure cost লাগেনি।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- `MAX_VAULT_QUESTIONS = 30` — একবারে সর্বোচ্চ ৩০টা প্রশ্ন রিভিশনে
  দেখানো হয় (সাম্প্রতিকতম ভুল অগ্রাধিকার পায়), যদি কোনো ইউজারের ৩০টার
  বেশি ভুল প্রশ্ন জমা হয় তাহলে বাকিগুলো পরের সেশনে দেখা যাবে (কোনো
  pagination নেই এই মুহূর্তে) — বর্তমান প্রশ্ন ব্যাংকের আকারে
  (~২০০টা+ প্রশ্ন) এটা যথেষ্ট, ভবিষ্যতে কনটেন্ট অনেক বাড়লে
  pagination যোগ করা যায়
- `getLatestAttemptPerQuestion()` ইউজারের **সব** attempt একবারে মেমরিতে
  আনে (কোনো date-range limit নেই) — বর্তমান স্কেলে (personal-use
  platform, প্রতি ইউজারের attempt সংখ্যা সীমিত) দ্রুত, কিন্তু বছরের পর
  বছর ব্যবহারে ডেটাসেট অনেক বড় হলে ভবিষ্যতে date-range limit (যেমন
  "শেষ ৬ মাসের attempt") যোগ করার প্রয়োজন হতে পারে

---

## 🐛🔧 গুরুতর বাগ ফিক্স — Habit Tracker Toggle Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
Mistake Vault ফিচার শেষ হওয়ার পরে ব্যবহারকারী "Next" বললে কোডবেসে বাকি
`@@unique` constraint যুক্ত মডেল আবার অডিট করা হয়েছে
(`grep -n "@@unique" prisma/schema.prisma`)। `HabitLog` মডেলে
(`@@unique([habitId, date])`, Habit Tracker ফিচারের একই-দিনে-দুইবার-
লগ-আটকানোর জন্য) `lib/habit-tracker.ts` এর `toggleHabitToday()`
ফাংশনে হুবহু ForumVote/ContentReport/NoteHelpfulVote এর মতো একই
ঝুঁকিপূর্ণ প্যাটার্ন পাওয়া যায় — `findUnique()` দিয়ে existing log চেক
করে আলাদা create/delete + `Habit.currentStreak`/`longestStreak`/
`lastLoggedAt` read-then-write আপডেট। এখানে জটিলতা আরেকটু বেশি ছিল
কারণ streak গণনায় gap-based logic (yesterday check) জড়িত।

### লাইভ প্রমাণ (ফিক্সের আগে)
৫টা concurrent প্রথম-টগল রিকোয়েস্ট (একই ইউজার, একই habit) পাঠিয়ে:

```
status=500, status=500, status=500, status=500, status=200 (loggedToday:true, currentStreak:1)
```

**৪টা crash করে ৫০০ Internal Server Error** — dev log এ নিশ্চিত করা
গেছে `PrismaClientKnownRequestError P2002: Unique constraint failed on
the fields: (habitId, date)`, `lib/habit-tracker.ts:134` এর
`habitLog.create()` কল থেকে।

### ফিক্স ইটারেশন — Study Group/Quiz Battle Capacity এর established row-lock প্যাটার্ন
এখানে ForumVote এর `upsert()` বা Peer Note এর হাইব্রিড
create/delete+catch প্যাটার্ন সরাসরি প্রযোজ্য ছিল না, কারণ streak গণনা
জটিল conditional logic (gap-days-based branching) জড়িত — শুধু vote
row+simple counter increment/decrement না। তাই Study Group/Quiz Battle
Capacity Race Condition ফিক্সের established `SELECT ... FOR UPDATE`
row-lock প্যাটার্ন প্রয়োগ করা হয়েছে:

```ts
return prisma.$transaction(async (tx) => {
  const locked = await tx.$queryRaw<...>`
    SELECT id, "userId", "currentStreak", "longestStreak", "lastLoggedAt"
    FROM "habits" WHERE id = ${habitId} FOR UPDATE
  `;
  const habit = locked[0];
  // ... পুরো existing-log-check + create/delete + streak-update
  // লজিক এখন tx এর ভেতরে, একই habit এ concurrent request গুলো
  // serialize হয়ে যায়
}, { maxWait: 10000, timeout: 10000 });
```

**dev sandbox connection pool এ নতুন শেখা**: প্রথম চেষ্টায় ডিফল্ট
`$transaction()` timeout (৫ সেকেন্ড) ব্যবহার করায় row-lock
serialize হওয়া ৫টা concurrent transaction এর মধ্যে একটা `P2028
"Unable to start a transaction in the given time"` error দিয়েছিল
(established connection pool সীমাবদ্ধতা, মাত্র ৩টা connection, এখানে
নতুনভাবে transaction serialization এর সাথে মিলে timeout ঘটেছে)। ফিক্স:
`maxWait`/`timeout` উভয়ই ১০ সেকেন্ডে বাড়ানো হয়েছে — production এ larger
connection pool এ এই মান আরও conservative/নিরাপদ থাকবে।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 27.9s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-habit-toggle-race-condition.py`, ১৩টা assertion, সব PASS)
১. **মূল bug ভেরিফাই**: একই ইউজারের একই habit এ ৫টা concurrent
   প্রথম-টগলে কোনো ৫০০ error নেই, সব ২০০ রিটার্ন করে
২. **Streak integrity ভেরিফাই**: সিরিয়ালাইজেশনের ফলে প্রতিটা toggle
   আগেরটার বিপরীত করায় সব সফল response এ `currentStreak` সবসময় বৈধ
   (0 বা 1, over-increment নেই) — `GET /api/habits` দিয়ে ground-truth
   DB state ও ক্রস-ভেরিফাই করা হয়েছে
৩. **Row-level lock ভেরিফাই** (সবচেয়ে গুরুত্বপূর্ণ architectural
   assertion — table-level সিরিয়ালাইজেশন না তা নিশ্চিত করতে): ৩ জন
   ভিন্ন ইউজারের ৩টা সম্পূর্ণ ভিন্ন habit এ concurrent টগল করে সময়
   মাপা হয়েছে — সবগুলো দ্রুত (৮ সেকেন্ডের কম) সম্পন্ন হয়েছে, প্রমাণ করে
   যে lock শুধু নির্দিষ্ট habit row কে block করে, পুরো `habits` টেবিল
   না
৪. সিরিয়াল ৫ বার টগল (normal flow, race না) — সঠিক alternating
   প্যাটার্ন (true→false→true→false→true), শেষে currentStreak=1,
   regression-free
৫. Authorization/ownership: অন্য ইউজারের habit টগল করার চেষ্টা → ৪০৩,
   অস্তিত্বহীন habitId → ৪০৪, unauthenticated → ৪০১

### Test cleanup
`habitrace*` প্যাটার্নের সব টেস্ট ইউজার (মূল টেস্ট রান + comprehensive
টেস্ট রান মিলিয়ে ১৪টা) প্রকৃত `/api/user/delete-account` endpoint দিয়ে
ডিলিট করা হয়েছে। cascade delete ভেরিফাই: `habits`, `habit_logs`
দুটোতেই (JOIN দিয়ে) বাকি ০টা রেকর্ড কনফার্ম করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `lib/habit-tracker.ts` — `toggleHabitToday()` সম্পূর্ণ `SELECT ...
  FOR UPDATE` row-lock transaction প্যাটার্নে rewrite
- নতুন: `scripts/test-habit-toggle-race-condition.py`

কোনো migration লাগেনি (বিদ্যমান `Habit`/`HabitLog` schema/unique
constraint পুনর্ব্যবহার — শুধু query-level পরিবর্তন)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- চতুর্থ bug fix হিসেবে এই সিরিজ থেকে একটা স্পষ্ট decision-tree তৈরি
  হয়েছে ভবিষ্যতের জন্য: **(ক) শুধু simple toggle (row create/delete)
  হলে `upsert()`** (ForumVote), **(খ) শুধু "once only" create হলে
  `create()`+P2002 catch** (ContentReport), **(গ) toggle + denormalized
  simple counter (increment/decrement) হলে conditional create/delete
  + count/P2002-based catch** (NoteHelpfulVote), **(ঘ) toggle +
  জটিল conditional/gap-based state calculation (streak এর মতো) হলে
  `SELECT...FOR UPDATE` row-lock transaction** (Habit Tracker, এবং
  আগের Study Group/Quiz Battle Capacity)। এই চারটা প্যাটার্নই DB-level
  primitive (unique constraint বা row lock) কে বিশ্বাস করে, কোনো
  application-level retry-loop লাগে না।
- এই মুহূর্তে schema তে থাকা সব `@@unique` constraint (ForumVote,
  ContentReport, NoteHelpfulVote, HabitLog, StudyGroupMember,
  QuizBattleParticipant — বাকিগুলো আগেই কভার হয়ে গেছে, Bookmark/Note
  ইতিমধ্যে `upsert()` নিরাপদ ছিল, UserBadge/Subject.code+paper
  কখনো concurrent-conflict-prone user-facing endpoint থেকে আসে না)
  পূর্ণাঙ্গভাবে অডিট করা হয়ে গেছে।

---

## 🐛🔧 গুরুতর বাগ ফিক্স — Quiz Duel Join Capacity Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
Habit Tracker Toggle Race Condition ফিক্স করার পরে ব্যবহারকারী "Next"
বললে বাকি "capacity/state-transition" ধরনের race condition খুঁজতে
multiplayer ফিচারগুলো (যেগুলোতে "slot"/"capacity" ধারণা আছে) আবার
রিভিউ করা হয়েছে — Study Group ও Quiz Battle এ আগেই এই ক্লাসের bug
ফিক্স হয়েছিল (`joinStudyGroup()`, `joinQuizBattle()` — `SELECT...FOR
UPDATE` দিয়ে), কিন্তু একই প্যাটার্নের **Quiz Duel** কখনো অডিট করা
হয়নি। `lib/quiz-duel.ts` এর `joinDuel()` ফাংশনে দেখা যায় হুবহু একই
read-then-write ঝুঁকি:

```ts
const duel = await prisma.quizDuel.findUnique({ where: { id: duelId } });
if (duel.status !== "WAITING") throw new Error(...);
const updated = await prisma.quizDuel.update({
  where: { id: duelId },
  data: { opponentId: userId, status: "ACTIVE", startedAt: new Date() },
}); // ⚠️ race window — concurrent request সবাই stale "WAITING" দেখতে পারে
```

### লাইভ প্রমাণ (ফিক্সের আগে)
একটা WAITING duel এ ৫ জন **ভিন্ন** ইউজার concurrently join করার
চেষ্টা করে:

```
status=200 (opponentId=user_A), status=200 (opponentId=user_B),
status=200 (opponentId=user_C), status=200 (opponentId=user_D),
status=200 (opponentId=user_E)
```

**সবাই ২০০ সফল রেসপন্স পেয়েছে** (শেষ database write জিতেছে, কিন্তু
প্রতিটা request-ই caller কে সফল বলে জানিয়েছে) — opponent slot মাত্র
১টা হওয়া সত্ত্বেও প্রত্যাশিত ছিল ঠিক ১ জন সফল হবে, বাকি ৪ জন "এই Duel
এ আর যোগ দেওয়া যাবে না" error পাবে। এটা Study Group এর maxMembers=2
সেট করে ৫ জন joiner দিয়ে সবাই সফল হওয়ার (member count ৬) বাগের সাথে
হুবহু একই severity ও প্রকৃতির।

### ফিক্স — single-field atomic conditional update (Forum Best Answer XP fix এর সহজ প্যাটার্ন)
Study Group/Habit Tracker এর ভারী `SELECT...FOR UPDATE` row-lock এখানে
প্রয়োজন ছিল না, কারণ এটা multi-row capacity count চেক না (যেমন
`memberCount >= maxMembers`), বরং একটা সহজ single-field boolean-like
স্টেট চেক (`status === "WAITING"`)। তাই সবচেয়ে সরল established
প্যাটার্ন (Forum Best Answer XP fix এর atomic `updateMany` প্যাটার্ন)
যথেষ্ট ও যথাযথ:

```ts
const claimResult = await prisma.quizDuel.updateMany({
  where: { id: duelId, status: "WAITING" },
  data: { opponentId: userId, status: "ACTIVE", startedAt: new Date() },
});
if (claimResult.count === 0) {
  throw new Error("এই Duel এ আর যোগ দেওয়া যাবে না");
}
```

Postgres এই conditional `UPDATE` কে row-level lock নিয়ে atomic ভাবে
execute করে — দুটো concurrent request একই duel এ একসাথে এলেও একটাই
matched হবে (`count=1`), বাকিগুলোর `WHERE` condition আর ম্যাচ করবে না
(`count=0`)।

### Bonus consistency ফিক্স — `cancelDuel()`
একই ফাইলে `cancelDuel()` এও রিভিউ করে একটা সম্পর্কিত ঝুঁকি পাওয়া যায়:
আগে blind `update({ data: { status: "EXPIRED" } })` দিয়ে সরাসরি সেট
করা হতো — owner cancel করার ঠিক সেই মুহূর্তে অন্য কেউ concurrently
join করে ফেললে (join জিতে গিয়ে `status="ACTIVE"`+real `opponentId`
সেট হয়ে গেলেও), cancel এর blind update সেটাকে ভুলভাবে আবার "EXPIRED"
করে দিতে পারতো — ফলে একটা ACTIVE game state (বাস্তব opponent সহ)
থাকা সত্ত্বেও EXPIRED দেখাতো (উভয় খেলোয়াড়ের জন্য confusing/broken
অবস্থা)। এখন একই atomic conditional `updateMany({ where: { id,
status: "WAITING" } })` প্যাটার্নে ফিক্স করা হয়েছে — cancel শুধু তখনই
সফল হয় যখন duel এখনো সত্যিই WAITING অবস্থায় আছে।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 24.5s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-quiz-duel-join-race-condition.py`, ১১টা assertion, সব PASS)
১. **মূল bug ভেরিফাই**: ৫ জন ভিন্ন ইউজারের concurrent joinএ ঠিক ১ জন
   সফল (২০০), বাকি ৪ জন সুন্দর ৪০০ error (crash না) — `GET /api/duel/
   [duelId]` দিয়ে DB ground-truth ভেরিফাই (status=ACTIVE,
   opponentId সেট)
২. সিরিয়াল একক join (normal flow, race না) — regression-free
৩. Edge case: নিজের তৈরি duel এ নিজে join করার চেষ্টা → ৪০০
৪. **`cancelDuel()` race condition ভেরিফাই** (বোনাস ফিক্স): owner
   cancel ও অন্য ইউজারের join ঠিক concurrently trigger করে — দুটোর
   মধ্যে ঠিক একটাই সফল হয় (both-succeed inconsistency নেই), চূড়ান্ত
   duel state সবসময় সংগতিপূর্ণ (join জিতলে ACTIVE+opponentId সেট,
   cancel জিতলে EXPIRED — কখনো corrupted/mixed state না)
৫. Authorization: unauthenticated join → ৪০১

### Test cleanup
`duelrace_*` প্যাটার্নের সব টেস্ট ইউজার (মূল + comprehensive টেস্ট রান
মিলিয়ে ৪০টা) প্রকৃত `/api/user/delete-account` endpoint দিয়ে ডিলিট
করা হয়েছে। cascade delete ভেরিফাই: `quiz_duels` টেবিলে (challenger
হিসেবে, JOIN দিয়ে) বাকি ০টা রেকর্ড কনফার্ম করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `lib/quiz-duel.ts` — `joinDuel()` ও `cancelDuel()` উভয়ই atomic
  `updateMany()` conditional প্যাটার্নে rewrite
- নতুন: `scripts/test-quiz-duel-join-race-condition.py`

কোনো migration লাগেনি (বিদ্যমান `QuizDuel.status` enum পুনর্ব্যবহার —
শুধু query-level পরিবর্তন)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- এই ফিক্স নিশ্চিত করে যে established decision-tree এর "single-field
  atomic conditional update" শাখা (Forum Best Answer XP fix থেকে
  উদ্ভূত) শুধু XP-award এ না, capacity/slot-claiming ধরনের সমস্যাতেও
  প্রযোজ্য যখন multi-row count চেক লাগে না — শুধু single boolean-like
  স্টেট ট্রানজিশন (`WAITING`→`ACTIVE`) যথেষ্ট।
- Quiz Duel এর `submitDuelAnswers()`/`finalizeDuel()` আগের XP race
  condition অডিটেই প্রতিরোধমূলকভাবে ফিক্স করা হয়েছিল — এই সেশনে সেই
  অংশে নতুন কিছু পরিবর্তন হয়নি, শুধু join/cancel flow।
- Multiplayer ফিচারগুলোর (Study Group, Quiz Battle, Quiz Duel) মধ্যে
  Quiz Duel-ই ছিল সর্বশেষ বাকি থাকা, এখন সবগুলোর capacity/state-
  transition race condition অডিট সম্পূর্ণ।

---

## 🔔 নতুন ফিচার — Mistake Vault Reminder Card (Dashboard) ✅ সম্পন্ন

### প্রেক্ষাপট
Quiz Duel Join Capacity Race Condition ফিক্স করার পরে (multiplayer
capacity race condition audit সিরিজ সম্পূর্ণ হওয়ার পরে) ব্যবহারকারী
"Next" বললে নতুন দিক খোঁজা হয়েছে। Mistake Vault ফিচারের
discoverability রিভিউ করার সময় দেখা যায় বিদ্যমান **Review Queue Card**
(Flashcard due reminder, Dashboard এ prominently দেখায়) এর মতো কোনো
সমতুল্য reminder Mistake Vault এর জন্য ছিল না — শুধু Dashboard এর
মডিউল গ্রিডে একটা সাধারণ কার্ড ছিল (অন্য সব মডিউলের মতোই স্ট্যাটিক,
কোনো urgency/count signal ছাড়া)। যেহেতু Mistake Vault এর মূল ভ্যালু
প্রপোজিশনই হলো "ভুল প্রশ্ন জমা হয়ে যাচ্ছে, রিভিশন দাও" — এই তথ্যটা
প্যাসিভ মডিউল গ্রিডে চাপা পড়ে না গিয়ে prominently দেখানো উচিত।

### বাস্তবায়ন — Review Queue Card এর established প্যাটার্ন পুনর্ব্যবহার
`components/dashboard/mistake-vault-reminder-card.tsx` — Review Queue
Card এর হুবহু একই ডিজাইন দর্শন:
- **Server Component** (dashboard page ইতিমধ্যেই Server Component,
  কোনো client-side fetch লাগে না)
- **Conditional render** — `summary.totalCount === 0` হলে `null`
  রিটার্ন করে সম্পূর্ণ লুকানো (UI clutter এড়াতে, established pattern)
- বিদ্যমান `getMistakeVaultSummary()` (Mistake Vault ফিচারেই আগে থেকে
  তৈরি) সরাসরি পুনর্ব্যবহার — **কোনো নতুন query/migration লাগেনি**
- মোট ভুল প্রশ্ন সংখ্যা + সবচেয়ে বেশি ভুল থাকা সাবজেক্ট (bySubject[0])
  দেখায়, ক্লিক করলে `/mistake-vault` এ নিয়ে যায়

Dashboard এ mount করা হয়েছে Review Queue Card এর ঠিক পরে (একই ধরনের
"due/pending action needed" reminder card গুলো একসাথে গ্রুপ করে
রাখা — visual hierarchy তে সামঞ্জস্য বজায় রাখতে)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 24.3s"
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-mistake-vault-reminder-card.py`, ৭টা assertion, সব PASS)
১. Fresh user এ Dashboard লোড করে reminder টেক্সট ("ভুল প্রশ্ন অপেক্ষা
   করছে") সম্পূর্ণ অনুপস্থিত ভেরিফাই (খালি ভল্টে hidden আচরণ)
২. বাস্তব `/api/practice/start`+`/api/practice/submit` দিয়ে একটা real
   Chemistry চ্যাপ্টারে ৩টা প্রশ্নে ইচ্ছাকৃতভাবে ভুল করার পরে Dashboard
   পেজ আবার লোড করে reminder টেক্সট ও সঠিক সাবজেক্ট বাংলা নাম
   ("রসায়ন") উভয়ই HTML এ উপস্থিত ভেরিফাই (server-rendered HTML সরাসরি
   grep করে — established page-load test প্যাটার্ন)

### Test cleanup
`mvreminder_*` প্যাটার্নের টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
endpoint দিয়ে ডিলিট করে cascade delete (`quiz_attempts`) ভেরিফাই করা
হয়েছে — শূন্য বাকি।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `components/dashboard/mistake-vault-reminder-card.tsx`
- `app/(dashboard)/dashboard/page.tsx` — `MistakeVaultReminderCard`
  mount, `getMistakeVaultSummary()` import+call যোগ
- নতুন: `scripts/test-mistake-vault-reminder-card.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি, কোনো নতুন AI cost
লাগেনি — সম্পূর্ণ বিদ্যমান Mistake Vault ইনফ্রাস্ট্রাকচার পুনর্ব্যবহার।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- এই ছোট UX polish ফিচারের মাধ্যমে একটা established প্যাটার্ন আরও
  একবার নিশ্চিত করা হলো: **নতুন কোনো "queue/backlog" ধরনের ফিচার
  (যেখানে ইউজারের pending action আছে) বানানোর পরে সবসময় Dashboard এ
  একটা conditional reminder card যোগ করা উচিত** (Review Queue Card,
  এখন Mistake Vault Reminder Card — দুটোই একই প্যাটার্ন)। ভবিষ্যতে
  এই ধরনের নতুন ফিচার এলে একই প্যাটার্ন সরাসরি reuse করা যাবে।
- একাধিক reminder card একসাথে দেখানো হলে (যেমন Review Queue + Mistake
  Vault + Today's Focus + Weekly Recap সবগুলো একসাথে সক্রিয় থাকলে)
  Dashboard কিছুটা লম্বা হয়ে যেতে পারে — বর্তমানে কোনো collapse/priority
  ordering মেকানিজম নেই, কিন্তু যেহেতু প্রতিটাই conditional (প্রাসঙ্গিক
  না হলে hidden), বাস্তবে সাধারণত একসাথে সবগুলো active থাকার সম্ভাবনা
  কম। ভবিষ্যতে যদি UX feedback এ ভিড় মনে হয়, একটা "notification
  stack"/carousel প্যাটার্নে consolidate করা যায়।

---

## 🤖 নতুন ফিচার — AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake) ✅ সম্পন্ন

### গবেষণা ও প্রেক্ষাপট
Mistake Vault Reminder Card ফিচার শেষ হওয়ার পরে ব্যবহারকারী "Next"
বললে নতুন web_search করা হয়েছে। **Duolingo এর ২০২৬ সালের strategy
রিভিউ** থেকে একটা গুরুত্বপূর্ণ insight পাওয়া যায়: *"Ever wondered why
you were wrong? Previously, Duolingo's lack of grammar explanations
was its biggest flaw. Now, the 'Explain My Answer' feature—powered by
AI—provides a personalized breakdown of your mistakes."* — অর্থাৎ
generic/static feedback থেকে AI-powered personalized mistake analysis
এ shift করা এখন industry-এ একটা প্রমাণিত, উচ্চ-impact প্যাটার্ন।

**Gap analysis**: আমাদের `Question.explanation` ফিল্ড একটা static,
admin-written টেক্সট — সবার জন্য একই, ইউজারের নির্দিষ্ট ভুল উত্তর কী
ছিল তা address করে না। উদাহরণস্বরূপ, একটা প্রশ্নে যদি ৩টা ভুল অপশন
থাকে, প্রতিটা ভুল অপশনের পেছনে ভিন্ন misconception থাকতে পারে — কিন্তু
static explanation শুধু "সঠিক উত্তর এটা কারণ..." বলে, ইউজার *কেন*
নির্দিষ্ট ভুল অপশনটা বেছে নিয়েছিল তা ব্যাখ্যা করে না। এটা একটা genuine
personalization gap যেটা AI দিয়ে সহজেই পূরণ করা যায় (আমাদের কাছে
ইতিমধ্যে multi-provider AI fallback chain আছে)।

### বাস্তবায়ন — সম্পূর্ণ on-demand, schema-free ডিজাইন
`lib/mistake-explainer.ts` — বিদ্যমান `getAIResponse()` (multi-provider
fallback: Groq→Mistral→Cerebras→OpenRouter) পুনর্ব্যবহার করে একটা নতুন
system prompt দিয়ে:

```
১. সংক্ষেপে ব্যাখ্যা করো কেন তার দেওয়া উত্তরটা ভুল (নির্দিষ্ট ভুল
   উত্তর ধরে)
২. এই ধরনের ভুল সাধারণত কোন misconception এর কারণে হয়
৩. সঠিক ধারণাটা মনে রাখার একটা সহজ টিপস
```

**ডিজাইন সিদ্ধান্ত — কেন cache করা হয়নি**: প্রতিটা ভুল উত্তরের জন্য
ইউজার সাধারণত একবারই এই বাটনে ক্লিক করবে (Practice Result পেজ দেখার
সময়), তাই caching/persistence এর ROI কম — একটা নতুন DB কলাম/টেবিল
যোগ করার জটিলতার চেয়ে প্রতিবার fresh AI call করা সহজ ও যথেষ্ট। এটা
সম্পূর্ণ **on-demand** (স্বয়ংক্রিয় না) — শুধু ইউজার বাটনে ক্লিক করলেই
AI call হয়, ফলে AI cost/latency শুধু actual usage তেই খরচ হয়।

### API — `POST /api/practice/answers/[answerId]/explain`
`QuizAttemptAnswer.id` দিয়ে সরাসরি lookup করে (`quizAttempt.userId`
দিয়ে ownership যাচাই — established pattern, P2025 audit থেকে শেখা
existence-check-before-access)। সঠিক উত্তরে (`isCorrect=true`) explain
চাওয়া হলে ৪০০ রিটার্ন করে (ব্যাখ্যা করার কিছু নেই)। AI call ব্যর্থ
হলে ৫০২ (Bad Gateway, established convention অন্যান্য AI-dependent
endpoint এর মতো)।

### UI — `components/practice/explain-mistake-button.tsx`
Practice Result পেজে প্রতিটা ভুল উত্তরের নিচে (static explanation এর
পরে) একটা "AI দিয়ে ব্যাখ্যা বুঝি" ছোট ghost বাটন। ক্লিক করলে loading
state ("AI ভাবছে...") দেখায়, রেসপন্স পেলে inline card এ (ইন্ডিগো রঙের
থিম, `Sparkles` আইকন সহ) ব্যাখ্যা দেখায় — একবার লোড হয়ে গেলে আবার
ক্লিক করলে দ্বিতীয়বার API কল হয় না (`if (loading || explanation)
return`)।

### tsc/build/lint checkpoint
- `pnpm exec tsc --noEmit` ✅ ক্লিন পাস
- `pnpm build` ✅ "Compiled successfully in 26.1s" — নতুন
  `/api/practice/answers/[answerId]/explain` রুট বান্ডেলে ভেরিফাই
- `echo "" | pnpm lint` ✅ ক্লিন

### Live Test (`scripts/test-explain-mistake-feature.py`, ১১টা assertion, সব PASS)
১. বাস্তব `/api/practice/start`+`/api/practice/submit` দিয়ে একটা real
   Chemistry চ্যাপ্টারে ইচ্ছাকৃতভাবে ভুল উত্তর তৈরি করে, DB থেকে সেই
   answer এর id বের করে `POST /api/practice/answers/[answerId]/explain`
   কল করে ২০০ status + non-empty explanation + provider নাম ভেরিফাই
২. **প্রকৃত AI রেসপন্স manually রিভিউ করা হয়েছে** (শুধু status code
   না, actual content quality) — উদাহরণ রেসপন্স: *"তোমার দেওয়া উত্তরটা
   ভুল কারণ তুমি সম্ভবত কার্বোহাইড্রেট বা অন্য কিছু বলেছ... এই ধরনের
   ভুল সাধারণত জৈব যৌগের ধরণ সম্পর্কে ভুল ধারণার কারণে হয়... হাইড্রো
   মানে হাইড্রোজেন এবং কার্বন মানে কার্বন, তাই শুধু এই দুটি পরমাণু
   দিয়ে গঠিত যৌগই হাইড্রোকার্বন।"* — প্রাসঙ্গিক, বাংলায়, সংক্ষিপ্ত,
   প্রম্পটের ৩-ধাপের কাঠামো অনুসরণ করেছে
৩. সঠিক উত্তরে explain চাওয়া → ৪০০
৪. Edge case: অস্তিত্বহীন answerId → ৪০৪
৫. Authorization: অন্য ইউজারের answer explain করার চেষ্টা → ৪০৪
   (ownership leak প্রতিরোধ ভেরিফাই), unauthenticated → ৪০১

### Test cleanup
`explainmistake*`/`explainpreview*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। cascade
delete ভেরিফাই: `quiz_attempts` টেবিলে বাকি ০টা রেকর্ড কনফার্ম করা
হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `lib/mistake-explainer.ts`
- নতুন: `app/api/practice/answers/[answerId]/explain/route.ts`
- নতুন: `components/practice/explain-mistake-button.tsx`
- `app/(dashboard)/practice/result/[attemptId]/page.tsx` —
  `ExplainMistakeButton` প্রতিটা ভুল উত্তরের নিচে যোগ
- নতুন: `scripts/test-explain-mistake-feature.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি (বিদ্যমান
multi-provider AI chain পুনর্ব্যবহার), কোনো নতুন infrastructure লাগেনি।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **শুধু Practice Result পেজে** (regular MCQ practice, quizType
  independent — practice/adaptive/drill/mistake_vault সব কাজ করবে
  কারণ সবাই `QuizAttemptAnswer` টেবিল শেয়ার করে) — Mock Exam/Live
  Exam/Admission এর ভুল উত্তরে এখনো এই বাটন নেই (আলাদা attempt মডেল
  ব্যবহার করে, Wrong-Answer→Flashcard কনভার্টারেরও একই সীমাবদ্ধতা
  আগে থেকেই ছিল) — ভবিষ্যতে চাইলে একই প্যাটার্নে সম্প্রসারণ করা যায়।
- **CQ (সৃজনশীল প্রশ্ন) এ প্রযোজ্য না** — CQ এর evaluation ইতিমধ্যেই
  AI-generated personalized feedback দেয় (`lib/cq-evaluator.ts`),
  তাই এই ফিচার শুধু MCQ এর জন্যই প্রাসঙ্গিক (যেখানে আগে শুধু static
  explanation ছিল)।
- **No caching** — প্রতিটা ক্লিকে fresh AI call হয় (component state এ
  ক্যাশ করা থাকে যতক্ষণ পেজ খোলা, কিন্তু পেজ রিফ্রেশ করলে আবার call
  হবে) — ইচ্ছাকৃত trade-off, ব্যবহারের ফ্রিকোয়েন্সি কম থাকায় acceptable।

---

## UI/UX বড় রিডিজাইন — Sidebar Navigation + উজ্জ্বল Dark Mode (২০২৬-০৭-২০)

### প্রেক্ষাপট
ব্যবহারকারী আগে একটা static HTML mockup (`dashboard-preview.html`)
রিভিউ করে পছন্দ করেছিলেন, তারপর "KOro" (করো) বলে actual কোডে
implement করার নির্দেশ দেন। mockup এ প্রস্তাবিত ২টা পরিবর্তন এখন পুরোপুরি
বাস্তবায়ন করা হয়েছে:

ব্যবহারকারীর মূল ফিডব্যাক (Banglish, verbatim): *"Tools gula side bar a
rakba jate full professional hoi ar dark mode aro valo koro brightness
ta barao onek kisu valo vabe dakha jai na onek lakha oigulao thik koro
ar jegula thake oigula sidebar a rakba"*

### ১. Sidebar Navigation (lg+ স্ক্রিন)
- নতুন `lib/nav-modules.ts` — সব ২০টা Tool/মডিউলের একক
  single-source-of-truth (`NAV_GROUPS`), ৩টা ক্যাটাগরিতে ভাগ করা:
  "প্রধান" (AI Doubt Solver/Learning Hub/Analytics/Planner), "স্টাডি
  টুলস" (Practice/Smart Practice/Timed Drill/মিস্টেক ভল্ট/CQ
  Practice/Admission Prep/Full Mock Exam/Flashcards/PDF Chat/Live
  Exam), "সোশ্যাল ও প্রতিযোগিতা" (Leaderboard/Community/Study
  Group/Reading Room/Quiz Duel/Quiz Battle)।
- **আগে-অজানা bug আবিষ্কার ও ফিক্স**: dashboard page এর `moduleCards`
  ও `more-menu-sheet.tsx` এর `MORE_ITEMS` — এই দুটো array আলাদাভাবে
  ম্যানুয়ালি maintain করা হতো। "মিস্টেক ভল্ট" ফিচার (আগের সেশনে) যোগ
  হওয়ার সময় `more-menu-sheet.tsx` এ যোগ করা মিস হয়ে গিয়েছিল — অর্থাৎ
  মোবাইল ইউজাররা bottom-nav "আরও" শীট দিয়ে মিস্টেক ভল্ট খুঁজে পেতেন না
  (Dashboard এ থাকলেও)। এখন `NAV_GROUPS` এর `getMoreMenuModules()`
  থেকেই dashboard grid + AppSidebar + "আরও" শীট তিনটাই ডেটা নেয়, তাই
  ভবিষ্যতে কখনো out-of-sync হবে না।
- নতুন `components/layout/app-sidebar.tsx` (`AppSidebar`) —
  `"use client"`, `useSession()` দিয়ে conditional render (লগইন করা না
  থাকলে/quiz-exam এর মতো focused রুটে hidden), `sticky top-0 h-dvh`
  দিয়ে নিজে স্ক্রল হওয়া বাম sidebar, brand header, ৩টা group,
  active-route হাইলাইট, নিচে user profile dropdown footer
  (Settings/Admin Panel/Logout — `UserMenu` এর একই dropdown প্যাটার্ন)।
- নতুন `lib/nav-visibility.ts` — `BottomNavBar` এর ভেতরে আগে থাকা
  `HIDDEN_PREFIXES`/`EXCEPTION_EXACT_PATHS`/`isTabActive` লজিক এখানে
  বের করে আনা হয়েছে (`shouldHideNavChrome`, `isNavItemActive`), যাতে
  `BottomNavBar` (মোবাইল) ও `AppSidebar` (ডেস্কটপ) সবসময় consistent
  hide/active আচরণ করে। এই ফাইলে `/mistake-vault/run` ও নতুন করে যোগ
  করা হয়েছে HIDDEN_PREFIXES এ (আগে বাদ পড়েছিল, ছোট bug ফিক্স)।
- `app/layout.tsx` — Root layout এখন `<AppSidebar />` ও মূল কনটেন্ট
  একটা `flex` row এ পাশাপাশি রাখে, `id="main-content"` div এখন
  `flex-1 min-w-0 flex flex-col` (আগে `contents` ছিল)।
- `app/(dashboard)/dashboard/page.tsx` — হার্ডকোড করা ২০-আইটেম
  `moduleCards` array মুছে `NAV_GROUPS.flatMap((g) => g.items)` দিয়ে
  প্রতিস্থাপন, module grid এখন `lg:hidden` (sidebar এ ইতিমধ্যে সব
  থাকায় ডুপ্লিকেট না দেখানোর জন্য), `live` ফিল্ড বাদ দিয়ে `isNew`
  ফিল্ড অনুযায়ী badge (Live badge সরানো হয়েছে কারণ সব মডিউলই এখন
  live, শুধু নতুনগুলোতে NEW badge)।
- Bottom Nav Bar ব্রেকপয়েন্ট `sm:hidden` → `lg:hidden` (নতুন sidebar
  breakpoint এর সাথে মিলিয়ে), `pwa-install-prompt.tsx` ও
  `offline-sync-indicator.tsx` এর bottom offset breakpoint ও একই
  কারণে `sm:bottom-4` → `lg:bottom-4`।

### ২. Dark Mode Brightness Overhaul
`app/globals.css` এর `.dark` ব্লকে সংখ্যাগতভাবে (numerically, Python
regex দিয়ে ভেরিফাই করা) মান পরিবর্তন:

| ভেরিয়েবল | আগে | এখন |
|---|---|---|
| `--background` | oklch 0.145 | oklch 0.19 |
| `--card` | oklch 0.205 | oklch 0.24 |
| `--muted-foreground` | oklch 0.708 | oklch 0.80 |
| `--border` | 10% opacity | 16% opacity |
| `--sidebar` | oklch 0.205 | oklch 0.155 |

নতুন `--sidebar-muted-foreground` ভেরিয়েবল যোগ (sidebar group label ও
email এর মতো সেকেন্ডারি টেক্সটের জন্য, আগে কোনো নির্দিষ্ট sidebar-muted
ভেরিয়েবল ছিল না)। `@theme inline` ব্লকেও `--color-sidebar-muted-foreground`
mapping যোগ করা হয়েছে।

### লাইভ multi-user টেস্ট
`scripts/test-sidebar-navigation-feature.py` — ৩৪টা assertion:
1. দুইজন আলাদা ইউজার concurrently register+login (multi-user)
2. Dashboard এ সব ২০টা মডিউলের href server-rendered HTML এ আছে
3. ৩টা sidebar group label compiled dev-server JS bundle এ আছে
   (স্বচ্ছতার সাথে জানানো সীমাবদ্ধতা: `AppSidebar` client-side
   `useSession()` এ রেন্ডার হয় বলে raw HTTP GET এর initial HTML এ
   group label দেখা যায় না — এটা established CSR pattern,
   `scripts/test-bottom-nav-bar.py` তেও একই ডকুমেন্টেড সীমাবদ্ধতা আছে)
4. মিস্টেক ভল্ট bug-fix ভেরিফাই (href+title dashboard এ আছে)
5. দুইজন ইউজারের dashboard এ একই সংখ্যক মডিউল (consistency)
6. `lg:hidden` ক্লাস module grid এ আছে
7. Authorization/edge case: unauthenticated → লগইন redirect,
   non-admin `/admin` → `/dashboard` redirect (403-এর সমতুল্য UX)

### পূর্ণ Regression Test (আলাদা script, ৩০+টা রুট)
Sequential ভাবে (memory-aware sandbox এর কারণে ব্যাচে ভাগ করে, প্রতি
ব্যাচের পরে dev server restart) সব প্রধান রুট চেক করা হয়েছে —
`/dashboard`, `/learn`, `/practice`, `/planner`, `/analytics`,
`/leaderboard`, `/forum`, `/study-group`, `/reading-room`,
`/flashcards`, `/mistake-vault`, `/cq-practice`, `/admission`,
`/mock-exam`, `/pdf-chat`, `/live-exam`, `/quiz-battle`, `/duel`,
`/saved`, `/settings`, `/badges`, `/notifications`, `/ai-tutor`,
`/adaptive-practice`, `/drill` — সবগুলো ২০০ OK, কোনো crash/regression
নেই।

### সীমাবদ্ধতা (sandbox, স্বচ্ছভাবে জানানো)
এই সেশনে dev sandbox এর মেমরি (~1.9GB + 1GB swap) Turbopack dev
server দিয়ে একসাথে অনেক রুট compile করানোর কারণে কয়েকবার পুরোপুরি
ভরে গিয়ে dev server ক্র্যাশ করেছে (bash tool timeout সহ)। প্রতিবার
`pkill -9` দিয়ে পরিষ্কার করে ছোট ব্যাচে (৩-৫টা রুট) regression test
আবার চালিয়ে সম্পূর্ণ কভারেজ নিশ্চিত করা হয়েছে — এটা প্রোডাকশন
বিল্ডে (`pnpm build` স্ট্যাটিক আউটপুট) সমস্যা না, শুধু dev sandbox এর
সীমিত মেমরিতে Turbopack এর incremental compilation cache এর কারণে।

### Test cleanup
এই সেশনে তৈরি হওয়া সব টেস্ট ইউজার (মোট ১৫টা — `sidebar_user*`,
`regress*`, `regress2*`, `adm_*` প্যাটার্ন) প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। DB তে
সরাসরি `SELECT COUNT(*)` চালিয়ে cascade delete ভেরিফাই: `users`
টেবিলে `@test.hscultimate.local` প্যাটার্নের বাকি ০টা রেকর্ড কনফার্ম
করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `lib/nav-modules.ts` (single-source-of-truth, `NAV_GROUPS` +
  `getMoreMenuModules()`)
- নতুন: `lib/nav-visibility.ts` (শেয়ার্ড hide/active হেল্পার)
- নতুন: `components/layout/app-sidebar.tsx`
- `app/layout.tsx` — `AppSidebar` mount + flex layout restructure
- `app/(dashboard)/dashboard/page.tsx` — হার্ডকোড `moduleCards`
  সরিয়ে `NAV_GROUPS` থেকে derive, grid `lg:hidden`
- `components/layout/bottom-nav-bar.tsx` — hide/active লজিক
  `lib/nav-visibility.ts` এ move, breakpoint `sm:hidden` → `lg:hidden`
- `components/layout/more-menu-sheet.tsx` — হার্ডকোড `MORE_ITEMS`
  সরিয়ে `getMoreMenuModules()` থেকে derive (মিস্টেক ভল্ট bug ফিক্স)
- `components/pwa-install-prompt.tsx`,
  `components/shared/offline-sync-indicator.tsx` — bottom offset
  breakpoint আপডেট
- `app/globals.css` — `.dark` ব্লক brightness overhaul, নতুন
  `--sidebar-muted-foreground` ভেরিয়েবল
- নতুন: `scripts/test-sidebar-navigation-feature.py`
- মুছে ফেলা হয়েছে: `dashboard-preview.html` (mockup আর দরকার নেই,
  ফিচার এখন actual কোডে implement হয়ে গেছে)

কোনো নতুন migration লাগেনি (সম্পূর্ণ UI-layer পরিবর্তন), কোনো নতুন
dependency লাগেনি।

### ভবিষ্যতের পর্যবেক্ষণ
- Sidebar শুধু `lg+` (≥1024px) এ দেখা যায় — ট্যাবলেট সাইজে (sm-lg,
  ৬৪০-১০২৪px) এখনো bottom nav ব্যবহার হয়, ভবিষ্যতে চাইলে মাঝামাঝি
  ব্রেকপয়েন্টে একটা collapsed/icon-only sidebar variant যোগ করা যায়
  (এখনই দরকার নেই, ব্যবহারকারী নির্দিষ্টভাবে "sidebar" চেয়েছেন যা
  ডেস্কটপ-এ সবচেয়ে বেশি মানানসই)।
- Dark mode brightness আরও বাড়ানোর দরকার হলে ব্যবহারকারীর ফিডব্যাক
  অনুযায়ী আরও ইনক্রিমেন্টাল adjustment করা যাবে (এই আপডেট mockup এ
  আগে থেকেই ব্যবহারকারী রিভিউ করে approve করা মান অনুসরণ করেছে)।

---

## সম্প্রসারণ — Explain My Mistake (Mock Exam + Admission Prep) (২০২৬-০৭-২১)

### প্রেক্ষাপট
আগের সেশনে "AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake)" ফিচার
বানানো হয়েছিল কিন্তু শুধু Practice Result পেজে কাজ করতো। সেই সময়েই
docs/MASTER_PLAN.md এ transparently লেখা হয়েছিল: *"Mock Exam/Live
Exam/Admission এর ভুল উত্তরে এখনো এই বাটন নেই (আলাদা attempt মডেল
ব্যবহার করে) — ভবিষ্যতে চাইলে একই প্যাটার্নে সম্প্রসারণ করা যায়।"*
"Next" নির্দেশে এই সেশনে সেই ডকুমেন্টেড সম্প্রসারণ সুযোগটাই বেছে নেওয়া
হলো (Live Exam বাদে — সেটা ছাত্রের নিজের বানানো/আপলোড করা প্রশ্ন, board
curriculum-linked misconception ব্যাখ্যার প্রাসঙ্গিকতা কম)।

### কেন Mock Exam/Admission আলাদা এন্ডপয়েন্ট লাগলো (schema ভিন্নতা)
Practice এ প্রতিটা MCQ উত্তরের জন্য আলাদা `QuizAttemptAnswer` row আছে
(`answerId` দিয়ে সরাসরি লুকআপ করা যায়)। কিন্তু:
- `MockExamAttempt.mcqUserAnswers` — পুরো MCQ ফেজের সব উত্তর একটা
  JSON ম্যাপে (`{ questionId: userAnswer }`) সংরক্ষিত, কোনো
  per-question row নেই।
- `AdmissionMockAttempt.userAnswers` — একই প্যাটার্ন, JSON ম্যাপ।

তাই এই দুই জায়গায় route params `[attemptId]/[questionId]` (ownership
verify + JSON ম্যাপ থেকে নির্দিষ্ট প্রশ্নের উত্তর বের করা) ব্যবহার করা
হয়েছে, `[answerId]` না।

### `ExplainMistakeButton` Generalize করা
আগে: `<ExplainMistakeButton answerId={ans.id} />` — কম্পোনেন্টের ভেতরেই
`/api/practice/answers/${answerId}/explain` URL হার্ডকোড ছিল।
এখন: `<ExplainMistakeButton endpoint={...} />` — caller যেকোনো explain
API URL পাস করতে পারে। তিন জায়গায় ব্যবহার:
1. Practice Result: `endpoint={`/api/practice/answers/${ans.id}/explain`}`
2. Mock Exam Result: `endpoint={`/api/mock-exam/${attemptId}/mcq/${q.id}/explain`}`
3. Admission Result: `endpoint={`/api/admission/${attemptId}/question/${q.id}/explain`}`

কোনো নতুন dependency/migration লাগেনি — বিদ্যমান `lib/mistake-explainer.ts`
এর `explainMistake()` ফাংশন (multi-provider AI chain) হুবহু পুনর্ব্যবহার
করা হয়েছে, শুধু caller-side (route.ts) থেকে ইনপুট প্রস্তুত করার লজিক
নতুন।

### নতুন এন্ডপয়েন্ট
1. `POST /api/mock-exam/[attemptId]/mcq/[questionId]/explain` —
   `MockExamAttempt` (COMPLETED status যাচাই) → `mcqQuestionIds` এ
   questionId আছে কিনা চেক → `mcqUserAnswers` থেকে userAnswer বের করে
   → correctAnswer এর সাথে মিললে ৪০০ (ব্যাখ্যার দরকার নেই) → না
   মিললে AI দিয়ে ব্যাখ্যা।
2. `POST /api/admission/[attemptId]/question/[questionId]/explain` —
   একই প্যাটার্ন `AdmissionMockAttempt`/`AdmissionQuestion` দিয়ে।

উভয় endpoint এ ownership check (`attempt.userId !== session.user.id`
→ ৪০৪, leak প্রতিরোধ), unauthenticated → ৪০১, ভুয়া
attemptId/questionId → ৪০৪, উত্তর না দেওয়া/স্কিপ করা প্রশ্নে ৪০০।

### UI পরিবর্তন
- `components/mock-exam/mock-exam-result.tsx` — MCQ রিভিউ লুপে প্রতিটা
  ভুল (এবং উত্তর দেওয়া হয়েছে এমন) প্রশ্নের নিচে বাটন।
- `components/admission/admission-result.tsx` — প্রশ্নভিত্তিক রিভিউ
  লুপে `!q.isSkipped && !q.isCorrect && q.userAnswer` কন্ডিশনে বাটন
  (স্কিপ করা প্রশ্নে দেখানো হয় না, negative marking সিস্টেমে স্কিপ ও
  ভুল আলাদা জিনিস)।

### লাইভ multi-user টেস্ট
`scripts/test-explain-mistake-expansion.py` — ২০টা assertion:
1. দুইজন আলাদা ইউজার
2. Mock Exam পুরো flow: start (QUICK mode) → সব প্রশ্নে ইচ্ছাকৃতভাবে
   ভুল উত্তর (`"ভুল_উত্তর_Z"`, কোনো বাস্তব option এর সাথে মিলবে না) →
   submit-mcq → submit-cq (খালি, AI cost বাঁচাতে) → COMPLETED → result
   endpoint → MCQ explain endpoint কল
3. Admission Mock Test (MEDICAL) একই প্যাটার্নে পূর্ণ flow
4. Idempotency: একই প্রশ্নে দ্বিতীয়বার explain চাইলেও ২০০ (fresh AI
   call হয়, cache করা নেই — ইচ্ছাকৃত ডিজাইন, ব্যবহারের ফ্রিকোয়েন্সি কম)
5. Authorization: অন্য ইউজারের attempt এ explain চাওয়া → ৪০৪ (ownership
   leak প্রতিরোধ ভেরিফাই দুই endpoint এই), unauthenticated → ৪০১,
   ভুয়া attemptId/questionId → ৪০৪
6. Regression: sidebar/dashboard এর আগের পরিবর্তনের পরেও Practice
   Hub ও Dashboard পেজ ঠিকভাবে লোড হচ্ছে

প্রকৃত AI response manually রিভিউ করা হয়েছে — একটা পদার্থবিজ্ঞান MCQ
("সমত্বরণে গতিশীল বস্তুর বেগ-সময় লেখচিত্র কেমন হয়?") এ ভুল উত্তরের
জন্য AI যে ব্যাখ্যা দিয়েছে তা বাংলায়, প্রাসঙ্গিক, personalized, এবং
৩-ধাপের প্রম্পট কাঠামো (কেন ভুল/misconception/মনে রাখার টিপস) অনুসরণ
করেছে।

### Test cleanup
`explainexp_mock*`/`explainexp_adm*` প্যাটার্নের সব টেস্ট ইউজার প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। cascade
delete ভেরিফাই: নির্দিষ্ট `mock_exam_attempts` ও
`admission_mock_attempts` আইডি DB তে সরাসরি চেক করে বাকি ০টা রেকর্ড
কনফার্ম করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `components/practice/explain-mistake-button.tsx` — `answerId` prop
  থেকে `endpoint` prop এ generalize
- `app/(dashboard)/practice/result/[attemptId]/page.tsx` — নতুন
  `endpoint` prop ব্যবহার করে আপডেট (পুরনো আচরণ অপরিবর্তিত)
- নতুন: `app/api/mock-exam/[attemptId]/mcq/[questionId]/explain/route.ts`
- নতুন: `app/api/admission/[attemptId]/question/[questionId]/explain/route.ts`
- `components/mock-exam/mock-exam-result.tsx` — MCQ রিভিউতে বাটন যোগ
- `components/admission/admission-result.tsx` — প্রশ্নভিত্তিক রিভিউতে বাটন যোগ
- নতুন: `scripts/test-explain-mistake-expansion.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি (বিদ্যমান
multi-provider AI chain ও `lib/mistake-explainer.ts` পুনর্ব্যবহার)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **Live Exam এ এখনো নেই** — ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে, কারণ Live
  Exam এর প্রশ্ন হয় ছাত্রের নিজের বইয়ের পাতার ছবি থেকে AI-generated
  (কোনো board-verified misconception context নেই) অথবা
  CustomQuestionSet থেকে — "সাধারণ misconception" ব্যাখ্যার
  প্রাসঙ্গিকতা কম, ভবিষ্যতে চাইলে একই প্যাটার্নে যোগ করা যায়।
- **CQ এ প্রযোজ্য না** (আগের থেকেই ডকুমেন্টেড সীমাবদ্ধতা, অপরিবর্তিত)
  — CQ এর AI evaluation ইতিমধ্যেই personalized feedback দেয়।
- **No caching** (আগের থেকেই ইচ্ছাকৃত trade-off, অপরিবর্তিত) — প্রতিটা
  ক্লিকে fresh AI call, কম ফ্রিকোয়েন্সির কারণে acceptable।

---

## Admin Panel Power-up (২০২৬-০৭-২১)

### প্রেক্ষাপট
ব্যবহারকারী প্রথমে একটা নির্দিষ্ট Gmail (`abn21.noman@gmail.com`,
আগে থেকেই Student হিসেবে রেজিস্টার করা ছিল) কে Admin বানাতে বলেন
(পাসওয়ার্ড `@Abdullah1221`) — DB তে সরাসরি `role='ADMIN'` সেট করে +
bcrypt দিয়ে পাসওয়ার্ড হ্যাশ আপডেট করে করা হয়েছিল, লাইভ login+session
+admin-route-access ভেরিফাই করা হয়েছিল। এরপর ব্যবহারকারী "admin panel
er power aro barao" বলেন। জিজ্ঞাসা করে নিশ্চিত হওয়া গেছে ব্যবহারকারী
সবগুলো প্রস্তাবিত দিকই চান: (১) Audit Log Viewer (২) User Management
আরও শক্তিশালী (ban/suspend, delete, search/filter/sort, detail view)
(৩) Content Moderation আরও শক্তিশালী (report থেকে সরাসরি delete/ban,
bulk) (৪) System-level Control (maintenance mode, feature flags,
announcement banner)।

### নতুন Migration: `20260721000000_add_admin_powerup_ban_system_settings`
এই সেশনে প্রথমবার নতুন migration লেগেছে (আগের অনেক সেশন schema-free
ফিচার prioritize করেছিল)। established pgvector HNSW shadow-DB বাগ
আবারও দেখা দিয়েছিল (`prisma migrate dev --create-only` চালাতে গেলে
`type "vector" does not exist` P3006 error) — একই প্রমাণিত ফিক্স
প্যাটার্ন অনুসরণ করা হয়েছে:
1. `prisma migrate diff --from-schema-datasource ... --to-schema-datamodel ... --script`
   দিয়ে raw SQL জেনারেট (shadow DB ব্যবহার করে না)
2. জেনারেট করা SQL এ ভুল `DROP INDEX "pdf_chunks_embedding_idx";`
   স্টেটমেন্ট (documented Prisma bug, GitHub issue prisma/prisma#28414)
   ম্যানুয়ালি বাদ দিয়ে migration ফোল্ডার হাতে তৈরি
3. `prisma migrate deploy` দিয়ে সরাসরি apply (shadow DB এড়িয়ে)
4. `prisma migrate status` → "up to date" + `scripts/fix-vector-index.ts`
   দিয়ে HNSW ইনডেক্স অক্ষত কনফার্ম

স্কিমা পরিবর্তন:
- `User` মডেলে নতুন: `isBanned Boolean @default(false)`,
  `banReason String?`, `bannedAt DateTime?`, `bannedBy String?`
  (soft-block ডিজাইন, ডেটা মুছে যায় না)
- নতুন `SystemSetting` singleton মডেল (`id` সবসময় `"global"`):
  `maintenanceMode`, `maintenanceMessage`, `announcementEnabled`,
  `announcementText`, `announcementId`, `featureFlags` (Json),
  `updatedAt`, `updatedBy`

### ১. Ban/Suspend সিস্টেম
- `lib/auth.ts` এর `authorize()` এ `if (user.isBanned) return null;`
  — নতুন login ব্লক (generic "ইমেইল/পাসওয়ার্ড ভুল" এরর, ban reason
  প্রকাশ করা হয় না — account-status leak প্রতিরোধ)।
- **Mid-session enforcement** (গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত): role
  change এর established limitation হলো JWT session token পুরনো
  ভ্যালু বহন করে ("পরের login এ effective")। কিন্তু ban একটা
  security/moderation action — তাৎক্ষণিক effective হওয়া জরুরি, তাই
  `proxy.ts` তে প্রতিটা protected route রিকোয়েস্টে (Admin বাদে)
  `prisma.user.findUnique({ select: { isBanned: true } })` চেক করে
  ব্যান পাওয়া গেলে সাথে সাথে `authjs.session-token`/
  `__Secure-authjs.session-token` কুকি ডিলিট করে `/login?banned=1`
  এ redirect করা হয়। Login পেজে (`LoginForm` child component,
  `useSearchParams()` এর জন্য Suspense boundary সহ, established
  reset-password প্যাটার্ন) toast এ সংক্ষিপ্ত বার্তা দেখানো হয়।
- Next.js 16 এর `proxy.ts` এখন **Node.js runtime এ চলে** (আগের
  `middleware.ts` Edge runtime এর বিপরীতে) — তাই সরাসরি Prisma দিয়ে
  DB query করা সম্ভব হয়েছে, কোনো আলাদা Edge-compatible client লাগেনি।
- Admin কে ban করা ব্লক করা আছে (আগে role STUDENT বানাতে হবে) —
  malicious/accidental admin lockout প্রতিরোধ। নিজেকে নিজে ban করা
  যায় না (role-change endpoint এর একই safety প্যাটার্ন)।
- fail-open ডিজাইন: DB query fail করলে ban/maintenance/feature-flag
  চেক স্কিপ করে স্বাভাবিকভাবে চলতে দেওয়া হয় (transient outage এ পুরো
  সাইট লক বা সবাই logout হয়ে যাওয়া থেকে সুরক্ষা)।

### ২. User Management Power-up
- নতুন `lib/admin-user-management.ts` — `getAdminUserList()`
  (search/role-filter/status-filter/sort/pagination সহ, `Prisma.UserWhereInput`
  dynamic build) ও `getUserDetailStats()` (quiz/CQ/mock-exam attempt
  count + forum post/reply count + content-report-against count,
  সব parallel `Promise.all` এ)।
- `app/api/admin/users/route.ts` rewrite — query param
  validation সহ (whitelist করা sort field/filter value, arbitrary
  injection প্রতিরোধ)।
- নতুন `PATCH /api/admin/users/[userId]/ban` — ban/unban, reason সহ,
  audit log (`USER_BAN`/`USER_UNBAN`)।
- নতুন `DELETE /api/admin/users/[userId]` — বিদ্যমান
  `deleteUserAccount()` (lib/account-privacy.ts, ইউজারের নিজের
  delete-account endpoint এও ব্যবহৃত) পুনর্ব্যবহার করে cascade
  delete, audit log (`USER_DELETE`)।
- নতুন `GET /api/admin/users/[userId]/detail`।
- `components/admin/user-manager.tsx` সম্পূর্ণ rewrite — debounced
  search (৪০০ms), Select ফিল্টার (base-ui primitive, established
  `components/planner/class-routine.tsx` প্যাটার্ন), sort dropdown,
  pagination UI, Ban Dialog (reason textarea সহ), User Detail Dialog
  (stats grid + content report warning যদি থাকে)।

### ৩. Audit Log Viewer
- সম্পূর্ণ **schema-free** — `AuditLog` মডেল অনেক আগে থেকেই ছিল
  (`logAuditEvent()` ১২+ জায়গায় ইতিমধ্যে কল হচ্ছিল) কিন্তু দেখার UI
  ছিল না। নতুন `GET /api/admin/audit-log` (action filter + pagination
  + `findMany({distinct: ["action"]})` দিয়ে available actions লিস্ট)
  ও `components/admin/audit-log-viewer.tsx` (`/admin/audit-log`)।

### ৪. System-level Control
- নতুন `lib/system-settings.ts` — `getSystemSettings()`।
  **⚠️ Performance/correctness বাগ প্রতিরোধ করা হয়েছে ডিজাইনের সময়েই**:
  প্রথম dhারণা ছিল `upsert()` ব্যবহার করা (row না থাকলে তৈরি, থাকলে
  no-op update), কিন্তু Prisma এর `upsert()` row বিদ্যমান থাকলেও একটা
  প্রকৃত UPDATE কুয়েরি চালায় (এমনকি payload `{}` খালি হলেও), আর
  `@updatedAt` কলাম প্রতিটা UPDATE এ auto-bump হয় — এই ফাংশন প্রায়
  প্রতিটা পেজ লোডে (maintenance/announcement চেক করতে) কল হবে বলে
  এটা "সর্বশেষ আপডেট" টাইমস্ট্যাম্প ভুলভাবে বদলে দিত এবং অহেতুক write
  query চালাতো। ফিক্স: `findUnique()` (pure read) দিয়ে আগে চেক, row
  না থাকলেই (প্রথমবার) `create()`, race condition এ P2002 এলে আবার
  `findUnique()` (retry-loop ছাড়া DB primitive এর উপর নির্ভরশীল)।
- **Maintenance Mode**: নতুন `app/maintenance/page.tsx`
  (`export const dynamic = "force-dynamic"` বাধ্যতামূলক — প্রথম
  build attempt এ এটা ছাড়া Next.js static prerender করার চেষ্টা করে
  build-time DB connection এর উপর নির্ভরশীল হয়ে পড়েছিল, "Server has
  closed the connection" এরর দিয়ে বিল্ড ফেইল করেছিল, এই সেশনে ধরা
  পড়ে ফিক্স করা হয়েছে)। `proxy.ts` তে Admin বাদে protected রুটে
  `NextResponse.rewrite()` (redirect না — URL bar এ আসল URL থাকে)।
- **Announcement Banner**: নতুন `components/shared/announcement-banner.tsx`
  — `useSession()` দিয়ে শুধু authenticated ইউজারে fetch, localStorage
  এ `announcementId`-keyed dismiss-tracking (নতুন announcement টেক্সট
  বদলালে নতুন id generate হয়, পুরনো dismiss করা ইউজারও নতুনটা দেখে)।
- **Feature Flags**: নতুন `lib/feature-flag-routes.ts` (flag key →
  route prefix ম্যাপিং, ৮টা মডিউল), `app/feature-disabled/page.tsx`,
  `proxy.ts` এ rewrite লজিক।
- নতুন `components/admin/system-control-panel.tsx` (`/admin/system`)
  — Switch টগল + Textarea, প্রতিটা সেকশন আলাদাভাবে সেভ করা যায়।

### ৫. Content Moderation Power-up
- `app/api/admin/reports/[reportId]/route.ts` rewrite — নতুন action
  `DELETE_CONTENT`/`DELETE_AND_BAN` (আগে শুধু `RESOLVE`/`DISMISS`
  ছিল)। DELETE_AND_BAN এ Admin ban-protection ডুপ্লিকেট করা হয়েছে
  (bypass route থেকে admin ব্যান হওয়া প্রতিরোধ করতে)।
- নতুন `DELETE /api/admin/forum/replies/[replyId]` — আগে শুধু Post
  delete endpoint ছিল, Reply delete endpoint সম্পূর্ণ মিসিং ছিল (ছোট
  gap, এই কাজের সময় ধরা পড়েছে)।
- `components/admin/reports-panel.tsx` — নতুন Delete/Delete+Ban বাটন
  (Confirm dialog সহ, `useConfirmDialog()` established প্যাটার্ন)।

### 🐛 গুরুতর বাগ ফিক্স — Content Report Cascade-Delete Crash (P2025)
লাইভ টেস্টে ধরা পড়েছে: `ContentReport.postId`/`replyId` ফিল্ডে
`onDelete: Cascade` আছে (স্কিমায় আগে থেকেই ছিল, এই সেশনে পরিবর্তন
করা হয়নি)। `DELETE_AND_BAN` অ্যাকশনে প্রথমে পোস্ট/রিপ্লাই delete করে
তারপর সেই `ContentReport` কে `status: "RESOLVED"` এ update করার
চেষ্টা করা হচ্ছিল — কিন্তু পোস্ট delete হওয়া মাত্রই cascade constraint
এর কারণে সেই `ContentReport` রো নিজেও DB থেকে মুছে গিয়েছিল, তাই পরের
`update()` কল Prisma P2025 ("record not found") throw করে ৫০০
Internal Server Error দিচ্ছিল (যদিও delete+ban অংশ আসলে সফল হয়ে
গিয়েছিল, শুধু response crash করতো)। **ফিক্স**: অপারেশনের ক্রম উল্টে
দেওয়া হয়েছে — আগে `contentReport.update()` (report row তখনও
বিদ্যমান), তারপর content delete (তখন cascade delete নিয়ে সমস্যা নেই
কারণ আমরা আর ওই report row নিয়ে কিছু করছি না)। কোনো নতুন
migration/schema পরিবর্তন লাগেনি, শুধু route handler এর লজিক ক্রম।

### লাইভ multi-user টেস্ট (`scripts/test-admin-powerup.py`, ৫৩টা assertion)
1. Admin login + session role ভেরিফাই
2. User Management: search, role filter, status filter, sort (XP
   descending সংখ্যাগতভাবে ভেরিফাই), pagination
3. Ban → নতুন login ব্যর্থ (CredentialsSignin), mid-session ban →
   পরের রিকোয়েস্টে login পেজে redirect (proxy.ts enforcement লাইভ
   প্রমাণিত)
4. Admin কে ban করার চেষ্টা ব্লক (৪০০), নিজেকে নিজে ban/delete ব্লক (৪০০)
5. Unban → আবার login করা যায়
6. User Detail endpoint → stats আছে
7. Admin Delete → cascade delete, ডিলিট হওয়া ইউজার login করতে পারে না
8. Audit Log → USER_BAN/USER_UNBAN/USER_DELETE সব লগ হয়েছে, action
   filter কাজ করে
9. System Settings: public GET (auth ছাড়া) + admin PATCH
   (announcement propagate ভেরিফাই)
10. Feature Flag বন্ধ → রুটে "সাময়িকভাবে বন্ধ" বার্তা, Admin route
    অপ্রভাবিত, আবার চালু করলে normal হয়
11. Maintenance Mode চালু → student dashboard এ মেইনটেন্যান্স বার্তা,
    Admin অপ্রভাবিত, বন্ধ করলে normal হয়
12. Content Report → DELETE_AND_BAN flow (পোস্ট তৈরি → রিপোর্ট →
    delete+ban → পোস্ট আসলেই ডিলিট ভেরিফাই → লেখক login করতে পারে না
    ভেরিফাই) — **এই টেস্টেই P2025 বাগ প্রথম ধরা পড়ে, ফিক্সের পরে PASS**
13. Authorization/edge-case: unauthenticated (৪০১), non-admin (৪০৩),
    ভুয়া userId তে ban/delete/detail (৪০৪)

**একটা false-positive ইটারেশন**: প্রথম টেস্ট রানে "টেস্ট পোস্ট
রিপোর্টের জন্য" শিরোনামের একটা generic পোস্ট AI Content Moderation
এ "স্প্যাম" হিসেবে ধরা পড়ে ৪২২ দিয়েছিল — এটা admin power-up ফিচারের
বাগ না, বরং বিদ্যমান moderation ঠিকভাবে কাজ করছিল প্রমাণ। টেস্ট পোস্ট
টেক্সট একটা বাস্তবসম্মত পড়াশোনা-সম্পর্কিত প্রশ্নে পরিবর্তন করে ফিক্স
করা হয়েছে (কোড পরিবর্তন লাগেনি)।

### Test cleanup
মোট ১২টা টেস্ট ইউজার তৈরি হয়েছিল, যার মধ্যে ২জন (student2, author)
ban করা অবস্থায় ছিল — তাদের নিজেদের `/api/user/delete-account`
(পাসওয়ার্ড verify লাগে, কিন্তু ban থাকলেও পাসওয়ার্ড সঠিক থাকলে এটা
আসলে কাজ করতে পারতো, তবে সরলতার জন্য) এর বদলে Admin session থেকে
প্রকৃত `DELETE /api/admin/users/[userId]` endpoint দিয়ে সবগুলো ডিলিট
করা হয়েছে (raw SQL bypass না, actual API flow)। DB তে সরাসরি চেক করে
verify করা হয়েছে: ০টা টেস্ট ইউজার বাকি, ০টা টেস্ট forum post বাকি,
এবং System Settings state clean (maintenanceMode=false,
announcementEnabled=false, featureFlags={"pdf-chat": true}) —
পরবর্তী রিয়েল ইউজারদের experience এ কোনো প্রভাব পড়েনি তা নিশ্চিত
করা হয়েছে।

### পরিবর্তিত/নতুন ফাইল
- `prisma/schema.prisma` — `User` তে ban ফিল্ড, নতুন `SystemSetting` মডেল
- নতুন migration: `prisma/migrations/20260721000000_add_admin_powerup_ban_system_settings/`
- `lib/auth.ts` — banned user login block
- `lib/audit-log.ts` — নতুন action টাইপ (`USER_BAN`/`USER_UNBAN`/`SYSTEM_SETTINGS_UPDATE`)
- নতুন: `lib/admin-user-management.ts`
- নতুন: `lib/system-settings.ts`
- নতুন: `lib/feature-flag-routes.ts`
- `app/api/admin/users/route.ts` — search/filter/sort/pagination
- `app/api/admin/users/[userId]/route.ts` — নতুন DELETE handler
- নতুন: `app/api/admin/users/[userId]/ban/route.ts`
- নতুন: `app/api/admin/users/[userId]/detail/route.ts`
- নতুন: `app/api/admin/audit-log/route.ts`
- নতুন: `app/api/system-settings/route.ts` (public)
- নতুন: `app/api/admin/system-settings/route.ts` (admin)
- নতুন: `app/api/admin/forum/replies/[replyId]/route.ts`
- `app/api/admin/reports/[reportId]/route.ts` rewrite (DELETE_CONTENT/DELETE_AND_BAN + P2025 ফিক্স)
- `proxy.ts` rewrite — ban enforcement + maintenance mode + feature flags
- `app/admin/layout.tsx` — নতুন NAV_ITEMS (Audit Log, System Control)
- `app/admin/users/page.tsx` rewrite
- `components/admin/user-manager.tsx` সম্পূর্ণ rewrite
- নতুন: `components/admin/audit-log-viewer.tsx`
- নতুন: `components/admin/system-control-panel.tsx`
- `components/admin/reports-panel.tsx` — Delete/Delete+Ban বাটন
- নতুন: `app/admin/audit-log/page.tsx`, `app/admin/system/page.tsx`
- নতুন: `app/maintenance/page.tsx` (`dynamic = "force-dynamic"`)
- নতুন: `app/feature-disabled/page.tsx`
- নতুন: `components/shared/announcement-banner.tsx`
- `app/layout.tsx` — `AnnouncementBanner` mount
- `app/(auth)/login/page.tsx` — `LoginForm` child component এ split
  (Suspense boundary), `?banned=1` query param toast
- নতুন: `scripts/test-admin-powerup.py`

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **Feature Flags শুধু ৮টা multiplayer/AI-heavy মডিউলে** — মূল Study
  Tools (Practice/Learning Hub/Planner ইত্যাদি) ইচ্ছাকৃতভাবে
  flag-করা হয়নি (এগুলো বন্ধ করার বাস্তবসম্মত use-case কম, এবং ভুলবশত
  পুরো core-experience বন্ধ হয়ে যাওয়ার ঝুঁকি এড়াতে)।
- **Content Report Bulk Actions এখনো নেই** — প্রতিটা রিপোর্ট
  আলাদাভাবে অ্যাকশন নিতে হয়, একসাথে একাধিক select করে bulk resolve/
  dismiss/delete এখনো নেই — ভবিষ্যতে চাইলে checkbox selection + bulk
  action bar যোগ করা যায়।
- **Ban করা ইউজারের Content স্বয়ংক্রিয়ভাবে hide/delete হয় না** — শুধু
  login ব্লক হয়, তাদের আগের forum post/reply আগের মতোই দৃশ্যমান থাকে
  (ইচ্ছাকৃত — অনেক moderation সিস্টেমে এটাই standard practice, content
  সরাতে চাইলে আলাদাভাবে Forum Moderation/Reports থেকে করতে হবে)।
- **Maintenance Mode এ কোনো scheduled auto-off নেই** — Admin নিজে
  বন্ধ না করলে অনির্দিষ্টকালের জন্য চালু থাকবে (ইচ্ছাকৃত, accidental
  auto-recovery থেকে ভালো explicit control)।

---

## Content Report Bulk Actions (২০২৬-০৭-২১, রাত)

### প্রেক্ষাপট
Admin Panel Power-up ফিচার শেষ হওয়ার পরে ব্যবহারকারী "Next" বললে নিজে
সিদ্ধান্ত নিয়ে পরবর্তী কাজ বেছে নেওয়ার নির্দেশ অনুযায়ী, সেই ফিচারেরই
transparently ডকুমেন্ট করা একটা সীমাবদ্ধতা বেছে নেওয়া হয়েছে: "Content
Report Bulk Actions এখনো নেই — প্রতিটা রিপোর্ট আলাদাভাবে অ্যাকশন নিতে
হয়, একসাথে একাধিক select করে bulk resolve/dismiss/delete এখনো নেই"।
এর আগে একটা প্রোঅ্যাক্টিভ সিস্টেমেটিক bug audit করা হয়েছে (নিচে
বিস্তারিত) — কোনো নতুন বাগ পাওয়া যায়নি, যা নিশ্চিত করে যে আগের সেশনের
Content Report cascade-delete fix সঠিক ছিল এবং একই ক্লাসের অন্য কোনো
bug নেই।

### প্রোঅ্যাক্টিভ Bug Audit (কোনো নতুন বাগ পাওয়া যায়নি)
আগের সেশনে "delete তারপর সেই একই রেকর্ডে update" (cascade-delete
crash) বাগ ক্লাস পাওয়ার পরে, একই প্যাটার্নের অন্য কোনো endpoint আছে
কিনা তা Python script দিয়ে সিস্টেমেটিকভাবে scan করা হয়েছে
(`app/api/**/*.ts` এ প্রতিটা route handler এ `.delete(` এর পরে
`.update(` কল আছে কিনা regex দিয়ে চেক)। ফলাফল: শুধু আগেই ফিক্স করা
`app/api/admin/reports/[reportId]/route.ts` এই প্যাটার্নে ছিল, আর
কোথাও নেই। এছাড়া "existence check ছাড়া delete/update" প্যাটার্নও
চেক করা হয়েছে — ১৪টা false-positive পাওয়া গেছে (সবগুলোই আসলে
`getOwnedSet()`/`getOwnedDocument()` এর মতো হেল্পার ফাংশন দিয়ে বা
আলাদা PATCH/DELETE handler এ existence check করা, regex এর সীমাবদ্ধতার
কারণে flag হয়েছিল) — ম্যানুয়ালি প্রতিটা রিভিউ করে নিশ্চিত হওয়া গেছে
কোনো প্রকৃত বাগ নেই।

### রিফ্যাক্টর — `lib/content-report-actions.ts`
আগে RESOLVE/DISMISS/DELETE_CONTENT/DELETE_AND_BAN এর সম্পূর্ণ লজিক
(ownership check, cascade-delete-safe ordering, ban-protection,
audit log, reporter notification) শুধু single-report
`app/api/admin/reports/[reportId]/route.ts` এর PATCH handler এর
ভেতরেই ছিল। Bulk endpoint এও এই একই লজিক দরকার — DRY রাখতে
`applyReportAction(reportId, action, actor, req, banReason)` নামে
একটা শেয়ার্ড async ফাংশনে বের করে আনা হয়েছে যা
`ApplyReportActionResult` (`{ success, error?, status? }`) রিটার্ন
করে (throw করে না — bulk endpoint এ per-item error handling দরকার)।
Single-report route.ts এখন শুধু input validation + এই ফাংশন কল করে
HTTP response বানায়।

### বাড়তি ইম্প্রুভমেন্ট (bonus, রিফ্যাক্টরের সময় আবিষ্কৃত)
রিফ্যাক্টর করার সময় লক্ষ্য করা গেছে যে আগের কোডে কোনো idempotency
guard ছিল না — একই PENDING রিপোর্টে দুইবার (বা RESOLVED হওয়ার পরে
আবার) action নিলে status আবার ওভাররাইট হয়ে যেত (গুরুতর বাগ না, কিন্তু
data integrity এর জন্য ভালো না — audit log এ "কে কখন resolve করলো"
একাধিকবার লগ হতে পারতো, এবং reporter কে দুইবার notification যেতে
পারতো)। `applyReportAction()` এ নতুন চেক যোগ করা হয়েছে:
`if (report.status !== "PENDING") return { success: false, error: "..." , status: 400 }`।

### নতুন endpoint: `POST /api/admin/reports/bulk`
- Body: `{ reportIds: string[], action, banReason? }`
- **সর্বোচ্চ ২০টা** reportId একসাথে (`MAX_BULK_SIZE`) — accidental
  mass-action/timeout প্রতিরোধ
- **Sequential processing, all-or-nothing না** — for-loop এ প্রতিটা
  reportId আলাদাভাবে `applyReportAction()` কল করে। ডিজাইন সিদ্ধান্তের
  কারণ (কোডে বিস্তারিত কমেন্ট আছে):
  1. প্রতিটা report independent operation (ভিন্ন post/reply/user) —
     একটা fail হলে বাকি সব ব্লক করার যুক্তি নেই
  2. একটা বিশাল multi-table transaction (delete+ban+notification)
     বহু আইটেম জুড়ে করলে dev sandbox এর ছোট connection pool এ
     (established নোট: মাত্র ৩টা connection) timeout/lock contention
     ঝুঁকি বাড়ে
  3. প্রতিটা আইটেমের আলাদা success/failure status UX এ ভালো (admin
     জানতে পারে কোনটা কাজ করেছে কোনটা করেনি)
- Response: `{ results: [{reportId, success, error?}], successCount, failureCount, totalCount }`
- ইউনিক reportId (duplicate পাঠালে dedupe করা হয় `new Set()` দিয়ে)

### নতুন UI কম্পোনেন্ট: `components/ui/checkbox.tsx`
এই প্রজেক্টে প্রথমবার Checkbox দরকার হলো (আগে কোথাও ছিল না)। base-ui
এর `@base-ui/react/checkbox` primitive ব্যবহার করে বাকি সব
`components/ui/*` ফাইলের established প্যাটার্ন অনুসরণ করে বানানো
হয়েছে (shadcn/ui স্টাইল ক্লাস, `data-slot` attribute, `cn()` দিয়ে
className merge)। `onCheckedChange` callback base-ui তে
`(checked: boolean, eventDetails)` সিগনেচার — শুধু প্রথম আর্গুমেন্ট
ব্যবহার করা হয়েছে।

### UI পরিবর্তন — `components/admin/reports-panel.tsx`
- প্রতিটা PENDING রিপোর্টের পাশে Checkbox (RESOLVED/DISMISSED
  রিপোর্টে দেখানো হয় না — সেগুলোতে আর কোনো action করার মানে নেই)
- "সব অপেক্ষমাণ রিপোর্ট সিলেক্ট করো" মাস্টার চেকবক্স (MAX_BULK_SELECTION
  এর বেশি PENDING থাকলে প্রথম ২০টা সিলেক্ট হয়, toast এ জানানো হয়)
- কিছু সিলেক্ট করা থাকলেই একটা `sticky top-2` bulk action bar দেখা
  যায় (Resolve/Dismiss/Delete/Delete+Ban বাটন সহ)
- ফিল্টার (status tab) বদলালে সিলেকশন রিসেট হয় (stale selection
  থেকে বিভ্রান্তি এড়াতে)

### লাইভ multi-user টেস্ট (`scripts/test-content-report-bulk-actions.py`, ২১টা assertion)
1. Bulk RESOLVE (২টা রিপোর্ট একসাথে) — successCount=2 ভেরিফাই
2. Bulk DISMISS (২টা) — successCount=2
3. Bulk DELETE_CONTENT (১টা) — successCount=1 + টার্গেট পোস্ট আসলেই
   ডিলিট হয়েছে কিনা `/api/forum/posts` দিয়ে ভেরিফাই
4. Bulk DELETE_AND_BAN (১টা) — successCount=1 + লেখক আসলেই আর login
   করতে পারে না ভেরিফাই
5. **Partial failure**: একটা বৈধ + একটা ভুয়া reportId একসাথে পাঠিয়ে
   successCount=1, failureCount=1, এবং `results` array এ কোনটা সফল/
   ব্যর্থ হয়েছে সঠিকভাবে ম্যাপ হয়েছে কিনা ভেরিফাই (crash হয়নি, পুরো
   রিকোয়েস্ট ২০০ রিটার্ন করেছে)
6. MAX_BULK_SIZE এর বেশি (২৫টা fake id) → ৪০০
7. খালি `reportIds` array → ৪০০, ভুল action ভ্যালু → ৪০০
8. Authorization: unauthenticated → ৪০১, non-admin → ৪০৩
9. **Regression**: single-report endpoint (রিফ্যাক্টরের পরেও) স্বাভাবিকভাবে
   কাজ করছে
10. **Idempotency guard**: ইতিমধ্যে DISMISSED করা রিপোর্টে আবার action
    নিতে চাইলে ৪০০ (নতুন bonus improvement লাইভ ভেরিফাই)

### Test cleanup
মোট ১০টা টেস্ট ইউজার (`bulkrep_reporter*`/`bulkrep_author*` প্যাটার্ন)
প্রকৃত `/api/admin/users/[userId]` DELETE endpoint দিয়ে (Admin
session থেকে) ডিলিট করা হয়েছে। DB তে সরাসরি চেক করে ভেরিফাই: ০টা
টেস্ট ইউজার, ০টা টেস্ট forum post ("পাটিগণিত নিয়ে প্রশ্ন" প্যাটার্ন),
০টা সংশ্লিষ্ট content report বাকি।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `lib/content-report-actions.ts` (`applyReportAction()`,
  `VALID_REPORT_ACTIONS`, `ReportAction` টাইপ)
- `app/api/admin/reports/[reportId]/route.ts` — রিফ্যাক্টর, শেয়ার্ড
  ফাংশন কল করে
- নতুন: `app/api/admin/reports/bulk/route.ts`
- নতুন: `components/ui/checkbox.tsx`
- `components/admin/reports-panel.tsx` — checkbox selection + bulk
  action bar
- নতুন: `scripts/test-content-report-bulk-actions.py`

কোনো migration লাগেনি (ContentReport মডেল অপরিবর্তিত), কোনো নতুন
dependency লাগেনি (base-ui checkbox primitive আগে থেকেই প্যাকেজে
ছিল, শুধু ব্যবহার করা হয়নি)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **RESOLVED/DISMISSED রিপোর্টে bulk selection নেই** (checkbox শুধু
  PENDING এ) — ইচ্ছাকৃত, কারণ ওগুলোতে আর কোনো action করার প্রয়োজন
  নেই (idempotency guard এমনিতেও ব্লক করে দেবে)।
- **Cross-page selection নেই** — pagination থাকলে (Reports প্যানেলে
  বর্তমানে pagination নেই, সব রিপোর্ট একবারে লোড হয়) ভবিষ্যতে যোগ
  হলে "সব পেজ জুড়ে সিলেক্ট" এর সাপোর্ট আলাদাভাবে যোগ করতে হবে।

---

## Admin Panel UI/UX Polish (২০২৬-০৭-২২)

### প্রেক্ষাপট
Content Report Bulk Actions ফিচার শেষ হওয়ার পরে ব্যবহারকারী "Next"
বললে, প্রথমে একটা clarifying question জিজ্ঞেস করা হয়েছে (কারণ
প্ল্যাটফর্মের প্রায় সব major feature/research idea ইতিমধ্যে বাস্তবায়িত
ছিল — Board Question Filter, Audio Overview, Mind Map, Confidence-
based Answering, Peer Comparison সব already ছিল)। ব্যবহারকারী "Existing
feature UI/UX polish" বেছে নেন। Admin Panel এর sidebar/navigation
systematically রিভিউ করে student-facing sidebar (আগের সেশনের Sidebar
Navigation ফিচার) এর সাথে তুলনা করে ৩টা রাফ-এজ পাওয়া গেছে।

### বাগ/গ্যাপ ১ — Active-Route Highlighting ছিল না
Admin sidebar এর `NAV_ITEMS.map()` কোনো active-state চেক করতো না —
`/admin/users` এ থাকলেও sidebar এ সব লিংক একই রকম দেখাতো, Admin কোন
পেজে আছে বুঝতে হেডিং/URL দেখতে হতো। ফিক্স: `lib/nav-visibility.ts`
এর বিদ্যমান `isNavItemActive()` (student `AppSidebar` এ established)
পুনর্ব্যবহার করা হয়েছে, `aria-current="page"` সহ। বিশেষ কেস: `/admin`
এর জন্য exact match লাগে (`pathname === "/admin"`), নাহলে
`isNavItemActive()` এর `startsWith` চেক এর কারণে সব `/admin/*` সাব-রুটে
"ড্যাশবোর্ড" লিংকও active দেখাতো।

### বাগ/গ্যাপ ২ — সম্পূর্ণ Non-Responsive
`<aside className="w-60 ...">` কোনো breakpoint-conditional hide লজিক
ছাড়াই সবসময় রেন্ডার হতো — মোবাইল স্ক্রিনে (Admin কে কখনো ফোন থেকে
জরুরি ban/delete/maintenance-mode toggle করতে হলে) UI সম্পূর্ণ ভেঙে
পড়তো। ফিক্স: নতুন `components/admin/admin-sidebar-nav.tsx` (client
component) — `md:` breakpoint (768px) এ sticky sidebar (student
`AppSidebar` এর একই `sticky top-0 h-dvh` প্যাটার্ন), তার নিচে
(<768px) একটা sticky header + hamburger বাটন যা bottom-sheet খোলে
(`components/layout/more-menu-sheet.tsx` এর established base-ui
`Dialog` bottom-sheet প্যাটার্ন হুবহু পুনর্ব্যবহার — কোনো নতুন
navigation paradigm ডিজাইন করতে হয়নি)।

### বাগ/গ্যাপ ৩ — Dark Mode Brightness আপডেট থেকে বাদ পড়েছিল
আগের সেশনের Sidebar Navigation ফিচারে student sidebar এর dark-mode
brightness বাড়ানো হয়েছিল (`--sidebar`, `--sidebar-foreground`,
`--sidebar-accent` ইত্যাদি নতুন/আপডেট করা ভেরিয়েবল দিয়ে)। কিন্তু Admin
sidebar `bg-muted/30` ব্যবহার করতো — এটা সম্পূর্ণ ভিন্ন CSS ভেরিয়েবল,
তাই সেই brightness fix থেকে কোনো উপকার পায়নি (Admin dark mode এ পুরনো,
কম-brightness ভিজ্যুয়াল রয়ে গিয়েছিল)। ফিক্স: `bg-sidebar`/
`text-sidebar-foreground`/`border-sidebar-border`/`bg-sidebar-accent`
ভেরিয়েবলে migrate করা হয়েছে — ভবিষ্যতে dark mode আরও পরিবর্তন হলে
student+admin দুটো sidebar একসাথে আপডেট হবে (single source of truth)।

### নতুন — ThemeToggle + UserMenu Admin Panel এ
আগে Admin Panel এ থিম পরিবর্তনের কোনো উপায় ছিল না, এবং কে লগইন করা
আছে তার কোনো ভিজ্যুয়াল নিশ্চিতকরণ ছিল না। বিদ্যমান `ThemeToggle`
(sidebar header এ, ডেস্কটপ+মোবাইল দুটোতেই) ও `UserMenu` (sidebar
footer এ, `isAdmin` prop true দিয়ে — settings/logout dropdown, নাম+
ইমেইল সহ) পুনর্ব্যবহার করা হয়েছে — কোনো নতুন কম্পোনেন্ট বানাতে হয়নি,
`app/admin/layout.tsx` থেকে `session.user.name`/`session.user.email`
prop হিসেবে পাস করা হয়েছে (server component থেকে client component এ)।

### Admin Dashboard Polish (`app/admin/page.tsx`)
- প্রতিটা স্ট্যাট কার্ড (মোট ইউজার/সাবজেক্ট/চ্যাপ্টার/টপিক/প্রশ্ন/
  কুইজ অ্যাটেম্পট) এখন `<Link>` দিয়ে ক্লিকযোগ্য — সংশ্লিষ্ট Admin
  পেজে নিয়ে যায় (যেমন "মোট ইউজার" → `/admin/users`)।
- নতুন **Pending Reports quick-glance card** — `prisma.contentReport.count({
  where: { status: "PENDING" } })` দিয়ে গণনা করে, ০ এর বেশি হলেই
  prominently (amber-colored alert card) Dashboard এর উপরে দেখা যায়,
  ক্লিক করলে সরাসরি Content Reports পেজে যায়। আগে এই তথ্য জানতে
  আলাদা করে Reports পেজে গিয়ে PENDING ফিল্টার করে দেখতে হতো।
- Empty state যোগ (`recentUsers.length === 0` হলে "এখনো কোনো ইউজার
  নেই" বার্তা, আগে খালি div দেখাতো)।

### লাইভ multi-user টেস্ট (`scripts/test-admin-ui-polish.py`, ২২টা assertion)
1. সব ৯টা Admin রুট (`/admin`, `/admin/subjects`, `/admin/users`,
   `/admin/analytics`, `/admin/forum`, `/admin/reports`,
   `/admin/notifications`, `/admin/audit-log`, `/admin/system`) নতুন
   layout এর পরেও ২০০ OK (রিগ্রেশন)
2. Admin Dashboard এর server-rendered HTML এ নতুন clickable stat card
   href গুলো (`/admin/users`, `/admin/analytics`) আছে
3. Compiled dev-server bundle এ নতুন client-component UI স্ট্রিং
   ("Admin মেনু" mobile bottom-sheet title, "Audit Log"/"System
   Control" nav label) আছে — established CSR presence-check প্যাটার্ন
   (client component `useState`/`usePathname` ব্যবহার করায় raw HTTP
   GET এ সরাসরি দেখা যায় না)
4. **Live verification**: একটা নতুন test পোস্ট+রিপোর্ট বানিয়ে Admin
   Dashboard আবার fetch করে "রিভিউয়ের অপেক্ষায়" টেক্সট (Pending
   Reports card) দেখা যাচ্ছে কিনা ভেরিফাই (শুধু কোড দেখে না, প্রকৃত
   ডেটা দিয়ে end-to-end)
5. Authorization regression: non-admin `/admin` → `/dashboard`
   redirect, unauthenticated → `/login` redirect
6. Student-facing regression: `/dashboard` এখনো ২০০ + sidebar module
   href (`/practice`) এখনো আছে (Admin layout পরিবর্তনের কোনো crossover
   effect নেই তা নিশ্চিত)

### Test cleanup
২টা টেস্ট ইউজার (`uipolish_reporter*`/`uipolish_author*`) প্রকৃত
`/api/admin/users/[userId]` DELETE endpoint দিয়ে ডিলিট করা হয়েছে।
টেস্ট রিপোর্টটাও প্রকৃত `/api/admin/reports/[reportId]` PATCH
(DISMISS action) দিয়ে ক্লিয়ার করা হয়েছে যাতে Dashboard এর Pending
Reports card এ কোনো stale test artifact না থেকে যায়। DB তে সরাসরি
চেক করে ভেরিফাই: ০টা টেস্ট ইউজার, ০টা টেস্ট forum post
("সালোকসংশ্লেষণ" প্যাটার্ন), ০টা PENDING content report বাকি।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `components/admin/admin-sidebar-nav.tsx` (client component —
  active-highlight, responsive sidebar+bottom-sheet, ThemeToggle+
  UserMenu)
- `app/admin/layout.tsx` — সম্পূর্ণ rewrite, `AdminSidebarNav` কল করে
  `session.user.name`/`email` prop হিসেবে পাস
- `app/admin/page.tsx` — clickable stat card + Pending Reports card
  + empty state
- নতুন: `scripts/test-admin-ui-polish.py`

কোনো migration লাগেনি, কোনো নতুন dependency লাগেনি (বিদ্যমান
`ThemeToggle`/`UserMenu`/base-ui `Dialog` primitive পুনর্ব্যবহার)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **Forum Moderation Panel এ এখনো pagination নেই** (`GET
  /api/admin/forum/posts` সব পোস্ট একবারে লোড করে) — বর্তমানে DB তে
  forum post সংখ্যা ছোট (personal-use app), তাই তাৎক্ষণিক প্রয়োজন
  নেই, কিন্তু ভবিষ্যতে পোস্ট সংখ্যা বাড়লে Admin Users এর একই
  search/filter/sort/pagination প্যাটার্ন প্রয়োগ করা যায়।
- **Content Reports প্যানেলেও pagination নেই** — একই কারণে আপাতত
  deprioritize করা হয়েছে।

---

## UI/UX Polish — Loading Skeletons সম্প্রসারণ (২০২৬-০৭-২২)

### প্রেক্ষাপট
Admin Panel UI/UX Polish ফিচারের পরে ব্যবহারকারী আবার "Next" বললে, আগে
থেকে ব্যবহারকারী "Existing feature UI/UX polish" পছন্দ করেছিলেন
(clarifying question এ) — তাই একই থিম অনুসরণ করে পরবর্তী polish item
বেছে নেওয়া হয়েছে। docs/MASTER_PLAN.md এর আগের "Loading UI" ফিচারের
Not Solved সেকশনে transparently লেখা ছিল: "বাকি ~৬০টা পেজে এখনো
নির্দিষ্ট loading.tsx নেই — এগুলো এখন global fallback ব্যবহার করে"।

### প্রোঅ্যাক্টিভ Audit পদ্ধতি
একটা bash+Python হাইব্রিড script দিয়ে সিস্টেমেটিকভাবে চেক করা হয়েছে:
1. সব `page.tsx` (dashboard + admin) ফাইল খুঁজে বের করা (৬৯টা)
2. প্রতিটার sibling ডিরেক্টরিতে `loading.tsx` আছে কিনা চেক (১৪টা
   পেজে ইতিমধ্যে ছিল)
3. বাকি ৫৫টার মধ্যে কোনগুলো **আসলেই DB query চালায়** (`await prisma.`
   গ্রেপ) — কারণ client-component-delegated পেজ (যেমন `forum/page.tsx`,
   `analytics/page.tsx`) নিজস্ব client-side loading state ব্যবহার
   করে, route-level `loading.tsx` এ তেমন মূল্য যোগ করে না
4. ফলাফল: ১০টা পেজ যেগুলো genuinely DB query চালায় কিন্তু কোনো
   loading skeleton নেই — এগুলোই এই ফিচারের স্কোপ

### নতুন loading.tsx (১০টা)
**Student-facing (৬টা)**:
- `app/(dashboard)/saved/loading.tsx` — bookmark list card শেপ
- `app/(dashboard)/settings/loading.tsx` — ট্যাব + ফর্ম ফিল্ড শেপ
- `app/(dashboard)/duel/loading.tsx` — subject selection grid শেপ
- `app/(dashboard)/practice/result/[attemptId]/loading.tsx` —
  স্কোর-সামারি কার্ড + প্রশ্নভিত্তিক রিভিউ লিস্ট শেপ (নতুন
  "result-page" skeleton প্যাটার্ন, আগে কোনো result পেজে skeleton
  ছিল না)
- `app/(dashboard)/cq-practice/result/[attemptId]/loading.tsx` —
  একই result-page প্যাটার্ন + ক/খ/গ/ঘ অংশের ৪-কার্ড শেপ
- `app/(dashboard)/live-exam/[sessionId]/result/loading.tsx` —
  সরলীকৃত single-card result শেপ

**Admin CMS (৪টা, Admin Panel এ প্রথমবার কোনো loading.tsx)**:
- `app/admin/subjects/loading.tsx`
- `app/admin/subjects/[subjectId]/loading.tsx` (Chapter Manager)
- `app/admin/chapters/[chapterId]/loading.tsx` (Topic Manager)
- `app/admin/topics/[topicId]/loading.tsx` (Question Manager, সবচেয়ে
  ভারী কোয়েরি — questions+cqQuestions+empirical difficulty
  calculation)

সব বিদ্যমান `components/ui/skeleton.tsx` (established `animate-pulse`
প্যাটার্ন) ও `components/ui/card.tsx` পুনর্ব্যবহার করে বানানো — কোনো
নতুন dependency/কম্পোনেন্ট লাগেনি।

### লাইভ multi-user টেস্ট (`scripts/test-loading-skeletons-expansion.py`, ১৮টা assertion)
১. Student-facing রুট (`/saved`, `/settings`, `/duel`) regression
২. Saved Topics empty state এখনো ঠিকভাবে কাজ করে (নতুন ইউজারের কোনো
   bookmark না থাকলে "এখনো কোনো টপিক সেভ করা হয়নি" বার্তা)
৩. Admin CMS রুট (`/admin/subjects`, `/admin/subjects/[id]`) regression
৪. **Filesystem-level ভেরিফিকেশন**: সব ১০টা নতুন `loading.tsx` ফাইল
   `os.path.exists()` দিয়ে সরাসরি চেক (established সীমাবদ্ধতা —
   sandbox এ headless browser নেই, তাই route-level loading UI
   "visually rendering হচ্ছে কিনা" সরাসরি verify করা যায় না; আগের
   Loading UI ফিচারের টেস্টেও এই একই সীমাবদ্ধতা ও পদ্ধতি ব্যবহৃত
   হয়েছিল — সোর্স ফাইল presence + build success + page.tsx এর আগের
   আচরণ regression-tested হওয়াই যথেষ্ট প্রমাণ)
৫. Authorization regression: unauthenticated `/saved` → `/login` redirect

### Test cleanup
১টা টেস্ট ইউজার (`loadingskel_student*`) প্রকৃত
`/api/user/delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। DB তে
সরাসরি চেক করে ভেরিফাই: ০টা টেস্ট ইউজার বাকি।

### পরিবর্তিত/নতুন ফাইল
- নতুন: `app/(dashboard)/saved/loading.tsx`
- নতুন: `app/(dashboard)/settings/loading.tsx`
- নতুন: `app/(dashboard)/duel/loading.tsx`
- নতুন: `app/(dashboard)/practice/result/[attemptId]/loading.tsx`
- নতুন: `app/(dashboard)/cq-practice/result/[attemptId]/loading.tsx`
- নতুন: `app/(dashboard)/live-exam/[sessionId]/result/loading.tsx`
- নতুন: `app/admin/subjects/loading.tsx`
- নতুন: `app/admin/subjects/[subjectId]/loading.tsx`
- নতুন: `app/admin/chapters/[chapterId]/loading.tsx`
- নতুন: `app/admin/topics/[topicId]/loading.tsx`
- নতুন: `scripts/test-loading-skeletons-expansion.py`

কোনো migration লাগেনি (সম্পূর্ণ frontend/presentational ফিচার), কোনো
নতুন dependency লাগেনি, কোনো বিদ্যমান `page.tsx` এর business logic
পরিবর্তন হয়নি (শুধু sibling `loading.tsx` যোগ)।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **এখনো বাকি অন্যান্য পেজ** — client-component-delegated পেজ
  (forum, analytics, admission, quiz-battle, pdf-chat, drill, badges,
  notifications, admin/forum, admin/reports, admin/notifications,
  admin/analytics ইত্যাদি) ইচ্ছাকৃতভাবে স্কোপের বাইরে রাখা হয়েছে —
  এগুলো নিজস্ব client-side `useState(loading)` + `<Loader2 />` spinner
  ব্যবহার করে যা route-level `loading.tsx` এর সাথে redundant/সাংঘর্ষিক
  না, কিন্তু নতুন content-শেপ route-level skeleton যোগ করলে marginal
  উপকার (route-level loading শুধু প্রাথমিক Server Component render
  চলাকালীন দেখা যায়, client component mount হওয়ার পরে নিজস্ব
  loading state কাজ করে)।

## প্রিমিয়াম থিম আপগ্রেড — নতুন ফন্ট + Animation (UI/UX Polish ধারাবাহিকতা)

### প্রেক্ষাপট
"Existing feature UI/UX polish" ধারাবাহিকতায় ব্যবহারকারী স্পষ্টভাবে বলেন:
"animation premium theme font aro ja ja ase lagaio ar lage hugging face
ba onno bivinno desing daikha kaj koro" — অর্থাৎ (১) animation যোগ করা,
(২) প্রিমিয়াম থিম, (৩) নতুন/ভালো ফন্ট, (৪) Hugging Face বা অন্যান্য
আধুনিক প্ল্যাটফর্মের ডিজাইন দেখে রেফারেন্স নিয়ে কাজ করা। Deep research
(web_search) করে Hugging Face এর হোমপেজ কাঠামো ও ২০২৫-২৬ সালের প্রিমিয়াম
SaaS ল্যান্ডিং পেজ ট্রেন্ড (aurora/mesh gradient, glassmorphism, bento
grid, restrained animation) দেখে সিদ্ধান্ত নেওয়া হয়েছে।

### ডিজাইন সিদ্ধান্ত ও কারণ
1. **নতুন Display ফন্ট নির্বাচন (Baloo Da 2)** — `next/font/google` এ
   উপলব্ধ ফন্ট তালিকা `node_modules` এর `font-data.json` থেকে সরাসরি
   Python দিয়ে যাচাই করা হয়েছে (bengali subset সাপোর্ট করে এমন ফন্ট
   খুঁজতে)। Baloo Da 2 — Ek Type এর তৈরি, Google Fonts এ bengali+latin
   subset সহ উপলব্ধ, weights ৪০০-৮০০ — একমাত্র জনপ্রিয় বাংলা Display
   typeface যা Duolingo-স্টাইল বন্ধুত্বপূর্ণ কিন্তু আত্মবিশ্বাসী।
   body text (Hind Siliguri) অপরিবর্তিত রাখা হয়েছে readability এর
   জন্য — শুধু হেডিং (h1-h4) এ প্রয়োগ। এটা একটা প্রচলিত প্রিমিয়াম SaaS
   ব্র্যান্ডিং প্যাটার্ন (headline এ personality font, body তে neutral
   font)।
2. **কেন পুরো re-theme না করে "utility class addition" পদ্ধতি** —
   বিদ্যমান ৭৩টা+ ফাইলে hardcoded `dark:` Tailwind variant আছে যা
   বর্তমান light/dark color architecture এর উপর নির্ভরশীল (accent-theme.ts
   এর একই সিদ্ধান্তের সাথে সামঞ্জস্যপূর্ণ)। তাই color palette স্পর্শ না
   করে শুধু নতুন independent CSS utility class (`aurora-bg`,
   `glass-panel`, `hover-lift`, `text-shimmer`, `glow-ring`,
   `grain-overlay`) যোগ করা হয়েছে যা বিদ্যমান `--background`/`--card`/
   `--primary` ইত্যাদি CSS variable এর উপর ভিত্তি করে তৈরি (`color-mix()`
   দিয়ে), তাই light/dark উভয় মোডেই স্বয়ংক্রিয়ভাবে সঠিক থাকে এবং accent
   color override এর সাথেও compatible (কারণ `var(--primary)` ব্যবহার
   করে, hardcoded রঙ না)।
3. **Framer Motion আন্ডার-ইউটিলাইজড ছিল** — package.json এ
   `framer-motion@^12.42.2` আগে থেকেই dependency ছিল, কিন্তু মাত্র ২টা
   কম্পোনেন্টে (`review-runner.tsx`, `breathing-exercise.tsx`) ব্যবহৃত
   হচ্ছিল। নতুন dependency যোগ না করেই বিদ্যমান লাইব্রেরি দিয়ে ল্যান্ডিং/
   ড্যাশবোর্ড/লগইন/রেজিস্ট্রেশন পেজে scroll-reveal animation যোগ করা
   সম্ভব হয়েছে।
4. **Accessibility-first animation** — `components/motion/fade-in.tsx`
   এর `FadeIn`/`StaggerGroup`/`StaggerItem` সব framer-motion এর
   `useReducedMotion()` hook চেক করে — reduced-motion ইউজারদের জন্য
   animation props সম্পূর্ণ স্কিপ করে (plain div রেন্ডার করে), যা
   globals.css এর বিদ্যমান CSS-level `prefers-reduced-motion`/
   `.reduced-motion` override এর *পরিপূরক* (defense-in-depth — CSS
   level এ transition-duration override করে, JS level এ animation prop
   ই বসে না)।

### নতুন CSS ইউটিলিটি (`app/globals.css`)
- `.aurora-bg` — ৩টা ধীরে ভাসমান radial-gradient blob (`::before`/
  `::after` pseudo-element + keyframe animation `aurora-drift-1`/`-2`,
  ২২-২৬ সেকেন্ড duration, `blur(90px)`)। Landing hero, Login, Register
  পেজের background এ ব্যবহৃত।
- `.glass-panel` — `backdrop-filter: blur(16px) saturate(160%)` +
  semi-transparent background/border (`color-mix()` দিয়ে বিদ্যমান
  `--card`/`--border` variable থেকে derive করা)। Landing navbar (স্ক্রল
  করলে), Login/Register card এ ব্যবহৃত।
- `.hover-lift` — `translateY(-4px)` + soft box-shadow on hover,
  cubic-bezier easing। Dashboard stat card, feature card, module tool
  card ইত্যাদিতে বিদ্যমান বিভিন্ন `hover:shadow-md`/`hover:shadow-lg`
  প্যাটার্ন consolidate করে একটাই consistent ক্লাসে।
- `.text-shimmer` — gradient background-clip:text সহ `background-position`
  sweep animation (৫ সেকেন্ড লুপ)। Landing hero headline এ ব্যবহৃত।
- `.glow-ring` — `::before` pseudo-element দিয়ে blur করা gradient glow,
  `glow-pulse` keyframe (৩ সেকেন্ড)। Primary CTA বাটন ও লোগো আইকনে
  ব্যবহৃত।
- `.grain-overlay` — inline SVG `feTurbulence` filter দিয়ে subtle noise
  texture (৩.৫%-৫% opacity, light/dark ভিন্ন), flat gradient background
  কে "printed"/প্রিমিয়াম টেক্সচার দেয়।

সব ইউটিলিটি pure CSS — কোনো নতুন npm dependency যোগ হয়নি।

### নতুন কম্পোনেন্ট (`components/motion/fade-in.tsx`)
- `FadeIn` — mount/scroll-into-view এ fade+slide animation, `direction`
  (up/down/left/right/none), `delay`, `duration`, `amount` (viewport
  trigger threshold) prop সহ। `viewport={{ once: true }}` — একবার
  দেখানোর পরে re-trigger হয় না।
- `StaggerGroup`/`StaggerItem` — গ্রিড/লিস্ট আইটেমে একে একে (delay-chained)
  entrance animation এর জন্য কনটেইনার+চাইল্ড প্যাটার্ন।

### পরিবর্তিত ফাইল
- `app/layout.tsx` — নতুন `Baloo_Da_2` font import (`next/font/google`,
  bengali+latin subset, weight ৫০০-৮০০), `--font-heading` CSS variable
  এ map করা, `<html>` এর `className` এ variable যোগ।
- `app/globals.css` — `--font-heading: var(--font-heading)` (আগে ছিল
  `var(--font-sans)`), `@layer base` এ `h1, h2, h3, h4 { @apply
  font-heading; }` নতুন নিয়ম (কোনো কম্পোনেন্টে ম্যানুয়াল className লাগে
  না), উপরে বর্ণিত ৬টা নতুন utility class।
- `app/page.tsx` (ল্যান্ডিং) — Server Component থেকে Client Component এ
  রূপান্তর ("use client", কারণ framer-motion hooks+scroll listener লাগে
  — কোনো DB/session data লাগত না বলে নিরাপদ), sticky glass navbar
  (scroll state track করে), Aurora+grain hero background, shimmer
  headline, glow-ring CTA, সব সেকশনে FadeIn/StaggerGroup।
- `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx` — Aurora+
  grain background, glass-panel card, glow-ring লোগো আইকন, FadeIn
  entrance — landing পেজের সাথে ব্র্যান্ড ধারাবাহিকতা।
- `app/(dashboard)/dashboard/page.tsx` — Header এ FadeIn, Stats strip এ
  StaggerGroup/StaggerItem, League Tier/Badges/Saved/Module Tools কার্ডে
  `hover-lift` (আগের ভিন্ন ভিন্ন `hover:shadow-md transition-shadow`
  প্যাটার্ন থেকে consolidate)।
- `components/layout/bottom-nav-bar.tsx` — Active ট্যাবে `layoutId`
  (framer-motion shared layout animation) দিয়ে স্প্রিং-অ্যানিমেটেড pill
  indicator (Instagram/Duolingo-স্টাইল, ট্যাব বদলালে স্লাইড করে)।

### লাইভ টেস্ট
- `scripts/test-premium-theme-landing.py` — ১৬টা assertion: landing/
  login/register পেজ ২০০ status + নতুন CSS class (aurora-bg,
  text-shimmer, glow-ring, glass-panel) + Baloo Da 2 font variable
  class serverside render হচ্ছে ভেরিফাই, রিয়েল register→CSRF→login→
  session→dashboard flow ভেঙে যায়নি (dashboard এ নতুন motion কম্পোনেন্ট
  ব্যবহার সত্ত্বেও কোনো crash/500 নেই)।
- `scripts/test-premium-theme-bottomnav.py` — ৮টা assertion: landing
  aurora-bg persistence + fresh register→login→dashboard flow +
  dashboard এ bottom-nav markup ("হোম" ট্যাব) ও hover-lift class
  উপস্থিতি + test cleanup delete সফল (একই স্ক্রিপ্টে end-to-end)।
- মোট ২৪টা assertion, দুই রাউন্ডে, সব PASS।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (কোনো type error না)।
2. `pnpm build` — সফল, `/` (ল্যান্ডিং) এখনো static (○) হিসেবে
   প্রি-রেন্ডার হচ্ছে (client component হওয়া সত্ত্বেও, কারণ কোনো dynamic
   data fetch নেই)।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python multi-round টেস্ট — ২৪/২৪ assertion PASS।
5. Test cleanup — ২টা টেস্ট ইউজার (দুই রাউন্ডে) প্রকৃত
   `/api/user/delete-account` POST endpoint দিয়ে ডিলিট, DB তে সরাসরি
   psycopg2 দিয়ে চেক করে `public.users` টেবিলে test prefix সহ কোনো রেকর্ড
   বাকি নেই ভেরিফাই করা হয়েছে।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **sandbox এ headless browser নেই** — animation/gradient/blur এর
  visual appearance সরাসরি স্ক্রিনশট নিয়ে verify করা যায়নি, শুধু
  server-rendered HTML এ CSS class/font-variable উপস্থিতি (grep-level)
  ও build/lint/runtime error-free থাকা ভেরিফাই করা হয়েছে (established
  সীমাবদ্ধতা, আগের UI ফিচারেও একই)।
- **অন্যান্য পেজে এখনো প্রয়োগ হয়নি** — Practice/Flashcards/Planner/
  Analytics ইত্যাদি ভেতরের পেজে এখনো নতুন aurora/glass/hover-lift
  ইউটিলিটি ব্যাপকভাবে প্রয়োগ হয়নি, শুধু সবচেয়ে বেশি দেখা প্রথম-ইমপ্রেশন
  পেজ (Landing/Login/Register/Dashboard) ও গ্লোবাল কম্পোনেন্ট (Bottom
  Nav, সব হেডিং ফন্ট) কভার করা হয়েছে — ভবিষ্যতে ইচ্ছা করলে বাকি পেজেও
  `hover-lift`/`FadeIn` ধীরে ধীরে ছড়ানো যায় (কোনো ব্রেকিং পরিবর্তন ছাড়া,
  ইউটিলিটি ক্লাসগুলো ইতিমধ্যে গ্লোবালি উপলব্ধ)।

## `hover-lift` Rollout — প্ল্যাটফর্ম-জুড়ে Consistent Hover Animation

### প্রেক্ষাপট
প্রিমিয়াম থিম আপগ্রেড ফিচারে নতুন `hover-lift` CSS ইউটিলিটি ক্লাস তৈরি
হয়েছিল (subtle `translateY(-4px)` + soft box-shadow, cubic-bezier
easing), কিন্তু শুধু Landing Page ও Dashboard পেজের কিছু কার্ডে প্রয়োগ
করা হয়েছিল। ব্যবহারকারী "Next" বলার পরে এই ধারাবাহিকতা পুরো প্ল্যাটফর্মে
ছড়ানোর সিদ্ধান্ত নেওয়া হয় — কারণ পুরনো কোডবেসে বিভিন্ন জায়গায়
`hover:shadow-md transition-shadow`/`hover:shadow-lg transition-shadow`
(flat shadow-only hover, elevation/lift ছাড়া) প্যাটার্ন ছিল, যা নতুন
প্রিমিয়াম `hover-lift` এর সাথে ইনকনসিস্টেন্ট দেখাত (কিছু কার্ডে lift
হয়, কিছুতে হয় না)।

### পদ্ধতি
1. Python regex দিয়ে `grep -rln "hover:shadow"` ও
   `grep -rln "transition-shadow"` চালিয়ে পুরো `app/`+`components/`
   ট্রি স্ক্যান করা হয়েছে (node_modules বাদ দিয়ে)।
2. প্রতিটা match ম্যানুয়ালি রিভিউ করে ৩ ধরনের প্যাটার্ন পাওয়া গেছে:
   - সরল static className (`className="p-5 hover:shadow-md
     transition-shadow cursor-pointer group"`)
   - Conditional className (template literal দিয়ে enabled/disabled
     state অনুযায়ী `hover:shadow-md cursor-pointer group` বনাম
     `opacity-50`)
   - Extra modifier সহ (Admin Dashboard এ `hover:border-primary/30`
     — এটা বজায় রাখা হয়েছে, শুধু shadow অংশ replace করা হয়েছে)
3. সব জায়গায় `hover:shadow-md/lg transition-shadow` কে `hover-lift`
   দিয়ে replace করা হয়েছে (এবং standalone `transition-shadow` যেখানে
   conditional className এর বাইরে ছিল, সেটাও সরানো হয়েছে কারণ
   `hover-lift` নিজেই transition define করে)।

### পরিবর্তিত ফাইল (১২টা)
- `app/(dashboard)/learn/page.tsx` — subject card
- `app/(dashboard)/saved/page.tsx` — saved topic card
- `app/(dashboard)/practice/page.tsx` — subject card (conditional enabled state)
- `app/(dashboard)/cq-practice/page.tsx` — subject card (conditional enabled state)
- `app/(dashboard)/mock-exam/page.tsx` — subject card (conditional enabled state)
- `app/admin/page.tsx` — stat card (`hover:border-primary/30` বজায় রেখে)
- `components/admission/admission-history.tsx` — history item card
- `components/dashboard/mistake-vault-reminder-card.tsx`
- `components/dashboard/review-queue-card.tsx`
- `components/flashcards/deck-card.tsx`
- `components/forum/forum-feed.tsx` — post card
- `components/reading-room/reading-room-dashboard.tsx` — room card
  (`role="button"`+keyboard accessibility বজায় রেখে)

### লাইভ টেস্ট
- `scripts/test-hover-lift-rollout.py` — ২১টা assertion: student
  register→login flow, ৫টা পেজ (`/learn`, `/saved`, `/practice`,
  `/cq-practice`, `/mock-exam`) ২০০ status + `hover-lift` class
  উপস্থিতি + পুরনো `hover:shadow-md transition-shadow` কোথাও অবশিষ্ট
  নেই, Admin লগইন+`/admin` পেজ একই যাচাই।
- `scripts/test-hover-lift-rollout-2.py` — ১৫টা assertion: বাকি ৪টা
  পেজ (`/flashcards`, `/forum`, `/reading-room`, `/dashboard`) ২০০
  status + কোনো পুরনো shadow-transition প্যাটার্ন অবশিষ্ট নেই।
- মোট ৩৬টা assertion, দুই স্ক্রিপ্টে, সব PASS।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল, কোনো নতুন error/warning নেই।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python multi-round টেস্ট — ৩৬/৩৬ assertion PASS।
5. Test cleanup — ২টা টেস্ট ইউজার (দুই স্ক্রিপ্টে) প্রকৃত
   `/api/user/delete-account` POST endpoint দিয়ে ডিলিট, DB তে সরাসরি
   psycopg2 দিয়ে চেক করে `public.users` টেবিলে test prefix সহ কোনো রেকর্ড
   বাকি নেই ভেরিফাই করা হয়েছে।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ (স্বচ্ছভাবে জানানো)
- **visual verification সীমিত** — sandbox এ headless browser না থাকায়
  actual "lift" animation এর ভিজ্যুয়াল ইফেক্ট সরাসরি স্ক্রিনশট দিয়ে
  verify করা যায়নি, শুধু HTML markup এ সঠিক CSS class উপস্থিতি ও পুরনো
  class অনুপস্থিতি (grep-level) + build/lint/runtime error-free থাকা
  ভেরিফাই করা হয়েছে।
- **কিছু কার্ড ইচ্ছাকৃতভাবে বাদ** — `app/admin/page.tsx` এর amber
  alert card (`hover:bg-amber-500/10 transition-colors`) স্পর্শ করা
  হয়নি কারণ এটা shadow/lift effect না, রঙ পরিবর্তনভিত্তিক alert
  emphasis — semantically ভিন্ন প্যাটার্ন, `hover-lift` এখানে প্রযোজ্য
  না।

## প্রিমিয়াম থিম — বাকি Auth পেজে সম্প্রসারণ

### প্রেক্ষাপট
প্রিমিয়াম থিম আপগ্রেড ফিচারে Login/Register পেজ Aurora gradient +
glassmorphism card + glow-ring লোগো পেয়েছিল, কিন্তু একই `app/(auth)/`
route group এর বাকি ৩টা পেজ (`forgot-password`, `reset-password`,
`onboarding`) audit করে দেখা গেল সেগুলো এখনো পুরনো flat gradient
(`bg-linear-to-br from-indigo-50 via-white to-purple-50
dark:from-indigo-950/30 dark:via-background dark:to-purple-950/20`)
ব্যবহার করছে — একই route group এর মধ্যে দুই ধরনের visual style থাকায়
ব্র্যান্ড ইনকনসিস্টেন্সি তৈরি হচ্ছিল (ইউজার Login থেকে Forgot Password এ
গেলে হঠাৎ পুরনো flat ব্যাকগ্রাউন্ডে ফিরে যেত)।

### পরিবর্তিত ফাইল
- `app/(auth)/forgot-password/page.tsx` — Aurora+grain background,
  glass-panel card, glow-ring লোগো আইকন, FadeIn entrance।
- `app/(auth)/reset-password/page.tsx` — একই প্যাটার্ন (Suspense boundary
  অক্ষত রাখা হয়েছে, `ResetPasswordForm` child component অপরিবর্তিত)।
- `app/(auth)/onboarding/page.tsx` — একই প্যাটার্ন, `max-w-lg` (বাকিগুলোর
  চেয়ে চওড়া কার্ড, কারণ batch/board selection grid আছে) বজায় রেখে।

তিনটাতেই একই ৩-লাইন প্যাটার্ন: `<div className="aurora-bg" />` +
`<div className="grain-overlay" />` + `<FadeIn>` wrapper card এর চারপাশে,
লোগো আইকনে `glow-ring` ক্লাস যোগ, card এ `glass-panel shadow-xl` যোগ।

### লাইভ টেস্ট
`scripts/test-auth-pages-premium-theme.py` — ১৬টা assertion:
- `/forgot-password`, `/reset-password` (unauthenticated, direct GET) —
  ২০০ status + `aurora-bg`/`glass-panel` class উপস্থিত + পুরনো flat
  gradient (`from-indigo-50 via-white to-purple-50`) কোথাও অবশিষ্ট নেই।
- `/onboarding` (login-gated) — রিয়েল register→CSRF→login flow এর পরে
  একই যাচাই + আসল `/api/user/onboarding` POST endpoint দিয়ে HSC ব্যাচ
  (2028) ও বোর্ড (ঢাকা) সেভ করার ফ্লো ভাঙেনি নিশ্চিত করা হয়েছে (শুধু UI
  markup verify না, actual API flow ও verify করা হয়েছে)।
- সবগুলো PASS।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python টেস্ট — ১৬/১৬ assertion PASS।
5. Test cleanup — ১টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   POST endpoint দিয়ে ডিলিট, DB তে সরাসরি psycopg2 দিয়ে চেক করে
   `public.users` টেবিলে কোনো test prefix রেকর্ড বাকি নেই ভেরিফাই।

### সীমাবদ্ধতা
- **onboarding পেজের batch/board selection বাটনে এখনো `hover-lift`
  প্রয়োগ হয়নি** — সেগুলো `transition-colors` (selected/unselected state
  টগল) ব্যবহার করে, যা `hover-lift` (elevation-based) এর চেয়ে ভিন্ন
  interaction প্যাটার্ন (radio-button-স্টাইল selection, hover এ lift
  করা বিভ্রান্তিকর হতে পারে) — ইচ্ছাকৃতভাবে অপরিবর্তিত রাখা হয়েছে।

## প্রিমিয়াম থিম — Badges ও Leaderboard পেজে অ্যানিমেশন পলিশ

### প্রেক্ষাপট
"Next" ধারাবাহিকতায় আরও পেজ অডিট করে দেখা গেল Badges (ব্যাজ গ্রিড) ও
Leaderboard (rank লিস্ট) পেজ দুটোতে এখনো কোনো Framer Motion entrance
animation বা `hover-lift` ইউটিলিটি প্রয়োগ হয়নি — এগুলো gamification
ফিচারের অংশ (XP/streak/badge/rank দেখানো, উচ্চ ব্যস্ততার পেজ), তাই
প্রিমিয়াম থিম rollout এ প্রাধান্য পাওয়া উচিত ছিল।

### ডিজাইন সিদ্ধান্ত
- **Badges পেজে conditional hover-lift** — শুধু অর্জিত (`isEarned`)
  ব্যাজ কার্ডে `hover-lift` প্রয়োগ করা হয়েছে, অনর্জিত (grayscale,
  opacity-50) কার্ডে না। কারণ: অনর্জিত ব্যাজ কার্ড clickable/interactive
  না (কোনো `<Link>`/`onClick` নেই, শুধু তথ্য দেখায়) — hover effect
  দেখালে ইউজার ভুলবশত মনে করতে পারে সেটা ক্লিকযোগ্য কিছু। এটা একটা
  ইচ্ছাকৃত affordance-সচেতন সিদ্ধান্ত (hover effect শুধু interactive
  element এ থাকা উচিত)।
- **Card এর `overflow-hidden` এর কারণে `glow-ring` বাদ** —
  `components/ui/card.tsx` এ ডিফল্ট `overflow-hidden` আছে (rounded
  corner বজায় রাখতে), যা `glow-ring` এর `::before` pseudo-element
  (যেটা `inset: -2px` দিয়ে card এর বাইরে ছড়িয়ে যায়) ক্লিপ করে ফেলত
  এবং glow দেখা যেত না। তাই Badges কার্ডে শুধু `hover-lift` রাখা হয়েছে,
  `glow-ring` বাদ দেওয়া হয়েছে (এই সীমাবদ্ধতা কোডে কমেন্ট আকারে নোট করা
  আছে)।
- **Leaderboard rank কার্ডে `direction="left"` StaggerItem** — অন্যান্য
  জায়গায় ডিফল্ট `direction="up"` ব্যবহৃত হলেও, rank লিস্ট (উপর থেকে
  নিচে সাজানো) এ "up" animation টা কনফিউজিং হতে পারত (মনে হতে পারত rank
  বদলাচ্ছে) — তাই "left" direction বেছে নেওয়া হয়েছে যা list-item এর
  স্বাভাবিক reading direction এর সাথে সামঞ্জস্যপূর্ণ।

### পরিবর্তিত ফাইল
- `app/(dashboard)/badges/page.tsx` — হেডার FadeIn, ব্যাজ গ্রিড
  StaggerGroup/StaggerItem (৫০ms delay), conditional `hover-lift`।
- `app/(dashboard)/leaderboard/page.tsx` — হেডার FadeIn, দুই ট্যাবের
  (League + Global) rank লিস্ট StaggerGroup (৩০ms delay,
  `direction="left"`) + `hover-lift` সব rank কার্ডে (নিজের rank কার্ড
  হাইলাইট — `border-primary bg-primary/5` — অপরিবর্তিত রাখা হয়েছে)।

### লাইভ টেস্ট
`scripts/test-badges-leaderboard-polish.py` — ১২টা assertion:
- Fresh student (নতুন register, ০টা অর্জিত ব্যাজ) দিয়ে Badges পেজ ২০০
  status + সঠিকভাবে সব ব্যাজ `grayscale` দেখাচ্ছে ভেরিফাই।
- Admin অ্যাকাউন্ট (DB তে সত্যিকারের ২টা অর্জিত ব্যাজ আছে, psycopg2 দিয়ে
  প্রি-ভেরিফাই করা হয়েছে) দিয়ে লগইন করে Badges পেজে `hover-lift` class
  উপস্থিত ভেরিফাই — অর্থাৎ conditional hover-lift লজিক বাস্তব ডেটার
  বিপরীতে সঠিকভাবে কাজ করছে।
- Leaderboard পেজে দুই ট্যাবের label + `hover-lift` উপস্থিতি ভেরিফাই।
- সব PASS।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python টেস্ট (fresh-user + admin দুই দৃশ্যপট) —
   ১২/১২ assertion PASS।
5. Test cleanup — ১টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   POST endpoint দিয়ে ডিলিট, DB তে সরাসরি psycopg2 দিয়ে চেক করে শূন্য
   বাকি ভেরিফাই। (Admin অ্যাকাউন্ট টেস্ট ডেটা না, স্থায়ী অ্যাকাউন্ট —
   কোনো ডিলিট/পরিবর্তন করা হয়নি, শুধু read-only login+page-load টেস্ট।)

### সীমাবদ্ধতা
- **Global leaderboard এ ৫০টা পর্যন্ত rank কার্ড stagger animate হয়**
  — খুব বেশি ইউজার থাকলে (৫০ এর বেশি, তবে `take: 50` limit আছে) সব
  কার্ড stagger হতে সামান্য সময় লাগতে পারে, তবে ৩০ms delay সেটা
  ন্যূনতম রাখে (৫০টা কার্ডের জন্য সর্বোচ্চ ~1.5 সেকেন্ড stagger span)।

## প্রিমিয়াম থিম — Analytics ও Study Group পলিশ

### প্রেক্ষাপট
"Next" ধারাবাহিকতায় বাকি টুল পেজ অডিট চালিয়ে Analytics Dashboard ও
Study Group পেজে animation/hover-lift গ্যাপ খুঁজে বের করা হয়।

### Analytics Dashboard — affordance-সচেতন সিদ্ধান্ত
`components/analytics/analytics-dashboard.tsx` এ Overall Stats গ্রিড
(৪টা StatCard: মাস্টারি/কুইজ নির্ভুলতা/ঘন্টা পড়াশোনা/স্ট্রিক) এ
FadeIn+StaggerGroup+hover-lift প্রয়োগ করা হয়েছে। কিন্তু চার্ট/গ্রাফ
কার্ডগুলো (Progress Trend line chart, Subject Performance bar chart,
Time Distribution pie chart, Weak Topics list, Misconception Patterns,
Confidence Analysis) **ইচ্ছাকৃতভাবে অপরিবর্তিত** রাখা হয়েছে — এগুলো
সম্পূর্ণ read-only ডেটা ভিজুয়ালাইজেশন (কোনো `<Link>`/`onClick` নেই),
তাই `hover-lift` প্রয়োগ করলে ভুল affordance signal দিত (মনে হতো এগুলো
ক্লিকযোগ্য/ইন্টারঅ্যাক্টিভ, যেখানে আসলে তা না)। এটা Badges পেজের একই
নীতি অনুসরণ করে (আগের সেশনে established)।

### Study Group — সঠিক clickable কার্ড খুঁজে বের করা
`components/study-group/study-group-dashboard.tsx` এ Reading Room এ
যোগ দেওয়ার শর্টকাট কার্ড — এটা সম্পূর্ণ `<Link href="/reading-room">`
এর ভেতরে (পুরো কার্ডই ক্লিকযোগ্য) — তাই এখানে `hover-lift` প্রয়োগ করা
সঠিক ছিল, পুরনো `hover:bg-muted/40 transition-colors` কে replace করা
হয়েছে।

### PDF Chat — ইচ্ছাকৃতভাবে বাদ (ভুল affordance এড়াতে)
`components/pdf-chat/pdf-chat-dashboard.tsx` এর ডকুমেন্ট লিস্ট কার্ড
পরীক্ষা করে দেখা গেছে প্রতিটা কার্ডের ভেতরে আলাদা "চ্যাট করো" বাটন আছে
(`<Link href={/pdf-chat/${doc.id}}><Button>`) — পুরো কার্ড নিজে
clickable/wrapped-in-Link না। তাই এখানে `hover-lift` প্রয়োগ করা হয়নি —
সেটা করলে ইউজার মনে করতে পারত পুরো কার্ডে ক্লিক করলেই চ্যাট খুলবে,
যেখানে আসলে শুধু নির্দিষ্ট বাটনে ক্লিক করতে হবে (misleading affordance)।

### লাইভ টেস্ট
`scripts/test-analytics-studygroup-polish.py` — ৬টা assertion:
register→login flow, `/analytics` পেজ (server component wrapper) ২০০
status, `/api/analytics` (client component যে API থেকে ডেটা fetch করে)
২০০ status, `/study-group` পেজ ২০০ status — সব PASS। (নোট: এই দুটো পেজ
client-component-delegated, তাই server-rendered HTML এ সরাসরি
`hover-lift` class দেখা যায় না — client-side hydration এর পরে দেখা
যায়। তাই টেস্ট শুধু পেজ/API ক্র্যাশ-ফ্রি থাকা ভেরিফাই করে, যা এই ধরনের
পেজের জন্য established সীমাবদ্ধতা।)

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python টেস্ট — ৬/৬ assertion PASS।
5. Test cleanup — ১টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   POST endpoint দিয়ে ডিলিট, DB তে সরাসরি psycopg2 দিয়ে চেক করে শূন্য
   বাকি ভেরিফাই।

## প্রিমিয়াম থিম — Duel/Quiz Battle/Mock Exam পলিশ

### প্রেক্ষাপট
"Next" ধারাবাহিকতায় gamification-adjacent প্রতিযোগিতামূলক ফিচার (Duel,
Quiz Battle, Mock Exam) অডিট করে animation/hover-lift গ্যাপ খুঁজে বের
করা হয়।

### Affordance-সচেতন সিদ্ধান্ত ধারাবাহিকতা
এই ফিচারেও আগের established নীতি অনুসরণ করা হয়েছে — "শুধু পুরো কার্ড
`<Link>`-wrapped/সরাসরি clickable হলেই `hover-lift`, নাহলে শুধু entrance
animation (stagger)":
- **Duel Lobby ওপেন চ্যালেঞ্জ কার্ড** — কার্ডের ভেতরে আলাদা "গ্রহণ করো"
  বাটন (`onClick={() => handleJoin(d.id)}`), পুরো কার্ড clickable না —
  তাই শুধু `StaggerGroup`/`StaggerItem` (`direction="left"`) যোগ করা
  হয়েছে, `hover-lift` না।
- **Mock Exam Mode কার্ড** — কার্ডের নিচে আলাদা "শুরু করো" বাটন
  (`onClick={() => startExam(mode.key)}`), একই কারণে শুধু stagger,
  hover-lift না।
- **Quiz Battle History শর্টকাট** — এটা পুরো কার্ডই `<Link
  href="/quiz-battle/history">` এর ভেতরে (সত্যিকারের fully-clickable
  কার্ড) — তাই পুরনো `hover:bg-muted/50 transition-colors` কে
  `hover-lift` দিয়ে replace করা সঠিক ছিল।

### পরিবর্তিত ফাইল
- `components/duel/duel-lobby.tsx` — ওপেন duel লিস্টে StaggerGroup।
- `components/mock-exam/mode-selector.tsx` — মোড কার্ড লিস্টে
  StaggerGroup।
- `components/quiz-battle/quiz-battle-home.tsx` — History শর্টকাট
  কার্ডে `hover-lift`।

### লাইভ টেস্ট ও একটা Pre-existing Dev-Mode আচরণ আবিষ্কার
`scripts/test-duel-quizbattle-mockexam-polish.py` — ৯টা assertion:
- register→login flow, `/duel`, `/quiz-battle` পেজ ২০০ status।
- `/mock-exam/subject/[realSubjectId]` — আসল DB থেকে নেওয়া subject ID
  (`পদার্থবিজ্ঞান ১ম পত্র`) দিয়ে পেজ লোড করে সাবজেক্ট নাম ও মোড টাইটেল
  (পূর্ণ বোর্ড ফরম্যাট/সংক্ষিপ্ত প্র্যাকটিস) সঠিকভাবে রেন্ডার হচ্ছে
  ভেরিফাই।
- **আবিষ্কার (pre-existing, এই সেশনের পরিবর্তনের কারণে না)**:
  non-existent subject ID দিয়ে রিকোয়েস্ট করলে `notFound()` কল হওয়া
  সত্ত্বেও Next.js 16 dev server (Turbopack) HTTP status code **200**
  রিটার্ন করে (proper 404 না) — কিন্তু response body তে ঠিকই কাস্টম
  বাংলা `app/not-found.tsx` কনটেন্ট (৪০৪ টেক্সট) থাকে। এটা একটা পরিচিত
  Next.js dev-mode React streaming আচরণ (production build এ সঠিক 404
  status code দেয়, dev এ initial response status client-side
  navigation resolve হওয়ার আগেই পাঠানো হয়)। টেস্ট assertion তাই status
  code এর বদলে response body তে "৪০৪" টেক্সট চেক করে (`scripts/`
  এর অন্য টেস্টেও একই প্যাটার্ন প্রযোজ্য হতে পারে ভবিষ্যতে)।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python টেস্ট — ৯/৯ assertion PASS (প্রথম রানে ১টা
   fail হয়েছিল ভুল assertion এর কারণে — status code 404 আশা করা
   হয়েছিল, উপরে বর্ণিত dev-mode আচরণ discover করে assertion ঠিক করা
   হয়েছে, root cause স্বচ্ছভাবে ডকুমেন্ট করা)।
5. Test cleanup — ২টা টেস্ট ইউজার (মূল টেস্ট + debug script রান) প্রকৃত
   `/api/user/delete-account` POST endpoint দিয়ে ডিলিট, DB তে সরাসরি
   psycopg2 দিয়ে চেক করে শূন্য বাকি ভেরিফাই।

## প্রিমিয়াম থিম — Admission/Forum/Notifications পলিশ

### প্রেক্ষাপট
"Next" ধারাবাহিকতায় বাকি টুল পেজ অডিটের অংশ হিসেবে Admission Prep,
Forum, Notification Center চেক করা হয়েছে।

### Affordance নীতি আরও একবার প্রয়োগ (established pattern)
- **Admission Prep Hub পরীক্ষা কার্ড** — কার্ডের নিচে আলাদা "মক টেস্ট
  শুরু করো" বাটন (`onClick={() => handleStart(exam.examType)}`), পুরো
  কার্ড clickable না — তাই শুধু `StaggerGroup`/`StaggerItem` (৮০ms
  delay) যোগ করা হয়েছে, `hover-lift` না। Mock Exam Mode Selector এর
  একই প্যাটার্ন (আগের সেশনে established)।
- **Forum Feed পোস্ট কার্ড** — এখানে ইতিমধ্যে আগের `hover-lift`
  rollout সেশনে `hover-lift` প্রয়োগ হয়েছিল (পুরো কার্ডই `<Link
  href={`/forum/${post.id}`}>` এর ভেতরে, fully-clickable)। এই সেশনে
  শুধু `StaggerGroup` (৪০ms delay) যোগ করে entrance animation যোগ
  করা হয়েছে (hover behavior অপরিবর্তিত)।
- **Notification Center আইটেম** — কার্ডের ভেতরে দুটো আলাদা ইন্টারঅ্যাক্টিভ
  এলিমেন্ট আছে: (১) মূল ক্লিক-এরিয়া `<button onClick={handleClick}>`
  (নোটিফিকেশন পড়া/অ্যাকশন), (২) hover-এ দেখা যাওয়া ডিলিট `<button>`।
  পুরো `<Card>` নিজে clickable/wrapped-in-Link না — তাই `hover-lift`
  যোগ করা হয়নি, শুধু `StaggerGroup` (৩০ms delay) দিয়ে entrance
  animation যোগ করা হয়েছে।

### Settings/Admin System panel — স্পর্শ করা হয়নি (সচেতন সিদ্ধান্ত)
`components/settings/settings-form.tsx`, `components/admin/audit-log-viewer.tsx`,
`components/admin/system-control-panel.tsx` পরীক্ষা করে দেখা গেছে
সেগুলোর `<Card>` ব্যবহার form-section/filter-panel হিসেবে (কোনো
navigation/click অ্যাকশন নেই, শুধু ফর্ম ফিল্ড/ফিল্টার/ডেটা গ্রুপ করার
জন্য) — এগুলো clickable card না, তাই `hover-lift`/stagger এর প্রাসঙ্গিক
না (badges/analytics পেজে established একই নীতি — শুধু genuinely
interactive/navigable element এ animation প্রয়োগ করা)।

### লাইভ টেস্ট
- `scripts/test-admission-forum-notifications-polish.py` — ৮টা
  assertion: register→login flow এর পরে `/admission`,
  `/api/admission/exams`, `/admission/history`, `/forum`,
  `/notifications` সব ২০০ status।
- `scripts/test-notifications-real-data.py` — ৪টা assertion: Admin
  অ্যাকাউন্ট (DB তে psycopg2 দিয়ে প্রি-ভেরিফাই করা সত্যিকারের ২টা
  notification) দিয়ে লগইন করে `/notifications` পেজ + `/api/notifications`
  API রিয়েল ডেটা রিটার্ন করছে ভেরিফাই (নিশ্চিত করা হয়েছে যে নতুন
  `StaggerGroup` কোড আসল আইটেম নিয়ে কাজ করার সময় crash করে না)।
- মোট ১২টা assertion, দুই স্ক্রিপ্টে, সব PASS।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python টেস্ট (fresh-user + admin real-data দুই
   দৃশ্যপট) — ১২/১২ assertion PASS।
5. Test cleanup — ১টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   POST endpoint দিয়ে ডিলিট, DB তে সরাসরি psycopg2 দিয়ে চেক করে শূন্য
   বাকি ভেরিফাই। (Admin অ্যাকাউন্ট টেস্ট ডেটা না, শুধু read-only
   login+page-load টেস্ট, কোনো ডিলিট/পরিবর্তন করা হয়নি।)

## প্রিমিয়াম থিম — Flashcards ও Reading Room পলিশ

### প্রেক্ষাপট
"Next" ধারাবাহিকতায় বাকি টুল পেজ অডিটের এই ধাপে Flashcards Hub,
Community Discover Deck Browser, Reading Room Leaderboard চেক করা
হয়েছে।

### পরিবর্তিত ফাইল
- `app/(dashboard)/flashcards/page.tsx` — হেডারে FadeIn, ডেক গ্রিডে
  StaggerGroup/StaggerItem (৫০ms delay)। `DeckCard` কম্পোনেন্টে
  ইতিমধ্যে `hover-lift` ছিল (আগের সেশনের rollout এ), অপরিবর্তিত।
- `components/flashcards/discover-deck-browser.tsx` — পাবলিক ডেক
  গ্রিডে StaggerGroup/StaggerItem (৫০ms delay)। `hover-lift` বাদ
  (কার্ডের নিচে আলাদা "কপি করো" import বাটন, পুরো কার্ড clickable না)।
- `components/reading-room/reading-room-leaderboard.tsx` — rank
  কার্ড লিস্টে StaggerGroup/StaggerItem (`direction="left"`, ৩০ms
  delay) — মূল Leaderboard পেজের একই প্যাটার্ন প্রয়োগ (conditional
  rendering branch গুলো — loading/empty/list — এর মধ্যে JSX
  restructure করার সময় একটা সাময়িক নেস্টেড-div bug হয়েছিল, ম্যানুয়ালি
  রিভিউ করে ঠিক করা হয়েছে, নিচে বিস্তারিত)।

### একটা ছোট bug আবিষ্কার ও সাথে সাথে ফিক্স (transparent reporting)
`reading-room-leaderboard.tsx` এ প্রথমবার edit করার সময় ভুলবশত পুরনো
`<div className="space-y-2">` wrapper মুছে না ফেলেই তার ভেতরে নতুন
`<StaggerGroup>` বসানো হয়েছিল — ফলে একটা redundant nested wrapper
তৈরি হয়েছিল (দুটো `space-y-2` div একসাথে) এবং closing tag mismatch
এর ঝুঁকি ছিল। `pnpm exec tsc --noEmit` চালানোর আগেই ম্যানুয়াল কোড
রিভিউতে ধরা পড়ে, `StaggerGroup` কে single wrapper হিসেবে rewrite করে
ঠিক করা হয়েছে (পুরো conditional branch — mapped list + "আমার rank"
card + "তুমি এখনো active না" মেসেজ — সব একটাই `StaggerGroup` এর
ভেতরে)। `tsc --noEmit` তারপর ক্লিন পাস করেছে।

### লাইভ টেস্ট
- `scripts/test-flashcards-readingroom-polish.py` — ৯টা assertion:
  register→login flow, `/flashcards` (empty-state prompt সহ),
  `/flashcards/discover`, `/api/flashcard-decks/discover` (নোট: প্রথম
  রানে ভুল endpoint path `/api/flashcards/discover` ব্যবহার করায় 405
  পেয়েছিল, actual route `app/api/flashcard-decks/discover/route.ts`
  খুঁজে বের করে ফিক্স করা হয়েছে), `/reading-room`,
  `/reading-room/leaderboard` সব ২০০ status।
- `scripts/test-flashcards-realdata-polish.py` — ৬টা assertion: আসল
  `POST /api/flashcard-decks` endpoint দিয়ে একটা real ডেক তৈরি করে
  `/flashcards` পেজে সেই ডেক নাম নতুন `StaggerGroup` কোডের মধ্যে
  সঠিকভাবে রেন্ডার হচ্ছে ভেরিফাই (শুধু empty-state না, real-data
  render path আলাদাভাবে টেস্ট করা)।
- মোট ১৫টা assertion, দুই স্ক্রিপ্টে, সব PASS।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (JSX restructure bug ফিক্স করার
   পরে)।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python টেস্ট (empty-state + real-data দুই
   দৃশ্যপট) — ১৫/১৫ assertion PASS।
5. Test cleanup — ২টা টেস্ট ইউজার (দুই স্ক্রিপ্টে) প্রকৃত
   `/api/user/delete-account` POST endpoint দিয়ে ডিলিট, ১টা টেস্ট
   ফ্ল্যাশকার্ড ডেক cascade-delete এ স্বয়ংক্রিয়ভাবে মুছে যাওয়া
   ভেরিফাই, DB তে সরাসরি psycopg2 দিয়ে চেক করে দুটোই শূন্য বাকি
   ভেরিফাই।

### সীমাবদ্ধতা
- **Reading Room Dashboard এর মূল পেজ (room list) এ নতুন করে
  entrance animation যোগ করা হয়নি** — এই কম্পোনেন্টটা ইতিমধ্যে
  জটিল (polling-based real-time room presence, `hover-lift` আগের
  সেশনে room card এ প্রয়োগ করা আছে) — আরও animation যোগ করলে
  over-engineering হতে পারত বলে স্কোপের বাইরে রাখা হয়েছে।

## প্রিমিয়াম থিম — Intro পেজ ও Chapter Selection পলিশ (Series সমাপ্তি)

### প্রেক্ষাপট
এটা "Next" ধারাবাহিকতায় শুরু হওয়া প্রিমিয়াম থিম/অ্যানিমেশন rollout
সিরিজের শেষ ধাপ — Mistake Vault/Timed Drill/Smart Practice Intro
পেজ ও Practice/CQ Practice Chapter Selection পেজে animation গ্যাপ
চেক করে পূরণ করা হয়েছে। এই সিরিজে ইতিমধ্যে কভার করা হয়েছে: Landing,
Auth (Login/Register/Forgot/Reset/Onboarding), Dashboard, Learn/
Practice/CQ/Mock-Exam subject list, Badges/Leaderboard, Analytics/
Study-Group, Duel/Quiz-Battle, Admission/Forum/Notifications,
Flashcards/Reading-Room। এই ধাপের পরে সব মূল student-facing পেজ
কভার হয়ে গেছে।

### পরিবর্তিত ফাইল
- `components/practice/mistake-vault-intro.tsx`,
  `components/practice/drill-intro.tsx`,
  `components/practice/adaptive-practice-intro.tsx` — সব ৩টাতেই
  হেডারে FadeIn (`direction="down"`)। ভেতরের সিলেকশন বাটন (সাবজেক্ট/
  সময়সীমা টগল) অপরিবর্তিত — এগুলো navigation card না, radio-button-
  স্টাইল selection UI, তাই stagger/hover-lift প্রাসঙ্গিক না।
- `app/(dashboard)/practice/[subjectId]/page.tsx`,
  `app/(dashboard)/cq-practice/[subjectId]/page.tsx` — উভয়েই হেডার
  FadeIn + chapter কার্ড লিস্টে StaggerGroup/StaggerItem (৪০ms delay)।
  `hover-lift` বাদ (প্রতিটা কার্ডে একাধিক আলাদা action বাটন — "শুরু
  করো"/"শুধু বোর্ড প্রশ্ন"/"প্রি-টেস্ট দাও" ইত্যাদি — পুরো কার্ড
  একক-উদ্দেশ্যে clickable না)।

### একটা lint warning ধরা পড়ে সাথে সাথে ফিক্স
`mistake-vault-intro.tsx` এ প্রথমে `FadeIn, StaggerGroup, StaggerItem`
তিনটাই import করা হয়েছিল (কপি-পেস্ট প্যাটার্নের অভ্যাসবশত), কিন্তু
রিভিউ করে দেখা গেল এই কম্পোনেন্টে StaggerGroup ব্যবহারের কোনো card-list
নেই (সাবজেক্ট বাটন `<button>` টগল, `<Card>` না) — শুধু `FadeIn`
ব্যবহৃত। `pnpm lint` চালানোর সময় `@typescript-eslint/no-unused-vars`
warning এ ধরা পড়ে, অপ্রয়োজনীয় import সরিয়ে ফিক্স করা হয়েছে (২টা
warning → ০)।

### লাইভ টেস্ট
`scripts/test-intro-pages-chapter-selection-polish.py` — ১৩টা
assertion: register→login flow দিয়ে `/mistake-vault`, `/drill`,
`/adaptive-practice` (প্রতিটাতে সঠিক টাইটেল টেক্সট যাচাই সহ) +
`/practice/[realSubjectId]`, `/cq-practice/[realSubjectId]` (আসল DB
সাবজেক্ট ID "পদার্থবিজ্ঞান ১ম পত্র" দিয়ে, সঠিক সাবজেক্ট নাম রেন্ডার
যাচাই সহ) সব ২০০ status — সব PASS।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল (২ বার রান করা হয়েছে — একবার lint warning ফিক্স
   করার আগে, একবার পরে — দুটোতেই build সফল হয়েছিল, শুধু lint এ warning
   ছিল যা error না হলেও clean code এর জন্য ফিক্স করা হয়েছে)।
3. `pnpm lint` — ক্লিন (unused import fix করার পরে, প্রথমবার ২টা
   warning ছিল)।
4. লাইভ dev server এ Python টেস্ট — ১৩/১৩ assertion PASS।
5. Test cleanup — ১টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   POST endpoint দিয়ে ডিলিট, DB তে সরাসরি psycopg2 দিয়ে চেক করে শূন্য
   বাকি ভেরিফাই।

### সামগ্রিক প্রিমিয়াম থিম Rollout Series — সারসংক্ষেপ
এই কয়েকটা সেশনে সম্পন্ন প্রিমিয়াম থিম/animation rollout এর সম্পূর্ণ
তালিকা (নতুন ফিচারের জন্য reference):
1. মূল থিম আপগ্রেড (Baloo Da 2 ফন্ট, aurora/glass/shimmer/glow CSS
   ইউটিলিটি, `components/motion/fade-in.tsx`)
2. `hover-lift` rollout (১২+ জায়গা, পুরনো `hover:shadow-md/lg
   transition-shadow` প্যাটার্ন consolidate)
3. বাকি Auth পেজ (Forgot/Reset/Onboarding)
4. Badges/Leaderboard
5. Analytics/Study Group
6. Duel/Quiz Battle/Mock Exam
7. Admission/Forum/Notifications
8. Flashcards/Reading Room
9. Intro পেজ ও Chapter Selection (এই এন্ট্রি)

**Established নীতি (প্রতিটা ধাপে অনুসরণ করা হয়েছে)**: `hover-lift`
শুধু পুরো কার্ড সরাসরি `<Link>`-wrapped/fully-clickable হলেই প্রয়োগ
করা হয়েছে; কার্ডের ভেতরে আলাদা action বাটন থাকলে (নেভিগেশন card না)
শুধু stagger/FadeIn entrance animation প্রয়োগ করা হয়েছে — কখনো ভুল
affordance signal দেওয়া হয়নি।

## 🐛 গুরুতর বাগ ফিক্স — Exam Submit Race Condition (৫টা endpoint)

### প্রেক্ষাপট
প্রিমিয়াম থিম rollout সিরিজ সম্পূর্ণ হওয়ার পরে ব্যবহারকারী "প্রোঅ্যাক্টিভ
বাগ/এজ-কেস শিকার" নির্দেশ দেন। সম্পূর্ণ `app/api/` ডিরেক্টরি (১৭২টা
`route.ts` ফাইল) Python static-analysis script দিয়ে systematically
স্ক্যান করা হয়েছে — established বাগ ক্লাস (এই কোডবেসে আগেও Task/
StudyPlanItem/QuizBattle-submit/QuizDuel এ পাওয়া গিয়েছিল এবং ফিক্স করা
হয়েছিল) আবার কোথাও মিস হয়ে গেছে কিনা যাচাই করতে।

### পদ্ধতি (৩টা ধাপে)
1. **Ownership check স্ক্যান**: `params: Promise<{...Id}>` প্যাটার্ন
   ব্যবহার করা সব route এ mutating (PATCH/PUT/DELETE) ও GET handler
   বের করে দেখা হয়েছে auth check + ownership check (userId comparison
   অথবা `where: { userId }` ক্লজ) আছে কিনা। ১৯টা mutating + ১৪টা GET
   handler পরীক্ষা করে ৬টা সন্দেহজনক (regex miss) পাওয়া গেছে — সব
   ম্যানুয়ালি রিভিউ করে false-positive প্রমাণিত (`getOwnedSet()`/
   `getOwnedDocument()`/`verifyOwnership()` হেল্পার ব্যবহারের কারণে,
   অথবা Chapter/Topic এর মতো shared curriculum content এ per-user
   ownership অপ্রাসঙ্গিক)।
2. **Status-check race condition স্ক্যান**: `if (x.status !== "Y")`
   টাইপ প্যাটার্ন খুঁজে বের করে দেখা হয়েছে সেটার পরে plain `.update()`
   কল আছে নাকি atomic `.updateMany()` claim। ৭টা ফাইলে candidate পাওয়া
   গেছে, প্রতিটা ম্যানুয়ালি রিভিউ করে **৬টা আসল বাগ** (৫টা মূল + ১টা
   বোনাস কম-গুরুতর) চিহ্নিত করা হয়েছে।
3. **প্রতিটা candidate লাইভ concurrency টেস্ট দিয়ে verify করা** —
   Python `threading` module দিয়ে সত্যিকারের ৩-৫টা concurrent HTTP
   request পাঠিয়ে দেখা হয়েছে কয়টা সফল হয় (প্রত্যাশিত ১টা, বাগ থাকলে
   একাধিক)।

### আবিষ্কৃত বাগ (severity অনুযায়ী)

**১. Mock Exam CQ Submit** (`app/api/mock-exam/[attemptId]/submit-cq/route.ts`)
— **সবচেয়ে গুরুতর**। `attempt.status === "COMPLETED"` চেক শুরুতে ছিল,
কিন্তু আসল `update()` কল হতো handler এর একদম শেষে — সব CQ প্রশ্ন AI
দিয়ে evaluate করে, XP দেওয়ার পরে। অর্থাৎ পুরো ব্যয়বহুল অংশটাই
vulnerable window এর ভেতরে ছিল। লাইভ টেস্টে ৩টা concurrent request
পাঠিয়ে ৩টাই সফল হয়েছে, ২টা CQ প্রশ্নে মোট **৬টা** `CQAttempt` রো তৈরি
হয়েছে (প্রত্যাশিত ২টা)। অ-শূন্য উত্তরে এটা duplicate ব্যয়বহুল AI API
call ও duplicate XP award ঘটাতো।

**২. Live Exam Submit** (`lib/live-exam.ts` এর `submitLiveExam()`) —
`session.status !== "IN_PROGRESS"` read-then-write, `awardXp()` কল এর
কোনো secondary guard ছিল না। লাইভ টেস্টে ৫টা concurrent request এ ৫টাই
সফল — প্রতিটাই XP award করতে পারত (এই কোডবেসের অন্য XP endpoint গুলোর
মতো `updateMany` guard না থাকায় সবচেয়ে সরাসরি double-award ঝুঁকি)।

**৩. Mock Exam MCQ Submit** (`app/api/mock-exam/[attemptId]/submit-mcq/route.ts`)
— একই read-then-write প্যাটার্ন, কোনো XP জড়িত না কিন্তু score/answer
ডেটা ইনকনসিস্টেন্ট হতে পারত। ৩টা concurrent request এ ৩টাই সফল।

**৪. Admission Mock Test Submit** (`app/api/admission/[attemptId]/submit/route.ts`)
— একই প্যাটার্ন, correctCount/wrongCount ওভাররাইট ঝুঁকি। ৩টা concurrent
request এ ৩টাই সফল।

**৫. Content Report Action** (`lib/content-report-actions.ts` এর
`applyReportAction()`) — `report.status !== "PENDING"` read-then-write।
এটা single+bulk দুই endpoint এই শেয়ার্ড হওয়ায় প্রভাব বেশি। ৫টা concurrent
RESOLVE request এ ৫টাই সফল হয়েছে। DELETE_AND_BAN action এ এটা duplicate
পোস্ট-ডিলিট চেষ্টা (যদিও দ্বিতীয়বার `forumPost.delete()` আসলে P2025
crash করতো কারণ প্রথমটা already delete করে ফেলেছে — তাই আসলে race win
করা request গুলোর মধ্যে যেটা প্রথমে delete করে ফেলত, তার পরেরটা crash
করতো) ও duplicate ban/notification এর ঝুঁকি তৈরি করত।

**৬. (বোনাস, কম গুরুতর) Quiz Battle Start** (`lib/quiz-battle.ts` এর
`startQuizBattle()`) — একই read-then-write প্যাটার্ন, কিন্তু কোনো XP/AI
cost জড়িত না — শুধু owner এর concurrent একাধিক ক্লিকে `startedAt`
বারবার reset হওয়ার ঝুঁকি ছিল। ধারাবাহিকতার জন্য একই সেশনে ফিক্স করা
হয়েছে।

### ফিক্স প্যাটার্ন (established, সব ৬টাতেই প্রযোজ্য)
প্রতিটাতে:
```
// আগে (বাগ):
if (x.status !== "EXPECTED") throw/return error;
... (ব্যয়বহুল কাজ/স্কোরিং) ...
await prisma.x.update({ where: { id }, data: { status: "NEW", ... } });

// পরে (ফিক্স):
const claimResult = await prisma.x.updateMany({
  where: { id, status: "EXPECTED" },
  data: { status: "NEW", ... },
});
if (claimResult.count === 0) return error; // অন্য request রেস জিতেছে
... (তারপরেই ব্যয়বহুল কাজ, শুধু winner request এর জন্য) ...
```
Mock Exam CQ Submit এ atomic claim সবচেয়ে আগে (কোনো AI call/DB write এর
আগেই) বসানো হয়েছে — Live Exam এ score calculation এর পরে কিন্তু
`awardXp()` এর আগে বসানো হয়েছে (score calculation নিজে read-only, তাই
race-condition-এ প্রভাব ফেলে না)।

### পরিবর্তিত ফাইল
- `lib/content-report-actions.ts` — `applyReportAction()` এ atomic claim।
- `app/api/mock-exam/[attemptId]/submit-mcq/route.ts` — atomic claim।
- `app/api/mock-exam/[attemptId]/submit-cq/route.ts` — atomic claim
  (সবচেয়ে আগে, AI call এর আগে বসানো)।
- `app/api/admission/[attemptId]/submit/route.ts` — atomic claim।
- `lib/live-exam.ts` — `submitLiveExam()` এ atomic claim।
- `lib/quiz-battle.ts` — `startQuizBattle()` এ atomic claim (বোনাস ফিক্স)।

### লাইভ টেস্ট (৯টা স্ক্রিপ্ট, মোট ৮৩টা+ assertion)
Concurrency টেস্ট (প্রতিটাতে fix এর আগে বাগ reproduce করে, fix এর পরে
আবার রান করে confirm করা হয়েছে):
- `scripts/test-content-report-race-condition.py` — ১০ assertion
  (RESOLVE, exactly ১/৫ সফল)।
- `scripts/test-content-report-race-condition-delete.py` — ১৩ assertion
  (DELETE_AND_BAN, exactly ১/৫ সফল, no P2025 crash, author ঠিক একবার
  ban)।
- `scripts/test-mockexam-mcq-race-condition.py` — ৫ assertion।
- `scripts/test-mockexam-cq-race-condition.py` — ১০ assertion (DB তে
  CQAttempt রো সংখ্যা সরাসরি psycopg2 দিয়ে চেক করে exactly ২টা)।
- `scripts/test-admission-submit-race-condition.py` — ৭ assertion।
- `scripts/test-liveexam-submit-race-condition.py` — ৭ assertion (XP
  ঠিক একবার award হয়েছে ভেরিফাই)।
- `scripts/test-quizbattle-start-race-condition.py` — ৫ assertion।

Regression টেস্ট (fix স্বাভাবিক flow না ভাঙা নিশ্চিত করতে):
- `scripts/test-content-report-regression.py` — ২২ assertion (single+
  bulk report action, re-action idempotency ৪০০ error)।
- `scripts/test-exam-flows-regression.py` — ২৪ assertion (Mock Exam/
  Admission/Live Exam/Quiz Battle এর সম্পূর্ণ start→submit→result-page
  end-to-end flow স্বাভাবিক non-concurrent ব্যবহারে)।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (ফিক্সের পরে)।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python concurrency+regression টেস্ট — সব ৮৩+
   assertion PASS (fix এর আগে/পরে দুই দফায় রান করে বাগ reproduce ও ফিক্স
   ভেরিফাই করা হয়েছে, transparently ডকুমেন্ট করা)।
5. Test cleanup — মোট ১২+টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   POST endpoint দিয়ে ডিলিট। ১টা leftover ইউজার (একটা টেস্ট স্ক্রিপ্টের
   প্রথম রানে ভুল API endpoint path ব্যবহারের কারণে script crash করে
   cleanup না হয়ে থেকে গিয়েছিল) ম্যানুয়ালি খুঁজে বের করে একই delete-account
   API দিয়ে cleanup করা হয়েছে — স্বচ্ছভাবে রিপোর্ট করা হলো। DB তে সরাসরি
   psycopg2 দিয়ে চেক করে সব টেস্ট ইউজার শূন্য বাকি ভেরিফাই।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ
- **এই বাগ ক্লাসের জন্য কোনো lint rule/CI check যোগ করা হয়নি** — future
  এ নতুন কোনো submit/status-transition endpoint লেখার সময় ম্যানুয়ালি
  এই established প্যাটার্ন (atomic `updateMany` claim) মনে রেখে
  প্রয়োগ করতে হবে। ভবিষ্যতে চাইলে একটা custom ESLint rule বা code review
  checklist item হিসেবে ফরমালাইজ করা যায়।
- **Mock Exam Submit-CQ এর AI evaluation ব্যর্থ হলে (`catch` ব্লকে)
  totalCqScore তে যোগ হয় না** — এটা pre-existing intentional আচরণ
  (একটা CQ evaluate করতে ব্যর্থ হলেও বাকিগুলো চালিয়ে যাওয়া), এই ফিক্সের
  স্কোপের বাইরে, স্পর্শ করা হয়নি।

## 🐛 বাগ ফিক্স — Study Pet Lazy-Create Race Condition

### প্রেক্ষাপট
Exam Submit Race Condition ফিক্স সিরিজ (৬টা read-then-write status-check
বাগ) এর পরে, একটা আলাদা কিন্তু একই পরিবারের established বাগ ক্লাস
("lazy create on unique field", `ForumVote`/`ForumReport` এ আগে পাওয়া
গিয়েছিল ও ফিক্স করা হয়েছিল) পুরো কোডবেসে আবার systematically স্ক্যান
করা হয়েছে।

### পদ্ধতি
Python static-analysis script দিয়ে `app/api/` ও `lib/` এ
`findFirst()`/`findUnique()` এর পরে ২০ লাইনের মধ্যে `.create()` কল আছে
এমন প্যাটার্ন খুঁজে বের করা হয়েছে (P2002 handling নেই এমন)। ১৩টা
candidate পাওয়া গেছে — প্রতিটা ম্যানুয়ালি রিভিউ করে বেশিরভাগই
false-positive প্রমাণিত হয়েছে:
- `app/api/ai-chat/route.ts`, `app/api/auth/register/route.ts` —
  ইউজার-ইনপুট-নির্ভর normal validation flow, race condition এর
  প্রাসঙ্গিক না (উদাহরণ: register এ duplicate email চেক — এটা আগে থেকেই
  `@unique` email এর উপর নির্ভর করে, duplicate হলে DB নিজেই ব্লক করে,
  কোনো crash হয় না কারণ error handling `try/catch` এ আছে)।
- `app/api/flashcard-decks/[deckId]/import/route.ts` — প্রতিটা import
  request একটা নতুন, independent (non-unique-constrained) ডেক তৈরি
  করে, কোনো race condition সম্ভব না।
- `app/api/forum/posts/[postId]/replies/route.ts`,
  `app/api/notes/[topicId]/to-flashcards/route.ts`,
  `app/api/practice/result/[attemptId]/wrong-to-flashcards/route.ts`
  — এগুলোতে `create()` কোনো `@unique` ফিল্ডের উপর নির্ভর করে না
  (একাধিকবার তৈরি হওয়া বৈধ/ক্ষতিকর না — যেমন `wrong-to-flashcards` এ
  ইচ্ছাকৃতভাবে ডুপ্লিকেট-প্রতিরোধ নেই, কমেন্টে ডকুমেন্টেড)।
- `app/api/forum/reports/route.ts`, `lib/quiz-battle.ts`,
  `lib/quiz-duel.ts`, `lib/study-group.ts` — এগুলো আগের সেশনগুলোতে
  ইতিমধ্যে এই একই বাগ ক্লাসের জন্য ফিক্স করা হয়েছিল (try/catch P2002,
  বা `$transaction`+lock)।
- **`lib/study-pet.ts` এর `getOrCreateStudyPet()` — একমাত্র আসল বাগ।**

### বাগ বিস্তারিত
```
// আগে (বাগ):
let pet = await prisma.studyPet.findUnique({ where: { userId } });
if (!pet) {
  pet = await prisma.studyPet.create({ data: { userId } }); // P2002 রিস্ক
}
return pet;
```
`StudyPet.userId` তে `@unique` constraint আছে। Planner পেজ প্রথমবার
লোড হওয়ার সময় (React concurrent rendering/Strict Mode double-invoke,
দ্রুত নেভিগেশন, একাধিক ট্যাব) একাধিক concurrent `GET /api/study-pet`
request একসাথে `pet === null` দেখতে পারে, সবাই `create()` কল করার
চেষ্টা করে — প্রথমটা সফল হয়, বাকিগুলো P2002 তে crash করে অ্যানহ্যান্ডেল্ড
৫০০ error দেয়। লাইভ টেস্টে ৫টা concurrent request পাঠিয়ে ৪টা crash
নিশ্চিত হয়েছে।

### ফিক্স
`lib/forum-vote.ts` এর established প্যাটার্ন অনুসরণ করে:
```
// পরে (ফিক্স):
return prisma.studyPet.upsert({
  where: { userId },
  create: { userId },
  update: {},
});
```
`upsert()` Postgres এ single `INSERT ... ON CONFLICT (userId) DO UPDATE`
স্টেটমেন্টে কম্পাইল হয় — সম্পূর্ণ DB-level atomic। `update: {}` (খালি)
মানে বিদ্যমান রো থাকলে কিছু পরিবর্তন হয় না (শুধু রিটার্ন করা হয়)।

### লাইভ টেস্ট
- `scripts/test-studypet-lazy-create-race-condition.py` — ৫টা
  assertion: fix এর আগে বাগ reproduce (৪/৫ crash), fix এর পরে ৫/৫
  সফল + DB তে সরাসরি psycopg2 দিয়ে চেক করে exactly ১টা `StudyPet` রো।
- `scripts/test-studypet-regression.py` — ১৩টা assertion: প্রথমবার
  GET (lazy create), দ্বিতীয়বার GET (idempotent, একই পেট), rename,
  পোমোডোরো সেশন সম্পূর্ণ করে feed করা (carePoints বৃদ্ধি ভেরিফাই),
  Planner পেজ লোড — সব স্বাভাবিক flow অক্ষত।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python টেস্ট (concurrency + regression) — ১৮/১৮
   assertion PASS।
5. Test cleanup — ২টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   POST endpoint দিয়ে ডিলিট, DB তে সরাসরি psycopg2 দিয়ে চেক করে শূন্য
   বাকি ভেরিফাই।

### সীমাবদ্ধতা/পর্যবেক্ষণ
এই "lazy create on unique field" বাগ ক্লাস এখন ৩ বার পাওয়া গেছে
(ForumVote, ForumReport, StudyPet) — ভবিষ্যতে নতুন কোনো per-user
singleton resource (unique userId ফিল্ড সহ মডেল) লেখার সময় ডিফল্টভাবে
`upsert()` ব্যবহার করা উচিত `findUnique`+`create` এর বদলে, যদি না
`lib/system-settings.ts` এর মতো বিশেষ কারণ থাকে (updatedAt bump এড়াতে)
— এই সিদ্ধান্ত-বৃক্ষ ভবিষ্যতে code review checklist এ যোগ করা যেতে পারে।

## 🐛 বাগ ফিক্স — Per-User Capacity Limit Race Condition (৩টা endpoint)

### প্রেক্ষাপট
Study Pet Lazy-Create Race Condition ফিক্সের ধারাবাহিকতায় আরও একটা
established বাগ ক্লাস স্ক্যান করা হয়েছে: "count-then-create capacity
check race condition"। এটা আগে Study Group এর `maxMembers` ও Quiz
Battle এর `maxPlayers` এ পাওয়া গিয়েছিল (`scripts/test-capacity-race-condition-audit.py`
এ ডকুমেন্টেড, আগের সেশনে ফিক্স করা হয়েছিল)। সেই audit শুধু ২টা
endpoint (join-based capacity) কভার করেছিল — এবার পুরো `app/api/`
এ `prisma.X.count()` ব্যবহার করা সব endpoint (create-based capacity)
স্ক্যান করা হয়েছে।

### পদ্ধতি
`prisma\.\w+\.count\s*\(` প্যাটার্নের সব match (১৩টা) বের করে প্রতিটা
ম্যানুয়ালি রিভিউ করা হয়েছে — কোনগুলো "count করে limit চেক করে তারপর
create()" প্যাটার্নে আছে সেটা যাচাই করতে। যেগুলো শুধু read-only
analytics/pagination (Admin Analytics, Audit Log, Notifications list,
Push Test) সেগুলো বাদ দেওয়া হয়েছে — শুধু capacity-gate করা `create()`
endpoint গুলো টেস্ট করা হয়েছে।

### আবিষ্কৃত বাগ (৩টা, একই প্যাটার্ন)

**১. Habit** (`app/api/habits/route.ts`, `MAX_HABITS_PER_USER = 10`)
— ৯টা বিদ্যমান habit রেখে ৫টা concurrent `POST /api/habits` পাঠিয়ে
৫টাই সফল (২০১) হয়েছে, DB তে চূড়ান্ত count হয়েছে **১৪টা** (MAX ১০
সম্পূর্ণ bypass)।

**২. Custom Question Set** (`app/api/custom-question-sets/route.ts`,
`MAX_SETS_PER_USER = 20`) — ১৯টা বিদ্যমান সেট রেখে ৫টা concurrent
request এ ৫টাই সফল, চূড়ান্ত count **২৪টা**।

**৩. PDF Chat Upload** (`app/api/pdf-chat/route.ts`,
`MAX_DOCS_PER_USER = 10`) — **সবচেয়ে গুরুত্বপূর্ণ কেস** কারণ প্রতিটা
সফল আপলোড `processUploadedPdf()` ট্রিগার করে যা টেক্সট এক্সট্রাকশন +
AI embedding generation (real API cost) করে। ৯টা বিদ্যমান ডকুমেন্ট
রেখে ৫টা concurrent upload এ ৫টাই সফল, চূড়ান্ত count **১৪টা** —
অর্থাৎ bypass এর মাধ্যমে অতিরিক্ত ৪টা অপ্রত্যাশিত ব্যয়বহুল AI call
ট্রিগার হতে পারত।

### ফিক্স প্যাটার্ন (established, Study Group থেকে পুনর্ব্যবহৃত)
```
// আগে (বাগ):
const existingCount = await prisma.X.count({ where: { userId } });
if (existingCount >= MAX) return errorResponse;
const item = await prisma.X.create({ data: { userId, ... } });

// পরে (ফিক্স):
const item = await prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId} FOR UPDATE`;
  const existingCount = await tx.X.count({ where: { userId } });
  if (existingCount >= MAX) throw new Error("সর্বোচ্চ সীমা...");
  return tx.X.create({ data: { userId, ... } });
});
```
`Study Group` এ Group row lock করা হয়েছিল (per-group limit), কিন্তু
এই ৩টাতে **per-user limit** — তাই সঠিক resource হলো User row নিজেই।
`SELECT ... FOR UPDATE` দিয়ে একই ইউজারের concurrent request গুলো
transaction-level এ serialize হয়ে যায় (Postgres row-level lock),
capacity check+insert একসাথে atomic হয়ে যায়।

### পরিবর্তিত ফাইল
- `app/api/habits/route.ts` — `POST` handler এ atomic transaction+lock।
- `app/api/custom-question-sets/route.ts` — `POST` handler এ atomic
  transaction+lock (ব্যাকগ্রাউন্ড AI processing কল transaction এর
  বাইরে, যাতে transaction দ্রুত শেষ হয়)।
- `app/api/pdf-chat/route.ts` — `POST` handler এ atomic transaction+lock
  (একইভাবে `processUploadedPdf()` transaction এর বাইরে রাখা হয়েছে)।

### লাইভ টেস্ট
- `scripts/test-habit-count-race-condition.py` — ৫টা assertion।
- `scripts/test-customquestionsets-count-race-condition.py` — ৫টা
  assertion।
- `scripts/test-pdfchat-count-race-condition.py` — ৫টা assertion।
- `scripts/test-capacity-limits-regression.py` — ২১টা assertion (তিন
  endpoint এই normal create+list flow + boundary case: ঠিক MAX
  পর্যন্ত সফল, MAX+১ এ পরিষ্কার ৪০০ error)।
- মোট ৩৬টা assertion, চারটা স্ক্রিপ্টে, সব PASS (fix এর আগে বাগ
  reproduce করে, fix এর পরে আবার রান করে ভেরিফাই করা হয়েছে)।

### Checkpoint Pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `pnpm build` — সফল।
3. `pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python concurrency+regression টেস্ট — ৩৬/৩৬
   assertion PASS।
5. Test cleanup — ৬টা টেস্ট ইউজার (চারটা concurrency+regression
   স্ক্রিপ্ট রানে) প্রকৃত `/api/user/delete-account` POST endpoint
   দিয়ে ডিলিট (cascade delete এ সব habit/set/document ও মুছে যায়),
   DB তে সরাসরি psycopg2 দিয়ে চেক করে শূন্য বাকি ভেরিফাই।

### সীমাবদ্ধতা/ভবিষ্যতের পর্যবেক্ষণ
- **এই বাগ ক্লাস (count-then-create capacity check) এখন ৫ বার পাওয়া
  গেছে** (Study Group, Quiz Battle, Habit, Custom Question Set, PDF
  Chat) — ভবিষ্যতে নতুন কোনো per-user/per-group resource limit লেখার
  সময় ডিফল্টভাবে `SELECT ... FOR UPDATE` row-lock প্যাটার্ন ব্যবহার
  করা উচিত, শুধু plain `count()`+`create()` না। এটা এখন এই কোডবেসের
  সবচেয়ে বেশিবার পাওয়া বাগ ক্লাস — ভবিষ্যতে একটা reusable helper
  ফাংশন (যেমন `createWithCapacityLimit(tx, model, userId, max, data)`)
  বানিয়ে সব জায়গায় ব্যবহার করলে ভবিষ্যতে এই ভুল আবার হওয়ার ঝুঁকি কমবে।

## 🔬 বাগ-হান্ট রাউন্ড — SSE Stream/Push Subscription/Peer Notes/Streak Re-verify (কোনো নতুন বাগ পাওয়া যায়নি) ✅ সম্পন্ন

### প্রেক্ষাপট
Per-User Capacity Limit Race Condition ফিক্সের পরে, ব্যবহারকারীর
পরামর্শ অনুযায়ী WebSocket/SSE stream endpoint ও admin bulk-action
endpoint এর দিকে বাগ-হান্ট সম্প্রসারিত করা হয়েছে।

### যা পরীক্ষা করা হয়েছে
1. **Quiz Battle SSE Stream** (`app/api/quiz-battle/[battleId]/stream/route.ts`)
   — কোড রিভিউ করে দেখা গেছে এটা শুধু read-only polling+push প্যাটার্ন
   (কোনো DB write নেই stream এর ভেতরে), তাই কোনো race condition সম্ভব
   না। `MAX_STREAM_DURATION_MS`/heartbeat/abort handling সব ঠিকভাবে
   ইমপ্লিমেন্ট করা আছে।
2. **Daily Streak/Streak Freeze Race Condition পুনরায় verify** —
   আগের সেশনে "কোনো বাগ নেই" ঘোষিত হয়েছিল, এই সেশনে আবার
   `scripts/test-streak-race-condition-audit.py` চালিয়ে পুনঃনিশ্চিত করা
   হয়েছে (৮/৮ assertion PASS, "recompute-and-overwrite" ডিজাইন প্যাটার্ন
   এখনো race-safe)।
3. **Push Subscription** (`app/api/push/subscribe/route.ts`) — ইতিমধ্যে
   সঠিকভাবে `upsert({ where: { endpoint } })` ব্যবহার করছে, কোনো বাগ
   নেই।
4. **Peer Notes** (`app/api/notes/[topicId]/route.ts`,
   `app/api/notes/[topicId]/publish/route.ts`) — `upsert()` ব্যবহার
   (create/update) ও simple boolean toggle (publish) — কোনো race
   condition সম্ভব না।
5. **Quiz Duel Create/Join** — Duel তৈরির আগে "already in active duel"
   চেক আছে যা read-then-write, কিন্তু duel তৈরি নিজেই per-user
   capacity limit না (একজন ইউজার শুধু ১টা active duel এ থাকতে পারবে,
   এটা `@@unique` constraint দিয়ে enforced — `challengerId`/`opponentId`
   এ কোনো unique constraint নেই সরাসরি, কিন্তু join/submit ইতিমধ্যে
   fixed)। এটা নতুন করে পরীক্ষার প্রয়োজন হয়নি কারণ এই একই ফাইলের
   `joinDuel()`/`submitDuelAnswers()` আগেই এই ক্লাসের বাগের জন্য ফিক্স
   হয়েছে (`scripts/test-quiz-duel-join-race-condition.py`)।
6. **Reading Room** — কোনো fixed-capacity room concept নেই (session-
   based check-in system), তাই capacity-bypass বাগ ক্লাস প্রযোজ্য না।
7. **সম্পূর্ণ `app/api/` এ বাকি `count`-ব্যবহারকারী ফাইল** (১০টা) —
   সবগুলো হয় read-only analytics/pagination, অথবা ইতিমধ্যে atomic
   `updateMany().count` claim-result ব্যবহার করছে (fixed bug এর result
   check), অথবা in-memory array/object এর `.length`/counter (কোনো DB
   race না)।

### ফলাফল: কোনো নতুন বাগ পাওয়া যায়নি
এই রাউন্ডে সব candidate ইতিমধ্যে সঠিক (established fix বা ইনহেরেন্টলি
race-safe ডিজাইন) — কোনো কোড পরিবর্তন করা হয়নি। Transparency এর জন্য
negative result ডকুমেন্ট করা হলো (ভবিষ্যতে আবার এই জায়গাগুলো অডিট
করার প্রয়োজন মনে করলে সময় বাঁচাতে সাহায্য করবে)।

### সারসংক্ষেপ — এখন পর্যন্ত পাওয়া সব race-condition বাগ (৫ সেশন জুড়ে)
- Forum Vote, Forum Report creation (P2002 crash)
- Task/StudyPlanItem/TopicProgress XP double-award
- Quiz Battle submit/end/start, Quiz Duel join/submit
- Content Report action (single+bulk)
- Mock Exam MCQ/CQ submit, Admission submit, Live Exam submit
- Study Pet lazy-create (P2002 crash)
- Study Group/Habit/Custom Question Set/PDF Chat capacity-bypass

সব মিলিয়ে এই কোডবেসে ২টা মূল বাগ ক্লাস established হয়েছে: (১) "lazy
create/vote/toggle on unique field" (`upsert()` দিয়ে ফিক্স), (২)
"read-then-write status/capacity check" (atomic `updateMany()` claim
বা `SELECT ... FOR UPDATE` row-lock দিয়ে ফিক্স)। এই দুই প্যাটার্নই এখন
কোডবেসের সব সম্ভাব্য জায়গায় চেক করা হয়ে গেছে বলে মনে হচ্ছে — ভবিষ্যতে
নতুন ফিচার লেখার সময় এই দুটো checklist item হিসেবে মনে রাখা উচিত।

## ♿ Accessibility ও Mobile Responsiveness গভীর অডিট (রাউন্ড ২) ✅ ফর্ম-লেবেল অংশ সম্পন্ন, Mobile Responsiveness বাকি

### প্রেক্ষাপট
ব্যবহারকারী "Next" বলার পরে `ask_user` টুলে "Accessibility ও Mobile
Responsiveness গভীর অডিট" (`accessibility_mobile_audit`) অপশন বেছে
নিয়েছিলেন। এই সেশনে সেই কাজের Accessibility অংশ (icon-button aria-label
+ form label association) সম্পূর্ণ করা হলো; Mobile Responsiveness ও
Keyboard Focus Trap অংশ এখনো বাকি (ভবিষ্যতে করা হবে)।

### আবিষ্কার #১ — Icon-only Button এ মিসিং `aria-label`
Python regex script — প্রথমে crude regex দিয়ে candidate বের করে (৫২টা
icon button, ২৩টা মিসিং দেখাচ্ছিল কিন্তু false-positive সহ), তারপর
custom `find_tag_end()` ফাংশন (brace-depth-aware JSX ট্যাগ boundary
matching, `=>` arrow function false-positive এড়ানো) দিয়ে refine করে
চূড়ান্ত তালিকা: **১৪টা genuine missing aria-label** icon button +
`components/ui/dialog.tsx` এ ইংরেজি "Close" sr-only টেক্সট (বাংলা
consistency)।

**সব ফিক্স সম্পন্ন**:
1. `app/ai-tutor/page.tsx` — ছবি আপলোড বাটন
2. `components/admin/cq-question-manager.tsx` — delete বাটন
3. `components/admin/forum-moderation-panel.tsx` — scan/pin-unpin/delete (৩টা)
4. `components/admin/question-manager.tsx` — delete বাটন
5. `components/admin/reports-panel.tsx` — RESOLVE/DISMISS/DELETE_CONTENT/DELETE_AND_BAN (৪টা)
6. `components/flashcards/deck-card-list.tsx` — delete বাটন
7. `components/live-exam/custom-question-set-dashboard.tsx` — delete বাটন
8. `components/pdf-chat/pdf-chat-dashboard.tsx` — delete বাটন
9. `components/planner/habit-tracker.tsx` — delete বাটন
10. `components/study-group/study-group-dashboard.tsx` — copy invite code বাটন
11. `components/ui/dialog.tsx` — sr-only "Close" → "বন্ধ করো"

Touch target size (WCAG 2.5.8) পুনরায় ভেরিফাই — `components/ui/button.tsx`
এর `icon-xs` (24px) ন্যূনতম সীমা মেটায়, বাকি সব icon size তার চেয়ে বড়।
পুরো `app/`+`components/` এ re-scan করে **০টা মিসিং** কনফার্ম করা হয়েছে।

### আবিষ্কার #২ — Form Input/Textarea/Select এ Label association মিসিং
একই `find_tag_end()` স্ক্রিপ্ট reuse করে `<Input>`/`<Textarea>`/`<select>`
ট্যাগ স্ক্যান করে দেখা হয়েছে কোনগুলোতে `aria-label`/`aria-labelledby` নেই
**এবং** matching `<Label htmlFor>` নেই (id-based matching সহ, ৮০০-ক্যারেক্টার
context window এ পূর্ববর্তী `htmlFor="..."` খুঁজে)। প্রথম pass এ ১টা পাওয়া
গিয়েছিল (`task-manager.tsx`), সেটা ফিক্স করার পরে broader scan এ মোট **৫৪টা**
পাওয়া যায় (student-facing + admin CMS)।

**সব ফিক্স সম্পন্ন** (chronological):
- `components/planner/task-manager.tsx` — নতুন টাস্ক title/date input (২টা)
- `components/cq/cq-runner.tsx` — ক/খ/গ/ঘ প্রশ্নের উত্তর Textarea (৪টা)
- `components/forum/new-post-form.tsx` — category/subject select (Label htmlFor+id, ২টা)
- `components/forum/post-detail.tsx` — reply Textarea (১টা)
- `components/learn/topic-note-editor.tsx` — নোট Textarea (১টা)
- `components/mock-exam/mock-exam-runner.tsx` — ক/খ/গ/ঘ প্রশ্নের উত্তর Textarea (৪টা)
- `components/pdf-chat/pdf-chat-room.tsx` — চ্যাট Input (১টা)
- `components/planner/class-routine.tsx` — start/end time Input (Label htmlFor+id, ২টা)
- `components/planner/exam-countdown-card.tsx` — তারিখ Input (Label htmlFor+id) + এডিট পেন্সিল বাটনে aria-label (২টা)
- `components/planner/study-pet-card.tsx` — পেটের নাম এডিট Input (১টা)
- `app/ai-tutor/page.tsx` — মূল চ্যাট Input (১টা)
- `components/analytics/predicted-gpa-card.tsx` — টার্গেট জিপিএ number Input (১টা)
- `components/study-group/study-group-dashboard.tsx` — ইনভাইট কোড join Input + readonly display (২টা)
- `components/admin/notification-broadcast-form.tsx` — লিংক Input (Label htmlFor+id, ১টা)
- `components/admin/user-manager.tsx` — সার্চ Input (১টা)
- `components/admin/subject-manager.tsx` — Subject Code/Paper select (Label htmlFor+id) + রঙ Hex Input (৩টা)
- `components/admin/topic-manager.tsx` — ভিডিও URL/নোট/ফর্মুলা শীট, create+edit দুই ফর্মেই (৬টা)
- `components/admin/question-manager.tsx` — অপশন ১-৪, ব্যাখ্যা Textarea (Label htmlFor+id), কঠিনতা select (Label htmlFor+id), বোর্ড বছর Input (Label htmlFor+id) + বোর্ডের নাম select, মিসকনসেপশন ট্যাগ Input (Label htmlFor+id), CSV bulk upload Textarea (Label htmlFor+id), প্রশ্ন-কার্ডের ইনলাইন ট্যাগ Input (মোট ১১টা)
- `components/admin/cq-question-manager.tsx` — ৪টা মডেল উত্তর ফিল্ড (Input/Textarea, aria-label ক/খ/গ/ঘ), বোর্ড বছর/নাম Input (aria-label), মিসকনসেপশন ট্যাগ Input (Label htmlFor+id, create ফর্মে) + ইনলাইন ট্যাগ Input (aria-label, কার্ড লিস্টে) (মোট ৮টা)

**Re-verify (false-positive হিসেবে বাদ)**: `components/ui/password-input.tsx`
— এই wrapper কম্পোনেন্টের নিজের `<Input>` এ সরাসরি `aria-label` নেই, কিন্তু
সব ৫টা caller সাইট (`(auth)/login`, `(auth)/register`, `(auth)/reset-password`,
`settings/danger-zone-tab.tsx`, `settings/settings-form.tsx`) ইতিমধ্যে
`<Label htmlFor="...">` + matching `id="..."` prop pass করছে যা props
spread (`{...props}`) এর মাধ্যমে অভ্যন্তরীণ `<Input>` এ পৌঁছায় — তাই এটা
genuine bug না, regex এর context-window সীমাবদ্ধতার কারণে false-positive
হিসেবে ফ্ল্যাগ হয়েছিল।

### যাচাই পদ্ধতি
Python script এ প্রথমে crude regex দিয়ে candidate বের করে, তারপর refined
`find_tag_end()` (brace-depth-aware JSX tag matching, string-literal-aware)
দিয়ে false-positive বাদ দিয়ে চূড়ান্ত তালিকা তৈরি করা হয়েছে। শেষে পুরো
`app/`+`components/` ডিরেক্টরিতে (`find app components -name "*.tsx"`)
re-scan চালিয়ে **০টা genuine missing label/aria-label** কনফার্ম করা হয়েছে।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন, কোনো error নেই।
2. `rm -rf .next; pnpm build` — সফল, সব রুট কম্পাইল হয়েছে, কোনো নতুন
   error/warning নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. লাইভ dev server এ Python multi-step regression টেস্ট
   (`scripts/test-accessibility-regression.py` — ১১টা assertion):
   register → login (NextAuth credentials flow) → Habit তৈরি (টাচড
   input) → Task তৈরি (টাচড title/date input) → GPA target সেট (টাচড
   input, সঠিক endpoint `PUT /api/user/target-gpa`) → Study Group পেজ
   লোড (নতুন invite-code aria-label উপস্থিতি চেক — SSR এ client-fetch
   এর কারণে দেখা যায়নি, এটা টেস্ট মেথডোলজি লিমিটেশন, বাগ না; কোড লেভেলে
   ইতিমধ্যে ম্যানুয়ালি ভেরিফাই করা) → Planner পেজ লোড → AI Tutor পেজ লোড
   (নতুন chat input aria-label HTML এ গ্রেপ-লেভেল ভেরিফাই করে পাওয়া
   গেছে)। ১০/১১ PASS (১টা fail টেস্ট মেথডোলজি লিমিটেশন, কোড বাগ না)।
5. **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `POST /api/user/delete-account`
   endpoint দিয়ে ডিলিট (সঠিক request body ফিল্ড: `password` +
   `confirmationText: "ডিলিট করো"` — প্রথম চেষ্টায় ভুল ফিল্ড নাম
   `confirmText` ব্যবহার করায় 400 পেয়েছিল, রুট কোড দেখে সঠিক ফিল্ড নাম
   বের করে রিট্রাই করা হয়েছে)। DB তে psycopg2 দিয়ে সরাসরি চেক করে
   `users`/`habits`/`tasks` টেবিলে টেস্ট ইউজারের কোনো রো বাকি নেই
   ভেরিফাই করা হয়েছে (cascade delete সঠিকভাবে কাজ করছে)।

### সীমাবদ্ধতা/ভবিষ্যতের কাজ
- **Mobile Responsiveness অংশ এখনো শুরু হয়নি** — viewport/breakpoint
  consistency, horizontal overflow/scroll issue (বিশেষ করে Admin
  panel/Analytics chart), সম্পূর্ণ touch target অডিট (শুধু icon button
  না, সব clickable element) এখনো বাকি।
- **Keyboard Navigation Focus Trap টেস্টিং এখনো হয়নি** — Dialog/Sheet
  (`more-menu-sheet.tsx`)/Dropdown এ Tab/Escape key behavior base-ui
  primitive এর ডিফল্ট বিহেভিয়ারের উপর নির্ভরশীল, কিন্তু কোড রিভিউ করে
  নিশ্চিত হওয়া এখনো বাকি।
- **Color Contrast (WCAG AA) systematic re-audit এই রাউন্ডে হয়নি** —
  আগের সেশনে আলাদা অডিট হয়েছিল (accent-theme.ts সহ), এই রাউন্ডে নতুন
  করে চেক করা হয়নি।

## 📱 Mobile Responsiveness অডিট — Horizontal Overflow বাগ (২টা) ✅ সম্পন্ন

### প্রেক্ষাপট
"Accessibility ও Mobile Responsiveness গভীর অডিট" (`accessibility_mobile_audit`)
সিদ্ধান্তের Accessibility অংশ (icon-button aria-label + form label) আগের
রাউন্ডে সম্পূর্ণ হয়েছিল। এই রাউন্ডে Mobile Responsiveness অংশ সম্পূর্ণ
করা হলো — viewport/breakpoint consistency, horizontal overflow, touch
target সাইজ যাচাই।

### পদ্ধতি ও Sandbox চ্যালেঞ্জ
প্রথমে static code scan (grid-cols breakpoint pattern, fixed-width class,
whitespace-nowrap) দিয়ে ঝুঁকিপূর্ণ জায়গা চিহ্নিত করা হয়, কিন্তু আসল
horizontal overflow শুধু browser rendering দিয়েই নিশ্চিতভাবে ধরা যায়।
Playwright (`pip install playwright`, `playwright install chromium
--with-deps`) ইনস্টল করে headless Chromium দিয়ে লাইভ dev server এর
বিপরীতে টেস্ট করা হয়েছে।

**⚠️ গুরুত্বপূর্ণ সমস্যা ও সমাধান**: এই sandbox (১.৯GB RAM) এ Next.js dev
server ও multi-process Chromium (ডিফল্ট mode এ zygote+renderer+gpu-process
আলাদা আলাদা process spawn করে) concurrent চালানো অত্যন্ত ভারী প্রমাণিত
হলো — **দুইবার সম্পূর্ণ sandbox freeze/unresponsive হয়েছিল** (bash কমান্ড
৩০০ সেকেন্ড টাইমআউট, পরের কয়েকটা কমান্ডও টাইমআউট, তারপর নিজে থেকে সেরে
ওঠে)। সমাধান:
1. Chromium `args=["--disable-gpu", "--single-process", "--no-zygote"]`
   দিয়ে চালু করা (single lightweight process, একাধিক sub-process spawn
   হয় না)।
2. Swap 1GB থেকে 2GB এ বাড়ানো (`/swapfile` + নতুন `/swapfile2`)।
3. প্রতিটা পেজ চেক এর জন্য আলাদা Python process ব্যবহার করে browser
   instance সম্পূর্ণ বন্ধ করে দেওয়া (batch এ অনেক পেজ একটা browser
   session এ চেক করলে memory ধীরে ধীরে accumulate হয়ে পুরো sandbox
   freeze হয়ে যাচ্ছিল)।
4. পেজ চেক করার আগে `curl` দিয়ে route "warm up" করা (Turbopack cold-compile
   latency কমাতে, বিশেষ করে প্রথমবার visit করা route এ)।
5. প্রতিটা Playwright call এর পরে `free -h` দিয়ে memory চেক করে দরকার হলে
   stale next-server process manually kill করা (dev server restart এর
   পরেও পুরনো PID কখনো কখনো থেকে যাচ্ছিল, `pkill -f "next dev"` সবসময়
   সব child process ধরতে পারছিল না)।

### স্ক্যান পদ্ধতি
প্রতিটা পেজে ৩৭৫px (iPhone SE) viewport এ `document.documentElement.scrollWidth`
বনাম `clientWidth` তুলনা করে overflow ডিটেক্ট করা হয়েছে; overflow পেলে
`getBoundingClientRect()` দিয়ে `body *` এর মধ্যে ঠিক কোন এলিমেন্ট viewport
ছাড়িয়ে যাচ্ছে (রাইট এজ ক্লায়েন্ট-উইথ + ৫px টলারেন্স ছাড়িয়ে) তা খুঁজে বের
করা হয়েছে। মোট **২৫টা+ পেজ** স্ক্যান করা হয়েছে:
- Student: Dashboard, Learn (+dynamic subject), Practice (+dynamic subject),
  Planner, Flashcards, Analytics, Badges, Leaderboard, Forum, AI Tutor,
  Mock Exam, Study Group, Reading Room, PDF Chat, Notifications, Settings,
  Saved, Mistake Vault, Admission, Quiz Battle।
- Admin: Dashboard, Subjects, Users, Reports, Analytics, Forum,
  Notifications, Audit Log, System।

### আবিষ্কার #১ — Dashboard হেডার Icon Row Overflow (১২৪px)
`app/(dashboard)/dashboard/page.tsx` এর হেডারে `GlobalSearch`/
`NotificationBell`/`ThemeToggle`/`UserMenu` একটা `flex items-center
gap-3` row এ ছিল। `GlobalSearch` কম্পোনেন্টের নিজস্ব বাটন ক্লাস `w-full
sm:w-56` (ডেস্কটপে সার্চ-ইনপুট-স্টাইল প্রশস্ত বাটন দেখানোর ইচ্ছাকৃত
ডিজাইন) মোবাইলে flex row এর ভেতরে `w-full` prioritize করে বাকি ৩টা
আইকনকে (Notification Bell, Theme Toggle, User Avatar) viewport এর বাইরে
push করে দিচ্ছিল। ৩৭৫px viewport এ scrollWidth 499px (Live-প্রুফ: fix
এর আগে `getBoundingClientRect()` এ Notification Bell/UserMenu ৩৯৭-৪৯৯px
right edge এ, ৩৭৫px clientWidth ছাড়িয়ে)।

**ফিক্স**: `GlobalSearch` কে নতুন `<div className="flex-1 min-w-0
sm:flex-none">` wrapper দিয়ে মুড়ে দেওয়া হয়েছে — flexbox এ `flex-1
min-w-0` মোবাইলে available space এর মধ্যে বাটনকে সংকুচিত হতে (shrink)
বাধ্য করে (নিজের `w-full` সত্ত্বেও, কারণ flex item এর width এখন parent
`flex-1` container দ্বারা constrained), ডেস্কটপে `sm:flex-none` দিয়ে
আগের behavior (fixed w-56) অক্ষুণ্ন রাখা হয়েছে। হেডার row নিজেও `gap-3`
থেকে `gap-2 sm:gap-3` করা হয়েছে (মোবাইলে আরও কমপ্যাক্ট স্পেসিং)।

### আবিষ্কার #২ — Settings পেজে ৭টা ট্যাব Overflow (৩১১px, সবচেয়ে গুরুতর)
`components/settings/settings-form.tsx` এর `TabsList` এ ৭টা ট্যাব
(প্রোফাইল/পাসওয়ার্ড/থিম/অ্যাক্সেসিবিলিটি/পাবলিক প্রোফাইল/ইমেইল
নোটিফিকেশন/ডেটা ও অ্যাকাউন্ট) `components/ui/tabs.tsx` এর base
`inline-flex w-fit` কন্টেইনারে ছিল যেখানে কোনো horizontal scroll/wrap
ব্যবস্থা ছিল না। ৩৭৫px viewport এ scrollWidth 686px (TabsList কন্টেইনার
নিজেই 670px প্রশস্ত) — শেষ ২-৩টা ট্যাব ("ইমেইল নোটিফিকেশন", "ডেটা ও
অ্যাকাউন্ট") সম্পূর্ণ viewport এর বাইরে চলে যাচ্ছিল, দেখাও যাচ্ছিল না
এবং ক্লিক করাও অসম্ভব ছিল — এটা এই অডিটের সবচেয়ে গুরুতর ও ব্যবহারকারী-
প্রভাবিত বাগ (Settings একটা ঘন ঘন ব্যবহৃত পেজ)।

**ফিক্স**: `TabsList` কে `<div className="overflow-x-auto -mx-4 px-4
mb-6">` wrapper দিয়ে মুড়ে horizontal scroll enable করা হয়েছে (negative
margin `-mx-4` দিয়ে parent এর `px-4`/`sm:px-6` padding সাময়িকভাবে বাতিল
করে scroll area কে edge-to-edge করা হয়েছে, নিজের `px-4` দিয়ে ভেতরের
কনটেন্ট আবার padding পায়), `TabsList` নিজে `w-max min-w-full sm:w-fit`
করা হয়েছে (মোবাইলে content-width নিয়ে scroll করা যায়, `sm:` ব্রেকপয়েন্টে
আগের compact `w-fit` behavior ফিরে আসে)।

### নেগেটিভ-রেজাল্ট (False-Positive) — Leaderboard পেজে সাময়িক Overflow
প্রাথমিক স্ক্যানে `/leaderboard` এ ৮px overflow (scrollWidth 383 vs
clientWidth 375) দেখা গিয়েছিল। গভীর তদন্তে (স্ক্রিনশট নিয়ে ভিজ্যুয়াল
চেক, viewport height বাড়িয়ে সব কার্ড একসাথে viewport এ আনা, `window.scrollTo`
দিয়ে scroll করে সব কার্ড intersect করানো, `getComputedStyle().transform`
দিয়ে overflow-causing element খোঁজা) নিশ্চিত হয়েছে এটা `components/motion/fade-in.tsx`
এর `StaggerItem direction="left"` animation এর transient pre-animate
state — নিচের যেসব লিগ-মেম্বার কার্ড এখনো viewport এ intersect করেনি
(IntersectionObserver `whileInView` ট্রিগার হয়নি) সেগুলোর hidden variant
এ `x: 24px` transform থাকে, যা scrollWidth measurement এর সময় সাময়িকভাবে
ধরা পড়ে। Scroll করে সব কার্ড viewport এ আনলে (animation trigger হয়ে
normalize) overflow সম্পূর্ণ চলে যায় (`scrollWidth: 375`) এবং কোনো
overflow-causing transform element খুঁজে পাওয়া যায়নি (`elements with
transform overflowing: []`)। Screenshot এ visible clipping/scrollbar
নেই। **কোনো কোড পরিবর্তন করা হয়নি** — transparency এর জন্য ডকুমেন্ট করা
হলো, ভবিষ্যতে একই false-positive আবার দেখা গেলে সময় বাঁচাবে।

### টাচ টার্গেট সাইজ (WCAG 2.5.8) অডিট
`button`/`a`/`[role="button"]` এলিমেন্ট স্ক্যান করে ২৪px width/height এর
নিচে সাইজ খুঁজে বের করা হয়েছে (Dashboard, Planner, Practice, Forum,
Badges, Notifications, Reading Room, Quiz Battle, PDF Chat, Mistake
Vault — মোট ১০টা পেজে)। **০টা genuine ছোট টাচ টার্গেট** পাওয়া গেছে।
শুধু Login পেজে ২টা ছোট ইনলাইন টেক্সট লিংক ("পাসওয়ার্ড ভুলে গেছো?" ৮২×১৬px,
"রেজিস্ট্রেশন করো" ৭২×১৫px) পাওয়া গেছে যা WCAG 2.5.8 Success Criterion
এর **inline text link exception** এ পড়ে (paragraph/sentence এর মধ্যে
থাকা টেক্সট লিংকের জন্য target-size রিকোয়ারমেন্ট প্রযোজ্য না) — বাগ না।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন। (⚠️ প্রথমবার memory চাপে tsc process
   D-state এ আটকে ৩+ মিনিট চলছিল — dev server বন্ধ করে ও swap বাড়িয়ে
   পরিষ্কারভাবে সম্পন্ন হয়েছে, মাত্র ১০ সেকেন্ডে।)
2. `rm -rf .next; pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো নতুন
   error/warning নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. **লাইভ ভেরিফিকেশন**: Dashboard পেজ ফিক্সের পরে পুনরায় স্ক্যান করে
   `scrollWidth=375=clientWidth` কনফার্ম করা হয়েছে। Settings পেজে নতুন
   `overflow-x-auto` কন্টেইনার আসলে scrollable (`scrollWidth=702`,
   `clientWidth=375`) কিন্তু outer viewport এ কোনো overflow নেই তা
   ভেরিফাই করা হয়েছে, এবং Playwright দিয়ে প্রতিটা ট্যাব ক্লিক করে
   (প্রোফাইল, ডেটা ও অ্যাকাউন্ট) সঠিক কনটেন্ট লোড হয় — tab-switching
   functionality অক্ষত আছে ভেরিফাই করা হয়েছে (`#name` input পাওয়া
   গেছে প্রোফাইল ট্যাবে, "অ্যাকাউন্ট ডিলিট" টেক্সট পাওয়া গেছে ডেটা ও
   অ্যাকাউন্ট ট্যাবে)।
5. **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `POST
   /api/user/delete-account` endpoint দিয়ে ডিলিট (সঠিক ফিল্ড নাম:
   `password` + `confirmationText`), DB তে psycopg2 দিয়ে সরাসরি চেক
   করে `users` টেবিলে কোনো রো বাকি নেই ভেরিফাই করা হয়েছে।

### নতুন টুলিং যোগ হলো
এই অডিটে প্রথমবার Playwright (headless Chromium) সেটআপ করা হলো — এটা
ভবিষ্যতে আরও mobile/visual-regression অডিটে reuse করা যাবে। নতুন test
script: `scripts/test-mobile-overflow-audit-student.py` (১৫টা স্টুডেন্ট
পেজ), `scripts/test-mobile-overflow-audit-admin.py` (১১টা অ্যাডমিন পেজ),
`scripts/test-mobile-touch-target-audit.py` (টাচ টার্গেট + overflow
কম্বাইন্ড চেক, single-page CLI arg নেয়)।

### সীমাবদ্ধতা/ভবিষ্যতের কাজ
- **Keyboard Navigation Focus Trap টেস্টিং এখনো হয়নি** — Dialog/Sheet
  (`more-menu-sheet.tsx`)/Dropdown এ Tab/Escape key behavior base-ui
  primitive এর ডিফল্ট বিহেভিয়ারের উপর নির্ভরশীল, কোড রিভিউ + Playwright
  keyboard simulation দিয়ে ভবিষ্যতে ভেরিফাই করা উচিত।
- **Color Contrast (WCAG AA) systematic re-audit এই রাউন্ডে হয়নি** —
  আগের সেশনে আলাদা অডিট হয়েছিল, এই রাউন্ডে নতুন করে চেক করা হয়নি।
- **Sandbox মেমরি সীমাবদ্ধতা নোট**: ভবিষ্যতে Playwright ব্যবহার করার
  সময় অবশ্যই `--single-process --no-zygote --disable-gpu` flag ব্যবহার
  করতে হবে এবং প্রতিটা পেজ চেক এর জন্য আলাদা browser session/process
  ব্যবহার করা উচিত (batch এ একই browser দিয়ে অনেক পেজ চেক করলে memory
  leak accumulate হয়ে sandbox freeze হওয়ার ঝুঁকি আছে, এই সেশনে ২ বার
  ঘটেছিল)।

## 🐛⌨️ গুরুতর বাগ ফিক্স — Keyboard Focus Trap (Upstream base-ui#4678 Workaround) ✅ সম্পন্ন

### প্রেক্ষাপট
Mobile Responsiveness অডিটের (Horizontal Overflow বাগ) পরে "Accessibility
ও Mobile Responsiveness গভীর অডিট" এর শেষ বাকি অংশ — Keyboard Navigation
Focus Trap টেস্টিং — শুরু করা হয়েছে। প্রথমে base-ui অফিসিয়াল ডকুমেন্টেশন
(`base-ui.com/react/components/dialog`) রিসার্চ করে নিশ্চিত হওয়া গেছে
লাইব্রেরি ডিফল্টভাবে focus trap সাপোর্ট করার কথা ("Focus moves inside
the dialog when it opens. Tab and Shift+Tab loop within, and Esc requests
close")। এরপর Playwright দিয়ে actual `Tab`/`Escape` keypress সিমুলেট
করে আমাদের অ্যাপে লাইভ ভেরিফাই করা হয়েছে — এবং একটা গুরুতর বাগ পাওয়া
গেছে।

### আবিষ্কৃত বাগ (গুরুতর, WCAG 2.1.1 ভায়োলেশন)
`/dashboard` পেজে GlobalSearch ডায়ালগ (Cmd/Ctrl+K দিয়ে খোলা কমান্ড-প্যালেট
স্টাইল সার্চ) খুলে পরপর ৮টা `Tab` কী চাপলে ফোকাস dialog এর ভেতরে trap
না হয়ে বেরিয়ে পিছনের sidebar navigation এ (`skip-to-content` স্কিপ
লিংক, module link গুলো) চলে যাচ্ছিল। **লাইভ প্রুফ** (Playwright,
`document.activeElement` ট্র্যাক করে):
```
Tab 1: SPAN (insideDialog: False)
Tab 2: BODY (insideDialog: False, bodyIsActive: True)
Tab 3: A.skip-to-content (insideDialog: False)
Tab 4-8: sidebar এর বিভিন্ন module link (insideDialog: False)
```
এটা একটা সম্পূর্ণ focus trap failure — কীবোর্ড-নির্ভর ইউজার (screen
reader user বা motor-disability সহ keyboard-only user) ডায়ালগে আটকে
না থেকে ভুলবশত পিছনের পেজে navigate করে যেতে পারত, যেটা modal dialog
এর মৌলিক accessibility contract ভাঙে।

### Root Cause বিশ্লেষণ
DOM ইন্সপেকশনে দেখা গেছে dialog খোলা অবস্থায়:
- `document.querySelectorAll('[aria-hidden="true"]').length` = **৭৩**
  (base-ui background element গুলো hide করছে স্ক্রিন-রিডার থেকে)
- `document.querySelectorAll('[inert]').length` = **০**
- `document.querySelectorAll('[data-base-ui-inert]').length` = **১১**

অর্থাৎ base-ui নিজেই `data-base-ui-inert` মার্কার attribute বসাচ্ছে
(internal bookkeeping এর জন্য) কিন্তু আসল HTML `inert` attribute কখনো
সেট করছে না। `aria-hidden` শুধু accessibility tree থেকে element সরায়
(স্ক্রিন-রিডার announce করবে না), কিন্তু `inert` ছাড়া element এখনো
স্বাভাবিক sequential keyboard focus (Tab) order এ থেকে যায় — এটাই bug।

Web research এ নিশ্চিত হয়েছে এটা **base-ui v1.6.0 এর একটা established,
already-reported upstream bug**:
- GitHub issue: `mui/base-ui#4678` — "[dialog] Modal applies aria-hidden
  to background but doesn't remove focusable elements from tab order
  (aria_hidden_nontabbable violation)"
- Root cause (issue এ maintainer-confirmed): `FloatingFocusManager.tsx`
  এর `markOthers()` কল `ariaHidden: modal || isUntrappedTypeableCombobox`
  পাস করে কিন্তু কখনো `inert: true` পাস করে না।
- Fix PR: `mui/base-ui#4714` (issue linked, **এখনো open/unmerged**)।
- npm এ `@base-ui/react` এর latest ভার্সন এখনো `1.6.0` (আমরা যেটা
  ব্যবহার করছি) — কোনো patch রিলিজ এখনো নেই, তাই এই bug আমাদের প্রজেক্টে
  সরাসরি প্রভাব ফেলছে এবং কোনো `pnpm update` দিয়ে সমাধান হবে না।

### ফিক্স (GitHub Issue এ দেওয়া Maintainer-Suggested Workaround)
GitHub issue এ নিজেই একটা officially-suggested workaround কোড দেওয়া
ছিল (issue reporter দ্বারা প্রস্তাবিত, root cause বিশ্লেষণের অংশ হিসেবে),
সেটা প্রায় হুবহু বাস্তবায়ন করা হয়েছে:

নতুন ফাইল `components/dialog-inert-background.tsx` — একটা `useEffect`
ভিত্তিক `MutationObserver` যা `document.body` এর `subtree: true,
attributes: true, attributeFilter: ['data-base-ui-inert']` observe করে।
যখনই কোনো element এ `data-base-ui-inert` attribute যোগ/বাদ হয়, সেই
একই element এ আসল `inert` attribute mirror করা হয় (`el.setAttribute('inert',
'')` / `el.removeAttribute('inert')`)। `inert` HTML attribute (সব আধুনিক
ব্রাউজারে সাপোর্টেড) element কে accessibility tree **ও** keyboard tab
order দুটো থেকেই বাদ দেয় — যেটা `aria-hidden` একা করতে পারে না।

**⚠️ সবচেয়ে গুরুত্বপূর্ণ সতর্কতা (issue এ explicitly উল্লেখ করা ছিল)**:
base-ui নিজের focus-trap implement করতে দুইটা invisible "focus guard"
sentinel element ব্যবহার করে (`[data-base-ui-focus-guard]` attribute
সহ) — এগুলো Tab চেপে dialog এর শেষে পৌঁছালে আবার শুরুতে ফিরিয়ে আনার
জন্য দায়ী (focus trap এর মূল mechanism)। এই sentinel গুলোতেও একই
`data-base-ui-inert` মার্কার লাগানো থাকে — যদি ভুলবশত এগুলোকেও `inert`
করে দেওয়া হয়, তাহলে focus trap **সম্পূর্ণ ভেঙে যাবে** (কারণ sentinel
নিজেই আর tab-focusable থাকবে না, ফলে Tab dialog এর ভেতরে loop না করে
সরাসরি browser chrome/URL bar এ চলে যাবে — এটা আসল bug এর চেয়েও খারাপ
রিগ্রেশন হতো)। তাই কোডে explicit `if (el.hasAttribute("data-base-ui-focus-guard"))
return;` চেক দিয়ে এই sentinel গুলো স্কিপ করা হয়েছে।

`app/providers.tsx` এর `Providers` root কম্পোনেন্টে (`ConfirmDialogProvider`
এর ভেতরে, children এর ঠিক আগে) `<DialogInertBackground />` মাউন্ট করা
হয়েছে — এটা কোনো UI রেন্ডার করে না (`return null`), শুধু global side-effect
হিসেবে কাজ করে। এর ফলে অ্যাপের **সব জায়গায়** (`components/ui/dialog.tsx`
ভিত্তিক সব Dialog + `more-menu-sheet.tsx` এর bottom sheet, যেগুলো সবই
base-ui `Dialog` primitive ব্যবহার করে) একবারেই ফিক্স প্রযোজ্য হয়ে
গেছে — প্রতিটা Dialog usage সাইটে আলাদা করে ফিক্স করার দরকার হয়নি।

### লাইভ Multi-Scenario Playwright ভেরিফিকেশন
fix এর আগে বাগ reproduce করে, fix প্রয়োগের পরে আবার টেস্ট চালিয়ে
নিশ্চিত করা হয়েছে:

1. **GlobalSearch Dialog** (`/dashboard`, Cmd+K, ১টা focusable input) —
   fix এর আগে ৮টা fast Tab এ ফোকাস dialog থেকে বেরিয়ে যাচ্ছিল। fix এর
   পরে ১০০ms delay দিয়ে ১০টা Tab চেপে প্রতিটাতে `insideDialog: True`
   (ফোকাস input এর ভেতরেই loop করছে, কারণ dialog এ মাত্র ১টা focusable
   element), `inertCount: 9` (base-ui এর ১১টা `data-base-ui-inert`
   মার্কারের মধ্যে ২টা focus-guard সঠিকভাবে বাদ পড়েছে, বাকি ৯টাতে
   `inert` mirror হয়েছে)।
2. **Create Flashcard Deck Dialog** (`/flashcards`, ৩টা focusable
   element — নাম Input, Cancel বাটন, Create বাটন) — ১২টা Tab চেপে
   ভেরিফাই করা হয়েছে ফোকাস সবসময় dialog এর ভেতরে এই ৩টা element এর
   মধ্যেই cycle করছে (প্রতিটা Tab এ `insideDialog: True`), `Escape`
   দিয়ে ঠিকভাবে বন্ধ হয়।
3. **More Menu Sheet** (`components/layout/more-menu-sheet.tsx`,
   মোবাইল bottom-sheet, ৩৭৫px viewport, "আরও" ট্যাবে ক্লিক করে খোলা) —
   একই base-ui `Dialog` primitive সরাসরি ব্যবহার করায় (raw `@base-ui/react/dialog`
   import, `components/ui/dialog.tsx` wrapper ছাড়াই) একই global fix
   স্বয়ংক্রিয়ভাবে প্রযোজ্য হয়েছে — `Escape` দিয়ে বন্ধ হয় ভেরিফাই করা
   হয়েছে।
4. **UserMenu Dropdown** (`components/layout/user-menu.tsx`, base-ui
   `Menu` primitive — Dialog না) — `ArrowDown` দিয়ে `menuitem` এ
   navigate করা যায়, `Escape` দিয়ে বন্ধ হয় — **কোনো সমস্যা পাওয়া যায়নি**
   (এই bug ক্লাস শুধু `Dialog`/modal `FloatingFocusManager` এ প্রযোজ্য,
   `Menu` primitive এর নিজস্ব আলাদা focus management logic আছে যা এই
   bug দ্বারা প্রভাবিত হয়নি — negative-result হিসেবে ডকুমেন্ট করা হলো)।
5. **Regression চেক** — Dialog বন্ধ করার পরে `document.querySelectorAll('[inert]').length`
   = ০ (সব `inert` attribute cleanup হয়ে যায়, dangling inert element
   থেকে যাওয়ার bug নেই) এবং dialog বন্ধ হওয়ার পরে normal sidebar
   navigation (Tab focus + click) স্বাভাবিকভাবে কাজ করে (dialog বন্ধ
   → `/learn` link এ click → সফল navigation) ভেরিফাই করা হয়েছে।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next; pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো নতুন
   error/warning নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরের ৪টা scenario লাইভ Playwright দিয়ে ভেরিফাই (production build
   এর পরে dev server আবার চালিয়েও পুনরায় নিশ্চিত করা হয়েছে fix persist
   করছে)।
5. **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `POST
   /api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে psycopg2 দিয়ে
   সরাসরি চেক করে `users` টেবিলে কোনো রো বাকি নেই ভেরিফাই করা হয়েছে।

### মাইলফলক
এই ফিক্স দিয়ে "Accessibility ও Mobile Responsiveness গভীর অডিট"
(`accessibility_mobile_audit`) এর সব প্রধান অংশ সম্পূর্ণ হলো:
- ✅ Icon-only Button `aria-label` (২ রাউন্ড)
- ✅ Form Input/Textarea/Select Label association (৫৪টা+ field)
- ✅ Mobile Horizontal Overflow (Dashboard header + Settings tabs)
- ✅ Touch Target Size (WCAG 2.5.8, ০টা মিসিং)
- ✅ Keyboard Focus Trap (upstream base-ui bug ফিক্স)

**বাকি শুধু**: Color Contrast (WCAG AA) systematic re-audit — আগের
সেশনে একবার আলাদাভাবে করা হয়েছিল (accent-theme.ts এর Python
pre-verification সহ), এই অডিট সিরিজে নতুন করে systematic ভাবে চেক করা
হয়নি।

### নতুন টুলিং/জ্ঞান
- Playwright দিয়ে `page.keyboard.press("Tab")` এবং `document.activeElement`
  ট্র্যাক করে focus trap টেস্ট করার প্যাটার্ন — ভবিষ্যতে নতুন Dialog/Modal
  ফিচার যোগ হলে regression test হিসেবে reuse করা যাবে।
- **upstream library bug হ্যান্ডলিং shortlist**: (১) প্রথমে ডকুমেন্টেশনে
  expected behavior চেক করা, (২) actual behavior এর সাথে মিল না পেলে
  GitHub issue search করে জানা bug কিনা যাচাই করা, (৩) maintainer-suggested
  workaround থাকলে সেটা প্রায়োরিটি দেওয়া (custom সমাধান বানানোর চেয়ে
  বেশি নির্ভরযোগ্য, upstream fix release হলে সহজে সরানো যায়), (৪)
  workaround বাস্তবায়নের সময় library এর internal mechanism (এখানে
  focus-guard sentinel) ভুলবশত ভেঙে না ফেলার জন্য সতর্ক থাকা।
- নতুন test script: `scripts/test-keyboard-focus-trap-globalsearch.py`,
  `scripts/test-keyboard-focus-trap-dialog.py`,
  `scripts/test-keyboard-dropdown-menu.py`,
  `scripts/test-keyboard-more-menu-sheet.py`।

## 🎨 Color Contrast (WCAG AA) Re-audit (রাউন্ড ৩) ✅ সম্পন্ন — Accessibility+Mobile অডিট সিরিজের সমাপ্তি

### প্রেক্ষাপট
Keyboard Focus Trap বাগ ফিক্সের পরে "Accessibility ও Mobile Responsiveness
গভীর অডিট" (`accessibility_mobile_audit`) এর একেবারে শেষ বাকি অংশ —
Color Contrast (WCAG AA) systematic re-audit — সম্পন্ন করা হলো। আগে
দুইটা রাউন্ড হয়েছিল একটা আগের সেশনে: (১) text-color অডিট (৩৮টা ফাইলে
৭৩টা instance ফিক্স), (২) border-color অডিট (WCAG 1.4.11, ১২টা ফাইলে
১৩টা instance ফিক্স)। কিন্তু এর পরে অনেক নতুন ফিচার (প্রিমিয়াম থিম,
badges পেজ পলিশ, leaderboard/reading-room animation, ইত্যাদি) যোগ
হয়েছিল যেগুলো কখনো contrast-অডিট হয়নি — এই রাউন্ডে সেই gap পূরণ করা
হলো।

### উন্নত অডিট পদ্ধতি (আগের রাউন্ড থেকে improvement)
আগের রাউন্ডে hardcoded/approximate hex color value ব্যবহার করা হয়েছিল
Python script এ। এবার নির্ভুলতা বাড়াতে সরাসরি প্রজেক্টে ইনস্টল করা
`node_modules/tailwindcss/theme.css` ফাইল থেকে regex দিয়ে প্রতিটা
রঙের **actual OKLCH value** পার্স করা হয়েছে (`--color-{name}-{shade}:
oklch(L% C H)` প্যাটার্ন ম্যাচ করে)। এটা গুরুত্বপূর্ণ কারণ Tailwind v4
এর রঙের hex approximation v3 থেকে সামান্য ভিন্ন হতে পারে (color science
আপডেট হয়েছে) — সরাসরি সোর্স থেকে নেওয়াই সবচেয়ে নির্ভরযোগ্য। প্রতিষ্ঠিত
OKLCH→linear-sRGB→sRGB255 conversion formula + WCAG relative luminance
+ contrast ratio formula (আগের সেশনের `verify-theme-contrast.py` থেকে)
পুনর্ব্যবহার করা হয়েছে।

### সিস্টেম্যাটিক স্ক্যান — ৩টা ক্যাটাগরি
1. **Text color**: regex `(?<!dark:)\btext-([a-z]+)-(400|500)\b` দিয়ে
   `app/`+`components/` এর সব `.tsx` ফাইলে light-mode-active text
   color খুঁজে AA normal-text threshold (৪.৫:১, বনাম light card bg
   #ffffff) এর নিচে থাকা instance রিপোর্ট করা।
2. **Border color**: একই প্যাটার্নে `border-{color}-{300,400,500}`
   খুঁজে WCAG 1.4.11 non-text/UI component threshold (৩:১) এর নিচে
   থাকা instance রিপোর্ট করা।
3. **Badge/pill text-on-colored-bg combo**: `text-{color}-{700,800,900}`
   + `bg-{color}-{50,100}` একই className string এ থাকা combination
   এর contrast ratio চেক — **০টা issue পাওয়া গেছে** (negative result)।

### আবিষ্কার #১ — Leaderboard/Reading Room Rank #২ মেডেল আইকন (Text Color)
`app/(dashboard)/leaderboard/page.tsx` ও
`components/reading-room/reading-room-leaderboard.tsx` উভয়ের
`RANK_STYLES` অবজেক্টে:
```
const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-700 dark:text-yellow-400",
  2: "text-slate-400",           // ❌ কোনো dark: override নেই
  3: "text-amber-700",
};
```
rank ২ (রৌপ্য মেডেল) এর `text-slate-400` কোনো `dark:` override ছাড়াই
উভয় মোডে প্রয়োগ হচ্ছিল। Actual OKLCH value দিয়ে যাচাই: light mode এ
কার্ড bg (#ffffff) এর বিপরীতে মাত্র **২.৬৩:১** (icon/non-text threshold
৩:১ এরও নিচে, normal-text threshold ৪.৫:১ থেকে অনেক দূরে), যদিও dark
mode এ ৬.২৫:১ (ভালো)। rank ১ ও rank ৩ এর প্যাটার্নের সাথে অসামঞ্জস্যপূর্ণ
ছিল (rank ১ dark override সহ, rank ৩ single dark-safe shade সহ)।

**ফিক্স**: `text-slate-600 dark:text-slate-400` — light mode এ
slate-600 (light card বিপরীতে ৭.৫৮:১) ও dark mode এ slate-400 (dark
card বিপরীতে ৬.২৫:১) — উভয় মোডেই চমৎকার কনট্রাস্ট, rank ১ এর প্যাটার্নের
সাথে সামঞ্জস্যপূর্ণ।

### আবিষ্কার #২ — Badges/Study Plan Card Status Callout Border (Border Color)
দুইটা জায়গায় একই সমস্যা পাওয়া গেছে:
- `app/(dashboard)/badges/page.tsx` এর earned-badge card:
  `border-amber-300 dark:border-amber-800`
- `components/planner/study-plan-card.tsx` এর expired-plan warning
  callout: `border-amber-300 dark:border-amber-900`

Actual OKLCH value দিয়ে যাচাই করে দেখা গেছে **উভয় মোডেই ফেল করছিল**:
- light mode: `amber-300` বনাম `amber-50`/white বিপরীতে মাত্র **১.৪৫:১**
- dark mode: `amber-800` বনাম mixed dark bg বিপরীতে **২.৩২:১**,
  `amber-900` বনাম একই বিপরীতে **১.৭৯:১**

সবই WCAG 1.4.11 এর ৩:১ থ্রেশহোল্ডের অনেক নিচে — এটা আগের border-contrast
অডিট রাউন্ডে (যেটা confidence-selector/task-manager/pretest-runner
ইত্যাদি কভার করেছিল) মিস হয়ে গিয়েছিল, সম্ভবত এই কম্পোনেন্ট দুটো সেই
সময় এখনো বিদ্যমান ছিল না বা সেই স্ক্যানের সুযোগের বাইরে ছিল।

**ফিক্স**: established single-color-both-modes প্যাটার্নে (আগের
border-contrast রাউন্ডের decision অনুসরণ করে) `border-amber-600` —
light mode এ (৩.০৯:১, threshold ৩:১ সবে পাস) এবং dark mode এ (mixed
dark bg এর বিপরীতে ৫.০৮:১, ভালো মার্জিন সহ পাস) — একটাই ক্লাসে উভয়
মোড কভার হয়েছে, কোনো আলাদা `dark:` override দরকার হয়নি (কোড সরল
থেকেছে)।

### False-Positive Elimination (Transparency)
প্রাথমিক crude regex এ ১৫৮টা "candidate" পাওয়া গিয়েছিল, কিন্তু গভীর
বিশ্লেষণে দেখা গেছে প্রায় সবগুলোই আসলে ইতিমধ্যে সঠিক
`dark:text-{color}-400` override ছিল (যেমন `text-amber-600
dark:text-amber-400` প্যাটার্ন) — প্রথম regex এর negative lookbehind
`(?<!dark:)` সঠিকভাবে কাজ না করায় `dark:` prefix থাকা সত্ত্বেও ম্যাচ
হয়ে যাচ্ছিল। Refined regex (line-level string search দিয়ে dark:
override উপস্থিতি আলাদাভাবে চেক করে) দিয়ে re-scan করার পরে চূড়ান্ত
তালিকায় মাত্র ৪টা candidate অবশিষ্ট থাকে, যার মধ্যে ২টা (উভয়ই delete
বাটনের icon-only `text-red-500`, ৩.৮১:১, icon threshold ৩:১ পাস করে)
false-positive প্রমাণিত হয়েছে — শুধু slate-400 (leaderboard, ২টা
ফাইল) ও amber-300 border (badges+study-plan-card, ২টা ফাইল) genuine
bug ছিল।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next; pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো নতুন
   error/warning নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. **লাইভ ভেরিফিকেশন**: নতুন ইউজার দিয়ে `/leaderboard` পেজ HTML fetch
   করে `text-slate-600 dark:text-slate-400` ক্লাস উপস্থিতি ভেরিফাই
   করা হয়েছে (প্রথম চেষ্টায় string-match এ false-positive হয়েছিল —
   `dark:text-slate-400` কে পুরনো bad ক্লাস `text-slate-400` হিসেবে
   substring-match ভুল শনাক্ত করেছিল, ম্যানুয়াল substring inspection
   করে নিশ্চিত হওয়া গেছে actual fix (`text-slate-600 dark:text-slate-400`)
   ঠিকভাবে HTML এ আছে)। Badges পেজ কোড-লেভেলে ভেরিফাই (টেস্ট ইউজারের
   কোনো earned badge না থাকায় conditional card render হয়নি, কিন্তু
   কোড এ সঠিক `border-amber-600` ক্লাস আছে নিশ্চিত করা হয়েছে)।
5. **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `POST
   /api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে psycopg2 দিয়ে
   সরাসরি চেক করে `users` টেবিলে কোনো রো বাকি নেই ভেরিফাই করা হয়েছে।

### 🎉 মাইলফলক — Accessibility ও Mobile Responsiveness গভীর অডিট সম্পূর্ণ
এই ফিক্স দিয়ে ব্যবহারকারীর `ask_user` সিদ্ধান্তে বেছে নেওয়া
"Accessibility ও Mobile Responsiveness গভীর অডিট" এর **সব প্রধান অংশ
সম্পূর্ণভাবে শেষ হলো**:
- ✅ Icon-only Button `aria-label` (২ রাউন্ড, ২৮টা+ instance)
- ✅ Form Input/Textarea/Select Label association (৫৪টা+ field)
- ✅ Mobile Horizontal Overflow (Dashboard header + Settings tabs, ২টা
  bug)
- ✅ Touch Target Size (WCAG 2.5.8, ০টা মিসিং কনফার্মড)
- ✅ Keyboard Focus Trap (upstream base-ui bug ফিক্স, ১টা গুরুতর bug)
- ✅ Color Contrast (WCAG AA, ৩ রাউন্ড — text/border/badge, মোট ৮৮টা+
  instance ফিক্স হয়েছে সব রাউন্ড মিলিয়ে)

এই সিরিজে মোট আবিষ্কৃত ও ফিক্স করা bug/gap এর সংখ্যা যথেষ্ট বড় — এটা
প্রমাণ করে যে নতুন ফিচার যোগ হওয়ার সাথে সাথে accessibility/responsiveness
regression ধীরে ধীরে জমতে থাকে, তাই পর্যায়ক্রমে (periodic) re-audit
করা প্রয়োজনীয় একটা অভ্যাস — শুধু একবার করে "done" মার্ক করে ভুলে গেলে
চলবে না।

### নতুন টুলিং/জ্ঞান
- **`node_modules/tailwindcss/theme.css` থেকে সরাসরি actual color
  value পার্স করার প্যাটার্ন** — hardcoded approximate hex value এর
  চেয়ে অনেক বেশি নির্ভরযোগ্য, ভবিষ্যতে যেকোনো Tailwind color-related
  audit এ এই প্যাটার্ন reuse করা উচিত।
- **Regex lookbehind এর সীমাবদ্ধতা mনে রাখা** — `dark:` prefix বাদ
  দেওয়ার জন্য negative lookbehind সবসময় নির্ভরযোগ্য না (বিশেষ করে
  variable-length prefix এর ক্ষেত্রে); line-level string containment
  check করা বেশি নির্ভরযোগ্য পদ্ধতি।
- নতুন audit script: `scripts/audit-text-contrast-round3.py`,
  `scripts/audit-border-contrast-round3.py`,
  `scripts/audit-badge-text-on-bg-contrast.py`।

## ⚡ Performance/Query Optimization অডিট — মিসিং DB Index (৩টা কলাম) ✅ সম্পন্ন

### প্রেক্ষাপট
Accessibility+Mobile Responsiveness গভীর অডিট সিরিজ সম্পূর্ণ হওয়ার
পরে ব্যবহারকারীকে পরবর্তী priority জিজ্ঞাসা করা হয় (`ask_user`) —
"Performance/Query Optimization অডিট" বেছে নেওয়া হয়েছে। আগে একবার
Phase C তে (২১টা নতুন index) এই কাজ হয়েছিল, কিন্তু এর পরে StudyGroup,
QuizDuel, Reading Room সহ অনেক নতুন মডেল/ফিচার যোগ হয়েছে যেগুলো কখনো
systematic index-coverage অডিট হয়নি।

### অডিট পদ্ধতি
Python script দিয়ে `prisma/schema.prisma` পার্স করা হয়েছে
(brace-depth-aware model boundary detection, নেস্টেড `{}` সঠিকভাবে
count করে প্রতিটা `model X { ... }` ব্লক আলাদা করে বের করা হয়েছে —
প্রথম simple regex এ multi-line/nested bracket ভুল হয়ে false-positive
হচ্ছিল)। প্রতিটা মডেলের `@relation(fields: [...])` FK কলাম বের করে,
তারপর সেই কলাম কোনো `@@index([...])`/`@@unique([...])`/single-field
`@unique`/`@id` এর **leftmost** কলাম কিনা চেক করা হয়েছে — Postgres
composite (multi-column) index শুধু leftmost-prefix কলাম দিয়ে ফিল্টার
করলেই ব্যবহার করতে পারে (index-এর ২য়/৩য় কলাম দিয়ে একা ফিল্টার করলে
সেই index স্কিপ হয়ে sequential scan হয়ে যায়)।

মোট **১৩টা candidate** পাওয়া গিয়েছিল প্রাথমিক স্ক্যানে। প্রতিটার জন্য
actual codebase এ `grep` করে দেখা হয়েছে সেই কলাম দিয়ে সত্যিই standalone
(non-leftmost) query হয় কিনা — শুধু schema-level analysis যথেষ্ট না,
কারণ অনেক FK কলাম কখনো একা query হয় না (composite unique এর leftmost
কলাম দিয়েই সবসময় query হয়)।

### আবিষ্কার #১ — `StudyGroupMember.groupId` মিসিং ইনডেক্স
`lib/study-group.ts` (member list, capacity count
`tx.studyGroupMember.count({ where: { groupId } })`, weekly bonus
query, group leave/delete) ও `lib/reading-room.ts` (group presence
lookup) — সবই `groupId` দিয়ে ফিল্টার করে। কিন্তু schema তে শুধু `userId`
তে `@unique` ছিল (per-user single-group constraint enforce করার
জন্য) — `groupId` এ কোনো ইনডেক্স ছিল না। এটা প্রতিটা Study Group পেজ
ভিজিট ও Reading Room heartbeat এ চলা hot-path query।

### আবিষ্কার #২ — `QuizDuel.challengerId`/`opponentId` মিসিং ইনডেক্স
`app/api/duel/route.ts` (GET — open duels + myActiveDuel চেক, POST —
"already in active duel" চেক) ও `lib/quiz-duel.ts` এর
`getMyDuelHistory()` — সবই এই প্যাটার্নে query করে:
```
where: {
  status: { in: [...] } / "COMPLETED",
  OR: [{ challengerId: userId }, { opponentId: userId }],
}
```
schema তে শুধু `@@index([status, subjectId])` কম্পোজিট ইনডেক্স ছিল —
`challengerId`/`opponentId` কোনোটাতেই ইনডেক্স ছিল না। `OR` কন্ডিশনের
দুইটা branch এ কোনো ইনডেক্স না থাকায় Postgres কে পুরো টেবিল স্ক্যান
করতে হতো (ছোট টেবিলে সমস্যা না, কিন্তু ব্যবহার বাড়লে এটা প্রতিটা Duel
Lobby পেজ ভিজিটে ধীর হয়ে যেত)।

### ফিক্স ও Migration সৃষ্টিতে Established pgvector বাধা (আবার)
Schema তে ৩টা নতুন `@@index` যোগ করা হয়েছে (`StudyGroupMember.groupId`,
`QuizDuel.challengerId`, `QuizDuel.opponentId`)। `prisma migrate dev
--create-only` চালাতে গিয়ে established/documented বাধা আবার পাওয়া
গেছে — **P3006 error: "type vector does not exist"** — shadow database
এ pgvector extension না থাকায় migration diff generate করা যায়নি (এটা
এই প্রজেক্টে বহুবার documented হওয়া সমস্যা, `prisma/prisma#28414` এর
সাথে সম্পর্কিত হলেও এবার ভিন্ন manifestation — shadow DB তে নতুন সম্পূর্ণ
schema apply করার সময় `Unsupported("vector(N)")` টাইপ resolve করতে
ব্যর্থ হয়)।

**সমাধান** (established fix pattern অনুসরণ করে, আগের সেশনগুলোতে
ডকুমেন্টেড): migration ফোল্ডার+SQL ফাইল **ম্যানুয়ালি লেখা হয়েছে**
(`prisma/migrations/20260722000000_add_performance_indexes_studygroupmember_quizduel/migration.sql`,
`CREATE INDEX IF NOT EXISTS` স্টেটমেন্ট দিয়ে), তারপর `prisma migrate
deploy` (যেটা shadow database সম্পূর্ণ বাইপাস করে সরাসরি production
DB তে migration apply করে) ব্যবহার করে সফলভাবে apply করা হয়েছে —
কোনো `migrate reset`/ডেটা লস ছাড়া। `prisma migrate status` চালিয়ে
"Database schema is up to date!" কনফার্ম করা হয়েছে।

**⚠️ গুরুত্বপূর্ণ পার্থক্য এবারের সাথে আগেরবারগুলোর**: এই সেশনে
**pgvector HNSW ইনডেক্স ড্রপ হয়নি** — কারণ migration.sql ম্যানুয়ালি
raw SQL দিয়ে লেখা হয়েছে (কোনো `prisma migrate dev` auto-diff
জেনারেশন হয়নি যেটা vector column drift detect করে ভুলবশত ড্রপ করতে
পারত)। `pnpm exec tsx scripts/fix-vector-index.ts` চালিয়ে
`pdf_chunks_embedding_idx` (HNSW) এর উপস্থিতি কনফার্ম করা হয়েছে —
"ইতিমধ্যে উপস্থিত, কিছু করার দরকার নেই" ফলাফল এসেছে।

### বোনাস ফিক্স — Admin Forum Moderation Panel Unbounded Query
`findMany()` calls এর broader static scan এ (`take`/limit উপস্থিতি
চেক করে) `app/api/admin/forum/posts/route.ts` এ কোনো `take` limit
ছাড়া পুরো `forum_posts` টেবিল (প্রতিটার সাথে `_count: { replies,
votes }` aggregate সহ) আনা হচ্ছিল ধরা পড়ে। বর্তমানে `forum_posts`
count = ০ (এই সেশনে সমস্যা না), কিন্তু এটা growth-unbounded টেবিল —
ব্যবহার বাড়লে (হাজার হাজার পোস্ট) প্রতিটা admin moderation panel
লোডে এটা ধীরে ধীরে ভারী হয়ে যেত। **ফিক্স**: `audit-log.ts` এর
established pagination প্যাটার্ন (`MAX_PAGE_SIZE`) অনুসরণ করে একটা
সহজ `MODERATION_LIST_LIMIT = 100` cap যোগ করা হয়েছে — moderation
panel মূলত recent/pinned পোস্ট দেখানোর জন্য ব্যবহৃত হয় (পুরনো পোস্ট
মডারেট করার প্রয়োজনীয়তা কম), future এ full pagination UI দরকার হলে
`page`/`skip` param সহজেই যোগ করা যাবে।

### False-Positive Elimination (Transparency)
বাকি ১১টা candidate কোডবেজে grep করে verify করা হয়েছে genuine bug না:
- `CQAttempt.cqQuestionId`, `TopicProgress.topicId`,
  `UserBadge.badgeId`, `Bookmark.topicId`, `NoteHelpfulVote.userId` —
  এগুলো composite `@@unique` এর non-leftmost কলাম, কিন্তু কোডবেজে
  কখনো standalone (একা) query হয় না — সবসময় leftmost কলাম (userId)
  দিয়েই query হয়।
- `ForumPost.userId`, `ForumReply.userId`, `QuizBattle.subjectId`,
  `QuizBattleParticipant.userId` — শুধু account-privacy.ts (export/delete
  flow) ও admin-user-management.ts (ইউজার ডিটেইল কাউন্ট) এর মতো
  কম-ফ্রিকোয়েন্সি path এ ব্যবহৃত, hot-path না।

### N+1 Query Pattern স্ক্যান (Negative Result)
`for` লুপ ও `Promise.all(map(async...))` এর ভেতরে `await prisma.` কল
খোঁজার regex স্ক্যানে ১৭টা candidate পাওয়া গেছে, কিন্তু বিশ্লেষণে
দেখা গেছে:
- ১৫টা `prisma/seed*.ts` ফাইলে (one-time database seeding script,
  production runtime hot-path না — এগুলো ইচ্ছাকৃতভাবে বাদ)।
- `app/api/mock-exam/[attemptId]/submit-cq/route.ts` — CQ answer এর
  জন্য sequential AI evaluation loop, ইচ্ছাকৃত ডিজাইন (বাউন্ডেড
  সর্বোচ্চ ৪টা প্রশ্ন, AI rate-limit এড়াতে sequential রাখা হয়েছে,
  কমেন্টে ডকুমেন্টেড)।
- `lib/gamification.ts` — badge award loop, বাউন্ডেড সর্বোচ্চ ৮টা
  ব্যাজ (হার্ডকোডেড badge codes লিস্ট থেকে)।

`Promise.all(array.map(async...))` প্যাটার্নে কোনো DB call সহ কোনো
instance পাওয়া যায়নি (০টা) — parallel N+1 pattern ও নেই।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next; pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো নতুন
   error/warning নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. **লাইভ multi-user regression টেস্ট** (২টা নতুন ইউজার দিয়ে,
   `scripts/test-performance-indexes-regression.py`): Study Group
   তৈরি (User 1) → invite code দিয়ে join (User 2) → member list fetch
   (`groupId` index ব্যবহার করে, প্রথম test attempt এ response-key
   ভুল (`group` এর বদলে সঠিক `membership.group`) ছিল যা ঠিক করার
   পরে ২ জন member সঠিকভাবে দেখা গেছে) → Quiz Duel তৈরি (User 1) →
   duel lobby fetch (`challengerId`/`opponentId` index ব্যবহার করে,
   `myActiveDuel` সঠিকভাবে দেখা গেছে) → দ্বিতীয় ইউজার open duel দেখতে
   পেয়েছে (`OR` condition সঠিকভাবে কাজ করছে) — সব ফাংশনালিটি ঠিকভাবে
   কাজ করছে, কোনো regression নেই।
5. **DB তে সরাসরি ইনডেক্স ভেরিফাই**: `SELECT indexname, indexdef FROM
   pg_indexes WHERE tablename IN ('study_group_members', 'quiz_duels')`
   চালিয়ে ৩টা নতুন B-tree index (`study_group_members_groupId_idx`,
   `quiz_duels_challengerId_idx`, `quiz_duels_opponentId_idx`) সফলভাবে
   তৈরি হয়েছে কনফার্ম করা হয়েছে।
6. **Test cleanup সম্পূর্ণ**: ২টা টেস্ট ইউজার প্রকৃত `/api/user/delete-account`
   endpoint দিয়ে ডিলিট (`studyGroupHandled: "left"` ও `"group_deleted"`
   সঠিকভাবে রিটার্ন হয়েছে — cascade delete logic ঠিকমতো কাজ করছে), DB
   তে psycopg2 দিয়ে সরাসরি চেক করে `users`/`study_group_members`
   টেবিলে টেস্ট ডেটার কোনো রো বাকি নেই ভেরিফাই করা হয়েছে (বাকি ১টা
   `quiz_duels` রো পুরনো shared-DB ডেটা, established warning অনুযায়ী
   স্বাভাবিক)।

### ফলো-আপ যাচাই (একই রাউন্ডে, EXPLAIN + আরও স্ক্যান)
মূল ৩টা index ফিক্স করার পরে আরও কয়েকটা সম্পূরক performance check
চালানো হয়েছে (সবই negative result, transparency এর জন্য নথিভুক্ত):

- **Over-fetching স্ক্যান** (`prisma.user.findUnique()` কল গুলোতে
  `select` আছে কিনা): ২০টা call এ `select` নেই (পুরো `User` row আনে,
  যেখানে অনেক ফিল্ড আছে)। কিন্তু বিশ্লেষণে দেখা গেছে এগুলো সবই
  session-scoped single-row lookup (per-request একবার, N+1 না), এবং
  `User` row ছোট (কোনো বড় Text/Json ফিল্ড নেই) — network/memory impact
  নগণ্য। `Dashboard`/`Planner` পেজে ব্যবহৃত ফিল্ড চেক করে দেখা গেছে
  বেশিরভাগ ফিল্ডই আসলে ব্যবহৃত হচ্ছে (name/email/role/hscBatch/board/
  xp/level/streakCount ইত্যাদি) — তাই `select` যোগ করলে সামান্য
  optimization হতো কিন্তু জটিলতা বাড়াতো, তাই অপরিবর্তিত রাখা হয়েছে।
- **Sequential-but-independent await pattern স্ক্যান** (Promise.all
  এ parallelize করা যেতে পারে এমন pattern): regex স্ক্যানে ১টা candidate
  পাওয়া গেছে (`lib/reading-room.ts` এ `claimResult`+`ended`), কিন্তু
  বিশ্লেষণে প্রমাণিত হয়েছে এটা **ইচ্ছাকৃতভাবে sequential** হতে হবে —
  এটা established atomic-claim race-condition-safety প্যাটার্নের অংশ
  (আগে `updateMany()` দিয়ে claim, তারপরই updated data fetch করা আবশ্যক
  — parallelize করলে stale/racy data আসতে পারে)। **False-positive,
  কোনো পরিবর্তন করা হয়নি।**
- **Forum Feed Content Over-fetch (নথিভুক্ত, ফিক্স করা হয়নি — low
  priority)**: `GET /api/forum/posts` পুরো `content` (`@db.Text`,
  সম্ভাব্য বড় পোস্ট বডি) client এ পাঠায়, কিন্তু UI তে
  (`components/forum/forum-feed.tsx`) শুধু `line-clamp-1` দিয়ে ১ লাইন
  truncated preview দেখানো হয় — বাকিটা অপচয় হওয়া network payload।
  Prisma দিয়ে সরাসরি substring/truncated select করা সম্ভব না (raw SQL
  `LEFT()` লাগবে), আর এই মুহূর্তে forum_posts কম (ছোট payload impact)
  বলে এটা **নথিভুক্ত করা হলো কিন্তু ফিক্স করা হয়নি** (ভবিষ্যতে forum
  ব্যবহার অনেক বাড়লে raw SQL truncation বিবেচনা করা যেতে পারে)।
- **Postgres planner EXPLAIN ভেরিফিকেশন** (নতুন ৩টা index actually
  valid/usable কিনা নিশ্চিত করতে): ছোট টেবিলে (`quiz_duels`,
  `study_group_members` — বর্তমানে ১-২টা রো) স্বাভাবিক `EXPLAIN` এ
  Postgres planner **Seq Scan** বেছে নেয় (এটা expected behavior — ছোট
  টেবিলে index scan এর চেয়ে seq scan প্রকৃতপক্ষে দ্রুত/সস্তা, planner
  cost-based decision নেয়)। `SET enable_seqscan = off;` দিয়ে force
  করে ভেরিফাই করা হয়েছে যে নতুন index গুলো (`quiz_duels_challengerId_idx`,
  `study_group_members_groupId_idx`) **actually valid এবং usable** —
  `Bitmap Index Scan`/`Index Scan` প্ল্যান সঠিকভাবে দেখা গেছে। ডেটা
  বাড়ার সাথে সাথে Postgres planner স্বয়ংক্রিয়ভাবে এই index গুলো
  ব্যবহার শুরু করবে (কোনো ম্যানুয়াল hint/force দরকার হবে না)।

### নতুন টুলিং/জ্ঞান
- **Prisma schema FK-vs-index coverage audit script** — brace-depth-aware
  model parsing দিয়ে, leftmost-column matching যুক্তি সহ — ভবিষ্যতে
  নতুন মডেল/রিলেশন যোগ হওয়ার পরে periodic re-run করা উচিত।
- **pgvector shadow-DB migration workaround পুনরায় প্রমাণিত reusable**:
  `prisma migrate dev --create-only` ব্যর্থ হলে ম্যানুয়াল migration.sql
  + `prisma migrate deploy` (shadow DB সম্পূর্ণ বাইপাস) — নিরাপদ এবং
  raw-SQL approach pgvector drift-detection বাগ এড়িয়ে যায় (কারণ
  Prisma auto-diff জেনারেশন প্রক্রিয়ায় জড়িত হয় না)।
- নতুন migration: `prisma/migrations/20260722000000_add_performance_indexes_studygroupmember_quizduel/`।
- নতুন audit/test script: `scripts/audit-unbounded-findmany-scan.py`,
  `scripts/audit-n-plus-one-scan.py`,
  `scripts/test-performance-indexes-regression.py`।

## 🔧 Database Migration — নতুন Supabase প্রজেক্টে স্থানান্তর ✅ সম্পন্ন

### প্রেক্ষাপট
Performance অডিট শেষ হওয়ার পরে ব্যবহারকারী পরবর্তী কাজের দিকনির্দেশ
জিজ্ঞাসা করার আগেই, নতুন session এ sandbox recovery checklist চালানোর
সময় ধরা পড়ে পুরনো Supabase প্রজেক্ট (`iluptprltazdluovauwk`, region
ap-southeast-2) এ persistent connection timeout হচ্ছে।

### সমস্যার লক্ষণ ও ডায়াগনসিস
- `prisma migrate status` এ `P1001: Can't reach database server`।
- psycopg2 দিয়ে `connect_timeout=15/30/45/60` — সব ক্ষেত্রে timeout।
- Raw TCP socket connect (Python `socket.connect()`) সফল হচ্ছিল কিন্তু
  Postgres wire-protocol SSL request পাঠানোর পরে কোনো response আসছিল
  না (raw SSL-negotiation byte পাঠিয়ে `recv(1)` করে timeout পাওয়া
  গেছে)।
- একই হোস্টে HTTPS (443 পোর্ট) দিয়ে TLS handshake সম্পূর্ণ সফল হচ্ছিল
  (তুলনামূলক টেস্ট), তাই এটা সাধারণ network/DNS ব্যর্থতা না, বরং
  specifically Postgres port (5432/6543) এ কোনো একটা bottleneck।
- Supabase REST API (`https://iluptprltazdluovauwk.supabase.co`) HTTP
  404 রিটার্ন করছিল (প্রজেক্ট existent/active, কিন্তু endpoint না
  থাকায় 404) — তাই প্রজেক্ট সম্পূর্ণ ডাউন ছিল না।
- একাধিক retry (৩০+৪৫+৬০ সেকেন্ড wait সহ) করেও সমাধান হয়নি।
- **Root cause নিশ্চিতভাবে চিহ্নিত করা যায়নি** — sandbox network egress
  filtering (নির্দিষ্ট Postgres port ব্লক) বা Supabase pooler-side
  সাময়িক আউটেজ দুটোই সম্ভাব্য কারণ, কিন্তু নিশ্চিত প্রমাণ পাওয়া যায়নি।

### সমাধান — নতুন Supabase প্রজেক্ট
ব্যবহারকারী নতুন Supabase অ্যাকাউন্ট থেকে নতুন প্রজেক্ট
(`dsgbfqczysgivlpcksry`, region **ap-northeast-1**, আগেরটা ছিল
ap-southeast-2) তৈরি করে connection string (Direct/Transaction
Pooler/Session Pooler তিনটাই) শেয়ার করেছেন। Database password ভুলে
যাওয়ায় Supabase Dashboard থেকে reset করে নতুন password
(`@Abdullah1221122`) সেট করা হয়েছে।

**প্রথম কানেকশন প্রচেষ্টায়** "server closed the connection unexpectedly"
এসেছিল উভয় পোর্টেই (৫৪৩২ ও ৬৫৪৩) — এটা network timeout না, বরং
Postgres-level প্রত্যাখ্যান, যা ইঙ্গিত দেয় প্রজেক্ট তখনো পুরোপুরি
provision/initialize হয়নি (নতুন Supabase প্রজেক্ট তৈরির পরে ডেটাবেস
সম্পূর্ণ প্রস্তুত হতে কয়েক মিনিট সময় লাগতে পারে, এটা known behavior)।
কিছুক্ষণ অপেক্ষা করে (sandbox reset হয়ে যাওয়ায় নতুন করে swap+pip
সেটআপ করতে হয়েছিল) retry করার পরে Transaction Pooler (৬৫৪৩) ও Session
Pooler (৫৪৩২) উভয়ই সফলভাবে কানেক্ট হয়েছে।

### বাস্তবায়ন ধাপ
1. **`.env`/`.env.local` আপডেট**: `DATABASE_URL` (Transaction Pooler,
   `?pgbouncer=true` সহ, app runtime pooled connection) ও `DIRECT_URL`
   (Session Pooler, migration এর জন্য) উভয়ই নতুন হোস্ট
   (`aws-0-ap-northeast-1.pooler.supabase.com`) ও নতুন project-ref
   (`dsgbfqczysgivlpcksry`) দিয়ে replace করা হয়েছে। Password URL-encode
   করা হয়েছে (`@` → `%40`, established পদ্ধতি অনুসরণ করে)। `.env`
   ফাইলে একটা তারিখ-সহ comment যোগ করা হয়েছে migration এর কারণ ব্যাখ্যা
   করে (ভবিষ্যতে কেউ এই ফাইল দেখলে বুঝতে পারবে কেন হোস্টনেম পরিবর্তন
   হয়েছে)।
2. **pgvector extension enable**: নতুন (সম্পূর্ণ খালি) ডেটাবেসে
   `CREATE EXTENSION IF NOT EXISTS vector;` psycopg2 দিয়ে সরাসরি চালিয়ে
   pgvector সংস্করণ 0.8.2 ইনস্টল/ভেরিফাই করা হয়েছে — এটা migration
   চালানোর **আগে** করা জরুরি ছিল কারণ schema তে
   `Unsupported("vector(1024)")` টাইপ ব্যবহৃত হয়েছে (`PdfChunk.embedding`)
   যেটা extension ছাড়া তৈরি হতে পারবে না।
3. **`prisma migrate deploy`**: সব ১৫টা migration ফাইল সিকোয়েন্সিয়ালি
   apply হয়েছে খালি ডেটাবেসে — কোনো shadow-DB সমস্যা এবার হয়নি কারণ
   `migrate deploy` কমান্ড production/target DB তে সরাসরি migration
   history অনুযায়ী apply করে, কোনো diff-generation বা shadow DB লাগে
   না (এই কমান্ড শুধু নতুন/খালি ডেটাবেসে সব migration apply করার
   জন্যই ডিজাইন করা, `migrate dev` এর বিপরীতে)। `prisma migrate status`
   এ "Database schema is up to date!" কনফার্ম হয়েছে।
4. **HNSW ইনডেক্স ভেরিফিকেশন**: `pnpm exec tsx scripts/fix-vector-index.ts`
   চালিয়ে `pdf_chunks_embedding_idx` উপস্থিতি কনফার্ম করা হয়েছে
   ("ইতিমধ্যে উপস্থিত, কিছু করার দরকার নেই") — migration এর ভেতরের raw
   SQL statement দিয়েই সঠিকভাবে তৈরি হয়ে গেছে, কোনো আলাদা recovery
   দরকার হয়নি।
5. **টেবিল কাঠামো ভেরিফিকেশন**: `information_schema.tables` কুয়েরি
   করে ৫১টা টেবিল (৫০টা Prisma মডেল + `_prisma_migrations` history
   টেবিল) নিশ্চিত করা হয়েছে।

### কনটেন্ট পুনরায় সিড করা (৩০টা+ seed script)
নতুন ডেটাবেস সম্পূর্ণ খালি ছিল (কোনো Subject/Topic/Question/User
ডেটা নেই), তাই সব established seed script `package.json` এর `db:seed*`
কমান্ড দিয়ে একে একে চালানো হয়েছে:
- `db:seed` — মূল Subject→Chapter→Topic হায়ারার্কি (১৩টা Subject,
  ৮৯টা Chapter, ১৮৫টা Topic)।
- `db:seed-questions`, `db:seed-questions-2` — মূল MCQ Question Bank
  (৩২+৯৪ = ১২৬টা)।
- `db:seed-questions-{physics,hmath,biology}-gaps`,
  `db:seed-questions-chem-ict-gaps` — গ্যাপ-ফিল MCQ (২০+৫৫+৪৫+২৯ =
  ১৪৯টা)।
- `db:seed-board-questions` — পূর্ববর্তী বছরের বোর্ড প্রশ্ন (৮টা)।
- `db:seed-admission-questions` — Admission Prep (BUET/Medical/DU_A_Unit,
  ৫৩টা)।
- `db:seed-bangla-english-ict` — Bangla/English/ICT MCQ (৭৭টা)।
- **মোট MCQ: ৩২+৯৪+২০+৫৫+৪৫+২৯+৮+৭৭ = ৩৬০ (Admission ৫৩টা আলাদা
  টেবিলে, তাই মূল `questions` টেবিলে ৩৪৯টা)।**
- `db:seed-cq`, `db:seed-cq-2` — মূল CQ (৩+৬ = ৯টা)।
- `db:seed-cq-{physics1,physics2,chemistry,biology2,hmath1,hmath2,ict}` —
  সব বিষয়ের CQ (১০+৬+৭+৮+৯+৯+৬ = ৫৫টা)।
- **মোট CQ: ৯+৫৫ = ৬৪টা**।
- `db:seed-badges` — ১৪টা gamification badge।
- `db:seed-{physics1,physics2,chemistry,biology1,biology2,hmath1,hmath2,ict,bangla,english}-notes` —
  সব ১০টা বিষয়ের Topic Notes+Formula Sheet (১১+৮+৯+১১+৯+১০+১০+৬+৪+৪ =
  ৮২টা টপিকে নোট)।

সব script log ভালোভাবে verify করা হয়েছে (কোনো error, প্রতিটার শেষে
"✅ মোট X সিড করা হলো" confirmation)।

### Admin অ্যাকাউন্ট পুনরায় তৈরি
কোনো dedicated admin-seed script খুঁজে পাওয়া যায়নি (schema/scripts
রিভিউ করে বোঝা গেছে আগে ম্যানুয়ালি `/api/auth/register` দিয়ে তৈরি করে
তারপর role ম্যানুয়ালি ADMIN করা হয়েছিল)। একই পদ্ধতি অনুসরণ করা হয়েছে:
1. dev server চালিয়ে `POST /api/auth/register` দিয়ে
   `abn21.noman@gmail.com` / `@Abdullah1221` অ্যাকাউন্ট তৈরি (established
   admin credentials, README.md এ documented)।
2. psycopg2 raw SQL দিয়ে `UPDATE users SET role='ADMIN' WHERE
   email=...` চালিয়ে role promote করা হয়েছে, `RETURNING` দিয়ে সাথে
   সাথে ভেরিফাই করা হয়েছে।

### লাইভ ভেরিফিকেশন
dev server চালিয়ে নতুন admin অ্যাকাউন্ট দিয়ে পুরো ফ্লো টেস্ট করা
হয়েছে:
- Login → session এ `role: 'ADMIN'` কনফার্ম।
- `/dashboard`, `/learn`, `/admin`, `/practice` (HTML এ "পদার্থবিজ্ঞান"
  টেক্সট উপস্থিতি চেক করে সিড করা কনটেন্ট রেন্ডার হচ্ছে নিশ্চিত করা
  হয়েছে), `/flashcards`, `/mock-exam`, `/badges` — সব পেজ HTTP 200,
  কোনো crash/500 error নেই।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন (কোনো কোড পরিবর্তন হয়নি, শুধু
   `.env`/`.env.local` + ডেটাবেস কনটেন্ট, তাই এটা প্রত্যাশিত)।
2. `rm -rf .next; pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, নতুন DB
   connection দিয়ে কোনো সমস্যা হয়নি।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত লাইভ multi-page ভেরিফিকেশন।

### ⚠️ গুরুত্বপূর্ণ সীমাবদ্ধতা (স্বচ্ছতার জন্য নথিভুক্ত)
পুরনো ডেটাবেসের **সব পুরনো ডেটা স্থায়ীভাবে হারিয়ে গেছে** — কোনো
backup/dump নেওয়া সম্ভব হয়নি কারণ পুরনো ডেটাবেস সম্পূর্ণভাবে
unreachable ছিল (তাই ডেটা এক্সপোর্ট করার কোনো উপায় ছিল না)। এর মধ্যে
ছিল:
- আগের সব bug-hunt/regression টেস্ট সেশনের অবশিষ্ট টেস্ট ডেটা (যদিও
  established practice অনুযায়ী বেশিরভাগ টেস্ট ইউজার প্রতিবার cleanup
  করা হয়েছিল, তাই এই লস সম্ভবত ন্যূনতম)।
- Admin অ্যাকাউন্টের পুরনো badges/notifications/audit log history।
- যেকোনো বাস্তব (non-test) ব্যবহারকারীর প্রোফাইল/প্রোগ্রেস/XP/streak
  ডেটা, যদি থাকত।

এটা গ্রহণযোগ্য কারণ প্রজেক্ট এখনো development/personal-use পর্যায়ে
আছে (কোনো live production user নেই), এবং সব **কনটেন্ট** (Subject/
Topic/Question/CQ/Badge/Notes) সফলভাবে পুনরায় সিড করা হয়েছে — শুধু
user-generated ডেটা (progress, XP, forum posts ইত্যাদি) হারিয়ে গেছে
যা নতুন ব্যবহারের সাথে সাথে আবার জমা হবে।

### ভবিষ্যতের জন্য নোট
- **Supabase Free Tier প্রজেক্ট দীর্ঘদিন inactive থাকলে pause হয়ে
  যেতে পারে** — এই ধরনের persistent connection timeout দেখা দিলে
  ভবিষ্যতে প্রথমে Supabase Dashboard এ গিয়ে প্রজেক্ট status
  ("Active"/"Paused") চেক করা উচিত, তারপরই নতুন প্রজেক্টে migrate
  করার সিদ্ধান্ত নেওয়া উচিত (এবার এই চেক করা হয়নি কারণ Dashboard
  access সরাসরি ছিল না, শুধু connection string শেয়ার হয়েছিল)।
- **নিয়মিত ডেটাবেস backup/dump নেওয়ার প্রয়োজনীয়তা** — এই ঘটনা থেকে
  শেখা শিক্ষা: ভবিষ্যতে periodic `pg_dump` বা Supabase এর built-in
  backup ফিচার ব্যবহার করলে এই ধরনের সমস্যায় ডেটা লস এড়ানো যেত।
  বর্তমানে প্রজেক্ট personal-use পর্যায়ে থাকায় এটা জরুরি ছিল না,
  কিন্তু production এ যাওয়ার আগে এটা বিবেচনা করা উচিত।
- **project-ref ও region পরিবর্তনের প্রভাব**: নতুন প্রজেক্ট আলাদা
  region এ (ap-northeast-1 বনাম ap-southeast-2) — latency সামান্য
  ভিন্ন হতে পারে বাংলাদেশ থেকে access করার সময়, কিন্তু এটা কোনো
  কার্যকরী সমস্যা তৈরি করেনি এই সেশনে।

## 🆕 হাতে লেখা CQ উত্তর ছবি তুলে জমা দেওয়া (OCR + AI Evaluation) ✅ সম্পন্ন

### প্রেক্ষাপট
Database Migration সম্পন্ন হওয়ার পরে ব্যবহারকারী "Next" নির্দেশ দেওয়ায়
`ask_user` টুলে পরবর্তী priority জিজ্ঞাসা করা হয় — ব্যবহারকারী "নতুন
ফিচার যোগ করো, আমি নিজে সিদ্ধান্ত নিয়ে ডিজাইন+বিল্ড করব" অপশন বেছে
নিয়েছেন। প্রথমে `docs/FEATURE_RESEARCH.md`–`V5` সব রিভিউ করে দেখা গেছে
প্রতিটা identified আইটেম ইতিমধ্যে বাস্তবায়িত (FSRS, Retention Forecast,
Weekly Recap, Confidence-Based Answering, Misconception Tagging,
সবকিছু) — তাই নতুন fresh deep research করা হয়েছে established practice
অনুযায়ী।

### Deep Research
`web_search` দিয়ে দুইটা angle এ গবেষণা করা হয়েছে:
1. **গ্লোবাল ২০২৬ EdTech ট্রেন্ড**: "AI grading handwritten exam answer
   photo upload OCR" — ফলাফলে ExamAI, GradeLab, GradingPal, GradeX
   এর মতো একাধিক প্রতিষ্ঠিত প্রোডাক্ট পাওয়া গেছে যেগুলো সবই ২০২৬ সালে
   handwritten answer এর ছবি/স্ক্যান আপলোড করে OCR+rubric-based AI
   grading অফার করছে — এটা একটা প্রমাণিত, matured EdTech pattern।
2. **বাংলাদেশ HSC মার্কেট-স্পেসিফিক**: "HSC বাংলাদেশ CQ সৃজনশীল প্রশ্ন
   হাতে লেখা উত্তর মূল্যায়ন AI" — জনপ্রিয় competitor **SATT Academy**
   এর ওয়েবসাইটে "SATT AI Analysis" ফিচার পাওয়া গেছে যা CQ প্রশ্নের
   জটিল ধাপ/উদ্দীপকের সাথে উত্তরের প্রাসঙ্গিকতা বিশ্লেষণ করতে সাহায্য
   করে — প্রমাণ করে বাংলাদেশী HSC ছাত্রদের মধ্যে এই ধরনের AI-assisted
   CQ ফিচারের বাস্তব চাহিদা আছে।

### সমস্যা চিহ্নিতকরণ
বাস্তব HSC পরীক্ষায় ছাত্ররা CQ (সৃজনশীল প্রশ্ন) এর উত্তর হাতে লেখে
(পরীক্ষার খাতায়), কিন্তু আমাদের প্ল্যাটফর্মের CQ Practice ও Mock Exam
এ এতদিন শুধু টাইপ করে (Textarea তে সরাসরি) উত্তর দেওয়ার ব্যবস্থা ছিল।
এটা দুইটা সমস্যা তৈরি করে: (১) বাস্তব পরীক্ষার অভিজ্ঞতার সাথে ম্যাচ
করে না (ছাত্র হাতে লিখে অভ্যস্ত, টাইপ করায় না), (২) যেসব ছাত্র দ্রুত
টাইপ করতে পারে না তাদের জন্য practice করা কষ্টকর/সময়সাপেক্ষ হয়ে যায়।

### সমাধান ডিজাইন — সম্পূর্ণ Schema-Free, বিদ্যমান Infrastructure পুনর্ব্যবহার
এই ফিচারের সবচেয়ে গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত: **কোনো নতুন backend
endpoint, AI system prompt, বা DB model লাগেনি** — সম্পূর্ণভাবে
বিদ্যমান established infrastructure পুনর্ব্যবহার করা হয়েছে:

1. **OCR Extraction**: বিদ্যমান `POST /api/flashcard-decks/ocr-extract`
   endpoint (আগে OCR Pipeline ফিচারে বানানো হয়েছিল হাতের লেখা নোট
   থেকে ফ্ল্যাশকার্ড বানানোর জন্য) সরাসরি reuse করা হয়েছে — এই
   endpoint `getVisionResponse()` (Mistral Pixtral → OpenRouter
   Gemini Vision fallback chain) দিয়ে ছবি থেকে raw টেক্সট বের করে,
   কোনো পরিবর্তন ছাড়াই CQ উত্তরের জন্যও কাজ করে (OCR system prompt
   generic — "ছবিতে থাকা সব লেখা হুবহু বের করো", CQ-স্পেসিফিক কোনো
   change দরকার হয়নি)।
2. **CQ Evaluation**: বিদ্যমান `evaluateCQAnswer()` (lib/cq-evaluator.ts)
   সম্পূর্ণ অপরিবর্তিত — OCR করা টেক্সট শুধু existing
   `answerA`/`answerB`/`answerC`/`answerD` স্ট্রিং ফিল্ডে গিয়ে বসে
   (React state এ), তারপর সেই একই টেক্সট বিদ্যমান `POST
   /api/cq/[cqQuestionId]/submit` বা `POST
   /api/mock-exam/[attemptId]/submit-cq` এ পাঠানো হয় — backend এর
   দৃষ্টিকোণ থেকে এটা টাইপ করা উত্তর ও OCR করা উত্তরের মধ্যে কোনো
   পার্থক্য করে না, যেটা designed simplicity।
3. **UI Pattern**: `capture="environment"` file input attribute
   (established, OCR Generate Dialog ও Live Exam Custom Question
   Set এ ব্যবহৃত) — মোবাইল ডিভাইসে ফাইল পিকার এর বদলে সরাসরি ক্যামেরা
   অ্যাপ খোলে।

### নতুন কম্পোনেন্ট: `components/shared/handwritten-answer-button.tsx`
`VoiceInputButton` এর ঠিক পাশে বসানোর জন্য ডিজাইন করা একটা ছোট icon
বাটন (একই সাইজ, একই visual weight) — যুক্তি: কথা বলে লেখা (Voice
Input) ও ছবি তুলে লেখা (Handwritten Answer) দুটোই "বিকল্প ইনপুট
পদ্ধতি" যা টাইপিং প্রতিস্থাপন/পরিপূরক করে, তাই একসাথে গ্রুপ করে
দেখানো UX দিক থেকে যুক্তিসঙ্গত। ক্লিক করলে একটা compact modal
(`Dialog` প্রাইমিটিভ, `max-w-md`) খোলে দুই-ধাপের state machine সহ
(established OCR Generate Dialog এর ৩-ধাপ প্যাটার্ন থেকে simplified,
এখানে "generate" ধাপ নেই কারণ শুধু টেক্সট এক্সট্র্যাক্ট করেই কাজ
শেষ):
- **`upload` ধাপ**: ছবি select/capture, প্রিভিউ দেখানো, "লেখা পড়ো"
  বাটনে OCR extract API কল।
- **`review` ধাপ**: AI যা পড়েছে তা `Textarea` তে দেখানো (edit করা
  যায়, কারণ OCR মাঝে মাঝে ভুল পড়তে পারে বিশেষত হাতের লেখায়), "যোগ
  করো" বাটনে `onResult(extractedText)` callback কল করে dialog বন্ধ
  হয়ে যায়। "আবার ছবি তোলো" বাটন দিয়ে upload ধাপে ফিরে যাওয়া যায়।

`onResult` callback প্যাটার্ন হুবহু `VoiceInputButton` এর মতো —
parent কম্পোনেন্ট এর existing answer state এ **append** করে
(replace না), যাতে ইউজার প্রয়োজনে একাধিকবার ছবি তুলে ধাপে ধাপে লম্বা
উত্তর একত্র করতে পারে (যেমন ক-অংশ এক ছবি থেকে, তারপর আরেকটা লাইন
আরেক ছবি থেকে)।

### Integration — CQ Runner ও Mock Exam Runner
দুই জায়গাতেই (`components/cq/cq-runner.tsx` ও
`components/mock-exam/mock-exam-runner.tsx`) প্রতিটা ৪টা প্রশ্নের
(ক/খ/গ/ঘ) ঠিক পাশে `VoiceInputButton` এর সাথে `flex items-center
gap-1.5` wrapper div এ গ্রুপ করে `HandwrittenAnswerButton` বসানো
হয়েছে। Mock Exam Runner এ বিদ্যমান
`appendCqAnswerFromVoice(field, transcript)` ফাংশন (আগে Voice Input
ফিচারে বানানো হয়েছিল) pure/generic হওয়ায় ("field" আর "text" ছাড়া আর
কিছুর উপর নির্ভর করে না) হুবহু reuse করা গেছে HandwrittenAnswerButton
এর `onResult` এও — কোনো নতুন state-management ফাংশন লেখার দরকার
হয়নি, শুধু একটা extra JSX element যোগ করা হয়েছে।

### লাইভ End-to-End টেস্ট (Python + Pillow, বাস্তব Vision AI কল)
Established সেশনের OCR Pipeline টেস্টিং প্যাটার্ন অনুসরণ করে (Python
Pillow দিয়ে টেস্ট ইমেজ জেনারেট করে বাস্তব AI কল যাচাই):
1. **টেস্ট ইমেজ তৈরি**: `lib/fonts/HindSiliguri-Regular.ttf` ব্যবহার
   করে একটা বাস্তবসম্মত ৪-লাইনের বাংলা CQ-উত্তর-স্টাইল ইমেজ বানানো
   হয়েছে ("ক. নিউটনের প্রথম সূত্র হলো জড়তার সূত্র। খ. কোনো বস্তুর উপর
   নীট বল শূন্য হলে বস্তুটি স্থির থাকে অথবা সমবেগে সরলরেখায় চলতে
   থাকে। এটাই জড়তার ধর্ম।") — `read_file` দিয়ে ভিজুয়ালি ভেরিফাই করে
   নিশ্চিত হওয়া গেছে ছবিতে টেক্সট স্পষ্টভাবে পড়া যাচ্ছে।
2. **নতুন ইউজার দিয়ে লাইভ OCR টেস্ট**: register+login করে ছবি Base64
   data URL হিসেবে `/api/flashcard-decks/ocr-extract` এ পাঠানো হয়েছে
   — Mistral provider থেকে **হুবহু নির্ভুল** টেক্সট ফেরত এসেছে
   (বাংলা লাইন-ব্রেক ঠিক বজায় ছিল, শুধু "নীট" → "নেট" একটা ছোট বানান
   পার্থক্য এসেছে যা OCR এর স্বাভাবিক variance, মূল অর্থ অপরিবর্তিত)।
3. **Authorization/Validation চেক**: unauthenticated রিকোয়েস্ট → ৪০১,
   ছবি ছাড়া রিকোয়েস্ট → ৪০০ — established validation logic এই নতুন
   ব্যবহারের ক্ষেত্রেও সঠিকভাবে কাজ করছে (কোনো নতুন কোড এখানে টাচ
   করা হয়নি বলে regression-free প্রমাণিত)।
4. **পূর্ণ End-to-End Pipeline যাচাই** (সবচেয়ে গুরুত্বপূর্ণ টেস্ট): DB
   থেকে একটা বাস্তব CQ প্রশ্ন আইডি নিয়ে, OCR করা টেক্সট সরাসরি
   `POST /api/cq/[cqQuestionId]/submit` এ `answerA` হিসেবে পাঠানো
   হয়েছে — response এ `attemptId` পাওয়া গেছে (২০০ status), DB তে
   সরাসরি `cq_attempts` টেবিল চেক করে নিশ্চিত হওয়া গেছে OCR টেক্সট
   হুবহু `answerA` কলামে সংরক্ষিত হয়েছে এবং AI evaluation চলেছে
   (`feedback` কলামে বাংলা ফিডব্যাক টেক্সট পাওয়া গেছে, `scoreA=0`
   কারণ শুধু ক-অংশ উত্তর দেওয়া হয়েছিল বাকি সব খালি রেখে — এটা
   established evaluation logic এর প্রত্যাশিত আচরণ, নতুন ফিচারের
   কোনো bug না)।
5. মোট **৭/৭ automated assertion পাস**।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next; pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো নতুন
   error/warning নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত লাইভ end-to-end multi-step টেস্ট (register→login→OCR
   extract→CQ submit→cleanup)।
5. **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার প্রকৃত `POST
   /api/user/delete-account` endpoint দিয়ে ডিলিট, DB তে psycopg2
   দিয়ে সরাসরি চেক করে `users` টেবিলে কোনো রো বাকি নেই এবং তৈরি করা
   `CQAttempt` রো cascade delete এ সঠিকভাবে মুছে গেছে ভেরিফাই করা
   হয়েছে।

### UI-লেভেল টেস্ট মেথডোলজি সীমাবদ্ধতা (নথিভুক্ত, established pattern)
CQ Practice পেজে HTML fetch করে `aria-label`/টেক্সট উপস্থিতি চেক করার
চেষ্টা করা হয়েছিল, কিন্তু `CQRunner` একটা client component
(`"use client"`) যা mount হওয়ার পরে client-side fetch দিয়ে প্রশ্ন
লোড করে — তাই server-rendered initial HTML এ বাটন দেখা যায় না। এটা
আগের Accessibility অডিট সেশনেও একই সীমাবদ্ধতা হিসেবে নথিভুক্ত হয়েছিল
(Study Group Dashboard এর ক্ষেত্রে) — `tsc`/`build`/`lint` সব পাস
করা এবং কম্পোনেন্ট সঠিকভাবে import/ব্যবহৃত হওয়া compile-level এ
নিশ্চিত হওয়াই যথেষ্ট প্রমাণ, ব্রাউজার-রেন্ডারিং টেস্ট (Playwright)
ছাড়া client-component এর initial-HTML fetch দিয়ে UI ভেরিফাই করা
সম্ভব না।

### Files তৈরি/পরিবর্তিত
- **নতুন**: `components/shared/handwritten-answer-button.tsx`
- **পরিবর্তিত**: `components/cq/cq-runner.tsx` (import + ৪টা প্রশ্নে
  বাটন যোগ), `components/mock-exam/mock-exam-runner.tsx` (import +
  ৪টা প্রশ্নে বাটন যোগ)
- **নতুন test script**: `scripts/test-handwritten-cq-answer.py`

কোনো নতুন migration/dependency লাগেনি (সম্পূর্ণ frontend + বিদ্যমান
API reuse)।

## 🐛 গুরুতর বাগ ফিক্স — Admin User Ban/Role-Change Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
হাতে লেখা CQ উত্তর ফিচার শেষ হওয়ার পরে ব্যবহারকারী "Next" নির্দেশ
দেওয়ায় প্রোঅ্যাক্টিভ Bug Hunt চালিয়ে যাওয়া হয়েছে, এবার Admin bulk
actions/User management endpoint গুলো টার্গেট করে (আগে অন্য এলাকায়
৫টা+ রাউন্ড bug hunt হয়েছে — race condition এর দুইটা মূল ক্লাস
প্রতিষ্ঠিত হয়ে গিয়েছিল)।

### কোড রিভিউ পদ্ধতি
`app/api/admin/users/[userId]/ban/route.ts` ও
`app/api/admin/users/[userId]/route.ts` (role change) ম্যানুয়ালি
রিভিউ করে দেখা গেছে দুটোতেই একই প্যাটার্ন:
```
const targetUser = await prisma.user.findUnique({ where: { id: userId } });
if (!targetUser) return 404;
// ... কিছু ভ্যালিডেশন ...
const user = await prisma.user.update({ where: { id: userId }, data: {...} });
```
এটা হুবহু established "P2025 500-instead-of-404" বাগ ক্লাসের প্যাটার্ন
— existence check করা হয়েছে কিন্তু check ও update এর মাঝে যদি কোনো
concurrent request ওই রেকর্ড ডিলিট করে দেয়, তাহলে `update()` Prisma
P2025 exception throw করে যা catch করা হয়নি (unhandled exception →
৫০০ Internal Server Error)।

### লাইভ প্রুফ — Ban Endpoint
Python `threading` দিয়ে একই userId তে সমান্তরালে (concurrent) `PATCH
.../ban` ও `DELETE /api/admin/users/[userId]` পাঠানো হয়েছে। প্রথম
প্রচেষ্টাতেই বাগ reproduce হয়েছে:
```
ban result: (500, '')
delete result: (200, '{"deleted":true}')
```
dev server log এ exact root cause কনফার্ম হয়েছে:
```
PrismaClientKnownRequestError:
An operation failed because it depends on one or more records that
were required but not found. No record was found for an update.
    at app/api/admin/users/[userId]/ban/route.ts:59:34
{ code: 'P2025', meta: { modelName: 'User', ... } }
PATCH /api/admin/users/.../ban 500 in 3.1s
DELETE /api/admin/users/... 200 in 3.2s
```

### ফিক্স — Ban Endpoint
`update()` এর বদলে `updateMany({ where: { id: userId }, data: {...}
})` ব্যবহার করা হয়েছে — এই মেথড কখনো throw করে না, শুধু matched row
count রিটার্ন করে (established Content Report/Mock Exam/Live Exam
সিরিজে ব্যবহৃত একই atomic-claim প্যাটার্ন, কিন্তু এখানে race-condition
window বন্ধ করার জন্য না, বরং "record exists during write" guarantee
এর জন্য ব্যবহার করা হয়েছে — সূক্ষ্ম কিন্তু গুরুত্বপূর্ণ পার্থক্য: এখানে
কোনো concurrent-duplicate-action সমস্যা নেই, শুধু "target already
gone" সমস্যা)।

```ts
const claimResult = await prisma.user.updateMany({
  where: { id: userId },
  data: { isBanned: banned, banReason: ..., bannedAt: ..., bannedBy: ... },
});

if (claimResult.count === 0) {
  return NextResponse.json({ error: "এই ইউজার ইতিমধ্যে ডিলিট হয়ে গেছে" }, { status: 404 });
}

// findUniqueOrThrow না ব্যবহার করে findUnique (non-throwing) — আরও
// এক স্তর ডিফেন্সিভ, অত্যন্ত ছোট window এ যদি updateMany() এর পরেও
// তাত্ক্ষণিক delete হয়ে যায় তাহলে crash না করে graceful ৪০৪
const user = await prisma.user.findUnique({ where: { id: userId }, select: {...} });
if (!user) return NextResponse.json({ error: "..." }, { status: 404 });
```

### প্রতিরোধমূলক (Defensive) ফিক্স — Role-Change Endpoint
একই ফাইলের প্যাটার্ন `PATCH /api/admin/users/[userId]` (role change)
এও পাওয়া গেছে। ম্যানুয়াল concurrent টেস্টে (১০+৮ = ১৮ বার concurrent
role-change+delete চেষ্টা) সরাসরি crash reproduce করা যায়নি —
সম্ভাব্য কারণ `deleteUserAccount()` (৩০+টা টেবিল cascade delete করে)
role-update এর তুলনায় অনেক ধীর, তাই বেশিরভাগ সময় role-update আগেই
শেষ হয়ে যাচ্ছিল এবং delete পরে গিয়ে normal delete হিসেবে সফল হচ্ছিল
(race window ব্যবহারিকভাবে খুব সংকীর্ণ, কিন্তু শূন্য না)। তাত্ত্বিক
ঝুঁকি এখনো বিদ্যমান থাকায় consistency ও future-proofing এর জন্য একই
`updateMany()` atomic-claim প্যাটার্ন এখানেও প্রয়োগ করা হয়েছে
(established principle: "একই bug class একবার একটা এলাকায় পাওয়া
গেলে কাছাকাছি সব কোড path এ প্রতিরোধমূলক ফিক্স করা ভালো অভ্যাস,
শুধু reproduce করা জায়গাতেই সীমাবদ্ধ না থেকে")।

### লাইভ Multi-Iteration ভেরিফিকেশন (Fix এর পরে)
1. **Ban race** (৫+৮ = ১৩ iteration): কোনো ৫০০ crash নেই। একবার
   delete race জিতে ban সঠিকভাবে ৪০৪ রিটার্ন করেছে (আগে যেটা crash
   হতো), বাকিগুলোতে ban race জিতে ২০০ সফল হয়েছে।
2. **Role-change race** (১০+৮ = ১৮ iteration): কোনো ৫০০ crash নেই।
   ২ বার (একবার প্রথম রাউন্ডে, একবার দ্বিতীয় রাউন্ডে) delete race
   জিতে role-change সঠিকভাবে ৪০৪ রিটার্ন করেছে।
3. **Regression** (৯/৯ assertion): normal ban→unban flow, non-existent
   user এ ban (৪০৪), normal role STUDENT↔ADMIN flow, non-existent
   user এ role-change (৪০৪) — সব established functionality অক্ষত।

### Checkpoint Pattern
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next; pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো নতুন
   error/warning নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression টেস্ট।
5. **Test cleanup সম্পূর্ণ**: প্রতিটা concurrency test iteration এ
   টেস্ট ইউজার একটা না একটা থ্রেড (ban বা role-change ব্যর্থ হলেও
   delete থ্রেড) দিয়ে ইতিমধ্যে ডিলিট হয়ে গেছে — DB তে psycopg2 দিয়ে
   সরাসরি চেক করে (`email LIKE 'banracetest%' OR 'rolerace%' OR
   'regtest_%'`) কোনো leftover নেই ভেরিফাই করা হয়েছে।

### নতুন test script
`scripts/test-admin-ban-role-delete-race-condition.py` — ৮+৮ = ১৬টা
concurrency iteration (ban race + role-change race), পুনরায়
ব্যবহারযোগ্য regression script, expected output "TOTAL CRASHES: 0"।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, **Admin User Ban/Role-Change
(নতুন)**।

established বাগ ক্লাস এখনো দুইটাই প্রযোজ্য: (১) "lazy create/vote/toggle
on unique field" (`upsert()` দিয়ে ফিক্স), (২) "read-then-write
status/capacity/existence check" (atomic `updateMany()` claim বা
`SELECT ... FOR UPDATE` row-lock দিয়ে ফিক্স) — Admin Ban/Role-Change
বাগ দ্বিতীয় ক্লাসেরই আরেকটা instance, প্রমাণ করে এই প্যাটার্নটা
কোডবেসে বারবার সতর্কতার সাথে চেক করা প্রয়োজন যখনই কোনো নতুন
existence-check-then-mutate endpoint লেখা হয়।

---

## 🐛 গুরুতর বাগ ফিক্স — Admin Notification Broadcast Race Condition (FK Constraint Crash) ✅ সম্পন্ন

### প্রেক্ষাপট
Admin User Ban/Role-Change race condition ফিক্স করার পরে ব্যবহারকারী
"Next" নির্দেশ দেওয়ায় আরও Bug Hunt চালিয়ে যাওয়া হয়েছে। এবার লক্ষ্য
করা হয়েছিল admin bulk-action endpoint গুলো (একসাথে অনেক ইউজারকে
প্রভাবিত করে এমন operation) — কারণ এই ধরনের endpoint এ read-then-write
race window স্বাভাবিকভাবেই বড় হয় (findMany() এ যত বেশি row তত বেশি
সময়, তারপর দ্বিতীয় ধাপে পৌঁছাতে দেরি)।

### কোড রিভিউ পদ্ধতি
`grep -rln "createMany"` দিয়ে খোঁজ করে দুইটা endpoint পাওয়া গেছে যেখানে
Prisma `createMany()` ব্যবহার হয়: `app/api/admin/notifications/broadcast/route.ts`
ও `app/api/admin/questions/bulk/route.ts`। Broadcast endpoint রিভিউ
করে দেখা গেছে:
```
const users = await prisma.user.findMany({ select: { id: true } });
await prisma.notification.createMany({
  data: users.map((u) => ({ userId: u.id, title, body, link })),
});
```
এটা দুই ধাপের read-then-write প্যাটার্ন — `findMany()` (read) ও
`createMany()` (write) এর মাঝে একটা নেটওয়ার্ক round-trip window আছে।
`Notification.userId` ফিল্ড `User` এর সাথে `onDelete: Cascade` FK
সম্পর্কযুক্ত — তাই যদি এই window এ কোনো ইউজার ডিলিট হয়ে যায়, insert
এর সময় সেই ইউজারের জন্য FK constraint violate হওয়ার আশঙ্কা তৈরি হয়।

### Isolated Prisma টেস্ট — all-or-nothing behavior কনফার্ম
কোড পরিবর্তনের আগে সরাসরি Prisma দিয়ে isolated টেস্ট করা হয়েছে (একটা
valid userId + একটা fake/non-existent userId দিয়ে `createMany()`
কল করে):
```
ERROR THROWN: P2003
Invalid `prisma.notification.createMany()` invocation
valid-row inserted count (should be 0 if all-or-nothing, 1 if partial): 0
```
এতে নিশ্চিত হয়েছে Prisma `createMany()` সত্যিই একটামাত্র multi-row
`INSERT` SQL statement — একটা row এর FK violation হলে **পুরো ব্যাচ
rollback হয়**, valid row-ও insert হয় না।

### লাইভ প্রুফ — Broadcast vs Delete Race
প্রথম কয়েকবার সরাসরি concurrent broadcast+delete টেস্টে (৮, ১৫, ২৫
iteration) crash reproduce হয়নি কারণ ছোট user base এ `createMany()`
এত দ্রুত শেষ হয়ে যাচ্ছিল যে race window ব্যবহারিকভাবে হিট করা কঠিন
ছিল। তাই ৪০টা "padding" test user তৈরি করে broadcast কে কৃত্রিমভাবে
১-২ সেকেন্ড পর্যন্ত ধীর করা হয়েছে (বড় ইউজার বেসে বাস্তব production
এ যেমন হবে সেই সিমুলেশন), তারপর নতুন target user তৈরি করে তাকে delete
করার সাথে broadcast কে সমান্তরালে (৩ms offset দিয়ে) চালানো হয়েছে —
২০ iteration এর ভেতরে একাধিকবার সরাসরি crash reproduce হয়েছে:
```
prisma:error
Invalid `prisma.notification.createMany()` invocation
Foreign key constraint violated on the constraint: `notifications_userId_fkey`
    at app/api/admin/notifications/broadcast/route.ts:36:29
POST /api/admin/notifications/broadcast 500 in 1959ms
```
এর মানে হলো, বাস্তব জীবনে যদি অ্যাডমিন সব ইউজারকে একটা গুরুত্বপূর্ণ
নোটিফিকেশন (যেমন পরীক্ষার রিমাইন্ডার) পাঠানোর ঠিক সেই মুহূর্তে কোনো
একজন ইউজার (নিজে অ্যাকাউন্ট ডিলিট করে অথবা অ্যাডমিন ব্যান/ডিলিট করে)
সরে যায়, তাহলে **বাকি হাজার হাজার eligible ইউজারও কোনো নোটিফিকেশন
পেত না** এবং অ্যাডমিন একটা কনফিউজিং ৫০০ error দেখতেন।

### ফিক্স — Atomic INSERT ... SELECT
read (userId লিস্ট আনা) ও write (notification insert করা) কে
একটামাত্র atomic SQL statement এ একত্রিত করা হয়েছে, `prisma.$executeRaw`
ব্যবহার করে:
```ts
const insertedCount = await prisma.$executeRaw`
  INSERT INTO notifications (id, "userId", title, body, link, read, "createdAt")
  SELECT gen_random_uuid()::text, id, ${trimmedTitle}, ${trimmedMessage}, ${trimmedLink}, false, now()
  FROM users
`;
```
এখানে মূল অন্তর্দৃষ্টি: `SELECT id FROM users` সাব-কুয়েরি ও `INSERT`
একই SQL statement এর ভেতরে, একই ডাটাবেস ট্রানজ্যাকশনে execute হয় —
তাই কোনো Node.js/network round-trip window থাকে না যেখানে একটা
concurrent delete "ফাঁক গলে" ঢুকতে পারে। insert execution এর ঠিক
সেই মুহূর্তে `users` টেবিলে যারা বাস্তবে অস্তিত্বশীল, ডাটাবেস ইঞ্জিন
নিজেই সরাসরি সেই স্ন্যাপশট থেকে সারি তৈরি করে — এটা "race window
সংকীর্ণ করা" না, বরং race window **সম্পূর্ণ শূন্যে নামিয়ে আনা**
(কারণ single-statement execution এর মধ্যে আরেকটা transaction এর
delete দৃশ্যমান হতে পারে না, PostgreSQL এর MVCC guarantee অনুযায়ী)।

`gen_random_uuid()` (Postgres 13+ builtin, `pgcrypto`/`uuid-ossp`
এক্সটেনশন ছাড়াই কাজ করে সাম্প্রতিক Postgres ভার্সনে, এই প্রজেক্টের
Postgres 17.6 এ কাজ করে ভেরিফাই করা হয়েছে) দিয়ে প্রতিটা নতুন
notification এর জন্য id জেনারেট করা হয়েছে, যেহেতু Prisma-generated
`cuid()` এখানে raw SQL এর ভেতর থেকে কল করা যায় না।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: ২০ iteration এর ভেতরে একাধিকবার ৫০০ crash (root cause
  log এ কনফার্ম, উপরে দেখানো হয়েছে)।
- Fix এর পরে: dev server rebuild করে (`rm -rf .next` + restart) একই
  ২০-iteration স্ক্রিপ্ট আবার চালানো হয়েছে — **০টা crash, ২০/২০
  broadcast সফলভাবে ২০০ রিটার্ন করেছে** (dev server log এ
  `POST /api/admin/notifications/broadcast 200` সব ২০টা লাইনে
  কনফার্ম করা হয়েছে, `grep`/`awk` দিয়ে স্ট্যাটাস কোড কাউন্ট)।

### Weekly Digest Send — একই ধরনের রিস্ক অডিট (কোনো ফিক্স লাগেনি)
`app/api/admin/digest/send/route.ts` এও একই ধরনের প্যাটার্ন আছে:
`getEligibleDigestUserIds()` দিয়ে userId লিস্ট আনা, তারপর for-loop এ
প্রতিটার জন্য আলাদাভাবে `getWeeklyDigestData()` + ইমেইল পাঠানো +
`prisma.user.update({ lastDigestSentAt })`। কিন্তু এখানে প্রতিটা
ইউজারের প্রসেসিং একটা `try { ... } catch (err) { failedCount++ }`
ব্লকের ভেতরে আবদ্ধ — তাই যদি কোনো ইউজার ঠিক `update()` এর আগে ডিলিট
হয়ে যায় এবং P2025 throw হয়, সেটা catch হয়ে যাবে এবং `failedCount`
বাড়বে, কিন্তু পুরো request crash হবে না। লাইভ টেস্টে (১০ iteration
concurrent digest-send+delete) **কোনো ৫০০ crash হয়নি**, response
সবসময় `{"success": true, "sentCount": N, "failedCount": M, ...}`
আকারে এসেছে। তাই এই endpoint এ কোনো কোড পরিবর্তনের দরকার হয়নি —
established defensive per-item try/catch প্যাটার্ন ইতিমধ্যেই যথেষ্ট
সুরক্ষা দিচ্ছে bulk sequential loop এ (`app/api/admin/reports/bulk/route.ts`
এর established pattern এর সাথে সামঞ্জস্যপূর্ণ)।

### Authorization/edge-case টেস্ট (৬/৬ assertion পাস)
1. Non-admin (STUDENT role) ইউজার broadcast করতে চেষ্টা করলে ব্লক
   হয় (৪০১/৪০৩)।
2. Unauthenticated (কোনো session cookie ছাড়া) রিকোয়েস্ট ব্লক হয়
   (৪০১/৪০৩)।
3. খালি/শুধু-হোয়াইটস্পেস title দিলে ৪০০।
4. খালি/শুধু-হোয়াইটস্পেস body দিলে ৪০০।
5. সঠিক input দিয়ে broadcast করলে ২০০ রিটার্ন হয়।
6. রেসপন্সের `sentCount` তখনকার বাস্তব ইউজার সংখ্যার সাথে মিলে যায়
   (raw SQL `executeRaw` এর রিটার্ন ভ্যালু, matched/affected row
   count, সঠিক)।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — কোনো error/warning নেই।
2. `rm -rf .next && pnpm build` — সফল, সব পেজ কম্পাইল, কোনো error
   নেই।
3. `echo "" | pnpm lint` — ক্লিন (স্ক্র্যাচ টেস্ট ফাইল
   `scripts/tmp-test/` ডিলিট করার পরে, যেগুলোতে সাময়িকভাবে
   `no-explicit-any`/`no-unused-vars` warning ছিল কিন্তু সেগুলো
   মূল কোডবেসের অংশ ছিল না)।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + authorization/
   edge-case টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব padding+race-target টেস্ট ইউজার আসল
   `DELETE /api/admin/users/[userId]` endpoint দিয়ে ডিলিট করা হয়েছে
   (কোনো raw SQL bypass না — `scripts/cleanup-test-users.py` দিয়ে
   psycopg2 শুধু leftover টেস্ট ইউজার *খুঁজে বের করতে* ব্যবহার করা
   হয়েছে, actual delete সবসময় real API কল দিয়ে)। এছাড়া
   concurrent-delete race এর কারণে যেসব notification row তৈরি
   হয়েছিল কিন্তু তাদের parent user cascade-delete না হওয়া পর্যন্ত
   টিকে ছিল (কারণ সেই user গুলো race এর সময় বেঁচে ছিল), সেগুলো
   psycopg2 দিয়ে সরাসরি DB চেক করে টাইটেল প্যাটার্ন (`Race%`,
   `atomic-test%`, `edge-test-title`) ম্যাচ করে পরিষ্কার করা হয়েছে।
   শেষে `SELECT count(*) FROM notifications` = 0 ও
   `SELECT count(*) FROM users` = আগের অবস্থায় ফিরে আসা কনফার্ম
   করা হয়েছে।

### নতুন test script
`scripts/test-broadcast-digest-delete-race.py`,
`scripts/test-broadcast-digest-delete-race2.py`,
`scripts/test-broadcast-delete-race3.py` (পরেরটাই ফাইনাল/কার্যকর
ভার্সন — padding user সহ, যেটা দিয়ে fix এর আগে ও পরে দুইবার একই
টেস্ট রি-রান করে তুলনা করা হয়েছে), `scripts/test-digest-delete-race.py`,
`scripts/test-broadcast-authz-edge.py`, `scripts/cleanup-test-users.py`।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/Role-Change,
**Admin Notification Broadcast (নতুন, FK constraint crash variant)**।

established বাগ ক্লাস দুইটার পাশাপাশি এখন একটা তৃতীয় সাব-প্যাটার্ন
নথিভুক্ত হলো: (১) "lazy create/vote/toggle on unique field"
(`upsert()` দিয়ে ফিক্স), (২) "read-then-write status/capacity/
existence check" (atomic `updateMany()` claim বা `SELECT ... FOR
UPDATE` row-lock দিয়ে ফিক্স), (৩) **"bulk read-then-bulk-write with
FK dependency"** — যখন কোনো endpoint প্রথমে একটা related টেবিল থেকে
ID লিস্ট আনে এবং পরে সেই লিস্ট দিয়ে অন্য টেবিলে bulk insert/update
করে, আর দুটোর মাঝে ID-referenced রেকর্ড ডিলিট হয়ে যাওয়ার সুযোগ থাকে
— এক্ষেত্রে fix `updateMany()` দিয়ে হয় না (এটা insert operation,
update না), বরং read+write কে একটা atomic raw SQL statement এ
একত্রিত করে (`INSERT ... SELECT`) সমাধান করা হয়। ভবিষ্যতে অনুরূপ
"bulk broadcast/notify/export" ধরনের নতুন admin ফিচার লেখার সময় এই
প্যাটার্ন মাথায় রাখা উচিত।

---

## 🐛 গুরুতর বাগ ফিক্স — Admin CSV Bulk Question Upload Race Condition (FK Constraint Crash) ✅ সম্পন্ন

### প্রেক্ষাপট
Admin Notification Broadcast এর race condition ফিক্স করার পরে
ব্যবহারকারী "Next" নির্দেশ দেওয়ায় একই bug class (bulk read-then-bulk-
write with FK dependency) এর অন্য কোনো instance আছে কিনা খোঁজা
হয়েছে। `grep -rln "createMany"` দিয়ে পুরো `app/api/` স্ক্যান করে
মাত্র দুইটা endpoint পাওয়া গেছে যেখানে Prisma `createMany()` ব্যবহার
হয় — একটা (Notification Broadcast) আগেই ফিক্স হয়ে গেছে, অন্যটা
`POST /api/admin/questions/bulk` (CSV থেকে বাল্ক প্রশ্ন আপলোড) —
এটা এই রাউন্ডে রিভিউ করা হয়েছে।

### কোড রিভিউ পদ্ধতি
রিভিউ করে দেখা গেছে হুবহু একই read-then-write প্যাটার্ন:
```
const topic = await prisma.topic.findUnique({ where: { id: topicId } });
if (!topic) return 404;
const rows = parseCSV(csvText);
const created = await prisma.question.createMany({
  data: rows.map((r) => ({ topicId, ... })),
});
```
`Question.topicId` ফিল্ড `Topic` এর সাথে `onDelete: Cascade` FK
সম্পর্কযুক্ত (schema.prisma লাইন ~608-611)। তাই `findUnique()` ও
`createMany()` এর মাঝের window এ (CSV parsing এর সময় লাগে, বড় CSV তে
বেশি) যদি কোনো concurrent `DELETE /api/admin/topics/[topicId]` এসে
সেই টপিক ডিলিট করে দেয়, `createMany()` FK violation করবে বলে
সন্দেহ হয়েছে।

### লাইভ প্রুফ
নতুন টেস্ট টপিক তৈরি করে, ৪০-রো CSV বাল্ক আপলোড (`createMany()` কে
সামান্য ধীর করার জন্য) সমান্তরালে সেই একই টপিক ডিলিট করার সাথে ১৫
iteration চালানো হয়েছে। **৫টা crash সরাসরি reproduce হয়েছে**
(৩৩% crash rate):
```
prisma:error
Invalid `prisma.question.createMany()` invocation
Foreign key constraint violated on the constraint: `questions_topicId_fkey`
    at app/api/admin/questions/bulk/route.ts:115:41
{ code: 'P2003', meta: { modelName: 'Question', constraint: 'questions_topicId_fkey' } }
POST /api/admin/questions/bulk 500 in ...ms
```
এর ফলাফল বাস্তবে: অ্যাডমিন কোনো টপিকে CSV দিয়ে ১০০+ প্রশ্ন বাল্ক
আপলোড করার ঠিক সেই মুহূর্তে যদি অন্য কোনো ট্যাব/সেশন থেকে (নিজে বা
অন্য admin) সেই টপিকটা ডিলিট করে ফেলা হয়, তাহলে **পুরো CSV আপলোড
ব্যর্থ হতো এবং একটাও প্রশ্ন সেভ হতো না** — যদিও টপিক নিজেই তখন আর
নেই বলে এটা যৌক্তিকভাবে প্রত্যাশিতই হওয়া উচিত ছিল ৪০৪ আকারে, কিন্তু
৫০০ crash আকারে হওয়াটা ভুল (poor error UX, এবং সিস্টেম log এ
প্রয়োজনহীন Prisma exception noise)।

### ফিক্সের ডিজাইন সিদ্ধান্ত — কেন `INSERT ... SELECT` না
Notification Broadcast এ ব্যবহৃত atomic `INSERT ... SELECT ... FROM
users` approach এখানে সরাসরি প্রযোজ্য না, কারণ:
- Notification Broadcast এ প্রতিটা নতুন row এর title/body/link
  **সব ইউজারের জন্য একই** (constant), তাই `SELECT id FROM users`
  সাব-কুয়েরির প্রতিটা ফলাফল সারিতে একই constant ভ্যালু বসিয়ে দেওয়া
  সহজ single SQL statement এ সম্ভব হয়েছিল।
- এখানে CSV এর **প্রতিটা row এর text/options/correctAnswer/
  explanation/difficulty/boardYear/boardName ভিন্ন ভিন্ন** — raw SQL
  এ dynamic multi-row `INSERT ... VALUES ($1,$2,...), ($3,$4,...),
  ...` বানাতে হতো প্রতিটা CSV row এর জন্য আলাদা placeholder সহ, যেটা
  (ক) জটিল স্ট্রিং-বিল্ডিং কোড দরকার করে, (খ) Prisma এর টাইপ-সেফ
  query builder ও automatic SQL injection protection থেকে বেরিয়ে
  raw string interpolation এর দিকে যেতে বাধ্য করে (উচ্চ ঝুঁকি যদি
  ভবিষ্যতে কেউ ভুল করে সরাসরি স্ট্রিং concatenation করে ফেলে)।

তাই ভিন্ন, নিরাপদ সমাধান বেছে নেওয়া হয়েছে: **row-level pessimistic
lock**। `prisma.$transaction()` এর ভেতরে প্রথমে
```ts
const lockedTopic = await tx.$queryRaw<{ id: string }[]>`
  SELECT id FROM "topics" WHERE id = ${topicId} FOR UPDATE
`;
if (lockedTopic.length === 0) throw new Error("TOPIC_NOT_FOUND");
```
চালিয়ে topic row এ `FOR UPDATE` row-level lock নেওয়া হয়, তারপর একই
transaction এর ভেতরেই স্বাভাবিক Prisma-typed
`tx.question.createMany({ data: rows.map(...) })` কল করা হয় (পুরো
টাইপ-সেফটি বজায় থেকে, শুধু existence check টাই raw SQL এ)।

`FOR UPDATE` এর মূল বৈশিষ্ট্য (PostgreSQL row-level locking): যতক্ষণ
এই transaction চলবে (কমিট বা রোলব্যাক না হওয়া পর্যন্ত), অন্য কোনো
transaction এই একই row কে `UPDATE`/`DELETE` করতে চাইলে **block হয়ে
অপেক্ষা করবে** (deadlock না হলে)। এতে existence-check ও
write (createMany) একই atomic unit এ পরিণত হয় — হয় দুটোই সফল হবে
(টপিক তখনো আছে নিশ্চিত হয়ে প্রশ্ন তৈরি হবে), অথবা lock নেওয়ার সময়
দেখা যাবে টপিক ইতিমধ্যে ডিলিট হয়ে গেছে (০টা রো রিটার্ন) এবং
পরিষ্কারভাবে `TOPIC_NOT_FOUND` throw করে ৪০৪ রিটার্ন হবে — কোনো
অবস্থাতেই FK violation crash সম্ভব না।

### Isolated Prisma টেস্ট দিয়ে lock behavior প্রি-ভেরিফাই
কোডে বসানোর আগে একটা isolated স্ক্রিপ্ট দিয়ে টেস্ট করা হয়েছে:
transaction এর ভেতরে `FOR UPDATE` লক নিয়ে ইচ্ছাকৃতভাবে ১.৫ সেকেন্ড
`setTimeout` delay দিয়ে (CSV parsing এর সময়ের মতো সিমুলেট করতে),
সমান্তরালে (৩০০ms পরে) সেই একই topic এ concurrent
`prisma.topic.delete()` চালিয়ে দেখা গেছে:
```
attempting concurrent delete...
txn1: lock acquired, rows: 1
txn1: created 1
delete succeeded after 1991 ms   ← delete টা transaction commit না হওয়া পর্যন্ত blocked ছিল
```
এতে নিশ্চিত হয়েছে lock সত্যিই কাজ করছে বাস্তবে (শুধু তাত্ত্বিক ধারণা
না) — delete request এসেছিল ৩০০ms এ কিন্তু সফল হয়েছে ~২০০০ms এ,
মানে ~১৭০০ms block হয়ে ছিল ঠিক txn1 এর delay এর সমান।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: ১৫ iteration এ ৫টা crash (৩৩%)।
- Fix এর পরে (dev server rebuild করে): একই স্ক্রিপ্ট আবার চালিয়ে
  **০টা crash**, race জেতা ক্ষেত্রে (৪টা iteration এ) সঠিকভাবে
  `bulk=404` রিটার্ন হয়েছে (আগে যেখানে `bulk=500` crash হতো)। আরও
  নিশ্চিত হতে ২৫ iteration এ আবার চালিয়ে (৬টা race-win ৪০৪) আবারও
  **০টা crash** কনফার্ম করা হয়েছে।

### Regression/Authorization/Edge-case টেস্ট (৯/৯ assertion পাস)
1. Normal ৫-রো CSV bulk upload → ২০০, `count === 5` সঠিক।
2. Non-existent `topicId` → ৪০৪।
3. খালি `csvText` → ৪০০।
4. `topicId` মিসিং body তে → ৪০০।
5. শুধু header (কোনো ডেটা রো নেই) CSV → ৪০০ ("কোনো ভ্যালিড রো
   পাওয়া যায়নি")।
6. Non-admin (STUDENT) ইউজার bulk upload করতে চেষ্টা করলে ব্লক
   (৪০১/৪০৩)।
7. Unauthenticated রিকোয়েস্ট ব্লক (৪০১/৪০৩)।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (নতুন `$transaction`/`$queryRaw`
   টাইপিং সহ কোনো error নেই)।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো
   error নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression/
   authorization টেস্ট।
5. **Test cleanup সম্পূর্ণ**: প্রতিটা concurrency iteration এ টেস্ট
   টপিক একটা না একটা থ্রেড দিয়ে (delete race জিতুক বা bulk upload
   normal হয়ে যাক তারপরে delete) ইতিমধ্যে ডিলিট হয়ে গেছে (Topic
   `onDelete: Cascade` এর মাধ্যমে সেই টপিকের সব Question ও কেসকেড
   ডিলিট হয়ে গেছে)। regression টেস্টের test topic ও student user আসল
   `DELETE /api/admin/topics/[topicId]` ও `DELETE /api/admin/users/
   [userId]` endpoint দিয়ে ডিলিট করা হয়েছে (raw SQL bypass না)। DB তে
   psycopg2 দিয়ে সরাসরি চেক করে (`topics.name LIKE '%রেস টেস্ট%'`,
   `questions.text LIKE '%টেস্ট প্রশ্ন%'`, `users.email LIKE
   '%bulkauthz%'`) কোনো leftover নেই ভেরিফাই করা হয়েছে — সবগুলো ০।

### নতুন test script
`scripts/test-bulk-questions-topic-delete-race.py` (১৫→২৫ iteration
এ আপডেট করে দুইবার চালানো হয়েছে, পুনরায় ব্যবহারযোগ্য),
`scripts/test-bulk-questions-authz-regression.py` (৯টা assertion,
পুনরায় ব্যবহারযোগ্য)।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/
Role-Change, Admin Notification Broadcast, **Admin CSV Bulk Question
Upload (নতুন, একই "bulk read-then-bulk-write with FK dependency"
সাব-ক্লাসের দ্বিতীয় instance, কিন্তু এবার সমাধান আলাদা: single
atomic INSERT না করে `FOR UPDATE` row-lock + transaction ব্যবহার
করা হয়েছে কারণ heterogeneous row data)**।

এখন established সাব-প্যাটার্ন (৩) এর জন্য দুইটা সমাধান টেমপ্লেট
নথিভুক্ত হয়ে গেল:
- **সমাধান ৩ক** (homogeneous/constant row data — সব নতুন row এর
  ভ্যালু একই বা একটা simple SELECT থেকে derive করা যায়): atomic
  `INSERT ... SELECT` raw SQL statement, network round-trip window
  সম্পূর্ণ শূন্য করে দেয়। উদাহরণ: Notification Broadcast।
- **সমাধান ৩খ** (heterogeneous row data — প্রতিটা row এর ভ্যালু
  ভিন্ন, client থেকে আসা ডেটার উপর নির্ভরশীল): `$transaction()` +
  `SELECT ... FOR UPDATE` row-lock করে existence guarantee নিয়ে
  তারপর স্বাভাবিক Prisma-typed `createMany()`, টাইপ-সেফটি বজায়
  রেখে। উদাহরণ: Admin CSV Bulk Question Upload।

ভবিষ্যতে নতুন কোনো "reference ID নিয়ে bulk create" ফিচার লেখার সময়
row data homogeneous না heterogeneous তার উপর ভিত্তি করে এই দুইটার
মধ্যে সঠিকটা বেছে নেওয়া উচিত।

---

## 🐛 গুরুতর বাগ ফিক্স — Study Plan Background Chunk Generation Race Condition (Double-Fault Crash) ✅ সম্পন্ন

### প্রেক্ষাপট
CSV Bulk Question Upload race condition ফিক্স করার পরে ব্যবহারকারী
"Next" নির্দেশ দেওয়ায় একই bug class (bulk read-then-bulk-write with
FK dependency) এর অন্য কোনো instance আছে কিনা আবার খোঁজা হয়েছে।
`grep -rln "createMany"` দিয়ে পুরো `app/`+`lib/` স্ক্যান করে এবার দুইটা
নতুন candidate পাওয়া গেছে যেগুলো আগে চেক করা হয়নি:
- `lib/custom-question-gen.ts` (ছবি→OCR→AI→MCQ/CQ জেনারেশন,
  `processImageToQuestions()`)
- `lib/study-plan-generator.ts` (Study Plan chunk generation,
  `generateRemainingChunks()`)

উভয়ই fire-and-forget ব্যাকগ্রাউন্ড ফাংশন প্যাটার্নে চলে (HTTP response
পাঠানোর পরেও ব্যাকগ্রাউন্ডে কাজ চালিয়ে যায়)। Custom Question Gen
রিভিউ করে দেখা গেছে সেটা তুলনামূলক নিরাপদ — একটা `CustomQuestionSet`
একবারই process হয় (single-shot, chunk-loop না), এবং delete endpoint
এ কোনো active-generation protection না থাকলেও practical race window
তুলনামূলক ছোট (single AI call, loop না)। তাই এই রাউন্ডে মূল ফোকাস
`study-plan-generator.ts` এ।

### কোড রিভিউ পদ্ধতি
`generateRemainingChunks()` ফাংশন রিভিউ করে দেখা গেছে:
```
while (daysGenerated < plan.durationDays) {
  const { items } = await generateChunkItems(...);  // AI কল, ধীর
  await prisma.studyPlanItem.createMany({ data: items.map(...) });
  await prisma.studyPlan.update({ where: { id: plan.id }, data: {...} });
}
```
আর caller endpoint (`POST /api/study-plan/generate` →
`generateStudyPlan()`) এ:
```
await prisma.studyPlan.deleteMany({ where: { userId } });  // পুরনো প্ল্যান মুছে ফেলা
const studyPlan = await prisma.studyPlan.create({ ... });  // নতুন প্ল্যান
```
এখানে সমস্যা: `generateRemainingChunks()` একটা নির্দিষ্ট `studyPlanId`
নিয়ে দীর্ঘ সময় ধরে (প্রতিটা chunk এ AI কল ১০-২৫ সেকেন্ড) কাজ করতে
থাকে, কিন্তু এই পুরো সময়ে সেই `studyPlanId` এখনো ডাটাবেসে আছে কিনা
তা আর যাচাই করা হয় না — প্রথমবার `findUnique()` করেই লুপে ঢুকে যায়।

### লাইভ প্রুফ (double-fault chain)
নতুন ইউজার তৈরি করে প্রথমে ৯০ দিনের প্ল্যান জেনারেট করা হয়েছে
(needsMoreChunks=true, ব্যাকগ্রাউন্ড generation শুরু হয়ে যায়), তারপর
মাত্র ০.৫ সেকেন্ড পরে সেই একই ইউজার দিয়ে আবার ৭ দিনের প্ল্যান জেনারেট
করা হয়েছে (এটা প্রথম প্ল্যানকে `deleteMany()` দিয়ে মুছে দেয়)। Dev
server log এ সরাসরি double-fault chain দেখা গেছে:
```
prisma:error
Invalid `prisma.studyPlanItem.createMany()` invocation
Foreign key constraint violated on the constraint: `study_plan_items_studyPlanId_fkey`
    at lib/study-plan-generator.ts:431:34
    at async generateRemainingChunks (lib/study-plan-generator.ts:431:7)

Study Plan ব্যাকগ্রাউন্ড chunk generation ব্যর্থ: Error [PrismaClientKnownRequestError]:
Invalid `prisma.studyPlan.update()` invocation
An operation failed because it depends on one or more records that
were required but not found. No record was found for an update.
    at lib/study-plan-generator.ts:462:28
    at async generateRemainingChunks (lib/study-plan-generator.ts:462:5)
```
অর্থাৎ: প্রথম exception (P2003, FK violation) catch ব্লকে ধরা পড়েছে,
কিন্তু catch ব্লক নিজেই সেই একই (এখন অস্তিত্বহীন) `studyPlanId` দিয়ে
`update()` কল করে দ্বিতীয় exception (P2025) তৈরি করেছে — যেটা এবার
আর কোনো catch এ ধরা পড়েনি (uncaught rejection, শুধু
`.catch((err) => console.error(...))` দিয়ে top-level এ লগ হয়েছে, HTTP
response ততক্ষণে অনেক আগেই পাঠানো হয়ে গেছে বলে ইউজার সরাসরি এফেক্ট
টের পায়নি, কিন্তু সার্ভার সাইডে দুইটা আলাদা unhandled Prisma exception
তৈরি হয়েছে যা log noise ও potential resource leak এর কারণ)।

### ফিক্সের ডিজাইন সিদ্ধান্ত — কেন পুরো chunk না, শুধু write অংশ lock করা হলো
CSV Bulk Question Upload এ ব্যবহৃত `$transaction` + `SELECT ... FOR
UPDATE` row-lock টেমপ্লেট (established সমাধান ৩খ) এখানেও প্রযোজ্য
(heterogeneous row data — প্রতিটা chunk এ AI-generated ভিন্ন ভিন্ন
`taskDescription`/`subjectCode`/`durationMinutes`/`priority`)। কিন্তু
একটা গুরুত্বপূর্ণ নতুন বিবেচনা এখানে যোগ হয়েছে: **AI কল কতক্ষণ লাগে**।

যদি পুরো chunk অপারেশন (AI call + write) একটা `$transaction` এর
ভেতরে করা হতো এবং `FOR UPDATE` লক AI call এর *আগে* নেওয়া হতো, তাহলে
StudyPlan row-টা AI response আসা পর্যন্ত (১০-২৫ সেকেন্ড) লক হয়ে
থাকতো। এই দীর্ঘ সময় ধরে row lock রাখা কয়েকটা সমস্যা তৈরি করতে পারতো:
Prisma transaction এর নিজস্ব timeout limit (ডিফল্ট ৫ সেকেন্ড
`maxWait`+`timeout`, override করা লাগতো), এবং ভবিষ্যতে যদি অন্য কোনো
ফিচার একই StudyPlan row touch করে (যেমন ইউজার নিজের প্ল্যান
edit/view করতে চাওয়া) সেটা অহেতুক ব্লক হয়ে যেতো।

তাই সমাধান: **শুধু write মুহূর্তে** (AI response আসার পরে) ছোট,
দ্রুত transaction এ লক নেওয়া হয়েছে:
```ts
const stillExists = await prisma.$transaction(async (tx) => {
  const lockedPlan = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM "study_plans" WHERE id = ${plan.id} FOR UPDATE
  `;
  if (lockedPlan.length === 0) return false;

  await tx.studyPlanItem.createMany({ data: items.map(...) });
  await tx.studyPlan.update({ where: { id: plan.id }, data: { daysGenerated, aiProvider: provider } });
  return true;
});

if (!stillExists) {
  console.log(`Study Plan ব্যাকগ্রাউন্ড generation থামানো হলো ...`);
  return; // silently stop, কোনো crash/FAILED status লেখা ছাড়াই
}
```
এই approach টা established সমাধান ৩খ টেমপ্লেটের একটা variant হিসেবে
নথিভুক্ত করা হলো: **"heterogeneous row data + ধীর external কল (AI/
network) থাকলে লক শুধু দ্রুত write অংশে নেওয়া উচিত, পুরো ধীর
অপারেশন জুড়ে না"** — নাহলে লক নিজেই একটা নতুন bottleneck/এমনকি
deadlock-jonito সমস্যা তৈরি করতে পারে।

### Silent-stop ও catch ব্লক ডিফেন্স
দুইটা অতিরিক্ত নিরাপত্তা স্তর যোগ করা হয়েছে:
1. লক নেওয়ার সময় প্ল্যান না পাওয়া গেলে (মানে ইতিমধ্যে ডিলিট হয়ে
   গেছে) লুপ **নীরবে থেমে যায়** — কোনো `FAILED` status লেখার চেষ্টাও
   করে না, কারণ এটা genuine error না (ইউজার ইচ্ছাকৃতভাবে নতুন প্ল্যান
   চেয়েছে, পুরনোটা আর প্রাসঙ্গিক না, "FAILED" লেবেল ভুল সিগনাল দিতো)।
2. Catch ব্লকেও `prisma.studyPlan.update()` এর বদলে
   `prisma.studyPlan.updateMany()` ব্যবহার করা হয়েছে — matched
   count 0 হলে (প্ল্যান ইতিমধ্যে না থাকলে) নীরবে skip হয়ে যায়, কখনো
   throw করে না। এটাই আসল double-fault বন্ধ করার মূল চাবিকাঠি —
   error-handler নিজে কখনো নতুন crash তৈরি করতে পারবে না।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: প্রথম টেস্ট রানেই সম্পূর্ণ double-fault chain (P2003 →
  catch → P2025) reproduce হয়েছে।
- Fix এর পরে (dev server rebuild করে): একই টেস্ট স্ক্রিপ্ট **২ বার**
  আলাদাভাবে চালানো হয়েছে, দুইবারই dev log এ কোনো error/exception
  stack trace দেখা যায়নি — শুধু পরিষ্কার তথ্যমূলক লগ:
  `Study Plan ব্যাকগ্রাউন্ড generation থামানো হলো (id=...) — প্ল্যানটা
  ইতিমধ্যে ডিলিট/replace হয়ে গেছে`। উভয়বারই দ্বিতীয় (নতুন, ৭ দিনের)
  প্ল্যান স্বাভাবিকভাবে `generationStatus: "READY"` এ পৌঁছেছে।

### Regression টেস্ট (১৩/১৩ assertion পাস)
1. ছোট প্ল্যান (৭ দিন, chunking লাগে না) → সরাসরি `READY`, items
   আছে।
2. `GET /api/study-plan` সঠিক প্ল্যান রিটার্ন করে (durationDays মিলে
   যায়)।
3. Invalid `durationDays` (রেঞ্জের বাইরে, ৯৯৯৯) → ৪০০।
4. Unauthenticated রিকোয়েস্ট ব্লক (৪০১)।
5. বড় প্ল্যান (৪৫ দিন, ৩টা chunk লাগে, `CHUNK_SIZE_DAYS=15`) →
   প্রথমে `GENERATING`/`READY`, তারপর (পর্যাপ্ত অপেক্ষার পরে, AI
   কল সময় নেয়) শেষ পর্যন্ত `READY` এ পৌঁছায় এবং যথাযথ সংখ্যক আইটেম
   তৈরি হয় — নিশ্চিত করা হয়েছে ফিক্সের ফলে normal multi-chunk
   generation flow এর কোনো ক্ষতি হয়নি (প্রথম রানে ৩০ সেকেন্ড টাইমআউটে
   সময় শেষ হয়ে গিয়েছিল বলে একটা false-negative এসেছিল, timeout
   ৬০ সেকেন্ডে বাড়িয়ে আবার চালিয়ে সত্যিকারের সফলতা নিশ্চিত করা
   হয়েছে)।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল, কোনো
   error নেই।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে (পাসওয়ার্ড + "ডিলিট করো"
   কনফার্মেশন টেক্সট সহ) ডিলিট করা হয়েছে (raw SQL bypass না) — cascade
   এ তাদের `StudyPlan`/`StudyPlanItem` ও মুছে গেছে। একটা টেস্ট ইউজার
   প্রথম রানে ভুল endpoint (`DELETE` মেথড, আসলে `POST` হওয়া উচিত ছিল)
   দিয়ে cleanup চেষ্টা করায় leftover থেকে গিয়েছিল (৪০৫ Method Not
   Allowed) — এটা ধরা পড়েছে DB verification এ, সঠিক `POST` মেথড দিয়ে
   পুনরায় ডিলিট করে সমাধান করা হয়েছে। শেষে psycopg2 দিয়ে সরাসরি চেক
   করে (`users.email LIKE '%studyplanrace%' OR '%studyplanregr%'`,
   `study_plans` টেবিলের count) কোনো leftover নেই ও `study_plans`
   টেবিল সম্পূর্ণ খালি (কোনো আসল ইউজার এই ফিচার ব্যবহার করেনি বলে)
   ভেরিফাই করা হয়েছে।

### নতুন test script
`scripts/test-studyplan-regenerate-race.py` (concurrency race, ২ বার
চালানো হয়েছে), `scripts/test-studyplan-regression.py` (১৩টা
assertion, পুনরায় ব্যবহারযোগ্য)।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/
Role-Change, Admin Notification Broadcast, Admin CSV Bulk Question
Upload, **Study Plan Background Chunk Generation (নতুন, একই "bulk
read-then-bulk-write with FK dependency" সাব-ক্লাসের তৃতীয় instance,
কিন্তু এবার double-fault variant — catch ব্লক নিজেই crash করছিল, ও
সমাধানে একটা নতুন সূক্ষ্মতা যোগ হয়েছে: ধীর external কল (AI) কে
transaction lock এর বাইরে রাখা)**।

established সমাধান ৩খ টেমপ্লেট (`$transaction` + `FOR UPDATE`
row-lock) এখন আরও পরিমার্জিত হলো — **ভবিষ্যতে নতুন কোনো "reference
ID নিয়ে ব্যাকগ্রাউন্ড লুপে ধীর external API কল + DB write" ফিচার
লেখার সময় মনে রাখতে হবে**:
1. Row lock নেওয়ার আগে ধীর external কল (AI/network/file I/O) শেষ
   করে ফেলা উচিত — লক শুধু দ্রুত DB write অংশে নেওয়া, পুরো ধীর
   অপারেশন জুড়ে না (নাহলে লক নিজেই bottleneck হয়ে যায়)।
2. Lock নেওয়ার সময় reference record না পাওয়া গেলে (delete হয়ে
   গেছে) সেটা "silently stop" করা উচিত genuine error না দেখিয়ে, যদি
   এটা "ইউজার ইচ্ছাকৃতভাবে সুপারসিড করেছে" টাইপ পরিস্থিতি হয়।
3. Error-handler (catch ব্লক) এর ভেতরের যেকোনো DB write ও অবশ্যই
   `updateMany()`/`deleteMany()` (non-throwing) ব্যবহার করা উচিত,
   কখনো `update()`/`delete()` (throwing) না — নাহলে error handling
   নিজেই একটা নতুন unhandled crash তৈরি করতে পারে (double-fault),
   যেটা প্রায়ই মূল বাগের চেয়েও বেশি বিপজ্জনক ও ডিবাগ করা কঠিন।

---

## 🔍 Bug Hunt Audit (Negative Result) — Custom Question Set Background Generation Race Condition ✅ যাচাই সম্পন্ন (কোনো কোড পরিবর্তন লাগেনি)

### প্রেক্ষাপট
Study Plan Background Chunk Generation race condition ফিক্স করার
পরে ব্যবহারকারী "Next" নির্দেশ দেওয়ায়, আগের সেশনের নোট অনুযায়ী
`lib/custom-question-gen.ts` এর `processImageToQuestions()` (ছবি→
OCR→AI→MCQ/CQ জেনারেশন, fire-and-forget ব্যাকগ্রাউন্ড ফাংশন) কে
"কম-ঝুঁকির candidate, সরাসরি লাইভ টেস্ট করা হয়নি" হিসেবে চিহ্নিত করা
হয়েছিল Study Plan bug এর সময়। এই রাউন্ডে সেটা সরাসরি লাইভ concurrency
টেস্ট দিয়ে যাচাই করা হয়েছে।

### কোড রিভিউ পদ্ধতি
`processImageToQuestions()` এ একই প্যাটার্ন আছে যেটা আগের ৩টা bug এ
পাওয়া গিয়েছিল: `customQuestion.createMany({ data: [...], setId })`
তারপর সফল হলে `customQuestionSet.update({ status: "READY" })`, ব্যর্থ
হলে catch ব্লকে `customQuestionSet.update({ status: "FAILED" })`।
`CustomQuestion.setId` ফিল্ড `CustomQuestionSet` এর সাথে `onDelete:
Cascade` FK সম্পর্কযুক্ত (schema.prisma লাইন ~1488-1491) — তাই যদি
ব্যাকগ্রাউন্ড AI processing চলাকালীন ইউজার সেই সেট delete করে দেয়,
তাত্ত্বিকভাবে একই bug class সম্ভব ছিল।

**গুরুত্বপূর্ণ পার্থক্য যা আগে থেকেই ছিল**: catch ব্লকের
`customQuestionSet.update()` কলের শেষে ইতিমধ্যে `.catch(() => {})`
যোগ করা ছিল (Study Plan/CSV Bulk Question Upload এ এটা ছিল না,
সেখানে raw `update()` ছিল catch ব্লকের ভেতরে, awaited কিন্তু নিজের
কোনো try/catch/`.catch()` ছাড়া) — এই একটা ছোট কিন্তু গুরুত্বপূর্ণ
কোডিং প্যাটার্ন পার্থক্যই এই ফাংশনটাকে আগে থেকে নিরাপদ রেখেছিল।

### লাইভ প্রুফ (৫ iteration concurrency টেস্ট)
নতুন ইউজার তৈরি করে ৫ বার পরপর: (১) নতুন Custom Question Set তৈরি
(বাস্তব টেস্ট ছবি আপলোড করে, Pillow দিয়ে জেনারেট করা ইংরেজি টেক্সট
সহ), (২) ০.৩ সেকেন্ড পরে সেই সেট delete করা (ব্যাকগ্রাউন্ড AI
processing তখনও চলছে এমন সময়ে), (৩) ৮ সেকেন্ড অপেক্ষা করে ব্যাকগ্রাউন্ড
processing সম্পূর্ণ হতে দেওয়া। ফলাফল:
- সব ৫টা `POST` (২০১) ও `DELETE` (২০০) রিকোয়েস্ট নিজে সফল হয়েছে
  (এগুলো সবসময়ই সফল হতো, কারণ এই দুটো endpoint নিজে race-safe —
  bug থাকলেও সেটা শুধু ব্যাকগ্রাউন্ড ফাংশনে প্রকাশ পেতো)।
- ব্যাকগ্রাউন্ড processing এ ৪ বার (৫টার মধ্যে) সত্যিই FK violation
  (P2003, `custom_questions_setId_fkey`) ঘটেছে — অর্থাৎ race window
  বাস্তবেই হিট হয়েছে, bug reproduce করার শর্ত পূরণ হয়েছে।
- catch ব্লকে সেই ৪ বারই `customQuestionSet.update()` (status:
  FAILED লেখার চেষ্টা) আবার ব্যর্থ হয়েছে (P2025, "No record was
  found for an update" — কারণ সেট নিজেই আর নেই) — এই পর্যন্ত Study
  Plan bug এর সাথে হুবহু মিলে যায়।
- **কিন্তু এখানে `.catch(() => {})` থাকায় এই দ্বিতীয় ব্যর্থতা কখনো
  uncaught/unhandled হয়নি** — Prisma নিজে internal `prisma:error`
  লগ প্রিন্ট করে (এটা Prisma এর নিজস্ব logging middleware, catch
  হোক বা না হোক সবসময় ঘটে, exception swallow হওয়ার সাথে সম্পর্কহীন),
  কিন্তু কোনো Node.js `unhandledRejection`/process crash হয়নি, পরের
  সব iteration স্বাভাবিকভাবে চলেছে, ও শেষে account cleanup ও সফল
  হয়েছে।

### সিদ্ধান্ত: কোনো কোড পরিবর্তন প্রয়োজন নেই
যাচাই নিশ্চিত করেছে এই endpoint টা ইতিমধ্যেই double-fault-নিরাপদ
(এই একই ফাইলের author আগে থেকেই defensive `.catch(() => {})` প্যাটার্ন
ব্যবহার করেছিলেন, যদিও প্রথম FK violation (P2003) নিজে এখনো ঘটে —
সেটা শুধু log noise তৈরি করে, কোনো crash/silent-hang তৈরি করে না,
ইউজার সেট delete করে ফেলেছে বলে সেই status update আর কোনো প্রাসঙ্গিক
কাজও করবে না)। তাই এই ক্ষেত্রে কোনো কোড পরিবর্তন করা হয়নি — এটা
বিদ্যমান safety net এর সফল ভেরিফিকেশন হিসেবে নথিভুক্ত করা হলো।

**নোট ভবিষ্যতের জন্য (ঐচ্ছিক পলিশ, বর্তমানে জরুরি না)**: যদিও
crash হয় না, প্রথম FK violation (P2003) এড়ানোও সম্ভব হতো Study
Plan এর মতো `$transaction` + `FOR UPDATE` pattern দিয়ে (log noise
কমানোর জন্য) — কিন্তু যেহেতু কোনো ব্যবহারকারী-প্রভাবিত সমস্যা নেই
(শুধু internal log), এটা বর্তমানে low-priority হিসেবে রাখা হলো,
ভবিষ্যতে "log noise cleanup" ধরনের polish round এ বিবেচনা করা
যেতে পারে।

### Checkpoint pattern (audit-only, কোনো কোড পরিবর্তন হয়নি বলে সংক্ষিপ্ত)
1. `pnpm exec tsc --noEmit` — ক্লিন (unchanged, expected)।
2. লাইভ concurrency টেস্ট (৫ iteration, উপরে বর্ণিত) সম্পন্ন।
3. **Test cleanup সম্পূর্ণ**: টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। DB তে psycopg2
   দিয়ে সরাসরি চেক করে (`users.email LIKE '%cqsraceest%'`,
   `custom_question_sets`/`custom_questions` টেবিলের count) কোনো
   leftover নেই ভেরিফাই করা হয়েছে (সব ০)।

### নতুন test script
`scripts/test-customquestionset-delete-race.py` (পুনরায় ব্যবহারযোগ্য,
বাস্তব Pillow-generated টেস্ট ইমেজ + বাস্তব AI Vision কল ব্যবহার করে)।

### সারসংক্ষেপ আপডেট
এই bug class (bulk read-then-bulk-write with FK dependency) এর জন্য
এখন কোডবেসে থাকা সব `createMany()` কল সাইট (`grep -rln "createMany"
app/ lib/`) সম্পূর্ণভাবে অডিট করা হয়ে গেছে:
- Admin Notification Broadcast — ✅ ফিক্স করা হয়েছে (সমাধান ৩ক,
  atomic INSERT...SELECT)
- Admin CSV Bulk Question Upload — ✅ ফিক্স করা হয়েছে (সমাধান ৩খ,
  transaction+FOR UPDATE)
- Study Plan Background Chunk Generation — ✅ ফিক্স করা হয়েছে
  (সমাধান ৩খ variant, lock শুধু write অংশে + non-throwing catch)
- Custom Question Set Background Generation — ✅ যাচাই করা হয়েছে,
  ইতিমধ্যে নিরাপদ পাওয়া গেছে (defensive `.catch(() => {})` আগে থেকেই
  ছিল), কোনো পরিবর্তন লাগেনি

এই bug class এর জন্য systematic audit এখন সম্পূর্ণ (৪/৪ candidate
সাইট চেক করা হয়েছে)।

---

## 🎨 UI Polish — shadcn Tooltip/Select Migration + গুরুতর প্রি-এক্সিস্টিং বাগ ফিক্স (Select Label Bug) ✅ সম্পন্ন

### প্রেক্ষাপট
ব্যবহারকারী জিজ্ঞেস করেছিলেন "shadcn আমাদের প্রজেক্টে কীভাবে সাহায্য করতে
পারে" (Banglish এ)। এর উত্তরে পুরো কোডবেস স্ক্যান করা হয়েছে —
`components.json` চেক করে দেখা গেছে shadcn/ui ইতিমধ্যে সেটআপ করা আছে
(style: `base-nova`, base-ui primitives ব্যবহার করে), কিন্তু মাত্র
১৯টা কম্পোনেন্ট যোগ করা হয়েছিল `components/ui/` এ। স্ক্যানে দুইটা
স্পষ্ট gap চিহ্নিত হয়েছে:
1. `grep -rl "<select"` দিয়ে ৩টা ফাইলে raw HTML `<select>` পাওয়া
   গেছে (browser-default স্টাইল, dark mode এর সাথে অসামঞ্জস্যপূর্ণ)।
2. `grep -rn 'title="'` দিয়ে ১৬টা জায়গায় নেটিভ `title=""` attribute
   পাওয়া গেছে icon button এ (unstyled browser tooltip, ~৬০০ms delay,
   কোনো animation/theming নেই)।

### ⚠️ ব্যবহারকারীর পাঠানো ঝুঁকিপূর্ণ কমান্ড সম্পর্কে সতর্কতা
ব্যবহারকারী নিজে থেকে একটা কমান্ড পাঠিয়েছিলেন:
```
pnpm dlx shadcn@latest init --preset b27GcrRo --template next
```
এটা চালানোর আগে `pnpm dlx shadcn@latest preset decode b27GcrRo` দিয়ে
যাচাই করা হয়েছে যে এই preset code আসলে কী করবে। ফলাফল দেখা গেছে এটা
একটা সম্পূর্ণ নতুন design system preset তৈরি করবে:
```
style        rhea
baseColor    neutral
theme        neutral
font         inter
```
আমাদের প্রজেক্টে ইচ্ছাকৃতভাবে **Hind Siliguri** ফন্ট ব্যবহার করা হয়
(বাংলা readability এর জন্য, `app/layout.tsx` এ Google Font হিসেবে
লোড করা) এবং `base-nova` style এর সাথে কাস্টম থিম মিলিয়ে সেট করা
আছে। `shadcn init --preset` চালালে এটা পুরো design system (font,
color theme, radius) ওভাররাইট করে দিতে পারতো — সম্ভবত Inter ফন্ট
বসিয়ে দিয়ে বাংলা টেক্সট রেন্ডারিং খারাপ করে দিতো এবং ইতিমধ্যে থাকা
১৯টা কম্পোনেন্টের স্টাইল ভেঙে দিতো। **এই কমান্ড চালানো হয়নি** —
ব্যবহারকারীকে root cause সহ ব্যাখ্যা করে সতর্ক করা হয়েছে (established
principle: রিস্কি, destructive-potential কমান্ড যাচাই না করে চালানো
যাবে না, এমনকি ব্যবহারকারী নিজে পাঠালেও)।

### Gap ১ — Raw HTML `<select>` replace
৩টা ফাইলে (`components/admin/subject-manager.tsx`,
`components/admin/question-manager.tsx`,
`components/forum/new-post-form.tsx`) raw `<select>`/`<option>`
elements পাওয়া গেছে — সব shadcn `Select`/`SelectTrigger`/
`SelectContent`/`SelectItem` দিয়ে replace করা হয়েছে (established
pattern অনুসরণ করে, `components/admin/user-manager.tsx` এ আগে থেকেই
ব্যবহৃত হচ্ছিল একই pattern)। base-ui `Select.Item` এ খালি স্ট্রিং
value দিলে সমস্যা হয় বলে "সাধারণ"/"বোর্ড বেছে নাও" এর মতো "কোনো
নির্দিষ্ট মান নেই" case গুলোর জন্য `"NONE"` sentinel value ব্যবহার
করা হয়েছে — কিন্তু ফর্ম state ও API submission এ আসল খালি স্ট্রিং
(`""`) বজায় রাখা হয়েছে (`onValueChange` এ `"NONE" → ""` রূপান্তর
করে), তাই backend এ কোনো পরিবর্তন লাগেনি।

### Gap ২ — নতুন Tooltip কম্পোনেন্ট যোগ
```
pnpm dlx shadcn@latest add tooltip
```
দিয়ে base-ui ভিত্তিক নতুন `components/ui/tooltip.tsx` যোগ করা
হয়েছে (`TooltipProvider`, `Tooltip`, `TooltipTrigger`,
`TooltipContent` export করে)। `app/providers.tsx` এ
`<TooltipProvider delay={300}>` দিয়ে wrap করা হয়েছে (ডিফল্ট delay
৬০০ms এর চেয়ে দ্রুত রেসপন্স, কিন্তু খুব দ্রুত hover এ flash এড়াতে
এখনো ০ না)। এরপর ১৬টা জায়গায় নেটিভ `title=""` সরিয়ে
```tsx
<Tooltip>
  <TooltipTrigger render={<Button ...>...</Button>} />
  <TooltipContent>...</TooltipContent>
</Tooltip>
```
প্যাটার্নে রূপান্তর করা হয়েছে: `forum-moderation-panel.tsx` (৩টা),
`reports-panel.tsx` (৪টা), `topic-manager.tsx`, `report-dialog.tsx`
(nested DialogTrigger+TooltipTrigger composition), `adaptive-
practice-runner.tsx` (Badge trigger), `public-profile-tab.tsx`,
`breathing-exercise.tsx`, `handwritten-answer-button.tsx`,
`offline-sync-indicator.tsx`, `study-group-dashboard.tsx`,
`app/ai-tutor/page.tsx` (২টা)। `report-dialog.tsx` এ বিশেষভাবে
মনোযোগ দিতে হয়েছে কারণ সেখানে একই বাটন `DialogTrigger` ও
`TooltipTrigger` দুটোরই trigger — base-ui এর `render` prop composition
ব্যবহার করে nested করা হয়েছে (`<TooltipTrigger render={<DialogTrigger
render={<button>...} />} />`), `tsc --noEmit` ক্লিন পাস করে এই
composition ঠিকভাবে টাইপ-চেক পাস করেছে তা কনফার্ম করা হয়েছে।

### 🐛 গুরুতর প্রি-এক্সিস্টিং বাগ আবিষ্কৃত — Select Label Bug
Select মাইগ্রেশন visual ভাবে Playwright দিয়ে verify করার সময় (headless
Chromium, `--disable-gpu --single-process --no-zygote` flag সহ) Admin
User Manager পেজের স্ক্রিনশট নিয়ে দেখা গেছে "সর্ট" dropdown এ trigger
এ raw value `createdAt:desc` দেখাচ্ছে, বাংলা লেবেল "নতুন যোগ হওয়া
আগে" না — যদিও `SelectItem` এ সঠিক label দেওয়া ছিল।

ওয়েব সার্চ করে base-ui অফিসিয়াল ডকুমেন্টেশনে নিশ্চিত হওয়া গেছে এটা
কোনো নতুন bug না, বরং base-ui `Select` কম্পোনেন্টের নিজস্ব ডিফল্ট
আচরণ:
> "By default, the `<Select.Value>` component renders the raw
> value. Passing the `items` prop to `<Select.Root>` instead
> renders the matching label for the rendered value."

অর্থাৎ **এই বাগ শুধু নতুন যোগ করা Select এ না, আগে থেকে বিদ্যমান সব
Select ব্যবহারকারী ফিচারেও ছিল** — ব্যবহারকারী কখনো লক্ষ্য না করলেও
(হয়তো অনেক dropdown এ value=label একই ছিল বলে পার্থক্য বোঝা যায়নি,
কিন্তু যেখানে আলাদা সেখানে গুরুত্বপূর্ণ UX সমস্যা)। পুরো কোডবেস
`grep -rln "SelectValue"` দিয়ে স্ক্যান করে মোট **৯টা ফাইলে ১০টা
Select instance** পাওয়া গেছে, তার মধ্যে **৮টা ফাইলে ৯টা instance
প্রভাবিত** (value≠label):
- `components/admin/user-manager.tsx` — Role, Status, Sort (৩টা)
- `components/admin/question-manager.tsx` — Difficulty, Board Name
- `components/forum/new-post-form.tsx` — Category, Subject
- `components/live-exam/live-exam-start-form.tsx` — Subject (id→name)
- `components/quiz-battle/quiz-battle-create-form.tsx` — Subject (id→name)
- `components/planner/class-routine.tsx` — Day of Week, Subject
- `components/live-exam/custom-question-set-dashboard.tsx` — Question Type
- `components/admin/audit-log-viewer.tsx` — Action filter

`components/admin/subject-manager.tsx` এর Subject Code/Paper
dropdown ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে কারণ সেখানে value ও label একই
("PHYSICS"), তাই raw value দেখানোই আসলে সঠিক আচরণ।

### ফিক্স
সব প্রভাবিত `Select` এ base-ui এর অফিসিয়াল সমাধান — `items={[{
value, label }, ...]}` prop যোগ করা হয়েছে, যা `<Select.Value>` কে
raw value এর বদলে matching label রেন্ডার করতে নির্দেশ দেয়:
```tsx
<Select
  value={`${sortBy}:${sortOrder}`}
  onValueChange={...}
  items={[
    { value: "createdAt:desc", label: "নতুন যোগ হওয়া আগে" },
    { value: "createdAt:asc", label: "পুরনো যোগ হওয়া আগে" },
    // ...
  ]}
>
```
প্রতিটা caller সাইটে এই prop যোগ করা হয়েছে — কোর
`components/ui/select.tsx` wrapper অপরিবর্তিত রাখা হয়েছে, কারণ
`items` prop টা caller-level customization (প্রতিটা ব্যবহারের
জায়গার নিজস্ব value/label ম্যাপিং থাকে), wrapper-level এ generalize
করা সম্ভব বা প্রয়োজনীয় না।

### Playwright দিয়ে ভিজুয়াল ভেরিফিকেশন (fix এর আগে-পরে দুটোই)
headless Chromium দিয়ে লাইভ লগইন করে স্ক্রিনশট নেওয়া হয়েছে:
- **Fix এর আগে**: User Manager পেজে "সব Role"/"সব স্ট্যাটাস" ঠিক
  দেখাচ্ছিল (কারণ তখনও কোনো ফিক্স করা হয়নি, raw "ALL" prefix করা
  option label ছিল দেখতে অনেকটা একই রকম), কিন্তু "সর্ট" dropdown এ
  raw "createdAt:desc" স্পষ্টভাবে দেখা গেছে।
- **Fix এর পরে**: একই পেজের স্ক্রিনশটে "সব Role", "সব স্ট্যাটাস",
  "নতুন যোগ হওয়া আগে" — সব readable label সঠিকভাবে দেখাচ্ছে।
- Forum New Post Form এও ফিক্সের আগে "QUESTION"/"NONE" raw value
  দেখাচ্ছিল, ফিক্সের পরে "প্রশ্ন — সাহায্য দরকার"/"সাধারণ (কোনো
  নির্দিষ্ট সাবজেক্ট না)" readable বাংলা লেবেল দেখাচ্ছে।
- Subject Manager এর "নতুন সাবজেক্ট" Dialog স্ক্রিনশটে Select
  dropdown খোলা অবস্থায় checkmark সহ সিলেক্টেড আইটেম (PHYSICS) সঠিকভাবে
  হাইলাইট দেখা গেছে।

### Regression টেস্ট (৬/৬ assertion পাস)
1. Existing subject ব্যবহার করে chapter তৈরি সফল।
2. Chapter এর অধীনে topic তৈরি সফল।
3. CSV bulk question upload (difficulty ভ্যালু shadcn Select থেকে
   আসা "MEDIUM") সঠিকভাবে সেভ হয়েছে, count=1 কনফার্ম।
4. Forum post তৈরি — `subjectCode: ""` (Select এর "NONE" sentinel
   থেকে client-side রূপান্তরিত হয়ে) API তে সঠিকভাবে পৌঁছেছে ও
   গ্রহণযোগ্য হয়েছে।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (nested render composition
   (`report-dialog.tsx`) ও `items` prop টাইপিং সহ কোনো error নেই)।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. Playwright দিয়ে ভিজুয়াল ভেরিফিকেশন (fix আগে-পরে screenshot compare)
   + ৬/৬ regression assertion।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট চ্যাপ্টার/টপিক/প্রশ্ন/ফোরাম-পোস্ট
   আসল admin API endpoint (`DELETE /api/admin/topics/[topicId]` ইত্যাদি)
   দিয়ে ডিলিট করা হয়েছে (raw SQL bypass না)। psycopg2 দিয়ে সরাসরি
   চেক করে (`chapters.name LIKE '%টেস্ট চ্যাপ্টার%'`, `topics.name
   LIKE '%টেস্ট টপিক%'`, `questions.text LIKE '%টেস্ট প্রশ্ন সিলেক্ট%'`,
   `forum_posts.title LIKE '%টেস্ট পোস্ট%'`) কোনো leftover নেই ভেরিফাই
   করা হয়েছে (সব ০)। মূল seeded content (185 topics, 349 questions)
   অক্ষত থাকা কনফার্ম করা হয়েছে।

### নতুন test script
`scripts/test-shadcn-select-tooltip-visual.py`,
`scripts/test-tooltip-forum-mod-panel.py`,
`scripts/test-select-value-label-bug.py` (Select Label Bug আবিষ্কার
করার মূল স্ক্রিপ্ট),
`scripts/test-select-fix-verify2.py`,
`scripts/test-select-fix-verify3.py`,
`scripts/test-select-migration-regression2.py` (৬টা assertion,
পুনরায় ব্যবহারযোগ্য)।

### শিক্ষণীয় (ভবিষ্যতের জন্য নথিভুক্ত)
নতুন কোনো shadcn `Select` কম্পোনেন্ট ব্যবহার করার সময় সবসময় মনে
রাখতে হবে: **যদি `SelectItem` এর `value` ও দৃশ্যমান label ভিন্ন হয়,
`<Select>` এ অবশ্যই `items` prop দিতে হবে**, নাহলে trigger এ raw
value দেখাবে label না (base-ui এর ডিফল্ট limitation, shadcn wrapper
নিজে থেকে এটা handle করে না)। শুধু value=label একই ক্ষেত্রে (যেমন
enum code নিজেই human-readable, "PHYSICS") `items` prop ছাড়া রাখা
নিরাপদ।

---

## 🎨 UI Polish — shadcn Checkbox Migration (Topic Manager) ✅ সম্পন্ন

### প্রেক্ষাপট
Select/Tooltip মাইগ্রেশনের পরে ব্যবহারকারী "Next এ কী করবো" জিজ্ঞেস
করলে `ask_user` টুল দিয়ে অপশন দেওয়া হয়েছিল (আরও Bug Hunt, আরও UI
Polish, Content কাজ, নতুন ফিচার) — ব্যবহারকারী "আরও UI Polish (shadcn
continue)" বেছে নিয়েছেন। তাই বাকি থাকা raw HTML form element খুঁজে
বের করার জন্য পুরো কোডবেস আবার সিস্টেম্যাটিকভাবে স্ক্যান করা হয়েছে।

### স্ক্যান পদ্ধতি ও ফলাফল
```
grep -rln 'type="checkbox"\|type="radio"' components/ app/
grep -rln "<textarea" components/ app/  (shadcn Textarea ছাড়া)
grep -rn "bg-primary.*rounded-full\|toggle" (raw switch-lookalike)
```
ফলাফল: শুধু `components/admin/topic-manager.tsx` এ ২টা জায়গায় raw
`<input type="checkbox">` পাওয়া গেছে (Create Topic ও Edit Topic
ডায়ালগ, "বোর্ড পরীক্ষায় গুরুত্বপূর্ণ টপিক হিসেবে চিহ্নিত করো ⭐"
ফ্ল্যাগ) — শুধু `className="h-4 w-4"` সাইজ ক্লাস ছিল, কোনো
theme-aware styling/dark-mode support ছিল না। বাকি সব radio/textarea/
switch already shadcn কম্পোনেন্ট ব্যবহার করছিল, কোনো নতুন gap পাওয়া
যায়নি।

### ফিক্স
established `Checkbox` কম্পোনেন্ট (`components/ui/checkbox.tsx`,
base-ui `@base-ui/react/checkbox` primitive ভিত্তিক, `checked`/
`onCheckedChange` prop) দিয়ে replace করা হয়েছে — এই কম্পোনেন্ট আগে
থেকেই `reports-panel.tsx` এর Content Report Bulk Actions ফিচারে
ব্যবহৃত হচ্ছিল (established pattern):
```tsx
<div className="flex items-center gap-2">
  <Checkbox
    id="topic-is-important-create"
    checked={form.isImportant}
    onCheckedChange={(checked) => setForm({ ...form, isImportant: checked === true })}
  />
  <label htmlFor="topic-is-important-create" className="text-sm cursor-pointer">
    বোর্ড পরীক্ষায় গুরুত্বপূর্ণ টপিক হিসেবে চিহ্নিত করো ⭐
  </label>
</div>
```
পুরনো `<label><input/>...</label>` wrapper প্যাটার্নের বদলে `<div>`
+ explicit `htmlFor` association ব্যবহার করা হয়েছে — accessibility
সামান্য ভালো (label click করলে ঠিকভাবে checkbox toggle হয়, screen
reader এও স্পষ্ট association)।

### Playwright দিয়ে ভিজুয়াল ভেরিফিকেশন
headless Chromium দিয়ে Admin panel এ লগইন করে Create Topic ডায়ালগ
খুলে স্ক্রিনশট নেওয়া হয়েছে — shadcn styled checkbox (unchecked
অবস্থায়, border+rounded corner সহ) দেখা গেছে। তারপর checkbox এ ক্লিক
করে আরেকটা স্ক্রিনশট নেওয়া হয়েছে — checked অবস্থায় theme primary
color এ checkmark icon দেখা কনফার্ম করা হয়েছে, `data-checked`
attribute উপস্থিত হওয়া নিশ্চিত করা হয়েছে।

### Regression টেস্ট (৭/৭ assertion পাস)
1. Chapter তৈরি সফল (prerequisite)।
2. `isImportant: true` দিয়ে topic তৈরি (checked checkbox সিমুলেট) —
   সফল, response এ `isImportant: true` কনফার্ম।
3. `PATCH` দিয়ে `isImportant: false` এ আপডেট (unchecked সিমুলেট) —
   সফল, `isImportant: false` কনফার্ম।
4. আবার `PATCH` দিয়ে `isImportant: true` তে টগল (re-checked সিমুলেট)
   — সফল, `isImportant: true` কনফার্ম।

সব ক্ষেত্রেই boolean ভ্যালু সঠিকভাবে persist হয়েছে, established
create/edit flow এর কোনো ক্ষতি হয়নি।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. Playwright ভিজুয়াল ভেরিফিকেশন + ৭/৭ regression assertion।
5. **Test cleanup সম্পূর্ণ**: টেস্ট চ্যাপ্টার/টপিক আসল `DELETE
   /api/admin/topics/[topicId]` ও `/api/admin/chapters/[chapterId]`
   endpoint দিয়ে ডিলিট করা হয়েছে। psycopg2 দিয়ে সরাসরি চেক করে কোনো
   leftover নেই (`chapters.name LIKE '%টেস্ট চ্যাপ্টার%'`,
   `topics.name LIKE '%টেস্ট টপিক%'` উভয়ই ০) ভেরিফাই করা হয়েছে,
   seeded content (185 topics, 349 questions) অক্ষত থাকা কনফার্ম
   করা হয়েছে।

### নতুন test script
`scripts/test-topic-checkbox-visual.py`,
`scripts/test-topic-checkbox-regression.py` (৭টা assertion, পুনরায়
ব্যবহারযোগ্য)।

### রাউন্ড সমাপ্তি নোট — shadcn UI Polish এর এই ধাপ সম্পূর্ণ
এই সেশনের shadcn UI Polish কাজ (৩টা sub-round জুড়ে) এখন সম্পূর্ণ:
- raw `<select>` (৩টা ফাইল) → shadcn `Select` — ✅
- নেটিভ `title=""` tooltip (১৬টা জায়গা) → shadcn `Tooltip` — ✅
- raw checkbox (২টা জায়গা) → shadcn `Checkbox` — ✅
- গুরুতর প্রি-এক্সিস্টিং Select Label বাগ (৮টা ফাইল, ৯টা instance) —
  ফিক্স করা হয়েছে (`items` prop) — ✅

বাকি থাকা বড় স্কোপ আইটেম **ইচ্ছাকৃতভাবে এই রাউন্ডে করা হয়নি**:
Alert কম্পোনেন্ট দিয়ে ৩৫টা custom callout/notice box (`bg-amber-50`,
`bg-destructive/10` ইত্যাদি ইনলাইন স্টাইল করা div) replace করার
সুযোগ আছে, কিন্তু এটা অনেক বড়, higher-risk visual-regression cleanup
task (৩৫টা ভিন্ন ভিন্ন জায়গায় visual layout পরিবর্তন হতে পারে) —
এটা একটা আলাদা, ফোকাসড সেশনে (হয়তো ব্যবহারকারীর সুনির্দিষ্ট অনুরোধে)
করা উচিত বলে সিদ্ধান্ত নেওয়া হয়েছে, এই সাধারণ "UI Polish continue"
রাউন্ডে অন্তর্ভুক্ত করা হয়নি।

---

## 🐛 গুরুতর বাগ ফিক্স — Reading Room Multi-Active-Session Race Condition (Data Integrity Bug) ✅ সম্পন্ন

### প্রেক্ষাপট
shadcn Checkbox মাইগ্রেশনের পরে ব্যবহারকারী "Next" নির্দেশ দেওয়ায়
আরও Bug Hunt চালিয়ে যাওয়া হয়েছে। এই সেশনে ইতিমধ্যে চেক করা race-
condition ক্লাস (Admin bulk-action, Study Plan, Custom Question Set)
গুলোর বাইরে নতুন কোনো এলাকা খুঁজে বের করার চেষ্টা করা হয়েছে —
`grep -rln "Promise.all"` দিয়ে multi-step operation থাকা endpoint
গুলো স্ক্যান করে Reading Room ফিচার (এই সেশনে এখনো race-condition
অডিট করা হয়নি এমন একটা এলাকা) এ মনোযোগ দেওয়া হয়েছে।

### কোড রিভিউ পদ্ধতি
`prisma/schema.prisma` এর `ReadingRoomSession` মডেলে একটা স্পষ্ট
comment পাওয়া গেছে:
```
// একই সময়ে একজন ইউজারের একাধিক active সেশন (endedAt: null) থাকা উচিত
// না — অ্যাপ-লেভেল লজিকে (lib/reading-room.ts) joinRoom() করার আগে
// পুরনো active সেশন থাকলে auto-end করে দেওয়া হয়।
```
এই comment টা নিজেই সন্দেহজনক ছিল ("অ্যাপ-লেভেল লজিক" মানে কোনো DB
constraint নেই)। `lib/reading-room.ts` এর `joinReadingRoom()` ফাংশন
রিভিউ করে দেখা গেছে:
```ts
export async function joinReadingRoom(input: JoinRoomInput) {
  const existing = await getActiveSession(input.userId);  // read
  if (existing) {
    await endSessionInternal(existing.id, existing.totalFocusSec);  // write ১
  }
  const session = await prisma.readingRoomSession.create({ ... });  // write ২
  return session;
}
```
এটা ক্লাসিক read-then-write race window — `getActiveSession()`
(read) ও `create()` (write) এর মাঝে concurrent join request এলে
প্রতিটাই স্বাধীনভাবে read করে, স্বাধীনভাবে `create()` কল করে।

### লাইভ প্রুফ (DB row-count ভেরিফিকেশন, crash-based টেস্টে ধরা পড়েনি)
প্রথমে ৩-থ্রেড concurrent join টেস্ট করে দেখা গেছে সব রিকোয়েস্ট ২০১
সফল রেসপন্স দিচ্ছে, **কোনো ৫০০ crash নেই** — এই বাগ ক্লাসের আগের
instance গুলোর (FK violation crash) থেকে ভিন্ন প্রকৃতির, তাই সাধারণ
"status code চেক করো" টেস্টে এটা ধরা পড়েনি। তারপর সরাসরি DB তে
psycopg2 দিয়ে active session count চেক করে (৫-থ্রেড concurrent join,
প্রতি iteration এর পরে `SELECT count(*) FROM reading_room_sessions
WHERE userId=? AND endedAt IS NULL`) প্রকৃত বাগ ধরা পড়েছে:
```
iter 0: statuses=[201,201,201,201,201] active_sessions_in_db=5
iter 1: statuses=[201,201,201,201,201] active_sessions_in_db=9
iter 2: statuses=[201,201,201,201,201] active_sessions_in_db=13
...
iter 9: statuses=[201,201,201,201,201] active_sessions_in_db=41
```
মোট ১০ iteration এ প্রতিবার ৫টা request এর মধ্যে গড়ে ৪টা নতুন active
session যোগ হয়েছে (প্রতিটা concurrent batch এ একটা "জেতে" পুরনো
সেশন খুঁজে পেয়ে end করে, বাকিগুলো race window এ পুরনো সেশন miss
করে সরাসরি নতুন session তৈরি করে ফেলে) — লিনিয়ার accumulation, ১০
iteration শেষে ৪১টা active session।

### User-facing প্রভাব
এই silent data-integrity বাগ দুইটা ফিচারে প্রভাব ফেলছিল:
1. `getRoomPresence()` — `findMany({ where: { room, endedAt: null,
   ... } })` দিয়ে সব active session আনে ও প্রতিটাকে presence entry
   হিসেবে map করে। একজন ইউজারের ৫টা active session থাকলে সে presence
   লিস্টে ৫ বার দেখাবে (একই নাম বারবার, দেখতে bug-riddled)।
2. `getAllRoomOccupancy()` — `groupBy({ by: ["room"], ... _count })`
   দিয়ে room এ কতগুলো active session row আছে গণনা করে, distinct user
   না। একজন ইউজারের ৫টা session থাকলে room occupancy +৪ ভুলভাবে
   বেড়ে যাবে (বাস্তবে ১ জন আছে, দেখাবে ৫ জন)।

### ফিক্সের ডিজাইন সিদ্ধান্ত ও deadlock সতর্কতা
Custom Question Set এর established `$transaction` + `SELECT ...
FOR UPDATE` row-lock প্যাটার্ন এখানে প্রয়োগ করা হয়েছে (ইউজারের
`users` row লক করে) — পুরনো session খুঁজে বের করা+শেষ করা+নতুন
session তৈরি করা পুরো সিকোয়েন্স একই atomic transaction এর ভেতরে
আনা হয়েছে।

**গুরুত্বপূর্ণ সতর্কতা যা কোড রিভিউতে আগেই ধরা পড়েছে (actual
deadlock reproduce হওয়ার আগে)**: `awardXp()` ও `updateStreak()`
ফাংশন দুটো `tx` (Prisma transaction client) parameter গ্রহণ করে না
— তারা নিজেরাই internally গ্লোবাল `prisma` singleton দিয়ে `users`
টেবিলে সরাসরি `update()` কল করে। যদি এই দুটো ফাংশন
`joinReadingRoom()` এর নতুন `$transaction` এর ভেতরে কল করা হতো
(যেই transaction টা ইতিমধ্যে সেই একই `users` row এ `FOR UPDATE`
লক ধরে বসে আছে), তাহলে `awardXp()`/`updateStreak()` এর নিজস্ব,
আলাদা connection সেই লক করা row আপডেট করার চেষ্টা করে **নিজের
transaction এর নিজের রাখা লকের জন্যই অপেক্ষা করে আটকে থাকতো**
(self-deadlock, PostgreSQL এ `lock_timeout`/`statement_timeout`
সেট না থাকলে চিরকাল hang হয়ে থাকতে পারতো)।

ফিক্স: XP/streak award **transaction এর বাইরে** সরিয়ে আনা হয়েছে।
`$transaction` কলব্যাক শুধু atomic অংশটুকু (row lock + session
end + session create) করে এবং শেষ হওয়া প্রতিটা পুরনো সেশনের তথ্য
(`{ userId, totalFocusSec }`) একটা array তে রিটার্ন করে। Transaction
কমিট হওয়ার পরে, আলাদাভাবে (transaction এর বাইরে, নিজস্ব connection
এ) প্রতিটা শেষ হওয়া সেশনের জন্য established `endSessionInternal()`
এর একই ৫ মিনিট (৩০০ সেকেন্ড) থ্রেশহোল্ড অনুসরণ করে XP/streak প্রদান
করা হয়:
```ts
const { session, endedSessions } = await prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${input.userId} FOR UPDATE`;
  const existingSessions = await tx.readingRoomSession.findMany({
    where: { userId: input.userId, endedAt: null },
  });
  // ... সব existingSessions শেষ করা, তথ্য সংগ্রহ করা ...
  const newSession = await tx.readingRoomSession.create({ ... });
  return { session: newSession, endedSessions: ended };
});

// transaction এর বাইরে — deadlock-নিরাপদ
for (const ended of endedSessions) {
  if (ended.totalFocusSec >= 300) {
    const xpEarned = Math.floor(ended.totalFocusSec * XP_PER_FOCUS_SEC);
    if (xpEarned > 0) await awardXp(ended.userId, xpEarned);
    await updateStreak(ended.userId);
  }
}
```
এটা একটা নতুন সাধারণ নীতি হিসেবে নথিভুক্ত করা হলো: **যখনই কোনো
helper function (যেমন `awardXp`, `updateStreak`) নিজস্ব
`prisma` singleton ব্যবহার করে এবং transaction-aware না, সেটাকে
কখনো এমন `$transaction` এর ভেতরে কল করা যাবে না যেটা ইতিমধ্যে সেই
একই row/টেবিলে লক ধরে আছে — নাহলে self-deadlock এর ঝুঁকি থাকে।**

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: ১০ iteration এ active session count ধারাবাহিকভাবে
  বেড়ে ৫→৯→১৩→...→৪১ পর্যন্ত পৌঁছেছে (linear accumulation, প্রতি
  ৫-থ্রেড batch এ +৪)।
- Fix এর পরে (dev server rebuild করে): একই টেস্ট স্ক্রিপ্ট ১৫
  iteration (৭৫টা concurrent request) এ চালিয়ে **প্রতিবার সর্বোচ্চ
  ঠিক ১টা active session** কনফার্ম হয়েছে — কোনো accumulation নেই।
  dev server log এ কোনো crash/deadlock/timeout দেখা যায়নি।

### Regression টেস্ট (১১/১১ assertion পাস)
1. Normal single-user join flow — ২০১ রেসপন্স।
2. `GET /api/reading-room/rooms` এ সঠিক `activeSession` রিটার্ন।
3. Presence এ নিজেকে ঠিক ১ বার দেখা (duplicate-free, বাগের সরাসরি
   প্রমাণ ছিল, ফিক্সের পরে কনফার্ম হয়েছে দূর হয়ে গেছে)।
4. Heartbeat endpoint কাজ করা।
5. Room switch (দ্বিতীয়বার join) করলে পুরনো session id থেকে ভিন্ন
   নতুন session id তৈরি হওয়া।
6. `activeSession` আপডেট হয়ে নতুন session দেখানো।
7. Leave endpoint কাজ করা।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (`$transaction` টাইপিং সহ)।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে ডিলিট করা হয়েছে (cascade এ তাদের
   `ReadingRoomSession` ও মুছে গেছে)। psycopg2 দিয়ে সরাসরি চেক করে
   (`users.email LIKE '%readingroomrace%' OR '%rrmultisess%' OR
   '%rrregr%'`, `reading_room_sessions` টেবিলের count) কোনো
   leftover নেই ও টেবিল সম্পূর্ণ খালি ভেরিফাই করা হয়েছে (কোনো আসল
   ইউজার এই ফিচার ব্যবহার করেনি)।

### নতুন test script
`scripts/test-reading-room-double-join-race.py` (প্রাথমিক status-
code-based টেস্ট, crash না পাওয়ায় প্রথমে false-negative দিয়েছিল),
`scripts/test-reading-room-multi-session-check.py` (মূল আবিষ্কার+
ভেরিফিকেশন স্ক্রিপ্ট, DB row-count ভিত্তিক, ১০→১৫ iteration এ
আপডেট করে দুইবার চালানো হয়েছে), `scripts/test-reading-room-
regression.py` (১১টা assertion, পুনরায় ব্যবহারযোগ্য)।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/
Role-Change, Admin Notification Broadcast, Admin CSV Bulk Question
Upload, Study Plan Background Chunk Generation, **Reading Room
Multi-Active-Session (নতুন — crash-based টেস্টে অদৃশ্য থাকা silent
data-integrity বাগ, DB row-count ভেরিফিকেশন দিয়েই ধরা সম্ভব হয়েছে,
এবং ফিক্স করার সময় একটা নতুন সাধারণ সতর্কতা নথিভুক্ত হয়েছে:
non-transaction-aware helper function কে active transaction এর
ভেতরে কল করলে self-deadlock ঝুঁকি)**।

এই বাগ ক্লাসের জন্য একটা নতুন গুরুত্বপূর্ণ testing lesson নথিভুক্ত
করা হলো: **শুধু HTTP status code (৫০০ crash) চেক করাই যথেষ্ট না —
কিছু race condition কোনো crash তৈরি না করেই silent data corruption/
duplication তৈরি করতে পারে। এই ধরনের বাগ ধরতে concurrency টেস্টের
পরে সবসময় DB তে সরাসরি row-count/state ভেরিফাই করা উচিত, শুধু API
response এর status code না।**

---

## 🐛 গুরুতর বাগ ফিক্স — Reading Room Heartbeat vs Leave Race Condition (Second Instance in Same File) ✅ সম্পন্ন

### প্রেক্ষাপট
Reading Room Multi-Active-Session (Join) race condition ফিক্স করার
পরে, একই ফাইলের (`lib/reading-room.ts`) বাকি ফাংশন গুলো (heartbeat,
leave) একই বাগ ক্লাসের জন্য প্রতিরোধমূলকভাবে (defensive) রিভিউ করা
হয়েছিল — established principle অনুযায়ী "একই bug class একবার একটা
এলাকায় পাওয়া গেলে কাছাকাছি সব কোড path এ প্রতিরোধমূলক ফিক্স/অডিট
করা ভালো অভ্যাস"। এই রিভিউতে `sendHeartbeat()` এ আরেকটা সম্পর্কিত
race condition পাওয়া গেছে।

### কোড রিভিউ পদ্ধতি
`sendHeartbeat()` ফাংশন রিভিউ করে দেখা গেছে:
```ts
const sessionRow = await prisma.readingRoomSession.findUnique({ where: { id: sessionId } });
if (!sessionRow || sessionRow.userId !== userId || sessionRow.endedAt) {
  return { session: null, ended: true, xpEarned: 0 };
}
// ... গ্যাপ হিসাব করা ...
const updated = await prisma.readingRoomSession.update({
  where: { id: sessionId },  // ⚠️ endedAt: null guard নেই!
  data: { lastHeartbeatAt: now, totalFocusSec: { increment: ... }, ... },
});
```
`findUnique()` এ `endedAt` চেক করা হয়েছে ঠিকই, কিন্তু সেই চেক ও পরের
`update()` এর মাঝে একটা network round-trip window আছে — এই window
এ যদি concurrent `leaveReadingRoom()` (যেটা নিজেই `endSessionInternal()`
এর ভেতরে atomic `updateMany({ where: { id, endedAt: null } })`
ব্যবহার করে সঠিকভাবে সেশন শেষ করে) এই সেশন `endedAt` সেট করে দেয়,
heartbeat এর `update()` কল (কোনো `endedAt: null` guard ছাড়া) তবুও
সফলভাবে চলবে এবং সেই ইতিমধ্যে-শেষ-হওয়া সেশনের `lastHeartbeatAt`/
`totalFocusSec` পরিবর্তন করে দেবে।

### লাইভ প্রুফ
প্রথম প্রচেষ্টায় (barrier দিয়ে দুটো থ্রেড একসাথে শুরু করে) কোনো
inconsistency পাওয়া যায়নি, কারণ `leaveReadingRoom()` (~1.5s, XP/
streak calculation সহ) সবসময় `sendHeartbeat()` (~1s) এর চেয়ে বেশি
সময় নিচ্ছিল এবং race window সবসময় একই দিকে "জিতে" যাচ্ছিল। টাইমিং
টিউন করে (heartbeat থ্রেডে ৫০ms `sleep` দিয়ে যাতে এটা leave এর
মাঝামাঝি সময়ে read+write করে) সমস্যাটা নিশ্চিতভাবে reproduce করা
হয়েছে — ১৫/১৫ iteration এ DB তে সরাসরি psycopg2 দিয়ে `lastHeartbeatAt`
চেক করে দেখা গেছে প্রতিবার `endedAt` সেট থাকা সত্ত্বেও
`lastHeartbeatAt` পরিবর্তিত হয়েছে (heartbeat সফলভাবে একটা "ended"
সেশন revive করেছে)।

এই বাগ কোনো crash তৈরি করে না এবং XP ডাবল-award করে না (কারণ XP
award শুধু `endSessionInternal()` এর ভেতরে ঘটে, heartbeat কখনো XP
দেয় না) — এটা একটা সূক্ষ্ম presence/analytics ডেটা ইনকনসিস্টেন্সি,
কিন্তু ভবিষ্যতে যদি কোনো নতুন লজিক `lastHeartbeatAt` এর উপর নির্ভর
করে (যেমন "সবচেয়ে সাম্প্রতিক সক্রিয় সময়" analytics) তাহলে ভুল ফলাফল
দিতে পারতো।

### ফিক্স
`update()` এর বদলে established atomic `updateMany({ where: { id,
endedAt: null } })` claim প্যাটার্ন (`endSessionInternal()` এ আগে
থেকেই ব্যবহৃত একই প্যাটার্ন এখানেও প্রয়োগ):
```ts
const claimResult = await prisma.readingRoomSession.updateMany({
  where: { id: sessionId, endedAt: null },
  data: { lastHeartbeatAt: now, totalFocusSec: { increment: ... }, ... },
});

if (claimResult.count === 0) {
  // অন্য একটা concurrent কল (leave/join) ইতিমধ্যে এই সেশন শেষ করে দিয়েছে
  const ended = await prisma.readingRoomSession.findUnique({ where: { id: sessionId } });
  return { session: ended, ended: true, xpEarned: 0 };
}
```
এতে `updateMany()` কখনো ইতিমধ্যে-শেষ-হওয়া সেশনে write করতে পারবে না
(matched count 0 হবে) — heartbeat নিজে গ্রেসফুলভাবে "ended: true"
রিটার্ন করে, ফ্রন্টএন্ড "আবার join করো" prompt দেখাবে।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: টাইমিং টিউন করা টেস্টে ১৫/১৫ iteration এ ইনকনসিস্টেন্সি
  reproduce হয়েছে।
- Fix এর পরে (dev server rebuild করে): একই টেস্ট স্ক্রিপ্ট আবার ১৫
  iteration চালিয়ে **০/১৫ inconsistency** কনফার্ম হয়েছে।

### Regression ও Authorization/Edge-case টেস্ট
- Regression: established `test-reading-room-regression.py` (১১/১১
  assertion) আবার চালিয়ে normal join/heartbeat/room-switch/leave
  flow অক্ষত আছে নিশ্চিত করা হয়েছে।
- নতুন edge-case (৬/৬ assertion পাস): non-existent `sessionId` এ
  heartbeat → ৪০৪; অন্য ইউজারের session এ heartbeat পাঠালে ৪০৪
  (authorization ঠিক আছে, ownership চেক bypass হয় না); normal
  heartbeat → ২০০ + `ended: false`; leave করার পরে সেই session এ
  heartbeat পাঠালে ৪০৪ বা `ended: true` — সব established validation
  logic ঠিকভাবে কাজ করছে কনফার্ম করা হয়েছে।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (`updateMany()`/`findUniqueOrThrow`
   রিটার্ন টাইপ পরিবর্তনের পরেও `HeartbeatResult` interface এর সাথে
   compatible)।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression +
   edge-case টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে ডিলিট করা হয়েছে। psycopg2 দিয়ে
   সরাসরি চেক করে (`users.email LIKE '%rrhbrace%' OR '%rredge%'`,
   `reading_room_sessions` টেবিলের count) কোনো leftover নেই ও টেবিল
   সম্পূর্ণ খালি ভেরিফাই করা হয়েছে।

### নতুন test script
`scripts/test-reading-room-heartbeat-leave-race.py` (প্রাথমিক
barrier-based টাইমিং, false-negative দিয়েছিল কারণ leave সবসময়
heartbeat এর চেয়ে ধীর ছিল), `scripts/test-reading-room-heartbeat-
leave-race2.py` (মূল আবিষ্কার+ভেরিফিকেশন, ৫০ms delay-tuned টাইমিং
সহ, fix আগে-পরে দুইবার চালানো হয়েছে), `scripts/test-reading-room-
heartbeat-edge-cases.py` (৬টা assertion, পুনরায় ব্যবহারযোগ্য)।

### শিক্ষণীয় (ভবিষ্যতের জন্য নথিভুক্ত)
এই bug hunt থেকে দুইটা গুরুত্বপূর্ণ পাঠ নথিভুক্ত করা হলো:
1. **একই ফাইলে একাধিক ফাংশন থাকলে, একটাতে race condition বাগ
   পাওয়া গেলে বাকি সব ফাংশন একই ফাইলে প্রতিরোধমূলকভাবে (defensive)
   রিভিউ করা উচিত** — এই ক্ষেত্রে `joinReadingRoom()` এ বাগ পাওয়ার
   পরে `sendHeartbeat()` এ একই ধরনের (কিন্তু ভিন্ন প্রকাশ পাওয়া) বাগ
   পাওয়া গেছে।
2. **Concurrency টেস্টে barrier/simultaneous-start দিয়ে race window
   হিট নাও হতে পারে যদি দুটো অপারেশনের বাস্তব execution সময় ভিন্ন
   হয়** (এখানে leave ~1.5s, heartbeat ~1s) — এমতাবস্থায় দ্রুত
   অপারেশনটাকে ইচ্ছাকৃতভাবে সামান্য delay (এখানে ৫০ms) দিয়ে ধীর
   অপারেশনের মাঝামাঝি সময়ে পড়ার সম্ভাবনা বাড়িয়ে race window
   নির্ভরযোগ্যভাবে reproduce করা যায় — এটা concurrency টেস্টিং এর
   একটা reusable কৌশল হিসেবে নথিভুক্ত করা হলো।

### সারসংক্ষেপ আপডেট
Reading Room ফিচারে এখন দুইটা সম্পর্কিত race condition বাগ ফিক্স
হয়ে গেছে: (১) Multi-Active-Session (Join), (২) Heartbeat-Revives-
Ended-Session (Heartbeat vs Leave)। উভয়ই একই root cause প্যাটার্নের
(read-then-write, `endedAt`/atomic guard এর অভাব) ভিন্ন প্রকাশ।

---

## 🐛 গুরুতর বাগ ফিক্স — Notification/Habit PATCH-DELETE Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
Reading Room এর দুইটা race condition (Join, Heartbeat vs Leave)
ফিক্স করার পরে ব্যবহারকারী "Next" নির্দেশ দেওয়ায় established
"existence check থাকা সত্ত্বেও read-then-write" বাগ ক্লাসের (Admin
User Ban endpoint এ আগে পাওয়া গিয়েছিল) নতুন instance খোঁজা হয়েছে।
`grep -rln "\.update({"` দিয়ে `updateMany` ব্যবহার না করা সব ফাইল
স্ক্যান করে candidate endpoint গুলো চিহ্নিত করা হয়েছে —
Notification, Habit, Routine, User Profile ইত্যাদি self-service
CRUD endpoint।

### কোড রিভিউ পদ্ধতি
`app/api/notifications/[notificationId]/route.ts` ও `app/api/
habits/[habitId]/route.ts` রিভিউ করে দেখা গেছে দুটোতেই একই প্যাটার্ন:
```ts
const item = await prisma.X.findUnique({ where: { id } });
if (!item || item.userId !== session.user.id) return 404/403;
await prisma.X.update({ where: { id }, data: {...} });  // ⚠️ কোনো userId guard নেই
```

### লাইভ প্রুফ
Python `threading` দিয়ে একই `notificationId`/`habitId` তে সমান্তরালে
(concurrent) `PATCH` ও `DELETE` পাঠানো হয়েছে। Notification এ প্রথম
প্রচেষ্টাতেই বাগ reproduce হয়েছে:
```
prisma:error
Invalid `prisma.notification.update()` invocation
An operation failed because it depends on one or more records that
were required but not found. No record was found for an update.
    at app/api/notifications/[notificationId]/route.ts:31:29
{ code: 'P2025', ... }
PATCH /api/notifications/[notificationId] 500 in 1232ms
DELETE /api/notifications/[notificationId] 200 in 985ms
```
এর মানে হলো check ও update এর মাঝের ছোট window এ delete সম্পন্ন
হয়ে যাওয়ায় PATCH এর `update()` ব্যর্থ Prisma-level exception throw
করেছে — বাস্তব জীবনে ইউজার দ্রুত ডাবল-ক্লিক করলে বা একাধিক ট্যাব/
ডিভাইস থেকে একই সময়ে notification read করে অন্য ট্যাব থেকে delete
করলে এটা ঘটতে পারে।

### ফিক্স
উভয় endpoint এ `update()`/`delete()` এর বদলে established atomic
`updateMany()`/`deleteMany({ where: { id, userId } })` claim
প্যাটার্ন ব্যবহার করা হয়েছে:
```ts
const claimResult = await prisma.notification.updateMany({
  where: { id: notificationId, userId: session.user.id },
  data: { read: true },
});
if (claimResult.count === 0) return 404;
```
একটা অতিরিক্ত উপকারিতা লক্ষ্য করা গেছে Habit endpoint এ: আগে
existence (findUnique null হলে ৪০৪) ও ownership (userId mismatch
হলে ৪০৩) দুটো আলাদা status code এ ছিল। ফিক্সের পরে `id, userId`
দুটোই একই `where` ক্লজে থাকায় উভয় ক্ষেত্রেই একসাথে ৪০৪ রিটার্ন হয়
— এটা নিরাপত্তার দিক থেকে সামান্য ভালো উন্নতি (established security
best practice: অন্য কারো resource "আছে কিন্তু তোমার না" এই তথ্য leak
না করে শুধু "পাওয়া যায়নি" দেখানো, যাতে attacker resource enumeration
করতে না পারে)। PATCH এ updated data fetch এর জন্য `findUniqueOrThrow`
না ব্যবহার করে non-throwing `findUnique` ব্যবহার করা হয়েছে (আরও এক
স্তর ডিফেন্সিভ)।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: Notification PATCH+DELETE concurrent টেস্টে সরাসরি
  ৫০০ crash reproduce হয়েছে (P2025 stack trace কনফার্ম)।
- Fix এর পরে (dev server rebuild করে): Habit ও Notification উভয়ের
  জন্য ১০+১০ = ২০ iteration চালিয়ে **কোনো ৫০০ crash হয়নি**, race
  জেতা ক্ষেত্রে সঠিকভাবে ৪০৪ রিটার্ন করেছে।

### Regression/Authorization টেস্ট (১৪/১৪ assertion পাস)
1. Habit: normal create/patch/delete flow, non-existent habitId এ
   ৪০৪, অন্য ইউজারের habit এ PATCH করলে ৪০৪ (ownership+existence
   merged), unauthenticated ব্লক (৪০১), delete-এর-পরে-আবার-delete
   এ ৪০৪।
2. Notification: normal read/patch/delete flow, non-existent এ ৪০৪,
   অন্য ইউজারের notification এ PATCH করলে ৪০৪।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next && pnpm build` — সফল, সব পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression/
   authorization টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে ডিলিট করা হয়েছে (cascade এ তাদের
   `Habit` ও মুছে গেছে)। Broadcast টেস্ট notification গুলো (যেগুলো
   সব ইউজার সহ admin account এও গিয়েছিল, কারণ notification broadcast
   সব ইউজারকে পাঠায়) psycopg2 দিয়ে সরাসরি চেক করে (`notifications.
   title LIKE 'রেস টেস্ট%' OR 'রিগ্রেশন টেস্ট%'`) খুঁজে বের করে
   পরিষ্কার করা হয়েছে, শুধু admin account এর pre-existing আসল badge
   notification (টেস্ট ডেটা না, actual account activity) অক্ষত রাখা
   হয়েছে।

### নতুন test script
`scripts/test-habit-notification-delete-race.py` (মূল আবিষ্কার+
ভেরিফিকেশন, fix আগে-পরে দুইবার চালানো হয়েছে), `scripts/test-habit-
notification-regression.py` (১৪টা assertion, পুনরায় ব্যবহারযোগ্য)।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/
Role-Change, Admin Notification Broadcast, Admin CSV Bulk Question
Upload, Study Plan Background Chunk Generation, Reading Room
Multi-Active-Session, Reading Room Heartbeat vs Leave,
**Notification/Habit PATCH-DELETE (নতুন — established "existence
check-then-write" ক্লাসের ৩য়/৪র্থ instance এই সেশনে, Admin User Ban
এর পরে)**।

established "P2025 500-instead-of-404" বাগ ক্লাস (মূলত ১৪টা endpoint
এ প্রথম audit এ ফিক্স হয়েছিল, তারপর Admin Ban এ আরেকটা instance,
এখন Notification+Habit এ আরও দুটো) এখন প্রমাণ করছে এই প্যাটার্নটা
কোডবেসে বারবার পুনরাবৃত্তি হওয়া একটা সাধারণ ভুল — প্রতিটা নতুন
self-service CRUD endpoint লেখার সময় ডিফল্টভাবে `updateMany`/
`deleteMany({ where: { id, userId } })` ব্যবহার করা উচিত `findUnique`
+ `update`/`delete` এর বদলে, শুরু থেকেই।

---

## 🐛 গুরুতর বাগ ফিক্স — Class Routine Slot PATCH-DELETE Race Condition (৪র্থ instance) ✅ সম্পন্ন

### প্রেক্ষাপট
Notification/Habit PATCH-DELETE race condition ফিক্স করার পরে
ব্যবহারকারী "Next" নির্দেশ দেওয়ায় একই "existence check থাকা সত্ত্বেও
read-then-write" বাগ ক্লাসের আরও instance খোঁজা হয়েছে। `app/api/
routine/[slotId]/route.ts` (Class Routine Slot update/delete)
রিভিউ করে একই প্যাটার্ন পাওয়া গেছে।

### কোড রিভিউ পদ্ধতি ও জটিলতা
এই endpoint টা আগের তিনটা instance (Admin Ban, Notification, Habit)
থেকে একটু বেশি জটিল ছিল — শুধু existence+ownership check-then-write
ছিল না, PATCH এ `startTime`/`endTime` এর order validation ("শেষ
সময় শুরুর সময়ের পরে হতে হবে") এর জন্য বিদ্যমান রো এর `startTime`/
`endTime` মান read করে ব্যবহার করা হয়:
```ts
const slot = await prisma.routineSlot.findUnique({ where: { id: slotId } });
// ... existence+ownership check ...
const effectiveStartTime = startTime !== undefined ? startTime : slot.startTime;
const effectiveEndTime = endTime !== undefined ? endTime : slot.endTime;
if ((startTime !== undefined || endTime !== undefined) && effectiveStartTime >= effectiveEndTime) {
  return 400;
}
await prisma.routineSlot.update({ where: { id: slotId }, data: {...} });  // ⚠️ guard নেই
```

### লাইভ প্রুফ
concurrent `PATCH`+`DELETE` একই স্লটে পাঠিয়ে ১৫ iteration এ ৩টা
সরাসরি ৫০০ crash প্রমাণিত হয়েছে:
```
prisma:error
Invalid `prisma.routineSlot.update()` invocation
An operation failed because it depends on one or more records that
were required but not found. No record was found for an update.
    at app/api/routine/[slotId]/route.ts:54:44
{ code: 'P2025', ... }
```

### ফিক্সের ডিজাইন সিদ্ধান্ত — কেন শুধু updateMany() যথেষ্ট না
Notification/Habit এর ফিক্স (শুধু `updateMany({ where: { id, userId
} })`) এখানে সরাসরি প্রযোজ্য না — কারণ validation এর জন্য read
প্রয়োজন, আর সেই read ও পরের write এর মাঝে যদি স্লট ডিলিট হয়ে যায়
তাহলে ভুল (stale) ডেটার ভিত্তিতে ভ্যালিডেশন হতে পারতো (যদিও এক্ষেত্রে
আসলে "delete হয়ে গেছে" মানে update() নিজেই fail করতো — কিন্তু
principle টা গুরুত্বপূর্ণ: যেকোনো endpoint যেটা existing-row-read
এর উপর নির্ভরশীল validation করে, সেই read+validate+write পুরোটাই
atomic হওয়া উচিত)। তাই CSV Bulk Question Upload এর established
সমাধান ৩খ (heterogeneous row data + read-then-validate-then-write
প্রয়োজন হলে `$transaction` + `SELECT ... FOR UPDATE`) এখানে প্রয়োগ
করা হয়েছে:
```ts
updated = await prisma.$transaction(async (tx) => {
  const lockedSlot = await tx.$queryRaw<RoutineSlot[]>`
    SELECT * FROM "routine_slots" WHERE id = ${slotId} AND "userId" = ${session.user.id} FOR UPDATE
  `;
  if (lockedSlot.length === 0) throw new Error("SLOT_NOT_FOUND");
  const slot = lockedSlot[0];
  // ... validation slot এর ভ্যালু দিয়ে, একই transaction এর ভেতরে ...
  return tx.routineSlot.update({ where: { id: slotId }, data: {...} });
});
```
DELETE endpoint এ কোনো read-then-validate দরকার ছিল না (শুধু
existence+ownership+delete), তাই সেখানে সরল `deleteMany({ where: {
id, userId } })` ব্যবহার করা হয়েছে (Notification/Habit এর মতো
established সহজ প্যাটার্ন)।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: ১৫ iteration এ ৩টা crash reproduce হয়েছে।
- Fix এর পরে (dev server rebuild করে): একই টেস্ট ২৫ iteration এ
  বাড়িয়ে চালিয়ে **০টা crash** কনফার্ম হয়েছে — race জেতা ক্ষেত্রে
  সবসময় সঠিকভাবে ৪০৪ রিটার্ন হয়েছে।

### Regression/Validation/Authorization টেস্ট (১৩/১৩ assertion পাস)
1. Normal label PATCH।
2. Normal startTime/endTime PATCH (valid range)।
3. Invalid time range (নতুন দেওয়া দুই ফিল্ড দিয়ে) → ৪০০।
4. শুধু `endTime` পাঠিয়ে বিদ্যমান `startTime` এর সাথে conflict হলে
   ৪০০ — এটাই read-existing-row validation এর সরাসরি টেস্ট, ফিক্সের
   পরেও এই লজিক ঠিকভাবে (atomic transaction এর ভেতর থেকে) কাজ করছে
   কনফার্ম করা হয়েছে।
5. খালি label → ৪০০।
6. Invalid dayOfWeek → ৪০০।
7. Non-existent slotId → ৪০৪।
8. অন্য ইউজারের slot এ PATCH → ৪০৪।
9. Unauthenticated → ৪০১।
10. Delete-এর-পরে-আবার-delete → ৪০৪।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন (`$transaction`/
   `$queryRaw<RoutineSlot[]>` টাইপিং সহ কোনো error নেই)।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression/
   validation/authorization টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে ডিলিট করা হয়েছে (cascade এ তাদের
   `RoutineSlot` ও মুছে গেছে)। psycopg2 দিয়ে সরাসরি চেক করে
   (`users.email LIKE '%routinerace%' OR '%routineregr%'`,
   `routine_slots` টেবিলের count) কোনো leftover নেই ও টেবিল সম্পূর্ণ
   খালি ভেরিফাই করা হয়েছে। মূল seeded content (185 topics, 349
   questions) অক্ষত থাকা কনফার্ম করা হয়েছে।

### নতুন test script
`scripts/test-routine-patch-delete-race.py` (মূল আবিষ্কার+
ভেরিফিকেশন, ১৫→২৫ iteration এ আপডেট করে fix আগে-পরে চালানো হয়েছে),
`scripts/test-routine-regression.py` (১৩টা assertion, পুনরায়
ব্যবহারযোগ্য)।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/
Role-Change, Admin Notification Broadcast, Admin CSV Bulk Question
Upload, Study Plan Background Chunk Generation, Reading Room
Multi-Active-Session, Reading Room Heartbeat vs Leave,
Notification/Habit PATCH-DELETE, **Class Routine Slot PATCH-DELETE
(নতুন — established "existence check-then-write" ক্লাসের ৫ম
instance এই সেশনে, প্রথমবার read-then-validate-then-write জটিলতা
সহ যেটার জন্য সমাধান ৩ক (atomic INSERT/updateMany) যথেষ্ট ছিল না,
সমাধান ৩খ (transaction+FOR UPDATE) লাগলো)**।

established বাগ ক্লাস #২ ("existence check-then-write") এর জন্য
এখন দুইটা সাব-সমাধান টেমপ্লেট স্পষ্টভাবে established হলো:
- **সরল সমাধান** (কোনো read-then-validate দরকার নেই, শুধু existence+
  ownership+write): `updateMany()`/`deleteMany({ where: { id,
  userId } })` — Notification, Habit এ ব্যবহৃত।
- **জটিল সমাধান** (বিদ্যমান রো এর ভ্যালু read করে validation করা
  প্রয়োজন): `$transaction` + `SELECT ... FOR UPDATE` — Routine Slot,
  CSV Bulk Question Upload এ ব্যবহৃত।

ভবিষ্যতে নতুন কোনো PATCH/DELETE endpoint লেখার সময় প্রথমে চেক করা
উচিত এটা কোন ক্যাটাগরিতে পড়ে, তারপর যথাযথ টেমপ্লেট প্রয়োগ করা উচিত।

---

## 🐛 গুরুতর বাগ ফিক্স — User Settings vs Delete Account Race Condition (৭টা endpoint) ✅ সম্পন্ন

### প্রেক্ষাপট
Class Routine Slot race condition ফিক্স করার পরে ব্যবহারকারী "Next"
নির্দেশ দেওয়ায় একই bug class এর নতুন কোণ থেকে খোঁজা হয়েছে — এবার
admin/other-user ownership মিশ্রিত endpoint না, বরং "ইউজার নিজে
নিজের রিসোর্স আপডেট করছে এবং সেই একই ইউজার concurrent-ভাবে নিজের
অ্যাকাউন্ট ডিলিট করে ফেলতে পারে" এই নতুন angle থেকে `grep -rln
"prisma.user.update" app/api/user/` দিয়ে স্ক্যান করা হয়েছে।

### কোড রিভিউ পদ্ধতি
৭টা ফাইল পাওয়া গেছে যেখানে `prisma.user.update` ব্যবহার হয়:
`profile`, `exam-date`, `target-gpa`, `ai-tutor-mode`, `digest-
preference`, `change-password`, `onboarding`। সবগুলোতেই একই
প্যাটার্ন — কোনো existence check ছাড়াই সরাসরি:
```ts
await prisma.user.update({
  where: { id: session.user.id },
  data: { ... },
});
```
এখানে ownership guard আলাদা করে দরকার নেই (session.user.id দিয়েই
where clause, এটা নিজের রিসোর্স), কিন্তু আসল ঝুঁকি ভিন্ন: ইউজার
নিজে অন্য ট্যাব/ডিভাইস থেকে concurrent `POST /api/user/delete-
account` কল করে একই মুহূর্তে নিজের অ্যাকাউন্ট ডিলিট করতে পারে।

### লাইভ প্রুফ
`deleteUserAccount()` (৩০+টা টেবিল cascade delete + study group
leave করে) সম্পূর্ণ হতে ~১.৫ সেকেন্ড সময় নেয়। প্রথমে barrier দিয়ে
simultaneous start করা টেস্টে কোনো crash ধরা পড়েনি (settings-update
সবসময় দ্রুত শেষ হয়ে যাচ্ছিল delete এর আগে)। timing tune করে
(settings-update কে ১.২ সেকেন্ড ইচ্ছাকৃত delay দিয়ে, যাতে সেটা
delete এর ~1.5s cascade-delete চলাকালীন সময়ে ঘটে) সমস্যাটা
নিশ্চিতভাবে reproduce করা হয়েছে — **২০/২০ (৫টা endpoint: profile,
exam-date, target-gpa, ai-tutor-mode, digest-preference) + ১০/১০
(change-password + onboarding) = মোট ৩০টা iteration এর সবগুলোতেই
সরাসরি ৫০০ crash reproduce হয়েছে**:
```
prisma:error
Invalid `prisma.user.update()` invocation
An operation failed because it depends on one or more records that
were required but not found. No record was found for an update.
Profile Update Error: Error [PrismaClientKnownRequestError]: ...
```
এটা এই সেশনের সবচেয়ে ব্যাপকভাবে reproduce হওয়া race condition (১০০%
crash rate যখন timing ঠিকভাবে টিউন করা হয়) — কারণ delete-account
এর ধীরগতি (cascade delete) স্বাভাবিকভাবেই একটা বড় race window তৈরি
করে।

### ফিক্স
সব ৭টা endpoint এ `update()` এর বদলে established atomic
`updateMany({ where: { id: session.user.id } })` claim প্যাটার্ন
প্রয়োগ করা হয়েছে:
```ts
const claimResult = await prisma.user.updateMany({
  where: { id: session.user.id },
  data: { ... },
});
if (claimResult.count === 0) {
  return NextResponse.json(
    { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
    { status: 404 }
  );
}
```
`profile` endpoint এ updated data ফেরত দেওয়ার জন্য (আগে `update()`
এর রিটার্ন ভ্যালু ব্যবহার হতো) `findUnique` (non-throwing) দিয়ে
fresh fetch করা হয়েছে। `change-password` এ read (passwordHash
verify) ও bcrypt hash generation এর পরে write এর জন্যও একই
`updateMany()` claim যথেষ্ট ছিল — এখানে Routine Slot এর মতো কোনো
read-existing-value validation নেই (শুধু existence guard দরকার,
`$transaction`+`FOR UPDATE` এর জটিলতা লাগেনি)।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: timing-tuned টেস্টে ৩০/৩০ iteration এর সবগুলোতেই
  crash reproduce হয়েছে।
- Fix এর পরে (dev server rebuild করে): একই টেস্ট আবার চালিয়ে
  **০/৩০ crash** কনফার্ম হয়েছে — সব ক্ষেত্রে সঠিকভাবে ৪০৪ রিটার্ন
  হয়েছে।

### Regression টেস্ট (১৬/১৬ assertion পাস)
সব ৭টা endpoint এর normal (non-race) flow: profile name update
(+invalid name এ ৪০০), exam-date update, target-gpa update+value
verify (+invalid range এ ৪০০), ai-tutor-mode update+value verify,
digest-preference update+GET দিয়ে persist ভেরিফাই, change-password
(নতুন পাসওয়ার্ড দিয়ে re-login কাজ করা পর্যন্ত ভেরিফাই করা),
onboarding update, unauthenticated ব্লক (৪০১)।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে ডিলিট করা হয়েছে (রেস টেস্টে
   concurrent থ্রেড নিজেই delete করেছে, regression টেস্টে ম্যানুয়ালি)।
   psycopg2 দিয়ে সরাসরি চেক করে (`users.email LIKE '%profiledelrace%'
   OR '%cponbrace%' OR '%usersettregr%'`) কোনো leftover নেই ভেরিফাই
   করা হয়েছে (সব ০), মূল seeded content অক্ষত।

### নতুন test script
`scripts/test-profile-update-delete-account-race.py` (প্রাথমিক
barrier-based, timing মেলেনি বলে false-negative দিয়েছিল),
`scripts/test-profile-update-delete-account-race2.py` (মূল
আবিষ্কার+ভেরিফিকেশন, ১.২s delay-tuned টাইমিং সহ, fix আগে-পরে দুইবার
চালানো হয়েছে, ৫টা endpoint কভার করে), `scripts/test-changepassword-
onboarding-race.py` (বাকি ২টা endpoint কভার করে), `scripts/test-
user-settings-regression.py` (১৬টা assertion, পুনরায় ব্যবহারযোগ্য)।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/
Role-Change, Admin Notification Broadcast, Admin CSV Bulk Question
Upload, Study Plan Background Chunk Generation, Reading Room
Multi-Active-Session, Reading Room Heartbeat vs Leave,
Notification/Habit PATCH-DELETE, Class Routine Slot PATCH-DELETE,
**User Settings vs Delete Account (নতুন — established "existence
check-then-write" ক্লাসের সবচেয়ে ব্যাপক ও সহজে reproduce হওয়া
instance, ৭টা endpoint একসাথে একই root cause এ ভুগছিল)**।

এই bug hunt থেকে একটা গুরুত্বপূর্ণ পর্যবেক্ষণ নথিভুক্ত করা হলো:
**যেসব endpoint নিজের (self) রিসোর্স নিয়ে কাজ করে (কোনো আলাদা
resourceId parameter ছাড়া, শুধু `session.user.id`), সেগুলোও
"existence check-then-write" রেস কন্ডিশনের ঝুঁকিতে থাকে যদি সেই
একই ইউজার নিজের অ্যাকাউন্ট concurrent-ভাবে ডিলিট করতে পারে (Delete
Account ফিচার থাকা যেকোনো প্ল্যাটফর্মে এটা সবসময় প্রাসঙ্গিক)। এই
প্যাটার্নের endpoint লেখার সময় ডিফল্টভাবে `updateMany({ where: {
id: session.user.id } })` ব্যবহার করা উচিত `update()` এর বদলে,
এমনকি যদি মনে হয় "ownership নিয়ে চিন্তার কিছু নেই কারণ এটা নিজের
রিসোর্স" — কারণ ঝুঁকিটা ownership এর না, existence এর।

---

## 🐛 গুরুতর বাগ ফিক্স — Forum Post GET/DELETE/Resolve Race Condition ✅ সম্পন্ন

### প্রেক্ষাপট
User Settings vs Delete Account race condition ফিক্স করার পরে
ব্যবহারকারী "Next" নির্দেশ দেওয়ায় multi-actor ইন্টারঅ্যাকশন বেশি এমন
এলাকা (Forum, Flashcard Deck) খোঁজা হয়েছে — এখানে author, অন্য
পাঠক, ও admin একসাথে একই resource এ কাজ করতে পারে বলে race
condition এর সম্ভাবনা তুলনামূলক বেশি।

### আকর্ষণীয় আবিষ্কার — একটা "আগের ফিক্স" নিজেই অসম্পূর্ণ ছিল
`app/api/forum/posts/[postId]/route.ts` এর কোড কমেন্টেই আগে থেকে
P2025 বাগ ফিক্সের ইতিহাস লেখা ছিল:
```
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ GET endpoint অডিটে আবিষ্কৃত): আগে এখানে
// সরাসরি `prisma.forumPost.update()` কল করা হতো viewCount বাড়ানোর
// জন্য ... ফিক্স: আগে `findUnique` দিয়ে existence চেক করে ৪০৪
// রিটার্ন করা হচ্ছে, তারপরই `update` কল করা হচ্ছে।
```
কিন্তু এই "ফিক্স" নিজেই এখনো **অসম্পূর্ণ** ছিল — existence check
(`findUnique`) ও পরের `update()` এর মাঝে এখনো একটা read-then-write
window ছিল, যেটা atomic guard ছাড়া রয়ে গিয়েছিল। এটা ঠিক সেই একই
ভুল যেটা এই সেশনে Notification/Habit/Routine Slot এ ধরা পড়েছিল —
"existence check যোগ করা" ও "race-safe করা" দুইটা আলাদা জিনিস,
প্রথমটা করলেই দ্বিতীয়টা automatically হয়ে যায় না।

### কোড রিভিউ পদ্ধতি ও লাইভ প্রুফ
GET endpoint এ viewCount increment এর জন্য এখনো `findUnique()`
(existence check) → `update()` (আলাদা ধাপে, guard ছাড়া) প্যাটার্ন
ছিল। লাইভ টেস্টে নতুন পোস্ট তৈরি করে concurrent `GET`+`DELETE`
পাঠিয়ে ২০ iteration এ ৯টা সরাসরি ৫০০ crash প্রমাণিত হয়েছে:
```
prisma:error
Invalid `prisma.forumPost.update()` invocation
Foreign key constraint violated... (আসলে) An operation failed
because it depends on one or more records that were required but
not found. No record was found for an update.
    at app/api/forum/posts/[postId]/route.ts:40:39
```
একই ফাইলের `resolve` sub-route (`app/api/forum/posts/[postId]/
resolve/route.ts`) এও একই read-then-write প্যাটার্ন (existence+
ownership check তারপর আলাদা `update()`) প্রতিরোধমূলক রিভিউতে পাওয়া
গেছে।

### ফিক্স
GET endpoint এ viewCount বাড়ানোর জন্য atomic `updateMany({ where: {
id: postId } })` claim ব্যবহার করা হয়েছে (matched 0 হলে ৪০৪), তারপর
আলাদাভাবে `findUnique` দিয়ে replies/votes সহ পুরো ডেটা fetch করা
হয়েছে — কারণ Prisma `updateMany()` কোনো `include` সাপোর্ট করে না
(শুধু `{ count: number }` রিটার্ন করে), তাই relations সহ পুরো object
দরকার হলে দুই ধাপে ভাগ করতে হয়:
```ts
const claimResult = await prisma.forumPost.updateMany({
  where: { id: postId },
  data: { viewCount: { increment: 1 } },
});
if (claimResult.count === 0) return 404;
const post = await prisma.forumPost.findUnique({
  where: { id: postId },
  include: { user: {...}, replies: {...}, votes: {...} },
});
if (!post) return 404; // অত্যন্ত ছোট window এ viewCount বাড়ানোর ঠিক পরেই delete হলে
```
DELETE endpoint এ `deleteMany()` (idempotent-নিরাপদ, double-delete
এও crash করে না)। Resolve endpoint এ `updateMany({ where: { id,
userId } })` — existence ও ownership চেক একসাথে একই where ক্লজে
atomic ভাবে হয়ে যায়।

### লাইভ multi-iteration concurrency টেস্ট (fix এর আগে-পরে দুটোই)
- Fix এর আগে: ২০ iteration এ ৯টা crash reproduce হয়েছে (কিছু
  iteration স্প্যাম ফিল্টারে বাদ পড়েছিল, বাকিগুলোতে consistent
  crash)।
- Fix এর পরে (dev server rebuild করে): একই টেস্ট চালিয়ে যতগুলো
  post তৈরি হয়েছে তার সবগুলোতে **০টা crash** কনফার্ম হয়েছে — race
  জেতা ক্ষেত্রে সঠিকভাবে ৪০৪ রিটার্ন হয়েছে।

### Regression/Authorization টেস্ট (১২/১২ assertion পাস)
Normal post create, resolve (own post) toggle true/false, non-
existent postId এ ৪০৪, অন্য ইউজারের post এ resolve করলে ৪০৪,
unauthenticated ব্লক (৪০১), normal GET (viewCount সহ পুরো ডেটা
রিটার্ন), non-existent post GET এ ৪০৪, delete (own), delete-এর-
পরে-GET এ ৪০৪।

এছাড়া Forum Best-Answer endpoint (`app/api/forum/replies/[replyId]/
best-answer/route.ts`, জটিল XP-double-award প্রতিরোধ লজিক সহ, এই
রাউন্ডে কোনো পরিবর্তন করা হয়নি) একটা quick smoke test দিয়ে অক্ষত
আছে ভেরিফাই করা হয়েছে — কারণ এই ফাইলে `prisma.forumReply.update()`
ও `prisma.forumPost.update()` (isResolved সেট করার জন্য) আছে, কিন্তু
এখানে ইতিমধ্যে atomic `updateMany({ where: { id, bestAnswerXpAwarded:
false } })` claim pattern (XP-double-award অডিট থেকে) ব্যবহৃত হচ্ছে
যেটা যথেষ্ট defensive, তাই এই রাউন্ডে পরিবর্তনের দরকার হয়নি (শুধু
রিভিউ ও smoke-test verify করা হয়েছে)।

### Checkpoint pattern সম্পূর্ণ
1. `pnpm exec tsc --noEmit` — ক্লিন।
2. `rm -rf .next && pnpm build` — সফল, সব ১৪৭টা পেজ কম্পাইল।
3. `echo "" | pnpm lint` — ক্লিন।
4. উপরে বর্ণিত multi-iteration লাইভ concurrency + regression/
   authorization টেস্ট।
5. **Test cleanup সম্পূর্ণ**: সব টেস্ট ইউজার আসল `POST /api/user/
   delete-account` endpoint দিয়ে ডিলিট করা হয়েছে (cascade এ তাদের
   `ForumPost`/`ForumReply` ও মুছে গেছে)। psycopg2 দিয়ে সরাসরি চেক
   করে (`users.email LIKE '%forumgetdelrace%' OR
   '%forumresolverace%' OR '%forumresolveother%' OR '%bestansowner%'
   OR '%bestansreplier%'`, `forum_posts` টেবিলের count) কোনো
   leftover নেই ও টেবিল সম্পূর্ণ খালি ভেরিফাই করা হয়েছে।

### নতুন test script
`scripts/test-forum-post-get-delete-race.py` (মূল আবিষ্কার+
ভেরিফিকেশন, fix আগে-পরে দুইবার চালানো হয়েছে), `scripts/test-forum-
resolve-race-regression.py` (১২টা assertion), `scripts/test-forum-
best-answer-quick-check.py` (best-answer smoke test, পুনরায়
ব্যবহারযোগ্য)।

### সারসংক্ষেপ — এই সেশন পর্যন্ত পাওয়া সব race-condition বাগ (আপডেট)
Forum Vote/Report creation, Task/StudyPlanItem/TopicProgress XP
double-award, Quiz Battle submit/end/start, Quiz Duel join/submit,
Content Report action, Mock Exam MCQ/CQ submit, Admission submit,
Live Exam submit, Study Pet lazy-create, Study Group/Habit/Custom
Question Set/PDF Chat capacity-bypass, Forum Best Answer XP farming,
Habit Tracker toggle, Peer Note Helpful Vote, Admin User Ban/
Role-Change, Admin Notification Broadcast, Admin CSV Bulk Question
Upload, Study Plan Background Chunk Generation, Reading Room
Multi-Active-Session, Reading Room Heartbeat vs Leave,
Notification/Habit PATCH-DELETE, Class Routine Slot PATCH-DELETE,
User Settings vs Delete Account, **Forum Post GET/DELETE/Resolve
(নতুন — established "existence check-then-write" ক্লাসের ৭ম
instance এই সেশনে, বিশেষভাবে উল্লেখযোগ্য কারণ এটা প্রমাণ করে একটা
"আগের বাগ ফিক্স" কমেন্ট থাকা কোডও পুনরায় অডিট করা প্রয়োজন — existence
check যোগ করা মানেই race-safe হয়ে যাওয়া না)**।

**নতুন established শিক্ষা**: কোনো ফাইলে "🐛 বাগ ফিক্স" কমেন্ট থাকলেই
সেই কোড সম্পূর্ণ নিরাপদ ধরে নেওয়া উচিত না — বিশেষত যদি সেই ফিক্স
"existence check যোগ করা" টাইপের (৪০৪ এর বদলে ৫০০ ঠিক করার জন্য)
হয়, কারণ এই ধরনের ফিক্স মূল P2025-instead-of-404 সমস্যাটা সমাধান
করে কিন্তু concurrent-race সমস্যাটা করে না (দুটো আলাদা bug, একই
error code)। ভবিষ্যতে "🐛 বাগ ফিক্স" কমেন্ট থাকা যেকোনো CRUD endpoint
এ যদি `findUnique()` + আলাদা `update()`/`delete()` প্যাটার্ন দেখা
যায় (এমনকি existence check থাকলেও), সেটাকে concurrency টেস্ট করে
যাচাই করা উচিত।

---

