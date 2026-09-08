import { describe, expect, it } from "vitest";
import {
  deriveAIReviewConsensus,
  type AIProviderAcademicReview,
} from "@/lib/ai-academic-review";

function review(
  provider: "groq" | "mistral",
  overrides: Partial<AIProviderAcademicReview> = {}
): AIProviderAcademicReview {
  return {
    provider,
    model: `${provider}-test`,
    verdict: "APPROVE",
    confidence: 0.97,
    expectedAnswer: "৪",
    rationale: "স্বাধীনভাবে সমাধান করে সঠিক পাওয়া গেছে",
    issues: [],
    sourceRequired: false,
    responseHash: provider.repeat(16).slice(0, 64),
    ...overrides,
  };
}

const mcq = {
  targetType: "CORE_MCQ" as const,
  details: { correctAnswer: "৪" },
  risks: [],
  studentReports: [],
};

describe("Multi-AI academic consensus", () => {
  it("approves only two high-confidence matching independent answers", () => {
    expect(deriveAIReviewConsensus(mcq, [review("groq"), review("mistral")])).toMatchObject({
      verdict: "APPROVE",
      confidence: 0.97,
    });
  });

  it("blocks disagreement and wrong expected answers", () => {
    expect(deriveAIReviewConsensus(mcq, [
      review("groq"),
      review("mistral", { verdict: "NEEDS_CORRECTION" }),
    ]).verdict).toBe("CONFLICT");
    expect(deriveAIReviewConsensus(mcq, [
      review("groq"),
      review("mistral", { expectedAnswer: "৩" }),
    ]).verdict).toBe("CONFLICT");
  });

  it("never approves low-confidence, structurally risky or source-dependent content", () => {
    expect(deriveAIReviewConsensus(mcq, [
      review("groq", { confidence: 0.8 }),
      review("mistral"),
    ]).verdict).toBe("CONFLICT");
    expect(deriveAIReviewConsensus(
      { ...mcq, risks: [{ code: "SHORT_EXPLANATION", severity: "BLOCKER" as const, field: "explanation", message: "short" }] },
      [review("groq"), review("mistral")]
    ).verdict).toBe("CONFLICT");
    expect(deriveAIReviewConsensus(
      { ...mcq, details: { correctAnswer: "৪", boardYear: 2025 } },
      [review("groq"), review("mistral")]
    ).verdict).toBe("SOURCE_REQUIRED");
  });

  it("requires two valid providers", () => {
    expect(deriveAIReviewConsensus(mcq, [review("groq")]).verdict).toBe("ERROR");
  });
});
