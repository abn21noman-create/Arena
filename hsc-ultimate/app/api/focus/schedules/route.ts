import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/api-security";
import { prisma } from "@/lib/prisma";
import { processDueFocusSchedules } from "@/lib/focus-schedule";

export async function GET(request: Request) {
  const guard = await protectApiRoute(request, "read", "focus:schedules");
  if (!guard.ok) return guard.response;
  await processDueFocusSchedules({ userId: guard.userId, limit: 5 });
  const schedules = await prisma.focusSchedule.findMany({
    where: { userId: guard.userId },
    orderBy: [{ status: "asc" }, { nextRunAt: "asc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      durationMinutes: true,
      subjectCode: true,
      focusLabel: true,
      repeat: true,
      status: true,
      timeZone: true,
      scheduledFor: true,
      nextRunAt: true,
      lastRunAt: true,
      lastResult: true,
      createdAt: true,
      createdBy: { select: { name: true } },
    },
  });
  return NextResponse.json({ schedules, serverNow: new Date().toISOString() });
}
