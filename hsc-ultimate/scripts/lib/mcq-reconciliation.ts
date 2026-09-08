import type { PrismaClient } from "@prisma/client";
import {
  canonicalTopicKey,
  loadSourceMcqCatalog,
  mcqTextSimilarity,
  normalizeMcqText,
  questionContentFingerprint,
  questionIdentityFingerprint,
  stableFingerprint,
  validateMcqQuality,
  type McqQualityIssue,
  type SourceAdmissionQuestion,
  type SourceCoreQuestion,
} from "./mcq-catalog";

export interface TopicSnapshot {
  id: string;
  name: string;
  subjectName: string;
  subjectCode: string;
  paper: string;
  topicKey: string;
}

export interface ResolvedSourceCoreQuestion extends SourceCoreQuestion {
  topic: TopicSnapshot;
  identityFingerprint: string;
  contentFingerprint: string;
  qualityIssues: McqQualityIssue[];
}

export interface UnresolvedSourceCoreQuestion {
  question: SourceCoreQuestion;
  reason: string;
  candidateTopics: TopicSnapshot[];
}

export interface LiveCoreQuestion {
  id: string;
  topicId: string;
  topic: TopicSnapshot;
  text: string;
  options: string[];
  optionsRaw: unknown;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
  boardYear: number | null;
  boardName: string | null;
  identityFingerprint: string;
  contentFingerprint: string;
  qualityIssues: McqQualityIssue[];
}

export interface CoreContentDrift {
  source: ResolvedSourceCoreQuestion;
  live: LiveCoreQuestion;
  changedFields: string[];
}

export interface ExactTextDuplicateGroup<T> {
  normalizedText: string;
  entries: T[];
}

export interface NearDuplicatePair {
  topicKey: string;
  similarity: number;
  left: { text: string; identityFingerprint: string };
  right: { text: string; identityFingerprint: string };
}

export interface MissingCoreQuestion extends ResolvedSourceCoreQuestion {
  sameTextElsewhere: LiveCoreQuestion[];
  nearestInTopic: { text: string; similarity: number; identityFingerprint: string } | null;
}

export interface LiveAdmissionQuestion {
  id: string;
  examType: string;
  subject: string;
  text: string;
  options: string[];
  optionsRaw: unknown;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
  identityFingerprint: string;
  contentFingerprint: string;
  qualityIssues: McqQualityIssue[];
}

export interface SourceAdmissionSnapshot extends SourceAdmissionQuestion {
  identityFingerprint: string;
  contentFingerprint: string;
  qualityIssues: McqQualityIssue[];
}

export interface AdmissionContentDrift {
  source: SourceAdmissionSnapshot;
  live: LiveAdmissionQuestion;
  changedFields: string[];
}

export interface McqReconciliation {
  generatedAt: string;
  sourceByFile: Record<string, number>;
  topics: TopicSnapshot[];
  core: {
    sourceTotal: number;
    sourceResolved: ResolvedSourceCoreQuestion[];
    sourceUniqueIdentityCount: number;
    unresolved: UnresolvedSourceCoreQuestion[];
    liveTotal: number;
    liveUniqueIdentityCount: number;
    exactMatches: number;
    contentDrifts: CoreContentDrift[];
    missing: MissingCoreQuestion[];
    liveExtras: LiveCoreQuestion[];
    sourceIdentityDuplicates: ExactTextDuplicateGroup<ResolvedSourceCoreQuestion>[];
    sourceGlobalTextDuplicates: ExactTextDuplicateGroup<ResolvedSourceCoreQuestion>[];
    liveIdentityDuplicates: ExactTextDuplicateGroup<LiveCoreQuestion>[];
    liveGlobalTextDuplicates: ExactTextDuplicateGroup<LiveCoreQuestion>[];
    sourceNearDuplicates: NearDuplicatePair[];
  };
  admission: {
    sourceTotal: number;
    sourceUniqueIdentityCount: number;
    liveTotal: number;
    liveUniqueIdentityCount: number;
    exactMatches: number;
    contentDrifts: AdmissionContentDrift[];
    missing: SourceAdmissionSnapshot[];
    liveExtras: LiveAdmissionQuestion[];
    sourceIdentityDuplicates: ExactTextDuplicateGroup<SourceAdmissionSnapshot>[];
    liveIdentityDuplicates: ExactTextDuplicateGroup<LiveAdmissionQuestion>[];
  };
  quality: {
    sourceCoreBlockers: number;
    sourceCoreWarnings: number;
    liveCoreBlockers: number;
    liveCoreWarnings: number;
    missingCoreBlockers: number;
    missingCoreWarnings: number;
    sourceAdmissionBlockers: number;
    liveAdmissionBlockers: number;
  };
}

function jsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item : String(item)));
}

function normalizedEqual(left: string | null | undefined, right: string | null | undefined): boolean {
  return normalizeMcqText(left ?? "") === normalizeMcqText(right ?? "");
}

function stringArrayEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => normalizedEqual(value, right[index]));
}

function changedCoreFields(source: ResolvedSourceCoreQuestion, live: LiveCoreQuestion): string[] {
  const fields: string[] = [];
  if (!normalizedEqual(source.text, live.text)) fields.push("text");
  if (!stringArrayEqual(source.options, live.options)) fields.push("options");
  if (!normalizedEqual(source.correctAnswer, live.correctAnswer)) fields.push("correctAnswer");
  if (!normalizedEqual(source.explanation, live.explanation)) fields.push("explanation");
  if (source.difficulty !== live.difficulty) fields.push("difficulty");
  if ((source.boardYear ?? null) !== live.boardYear) fields.push("boardYear");
  if (!normalizedEqual(source.boardName, live.boardName)) fields.push("boardName");
  return fields;
}

function changedAdmissionFields(source: SourceAdmissionSnapshot, live: LiveAdmissionQuestion): string[] {
  const fields: string[] = [];
  if (!normalizedEqual(source.text, live.text)) fields.push("text");
  if (!stringArrayEqual(source.options, live.options)) fields.push("options");
  if (!normalizedEqual(source.correctAnswer, live.correctAnswer)) fields.push("correctAnswer");
  if (!normalizedEqual(source.explanation, live.explanation)) fields.push("explanation");
  if (source.difficulty !== live.difficulty) fields.push("difficulty");
  return fields;
}

function groupDuplicates<T>(entries: readonly T[], key: (entry: T) => string): ExactTextDuplicateGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const entry of entries) {
    const groupKey = key(entry);
    const group = groups.get(groupKey) ?? [];
    group.push(entry);
    groups.set(groupKey, group);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([normalizedText, group]) => ({ normalizedText, entries: group }));
}

function uniqueBy<T>(entries: readonly T[], key: (entry: T) => string): T[] {
  const unique = new Map<string, T>();
  for (const entry of entries) if (!unique.has(key(entry))) unique.set(key(entry), entry);
  return [...unique.values()];
}

function countIssues(entries: readonly { qualityIssues: McqQualityIssue[] }[], severity: "BLOCKER" | "WARNING"): number {
  return entries.reduce(
    (total, entry) => total + entry.qualityIssues.filter((issue) => issue.severity === severity).length,
    0
  );
}

function resolveTopic(question: SourceCoreQuestion, topics: readonly TopicSnapshot[]): TopicSnapshot | UnresolvedSourceCoreQuestion {
  let candidates = topics.filter((topic) => normalizeMcqText(topic.name) === normalizeMcqText(question.topicName));
  if (question.subjectName) {
    candidates = candidates.filter(
      (topic) => normalizeMcqText(topic.subjectName) === normalizeMcqText(question.subjectName ?? "")
    );
  }
  if (question.subjectCode) {
    candidates = candidates.filter(
      (topic) => normalizeMcqText(topic.subjectCode) === normalizeMcqText(question.subjectCode ?? "")
    );
  }
  if (question.paper) {
    candidates = candidates.filter((topic) => topic.paper === question.paper);
  }

  if (candidates.length === 1) return candidates[0];
  return {
    question,
    reason:
      candidates.length === 0
        ? "No live topic matches the source topic/subject/paper reference."
        : "More than one live topic matches; source ownership is ambiguous.",
    candidateTopics: candidates,
  };
}

