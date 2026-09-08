// ===================================================================
// CQ Result পেজ — নম্বর ব্রেকডাউন, AI ফিডব্যাক, model answer তুলনা
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, RotateCcw } from "lucide-react";
import { MathText } from "@/components/shared/math-text";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

export default async function CQResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const attempt = await prisma.cQAttempt.findUnique({
    where: { id: attemptId },
    include: { cqQuestion: true },
  });

  if (!attempt || attempt.userId !== session.user.id) notFound();

  const { cqQuestion } = attempt;
  const percentage = Math.round((attempt.totalScore / 10) * 100);

  const parts = [
    {
      label: "ক (জ্ঞানমূলক)",
      question: cqQuestion.questionA,
      answer: attempt.answerA,
      modelAnswer: cqQuestion.modelAnswerA,
      score: attempt.scoreA,
      max: 1,
    },
    {
      label: "খ (অনুধাবনমূলক)",
      question: cqQuestion.questionB,
      answer: attempt.answerB,
      modelAnswer: cqQuestion.modelAnswerB,
      score: attempt.scoreB,
      max: 2,
    },
    {
      label: "গ (প্রয়োগ)",
      question: cqQuestion.questionC,
      answer: attempt.answerC,
      modelAnswer: cqQuestion.modelAnswerC,
      score: attempt.scoreC,
      max: 3,
    },
    {
      label: "ঘ (উচ্চতর দক্ষতা)",
      question: cqQuestion.questionD,
      answer: attempt.answerD,
      modelAnswer: cqQuestion.modelAnswerD,
      score: attempt.scoreD,
      max: 4,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      {/* Score summary */}
      <Card className="p-6 text-center mb-6">
        <div className="text-4xl font-bold mb-1">{attempt.totalScore}/10</div>
        <p className="text-muted-foreground text-sm mb-3">{percentage}% নম্বর</p>
        {(cqQuestion.boardYear || cqQuestion.boardName) && (
          <Badge variant="secondary" className="text-xs gap-1 mb-2">
            📅 {cqQuestion.boardName} {cqQuestion.boardYear ?? ""}
          </Badge>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge className="gap-1.5 bg-amber-500 hover:bg-amber-500 text-white">
            <Sparkles className="h-3.5 w-3.5" />
            +{attempt.totalScore * 3} XP অর্জিত
          </Badge>
          <AcademicReportButton targetType="CQ" targetId={cqQuestion.id} compact />
        </div>
        {attempt.feedback && (
          /* Violet Glass Theme — আগে <Card> ছিল, কিন্তু বাইরের score
             Card এর ভেতরেই বসে। <Card> এখন `.glass-surface`
             (backdrop-filter) ব্যবহার করে, তাই nested হলে দুই স্তর blur
             চেপে বসে ঘোলাটে দেখাত। এটা নিজেই `bg-muted/50` দিয়ে আলাদা
             হয়, তাই সাধারণ div যথেষ্ট। */
          <div className="mt-4 p-3 rounded-xl bg-muted/50 text-left">
            <p className="text-xs text-muted-foreground mb-1 font-medium">🤖 AI ফিডব্যাক:</p>
            <p className="text-sm">{attempt.feedback}</p>
          </div>
        )}
      </Card>

      {/* Answer breakdown */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">উত্তর পর্যালোচনা</h2>
      <div className="space-y-3 mb-6">
        {parts.map((part, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{part.label}</p>
              <Badge variant="outline" className="text-xs">
                {part.score}/{part.max}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              <MathText text={part.question} />
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-muted/50 rounded-md p-2">
                <p className="text-xs text-muted-foreground mb-0.5">তোমার উত্তর:</p>
                <p className="whitespace-pre-wrap">
                  {part.answer ? <MathText text={part.answer} /> : "(লেখা হয়নি)"}
                </p>
              </div>
              {part.modelAnswer && (
                <div className="bg-violet-50 dark:bg-violet-950/20 rounded-md p-2">
                  <p className="text-xs text-violet-600 dark:text-violet-400 mb-0.5">
                    মডেল উত্তর:
                  </p>
                  <p className="text-violet-700 dark:text-violet-300 whitespace-pre-wrap">
                    <MathText text={part.modelAnswer} />
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button render={<Link href="/cq-practice" className="flex-1" />} variant="outline" className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            আরেকটা CQ
          </Button>
        <Button render={<Link href="/dashboard" className="flex-1" />} className="w-full gap-2">
            <Home className="h-4 w-4" />
            ড্যাশবোর্ড
          </Button>
      </div>
    </div>
  );
}
