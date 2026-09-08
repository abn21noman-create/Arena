"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  Sparkles,
  ArrowRight,
  FlaskConical,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface ReactionStep {
  stepNum: number;
  fromCompound: string;
  toCompound: string;
  reagent: string;
  condition: string;
  reactionType: string;
  explanation: string;
}

interface OrganicPathway {
  id: string;
  title: string;
  target: string;
  description: string;
  steps: ReactionStep[];
}

const ORGANIC_PATHWAYS: OrganicPathway[] = [
  {
    id: "alkane-to-acid",
    title: "মিথেন থেকে ইথানোয়িক এসিড সংশ্লেষণ (কার্বন সংখ্যা বৃদ্ধি)",
    target: "CH4 → CH3COOH",
    description: "১-কার্বন বিশিষ্ট অ্যালকেন থেকে ২-কার্বন বিশিষ্ট জৈব এসিডে রূপান্তর।",
    steps: [
      {
        stepNum: 1,
        fromCompound: "মিথেন (CH4)",
        toCompound: "মিথাইল ক্লোরাইড (CH3Cl)",
        reagent: "Cl2 (ক্লোরিন গ্যাস)",
        condition: "বিক্ষিপ্ত সূর্যালোক (hν)",
        reactionType: "মুক্তমূলক প্রতিস্থাপন (Free Radical Substitution)",
        explanation: "সূর্যালোকের উপস্থিতিতে মিথেনের হাইড্রোজেন ক্লোরিন দ্বারা প্রতিস্থাপিত হয়।",
      },
      {
        stepNum: 2,
        fromCompound: "মিথাইল ক্লোরাইড (CH3Cl)",
        toCompound: "ইথেননাইট্রাইল (CH3CN)",
        reagent: "KCN (অ্যালকোহলীয় পটাশিয়াম সায়ানাইড)",
        condition: "উত্তাপ (Δ)",
        reactionType: "নিউক্লিওফিলিক প্রতিস্থাপন (SN2)",
        explanation: "সায়ানাইড মূলক যুক্ত হয়ে কার্বন চেইনে ১টি কার্বন বৃদ্ধি পায়।",
      },
      {
        stepNum: 3,
        fromCompound: "ইথেননাইট্রাইল (CH3CN)",
        toCompound: "ইথানোয়িক এসিড (CH3COOH)",
        reagent: "আর্দ্র বিশ্লেষণ (H3O+ / লঘু HCl)",
        condition: "উত্তাপ (Δ)",
        reactionType: "সম্পূর্ণ আর্দ্র বিশ্লেষণ (Complete Hydrolysis)",
        explanation: "-CN মূলক অম্লীয় মাধ্যমে আর্দ্র বিশ্লেষিত হয়ে সরাসরি -COOH মূলকে পরিণত হয়।",
      },
    ],
  },
  {
    id: "grignard-alcohols",
    title: "গ্রিগনার্ড বিকারক হতে অ্যালকোহল সংশ্লেষণ (1°, 2°, 3°)",
    target: "R-MgX → Alcohols",
    description: "কার্বনিল যৌগের সাথে গ্রিগনার্ড বিকারকের সংযোজন বিক্রিয়া।",
    steps: [
      {
        stepNum: 1,
        fromCompound: "মিথান্যাল / ফরমালডিহাইড (HCHO)",
        toCompound: "১° অ্যালকোহল (Primary Alcohol)",
        reagent: "R-MgX এবং পরে H3O+",
        condition: "শুষ্ক ইথার মাধ্যম",
        reactionType: "নিউক্লিওফিলিক সংযোজন (Nucleophilic Addition)",
        explanation: "ফরমালডিহাইডের সাথে গ্রিগনার্ড বিকারক যুক্ত হয়ে সর্বদা ১° অ্যালকোহল তৈরি করে।",
      },
      {
        stepNum: 2,
        fromCompound: "অন্যান্য অ্যালডিহাইড (R-CHO)",
        toCompound: "২° অ্যালকোহল (Secondary Alcohol)",
        reagent: "R-MgX এবং পরে H3O+",
        condition: "শুষ্ক ইথার মাধ্যম",
        reactionType: "নিউক্লিওফিলিক সংযোজন",
        explanation: "অ্যাসিটালডিহাইডের সাথে বিক্রিয়ায় ২° অ্যালকোহল গঠিত হয়।",
      },
      {
        stepNum: 3,
        fromCompound: "কিটোন (R-CO-R')",
        toCompound: "৩° অ্যালকোহল (Tertiary Alcohol)",
        reagent: "R-MgX এবং পরে H3O+",
        condition: "শুষ্ক ইথার মাধ্যম",
        reactionType: "নিউক্লিওফিলিক সংযোজন",
        explanation: "অ্যাসিটোনের সাথে গ্রিগনার্ড বিকারকের বিক্রিয়ায় ৩° অ্যালকোহল তৈরি হয়।",
      },
    ],
  },
];

export function OrganicRoadmapStudio() {
  const [selectedPathway, setSelectedPathway] = useState<OrganicPathway>(ORGANIC_PATHWAYS[0]);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const activeStep = selectedPathway.steps[activeStepIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-cyan-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>জৈব রসায়ন রূপান্তর রোডম্যাপ ও সংশ্লেষণ স্টুডিও</span>
                  <Badge variant="secondary" className="text-xs">
                    রসায়ন ২য় পত্র: ২য় অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  কার্বন সংখ্যা বৃদ্ধি, গ্রিগনার্ড সংশ্লেষণ ও অ্যারোমেটিক রূপান্তরের স্টেপ-বাই-স্টেপ মেকানিজম
                </p>
              </div>
            </div>

            {/* Pathway selector */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {ORGANIC_PATHWAYS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedPathway(p);
                    setActiveStepIdx(0);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    selectedPathway.id === p.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  {p.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pathway Steps Diagram (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <div className="space-y-1 border-b pb-3">
              <Badge variant="outline" className="text-3xs font-mono font-bold text-primary">
                লক্ষ্য: {selectedPathway.target}
              </Badge>
              <h3 className="font-bold text-base text-foreground">
                {selectedPathway.title}
              </h3>
              <p className="text-2xs text-muted-foreground">
                {selectedPathway.description}
              </p>
            </div>

            {/* Step Pipeline */}
            <div className="space-y-3">
              {selectedPathway.steps.map((step, idx) => {
                const isActive = idx === activeStepIdx;
                return (
                  <div
                    key={step.stepNum}
                    onClick={() => {
                      sfx.play("pop");
                      setActiveStepIdx(idx);
                    }}
                    className={cn(
                      "p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between",
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30"
                        : "bg-muted/10 hover:bg-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs",
                          isActive ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {step.stepNum}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <span>{step.fromCompound}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-primary">{step.toCompound}</span>
                        </div>
                        <div className="text-2xs text-muted-foreground font-mono">
                          বিকারক: {step.reagent}
                        </div>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-3xs">
                      ধাপ {step.stepNum}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Step Inspector & Mechanism Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <div className="flex items-center justify-between border-b pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-500" />
                <span>ধাপ #{activeStep.stepNum} এর রাসায়নিক শর্ত</span>
              </CardTitle>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">বিকারক (Reagent):</span>
                  <span className="font-bold text-primary">{activeStep.reagent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">শর্ত / প্রভাবক:</span>
                  <span className="font-bold text-foreground">{activeStep.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">বিক্রিয়ার ধরন:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeStep.reactionType}</span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1 text-2xs">
                <div className="font-bold text-foreground">মেকানিজম বিশ্লেষণ:</div>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  {activeStep.explanation}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
