"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Play, ChevronRight, ChevronLeft, RotateCcw, Sparkles, Zap, Eye, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface MechanismStep {
  stepNumber: number;
  stepTitle: string;
  chemicalEq: string;
  visualState: string;
  explanation: string;
  intermediateType: string;
}

interface ReactionMechanism {
  id: string;
  nameBn: string;
  nameEn: string;
  category: string;
  type: string;
  steps: MechanismStep[];
  hscTrap: string;
}

const MECHANISMS: ReactionMechanism[] = [
  {
    id: "sn1",
    nameBn: "S_N1 বিক্রিয়া মেকানিজম (এক-আণবিক কেন্দ্রাকর্ষী প্রতিস্থাপন)",
    nameEn: "Unimolecular Nucleophilic Substitution (SN1)",
    category: "অ্যালকাইল হ্যালাইড",
    type: "২-ধাপ প্রক্রিয়া",
    steps: [
      {
        stepNumber: 1,
        stepTitle: "ধাপ ১: কার্বোক্যাটায়ন গঠন (মন্থর গতি - Rate Determining Step)",
        chemicalEq: "(CH₃)₃C-Br (ধীর) ⇌ (CH₃)₃C⁺ (সমতলীয় কার্বোক্যাটায়ন) + Br⁻",
        visualState: "[ (CH3)3C ]+ --- Br- (Leaving Group Departed)",
        explanation: "৩° অ্যালকাইল হ্যালাইড থেকে ব্রোমাইড আয়ন চলে গিয়ে একটি ত্রিকোণাকার সমতলীয় (sp² সংকরিত) ৩° কার্বোক্যাটায়ন তৈরি হয়। এই ধাপটি মন্থর হওয়ায় বিক্রিয়ার হার কেবল সাবস্ট্রেটের ঘনমাত্রার ওপর নির্ভর করে।",
        intermediateType: "৩° কার্বোক্যাটায়ন (Planar sp²)",
      },
      {
        stepNumber: 2,
        stepTitle: "ধাপ ২: নিউক্লিওফাইলের দ্রুত আক্রমণ ও রেসিমিক মিশ্রণ গঠন",
        chemicalEq: "(CH₃)₃C⁺ + OH⁻ (দ্রুত) → (CH₃)₃C-OH (৩° অ্যালকোহল)",
        visualState: "OH- 공격 ➔ [ (CH3)3C-OH ] (Front & Back Attack)",
        explanation: "যেহেতু কার্বোক্যাটায়নটি সমতলীয়, নিউক্লিওফাইল (OH⁻) সম্মুখ ও বিপরীত উভয় দিক থেকেই সমান সম্ভাবনায় আক্রমণ করতে পারে। ফলে রেসিমিক মিশ্রণ (Racemic Mixture) তৈরি হয়।",
        intermediateType: "চূড়ান্ত উৎপাদ (৩° অ্যালকোহল)",
      },
    ],
    hscTrap: "বুয়েট ও ঢাবি ভর্তি পরীক্ষায় আসে: S_N1 বিক্রিয়ার সক্রিয়তার ক্রম হলো: ৩° > ২° > ১° অ্যালকাইল হ্যালাইড (কার্বোক্যাটায়নের স্থায়িত্বের কারণে)।",
  },
  {
    id: "sn2",
    nameBn: "S_N2 বিক্রিয়া মেকানিজম (দ্বি-আণবিক কেন্দ্রাকর্ষী প্রতিস্থাপন)",
    nameEn: "Bimolecular Nucleophilic Substitution (SN2)",
    category: "অ্যালকাইল হ্যালাইড",
    type: "১-ধাপ কনসার্টেড প্রক্রিয়া",
    steps: [
      {
        stepNumber: 1,
        stepTitle: "ধাপ ১: পশ্চাৎ আক্রমণ ও অবস্থান্তর জটিল (Transition State)",
        chemicalEq: "HO⁻ + CH₃-Cl → [ HO···CH₃···Cl ]‡ → HO-CH₃ + Cl⁻",
        visualState: "HO- ··· [ C H3 ] ··· Cl (Pentacoordinate Transition State)",
        explanation: "নিউক্লিওফাইল (OH⁻) লিভিং গ্রুপের ঠিক ১৮০° বিপরীত দিক থেকে কার্বনকে আক্রমণ করে। একই সাথে C-Cl বন্ধন ভাঙতে থাকে এবং C-OH বন্ধন গড়তে থাকে, যা একটি পঞ্চ-যোজী ট্রানজিশন স্টেট তৈরি করে।",
        intermediateType: "ট্রানজিশন স্টেট [Nu···C···X]‡",
      },
      {
        stepNumber: 2,
        stepTitle: "ধাপ ২: ওয়ালডেন ইনভার্সন (ছাতার মতো উল্টে যাওয়া)",
        chemicalEq: "HO-CH₃ + Cl⁻ (১০০% ইনভার্সন)",
        visualState: "HO - CH3 (Complete Inversion of Configuration)",
        explanation: "লিভিং গ্রুপ সম্পূর্ণরূপে অপসারিত হলে অণুর কনফিগারেশন ঝড়ে ছাতা উল্টে যাওয়ার মতো ১৮০° ঘুরে যায়। একে ওয়ালডেন ইনভার্সন (Walden Inversion) বলে।",
        intermediateType: "ইনভার্টেড উৎপাদ (১° অ্যালকোহল)",
      },
    ],
    hscTrap: "S_N2 বিক্রিয়ার সক্রিয়তার ক্রম: মিথাইল হ্যালাইড > ১° > ২° > ৩° (স্টেরিক বাধার কারণে ৩°-তে S_N2 ঘটে না)।",
  },
  {
    id: "nitration",
    nameBn: "বেঞ্জিনের নাইট্রেশন মেকানিজম (ইলেকট্রোফিলিক অ্যারোমেটিক প্রতিস্থাপন)",
    nameEn: "Electrophilic Aromatic Substitution (Nitration)",
    category: "অ্যারোমেটিক হাইড্রোকার্বন",
    type: "৩-ধাপ প্রক্রিয়া",
    steps: [
      {
        stepNumber: 1,
        stepTitle: "ধাপ ১: ইলেকট্রোফাইল (NO₂⁺) তৈরি",
        chemicalEq: "HNO₃ + 2 H₂SO₄ → NO₂⁺ (নাইট্রোনিয়াম আয়ন) + H₃O⁺ + 2 HSO₄⁻",
        visualState: "[ O=N=O ]+ (Strong Electrophile Generated)",
        explanation: "গাঢ় H₂SO₄ এসিড গাঢ় HNO₃ এসিডকে প্রোটন প্রদান করে শক্তিশালী ইলেকট্রোফাইল নাইট্রোনিয়াম আয়ন (NO₂⁺) উৎপন্ন করে। এখানে H₂SO₄ এসিড ক্ষারক হিসেবে নয়, প্রোটন দাতা হিসেবে কাজ করে।",
        intermediateType: "NO₂⁺ ইলেকট্রোফাইল",
      },
      {
        stepNumber: 2,
        stepTitle: "ধাপ ২: সিগমা-কমপ্লেক্স বা অ্যারেনিয়াম আয়ন গঠন",
        chemicalEq: "C₆H₆ + NO₂⁺ (মন্থর) → [ C₆H₆-NO₂ ]⁺ (সিগমা কমপ্লেক্স)",
        visualState: "Benzene Ring + NO2+ ➔ [ Sigma Complex (Resonance Stabilized) ]+",
        explanation: "বেঞ্জিনের পাই-ইলেকট্রন ক্লাউড NO₂⁺ কে আক্রমণ করে পাই-বন্ধন ভেঙে রেজোন্যান্স স্থিতিশীল সিগমা-কমপ্লেক্স গঠন করে। এতে বেঞ্জিনের অ্যারোমেটিসিটি সাময়িকভাবে নষ্ট হয়।",
        intermediateType: "সিগমা-কমপ্লেক্স (কার্বোক্যাটায়ন)",
      },
      {
        stepNumber: 3,
        stepTitle: "ধাপ ৩: প্রোটন অপসারণ ও অ্যারোমেটিসিটি পুনরুদ্ধার",
        chemicalEq: "[ C₆H₆-NO₂ ]⁺ + HSO₄⁻ (দ্রুত) → C₆H₅NO₂ (নাইট্রোবেঞ্জিন) + H₂SO₄",
        visualState: "Loss of H+ ➔ Nitrobenzene (Aromatic Ring Restored)",
        explanation: "HSO₄⁻ আয়ন সিগমা কমপ্লেক্স থেকে অতিরিক্ত প্রোটন (H⁺) গ্রহণ করে H₂SO₄ পুনরুৎপাদন করে এবং বেঞ্জিনের রেজোন্যান্স স্থিতিশীল অ্যারোমেটিসিটি ফিরিয়ে আনে।",
        intermediateType: "নাইট্রোবেঞ্জিন (চূড়ান্ত উৎপাদ)",
      },
    ],
    hscTrap: "নাইট্রেশনে H₂SO₄ প্রভাবক ও প্রোটন দাতা হিসেবে ব্যবহৃত হয়। ৬০°C এর বেশি তাপমাত্রা দিলে ডাইনাইট্রোবেঞ্জিন উৎপন্ন হয়।",
  },
];

