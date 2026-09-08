// ===================================================================
// Content Report Action — Core Logic (single ও bulk endpoint দুটোতেই
// পুনর্ব্যবহারযোগ্য)
// -------------------------------------------------------------------
// আগে এই লজিক শুধু `app/api/admin/reports/[reportId]/route.ts` এর
// PATCH handler এর ভেতরেই ছিল। Content Report Bulk Actions ফিচারের
// জন্য (docs/MASTER_PLAN.md এ ডকুমেন্টেড সীমাবদ্ধতা — "প্রতিটা রিপোর্ট
// আলাদাভাবে অ্যাকশন নিতে হয়") একই লজিক bulk endpoint থেকেও দরকার হলো,
// তাই DRY রাখতে এখানে বের করে আনা হলো — single ও bulk endpoint দুটোই
// এই একই ফাংশন কল করে, কোনো ডুপ্লিকেট বিজনেস লজিক নেই।
// ===================================================================
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { createNotification } from "@/lib/notifications";

export const VALID_REPORT_ACTIONS = [
  "RESOLVE",
  "DISMISS",
  "DELETE_CONTENT",
  "DELETE_AND_BAN",
] as const;
export type ReportAction = (typeof VALID_REPORT_ACTIONS)[number];

export interface ApplyReportActionResult {
  success: boolean;
  error?: string;
  status?: number;
}

interface ActorInfo {
  id: string;
  name?: string | null;
  email?: string | null;
}

/**
 * একটা নির্দিষ্ট Content Report এ একটা action প্রয়োগ করে (resolve/
 * dismiss/delete/delete+ban সব লজিক এখানে কেন্দ্রীভূত)। সফল/ব্যর্থ
 * দুটোই boolean+error message আকারে রিটার্ন করে (throw করে না) —
 * bulk endpoint এ একটা report এ ব্যর্থ হলে বাকিগুলো processing
 * চালিয়ে যেতে পারে (all-or-nothing না, per-item result)।
 */
