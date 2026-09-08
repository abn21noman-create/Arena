// ===================================================================
// Admin: একটা Forum Post পিন/আনপিন করা
// PATCH /api/admin/forum/posts/[postId]/pin
// Body: { isPinned: boolean }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Chapter/Subject/Topic/Question/CQQuestion/Forum-DELETE
// এর সাথে একই bug pattern, প্রোঅ্যাক্টিভ সিস্টেমেটিক অডিটে ধরা পড়েছে):
// অস্তিত্বহীন postId দিলে Prisma `update` P2025 throw করতো (৪০৪ এর
// বদলে ৫০০)।
//
// 🐛 বাগ ফিক্স #২ (Race Condition, Admin Content Management Delete/
// PATCH Race Condition অডিটে মিসড হয়ে যাওয়া instance, পরবর্তী broad
// grep audit এ ধরা পড়েছে): existence check এর পরেও চূড়ান্ত ধাপে raw
// `forumPost.update()` ব্যবহার হতো — concurrent PATCH+DELETE (admin
// pin করছে ঠিক যখন অন্য admin/মালিক পোস্টটা delete করছে) এ P2025
// crash হতে পারতো। ফিক্স: `update()` এর বদলে atomic `updateMany()`,
// matched count 0 হলে গ্রেসফুল ৪০৪।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { isValidRequiredBoolean } from "@/lib/boolean-validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { postId } = await params;
  const body = await req.json().catch(() => ({}));
  const { isPinned } = body as { isPinned: unknown };

  // 🐛 বাগ ফিক্স (Boolean Field Validation ক্লাস — সাইলেন্ট ডেটা
  // করাপশন, established Forum Resolve endpoint এর একই `!!` coercion
  // bug, broad grep audit এ পাওয়া গেছে): `!!isPinned` দিয়ে coerce
  // করলে `{ isPinned: "false" }` (string) পাঠালে সাইলেন্টলি `true`
  // সেভ হয়ে যেত। ফিক্স: strict boolean-type চেক।
  if (!isValidRequiredBoolean(isPinned)) {
    return NextResponse.json({ error: "isPinned true/false হতে হবে" }, { status: 400 });
  }

  const updateResult = await prisma.forumPost.updateMany({
    where: { id: postId },
    data: { isPinned },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "FORUM_POST_PIN",
      targetType: "ForumPost",
      targetId: postId,
      metadata: { isPinned },
      req,
    });
  }

  return NextResponse.json({ post });
}

