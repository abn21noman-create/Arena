"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Sparkles, Orbit, Compass, Eye, Zap, Flame, Compass as CompassIcon } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

type SimType = "projectile" | "pendulum" | "optics";

export function PhysicsSimulatorLab() {
  const [simType, setSimType] = useState<SimType>("projectile");

  // Projectile states
  const [velocity, setVelocity] = useState<number>(45); // m/s
  const [angle, setAngle] = useState<number>(45); // degrees
  const [gravity, setGravity] = useState<number>(9.8); // m/s^2

  // Pendulum states
  const [length, setLength] = useState<number>(1.5); // meters
  const [initialAngle, setInitialAngle] = useState<number>(30); // degrees
  const [mass, setMass] = useState<number>(2); // kg

  // Lens states
  const [focalLength, setFocalLength] = useState<number>(100); // px
  const [objectDist, setObjectDist] = useState<number>(220); // px
  const [objectHeight, setObjectHeight] = useState<number>(50); // px

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Formulas for Projectile
  const rad = (angle * Math.PI) / 180;
  const maxH = (velocity * velocity * Math.sin(rad) * Math.sin(rad)) / (2 * gravity);
  const rangeR = (velocity * velocity * Math.sin(2 * rad)) / gravity;
  const timeT = (2 * velocity * Math.sin(rad)) / gravity;

  // Formulas for Pendulum
  const periodT = 2 * Math.PI * Math.sqrt(length / gravity);

  // Formulas for Lens
  // 1/f = 1/u + 1/v => 1/v = 1/f - 1/u = (u - f)/(u*f) => v = (u*f)/(u - f)
  const imageDist = (objectDist * focalLength) / (objectDist - focalLength);
  const magnification = -imageDist / objectDist;
  const imageHeight = magnification * objectHeight;

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlayingRef.current) {
        simTimeRef.current += dt;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (simType === "projectile") {
        // Draw Ground
        const groundY = h - 50;
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, groundY);
        ctx.lineTo(w - 30, groundY);
        ctx.stroke();

        // Origin at (60, groundY)
        const originX = 60;
        const originY = groundY;

        // Draw Full Trajectory Path (Dotted Arc)
        ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();

        const scale = Math.min((w - 120) / Math.max(10, rangeR), (h - 120) / Math.max(5, maxH));
        const totalSteps = 60;
        for (let i = 0; i <= totalSteps; i++) {
          const t = (i / totalSteps) * timeT;
          const px = velocity * Math.cos(rad) * t;
          const py = velocity * Math.sin(rad) * t - 0.5 * gravity * t * t;
          const cx = originX + px * scale;
          const cy = originY - py * scale;
          if (i === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Projectile
        const currentT = simTimeRef.current % (timeT + 0.8);
        if (currentT <= timeT) {
          const px = velocity * Math.cos(rad) * currentT;
          const py = velocity * Math.sin(rad) * currentT - 0.5 * gravity * currentT * currentT;
          const curX = originX + px * scale;
          const curY = originY - py * scale;

          // Glowing Ball
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(curX, curY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw Cannon / Launch Vector
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + 35 * Math.cos(rad), originY - 35 * Math.sin(rad));
        ctx.stroke();

        // Apex marker
        const apexX = originX + (rangeR / 2) * scale;
        const apexY = originY - maxH * scale;
        ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
        ctx.beginPath();
        ctx.arc(apexX, apexY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`H = ${maxH.toFixed(1)}m`, apexX - 25, apexY - 10);

        // Range marker
        const endX = originX + rangeR * scale;
        ctx.fillStyle = "#6366f1";
        ctx.fillText(`R = ${rangeR.toFixed(1)}m`, endX - 20, originY + 25);
      } else if (simType === "pendulum") {
        // Origin Pivot Top
        const pivotX = w / 2;
        const pivotY = 50;

        // Angle theta(t) = theta0 * cos(omega * t)
        const omega = Math.sqrt(gravity / length);
        const thetaNow = ((initialAngle * Math.PI) / 180) * Math.cos(omega * simTimeRef.current);

        const pixelLength = length * 90;
        const bobX = pivotX + pixelLength * Math.sin(thetaNow);
        const bobY = pivotY + pixelLength * Math.cos(thetaNow);

        // Draw Pivot Base
        ctx.fillStyle = "#64748b";
        ctx.fillRect(pivotX - 30, pivotY - 6, 60, 6);

        // Draw Wire
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Draw Bob
        const radius = Math.max(10, Math.min(22, 8 + mass * 1.5));
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.arc(bobX, bobY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Real-time Energy Monitoring Bars
        // Max Height = L * (1 - cos(theta0))
        const h0 = length * (1 - Math.cos((initialAngle * Math.PI) / 180));
        const hNow = length * (1 - Math.cos(thetaNow));
        const ep = mass * gravity * hNow;
        const totalE = mass * gravity * h0;
        const ek = Math.max(0, totalE - ep);

        // Energy Display
        const barW = 120;
        const barH = 10;
        const barX = 40;
        const barY = h - 60;

        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`গতিশক্তি (Ek): ${ek.toFixed(1)} J`, barX, barY - 6);
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(barX, barY, totalE > 0 ? (ek / totalE) * barW : 0, barH);

        ctx.fillStyle = "#10b981";
        ctx.fillText(`বিভবশক্তি (Ep): ${ep.toFixed(1)} J`, barX + 160, barY - 6);
        ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
        ctx.fillRect(barX + 160, barY, barW, barH);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(barX + 160, barY, totalE > 0 ? (ep / totalE) * barW : 0, barH);
      } else if (simType === "optics") {
        // Optical Bench
        const axisY = h / 2;
        const lensX = w / 2;

        // Principal Axis
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(20, axisY);
        ctx.lineTo(w - 20, axisY);
        ctx.stroke();

        // Convex Lens Symbol
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(lensX, axisY, 8, h / 2 - 30, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Focal Points F1, F2
        const f = focalLength;
        ctx.fillStyle = "#e11d48";
        ctx.beginPath();
        ctx.arc(lensX - f, axisY, 4, 0, Math.PI * 2);
        ctx.arc(lensX + f, axisY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("F₁", lensX - f - 6, axisY + 18);
        ctx.fillText("F₂", lensX + f - 6, axisY + 18);

        // Object Arrow (at lensX - objectDist)
        const objX = lensX - objectDist;
        const objTopY = axisY - objectHeight;
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(objX, axisY);
        ctx.lineTo(objX, objTopY);
        ctx.stroke();
        // Arrow head
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.moveTo(objX - 5, objTopY + 8);
        ctx.lineTo(objX + 5, objTopY + 8);
        ctx.lineTo(objX, objTopY - 2);
        ctx.fill();

        // Image Arrow (if imageDist exists)
        if (Math.abs(objectDist - focalLength) > 5) {
          const imgX = lensX + imageDist;
          const imgTopY = axisY + imageHeight;

          ctx.strokeStyle = imageDist > 0 ? "#f59e0b" : "#ec4899";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(imgX, axisY);
          ctx.lineTo(imgX, imgTopY);
          ctx.stroke();

          // Ray 1: Parallel to axis then through F2
          ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(objX, objTopY);
          ctx.lineTo(lensX, objTopY);
          ctx.lineTo(imgX, imgTopY);
          ctx.stroke();

          // Ray 2: Directly through lens optical center
          ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
          ctx.beginPath();
          ctx.moveTo(objX, objTopY);
          ctx.lineTo(imgX, imgTopY);
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [simType, velocity, angle, gravity, length, initialAngle, mass, focalLength, objectDist, objectHeight, rad, rangeR, maxH, timeT, imageDist, imageHeight]);

  const handleReset = () => {
    sfx.play("click");
    simTimeRef.current = 0;
  };

  const handleTogglePlay = () => {
    sfx.play("click");
    const next = !isPlaying;
    isPlayingRef.current = next;
    setIsPlaying(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <Card className="border shadow-xs bg-linear-to-r from-cyan-500/10 via-card to-indigo-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Orbit className="h-6 w-6 animate-spin-slow" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ইন্টারঅ্যাক্টিভ ফিজিক্স সিমুলেটর ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    HTML5 2D Engine
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  প্রাসের ট্র্যাজেক্টরি, সরল দোলকের শক্তি সংরক্ষণ এবং লেন্সের আলোকরশ্মি চিত্র লাইভ পর্যবেক্ষণ
                </p>
              </div>
            </div>

            {/* Sim Mode Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { id: "projectile", label: "প্রাসের গতি (Projectile)" },
                { id: "pendulum", label: "সরল দোলক (Pendulum)" },
                { id: "optics", label: "জ্যামিতিক আলো (Lens)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSimType(tab.id as SimType);
                    simTimeRef.current = 0;
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                    simType === tab.id
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

      {/* Main Simulation View & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Area (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <Card className="border shadow-xs overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-2xs font-mono text-slate-400 ml-2">
                  {simType.toUpperCase()} CANVAS [60 FPS]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  onClick={handleTogglePlay}
                >
                  <Play className="h-3 w-3" />
                  <span>{isPlaying ? "পজ" : "চালু"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>রিসেট</span>
                </Button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={750}
              height={380}
              className="w-full h-auto block aspect-[750/380]"
            />
          </Card>
        </div>

        {/* Controls & Real-Time Math Metrics (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>সিমুলেশন প্যারামিটার ও নিয়ন্ত্রণ</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              {simType === "projectile" && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>আদিবেগ (v₀):</span>
                      <span className="font-mono text-primary">{velocity} m/s</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={velocity}
                      onChange={(e) => setVelocity(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>নিক্ষেপণ কোণ (θ):</span>
                      <span className="font-mono text-primary">{angle}°</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={85}
                      value={angle}
                      onChange={(e) => setAngle(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>অভিকর্ষজ ত্বরণ (g):</span>
                      <span className="font-mono text-primary">{gravity} m/s²</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      {[
                        { label: "পৃথিবী (9.8)", g: 9.8 },
                        { label: "চাঁদ (1.62)", g: 1.62 },
                        { label: "মঙ্গল (3.72)", g: 3.72 },
                      ].map((item) => (
                        <button
                          key={item.g}
                          type="button"
                          onClick={() => setGravity(item.g)}
                          className={cn(
                            "rounded-md px-2 py-1 text-2xs font-bold border transition",
                            gravity === item.g ? "bg-primary text-primary-foreground" : "bg-muted/40"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculated Outputs */}
                  <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সর্বোচ্চ উচ্চতা (H):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{maxH.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">অনুভূমিক পাল্লা (R):</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{rangeR.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">উড্ডয়ন কাল (T):</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{timeT.toFixed(2)} s</span>
                    </div>
                  </div>
                </>
              )}

              {simType === "pendulum" && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>কার্যকর দৈর্ঘ্য (L):</span>
                      <span className="font-mono text-primary">{length.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={3.0}
                      step={0.1}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>কৌণিক বিস্তার (θ₀):</span>
                      <span className="font-mono text-primary">{initialAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      value={initialAngle}
                      onChange={(e) => setInitialAngle(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Period Output */}
                  <div className="rounded-xl border bg-muted/20 p-3 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">দোলনকাল (T = 2π√(L/g)):</span>
                      <span className="font-bold text-primary">{periodT.toFixed(2)} s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">কম্পাঙ্ক (f = 1/T):</span>
                      <span className="font-bold text-foreground">{(1 / periodT).toFixed(2)} Hz</span>
                    </div>
                  </div>
                </>
              )}

              {simType === "optics" && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>ফোকাস দূরত্ব (f):</span>
                      <span className="font-mono text-primary">{focalLength} px</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={180}
                      value={focalLength}
                      onChange={(e) => setFocalLength(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>লক্ষ্যবস্তুর দূরত্ব (u):</span>
                      <span className="font-mono text-primary">{objectDist} px</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={320}
                      value={objectDist}
                      onChange={(e) => setObjectDist(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Lens Output */}
                  <div className="rounded-xl border bg-muted/20 p-3 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">প্রতিবিম্বের দূরত্ব (v):</span>
                      <span className="font-bold text-amber-500">{imageDist.toFixed(1)} px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">রৈখিক বিবর্ধন (M = -v/u):</span>
                      <span className="font-bold text-foreground">{magnification.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">প্রতিবিম্বের প্রকৃতি:</span>
                      <span className="font-bold text-emerald-500">
                        {imageDist > 0 ? "বাস্তব ও উল্টো" : "অবাস্তব ও সোজা"}
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
