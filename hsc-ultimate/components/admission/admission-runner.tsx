"use client";

// ===================================================================
// Admission Mock Test Runner — countdown timer, প্রশ্ন navigation
// (আগে-পরে যাওয়া যায়, skip করা যায়), সময় শেষ হলে auto-submit
// -------------------------------------------------------------------
// bilateral navigation থাকা এখানে ইচ্ছাকৃত (Timed Drill এর মতো এক-দিকে
// না) কারণ বাস্তব ভর্তি পরীক্ষায় ছাত্র প্রশ্নের মধ্যে ফিরে গিয়ে উত্তর
// পরিবর্তন/রিভিউ করতে পারে — এটা real exam simulation এর অংশ।
// ===================================================================
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertTriangle, Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { KeyboardHint } from "@/components/shared/keyboard-hint";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface AdmissionQuestion {
  id: string;
  subject: string;
  text: string;
  options: string[];
  difficulty: string;
}

interface AdmissionSession {
  attemptId: string;
  examType: string;
  label: string;
  timeMinutes: number;
  negativeMarkPerWrong: number;
  passMark: number | null;
  disclaimer: string | null;
  questions: AdmissionQuestion[];
}

const SUBJECT_LABELS: Record<string, string> = {
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  MATH: "গণিত",
  ENGLISH: "ইংরেজি",
  GENERAL_KNOWLEDGE: "সাধারণ জ্ঞান",
};

export function AdmissionRunner({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<AdmissionSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(0);
  const submittedRef = useRef(false);
  const answersRef = useRef<Record<string, string>>({});

  // answers state পরিবর্তনের সাথে সাথে ref ও sync রাখা হয় — টাইমার
  // callback (useEffect এ session-only dependency) সবসময় সর্বশেষ answers
  // পড়তে পারে stale closure এড়িয়ে (drill-runner.tsx এর একই প্যাটার্ন)
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !session) return;
    submittedRef.current = true;
    setSubmitting(true);

    const answeredList = Object.entries(answersRef.current).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer,
    }));
    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch(`/api/admission/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answeredList, timeTakenSec }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "জমা দিতে সমস্যা হয়েছে");
        setSubmitting(false);
        submittedRef.current = false;
        return;
      }
      sessionStorage.removeItem("admission_session");
      router.push(`/admission/result/${attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setSubmitting(false);
      submittedRef.current = false;
    }
  }, [attemptId, session, router]);

  useEffect(() => {
    const stored = sessionStorage.getItem("admission_session");
    if (!stored) {
      toast.error("সেশন পাওয়া যায়নি, আবার শুরু করো");
      router.push("/admission");
      return;
    }
    const parsed: AdmissionSession = JSON.parse(stored);
    setSession(parsed);
    setTimeLeft(parsed.timeMinutes * 60);
    startTimeRef.current = Date.now();
  }, [router]);

  // টাইমার — প্রতি সেকেন্ডে কমতে থাকে, ০ হলে auto-submit (drill-runner.tsx
  // এর প্যাটার্ন অনুসরণ করে শুধু session dependency ব্যবহার করা হয়েছে,
  // যাতে প্রতি সেকেন্ডে নতুন interval তৈরি না হয়)
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          void handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const currentQuestionForNav = session?.questions[currentIndex];

  function selectAnswer(option: string) {
    if (!currentQuestionForNav) return;
    setAnswers((prev) => ({ ...prev, [currentQuestionForNav.id]: option }));
  }

  // কীবোর্ড শর্টকাট (WCAG 2.2 accessibility) — bilateral navigation
  // (ভর্তি পরীক্ষায় প্রশ্নে ফিরে গিয়ে উত্তর পরিবর্তন করা যায়)
  useMcqKeyboardNav({
    options: currentQuestionForNav?.options,
    onSelect: selectAnswer,
    onNext: () =>
      session && currentIndex === session.questions.length - 1
        ? void handleSubmit()
        : setCurrentIndex((i) => Math.min((session?.questions.length ?? 1) - 1, i + 1)),
    nextEnabled: !!session && !submitting,
    onPrev: () => setCurrentIndex((i) => Math.max(0, i - 1)),
    prevEnabled: !!session && currentIndex > 0,
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeCritical = timeLeft <= 60;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Header: timer + progress */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{session.label}</p>
          <p className="text-xs text-muted-foreground">
            {answeredCount}/{session.questions.length} টা উত্তর দেওয়া হয়েছে
          </p>
        </div>
        <Badge
          className={cn(
            "gap-1.5 text-sm",
            isTimeCritical
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </Badge>
      </div>

      {session.disclaimer && (
        <Alert variant="warning" className="mb-4 text-xs">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
            {session.disclaimer}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-2 flex justify-end">
        <KeyboardHint showPrev />
      </div>

      {/* Question navigator dots */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {session.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-7 w-7 rounded-md text-xs font-medium transition-colors",
              i === currentIndex
                ? "bg-primary text-primary-foreground"
                : answers[q.id]
                ? "bg-violet-500/20 text-violet-700 dark:text-violet-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {currentQuestion && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs">
              {SUBJECT_LABELS[currentQuestion.subject] ?? currentQuestion.subject}
            </Badge>
            <AcademicReportButton targetType="ADMISSION_MCQ" targetId={currentQuestion.id} compact />
          </div>
          <p className="mb-4 text-base font-medium leading-relaxed">
            <MathText text={currentQuestion.text} />
          </p>
          <div className="space-y-2">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(option)}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  answers[currentQuestion.id] === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-muted"
                )}
              >
                <MathText text={option} />
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          আগের
        </Button>

        {currentIndex === session.questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5">
            <Send className="h-4 w-4" />
            জমা দাও
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentIndex((i) => Math.min(session.questions.length - 1, i + 1))}
            className="gap-1.5"
          >
            পরের
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
