"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BatteryCharging,
  Sparkles,
  Zap,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function ElectrochemistryLab() {
  const [znConc, setZnConc] = useState<number>(0.1); // Molar [Zn2+]
  const [cuConc, setCuConc] = useState<number>(1.0); // Molar [Cu2+]

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Standard potentials: E0_zn = -0.76 V, E0_cu = +0.34 V
  const E0_cell = 1.10; // V
  const n = 2; // electrons transferred
  const Q = znConc / cuConc;
  // Nernst Equation at 298K: E_cell = E0 - (0.0591 / n) * log10(Q)
  const E_cell = E0_cell - (0.0591 / n) * Math.log10(Q);

  // Gibbs free energy: Delta G = -n * F * E_cell (F = 96485 C/mol)
  const deltaG_kJ = (-n * 96485 * E_cell) / 1000;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 650;
    const height = 340;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw Left Beaker (Anode - ZnSO4)
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    ctx.fillRect(100, 140, 160, 160);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 140, 160, 160);

    // Left Electrode (Zn - Zinc Bar)
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(140, 90, 24, 180);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 90, 24, 180);

    // Draw Right Beaker (Cathode - CuSO4)
    ctx.fillStyle = "rgba(14, 165, 233, 0.3)";
    ctx.fillRect(390, 140, 160, 160);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.strokeRect(390, 140, 160, 160);

    // Right Electrode (Cu - Copper Bar)
    ctx.fillStyle = "#d97706";
    ctx.fillRect(486, 90, 24, 180);
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 2;
    ctx.strokeRect(486, 90, 24, 180);

    // Salt Bridge (Inverted U-tube)
    ctx.fillStyle = "rgba(251, 191, 36, 0.35)";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(220, 220);
    ctx.lineTo(220, 110);
    ctx.lineTo(430, 110);
    ctx.lineTo(430, 220);
    ctx.lineTo(410, 220);
    ctx.lineTo(410, 130);
    ctx.lineTo(240, 130);
    ctx.lineTo(240, 220);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // External Circuit Wire & Voltmeter
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(152, 90);
    ctx.lineTo(152, 40);
    ctx.lineTo(325, 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(498, 90);
    ctx.lineTo(498, 40);
    ctx.lineTo(325, 40);
    ctx.stroke();

    // Voltmeter Circle
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(325, 40, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Voltmeter Text
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px font-mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${E_cell.toFixed(2)} V`, 325, 44);

    // Labels
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("অ্যানোড: Zn (জারণ)", 152, 320);

    ctx.fillStyle = "#f59e0b";
    ctx.fillText("ক্যাথোড: Cu (বিজারণ)", 498, 320);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "10px sans-serif";
    ctx.fillText("সল্ট ব্রিজ (KCl Agar)", 325, 125);

    ctx.restore();
  }, [znConc, cuConc, E_cell]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-amber-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BatteryCharging className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>তড়িৎ রসায়ন ও নার্নস্ট সমীকরণ গ্যালভানিক সেল ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    রসায়ন ২য় পত্র: ৪র্থ অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ড্যানিয়েল সেল (Zn - Cu), নার্নস্ট সমীকরণ দ্বারা কোষ বিভব (E_cell) ও মুক্ত শক্তি (ΔG) বিশ্লেষণ
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="border shadow-xs overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-2xs font-mono text-slate-400">
                DANIELL VOLTAIC CELL [Zn | Zn²⁺ || Cu²⁺ | Cu]
              </span>
              <Badge className="bg-emerald-600 text-white font-mono text-3xs font-bold">
                ইলেক্ট্রোমোটিভ ফোর্স E_cell = {E_cell.toFixed(3)} V
              </Badge>
            </div>

            <canvas
              ref={canvasRef}
              width={650}
              height={340}
              className="w-full h-auto block aspect-[650/340]"
            />
          </Card>
        </div>

        {/* Controls & Math (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-500" />
              <span>আয়ন ঘনমাত্রা ও নার্নস্ট হিসাব</span>
            </CardTitle>

            <div className="space-y-3 text-xs font-medium">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>[Zn²⁺] অ্যানোড দ্রবণের ঘনমাত্রা:</span>
                  <span className="font-mono text-primary">{znConc} M</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={2.0}
                  step={0.01}
                  value={znConc}
                  onChange={(e) => setZnConc(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>[Cu²⁺] ক্যাথোড দ্রবণের ঘনমাত্রা:</span>
                  <span className="font-mono text-primary">{cuConc} M</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={2.0}
                  step={0.01}
                  value={cuConc}
                  onChange={(e) => setCuConc(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Physical Quantities Card */}
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">কোষ বিভব (E_cell):</span>
                  <span className="font-bold text-primary text-xs">{E_cell.toFixed(3)} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">গিবস মুক্ত শক্তি (ΔG = -nFE):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{deltaG_kJ.toFixed(1)} kJ/mol</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-sans">
                  <span className="text-muted-foreground">স্বতঃস্ফূর্ততা:</span>
                  <Badge variant="outline" className="text-3xs text-emerald-500 font-bold">
                    {deltaG_kJ < 0 ? "স্বতঃস্ফূর্ত বিক্রিয়া (Spontaneous)" : "অস্বতঃস্ফূর্ত"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-2xs space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400">
                  নার্নস্ট সমীকরণ (২৯৮ K):
                </div>
                <p className="font-mono text-foreground">
                  E_cell = E0 - (0.0591 / n) * log([Zn2+] / [Cu2+])
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
