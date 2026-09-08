"use client";

// ===================================================================
// Calendar View — MASTER_PLAN.md এর মূল ভিশনের একটা অসম্পূর্ণ আইটেম
// ("Calendar View (মাসিক/সাপ্তাহিক) — সব ক্লাস, exam, deadline এক
// জায়গায়") পূরণ করে।
// -------------------------------------------------------------------
// মাসিক গ্রিড ভিউ — Task/Study Plan/Class Routine/Exam Date একসাথে
// রঙ-কোডেড ডট হিসেবে দেখায়। দিনে ক্লিক করলে সেই দিনের সব ইভেন্ট
// বিস্তারিত লিস্ট আকারে নিচে দেখানো হয়।
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  type: "task" | "study_plan" | "routine" | "exam";
  title: string;
  date: string; // "YYYY-MM-DD"
  timeLabel: string | null;
  colorHex: string;
  isCompleted: boolean | null;
  href: string | null;
}

const WEEKDAY_LABELS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const MONTH_LABELS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const TYPE_LABELS: Record<CalendarEvent["type"], string> = {
  task: "টাস্ক",
  study_plan: "স্টাডি প্ল্যান",
  routine: "রুটিন",
  exam: "পরীক্ষা",
};

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CalendarView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ক্যালেন্ডার লোড করা যায়নি");
        return;
      }
      setEvents(data.events);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  function handlePrevMonth() {
    setSelectedDate(null);
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    setSelectedDate(null);
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // মাসের প্রথম দিন কোন বার (0=রবি) এবং মোট কতদিন — গ্রিড বানানোর জন্য
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const list = eventsByDate.get(ev.date) ?? [];
    list.push(ev);
    eventsByDate.set(ev.date, list);
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <CalendarDays className="h-4.5 w-4.5 text-primary" />
          ক্যালেন্ডার
        </h2>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth} aria-label="আগের মাস">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-28 text-center">
            {MONTH_LABELS[month - 1]} {year}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth} aria-label="পরের মাস">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="text-center text-xs text-muted-foreground py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;

              const dateKey = toDateKey(year, month, day);
              const dayEvents = eventsByDate.get(dateKey) ?? [];
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={cn(
                    "aspect-square rounded-lg border text-xs flex flex-col items-center justify-center gap-0.5 transition-colors relative p-1",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : isToday
                        ? "border-primary/50 bg-primary/5"
                        : "border-transparent hover:bg-muted"
                  )}
                >
                  <span className={cn("font-medium", isToday && "text-primary")}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center max-w-full">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ev.colorHex }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-xs text-muted-foreground leading-none">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* নির্বাচিত দিনের ইভেন্ট বিস্তারিত */}
          {selectedDate && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {selectedDate} — {selectedEvents.length > 0 ? `${selectedEvents.length}টা ইভেন্ট` : "কোনো ইভেন্ট নেই"}
              </p>
              <div className="space-y-1.5">
                {selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: ev.colorHex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("truncate", ev.isCompleted && "line-through text-muted-foreground")}>
                        {ev.title}
                      </p>
                      {ev.timeLabel && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {ev.timeLabel}
                        </p>
                      )}
                    </div>
                    {ev.isCompleted !== null && ev.isCompleted && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    <Badge variant="outline" className="text-xs shrink-0">
                      {TYPE_LABELS[ev.type]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
