import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  processDueFocusSchedulesDetailed,
  type FocusScheduleProcessSummary,
} from "@/lib/focus-schedule";

export type FocusSchedulerMode = "lazy" | "external";
export type FocusSchedulerRunSource = "CRON" | "ADMIN";
export type FocusSchedulerHealthStatus =
  | "LAZY_MODE"
  | "AWAITING_FIRST_RUN"
  | "HEALTHY"
  | "DEGRADED"
  | "STALE"
  | "FAILING"
  | "RUNNING"
  | "MISCONFIGURED";

interface FocusSchedulerEnvironment {
  NODE_ENV?: string;
  CRON_SECRET?: string;
  FOCUS_SCHEDULER_MODE?: string;
  FOCUS_SCHEDULER_STALE_AFTER_SECONDS?: string;
  FOCUS_SCHEDULER_LEASE_SECONDS?: string;
}

export interface FocusSchedulerConfig {
  mode: FocusSchedulerMode;
  externalExpected: boolean;
  cronSecretConfigured: boolean;
  staleAfterSeconds: number;
  leaseSeconds: number;
  configurationError: string | null;
}

export interface FocusSchedulerStateSnapshot {
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
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
  leaseExpiresAt: string | null;
}

export interface FocusSchedulerHealth {
  status: FocusSchedulerHealthStatus;
  healthy: boolean;
  mode: FocusSchedulerMode;
  externalExpected: boolean;
  cronSecretConfigured: boolean;
  staleAfterSeconds: number;
  heartbeatAgeSeconds: number | null;
  state: FocusSchedulerStateSnapshot | null;
  queue: {
    active: number;
    dueNow: number;
    upcoming24h: number;
  };
  fallback: {
    lazyProcessingEnabled: true;
    description: string;
  };
  configurationError: string | null;
}

export interface FocusSchedulerRunReport {
  status: "SUCCESS" | "SKIPPED_OVERLAP";
  source: FocusSchedulerRunSource;
  durationMs: number;
  remindersSent: number;
  dueCandidates: number;
  processed: number;
  sessionsStarted: number;
  scheduleFailures: number;
}

export class FocusSchedulerRunError extends Error {
  readonly code: string;

  constructor(code = "SCHEDULER_EXECUTION_FAILED") {
    super("Focus scheduler run failed");
    this.name = "FocusSchedulerRunError";
    this.code = code;
  }
}

const GLOBAL_STATE_ID = "global";
const DEFAULT_STALE_AFTER_SECONDS = 180;
const DEFAULT_LEASE_SECONDS = 120;

function parseBoundedInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number
): { value: number; invalid: boolean } {
  if (value === undefined || value.trim() === "") return { value: fallback, invalid: false };
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    return { value: fallback, invalid: true };
  }
  return { value: parsed, invalid: false };
}

export function resolveFocusSchedulerConfig(
  env: FocusSchedulerEnvironment = process.env as FocusSchedulerEnvironment
): FocusSchedulerConfig {
  const defaultMode: FocusSchedulerMode = env.NODE_ENV === "production" ? "external" : "lazy";
  const rawMode = env.FOCUS_SCHEDULER_MODE?.trim().toLowerCase();
  const validMode = rawMode === "lazy" || rawMode === "external";
  const mode = validMode ? rawMode : defaultMode;
  const stale = parseBoundedInteger(
    env.FOCUS_SCHEDULER_STALE_AFTER_SECONDS,
    DEFAULT_STALE_AFTER_SECONDS,
    60,
    3_600
  );
  const lease = parseBoundedInteger(
    env.FOCUS_SCHEDULER_LEASE_SECONDS,
    DEFAULT_LEASE_SECONDS,
    60,
    600
  );

  let configurationError: string | null = null;
  if (rawMode && !validMode) configurationError = "invalid_scheduler_mode";
  else if (stale.invalid) configurationError = "invalid_stale_threshold";
  else if (lease.invalid) configurationError = "invalid_lease_duration";
  else if (mode === "external" && !env.CRON_SECRET) configurationError = "missing_cron_secret";

  return {
    mode,
    externalExpected: mode === "external",
    cronSecretConfigured: Boolean(env.CRON_SECRET),
    staleAfterSeconds: stale.value,
    leaseSeconds: lease.value,
    configurationError,
  };
}

function asIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export function deriveFocusSchedulerHealth(input: {
  config: FocusSchedulerConfig;
  state: FocusSchedulerStateSnapshot | null;
  now?: Date;
  queue?: FocusSchedulerHealth["queue"];
}): FocusSchedulerHealth {
  const now = input.now ?? new Date();
  const queue = input.queue ?? { active: 0, dueNow: 0, upcoming24h: 0 };
  const heartbeatMs = input.state?.lastSuccessAt
    ? new Date(input.state.lastSuccessAt).getTime()
    : Number.NaN;
  const heartbeatAgeSeconds = Number.isFinite(heartbeatMs)
    ? Math.max(0, Math.floor((now.getTime() - heartbeatMs) / 1000))
    : null;

  let status: FocusSchedulerHealthStatus;
  let healthy = false;
  if (input.config.configurationError) {
    status = "MISCONFIGURED";
  } else if (input.config.mode === "lazy") {
    status = "LAZY_MODE";
    healthy = true;
  } else if (
    input.state?.lastStatus === "RUNNING" &&
    input.state.leaseActive
  ) {
    status = "RUNNING";
    healthy = true;
  } else if (!input.state?.lastSuccessAt) {
    status = "AWAITING_FIRST_RUN";
  } else if (
    input.state.lastStatus === "FAILED" ||
    input.state.consecutiveFailures > 0
  ) {
    status = "FAILING";
  } else if (
    heartbeatAgeSeconds !== null &&
    heartbeatAgeSeconds > input.config.staleAfterSeconds
  ) {
    status = "STALE";
  } else if (
    heartbeatAgeSeconds !== null &&
    heartbeatAgeSeconds > Math.max(60, Math.floor(input.config.staleAfterSeconds / 2))
  ) {
    status = "DEGRADED";
  } else {
    status = "HEALTHY";
    healthy = true;
  }

  return {
    status,
    healthy,
    mode: input.config.mode,
    externalExpected: input.config.externalExpected,
    cronSecretConfigured: input.config.cronSecretConfigured,
    staleAfterSeconds: input.config.staleAfterSeconds,
    heartbeatAgeSeconds,
    state: input.state,
    queue,
    fallback: {
      lazyProcessingEnabled: true,
      description:
        "User/Admin app polling also processes due schedules; external cron is still required for closed-app timing.",
    },
    configurationError: input.config.configurationError,
  };
}

function snapshotSchedulerState(
  state: {
    lastStartedAt: Date | null;
    lastCompletedAt: Date | null;
    lastSuccessAt: Date | null;
    lastFailureAt: Date | null;
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
    leaseToken: string | null;
    leaseExpiresAt: Date | null;
  },
  now: Date
): FocusSchedulerStateSnapshot {
  return {
    lastStartedAt: asIso(state.lastStartedAt),
    lastCompletedAt: asIso(state.lastCompletedAt),
    lastSuccessAt: asIso(state.lastSuccessAt),
    lastFailureAt: asIso(state.lastFailureAt),
    lastStatus: state.lastStatus,
    lastSource: state.lastSource,
    lastDurationMs: state.lastDurationMs,
    lastReminderCount: state.lastReminderCount,
    lastDueCount: state.lastDueCount,
    lastProcessedCount: state.lastProcessedCount,
    lastStartedCount: state.lastStartedCount,
    lastFailedCount: state.lastFailedCount,
    lastErrorCode: state.lastErrorCode,
    consecutiveFailures: state.consecutiveFailures,
    totalRuns: state.totalRuns,
    overlapSkips: state.overlapSkips,
    leaseActive: Boolean(state.leaseToken && state.leaseExpiresAt && state.leaseExpiresAt > now),
    leaseExpiresAt: asIso(state.leaseExpiresAt),
  };
}

export async function getFocusSchedulerHealth(now = new Date()): Promise<FocusSchedulerHealth> {
  const config = resolveFocusSchedulerConfig();
  const next24h = new Date(now.getTime() + 24 * 60 * 60_000);
  const [state, active, dueNow, upcoming24h] = await Promise.all([
    prisma.focusSchedulerState.findUnique({ where: { id: GLOBAL_STATE_ID } }),
    prisma.focusSchedule.count({ where: { status: "ACTIVE", nextRunAt: { not: null } } }),
    prisma.focusSchedule.count({ where: { status: "ACTIVE", nextRunAt: { lte: now } } }),
    prisma.focusSchedule.count({
      where: { status: "ACTIVE", nextRunAt: { gt: now, lte: next24h } },
    }),
  ]);

  return deriveFocusSchedulerHealth({
    config,
    state: state ? snapshotSchedulerState(state, now) : null,
    now,
    queue: { active, dueNow, upcoming24h },
  });
}

