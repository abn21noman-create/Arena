"use client";

// ===================================================================
// Breathing Exercise — পরীক্ষার আগে/পরে Exam Anxiety কমানোর জন্য
// Box Breathing (৪-৪-৪-৪ সেকেন্ড) অ্যানিমেটেড গাইড
// -------------------------------------------------------------------
// Deep Research এ (FEATURE_RESEARCH_V3.md, Tier ১, আইটেম ৫) চিহ্নিত গ্যাপ:
// Headspace/Calm/MindShift এর মতো mental health app এ paced breathing
// exercise খুবই কমন প্যাটার্ন — পরীক্ষার আগে stress/anxiety কমাতে সাহায্য
// করে। এখানে "Box Breathing" (Navy SEAL কৌশল নামেও পরিচিত) ব্যবহার করা
// হয়েছে: শ্বাস নাও (৪s) → ধরে রাখো (৪s) → ছাড়ো (৪s) → ধরে রাখো (৪s) —
// এই চক্র repeat হয়।
//
// সম্পূর্ণ client-side, কোনো DB/API কল নেই — session-scoped state, শুধু
// local UI animation (Framer Motion দিয়ে বৃত্ত বড়/ছোট হওয়া)। কোনো XP/
// badge যোগ করা হয়নি ইচ্ছাকৃতভাবে — এটা একটা বিশ্রামের মুহূর্ত, gamify
// করলে উদ্দেশ্য নষ্ট হয়ে যেতে পারে (কাজ হিসেবে মনে হবে, বিশ্রাম না)।
// ===================================================================
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, RotateCcw, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "INHALE" | "HOLD_IN" | "EXHALE" | "HOLD_OUT";

const PHASE_SECONDS = 4; // প্রতিটা ধাপ ৪ সেকেন্ড (ক্লাসিক Box Breathing)
const PHASE_ORDER: Phase[] = ["INHALE", "HOLD_IN", "EXHALE", "HOLD_OUT"];

const PHASE_LABELS: Record<Phase, string> = {
  INHALE: "শ্বাস নাও...",
  HOLD_IN: "ধরে রাখো...",
  EXHALE: "ছেড়ে দাও...",
  HOLD_OUT: "ধরে রাখো...",
};

// প্রতিটা ধাপ শেষে বৃত্তের টার্গেট scale (animate করার লক্ষ্য মান)
const PHASE_TARGET_SCALE: Record<Phase, number> = {
  INHALE: 1.4, // ইনহেলে ছোট থেকে বড় হয়
  HOLD_IN: 1.4, // বড় অবস্থায় থেমে থাকে
  EXHALE: 1, // এক্সহেলে বড় থেকে ছোট হয়
  HOLD_OUT: 1, // ছোট অবস্থায় থেমে থাকে
};

const DEFAULT_TOTAL_CYCLES = 4; // ডিফল্ট ৪ চক্র ≈ ~64 সেকেন্ড

interface BreathingExerciseProps {
  /** কতগুলো সম্পূর্ণ চক্র (inhale→hold→exhale→hold) শেষ হলে exercise সম্পন্ন ধরা হবে */
  totalCycles?: number;
  /** ব্যবহারকারী "স্কিপ করো" চাইলে (ঐচ্ছিক, Dialog এ close বাটন থাকলে দরকার নাও হতে পারে) */
  onSkip?: () => void;
  /** সম্পূর্ণ exercise শেষ হলে কলব্যাক (ঐচ্ছিক — যেমন Dialog বন্ধ করা) */
  onComplete?: () => void;
}

export function BreathingExercise({
  totalCycles = DEFAULT_TOTAL_CYCLES,
  onSkip,
  onComplete,
}: BreathingExerciseProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASE_SECONDS);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = PHASE_ORDER[phaseIndex];

  useEffect(() => {
    if (!isRunning || isDone) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhaseIndex((pIdx) => {
            const nextIdx = (pIdx + 1) % PHASE_ORDER.length;
            // একটা সম্পূর্ণ চক্র শেষ হলো (HOLD_OUT থেকে আবার INHALE এ ফিরলে)
            if (nextIdx === 0) {
              setCyclesCompleted((c) => {
                const newCount = c + 1;
                if (newCount >= totalCycles) {
                  setIsDone(true);
                  setIsRunning(false);
                  onComplete?.();
                }
                return newCount;
              });
            }
            return nextIdx;
          });
          return PHASE_SECONDS;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isDone]);

  function handleStart() {
    setIsDone(false);
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setIsDone(false);
    setPhaseIndex(0);
    setSecondsLeft(PHASE_SECONDS);
    setCyclesCompleted(0);
  }

  const progressPct = Math.round((cyclesCompleted / totalCycles) * 100);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {isDone ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <PartyPopper className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          <p className="text-lg font-semibold">অসাধারণ! তুমি এখন শান্ত ও প্রস্তুত 🌿</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            গভীর শ্বাস-প্রশ্বাসের মাধ্যমে মস্তিষ্ক এখন বেশি ফোকাসড। এবার আত্মবিশ্বাস
            নিয়ে পরীক্ষা শুরু করো।
          </p>
          <Button variant="outline" size="sm" onClick={handleReset} className="mt-2 gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            আবার করো
          </Button>
        </div>
      ) : (
        <>
          {/* Breathing Circle Animation */}
          <div className="relative flex h-56 w-56 items-center justify-center">
            <motion.div
              className={cn(
                "absolute rounded-full bg-linear-to-br from-sky-400/30 to-violet-400/30",
                "flex items-center justify-center"
              )}
              style={{ width: "100%", height: "100%" }}
              animate={{
                scale: isRunning ? PHASE_TARGET_SCALE[currentPhase] * 0.7 : 0.7,
              }}
              transition={{
                duration: isRunning ? PHASE_SECONDS : 0.3,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute rounded-full bg-linear-to-br from-sky-500 to-violet-500 shadow-lg"
              style={{ width: "40%", height: "40%" }}
              animate={{
                scale: isRunning ? PHASE_TARGET_SCALE[currentPhase] : 1,
              }}
              transition={{
                duration: isRunning ? PHASE_SECONDS : 0.3,
                ease: "easeInOut",
              }}
            />
            <div className="relative z-10 flex flex-col items-center text-white mix-blend-difference">
              <span className="text-sm font-semibold">
                {isRunning ? PHASE_LABELS[currentPhase] : "প্রস্তুত?"}
              </span>
              {isRunning && <span className="text-2xl font-bold">{secondsLeft}</span>}
            </div>
          </div>

          {/* Progress dots — কতগুলো চক্র বাকি */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-6 rounded-full transition-colors",
                  i < cyclesCompleted ? "bg-violet-500" : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {cyclesCompleted}/{totalCycles} চক্র সম্পন্ন ({progressPct}%)
          </p>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={handleStart} className="gap-1.5">
                <Play className="h-4 w-4" />
                {cyclesCompleted > 0 ? "চালিয়ে যাও" : "শুরু করো"}
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="gap-1.5">
                <Pause className="h-4 w-4" />
                থামাও
              </Button>
            )}
            {cyclesCompleted > 0 && !isRunning && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button onClick={handleReset} variant="ghost" size="icon" aria-label="রিসেট করো">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  }
                />
                <TooltipContent>রিসেট করো</TooltipContent>
              </Tooltip>
            )}
            {onSkip && (
              <Button onClick={onSkip} variant="ghost" className="text-muted-foreground">
                এড়িয়ে যাও
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
