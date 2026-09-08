"use client";

// ===================================================================
// Pretest Runner — একটা চ্যাপ্টারের প্রতিটা টপিক থেকে অল্প কিছু প্রশ্ন
// দিয়ে ডায়াগনস্টিক টেস্ট চালায়, তারপর প্রতি-টপিক accuracy% দেখিয়ে
// "জানা" (skip-worthy) টপিক চিহ্নিত করে
// -------------------------------------------------------------------
// components/practice/quiz-runner.tsx এর একই ফ্লো প্যাটার্ন অনুসরণ করা
// হয়েছে (load → answer → submit), কিন্তু XP/streak/badge কোনো side
// effect নেই — এটা বিশুদ্ধ ডায়াগনস্টিক।
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ChevronRight, ClipboardCheck, CheckCircle2, Circle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { MathText } from "@/components/shared/math-text";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { KeyboardHint } from "@/components/shared/keyboard-hint";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface PretestQuestion {
  id: string;
  text: string;
  options: string[] | null;
  difficulty: string;
  topicId: string;
  topicName: string;
}

interface TopicResult {
  topicId: string;
  topicName: string;
  correct: number;
  total: number;
  accuracyPct: number;
  recommendSkip: boolean;
}

export function PretestRunner({
  subjectId,
  chapterId,
}: {
  subjectId: string;
  chapterId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [questions, setQuestions] = useState<PretestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // ফলাফল স্টেট
  const [results, setResults] = useState<TopicResult[]>([]);
  const [overallCorrect, setOverallCorrect] = useState(0);
  const [overallTotal, setOverallTotal] = useState(0);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());

  const loadPretest = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pretest/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "প্রি-টেস্ট লোড করা যায়নি");
        return;
      }

      setChapterName(data.chapterName);
      setQuestions(data.questions);
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    void loadPretest();
  }, [loadPretest]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isAnswered = currentQuestion ? !!selectedAnswers[currentQuestion.id] : false;

  const handleSelect = useCallback(
    (option: string) => {
      if (!currentQuestion) return;
      setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    },
    [currentQuestion]
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        userAnswer: selectedAnswers[q.id] ?? "",
      }));

      const res = await fetch("/api/pretest/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "ফলাফল হিসাব করা যায়নি");
        return;
      }

      setResults(data.topics);
      setOverallCorrect(data.overallCorrect);
      setOverallTotal(data.overallTotal);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }, [questions, selectedAnswers]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      void handleSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLastQuestion, handleSubmit]);

  useMcqKeyboardNav({
    options: currentQuestion?.options,
    onSelect: handleSelect,
    onNext: handleNext,
    nextEnabled: isAnswered,
    enabled: !loading && !submitting && results.length === 0,
  });

  async function handleMarkMastered(topicId: string) {
    setMarkingIds((prev) => new Set(prev).add(topicId));
    try {
      const res = await fetch(`/api/topics/${topicId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "MASTERED" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("আয়ত্ত হিসেবে মার্ক করা যায়নি");
        return;
      }
      setMarkedIds((prev) => new Set(prev).add(topicId));
      toast.success("🎉 টপিক আয়ত্ত হিসেবে মার্ক হয়েছে! +20 XP পেয়েছো");
      showNewBadgeToasts(data.newBadges);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button render={<Link href={`/practice/${subjectId}`} />} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            চ্যাপ্টার লিস্টে ফিরে যাও
          </Button>
      </div>
    );
  }

  // ---------- ফলাফল স্ক্রিন ----------
  if (results.length > 0) {
    const overallPct = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 0;
    const skipWorthyTopics = results.filter((t) => t.recommendSkip);

    return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <Card className="p-6 text-center mb-6">
          <ClipboardCheck className="h-8 w-8 text-primary mx-auto mb-2" />
          <h1 className="text-lg font-bold mb-1">প্রি-টেস্ট ফলাফল</h1>
          <p className="text-sm text-muted-foreground mb-3">{chapterName}</p>
          <div className="text-3xl font-bold mb-1">
            {overallCorrect}/{overallTotal}
          </div>
          <p className="text-muted-foreground text-sm">{overallPct}% সঠিক</p>
        </Card>

        {skipWorthyTopics.length > 0 && (
          <Alert variant="success" className="mb-4">
            <Trophy className="h-4 w-4" />
            <AlertDescription className="text-violet-700 dark:text-violet-400">
              দারুণ! এই টপিকগুলো তুমি ইতিমধ্যে ভালো জানো — চাইলে স্কিপ করে
              সরাসরি &ldquo;আয়ত্ত হয়েছে&rdquo; মার্ক করে দুর্বল টপিকে বেশি সময় দিতে পারো
            </AlertDescription>
          </Alert>
        )}

        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          টপিক-ভিত্তিক ফলাফল
        </h2>
        <div className="space-y-2 mb-6">
          {results.map((t) => {
            const isMarking = markingIds.has(t.topicId);
            const isMarked = markedIds.has(t.topicId);
            return (
              <Card key={t.topicId} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {t.recommendSkip ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{t.topicName}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shrink-0",
                      t.recommendSkip && "border-violet-600 text-violet-600 dark:text-violet-400"
                    )}
                  >
                    {t.correct}/{t.total} ({t.accuracyPct}%)
                  </Badge>
                </div>
                {t.recommendSkip && (
                  <Button
                    size="sm"
                    variant={isMarked ? "secondary" : "outline"}
                    className="w-full gap-1.5 text-xs"
                    disabled={isMarking || isMarked}
                    onClick={() => handleMarkMastered(t.topicId)}
                  >
                    {isMarking ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isMarked ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Trophy className="h-3.5 w-3.5" />
                    )}
                    {isMarked ? "আয়ত্ত হিসেবে মার্ক করা হয়েছে" : "স্কিপ করো (আয়ত্ত হিসেবে মার্ক করো)"}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button render={<Link href={`/practice/${subjectId}/${chapterId}`} className="flex-1" />} variant="outline" className="w-full gap-2">
              সাধারণ প্র্যাকটিস শুরু করো
            </Button>
          <Button render={<Link href={`/practice/${subjectId}`} className="flex-1" />} className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              চ্যাপ্টার লিস্টে ফিরো
            </Button>
        </div>
      </div>
    );
  }

  // ---------- প্রশ্ন স্ক্রিন ----------
  if (!currentQuestion) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 py-12 text-center">
        <p className="text-muted-foreground">কোনো প্রশ্ন পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/practice/${subjectId}`} className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{chapterName} • প্রি-টেস্ট</p>
          <p className="text-sm font-medium">
            প্রশ্ন {currentIndex + 1}/{questions.length}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs shrink-0">
            {currentQuestion.topicName}
          </Badge>
          <AcademicReportButton targetType="CORE_MCQ" targetId={currentQuestion.id} compact />
        </div>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 mb-6" />

      <Card className="p-5 mb-4">
        <p className="text-sm font-medium mb-4">
          <MathText text={currentQuestion.text} />
        </p>
        <div className="space-y-2">
          {currentQuestion.options?.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-center gap-2",
                  isSelected
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted"
                )}
              >
                <span className="h-5 w-5 rounded-full border flex items-center justify-center text-xs shrink-0">
                  {String.fromCharCode(97 + idx)}
                </span>
                <MathText text={option} />
              </button>
            );
          })}
        </div>
      </Card>

      <KeyboardHint />

      <Button onClick={handleNext} disabled={!isAnswered || submitting} className="w-full gap-2">
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLastQuestion ? (
          "ফলাফল দেখো"
        ) : (
          <>
            পরের প্রশ্ন
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
