// ===================================================================
// Leaderboard পেজ — দুটো ট্যাব: "সাপ্তাহিক লিগ" (Duolingo-স্টাইল Tier
// ভিত্তিক প্রতিযোগিতা) ও "গ্লোবাল" (সর্বকালের XP অনুযায়ী র‍্যাংকিং)
// -------------------------------------------------------------------
// 🎨 UI/UX রিডিজাইন (ব্যবহারকারীর ফিডব্যাক অনুযায়ী, Duolingo/Reddit/
// Linear থেকে গবেষণা করে অনুপ্রাণিত): আগে প্রতিটা সারি একই রকম প্লেইন
// Card ছিল, top-3 আলাদা করে হাইলাইট হতো না, tier info card ছোট ও
// কম প্রমিনেন্ট ছিল। এখন:
// - Top-3 এর জন্য Duolingo-স্টাইল "পোডিয়াম" (বড় avatar+মেডেল emoji,
//   gold/silver/bronze গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড)
// - বাকি র‍্যাংক একটা পরিষ্কার লিস্টে, Avatar initial + rank number
// - Tier card এখন বড়, tier রঙের গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড, বড় emoji badge
// ===================================================================
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Crown, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LEAGUE_TIER_INFO, LEAGUE_TIER_ORDER, getCurrentWeekStart } from "@/lib/league";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/fade-in";
import { PremiumLeaderboard } from "@/components/leaderboard/premium-leaderboard";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PODIUM_STYLES: Record<number, { bg: string; ring: string; medal: string; height: string }> = {
  1: {
    bg: "from-yellow-400 to-amber-500",
    ring: "ring-yellow-400",
    medal: "🥇",
    height: "sm:pb-6",
  },
  2: {
    bg: "from-slate-300 to-slate-400",
    ring: "ring-slate-300",
    medal: "🥈",
    height: "sm:pb-0",
  },
  3: {
    bg: "from-amber-600 to-amber-700",
    ring: "ring-amber-600",
    medal: "🥉",
    height: "sm:pb-0",
  },
};

function getInitial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

/** একজন ইউজারের র‍্যাংক-লিস্ট আইটেম (৪র্থ স্থান থেকে) — Avatar+নাম+XP */
function RankRow({
  rank,
  name,
  xpLabel,
  streakCount,
  isMe,
}: {
  rank: number;
  name: string;
  xpLabel: string;
  streakCount?: number;
  isMe: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-3.5 flex flex-row items-center gap-3 hover-lift",
        isMe && "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_0_1px_var(--primary)_inset]"
      )}
    >
      <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">
        {rank}
      </span>
      <Avatar className={cn("h-9 w-9 shrink-0 border", isMe && "avatar-glow")}>
        <AvatarFallback className="bg-linear-to-br from-violet-600 to-violet-800 text-xs font-semibold text-white">
          {getInitial(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {name} {isMe && <span className="text-primary text-xs">(তুমি)</span>}
        </p>
      </div>
      {!!streakCount && streakCount > 0 && (
        <div className="flex items-center gap-1 text-orange-700 dark:text-orange-400 text-xs shrink-0">
          <Flame className="h-3.5 w-3.5" />
          {streakCount}
        </div>
      )}
      <div className="text-sm font-bold text-primary shrink-0">{xpLabel}</div>
    </Card>
  );
}

