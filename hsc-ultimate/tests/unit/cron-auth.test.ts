import { describe, expect, it } from "vitest";
import { isValidCronAuthorization } from "@/lib/cron-auth";

describe("Cron authorization", () => {
  const secret = "0123456789abcdef0123456789abcdef";

  it("accepts only the exact bearer secret", () => {
    expect(isValidCronAuthorization(`Bearer ${secret}`, secret)).toBe(true);
  });

  it("rejects missing, malformed and wrong credentials", () => {
    expect(isValidCronAuthorization(null, secret)).toBe(false);
    expect(isValidCronAuthorization(secret, secret)).toBe(false);
    expect(isValidCronAuthorization("Bearer wrong", secret)).toBe(false);
  });

  it("rejects an empty configured secret", () => {
    expect(isValidCronAuthorization("Bearer ", "")).toBe(false);
  });

  it("does not accept a query-string style value", () => {
    expect(isValidCronAuthorization(`?secret=${secret}`, secret)).toBe(false);
  });
});
