// ===================================================================
// Admin: একটা বিদ্যমান Forum Post AI দিয়ে on-demand স্ক্যান করা
// POST /api/admin/forum/posts/[postId]/scan
// -------------------------------------------------------------------
// নতুন পোস্ট তৈরির সময় automatic moderation চলে (lib/content-moderation.ts),
// কিন্তু পুরনো পোস্ট (moderation ফিচার আসার আগে তৈরি) বা কোনো ইউজার
// রিপোর্ট করার পর admin manually re-check করতে চাইলে এই endpoint ব্যবহার
// করা যায়। ফলাফল DB তে সেভ হয় না (ephemeral scan, শুধু admin কে তাৎক্ষণিক
// AI মতামত দেখানোর জন্য) — admin নিজে সিদ্ধান্ত নিয়ে delete/dismiss করবে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/content-moderation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { postId } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const result = await moderateText(`${post.title}\n\n${post.content}`);

  return NextResponse.json({ moderation: result });
}
