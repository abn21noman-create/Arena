import { describe, expect, it } from "vitest";
import {
  isTrustedMutationOrigin,
  requestBodyLimitResponse,
} from "@/lib/request-security";

describe("Global API security baseline", () => {
  it("accepts same-origin browser mutations", () => {
    const request = new Request("https://app.example/api/tasks", {
      method: "POST",
      headers: { origin: "https://app.example" },
    });
    expect(isTrustedMutationOrigin(request, [])).toBe(true);
  });

  it("accepts an explicitly configured HTTPS app origin", () => {
    const request = new Request("https://internal.example/api/tasks", {
      method: "PATCH",
      headers: { origin: "https://app.example" },
    });
    expect(isTrustedMutationOrigin(request, ["https://app.example"])).toBe(true);
  });

  it("rejects cross-origin and malformed browser mutation origins", () => {
    const crossOrigin = new Request("https://app.example/api/tasks", {
      method: "DELETE",
      headers: { origin: "https://evil.example" },
    });
    const malformed = new Request("https://app.example/api/tasks", {
      method: "POST",
      headers: { origin: "not a URL" },
    });
    expect(isTrustedMutationOrigin(crossOrigin, [])).toBe(false);
    expect(isTrustedMutationOrigin(malformed, [])).toBe(false);
  });

  it("allows read-only and origin-less service requests", () => {
    const read = new Request("https://app.example/api/health", {
      method: "GET",
      headers: { origin: "https://evil.example" },
    });
    const cron = new Request("https://app.example/api/cron/focus-schedules", {
      method: "POST",
    });
    expect(isTrustedMutationOrigin(read, [])).toBe(true);
    expect(isTrustedMutationOrigin(cron, [])).toBe(true);
  });

  it("blocks oversized request bodies", async () => {
    const response = requestBodyLimitResponse(
      new Request("https://app.example/api/upload", {
        method: "POST",
        headers: { "content-length": "1048577" },
      }),
      1024 * 1024
    );
    expect(response?.status).toBe(413);
    expect(response?.headers.get("cache-control")).toBe("no-store");
  });

  it("accepts missing or in-budget Content-Length", () => {
    expect(requestBodyLimitResponse(
      new Request("https://app.example/api/tasks", { method: "POST" }),
      1024
    )).toBeNull();
    expect(requestBodyLimitResponse(
      new Request("https://app.example/api/tasks", {
        method: "POST",
        headers: { "content-length": "1024" },
      }),
      1024
    )).toBeNull();
  });

  it("rejects malformed Content-Length", () => {
    expect(requestBodyLimitResponse(
      new Request("https://app.example/api/tasks", {
        method: "POST",
        headers: { "content-length": "not-a-number" },
      }),
      1024
    )?.status).toBe(400);
  });
});
