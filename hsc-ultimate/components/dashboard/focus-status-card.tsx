"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, LockKeyhole, Play, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface FocusSessionSummary {
  id: string;
  source: "SELF" | "ADMIN";
  endsAt: string;
  durationMinutes: number;
  nativeEnforcementRequested: boolean;
}

interface FocusStatusCardProps {
  initialSession: FocusSessionSummary | null;
  contractEnabled: boolean;
  nativeEnforcementEnabled: boolean;
}

export function FocusStatusCard({
  initialSession,
  contractEnabled,
  nativeEnforcementEnabled,
}: FocusStatusCardProps) {
  const [session, setSession] = useState(initialSession);
  const [duration, setDuration] = useState(25);
  const [starting, setStarting] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!session) return;
    const update = () => setRemaining(Math.max(0, new Date(session.endsAt).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [session]);

  async function startFocus() {
    setStarting(true);
    try {
      const response = await fetch("/api/focus/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: duration,
          nativeEnforcementRequested: nativeEnforcementEnabled,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Focus শুরু করা যায়নি");
      setSession(data.session);
      window.dispatchEvent(new Event("focus-session-changed"));
      toast.success(`${duration} মিনিটের Strict Focus শুরু হয়েছে`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
    } finally {
      setStarting(false);
    }
  }

  const seconds = Math.ceil(remaining / 1000);
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  const timerText = hh > 0
    ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  return (
    <GlassCard className="h-full overflow-hidden p-5 sm:p-6" variant="gradient-border">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" aria-hidden />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
              <LockKeyhole className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-bold">Strict Focus</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Distraction shield</p>
            </div>
          </div>
          <Badge variant={session ? "default" : "outline"}>
            {session ? "Active" : nativeEnforcementEnabled ? "Android ready" : "Web mode"}
          </Badge>
        </div>

        {session ? (
          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
            <p className="font-mono text-5xl font-black tabular-nums tracking-tight sm:text-6xl">{timerText}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {session.source === "ADMIN" ? "Admin Focus Contract" : "Self Focus"} · {session.durationMinutes} মিনিট
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Emergency controls available
            </div>
            <Button render={<Link href="/focus" />} variant="outline" size="sm" className="mt-5 gap-1.5">
              Session খুলুন <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-1 flex-col">
            <p className="text-sm leading-6 text-muted-foreground">
              এখনই একটি non-pausable Deep Study session শুরু করুন। Phone ও emergency access নিরাপদ থাকবে।
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[25, 45, 60].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDuration(minutes)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors ${
                    duration === minutes
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-200"
                      : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05]"
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
            <Button className="mt-3 w-full gap-2" onClick={startFocus} disabled={starting}>
              {starting ? <Clock3 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {starting ? "শুরু হচ্ছে…" : `${duration} মিনিট শুরু করুন`}
            </Button>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{contractEnabled ? "Admin contract enabled" : "Self-control only"}</span>
              <Link href="/focus" className="-mx-1 inline-flex min-h-8 items-center rounded-md px-1 font-semibold text-primary hover:underline">Settings</Link>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
