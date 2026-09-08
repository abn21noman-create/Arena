"use client";

// ===================================================================
// Pomodoro Focus Timer — ২৫ মিনিট ফোকাস সেশন, শেষ হলে API তে লগ হয়
// এবং XP পুরস্কার দেওয়া হয়
// ===================================================================
import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { showNewBadgeToasts } from "@/lib/badge-toast";

const POMODORO_SECONDS = 25 * 60; // ২৫ মিনিট
const SHORT_BREAK_SECONDS = 5 * 60; // ৫ মিনিট

type Mode = "focus" | "break";

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const elapsedRef = useRef(0); // এই সেশনে মোট কত সেকেন্ড পড়াশোনা হয়েছে (log এর জন্য)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 🆕 Live Study Leaderboard heartbeat — established Reading Room এর
  // HEARTBEAT_INTERVAL_SEC (২৫s) এর সাথে সামঞ্জস্যপূর্ণ ইন্টারভালে
  // "এখন পড়ছে" স্ট্যাটাস রিফ্রেশ হয় (শুধু ফোকাস মোডে চলাকালীন, ব্রেকে না)
  const lastHeartbeatRef = useRef(0);

  const sendLiveHeartbeat = useCallback(() => {
    fetch("/api/live-activity/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType: "POMODORO" }),
    }).catch(() => {
      // silent fail — টাইমার এক্সপেরিয়েন্স নষ্ট না করার জন্য
    });
  }, []);

  const logSession = useCallback(async (durationSec: number) => {
    if (durationSec < 1) return;
    try {
      const res = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "POMODORO", durationSec }),
      });
      const data = await res.json();
      if (data.xpEarned > 0) {
        toast.success(`🎉 পোমোডোরো সম্পন্ন! +${data.xpEarned} XP`);
      }
      showNewBadgeToasts(data.newBadges);

      // Study Pet কে "খাওয়ানো" হয়েছে কিনা — হলে evolution toast দেখানো ও
      // পেজে থাকা StudyPetCard কে রিফ্রেশ করতে বলা (custom event)
      if (data.pet) {
        if (data.pet.evolved) {
          toast.success(`🎉 তোমার স্টাডি পেট বড় হয়েছে! এখন এটা আরও পরিণত!`, {
            duration: 5000,
          });
        }
        window.dispatchEvent(new CustomEvent("study-pet-fed"));
      }
    } catch {
      // silent fail — টাইমার এক্সপেরিয়েন্স নষ্ট না করার জন্য এরর দেখানো হচ্ছে না
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            // টাইমার শেষ
            if (mode === "focus") {
              elapsedRef.current += POMODORO_SECONDS;
              void logSession(elapsedRef.current);
              elapsedRef.current = 0;
              setMode("break");
              toast.info("ব্রেক টাইম! ৫ মিনিট বিশ্রাম নাও 🧘");
              return SHORT_BREAK_SECONDS;
            } else {
              setMode("focus");
              toast.info("ব্রেক শেষ! আবার ফোকাস করার সময় 💪");
              return POMODORO_SECONDS;
            }
          }
          if (mode === "focus") {
            elapsedRef.current += 1;
            // প্রতি ২৫ সেকেন্ডে একবার heartbeat (established Reading Room
            // ইন্টারভালের সাথে সামঞ্জস্যপূর্ণ, প্রতি সেকেন্ডে না পাঠিয়ে)
            lastHeartbeatRef.current += 1;
            if (lastHeartbeatRef.current >= 25) {
              lastHeartbeatRef.current = 0;
              sendLiveHeartbeat();
            }
          }
          return s - 1;
        });
      }, 1000);
      // টাইমার শুরু হওয়ার সাথে সাথেই একটা heartbeat (মিনিট-খানেক অপেক্ষা
      // না করে অবিলম্বে "এখন পড়ছে" দেখানোর জন্য)
      if (mode === "focus") sendLiveHeartbeat();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, logSession, sendLiveHeartbeat]);

  function handleReset() {
    setIsRunning(false);
    if (mode === "focus" && elapsedRef.current > 0) {
      void logSession(elapsedRef.current);
      elapsedRef.current = 0;
    }
    setMode("focus");
    setSecondsLeft(POMODORO_SECONDS);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalSeconds = mode === "focus" ? POMODORO_SECONDS : SHORT_BREAK_SECONDS;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <Card className="p-5 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
        <Timer className="h-4 w-4" />
        {mode === "focus" ? "ফোকাস টাইম" : "ব্রেক টাইম"}
      </div>

      {/* Circular progress */}
      <div className="relative h-32 w-32 mb-4">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="6"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={mode === "focus" ? "stroke-primary" : "stroke-violet-500"}
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setIsRunning((r) => !r)}
          size="sm"
          className="gap-1.5"
        >
          {isRunning ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              থামাও
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              শুরু করো
            </>
          )}
        </Button>
        <Button onClick={handleReset} size="sm" variant="outline" className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          রিসেট
        </Button>
      </div>
    </Card>
  );
}
