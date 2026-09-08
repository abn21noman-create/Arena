"use client";

// ===================================================================
// HSC Exam Countdown কার্ড — কতদিন বাকি আছে দেখায়, তারিখ এডিট করা যায়
// ===================================================================
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Pencil, Loader2 } from "lucide-react";
import { getCountdown } from "@/lib/exam-countdown";

export function ExamCountdownCard({
  hscBatch,
  examDate,
}: {
  hscBatch: number;
  examDate: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [dateInput, setDateInput] = useState(
    examDate ? examDate.slice(0, 10) : ""
  );
  const [loading, setLoading] = useState(false);

  const countdown = useMemo(
    () => getCountdown(examDate ? new Date(examDate) : null, hscBatch),
    [examDate, hscBatch]
  );

  async function handleSave() {
    if (!dateInput) {
      toast.error("একটা তারিখ বেছে নাও");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/exam-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDate: dateInput }),
      });
      if (!res.ok) {
        toast.error("তারিখ সেভ করা যায়নি");
        return;
      }
      toast.success("এক্সাম ডেট আপডেট হয়েছে!");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-hero glass-hero-card relative overflow-hidden p-5 bg-linear-to-br from-violet-700 via-fuchsia-700 to-fuchsia-800 text-white border-none">
      {/* established glassmorphism রাউন্ড ২ এক্সটেনশন — Leaderboard/
          Settings/Dashboard tier card এর একই `.glass-hero-orb` প্যাটার্ন
          Planner এর সবচেয়ে prominent card এও consistency এর জন্য */}
      <div
        aria-hidden
        className="glass-hero-orb h-32 w-32 bg-white/20"
        style={{ top: "-3rem", right: "-2rem" }}
      />
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <span className="text-sm font-medium opacity-90">HSC এক্সাম কাউন্টডাউন</span>
        </div>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="flex h-9 w-9 items-center justify-center rounded-lg opacity-70 transition-[opacity,background-color] hover:bg-white/10 hover:opacity-100"
          aria-label="পরীক্ষার তারিখ পরিবর্তন করো"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {editing ? (
        <div className="relative z-10 space-y-2">
          <Label htmlFor="exam-countdown-date" className="text-white/80 text-xs">তোমার HSC পরীক্ষার তারিখ</Label>
          <Input
            id="exam-countdown-date"
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="bg-white/10 border-white/30 text-white"
          />
          <Button
            onClick={handleSave}
            disabled={loading}
            size="sm"
            className="w-full bg-white text-violet-700 hover:bg-white/90"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            সেভ করো
          </Button>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="text-4xl font-bold mb-1">
            {countdown.isPast ? "🎉" : countdown.daysLeft}
          </div>
          <p className="text-sm opacity-90">
            {countdown.isPast
              ? "তোমার HSC পরীক্ষা শুরু হয়ে গেছে, শুভকামনা!"
              : `দিন বাকি আছে (আনুমানিক: ${countdown.examDate.toLocaleDateString(
                  "bn-BD",
                  { year: "numeric", month: "long", day: "numeric" }
                )})`}
          </p>
          {!examDate && !countdown.isPast && (
            <p className="text-xs opacity-70 mt-2">
              💡 এটা একটা আনুমানিক তারিখ, নিজের বোর্ডের রুটিন অনুযায়ী ঠিক করে নাও (✏️)
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
