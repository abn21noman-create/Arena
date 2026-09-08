import { describe, expect, it } from "vitest";
import {
  classifyAuditAction,
  deriveSystemOverallStatus,
  getDeploymentReadiness,
} from "@/lib/system-operations";

describe("System operations", () => {
  it("reports local deployment gaps without exposing values", () => {
    const secret = "do-not-expose-this-value";
    const readiness = getDeploymentReadiness({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://configured",
      DIRECT_URL: "postgresql://configured",
      NEXTAUTH_SECRET: secret,
      NEXTAUTH_URL: "http://localhost:3000",
    });
    expect(readiness).toMatchObject({
      coreEnvironment: true,
      publicUrl: false,
      externalScheduler: false,
      distributedRateLimit: false,
      firebaseAdmin: false,
      productionRuntime: false,
      privacyTerms: true,
    });
    expect(JSON.stringify(readiness)).not.toContain(secret);
    expect(JSON.stringify(readiness)).not.toContain("postgresql://");
  });

  it("recognizes a fully configured production deployment", () => {
    expect(getDeploymentReadiness({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://configured",
      DIRECT_URL: "postgresql://configured",
      NEXTAUTH_SECRET: "configured",
      NEXTAUTH_URL: "https://hsc.example",
      CRON_SECRET: "configured",
      FOCUS_SCHEDULER_MODE: "external",
      UPSTASH_REDIS_REST_URL: "https://redis.example",
      UPSTASH_REDIS_REST_TOKEN: "configured",
      FIREBASE_PROJECT_ID: "configured",
      FIREBASE_CLIENT_EMAIL: "configured@example.test",
      FIREBASE_PRIVATE_KEY: "configured",
    })).toMatchObject({
      readyCount: 7,
      totalChecks: 7,
      pending: [],
    });
  });

  it("derives healthy, degraded and unhealthy status", () => {
    const healthy = {
      databaseUp: true,
      migrationsInSync: true,
      rateLimitStatus: "ready" as const,
      schedulerHealthy: true,
      nativePushStatus: "ready" as const,
      memoryPercentage: 50,
    };
    expect(deriveSystemOverallStatus(healthy)).toBe("healthy");
    expect(deriveSystemOverallStatus({ ...healthy, migrationsInSync: false })).toBe("degraded");
    expect(deriveSystemOverallStatus({ ...healthy, databaseUp: false })).toBe("unhealthy");
  });

  it("keeps optional unconfigured native push healthy but flags partial setup", () => {
    const base = {
      databaseUp: true,
      migrationsInSync: true,
      rateLimitStatus: "local" as const,
      schedulerHealthy: true,
      memoryPercentage: 40,
    };
    expect(deriveSystemOverallStatus({ ...base, nativePushStatus: "unconfigured" })).toBe("healthy");
    expect(deriveSystemOverallStatus({ ...base, nativePushStatus: "partial" })).toBe("degraded");
  });

  it("classifies real audit actions for visual triage", () => {
    expect(classifyAuditAction("FOCUS_EMERGENCY_EXIT")).toBe("critical");
    expect(classifyAuditAction("USER_ROLE_CHANGE")).toBe("warning");
    expect(classifyAuditAction("FOCUS_SCHEDULE_CREATED")).toBe("info");
  });
});
