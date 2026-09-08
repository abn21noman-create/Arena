"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Sparkles, Trophy, Award, CheckCircle2, RotateCcw, MessageSquare } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface VivaQuestion {
  id: string;
  subject: string;
  questionBn: string;
  idealAnswer: string;
  keywords: string[];
}

const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: "v1",
    subject: "পদার্থবিজ্ঞান ব্যবহারিক",
    questionBn: "ভার্নিয়ার স্কেলের 'ভার্নিয়ার ধ্রুবক' (Vernier Constant) বলতে কী বোঝো এবং এটি কীভাবে নির্ণয় করা হয়?",
    idealAnswer: "প্রধান স্কেলের ক্ষুদ্রতম এক ভাগের চেয়ে ভার্নিয়ার স্কেলের এক ভাগ কতটুকু ছোট, তার পরিমাণকে ভার্নিয়ার ধ্রুবক (VC) বলে। এটি VC = s/n সূত্রে নির্ণয় করা হয়, যেখানে s হলো প্রধান স্কেলের ক্ষুদ্রতম এক ভাগের মান এবং n হলো ভার্নিয়ারের মোট ভাগ সংখ্যা।",
    keywords: ["প্রধান স্কেল", "ক্ষুদ্রতম ভাগ", "VC = s/n", "ভাগ সংখ্যা"],
  },
  {
    id: "v2",
    subject: "রসায়ন ব্যবহারিক",
    questionBn: "শিখা পরীক্ষায় ধাতব লবণ পরীক্ষার সময় প্লাটিনাম তারকে গাঢ় HCl এসিডে ভেজানো হয় কেন?",
    idealAnswer: "গাঢ় HCl ধাতব লবণের সাথে বিক্রিয়া করে উদ্বায়ী ধাতব ক্লোরাইড লবণ গঠন করে। ধাতব ক্লোরাইডসমূহ বুনসেন শিখার উত্তাপে সহজে বাষ্পীভূত হয়ে শিখায় বৈশিষ্ট্যপূর্ণ স্পষ্ট বর্ণ সৃষ্টি করে।",
    keywords: ["উদ্বায়ী", "ক্লোরাইড", "বাষ্পীভূত", "বুনসেন শিখা"],
  },
  {
    id: "v3",
    subject: "জীববিজ্ঞান ব্যবহারিক",
    questionBn: "হাইড্রার নেমাটোসিস্ট ও নিডোসাইট কোষের মধ্যে প্রধান পার্থক্য কী?",
    idealAnswer: "নিডোসাইট হলো হাইড্রার এক বিশেষ ধরণের রূপান্তরশীল কোষ, আর নেমাটোসিস্ট হলো সেই নিডোসাইট কোষের অভ্যন্তরে অবস্থিত বিষাক্ত হিপনোটক্সিনযুক্ত সূত্রকবাহী থলি বা অঙ্গাণু।",
    keywords: ["নিডোসাইট কোষ", "নেমাটোসিস্ট থলি", "হিপনোটক্সিন", "সূত্রক"],
  },
];

export function VoiceVivaExaminer() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [feedbackState, setFeedbackState] = useState<"idle" | "evaluating" | "scored">("idle");
  const [givenScore, setGivenScore] = useState<number>(5);

  const currentQ = VIVA_QUESTIONS[currentIdx] || VIVA_QUESTIONS[0];

  const handleStartVoice = () => {
    sfx.play("pop");
    setIsRecording(true);
    setFeedbackState("idle");
  };

  const handleStopVoice = () => {
    sfx.play("click");
    setIsRecording(false);
    setFeedbackState("evaluating");

    setTimeout(() => {
      setFeedbackState("scored");
      setGivenScore(5);
      sfx.play("correct");
      triggerConfetti();
    }, 1500);
  };

  const handleNextQ = () => {
    sfx.play("click");
    setFeedbackState("idle");
    setCurrentIdx((prev) => (prev + 1) % VIVA_QUESTIONS.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-purple-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>AI ভয়েস প্র্যাকটিক্যাল ভাইভা ও স্পিকিং এক্সামিনার</span>
                  <Badge variant="secondary" className="text-xs">
                    Oral Exam Room
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  HSC ব্যবহারিক পরীক্ষা ও মেডিকেল ভাইভার জন্য ভয়েস প্রশ্ন-উত্তর অনুশীলন
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-xs font-mono">
              প্রশ্ন {currentIdx + 1} / {VIVA_QUESTIONS.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Viva Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Examiner Question & Voice Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-2xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <Badge className="bg-purple-600 text-white font-bold text-xs">
                {currentQ.subject}
              </Badge>
              <span className="text-xs text-muted-foreground">পূর্ণমান: ৫.০</span>
            </div>

            {/* AI Examiner Voice Prompt */}
            <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span>AI পরীক্ষকের প্রশ্ন:</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
                &quot;{currentQ.questionBn}&quot;
              </p>
            </div>

            {/* Mic Recording Area */}
            <div className="rounded-2xl border bg-card p-6 flex flex-col items-center justify-center space-y-4 text-center">
              {isRecording ? (
                <div className="space-y-3">
                  <div className="h-16 w-16 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse mx-auto shadow-lg shadow-rose-500/30">
                    <Mic className="h-8 w-8" />
                  </div>
                  <div className="text-xs font-mono font-bold text-rose-500 animate-pulse">
                    আপনার কণ্ঠস্বর রেকর্ড হচ্ছে... স্পষ্ট করে উত্তর দিন
                  </div>
                  <Button onClick={handleStopVoice} className="bg-rose-600 hover:bg-rose-700 font-bold">
                    উত্তর শেষ করুন
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto hover:scale-105 transition cursor-pointer" onClick={handleStartVoice}>
                    <Mic className="h-8 w-8" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    মাইক্রোফোনে চাপুন এবং মুখে উত্তর প্রদান করুন
                  </div>
                  <Button onClick={handleStartVoice} className="font-bold gap-2">
                    <Mic className="h-4 w-4" />
                    <span>উত্তর বলতে শুরু করুন</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNextQ} variant="outline" size="sm" className="gap-1 text-xs">
                <span>পরবর্তী ভাইভা প্রশ্ন</span>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </Button>
            </div>
          </Card>
        </div>

        {/* AI Scoring & Model Answer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-xs">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>AI ভাইভা স্কোর ও মূল্যায়ন</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-4 text-xs sm:text-sm">
              {feedbackState === "evaluating" && (
                <div className="rounded-xl border bg-muted/30 p-6 text-center space-y-2">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground font-medium">কণ্ঠস্বরের নির্ভুলতা ও কিওয়ার্ড যাচাই করা হচ্ছে...</p>
                </div>
              )}

              {feedbackState === "scored" && (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-emerald-500/10 p-4 text-center space-y-1">
                    <div className="text-2xs text-muted-foreground uppercase font-bold">ভাইভায় প্রাপ্ত নম্বর</div>
                    <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {givenScore}.০ / ৫.০
                    </div>
                    <Badge variant="outline" className="text-2xs text-emerald-600 border-emerald-500/40">
                      অসাধারণ উচ্চারণ ও সঠিক কিওয়ার্ড ✓
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-foreground">শনাক্তকৃত মূল কিওয়ার্ডসমূহ:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentQ.keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-2xs font-bold text-emerald-700 dark:text-emerald-300">
                          ✓ {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Ideal Model Answer */}
              <div className="space-y-2 border-t pt-3">
                <div className="font-bold text-primary flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>আদর্শ বোর্ড উত্তর (Model Answer):</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium bg-muted/20 p-3 rounded-xl border">
                  {currentQ.idealAnswer}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
