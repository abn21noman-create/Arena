// ===================================================================
// Predicted GPA API — ইউজারের এখন পর্যন্ত পারফরম্যান্স থেকে সম্ভাব্য GPA
// GET /api/analytics/predicted-gpa
// -------------------------------------------------------------------
// রেসপন্সে `targetGpa` (Personal Goal Setting ফিচার) যোগ করা হয়েছে
// যাতে ফ্রন্টএন্ডে target-vs-actual comparison দেখানো যায় — আলাদা API
// কল লাগে না, একই request এ দুটো ডেটা একসাথে আসে।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPredictedGpaSummary } from "@/lib/gpa-predictor";
import { getGpaRemark } from "@/lib/gpa";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const [summary, user] = await Promise.all([
    getPredictedGpaSummary(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { targetGpa: true },
    }),
  ]);

  const remark = summary.gpaResult
    ? getGpaRemark(summary.gpaResult.gpa, summary.gpaResult.isPass)
    : null;

  return NextResponse.json({ ...summary, remark, targetGpa: user?.targetGpa ?? null });
}
