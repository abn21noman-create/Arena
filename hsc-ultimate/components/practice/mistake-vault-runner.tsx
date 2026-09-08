"use client";

// ===================================================================
// মিস্টেক ভল্ট রিভিশন Runner — quiz-runner.tsx এর নিজের গতিতে-উত্তর-দেওয়া
// প্যাটার্ন অনুসরণ করে (drill-runner এর মতো টাইমার নেই — এটা রিভিশন,
// speed-test না), কিন্তু প্রশ্ন সেশনস্টোরেজ থেকে আসে (drill এর প্যাটার্ন,
// কারণ প্রশ্ন সেট আগে থেকেই সার্ভার থেকে fetch করা হয়ে গেছে)।
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ChevronRight, BookX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { MathText } from "@/components/shared/math-text";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { KeyboardHint } from "@/components/shared/keyboard-hint";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface VaultQuestion {
  id: string;
  text: string;
  options: string[] | null;
  difficulty: string;
  topicName: string;
  subjectName: string;
  wrongCount: number;
}

export function MistakeVaultRunner() {
  const router = useRouter();
  const [questions, setQuestions] = useState<VaultQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mistake_vault_session");
    if (!raw) {
      setError("রিভিশন সেশন পাওয়া যায়নি, আবার শুরু করো");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { questions: VaultQuestion[] };
      setQuestions(parsed.questions);
    } catch {
      setError("রিভিশন সেশন লোড করা যায়নি");
    }
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnsweredCurrent = currentQuestion && selectedAnswers[currentQuestion.id];

  function selectAnswer(option: string) {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  }

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const answers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: selectedAnswers[q.id] ?? "",
    }));

    try {
      const res = await fetch("/api/mistake-vault/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "জমা দিতে সমস্যা হয়েছে");
        setSubmitting(false);
        return;
      }

      showNewBadgeToasts(data.newBadges);
      sessionStorage.removeItem("mistake_vault_session");
      router.push(`/practice/result/${data.attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setSubmitting(false);
    }
  }, [questions, selectedAnswers, router]);

  async function handleNext() {
    if (isLastQuestion) {
      await handleSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  useMcqKeyboardNav({
    options: currentQuestion?.options,
    onSelect: selectAnswer,
    onNext: handleNext,
    nextEnabled: Boolean(hasAnsweredCurrent) && !submitting,
    enabled: !error,
  });

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button render={<Link href="/mistake-vault" />} variant="outline">আবার চেষ্টা করো</Button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  if (submitting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RotateCcw className="h-8 w-8 animate-pulse text-rose-600 dark:text-rose-400" />
        <p className="text-sm text-muted-foreground">ফলাফল হিসাব হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/mistake-vault" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <BookX className="h-3 w-3" /> মিস্টেক ভল্ট রিভিশন
          </p>
          <p className="text-sm font-medium">
            প্রশ্ন {currentIndex + 1} / {questions.length}
          </p>
        </div>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 mb-2" />
      <div className="flex justify-end mb-4">
        <KeyboardHint />
      </div>

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-xs">
            {currentQuestion.subjectName} • {currentQuestion.topicName}
          </Badge>
          <div className="flex items-center gap-1">
            {currentQuestion.wrongCount > 1 && (
              <Badge variant="secondary" className="text-xs gap-1 bg-rose-500/10 text-rose-700 dark:text-rose-400">
                {currentQuestion.wrongCount} বার ভুল হয়েছে
              </Badge>
            )}
            <AcademicReportButton targetType="CORE_MCQ" targetId={currentQuestion.id} compact />
          </div>
        </div>

        <h2 className="text-base font-medium mb-5 leading-relaxed">
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
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-center gap-3",
                  isSelected ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center text-xs shrink-0",
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
      </Card>

      <Button
        className="w-full gap-2"
        size="lg"
        disabled={!hasAnsweredCurrent || submitting}
        onClick={handleNext}
      >
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
