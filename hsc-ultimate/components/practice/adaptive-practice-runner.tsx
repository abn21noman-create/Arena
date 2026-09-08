"use client";

// ===================================================================
// Adaptive Practice Runner — quiz-runner.tsx এর UI প্যাটার্ন অনুসরণ করে,
// কিন্তু প্রশ্ন সেট sessionStorage থেকে আসে (adaptive-practice-intro.tsx
// এ /api/adaptive-practice/start কল করে সেট করা হয়) এবং প্রতিটা প্রশ্নে
// কোন টপিক থেকে এসেছে তা badge আকারে দেখানো হয় (transparency)।
// ===================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { MathText } from "@/components/shared/math-text";
import { ConfidenceSelector } from "@/components/practice/confidence-selector";
import type { ConfidenceLevel } from "@/lib/confidence";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { KeyboardHint } from "@/components/shared/keyboard-hint";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface AdaptiveQuestion {
  id: string;
  text: string;
  options: string[] | null;
  difficulty: string;
  topicName: string;
  subjectName: string;
  reason: "wrong_before" | "weak_topic_unseen" | "unpracticed_important" | "random";
  empiricalDifficulty: "EASY" | "MEDIUM" | "HARD" | null;
}

const REASON_LABELS: Record<AdaptiveQuestion["reason"], string> = {
  wrong_before: "আগে ভুল হয়েছিল",
  weak_topic_unseen: "দুর্বল টপিক",
  unpracticed_important: "গুরুত্বপূর্ণ টপিক",
  random: "সাধারণ প্র্যাকটিস",
};

// Simplified Item-Difficulty Calibration — প্রকৃত response-data থেকে বের
// করা empirical difficulty (admin এর ম্যানুয়াল ট্যাগ থেকে আলাদা)
const EMPIRICAL_DIFFICULTY_LABELS: Record<"EASY" | "MEDIUM" | "HARD", string> = {
  EASY: "সহজ (empirical)",
  MEDIUM: "মাঝারি (empirical)",
  HARD: "কঠিন (empirical)",
};
const EMPIRICAL_DIFFICULTY_COLORS: Record<"EASY" | "MEDIUM" | "HARD", string> = {
  EASY: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  HARD: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function AdaptivePracticeRunner() {
  const router = useRouter();
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [confidenceMap, setConfidenceMap] = useState<Record<string, ConfidenceLevel>>({});
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    const raw = sessionStorage.getItem("adaptive_practice_questions");
    if (raw) {
      try {
        setQuestions(JSON.parse(raw));
      } catch {
        // ignore parse error, will show empty state below
      }
    }
    setLoading(false);
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnsweredCurrent = currentQuestion && selectedAnswers[currentQuestion.id];

  function selectAnswer(option: string) {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  }

  function selectConfidence(level: ConfidenceLevel) {
    if (!currentQuestion) return;
    setConfidenceMap((prev) => ({ ...prev, [currentQuestion.id]: level }));
  }

  async function handleNext() {
    if (isLastQuestion) {
      await handleSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    const timeTakenSec = Math.round((Date.now() - startTime) / 1000);
    const answers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: selectedAnswers[q.id] ?? "",
      confidence: confidenceMap[q.id],
    }));

    try {
      const res = await fetch("/api/adaptive-practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeTakenSec, answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "জমা দিতে সমস্যা হয়েছে");
        setSubmitting(false);
        return;
      }
      sessionStorage.removeItem("adaptive_practice_questions");
      showNewBadgeToasts(data.newBadges);
      router.push(`/practice/result/${data.attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setSubmitting(false);
    }
  }

  // কীবোর্ড শর্টকাট (WCAG 2.2 accessibility)
  useMcqKeyboardNav({
    options: currentQuestion?.options,
    onSelect: selectAnswer,
    onNext: handleNext,
    nextEnabled: Boolean(hasAnsweredCurrent) && !submitting,
    enabled: !loading,
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-muted-foreground">
          কোনো প্রশ্ন সেট পাওয়া যায়নি — অনুগ্রহ করে আবার শুরু করো।
        </p>
        <Button render={<Link href="/adaptive-practice" />} variant="outline">ফিরে যাও</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/adaptive-practice" className="rounded-full p-2 transition-colors hover:bg-muted" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Smart Practice
          </p>
          <p className="text-sm font-medium">
            প্রশ্ন {currentIndex + 1} / {questions.length}
          </p>
        </div>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} className="mb-2 h-1.5" />
      <div className="mb-4 flex justify-end">
        <KeyboardHint />
      </div>

      <Card className="mb-4 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs">
            {currentQuestion.subjectName} • {currentQuestion.topicName}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {REASON_LABELS[currentQuestion.reason]}
          </Badge>
          {currentQuestion.empiricalDifficulty && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Badge
                    variant="outline"
                    className={cn("text-xs", EMPIRICAL_DIFFICULTY_COLORS[currentQuestion.empiricalDifficulty])}
                  >
                    {EMPIRICAL_DIFFICULTY_LABELS[currentQuestion.empiricalDifficulty]}
                  </Badge>
                }
              />
              <TooltipContent>আগের সব ইউজারের উত্তর থেকে হিসাব করা প্রকৃত কঠিনতা</TooltipContent>
            </Tooltip>
          )}
          <AcademicReportButton targetType="CORE_MCQ" targetId={currentQuestion.id} compact />
        </div>

        <h2 className="mb-5 text-base font-medium leading-relaxed">
          <MathText text={currentQuestion.text} />
        </h2>

        <div className="space-y-2">
          {(currentQuestion.options ?? []).map((option, i) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(option)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  isSelected ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
                    isSelected && "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {String.fromCharCode(97 + i)}
                </span>
                <MathText text={option} />
              </button>
            );
          })}
        </div>

        {hasAnsweredCurrent && (
          <ConfidenceSelector
            value={confidenceMap[currentQuestion.id]}
            onChange={selectConfidence}
          />
        )}
      </Card>

      <Button className="w-full gap-2" size="lg" disabled={!hasAnsweredCurrent || submitting} onClick={handleNext}>
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLastQuestion ? (
          "জমা দাও"
        ) : (
          <>
            পরবর্তী প্রশ্ন
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
