"use client";

// ===================================================================
// Live Exam Result — স্কোর + প্রতিটা প্রশ্নের বিস্তারিত রিভিউ (MCQ+CQ) +
// "AI দিয়ে ব্যাখ্যা বুঝি" বাটন (MCQ) / AI ফিডব্যাক (CQ)
// -------------------------------------------------------------------
// established `ExplainMistakeButton` (generic endpoint prop নেওয়া
// রিইউজেবল কম্পোনেন্ট, ইতিমধ্যে Practice/Mock Exam/Admission এ
// ব্যবহৃত) নতুন `/api/live-exam/[sessionId]/mcq/[questionId]/explain`
// endpoint এর সাথে যুক্ত করে Live Exam MCQ এও একই AI-ব্যাখ্যা অভিজ্ঞতা
// নিয়ে আসে।
//
// 🔧 সম্প্রসারণ (এই সেশনে, Live Exam CQ সাপোর্ট): established শুধু MCQ
// রিভিউ UI ছিল। এখন `liveExam.questionType` চেক করে MCQ হলে
// established MCQ রিভিউ (অপরিবর্তিত), CQ হলে established Mock Exam
// Result পেজের CQ Review UI প্যাটার্ন (উদ্দীপক, ক/খ/গ/ঘ প্রশ্ন-উত্তর-
// মডেল উত্তর, AI স্কোর ব্যাজ+ফিডব্যাক) অনুসরণ করে নতুন CQ রিভিউ UI
// রেন্ডার করা হয়। TypeScript discriminated union narrowing সহজ রাখতে
// দুটো আলাদা sub-component (McqResultView/CqResultView) এ ভাগ করা
// হয়েছে — একটা বুলিয়ান ভ্যারিয়েবলে narrowing হারিয়ে যাওয়ার সমস্যা
// এড়াতে।
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Trophy,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";
import { ExplainMistakeButton } from "@/components/practice/explain-mistake-button";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface ReviewQuestion {
  id: string;
  text: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  userAnswer: string | null;
  isCorrect: boolean;
}

interface CqReviewItem {
  id: string;
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
  modelAnswerA: string | null;
  modelAnswerB: string | null;
  modelAnswerC: string | null;
  modelAnswerD: string | null;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  totalScore: number;
  feedback: string | null;
}

interface McqResultData {
  liveExam: {
    id: string;
    questionType: "MCQ";
    score: number;
    totalQuestions: number;
    status: string;
    sourceType: string;
    displayName: string | null;
  };
  questions: ReviewQuestion[];
}

interface CqResultData {
  liveExam: {
    id: string;
    questionType: "CQ";
    cqScore: number;
    cqTotalMarks: number;
    status: string;
    sourceType: string;
    displayName: string | null;
  };
  cqReview: CqReviewItem[];
}

type ResultData = McqResultData | CqResultData;

// TypeScript নেস্টেড discriminant (`data.liveExam.questionType`) দিয়ে
// পুরো `ResultData` ইউনিয়ন narrow করতে পারে না (discriminant top-level
// এ থাকতে হয়) — তাই এক্সপ্লিসিট টাইপ-গার্ড ফাংশন লেখা হয়েছে
function isCqResult(data: ResultData): data is CqResultData {
  return data.liveExam.questionType === "CQ";
}

const CQ_PARTS = [
  { key: "A" as const, label: "ক", max: 1 },
  { key: "B" as const, label: "খ", max: 2 },
  { key: "C" as const, label: "গ", max: 3 },
  { key: "D" as const, label: "ঘ", max: 4 },
];

function feedbackFor(percentage: number): string {
  if (percentage >= 90) return "অসাধারণ! তুমি দুর্দান্ত করেছো! 🏆";
  if (percentage >= 70) return "খুব ভালো করেছো! আরেকটু চেষ্টা করলে পারফেক্ট হবে! 🌟";
  if (percentage >= 50) return "ভালো চেষ্টা! ভুল প্রশ্নগুলো আবার দেখে নাও। 📚";
  return "আরও অনুশীলন দরকার, চালিয়ে যাও! 💪";
}

function ResultShell({
  displayName,
  percentage,
  scoreLine,
  children,
}: {
  displayName: string | null;
  percentage: number;
  scoreLine: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-8">
      <Link href="/live-exam" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> ফিরে যাও
      </Link>

      {/* Score summary */}
      <Card className="p-6 text-center mb-6">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-600 dark:text-amber-400" />
        <h1 className="mb-1 text-2xl font-bold">পরীক্ষা সম্পন্ন!</h1>
        {displayName && <p className="mb-2 text-sm text-muted-foreground">{displayName}</p>}
        <div className="mb-2 text-4xl font-bold text-primary">{percentage}%</div>
        <p className="mb-3 text-lg">{scoreLine}</p>
        <p className="text-sm font-medium">{feedbackFor(percentage)}</p>
      </Card>

      {children}

      <div className="flex gap-3">
        <Button render={<Link href="/live-exam" className="flex-1" />} variant="outline" className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            আবার চেষ্টা করো
          </Button>
        <Button render={<Link href="/dashboard" className="flex-1" />} className="w-full gap-2">
            <Home className="h-4 w-4" />
            ড্যাশবোর্ড
          </Button>
      </div>
    </div>
  );
}

