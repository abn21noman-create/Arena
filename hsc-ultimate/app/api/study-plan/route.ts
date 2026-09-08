// ===================================================================
// বর্তমান Study Plan লোড করা
// GET /api/study-plan — সর্বশেষ (active) প্ল্যান ও তার আইটেমসমূহ
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const plan = await prisma.studyPlan.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { orderBy: { date: "asc" } } },
  });

  return NextResponse.json({ plan });
}
