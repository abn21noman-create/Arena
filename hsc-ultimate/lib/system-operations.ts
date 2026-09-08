import { getPolicyReadiness } from "@/lib/privacy-compliance";

export type SystemOverallStatus = "healthy" | "degraded" | "unhealthy";

interface SystemOperationsEnvironment {
  NODE_ENV?: string;
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  CRON_SECRET?: string;
  FOCUS_SCHEDULER_MODE?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
}

export interface DeploymentReadiness {
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
}

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

function isPublicHttpsUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}

/** Returns booleans/names only; no URL, token, key or credential value is exposed. */
export function getDeploymentReadiness(
  env: SystemOperationsEnvironment = process.env as SystemOperationsEnvironment
): DeploymentReadiness {
  const coreEnvironment = [
    env.DATABASE_URL,
    env.DIRECT_URL,
    env.NEXTAUTH_SECRET,
    env.NEXTAUTH_URL,
  ].every(present);
  const publicUrl = isPublicHttpsUrl(env.NEXT_PUBLIC_APP_URL) ||
    isPublicHttpsUrl(env.NEXTAUTH_URL);
  const schedulerMode = env.FOCUS_SCHEDULER_MODE?.toLowerCase() ??
    (env.NODE_ENV === "production" ? "external" : "lazy");
  const externalScheduler = schedulerMode === "external" && present(env.CRON_SECRET);
  const distributedRateLimit = present(env.UPSTASH_REDIS_REST_URL) &&
    present(env.UPSTASH_REDIS_REST_TOKEN);
  const firebaseAdmin = [
    env.FIREBASE_PROJECT_ID,
    env.FIREBASE_CLIENT_EMAIL,
    env.FIREBASE_PRIVATE_KEY,
  ].every(present);
  const productionRuntime = env.NODE_ENV === "production";
  const privacyTerms = getPolicyReadiness().ready;
  const checks = {
    coreEnvironment,
    publicUrl,
    externalScheduler,
    distributedRateLimit,
    firebaseAdmin,
    productionRuntime,
    privacyTerms,
  };
  const pending = Object.entries(checks)
    .filter(([, ready]) => !ready)
    .map(([name]) => name);
  return {
    ...checks,
    readyCount: Object.values(checks).filter(Boolean).length,
    totalChecks: Object.keys(checks).length,
    pending,
  };
}

export function deriveSystemOverallStatus(input: {
  databaseUp: boolean;
  migrationsInSync: boolean;
  rateLimitStatus: "local" | "ready" | "degraded" | "misconfigured";
  schedulerHealthy: boolean;
  nativePushStatus: "unconfigured" | "partial" | "ready" | "degraded";
  memoryPercentage: number;
}): SystemOverallStatus {
  if (!input.databaseUp) return "unhealthy";
  if (
    !input.migrationsInSync ||
    input.rateLimitStatus === "degraded" ||
    input.rateLimitStatus === "misconfigured" ||
    !input.schedulerHealthy ||
    input.nativePushStatus === "partial" ||
    input.nativePushStatus === "degraded" ||
    input.memoryPercentage >= 90
  ) {
    return "degraded";
  }
  return "healthy";
}

export function classifyAuditAction(action: string): "info" | "warning" | "critical" {
  const normalized = action.toUpperCase();
  if (
    normalized.includes("DELETE") ||
    normalized.includes("BAN") ||
    normalized.includes("EMERGENCY") ||
    normalized.includes("REVOKED")
  ) {
    return "critical";
  }
  if (
    normalized.includes("FAILED") ||
    normalized.includes("CANCEL") ||
    normalized.includes("RESET") ||
    normalized.includes("ROLE")
  ) {
    return "warning";
  }
  return "info";
}
