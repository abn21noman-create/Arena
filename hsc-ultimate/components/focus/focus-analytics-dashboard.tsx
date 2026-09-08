"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock3,
  Flame,
  ShieldCheck,
  Target,
  TriangleAlert,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { FocusAnalyticsSummary, FocusRangeDays } from "@/lib/focus-analytics";

interface FocusAnalyticsDashboardProps {
  initialAnalytics: FocusAnalyticsSummary;
  initialSharedWithAdmin: boolean;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function FocusAnalyticsDashboard({
  initialAnalytics,
  initialSharedWithAdmin,
}: FocusAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [range, setRange] = useState<FocusRangeDays>(initialAnalytics.rangeDays as FocusRangeDays);
  const [loading, setLoading] = useState(false);

  async function changeRange(next: FocusRangeDays) {
    setRange(next);
    setLoading(true);
    try {
      const response = await fetch(`/api/focus/analytics?range=${next}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setAnalytics(data.analytics);
    } finally {
      setLoading(false);
    }
  }

  const chartDays = analytics.daily.slice(-(range === 90 ? 30 : range));
  const maxMinutes = Math.max(1, ...chartDays.map((day) => day.minutes));
  const self = analytics.sourceBreakdown.find((item) => item.source === "SELF");
  const admin = analytics.sourceBreakdown.find((item) => item.source === "ADMIN");
  const selfPct = analytics.totalMinutes > 0
    ? Math.round(((self?.minutes ?? 0) / analytics.totalMinutes) * 100)
    : 0;

  const metrics = [
    { label: "Total focus", value: formatMinutes(analytics.totalMinutes), detail: `${analytics.sessionCount} sessions`, icon: Clock3, color: "text-violet-500" },
    { label: "Completion", value: `${analytics.completionRate}%`, detail: `${analytics.completedCount} completed`, icon: Trophy, color: "text-emerald-500" },
    { label: "Current streak", value: `${analytics.currentStreak}d`, detail: `Longest ${analytics.longestStreak}d`, icon: Flame, color: "text-orange-500" },
    { label: "Average", value: formatMinutes(analytics.averageMinutes), detail: "Per session", icon: Target, color: "text-cyan-500" },
    { label: "Emergency exits", value: String(analytics.emergencyExitCount), detail: `${analytics.cancelledCount} cancelled`, icon: TriangleAlert, color: "text-rose-500" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button render={<Link href="/focus" />} variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Strict Focus
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
            <BarChart3 className="h-6 w-6 text-violet-500" /> Focus Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Deep Study-এর সময়, consistency এবং completion pattern</p>
        </div>
        <div className="flex rounded-xl border bg-card/60 p-1">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => void changeRange(days)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${range === days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <GlassCard key={metric.label} className="p-4" variant="gradient-border">
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
            <p className="mt-4 text-2xl font-black tabular-nums">{metric.value}</p>
            <p className="mt-1 text-xs font-bold">{metric.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_.5fr]">
        <GlassCard className="p-5 sm:p-6" variant="gradient-border">
          <div className="flex items-center justify-between gap-3">
            <div><p className="font-bold">Daily focus rhythm</p><p className="text-xs text-muted-foreground">{range === 90 ? "শেষ ৩০ দিন দেখানো হচ্ছে" : `${range} দিনের minute distribution`}</p></div>
            {loading && <Badge variant="outline">Syncing…</Badge>}
          </div>
          <div className="mt-6 flex h-52 items-end gap-1.5 sm:gap-2">
            {chartDays.map((day, index) => (
              <div key={day.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div className="relative flex h-40 w-full items-end overflow-hidden rounded-lg bg-white/[0.025]">
                  <div
                    className="w-full rounded-lg bg-linear-to-t from-violet-600 via-fuchsia-500 to-cyan-400 transition-all group-hover:brightness-110"
                    style={{ height: `${day.minutes > 0 ? Math.max(5, (day.minutes / maxMinutes) * 100) : 2}%` }}
                  />
                  <span className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded bg-background/90 px-1.5 py-0.5 text-xs opacity-0 shadow group-hover:opacity-100">
                    {day.minutes}m
                  </span>
                </div>
                {(chartDays.length <= 14 || index % 5 === 0) && (
                  <span className="text-xs text-muted-foreground">{new Date(`${day.date}T00:00:00Z`).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}</span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6" variant="gradient-border">
          <p className="font-bold">Session source</p>
          <p className="text-xs text-muted-foreground">Self-control বনাম Admin Contract</p>
          <div className="mx-auto mt-6 grid h-36 w-36 place-items-center rounded-full" style={{ background: `conic-gradient(hsl(252 88% 60%) ${selfPct}%, hsl(187 88% 48%) 0)` }}>
            <div className="grid h-28 w-28 place-items-center rounded-full bg-card text-center">
              <div><p className="text-2xl font-black">{selfPct}%</p><p className="text-xs text-muted-foreground">Self initiated</p></div>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500" />Self</span><strong>{formatMinutes(self?.minutes ?? 0)}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-500" />Admin</span><strong>{formatMinutes(admin?.minutes ?? 0)}</strong></div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5 sm:p-6" variant="gradient-border">
          <p className="font-bold">Subject distribution</p>
          <p className="text-xs text-muted-foreground">Session শুরু করার সময় নির্বাচিত subject</p>
          {analytics.subjectBreakdown.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">এখনো subject-tagged focus data নেই।</p>
          ) : (
            <div className="mt-5 space-y-4">
              {analytics.subjectBreakdown.map((subject) => (
                <div key={subject.code}>
                  <div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-semibold">{subject.label}</span><span className="text-muted-foreground">{formatMinutes(subject.minutes)} · {subject.percentage}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-linear-to-r from-violet-500 to-cyan-400" style={{ width: `${Math.max(2, subject.percentage)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5 sm:p-6" variant="gradient-border">
          <p className="font-bold">Privacy control</p>
          <p className="text-xs text-muted-foreground">Historical analytics sharing</p>
          <div className={`mt-5 rounded-2xl border p-4 ${initialSharedWithAdmin ? "border-emerald-500/20 bg-emerald-500/5" : "border-violet-500/20 bg-violet-500/5"}`}>
            <ShieldCheck className={`h-6 w-6 ${initialSharedWithAdmin ? "text-emerald-500" : "text-violet-500"}`} />
            <p className="mt-2 text-sm font-bold">{initialSharedWithAdmin ? "Admin analytics sharing চালু" : "আপনার history private"}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {initialSharedWithAdmin
                ? "Admin platform report-এ আপনার focus time ও completion pattern দেখা যাবে।"
                : "Admin active session safely stop করতে পারবেন, কিন্তু historical report-এ আপনার data থাকবে না।"}
            </p>
            <Button render={<Link href="/focus" />} size="sm" variant="outline" className="mt-3">Privacy setting পরিবর্তন</Button>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5 sm:p-6" variant="gradient-border">
        <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-violet-500" /><p className="font-bold">Recent focus sessions</p></div>
        {analytics.recentSessions.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">এখনো কোনো focus session নেই।</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3">Session</th><th className="pb-3">Subject</th><th className="pb-3">Source</th><th className="pb-3">Status</th><th className="pb-3 text-right">Effective</th></tr></thead>
              <tbody className="divide-y divide-border/60">
                {analytics.recentSessions.map((focus) => (
                  <tr key={focus.id}>
                    <td className="py-3"><p className="font-semibold">{focus.focusLabel || `${focus.durationMinutes} মিনিট Focus`}</p><p className="mt-0.5 text-xs text-muted-foreground">{new Date(focus.startedAt).toLocaleString("bn-BD")}</p></td>
                    <td className="py-3">{focus.subjectLabel}</td>
                    <td className="py-3"><Badge variant="outline">{focus.source}</Badge></td>
                    <td className="py-3"><Badge variant={focus.status === "COMPLETED" ? "default" : "outline"}>{focus.status}</Badge></td>
                    <td className="py-3 text-right font-bold">{formatMinutes(focus.effectiveMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
