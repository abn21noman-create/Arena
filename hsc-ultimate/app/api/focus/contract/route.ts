import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protectApiRoute } from "@/lib/api-security";
import { sendNativeFocusStopCommand } from "@/lib/native-push";
import {
  FOCUS_CONSENT_VERSION,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
} from "@/lib/focus";

const contractSchema = z.object({
  allowAdminStart: z.boolean(),
  maxAdminDurationMinutes: z.number().int().min(MIN_FOCUS_MINUTES).max(MAX_FOCUS_MINUTES),
  nativeEnforcementEnabled: z.boolean().default(false),
  shareAnalyticsWithAdmin: z.boolean().default(false),
  confirmed: z.boolean(),
});

export async function GET(request: Request) {
  const guard = await protectApiRoute(request, "read", "focus:contract");
  if (!guard.ok) return guard.response;

  const contract = await prisma.focusContract.findUnique({ where: { userId: guard.userId } });
  return NextResponse.json({
    contract,
    limits: { minMinutes: MIN_FOCUS_MINUTES, maxMinutes: MAX_FOCUS_MINUTES },
    consentVersion: FOCUS_CONSENT_VERSION,
  });
}

export async function PUT(request: Request) {
  const guard = await protectApiRoute(request, "update", "focus:contract");
  if (!guard.ok) return guard.response;

  const parsed = contractSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  if (data.allowAdminStart && !data.confirmed) {
    return NextResponse.json(
      { error: "Remote Strict Focus চালু করতে স্পষ্ট সম্মতি প্রয়োজন" },
      { status: 400 }
    );
  }

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const activeAdminSessions = data.allowAdminStart
      ? []
      : await tx.focusSession.findMany({
          where: { userId: guard.userId, status: "ACTIVE", source: "ADMIN" },
          select: { id: true },
        });
    const saved = await tx.focusContract.upsert({
      where: { userId: guard.userId },
      create: {
        userId: guard.userId,
        allowAdminStart: data.allowAdminStart,
        maxAdminDurationMinutes: data.maxAdminDurationMinutes,
        nativeEnforcementEnabled: data.nativeEnforcementEnabled,
        shareAnalyticsWithAdmin: data.shareAnalyticsWithAdmin,
        consentVersion: FOCUS_CONSENT_VERSION,
        consentedAt: data.allowAdminStart ? now : null,
        revokedAt: data.allowAdminStart ? null : now,
      },
      update: {
        allowAdminStart: data.allowAdminStart,
        maxAdminDurationMinutes: data.maxAdminDurationMinutes,
        nativeEnforcementEnabled: data.nativeEnforcementEnabled,
        shareAnalyticsWithAdmin: data.shareAnalyticsWithAdmin,
        consentVersion: FOCUS_CONSENT_VERSION,
        consentedAt: data.allowAdminStart ? now : undefined,
        revokedAt: data.allowAdminStart ? null : now,
      },
    });
    if (!data.allowAdminStart) {
      await tx.nativeDevice.updateMany({
        where: { userId: guard.userId },
        data: { remoteFocusCapable: false },
      });
      await tx.focusSchedule.updateMany({
        where: { userId: guard.userId, status: { in: ["ACTIVE", "PAUSED"] } },
        data: {
          status: "CANCELLED",
          nextRunAt: null,
          cancelledAt: now,
          cancelReason: "User revoked Focus Contract",
          lastResult: "CONSENT_REVOKED",
        },
      });
      await tx.focusSession.updateMany({
        where: { userId: guard.userId, status: "ACTIVE", source: "ADMIN" },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancelReason: "User revoked Focus Contract",
          nativeEnforcementActive: false,
        },
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: guard.userId,
        action: data.allowAdminStart ? "FOCUS_CONTRACT_ENABLED" : "FOCUS_CONTRACT_REVOKED",
        targetType: "FocusContract",
        targetId: saved.id,
        metadata: {
          maxAdminDurationMinutes: data.maxAdminDurationMinutes,
          nativeEnforcementEnabled: data.nativeEnforcementEnabled,
          shareAnalyticsWithAdmin: data.shareAnalyticsWithAdmin,
          consentVersion: FOCUS_CONSENT_VERSION,
        },
      },
    });
    return { contract: saved, cancelledSessionIds: activeAdminSessions.map((session) => session.id) };
  });

  if (!data.allowAdminStart && result.cancelledSessionIds.length > 0) {
    await Promise.all(
      result.cancelledSessionIds.map((sessionId) =>
        sendNativeFocusStopCommand({
          userId: guard.userId,
          sessionId,
          reason: "User revoked Focus Contract",
        })
      )
    );
  }

  return NextResponse.json({ contract: result.contract });
}
