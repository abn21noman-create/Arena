"use client";

// ===================================================================
// Mock Exam Runner — MCQ ফেজ ও CQ ফেজ দুটো ধাপে চালায়, টাইমার সহ
// -------------------------------------------------------------------
// ফ্লো: MCQ প্রশ্ন লোড → টাইমার সহ উত্তর দেওয়া → MCQ জমা → CQ প্রশ্ন লোড →
// টাইমার সহ উত্তর লেখা → CQ জমা (AI evaluation) → Result পেজে রিডাইরেক্ট
// ===================================================================
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Calculator,
  FileSpreadsheet,
  Bookmark,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { HandwrittenAnswerButton } from "@/components/shared/handwritten-answer-button";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { MOCK_EXAM_CONFIG } from "@/lib/mock-exam";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { OMRSheetDialog } from "@/components/practice/omr-bubble-sheet";
import { openScientificCalculator } from "@/components/shared/scientific-calculator";
import { openKeyboardShortcutsGuide } from "@/components/shared/keyboard-shortcuts-dialog";
import { sfx } from "@/lib/sound-effects";

interface McqQuestion {
  id: string;
  text: string;
  options: string[] | null;
  difficulty: string;
}

interface CqQuestion {
  id: string;
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MockExamRunner({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"mcq" | "cq">("mcq");
  const [subjectName, setSubjectName] = useState("");
  const [mode, setMode] = useState<"FULL" | "QUICK">("FULL");

  // MCQ state
  const [mcqQuestions, setMcqQuestions] = useState<McqQuestion[]>([]);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqTimeLeft, setMcqTimeLeft] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [omrOpen, setOmrOpen] = useState(false);

  // CQ state
  const [cqQuestions, setCqQuestions] = useState<CqQuestion[]>([]);
  const [cqIndex, setCqIndex] = useState(0);
  const [cqAnswers, setCqAnswers] = useState<
    Record<string, { a: string; b: string; c: string; d: string }>
  >({});
  const [cqTimeLeft, setCqTimeLeft] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const loadExam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mock-exam/${attemptId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "পরীক্ষা লোড করা যায়নি");
        return;
      }

      setSubjectName(data.attempt.subjectName);
      setMode(data.attempt.mode);
      setMcqQuestions(data.mcqQuestions);
      setCqQuestions(data.cqQuestions);

      const config = MOCK_EXAM_CONFIG[data.attempt.mode as "FULL" | "QUICK"];

      if (data.attempt.status === "IN_PROGRESS") {
        setPhase("mcq");
        setMcqTimeLeft(config.mcqTimeMinutes * 60);
      } else if (data.attempt.status === "MCQ_DONE") {
        setPhase("cq");
        setCqTimeLeft(config.cqTimeMinutes * 60);
      } else {
        router.push(`/mock-exam/result/${attemptId}`);
        return;
      }

