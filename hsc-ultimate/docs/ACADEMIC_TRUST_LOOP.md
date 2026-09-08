# Academic Trust Loop

**তারিখ:** ৫ আগস্ট ২০২৬  
**Status:** Report → exact hash → Admin queue → decision notification + Multi-AI approval complete  
**Approval:** Admin decision অথবা strict two-provider AI consensus

## Goal

Student কোনো MCQ/CQ/model answer/note/formula ভুল মনে করলে সেই exact content version Admin review queue-তে পাঠাতে পারবে। Report নিজে content edit/approve/reject করে না; Admin review অথবা explicit Multi-AI consensus workflow আলাদা থাকে।

## Student reporting surfaces

`AcademicReportButton` এখন যুক্ত:

- Standard Practice MCQ runner
- Practice Result review
- Adaptive Practice
- Timed Drill
- Mistake Vault
- Chapter Pretest
- Admission runner/result
- CQ runner/result
- Mock Exam MCQ/CQ result
- Live Exam question-bank MCQ/CQ result
- Topic notes/formula page

User-generated custom Live Exam question Academic Quality bank-এ report হয় না; কেবল `sourceType=question_bank` হলে button দেখা যায়।

## Report reasons

- wrong answer
- factual/formula error
- explanation/model-answer error
- typo/format/LaTeX
- outdated board/source
- duplicate
- note/formula-sheet issue
- other

`OTHER` হলে অন্তত 10 অক্ষরের details আবশ্যক। Shared policy module client/server reason drift আটকায়।

## Exact-version integrity

New `AcademicContentReport` stores:

```text
userId
ContentReviewTargetType
content target ID
exact SHA-256 contentHash
reason/details
PENDING | RESOLVED | DISMISSED
reviewer/time/resolution note
```

Unique key:

```text
user + target type + target ID + content hash + reason
```

একই user একই exact version-এর একই issue বারবার spam করতে পারে না। Content পরে বদলালে old report `stale/old content` হিসেবে evidence থাকে; নতুন hash-এ নতুন report করা যায়।

## Admin Content Quality integration

New `Student reports` view:

- pending reports first
- summary pending count
- queue row report badge/count
- reporter, reason, details, time
- current/old content hash status
- resolve/dismiss action
- Admin review note minimum 10 characters
- search report reason/details/reporter
- CSV pending count/reasons

Resolve করা report content-কে automatically `APPROVED` করে না। Exact current hash পরে Admin অথবা strict Multi-AI engine review করে; reviewer kind/evidence আলাদা সংরক্ষিত হয়।

## Reporter feedback

Admin resolve/dismiss করলে:

- `AcademicContentReport` decision persists
- reporter in-app notification পায়
- Settings → Privacy → “আমার academic reports” latest status/note দেখায়
- decision AuditLog-এ যায়

Report content user data export v2-তে `academicFeedback.reports` হিসেবে থাকে; account deletion-এ cascade-delete। Reviewer account delete হলে report থাকে, reviewer reference SetNull।

## Abuse/safety

- authenticated route
- global + route-specific rate limit
- exact target existence/hash check
- max 50 pending reports per user
- 1,000-character details cap
- malformed JSON safe
- duplicate unique DB constraint
- Admin current-role/session guard
- no direct content mutation
- no CSV auto-import or auto-apply

## Database

Migration:

```text
20260805020000_add_academic_issue_reports
```

Final migration status: `33/33`। Model count: 67। FK coverage: `80/80`।

## Live E2E

Verified with temporary user/report and exact cleanup:

```text
Exact content hash: valid 64-char SHA-256
New status: PENDING
Exact duplicate: blocked
Admin REPORTED queue: visible
New report stale: false
Decision: RESOLVED persisted
Reporter notification: present
Account deletion cascade: report removed
Cleanup: reports/users/notifications = 0
Assertions: 10/10
Academic content rows modified: 0
```

## Final verification

```text
Unit tests:             106/106
Pure logic:             162/162
Academic report E2E:     10/10
Runtime integrity:       15/15
API security:           213/213
Admin/auth gaps:              0
FK indexes:               80/80
Migrations:               33/33
Production build:        181/181
Android debug/lint:         PASS
Production vulnerabilities:    0
Release preflight: 22 PASS · 1 WARN · 0 FAIL
```

## Remaining truth gap

Admin + Multi-AI infrastructure complete; current decisions:

```text
Reviewed: 1 / 1,157 (AI Approved 1, Admin Approved 0)
Automated blockers: 0
Automated warning items: 4
```

পরবর্তী কাজ student report-এর অপেক্ষা করা নয়—subject-by-subject proactive Multi-AI/Admin review batch শুরু করা:

1. ICT warning/content batch
2. Physics
3. Chemistry
4. Higher Math
5. Biology
6. Bangla/English
7. Admission bank
8. CQ/model answers

Structural automation শুধু queue prioritize করবে; factual approval কেবল strict Multi-AI consensus অথবা Admin decision দিতে পারে।


Multi-AI details: [`MULTI_AI_ACADEMIC_APPROVAL.md`](./MULTI_AI_ACADEMIC_APPROVAL.md)
