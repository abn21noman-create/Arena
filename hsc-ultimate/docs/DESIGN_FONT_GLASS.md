# টাইপোগ্রাফি + Glassmorphism প্রয়োগ (২০২৬-০৭-৩১)

ব্যবহারকারীর অনুমোদন পেয়ে **দুটো পরিবর্তনই একসাথে** প্রয়োগ করা হয়েছে:
১. বাংলা ফন্ট Anek Bangla → **Noto Sans Bengali** (+ লাতিনে Inter)
২. **Glassmorphism সব জায়গায়** — গ্লোবাল aurora ব্যাকড্রপ + স্বচ্ছ কাচের কার্ড/nav

সবকিছু **লাইভ ব্রাউজারে মেপে** যাচাই করা — CSS ফাইল পড়ে নয়।

---

## ১. টাইপোগ্রাফি

### কী বদলাল

| | আগে | এখন |
|---|---|---|
| বডি (বাংলা) | Anek Bangla | **Noto Sans Bengali** (variable ১০০–৯০০) |
| বডি (লাতিন/সংখ্যা) | Anek Bangla | **Inter** (variable, opsz অক্ষ) |
| হেডিং h1–h4 | Anek Bangla ৭০০ | Inter + Noto Sans Bengali ৬০০–৯০০ |
| রেন্ডারিং | — | `kern`+`liga`, `optimizeLegibility`, `antialiased` |

ফলব্যাক ক্রম গুরুত্বপূর্ণ: **Inter আগে** থাকায় ইংরেজি অক্ষর ও সংখ্যা Inter এ
রেন্ডার হয়; Inter এ বাংলা গ্লিফ নেই বলে ব্রাউজার প্রতি-গ্লিফ ফলব্যাকে
বাংলা লেখা স্বয়ংক্রিয়ভাবে Noto Sans Bengali এ নেয়।

### কেন Noto Sans Bengali

dark mode এ stroke coverage ("কালি%") মাপা হয়েছিল — বেশি মানে বেশি স্পষ্ট:

| ফন্ট | কালি% | প্রস্থ |
|---|---|---|
| **Noto Sans Bengali** | **1.30%** ← সর্বোচ্চ | 1.00× |
| Anek Bangla (আগের) | 1.27% | 1.00× |
| Tiro Bangla | 1.18% | 0.96× |
| Baloo Da 2 | 1.16% | 0.96× |
| Mina | 1.12% | 1.01× |
| Hind Siliguri | 1.07% ← সর্বনিম্ন | 0.93× |

⚠️ **IBM Plex Sans Bengali ব্যবহার করা যায়নি** — Google Fonts এ সেটা নেই
(HTTP 404 দিয়ে যাচাই করা; শুধু Devanagari সংস্করণ আছে, HTTP 200)।

---

## ২. Glassmorphism

### মূল সমস্যা যা ঠিক করা হলো

glass এর CSS আগেও ছিল, কিন্তু **চোখে পড়ত না**। মেপে তিনটে কারণ পাওয়া গেল:

1. **কার্ডের পেছনে রঙিন কিছু ছিল না** — ব্যাকগ্রাউন্ড সমতল প্রায়-কালো, তাই
   blur করার মতো কিছুই ছিল না। `.aurora-bg` ইউটিলিটি ছিল কিন্তু dashboard সহ
   বেশিরভাগ পেজে ব্যবহারই হয়নি।
2. **কার্ড মাত্র ১২% স্বচ্ছ** ছিল (dark)।
3. **`backdrop-filter` কম্পিউটেড মান ছিল `none`** — নিচে দেখো, এটা একটা
   আসল বিল্ড-টুল বাগ।

### সমাধান

| | আগে (মাপা) | এখন (মাপা) |
|---|---|---|
| aurora | নেই (dashboard এ) | `body::before` fixed স্তর — **সব ৮০টা পেজে** |
| কার্ড স্বচ্ছতা (dark) | ১২% | **৩২%** (alpha 0.68) |
| কার্ড স্বচ্ছতা (light) | ০% (অস্বচ্ছ) | **১৪%** (alpha 0.86) |
| কার্ড blur | কম্পিউটেড `none` | **blur(30px) saturate(180%)** |
| sidebar/nav (dark) | ২০% স্বচ্ছ, blur 26px | ৩০% স্বচ্ছ, **blur 34px** |
| sidebar (light) | অস্বচ্ছ | ১০% স্বচ্ছ + blur 34px |
| কিনারার আলো | নেই | `inset 0 1px` highlight |

aurora `prefers-reduced-motion: no-preference` এ ৪০s এ ধীরে ভাসে — এত ধীর
যে পড়ার সময় নজর কাড়ে না।

---

## ৩. প্রয়োগ করতে গিয়ে ধরা পড়া ৩টা আসল বাগ

### বাগ ১ — Lightning CSS unprefixed `backdrop-filter` ফেলে দিচ্ছিল 🔴

