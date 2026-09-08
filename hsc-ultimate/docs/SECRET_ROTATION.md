# 🔐 API Key ও Secret Rotation নির্দেশিকা

**কেন দরকার:** প্রজেক্টের `.env` ও `.env.local` ফাইল একবার একটা
**পাবলিক Google Drive লিংকে** শেয়ার হয়েছিল। যে কেউ ওই লিংক পেলে সব
credential দেখতে পেত। তাই প্রতিটা key নতুন করে তৈরি করা জরুরি।

> ✅ **যাচাই করা হয়েছে:** DB credential এখনো **সক্রিয়** — অর্থাৎ ফাঁস
> হওয়া মানগুলো এখনো কাজ করে। এটাই rotation জরুরি হওয়ার প্রমাণ।

---

## ✅ ইতিমধ্যে rotate করা হয়েছে (২০২৬-০৭-৩০)

এই দুটো স্থানীয়ভাবে জেনারেট হয়, কোনো dashboard লাগে না — তাই
স্বয়ংক্রিয়ভাবে বদলে দেওয়া হয়েছে:

| Secret | পদ্ধতি | যাচাই |
|---|---|---|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ✅ ৪৪ অক্ষর, base64 বৈধ |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` | `webpush.generateVAPIDKeys()` | ✅ web-push লাইব্রেরি গ্রহণ করেছে |

**প্রভাব যাচাই করা হয়েছিল rotate করার আগে:**
- ইউজার: ১ জন (শুধু আপনি) → আবার লগইন করতে হবে
- Push subscription: ০ → কিছুই ভাঙেনি
- অব্যবহৃত reset টোকেন: ০

rotate করার পর `pnpm dev` চালিয়ে যাচাই: landing **200**, login **200**,
dashboard **307** (auth guard কাজ করছে) ✅

---

## ⚠️ যেগুলো আপনাকে করতে হবে

এগুলোর জন্য সংশ্লিষ্ট provider এর ড্যাশবোর্ডে লগইন করা লাগে, তাই আমি
করতে পারিনি।

### ১. 🔴 Supabase — সবচেয়ে জরুরি
ডাটাবেজ পাসওয়ার্ড ফাঁস হয়েছে, আর এটা এখনো **সক্রিয়**।

1. [supabase.com/dashboard](https://supabase.com/dashboard) → আপনার প্রজেক্ট
2. **Settings → Database → Reset database password**
3. নতুন পাসওয়ার্ড কপি করে `.env.local` ও `.env` **দুটোতেই** আপডেট করুন:
   - `DATABASE_URL` (পোর্ট `6543`, pooled)
   - `DIRECT_URL` (পোর্ট `5432`, migration এর জন্য)
4. যাচাই: `pnpm check:secrets` তারপর `pnpm db:seed` (বা যেকোনো স্ক্রিপ্ট)

### ২. AI Provider (৪টা)
| Provider | কোথায় |
|---|---|
| Groq | [console.groq.com/keys](https://console.groq.com/keys) |
| Mistral | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| Cerebras | [cloud.cerebras.ai](https://cloud.cerebras.ai) |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) |

প্রতিটায়: **পুরোনো key delete করুন**, নতুন তৈরি করে `.env.local` এ বসান।
শুধু নতুন বানালেই হবে না — পুরোনোটা মুছতে হবে।

### ৩. Resend (ইমেইল)
[resend.com/api-keys](https://resend.com/api-keys) → পুরোনো revoke,
নতুন key `RESEND_API_KEY` এ।

---

## 🛡️ ভবিষ্যতে ফাঁস এড়াতে

**`.gitignore` এ `.env*` আছে** ✅ — তাই git এ কখনো যাবে না।

কিন্তু ফাঁসটা হয়েছিল প্রজেক্ট **zip করে শেয়ার** করার সময়। ভবিষ্যতে
প্রজেক্ট শেয়ার করার আগে:

```bash
# .env ফাইল বাদ দিয়ে zip করুন
zip -r project.zip . -x "node_modules/*" ".next/*" ".env*"
```

---

## 🔍 যাচাই টুল — `pnpm check:secrets`

`scripts/check-secrets.ts` — **কোনো গোপন মান print করে না**, শুধু
বৈধতা যাচাই করে:

- সব প্রয়োজনীয় ভেরিয়েবল আছে ও placeholder নয়
- `NEXTAUTH_SECRET` ≥ ৩২ অক্ষর
- **VAPID কী-জোড়া প্রকৃতপক্ষে বৈধ** (web-push দিয়ে যাচাই — শুধু দৈর্ঘ্য নয়)
- `DATABASE_URL` ও `NEXTAUTH_URL` এর গঠন সঠিক

সমস্যা পেলে exit code **1** দেয়, তাই CI/pre-commit এ ব্যবহার করা যায়।

**টুলটা ভুয়া নয় প্রমাণিত:** ইচ্ছাকৃতভাবে `NEXTAUTH_SECRET` ছোট ও
VAPID key ভাঙা করে চালানো হয়েছে — দুটোই সঠিকভাবে ধরা পড়ে:
```
❌ 2টা সমস্যা:
   • NEXTAUTH_SECRET খুব ছোট (5 অক্ষর, ন্যূনতম ৩২ দরকার)
   • VAPID কী-জোড়া অবৈধ: Vapid private key should be 32 bytes long when decoded.
```
ঠিক করার পর: `✅ সব 16টা secret চেক পাস`

---

## রোটেশনের পর চেকলিস্ট

```bash
pnpm check:secrets   # সব secret বৈধ?
pnpm dev             # অ্যাপ চলে? লগইন কাজ করে?
```

Supabase পাসওয়ার্ড বদলানোর পর একবার `pnpm test:seed` ও চালিয়ে দেখবেন
DB সংযোগ ঠিক আছে কিনা।
