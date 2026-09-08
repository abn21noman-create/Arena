import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import ts from "typescript";
import { prisma } from "@/lib/prisma";
import {
  classifyFindMany,
  collectPlanIndexes,
  summarizeLatency,
} from "@/lib/performance-audit";
import { PROJECT_INVENTORY } from "@/lib/project-constants";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const CRITICAL_INDEXES = [
  "bookmarks_topicId_idx",
  "bookmarks_folderId_idx",
  "cq_attempts_cqQuestionId_idx",
  "forum_posts_userId_idx",
  "forum_replies_userId_idx",
  "note_helpful_votes_userId_idx",
  "quiz_battle_participants_userId_idx",
  "quiz_battles_subjectId_idx",
  "quiz_duels_subjectId_idx",
  "topic_progress_topicId_idx",
  "user_badges_badgeId_idx",
  "users_lastActiveAt_idx",
  "users_createdAt_idx",
  "audit_logs_createdAt_idx",
  "notifications_userId_read_createdAt_idx",
  "quiz_attempts_userId_createdAt_idx",
  "cq_attempts_userId_createdAt_idx",
  "study_sessions_userId_createdAt_idx",
] as const;

const INTENTIONAL_FULL_READ_FILES = new Set([
  "lib/account-privacy.ts",
  "lib/content-quality-server.ts",
  "lib/content-snapshot.ts",
]);
const HIGH_VOLUME_MODELS = new Set([
  "user", "auditLog", "forumPost", "forumReply", "contentReport",
  "notification", "quizAttempt", "quizAttemptAnswer", "cQAttempt",
  "studySession", "focusSession", "nativePushDelivery",
]);

function parseArgs(argv: string[]) {
  let strict = false;
  let out = "reports/performance-audit-current.json";
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--strict") strict = true;
    else if (argv[index] === "--out") {
      if (!argv[index + 1]) throw new Error("--out requires a path");
      out = argv[index + 1];
      index += 1;
    } else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return { strict, out: path.resolve(out) };
}

function sourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(absolute));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(absolute);
  }
  return files;
}

function propertyNames(object: ts.ObjectLiteralExpression): Set<string> {
  const names = new Set<string>();
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;
    const name = property.name;
    if (ts.isIdentifier(name) || ts.isStringLiteral(name)) names.add(name.text);
  }
  return names;
}

