import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export const CORE_MCQ_SEED_FILES = [
  "prisma/seed-questions.ts",
  "prisma/seed-questions-2.ts",
  "prisma/seed-questions-physics-gaps.ts",
  "prisma/seed-questions-hmath-gaps.ts",
  "prisma/seed-questions-biology-gaps.ts",
  "prisma/seed-questions-chem-ict-gaps.ts",
  "prisma/seed-bangla-english-ict.ts",
  "prisma/seed-board-questions.ts",
  "prisma/seed-questions-topic-gaps.ts",
  "prisma/seed-questions-empty-chapters.ts",
  "prisma/seed-questions-physics-topic-gaps.ts",
  "prisma/seed-questions-topic-gaps-2.ts",
] as const;

export const ADMISSION_MCQ_SEED_FILES = [
  "prisma/seed-admission-questions.ts",
  "prisma/seed-admission-questions-2.ts",
] as const;

export const SOURCE_MCQ_BASELINE = {
  core: 688,
  admission: 220,
  all: 908,
} as const;

export type McqDifficulty = "EASY" | "MEDIUM" | "HARD";
export type PaperNumber = "FIRST" | "SECOND" | "NONE";

export interface SourceLocation {
  file: string;
  line: number;
}

export interface SourceCoreQuestion {
  source: SourceLocation;
  topicName: string;
  subjectName?: string;
  subjectCode?: string;
  paper?: PaperNumber;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: McqDifficulty;
  boardYear?: number;
  boardName?: string;
}

export interface SourceAdmissionQuestion {
  source: SourceLocation;
  examType: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: McqDifficulty;
}

export interface SourceMcqCatalog {
  core: SourceCoreQuestion[];
  admission: SourceAdmissionQuestion[];
  byFile: Record<string, number>;
}

export type QualitySeverity = "BLOCKER" | "WARNING";

export interface McqQualityIssue {
  severity: QualitySeverity;
  code:
    | "EMPTY_TEXT"
    | "SHORT_TEXT"
    | "OPTIONS_NOT_ARRAY"
    | "OPTION_COUNT"
    | "EMPTY_OPTION"
    | "DUPLICATE_OPTION"
    | "ANSWER_NOT_IN_OPTIONS"
    | "MISSING_EXPLANATION"
    | "SHORT_EXPLANATION"
    | "INVALID_DIFFICULTY"
    | "CORRUPT_UNICODE"
    | "CONTROL_CHARACTER"
    | "MALFORMED_MATH_DELIMITER"
    | "MALFORMED_LATEX_BRACES"
    | "SUSPICIOUS_PLACEHOLDER"
    | "INCOMPLETE_BOARD_METADATA";
  field: "text" | "options" | "correctAnswer" | "explanation" | "difficulty" | "board";
  message: string;
}

export interface McqQualityInput {
  text: unknown;
  options: unknown;
  correctAnswer: unknown;
  explanation: unknown;
  difficulty: unknown;
  boardYear?: unknown;
  boardName?: unknown;
}

type LocatedRecord = Record<string, unknown> & { __sourceLine?: number };

function unwrapExpression(node: ts.Expression): ts.Expression {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isSatisfiesExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function propertyNameText(name: ts.PropertyName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  throw new Error(`Unsupported computed seed property: ${name.getText()}`);
}

function literalValue(node: ts.Expression, sourceFile: ts.SourceFile): unknown {
  const current = unwrapExpression(node);

  if (ts.isStringLiteral(current) || ts.isNoSubstitutionTemplateLiteral(current)) {
    return current.text;
  }
  if (ts.isNumericLiteral(current)) return Number(current.text);
  if (current.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (current.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (current.kind === ts.SyntaxKind.NullKeyword) return null;

  if (ts.isPrefixUnaryExpression(current) && ts.isNumericLiteral(current.operand)) {
    const value = Number(current.operand.text);
    return current.operator === ts.SyntaxKind.MinusToken ? -value : value;
  }

  if (ts.isArrayLiteralExpression(current)) {
    return current.elements.map((element) => {
      if (ts.isSpreadElement(element)) {
        throw new Error(`Spread syntax is not allowed in MCQ seed data: ${element.getText()}`);
      }
      return literalValue(element, sourceFile);
    });
  }

  if (ts.isObjectLiteralExpression(current)) {
    const value: LocatedRecord = {
      __sourceLine: sourceFile.getLineAndCharacterOfPosition(current.getStart(sourceFile)).line + 1,
    };
    for (const property of current.properties) {
      if (!ts.isPropertyAssignment(property)) {
        throw new Error(`Only static property assignments are allowed in MCQ seed data: ${property.getText()}`);
      }
      value[propertyNameText(property.name)] = literalValue(property.initializer, sourceFile);
    }
    return value;
  }

  throw new Error(
    `Unsupported dynamic value in ${sourceFile.fileName}: ${ts.SyntaxKind[current.kind]} ${current
      .getText(sourceFile)
      .slice(0, 120)}`
  );
}

function isRecord(value: unknown): value is LocatedRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: LocatedRecord, key: string, context: string): string {
  const value = record[key];
  if (typeof value !== "string") throw new Error(`${context}: ${key} must be a string`);
  return value;
}

function optionalString(record: LocatedRecord, key: string, context: string): string | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`${context}: ${key} must be a string`);
  return value;
}

