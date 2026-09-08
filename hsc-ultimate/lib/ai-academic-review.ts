import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  getIndependentAIResponses,
  type AIProviderResult,
  type ChatMessage,
} from "@/lib/ai-provider";
import {
  buildContentQualitySnapshot,
  type ContentQualityQueueItem,
  type ReviewTargetType,
} from "@/lib/content-quality-server";
import { normalizeAcademicText } from "@/lib/content-quality";
import { prisma } from "@/lib/prisma";

export const AI_ACADEMIC_REVIEW_METHOD_VERSION = "multi-ai-consensus-v1";
export const AI_ACADEMIC_APPROVAL_THRESHOLD = 0.92;

const providerReviewSchema = z.object({
  verdict: z.enum(["APPROVE", "NEEDS_CORRECTION", "SOURCE_REQUIRED"]),
  confidence: z.number().min(0).max(1),
  expectedAnswer: z.string().trim().max(512).nullable(),
  rationale: z.string().trim().min(10).max(2_000),
  issues: z.array(z.string().trim().min(1).max(500)).max(12),
  sourceRequired: z.boolean(),
});

export type AIProviderAcademicReview = z.infer<typeof providerReviewSchema> & {
  provider: AIProviderResult["provider"];
  model: string;
  responseHash: string;
};

export type AIConsensusVerdict =
  | "APPROVE"
  | "NEEDS_CORRECTION"
  | "SOURCE_REQUIRED"
  | "CONFLICT"
  | "ERROR";

export interface AIReviewConsensus {
  verdict: AIConsensusVerdict;
  confidence: number;
  rationale: string;
  reviews: AIProviderAcademicReview[];
}

function extractJson(content: string) {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI_REVIEW_JSON_MISSING");
  return JSON.parse(match[0]);
}

function answerFingerprint(value: string | null | undefined) {
  return value ? normalizeAcademicText(value).toLocaleLowerCase("bn-BD").slice(0, 512) : null;
}

export function parseProviderAcademicReview(
  response: AIProviderResult
): AIProviderAcademicReview {
  const parsed = providerReviewSchema.parse(extractJson(response.content));
  return {
    ...parsed,
    expectedAnswer: parsed.expectedAnswer?.slice(0, 512) ?? null,
    provider: response.provider,
    model: response.model,
    responseHash: createHash("sha256").update(response.content).digest("hex"),
  };
}

function sourceEvidenceRequired(
  item: Pick<ContentQualityQueueItem, "details" | "studentReports">
) {
  return Boolean(
    item.details.boardYear ||
    item.details.boardName ||
    item.studentReports.some(
      (report) => report.status === "PENDING" && report.reason === "OUTDATED_SOURCE"
    )
  );
}

export function deriveAIReviewConsensus(
  item: Pick<ContentQualityQueueItem, "targetType" | "details" | "risks" | "studentReports">,
  reviews: AIProviderAcademicReview[],
  threshold = AI_ACADEMIC_APPROVAL_THRESHOLD
): AIReviewConsensus {
  if (reviews.length < 2) {
    return {
      verdict: "ERROR",
      confidence: reviews[0]?.confidence ?? 0,
      rationale: "দুটি independent AI provider response পাওয়া যায়নি",
      reviews,
    };
  }

  const confidence = Math.min(...reviews.map((review) => review.confidence));
  const verdicts = new Set(reviews.map((review) => review.verdict));
  if (verdicts.size !== 1) {
    return { verdict: "CONFLICT", confidence, rationale: "AI provider verdict এক নয়", reviews };
  }
  if (sourceEvidenceRequired(item) || reviews.some((review) => review.sourceRequired)) {
    return {
      verdict: "SOURCE_REQUIRED",
      confidence,
      rationale: "Current board/year/source claim-এর জন্য external provenance দরকার",
      reviews,
    };
  }
  if (reviews[0].verdict === "SOURCE_REQUIRED") {
    return { verdict: "SOURCE_REQUIRED", confidence, rationale: "AI providers source evidence চেয়েছে", reviews };
  }
  if (reviews[0].verdict === "NEEDS_CORRECTION") {
    return {
      verdict: "NEEDS_CORRECTION",
      confidence,
      rationale: reviews.map((review) => review.rationale).join(" | ").slice(0, 2_000),
      reviews,
    };
  }
  if (confidence < threshold) {
    return { verdict: "CONFLICT", confidence, rationale: "AI confidence threshold পূরণ হয়নি", reviews };
  }
  if (item.risks.length > 0) {
    return { verdict: "CONFLICT", confidence, rationale: "Automated structural warning/blocker unresolved", reviews };
  }
  if (item.studentReports.some((report) => report.status === "PENDING")) {
    return { verdict: "CONFLICT", confidence, rationale: "Pending student report unresolved", reviews };
  }

  if (item.targetType === "CORE_MCQ" || item.targetType === "ADMISSION_MCQ") {
    const fingerprints = reviews.map((review) => answerFingerprint(review.expectedAnswer));
    const stored = answerFingerprint(String(item.details.correctAnswer ?? ""));
    if (!stored || fingerprints.some((fingerprint) => !fingerprint) || new Set(fingerprints).size !== 1 || fingerprints[0] !== stored) {
      return {
        verdict: "CONFLICT",
        confidence,
        rationale: "AI expected answer stored correctAnswer-এর সঙ্গে exact agreement নয়",
        reviews,
      };
    }
  }
  if (reviews.some((review) => review.issues.length > 0)) {
    return { verdict: "CONFLICT", confidence, rationale: "AI issue list খালি নয়", reviews };
  }

  return {
    verdict: "APPROVE",
    confidence,
    rationale: "দুটি independent provider current content ও answer-এর সঙ্গে একমত",
    reviews,
  };
}

