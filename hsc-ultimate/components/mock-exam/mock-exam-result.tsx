"use client";

// ===================================================================
// Mock Exam Result — সামগ্রিক স্কোর + MCQ রিভিউ + CQ রিভিউ (AI ফিডব্যাক সহ)
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Home,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";
import { ExplainMistakeButton } from "@/components/practice/explain-mistake-button";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface McqQuestion {
  id: string;
  text: string;
  options: string[] | null;
  correctAnswer?: string;
  explanation?: string | null;
}

interface CqReviewItem {
  question: {
    id: string;
    stimulus: string;
    questionA: string;
    questionB: string;
    questionC: string;
    questionD: string;
    modelAnswerA?: string | null;
    modelAnswerB?: string | null;
    modelAnswerC?: string | null;
    modelAnswerD?: string | null;
  };
  attempt: {
    answerA: string;
    answerB: string;
    answerC: string;
    answerD: string;
    scoreA: number;
    scoreB: number;
    scoreC: number;
    scoreD: number;
    totalScore: number;
    feedback: string | null;
  } | null;
}

interface PercentileData {
  rank: number;
  totalParticipants: number;
  percentile: number;
  myBestPercentage: number;
}

interface ResultData {
  attempt: {
    id: string;
    subjectName: string;
    mode: string;
    mcqScore: number;
    mcqTotal: number;
    mcqUserAnswers: Record<string, string>;
    cqScore: number;
    cqTotal: number;
    totalScore: number;
    totalMarks: number;
    percentage: number;
    timeTakenSec: number;
  };
  mcqQuestions: McqQuestion[];
  cqReview: CqReviewItem[];
  percentile: PercentileData | null;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} মিনিট ${s} সেকেন্ড`;
}

export function MockExamResult({ attemptId }: { attemptId: string }) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/mock-exam/${attemptId}/result`);
        const result = await res.json();
        if (!res.ok) {
          setError(result.error ?? "ফলাফল লোড করা যায়নি");
          return;
        }
        setData(result);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    }
    void loadResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">ফলাফল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button render={<Link href="/mock-exam" />} variant="outline">ফিরে যাও</Button>
      </div>
    );
  }

  const { attempt, mcqQuestions, cqReview, percentile } = data;

  const cqParts = [
    { key: "A" as const, label: "ক (জ্ঞানমূলক)", max: 1 },
    { key: "B" as const, label: "খ (অনুধাবনমূলক)", max: 2 },
    { key: "C" as const, label: "গ (প্রয়োগ)", max: 3 },
    { key: "D" as const, label: "ঘ (উচ্চতর দক্ষতা)", max: 4 },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
      {/* Header Summary */}
      <Card className="p-6 mb-6 text-center bg-linear-to-br from-violet-500/10 to-fuchsia-500/10">
        <Trophy className="h-10 w-10 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
        <h1 className="text-xl font-bold mb-1">{attempt.subjectName} — Mock Exam ফলাফল</h1>
        <p className="text-4xl font-bold text-primary my-3">
          {attempt.totalScore}
          <span className="text-lg text-muted-foreground">
            /{attempt.totalMarks}
          </span>
        </p>
        <Progress value={attempt.percentage} className="h-2 max-w-xs mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{attempt.percentage}% নম্বর পেয়েছো</p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div>
            <p className="text-lg font-semibold">
              {attempt.mcqScore}/{attempt.mcqTotal}
            </p>
            <p className="text-xs text-muted-foreground">MCQ</p>
          </div>
          <div>
            <p className="text-lg font-semibold">
              {attempt.cqScore}/{attempt.cqTotal}
            </p>
            <p className="text-xs text-muted-foreground">CQ</p>
          </div>
          <div>
            <p className="text-lg font-semibold flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(attempt.timeTakenSec)}
            </p>
            <p className="text-xs text-muted-foreground">সময় ব্যয়</p>
          </div>
        </div>
      </Card>

      {/* Percentile / Rank Card — একই বিষয়+মোডের সব পরীক্ষার্থীর তুলনায় অবস্থান */}
      {percentile && (
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">তোমার Rank ও Percentile</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">#{percentile.rank}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                {percentile.totalParticipants} জনের মধ্যে
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {percentile.percentile}
                <span className="text-sm">তম</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">পার্সেন্টাইল</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            তুমি এই পরীক্ষায় অংশগ্রহণকারী {percentile.percentile}% শিক্ষার্থীর চেয়ে ভালো
            করেছো (সবার সেরা attempt এর ভিত্তিতে তুলনা)
          </p>
        </Card>
      )}

      {/* MCQ Review */}
      {mcqQuestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            MCQ রিভিউ
          </h2>
          <div className="space-y-3">
            {mcqQuestions.map((q, i) => {
              const userAnswer = attempt.mcqUserAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <Card key={q.id} className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <p className="min-w-0 flex-1 text-sm font-medium">
                      {i + 1}. <MathText text={q.text} />
                    </p>
                    <AcademicReportButton targetType="CORE_MCQ" targetId={q.id} compact />
                  </div>
                  <div className="pl-6 space-y-1 text-sm">
                    <p className={cn(!isCorrect && "text-destructive")}>
                      তোমার উত্তর:{" "}
                      <span className="font-medium">
                        {userAnswer ? <MathText text={userAnswer} /> : "উত্তর দেওয়া হয়নি"}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                        সঠিক উত্তর:{" "}
                        <span className="font-semibold">
                          {q.correctAnswer && <MathText text={q.correctAnswer} />}
                        </span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-muted-foreground text-xs mt-1.5">
                        💡 {q.explanation}
                      </p>
                    )}
                    {!isCorrect && userAnswer && (
                      <ExplainMistakeButton
                        endpoint={`/api/mock-exam/${attemptId}/mcq/${q.id}/explain`}
                      />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* CQ Review */}
      {cqReview.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            CQ রিভিউ (AI মূল্যায়ন)
          </h2>
          <div className="space-y-4">
            {cqReview.map((item, i) => {
              if (!item.question) return null;
              const q = item.question;
              const a = item.attempt;
              return (
                <Card key={q.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">CQ {i + 1}</p>
                    <div className="flex items-center gap-1">
                      <Badge>{a?.totalScore ?? 0}/10</Badge>
                      <AcademicReportButton targetType="CQ" targetId={q.id} compact />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mb-3 whitespace-pre-wrap">
                    <MathText text={q.stimulus} />
                  </p>

                  {a?.feedback && (
                    <Alert className="mb-3 border-violet-500/20 bg-violet-500/5">
                      <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      <AlertTitle className="text-xs text-violet-600 dark:text-violet-400">
                        AI ফিডব্যাক
                      </AlertTitle>
                      <AlertDescription className="text-sm text-foreground">
                        {a.feedback}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    {cqParts.map((part) => {
                      const questionText = q[`question${part.key}` as const];
                      const modelAnswer = q[`modelAnswer${part.key}` as const];
                      const userAnswer = a
                        ? a[`answer${part.key}` as const]
                        : "";
                      const score = a ? a[`score${part.key}` as const] : 0;
                      return (
                        <div
                          key={part.key}
                          className="border-t pt-3 first:border-t-0 first:pt-0"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium">
                              {part.label}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {score}/{part.max}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            <MathText text={questionText} />
                          </p>
                          <p className="text-sm mb-1">
                            <span className="text-muted-foreground">তোমার উত্তর: </span>
                            {userAnswer ? (
                              <MathText text={userAnswer} />
                            ) : (
                              <span className="italic text-muted-foreground">
                                উত্তর দেওয়া হয়নি
                              </span>
                            )}
                          </p>
                          {modelAnswer && (
                            <p className="text-sm text-violet-700 dark:text-violet-500">
                              <span className="text-muted-foreground">মডেল উত্তর: </span>
                              <MathText text={modelAnswer} />
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button render={<Link href="/mock-exam" className="flex-1" />} variant="outline" className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            আরেকটা পরীক্ষা দাও
          </Button>
        <Button render={<Link href="/dashboard" className="flex-1" />} className="w-full gap-2">
            <Home className="h-4 w-4" />
            ড্যাশবোর্ডে ফিরে যাও
          </Button>
      </div>
    </div>
  );
}
