// ===================================================================
// Peer Note Sharing — "উপকারী" ভোট টগল
// POST /api/notes/peer/[noteId]/helpful
// -------------------------------------------------------------------
// নিজের নোটে নিজে ভোট দেওয়া যায় না (lib/peer-notes.ts এ ব্লক করা আছে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleHelpfulVote } from "@/lib/peer-notes";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { noteId } = await params;
  const result = await toggleHelpfulVote(noteId, session.user.id);

  if ("error" in result) {
    if (result.error === "NOT_FOUND") {
      return NextResponse.json({ error: "নোট পাওয়া যায়নি" }, { status: 404 });
    }
    // SELF_VOTE
    return NextResponse.json(
      { error: "নিজের নোটে নিজে ভোট দেওয়া যাবে না" },
      { status: 403 }
    );
  }

  return NextResponse.json(result);
}
