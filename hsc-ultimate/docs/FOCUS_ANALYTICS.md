# Focus Analytics

## User analytics — `/focus/analytics`

Range: 7, 30 অথবা 90 দিন।

- Effective focus minutes
- Scheduled minutes
- Session count ও average duration
- Completion rate
- Completed, cancelled, active ও emergency-exit count
- Current ও longest daily focus streak
- Self বনাম Admin session distribution
- Subject-wise focus time ও percentage
- Daily minute chart
- Recent session history ও optional label

`effectiveMinutes` session status অনুযায়ী হিসাব হয়। Completed session full/actual completion time, emergency/cancelled session exit পর্যন্ত elapsed time এবং active session current time পর্যন্ত count করে; scheduled duration-এর বেশি কখনো count হয় না।

## Subject tracking

Self ও Admin start API এখন optional `subjectCode` এবং 120-character `focusLabel` নেয়। Supported subject:

- Physics
- Chemistry
- Biology
- Higher Math
- Bangla
- English
- ICT
- General Focus

## Privacy

`FocusContract.shareAnalyticsWithAdmin` default `false`।

- Off: Admin active session দেখতে/stop করতে পারে, historical analytics দেখতে পারে না।
- On: User-এর focus time, completion, subject distribution ও session metadata Admin report/CSV-তে থাকে।
- User toggle বন্ধ করলে পরবর্তী Admin analytics response/export থেকে data সঙ্গে সঙ্গে বাদ পড়ে।
- Admin dashboard hidden/private user count দেখায়, কিন্তু private user-এর identity/history দেখায় না।

## Admin analytics — `/admin/focus/analytics`

- Consent-shared user count
- Hidden/private contract count
- Platform focus minutes
- Completion/emergency/cancelled rate
- Daily platform chart
- Top focused opted-in users
- Subject distribution
- 7/30/90 day filter
- Privacy-filtered UTF-8 CSV export

CSV: `/api/admin/focus/analytics/export?range=7|30|90`

## API

- `GET /api/focus/analytics`
- `GET /api/admin/focus/analytics`
- `GET /api/admin/focus/analytics/export`

সব route authenticated, rate-limited এবং Admin endpoints role-protected।

## Database

Migration: `20260804010000_add_focus_analytics`

- `FocusContract.shareAnalyticsWithAdmin`
- `FocusSession.subjectCode`
- `FocusSession.focusLabel`
- Analytics indexes: user/date, status/date, subject/date

## Verification

- Focus analytics unit tests: 4
- Total unit tests: 29/29 pass
- Focus live E2E: 28/28 pass
- Consent on → Admin report includes user
- Consent off → Admin report excludes user immediately
- Subject breakdown verified with Physics-tagged session
- Emergency count verified
- CSV export verified
- Production build: 198/198 page generation
- Database migrations: 22/22 applied
