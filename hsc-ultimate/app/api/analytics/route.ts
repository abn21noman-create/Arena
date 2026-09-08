// ===================================================================
// Analytics Data API — Analytics Dashboard এর জন্য সব ডেটা একসাথে দেয়
// GET /api/analytics
// -------------------------------------------------------------------
// Performance: আগে ৫টা আলাদা ফাংশন Promise.all এ চলত যেগুলো একই
// quizAttempt/studySession টেবিল বার বার আলাদা query তে আনত (মোট ৫টা
// round-trip শুধু এই দুই টেবিলের জন্য) — getAnalyticsDashboardData()
// একবারে সব ডেটা এনে মেমরিতে হিসাব করে (lib/analytics.ts এ বিস্তারিত)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnalyticsDashboardData } from "@/lib/analytics";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const {
    subjectPerformance,
    progressOverTime,
    timeDistribution,
    weakTopics,
    overallStats,
    activityHeatmap,
    misconceptionPatterns,
    confidenceStats,
  } = await getAnalyticsDashboardData(session.user.id);

  return NextResponse.json({
    subjectPerformance,
    progressOverTime,
    timeDistribution,
    weakTopics,
    overallStats,
    activityHeatmap,
    misconceptionPatterns,
    confidenceStats,
  });
}

