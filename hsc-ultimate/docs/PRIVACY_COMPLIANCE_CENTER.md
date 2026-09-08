# Privacy & Compliance Center

**তারিখ:** ৫ আগস্ট ২০২৬  
**Internal status:** `LOCAL_COMPLIANCE_READY`  
**Public deployment:** হয়নি  
**Play Store publish/submission:** হয়নি এবং এখন করা হবে না

## Scope

এই phase policy text লিখে থামেনি। Code/data behavior-এর সঙ্গে disclosure মিলিয়ে নিচের end-to-end controls তৈরি/সংশোধন করা হয়েছে:

- Public, indexable `/privacy`, `/terms` ও `/account-deletion`
- Central version metadata: Privacy/Terms/Age Assurance `2026.08.05`
- Registration-এ required Privacy/Terms acknowledgement + age/guardian assurance
- Atomic account + immutable `PolicyAcceptance` write
- Existing user-এর Settings-এ current/stale version audit ও explicit acknowledgement
- Strict Focus consent version `2026-08-05`; stale version Admin start/schedule authorize করতে পারে না
- AI/PDF/Accessibility prominent data-flow notice
- Account export v2: learning, AI/PDF, Focus, native/device, community ও policy history
- Account deletion-এ cascade-এর বাইরের reset/broadcast/direct references cleanup এবং retained audit identifiers redaction
- System Operations-এ privacy readiness + current acknowledgement coverage
- Sitemap/robots/footer/onboarding/Settings links
- Android native data-use string এবং `canRetrieveWindowContent=false` / `isAccessibilityTool=false` verification
- Play Store Data Safety ও Accessibility declaration draft—submission নয়
- Strict static audit + CI/release integration

## Public policy versions

| Document | Route | Version | Effective |
|---|---|---:|---:|
| Privacy Policy | `/privacy` | `2026.08.05` | 2026-08-05 |
| Terms of Use | `/terms` | `2026.08.05` | 2026-08-05 |
| Account deletion guide | `/account-deletion` | `2026.08.05` | — |
| Age/guardian assurance | Registration + Settings | `2026.08.05` | 2026-08-05 |
| Strict Focus disclosure | `/focus` | `2026-08-05` | 2026-08-05 |

Version source of truth:

```text
lib/privacy-compliance.ts
lib/focus-constants.ts
```

Policy acknowledgement **optional feature-এর blanket consent নয়**। Public profile, digest, push, Focus Contract, Accessibility permission এবং Admin Focus analytics sharing আলাদা control।

## Versioned acceptance integrity

New model:

```text
PolicyAcceptance
- userId (cascade delete)
- privacyVersion
- termsVersion
- ageAssuranceVersion
- source: REGISTRATION | SETTINGS
- acceptedAt
- unique exact version tuple
```

Registration flow:

1. User policy ও age/guardian checkbox affirmative action দেয়।
2. Client exact current versions পাঠায়।
3. Server literal version/true assurance validate করে।
4. User + acceptance এক DB transaction-এ তৈরি হয়।
5. Stale client version হলে registration silently old policy accept করায় না।

Existing account flow:

- Live post-migration state: `0/1` current acknowledgement, `0` total records—existing Admin-কে acceptance auto-assign করা হয়নি; Settings থেকে সত্যিকারভাবে acknowledge করলে তবেই count বাড়বে।
- Settings → Privacy tab latest record ও current versions compare করে।
- Legacy/stale account usable থাকে; false acceptance backfill করা হয়নি।
- User পড়ে দুটো assurance দিলে authenticated endpoint exact current tuple লিখে।
- User-row lock + unique tuple duplicate/concurrent acceptance আটকায়।
- Acceptance event AuditLog-এ version names only রাখে; password/raw IP acceptance row-এ নেই।

## Actual data-flow inventory

| Category | Main data | Destination/use |
|---|---|---|
| Account/profile | name, email, password hash, batch, board, preferences | Auth/profile DB |
| Learning | answers, scores, time, progress, plans, notes, habits, XP | Results/adaptive/analytics DB |
| AI | prompt, relevant history, optional image/CQ/note context | Groq/Mistral/Cerebras/OpenRouter fallback |
| PDF | filename, extracted chunks, vectors, chat/summary/mind map | App extraction, Mistral embedding, PostgreSQL/pgvector |
| Community | public opt-in/profile, forum/shared content, group/battle activity | HSC Ultimate DB/public only when user chooses |
| Strict Focus | contract/version, timing, schedule, emergency event, device/push status | DB; foreground package name device-local only |
| Notifications | email preference, web push endpoint/key, FCM token, delivery state | Resend/browser push/FCM where enabled |
| Security | session, hashed limiter identity, admin/security audit/IP | Authentication/abuse/incident operations |

