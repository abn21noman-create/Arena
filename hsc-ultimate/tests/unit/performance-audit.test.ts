import { describe, expect, it } from "vitest";
import {
  classifyFindMany,
  collectPlanIndexes,
  percentile,
  summarizeLatency,
} from "@/lib/performance-audit";

describe("Performance audit helpers", () => {
  it("calculates deterministic percentiles", () => {
    expect(percentile([5, 1, 4, 2, 3], 0.5)).toBe(3);
    expect(percentile([5, 1, 4, 2, 3], 0.95)).toBe(5);
  });

  it("summarizes latency samples", () => {
    expect(summarizeLatency([10, 20, 30, 40])).toEqual({
      min: 10,
      p50: 20,
      p95: 40,
      max: 40,
    });
  });

  it("collects nested PostgreSQL plan indexes", () => {
    expect(collectPlanIndexes({
      "Node Type": "Limit",
      Plans: [{
        "Node Type": "Bitmap Heap Scan",
        Plans: [{ "Node Type": "Bitmap Index Scan", "Index Name": "questions_topicId_idx" }],
      }],
    })).toEqual(["questions_topicId_idx"]);
  });

  it("classifies bounded and intentional full reads", () => {
    expect(classifyFindMany({ hasWhere: false, hasLimit: true, intentionalFullRead: false })).toBe("BOUNDED");
    expect(classifyFindMany({ hasWhere: false, hasLimit: false, intentionalFullRead: true })).toBe("INTENTIONAL_FULL_READ");
  });

  it("distinguishes scoped and global unbounded reads", () => {
    expect(classifyFindMany({ hasWhere: true, hasLimit: false, intentionalFullRead: false })).toBe("SCOPED_UNBOUNDED");
    expect(classifyFindMany({ hasWhere: false, hasLimit: false, intentionalFullRead: false })).toBe("GLOBAL_UNBOUNDED");
  });
});
