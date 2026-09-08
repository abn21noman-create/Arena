// ===================================================================
// Reading Room — সব প্রি-সেট থিমড রুমের লিস্ট + বর্তমান occupancy count
// GET /api/reading-room/rooms
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { READING_ROOM_THEMES, getAllRoomOccupancy, getActiveSession } from "@/lib/reading-room";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const [occupancy, activeSession] = await Promise.all([
    getAllRoomOccupancy(),
    getActiveSession(session.user.id),
  ]);

  const rooms = READING_ROOM_THEMES.map((theme) => ({
    ...theme,
    occupancy: occupancy[theme.id] ?? 0,
  }));

  return NextResponse.json({ rooms, activeSession });
}
