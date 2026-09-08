import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const ACADEMIC_SNAPSHOT_SCHEMA_VERSION = 2;

const EXCLUDED_SENSITIVE_TABLES = [
  "users",
  "accounts",
  "sessions",
  "password_reset_tokens",
  "quiz_attempts",
  "mock_exam_attempts",
  "admission_mock_attempts",
  "focus_sessions",
  "native_devices",
  "native_push_deliveries",
  "push_subscriptions",
  "audit_logs",
  "chat_messages",
  "academic_content_reports",
] as const;

const FORBIDDEN_KEYS = new Set([
  "passwordHash",
  "sessionToken",
  "accessToken",
  "refreshToken",
  "privateKey",
  "fcmToken",
  "email",
  "actorEmail",
  "ipAddress",
]);

interface SnapshotData {
  subjects: unknown[];
  chapters: unknown[];
  topics: unknown[];
  coreMcq: unknown[];
  admissionMcq: unknown[];
  cq: unknown[];
  badges: unknown[];
  contentReviews: unknown[];
  contentReviewRevisions: unknown[];
  aiReviewBatches: unknown[];
  aiReviewRuns: unknown[];
}

export interface AcademicContentSnapshot {
  schemaVersion: number;
  generatedAt: string;
  source: {
    application: "HSC Ultimate";
    purpose: "academic-content-disaster-recovery";
    sensitiveTablesExcluded: readonly string[];
  };
  counts: Record<keyof SnapshotData, number>;
  data: SnapshotData;
  checksum: {
    algorithm: "sha256";
    canonicalPayload: "schemaVersion+counts+data";
    value: string;
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    );
  }
  return value ?? null;
}

export function academicSnapshotChecksum(input: {
  schemaVersion: number;
  counts: Record<string, number>;
  data: unknown;
}): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(input)))
    .digest("hex");
}

