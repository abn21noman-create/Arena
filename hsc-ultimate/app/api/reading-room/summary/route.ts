// ===================================================================
// ইউজারের নিজের আজকের মোট Reading Room ফোকাস সময় সারাংশ
// GET /api/reading-room/summary
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTodayFocusSummary } from "@/lib/reading-room";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const summary = await getTodayFocusSummary(session.user.id);
  return NextResponse.json(summary);
}
