"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Timer, CheckCircle2, AlertCircle, Trophy, RotateCcw, Sparkles } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface DrillQuestion {
  id: number;
  category: "English" | "GK";
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const MEDICAL_DRILL_QUESTIONS: DrillQuestion[] = [
  { id: 1, category: "English", question: "Choose the correct preposition: He is devoid ___ common sense.", options: ["of", "from", "with", "in"], correctIdx: 0, explanation: "'Devoid of' একটি উপযুক্ত Appropriate Preposition যার অর্থ 'বর্জিত' বা 'শূন্য'।" },
  { id: 2, category: "English", question: "What is the synonym of 'CANDID'?", options: ["Frank", "Secretive", "Shy", "Cruel"], correctIdx: 0, explanation: "'Candid' অর্থ অকপট, স্পষ্টবাদী বা সরল। এর সমার্থক শব্দ হলো 'Frank' বা 'Outspoken'।" },
  { id: 3, category: "GK", question: "বাংলাদেশের সংবিধানের কত নম্বর অনুচ্ছেদে 'স্বাস্থ্য ও শিক্ষা' সংক্রান্ত বিধান রয়েছে?", options: ["১৮ নম্বর", "১৫ নম্বর", "২১ নম্বর", "২৭ নম্বর"], correctIdx: 0, explanation: "সংবিধানের ১৮(১) অনুচ্ছেদে জনস্বাস্থ্য ও নৈতিকতা এবং পুষ্টির মাত্রা অর্জনের কথা বলা হয়েছে।" },
  { id: 4, category: "GK", question: "মুক্তিযুদ্ধের সময় 'মুজিবনগর সরকার' কত তারিখে শপথ গ্রহণ করে?", options: ["১৭ এপ্রিল ১৯৭১", "১০ এপ্রিল ১৯৭১", "২৬ মার্চ ১৯৭১", "২৫ মার্চ ১৯৭১"], correctIdx: 0, explanation: "১০ এপ্রিল মুজিবনগর সরকার গঠিত হয় এবং ১৭ এপ্রিল মেহেরপুরের বৈদ্যনাথতলায় শপথ গ্রহণ করে।" },
  { id: 5, category: "English", question: "Identify the correct spelling:", options: ["Hemorrhage", "Hemorhage", "Hemorage", "Haemorhage"], correctIdx: 0, explanation: "'Hemorrhage' (রক্তক্ষরণ) শব্দটি মেডিকেল ভর্তি পরীক্ষায় বারবার আসা একটি স্পেলিং।" },
];

export function MedicalGKDrill() {
  const [answers, setAnswers] = useState<{ [qId: number]: number }>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 mins

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
    setTimeLeft(300);
  };

  let correctCount = 0;
  let wrongCount = 0;
  MEDICAL_DRILL_QUESTIONS.forEach((q) => {
    const userAns = answers[q.id];
    if (userAns !== undefined) {
      if (userAns === q.correctIdx) correctCount++;
      else wrongCount++;
    }
  });

  const totalScore = correctCount - wrongCount * 0.25;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-rose-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>মেডিকেল ভর্তি GK ও ইংলিশ স্পিড ড্রিল</span>
                  <Badge variant="secondary" className="text-xs">
                    MAT 25-Marks Section
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষার ২৫ নম্বরের (ইংরেজি ১৫ + জিকে ১০) স্পিড টেস্ট
                </p>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-xs gap-1.5 px-3 py-1.5">
              <Timer className="h-3.5 w-3.5 text-rose-500" />
              <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} মিনিট বাকি</span>
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Drill Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Questions Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {MEDICAL_DRILL_QUESTIONS.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = isFinished && userAns === q.correctIdx;
            const isWrong = isFinished && userAns !== undefined && userAns !== q.correctIdx;

            return (
              <Card key={q.id} className="border shadow-2xs p-4 sm:p-5 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-3xs font-semibold">
                    {q.category}
                  </Badge>
                  <span className="font-mono text-2xs text-muted-foreground">প্রশ্ন {idx + 1}</span>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  {q.question}
                </h4>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAns === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={cn(
                          "rounded-xl border p-3 text-left text-xs font-semibold transition flex items-center justify-between",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs border-primary"
                            : "bg-muted/20 hover:bg-muted/40",
                          isFinished && optIdx === q.correctIdx && "bg-emerald-500 text-white border-emerald-600",
                          isFinished && isSelected && optIdx !== q.correctIdx && "bg-rose-500 text-white border-rose-600"
                        )}
                      >
                        <span>{opt}</span>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-white ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {isFinished && (
                  <div className="rounded-lg bg-muted/30 p-2.5 text-2xs text-muted-foreground border-t">
                    <span className="font-bold text-primary">ব্যাখ্যা: </span>
                    {q.explanation}
                  </div>
                )}
              </Card>
            );
          })}

          <div className="flex justify-end gap-3 pt-2">
            {isFinished ? (
              <Button onClick={handleReset} className="gap-2 font-bold">
                <RotateCcw className="h-4 w-4" />
                <span>আবার প্র্যাকটিস করুন</span>
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2 font-bold bg-rose-600 hover:bg-rose-700 text-white">
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
              <span>মেডিকেল স্কোর কার্ড</span>
            </CardTitle>

            {isFinished ? (
              <div className="space-y-3">
                <div className="rounded-xl border bg-primary/5 p-4 text-center space-y-1">
                  <div className="text-2xs text-muted-foreground uppercase font-bold">প্রাপ্ত স্কোর (নেগেটিভসহ)</div>
                  <div className="text-3xl font-black text-primary font-mono">{totalScore.toFixed(2)} / {MEDICAL_DRILL_QUESTIONS.length}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border bg-emerald-500/10 p-2.5">
                    <div className="text-2xs text-muted-foreground">সঠিক</div>
                    <div className="font-bold text-emerald-600 text-lg">{correctCount}</div>
                  </div>
                  <div className="rounded-xl border bg-rose-500/10 p-2.5">
                    <div className="text-2xs text-muted-foreground">ভুল (-০.২৫)</div>
                    <div className="font-bold text-rose-600 text-lg">{wrongCount}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>মেডিকেল ভর্তি পরীক্ষায় ইংরেজি ও জিকে অংশটিই মূলত শিক্ষার্থীদের র‍্যাঙ্কিং ও চান্স পাওয়ার বড় পার্থক্য তৈরি করে দেয়।</p>
                <div className="rounded-xl border bg-muted/30 p-3 text-2xs space-y-1">
                  <div className="font-bold text-foreground">মার্কিং স্কিম:</div>
                  <div>• প্রতিটি সঠিক উত্তর: +১.০০</div>
                  <div>• প্রতিটি ভুল উত্তর: -০.২৫</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
