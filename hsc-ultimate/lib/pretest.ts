// ===================================================================
// Pretest to Skip Known Topics — MASTER_PLAN.md এর মূল ভিশনের একটা
// অসম্পূর্ণ আইটেম, এই সেশনে বাস্তবায়ন।
// -------------------------------------------------------------------
// ধারণা: Khan Academy-স্টাইল "Mastery Challenge"/placement test থেকে
// অনুপ্রাণিত (web research দিয়ে verify করা) — একটা ছোট ডায়াগনস্টিক
// কুইজ দিয়ে বোঝা যায় ছাত্র কোন টপিক আগে থেকেই জানে, যাতে সেই টপিক
// স্কিপ করে সরাসরি দুর্বল টপিকে সময় দিতে পারে।
//
// Verified থ্রেশহোল্ড: Khan Academy অফিসিয়াল ডকুমেন্টেশন অনুযায়ী,
// "Not Started/Attempted" থেকে "Familiar" লেভেলে ওঠার জন্য exercise এ
// ৭০-৮৫% accuracy প্রয়োজন (https://support.khanacademy.org/hc/en-us/
// articles/360007253831-What-is-self-paced-Mastery)। আমরা এই রেঞ্জের
// মাঝামাঝি ৮০% থ্রেশহোল্ড ব্যবহার করছি — "জানা" (skip-worthy) ধরার জন্য।
//
// ডিজাইন সিদ্ধান্ত (transparency):
// - Pretest সম্পূর্ণ ঐচ্ছিক এবং কোনো QuizAttempt DB তে সেভ হয় না (তাই
//   XP/streak/leaderboard/Predicted GPA কোনোকিছুতেই প্রভাব ফেলে না) —
//   এটা একটা বিশুদ্ধ ডায়াগনস্টিক টুল, স্কোরড অ্যাক্টিভিটি না।
// - "স্কিপ করো" হিসেবে চিহ্নিত টপিক ছাত্র নিজে বেছে নিয়ে "Mastered" মার্ক
//   করতে পারে — এই মার্কিং বিদ্যমান `/api/topics/[topicId]/progress`
//   endpoint পুনর্ব্যবহার করে করা হয় (আলাদা XP/badge লজিক লেখা হয়নি,
//   consistency বজায় থাকে — ম্যানুয়ালি "Mastered" ক্লিক করলে যেমন +20 XP
//   পাওয়া যায়, পরীক্ষিত pretest দিয়ে করলেও একই নিয়ম প্রযোজ্য)
// ===================================================================
import { pickRandom } from "@/lib/mock-exam";

export const PRETEST_QUESTIONS_PER_TOPIC = 2;
export const PRETEST_MAX_QUESTIONS = 20;
// Khan Academy-verified থ্রেশহোল্ড (৭০-৮৫% রেঞ্জের মাঝামাঝি)
export const PRETEST_MASTERY_THRESHOLD_PCT = 80;

export interface PretestSourceQuestion {
  id: string;
  text: string;
  options: unknown;
  difficulty: string;
  topicId: string;
  topicName: string;
}

interface TopicWithQuestions {
  id: string;
  name: string;
  questions: {
    id: string;
    text: string;
    options: unknown;
    difficulty: string;
  }[];
}

/**
 * একটা চ্যাপ্টারের প্রতিটা টপিক থেকে সর্বোচ্চ `PRETEST_QUESTIONS_PER_TOPIC`
 * টা করে র‍্যান্ডম প্রশ্ন বাছাই করে (কোনো টপিক বাদ না দিয়ে সুষম কভারেজ),
 * তারপর সামগ্রিক লিমিটে (`PRETEST_MAX_QUESTIONS`) কাট করে দেয় — যাতে
 * টপিক-সংখ্যা বেশি হলেও পরীক্ষা দ্রুত শেষ হয় (৫-১০ মিনিটের মধ্যে)।
 */
export function selectPretestQuestions(topics: TopicWithQuestions[]): PretestSourceQuestion[] {
  const perTopicPicks: PretestSourceQuestion[] = [];

  for (const topic of topics) {
    if (topic.questions.length === 0) continue;
    const picked = pickRandom(topic.questions, PRETEST_QUESTIONS_PER_TOPIC);
    for (const q of picked) {
      perTopicPicks.push({
        id: q.id,
        text: q.text,
        options: q.options,
        difficulty: q.difficulty,
        topicId: topic.id,
        topicName: topic.name,
      });
    }
  }

  if (perTopicPicks.length <= PRETEST_MAX_QUESTIONS) {
    return perTopicPicks;
  }

  // লিমিটের বেশি হলে এলোমেলোভাবে কাট করা হয় (প্রতিটা টপিকের প্রতিনিধিত্ব
  // যথাসম্ভব বজায় রাখার চেষ্টা — pickRandom নিজেই shuffle করে বাছাই করে)
  return pickRandom(perTopicPicks, PRETEST_MAX_QUESTIONS);
}

export interface PretestTopicResult {
  topicId: string;
  topicName: string;
  correct: number;
  total: number;
  accuracyPct: number;
  recommendSkip: boolean; // accuracyPct >= থ্রেশহোল্ড হলে true ("জানা" টপিক)
}

interface GradedAnswerInput {
  questionId: string;
  userAnswer: string;
}

interface QuestionForGrading {
  id: string;
  correctAnswer: string;
  topicId: string;
  topicName: string;
}

export interface PretestGradeResult {
  overallCorrect: number;
  overallTotal: number;
  topics: PretestTopicResult[];
}

/**
 * ছাত্রের উত্তরগুলো সঠিক উত্তরের সাথে মিলিয়ে প্রতি-টপিক accuracy বের করে।
 * বিশুদ্ধ ফাংশন (কোনো DB কল নেই) — ইউনিট টেস্ট করা সহজ।
 */
export function gradePretest(
  answers: GradedAnswerInput[],
  questions: QuestionForGrading[]
): PretestGradeResult {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const topicAgg = new Map<string, { topicName: string; correct: number; total: number }>();
  let overallCorrect = 0;
  let overallTotal = 0;

  for (const ans of answers) {
    const question = questionMap.get(ans.questionId);
    if (!question) continue; // অজানা/অবৈধ questionId উপেক্ষা করা হয়

    const isCorrect = question.correctAnswer === ans.userAnswer;
    overallTotal += 1;
    if (isCorrect) overallCorrect += 1;

    if (!topicAgg.has(question.topicId)) {
      topicAgg.set(question.topicId, { topicName: question.topicName, correct: 0, total: 0 });
    }
    const agg = topicAgg.get(question.topicId)!;
    agg.total += 1;
    if (isCorrect) agg.correct += 1;
  }

  const topics: PretestTopicResult[] = Array.from(topicAgg.entries()).map(
    ([topicId, agg]) => {
      const accuracyPct = agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0;
      return {
        topicId,
        topicName: agg.topicName,
        correct: agg.correct,
        total: agg.total,
        accuracyPct,
        recommendSkip: accuracyPct >= PRETEST_MASTERY_THRESHOLD_PCT,
      };
    }
  );

  // সবচেয়ে বেশি accuracy আগে দেখানো হয় (UI তে "জানা" টপিক উপরে আসবে)
  topics.sort((a, b) => b.accuracyPct - a.accuracyPct);

  return { overallCorrect, overallTotal, topics };
}
