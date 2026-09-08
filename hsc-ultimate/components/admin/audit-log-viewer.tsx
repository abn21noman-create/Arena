"use client";

// ===================================================================
// Admin: Audit Log Viewer — প্রতিটা sensitive admin action এর ইতিহাস
// -------------------------------------------------------------------
// `lib/audit-log.ts` এর `logAuditEvent()` দিয়ে বহু জায়গায় (role
// change, delete, ban, broadcast, content report resolve ইত্যাদি)
// লগ তৈরি হচ্ছিল কিন্তু দেখার কোনো UI ছিল না — এই কম্পোনেন্ট সেই গ্যাপ
// পূরণ করে। Action-এর উপর ভিত্তি করে ফিল্টার করা যায়, pagination সহ।
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History, Loader2, ChevronLeft, ChevronRight, User } from "lucide-react";

interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  USER_BAN: "bg-destructive/10 text-destructive",
  USER_DELETE: "bg-destructive/10 text-destructive",
  USER_UNBAN: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  USER_ROLE_CHANGE: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  NOTIFICATION_BROADCAST: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  SYSTEM_SETTINGS_UPDATE: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
};

function formatActionLabel(action: string): string {
  return action
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(data.totalCount ?? 0);
      setAvailableActions(data.availableActions ?? []);
    } catch {
      // silent — খালি লিস্ট দেখানোই যথেষ্ট, toast এ ভরিয়ে ফেলার দরকার নেই
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
        <History className="h-6 w-6 text-primary" />
        Audit Log
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        মোট {totalCount}টা admin action রেকর্ড করা আছে — কে, কখন, কী করেছে সব এখানে ট্র্যাক করা যায়
      </p>

      <Card className="p-4 mb-4">
        {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value দেখায় (label
            না) যতক্ষণ না `items` prop দেওয়া হয় — shadcn/base-ui এর
            নিজস্ব সীমাবদ্ধতা, অফিসিয়াল ডকুমেন্টেশনে নিশ্চিত করা হয়েছে।
            এখানে `items` prop দিয়ে value→label ম্যাপিং দেওয়া হয়েছে
            যাতে trigger এ formatActionLabel() দিয়ে ফরম্যাট করা বাংলা/
            readable লেবেল দেখায়, raw enum string (যেমন "FORUM_POST_
            DELETE") না */}
        <Select
          value={actionFilter}
          onValueChange={(v) => setActionFilter(v ?? "ALL")}
          items={[
            { value: "ALL", label: "সব Action" },
            ...availableActions.map((a) => ({ value: a, label: formatActionLabel(a) })),
          ]}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Action দিয়ে ফিল্টার করো" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব Action</SelectItem>
            {availableActions.map((a) => (
              <SelectItem key={a} value={a}>
                {formatActionLabel(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          কোনো লগ পাওয়া যায়নি
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge
                      className={`text-xs ${ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"}`}
                      variant="outline"
                    >
                      {formatActionLabel(log.action)}
                    </Badge>
                    {log.targetType && (
                      <span className="text-xs text-muted-foreground">
                        টার্গেট: {log.targetType}
                        {log.targetId && ` (${log.targetId.slice(0, 10)}...)`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {log.actorName ?? "অজানা"}{" "}
                    <span className="text-xs text-muted-foreground">({log.actorEmail ?? "—"})</span>
                  </p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5 font-mono break-all">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("bn-BD")}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            পেজ {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
