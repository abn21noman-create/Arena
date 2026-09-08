"use client";

// ===================================================================
// Admin: Content Report Moderation Queue
// -------------------------------------------------------------------
// ইউজারদের রিপোর্ট করা Forum Post/Reply এখানে রিভিউ করা যায়। প্রতিটা
// রিপোর্টে সরাসরি টার্গেট কন্টেন্টের লিংক থাকে।
// -------------------------------------------------------------------
// 🔧 Bulk Actions (Content Moderation Power-up এর সীমাবদ্ধতা হিসেবে
// ডকুমেন্টেড ছিল, এখন যোগ করা হলো): প্রতিটা PENDING রিপোর্টের পাশে
// চেকবক্স, "সব সিলেক্ট করো" এবং সিলেক্ট করা থাকলে একটা sticky action
// bar দেখায় (Resolve/Dismiss/Delete/Delete+Ban) — নতুন
// `/api/admin/reports/bulk` endpoint কল করে, per-item
// success/failure রেজাল্ট toast এ সংক্ষেপে দেখায়।
// ===================================================================
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Loader2, Flag, CheckCircle2, XCircle, ExternalLink, Trash2, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportItem {
  id: string;
  reason: string;
  details: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  user: { id: string; name: string; email: string };
  post: { id: string; title: string; content: string; userId: string } | null;
  reply: {
    id: string;
    content: string;
    userId: string;
    postId: string;
    post: { title: string };
  } | null;
}

type ReportAction = "RESOLVE" | "DISMISS" | "DELETE_CONTENT" | "DELETE_AND_BAN";

const REASON_LABELS: Record<string, string> = {
  SPAM: "স্প্যাম/বিজ্ঞাপন",
  OFFENSIVE: "অশ্লীল/আপত্তিকর ভাষা",
  MISINFORMATION: "ভুল তথ্য",
  HARASSMENT: "হয়রানি/ব্যক্তিগত আক্রমণ",
  OTHER: "অন্য কারণ",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "PENDING", label: "অপেক্ষমাণ" },
  { value: "RESOLVED", label: "সমাধান হয়েছে" },
  { value: "DISMISSED", label: "খারিজ" },
  { value: "ALL", label: "সব" },
];

// bulk endpoint এ একসাথে সর্বোচ্চ এতগুলো (server-side ও একই সীমা,
// route.ts এর MAX_BULK_SIZE এর সাথে সামঞ্জস্যপূর্ণ)
const MAX_BULK_SELECTION = 20;

