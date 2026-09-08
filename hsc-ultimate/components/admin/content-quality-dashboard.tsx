"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bot,
  BookCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  ExternalLink,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TARGET_LABELS = {
  CORE_MCQ: "Core MCQ",
  ADMISSION_MCQ: "Admission MCQ",
  CQ: "CQ",
  TOPIC_NOTE: "Topic Note",
} as const;

type TargetType = keyof typeof TARGET_LABELS;
type QueueView = "ATTENTION" | "REPORTED" | "UNREVIEWED" | "REVIEWED" | "STALE" | "ALL";
type ReviewStatus = "APPROVED" | "NEEDS_CORRECTION" | "REJECTED" | "AI_CONFLICT" | "SOURCE_REQUIRED";

interface QualityRisk {
  code: string;
  severity: "BLOCKER" | "WARNING";
  field: string;
  message: string;
}

interface QualityItem {
  targetType: TargetType;
  targetId: string;
  context: string;
  title: string;
  preview: string;
  details: {
    options?: string[];
    correctAnswer?: string;
    explanation?: string | null;
    stimulus?: string;
    questions?: string[];
    modelAnswers?: Array<string | null>;
    notesPreview?: string | null;
    [key: string]: unknown;
  };
  contentHash: string;
  risks: QualityRisk[];
  riskScore: number;
  studentReports: Array<{
    id: string;
    reason: string;
    details: string | null;
    status: "PENDING" | "RESOLVED" | "DISMISSED";
    contentHash: string;
    stale: boolean;
    reporter: string;
    createdAt: string;
    resolutionNote: string | null;
    reviewedAt: string | null;
    reviewer: string | null;
  }>;
  review: {
    status: ReviewStatus;
    reviewNote: string | null;
    sourceUrl: string | null;
    reviewedAt: string;
    reviewer: string;
    reviewerKind: "ADMIN" | "AI";
    aiConfidence: number | null;
    aiEvidence: unknown;
    reviewMethodVersion: string | null;
    contentHash: string | null;
    stale: boolean;
    history: Array<{
      status: ReviewStatus;
      contentHash: string;
      reviewNote: string | null;
      sourceUrl: string | null;
      reviewer: string;
      reviewerKind: "ADMIN" | "AI";
      aiConfidence: number | null;
      reviewMethodVersion: string | null;
      createdAt: string;
    }>;
  } | null;
}

interface QualitySnapshot {
  generatedAt: string;
  disclaimer: string;
  summary: {
    total: number;
    byType: { coreMcq: number; admissionMcq: number; cq: number; topicNote: number };
    reviewed: number;
    unreviewed: number;
    approved: number;
    needsCorrection: number;
    rejected: number;
    aiConflict: number;
    sourceRequired: number;
    aiApproved: number;
    adminApproved: number;
    staleReviews: number;
    studentReportsTotal: number;
    studentReportsPending: number;
    studentReportsStale: number;
    automatedRiskItems: number;
    blockerItems: number;
    warningItems: number;
    exactDuplicateGroups: number;
    crossContextDuplicateGroups: number;
  };
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
  items: QualityItem[];
}

const VIEWS: Array<{ value: QueueView; label: string }> = [
  { value: "ATTENTION", label: "Attention" },
  { value: "REPORTED", label: "Student reports" },
  { value: "UNREVIEWED", label: "Unreviewed" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "STALE", label: "Stale" },
  { value: "ALL", label: "All" },
];

