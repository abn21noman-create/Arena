"use client";

// ===================================================================
// Habit Tracker — কাস্টম ডেইলি স্টাডি habit তৈরি, দৈনিক টগল, streak
// ও সাম্প্রতিক ৭ দিনের ভিজুয়াল history
// -------------------------------------------------------------------
// components/planner/task-manager.tsx এর একই server-fetched-initial-
// data + client-interaction প্যাটার্ন অনুসরণ করা হয়েছে।
// ===================================================================
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Flame, Target, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOfflineSync } from "@/hooks/use-offline-sync";

interface HabitHistoryDay {
  date: string;
  logged: boolean;
}

interface Habit {
  id: string;
  name: string;
  emoji: string;
  currentStreak: number;
  longestStreak: number;
  loggedToday: boolean;
  recentHistory: HabitHistoryDay[];
}

const EMOJI_OPTIONS = ["✅", "📚", "⏰", "🧠", "✍️", "🎯", "💪", "🔥"];
const MAX_HABITS = 10;

// বাংলা বার সংক্ষিপ্ত নাম (রবি থেকে শনি, UTC getUTCDay() ইনডেক্স অনুযায়ী)
const WEEKDAY_LABELS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

export function HabitTracker({ initialHabits }: { initialHabits: Habit[] }) {
  const confirmAction = useConfirmDialog();
  const [habits, setHabits] = useState(initialHabits);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("✅");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { offlineFetch } = useOfflineSync();

  async function handleAddHabit() {
    if (!newName.trim()) {
      toast.error("Habit এর নাম দাও");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, emoji: newEmoji }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Habit যোগ করা যায়নি");
        return;
      }
      setHabits((prev) => [
        ...prev,
        {
          id: data.habit.id,
          name: data.habit.name,
          emoji: data.habit.emoji,
          currentStreak: 0,
          longestStreak: 0,
          loggedToday: false,
          recentHistory: [],
        },
      ]);
      setNewName("");
      setNewEmoji("✅");
      setShowAddForm(false);
      toast.success("নতুন Habit যোগ হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setAdding(false);
    }
  }

  // Offline Habit Sync — অফলাইনে toggle করলে IndexedDB queue তে
  // সেভ হয়ে যায় (offlineFetch হ্যান্ডেল করে), UI optimistically আপডেট
  // হয় (toggle করা idempotent-safe — দুইবার toggle করলে original
  // state এ ফিরে আসে, তাই queue replay এ কোনো সমস্যা হয় না)
  async function handleToggle(habitId: string) {
    setTogglingId(habitId);

    // Optimistic UI আপডেট — অফলাইনে থাকলেও তাৎক্ষণিক ফিডব্যাক দরকার
    const habit = habits.find((h) => h.id === habitId);
    const optimisticLoggedToday = habit ? !habit.loggedToday : true;

    try {
      const result = await offlineFetch({
        url: `/api/habits/${habitId}/toggle`,
        method: "POST",
        label: `Habit চেক-ইন: ${habit?.name ?? ""}`,
      });

      if (result.status === "queued") {
        // অফলাইন — optimistically UI আপডেট করা হচ্ছে (স্ট্রিক সংখ্যা
        // পরিবর্তন না করে শুধু loggedToday টগল করা হয়, কারণ সঠিক
        // streak গণনা সার্ভার সাইড লজিক, সিঙ্ক হওয়ার পর সঠিক হবে)
        setHabits((prev) =>
          prev.map((h) => (h.id === habitId ? { ...h, loggedToday: optimisticLoggedToday } : h))
        );
        return;
      }

      if (result.status === "error") {
        const data = await result.response.json().catch(() => ({}));
        toast.error(data.error ?? "আপডেট করা যায়নি");
        return;
      }

      const data = await result.response.json();
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                loggedToday: data.loggedToday,
                currentStreak: data.currentStreak,
                longestStreak: data.longestStreak,
                recentHistory: h.recentHistory.map((day, idx) =>
                  idx === h.recentHistory.length - 1
                    ? { ...day, logged: data.loggedToday }
                    : day
                ),
              }
            : h
        )
      );
      if (data.loggedToday) {
        toast.success(`🔥 আজকের habit সম্পন্ন! স্ট্রিক: ${data.currentStreak} দিন`);
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(habitId: string) {
    if (
      !(await confirmAction({
        description: "এই Habit ডিলিট করলে এর সব history মুছে যাবে। নিশ্চিত?",
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    setDeletingId(habitId);
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      toast.success("Habit ডিলিট হয়েছে");
    } catch {
      toast.error("ডিলিট করা যায়নি");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Target className="h-4.5 w-4.5 text-primary" />
          Habit Tracker
        </h2>
        {habits.length < MAX_HABITS && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setShowAddForm((v) => !v)}
          >
            <Plus className="h-3.5 w-3.5" />
            নতুন Habit
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 rounded-lg border bg-muted/30 space-y-2.5">
          <Input
            placeholder="যেমন: প্রতিদিন ২ ঘন্টা পড়া"
            aria-label="নতুন Habit এর নাম"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={100}
          />
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setNewEmoji(emoji)}
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center text-base border transition-colors",
                  newEmoji === emoji ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
          <Button onClick={handleAddHabit} disabled={adding} size="sm" className="w-full gap-1.5">
            {adding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            তৈরি করো
          </Button>
        </div>
      )}

      {habits.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          এখনো কোনো Habit যোগ করোনি। উপরের বাটন দিয়ে নিজের ডেইলি স্টাডি
          habit তৈরি করো (যেমন &ldquo;প্রতিদিন ২ ঘন্টা পড়া&rdquo;)।
        </p>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="p-3 rounded-lg border">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{habit.emoji}</span>
                  <span className="text-sm font-medium truncate">{habit.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {habit.currentStreak > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400">
                      <Flame className="h-3.5 w-3.5" />
                      {habit.currentStreak}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(habit.id)}
                    disabled={deletingId === habit.id}
                    aria-label="Habit মুছে ফেলো"
                  >
                    {deletingId === habit.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* সাম্প্রতিক ৭ দিনের history */}
              <div className="flex items-center gap-1.5 mb-2.5">
                {habit.recentHistory.map((day, idx) => {
                  const isToday = idx === habit.recentHistory.length - 1;
                  const d = new Date(day.date + "T00:00:00Z");
                  const weekday = WEEKDAY_LABELS[d.getUTCDay()];
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-0.5">
                      <div
                        className={cn(
                          "h-6 w-6 rounded-md flex items-center justify-center text-xs",
                          day.logged
                            ? "bg-violet-500 text-white"
                            : "bg-muted text-muted-foreground",
                          isToday && "ring-2 ring-primary/40"
                        )}
                      >
                        {day.logged && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{weekday}</span>
                    </div>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant={habit.loggedToday ? "secondary" : "default"}
                className="w-full gap-1.5 text-xs"
                onClick={() => handleToggle(habit.id)}
                disabled={togglingId === habit.id}
              >
                {togglingId === habit.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : habit.loggedToday ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
                {habit.loggedToday ? "আজকে সম্পন্ন হয়েছে ✓" : "আজকে সম্পন্ন করো"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
