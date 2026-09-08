"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

export function SmartFocusShield() {
  const [sessionMinutes, setSessionMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<string>("rain");
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [urgesBlocked, setUrgesBlocked] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      sfx.play("correct");
      triggerConfetti();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  const toggleTimer = () => {
    sfx.play("click");
    setIsActive(!isActive);
  };

  const handleReset = () => {
    sfx.play("click");
    setIsActive(false);
    setSecondsLeft(sessionMinutes * 60);
  };

  const handleBlockUrge = () => {
    sfx.play("streak");
    setUrgesBlocked((prev) => prev + 1);
  };

  const progressPct = Math.round(((sessionMinutes * 60 - secondsLeft) / (sessionMinutes * 60)) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-indigo-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>স্মার্ট ফোকাস শিল্ড ও ডিপ-ওয়ার্ক কম্প্যানিয়ন</span>
                  <Badge variant="secondary" className="text-xs">
                    Deep Focus Shield V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  বিক্ষিপ্ততা প্রতিরোধ, অ্যাম্বিয়েন্ট ব্যাকগ্রাউন্ড সাউন্ড ও পোমোডোরো ডিপ স্টাডি টাইমার
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSessionMinutes(m);
                    setSecondsLeft(m * 60);
                    setIsActive(false);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition font-mono",
                    sessionMinutes === m ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timer & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-2xs p-8 flex flex-col items-center justify-center text-center space-y-6 bg-card">
            {/* Timer Display */}
            <div className="space-y-2">
              <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-foreground">
                {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
              </div>
              <Badge variant="outline" className="text-xs px-3 py-1 font-semibold">
                {isActive ? "🔥 ফোকাস সেশন চলমান — মনোযোগ ধরে রাখুন" : "স্ট্যান্ডবাই — শুরু করতে প্লে চাপুন"}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm space-y-1">
              <div className="flex justify-between text-2xs font-bold text-muted-foreground">
                <span>অগ্রগতি</span>
                <span className="font-mono text-primary">{progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="gap-2 font-bold px-8 shadow-md"
              >
                {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                <span>{isActive ? "বিরতি" : "ফোকাস শুরু"}</span>
              </Button>
              <Button size="icon" variant="outline" onClick={handleReset} className="h-11 w-11">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Ambient Noise & Distraction Shield (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Ambient Sound Selector */}
          <Card className="border shadow-2xs p-5 space-y-3 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-indigo-500" />
              <span>ব্রেনওয়েভ ও অ্যাম্বিয়েন্ট অডিও</span>
            </CardTitle>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "rain", label: "বৃষ্টির শব্দ (Rain)" },
                { id: "alpha", label: "আলফা ওয়েভ (10Hz)" },
                { id: "forest", label: "শান্ত বনভূমি" },
                { id: "cafe", label: "স্টাডি ক্যাফে" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sfx.play("pop");
                    setAmbientSound(s.id);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-semibold transition text-left",
                    ambientSound === s.id
                      ? "bg-primary text-primary-foreground shadow-xs border-primary"
                      : "bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Distraction Urge Counter */}
          <Card className="border shadow-2xs p-5 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>মনোযোগ বিচ্যুতির তাগিদ প্রতিহত</span>
              </CardTitle>
              <span className="font-mono font-bold text-base text-primary">{urgesBlocked}</span>
            </div>

            <p className="text-2xs text-muted-foreground">
              পড়তে পড়তে ফেসবুক/ইউটিউবে ঢোকার ইচ্ছা হলে নিচের বাটনে ক্লিক করে নিজেকে পুনঃমনোনিবেশ করুন।
            </p>

            <Button
              variant="outline"
              className="w-full text-xs font-bold gap-2 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              onClick={handleBlockUrge}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>আমি বিচ্যুতির ইচ্ছা প্রতিহত করেছি (+1 Shield)</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
