// ===================================================================
// একটা প্রশ্নকে সমাধান হয়েছে বলে মার্ক করা (শুধু পোস্টের মালিক করতে পারবে)
// PATCH /api/forum/posts/[postId]/resolve
// Body: { isResolved: boolean }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, Forum Post GET/DELETE এর একই
// "existence check থাকা সত্ত্বেও read-then-write" ক্লাস,
// প্রতিরোধমূলকভাবে ফিক্স করা হয়েছে): `update()` এর বদলে atomic
// `updateMany({ where: { id, userId } })` claim — existence ও
// ownership চেক একসাথে একই where ক্লজে atomic ভাবে হয়ে যায়।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidRequiredBoolean } from "@/lib/boolean-validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { postId } = await params;
  const body = await req.json().catch(() => ({}));
  const { isResolved } = body;

  // 🐛 বাগ ফিক্স (Boolean Field Validation ক্লাস — সাইলেন্ট ডেটা
  // করাপশন, লাইভ টেস্টে প্রমাণিত): আগে `!!isResolved` দিয়ে coerce করা
  // হতো। জাভাস্ক্রিপ্টে যেকোনো non-empty string (এমনকি "false"/"0")
  // truthy — তাই `{ isResolved: "false" }` (string) পাঠালে
  // `!!"false"` === `true` হয়ে যেত, ইউজার "resolved বাতিল করো" চাইলেও
  // কোনো error ছাড়াই উল্টো `isResolved: true` সেভ হয়ে যেত (ক্রাশের
  // চেয়েও খারাপ — সাইলেন্ট ভুল ডেটা)। ফিক্স: strict boolean-type চেক
  // করে non-boolean হলে ৪০০ Bad Request।
  if (!isValidRequiredBoolean(isResolved)) {
    return NextResponse.json({ error: "isResolved true/false হতে হবে" }, { status: 400 });
  }

  const claimResult = await prisma.forumPost.updateMany({
    where: { id: postId, userId: session.user.id },
    data: { isResolved },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "পোস্ট পাওয়া যায়নি অথবা তোমার নয়" },
      { status: 404 }
    );
  }

  const updated = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!updated) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ post: updated });
}
