// ===================================================================
// Admin: একটা Content Report রিভিউ করা (resolve/dismiss/delete+ban)
// PATCH  /api/admin/reports/[reportId]
// Body: { action: "RESOLVE" | "DISMISS" | "DELETE_CONTENT" | "DELETE_AND_BAN" }
//   RESOLVE — admin সমস্যা স্বীকার করেছে, কন্টেন্ট নিজে থেকে রাখা হয়েছে
//   DISMISS — admin রিভিউ করে দেখেছে সমস্যা নেই
//   DELETE_CONTENT — রিপোর্ট হওয়া পোস্ট/রিপ্লাই সরাসরি ডিলিট + RESOLVED মার্ক
//   DELETE_AND_BAN — DELETE_CONTENT + পোস্ট/রিপ্লাই এর লেখককে ব্যান
// -------------------------------------------------------------------
// 🔧 রিফ্যাক্টর (Content Report Bulk Actions ফিচারের সময়): মূল লজিক
// এখন `lib/content-report-actions.ts` এর `applyReportAction()` এ
// কেন্দ্রীভূত — এই single-report endpoint ও নতুন bulk endpoint
// (`/api/admin/reports/bulk`) দুটোই একই ফাংশন কল করে, কোনো ডুপ্লিকেট
// বিজনেস লজিক নেই।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { applyReportAction, VALID_REPORT_ACTIONS, type ReportAction } from "@/lib/content-report-actions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { reportId } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, banReason } = body as { action?: string; banReason?: string };

  if (!action || !VALID_REPORT_ACTIONS.includes(action as ReportAction)) {
    return NextResponse.json(
      { error: 'action "RESOLVE"/"DISMISS"/"DELETE_CONTENT"/"DELETE_AND_BAN" এর একটা হতে হবে' },
      { status: 400 }
    );
  }

  const result = await applyReportAction(
    reportId,
    action as ReportAction,
    session?.user?.id
      ? { id: session.user.id, name: session.user.name, email: session.user.email }
      : null,
    req,
    banReason
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
  }

  return NextResponse.json({ success: true });
}
