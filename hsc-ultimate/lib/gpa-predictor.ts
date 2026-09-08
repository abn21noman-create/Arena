// ===================================================================
// Predicted GPA — ইউজারের Practice/Mock Exam/CQ ডেটা বিশ্লেষণ করে প্রতিটা
// বিষয়ে সম্ভাব্য পারফরম্যান্স % বের করে, তারপর GPA calculate করে
// -------------------------------------------------------------------
// HSC এর ৭টা মূল বিষয় (Science Group): Bangla, English, ICT, Physics,
// Chemistry, Biology, Higher Math — প্রতিটার ১ম+২য় পত্র (থাকলে) মিলিয়ে
// combined percentage বের করা হয় (বোর্ডে subject-wise ফলাফল এভাবেই হয়)।
//
// ডেটা সোর্স (ওয়েটেড):
// - MockExamAttempt (weight ৩ — সবচেয়ে বাস্তবসম্মত, বোর্ড ফরম্যাটে)
// - QuizAttempt/Practice MCQ (weight ১)
// - CQAttempt (weight ২ — বোর্ড মার্কিং স্কিম অনুযায়ী মূল্যায়িত)
// ===================================================================
import { prisma } from "@/lib/prisma";
import { calculateHscGpa, marksToGrade, SubjectResult, GpaResult } from "@/lib/gpa";

export interface SubjectPrediction {
  subjectCode: string;
  subjectName: string;
  predictedPercentage: number | null; // null হলে যথেষ্ট ডেটা নেই
  grade: string | null;
  gradePoint: number | null;
  dataPointCount: number; // কতগুলো attempt থেকে হিসাব হয়েছে
  confidence: "high" | "medium" | "low" | "none";
}

const SUBJECT_CODE_NAMES: Record<string, string> = {
  BANGLA: "বাংলা",
  ENGLISH: "English",
  ICT: "ICT",
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  HIGHER_MATH: "উচ্চতর গণিত",
};

// Science Group এর ৭টা মূল বিষয় — GPA হিসাবের ভিত্তি
// (Higher Math ৪র্থ/ঐচ্ছিক বিষয় হিসেবে ধরা হয়)
const CORE_SUBJECT_CODES = ["BANGLA", "ENGLISH", "ICT", "PHYSICS", "CHEMISTRY", "BIOLOGY"];
const OPTIONAL_SUBJECT_CODE = "HIGHER_MATH";

interface WeightedScore {
  totalWeightedScore: number;
  totalWeightedMarks: number;
  count: number;
}

