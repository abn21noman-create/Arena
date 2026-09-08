// ===================================================================
// নিজের Study Group সদস্যদের বর্তমান Reading Room অবস্থা
// GET /api/study-group/reading-room-status
// -------------------------------------------------------------------
// Study Group কে "live session" মোডে upgrade করার অংশ — গ্রুপের সদস্যরা
// এখন কে কোথায় (কোন Reading Room এ) পড়ছে তা দেখা যায় (docs/RESEARCH_
// UI_UX_READING_ROOM.md এর ৮ নং সেকশনে চিহ্নিত করা আইটেম)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGroupMembersReadingRoomStatus } from "@/lib/reading-room";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const members = await getGroupMembersReadingRoomStatus(session.user.id);
  return NextResponse.json({ members });
}
