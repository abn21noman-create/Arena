import { createHash } from "node:crypto";

export type ContentRiskSeverity = "BLOCKER" | "WARNING";

export interface ContentQualityRisk {
  code:
    | "EMPTY_TEXT"
    | "TEXT_TOO_SHORT"
    | "OPTIONS_NOT_FOUR"
    | "EMPTY_OPTION"
    | "DUPLICATE_OPTION"
    | "ANSWER_NOT_IN_OPTIONS"
    | "MISSING_EXPLANATION"
    | "SHORT_EXPLANATION"
    | "CORRUPT_UNICODE"
    | "CONTROL_CHARACTER"
    | "UNBALANCED_MATH"
    | "SUSPICIOUS_PLACEHOLDER"
    | "PARTIAL_BOARD_METADATA"
    | "CQ_PART_MISSING"
    | "CQ_MODEL_ANSWER_MISSING"
    | "NOTE_MISSING"
    | "NOTE_TOO_SHORT"
    | "UNBALANCED_CODE_FENCE"
    | "EXACT_DUPLICATE"
    | "CROSS_CONTEXT_DUPLICATE";
  severity: ContentRiskSeverity;
  field: string;
  message: string;
}

export interface McqQualityInput {
  text: unknown;
  options: unknown;
  correctAnswer: unknown;
  explanation: unknown;
  boardYear?: unknown;
  boardName?: unknown;
}

const PLACEHOLDER_PATTERN = /\b(?:lorem ipsum|todo|tbd|placeholder text)\b/i;

export function normalizeAcademicText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sharedTextRisks(value: string, field: string): ContentQualityRisk[] {
  const risks: ContentQualityRisk[] = [];
  if (value.includes("\uFFFD") || /[\uD800-\uDFFF]/u.test(value)) {
    risks.push({
      code: "CORRUPT_UNICODE",
      severity: "BLOCKER",
      field,
      message: `${field}-এ corrupt Unicode character আছে`,
    });
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    risks.push({
      code: "CONTROL_CHARACTER",
      severity: "BLOCKER",
      field,
      message: `${field}-এ control character আছে`,
    });
  }
  const dollars = (value.match(/(?<!\\)\$/g) ?? []).length;
  const inlineOpen = (value.match(/\\\(/g) ?? []).length;
  const inlineClose = (value.match(/\\\)/g) ?? []).length;
  const blockOpen = (value.match(/\\\[/g) ?? []).length;
  const blockClose = (value.match(/\\\]/g) ?? []).length;
  if (dollars % 2 !== 0 || inlineOpen !== inlineClose || blockOpen !== blockClose) {
    risks.push({
      code: "UNBALANCED_MATH",
      severity: "BLOCKER",
      field,
      message: `${field}-এ math delimiter balanced নয়`,
    });
  }
  if (PLACEHOLDER_PATTERN.test(value) || /as an ai language model/i.test(value)) {
    risks.push({
      code: "SUSPICIOUS_PLACEHOLDER",
      severity: "WARNING",
      field,
      message: `${field}-এ placeholder/generated-content marker আছে`,
    });
  }
  return risks;
}

export function assessMcqQuality(input: McqQualityInput): ContentQualityRisk[] {
  const risks: ContentQualityRisk[] = [];
  const text = typeof input.text === "string" ? input.text : "";
  const answer = typeof input.correctAnswer === "string" ? input.correctAnswer : "";
  const explanation = typeof input.explanation === "string" ? input.explanation : "";
  const normalizedText = normalizeAcademicText(text);

  if (!normalizedText) {
    risks.push({ code: "EMPTY_TEXT", severity: "BLOCKER", field: "text", message: "প্রশ্ন খালি" });
  } else if (normalizedText.length < 10) {
    risks.push({ code: "TEXT_TOO_SHORT", severity: "BLOCKER", field: "text", message: "প্রশ্ন অস্বাভাবিক ছোট" });
  }

  let options: string[] = [];
  if (!Array.isArray(input.options) || input.options.some((option) => typeof option !== "string")) {
    risks.push({ code: "OPTIONS_NOT_FOUR", severity: "BLOCKER", field: "options", message: "Options string array নয়" });
  } else {
    options = input.options as string[];
    if (options.length !== 4) {
      risks.push({ code: "OPTIONS_NOT_FOUR", severity: "BLOCKER", field: "options", message: `Option ${options.length}টি; ৪টি দরকার` });
    }
    const normalizedOptions = options.map(normalizeAcademicText);
    if (normalizedOptions.some((option) => !option)) {
      risks.push({ code: "EMPTY_OPTION", severity: "BLOCKER", field: "options", message: "খালি option আছে" });
    }
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      risks.push({ code: "DUPLICATE_OPTION", severity: "BLOCKER", field: "options", message: "Duplicate option আছে" });
    }
    if (!normalizedOptions.includes(normalizeAcademicText(answer))) {
      risks.push({ code: "ANSWER_NOT_IN_OPTIONS", severity: "BLOCKER", field: "correctAnswer", message: "Correct answer options-এর মধ্যে নেই" });
    }
  }

  if (!normalizeAcademicText(explanation)) {
    risks.push({ code: "MISSING_EXPLANATION", severity: "BLOCKER", field: "explanation", message: "Explanation নেই" });
  } else if (normalizeAcademicText(explanation).length < 15) {
    risks.push({ code: "SHORT_EXPLANATION", severity: "BLOCKER", field: "explanation", message: "Explanation খুব ছোট" });
  }

  const hasYear = typeof input.boardYear === "number";
  const hasBoard = typeof input.boardName === "string" && input.boardName.trim().length > 0;
  if (hasYear !== hasBoard) {
    risks.push({ code: "PARTIAL_BOARD_METADATA", severity: "WARNING", field: "board", message: "Board name/year pair অসম্পূর্ণ" });
  }

  for (const [field, value] of [
    ["text", text],
    ["options", options.join("\n")],
    ["correctAnswer", answer],
    ["explanation", explanation],
  ] as const) {
    risks.push(...sharedTextRisks(value, field));
  }
  return risks;
}

