# Feature Polish, UI/UX & Live-User Acceptance

**তারিখ:** ৫ আগস্ট ২০২৬  
**সিদ্ধান্ত:** `PASS / LOCAL_READY`  
**নীতিগত শর্ত:** Runtime-এ কোনো mock, fake বা no-op data যোগ করা হয়নি। সব acceptance mutation বাস্তব PostgreSQL-এ reserved disposable user দিয়ে হয়েছে এবং exact ID/email ধরে cleanup হয়েছে।

## ১. এই phase-এ কী উন্নত হয়েছে

### Universal real-data search

- আগে `Ctrl/Cmd + K` search শুধু Dashboard component mount থাকলে কাজ করত। এখন একটিমাত্র application-level search controller সব authenticated route-এ mount থাকে।
- Dashboard, desktop sidebar এবং mobile “আরও” sheet—তিন জায়গা থেকেই একই controller খোলে; duplicate dialog/listener নেই।
- ফলাফল `/api/search` থেকে বাস্তব Subject, Topic, নিজের Flashcard Deck ও Forum Post data নেয়।
- ৩০০ms debounce, stale request `AbortController` cancellation, response-status validation, retry UI এবং empty-result বনাম network/server error আলাদা করা হয়েছে।
- Search input-এ combobox/listbox semantics, keyboard Up/Down/Enter এবং live status আছে।

### Mobile navigation redesign

- ২০+ tool-এর ছোট ৪-column grid বদলে category-grouped ২-column card layout হয়েছে।
- Module title ও description search করা যায়; বাংলা “ফোকাস” লিখলেও `Strict Focus` পাওয়া যায়।
- Academic content search-এর আলাদা 44px shortcut, দৃশ্যমান close control, safe-area padding ও no-horizontal-overflow নিশ্চিত।
- Tool source of truth এখনও `lib/nav-modules.ts`; sidebar ও mobile menu drift করবে না।

### Route context ও accessibility

- ৮৯/৮৯ page route-এর contextual বাংলা/উপযুক্ত title mapping যোগ হয়েছে।
- Client navigation এবং `router.refresh()`—দুই ক্ষেত্রেই browser title সঠিক থাকে; Dashboard refresh generic root title ফিরিয়ে দিলে guarded head observer তা ঠিক করে।
- Screen reader-এর জন্য polite route-load announcement আছে; কোনো activity telemetry/store করা হয় না।
- ৮৯টি `Link > Button` এবং ২৪টি `Link > raw button`—মোট **১১৩টি nested interactive HTML pattern** সরানো হয়েছে।
- English `aria-label="Back"` সরিয়ে বাংলা label দেওয়া হয়েছে।
- Dashboard text links, Planner edit/check/delete controls, Study Pet name control এবং Settings board/batch controls-এর effective mobile target কমপক্ষে ২৪px করা হয়েছে।
- Touch device-এ custom checklist delete control এখন hover ছাড়াই দৃশ্যমান।
- Base UI Tabs-এর horizontal root ভুলভাবে row layout হওয়ায় Settings profile panel 65px-এ squeeze হচ্ছিল; root এখন column layout। বোর্ড selector আবার পূর্ণ grid width পায়।

### Runtime wording truth

- Adaptive Practice description থেকে ভুল “AI বাছাই” claim সরিয়ে “পারফরম্যান্সভিত্তিক” করা হয়েছে।
- Strict Focus description-এ consent ও ২০–১২০ মিনিটের সীমা স্পষ্ট করা হয়েছে।
- Android native enforcement ছাড়া browser/PWA-কে phone-wide blocker বলা হয়নি।

## ২. QA infrastructure repair ও safety

Audit-এ চারটি existing script `IndentationError`-এর কারণে চালুই হচ্ছিল না:

- `scripts/test-live-api.py`
- `scripts/test-live-pages.py`
- `scripts/test-mobile-layout.py`
- `scripts/take-screenshots-live.py`

সবগুলো syntax-valid করা হয়েছে এবং নতুন shared helper যোগ হয়েছে:

- `scripts/lib/live_test_support.py`

Safety changes:

1. Test account normal registration API দিয়ে তৈরি হয়; Admin suite-এ first login-এর আগে শুধু disposable account role setup হয়। Auth.js session ও live Admin guard স্বাভাবিক HTTP flow-তেই test হয়।
2. Cleanup wildcard নয়—exact random test user ID + reserved email pair ব্যবহার করে।
3. সংশ্লিষ্ট exact XP/Focus audit evidence-ও cleanup হয়; real user/audit row স্পর্শ হয় না।
4. Existing user XP, streak, badge, attempt বা profile আর reset/delete করা হয় না।
5. QA script operator-এর `next dev/start` process-এ global `pkill` চালায় না; কেবল নিজে শুরু করা process group stop করে।
6. `npm run clean:test-data` এখন default read-only dry run; apply করতে explicit `ALLOW_TEST_DATA_CLEANUP=DISPOSABLE_USERS_ONLY` লাগে।
7. Page smoke dynamic route skip করে না; disposable user-এর owned Practice/CQ/Admission/Mock/Deck/Forum/PDF/Duel/Battle/Live Exam records বাস্তব DB/API flow দিয়ে তৈরি করে, তারপর user cascade ও exact audit cleanup করে।

## ৩. Live acceptance result

### Real student journey

```text
46 PASS · 0 FAIL
```

Verified:

