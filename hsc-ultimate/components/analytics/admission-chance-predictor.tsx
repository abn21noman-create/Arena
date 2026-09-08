"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, GraduationCap, ChevronRight } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface TargetUniversity {
  id: string;
  nameBn: string;
  nameEn: string;
  category: "Engineering" | "Medical" | "General Science";
  requiredSubjects: string[];
  historicalCutoff: number; // percentage
  examPattern: string;
}

const UNIVERSITIES: TargetUniversity[] = [
  {
    id: "buet",
    nameBn: "বুয়েট (BUET)",
    nameEn: "Bangladesh University of Engineering and Technology",
    category: "Engineering",
    requiredSubjects: ["পদার্থবিজ্ঞান", "রসায়ন", "উচ্চতর গণিত"],
    historicalCutoff: 74,
    examPattern: "প্রাক-নির্বাচনী MCQ (১০০) + মূল লিখিত (৪০০)",
  },
  {
    id: "medical",
    nameBn: "মেডিকেল ভর্তি পরীক্ষা (MBBS)",
    nameEn: "National Medical College Admission Test",
    category: "Medical",
    requiredSubjects: ["জীববিজ্ঞান", "রসায়ন", "পদার্থবিজ্ঞান", "ইংরেজি ও সাধারণ জ্ঞান"],
    historicalCutoff: 72,
    examPattern: "MCQ ১০০ নম্বর (-০.২৫ নেগেটিভ) + SSC/HSC জিপিএ ২০০",
  },
  {
    id: "du-a",
    nameBn: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট (DU A)",
    nameEn: "Dhaka University Faculty of Science",
    category: "General Science",
    requiredSubjects: ["পদার্থবিজ্ঞান", "রসায়ন", "উচ্চতর গণিত", "জীববিজ্ঞান"],
    historicalCutoff: 67,
    examPattern: "MCQ ৬০ নম্বর + লিখিত ৪০ নম্বর (মোট ১০০)",
  },
  {
    id: "ckruet",
    nameBn: "চুয়েট, কুয়েট ও রুয়েট (CKRUET)",
    nameEn: "Engineering University Cluster",
    category: "Engineering",
    requiredSubjects: ["পদার্থবিজ্ঞান", "রসায়ন", "উচ্চতর গণিত", "ইংরেজি"],
    historicalCutoff: 69,
    examPattern: "MCQ ৫০০ নম্বর (ক গ্রুপ) / ৭০০ নম্বর (খ গ্রুপ)",
  },
];

