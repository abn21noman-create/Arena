"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Target,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound-effects";
import { toast } from "sonner";

interface RecoveryDay {
  day: number;
  titleBangla: string;
  focusSubject: string;
  focusTopics: string[];
  tasks: Array<{ id: string; text: string; done?: boolean }>;
  practiceLink: string;
}

const DEFAULT_7_DAY_PLAN: RecoveryDay[] = [
  {
    day: 1,
    titleBangla: "দিন ১: পদার্থবিজ্ঞান ১ম পত্রের দুর্বল সূত্রাবলি",
    focusSubject: "পদার্থবিজ্ঞান ১ম",
    focusTopics: ["মহাকর্ষ ও অভিকর্ষ", "কাজ, শক্তি ও ক্ষমতা"],
    tasks: [
      { id: "d1-t1", text: "মহাকর্ষীয় বিভব ও মুক্তিবেগের সূত্র ৩ বার রিভাইজ করো" },
      { id: "d1-t2", text: "মিস্টেক ভল্ট থেকে পদার্থবিজ্ঞানের ৫টি ভুল MCQ পুনরায় সমাধান করো" },
    ],
    practiceLink: "/mistake-vault",
  },
  {
    day: 2,
    titleBangla: "দিন ২: রসায়ন ১ম পত্রের বিক্রিয়া ও দ্রাব্যতা",
    focusSubject: "রসায়ন ১ম",
    focusTopics: ["গুণগত রসায়ন (Ksp ও আয়নিক গুণফল)", "রাসায়নিক পরিবর্তন"],
    tasks: [
      { id: "d2-t1", text: "দ্রাব্যতা গুণফল ও অধঃক্ষেপণ শর্তাবলি ভালো করে দেখো" },
      { id: "d2-t2", text: "১০টি রসায়ন বোর্ডের বিগত বছরের প্রশ্ন প্র্যাকটিস করো" },
    ],
    practiceLink: "/practice",
  },
  {
    day: 3,
    titleBangla: "দিন ৩: উচ্চতর গণিত ১ম — অন্তরীকরণ ও সীমা",
    focusSubject: "উচ্চতর গণিত ১ম",
    focusTopics: ["ত্রিকোণমিতিক লিমিট", "ল'হসপিটাল নিয়ম"],
    tasks: [
      { id: "d3-t1", text: "মৌলিক অন্তরীকরণের ফর্মুলা শিট রিভিশন করো" },
      { id: "d3-t2", text: "বোর্ড ও শীর্ষ কলেজের ১০টি লিমিট ম্যাথ সমাধান করো" },
    ],
    practiceLink: "/formula-search",
  },
  {
    day: 4,
    titleBangla: "দিন ৪: পদার্থবিজ্ঞান ২য় — তাপগতিবিদ্যা ও তড়িৎ",
    focusSubject: "পদার্থবিজ্ঞান ২য়",
    focusTopics: ["তাপগতিবিদ্যার ১ম ও ২য় সূত্র", "চল তড়িৎ ও কার্শফের সূত্র"],
    tasks: [
      { id: "d4-t1", text: "কার্নো ইঞ্জিনের দক্ষতা ও এন্ট্রপির কনসেপ্ট ক্লিয়ার করো" },
      { id: "d4-t2", text: "মিস্টেক ভল্টের ভুল চল তড়িৎ সার্কিট প্র্যাকটিস করো" },
    ],
    practiceLink: "/mistake-vault",
  },
  {
    day: 5,
    titleBangla: "দিন ৫: জীববিজ্ঞান ও আইসিটি রিকভারি",
    focusSubject: "জীববিজ্ঞান ও ICT",
    focusTopics: ["কোষ বিভাজন (মিয়োসিস)", "C প্রোগ্রামিং ও লুপ"],
    tasks: [
      { id: "d5-t1", text: "মিয়োসিস-১ এর প্রফেজ-১ উপপর্যায়গুলোর ডায়াগ্রাম আঁকো" },
      { id: "d5-t2", text: "ICT প্রোগ্রামিং MCQ ও ফর লুপ ট্রেসিং সমাধান করো" },
    ],
    practiceLink: "/flashcards",
  },
  {
    day: 6,
    titleBangla: "দিন ৬: রসায়ন ২য় — জৈব রসায়ন মেকানিজম",
    focusSubject: "রসায়ন ২য়",
    focusTopics: ["বেনজিন বলয় সক্রিয় ও নিষ্ক্রিয়কারী গ্রুপ", "অ্যালকাইল হ্যালাইড"],
    tasks: [
      { id: "d6-t1", text: "ইলেকট্রোফিলিক প্রতিস্থাপন বিক্রিয়ার চার্ট রিভিশন করো" },
      { id: "d6-t2", text: "মিস্টেক ভল্ট থেকে সব রসায়ন ২য় এর প্রশ্ন ক্লিয়ার করো" },
    ],
    practiceLink: "/mistake-vault",
  },
  {
    day: 7,
    titleBangla: "দিন ৭: পূর্ণাঙ্গ স্পিড ও রিভিশন টেস্ট",
    focusSubject: "সকল বিষয়",
    focusTopics: ["বোর্ড স্ট্যান্ডার্ড ২৫ নম্বরের সমন্বিত কুইজ"],
    tasks: [
      { id: "d7-t1", text: "১টি ২৫ নম্বরের দ্রুত মডেল টেস্ট OMR সহ সম্পূর্ণ করো" },
      { id: "d7-t2", text: "উইকনেস রাডার চার্টে প্রগ্রেস যাচাই করো" },
    ],
    practiceLink: "/mock-exam",
  },
];

