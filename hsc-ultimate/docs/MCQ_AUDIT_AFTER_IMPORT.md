# MCQ Source ↔ Live Database Audit — 2026-08-04

> Mode: **read-only**. এই audit কোনো row insert, update বা delete করেনি।

## Executive finding

আগের **908 − 677 = 231** হিসাবটি একই category তুলনা করেনি:

- Source **908** = core Question seed **688** + AdmissionQuestion seed **220**
- Live সব MCQ entity = core Question **688** + AdmissionQuestion **220** = **908**
- Core-to-core প্রকৃত gap = **688 − 688 = 0**

সুতরাং ২৩১টি bulk import করা হলে admission content ভুল table-এ duplicate/corrupt হওয়ার ঝুঁকি ছিল। Safe candidate মাত্র **0টি**।

## Reconciliation

| Dataset | Source | Live | Missing | Live-only | Content drift |
|---|---:|---:|---:|---:|---:|
| Core Question | 688 | 688 | 0 | 0 | 0 |
| AdmissionQuestion | 220 | 220 | 0 | 0 | 0 |
| Combined MCQ entities | 908 | 908 | 0 | 0 | 0 |

- Unresolved topic reference: **0**
- Source same-topic identity duplicate group: **0**
- Live same-topic identity duplicate group: **0**
- Source cross-topic identical-text group: **2**
- Source near-duplicate pair (≥ 0.92): **0**

## Quality gates

| Check scope | Blocker | Warning |
|---|---:|---:|
| Source core (688) | 0 | 0 |
| Live core (688) | 0 | 0 |
| Missing candidates (0) | 0 | 0 |
| Source admission (220) | 0 | — |
| Live admission (220) | 0 | — |

Checks include topic resolution, normalized duplicate detection, exactly four non-empty options, answer-in-options, explanation length, Unicode/control corruption, balanced math/LaTeX delimiters, board metadata, and placeholder/generated-content markers.

## Missing core candidates

| # | Topic | Difficulty | Automated gate | Question |
|---:|---|---|---|---|
| — | — | — | No missing candidates | — |

বর্তমানে source ও live-এর মধ্যে কোনো missing candidate নেই। Automated validation ভবিষ্যৎ subject-expert factual review-এর বিকল্প নয়।

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