export async function buildAcademicContentSnapshot(): Promise<AcademicContentSnapshot> {
  const [
    subjects,
    chapters,
    topics,
    coreMcq,
    admissionMcq,
    cq,
    badges,
    contentReviews,
    contentReviewRevisions,
    aiReviewBatches,
    aiReviewRuns,
  ] = await Promise.all([
    prisma.subject.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] }),
    prisma.chapter.findMany({ orderBy: [{ subjectId: "asc" }, { order: "asc" }, { id: "asc" }] }),
    prisma.topic.findMany({
      orderBy: [{ chapterId: "asc" }, { order: "asc" }, { id: "asc" }],
      select: {
        id: true,
        chapterId: true,
        name: true,
        nameEn: true,
        order: true,
        isImportant: true,
        videoUrl: true,
        notesMarkdown: true,
        formulaSheet: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.question.findMany({ orderBy: { id: "asc" } }),
    prisma.admissionQuestion.findMany({ orderBy: { id: "asc" } }),
    prisma.cQQuestion.findMany({ orderBy: { id: "asc" } }),
    prisma.badge.findMany({ orderBy: { id: "asc" } }),
    prisma.contentReview.findMany({
      orderBy: [{ targetType: "asc" }, { targetId: "asc" }],
      select: {
        id: true,
        targetType: true,
        targetId: true,
        status: true,
        reviewerKind: true,
        reviewNote: true,
        sourceUrl: true,
        contentHash: true,
        aiConfidence: true,
        aiEvidence: true,
        reviewMethodVersion: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.contentReviewRevision.findMany({
      orderBy: [{ reviewId: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        reviewId: true,
        status: true,
        contentHash: true,
        reviewerKind: true,
        reviewNote: true,
        sourceUrl: true,
        aiConfidence: true,
        aiEvidence: true,
        reviewMethodVersion: true,
        createdAt: true,
      },
    }),
    prisma.aIReviewBatch.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
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
        providers: true,
        confidenceThreshold: true,
        lastErrorCode: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.aIContentReviewRun.findMany({
      orderBy: [{ batchId: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        batchId: true,
        targetType: true,
        targetId: true,
        contentHash: true,
        provider: true,
        model: true,
        verdict: true,
        confidence: true,
        answerFingerprint: true,
        rationale: true,
        issues: true,
        sourceRequired: true,
        responseHash: true,
        createdAt: true,
      },
    }),
  ]);

  const data: SnapshotData = {
    subjects,
    chapters,
    topics,
    coreMcq,
    admissionMcq,
    cq,
    badges,
    contentReviews,
    contentReviewRevisions,
    aiReviewBatches,
    aiReviewRuns,
  };
  const counts = Object.fromEntries(
    Object.entries(data).map(([key, rows]) => [key, rows.length])
  ) as Record<keyof SnapshotData, number>;
  const checksumValue = academicSnapshotChecksum({
    schemaVersion: ACADEMIC_SNAPSHOT_SCHEMA_VERSION,
    counts,
    data,
  });

  return {
    schemaVersion: ACADEMIC_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      application: "HSC Ultimate",
      purpose: "academic-content-disaster-recovery",
      sensitiveTablesExcluded: EXCLUDED_SENSITIVE_TABLES,
    },
    counts,
    data,
    checksum: {
      algorithm: "sha256",
      canonicalPayload: "schemaVersion+counts+data",
      value: checksumValue,
    },
  };
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function collectForbiddenKeys(value: unknown, path = "root", found: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectForbiddenKeys(entry, `${path}[${index}]`, found));
    return found;
  }
  const record = objectRecord(value);
  if (!record) return found;
  for (const [key, nested] of Object.entries(record)) {
    if (FORBIDDEN_KEYS.has(key)) found.push(`${path}.${key}`);
    collectForbiddenKeys(nested, `${path}.${key}`, found);
  }
  return found;
}

export function verifyAcademicContentSnapshot(snapshot: unknown): {
  valid: boolean;
  checksumValid: boolean;
  issues: string[];
  counts: Record<string, number>;
} {
  const issues: string[] = [];
  const root = objectRecord(snapshot);
  if (!root) return { valid: false, checksumValid: false, issues: ["Snapshot root object নয়"], counts: {} };
  const schemaVersion = Number(root.schemaVersion);
  if (schemaVersion !== ACADEMIC_SNAPSHOT_SCHEMA_VERSION) {
    issues.push(`Unsupported schemaVersion: ${schemaVersion}`);
  }
  const data = objectRecord(root.data);
  const declaredCounts = objectRecord(root.counts);
  const checksum = objectRecord(root.checksum);
  if (!data || !declaredCounts || !checksum) {
    issues.push("Snapshot data/counts/checksum অনুপস্থিত");
    return { valid: false, checksumValid: false, issues, counts: {} };
  }

  const requiredSections: Array<keyof SnapshotData> = [
    "subjects", "chapters", "topics", "coreMcq", "admissionMcq",
    "cq", "badges", "contentReviews", "contentReviewRevisions",
    "aiReviewBatches", "aiReviewRuns",
  ];
  const actualCounts: Record<string, number> = {};
  for (const section of requiredSections) {
    const rows = data[section];
    if (!Array.isArray(rows)) {
      issues.push(`${section} array নয়`);
      actualCounts[section] = 0;
      continue;
    }
    actualCounts[section] = rows.length;
    if (Number(declaredCounts[section]) !== rows.length) {
      issues.push(`${section} count mismatch`);
    }
  }

  const expectedChecksum = academicSnapshotChecksum({
    schemaVersion,
    counts: Object.fromEntries(
      Object.entries(declaredCounts).map(([key, value]) => [key, Number(value)])
    ),
    data,
  });
  const checksumValid = checksum.value === expectedChecksum;
  if (!checksumValid) issues.push("SHA-256 checksum mismatch");

  const forbidden = collectForbiddenKeys(data);
  if (forbidden.length > 0) {
    issues.push(`Forbidden sensitive keys: ${forbidden.slice(0, 10).join(", ")}`);
  }

  const ids = (section: keyof SnapshotData) => new Set(
    (Array.isArray(data[section]) ? data[section] : [])
      .map((row) => objectRecord(row)?.id)
      .filter((id): id is string => typeof id === "string")
  );
  const subjectIds = ids("subjects");
  const chapterIds = ids("chapters");
  const topicIds = ids("topics");
  const coreIds = ids("coreMcq");
  const admissionIds = ids("admissionMcq");
  const cqIds = ids("cq");
  const reviewIds = ids("contentReviews");
  const aiBatchIds = ids("aiReviewBatches");

  for (const chapter of Array.isArray(data.chapters) ? data.chapters : []) {
    const row = objectRecord(chapter);
    if (row && typeof row.subjectId === "string" && !subjectIds.has(row.subjectId)) {
      issues.push(`Chapter ${row.id} unknown subjectId`);
    }
  }
  for (const topic of Array.isArray(data.topics) ? data.topics : []) {
    const row = objectRecord(topic);
    if (row && typeof row.chapterId === "string" && !chapterIds.has(row.chapterId)) {
      issues.push(`Topic ${row.id} unknown chapterId`);
    }
  }
  for (const question of Array.isArray(data.coreMcq) ? data.coreMcq : []) {
    const row = objectRecord(question);
    if (row && typeof row.topicId === "string" && !topicIds.has(row.topicId)) {
      issues.push(`Question ${row.id} unknown topicId`);
    }
  }
  for (const question of Array.isArray(data.cq) ? data.cq : []) {
    const row = objectRecord(question);
    if (row && typeof row.topicId === "string" && !topicIds.has(row.topicId)) {
      issues.push(`CQ ${row.id} unknown topicId`);
    }
  }
  for (const review of Array.isArray(data.contentReviews) ? data.contentReviews : []) {
    const row = objectRecord(review);
    if (!row || typeof row.targetType !== "string" || typeof row.targetId !== "string") continue;
    const exists = row.targetType === "CORE_MCQ" ? coreIds.has(row.targetId) :
      row.targetType === "ADMISSION_MCQ" ? admissionIds.has(row.targetId) :
        row.targetType === "CQ" ? cqIds.has(row.targetId) : topicIds.has(row.targetId);
    if (!exists) issues.push(`Review ${row.id} unknown target`);
  }
  for (const revision of Array.isArray(data.contentReviewRevisions) ? data.contentReviewRevisions : []) {
    const row = objectRecord(revision);
    if (row && typeof row.reviewId === "string" && !reviewIds.has(row.reviewId)) {
      issues.push(`Review revision ${row.id} unknown reviewId`);
    }
  }
  for (const run of Array.isArray(data.aiReviewRuns) ? data.aiReviewRuns : []) {
    const row = objectRecord(run);
    if (row && typeof row.batchId === "string" && !aiBatchIds.has(row.batchId)) {
      issues.push(`AI review run ${row.id} unknown batchId`);
    }
  }

  return {
    valid: issues.length === 0,
    checksumValid,
    issues,
    counts: actualCounts,
  };
}
