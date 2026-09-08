// ===================================================================
// Adaptive/Smart Practice — দুর্বল টপিক চিহ্নিত করে টার্গেটেড প্রশ্ন সেট
// -------------------------------------------------------------------
// Deep Research এ চিহ্নিত Tier 1 ফিচার: "Adaptive practice engine (weak
// topic থেকে বেশি প্রশ্ন সাজেস্ট করা)" — Khan Academy/ALEKS-স্টাইল
// মাস্টারি-ভিত্তিক লার্নিং এর সরলীকৃত সংস্করণ।
//
// অ্যালগরিদম:
// ১. ইউজারের সব QuizAttemptAnswer থেকে টপিক-ভিত্তিক accuracy হিসাব করা হয়
//    (lib/analytics.ts এর getWeakTopics() এর মতোই লজিক, কিন্তু এখানে
//    questionId ধরে রাখা হয় প্রশ্ন বাছাইয়ের জন্য)
// ২. দুর্বল টপিক নির্ধারণ: accuracy < 70% (কমপক্ষে ২টা উত্তর দেওয়া থাকতে
//    হবে অর্থবহ সিদ্ধান্তের জন্য), অথবা কখনো প্র্যাকটিস না করা গুরুত্বপূর্ণ
//    টপিক (isImportant=true, TopicProgress এ কোনো রেকর্ড নেই)
// ৩. প্রশ্ন বাছাই অগ্রাধিকার: (ক) দুর্বল টপিকের প্রশ্ন যা আগে ভুল উত্তর
//    দেওয়া হয়েছিল, (খ) দুর্বল টপিকের না-দেখা প্রশ্ন, (গ) এখনো যথেষ্ট ডেটা
//    নেই এমন গুরুত্বপূর্ণ টপিকের প্রশ্ন — মোট normally ১৫টা প্রশ্নের সেট
// ৪. কোনো দুর্বলতা না পাওয়া গেলে (নতুন ইউজার বা সব ভালো করছে) এলোমেলো
//    গুরুত্বপূর্ণ টপিক থেকে প্রশ্ন দেওয়া হয় (cold-start fallback)
// ===================================================================
import { prisma } from "@/lib/prisma";
import { pickRandom } from "@/lib/mock-exam";import { getEmpiricalDifficultyMap, sortByTargetDifficulty } from "@/lib/item-difficulty";

const MIN_ANSWERS_FOR_WEAK_SIGNAL = 2;
const WEAK_ACCURACY_THRESHOLD = 70; // এর নিচে accuracy% হলে দুর্বল ধরা হয়
const DEFAULT_QUESTION_COUNT = 15;

export interface AdaptivePracticeQuestion {
  id: string;
  text: string;
  options: unknown;
  difficulty: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  reason: "wrong_before" | "weak_topic_unseen" | "unpracticed_important" | "random";
  // Simplified Item-Difficulty Calibration — প্রকৃত response-data থেকে
  // বের করা empirical difficulty bucket (admin এর ম্যানুয়াল `difficulty`
  // ফিল্ড থেকে আলাদা), যথেষ্ট ডেটা না থাকলে null
  empiricalDifficulty: "EASY" | "MEDIUM" | "HARD" | null;
}

export interface WeakTopicSummary {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracyPct: number;
  totalAnswered: number;
  // Peer Comparison (FEATURE_RESEARCH_V3.md Tier ২, আইটেম ১০) — এই টপিকে
  // অন্য সব ইউজারদের গড় accuracy% (নিজেকে বাদ দিয়ে), তুলনা করার জন্য।
  // পর্যাপ্ত ডেটা না থাকলে (কেউ এই টপিকে প্র্যাকটিস করেনি) null থাকবে।
  peerAvgAccuracyPct: number | null;
  peerCount: number; // কতজন অন্য ইউজার এই টপিকে অন্তত ১টা প্রশ্নের উত্তর দিয়েছে
}

interface TopicAggregate {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  correct: number;
  total: number;
  wrongQuestionIds: Set<string>;
  seenQuestionIds: Set<string>;
}

