// ===================================================================
// Reading Room heartbeat — প্রেজেন্স বজায় রাখা + ফোকাস টাইম accumulate
// POST /api/reading-room/heartbeat
// Body: { sessionId: string, activity?: ReadingRoomActivity, goal?: string }
// -------------------------------------------------------------------
// ক্লায়েন্ট প্রতি HEARTBEAT_INTERVAL_SEC সেকেন্ডে এটা কল করবে (Quiz
// Battle/Duel এ প্রমাণিত polling প্যাটার্ন)। ended: true মানে সেশন আর
// active না (stale/timeout/manual leave) — ফ্রন্টএন্ড তখন "আবার join
// করো" prompt দেখাবে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendHeartbeat } from "@/lib/reading-room";
import type { ReadingRoomActivity } from "@prisma/client";

const VALID_ACTIVITIES = new Set<ReadingRoomActivity>(["SELF_STUDY", "CLASS", "BREAK"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { sessionId, activity, goal } = body as {
    sessionId?: string;
    activity?: ReadingRoomActivity;
    goal?: string;
  };

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId আবশ্যক" }, { status: 400 });
  }
  if (activity && !VALID_ACTIVITIES.has(activity)) {
    return NextResponse.json({ error: "সঠিক activity বেছে নাও" }, { status: 400 });
  }

  const result = await sendHeartbeat(session.user.id, sessionId, { activity, goal });

  if (!result.session) {
    return NextResponse.json({ error: "সেশন পাওয়া যায়নি বা মেয়াদ শেষ" }, { status: 404 });
  }

  return NextResponse.json({ session: result.session, ended: result.ended });
}
