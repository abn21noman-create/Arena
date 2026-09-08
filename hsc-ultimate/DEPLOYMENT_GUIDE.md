# 🚀 HSC Ultimate — ফুল লাইভ ও অটো-আপডেট ডিপ্লয়মেন্ট গাইড

আপনার এই রিপোজিটরিতে **Next.js 16, Prisma ORM, PostgreSQL এবং ২০,০০০+ মেগা প্রশ্নভাণ্ডার** প্রস্তুত রয়েছে। নিচের ধাপগুলো অনুসরণ করলে GitHub-এ প্রতিটি `git push` এর সাথে সাথে সম্পূর্ণ ওয়েবসাইট এবং ডাটাবেজ স্বয়ংক্রিয়ভাবে লাইভ আপডেট হয়ে যাবে।

---

## ⚡ ১. ফ্রি ক্লাউড ডাটাবেজ সেটআপ (Neon.tech - ১ মিনিট)

1. [Neon.tech](https://neon.tech/) এ যান এবং **Sign Up** করুন।
2. **Create Project** এ ক্লিক করে প্রজেক্ট নাম দিন (যেমন: `hsc-ultimate`).
3. ড্যাশবোর্ড থেকে **Connection String** কপি করুন:
   ```env
   postgresql://neondb_owner:password@ep-xyz.aws.neon.tech/neondb?sslmode=require
   ```

---

## 🌐 ২. Vercel-এ লাইভ ডিপ্লয় ও GitHub অটো-সিঙ্ক (২ মিনিট)

1. [Vercel.com](https://vercel.com/) এ গিয়ে আপনার GitHub অ্যাকাউন্ট দিয়ে লগইন করুন।
2. **Add New... ➜ Project** এ ক্লিক করে আপনার রিপোজিটরিটি সিলেক্ট করুন।
3. **Environment Variables** এ নিচের ভ্যালুগুলো দিন:
   - `DATABASE_URL` = ধাপ ১ থেকে পাওয়া Neon connection string
   - `NEXTAUTH_SECRET` = `hsc-ultimate-super-secure-production-jwt-token-2026-auth`
   - `NEXTAUTH_URL` = `https://your-project.vercel.app`
   - `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app`
4. **Deploy** বাটনে ক্লিক করুন।

---

## 🗄️ ৩. ক্লাউড ডাটাবেজে স্কিমা ও প্রশ্ন সিড করা (এককালীন কমান্ড)

আপনার টার্মিনালে ডাটাবেজ কানেকশন সেট করে নিচের কমান্ডটি রান করুন:

```bash
# লিনাক্স / ম্যাক / গিট ব্যাশ:
export DATABASE_URL="আপনার_ক্লাউড_পোস্টগ্রেস_কানেকশন_ইউআরএল"
sh scripts/deploy-production.sh
```

এই স্ক্রিপ্টটি স্বয়ংক্রিয়ভাবে:
- ✅ ক্লাউড ডাটাবেজে টেবিল ও রিলেশন তৈরি করবে (`prisma db push`)
- ✅ সকল বিষয়, অধ্যায় ও টপিক আপলোড করবে
- ✅ সকল সৃজনশীল (CQ) ও ভর্তি প্রশ্ন সিড করবে
- ✅ ২০,০০০+ MCQ ভল্টের ডাটা ভেরিফাই করবে

---

## 🔄 ৪. যেভাবে স্বয়ংক্রিয় লাইভ আপডেট কাজ করবে:

- **কোড পরিবর্তন / নতুন ফিচার:** লোকাল থেকে `git push origin main` করলেই Vercel স্বয়ংক্রিয়ভাবে বিল্ড করে লাইভ করে দেবে।
- **২০,০০০ MCQ প্রশ্নভাণ্ডার:** প্রশ্নগুলো `data/vault/` এ প্রি-কম্পাইল্ড ও ইনডেক্স করা থাকায় পুশ করার সাথে সাথে শূন্য ল্যাগ বা ডাউনটাইমে লাইভ সাইটে যুক্ত হয়ে যাবে।
