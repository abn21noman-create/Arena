"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Timer,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface MentalQuestion {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  shortcutHack: string;
}

const MENTAL_QUESTIONS: MentalQuestion[] = [
  {
    id: 1,
    question: "একটি দ্রবণে [H+] = 2 × 10⁻⁴ M হলে দ্রবণের pH কত? (log 2 ≈ 0.3)",
    options: ["৩.৭", "৪.৩", "৩.৩", "৪.৭"],
    correctIdx: 0,
    shortcutHack: "pH = b - log a = ৪ - log ২ = ৪ - ০.৩ = ৩.৭",
  },
  {
    id: 2,
    question: "√৫০ এর আসন্ন মান ক্যালকুলেটর ছাড়া কত হবে?",
    options: ["৭.০৭", "৭.৪৫", "৬.৯১", "৭.৯২"],
    correctIdx: 0,
    shortcutHack: "√N ≈ √৪৯ + (৫০ - ৪৯)/(২×৭) = ৭ + ১/১৪ ≈ ৭ + ০.০৭১ = ৭.০৭১",
  },
  {
    id: 3,
    question: "একটি তেজস্ক্রিয় পদার্থের অর্ধায়ু ৪ দিন। ১৬ দিন পর প্রাথমিক পরিমাণের কত ভগ্নাংশ অবশিষ্ট থাকবে?",
    options: ["১/১৬", "১/৮", "১/৪", "১/৩২"],
    correctIdx: 0,
    shortcutHack: "অর্ধায়ুর সংখ্যা n = ১৬/৪ = ৪। অবশিষ্ট ভগ্নাংশ = (১/২)⁴ = ১/১৬",
  },
  {
    id: 4,
    question: "০.০৫ M H2SO4 দ্রবণের pH কত? (log 1 = 0)",
    options: ["১.০", "১.৩", "২.০", "০.৫"],
    correctIdx: 0,
    shortcutHack: "H2SO4 এর [H+] = ২ × ০.০৫ = ০.১ M = ১০⁻¹ M। তাই pH = -log(১০⁻¹) = ১.০",
  },
];

export function MentalMathDrill() {
  const [answers, setAnswers] = useState<{ [id: number]: number }>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60s Blitz

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isFinished && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      handleSubmit();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFinished, timeLeft]);

  const handleSelect = (qId: number, optIdx: number) => {
    if (isFinished) return;
    sfx.play("pop");
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    sfx.play("correct");
    triggerConfetti();
    setIsFinished(true);
  };

  const handleReset = () => {
    sfx.play("click");
    setAnswers({});
    setIsFinished(false);
    setTimeLeft(60);
  };

  let correctCount = 0;
  let wrongCount = 0;
  MENTAL_QUESTIONS.forEach((q) => {
    const userAns = answers[q.id];
    if (userAns !== undefined) {
      if (userAns === q.correctIdx) correctCount++;
      else wrongCount++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>নন-ক্যালকুলেটর মেন্টাল ম্যাথ ও এডমিশন স্পিড হ্যাকস</span>
                  <Badge variant="secondary" className="text-xs">
                    DU A-Unit & Medical V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ক্যালকুলেটর ছাড়া pH নির্ণয়, আসন্ন বর্গমূল এবং সেকেন্ডে তেজস্ক্রিয় ক্ষয় হিসাব করার শর্টকাট ড্রিল
                </p>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-xs gap-1.5 px-3 py-1.5">
              <Timer className="h-3.5 w-3.5 text-rose-500" />
              <span>{timeLeft}s বাকি</span>
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Questions (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {MENTAL_QUESTIONS.map((q, idx) => {
            const userAns = answers[q.id];
            return (
              <Card key={q.id} className="border shadow-2xs p-4 sm:p-5 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xs text-muted-foreground">প্রশ্ন {idx + 1}</span>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  {q.question}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAns === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={cn(
                          "rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-between",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted/20 hover:bg-muted/40",
                          isFinished && optIdx === q.correctIdx && "bg-emerald-500 text-white border-emerald-600",
                          isFinished && isSelected && optIdx !== q.correctIdx && "bg-rose-500 text-white border-rose-600"
                        )}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isFinished && (
                  <div className="rounded-lg bg-muted/30 p-2.5 text-2xs text-muted-foreground border-t">
                    <span className="font-bold text-amber-500">শর্টকাট হ্যাক: </span>
                    {q.shortcutHack}
                  </div>
                )}
              </Card>
            );
          })}

          <div className="flex justify-end gap-3 pt-2">
            {isFinished ? (
              <Button onClick={handleReset} className="gap-2 font-bold">
                <RotateCcw className="h-4 w-4" />
                <span>পুনরায় চেষ্টা করুন</span>
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2 font-bold bg-amber-600 hover:bg-amber-700 text-white">
                <CheckCircle2 className="h-4 w-4" />
                <span>ড্রিল সাবমিট করুন</span>
              </Button>
            )}
          </div>
        </div>

        {/* Results Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4 sticky top-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>স্পিড স্কোরকার্ড</span>
            </CardTitle>

            {isFinished ? (
              <div className="space-y-3">
                <div className="rounded-xl border bg-primary/5 p-4 text-center space-y-1">
                  <div className="text-2xs text-muted-foreground uppercase font-bold">সঠিক উত্তর</div>
                  <div className="text-3xl font-black text-primary font-mono">{correctCount} / {MENTAL_QUESTIONS.length}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground space-y-2">
                <p>ঢাকা বিশ্ববিদ্যালয় ক-ইউনিট ও মেডিকেল ভর্তি পরীক্ষায় ক্যালকুলেটর ব্যবহার নিষিদ্ধ থাকায় এই শর্টকাটগুলো সময় বাঁচিয়ে শীর্ষে থাকতে সাহায্য করে।</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