export function MistakeRecoveryPlan() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = !prev[taskId];
      if (next) {
        sfx.play("correct");
        toast.success("টাস্ক সম্পন্ন হয়েছে! 🎯");
      } else {
        sfx.play("click");
      }
      return { ...prev, [taskId]: next };
    });
  };

  const totalTasks = DEFAULT_7_DAY_PLAN.reduce((acc, d) => acc + d.tasks.length, 0);
  const doneCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((doneCount / totalTasks) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>মিস্টেক ভল্ট এআই ৭-দিনের রিকভারি রোডম্যাপ</span>
            </CardTitle>
            <CardDescription className="text-xs">
              তোমার অতীতের ভুলগুলো বিশ্লেষণ করে তৈরি করা দৈনিক লক্ষ্যমাত্রা
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs gap-1">
            <Target className="h-3.5 w-3.5 text-primary" />
            {doneCount}/{totalTasks} সম্পন্ন ({progressPercent}%)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>রোডম্যাপ প্রগ্রেস</span>
            <span className="font-semibold text-foreground">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 7 Days Timeline List */}
        <div className="space-y-3 pt-2">
          {DEFAULT_7_DAY_PLAN.map((plan) => {
            const dayDone = plan.tasks.every((t) => completedTasks[t.id]);

            return (
              <div
                key={plan.day}
                className={cn(
                  "rounded-xl border p-3.5 transition-all",
                  dayDone
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-bold",
                        dayDone
                          ? "bg-emerald-500 text-white"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {plan.day}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">
                      {plan.titleBangla}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {plan.focusSubject}
                  </Badge>
                </div>

                {/* Focus topic tags */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {plan.focusTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      • {topic}
                    </span>
                  ))}
                </div>

                {/* Tasks Checklist */}
                <div className="space-y-2 border-t pt-2.5 text-xs">
                  {plan.tasks.map((task) => {
                    const isChecked = Boolean(completedTasks[task.id]);
                    return (
                      <label
                        key={task.id}
                        className={cn(
                          "flex items-start gap-2.5 cursor-pointer select-none rounded-lg p-1.5 transition hover:bg-muted/50",
                          isChecked && "line-through text-muted-foreground"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-0.5"
                        />
                        <span className="flex-1 leading-relaxed">{task.text}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Action Link */}
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    asChild
                  >
                    <Link href={plan.practiceLink}>
                      <span>অনুশীলন করো</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
