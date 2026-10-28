// ===================================================================
// One-shot database bootstrap (schema + content seed)
// -------------------------------------------------------------------
// Vercel/serverless builds cannot be reached from a laptop, and the
// Supabase database is not exposed to this environment, so the only place
// with both `DATABASE_URL` and the seed scripts is the build container.
//
// Usage (Vercel project env): BOOTSTRAP_DB=1
//   also required for the destructive legacy seeds:
//     ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND_THIS_DELETES_DATA
//     ALLOW_REMOTE_DESTRUCTIVE_SEED=REMOTE_DATABASE_BACKUP_VERIFIED
//
// It is a no-op unless BOOTSTRAP_DB=1, never fails the build (a seed error is
// logged and the next step continues), and should be removed together with the
// env flag once the database is populated.
// ===================================================================
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (process.env.BOOTSTRAP_DB !== "1") {
  process.exit(0);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

/**
 * The baseline migration declares `embedding vector(1024)`; pgvector is not
 * enabled by default on a fresh Supabase project, so the very first migration
 * aborts with `type "vector" does not exist`. A failed migration also leaves a
 * half-written row in `_prisma_migrations` that blocks every later attempt, so
 * clean that up before retrying.
 */
async function prepareDatabase() {
  if (!connectionString) {
    console.error("[bootstrap-db] no DIRECT_URL/DATABASE_URL — skipping");
    return false;
  }
  const { Client } = await import("pg");
  // `sslmode=require` in the URL makes pg-connection-string treat the mode as
  // verify-full, which fails against Supabase's pooler certificate chain. Strip
  // it and pass an explicit relaxed ssl object instead.
  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  const client = new Client({
    connectionString: url.toString(),
    ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS vector SCHEMA public");
    console.log("[bootstrap-db] extension vector ready");
    const cleared = await client.query(
      "DELETE FROM _prisma_migrations WHERE finished_at IS NULL AND rolled_back_at IS NULL"
    ).catch(() => ({ rowCount: 0 }));
    if (cleared.rowCount) console.log(`[bootstrap-db] cleared ${cleared.rowCount} unfinished migration row(s)`);
    return true;
  } finally {
    await client.end().catch(() => {});
  }
}

try {
  await prepareDatabase();
} catch (error) {
  console.error(`[bootstrap-db] prepare failed: ${error instanceof Error ? error.message : error}`);
}

const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
const scripts = Object.keys(pkg.scripts ?? {}).filter((name) => /^db:(seed|fix)/.test(name));

const steps = [
  { label: "prisma migrate deploy", command: "node_modules/.bin/prisma", args: ["migrate", "deploy"] },
  ...scripts.map((name) => ({ label: `npm run ${name}`, command: "npm", args: ["run", name] })),
];

const failures = [];
const started = Date.now();

for (const [index, step] of steps.entries()) {
  const t0 = Date.now();
  console.log(`\n[bootstrap-db] ${index + 1}/${steps.length} ▸ ${step.label}`);
  const result = spawnSync(step.command, step.args, {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, CI: "1" },
    shell: false,
  });
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  if (result.status === 0) {
    console.log(`[bootstrap-db] ✔ ${step.label} (${seconds}s)`);
  } else {
    console.error(`[bootstrap-db] ✖ ${step.label} exit=${result.status} (${seconds}s) — continuing`);
    failures.push(`${step.label} (exit ${result.status})`);
  }
  // A missing schema makes every later seed fail instantly; stop early instead
  // of burning the build on 45 pointless runs.
  if (index === 0 && result.status !== 0) {
    console.error("[bootstrap-db] schema step failed — aborting remaining seeds");
    break;
  }
}

console.log(
  `\n[bootstrap-db] done in ${((Date.now() - started) / 1000).toFixed(1)}s — ` +
    `${steps.length - failures.length}/${steps.length} ok`
);
if (failures.length > 0) {
  console.log(`[bootstrap-db] failed steps:\n - ${failures.join("\n - ")}`);
}
// Never break the deployment because of a content seed.
process.exit(0);
