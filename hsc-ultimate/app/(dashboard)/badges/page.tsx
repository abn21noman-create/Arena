// ===================================================================
// HSC ULTIMATE — Premium Badges Gallery 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/ui/glass-card";
import { CountUp } from "@/components/ui/count-up";
import { PageShell } from "@/components/ui/page-shell";
import { Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BadgesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [allBadges, userBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      select: { badgeId: true, earnedAt: true },
    }),
  ]);

  const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.earnedAt]));
  const completionPct = Math.round((userBadges.length / allBadges.length) * 100);

  return (
    <PageShell
      title="Badges"
      titleBn="গ্যালারি"
      subtitle={`${userBadges.length} / ${allBadges.length} টি ব্যাজ অর্জিত`}
      iconKey="Trophy"
      iconGradient="from-amber-500 via-yellow-500 to-orange-500"
      badge="Achievements"
    >
      {/* Progress Hero */}
      <GlassCard className="p-5 sm:p-6 relative overflow-hidden" variant="gradient-border" glow>
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-gradient-to-br from-amber-500/30 via-yellow-500/30 to-orange-500/30 blur-3xl"
        />
        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 shrink-0">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-baseline gap-2 justify-center sm:justify-start mb-1">
              <span className="text-3xl sm:text-4xl font-bold text-gradient">
                <CountUp end={userBadges.length} duration={1500} />
              </span>
              <span className="text-xl sm:text-2xl text-muted-foreground">
                / {allBadges.length}
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-3">
              ব্যাজ অর্জনের পথে {completionPct}% সম্পন্ন
            </p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden max-w-md mx-auto sm:mx-0">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Badges Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {allBadges.map((badge) => {
          const earnedAt = earnedMap.get(badge.id);
          const isEarned = !!earnedAt;

          return (
            <GlassCard
              key={badge.id}
              className={cn(
                "p-5 text-center transition-all",
                !isEarned && "opacity-50 grayscale"
              )}
              variant={isEarned ? "gradient-border" : "subtle"}
              interactive={isEarned}
            >
              <div className="text-5xl mb-3 relative inline-block">
                {isEarned ? (
                  <span className="drop-shadow-md">{badge.iconEmoji}</span>
                ) : (
                  <span className="grayscale opacity-60">{badge.iconEmoji}</span>
                )}
                {!isEarned && (
                  <Lock className="h-4 w-4 absolute -bottom-1 -right-1 text-muted-foreground bg-background rounded-full p-0.5 border" />
                )}
              </div>
              <h3 className={cn("font-semibold text-sm mb-1", isEarned && "text-gradient")}>
                {badge.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{badge.description}</p>
              {isEarned ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  ✓ {new Date(earnedAt!).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })} অর্জিত
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">{badge.criteria}</p>
              )}
            </GlassCard>
          );
        })}
      </div>
    </PageShell>
  );
}