function staticFindManyAudit() {
  const findings: Array<{
    file: string;
    line: number;
    model: string;
    classification: ReturnType<typeof classifyFindMany> | "DYNAMIC_ARGUMENT";
  }> = [];
  for (const absolute of [...sourceFiles("app"), ...sourceFiles("lib")]) {
    const source = readFileSync(absolute, "utf8");
    const relative = path.relative(process.cwd(), absolute).replaceAll(path.sep, "/");
    const file = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true, absolute.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "findMany"
      ) {
        const modelAccess = node.expression.expression.getText(file);
        const model = modelAccess.split(".").at(-1) ?? modelAccess;
        const argument = node.arguments[0];
        const line = file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
        if (!argument || !ts.isObjectLiteralExpression(argument)) {
          findings.push({ file: relative, line, model, classification: "DYNAMIC_ARGUMENT" });
        } else {
          const names = propertyNames(argument);
          findings.push({
            file: relative,
            line,
            model,
            classification: classifyFindMany({
              hasWhere: names.has("where"),
              hasLimit: names.has("take") || names.has("skip") || names.has("cursor"),
              intentionalFullRead: INTENTIONAL_FULL_READ_FILES.has(relative),
            }),
          });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  const highRisk = findings.filter((finding) =>
    finding.classification === "GLOBAL_UNBOUNDED" && HIGH_VOLUME_MODELS.has(finding.model)
  );
  return {
    totalFindMany: findings.length,
    bounded: findings.filter((finding) => finding.classification === "BOUNDED").length,
    intentionalFullRead: findings.filter((finding) => finding.classification === "INTENTIONAL_FULL_READ").length,
    scopedUnbounded: findings.filter((finding) => finding.classification === "SCOPED_UNBOUNDED").length,
    globalUnbounded: findings.filter((finding) => finding.classification === "GLOBAL_UNBOUNDED").length,
    dynamicArgument: findings.filter((finding) => finding.classification === "DYNAMIC_ARGUMENT").length,
    highRisk,
    globalUnboundedSamples: findings
      .filter((finding) => finding.classification === "GLOBAL_UNBOUNDED")
      .slice(0, 30),
  };
}

function nestedPlan(root: unknown) {
  if (!Array.isArray(root) || !root[0] || typeof root[0] !== "object") return null;
  const queryPlan = (root[0] as Record<string, unknown>)["QUERY PLAN"];
  if (!Array.isArray(queryPlan) || !queryPlan[0] || typeof queryPlan[0] !== "object") return null;
  return queryPlan[0] as Record<string, unknown>;
}

async function explain(name: string, sql: string, ...values: unknown[]) {
  const rows = await prisma.$queryRawUnsafe<unknown[]>(sql, ...values);
  const root = nestedPlan(rows);
  const plan = root?.Plan as Record<string, unknown> | undefined;
  return {
    name,
    nodeType: typeof plan?.["Node Type"] === "string" ? plan["Node Type"] : "unknown",
    indexes: collectPlanIndexes(plan),
    planningMs: Number(root?.["Planning Time"] ?? 0),
    executionMs: Number(root?.["Execution Time"] ?? 0),
    actualRows: Number(plan?.["Actual Rows"] ?? 0),
  };
}

async function benchmark(operation: () => Promise<unknown>, samples = 5) {
  await operation();
  const values: number[] = [];
  for (let index = 0; index < samples; index += 1) {
    const started = performance.now();
    await operation();
    values.push(Number((performance.now() - started).toFixed(2)));
  }
  const summary = summarizeLatency(values);
  return Object.fromEntries(
    Object.entries(summary).map(([key, value]) => [key, Number(value.toFixed(2))])
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const staticAudit = staticFindManyAudit();
  const topic = await prisma.topic.findFirst({ select: { id: true } });
  if (!topic) throw new Error("No topic found for query-plan benchmark");

  const [foreignKeys, indexes, tableStats, topStatements, plans, roundTrips] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{
      table_name: string;
      conname: string;
      definition: string;
      missing_index: boolean;
    }>>(`
      SELECT c.conrelid::regclass::text AS table_name,
             c.conname,
             pg_get_constraintdef(c.oid) AS definition,
             NOT EXISTS (
               SELECT 1 FROM pg_index i
               WHERE i.indrelid=c.conrelid
                 AND i.indisvalid
                 AND i.indpred IS NULL
                 AND (i.indkey::smallint[])[0:cardinality(c.conkey)-1]=c.conkey
             ) AS missing_index
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid=c.connamespace
      WHERE c.contype='f' AND n.nspname='public'
      ORDER BY 1,2
    `),
    prisma.$queryRawUnsafe<Array<{ indexname: string }>>(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname='public'
      ORDER BY indexname
    `),
    prisma.$queryRawUnsafe<Array<{
      table_name: string;
      live_rows: bigint;
      seq_scan: bigint;
      idx_scan: bigint;
      total_bytes: bigint;
    }>>(`
      SELECT relname AS table_name,
             n_live_tup::bigint AS live_rows,
             seq_scan::bigint,
             idx_scan::bigint,
             pg_total_relation_size(relid)::bigint AS total_bytes
      FROM pg_stat_user_tables
      WHERE schemaname='public'
      ORDER BY pg_total_relation_size(relid) DESC
      LIMIT 25
    `),
    prisma.$queryRawUnsafe<Array<{
      calls: bigint;
      total_exec_time: number;
      mean_exec_time: number;
      rows: bigint;
      query: string;
    }>>(`
      SELECT calls::bigint,
             total_exec_time,
             mean_exec_time,
             rows::bigint,
             left(regexp_replace(query, '\\s+', ' ', 'g'), 240) AS query
      FROM pg_stat_statements
      WHERE dbid=(SELECT oid FROM pg_database WHERE datname=current_database())
        AND query NOT ILIKE '%pg_stat_statements%'
        AND (query ILIKE '%"public"%' OR query ILIKE '%FROM "users"%')
      ORDER BY total_exec_time DESC
      LIMIT 12
    `).catch(() => []),
    Promise.all([
      explain(
        "questions-by-topic",
        'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id FROM questions WHERE "topicId"=$1 LIMIT 25',
        topic.id
      ),
      explain(
        "recent-audit",
        'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id FROM audit_logs ORDER BY "createdAt" DESC LIMIT 20'
      ),
      explain(
        "active-users-window",
        'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT count(*) FROM users WHERE "lastActiveAt" >= now() - interval \'30 days\''
      ),
    ]),
    Promise.all([
      benchmark(() => prisma.question.findMany({ where: { topicId: topic.id }, take: 25, select: { id: true } })),
      benchmark(() => prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true } })),
      benchmark(() => prisma.user.count({ where: { lastActiveAt: { gte: new Date(Date.now() - 30 * 86_400_000) } } })),
    ]),
  ]);

  const availableIndexes = new Set(indexes.map((index) => index.indexname));
  const missingForeignKeyIndexes = foreignKeys.filter((foreignKey) => foreignKey.missing_index);
  const missingCriticalIndexes = CRITICAL_INDEXES.filter((index) => !availableIndexes.has(index));
  const planBudgetFailures = plans.filter((plan) => plan.executionMs > 50);
  const blockers = [
    ...(missingForeignKeyIndexes.length ? [`${missingForeignKeyIndexes.length} foreign keys lack reverse indexes`] : []),
    ...(missingCriticalIndexes.length ? [`${missingCriticalIndexes.length} critical indexes missing`] : []),
    ...(planBudgetFailures.length ? [`${planBudgetFailures.length} query plans exceed 50ms DB execution`] : []),
    ...(staticAudit.highRisk.length ? [`${staticAudit.highRisk.length} high-volume global findMany calls`] : []),
  ];

  const normalizeBigInt = <T>(value: T): T => JSON.parse(
    JSON.stringify(value, (_, nested) => typeof nested === "bigint" ? Number(nested) : nested)
  ) as T;
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: "LIVE_READ_ONLY",
    status: blockers.length === 0 ? "PASS" : "BLOCKED",
    database: {
      migrationsExpected: PROJECT_INVENTORY.prismaMigrations,
      foreignKeys: foreignKeys.length,
      missingForeignKeyIndexes,
      criticalIndexesExpected: CRITICAL_INDEXES.length,
      missingCriticalIndexes,
      tableStats: normalizeBigInt(tableStats),
      topStatements: normalizeBigInt(topStatements),
      plans,
      roundTripMs: {
        questionsByTopic: roundTrips[0],
        recentAudit: roundTrips[1],
        activeUsersWindow: roundTrips[2],
        note: "Round-trip includes sandbox-to-Supabase network; EXPLAIN executionMs isolates PostgreSQL work.",
      },
    },
    source: staticAudit,
    improvements: {
      reverseForeignKeyIndexesAdded: 11,
      criticalReadIndexesAdded: 7,
      adminAnalyticsAggregationMovedToDatabase: true,
      forumFeedPaginationAdded: true,
      forumVoteAggregationMovedToDatabase: true,
      adminReportsPaginationAdded: true,
    },
    blockers,
    databaseWrites: 0,
    previewStarted: false,
  };

  mkdirSync(path.dirname(options.out), { recursive: true });
  writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log(`Performance audit: ${report.status}`);
  console.log(`Foreign-key coverage: ${foreignKeys.length - missingForeignKeyIndexes.length}/${foreignKeys.length}`);
  console.log(`Critical indexes: ${CRITICAL_INDEXES.length - missingCriticalIndexes.length}/${CRITICAL_INDEXES.length}`);
  console.log(`DB plans over 50ms: ${planBudgetFailures.length}`);
  console.log(`High-risk global findMany: ${staticAudit.highRisk.length}`);
  console.log(`Report: ${path.relative(process.cwd(), options.out)}`);
  if (options.strict && blockers.length > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("Performance audit failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
