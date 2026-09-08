// ===================================================================
// Reading Room Study Time Leaderboard — Daily/Weekly/Monthly
// GET /api/reading-room/leaderboard?period=daily|weekly|monthly
// -------------------------------------------------------------------
// readingroombd.com এর Study Leaderboard কনসেপ্ট থেকে অনুপ্রাণিত।
// XP Leaderboard (lib/league.ts) এর পাশাপাশি, প্রতিস্থাপন না — এটা
// শুধু Reading Room এ কাটানো প্রকৃত ফোকাস সময়ের হিসাব দেখায়।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStudyTimeLeaderboard, type LeaderboardPeriod } from "@/lib/reading-room";

const VALID_PERIODS = new Set<LeaderboardPeriod>(["daily", "weekly", "monthly"]);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const periodParam = req.nextUrl.searchParams.get("period") ?? "weekly";
  if (!VALID_PERIODS.has(periodParam as LeaderboardPeriod)) {
    return NextResponse.json({ error: "সঠিক period দাও (daily/weekly/monthly)" }, { status: 400 });
  }

  const result = await getStudyTimeLeaderboard(periodParam as LeaderboardPeriod, session.user.id);
  return NextResponse.json(result);
}
