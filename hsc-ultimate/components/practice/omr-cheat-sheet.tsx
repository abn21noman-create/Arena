"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, CheckCircle2, AlertCircle, Timer, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

const ANSWER_KEY = ["A", "B", "C", "D", "A", "C", "B", "A", "D", "B", "C", "A", "D", "C", "B", "A", "C", "D", "B", "A", "B", "D", "C", "A", "D"];

export function OMRCheatSheet() {
  const [activeTab, setActiveTab] = useState<"omr" | "cheatsheet">("omr");

  // OMR State
  const [filledAnswers, setFilledAnswers] = useState<{ [qIndex: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer loop
  useEffect(() => {
    if (!isSubmitted) {
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSubmitted]);

  const handleBubbleClick = (idx: number, opt: string) => {
    if (isSubmitted) return;
    sfx.play("pop");
    setFilledAnswers((prev) => ({ ...prev, [idx]: opt }));
  };

  // Keyboard listener for PC users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || activeTab !== "omr") return;
      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        // find first unanswered question index
        let targetIdx = 0;
        for (let i = 0; i < 25; i++) {
          if (!filledAnswers[i]) {
            targetIdx = i;
            break;
          }
        }
        handleBubbleClick(targetIdx, key);
      } else if (["1", "2", "3", "4"].includes(key)) {
        const mapNum: Record<string, string> = { "1": "A", "2": "B", "3": "C", "4": "D" };
        let targetIdx = 0;
        for (let i = 0; i < 25; i++) {
          if (!filledAnswers[i]) {
            targetIdx = i;
            break;
          }
        }
        handleBubbleClick(targetIdx, mapNum[key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filledAnswers, isSubmitted, activeTab]);

  const handleSubmitOMR = () => {
    sfx.play("correct");
    triggerConfetti();
    setIsSubmitted(true);
  };

  const handleResetOMR = () => {
    sfx.play("click");
    setFilledAnswers({});
    setIsSubmitted(false);
    setElapsedSec(0);
  };

  // Grading
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < 25; i++) {
    const filled = filledAnswers[i];
    if (!filled) skippedCount++;
    else if (filled === ANSWER_KEY[i]) correctCount++;
    else wrongCount++;
  }

  const score = correctCount - wrongCount * 0.25;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>OMR বুদ্বুদ ট্রেইনার ও ফর্মুলা চিট-শিট</span>
                  <Badge variant="secondary" className="text-xs">
                    Exam Speed Tools
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  বাস্তব বোর্ড পরীক্ষার OMR বৃত্ত ভরাট স্পিড প্র্যাকটিস এবং পরীক্ষার আগের রাতের চিট-শিট
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveTab("omr");
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  activeTab === "omr"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                OMR শিট সিমুলেটর
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveTab("cheatsheet");
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  activeTab === "cheatsheet"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                প্রিন্ট-রেডি চিট-শিট
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* OMR Mode */}
      {activeTab === "omr" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* OMR Sheet (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border shadow-2xs p-4 sm:p-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
              <div className="border-b pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base">HSC BOARD OMR ANSWER SHEET</h3>
                  <p className="text-2xs text-muted-foreground">বহু নির্বাচনী উত্তরপত্র (২৫ টি প্রশ্ন)</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs gap-1">
                    <Timer className="h-3.5 w-3.5 text-primary" />
                    <span>{Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s</span>
                  </Badge>
                </div>
              </div>

              {/* Bubbles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {Array.from({ length: 25 }).map((_, idx) => {
                  const filled = filledAnswers[idx];
                  const correct = ANSWER_KEY[idx];
                  const isCorrect = filled === correct;
                  const isWrong = isSubmitted && filled && filled !== correct;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border text-xs transition",
                        isSubmitted && isCorrect && "bg-emerald-500/10 border-emerald-500/30",
                        isSubmitted && isWrong && "bg-rose-500/10 border-rose-500/30"
                      )}
                    >
                      <span className="font-mono font-bold w-6 text-muted-foreground">
                        {idx + 1}.
                      </span>

                      {/* Options A, B, C, D */}
                      <div className="flex items-center gap-2.5">
                        {["A", "B", "C", "D"].map((opt) => {
                          const isSelected = filled === opt;

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleBubbleClick(idx, opt)}
                              className={cn(
                                "h-6 w-6 rounded-full border-2 flex items-center justify-center font-bold text-2xs transition-all",
                                isSelected
                                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-xs"
                                  : "border-zinc-400 hover:border-zinc-700 dark:border-zinc-600"
                              )}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isSubmitted && (
                        <div className="w-6 text-right">
                          {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />}
                          {isWrong && <AlertCircle className="h-4 w-4 text-rose-500 inline" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                {isSubmitted ? (
                  <Button onClick={handleResetOMR} className="gap-2 font-bold">
                    <RotateCcw className="h-4 w-4" />
                    <span>নতুন OMR টেস্ট দিন</span>
                  </Button>
                ) : (
                  <Button onClick={handleSubmitOMR} className="gap-2 font-bold px-6">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>OMR সাবমিট ও স্কোর দেখুন</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* OMR Results Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border shadow-xs p-5 space-y-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span>OMR স্পিড ও নির্ভুলতা বিশ্লেষণ</span>
              </CardTitle>

              {isSubmitted ? (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-primary/5 p-4 text-center space-y-1">
                    <div className="text-2xs text-muted-foreground uppercase font-bold">চূড়ান্ত প্রাপ্ত নম্বর</div>
                    <div className="text-4xl font-black text-primary font-mono">{score.toFixed(2)} / 25</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      সময় লেগেছে: {Math.floor(elapsedSec / 60)} মিনিট {elapsedSec % 60} সেকেন্ড
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl border bg-emerald-500/10 p-2.5">
                      <div className="text-2xs text-muted-foreground">সঠিক</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{correctCount}</div>
                    </div>
                    <div className="rounded-xl border bg-rose-500/10 p-2.5">
                      <div className="text-2xs text-muted-foreground">ভুল (-০.২৫)</div>
                      <div className="font-bold text-rose-600 dark:text-rose-400 text-lg">{wrongCount}</div>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-2.5">
                      <div className="text-2xs text-muted-foreground">বাদ দেওয়া</div>
                      <div className="font-bold text-muted-foreground text-lg">{skippedCount}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                  <p>
                    বোর্ড পরীক্ষার বহু নির্বাচনী অংশে ২৫টি বৃত্ত ভরাটের জন্য সময় থাকে ২৫ মিনিট। গড়ে প্রতি প্রশ্নে ৫০-৫৫ সেকেন্ড সময় পাওয়া যায়।
                  </p>
                  <p className="font-semibold text-foreground">
                    💡 স্পিড হ্যাক: প্রশ্ন দাগানোর সাথে সাথেই OMR বৃত্ত ভরাট করুন, শেষে একসাথে ভরাট করতে গিয়ে ভুল হওয়ার আশঙ্কা থাকে।
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Printable Cheat-Sheet Mode */}
      {activeTab === "cheatsheet" && (
        <Card className="border shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold">HSC পদার্থবিজ্ঞান ও উচ্চতর গণিত চিট-শিট</h3>
              <p className="text-xs text-muted-foreground">পরীক্ষার আগের রাতের দ্রুত রিভিশনের জন্য ১০০% প্রমিত সূত্র তালিকা</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-bold"
              onClick={() => {
                sfx.play("click");
                window.print();
              }}
            >
              <Printer className="h-4 w-4" />
              <span>প্রিন্ট / PDF সেভ করুন</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border p-4 space-y-2.5 bg-card">
              <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>পদার্থবিজ্ঞান ১ম পত্র: গতিবিদ্যা ও বলবিদ্যা</span>
              </h4>
              <ul className="space-y-1.5 font-mono text-xs">
                <li>• সর্বোচ্চ উচ্চতা: H = (v₀² sin² θ) / (2g)</li>
                <li>• অনুভূমিক পাল্লা: R = (v₀² sin 2θ) / g</li>
                <li>• সর্বাধিক পাল্লার শর্ত: θ = 45° ⇒ R_max = v₀² / g</li>
                <li>• রাস্তার ব্যাংকিং কোণ: tan θ = v² / (rg)</li>
                <li>• চক্রগতির ব্যাসার্ধ: k = √(I / M)</li>
                <li>• নিরেট গোলকের জড়তার ভ্রামক: I = (2/5)MR²</li>
              </ul>
            </div>

            <div className="rounded-xl border p-4 space-y-2.5 bg-card">
              <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>উচ্চতর গণিত ১ম পত্র: ক্যালকুলাস ও ত্রিকোণমিতি</span>
              </h4>
              <ul className="space-y-1.5 font-mono text-xs">
                <li>• d/dx (sin x) = cos x, d/dx (tan x) = sec² x</li>
                <li>• d/dx (ln x) = 1/x, d/dx (aˣ) = aˣ ln a</li>
                <li>• ∫ sec² x dx = tan x + c, ∫ 1/x dx = ln|x| + c</li>
                <li>• স্পর্শকের সমীকরণ: y - y₁ = m(x - x₁), m = dy/dx</li>
                <li>• চরম মান: dy/dx = 0, d²y/dx² &lt; 0 (গুরুমান)</li>
                <li>• উপবৃত্তের উৎকেন্দ্রিকতা: e = √(1 - b²/a²) (a &gt; b)</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
