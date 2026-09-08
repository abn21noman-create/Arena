# Academic Content Quality Center

> **৫ আগস্ট ২০২৬ update:** Student exact-hash issue reporting, `REPORTED` Admin queue, human resolve/dismiss এবং reporter notification যোগ হয়েছে। বিস্তারিত [`ACADEMIC_TRUST_LOOP.md`](./ACADEMIC_TRUST_LOOP.md)।

**তারিখ:** ৪ আগস্ট ২০২৬  
**Status:** Automated risk triage + Admin/Multi-AI review workflow complete; factual review ongoing

## Safety principle

Automated checks factual correctness প্রমাণ করে না। এই system:

- content prioritise করে;
- structural/math/duplicate risk দেখায়;
- Admin অথবা strict Multi-AI decision, reviewer kind ও provenance/evidence সংরক্ষণ করে;
- structural scanner কোনো content approve করে না; strict Multi-AI engine আলাদা consensus gate-এ approve করতে পারে;
- কোনো MCQ/CQ/note auto-edit বা delete করে না।

Review row না থাকলে content-এর status **UNREVIEWED**।

## Database workflow

Migration:

```text
20260804050000_add_academic_content_reviews
```

Review workflow migration applied at 26/26; review-integrity extension-এর পরে full database এখন **29/29** migration।

### `ContentReview`

Supported target:

- `CORE_MCQ`
- `ADMISSION_MCQ`
- `CQ`
- `TOPIC_NOTE`

Human status:

- `APPROVED`
- `NEEDS_CORRECTION`
- `REJECTED`

Stored evidence:

- reviewer
- review note
- optional HTTPS source/provenance URL
- review timestamp

এক target-এর একটি current review row থাকে; পুনরায় review করলে audited upsert হয়। Reviewer account delete হলেও review row থাকে, reviewer relation null হয়।

## Automated triage

### MCQ

- empty/short question
- options array/৪টি option
- empty/duplicate option
- correct answer options-এর মধ্যে আছে কিনা
- missing/short explanation
- corrupt Unicode/control character
- unbalanced math delimiter
- placeholder marker
- partial board name/year
- same-context exact duplicate
- cross-context identical text

### CQ

- stimulus length
- ক/খ/গ/ঘ presence
- চারটি model answer presence/length
- Unicode/math/placeholder integrity

### Topic note

- note missing
- অস্বাভাবিক ছোট note
- math delimiter
- Markdown code-fence balance
- Unicode/control/placeholder integrity

BLOCKER risk review priority বাড়ায়; WARNING human judgement চায়। কোনো risk নিজে content reject করে না।

## Live full-bank scan

Read-only scan duration: প্রায় **3.2 seconds**।

```text
Total academic items: 1,157
Core MCQ:              688
Admission MCQ:         220
CQ:                     64
Topic notes:           185

Human reviewed:          0
Unreviewed:          1,157
Automated risk items:    4
Blocker items:           0
Warning items:           4
Same-context duplicate:  0 groups
Cross-context duplicate: 2 groups
```

Attention queue-এর চারটি item দুইটি cross-context pair:

1. `sin²θ + cos²θ এর মান কত?`
   - ত্রিকোণমিতিক অভেদ
   - ত্রিকোণমিতিক অনুপাতের ধারণা
2. `শব্দ তরঙ্গ কোন ধরনের তরঙ্গ?`
   - শব্দ তরঙ্গ
   - তরঙ্গের প্রকারভেদ

এগুলো same-topic duplicate নয় এবং আগের MCQ audit-এ intentional curriculum overlap হিসেবে চিহ্নিত ছিল; এখনো Admin reviewer-এর explicit decision না হওয়া পর্যন্ত approved নয়।

## Admin API

```text
GET  /api/admin/content-quality
POST /api/admin/content-quality
GET  /api/admin/content-quality/export
```

GET filters:

- target type
- `ATTENTION`
- `UNREVIEWED`
- `REVIEWED`
- `ALL`
- search
- pagination

POST rules:

- Admin auth + rate limit
- target existence check
- approval-এর জন্য note অথবা HTTPS source
- correction/rejection-এর জন্য অন্তত ১০-character reason
- source URL শুধু HTTPS
- review decision audit log
- exact content SHA-256 hash
- content বদলালে stale review current progress থেকে বাদ
- immutable review revision history
- filter-aware spreadsheet-safe Admin Review CSV export
- content table update/delete হয় না

পূর্ণ integrity design: [`ACADEMIC_REVIEW_INTEGRITY.md`](./ACADEMIC_REVIEW_INTEGRITY.md)।

Audit actions:

```text
CONTENT_REVIEW_APPROVED
CONTENT_REVIEW_NEEDS_CORRECTION
CONTENT_REVIEW_REJECTED
```

## Premium Admin UI

নতুন page:

```text
/admin/content-quality
```

Features:

- total/reviewed/unreviewed/risk/blocker metrics
- review progress bar
- scope/view/search filters
- prioritized review queue
- MCQ options + highlighted answer
- explanation/CQ/note preview
- risk evidence
- existing reviewer/status/provenance
- Expert note + HTTPS source
- Approve / Correct / Reject actions
- stale metric/queue এবং content hash warning
- immutable review history
- filter-aware Admin Review CSV export
- pagination
- Premium Admin loading state
- Admin sidebar entry

## Workflow persistence test

Temporary real target review দিয়ে যাচাই:

```text
Target exists:             true
Before review rows:        0
During reviewed count:     1
Status:                    NEEDS_CORRECTION
After cleanup review rows: 0
Academic content modified: 0
```

Temporary review সম্পূর্ণ delete হয়েছে; কোনো content/audit test row অবশিষ্ট নেই।

## Unit coverage

Pure tests:

- Unicode/whitespace normalization
- valid MCQ pass
- impossible answer/option/explanation risks
- corrupt Unicode/math delimiter
- missing CQ parts/model answers
- note presence/length/code fence
- deterministic duplicate key
- blocker/warning score priority

## Important limitation

এই phase structural correctness ও review operations তৈরি করেছে। ১,১৫৭টি item-এর factual truth subject-by-subject Admin অথবা strict Multi-AI consensus-এ যাচাই করতে হবে। Dashboard reviewer kind দেখায়; structural scanner কখনো নিজে approval status বসায় না।

## Final verification

- Migration: **29/29**
- TypeScript: 0 error
- ESLint: 0 warning
- Web unit tests: **93/93**
- Content-quality/integrity unit tests: 11/11
- Pure logic: 162/162
- Secret shape: 17/17
- Production vulnerabilities: 0
- Production build: compile + TypeScript + **206/206**, exit 0
- Preview/dev server: চালু করা হয়নি

## Relevant files

- `prisma/migrations/20260804050000_add_academic_content_reviews/migration.sql`
- `prisma/schema.prisma`
- `lib/content-quality.ts`
- `lib/content-quality-server.ts`
- `app/api/admin/content-quality/route.ts`
- `app/admin/content-quality/page.tsx`
- `app/admin/content-quality/loading.tsx`
- `components/admin/content-quality-dashboard.tsx`
- `components/admin/admin-sidebar-nav.tsx`
- `tests/unit/content-quality.test.ts`
