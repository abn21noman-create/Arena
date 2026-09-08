"use client";

// ===================================================================
// Formula Quick Search — ক্লায়েন্ট কম্পোনেন্ট
// -------------------------------------------------------------------
// পরীক্ষার ঠিক আগে দ্রুত সূত্র খুঁজে পাওয়ার জন্য নতুন ফিচার। একটা
// সিঙ্গেল সার্চ বক্সে টাইপ করলেই সব বিষয়ের formulaSheet এন্ট্রি থেকে
// ম্যাচ খুঁজে দেখায়, সাবজেক্ট চিপ দিয়ে ফিল্টার করা যায়।
// ===================================================================
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Loader2, Search, Sparkles, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { MathText } from "@/components/shared/math-text";
import { FadeIn } from "@/components/motion/fade-in";
import { FormulaToFlashcardButton } from "@/components/formula-search/formula-to-flashcard-button";
import { VoiceReadoutButton } from "@/components/shared/voice-readout-button";
import { openScientificCalculator } from "@/components/shared/scientific-calculator";

interface FormulaResult {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  chapterName: string;
  entry: string;
}

export function FormulaSearchPage() {
  const [query, setQuery] = useState("");
  const [subjectCode, setSubjectCode] = useState<string | null>(null);
  const [results, setResults] = useState<FormulaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string, subject: string | null) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q });
      if (subject) params.set("subjectCode", subject);
      const res = await fetch(`/api/formula-search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void runSearch(value, subjectCode), 300);
  }

  function handleSubjectFilter(code: string | null) {
    setSubjectCode(code);
    if (query.trim().length >= 2) {
      void runSearch(query, code);
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <FadeIn direction="down" duration={0.4}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <Calculator className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
                ফর্মুলা ও সূত্রাবলি
              </h1>
              <p className="text-sm text-muted-foreground">
                সব বিষয়ের সূত্র এক জায়গা থেকে দ্রুত খুঁজে বের করো
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={openScientificCalculator}
          >
            <Calculator className="h-3.5 w-3.5 text-primary" />
            <span>ক্যালকুলেটর ও ধ্রুবক</span>
          </Button>
        </div>
      </FadeIn>

      {/* glassmorphism hero banner */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-700 to-violet-900 p-5 mb-4 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Calculator className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">৫৩০+ সূত্র, এক সার্চে</p>
            <p className="text-xs opacity-90">পরীক্ষার ঠিক আগে দ্রুত খুঁজে নাও ও ১-ক্লিকে ফ্ল্যাশকার্ডে রূপান্তর করো</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border bg-card px-4 py-3 shadow-xs">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="যেমন: sin, ভরবেগ, নিউটনের সূত্র, কুলম্বের সূত্র..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
      </div>

      {/* সাবজেক্ট ফিল্টার চিপ */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => handleSubjectFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            subjectCode === null
              ? "border-primary bg-primary text-primary-foreground font-semibold"
              : "hover:bg-muted"
          )}
        >
          সব বিষয়
        </button>
        {VALID_SUBJECT_CODES.map((code) => (
          <button
            type="button"
            key={code}
            onClick={() => handleSubjectFilter(code)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              subjectCode === code
                ? "border-primary bg-primary text-primary-foreground font-semibold"
                : "hover:bg-muted"
            )}
          >
            {SUBJECT_NAMES[code] ?? code}
          </button>
        ))}
      </div>

      {query.trim().length < 2 ? (
        <Card className="p-10 text-center">
          <Calculator className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="mb-1 font-medium text-sm">অন্তত ২ অক্ষর লিখো খোঁজার জন্য</p>
          <p className="text-xs text-muted-foreground">
            বিষয়ের নাম, রাশির নাম (যেমন &quot;ভরবেগ&quot;), বা সূত্রের অংশ (যেমন
            &quot;sin&quot;) দিয়ে খোঁজো
          </p>
        </Card>
      ) : !loading && searched && results.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-medium text-sm">কোনো সূত্র পাওয়া যায়নি &quot;{query}&quot; এর জন্য</p>
          <p className="mt-1 text-xs text-muted-foreground">অন্য শব্দ বা বাংলায় লিখে চেষ্টা করো</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((r, idx) => (
            <Card key={`${r.topicId}-${idx}`} className="p-4 transition hover:border-primary/40">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Link
                  href={`/learn/${r.subjectId}/${r.topicId}`}
                  className="text-xs text-muted-foreground hover:text-primary transition font-medium truncate"
                >
                  {r.subjectName} • {r.chapterName} • {r.topicName}
                </Link>
                <div className="flex items-center gap-1.5 shrink-0">
                  <VoiceReadoutButton text={r.entry} />
                  <FormulaToFlashcardButton
                    formulaText={r.entry}
                    topicName={r.topicName}
                    chapterName={r.chapterName}
                    subjectName={r.subjectName}
                  />
                </div>
              </div>

              <div className="text-sm leading-relaxed pt-1">
                <MathText text={r.entry} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
