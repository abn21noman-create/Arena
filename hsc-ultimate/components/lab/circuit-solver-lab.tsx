"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function CircuitSolverLab() {
  const [mode, setMode] = useState<"combo" | "wheatstone">("combo");

  // Combination states
  const [r1, setR1] = useState<number>(10);
  const [r2, setR2] = useState<number>(20);
  const [voltage, setVoltage] = useState<number>(12);
  const [circuitType, setCircuitType] = useState<"series" | "parallel">("series");

  // Wheatstone states P/Q = R/S
  const [p, setP] = useState<number>(10);
  const [q, setQ] = useState<number>(20);
  const [r, setR] = useState<number>(15);
  const [s, setS] = useState<number>(30); // Balanced when 10/20 = 15/30

  // Computed Combo Metrics
  const rEq = circuitType === "series" ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const totalCurrent = voltage / rEq;
  const power = totalCurrent * voltage;

  // Computed Wheatstone
  const isBalanced = Math.abs(p * s - q * r) < 0.01;
  const galvoCurrent = isBalanced ? 0 : (p * s - q * r) / (p + q + r + s);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>তড়িৎ বর্তনী ও সার্কিট সলভার ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    পদার্থবিজ্ঞান ২য় পত্র: ৩য় অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  তুল্য রোধ, ওহমের সূত্র এবং হুইটস্টোন ব্রিজের সাম্যাবস্থা লাইভ ক্যালকুলেটর
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setMode("combo");
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  mode === "combo" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                রোধের সমবায় (Series/Parallel)
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setMode("wheatstone");
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  mode === "wheatstone" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                হুইটস্টোন ব্রিজ (Wheatstone)
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4">
            {mode === "combo" && (
              <>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm">রোধ সংযোগের ধরন:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCircuitType("series")}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-bold border transition",
                        circuitType === "series" ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      )}
                    >
                      শ্রেণি সংযোগ (Series)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCircuitType("parallel")}
                      className={cn(
                        "px-3 py-1 rounded-md text-xs font-bold border transition",
                        circuitType === "parallel" ? "bg-primary text-primary-foreground" : "bg-muted/40"
                      )}
                    >
                      সমান্তরাল সংযোগ (Parallel)
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>১ম রোধ (R₁):</span>
                      <span className="font-mono text-primary">{r1} Ω</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={100}
                      value={r1}
                      onChange={(e) => setR1(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>২য় রোধ (R₂):</span>
                      <span className="font-mono text-primary">{r2} Ω</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={100}
                      value={r2}
                      onChange={(e) => setR2(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>উৎস বিভব (V):</span>
                      <span className="font-mono text-primary">{voltage} V</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={48}
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "wheatstone" && (
              <div className="space-y-4">
                <div className="border-b pb-2 flex items-center justify-between">
                  <span className="font-bold text-sm">হুইটস্টোন ব্রিজের চার বাহুর রোধ:</span>
                  <Badge className={isBalanced ? "bg-emerald-600 text-white" : "bg-rose-500 text-white"}>
                    {isBalanced ? "সাম্যাবস্থা (Ig = 0) ✓" : "অসাম্যাবস্থা (বিক্ষোভ আছে)"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>১ম বাহু (P):</span>
                      <span className="font-mono text-primary">{p} Ω</span>
                    </div>
                    <input type="range" min={2} max={60} value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>২য় বাহু (Q):</span>
                      <span className="font-mono text-primary">{q} Ω</span>
                    </div>
                    <input type="range" min={2} max={60} value={q} onChange={(e) => setQ(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>৩য় বাহু (R):</span>
                      <span className="font-mono text-primary">{r} Ω</span>
                    </div>
                    <input type="range" min={2} max={60} value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>৪র্থ বাহু (S):</span>
                      <span className="font-mono text-primary">{s} Ω</span>
                    </div>
                    <input type="range" min={2} max={60} value={s} onChange={(e) => setS(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                </div>

                <div className="p-3 bg-muted/20 rounded-xl border text-2xs font-mono text-center">
                  শর্ত: P/Q = {(p / q).toFixed(2)} বনাম R/S = {(r / s).toFixed(2)}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Output & Equations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-xs p-5 space-y-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span>সার্কিট লাইভ আউটপুট</span>
            </CardTitle>

            {mode === "combo" && (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
                  <div className="text-2xs text-muted-foreground uppercase">তুল্য রোধ (Req):</div>
                  <div className="text-2xl font-bold text-primary">{rEq.toFixed(2)} Ω</div>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
                  <div className="text-2xs text-muted-foreground uppercase">তড়িৎপ্রবাহ (I = V/Req):</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalCurrent.toFixed(3)} A</div>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
                  <div className="text-2xs text-muted-foreground uppercase">তড়িৎ ক্ষমতা (P = VI):</div>
                  <div className="text-xl font-bold text-amber-500">{power.toFixed(2)} W</div>
                </div>
              </div>
            )}

            {mode === "wheatstone" && (
              <div className="space-y-3 text-xs">
                <div className={cn("rounded-xl border p-4 text-center space-y-1", isBalanced ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30")}>
                  <div className="text-2xs text-muted-foreground uppercase font-bold">গ্যালভানোমিটার প্রবাহ (Ig)</div>
                  <div className="text-3xl font-black font-mono">{isBalanced ? "০.০০ A (স্থির)" : `${galvoCurrent.toFixed(3)} A`}</div>
                </div>
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  হুইটস্টোন ব্রিজের সাম্যাবস্থায় গ্যালভানোমিটারের মধ্য দিয়ে কোনো বিদ্যুৎ প্রবাহিত হয় না ($I_g = 0$) এবং ব্রিজের সংবেদনশীলতা সর্বোচ্চ থাকে।
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
