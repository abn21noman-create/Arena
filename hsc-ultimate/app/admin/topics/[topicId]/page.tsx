// ===================================================================
// Admin: Topic Detail পেজ — MCQ প্রশ্ন (single/bulk) + CQ প্রশ্ন ম্যানেজমেন্ট
// ===================================================================
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuestionManager } from "@/components/admin/question-manager";
import { getEmpiricalDifficultyMap } from "@/lib/item-difficulty";

export default async function AdminTopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      chapter: { include: { subject: true } },
      questions: { orderBy: { createdAt: "desc" } },
      cqQuestions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!topic) notFound();

  // Simplified Item-Difficulty Calibration — admin কে প্রকৃত response-data
  // ভিত্তিক difficulty দেখানো হয় (ম্যানুয়াল ট্যাগের পাশাপাশি, transparency)
  const difficultyMap = await getEmpiricalDifficultyMap(topic.questions.map((q) => q.id));

  // Prisma এর Json টাইপকে string[] এ কাস্ট করা হচ্ছে (আমরা নিশ্চিত জানি এটা সবসময় array হবে)
  const questions = topic.questions.map((q) => {
    const empirical = difficultyMap.get(q.id);
    return {
      ...q,
      options: q.options as string[] | null,
      empiricalDifficulty: empirical?.bucket ?? null,
      empiricalWrongPct: empirical?.wrongPct ?? null,
      empiricalTotalResponses: empirical?.totalResponses ?? 0,
    };
  });

  return (
    <QuestionManager
      topic={topic}
      initialQuestions={questions}
      initialCqQuestions={topic.cqQuestions}
    />
  );
}

