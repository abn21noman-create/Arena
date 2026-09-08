// ===================================================================
// HSC GPA Calculation Logic (Bangladesh Education Board — verified)
// -------------------------------------------------------------------
// গ্রেডিং স্কেল: A+ (80-100=5.00), A (70-79=4.00), A- (60-69=3.50),
// B (50-59=3.00), C (40-49=2.00), D (33-39=1.00), F (0-32=0.00)
//
// GPA ফর্মুলা: ৬টি মূল বিষয় (Bangla, English, ICT + Physics/Chemistry/
// Biology — Science Group এর মূল ৩টা) + ১টা ঐচ্ছিক ৪র্থ বিষয় (Higher Math)
// ৪র্থ বিষয়ের গ্রেড পয়েন্ট থেকে ২ বিয়োগ করে (নূন্যতম ০) মূল যোগফলে যোগ
// করা হয়, তারপর সব ৬ দিয়ে ভাগ করে GPA বের করা হয় (৪র্থ বিষয়ের বোনাস
// রুল, Bangladesh Education Board এর official নিয়ম)।
//
// কোনো মূল বিষয়ে F (Fail) পেলে সামগ্রিক ফলাফল Fail হয়ে যায় (GPA 0.00,
// কিন্তু আমরা UI তে numeric GPA-ও দেখাবো transparency এর জন্য)।
// ===================================================================

export interface GradeInfo {
  grade: string; // "A+", "A", ইত্যাদি
  point: number; // 5.00, 4.00, ইত্যাদি
}

/** মার্ক থেকে গ্রেড ও গ্রেড পয়েন্ট বের করে */
export function marksToGrade(marks: number): GradeInfo {
  if (marks >= 80) return { grade: "A+", point: 5.0 };
  if (marks >= 70) return { grade: "A", point: 4.0 };
  if (marks >= 60) return { grade: "A-", point: 3.5 };
  if (marks >= 50) return { grade: "B", point: 3.0 };
  if (marks >= 40) return { grade: "C", point: 2.0 };
  if (marks >= 33) return { grade: "D", point: 1.0 };
  return { grade: "F", point: 0.0 };
}

export interface SubjectResult {
  subjectName: string;
  marks: number; // ০-১০০ এর মধ্যে
  isOptional?: boolean; // ৪র্থ বিষয় হলে true (GPA-2 rule প্রযোজ্য)
}

export interface GpaResult {
  gpa: number; // চূড়ান্ত GPA (0.00 - 5.00)
  isPass: boolean; // কোনো মূল বিষয়ে F থাকলে false
  subjectGrades: (SubjectResult & GradeInfo)[];
  optionalBonus: number; // ৪র্থ বিষয় থেকে যোগ হওয়া বোনাস পয়েন্ট
}

/**
 * HSC GPA হিসাব করে।
 * @param coreSubjects ৬টি মূল বিষয় (compulsory + elective)
 * @param optionalSubject ঐচ্ছিক ৪র্থ বিষয় (না থাকলে undefined)
 */
export function calculateHscGpa(
  coreSubjects: SubjectResult[],
  optionalSubject?: SubjectResult
): GpaResult {
  const coreGrades = coreSubjects.map((s) => ({
    ...s,
    ...marksToGrade(s.marks),
  }));

  const coreSum = coreGrades.reduce((sum, g) => sum + g.point, 0);
  const hasFailInCore = coreGrades.some((g) => g.grade === "F");

  let optionalBonus = 0;
  let optionalGradeInfo: (SubjectResult & GradeInfo) | null = null;

  if (optionalSubject) {
    const optGrade = marksToGrade(optionalSubject.marks);
    optionalGradeInfo = { ...optionalSubject, ...optGrade, isOptional: true };
    // GPA-2 rule: ৪র্থ বিষয়ের গ্রেড পয়েন্ট থেকে ২ বিয়োগ, ঋণাত্মক হলে ০ ধরা হয়
    optionalBonus = Math.max(0, optGrade.point - 2);
  }

  const totalPoints = coreSum + optionalBonus;
  const rawGpa = totalPoints / (coreGrades.length || 1);

  // মূল বিষয়ে Fail থাকলে GPA 0.00 (বাংলাদেশ শিক্ষা বোর্ডের নিয়ম),
  // কিন্তু isPass=false দিয়ে জানানো হচ্ছে যাতে UI তে transparency থাকে
  const gpa = hasFailInCore ? 0 : Math.min(5, Math.round(rawGpa * 100) / 100);

  return {
    gpa,
    isPass: !hasFailInCore,
    subjectGrades: optionalGradeInfo
      ? [...coreGrades, optionalGradeInfo]
      : coreGrades,
    optionalBonus,
  };
}

/** GPA থেকে সংক্ষিপ্ত মূল্যায়ন বার্তা (বাংলায়) */
export function getGpaRemark(gpa: number, isPass: boolean): string {
  if (!isPass) return "একটি বা একাধিক বিষয়ে Fail — ফলাফল Fail";
  if (gpa >= 5.0) return "অসাধারণ! গোল্ডেন A+ 🏆";
  if (gpa >= 4.5) return "চমৎকার ফলাফল! 🌟";
  if (gpa >= 4.0) return "খুব ভালো ফলাফল";
  if (gpa >= 3.5) return "ভালো ফলাফল, আরেকটু চেষ্টায় A+ সম্ভব";
  if (gpa >= 3.0) return "মোটামুটি ফলাফল, আরও পরিশ্রম দরকার";
  if (gpa >= 2.0) return "উন্নতির অনেক সুযোগ আছে";
  return "পাস মার্কের কাছাকাছি, এখনই মনোযোগ দাও";
}