/**
 * ইউজারের দুর্বল টপিক প্রিভিউ দেয় (কনফার্মেশন স্ক্রিনে দেখানোর জন্য —
 * "এই ৩টা টপিকে তুমি দুর্বল, স্মার্ট প্র্যাকটিস শুরু করো" জাতীয় UX)
 */
export async function getWeakTopicsPreview(userId: string): Promise<WeakTopicSummary[]> {
  const { topicAggregates } = await buildTopicAggregates(userId);

  const weakTopics = Array.from(topicAggregates.values())
    .filter((t) => t.total >= MIN_ANSWERS_FOR_WEAK_SIGNAL)
    .map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      subjectName: t.subjectName,
      accuracyPct: Math.round((t.correct / t.total) * 100),
      totalAnswered: t.total,
    }))
    .filter((t) => t.accuracyPct < WEAK_ACCURACY_THRESHOLD)
    .sort((a, b) => a.accuracyPct - b.accuracyPct);

  if (weakTopics.length === 0) return [];

  // Peer Comparison — এই টপিকগুলোতে অন্য সব ইউজারের গড় accuracy% হিসাব
  // করা হয় (একটাই query তে, N+1 এড়াতে)
  const peerStats = await getPeerAccuracyByTopic(
    weakTopics.map((t) => t.topicId),
    userId
  );

  return weakTopics.map((t) => {
    const peer = peerStats.get(t.topicId);
    return {
      ...t,
      peerAvgAccuracyPct: peer ? Math.round((peer.correct / peer.total) * 100) : null,
      peerCount: peer ? peer.userIds.size : 0,
    };
  });
}

// Peer Comparison এর জন্য ন্যূনতম কতজন peer থাকতে হবে অর্থবহ তুলনার জন্য
// (১-২ জনের ডেটা দিয়ে তুলনা করলে বিভ্রান্তিকর/অনির্ভরযোগ্য হতে পারে)
const MIN_PEERS_FOR_COMPARISON = 3;

/**
 * দেওয়া topicId গুলোতে, দেওয়া userId ছাড়া বাকি সব ইউজারের সম্মিলিত
 * accuracy হিসাব করে — একটাই findMany query তে সব টপিকের জন্য।
 */
async function getPeerAccuracyByTopic(
  topicIds: string[],
  excludeUserId: string
): Promise<Map<string, { correct: number; total: number; userIds: Set<string> }>> {
  const answers = await prisma.quizAttemptAnswer.findMany({
    where: {
      question: { topicId: { in: topicIds } },
      quizAttempt: { userId: { not: excludeUserId } },
    },
    select: {
      isCorrect: true,
      question: { select: { topicId: true } },
      quizAttempt: { select: { userId: true } },
    },
  });

  const byTopic = new Map<string, { correct: number; total: number; userIds: Set<string> }>();
  for (const ans of answers) {
    const topicId = ans.question.topicId;
    const existing = byTopic.get(topicId) ?? { correct: 0, total: 0, userIds: new Set<string>() };
    existing.total += 1;
    if (ans.isCorrect) existing.correct += 1;
    existing.userIds.add(ans.quizAttempt.userId);
    byTopic.set(topicId, existing);
  }

  // পর্যাপ্ত peer না থাকলে (নিজেই একমাত্র ইউজার, অথবা ১-২ জন) সেই টপিক
  // বাদ দেওয়া হয় — অনির্ভরযোগ্য তুলনা এড়াতে
  for (const [topicId, stats] of byTopic) {
    if (stats.userIds.size < MIN_PEERS_FOR_COMPARISON) {
      byTopic.delete(topicId);
    }
  }

  return byTopic;
}

async function buildTopicAggregates(userId: string) {
  const answers = await prisma.quizAttemptAnswer.findMany({
    where: { quizAttempt: { userId } },
    select: {
      isCorrect: true,
      questionId: true,
      question: {
        select: {
          topic: {
            select: {
              id: true,
              name: true,
              chapter: { select: { subject: { select: { id: true, name: true } } } },
            },
          },
        },
      },
    },
  });

  const topicAggregates = new Map<string, TopicAggregate>();
  for (const ans of answers) {
    const topic = ans.question.topic;
    const existing = topicAggregates.get(topic.id) ?? {
      topicId: topic.id,
      topicName: topic.name,
      subjectId: topic.chapter.subject.id,
      subjectName: topic.chapter.subject.name,
      correct: 0,
      total: 0,
      wrongQuestionIds: new Set<string>(),
      seenQuestionIds: new Set<string>(),
    };
    existing.total += 1;
    existing.seenQuestionIds.add(ans.questionId);
    if (ans.isCorrect) {
      existing.correct += 1;
    } else {
      existing.wrongQuestionIds.add(ans.questionId);
    }
    topicAggregates.set(topic.id, existing);
  }

  return { topicAggregates };
}

