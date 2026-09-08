"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlarmClockCheck,
  CircleGauge,
  Play,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SchedulerHealth {
  status:
    | "LAZY_MODE"
    | "AWAITING_FIRST_RUN"
    | "HEALTHY"
    | "DEGRADED"
    | "STALE"
    | "FAILING"
    | "RUNNING"
    | "MISCONFIGURED";
  healthy: boolean;
  mode: "lazy" | "external";
  externalExpected: boolean;
  cronSecretConfigured: boolean;
  staleAfterSeconds: number;
  heartbeatAgeSeconds: number | null;
  state: {
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastStatus: string;
    lastSource: string | null;
    lastDurationMs: number | null;
    lastReminderCount: number;
    lastDueCount: number;
    lastProcessedCount: number;
    lastStartedCount: number;
    lastFailedCount: number;
    lastErrorCode: string | null;
    consecutiveFailures: number;
    totalRuns: number;
    overlapSkips: number;
    leaseActive: boolean;
  } | null;
  queue: { active: number; dueNow: number; upcoming24h: number };
  fallback: { lazyProcessingEnabled: true; description: string };
  configurationError: string | null;
}

interface RunReport {
  status: "SUCCESS" | "SKIPPED_OVERLAP";
  remindersSent: number;
  processed: number;
  sessionsStarted: number;
}

const STATUS_LABELS: Record<SchedulerHealth["status"], string> = {
  LAZY_MODE: "Lazy fallback",
  AWAITING_FIRST_RUN: "Awaiting heartbeat",
  HEALTHY: "Healthy",
  DEGRADED: "Heartbeat delayed",
  STALE: "Cron stale",
  FAILING: "Run failing",
  RUNNING: "Running now",
  MISCONFIGURED: "Config issue",
};

function heartbeatLabel(seconds: number | null) {
  if (seconds === null) return "এখনো নেই";
  if (seconds < 60) return `${seconds} সেকেন্ড আগে`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)} মিনিট আগে`;
  return `${Math.floor(seconds / 3_600)} ঘণ্টা আগে`;
}

function statusClasses(health: SchedulerHealth) {
  if (health.status === "HEALTHY" || health.status === "RUNNING") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  }
  if (health.status === "LAZY_MODE" || health.status === "AWAITING_FIRST_RUN") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-500";
}

export function FocusSchedulerHealth() {
  const [health, setHealth] = useState<SchedulerHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/focus/scheduler-health", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Scheduler health লোড হয়নি");
      setHealth(data.health);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scheduler health লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function runNow() {
    if (!window.confirm("Due Focus schedule এখন process করবেন?")) return;
    setRunning(true);
    try {
      const response = await fetch("/api/admin/focus/scheduler-health", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.code ?? data.error ?? "Scheduler run ব্যর্থ");
      const run = data.run as RunReport;
      setHealth(data.health);
      if (run.status === "SKIPPED_OVERLAP") {
        toast.info("আরেকটি scheduler run ইতিমধ্যে চলছে");
      } else {
        toast.success(
          `Scheduler সম্পন্ন · ${run.sessionsStarted} session · ${run.remindersSent} reminder`
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scheduler run ব্যর্থ");
      await load();
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card className="overflow-hidden border-violet-500/20">
      <div className="border-b border-border/70 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold">
              <Activity className="h-5 w-5 text-violet-500" />
              Scheduler Operations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              External cron heartbeat, queue এবং cross-instance lease monitor
            </p>
          </div>
          <div className="flex items-center gap-2">
            {health && (
              <Badge variant="outline" className={statusClasses(health)}>
                {STATUS_LABELS[health.status]}
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              aria-label="Scheduler health refresh"
              onClick={() => void load()}
              disabled={loading || running}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {loading && !health ? (
          <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Health sync হচ্ছে…
          </div>
        ) : health ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-card/50 p-3">
                <ServerCog className="mb-2 h-4 w-4 text-violet-500" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Mode</p>
                <p className="mt-1 font-semibold capitalize">{health.mode}</p>
                <p className="text-xs text-muted-foreground">
                  Secret {health.cronSecretConfigured ? "ready" : "missing"}
                </p>
              </div>
              <div className="rounded-xl border bg-card/50 p-3">
                <AlarmClockCheck className="mb-2 h-4 w-4 text-cyan-500" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Heartbeat</p>
                <p className="mt-1 font-semibold">{heartbeatLabel(health.heartbeatAgeSeconds)}</p>
                <p className="text-xs text-muted-foreground">
                  stale after {health.staleAfterSeconds}s
                </p>
              </div>
              <div className="rounded-xl border bg-card/50 p-3">
                <CircleGauge className="mb-2 h-4 w-4 text-fuchsia-500" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Queue</p>
                <p className="mt-1 font-semibold">{health.queue.active} active</p>
                <p className="text-xs text-muted-foreground">
                  {health.queue.dueNow} due · {health.queue.upcoming24h} next 24h
                </p>
              </div>
              <div className="rounded-xl border bg-card/50 p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Last run</p>
                <p className="mt-1 font-semibold">{health.state?.lastStatus ?? "NEVER"}</p>
                <p className="text-xs text-muted-foreground">
                  {health.state?.lastSource ?? "—"} · {health.state?.lastDurationMs ?? 0}ms
                </p>
              </div>
            </div>

            {!health.healthy && (
              <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="font-medium">Scheduler attention দরকার</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {health.configurationError
                      ? `Configuration: ${health.configurationError}`
                      : health.state?.lastErrorCode
                        ? `Last error: ${health.state.lastErrorCode}`
                        : "External cron heartbeat সময়মতো পাওয়া যায়নি।"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">
                <p>
                  Total runs: <span className="font-medium text-foreground">{health.state?.totalRuns ?? 0}</span>
                  {" · "}Overlap skip: <span className="font-medium text-foreground">{health.state?.overlapSkips ?? 0}</span>
                  {" · "}Failures: <span className="font-medium text-foreground">{health.state?.consecutiveFailures ?? 0}</span>
                </p>
                <p className="mt-1">
                  Last: {health.state?.lastStartedCount ?? 0} started · {health.state?.lastReminderCount ?? 0} reminded · {health.state?.lastFailedCount ?? 0} failed
                </p>
              </div>
              <Button className="gap-2" onClick={runNow} disabled={running || health.state?.leaseActive}>
                {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {running ? "Processing…" : "Run now"}
              </Button>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Scheduler health পাওয়া যায়নি।
          </p>
        )}
      </div>
    </Card>
  );
}
