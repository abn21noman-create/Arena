// ===================================================================
// Privacy & Compliance — versioned, client-safe policy metadata
// -------------------------------------------------------------------
// This module intentionally contains no secret/environment access and no DB
// imports. Public pages, registration, Settings, release checks and tests all
// consume the same versions so policy text and acceptance records cannot drift.
// ===================================================================

export const POLICY_METADATA = {
  privacy: {
    title: "গোপনীয়তা নীতি",
    route: "/privacy",
    version: "2026.08.05",
    effectiveDate: "2026-08-05",
    lastUpdated: "2026-08-05",
    requiredSectionIds: [
      "overview",
      "data-collection",
      "data-use",
      "ai-processing",
      "pdf-processing",
      "strict-focus",
      "notifications",
      "device-storage",
      "sharing",
      "retention",
      "data-controls",
      "children",
      "security",
      "international-processing",
      "policy-changes",
      "contact",
    ],
  },
  terms: {
    title: "ব্যবহারের শর্তাবলি",
    route: "/terms",
    version: "2026.08.05",
    effectiveDate: "2026-08-05",
    lastUpdated: "2026-08-05",
    requiredSectionIds: [
      "acceptance",
      "eligibility",
      "service-scope",
      "accounts",
      "acceptable-use",
      "ai-content",
      "academic-content",
      "user-content",
      "strict-focus",
      "privacy",
      "availability",
      "disclaimers",
      "termination",
      "changes",
      "governing-terms",
      "contact",
    ],
  },
  accountDeletion: {
    title: "অ্যাকাউন্ট ও ডেটা মুছুন",
    route: "/account-deletion",
    version: "2026.08.05",
  },
  ageAssurance: {
    version: "2026.08.05",
    minimumAge: 13,
  },
} as const;

export const CURRENT_PRIVACY_VERSION = POLICY_METADATA.privacy.version;
export const CURRENT_TERMS_VERSION = POLICY_METADATA.terms.version;
export const CURRENT_AGE_ASSURANCE_VERSION = POLICY_METADATA.ageAssurance.version;

export interface PolicyAcceptanceRecord {
  privacyVersion: string;
  termsVersion: string;
  ageAssuranceVersion: string;
  acceptedAt?: string | Date;
}

export function isCurrentPolicyAcceptance(
  acceptance: PolicyAcceptanceRecord | null | undefined
): boolean {
  return Boolean(
    acceptance &&
      acceptance.privacyVersion === CURRENT_PRIVACY_VERSION &&
      acceptance.termsVersion === CURRENT_TERMS_VERSION &&
      acceptance.ageAssuranceVersion === CURRENT_AGE_ASSURANCE_VERSION
  );
}

