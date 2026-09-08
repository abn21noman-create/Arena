"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Atom, Sparkles, Zap, RotateCcw, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface SpectralSeries {
  id: string;
  nameBn: string;
  nameEn: string;
  n1: number;
  region: string;
  colorName: string;
}

const SPECTRAL_SERIES: SpectralSeries[] = [
  { id: "lyman", nameBn: "লাইমেন সিরিজ", nameEn: "Lyman Series", n1: 1, region: "অতিবেগুনি (UV)", colorName: "#8b5cf6" },
  { id: "balmer", nameBn: "বামার সিরিজ (দৃশ্যমান)", nameEn: "Balmer Series", n1: 2, region: "দৃশ্যমান আলো (Visible: 400-700nm)", colorName: "#06b6d4" },
  { id: "paschen", nameBn: "প্যাশ্চেন সিরিজ", nameEn: "Paschen Series", n1: 3, region: "অবলোহিত (Infrared - IR)", colorName: "#f43f5e" },
  { id: "brackett", nameBn: "ব্র্যাকেট সিরিজ", nameEn: "Brackett Series", n1: 4, region: "দূর অবলোহিত (Far IR)", colorName: "#f59e0b" },
  { id: "pfund", nameBn: "ফুন্ড সিরিজ", nameEn: "Pfund Series", n1: 5, region: "দূর অবলোহিত (Far IR)", colorName: "#10b981" },
];

