import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/api-security";
import { prisma } from "@/lib/prisma";
import { buildFocusAnalytics, parseFocusRange } from "@/lib/focus-analytics";

export async function GET(request: Request) {
  const guard = await protectApiRoute(request, "read", "focus:analytics");
  if (!guard.ok) return guard.response;

  const range = parseFocusRange(new URL(request.url).searchParams.get("range"));
  const now = new Date();
  const earliest = new Date(now.getTime() - (range + 1) * 86_400_000);
  const [sessions, contract] = await Promise.all([
    prisma.focusSession.findMany({
      where: { userId: guard.userId, startedAt: { gte: earliest } },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        userId: true,
        source: true,
        status: true,
        durationMinutes: true,
        subjectCode: true,
        focusLabel: true,
        startedAt: true,
        endsAt: true,
        completedAt: true,
        emergencyExitedAt: true,
        cancelledAt: true,
      },
    }),
    prisma.focusContract.findUnique({
      where: { userId: guard.userId },
      select: { shareAnalyticsWithAdmin: true },
    }),
  ]);

  return NextResponse.json({
    analytics: buildFocusAnalytics(sessions, range, now),
    privacy: { shareAnalyticsWithAdmin: contract?.shareAnalyticsWithAdmin ?? false },
    serverNow: now.toISOString(),
  });
}
