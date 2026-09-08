"use client";

// ===================================================================
// CQ Runner — সৃজনশীল প্রশ্নের উত্তর লেখার মূল UI
// -------------------------------------------------------------------
// একটা চ্যাপ্টারের সব CQ প্রশ্ন এক এক করে দেখায়, ইউজার ক/খ/গ/ঘ এর
// উত্তর টেক্সট আকারে লেখে, তারপর AI দিয়ে মূল্যায়ন করানো হয়।
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ChevronRight, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { MathText } from "@/components/shared/math-text";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { HandwrittenAnswerButton } from "@/components/shared/handwritten-answer-button";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

interface CQQuestion {
  id: string;
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
  boardYear: number | null;
  boardName: string | null;
}

export function CQRunner({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [questions, setQuestions] = useState<CQQuestion[]>([]);
  // প্রতিটা CQ আলাদাভাবে সাবমিট করে সাথে সাথে ফলাফল দেখানো হয় (তাই navigation state লাগে না)
  const [currentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState({ a: "", b: "", c: "", d: "" });

  const loadCQ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cq/chapter/${chapterId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "CQ প্রশ্ন লোড করা যায়নি");
        return;
      }

      setChapterName(data.chapterName);
      setQuestions(data.cqQuestions);
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    void loadCQ();
  }, [loadCQ]);

  const currentQuestion = questions[currentIndex];

  async function handleSubmit() {
    if (!currentQuestion) return;
    const hasAnyAnswer =
      answers.a.trim() || answers.b.trim() || answers.c.trim() || answers.d.trim();
    if (!hasAnyAnswer) {
      toast.error("অন্তত একটা প্রশ্নের উত্তর লেখো");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/cq/${currentQuestion.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerA: answers.a,
          answerB: answers.b,
          answerC: answers.c,
          answerD: answers.d,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "জমা দিতে সমস্যা হয়েছে");
        setSubmitting(false);
        return;
      }

      showNewBadgeToasts(data.newBadges);
      router.push(`/cq-practice/result/${data.attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">CQ প্রশ্ন লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button render={<Link href="/cq-practice" />} variant="outline">ফিরে যাও</Button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/cq-practice`} className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{chapterName}</p>
          <p className="text-sm font-medium">
            CQ {currentIndex + 1} / {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(currentQuestion.boardYear || currentQuestion.boardName) && (
            <Badge variant="secondary" className="text-xs gap-1 shrink-0">
              📅 {currentQuestion.boardName} {currentQuestion.boardYear ?? ""}
            </Badge>
          )}
          <AcademicReportButton targetType="CQ" targetId={currentQuestion.id} compact />
        </div>
      </div>

      <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 mb-6" />

      {/* Stimulus */}
      <Card className="p-5 mb-4 bg-muted/40">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            <MathText text={currentQuestion.stimulus} />
          </p>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentQuestion.questionA} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) =>
                  setAnswers((prev) => ({
                    ...prev,
                    a: prev.a ? `${prev.a} ${transcript}` : transcript,
                  }))
                }
              />
              <HandwrittenAnswerButton
                onResult={(text) =>
                  setAnswers((prev) => ({
                    ...prev,
                    a: prev.a ? `${prev.a} ${text}` : text,
                  }))
                }
              />
            </div>
          </div>
          <Textarea
            placeholder="তোমার উত্তর লেখো..."
            aria-label="ক নং প্রশ্নের উত্তর"
            value={answers.a}
            onChange={(e) => setAnswers({ ...answers, a: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentQuestion.questionB} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) =>
                  setAnswers((prev) => ({
                    ...prev,
                    b: prev.b ? `${prev.b} ${transcript}` : transcript,
                  }))
                }
              />
              <HandwrittenAnswerButton
                onResult={(text) =>
                  setAnswers((prev) => ({
                    ...prev,
                    b: prev.b ? `${prev.b} ${text}` : text,
                  }))
                }
              />
            </div>
          </div>
          <Textarea
            placeholder="তোমার উত্তর লেখো..."
            aria-label="খ নং প্রশ্নের উত্তর"
            value={answers.b}
            onChange={(e) => setAnswers({ ...answers, b: e.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentQuestion.questionC} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) =>
                  setAnswers((prev) => ({
                    ...prev,
                    c: prev.c ? `${prev.c} ${transcript}` : transcript,
                  }))
                }
              />
              <HandwrittenAnswerButton
                onResult={(text) =>
                  setAnswers((prev) => ({
                    ...prev,
                    c: prev.c ? `${prev.c} ${text}` : text,
                  }))
                }
              />
            </div>
          </div>
          <Textarea
            placeholder="তোমার উত্তর লেখো..."
            aria-label="গ নং প্রশ্নের উত্তর"
            value={answers.c}
            onChange={(e) => setAnswers({ ...answers, c: e.target.value })}
            rows={4}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="text-sm font-medium">
              <MathText text={currentQuestion.questionD} />
            </Label>
            <div className="flex items-center gap-1.5 shrink-0">
              <VoiceInputButton
                onResult={(transcript) =>
                  setAnswers((prev) => ({
                    ...prev,
                    d: prev.d ? `${prev.d} ${transcript}` : transcript,
                  }))
                }
              />
              <HandwrittenAnswerButton
                onResult={(text) =>
                  setAnswers((prev) => ({
                    ...prev,
                    d: prev.d ? `${prev.d} ${text}` : text,
                  }))
                }
              />
            </div>
          </div>
          <Textarea
            placeholder="তোমার উত্তর লেখো..."
            aria-label="ঘ নং প্রশ্নের উত্তর"
            value={answers.d}
            onChange={(e) => setAnswers({ ...answers, d: e.target.value })}
            rows={5}
          />
        </div>
      </div>

      <Button className="w-full gap-2 mt-6" size="lg" disabled={submitting} onClick={handleSubmit}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            AI মূল্যায়ন করছে...
          </>
        ) : (
          <>
            জমা দাও ও মূল্যায়ন দেখো
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
