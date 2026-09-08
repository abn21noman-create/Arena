import { describe, expect, it } from "vitest";
import {
  CURRENT_AGE_ASSURANCE_VERSION,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  DATA_FLOW_INVENTORY,
  EXTERNAL_PROCESSORS,
  POLICY_METADATA,
  RETENTION_SCHEDULE,
  getPolicyReadiness,
  isCurrentPolicyAcceptance,
} from "@/lib/privacy-compliance";

describe("Privacy compliance metadata", () => {
  it("keeps all public policies versioned and release-ready", () => {
    const readiness = getPolicyReadiness();
    expect(readiness.ready).toBe(true);
    expect(Object.values(readiness.checks).every(Boolean)).toBe(true);
    expect(POLICY_METADATA.privacy.route).toBe("/privacy");
    expect(POLICY_METADATA.terms.route).toBe("/terms");
    expect(POLICY_METADATA.accountDeletion.route).toBe("/account-deletion");
  });

  it("requires exact current versions rather than blanket or stale acceptance", () => {
    const current = {
      privacyVersion: CURRENT_PRIVACY_VERSION,
      termsVersion: CURRENT_TERMS_VERSION,
      ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
    };
    expect(isCurrentPolicyAcceptance(current)).toBe(true);
    expect(isCurrentPolicyAcceptance({ ...current, privacyVersion: "2026.01.01" })).toBe(false);
    expect(isCurrentPolicyAcceptance({ ...current, termsVersion: "2026.01.01" })).toBe(false);
    expect(isCurrentPolicyAcceptance({ ...current, ageAssuranceVersion: "2026.01.01" })).toBe(false);
    expect(isCurrentPolicyAcceptance(null)).toBe(false);
  });

  it("documents every major data flow, processor and retention class", () => {
    expect(DATA_FLOW_INVENTORY.map((item) => item.id)).toEqual(
      expect.arrayContaining(["account", "learning", "ai", "pdf", "focus", "notifications", "security"])
    );
    expect(EXTERNAL_PROCESSORS.map((item) => item.name)).toEqual(
      expect.arrayContaining(["Supabase", "Groq", "Mistral AI", "Cerebras", "OpenRouter", "Resend"])
    );
    expect(RETENTION_SCHEDULE.length).toBeGreaterThanOrEqual(6);
  });

  it("has no duplicate required section IDs", () => {
    expect(new Set(POLICY_METADATA.privacy.requiredSectionIds).size).toBe(
      POLICY_METADATA.privacy.requiredSectionIds.length
    );
    expect(new Set(POLICY_METADATA.terms.requiredSectionIds).size).toBe(
      POLICY_METADATA.terms.requiredSectionIds.length
    );
  });
});
