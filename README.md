# 🎓 HSC Ultimate — Arena Monorepo

বাংলাদেশের HSC (বিজ্ঞান বিভাগ) ও অ্যাডমিশন পরীক্ষার্থীদের জন্য তৈরি অল-ইন-ওয়ান প্রস্তুতি প্ল্যাটফর্ম (**Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL + Capacitor Android**)।

---

## 📁 রেপোজিটরির গঠন

| ফোল্ডার | বিবরণ |
|---|---|
| [`hsc-ultimate/`](./hsc-ultimate) | মূল ওয়েব ও মোবাইল অ্যাপ্লিকেশন (১৩৫টি পেজ, ২১৪টি API রুট, ৬৭টি Prisma মডেল, ২০,০০০+ প্রশ্নের ভল্ট ও ১৭টি ভার্চুয়াল ল্যাব) |
| [`dev-local/`](./dev-local) | স্যান্ডবক্স বা লোকাল এনভায়রনমেন্টে এক কমান্ডে PostgreSQL 17, মাইগ্রেশন ও ডাটা সিডিং সেটআপ করার টুলিং |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | অটোমেটেড Lint, Type-check, Unit/Logic টেস্ট, সিকিউরিটি অডিট ও প্রোডাকশন বিল্ড CI |

---

## 🚀 লোকাল/স্যান্ডবক্সে দ্রুত চালু করার নিয়ম

```bash
# ১. লোকাল PostgreSQL + মাইগ্রেশন + সিড সেটআপ
bash dev-local/setup.sh

# ২. ডেভ সার্ভার চালু করুন
cd hsc-ultimate
npm run dev
```

---

## ☁️ Vercel + Supabase ডিপ্লয়মেন্ট

Vercel-এ ডিপ্লয় করার সময় **Settings → General → Root Directory** হিসেবে অবশ্যই `hsc-ultimate` নির্বাচন করুন। বিস্তারিত নির্দেশিকার জন্য দেখুন:
- [`hsc-ultimate/docs/VERCEL_SUPABASE_DEPLOY.md`](./hsc-ultimate/docs/VERCEL_SUPABASE_DEPLOY.md)
- [`hsc-ultimate/PROJECT_OVERVIEW.md`](./hsc-ultimate/PROJECT_OVERVIEW.md)
- [`hsc-ultimate/ARCHITECTURE.md`](./hsc-ultimate/ARCHITECTURE.md)
