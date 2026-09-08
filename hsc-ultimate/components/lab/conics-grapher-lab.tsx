"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sigma, Sparkles, RotateCcw, Zap, Eye, CheckCircle2 } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

type ConicType = "parabola" | "ellipse" | "hyperbola";

export function ConicsGrapherLab() {
  const [conicType, setConicType] = useState<ConicType>("parabola");

  // Parabola (y - k)^2 = 4a(x - h)
  const [paramA, setParamA] = useState<number>(2);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Ellipse & Hyperbola: x^2/a^2 +- y^2/b^2 = 1
  const [ellipseA, setEllipseA] = useState<number>(4);
  const [ellipseB, setEllipseB] = useState<number>(3);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Computed metrics
  // For Parabola y^2 = 4ax
  const parabolaFocus = { x: offsetX + paramA, y: offsetY };
  const parabolaDirectrix = offsetX - paramA;
  const latusRectum = Math.abs(4 * paramA);

  // For Ellipse x^2/a^2 + y^2/b^2 = 1 (assuming a > b)
  const ellipseEccentricity = ellipseA >= ellipseB
    ? Math.sqrt(1 - (ellipseB * ellipseB) / (ellipseA * ellipseA))
    : Math.sqrt(1 - (ellipseA * ellipseA) / (ellipseB * ellipseB));
  const ellipseFocusDist = ellipseA >= ellipseB ? ellipseA * ellipseEccentricity : ellipseB * ellipseEccentricity;

  // For Hyperbola x^2/a^2 - y^2/b^2 = 1
  const hyperEccentricity = Math.sqrt(1 + (ellipseB * ellipseB) / (ellipseA * ellipseA));
  const hyperFocusDist = ellipseA * hyperEccentricity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = 750;
    const displayH = 420;

    if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayW, displayH);

    const originX = displayW / 2;
    const originY = displayH / 2;
    const unitScale = 28; // 28 pixels = 1 unit

    // Draw Coordinate Grid
    ctx.strokeStyle = "rgba(100, 116, 139, 0.25)";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = originX % unitScale; x < displayW; x += unitScale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, displayH);
      ctx.stroke();
    }
    // Horizontal grid lines
    for (let y = originY % unitScale; y < displayH; y += unitScale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(displayW, y);
      ctx.stroke();
    }

    // Main Axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
    ctx.lineWidth = 2;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(20, originY);
    ctx.lineTo(displayW - 20, originY);
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 20);
    ctx.lineTo(originX, displayH - 20);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("X", displayW - 15, originY + 14);
    ctx.fillText("Y", originX + 8, 18);
    ctx.fillText("O(0,0)", originX + 4, originY + 14);

    if (conicType === "parabola") {
      // Draw Directrix Line x = directrix
      const dirCanvasX = originX + parabolaDirectrix * unitScale;
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(dirCanvasX, 10);
      ctx.lineTo(dirCanvasX, displayH - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f43f5e";
      ctx.fillText(`নিয়ামক (x = ${parabolaDirectrix})`, dirCanvasX - 45, 20);

      // Draw Focus Point S(h+a, k)
      const focusCanvasX = originX + parabolaFocus.x * unitScale;
      const focusCanvasY = originY - parabolaFocus.y * unitScale;
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(focusCanvasX, focusCanvasY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`উপকেন্দ্র S(${parabolaFocus.x}, ${parabolaFocus.y})`, focusCanvasX + 8, focusCanvasY - 4);

      // Draw Parabola Curve (y - k)^2 = 4a(x - h) => x = h + (y-k)^2 / (4a)
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 3;
      ctx.beginPath();

      const yMin = -displayH / 2 / unitScale;
      const yMax = displayH / 2 / unitScale;
      let first = true;

      for (let y = yMin; y <= yMax; y += 0.05) {
        const x = offsetX + Math.pow(y - offsetY, 2) / (4 * paramA);
        const cx = originX + x * unitScale;
        const cy = originY - y * unitScale;

        if (cx >= 0 && cx <= displayW && cy >= 0 && cy <= displayH) {
          if (first) {
            ctx.moveTo(cx, cy);
            first = false;
          } else {
            ctx.lineTo(cx, cy);
          }
        }
      }
      ctx.stroke();
    } else if (conicType === "ellipse") {
      // Draw Foci S1(-c, 0), S2(c, 0)
      const c = ellipseFocusDist;
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(originX - c * unitScale, originY, 4, 0, Math.PI * 2);
      ctx.arc(originX + c * unitScale, originY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("S₁(-ae, 0)", originX - c * unitScale - 25, originY - 8);
      ctx.fillText("S₂(ae, 0)", originX + c * unitScale - 10, originY - 8);

      // Draw Ellipse Curve x^2/a^2 + y^2/b^2 = 1
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(originX, originY, ellipseA * unitScale, ellipseB * unitScale, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (conicType === "hyperbola") {
      // Draw Foci
      const c = hyperFocusDist;
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(originX - c * unitScale, originY, 4, 0, Math.PI * 2);
      ctx.arc(originX + c * unitScale, originY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("S₁(-ae, 0)", originX - c * unitScale - 25, originY - 8);
      ctx.fillText("S₂(ae, 0)", originX + c * unitScale - 10, originY - 8);

      // Draw Hyperbola Right Branch (x = a sec t, y = b tan t)
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;

      // Right Branch
      ctx.beginPath();
      for (let t = -1.3; t <= 1.3; t += 0.02) {
        const x = ellipseA / Math.cos(t);
        const y = ellipseB * Math.tan(t);
        const cx = originX + x * unitScale;
        const cy = originY - y * unitScale;
        if (t === -1.3) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // Left Branch
      ctx.beginPath();
      for (let t = -1.3; t <= 1.3; t += 0.02) {
        const x = -ellipseA / Math.cos(t);
        const y = ellipseB * Math.tan(t);
        const cx = originX + x * unitScale;
        const cy = originY - y * unitScale;
        if (t === -1.3) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [conicType, paramA, offsetX, offsetY, ellipseA, ellipseB, parabolaFocus, parabolaDirectrix, ellipseFocusDist, hyperFocusDist]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-purple-500/10 via-card to-cyan-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sigma className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>কনিক্স ও ক্যালকুলাস গ্রাফার ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    উচ্চতর গণিত ২য় পত্র: ৬ষ্ঠ অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  পরাবৃত্ত, উপবৃত্ত ও অধিবৃত্তের উপকেন্দ্র, নিয়ামক ও উপকেন্দ্রিক লম্বের লাইভ জিওমেট্রিক ট্র্যাকিং
                </p>
              </div>
            </div>

            {/* Conic Selector */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { id: "parabola", label: "পরাবৃত্ত (Parabola)" },
                { id: "ellipse", label: "উপবৃত্ত (Ellipse)" },
                { id: "hyperbola", label: "অধিবৃত্ত (Hyperbola)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setConicType(tab.id as ConicType);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    conicType === tab.id
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

      {/* Main Grapher Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <Card className="border shadow-xs overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-2xs font-mono text-slate-400">
                CARTESIAN GRAPH ENGINE [2D GRID]
              </span>
              <Badge variant="outline" className="text-3xs text-purple-400 border-purple-500/40 font-mono">
                {conicType === "parabola" && `(y - ${offsetY})² = 4(${paramA})(x - ${offsetX})`}
                {conicType === "ellipse" && `x²/${ellipseA * ellipseA} + y²/${ellipseB * ellipseB} = 1`}
                {conicType === "hyperbola" && `x²/${ellipseA * ellipseA} - y²/${ellipseB * ellipseB} = 1`}
              </Badge>
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={420}
              className="w-full h-auto block aspect-[750/420]"
            />
          </Card>
        </div>

        {/* Telemetry & Formula Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span>কনিক্স প্যারামিটার কন্ট্রোল</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              {conicType === "parabola" && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>প্যারামিটার (a):</span>
                      <span className="font-mono text-primary">{paramA}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={0.5}
                      value={paramA}
                      onChange={(e) => setParamA(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>শীর্ষবিন্দু X (h):</span>
                      <span className="font-mono text-primary">{offsetX}</span>
                    </div>
                    <input
                      type="range"
                      min={-4}
                      max={4}
                      value={offsetX}
                      onChange={(e) => setOffsetX(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Parabola Math Telemetry */}
                  <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">উপকেন্দ্র (Focus S):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">({parabolaFocus.x}, {parabolaFocus.y})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">নিয়ামক সমীকরণ:</span>
                      <span className="font-bold text-rose-500">x = {parabolaDirectrix}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">উপকেন্দ্রিক লম্ব (4a):</span>
                      <span className="font-bold text-primary">{latusRectum}</span>
                    </div>
                  </div>
                </>
              )}

              {(conicType === "ellipse" || conicType === "hyperbola") && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>অর্ধ-মুখ্য অক্ষ (a):</span>
                      <span className="font-mono text-primary">{ellipseA}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={7}
                      value={ellipseA}
                      onChange={(e) => setEllipseA(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>অর্ধ-গৌণ অক্ষ (b):</span>
                      <span className="font-mono text-primary">{ellipseB}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={ellipseB}
                      onChange={(e) => setEllipseB(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Ellipse / Hyperbola Math Telemetry */}
                  <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">উৎকেন্দ্রিকতা (e):</span>
                      <span className="font-bold text-primary">
                        {(conicType === "ellipse" ? ellipseEccentricity : hyperEccentricity).toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">উপকেন্দ্রদ্বয় (±ae, 0):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        (±{(conicType === "ellipse" ? ellipseFocusDist : hyperFocusDist).toFixed(2)}, 0)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">উপকেন্দ্রিক লম্ব (2b²/a):</span>
                      <span className="font-bold text-foreground">
                        {((2 * ellipseB * ellipseB) / ellipseA).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