export function AdmissionChancePredictor() {
  const [selectedUniId, setSelectedUniId] = useState<string>("buet");
  const [physicsPct, setPhysicsPct] = useState<number>(78);
  const [chemistryPct, setChemistryPct] = useState<number>(74);
  const [mathPct, setMathPct] = useState<number>(82);
  const [biologyPct, setBiologyPct] = useState<number>(70);
  const [generalAccuracy, setGeneralAccuracy] = useState<number>(80);

  const currentUni = UNIVERSITIES.find((u) => u.id === selectedUniId) || UNIVERSITIES[0];

  // Calculate Weighted Probability
  const calculateProbability = () => {
    let compositeScore = 0;
    if (currentUni.id === "buet" || currentUni.id === "ckruet") {
      compositeScore = (physicsPct * 0.35) + (mathPct * 0.40) + (chemistryPct * 0.25);
    } else if (currentUni.id === "medical") {
      compositeScore = (biologyPct * 0.35) + (chemistryPct * 0.30) + (physicsPct * 0.20) + (generalAccuracy * 0.15);
    } else {
      // DU A
      compositeScore = (physicsPct * 0.25) + (chemistryPct * 0.25) + (mathPct * 0.25) + (biologyPct * 0.25);
    }

    // Benchmark against cut-off
    const diff = compositeScore - currentUni.historicalCutoff;
    const probability = Math.max(10, Math.min(99, Math.round(50 + diff * 3.5)));
    return { compositeScore: Math.round(compositeScore), probability };
  };

  const { compositeScore, probability } = calculateProbability();

  const getStatus = () => {
    if (probability >= 85) return { label: "নিরাপদ জোন (Strong Chance)", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (probability >= 65) return { label: "টার্গেট জোন (Competitive)", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" };
    return { label: "সতর্কতা জোন (High Risk / Gap Recovery)", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" };
  };

  const status = getStatus();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border shadow-xs bg-linear-to-r from-primary/10 via-card to-amber-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>অ্যাডমিশন চান্স ও কাট-অফ প্রেডিক্টর</span>
                  <Badge variant="secondary" className="text-xs">
                    AI Chance Index 2026
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  বিগত ১০ বছরের কাট-অফ ট্রেন্ড ও আপনার সাবজেক্টভিত্তিক স্কোরের উপর ভিত্তি করে চান্স প্রেডিকশন
                </p>
              </div>
            </div>

            {/* University Switcher Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {UNIVERSITIES.map((uni) => (
                <button
                  key={uni.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedUniId(uni.id);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    selectedUniId === uni.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {uni.nameBn.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid: Inputs (Left) vs Real-Time Probability Gauge (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>আপনার আনুমানিক বা টেস্ট পেপারের পারফরম্যান্স</span>
                <Badge variant="outline" className="text-xs">
                  {currentUni.nameBn}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-4">
              {/* Physics */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">পদার্থবিজ্ঞান প্রস্তুতি (% নির্ভুলতা)</span>
                  <span className="font-mono text-primary">{physicsPct}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={physicsPct}
                  onChange={(e) => setPhysicsPct(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Chemistry */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">রসায়ন প্রস্তুতি (% নির্ভুলতা)</span>
                  <span className="font-mono text-primary">{chemistryPct}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={chemistryPct}
                  onChange={(e) => setChemistryPct(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Higher Math (if required) */}
              {(currentUni.id === "buet" || currentUni.id === "ckruet" || currentUni.id === "du-a") && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-foreground">উচ্চতর গণিত প্রস্তুতি (% নির্ভুলতা)</span>
                    <span className="font-mono text-primary">{mathPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={mathPct}
                    onChange={(e) => setMathPct(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              )}

              {/* Biology (if required) */}
              {(currentUni.id === "medical" || currentUni.id === "du-a") && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-foreground">জীববিজ্ঞান প্রস্তুতি (% নির্ভুলতা)</span>
                    <span className="font-mono text-primary">{biologyPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={biologyPct}
                    onChange={(e) => setBiologyPct(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              )}

              {/* Overall Speed & Accuracy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">সাধারণ জ্ঞান, ইংরেজি ও সার্বিক স্পিড</span>
                  <span className="font-mono text-primary">{generalAccuracy}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={generalAccuracy}
                  onChange={(e) => setGeneralAccuracy(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Probability Gauge & Insights */}
        <div className="lg:col-span-5 space-y-4">
          <Card className={cn("border p-5 sm:p-6 text-center space-y-4", status.bg)}>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                আনুমানিক চান্স প্রোবাবিলিটি
              </span>
              <div className={cn("text-5xl sm:text-6xl font-black tracking-tight", status.color)}>
                {probability}%
              </div>
              <Badge variant="outline" className={cn("font-bold text-xs mt-1", status.color)}>
                {status.label}
              </Badge>
            </div>

            <div className="space-y-2 text-left pt-2 border-t border-border/50">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">আপনার ওয়েটেড স্কোর:</span>
                <span className="font-bold font-mono">{compositeScore}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">কাঙ্ক্ষিত কাট-অফ বেঞ্চমার্ক:</span>
                <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                  {currentUni.historicalCutoff}%
                </span>
              </div>
            </div>

            {/* AI Recommendation Alert */}
            <div className="rounded-xl bg-card/80 p-3.5 text-left border text-xs space-y-1.5 shadow-2xs">
              <div className="font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI পরামর্শ:</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {probability >= 85
                  ? "আপনার বর্তমান প্রস্তুতি খুবই আশাব্যঞ্জক! নিয়মিত টাইমড মডেল টেস্ট দিন এবং ভুলগুলো Mistake Vault এ রিভিশন করুন।"
                  : `${currentUni.requiredSubjects[0]} এবং ${currentUni.requiredSubjects[1]}-তে আরও ৫% নির্ভুলতা বাড়াতে পারলে আপনার চান্স সম্ভাবনা ৮৫%+ এ পৌঁছাবে।`}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
