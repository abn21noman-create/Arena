# Academic Review Integrity & Expert Export

**তারিখ:** ৪ আগস্ট ২০২৬  
**Status:** Content-bound review hash, stale detection, immutable history and safe expert CSV export complete

## যে integrity gap ঠিক হয়েছে

আগের review row target ID-এর সঙ্গে যুক্ত ছিল, কিন্তু reviewed content-এর exact version-এর সঙ্গে নয়। Admin কোনো MCQ answer/note/CQ edit করলে পুরোনো `APPROVED` status ভুলভাবে current approved দেখাতে পারত। একই target পুনরায় review করলে পুরোনো decision/evidence overwrite-ও হয়ে যেত।

এখন:

- প্রতিটি decision exact content hash-এর সঙ্গে বাঁধা;
- content বদলালে review automatic **STALE**;
- stale approval reviewed/approved progress-এ গণনা হয় না;
- প্রতিটি human decision immutable revision history-তে থাকে;
- expert review queue spreadsheet-safe CSV হিসেবে export করা যায়।

## Stable academic content hash

Algorithm:

```text
SHA-256(
  target type +
  normalized strings +
  key-sorted object fields +
  ordered options/questions/answers +
  curriculum context ID
)
```

Normalization:

- Unicode NFKC
- zero-width character removal
- NBSP/whitespace normalization
- deterministic object-key sorting

Target-specific hash content:

- Core MCQ: topic, text, options, answer, explanation, difficulty, board metadata
- Admission MCQ: exam/subject, text, options, answer, explanation, difficulty
- CQ: topic, stimulus, ক/খ/গ/ঘ, চার model answer, board metadata
- Topic note: বাংলা/ইংরেজি topic name, notesMarkdown, formulaSheet

User/reviewer/timestamp কখনো content hash-এর অংশ নয়।

## Stale review behavior

`ContentReview.contentHash` current content hash-এর সঙ্গে না মিললে বা পুরোনো row-তে hash null থাকলে:

- `review.stale = true`
- `STALE` queue-তে আসে
- `ATTENTION` queue-তেও আসে
- `UNREVIEWED` backlog-এ পুনরায় গণনা হয়
- `REVIEWED` ও approved/correction/rejected current progress থেকে বাদ যায়
- UI পুরোনো status দেখালেও “Stale review” warning দেয়
- নতুন review না হওয়া পর্যন্ত content current-approved নয়

## Immutable review history

Migration:

```text
20260804060000_add_content_review_integrity
```

নতুন model:

```text
ContentReviewRevision
```

প্রতিটি review action-এ current row upsert-এর পাশাপাশি নতুন immutable revision তৈরি হয়:

- status
- content hash
- note
- source URL
- reviewer
- timestamp

Current UI latest ৫টি revision দেখায়। Reviewer account delete হলে historical decision থাকে, reviewer relation null হয়। Current review target delete হলে revisions current row-এর সঙ্গে cascade-cleanup হয়।

Full database এখন **29/29** migration।

## Expert CSV export

Endpoint:

```text
GET /api/admin/content-quality/export
```

Current UI filter অনুযায়ী export করা যায়:

- target type
- Attention/Unreviewed/Reviewed/Stale/All
- search

Columns:

- target type/ID
- content hash
- curriculum context
- title/question
- options
- correct answer
- explanation/content preview
- risk codes/severity
- review status/stale state
- review note/source/reviewer/time

Security:

- Admin authentication + rate limit
- UTF-8 BOM
- quoted/escaped CSV
- `=`, `+`, `-`, `@` দিয়ে শুরু cell-এর spreadsheet formula-injection neutralization
- no user study data, API secret, DB URL বা native token
- `Cache-Control: no-store`

Full export dataset verification:

```text
Rows:          1,157
Valid hashes:  1,157/1,157
Unique hashes: 1,157
Stale reviews: 0
Current reviews: 0
```

CSV **import/apply** ইচ্ছাকৃতভাবে যোগ করা হয়নি। Offline spreadsheet decision blindly bulk-apply করলে stale hash, malformed status বা reviewer identity risk তৈরি হয়। Decisions Admin UI/API-তে evidence validation ও audit-এর মাধ্যমে করতে হবে।

## Live integrity workflow verification

Temporary real target review:

```text
Content hash length:     64
Current reviewed count:   1
Deliberately wrong hash:  STALE detected
Stale queue items:        1
Immutable revisions:      2
After cleanup reviews:    0
After cleanup revisions:  0
Academic content edits:   0
```

Stale test content পরিবর্তন করে করা হয়নি; শুধু temporary review hash mismatch দিয়ে করা হয়েছে। সব temporary review/revision cascade-cleanup হয়েছে।

## UI additions

`/admin/content-quality` এখন:

- Stale metric
- Stale queue tab
- content hash preview
- stale-review warning
- immutable review history
- filter-aware **Expert CSV** button

## Unit coverage

- key-order independent deterministic hash
- Unicode-equivalent content hash
- answer/content change hash invalidation
- null/old hash stale
- CSV quote/comma escaping
- spreadsheet formula neutralization

## Important limit

Hash content change শনাক্ত করে; factual truth যাচাই করে না। Unchanged ভুল answer একই hash রাখবে যতক্ষণ human reviewer সেটি যাচাই না করেন। Qualified subject review এখনও বাধ্যতামূলক।

## Final verification

- Migration: **29/29**
- TypeScript: 0 error
- ESLint: 0 warning
- Web unit tests: **93/93**
- Content quality/integrity tests: 11/11
- Pure logic: 162/162
- Secret shape: 17/17
- Production vulnerabilities: 0
- Production build: compile + TypeScript + **206/206**, exit 0
- Preview/dev server: চালু করা হয়নি

## Relevant files

- `prisma/migrations/20260804060000_add_content_review_integrity/migration.sql`
- `prisma/schema.prisma`
- `lib/content-quality.ts`
- `lib/content-quality-server.ts`
- `app/api/admin/content-quality/route.ts`
- `app/api/admin/content-quality/export/route.ts`
- `components/admin/content-quality-dashboard.tsx`
- `tests/unit/content-quality.test.ts`
