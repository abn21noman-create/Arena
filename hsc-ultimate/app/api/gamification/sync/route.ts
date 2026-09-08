// ===================================================================
// Gamification Sync API — Dashboard লোড হওয়ার সময় কল হয়
// -------------------------------------------------------------------
// এটা তিনটা কাজ করে:
// 1. Daily streak আপডেট করে (আজ প্রথমবার একটিভ হলে)
// 2. XP অনুযায়ী Level সিঙ্ক করে
// 3. নতুন কোনো Badge পাওয়ার যোগ্য কিনা চেক করে award করে
//
// POST /api/gamification/sync
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateStreak } from "@/lib/streak";
import { syncUserLevel } from "@/lib/gamification";
import { checkAndAwardBadges } from "@/lib/gamification";
import { processWeeklyLeagueReset } from "@/lib/league";
import { runStudyPlanAgent } from "@/lib/study-plan-agent";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const userId = session.user.id;

  const streakResult = await updateStreak(userId);
  await syncUserLevel(userId);
  const leagueResult = await processWeeklyLeagueReset(userId);
  const newBadges = await checkAndAwardBadges(userId);
  // Study Plan Agent — lazy-check (cron ছাড়া), silent-safe (ব্যর্থ হলেও
  // বাকি sync flow প্রভাবিত হয় না, ফাংশনের ভেতরেই try/catch করা আছে)
  await runStudyPlanAgent(userId);

  return NextResponse.json({
    streak: streakResult,
    league: leagueResult,
    newBadges: newBadges.map((b) => ({
      code: b.code,
      name: b.name,
      iconEmoji: b.iconEmoji,
    })),
  });
}