function promptFor(item: ContentQualityQueueItem): ChatMessage[] {
  const payload = JSON.stringify({
    targetType: item.targetType,
    context: item.context,
    title: item.title,
    details: item.details,
    contentHash: item.contentHash,
  });
  if (payload.length > 14_000) {
    throw new Error("AI_REVIEW_CONTENT_REQUIRES_CHUNKING");
  }
  return [
    {
      role: "system",
      content: `You are one independent academic reviewer for Bangladesh HSC content.
Review only the supplied content. Do not trust its claimed correct answer. Re-solve/check it.
If a current board rule, year-specific fact, admission rule, or unavailable external source is necessary, use SOURCE_REQUIRED.
APPROVE only when the content is factually and logically correct. Confidence is 0..1.
For MCQ, expectedAnswer must be the exact full option text you independently judge correct.
For CQ/note, expectedAnswer may be null. Never claim web browsing or a source you did not inspect.
Return JSON only:
{"verdict":"APPROVE|NEEDS_CORRECTION|SOURCE_REQUIRED","confidence":0.0,"expectedAnswer":"exact option or null","rationale":"Bangla concise evidence","issues":[],"sourceRequired":false}`,
    },
    { role: "user", content: payload },
  ];
}

function contentReviewStatus(verdict: AIConsensusVerdict) {
  if (verdict === "APPROVE") return "APPROVED" as const;
  if (verdict === "NEEDS_CORRECTION") return "NEEDS_CORRECTION" as const;
  if (verdict === "SOURCE_REQUIRED") return "SOURCE_REQUIRED" as const;
  return "AI_CONFLICT" as const;
}

function runVerdict(verdict: AIProviderAcademicReview["verdict"]) {
  return verdict === "APPROVE"
    ? "APPROVE" as const
    : verdict === "NEEDS_CORRECTION"
      ? "NEEDS_CORRECTION" as const
      : "SOURCE_REQUIRED" as const;
}

async function persistAIReview(input: {
  batchId: string;
  item: ContentQualityQueueItem;
  consensus: AIReviewConsensus;
}) {
  const { batchId, item, consensus } = input;
  const evidence = {
    methodVersion: AI_ACADEMIC_REVIEW_METHOD_VERSION,
    threshold: AI_ACADEMIC_APPROVAL_THRESHOLD,
    providers: consensus.reviews.map((review) => ({
      provider: review.provider,
      model: review.model,
      verdict: review.verdict,
      confidence: review.confidence,
      expectedAnswer: review.expectedAnswer,
      responseHash: review.responseHash,
      issues: review.issues,
    })),
    consensus: consensus.verdict,
  } satisfies Prisma.InputJsonObject;
  const status = contentReviewStatus(consensus.verdict);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    if (consensus.reviews.length > 0) {
      await tx.aIContentReviewRun.createMany({
        data: consensus.reviews.map((review) => ({
          batchId,
          targetType: item.targetType,
          targetId: item.targetId,
          contentHash: item.contentHash,
          provider: review.provider,
          model: review.model,
          verdict: runVerdict(review.verdict),
          confidence: review.confidence,
          answerFingerprint: answerFingerprint(review.expectedAnswer),
          rationale: review.rationale,
          issues: review.issues,
          sourceRequired: review.sourceRequired,
          responseHash: review.responseHash,
        })),
        skipDuplicates: true,
      });
    }
    if (consensus.verdict === "ERROR") return;

    const saved = await tx.contentReview.upsert({
      where: { targetType_targetId: { targetType: item.targetType, targetId: item.targetId } },
      create: {
        targetType: item.targetType,
        targetId: item.targetId,
        status,
        reviewerKind: "AI",
        reviewerId: null,
        reviewNote: consensus.rationale,
        sourceUrl: null,
        contentHash: item.contentHash,
        aiConfidence: consensus.confidence,
        aiEvidence: evidence,
        reviewMethodVersion: AI_ACADEMIC_REVIEW_METHOD_VERSION,
        reviewedAt: now,
      },
      update: {
        status,
        reviewerKind: "AI",
        reviewerId: null,
        reviewNote: consensus.rationale,
        sourceUrl: null,
        contentHash: item.contentHash,
        aiConfidence: consensus.confidence,
        aiEvidence: evidence,
        reviewMethodVersion: AI_ACADEMIC_REVIEW_METHOD_VERSION,
        reviewedAt: now,
      },
    });
    await tx.contentReviewRevision.create({
      data: {
        reviewId: saved.id,
        status,
        contentHash: item.contentHash,
        reviewNote: consensus.rationale,
        sourceUrl: null,
        reviewerKind: "AI",
        reviewerId: null,
        aiConfidence: consensus.confidence,
        aiEvidence: evidence,
        reviewMethodVersion: AI_ACADEMIC_REVIEW_METHOD_VERSION,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: null,
        actorName: "Multi-AI Review Engine",
        action: `AI_CONTENT_REVIEW_${status}`,
        targetType: item.targetType,
        targetId: item.targetId,
        metadata: {
          batchId,
          contentHash: item.contentHash,
          confidence: consensus.confidence,
          methodVersion: AI_ACADEMIC_REVIEW_METHOD_VERSION,
        },
      },
    });
  });
}

