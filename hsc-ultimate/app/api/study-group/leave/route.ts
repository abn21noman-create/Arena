// ===================================================================
// Study Group ছেড়ে দেওয়া
// POST /api/study-group/leave
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { leaveStudyGroup } from "@/lib/study-group";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  try {
    const result = await leaveStudyGroup(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "গ্রুপ ছাড়া যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
