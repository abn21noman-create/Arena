import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";
import { createFocusSchedule, processDueFocusSchedules } from "@/lib/focus-schedule";
import { FOCUS_CONSENT_VERSION, toFocusErrorResponse } from "@/lib/focus";

const schema = z.object({
  userId: z.string().cuid(),
  durationMinutes: z.number().int().min(20).max(120),
  subjectCode: z.enum(VALID_SUBJECT_CODES).nullable().optional(),
  focusLabel: z.string().trim().max(120).nullable().optional(),
  scheduledFor: z.coerce.date(),
  repeat: z.enum(["NONE", "DAILY", "WEEKLY"]),
});

async function adminGuard(request: Request) {
  const denied = await requireAdmin();
  if (denied) return { denied } as const;
  const session = await auth();
  if (!session?.user?.id) return { denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  const limited = await enforceRateLimit(request, "admin", makeRateLimitKey(request, "admin:focus:schedules", session.user.id));
  if (limited) return { denied: limited } as const;
  return { session } as const;
}

export async function GET(request: Request) {
  const guard = await adminGuard(request);
  if ("denied" in guard) return guard.denied;
  await processDueFocusSchedules({ limit: 20 });
  const [contracts, schedules] = await Promise.all([
    prisma.focusContract.findMany({
      where: {
        allowAdminStart: true,
        revokedAt: null,
        consentedAt: { not: null },
        consentVersion: FOCUS_CONSENT_VERSION,
      },
      select: {
        userId: true,
        maxAdminDurationMinutes: true,
        user: { select: { id: true, name: true, email: true, isBanned: true } },
      },
      take: 200,
    }),
    prisma.focusSchedule.findMany({
      where: { status: { in: ["ACTIVE", "PAUSED"] } },
      orderBy: [{ nextRunAt: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: {
        user: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    }),
  ]);
  return NextResponse.json({ contracts, schedules, serverNow: new Date().toISOString() });
}

export async function POST(request: Request) {
  const guard = await adminGuard(request);
  if ("denied" in guard) return guard.denied;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid schedule" }, { status: 400 });
  }
  try {
    const schedule = await createFocusSchedule({
      ...parsed.data,
      adminId: guard.session.user.id,
    });
    await createNotification({
      userId: schedule.userId,
      title: "📅 Strict Focus schedule করা হয়েছে",
      body: `${schedule.durationMinutes} মিনিট · ${schedule.scheduledFor.toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}${schedule.repeat !== "NONE" ? ` · ${schedule.repeat}` : ""}`,
      link: "/focus",
    });
    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    const response = toFocusErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