function safeSchedulerErrorCode(error: unknown): string {
  if (error instanceof FocusSchedulerRunError) return error.code;
  return "SCHEDULER_EXECUTION_FAILED";
}

function summarizeRun(
  source: FocusSchedulerRunSource,
  durationMs: number,
  summary: FocusScheduleProcessSummary
): FocusSchedulerRunReport {
  const sessionsStarted = summary.results.filter((result) => result.result === "STARTED").length;
  return {
    status: "SUCCESS",
    source,
    durationMs,
    remindersSent: summary.remindersSent,
    dueCandidates: summary.dueCandidates,
    processed: summary.results.length,
    sessionsStarted,
    scheduleFailures: summary.results.length - sessionsStarted,
  };
}

export async function runFocusScheduler(input: {
  source: FocusSchedulerRunSource;
  limit?: number;
}): Promise<FocusSchedulerRunReport> {
  const config = resolveFocusSchedulerConfig();
  const startedAt = new Date();
  const startedMs = Date.now();
  const leaseToken = randomUUID();
  const leaseExpiresAt = new Date(startedAt.getTime() + config.leaseSeconds * 1000);
  const limit = Math.min(50, Math.max(1, input.limit ?? 50));

  await prisma.focusSchedulerState.upsert({
    where: { id: GLOBAL_STATE_ID },
    create: { id: GLOBAL_STATE_ID },
    update: {},
  });

  const claim = await prisma.focusSchedulerState.updateMany({
    where: {
      id: GLOBAL_STATE_ID,
      OR: [
        { leaseExpiresAt: null },
        { leaseExpiresAt: { lte: startedAt } },
      ],
    },
    data: {
      leaseToken,
      leaseExpiresAt,
      lastStartedAt: startedAt,
      lastStatus: "RUNNING",
      lastSource: input.source,
      lastErrorCode: null,
      totalRuns: { increment: 1 },
    },
  });

  if (claim.count !== 1) {
    await prisma.focusSchedulerState.update({
      where: { id: GLOBAL_STATE_ID },
      data: { overlapSkips: { increment: 1 } },
    });
    return {
      status: "SKIPPED_OVERLAP",
      source: input.source,
      durationMs: Date.now() - startedMs,
      remindersSent: 0,
      dueCandidates: 0,
      processed: 0,
      sessionsStarted: 0,
      scheduleFailures: 0,
    };
  }

  try {
    const summary = await processDueFocusSchedulesDetailed({ limit });
    const durationMs = Date.now() - startedMs;
    const report = summarizeRun(input.source, durationMs, summary);
    const completedAt = new Date();
    const release = await prisma.focusSchedulerState.updateMany({
      where: { id: GLOBAL_STATE_ID, leaseToken },
      data: {
        leaseToken: null,
        leaseExpiresAt: null,
        lastCompletedAt: completedAt,
        lastSuccessAt: completedAt,
        lastStatus: "SUCCESS",
        lastDurationMs: durationMs,
        lastReminderCount: report.remindersSent,
        lastDueCount: report.dueCandidates,
        lastProcessedCount: report.processed,
        lastStartedCount: report.sessionsStarted,
        lastFailedCount: report.scheduleFailures,
        lastErrorCode: null,
        consecutiveFailures: 0,
      },
    });
    if (release.count !== 1) throw new FocusSchedulerRunError("SCHEDULER_LEASE_LOST");
    return report;
  } catch (error) {
    const completedAt = new Date();
    await prisma.focusSchedulerState.updateMany({
      where: { id: GLOBAL_STATE_ID, leaseToken },
      data: {
        leaseToken: null,
        leaseExpiresAt: null,
        lastCompletedAt: completedAt,
        lastFailureAt: completedAt,
        lastStatus: "FAILED",
        lastDurationMs: Date.now() - startedMs,
        lastReminderCount: 0,
        lastDueCount: 0,
        lastProcessedCount: 0,
        lastStartedCount: 0,
        lastFailedCount: 0,
        lastErrorCode: safeSchedulerErrorCode(error),
        consecutiveFailures: { increment: 1 },
      },
    });
    throw error instanceof FocusSchedulerRunError
      ? error
      : new FocusSchedulerRunError();
  }
}
