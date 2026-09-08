import type { FocusSessionSource, Prisma, SubjectCode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  hasCurrentFocusConsent,
  isValidFocusDuration,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
} from "@/lib/focus-constants";

export {
  FOCUS_CONSENT_VERSION,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
} from "@/lib/focus-constants";

export class FocusError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "FocusError";
  }
}

function assertDuration(durationMinutes: number) {
  if (!isValidFocusDuration(durationMinutes)) {
    throw new FocusError(
      `Focus সময় ${MIN_FOCUS_MINUTES}–${MAX_FOCUS_MINUTES} মিনিট হতে হবে`,
      400,
      "INVALID_DURATION"
    );
  }
}

async function expireEndedSessions(tx: Prisma.TransactionClient, userId: string, now: Date) {
  await tx.focusSession.updateMany({
    where: { userId, status: "ACTIVE", endsAt: { lte: now } },
    data: { status: "COMPLETED", completedAt: now },
  });
}

export async function startFocusSession(input: {
  userId: string;
  initiatedById: string;
  source: FocusSessionSource;
  durationMinutes: number;
  subjectCode?: SubjectCode | null;
  focusLabel?: string | null;
  focusScheduleId?: string | null;
  nativeEnforcementRequested: boolean;
}) {
  assertDuration(input.durationMinutes);

  return prisma.$transaction(async (tx) => {
    const target = await tx.$queryRaw<{ id: string; isBanned: boolean }[]>`
      SELECT id, "isBanned" FROM "users" WHERE id = ${input.userId} FOR UPDATE
    `;
    if (target.length === 0) {
      throw new FocusError("User পাওয়া যায়নি", 404, "USER_NOT_FOUND");
    }
    if (target[0].isBanned) {
      throw new FocusError("Banned user-এর focus session শুরু করা যাবে না", 409, "USER_BANNED");
    }

    const now = new Date();
    await expireEndedSessions(tx, input.userId, now);

    const existing = await tx.focusSession.findFirst({
      where: { userId: input.userId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });
    if (existing) {
      throw new FocusError("এই user-এর একটি focus session ইতিমধ্যে চলছে", 409, "SESSION_ACTIVE");
    }

    if (input.source === "ADMIN") {
      const contract = await tx.focusContract.findUnique({ where: { userId: input.userId } });
      if (!hasCurrentFocusConsent(contract)) {
        throw new FocusError(
          "User-এর current-version Remote Strict Focus consent নেই",
          403,
          "CONSENT_REQUIRED"
        );
      }
      if (input.durationMinutes > contract.maxAdminDurationMinutes) {
        throw new FocusError(
          `User সর্বোচ্চ ${contract.maxAdminDurationMinutes} মিনিট অনুমোদন করেছে`,
          400,
          "CONTRACT_LIMIT"
        );
      }
    }

    const endsAt = new Date(now.getTime() + input.durationMinutes * 60_000);
    const session = await tx.focusSession.create({
      data: {
        userId: input.userId,
        initiatedById: input.initiatedById,
        source: input.source,
        durationMinutes: input.durationMinutes,
        subjectCode: input.subjectCode ?? null,
        focusLabel: input.focusLabel?.trim().slice(0, 120) || null,
        focusScheduleId: input.focusScheduleId ?? null,
        startedAt: now,
        endsAt,
        nativeEnforcementRequested: input.nativeEnforcementRequested,
        lastHeartbeatAt: now,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: input.initiatedById,
        action: "FOCUS_SESSION_STARTED",
        targetType: "FocusSession",
        targetId: session.id,
        metadata: {
          targetUserId: input.userId,
          source: input.source,
          durationMinutes: input.durationMinutes,
          subjectCode: input.subjectCode ?? null,
          focusLabel: input.focusLabel?.trim().slice(0, 120) || null,
          focusScheduleId: input.focusScheduleId ?? null,
          nativeEnforcementRequested: input.nativeEnforcementRequested,
        },
      },
    });

    return session;
  });
}

export async function getFocusState(userId: string) {
  const now = new Date();
  await prisma.focusSession.updateMany({
    where: { userId, status: "ACTIVE", endsAt: { lte: now } },
    data: { status: "COMPLETED", completedAt: now },
  });

  const [contract, activeSession, recentSessions] = await Promise.all([
    prisma.focusContract.findUnique({ where: { userId } }),
    prisma.focusSession.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    }),
    prisma.focusSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        source: true,
        status: true,
        durationMinutes: true,
        subjectCode: true,
        focusLabel: true,
        startedAt: true,
        endsAt: true,
        completedAt: true,
        emergencyExitedAt: true,
        nativeEnforcementActive: true,
      },
    }),
  ]);

  return { contract, activeSession, recentSessions, serverNow: now };
}

