"use client";

// ===================================================================
// Synced (Shared) Pomodoro Card — readingroombd.com/StudyClock এর
// "সবাই একসাথে ব্রেক নেয়" ধারণা থেকে অনুপ্রাণিত
// -------------------------------------------------------------------
// docs/RESEARCH_UI_UX_READING_ROOM.md এর ৮ নং সেকশনে চিহ্নিত করা আইটেম।
// কোনো DB write/broadcast ছাড়াই — সার্ভারের wall-clock থেকে
// deterministically হিসাব করা হয় (lib/reading-room.ts এর
// getSyncedPomodoroState()), তাই রুমের সব ইউজার একই মুহূর্তে একই
// focus/break state দেখে। প্রতি সেকেন্ডে locally countdown করা হয়,
// কিন্তু প্রতি ৩০ সেকেন্ডে সার্ভার থেকে re-sync করা হয় (client-side
// drift এড়াতে)।
// ===================================================================
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncedState {
  mode: "focus" | "break";
  secondsLeft: number;
  cycleSec: number;
}

const RESYNC_INTERVAL_MS = 30_000;

function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SyncedPomodoroCard() {
  const [state, setState] = useState<SyncedState | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchState() {
    try {
      const res = await fetch("/api/reading-room/synced-pomodoro");
      const data = await res.json();
      if (res.ok) setState(data);
    } catch {
      // silent fail — synced timer optional feature, না থাকলেও বাকি সব কাজ করে
    }
  }

  // প্রথমবার fetch + প্রতি ৩০ সেকেন্ডে সার্ভার থেকে re-sync (drift এড়াতে)
  useEffect(() => {
    void fetchState();
    const resyncInterval = setInterval(() => void fetchState(), RESYNC_INTERVAL_MS);
    return () => clearInterval(resyncInterval);
  }, []);

  // Local ১-সেকেন্ড countdown — শুধু একবার mount এ শুরু হয় (empty deps),
  // functional setState ব্যবহার করে সবসময় সর্বশেষ state এর উপর ভিত্তি করে
  // আপডেট করে (state কে dependency তে রাখলে প্রতি সেকেন্ডে interval
  // পুনরায় তৈরি হয়ে যেত, যা ভুল হতো)
  useEffect(() => {
    tickIntervalRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev;
        if (prev.secondsLeft <= 1) {
          // চক্র শেষ — mode বদলে যাবে, পরের re-sync এ সঠিক মান পাওয়া
          // যাবে, ততক্ষণ approximate ভ্যালু দেখানো হচ্ছে
          const nextMode = prev.mode === "focus" ? "break" : "focus";
          const nextDuration = nextMode === "break" ? prev.cycleSec - 1500 : 1500;
          return { ...prev, mode: nextMode, secondsLeft: nextDuration };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  if (!state) return null;

  const isFocus = state.mode === "focus";

  return (
    <Card
      className={cn(
        "p-4 flex items-center gap-3",
        isFocus ? "bg-primary/5" : "bg-violet-500/5"
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
          isFocus ? "bg-primary/15 text-primary" : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
        )}
      >
        <Radio className="h-5 w-5 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">
          🌐 সবার সাথে সিঙ্ক করা {isFocus ? "ফোকাস" : "ব্রেক"} টাইমার
        </p>
        <p className="text-sm text-muted-foreground">
          {isFocus ? "এখন সবাই ফোকাস করছে" : "এখন সবার ব্রেক টাইম"}
        </p>
      </div>
      <div className="text-xl font-bold tabular-nums shrink-0">
        {formatMMSS(state.secondsLeft)}
      </div>
    </Card>
  );
}
