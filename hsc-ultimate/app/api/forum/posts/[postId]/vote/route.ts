// ===================================================================
// একটা Post এ Upvote/Downvote দেওয়া
// POST /api/forum/posts/[postId]/vote
// Body: { value: 1 | -1 }
// -------------------------------------------------------------------
// একই vote আবার দিলে (toggle) ভোট মুছে যাবে, ভিন্ন vote দিলে আপডেট হবে।
//
// 🐛 বাগ ফিক্স: আগে সরাসরি findUnique→create/update/delete করা হতো যা
// concurrent প্রথম-ভোটে P2002 unique constraint crash (৫০০ error) দিত
// (lib/forum-vote.ts এ বিস্তারিত)। এখন race-safe applyForumVote() ব্যবহার
// করা হচ্ছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyForumVote, getPostVoteScore } from "@/lib/forum-vote";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { postId } = await params;
  const body = await req.json().catch(() => ({}));
  const value = body.value === 1 ? 1 : body.value === -1 ? -1 : null;

  if (value === null) {
    return NextResponse.json({ error: "value +1 অথবা -1 হতে হবে" }, { status: 400 });
  }

  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  await applyForumVote({ userId: session.user.id, postId, value });
  const voteScore = await getPostVoteScore(postId);

  return NextResponse.json({ voteScore });
}
