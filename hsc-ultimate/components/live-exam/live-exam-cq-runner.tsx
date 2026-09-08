"use client";

// ===================================================================
// Live Exam CQ Runner — টাইমার সহ সৃজনশীল প্রশ্নের উত্তর লেখার UI
// -------------------------------------------------------------------
// established `components/cq/cq-runner.tsx` (CQ Practice) ও Mock Exam
// Runner এর CQ ফেজের UI প্যাটার্ন অনুসরণ করে বানানো হয়েছে — উদ্দীপক
// দেখানো, ক/খ/গ/ঘ প্রশ্নের জন্য Textarea, established VoiceInputButton/
// HandwrittenAnswerButton (হাতে লেখা উত্তর ছবি তুলে OCR) পুনর্ব্যবহার।
// established Live Exam MCQ Runner এর countdown timer (auto-submit)
// প্যাটার্নও অনুসরণ করা হয়েছে — কিন্তু established CQ Practice এর মতো
// প্রতিটা প্রশ্ন আলাদাভাবে submit না করে, সবগুলো প্রশ্নের উত্তর একসাথে
// (established Mock Exam CQ ফেজের মতো) `submit-cq` এ পাঠানো হয় (একবারই
// AI evaluation batch call, established Live Exam এর "সেশন শেষে একবার
// সাবমিট" ডিজাইন দর্শনের সাথে সামঞ্জস্যপূর্ণ)।
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ChevronRight, ChevronLeft, Clock, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { HandwrittenAnswerButton } from "@/components/shared/handwritten-answer-button";

interface CqQuestion {
  id: string;
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
  boardYear?: number | null;
  boardName?: string | null;
}

type CqAnswerFields = { a: string; b: string; c: string; d: string };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveExamCqRunner({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<CqQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CqAnswerFields>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  // useRef দিয়ে সর্বশেষ answers state রাখা হয় যাতে countdown এর
  // setInterval callback (স্টেল ক্লোজার এড়াতে) সবসময় সর্বশেষ উত্তর
  // দিয়ে auto-submit করে (established Live Exam MCQ Runner এর একই
  // প্যাটার্ন দরকার ছিল, তাই এখানেও প্রয়োগ)
  // ⚠️ React ref render এর সময় mutate করা যায় না ("Cannot access refs
  // during render" lint error) — `useEffect` দিয়ে প্রতিটা answers
  // পরিবর্তনের পরে sync করা হচ্ছে (commit phase এ, render phase এ না)
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const submitExam = useCallback(
    async (finalAnswers: Record<string, CqAnswerFields>) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const payload = questions.map((q) => {
          const a = finalAnswers[q.id] ?? { a: "", b: "", c: "", d: "" };
          return {
            questionId: q.id,
            answerA: a.a,
            answerB: a.b,
            answerC: a.c,
            answerD: a.d,
          };
        });
        const res = await fetch(`/api/live-exam/${sessionId}/submit-cq`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "জমা দেওয়া যায়নি");
          submittedRef.current = false;
          setSubmitting(false);
          return;
        }
        toast.success("পরীক্ষা সম্পন্ন হয়েছে! ফলাফল দেখো");
        router.push(`/live-exam/${sessionId}/result`);
      } catch {
        toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
        submittedRef.current = false;
        setSubmitting(false);
      }
    },
    [sessionId, router, questions]
  );

  useEffect(() => {
    async function load() {
      try {
        const [sessionRes, questionsRes] = await Promise.all([
          fetch(`/api/live-exam/${sessionId}`),
          fetch(`/api/live-exam/${sessionId}/cq-questions`),
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

        setQuestions(questionsData.cqQuestions);
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

  // Countdown timer — সময় শেষ হলে auto-submit (established Live Exam
  // MCQ Runner এর একই প্যাটার্ন, কিন্তু answersRef ব্যবহার করে স্টেল
  // ক্লোজার এড়ানো হয়েছে যেহেতু এখানে answers একটা nested object)
  useEffect(() => {
    if (loading || error || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void submitExam(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error]);

  function updateAnswer(questionId: string, field: keyof CqAnswerFields, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] ?? { a: "", b: "", c: "", d: "" }), [field]: value },
    }));
  }

  function appendFromVoice(questionId: string, field: keyof CqAnswerFields, transcript: string) {
    setAnswers((prev) => {
      const existing = prev[questionId] ?? { a: "", b: "", c: "", d: "" };
      const prevValue = existing[field];
      return {
        ...prev,
        [questionId]: { ...existing, [field]: prevValue ? `${prevValue} ${transcript}` : transcript },
      };
    });
  }

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
  const currentAnswer = current ? answers[current.id] ?? { a: "", b: "", c: "", d: "" } : { a: "", b: "", c: "", d: "" };
  const isLast = currentIdx === questions.length - 1;
  const isLow = secondsLeft < 300; // ৫ মিনিটের কম হলে সতর্কতা (established Mock Exam CQ ফেজের একই থ্রেশহোল্ড)

  if (!current) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="mb-4 text-muted-foreground">এই পরীক্ষায় কোনো CQ প্রশ্ন নেই, ফলাফল জমা দেওয়া হচ্ছে</p>
        <Button onClick={() => submitExam(answers)}>জমা দাও</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button render={<Link href="/live-exam" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <Badge variant={isLow ? "destructive" : "secondary"} className={cn("gap-1.5 text-sm", isLow && "animate-pulse")}>
          <Clock className="h-3.5 w-3.5" />
          {formatTime(secondsLeft)}
        </Badge>
      </div>

      <Progress value={((currentIdx + 1) / questions.length) * 100} className="mb-2 h-1.5" />
      <p className="mb-4 text-sm text-muted-foreground">
        CQ {currentIdx + 1} / {questions.length}
      </p>

      {/* Stimulus */}
      <Card className="mb-4 bg-muted/40 p-5">
        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            <MathText text={current.stimulus} />
          </p>
        </div>
      </Card>

      {(current.boardYear || current.boardName) && (
        <Badge variant="secondary" className="mb-4 gap-1 text-xs">
          📅 {current.boardName} {current.boardYear ?? ""}
        </Badge>
      )}

      {/* ক/খ/গ/ঘ প্রশ্ন */}
      <div className="mb-6 space-y-4">
        {(
          [
            { key: "a" as const, label: current.questionA, rows: 2 },
            { key: "b" as const, label: current.questionB, rows: 3 },
            { key: "c" as const, label: current.questionC, rows: 4 },
            { key: "d" as const, label: current.questionD, rows: 4 },
          ]
        ).map((part) => (
          <div key={part.key} className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <Label className="text-sm font-medium">
                <MathText text={part.label} />
              </Label>
              <div className="flex shrink-0 items-center gap-1.5">
                <VoiceInputButton onResult={(t) => appendFromVoice(current.id, part.key, t)} />
                <HandwrittenAnswerButton onResult={(t) => appendFromVoice(current.id, part.key, t)} />
              </div>
            </div>
            <Textarea
              value={currentAnswer[part.key]}
              onChange={(e) => updateAnswer(current.id, part.key, e.target.value)}
              placeholder="তোমার উত্তর লেখো..."
              aria-label={`${part.key} নং প্রশ্নের উত্তর`}
              rows={part.rows}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> আগের
        </Button>
        {!isLast ? (
          <Button className="flex-1" onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
            পরের <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button className="flex-1 gap-2" onClick={() => submitExam(answers)} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            পরীক্ষা জমা দাও
          </Button>
        )}
      </div>
    </div>
  );
}
