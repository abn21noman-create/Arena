# Android Strict Focus / Firebase Delivery Readiness

**তারিখ:** ৪ আগস্ট ২০২৬  
**Status:** Server, database, web bridge, Android unit/compile/lint complete; real Firebase credentials + physical-device delivery pending

## উদ্দেশ্য

আগের FCM path consent ও Accessibility check করত, কিন্তু closed-app command server থেকে পাঠানো হয়েছে মানেই device-এ enforcement সত্যিই শুরু হয়েছে—এটি জানা যেত না। Invalid token delete হয়ে audit history-ও হারাত। Firebase initialization/send exception Admin Focus API-কে reject করার ঝুঁকিও ছিল, যদিও server session ইতিমধ্যে তৈরি হয়ে যেতে পারত।

এই phase delivery lifecycle-কে observable, replay-safe ও failure-tolerant করেছে।

## Database

Migration:

```text
20260804040000_add_native_push_delivery_readiness
```

Delivery migration applied at 25/25; full database এখন **29/29** migration-এ up to date।

### `NativeDevice` diagnostics

যোগ হয়েছে:

- app version ও optional device model
- last push attempt/success/failure
- safe Firebase error code
- last command ID
- last native receipt/status
- soft-disabled timestamp/reason
- stale-device index

Invalid FCM token এখন row hard-delete না করে soft-disable হয়। একই valid token app থেকে পুনরায় register হলে disabled state পরিষ্কার হয়। User নিজে device unlink করলে row ও related delivery cascade-delete হয়।

### `NativePushDelivery`

প্রতিটি command/device pair-এর bounded audit record:

- command ID
- device relation
- Focus session ID
- START/STOP type
- PENDING/SENT/FAILED/native receipt status
- issued/expiry/sent/receipt time
- safe error code

৯০ দিনের পুরোনো delivery send pipeline-এর সময় prune হয়।

## Failure-safe server delivery

`lib/native-push.ts` এখন:

1. Firebase credential triplet complete কিনা পরীক্ষা করে;
2. consent-capable, Accessibility-enabled, non-disabled, গত ৯০ দিনে seen device বেছে নেয়;
3. random command ID + issue time + ৬০ সেকেন্ড TTL তৈরি করে;
4. send-এর আগে delivery attempt persist করে;
5. প্রতিটি multicast response অনুযায়ী device/delivery status update করে;
6. invalid token soft-disable করে;
7. global/partial Firebase failure safe code-এ রেকর্ড করে;
8. কোনো Firebase initialization/send exception Focus session API-তে throw করে না।

Firebase না থাকলে stable fallback:

```json
{
  "configured": false,
  "eligibleDevices": 0,
  "sent": 0,
  "failed": 0,
  "disabled": 0,
  "errorCode": "FIREBASE_NOT_CONFIGURED"
}
```

App-open polling, SSE notification ও web overlay তখনও চলে।

## Native replay/expiry protection

প্রতিটি START/STOP data message এখন বহন করে:

```text
commandId
issuedAtEpochMs
sessionId
```

Android-এর pure `StrictFocusCommandGuard` যাচাই করে:

- command ID format
- session ID format
- command সর্বোচ্চ ১২০ সেকেন্ড পুরোনো
- সর্বোচ্চ ৩০ সেকেন্ড future clock skew
- START duration ২০–১২০ মিনিট
- end time future এবং contract maximum-এর মধ্যে
- processed command replay নয়

সর্বশেষ ২০টি command ID local private preferences-এ থাকে। ফলে পুরোনো START command STOP-এর পরে replay হয়ে session আবার চালু করতে পারে না।

Local consent ও Accessibility permission আগের মতো বাধ্যতামূলক। STOP শুধু matching active session বন্ধ করতে পারে। Emergency exit/Phone/Alarm allowlist অপরিবর্তিত।

## Native receipt lifecycle

Android result status:

- `STARTED`
- `STOPPED`
- `REJECTED_NO_CONSENT`
- `REJECTED_ACCESSIBILITY_DISABLED`
- `REJECTED_EXPIRED`
- `REJECTED_FUTURE_COMMAND`
- `REJECTED_MALFORMED`
- `REJECTED_SESSION_MISMATCH`

সর্বশেষ ১০টি receipt local queue-তে থাকে। Authenticated WebView পরের app open/visibility-তে:

```text
POST /api/native-devices/receipts
```

এ পাঠায়। Server commandId + device + session + type exact match করে delivery row update করে। `STARTED` receipt active FocusSession-এর `nativeEnforcementActive` ও heartbeat update করে। Successful sync-এর পরেই local queue clear হয়।

Receipt-এ screen text, foreground app history, message, password বা browsing content নেই।

