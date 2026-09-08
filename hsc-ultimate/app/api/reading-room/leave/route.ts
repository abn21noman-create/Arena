// ===================================================================
// Reading Room ছেড়ে যাওয়া (ইউজার নিজে বাটনে চাপ দিলে বা ট্যাব বন্ধ করার
// আগে sendBeacon দিয়ে কল হয়)
// POST /api/reading-room/leave
// Body: { sessionId: string }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { leaveReadingRoom } from "@/lib/reading-room";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { sessionId } = body as { sessionId?: string };

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId আবশ্যক" }, { status: 400 });
  }

  try {
    const result = await leaveReadingRoom(session.user.id, sessionId);
    return NextResponse.json({ session: result.session, xpEarned: result.xpEarned });
  } catch (err) {
    const message = err instanceof Error ? err.message : "সেশন শেষ করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
