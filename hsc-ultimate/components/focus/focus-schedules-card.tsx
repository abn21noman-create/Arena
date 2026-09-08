"use client";

import { useCallback, useEffect, useState } from "react";
import { AlarmClock, CalendarClock, Repeat2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";

interface FocusScheduleRow {
  id: string;
  durationMinutes: number;
  subjectCode: string | null;
  focusLabel: string | null;
  repeat: "NONE" | "DAILY" | "WEEKLY";
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  nextRunAt: string | null;
  lastRunAt: string | null;
  lastResult: string | null;
  createdBy: { name: string } | null;
}

export function FocusSchedulesCard() {
  const [schedules, setSchedules] = useState<FocusScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/focus/schedules", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setSchedules(data.schedules ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function cancel(scheduleId: string) {
    if (!window.confirm("এই upcoming Focus schedule cancel করবেন?")) return;
    setCancelling(scheduleId);
    try {
      const response = await fetch(`/api/focus/schedules/${scheduleId}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Cancel করা যায়নি");
      }
      toast.success("Focus schedule cancel হয়েছে");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
    } finally {
      setCancelling(null);
    }
  }

  const upcoming = schedules.filter((schedule) => schedule.status === "ACTIVE" || schedule.status === "PAUSED");

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-violet-500" /><h2 className="font-bold">Upcoming Focus</h2></div>
          <p className="mt-1 text-sm text-muted-foreground">Admin-scheduled session; contract revoke বা এখান থেকে cancel করা যাবে।</p>
        </div>
        <Badge variant="outline">{upcoming.length} upcoming</Badge>
      </div>

      {loading ? (
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted" />
      ) : upcoming.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-5 text-center">
          <AlarmClock className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold">কোনো upcoming schedule নেই</p>
          <p className="mt-1 text-xs text-muted-foreground">Focus Contract চালু থাকলে Admin future session schedule করতে পারবেন।</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {upcoming.map((schedule) => (
            <div key={schedule.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><AlarmClock className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{schedule.focusLabel || `${schedule.durationMinutes} মিনিট Strict Focus`}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString("bn-BD") : "Paused"}
                  {schedule.subjectCode ? ` · ${SUBJECT_NAMES[schedule.subjectCode] ?? schedule.subjectCode}` : ""}
                </p>
                <div className="mt-1.5 flex gap-1.5">
                  <Badge variant="outline" className="text-xs">{schedule.status}</Badge>
                  {schedule.repeat !== "NONE" && <Badge variant="secondary" className="text-xs"><Repeat2 className="mr-1 h-2.5 w-2.5" />{schedule.repeat}</Badge>}
                  {schedule.createdBy && <span className="text-xs text-muted-foreground">by {schedule.createdBy.name}</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" disabled={cancelling === schedule.id} onClick={() => void cancel(schedule.id)} aria-label="Schedule cancel">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
