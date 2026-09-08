"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Orbit, Sparkles, Play, RotateCcw, Zap, Globe } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function SatelliteOrbitLab() {
  const [altitudeKm, setAltitudeKm] = useState<number>(35930); // Geostationary default
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Earth constants: R = 6.4 * 10^6 m, M = 6 * 10^24 kg, G = 6.673 * 10^-11
  const R_earth = 6.4e6; // 6400 km in meters
  const M_earth = 5.972e24; // kg
  const G_const = 6.6743e-11; // N m^2 kg^-2

  const rMeters = R_earth + altitudeKm * 1000;
  const orbitalVelMs = Math.sqrt((G_const * M_earth) / rMeters);
  const orbitalVelKms = orbitalVelMs / 1000;

  // Period T = 2 * pi * sqrt(r^3 / GM)
  const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(rMeters, 3) / (G_const * M_earth));
  const periodHours = periodSec / 3600;

  const isGeo = Math.abs(altitudeKm - 35930) < 500;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);

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

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        // Speed scaling
        const visualOmega = (2 * Math.PI) / Math.max(3, periodHours * 0.5);
        angleRef.current += visualOmega * dt;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayW, displayH);

      const originX = displayW / 2;
      const originY = displayH / 2;

      // Draw Earth in center (R = 36px)
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(originX, originY, 36, 0, Math.PI * 2);
      ctx.fill();

      // Earth Continents styling
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(originX - 10, originY - 6, 16, 0, Math.PI * 2);
      ctx.fill();

      // Draw Orbit Ring
      const visualOrbitR = Math.min(160, 48 + (altitudeKm / 40000) * 110);
      ctx.strokeStyle = isGeo ? "rgba(245, 158, 11, 0.7)" : "rgba(100, 116, 139, 0.4)";
      ctx.lineWidth = isGeo ? 2 : 1;
      ctx.setLineDash(isGeo ? [] : [4, 4]);
      ctx.beginPath();
      ctx.arc(originX, originY, visualOrbitR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Orbiting Satellite Position
      const satX = originX + visualOrbitR * Math.cos(angleRef.current);
      const satY = originY + visualOrbitR * Math.sin(angleRef.current);

      // Draw Satellite
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(satX, satY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Satellite Solar Panels
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(satX - 14, satY - 2, 8, 4);
      ctx.fillRect(satX + 6, satY - 2, 8, 4);

      // Label
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(isGeo ? "বঙ্গবন্ধু স্যাটেলাইট-১ (GEO)" : "কৃত্রিম উপগ্রহ", satX + 10, satY - 8);

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [altitudeKm, isPlaying, isGeo, periodHours]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-amber-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>কৃত্রিম উপগ্রহের কক্ষপথ ও বেগ সিমুলেটর</span>
                  <Badge variant="secondary" className="text-xs">
                    পদার্থবিজ্ঞান ১ম পত্র: ৬ষ্ঠ অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ভূ-পৃষ্ঠ থেকে উচ্চতা (h), রৈখিক বেগ (v) এবং ভূ-স্থির উপগ্রহের আবর্তনকাল (T = 24 hrs) পর্যবেক্ষণ
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {[
                { label: "ISS (৪০০ কিমি)", h: 400 },
                { label: "GPS (২০,২০০ কিমি)", h: 20200 },
                { label: "ভূ-স্থির (৩৫,৯৩০ কিমি)", h: 35930 },
              ].map((p) => (
                <button
                  key={p.h}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setAltitudeKm(p.h);
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                    altitudeKm === p.h ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
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
        {/* Orbit Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="border shadow-xs overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-2xs font-mono text-slate-400">
                ORBITAL MECHANICS ENGINE [TOP-DOWN 2D]
              </span>
              <Badge className={isGeo ? "bg-amber-500 text-slate-950 font-bold" : "bg-blue-600 text-white"}>
                {isGeo ? "ভূ-স্থির কক্ষপথ (T = 24 hrs)" : `${periodHours.toFixed(2)} ঘণ্টা আবর্তনকাল`}
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

        {/* Altitude Slider & Mathematical Outputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>কক্ষপথের প্যারামিটার কন্ট্রোল</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>ভূ-পৃষ্ঠ থেকে উচ্চতা (h):</span>
                  <span className="font-mono text-primary">{altitudeKm.toLocaleString()} km</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={45000}
                  step={100}
                  value={altitudeKm}
                  onChange={(e) => setAltitudeKm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Physical Quantities Card */}
              <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">কক্ষপথীয় বেগ (v = √(GM/r)):</span>
                  <span className="font-bold text-primary text-sm">{orbitalVelKms.toFixed(2)} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">আবর্তনকাল (Period T):</span>
                  <span className="font-bold text-foreground">{periodHours.toFixed(2)} ঘণ্টা ({Math.round(periodSec / 60)} মিনিট)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">কেন্দ্র থেকে দূরত্ব (r = R+h):</span>
                  <span className="font-bold text-foreground">{(rMeters / 1e6).toFixed(2)} × 10⁶ m</span>
                </div>
              </div>

              {/* Board Fact */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-2xs space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400">
                  বঙ্গবন্ধু স্যাটেলাইট-১ ও HSC ফ্যাক্ট:
                </div>
                <p className="text-foreground leading-relaxed">
                  ভূ-স্থির উপগ্রহের আবর্তনকাল পৃথিবীর নিজ অক্ষের ঘূর্ণনকাল (২৪ ঘণ্টা) এর সমান হওয়ায় এটি পৃথিবী থেকে সর্বদা নির্দিষ্ট স্থানে স্থির মনে হয়।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
