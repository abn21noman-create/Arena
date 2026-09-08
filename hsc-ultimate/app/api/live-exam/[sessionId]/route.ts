// ===================================================================
// Live Exam সেশন বিস্তারিত (রেজাল্ট পেজে ব্যবহার হয়)
// GET /api/live-exam/[sessionId]
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { sessionId } = await params;
  const liveExam = await prisma.liveExamSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  });

  if (!liveExam) {
    return NextResponse.json({ error: "সেশন পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ liveExam });
}
