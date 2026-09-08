"use client";

// ===================================================================
// Exam-Day Retention Forecast Card — "পরীক্ষার দিনে কত % মনে থাকবে?"
// -------------------------------------------------------------------
// FSRS ফ্ল্যাশকার্ড ডেটা থেকে exam date পর্যন্ত predicted retention %
// দেখায় (docs/FEATURE_RESEARCH_V4.md এ গবেষণা+ডিজাইন বিস্তারিত)।
// কোনো reviewed FSRS card না থাকলে friendly empty-state দেখায়।
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Loader2, Info, ArrowRight } from "lucide-react";

interface SubjectRetentionSummary {
  subjectCode: string;
  subjectName: string;
  cardCount: number;
  currentRetentionPct: number;
  examDayRetentionPct: number;
}

interface RetentionSamplePoint {
  date: string;
  daysFromNow: number;
  avgRetentionPct: number | null;
}

interface RetentionForecastData {
  hasData: boolean;
  examDate: string | null;
  daysUntilExam: number;
  isPastExam: boolean;
  overallCurrentRetentionPct: number | null;
  overallExamDayRetentionPct: number | null;
  timeline: RetentionSamplePoint[];
  subjects: SubjectRetentionSummary[];
  totalReviewedCards: number;
  totalCards: number;
}

function retentionColor(pct: number): string {
  if (pct >= 80) return "text-violet-600 dark:text-violet-400";
  if (pct >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function retentionBadgeVariant(pct: number): "default" | "secondary" | "destructive" {
  if (pct >= 80) return "default";
  if (pct >= 60) return "secondary";
  return "destructive";
}

export function RetentionForecastCard() {
  const [data, setData] = useState<RetentionForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics/retention-forecast");
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <Card className="p-5 mb-5 flex items-center justify-center min-h-32">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="p-5 mb-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          পরীক্ষার দিনে কত % মনে থাকবে?
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        তোমার ফ্ল্যাশকার্ড রিভিউ ডেটা (FSRS) থেকে অনুমান করা — এখন থেকে
        নিয়মিত রিভিউ না করলে পরীক্ষার দিনে কতটুকু মনে থাকবে তার প্রক্ষেপণ
      </p>

      {!data.hasData ? (
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <Info className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            এখনো কোনো ফ্ল্যাশকার্ড রিভিউ করোনি। ফ্ল্যাশকার্ড রিভিউ শুরু করলে
            এখানে তোমার retention forecast দেখা যাবে।
          </p>
          <Link
            href="/flashcards"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ফ্ল্যাশকার্ড শুরু করো <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {/* সামগ্রিক সংখ্যা */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">এখনকার গড় Retention</p>
              <p
                className={`text-2xl font-bold ${retentionColor(
                  data.overallCurrentRetentionPct ?? 0
                )}`}
              >
                {data.overallCurrentRetentionPct}%
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {data.isPastExam
                  ? "পরীক্ষার দিনের Retention"
                  : `পরীক্ষার দিনে (${data.daysUntilExam} দিন পরে)`}
              </p>
              <p
                className={`text-2xl font-bold ${retentionColor(
                  data.overallExamDayRetentionPct ?? 0
                )}`}
              >
                {data.overallExamDayRetentionPct}%
              </p>
            </div>
          </div>

          {/* Timeline chart */}
          {data.timeline.length > 1 && !data.isPastExam && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data.timeline}>
                  <defs>
                    <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis
                    dataKey="daysFromNow"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v: number) => `${v}দিন`}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "গড় Retention"]}
                    labelFormatter={(label) => `আজ থেকে ${label} দিন পরে`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgRetentionPct"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#retentionGradient)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* সাবজেক্ট ব্রেকডাউন */}
          {data.subjects.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                বিষয়-ভিত্তিক (দুর্বল আগে দেখানো হয়েছে)
              </p>
              {data.subjects.map((s) => (
                <div
                  key={s.subjectCode}
                  className="flex items-center justify-between gap-2 rounded-md border p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.subjectName}</p>
                    <p className="text-xs text-muted-foreground">{s.cardCount}টা কার্ড</p>
                  </div>
                  <Badge variant={retentionBadgeVariant(s.examDayRetentionPct)} className="shrink-0">
                    {s.examDayRetentionPct}%
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            💡 {data.totalReviewedCards}/{data.totalCards} টা কার্ড এখনো রিভিউ করা হয়েছে। এই
            অনুমান শুধু FSRS spaced-repetition মডেলের গাণিতিক প্রক্ষেপণ — নিয়মিত রিভিউ চালিয়ে
            গেলে প্রকৃত retention এর চেয়ে ভালো হবে।
          </p>
        </>
      )}
    </Card>
  );
}
