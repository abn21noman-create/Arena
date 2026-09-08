"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Zap, Sparkles, Brain, Clock, Coffee, BatteryCharging, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function CircadianOptimizer() {
  const [chronotype, setChronotype] = useState<"early" | "night" | "balanced">("early");
  const [sleepHours, setSleepHours] = useState<number>(7.5);

  const getPeakWindows = () => {
    if (chronotype === "early") {
      return [
        { time: "সকাল ৮:০০ - ১১:৩০", subject: "উচ্চতর গণিত ও পদার্থবিজ্ঞান গাণিতিক সমস্যা", icon: Zap, label: "সর্বোচ্চ মস্তিষ্ক অ্যালার্টনেস (Peak Focus)" },
        { time: "বিকাল ৪:৩০ - ৬:৩০", subject: "ফ্ল্যাশকার্ড ও মিস্টেক ভল্ট রিভিশন", icon: Coffee, label: "দ্বিতীয় এনার্জি উইন্ডো" },
        { time: "রাত ৮:৩০ - ১০:৩০", subject: "রসায়ন জৈব যৌগ ও জীববিজ্ঞান মুখস্থ", icon: Moon, label: "স্মৃতি সংরক্ষণ পর্ব" },
      ];
    } else if (chronotype === "night") {
      return [
        { time: "বেলা ১১:০০ - দুপুর ১:৩০", subject: "পদার্থবিজ্ঞান ও রসায়ন থিওরি", icon: Sun, label: "সকালের মেমোরি স্লট" },
        { time: "বিকাল ৫:০০ - সন্ধ্যা ৭:০০", subject: "মডেল টেস্ট ও MCQ ড্রিল", icon: Zap, label: "স্পিড উইন্ডো" },
        { time: "রাত ১০:০০ - রাত ১:৩০", subject: "ক্যালকুলাস ও জটিল গাণিতিক ডেরিভেশন", icon: Moon, label: "গভীর রাতের সর্বোচ্চ ফোকাস" },
      ];
    } else {
      return [
        { time: "সকাল ৯:০০ - ১২:০০", subject: "গণিত ও পদার্থবিজ্ঞান", icon: Sun, label: "সকালের কোর সাবজেক্ট" },
        { time: "বিকাল ৪:০০ - ৬:০০", subject: "CQ অনুশীলন ও হ্যান্ডনোট", icon: Coffee, label: "রাইটিং প্র্যাকটিস" },
        { time: "রাত ৯:০০ - ১১:০০", subject: "বায়োলজি ও আইসিটি রিভিশন", icon: Moon, label: "ডেইলি রিক্যাপ" },
      ];
    }
  };

  const windows = getPeakWindows();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-indigo-500/10 via-card to-amber-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>স্লিপ ও সার্কাডিয়ান রিদম অপটিমাইজার</span>
                  <Badge variant="secondary" className="text-xs">
                    Cognitive Energy AI
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  আপনার স্বাভাবিক জৈবিক ঘড়ি অনুযায়ী দিনের কোন সময়ে কোন বিষয় পড়া উচিত তার বৈজ্ঞানিক গাইড
                </p>
              </div>
            </div>

            {/* Chronotype Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { id: "early", label: "প্রভাতী (Early Bird)", icon: Sun },
                { id: "night", label: "রাতজাগা (Night Owl)", icon: Moon },
                { id: "balanced", label: "ভারসাম্যপূর্ণ", icon: Sparkles },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setChronotype(item.id as "early" | "night" | "balanced");
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5",
                    chronotype === item.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Energy Slots (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            আপনার বায়োলজিক্যাল পিক স্টাডি স্লটসমূহ:
          </div>

          <div className="space-y-3">
            {windows.map((win, idx) => {
              const Icon = win.icon;

              return (
                <Card key={idx} className="border shadow-2xs p-4 sm:p-5 transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-foreground">{win.time}</span>
                          <Badge variant="outline" className="text-3xs font-semibold">
                            {win.label}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-primary">
                          {win.subject}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sleep & Recovery Quality Meter (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BatteryCharging className="h-5 w-5 text-emerald-500" />
              <span>ঘুম ও ব্রেন রিকভারি ইনডেক্স</span>
            </CardTitle>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>প্রতি রাতের গড় ঘুম:</span>
                <span className="font-mono text-primary">{sleepHours} ঘণ্টা</span>
              </div>
              <input
                type="range"
                min={4}
                max={10}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>মেমোরি কনসলিডেশন কোয়ালিটি:</span>
                <span className={cn("font-mono", sleepHours >= 7 ? "text-emerald-500" : "text-amber-500")}>
                  {sleepHours >= 7 ? "চমৎকার (94%)" : "ঘাটতি আছে (68%)"}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-2xs">
                {sleepHours >= 7
                  ? "পর্যাপ্ত REM ঘুমের ফলে সারাদিনে পড়া নতুন সূত্রগুলো মস্তিষ্কের লং-টার্ম মেমোরিতে পাকাপোক্তভাবে সংরক্ষিত হয়।"
                  : "৬ ঘণ্টার কম ঘুমালে পরদিন পড়ার ধারণক্ষমতা ও ক্যালকুলেশন স্পিড প্রায় ২০-৩০% কমে যায়।"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
