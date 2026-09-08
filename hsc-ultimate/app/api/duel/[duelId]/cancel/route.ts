// ===================================================================
// নিজের তৈরি করা WAITING Duel বাতিল করা
// POST /api/duel/[duelId]/cancel
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cancelDuel } from "@/lib/quiz-duel";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ duelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { duelId } = await params;

  try {
    await cancelDuel(duelId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "বাতিল করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
