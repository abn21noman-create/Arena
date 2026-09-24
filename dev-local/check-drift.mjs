// ===================================================================
// Prisma schema <-> live database drift detector (sandbox-only).
// -------------------------------------------------------------------
// The repository's migrations are a *reconstructed* baseline, so the
// applied DDL and the current schema.prisma can drift apart.
//
// Parses prisma/schema.prisma and compares it against the live
// PostgreSQL schema, reporting every missing table, column, enum and
// enum value. `prisma migrate diff` can't be used here because the
// schema-engine binary is unobtainable (binaries.prisma.sh blocked).
// ===================================================================
import fs from "node:fs";
import path from "node:path";

const REPO = process.env.ARENA_REPO || "/home/user/Arena/hsc-ultimate";
const pg = (await import(path.join(REPO, "node_modules/pg/lib/index.js"))).default;
const { Client } = pg;

const SCHEMA_PATH = path.join(REPO, "prisma/schema.prisma");
const CONNECTION =
  process.env.LOCAL_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/hsc_ultimate";

const SCALARS = {
  String: "text",
  Int: "integer",
  Float: "double precision",
  Boolean: "boolean",
  DateTime: "timestamp",
  Json: "jsonb",
  Decimal: "numeric",
  BigInt: "bigint",
  Bytes: "bytea",
};

// ---------- parse schema.prisma ----------
const schema = fs.readFileSync(SCHEMA_PATH, "utf8");

const enums = {};
for (const m of schema.matchAll(/^enum\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
  const [, name, body] = m;
  enums[name] = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"))
    .map((l) => l.split(/[\s(]/)[0])
    .filter(Boolean);
}

const modelNames = new Set();
const rawModels = [];
for (const m of schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
  modelNames.add(m[1]);
  rawModels.push([m[1], m[2]]);
}

const models = [];
for (const [modelName, body] of rawModels) {
  const mapMatch = body.match(/@@map\("([^"]+)"\)/);
  const table = mapMatch ? mapMatch[1] : modelName;
  const fields = [];

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("@@")) continue;

    const fm = line.match(/^(\w+)\s+([\w.]+)(\[\])?(\?)?(.*)$/);
    if (!fm) continue;
    const [, fieldName, fieldType, isList, optional, rest] = fm;

    if (isList) continue;
    if (modelNames.has(fieldType)) continue;
    if (rest.includes("@relation")) continue;

    const mapF = rest.match(/@map\("([^"]+)"\)/);
    const column = mapF ? mapF[1] : fieldName;

    let pgType;
    let enumName = null;
    if (fieldType.startsWith("Unsupported")) {
      pgType = "unsupported";
    } else if (SCALARS[fieldType]) {
      pgType = SCALARS[fieldType];
    } else if (enums[fieldType]) {
      pgType = "enum";
      enumName = fieldType;
    } else {
      pgType = "unknown";
    }

    fields.push({ fieldName, column, fieldType, pgType, enumName, optional: Boolean(optional) });
  }

  models.push({ modelName, table, fields });
}

// ---------- read live database ----------
const client = new Client({ connectionString: CONNECTION, ssl: false });
await client.connect();

const { rows: tableRows } = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`);
const liveTables = new Set(tableRows.map((r) => r.table_name));

const { rows: columnRows } = await client.query(`
  SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`);
const liveColumns = new Map();
for (const r of columnRows) {
  if (!liveColumns.has(r.table_name)) liveColumns.set(r.table_name, new Set());
  liveColumns.get(r.table_name).add(r.column_name);
}

const { rows: enumRows } = await client.query(`
  SELECT t.typname AS enum_name, e.enumlabel AS enum_value
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'`);
const liveEnums = new Map();
for (const r of enumRows) {
  if (!liveEnums.has(r.enum_name)) liveEnums.set(r.enum_name, new Set());
  liveEnums.get(r.enum_name).add(r.enum_value);
}

// ---------- compare ----------
const problems = { missingTables: [], missingColumns: [], missingEnums: [], missingEnumValues: [] };

for (const name of Object.keys(enums)) {
  if (!liveEnums.has(name)) {
    problems.missingEnums.push(name);
    continue;
  }
  for (const value of enums[name]) {
    if (!liveEnums.get(name).has(value)) problems.missingEnumValues.push(`${name}.${value}`);
  }
}

for (const model of models) {
  if (!liveTables.has(model.table)) {
    problems.missingTables.push(model.table);
    continue;
  }
  const cols = liveColumns.get(model.table) ?? new Set();
  for (const f of model.fields) {
    if (!cols.has(f.column)) {
      problems.missingColumns.push({
        table: model.table,
        column: f.column,
        type: f.enumName ?? f.pgType,
        optional: f.optional,
      });
    }
  }
}

const total =
  problems.missingTables.length +
  problems.missingColumns.length +
  problems.missingEnums.length +
  problems.missingEnumValues.length;

console.log(`schema.prisma: ${models.length} models, ${Object.keys(enums).length} enums`);
console.log(`live database: ${liveTables.size} tables, ${liveEnums.size} enums`);
console.log(`DRIFT: ${total} issue(s)`);

if (problems.missingEnums.length) {
  console.log(`  missing enums: ${problems.missingEnums.join(", ")}`);
}
if (problems.missingEnumValues.length) {
  console.log(`  missing enum values: ${problems.missingEnumValues.join(", ")}`);
}
if (problems.missingTables.length) {
  console.log(`  missing tables: ${problems.missingTables.join(", ")}`);
}
if (problems.missingColumns.length) {
  console.log(
    `  missing columns: ${problems.missingColumns.map((c) => `${c.table}.${c.column}`).join(", ")}`
  );
}

fs.writeFileSync("/tmp/drift-report.json", JSON.stringify(problems, null, 2));
await client.end();
process.exit(total === 0 ? 0 : 1);
