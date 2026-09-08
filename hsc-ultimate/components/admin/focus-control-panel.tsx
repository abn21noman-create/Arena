"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart3, Clock3, LockKeyhole, RefreshCw, Search, ShieldCheck, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";

interface ContractRow {
  id: string;
  maxAdminDurationMinutes: number;
  nativeEnforcementEnabled: boolean;
  shareAnalyticsWithAdmin: boolean;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    isBanned: boolean;
    currentActivityAt: string | null;
  };
}

interface ActiveRow {
  id: string;
  durationMinutes: number;
  source: "SELF" | "ADMIN";
  subjectCode: string | null;
  focusLabel: string | null;
  startedAt: string;
  endsAt: string;
  nativeEnforcementActive: boolean;
  user: { id: string; name: string; email: string };
  initiatedBy: { id: string; name: string } | null;
}

interface AdminFocusData {
  contracts: ContractRow[];
  activeSessions: ActiveRow[];
  serverNow: string;
}

const DURATIONS = [20, 25, 30, 45, 60, 90, 120];

export function FocusControlPanel() {
  const [data, setData] = useState<AdminFocusData | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [duration, setDuration] = useState(25);
  const [subjectCode, setSubjectCode] = useState("");
  const [focusLabel, setFocusLabel] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/focus", { cache: "no-store" });
    if (!response.ok) return;
    const next = (await response.json()) as AdminFocusData;
    setData(next);
    setSelectedUserId((current) => current || next.contracts[0]?.user.id || "");
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const filteredContracts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data?.contracts ?? [];
    return (data?.contracts ?? []).filter((row) =>
      row.user.name.toLowerCase().includes(normalized) ||
      row.user.email.toLowerCase().includes(normalized)
    );
  }, [data?.contracts, query]);

  const selected = data?.contracts.find((row) => row.user.id === selectedUserId);
  const selectedActive = data?.activeSessions.find((row) => row.user.id === selectedUserId);

  useEffect(() => {
    if (selected && duration > selected.maxAdminDurationMinutes) {
      setDuration(selected.maxAdminDurationMinutes);
    }
  }, [duration, selected]);

  async function startSession() {
    if (!selectedUserId || !selected) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          durationMinutes: duration,
          subjectCode: subjectCode || null,
          focusLabel: focusLabel.trim() || null,
          nativeEnforcementRequested: selected.nativeEnforcementEnabled,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Session শুরু করা যায়নি");
      const push = result.nativePush;
      if (push?.configured && push.sent > 0) {
        toast.success(`Strict Focus শুরু হয়েছে · ${push.sent}টি Android device-এ command পাঠানো হয়েছে`);
      } else {
        toast.success("Strict Focus শুরু হয়েছে; user app/SSE notification পাবে");
      }
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  async function cancelSession(session: ActiveRow) {
    const reason = window.prompt("কেন session বন্ধ করছেন?", "User requested admin cancellation");
    if (!reason) return;
    const response = await fetch(`/api/admin/focus/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error ?? "বন্ধ করা যায়নি");
      return;
    }
    toast.success("Session বন্ধ হয়েছে");
    await load();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 text-violet-500" /> Focus Control
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            শুধু আগে থেকে Focus Contract চালু করা user-এর জন্য ২০–১২০ মিনিট session শুরু করা যাবে।
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          <Button render={<Link href="/admin/focus/analytics" />} variant="outline"><BarChart3 className="mr-2 h-4 w-4" />Analytics</Button>
          <Button render={<Link href="/focus" />}><LockKeyhole className="mr-2 h-4 w-4" />নিজের Focus</Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="focus-user-search">অনুমোদিত User</Label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                id="focus-user-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="নাম বা email"
                className="border-0 px-0 shadow-none"
              />
            </div>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {filteredContracts.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  কোনো user Focus Contract চালু করেনি।
                </p>
              ) : filteredContracts.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedUserId(row.user.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selectedUserId === row.user.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{row.user.email}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {row.nativeEnforcementEnabled ? (
                        <Badge><Smartphone className="mr-1 h-3 w-3" />Android</Badge>
                      ) : (
                        <Badge variant="outline">Web only</Badge>
                      )}
                      <span className={`text-xs ${row.shareAnalyticsWithAdmin ? "text-emerald-600 dark:text-emerald-300" : "text-muted-foreground"}`}>
                        {row.shareAnalyticsWithAdmin ? "Analytics shared" : "Analytics private"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Session duration</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.filter((minutes) => minutes <= (selected?.maxAdminDurationMinutes ?? 120)).map((minutes) => (
                <Button
                  key={minutes}
                  size="sm"
                  variant={duration === minutes ? "default" : "outline"}
                  onClick={() => setDuration(minutes)}
                  disabled={!selected || !!selectedActive}
                >
                  {minutes} মিনিট
                </Button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="admin-focus-subject">Subject</Label>
                <select
                  id="admin-focus-subject"
                  value={subjectCode}
                  disabled={!selected || !!selectedActive}
                  onChange={(event) => setSubjectCode(event.target.value)}
                  className="h-9 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">General focus</option>
                  {VALID_SUBJECT_CODES.map((code) => (
                    <option key={code} value={code}>{SUBJECT_NAMES[code] ?? code}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="admin-focus-label">Session label</Label>
                <Input
                  id="admin-focus-label"
                  value={focusLabel}
                  maxLength={120}
                  disabled={!selected || !!selectedActive}
                  onChange={(event) => setFocusLabel(event.target.value)}
                  placeholder="যেমন: Physics revision"
                />
              </div>
            </div>

            {selected ? (
              <div className="mt-5 rounded-xl border p-4">
                <p className="font-medium">{selected.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  Contract limit: {selected.maxAdminDurationMinutes} মিনিট
                </p>
                <p className="mt-2 text-xs">
                  Enforcement: {selected.nativeEnforcementEnabled ? "Android app blocker requested" : "Web overlay only"}
                </p>
                <p className="mt-1 text-xs">
                  Historical analytics: {selected.shareAnalyticsWithAdmin ? "User shared" : "Private — aggregate report-এ থাকবে না"}
                </p>
                {selectedActive ? (
                  <div className="mt-4">
                    <Badge>Session চলছে · {selectedActive.durationMinutes} মিনিট</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => void cancelSession(selectedActive)}
                    >
                      Admin emergency stop
                    </Button>
                  </div>
                ) : (
                  <Button className="mt-4 w-full gap-2" onClick={startSession} disabled={loading || selected.user.isBanned}>
                    <Clock3 className="h-4 w-4" />
                    {loading ? "শুরু হচ্ছে…" : `${duration} মিনিট Strict Focus শুরু করুন`}
                  </Button>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">একজন user নির্বাচন করুন।</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-bold">সকল active session</h2>
        {!data || data.activeSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">এই মুহূর্তে কোনো Strict Focus চলছে না।</p>
        ) : (
          <div className="space-y-2">
            {data.activeSessions.map((session) => (
              <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.durationMinutes} মিনিট
                    {session.subjectCode ? ` · ${SUBJECT_NAMES[session.subjectCode] ?? session.subjectCode}` : ""}
                    {session.focusLabel ? ` · ${session.focusLabel}` : ""} · শেষ {new Date(session.endsAt).toLocaleTimeString("bn-BD")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{session.source}</Badge>
                  <Badge variant={session.nativeEnforcementActive ? "default" : "outline"}>
                    {session.nativeEnforcementActive ? "Native active" : "Web active"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => void cancelSession(session)}>Stop</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
