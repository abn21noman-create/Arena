# Multi-AI Academic Approval Engine

**তারিখ:** ৫ আগস্ট ২০২৬  
**Status:** Live — first exact-hash AI approval applied  
**Admin final click required:** No  
**Reviewer identity:** Always explicit (`AI` or `ADMIN`)

## Decision model

Academic content দুইভাবে approved হতে পারে:

- `AI Approved` — strict two-provider consensus engine
- `Admin Approved` — authenticated Admin decision

দুটো একই content hash-এর review evidence, কিন্তু UI/CSV/history-তে reviewer kind কখনো লুকানো হয় না। AI approval-কে human/Admin/expert approval বলা হয় না। Admin পরে AI decision override করতে পারে।

## Strict AI approval gate

Content `AI Approved` হতে সব শর্ত দরকার:

1. exact current SHA-256 content hash;
2. two distinct configured providers return valid JSON;
3. both verdict `APPROVE`;
4. minimum provider confidence ≥ `0.92`;
5. automated blocker/warning = 0;
6. pending student report = 0;
7. provider issue arrays empty;
8. MCQ হলে দুই provider expected full option text-এ একমত;
9. AI expected answer stored `correctAnswer`-এর সঙ্গে exact normalized match;
10. board year/current-source claim হলে `SOURCE_REQUIRED`, approval নয়।

এক provider response, malformed JSON, disagreement, low confidence বা wrong answer হলে approval হয় না।

## Non-approval statuses

- `AI_CONFLICT`
- `SOURCE_REQUIRED`
- `NEEDS_CORRECTION`
- provider/batch `ERROR`

AI content silently edit/delete করে না। Pending student report থাকা content AI auto-approve করতে পারে না। Structural scanner একা approval দিতে পারে না।

## Independent provider behavior

Normal AI Tutor fallback প্রথম successful provider ব্যবহার করে। Academic review আলাদা:

```text
getIndependentAIResponses()
```

এটি fallback consensus বলে না; distinct provider responses সংগ্রহ করে। Current preferred configured pair:

- Groq
- Mistral

Failure হলে configured Cerebras/OpenRouter থেকে second independent response চেষ্টা করা যায়। প্রতিটি run provider/model/verdict/confidence/response SHA-256 রাখে; raw API key বা credential নয়।

## Evidence schema

Migration:

```text
20260805030000_add_multi_ai_academic_review
```

New models:

### `AIReviewBatch`

- status, target type, requested/processed count
- approved/flagged/conflict/error count
- method version
- provider intent
- threshold
- timestamps/error code
- optional initiator

### `AIContentReviewRun`

- batch/content target/hash
- provider/model
- verdict/confidence
- expected answer fingerprint
- rationale/issues/source-required
- response SHA-256

Existing `ContentReview`/immutable revision now store:

- `reviewerKind = AI | ADMIN`
- AI confidence
- AI evidence JSON
- method version
- exact content hash

## Operations

### Admin dashboard

`Admin → Academic Content Quality → AI review next 3`

Admin কেবল expensive batch trigger করে; final decision engine নিজে দেয়। Admin approval click লাগে না। Student trigger করতে পারে না, যাতে free API quota abuse না হয়।

### CLI

Dry run, DB write 0:

```bash
npm run review:ai -- --limit 3 --target-type CORE_MCQ
```

Apply:

```bash
npm run review:ai:apply -- --limit 3 --target-type CORE_MCQ
```

Batch limit 1–25; Admin API limit 1–10। Processing sequential per content, provider pair parallel। Completed evidence resumable/history-preserving।

## First real live approval

One Core MCQ was independently reviewed twice:

```text
Providers: Groq + Mistral
Consensus: APPROVE
Minimum confidence: 1.00
Expected-answer agreement: exact
Stored answer match: true
Current hash match: true
Reviewer kind: AI
Immutable revisions: 1
AI batches: 1
Provider runs: 2
```

No academic content text/answer was edited। Current state:

```text
Total reviewable: 1,157
AI Approved: 1
Admin Approved: 0
Unreviewed: 1,156
AI Conflict: 0
Source Required: 0
Stale: 0
```

## Disaster recovery

Academic snapshot schema v2 includes:

- ContentReview AI/Admin identity and evidence
- immutable revisions
- AI batches
- provider runs

Student AcademicContentReport remains excluded because it is user-linked sensitive data। Live snapshot:

```text
schemaVersion: 2
valid: true
reviews: 1
revisions: 1
AI batches: 1
AI runs: 2
checksum: 2153b46c3c4c5d457645206df5e122d248ce62e87ef8f5a5dde14dacf4296fca
```

## Verification

```text
Unit tests:              106/106
Pure logic:              162/162
Runtime integrity:        15/15
API security:            213/213
FK indexes:                80/80
Critical indexes:          18/18
Migrations:                33/33
Production build:         181/181
Android unit/debug/lint:     PASS
Production vulnerabilities:    0
Release preflight: 22 PASS · 1 WARN · 0 FAIL
```

Only warning:

```text
academic-review-backlog: 1,156 unreviewed
```

## Safety limits

- AI approval is not official board certification.
- Provider consensus can still be wrong; reviewer kind/evidence stays visible.
- Current regulation/year/source claims require provenance.
- Student reports and scanner warnings block auto approval.
- Admin can override/revoke AI decisions with a new immutable revision.
- No bulk silent edit, no automatic destructive correction.
