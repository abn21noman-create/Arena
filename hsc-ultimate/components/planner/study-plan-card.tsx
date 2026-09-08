"use client";

// ===================================================================
// Auto Study Plan Card — AI জেনারেটেড দৈনিক পড়াশোনার পরিকল্পনা
// -------------------------------------------------------------------
// 🆕 নমনীয় Duration (ব্যবহারকারীর অনুরোধ অনুযায়ী): আগে ফিক্সড ৭ দিন
// ছিল, এখন ১/৭/৩০/৩৬৫ দিন (বা কাস্টম) বেছে নেওয়া যায়। দুর্বল টপিক ও
// exam countdown বিশ্লেষণ করে AI প্ল্যান বানায়। প্রতিটা দিনের আইটেম
// চেকবক্স দিয়ে সম্পূর্ণ মার্ক করা যায় (+5 XP প্রতি আইটেমে)। ৩০ দিনের
// বেশি প্ল্যানে AI ব্যাকগ্রাউন্ডে ধাপে ধাপে (মাসিক chunk) জেনারেট করে —
// এই কার্ড generationStatus পোলিং করে অগ্রগতি দেখায়।
// ===================================================================
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import {
  SUBJECT_NAMES,
  PRIORITY_STYLES,
  PRIORITY_LABELS,
  DURATION_OPTIONS,
} from "@/lib/study-plan-ui-constants";

interface StudyPlanItem {
  id: string;
  date: string;
  subjectCode: string;
  topicName: string | null;
  taskDescription: string;
  durationMinutes: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  isCompleted: boolean;
}

interface StudyPlan {
  id: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  daysUntilExam: number;
  generationStatus: "GENERATING" | "READY" | "FAILED";
  daysGenerated: number;
  generationError: string | null;
  items: StudyPlanItem[];
}

const GENERATION_POLL_MS = 8000;

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "আজ";
  if (diffDays === 1) return "আগামীকাল";
  if (diffDays < 0) return `${Math.abs(diffDays)} দিন আগে (বকেয়া)`;

  const days = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];
  return `${days[date.getDay()]}বার (${date.getDate()}/${date.getMonth() + 1})`;
}

export function StudyPlanCard() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [durationDialogOpen, setDurationDialogOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(7);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadPlan() {
    try {
      const res = await fetch("/api/study-plan");
      const data = await res.json();
      setPlan(data.plan);
    } catch {
      toast.error("স্টাডি প্ল্যান লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlan();
  }, []);

  // ব্যাকগ্রাউন্ড chunk জেনারেশন চলাকালীন পোলিং (৩০+ দিনের প্ল্যানে)
  useEffect(() => {
    if (plan?.generationStatus === "GENERATING") {
      pollRef.current = setInterval(() => void loadPlan(), GENERATION_POLL_MS);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [plan?.generationStatus]);

  async function handleGenerate(durationDays: number) {
    setGenerating(true);
    setDurationDialogOpen(false);
    try {
      const res = await fetch("/api/study-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationDays }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "স্টাডি প্ল্যান তৈরি করা যায়নি");
        return;
      }

      setPlan(data.plan);
      toast.success(
        durationDays > 30
          ? "প্রথম মাসের প্ল্যান তৈরি হয়েছে, বাকিটা ব্যাকগ্রাউন্ডে বানানো হচ্ছে!"
          : "তোমার জন্য নতুন স্টাডি প্ল্যান তৈরি হয়েছে!"
      );
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleItem(item: StudyPlanItem) {
    const newCompleted = !item.isCompleted;
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.id === item.id ? { ...i, isCompleted: newCompleted } : i
            ),
          }
        : prev
    );

    try {
      const res = await fetch(`/api/study-plan/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newCompleted }),
      });
      const data = await res.json();
      if (data.newBadges) showNewBadgeToasts(data.newBadges);
    } catch {
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  }

  // দিন অনুযায়ী গ্রুপ করা
  const groupedByDate = plan
    ? plan.items.reduce<Record<string, StudyPlanItem[]>>((acc, item) => {
        const key = item.date.slice(0, 10);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {})
    : {};

  const sortedDates = Object.keys(groupedByDate).sort();
  const isExpired = plan ? new Date() > new Date(plan.endDate) : false;
  const isGenerating = plan?.generationStatus === "GENERATING";
  const isFailed = plan?.generationStatus === "FAILED";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Auto Study Plan (AI জেনারেটেড)
        </h2>
        <Dialog open={durationDialogOpen} onOpenChange={setDurationDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" variant="outline" className="gap-1.5" disabled={generating}>
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : plan ? (
                  <RotateCcw className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {plan ? "নতুন প্ল্যান বানাও" : "প্ল্যান বানাও"}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>কতদিনের প্ল্যান চাও?</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => {
                    setSelectedDuration(opt.days);
                    void handleGenerate(opt.days);
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border p-4 text-center hover:bg-muted hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-lg font-bold">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
            {selectedDuration > 30 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                ৩০ দিনের বেশি প্ল্যানে প্রথমে এক মাসের প্ল্যান তৈরি হবে, বাকিটা AI ব্যাকগ্রাউন্ডে ধাপে ধাপে বানাবে
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        তোমার দুর্বল টপিক ও পরীক্ষার সময় বিশ্লেষণ করে AI তোমার পছন্দমতো মেয়াদের প্ল্যান বানাবে
        (১ দিন থেকে পূর্ণ ১ বছর পর্যন্ত)
      </p>

      {plan && (
        <div className="mb-3 flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            মেয়াদ: {plan.durationDays} দিন
          </Badge>
          {isGenerating && (
            <Badge variant="outline" className="text-xs gap-1 border-violet-500 text-violet-700 dark:text-violet-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              {plan.daysGenerated}/{plan.durationDays} দিন প্রস্তুত
            </Badge>
          )}
        </div>
      )}

      {isFailed && (
        <Alert variant="destructive" className="mb-4 text-xs">
          <AlertTriangle className="h-3.5 w-3.5" />
          <AlertDescription>
            পুরো প্ল্যান জেনারেট করতে সমস্যা হয়েছে ({plan?.generationError ?? "অজানা সমস্যা"}) —
            এখন পর্যন্ত জেনারেট হওয়া অংশ ঠিক আছে, চাইলে আবার &quot;নতুন প্ল্যান বানাও&quot; চেষ্টা করো।
          </AlertDescription>
        </Alert>
      )}

      {isExpired && !isGenerating && (
        <Alert variant="warning" className="mb-4 text-xs">
          <Clock className="h-3.5 w-3.5" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            এই প্ল্যানের মেয়াদ শেষ হয়ে গেছে — উপরে &quot;নতুন প্ল্যান বানাও&quot; চেপে
            নতুন প্ল্যান বানিয়ে নাও।
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !plan ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">
            এখনো কোনো স্টাডি প্ল্যান নেই। উপরে &quot;প্ল্যান বানাও&quot; চাপো!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {formatDateLabel(dateKey)}
              </p>
              <div className="space-y-2">
                {groupedByDate[dateKey].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/60",
                      item.isCompleted && "opacity-60"
                    )}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {SUBJECT_NAMES[item.subjectCode] ?? item.subjectCode}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", PRIORITY_STYLES[item.priority])}
                        >
                          {PRIORITY_LABELS[item.priority]}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {item.durationMinutes} মিনিট
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-sm",
                          item.isCompleted && "line-through"
                        )}
                      >
                        {item.taskDescription}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              বাকি দিনগুলোর প্ল্যান ব্যাকগ্রাউন্ডে তৈরি হচ্ছে...
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
