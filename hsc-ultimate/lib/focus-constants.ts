export const MIN_FOCUS_MINUTES = 20;
export const MAX_FOCUS_MINUTES = 120;
export const FOCUS_CONSENT_VERSION = "2026-08-05";

export interface FocusConsentState {
  allowAdminStart: boolean;
  consentedAt: Date | string | null;
  revokedAt: Date | string | null;
  consentVersion: string;
}

export function hasCurrentFocusConsent(
  contract: FocusConsentState | null | undefined
): contract is FocusConsentState {
  return Boolean(
    contract?.allowAdminStart &&
      contract.consentedAt &&
      !contract.revokedAt &&
      contract.consentVersion === FOCUS_CONSENT_VERSION
  );
}

export function isValidFocusDuration(value: unknown): value is number {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= MIN_FOCUS_MINUTES &&
    value <= MAX_FOCUS_MINUTES;
}

export const DEFAULT_ANDROID_ALLOWLIST = [
  "com.hscultimate.app",
  "com.android.dialer",
  "com.google.android.dialer",
  "com.android.server.telecom",
  "com.android.emergency",
  "com.google.android.deskclock",
  "com.android.deskclock",
  "com.sec.android.app.clockpackage",
  "com.android.systemui",
] as const;
