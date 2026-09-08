# Admin Focus Scheduling

## Feature

Consent-based future Strict Focus sessions:

- One-time
- Daily recurring
- Weekly recurring
- ২০–১২০ মিনিট duration
- Optional subject ও 120-character label
- User contract maximum duration enforce
- পাঁচ মিনিট আগে in-app/web-push reminder
- Due হলে Web overlay + optional Android FCM enforcement

## Safety & consent

- `FocusContract.allowAdminStart` ছাড়া schedule create হয় না।
- User contract revoke করলে সব ACTIVE/PAUSED future schedule সঙ্গে সঙ্গে `CANCELLED` হয়।
- User `/focus` থেকে নিজের upcoming schedule cancel করতে পারে।
- Admin pause, resume ও cancel করতে পারে।
- Active focus session-এর emergency exit অপরিবর্তিত থাকে।
- Banned user বা revoked consent-এর due schedule auto-cancel হয়।
- User-এর contract duration limit schedule creation ও execution—দুই সময়ে যাচাই হয়।

## Execution architecture

### Lazy processor

`GET /api/focus/session`, User schedule list এবং Admin schedule list due job process করে। App খোলা থাকলে কোনো cron ছাড়াই scheduled session শুরু হয়।

### Production cron

App বন্ধ থাকলেও নির্ধারিত সময়ে DB session ও FCM command তৈরির জন্য প্রতি মিনিটে call:

```http
GET /api/cron/focus-schedules
Authorization: Bearer <CRON_SECRET>
```

`.env.local`/deployment secret:

```bash
CRON_SECRET="$(openssl rand -hex 32)"
```

Production activation-এর recommended free-compatible template হলো Supabase `pg_cron` + `pg_net` (`deploy/supabase-focus-cron.sql.example`)। Vercel Pro/Enterprise template-ও আছে; Hobby plan minute cron সমর্থন করে না। Endpoint GET/POST দুটোই নেয়, secret না থাকলে 503 এবং ভুল secret-এ 401 দেয়। পূর্ণ operations guide: [`FOCUS_SCHEDULER_OPERATIONS.md`](./FOCUS_SCHEDULER_OPERATIONS.md)।

## Race safety

- Cron/Admin runner প্রথমে expiring database lease claim করে; concurrent runner `202 SKIPPED_OVERLAP` পায়।
- Due schedules এরপর `SELECT ... FOR UPDATE` দিয়ে claim হয়।
- Claim-এর সময়ই next recurrence advance/one-time completion mark হয়।
- একই occurrence দুই worker process করতে পারে না।
- Target user-এর active session থাকলে occurrence `SESSION_ACTIVE` হিসেবে skip হয়।
- FocusSession-এর existing partial unique index একই user-এর double active session আটকায়।

## Reminder behavior

`nextRunAt` ৫ মিনিটের মধ্যে এলে atomic `reminderSentAt` claim হয় এবং একবার notification পাঠায়। Recurring schedule next run-এ advance হলে reminder flag reset হয়।

## API

### User

- `GET /api/focus/schedules`
- `DELETE /api/focus/schedules/[scheduleId]`

### Admin

- `GET /api/admin/focus/schedules`
- `POST /api/admin/focus/schedules`
- `PATCH /api/admin/focus/schedules/[scheduleId]`
- `GET /api/admin/focus/scheduler-health`
- `POST /api/admin/focus/scheduler-health` — audited manual run

### Scheduler

- `GET/POST /api/cron/focus-schedules`

## Database

Migrations:

- `20260804020000_add_focus_scheduling`
- `20260804030000_add_focus_scheduler_operations`

Models:

- `FocusSchedule`
- `FocusSchedulerState` — bounded heartbeat, metrics ও cross-instance lease
- `FocusScheduleRepeat`: NONE/DAILY/WEEKLY
- `FocusScheduleStatus`: ACTIVE/PAUSED/COMPLETED/CANCELLED
- FocusSession → FocusSchedule relation
- Due-job indexes on status/nextRunAt ও user/status/nextRunAt

## UI

- `/admin/focus`: scheduler form + active/paused controls + Scheduler Operations heartbeat/queue/manual-run panel
- `/focus`: Upcoming Focus list + user cancel
- Admin and User both subject, label, next time, repeat ও last result দেখতে পারে

## Verification

- Focus recurrence + scheduler health unit tests: 8
- Cron authorization unit tests: 4
- Total project unit tests: 93/93 pass
- Existing Focus scheduling/analytics E2E baseline: 37/37 pass
- Live scheduler operations: missing/wrong auth 401, forced lease overlap 202, authorized GET/POST 200, persistent heartbeat + lease release verified
- Future schedule create, reminder claim, forced due processing, native-safe fallback, daily recurrence, user cancel ও contract-revoke cancellation verified
- Current production build: 206/206 page generation
- Scheduler operations migration verified; full database now 29/29 applied
