"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dna, Sparkles, Heart, Activity, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

type CrossType = "monohybrid" | "dihybrid" | "incomplete" | "blood";

export function GeneticsPunnettLab() {
  const [crossType, setCrossType] = useState<CrossType>("monohybrid");

  // Blood group states
  const [fatherBlood, setFatherBlood] = useState<string>("A");
  const [motherBlood, setMotherBlood] = useState<string>("B");

  const getBloodOutcomes = () => {
    if (fatherBlood === "O" && motherBlood === "O") return [{ group: "O", pct: "100%" }];
    if ((fatherBlood === "AB" && motherBlood === "O") || (fatherBlood === "O" && motherBlood === "AB")) {
      return [{ group: "A", pct: "50%" }, { group: "B", pct: "50%" }];
    }
    if (fatherBlood === "AB" && motherBlood === "AB") {
      return [{ group: "A", pct: "25%" }, { group: "B", pct: "25%" }, { group: "AB", pct: "50%" }];
    }
    if ((fatherBlood === "A" && motherBlood === "B") || (fatherBlood === "B" && motherBlood === "A")) {
      return [{ group: "A", pct: "25%" }, { group: "B", pct: "25%" }, { group: "AB", pct: "25%" }, { group: "O", pct: "25%" }];
    }
    if (fatherBlood === "A" && motherBlood === "A") {
      return [{ group: "A", pct: "75%" }, { group: "O", pct: "25%" }];
    }
    if (fatherBlood === "B" && motherBlood === "B") {
      return [{ group: "B", pct: "75%" }, { group: "O", pct: "25%" }];
    }
    return [{ group: "A", pct: "50%" }, { group: "B", pct: "50%" }];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-emerald-500/10 via-card to-pink-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Dna className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>জিনতত্ত্ব ও মেন্ডেলিয়ান জেনেটিক্স ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    জীববিজ্ঞান ২য় পত্র: ১১শ অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  পানেট স্কয়ার, মেন্ডেলের সূত্রের ব্যতিক্রম এবং রক্তের গ্রুপ ইনহেরিট্যান্স সিমুলেটর
                </p>
              </div>
            </div>

            {/* Cross Selector */}
            <div className="flex flex-wrap gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { id: "monohybrid", label: "একসংকর ক্রস (৩:১)" },
                { id: "dihybrid", label: "দ্বিসংকর ক্রস (৯:৩:৩:১)" },
                { id: "incomplete", label: "অসম্পূর্ণ প্রকটতা (১:২:১)" },
                { id: "blood", label: "ABO রক্তের গ্রুপ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setCrossType(tab.id as CrossType);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    crossType === tab.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Visual Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Punnett Square Box (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4">
            {crossType === "monohybrid" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm">F₂ জনুর পানেট স্কয়ার (Tt × Tt)</span>
                  <Badge className="bg-emerald-600 text-white font-mono text-xs">ফিনোটাইপ অনুপাত ৩:১</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                  <div className="p-3 bg-muted/40 rounded-xl">♀ \ ♂</div>
                  <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400">T (গ্যামেট)</div>
                  <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400">t (গ্যামেট)</div>

                  <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400">T</div>
                  <div className="p-4 rounded-xl border bg-card shadow-xs">
                    <div className="text-base text-primary">TT</div>
                    <div className="text-3xs text-muted-foreground">বিশুদ্ধ লম্বা</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-card shadow-xs">
                    <div className="text-base text-primary">Tt</div>
                    <div className="text-3xs text-muted-foreground">সংকর লম্বা</div>
                  </div>

                  <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400">t</div>
                  <div className="p-4 rounded-xl border bg-card shadow-xs">
                    <div className="text-base text-primary">Tt</div>
                    <div className="text-3xs text-muted-foreground">সংকর লম্বা</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-card shadow-xs">
                    <div className="text-base text-rose-500">tt</div>
                    <div className="text-3xs text-muted-foreground">বিশুদ্ধ খাটো</div>
                  </div>
                </div>
              </div>
            )}

            {crossType === "incomplete" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm">সন্ধ্যামালতী ফুলের অসম্পূর্ণ প্রকটতা (Rr × Rr)</span>
                  <Badge className="bg-pink-600 text-white font-mono text-xs">অনুপাত ১:২:১</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                  <div className="p-3 bg-muted/40 rounded-xl">♀ \ ♂</div>
                  <div className="p-3 bg-rose-500/15 rounded-xl text-rose-600">R (লাল)</div>
                  <div className="p-3 bg-slate-500/15 rounded-xl text-slate-400">r (সাদা)</div>

                  <div className="p-3 bg-rose-500/15 rounded-xl text-rose-600">R</div>
                  <div className="p-4 rounded-xl border bg-rose-500/10">
                    <div className="text-base text-rose-600 font-bold">RR</div>
                    <div className="text-3xs text-muted-foreground">লাল ফুল (১টি)</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-pink-500/15">
                    <div className="text-base text-pink-600 font-bold">Rr</div>
                    <div className="text-3xs text-muted-foreground">গোলাপী ফুল (২টি)</div>
                  </div>

                  <div className="p-3 bg-slate-500/15 rounded-xl text-slate-400">r</div>
                  <div className="p-4 rounded-xl border bg-pink-500/15">
                    <div className="text-base text-pink-600 font-bold">Rr</div>
                    <div className="text-3xs text-muted-foreground">গোলাপী ফুল (২টি)</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <div className="text-base text-slate-400 font-bold">rr</div>
                    <div className="text-3xs text-muted-foreground">সাদা ফুল (১টি)</div>
                  </div>
                </div>
              </div>
            )}

            {crossType === "blood" && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-bold text-sm">পিতামাতার রক্তের গ্রুপ নির্বাচন করুন:</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground">পিতার রক্তের গ্রুপ:</span>
                    <div className="flex gap-1">
                      {["A", "B", "AB", "O"].map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => setFatherBlood(grp)}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg border font-bold text-xs transition",
                            fatherBlood === grp ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted/30"
                          )}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground">মাতার রক্তের গ্রুপ:</span>
                    <div className="flex gap-1">
                      {["A", "B", "AB", "O"].map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => setMotherBlood(grp)}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg border font-bold text-xs transition",
                            motherBlood === grp ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted/30"
                          )}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Blood Probability Result */}
                <div className="rounded-xl border bg-muted/20 p-4 space-y-2 pt-3">
                  <div className="text-xs font-bold text-foreground">সন্তানের সম্ভাব্য রক্তের গ্রুপ:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {getBloodOutcomes().map((out, idx) => (
                      <div key={idx} className="rounded-lg border bg-card p-2.5 text-center">
                        <div className="text-lg font-black text-rose-500 font-mono">{out.group}</div>
                        <div className="text-2xs text-muted-foreground font-bold">{out.pct} সম্ভাবনা</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {crossType === "dihybrid" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm">দ্বিসংকর ক্রস ফিনোটাইপ অনুপাত (৯:৩:৩:১)</span>
                  <Badge className="bg-emerald-600 text-white font-mono text-xs">১৬ টি কম্বিনেশন</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl border bg-amber-500/10 p-3">
                    <div className="text-xl font-bold text-amber-600">৯ টি</div>
                    <div className="text-3xs text-muted-foreground">হলুদ-গোল (Y_R_)</div>
                  </div>
                  <div className="rounded-xl border bg-emerald-500/10 p-3">
                    <div className="text-xl font-bold text-emerald-600">৩ টি</div>
                    <div className="text-3xs text-muted-foreground">হলুদ-কুঞ্চিত (Y_rr)</div>
                  </div>
                  <div className="rounded-xl border bg-blue-500/10 p-3">
                    <div className="text-xl font-bold text-blue-600">৩ টি</div>
                    <div className="text-3xs text-muted-foreground">সবুজ-গোল (yyR_)</div>
                  </div>
                  <div className="rounded-xl border bg-rose-500/10 p-3">
                    <div className="text-xl font-bold text-rose-600">১ টি</div>
                    <div className="text-3xs text-muted-foreground">সবুজ-কুঞ্চিত (yyrr)</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Genetic Rules & HSC MCQ Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>মেন্ডেল সূত্রের রিক্যাপ ও ব্যতিক্রম</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3 text-xs">
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
                <div className="font-bold text-foreground">১ম সূত্রের ব্যতিক্রম অনুপাতসমূহ:</div>
                <ul className="space-y-1 text-muted-foreground text-2xs">
                  <li>• <strong>অসম্পূর্ণ প্রকটতা:</strong> ১:২:১ (সন্ধ্যামালতী ফুল)</li>
                  <li>• <strong>সমপ্রকটতা:</strong> ১:২:১ (আন্দালুশিয়ান মোরগ-মুরগী)</li>
                  <li>• <strong>লিথাল জিন (মারণ জিন):</strong> ২:১ (হলুদ ইঁদুর)</li>
                </ul>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-1">
                <div className="font-bold text-rose-700 dark:text-rose-400 text-xs">
                  বোর্ড পরীক্ষার হট কোয়েশ্চেন:
                </div>
                <p className="text-2xs text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                  পিতা-মাতা উভয়ের রক্তের গ্রুপ AB হলে কোনো সন্তানেরই O গ্রুপের রক্ত হওয়া সম্ভব নয়। সন্তানের রক্তের গ্রুপ কেবল A, B অথবা AB হতে পারে।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