export function assessCqQuality(input: {
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
  modelAnswerA: string | null;
  modelAnswerB: string | null;
  modelAnswerC: string | null;
  modelAnswerD: string | null;
}): ContentQualityRisk[] {
  const risks: ContentQualityRisk[] = [];
  if (normalizeAcademicText(input.stimulus).length < 20) {
    risks.push({ code: "TEXT_TOO_SHORT", severity: "BLOCKER", field: "stimulus", message: "CQ stimulus অনুপস্থিত/খুব ছোট" });
  }
  for (const key of ["questionA", "questionB", "questionC", "questionD"] as const) {
    if (normalizeAcademicText(input[key]).length < 3) {
      risks.push({ code: "CQ_PART_MISSING", severity: "BLOCKER", field: key, message: `${key} অনুপস্থিত` });
    }
  }
  for (const key of ["modelAnswerA", "modelAnswerB", "modelAnswerC", "modelAnswerD"] as const) {
    const value = input[key] ?? "";
    if (normalizeAcademicText(value).length < 10) {
      risks.push({ code: "CQ_MODEL_ANSWER_MISSING", severity: "BLOCKER", field: key, message: `${key} অনুপস্থিত/খুব ছোট` });
    }
    risks.push(...sharedTextRisks(value, key));
  }
  risks.push(...sharedTextRisks(input.stimulus, "stimulus"));
  return risks;
}

export function assessTopicNoteQuality(notesMarkdown: string | null): ContentQualityRisk[] {
  if (!notesMarkdown || !normalizeAcademicText(notesMarkdown)) {
    return [{ code: "NOTE_MISSING", severity: "BLOCKER", field: "notesMarkdown", message: "Topic note নেই" }];
  }
  const risks = sharedTextRisks(notesMarkdown, "notesMarkdown");
  if (normalizeAcademicText(notesMarkdown).length < 120) {
    risks.push({ code: "NOTE_TOO_SHORT", severity: "WARNING", field: "notesMarkdown", message: "Topic note ১২০ অক্ষরের কম" });
  }
  if ((notesMarkdown.match(/```/g) ?? []).length % 2 !== 0) {
    risks.push({ code: "UNBALANCED_CODE_FENCE", severity: "BLOCKER", field: "notesMarkdown", message: "Markdown code fence balanced নয়" });
  }
  return risks;
}

export function contentRiskScore(risks: ContentQualityRisk[]): number {
  return risks.reduce(
    (score, risk) => score + (risk.severity === "BLOCKER" ? 100 : 20),
    0
  );
}

function canonicalContentValue(value: unknown): unknown {
  if (typeof value === "string") return normalizeAcademicText(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalContentValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalContentValue(nested)])
    );
  }
  return value ?? null;
}

/** SHA-256 over normalized, key-sorted content; IDs/reviewer data are excluded by caller. */
export function academicContentHash(targetType: string, content: unknown): string {
  const canonical = JSON.stringify({
    targetType,
    content: canonicalContentValue(content),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export function isReviewHashCurrent(
  reviewedHash: string | null | undefined,
  currentHash: string
): boolean {
  return Boolean(reviewedHash) && reviewedHash === currentHash;
}

/** RFC-style CSV escaping plus spreadsheet formula-injection protection. */
export function spreadsheetSafeCsvCell(value: unknown): string {
  let text = value === null || value === undefined
    ? ""
    : typeof value === "string"
      ? value
      : JSON.stringify(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function duplicateKey(context: string, text: string) {
  return `${normalizeAcademicText(context)}::${normalizeAcademicText(text)}`;
}
