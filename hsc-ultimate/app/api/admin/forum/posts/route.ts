// ===================================================================
// Admin: সব Forum Post এর তালিকা (moderation এর জন্য)
// GET /api/admin/forum/posts
// -------------------------------------------------------------------
// Performance অডিটে আবিষ্কৃত: এই query কোনো `take` limit ছাড়া পুরো
// forum_posts টেবিল আনছিল (প্রতিটা _count aggregate সহ) — Forum ব্যবহার
// বাড়লে এটা ধীরে ধীরে unbounded scan হয়ে যেত। Moderation panel এ
// সাম্প্রতিক পোস্ট দেখাই মূল উদ্দেশ্য (পুরনো পোস্ট মডারেট করার দরকার
// কম), তাই একটা reasonable cap যোগ করা হলো (audit-log এর MAX_PAGE_SIZE
// প্যাটার্ন অনুসরণ করে) — future এ pagination UI দরকার হলে সহজেই
// `page`/`skip` যোগ করা যাবে।
// ===================================================================
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const MODERATION_LIST_LIMIT = 100;

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const posts = await prisma.forumPost.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: MODERATION_LIST_LIMIT,
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { replies: true, votes: true } },
    },
  });

  return NextResponse.json({ posts });
}
