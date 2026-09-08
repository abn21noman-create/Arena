// ===================================================================
// Practice Result পেজ — স্কোর, XP, এবং প্রতিটা প্রশ্নের ব্যাখ্যা সহ রিভিউ
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Sparkles, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { WrongAnswersToFlashcardsButton } from "@/components/practice/wrong-answers-to-flashcards-button";
import { ExplainMistakeButton } from "@/components/practice/explain-mistake-button";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

export default async function PracticeResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: { question: true },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id) notFound();

  const wrongCount = attempt.answers.filter((a) => !a.isCorrect).length;

  const percentage = Math.round((attempt.score / attempt.totalMarks) * 100);
  const xpEarned = attempt.score * 5;

  let feedback = "আরও অনুশীলন দরকার, চালিয়ে যাও! 💪";
  if (percentage >= 90) feedback = "অসাধারণ! তুমি এই চ্যাপ্টারে দুর্দান্ত করেছো! 🏆";
  else if (percentage >= 70) feedback = "খুব ভালো করেছো! আরেকটু চেষ্টা করলে পারফেক্ট হবে! 🌟";
  else if (percentage >= 50) feedback = "ভালো চেষ্টা! ভুল প্রশ্নগুলো আবার দেখে নাও। 📚";

  const retryLink =
    attempt.quizType === "adaptive"
      ? "/adaptive-practice"
      : attempt.quizType === "drill"
        ? "/drill"
        : attempt.quizType === "mistake_vault"
          ? "/mistake-vault"
          : `/practice/${attempt.subjectId}`;
  const retryLabel =
    attempt.quizType === "adaptive"
      ? "আবার স্মার্ট প্র্যাকটিস"
      : attempt.quizType === "drill"
        ? "আবার ড্রিল করো"
        : attempt.quizType === "mistake_vault"
          ? "মিস্টেক ভল্টে ফিরে যাও"
          : "আরেকটা চ্যাপ্টার";

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      {/* Score summary */}
      <Card className="p-6 text-center mb-6">
        <div className="text-4xl font-bold mb-1">
          {attempt.score}/{attempt.totalMarks}
        </div>
        <p className="text-muted-foreground text-sm mb-3">{percentage}% সঠিক</p>
        <Badge className="gap-1.5 bg-amber-500 hover:bg-amber-500 text-white">
          <Sparkles className="h-3.5 w-3.5" />
          +{xpEarned} XP অর্জিত
        </Badge>
        <p className="mt-4 text-sm font-medium">{feedback}</p>
      </Card>

      {/* Wrong-Answer → Flashcard কনভার্টার (কোনো ভুল উত্তর না থাকলে দেখানো হয় না) */}
      {wrongCount > 0 && (
        <WrongAnswersToFlashcardsButton attemptId={attempt.id} wrongCount={wrongCount} />
      )}

      {/* Answer review */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        উত্তরপত্র পর্যালোচনা
      </h2>
      <div className="space-y-3 mb-6">
        {attempt.answers.map((ans, idx) => (
          <Card key={ans.id} className="p-4">
            <div className="flex items-start gap-2 mb-2">
              {ans.isCorrect ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {idx + 1}. {ans.question.text}
                </p>
                {(ans.question.boardYear || ans.question.boardName) && (
                  <Badge variant="secondary" className="mt-1 text-xs gap-1">
                    📅 {ans.question.boardName} {ans.question.boardYear ?? ""}
                  </Badge>
                )}
              </div>
              <AcademicReportButton targetType="CORE_MCQ" targetId={ans.question.id} compact />
            </div>
            <div className="pl-6.5 space-y-1 text-sm">
              <p
                className={cn(
                  "flex gap-1.5",
                  ans.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}
              >
                তোমার উত্তর: <span className="font-medium">{ans.userAnswer}</span>
              </p>
              {!ans.isCorrect && (
                <p className="text-violet-600 dark:text-violet-400">
                  সঠিক উত্তর: <span className="font-medium">{ans.question.correctAnswer}</span>
                </p>
              )}
              {ans.question.explanation && (
                <p className="text-muted-foreground text-xs mt-1.5 bg-muted/50 rounded-md p-2">
                  💡 {ans.question.explanation}
                </p>
              )}
              {!ans.isCorrect && (
                <ExplainMistakeButton
                  endpoint={`/api/practice/answers/${ans.id}/explain`}
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button render={<Link href={retryLink} className="flex-1" />} variant="outline" className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            {retryLabel}
          </Button>
        <Button render={<Link href="/dashboard" className="flex-1" />} className="w-full gap-2">
            <Home className="h-4 w-4" />
            ড্যাশবোর্ড
          </Button>
      </div>
    </div>
  );
}
