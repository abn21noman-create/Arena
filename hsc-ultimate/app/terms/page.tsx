import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BookOpenCheck, ShieldCheck } from "lucide-react";
import { POLICY_METADATA } from "@/lib/privacy-compliance";
import {
  PolicyCallout,
  PolicyPageShell,
  PolicySection,
} from "@/components/legal/policy-page-shell";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্তাবলি",
  description: "HSC Ultimate web, PWA ও Android app ব্যবহারের নিয়ম, AI/academic disclaimer এবং Strict Focus safety terms।",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <PolicyPageShell
      kind="terms"
      title="ব্যবহারের শর্তাবলি"
      eyebrow="Terms of Use"
      description="HSC Ultimate account, learning content, AI tools, community এবং consent-based Strict Focus নিরাপদ ও ন্যায্যভাবে ব্যবহারের নিয়ম।"
      version={POLICY_METADATA.terms.version}
      effectiveDate={POLICY_METADATA.terms.effectiveDate}
    >
      <PolicySection id="acceptance" title="১. শর্ত মেনে নেওয়া">
        <p>
          Account তৈরি, current policy acknowledge বা platform ব্যবহার করলে তুমি এই Terms এবং <Link href="/privacy">Privacy Policy</Link> পড়েছ ও প্রযোজ্য অংশ মেনে নিয়েছ বলে গণ্য হবে। Registration record-এ exact Terms/Privacy/age-assurance version ও acceptance time থাকে; password বা raw IP সেই record-এ রাখা হয় না।
        </p>
        <PolicyCallout>
          Privacy Policy পড়া optional feature-এর blanket consent নয়। AccessibilityService, Admin Strict Focus, public profile, analytics sharing, email এবং push-এর আলাদা controls/consent প্রযোজ্য।
        </PolicyCallout>
      </PolicySection>

      <PolicySection id="eligibility" title="২. বয়স ও guardian">
        <p>
          Account তৈরি করতে অন্তত <strong>{POLICY_METADATA.ageAssurance.minimumAge} বছর</strong> হতে হবে। ১৮ বছরের কম হলে parent/legal guardian-এর awareness ও permission নিয়ে ব্যবহার করবে। তোমার দেশের আইন বেশি বয়স বা ভিন্ন guardian requirement দিলে সেটিই প্রযোজ্য।
        </p>
        <p>
          ভুল age assurance বা under-13 use জানা গেলে account suspend/delete এবং guardian verification চাওয়া হতে পারে। Date of birth না নেওয়া data minimization; এটি operator-এর applicable child-safety obligation বাতিল করে না।
        </p>
      </PolicySection>

      <PolicySection id="service-scope" title="৩. Service কী দেয়">
        <p>
          HSC Ultimate হলো HSC preparation-এর educational support platform: notes/question bank, practice/exam, AI tutor/evaluation, planner, flashcard, analytics, community, gamification, PDF Chat এবং optional Focus tools। এটি school/board, medical, legal, emergency বা professional advisory service নয়।
        </p>
        <p>
          Platform বর্তমানে free/pre-release হতে পারে। Future feature, quota বা pricing বদলালে আগে clear notice দেওয়া হবে; paid feature চালু হলে আলাদা purchase/refund terms লাগবে। এখন কোনো payment data নেওয়া হয় না।
        </p>
      </PolicySection>

      <PolicySection id="accounts" title="৪. Account দায়িত্ব">
        <ul className="list-disc space-y-1 pl-5">
          <li>সঠিক নাম/email এবং নিজের account ব্যবহার করবে;</li>
          <li>Strong password রাখবে, password/OTP/reset link কাউকে দেবে না;</li>
          <li>Shared device হলে logout করবে এবং unauthorized access দ্রুত জানাবে;</li>
          <li>একই account automation, resale বা impersonation-এর জন্য ব্যবহার করবে না;</li>
          <li>Settings থেকে export/deletion করার আগে প্রয়োজনীয় copy নিজে রাখবে—account deletion irreversible।</li>
        </ul>
      </PolicySection>

      <PolicySection id="acceptable-use" title="৫. গ্রহণযোগ্য ব্যবহার">
        <p>নিচের কাজগুলো করা যাবে না:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Cheating, exam fraud, answer-key theft বা অন্যের academic work নিজের নামে চালানো;</li>
          <li>Harassment, hate, sexual exploitation, threat, self-harm encouragement বা minor-unsafe content;</li>
          <li>Malware, credential theft, scraping, reverse engineering for abuse, rate-limit bypass বা service disruption;</li>
          <li>অন্য user-এর account/data access, private content publish বা consent ছাড়া personal data upload;</li>
          <li>Copyright/permission নেই এমন বই, PDF, image, question bank বা content upload/share;</li>
          <li>AI output-কে verified fact/official board notice হিসেবে মিথ্যাভাবে প্রচার;</li>
          <li>Accessibility/Focus feature দিয়ে secret surveillance, coercion, punishment বা emergency access বাধাগ্রস্ত করা।</li>
        </ul>
        <p>
          Safety/moderation-এর জন্য content remove, feature limit, account suspend/ban বা serious abuse আইনগত কর্তৃপক্ষকে report করা হতে পারে। Legitimate appeal/contact channel public launch-এর আগে চূড়ান্ত হবে।
        </p>
      </PolicySection>

      <PolicySection id="ai-content" title="৬. AI output ও automated guidance">
        <PolicyCallout>
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <p>
              AI hallucination, outdated তথ্য, ভুল calculation/citation বা biased answer দিতে পারে। AI answer, CQ score, predicted GPA, plan বা recommendation <strong>official result/guarantee নয়</strong>।
            </p>
          </div>
        </PolicyCallout>
        <ul className="list-disc space-y-1 pl-5">
          <li>NCTB text, teacher এবং official board notice দিয়ে গুরুত্বপূর্ণ তথ্য যাচাই করবে;</li>
          <li>AI-তে sensitive personal/financial/identity data দেবে না;</li>
          <li>AI output safety-critical, medical, legal বা emergency সিদ্ধান্তে ব্যবহার করবে না;</li>
          <li>Provider availability/rate limit-এর কারণে fallback model ও output style বদলাতে পারে;</li>
          <li>AI feature-এর ভুল report করা academic quality উন্নতিতে সাহায্য করে, কিন্তু instant correction guarantee নয়।</li>
        </ul>
      </PolicySection>

      <PolicySection id="academic-content" title="৭. Academic content quality">
        <div className="flex gap-3 rounded-xl border bg-background/60 p-4">
          <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
          <p>
            Automated structure/duplicate checks ও Admin/Multi-AI review workflow থাকলেও সব item reviewed—এমন দাবি করা হয় না। Current reviewer type ও review status আলাদাভাবে track হয়। Content-এ ভুল দেখলে report করবে এবং পরীক্ষার আগে official source যাচাই করবে।
          </p>
        </div>
        <p>
          `AI Approved` মানে documented two-provider consensus—এটি statutory, board বা human certification নয়। `Admin Approved` আলাদা reviewer identity। Board syllabus/format বদলালে content stale হয়ে re-review লাগে। Service ব্যবহার academic admission/grade নিশ্চিত করে না।
        </p>
      </PolicySection>

      <PolicySection id="user-content" title="৮. তোমার content ও community license">
        <p>
          তুমি নিজের content-এর ownership রাখো। Platform-এ post/upload করলে feature চালানো, সংরক্ষণ, format, moderation, backup এবং তোমার chosen visibility অনুযায়ী display করার জন্য সীমিত, non-exclusive license দাও। Private content public করা হবে না, যদি না তুমি নিজে public/share control চালু করো বা আইন/safety কারণে সীমিত disclosure প্রয়োজন হয়।
        </p>
        <p>
          Public forum post/shared note/deck অন্যরা দেখতে বা interact করতে পারে। Account deletion-এ account-linked content বর্তমান system design অনুযায়ী delete হয়; আগে অন্য user বৈধভাবে copy/import করে নিজের resource বানালে সেই independent copy থাকতে পারে।
        </p>
      </PolicySection>

      <PolicySection id="strict-focus" title="৯. Strict Focus safety terms">
        <PolicyCallout>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <p>
              Strict Focus সম্পূর্ণ optional ও consent-based। Phone/Emergency, Alarm/Clock, keyboard, System UI এবং emergency exit কখনো ইচ্ছাকৃতভাবে বন্ধ করা যাবে না।
            </p>
          </div>
        </PolicyCallout>
        <ul className="list-disc space-y-1 pl-5">
          <li>নিজের session ২০–১২০ মিনিট; active timer pause/reset না থাকলেও emergency exit থাকে;</li>
          <li>Admin remote start কেবল user-এর current-version Focus Contract ও user-selected max duration-এর মধ্যে;</li>
          <li>User যেকোনো সময় Contract revoke করলে schedules/active Admin session cancel করা হয়;</li>
          <li>Accessibility disclosure আলাদাভাবে পড়ে affirmative action ছাড়া settings খোলা যায় না;</li>
          <li>Feature device admin/enterprise kiosk নয়, shutdown/uninstall ঠেকায় না, screen content পড়ে না;</li>
          <li>Admin/user এই feature coercion, discipline, surveillance বা emergency access block করার জন্য ব্যবহার করতে পারবে না;</li>
          <li>OEM battery optimization/Android behavior অনুযায়ী enforcement অসম্পূর্ণ হতে পারে; physical-device test ছাড়া absolute blocking guarantee নেই।</li>
        </ul>
      </PolicySection>

      <PolicySection id="privacy" title="১০. Privacy ও data controls">
        <p>
          Data collection, processors, retention, AI/PDF/Accessibility flow এবং choices <Link href="/privacy">Privacy Policy</Link>-এ আছে। Logged-in <Link href="/settings">Settings</Link> থেকে JSON export ও irreversible account deletion করা যায়; public guide <Link href="/account-deletion">এখানে</Link>।
        </p>
      </PolicySection>

      <PolicySection id="availability" title="১১. Availability ও পরিবর্তন">
        <p>
          Maintenance, provider outage, internet/DB failure, abuse incident বা feature redesign-এর কারণে service/feature সাময়িকভাবে unavailable, limited বা changed হতে পারে। Reasonable reliability/security চেষ্টা করা হবে, কিন্তু uninterrupted বা error-free service guarantee করা হয় না।
        </p>
        <p>
          Public deployment, external scheduler, distributed limiter, Firebase এবং physical Android validation আলাদা readiness item; local source-ready status-কে production availability দাবি হিসেবে ধরবে না।
        </p>
      </PolicySection>

      <PolicySection id="disclaimers" title="১২. Disclaimer ও দায়ের সীমা">
        <p>
          Applicable law যতটুকু অনুমতি দেয়, service “as available” ভিত্তিতে দেওয়া হয়। Exam result, data loss, missed reminder, AI/content error, device/OEM behavior বা third-party provider outage-এর জন্য unlimited liability নেওয়া হয় না। তবে fraud, gross negligence, non-waivable consumer rights বা applicable law-এ যে দায় বাদ দেওয়া যায় না তা এই clause বাদ দেয় না।
        </p>
        <p>
          এই draft legal advice নয়। Public launch-এর আগে Bangladesh law, consumer protection, child privacy, cross-border processing এবং target market অনুযায়ী qualified counsel review দরকার।
        </p>
      </PolicySection>

      <PolicySection id="termination" title="১৩. Suspension, deletion ও exit">
        <p>
          তুমি যেকোনো সময় account delete করে ব্যবহার বন্ধ করতে পারো। Material abuse/safety/security violation হলে account suspend/ban/delete করা হতে পারে। Ban data delete নয়; ভুল হলে unban-এ data ফিরে আসে। Account deletion আলাদা irreversible action।
        </p>
        <p>
          Security/fraud/regulatory কারণে direct identifiers মুছে de-identified audit fact সীমিতভাবে থাকতে পারে—বিস্তারিত Privacy Policy retention section-এ।
        </p>
      </PolicySection>

      <PolicySection id="changes" title="১৪. Terms পরিবর্তন">
        <p>
          Material change হলে version/effective date বদলানো হবে। New registration current version record করে; existing user Settings-এ stale/current status দেখতে ও current version acknowledge করতে পারে। Optional consent scope বদলালে specific re-consent লাগবে। Change মেনে না নিলে account export/delete করে ব্যবহার বন্ধ করতে পারো।
        </p>
      </PolicySection>

      <PolicySection id="governing-terms" title="১৫. Governing terms ও dispute">
        <p>
          Operator Bangladesh-ভিত্তিক হওয়ায়, conflict-of-law rule বাদ দিয়ে applicable Bangladesh law সাধারণত প্রযোজ্য হবে—তবে user-এর দেশে mandatory consumer right থাকলে তা অক্ষত থাকবে। Public launch-এর আগে legal entity, service address, dispute/contact procedure এবং jurisdiction counsel দিয়ে final করতে হবে।
        </p>
      </PolicySection>

      <PolicySection id="contact" title="১৬. যোগাযোগ">
        <p>
          Current local/pre-release build-এ verified public legal/privacy mailbox configure হয়নি। Public launch-এর আগে operator identity ও <code>PRIVACY_CONTACT_EMAIL</code> publish করা release requirement। এখন account/data action-এর জন্য authenticated <Link href="/settings">Settings</Link> বা <Link href="/account-deletion">deletion guide</Link> ব্যবহার করো; email/secret এই page-এ দিও না।
        </p>
      </PolicySection>
    </PolicyPageShell>
  );
}
