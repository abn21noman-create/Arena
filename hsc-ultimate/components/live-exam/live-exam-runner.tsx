"use client";

// ===================================================================
// Live Exam Runner — টাইমার সহ MCQ পরীক্ষা (Custom Set অথবা Question Bank)
// -------------------------------------------------------------------
// mock-exam-runner.tsx এর countdown timer প্যাটার্ন অনুসরণ করে — সময় শেষ
// হয়ে গেলে স্বয়ংক্রিয়ভাবে জমা হয়ে যায় (auto-submit)।
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ChevronRight, ChevronLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { KeyboardHint } from "@/components/shared/keyboard-hint";

interface Question {
  id: string;
  text: string;
  options: string[] | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveExamRunner({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const submitExam = useCallback(
    async (finalAnswers: Record<string, string>) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/live-exam/${sessionId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: finalAnswers }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "জমা দেওয়া যায়নি");
          submittedRef.current = false;
          setSubmitting(false);
          return;
        }
        router.push(`/live-exam/${sessionId}/result`);
      } catch {
        toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
        submittedRef.current = false;
        setSubmitting(false);
      }
    },
    [sessionId, router]
  );

  useEffect(() => {
    async function load() {
      try {
        const [sessionRes, questionsRes] = await Promise.all([
          fetch(`/api/live-exam/${sessionId}`),
          fetch(`/api/live-exam/${sessionId}/questions`),
        ]);
        const sessionData = await sessionRes.json();
        const questionsData = await questionsRes.json();

        if (!sessionRes.ok) {
          setError(sessionData.error ?? "সেশন পাওয়া যায়নি");
          return;
        }
        if (sessionData.liveExam.status === "COMPLETED") {
          router.replace(`/live-exam/${sessionId}/result`);
          return;
        }
        if (!questionsRes.ok) {
          setError(questionsData.error ?? "প্রশ্ন পাওয়া যায়নি");
          return;
        }

        setQuestions(questionsData.questions);
        const elapsedSec = Math.floor(
          (Date.now() - new Date(sessionData.liveExam.createdAt).getTime()) / 1000
        );
        const totalSec = sessionData.liveExam.durationMinutes * 60;
        setSecondsLeft(Math.max(0, totalSec - elapsedSec));
      } catch {
        setError("লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [sessionId, router]);

  // Countdown timer — সময় শেষ হলে auto-submit
  useEffect(() => {
    if (loading || error || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void submitExam(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error]);

  function selectAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  const currentForNav = questions[currentIdx];
  const isLastForNav = currentIdx === questions.length - 1;

  // কীবোর্ড শর্টকাট (WCAG 2.2 accessibility) — bilateral navigation
  // (Live Exam এ প্রশ্নে ফিরে গিয়ে উত্তর পরিবর্তন করা যায়)
  useMcqKeyboardNav({
    options: currentForNav?.options,
    onSelect: (option) => currentForNav && selectAnswer(currentForNav.id, option),
    onNext: () =>
      isLastForNav
        ? void submitExam(answers)
        : setCurrentIdx((i) => Math.min(questions.length - 1, i + 1)),
    nextEnabled: !loading && !error && !submitting,
    onPrev: () => setCurrentIdx((i) => Math.max(0, i - 1)),
    prevEnabled: !loading && !error && currentIdx > 0,
    enabled: !loading && !error,
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-destructive">{error}</p>
        <Button render={<Link href="/live-exam" />} variant="link">ফিরে যাও</Button>
      </div>
    );
  }

  const current = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const isLow = secondsLeft < 60;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button render={<Link href="/live-exam" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <Badge variant={isLow ? "destructive" : "secondary"} className="gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(secondsLeft)}
        </Badge>
      </div>

      <Progress value={((currentIdx + 1) / questions.length) * 100} className="mb-2" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          প্রশ্ন {currentIdx + 1} / {questions.length} • উত্তর দেওয়া হয়েছে: {answeredCount}
        </p>
        <KeyboardHint showPrev />
      </div>

      {current && (
        <Card className="p-5">
          <p className="mb-4 font-medium">
            <MathText text={current.text} />
          </p>
          <div className="space-y-2">
            {(current.options ?? []).map((opt) => (
              <button
                key={opt}
                onClick={() => selectAnswer(current.id, opt)}
                className={cn(
                  "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                  answers[current.id] === opt
                    ? "border-primary bg-primary/10 font-medium"
                    : "hover:bg-muted"
                )}
              >
                <MathText text={opt} />
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-4 flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> আগের
        </Button>
        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
            পরের <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => submitExam(answers)} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            জমা দাও
          </Button>
        )}
      </div>
    </div>
  );
}