function McqResultView({ sessionId, data }: { sessionId: string; data: McqResultData }) {
  const { liveExam, questions } = data;
  const percentage = liveExam.totalQuestions > 0 ? Math.round((liveExam.score / liveExam.totalQuestions) * 100) : 0;

  return (
    <ResultShell
      displayName={liveExam.displayName}
      percentage={percentage}
      scoreLine={`${liveExam.score} / ${liveExam.totalQuestions} সঠিক`}
    >
      {questions.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">উত্তরপত্র পর্যালোচনা</h2>
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <Card key={q.id} className="p-4">
                <div className="mb-2 flex items-start gap-2">
                  {q.isCorrect ? (
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  )}
                  <p className="flex-1 text-sm font-medium">
                    {idx + 1}. <MathText text={q.text} />
                  </p>
                  {liveExam.sourceType === "question_bank" && (
                    <AcademicReportButton targetType="CORE_MCQ" targetId={q.id} compact />
                  )}
                </div>
                <div className="space-y-1 pl-6.5 text-sm">
                  <p
                    className={cn(
                      "flex gap-1.5",
                      q.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    তোমার উত্তর:{" "}
                    <span className="font-medium">
                      {q.userAnswer ? <MathText text={q.userAnswer} /> : "উত্তর দেওয়া হয়নি"}
                    </span>
                  </p>
                  {!q.isCorrect && (
                    <p className="text-violet-600 dark:text-violet-400">
                      সঠিক উত্তর: <span className="font-medium"><MathText text={q.correctAnswer} /></span>
                    </p>
                  )}
                  {q.explanation && (
                    <p className="mt-1.5 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                      💡 {q.explanation}
                    </p>
                  )}
                  {!q.isCorrect && q.userAnswer && (
                    <ExplainMistakeButton endpoint={`/api/live-exam/${sessionId}/mcq/${q.id}/explain`} />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </ResultShell>
  );
}

function CqResultView({ data }: { data: CqResultData }) {
  const { liveExam, cqReview } = data;
  const percentage = liveExam.cqTotalMarks > 0 ? Math.round((liveExam.cqScore / liveExam.cqTotalMarks) * 100) : 0;

  return (
    <ResultShell
      displayName={liveExam.displayName}
      percentage={percentage}
      scoreLine={`${liveExam.cqScore} / ${liveExam.cqTotalMarks} নম্বর`}
    >
      {cqReview.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">CQ রিভিউ (AI মূল্যায়ন)</h2>
          <div className="space-y-4">
            {cqReview.map((item, i) => (
              <Card key={item.id} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">CQ {i + 1}</p>
                  <div className="flex items-center gap-1">
                    <Badge>{item.totalScore}/10</Badge>
                    {liveExam.sourceType === "question_bank" && (
                      <AcademicReportButton targetType="CQ" targetId={item.id} compact />
                    )}
                  </div>
                </div>
                <p className="mb-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  <MathText text={item.stimulus} />
                </p>

                {item.feedback && (
                  <Alert className="mb-3 border-violet-500/20 bg-violet-500/5">
                    <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <AlertTitle className="text-xs text-violet-600 dark:text-violet-400">AI ফিডব্যাক</AlertTitle>
                    <AlertDescription className="text-sm text-foreground">{item.feedback}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  {CQ_PARTS.map((part) => {
                    const questionText = item[`question${part.key}` as const];
                    const modelAnswer = item[`modelAnswer${part.key}` as const];
                    const userAnswer = item[`answer${part.key}` as const];
                    const score = item[`score${part.key}` as const];
                    return (
                      <div key={part.key} className="border-t pt-3 first:border-t-0 first:pt-0">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-medium">{part.label}</p>
                          <Badge variant="outline" className="text-xs">
                            {score}/{part.max}
                          </Badge>
                        </div>
                        <p className="mb-1.5 text-xs text-muted-foreground">
                          <MathText text={questionText} />
                        </p>
                        <p className="mb-1 text-sm">
                          <span className="text-muted-foreground">তোমার উত্তর: </span>
                          {userAnswer ? (
                            <MathText text={userAnswer} />
                          ) : (
                            <span className="italic text-muted-foreground">উত্তর দেওয়া হয়নি</span>
                          )}
                        </p>
                        {modelAnswer && (
                          <p className="text-sm text-violet-700 dark:text-violet-500">
                            <span className="text-muted-foreground">মডেল উত্তর: </span>
                            <MathText text={modelAnswer} />
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </ResultShell>
  );
}

export function LiveExamResult({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/live-exam/${sessionId}/result`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "ফলাফল পাওয়া যায়নি");
          return;
        }
        setData(json);
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-destructive">{error ?? "ফলাফল পাওয়া যায়নি"}</p>
        <Button render={<Link href="/live-exam" />} variant="link">ফিরে যাও</Button>
      </div>
    );
  }

  if (isCqResult(data)) {
    return <CqResultView data={data} />;
  }

  return <McqResultView sessionId={sessionId} data={data} />;
}
