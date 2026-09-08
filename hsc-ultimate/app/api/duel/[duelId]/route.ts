// ===================================================================
// একটা নির্দিষ্ট Duel এর বিস্তারিত অবস্থা (polling endpoint)
// GET /api/duel/[duelId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDuelDetail } from "@/lib/quiz-duel";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ duelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { duelId } = await params;

  try {
    const duel = await getDuelDetail(duelId, session.user.id);
    if (!duel) {
      return NextResponse.json({ error: "Duel পাওয়া যায়নি" }, { status: 404 });
    }
    return NextResponse.json({ duel });
  } catch (err) {
    const message = err instanceof Error ? err.message : "অ্যাক্সেস নেই";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