export const DATA_FLOW_INVENTORY = [
  {
    id: "account",
    title: "অ্যাকাউন্ট ও প্রোফাইল",
    data: "নাম, ইমেইল, password hash, HSC batch, board ও profile preferences",
    purpose: "নিরাপদ login, account পরিচালনা এবং ব্যক্তিগত learning experience",
    destination: "HSC Ultimate database (Supabase-hosted PostgreSQL)",
    controls: "Settings থেকে profile বদলানো, JSON export এবং account deletion",
  },
  {
    id: "learning",
    title: "পড়াশোনা ও অগ্রগতি",
    data: "MCQ/CQ/exam answers, score, time, topic progress, flashcard, notes, tasks, habits, plans, XP, badges ও academic issue reports",
    purpose: "ফলাফল, adaptive practice, planner, analytics এবং gamification",
    destination: "HSC Ultimate database",
    controls: "Feature-level delete যেখানে আছে, full JSON export এবং account deletion",
  },
  {
    id: "ai",
    title: "AI feature input",
    data: "প্রশ্ন, chat history/context, উত্তর, ঐচ্ছিক ছবি, CQ answer, note বা study-plan context",
    purpose: "AI tutor, evaluation, explanation, moderation, OCR, question/flashcard/plan generation এবং transparent Multi-AI academic review",
    destination: "Configured fallback অনুযায়ী Groq, Mistral AI, Cerebras বা OpenRouter; ফলাফল database-এ থাকতে পারে",
    controls: "AI feature ব্যবহার না করা, chat clear, item delete, export এবং account deletion",
  },
  {
    id: "pdf",
    title: "PDF Chat",
    data: "ফাইলের নাম, extracted text chunks, vector embeddings, প্রশ্ন/উত্তর, summary ও mind map",
    purpose: "নিজের document থেকে semantic search ও AI উত্তর",
    destination: "Text extraction app server-এ; embedding-এর জন্য Mistral AI; chunks/embeddings HSC Ultimate database-এ",
    controls: "Document delete, export এবং account deletion; original PDF binary স্থায়ীভাবে সংরক্ষণ করা হয় না",
  },
  {
    id: "community",
    title: "Community ও collaboration",
    data: "Public profile opt-in, forum post/reply/vote/report, shared note/deck, group/duel/battle participation",
    purpose: "Peer learning, moderation ও collaborative study",
    destination: "HSC Ultimate database; user public করলে নির্দিষ্ট content অন্যদের দেখা যায়",
    controls: "Public profile default off; content/privacy controls এবং account deletion",
  },
  {
    id: "focus",
    title: "Strict Focus ও Accessibility",
    data: "Focus Contract version/time, session/schedule/status, emergency reason, device capability, push delivery/receipt; foreground app package name কেবল device-এ transientভাবে",
    purpose: "Consent-based focus timer, selected app blocking, safety stop এবং delivery diagnostics",
    destination: "Session/consent/status database-এ; foreground package name বা screen content server-এ যায় না",
    controls: "Contract revoke, analytics sharing default off, Accessibility permission disable, emergency exit ও device unregister",
  },
  {
    id: "notifications",
    title: "Notification ও email",
    data: "In-app notifications, email preference/address, web push subscription, Android FCM token ও delivery status",
    purpose: "Reset email, optional digest, reminders, announcements ও consented Focus command",
    destination: "Resend, browser push service এবং configured হলে Firebase Cloud Messaging",
    controls: "Digest/push controls, device unregister এবং account deletion",
  },
  {
    id: "security",
    title: "Security ও operations",
    data: "Session/cookie data, rate-limit identifiers (hashed), admin/security audit event, limited IP address, runtime/error status",
    purpose: "Authentication, abuse prevention, incident investigation ও service reliability",
    destination: "App runtime/database; distributed limiter configured হলে hashed identifier Upstash Redis-এ",
    controls: "Security credential export করা হয় না; deletion-এ direct identifiers scrub/delete করা হয়, de-identified audit facts থাকতে পারে",
  },
] as const;

export const EXTERNAL_PROCESSORS = [
  {
    name: "Supabase",
    role: "PostgreSQL hosting/infrastructure",
    data: "Account, learning, content, consent and operational records",
  },
  {
    name: "Groq",
    role: "Optional AI inference provider",
    data: "User-initiated AI prompt and relevant context",
  },
  {
    name: "Mistral AI",
    role: "Optional AI/vision inference and PDF embeddings",
    data: "Prompt, optional image, or PDF text chunks needed for the requested feature",
  },
  {
    name: "Cerebras",
    role: "Optional fallback AI inference provider",
    data: "User-initiated AI prompt and relevant context",
  },
  {
    name: "OpenRouter",
    role: "Optional fallback AI gateway",
    data: "User-initiated prompt/context; the selected upstream model may also process it",
  },
  {
    name: "Resend",
    role: "Transactional/optional digest email delivery",
    data: "Recipient email and email content",
  },
  {
    name: "Firebase Cloud Messaging",
    role: "Optional native Android push delivery",
    data: "Device token and notification/consent-gated Focus command payload",
  },
  {
    name: "Browser push services",
    role: "Optional web push delivery",
    data: "Push endpoint, encryption keys and notification payload",
  },
  {
    name: "Upstash Redis",
    role: "Optional distributed abuse-rate limiting",
    data: "SHA-256-derived request identity and bounded timestamps; no raw user ID/IP in limiter keys",
  },
] as const;

