"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubjectMasteryData {
  subjectId: string;
  subjectName: string;
  scorePercent: number;
  totalQuestionsSolved: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
}

interface SubjectWeaknessRadarProps {
  data?: SubjectMasteryData[];
}

const DEFAULT_SUBJECTS: SubjectMasteryData[] = [
  {
    subjectId: "physics-1",
    subjectName: "পদার্থবিজ্ঞান ১ম",
    scorePercent: 78,
    totalQuestionsSolved: 145,
    accuracy: 82,
    weakTopics: ["কাজ, শক্তি ও ক্ষমতা", "মহাকর্ষ ও অভিকর্ষ"],
    strongTopics: ["ভেক্টর", "গতিবিদ্যা"],
  },
  {
    subjectId: "physics-2",
    subjectName: "পদার্থবিজ্ঞান ২য়",
    scorePercent: 64,
    totalQuestionsSolved: 110,
    accuracy: 68,
    weakTopics: ["চল তড়িৎ", "তাপগতিবিদ্যা"],
    strongTopics: ["স্থির তড়িৎ", "পরমাণু মডেল"],
  },
  {
    subjectId: "chemistry-1",
    subjectName: "রসায়ন ১ম",
    scorePercent: 85,
    totalQuestionsSolved: 210,
    accuracy: 88,
    weakTopics: ["গুণগত রসায়ন (দ্রাব্যতা)"],
    strongTopics: ["মৌলের পর্যায়বৃত্ত ধর্ম", "রাসায়নিক পরিবর্তন"],
  },
  {
    subjectId: "chemistry-2",
    subjectName: "রসায়ন ২য়",
    scorePercent: 58,
    totalQuestionsSolved: 95,
    accuracy: 60,
    weakTopics: ["জৈব রসায়ন (অ্যারোমেটিসিটি)", "পরিবেশ রসায়ন"],
    strongTopics: ["তড়িৎ রসায়ন", "পরিমাণগত রসায়ন"],
  },
  {
    subjectId: "math-1",
    subjectName: "উচ্চতর গণিত ১ম",
    scorePercent: 82,
    totalQuestionsSolved: 190,
    accuracy: 84,
    weakTopics: ["অন্তরীকরণ (ত্রিকোণমিতিক সীমা)"],
    strongTopics: ["ম্যাট্রিক্স ও নির্ণায়ক", "সরলরেখা"],
  },
  {
    subjectId: "math-2",
    subjectName: "উচ্চতর গণিত ২য়",
    scorePercent: 70,
    totalQuestionsSolved: 130,
    accuracy: 72,
    weakTopics: ["কণিক (উপবৃত্ত ও অধিবৃত্ত)", "স্থিতিবিদ্যা"],
    strongTopics: ["জটিল সংখ্যা", "বহুপদী"],
  },
  {
    subjectId: "biology",
    subjectName: "জীববিজ্ঞান",
    scorePercent: 75,
    totalQuestionsSolved: 160,
    accuracy: 78,
    weakTopics: ["কোষ বিভাজন (মিয়োসিস)", "শ্বসনতন্ত্র"],
    strongTopics: ["কোষ ও এর গঠন", "জিনতত্ত্ব"],
  },
  {
    subjectId: "ict",
    subjectName: "আইসিটি (ICT)",
    scorePercent: 92,
    totalQuestionsSolved: 180,
    accuracy: 94,
    weakTopics: ["C প্রোগ্রামিং (অ্যারে ও ফাংশন)"],
    strongTopics: ["সংখ্যা পদ্ধতি", "HTML ও ওয়েব ডিজাইন"],
  },
];

