import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { runAIAcademicReviewBatch } from "@/lib/ai-academic-review";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const schema = z.object({
  limit: z.number().int().min(1).max(10).default(3),
  targetType: z.enum(["CORE_MCQ", "ADMISSION_MCQ", "CQ", "TOPIC_NOTE"]).optional(),
  apply: z.boolean().default(true),
});

async function guard(request: Request) {
  const denied = await requireAdmin();
  if (denied) return { denied } as const;
  const session = await auth();
  if (!session?.user?.id) {
    return { denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:content-quality:ai-review", session.user.id)
  );
  if (limited) return { denied: limited } as const;
  return { session } as const;
}

export async function GET(request: Request) {
  const checked = await guard(request);
  if ("denied" in checked) return checked.denied;
  const batches = await prisma.aIReviewBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      status: true,
      targetType: true,
      requestedCount: true,
      processedCount: true,
      approvedCount: true,
      flaggedCount: true,
      conflictCount: true,
      errorCount: true,
      methodVersion: true,
      startedAt: true,
      completedAt: true,
    },
  });
  return NextResponse.json({ batches }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const checked = await guard(request);
  if ("denied" in checked) return checked.denied;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "AI review config সঠিক নয়" },
      { status: 400 }
    );
  }
  const result = await runAIAcademicReviewBatch({
    ...parsed.data,
    initiatedById: checked.session.user.id,
  });
  return NextResponse.json(result, { status: parsed.data.apply ? 201 : 200 });
}
