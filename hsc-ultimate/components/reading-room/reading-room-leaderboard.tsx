"use client";

// ===================================================================
// Live Study Leaderboard — Daily/Weekly/Monthly + "এখন কে পড়ছে"
// -------------------------------------------------------------------
// readingroombd.com এর Study Leaderboard কনসেপ্ট থেকে অনুপ্রাণিত, এবং
// ব্যবহারকারীর অনুরোধ অনুযায়ী upgrade করা হয়েছে (Banglish, verbatim):
// "Keda kotokkon porbe leaderboard thakbe. Ahon ke ke porte ase ke
// kotokhon porce daily wekly lederboard thakbe. Dakhaibe je ahon ke ke
// porte ase ar di na pore taile dakhaibe ke kotokhon porce ajke।"
//
// এখন প্রতিটা এন্ট্রিতে established `isLive` ফ্ল্যাগ অনুযায়ী দুই ধরনের
// ব্যাজ দেখানো হয়:
// - 🟢 LIVE (pulsing dot): এখন পড়ছে + কী পড়ছে (activity type) +
//   কতক্ষণ ধরে টানা পড়ছে
// - ⚪ ধূসর ক্লক আইকন: এখন পড়ছে না, কিন্তু এই সময়সীমায় (দিন/সপ্তাহ/মাস)
//   মোট কতক্ষণ পড়েছে তার হিসাব
// glassmorphism hero banner এ established প্যাটার্ন (nav-modules.ts এর
// Reading Room থিম) অনুসরণ করে লাইভ কাউন্ট প্রমিনেন্টলি দেখানো হয়েছে।
// ===================================================================
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, Trophy, Crown, Medal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDurationBn } from "@/lib/format-duration";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";

type Period = "daily" | "weekly" | "monthly";

interface LeaderboardEntry {
  userId: string;
  name: string;
  level: number;
  totalFocusSec: number;
  sessionCount: number;
  rank: number;
  isMe: boolean;
  isLive: boolean;
  currentActivityType: string | null;
  liveSinceSec: number | null;
}

const PERIOD_LABELS: Record<Period, string> = {
  daily: "আজ",
  weekly: "এই সপ্তাহ",
  monthly: "এই মাস",
};

const RANK_STYLES: Record<number, string> = {
  1: "text-amber-600 dark:text-amber-300 font-bold",
  2: "text-slate-600 dark:text-slate-300 font-medium",
  3: "text-amber-700 dark:text-amber-400 font-medium",
};

const ACTIVITY_LABELS_BN: Record<string, string> = {
  PRACTICE: "Practice",
  CQ: "CQ Practice",
  FLASHCARD: "Flashcards",
  POMODORO: "Pomodoro",
  READING_ROOM: "Reading Room",
  MOCK_EXAM: "Mock Exam",
};

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-orange-500",
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-yellow-500",
];

function avatarGradient(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function ReadingRoomLeaderboard() {
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  const load = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reading-room/leaderboard?period=${p}`);
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries ?? []);
        setMyEntry(data.myEntry ?? null);
        setLiveCount(data.liveCount ?? 0);
      }
    } catch {
      // silent fail — নিচে empty state দেখানো হবে
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(period);
    // প্রতি ৩০ সেকেন্ডে অটো-রিফ্রেশ — "এখন কে পড়ছে" রিয়েল-টাইম অনুভূতি
    // দেওয়ার জন্য (established Reading Room presence polling এর একই
    // ইন্টারভাল দর্শন, কিন্তু hook cleanup এ interval বন্ধ করা হয়)
    const interval = setInterval(() => void load(period), 30000);
    return () => clearInterval(interval);
  }, [period, load]);

  const myRankInTop = entries.some((e) => e.isMe);

  function renderEntry(entry: LeaderboardEntry) {
    return (
      <Card
        key={entry.userId}
        className={cn(
          "p-3 flex flex-row items-center gap-3",
          entry.isMe && "ring-2 ring-primary"
        )}
      >
        <span
          className={cn(
            "w-7 text-center font-bold tabular-nums shrink-0",
            RANK_STYLES[entry.rank] ?? "text-muted-foreground"
          )}
        >
          {entry.rank === 1 ? (
            <Crown className="h-5 w-5 inline" />
          ) : entry.rank <= 3 ? (
            <Medal className="h-4 w-4 inline" />
          ) : (
            `#${entry.rank}`
          )}
        </span>

        <Avatar className={cn("h-9 w-9 shrink-0", entry.isLive && "avatar-glow")}>
          <AvatarFallback
            className={cn("bg-linear-to-br text-xs font-semibold text-white", avatarGradient(entry.userId))}
          >
            {entry.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">
            {entry.name} {entry.isMe && <span className="text-xs text-muted-foreground">(তুমি)</span>}
          </p>
          {entry.isLive ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
              এখন পড়ছে
              {entry.currentActivityType && ` • ${ACTIVITY_LABELS_BN[entry.currentActivityType] ?? entry.currentActivityType}`}
              {entry.liveSinceSec !== null && entry.liveSinceSec >= 60 && ` • ${formatDurationBn(entry.liveSinceSec)}`}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {PERIOD_LABELS[period]} পড়েছে · Lv.{entry.level}
            </p>
          )}
        </div>

        <Badge variant="secondary" className="tabular-nums shrink-0">
          {formatDurationBn(entry.totalFocusSec)}
        </Badge>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b glass-nav sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button render={<Link href="/reading-room" />} variant="ghost" size="icon" aria-label="Reading Room এ ফিরে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              লাইভ স্টাডি লিডারবোর্ড
            </h1>
            <p className="text-xs text-muted-foreground">
              এখন কে পড়ছে, আর কে কতক্ষণ পড়েছে — সব একসাথে
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
            Reading Room থিম), লাইভ কাউন্ট prominently দেখানো */}
        <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-700 to-fuchsia-900 p-5 mb-4 text-white">
          <div
            aria-hidden
            className="glass-hero-orb h-36 w-36 bg-white/20"
            style={{ top: "-2rem", right: "-1.5rem" }}
          />
          <div className="relative z-10 flex items-center gap-3">
            <span className="relative flex h-4 w-4 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-white" />
            </span>
            <div>
              <p className="text-2xl font-bold">{liveCount} জন এখন পড়ছে</p>
              <p className="text-sm opacity-90">
                প্রতি ৩০ সেকেন্ডে আপডেট হয় — লাইভ প্রেজেন্স
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                period === p
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            এই সময়সীমায় এখনো কেউ পড়াশোনা করেনি — এখনই শুরু করে প্রথম হও!
          </Card>
        ) : (
          <StaggerGroup className="space-y-2" staggerDelay={0.03}>
            {entries.map((entry) => (
              <StaggerItem key={entry.userId} direction="left">
                {renderEntry(entry)}
              </StaggerItem>
            ))}

            {myEntry && !myRankInTop && (
              <>
                <div className="text-center text-xs text-muted-foreground py-1">···</div>
                {renderEntry(myEntry)}
              </>
            )}

            {!myEntry && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                এখনো তুমি এই সময়সীমায় কোনো পড়াশোনা রেকর্ড করোনি
              </p>
            )}
          </StaggerGroup>
        )}
      </main>
    </div>
  );
}
