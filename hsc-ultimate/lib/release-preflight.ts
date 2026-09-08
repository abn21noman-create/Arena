import { createHash } from "node:crypto";

export type PreflightCheckStatus = "PASS" | "WARN" | "FAIL";

export interface PreflightCheck {
  id: string;
  status: PreflightCheckStatus;
  detail: string;
}

export type ReleasePreflightStatus = "DEPLOY_READY" | "LOCAL_READY" | "BLOCKED";

export function deriveReleasePreflightStatus(input: {
  checks: PreflightCheck[];
  externalPending: string[];
}): ReleasePreflightStatus {
  if (input.checks.some((check) => check.status === "FAIL")) return "BLOCKED";
  return input.externalPending.length > 0 ? "LOCAL_READY" : "DEPLOY_READY";
}

export function aggregateFileChecksums(
  files: Array<{ path: string; sha256: string }>
): string {
  const canonical = [...files]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((file) => `${file.path}\0${file.sha256}`)
    .join("\n");
  return createHash("sha256").update(canonical).digest("hex");
}

export function sha256Text(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Report objects must never contain credential values, only check IDs/booleans. */
export function reportContainsForbiddenSecretKey(value: unknown): boolean {
  const forbidden = /^(?:password|passwordHash|token|accessToken|refreshToken|privateKey|secret|databaseUrl|directUrl)$/i;
  if (Array.isArray(value)) return value.some(reportContainsForbiddenSecretKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) => forbidden.test(key) || reportContainsForbiddenSecretKey(nested)
  );
}
