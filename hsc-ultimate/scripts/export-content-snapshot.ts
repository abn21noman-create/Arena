import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { buildAcademicContentSnapshot } from "@/lib/content-snapshot";
import { prisma } from "@/lib/prisma";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

function outputPath(argv: string[]) {
  const index = argv.indexOf("--out");
  if (index >= 0) {
    const value = argv[index + 1];
    if (!value) throw new Error("--out requires a file path");
    return path.resolve(value);
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve(`backups/academic-content-${timestamp}.json`);
}

async function main() {
  const target = outputPath(process.argv.slice(2));
  const snapshot = await buildAcademicContentSnapshot();
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(snapshot, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  console.log(`Academic snapshot written: ${path.relative(process.cwd(), target)}`);
  console.log(`Checksum: ${snapshot.checksum.value}`);
  console.log(`Academic items: ${snapshot.counts.coreMcq + snapshot.counts.admissionMcq + snapshot.counts.cq + snapshot.counts.topics}`);
}

main()
  .catch((error) => {
    console.error("Snapshot export failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
