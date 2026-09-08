"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Target,
  Play,
  Layers,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound-effects";
import { toast } from "sonner";

interface SubjectChapterTree {
  id: string;
  name: string;
  colorHex: string;
  chapters: Array<{ id: string; name: string; questionCount: number }>;
}

const SAMPLE_CURRICULUM: SubjectChapterTree[] = [
  {
    id: "physics-1",
    name: "পদার্থবিজ্ঞান ১ম পত্র",
    colorHex: "#3b82f6",
    chapters: [
      { id: "p1-c2", name: "২য় অধ্যায়: ভেক্টর", questionCount: 45 },
      { id: "p1-c3", name: "৩য় অধ্যায়: গতিবিদ্যা", questionCount: 40 },
      { id: "p1-c4", name: "৪র্থ অধ্যায়: নিউটনিয়ান বলবিদ্যা", questionCount: 50 },
      { id: "p1-c5", name: "৫ম অধ্যায়: কাজ, শক্তি ও ক্ষমতা", questionCount: 35 },
      { id: "p1-c6", name: "৬ষ্ঠ অধ্যায়: মহাকর্ষ ও অভিকর্ষ", questionCount: 42 },
    ],
  },
  {
    id: "chemistry-1",
    name: "রসায়ন ১ম পত্র",
    colorHex: "#10b981",
    chapters: [
      { id: "c1-c2", name: "২য় অধ্যায়: গুণগত রসায়ন", questionCount: 48 },
      { id: "c1-c3", name: "৩য় অধ্যায়: পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন", questionCount: 52 },
      { id: "c1-c4", name: "৪র্থ অধ্যায়: রাসায়নিক পরিবর্তন", questionCount: 44 },
      { id: "c1-c5", name: "৫ম অধ্যায়: কর্মমুখী রসায়ন", questionCount: 30 },
    ],
  },
  {
    id: "math-1",
    name: "উচ্চতর গণিত ১ম পত্র",
    colorHex: "#8b5cf6",
    chapters: [
      { id: "m1-c1", name: "১ম অধ্যায়: ম্যাট্রিক্স ও নির্ণায়ক", questionCount: 40 },
      { id: "m1-c3", name: "৩য় অধ্যায়: সরলরেখা", questionCount: 55 },
      { id: "m1-c7", name: "৭ম অধ্যায়: সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত", questionCount: 46 },
      { id: "m1-c9", name: "৯ম অধ্যায়: অন্তরীকরণ", questionCount: 60 },
      { id: "m1-c10", name: "১০ম অধ্যায়: যোগজীকরণ", questionCount: 58 },
    ],
  },
  {
    id: "biology-1",
    name: "জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)",
    colorHex: "#06b6d4",
    chapters: [
      { id: "b1-c1", name: "১ম অধ্যায়: কোষ ও এর গঠন", questionCount: 42 },
      { id: "b1-c2", name: "২য় অধ্যায়: কোষ বিভাজন", questionCount: 38 },
      { id: "b1-c4", name: "৪র্থ অধ্যায়: অণুজীব", questionCount: 35 },
      { id: "b1-c9", name: "৯ম অধ্যায়: উদ্ভিদ শারীরতত্ত্ব", questionCount: 48 },
    ],
  },
];

