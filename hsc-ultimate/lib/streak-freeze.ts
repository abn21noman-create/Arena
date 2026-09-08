/**
 * Streak Freeze Protection System.
 * 
 * Allows students to maintain their learning habits and streak even when
 * busy, preventing streak loss demotivation.
 */

const STREAK_FREEZE_KEY = "hsc_streak_freeze_tokens";
const STREAK_LAST_PROTECTED_KEY = "hsc_streak_last_freeze_date";

export function getStreakFreezeTokens(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(STREAK_FREEZE_KEY);
    return raw !== null ? parseInt(raw, 10) : 2; // default 2 free tokens
  } catch {
    return 1;
  }
}

export function addStreakFreezeToken(amount = 1): number {
  if (typeof window === "undefined") return 1;
  try {
    const current = getStreakFreezeTokens();
    const updated = Math.min(5, current + amount); // max 5 tokens
    localStorage.setItem(STREAK_FREEZE_KEY, String(updated));
    return updated;
  } catch {
    return 1;
  }
}

export function consumeStreakFreezeToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getStreakFreezeTokens();
    if (current <= 0) return false;

    localStorage.setItem(STREAK_FREEZE_KEY, String(current - 1));
    localStorage.setItem(STREAK_LAST_PROTECTED_KEY, new Date().toISOString().split("T")[0]);
    return true;
  } catch {
    return false;
  }
}
