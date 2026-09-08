// ===================================================================
// Admin: paginated Content Report moderation queue
// GET /api/admin/reports?status=PENDING|RESOLVED|DISMISSED&page=1&pageSize=20
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "RESOLVED", "DISMISSED"] as const;

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const statusParam = req.nextUrl.searchParams.get("status");
  const status = VALID_STATUSES.find((value) => value === statusParam);
  const requestedPage = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const requestedPageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? "20");
  const page = Number.isSafeInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = Number.isSafeInteger(requestedPageSize)
    ? Math.min(50, Math.max(1, requestedPageSize))
    : 20;
  const where = status ? { status } : undefined;

  const [totalItems, reports] = await prisma.$transaction([
    prisma.contentReport.count({ where }),
    prisma.contentReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
        post: { select: { id: true, title: true, content: true, userId: true } },
        reply: {
          select: {
            id: true,
            content: true,
            userId: true,
            postId: true,
            post: { select: { title: true } },
          },
        },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return NextResponse.json(
    {
      reports,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
