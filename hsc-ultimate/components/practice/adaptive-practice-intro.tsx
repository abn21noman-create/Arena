"use client";

// ===================================================================
// Adaptive Practice Intro — দুর্বল টপিক প্রিভিউ দেখিয়ে সেশন শুরু করার
// কনফার্মেশন স্ক্রিন (Khan Academy/ALEKS-স্টাইল "here's what you should
// focus on" প্যাটার্ন)
// ===================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, Target, TrendingDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

interface WeakTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracyPct: number;
  totalAnswered: number;
  peerAvgAccuracyPct: number | null;
  peerCount: number;
}

export function AdaptivePracticeIntro() {
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/adaptive-practice/preview")
      .then((res) => res.json())
      .then((data) => setWeakTopics(data.weakTopics ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch("/api/adaptive-practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 15 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "শুরু করা যায়নি");
        return;
      }
      sessionStorage.setItem("adaptive_practice_questions", JSON.stringify(data.questions));
      router.push("/adaptive-practice/run");
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
              <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" /> স্মার্ট অনুশীলন
            </h1>
            <p className="text-sm text-muted-foreground">তোমার দুর্বল টপিক থেকে টার্গেটেড প্রশ্ন</p>
          </div>
        </div>
      </FadeIn>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Smart Practice আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-700 to-fuchsia-800 p-5 mb-4 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Sparkles className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">AI বাছাই করা টার্গেটেড প্রশ্ন</p>
            <p className="text-sm opacity-90">
              {weakTopics.length > 0
                ? `${weakTopics.length}টা দুর্বল টপিক চিহ্নিত হয়েছে`
                : "তোমার দুর্বলতা বিশ্লেষণ করে প্রশ্ন বাছাই হবে"}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : weakTopics.length > 0 ? (
        <>
          <Card className="mb-4 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" /> তোমার দুর্বল টপিক
            </h2>
            <div className="space-y-2">
              {weakTopics.slice(0, 5).map((t) => (
                <div key={t.topicId} className="rounded-lg bg-muted/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.topicName}</p>
                      <p className="text-xs text-muted-foreground">{t.subjectName}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "shrink-0",
                        t.accuracyPct < 40 ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      )}
                    >
                      {t.accuracyPct}% সঠিক
                    </Badge>
                  </div>
                  {/* Peer Comparison — অন্য ইউজারদের গড়ের সাথে তুলনা (পর্যাপ্ত ডেটা থাকলেই দেখানো হয়) */}
                  {t.peerAvgAccuracyPct !== null && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      তোমার মতো দুর্বলতাযুক্ত অন্যরা এই টপিকে গড়ে{" "}
                      <span
                        className={cn(
                          "font-medium",
                          t.peerAvgAccuracyPct > t.accuracyPct
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-violet-600 dark:text-violet-400"
                        )}
                      >
                        {t.peerAvgAccuracyPct}%
                      </span>{" "}
                      ভালো করেছে ({t.peerCount} জনের ডেটা)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
          <p className="mb-4 text-sm text-muted-foreground">
            এই টপিকগুলো থেকে এবং তোমার আগে ভুল করা প্রশ্ন থেকে ১৫টা প্রশ্নের একটা কুইজ তৈরি করা হবে।
          </p>
        </>
      ) : (
        <Card className="mb-4 p-6 text-center">
          <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            এখনো তোমার কোনো স্পষ্ট দুর্বলতা পাওয়া যায়নি (হয় নতুন, নয়তো সব ভালো করছো!) —
            গুরুত্বপূর্ণ টপিক থেকে একটা প্র্যাকটিস সেট তৈরি করা হবে।
          </p>
        </Card>
      )}

      <Button onClick={handleStart} disabled={starting} className="w-full gap-2" size="lg">
        {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {starting ? "তৈরি হচ্ছে..." : "Smart Practice শুরু করো"}
      </Button>
    </div>
  );
}