- registration, current policy acceptance, bcrypt password storage
- duplicate/weak-password rejection
- correct/wrong login and Auth.js cookie
- anonymous/private/Admin authorization
- real Practice start/submit, anti-cheat answer hiding
- server-side score and exact XP calculation
- mistake-vault persistence
- analytics, tasks, notifications, admission, flashcard and study-plan reads
- public/authenticated page rendering
- exact cleanup

### Broad real API/user journey

```text
112 PASS · 0 FAIL
```

Representative real persistence and behavior:

- 47 authenticated Student/Admin read endpoints
- profile update; Task create/complete/delete
- Habit toggle; Exam Checklist toggle/delete
- Bookmark/Folder persistence and cross-user ownership rejection
- Flashcard deck/card + real FSRS/SM-2 review + own-deck global search
- consent-based Focus Contract enable/start/heartbeat/emergency-exit/revoke
- Reading Room join/heartbeat/leave
- Study Group create/read/leave
- Drill server grading and Mistake Vault
- Admission 100-question start, anti-cheat and server scoring
- Mock Exam start and answer hiding
- Quiz Duel create/cancel
- Quiz Battle create/poll
- Live Exam create/read
- Gamification sync and Student→Admin denial

এই suite সব ২১৩টি mutation destructiveভাবে চালায় না। বরং high-value user journeys real mutation দিয়ে test করে; সব ২১৩/২১৩ API route আলাদাভাবে auth/rate/security static gate-এ covered।

### All-page live HTTP render

```text
89 OK · 0 FAIL · 0 SKIP
```

- Auth, Student, Admin, public এবং সব dynamic route বাস্তব owned IDs দিয়ে render হয়েছে।
- Next error overlay, application error, 500 ও unexpected 404 পাওয়া যায়নি।

### Real Chromium mobile UX

```text
Viewport: 390×844
46 PASS · 0 FAIL
```

৬টি high-traffic page:

- Dashboard
- Learn
- Practice
- Planner
- Strict Focus
- Settings

প্রতিটি পেজে যাচাই:

- exact mobile viewport
- horizontal overflow নেই
- bottom navigation visible
- content bottom-nav-এর নিচে ঢাকা নয়
- interactive target ≥24px
- contextual browser title
- unhandled browser error নেই

Dashboard-এ অতিরিক্ত:

- More menu dialog visible
- বাংলা module filter কাজ করে
- sheet horizontal overflow নেই
- global real-content search খোলে

### Static UI/UX integrity

```text
18 PASS · 0 FAIL
```

এর মধ্যে ৮৯/৮৯ route label, ২২/২২ navigation target, ৭/৭ Python QA syntax, no nested controls, no broken Unicode, no 8–11px text, exact cleanup এবং owned server lifecycle অন্তর্ভুক্ত।

## ৪. Final verification

```text
Pages:                         89
API routes:                   213
Components:                   179
Library TypeScript files:     114
Prisma models/migrations:   67/33
Web unit tests:           109/109
Pure logic assertions:    162/162
Production build routes:  181/181
API security/rate:        213/213
FK indexes:                 80/80
Critical indexes:           18/18
Runtime truth:              15/15
UI/UX integrity:            18/18
Production vulnerabilities:      0
Secret checks:               18/18
```

Final release preflight:

```text
LOCAL_READY
22 PASS · 1 WARN · 0 FAIL
```

একটি warning:

```text
academic-review-backlog: 1,156 unreviewed
```

## ৫. Cleanup-এর পর live database

```text
Users:                       1
Disposable test users:       0
Subjects / Chapters:     13 / 89
Topics:                    185
Core MCQ:                  688
Admission MCQ:             220
CQ:                         64
Badges:                     14
Academic reports:            0
Content reviews/revisions: 1/1
AI review batches/runs:     1/2
AI Approved:                 1
Admin Approved:              0
Non-system orphan test actor logs: 0
```

Academic count, answer বা review evidence acceptance suite পরিবর্তন করেনি। Academic snapshot checksum valid আছে।

## ৬. Machine-readable reports

- `reports/live-user-acceptance-2026-08-05-feature-polish.json`
- `reports/live-student-e2e-2026-08-05-feature-polish.json`
- `reports/live-api-acceptance-2026-08-05-feature-polish.json`
- `reports/live-page-smoke-2026-08-05-feature-polish.json`
- `reports/mobile-ux-acceptance-2026-08-05-feature-polish.json`
- `reports/ux-integrity-2026-08-05-feature-polish.json`
- `reports/api-security-2026-08-05-feature-polish.json`
- `reports/performance-2026-08-05-feature-polish.json`
- `reports/privacy-compliance-2026-08-05-feature-polish.json`
- `reports/runtime-integrity-2026-08-05-feature-polish.json`
- `reports/release-preflight-2026-08-05-feature-polish.json`

## ৭. এখনো external/pending

এই phase public deployment বা Play Store publication নয়। Pending:

1. Public HTTPS URL/domain
2. External scheduler activation
3. Upstash distributed rate-limit credentials
4. Firebase Admin + `google-services.json`
5. Production runtime evidence
6. Physical Android/OEM/closed-app FCM test
7. Full DB PITR/restore operator evidence
8. Academic backlog review এবং source-grounding workflow

## ৮. পরবর্তী recommended phase

**Multi-AI Batch Operations 2.0**:

- cross-instance runner lease ও per-content claim
- retry/resume/pause/cancel
- provider latency/error diagnostics
- deterministic chunked Topic Note review
- protected small-batch cron
- safe 10–25 item Core MCQ approval batches

কোনো warning, pending student report, source-dependent claim বা hash mismatch auto-approve করা যাবে না।
