"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, ArrowRight, ArrowLeft, RotateCcw, Sparkles, Activity, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function LeChatelierLab() {
  const [rxnType, setRxnType] = useState<"ammonia" | "no2">("ammonia");

  // Ammonia Parameters
  const [temp, setTemp] = useState<number>(450); // °C
  const [pressure, setPressure] = useState<number>(200); // atm
  const [hasCatalyst, setHasCatalyst] = useState<boolean>(true);

  // NO2 Parameters
  const [no2Temp, setNo2Temp] = useState<number>(50); // °C

  // Equilibrium Calculations for Haber-Bosch: N2 + 3H2 <=> 2NH3 (Exothermic, Delta H = -92.4 kJ)
  // High pressure favors right (4 mol -> 2 mol)
  // Low temperature favors right (exothermic), but 450-500°C is optimum for reaction kinetics!
  const getAmmoniaYield = () => {
    const pressureFactor = (pressure / 200) * 25;
    const tempFactor = (1 - (temp - 300) / 400) * 35;
    const catalystBonus = hasCatalyst ? 15 : 0;
    const totalYield = Math.max(5, Math.min(88, 15 + pressureFactor + tempFactor + catalystBonus));
    return Math.round(totalYield);
  };

  const ammoniaYield = getAmmoniaYield();
  const shiftDirection = temp > 500 ? "বাম দিকে (পশ্চাৎমুখী)" : pressure > 150 ? "ডান দিকে (সম্মুখমুখী)" : "সাম্যাবস্থা";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-amber-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>রাসায়নিক সাম্যাবস্থা ও লা-শাতেলিয়ার নীতি ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    রসায়ন ১ম পত্র: ৪র্থ অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  তাপমাত্রা, চাপ ও ঘনমাত্রার পরিবর্তনের প্রভাবে সাম্যাবস্থার সরণ ও উৎপাদনের লাইভ সিমুলেশন
                </p>
              </div>
            </div>

            {/* Reaction Selector */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setRxnType("ammonia");
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  rxnType === "ammonia" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                হেবার-বশ অ্যামোনিয়া সংশ্লেষণ
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setRxnType("no2");
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  rxnType === "no2" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                N₂O₄ ⇌ 2NO₂ বর্ণ পরিবর্তন
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders & Chemical System Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-xs p-5 space-y-5">
            {rxnType === "ammonia" && (
              <>
                <div className="rounded-xl border bg-muted/30 p-3.5 text-center font-mono font-bold text-sm sm:text-base text-foreground">
                  N₂(g) + 3H₂(g) ⇌ 2NH₃(g) &nbsp; (ΔH = -92.4 kJ/mol)
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>তাপমাত্রা (Temperature):</span>
                      <span className="font-mono text-primary">{temp} °C</span>
                    </div>
                    <input
                      type="range"
                      min={250}
                      max={650}
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-3xs text-muted-foreground">
                      <span>কম তাপমাত্রা (উৎপাদ বাড়ে)</span>
                      <span className="text-amber-500 font-bold">অনুকূল: ৪৫০-৫০০°C</span>
                      <span>অতিরিক্ত তাপমাত্রা (উৎপাদ কমে)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>চাপ (Pressure):</span>
                      <span className="font-mono text-primary">{pressure} atm</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={300}
                      value={pressure}
                      onChange={(e) => setPressure(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-3xs text-muted-foreground">
                      <span>১ atm</span>
                      <span className="text-emerald-500 font-bold">অনুকূল: ২০০ atm</span>
                      <span>৩০০ atm</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-xs font-bold text-foreground">আয়রন প্রভাবক (Fe Catalyst + Al₂O₃/K₂O):</div>
                    <Button
                      size="sm"
                      variant={hasCatalyst ? "default" : "outline"}
                      className="h-7 text-xs font-bold"
                      onClick={() => setHasCatalyst(!hasCatalyst)}
                    >
                      {hasCatalyst ? "সক্রিয় (Active) ✓" : "নিষ্ক্রিয়"}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {rxnType === "no2" && (
              <>
                <div className="rounded-xl border bg-muted/30 p-3.5 text-center font-mono font-bold text-sm text-foreground">
                  N₂O₄(g) [বর্ণহীন] ⇌ 2NO₂(g) [গাঢ় বাদামী] &nbsp; (ΔH = +57.2 kJ/mol)
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>তাপমাত্রা:</span>
                      <span className="font-mono text-primary">{no2Temp} °C</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={no2Temp}
                      onChange={(e) => setNo2Temp(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Visual Color Preview Cylinder */}
                  <div
                    className="h-20 rounded-xl border flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-inner"
                    style={{
                      backgroundColor: `rgba(180, 83, 9, ${Math.max(0.05, no2Temp / 100)})`,
                      color: no2Temp > 40 ? "#ffffff" : "#78350f",
                    }}
                  >
                    {no2Temp < 20 ? "বর্ণহীন তরল/গ্যাস (N₂O₄ প্রাধান্য)" : no2Temp < 60 ? "হালকা বাদামী বর্ণ (মিশ্রণ)" : "গাঢ় বাদামী গ্যাস (NO₂ প্রাধান্য)"}
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Reaction Yield & Equilibrium Shift Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>সাম্যাবস্থা আউটপুট ও উৎপাদন</span>
            </CardTitle>

            {rxnType === "ammonia" && (
              <div className="space-y-3">
                <div className="rounded-xl border bg-emerald-500/10 p-4 text-center space-y-1">
                  <div className="text-2xs text-muted-foreground uppercase font-bold">অ্যামোনিয়ার উৎপাদন শতকরা হার</div>
                  <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {ammoniaYield}%
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">লা-শাতেলিয়ার সরণ:</span>
                    <span className="font-bold text-foreground">{shiftDirection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">বিক্রিয়া প্রকার:</span>
                    <span className="font-bold text-rose-500">তাপোৎপাদী (ΔH &lt; 0)</span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-2xs space-y-1">
                  <div className="font-bold text-amber-700 dark:text-amber-400">বোর্ড অপটিমাম শর্ত:</div>
                  <p className="text-foreground leading-relaxed">
                    তাপমাত্রা: ৪৫০°C - ৫০০°C, চাপ: ২০০ atm, এবং প্রভাবক: সূক্ষ্ম আয়রন চূর্ণ (Fe) + প্রভাবক বর্ধক (Al₂O₃ ও K₂O)।
                  </p>
                </div>
              </div>
            )}

            {rxnType === "no2" && (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5">
                  <div className="font-bold text-foreground">তাপহারী বিক্রিয়া (ΔH &gt; 0):</div>
                  <p className="text-muted-foreground leading-relaxed text-2xs">
                    তাপমাত্রা বৃদ্ধি করলে লা-শাতেলিয়ার নীতি অনুসারে সাম্যাবস্থা সম্মুখমুখী (ডানে) সরে যায়, ফলে বেশি বাদামী বর্ণের NO₂ গ্যাস উৎপন্ন হয়।
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
