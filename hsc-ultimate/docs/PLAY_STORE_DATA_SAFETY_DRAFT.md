# Google Play Data Safety — Internal Draft (Do Not Submit Yet)

**Prepared:** 5 August 2026  
**App:** HSC Ultimate (`com.hscultimate.app`)  
**Status:** Source-based working draft only  
**Play Store publish:** explicitly deferred

> Play Console wording/categories can change. Re-audit the production APK/AAB, every SDK, production configuration and current Google form immediately before submission. This file is not a completed declaration or legal advice.

Official references:

- User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311?hl=en
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en
- AccessibilityService API: https://support.google.com/googleplay/android-developer/answer/10964491?hl=en
- Prominent disclosure: https://support.google.com/googleplay/android-developer/answer/11150561?hl=en

## 1. High-level form draft

| Question | Draft answer | Evidence / condition |
|---|---|---|
| Does the app collect or share required user data types? | **Yes — collects** | Account, learning, user content, AI/PDF, device/push and operational data |
| Is data encrypted in transit? | **Yes only for public production over HTTPS** | Must verify deployed HTTPS and provider endpoints before submission |
| Can users request deletion? | **Yes** | In-app Settings deletion + external web `/account-deletion`; public HTTPS URL still pending |
| Is data sold? | **No** | No sale/advertising flow in current source |
| Is data used for advertising? | **No** | No ads/advertising SDK |
| Is data optional? | Mixed | Account essentials required; AI/PDF/community/push/Accessibility/Public Profile/Focus mostly user-initiated or optional |
| Has app passed an independent security review? | **No / do not claim** | Internal gates are not an external certification |
| Target audience includes children? | **Needs final Play target-audience/legal decision** | HSC students may be minors; minimum 13 + guardian assurance is implemented |

## 2. Data type matrix

Play’s exact category labels must be rechecked in Console. Proposed mapping:

### Personal info

| Type | Collected | Shared/processor transfer | Purpose | Optional |
|---|---:|---:|---|---:|
| Name | Yes | Normally no external AI transfer | Account/profile/community display | No for account |
| Email address | Yes | Resend for reset/optional digest | Account management, security, optional communication | No for account |
| User IDs | Yes | Supabase hosting; FCM/request internals where needed | Account linking, app functionality, security | No |
| Address/phone/race/religion/political belief | No intended collection | No | Users must not enter in AI/community content | — |

### Photos and videos

| Type | Collected | Shared | Purpose | Optional |
|---|---:|---:|---|---:|
| Photos/images | Yes, user-initiated AI/OCR image | Mistral/OpenRouter vision path | Solve question/OCR/generate content | Yes |
| Video | No | No | — | — |

AI Tutor image can remain as `ChatMessage.imageUrl` until chat/account deletion. OCR/custom generation paths must be checked individually at production audit to confirm whether source image is persisted or request-memory only.

### Files and docs

| Type | Collected | Shared | Purpose | Optional |
|---|---:|---:|---|---:|
| PDF/document content | Yes | Mistral embeddings and configured AI answer path | PDF semantic search/chat/summary/mind map | Yes |

Original PDF binary is not persistently stored by current route; filename, extracted chunks, vectors and chat are stored.

### App activity

| Type | Collected | Shared | Purpose | Optional |
|---|---:|---:|---|---:|
| App interactions/study activity | Yes | Supabase host; selected AI context when feature invoked | Progress, analytics, adaptive learning, planning, gamification | Core/partly optional |
| In-app search history | Possibly feature query data; audit before form | AI provider only when query invokes AI | App functionality | Feature-dependent |
| Installed apps | **No inventory collected** | No | Accessibility sees only current foreground package transiently | — |
| Other user-generated content | Yes | AI provider when user requests AI processing; public to peers only on chosen public/community feature | AI tutor, forum, notes/decks, plans | Yes |

### Messages

Forum post/reply and AI/PDF conversations are likely “Other user-generated content” and/or “Other messages” depending current Play Console definitions. Do not claim private person-to-person messaging; the app does not provide traditional SMS/DM.

### App info and performance

| Type | Collected | Shared | Purpose | Optional |
|---|---:|---:|---|---:|
| Crash logs | No third-party crash SDK currently active | No | Server logs may contain non-user-specific errors | — |
| Diagnostics | Yes, limited | Firebase/Supabase infrastructure as applicable | Push delivery, reliability, abuse/security | Partly |
| Other app performance data | Runtime health/admin telemetry | Infrastructure | Operations | Core |

If Sentry/Plausible or another SDK is enabled later, redo the entire matrix before release.

### Device or other IDs

