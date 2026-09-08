import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";
import { buildFocusAnalytics, parseFocusRange } from "@/lib/focus-analytics";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:focus:analytics", session.user.id)
  );
  if (limited) return limited;

  const range = parseFocusRange(new URL(request.url).searchParams.get("range"));
  const now = new Date();
  const earliest = new Date(now.getTime() - (range + 1) * 86_400_000);
  const [sharedContracts, totalContractCount] = await Promise.all([
    prisma.focusContract.findMany({
      where: { shareAnalyticsWithAdmin: true },
      select: {
        userId: true,
        user: { select: { id: true, name: true, email: true, isBanned: true } },
      },
      take: 500,
    }),
    prisma.focusContract.count(),
  ]);
  const userIds = sharedContracts.map((contract) => contract.userId);
  const sessions = userIds.length > 0
    ? await prisma.focusSession.findMany({
        where: { userId: { in: userIds }, startedAt: { gte: earliest } },
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
      })
    : [];

  const analytics = buildFocusAnalytics(sessions, range, now);
  const users = sharedContracts
    .map((contract) => {
      const userSessions = sessions.filter((focus) => focus.userId === contract.userId);
      const summary = buildFocusAnalytics(userSessions, range, now);
      return {
        id: contract.user.id,
        name: contract.user.name,
        email: contract.user.email,
        isBanned: contract.user.isBanned,
        totalMinutes: summary.totalMinutes,
        sessionCount: summary.sessionCount,
        completionRate: summary.completionRate,
        emergencyExitCount: summary.emergencyExitCount,
        currentStreak: summary.currentStreak,
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  return NextResponse.json({
    analytics,
    users,
    privacy: {
      sharedUserCount: sharedContracts.length,
      totalContractCount,
      hiddenUserCount: Math.max(0, totalContractCount - sharedContracts.length),
    },
    serverNow: now.toISOString(),
  });
}
