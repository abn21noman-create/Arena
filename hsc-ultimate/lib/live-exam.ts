// ===================================================================
// Live Exam Session — একা (solo) লাইভ পরীক্ষা (Custom Question Set অথবা
// Subject Question Bank থেকে), ছাত্র নিজে সময়সীমা ঠিক করে
// -------------------------------------------------------------------
// Mock Exam এর থেকে ভিন্ন: বোর্ড-ফরম্যাট মেনে চলে না, AI-generated custom
// প্রশ্ন দিয়েও চলতে পারে।
//
// 🔧 সম্প্রসারণ (এই সেশনে, Smart Live Exam ভিশনের ধারাবাহিকতায়): আগে
// এই মডিউলে শুধু MCQ সাপোর্ট ছিল (design decision — server-side
// auto-scoring সহজ ও তাৎক্ষণিক রাখতে)। এখন CQ (সৃজনশীল প্রশ্ন) সাপোর্টও
// যোগ হয়েছে — established Mock Exam এর CQ ফ্লো (`lib/cq-evaluator.ts`
// এর `evaluateCQAnswer()`, AI দিয়ে মূল্যায়ন) পুনর্ব্যবহার করে। MCQ ও CQ
// দুটো সম্পূর্ণ আলাদা ফাংশন সেটে ভাগ করা হয়েছে (একই ফাংশনে branching
// করলে জটিলতা বাড়তো, established Mock Exam ও একই ভাবে MCQ/CQ আলাদা
// submit endpoint ব্যবহার করে)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { pickRandom } from "@/lib/mock-exam";
import { awardXp } from "@/lib/league";
import { evaluateCQAnswer } from "@/lib/cq-evaluator";

const XP_PER_CORRECT_ANSWER = 2;
const XP_PER_CQ_MARK = 2; // established Mock Exam এর XP_PER_CQ_MARK এর সাথে সামঞ্জস্যপূর্ণ
export const MIN_DURATION_MINUTES = 5;
export const MAX_DURATION_MINUTES = 180;

interface StartLiveExamInput {
  userId: string;
  sourceType: "custom" | "question_bank";
  questionType: "MCQ" | "CQ";
  customSetId?: string;
  subjectId?: string;
  questionCount?: number;
  durationMinutes: number;
}

/**
 * নতুন Live Exam সেশন শুরু করে — custom set থেকে সব প্রশ্ন, অথবা subject
 * question bank থেকে এলোমেলো প্রশ্ন বেছে নেয় (MCQ অথবা CQ)।
 */
