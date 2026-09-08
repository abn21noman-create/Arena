// ===================================================================
// Exam-Day Retention Forecast API
// GET /api/analytics/retention-forecast
// -------------------------------------------------------------------
// FSRS ডেটা থেকে exam date পর্যন্ত predicted flashcard retention %
// (docs/FEATURE_RESEARCH_V4.md এ বিস্তারিত গবেষণা+ডিজাইন)
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRetentionForecast } from "@/lib/retention-forecast";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  try {
    const forecast = await getRetentionForecast(session.user.id);
    return NextResponse.json(forecast);
  } catch (err) {
    console.error("Retention Forecast Error:", err);
    return NextResponse.json(
      { error: "রিটেনশন ফোরকাস্ট হিসাব করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
