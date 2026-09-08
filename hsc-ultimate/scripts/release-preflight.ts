import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { ACADEMIC_CONTENT_BASELINE, PROJECT_INVENTORY } from "@/lib/project-constants";
import { getPolicyReadiness } from "@/lib/privacy-compliance";
import {
  aggregateFileChecksums,
  deriveReleasePreflightStatus,
  reportContainsForbiddenSecretKey,
  sha256Text,
  type PreflightCheck,
} from "@/lib/release-preflight";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".mts", ".js", ".mjs", ".json", ".prisma",
  ".sql", ".sh", ".py", ".java", ".gradle", ".properties", ".xml",
]);
const SOURCE_ROOTS = [
  "app", "components", "hooks", "lib", "prisma", "scripts", "tests",
  "android/app/src", ".github/workflows",
];
const CRITICAL_FILES = [
  "package.json",
  "package-lock.json",
  "prisma/schema.prisma",
  "Dockerfile",
  ".github/workflows/ci.yml",
  "next.config.ts",
  "tsconfig.typecheck.json",
  "capacitor.config.ts",
  "android/build.gradle",
  "android/app/build.gradle",
  "android/gradle.properties",
  "android/gradle/wrapper/gradle-wrapper.properties",
];

function parseArgs(argv: string[]) {
  let strict = false;
  let offline = false;
  let out = "reports/release-preflight-current.json";
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--strict") strict = true;
    else if (argv[index] === "--offline") offline = true;
    else if (argv[index] === "--out") {
      if (!argv[index + 1]) throw new Error("--out requires a file path");
      out = argv[index + 1];
      index += 1;
    } else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return { strict, offline, out: path.resolve(out) };
}

function walk(directory: string, files: string[] = []): string[] {
  if (!existsSync(directory)) return files;
  for (const name of readdirSync(directory)) {
    const absolute = path.join(directory, name);
    const relative = path.relative(ROOT, absolute).replaceAll(path.sep, "/");
    if (["node_modules", ".next", ".cache", "build", "coverage", "out"].includes(name)) continue;
    const stat = statSync(absolute);
    if (stat.isDirectory()) walk(absolute, files);
    else if (stat.isFile() && SOURCE_EXTENSIONS.has(path.extname(name))) files.push(relative);
  }
  return files;
}

function countFiles(directory: string, predicate: (file: string) => boolean): number {
  return walk(path.resolve(directory), []).filter(predicate).length;
}

function sourceManifest() {
  const paths = [
    ...SOURCE_ROOTS.flatMap((root) => walk(path.resolve(root), [])),
    ...CRITICAL_FILES.filter((file) => existsSync(path.resolve(file))),
  ];
  const unique = [...new Set(paths)].sort();
  const files = unique.map((relative) => ({
    path: relative,
    sha256: sha256Text(readFileSync(path.resolve(relative))),
  }));
  const migrationFiles = files.filter((file) => /^prisma\/migrations\/.+\/migration\.sql$/.test(file.path));
  return {
    fileCount: files.length,
    aggregateSha256: aggregateFileChecksums(files),
    migrationAggregateSha256: aggregateFileChecksums(migrationFiles),
    critical: Object.fromEntries(
      files.filter((file) => CRITICAL_FILES.includes(file.path)).map((file) => [file.path, file.sha256])
    ),
  };
}

function inventory() {
  const schema = readFileSync(path.resolve("prisma/schema.prisma"), "utf8");
  return {
    pages: countFiles("app", (file) => file.endsWith("/page.tsx")),
    apiRoutes: countFiles("app/api", (file) => file.endsWith("/route.ts")),
    components: countFiles("components", (file) => /\.(?:ts|tsx)$/.test(file)),
    libraryFiles: countFiles("lib", (file) => /\.(?:ts|tsx)$/.test(file)),
    prismaModels: (schema.match(/^model\s+/gm) ?? []).length,
    prismaMigrations: readdirSync(path.resolve("prisma/migrations"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory()).length,
  };
}

function productionAudit() {
  const result = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 120_000,
  });
  try {
    const report = JSON.parse(result.stdout) as {
      metadata?: { vulnerabilities?: Record<string, number> };
    };
    const vulnerabilities = report.metadata?.vulnerabilities ?? {};
    const total = Number(vulnerabilities.total ?? 0);
    return { available: true, total, exitCode: result.status ?? 1 };
  } catch {
    return { available: false, total: -1, exitCode: result.status ?? 1 };
  }
}

