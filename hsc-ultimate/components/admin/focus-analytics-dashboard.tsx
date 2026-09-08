"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BarChart3, Download, ShieldCheck, TimerReset, TriangleAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FocusAnalyticsSummary, FocusRangeDays } from "@/lib/focus-analytics";

export interface AdminFocusUserRow {
  id: string;
  name: string;
  email: string;
  isBanned: boolean;
  totalMinutes: number;
  sessionCount: number;
  completionRate: number;
  emergencyExitCount: number;
  currentStreak: number;
}

interface AdminFocusAnalyticsDashboardProps {
  initialAnalytics: FocusAnalyticsSummary;
  initialUsers: AdminFocusUserRow[];
  initialPrivacy: { sharedUserCount: number; totalContractCount: number; hiddenUserCount: number };
}

function duration(minutes: number) {
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ""}`.trim();
}

export function AdminFocusAnalyticsDashboard({
  initialAnalytics,
  initialUsers,
  initialPrivacy,
}: AdminFocusAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [users, setUsers] = useState(initialUsers);
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [range, setRange] = useState<FocusRangeDays>(initialAnalytics.rangeDays as FocusRangeDays);
  const [loading, setLoading] = useState(false);

  async function changeRange(next: FocusRangeDays) {
    setRange(next);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/focus/analytics?range=${next}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setAnalytics(data.analytics);
      setUsers(data.users);
      setPrivacy(data.privacy);
    } finally {
      setLoading(false);
    }
  }

  const chart = analytics.daily.slice(-(range === 90 ? 30 : range));
  const max = Math.max(1, ...chart.map((day) => day.minutes));

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button render={<Link href="/admin/focus" />} variant="ghost" size="sm" className="mb-2 -ml-2"><ArrowLeft className="mr-1.5 h-4 w-4" />Focus Control</Button>
          <h1 className="flex items-center gap-2 text-2xl font-black"><BarChart3 className="h-6 w-6 text-violet-500" />Focus Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">শুধু analytics sharing opt-in করা user-এর historical data</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border bg-card p-1">
            {([7, 30, 90] as const).map((days) => (
              <button key={days} onClick={() => void changeRange(days)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${range === days ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{days}D</button>
            ))}
          </div>
          <Button render={<a href={`/api/admin/focus/analytics/export?range=${range}`} />} variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Shared users", value: privacy.sharedUserCount, detail: `${privacy.hiddenUserCount} private`, icon: Users },
          { label: "Focus time", value: duration(analytics.totalMinutes), detail: `${analytics.sessionCount} sessions`, icon: TimerReset },
          { label: "Completion", value: `${analytics.completionRate}%`, detail: `${analytics.completedCount} completed`, icon: ShieldCheck },
          { label: "Emergency exits", value: analytics.emergencyExitCount, detail: `${analytics.cancelledCount} cancelled`, icon: TriangleAlert },
          { label: "Average session", value: duration(analytics.averageMinutes), detail: `${range}-day range`, icon: BarChart3 },
        ].map((metric) => (
          <Card key={metric.label} className="p-4">
            <metric.icon className="h-5 w-5 text-violet-500" />
            <p className="mt-3 text-2xl font-black">{metric.value}</p>
            <p className="mt-1 text-xs font-bold">{metric.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between"><div><h2 className="font-bold">Platform focus rhythm</h2><p className="text-xs text-muted-foreground">Consent-shared minutes only</p></div>{loading && <Badge variant="outline">Syncing…</Badge>}</div>
        <div className="mt-6 flex h-48 items-end gap-1.5">
          {chart.map((day, index) => (
            <div key={day.date} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-36 w-full items-end rounded-lg bg-muted/30">
                <div className="w-full rounded-lg bg-linear-to-t from-violet-600 to-cyan-400" style={{ height: `${day.minutes ? Math.max(5, (day.minutes / max) * 100) : 2}%` }} />
                <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded bg-background px-1 text-xs opacity-0 group-hover:opacity-100">{day.minutes}m</span>
              </div>
              {(chart.length <= 14 || index % 5 === 0) && <span className="text-xs text-muted-foreground">{day.date.slice(5)}</span>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold">Top focused users</h2>
          <p className="text-xs text-muted-foreground">User explicitly shared analytics</p>
          {users.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">কোনো user analytics share করেনি।</p>
          ) : (
            <div className="mt-4 space-y-2">
              {users.slice(0, 10).map((user, index) => (
                <div key={user.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/10 text-xs font-black text-violet-500">{index + 1}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
                  <div className="text-right"><p className="text-sm font-black">{duration(user.totalMinutes)}</p><p className="text-xs text-muted-foreground">{user.completionRate}% complete</p></div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-bold">Subject distribution</h2>
          <p className="text-xs text-muted-foreground">Shared sessions-এর tagged subjects</p>
          {analytics.subjectBreakdown.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">Subject data নেই।</p>
          ) : (
            <div className="mt-5 space-y-4">
              {analytics.subjectBreakdown.map((subject) => (
                <div key={subject.code}>
                  <div className="mb-1 flex justify-between text-xs"><span>{subject.label}</span><strong>{duration(subject.minutes)} · {subject.percentage}%</strong></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-linear-to-r from-violet-500 to-cyan-400" style={{ width: `${Math.max(2, subject.percentage)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mb-2 h-4 w-4 text-violet-500" />
            {privacy.hiddenUserCount}টি contract-এর analytics private। Active-session safety control historical sharing-এর বাইরে থাকে।
          </div>
        </Card>
      </div>
    </div>
  );
}
