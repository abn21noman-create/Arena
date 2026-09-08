// ===================================================================
// একটা নির্দিষ্ট Reading Room এর বর্তমান প্রেজেন্স লিস্ট (কারা আছে)
// GET /api/reading-room/rooms/[room]/presence
// -------------------------------------------------------------------
// ফ্রন্টএন্ড এই এন্ডপয়েন্ট প্রতি heartbeat এর সাথেই পোল করবে যাতে
// অন্যদের presence রিয়েল-টাইমের কাছাকাছি (~২৫ সেকেন্ড delay) আপডেট
// থাকে (Quiz Battle-স্টাইল polling, রেট-লিমিট নিষিদ্ধ থাকায় সমস্যা নেই)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRoomPresence, READING_ROOM_THEMES } from "@/lib/reading-room";
import type { ReadingRoomTheme } from "@prisma/client";

const VALID_ROOMS = new Set(READING_ROOM_THEMES.map((t) => t.id));

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ room: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { room } = await params;
  if (!VALID_ROOMS.has(room as ReadingRoomTheme)) {
    return NextResponse.json({ error: "রুম পাওয়া যায়নি" }, { status: 404 });
  }

  const presence = await getRoomPresence(room as ReadingRoomTheme, session.user.id);
  return NextResponse.json({ presence });
}
