import { describe, expect, it } from "vitest";
import {
  DEFAULT_ANDROID_ALLOWLIST,
  FOCUS_CONSENT_VERSION,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
  hasCurrentFocusConsent,
  isValidFocusDuration,
} from "@/lib/focus-constants";

describe("Strict Focus policy", () => {
  it("accepts durations from 20 minutes through 2 hours", () => {
    expect(isValidFocusDuration(MIN_FOCUS_MINUTES)).toBe(true);
    expect(isValidFocusDuration(25)).toBe(true);
    expect(isValidFocusDuration(60)).toBe(true);
    expect(isValidFocusDuration(MAX_FOCUS_MINUTES)).toBe(true);
  });

  it("rejects unsafe or out-of-range durations", () => {
    for (const value of [0, 19, 121, 20.5, Number.NaN, "20", null]) {
      expect(isValidFocusDuration(value)).toBe(false);
    }
  });

  it("accepts only an active current-version Admin consent", () => {
    const current = {
      allowAdminStart: true,
      consentedAt: "2026-08-05T00:00:00.000Z",
      revokedAt: null,
      consentVersion: FOCUS_CONSENT_VERSION,
    };
    expect(hasCurrentFocusConsent(current)).toBe(true);
    expect(hasCurrentFocusConsent({ ...current, consentVersion: "2026-08" })).toBe(false);
    expect(hasCurrentFocusConsent({ ...current, revokedAt: "2026-08-05T01:00:00.000Z" })).toBe(false);
    expect(hasCurrentFocusConsent({ ...current, allowAdminStart: false })).toBe(false);
  });

  it("always allowlists the app, phone, system UI, and an alarm app", () => {
    expect(DEFAULT_ANDROID_ALLOWLIST).toContain("com.hscultimate.app");
    expect(DEFAULT_ANDROID_ALLOWLIST).toContain("com.android.dialer");
    expect(DEFAULT_ANDROID_ALLOWLIST).toContain("com.android.systemui");
    expect(DEFAULT_ANDROID_ALLOWLIST).toContain("com.google.android.deskclock");
  });
});
