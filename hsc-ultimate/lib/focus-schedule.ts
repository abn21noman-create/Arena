import type { FocusScheduleRepeat, SubjectCode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FocusError, startFocusSession } from "@/lib/focus";
import { hasCurrentFocusConsent } from "@/lib/focus-constants";
import { createNotification } from "@/lib/notifications";
import { sendNativeFocusCommand } from "@/lib/native-push";

export const MAX_FOCUS_SCHEDULE_LOOKAHEAD_DAYS = 365;

export function getNextScheduleRun(
  currentRun: Date,
  repeat: FocusScheduleRepeat,
  now = new Date()
): Date | null {
  if (repeat === "NONE") return null;
  const step = repeat === "DAILY" ? 86_400_000 : 7 * 86_400_000;
  let next = new Date(currentRun.getTime() + step);
  while (next <= now) next = new Date(next.getTime() + step);
  return next;
}

export async function createFocusSchedule(input: {
  userId: string;
  adminId: string;
  durationMinutes: number;
  subjectCode?: SubjectCode | null;
  focusLabel?: string | null;
  scheduledFor: Date;
  repeat: FocusScheduleRepeat;
}) {
  const now = new Date();
  if (!Number.isSafeInteger(input.durationMinutes) || input.durationMinutes < 20 || input.durationMinutes > 120) {
    throw new FocusError("Schedule duration ২০–১২০ মিনিট হতে হবে", 400, "INVALID_DURATION");
  }
  if (!Number.isFinite(input.scheduledFor.getTime()) || input.scheduledFor.getTime() < now.getTime() + 30_000) {
    throw new FocusError("Schedule time ভবিষ্যতের হতে হবে", 400, "INVALID_SCHEDULE_TIME");
  }
  if (input.scheduledFor.getTime() > now.getTime() + MAX_FOCUS_SCHEDULE_LOOKAHEAD_DAYS * 86_400_000) {
    throw new FocusError("সর্বোচ্চ ১ বছর আগে schedule করা যাবে", 400, "SCHEDULE_TOO_FAR");
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${input.userId} FOR UPDATE`;
    const contract = await tx.focusContract.findUnique({ where: { userId: input.userId } });
    if (!hasCurrentFocusConsent(contract)) {
      throw new FocusError("User-এর current-version Admin Focus consent নেই", 403, "CONSENT_REQUIRED");
    }
    if (input.durationMinutes > contract.maxAdminDurationMinutes) {
      throw new FocusError(`User সর্বোচ্চ ${contract.maxAdminDurationMinutes} মিনিট অনুমোদন করেছে`, 400, "CONTRACT_LIMIT");
    }

    const schedule = await tx.focusSchedule.create({
      data: {
        userId: input.userId,
        createdById: input.adminId,
        durationMinutes: input.durationMinutes,
        subjectCode: input.subjectCode ?? null,
        focusLabel: input.focusLabel?.trim().slice(0, 120) || null,
        scheduledFor: input.scheduledFor,
        nextRunAt: input.scheduledFor,
        repeat: input.repeat,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.adminId,
        action: "FOCUS_SCHEDULE_CREATED",
        targetType: "FocusSchedule",
        targetId: schedule.id,
        metadata: {
          targetUserId: input.userId,
          scheduledFor: input.scheduledFor.toISOString(),
          repeat: input.repeat,
          durationMinutes: input.durationMinutes,
          subjectCode: input.subjectCode ?? null,
        },
      },
    });
    return schedule;
  });
}

export async function cancelFocusSchedule(input: {
  scheduleId: string;
  actorId: string;
  actorIsAdmin: boolean;
  reason: string;
}) {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const schedule = await tx.focusSchedule.findUnique({ where: { id: input.scheduleId } });
    if (!schedule) throw new FocusError("Schedule পাওয়া যায়নি", 404, "SCHEDULE_NOT_FOUND");
    if (!input.actorIsAdmin && schedule.userId !== input.actorId) {
      throw new FocusError("এই schedule cancel করার অনুমতি নেই", 403, "FORBIDDEN");
    }
    if (schedule.status === "CANCELLED" || schedule.status === "COMPLETED") return schedule;
    const updated = await tx.focusSchedule.update({
      where: { id: schedule.id },
      data: {
        status: "CANCELLED",
        nextRunAt: null,
        cancelledAt: now,
        cancelReason: input.reason.trim().slice(0, 500) || "Cancelled",
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.actorId,
        action: "FOCUS_SCHEDULE_CANCELLED",
        targetType: "FocusSchedule",
        targetId: schedule.id,
        metadata: { targetUserId: schedule.userId, reason: input.reason.slice(0, 500) },
      },
    });
    return updated;
  });
}

export async function updateFocusScheduleStatus(input: {
  scheduleId: string;
  adminId: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  reason?: string;
}) {
  if (input.status === "CANCELLED") {
    return cancelFocusSchedule({
      scheduleId: input.scheduleId,
      actorId: input.adminId,
      actorIsAdmin: true,
      reason: input.reason ?? "Admin cancelled",
    });
  }
  const schedule = await prisma.focusSchedule.findUnique({ where: { id: input.scheduleId } });
  if (!schedule) throw new FocusError("Schedule পাওয়া যায়নি", 404, "SCHEDULE_NOT_FOUND");
  if (schedule.status === "COMPLETED" || schedule.status === "CANCELLED") {
    throw new FocusError("শেষ হওয়া schedule পরিবর্তন করা যাবে না", 409, "SCHEDULE_FINAL");
  }
  return prisma.focusSchedule.update({
    where: { id: schedule.id },
    data: {
      status: input.status,
      nextRunAt: input.status === "ACTIVE"
        ? getNextScheduleRun(schedule.lastRunAt ?? schedule.scheduledFor, schedule.repeat, new Date()) ?? schedule.scheduledFor
        : null,
      reminderSentAt: null,
      lastResult: input.status === "PAUSED" ? "PAUSED_BY_ADMIN" : "RESUMED_BY_ADMIN",
    },
  });
}

export interface FocusScheduleProcessResult {
  scheduleId: string;
  result: string;
  sessionId?: string;
}

export interface FocusScheduleProcessSummary {
  remindersSent: number;
  dueCandidates: number;
  results: FocusScheduleProcessResult[];
}

export async function processDueFocusSchedulesDetailed(
  options: { userId?: string; limit?: number } = {}
): Promise<FocusScheduleProcessSummary> {
  const now = new Date();
  const reminderCutoff = new Date(now.getTime() + 5 * 60_000);
  const reminders = await prisma.focusSchedule.findMany({
    where: {
      status: "ACTIVE",
      nextRunAt: { gt: now, lte: reminderCutoff },
      reminderSentAt: null,
      ...(options.userId ? { userId: options.userId } : {}),
    },
    take: Math.min(50, Math.max(1, options.limit ?? 20)),
    select: { id: true, userId: true, durationMinutes: true, focusLabel: true, nextRunAt: true },
  });
  let remindersSent = 0;
  for (const reminder of reminders) {
    const claimed = await prisma.focusSchedule.updateMany({
      where: { id: reminder.id, status: "ACTIVE", reminderSentAt: null },
      data: { reminderSentAt: now },
    });
    if (claimed.count === 1) {
      await createNotification({
        userId: reminder.userId,
        title: "⏳ Strict Focus ৫ মিনিটের মধ্যে শুরু হবে",
        body: `${reminder.durationMinutes} মিনিট${reminder.focusLabel ? ` · ${reminder.focusLabel}` : ""}`,
        link: "/focus",
      });
      remindersSent += 1;
    }
  }

  const due = await prisma.focusSchedule.findMany({
    where: {
      status: "ACTIVE",
      nextRunAt: { lte: now },
      ...(options.userId ? { userId: options.userId } : {}),
    },
    orderBy: { nextRunAt: "asc" },
    take: Math.min(50, Math.max(1, options.limit ?? 20)),
    select: { id: true },
  });

  const results: FocusScheduleProcessResult[] = [];
  for (const candidate of due) {
    const claimed = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "focus_schedules" WHERE id = ${candidate.id} FOR UPDATE`;
      const schedule = await tx.focusSchedule.findUnique({
        where: { id: candidate.id },
        include: { user: { select: { focusContract: true, isBanned: true } } },
      });
      if (!schedule || schedule.status !== "ACTIVE" || !schedule.nextRunAt || schedule.nextRunAt > now) return null;
      const consent = hasCurrentFocusConsent(schedule.user.focusContract);
      if (!consent || schedule.user.isBanned) {
        await tx.focusSchedule.update({
          where: { id: schedule.id },
          data: {
            status: "CANCELLED",
            nextRunAt: null,
            cancelledAt: now,
            cancelReason: !consent ? "Focus Contract revoked" : "User is banned",
            lastResult: !consent ? "CONSENT_REVOKED" : "USER_BANNED",
          },
        });
        return null;
      }
      const nextRunAt = getNextScheduleRun(schedule.nextRunAt, schedule.repeat, now);
      await tx.focusSchedule.update({
        where: { id: schedule.id },
        data: {
          status: nextRunAt ? "ACTIVE" : "COMPLETED",
          nextRunAt,
          lastRunAt: now,
          reminderSentAt: null,
          lastResult: "CLAIMED",
        },
      });
      return schedule;
    });
    if (!claimed) continue;

    try {
      const focusSession = await startFocusSession({
        userId: claimed.userId,
        initiatedById: claimed.createdById ?? claimed.userId,
        source: "ADMIN",
        durationMinutes: claimed.durationMinutes,
        subjectCode: claimed.subjectCode,
        focusLabel: claimed.focusLabel,
        focusScheduleId: claimed.id,
        nativeEnforcementRequested: true,
      });
      await prisma.focusSchedule.update({
        where: { id: claimed.id },
        data: { lastResult: "STARTED" },
      });
      await Promise.all([
        createNotification({
          userId: claimed.userId,
          title: "⏰ Scheduled Strict Focus শুরু হয়েছে",
          body: `${claimed.durationMinutes} মিনিট${claimed.focusLabel ? ` · ${claimed.focusLabel}` : ""}`,
          link: "/focus",
        }),
        sendNativeFocusCommand({
          userId: claimed.userId,
          sessionId: focusSession.id,
          endsAt: focusSession.endsAt,
          durationMinutes: focusSession.durationMinutes,
        }),
      ]);
      results.push({ scheduleId: claimed.id, result: "STARTED", sessionId: focusSession.id });
    } catch (error) {
      const result = error instanceof FocusError ? error.code : "FAILED";
      await prisma.focusSchedule.update({ where: { id: claimed.id }, data: { lastResult: result } });
      results.push({ scheduleId: claimed.id, result });
    }
  }
  return {
    remindersSent,
    dueCandidates: due.length,
    results,
  };
}

/** Backward-compatible lazy processor used by user/admin polling paths. */
export async function processDueFocusSchedules(
  options: { userId?: string; limit?: number } = {}
): Promise<FocusScheduleProcessResult[]> {
  return (await processDueFocusSchedulesDetailed(options)).results;
}
