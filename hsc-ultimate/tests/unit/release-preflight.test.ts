import { describe, expect, it } from "vitest";
import {
  aggregateFileChecksums,
  deriveReleasePreflightStatus,
  reportContainsForbiddenSecretKey,
  sha256Text,
} from "@/lib/release-preflight";

describe("Release preflight manifest", () => {
  it("blocks any failed core check", () => {
    expect(deriveReleasePreflightStatus({
      checks: [{ id: "migration", status: "FAIL", detail: "mismatch" }],
      externalPending: [],
    })).toBe("BLOCKED");
  });

  it("distinguishes local-ready from deploy-ready", () => {
    const checks = [{ id: "core", status: "PASS" as const, detail: "ok" }];
    expect(deriveReleasePreflightStatus({ checks, externalPending: ["publicUrl"] })).toBe("LOCAL_READY");
    expect(deriveReleasePreflightStatus({ checks, externalPending: [] })).toBe("DEPLOY_READY");
  });

  it("builds order-independent source manifests", () => {
    const files = [
      { path: "b.ts", sha256: sha256Text("b") },
      { path: "a.ts", sha256: sha256Text("a") },
    ];
    expect(aggregateFileChecksums(files)).toBe(aggregateFileChecksums([...files].reverse()));
    expect(aggregateFileChecksums(files)).not.toBe(
      aggregateFileChecksums([{ path: "a.ts", sha256: sha256Text("changed") }])
    );
  });

  it("detects forbidden credential-shaped report keys", () => {
    expect(reportContainsForbiddenSecretKey({ checks: [], secret: "value" })).toBe(true);
    expect(reportContainsForbiddenSecretKey({ nested: { privateKey: "value" } })).toBe(true);
    expect(reportContainsForbiddenSecretKey({ externalPending: ["firebaseAdmin"] })).toBe(false);
  });

  it("hashes source content deterministically", () => {
    expect(sha256Text("same")).toBe(sha256Text(Buffer.from("same")));
    expect(sha256Text("same")).not.toBe(sha256Text("different"));
  });
});