function sourceNearDuplicatePairs(entries: readonly ResolvedSourceCoreQuestion[]): NearDuplicatePair[] {
  const byTopic = new Map<string, ResolvedSourceCoreQuestion[]>();
  for (const entry of entries) {
    const group = byTopic.get(entry.topic.topicKey) ?? [];
    group.push(entry);
    byTopic.set(entry.topic.topicKey, group);
  }

  const pairs: NearDuplicatePair[] = [];
  for (const [topicKey, group] of byTopic) {
    for (let leftIndex = 0; leftIndex < group.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < group.length; rightIndex += 1) {
        const left = group[leftIndex];
        const right = group[rightIndex];
        if (normalizeMcqText(left.text) === normalizeMcqText(right.text)) continue;
        const similarity = mcqTextSimilarity(left.text, right.text);
        if (similarity < 0.92) continue;
        pairs.push({
          topicKey,
          similarity,
          left: { text: left.text, identityFingerprint: left.identityFingerprint },
          right: { text: right.text, identityFingerprint: right.identityFingerprint },
        });
      }
    }
  }
  return pairs.sort((left, right) => right.similarity - left.similarity);
}

function nearestLiveQuestion(
  source: ResolvedSourceCoreQuestion,
  liveByTopic: ReadonlyMap<string, LiveCoreQuestion[]>
): MissingCoreQuestion["nearestInTopic"] {
  const candidates = liveByTopic.get(source.topic.id) ?? [];
  let nearest: MissingCoreQuestion["nearestInTopic"] = null;
  for (const candidate of candidates) {
    const similarity = mcqTextSimilarity(source.text, candidate.text);
    if (!nearest || similarity > nearest.similarity) {
      nearest = {
        text: candidate.text,
        similarity,
        identityFingerprint: candidate.identityFingerprint,
      };
    }
  }
  return nearest;
}

