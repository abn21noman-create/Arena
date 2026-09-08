// ===================================================================
// Health Check Endpoint — Monitoring এর জন্য
// -------------------------------------------------------------------
// GET /api/health → সব system component check করে status return করে
//   - Database connectivity
//   - Environment variables presence
//   - Server uptime
//   - Memory usage
//   - Local/distributed rate-limit runtime status (no secret values)
//   - Native FCM configuration/delivery runtime status (no credential values)
//   - Focus scheduler heartbeat/queue freshness (no user/session details)
//   - Next.js version
//
// Use cases:
//   - Uptime monitoring (UptimeRobot, BetterUptime, etc.)
//   - Load balancer health checks
//   - CI/CD smoke tests
//   - Incident response
//
// Returns 200 if healthy, 503 if degraded
// ===================================================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRateLimitRuntimeStatus,
  type RateLimitRuntimeStatus,
} from "@/lib/rate-limit";
import { getFocusSchedulerHealth } from "@/lib/focus-scheduler-ops";
import {
  getNativePushRuntimeStatus,
  type NativePushRuntimeStatus,
} from "@/lib/native-push";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number; // seconds
  version: string;
  checks: {
    database: {
      status: "up" | "down";
      latencyMs?: number;
      error?: string;
    };
    environment: {
      status: "ok" | "missing";
      missing: string[];
    };
    memory: {
      used: number; // MB
      total: number; // MB
      percentage: number;
    };
    rateLimit: RateLimitRuntimeStatus;
    nativePush: NativePushRuntimeStatus;
    focusScheduler: {
      status: string;
      healthy: boolean;
      mode: string;
      heartbeatAgeSeconds: number | null;
      activeSchedules: number;
      dueNow: number;
      error?: string;
    };
  };
}

// Required env vars for production
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
] as const;

export const dynamic = "force-dynamic"; // Always fresh, no caching
export const runtime = "nodejs"; // Need Prisma (Node.js only)

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck["checks"] = {
    database: { status: "down" },
    environment: { status: "ok", missing: [] },
    memory: { used: 0, total: 0, percentage: 0 },
    rateLimit: getRateLimitRuntimeStatus(),
    nativePush: getNativePushRuntimeStatus(),
    focusScheduler: {
      status: "UNKNOWN",
      healthy: false,
      mode: "unknown",
      heartbeatAgeSeconds: null,
      activeSchedules: 0,
      dueNow: 0,
    },
  };
  let overallStatus: HealthCheck["status"] = "healthy";

  // 1. Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    checks.database = {
      status: "up",
      latencyMs: dbLatency,
    };
  } catch (error) {
    checks.database = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    overallStatus = "unhealthy";
  }

  // 2. Environment variables check
  const missingEnvVars = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key] || process.env[key]?.length === 0
  );
  if (missingEnvVars.length > 0) {
    checks.environment = {
      status: "missing",
      missing: missingEnvVars,
    };
    if (overallStatus === "healthy") overallStatus = "degraded";
  }

  // Optional memory mode is healthy for local/single-instance deployments.
  // A configured-but-failing or explicitly misconfigured distributed backend
  // is surfaced as degraded without exposing its URL/token.
  if (
    checks.rateLimit.status === "degraded" ||
    checks.rateLimit.status === "misconfigured"
  ) {
    if (overallStatus === "healthy") overallStatus = "degraded";
  }
  if (
    checks.nativePush.status === "partial" ||
    checks.nativePush.status === "degraded"
  ) {
    if (overallStatus === "healthy") overallStatus = "degraded";
  }

  // 3. External Focus scheduler heartbeat/queue check. Lazy mode is healthy
  // locally; production external mode degrades when heartbeat is missing/stale.
  try {
    const scheduler = await getFocusSchedulerHealth();
    checks.focusScheduler = {
      status: scheduler.status,
      healthy: scheduler.healthy,
      mode: scheduler.mode,
      heartbeatAgeSeconds: scheduler.heartbeatAgeSeconds,
      activeSchedules: scheduler.queue.active,
      dueNow: scheduler.queue.dueNow,
    };
    if (!scheduler.healthy && overallStatus === "healthy") {
      overallStatus = "degraded";
    }
  } catch {
    checks.focusScheduler = {
      status: "UNAVAILABLE",
      healthy: false,
      mode: "unknown",
      heartbeatAgeSeconds: null,
      activeSchedules: 0,
      dueNow: 0,
      error: "Scheduler state unavailable",
    };
    if (overallStatus === "healthy") overallStatus = "degraded";
  }

  // 4. Memory check
  const memUsage = process.memoryUsage();
  const totalMemMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const usedMemMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  checks.memory = {
    used: usedMemMB,
    total: totalMemMB,
    percentage: Math.round((usedMemMB / totalMemMB) * 100),
  };

  // 5. Build response
  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || "unknown",
    checks,
  };

  const statusCode = overallStatus === "unhealthy" ? 503 : 200;
  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  });
}

// HEAD request support (for simple up/down monitoring)
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
