# Strict Focus — Consent-Based Deep Study

## উদ্দেশ্য

২০ মিনিট থেকে সর্বোচ্চ ২ ঘণ্টা Deep Study session। Native Android app-এ Accessibility permission চালু থাকলে HSC Ultimate, Phone/Emergency, keyboard এবং Clock/Alarm ছাড়া অন্য foreground app খুললে user-কে HSC Ultimate-এ ফেরত আনা হয়।

## Safety model

- Remote Admin start default-এ বন্ধ।
- User নিজের account/device থেকে Focus Contract চালু না করলে Admin start API 403 দেয়।
- User Admin-এর সর্বোচ্চ duration নিজে ঠিক করে (২০–১২০ মিনিট)।
- User contract যেকোনো সময় revoke করতে পারে; active Admin session তখন cancel হয়।
- Emergency exit সবসময় থাকে, ৫ সেকেন্ড safety delay ও কারণসহ; audit log তৈরি হয়।
- Phone/Emergency, system UI, current keyboard এবং Clock/Alarm allowlisted।
- Accessibility service শুধু foreground package name দেখে; window text/content retrieval বন্ধ (`canRetrieveWindowContent=false`)।
- Timer wall-clock ও Android monotonic elapsed time—দুটো দিয়ে যাচাই হয় এবং reboot-এর পর unexpired session restore হয়।

## User flow

1. `/focus` → Accessibility disclosure পড়ে permission settings খুলুন।
2. Self Focus-এর জন্য ২০–১২০ মিনিট নির্বাচন করে start করুন।
3. Admin control চাইলে Focus Contract toggle চালু, max duration নির্বাচন ও consent checkbox confirm করুন। Current disclosure version `2026-08-05`; পুরোনো version immediate start/schedule/due-run authorize করে না এবং explicit re-confirmation লাগে।
4. Native push token registered থাকলে Admin command app বন্ধ থাকলেও FCM data message দিয়ে আসে।
5. Timer শেষ হলে session `COMPLETED`; safety exit করলে `EMERGENCY_EXIT`।

## Admin flow

`/admin/focus` থেকে শুধু consent দেওয়া user দেখা যায়। Admin duration contract limit-এর বেশি দিতে পারে না। একই user-এর একসঙ্গে দ্বিতীয় active session database partial unique index ও row lock—দুই স্তরে blocked। Admin জরুরি কারণে session cancel করতে পারে এবং audit log হয়। Admin নিজের session `/focus` থেকে চালাবে।

## Focus Analytics

User analytics: `/focus/analytics`; privacy-controlled Admin analytics: `/admin/focus/analytics`। 7/30/90-day time, completion, emergency exit, streak, Self/Admin এবং subject breakdown দেখায়। Historical Admin sharing default-এ off। বিস্তারিত [`FOCUS_ANALYTICS.md`](./FOCUS_ANALYTICS.md)।

## Focus Scheduling

Admin one-time/daily/weekly future session schedule করতে পারে। পাঁচ মিনিট reminder, user cancel, Admin pause/resume/cancel, lazy activation এবং protected cron path আছে। Contract revoke future schedules cancel করে। বিস্তারিত [`FOCUS_SCHEDULING.md`](./FOCUS_SCHEDULING.md)।

## Server/API

- `GET/PUT /api/focus/contract`
- `GET /api/focus/analytics`
- `GET/POST /api/focus/session`
- `PATCH /api/focus/session/[sessionId]`
- `GET/POST /api/admin/focus`
- `PATCH /api/admin/focus/[sessionId]`
- `GET/POST/DELETE /api/native-devices`
- `POST /api/native-devices/receipts`
- `GET /api/admin/focus/native-devices`

Native delivery models: `NativeDevice`, `NativePushDelivery`। Core migration `20260804000000_add_strict_focus`; delivery readiness migration `20260804040000_add_native_push_delivery_readiness`। Full schema এখন 25/25 applied।

## Android implementation

- `StrictFocusPlugin` — Capacitor bridge
- `StrictFocusService` — foreground timer service
- `StrictFocusAccessibilityService` — package-only app enforcement
- `StrictFocusBootReceiver` — reboot restore
- `HSCFirebaseMessagingService` — consent-gated command + queued native receipt
- `StrictFocusCommandGuard` — pure expiry/future/replay/session/duration validation
- `NativePushDelivery` server pipeline — per-device send/failure/receipt audit ও invalid-token soft-disable

Android requirements: Node 22, JDK 21, compile/target SDK 36, AGP 8.13, Gradle 8.13.

```bash
npm ci
mkdir -p out
printf '<!doctype html><title>HSC Ultimate</title>' > out/index.html
npx cap sync android
cd android
./gradlew testDebugUnitTest
./gradlew assembleDebug
./gradlew lintDebug
```

## Optional FCM setup

Remote command while the app is closed requires:

- `android/app/google-services.json`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Without these, Admin session still works through web/SSE polling while the app is active; native background command returns `configured: false` safely। Delivery/replay/receipt details: [`NATIVE_PUSH_DELIVERY_READINESS.md`](./NATIVE_PUSH_DELIVERY_READINESS.md)।

## Play policy

Accessibility use must have a prominent in-app disclosure, affirmative consent and an accurate Play Console declaration. The UI includes a separate disclosure before opening Android Accessibility Settings. Reference: https://support.google.com/googleplay/android-developer/answer/10964491

## বাস্তব সীমাবদ্ধতা

এটি personal-device app blocker, enterprise Device Owner/Kiosk mode নয়। User OS-level settings, safe mode, uninstall বা permission revoke দিয়ে শেষ পর্যন্ত control ফেরত নিতে পারে। ইচ্ছাকৃতভাবে shutdown prevention বা emergency communication blocking যোগ করা হয়নি। এটি safety feature, গোপন surveillance বা unconsented remote device control নয়।

## যাচাই

- Current web unit tests: 93/93 pass
- Android JVM tests: 6/6 pass (command guard 5/5)
- Existing Focus scheduling/analytics E2E baseline: 37/37
- Contract consent/revoke, Admin start, duration limit, duplicate guard, early-complete rejection, emergency exit, self-focus ও audit log verified
- Temporary device/delivery receipt match + unmatched + cascade cleanup verified
- Android `testDebugUnitTest`: success
- Android `assembleDebug`: success (debug APK ~5.8 MB)
- Android `lintDebug`: success