export function CustomExamBuilder() {
  const router = useRouter();
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(
    new Set(["p1-c2", "c1-c2", "m1-c1"])
  );
  const [questionCount, setQuestionCount] = useState(25);
  const [timeMinutes, setTimeMinutes] = useState(25);
  const [negativeMarking, setNegativeMarking] = useState<0 | 0.25>(0);
  const [onlyBoardQuestions, setOnlyBoardQuestions] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const toggleChapter = (chapterId: string) => {
    sfx.play("click");
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const selectAllInSubject = (subject: SubjectChapterTree) => {
    sfx.play("click");
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      const allSelected = subject.chapters.every((c) => next.has(c.id));
      subject.chapters.forEach((c) => {
        if (allSelected) next.delete(c.id);
        else next.add(c.id);
      });
      return next;
    });
  };

  const handleStartExam = () => {
    if (selectedChapters.size === 0) {
      toast.error("অনুগ্রহ করে অন্তত ১টি অধ্যায় নির্বাচন করুন");
      return;
    }

    setIsStarting(true);
    sfx.play("streak");
    toast.success("কাস্টম মডেল টেস্ট প্রস্তুত হচ্ছে... 🚀");

    // Redirect to practice runner with custom configuration
    const chaptersParam = Array.from(selectedChapters).join(",");
    router.push(
      `/adaptive-practice/run?custom=true&chapters=${chaptersParam}&count=${questionCount}&time=${timeMinutes}&neg=${negativeMarking}&boardOnly=${onlyBoardQuestions}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button render={<Link href="/practice" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              কাস্টম এক্সাম ক্রিয়েটর (Custom Exam Builder)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              একাধিক বিষয় ও অধ্যায় একসাথে মিলিয়ে নিজের মতো মডেল টেস্ট তৈরি করো
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chapter Selector Tree (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              অধ্যায়সমূহ নির্বাচন করুন
            </h2>
            <Badge variant="outline" className="text-xs">
              {selectedChapters.size}টি অধ্যায় নির্বাচিত
            </Badge>
          </div>

          <div className="space-y-3">
            {SAMPLE_CURRICULUM.map((sub) => {
              const selectedCount = sub.chapters.filter((c) =>
                selectedChapters.has(c.id)
              ).length;
              const isAllSelected = selectedCount === sub.chapters.length;

              return (
                <Card key={sub.id} className="overflow-hidden p-3.5">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: sub.colorHex }}
                      />
                      <span className="font-bold text-xs sm:text-sm">{sub.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectAllInSubject(sub)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {isAllSelected ? "সব বাতিল" : "সব নির্বাচন"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {sub.chapters.map((chap) => {
                      const isChecked = selectedChapters.has(chap.id);
                      return (
                        <label
                          key={chap.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition select-none",
                            isChecked
                              ? "border-primary bg-primary/10 font-semibold text-foreground shadow-2xs"
                              : "border-border/60 bg-muted/20 hover:bg-muted/50 text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleChapter(chap.id)}
                            />
                            <span>{chap.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {chap.questionCount} Qs
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Exam Settings & Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 sm:p-5 space-y-4 sticky top-6">
            <div className="border-b pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                পরীক্ষার নিয়মাবলী ও সময়
              </h3>
              <p className="text-xs text-muted-foreground">
                তোমার প্রস্তুতি ও গতি অনুযায়ী সেটিংস কাস্টমাইজ করো
              </p>
            </div>

            {/* Question Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                মোট প্রশ্ন সংখ্যা:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 15, 25, 50].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => {
                      sfx.play("click");
                      setQuestionCount(num);
                    }}
                    className={cn(
                      "py-1.5 rounded-lg border text-xs font-mono font-bold transition",
                      questionCount === num
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/30 hover:bg-muted"
                    )}
                  >
                    {num}টি
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                পরীক্ষার সময়সীমা:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 15, 25, 45].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => {
                      sfx.play("click");
                      setTimeMinutes(mins);
                    }}
                    className={cn(
                      "py-1.5 rounded-lg border text-xs font-mono font-bold transition",
                      timeMinutes === mins
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/30 hover:bg-muted"
                    )}
                  >
                    {mins} মিনিট
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Marking Mode */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">
                নেগেটিভ মার্কিং মোড:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setNegativeMarking(0);
                  }}
                  className={cn(
                    "p-2 rounded-xl border text-left transition",
                    negativeMarking === 0
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                      : "bg-card"
                  )}
                >
                  <span className="block font-bold text-xs text-foreground">
                    বোর্ড স্ট্যান্ডার্ড (০%)
                  </span>
                  <span className="block text-xs text-muted-foreground">ভুল উত্তরে নম্বর কাটা নেই</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setNegativeMarking(0.25);
                  }}
                  className={cn(
                    "p-2 rounded-xl border text-left transition",
                    negativeMarking === 0.25
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                      : "bg-card"
                  )}
                >
                  <span className="block font-bold text-xs text-foreground">
                    অ্যাডমিশন (-০.২৫)
                  </span>
                  <span className="block text-xs text-muted-foreground">মেডিকেল/ভার্সিটি নেগেটিভ</span>
                </button>
              </div>
            </div>

            {/* Board Only Filter */}
            <label className="flex items-center gap-2.5 p-2 rounded-lg border bg-muted/20 cursor-pointer text-xs select-none">
              <Checkbox
                checked={onlyBoardQuestions}
                onCheckedChange={(checked) => setOnlyBoardQuestions(Boolean(checked))}
              />
              <div>
                <span className="font-semibold block">শুধু বিগত বছরের বোর্ড প্রশ্ন</span>
                <span className="text-xs text-muted-foreground">
                  ঢাকা, চট্টগ্রাম, রাজশাহী ইত্যাদির বোর্ড প্রশ্ন প্রাধান্য পাবে
                </span>
              </div>
            </label>

            {/* Start CTA */}
            <Button
              className="w-full gap-2 h-11 text-base font-bold shadow-md shadow-primary/25"
              size="lg"
              disabled={selectedChapters.size === 0 || isStarting}
              onClick={handleStartExam}
            >
              <Play className="h-4 w-4 fill-current" />
              <span>পরীক্ষা শুরু করুন ({questionCount} Qs)</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
