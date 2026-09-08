import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { spreadsheetSafeCsvCell } from "@/lib/content-quality";
import { buildContentQualitySnapshot } from "@/lib/content-quality-server";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

const TARGET_TYPES = ["CORE_MCQ", "ADMISSION_MCQ", "CQ", "TOPIC_NOTE"] as const;
const VIEWS = ["ATTENTION", "REPORTED", "UNREVIEWED", "REVIEWED", "STALE", "ALL"] as const;

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:content-quality:export", session.user.id)
  );
  if (limited) return limited;

  const params = new URL(request.url).searchParams;
  const targetParam = params.get("targetType");
  const viewParam = params.get("view");
  const targetType = TARGET_TYPES.find((value) => value === targetParam);
  const view = VIEWS.find((value) => value === viewParam) ?? "UNREVIEWED";
  const snapshot = await buildContentQualitySnapshot({
    targetType,
    view,
    search: params.get("search")?.slice(0, 200) ?? "",
    page: 1,
    pageSize: 2_000,
    maxPageSize: 2_000,
  });

  const headers = [
    "targetType",
    "targetId",
    "contentHash",
    "context",
    "title",
    "options",
    "correctAnswer",
    "explanationOrPreview",
    "riskCodes",
    "riskSeverity",
    "pendingStudentReports",
    "studentReportReasons",
    "reviewStatus",
    "reviewStale",
    "reviewNote",
    "sourceUrl",
    "reviewer",
    "reviewerKind",
    "aiConfidence",
    "reviewMethodVersion",
    "reviewedAt",
  ];
  const rows = snapshot.items.map((item) => [
    item.targetType,
    item.targetId,
    item.contentHash,
    item.context,
    item.title,
    item.details.options ?? "",
    item.details.correctAnswer ?? "",
    item.details.explanation ?? item.details.stimulus ?? item.details.notesPreview ?? item.preview,
    item.risks.map((risk) => risk.code).join("|"),
    item.risks.map((risk) => risk.severity).join("|"),
    item.studentReports.filter((report) => report.status === "PENDING").length,
    item.studentReports.map((report) => report.reason).join("|"),
    item.review?.status ?? "UNREVIEWED",
    item.review?.stale ? "true" : "false",
    item.review?.reviewNote ?? "",
    item.review?.sourceUrl ?? "",
    item.review?.reviewer ?? "",
    item.review?.reviewerKind ?? "",
    item.review?.aiConfidence ?? "",
    item.review?.reviewMethodVersion ?? "",
    item.review?.reviewedAt ?? "",
  ]);
  const csv = `\uFEFF${[
    headers.map(spreadsheetSafeCsvCell).join(","),
    ...rows.map((row) => row.map(spreadsheetSafeCsvCell).join(",")),
  ].join("\r\n")}`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="academic-content-review-${view.toLowerCase()}-${date}.csv"`,
      "Cache-Control": "no-store",
      "X-Content-Items": String(rows.length),
    },
  });
}