export async function runAIAcademicReviewBatch(input: {
  limit: number;
  targetType?: ReviewTargetType;
  initiatedById?: string | null;
  apply: boolean;
}) {
  const limit = Math.min(25, Math.max(1, input.limit));
  const snapshot = await buildContentQualitySnapshot({
    targetType: input.targetType,
    view: "ALL",
    page: 1,
    pageSize: 2_000,
    maxPageSize: 2_000,
  });
  const candidates = snapshot.items
    .filter((item) => item.review === null || item.review.stale)
    .sort((left, right) =>
      Number(left.studentReports.some((report) => report.status === "PENDING")) -
        Number(right.studentReports.some((report) => report.status === "PENDING")) ||
      left.riskScore - right.riskScore ||
      left.context.localeCompare(right.context, "bn-BD")
    )
    .slice(0, limit);

  const batch = input.apply
    ? await prisma.aIReviewBatch.create({
        data: {
          requestedCount: candidates.length,
          targetType: input.targetType,
          methodVersion: AI_ACADEMIC_REVIEW_METHOD_VERSION,
          providers: ["groq", "mistral", "cerebras", "openrouter"],
          confidenceThreshold: AI_ACADEMIC_APPROVAL_THRESHOLD,
          initiatedById: input.initiatedById ?? null,
        },
      })
    : null;

  const results: Array<{
    targetType: ReviewTargetType;
    targetId: string;
    contentHash: string;
    verdict: AIConsensusVerdict;
    confidence: number;
    providers: string[];
  }> = [];
  let approved = 0;
  let flagged = 0;
  let conflicts = 0;
  let errors = 0;

  for (const item of candidates) {
    let consensus: AIReviewConsensus;
    try {
      const responses = await getIndependentAIResponses(promptFor(item), 2, 1_200);
      const reviews = responses.flatMap((response) => {
        try {
          return [parseProviderAcademicReview(response)];
        } catch {
          return [];
        }
      });
      consensus = deriveAIReviewConsensus(item, reviews);
    } catch {
      consensus = { verdict: "ERROR", confidence: 0, rationale: "AI review pipeline failed", reviews: [] };
    }

    if (consensus.verdict === "APPROVE") approved += 1;
    else if (consensus.verdict === "NEEDS_CORRECTION" || consensus.verdict === "SOURCE_REQUIRED") flagged += 1;
    else if (consensus.verdict === "CONFLICT") conflicts += 1;
    else errors += 1;

    if (batch) await persistAIReview({ batchId: batch.id, item, consensus });
    results.push({
      targetType: item.targetType,
      targetId: item.targetId,
      contentHash: item.contentHash,
      verdict: consensus.verdict,
      confidence: consensus.confidence,
      providers: consensus.reviews.map((review) => review.provider),
    });
  }

  if (batch) {
    await prisma.aIReviewBatch.update({
      where: { id: batch.id },
      data: {
        status: errors === candidates.length && candidates.length > 0
          ? "FAILED"
          : errors > 0
            ? "PARTIAL"
            : "COMPLETED",
        processedCount: candidates.length,
        approvedCount: approved,
        flaggedCount: flagged,
        conflictCount: conflicts,
        errorCount: errors,
        lastErrorCode: errors > 0 ? "AI_REVIEW_ITEM_FAILED" : null,
        completedAt: new Date(),
      },
    });
  }

  return {
    batchId: batch?.id ?? null,
    apply: input.apply,
    requested: limit,
    candidates: candidates.length,
    approved,
    flagged,
    conflicts,
    errors,
    results,
  };
}