export function ContentQualityDashboard() {
  const [snapshot, setSnapshot] = useState<QualitySnapshot | null>(null);
  const [targetType, setTargetType] = useState<"ALL" | TargetType>("ALL");
  const [view, setView] = useState<QueueView>("ATTENTION");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QualityItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiReviewing, setAiReviewing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ view, page: String(page), pageSize: "20" });
      if (targetType !== "ALL") params.set("targetType", targetType);
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/content-quality?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Quality queue লোড হয়নি");
      setSnapshot(data);
      setSelected((current) =>
        current ? data.items.find((item: QualityItem) => item.targetId === current.targetId) ?? null : null
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Quality queue লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }, [page, search, targetType, view]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [targetType, view, search]);

  function selectItem(item: QualityItem) {
    setSelected(item);
    setReviewNote(item.review?.reviewNote ?? "");
    setSourceUrl(item.review?.sourceUrl ?? "");
  }

  async function saveReview(status: ReviewStatus) {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: selected.targetType,
          targetId: selected.targetId,
          status,
          reviewNote: reviewNote.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Review save হয়নি");
      toast.success(`Content ${status.toLowerCase().replace("_", " ")} হয়েছে`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review save হয়নি");
    } finally {
      setSaving(false);
    }
  }

  async function decideStudentReport(
    reportId: string,
    status: "RESOLVED" | "DISMISSED"
  ) {
    if (reviewNote.trim().length < 10) {
      toast.error("Student report decision-এর জন্য Admin review note-এ অন্তত ১০ অক্ষর লিখুন");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/content-quality", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          resolutionNote: reviewNote.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Report decision save হয়নি");
      toast.success(status === "RESOLVED" ? "Student report resolve হয়েছে" : "Student report dismiss হয়েছে");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Report decision save হয়নি");
    } finally {
      setSaving(false);
    }
  }

  async function runAIReview() {
    setAiReviewing(true);
    try {
      const response = await fetch("/api/admin/content-quality/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limit: 3,
          apply: true,
          ...(targetType !== "ALL" ? { targetType } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Multi-AI review ব্যর্থ হয়েছে");
      toast.success(`AI batch: ${data.approved} approved · ${data.flagged} flagged · ${data.conflicts} conflict · ${data.errors} error`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Multi-AI review ব্যর্থ হয়েছে");
    } finally {
      setAiReviewing(false);
    }
  }

  const progress = useMemo(() => {
    if (!snapshot?.summary.total) return 0;
    return Math.round((snapshot.summary.reviewed / snapshot.summary.total) * 100);
  }, [snapshot]);
  const exportHref = useMemo(() => {
    const params = new URLSearchParams({ view });
    if (targetType !== "ALL") params.set("targetType", targetType);
    if (search.trim()) params.set("search", search.trim());
    return `/api/admin/content-quality/export?${params}`;
  }, [search, targetType, view]);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-violet-500/20">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-gradient-to-r from-violet-500/15 via-fuchsia-500/5 to-cyan-500/10 p-5 sm:p-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ClipboardCheck className="h-6 w-6 text-violet-500" /> Academic Content Quality
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Automated risk triage + transparent Multi-AI or Admin review workflow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => void runAIReview()} disabled={aiReviewing}>
              <Bot className={`mr-1.5 h-4 w-4 ${aiReviewing ? "animate-pulse" : ""}`} />
              {aiReviewing ? "2-provider review চলছে…" : "AI review next 3"}
            </Button>
            <Button render={<a href={exportHref} />} size="sm" variant="outline">
              <Download className="mr-1.5 h-4 w-4" /> Admin Review CSV
            </Button>
            <Button size="icon" variant="ghost" aria-label="Quality queue refresh" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {snapshot && (
          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-8">
              <SummaryMetric label="Total" value={snapshot.summary.total} />
              <SummaryMetric label="AI approved" value={snapshot.summary.aiApproved} tone="violet" />
              <SummaryMetric label="Admin approved" value={snapshot.summary.adminApproved} tone="emerald" />
              <SummaryMetric label="Unreviewed" value={snapshot.summary.unreviewed} tone="amber" />
              <SummaryMetric label="AI conflict" value={snapshot.summary.aiConflict + snapshot.summary.sourceRequired} tone="rose" />
              <SummaryMetric label="Student reports" value={snapshot.summary.studentReportsPending} tone="amber" />
              <SummaryMetric label="Stale" value={snapshot.summary.staleReviews} tone="rose" />
              <SummaryMetric label="Blockers" value={snapshot.summary.blockerItems} tone="rose" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Human review progress</span><span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
              <p>{snapshot.disclaimer}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-2 rounded-lg border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Question, topic বা subject খুঁজুন" className="border-0 px-0 shadow-none" />
          </div>
          <select value={targetType} onChange={(event) => setTargetType(event.target.value as typeof targetType)} className="h-10 rounded-lg border bg-background px-3 text-sm">
            <option value="ALL">All content types</option>
            {Object.entries(TARGET_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <div className="flex flex-wrap gap-1 rounded-lg border p-1">
            {VIEWS.map((option) => (
              <Button key={option.value} size="sm" variant={view === option.value ? "default" : "ghost"} onClick={() => setView(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Review queue</h2>
            <Badge variant="outline">{snapshot?.pagination.totalItems ?? 0} items</Badge>
          </div>
          {loading && !snapshot ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Scanning content…</div>
          ) : !snapshot || snapshot.items.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">এই filter-এ কোনো content নেই।</p>
          ) : (
            <div className="space-y-2">
              {snapshot.items.map((item) => (
                <button
                  key={`${item.targetType}:${item.targetId}`}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${selected?.targetId === item.targetId ? "border-violet-500 bg-violet-500/5" : "hover:bg-muted/60"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{TARGET_LABELS[item.targetType]} · {item.context}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.studentReports.some((report) => report.status === "PENDING") && (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
                          <CircleAlert className="mr-1 h-3 w-3" />
                          {item.studentReports.filter((report) => report.status === "PENDING").length} report
                        </Badge>
                      )}
                      <ReviewBadge item={item} />
                    </div>
                  </div>
                  {item.risks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.risks.slice(0, 3).map((risk) => (
                        <Badge key={`${risk.code}:${risk.field}`} variant="outline" className={risk.severity === "BLOCKER" ? "border-rose-500/30 text-rose-500" : "border-amber-500/30 text-amber-500"}>
                          {risk.code}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          {snapshot && snapshot.pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button size="sm" variant="outline" disabled={snapshot.pagination.page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft className="mr-1 h-3.5 w-3.5" />Previous</Button>
              <span className="text-xs text-muted-foreground">{snapshot.pagination.page}/{snapshot.pagination.totalPages}</span>
              <Button size="sm" variant="outline" disabled={snapshot.pagination.page >= snapshot.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight className="ml-1 h-3.5 w-3.5" /></Button>
            </div>
          )}
        </Card>

        <ReviewPanel
          item={selected}
          note={reviewNote}
          sourceUrl={sourceUrl}
          saving={saving}
          onNoteChange={setReviewNote}
          onSourceChange={setSourceUrl}
          onSave={saveReview}
          onReportDecision={decideStudentReport}
        />
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "emerald" | "amber" | "violet" | "rose" }) {
  const colors = { default: "text-foreground", emerald: "text-emerald-500", amber: "text-amber-500", violet: "text-violet-500", rose: "text-rose-500" };
  return <div className="rounded-xl border bg-card/60 p-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${colors[tone]}`}>{value}</p></div>;
}

function ReviewBadge({ item }: { item: QualityItem }) {
  if (item.review?.stale) return <Badge variant="outline" className="border-rose-500/30 text-rose-500"><RefreshCw className="mr-1 h-3 w-3" />Stale review</Badge>;
  if (item.review?.status === "APPROVED") return (
    <Badge className={item.review.reviewerKind === "AI" ? "bg-violet-600" : "bg-emerald-600"}>
      {item.review.reviewerKind === "AI" ? <Bot className="mr-1 h-3 w-3" /> : <BadgeCheck className="mr-1 h-3 w-3" />}
      {item.review.reviewerKind === "AI" ? "AI Approved" : "Admin Approved"}
    </Badge>
  );
  if (item.review?.status === "NEEDS_CORRECTION") return <Badge variant="outline" className="border-amber-500/30 text-amber-500"><CircleAlert className="mr-1 h-3 w-3" />Correction</Badge>;
  if (item.review?.status === "AI_CONFLICT") return <Badge variant="outline" className="border-rose-500/30 text-rose-500"><Bot className="mr-1 h-3 w-3" />AI Conflict</Badge>;
  if (item.review?.status === "SOURCE_REQUIRED") return <Badge variant="outline" className="border-cyan-500/30 text-cyan-500"><ExternalLink className="mr-1 h-3 w-3" />Source Required</Badge>;
  if (item.review?.status === "REJECTED") return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
  return <Badge variant="outline">Unreviewed</Badge>;
}

function ReviewPanel({
  item,
  note,
  sourceUrl,
  saving,
  onNoteChange,
  onSourceChange,
  onSave,
  onReportDecision,
}: {
  item: QualityItem | null;
  note: string;
  sourceUrl: string;
  saving: boolean;
  onNoteChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onSave: (status: ReviewStatus) => Promise<void>;
  onReportDecision: (reportId: string, status: "RESOLVED" | "DISMISSED") => Promise<void>;
}) {
  if (!item) return <Card className="sticky top-4 p-8 text-center text-sm text-muted-foreground"><BookCheck className="mx-auto mb-3 h-8 w-8 opacity-40" />Review করতে queue থেকে content নির্বাচন করুন।</Card>;
  const options = item.details.options ?? [];
  const safeSourceUrl = /^https:\/\//i.test(sourceUrl) ? sourceUrl : null;
  return (
    <Card className="sticky top-4 max-h-[calc(100vh-2rem)] space-y-4 overflow-y-auto p-5">
      <div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{TARGET_LABELS[item.targetType]}</Badge><ReviewBadge item={item} /></div><h2 className="mt-3 text-base font-bold">{item.title}</h2><p className="mt-1 text-xs text-muted-foreground">{item.context}</p><p className="mt-1 font-mono text-xs text-muted-foreground">Hash: {item.contentHash.slice(0, 16)}…</p></div>
      {item.review?.reviewerKind === "AI" && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 text-xs">
          <p className="font-semibold text-violet-600 dark:text-violet-400">Multi-AI consensus · confidence {Math.round((item.review.aiConfidence ?? 0) * 100)}%</p>
          <p className="mt-1 text-muted-foreground">{item.review.reviewMethodVersion}</p>
          <p className="mt-2">{item.review.reviewNote}</p>
        </div>
      )}
      {item.review?.stale && <div className="flex gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs"><RefreshCw className="h-4 w-4 shrink-0 text-rose-500" /><p>Content review-এর পরে বদলেছে। পুরোনো decision current approval হিসেবে গণনা হচ্ছে না; আবার review করুন।</p></div>}
      {item.risks.length > 0 && <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">{item.risks.map((risk) => <div key={`${risk.code}:${risk.field}`} className="flex gap-2 text-xs"><ShieldAlert className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${risk.severity === "BLOCKER" ? "text-rose-500" : "text-amber-500"}`} /><span><b>{risk.code}</b> · {risk.message}</span></div>)}</div>}
      {item.studentReports.length > 0 && (
        <div className="space-y-2 rounded-xl border border-amber-500/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Student reports</p>
          {item.studentReports.map((report) => (
            <div key={report.id} className="rounded-lg border bg-background/60 p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{report.reason} · {report.reporter}</p>
                <Badge variant="outline">{report.status}{report.stale ? " · old content" : ""}</Badge>
              </div>
              {report.details && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{report.details}</p>}
              <p className="mt-1 text-muted-foreground">{new Date(report.createdAt).toLocaleString("bn-BD")}</p>
              {report.status === "PENDING" ? (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" disabled={saving || note.trim().length < 10} onClick={() => void onReportDecision(report.id, "RESOLVED")}>Resolve</Button>
                  <Button size="sm" variant="outline" disabled={saving || note.trim().length < 10} onClick={() => void onReportDecision(report.id, "DISMISSED")}>Dismiss</Button>
                </div>
              ) : report.resolutionNote ? (
                <p className="mt-2 rounded bg-muted p-2">{report.resolutionNote}</p>
              ) : null}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Decision button-এর আগে নিচের Admin review note-এ কারণ লিখুন। Resolve করা content-কে নিজে থেকে APPROVED করে না।</p>
        </div>
      )}
      {options.length > 0 && <div className="space-y-1.5">{options.map((option) => <div key={option} className={`rounded-lg border px-3 py-2 text-xs ${option === item.details.correctAnswer ? "border-emerald-500/40 bg-emerald-500/5" : ""}`}>{option}</div>)}</div>}
      {(item.details.explanation || item.preview) && <div className="rounded-xl border p-3"><p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Content preview</p><p className="whitespace-pre-wrap text-xs leading-5">{String(item.details.explanation || item.details.stimulus || item.details.notesPreview || item.preview).slice(0, 2000)}</p></div>}
      {item.review?.history.length ? <div className="rounded-xl border p-3"><p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Review history</p><div className="space-y-2">{item.review.history.map((entry, index) => <div key={`${entry.contentHash}:${entry.createdAt}:${index}`} className="flex items-start justify-between gap-2 text-xs"><div><p className="font-medium">{entry.status} · {entry.reviewer}</p><p className="text-muted-foreground">{entry.reviewNote || "No note"}</p></div><span className="shrink-0 text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("bn-BD")}</span></div>)}</div></div> : null}
      <div className="space-y-3 border-t pt-4">
        <div className="grid gap-1.5"><Label htmlFor="quality-review-note">Admin review note</Label><Textarea id="quality-review-note" rows={4} maxLength={2000} value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="কেন approve/correct/reject করছেন—সংক্ষিপ্ত প্রমাণ লিখুন" /></div>
        <div className="grid gap-1.5"><Label htmlFor="quality-source-url">HTTPS source/provenance (optional)</Label><div className="flex items-center gap-2"><Input id="quality-source-url" type="url" maxLength={2048} value={sourceUrl} onChange={(event) => onSourceChange(event.target.value)} placeholder="https://..." />{safeSourceUrl && <Button render={<a href={safeSourceUrl} target="_blank" rel="noreferrer" />} size="icon" variant="outline" aria-label="Source URL খোলো"><ExternalLink className="h-4 w-4" /></Button>}</div></div>
        <div className="grid gap-2 sm:grid-cols-3"><Button disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => void onSave("APPROVED")}><BadgeCheck className="mr-1 h-4 w-4" />Approve</Button><Button disabled={saving} variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400" onClick={() => void onSave("NEEDS_CORRECTION")}><CircleAlert className="mr-1 h-4 w-4" />Correct</Button><Button disabled={saving} variant="destructive" onClick={() => void onSave("REJECTED")}><XCircle className="mr-1 h-4 w-4" />Reject</Button></div>
      </div>
    </Card>
  );
}
