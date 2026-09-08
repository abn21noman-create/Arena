export const ACADEMIC_REPORT_REASONS = [
  "WRONG_ANSWER",
  "FACTUAL_ERROR",
  "EXPLANATION_ERROR",
  "TYPO_FORMATTING",
  "OUTDATED_SOURCE",
  "DUPLICATE",
  "NOTE_FORMULA_ERROR",
  "OTHER",
] as const;

export type AcademicReportReasonValue = (typeof ACADEMIC_REPORT_REASONS)[number];

export const ACADEMIC_REPORT_REASON_LABELS: Record<AcademicReportReasonValue, string> = {
  WRONG_ANSWER: "সঠিক উত্তর ভুল",
  FACTUAL_ERROR: "তথ্য/সূত্র ভুল",
  EXPLANATION_ERROR: "ব্যাখ্যা বা model answer ভুল",
  TYPO_FORMATTING: "টাইপো/ফরম্যাট/LaTeX সমস্যা",
  OUTDATED_SOURCE: "তথ্য/বোর্ড source পুরোনো",
  DUPLICATE: "একই content duplicate",
  NOTE_FORMULA_ERROR: "নোট বা formula sheet সমস্যা",
  OTHER: "অন্য সমস্যা",
};

export function academicReportDetailsValid(
  reason: AcademicReportReasonValue,
  details: string | null | undefined
) {
  return reason !== "OTHER" || (details?.trim().length ?? 0) >= 10;
}