export async function startLiveExam(input: StartLiveExamInput) {
  const durationMinutes = Math.min(
    Math.max(input.durationMinutes, MIN_DURATION_MINUTES),
    MAX_DURATION_MINUTES
  );

  let questionIds: string[];

  if (input.sourceType === "custom") {
    if (!input.customSetId) throw new Error("customSetId আবশ্যক");
    const set = await prisma.customQuestionSet.findUnique({
      where: { id: input.customSetId },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!set || set.userId !== input.userId) throw new Error("সেট পাওয়া যায়নি");
    if (set.status !== "READY") throw new Error("এই সেট এখনো প্রস্তুত হয়নি");
    if (set.questionType !== input.questionType) {
      throw new Error(
        `এই সেট ${set.questionType === "MCQ" ? "MCQ" : "CQ"} — তুমি ${input.questionType === "MCQ" ? "MCQ" : "CQ"} Live Exam শুরু করার চেষ্টা করছো`
      );
    }
    if (set.questions.length === 0) throw new Error("এই সেটে কোনো প্রশ্ন নেই");

    questionIds = set.questions.map((q) => q.id);
  } else {
    if (!input.subjectId) throw new Error("subjectId আবশ্যক");

    if (input.questionType === "MCQ") {
      const count = Math.min(Math.max(input.questionCount ?? 10, 5), 30);
      const allMcq = await prisma.question.findMany({
        where: { topic: { chapter: { subjectId: input.subjectId } }, type: "MCQ" },
        select: { id: true },
      });
      if (allMcq.length < count) {
        throw new Error(`এই সাবজেক্টে যথেষ্ট প্রশ্ন নেই (কমপক্ষে ${count}টা লাগবে)`);
      }
      questionIds = pickRandom(
        allMcq.map((q) => q.id),
        count
      );
    } else {
      // CQ: established Mock Exam এর মতো সাধারণত কম সংখ্যক প্রশ্ন নেওয়া হয়
      // (প্রতিটা CQ লিখতে অনেক সময় লাগে, established cqCount established
      // Mock Exam FULL mode এ ৫টা, QUICK mode এ ২টা)
      const count = Math.min(Math.max(input.questionCount ?? 3, 1), 10);
      const allCq = await prisma.cQQuestion.findMany({
        where: { topic: { chapter: { subjectId: input.subjectId } } },
        select: { id: true },
      });
      if (allCq.length < count) {
        throw new Error(`এই সাবজেক্টে যথেষ্ট CQ প্রশ্ন নেই (কমপক্ষে ${count}টা লাগবে)`);
      }
      questionIds = pickRandom(
        allCq.map((q) => q.id),
        count
      );
    }
  }

  return prisma.liveExamSession.create({
    data: {
      userId: input.userId,
      customSetId: input.sourceType === "custom" ? input.customSetId : null,
      questionIds,
      sourceType: input.sourceType,
      questionType: input.questionType,
      durationMinutes,
      totalQuestions: input.questionType === "MCQ" ? questionIds.length : 0,
      cqTotalMarks: input.questionType === "CQ" ? questionIds.length * 10 : 0,
    },
  });
}

/** MCQ সেশনের প্রশ্নগুলো লোড করে (সঠিক উত্তর বাদ দিয়ে, ক্লায়েন্টে leak ঠেকাতে) */
export async function getLiveExamQuestions(sessionId: string, userId: string) {
  const session = await prisma.liveExamSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("সেশন পাওয়া যায়নি");
  if (session.questionType !== "MCQ") throw new Error("এটা MCQ সেশন না");

  const questionIds = session.questionIds as string[];

  if (session.sourceType === "custom") {
    const questions = await prisma.customQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, text: true, options: true },
    });
    const map = new Map(questions.map((q) => [q.id, q]));
    return questionIds.map((id) => map.get(id)).filter((q): q is NonNullable<typeof q> => q !== undefined);
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, text: true, options: true, difficulty: true },
  });
  const map = new Map(questions.map((q) => [q.id, q]));
  return questionIds.map((id) => map.get(id)).filter((q): q is NonNullable<typeof q> => q !== undefined);
}

/**
 * CQ সেশনের প্রশ্নগুলো লোড করে (মডেল উত্তর বাদ দিয়ে) — established
 * dual-source (CustomQuestion/CQQuestion) লজিক MCQ এর মতোই।
 */
export async function getLiveExamCqQuestions(sessionId: string, userId: string) {
  const session = await prisma.liveExamSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("সেশন পাওয়া যায়নি");
  if (session.questionType !== "CQ") throw new Error("এটা CQ সেশন না");

  const questionIds = session.questionIds as string[];

  if (session.sourceType === "custom") {
    const questions = await prisma.customQuestion.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        stimulus: true,
        questionA: true,
        questionB: true,
        questionC: true,
        questionD: true,
      },
    });
    const map = new Map(questions.map((q) => [q.id, q]));
    return questionIds.map((id) => map.get(id)).filter((q): q is NonNullable<typeof q> => q !== undefined);
  }

  const questions = await prisma.cQQuestion.findMany({
    where: { id: { in: questionIds } },
    select: {
      id: true,
      stimulus: true,
      questionA: true,
      questionB: true,
      questionC: true,
      questionD: true,
      boardYear: true,
      boardName: true,
    },
  });
  const map = new Map(questions.map((q) => [q.id, q]));
  return questionIds.map((id) => map.get(id)).filter((q): q is NonNullable<typeof q> => q !== undefined);
}

