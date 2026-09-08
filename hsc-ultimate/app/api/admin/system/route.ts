import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { getFocusSchedulerHealth } from "@/lib/focus-scheduler-ops";
import { getNativePushRuntimeStatus } from "@/lib/native-push";
import { prisma } from "@/lib/prisma";
import { PROJECT_INVENTORY } from "@/lib/project-constants";
import {
  CURRENT_AGE_ASSURANCE_VERSION,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  getPolicyReadiness,
} from "@/lib/privacy-compliance";
import { enforceRateLimit, getRateLimitRuntimeStatus, makeRateLimitKey } from "@/lib/rate-limit";
import {
  classifyAuditAction,
  deriveSystemOverallStatus,
  getDeploymentReadiness,
} from "@/lib/system-operations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MigrationRow {
  migration_name: string;
  finished_at: Date;
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:system:operations", session.user.id)
  );
  if (limited) return limited;

  try {
    const databaseStarted = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const databaseLatencyMs = Date.now() - databaseStarted;
    const since24h = new Date(Date.now() - 24 * 60 * 60_000);

    const [
      users,
      currentPolicyAcceptances,
      bannedUsers,
      subjects,
      topics,
      coreMcq,
      admissionMcq,
      cq,
      activeFocusSessions,
      activeFocusSchedules,
      nativeDevices,
      failedNativeDeliveries24h,
      auditEvents24h,
      pendingAcademicReports,
      recentAudit,
      migrations,
      settings,
      scheduler,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.policyAcceptance.count({
        where: {
          privacyVersion: CURRENT_PRIVACY_VERSION,
          termsVersion: CURRENT_TERMS_VERSION,
          ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
        },
      }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.subject.count(),
      prisma.topic.count(),
      prisma.question.count(),
      prisma.admissionQuestion.count(),
      prisma.cQQuestion.count(),
      prisma.focusSession.count({ where: { status: "ACTIVE" } }),
      prisma.focusSchedule.count({ where: { status: { in: ["ACTIVE", "PAUSED"] } } }),
      prisma.nativeDevice.count(),
      prisma.nativePushDelivery.count({
        where: { status: "FAILED", createdAt: { gte: since24h } },
      }),
      prisma.auditLog.count({ where: { createdAt: { gte: since24h } } }),
      prisma.academicContentReport.count({ where: { status: "PENDING" } }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          actorName: true,
          action: true,
          targetType: true,
          createdAt: true,
        },
      }),
      prisma.$queryRaw<MigrationRow[]>`
        SELECT migration_name, finished_at
        FROM "_prisma_migrations"
        WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
        ORDER BY finished_at DESC
      `,
      prisma.systemSetting.findUnique({ where: { id: "global" } }),
      getFocusSchedulerHealth(),
    ]);

    const memory = process.memoryUsage();
    const heapUsedMb = Math.round(memory.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.max(1, Math.round(memory.heapTotal / 1024 / 1024));
    const memoryPercentage = Math.round((heapUsedMb / heapTotalMb) * 100);
    const rateLimit = getRateLimitRuntimeStatus();
    const nativePush = getNativePushRuntimeStatus();
    const deployment = getDeploymentReadiness();
    const policyReadiness = getPolicyReadiness();
    const migrationsInSync = migrations.length === PROJECT_INVENTORY.prismaMigrations;
    const overallStatus = deriveSystemOverallStatus({
      databaseUp: true,
      migrationsInSync,
      rateLimitStatus: rateLimit.status,
      schedulerHealthy: scheduler.healthy,
      nativePushStatus: nativePush.status,
      memoryPercentage,
    });
    const featureFlags = (settings?.featureFlags as Record<string, boolean> | null) ?? {};

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        overallStatus,
        runtime: {
          version: process.env.npm_package_version ?? "0.1.0",
          node: process.version,
          environment: process.env.NODE_ENV ?? "unknown",
          uptimeSeconds: Math.floor(process.uptime()),
          memory: {
            heapUsedMb,
            heapTotalMb,
            rssMb: Math.round(memory.rss / 1024 / 1024),
            percentage: memoryPercentage,
          },
        },
        database: {
          status: "up",
          latencyMs: databaseLatencyMs,
          migrations: {
            applied: migrations.length,
            expected: PROJECT_INVENTORY.prismaMigrations,
            inSync: migrationsInSync,
            latest: migrations[0]
              ? {
                  name: migrations[0].migration_name,
                  finishedAt: migrations[0].finished_at,
                }
              : null,
          },
        },
        content: {
          users,
          bannedUsers,
          subjects,
          topics,
          coreMcq,
          admissionMcq,
          cq,
        },
        operations: {
          activeFocusSessions,
          activeFocusSchedules,
          nativeDevices,
          failedNativeDeliveries24h,
          auditEvents24h,
          pendingAcademicReports,
        },
        components: {
          rateLimit,
          scheduler,
          nativePush,
        },
        controls: {
          maintenanceMode: settings?.maintenanceMode ?? false,
          announcementEnabled: settings?.announcementEnabled ?? false,
          featureFlagsConfigured: Object.keys(featureFlags).length,
          disabledFeatureFlags: Object.values(featureFlags).filter((enabled) => !enabled).length,
          updatedAt: settings?.updatedAt ?? null,
        },
        deployment,
        privacyCompliance: {
          ready: policyReadiness.ready,
          versions: policyReadiness.versions,
          currentAcceptances: currentPolicyAcceptances,
          missingOrStaleUsers: Math.max(0, users - currentPolicyAcceptances),
          publicRoutes: ["/privacy", "/terms", "/account-deletion"],
        },
        recentAudit: recentAudit.map((event) => ({
          id: event.id,
          actor: event.actorName || "System",
          action: event.action,
          targetType: event.targetType,
          severity: classifyAuditAction(event.action),
          createdAt: event.createdAt,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "System operations snapshot unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
