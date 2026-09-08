import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const CONTENT_FIX_LOCK = 2_026_080_402;
const OLD_RANGE = "১০-১০০";
const ADMISSION_TEXT = "৫ জন থেকে ৩ জন বাছাই করার উপায় কত?";
const OLD_ADMISSION_EXPLANATION = "C(5,3) = 10।";
const NEW_ADMISSION_EXPLANATION =
  "সমাবেশে বাছাইয়ের ক্রম গুরুত্বপূর্ণ নয়। তাই C(5,3) = 5!/(3!×2!) = (5×4)/(2×1) = 10 উপায়।";

interface CliOptions {
  apply: boolean;
  reportPath: string;
}

interface ReviewSnapshot {
  topic: {
    id: string;
    notesMarkdown: string | null;
    formulaSheet: string | null;
  };
  cq: {
    id: string;
    modelAnswerC: string | null;
    modelAnswerD: string | null;
  };
  admission: {
    id: string;
    explanation: string | null;
  };
}

function parseArgs(argv: readonly string[]): CliOptions {
  let apply = false;
  let reportPath = "reports/reviewed-content-fixes-last.json";
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") apply = true;
    else if (argument === "--report") {
      const value = argv[index + 1];
      if (!value) throw new Error("--report requires a path");
      reportPath = value;
      index += 1;
    } else throw new Error(`Unknown argument: ${argument}`);
  }
  return { apply, reportPath };
}

function occurrences(value: string | null, needle: string): number {
  if (!value) return 0;
  return value.split(needle).length - 1;
}

function corrected(value: string | null): string | null {
  if (value === null) return null;
  return value
    .replaceAll("১০-১০০ মিটার বিস্তৃতির", "সর্বোচ্চ ১০ মিটার বিস্তৃতির")
    .replaceAll("১০-১০০ মিটার", "সর্বোচ্চ ১০ মিটার")
    .replaceAll("১০-১০০ মি.", "সর্বোচ্চ ১০ মিটার");
}

async function readSnapshot(prisma: PrismaClient | Prisma.TransactionClient): Promise<ReviewSnapshot> {
  const topics = await prisma.topic.findMany({
    where: {
      name: "নেটওয়ার্কের প্রকারভেদ",
      chapter: { subject: { code: "ICT", paper: "NONE" } },
    },
    select: {
      id: true,
      notesMarkdown: true,
      formulaSheet: true,
      cqQuestions: {
        where: { stimulus: { contains: "ব্লুটুথের মাধ্যমে হেডফোন" } },
        select: { id: true, modelAnswerC: true, modelAnswerD: true },
      },
    },
  });
  if (topics.length !== 1) throw new Error(`Expected one ICT network topic; found ${topics.length}`);
  if (topics[0].cqQuestions.length !== 1) {
    throw new Error(`Expected one reviewed ICT network CQ; found ${topics[0].cqQuestions.length}`);
  }

  const admissions = await prisma.admissionQuestion.findMany({
    where: { examType: "BUET", subject: "MATH", text: ADMISSION_TEXT },
    select: { id: true, explanation: true },
  });
  if (admissions.length !== 1) {
    throw new Error(`Expected one reviewed admission question; found ${admissions.length}`);
  }

  return {
    topic: {
      id: topics[0].id,
      notesMarkdown: topics[0].notesMarkdown,
      formulaSheet: topics[0].formulaSheet,
    },
    cq: topics[0].cqQuestions[0],
    admission: admissions[0],
  };
}

