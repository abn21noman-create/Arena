import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { SOURCE_MCQ_BASELINE } from "./lib/mcq-catalog";
import { reconcileMcqCatalog, type McqReconciliation } from "./lib/mcq-reconciliation";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

interface CliOptions {
  jsonPath: string;
  markdownPath: string;
  strict: boolean;
}

function parseArgs(argv: readonly string[]): CliOptions {
  let jsonPath = "reports/mcq-audit-current.json";
  let markdownPath = "docs/MCQ_AUDIT_CURRENT.md";
  let strict = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--json") {
      const value = argv[index + 1];
      if (!value) throw new Error("--json requires a path");
      jsonPath = value;
      index += 1;
    } else if (argument === "--markdown") {
      const value = argv[index + 1];
      if (!value) throw new Error("--markdown requires a path");
      markdownPath = value;
      index += 1;
    } else if (argument === "--strict") {
      strict = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return { jsonPath, markdownPath, strict };
}

function reportDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function jsonReport(result: McqReconciliation) {
  const sourceAll = result.core.sourceTotal + result.admission.sourceTotal;
  const liveAll = result.core.liveTotal + result.admission.liveTotal;

  return {
    schemaVersion: 1,
    generatedAt: result.generatedAt,
    mode: "READ_ONLY_AUDIT",
    conclusion: {
      historicalClaim: {
        sourceAllMcq: 908,
        liveCoreMcq: 677,
        reportedDifference: 231,
      },
      invalidCrossCategoryDifferenceUsingCurrentLiveCore:
        SOURCE_MCQ_BASELINE.all - result.core.liveTotal,
      categoryError:
        "The old comparison subtracted live core Question rows from a source total that also included AdmissionQuestion rows.",
      sourceAllMcqEntities: sourceAll,
      sourceCoreMcq: result.core.sourceTotal,
      sourceAdmissionMcq: result.admission.sourceTotal,
      liveAllMcqEntities: liveAll,
      liveCoreMcq: result.core.liveTotal,
      liveAdmissionMcq: result.admission.liveTotal,
      actualMissingCoreMcq: result.core.missing.length,
    },
    baseline: SOURCE_MCQ_BASELINE,
    sourceByFile: result.sourceByFile,
    quality: result.quality,
    core: {
      sourceTotal: result.core.sourceTotal,
      sourceUniqueIdentityCount: result.core.sourceUniqueIdentityCount,
      unresolvedTopicReferences: result.core.unresolved.map((entry) => ({
        source: entry.question.source,
        topicName: entry.question.topicName,
        reason: entry.reason,
        candidates: entry.candidateTopics.map((topic) => topic.topicKey),
      })),
      liveTotal: result.core.liveTotal,
      liveUniqueIdentityCount: result.core.liveUniqueIdentityCount,
      exactMatches: result.core.exactMatches,
      contentDrifts: result.core.contentDrifts.map((entry) => ({
        fingerprint: entry.source.identityFingerprint,
        source: entry.source.source,
        topic: entry.source.topic.topicKey,
        text: entry.source.text,
        changedFields: entry.changedFields,
      })),
      missing: result.core.missing.map((entry) => ({
        fingerprint: entry.identityFingerprint,
        contentFingerprint: entry.contentFingerprint,
        source: entry.source,
        topic: entry.topic.topicKey,
        subject: entry.topic.subjectName,
        topicName: entry.topic.name,
        text: entry.text,
        options: entry.options,
        correctAnswer: entry.correctAnswer,
        explanation: entry.explanation,
        difficulty: entry.difficulty,
        boardYear: entry.boardYear ?? null,
        boardName: entry.boardName ?? null,
        qualityIssues: entry.qualityIssues,
        sameTextElsewhere: entry.sameTextElsewhere.map((question) => question.topic.topicKey),
        nearestInTopic: entry.nearestInTopic,
      })),
      liveExtras: result.core.liveExtras.map((entry) => ({
        fingerprint: entry.identityFingerprint,
        topic: entry.topic.topicKey,
        text: entry.text,
      })),
      sourceIdentityDuplicateGroups: result.core.sourceIdentityDuplicates.map((group) =>
        group.entries.map((entry) => ({
          fingerprint: entry.identityFingerprint,
          topic: entry.topic.topicKey,
          text: entry.text,
          source: entry.source,
        }))
      ),
      sourceGlobalTextDuplicateGroups: result.core.sourceGlobalTextDuplicates.map((group) =>
        group.entries.map((entry) => ({
          fingerprint: entry.identityFingerprint,
          topic: entry.topic.topicKey,
          text: entry.text,
          source: entry.source,
        }))
      ),
      liveIdentityDuplicateGroups: result.core.liveIdentityDuplicates.map((group) =>
        group.entries.map((entry) => ({
          fingerprint: entry.identityFingerprint,
          topic: entry.topic.topicKey,
          text: entry.text,
        }))
      ),
      sourceNearDuplicates: result.core.sourceNearDuplicates,
    },
    admission: {
      sourceTotal: result.admission.sourceTotal,
      sourceUniqueIdentityCount: result.admission.sourceUniqueIdentityCount,
      liveTotal: result.admission.liveTotal,
      liveUniqueIdentityCount: result.admission.liveUniqueIdentityCount,
      exactMatches: result.admission.exactMatches,
      contentDrifts: result.admission.contentDrifts.map((entry) => ({
        fingerprint: entry.source.identityFingerprint,
        source: entry.source.source,
        examType: entry.source.examType,
        subject: entry.source.subject,
        text: entry.source.text,
        changedFields: entry.changedFields,
      })),
      missing: result.admission.missing.map((entry) => ({
        fingerprint: entry.identityFingerprint,
        source: entry.source,
        examType: entry.examType,
        subject: entry.subject,
        text: entry.text,
        qualityIssues: entry.qualityIssues,
      })),
      liveExtras: result.admission.liveExtras.map((entry) => ({
        fingerprint: entry.identityFingerprint,
        examType: entry.examType,
        subject: entry.subject,
        text: entry.text,
      })),
      sourceIdentityDuplicateGroups: result.admission.sourceIdentityDuplicates.length,
      liveIdentityDuplicateGroups: result.admission.liveIdentityDuplicates.length,
    },
    safeguards: [
      "This command performs read-only SELECT queries.",
      "No seed script is executed.",
      "No question is inserted, updated, or deleted.",
      "Import candidates require a separate reviewed approval manifest and an explicit --apply flag.",
    ],
  };
}

