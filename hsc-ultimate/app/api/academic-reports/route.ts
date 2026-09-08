import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { protectApiRoute } from "@/lib/api-security";
import { getContentReviewTargetHash } from "@/lib/content-quality-server";
import {
  ACADEMIC_REPORT_REASONS,
  academicReportDetailsValid,
} from "@/lib/academic-report-policy";
import { prisma } from "@/lib/prisma";

const targetType = z.enum(["CORE_MCQ", "ADMISSION_MCQ", "CQ", "TOPIC_NOTE"]);
const reason = z.enum(ACADEMIC_REPORT_REASONS);
const reportSchema = z.object({
  targetType,
  targetId: z.string().trim().min(10).max(80),
  reason,
  details: z.string().trim().max(1_000).nullable().optional(),
}).superRefine((value, context) => {
  if (!academicReportDetailsValid(value.reason, value.details)) {
    context.addIssue({
      code: "custom",
      path: ["details"],
      message: "Other report-এর জন্য অন্তত ১০ অক্ষরে সমস্যাটি লিখুন",
    });
  }
});

export async function GET(request: Request) {
  const guard = await protectApiRoute(request, "read", "academic-report:list");
  if (!guard.ok) return guard.response;
  const reports = await prisma.academicContentReport.findMany({
    where: { userId: guard.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      targetType: true,
      reason: true,
      details: true,
      status: true,
      resolutionNote: true,
      createdAt: true,
      reviewedAt: true,
    },
  });
  return NextResponse.json({ reports }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const guard = await protectApiRoute(request, "create", "academic-report:create");
  if (!guard.ok) return guard.response;
  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Report data সঠিক নয়" },
      { status: 400 }
    );
  }

  const contentHash = await getContentReviewTargetHash(
    parsed.data.targetType,
    parsed.data.targetId
  );
  if (!contentHash) {
    return NextResponse.json({ error: "Academic content পাওয়া যায়নি" }, { status: 404 });
  }

  try {
    const report = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${guard.userId} FOR UPDATE`;
      const pending = await tx.academicContentReport.count({
        where: { userId: guard.userId, status: "PENDING" },
      });
      if (pending >= 50) throw new Error("PENDING_REPORT_LIMIT");
      const created = await tx.academicContentReport.create({
        data: {
          userId: guard.userId,
          targetType: parsed.data.targetType,
          targetId: parsed.data.targetId,
          contentHash,
          reason: parsed.data.reason,
          details: parsed.data.details?.trim() || null,
        },
        select: { id: true, status: true, createdAt: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: guard.userId,
          action: "ACADEMIC_CONTENT_REPORTED",
          targetType: parsed.data.targetType,
          targetId: parsed.data.targetId,
          metadata: { reason: parsed.data.reason, contentHash },
        },
      });
      return created;
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "এই content version-এর একই সমস্যা ইতিমধ্যে report করেছেন" },
        { status: 409 }
      );
    }
    if (error instanceof Error && error.message === "PENDING_REPORT_LIMIT") {
      return NextResponse.json(
        { error: "আপনার ৫০টি pending report আছে; review হওয়া পর্যন্ত অপেক্ষা করুন" },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "Academic report save হয়নি" }, { status: 503 });
  }
}