export const DEVICE_STORAGE_INVENTORY = [
  "Essential authentication/session cookies",
  "Theme, accent color and functional accessibility preferences in localStorage",
  "Short-lived quiz/practice state in sessionStorage",
  "Offline mutation queue in IndexedDB/local storage until sync or clear",
  "PWA install/banner dismissal preferences",
  "Android Strict Focus consent/session deadline, allowlist, replay IDs and up to 10 pending receipts in private app storage",
  "Android/web push registration token on the device when notifications are enabled",
] as const;

export const RETENTION_SCHEDULE = [
  {
    category: "Account/profile ও learning data",
    period: "Account থাকা পর্যন্ত বা user আগে item/account delete করা পর্যন্ত",
    deletion: "Account deletion-এ relational records cascade-delete করা হয়",
  },
  {
    category: "AI chat ও uploaded image",
    period: "Chat clear বা account deletion পর্যন্ত",
    deletion: "AI Tutor-এর clear action বা full account deletion",
  },
  {
    category: "PDF-derived data",
    period: "Document/account delete পর্যন্ত",
    deletion: "Document delete-এ chunks, embeddings ও PDF chat cascade-delete; original binary persist করা হয় না",
  },
  {
    category: "Password reset token",
    period: "১ ঘণ্টা valid; নতুন request পুরোনো unused token invalidate করে",
    deletion: "Account deletion-এ matching email-এর token delete করা হয়; expired/used token authentication-এ গ্রহণ করা হয় না",
  },
  {
    category: "Native push delivery diagnostics",
    period: "সর্বোচ্চ ৯০ দিনের operational window লক্ষ্য",
    deletion: "Push pipeline চললে ৯০ দিনের পুরোনো delivery log prune হয়; device/account delete-এ cascade-delete",
  },
  {
    category: "Security/admin audit facts",
    period: "Security, abuse investigation ও operational accountability-এর প্রয়োজন অনুযায়ী",
    deletion: "Account deletion-এ direct actor/target identifiers, email/name/IP scrub করা হয়; de-identified event fact থাকতে পারে",
  },
  {
    category: "Local device/browser data",
    period: "Browser/app clear, uninstall, expiry বা feature completion পর্যন্ত",
    deletion: "Browser storage clear, app uninstall, logout/feature cleanup বা Android app data clear",
  },
] as const;

export function getPolicyReadiness() {
  const checks = {
    privacyVersioned: /^\d{4}\.\d{2}\.\d{2}$/.test(POLICY_METADATA.privacy.version),
    termsVersioned: /^\d{4}\.\d{2}\.\d{2}$/.test(POLICY_METADATA.terms.version),
    effectiveDatesPresent: Boolean(
      POLICY_METADATA.privacy.effectiveDate && POLICY_METADATA.terms.effectiveDate
    ),
    privacySectionsComplete: POLICY_METADATA.privacy.requiredSectionIds.length >= 15,
    termsSectionsComplete: POLICY_METADATA.terms.requiredSectionIds.length >= 15,
    dataInventoryComplete: DATA_FLOW_INVENTORY.length >= 8,
    processorInventoryComplete: EXTERNAL_PROCESSORS.length >= 8,
    retentionDocumented: RETENTION_SCHEDULE.length >= 6,
    accountDeletionDocumented: POLICY_METADATA.accountDeletion.route === "/account-deletion",
    ageAssuranceVersioned: /^\d{4}\.\d{2}\.\d{2}$/.test(
      POLICY_METADATA.ageAssurance.version
    ),
  };
  return {
    ready: Object.values(checks).every(Boolean),
    checks,
    versions: {
      privacy: CURRENT_PRIVACY_VERSION,
      terms: CURRENT_TERMS_VERSION,
      ageAssurance: CURRENT_AGE_ASSURANCE_VERSION,
    },
  };
}
