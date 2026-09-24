// ===================================================================
// Local migration runner for HSC Ultimate (sandbox-only)
// -------------------------------------------------------------------
// Prisma CLI needs the `schema-engine` binary, which cannot be
// downloaded here (binaries.prisma.sh is blocked). This runner does
// exactly what `prisma migrate deploy` does:
//   - ensures the _prisma_migrations bookkeeping table exists
//   - applies every prisma/migrations/*/migration.sql in order
//   - records name + sha256 checksum + applied_steps_count
//
// It also applies ONE sandbox-only compatibility transform, in memory
// only (repo files are never modified):
//   * pgvector has no prebuilt binaries and Postgres server headers are
//     not available, so `vector(1024)` -> `double precision[]` and the
//     HNSW index is skipped.
// ===================================================================
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const REPO = process.env.ARENA_REPO || "/home/user/Arena/hsc-ultimate";
const pg = (await import(path.join(REPO, "node_modules/pg/lib/index.js"))).default;
const { Client } = pg;

const MIGRATIONS_DIR = path.join(REPO, "prisma/migrations");
const CONNECTION_STRING =
  process.env.LOCAL_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/hsc_ultimate";

const VECTOR_COLUMN = /"embedding"\s+vector\(1024\)/g;
const HNSW_LINE = /USING\s+hnsw/i;

function transform(sql) {
  const after = sql
    .split("\n")
    .filter((line) => !HNSW_LINE.test(line))
    .join("\n")
    .replace(VECTOR_COLUMN, '"embedding" double precision[]');
  return { after, changed: after !== sql };
}

const checksum = (sql) => crypto.createHash("sha256").update(sql).digest("hex");

const client = new Client({ connectionString: CONNECTION_STRING, ssl: false });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  VARCHAR(36)  PRIMARY KEY NOT NULL,
    "checksum"            VARCHAR(64)  NOT NULL,
    "finished_at"         TIMESTAMPTZ,
    "migration_name"      VARCHAR(255) NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      TIMESTAMPTZ,
    "started_at"          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER      NOT NULL DEFAULT 0
  );
`);

const applied = new Set(
  (
    await client.query(
      `SELECT migration_name FROM "_prisma_migrations" WHERE rolled_back_at IS NULL`
    )
  ).rows.map((r) => r.migration_name)
);

const dirs = fs
  .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let ran = 0;
let skipped = 0;
let transformed = 0;

for (const name of dirs) {
  if (applied.has(name)) {
    skipped += 1;
    continue;
  }

  const file = path.join(MIGRATIONS_DIR, name, "migration.sql");
  const originalSql = fs.readFileSync(file, "utf8");
  const { after: sql, changed } = transform(originalSql);

  const id = crypto.randomUUID();
  await client.query(
    `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count)
     VALUES ($1, $2, $3, now(), 0)
     ON CONFLICT ("id") DO NOTHING`,
    [id, checksum(originalSql), name]
  );

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      `UPDATE "_prisma_migrations" SET finished_at = now(), applied_steps_count = 1 WHERE id = $1`,
      [id]
    );
    await client.query("COMMIT");
    ran += 1;
    if (changed) transformed += 1;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    await client
      .query(`UPDATE "_prisma_migrations" SET logs = $2 WHERE id = $1`, [id, String(err.message)])
      .catch(() => {});
    console.error(`\n❌ FAILED: ${name}\n   ${err.message}\n`);
    await client.end();
    process.exit(1);
  }
}

const { rows } = await client.query(`
  SELECT
    (SELECT count(*) FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tables,
    (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typtype = 'e') AS enums
`);

console.log(
  `migrations: ${ran} applied, ${skipped} already present` +
    `${transformed ? `, ${transformed} with pgvector compat` : ""}`
);
console.log(`public schema: ${rows[0].tables} tables, ${rows[0].enums} enums`);

await client.end();
