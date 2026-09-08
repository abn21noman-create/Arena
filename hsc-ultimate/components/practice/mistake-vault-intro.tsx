"use client";

// ===================================================================
// মিস্টেক ভল্ট (Mistake Vault) — ভুল করা প্রশ্নের ভান্ডার
// -------------------------------------------------------------------
// SATT Academy-অনুপ্রাণিত ফিচার (docs/MASTER_PLAN.md এ বিস্তারিত
// গবেষণা+ডিজাইন) — Adaptive Practice এর "দুর্বল টপিক" ধারণার থেকে
// ভিন্ন: এখানে ইউজার ইচ্ছাকৃতভাবে *শুধু* নিজের ভুল করা প্রশ্নগুলো
// একসাথে রিভিশন দেয়, কোনো টপিক-মিশ্রণ ছাড়া।
// ===================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, BookX, Loader2, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

interface SubjectBreakdown {
  subjectCode: string;
  subjectName: string;
  count: number;
}

interface VaultSummary {
  totalCount: number;
  bySubject: SubjectBreakdown[];
}

export function MistakeVaultIntro() {
  const router = useRouter();
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/mistake-vault")
      .then((res) => res.json())
      .then((data: VaultSummary) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      const url = selectedSubjectCode
        ? `/api/mistake-vault?start=true&subjectCode=${selectedSubjectCode}`
        : "/api/mistake-vault?start=true";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "শুরু করা যায়নি");
        return;
      }
      if (!data.questions || data.questions.length === 0) {
        toast.error("এই মুহূর্তে রিভিশনের জন্য কোনো প্রশ্ন নেই");
        return;
      }
      sessionStorage.setItem("mistake_vault_session", JSON.stringify({ questions: data.questions }));
      router.push("/mistake-vault/run");
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
            <BookX className="h-6 w-6 text-rose-600 dark:text-rose-400" /> মিস্টেক ভল্ট
          </h1>
          <p className="text-sm text-muted-foreground">
            যেসব প্রশ্নে ভুল করেছো, শুধু সেগুলোই রিভিশন দাও
          </p>
        </div>
      </div>
      </FadeIn>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          মিস্টেক ভল্ট আইটেম গ্রেডিয়েন্ট) */}
      {!loading && summary && summary.totalCount > 0 && (
        <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-800 to-fuchsia-900 p-5 mb-4 text-white">
          <div
            aria-hidden
            className="glass-hero-orb h-32 w-32 bg-white/20"
            style={{ top: "-2rem", right: "-1.5rem" }}
          />
          <div className="relative z-10 flex items-center gap-3">
            <BookX className="h-7 w-7 opacity-90" />
            <div>
              <p className="text-2xl font-bold">{summary.totalCount} টি প্রশ্ন রিভিশনের অপেক্ষায়</p>
              <p className="text-sm opacity-90">শুধু নিজের ভুল করা প্রশ্নগুলোই রিভিশন দাও</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !summary || summary.totalCount === 0 ? (
        <Card className="p-8 text-center">
          <PartyPopper className="h-10 w-10 text-violet-600 dark:text-violet-400 mx-auto mb-3" />
          <p className="font-medium mb-1">দারুণ! তোমার ভল্ট খালি</p>
          <p className="text-sm text-muted-foreground">
            এখন কোনো ভুল প্রশ্ন নেই — প্র্যাকটিস চালিয়ে যাও, ভুল করলে এখানেই জমা হবে
          </p>
        </Card>
      ) : (
        <>
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground">সব মিলিয়ে</h2>
              <Badge variant="secondary" className="gap-1">
                {summary.totalCount}টা ভুল প্রশ্ন
              </Badge>
            </div>
            <button
              onClick={() => setSelectedSubjectCode(null)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors mb-2",
                selectedSubjectCode === null ? "border-primary bg-primary/5" : "hover:bg-muted"
              )}
            >
              <p className="text-sm font-medium">সব সাবজেক্ট একসাথে</p>
              <p className="text-xs text-muted-foreground">{summary.totalCount}টা প্রশ্ন</p>
            </button>
            <div className="grid grid-cols-2 gap-2">
              {summary.bySubject.map((s) => (
                <button
                  key={s.subjectCode}
                  onClick={() => setSelectedSubjectCode(s.subjectCode)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    selectedSubjectCode === s.subjectCode
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  )}
                >
                  <p className="text-sm font-medium truncate">{s.subjectName}</p>
                  <p className="text-xs text-muted-foreground">{s.count}টা প্রশ্ন</p>
                </button>
              ))}
            </div>
          </Card>

          <Button onClick={handleStart} disabled={starting} className="w-full gap-2" size="lg">
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookX className="h-4 w-4" />}
            {starting ? "তৈরি হচ্ছে..." : "রিভিশন শুরু করো"}
          </Button>
        </>
      )}
    </div>
  );
}
