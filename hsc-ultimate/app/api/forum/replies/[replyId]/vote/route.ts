// ===================================================================
// একটা Reply তে Upvote/Downvote দেওয়া
// POST /api/forum/replies/[replyId]/vote
// Body: { value: 1 | -1 }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স: আগে সরাসরি findUnique→create/update/delete করা হতো যা
// concurrent প্রথম-ভোটে P2002 unique constraint crash (৫০০ error) দিত
// (lib/forum-vote.ts এ বিস্তারিত)। এখন race-safe applyForumVote() ব্যবহার
// করা হচ্ছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyForumVote, getReplyVoteScore } from "@/lib/forum-vote";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { replyId } = await params;
  const body = await req.json().catch(() => ({}));
  const value = body.value === 1 ? 1 : body.value === -1 ? -1 : null;

  if (value === null) {
    return NextResponse.json({ error: "value +1 অথবা -1 হতে হবে" }, { status: 400 });
  }

  const reply = await prisma.forumReply.findUnique({ where: { id: replyId }, select: { id: true } });
  if (!reply) {
    return NextResponse.json({ error: "রিপ্লাই পাওয়া যায়নি" }, { status: 404 });
  }

  await applyForumVote({ userId: session.user.id, replyId, value });
  const voteScore = await getReplyVoteScore(replyId);

  return NextResponse.json({ voteScore });
}