/** টপ-৩ এর জন্য Duolingo-স্টাইল পোডিয়াম কার্ড */
function PodiumCard({
  rank,
  name,
  xpLabel,
  isMe,
}: {
  rank: number;
  name: string;
  xpLabel: string;
  isMe: boolean;
}) {
  const style = PODIUM_STYLES[rank];
  return (
    <div className={cn("relative z-10 flex flex-col items-center", style.height)}>
      <span className="text-2xl mb-1 drop-shadow-sm">{style.medal}</span>
      <Avatar className={cn("avatar-glow h-14 w-14 sm:h-16 sm:w-16 ring-4", style.ring)}>
        <AvatarFallback
          className={cn(
            "bg-linear-to-br text-base sm:text-lg font-bold text-white",
            style.bg
          )}
        >
          {getInitial(name)}
        </AvatarFallback>
      </Avatar>
      <p className={cn("mt-1.5 max-w-[90px] truncate text-xs font-semibold text-center", isMe && "text-primary")}>
        {name}
      </p>
      <p className="text-xs font-bold text-muted-foreground">{xpLabel}</p>
    </div>
  );
}

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, leagueTier: true, weeklyXp: true, weekStartDate: true },
  });
  if (!me) redirect("/login");

  // ইউজারের সপ্তাহ পুরনো হয়ে থাকলে UI-তে stale ০ দেখানোর বদলে বর্তমান সপ্তাহের
  // হিসাব দেখানো হচ্ছে (আসল রিসেট lazy sync API তে হয়, এখানে শুধু প্রদর্শনের জন্য)
  const now = new Date();
  const currentWeekStart = getCurrentWeekStart(now);
  const isStale = me.weekStartDate < currentWeekStart;
  const displayWeeklyXp = isStale ? 0 : me.weeklyXp;
  const displayTier = me.leagueTier;

  const [globalTop, leagueMembers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 50,
      select: { id: true, name: true, xp: true, level: true, streakCount: true },
    }),
    prisma.user.findMany({
      where: { leagueTier: displayTier },
      orderBy: { weeklyXp: "desc" },
      take: 30,
      select: { id: true, name: true, weeklyXp: true, weekStartDate: true, streakCount: true },
    }),
  ]);

  // স্টেল সপ্তাহের ডেটা থাকা মেম্বারদের ০ হিসেবে দেখানো ও নতুন করে সাজানো
  const normalizedLeague = leagueMembers
    .map((u) => ({
      ...u,
      effectiveWeeklyXp: u.weekStartDate < currentWeekStart ? 0 : u.weeklyXp,
    }))
    .sort((a, b) => b.effectiveWeeklyXp - a.effectiveWeeklyXp);

  const myLeagueRank = normalizedLeague.findIndex((u) => u.id === session.user.id) + 1;
  const tierInfo = LEAGUE_TIER_INFO[displayTier];
  const tierIdx = LEAGUE_TIER_ORDER.indexOf(displayTier);
  const isTopTier = tierIdx === LEAGUE_TIER_ORDER.length - 1;

  // এই সপ্তাহ শেষ হতে (রবিবার ০০:০০ পর্যন্ত) কতদিন বাকি
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const daysLeft = Math.max(
    0,
    Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const leagueTop3 = normalizedLeague.slice(0, 3);
  const leagueRest = normalizedLeague.slice(3);

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <FadeIn direction="down" duration={0.4}>
        <div className="flex items-center gap-3 mb-6">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" className="rounded-full shrink-0" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div className="min-w-0">
            <Badge variant="secondary" className="text-xs uppercase tracking-wider mb-1">
              <Crown className="h-3 w-3 mr-1" />
              Leaderboard
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              <span className="text-gradient">লিডারবোর্ড</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              সাপ্তাহিক লিগে প্রতিযোগিতা করো, অথবা গ্লোবাল র‍্যাংকিং দেখো
            </p>
          </div>
        </div>
      </FadeIn>

      <Tabs defaultValue="league" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="league">🏆 সাপ্তাহিক লিগ</TabsTrigger>
          <TabsTrigger value="global">🌍 গ্লোবাল</TabsTrigger>
        </TabsList>

        {/* ================= সাপ্তাহিক লিগ ট্যাব ================= */}
        <TabsContent value="league">
          {/* Tier Hero Card — গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড, বড় emoji badge */}
          <Card
            className="glass-hero glass-hero-card relative overflow-hidden p-5 mb-5 border-none shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${tierInfo.colorHex}, ${tierInfo.colorHex}cc)`,
              // দেখুন lib/league.ts — টিয়ার-ভিত্তিক কনট্রাস্ট-নিরাপদ রং
              color: tierInfo.textHex,
            }}
          >
            {/* প্রিমিয়াম glassmorphism — কার্ডের ভেতরে ভাসমান blur orb
                (established `.glass-hero-orb`, established glassmorphism
                নির্দেশিকা: "গ্লাসের জন্য পেছনে vibrant/রঙিন কিছু দরকার" —
                tier এর নিজস্ব রঙের gradient এর সাথে সাদা orb মিশে
                depth তৈরি করে) */}
            <div
              className="glass-hero-orb h-40 w-40 bg-white/25"
              style={{ top: "-3rem", right: "-2rem" }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="glass-chip flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
                    {tierInfo.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{tierInfo.label} লিগ</p>
                    <p className="text-xs text-white/85">
                      {myLeagueRank > 0 ? `তুমি #${myLeagueRank} নম্বরে আছো` : "এই সপ্তাহে সক্রিয় হও"}
                    </p>
                  </div>
                </div>
                <div className="glass-chip flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0">
                  <Clock className="h-3 w-3" />
                  {daysLeft} দিন বাকি
                </div>
              </div>
              {!isTopTier && tierInfo.promotionXp !== null && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/85 mb-1.5">
                    <span>পরের লিগে প্রমোশন</span>
                    <span className="font-semibold">
                      {displayWeeklyXp} / {tierInfo.promotionXp} XP
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{
                        width: `${Math.min(100, (displayWeeklyXp / tierInfo.promotionXp) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {isTopTier && (
                <p className="text-xs text-white/90 mt-3">
                  👑 তুমি সর্বোচ্চ ডায়মন্ড লিগে আছো! এই সপ্তাহে টপে থাকতে চেষ্টা চালিয়ে যাও।
                </p>
              )}
            </div>
          </Card>

          {/* Top-3 পোডিয়াম */}
          {leagueTop3.length > 0 && (
            <div className="relative mb-5 flex items-end justify-center gap-4 overflow-hidden rounded-2xl border py-6 sm:gap-8">
              <div className="aurora-bg-contained" />
              {/* ভিজ্যুয়াল অর্ডার: ২য়-১ম-৩য় (ক্লাসিক পোডিয়াম লেআউট) */}
              {[leagueTop3[1], leagueTop3[0], leagueTop3[2]].map((u, i) =>
                u ? (
                  <PodiumCard
                    key={u.id}
                    rank={i === 1 ? 1 : i === 0 ? 2 : 3}
                    name={u.name}
                    xpLabel={`${u.effectiveWeeklyXp} XP`}
                    isMe={u.id === session.user.id}
                  />
                ) : null
              )}
            </div>
          )}

          <StaggerGroup className="space-y-2" staggerDelay={0.03}>
            {leagueRest.map((u, idx) => (
              <StaggerItem key={u.id} direction="left">
                <RankRow
                  rank={idx + 4}
                  name={u.name}
                  xpLabel={`${u.effectiveWeeklyXp} XP`}
                  streakCount={u.streakCount}
                  isMe={u.id === session.user.id}
                />
              </StaggerItem>
            ))}
            {normalizedLeague.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                এই লিগে এখনো কেউ সক্রিয় হয়নি — প্রথম হও!
              </p>
            )}
          </StaggerGroup>
        </TabsContent>

        {/* ================= গ্লোবাল ট্যাব (আগের ফিচার) ================= */}
        <TabsContent value="global">
          <PremiumLeaderboard users={globalTop} />
        </TabsContent>
      </Tabs>
      </div>
    </AuroraBackground>
  );
}