function addCheck(
  checks: PreflightCheck[],
  id: string,
  status: PreflightCheck["status"],
  detail: string
) {
  checks.push({ id, status, detail });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const checks: PreflightCheck[] = [];
  const currentInventory = inventory();
  const manifest = sourceManifest();
  const audit = productionAudit();
  const packageJson = JSON.parse(readFileSync(path.resolve("package.json"), "utf8")) as {
    version: string;
    packageManager?: string;
  };

  addCheck(checks, "node", Number(process.versions.node.split(".")[0]) >= 22 ? "PASS" : "FAIL", process.version);
  addCheck(
    checks,
    "package-manager",
    packageJson.packageManager?.startsWith("npm@") && existsSync("package-lock.json") ? "PASS" : "FAIL",
    packageJson.packageManager ?? "missing"
  );
  const legacyLocks = ["pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock"].filter(existsSync);
  addCheck(checks, "single-lockfile", legacyLocks.length === 0 ? "PASS" : "FAIL", legacyLocks.length ? legacyLocks.join(",") : "npm lock only");
  const policyReadiness = getPolicyReadiness();
  const policyFiles = [
    "app/privacy/page.tsx",
    "app/terms/page.tsx",
    "app/account-deletion/page.tsx",
  ];
  const policyFilesReady = policyFiles.every(existsSync);
  addCheck(
    checks,
    "privacy-compliance",
    policyReadiness.ready && policyFilesReady ? "PASS" : "FAIL",
    `privacy ${policyReadiness.versions.privacy} · terms ${policyReadiness.versions.terms} · ${policyFilesReady ? "public routes present" : "route missing"}`
  );
  const truthfulRuntime =
    !existsSync("app/api/singularity") &&
    !existsSync("lib/singularity") &&
    readFileSync("app/page.tsx", "utf8").includes("prisma.subject.count()") &&
    readFileSync("public/sw.js", "utf8").includes("PUBLIC_CACHEABLE_PATHS");
  addCheck(
    checks,
    "runtime-truth-integrity",
    truthfulRuntime ? "PASS" : "FAIL",
    truthfulRuntime ? "live landing + no prototype API + public-only page cache" : "runtime integrity regression"
  );

  for (const [key, expected] of Object.entries(PROJECT_INVENTORY)) {
    const actual = currentInventory[key as keyof typeof currentInventory];
    addCheck(checks, `inventory-${key}`, actual === expected ? "PASS" : "FAIL", `${actual}/${expected}`);
  }
  addCheck(checks, "source-manifest", manifest.fileCount > 0 ? "PASS" : "FAIL", `${manifest.fileCount} files`);
  addCheck(checks, "production-audit", audit.available && audit.total === 0 ? "PASS" : "FAIL", audit.available ? `${audit.total} vulnerabilities` : "audit unavailable");
  const generatedBackups = existsSync("backups")
    ? readdirSync("backups").filter((name) => name !== ".gitkeep")
    : [];
  addCheck(checks, "backup-hygiene", generatedBackups.length === 0 ? "PASS" : "FAIL", `${generatedBackups.length} generated files`);
  addCheck(checks, "android-local-path", existsSync("android/local.properties") ? "FAIL" : "PASS", existsSync("android/local.properties") ? "local.properties present" : "clean");
  addCheck(checks, "build-artifact", existsSync(".next/BUILD_ID") ? "PASS" : "WARN", existsSync(".next/BUILD_ID") ? "BUILD_ID present" : "run npm run build");

  let live: Record<string, unknown> | null = null;
  let deploymentPending: string[] = ["liveDatabaseChecks"];
  let prismaDisconnect: (() => Promise<void>) | null = null;

  if (!options.offline) {
    const { prisma } = await import("@/lib/prisma");
    const { buildContentQualitySnapshot } = await import("@/lib/content-quality-server");
    const {
      buildAcademicContentSnapshot,
      verifyAcademicContentSnapshot,
    } = await import("@/lib/content-snapshot");
    const { getDeploymentReadiness } = await import("@/lib/system-operations");
    prismaDisconnect = () => prisma.$disconnect();

    const [migrationRows, quality, snapshot] = await Promise.all([
      prisma.$queryRawUnsafe<Array<{ migration_name: string }>>(
        'SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL'
      ),
      buildContentQualitySnapshot({ view: "ALL", pageSize: 1 }),
      buildAcademicContentSnapshot(),
    ]);
    const snapshotVerification = verifyAcademicContentSnapshot(snapshot);
    const readiness = getDeploymentReadiness();
    deploymentPending = readiness.pending;

    addCheck(checks, "live-migrations", migrationRows.length === PROJECT_INVENTORY.prismaMigrations ? "PASS" : "FAIL", `${migrationRows.length}/${PROJECT_INVENTORY.prismaMigrations}`);
    const academicCountsMatch =
      snapshot.counts.subjects === ACADEMIC_CONTENT_BASELINE.subjects &&
      snapshot.counts.chapters === ACADEMIC_CONTENT_BASELINE.chapters &&
      snapshot.counts.topics === ACADEMIC_CONTENT_BASELINE.topics &&
      snapshot.counts.coreMcq === ACADEMIC_CONTENT_BASELINE.coreMcq &&
      snapshot.counts.admissionMcq === ACADEMIC_CONTENT_BASELINE.admissionMcq &&
      snapshot.counts.cq === ACADEMIC_CONTENT_BASELINE.cq &&
      snapshot.counts.badges === ACADEMIC_CONTENT_BASELINE.badges;
    addCheck(checks, "academic-baseline", academicCountsMatch ? "PASS" : "FAIL", `${quality.summary.total}/${ACADEMIC_CONTENT_BASELINE.totalReviewableItems} reviewable`);
    addCheck(checks, "content-blockers", quality.summary.blockerItems === 0 ? "PASS" : "FAIL", `${quality.summary.blockerItems} blockers`);
    addCheck(checks, "stale-reviews", quality.summary.staleReviews === 0 ? "PASS" : "FAIL", `${quality.summary.staleReviews} stale`);
    addCheck(checks, "academic-review-backlog", "WARN", `${quality.summary.unreviewed} unreviewed`);
    addCheck(checks, "snapshot-integrity", snapshotVerification.valid ? "PASS" : "FAIL", snapshotVerification.valid ? snapshot.checksum.value : snapshotVerification.issues.join("; "));

    live = {
      migrationsApplied: migrationRows.length,
      academicCounts: snapshot.counts,
      contentQuality: {
        total: quality.summary.total,
        blockers: quality.summary.blockerItems,
        warnings: quality.summary.warningItems,
        staleReviews: quality.summary.staleReviews,
        unreviewed: quality.summary.unreviewed,
      },
      snapshot: {
        checksum: snapshot.checksum.value,
        valid: snapshotVerification.valid,
      },
      deploymentReadiness: {
        readyCount: readiness.readyCount,
        totalChecks: readiness.totalChecks,
        pending: readiness.pending,
      },
    };
  } else {
    addCheck(checks, "live-database", "WARN", "offline mode skipped live checks");
  }

  let status = deriveReleasePreflightStatus({ checks, externalPending: deploymentPending });
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: options.offline ? "OFFLINE" : "LIVE_READ_ONLY",
    status,
    strictRequested: options.strict,
    application: {
      name: "HSC Ultimate",
      version: packageJson.version,
      node: process.version,
      npm: process.env.npm_config_user_agent?.split(" ")[0] ?? "npm",
    },
    inventory: currentInventory,
    checks,
    supplyChain: manifest,
    productionAudit: audit,
    live,
    externalPending: deploymentPending,
    reportContainsForbiddenSecretKey: false,
    databaseWrites: 0,
  };
  const forbidden = reportContainsForbiddenSecretKey(report);
  report.reportContainsForbiddenSecretKey = forbidden;
  if (forbidden) {
    addCheck(checks, "report-secret-shape", "FAIL", "forbidden secret-like key detected");
  } else {
    addCheck(checks, "report-secret-shape", "PASS", "no credential-value fields");
  }
  status = deriveReleasePreflightStatus({ checks, externalPending: deploymentPending });
  report.status = status;

  mkdirSync(path.dirname(options.out), { recursive: true });
  writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log(`Release preflight: ${status}`);
  console.log(`Checks: ${checks.filter((check) => check.status === "PASS").length} pass · ${checks.filter((check) => check.status === "WARN").length} warn · ${checks.filter((check) => check.status === "FAIL").length} fail`);
  console.log(`Source manifest: ${manifest.aggregateSha256}`);
  console.log(`External pending: ${deploymentPending.join(", ") || "none"}`);
  console.log(`Report: ${path.relative(ROOT, options.out)}`);

  if (prismaDisconnect) await prismaDisconnect();
  if (status === "BLOCKED" || (options.strict && status !== "DEPLOY_READY")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Release preflight failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
