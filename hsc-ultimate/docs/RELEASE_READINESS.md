# Release Readiness Preflight & Supply-Chain Manifest

**সর্বশেষ run:** ৫ আগস্ট ২০২৬ — Feature Polish, UI/UX & Live-User Acceptance  
**Decision:** `LOCAL_READY` — source/database/build/truth/live-user gates pass; external production configuration pending

## Final result

```text
LOCAL_READY
22 PASS
1 WARN
0 FAIL
```

এটি public deploy বা Play Store publish হওয়ার দাবি নয়।

## Verified inventory

```text
Pages:              89
API routes:         213
Components:         179
Library files:      114
Prisma models:       67
Migrations:          33/33
```

Current deterministic source and migration SHA-256 values machine-readable report-এ আছে:

- `reports/release-preflight-2026-08-05-feature-polish.json`

`.env`, `.env.local`, generated builds/caches ও academic backup content source manifest-এ থাকে না।

## Core gates

- Node 22/npm-only lock
- deterministic source/migration manifest
- inventory parity
- runtime truth integrity: no reachable fake/no-op API, live landing count, public-only HTML cache
- Privacy/Terms/account deletion/version metadata
- live migration parity
- academic baseline/blocker/stale-review/snapshot integrity
- dependency/secret/backup/build hygiene
- UI/UX semantics, route context, mobile discoverability এবং safe live-test lifecycle

## Live read-only academic gate

```text
Migrations:                  33/33
Subjects/chapters:           13/89
Core/Admission MCQ:          688/220
CQ/topic notes/badges:       64/185/14
Academic reviewable:         1,157
AI Approved:                 1
Admin Approved:              0
Automated blockers:          0
Warnings:                    4
Stale reviews:               0
Academic snapshot:           valid
Production vulnerabilities:  0
```

Only release warning:

```text
academic-review-backlog: 1,156 unreviewed
```

## Truth, safety, security ও performance

```text
Runtime integrity:              15/15 PASS
UI/UX integrity:                18/18 PASS
Reachable fake/no-op API:       0
Fabricated landing testimonial: 0
Hardcoded privileged fallback:  0
Private HTML page cache:        0
Unguarded destructive seeds:    0/17
Tiny 8–11px text classes:       0
Nested Link > button patterns:  0
API security/rate coverage:     213/213
Admin/auth/mutation gaps:       0
Foreign-key indexes:            80/80
Critical indexes:               18/18
```

## Live-user acceptance

```text
Real student E2E:       46/46
Broad real API journey: 112/112
All page routes:        89/89 OK · 0 FAIL · 0 SKIP
Mobile Chromium UX:     46/46
Disposable users left:  0
Test actor audit leaks:  0
```

Acceptance suites normal Auth.js HTTP session এবং real PostgreSQL data ব্যবহার করেছে। Temporary user-owned records exact disposable identity দিয়ে cleanup হয়েছে; existing live user XP/profile/attempt কোনোটি reset/delete করা হয়নি। বিস্তারিত:

- `docs/FEATURE_POLISH_UI_UX_LIVE_ACCEPTANCE.md`
- `reports/live-user-acceptance-2026-08-05-feature-polish.json`

## Build/test

```text
Web unit:                   109/109
Pure logic:                 162/162
TypeScript/ESLint:             clean
Production build routes:     181/181
Production dependency audit:        0
Secret checks:                18/18
Android JVM/debug/lint baseline: PASS
```

Landing page live PostgreSQL থেকে Subject/Chapter/Core MCQ/Admission MCQ/CQ/Badge count নেয়। DB unavailable হলে invented fallback number নয়, `—` দেখায়।

## Academic Trust Loop / Multi-AI approval

- Student report exact content hash-এর সঙ্গে bound; resolution content auto-approve করে না।
- Reviewer identity সবসময় `AI` বা `ADMIN` হিসেবে visible।
- AI approval-এর জন্য Admin final click বাধ্যতামূলক নয়।
- দুই distinct provider, ≥0.92 confidence, exact current content hash, answer agreement এবং immutable evidence ছাড়া AI approval হয় না।
- Student expensive AI review trigger করতে পারে না।
- Snapshot schema v2 AI reviewer/evidence/batch/provider run অন্তর্ভুক্ত করে এবং checksum valid।

## External deployment pending

1. `publicUrl`
2. `externalScheduler`
3. `distributedRateLimit`
4. `firebaseAdmin`
5. `productionRuntime`

Additional manual requirements:

- historical Admin test password rotation
- verified operator/privacy contact ও legal review
- full DB PITR/restore evidence
- staging load/CSP enforcement telemetry
- physical Android/OEM/background/closed-app FCM test
- Play Store work পরে (স্পষ্টভাবে deferred)

## Commands

```bash
npm run verify:full
npm run audit:ux:strict
npm run audit:integrity:strict
npm run audit:security:strict
npm run audit:performance:strict
npm run release:preflight
npm run release:preflight:strict
```

Strict deploy gate external requirements pending থাকলে expected non-zero exit করে। CI কোনো deployment করে না।

## Current reports

- `reports/release-preflight-2026-08-05-feature-polish.json`
- `reports/runtime-integrity-2026-08-05-feature-polish.json`
- `reports/api-security-2026-08-05-feature-polish.json`
- `reports/performance-2026-08-05-feature-polish.json`
- `reports/privacy-compliance-2026-08-05-feature-polish.json`
- `reports/ux-integrity-2026-08-05-feature-polish.json`
- `reports/live-user-acceptance-2026-08-05-feature-polish.json`
