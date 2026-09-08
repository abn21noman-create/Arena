import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

interface Check {
  id: string;
  status: "PASS" | "FAIL";
  detail: string;
}

const RUNTIME_ROOTS = ["app", "components", "lib", "public"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".py"]);

function walk(relative: string, out: string[] = []): string[] {
  if (!existsSync(relative)) return out;
  for (const entry of readdirSync(relative)) {
    const absolute = path.join(relative, entry);
    if (["node_modules", ".next", "build"].includes(entry)) continue;
    const stat = statSync(absolute);
    if (stat.isDirectory()) walk(absolute, out);
    else if (stat.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry))) out.push(absolute);
  }
  return out;
}

function filesContaining(pattern: RegExp, files: string[]) {
  return files.filter((file) => pattern.test(readFileSync(file, "utf8")));
}

function parseArgs(argv: string[]) {
  let strict = false;
  let out = "reports/runtime-integrity-current.json";
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--strict") strict = true;
    else if (argv[index] === "--out") {
      if (!argv[index + 1]) throw new Error("--out requires a path");
      out = argv[++index];
    } else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return { strict, out: path.resolve(out) };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = RUNTIME_ROOTS.flatMap((root) => walk(root));
  const apiRoutes = walk("app/api").filter((file) => file.endsWith("route.ts"));
  const checks: Check[] = [];
  const add = (id: string, pass: boolean, detail: string) =>
    checks.push({ id, status: pass ? "PASS" : "FAIL", detail });

  add(
    "no-experimental-singularity-api",
    !existsSync("app/api/singularity") && !existsSync("lib/singularity"),
    "experimental fake/no-op runtime tree absent"
  );

  const forbiddenRuntimeMarkers = filesContaining(
    /Historical Mock Data|Simulated Hive|This is a Placeholder for actual widget content|Save to DB logic|Update user preference in database logic|FCM not yet wired|TODO:\s*integrate Resend|actions integrated successfully|Logic to iterate through actions/,
    files
  );
  add(
    "no-fake-noop-markers",
    forbiddenRuntimeMarkers.length === 0,
    forbiddenRuntimeMarkers.length ? forbiddenRuntimeMarkers.join(", ") : "0 forbidden markers"
  );

  const marketing = readFileSync("components/landing/landing-page.tsx", "utf8");
  const landingServer = readFileSync("app/page.tsx", "utf8");
  const forbiddenMarketing = [
    "testimonials",
    "AI-Verified",
    "sub-second response",
    "চিরকালের জন্য",
    "Loved by students",
    "∞",
  ].filter((marker) => marketing.includes(marker));
  add(
    "truthful-landing",
    forbiddenMarketing.length === 0 &&
      landingServer.includes("prisma.subject.count()") &&
      landingServer.includes("prisma.admissionQuestion.count()"),
    forbiddenMarketing.length ? forbiddenMarketing.join(", ") : "live DB counts and no fabricated social proof"
  );

  add(
    "no-cosmetic-language-toggle",
    !existsSync("components/i18n/language-toggle.tsx") &&
      !existsSync("app/api/user/language/route.ts"),
    "Bangla-first UI; partial locale toggle not exposed as a complete feature"
  );

  const unsafeJsonRoutes = apiRoutes.filter((file) => {
    const source = readFileSync(file, "utf8");
    return (
      (source.includes("await req.json()") && !source.includes("await req.json().catch")) ||
      (source.includes("await request.json()") && !source.includes("await request.json().catch"))
    );
  });
  add(
    "malformed-json-safe",
    unsafeJsonRoutes.length === 0,
    unsafeJsonRoutes.length ? unsafeJsonRoutes.join(", ") : `${apiRoutes.length} routes scanned`
  );

  const testFiles = walk("scripts").filter((file) => /(?:test|screenshot).*\.py$/.test(file));
  const credentialFallbacks = testFiles.filter((file) => {
    const source = readFileSync(file, "utf8");
    return /ADMIN_(?:EMAIL|PASS)\s*=\s*os\.environ\.get\([^,]+,\s*["'][^"']+["']/.test(source);
  });
  add(
    "no-test-credential-fallback",
    credentialFallbacks.length === 0,
    credentialFallbacks.length ? credentialFallbacks.join(", ") : "environment-only test credentials"
  );
  const registrationTests = [
    "scripts/test-live-e2e.py",
    "scripts/test-focus-e2e.py",
    "scripts/test-live-api.py",
  ];
  const staleRegistrationTests = registrationTests.filter((file) => {
    const source = readFileSync(file, "utf8");
    return source.includes("/api/auth/register") && !source.includes("policyAccepted");
  });
  add(
    "registration-tests-current",
    staleRegistrationTests.length === 0,
    staleRegistrationTests.length ? staleRegistrationTests.join(", ") : "all registration E2E payloads include current policy assurance"
  );

  const serviceWorker = readFileSync("public/sw.js", "utf8");
  add(
    "private-navigation-not-cached",
    serviceWorker.includes("PUBLIC_CACHEABLE_PATHS") &&
      serviceWorker.includes("Authenticated/personalized HTML is never written") &&
      !serviceWorker.includes('cache.put(request, clone));\n          return response;'),
    "only explicit public policy/landing pages may use HTML cache"
  );

  const globalCss = readFileSync("app/globals.css", "utf8");
  const tinyTextFiles = filesContaining(/text-\[(?:8|9|10|11)px\]/, files);
  add(
    "accessibility-controls-real",
    globalCss.includes("font-size: var(--a11y-font-size, 16px)") &&
      globalCss.includes("html.high-contrast") &&
      globalCss.includes("html.reduced-motion") &&
      tinyTextFiles.length === 0,
    tinyTextFiles.length ? tinyTextFiles.join(", ") : "font scale/contrast/motion wired; no 8–11px text"
  );

  const proxySource = readFileSync("proxy.ts", "utf8");
  const adminAuthSource = readFileSync("lib/admin-auth.ts", "utf8");
  add(
    "live-session-authorization",
    proxySource.includes("isSessionRevoked") &&
      proxySource.includes("authVersion") &&
      adminAuthSource.includes("isSessionRevoked") &&
      adminAuthSource.includes('current.role !== "ADMIN"'),
    "ban/delete/password/role changes checked against current User row"
  );

  const broadcast = readFileSync("lib/broadcast.ts", "utf8");
  add(
    "broadcast-real-channels-only",
    !broadcast.includes("FCM not yet wired") &&
      !broadcast.includes("TODO: integrate Resend") &&
      broadcast.includes("NO_REQUESTED_CHANNEL_DELIVERED"),
    "in-app/web-push outcome drives delivery counters"
  );

  const aiAcademicReview = readFileSync("lib/ai-academic-review.ts", "utf8");
  add(
    "multi-ai-approval-evidence",
    aiAcademicReview.includes("getIndependentAIResponses") &&
      aiAcademicReview.includes("reviews.length < 2") &&
      aiAcademicReview.includes("AI_ACADEMIC_APPROVAL_THRESHOLD") &&
      aiAcademicReview.includes('reviewerKind: "AI"') &&
      aiAcademicReview.includes("Pending student report unresolved"),
    "AI approval requires two providers, exact hash/evidence and transparent reviewer kind"
  );

  const academicReportApi = readFileSync("app/api/academic-reports/route.ts", "utf8");
  const qualityServer = readFileSync("lib/content-quality-server.ts", "utf8");
  const reportButton = readFileSync("components/shared/academic-report-button.tsx", "utf8");
  add(
    "academic-student-report-loop",
    academicReportApi.includes("getContentReviewTargetHash") &&
      academicReportApi.includes("contentHash") &&
      qualityServer.includes('view === "REPORTED"') &&
      reportButton.includes("Admin review queue-তে পাঠাও"),
    "student report is exact-hash-bound and visible in Admin-only review queue"
  );

  const featureRoutes = readFileSync("lib/feature-flag-routes.ts", "utf8");
  add(
    "feature-kill-switch-covers-api",
    featureRoutes.includes("API_PREFIXES") &&
      proxySource.includes("FEATURE_DISABLED") &&
      proxySource.includes("mutation সাময়িকভাবে বন্ধ"),
    "disabled modules close student APIs; maintenance pauses mutations"
  );

  const destructiveSeeds = readdirSync("prisma")
    .filter((name) => /^seed.*\.ts$/.test(name))
    .filter((name) => /\.delete(?:Many)?\(/.test(readFileSync(path.join("prisma", name), "utf8")));
  const unguardedSeeds = destructiveSeeds.filter(
    (name) => !readFileSync(path.join("prisma", name), "utf8").includes("assertDestructiveSeedAllowed")
  );
  add(
    "destructive-seeds-guarded",
    unguardedSeeds.length === 0,
    unguardedSeeds.length ? unguardedSeeds.join(", ") : `${destructiveSeeds.length} destructive seeds guarded`
  );

  const failed = checks.filter((check) => check.status === "FAIL");
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: failed.length === 0 ? "PASS" : "FAIL",
    runtimeFilesScanned: files.length,
    apiRoutesScanned: apiRoutes.length,
    checks,
    summary: {
      pass: checks.length - failed.length,
      fail: failed.length,
    },
    databaseWrites: 0,
  };
  mkdirSync(path.dirname(options.out), { recursive: true });
  writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(`Runtime integrity audit: ${report.status}`);
  console.log(`Checks: ${report.summary.pass} pass · ${report.summary.fail} fail`);
  console.log(`Routes: ${report.apiRoutesScanned}`);
  if (options.strict && failed.length > 0) process.exitCode = 1;
}

main();
