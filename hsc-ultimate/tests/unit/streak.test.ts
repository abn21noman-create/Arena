import { describe, expect, it } from "vitest";
import { calculateStreakTransition, MAX_STREAK_FREEZES } from "@/lib/streak";

const NOW = new Date(2026, 7, 3, 12, 0, 0);
function daysAgo(days: number) {
  const value = new Date(NOW);
  value.setDate(value.getDate() - days);
  return value;
}

describe("Streak transition logic", () => {
  it("starts a new streak for a first activity", () => {
    expect(calculateStreakTransition(null, 0, 2, NOW)).toEqual({
      streakCount: 1,
      freezesRemaining: 2,
      isNewDay: true,
      usedFreeze: false,
    });
  });

  it("does not count twice on the same day", () => {
    const result = calculateStreakTransition(new Date(2026, 7, 3, 7), 8, 2, NOW);
    expect(result.streakCount).toBe(8);
    expect(result.isNewDay).toBe(false);
  });

  it("increments a consecutive-day streak", () => {
    const result = calculateStreakTransition(daysAgo(1), 8, 2, NOW);
    expect(result.streakCount).toBe(9);
    expect(result.usedFreeze).toBe(false);
  });

  it("uses one freeze for one missed day", () => {
    const result = calculateStreakTransition(daysAgo(2), 8, 2, NOW);
    expect(result.streakCount).toBe(9);
    expect(result.freezesRemaining).toBe(1);
    expect(result.usedFreeze).toBe(true);
  });

  it("resets when a freeze is unavailable or the gap is too large", () => {
    expect(calculateStreakTransition(daysAgo(2), 8, 0, NOW).streakCount).toBe(1);
    expect(calculateStreakTransition(daysAgo(4), 8, 2, NOW).streakCount).toBe(1);
  });

  it("clamps an invalid freeze count", () => {
    expect(calculateStreakTransition(daysAgo(1), 1, 99, NOW).freezesRemaining)
      .toBe(MAX_STREAK_FREEZES);
  });
});
