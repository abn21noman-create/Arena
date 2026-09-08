// ===================================================================
// মিস্টেক ভল্ট (Mistake Vault) — ভুল করা প্রশ্নের ডেডিকেটেড রিভিশন হাব
// -------------------------------------------------------------------
// Deep Research (web_search): বাংলাদেশী competitor SATT Academy এর
// "Mistake Vault" ফিচার থেকে সরাসরি অনুপ্রাণিত — "প্র্যাকটিস করার সময়
// আপনি যে প্রশ্নগুলো ভুল করবেন, সেগুলো অটোমেটিক 'Mistake Vault'-এ জমা
// থাকবে। এতে করে পরীক্ষার আগে আপনার দুর্বল জায়গাগুলো দ্রুত রিভিশন দেওয়া
// অনেক সহজ হয়ে যায়।" — এই কনসেপ্টটা আমাদের বিদ্যমান Adaptive Practice
// থেকে ভিন্ন: Adaptive Practice দুর্বল টপিক-ভিত্তিক মিশ্র প্রশ্ন সেট দেয়
// (correct+wrong প্রশ্ন মিশ্রিত), কিন্তু এখানে ইউজার ইচ্ছাকৃতভাবে *শুধু*
// নিজের ভুল করা প্রশ্নগুলো একসাথে দেখে/রিভিশন দিতে চাইবে — একটা
// dedicated, focused hub।
//
// ডিজাইন সিদ্ধান্ত (সম্পূর্ণ schema-free):
// - "ভান্ডারে আছে" এর সংজ্ঞা: প্রতিটা প্রশ্নের *সর্বশেষ* attempt যদি ভুল
//   হয়ে থাকে (isCorrect=false), তাহলে সেটা এখনো ভান্ডারে আছে। রিভিশনে
//   এসে সঠিক উত্তর দিলে (নতুন QuizAttemptAnswer তৈরি হয়, isCorrect=true)
//   পরের বার query তে সেই প্রশ্ন আর "সর্বশেষ ভুল" থাকবে না — স্বয়ংক্রিয়ভাবে
//   ভান্ডার থেকে বাদ পড়ে যাবে। কোনো নতুন কলাম/ফ্ল্যাগ/migration লাগে না।
// - বিদ্যমান `QuizAttemptAnswer` টেবিল থেকে সরাসরি derive করা হয় (Practice/
//   Adaptive/Drill/Mock Exam — যেকোনো quizType এর attempt থেকে আসা ভুল
//   উত্তরই গণনা হয়, উৎস অপ্রাসঙ্গিক)।
// - রিভিশন নিজেই বিদ্যমান QuizAttempt মডেলে quizType="mistake_vault"
//   হিসেবে সেভ হয় (Adaptive/Drill Practice এর established প্যাটার্ন
//   অনুসরণ করে, নতুন মডেল লাগেনি)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { shuffleOptions } from "@/lib/mock-exam";
import { isValidEnumValue, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

export const MISTAKE_VAULT_QUIZ_TYPE = "mistake_vault";
const MAX_VAULT_QUESTIONS = 30; // একবারে সর্বোচ্চ এতগুলো প্রশ্ন রিভিশনে দেখানো হয়

export interface MistakeVaultQuestion {
  id: string;
  text: string;
  options: unknown;
  difficulty: string;
  topicName: string;
  subjectName: string;
  subjectCode: string;
  lastWrongAt: string; // ISO date — কবে সর্বশেষ ভুল হয়েছিল (UI তে "৩ দিন আগে ভুল করেছিলে" দেখাতে)
  wrongCount: number; // মোট কতবার ভুল হয়েছে এই প্রশ্নে (severity সংকেত)
}

export interface MistakeVaultSummary {
  totalCount: number;
  bySubject: { subjectCode: string; subjectName: string; count: number }[];
}

/**
 * ইউজারের প্রতিটা প্রশ্নের সব attempt আনে, তারপর মেমরিতে সবচেয়ে সাম্প্রতিক
 * attempt বের করে — সেটা ভুল হলেই প্রশ্নটা এখনো "ভান্ডারে" আছে।
 * (একটা query তে সব প্রশ্নের পুরো attempt history আনা হচ্ছে; ডেটাসেট এই
 * স্কেলে [platform per-user] ছোট থাকায় in-memory grouping যথেষ্ট দ্রুত,
 * getWeakTopics()/getAnalyticsDashboardData() এর মতোই established প্যাটার্ন)
 */
async function getLatestAttemptPerQuestion(userId: string) {
  const answers = await prisma.quizAttemptAnswer.findMany({
    where: { quizAttempt: { userId } },
    select: {
      questionId: true,
      isCorrect: true,
      quizAttempt: { select: { createdAt: true } },
    },
    orderBy: { quizAttempt: { createdAt: "asc" } },
  });

  // questionId → { isCorrect (সর্বশেষ), lastAttemptAt, wrongCount (মোট) }
  const byQuestion = new Map<
    string,
    { isCorrect: boolean; lastAttemptAt: Date; wrongCount: number }
  >();

  for (const ans of answers) {
    const existing = byQuestion.get(ans.questionId);
    const wrongCount = (existing?.wrongCount ?? 0) + (ans.isCorrect ? 0 : 1);
    // ascending order এ iterate হচ্ছে, তাই পরের entry সবসময় নতুন —
    // isCorrect/lastAttemptAt প্রতিবার overwrite হয়ে শেষে সর্বশেষটাই থাকবে
    byQuestion.set(ans.questionId, {
      isCorrect: ans.isCorrect,
      lastAttemptAt: ans.quizAttempt.createdAt,
      wrongCount,
    });
  }

  return byQuestion;
}

/** ইউজারের মিস্টেক ভল্টের সারসংক্ষেপ (Dashboard/hub পেজে দেখানোর জন্য) */
export async function getMistakeVaultSummary(userId: string): Promise<MistakeVaultSummary> {
  const byQuestion = await getLatestAttemptPerQuestion(userId);
  const wrongQuestionIds = Array.from(byQuestion.entries())
    .filter(([, v]) => !v.isCorrect)
    .map(([id]) => id);

  if (wrongQuestionIds.length === 0) {
    return { totalCount: 0, bySubject: [] };
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: wrongQuestionIds } },
    select: {
      topic: { select: { chapter: { select: { subject: { select: { code: true, name: true } } } } } },
    },
  });

  const bySubjectMap = new Map<string, { subjectName: string; count: number }>();
  for (const q of questions) {
    const subject = q.topic.chapter.subject;
    const existing = bySubjectMap.get(subject.code) ?? { subjectName: subject.name, count: 0 };
    existing.count += 1;
    bySubjectMap.set(subject.code, existing);
  }

  return {
    totalCount: wrongQuestionIds.length,
    bySubject: Array.from(bySubjectMap.entries())
      .map(([subjectCode, v]) => ({ subjectCode, subjectName: v.subjectName, count: v.count }))
      .sort((a, b) => b.count - a.count),
  };
}

