# লাইভ টেস্টিং গাইড

> সর্বশেষ পূর্ণ রান: **২০২৬-০৭-৩০** · সব টেস্ট আসল dev server + আসল
> Supabase DB + আসল লগইন সেশন দিয়ে চালানো (কোনো mock নেই)।

---

## কেন লাইভ টেস্ট

এই প্রজেক্টে ২০৬টা Python টেস্ট আগে থেকেই ছিল, কিন্তু বেশিরভাগ নির্দিষ্ট
বাগের regression guard। যেটা ছিল না: **"অ্যাপটা আসলে চলে কিনা"** —
একজন সত্যিকারের ছাত্র রেজিস্টার করে, লগইন করে, কুইজ দিয়ে, ফলাফল দেখে
পুরো পথটা হেঁটে আসতে পারে কিনা।

`pnpm build` এই পরিবেশে চালানো যায় না (২ GB RAM, কার্নেল OOM — বিস্তারিত
`docs/PROJECT_AUDIT_2026-07-29.md` এ)। তাই টাইপ-চেক (`tsc`) আর লিন্ট
(`eslint`) দিয়ে static যাচাই, আর নিচের স্ক্রিপ্টগুলো দিয়ে runtime যাচাই।

---

## কমান্ড

| কমান্ড | কী করে | সময় |
|---|---|---|
| `pnpm test:logic` | ১৬২টা pure-logic assertion (DB লাগে না) | ~২ সেকেন্ড |
| `npm run test:seed` | seed ফাইলের ৬৮৮ core + ২২০ admission MCQ এবং ৬৪ CQ অখণ্ডতা | ~২ সেকেন্ড |
| `npm run check:secrets` | ১৬টা secret/env চেক (গোপন মান print করে না) | ~২ সেকেন্ড |
| `npm run verify:notes` | ১৮৫টা টপিক-নোটের KaTeX ও markdown যাচাই + কভারেজ | ~৫ সেকেন্ড |
| `npm run verify:questions` | live ৬৮৮টা core MCQ-এর গঠন ও correctAnswer যাচাই | ~৫ সেকেন্ড |
| `pnpm shots` | আসল ব্রাউজারে পেজ স্ক্রিনশট (dark+light) — চাক্ষুষ QA | ~১ মিনিট/পেজ |
| `pnpm test:mobile` | ৩৯০×৮৪৪ এ ওভারফ্লো, nav-ওভারল্যাপ, ট্যাপ-টার্গেট | ~৮ মিনিট |
| `pnpm test:ai` | ৬টা AI প্রোভাইডার এন্ডপয়েন্ট লাইভ হেলথ-চেক | ~১০ সেকেন্ড |
| `pnpm test:e2e` | পূর্ণ ছাত্র-যাত্রা (রেজিস্টার→লগইন→কুইজ→ফলাফল) | ~৭ মিনিট |
| `pnpm test:api` | ৪৭ GET + সব বড় POST ফ্লো + authz + negative | ~২০ মিনিট |
| `pnpm test:pages` | ৮০টা পেজ রুট রেন্ডার | ~৪০ মিনিট |
| `pnpm clean:test-data` | টেস্টে তৈরি সব ডেটা মুছে অ্যাকাউন্ট রিসেট | ~৫ সেকেন্ড |

`test:e2e`, `test:api`, `test:pages` চালাতে dev server লাগে
(`pnpm dev`) — তবে স্ক্রিপ্টগুলো নিজেরাই server চালু/রিস্টার্ট করতে পারে।

### দরকারি env সুইচ

```bash
SKIP_GET=1 pnpm test:api        # ভারী GET সুইপ বাদ (~৪ মিনিটে শেষ)
ONLY='/dashboard,/practice' pnpm test:pages   # নির্দিষ্ট রুট
RESTART_EVERY=3 pnpm test:pages # কত রুট পর প্রোঅ্যাকটিভ রিস্টার্ট
```

---

## ফলাফল (২০২৬-০৭-৩০)

> নিচের block ঐ তারিখের historical run। ২০২৬-০৮-০৪ MCQ reconciliation-এর বর্তমান ফল ৬৮৮/৬৮৮ core + ২২০/২২০ admission exact match; বিস্তারিত `docs/MCQ_SAFE_IMPORT_2026-08-04.md`।

```
test:logic   ✅ ১৫৪/১৫৪ assertion
test:seed    ✅ ৭৭০ MCQ · ৬৪ CQ · ৮১ topic রেফারেন্স
test:ai      ✅ টেক্সট ৪/৪ · ভিশন ২/২
test:e2e     ✅ ৪৩/৪৩ চেক
test:api     ✅ ৭৬/৭৬ চেক (৪৭ GET সহ)
test:pages   ✅ ৮০/৮০ রুট
tsc --noEmit ✅ ০ error
eslint       ✅ ০ warning
```

---

