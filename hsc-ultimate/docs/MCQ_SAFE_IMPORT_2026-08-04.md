# MCQ Quality Audit & Safe Incremental Import — ৪ আগস্ট ২০২৬

## চূড়ান্ত ফলাফল

| Dataset | Source | Live (আগে) | Imported | Live (পরে) | Missing | Drift | Same-topic duplicate |
|---|---:|---:|---:|---:|---:|---:|---:|
| Core `Question` MCQ | 688 | 677 | 11 | **688** | **0** | **0** | **0** |
| `AdmissionQuestion` MCQ | 220 | 220 | 0 | **220** | **0** | **0** | **0** |
| সব MCQ entity | **908** | **897** | **11** | **908** | **0** | **0** | **0** |

CQ অপরিবর্তিতভাবে **64**। কোনো MCQ update/delete করা হয়নি। Incremental importer শুধু ১১টি reviewed row insert করেছে।

## ২৩১টি “missing” কেন আসলে ভুল ছিল

পুরোনো integrity script-এর **908** count-এ দুইটি আলাদা Prisma model একসঙ্গে ছিল:

- Core `Question` seed: **688**
- `AdmissionQuestion` seed: **220**
- মোট: **908**

কিন্তু live comparison-এর **677** ছিল শুধু core `Question` table। তাই `908 − 677 = 231` একই category-এর তুলনা ছিল না। সঠিক তুলনা:

```text
Core:       688 − 677 = 11 missing
Admission:  220 − 220 = 0 missing
```

এই reconciliation না করে ২৩১টি bulk import চালালে admission content ভুল model/table-এ ঢোকানো বা duplicate করার ঝুঁকি থাকত।

## Read-only audit পদ্ধতি

নতুন static TypeScript AST catalog loader seed script execute না করে literal data পড়ে। এটি:

1. Core ও Admission seed আলাদা করে;
2. Unicode NFKC, whitespace, zero-width character, quote/dash ও math delimiter normalize করে;
3. subject code + paper + topic name + question text দিয়ে stable SHA-256 identity বানায়;
4. options, answer, explanation, difficulty ও board metadata-সহ আলাদা content fingerprint বানায়;
5. live Supabase-এর topic ownership resolve করে;
6. exact match, content drift, live-only, missing, same-topic duplicate, cross-topic identical text ও near-duplicate শনাক্ত করে;
7. malformed Unicode/LaTeX, control character, placeholder marker, invalid option count, duplicate option, answer-not-in-options ও ছোট explanation পরীক্ষা করে।

Audit command read-only:

```bash
npm run audit:mcq
```

## প্রকৃত ১১টি gap

সবগুলো `prisma/seed-questions-chem-ict-gaps.ts`-এর ICT প্রশ্ন ছিল। পরে destructive Bangla/English/ICT seed চালানোর ফলে চারটি existing topic-এর supplementary প্রশ্ন overwrite হয়েছিল।

| Topic | Imported |
|---|---:|
| নেটওয়ার্কের প্রকারভেদ | 2 |
| বুলিয়ান অ্যালজেবরা | 2 |
| HTML ট্যাগ পরিচিতি | 2 |
| C প্রোগ্রামিং বেসিক | 3 |
| SQL কুয়েরি | 2 |
| **মোট** | **11** |

প্রতিটি candidate-এর:

- চারটি non-empty unique option ছিল;
- correct answer options-এর মধ্যে ছিল;
- explanation যথেষ্ট দীর্ঘ ছিল;
- topic reference resolve হয়েছে;
- same-topic exact/near duplicate ছিল না;
- live-only conflict ছিল না;
- reviewed approval manifest-এ identity ও content fingerprint মিলেছে।

## Factual review-তে ধরা correction

PAN range source-এ **১০–১০০ মিটার** ছিল। HSC-oriented reference-এ PAN-এর সর্বোচ্চ পরিধি **১০ মিটার** ধরা হয়েছে। Import-এর আগে নিচের source content একইভাবে সংশোধন করা হয়:

- missing PAN MCQ-এর options, correct answer ও explanation;
- ICT topic note ও formula sheet;
- ICT CQ model answer-এর দুইটি reference।

Live database-এ compare-before-write transaction দিয়ে পাঁচটি পুরোনো range occurrence সংশোধন করা হয়েছে। পাশাপাশি একটি BUET Math admission MCQ-এর অতি-সংক্ষিপ্ত explanation সমৃদ্ধ করা হয়েছে। এই targeted correction-এ:

