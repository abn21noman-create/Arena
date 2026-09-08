import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

import { runAIAcademicReviewBatch } from "@/lib/ai-academic-review";
import { prisma } from "@/lib/prisma";
import type { ReviewTargetType } from "@/lib/content-quality-server";

function options(argv: string[]) {
  let limit = 3;
  let apply = false;
  let targetType: ReviewTargetType | undefined;
  const valid = new Set<ReviewTargetType>(["CORE_MCQ", "ADMISSION_MCQ", "CQ", "TOPIC_NOTE"]);
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--apply") apply = true;
    else if (argv[index] === "--limit") limit = Number(argv[++index]);
    else if (argv[index] === "--target-type") {
      const value = argv[++index] as ReviewTargetType;
      if (!valid.has(value)) throw new Error("Invalid --target-type");
      targetType = value;
    } else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 25) {
    throw new Error("--limit must be 1..25");
  }
  return { limit, apply, targetType };
}

async function main() {
  const input = options(process.argv.slice(2));
  const result = await runAIAcademicReviewBatch({ ...input, initiatedById: null });
  console.log(`AI academic review: ${input.apply ? "APPLIED" : "DRY_RUN"}`);
  console.log(`Candidates=${result.candidates} approved=${result.approved} flagged=${result.flagged} conflicts=${result.conflicts} errors=${result.errors}`);
  for (const item of result.results) {
    console.log(`${item.targetType}:${item.targetId} ${item.verdict} confidence=${item.confidence.toFixed(2)} providers=${item.providers.join("+") || "none"}`);
  }
  if (!input.apply) console.log("Database writes: 0 (use --apply after reviewing this output)");
}

main()
  .catch((error) => {
    console.error("AI academic review failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
