"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Sparkles,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function ComplexPlaneLab() {
  const [re, setRe] = useState<number>(3); // Real part x
  const [im, setIm] = useState<number>(4); // Imaginary part y

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Modulus r = sqrt(x^2 + y^2)
  const modulus = Math.hypot(re, im);

  // Principal Argument in radians [-pi, pi]
  const argRad = Math.atan2(im, re);
  const argDeg = (argRad * 180) / Math.PI;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 600;
    const height = 360;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2;
    const scale = 25; // 25px per unit

    // Grid Lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;
    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    // Real Axis
    ctx.beginPath();
    ctx.moveTo(20, originY);
    ctx.lineTo(width - 20, originY);
    ctx.stroke();
    // Imaginary Axis
    ctx.beginPath();
    ctx.moveTo(originX, height - 20);
    ctx.lineTo(originX, 20);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("Real (বাস্তব অক্ষ)", width - 100, originY - 8);
    ctx.fillText("Imaginary (অবাস্তব অক্ষ)", originX + 8, 30);

    // Unit Circle guide (r = 5)
    ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(originX, originY, modulus * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector to z = (re, im)
    const ptX = originX + re * scale;
    const ptY = originY - im * scale;

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(ptX, ptY);
    ctx.stroke();

    // Complex Point Z
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(ptX, ptY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Complex Conjugate z_bar = (re, -im)
    const conjY = originY + im * scale;
    ctx.strokeStyle = "rgba(244, 63, 94, 0.6)";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(ptX, conjY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(ptX, conjY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Labels on Points
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px font-mono, monospace";
    ctx.fillText(`z = ${re} + ${im}i`, ptX + 8, ptY - 8);

    ctx.fillStyle = "#f43f5e";
    ctx.fillText(`z̄ = ${re} - ${im}i`, ptX + 8, conjY + 14);

    ctx.restore();
  }, [re, im, modulus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-purple-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>জটিল সংখ্যা ও আরগ্যান্ড চিত্র স্টুডিও</span>
                  <Badge variant="secondary" className="text-xs">
                    উচ্চতর গণিত ২য় পত্র: ৩য় অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  মডুলাস ($|z|$), মুখ্য আর্গুমেন্ট ($\text{Arg}(z)$) এবং অনুবন্ধী জটিল সংখ্যার জ্যামিতিক রূপ
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { label: "1 + i", x: 1, y: 1 },
                { label: "3 + 4i", x: 3, y: 4 },
                { label: "-2 + 3i", x: -2, y: 3 },
                { label: "-4 - 3i", x: -4, y: -3 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setRe(p.x);
                    setIm(p.y);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition font-mono",
                    re === p.x && im === p.y ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
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
                ARGAND COMPLEX PLANE [RE + IM·i]
              </span>
              <Badge className="bg-purple-600 text-white font-mono text-3xs font-bold">
                মডুলাস |z| = {modulus.toFixed(2)}
              </Badge>
            </div>

            <canvas
              ref={canvasRef}
              width={600}
              height={360}
              className="w-full h-auto block aspect-[600/360]"
            />
          </Card>
        </div>

        {/* Controls & Math (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-purple-500" />
              <span>বাস্তব ও অবাস্তব অংশ নিয়ন্ত্রণ</span>
            </CardTitle>

            <div className="space-y-3 text-xs font-medium">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>বাস্তব অংশ Re(z):</span>
                  <span className="font-mono text-primary">{re}</span>
                </div>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={1}
                  value={re}
                  onChange={(e) => setRe(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>অবাস্তব অংশ Im(z):</span>
                  <span className="font-mono text-primary">{im}</span>
                </div>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={1}
                  value={im}
                  onChange={(e) => setIm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Physical Quantities Card */}
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">পোলার রূপ (Polar Form):</span>
                  <span className="font-bold text-primary">{modulus.toFixed(2)} e^({argRad.toFixed(2)}i)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">মুখ্য আর্গুমেন্ট Arg(z):</span>
                  <span className="font-bold text-foreground">{argDeg.toFixed(1)}° ({argRad.toFixed(2)} rad)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">অনুবন্ধী জটিল সংখ্যা (Conjugate):</span>
                  <span className="font-bold text-rose-500">{re} - {im}i</span>
                </div>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-2xs space-y-1">
                <div className="font-bold text-purple-700 dark:text-purple-400">
                  ডি-ময়ভারের উপপাদ্য:
                </div>
                <p className="font-mono text-foreground">
                  $(\cos\theta + i\sin\theta)^n = \cos(n\theta) + i\sin(n\theta)$
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
