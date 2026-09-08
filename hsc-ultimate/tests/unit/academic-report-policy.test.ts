import { describe, expect, it } from "vitest";
import {
  ACADEMIC_REPORT_REASONS,
  ACADEMIC_REPORT_REASON_LABELS,
  academicReportDetailsValid,
} from "@/lib/academic-report-policy";

describe("Academic report policy", () => {
  it("keeps every report reason user-visible", () => {
    expect(ACADEMIC_REPORT_REASONS).toHaveLength(8);
    expect(Object.keys(ACADEMIC_REPORT_REASON_LABELS).sort()).toEqual(
      [...ACADEMIC_REPORT_REASONS].sort()
    );
  });

  it("requires meaningful details only for OTHER", () => {
    expect(academicReportDetailsValid("WRONG_ANSWER", null)).toBe(true);
    expect(academicReportDetailsValid("OTHER", "short")).toBe(false);
    expect(academicReportDetailsValid("OTHER", "কমপক্ষে দশ অক্ষরের কারণ")).toBe(true);
  });
});