function plan(snapshot: ReviewSnapshot) {
  const oldRangeOccurrences =
    occurrences(snapshot.topic.notesMarkdown, OLD_RANGE) +
    occurrences(snapshot.topic.formulaSheet, OLD_RANGE) +
    occurrences(snapshot.cq.modelAnswerC, OLD_RANGE) +
    occurrences(snapshot.cq.modelAnswerD, OLD_RANGE);
  const admissionNeedsUpdate = snapshot.admission.explanation === OLD_ADMISSION_EXPLANATION;
  const admissionAlreadyFixed = snapshot.admission.explanation === NEW_ADMISSION_EXPLANATION;
  if (!admissionNeedsUpdate && !admissionAlreadyFixed) {
    throw new Error("Admission explanation differs from both the reviewed old and new value; refusing to overwrite it.");
  }

  return {
    oldRangeOccurrences,
    topicNeedsUpdate:
      occurrences(snapshot.topic.notesMarkdown, OLD_RANGE) +
        occurrences(snapshot.topic.formulaSheet, OLD_RANGE) >
      0,
    cqNeedsUpdate:
      occurrences(snapshot.cq.modelAnswerC, OLD_RANGE) +
        occurrences(snapshot.cq.modelAnswerD, OLD_RANGE) >
      0,
    admissionNeedsUpdate,
  };
}

async function applyFixes(prisma: PrismaClient) {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(${CONTENT_FIX_LOCK})`;
      const snapshot = await readSnapshot(transaction);
      const currentPlan = plan(snapshot);
      let topicUpdates = 0;
      let cqUpdates = 0;
      let admissionUpdates = 0;

      if (currentPlan.topicNeedsUpdate) {
        await transaction.topic.update({
          where: { id: snapshot.topic.id },
          data: {
            notesMarkdown: corrected(snapshot.topic.notesMarkdown),
            formulaSheet: corrected(snapshot.topic.formulaSheet),
          },
          select: { id: true },
        });
        topicUpdates = 1;
      }
      if (currentPlan.cqNeedsUpdate) {
        await transaction.cQQuestion.update({
          where: { id: snapshot.cq.id },
          data: {
            modelAnswerC: corrected(snapshot.cq.modelAnswerC),
            modelAnswerD: corrected(snapshot.cq.modelAnswerD),
          },
          select: { id: true },
        });
        cqUpdates = 1;
      }
      if (currentPlan.admissionNeedsUpdate) {
        await transaction.admissionQuestion.update({
          where: { id: snapshot.admission.id },
          data: { explanation: NEW_ADMISSION_EXPLANATION },
          select: { id: true },
        });
        admissionUpdates = 1;
      }
      return { topicUpdates, cqUpdates, admissionUpdates, replacedRangeOccurrences: currentPlan.oldRangeOccurrences };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 10_000,
      timeout: 30_000,
    }
  );
}

function writeReport(filePath: string, value: unknown) {
  const absolute = path.resolve(filePath);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();
  try {
    const before = await readSnapshot(prisma);
    const beforePlan = plan(before);

    if (!options.apply) {
      writeReport(options.reportPath, {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        mode: "DRY_RUN",
        plan: beforePlan,
        writes: { updates: 0, inserts: 0, deletes: 0 },
      });
      console.log("Reviewed content fixes — DRY RUN");
      console.log(`PAN range occurrences to correct: ${beforePlan.oldRangeOccurrences}`);
      console.log(`Admission explanation update: ${beforePlan.admissionNeedsUpdate ? 1 : 0}`);
      console.log("Writes: 0");
      return;
    }

    const outcome = await applyFixes(prisma);
    const after = await readSnapshot(prisma);
    const afterPlan = plan(after);
    if (afterPlan.oldRangeOccurrences !== 0 || afterPlan.admissionNeedsUpdate) {
      throw new Error("Post-fix verification failed.");
    }

    writeReport(options.reportPath, {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      mode: "APPLY",
      before: beforePlan,
      outcome,
      after: afterPlan,
      inserts: 0,
      deletes: 0,
      safeguards: {
        exactIdentityChecks: true,
        compareBeforeWrite: true,
        transactionIsolation: "Serializable",
        advisoryLock: CONTENT_FIX_LOCK,
      },
    });
    console.log("Reviewed content fixes — APPLY complete");
    console.log(`PAN range occurrences corrected: ${outcome.replacedRangeOccurrences}`);
    console.log(`Rows updated: topic ${outcome.topicUpdates}, CQ ${outcome.cqUpdates}, admission ${outcome.admissionUpdates}`);
    console.log("Inserted: 0 · Deleted: 0");
    console.log(`Report: ${options.reportPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Reviewed content fix blocked:", error instanceof Error ? error.message : error);
  process.exit(1);
});
