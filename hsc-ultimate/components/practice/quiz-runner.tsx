"use client";

// ===================================================================
// Quiz Runner — MCQ প্র্যাকটিস কুইজ চালানোর মূল Client Component
// -------------------------------------------------------------------
// ফ্লো: প্রশ্ন লোড → এক এক করে উত্তর দেওয়া → শেষে সাবমিট → রেজাল্ট পেজে রিডাইরেক্ট
// ===================================================================
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  ChevronRight,
  Clock,
  Calculator,
  Bookmark,
  FileSpreadsheet,
  Keyboard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { MathText } from "@/components/shared/math-text";
import { ConfidenceSelector } from "@/components/practice/confidence-selector";
import type { ConfidenceLevel } from "@/lib/confidence";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { AcademicReportButton } from "@/components/shared/academic-report-button";
import { OMRSheetDialog } from "@/components/practice/omr-bubble-sheet";
import { openScientificCalculator } from "@/components/shared/scientific-calculator";
import { openKeyboardShortcutsGuide } from "@/components/shared/keyboard-shortcuts-dialog";
import { sfx } from "@/lib/sound-effects";
import { VoiceReadoutButton } from "@/components/shared/voice-readout-button";

interface Question {
  id: string;
  text: string;
  options: string[] | null;
  difficulty: string;
  boardYear: number | null;
  boardName: string | null;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "সহজ",
  MEDIUM: "মাঝারি",
  HARD: "কঠিন",
};

