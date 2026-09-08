import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LockKeyhole,
  Sparkles,
  Target,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface DashboardCommandHeroProps {
  userName: string;
  hscBatch: number;
  board: string | null;
  role: string;
  examDaysLeft: number;
  examIsPast: boolean;
  targetGpa: number | null;
  activeFocus: {
    source: "SELF" | "ADMIN";
    endsAt: string;
  } | null;
  nextMission: {
    title: string;
    durationMinutes: number;
    overdue: boolean;
  } | null;
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "শুভ সকাল ☀️";
  if (hour >= 12 && hour < 16) return "শুভ দুপুর 🌤️";
  if (hour >= 16 && hour < 19) return "শুভ বিকেল 🌇";
  if (hour >= 19 && hour < 23) return "শুভ সন্ধ্যা 🌙";
  return "শান্ত রাত 🌌";
}

const MOTIVATIONAL_QUOTES = [
  "“জ্ঞানই শক্তি, আর প্রতিদিনের ধারাবাহিকতাই সাফল্যের মূল চাবিকাঠি।” — জগদীশচন্দ্র বসু",
  "“আজকের কঠিন পরিশ্রমই তোমার আগামীর স্বপ্ন পূরণ করবে।” — এ পি জে আব্দুল কালাম",
  "“প্রতিটি ভুল থেকে শেখাই একজন সফল শিক্ষার্থীর সবচেয়ে বড় যোগ্যতা।” — রিচার্ড ফাইনম্যান",
  "“বিজ্ঞান কোনো নির্দিষ্ট সত্যের নাম নয়, বিজ্ঞান হলো জানার এক নিরন্তর সাধনা।” — আলবার্ট আইনস্টাইন",
];

export function DashboardCommandHero({
  userName,
  hscBatch,
  board,
  role,
  examDaysLeft,
  examIsPast,
  targetGpa,
  activeFocus,
  nextMission,
}: DashboardCommandHeroProps) {
  const firstName = userName.trim().split(/\s+/)[0] || "শিক্ষার্থী";
  const greeting = getTimeOfDayGreeting();
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyQuote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];

  const today = new Date().toLocaleDateString("bn-BD", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <GlassCard className="dashboard-command-hero overflow-hidden p-5 sm:p-7 lg:p-8" variant="gradient-border">
      <div aria-hidden className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-violet-500/25 blur-[90px]" />
      <div aria-hidden className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]" />
      <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-linear-to-r from-transparent via-white/45 to-transparent" />

      <div className="relative grid gap-7 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge className="border-violet-400/25 bg-violet-500/10 text-violet-700 dark:text-violet-200 text-xs">
              <Sparkles className="mr-1 h-3 w-3" /> Learning Command Center
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" /> {today}
            </span>
          </div>

          <h1 className="max-w-3xl text-balance text-3xl font-black leading-[1.08] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            {greeting}, {firstName}! আজকের <span className="text-gradient">momentum</span> তৈরি করো।
          </h1>

          <p className="mt-3 text-xs text-muted-foreground/90 italic flex items-center gap-1.5">
            <Quote className="h-3.5 w-3.5 text-primary shrink-0 not-italic" />
            <span>{dailyQuote}</span>
          </p>

          <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-foreground/90 sm:text-base font-medium">
            {nextMission
              ? `🎯 পরবর্তী লক্ষ্য: ${nextMission.title} · ${nextMission.durationMinutes} মিনিট${nextMission.overdue ? " · বকেয়া" : ""}`
              : "আজকের mission সম্পূর্ণ করো অথবা একটি focused adaptive practice দিয়ে দিন শুরু করো।"}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button render={<Link href="/focus" />} size="lg" className="gap-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white shadow-lg shadow-violet-500/20 font-semibold text-sm">
              <LockKeyhole className="h-4 w-4" />
              {activeFocus ? "Focus session দেখুন" : "Strict Focus শুরু করুন"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button render={<Link href="/practice" />} size="lg" variant="outline" className="gap-2 bg-card/70 hover:bg-muted border border-border font-semibold text-sm">
              <Target className="h-4 w-4 text-primary" /> Practice শুরু করুন
            </Button>
            <Button render={<Link href="/ai-tutor" />} size="lg" variant="ghost" className="gap-2 font-semibold text-sm">
              <Sparkles className="h-4 w-4 text-primary" /> AI Tutor
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                <GraduationCap className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">HSC {hscBatch}</span>
            </div>
            <p className="text-2xl font-black tabular-nums text-foreground">
              {examIsPast ? "সম্পন্ন" : `${examDaysLeft} দিন`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {examIsPast ? "Exam date অতিক্রম করেছে" : "Estimated exam countdown"}
            </p>
            {board && <p className="mt-2 text-xs font-semibold text-primary">{board} বোর্ড</p>}
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                {activeFocus ? <Clock3 className="h-4.5 w-4.5" /> : <CheckCircle2 className="h-4.5 w-4.5" />}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,.08)]" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {activeFocus ? `${activeFocus.source === "ADMIN" ? "Admin" : "Self"} Focus active` : "System ready"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeFocus
                ? `শেষ হবে ${new Date(activeFocus.endsAt).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" })}`
                : targetGpa
                  ? `Target GPA ${targetGpa.toFixed(2)}`
                  : "Target GPA সেট করা হয়নি"}
            </p>
            {role === "ADMIN" && (
              <Link href="/admin" className="-mx-1 mt-1 inline-flex min-h-8 items-center rounded-md px-1 text-xs font-semibold text-primary hover:underline">
                Admin console →
              </Link>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
