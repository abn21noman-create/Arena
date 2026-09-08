// ===================================================================
// একটা Post এ নতুন Reply তৈরি করা
// POST /api/forum/posts/[postId]/replies
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { createNotification } from "@/lib/notifications";
import { awardXp } from "@/lib/league";
import { moderateText, getModerationBlockMessage } from "@/lib/content-moderation";

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
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "উত্তর লিখতে হবে" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Forum Post এর একই max-length প্যাটার্ন): defense-in-depth length
  // limit (AI moderation এর উপর নির্ভরতা কমানো)।
  if (content.trim().length > 10000) {
    return NextResponse.json({ error: "উত্তর খুব বড় (সর্বোচ্চ ১০,০০০ অক্ষর)" }, { status: 400 });
  }

  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  // AI Content Moderation — রিপ্লাই তৈরির আগেই স্ক্যান (fail-open)
  const moderation = await moderateText(content.trim());
  if (moderation.shouldBlock) {
    return NextResponse.json({ error: getModerationBlockMessage(moderation) }, { status: 422 });
  }

  const reply = await prisma.forumReply.create({
    data: {
      postId,
      userId: session.user.id,
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  // অন্যদের সাহায্য করাটা উৎসাহিত করার জন্য ছোট XP reward
  await awardXp(session.user.id, 5);
  await updateStreak(session.user.id);

  // পোস্টের মালিককে নোটিফাই করা হচ্ছে (নিজের পোস্টে নিজে রিপ্লাই দিলে না)
  if (post.userId !== session.user.id) {
    await createNotification({
      userId: post.userId,
      title: "তোমার পোস্টে নতুন উত্তর এসেছে",
      body: `${reply.user.name} তোমার প্রশ্নের উত্তর দিয়েছে`,
      link: `/forum/${postId}`,
    });
  }

  return NextResponse.json({ reply }, { status: 201 });
}
