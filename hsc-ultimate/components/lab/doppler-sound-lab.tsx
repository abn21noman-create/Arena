"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Sliders,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface Wavefront {
  x: number;
  y: number;
  r: number;
}

export function DopplerSoundLab() {
  const [sourceSpeed, setSourceSpeed] = useState<number>(30); // m/s (vs sound speed v = 340 m/s)
  const [sourceFreq, setSourceFreq] = useState<number>(500); // Hz
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourcePosRef = useRef<number>(100);
  const wavefrontsRef = useRef<Wavefront[]>([]);
  const animRef = useRef<number | null>(null);
  const lastEmitTime = useRef<number>(0);

  const soundSpeed = 340; // m/s
  // Apparent frequencies:
  // Approaching observer (right side): f_app = f * v / (v - v_s)
  const fApproaching = (sourceFreq * soundSpeed) / Math.max(10, soundSpeed - sourceSpeed);
  // Receding observer (left side): f_rec = f * v / (v + v_s)
  const fReceding = (sourceFreq * soundSpeed) / (soundSpeed + sourceSpeed);

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

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        // Move source to right
        const visualSpeed = sourceSpeed * 2.2;
        sourcePosRef.current += visualSpeed * dt;
        if (sourcePosRef.current > width - 80) {
          sourcePosRef.current = 80;
          wavefrontsRef.current = [];
        }

        // Emit new wave every 0.1s
        if (now - lastEmitTime.current > 100) {
          wavefrontsRef.current.push({
            x: sourcePosRef.current,
            y: height / 2,
            r: 0,
          });
          lastEmitTime.current = now;
        }

        // Expand existing wavefronts at sound speed
        wavefrontsRef.current.forEach((wf) => {
          wf.r += soundSpeed * 0.5 * dt;
        });

        // Filter out wavefronts beyond screen
        wavefrontsRef.current = wavefrontsRef.current.filter((wf) => wf.r < 450);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;

      // Draw wavefront circles
      wavefrontsRef.current.forEach((wf) => {
        const alpha = Math.max(0.1, 1 - wf.r / 400);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(wf.x, wf.y, wf.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw Stationary Observers
      // Left Observer (Receding)
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(40, centerY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("শ্রোতা A (দূরে)", 20, centerY + 22);

      // Right Observer (Approaching)
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(width - 40, centerY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.fillText("শ্রোতা B (নিকটে)", width - 75, centerY + 22);

      // Draw Moving Sound Source
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(sourcePosRef.current, centerY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(`উৎস (${sourceSpeed} m/s →)`, sourcePosRef.current - 30, centerY - 16);

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [sourceSpeed, sourceFreq, isPlaying, soundSpeed]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-sky-500/10 via-card to-blue-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Volume2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>ডপলার ক্রিয়া ও শব্দ তরঙ্গ সিমুলেটর</span>
                  <Badge variant="secondary" className="text-xs">
                    পদার্থবিজ্ঞান ১ম পত্র: ৯ম অধ্যায়
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  উৎস বা শ্রোতার আপেক্ষিক গতির কারণে আপাত কম্পাঙ্কের বৃদ্ধি ($f&apos; > f$) ও হ্রাস ($f&apos; &lt; f$) পর্যবেক্ষণ
                </p>
              </div>
            </div>

            {/* Controls */}
            <Button
              size="sm"
              variant="outline"
              className="gap-2 font-bold"
              onClick={() => {
                sfx.play("click");
                setIsPlaying(!isPlaying);
              }}
            >
              <Play className="h-4 w-4" />
              <span>{isPlaying ? "বিরতি" : "অ্যানিমেশন শুরু"}</span>
            </Button>
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
                DOPPLER WAVEFRONT COMPRESSION SIMULATOR
              </span>
              <Badge className="bg-sky-600 text-white font-mono text-3xs font-bold">
                শব্দের বেগ v = 340 m/s
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
              <Sliders className="h-4 w-4 text-sky-500" />
              <span>উৎস গতি ও আপাত কম্পাঙ্ক হিসাব</span>
            </CardTitle>

            <div className="space-y-3 text-xs font-medium">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>শব্দ উৎসের বেগ (vₛ):</span>
                  <span className="font-mono text-primary">{sourceSpeed} m/s ({Math.round(sourceSpeed * 3.6)} km/h)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={sourceSpeed}
                  onChange={(e) => setSourceSpeed(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>উৎসের প্রকৃত কম্পাঙ্ক (f):</span>
                  <span className="font-mono text-primary">{sourceFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={1000}
                  step={50}
                  value={sourceFreq}
                  onChange={(e) => setSourceFreq(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Apparent Freq outputs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                  <div className="text-3xs text-muted-foreground uppercase font-bold">শ্রোতা B (নিকটবর্তী)</div>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{Math.round(fApproaching)} Hz</div>
                  <div className="text-3xs text-emerald-700 dark:text-emerald-300 font-sans mt-0.5">তীক্ষ্ণ শব্দ (f&apos; &gt; f)</div>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5">
                  <div className="text-3xs text-muted-foreground uppercase font-bold">শ্রোতা A (দূরবর্তী)</div>
                  <div className="text-base font-black text-rose-600 dark:text-rose-400">{Math.round(fReceding)} Hz</div>
                  <div className="text-3xs text-rose-700 dark:text-rose-300 font-sans mt-0.5">মোটা শব্দ (f&apos; &lt; f)</div>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3 text-2xs space-y-1">
                <div className="font-bold text-foreground">ডপলার সূত্রাবলী:</div>
                <div>• নিকটবর্তী হলে: $f&apos; = f \\left(\\frac{v}{v - v_s}\\right)$</div>
                <div>• দূরবর্তী হলে: $f&apos; = f \\left(\\frac{v}{v + v_s}\\right)$</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
