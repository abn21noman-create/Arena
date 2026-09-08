"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface SprintDay {
  day: number;
  subject: string;
  chapter: string;
  priority: "High" | "Medium";
  completed: boolean;
}

const INITIAL_SPRINT_DAYS: SprintDay[] = [
  { day: 1, subject: "পদার্থবিজ্ঞান ১ম পত্র", chapter: "ভেক্টর ও গতিবিদ্যা", priority: "High", completed: true },
  { day: 2, subject: "পদার্থবিজ্ঞান ১ম পত্র", chapter: "নিউটনিয়ান বলবিদ্যা", priority: "High", completed: true },
  { day: 3, subject: "পদার্থবিজ্ঞান ১ম পত্র", chapter: "কাজ, শক্তি ও ক্ষমতা", priority: "Medium", completed: false },
  { day: 4, subject: "রসায়ন ১ম পত্র", chapter: "গুণগত রসায়ন ও কোয়ান্টাম সংখ্যা", priority: "High", completed: false },
  { day: 5, subject: "রসায়ন ১ম পত্র", chapter: "রাসায়নিক পরিবর্তন ও সাম্যাবস্থা", priority: "High", completed: false },
  { day: 6, subject: "উচ্চতর গণিত ১ম পত্র", chapter: "ম্যাট্রিক্স ও নির্ণায়ক", priority: "Medium", completed: false },
  { day: 7, subject: "উচ্চতর গণিত ১ম পত্র", chapter: "সরলরেখা ও বৃত্ত", priority: "High", completed: false },
];

export function RevisionSprintEngine() {
  const [sprintDays, setSprintDays] = useState<SprintDay[]>(INITIAL_SPRINT_DAYS);

  const toggleDay = (dayNum: number) => {
    sfx.play("pop");
    setSprintDays((prev) =>
      prev.map((d) => (d.day === dayNum ? { ...d, completed: !d.completed } : d))
    );
  };

  const completedCount = sprintDays.filter((d) => d.completed).length;
  const progressPct = Math.round((completedCount / sprintDays.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>HSC ফাইনাল ৩০-দিনের রিভিশন স্প্রিন্ট ইঞ্জিন</span>
                  <Badge variant="secondary" className="text-xs">
                    Rapid Revision V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  বোর্ড পরীক্ষার পূর্বের ৩০ দিনের সুনির্দিষ্ট অধ্যায়ভিত্তিক লক্ষ্যমাত্রা ও অগ্রগতি ট্র্যাকার
                </p>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-xs gap-1.5 px-3 py-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>স্প্রিন্ট প্রগ্রেস: {progressPct}% সম্পন্ন</span>
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Days List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {sprintDays.map((d) => (
            <Card
              key={d.day}
              onClick={() => toggleDay(d.day)}
              className={cn(
                "border shadow-2xs p-4 flex items-center justify-between transition cursor-pointer bg-card",
                d.completed && "border-emerald-500/40 bg-emerald-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs font-mono transition",
                    d.completed
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-muted/30 text-muted-foreground"
                  )}
                >
                  {d.completed ? <CheckCircle2 className="h-4 w-4" /> : d.day}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{d.chapter}</div>
                  <div className="text-2xs text-muted-foreground">{d.subject}</div>
                </div>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "text-3xs font-semibold",
                  d.priority === "High" ? "text-rose-500 border-rose-500/30" : "text-blue-500 border-blue-500/30"
                )}
              >
                {d.priority === "High" ? "টপ প্রায়োরিটি" : "মিডিয়াম"}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Sprint Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>স্প্রিন্ট পরিসংখ্যান</span>
            </CardTitle>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>সম্পন্ন লক্ষ্যমাত্রা:</span>
                <span className="font-mono text-primary">{completedCount} / {sprintDays.length}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-3 text-2xs space-y-1.5">
              <div className="font-bold text-foreground">স্প্রিন্ট কার্যপদ্ধতি:</div>
              <div>• প্রতিদিন সকালে সংশ্লিষ্ট অধ্যায়ের সূত্র ভল্ট রিভিশন করুন।</div>
              <div>• দুপুরে ২৫টি এমসিকিউ ও ২টি সিকিউ খাতা মূল্যায়ন টেস্ট দিন।</div>
              <div>• রাতে মিস্টেক ভল্টের ভুলগুলো সমাধান করুন।</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
