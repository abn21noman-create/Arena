// ===================================================================
// Admin: একসাথে একাধিক Content Report এ action প্রয়োগ (Bulk Actions)
// POST /api/admin/reports/bulk
// Body: { reportIds: string[], action: "RESOLVE"|"DISMISS"|"DELETE_CONTENT"|"DELETE_AND_BAN", banReason?: string }
// -------------------------------------------------------------------
// docs/MASTER_PLAN.md এ Content Moderation Power-up ফিচারের সময়
// transparently চিহ্নিত সীমাবদ্ধতা ছিল: "প্রতিটা রিপোর্ট আলাদাভাবে
// অ্যাকশন নিতে হয়, একসাথে একাধিক select করে bulk resolve/dismiss/
// delete এখনো নেই"। এই endpoint সেই গ্যাপ পূরণ করে।
// -------------------------------------------------------------------
// ডিজাইন সিদ্ধান্ত: **all-or-nothing transaction না** — প্রতিটা
// reportId আলাদাভাবে sequential প্রসেস করা হয় (একটা ব্যর্থ হলেও বাকি
// সব চলতে থাকে), কারণ:
// 1. প্রতিটা report ভিন্ন post/reply/user এর সাথে সম্পর্কিত — একটা
//    fail (যেমন content আগেই ডিলিট হয়ে গেছে) হলে বাকি সব ব্লক করার
//    কোনো কারণ নেই (independent operations)
// 2. একটা বিশাল multi-table transaction (delete+ban+notification)
//    বহু আইটেম জুড়ে করলে Postgres transaction timeout/lock contention
//    ঝুঁকি বাড়ে (dev sandbox এর ছোট connection pool এ established
//    সমস্যা — docs/MASTER_PLAN.md এ Habit Tracker P2028 timeout নোট)
// 3. প্রতিটা আইটেমের জন্য আলাদা success/failure রিপোর্ট করা UX এ ভালো
//    (কোনটা কাজ করেছে কোনটা করেনি স্পষ্ট বোঝা যায়)
//
// সর্বোচ্চ ২০টা reportId একসাথে প্রসেস করা যাবে (accidental
// mass-action/timeout প্রতিরোধ, UI তেও একবারে এত বেশি select করা
// অস্বাভাবিক)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { applyReportAction, VALID_REPORT_ACTIONS, type ReportAction } from "@/lib/content-report-actions";

const MAX_BULK_SIZE = 20;

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const { reportIds, action, banReason } = body as {
    reportIds?: string[];
    action?: string;
    banReason?: string;
  };

  if (!Array.isArray(reportIds) || reportIds.length === 0) {
    return NextResponse.json({ error: "কমপক্ষে একটা reportId দিতে হবে" }, { status: 400 });
  }

  if (reportIds.length > MAX_BULK_SIZE) {
    return NextResponse.json(
      { error: `একসাথে সর্বোচ্চ ${MAX_BULK_SIZE}টা রিপোর্টে অ্যাকশন নেওয়া যাবে` },
      { status: 400 }
    );
  }

  if (!action || !VALID_REPORT_ACTIONS.includes(action as ReportAction)) {
    return NextResponse.json(
      { error: 'action "RESOLVE"/"DISMISS"/"DELETE_CONTENT"/"DELETE_AND_BAN" এর একটা হতে হবে' },
      { status: 400 }
    );
  }

  const typedAction = action as ReportAction;
  const actor = session?.user?.id
    ? { id: session.user.id, name: session.user.name, email: session.user.email }
    : null;

  // ইউনিক reportId (duplicate পাঠালে দুইবার প্রসেস না হওয়ার জন্য)
  const uniqueIds = [...new Set(reportIds)];

  const results: { reportId: string; success: boolean; error?: string }[] = [];

  // Sequential প্রসেসিং (উপরে ডকুমেন্টেড কারণে — connection pool চাপ
  // এড়াতে, dev sandbox এ মাত্র ৩টা connection আছে established নোট)
  for (const reportId of uniqueIds) {
    const result = await applyReportAction(reportId, typedAction, actor, req, banReason);
    results.push({
      reportId,
      success: result.success,
      error: result.success ? undefined : result.error,
    });
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return NextResponse.json({
    results,
    successCount,
    failureCount,
    totalCount: results.length,
  });
}