No advertising SDK, payment data, precise location, contacts, SMS/call log or advertising ID flow was found in current source.

## AI/PDF disclosure

Configured AI paths:

- Groq
- Mistral AI
- Cerebras
- OpenRouter (gateway/upstream model may also process request)

AI input notices এখন:

- `/ai-tutor` header
- PDF upload card
- Privacy Policy AI/PDF sections
- Settings Privacy tab
- Onboarding summary

PDF behavior accurately documented:

- Original binary request memory-তে processed; object storage-এ persist নয়
- Extracted text/metadata/chunks persist
- Mistral embedding API-তে chunk পাঠানো হয়
- Vectors DB-তে থাকে কিন্তু user export-এ বাদ
- PDF delete/account delete-এ chunk/vector/chat cascade-delete

## Strict Focus / Accessibility disclosure integrity

Android configuration:

```xml
android:canRetrieveWindowContent="false"
android:isAccessibilityTool="false"
android:allowBackup="false"
android:fullBackupContent="false"
```

Strict Focus consent/token/replay state যেন Android cloud backup-এ চলে না যায়, তাই app backup-ও disabled।

Prominent disclosure normal Focus flow-তে permission settings খোলার আগে দেখায় এবং আলাদা checkbox লাগে। Disclosure স্পষ্ট করে:

- শুধু active timer-এ foreground package name transientভাবে দেখা হয়
- screen text/message/password/image/keystroke/browsing content পড়া বা upload হয় না
- blocked package server-এ যায় না
- Phone/Emergency/Alarm/keyboard/System UI allowlisted
- permission optional ও revoke করা যায়
- emergency exit mandatory
- server-এ consent/session/device capability/FCM token/receipt থাকতে পারে

Focus consent material disclosure বদলানোয় version `2026-08-05` হয়েছে। `hasCurrentFocusConsent()` এখন Admin immediate start, new schedule এবং due schedule claim—তিন জায়গায় exact version gate। পুরোনো consent silently valid নয়।

Google Play-এর official AccessibilityService guidance অনুযায়ী non-accessibility-tool app-এর disclosure website/Privacy Policy-তে শুধু থাকলেই হয় না; normal in-app flow-তে separate disclosure ও affirmative consent লাগবে। Current implementation এই code-level requirement target করে, কিন্তু Play approval দাবি করে না:

- https://support.google.com/googleplay/android-developer/answer/10964491?hl=en
- https://support.google.com/googleplay/android-developer/answer/11150561?hl=en

## Export v2 scope ও privacy corrections

আগের export description “সব data” বললেও নতুন Focus/native/review/PDF content এবং কিছু user-linked models বাদ ছিল। Duel row পুরো export করলে opponent answer leak হওয়ারও ঝুঁকি ছিল; group include করলে invite code বেরোতে পারত। Export v2 এখন:

### Included

- Full non-secret profile/preferences/moderation state
- MCQ/CQ/mock/live/admission attempts ও progress
- Flashcards/tasks/plans/habits/notes/bookmarks/sessions
- AI chat + optional stored image
- PDF metadata, extracted chunks, chat, summary, mind map (vector নয়)
- Custom generated questions
- Forum/vote/report/shared activity
- Sanitized study-group membership (invite code নয়)
- Sanitized own duel answer/outcome (opponent answer/identity নয়)
- Focus Contract/session/schedule
- Native device metadata + delivery state (raw token/command ID নয়)
- Policy acceptance history
- Own admin-authored reviews/broadcast/audit action names

### Excluded by design

- Password hash/reset token
- Auth/session secret
- Web push encryption secret/full endpoint
- Raw FCM token
- PDF vector embedding
- Rate-limit identity/IP
- Other user’s private answer/identity/group invite code
- Raw internal security metadata

Response headers `no-store, private` এবং `nosniff`।

## Account deletion reconciliation

Normal account-linked records Prisma FK cascade/SetNull-এ delete হয়। Audit-এ direct string references থাকা কিছু table cascade হতো না; এখন deletion flow additionally:

