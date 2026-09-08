// ===================================================================
// Admin: একটা Forum Post ডিলিট করা (moderation)
// DELETE /api/admin/forum/posts/[postId]
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Chapter/Subject/Topic/Question/CQQuestion এর সাথে একই
// bug pattern, প্রোঅ্যাক্টিভ সিস্টেমেটিক অডিটে ধরা পড়েছে): অস্তিত্বহীন
// postId দিলে Prisma `delete` P2025 throw করতো (৪০৪ এর বদলে ৫০০)।
//
// 🐛 বাগ ফিক্স #২ (Race Condition, Task/Custom Question Set এর একই
// "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, এই সেশনে
// broad grep audit এ আবিষ্কৃত): উপরের `findUnique()` existence check
// এর পরেও চূড়ান্ত ধাপে raw `forumPost.delete()` ব্যবহার হতো —
// concurrent double-delete (দুইজন admin/moderator একই পোস্ট একসাথে
// delete করলে, বা দ্রুত দুইবার click) দ্বিতীয়টা P2025 throw করে ৫০০
// crash করতো। লাইভ টেস্টে ৮/৮ (১০০%) iteration এ crash প্রমাণিত
// হয়েছে। ফিক্স: `delete()` এর বদলে atomic `deleteMany({ where: { id
// } })` — কখনো throw করে না।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { postId } = await params;

  const claimResult = await prisma.forumPost.deleteMany({ where: { id: postId } });
  if (claimResult.count === 0) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "FORUM_POST_DELETE",
      targetType: "ForumPost",
      targetId: postId,
      req,
    });
  }

  return NextResponse.json({ success: true });
}

