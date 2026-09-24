# Vercel + Supabase লাইভ ডিপ্লয় গাইড

> এই ডকটা `hsc-ultimate/vercel.json` আর `DEPLOYMENT_GUIDE.md`-এর সাথে মিলিয়ে লেখা।
> `DEPLOYMENT_GUIDE.md`-এ Neon-এর কথা আছে — Supabase ব্যবহার করলে এটাই অনুসরণ করুন।

---

## ০. `vercel.json`-এ যা ঠিক করা হয়েছে

### ০.১ `prisma db push --accept-data-loss` সরানো হয়েছে ✅

**আগে:** `buildCommand` ছিল

```
node scripts/generate-prisma.mjs && npx prisma db push --accept-data-loss && next build
```

অর্থাৎ **প্রতিটা deploy-এ** production ডেটাবেসে `db push` চলত, আর
`--accept-data-loss` দিলে Prisma বিনা প্রশ্নে **কলাম ও ডেটা ড্রপ করতে পারে** —
বিশেষত এই রেপোতে, যার migration baseline নিজেই "reconstructed"।

**এখন:**

```
node scripts/generate-prisma.mjs && next build --webpack
```

মাইগ্রেশন এখন deploy pipeline-এর বাইরে, হাতে নিয়ন্ত্রণে — নিচের ধাপ ৩ দেখুন।

> **কেন `db push` বাদ:** রেপোতে ৩৩টা versioned migration আছে। `db push` আর
> migration একসাথে চললে দুটো আলাদা source-of-truth তৈরি হয়, আর `db push`
> অপ্রত্যাশিত ড্রপ করতে পারে।

> **কেন `--webpack`:** প্রজেক্টের নিজের `scripts/safe-build.sh`-ও
> `next build --webpack` ব্যবহার করে, আর `next.config.ts`-এ
> `experimental.webpackMemoryOptimizations` আছে। এই পথটাই যাচাই করা হয়েছে।

### ০.২ CORS হেডার সরানো হয়েছে ✅

**আগে:** `/api/(.*)`-এর জন্য `Access-Control-Allow-Origin: *` **সহ**
`Access-Control-Allow-Credentials: true`। এটা দ্বিগুণ সমস্যার:

1. **ব্রাউজার স্পেক অনুযায়ী অবৈধ** — wildcard origin-এর সাথে credentials
   পাঠানো নিষিদ্ধ, ব্রাউজার রিকোয়েস্টটাই বাতিল করে।
2. **অ্যাপের নিজের নীতির সাথে বিরোধী** — `proxy.ts` →
   `isTrustedMutationOrigin()` শুধু same-origin (এবং `NEXT_PUBLIC_APP_URL` /
   `NEXTAUTH_URL`) গ্রহণ করে; বাকি cross-origin mutation **403** পায়।

**এখন:** CORS ব্লক সম্পূর্ণ বাদ। এটি নিরাপদ, কারণ অ্যাপটা **same-origin only**:

- ওয়েব অ্যাপ নিজের হোস্ট থেকেই API ডাকে
- Capacitor/Android অ্যাপও `server.url` (= `https://hsc-ultimate.app`) থেকে
  পুরো ওয়েব অ্যাপ লোড করে — আলাদা origin নয়
- Server-to-server কলে (cron, webhook) `Origin` হেডার থাকেই না

অর্থাৎ CORS দরকার নেই, আর অ্যাপের নিজের origin guard-ই আসল সুরক্ষা।
`/api/(.*)`-এর জন্য wildcard CORS যোগ করার আগে এই দুটো নথি দেখুন:
[`docs/SECURITY_ABUSE_TESTING_2.md`](./SECURITY_ABUSE_TESTING_2.md),
`lib/request-security.ts`।

---

## ১. Vercel প্রজেক্ট সেটআপ

### 🔴 সবচেয়ে গুরুত্বপূর্ণ ধাপ — Root Directory

```
Settings ➜ General ➜ Root Directory  ➜  hsc-ultimate
```

**এটা না করলে ডিপ্লয় ফেল করবে।** কারণ রিপোর রুটে `package.json` নেই —
Next.js অ্যাপটা `hsc-ultimate/` সাবফোল্ডারে। রুটের `vercel.json` শুধু একটা
stub, আসল কনফিগ `hsc-ultimate/vercel.json`-এ।

### Framework

`Next.js` — অটো-ডিটেক্ট হয়ে যাবে।

### Regions

`hsc-ultimate/vercel.json`-এ আগে থেকেই আছে: `["sin1", "bom1"]`
(সিঙ্গাপুর + মুম্বাই) — বাংলাদেশের শিক্ষার্থীদের জন্য সবচেয়ে কম লেটেন্সি।

---

## ২. Environment Variables

Vercel ➜ Settings ➜ Environment Variables — **Production** (ও দরকার হলে Preview)।

### বাধ্যতামূলক

| নাম | মান কোথায় পাবেন |
|---|---|
| `DATABASE_URL` | Supabase ➜ Connect ➜ **Connection Pooling** (পোর্ট **6543**), শেষে `?pgbouncer=true` |
| `DIRECT_URL` | Supabase ➜ Connect ➜ **Direct connection** (পোর্ট **5432**) — migration-এর জন্য |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |

> ⚠️ `DATABASE_URL`-এ pooler (6543) আর `DIRECT_URL`-এ direct (5432) — এই দুটো
> আলাদা রাখা জরুরি। Serverless-এ pooler দরকার, কিন্তু migration চালাতে direct লাগে।

### ঐচ্ছিক — AI ফিচার

না দিলে অ্যাপ চলবে, শুধু AI Tutor / Doubt Solver কাজ করবে না।

