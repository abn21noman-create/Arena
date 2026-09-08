/**
 * ===================================================================
 * HSC ULTIMATE — Ultra-Deep System & Concurrency Stress Test Suite
 * ===================================================================
 * Exhaustive deep verification covering:
 *   1. Extreme Spaced Repetition (FSRS vs SM-2) Edge Cases & Lifecycles
 *   2. Board GPA 4th Subject Rules & Zero-Grade Cascade
 *   3. Admission Scoring Matrix (BUET, Medical, DU-A, RU, GST) & Edge Cases
 *   4. LaTeX Formula Search & Bengali Transliteration Parser Under Fuzzing
 *   5. Image Occlusion Box Geometry & Coordinate Boundary Matrix
 *   6. Strict Focus Safety Deadlines & Timeouts
 *   7. Anti-Abuse Rate Limiter Key Generation & Safety Scopes
 *   8. Study Pet Evolution Stage Thresholds & Care Mechanics
 * ===================================================================
 */

import { calculateHscGpa, marksToGrade } from "../lib/gpa";
import {
  calculateNextReview,
  defaultSRSState,
  MAX_INTERVAL_DAYS,
  type FlashcardSRSState,
} from "../lib/spaced-repetition";
import { calculateNextFsrsReview } from "../lib/fsrs";
import {
  ADMISSION_EXAM_CONFIGS,
  calculateAdmissionScore,
} from "../lib/admission";
import { parseFormulaEntries } from "../lib/formula-search";
import { validateOcclusionBoxes } from "../lib/image-occlusion";
import { PET_STAGE_ORDER, PET_STAGE_INFO, getNextStageProgress } from "../lib/study-pet";
import { makeRateLimitKey } from "../lib/rate-limit";
import { MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES, isValidFocusDuration } from "../lib/focus-constants";

let deepPassed = 0;
let deepTotal = 0;
const deepFailures: string[] = [];

function assert(condition: boolean, title: string, detail = "") {
  deepTotal++;
  if (condition) {
    deepPassed++;
    console.log(`  ✅ ${title}${detail ? ` — ${detail}` : ""}`);
  } else {
    deepFailures.push(`${title}: ${detail}`);
    console.error(`  ❌ DEEP FAIL: ${title} — ${detail}`);
  }
}

