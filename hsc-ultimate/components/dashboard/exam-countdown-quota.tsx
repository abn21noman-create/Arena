"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  Flame,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamCountdownQuotaProps {
  targetExamDate?: string; // ISO string e.g. "2026-11-01"
  todaySolvedCount?: number;
  dailyTarget?: number;
  streakDays?: number;
  streakFreezeTokens?: number;
}

export function ExamCountdownQuota({
  targetExamDate = "2026-11-01",
  todaySolvedCount = 16,
  dailyTarget = 25,
  streakDays = 12,
  streakFreezeTokens = 2,
}: ExamCountdownQuotaProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculate() {
      const target = new Date(targetExamDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetExamDate]);

  const progressPercent = Math.min(100, Math.round((todaySolvedCount / dailyTarget) * 100));
  const isGoalReached = todaySolvedCount >= dailyTarget;

  return (
    <Card className="overflow-hidden border bg-card/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                HSC ২০২৬ লাইভ কাউন্টডাউন ও দৈনিক কোটা
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                বোর্ড পরীক্ষার আর মাত্র নির্দিষ্ট কিছু দিন বাকি — নিয়মিত লক্ষ্য পূরণ করো
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 font-mono text-xs">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{streakDays} দিনের স্ট্রিক</span>
            </Badge>
            {streakFreezeTokens > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{streakFreezeTokens}টি ফ্রিজ সুরক্ষিত</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Live 4-Block Countdown Timer */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="rounded-xl border bg-muted/40 p-2.5 shadow-inner">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-primary">
              {timeLeft.days}
            </span>
            <span className="block text-xs text-muted-foreground font-medium">দিন</span>
          </div>
          <div className="rounded-xl border bg-muted/40 p-2.5 shadow-inner">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-foreground">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="block text-xs text-muted-foreground font-medium">ঘণ্টা</span>
          </div>
          <div className="rounded-xl border bg-muted/40 p-2.5 shadow-inner">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-foreground">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="block text-xs text-muted-foreground font-medium">মিনিট</span>
          </div>
          <div className="rounded-xl border bg-muted/40 p-2.5 shadow-inner">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-500">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="block text-xs text-muted-foreground font-medium">সেকেন্ড</span>
          </div>
        </div>

        {/* Daily Study Quota Progress */}
        <div className="rounded-xl border bg-card p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Target className="h-4 w-4 text-primary" />
              <span>আজকের দৈনিক স্টাডি কোটা</span>
            </div>
            <span className="font-mono font-bold text-primary">
              {todaySolvedCount}/{dailyTarget} প্রশ্ন ({progressPercent}%)
            </span>
          </div>

          <Progress value={progressPercent} className="h-2" />

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              {isGoalReached
                ? "🎉 আজকের লক্ষ্য সম্পূর্ণ! চমৎকার ধারাবাহিকতা।"
                : `আজকের লক্ষ্য পূরণে আর ${dailyTarget - todaySolvedCount}টি প্রশ্ন সমাধান প্রয়োজন`}
            </span>
            <Button size="sm" variant="default" className="h-7 text-xs gap-1 shrink-0" asChild>
              <Link href="/practice">
                <Zap className="h-3 w-3" />
                <span>প্র্যাকটিস করো</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
