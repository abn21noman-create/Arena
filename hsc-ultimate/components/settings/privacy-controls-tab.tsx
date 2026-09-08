"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  ExternalLink,
  FileDown,
  FileText,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ACADEMIC_REPORT_REASON_LABELS, type AcademicReportReasonValue } from "@/lib/academic-report-policy";
import {
  CURRENT_AGE_ASSURANCE_VERSION,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  POLICY_METADATA,
  isCurrentPolicyAcceptance,
  type PolicyAcceptanceRecord,
} from "@/lib/privacy-compliance";

interface RecentAcademicReport {
  id: string;
  targetType: string;
  reason: AcademicReportReasonValue;
  details: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  resolutionNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface PrivacyControlsTabProps {
  initialAcceptance: (PolicyAcceptanceRecord & {
    source: string;
    acceptedAt: string | Date;
  }) | null;
}

export function PrivacyControlsTab({ initialAcceptance }: PrivacyControlsTabProps) {
  const [acceptance, setAcceptance] = useState(initialAcceptance);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [academicReports, setAcademicReports] = useState<RecentAcademicReport[]>([]);
  const current = isCurrentPolicyAcceptance(acceptance);

  useEffect(() => {
    fetch("/api/academic-reports", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : { reports: [] })
      .then((data) => setAcademicReports(data.reports ?? []))
      .catch(() => setAcademicReports([]));
  }, []);

  async function acknowledgeCurrentPolicies() {
    if (!policyChecked || !ageChecked) {
      toast.error("দুটি assurance-ই নিশ্চিত করো");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/user/policy-acceptance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepted: true,
          ageAssuranceConfirmed: true,
          privacyVersion: CURRENT_PRIVACY_VERSION,
          termsVersion: CURRENT_TERMS_VERSION,
          ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Policy acknowledgement save হয়নি");
      setAcceptance(data.acceptance);
      setPolicyChecked(false);
      setAgeChecked(false);
      toast.success("Current policy versions record হয়েছে");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Policy acknowledgement save হয়নি");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className={`p-5 sm:p-6 ${current ? "border-emerald-500/25" : "border-amber-500/30"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className={`rounded-xl p-2.5 ${current ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
              {current ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <TriangleAlert className="h-5 w-5 text-amber-500" />}
            </div>
            <div>
              <h2 className="font-bold">Policy version status</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {current
                  ? "Current Privacy, Terms ও age-assurance versions acknowledged।"
                  : "এই account-এর current versions-এর acknowledgement record নেই বা পুরোনো।"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={current ? "border-emerald-500/30 text-emerald-500" : "border-amber-500/30 text-amber-500"}>
            {current ? "CURRENT" : "ACTION NEEDED"}
          </Badge>
        </div>

        <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
          <Version label="Privacy" current={CURRENT_PRIVACY_VERSION} recorded={acceptance?.privacyVersion} />
          <Version label="Terms" current={CURRENT_TERMS_VERSION} recorded={acceptance?.termsVersion} />
          <Version label="Age assurance" current={CURRENT_AGE_ASSURANCE_VERSION} recorded={acceptance?.ageAssuranceVersion} />
        </dl>
        {acceptance?.acceptedAt && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" /> সর্বশেষ record: {new Date(acceptance.acceptedAt).toLocaleString("bn-BD")} · {"source" in acceptance ? acceptance.source : "UNKNOWN"}
          </p>
        )}

        {!current && (
          <div className="mt-5 space-y-3 rounded-xl border bg-muted/30 p-4">
            <label className="flex items-start gap-2.5 text-xs leading-5">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-violet-600" checked={policyChecked} onChange={(event) => setPolicyChecked(event.target.checked)} />
              <span>
                আমি <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacy v{CURRENT_PRIVACY_VERSION}</Link> পড়েছি এবং <Link href="/terms" className="font-semibold text-primary hover:underline">Terms v{CURRENT_TERMS_VERSION}</Link> মেনে নিচ্ছি।
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-xs leading-5">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-violet-600" checked={ageChecked} onChange={(event) => setAgeChecked(event.target.checked)} />
              <span>আমার বয়স অন্তত {POLICY_METADATA.ageAssurance.minimumAge} বছর; ১৮ বছরের কম হলে guardian awareness/permission আছে।</span>
            </label>
            <Button size="sm" onClick={acknowledgeCurrentPolicies} disabled={saving || !policyChecked || !ageChecked}>
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1.5 h-4 w-4" />}
              Current versions acknowledge করো
            </Button>
          </div>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <ControlCard
          icon={Bot}
          title="AI ও PDF data flow"
          detail="Prompt/image/PDF excerpt configured AI provider-এ যেতে পারে। Sensitive personal data দিও না।"
          href="/privacy#ai-processing"
          linkLabel="AI disclosure"
        />
        <ControlCard
          icon={Smartphone}
          title="Strict Focus ও Accessibility"
          detail="Package name local-only; Admin control ও analytics sharing আলাদা opt-in।"
          href="/focus"
          linkLabel="Focus controls"
        />
        <ControlCard
          icon={FileDown}
          title="Data export ও deletion"
          detail="‘ডেটা ও অ্যাকাউন্ট’ tab থেকে JSON export বা password-confirmed deletion করো।"
          href="/account-deletion"
          linkLabel="Public guide"
        />
        <ControlCard
          icon={DatabaseZap}
          title="Retention ও processors"
          detail="Supabase, optional AI/email/push/limiter providers এবং retention schedule দেখো।"
          href="/privacy#retention"
          linkLabel="Retention details"
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <FileText className="h-4 w-4 text-amber-500" /> আমার academic reports
          </h2>
          <Badge variant="outline">Latest {Math.min(academicReports.length, 20)}</Badge>
        </div>
        {academicReports.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">এখনো কোনো academic content issue report করোনি।</p>
        ) : (
          <div className="mt-3 space-y-2">
            {academicReports.slice(0, 5).map((report) => (
              <div key={report.id} className="rounded-lg border p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{ACADEMIC_REPORT_REASON_LABELS[report.reason]} · {report.targetType}</p>
                  <Badge variant="outline" className={report.status === "PENDING" ? "border-amber-500/40 text-amber-600 dark:text-amber-400" : report.status === "RESOLVED" ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : ""}>{report.status}</Badge>
                </div>
                {report.details && <p className="mt-1 text-muted-foreground">{report.details}</p>}
                {report.resolutionNote && <p className="mt-2 rounded bg-muted p-2">Admin: {report.resolutionNote}</p>}
                <p className="mt-1 text-muted-foreground">{new Date(report.createdAt).toLocaleString("bn-BD")}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <LockKeyhole className="h-4 w-4 text-violet-500" /> Important distinction
        </h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          এই policy acknowledgement optional data processing-এর blanket consent নয়। Public profile, email digest, push notification, Focus Contract, Accessibility permission এবং Admin analytics sharing নিজ নিজ control থেকে আলাদাভাবে বদলাতে পারো।
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <Link href="/privacy" className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><FileText className="h-3.5 w-3.5" /> Privacy Policy</Link>
          <Link href="/terms" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">Terms <ExternalLink className="h-3.5 w-3.5" /></Link>
        </div>
      </Card>
    </div>
  );
}

function Version({ label, current, recorded }: { label: string; current: string; recorded?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <dt className="font-semibold text-foreground">{label}</dt>
      <dd className="mt-1 text-muted-foreground">Current {current}</dd>
      <dd className={recorded === current ? "text-emerald-500" : "text-amber-500"}>
        Recorded {recorded ?? "none"}
      </dd>
    </div>
  );
}

function ControlCard({
  icon: Icon,
  title,
  detail,
  href,
  linkLabel,
}: {
  icon: typeof Bot;
  title: string;
  detail: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Card className="p-5">
      <Icon className="h-5 w-5 text-violet-500" />
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-6 text-muted-foreground">{detail}</p>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        {linkLabel} <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
}
