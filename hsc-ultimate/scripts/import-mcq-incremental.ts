import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import { normalizeMcqText, SOURCE_MCQ_BASELINE } from "./lib/mcq-catalog";
import {
  reconcileMcqCatalog,
  type MissingCoreQuestion,
  type ResolvedSourceCoreQuestion,
} from "./lib/mcq-reconciliation";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const IMPORT_ADVISORY_LOCK = 2_026_080_401;
const DEFAULT_APPROVAL = "scripts/data/mcq-import-approval-2026-08-04.json";

interface CliOptions {
  apply: boolean;
  approvalPath: string;
  reportPath: string;
}

interface ApprovalEntry {
  fingerprint: string;
  contentFingerprint: string;
  topic: string;
  text: string;
  decision: "APPROVE";
  reviewNotes: string;
}

interface ApprovalManifest {
  schemaVersion: 1;
  dataset: "core-question";
  reviewedAt: string;
  sourceAudit: string;
  expectedSourceCoreCount: number;
  approvals: ApprovalEntry[];
  references?: string[];
}

interface ApplyOutcome {
  created: Array<{ fingerprint: string; topic: string; text: string }>;
  skippedAlreadyPresent: Array<{ fingerprint: string; topic: string; text: string }>;
}

function parseArgs(argv: readonly string[]): CliOptions {
  let apply = false;
  let approvalPath = DEFAULT_APPROVAL;
  let reportPath = "reports/mcq-import-last.json";

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") {
      apply = true;
    } else if (argument === "--approval") {
      const value = argv[index + 1];
      if (!value) throw new Error("--approval requires a path");
      approvalPath = value;
      index += 1;
    } else if (argument === "--report") {
      const value = argv[index + 1];
      if (!value) throw new Error("--report requires a path");
      reportPath = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { apply, approvalPath, reportPath };
}

