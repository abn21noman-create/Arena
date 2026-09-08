"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Sparkles,
  Flame,
  Zap,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface EnergyStage {
  stage: string;
  location: string;
  inputs: string;
  outputs: string;
  atpYield: number;
  explanation: string;
}

const RESPIRATION_STAGES: EnergyStage[] = [
  {
    stage: "১. গ্লাইকোলাইসিস (Glycolysis)",
    location: "কোষের সাইটোপ্লাজম",
    inputs: "১ অণু গ্লুকোজ (C6H12O6)",
    outputs: "২ অণু পাইরুভিক এসিড + ২ NADH2 + ২ ATP",
    atpYield: 8,
    explanation: "গ্লুকোজ ভেঙে ২ অণু পাইরুভিক এসিড তৈরি হয়। এই ধাপে অক্সিজেনের প্রয়োজন হয় না।",
  },
  {
    stage: "২. এসিটাইল কো-এ সৃষ্টি (Acetyl CoA)",
    location: "মাইটোকন্ড্রিয়ার ধাত্র (Matrix)",
    inputs: "২ অণু পাইরুভিক এসিড",
    outputs: "২ অণু Acetyl CoA + ২ CO2 + ২ NADH2",
    atpYield: 6,
    explanation: "পাইরুভিক এসিড থেকে কার্বন ডাই-অক্সাইড অপসারিত হয়ে ২-কার্বন বিশিষ্ট এসিটাইল কো-এ তৈরি হয়।",
  },
  {
    stage: "৩. ক্রেবস চক্র (Krebs / TCA Cycle)",
    location: "মাইটোকন্ড্রিয়ার ধাত্র (Matrix)",
    inputs: "২ অণু Acetyl CoA",
    outputs: "৪ CO2 + ৬ NADH2 + ২ FADH2 + ২ GTP",
    atpYield: 24,
    explanation: "অক্সালোঅ্যাসিটিক এসিডের সাথে যুক্ত হয়ে সাইট্রিক এসিড সৃষ্টির মাধ্যমে শক্তি নির্গমন চক্রটি সম্পন্ন হয়।",
  },
];

export function PhotosynthesisBioenergeticsLab() {
  const [activeTab, setActiveTab] = useState<"photosynthesis" | "respiration">("respiration");
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const totalATP = RESPIRATION_STAGES.reduce((acc, s) => acc + s.atpYield, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-amber-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>সালোকসংশ্লেষণ ও শ্বসন বায়ো-এনার্জেটিক্স স্টুডিও</span>
                  <Badge variant="secondary" className="text-xs">
                    উদ্ভিদবিজ্ঞান ১ম পত্র: ৯ম অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Z-স্কিম ফটোফসফোরাইলেশন এবং ১ অণু গ্লুকোজ থেকে ৩৮টি ATP উৎপাদনের বায়োকেমিক্যাল ব্যালেন্স শিট
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveTab("respiration");
                }}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition",
                  activeTab === "respiration" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                কোষীয় শ্বসন ও ATP হিসাব
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveTab("photosynthesis");
                }}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition",
                  activeTab === "photosynthesis" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                সালোকসংশ্লেষণ C3/C4
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stages List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === "respiration" ? (
            <div className="space-y-3">
              {RESPIRATION_STAGES.map((s, idx) => {
                const isSelected = idx === selectedStageIdx;
                return (
                  <Card
                    key={s.stage}
                    onClick={() => {
                      sfx.play("pop");
                      setSelectedStageIdx(idx);
                    }}
                    className={cn(
                      "border shadow-2xs p-4 space-y-2 cursor-pointer transition bg-card",
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30"
                        : "hover:bg-muted/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{s.stage}</span>
                      <Badge className="bg-emerald-600 text-white font-mono text-3xs font-bold">
                        +{s.atpYield} ATP
                      </Badge>
                    </div>

                    <div className="text-2xs text-muted-foreground flex items-center gap-3">
                      <span>স্থান: {s.location}</span>
                    </div>

                    <p className="text-2xs text-muted-foreground font-medium pt-1 border-t">
                      {s.explanation}
                    </p>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border shadow-2xs p-5 space-y-3 bg-card">
              <Badge variant="outline" className="text-3xs font-semibold">
                আলোক নির্ভর অধ্যায়: থাইলাকয়েড পর্দা
              </Badge>
              <h3 className="font-bold text-base text-foreground">
                Z-স্কিম ফটোফসফোরাইলেশন (Non-cyclic Photophosphorylation)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                সূর্যালোকের ফোটন Photosystem II (P680) তে আপতিত হয়ে পানির ফটোলাইসিস ঘটায়:
              </p>
              <div className="rounded-xl border bg-muted/20 p-3 font-mono text-xs font-bold text-primary">
                2H₂O → 4H⁺ + 4e⁻ + O₂
              </div>
              <p className="text-2xs text-muted-foreground leading-relaxed">
                মুক্ত ইলেকট্রন সাইটোক্রোম b6f কমপ্লেক্স হয়ে Photosystem I (P700) এ যায় এবং NADP+ কে বিজারিত করে NADPH2 ও ATP তৈরি করে।
              </p>
            </Card>
          )}
        </div>

        {/* Bio-energetic Summary & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span>মোট শক্তি উৎপাদন ও ব্যালেন্স শিট</span>
            </CardTitle>

            <div className="rounded-xl border bg-emerald-500/10 p-4 text-center space-y-1">
              <div className="text-3xs text-muted-foreground uppercase font-bold">১ অণু গ্লুকোজ থেকে সর্বমোট প্রাপ্ত শক্তি</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {totalATP} ATP (~ 2870 kJ)
              </div>
            </div>

            <div className="space-y-2 text-2xs">
              <div className="p-2 rounded-lg bg-muted/20 border flex justify-between">
                <span>১টি NADH₂ =</span>
                <span className="font-bold text-primary font-mono">৩টি ATP</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/20 border flex justify-between">
                <span>১টি FADH₂ =</span>
                <span className="font-bold text-primary font-mono">২টি ATP</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/20 border flex justify-between">
                <span>১টি GTP =</span>
                <span className="font-bold text-primary font-mono">১টি ATP</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
