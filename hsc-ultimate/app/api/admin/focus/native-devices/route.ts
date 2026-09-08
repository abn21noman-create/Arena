import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { getNativePushRuntimeStatus } from "@/lib/native-push";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

function tokenFingerprint(token: string) {
  return createHash("sha256").update(token).digest("hex").slice(0, 12);
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
    makeRateLimitKey(request, "admin:focus:native-devices", session.user.id)
  );
  if (limited) return limited;

  const staleBefore = new Date(Date.now() - 90 * 24 * 60 * 60_000);
  const [devices, total, capable, disabled, stale] = await Promise.all([
    prisma.nativeDevice.findMany({
      orderBy: { lastSeenAt: "desc" },
      take: 100,
      select: {
        id: true,
        token: true,
        platform: true,
        appVersion: true,
        deviceModel: true,
        remoteFocusCapable: true,
        accessibilityEnabled: true,
        lastSeenAt: true,
        lastPushAttemptAt: true,
        lastPushSuccessAt: true,
        lastPushFailureAt: true,
        lastPushErrorCode: true,
        lastReceiptAt: true,
        lastReceiptStatus: true,
        disabledAt: true,
        disabledReason: true,
        user: { select: { id: true, name: true, email: true } },
        pushDeliveries: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            commandId: true,
            sessionId: true,
            type: true,
            status: true,
            issuedAt: true,
            sentAt: true,
            receiptAt: true,
            errorCode: true,
          },
        },
      },
    }),
    prisma.nativeDevice.count(),
    prisma.nativeDevice.count({
      where: {
        remoteFocusCapable: true,
        accessibilityEnabled: true,
        disabledAt: null,
        lastSeenAt: { gte: staleBefore },
      },
    }),
    prisma.nativeDevice.count({ where: { disabledAt: { not: null } } }),
    prisma.nativeDevice.count({ where: { lastSeenAt: { lt: staleBefore } } }),
  ]);

  return NextResponse.json(
    {
      runtime: getNativePushRuntimeStatus(),
      summary: { total, capable, disabled, stale },
      devices: devices.map(({ token, pushDeliveries, ...device }) => ({
        ...device,
        tokenFingerprint: tokenFingerprint(token),
        latestDelivery: pushDeliveries[0] ?? null,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