/**
 * Adaptive/Smart Practice Core Engine Upgrade
 * সিংগুলারিটি ইন্টেলিজেন্স: এখন এটি ইউজারের পারফরম্যান্স গ্রাফ অনুযায়ী 
 * রিয়েল-টাইমে ডিফিকাল্টি অ্যাডজাস্ট করবে।
 */
export async function buildAdaptivePracticeSet(
  userId: string,
  count: number = DEFAULT_QUESTION_COUNT
): Promise<AdaptivePracticeQuestion[]> {
  const { topicAggregates } = await buildTopicAggregates(userId);

  // ১. ইউজারের রিসেন্ট পারফরম্যান্স অডিট (Singularity Audit)
  const weakTopics = Array.from(topicAggregates.values())
    .map((t) => ({ ...t, accuracyPct: Math.round((t.correct / t.total) * 100) }))
    .sort((a, b) => a.accuracyPct - b.accuracyPct);

  // ২. ডাইনামিক টার্গেট নির্ধারণ: ভালো করলে কঠিন প্রশ্ন, খারাপ করলে সহজ প্রশ্ন
  const avgAccuracy = weakTopics.length > 0 
    ? weakTopics.reduce((sum, t) => sum + t.accuracyPct, 0) / weakTopics.length 
    : 70;
  
  // সিংগুলারিটি রুল: যদি গড় একুরেসি ৮০% এর বেশি হয়, তবে ডিফল্ট ডিফিকাল্টি হবে HARD
  const targetDifficulty = avgAccuracy > 80 ? "HARD" : avgAccuracy > 50 ? "MEDIUM" : "EASY";

  const selected: AdaptivePracticeQuestion[] = [];
  const usedQuestionIds = new Set<string>();

  // ৩. প্রশ্ন সিলেকশন লজিক (Priority Based)

  // ধাপ ১: দুর্বল টপিকে আগে ভুল করা প্রশ্ন (সবচেয়ে গুরুত্বপূর্ণ — যেখানে
  // ভুল হয়েছিল ঠিক সেই প্রশ্নই আবার দেখানো active-recall এর জন্য কার্যকর)
  // — এই ধাপে difficulty sorting প্রয়োগ করা হয় না, কারণ "আগে ভুল করা
  // প্রশ্ন" এমনিতেই সর্বোচ্চ অগ্রাধিকার পাওয়ার কথা।
  if (weakTopics.length > 0) {
    const wrongQuestionIds = weakTopics.flatMap((t) => Array.from(t.wrongQuestionIds));
    if (wrongQuestionIds.length > 0) {
      const wrongQuestions = await prisma.question.findMany({
        where: { id: { in: wrongQuestionIds } },
        select: questionSelectFields(),
      });
      const difficultyMap = await getEmpiricalDifficultyMap(wrongQuestions.map((q) => q.id));
      for (const q of wrongQuestions) {
        if (selected.length >= count) break;
        selected.push(toAdaptiveQuestion(q, "wrong_before", difficultyMap.get(q.id)?.bucket ?? null));
        usedQuestionIds.add(q.id);
      }
    }
  }

  // ধাপ ২: দুর্বল টপিকের অন্যান্য (না-দেখা) প্রশ্ন — এখানে empirical
  // difficulty অনুযায়ী sort করা হয়, ইউজারের overall accuracy এর কাছাকাছি
  // difficulty এর প্রশ্ন আগে আসে (Simplified Rasch-style ability matching)
  if (selected.length < count && weakTopics.length > 0) {
    const weakTopicIds = weakTopics.map((t) => t.topicId);
    const candidateQuestions = await prisma.question.findMany({
      where: { topicId: { in: weakTopicIds }, id: { notIn: Array.from(usedQuestionIds) } },
      select: questionSelectFields(),
    });
    // প্রথমে এলোমেলো করা হয় (একই difficulty bucket এর মধ্যে varietey
    // থাকার জন্য), তারপর difficulty অনুযায়ী stable-sort করা হয়
    const shuffled = pickRandom(candidateQuestions, candidateQuestions.length);
    const difficultyMap = await getEmpiricalDifficultyMap(shuffled.map((q) => q.id));
    const sorted = sortByTargetDifficulty(shuffled, difficultyMap, targetDifficulty);
    for (const q of sorted) {
      if (selected.length >= count) break;
      selected.push(toAdaptiveQuestion(q, "weak_topic_unseen", difficultyMap.get(q.id)?.bucket ?? null));
      usedQuestionIds.add(q.id);
    }
  }

  // ধাপ ৩: cold-start fallback — এখনো কোটা পূরণ না হলে গুরুত্বপূর্ণ কিন্তু
  // এখনো প্র্যাকটিস না করা টপিক থেকে (নতুন ইউজার বা সব ভালো করছে এমন ইউজার)
  if (selected.length < count) {
    const practicedTopicIds = Array.from(topicAggregates.keys());
    const importantUnpracticed = await prisma.topic.findMany({
      where: {
        isImportant: true,
        id: { notIn: practicedTopicIds.length > 0 ? practicedTopicIds : undefined },
      },
      select: { id: true },
    });

    if (importantUnpracticed.length > 0) {
      const candidateQuestions = await prisma.question.findMany({
        where: {
          topicId: { in: importantUnpracticed.map((t) => t.id) },
          id: { notIn: Array.from(usedQuestionIds) },
        },
        select: questionSelectFields(),
      });
      const shuffled = pickRandom(candidateQuestions, candidateQuestions.length);
      for (const q of shuffled) {
        if (selected.length >= count) break;
        selected.push(toAdaptiveQuestion(q, "unpracticed_important", null));
        usedQuestionIds.add(q.id);
      }
    }
  }

  // ধাপ ৪: এখনো কোটা পূরণ না হলে (খুব নতুন ইউজার, কোনো প্র্যাকটিস ডেটা নেই)
  // সম্পূর্ণ এলোমেলোভাবে যেকোনো প্রশ্ন থেকে পূরণ করা হয়
  if (selected.length < count) {
    const randomQuestions = await prisma.question.findMany({
      where: { type: "MCQ", id: { notIn: Array.from(usedQuestionIds) } },
      select: questionSelectFields(),
      take: 200, // বড় pool থেকে র‍্যান্ডম বাছাই, পুরো টেবিল না আনতে
    });
    const shuffled = pickRandom(randomQuestions, randomQuestions.length);
    for (const q of shuffled) {
      if (selected.length >= count) break;
      selected.push(toAdaptiveQuestion(q, "random", null));
      usedQuestionIds.add(q.id);
    }
  }

  return selected;
}

function questionSelectFields() {
  return {
    id: true,
    text: true,
    options: true,
    difficulty: true,
    correctAnswer: true,
    topic: {
      select: {
        id: true,
        name: true,
        chapter: { select: { subject: { select: { id: true, name: true } } } },
      },
    },
  } as const;
}

type QuestionWithTopic = {
  id: string;
  text: string;
  options: unknown;
  difficulty: string;
  correctAnswer: string;
  topic: {
    id: string;
    name: string;
    chapter: { subject: { id: string; name: string } };
  };
};

function toAdaptiveQuestion(
  q: QuestionWithTopic,
  reason: AdaptivePracticeQuestion["reason"],
  empiricalDifficulty: "EASY" | "MEDIUM" | "HARD" | null
): AdaptivePracticeQuestion {
  return {
    id: q.id,
    text: q.text,
    options: q.options,
    difficulty: q.difficulty,
    topicId: q.topic.id,
    topicName: q.topic.name,
    subjectId: q.topic.chapter.subject.id,
    subjectName: q.topic.chapter.subject.name,
    reason,
    empiricalDifficulty,
  };
}
