// ===================================================================
// Admin: একটা Forum Reply ডিলিট করা (moderation)
// DELETE /api/admin/forum/replies/[replyId]
// -------------------------------------------------------------------
// Content Moderation Power-up — আগে শুধু Post ডিলিট করার admin
// endpoint ছিল (`/api/admin/forum/posts/[postId]`), Reply ডিলিটের
// কোনো endpoint ছিল না — Reports প্যানেলে রিপোর্ট হওয়া reply দেখেও
// admin সেটা সরাসরি ডিলিট করতে পারতো না। এই একই established
// প্যাটার্ন (existence check → 404, তারপর delete + audit log)
// অনুসরণ করা হয়েছে।
//
// 🐛 বাগ ফিক্স (Race Condition, Admin Forum Post Delete এর একই
// "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, এই সেশনে
// broad grep audit এ আবিষ্কৃত): existence check এর পরেও চূড়ান্ত
// ধাপে raw `forumReply.delete()` ব্যবহার হতো — concurrent double-
// delete দ্বিতীয়টা P2025 throw করে ৫০০ crash করতো। লাইভ টেস্টে ৮/৮
// (১০০%) iteration এ crash প্রমাণিত হয়েছে। ফিক্স: `delete()` এর
// বদলে atomic `deleteMany({ where: { id } })`।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { replyId } = await params;

  const claimResult = await prisma.forumReply.deleteMany({ where: { id: replyId } });
  if (claimResult.count === 0) {
    return NextResponse.json({ error: "রিপ্লাই পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "FORUM_POST_DELETE",
      targetType: "ForumReply",
      targetId: replyId,
      req,
    });
  }

  return NextResponse.json({ success: true });
}
