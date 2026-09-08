// ===================================================================
// Admin: Audit Log Viewer — সব admin action এর ইতিহাস
// GET /api/admin/audit-log?action=&page=&pageSize=
// -------------------------------------------------------------------
// আগে থেকেই `lib/audit-log.ts` এর `logAuditEvent()` দিয়ে প্রতিটা
// sensitive admin action (role change, delete, ban, broadcast ইত্যাদি)
// DB তে (AuditLog মডেল) লগ হচ্ছিল, কিন্তু সেটা দেখার কোনো UI/API ছিল
// না। এই এন্ডপয়েন্ট সম্পূর্ণ schema-free (কোনো নতুন migration লাগেনি,
// AuditLog মডেল আগে থেকেই ছিল) — শুধু read করার সুবিধা যোগ করা হলো।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { parsePaginationParam } from "@/lib/pagination-validation";

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  // 🐛 বাগ ফিক্স: `?page=1e300` বা `?page=99999999999999999999`-এর মতো
  // extreme মান আগে Prisma `skip`-এ গিয়ে ৫০০ ক্র্যাশ করাত (64-bit
  // integer সীমার বাইরে) — এখন safe-integer চেক করে fallback করে।
  const page = parsePaginationParam(searchParams.get("page"), 1, { min: 1 });
  const pageSize = parsePaginationParam(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE, {
    min: 1,
    max: MAX_PAGE_SIZE,
  });

  const where: Prisma.AuditLogWhereInput = {};
  if (action && action !== "ALL") {
    where.action = action;
  }

  const [logs, totalCount, distinctActions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
    // Distinct action dictionary is aggregated in PostgreSQL; no full AuditLog
    // rows are transferred to the server process.
    prisma.auditLog.groupBy({
      by: ["action"],
      orderBy: { action: "asc" },
    }),
  ]);

  return NextResponse.json({
    logs,
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    availableActions: distinctActions.map((a) => a.action),
  });
}