      startTimeRef.current = Date.now();
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [attemptId, router]);

  useEffect(() => {
    void loadExam();
  }, [loadExam]);

  // MCQ Timer
  useEffect(() => {
    if (phase !== "mcq" || loading || mcqTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setMcqTimeLeft((t) => {
        if (t === 60) {
          sfx.play("warning");
          toast.warning("১ মিনিট বাকি আছে!");
        }
        if (t <= 1) {
          clearInterval(interval);
          void handleMcqSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, loading]);

  // CQ Timer
  useEffect(() => {
    if (phase !== "cq" || loading || cqTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setCqTimeLeft((t) => {
        if (t === 60) {
          sfx.play("warning");
          toast.warning("১ মিনিট বাকি আছে!");
        }
        if (t <= 1) {
          clearInterval(interval);
          void handleCqSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, loading]);

  const omrAnswersMap = useMemo(() => {
    const map: Record<number, number | null | undefined> = {};
    mcqQuestions.forEach((q, qIdx) => {
      const ans = mcqAnswers[q.id];
      if (ans && q.options) {
        const optIdx = q.options.indexOf(ans);
        map[qIdx] = optIdx >= 0 ? optIdx : null;
      } else {
        map[qIdx] = null;
      }
    });
    return map;
  }, [mcqQuestions, mcqAnswers]);

  function selectMcqAnswer(option: string) {
    const q = mcqQuestions[mcqIndex];
    if (!q) return;
    sfx.play("click");
    setMcqAnswers((prev) => ({ ...prev, [q.id]: option }));
  }

  function handleSelectOmrOption(qIdx: number, optIdx: number) {
    const q = mcqQuestions[qIdx];
    if (q && q.options && q.options[optIdx]) {
      const chosen = q.options[optIdx];
      setMcqAnswers((prev) => ({ ...prev, [q.id]: chosen }));
      sfx.play("click");
    }
  }

  function toggleFlagCurrentMcq() {
    sfx.play("click");
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(mcqIndex)) {
        next.delete(mcqIndex);
        toast.info("ফ্ল্যাগ সরানো হয়েছে");
      } else {
        next.add(mcqIndex);
        toast.success("রিভিউর জন্য ফ্ল্যাগ করা হয়েছে");
      }
      return next;
    });
  }

  function updateCqAnswer(field: "a" | "b" | "c" | "d", value: string) {
    const q = cqQuestions[cqIndex];
    if (!q) return;
    setCqAnswers((prev) => ({
      ...prev,
      [q.id]: { ...(prev[q.id] ?? { a: "", b: "", c: "", d: "" }), [field]: value },
    }));
  }

  function appendCqAnswerFromVoice(field: "a" | "b" | "c" | "d", transcript: string) {
    const q = cqQuestions[cqIndex];
    if (!q) return;
    setCqAnswers((prev) => {
      const existing = prev[q.id] ?? { a: "", b: "", c: "", d: "" };
      const prevValue = existing[field];
      return {
        ...prev,
        [q.id]: { ...existing, [field]: prevValue ? `${prevValue} ${transcript}` : transcript },
      };
    });
  }

  async function handleMcqSubmit() {
    setSubmitting(true);
    sfx.play("levelUp");
    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    const answers = mcqQuestions.map((q) => ({
      questionId: q.id,
      userAnswer: mcqAnswers[q.id] ?? "",
    }));

    try {
      const res = await fetch(`/api/mock-exam/${attemptId}/submit-mcq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTakenSec }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "MCQ জমা দিতে সমস্যা হয়েছে");
        setSubmitting(false);
        return;
      }

      toast.success(`MCQ অংশ শেষ! স্কোর: ${data.mcqScore}/${data.mcqTotal}`);
      setPhase("cq");
      const config = MOCK_EXAM_CONFIG[mode];
      setCqTimeLeft(config.cqTimeMinutes * 60);
      startTimeRef.current = Date.now();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCqSubmit() {
    setSubmitting(true);
    sfx.play("levelUp");
    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    const answers = cqQuestions.map((q) => {
      const a = cqAnswers[q.id] ?? { a: "", b: "", c: "", d: "" };
      return {
        cqQuestionId: q.id,
        answerA: a.a,
        answerB: a.b,
        answerC: a.c,
        answerD: a.d,
      };
    });

    try {
      const res = await fetch(`/api/mock-exam/${attemptId}/submit-cq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTakenSec }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "জমা দিতে সমস্যা হয়েছে");
        setSubmitting(false);
        return;
      }

      showNewBadgeToasts(data.newBadges);
      toast.success("পরীক্ষা সম্পন্ন হয়েছে! ফলাফল দেখো");
      router.push(`/mock-exam/result/${attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setSubmitting(false);
    }
  }

  const mcqCurrentForNav = mcqQuestions[mcqIndex];
  const mcqIsLastForNav = mcqIndex === mcqQuestions.length - 1;
  useMcqKeyboardNav({
    options: mcqCurrentForNav?.options,
    onSelect: selectMcqAnswer,
    onNext: () => (mcqIsLastForNav ? void handleMcqSubmit() : setMcqIndex((i) => i + 1)),
    nextEnabled: phase === "mcq" && !loading && !error && !submitting,
    onPrev: () => setMcqIndex((i) => Math.max(0, i - 1)),
    prevEnabled: phase === "mcq" && !loading && !error && mcqIndex > 0,
    enabled: phase === "mcq" && !loading && !error,
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">পরীক্ষা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <p className="text-destructive font-medium mb-4">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/mock-exam">
            <ArrowLeft className="h-4 w-4 mr-2" />
            মডেল টেস্টে ফিরে যাও
          </Link>
        </Button>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // MCQ ফেজ UI
  // -----------------------------------------------------------------
  if (phase === "mcq") {
    const currentMcq = mcqQuestions[mcqIndex];
    const mcqProgress = ((mcqIndex + 1) / mcqQuestions.length) * 100;
    const isLastMcq = mcqIndex === mcqQuestions.length - 1;
    const isFlagged = flaggedQuestions.has(mcqIndex);

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Top Tools bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {subjectName}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              MCQ অংশ
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => setOmrOpen(true)}
              title="ভার্চুয়াল OMR শিট"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
              <span className="hidden xs:inline">OMR শিট</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={openScientificCalculator}
              title="ক্যালকুলেটর"
            >
              <Calculator className="h-3.5 w-3.5 text-primary" />
              <span className="hidden xs:inline">ক্যালকুলেটর</span>
            </Button>

            <Button
              variant={isFlagged ? "default" : "outline"}
              size="sm"
              className={cn("h-8 gap-1 text-xs", isFlagged && "bg-amber-500 hover:bg-amber-600 text-white")}
              onClick={toggleFlagCurrentMcq}
            >
              <Bookmark className="h-3.5 w-3.5" />
            </Button>

            <div
              className={cn(
                "flex items-center gap-1 font-mono text-sm font-semibold px-2.5 py-1 rounded-lg border",
                mcqTimeLeft < 60
                  ? "bg-destructive/10 text-destructive border-destructive animate-pulse"
                  : "bg-muted text-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTime(mcqTimeLeft)}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              প্রশ্ন {mcqIndex + 1} / {mcqQuestions.length}
            </span>
            <span>{Math.round(mcqProgress)}% সম্পন্ন</span>
          </div>
          <Progress value={mcqProgress} className="h-2" />
        </div>

        {currentMcq && (
          <Card className="p-5">
            <h2 className="text-base font-medium mb-5 leading-relaxed">
              <MathText text={currentMcq.text} />
            </h2>

            <div className="space-y-2">
              {(currentMcq.options ?? []).map((option, i) => {
                const isSelected = mcqAnswers[currentMcq.id] === option;
                const banglaLetter = ["ক", "খ", "গ", "ঘ"][i] || String.fromCharCode(97 + i);

                return (
                  <button
                    key={i}
                    onClick={() => selectMcqAnswer(option)}
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
                          ? "border-primary bg-primary text-primary-foreground font-bold"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {banglaLetter}
                    </span>
                    <div className="flex-1 min-w-0">
                      <MathText text={option} />
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          {mcqIndex > 0 && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                sfx.play("click");
                setMcqIndex((i) => i - 1);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              আগের প্রশ্ন
            </Button>
          )}
          <Button
            className="flex-1 gap-2 h-11 text-base font-semibold"
            disabled={submitting}
            onClick={() => {
              sfx.play("click");
              isLastMcq ? handleMcqSubmit() : setMcqIndex((i) => i + 1);
            }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLastMcq ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                MCQ অংশ জমা দাও ও CQ শুরু করো
              </>
            ) : (
              <>
                পরবর্তী প্রশ্ন
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <OMRSheetDialog
          open={omrOpen}
          onOpenChange={setOmrOpen}
          totalQuestions={mcqQuestions.length}
          currentIndex={mcqIndex}
          answers={omrAnswersMap}
          flaggedQuestions={flaggedQuestions}
          onSelectOption={handleSelectOmrOption}
          onNavigateToQuestion={(idx) => setMcqIndex(idx)}
        />
      </div>
    );
  }

  // -----------------------------------------------------------------
  // CQ ফেজ UI
  // -----------------------------------------------------------------
  const currentCq = cqQuestions[cqIndex];
  const cqProgress = ((cqIndex + 1) / cqQuestions.length) * 100;
  const isLastCq = cqIndex === cqQuestions.length - 1;
  const currentCqAnswer = currentCq
    ? cqAnswers[currentCq.id] ?? { a: "", b: "", c: "", d: "" }
    : { a: "", b: "", c: "", d: "" };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {subjectName}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            CQ সৃজনশীল অংশ
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={openScientificCalculator}
          >
            <Calculator className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xs:inline">ক্যালকুলেটর</span>
          </Button>

          <div
            className={cn(
              "flex items-center gap-1 font-mono text-sm font-semibold px-2.5 py-1 rounded-lg border",
              cqTimeLeft < 120
                ? "bg-destructive/10 text-destructive border-destructive animate-pulse"
                : "bg-muted text-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {formatTime(cqTimeLeft)}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            সৃজনশীল প্রশ্ন {cqIndex + 1} / {cqQuestions.length}
          </span>
          <span>{Math.round(cqProgress)}% সম্পন্ন</span>
        </div>
        <Progress value={cqProgress} className="h-2" />
      </div>

      {currentCq && (
        <Card className="p-4 border-l-4 border-l-primary bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground mb-1">উদ্দীপক</p>
          <div className="text-sm leading-relaxed">
            <MathText text={currentCq.stimulus} />
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentCq.questionA} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) => appendCqAnswerFromVoice("a", transcript)}
              />
              <HandwrittenAnswerButton
                onResult={(text) => appendCqAnswerFromVoice("a", text)}
              />
            </div>
          </div>
          <Textarea
            value={currentCqAnswer.a}
            onChange={(e) => updateCqAnswer("a", e.target.value)}
            placeholder="জ্ঞানমূলক উত্তর লিখুন..."
            aria-label="ক নং প্রশ্নের উত্তর"
            className="min-h-16"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentCq.questionB} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) => appendCqAnswerFromVoice("b", transcript)}
              />
              <HandwrittenAnswerButton
                onResult={(text) => appendCqAnswerFromVoice("b", text)}
              />
            </div>
          </div>
          <Textarea
            value={currentCqAnswer.b}
            onChange={(e) => updateCqAnswer("b", e.target.value)}
            placeholder="অনুধাবনমূলক উত্তর লিখুন..."
            aria-label="খ নং প্রশ্নের উত্তর"
            className="min-h-20"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentCq.questionC} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) => appendCqAnswerFromVoice("c", transcript)}
              />
              <HandwrittenAnswerButton
                onResult={(text) => appendCqAnswerFromVoice("c", text)}
              />
            </div>
          </div>
          <Textarea
            value={currentCqAnswer.c}
            onChange={(e) => updateCqAnswer("c", e.target.value)}
            placeholder="প্রয়োগমূলক উত্তর লিখুন..."
            aria-label="গ নং প্রশ্নের উত্তর"
            className="min-h-24"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentCq.questionD} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) => appendCqAnswerFromVoice("d", transcript)}
              />
              <HandwrittenAnswerButton
                onResult={(text) => appendCqAnswerFromVoice("d", text)}
              />
            </div>
          </div>
          <Textarea
            value={currentCqAnswer.d}
            onChange={(e) => updateCqAnswer("d", e.target.value)}
            placeholder="উচ্চতর দক্ষতামূলক উত্তর লিখুন..."
            aria-label="ঘ নং প্রশ্নের উত্তর"
            className="min-h-28"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {cqIndex > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              sfx.play("click");
              setCqIndex((i) => i - 1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            আগের প্রশ্ন
          </Button>
        )}
        <Button
          className="flex-1 gap-2 h-11 text-base font-semibold"
          disabled={submitting}
          onClick={() => {
            sfx.play("click");
            isLastCq ? handleCqSubmit() : setCqIndex((i) => i + 1);
          }}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLastCq ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              সম্পূর্ণ পরীক্ষা জমা দিন
            </>
          ) : (
            <>
              পরবর্তী প্রশ্ন
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
