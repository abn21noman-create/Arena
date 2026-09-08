# Android AccessibilityService Declaration — Internal Draft

**Prepared:** 5 August 2026  
**Package:** `com.hscultimate.app`  
**Service:** `.StrictFocusAccessibilityService`  
**Declared accessibility tool:** **No** (`isAccessibilityTool=false`)  
**Play submission/approval:** not performed

Official references:

- https://support.google.com/googleplay/android-developer/answer/10964491?hl=en
- https://support.google.com/googleplay/android-developer/answer/11150561?hl=en

> This is a truthful source-based draft for later Play Console work. Re-record the final physical-device flow and recheck current policy immediately before submission.

## 1. Core purpose statement draft

HSC Ultimate uses Android AccessibilityService only for the optional **Strict Focus** study timer. During a user-consented active timer, the service receives window-state events, reads the foreground app’s package name, compares it with a local safety allowlist, and returns the user to HSC Ultimate when a non-allowlisted distracting app opens.

This narrow function helps the user follow a study commitment. It is not an accessibility tool for disability support and is declared `isAccessibilityTool=false`.

## 2. Data accessed

### Accessed transiently on device

- Current foreground application package name from `AccessibilityEvent.getPackageName()`
- Only while Strict Focus is active
- Only window-state/window-change events

### Not accessed

- Window/screen text
- Messages
- Passwords
- Images/screenshots
- Keystrokes
- Browser page content/history
- Contacts
- Audio/microphone
- Location
- Installed-app inventory

Configuration evidence:

```xml
android:accessibilityEventTypes="typeWindowStateChanged|typeWindowsChanged"
android:canRetrieveWindowContent="false"
android:accessibilityFlags="flagDefault"
android:isAccessibilityTool="false"
```

The Java service calls `event.getPackageName()` only; it does not call `getText()`, inspect node trees, retrieve windows, capture the screen or upload the package name.

## 3. How data is used/shared

Foreground package name:

- Used in memory on the device for allowlist comparison
- May be placed transiently in an internal Intent to return to HSC Ultimate UI
- Not persisted as browsing/app history
- Not sent to HSC Ultimate server
- Not sent to advertising/analytics providers

Separate operational data can be stored server-side and is disclosed independently:

- Focus consent version/time and user-selected Admin duration limit
- Focus session/schedule status and emergency reason
- Accessibility-enabled/remote-capable boolean
- App version/device model when provided
- FCM token and short-lived command/delivery receipt status

These operational fields do not contain the blocked foreground package name or screen content.

## 4. Prominent in-app disclosure text (current meaning)

The normal Strict Focus flow displays a separate card before opening Android Accessibility Settings. It tells the user:

1. Strict Focus detects only the currently foreground app’s package name.
2. It does not read/send screen text, messages, passwords, images or browsing content.
3. It enforces blocking only while an active focus timer runs.
4. Phone, emergency dialer, keyboard, Clock/Alarm, System UI and HSC Ultimate remain allowed.
5. The feature is optional and can be disabled.
6. A full Privacy disclosure is linked.

The user must tick an unchecked affirmative checkbox before the “Accessibility Settings খোলো” button becomes enabled. Simply opening the app, accepting Terms or using another feature does not count as Accessibility consent.

## 5. Consent/decline/revoke flow

- Default: Accessibility permission off
- Disclosure shown before system settings
- Affirmative checkbox required
- User can decline and continue using the rest of HSC Ultimate
- User can later enable through the same flow
- User can revoke in Android settings at any time
- User can disable Admin remote Focus Contract independently
- Contract revoke cancels active Admin Focus/schedules and disables remote capability
- Emergency exit remains available during active timer

## 6. Safety allowlist

Minimum allowlist includes:

- `com.hscultimate.app`
- Android/Google phone dialer and telecom/emergency packages
- Android/Google/Samsung Clock/Alarm
- System UI
- Current/default keyboard plus known keyboard packages

The app does not prevent shutdown, settings access through hidden surveillance, uninstall, Accessibility disable or emergency calls. It is not enterprise device-owner/lock-task kiosk functionality.

## 7. Admin remote start boundaries

Admin start is not unconditional:

- User must enable a current-version Focus Contract
- User selects maximum duration from 20–120 minutes
- Exact consent version is checked at immediate start, schedule creation and due schedule execution
- User may revoke any time
- Historical analytics remains private unless separately opted in
- Active session visibility exists only for safe operational stop
- Emergency exit is mandatory and audited

Current disclosure version: `2026-08-05`.

## 8. Play Console declaration answers — draft

| Prompt concept | Draft answer |
|---|---|
| Is app an accessibility tool? | No |
| Core functionality using API | Optional consent-based study focus timer/app redirection |
| Data accessed | Foreground package name only, transiently during active timer |
| Data collected/shared via AccessibilityService | No foreground package/screen content collected or shared |
| Automation purpose | Narrow, user-understood redirect from non-allowlisted app during user-timed session |
| Can user decline? | Yes; all non-Focus features remain available |
| Is affirmative disclosure/consent present? | Yes, separate in normal flow before settings |
| Does app change settings autonomously? | No; user opens Android settings and grants/revokes permission |
| Does app bypass privacy/security controls? | No |
| Does app prevent uninstall/disable? | No |

Final Play form wording must match the form shown at submission time.

## 9. Demo video shot list (must be recorded later on physical Android)

One continuous, readable recording should show:

1. Fresh app launch/login
2. Navigate normally to Strict Focus
3. Accessibility permission is initially off
4. Full separate disclosure—slow scroll if needed
5. Checkbox starts unchecked
6. Decline/no consent path; app remains usable
7. Return and check affirmative box
8. Tap button and open Android Accessibility Settings
9. Enable `HSC Ultimate Strict Focus`
10. Return to app; permission status updates
11. Start a short self Focus session
12. Open a non-allowlisted test app; redirect occurs
13. Open Phone/Emergency/Clock/keyboard; allowed
14. Use emergency exit
15. Disable Accessibility permission
16. Show Focus Contract revoke and analytics-sharing controls
17. Show Privacy link/data-use disclosure

Do not splice a video in a way that hides disclosure, checkbox or system permission flow. Do not use emulator-only evidence for final submission.

## 10. Pre-submission technical checklist

- [x] `canRetrieveWindowContent=false`
- [x] `isAccessibilityTool=false` on API 31+ config
- [x] Event types minimized
- [x] Package-only Java implementation
- [x] Separate prominent disclosure
- [x] Affirmative checkbox
- [x] Decline path
- [x] Permission revocable
- [x] Emergency allowlist/exit
- [x] Current consent version gate
- [x] Native data-use string
- [x] Android backup disabled for consent/token/replay state
- [x] JVM tests + debug APK + Android lint pass after disclosure changes
- [ ] Final public Privacy URL
- [ ] Verified operator/privacy contact
- [ ] Physical OEM test
- [ ] Final disclosure screenshot/video
- [ ] Play Console Permission Declaration Form
- [ ] Google Play review/approval

## 11. Files proving implementation

- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/xml/strict_focus_accessibility_service.xml`
- `android/app/src/main/res/xml-v31/strict_focus_accessibility_service.xml`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/java/com/hscultimate/app/StrictFocusAccessibilityService.java`
- `android/app/src/main/java/com/hscultimate/app/StrictFocusStore.java`
- `components/focus/strict-focus-dashboard.tsx`
- `lib/focus-constants.ts`
- `lib/focus.ts`
- `lib/focus-schedule.ts`
- `app/privacy/page.tsx`

No claim of Play compliance approval is made until the final declaration is submitted and accepted.