- Matching email password-reset tokens delete
- BroadcastRecipient direct `userId` rows delete
- Campaign sender/template creator IDs null
- ContentReport reviewer ID null
- Other user ban-এর `bannedBy` null
- SystemSetting updater ID null
- Actor audit name/email/IP/user ID null
- Direct deleted-user target ID null, target type `DeletedUser`, metadata redacted
- PolicyAcceptance cascade-delete

Admin delete-এর পরে নতুন audit event target name/email আর সংরক্ষণ করে না; শুধু role + redaction marker থাকে। De-identified security event fact legitimate abuse/accountability purpose-এ থাকতে পারে—public policy/UI এখন এটা overclaim না করে স্পষ্ট বলে।

Google Play account-creation app-এর জন্য in-app path এবং external web resource দুটোই চায়। `/account-deletion` web resource login → Settings deletion path, reset-password fallback ও identity-safe explanation দেয়। Public HTTPS deployment ছাড়া Play Console-এ URL submit করা হয়নি:

- https://support.google.com/googleplay/android-developer/answer/13327111?hl=en

## Retention truth

Current behavior অতিরঞ্জিত না করে policy-তে লেখা:

- Account/learning: item/account deletion পর্যন্ত
- AI chat/image: clear/account deletion পর্যন্ত
- PDF-derived data: document/account deletion পর্যন্ত
- Reset token: ১ ঘণ্টা valid; account deletion matching tokens remove করে
- Native delivery log: ৯০ দিনের operational target; push pipeline চললে prune
- Security audit: need-based, deletion-এ direct identifiers scrub
- Local data: browser/app clear, feature completion বা uninstall পর্যন্ত

**External gap:** provider backup/PITR expiry ও guaranteed background retention scheduler public production-এর আগে final করতে হবে।

## System Operations telemetry

Admin System Operations response/UI এখন secret-free ভাবে দেখায়:

- Privacy/Terms public route readiness
- Current Privacy/Terms/Age versions
- Current-version acceptance count
- Missing/stale user count

Existing user-কে acceptance না দিয়েই count বাড়ানো হয় না।

## Automated audit

Commands:

```bash
npm run audit:privacy
npm run audit:privacy:strict
```

Audit covers:

- required Privacy/Terms sections
- public account deletion guide
- registration transaction/version fields
- existing-user Settings acknowledgement
- footer/onboarding links
- export scope/exclusions
- deletion non-FK cleanup/redaction
- Prisma model/migration
- Focus version gate
- Android package-only configuration + prominent disclosure
- AI processor inventory
- retention inventory
- sitemap/robots
- Play draft files
- contact env template

`verify:full`, CI artifact এবং release preflight-এ privacy gate যুক্ত। Audit DB write করে না এবং secret value report করে না।

Final verification:

```text
Privacy static audit: 19 PASS · 1 pre-launch WARN · 0 FAIL
Privacy live E2E: 16/16; cleanup users/audit/campaigns/templates/resetTokens = 0
Web unit: 106/106
Pure logic: 162/162
API security: 213/213 global coverage; auth/admin/mutation gaps 0
Performance: 80/80 FK coverage; 18/18 critical indexes; slow plans 0
Android: JVM tests + assembleDebug + lintDebug PASS
Migration: 33/33 applied
Production build: 181/181 generated route entries
Release preflight: LOCAL_READY · 22 PASS · 1 WARN · 0 FAIL
```

## External/manual pending

`LOCAL_COMPLIANCE_READY` মানে Play/legal approval নয়। Pending:

1. Public HTTPS URL/domain
2. Verified operator legal identity/service address
3. `PRIVACY_CONTACT_EMAIL` verified mailbox
4. Qualified Bangladesh/target-market legal review
5. Provider DPA/retention/cross-border review
6. Public backup/PITR deletion lifecycle
7. Play Console Data Safety form submission
8. Accessibility declaration + complete demo video + Play approval
9. Physical Android disclosure/decline/revoke/OEM test
10. Target audience/Families/child-safety classification

## Relevant files

- `lib/privacy-compliance.ts`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/account-deletion/page.tsx`
- `components/legal/policy-page-shell.tsx`
- `components/settings/privacy-controls-tab.tsx`
- `app/api/user/policy-acceptance/route.ts`
- `lib/account-privacy.ts`
- `scripts/audit-privacy-compliance.ts`
- `docs/PLAY_STORE_DATA_SAFETY_DRAFT.md`
- `docs/ANDROID_ACCESSIBILITY_DECLARATION_DRAFT.md`
- `prisma/migrations/20260805000000_add_privacy_compliance/migration.sql`
