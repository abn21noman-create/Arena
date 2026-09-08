import { describe, expect, it } from "vitest";
import { getNextScheduleRun } from "@/lib/focus-schedule";
import {
  deriveFocusSchedulerHealth,
  resolveFocusSchedulerConfig,
  type FocusSchedulerStateSnapshot,
} from "@/lib/focus-scheduler-ops";

function schedulerState(
  overrides: Partial<FocusSchedulerStateSnapshot> = {}
): FocusSchedulerStateSnapshot {
  return {
    lastStartedAt: "2026-08-04T09:59:58.000Z",
    lastCompletedAt: "2026-08-04T10:00:00.000Z",
    lastSuccessAt: "2026-08-04T10:00:00.000Z",
    lastFailureAt: null,
    lastStatus: "SUCCESS",
    lastSource: "CRON",
    lastDurationMs: 120,
    lastReminderCount: 0,
    lastDueCount: 0,
    lastProcessedCount: 0,
    lastStartedCount: 0,
    lastFailedCount: 0,
    lastErrorCode: null,
    consecutiveFailures: 0,
    totalRuns: 1,
    overlapSkips: 0,
    leaseActive: false,
    leaseExpiresAt: null,
    ...overrides,
  };
}

describe("Focus schedule recurrence", () => {
  it("returns null for one-time schedules", () => {
    expect(getNextScheduleRun(new Date("2026-08-04T10:00:00Z"), "NONE")).toBeNull();
  });

  it("advances daily and weekly schedules", () => {
    const current = new Date("2026-08-04T10:00:00Z");
    expect(getNextScheduleRun(current, "DAILY", current)?.toISOString()).toBe("2026-08-05T10:00:00.000Z");
    expect(getNextScheduleRun(current, "WEEKLY", current)?.toISOString()).toBe("2026-08-11T10:00:00.000Z");
  });

  it("skips missed recurring occurrences until the next future run", () => {
    const next = getNextScheduleRun(
      new Date("2026-08-01T10:00:00Z"),
      "DAILY",
      new Date("2026-08-04T12:00:00Z")
    );
    expect(next?.toISOString()).toBe("2026-08-05T10:00:00.000Z");
  });
});

describe("Focus scheduler operations health", () => {
  const externalConfig = resolveFocusSchedulerConfig({
    NODE_ENV: "production",
    CRON_SECRET: "configured-for-test",
    FOCUS_SCHEDULER_MODE: "external",
    FOCUS_SCHEDULER_STALE_AFTER_SECONDS: "180",
  });

  it("defaults development to lazy and production to external", () => {
    expect(resolveFocusSchedulerConfig({ NODE_ENV: "development" }).mode).toBe("lazy");
    expect(
      resolveFocusSchedulerConfig({
        NODE_ENV: "production",
        CRON_SECRET: "configured-for-test",
      }).mode
    ).toBe("external");
  });

  it("surfaces missing production cron configuration", () => {
    expect(resolveFocusSchedulerConfig({ NODE_ENV: "production" })).toMatchObject({
      mode: "external",
      configurationError: "missing_cron_secret",
    });
    expect(
      resolveFocusSchedulerConfig({
        NODE_ENV: "production",
        CRON_SECRET: "configured-for-test",
        FOCUS_SCHEDULER_MODE: "invalid",
      }).configurationError
    ).toBe("invalid_scheduler_mode");
  });

  it("treats lazy mode as healthy without an external heartbeat", () => {
    const health = deriveFocusSchedulerHealth({
      config: resolveFocusSchedulerConfig({ NODE_ENV: "development" }),
      state: null,
      now: new Date("2026-08-04T10:05:00Z"),
    });
    expect(health).toMatchObject({ status: "LAZY_MODE", healthy: true });
  });

  it("reports awaiting, healthy, delayed and stale heartbeats", () => {
    const now = new Date("2026-08-04T10:02:00Z");
    expect(
      deriveFocusSchedulerHealth({ config: externalConfig, state: null, now }).status
    ).toBe("AWAITING_FIRST_RUN");
    expect(
      deriveFocusSchedulerHealth({
        config: externalConfig,
        state: schedulerState({ lastSuccessAt: "2026-08-04T10:01:30.000Z" }),
        now,
      })
    ).toMatchObject({ status: "HEALTHY", healthy: true, heartbeatAgeSeconds: 30 });
    expect(
      deriveFocusSchedulerHealth({
        config: externalConfig,
        state: schedulerState({ lastSuccessAt: "2026-08-04T10:00:20.000Z" }),
        now,
      }).status
    ).toBe("DEGRADED");
    expect(
      deriveFocusSchedulerHealth({
        config: externalConfig,
        state: schedulerState({ lastSuccessAt: "2026-08-04T09:58:00.000Z" }),
        now,
      }).status
    ).toBe("STALE");
  });

  it("prioritizes active leases and failures correctly", () => {
    const now = new Date("2026-08-04T10:02:00Z");
    expect(
      deriveFocusSchedulerHealth({
        config: externalConfig,
        state: schedulerState({ lastStatus: "RUNNING", leaseActive: true }),
        now,
      })
    ).toMatchObject({ status: "RUNNING", healthy: true });
    expect(
      deriveFocusSchedulerHealth({
        config: externalConfig,
        state: schedulerState({
          lastStatus: "FAILED",
          consecutiveFailures: 1,
          lastErrorCode: "SCHEDULER_EXECUTION_FAILED",
        }),
        now,
      })
    ).toMatchObject({ status: "FAILING", healthy: false });
  });
});