**লক্ষণ:** কার্ডের কম্পিউটেড `backdrop-filter` = `none`, blur কাজই করছিল না।

**কারণ:** সোর্সে আমি দুটোই ম্যানুয়ালি লিখেছিলাম —
```css
backdrop-filter: blur(30px) saturate(180%);
-webkit-backdrop-filter: blur(30px) saturate(180%);
```
Turbopack এর Lightning CSS মিনিফায়ার **unprefixed লাইনটা ড্রপ করে দিচ্ছিল**,
শুধু `-webkit-` রাখছিল। বিল্ড আউটপুট গুনে প্রমাণ: সোর্সে ১১+১১, আউটপুটে
**১২ unprefixed vs ২৩ webkit**।

**ফিক্স:** ১১টা ম্যানুয়াল `-webkit-` লাইন সরিয়ে দেওয়া — Lightning CSS
নিজেই autoprefix করে। এখন আউটপুটে **২৩ + ২৩**, দুটোই আছে।

> 📌 শিক্ষা: এই প্রজেক্টে CSS এ ম্যানুয়াল ভেন্ডর-প্রিফিক্স **লিখবেন না** —
> বিল্ড টুল নিজেই করে, ম্যানুয়াল লিখলে উল্টো unprefixed টা হারায়।

### বাগ ২ — light mode এ `--muted-foreground` পূর্ব-বিদ্যমান WCAG ফেল 🔴

**glass এর কারণে নয় — আগে থেকেই ভাঙা ছিল**, শুধু কেউ মাপেনি।

`oklch(0.556 0 0)` = `#737373`। মাপা কনট্রাস্ট:
- পেজ ব্যাকগ্রাউন্ডে **৪.৩৪:১** — WCAG AA (৪.৫:১) **ফেল** (aurora যোগের আগেই)
- aurora যোগ করার পর নেমে যেত **৩.৮৩:১**

**ফিক্স:** দুই দিক থেকে —
1. `--muted-foreground` → `oklch(0.4962 0 0)` = `#626262`
   (Chromium দিয়ে oklch→sRGB কনভার্সন যাচাই করা: 0.4962 → 98)
2. light aurora এর opacity ~৩৫% কমানো (0.30/0.26/0.28/0.20 → 0.20/0.17/0.19/0.13)

**ফল (আসল পিক্সেল থেকে মাপা):**
- কার্ডের ভিতরে: **৫.৯৭–৬.০১:১** ✅
- aurora এর গাঢ়তম অংশে (কার্ডের বাইরে): **৫.১২:১** ✅

### বাগ ৩ — league কার্ডের ব্রোঞ্জ রঙ ঢাকা পড়ার ঝুঁকি

league tier কার্ডে inline গ্রেডিয়েন্ট থাকে (টিয়ারের রঙ থেকে তৈরি)। glass
এর border/backdrop সেটা ধূসর করে দিচ্ছিল — ছাত্র নিজের টিয়ার চিনতে পারত না।

**ফিক্স:** `.glass-surface[style*="linear-gradient"]` সিলেক্টরে backdrop বন্ধ
ও border নিরপেক্ষ। স্ক্রিনশটে যাচাই করা — ব্রোঞ্জ কার্ড রঙিনই আছে ✅

---

## ৪. নতুন যাচাই স্ক্রিপ্ট — `pnpm verify:design`

`scripts/verify-font-glass.py` — **চলন্ত ব্রাউজারের কম্পিউটেড ভ্যালু ও আসল
রেন্ডার করা পিক্সেল** থেকে মাপে, CSS ফাইল পড়ে নয়। dark ও light দুই মোডেই
১৪টা করে চেক:

```
── ফন্ট ──
✅ Inter body তে আছে
✅ Noto Sans Bengali body তে আছে
✅ পুরনো Anek Bangla সরানো হয়েছে
✅ h1 ও Noto Sans Bengali পাচ্ছে
✅ Noto Sans Bengali আসলেই ডাউনলোড+লোড হয়েছে   ← document.fonts দিয়ে
✅ font-feature-settings প্রয়োগ ("kern", "liga")
✅ -webkit-font-smoothing: antialiased
── Glassmorphism ──
✅ body::before (aurora) আঁকা হচ্ছে
✅ aurora fixed + z-index -1
✅ aurora গ্রেডিয়েন্ট আছে
✅ কার্ডে backdrop blur সক্রিয় (blur(30px) saturate(1.8))
✅ কার্ড স্বচ্ছ (dark alpha 0.68 · light alpha 0.86)
✅ কিনারায় inset আলোর রেখা আছে
── কনট্রাস্ট (আসল পিক্সেল, worst case) ──
✅ dark  সবচেয়ে খারাপ muted কনট্রাস্ট 6.18:1
✅ light সবচেয়ে খারাপ muted কনট্রাস্ট 5.12:1
```

