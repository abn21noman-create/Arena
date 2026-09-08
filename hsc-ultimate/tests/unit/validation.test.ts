import { describe, expect, it } from "vitest";
import {
  isValidEnumValue,
  VALID_BOARDS,
  VALID_POST_CATEGORIES,
  VALID_SUBJECT_CODES,
  VALID_TASK_PRIORITIES,
} from "@/lib/enum-validation";
import { isValidHscBatch, isValidOptionalBoardYear } from "@/lib/numeric-validation";

describe("Enum validation", () => {
  it("accepts supported subject codes and rejects unknown values", () => {
    expect(isValidEnumValue("PHYSICS", VALID_SUBJECT_CODES)).toBe(true);
    expect(isValidEnumValue("UNKNOWN", VALID_SUBJECT_CODES)).toBe(false);
  });

  it("accepts supported task priorities and post categories", () => {
    expect(isValidEnumValue("HIGH", VALID_TASK_PRIORITIES)).toBe(true);
    expect(isValidEnumValue("QUESTION", VALID_POST_CATEGORIES)).toBe(true);
    expect(isValidEnumValue("URGENT", VALID_TASK_PRIORITIES)).toBe(false);
  });

  it("validates the configured Bangladeshi board names", () => {
    expect(isValidEnumValue("ঢাকা", VALID_BOARDS)).toBe(true);
    expect(isValidEnumValue("চট্টগ্রাম", VALID_BOARDS)).toBe(true);
    expect(isValidEnumValue("Invalid Board", VALID_BOARDS)).toBe(false);
  });
});

describe("Numeric validation", () => {
  it("accepts realistic HSC batches", () => {
    expect(isValidHscBatch(2026)).toBe(true);
    expect(isValidHscBatch(2028)).toBe(true);
  });

  it("rejects invalid or unsafe HSC batches", () => {
    expect(isValidHscBatch(2019)).toBe(false);
    expect(isValidHscBatch(2051)).toBe(false);
    expect(isValidHscBatch(2028.5)).toBe(false);
    expect(isValidHscBatch("2028")).toBe(false);
  });

  it("validates optional board years", () => {
    expect(isValidOptionalBoardYear(null)).toBe(true);
    expect(isValidOptionalBoardYear(undefined)).toBe(true);
    expect(isValidOptionalBoardYear(2025)).toBe(true);
    expect(isValidOptionalBoardYear(1800)).toBe(false);
    expect(isValidOptionalBoardYear(Number.NaN)).toBe(false);
  });
});
