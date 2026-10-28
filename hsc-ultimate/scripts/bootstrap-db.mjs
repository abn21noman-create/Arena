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
// env flags once the database is populated.
// ===================================================================
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (process.env.BOOTSTRAP_DB !== "1") {
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
const scripts = Object.keys(pkg.scripts ?? {}).filter((name) =>
  /^db:(seed|fix)/.test(name)
);

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
    failures.push(step.label);
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
