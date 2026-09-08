import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import {
  buildContentQualitySnapshot,
  getContentReviewTargetHash,
} from "@/lib/content-quality-server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

const targetTypeSchema = z.enum(["CORE_MCQ", "ADMISSION_MCQ", "CQ", "TOPIC_NOTE"]);
const viewSchema = z.enum(["ATTENTION", "REPORTED", "UNREVIEWED", "REVIEWED", "STALE", "ALL"]);
const reviewStatusSchema = z.enum(["APPROVED", "NEEDS_CORRECTION", "REJECTED"]);
const reportDecisionSchema = z.object({
  reportId: z.string().cuid(),
  status: z.enum(["RESOLVED", "DISMISSED"]),
  resolutionNote: z.string().trim().min(10).max(2_000),
});

const reviewSchema = z.object({
  targetType: targetTypeSchema,
  targetId: z.string().trim().min(10).max(80),
  status: reviewStatusSchema,
  reviewNote: z.string().trim().max(2_000).nullable().optional(),
  sourceUrl: z.string().trim().url().max(2_048).nullable().optional(),
}).superRefine((value, context) => {
  const noteLength = value.reviewNote?.trim().length ?? 0;
  if (value.status !== "APPROVED" && noteLength < 10) {
    context.addIssue({
      code: "custom",
      path: ["reviewNote"],
      message: "Correction/rejection-এর জন্য অন্তত ১০ অক্ষরের note দরকার",
    });
  }
  if (value.status === "APPROVED" && noteLength < 10 && !value.sourceUrl) {
    context.addIssue({
      code: "custom",
      path: ["sourceUrl"],
      message: "Approval-এর জন্য review note অথবা source URL দরকার",
    });
  }
  if (value.sourceUrl) {
    try {
      if (new URL(value.sourceUrl).protocol !== "https:") {
        context.addIssue({
          code: "custom",
          path: ["sourceUrl"],
          message: "Source URL অবশ্যই HTTPS হতে হবে",
        });
      }
    } catch {
      // Base URL validation reports the malformed value.
    }
  }
});

async function adminGuard(request: Request) {
  const denied = await requireAdmin();
  if (denied) return { denied } as const;
  const session = await auth();
  if (!session?.user?.id) {
    return { denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:content-quality", session.user.id)
  );
  if (limited) return { denied: limited } as const;
  return { session } as const;
}

export async function GET(request: Request) {
  const guard = await adminGuard(request);
  if ("denied" in guard) return guard.denied;
  const params = new URL(request.url).searchParams;
  const targetType = targetTypeSchema.safeParse(params.get("targetType"));
  const view = viewSchema.safeParse(params.get("view"));
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "20");
  const snapshot = await buildContentQualitySnapshot({
    targetType: targetType.success ? targetType.data : undefined,
    view: view.success ? view.data : "UNREVIEWED",
    search: params.get("search")?.slice(0, 200) ?? "",
    page: Number.isSafeInteger(page) ? page : 1,
    pageSize: Number.isSafeInteger(pageSize) ? pageSize : 20,
  });
  return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const guard = await adminGuard(request);
  if ("denied" in guard) return guard.denied;
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Review data সঠিক নয়" },
      { status: 400 }
    );
  }
  const contentHash = await getContentReviewTargetHash(
    parsed.data.targetType,
    parsed.data.targetId
  );
  if (!contentHash) {
    return NextResponse.json({ error: "Review target পাওয়া যায়নি" }, { status: 404 });
  }

  const now = new Date();
  const review = await prisma.$transaction(async (tx) => {
    const saved = await tx.contentReview.upsert({
      where: {
        targetType_targetId: {
          targetType: parsed.data.targetType,
          targetId: parsed.data.targetId,
        },
      },
      create: {
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
        status: parsed.data.status,
        reviewerId: guard.session.user.id,
        reviewerKind: "ADMIN",
        aiConfidence: null,
        aiEvidence: Prisma.DbNull,
        reviewMethodVersion: null,
        reviewNote: parsed.data.reviewNote?.trim() || null,
        sourceUrl: parsed.data.sourceUrl || null,
        contentHash,
        reviewedAt: now,
      },
      update: {
        status: parsed.data.status,
        reviewerId: guard.session.user.id,
        reviewerKind: "ADMIN",
        aiConfidence: null,
        aiEvidence: Prisma.DbNull,
        reviewMethodVersion: null,
        reviewNote: parsed.data.reviewNote?.trim() || null,
        sourceUrl: parsed.data.sourceUrl || null,
        contentHash,
        reviewedAt: now,
      },
    });
    await tx.contentReviewRevision.create({
      data: {
        reviewId: saved.id,
        status: parsed.data.status,
        contentHash,
        reviewNote: parsed.data.reviewNote?.trim() || null,
        sourceUrl: parsed.data.sourceUrl || null,
        reviewerId: guard.session.user.id,
        reviewerKind: "ADMIN",
        aiConfidence: null,
        aiEvidence: Prisma.DbNull,
        reviewMethodVersion: null,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: guard.session.user.id,
        actorName: guard.session.user.name,
        actorEmail: guard.session.user.email,
        action: `CONTENT_REVIEW_${parsed.data.status}`,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
        metadata: {
          reviewStatus: parsed.data.status,
          hasReviewNote: Boolean(parsed.data.reviewNote?.trim()),
          hasSourceUrl: Boolean(parsed.data.sourceUrl),
        },
      },
    });
    return saved;
  });

  return NextResponse.json({
    review: {
      targetType: review.targetType,
      targetId: review.targetId,
      status: review.status,
      reviewNote: review.reviewNote,
      sourceUrl: review.sourceUrl,
      contentHash: review.contentHash,
      stale: false,
      reviewedAt: review.reviewedAt,
      reviewer: guard.session.user.name ?? "Admin",
    },
  });
}