function markdownReport(result: McqReconciliation): string {
  const date = reportDate(result.generatedAt);
  const sourceAll = result.core.sourceTotal + result.admission.sourceTotal;
  const liveAll = result.core.liveTotal + result.admission.liveTotal;
  const candidateRows = result.core.missing
    .map(
      (entry, index) =>
        `| ${index + 1} | ${entry.topic.name} | ${entry.difficulty} | ${entry.qualityIssues.length === 0 ? "Pass" : `${entry.qualityIssues.length} issue`} | ${entry.text.replace(/\|/g, "\\|")} |`
    )
    .join("\n");

  const duplicateDetails = result.core.sourceGlobalTextDuplicates
    .map(
      (group) =>
        `- **${group.entries[0].text}** — ${group.entries
          .map((entry) => `${entry.topic.subjectName} / ${entry.topic.name}`)
          .join("; ")}`
    )
    .join("\n");

  const contentDriftDetails = result.core.contentDrifts
    .map(
      (entry) =>
        `- \`${entry.source.identityFingerprint.slice(0, 12)}\` — ${entry.source.topic.subjectName} / ${entry.source.topic.name}: ${entry.changedFields.join(", ")}`
    )
    .join("\n");

  return `# MCQ Source ↔ Live Database Audit — ${date}

> Mode: **read-only**. এই audit কোনো row insert, update বা delete করেনি।

## Executive finding

আগের **908 − 677 = 231** হিসাবটি একই category তুলনা করেনি:

- Source **908** = core Question seed **${result.core.sourceTotal}** + AdmissionQuestion seed **${result.admission.sourceTotal}**
- Live সব MCQ entity = core Question **${result.core.liveTotal}** + AdmissionQuestion **${result.admission.liveTotal}** = **${liveAll}**
- Core-to-core প্রকৃত gap = **${result.core.sourceTotal} − ${result.core.liveTotal} = ${result.core.missing.length}**

সুতরাং ২৩১টি bulk import করা হলে admission content ভুল table-এ duplicate/corrupt হওয়ার ঝুঁকি ছিল। Safe candidate মাত্র **${result.core.missing.length}টি**।

## Reconciliation

| Dataset | Source | Live | Missing | Live-only | Content drift |
|---|---:|---:|---:|---:|---:|
| Core Question | ${result.core.sourceTotal} | ${result.core.liveTotal} | ${result.core.missing.length} | ${result.core.liveExtras.length} | ${result.core.contentDrifts.length} |
| AdmissionQuestion | ${result.admission.sourceTotal} | ${result.admission.liveTotal} | ${result.admission.missing.length} | ${result.admission.liveExtras.length} | ${result.admission.contentDrifts.length} |
| Combined MCQ entities | ${sourceAll} | ${liveAll} | ${result.core.missing.length + result.admission.missing.length} | ${result.core.liveExtras.length + result.admission.liveExtras.length} | ${result.core.contentDrifts.length + result.admission.contentDrifts.length} |

- Unresolved topic reference: **${result.core.unresolved.length}**
- Source same-topic identity duplicate group: **${result.core.sourceIdentityDuplicates.length}**
- Live same-topic identity duplicate group: **${result.core.liveIdentityDuplicates.length}**
- Source cross-topic identical-text group: **${result.core.sourceGlobalTextDuplicates.length}**
- Source near-duplicate pair (≥ 0.92): **${result.core.sourceNearDuplicates.length}**

## Quality gates

| Check scope | Blocker | Warning |
|---|---:|---:|
| Source core (${result.core.sourceTotal}) | ${result.quality.sourceCoreBlockers} | ${result.quality.sourceCoreWarnings} |
| Live core (${result.core.liveTotal}) | ${result.quality.liveCoreBlockers} | ${result.quality.liveCoreWarnings} |
| Missing candidates (${result.core.missing.length}) | ${result.quality.missingCoreBlockers} | ${result.quality.missingCoreWarnings} |
| Source admission (${result.admission.sourceTotal}) | ${result.quality.sourceAdmissionBlockers} | — |
| Live admission (${result.admission.liveTotal}) | ${result.quality.liveAdmissionBlockers} | — |

Checks include topic resolution, normalized duplicate detection, exactly four non-empty options, answer-in-options, explanation length, Unicode/control corruption, balanced math/LaTeX delimiters, board metadata, and placeholder/generated-content markers.

## Missing core candidates

| # | Topic | Difficulty | Automated gate | Question |
|---:|---|---|---|---|
${candidateRows || "| — | — | — | No missing candidates | — |"}

${
    result.core.missing.length > 0
      ? "সব candidate এসেছে `prisma/seed-questions-chem-ict-gaps.ts` থেকে। এগুলো live topic notes-এর সঙ্গে internal-consistency review করতে হবে; automated validation Admin factual review-এর বিকল্প নয়।"
      : "বর্তমানে source ও live-এর মধ্যে কোনো missing candidate নেই। Automated validation ভবিষ্যৎ Admin factual review-এর বিকল্প নয়।"
  }

## Existing identical text in different topics

এগুলো same-topic duplicate নয়; একই প্রশ্ন আলাদা curriculum topic-এ intentionalভাবে আছে:

${duplicateDetails || "- নেই"}

## Existing content drift

${contentDriftDetails || "- নেই"}

## Safe import policy

1. Existing row delete/update করা যাবে না।
2. Default command dry-run; write-এর জন্য explicit \`--apply\` বাধ্যতামূলক।
3. প্রতিটি candidate-এর stable SHA-256 identity reviewed approval manifest-এ থাকতে হবে।
4. Import transaction-এর ভিতরে PostgreSQL advisory lock নিয়ে আবার normalized identity check হবে।
5. একই command পুনরায় চালালে zero insert হতে হবে (idempotent)।
6. Apply শেষে count, duplicate, drift ও quality audit পুনরায় চলবে।
`;
}

