// ===================================================================
// Peer Note Sharing — একটা টপিকের সব পাবলিক (শেয়ার করা) নোট দেখা
// GET /api/notes/[topicId]/peer
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPeerNotesForTopic } from "@/lib/peer-notes";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const notes = await getPeerNotesForTopic(topicId, session.user.id);

  return NextResponse.json({ notes });
}