/** প্রতিটা SubjectCode এর জন্য predicted percentage বের করে */
export async function predictSubjectPerformances(
  userId: string
): Promise<SubjectPrediction[]> {
  // সব Subject (paper সহ) নিয়ে আসা হচ্ছে, code দিয়ে group করার জন্য
  const subjects = await prisma.subject.findMany();
  const subjectIdToCode = new Map(subjects.map((s) => [s.id, s.code]));

  const byCode = new Map<string, WeightedScore>();
  const ensureEntry = (code: string) => {
    if (!byCode.has(code)) {
      byCode.set(code, { totalWeightedScore: 0, totalWeightedMarks: 0, count: 0 });
    }
    return byCode.get(code)!;
  };

  // ---- Practice MCQ Quiz Attempts (weight ১) ----
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId, subjectId: { not: null }, totalMarks: { gt: 0 } },
    select: { subjectId: true, score: true, totalMarks: true },
  });
  for (const qa of quizAttempts) {
    const code = subjectIdToCode.get(qa.subjectId!);
    if (!code) continue;
    const entry = ensureEntry(code);
    entry.totalWeightedScore += qa.score * 1;
    entry.totalWeightedMarks += qa.totalMarks * 1;
    entry.count += 1;
  }

  // ---- Mock Exam Attempts (weight ৩ — সবচেয়ে বাস্তবসম্মত) ----
  const mockAttempts = await prisma.mockExamAttempt.findMany({
    where: { userId, status: "COMPLETED" },
    select: { subjectId: true, mcqScore: true, mcqTotal: true, cqScore: true, cqTotal: true },
  });
  for (const ma of mockAttempts) {
    const code = subjectIdToCode.get(ma.subjectId);
    if (!code) continue;
    const entry = ensureEntry(code);
    const totalScore = ma.mcqScore + ma.cqScore;
    const totalMarks = ma.mcqTotal + ma.cqTotal;
    if (totalMarks > 0) {
      entry.totalWeightedScore += totalScore * 3;
      entry.totalWeightedMarks += totalMarks * 3;
      entry.count += 1;
    }
  }

  // ---- CQ Attempts (weight ২) ----
  const cqAttempts = await prisma.cQAttempt.findMany({
    where: { userId },
    select: {
      totalScore: true,
      cqQuestion: {
        select: { topic: { select: { chapter: { select: { subjectId: true } } } } },
      },
    },
  });
  for (const ca of cqAttempts) {
    const subjectId = ca.cqQuestion.topic.chapter.subjectId;
    const code = subjectIdToCode.get(subjectId);
    if (!code) continue;
    const entry = ensureEntry(code);
    entry.totalWeightedScore += ca.totalScore * 2;
    entry.totalWeightedMarks += 10 * 2; // প্রতিটা CQ ১০ নম্বরের
    entry.count += 1;
  }

  const allCodes = [...CORE_SUBJECT_CODES, OPTIONAL_SUBJECT_CODE];

  return allCodes.map((code) => {
    const entry = byCode.get(code);
    const subjectName = SUBJECT_CODE_NAMES[code] ?? code;

    if (!entry || entry.totalWeightedMarks === 0) {
      return {
        subjectCode: code,
        subjectName,
        predictedPercentage: null,
        grade: null,
        gradePoint: null,
        dataPointCount: 0,
        confidence: "none" as const,
      };
    }

    const percentage = Math.round(
      (entry.totalWeightedScore / entry.totalWeightedMarks) * 100
    );
    const gradeInfo = marksToGrade(percentage);

    let confidence: SubjectPrediction["confidence"] = "low";
    if (entry.count >= 5) confidence = "high";
    else if (entry.count >= 2) confidence = "medium";

    return {
      subjectCode: code,
      subjectName,
      predictedPercentage: percentage,
      grade: gradeInfo.grade,
      gradePoint: gradeInfo.point,
      dataPointCount: entry.count,
      confidence,
    };
  });
}

export interface PredictedGpaSummary {
  subjects: SubjectPrediction[];
  gpaResult: GpaResult | null; // যথেষ্ট ডেটা থাকলেই হিসাব হবে
  missingSubjects: string[]; // যেসব বিষয়ে এখনো কোনো ডেটা নেই
}

/** সব বিষয়ের প্রেডিকশন থেকে সম্পূর্ণ GPA সামারি তৈরি করে */
export async function getPredictedGpaSummary(userId: string): Promise<PredictedGpaSummary> {
  const subjects = await predictSubjectPerformances(userId);

  const missingSubjects = subjects
    .filter((s) => s.predictedPercentage === null)
    .map((s) => s.subjectName);

  // সব কয়টা মূল বিষয়ে ডেটা না থাকলে GPA হিসাব করা হবে না (অসম্পূর্ণ/ভুল GPA দেখানো ঠিক না)
  const coreSubjects = subjects.filter((s) => CORE_SUBJECT_CODES.includes(s.subjectCode));
  const hasAllCoreData = coreSubjects.every((s) => s.predictedPercentage !== null);

  if (!hasAllCoreData) {
    return { subjects, gpaResult: null, missingSubjects };
  }

  const coreResults: SubjectResult[] = coreSubjects.map((s) => ({
    subjectName: s.subjectName,
    marks: s.predictedPercentage!,
  }));

  const optionalSubject = subjects.find((s) => s.subjectCode === OPTIONAL_SUBJECT_CODE);
  const optionalResult: SubjectResult | undefined =
    optionalSubject?.predictedPercentage !== null && optionalSubject?.predictedPercentage !== undefined
      ? { subjectName: optionalSubject.subjectName, marks: optionalSubject.predictedPercentage, isOptional: true }
      : undefined;

  const gpaResult = calculateHscGpa(coreResults, optionalResult);

  return { subjects, gpaResult, missingSubjects };
}