function record(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${context} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, context: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${context} must be a non-empty string`);
  return value;
}

function loadApprovalManifest(filePath: string): ApprovalManifest {
  const raw = JSON.parse(readFileSync(path.resolve(filePath), "utf8")) as unknown;
  const root = record(raw, "Approval manifest");
  if (root.schemaVersion !== 1) throw new Error("Approval manifest schemaVersion must be 1");
  if (root.dataset !== "core-question") throw new Error("Approval manifest dataset must be core-question");
  if (typeof root.expectedSourceCoreCount !== "number") {
    throw new Error("Approval manifest expectedSourceCoreCount must be a number");
  }
  if (!Array.isArray(root.approvals)) throw new Error("Approval manifest approvals must be an array");

  const approvals: ApprovalEntry[] = root.approvals.map((rawEntry, index) => {
    const entry = record(rawEntry, `approvals[${index}]`);
    if (entry.decision !== "APPROVE") throw new Error(`approvals[${index}].decision must be APPROVE`);
    return {
      fingerprint: requiredString(entry.fingerprint, `approvals[${index}].fingerprint`),
      contentFingerprint: requiredString(
        entry.contentFingerprint,
        `approvals[${index}].contentFingerprint`
      ),
      topic: requiredString(entry.topic, `approvals[${index}].topic`),
      text: requiredString(entry.text, `approvals[${index}].text`),
      decision: "APPROVE",
      reviewNotes: requiredString(entry.reviewNotes, `approvals[${index}].reviewNotes`),
    };
  });

  const references = root.references;
  if (references !== undefined && (!Array.isArray(references) || references.some((item) => typeof item !== "string"))) {
    throw new Error("Approval manifest references must be a string array");
  }

  return {
    schemaVersion: 1,
    dataset: "core-question",
    reviewedAt: requiredString(root.reviewedAt, "Approval manifest reviewedAt"),
    sourceAudit: requiredString(root.sourceAudit, "Approval manifest sourceAudit"),
    expectedSourceCoreCount: root.expectedSourceCoreCount,
    approvals,
    references: references as string[] | undefined,
  };
}

function validateManifestAgainstSource(
  manifest: ApprovalManifest,
  source: readonly ResolvedSourceCoreQuestion[]
): Map<string, ApprovalEntry> {
  if (manifest.expectedSourceCoreCount !== SOURCE_MCQ_BASELINE.core) {
    throw new Error(
      `Approval expectedSourceCoreCount=${manifest.expectedSourceCoreCount}; baseline is ${SOURCE_MCQ_BASELINE.core}`
    );
  }
  const sourceByFingerprint = new Map(source.map((question) => [question.identityFingerprint, question]));
  const approvals = new Map<string, ApprovalEntry>();

  for (const approval of manifest.approvals) {
    if (approvals.has(approval.fingerprint)) {
      throw new Error(`Duplicate approval fingerprint: ${approval.fingerprint}`);
    }
    const question = sourceByFingerprint.get(approval.fingerprint);
    if (!question) throw new Error(`Approved fingerprint no longer exists in source: ${approval.fingerprint}`);
    if (question.contentFingerprint !== approval.contentFingerprint) {
      throw new Error(`Approved content changed after review: ${approval.fingerprint}`);
    }
    if (question.topic.topicKey !== approval.topic) {
      throw new Error(`Approved topic changed after review: ${approval.fingerprint}`);
    }
    if (normalizeMcqText(question.text) !== normalizeMcqText(approval.text)) {
      throw new Error(`Approved text changed after review: ${approval.fingerprint}`);
    }
    approvals.set(approval.fingerprint, approval);
  }
  return approvals;
}

function validateApplyPlan(
  missing: readonly MissingCoreQuestion[],
  approvals: ReadonlyMap<string, ApprovalEntry>,
  hasUnresolvedTopics: boolean,
  hasLiveIdentityDuplicates: boolean
): { approved: MissingCoreQuestion[]; unapproved: MissingCoreQuestion[] } {
  if (hasUnresolvedTopics) throw new Error("Source contains unresolved topic references; import is blocked.");
  if (hasLiveIdentityDuplicates) throw new Error("Live database contains same-topic identity duplicates; import is blocked.");

  const approved = missing.filter((question) => approvals.has(question.identityFingerprint));
  const unapproved = missing.filter((question) => !approvals.has(question.identityFingerprint));
  for (const question of approved) {
    const blockers = question.qualityIssues.filter((issue) => issue.severity === "BLOCKER");
    if (blockers.length > 0) {
      throw new Error(
        `Approved question ${question.identityFingerprint} has blockers: ${blockers.map((issue) => issue.code).join(", ")}`
      );
    }
    if (question.sameTextElsewhere.length > 0) {
      throw new Error(
        `Approved question ${question.identityFingerprint} has the same normalized text in another live topic.`
      );
    }
  }
  return { approved, unapproved };
}

async function applyCandidates(
  prisma: PrismaClient,
  candidates: readonly MissingCoreQuestion[]
): Promise<ApplyOutcome> {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(${IMPORT_ADVISORY_LOCK})`;

      const current = await transaction.question.findMany({
        select: { topicId: true, text: true },
      });
      const created: ApplyOutcome["created"] = [];
      const skippedAlreadyPresent: ApplyOutcome["skippedAlreadyPresent"] = [];

      for (const candidate of candidates) {
        const normalizedText = normalizeMcqText(candidate.text);
        const alreadyInTopic = current.some(
          (question) =>
            question.topicId === candidate.topic.id && normalizeMcqText(question.text) === normalizedText
        );
        if (alreadyInTopic) {
          skippedAlreadyPresent.push({
            fingerprint: candidate.identityFingerprint,
            topic: candidate.topic.topicKey,
            text: candidate.text,
          });
          continue;
        }

        const sameTextElsewhere = current.some(
          (question) =>
            question.topicId !== candidate.topic.id && normalizeMcqText(question.text) === normalizedText
        );
        if (sameTextElsewhere) {
          throw new Error(
            `Concurrent/global duplicate detected for ${candidate.identityFingerprint}; transaction rolled back.`
          );
        }

        await transaction.question.create({
          data: {
            topicId: candidate.topic.id,
            type: "MCQ",
            text: candidate.text,
            options: candidate.options,
            correctAnswer: candidate.correctAnswer,
            explanation: candidate.explanation,
            difficulty: candidate.difficulty,
            boardYear: candidate.boardYear,
            boardName: candidate.boardName,
          },
          select: { id: true },
        });
        current.push({ topicId: candidate.topic.id, text: candidate.text });
        created.push({
          fingerprint: candidate.identityFingerprint,
          topic: candidate.topic.topicKey,
          text: candidate.text,
        });
      }
      return { created, skippedAlreadyPresent };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 10_000,
      timeout: 60_000,
    }
  );
}

