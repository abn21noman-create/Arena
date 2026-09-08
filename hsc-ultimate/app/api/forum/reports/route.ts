// ===================================================================
// Content Report তৈরি করার API (Student-facing)
// POST /api/forum/reports
// Body: { postId?: string, replyId?: string, reason: ContentReportReason, details?: string }
// -------------------------------------------------------------------
// একজন ইউজার একটা নির্দিষ্ট Post/Reply একবারই রিপোর্ট করতে পারবে
// (DB তে unique constraint দিয়ে enforce করা, ForumVote এর প্যাটার্ন
// অনুসরণ করে) — বারবার রিপোর্ট করে spam করা ঠেকাতে।
//
// 🐛 বাগ ফিক্স (Forum Vote race condition অডিটের ধারাবাহিকতায়
// আবিষ্কৃত): আগে শুধু `findFirst()` দিয়ে existing report চেক করে
// `create()` কল করা হতো — concurrent একই ইউজার একই পোস্ট/রিপ্লাই
// দ্রুত কয়েকবার রিপোর্ট করলে (বা ডাবল-ট্যাপ/মাল্টি-ট্যাব) দুটো
// request-ই `existing === null` দেখে দুটোই create() কল করতে পারে,
// `@@unique([userId, postId])`/`@@unique([userId, replyId])`
// constraint এ দ্বিতীয়টা Prisma P2002 crash করে ৫০০ Internal Server
// Error দিত (লাইভ টেস্টে ৫টা concurrent রিকোয়েস্টে ৪টা crash প্রমাণিত,
// ForumVote বাগের সাথে হুবহু একই ক্লাস)। এখানে ForumVote এর মতো
// toggle সেমান্টিক্স নেই (রিপোর্ট একবার হলেই যথেষ্ট, আবার "unreport"
// করার কনসেপ্ট নেই) — তাই সহজ সমাধান: `create()` কে try/catch এ
// wrap করে P2002 পেলে existing (already-reported) বোঝায়, ৪০৯ রিটার্ন
// করা হয় (ঠিক যেমন আগে থেকে existing চেক পেলে হতো — একই user-facing
// বার্তা, শুধু race-condition-safe ভাবে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_REASONS = ["SPAM", "OFFENSIVE", "MISINFORMATION", "HARASSMENT", "OTHER"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { postId, replyId, reason, details } = body as {
    postId?: string;
    replyId?: string;
    reason?: string;
    details?: string;
  };

  // postId/replyId এর ঠিক একটা থাকতে হবে (দুটোই বা কোনোটাই না — দুটোই ভুল)
  if ((!postId && !replyId) || (postId && replyId)) {
    return NextResponse.json(
      { error: "একটা পোস্ট অথবা রিপ্লাই আইডি দিতে হবে (দুটো একসাথে না)" },
      { status: 400 }
    );
  }

  if (!reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "সঠিক কারণ বেছে নিন" }, { status: 400 });
  }

  if (reason === "OTHER" && !details?.trim()) {
    return NextResponse.json(
      { error: '"অন্য কারণ" বেছে নিলে বিস্তারিত লিখতে হবে' },
      { status: 400 }
    );
  }

  // টার্গেট Post/Reply আসলেই আছে কিনা যাচাই (না থাকলে 404, ভুল আইডি দিয়ে
  // orphan report তৈরি ঠেকাতে)
  if (postId) {
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });
    }
  } else if (replyId) {
    const reply = await prisma.forumReply.findUnique({ where: { id: replyId } });
    if (!reply) {
      return NextResponse.json({ error: "রিপ্লাই পাওয়া যায়নি" }, { status: 404 });
    }
  }

  try {
    const report = await prisma.contentReport.create({
      data: {
        userId: session.user.id,
        postId: postId ?? null,
        replyId: replyId ?? null,
        reason: reason as
          | "SPAM"
          | "OFFENSIVE"
          | "MISINFORMATION"
          | "HARASSMENT"
          | "OTHER",
        details: details?.trim() || null,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    // ইতিমধ্যে রিপোর্ট করা থাকলে (বা concurrent request একসাথে জিতে
    // গেলে) DB unique constraint এ P2002 আসে — এটা সাধারণ/প্রত্যাশিত
    // অবস্থা, ইউজারকে সুন্দর বাংলা এরর দিয়ে জানানো হয়, crash না।
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "তুমি ইতিমধ্যে এটা রিপোর্ট করেছো" },
        { status: 409 }
      );
    }
    throw err;
  }
}
