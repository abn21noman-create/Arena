"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlarmClockCheck,
  BookOpenCheck,
  CheckCircle2,
  CloudCog,
  Database,
  Download,
  History,
  MemoryStick,
  RadioTower,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OperationsSnapshot {
  generatedAt: string;
  overallStatus: "healthy" | "degraded" | "unhealthy";
  runtime: {
    version: string;
    node: string;
    environment: string;
    uptimeSeconds: number;
    memory: { heapUsedMb: number; heapTotalMb: number; rssMb: number; percentage: number };
  };
  database: {
    status: "up";
    latencyMs: number;
    migrations: {
      applied: number;
      expected: number;
      inSync: boolean;
      latest: { name: string; finishedAt: string } | null;
    };
  };
  content: {
    users: number;
    bannedUsers: number;
    subjects: number;
    topics: number;
    coreMcq: number;
    admissionMcq: number;
    cq: number;
  };
  operations: {
    activeFocusSessions: number;
    activeFocusSchedules: number;
    nativeDevices: number;
    failedNativeDeliveries24h: number;
    auditEvents24h: number;
    pendingAcademicReports: number;
  };
  components: {
    rateLimit: {
      status: string;
      backend: string;
      distributed: boolean;
      circuitOpen: boolean;
      fallbackReason: string | null;
    };
    scheduler: {
      status: string;
      healthy: boolean;
      mode: string;
      heartbeatAgeSeconds: number | null;
      queue: { active: number; dueNow: number; upcoming24h: number };
      configurationError: string | null;
    };
    nativePush: {
      status: string;
      configured: boolean;
      initialized: boolean;
      lastErrorCode: string | null;
    };
  };
  controls: {
    maintenanceMode: boolean;
    announcementEnabled: boolean;
    featureFlagsConfigured: number;
    disabledFeatureFlags: number;
    updatedAt: string | null;
  };
  deployment: {
    coreEnvironment: boolean;
    publicUrl: boolean;
    externalScheduler: boolean;
    distributedRateLimit: boolean;
    firebaseAdmin: boolean;
    productionRuntime: boolean;
    privacyTerms: boolean;
    readyCount: number;
    totalChecks: number;
    pending: string[];
  };
  privacyCompliance: {
    ready: boolean;
    versions: { privacy: string; terms: string; ageAssurance: string };
    currentAcceptances: number;
    missingOrStaleUsers: number;
    publicRoutes: string[];
  };
  recentAudit: Array<{
    id: string;
    actor: string;
    action: string;
    targetType: string | null;
    severity: "info" | "warning" | "critical";
    createdAt: string;
  }>;
}