export async function reconcileMcqCatalog(
  prisma: PrismaClient,
  projectRoot = process.cwd()
): Promise<McqReconciliation> {
  const sourceCatalog = loadSourceMcqCatalog(projectRoot);

  const [rawTopics, rawLiveCore, rawLiveAdmission] = await Promise.all([
    prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        chapter: {
          select: {
            subject: { select: { name: true, code: true, paper: true } },
          },
        },
      },
    }),
    prisma.question.findMany({
      select: {
        id: true,
        topicId: true,
        text: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        difficulty: true,
        boardYear: true,
        boardName: true,
        topic: {
          select: {
            name: true,
            chapter: {
              select: {
                subject: { select: { name: true, code: true, paper: true } },
              },
            },
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
  ]);

  const topics: TopicSnapshot[] = rawTopics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    subjectName: topic.chapter.subject.name,
    subjectCode: topic.chapter.subject.code,
    paper: topic.chapter.subject.paper,
    topicKey: canonicalTopicKey(topic.chapter.subject.code, topic.chapter.subject.paper, topic.name),
  }));
  const topicById = new Map(topics.map((topic) => [topic.id, topic]));

  const sourceResolved: ResolvedSourceCoreQuestion[] = [];
  const unresolved: UnresolvedSourceCoreQuestion[] = [];
  for (const question of sourceCatalog.core) {
    const resolution = resolveTopic(question, topics);
    if ("reason" in resolution) {
      unresolved.push(resolution);
      continue;
    }
    sourceResolved.push({
      ...question,
      topic: resolution,
      identityFingerprint: questionIdentityFingerprint(resolution.topicKey, question.text),
      contentFingerprint: questionContentFingerprint({
        topicKey: resolution.topicKey,
        text: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        boardYear: question.boardYear,
        boardName: question.boardName,
      }),
      qualityIssues: validateMcqQuality(question),
    });
  }

  const liveCore: LiveCoreQuestion[] = rawLiveCore.map((question) => {
    const topic = topicById.get(question.topicId);
    if (!topic) throw new Error(`Live question ${question.id} references an unknown topic ${question.topicId}`);
    const options = jsonStringArray(question.options);
    return {
      id: question.id,
      topicId: question.topicId,
      topic,
      text: question.text,
      options,
      optionsRaw: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      boardYear: question.boardYear,
      boardName: question.boardName,
      identityFingerprint: questionIdentityFingerprint(topic.topicKey, question.text),
      contentFingerprint: questionContentFingerprint({
        topicKey: topic.topicKey,
        text: question.text,
        options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        boardYear: question.boardYear,
        boardName: question.boardName,
      }),
      qualityIssues: validateMcqQuality({ ...question, options: question.options }),
    };
  });

  const sourceUnique = uniqueBy(sourceResolved, (question) => question.identityFingerprint);
  const liveUnique = uniqueBy(liveCore, (question) => question.identityFingerprint);
  const liveByIdentity = new Map(liveUnique.map((question) => [question.identityFingerprint, question]));
  const sourceIdentitySet = new Set(sourceUnique.map((question) => question.identityFingerprint));
  const liveByNormalizedText = new Map<string, LiveCoreQuestion[]>();
  const liveByTopic = new Map<string, LiveCoreQuestion[]>();
  for (const question of liveCore) {
    const textKey = normalizeMcqText(question.text);
    liveByNormalizedText.set(textKey, [...(liveByNormalizedText.get(textKey) ?? []), question]);
    liveByTopic.set(question.topicId, [...(liveByTopic.get(question.topicId) ?? []), question]);
  }

  let exactMatches = 0;
  const contentDrifts: CoreContentDrift[] = [];
  const missing: MissingCoreQuestion[] = [];
  for (const source of sourceUnique) {
    const live = liveByIdentity.get(source.identityFingerprint);
    if (!live) {
      missing.push({
        ...source,
        sameTextElsewhere: liveByNormalizedText.get(normalizeMcqText(source.text)) ?? [],
        nearestInTopic: nearestLiveQuestion(source, liveByTopic),
      });
      continue;
    }
    const changedFields = changedCoreFields(source, live);
    if (changedFields.length === 0) exactMatches += 1;
    else contentDrifts.push({ source, live, changedFields });
  }

  const sourceAdmission: SourceAdmissionSnapshot[] = sourceCatalog.admission.map((question) => {
    const identityFingerprint = stableFingerprint([
      "hsc-admission-mcq-identity-v1",
      question.examType,
      question.subject,
      question.text,
    ]);
    return {
      ...question,
      identityFingerprint,
      contentFingerprint: stableFingerprint([
        "hsc-admission-mcq-content-v1",
        question.examType,
        question.subject,
        question.text,
        ...question.options,
        question.correctAnswer,
        question.explanation,
        question.difficulty,
      ]),
      qualityIssues: validateMcqQuality(question),
    };
  });

  const liveAdmission: LiveAdmissionQuestion[] = rawLiveAdmission.map((question) => {
    const options = jsonStringArray(question.options);
    return {
      id: question.id,
      examType: question.examType,
      subject: question.subject,
      text: question.text,
      options,
      optionsRaw: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      identityFingerprint: stableFingerprint([
        "hsc-admission-mcq-identity-v1",
        question.examType,
        question.subject,
        question.text,
      ]),
      contentFingerprint: stableFingerprint([
        "hsc-admission-mcq-content-v1",
        question.examType,
        question.subject,
        question.text,
        ...options,
        question.correctAnswer,
        question.explanation,
        question.difficulty,
      ]),
      qualityIssues: validateMcqQuality({ ...question, options: question.options }),
    };
  });

  const sourceAdmissionUnique = uniqueBy(sourceAdmission, (question) => question.identityFingerprint);
  const liveAdmissionUnique = uniqueBy(liveAdmission, (question) => question.identityFingerprint);
  const liveAdmissionByIdentity = new Map(
    liveAdmissionUnique.map((question) => [question.identityFingerprint, question])
  );
  const sourceAdmissionIdentitySet = new Set(
    sourceAdmissionUnique.map((question) => question.identityFingerprint)
  );
  let admissionExactMatches = 0;
  const admissionContentDrifts: AdmissionContentDrift[] = [];
  const admissionMissing: SourceAdmissionSnapshot[] = [];
  for (const source of sourceAdmissionUnique) {
    const live = liveAdmissionByIdentity.get(source.identityFingerprint);
    if (!live) {
      admissionMissing.push(source);
      continue;
    }
    const changedFields = changedAdmissionFields(source, live);
    if (changedFields.length === 0) admissionExactMatches += 1;
    else admissionContentDrifts.push({ source, live, changedFields });
  }

  return {
    generatedAt: new Date().toISOString(),
    sourceByFile: sourceCatalog.byFile,
    topics,
    core: {
      sourceTotal: sourceCatalog.core.length,
      sourceResolved,
      sourceUniqueIdentityCount: sourceUnique.length,
      unresolved,
      liveTotal: liveCore.length,
      liveUniqueIdentityCount: liveUnique.length,
      exactMatches,
      contentDrifts,
      missing,
      liveExtras: liveUnique.filter((question) => !sourceIdentitySet.has(question.identityFingerprint)),
      sourceIdentityDuplicates: groupDuplicates(sourceResolved, (question) => question.identityFingerprint),
      sourceGlobalTextDuplicates: groupDuplicates(sourceResolved, (question) => normalizeMcqText(question.text)),
      liveIdentityDuplicates: groupDuplicates(liveCore, (question) => question.identityFingerprint),
      liveGlobalTextDuplicates: groupDuplicates(liveCore, (question) => normalizeMcqText(question.text)),
      sourceNearDuplicates: sourceNearDuplicatePairs(sourceResolved),
    },
    admission: {
      sourceTotal: sourceCatalog.admission.length,
      sourceUniqueIdentityCount: sourceAdmissionUnique.length,
      liveTotal: liveAdmission.length,
      liveUniqueIdentityCount: liveAdmissionUnique.length,
      exactMatches: admissionExactMatches,
      contentDrifts: admissionContentDrifts,
      missing: admissionMissing,
      liveExtras: liveAdmissionUnique.filter(
        (question) => !sourceAdmissionIdentitySet.has(question.identityFingerprint)
      ),
      sourceIdentityDuplicates: groupDuplicates(
        sourceAdmission,
        (question) => question.identityFingerprint
      ),
      liveIdentityDuplicates: groupDuplicates(
        liveAdmission,
        (question) => question.identityFingerprint
      ),
    },
    quality: {
      sourceCoreBlockers: countIssues(sourceResolved, "BLOCKER"),
      sourceCoreWarnings: countIssues(sourceResolved, "WARNING"),
      liveCoreBlockers: countIssues(liveCore, "BLOCKER"),
      liveCoreWarnings: countIssues(liveCore, "WARNING"),
      missingCoreBlockers: countIssues(missing, "BLOCKER"),
      missingCoreWarnings: countIssues(missing, "WARNING"),
      sourceAdmissionBlockers: countIssues(sourceAdmission, "BLOCKER"),
      liveAdmissionBlockers: countIssues(liveAdmission, "BLOCKER"),
    },
  };
}