function writeOutput(filePath: string, content: string) {
  const absolute = path.resolve(filePath);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();
  try {
    const result = await reconcileMcqCatalog(prisma);
    const report = jsonReport(result);
    writeOutput(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    writeOutput(options.markdownPath, markdownReport(result));

    console.log("MCQ source ↔ live audit (read-only)");
    console.log("────────────────────────────────────────────────────────");
    console.log(`Source: core ${result.core.sourceTotal} + admission ${result.admission.sourceTotal} = ${result.core.sourceTotal + result.admission.sourceTotal}`);
    console.log(`Live  : core ${result.core.liveTotal} + admission ${result.admission.liveTotal} = ${result.core.liveTotal + result.admission.liveTotal}`);
    console.log(`Actual core gap: ${result.core.missing.length}`);
    console.log(`Core drift/extras/unresolved: ${result.core.contentDrifts.length}/${result.core.liveExtras.length}/${result.core.unresolved.length}`);
    console.log(`Candidate blockers/warnings: ${result.quality.missingCoreBlockers}/${result.quality.missingCoreWarnings}`);
    console.log(`JSON: ${options.jsonPath}`);
    console.log(`Markdown: ${options.markdownPath}`);

    const strictFailure =
      result.core.unresolved.length > 0 ||
      result.core.contentDrifts.length > 0 ||
      result.core.liveExtras.length > 0 ||
      result.quality.sourceCoreBlockers > 0 ||
      result.quality.liveCoreBlockers > 0 ||
      result.quality.missingCoreBlockers > 0 ||
      result.admission.missing.length > 0 ||
      result.admission.liveExtras.length > 0 ||
      result.admission.contentDrifts.length > 0 ||
      result.quality.sourceAdmissionBlockers > 0 ||
      result.quality.liveAdmissionBlockers > 0;
    if (options.strict && strictFailure) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("MCQ audit failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