export async function heartbeatFocusSession(input: {
  sessionId: string;
  userId: string;
  nativeEnforcementActive: boolean;
}) {
  const now = new Date();
  const session = await prisma.focusSession.findFirst({
    where: { id: input.sessionId, userId: input.userId },
  });
  if (!session) throw new FocusError("Focus session পাওয়া যায়নি", 404, "SESSION_NOT_FOUND");
  if (session.status !== "ACTIVE") return session;
  if (session.endsAt <= now) {
    return prisma.focusSession.update({
      where: { id: session.id },
      data: { status: "COMPLETED", completedAt: now, nativeEnforcementActive: false },
    });
  }
  return prisma.focusSession.update({
    where: { id: session.id },
    data: {
      lastHeartbeatAt: now,
      nativeEnforcementActive: input.nativeEnforcementActive,
    },
  });
}

export async function completeFocusSession(sessionId: string, userId: string) {
  const session = await prisma.focusSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw new FocusError("Focus session পাওয়া যায়নি", 404, "SESSION_NOT_FOUND");
  if (session.status !== "ACTIVE") return session;
  const now = new Date();
  if (session.endsAt > now) {
    throw new FocusError("Timer এখনো শেষ হয়নি", 409, "TIMER_RUNNING");
  }
  return prisma.focusSession.update({
    where: { id: session.id },
    data: { status: "COMPLETED", completedAt: now, nativeEnforcementActive: false },
  });
}

export async function emergencyExitFocusSession(input: {
  sessionId: string;
  userId: string;
  reason: string;
}) {
  const reason = input.reason.trim().slice(0, 500);
  if (reason.length < 3) {
    throw new FocusError("Emergency exit-এর কারণ লিখুন", 400, "REASON_REQUIRED");
  }
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const session = await tx.focusSession.findFirst({
      where: { id: input.sessionId, userId: input.userId },
    });
    if (!session) throw new FocusError("Focus session পাওয়া যায়নি", 404, "SESSION_NOT_FOUND");
    if (session.status !== "ACTIVE") return session;

    const updated = await tx.focusSession.update({
      where: { id: session.id },
      data: {
        status: "EMERGENCY_EXIT",
        emergencyExitedAt: now,
        emergencyReason: reason,
        nativeEnforcementActive: false,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.userId,
        action: "FOCUS_EMERGENCY_EXIT",
        targetType: "FocusSession",
        targetId: session.id,
        metadata: { reason },
      },
    });
    return updated;
  });
}

export async function cancelFocusSessionByAdmin(input: {
  sessionId: string;
  adminId: string;
  reason: string;
}) {
  const reason = input.reason.trim().slice(0, 500) || "Admin cancelled";
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const session = await tx.focusSession.findUnique({ where: { id: input.sessionId } });
    if (!session) throw new FocusError("Focus session পাওয়া যায়নি", 404, "SESSION_NOT_FOUND");
    if (session.status !== "ACTIVE") return session;
    const updated = await tx.focusSession.update({
      where: { id: session.id },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancelReason: reason,
        nativeEnforcementActive: false,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.adminId,
        action: "FOCUS_SESSION_CANCELLED",
        targetType: "FocusSession",
        targetId: session.id,
        metadata: { targetUserId: session.userId, reason },
      },
    });
    return updated;
  });
}

export function toFocusErrorResponse(error: unknown) {
  if (error instanceof FocusError) {
    return { status: error.status, body: { error: error.message, code: error.code } };
  }
  console.error("Focus service error:", error);
  return { status: 500, body: { error: "Focus service-এ সমস্যা হয়েছে" } };
}