export function BohrAtomSpectrumLab() {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("balmer");
  const [n2, setN2] = useState<number>(3); // initial upper level for Balmer (3->2)

  const currentSeries = SPECTRAL_SERIES.find((s) => s.id === selectedSeriesId) || SPECTRAL_SERIES[1];
  const n1 = currentSeries.n1;

  // Rydberg Formula: 1/lambda = R_H * (1/n1^2 - 1/n2^2)
  // R_H = 1.09678 * 10^7 m^-1 = 109678 cm^-1
  const R_H = 1.09678e7;
  const invLambda = R_H * (1 / (n1 * n1) - 1 / (n2 * n2));
  const wavelengthM = 1 / invLambda;
  const wavelengthNm = wavelengthM * 1e9; // in nanometers
  const waveNumberCm = invLambda / 100; // cm^-1

  // Photon Energy: E = hc / lambda (in eV)
  // h = 6.626e-34, c = 3e8, 1 eV = 1.6e-19 J
  const energyJ = (6.626e-34 * 3e8) / wavelengthM;
  const energyEV = energyJ / 1.602e-19;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wavelength to RGB color for visible light (380 - 750 nm)
  const getWavelengthColor = (nm: number) => {
    if (nm < 380) return "#7c3aed"; // UV violet
    if (nm < 440) return "#4f46e5"; // Violet-indigo
    if (nm < 490) return "#0284c7"; // Blue
    if (nm < 510) return "#0d9488"; // Cyan
    if (nm < 580) return "#16a34a"; // Green
    if (nm < 645) return "#ea580c"; // Orange
    if (nm <= 750) return "#dc2626"; // Red
    return "#991b1b"; // Infrared dark red
  };

  const photonColor = getWavelengthColor(wavelengthNm);

  // Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = 750;
    const displayH = 380;

    if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayW, displayH);

    const originX = displayW / 2;
    const originY = displayH / 2;

    // Draw Nucleus (+)
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(originX, originY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("+", originX - 4, originY + 4);

    // Draw Concentric Bohr Orbits n = 1 to 6
    const baseRadius = 32;
    for (let i = 1; i <= 6; i++) {
      const r = baseRadius * Math.sqrt(i) * 1.5;

      ctx.strokeStyle = i === n1 || i === n2 ? "rgba(99, 102, 241, 0.8)" : "rgba(100, 116, 139, 0.3)";
      ctx.lineWidth = i === n1 || i === n2 ? 2 : 1;
      ctx.beginPath();
      ctx.arc(originX, originY, r, 0, Math.PI * 2);
      ctx.stroke();

      // Orbit label
      ctx.fillStyle = i === n1 ? "#10b981" : i === n2 ? "#f43f5e" : "#64748b";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(`n=${i}`, originX + r + 4, originY + 3);
    }

    // Draw Electron Transition Jump Vector
    const r1 = baseRadius * Math.sqrt(n1) * 1.5;
    const r2 = baseRadius * Math.sqrt(n2) * 1.5;

    ctx.strokeStyle = photonColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(originX, originY - r2);
    ctx.lineTo(originX, originY - r1);
    ctx.stroke();
    ctx.setLineDash([]);

    // Emitted Photon Wave Packet (Wiggly line)
    ctx.strokeStyle = photonColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX + 15, originY - r1);
    for (let x = originX + 15; x < originX + 120; x += 5) {
      const y = originY - r1 + 8 * Math.sin((x - originX) * 0.3);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = photonColor;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`hν (${wavelengthNm.toFixed(1)} nm)`, originX + 130, originY - r1 + 4);

    ctx.restore();
  }, [n1, n2, photonColor, wavelengthNm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-cyan-500/10 via-card to-purple-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Atom className="h-6 w-6 animate-spin-slow" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>বোর পরমাণু মডেল ও কোয়ান্টাম স্পেকট্রাম ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    Physics & Chemistry Core
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ইলেকট্রন অরবিট জাম্প ($n_2 \to n_1$), রিডবার্গ সমীকরণ ও দৃশ্যমান বর্ণালীর তরঙ্গদৈর্ঘ্য লাইভ সিমুলেটর
                </p>
              </div>
            </div>

            {/* Series Switcher */}
            <div className="flex flex-wrap gap-1 bg-muted/40 p-1.5 rounded-xl border">
              {SPECTRAL_SERIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedSeriesId(s.id);
                    setN2(s.n1 + 1);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    selectedSeriesId === s.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.nameBn.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Bohr Orbit Area (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="border shadow-xs overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-2xs font-mono text-slate-400">
                HYDROGEN ATOM ENERGY LEVELS (n₁={n1} ← n₂={n2})
              </span>
              <Badge className="font-mono text-3xs text-white" style={{ backgroundColor: photonColor }}>
                {wavelengthNm.toFixed(1)} nm
              </Badge>
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={380}
              className="w-full h-auto block aspect-[750/380]"
            />
          </Card>
        </div>

        {/* Telemetry & Spectrum Bars (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                <span>কোয়ান্টাম ট্রানজিশন কন্ট্রোল</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>উচ্চ শক্তিস্তর (n₂):</span>
                  <span className="font-mono text-primary">n₂ = {n2}</span>
                </div>
                <div className="flex gap-1">
                  {[n1 + 1, n1 + 2, n1 + 3, n1 + 4, n1 + 5].filter((n) => n <= 7).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        sfx.play("pop");
                        setN2(level);
                      }}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg border text-xs font-bold font-mono transition",
                        n2 === level ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted/30"
                      )}
                    >
                      n₂={level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spectral Mathematics Outputs */}
              <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">তরঙ্গদৈর্ঘ্য (λ):</span>
                  <span className="font-bold text-sm" style={{ color: photonColor }}>
                    {wavelengthNm.toFixed(2)} nm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">তরঙ্গ সংখ্যা (v̄ = 1/λ):</span>
                  <span className="font-bold text-foreground">{waveNumberCm.toFixed(1)} cm⁻¹</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ফোটন শক্তি (E = hν):</span>
                  <span className="font-bold text-primary">{energyEV.toFixed(3)} eV</span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="text-muted-foreground">বর্ণালী অঞ্চল:</span>
                  <span className="font-bold text-foreground">{currentSeries.region}</span>
                </div>
              </div>

              {/* Board Fact Callout */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-2xs space-y-1">
                <div className="font-bold text-cyan-700 dark:text-cyan-400">
                  HSC বোর্ড স্পেশাল:
                </div>
                <p className="text-foreground leading-relaxed">
                  বামার সিরিজের প্রথম রেখা ($H_\alpha$) এর জন্য $n_2=3 \to n_1=2$ (লাল বর্ণ, ৬৫৬.৩ nm)। লাইমেন সিরিজ অতিবেগুনি অঞ্চলে ঘটে।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