export async function PATCH(request: Request) {
  const guard = await adminGuard(request);
  if ("denied" in guard) return guard.denied;
  const parsed = reportDecisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Report decision সঠিক নয়" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "academic_content_reports" WHERE id = ${parsed.data.reportId} FOR UPDATE`;
      const existing = await tx.academicContentReport.findUnique({
        where: { id: parsed.data.reportId },
        select: {
          id: true,
          userId: true,
          status: true,
          targetType: true,
          targetId: true,
          reason: true,
        },
      });
      if (!existing) throw new Error("REPORT_NOT_FOUND");
      if (existing.status !== "PENDING") throw new Error("REPORT_ALREADY_REVIEWED");
      const reviewedAt = new Date();
      const report = await tx.academicContentReport.update({
        where: { id: existing.id },
        data: {
          status: parsed.data.status,
          reviewedById: guard.session.user.id,
          reviewedAt,
          resolutionNote: parsed.data.resolutionNote,
        },
      });
      await tx.notification.create({
        data: {
          userId: existing.userId,
          title: parsed.data.status === "RESOLVED"
            ? "✅ Academic report resolve হয়েছে"
            : "ℹ️ Academic report review হয়েছে",
          body: parsed.data.resolutionNote.slice(0, 500),
          link: "/notifications",
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: guard.session.user.id,
          actorName: guard.session.user.name,
          actorEmail: guard.session.user.email,
          action: `ACADEMIC_REPORT_${parsed.data.status}`,
          targetType: existing.targetType,
          targetId: existing.targetId,
          metadata: {
            reportId: existing.id,
            reason: existing.reason,
            resolutionNotePresent: true,
          },
        },
      });
      return report;
    });
    return NextResponse.json({ report: result });
  } catch (error) {
    if (error instanceof Error && error.message === "REPORT_NOT_FOUND") {
      return NextResponse.json({ error: "Report পাওয়া যায়নি" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "REPORT_ALREADY_REVIEWED") {
      return NextResponse.json({ error: "Report ইতিমধ্যে review হয়েছে" }, { status: 409 });
    }
    return NextResponse.json({ error: "Report decision save হয়নি" }, { status: 503 });
  }
}
