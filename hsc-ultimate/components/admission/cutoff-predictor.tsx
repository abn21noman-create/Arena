"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface UniversityTarget {
  id: string;
  name: string;
  stream: "Engineering" | "Medical" | "General";
  totalSeats: number;
  historicalCutoffScore: number;
  probScore: number;
  status: "safe" | "target" | "reach";
  recommendation: string;
}

export function AdmissionCutoffPredictor() {
  const [gpa, setGpa] = useState<number>(5.0);
  const [pcmScore, setPcmScore] = useState<number>(88); // Marks %
  const [mockScore, setMockScore] = useState<number>(75); // Mock %
  const [selectedStream, setSelectedStream] = useState<"All" | "Engineering" | "Medical" | "General">("All");

  // Calculate admission composite index
  const compositeIndex = gpa * 10 + pcmScore * 0.5 + mockScore * 0.4;

  const UNIVERSITIES: UniversityTarget[] = [
    {
      id: "buet",
      name: "বুয়েট (BUET - Bangladesh University of Engineering and Technology)",
      stream: "Engineering",
      totalSeats: 1305,
      historicalCutoffScore: 125,
      probScore: compositeIndex >= 122 ? 85 : compositeIndex >= 115 ? 65 : 40,
      status: compositeIndex >= 122 ? "safe" : compositeIndex >= 115 ? "target" : "reach",
      recommendation: "পদার্থবিজ্ঞান ও উচ্চতর গণিতের গাণিতিক সমস্যা দ্রুত সমাধানের স্পিড বৃদ্ধি করুন।",
    },
    {
      id: "dmc",
      name: "ঢাকা মেডিকেল কলেজ (DMC)",
      stream: "Medical",
      totalSeats: 230,
      historicalCutoffScore: 128,
      probScore: compositeIndex >= 125 ? 88 : compositeIndex >= 118 ? 68 : 42,
      status: compositeIndex >= 125 ? "safe" : compositeIndex >= 118 ? "target" : "reach",
      recommendation: "জীববিজ্ঞান ১ম ও ২য় পত্রের তথ্যমূলক অধ্যায়গুলো এবং ইংলিশ ভোকাবুলারিতে জোর দিন।",
    },
    {
      id: "du-ka",
      name: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট (DU A-Unit Science)",
      stream: "General",
      totalSeats: 1851,
      historicalCutoffScore: 112,
      probScore: compositeIndex >= 110 ? 90 : compositeIndex >= 100 ? 75 : 50,
      status: compositeIndex >= 110 ? "safe" : compositeIndex >= 100 ? "target" : "reach",
      recommendation: "লিখিত অংশে পূর্ণাঙ্গ মার্কস অর্জনের জন্য সংক্ষিপ্ত পদ্ধতির প্রয়োগ শিখুন।",
    },
    {
      id: "ckruet",
      name: "চুয়েট, কুয়েট ও রুয়েট (CKRUET Engineering Cluster)",
      stream: "Engineering",
      totalSeats: 3230,
      historicalCutoffScore: 110,
      probScore: compositeIndex >= 108 ? 92 : compositeIndex >= 98 ? 78 : 55,
      status: compositeIndex >= 108 ? "safe" : compositeIndex >= 98 ? "target" : "reach",
      recommendation: "ইঞ্জিনিয়ারিং পদার্থ ও রসায়নের অধ্যায়ভিত্তিক সূত্র প্র্যাকটিস অব্যাহত রাখুন।",
    },
    {
      id: "ssmc",
      name: "স্যার সলিমুল্লাহ মেডিকেল কলেজ (SSMC)",
      stream: "Medical",
      totalSeats: 230,
      historicalCutoffScore: 120,
      probScore: compositeIndex >= 118 ? 86 : compositeIndex >= 108 ? 70 : 48,
      status: compositeIndex >= 118 ? "safe" : compositeIndex >= 108 ? "target" : "reach",
      recommendation: "নেগেটিভ মার্কিং এড়াতে ড্রিল টেস্টে নির্ভুলতার হার (Accuracy) ৯৫% এর উপরে রাখুন।",
    },
    {
      id: "sust",
      name: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (SUST)",
      stream: "General",
      totalSeats: 1600,
      historicalCutoffScore: 105,
      probScore: compositeIndex >= 102 ? 94 : compositeIndex >= 92 ? 80 : 60,
      status: compositeIndex >= 102 ? "safe" : compositeIndex >= 92 ? "target" : "reach",
      recommendation: "কম্পিউটার সায়েন্স ও সফটওয়্যার ইঞ্জিনিয়ারিং এর জন্য গণিতে ভালো মার্কস জরুরি।",
    },
  ];

  const filtered = selectedStream === "All"
    ? UNIVERSITIES
    : UNIVERSITIES.filter((u) => u.stream === selectedStream);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-rose-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ভর্তি পরীক্ষা কাট-অফ প্রেডিক্টর ও কলেজ রিকমেন্ডার</span>
                  <Badge variant="secondary" className="text-xs">
                    Admission Intelligence V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  HSC নম্বর ও মক টেস্ট পারফরম্যান্সের ভিত্তিতে বুয়েট, মেডিকেল, ঢাবি ও ইঞ্জিনিয়ারিং চান্স প্রেডিকশন
                </p>
              </div>
            </div>

            {/* Stream Filter */}
            <div className="flex gap-1 bg-muted/40 p-1.5 rounded-xl border">
              {(["All", "Engineering", "Medical", "General"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedStream(s);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition",
                    selectedStream === s ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  {s === "All" ? "সকল" : s === "Engineering" ? "ইঞ্জিনিয়ারিং" : s === "Medical" ? "মেডিকেল" : "ভার্সিটি ক"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Inputs & Prediction Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span>আপনার একাডেমিক প্যারামিটার</span>
            </CardTitle>

            <div className="space-y-3 text-xs font-medium">
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>HSC GPA:</span>
                  <span className="font-mono text-primary">{gpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={3.5}
                  max={5.0}
                  step={0.05}
                  value={gpa}
                  onChange={(e) => setGpa(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>বিজ্ঞান বিষয়সমূহের গড় নম্বর %:</span>
                  <span className="font-mono text-primary">{pcmScore}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={1}
                  value={pcmScore}
                  onChange={(e) => setPcmScore(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>মক টেস্ট গড় স্কোর %:</span>
                  <span className="font-mono text-primary">{mockScore}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={1}
                  value={mockScore}
                  onChange={(e) => setMockScore(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="rounded-xl border bg-primary/5 p-3 text-center space-y-1">
              <div className="text-3xs uppercase font-bold text-muted-foreground">কম্পোজিট এডমিশন ইনডেক্স</div>
              <div className="text-3xl font-black text-primary font-mono">{compositeIndex.toFixed(1)}</div>
            </div>
          </Card>
        </div>

        {/* Prediction Results (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {filtered.map((u) => (
            <Card key={u.id} className="border shadow-2xs p-4 sm:p-5 space-y-3 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                    <span>{u.name}</span>
                  </h4>
                  <div className="text-2xs text-muted-foreground flex items-center gap-3">
                    <span>আসন সংখ্যা: {u.totalSeats.toLocaleString()}</span>
                    <span>বিগত কাট-অফ: {u.historicalCutoffScore}</span>
                  </div>
                </div>

                <Badge
                  className={cn(
                    "text-xs px-3 py-1 font-bold",
                    u.status === "safe" && "bg-emerald-600 text-white",
                    u.status === "target" && "bg-amber-500 text-slate-950",
                    u.status === "reach" && "bg-rose-600 text-white"
                  )}
                >
                  {u.status === "safe" ? "🟢 নিশ্চিত চান্স (Safe)" : u.status === "target" ? "🟡 সম্ভাব্য (Target)" : "🔴 চ্যালেঞ্জিং (Reach)"}
                </Badge>
              </div>

              {/* Probability Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-2xs font-bold">
                  <span className="text-muted-foreground">সম্ভাব্যতা রেটিং:</span>
                  <span className="font-mono text-primary">{u.probScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      u.status === "safe" && "bg-emerald-500",
                      u.status === "target" && "bg-amber-500",
                      u.status === "reach" && "bg-rose-500"
                    )}
                    style={{ width: `${u.probScore}%` }}
                  />
                </div>
              </div>

              {/* Actionable Advice */}
              <div className="rounded-xl bg-muted/20 p-2.5 text-2xs text-muted-foreground border flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">পরামর্শ: </strong>{u.recommendation}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