### স্ক্রিপ্ট লিখতে গিয়ে নিজের ৪টা ভুল (সততার খাতিরে নথিবদ্ধ)

ব্যাকগ্রাউন্ড পিক্সেল শনাক্ত করা প্রত্যাশার চেয়ে কঠিন ছিল:

| পদ্ধতি | ফল | কেন ভুল |
|---|---|---|
| "সবচেয়ে ঘন রঙ = bg" | ফল্স **১.০০:১** | aurora গ্রেডিয়েন্টে প্রতি পিক্সেল আলাদা, টেক্সটই জিতে যেত |
| "রঙের দূরত্ব দিয়ে ছাঁকা" | ফল্স **১.৫০:১** | গ্লিফের anti-alias পিক্সেল ধরা পড়ত |
| "মোটের ≥২% = bg" | ফল্স **১.০০:১** | ঘন লেখায় টেক্সট নিজেই ২% পেরিয়ে যায় |
| **দূরত্ব ≥৯০ ও দখল ≥২% — দুটোই** | ✅ সঠিক | anti-alias প্রথম শর্তে আটকায়, টেক্সট দ্বিতীয়তে |

আরও দুটো টুলিং ফিক্স:
- `parse_rgb()` — কম্পিউটেড রঙ `lab(...)`/`oklch(...)` ফরম্যাটে আসে; নিজে পার্স
  করতে গিয়ে ক্র্যাশ করেছিল। এখন canvas দিয়ে **ব্রাউজারকেই** কনভার্ট করতে বলা হয়।
- `clip=` দিয়ে স্ক্রিনশট এই হেডলেস-শেলে সবসময় টাইমআউট করে (৩০s ও ৬০s দুটোতেই
  মাপা)। এখন পুরো ভিউপোর্ট নিয়ে PIL দিয়ে crop।

---

## ৫. চালানো টেস্ট

| টেস্ট | ফল |
|---|---|
| `tsc --noEmit` | ✅ ক্লিন |
| `eslint .` | ✅ ক্লিন (exit 0) |
| `pnpm test:logic` | ✅ ১৬২/১৬২ assertion |
| `pnpm verify:design` (নতুন) | ✅ dark ও light দুই মোডে সব পাস |
| স্ক্রিনশট ডেস্কটপ | ✅ dashboard/learn/leaderboard × dark/light (৬টা) |
| স্ক্রিনশট মোবাইল ৩৯০×৮৪৪ | ✅ dashboard dark |

### যা চালানো যায়নি (সততার সাথে)

- **`pnpm build`** — ২GB RAM সীমায় কার্নেল OOM। কোডের দোষ নয়, আগেও প্রমাণিত।
- **`pnpm test:mobile` (২১টা চেক)** — তিনবার চেষ্টা করা হয়েছে, প্রতিবারই
  dev server কে OOM এ ফেলেছে (স্যুটটা অনেকগুলো পেজ পরপর কম্পাইল করায়)।
  বদলে সরাসরি মোবাইল স্ক্রিনশট নিয়ে চাক্ষুষ যাচাই করা হয়েছে —
  bottom-nav কাচ ঠিক, কার্ড ওভারল্যাপ নেই, বাংলা স্পষ্ট। বেশি RAM এর
  পরিবেশে `ALL=1 pnpm test:mobile` চালানো উচিত।

---

## ৬. পরিবর্তিত ফাইল

- `app/layout.tsx` — `Anek_Bangla` → `Inter` + `Noto_Sans_Bengali` (×২)
- `app/globals.css`:
  - `@theme inline` — `--font-sans` এর **circular রেফারেন্স ফিক্স**
    (আগে `--font-sans: var(--font-sans)`, নিজের দিকেই ইশারা → কখনো resolve হতো না)
  - `:root` — `--font-ui` / `--font-ui-heading` স্ট্যাক
  - `:root` — `--muted-foreground` WCAG ফিক্স
  - `body` — `font-feature-settings` / `text-rendering` / smoothing
  - `body::before` + `html.dark body::before` — গ্লোবাল aurora
  - `@keyframes aurora-breathe` + reduced-motion গার্ড
  - `.glass-surface` / `.dark .glass-surface` — নতুন স্বচ্ছতা ও blur
  - `.glass-surface[style*="linear-gradient"]` — league কার্ড রক্ষা
  - `@supports not (...)` — পুরনো ব্রাউজারে অস্বচ্ছ ফলব্যাক
  - `.glass-nav` dark/sidebar — বেশি স্বচ্ছতা
  - ১১টা ম্যানুয়াল `-webkit-backdrop-filter` লাইন সরানো
- `scripts/verify-font-glass.py` — নতুন
- `package.json` — `verify:design` স্ক্রিপ্ট
- `screenshots/after/` — ৬টা ডেস্কটপ + ১টা মোবাইল
