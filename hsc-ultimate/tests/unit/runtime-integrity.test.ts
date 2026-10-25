import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getFeatureFlagForPath } from "@/lib/feature-flag-routes";
import { PROTECTED_PREFIXES } from "@/lib/protected-routes";
import { isSessionRevoked } from "@/lib/session-integrity";

describe("Runtime truth and session integrity", () => {
  it("revokes missing, banned and old-version sessions", () => {
    expect(isSessionRevoked(0, null)).toBe(true);
    expect(isSessionRevoked(2, { isBanned: true, authVersion: 2 })).toBe(true);
    expect(isSessionRevoked(1, { isBanned: false, authVersion: 2 })).toBe(true);
    expect(isSessionRevoked(2, { isBanned: false, authVersion: 2 })).toBe(false);
  });

  it("uses the same feature flag for page and API paths", () => {
    expect(getFeatureFlagForPath("/focus")).toBe("focus");
    expect(getFeatureFlagForPath("/api/focus/session")).toBe("focus");
    expect(getFeatureFlagForPath("/pdf-chat/doc")).toBe("pdf-chat");
    expect(getFeatureFlagForPath("/api/pdf-chat/doc/messages")).toBe("pdf-chat");
    expect(getFeatureFlagForPath("/api/analytics")).toBeNull();
  });

  it("keeps every protected route prefix covered by proxy.ts matcher", () => {
    const proxySource = readFileSync(path.resolve(process.cwd(), "proxy.ts"), "utf8");
    for (const prefix of PROTECTED_PREFIXES) {
      expect(proxySource).toContain(`"${prefix}/:path*"`);
    }
  });
});
