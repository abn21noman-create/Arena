# MCQ Source ↔ Live Database Audit — 2026-08-04

> Mode: **read-only**. এই audit কোনো row insert, update বা delete করেনি।

## Executive finding

আগের **908 − 677 = 231** হিসাবটি একই category তুলনা করেনি:

- Source **908** = core Question seed **688** + AdmissionQuestion seed **220**
- Live সব MCQ entity = core Question **677** + AdmissionQuestion **220** = **897**
- Core-to-core প্রকৃত gap = **688 − 677 = 11**

সুতরাং ২৩১টি bulk import করা হলে admission content ভুল table-এ duplicate/corrupt হওয়ার ঝুঁকি ছিল। Safe candidate মাত্র **11টি**।

## Reconciliation

| Dataset | Source | Live | Missing | Live-only | Content drift |
|---|---:|---:|---:|---:|---:|
| Core Question | 688 | 677 | 11 | 0 | 0 |
| AdmissionQuestion | 220 | 220 | 0 | 0 | 1 |
| Combined MCQ entities | 908 | 897 | 11 | 0 | 1 |

- Unresolved topic reference: **0**
- Source same-topic identity duplicate group: **0**
- Live same-topic identity duplicate group: **0**
- Source cross-topic identical-text group: **2**
- Source near-duplicate pair (≥ 0.92): **0**

## Quality gates

| Check scope | Blocker | Warning |
|---|---:|---:|
| Source core (688) | 0 | 0 |
| Live core (677) | 0 | 0 |
| Missing candidates (11) | 0 | 0 |
| Source admission (220) | 0 | — |
| Live admission (220) | 1 | — |

Checks include topic resolution, normalized duplicate detection, exactly four non-empty options, answer-in-options, explanation length, Unicode/control corruption, balanced math/LaTeX delimiters, board metadata, and placeholder/generated-content markers.

## Missing core candidates

| # | Topic | Difficulty | Automated gate | Question |
|---:|---|---|---|---|
| 1 | নেটওয়ার্কের প্রকারভেদ | MEDIUM | Pass | নেটওয়ার্ক টপোলজির মধ্যে সবচেয়ে বেশি নির্ভরযোগ্য টপোলজি কোনটি? |
| 2 | নেটওয়ার্কের প্রকারভেদ | EASY | Pass | PAN (Personal Area Network) এর সাধারণ ভৌগোলিক বিস্তৃতি কত? |
| 3 | বুলিয়ান অ্যালজেবরা | MEDIUM | Pass | ডি-মরগ্যানের প্রথম উপপাদ্য অনুযায়ী (A+B)' এর সমতুল্য রাশি কোনটি? |
| 4 | বুলিয়ান অ্যালজেবরা | HARD | Pass | NAND গেটকে 'সার্বজনীন গেট' বলা হয় কেন? |
| 5 | HTML ট্যাগ পরিচিতি | MEDIUM | Pass | HTML টেবিলে একটি সেলকে দুইটি কলাম জুড়ে বিস্তৃত করতে কোন অ্যাট্রিবিউট ব্যবহৃত হয়? |
| 6 | HTML ট্যাগ পরিচিতি | EASY | Pass | কোন HTML ট্যাগ দিয়ে অর্ডারড (ক্রমযুক্ত) লিস্ট তৈরি করা হয়? |
| 7 | C প্রোগ্রামিং বেসিক | EASY | Pass | C ভাষায় for loop এর গঠনে কয়টি প্রধান অংশ থাকে? |
| 8 | C প্রোগ্রামিং বেসিক | MEDIUM | Pass | C প্রোগ্রামে while loop ও do-while loop এর মধ্যে মূল পার্থক্য কী? |
| 9 | C প্রোগ্রামিং বেসিক | EASY | Pass | নিচের কোনটি C ভাষার একটি সঠিক ডেটা টাইপ? |
| 10 | SQL কুয়েরি | EASY | Pass | একটি টেবিলের বিদ্যমান রেকর্ড সংশোধন করতে কোন SQL কমান্ড ব্যবহৃত হয়? |
| 11 | SQL কুয়েরি | MEDIUM | Pass | SQL এর WHERE ক্লজ ছাড়া DELETE কমান্ড চালালে কী ঘটবে? |

সব candidate এসেছে `prisma/seed-questions-chem-ict-gaps.ts` থেকে। এগুলো live topic notes-এর সঙ্গে internal-consistency review করতে হবে; automated validation subject-expert factual review-এর বিকল্প নয়।

## Existing identical text in different topics

এগুলো same-topic duplicate নয়; একই প্রশ্ন আলাদা curriculum topic-এ intentionalভাবে আছে:

- **শব্দ তরঙ্গ কোন ধরনের তরঙ্গ?** — পদার্থবিজ্ঞান ১ম পত্র / শব্দ তরঙ্গ; পদার্থবিজ্ঞান ১ম পত্র / তরঙ্গের প্রকারভেদ
- **sin²θ + cos²θ এর মান কত?** — উচ্চতর গণিত ১ম পত্র / ত্রিকোণমিতিক অভেদ; উচ্চতর গণিত ১ম পত্র / ত্রিকোণমিতিক অনুপাতের ধারণা

## Existing content drift

- নেই

## Safe import policy

1. Existing row delete/update করা যাবে না।
2. Default command dry-run; write-এর জন্য explicit `--apply` বাধ্যতামূলক।
3. প্রতিটি candidate-এর stable SHA-256 identity reviewed approval manifest-এ থাকতে হবে।
4. Import transaction-এর ভিতরে PostgreSQL advisory lock নিয়ে আবার normalized identity check হবে।
5. একই command পুনরায় চালালে zero insert হতে হবে (idempotent)।
6. Apply শেষে count, duplicate, drift ও quality audit পুনরায় চলবে।
