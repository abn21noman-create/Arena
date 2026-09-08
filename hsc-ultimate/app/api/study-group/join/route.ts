// ===================================================================
// Study Group এ যোগ দেওয়া
// POST /api/study-group/join
// Body: { inviteCode: string }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinStudyGroup } from "@/lib/study-group";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { inviteCode } = body as { inviteCode: string };

  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: "ইনভাইট কোড দিন" }, { status: 400 });
  }

  try {
    const group = await joinStudyGroup(session.user.id, inviteCode);
    return NextResponse.json({ group });
  } catch (err) {
    const message = err instanceof Error ? err.message : "গ্রুপে যোগ দেওয়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
