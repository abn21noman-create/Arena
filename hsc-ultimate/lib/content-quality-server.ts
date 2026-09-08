import { prisma } from "@/lib/prisma";
import {
  assessCqQuality,
  assessMcqQuality,
  assessTopicNoteQuality,
  academicContentHash,
  contentRiskScore,
  duplicateKey,
  isReviewHashCurrent,
  normalizeAcademicText,
  type ContentQualityRisk,
} from "@/lib/content-quality";

export type ReviewTargetType = "CORE_MCQ" | "ADMISSION_MCQ" | "CQ" | "TOPIC_NOTE";
export type ReviewStatus = "APPROVED" | "NEEDS_CORRECTION" | "REJECTED" | "AI_CONFLICT" | "SOURCE_REQUIRED";
export type QualityQueueView = "ATTENTION" | "REPORTED" | "UNREVIEWED" | "REVIEWED" | "STALE" | "ALL";

export interface ContentQualityQueueItem {
  targetType: ReviewTargetType;
  targetId: string;
  context: string;
  title: string;
  preview: string;
  details: Record<string, unknown>;
  contentHash: string;
  risks: ContentQualityRisk[];
  riskScore: number;
  studentReports: Array<{
    id: string;
    reason: string;
    details: string | null;
    status: "PENDING" | "RESOLVED" | "DISMISSED";
    contentHash: string;
    stale: boolean;
    reporter: string;
    createdAt: string;
    resolutionNote: string | null;
    reviewedAt: string | null;
    reviewer: string | null;
  }>;
  review: {
    status: ReviewStatus;
    reviewNote: string | null;
    sourceUrl: string | null;
    reviewedAt: string;
    reviewer: string;
    reviewerKind: "ADMIN" | "AI";
    aiConfidence: number | null;
    aiEvidence: unknown;
    reviewMethodVersion: string | null;
    contentHash: string | null;
    stale: boolean;
    history: Array<{
      status: ReviewStatus;
      contentHash: string;
      reviewNote: string | null;
      sourceUrl: string | null;
      reviewer: string;
      reviewerKind: "ADMIN" | "AI";
      aiConfidence: number | null;
      reviewMethodVersion: string | null;
      createdAt: string;
    }>;
  } | null;
}

function jsonOptions(value: unknown): string[] {
  return Array.isArray(value) ? value.map((option) => String(option)) : [];
}

function addDuplicateRisk(
  items: ContentQualityQueueItem[],
  code: "EXACT_DUPLICATE" | "CROSS_CONTEXT_DUPLICATE",
  groups: Map<string, ContentQualityQueueItem[]>
) {
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const contexts = new Set(group.map((item) => item.context));
    if (code === "CROSS_CONTEXT_DUPLICATE" && contexts.size < 2) continue;
    for (const item of group) {
      if (item.risks.some((risk) => risk.code === code)) continue;
      item.risks.push({
        code,
        severity: code === "EXACT_DUPLICATE" ? "BLOCKER" : "WARNING",
        field: "text",
        message: code === "EXACT_DUPLICATE"
          ? "একই context-এ exact duplicate content"
          : "একই text একাধিক curriculum context-এ আছে; Admin review দরকার",
      });
      item.riskScore = contentRiskScore(item.risks);
    }
  }
}