function uptimeLabel(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function overallClasses(status: OperationsSnapshot["overallStatus"]) {
  if (status === "healthy") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  if (status === "degraded") return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  return "border-rose-500/30 bg-rose-500/10 text-rose-500";
}

function readinessLabel(key: string) {
  const labels: Record<string, string> = {
    coreEnvironment: "Core environment",
    publicUrl: "Public HTTPS URL",
    externalScheduler: "External scheduler",
    distributedRateLimit: "Distributed limiter",
    firebaseAdmin: "Firebase Admin",
    productionRuntime: "Production runtime",
    privacyTerms: "Privacy / Terms pages",
  };
  return labels[key] ?? key;
}

export function SystemOperationsDashboard() {
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/system", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Operations snapshot লোড হয়নি");
      setSnapshot(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operations snapshot লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-violet-500/20">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-gradient-to-r from-violet-500/15 via-fuchsia-500/5 to-cyan-500/10 p-5 sm:p-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ServerCog className="h-6 w-6 text-violet-500" /> System Operations Center
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real database, runtime, security এবং deployment telemetry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button render={<a href="/api/admin/system/content-snapshot" />} size="sm" variant="outline">
              <Download className="mr-1.5 h-4 w-4" /> Content snapshot
            </Button>
            {snapshot && (
              <Badge variant="outline" className={overallClasses(snapshot.overallStatus)}>
                {snapshot.overallStatus}
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              aria-label="System operations refresh"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {loading && !snapshot ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Live telemetry sync হচ্ছে…
          </div>
        ) : snapshot ? (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Metric icon={Users} label="Users" value={snapshot.content.users} detail={`${snapshot.content.bannedUsers} banned`} />
              <Metric icon={BookOpenCheck} label="Question Bank" value={snapshot.content.coreMcq + snapshot.content.admissionMcq} detail={`${snapshot.content.cq} CQ`} />
              <Metric icon={Database} label="Curriculum" value={snapshot.content.topics} detail={`${snapshot.content.subjects} subjects`} />
              <Metric icon={Activity} label="Focus active" value={snapshot.operations.activeFocusSessions} detail={`${snapshot.operations.activeFocusSchedules} schedules`} />
              <Metric icon={History} label="Audit 24h" value={snapshot.operations.auditEvents24h} detail={`${snapshot.operations.pendingAcademicReports} academic reports · ${snapshot.operations.failedNativeDeliveries24h} push failures`} />
            </div>

            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
              <StatusCard
                icon={Database}
                title="Database"
                status={`${snapshot.database.latencyMs}ms`}
                healthy={snapshot.database.migrations.inSync}
                lines={[
                  `${snapshot.database.migrations.applied}/${snapshot.database.migrations.expected} migrations`,
                  snapshot.database.migrations.latest?.name ?? "No migration",
                ]}
              />
              <StatusCard
                icon={ShieldCheck}
                title="Rate limiter"
                status={snapshot.components.rateLimit.status}
                healthy={!snapshot.components.rateLimit.circuitOpen && !snapshot.components.rateLimit.fallbackReason}
                lines={[
                  snapshot.components.rateLimit.backend,
                  snapshot.components.rateLimit.distributed ? "Global counter" : "Per-instance safety",
                ]}
              />
              <StatusCard
                icon={AlarmClockCheck}
                title="Focus scheduler"
                status={snapshot.components.scheduler.status}
                healthy={snapshot.components.scheduler.healthy}
                lines={[
                  `${snapshot.components.scheduler.mode} · ${snapshot.components.scheduler.heartbeatAgeSeconds ?? "—"}s heartbeat`,
                  `${snapshot.components.scheduler.queue.dueNow} due · ${snapshot.components.scheduler.queue.active} active`,
                ]}
              />
              <StatusCard
                icon={RadioTower}
                title="Native push"
                status={snapshot.components.nativePush.status}
                healthy={snapshot.components.nativePush.status === "ready" || snapshot.components.nativePush.status === "unconfigured"}
                lines={[
                  `${snapshot.operations.nativeDevices} devices`,
                  snapshot.components.nativePush.lastErrorCode ?? "No runtime error",
                ]}
              />
              <StatusCard
                icon={ShieldCheck}
                title="Privacy compliance"
                status={snapshot.privacyCompliance.ready ? "ready" : "incomplete"}
                healthy={snapshot.privacyCompliance.ready}
                lines={[
                  `Privacy v${snapshot.privacyCompliance.versions.privacy}`,
                  `${snapshot.privacyCompliance.currentAcceptances}/${snapshot.content.users} current acceptances`,
                ]}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <CloudCog className="h-4 w-4 text-cyan-500" /> Deployment readiness
                  </div>
                  <Badge variant="outline">
                    {snapshot.deployment.readyCount}/{snapshot.deployment.totalChecks}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {Object.entries({
                    coreEnvironment: snapshot.deployment.coreEnvironment,
                    publicUrl: snapshot.deployment.publicUrl,
                    externalScheduler: snapshot.deployment.externalScheduler,
                    distributedRateLimit: snapshot.deployment.distributedRateLimit,
                    firebaseAdmin: snapshot.deployment.firebaseAdmin,
                    productionRuntime: snapshot.deployment.productionRuntime,
                    privacyTerms: snapshot.deployment.privacyTerms,
                  }).map(([key, ready]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                      <span>{readinessLabel(key)}</span>
                      {ready ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TriangleAlert className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <MemoryStick className="h-4 w-4 text-fuchsia-500" /> Runtime
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {snapshot.runtime.environment} · v{snapshot.runtime.version}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <RuntimeValue label="Uptime" value={uptimeLabel(snapshot.runtime.uptimeSeconds)} />
                  <RuntimeValue label="Heap" value={`${snapshot.runtime.memory.heapUsedMb}/${snapshot.runtime.memory.heapTotalMb} MB`} />
                  <RuntimeValue label="RSS" value={`${snapshot.runtime.memory.rssMb} MB`} />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${snapshot.runtime.memory.percentage >= 90 ? "bg-rose-500" : "bg-gradient-to-r from-violet-500 to-cyan-500"}`}
                    style={{ width: `${Math.min(100, snapshot.runtime.memory.percentage)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Node {snapshot.runtime.node} · Memory {snapshot.runtime.memory.percentage}% · Maintenance {snapshot.controls.maintenanceMode ? "ON" : "OFF"}
                </p>
              </Card>
            </div>
          </div>
        ) : (
          <p className="p-10 text-center text-sm text-muted-foreground">Operations snapshot unavailable.</p>
        )}
      </Card>

      {snapshot && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-bold">
              <History className="h-4 w-4 text-violet-500" /> Recent real audit activity
            </h2>
            <Badge variant="outline">Last {snapshot.recentAudit.length}</Badge>
          </div>
          {snapshot.recentAudit.length === 0 ? (
            <p className="text-sm text-muted-foreground">এখনো কোনো audit event নেই।</p>
          ) : (
            <div className="grid gap-2 lg:grid-cols-2">
              {snapshot.recentAudit.map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-xl border p-3">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    event.severity === "critical" ? "bg-rose-500" :
                      event.severity === "warning" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {event.actor} · {event.targetType || "System"} · {new Date(event.createdAt).toLocaleString("bn-BD")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border bg-card/60 p-3.5">
      <Icon className="mb-2 h-4 w-4 text-violet-500" />
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  title,
  status,
  healthy,
  lines,
}: {
  icon: typeof Activity;
  title: string;
  status: string;
  healthy: boolean;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border bg-card/60 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <Icon className="h-4 w-4 text-violet-500" />
        <Badge
          variant="outline"
          className={healthy
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            : "border-amber-500/30 bg-amber-500/10 text-amber-500"}
        >
          {status}
        </Badge>
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-1 truncate text-xs text-muted-foreground">{line}</p>
      ))}
    </div>
  );
}

function RuntimeValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
