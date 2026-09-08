"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Waves,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Sliders,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function WaveOpticsLab() {
  const [wavelengthNm, setWavelengthNm] = useState<number>(550); // Green light
  const [slitDistanceMm, setSlitDistanceMm] = useState<number>(0.25); // d in mm
  const [screenDistanceM, setScreenDistanceM] = useState<number>(1.2); // D in meters

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fringe width calculation: beta = (lambda * D) / d
  // lambda in meters: wavelengthNm * 1e-9
  // d in meters: slitDistanceMm * 1e-3
  // D in meters: screenDistanceM
  const lambdaM = wavelengthNm * 1e-9;
  const dM = slitDistanceMm * 1e-3;
  const fringeWidthM = (lambdaM * screenDistanceM) / dM;
  const fringeWidthMm = fringeWidthM * 1000;

  // Color mapper from wavelength
  const getColorFromWavelength = (wl: number) => {
    if (wl < 450) return "#8b5cf6"; // Violet
    if (wl < 495) return "#3b82f6"; // Blue
    if (wl < 570) return "#22c55e"; // Green
    if (wl < 590) return "#eab308"; // Yellow
    if (wl < 620) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const currentColor = getColorFromWavelength(wavelengthNm);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 650;
    const height = 360;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const originX = 80;
    const screenX = 540;

    // Slits barrier
    ctx.fillStyle = "#334155";
    ctx.fillRect(originX, 30, 10, 120);
    ctx.fillRect(originX, 170, 10, 20); // between slits
    ctx.fillRect(originX, 210, 10, 120);

    // Light source rays
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, 180);
    ctx.lineTo(originX, 160);
    ctx.moveTo(20, 180);
    ctx.lineTo(originX, 200);
    ctx.stroke();

    // Interference wave arcs from slits
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1;
    for (let r = 20; r < 360; r += 25) {
      // From slit 1 (y = 155)
      ctx.beginPath();
      ctx.arc(originX + 10, 155, r, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      // From slit 2 (y = 205)
      ctx.beginPath();
      ctx.arc(originX + 10, 205, r, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
    }

    // Screen line
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(screenX, 20, 14, 320);

    // Interference pattern on screen (Fringes)
    const centerY = 180;
    const pxPerMm = 18; // screen visual scale
    const visualFringePx = Math.max(4, fringeWidthMm * pxPerMm);

    for (let y = 30; y < 330; y += 1) {
      const distFromCenter = y - centerY;
      // Phase difference delta = (2 * pi * d * y) / (lambda * D)
      const phase = (2 * Math.PI * distFromCenter) / visualFringePx;
      const intensity = Math.pow(Math.cos(phase / 2), 2);

      ctx.fillStyle = currentColor;
      ctx.globalAlpha = intensity * 0.95;
      ctx.fillRect(screenX + 2, y, 10, 1);
    }

    ctx.globalAlpha = 1.0;

    // Intensity profile curve (Right side)
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = 30; y < 330; y += 2) {
      const distFromCenter = y - centerY;
      const phase = (2 * Math.PI * distFromCenter) / visualFringePx;
      const intensity = Math.pow(Math.cos(phase / 2), 2);
      const curveX = screenX + 25 + intensity * 60;

      if (y === 30) ctx.moveTo(curveX, y);
      else ctx.lineTo(curveX, y);
    }
    ctx.stroke();

    ctx.restore();
  }, [wavelengthNm, slitDistanceMm, screenDistanceM, fringeWidthMm, currentColor]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-teal-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Waves className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ইয়ং-এর দ্বি-চির ব্যতিচার ও তরঙ্গ আলোকবিজ্ঞান ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    পদার্থবিজ্ঞান ২য় পত্র: ৭ম অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  আলোর ব্যতিচার, ডোরার প্রস্থ ($\beta = \frac{\lambda D}{d}$) এবং পর্দার উজ্জ্বল/অন্ধকার ডোরার বিস্তার পর্যবেক্ষণ
                </p>
              </div>
            </div>

            {/* Light Presets */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { label: "লাল (৬৫৬ nm)", wl: 656 },
                { label: "সবুজ (৫৫০ nm)", wl: 550 },
                { label: "নীল (৪৮৬ nm)", wl: 486 },
                { label: "বেগুনি (৪১০ nm)", wl: 410 },
              ].map((p) => (
                <button
                  key={p.wl}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setWavelengthNm(p.wl);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    wavelengthNm === p.wl ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
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
                INTERFERENCE PATTERN & INTENSITY PROFILE
              </span>
              <Badge className="font-mono text-3xs font-bold text-white" style={{ backgroundColor: currentColor }}>
                ডোরার প্রস্থ β = {fringeWidthMm.toFixed(3)} mm
              </Badge>
            </div>

            <canvas
              ref={canvasRef}
              width={650}
              height={360}
              className="w-full h-auto block aspect-[650/360]"
            />
          </Card>
        </div>

        {/* Controls & Math (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-500" />
              <span>অপটিক্যাল প্যারামিটার কন্ট্রোল</span>
            </CardTitle>

            <div className="space-y-3 text-xs font-medium">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>আলোর তরঙ্গদৈর্ঘ্য (λ):</span>
                  <span className="font-mono text-primary">{wavelengthNm} nm</span>
                </div>
                <input
                  type="range"
                  min={380}
                  max={720}
                  value={wavelengthNm}
                  onChange={(e) => setWavelengthNm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>চিরদ্বয়ের মধ্যবর্তী দূরত্ব (d):</span>
                  <span className="font-mono text-primary">{slitDistanceMm} mm</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={slitDistanceMm}
                  onChange={(e) => setSlitDistanceMm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>চির হতে পর্দার দূরত্ব (D):</span>
                  <span className="font-mono text-primary">{screenDistanceM} m</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={screenDistanceM}
                  onChange={(e) => setScreenDistanceM(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Physical Quantities Card */}
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">পরপর দুটি উজ্জ্বল ডোরার ব্যবধান:</span>
                  <span className="font-bold text-primary">{fringeWidthMm.toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ডোরার কৌণিক বিস্তার (θ = λ/d):</span>
                  <span className="font-bold text-foreground">{((lambdaM / dM) * 1000).toFixed(3)} mrad</span>
                </div>
              </div>

              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-2xs space-y-1">
                <div className="font-bold text-teal-700 dark:text-teal-400">
                  HSC ব্যতিচার নীতি:
                </div>
                <p className="text-foreground leading-relaxed">
                  চিরদ্বয়ের দূরত্ব $d$ যত কম হবে এবং পর্দার দূরত্ব $D$ যত বেশি হবে, ডোরার প্রস্থ $\beta$ তত দৃশ্যমান ও স্পষ্ট হবে।
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
