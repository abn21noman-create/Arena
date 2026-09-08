import { describe, expect, it } from "vitest";
import {
  loadSourceMcqCatalog,
  mcqTextSimilarity,
  normalizeMcqText,
  questionContentFingerprint,
  questionIdentityFingerprint,
  SOURCE_MCQ_BASELINE,
  validateMcqQuality,
} from "@/scripts/lib/mcq-catalog";

describe("MCQ source catalog safety", () => {
  it("keeps core and admission datasets separate", () => {
    const catalog = loadSourceMcqCatalog();
    expect(catalog.core).toHaveLength(SOURCE_MCQ_BASELINE.core);
    expect(catalog.admission).toHaveLength(SOURCE_MCQ_BASELINE.admission);
    expect(catalog.core.length + catalog.admission.length).toBe(SOURCE_MCQ_BASELINE.all);
  });

  it("parses every source MCQ without a structural quality blocker", () => {
    const catalog = loadSourceMcqCatalog();
    const blockers = [...catalog.core, ...catalog.admission].flatMap((question) =>
      validateMcqQuality(question).filter((issue) => issue.severity === "BLOCKER")
    );
    expect(blockers).toEqual([]);
  });

  it("normalizes Unicode, invisible characters, punctuation, and whitespace deterministically", () => {
    expect(normalizeMcqText("  A\u00A0–\u200B B  ")).toBe("A - B");
    expect(normalizeMcqText("sin²θ")).toBe("sin2θ");
  });

  it("uses separate stable identity and full-content fingerprints", () => {
    const topic = "ICT:NONE:SQL কুয়েরি";
    const identity = questionIdentityFingerprint(topic, "SQL কী?");
    expect(identity).toBe(questionIdentityFingerprint(topic, "SQL কী?"));
    expect(identity).not.toBe(questionIdentityFingerprint(topic, "SQL কেন?"));

    const common = {
      topicKey: topic,
      text: "SQL কী?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      explanation: "এটি একটি যথেষ্ট দীর্ঘ ব্যাখ্যা।",
      difficulty: "EASY",
    };
    expect(questionContentFingerprint(common)).not.toBe(
      questionContentFingerprint({ ...common, correctAnswer: "B" })
    );
  });

  it("rejects an impossible answer and distinguishes exact from unrelated text", () => {
    const issues = validateMcqQuality({
      text: "একটি বৈধ দৈর্ঘ্যের প্রশ্ন?",
      options: ["ক", "খ", "গ", "ঘ"],
      correctAnswer: "ঙ",
      explanation: "এটি একটি যথেষ্ট দীর্ঘ পরীক্ষামূলক ব্যাখ্যা।",
      difficulty: "MEDIUM",
    });
    expect(issues.some((issue) => issue.code === "ANSWER_NOT_IN_OPTIONS")).toBe(true);
    expect(mcqTextSimilarity("SQL UPDATE কমান্ড কী করে?", "SQL UPDATE কমান্ড কী করে?")).toBe(1);
    expect(mcqTextSimilarity("SQL UPDATE কমান্ড কী করে?", "মাইটোকন্ড্রিয়ার কাজ কী?")).toBeLessThan(0.3);
  });
});
