"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  Check,
  Circle,
  Clock3,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";

export interface DailyMissionItem {
  id: string;
  date: string;
  subjectCode: string;
  topicName: string | null;
  taskDescription: string;
  durationMinutes: number;
  priority: string;
  isOverdue: boolean;
}

interface DailyMissionCardProps {
  planId: string | null;
  initialItems: DailyMissionItem[];
  overdueCount: number;
  generationStatus: string | null;
}

export function DailyMissionCard({
  planId,
  initialItems,
  overdueCount,
  generationStatus,
}: DailyMissionCardProps) {
  const [items, setItems] = useState(initialItems);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const visibleItems = items.slice(0, 4);
  const totalMinutes = items.reduce((sum, item) => sum + item.durationMinutes, 0);

  async function complete(item: DailyMissionItem) {
    setCompletingId(item.id);
    try {
      const response = await fetch(`/api/study-plan/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Mission complete করা যায়নি");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success("Mission complete · দারুণ কাজ!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "নেটওয়ার্ক সমস্যা");
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <GlassCard className="h-full overflow-hidden p-5 sm:p-6" variant="gradient-border">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <CalendarCheck2 className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold">আজকের mission</p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Daily execution plan</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black tabular-nums">{items.length}</p>
            <p className="text-xs text-muted-foreground">pending · {totalMinutes} min</p>
          </div>
        </div>

        {!planId ? (
          <div className="mt-5 rounded-2xl border border-dashed border-violet-500/25 bg-violet-500/5 p-5 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-violet-500" />
            <p className="mt-2 text-sm font-bold">আজকের plan এখনো তৈরি হয়নি</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              AI Study Plan তৈরি করলে overdue এবং আজকের task এখানে priority অনুযায়ী দেখা যাবে।
            </p>
            <Button render={<Link href="/planner" />} size="sm" className="mt-4 gap-1.5">
              Plan তৈরি করুন <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <Check className="h-5 w-5" />
            </span>
            <p className="mt-3 font-bold">আজকের সব mission complete</p>
            <p className="mt-1 text-xs text-muted-foreground">Momentum ধরে রাখতে due flashcard অথবা একটি short practice করুন।</p>
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            {overdueCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {overdueCount}টি overdue mission আগে দেখানো হচ্ছে
              </div>
            )}
            {generationStatus === "GENERATING" && (
              <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs text-violet-700 dark:text-violet-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Long-term plan background-এ তৈরি হচ্ছে
              </div>
            )}
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={completingId === item.id}
                onClick={() => void complete(item)}
                className="group flex w-full items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 text-left transition-all hover:border-emerald-500/25 hover:bg-emerald-500/[0.045] disabled:opacity-60"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-background/40 text-muted-foreground group-hover:border-emerald-500/30 group-hover:text-emerald-500">
                  {completingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Circle className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {SUBJECT_NAMES[item.subjectCode] ?? item.subjectCode}
                    </Badge>
                    {item.isOverdue && <Badge variant="outline" className="border-amber-500/30 text-xs text-amber-600 dark:text-amber-300">Overdue</Badge>}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-2.5 w-2.5" /> {item.durationMinutes}m
                    </span>
                  </span>
                  <span className="line-clamp-2 text-xs font-medium leading-5 sm:text-sm">{item.taskDescription}</span>
                  {item.topicName && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.topicName}</span>}
                </span>
              </button>
            ))}
            <Link href="/planner" className="inline-flex items-center gap-1 pt-2 text-xs font-semibold text-primary hover:underline">
              পুরো plan দেখুন <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
