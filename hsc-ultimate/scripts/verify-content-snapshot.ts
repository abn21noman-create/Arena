import { readFileSync } from "node:fs";
import path from "node:path";
import { verifyAcademicContentSnapshot } from "@/lib/content-snapshot";

function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: npm run snapshot:verify -- <snapshot.json>");
  const absolute = path.resolve(file);
  const parsed = JSON.parse(readFileSync(absolute, "utf8")) as unknown;
  const result = verifyAcademicContentSnapshot(parsed);
  console.log(`Snapshot: ${path.relative(process.cwd(), absolute)}`);
  console.log(`Checksum: ${result.checksumValid ? "valid" : "INVALID"}`);
  console.log(`Sections: ${JSON.stringify(result.counts)}`);
  if (!result.valid) {
    for (const issue of result.issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }
  console.log("Academic snapshot integrity: PASS");
}

try {
  main();
} catch (error) {
  console.error("Snapshot verification failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
