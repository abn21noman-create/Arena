"use client";

// ===================================================================
// Timed Drill Runner — টাইমার শেষ না হওয়া পর্যন্ত দ্রুত এক এক করে প্রশ্ন
// আসতে থাকে (ব্যাক-নেভিগেশন নেই, উত্তর দিলেই পরের প্রশ্ন) — Duolingo/
// speed-practice এর মতো ফাস্ট-পেসড অভিজ্ঞতা।
// ===================================================================
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { MathText } from "@/components/shared/math-text";
import { useMcqKeyboardNav } from "@/hooks/use-mcq-keyboard-nav";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface DrillQuestion {
  id: string;
  text: string;
  options: string[] | null;
  difficulty: string;
}

interface DrillSession {
  subjectId: string;
  subjectName: string;
  durationSec: number;
  questions: DrillQuestion[];
}

export function DrillRunner() {
  const router = useRouter();
  const [session, setSession] = useState<DrillSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const submittedRef = useRef(false);

  const handleSubmit = useCallback(
    async (finalAnswers: Record<string, string>) => {
      if (submittedRef.current || !session) return;
      submittedRef.current = true;
      setSubmitting(true);

      const answeredList = Object.entries(finalAnswers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));

      if (answeredList.length === 0) {
        toast.error("তুমি কোনো প্রশ্নের উত্তর দাওনি");
        router.push("/drill");
        return;
      }

      const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);

      try {
        const res = await fetch("/api/drill/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: session.subjectId,
            timeTakenSec,
            answers: answeredList,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "জমা দিতে সমস্যা হয়েছে");
          setSubmitting(false);
          return;
        }
        showNewBadgeToasts(data.newBadges);
        sessionStorage.removeItem("drill_session");
        router.push(`/practice/result/${data.attemptId}`);
      } catch {
        toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
        setSubmitting(false);
      }
    },
    [session, router]
  );

  useEffect(() => {
    const raw = sessionStorage.getItem("drill_session");
    if (!raw) {
      setError("ড্রিল সেশন পাওয়া যায়নি, আবার শুরু করো");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as DrillSession;
      setSession(parsed);
      setTimeLeft(parsed.durationSec);
      startTimeRef.current = Date.now();
    } catch {
      setError("ড্রিল সেশন লোড করা যায়নি");
    }
  }, []);

  // টাইমার — প্রতি সেকেন্ডে কমতে থাকে, ০ হলে auto-submit
  useEffect(() => {
    if (!session || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          void handleSubmit(answers);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function selectAnswer(option: string) {
    if (!session || flash) return;
    const currentQuestion = session.questions[currentIndex];
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);

    // তাৎক্ষণিক ভিজুয়াল ফিডব্যাক (সঠিক উত্তর ক্লায়েন্টে নেই, তাই শুধু
    // "উত্তর গৃহীত হয়েছে" teal ফ্ল্যাশ দেখানো হয়, correct/wrong না — নিরাপত্তার
    // জন্য সঠিক উত্তর submit না হওয়া পর্যন্ত ক্লায়েন্টে পাঠানো হয় না)
    // নোট: state এর ভ্যালু ঐতিহাসিক কারণে "correct", কিন্তু এর অর্থ
    // শুধু "একটা উত্তর নির্বাচিত হয়েছে" — শুদ্ধতা যাচাই সার্ভারে হয়।
    setFlash("correct");
    setTimeout(() => {
      setFlash(null);
      if (currentIndex + 1 < session.questions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        // প্রশ্ন pool শেষ হয়ে গেলেও টাইমার চলতে থাকবে, কিন্তু নতুন প্রশ্ন
        // নেই — তাই সাথে সাথে submit করে দেওয়া হচ্ছে
        void handleSubmit(newAnswers);
      }
    }, 180);
  }

  // কীবোর্ড শর্টকাট (WCAG 2.2 accessibility) — Drill mode এ "পরের প্রশ্ন"
  // বাটন নেই (উত্তর দিলেই auto-advance হয়), তাই শুধু অপশন সিলেকশন শর্টকাট
  // (Hooks Rules মেনে early return গুলোর আগেই কল করতে হবে, তাই optional
  // chaining দিয়ে নিরাপদে session/currentQuestion না থাকা অবস্থাতেও কল করা)
  useMcqKeyboardNav({
    options: session?.questions[currentIndex]?.options,
    onSelect: selectAnswer,
    enabled: !error && !!session && !submitting && !flash,
  });

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-muted-foreground">{error}</p>
        <Button render={<Link href="/drill" />} variant="outline">আবার চেষ্টা করো</Button>
      </div>
    );
  }

  if (!session) return null;

  if (submitting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Zap className="h-8 w-8 animate-pulse text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-muted-foreground">ফলাফল হিসাব হচ্ছে...</p>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  if (!currentQuestion) return null;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-xl flex-col px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{session.subjectName}</p>
          <p className="text-sm font-medium">{answeredCount}টা উত্তর দেওয়া হয়েছে</p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-lg font-bold tabular-nums",
            timeLeft <= 10 ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-pulse" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
          )}
        >
          <Zap className="h-4 w-4" />
          {timeLeft}s
        </div>
      </div>

      <Card
        className={cn(
          "flex-1 p-6 transition-colors",
          // ⚠️ এই flash ইচ্ছাকৃতভাবে neutral — "উত্তর গৃহীত হয়েছে"
          // বোঝায়, সঠিক/ভুল **না** (নিরাপত্তার জন্য সঠিক উত্তর submit
          // না হওয়া পর্যন্ত ক্লায়েন্টে পাঠানো হয় না, উপরে
          // `selectAnswer` এর কমেন্ট দেখুন)। তাই সবুজ/লাল ব্যবহার করা
          // যাবে না — সেটা ভুল semantic সংকেত দেবে।
          //
          // Violet Glass Theme — আগে নীল (`bg-blue-50`) ছিল যা
          // ব্র্যান্ড প্যালেটের বাইরে; এখন ব্র্যান্ড-সংলগ্ন কিন্তু
          // semantic-নিরপেক্ষ teal, যা established "সবুজ=সঠিক,
          // লাল=ভুল" নিয়মের সাথে গুলিয়ে যায় না।
          flash && "bg-fuchsia-50 dark:bg-fuchsia-950/30"
        )}
      >
        <div className="mb-2 flex justify-end">
          <AcademicReportButton targetType="CORE_MCQ" targetId={currentQuestion.id} compact />
        </div>
        <h2 className="mb-5 text-base font-medium leading-relaxed">
          <MathText text={currentQuestion.text} />
        </h2>
        <div className="space-y-2">
          {(currentQuestion.options ?? []).map((option, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(option)}
              disabled={!!flash}
              className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-muted disabled:pointer-events-none"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs">
                {String.fromCharCode(97 + i)}
              </span>
              <MathText text={option} />
            </button>
          ))}
        </div>
      </Card>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        উত্তর দিলেই সাথে সাথে পরের প্রশ্নে চলে যাবে — যত বেশি সম্ভব উত্তর দাও!
      </p>
    </div>
  );
}
