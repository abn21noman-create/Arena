// ===================================================================
// সাপ্তাহিক রিক্যাপ (Weekly Study Recap) API
// GET /api/analytics/weekly-recap
// -------------------------------------------------------------------
// docs/FEATURE_RESEARCH_V5.md এ বিস্তারিত গবেষণা+ডিজাইন — Spotify
// Wrapped/ChatGPT Year-in-Review স্টাইল থেকে অনুপ্রাণিত, HSC Ultimate
// এর জন্য সাপ্তাহিক সংস্করণ। সম্পূর্ণ schema-free।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWeeklyRecap } from "@/lib/weekly-recap";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  try {
    const recap = await getWeeklyRecap(session.user.id);
    if (!recap) {
      return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }
    return NextResponse.json(recap);
  } catch (err) {
    console.error("Weekly Recap Error:", err);
    return NextResponse.json(
      { error: "সাপ্তাহিক রিক্যাপ তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