export function SubjectWeaknessRadar({ data = DEFAULT_SUBJECTS }: SubjectWeaknessRadarProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectMasteryData | null>(data[0] || null);

  const radarPoints = useMemo(() => {
    const total = data.length;
    const center = 150;
    const radius = 110;
    const angleStep = (Math.PI * 2) / total;

    const points = data.map((item, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const normalized = Math.max(10, Math.min(100, item.scorePercent)) / 100;
      const r = radius * normalized;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);

      // Label positions slightly further out
      const labelR = radius + 24;
      const lx = center + labelR * Math.cos(angle);
      const ly = center + labelR * Math.sin(angle);

      return {
        ...item,
        x,
        y,
        lx,
        ly,
        axisX: center + radius * Math.cos(angle),
        axisY: center + radius * Math.sin(angle),
      };
    });

    const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");
    return { points, polygonPath, center, radius };
  }, [data]);

  // Weakest & Strongest Subject Detection
  const sortedByScore = useMemo(() => {
    return [...data].sort((a, b) => a.scorePercent - b.scorePercent);
  }, [data]);

  const weakest = sortedByScore[0];
  const strongest = sortedByScore[sortedByScore.length - 1];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
              <Target className="h-5 w-5 text-primary" />
              <span>বিষয়ভিত্তিক উইকনেস রাডার ও ডায়াগনস্টিক</span>
            </CardTitle>
            <CardDescription className="text-xs">
              বোর্ড পরীক্ষার পূর্ণাঙ্গ প্রস্তুতির জন্য তোমার সবল ও দুর্বল স্থানসমূহের এআই বিশ্লেষণ
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3 text-primary" />
            লাইভ ডায়াগনসিস
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Radar & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radar Chart SVG */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-2">
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                {/* Concentric grid circles (25%, 50%, 75%, 100%) */}
                {[0.25, 0.5, 0.75, 1].map((scale) => (
                  <circle
                    key={scale}
                    cx={radarPoints.center}
                    cy={radarPoints.center}
                    r={radarPoints.radius * scale}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={scale === 1 ? 0.25 : 0.12}
                    strokeDasharray={scale === 1 ? undefined : "3 3"}
                    className="text-border"
                  />
                ))}

                {/* Axes from center to corners */}
                {radarPoints.points.map((p, idx) => (
                  <line
                    key={idx}
                    x1={radarPoints.center}
                    y1={radarPoints.center}
                    x2={p.axisX}
                    y2={p.axisY}
                    stroke="currentColor"
                    strokeOpacity={0.15}
                    className="text-border"
                  />
                ))}

                {/* Radar Filled Area */}
                <polygon
                  points={radarPoints.polygonPath}
                  fill="currentColor"
                  fillOpacity={0.25}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-primary transition-all duration-300"
                />

                {/* Radar vertex dots */}
                {radarPoints.points.map((p, idx) => {
                  const isSelected = selectedSubject?.subjectId === p.subjectId;
                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 6 : 4.5}
                        className={cn(
                          "cursor-pointer transition-all duration-150 fill-background stroke-primary",
                          isSelected ? "stroke-[3.5px] r-6" : "stroke-2 hover:r-6"
                        )}
                        onClick={() => setSelectedSubject(p)}
                      />
                      {/* Subject Name Label */}
                      <text
                        x={p.lx}
                        y={p.ly}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={cn(
                          "text-xs cursor-pointer transition select-none font-medium",
                          isSelected
                            ? "fill-primary font-bold text-xs"
                            : "fill-muted-foreground hover:fill-foreground"
                        )}
                        onClick={() => setSelectedSubject(p)}
                      >
                        {p.subjectName}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              যেকোনো বিষয়ের উপর ক্লিক করে বিস্তারিত পর্যবেক্ষণ করুন
            </p>
          </div>

          {/* Diagnostic Insights Panel */}
          <div className="lg:col-span-6 space-y-3">
            {/* Highest Priority Alert */}
            {weakest && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>জরুরি রিভিশন প্রয়োজন: {weakest.subjectName}</span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  এই বিষয়ে সামগ্রিক দক্ষতা {weakest.scorePercent}%। দুর্বল টপিকসমূহ:{" "}
                  <span className="font-semibold text-foreground">
                    {weakest.weakTopics.join(", ")}
                  </span>
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" asChild>
                    <Link href={`/practice/${weakest.subjectId}`}>
                      <Zap className="h-3 w-3" />
                      দুর্বলতা কাটাতে প্র্যাকটিস শুরু করো
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Selected Subject Breakdown Card */}
            {selectedSubject && (
              <div className="rounded-xl border bg-card p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {selectedSubject.subjectName}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      মোট {selectedSubject.totalQuestionsSolved}টি প্রশ্ন সমাধান করা হয়েছে
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold font-mono text-primary">
                      {selectedSubject.scorePercent}%
                    </span>
                    <span className="block text-xs text-muted-foreground">মাস্টারি লেভেল</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <span className="text-muted-foreground text-xs">সঠিকতার হার (Accuracy):</span>
                    <p className="font-mono font-bold text-sm text-foreground">
                      {selectedSubject.accuracy}%
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <span className="text-muted-foreground text-xs">প্রস্তুতির অবস্থা:</span>
                    <p className="font-bold text-xs text-primary">
                      {selectedSubject.scorePercent >= 80
                        ? "🌟 চমৎকার"
                        : selectedSubject.scorePercent >= 65
                        ? "👍 সন্তোষজনক"
                        : "⚠️ আরও উন্নতি প্রয়োজন"}
                    </p>
                  </div>
                </div>

                {/* Weak & Strong Topics */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold shrink-0">• দুর্বল টপিক:</span>
                    <span className="text-muted-foreground">
                      {selectedSubject.weakTopics.join(", ") || "কোনো বড় দুর্বলতা পাওয়া যায়নি"}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-green-500 font-bold shrink-0">• সবল টপিক:</span>
                    <span className="text-muted-foreground">
                      {selectedSubject.strongTopics.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs w-full sm:w-auto" asChild>
                    <Link href={`/practice/${selectedSubject.subjectId}`}>
                      <span>{selectedSubject.subjectName} প্র্যাকটিসে যাও</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Subjects Quick Mastery Progress Grid */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>সব বিষয়ের সারসংক্ষেপ</span>
            <span>সর্বোচ্চ: {strongest?.subjectName} ({strongest?.scorePercent}%)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {data.map((item) => (
              <button
                type="button"
                key={item.subjectId}
                onClick={() => setSelectedSubject(item)}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition hover:border-primary/50",
                  selectedSubject?.subjectId === item.subjectId
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "bg-muted/20"
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold truncate">{item.subjectName}</span>
                  <span className="font-mono font-bold text-primary">{item.scorePercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.scorePercent >= 80
                        ? "bg-emerald-500"
                        : item.scorePercent >= 65
                        ? "bg-primary"
                        : "bg-amber-500"
                    )}
                    style={{ width: `${item.scorePercent}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
