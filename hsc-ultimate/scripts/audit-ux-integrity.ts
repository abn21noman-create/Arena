import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { getRouteLabel } from "../lib/route-labels";
import { NAV_GROUPS } from "../lib/nav-modules";

interface CheckResult {
  id: string;
  status: "PASS" | "FAIL";
  detail: string;
}

const root = process.cwd();
const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outPath = outIndex >= 0 ? args[outIndex + 1] : undefined;

function walk(directory: string, suffix: string): string[] {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(relative, suffix) : entry.name.endsWith(suffix) ? [relative] : [];
  });
}

const tsxFiles = [...walk("app", ".tsx"), ...walk("components", ".tsx")];
const sourceByFile = new Map(tsxFiles.map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")]));
const checks: CheckResult[] = [];

function add(id: string, passed: boolean, detail: string) {
  checks.push({ id, status: passed ? "PASS" : "FAIL", detail });
}

function matchingFiles(pattern: RegExp): string[] {
  return [...sourceByFile.entries()]
    .filter(([, source]) => {
      pattern.lastIndex = 0;
      return pattern.test(source);
    })
    .map(([file]) => file);
}

const nestedButtonLinks = matchingFiles(/<Link\b[^>]*>\s*<(?:Button|button)\b/);
add(
  "no-nested-interactive-links",
  nestedButtonLinks.length === 0,
  nestedButtonLinks.length === 0
    ? "0 Link > Button/button nesting patterns"
    : nestedButtonLinks.slice(0, 8).join(", ")
);

const englishBackLabels = matchingFiles(/aria-label=["'](?:Back|Close)["']/);
add(
  "localized-control-labels",
  englishBackLabels.length === 0,
  englishBackLabels.length === 0 ? "Back/Close labels are localized" : englishBackLabels.join(", ")
);

const replacementCharacters = matchingFiles(/�/);
add(
  "no-broken-unicode",
  replacementCharacters.length === 0,
  replacementCharacters.length === 0 ? "No Unicode replacement characters" : replacementCharacters.join(", ")
);

const tinyTextPattern = /text-\[(?:[89](?:\.\d+)?|10(?:\.\d+)?|11(?:\.\d+)?)px\]/;
const tinyTextFiles = matchingFiles(tinyTextPattern);
add(
  "no-runtime-8-11px-text",
  tinyTextFiles.length === 0,
  tinyTextFiles.length === 0 ? "No 8–11px arbitrary runtime text" : tinyTextFiles.join(", ")
);

for (const required of [
  "app/loading.tsx",
  "app/error.tsx",
  "app/global-error.tsx",
  "app/not-found.tsx",
  "components/layout/route-experience.tsx",
  "components/layout/global-search.tsx",
]) {
  add(`required:${required}`, fs.existsSync(path.join(root, required)), required);
}

function pageFileToRoute(file: string): string {
  const withoutApp = file.replace(/^app\//, "").replace(/(?:^|\/)page\.tsx$/, "");
  const segments = withoutApp
    .split("/")
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .map((segment) => (segment.startsWith("[") ? "test-value" : segment));
  return segments.length ? `/${segments.join("/")}` : "/";
}

const pageFiles = walk("app", "page.tsx");
const unlabeledRoutes = pageFiles
  .map(pageFileToRoute)
  .filter((route) => route !== "/" && getRouteLabel(route) === "HSC Ultimate");
add(
  "route-context-coverage",
  unlabeledRoutes.length === 0,
  unlabeledRoutes.length === 0
    ? `${pageFiles.length}/${pageFiles.length} page routes have contextual labels`
    : `Missing: ${unlabeledRoutes.join(", ")}`
);

const pageRoutes = new Set(pageFiles.map(pageFileToRoute));
const unresolvedNavRoutes = NAV_GROUPS.flatMap((group) => group.items)
  .map((item) => item.href)
  .filter((href) => !pageRoutes.has(href));
add(
  "navigation-targets-exist",
  unresolvedNavRoutes.length === 0,
  unresolvedNavRoutes.length === 0
    ? `${NAV_GROUPS.flatMap((group) => group.items).length} navigation targets resolve to pages`
    : unresolvedNavRoutes.join(", ")
);

const pythonQaScripts = [
  "scripts/lib/live_test_support.py",
  "scripts/test-live-e2e.py",
  "scripts/test-live-api.py",
  "scripts/test-live-pages.py",
  "scripts/test-mobile-layout.py",
  "scripts/take-screenshots-live.py",
  "scripts/cleanup-test-data.py",
];
const pythonResult = spawnSync("python3", ["-m", "py_compile", ...pythonQaScripts], {
  cwd: root,
  encoding: "utf8",
});
add(
  "live-qa-python-syntax",
  pythonResult.status === 0,
  pythonResult.status === 0
    ? `${pythonQaScripts.length}/${pythonQaScripts.length} live QA scripts compile`
    : (pythonResult.stderr || pythonResult.stdout).trim().slice(0, 500)
);

const liveQaSources = [
  "scripts/test-live-e2e.py",
  "scripts/test-live-api.py",
  "scripts/test-live-pages.py",
  "scripts/test-mobile-layout.py",
  "scripts/take-screenshots-live.py",
].map((file) => fs.readFileSync(path.join(root, file), "utf8"));
add(
  "live-qa-exact-user-cleanup",
  liveQaSources.every((source) => !source.includes('DELETE FROM users WHERE email LIKE')),
  "Live suites never wildcard-delete test or real users"
);
add(
  "live-qa-owned-server-lifecycle",
  liveQaSources.every((source) => !source.includes("pkill -f")),
  "QA scripts never kill operator-managed Next.js processes"
);

const tabsSource = fs.readFileSync(path.join(root, "components/ui/tabs.tsx"), "utf8");
add(
  "horizontal-tabs-layout",
  tabsSource.includes("flex flex-col gap-2"),
  "Horizontal Tabs stack list and panel vertically on mobile"
);

const globalSearchSource = fs.readFileSync(path.join(root, "components/layout/global-search.tsx"), "utf8");
add(
  "search-request-cancellation",
  globalSearchSource.includes("AbortController") && globalSearchSource.includes("response.ok"),
  "Global search distinguishes errors and cancels stale requests"
);

const moreMenuSource = fs.readFileSync(path.join(root, "components/layout/more-menu-sheet.tsx"), "utf8");
add(
  "mobile-menu-discoverability",
  moreMenuSource.includes("মডিউল খোঁজো") && moreMenuSource.includes("getMoreMenuGroups"),
  "Mobile tools are grouped and searchable"
);

const passCount = checks.filter((check) => check.status === "PASS").length;
const failCount = checks.length - passCount;
const report = {
  generatedAt: new Date().toISOString(),
  scope: "feature-polish-ui-ux",
  summary: { total: checks.length, pass: passCount, fail: failCount },
  inventory: {
    pages: pageFiles.length,
    componentAndPageTsxFiles: tsxFiles.length,
    navigationTargets: NAV_GROUPS.flatMap((group) => group.items).length,
  },
  checks,
};

for (const check of checks) {
  console.log(`${check.status === "PASS" ? "✅" : "❌"} ${check.id}: ${check.detail}`);
}
console.log(`\nUX integrity: ${passCount} PASS · ${failCount} FAIL`);

if (outPath) {
  const absoluteOut = path.resolve(root, outPath);
  fs.mkdirSync(path.dirname(absoluteOut), { recursive: true });
  fs.writeFileSync(absoluteOut, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Report: ${path.relative(root, absoluteOut)}`);
}

process.exit(failCount > 0 ? 1 : 0);
