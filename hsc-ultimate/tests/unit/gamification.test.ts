import { describe, expect, it } from "vitest";
import {
  calculateLevel,
  getLevelProgress,
  xpRequiredForLevel,
} from "@/lib/gamification";

describe("Gamification level logic", () => {
  it("starts at level 1", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(49)).toBe(1);
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it("advances at exact thresholds", () => {
    expect(xpRequiredForLevel(2)).toBe(50);
    expect(calculateLevel(50)).toBe(2);
    expect(calculateLevel(xpRequiredForLevel(5))).toBe(5);
  });

  it("requires progressively more total XP", () => {
    expect(xpRequiredForLevel(3)).toBeGreaterThan(xpRequiredForLevel(2));
    expect(xpRequiredForLevel(10)).toBeGreaterThan(xpRequiredForLevel(5));
  });

  it("handles high and invalid input defensively", () => {
    expect(calculateLevel(10_000)).toBeGreaterThan(5);
    expect(calculateLevel(-10)).toBe(1);
    expect(calculateLevel(Number.POSITIVE_INFINITY)).toBe(1);
    expect(calculateLevel(Number.NaN)).toBe(1);
  });

  it("returns zero progress at a level boundary", () => {
    const progress = getLevelProgress(xpRequiredForLevel(5));
    expect(progress.level).toBe(5);
    expect(progress.progressPct).toBe(0);
  });

  it("keeps progress percentage in the valid range", () => {
    for (const xp of [-10, 0, 50, 125, 1_000, 100_000]) {
      const progress = getLevelProgress(xp);
      expect(progress.progressPct).toBeGreaterThanOrEqual(0);
      expect(progress.progressPct).toBeLessThanOrEqual(100);
    }
  });
});
