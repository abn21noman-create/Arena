# Academic Content Disaster Recovery Toolkit

**তারিখ:** ৪ আগস্ট ২০২৬  
**Status:** Admin/CLI snapshot export, deterministic manifest and offline verifier complete; destructive restore intentionally absent

## Scope

এই toolkit academic/platform content-এর portable snapshot তৈরি করে। এটি full account/attempt database dump নয়। দুইটি উদ্দেশ্য:

1. accidental content corruption/deletion-এর আগে verified academic snapshot রাখা;
2. future deployment/migration-এর পরে source-of-truth counts ও references যাচাই করা।

## Included sections

- 13 subjects
- 89 chapters
- 185 topics, notes ও formula sheets
- 688 core MCQ
- 220 admission MCQ
- 64 CQ
- 14 badges
- current ContentReview rows
- immutable ContentReviewRevision rows

IDs ও parent references রাখা হয়, যাতে referential integrity যাচাই করা যায়।

## Explicitly excluded sensitive tables

- users
- accounts
- sessions
- password reset tokens
- quiz/mock/admission attempts
- Focus sessions
- native devices/FCM tokens
- native push deliveries
- push subscriptions
- audit logs
- chat messages

Snapshot schema-তে password hash, session/access/refresh token, private key, email, actor email ও IP key পাওয়া গেলে verifier fail করে।

Academic text, review notes ও copyrighted curriculum content নিজেই sensitive operational asset হিসেবে গণ্য হবে; snapshot encrypted/offsite storage-এ রাখতে হবে, Git-এ নয়।

## Deterministic manifest

Snapshot checksum:

```text
SHA-256(
  schemaVersion +
  declared section counts +
  recursively key-sorted data
)
```

`generatedAt` checksum-এর অংশ নয়, তাই একই content/count একই checksum দেয়। Array order database IDs/order অনুযায়ী deterministic।

Manifest:

```json
{
  "schemaVersion": 1,
  "counts": {},
  "checksum": {
    "algorithm": "sha256",
    "canonicalPayload": "schemaVersion+counts+data",
    "value": "..."
  }
}
```

## Integrity verifier

যা যাচাই হয়:

- supported schema version
- required section arrays
- declared বনাম actual counts
- SHA-256 checksum
- forbidden sensitive keys
- Chapter → Subject reference
- Topic → Chapter reference
- MCQ/CQ → Topic reference
- ContentReview → academic target reference
- ContentReviewRevision → review reference

Tampered content, changed count বা orphan reference-এ non-zero exit code।

## Admin download

System Operations Center-এ **Content snapshot** button:

```text
GET /api/admin/system/content-snapshot
```

Security:

- Admin auth
- Admin rate limit
- `Cache-Control: no-store`
- JSON attachment
- checksum/schema/item-count response headers
- secret/PII tables excluded

## CLI

Export:

```bash
npm run snapshot:content
```

Custom output:

```bash
npm run snapshot:content -- --out /secure/path/academic-content.json
```

Verify offline, database connection ছাড়া:

```bash
npm run snapshot:verify -- /secure/path/academic-content.json
```

Generated `/backups/*` Git-ignored। File permission exporter `0600` ব্যবহার করে।

## Live verification

```text
Snapshot size:       2,123,584 bytes (~2.03 MiB)
Checksum:            2b31716b78d17c389bfeaed32a1079af0383c029401f91c3c3006b680810a2f8
Academic items:      1,157
Subjects/chapters:   13/89
Badges:              14
Reviews/revisions:   0/0
Sensitive exclusions: 13 tables
```

Original snapshot:

```text
Checksum: valid
References: valid
Forbidden keys: 0
Result: PASS
```

একটি MCQ text deliberate tamper করার পরে:

```text
Checksum mismatch
Exit code: 1
Result: REJECTED
```

Generated verification/tampered files test শেষে delete হয়েছে; `backups/`-এ শুধু `.gitkeep`।

## Restore policy

Automated restore/apply/delete ইচ্ছাকৃতভাবে নেই। কারণ:

- snapshot পুরোনো হলে valid নতুন content overwrite হতে পারে;
- reviewed content hash stale হতে পারে;
- relational IDs existing production data-এর সঙ্গে conflict করতে পারে;
- full user/attempt recovery academic snapshot-এর scope নয়।

Safe recovery order:

1. Database provider-এর managed backup/PITR বা encrypted `pg_dump` আলাদাভাবে রাখুন;
2. নতুন schema-তে সব Prisma migration apply করুন;
3. academic snapshot offline verifier চালান;
4. current DB বনাম snapshot counts/hash compare করুন;
5. missing content reviewed incremental importer/Admin UI দিয়ে restore করুন;
6. Content Quality Center-এ stale review ও structural blockers পুনরায় scan করুন;
7. destructive replacement লাগলে আগে আলাদা database clone-এ rehearse করুন।

## Full database backup

User accounts, attempts, sessions ও operational records recovery-এর জন্য provider-managed encrypted backup বা PostgreSQL `pg_dump` দরকার। Full dump এই repository/API দিয়ে download করানো হয়নি—DB credentials বা personal data app response-এর মাধ্যমে বের হওয়ার ঝুঁকি এড়াতে।

## Unit coverage

- valid snapshot graph
- deterministic checksum/key order
- content tamper rejection
- declared count mismatch
- forbidden sensitive key rejection
- broken academic reference detection

## Final verification

- Migration status: **29/29**
- TypeScript: 0 error
- ESLint: 0 warning
- Web unit tests: **93/93**
- Snapshot integrity tests: 6/6
- Pure logic: 162/162
- Secret shape: 17/17
- Production vulnerabilities: 0
- Production build: compile + TypeScript + **206/206**, exit 0
- Preview/dev server: চালু করা হয়নি

## Relevant files

- `lib/content-snapshot.ts`
- `app/api/admin/system/content-snapshot/route.ts`
- `scripts/export-content-snapshot.ts`
- `scripts/verify-content-snapshot.ts`
- `tests/unit/content-snapshot.test.ts`
- `components/admin/system-operations-dashboard.tsx`
- `.gitignore`
- `backups/.gitkeep`
