// ===================================================================
// Live Exam উত্তর জমা দেওয়া — সার্ভার-সাইড স্কোরিং
// POST /api/live-exam/[sessionId]/submit
// Body: { answers: { questionId: answer } }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitLiveExam } from "@/lib/live-exam";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await req.json().catch(() => ({}));
  const { answers } = body as { answers?: Record<string, string> };

  try {
    const result = await submitLiveExam(sessionId, session.user.id, answers ?? {});
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "উত্তর জমা দেওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