export function OrganicMechanismStudio() {
  const [selectedMechId, setSelectedMechId] = useState<string>("sn1");
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const currentMech = MECHANISMS.find((m) => m.id === selectedMechId) || MECHANISMS[0];
  const step = currentMech.steps[currentStepIdx] || currentMech.steps[0];

  const handleNext = () => {
    if (currentStepIdx < currentMech.steps.length - 1) {
      sfx.play("pop");
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      sfx.play("correct");
      triggerConfetti();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      sfx.play("click");
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-cyan-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>জৈব বিক্রিয়া মেকানিজম স্টুডিও</span>
                  <Badge variant="secondary" className="text-xs">
                    Organic Reaction Studio
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ইলেকট্রন পুশিং অ্যারো, কার্বোক্যাটায়ন ইন্টারমিডিয়েট ও ট্রানজিশন স্টেটের স্টেপ-বাই-স্টেপ অ্যানিমেটেড মেকানিজম
                </p>
              </div>
            </div>

            {/* Reaction Selector */}
            <div className="flex flex-wrap gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {MECHANISMS.map((mech) => (
                <button
                  key={mech.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedMechId(mech.id);
                    setCurrentStepIdx(0);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    selectedMechId === mech.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mech.nameBn.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interactive Mechanism Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Reaction Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-xs overflow-hidden bg-slate-950 text-slate-100">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white font-bold text-xs">
                  ধাপ {step.stepNumber} / {currentMech.steps.length}
                </Badge>
                <span className="text-2xs font-mono text-slate-400">
                  {currentMech.nameEn}
                </span>
              </div>

              <span className="text-xs font-bold text-amber-400 font-mono">
                {step.intermediateType}
              </span>
            </div>

            {/* Visual Mechanism Canvas Box */}
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[260px] space-y-6 text-center">
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 sm:p-6 shadow-inner w-full max-w-lg">
                <div className="text-xs font-mono font-bold text-emerald-400 mb-2 uppercase tracking-wider">
                  মলিকিউলার স্টেজ স্ট্রাকচার
                </div>
                <div className="font-mono text-base sm:text-lg font-black text-slate-100 tracking-wide py-2">
                  {step.visualState}
                </div>
              </div>

              {/* Chemical Equation Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 w-full max-w-lg">
                <div className="text-2xs text-slate-400 font-bold mb-1">প্রমিত রাসায়নিক সমীকরণ:</div>
                <div className="font-mono text-sm sm:text-base font-bold text-amber-300">
                  {step.chemicalEq}
                </div>
              </div>
            </div>

            {/* Step Controls */}
            <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="gap-1 text-xs border-slate-700 bg-slate-800 text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>পূর্ববর্তী ধাপ</span>
              </Button>

              <div className="flex gap-1.5">
                {currentMech.steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-6 rounded-full transition-all",
                      i === currentStepIdx ? "bg-emerald-500" : "bg-slate-700"
                    )}
                  />
                ))}
              </div>

              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <span>{currentStepIdx === currentMech.steps.length - 1 ? "সম্পন্ন" : "পরবর্তী ধাপ"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Mechanism Deep Breakdown & HSC Traps (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                {step.stepTitle}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-4 text-xs sm:text-sm">
              <p className="text-muted-foreground leading-relaxed">
                {step.explanation}
              </p>

              {/* Intermediate Callout */}
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
                <span className="text-2xs font-bold text-primary uppercase">উৎপন্ন মধ্যবর্তী অবস্থা:</span>
                <div className="font-bold text-foreground">{step.intermediateType}</div>
              </div>

              {/* Board / Admission Trap */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1.5">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>বোর্ড ও এডমিশন ট্র্যাপ:</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                  {currentMech.hscTrap}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