## Device registration

`/api/native-devices` এখন:

- `GET` — user-এর নিজের safe device status list
- `POST` — token/capability/app version upsert ও disabled token re-enable
- `DELETE` — validated token দিয়ে unlink

Token API response/Admin UI-তে ফেরত যায় না। Admin diagnostics শুধু SHA-256 token fingerprint-এর প্রথম ১২ character দেখায়।

## Admin diagnostics

`/admin/focus`-এ নতুন **Native Delivery Diagnostics** card:

- Firebase runtime: unconfigured/partial/ready/degraded
- registered/remote-ready/disabled/stale count
- app version ও device model
- Accessibility/remote consent readiness
- last delivery ও receipt status
- safe error/disable reason
- token fingerprint
- ৩০ সেকেন্ড auto-refresh

Admin API:

```text
GET /api/admin/focus/native-devices
```

কোনো unsolicited test Focus push button যোগ করা হয়নি—user consent ছাড়া diagnostic push পাঠানো হবে না।

## Health & secret validation

`GET /api/health` এখন credential value ছাড়া native push status দেয়।

- `unconfigured` optional অবস্থায় overall health degrade করে না
- `partial` বা runtime `degraded` হলে health degraded

`npm run check:secrets` Firebase project ID/client email/private key triplet partial কিনা, email shape এবং PEM marker যাচাই করে; secret value print করে না।

## Live database verification

Temporary device + delivery দিয়ে যাচাই:

```text
Receipt exact match:       1
Unknown receipt unmatched: 1
Delivery status persisted: STARTED
Device receipt persisted:  STARTED
Firebase absent fallback:  FIREBASE_NOT_CONFIGURED
```

Cleanup:

```text
NativeDevice       0 → test → 0
NativePushDelivery 0 → test → 0
```

কোনো test device/delivery/session অবশিষ্ট নেই।

## Android verification

নতুন JVM tests:

```text
StrictFocusCommandGuardTest: 5/5
Existing template test:       1/1
```

যাচাই করা cases:

- fresh command accept
- expired/future command reject
- malformed/replay reject
- session/duration/deadline bounds
- latest ২০ command bounded replay memory

Native pipeline:

- Capacitor Doctor: Android looking great
- `testDebugUnitTest`: pass
- `assembleDebug`: pass
- `lintDebug`: pass
- Debug APK: ~5.8 MB
- JDK 21 / SDK 36 / Gradle 8.13

প্রথম combined Gradle run ১.৯ GB RAM/০ swap-এ daemon OOM হয়েছিল। `scripts/android-check.sh` এখন low-RAM temporary ২ GB swap, single worker এবং test/build/lint আলাদা process-এ চালায়; rerun সফল এবং swap auto-clean হয়েছে।

## Verification summary

- Current web unit tests: **93/93**
- Android JVM tests: **6/6**
- TypeScript: 0 error
- ESLint: 0 warning
- Full database migration status: **26/26**
- Temporary DB test data: 0
- Preview: off

- Full web verification: pass
- Current production build: compile + TypeScript + **206/206**, exit 0

## External/manual remaining

1. `android/app/google-services.json`
2. `FIREBASE_PROJECT_ID`
3. `FIREBASE_CLIENT_EMAIL`
4. `FIREBASE_PRIVATE_KEY`
5. Real Firebase multicast delivery test
6. Physical Android device-এ background launch, OEM battery optimization ও Accessibility behavior test

এই credentials/files ছাড়া app-open web/SSE/poll path চলবে এবং closed-app FCM path safe `configured: false` result দেবে।

## Relevant files

- `prisma/migrations/20260804040000_add_native_push_delivery_readiness/migration.sql`
- `prisma/schema.prisma`
- `lib/native-push.ts`
- `lib/native-receipts.ts`
- `app/api/native-devices/route.ts`
- `app/api/native-devices/receipts/route.ts`
- `app/api/admin/focus/native-devices/route.ts`
- `app/api/health/route.ts`
- `lib/strict-focus-client.ts`
- `lib/capacitor.ts`
- `components/focus/focus-enforcer.tsx`
- `components/admin/native-delivery-diagnostics.tsx`
- `android/app/src/main/java/com/hscultimate/app/StrictFocusCommandGuard.java`
- `android/app/src/main/java/com/hscultimate/app/HSCFirebaseMessagingService.java`
- `android/app/src/main/java/com/hscultimate/app/StrictFocusStore.java`
- `android/app/src/main/java/com/hscultimate/app/StrictFocusPlugin.java`
- `android/app/src/test/java/com/hscultimate/app/StrictFocusCommandGuardTest.java`
- `scripts/android-check.sh`