export async function applyReportAction(
  reportId: string,
  action: ReportAction,
  actor: ActorInfo | null,
  req: NextRequest | undefined,
  banReason?: string
): Promise<ApplyReportActionResult> {
  const report = await prisma.contentReport.findUnique({
    where: { id: reportId },
    include: {
      post: { select: { id: true, title: true, userId: true } },
      reply: { select: { id: true, postId: true, userId: true } },
    },
  });
  if (!report) {
    return { success: false, error: "রিপোর্ট পাওয়া যায়নি", status: 404 };
  }

  if (report.status !== "PENDING") {
    return {
      success: false,
      error: "এই রিপোর্ট ইতিমধ্যে রিভিউ করা হয়ে গেছে",
      status: 400,
    };
  }

  // ডিলিট/ব্যান action এর জন্য টার্গেট কন্টেন্ট এখনো বিদ্যমান কিনা
  // চেক করা হচ্ছে (আগেই ডিলিট হয়ে থাকলে ৪০৪, ৫০০ crash এড়াতে —
  // established Prisma P2025 প্যাটার্ন)
  if (action === "DELETE_CONTENT" || action === "DELETE_AND_BAN") {
    if (!report.post && !report.reply) {
      return { success: false, error: "টার্গেট কন্টেন্ট আগেই ডিলিট হয়ে গেছে", status: 404 };
    }
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Task/
  // StudyPlanItem/QuizBattle এর একই race-condition ক্লাস): আগে উপরের
  // `report.status !== "PENDING"` চেক শুধু read-then-write প্যাটার্নে
  // ছিল (এখানে read করে, নিচে আলাদা `update()` কল) — লাইভ concurrency
  // টেস্টে একই রিপোর্টে ৫টা concurrent RESOLVE request পাঠিয়ে ৫টাই
  // সফল হয়েছে (প্রত্যাশিত ১টা — বাকি ৪টার "ইতিমধ্যে রিভিউ করা হয়ে
  // গেছে" এরর পাওয়ার কথা ছিল)। এর ফলে DELETE_AND_BAN এর ক্ষেত্রে
  // একই পোস্ট একাধিকবার delete করার চেষ্টা (P2025 crash ঝুঁকি) বা
  // রিপোর্টকারীকে একাধিকবার নোটিফিকেশন পাঠানোর মতো side-effect
  // ডুপ্লিকেট হতে পারত। ফিক্স: single atomic `updateMany({ where:
  // { id, status: "PENDING" } })` স্টেটমেন্ট দিয়ে check+set একসাথে
  // করা হয়েছে (Postgres row-level lock guarantee) — শুধু matched
  // (count>0) হলেই বাকি সব side-effect (delete/ban/notification)
  // প্রয়োগ হয়, নাহলে "ইতিমধ্যে রিভিউ করা হয়ে গেছে" এরর রিটার্ন হয়।
  const finalStatus = action === "DISMISS" ? "DISMISSED" : "RESOLVED";

  const claimResult = await prisma.contentReport.updateMany({
    where: { id: reportId, status: "PENDING" },
    data: {
      status: finalStatus,
      reviewedById: actor?.id ?? null,
      reviewedAt: new Date(),
    },
  });

  if (claimResult.count === 0) {
    // অন্য একটা concurrent request রেস জিতে ইতিমধ্যে এই রিপোর্ট
    // রিভিউ করে ফেলেছে
    return {
      success: false,
      error: "এই রিপোর্ট ইতিমধ্যে রিভিউ করা হয়ে গেছে",
      status: 400,
    };
  }


  if (action === "DELETE_CONTENT" || action === "DELETE_AND_BAN") {
    const authorId = report.post ? report.post.userId : report.reply?.userId;

    if (report.post) {
      await prisma.forumPost.delete({ where: { id: report.post.id } });
    } else if (report.reply) {
      await prisma.forumReply.delete({ where: { id: report.reply.id } });
    }

    if (actor?.id) {
      await logAuditEvent({
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "FORUM_POST_DELETE",
        targetType: report.post ? "ForumPost" : "ForumReply",
        targetId: report.post ? report.post.id : report.reply?.id,
        metadata: { viaReportId: reportId },
        req,
      });
    }

    if (action === "DELETE_AND_BAN" && authorId && authorId !== actor?.id) {
      // Admin কে ব্যান করা থেকে বিরত রাখা হচ্ছে (ban endpoint এর একই
      // safety, এখানেও ডুপ্লিকেট করা হলো যাতে এই শর্টকাট থেকে bypass
      // না হয়)
      const author = await prisma.user.findUnique({
        where: { id: authorId },
        select: { role: true },
      });
      if (author && author.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: authorId },
          data: {
            isBanned: true,
            banReason: banReason?.trim() || "বারবার কমিউনিটি নিয়ম ভঙ্গ (Content Report থেকে)",
            bannedAt: new Date(),
            bannedBy: actor?.id ?? null,
          },
        });
        if (actor?.id) {
          await logAuditEvent({
            actorId: actor.id,
            actorName: actor.name,
            actorEmail: actor.email,
            action: "USER_BAN",
            targetType: "User",
            targetId: authorId,
            metadata: { viaReportId: reportId, reason: banReason ?? null },
            req,
          });
        }
      }
    }
  }

  if (actor?.id && (action === "RESOLVE" || action === "DISMISS")) {
    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action: action === "RESOLVE" ? "CONTENT_REPORT_RESOLVE" : "CONTENT_REPORT_DISMISS",
      targetType: "ContentReport",
      targetId: reportId,
      req,
    });
  }

  // রিপোর্টকারী ইউজারকে ফলাফল জানানো (silent fail — createNotification
  // নিজেই try/catch করা, মূল admin action ব্যাহত হবে না)
  const postLink = report.postId
    ? `/forum/${report.postId}`
    : report.replyId && report.reply
      ? `/forum/${report.reply.postId}`
      : "/forum";

  if (finalStatus === "RESOLVED") {
    await createNotification({
      userId: report.userId,
      title: "✅ তোমার রিপোর্ট রিভিউ করা হয়েছে",
      body: "তুমি যে কনটেন্ট রিপোর্ট করেছিলে, admin তা রিভিউ করে যথাযথ ব্যবস্থা নিয়েছে। রিপোর্ট করার জন্য ধন্যবাদ!",
      link: postLink,
    });
  } else {
    await createNotification({
      userId: report.userId,
      title: "তোমার রিপোর্ট রিভিউ করা হয়েছে",
      body: "তুমি যে কনটেন্ট রিপোর্ট করেছিলে, admin রিভিউ করে দেখেছে এটা কমিউনিটি নিয়ম ভঙ্গ করেনি। রিপোর্ট করার জন্য ধন্যবাদ!",
      link: postLink,
    });
  }

  return { success: true };
}
