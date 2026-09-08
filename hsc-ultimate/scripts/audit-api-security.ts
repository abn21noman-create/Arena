import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_ROUTE_PATTERNS = [
  /^app\/api\/health\/route\.ts$/,
  /^app\/api\/system-settings\/route\.ts$/,
  /^app\/api\/stats\/user-count\/route\.ts$/,
  /^app\/api\/public-profile\/.+\/route\.ts$/,
  /^app\/api\/push\/vapid-public-key\/route\.ts$/,
  /^app\/api\/auth\/.+\/route\.ts$/,
];
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function parseArgs(argv: string[]) {
  let strict = false;
  let out = "reports/api-security-audit-current.json";
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

function listRoutes() {
  return execFileSync("find", ["app/api", "-type", "f", "-name", "route.ts"], {
    encoding: "utf8",
  }).trim().split("\n").filter(Boolean).sort();
}

function methods(source: string) {
  return HTTP_METHODS.filter((method) =>
    new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b|export\\s+const\\s+${method}\\b`).test(source)
  );
}

function isIntentionalPublic(file: string) {
  return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(file));
}

function scanHardcodedSecrets() {
  const files = ["app", "lib", "components", "proxy.ts", "next.config.ts"];
  const patterns = [
    /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\bAIza[0-9A-Za-z_-]{30,}\b/,
    /\bghp_[A-Za-z0-9]{30,}\b/,
    /ADMIN_(?:EMAIL|PASS)\s*=\s*os\.environ\.get\([^,]+,\s*["'][^"']+["']\)/,
  ];
  const findings: Array<{ file: string; line: number; pattern: string }> = [];
  const sourceFiles = execFileSync("find", [
    ...files.filter((file) => !file.endsWith(".ts")),
    "-type", "f", "(", "-name", "*.ts", "-o", "-name", "*.tsx", ")",
  ], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const pythonFiles = execFileSync("find", ["scripts", "-type", "f", "-name", "*.py"], {
    encoding: "utf8",
  }).trim().split("\n").filter(Boolean);
  for (const file of [...sourceFiles, ...pythonFiles, "proxy.ts", "next.config.ts"]) {
    if (!file || !path.extname(file) || !existsSync(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      patterns.forEach((pattern) => {
        if (pattern.test(line)) findings.push({ file, line: index + 1, pattern: pattern.source });
      });
    });
  }
  return findings;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const routeFiles = listRoutes();
  const routes = routeFiles.map((file) => {
    const source = readFileSync(file, "utf8");
    const routeMethods = methods(source);
    const admin = file.startsWith("app/api/admin/");
    const cronProtected = source.includes("CRON_SECRET") && source.includes("authorization");
    const hasAdminGuard = source.includes("requireAdmin(") || /role\s*!==?\s*["']ADMIN/.test(source);
    const hasAuth = hasAdminGuard || cronProtected || [
      "auth()", "protectApiRoute(", "getServerSession",
    ].some((marker) => source.includes(marker));
    const routeRateLimit = source.includes("enforceRateLimit(") || source.includes("protectApiRoute(");
    const mutating = routeMethods.some((method) => method !== "GET");
    return {
      file,
      methods: routeMethods,
      admin,
      mutating,
      hasAuth,
      hasAdminGuard,
      routeRateLimit,
      intentionalPublic: isIntentionalPublic(file),
    };
  });

  const proxy = readFileSync("proxy.ts", "utf8");
  const nextConfig = readFileSync("next.config.ts", "utf8");
  const globalBaseline = {
    apiMatcher: proxy.includes('"/api/:path*"'),
    rateLimit: proxy.includes("api:global:") && proxy.includes("enforceRateLimit("),
    originGuard: proxy.includes("isTrustedMutationOrigin("),
    absoluteBodyLimit:
      proxy.includes("25 * 1024 * 1024") &&
      nextConfig.includes('proxyClientMaxBodySize: "25mb"'),
  };
  const requiredHeaders = [
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
    "Content-Security-Policy-Report-Only",
    "Cross-Origin-Opener-Policy",
    "X-Permitted-Cross-Domain-Policies",
  ];
  const missingHeaders = requiredHeaders.filter((header) => !nextConfig.includes(header));
  const adminWithoutGuard = routes.filter((route) => route.admin && !route.hasAdminGuard);
  const unauthorizedPrivate = routes.filter((route) =>
    !route.hasAuth && !route.intentionalPublic
  );
  const mutationWithoutAuth = routes.filter((route) =>
    route.mutating && !route.hasAuth && !route.intentionalPublic
  );
  const publicMutations = routes.filter((route) =>
    route.mutating && !route.hasAuth && route.intentionalPublic
  );
  const rawUnsafeFiles = ["app", "lib"].flatMap((directory) => {
    try {
      const output = execFileSync("grep", [
        "-RIl", "--include=*.ts", "--include=*.tsx",
        "\\$queryRawUnsafe\\|\\$executeRawUnsafe", directory,
      ], { encoding: "utf8" }).trim();
      return output ? output.split("\n") : [];
    } catch {
      return [];
    }
  });
  const unsafeRawViolations = rawUnsafeFiles.filter((file) => file !== "lib/pdf-chat.ts");
  const pdfRaw = readFileSync("lib/pdf-chat.ts", "utf8");
  const pdfRawParameterized = pdfRaw.includes("$1::vector") && pdfRaw.includes("$2") && pdfRaw.includes("$3");
  const hardcodedSecrets = scanHardcodedSecrets();

  const blockers = [
    ...(adminWithoutGuard.length ? [`${adminWithoutGuard.length} admin routes lack role guard`] : []),
    ...(unauthorizedPrivate.length ? [`${unauthorizedPrivate.length} non-public routes lack auth`] : []),
    ...(mutationWithoutAuth.length ? [`${mutationWithoutAuth.length} private mutations lack auth`] : []),
    ...(!Object.values(globalBaseline).every(Boolean) ? ["global API baseline incomplete"] : []),
    ...(missingHeaders.length ? [`${missingHeaders.length} security headers missing`] : []),
    ...(unsafeRawViolations.length ? [`${unsafeRawViolations.length} unapproved unsafe raw-query files`] : []),
    ...(!pdfRawParameterized ? ["pgvector raw queries are not parameterized"] : []),
    ...(hardcodedSecrets.length ? [`${hardcodedSecrets.length} hardcoded secret patterns`] : []),
  ];
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: blockers.length ? "BLOCKED" : "PASS",
    routes: {
      total: routes.length,
      admin: routes.filter((route) => route.admin).length,
      adminWithoutGuard,
      authenticatedOrAdminOrCron: routes.filter((route) => route.hasAuth).length,
      intentionalPublic: routes.filter((route) => route.intentionalPublic).map((route) => ({ file: route.file, methods: route.methods })),
      unauthorizedPrivate,
      mutations: routes.filter((route) => route.mutating).length,
      mutationWithoutAuth,
      publicMutations: publicMutations.map((route) => ({ file: route.file, methods: route.methods })),
      routeSpecificRateLimit: routes.filter((route) => route.routeRateLimit).length,
      globalRateLimited: globalBaseline.apiMatcher && globalBaseline.rateLimit ? routes.length : 0,
    },
    globalBaseline,
    headers: { required: requiredHeaders, missing: missingHeaders },
    rawQueries: {
      files: [...new Set(rawUnsafeFiles)],
      approvedParameterizedPgvector: pdfRawParameterized,
      violations: unsafeRawViolations,
    },
    hardcodedSecrets,
    blockers,
    databaseWrites: 0,
    previewStarted: false,
  };

  mkdirSync(path.dirname(options.out), { recursive: true });
  writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log(`API security audit: ${report.status}`);
  console.log(`Routes: ${routes.length} · Admin guard gaps: ${adminWithoutGuard.length}`);
  console.log(`Private auth gaps: ${unauthorizedPrivate.length} · Mutation auth gaps: ${mutationWithoutAuth.length}`);
  console.log(`Global API rate coverage: ${report.routes.globalRateLimited}/${routes.length}`);
  console.log(`Security headers missing: ${missingHeaders.length}`);
  console.log(`Unsafe raw-query violations: ${unsafeRawViolations.length}`);
  console.log(`Hardcoded secret patterns: ${hardcodedSecrets.length}`);
  console.log(`Report: ${path.relative(ROOT, options.out)}`);
  if (options.strict && blockers.length > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error("API security audit failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