| নাম |
|---|
| `GROQ_API_KEY` |
| `CEREBRAS_API_KEY` |
| `MISTRAL_API_KEY` |
| `OPENROUTER_API_KEY` |

### ঐচ্ছিক — ইমেইল ও পুশ

| নাম | কাজ |
|---|---|
| `RESEND_API_KEY` | Weekly digest ইমেইল |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push |
| `VAPID_PRIVATE_KEY` | Web Push |
| `VAPID_SUBJECT` | `mailto:` ঠিকানা |
| `CRON_SECRET` | Vercel Cron রুট সুরক্ষিত রাখতে |

পুশ key না থাকলে: `npx web-push generate-vapid-keys`

---

## ৩. Supabase ডেটাবেস প্রস্তুত করা

প্রথম deploy-এর **আগে**, আপনার নিজের মেশিন থেকে (Vercel-এর build-এ নয়):

```bash
cd hsc-ultimate

# ১. সরাসরি কানেকশন দিন (pooler নয় — migration-এর জন্য 5432 লাগে)
export DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
export DATABASE_URL="$DIRECT_URL"

# ২. স্কিমা তৈরি
npx prisma migrate deploy

# ৩. কনটেন্ট সিড (subjects → chapters → topics → MCQ/CQ/notes → badges)
npm run db:seed
npm run db:seed-questions
# ... README-র পূর্ণ তালিকা
```

### বিকল্প — `scripts/deploy-production.sh` ব্যবহার করবেন কি?

সেখানে একটা স্ক্রিপ্ট আছে যা "এক কমান্ডে সব" করে। কিন্তু **দুটো কারণে সাবধানে:**

1. এটি `prisma db push --skip-generate` ব্যবহার করে — migration নয়। অর্থাৎ
   আপনি যদি এটাও চালান আর অন্যদিকে `prisma migrate deploy`-ও চালান, ডেটাবেসে
   দুই জায়গা থেকে schema push হবে। **একটা পথ বেছে নিন**, দুটো নয়।
   (উপরে ০.১-এ `vercel.json` থেকে `db push` সরানো হয়েছে, তাই এই স্ক্রিপ্টই
   এখন একমাত্র জায়গা যেখানে `db push` আছে — এটাও badge ছাড়া রাখলে ভালো।)
2. স্ক্রিপ্টের শেষ ধাপ "20,000 MCQ vault" যাচাই করে দাবি করে, কিন্তু প্রকৃত
   seeded কনটেন্ট **৯০৮ MCQ** (`npm run test:seed`: ৬৮৮ core + ২২০ admission)
   + ৬৪ CQ। সংখ্যাটা মেলেনি বলে স্ক্রিপ্ট ফেল করলে আতঙ্কিত হবেন না।

migration-ভিত্তিক পথ (উপরের ধাপ ২ ও ৩) বেশি নিরাপদ, কারণ এটা deterministic
ও version-controlled।

### যাচাই

```bash
npx prisma migrate status      # সব migration applied
curl https://your-project.vercel.app/api/health
```

`/api/health` দেখানো উচিত:

```json
{ "status": "healthy", "checks": { "database": { "status": "up" } } }
```

`"database": "down"` এলে → `DATABASE_URL` ভুল, বা Supabase IP allowlist।

---

## ৪. ডিপ্লয়

Vercel GitHub-এ কানেক্ট করা থাকলে `main`-এ push করলেই অটো-ডিপ্লয়।

```bash
git push origin main
```

Vercel-এর সার্ভার থেকে GitHub ও Supabase দুটোই খোলা, তাই এটা কাজ করে —
আপনার লোকাল মেশিন থেকে কী কী reachable, তা এতে প্রভাব ফেলে না।

---

## ৫. ডিপ্লয়-পরবর্তী চেকলিস্ট

- [ ] `/` লোড হয়, আর লাইভ কাউন্ট দেখায় (এম-ড্যাশ নয়)
- [ ] `/register` দিয়ে একটা অ্যাকাউন্ট তৈরি হয়
- [ ] লগইন করে `/dashboard` খোলে
- [ ] `/api/health` → `"status": "healthy"`
- [ ] `/drill` খোলে (এই সেশনে ঠিক করা বাগ)

---

## ৬. ভবিষ্যতে লক্ষ রাখার বিষয়

- **`scripts/deploy-production.sh`** এখনো `prisma db push --skip-generate`
  ব্যবহার করে (উপরের ধাপ ৩-এর সতর্কতা দেখুন)। migration-ভিত্তিক পথে যাওয়ার
  সিদ্ধান্ত হলে এটাও `prisma migrate deploy`-এ বদলানো উচিত।
- **`X-XSS-Protection`** — আধুনিক ব্রাউজারে deprecated ও উপেক্ষিত; ক্ষতিকর
  নয়, তবে `Content-Security-Policy` (ইতিমধ্যে `next.config.ts`-এ
  `frame-ancestors 'self'` সহ আছে) আসল সুরক্ষা দেয়।
- **`cleanUrls: true`** — `/page.html` কে `/page`-এ রিডাইরেক্ট করে; Next.js
  রাউটিংয়ে এর কোনো প্রভাব নেই, নিরাপদ।

## আরও দেখুন

- [`DISASTER_RECOVERY.md`](./DISASTER_RECOVERY.md) — ব্যাকআপ ও restore
- [`RELEASE_READINESS.md`](./RELEASE_READINESS.md) — রিলিজ গেট
- [`../DEPLOYMENT_GUIDE.md`](../DEPLOYMENT_GUIDE.md) — মূল গাইড (Neon-ভিত্তিক)