/**
 * রিভিশনের জন্য প্রকৃত প্রশ্ন লিস্ট বানায় (সঠিক উত্তর/ব্যাখ্যা ছাড়া,
 * cheating আটকাতে — established প্র্যাকটিস প্যাটার্ন)। ঐচ্ছিক
 * subjectCode দিয়ে নির্দিষ্ট সাবজেক্টে ফিল্টার করা যায়।
 */
export async function getMistakeVaultQuestions(
  userId: string,
  subjectCode?: string
): Promise<MistakeVaultQuestion[]> {
  const byQuestion = await getLatestAttemptPerQuestion(userId);
  const wrongQuestionIds = Array.from(byQuestion.entries())
    .filter(([, v]) => !v.isCorrect)
    .map(([id]) => id);

  if (wrongQuestionIds.length === 0) return [];

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // forum/posts GET/flashcard-decks/discover এর একই enum-validation-
  // missing (query param) ক্লাস): আগে `subjectCode as never` দিয়ে
  // সরাসরি Prisma where ক্লজে পাস করা হতো — অজানা subjectCode দিলে
  // `PrismaClientValidationError` throw করে ৫০০ crash করতো। ফিক্স:
  // ভ্যালিডেট করে অবৈধ হলে ফিল্টার উপেক্ষা করা হচ্ছে।
  const validSubjectCode = isValidEnumValue(subjectCode, VALID_SUBJECT_CODES) ? subjectCode : null;

  const questions = await prisma.question.findMany({
    where: {
      id: { in: wrongQuestionIds },
      ...(validSubjectCode && { topic: { chapter: { subject: { code: validSubjectCode } } } }),
    },
    select: {
      id: true,
      text: true,
      options: true,
      difficulty: true,
      topic: {
        select: { name: true, chapter: { select: { subject: { select: { code: true, name: true } } } } },
      },
    },
  });

  // সবচেয়ে সাম্প্রতিক ভুলগুলো আগে দেখানো হয় (সবচেয়ে "fresh" দুর্বলতা)
  const sorted = questions
    .map((q) => {
      const meta = byQuestion.get(q.id)!;
      return { q, meta };
    })
    .sort((a, b) => b.meta.lastAttemptAt.getTime() - a.meta.lastAttemptAt.getTime())
    .slice(0, MAX_VAULT_QUESTIONS);

  return sorted.map(({ q, meta }) => ({
    id: q.id,
    text: q.text,
    options: Array.isArray(q.options) ? shuffleOptions(q.options as string[]) : q.options,
    difficulty: q.difficulty,
    topicName: q.topic.name,
    subjectName: q.topic.chapter.subject.name,
    subjectCode: q.topic.chapter.subject.code,
    lastWrongAt: meta.lastAttemptAt.toISOString(),
    wrongCount: meta.wrongCount,
  }));
}
