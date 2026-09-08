import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleOff, ExternalLink, Info, ShieldCheck } from "lucide-react";
import {
  DATA_FLOW_INVENTORY,
  DEVICE_STORAGE_INVENTORY,
  EXTERNAL_PROCESSORS,
  POLICY_METADATA,
  RETENTION_SCHEDULE,
} from "@/lib/privacy-compliance";
import {
  PolicyCallout,
  PolicyPageShell,
  PolicySection,
} from "@/components/legal/policy-page-shell";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি",
  description: "HSC Ultimate কী তথ্য সংগ্রহ, ব্যবহার, প্রক্রিয়া, সংরক্ষণ ও মুছে দেয়—তার পূর্ণ বিবরণ।",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

function configuredPrivacyEmail() {
  const value = process.env.PRIVACY_CONTACT_EMAIL?.trim();
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

export default function PrivacyPage() {
  const privacyEmail = configuredPrivacyEmail();

  return (
    <PolicyPageShell
      kind="privacy"
      title="গোপনীয়তা নীতি"
      eyebrow="Privacy & Data Use"
      description="এই নীতি HSC Ultimate web, PWA এবং Android app-এ তথ্য কীভাবে প্রবাহিত হয়, কোন optional service-এ যায়, কতদিন থাকে এবং তুমি কীভাবে নিয়ন্ত্রণ করবে—তা সহজ বাংলায় জানায়।"
      version={POLICY_METADATA.privacy.version}
      effectiveDate={POLICY_METADATA.privacy.effectiveDate}
    >
      <PolicySection id="overview" title="১. সংক্ষিপ্ত সারাংশ">
        <PolicyCallout>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <p>
              HSC Ultimate <strong>ডেটা বিক্রি করে না, third-party বিজ্ঞাপন চালায় না এবং screen content পড়ে না</strong>। পড়াশোনার feature চালানো, account নিরাপদ রাখা এবং user-এর অনুরোধে AI/notification দেওয়ার জন্য যতটুকু দরকার ততটুকুই ব্যবহার করার নীতি অনুসরণ করা হয়।
            </p>
          </div>
        </PolicyCallout>
        <p>
          “আমরা”, “প্ল্যাটফর্ম” বা “HSC Ultimate” বলতে HSC Ultimate web/PWA/Android service-এর operator-কে বোঝানো হয়েছে। এটি এখনো local/pre-release অবস্থায়; public launch-এর আগে verified operator contact ও independent legal review চূড়ান্ত করা আবশ্যক।
        </p>
        <p>
          Privacy Notice পড়া মানে সব optional processing-এ blanket consent দেওয়া নয়। Strict Focus remote control, Accessibility, public profile, analytics sharing, push notification এবং email digest-এর আলাদা controls আছে।
        </p>
      </PolicySection>

      <PolicySection id="data-collection" title="২. কোন তথ্য নেওয়া হয়">
        <div className="grid gap-3">
          {DATA_FLOW_INVENTORY.map((flow) => (
            <div key={flow.id} className="rounded-xl border bg-background/55 p-4">
              <h3 className="font-bold text-foreground">{flow.title}</h3>
              <dl className="mt-2 grid gap-2 text-xs leading-5 sm:grid-cols-2">
                <div><dt className="font-semibold text-foreground">Data</dt><dd>{flow.data}</dd></div>
                <div><dt className="font-semibold text-foreground">Purpose</dt><dd>{flow.purpose}</dd></div>
                <div><dt className="font-semibold text-foreground">Where it goes</dt><dd>{flow.destination}</dd></div>
                <div><dt className="font-semibold text-foreground">Control</dt><dd>{flow.controls}</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <p>
          Financial/payment data, precise location, contacts, SMS/call log, microphone recording, government ID বা advertising ID চাওয়া হয় না। Voice input browser/OS speech capability ব্যবহার করলে সেই platform-এর নিজস্ব data practice প্রযোজ্য হতে পারে; HSC Ultimate আলাদা audio file সংরক্ষণ করে না।
        </p>
      </PolicySection>

      <PolicySection id="data-use" title="৩. তথ্য কেন ব্যবহার করা হয়">
        <ul className="list-disc space-y-1 pl-5">
          <li>Account authenticate করা, profile sync এবং security incident ঠেকানো;</li>
          <li>Learning progress, result, planner, revision, streak, badge ও analytics দেখানো;</li>
          <li>User নিজে চালু করলে AI, PDF, community, email এবং push feature দেওয়া;</li>
          <li>Consent-bound Strict Focus session/schedule enforce ও safely stop করা;</li>
          <li>Abuse/rate limiting, moderation, backup integrity এবং operational reliability;</li>
          <li>আইনি বাধ্যবাধকতা বা user safety রক্ষায় প্রয়োজনীয় সীমিত processing।</li>
        </ul>
        <p>
          AI recommendation, predicted GPA, score feedback বা study plan কোনো আইনগত/চিকিৎসাগত সিদ্ধান্ত নয় এবং user-এর উপর legal effect সৃষ্টি করে না।
        </p>
      </PolicySection>

      <PolicySection id="ai-processing" title="৪. AI provider-এ কী যায়">
        <PolicyCallout>
          AI box-এ password, phone number, ঠিকানা, financial data, private identity document বা অন্য কারও গোপন তথ্য দিও না। AI ভুল করতে পারে—গুরুত্বপূর্ণ academic উত্তর NCTB বই/শিক্ষকের সঙ্গে যাচাই করো।
        </PolicyCallout>
        <p>
          AI feature ব্যবহার করলে তোমার prompt এবং উত্তর তৈরির জন্য দরকারি সাম্প্রতিক context configured provider-এ পাঠানো হয়। Text fallback chain হলো Groq → Mistral AI → Cerebras → OpenRouter; image feature Mistral/OpenRouter ব্যবহার করতে পারে। কোন provider configured/available তার উপর বাস্তব route বদলাতে পারে। Account password hash বা authentication secret AI provider-এ পাঠানো হয় না।
        </p>
        <p>
          OpenRouter gateway ব্যবহার করলে selected upstream model provider-ও request process করতে পারে। Provider-দের নিজস্ব retention/abuse-monitoring terms থাকতে পারে; public launch-এর আগে processor terms ও data-processing basis পুনরায় review করতে হবে।
        </p>
        <p>
          Academic AI approval-এ একই academic content (user identity নয়) দুইটি distinct configured provider-এ independently যায়। Provider/model/verdict/confidence/answer fingerprint ও response hash audit evidence হিসেবে থাকে এবং UI-তে reviewer kind `AI` স্পষ্ট দেখানো হয়।
        </p>
        <p>
          AI chat history HSC Ultimate database-এ থাকে যাতে conversation চালানো যায়; AI Tutor-এর trash action দিয়ে chat history মুছতে পারো।
        </p>
      </PolicySection>

      <PolicySection id="pdf-processing" title="৫. PDF Chat data flow">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Original PDF request memory-তে নিয়ে server text extract করে; binary file স্থায়ী object storage-এ রাখা হয় না।</li>
          <li>Extracted text ছোট chunk-এ ভাগ হয়ে Mistral embedding API-তে যায়।</li>
          <li>Text chunk ও numeric vector HSC Ultimate PostgreSQL/pgvector-এ থাকে।</li>
          <li>প্রশ্ন করলে relevant chunks এবং প্রশ্ন AI provider-এ পাঠিয়ে উত্তর তৈরি হয়।</li>
          <li>Document delete করলে chunks, embeddings ও PDF chat messages cascade-delete হয়।</li>
        </ol>
        <p>
          Copyright বা permission নেই এমন PDF আপলোড করো না। Scanned/image-only PDF বর্তমানে text extraction নাও করতে পারে।
        </p>
      </PolicySection>

      <PolicySection id="strict-focus" title="৬. Strict Focus, Admin consent ও AccessibilityService">
        <PolicyCallout>
          Android AccessibilityService <strong>শুধু active timer চলাকালে সামনে খোলা app-এর package name transientভাবে দেখে</strong>। XML configuration-এ window content retrieval বন্ধ; screen text, message, password, image, browsing content বা keystroke পড়া/সংরক্ষণ/upload করা হয় না।
        </PolicyCallout>
        <ul className="list-disc space-y-1 pl-5">
          <li>এটি disability accessibility tool নয়; focus enforcement-এর narrowly-scoped optional feature।</li>
          <li>Accessibility settings খোলার আগে app-এর normal flow-তে আলাদা prominent disclosure ও affirmative checkbox দেখানো হয়। Decline করলে app-এর অন্য feature ব্যবহার করা যায়।</li>
          <li>Phone, Emergency Dialer, Clock/Alarm, keyboard, System UI ও HSC Ultimate allowlisted থাকে।</li>
          <li>Admin remote start-এর আগে user-এর versioned Focus Contract লাগে; user ২০–১২০ মিনিটের সর্বোচ্চ limit বেছে নেয় এবং যেকোনো সময় revoke করতে পারে।</li>
          <li>Historical Focus analytics Admin-এর জন্য default private; আলাদা opt-in ছাড়া share হয় না।</li>
          <li>Emergency exit সবসময় থাকে এবং safety/audit-এর জন্য reason/session event সংরক্ষিত হতে পারে।</li>
          <li>Server-এ FCM token, device model/app version, accessibility-enabled boolean, command status/receipt ও session timing থাকতে পারে; blocked foreground package name server-এ পাঠানো হয় না।</li>
        </ul>
        <p>
          বিস্তারিত control দেখতে <Link href="/focus">Strict Focus</Link> খুলে Focus Contract off, Accessibility permission disable বা registered device remove করতে পারো। Service app uninstall/disable ঠেকায় না এবং secret surveillance করে না।
        </p>
      </PolicySection>

      <PolicySection id="notifications" title="৭. Email, web push ও native push">
        <p>
          Password-reset email-এর জন্য email address ও reset link Resend-এ পাঠানো হয়। Optional weekly digest Settings থেকে off করা যায়। Web push চালু করলে browser push endpoint/encryption keys এবং Android notification চালু করলে FCM registration token সংরক্ষণ হয়।
        </p>
        <p>
          Native Strict Focus command data-only push হিসেবে session ID, deadline, duration, command ID ও short-lived TTL বহন করতে পারে। Replay/expired/future command device reject করে; receipt operational diagnosis-এর জন্য sync হতে পারে। বিজ্ঞাপন বা location tracking-এর জন্য push token ব্যবহার করা হয় না।
        </p>
      </PolicySection>

      <PolicySection id="device-storage" title="৮. Cookie ও device-local storage">
        <p>
          বর্তমানে advertising/behavioral tracking cookie বা third-party analytics SDK নেই। Essential session cookie এবং app preference/offline support-এর জন্য browser/device storage ব্যবহৃত হয়:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {DEVICE_STORAGE_INVENTORY.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p>
          Browser settings থেকে site data clear বা Android app data clear/uninstall করলে local data মুছে যায়; unsynced offline action-ও হারাতে পারে।
        </p>
      </PolicySection>

      <PolicySection id="sharing" title="৯. Service provider ও sharing">
        <p>
          Data বিক্রি বা targeted advertising-এর জন্য share করা হয় না। Feature চালাতে দরকার হলে নিচের service provider/processor data process করতে পারে:
        </p>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-muted/70 text-foreground"><tr><th className="p-3">Provider</th><th className="p-3">Role</th><th className="p-3">Data scope</th></tr></thead>
            <tbody>
              {EXTERNAL_PROCESSORS.map((processor) => (
                <tr key={processor.name} className="border-t align-top">
                  <th className="p-3 font-semibold text-foreground">{processor.name}</th>
                  <td className="p-3">{processor.role}</td>
                  <td className="p-3">{processor.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          আইনসম্মত court/order, fraud/safety incident বা platform rights রক্ষায় প্রয়োজন হলে সীমিত disclosure হতে পারে। Merger/sale-এর মতো ownership change হলে আগেই notice ও applicable protection দেওয়ার চেষ্টা করা হবে।
        </p>
      </PolicySection>

      <PolicySection id="retention" title="১০. Retention ও deletion schedule">
        <div className="grid gap-3">
          {RETENTION_SCHEDULE.map((item) => (
            <div key={item.category} className="rounded-xl border p-4">
              <h3 className="font-semibold text-foreground">{item.category}</h3>
              <p><strong>Retention:</strong> {item.period}</p>
              <p><strong>Deletion:</strong> {item.deletion}</p>
            </div>
          ))}
        </div>
        <p>
          “৯০ দিন” native delivery log-এর operational target; push pipeline দীর্ঘ সময় না চললে cleanup delayed হতে পারে। Public production launch-এর আগে background retention job ও provider-level backup/PITR expiry চূড়ান্ত করা হবে। Backup copy provider lifecycle অনুযায়ী কিছু সময় isolate হয়ে থাকতে পারে এবং normal production use-এ ফেরত আনা হয় না।
        </p>
      </PolicySection>

      <PolicySection id="data-controls" title="১১. তোমার data controls">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["JSON export", "Settings → ডেটা ও অ্যাকাউন্ট থেকে profile, learning, AI/PDF, Focus, consent ও অন্যান্য account data export। Security credential/vector বাদ থাকে।"],
            ["Account deletion", "Password + typed confirmation দিয়ে account এবং relational data স্থায়ীভাবে delete। Direct non-FK/reset/delivery reference delete বা de-identify করা হয়।"],
            ["Optional controls", "Public profile, digest, push, Admin Focus, analytics sharing ও Accessibility আলাদাভাবে on/off করা যায়।"],
            ["Content controls", "AI chat clear, PDF delete এবং feature-specific item delete যেখানে UI দেওয়া আছে।"],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl border p-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{title}</h3>
              <p className="mt-1 text-xs leading-6">{text}</p>
            </div>
          ))}
        </div>
        <p>
          <Link href="/account-deletion">Public account-deletion guide</Link> অথবা logged-in <Link href="/settings">Settings</Link> ব্যবহার করো। Export-এ password hash, reset token, push encryption secret, raw FCM token, vector embedding এবং অন্য user-এর private identity থাকে না।
        </p>
        <p>
          Valid legal request অনুযায়ী access/correction/restriction/objection প্রযোজ্য হতে পারে। Identity verify না করে data disclosure বা deletion করা হবে না, যাতে অন্য কেউ তোমার account মুছে দিতে না পারে।
        </p>
      </PolicySection>

      <PolicySection id="children" title="১২. কিশোর শিক্ষার্থী ও guardian">
        <p>
          Platform HSC শিক্ষার্থীদের জন্য হলেও account তৈরি করতে অন্তত <strong>{POLICY_METADATA.ageAssurance.minimumAge} বছর</strong> হতে হবে। ১৮ বছরের কম হলে parent/legal guardian-এর awareness ও permission নিয়ে ব্যবহার করতে হবে। জন্মতারিখ সংগ্রহ না করে registration-এ age/guardian assurance নেওয়া হয়—data minimization-এর জন্য।
        </p>
        <p>
          ১৩ বছরের কম কারও account বা অননুমোদিত minor data জানা গেলে verified guardian/operator request-এর ভিত্তিতে delete/disable করা হবে। Public launch-এর target-audience/Families classification Play Console-এ আলাদাভাবে legal review করতে হবে।
        </p>
      </PolicySection>

      <PolicySection id="security" title="১৩. Security safeguards">
        <ul className="list-disc space-y-1 pl-5">
          <li>Password bcrypt hash হিসেবে থাকে; plain-text password export/log করা হয় না।</li>
          <li>Auth/role checks, mutation-origin guard, request-size limit এবং rate limiting আছে।</li>
          <li>Production-এ HTTPS, secure secret manager এবং least-privilege access বাধ্যতামূলক release condition।</li>
          <li>Audit/release/security checks credential value report করে না।</li>
          <li>কোনো system ১০০% secure নয়; incident ধরা পড়লে scope containment ও affected user notice applicable requirement অনুযায়ী করা হবে।</li>
        </ul>
      </PolicySection>

      <PolicySection id="international-processing" title="১৪. আন্তর্জাতিক processing">
        <p>
          Supabase region এবং AI/email/push provider Bangladesh-এর বাইরে server ব্যবহার করতে পারে। তাই user-initiated content অন্য jurisdiction-এ process হতে পারে। Public launch-এর আগে provider location, contractual safeguards ও applicable Bangladesh/other privacy obligations review করতে হবে।
        </p>
      </PolicySection>

      <PolicySection id="policy-changes" title="১৫. নীতি বদলালে কী হবে">
        <p>
          Material data-flow বা purpose বদলালে policy version/effective date আপডেট করা হবে। নতুন user registration current version record করে; existing user Settings-এ current/stale version দেখতে এবং নতুন version acknowledge করতে পারে। Optional consent-এর scope বদলালে আলাদা re-consent লাগবে—পুরোনো blanket acceptance ব্যবহার করা হবে না।
        </p>
      </PolicySection>

      <PolicySection id="contact" title="১৬. Privacy contact">
        {privacyEmail ? (
          <p>
            Privacy/data request-এর জন্য <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>-এ যোগাযোগ করো। Account ownership verify করার জন্য তোমার registered email থেকে লিখতে হতে পারে। Email-এ password বা secret পাঠিও না।
          </p>
        ) : (
          <PolicyCallout>
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p>
                Current build local/pre-release; verified public privacy mailbox এখনো configure করা হয়নি। Public launch-এর আগে <code>PRIVACY_CONTACT_EMAIL</code> configure এবং operator identity publish করা release requirement। এখন account data control-এর জন্য authenticated <Link href="/settings">Settings</Link> ব্যবহার করো।
              </p>
            </div>
          </PolicyCallout>
        )}
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/account-deletion" className="inline-flex items-center gap-1"><CircleOff className="h-4 w-4" /> Account deletion guide</Link>
          <a href="https://support.google.com/googleplay/android-developer/answer/10144311?hl=en" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">Google Play User Data policy <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </PolicySection>
    </PolicyPageShell>
  );
}
