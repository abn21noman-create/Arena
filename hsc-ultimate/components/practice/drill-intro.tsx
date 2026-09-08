"use client";

// ===================================================================
// Timed Drill Intro — সাবজেক্ট + সময়সীমা বেছে নেওয়ার স্ক্রিন
// ===================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Zap, Loader2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { DRILL_DURATIONS, DEFAULT_DRILL_DURATION } from "@/lib/drill-practice";
import { FadeIn } from "@/components/motion/fade-in";

interface Subject {
  id: string;
  name: string;
  nameEn: string;
  colorHex: string;
  questionCount: number;
}

export function DrillIntro() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(DEFAULT_DRILL_DURATION);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/drill/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data.subjects ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart() {
    if (!selectedSubjectId || starting) return;
    setStarting(true);
    try {
      const res = await fetch("/api/drill/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: selectedSubjectId, durationSec: duration }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "শুরু করা যায়নি");
        return;
      }
      sessionStorage.setItem("drill_session", JSON.stringify(data));
      router.push("/drill/run");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <FadeIn direction="down" duration={0.4}>
        <div className="mb-6 flex items-center gap-3">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" /> সময়-নির্ধারিত ড্রিল
            </h1>
            <p className="text-sm text-muted-foreground">
              টাইমারের বিরুদ্ধে দৌড়ে যত বেশি সম্ভব সঠিক উত্তর দাও
            </p>
          </div>
        </div>
      </FadeIn>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Timed Drill আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-700 to-violet-800 p-5 mb-4 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Zap className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">সময়ের বিরুদ্ধে দৌড়াও</p>
            <p className="text-sm opacity-90">সাবজেক্ট ও সময়সীমা বেছে নিয়ে এখনই শুরু করো</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card className="mb-4 p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">সাবজেক্ট বেছে নাও</h2>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  disabled={s.questionCount === 0}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    selectedSubjectId === s.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                  )}
                >
                  <div
                    className="mb-1.5 h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: s.colorHex }}
                  >
                    {s.nameEn.slice(0, 1)}
                  </div>
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.questionCount} প্রশ্ন</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="mb-4 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Timer className="h-3.5 w-3.5" /> সময়সীমা
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {DRILL_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "rounded-lg border py-2.5 text-sm font-medium transition-colors",
                    duration === d ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"
                  )}
                >
                  {d} সেকেন্ড
                </button>
              ))}
            </div>
          </Card>

          <Button
            onClick={handleStart}
            disabled={!selectedSubjectId || starting}
            className="w-full gap-2"
            size="lg"
          >
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {starting ? "তৈরি হচ্ছে..." : "ড্রিল শুরু করো"}
          </Button>
        </>
      )}
    </div>
  );
}