function writeReport(filePath: string, report: unknown) {
  const absolute = path.resolve(filePath);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifest = loadApprovalManifest(options.approvalPath);
  const prisma = new PrismaClient();

  try {
    const before = await reconcileMcqCatalog(prisma);
    if (before.core.sourceTotal !== SOURCE_MCQ_BASELINE.core) {
      throw new Error(
        `Source core count changed from reviewed baseline ${SOURCE_MCQ_BASELINE.core} to ${before.core.sourceTotal}`
      );
    }
    if (before.quality.sourceCoreBlockers > 0 || before.quality.liveCoreBlockers > 0) {
      throw new Error(
        `Core quality blockers remain (source=${before.quality.sourceCoreBlockers}, live=${before.quality.liveCoreBlockers}); no writes performed.`
      );
    }
    if (before.core.contentDrifts.length > 0) {
      throw new Error(
        `${before.core.contentDrifts.length} source/live content drift(s) require review; no writes performed.`
      );
    }
    const approvalMap = validateManifestAgainstSource(manifest, before.core.sourceResolved);
    const plan = validateApplyPlan(
      before.core.missing,
      approvalMap,
      before.core.unresolved.length > 0,
      before.core.liveIdentityDuplicates.length > 0
    );

    const planSummary = {
      approvedMissing: plan.approved.length,
      unapprovedMissing: plan.unapproved.length,
      approvedFingerprints: plan.approved.map((question) => question.identityFingerprint),
      unapprovedFingerprints: plan.unapproved.map((question) => question.identityFingerprint),
    };

    if (!options.apply) {
      writeReport(options.reportPath, {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        mode: "DRY_RUN",
        approvalManifest: options.approvalPath,
        before: {
          sourceCore: before.core.sourceTotal,
          liveCore: before.core.liveTotal,
          missingCore: before.core.missing.length,
          liveExtras: before.core.liveExtras.length,
          contentDrifts: before.core.contentDrifts.length,
        },
        plan: planSummary,
        writes: { inserts: 0, updates: 0, deletes: 0 },
      });
      console.log("MCQ incremental import — DRY RUN");
      console.log("──────────────────────────────────────────────");
      console.log(`Missing: ${before.core.missing.length}`);
      console.log(`Approved: ${plan.approved.length}`);
      console.log(`Unapproved: ${plan.unapproved.length}`);
      console.log("Writes: 0 (use --apply only after reviewing the report)");
      console.log(`Report: ${options.reportPath}`);
      return;
    }

    if (plan.unapproved.length > 0) {
      throw new Error(
        `${plan.unapproved.length} missing question(s) are not in the reviewed approval manifest; no writes performed.`
      );
    }

    const outcome = await applyCandidates(prisma, plan.approved);
    const after = await reconcileMcqCatalog(prisma);
    const approvedStillMissing = after.core.missing.filter((question) =>
      approvalMap.has(question.identityFingerprint)
    );
    if (approvedStillMissing.length > 0) {
      throw new Error(
        `Post-import verification failed: ${approvedStillMissing.length} approved question(s) are still missing.`
      );
    }
    if (after.core.liveIdentityDuplicates.length > 0) {
      throw new Error("Post-import verification found same-topic identity duplicates.");
    }

    writeReport(options.reportPath, {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      mode: "APPLY",
      approvalManifest: options.approvalPath,
      reviewedAt: manifest.reviewedAt,
      before: {
        sourceCore: before.core.sourceTotal,
        liveCore: before.core.liveTotal,
        missingCore: before.core.missing.length,
        liveExtras: before.core.liveExtras.length,
        contentDrifts: before.core.contentDrifts.length,
      },
      plan: planSummary,
      outcome: {
        inserted: outcome.created.length,
        skippedAlreadyPresent: outcome.skippedAlreadyPresent.length,
        updates: 0,
        deletes: 0,
        created: outcome.created,
        skipped: outcome.skippedAlreadyPresent,
      },
      after: {
        sourceCore: after.core.sourceTotal,
        liveCore: after.core.liveTotal,
        missingCore: after.core.missing.length,
        liveExtras: after.core.liveExtras.length,
        contentDrifts: after.core.contentDrifts.length,
        identityDuplicateGroups: after.core.liveIdentityDuplicates.length,
        qualityBlockers: after.quality.liveCoreBlockers,
      },
      transaction: {
        isolation: "Serializable",
        advisoryLock: IMPORT_ADVISORY_LOCK,
        appendOnly: true,
      },
    });

    console.log("MCQ incremental import — APPLY complete");
    console.log("──────────────────────────────────────────────");
    console.log(`Inserted: ${outcome.created.length}`);
    console.log(`Already present: ${outcome.skippedAlreadyPresent.length}`);
    console.log("Updated: 0 · Deleted: 0");
    console.log(`Live core: ${before.core.liveTotal} → ${after.core.liveTotal}`);
    console.log(`Remaining source gap: ${after.core.missing.length}`);
    console.log(`Report: ${options.reportPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("MCQ incremental import blocked:", error instanceof Error ? error.message : error);
  process.exit(1);
});
