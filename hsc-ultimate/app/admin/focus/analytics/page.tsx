import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFocusAnalytics } from "@/lib/focus-analytics";
import {
  AdminFocusAnalyticsDashboard,
  type AdminFocusUserRow,
} from "@/components/admin/focus-analytics-dashboard";

export default async function AdminFocusAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const now = new Date();
  const earliest = new Date(now.getTime() - 8 * 86_400_000);
  const [contracts, totalContractCount] = await Promise.all([
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
  const userIds = contracts.map((contract) => contract.userId);
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

  const analytics = buildFocusAnalytics(sessions, 7, now);
  const users: AdminFocusUserRow[] = contracts
    .map((contract) => {
      const summary = buildFocusAnalytics(
        sessions.filter((focus) => focus.userId === contract.userId),
        7,
        now
      );
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

  return (
    <AdminFocusAnalyticsDashboard
      initialAnalytics={analytics}
      initialUsers={users}
      initialPrivacy={{
        sharedUserCount: contracts.length,
        totalContractCount,
        hiddenUserCount: Math.max(0, totalContractCount - contracts.length),
      }}
    />
  );
}
