import { describe, expect, it } from "vitest";
import {
  getRouteDocumentTitle,
  getRouteLabel,
  normalizeRoutePath,
} from "@/lib/route-labels";

describe("route experience labels", () => {
  it("normalizes query strings and trailing slashes", () => {
    expect(normalizeRoutePath("/practice/?page=2")).toBe("/practice");
    expect(normalizeRoutePath("/")).toBe("/");
    expect(normalizeRoutePath("")).toBe("/");
  });

  it("uses specific nested labels before parent labels", () => {
    expect(getRouteLabel("/practice/result/attempt-1")).toBe("অনুশীলনের ফলাফল");
    expect(getRouteLabel("/mock-exam/attempt/attempt-1")).toBe("মডেল টেস্ট চলছে");
    expect(getRouteLabel("/admin/subjects/subject-1")).toBe("Subject Management");
    expect(getRouteLabel("/learn/subject-1/topic-1")).toBe("পড়াশোনা");
  });

  it("produces a useful browser title without duplicating the brand", () => {
    expect(getRouteDocumentTitle("/settings")).toBe("সেটিংস | HSC Ultimate");
    expect(getRouteDocumentTitle("/")).toBe("HSC Ultimate");
    expect(getRouteDocumentTitle("/unknown-route")).toBe("HSC Ultimate");
  });
});
