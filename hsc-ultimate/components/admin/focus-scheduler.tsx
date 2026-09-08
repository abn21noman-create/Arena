"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlarmClock, CalendarPlus, Pause, Play, Repeat2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";

interface Contract {
  userId: string;
  maxAdminDurationMinutes: number;
  user: { id: string; name: string; email: string; isBanned: boolean };
}
interface Schedule {
  id: string;
  durationMinutes: number;
  subjectCode: string | null;
  focusLabel: string | null;
  repeat: "NONE" | "DAILY" | "WEEKLY";
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  nextRunAt: string | null;
  lastResult: string | null;
  user: { id: string; name: string; email: string };
  createdBy: { id: string; name: string } | null;
}

function defaultDateTime() {
  const date = new Date(Date.now() + 10 * 60_000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function FocusScheduler() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [userId, setUserId] = useState("");
  const [duration, setDuration] = useState(25);
  const [subjectCode, setSubjectCode] = useState("");
  const [focusLabel, setFocusLabel] = useState("");
  const [scheduledFor, setScheduledFor] = useState(defaultDateTime);
  const [repeat, setRepeat] = useState<"NONE" | "DAILY" | "WEEKLY">("NONE");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/focus/schedules", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setContracts(data.contracts ?? []);
    setSchedules(data.schedules ?? []);
    setUserId((current) => current || data.contracts?.[0]?.userId || "");
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const selected = useMemo(() => contracts.find((contract) => contract.userId === userId), [contracts, userId]);
  useEffect(() => {
    if (selected && duration > selected.maxAdminDurationMinutes) setDuration(selected.maxAdminDurationMinutes);
  }, [duration, selected]);

  async function createSchedule() {
    if (!userId) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/focus/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          durationMinutes: duration,
          subjectCode: subjectCode || null,
          focusLabel: focusLabel.trim() || null,
          scheduledFor: new Date(scheduledFor).toISOString(),
          repeat,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Schedule তৈরি করা যায়নি");
      toast.success("Strict Focus schedule তৈরি হয়েছে");
      setFocusLabel("");
      setScheduledFor(defaultDateTime());
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(schedule: Schedule, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
    if (status === "CANCELLED" && !window.confirm("Schedule cancel করবেন?")) return;
    const response = await fetch(`/api/admin/focus/schedules/${schedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason: status === "CANCELLED" ? "Admin cancelled schedule" : undefined }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Update করা যায়নি");
      return;
    }
    toast.success(`Schedule ${status.toLowerCase()} হয়েছে`);
    await load();
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="flex items-center gap-2 font-bold"><CalendarPlus className="h-5 w-5 text-violet-500" />Focus Scheduler</h2><p className="mt-1 text-sm text-muted-foreground">Future, daily অথবা weekly consent-based session</p></div>
        <Badge variant="outline">{schedules.length} active/paused</Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border p-4">
          <div className="grid gap-1.5"><Label>User</Label><select value={userId} onChange={(event) => setUserId(event.target.value)} className="h-9 rounded-lg border bg-background px-3 text-sm"><option value="">Select user</option>{contracts.map((contract) => <option key={contract.userId} value={contract.userId}>{contract.user.name} · max {contract.maxAdminDurationMinutes}m</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Date & time</Label><Input type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Repeat</Label><select value={repeat} onChange={(event) => setRepeat(event.target.value as typeof repeat)} className="h-9 rounded-lg border bg-background px-3 text-sm"><option value="NONE">One time</option><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Duration</Label><select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="h-9 rounded-lg border bg-background px-3 text-sm">{[20,25,30,45,60,90,120].filter((value) => value <= (selected?.maxAdminDurationMinutes ?? 120)).map((value) => <option key={value} value={value}>{value} মিনিট</option>)}</select></div>
            <div className="grid gap-1.5"><Label>Subject</Label><select value={subjectCode} onChange={(event) => setSubjectCode(event.target.value)} className="h-9 rounded-lg border bg-background px-3 text-sm"><option value="">General</option>{VALID_SUBJECT_CODES.map((code) => <option key={code} value={code}>{SUBJECT_NAMES[code] ?? code}</option>)}</select></div>
          </div>
          <div className="grid gap-1.5"><Label>Session label</Label><Input maxLength={120} value={focusLabel} onChange={(event) => setFocusLabel(event.target.value)} placeholder="যেমন: Physics revision" /></div>
          <Button className="w-full gap-2" disabled={saving || !selected || selected.user.isBanned} onClick={createSchedule}><AlarmClock className="h-4 w-4" />{saving ? "Scheduling…" : "Schedule তৈরি করুন"}</Button>
        </div>

        <div className="max-h-[430px] space-y-2 overflow-y-auto">
          {schedules.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">কোনো scheduled focus নেই।</p> : schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-xl border p-3.5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><AlarmClock className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{schedule.focusLabel || `${schedule.durationMinutes}m Focus`}</p><p className="truncate text-xs text-muted-foreground">{schedule.user.name} · {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString("bn-BD") : "Paused"}</p><div className="mt-1.5 flex flex-wrap gap-1.5"><Badge variant="outline" className="text-xs">{schedule.status}</Badge>{schedule.repeat !== "NONE" && <Badge variant="secondary" className="text-xs"><Repeat2 className="mr-1 h-2.5 w-2.5" />{schedule.repeat}</Badge>}{schedule.lastResult && <span className="text-xs text-muted-foreground">Last: {schedule.lastResult}</span>}</div></div>
              </div>
              <div className="mt-3 flex justify-end gap-1.5">
                {schedule.status === "ACTIVE" ? <Button size="sm" variant="outline" onClick={() => void changeStatus(schedule, "PAUSED")}><Pause className="mr-1 h-3 w-3" />Pause</Button> : <Button size="sm" variant="outline" onClick={() => void changeStatus(schedule, "ACTIVE")}><Play className="mr-1 h-3 w-3" />Resume</Button>}
                <Button size="sm" variant="ghost" onClick={() => void changeStatus(schedule, "CANCELLED")}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
