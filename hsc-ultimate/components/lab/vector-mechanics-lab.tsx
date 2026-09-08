"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function VectorMechanicsLab() {
  const [mode, setMode] = useState<"incline" | "river">("incline");

  // Incline parameters
  const [angleDeg, setAngleDeg] = useState<number>(30);
  const [massKg, setMassKg] = useState<number>(5);
  const [mu, setMu] = useState<number>(0.2); // Friction coef

  // River parameters
  const [riverWidthM, setRiverWidthM] = useState<number>(500);
  const [riverSpeed, setRiverSpeed] = useState<number>(3); // m/s
  const [boatSpeed, setBoatSpeed] = useState<number>(5); // m/s
  const [boatAngleDeg, setBoatAngleDeg] = useState<number>(120);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Incline Calculations
  const g = 9.8;
  const angleRad = (angleDeg * Math.PI) / 180;
  const mg = massKg * g;
  const mgParallel = mg * Math.sin(angleRad);
  const mgPerp = mg * Math.cos(angleRad);
  const maxFriction = mu * mgPerp;
  const netForce = Math.max(0, mgParallel - maxFriction);
  const accel = netForce / massKg;

  // River Calculations
  const boatAngleRad = (boatAngleDeg * Math.PI) / 180;
  const vx = riverSpeed + boatSpeed * Math.cos(boatAngleRad);
  const vy = boatSpeed * Math.sin(boatAngleRad);
  const crossingTimeSec = vy > 0 ? riverWidthM / vy : Infinity;
  const driftM = vx * (crossingTimeSec === Infinity ? 0 : crossingTimeSec);

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

    if (mode === "incline") {
      // Draw Inclined Plane
      const originX = 80;
      const originY = 300;
      const length = 450;
      const peakX = originX + length * Math.cos(angleRad);
      const peakY = originY - length * Math.sin(angleRad);

      // Incline wedge
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(peakX, originY);
      ctx.lineTo(peakX, peakY);
      ctx.closePath();
      ctx.fill();

      // Incline surface line
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(peakX, peakY);
      ctx.stroke();

      // Block on incline (midway)
      const blockDist = length * 0.55;
      const blockCenterX = originX + blockDist * Math.cos(angleRad);
      const blockCenterY = originY - blockDist * Math.sin(angleRad);

      ctx.save();
      ctx.translate(blockCenterX, blockCenterY);
      ctx.rotate(-angleRad);

      // Block
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-20, -30, 40, 30);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-20, -30, 40, 30);

      // mg parallel vector (downwards)
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(-60, -15);
      ctx.stroke();

      // Friction vector (upwards)
      ctx.strokeStyle = "#10b981";
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(35, -15);
      ctx.stroke();

      ctx.restore();

      // Angle indicator
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(peakX, originY, 40, Math.PI, Math.PI + angleRad);
      ctx.stroke();
    } else {
      // Draw River Simulation
      // Banks
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(50, 40, 550, 20); // Top bank
      ctx.fillRect(50, 300, 550, 20); // Bottom bank

      // Water
      ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
      ctx.fillRect(50, 60, 550, 240);

      // River flow arrows
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      for (let y = 100; y <= 260; y += 50) {
        ctx.beginPath();
        ctx.moveTo(100, y);
        ctx.lineTo(500, y);
        ctx.stroke();
      }

      // Boat starting position
      const startX = 200;
      const startY = 300;

      // Draw boat
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(startX, startY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Boat direction vector
      const boatVecLen = 70;
      const boatEndX = startX + boatVecLen * Math.cos(boatAngleRad);
      const boatEndY = startY - boatVecLen * Math.sin(boatAngleRad);

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(boatEndX, boatEndY);
      ctx.stroke();

      // Resultant Path vector
      if (crossingTimeSec !== Infinity && vy > 0) {
        ctx.strokeStyle = "#10b981";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (vx / vy) * 240, 60);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, [mode, angleDeg, massKg, mu, riverWidthM, riverSpeed, boatSpeed, boatAngleDeg, angleRad, boatAngleRad, crossingTimeSec, vx, vy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-sky-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ইঞ্জিনিয়ারিং ভেক্টর মেকানিক্স ও FBD ল্যাব</span>
                  <Badge variant="secondary" className="text-xs">
                    Engineering Mechanics V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  আনত তল ও ঘর্ষণ বলবিদ্যা এবং নদী-নৌকা ন্যূনতম দূরত্ব/সময় পারাপারের সিমুলেশন
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setMode("incline");
                }}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition",
                  mode === "incline" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                আনত তল ও ঘর্ষণ (Incline FBD)
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setMode("river");
                }}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition",
                  mode === "river" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                নদী-নৌকা পারাপার (River Boat)
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
                VECTOR MECHANICS ENGINE [2D FBD SIMULATION]
              </span>
              <Badge className="bg-sky-600 text-white font-mono text-3xs font-bold">
                {mode === "incline" ? `ত্বরণ a = ${accel.toFixed(2)} m/s²` : `পারাপার সময় = ${crossingTimeSec.toFixed(1)}s`}
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

        {/* Telemetry & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-sky-500" />
              <span>প্যারামিটার কন্ট্রোল ও গাণিতিক ফল</span>
            </CardTitle>

            {mode === "incline" ? (
              <div className="space-y-3 text-xs font-medium">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>আনত কোণ (θ):</span>
                    <span className="font-mono text-primary">{angleDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={75}
                    value={angleDeg}
                    onChange={(e) => setAngleDeg(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>ঘর্ষণ গুণাঙ্ক (μ):</span>
                    <span className="font-mono text-primary">{mu.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.05}
                    value={mu}
                    onChange={(e) => setMu(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">অভিলম্ব প্রতিক্রিয়া (N = mg cosθ):</span>
                    <span className="font-bold text-foreground">{mgPerp.toFixed(1)} N</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">সর্বোচ্চ ঘর্ষণ বল (f_k = μN):</span>
                    <span className="font-bold text-foreground">{maxFriction.toFixed(1)} N</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-primary font-bold">নামার কার্যকরী ত্বরণ a:</span>
                    <span className="font-black text-primary text-xs">{accel.toFixed(2)} m/s²</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs font-medium">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>নৌকার কোণ (α):</span>
                    <span className="font-mono text-primary">{boatAngleDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={150}
                    value={boatAngleDeg}
                    onChange={(e) => setBoatAngleDeg(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5 font-mono text-2xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">পারাপারে প্রয়োজনীয় সময় (t = d / v sinα):</span>
                    <span className="font-bold text-primary">{crossingTimeSec.toFixed(1)} সেকেন্ড</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">অনুভূমিক সরণ / ড্রিফট (x = v_x × t):</span>
                    <span className="font-bold text-foreground">{driftM.toFixed(1)} মিটার</span>
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
