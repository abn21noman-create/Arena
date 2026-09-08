// ===================================================================
// একটা CQ Attempt এর বিস্তারিত ফলাফল দেখার API
// GET /api/cq/attempt/[attemptId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { attemptId } = await params;

  const attempt = await prisma.cQAttempt.findUnique({
    where: { id: attemptId },
    include: { cqQuestion: true },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ attempt });
}
