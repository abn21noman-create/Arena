// ===================================================================
// Practice Quiz Taking পেজ (Client Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { QuizRunner } from "@/components/practice/quiz-runner";

export default async function ChapterQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ subjectId: string; chapterId: string }>;
  searchParams: Promise<{ onlyBoard?: string }>;
}) {
  const { subjectId, chapterId } = await params;
  const { onlyBoard } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <QuizRunner
      subjectId={subjectId}
      chapterId={chapterId}
      onlyBoardQuestions={onlyBoard === "1"}
    />
  );
}