| Type | Collected | Shared | Purpose | Optional |
|---|---:|---:|---|---:|
| Web push endpoint/keys | Yes when enabled | Browser push service | Notification delivery | Yes |
| FCM registration token | Yes when enabled | Firebase Cloud Messaging | Android push/consented Focus command | Yes |
| Device model/app version | Optional native registration metadata | Supabase/FCM operational path | Delivery diagnostics | Yes |
| Advertising ID/IMEI/IMSI/serial | No | No | — | — |

### Location

- Approximate location: not deliberately collected as product data. Server/audit IP can imply approximate area; check Play’s current IP-derived location guidance before submission.
- Precise location: no.

### Financial info

- No payment/purchase/credit/debit/financial data in current app.

### Health and fitness

- No sensor/medical/Health Connect data.
- The code may derive “fatigue/burnout/wellness” educational indicators from study behavior. Before submission, counsel/Play review must decide whether this remains App Activity personalization or falls under a health-related category/declaration. Do not describe it as medical diagnosis.

### Contacts, calendar, browsing history, audio, government ID

- Contacts: no.
- Calendar: no device calendar access; own study schedule data only.
- Browsing history: no.
- Audio recording: no audio file stored; voice input uses browser/OS speech feature. Re-test WebView implementation/provider behavior.
- Government ID: no.

## 3. Purpose mapping

Expected purposes to select where applicable:

- App functionality
- Analytics (first-party learning analytics, not ad analytics)
- Developer communications (reset/optional digest/announcements)
- Account management
- Fraud prevention, security and compliance
- Personalization (adaptive practice/study plans)

Do **not** select advertising/marketing unless product behavior later changes.

## 4. “Collected” versus “Shared” decision notes

Google Play may exempt transfers to a service provider processing on the developer’s behalf from “sharing” under specific conditions. Do not decide that solely from code. Before submission:

1. Read current Data Safety definitions in Console.
2. Verify each provider contract/DPA and use limitation.
3. Confirm whether OpenRouter forwards data to upstream model providers.
4. Confirm provider training/retention settings on the actual production account.
5. Classify Supabase, Resend, Firebase, Groq, Mistral, Cerebras, OpenRouter, browser push service and Upstash accurately.
6. Ensure Privacy Policy and form answers use the same classification.

Conservative internal inventory treats these as processor transfers even if the final Play “shared” checkbox may be exempt.

## 5. Security practices draft

Can claim only after deployment verification:

- HTTPS/modern encryption in transit
- bcrypt password hashing
- Authentication/RBAC
- Rate limits, Origin/body guards and security headers
- User data export/deletion
- Credential value exclusion from reports

Must **not** claim yet:

- Independent security certification/review
- Guaranteed encryption at rest without provider/config evidence
- Full production DDoS/load test
- Completed incident-response SLA
- Play approval

## 6. Account deletion answers

Current implementation:

- In-app: Settings → ডেটা ও অ্যাকাউন্ট → password + `ডিলিট করো`
- Web resource: `/account-deletion` → web login → Settings
- Password recovery: `/forgot-password`
- Account data cascades; non-FK reset/broadcast references delete; direct retained audit identifiers scrub
- De-identified security fact may remain where legitimate and disclosed

Before Play submission:

- Deploy a stable public HTTPS URL
- Enter exact `/account-deletion` URL in Play Console
- Configure a verified privacy contact/manual identity-verification path
- Test deletion from released build and external browser
- Verify provider backups/third-party deletion lifecycle
- Capture evidence that account + associated data is actually removed

## 7. Child/target audience checkpoint

Because HSC users can be 13–17:

- Registration requires 13+ assurance and guardian awareness/permission if under 18
- Date of birth is not collected
- No ad SDK exists
- Community/AI moderation and minor safety need final risk/legal review
- Choose Play target age groups deliberately; do not auto-select “children” or “not children” from this draft
- If any selected audience makes Families policy applicable, re-audit every SDK/provider and content flow

## 8. Release blockers before form submission

- [ ] Production HTTPS URL and privacy policy publicly reachable, non-geofenced
- [ ] Developer/operator name in Play listing exactly matched in policy
- [ ] Verified privacy contact/mechanism
- [ ] Qualified legal/privacy review
- [ ] Production SDK/dependency inventory from final AAB
- [ ] Provider contracts, retention and training settings checked
- [ ] Account deletion external URL tested
- [ ] Target audience/Families decision complete
- [ ] Accessibility declaration/demo/consent flow reviewed
- [ ] Physical Android test complete
- [ ] Data Safety answers copied to Console and independently cross-checked

No Play Console action is authorized by this document.
