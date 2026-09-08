import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  DATA_FLOW_INVENTORY,
  EXTERNAL_PROCESSORS,
  POLICY_METADATA,
  RETENTION_SCHEDULE,
  getPolicyReadiness,
} from "@/lib/privacy-compliance";

interface AuditCheck {
  id: string;
  status: "PASS" | "WARN" | "FAIL";
  detail: string;
}

const ROOT = process.cwd();

function read(relative: string): string {
  const absolute = path.resolve(ROOT, relative);
  return existsSync(absolute) ? readFileSync(absolute, "utf8") : "";
}

function hasAll(source: string, values: readonly string[]) {
  return values.every((value) => source.includes(value));
}

function parseArgs(argv: string[]) {
  let strict = false;
  let out = "reports/privacy-compliance-current.json";
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--strict") strict = true;
    else if (argv[index] === "--out") {
      if (!argv[index + 1]) throw new Error("--out requires a path");
      out = argv[++index];
    } else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return { strict, out: path.resolve(ROOT, out) };
}

function add(
  checks: AuditCheck[],
  id: string,
  pass: boolean,
  detail: string,
  failure: AuditCheck["status"] = "FAIL"
) {
  checks.push({ id, status: pass ? "PASS" : failure, detail });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const checks: AuditCheck[] = [];
  const readiness = getPolicyReadiness();
  const privacy = read("app/privacy/page.tsx");
  const terms = read("app/terms/page.tsx");
  const deletion = read("app/account-deletion/page.tsx");
  const registerPage = read("app/(auth)/register/page.tsx");
  const registerRoute = read("app/api/auth/register/route.ts");
  const settings = read("components/settings/settings-form.tsx");
  const privacyControls = read("components/settings/privacy-controls-tab.tsx");
  const policyRoute = read("app/api/user/policy-acceptance/route.ts");
  const landing = `${read("app/page.tsx")}\n${read("components/landing/landing-page.tsx")}`;
  const onboarding = read("app/(auth)/onboarding/page.tsx");
  const exportLogic = read("lib/account-privacy.ts");
  const schema = read("prisma/schema.prisma");
  const migration = read("prisma/migrations/20260805000000_add_privacy_compliance/migration.sql");
  const focusConstants = read("lib/focus-constants.ts");
  const focusService = `${read("lib/focus.ts")}\n${read("lib/focus-schedule.ts")}`;
  const focusUi = read("components/focus/strict-focus-dashboard.tsx");
  const androidManifest = read("android/app/src/main/AndroidManifest.xml");
  const androidXml = `${read("android/app/src/main/res/xml/strict_focus_accessibility_service.xml")}\n${read("android/app/src/main/res/xml-v31/strict_focus_accessibility_service.xml")}`;
  const androidStrings = read("android/app/src/main/res/values/strings.xml");
  const aiProvider = read("lib/ai-provider.ts");
  const sitemap = read("app/sitemap.ts");
  const robots = read("app/robots.ts");
  const envExample = read(".env.example");

  add(checks, "metadata-readiness", readiness.ready, `${Object.values(readiness.checks).filter(Boolean).length}/${Object.keys(readiness.checks).length} metadata checks`);
  add(
    checks,
    "privacy-required-sections",
    privacy.length > 0 && POLICY_METADATA.privacy.requiredSectionIds.every((id) => privacy.includes(`id=\"${id}\"`)),
    `${POLICY_METADATA.privacy.requiredSectionIds.length} required sections`
  );
  add(
    checks,
    "terms-required-sections",
    terms.length > 0 && POLICY_METADATA.terms.requiredSectionIds.every((id) => terms.includes(`id=\"${id}\"`)),
    `${POLICY_METADATA.terms.requiredSectionIds.length} required sections`
  );
  add(
    checks,
    "public-account-deletion-guide",
    hasAll(deletion, ["/settings", "/forgot-password", "what-is-deleted", "cannot-access"]),
    "web deletion/export instructions and identity-safe fallback"
  );
  add(
    checks,
    "versioned-registration-acceptance",
    hasAll(registerPage, ["policyAccepted", "ageAssuranceConfirmed", "/privacy", "/terms"]) &&
      hasAll(registerRoute, ["policyAcceptance.create", "CURRENT_PRIVACY_VERSION", "CURRENT_TERMS_VERSION", "prisma.$transaction"]),
    "required UI assurance + atomic account/acceptance write"
  );
  add(
    checks,
    "existing-user-version-control",
    hasAll(settings, ["value=\"privacy\"", "PrivacyControlsTab"]) &&
      hasAll(privacyControls, ["isCurrentPolicyAcceptance", "/api/user/policy-acceptance"]) &&
      hasAll(policyRoute, ["POLICY_VERSION_OR_ASSURANCE_MISMATCH", "FOR UPDATE", "POLICY_ACCEPTANCE_RECORDED"]),
    "Settings current/stale status + idempotent acknowledgement API"
  );
  add(
    checks,
    "public-policy-links",
    hasAll(landing, ["href=\"/privacy\"", "href=\"/terms\"", "href=\"/account-deletion\""]) &&
      hasAll(onboarding, ["href=\"/privacy\"", "href=\"/terms\"", "href=\"/account-deletion\""]),
    "landing footer and onboarding"
  );
  add(
    checks,
    "portable-export-coverage",
    hasAll(exportLogic, [
      "exportVersion: 2",
      "pdfDocuments",
      "policyAcceptances",
      "focusSessions",
      "nativeDevices",
      "webPushRegistrations",
      "another user's private identity",
    ]),
    "account/learning/AI/PDF/Focus/device/consent export with credential exclusions"
  );
  add(
    checks,
    "deletion-reference-hygiene",
    hasAll(exportLogic, [
      "passwordResetToken.deleteMany",
      "broadcastRecipient.deleteMany",
      "actorEmail: null",
      "ipAddress: null",
      "targetType: \"DeletedUser\"",
      "policyAcceptances",
    ]),
    "cascade deletion + non-FK cleanup + retained audit de-identification"
  );
  add(
    checks,
    "immutable-policy-model",
    hasAll(schema, ["model PolicyAcceptance", "policy_acceptances", "onDelete: Cascade"]) &&
      hasAll(migration, ["CREATE TABLE \"policy_acceptances\"", "policy_acceptance_versions_key", "FOREIGN KEY"]),
    "version history model and additive migration"
  );
  add(
    checks,
    "focus-consent-version-gate",
    focusConstants.includes('FOCUS_CONSENT_VERSION = "2026-08-05"') &&
      focusConstants.includes("hasCurrentFocusConsent") &&
      focusService.includes("hasCurrentFocusConsent") &&
      focusUi.includes("FOCUS_CONSENT_VERSION"),
    "stale Focus consent cannot authorize Admin start/schedule"
  );
  add(
    checks,
    "accessibility-minimization",
    hasAll(androidManifest, [
      "StrictFocusAccessibilityService",
      'android:allowBackup="false"',
      'android:fullBackupContent="false"',
    ]) &&
      hasAll(androidXml, ['android:canRetrieveWindowContent="false"', 'android:isAccessibilityTool="false"']) &&
      hasAll(androidStrings, ["strict_focus_data_use_statement", "server-এ পাঠানো হয় না", "emergency exit"]) &&
      hasAll(focusUi, ["Accessibility permission disclosure", "accessibilityDisclosureAccepted", "/privacy#strict-focus"]),
    "package-only local access + separate prominent disclosure/affirmative action"
  );
  add(
    checks,
    "ai-provider-inventory",
    EXTERNAL_PROCESSORS.filter((processor) => ["Groq", "Mistral AI", "Cerebras", "OpenRouter"].includes(processor.name)).length === 4 &&
      hasAll(aiProvider, ["api.groq.com", "api.mistral.ai", "api.cerebras.ai", "openrouter.ai"]),
    "four configured AI paths disclosed"
  );
  add(checks, "data-flow-inventory", DATA_FLOW_INVENTORY.length >= 8, `${DATA_FLOW_INVENTORY.length} categories`);
  add(checks, "processor-inventory", EXTERNAL_PROCESSORS.length >= 8, `${EXTERNAL_PROCESSORS.length} processors/services`);
  add(checks, "retention-inventory", RETENTION_SCHEDULE.length >= 6, `${RETENTION_SCHEDULE.length} retention categories`);
  add(
    checks,
    "search-discoverability",
    hasAll(sitemap, ["/privacy", "/terms", "/account-deletion"]) &&
      hasAll(robots, ["/privacy", "/terms", "/account-deletion"]),
    "public policies in sitemap/robots allowlist"
  );
  add(
    checks,
    "play-draft-documents",
    existsSync(path.resolve(ROOT, "docs/PLAY_STORE_DATA_SAFETY_DRAFT.md")) &&
      existsSync(path.resolve(ROOT, "docs/ANDROID_ACCESSIBILITY_DECLARATION_DRAFT.md")),
    "Data Safety and Accessibility declaration drafts"
  );
  add(
    checks,
    "privacy-contact-template",
    envExample.includes("PRIVACY_CONTACT_EMAIL="),
    "verified contact must be configured before public launch"
  );
  add(
    checks,
    "external-legal-contact",
    false,
    "pre-launch: verified operator identity/contact and qualified legal review still external",
    "WARN"
  );

  const failed = checks.filter((check) => check.status === "FAIL");
  const warnings = checks.filter((check) => check.status === "WARN");
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: failed.length === 0 ? "LOCAL_COMPLIANCE_READY" : "BLOCKED",
    policyVersions: readiness.versions,
    inventory: {
      dataFlowCategories: DATA_FLOW_INVENTORY.length,
      processors: EXTERNAL_PROCESSORS.length,
      retentionCategories: RETENTION_SCHEDULE.length,
      privacyRequiredSections: POLICY_METADATA.privacy.requiredSectionIds.length,
      termsRequiredSections: POLICY_METADATA.terms.requiredSectionIds.length,
    },
    checks,
    summary: {
      pass: checks.filter((check) => check.status === "PASS").length,
      warn: warnings.length,
      fail: failed.length,
    },
    externalPending: [
      "publicHttpsUrl",
      "verifiedOperatorAndPrivacyContact",
      "qualifiedLegalReview",
      "PlayConsoleDataSafetySubmission",
      "PlayAccessibilityDeclarationAndDemoVideo",
      "physicalAndroidDisclosureTest",
    ],
    playStorePublished: false,
    databaseWrites: 0,
  };

  mkdirSync(path.dirname(options.out), { recursive: true });
  writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(`Privacy compliance audit: ${report.status}`);
  console.log(`Checks: ${report.summary.pass} pass · ${report.summary.warn} warn · ${report.summary.fail} fail`);
  console.log(`Report: ${path.relative(ROOT, options.out)}`);

  if (failed.length > 0 && options.strict) process.exitCode = 1;
}

main();