- Topic row updated: 1
- CQ row updated: 1
- AdmissionQuestion row updated: 1
- Insert/delete: 0

## Approval ও import safety

Approval manifest:

```text
scripts/data/mcq-import-approval-2026-08-04.json
```

Default import command **dry-run**:

```bash
npm run db:import-mcq
```

Write করতে explicit flag বাধ্যতামূলক:

```bash
npm run db:import-mcq -- --apply
```

Importer safeguards:

- delete/update operation নেই;
- reviewed source baseline count বাধ্যতামূলক;
- source/live quality blocker থাকলে abort;
- unreviewed missing fingerprint থাকলে abort;
- approval-এর পর content বদলালে content-fingerprint mismatch-এ abort;
- unresolved topic বা source/live drift থাকলে abort;
- transaction-এর ভিতরে normalized identity আবার check;
- concurrent run ঠেকাতে PostgreSQL advisory transaction lock;
- `Serializable` isolation;
- same-topic identity ও unexpected global duplicate check;
- failure হলে transaction rollback;
- apply-এর পরে fresh read-only reconciliation।

## Apply ও idempotency proof

প্রথম apply:

```text
Inserted: 11
Updated MCQ: 0
Deleted MCQ: 0
Live core: 677 → 688
Remaining gap: 0
```

একই apply command দ্বিতীয়বার:

```text
Inserted: 0
Updated: 0
Deleted: 0
Live core: 688 → 688
Remaining gap: 0
```

Reviewed content correction script-ও দ্বিতীয়বার zero-update হয়েছে।

## চূড়ান্ত quality state

- Source core: 688/688 exact identity
- Live core: 688/688 exact identity
- Source admission: 220/220 exact identity
- Live admission: 220/220 exact identity
- Source/live content drift: 0
- Live-only entry: 0
- Unresolved topic: 0
- Automated quality blocker/warning: 0/0
- Same-topic identity duplicate group: 0
- Near-duplicate pair (threshold ≥ 0.92): 0
- MCQ-শূন্য topic: 0/185
- Live structural verifier: 688 MCQ, 0 problem

## Verification

- `npm run verify`: TypeScript 0 error, ESLint 0 warning, unit **37/37** pass
- `npm run verify:full`: unit 37/37, pure logic 162/162, split seed integrity 688+220, Prisma valid, production audit 0 vulnerability, secret shape 16/16
- Production build: compile + TypeScript pass, static generation **201/201**, build artifacts complete
- Preview/dev server: চালু করা হয়নি

দুটি identical text আলাদা curriculum topic-এ intentionalভাবে আছে; এগুলো same-topic duplicate নয়:

1. “শব্দ তরঙ্গ কোন ধরনের তরঙ্গ?”
2. “sin²θ + cos²θ এর মান কত?”

## Reference material used for targeted review

- HSC ICT PAN range: <https://www.prothomalo.com/education/study/p83tr8smid>
- NAND universality/De Morgan: <https://www.allaboutcircuits.com/textbook/digital/chpt-3/gate-universality/>
- HTML `colspan`: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement/colSpan>
- HTML ordered list: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol>
- C `for`: <https://en.cppreference.com/w/c/language/for.html>
- C `do-while`: <https://en.cppreference.com/w/c/language/do.html>
- PostgreSQL `UPDATE`: <https://www.postgresql.org/docs/current/sql-update.html>
- PostgreSQL `DELETE`: <https://www.postgresql.org/docs/current/sql-delete.html>

## Audit artifacts

- Before: `reports/mcq-audit-before-import.json`
- Dry-run: `reports/mcq-import-dry-run.json`
- Apply: `reports/mcq-import-2026-08-04.json`
- Idempotency: `reports/mcq-import-idempotency.json`
- After: `reports/mcq-audit-after-import.json`
- Reviewed content correction: `reports/reviewed-content-fixes-2026-08-04.json`
- Readable before/after reports:
  - `docs/MCQ_AUDIT_BEFORE_IMPORT.md`
  - `docs/MCQ_AUDIT_AFTER_IMPORT.md`

## সীমা

Automated structure/duplicate checks ও targeted reference review সম্পন্ন হলেও পুরো 908 MCQ এবং 64 CQ-এর line-by-line subject-expert academic review আলাদা দীর্ঘমেয়াদি কাজ হিসেবে থাকবে।