export function QuizRunner({
  subjectId,
  chapterId,
  onlyBoardQuestions = false,
}: {
  subjectId: string;
  chapterId: string;
  onlyBoardQuestions?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [confidenceMap, setConfidenceMap] = useState<Record<string, ConfidenceLevel>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [omrOpen, setOmrOpen] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, onlyBoardQuestions }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "প্রশ্ন লোড করা যায়নি");
        return;
      }

      setChapterName(data.chapterName);
      setQuestions(data.questions);
      setStartTime(Date.now());
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [chapterId, onlyBoardQuestions]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnsweredCurrent = currentQuestion && selectedAnswers[currentQuestion.id];

  const omrAnswersMap = useMemo(() => {
    const map: Record<number, number | null | undefined> = {};
    questions.forEach((q, qIdx) => {
      const ans = selectedAnswers[q.id];
      if (ans && q.options) {
        const optIdx = q.options.indexOf(ans);
        map[qIdx] = optIdx >= 0 ? optIdx : null;
      } else {
        map[qIdx] = null;
      }
    });
    return map;
  }, [questions, selectedAnswers]);

  function selectAnswer(option: string) {
    if (!currentQuestion) return;
    sfx.play("click");
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  }

  function handleSelectOptionByIndex(qIdx: number, optIdx: number) {
    const q = questions[qIdx];
    if (q && q.options && q.options[optIdx]) {
      const chosen = q.options[optIdx];
      setSelectedAnswers((prev) => ({ ...prev, [q.id]: chosen }));
      sfx.play("click");
    }
  }

  function toggleFlagCurrent() {
    sfx.play("click");
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
        toast.info("ফ্ল্যাগ সরানো হয়েছে");
      } else {
        next.add(currentIndex);
        toast.success("পরবর্তীতে দেখার জন্য ফ্ল্যাগ করা হয়েছে");
      }
      return next;
    });
  }

  function selectConfidence(level: ConfidenceLevel) {
    if (!currentQuestion) return;
    sfx.play("click");
    setConfidenceMap((prev) => ({ ...prev, [currentQuestion.id]: level }));
  }

  async function handleNext() {
    if (isLastQuestion) {
      await handleSubmit();
    } else {
      sfx.play("click");
      setCurrentIndex((i) => i + 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    sfx.play("levelUp");
    const timeTakenSec = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    const answers = questions.map((q) => ({
      questionId: q.id,
      userAnswer: selectedAnswers[q.id] ?? "",
      confidence: confidenceMap[q.id],
    }));

    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, chapterId, timeTakenSec, answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "জমা দিতে সমস্যা হয়েছে");
        setSubmitting(false);
        return;
      }

      showNewBadgeToasts(data.newBadges);
      router.push(`/practice/result/${data.attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setSubmitting(false);
    }
  }

  // কীবোর্ড শর্টকাট (1, 2, 3, 4, Enter, Space)
  useMcqKeyboardNav({
    options: currentQuestion?.options,
    onSelect: selectAnswer,
    onNext: handleNext,
    nextEnabled: Boolean(hasAnsweredCurrent) && !submitting,
    enabled: !loading && !error,
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">প্রশ্ন লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <p className="text-destructive font-medium mb-4">{error ?? "কোনো প্রশ্ন পাওয়া যায়নি"}</p>
        <Button variant="outline" asChild>
          <Link href={`/practice/${subjectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            অধ্যায়ে ফিরে যাও
          </Link>
        </Button>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isFlagged = flaggedQuestions.has(currentIndex);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/practice/${subjectId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            বেরিয়ে যাও
          </Link>
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setOmrOpen(true)}
            title="ভার্চুয়াল OMR শিট খুলুন"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xs:inline">OMR শিট</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={openScientificCalculator}
            title="সায়েন্টিফিক ক্যালকুলেটর ও ধ্রুবক"
          >
            <Calculator className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xs:inline">ক্যালকুলেটর</span>
          </Button>

          <Button
            variant={isFlagged ? "default" : "outline"}
            size="sm"
            className={cn("h-8 gap-1 text-xs", isFlagged && "bg-amber-500 hover:bg-amber-600 text-white")}
            onClick={toggleFlagCurrent}
            title="রিভিউর জন্য ফ্ল্যাগ করুন"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">{isFlagged ? "ফ্ল্যাগড" : "ফ্ল্যাগ"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={openKeyboardShortcutsGuide}
            title="কীবোর্ড শর্টকাট"
            aria-label="কীবোর্ড শর্টকাট"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px] font-medium">{chapterName}</span>
          <span className="font-mono">
            প্রশ্ন {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs">
              {DIFFICULTY_LABELS[currentQuestion.difficulty] ?? currentQuestion.difficulty}
            </Badge>
            {(currentQuestion.boardYear || currentQuestion.boardName) && (
              <Badge variant="secondary" className="text-xs gap-1">
                📅 {currentQuestion.boardName} {currentQuestion.boardYear ?? ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Clock className="h-3 w-3" />
              নিজের গতিতে সমাধান করো
            </span>
            <AcademicReportButton targetType="CORE_MCQ" targetId={currentQuestion.id} compact />
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 mb-5">
          <h2 className="text-base font-medium leading-relaxed flex-1">
            <MathText text={currentQuestion.text} />
          </h2>
          <VoiceReadoutButton text={currentQuestion.text} />
        </div>

        <div className="space-y-2">
          {(currentQuestion.options ?? []).map((option, i) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option;
            const banglaLetter = ["ক", "খ", "গ", "ঘ"][i] || String.fromCharCode(97 + i);
            return (
              <button
                key={i}
                onClick={() => selectAnswer(option)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3",
                  isSelected
                    ? "border-primary bg-primary/10 font-semibold shadow-xs ring-1 ring-primary/40"
                    : "hover:bg-muted/70"
                )}
              >
                <span
                  className={cn(
                    "h-6 w-6 rounded-lg border flex items-center justify-center text-xs shrink-0 font-mono font-medium",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {banglaLetter}
                </span>
                <div className="flex-1 min-w-0">
                  <MathText text={option} />
                </div>
                <span className="text-xs text-muted-foreground/60 font-mono hidden sm:inline">
                  [{i + 1}]
                </span>
              </button>
            );
          })}
        </div>

        {hasAnsweredCurrent && (
          <div className="mt-4 pt-3 border-t">
            <ConfidenceSelector
              value={confidenceMap[currentQuestion.id]}
              onChange={selectConfidence}
            />
          </div>
        )}
      </Card>

      <Button
        className="w-full gap-2 text-base font-semibold h-11"
        size="lg"
        disabled={!hasAnsweredCurrent || submitting}
        onClick={handleNext}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLastQuestion ? (
          "ফলাফল দেখুন"
        ) : (
          <>
            পরবর্তী প্রশ্ন
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {/* OMR Sheet Modal */}
      <OMRSheetDialog
        open={omrOpen}
        onOpenChange={setOmrOpen}
        totalQuestions={questions.length}
        currentIndex={currentIndex}
        answers={omrAnswersMap}
        flaggedQuestions={flaggedQuestions}
        onSelectOption={handleSelectOptionByIndex}
        onNavigateToQuestion={(idx) => setCurrentIndex(idx)}
      />
    </div>
  );
}
