"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Flame, Users, Timer, Sparkles, Heart, ThumbsUp, Send } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface StudyPeer {
  id: string;
  name: string;
  city: string;
  avatar: string;
  currentTask: string;
  minutesStudied: number;
  streakStatus: string;
}

const PEERS: StudyPeer[] = [
  { id: "1", name: "তানভীর হাসান", city: "ঢাকা", avatar: "👨‍🎓", currentTask: "উচ্চতর গণিত: নির্দিষ্ট যোগজ", minutesStudied: 48, streakStatus: "৪৫ মিনিট স্ট্রিক 🔥" },
  { id: "2", name: "নুসরাত জাহান", city: "চট্টগ্রাম", avatar: "👩‍🎓", currentTask: "রসায়ন: জৈব যৌগের রূপান্তর", minutesStudied: 32, streakStatus: "পড়াশোনায় নিমগ্ন ☕" },
  { id: "3", name: "মাহমুদুল হক", city: "রাজশাহী", avatar: "🧑‍💻", currentTask: "পদার্থবিজ্ঞান: মহাকর্ষ ও প্রাসের গতি", minutesStudied: 55, streakStatus: "ডিপ ফোকাস 🎯" },
  { id: "4", name: "আফরিন সুলতানা", city: "সিলেট", avatar: "👩‍🏫", currentTask: "জীববিজ্ঞান: জিনতত্ত্ব ও বিবর্তন", minutesStudied: 26, streakStatus: "স্টাডি সেশন 📖" },
];

export function VirtualStudyCafe() {
  const [pomodoroSec, setPomodoroSec] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [myTask, setMyTask] = useState<string>("পদার্থবিজ্ঞান ১ম পত্র রিভিশন");
  const [reactionsSent, setReactionsSent] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setPomodoroSec((prev) => (prev > 0 ? prev - 1 : 25 * 60));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const sendReaction = (emoji: string) => {
    sfx.play("pop");
    setReactionsSent((prev) => [...prev.slice(-4), emoji]);
    setTimeout(() => {
      setReactionsSent((prev) => prev.filter((e) => e !== emoji));
    }, 2000);
  };

  const minutes = Math.floor(pomodoroSec / 60);
  const seconds = pomodoroSec % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Coffee className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ভার্চুয়াল ফ্রেন্ডস স্টাডি ক্যাফে ও পোমোডোরো ডুয়েট</span>
                  <Badge variant="secondary" className="text-xs">
                    ☕ 24/7 Silent Study Lounge
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  সারা দেশের শিক্ষার্থীদের সাথে একই টেবিলে বসে নীরব গভীর পড়াশোনার আবহ
                </p>
              </div>
            </div>

            {/* Sync Timer */}
            <div className="flex items-center gap-2 bg-muted/40 px-3.5 py-1.5 rounded-xl border">
              <Timer className="h-4 w-4 text-primary" />
              <span className="font-mono font-bold text-sm">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <Badge variant="outline" className="text-3xs text-emerald-600 border-emerald-500/30">
                সিঙ্কড ফোকাস
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Cafe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PEERS.map((peer) => (
          <Card key={peer.id} className="border shadow-2xs transition hover:border-primary/40 relative overflow-hidden bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-2xl shadow-inner">
                  {peer.avatar}
                </div>
                <Badge variant="outline" className="text-3xs font-semibold">
                  {peer.city}
                </Badge>
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground">{peer.name}</h4>
                <p className="text-2xs text-muted-foreground line-clamp-1 mt-0.5">{peer.currentTask}</p>
              </div>

              <div className="rounded-xl bg-muted/30 p-2 text-3xs font-mono flex items-center justify-between text-muted-foreground">
                <span>{peer.streakStatus}</span>
                <span className="font-bold text-primary">{peer.minutesStudied} মিনিট</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Reaction Bar */}
      <Card className="border shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
          <span>সহপাঠীদের উৎসাহ দিন (Quick Reactions):</span>
          <div className="flex gap-1">
            {reactionsSent.map((e, idx) => (
              <span key={idx} className="animate-bounce text-base">{e}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["🔥", "☕", "👏", "💪", "❤️"].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => sendReaction(emoji)}
              className="h-8 w-8 rounded-lg border bg-muted/40 hover:bg-primary/10 hover:scale-110 transition flex items-center justify-center text-sm"
            >
              {emoji}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
