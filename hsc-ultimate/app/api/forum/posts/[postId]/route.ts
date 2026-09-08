// ===================================================================
// একটা Forum Post এর বিস্তারিত (replies সহ) + ডিলিট
// GET    /api/forum/posts/[postId]  -> viewCount +1 করে বিস্তারিত রিটার্ন করে
// DELETE /api/forum/posts/[postId]  -> শুধু পোস্টের মালিক বা Admin ডিলিট করতে পারবে
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ GET endpoint অডিটে আবিষ্কৃত): আগে এখানে
// সরাসরি `prisma.forumPost.update()` কল করা হতো viewCount বাড়ানোর
// জন্য, এবং তারপর `if (!post)` চেক করে ৪০৪ রিটার্নের চেষ্টা করা হতো।
// কিন্তু Prisma `update()` কোনো রেকর্ড না পেলে `null` রিটার্ন করে না —
// বরং `PrismaClientKnownRequestError` (code P2025) throw করে। ফলে
// অস্তিত্বহীন/মুছে ফেলা postId দিয়ে এই endpoint কল করলে `if (!post)`
// চেক কখনো রান হতো না, বরং unhandled exception এ ৫০০ Internal Server
// Error রিটার্ন হতো (৪০৪ এর বদলে) — লাইভ টেস্টে সরাসরি ভেরিফাই করে
// নিশ্চিত হওয়া গেছে। প্রাথমিক ফিক্স `findUnique` দিয়ে existence চেক
// আগে করে দিয়েছিল, কিন্তু এটা এখনো read-then-write race condition —
// concurrent `DELETE` যদি এই existence check ও `update()` এর মাঝে
// পোস্ট ডিলিট করে দেয়, তাহলে `update()` তবুও P2025 throw করে ৫০০
// crash করতো। লাইভ টেস্টে (post তৈরি করে delete+GET concurrent
// পাঠিয়ে) ২০ iteration এ ৯টা crash সরাসরি প্রমাণিত হয়েছে।
//
// চূড়ান্ত ফিক্স: `update()` এর বদলে atomic `updateMany({ where: {
// id: postId } })` claim — matched count 0 হলে ৪০৪ (পোস্ট concurrent
// delete হয়ে গেছে), নাহলে সফল হলে আলাদাভাবে `findUnique` (non-
// throwing) দিয়ে replies/votes সহ পুরো ডেটা fetch করা হয় (viewCount
// increment এর `update()` নিজে `include` সাপোর্ট করে কিন্তু
// `updateMany()` করে না, তাই দুই ধাপে ভাগ করা হয়েছে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { postId } = await params;

  // atomic claim — viewCount বাড়ানোর চেষ্টা, matched count 0 হলে
  // মানে পোস্ট concurrent delete হয়ে গেছে (বা কখনো ছিলই না)
  const claimResult = await prisma.forumPost.updateMany({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: [{ isBestAnswer: "desc" }, { createdAt: "asc" }],
        include: {
          user: { select: { id: true, name: true, image: true } },
          votes: { select: { value: true, userId: true } },
        },
      },
      votes: { select: { value: true, userId: true } },
    },
  });

  if (!post) {
    // অত্যন্ত ছোট window এ viewCount বাড়ানোর ঠিক পরেই যদি delete হয়ে
    // যায় — এই কেসেও crash না করে graceful ৪০৪
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const result = {
    ...post,
    voteScore: post.votes.reduce((sum, v) => sum + v.value, 0),
    myVote: post.votes.find((v) => v.userId === session.user.id)?.value ?? 0,
    replies: post.replies.map((r) => ({
      ...r,
      voteScore: r.votes.reduce((sum, v) => sum + v.value, 0),
      myVote: r.votes.find((v) => v.userId === session.user.id)?.value ?? 0,
    })),
  };

  return NextResponse.json({ post: result });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { postId } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });

  if (!post) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  if (post.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "এই পোস্ট ডিলিট করার অনুমতি নেই" }, { status: 403 });
  }

  // 🐛 বাগ ফিক্স (একই ক্লাস, প্রতিরোধমূলক): existence+ownership check
  // এর পরে আলাদা `delete()` কল করা হতো — concurrent double-delete
  // (একই ইউজার ডাবল-ক্লিক করলে বা admin+owner একসাথে delete করলে)
  // দ্বিতীয় কলে P2025 crash করতে পারতো। `deleteMany()` দিয়ে ফিক্স
  // করা হয়েছে (idempotent-নিরাপদ — matched 0 হলেও চুপচাপ সফল ধরে
  // নেওয়া হয়, কারণ target অবস্থা achieved হয়েই গেছে)।
  await prisma.forumPost.deleteMany({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
