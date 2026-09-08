"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Sparkles,
  RotateCcw,
  Sliders,
  Layers,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function CalculusVisualizerLab() {
  const [activeTab, setActiveTab] = useState<"derivative" | "integral">("derivative");

  // Derivative state
  const [xVal, setXVal] = useState<number>(1.5);

  // Integral state (f(x) = x^2 on [0, 2])
  const [stripCount, setStripCount] = useState<number>(10);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Functions: f(x) = 0.5 * x^2
  const f = (x: number) => 0.5 * x * x;
  const fPrime = (x: number) => x; // derivative of 0.5 * x^2 is x

  // Definite integral of 0.5 * x^2 from a=0 to b=3
  const a = 0;
  const b = 3;
  const exactArea = (0.5 * Math.pow(b, 3)) / 3 - (0.5 * Math.pow(a, 3)) / 3; // 4.5

  // Riemann sum approximation
  const dx = (b - a) / stripCount;
  let riemannSum = 0;
  for (let i = 0; i < stripCount; i++) {
    const xMid = a + i * dx + dx / 2;
    riemannSum += f(xMid) * dx;
  }

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

    const originX = 120;
    const originY = 280;
    const scaleX = 80;
    const scaleY = 40;

    // Coordinate Axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1.5;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(40, originY);
    ctx.lineTo(580, originY);
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 320);
    ctx.lineTo(originX, 40);
    ctx.stroke();

    if (activeTab === "derivative") {
      // Draw Curve f(x) = 0.5 * x^2
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = -1; px <= 4.5; px += 0.05) {
        const cx = originX + px * scaleX;
        const cy = originY - f(px) * scaleY;
        if (px === -1) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Tangent point (xVal, f(xVal))
      const ptX = originX + xVal * scaleX;
      const ptY = originY - f(xVal) * scaleY;
      const slope = fPrime(xVal);

      // Tangent Line: y - y0 = slope * (x - x0)
      const tLen = 2.0;
      const tX1 = xVal - tLen;
      const tY1 = f(xVal) - slope * tLen;
      const tX2 = xVal + tLen;
      const tY2 = f(xVal) + slope * tLen;

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(originX + tX1 * scaleX, originY - tY1 * scaleY);
      ctx.lineTo(originX + tX2 * scaleX, originY - tY2 * scaleY);
      ctx.stroke();

      // Point circle
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(ptX, ptY, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw Riemann Sum Rectangles
      ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1;

      for (let i = 0; i < stripCount; i++) {
        const xLeft = a + i * dx;
        const xMid = xLeft + dx / 2;
        const h = f(xMid);

        const rectX = originX + xLeft * scaleX;
        const rectW = dx * scaleX;
        const rectH = h * scaleY;
        const rectY = originY - rectH;

        ctx.fillRect(rectX, rectY, rectW, rectH);
        ctx.strokeRect(rectX, rectY, rectW, rectH);
      }

      // Draw exact curve on top
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = a; px <= b + 0.5; px += 0.05) {
        const cx = originX + px * scaleX;
        const cy = originY - f(px) * scaleY;
        if (px === a) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [activeTab, xVal, stripCount, exactArea, riemannSum]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-indigo-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ক্যালকুলাস স্পর্শক ঢাল ও যোগজীকরণ ক্ষেত্রফল ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    উচ্চতর গণিত ১ম ও ২য় পত্র
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  অন্তরীকরণ স্পর্শকের ঢাল ($dy/dx$) এবং যোগজীকরণ রিম্যান সমষ্টি ($\int_a^b f(x)dx$) এর জ্যামিতিক তাৎপর্য
                </p>
              </div>
            </div>

            {/* Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveTab("derivative");
                }}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition",
                  activeTab === "derivative" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                স্পর্শক ঢাল (Derivative)
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setActiveTab("integral");
                }}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition",
                  activeTab === "integral" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                ক্ষেত্রফল রিম্যান সাম (Integral)
              </button>
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
                CALCULUS GEOMETRIC ENGINE [f(x) = 0.5 x²]
              </span>
              <Badge className="bg-primary text-primary-foreground font-mono text-3xs font-bold">
                {activeTab === "derivative"
                  ? `ঢাল dy/dx = ${fPrime(xVal).toFixed(2)}`
                  : `ক্ষেত্রফল ≈ ${riemannSum.toFixed(3)}`}
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

        {/* Controls & Calculations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-500" />
              <span>প্যারামিটার ও লাইভ ক্যালকুলেশন</span>
            </CardTitle>

            {activeTab === "derivative" ? (
              <div className="space-y-3 text-xs font-medium">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>বিন্দু x₀ এর অবস্থান:</span>
                    <span className="font-mono text-primary">{xVal.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={3.5}
                    step={0.05}
                    value={xVal}
                    onChange={(e) => setXVal(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">বিন্দুর স্থানাঙ্ক (x₀, y₀):</span>
                    <span className="font-bold text-foreground">({xVal.toFixed(2)}, {f(xVal).toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-primary font-bold">স্পর্শকের ঢাল m = f&apos;(x₀):</span>
                    <span className="font-black text-primary text-xs">{fPrime(xVal).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs font-medium">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>আয়তক্ষেত্রের সংখ্যা (N Strips):</span>
                    <span className="font-mono text-primary">{stripCount}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={60}
                    step={1}
                    value={stripCount}
                    onChange={(e) => setStripCount(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">রিম্যান সাম আসন মান:</span>
                    <span className="font-bold text-primary">{riemannSum.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">প্রকৃত যোগজ মান (Exact):</span>
                    <span className="font-bold text-foreground">{exactArea.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-muted-foreground">ত্রুটি শতাংশ:</span>
                    <span className="font-bold text-emerald-500">{Math.abs((riemannSum - exactArea) / exactArea * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
