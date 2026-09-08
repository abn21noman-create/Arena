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
import { ArrowLeft, Calculator, Loader2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { MathText } from "@/components/shared/math-text";
import { FadeIn } from "@/components/motion/fade-in";

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
        <div className="mb-5 flex items-center gap-3">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Calculator className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
              ফর্মুলা খুঁজুন
            </h1>
            <p className="text-sm text-muted-foreground">
              সব বিষয়ের সূত্র এক জায়গা থেকে দ্রুত খুঁজে বের করো
            </p>
          </div>
        </div>
      </FadeIn>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          ফর্মুলা খুঁজুন আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-fuchsia-700 to-violet-900 p-5 mb-4 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Calculator className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">৫৩০+ সূত্র, এক সার্চে</p>
            <p className="text-sm opacity-90">পরীক্ষার ঠিক আগে দ্রুত খুঁজে নাও</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="যেমন: sin, ভরবেগ, নিউটনের সূত্র..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
      </div>

      {/* সাবজেক্ট ফিল্টার চিপ */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => handleSubjectFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            subjectCode === null
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          সব বিষয়
        </button>
        {VALID_SUBJECT_CODES.map((code) => (
          <button
            key={code}
            onClick={() => handleSubjectFilter(code)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              subjectCode === code
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            {SUBJECT_NAMES[code] ?? code}
          </button>
        ))}
      </div>

      {query.trim().length < 2 ? (
        <Card className="p-10 text-center">
          <Calculator className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="mb-1 font-medium">অন্তত ২ অক্ষর লিখো খোঁজার জন্য</p>
          <p className="text-sm text-muted-foreground">
            বিষয়ের নাম, রাশির নাম (যেমন &quot;ভরবেগ&quot;), বা সূত্রের অংশ (যেমন
            &quot;sin&quot;) দিয়ে খোঁজো
          </p>
        </Card>
      ) : !loading && searched && results.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-medium">কোনো সূত্র পাওয়া যায়নি &quot;{query}&quot; এর জন্য</p>
          <p className="mt-1 text-sm text-muted-foreground">অন্য শব্দ দিয়ে চেষ্টা করো</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {results.map((r, idx) => (
            <Link key={`${r.topicId}-${idx}`} href={`/learn/${r.subjectId}/${r.topicId}`}>
              <Card className="hover-lift cursor-pointer p-4">
                <p className="mb-1.5 text-xs text-muted-foreground">
                  {r.subjectName} • {r.chapterName} • {r.topicName}
                </p>
                <p className="text-sm leading-relaxed">
                  <MathText text={r.entry} />
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
