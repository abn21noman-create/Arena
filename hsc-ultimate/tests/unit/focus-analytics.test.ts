import { describe, expect, it } from "vitest";
import {
  buildFocusAnalytics,
  calculateFocusStreak,
  getEffectiveFocusMinutes,
  toDhakaDateKey,
  type FocusAnalyticsSession,
} from "@/lib/focus-analytics";

function session(overrides: Partial<FocusAnalyticsSession> = {}): FocusAnalyticsSession {
  const startedAt = new Date("2026-08-04T04:00:00.000Z");
  return {
    id: "focus-1",
    userId: "user-1",
    source: "SELF",
    status: "COMPLETED",
    durationMinutes: 30,
    subjectCode: "PHYSICS",
    focusLabel: "Vector revision",
    startedAt,
    endsAt: new Date(startedAt.getTime() + 30 * 60_000),
    completedAt: new Date(startedAt.getTime() + 30 * 60_000),
    emergencyExitedAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

describe("Focus analytics", () => {
  it("calculates effective time for completed and early-exit sessions", () => {
    expect(getEffectiveFocusMinutes(session())).toBe(30);
    expect(getEffectiveFocusMinutes(session({
      status: "EMERGENCY_EXIT",
      completedAt: null,
      emergencyExitedAt: new Date("2026-08-04T04:12:00.000Z"),
    }))).toBe(12);
  });

  it("builds subject, source, completion and emergency breakdowns", () => {
    const now = new Date("2026-08-04T12:00:00.000Z");
    const result = buildFocusAnalytics([
      session(),
      session({
        id: "focus-2",
        source: "ADMIN",
        status: "EMERGENCY_EXIT",
        durationMinutes: 20,
        subjectCode: "CHEMISTRY",
        startedAt: new Date("2026-08-04T06:00:00.000Z"),
        endsAt: new Date("2026-08-04T06:20:00.000Z"),
        completedAt: null,
        emergencyExitedAt: new Date("2026-08-04T06:10:00.000Z"),
      }),
    ], 7, now);

    expect(result.totalMinutes).toBe(40);
    expect(result.sessionCount).toBe(2);
    expect(result.completionRate).toBe(50);
    expect(result.emergencyExitCount).toBe(1);
    expect(result.sourceBreakdown).toEqual(expect.arrayContaining([
      { source: "SELF", minutes: 30, count: 1 },
      { source: "ADMIN", minutes: 10, count: 1 },
    ]));
    expect(result.subjectBreakdown[0]).toMatchObject({ code: "PHYSICS", minutes: 30 });
  });

  it("calculates current and longest daily streak", () => {
    const today = new Date("2026-08-04T12:00:00.000Z");
    expect(calculateFocusStreak(["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"], today))
      .toEqual({ current: 4, longest: 4 });
    expect(calculateFocusStreak(["2026-07-20", "2026-07-21"], today))
      .toEqual({ current: 0, longest: 2 });
  });

  it("uses Asia/Dhaka calendar dates", () => {
    expect(toDhakaDateKey(new Date("2026-08-03T20:30:00.000Z"))).toBe("2026-08-04");
  });
});
