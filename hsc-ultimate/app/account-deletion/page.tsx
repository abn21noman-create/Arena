import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, KeyRound, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POLICY_METADATA } from "@/lib/privacy-compliance";
import {
  PolicyCallout,
  PolicyPageShell,
  PolicySection,
} from "@/components/legal/policy-page-shell";

export const metadata: Metadata = {
  title: "অ্যাকাউন্ট ও ডেটা মুছুন",
  description: "HSC Ultimate account data export ও স্থায়ী account deletion-এর public web guide।",
  alternates: { canonical: "/account-deletion" },
  robots: { index: true, follow: true },
};

export default function AccountDeletionPage() {
  return (
    <PolicyPageShell
      kind="deletion"
      title="অ্যাকাউন্ট ও ডেটা মুছুন"
      eyebrow="Public Data Control Guide"
      description="App install না থাকলেও web browser থেকে login করে নিজের data export বা account delete করার নিরাপদ পদ্ধতি।"
      version={POLICY_METADATA.accountDeletion.version}
    >
      <PolicySection id="delete-path" title="Web থেকে account delete করার ধাপ">
        <ol className="space-y-3">
          {[
            ["Login", "HSC Ultimate web login page-এ registered email/password দিয়ে ঢোকো।"],
            ["Settings", "Profile ও Settings → ‘ডেটা ও অ্যাকাউন্ট’ tab খোলো।"],
            ["Export (recommended)", "প্রয়োজন হলে আগে JSON export download করে নিজের copy রাখো।"],
            ["Double confirmation", "বর্তমান password এবং ‘ডিলিট করো’ confirmation text দাও।"],
            ["Permanent deletion", "Confirm করলে account-linked data delete হবে এবং sign-out হবে। এটি undo করা যায় না।"],
          ].map(([title, text], index) => (
            <li key={title} className="flex gap-3 rounded-xl border p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
              <div><h3 className="font-semibold text-foreground">{title}</h3><p className="text-xs leading-6">{text}</p></div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button render={<Link href="/login?callbackUrl=%2Fsettings" />}>
            Login করে Settings খোলো <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button variant="outline" render={<Link href="/settings" />}>
            সরাসরি Settings
          </Button>
        </div>
      </PolicySection>

      <PolicySection id="export" title="Delete করার আগে data export">
        <div className="flex gap-3 rounded-xl border bg-background/60 p-4">
          <Download className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
          <p>
            Export JSON-এ profile, learning attempts, notes/tasks/plans, AI chat, PDF-derived text/chat, community activity, Focus/notification/device metadata এবং policy acceptance অন্তর্ভুক্ত থাকে। Password hash, reset token, push encryption secret/raw token, vector embedding এবং অন্য user-এর private identity intentionally বাদ।
          </p>
        </div>
      </PolicySection>

      <PolicySection id="what-is-deleted" title="কী delete বা de-identify হয়">
        <ul className="space-y-2">
          {[
            "Account/profile এবং password hash",
            "Quiz/CQ/mock/live/admission attempts ও progress",
            "Flashcards, notes, bookmarks, tasks, plans, habits ও study sessions",
            "AI chat/image, PDF document metadata/chunks/embeddings/chat",
            "Forum/community records linked by account, notifications ও push subscriptions",
            "Focus Contract/session/schedule এবং registered native devices/deliveries",
            "Versioned policy acceptance records",
            "Matching password-reset token ও non-FK broadcast delivery reference",
          ].map((item) => (
            <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item}</li>
          ))}
        </ul>
        <p>
          Security/admin audit-এর direct actor name/email/IP/user ID এবং direct deleted-user target reference scrub করা হয়। Abuse prevention, accountability বা legal need-এর জন্য ব্যক্তিকে সরাসরি শনাক্ত না করা event fact থাকতে পারে। Provider backup copy normal production access-এর বাইরে তার lifecycle শেষ হওয়া পর্যন্ত থাকতে পারে।
        </p>
      </PolicySection>

      <PolicySection id="identity" title="কেন password/identity verification লাগে">
        <PolicyCallout>
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
            <p>
              অন্য কেউ শুধু email জেনে যেন তোমার account মুছে না দিতে পারে, তাই logged-in session + current password + typed confirmation লাগে। Password ভুলে গেলে আগে <Link href="/forgot-password">reset password</Link> করে login করো।
            </p>
          </div>
        </PolicyCallout>
      </PolicySection>

      <PolicySection id="cannot-access" title="Email/account access না থাকলে">
        <p>
          Public launch-এর আগে verified privacy support mailbox configure করা হবে। Current local/pre-release build-এ public mailbox নেই; তাই identity-safe manual deletion request এখন সক্রিয় নয়। Registered email access থাকলে password reset → web login → Settings deletion path ব্যবহার করো।
        </p>
        <p>
          Play Store publish করার আগে এই page-এ verified contact/request mechanism, operator identity এবং response procedure final করা বাধ্যতামূলক। Anonymous request-এর ভিত্তিতে কোনো account delete করা হবে না।
        </p>
      </PolicySection>

      <PolicySection id="warning" title="শেষ সতর্কতা">
        <PolicyCallout>
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <p>
              Account deletion irreversible। Export file platform restore tool নয়; পরে নতুন account খুললেও পুরোনো XP, attempts, notes বা history automatically ফেরত আসবে না।
            </p>
          </div>
        </PolicyCallout>
        <p>
          বিস্তারিত retention এবং third-party processing জানতে <Link href="/privacy#retention">Privacy Policy</Link> পড়ো।
        </p>
      </PolicySection>
    </PolicyPageShell>
  );
}
