import { describe, expect, it } from "vitest";
import {
  assessCqQuality,
  assessMcqQuality,
  assessTopicNoteQuality,
  academicContentHash,
  contentRiskScore,
  duplicateKey,
  isReviewHashCurrent,
  normalizeAcademicText,
  spreadsheetSafeCsvCell,
} from "@/lib/content-quality";

describe("Academic content quality triage", () => {
  it("normalizes Unicode whitespace without changing stored content", () => {
    expect(normalizeAcademicText("  sin²θ\u00A0 +\u200B cos²θ  ")).toBe("sin2θ + cos2θ");
  });

  it("accepts a structurally sound MCQ", () => {
    expect(assessMcqQuality({
      text: "SQL এর পূর্ণরূপ কী?",
      options: ["Structured Query Language", "Simple Query", "System Query", "Sequential Query"],
      correctAnswer: "Structured Query Language",
      explanation: "SQL এর পূর্ণরূপ Structured Query Language, যা database query করতে ব্যবহৃত হয়।",
    })).toEqual([]);
  });

  it("flags impossible answers, duplicate options and short explanations", () => {
    const risks = assessMcqQuality({
      text: "একটি বৈধ দৈর্ঘ্যের প্রশ্ন?",
      options: ["ক", "ক", "গ"],
      correctAnswer: "ঘ",
      explanation: "ছোট",
    });
    expect(risks.map((risk) => risk.code)).toEqual(expect.arrayContaining([
      "OPTIONS_NOT_FOUR",
      "DUPLICATE_OPTION",
      "ANSWER_NOT_IN_OPTIONS",
      "SHORT_EXPLANATION",
    ]));
  });

  it("flags corrupt Unicode and unbalanced math delimiters", () => {
    const risks = assessMcqQuality({
      text: "ভাঙা � প্রশ্ন $x+1",
      options: ["১", "২", "৩", "৪"],
      correctAnswer: "১",
      explanation: "এটি একটি যথেষ্ট দীর্ঘ কিন্তু $ অসম্পূর্ণ ব্যাখ্যা",
    });
    expect(risks.some((risk) => risk.code === "CORRUPT_UNICODE")).toBe(true);
    expect(risks.some((risk) => risk.code === "UNBALANCED_MATH")).toBe(true);
  });

  it("flags missing CQ parts and model answers", () => {
    const risks = assessCqQuality({
      stimulus: "খুব ছোট",
      questionA: "",
      questionB: "খ.",
      questionC: "গ.",
      questionD: "ঘ.",
      modelAnswerA: null,
      modelAnswerB: null,
      modelAnswerC: null,
      modelAnswerD: null,
    });
    expect(risks.some((risk) => risk.code === "CQ_PART_MISSING")).toBe(true);
    expect(risks.filter((risk) => risk.code === "CQ_MODEL_ANSWER_MISSING")).toHaveLength(4);
  });

  it("checks note presence, length and code-fence balance", () => {
    expect(assessTopicNoteQuality(null)[0].code).toBe("NOTE_MISSING");
    const risks = assessTopicNoteQuality("# ছোট note\n```ts\nconst x = 1;");
    expect(risks.map((risk) => risk.code)).toEqual(expect.arrayContaining([
      "NOTE_TOO_SHORT",
      "UNBALANCED_CODE_FENCE",
    ]));
  });

  it("builds deterministic normalized duplicate keys", () => {
    expect(duplicateKey(" ICT ", "sin²θ  = 1")).toBe(
      duplicateKey("ICT", "sin2θ = 1")
    );
  });

  it("prioritizes blockers above warnings", () => {
    expect(contentRiskScore([
      { code: "NOTE_TOO_SHORT", severity: "WARNING", field: "note", message: "warning" },
      { code: "EMPTY_TEXT", severity: "BLOCKER", field: "text", message: "blocker" },
    ])).toBe(120);
  });

  it("creates deterministic hashes independent of object key order", () => {
    expect(academicContentHash("CORE_MCQ", { text: "sin²θ", answer: "১" })).toBe(
      academicContentHash("CORE_MCQ", { answer: "১", text: "sin2θ" })
    );
  });

  it("changes the review hash when academic content changes", () => {
    const before = academicContentHash("CORE_MCQ", { text: "প্রশ্ন", answer: "ক" });
    const after = academicContentHash("CORE_MCQ", { text: "প্রশ্ন", answer: "খ" });
    expect(after).not.toBe(before);
    expect(isReviewHashCurrent(before, before)).toBe(true);
    expect(isReviewHashCurrent(before, after)).toBe(false);
    expect(isReviewHashCurrent(null, after)).toBe(false);
  });

  it("escapes CSV and neutralizes spreadsheet formulas", () => {
    expect(spreadsheetSafeCsvCell("=HYPERLINK(\"bad\")")).toBe(
      '"\'=HYPERLINK(""bad"")"'
    );
    expect(spreadsheetSafeCsvCell("normal, text")).toBe('"normal, text"');
  });
});
