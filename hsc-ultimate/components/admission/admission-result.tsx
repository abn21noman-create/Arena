"use client";

// ===================================================================
// Admission Mock Test Result — negative marking সহ চূড়ান্ত স্কোর,
// প্রতিটা প্রশ্নের সঠিক/ভুল/স্কিপ স্ট্যাটাস + ব্যাখ্যা
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  RotateCcw,
  Home,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";
import { ExplainMistakeButton } from "@/components/practice/explain-mistake-button";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

const SUBJECT_LABELS: Record<string, string> = {
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  MATH: "গণিত",
  ENGLISH: "ইংরেজি",
  GENERAL_KNOWLEDGE: "সাধারণ জ্ঞান",
};

interface AttemptResult {
  id: string;
  examType: string;
  examLabel: string;
  timeTakenSec: number | null;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  rawScore: number;
  maxScore: number;
  percentage: number;
  isPass: boolean | null;
}

interface QuestionResult {
  id: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  userAnswer: string | null;
  isCorrect: boolean;
  isSkipped: boolean;
}

export function AdmissionResult({ attemptId }: { attemptId: string }) {
  const [attempt, setAttempt] = useState<AttemptResult | null>(null);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admission/${attemptId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "ফলাফল লোড করা যায়নি");
          return;
        }
        setAttempt(data.attempt);
        setQuestions(data.questions);
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{error ?? "ফলাফল পাওয়া যায়নি"}</p>
        <Button render={<Link href="/admission" />} variant="outline">Admission Prep এ ফিরে যাও</Button>
      </div>
    );
  }

  let feedback = "আরও অনুশীলন দরকার, চালিয়ে যাও! 💪";
  if (attempt.percentage >= 80) feedback = "অসাধারণ! এই ফর্ম ধরে রাখো! 🏆";
  else if (attempt.percentage >= 60) feedback = "ভালো করেছো! আরও শাণিত করো। 🌟";
  else if (attempt.percentage >= 40) feedback = "মোটামুটি, দুর্বল জায়গাগুলো চিহ্নিত করে আবার অনুশীলন করো। 📚";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Card className="mb-6 p-6 text-center">
        <TrendingUp className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h1 className="mb-1 text-xl font-bold">{attempt.examLabel}</h1>
        <p className="mb-4 text-sm text-muted-foreground">{feedback}</p>

        <div className="mb-4 flex items-center justify-center gap-1">
          <span className="text-4xl font-bold">{attempt.rawScore}</span>
          <span className="text-lg text-muted-foreground">/ {attempt.maxScore}</span>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <Badge className="gap-1 bg-violet-500 text-white hover:bg-violet-500">
            <CheckCircle2 className="h-3 w-3" />
            সঠিক {attempt.correctCount}
          </Badge>
          <Badge className="gap-1 bg-destructive text-destructive-foreground hover:bg-destructive">
            <XCircle className="h-3 w-3" />
            ভুল {attempt.wrongCount}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <MinusCircle className="h-3 w-3" />
            বাদ {attempt.skippedCount}
          </Badge>
          {attempt.isPass !== null && (
            <Badge
              className={cn(
                "text-white",
                attempt.isPass ? "bg-emerald-600 hover:bg-emerald-600" : "bg-destructive hover:bg-destructive"
              )}
            >
              {attempt.isPass ? "পাস" : "ফেল"}
            </Badge>
          )}
        </div>

        <div className="flex gap-3">
          <Button render={<Link href="/admission" className="flex-1" />} variant="outline" className="w-full gap-1.5">
              <RotateCcw className="h-4 w-4" />
              আবার চেষ্টা করো
            </Button>
          <Button render={<Link href="/dashboard" className="flex-1" />} className="w-full gap-1.5">
              <Home className="h-4 w-4" />
              ড্যাশবোর্ড
            </Button>
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        প্রশ্নভিত্তিক রিভিউ ({questions.length}টা)
      </h2>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <Card key={q.id} className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {i + 1}. {SUBJECT_LABELS[q.subject] ?? q.subject}
              </Badge>
              {q.isSkipped ? (
                <Badge variant="outline" className="gap-1 text-xs">
                  <MinusCircle className="h-3 w-3" />
                  বাদ দিয়েছো
                </Badge>
              ) : q.isCorrect ? (
                <Badge className="gap-1 bg-violet-500 text-white text-xs hover:bg-violet-500">
                  <CheckCircle2 className="h-3 w-3" />
                  সঠিক
                </Badge>
              ) : (
                <Badge className="gap-1 bg-destructive text-destructive-foreground text-xs hover:bg-destructive">
                  <XCircle className="h-3 w-3" />
                  ভুল
                </Badge>
              )}
              <AcademicReportButton targetType="ADMISSION_MCQ" targetId={q.id} compact />
            </div>
            <p className="mb-2 text-sm font-medium">
              <MathText text={q.text} />
            </p>
            <div className="space-y-1">
              {q.options.map((option, oi) => (
                <div
                  key={oi}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs",
                    option === q.correctAnswer
                      ? "bg-violet-500/15 text-violet-700 dark:text-violet-400 font-medium"
                      : option === q.userAnswer
                      ? "bg-destructive/15 text-destructive font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <MathText text={option} />
                  {option === q.correctAnswer && " ✓"}
                  {option === q.userAnswer && option !== q.correctAnswer && " ✗"}
                </div>
              ))}
            </div>
            {q.explanation && (
              <p className="mt-2 text-xs text-muted-foreground border-t pt-2">
                💡 <MathText text={q.explanation} />
              </p>
            )}
            {!q.isSkipped && !q.isCorrect && q.userAnswer && (
              <ExplainMistakeButton
                endpoint={`/api/admission/${attemptId}/question/${q.id}/explain`}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
