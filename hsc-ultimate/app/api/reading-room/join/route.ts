// ===================================================================
// Reading Room এ join করা (রুম বদলানো/প্রথমবার ঢোকা)
// POST /api/reading-room/join
// Body: { room: ReadingRoomTheme, activity?: ReadingRoomActivity, goal?: string }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinReadingRoom, READING_ROOM_THEMES } from "@/lib/reading-room";
import type { ReadingRoomActivity, ReadingRoomTheme } from "@prisma/client";

const VALID_ROOMS = new Set(READING_ROOM_THEMES.map((t) => t.id));
const VALID_ACTIVITIES = new Set<ReadingRoomActivity>(["SELF_STUDY", "CLASS", "BREAK"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { room, activity, goal } = body as {
    room?: ReadingRoomTheme;
    activity?: ReadingRoomActivity;
    goal?: string;
  };

  if (!room || !VALID_ROOMS.has(room)) {
    return NextResponse.json({ error: "সঠিক রুম বেছে নাও" }, { status: 400 });
  }
  if (activity && !VALID_ACTIVITIES.has(activity)) {
    return NextResponse.json({ error: "সঠিক activity বেছে নাও" }, { status: 400 });
  }
  if (goal && typeof goal !== "string") {
    return NextResponse.json({ error: "লক্ষ্য সঠিক ফরম্যাটে দাও" }, { status: 400 });
  }

  const newSession = await joinReadingRoom({
    userId: session.user.id,
    room,
    activity: activity ?? "SELF_STUDY",
    goal,
  });

  return NextResponse.json({ session: newSession }, { status: 201 });
}
