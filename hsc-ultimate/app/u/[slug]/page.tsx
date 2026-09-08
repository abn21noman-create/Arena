// ===================================================================
// Public Profile পেজ — /u/[slug]
// -------------------------------------------------------------------
// সম্পূর্ণ পাবলিক পেজ (কোনো login লাগে না), যে কেউ শেয়ারযোগ্য লিংক
// থেকে দেখতে পারবে। ইউজার নিজে চালু না করলে বা slug না থাকলে notFound()।
// Server Component — সরাসরি DB থেকে fetch করা হয় (client fetch না, তাই
// শেয়ার লিংক প্রথম লোডেই সম্পূর্ণ SEO-friendly)।
// ===================================================================
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfileBySlug } from "@/lib/public-profile";
import { getLevelProgress } from "@/lib/gamification";
import { LEAGUE_TIER_INFO } from "@/lib/league";
import { Card } from "@/components/ui/card";
import { Flame, Trophy, Sparkles, GraduationCap } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    return { title: "প্রোফাইল পাওয়া যায়নি | HSC Ultimate" };
  }

  return {
    title: `${profile.name} এর প্রোফাইল | HSC Ultimate`,
    description: `${profile.name} — Level ${profile.level}, ${profile.userBadges.length}টা ব্যাজ, ${profile.streakCount} দিনের স্ট্রিক। HSC Ultimate এ দেখো।`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) notFound();

  const levelProgress = getLevelProgress(profile.xp);
  const tierInfo = LEAGUE_TIER_INFO[profile.leagueTier];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background px-4 py-10 sm:py-16">
      <div className="max-w-xl mx-auto w-full">
        {/* Header Card — glassmorphism (established Settings profile header
            এর একই প্যাটার্ন, পাবলিক শেয়ারযোগ্য প্রোফাইলের জন্যও একইভাবে
            প্রিমিয়াম লুক প্রয়োজন) */}
        <Card className="glass-hero glass-hero-card relative overflow-hidden bg-linear-to-br from-violet-700 via-fuchsia-700 to-fuchsia-800 p-6 sm:p-8 text-center mb-6 text-white border-none">
          <div
            aria-hidden
            className="glass-hero-orb h-40 w-40 bg-violet-300/25"
            style={{ top: "-3rem", left: "-2rem" }}
          />
          <div
            aria-hidden
            className="glass-hero-orb h-28 w-28 bg-fuchsia-200/20"
            style={{ bottom: "-1.5rem", right: "10%" }}
          />
          <div className="relative z-10">
            <div className="avatar-glow mx-auto mb-4 h-20 w-20 rounded-full bg-white/15 flex items-center justify-center text-3xl font-bold text-white">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="text-xl font-bold mb-1">{profile.name}</h1>
            <p className="text-sm opacity-90 flex items-center justify-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              HSC {profile.hscBatch} ব্যাচ {profile.board && `• ${profile.board} বোর্ড`}
            </p>
            <span className="glass-chip mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
              {tierInfo.emoji} {tierInfo.label} লিগ
            </span>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <Sparkles className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <p className="text-lg font-bold">{levelProgress.level}</p>
            <p className="text-xs text-muted-foreground">লেভেল</p>
          </Card>
          <Card className="p-4 text-center">
            <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold">{profile.streakCount}</p>
            <p className="text-xs text-muted-foreground">দিনের স্ট্রিক</p>
          </Card>
          <Card className="p-4 text-center">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold">{profile.userBadges.length}</p>
            <p className="text-xs text-muted-foreground">ব্যাজ</p>
          </Card>
        </div>

        {/* XP + Longest Streak */}
        <Card className="p-5 mb-6 flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">মোট XP</p>
            <p className="font-bold">{profile.xp.toLocaleString("bn-BD")}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs mb-0.5">সর্বোচ্চ স্ট্রিক</p>
            <p className="font-bold">{profile.longestStreak} দিন</p>
          </div>
        </Card>

        {/* Badges */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-primary" />
            অর্জিত ব্যাজ ({profile.userBadges.length})
          </h2>
          {profile.userBadges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              এখনো কোনো ব্যাজ অর্জন করেনি
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {profile.userBadges.map((ub) => (
                <div
                  key={ub.badge.code}
                  title={ub.badge.description}
                  className="flex flex-col items-center text-center gap-1 rounded-lg border p-3"
                >
                  <span className="text-2xl">{ub.badge.iconEmoji}</span>
                  <span className="text-xs font-medium leading-tight">
                    {ub.badge.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          তৈরি করেছে{" "}
          <span className="font-semibold text-foreground">HSC Ultimate</span> —
          বাংলাদেশী HSC শিক্ষার্থীদের প্রস্তুতি প্ল্যাটফর্ম
        </p>
      </div>
    </div>
  );
}