export async function buildContentQualitySnapshot(input: {
  targetType?: ReviewTargetType;
  view?: QualityQueueView;
  search?: string;
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
} = {}) {
  const [core, admission, cq, topics, reviews, academicReports] = await Promise.all([
    prisma.question.findMany({
      select: {
        id: true,
        text: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        difficulty: true,
        boardYear: true,
        boardName: true,
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { subject: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.admissionQuestion.findMany({
      select: {
        id: true,
        examType: true,
        subject: true,
        text: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        difficulty: true,
      },
    }),
    prisma.cQQuestion.findMany({
      select: {
        id: true,
        stimulus: true,
        questionA: true,
        questionB: true,
        questionC: true,
        questionD: true,
        modelAnswerA: true,
        modelAnswerB: true,
        modelAnswerC: true,
        modelAnswerD: true,
        boardYear: true,
        boardName: true,
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { subject: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        nameEn: true,
        notesMarkdown: true,
        formulaSheet: true,
        updatedAt: true,
        chapter: { select: { subject: { select: { name: true } } } },
      },
    }),
    prisma.contentReview.findMany({
      include: {
        reviewer: { select: { name: true } },
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { reviewer: { select: { name: true } } },
        },
      },
    }),
    prisma.academicContentReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 5_000,
      include: {
        user: { select: { name: true } },
        reviewedBy: { select: { name: true } },
      },
    }),
  ]);

  const reviewMap = new Map(
    reviews.map((review) => [
      `${review.targetType}:${review.targetId}`,
      {
        status: review.status as ReviewStatus,
        reviewNote: review.reviewNote,
        sourceUrl: review.sourceUrl,
        reviewedAt: review.reviewedAt.toISOString(),
        reviewer: review.reviewerKind === "AI" ? "Multi-AI consensus" : (review.reviewer?.name ?? "Former admin"),
        reviewerKind: review.reviewerKind,
        aiConfidence: review.aiConfidence,
        aiEvidence: review.aiEvidence,
        reviewMethodVersion: review.reviewMethodVersion,
        contentHash: review.contentHash,
        history: review.revisions.map((revision) => ({
          status: revision.status as ReviewStatus,
          contentHash: revision.contentHash,
          reviewNote: revision.reviewNote,
          sourceUrl: revision.sourceUrl,
          reviewer: revision.reviewerKind === "AI" ? "Multi-AI consensus" : (revision.reviewer?.name ?? "Former admin"),
          reviewerKind: revision.reviewerKind,
          aiConfidence: revision.aiConfidence,
          reviewMethodVersion: revision.reviewMethodVersion,
          createdAt: revision.createdAt.toISOString(),
        })),
      },
    ])
  );
  const resolveReview = (key: string, currentHash: string) => {
    const review = reviewMap.get(key);
    return review
      ? { ...review, stale: !isReviewHashCurrent(review.contentHash, currentHash) }
      : null;
  };
  const reportMap = new Map<string, ContentQualityQueueItem["studentReports"]>();
  for (const report of academicReports) {
    const key = `${report.targetType}:${report.targetId}`;
    const existing = reportMap.get(key) ?? [];
    if (existing.length >= 20) continue;
    existing.push({
      id: report.id,
      reason: report.reason,
      details: report.details,
      status: report.status,
      contentHash: report.contentHash,
      stale: false,
      reporter: report.user.name,
      createdAt: report.createdAt.toISOString(),
      resolutionNote: report.resolutionNote,
      reviewedAt: report.reviewedAt?.toISOString() ?? null,
      reviewer: report.reviewedBy?.name ?? null,
    });
    reportMap.set(key, existing);
  }
  const resolveReports = (key: string, currentHash: string) =>
    (reportMap.get(key) ?? []).map((report) => ({
      ...report,
      stale: report.contentHash !== currentHash,
    }));
  const items: ContentQualityQueueItem[] = [];

  for (const question of core) {
    const options = jsonOptions(question.options);
    const context = `${question.topic.chapter.subject.name} · ${question.topic.name}`;
    const risks = assessMcqQuality({ ...question, options: question.options });
    const contentHash = academicContentHash("CORE_MCQ", {
      topicId: question.topic.id,
      text: question.text,
      options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      boardYear: question.boardYear,
      boardName: question.boardName,
    });
    items.push({
      targetType: "CORE_MCQ",
      targetId: question.id,
      context,
      title: question.text,
      preview: question.explanation ?? "",
      details: {
        options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        boardYear: question.boardYear,
        boardName: question.boardName,
        topicId: question.topic.id,
      },
      contentHash,
      risks,
      riskScore: contentRiskScore(risks),
      studentReports: resolveReports(`CORE_MCQ:${question.id}`, contentHash),
      review: resolveReview(`CORE_MCQ:${question.id}`, contentHash),
    });
  }

  for (const question of admission) {
    const options = jsonOptions(question.options);
    const context = `${question.examType} · ${question.subject}`;
    const risks = assessMcqQuality({ ...question, options: question.options });
    const contentHash = academicContentHash("ADMISSION_MCQ", {
      examType: question.examType,
      subject: question.subject,
      text: question.text,
      options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
    });
    items.push({
      targetType: "ADMISSION_MCQ",
      targetId: question.id,
      context,
      title: question.text,
      preview: question.explanation ?? "",
      details: {
        options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
      },
      contentHash,
      risks,
      riskScore: contentRiskScore(risks),
      studentReports: resolveReports(`ADMISSION_MCQ:${question.id}`, contentHash),
      review: resolveReview(`ADMISSION_MCQ:${question.id}`, contentHash),
    });
  }

  for (const question of cq) {
    const context = `${question.topic.chapter.subject.name} · ${question.topic.name}`;
    const risks = assessCqQuality(question);
    const contentHash = academicContentHash("CQ", {
      topicId: question.topic.id,
      stimulus: question.stimulus,
      questionA: question.questionA,
      questionB: question.questionB,
      questionC: question.questionC,
      questionD: question.questionD,
      modelAnswerA: question.modelAnswerA,
      modelAnswerB: question.modelAnswerB,
      modelAnswerC: question.modelAnswerC,
      modelAnswerD: question.modelAnswerD,
      boardYear: question.boardYear,
      boardName: question.boardName,
    });
    items.push({
      targetType: "CQ",
      targetId: question.id,
      context,
      title: question.stimulus.slice(0, 180),
      preview: `${question.questionA} ${question.questionB}`,
      details: {
        stimulus: question.stimulus,
        questions: [question.questionA, question.questionB, question.questionC, question.questionD],
        modelAnswers: [question.modelAnswerA, question.modelAnswerB, question.modelAnswerC, question.modelAnswerD],
        boardYear: question.boardYear,
        boardName: question.boardName,
      },
      contentHash,
      risks,
      riskScore: contentRiskScore(risks),
      studentReports: resolveReports(`CQ:${question.id}`, contentHash),
      review: resolveReview(`CQ:${question.id}`, contentHash),
    });
  }

  for (const topic of topics) {
    const context = `${topic.chapter.subject.name} · ${topic.name}`;
    const risks = assessTopicNoteQuality(topic.notesMarkdown);
    const contentHash = academicContentHash("TOPIC_NOTE", {
      topicName: topic.name,
      topicNameEn: topic.nameEn,
      notesMarkdown: topic.notesMarkdown,
      formulaSheet: topic.formulaSheet,
    });
    items.push({
      targetType: "TOPIC_NOTE",
      targetId: topic.id,
      context,
      title: topic.name,
      preview: topic.notesMarkdown?.slice(0, 800) ?? "",
      details: {
        notesPreview: topic.notesMarkdown?.slice(0, 2_000) ?? null,
        formulaPreview: topic.formulaSheet?.slice(0, 1_000) ?? null,
        updatedAt: topic.updatedAt,
      },
      contentHash,
      risks,
      riskScore: contentRiskScore(risks),
      studentReports: resolveReports(`TOPIC_NOTE:${topic.id}`, contentHash),
      review: resolveReview(`TOPIC_NOTE:${topic.id}`, contentHash),
    });
  }

  const sameContextGroups = new Map<string, ContentQualityQueueItem[]>();
  const globalTextGroups = new Map<string, ContentQualityQueueItem[]>();
  for (const item of items.filter((entry) =>
    entry.targetType === "CORE_MCQ" || entry.targetType === "ADMISSION_MCQ"
  )) {
    const contextKey = duplicateKey(`${item.targetType}:${item.context}`, item.title);
    sameContextGroups.set(contextKey, [...(sameContextGroups.get(contextKey) ?? []), item]);
    const globalKey = `${item.targetType}:${normalizeAcademicText(item.title)}`;
    globalTextGroups.set(globalKey, [...(globalTextGroups.get(globalKey) ?? []), item]);
  }
  addDuplicateRisk(items, "EXACT_DUPLICATE", sameContextGroups);
  addDuplicateRisk(items, "CROSS_CONTEXT_DUPLICATE", globalTextGroups);

  const statusCounts = {
    approved: items.filter((item) => item.review?.status === "APPROVED" && !item.review.stale).length,
    needsCorrection: items.filter((item) => item.review?.status === "NEEDS_CORRECTION" && !item.review.stale).length,
    rejected: items.filter((item) => item.review?.status === "REJECTED" && !item.review.stale).length,
    aiConflict: items.filter((item) => item.review?.status === "AI_CONFLICT" && !item.review.stale).length,
    sourceRequired: items.filter((item) => item.review?.status === "SOURCE_REQUIRED" && !item.review.stale).length,
    aiApproved: items.filter((item) => item.review?.status === "APPROVED" && item.review.reviewerKind === "AI" && !item.review.stale).length,
    adminApproved: items.filter((item) => item.review?.status === "APPROVED" && item.review.reviewerKind === "ADMIN" && !item.review.stale).length,
  };
  const staleReviews = items.filter((item) => item.review?.stale).length;
  const reviewedCount = statusCounts.approved + statusCounts.needsCorrection + statusCounts.rejected + statusCounts.aiConflict + statusCounts.sourceRequired;
  const summary = {
    total: items.length,
    byType: {
      coreMcq: core.length,
      admissionMcq: admission.length,
      cq: cq.length,
      topicNote: topics.length,
    },
    reviewed: reviewedCount,
    unreviewed: items.length - reviewedCount,
    ...statusCounts,
    staleReviews,
    studentReportsTotal: academicReports.length,
    studentReportsPending: academicReports.filter((report) => report.status === "PENDING").length,
    studentReportsStale: items.flatMap((item) => item.studentReports).filter((report) => report.stale).length,
    automatedRiskItems: items.filter((item) => item.risks.length > 0).length,
    blockerItems: items.filter((item) => item.risks.some((risk) => risk.severity === "BLOCKER")).length,
    warningItems: items.filter((item) => item.risks.some((risk) => risk.severity === "WARNING")).length,
    exactDuplicateGroups: [...sameContextGroups.values()].filter((group) => group.length > 1).length,
    crossContextDuplicateGroups: [...globalTextGroups.values()].filter((group) =>
      group.length > 1 && new Set(group.map((item) => item.context)).size > 1
    ).length,
  };

  const view = input.view ?? "UNREVIEWED";
  const normalizedSearch = normalizeAcademicText(input.search ?? "").toLocaleLowerCase("bn-BD");
  let filtered = items.filter((item) => !input.targetType || item.targetType === input.targetType);
  if (view === "ATTENTION") {
    filtered = filtered.filter((item) =>
      item.risks.length > 0 ||
      item.review?.stale ||
      item.review?.status === "NEEDS_CORRECTION" ||
      item.review?.status === "REJECTED" ||
      item.review?.status === "AI_CONFLICT" ||
      item.review?.status === "SOURCE_REQUIRED" ||
      item.studentReports.some((report) => report.status === "PENDING")
    );
  } else if (view === "REPORTED") {
    filtered = filtered.filter((item) =>
      item.studentReports.some((report) => report.status === "PENDING")
    );
  } else if (view === "UNREVIEWED") {
    filtered = filtered.filter((item) => item.review === null || item.review.stale);
  } else if (view === "REVIEWED") {
    filtered = filtered.filter((item) => item.review !== null && !item.review.stale);
  } else if (view === "STALE") {
    filtered = filtered.filter((item) => item.review?.stale);
  }
  if (normalizedSearch) {
    filtered = filtered.filter((item) =>
      normalizeAcademicText(
        `${item.title} ${item.context} ${item.studentReports.map((report) => `${report.reason} ${report.details ?? ""} ${report.reporter}`).join(" ")}`
      ).toLocaleLowerCase("bn-BD").includes(normalizedSearch)
    );
  }
  filtered.sort((left, right) =>
    Number(right.studentReports.some((report) => report.status === "PENDING")) -
      Number(left.studentReports.some((report) => report.status === "PENDING")) ||
    right.riskScore - left.riskScore ||
    Number(left.review !== null) - Number(right.review !== null) ||
    left.context.localeCompare(right.context, "bn-BD") ||
    left.title.localeCompare(right.title, "bn-BD")
  );

  const pageSizeLimit = Math.min(2_000, Math.max(1, input.maxPageSize ?? 50));
  const pageSize = Math.min(pageSizeLimit, Math.max(1, input.pageSize ?? 20));
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const page = Math.min(totalPages, Math.max(1, input.page ?? 1));
  const start = (page - 1) * pageSize;

  return {
    generatedAt: new Date().toISOString(),
    disclaimer: "Automated checks prioritize review only; they never establish factual correctness or auto-approve content.",
    summary,
    filters: { targetType: input.targetType ?? "ALL", view, search: input.search ?? "" },
    pagination: { page, pageSize, totalItems: totalFiltered, totalPages },
    items: filtered.slice(start, start + pageSize),
  };
}

export async function getContentReviewTargetHash(
  targetType: ReviewTargetType,
  targetId: string
): Promise<string | null> {
  if (targetType === "CORE_MCQ") {
    const item = await prisma.question.findUnique({
      where: { id: targetId },
      select: {
        topicId: true, text: true, options: true, correctAnswer: true,
        explanation: true, difficulty: true, boardYear: true, boardName: true,
      },
    });
    return item ? academicContentHash(targetType, { ...item, options: jsonOptions(item.options) }) : null;
  }
  if (targetType === "ADMISSION_MCQ") {
    const item = await prisma.admissionQuestion.findUnique({
      where: { id: targetId },
      select: {
        examType: true, subject: true, text: true, options: true,
        correctAnswer: true, explanation: true, difficulty: true,
      },
    });
    return item ? academicContentHash(targetType, { ...item, options: jsonOptions(item.options) }) : null;
  }
  if (targetType === "CQ") {
    const item = await prisma.cQQuestion.findUnique({
      where: { id: targetId },
      select: {
        topicId: true, stimulus: true, questionA: true, questionB: true,
        questionC: true, questionD: true, modelAnswerA: true, modelAnswerB: true,
        modelAnswerC: true, modelAnswerD: true, boardYear: true, boardName: true,
      },
    });
    return item ? academicContentHash(targetType, item) : null;
  }
  const item = await prisma.topic.findUnique({
    where: { id: targetId },
    select: { name: true, nameEn: true, notesMarkdown: true, formulaSheet: true },
  });
  return item ? academicContentHash(targetType, {
    topicName: item.name,
    topicNameEn: item.nameEn,
    notesMarkdown: item.notesMarkdown,
    formulaSheet: item.formulaSheet,
  }) : null;
}

export async function contentReviewTargetExists(
  targetType: ReviewTargetType,
  targetId: string
): Promise<boolean> {
  return (await getContentReviewTargetHash(targetType, targetId)) !== null;
}