## OOM সম্পর্কে (গুরুত্বপূর্ণ)

টেস্ট রান করলে আউটপুটে এমন লাইন দেখবেন:

```
↻ server পড়ে গেছে, রিস্টার্ট (/api/admin/analytics)
```

**এটা অ্যাপের বাগ নয়।** এই স্যান্ডবক্সে RAM ২ GB, swap নেই। Next.js dev
মোডে প্রতিটা রুট প্রথমবার হিট করলে on-demand কম্পাইল হয়, আর ভারী রুটে
প্রসেস ১.৩+ GB পৌঁছে কার্নেল OOM-killer এর শিকার হয় (`dmesg` এ প্রমাণিত:
`Out of memory: Killed process ... (next-server) anon-rss:1357700kB`)।

তাই তিনটা লাইভ স্ক্রিপ্টেই স্বয়ংক্রিয় রিকভারি আছে — server মরলে নিজে
রিস্টার্ট করে, আবার লগইন করে, একই রিকোয়েস্ট রিট্রাই করে। প্রোডাকশন
বিল্ডে (যেখানে রুট আগেই কম্পাইল করা) এই সমস্যা হবে না।

---

## নিরাপত্তা যা যাচাই হয়েছে

- অ্যানোনিমাস অবস্থায় সব protected রুট → `401`
- STUDENT → সব admin রুট → `403` (GET ও PATCH দুটোতেই)
- অন্য ইউজারের bookmark folder এডিট → `404`, আর **DB তে নামও বদলায়নি**
  (শুধু status code না, আসল প্রভাব যাচাই করা হয়)
- non-admin এর `maintenanceMode` চালু করার চেষ্টা → ব্যর্থ, DB তে `False`
- পাসওয়ার্ড bcrypt হ্যাশে সংরক্ষিত, প্লেইনটেক্সট নেই
- ভুল পাসওয়ার্ডে সেশন কুকি তৈরি হয় না
- `/api/practice/start` ও `/api/drill/start` এ `correctAnswer` /
  `explanation` ক্লায়েন্টে পাঠানো হয় না (anti-cheat)
- স্কোর সম্পূর্ণ সার্ভার-সাইডে গণনা — ক্লায়েন্টের দাবি বিশ্বাস করা হয় না
  (৩/৬ ও ১৮/৩৬ দুই ক্ষেত্রেই ইচ্ছাকৃত ভুল দিয়ে যাচাই)

---

## টেস্ট লেখার সময় যেসব ফাঁদে পড়েছি

স্বচ্ছতার জন্য লিখে রাখা — একই ভুল যেন আবার না হয়। প্রতিটাই প্রথমে
"অ্যাপের বাগ" মনে হয়েছিল, আসলে টেস্টের বাগ ছিল:

| উপসর্গ | আসল কারণ |
|---|---|
| `405 Method Not Allowed` | `/api/user/profile` PATCH-only, `/api/gamification/sync` POST-only |
| `404` on `/api/topics/[id]` | ঐ নামে রুটই নেই — শুধু `/progress`, `/mind-map`, `/notes-pdf` সাব-রুট আছে |
| `column a.attemptId does not exist` | আসল কলাম `quizAttemptId` |
| `column currentStreak does not exist` | User এ `streakCount`; `currentStreak` হলো Habit এর |
| `column notes does not exist` | Topic এ `notesMarkdown` |
| `column value does not exist` | SystemSetting এ সরাসরি `maintenanceMode` কলাম |
| bookmark 400 "টপিক আইডি দিন" | bookmark হয় topic-এ, question-এ নয় |
| drill 400 "সঠিক duration দিন" | `durationSec` (৩০/৬০/৯০), `count` নয় |
| checklist 400 | `{category, label}` লাগে, `{text}` নয় |
| mind-map 400 "নোট নেই" | ১৮৫ টপিকের মাত্র ৮২টায় `notesMarkdown` আছে |
| টেস্ট রান নীরবে হারিয়ে যাচ্ছিল | `pkill -f next-server` **নিজের শেলকেই** মারছিল → `[n]ext-server` ব্র্যাকেট ট্রিক |
| `[৬]` সেকশন নীরবে skip | `finally` ব্লক exception চাপা দিচ্ছিল → `except` যোগ করে traceback |
| AI প্রোভাইডার 403 code 1010 | User-Agent হেডার ছাড়া Cloudflare ব্লক করছিল (অ্যাপের Node fetch ঠিকই UA পাঠায়, তাই বাস্তবে সমস্যা নেই) |

শেষ দুটো বিশেষভাবে বিপজ্জনক ছিল: প্রথমটায় টেস্ট "সব পাস" দেখাচ্ছিল
কারণ চেকগুলো আদৌ চলছিল না, দ্বিতীয়টায় কাজ করা প্রোভাইডারকে "মৃত"
রিপোর্ট করতে যাচ্ছিলাম।