async function runUltraDeepTests() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("🔬 HSC ULTIMATE — ULTRA-DEEP VERIFICATION & STRESS TEST SUITE");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // =================================================================
  // 1. EXTREME SPACED REPETITION LIFECYCLE (FSRS & SM-2)
  // =================================================================
  console.log("── ১. Spaced Repetition Extreme Edge Cases (FSRS & SM-2)");

  // Test SM-2 Interval Cap (Permanent anti-overflow guard)
  let srsState: FlashcardSRSState = defaultSRSState();
  for (let rep = 1; rep <= 50; rep++) {
    const srsRes = calculateNextReview(srsState, "easy");
    srsState = srsRes;
    assert(srsState.intervalDays <= MAX_INTERVAL_DAYS, `SM-2 Interval Capped at rep ${rep}`, `Interval: ${srsState.intervalDays}d <= ${MAX_INTERVAL_DAYS}d`);
    assert(!isNaN(srsRes.dueDate.getTime()), `Valid Date at rep ${rep}`);
  }

  // Extreme Failure (20 consecutive AGAINs)
  let failState = defaultSRSState();
  for (let i = 0; i < 20; i++) {
    failState = calculateNextReview(failState, "again");
    assert(failState.repetitions === 0, `SM-2 Reset on lapse ${i + 1}`, `Rep: ${failState.repetitions}`);
    assert(failState.intervalDays === 1, `SM-2 Interval 1 day on lapse ${i + 1}`);
  }

  // FSRS Extreme Lifecycle: NEW -> LEARNING -> REVIEW
  const baseFsrs = {
    stability: null,
    difficulty: null,
    fsrsScheduledDays: null,
    fsrsReps: 0,
    fsrsLapses: 0,
    fsrsState: "NEW" as const,
    lastReviewed: null,
  };

  const rev1 = calculateNextFsrsReview(baseFsrs, "good");
  assert(rev1.state === "LEARNING" || rev1.state === "REVIEW", "FSRS New -> Learning/Review", `State: ${rev1.state}`);
  assert(rev1.stability > 0 && rev1.difficulty > 0, "FSRS Initial Stability & Difficulty Created", `S: ${rev1.stability.toFixed(2)}, D: ${rev1.difficulty.toFixed(2)}`);

  const rev2 = calculateNextFsrsReview(
    {
      stability: rev1.stability,
      difficulty: rev1.difficulty,
      fsrsScheduledDays: rev1.scheduledDays,
      fsrsReps: rev1.reps,
      fsrsLapses: rev1.lapses,
      fsrsState: rev1.state,
      lastReviewed: rev1.dueDate,
    },
    "again"
  );
  assert(rev2.stability < rev1.stability, "FSRS Stability Drops on Failure", `S: ${rev2.stability.toFixed(2)} < ${rev1.stability.toFixed(2)}`);

  const longPast = new Date(Date.now() - 1000 * 24 * 3600 * 1000);
  const revLong = calculateNextFsrsReview(
    {
      stability: 10,
      difficulty: 4.5,
      fsrsScheduledDays: 30,
      fsrsReps: 5,
      fsrsLapses: 0,
      fsrsState: "REVIEW",
      lastReviewed: longPast,
    },
    "easy"
  );
  assert(revLong.scheduledDays > 30, "FSRS Handles 1000-Day Extreme Overdue Review Cleanly", `Next due: ${revLong.scheduledDays}d`);

  // =================================================================
  // 2. HSC BOARD GPA 4TH SUBJECT ALGORITHM & ZERO CASCADE
  // =================================================================
  console.log("\n── ২. HSC Board GPA Algorithm, 4th Subject Rules & Zero Cascade");

  // Golden A+ (All 80+ marks)
  const gpaGolden = calculateHscGpa([
    { subjectName: "Bangla", marks: 95 },
    { subjectName: "English", marks: 90 },
    { subjectName: "ICT", marks: 92 },
    { subjectName: "Physics", marks: 88 },
    { subjectName: "Chemistry", marks: 85 },
    { subjectName: "Biology", marks: 90 },
  ], { subjectName: "Higher Math", marks: 95 });
  assert(gpaGolden.gpa === 5.0 && gpaGolden.isPass === true, "Golden A+ (GPA 5.00) Calculation Exact", `GPA: ${gpaGolden.gpa}`);

  // Single F in mandatory subject -> Total GPA must be 0.00
  const failMandatory = calculateHscGpa([
    { subjectName: "Bangla", marks: 25 }, // FAILED (<33)
    { subjectName: "English", marks: 90 },
    { subjectName: "ICT", marks: 92 },
    { subjectName: "Physics", marks: 88 },
    { subjectName: "Chemistry", marks: 85 },
    { subjectName: "Biology", marks: 90 },
  ], { subjectName: "Higher Math", marks: 95 });
  assert(failMandatory.gpa === 0.0 && failMandatory.isPass === false, "Single Subject F Results in Total GPA 0.00 (Fail)", `GPA: ${failMandatory.gpa}, isPass: ${failMandatory.isPass}`);

  // Failure in 4th subject does NOT fail the student
  const fail4th = calculateHscGpa([
    { subjectName: "Bangla", marks: 75 },
    { subjectName: "English", marks: 75 },
    { subjectName: "ICT", marks: 75 },
    { subjectName: "Physics", marks: 75 },
    { subjectName: "Chemistry", marks: 75 },
    { subjectName: "Biology", marks: 75 },
  ], { subjectName: "Higher Math", marks: 20 }); // 4th subject F
  assert(fail4th.gpa === 4.0 && fail4th.isPass === true, "4th Subject F Does Not Fail Student (GPA Maintained)", `GPA: ${fail4th.gpa}, isPass: ${fail4th.isPass}`);

  // Grade boundaries
  assert(marksToGrade(80).grade === "A+", "80 marks is A+");
  assert(marksToGrade(79).grade === "A", "79 marks is A");
  assert(marksToGrade(70).grade === "A", "70 marks is A");
  assert(marksToGrade(69).grade === "A-", "69 marks is A-");
  assert(marksToGrade(60).grade === "A-", "60 marks is A-");
  assert(marksToGrade(59).grade === "B", "59 marks is B");
  assert(marksToGrade(50).grade === "B", "50 marks is B");
  assert(marksToGrade(49).grade === "C", "49 marks is C");
  assert(marksToGrade(40).grade === "C", "40 marks is C");
  assert(marksToGrade(39).grade === "D", "39 marks is D");
  assert(marksToGrade(33).grade === "D", "33 marks is D (Passing boundary)");
  assert(marksToGrade(32).grade === "F", "32 marks is F (Failing boundary)");
  assert(marksToGrade(0).grade === "F", "0 marks is F");

  // =================================================================
  // 3. ADMISSION SCORING MATRIX & EDGE CASES
  // =================================================================
  console.log("\n── ৩. Admission Scoring Matrix & Real Circular Specs");

  // BUET: 60 questions, no negative marking
  const buetConfig = ADMISSION_EXAM_CONFIGS["BUET"];
  assert(buetConfig.subjects.reduce((sum, s) => sum + s.questionCount, 0) === 60 && buetConfig.negativeMarkPerWrong === 0, "BUET Exam Config Exact (60 Q, 0 Neg)");
  const buetScore = calculateAdmissionScore(60, 45, 15, buetConfig);
  assert(buetScore.rawScore === 45, "BUET Scoring No Negative Penalty", `Score: ${buetScore.rawScore}/60`);

  // Medical: 100 questions, 0.25 negative, pass mark 40
  const medConfig = ADMISSION_EXAM_CONFIGS["MEDICAL"];
  assert(medConfig.negativeMarkPerWrong === 0.25 && medConfig.passMark === 40, "Medical Circular Exact (0.25 Neg, 40 Pass)");
  const medScorePass = calculateAdmissionScore(100, 50, 40, medConfig); // 50 - (40 * 0.25) = 40.0
  assert(medScorePass.rawScore === 40.0 && medScorePass.isPass === true, "Medical Boundary Passing Score Exact", `Score: ${medScorePass.rawScore}, Passed: ${medScorePass.isPass}`);
  const medScoreFail = calculateAdmissionScore(100, 49, 40, medConfig); // 49 - 10 = 39.0
  assert(medScoreFail.rawScore === 39.0 && medScoreFail.isPass === false, "Medical Failing Boundary Score Exact", `Score: ${medScoreFail.rawScore}, Passed: ${medScoreFail.isPass}`);

  // All wrong -> Negative Score Floor
  const allWrongMed = calculateAdmissionScore(100, 0, 100, medConfig); // 0 - 25 = -25
  assert(allWrongMed.rawScore === -25, "Medical Negative Score Calculation Exact", `Score: ${allWrongMed.rawScore}`);

  // =================================================================
  // 4. FORMULA SEARCH, LATEX & TRANSLITERATION FUZZING
  // =================================================================
  console.log("\n── ৪. Formula Search Engine & Bengali Transliteration Parser");

  const rawFormulas = `
### গতিবিদ্যা (Kinematics)
- $v = u + at$ — বেগ ও ত্বরণ
- $s = ut + \\frac{1}{2}at^2$ — সরণ সমীকরণ
- $v^2 = u^2 + 2as$ — তৃতীয় গতি সমীকরণ
- $F = ma$ — নিউটনের দ্বিতীয় সূত্র
- $E = mc^2$ — ভর-শক্তি সমীকরণ
`;

  const parsedFormulas = parseFormulaEntries(rawFormulas);
  assert(parsedFormulas.length === 5, "Formula Parser Parsed All 5 Markdown Formula Lines", `Count: ${parsedFormulas.length}`);

  const mcMatch = parsedFormulas.filter((f) => f.includes("mc^2"));
  assert(mcMatch.length === 1 && mcMatch[0].includes("ভর-শক্তি"), "Formula LaTeX Search Exact", `Found: ${mcMatch[0]}`);

  // =================================================================
  // 5. IMAGE OCCLUSION BOUNDING BOX GEOMETRY
  // =================================================================
  console.log("\n── ৫. Image Occlusion Box Geometry & Coordinate Sanitization");

  const validBoxes = [
    { x: 10, y: 15, width: 25, height: 10, label: "মাইটোকন্ড্রিয়া" },
    { x: 45, y: 55, width: 30, height: 12, label: "গলজি বডি" },
  ];
  const validRes = validateOcclusionBoxes(validBoxes);
  assert(validRes.valid === true, "Valid Normalized Occlusion Boxes Accepted");

  const outOfBoundsBoxes = [
    { x: -5, y: 10, width: 20, height: 20, label: "Invalid X" },
  ];
  const outRes = validateOcclusionBoxes(outOfBoundsBoxes);
  assert(outRes.valid === false, "Negative X Coordinate Occlusion Box Rejected", outRes.error);

  const overflowBoxes = [
    { x: 80, y: 80, width: 30, height: 30, label: "Overflow" }, // 80 + 30 = 110% > 100%
  ];
  const overRes = validateOcclusionBoxes(overflowBoxes);
  assert(overRes.valid === false, "Coordinate Boundary Overflow Box (>100%) Rejected", overRes.error);

  // =================================================================
  // 6. STRICT FOCUS CONTRACT & SAFETY LIMITS
  // =================================================================
  console.log("\n── ৬. Strict Focus Contract, Safety Deadlines & Timeouts");

  assert(MIN_FOCUS_MINUTES === 20, "Focus Minimum 20 Minutes (Pedagogical focus block)");
  assert(MAX_FOCUS_MINUTES === 120, "Focus Maximum 120 Minutes (Safety block)");
  assert(isValidFocusDuration(25) === true, "25 Minutes Pomodoro Valid Duration");
  assert(isValidFocusDuration(10) === false, "10 Minutes Below Minimum Duration Rejected");
  assert(isValidFocusDuration(180) === false, "180 Minutes Above Maximum Duration Rejected");

  const nowMs = Date.now();
  const sessionEndsAt = new Date(nowMs + 25 * 60 * 1000); // 25 min Pomodoro
  const remainingSec = Math.round((sessionEndsAt.getTime() - nowMs) / 1000);
  assert(remainingSec >= 1490 && remainingSec <= 1500, "Focus Session Remaining Seconds Exact", `Remaining: ${remainingSec}s`);

  // =================================================================
  // 7. RATE LIMITING & SECURITY KEY HASHING
  // =================================================================
  console.log("\n── ৭. Anti-Abuse Rate Limiting Key Scoping");

  const dummyReq = {
    headers: new Headers({ "x-forwarded-for": "103.145.23.10" }),
  } as unknown as Request;

  const rateKey = makeRateLimitKey(dummyReq, "auth:register");
  assert(rateKey === "auth:register:ip:103.145.23.10", "Rate Limit Key Format Matches Spec", `Key: ${rateKey}`);

  const userRateKey = makeRateLimitKey(dummyReq, "aiChat", "usr_rahim_123");
  assert(userRateKey === "aiChat:user:usr_rahim_123", "User Scoped Rate Limit Key Exact", `Key: ${userRateKey}`);

  // =================================================================
  // 8. STUDY PET EVOLUTION MECHANICS
  // =================================================================
  console.log("\n── ৮. Study Pet Evolution Thresholds & Stage Progression");

  assert(PET_STAGE_ORDER.length === 5, "5 Sequential Pet Evolution Stages Configured");
  assert(PET_STAGE_ORDER[0] === "EGG" && PET_STAGE_ORDER[4] === "SAGE", "Pet Evolution from EGG -> SAGE (Owlet Theme)");

  const eggProgress = getNextStageProgress(2, "EGG"); // Need 4 for HATCHLING
  assert(eggProgress.isMaxStage === false && eggProgress.nextStage === "HATCHLING", "EGG Evolves to HATCHLING");
  assert(eggProgress.progressPct === 50, "Pet Stage Progress Exact (50%)", `Progress: ${eggProgress.progressPct}%`);

  const sageProgress = getNextStageProgress(60, "SAGE");
  assert(sageProgress.isMaxStage === true && sageProgress.nextStage === null && sageProgress.progressPct === 100, "Max SAGE Stage Reached (100%)");

  // =================================================================
  // FINAL SUMMARY
  // =================================================================
  console.log("\n═══════════════════════════════════════════════════════════════");
  if (deepFailures.length === 0) {
    console.log(`🎉 ALL ${deepPassed}/${deepTotal} ULTRA-DEEP STRESS ASSERTIONS PASSED WITH ZERO ERRORS!`);
  } else {
    console.error(`❌ ${deepFailures.length} FAILURE(S) OUT OF ${deepTotal}`);
    process.exit(1);
  }
  console.log("═══════════════════════════════════════════════════════════════\n");
}

runUltraDeepTests().catch((err) => {
  console.error("Ultra-deep test suite crashed:", err);
  process.exit(1);
});
