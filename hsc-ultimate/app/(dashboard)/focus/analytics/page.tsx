import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFocusAnalytics } from "@/lib/focus-analytics";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { FocusAnalyticsDashboard } from "@/components/focus/focus-analytics-dashboard";

export default async function FocusAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const now = new Date();
  const earliest = new Date(now.getTime() - 8 * 86_400_000);
  const [sessions, contract] = await Promise.all([
    prisma.focusSession.findMany({
      where: { userId: session.user.id, startedAt: { gte: earliest } },
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
      where: { userId: session.user.id },
      select: { shareAnalyticsWithAdmin: true },
    }),
  ]);

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <FocusAnalyticsDashboard
        initialAnalytics={buildFocusAnalytics(sessions, 7, now)}
        initialSharedWithAdmin={contract?.shareAnalyticsWithAdmin ?? false}
      />
    </AuroraBackground>
  );
}