/** উত্তর জমা দিয়ে সার্ভার-সাইড স্কোরিং করে, XP দেয় (শুধু MCQ সেশনের জন্য) */
export async function submitLiveExam(
  sessionId: string,
  userId: string,
  answers: Record<string, string>
) {
  const session = await prisma.liveExamSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("সেশন পাওয়া যায়নি");
  if (session.questionType !== "MCQ") throw new Error("এটা MCQ সেশন না");

  const questionIds = session.questionIds as string[];
  let score = 0;
  let correctAnswerMap = new Map<string, string>();

  if (session.sourceType === "custom") {
    const questions = await prisma.customQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });
    correctAnswerMap = new Map(questions.map((q) => [q.id, q.correctAnswer ?? ""]));
  } else {
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });
    correctAnswerMap = new Map(questions.map((q) => [q.id, q.correctAnswer]));
  }

  for (const [qId, userAnswer] of Object.entries(answers)) {
    if (correctAnswerMap.get(qId) === userAnswer) score++;
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Task/StudyPlanItem/
  // QuizBattle/QuizDuel/ContentReport/MockExam/Admission এর একই
  // race-condition ক্লাস, XP double-award সহ সবচেয়ে গুরুতর কেসগুলোর
  // একটা): আগে উপরে (এই ফাংশনের শুরুতে) `session.status !== "IN_PROGRESS"`
  // চেক করা হতো read-then-write প্যাটার্নে — লাইভ concurrency টেস্টে ৫টা
  // concurrent submit request পাঠিয়ে ৫টাই সফল হয়েছে (প্রত্যাশিত ১টা,
  // প্রতিটা `awardXp()` কল করে ফেলতো)। ফিক্স: চেকটা সরিয়ে এখানে single
  // atomic `updateMany({ where: { id, status: "IN_PROGRESS" } })`
  // স্টেটমেন্ট দিয়ে check+set একসাথে করা হয়েছে — শুধু matched (count>0)
  // request-ই `awardXp()` কল করার অনুমতি পায়।
  const claimResult = await prisma.liveExamSession.updateMany({
    where: { id: sessionId, status: "IN_PROGRESS" },
    data: {
      userAnswers: answers,
      score,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  if (claimResult.count === 0) {
    throw new Error("এই সেশন ইতিমধ্যে জমা হয়ে গেছে");
  }

  const updated = await prisma.liveExamSession.findUniqueOrThrow({ where: { id: sessionId } });

  await awardXp(userId, score * XP_PER_CORRECT_ANSWER);

  return updated;
}

interface CqAnswerInput {
  questionId: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
}

/**
 * CQ সেশনের উত্তর জমা দিয়ে AI দিয়ে প্রতিটা প্রশ্ন মূল্যায়ন করে (established
 * Mock Exam `submit-cq` এর একই race-condition-safe atomic claim প্যাটার্ন,
 * এবং একই "খালি উত্তরে AI কল না করে সরাসরি ০" অপ্টিমাইজেশন)।
 */
export async function submitLiveExamCq(
  sessionId: string,
  userId: string,
  answers: CqAnswerInput[]
) {
  const session = await prisma.liveExamSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new Error("সেশন পাওয়া যায়নি");
  if (session.questionType !== "CQ") throw new Error("এটা CQ সেশন না");

  if (!Array.isArray(answers)) throw new Error("সঠিক answers array দিন");

  // 🐛 বাগ ফিক্স প্যাটার্ন (established Mock Exam submit-cq এর একই
  // race-condition ক্লাস অগ্রিম প্রতিরোধ, প্রোঅ্যাক্টিভ প্রয়োগ — এই
  // ফিচার নতুন বানানোর সময় established bug-hunt এর শিক্ষা সরাসরি প্রয়োগ
  // করা হয়েছে, নতুন করে bug আবিষ্কার করার অপেক্ষা না করে): ব্যয়বহুল AI
  // evaluation loop শুরুর **আগেই** atomic status claim করা হচ্ছে, যাতে
  // concurrent duplicate submit request AI cost/XP double-award ঘটাতে
  // না পারে।
  const claimResult = await prisma.liveExamSession.updateMany({
    where: { id: sessionId, status: "IN_PROGRESS" },
    data: { status: "COMPLETED" },
  });

  if (claimResult.count === 0) {
    throw new Error("এই সেশন ইতিমধ্যে জমা হয়ে গেছে");
  }

  const questionIds = session.questionIds as string[];

  interface QuestionDetail {
    stimulus: string;
    questionA: string;
    questionB: string;
    questionC: string;
    questionD: string;
    modelAnswerA?: string | null;
    modelAnswerB?: string | null;
    modelAnswerC?: string | null;
    modelAnswerD?: string | null;
  }

  let questionMap: Map<string, QuestionDetail>;

  if (session.sourceType === "custom") {
    const questions = await prisma.customQuestion.findMany({ where: { id: { in: questionIds } } });
    questionMap = new Map(
      questions.map((q) => [
        q.id,
        {
          stimulus: q.stimulus ?? "",
          questionA: q.questionA ?? "",
          questionB: q.questionB ?? "",
          questionC: q.questionC ?? "",
          questionD: q.questionD ?? "",
          modelAnswerA: q.modelAnswerA,
          modelAnswerB: q.modelAnswerB,
          modelAnswerC: q.modelAnswerC,
          modelAnswerD: q.modelAnswerD,
        },
      ])
    );
  } else {
    const questions = await prisma.cQQuestion.findMany({ where: { id: { in: questionIds } } });
    questionMap = new Map(questions.map((q) => [q.id, q]));
  }

  const cqAnswersRecord: Record<string, CqAnswerInput> = {};
  const cqEvaluationsRecord: Record<
    string,
    { scoreA: number; scoreB: number; scoreC: number; scoreD: number; totalScore: number; feedback: string; aiProvider: string }
  > = {};
  let totalCqScore = 0;

  // প্রতিটা CQ আলাদাভাবে AI দিয়ে মূল্যায়ন করা হচ্ছে (sequential — rate limit এড়াতে, established Mock Exam এর একই প্যাটার্ন)
  for (const a of answers) {
    const q = questionMap.get(a.questionId);
    if (!q) continue;

    cqAnswersRecord[a.questionId] = a;

    if (!a.answerA?.trim() && !a.answerB?.trim() && !a.answerC?.trim() && !a.answerD?.trim()) {
      // খালি উত্তর হলে AI কল না করে সরাসরি ০ দেওয়া হচ্ছে (খরচ ও সময় বাঁচাতে)
      cqEvaluationsRecord[a.questionId] = {
        scoreA: 0,
        scoreB: 0,
        scoreC: 0,
        scoreD: 0,
        totalScore: 0,
        feedback: "কোনো উত্তর দেওয়া হয়নি।",
        aiProvider: "none",
      };
      continue;
    }

    try {
      const evaluation = await evaluateCQAnswer({
        stimulus: q.stimulus,
        questionA: q.questionA,
        questionB: q.questionB,
        questionC: q.questionC,
        questionD: q.questionD,
        modelAnswerA: q.modelAnswerA,
        modelAnswerB: q.modelAnswerB,
        modelAnswerC: q.modelAnswerC,
        modelAnswerD: q.modelAnswerD,
        answerA: a.answerA ?? "",
        answerB: a.answerB ?? "",
        answerC: a.answerC ?? "",
        answerD: a.answerD ?? "",
      });

      cqEvaluationsRecord[a.questionId] = {
        scoreA: evaluation.scoreA,
        scoreB: evaluation.scoreB,
        scoreC: evaluation.scoreC,
        scoreD: evaluation.scoreD,
        totalScore: evaluation.totalScore,
        feedback: evaluation.feedback,
        aiProvider: evaluation.provider,
      };
      totalCqScore += evaluation.totalScore;
    } catch (err) {
      console.error("Live Exam CQ Evaluation Error:", err);
      // একটা CQ evaluate করতে ব্যর্থ হলেও বাকিগুলো চালিয়ে যাওয়া হচ্ছে
    }
  }

  const updated = await prisma.liveExamSession.update({
    where: { id: sessionId },
    data: {
      cqAnswers: cqAnswersRecord as unknown as Prisma.InputJsonValue,
      cqEvaluations: cqEvaluationsRecord as unknown as Prisma.InputJsonValue,
      cqScore: totalCqScore,
      completedAt: new Date(),
    },
  });

  await awardXp(userId, totalCqScore * XP_PER_CQ_MARK);

  return updated;
}

/** ইউজারের Live Exam হিস্ট্রি */
export async function getMyLiveExamHistory(userId: string) {
  return prisma.liveExamSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 20,
  });
}
