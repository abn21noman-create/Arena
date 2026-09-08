// ===================================================================
// Quiz Battle তৈরি করার কনফিগারেশন পেজ
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizBattleCreateForm } from "@/components/quiz-battle/quiz-battle-create-form";

export default async function QuizBattleCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ customSetId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { customSetId } = await searchParams;

  const [subjects, customSet] = await Promise.all([
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
    customSetId
      ? prisma.customQuestionSet.findFirst({
          where: { id: customSetId, userId: session.user.id, status: "READY", questionType: "MCQ" },
          include: { _count: { select: { questions: true } } },
        })
      : null,
  ]);

  return (
    <QuizBattleCreateForm
      subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      preselectedCustomSet={
        customSet ? { id: customSet.id, title: customSet.title, questionCount: customSet._count.questions } : null
      }
    />
  );
}