function stringArray(record: LocatedRecord, key: string, context: string): string[] {
  const value = record[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${context}: ${key} must be a static string array`);
  }
  return value as string[];
}

function difficulty(record: LocatedRecord, context: string): McqDifficulty {
  const value = requiredString(record, "difficulty", context);
  if (value !== "EASY" && value !== "MEDIUM" && value !== "HARD") {
    throw new Error(`${context}: invalid difficulty ${JSON.stringify(value)}`);
  }
  return value;
}

function questionLocation(file: string, record: LocatedRecord): SourceLocation {
  if (typeof record.__sourceLine !== "number") throw new Error(`${file}: source line was not captured`);
  return { file, line: record.__sourceLine };
}

function coreQuestionFromRecord(
  file: string,
  record: LocatedRecord,
  topic: {
    topicName: string;
    subjectName?: string;
    subjectCode?: string;
    paper?: PaperNumber;
  }
): SourceCoreQuestion {
  const context = `${file}:${record.__sourceLine ?? "?"}`;
  const boardYear = record.boardYear;
  if (boardYear !== undefined && typeof boardYear !== "number") {
    throw new Error(`${context}: boardYear must be a number`);
  }

  return {
    source: questionLocation(file, record),
    ...topic,
    text: requiredString(record, "text", context),
    options: stringArray(record, "options", context),
    correctAnswer: requiredString(record, "correctAnswer", context),
    explanation: requiredString(record, "explanation", context),
    difficulty: difficulty(record, context),
    boardYear,
    boardName: optionalString(record, "boardName", context),
  };
}

function admissionQuestionFromRecord(file: string, record: LocatedRecord): SourceAdmissionQuestion {
  const context = `${file}:${record.__sourceLine ?? "?"}`;
  return {
    source: questionLocation(file, record),
    examType: requiredString(record, "examType", context),
    subject: requiredString(record, "subject", context),
    text: requiredString(record, "text", context),
    options: stringArray(record, "options", context),
    correctAnswer: requiredString(record, "correctAnswer", context),
    explanation: requiredString(record, "explanation", context),
    difficulty: difficulty(record, context),
  };
}

function readStaticVariable(filePath: string, variableNames: readonly string[]): { name: string; value: unknown } {
  const source = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      if (variableNames.includes(declaration.name.text)) {
        return {
          name: declaration.name.text,
          value: literalValue(declaration.initializer, sourceFile),
        };
      }
    }
  }

  throw new Error(`${filePath}: none of ${variableNames.join(", ")} was found`);
}

function parseCoreFile(projectRoot: string, relativeFile: string): SourceCoreQuestion[] {
  const { name, value } = readStaticVariable(path.join(projectRoot, relativeFile), [
    "questionsByTopic",
    "boardQuestionsByTopic",
    "seedData",
  ]);

  if (name === "seedData") {
    if (!Array.isArray(value)) throw new Error(`${relativeFile}: seedData must be an array`);
    const questions: SourceCoreQuestion[] = [];

    for (const rawEntry of value) {
      if (!isRecord(rawEntry)) throw new Error(`${relativeFile}: seedData entry must be an object`);
      const context = `${relativeFile}:${rawEntry.__sourceLine ?? "?"}`;
      const rawQuestions = rawEntry.questions;
      if (!Array.isArray(rawQuestions)) throw new Error(`${context}: questions must be an array`);

      const paperValue = optionalString(rawEntry, "paper", context);
      if (paperValue && paperValue !== "FIRST" && paperValue !== "SECOND" && paperValue !== "NONE") {
        throw new Error(`${context}: invalid paper ${paperValue}`);
      }

      const topic = {
        topicName: requiredString(rawEntry, "topicName", context),
        subjectName: optionalString(rawEntry, "subjectName", context),
        subjectCode:
          optionalString(rawEntry, "code", context) ??
          (relativeFile === "prisma/seed-questions-physics-topic-gaps.ts" ? "PHYSICS" : undefined),
        paper: paperValue as PaperNumber | undefined,
      };

      for (const rawQuestion of rawQuestions) {
        if (!isRecord(rawQuestion)) throw new Error(`${context}: question must be an object`);
        questions.push(coreQuestionFromRecord(relativeFile, rawQuestion, topic));
      }
    }
    return questions;
  }

  if (!isRecord(value)) throw new Error(`${relativeFile}: ${name} must be an object`);
  const questions: SourceCoreQuestion[] = [];
  for (const [topicName, rawQuestions] of Object.entries(value)) {
    if (topicName === "__sourceLine") continue;
    if (!Array.isArray(rawQuestions)) throw new Error(`${relativeFile}: topic ${topicName} must contain an array`);
    for (const rawQuestion of rawQuestions) {
      if (!isRecord(rawQuestion)) throw new Error(`${relativeFile}: question under ${topicName} must be an object`);
      questions.push(coreQuestionFromRecord(relativeFile, rawQuestion, { topicName }));
    }
  }
  return questions;
}

function parseAdmissionFile(projectRoot: string, relativeFile: string): SourceAdmissionQuestion[] {
  const { value } = readStaticVariable(path.join(projectRoot, relativeFile), ["questions"]);
  if (!Array.isArray(value)) throw new Error(`${relativeFile}: questions must be an array`);
  return value.map((rawQuestion) => {
    if (!isRecord(rawQuestion)) throw new Error(`${relativeFile}: admission question must be an object`);
    return admissionQuestionFromRecord(relativeFile, rawQuestion);
  });
}

export function loadSourceMcqCatalog(projectRoot = process.cwd()): SourceMcqCatalog {
  const core = CORE_MCQ_SEED_FILES.flatMap((file) => parseCoreFile(projectRoot, file));
  const admission = ADMISSION_MCQ_SEED_FILES.flatMap((file) => parseAdmissionFile(projectRoot, file));
  const byFile: Record<string, number> = {};
  for (const question of [...core, ...admission]) {
    byFile[question.source.file] = (byFile[question.source.file] ?? 0) + 1;
  }
  return { core, admission, byFile };
}

/**
 * Matching normalization only. Original source text is always retained for writes.
 * NFKC makes visually equivalent Unicode/math forms deterministic; punctuation and
 * meaningful symbols remain intact.
 */
export function normalizeMcqText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\\left|\\right/g, "")
    .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stableFingerprint(parts: readonly (string | number | null | undefined)[]): string {
  const canonical = parts.map((part) => (part === null || part === undefined ? "" : normalizeMcqText(String(part))));
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function canonicalTopicKey(code: string, paper: string, topicName: string): string {
  return `${normalizeMcqText(code)}:${normalizeMcqText(paper)}:${normalizeMcqText(topicName)}`;
}

export function questionIdentityFingerprint(topicKey: string, text: string): string {
  return stableFingerprint(["hsc-core-mcq-identity-v1", topicKey, text]);
}

export function questionContentFingerprint(input: {
  topicKey: string;
  text: string;
  options: readonly string[];
  correctAnswer: string;
  explanation?: string | null;
  difficulty: string;
  boardYear?: number | null;
  boardName?: string | null;
}): string {
  return stableFingerprint([
    "hsc-core-mcq-content-v1",
    input.topicKey,
    input.text,
    ...input.options,
    input.correctAnswer,
    input.explanation,
    input.difficulty,
    input.boardYear,
    input.boardName,
  ]);
}

function countUnescaped(value: string, token: string): number {
  let count = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== token) continue;
    let slashes = 0;
    for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) slashes += 1;
    if (slashes % 2 === 0) count += 1;
  }
  return count;
}

function hasUnbalancedLatexBraces(value: string): boolean {
  if (!/[\\$]/.test(value)) return false;
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character !== "{" && character !== "}") continue;
    if (index > 0 && value[index - 1] === "\\") continue;
    if (character === "{") depth += 1;
    else depth -= 1;
    if (depth < 0) return true;
  }
  return depth !== 0;
}

export function validateMcqQuality(input: McqQualityInput): McqQualityIssue[] {
  const issues: McqQualityIssue[] = [];
  const text = typeof input.text === "string" ? input.text : "";
  const answer = typeof input.correctAnswer === "string" ? input.correctAnswer : "";
  const explanation = typeof input.explanation === "string" ? input.explanation : "";

  if (!text.trim()) {
    issues.push({ severity: "BLOCKER", code: "EMPTY_TEXT", field: "text", message: "Question text is empty." });
  } else if (normalizeMcqText(text).length < 10) {
    issues.push({ severity: "BLOCKER", code: "SHORT_TEXT", field: "text", message: "Question text is shorter than 10 characters." });
  }

  let options: string[] = [];
  if (!Array.isArray(input.options) || input.options.some((option) => typeof option !== "string")) {
    issues.push({ severity: "BLOCKER", code: "OPTIONS_NOT_ARRAY", field: "options", message: "Options must be a string array." });
  } else {
    options = input.options as string[];
    if (options.length !== 4) {
      issues.push({ severity: "BLOCKER", code: "OPTION_COUNT", field: "options", message: `Expected 4 options; found ${options.length}.` });
    }
    if (options.some((option) => !option.trim())) {
      issues.push({ severity: "BLOCKER", code: "EMPTY_OPTION", field: "options", message: "At least one option is empty." });
    }
    const normalizedOptions = options.map(normalizeMcqText);
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      issues.push({ severity: "BLOCKER", code: "DUPLICATE_OPTION", field: "options", message: "Options contain a normalized duplicate." });
    }
    if (!normalizedOptions.includes(normalizeMcqText(answer))) {
      issues.push({ severity: "BLOCKER", code: "ANSWER_NOT_IN_OPTIONS", field: "correctAnswer", message: "Correct answer is not one of the normalized options." });
    }
  }

  if (!explanation.trim()) {
    issues.push({ severity: "BLOCKER", code: "MISSING_EXPLANATION", field: "explanation", message: "Explanation is missing." });
  } else if (normalizeMcqText(explanation).length < 15) {
    issues.push({ severity: "BLOCKER", code: "SHORT_EXPLANATION", field: "explanation", message: "Explanation is shorter than 15 characters." });
  }

  if (input.difficulty !== "EASY" && input.difficulty !== "MEDIUM" && input.difficulty !== "HARD") {
    issues.push({ severity: "BLOCKER", code: "INVALID_DIFFICULTY", field: "difficulty", message: "Difficulty is not EASY, MEDIUM, or HARD." });
  }

  const inspectedFields: Array<["text" | "options" | "correctAnswer" | "explanation", string]> = [
    ["text", text],
    ["options", options.join("\n")],
    ["correctAnswer", answer],
    ["explanation", explanation],
  ];
  for (const [field, value] of inspectedFields) {
    if (value.includes("\uFFFD") || /[\uD800-\uDFFF]/u.test(value)) {
      issues.push({ severity: "BLOCKER", code: "CORRUPT_UNICODE", field, message: `${field} contains a replacement or unpaired-surrogate character.` });
    }
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
      issues.push({ severity: "BLOCKER", code: "CONTROL_CHARACTER", field, message: `${field} contains a disallowed control character.` });
    }
    if (
      countUnescaped(value, "$") % 2 !== 0 ||
      (value.match(/\\\(/g)?.length ?? 0) !== (value.match(/\\\)/g)?.length ?? 0) ||
      (value.match(/\\\[/g)?.length ?? 0) !== (value.match(/\\\]/g)?.length ?? 0)
    ) {
      issues.push({ severity: "BLOCKER", code: "MALFORMED_MATH_DELIMITER", field, message: `${field} has unbalanced math delimiters.` });
    }
    if (hasUnbalancedLatexBraces(value)) {
      issues.push({ severity: "BLOCKER", code: "MALFORMED_LATEX_BRACES", field, message: `${field} has unbalanced LaTeX braces.` });
    }
    if (/\b(?:lorem ipsum|todo|tbd|placeholder text)\b/i.test(value) || /as an ai language model/i.test(value)) {
      issues.push({ severity: "BLOCKER", code: "SUSPICIOUS_PLACEHOLDER", field, message: `${field} contains placeholder/generated-content markers.` });
    }
  }

  const hasBoardYear = typeof input.boardYear === "number";
  const hasBoardName = typeof input.boardName === "string" && input.boardName.trim().length > 0;
  if (hasBoardYear !== hasBoardName) {
    issues.push({ severity: "WARNING", code: "INCOMPLETE_BOARD_METADATA", field: "board", message: "Board year and board name should be present together." });
  }

  return issues;
}

function trigrams(value: string): Set<string> {
  const normalized = normalizeMcqText(value)
    .toLocaleLowerCase("bn-BD")
    .replace(/[\p{P}\p{S}\s]+/gu, " ")
    .trim();
  if (normalized.length <= 3) return new Set([normalized]);
  const grams = new Set<string>();
  for (let index = 0; index <= normalized.length - 3; index += 1) grams.add(normalized.slice(index, index + 3));
  return grams;
}

export function mcqTextSimilarity(left: string, right: string): number {
  const leftGrams = trigrams(left);
  const rightGrams = trigrams(right);
  if (leftGrams.size === 0 && rightGrams.size === 0) return 1;
  if (leftGrams.size === 0 || rightGrams.size === 0) return 0;
  let intersection = 0;
  for (const gram of leftGrams) if (rightGrams.has(gram)) intersection += 1;
  return (2 * intersection) / (leftGrams.size + rightGrams.size);
}
