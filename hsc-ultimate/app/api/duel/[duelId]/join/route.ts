// ===================================================================
// Duel এ যোগদান (opponent হিসেবে) — WAITING থেকে ACTIVE করে দেয়
// POST /api/duel/[duelId]/join
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinDuel } from "@/lib/quiz-duel";

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
    const duel = await joinDuel(duelId, session.user.id);
    return NextResponse.json({ duel });
  } catch (err) {
    const message = err instanceof Error ? err.message : "যোগ দেওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