export function ReportsPanel() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [bulkActioning, setBulkActioning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalItems: 0, totalPages: 1 });
  const confirmAction = useConfirmDialog();

  const loadReports = useCallback(async (status: string, requestedPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(requestedPage), pageSize: "20" });
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`/api/admin/reports?${params}`, { cache: "no-store" });
      const data = await res.json();
      setReports(data.reports ?? []);
      setPagination(data.pagination ?? { page: requestedPage, totalItems: 0, totalPages: 1 });
    } catch {
      toast.error("রিপোর্ট লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadReports(filter, page);
    setSelectedIds(new Set());
  }, [filter, loadReports, page]);

  const pendingReports = reports.filter((r) => r.status === "PENDING");
  const allPendingSelected =
    pendingReports.length > 0 &&
    pendingReports.every((r) => selectedIds.has(r.id));

  function toggleSelect(reportId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= MAX_BULK_SELECTION) {
          toast.error(`একসাথে সর্বোচ্চ ${MAX_BULK_SELECTION}টা রিপোর্ট সিলেক্ট করা যাবে`);
          return prev;
        }
        next.add(reportId);
      } else {
        next.delete(reportId);
      }
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    const capped = pendingReports.slice(0, MAX_BULK_SELECTION).map((r) => r.id);
    if (pendingReports.length > MAX_BULK_SELECTION) {
      toast.info(
        `${pendingReports.length}টার মধ্যে প্রথম ${MAX_BULK_SELECTION}টা সিলেক্ট করা হয়েছে (একসাথের সীমা)`
      );
    }
    setSelectedIds(new Set(capped));
  }

  async function handleAction(reportId: string, action: ReportAction) {
    const successMessages: Record<ReportAction, string> = {
      RESOLVE: "সমাধান হয়েছে হিসেবে মার্ক করা হলো",
      DISMISS: "খারিজ করা হলো",
      DELETE_CONTENT: "কন্টেন্ট ডিলিট করা হয়েছে",
      DELETE_AND_BAN: "কন্টেন্ট ডিলিট ও লেখককে ব্যান করা হয়েছে",
    };

    if (action === "DELETE_CONTENT" || action === "DELETE_AND_BAN") {
      const confirmed = await confirmAction({
        title: action === "DELETE_AND_BAN" ? "কন্টেন্ট ডিলিট + লেখককে ব্যান করবে?" : "কন্টেন্ট ডিলিট করবে?",
        description:
          action === "DELETE_AND_BAN"
            ? "এই পোস্ট/রিপ্লাই স্থায়ীভাবে ডিলিট হবে এবং লেখক আর লগইন করতে পারবে না।"
            : "এই পোস্ট/রিপ্লাই স্থায়ীভাবে ডিলিট হবে। এই কাজ আর ফেরানো যাবে না।",
        confirmLabel: "নিশ্চিত করো",
      });
      if (!confirmed) return;
    }

    setActioningId(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "করা যায়নি");
        return;
      }
      toast.success(successMessages[action]);
      void loadReports(filter);
    } catch {
      toast.error("করা যায়নি");
    } finally {
      setActioningId(null);
    }
  }

  async function handleBulkAction(action: ReportAction) {
    if (selectedIds.size === 0) return;

    const actionLabels: Record<ReportAction, string> = {
      RESOLVE: "সমাধান হয়েছে হিসেবে মার্ক করা",
      DISMISS: "খারিজ করা",
      DELETE_CONTENT: "কন্টেন্ট ডিলিট করা",
      DELETE_AND_BAN: "কন্টেন্ট ডিলিট + লেখককে ব্যান করা",
    };

    if (action === "DELETE_CONTENT" || action === "DELETE_AND_BAN") {
      const confirmed = await confirmAction({
        title: `${selectedIds.size}টা রিপোর্টে ${actionLabels[action]} করবে?`,
        description:
          action === "DELETE_AND_BAN"
            ? "সিলেক্ট করা সবগুলো পোস্ট/রিপ্লাই স্থায়ীভাবে ডিলিট হবে এবং লেখকরা আর লগইন করতে পারবে না।"
            : "সিলেক্ট করা সবগুলো পোস্ট/রিপ্লাই স্থায়ীভাবে ডিলিট হবে। এই কাজ আর ফেরানো যাবে না।",
        confirmLabel: "নিশ্চিত করো",
      });
      if (!confirmed) return;
    }

    setBulkActioning(true);
    try {
      const res = await fetch("/api/admin/reports/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportIds: [...selectedIds], action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "বাল্ক অ্যাকশন করা যায়নি");
        return;
      }
      const { successCount, failureCount, totalCount } = data;
      if (failureCount === 0) {
        toast.success(`${successCount}টা রিপোর্টে সফলভাবে ${actionLabels[action]} হয়েছে`);
      } else {
        toast.warning(
          `${totalCount}টার মধ্যে ${successCount}টা সফল, ${failureCount}টা ব্যর্থ হয়েছে`
        );
      }
      setSelectedIds(new Set());
      void loadReports(filter);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setBulkActioning(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Flag className="h-6 w-6 text-primary" />
        Content Reports
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        ইউজারদের রিপোর্ট করা Forum পোস্ট/রিপ্লাই রিভিউ করুন
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {pendingReports.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <Checkbox
            id="select-all-reports"
            checked={allPendingSelected}
            onCheckedChange={(checked) => toggleSelectAll(checked === true)}
          />
          <label htmlFor="select-all-reports" className="text-xs text-muted-foreground cursor-pointer">
            সব অপেক্ষমাণ রিপোর্ট সিলেক্ট করো ({pendingReports.length}টা)
          </label>
        </div>
      )}

      {/* Bulk Action Bar — কিছু সিলেক্ট করা থাকলেই দেখা যায় (sticky) */}
      {selectedIds.size > 0 && (
        <Card className="p-3 mb-4 sticky top-2 z-10 flex items-center justify-between gap-3 flex-wrap bg-primary/5 border-primary/30">
          <p className="text-xs font-medium">{selectedIds.size}টা রিপোর্ট সিলেক্ট করা হয়েছে</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              disabled={bulkActioning}
              onClick={() => void handleBulkAction("RESOLVE")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              সমাধান
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={bulkActioning}
              onClick={() => void handleBulkAction("DISMISS")}
            >
              <XCircle className="h-3.5 w-3.5" />
              খারিজ
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={bulkActioning}
              onClick={() => void handleBulkAction("DELETE_CONTENT")}
            >
              <Trash2 className="h-3.5 w-3.5" />
              ডিলিট
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={bulkActioning}
              onClick={() => void handleBulkAction("DELETE_AND_BAN")}
            >
              {bulkActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
              ডিলিট+ব্যান
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          এই ফিল্টারে কোনো রিপোর্ট নেই
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const targetTitle = r.post ? r.post.title : r.reply?.post.title ?? "";
            const targetContent = r.post ? r.post.content : r.reply?.content ?? "";
            const targetHref = r.post ? `/forum/${r.post.id}` : `/forum/${r.reply?.postId}`;

            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {r.status === "PENDING" && (
                      <Checkbox
                        checked={selectedIds.has(r.id)}
                        onCheckedChange={(checked) => toggleSelect(r.id, checked === true)}
                        className="mt-1 shrink-0"
                        aria-label={`"${targetTitle}" রিপোর্ট সিলেক্ট করো`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {REASON_LABELS[r.reason] ?? r.reason}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs text-white",
                            r.status === "PENDING" && "bg-amber-500 hover:bg-amber-500",
                            r.status === "RESOLVED" && "bg-violet-500 hover:bg-violet-500",
                            r.status === "DISMISSED" && "bg-muted-foreground hover:bg-muted-foreground"
                          )}
                        >
                          {r.status === "PENDING"
                            ? "অপেক্ষমাণ"
                            : r.status === "RESOLVED"
                            ? "সমাধান হয়েছে"
                            : "খারিজ"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {r.post ? "পোস্ট" : "রিপ্লাই"}
                        </Badge>
                      </div>
                      <Link
                        href={targetHref}
                        target="_blank"
                        className="text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        {targetTitle}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {targetContent}
                      </p>
                      {r.details && (
                        <p className="text-xs mt-1.5 rounded bg-muted/60 px-2 py-1">
                          &ldquo;{r.details}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        রিপোর্ট করেছে: {r.user.name} ({r.user.email}) •{" "}
                        {new Date(r.createdAt).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {r.status === "PENDING" && (
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                              disabled={actioningId === r.id}
                              onClick={() => handleAction(r.id, "RESOLVE")}
                              aria-label="সমাধান হয়েছে হিসেবে মার্ক করো"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <TooltipContent>সমাধান হয়েছে হিসেবে মার্ক করো (কন্টেন্ট রেখে দাও)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              disabled={actioningId === r.id}
                              onClick={() => handleAction(r.id, "DISMISS")}
                              aria-label="খারিজ করো"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <TooltipContent>খারিজ করো</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              disabled={actioningId === r.id}
                              onClick={() => handleAction(r.id, "DELETE_CONTENT")}
                              aria-label="কন্টেন্ট সরাসরি ডিলিট করো"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <TooltipContent>কন্টেন্ট সরাসরি ডিলিট করো</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              disabled={actioningId === r.id}
                              onClick={() => handleAction(r.id, "DELETE_AND_BAN")}
                              aria-label="কন্টেন্ট ডিলিট + লেখককে ব্যান করো"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <TooltipContent>কন্টেন্ট ডিলিট + লেখককে ব্যান করো</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> আগের পেজ
          </Button>
          <span className="text-xs text-muted-foreground">
            {page}/{pagination.totalPages} · মোট {pagination.totalItems} রিপোর্ট
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            পরের পেজ <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
