"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Scan, Sparkles, CheckCircle2, AlertCircle, Upload, RotateCcw, Trophy, FileCheck } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

export function CameraOMRScanner() {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">("idle");
  const [selectedPreset, setSelectedPreset] = useState<"board-physics" | "board-math">("board-physics");

  const startScan = () => {
    sfx.play("start");
    setScanState("scanning");
    setTimeout(() => {
      setScanState("completed");
      sfx.play("reward_claim");
      triggerConfetti();
    }, 1800);
  };

  const handleReset = () => {
    sfx.play("click");
    setScanState("idle");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-500/10 via-card to-emerald-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>স্মার্ট ক্যামেরা OMR স্ক্যানার ও মূল্যায়ন</span>
                  <Badge variant="secondary" className="text-xs">
                    AI Vision Grader
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  প্রিন্ট করা OMR শিটের ছবি তুলুন বা আপলোড করুন — ১ সেকেন্ডে স্বয়ংক্রিয়ভাবে খাতা চেক হয়ে যাবে
                </p>
              </div>
            </div>

            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              <button
                type="button"
                onClick={() => setSelectedPreset("board-physics")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  selectedPreset === "board-physics"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                পদার্থবিজ্ঞান ১ম পত্র (২৫ প্রশ্ন)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPreset("board-math")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  selectedPreset === "board-math"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                উচ্চতর গণিত ১ম পত্র (২৫ প্রশ্ন)
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Scanner Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border shadow-xs overflow-hidden bg-slate-950 text-slate-100 relative min-h-[360px] flex flex-col justify-between">
            {/* Viewport Top Status */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 z-10">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-2xs font-mono text-slate-300">
                  {scanState === "scanning" ? "ALIGNING CORNER ANCHORS..." : "CAMERA SENSOR READY"}
                </span>
              </div>
              <Badge variant="outline" className="text-3xs border-slate-700 text-slate-300">
                1080p AI Vision
              </Badge>
            </div>

            {/* Camera Simulated Viewfinder */}
            <div className="p-8 flex flex-col items-center justify-center my-auto space-y-4 relative">
              {/* Targeting Reticle Corners */}
              <div className="w-64 h-64 border-2 border-dashed border-emerald-500/50 rounded-2xl relative flex flex-col items-center justify-center bg-slate-900/40">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                {scanState === "scanning" ? (
                  <div className="space-y-3 text-center">
                    <Scan className="h-10 w-10 text-emerald-400 animate-pulse mx-auto" />
                    <div className="text-xs font-mono font-bold text-emerald-300">
                      বৃত্তের অপটিক্যাল ডেনসিটি স্ক্যান হচ্ছে...
                    </div>
                  </div>
                ) : scanState === "completed" ? (
                  <div className="space-y-2 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                    <div className="text-xs font-mono font-bold text-emerald-300">
                      স্ক্যানিং সম্পন্ন! রেজাল্ট প্রস্তুত।
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-center p-4">
                    <FileCheck className="h-10 w-10 text-slate-500 mx-auto" />
                    <div className="text-xs text-slate-400">
                      OMR শিটটি ফ্রেমের ভেতরে রাখুন এবং স্ক্যান বাটনে চাপুন
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-900/60 z-10">
              {scanState === "completed" ? (
                <Button onClick={handleReset} variant="outline" size="sm" className="gap-1 text-xs border-slate-700 text-slate-200">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>নতুন OMR স্ক্যান করুন</span>
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={startScan}
                    disabled={scanState === "scanning"}
                    className="flex-1 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Scan className="h-4 w-4" />
                    <span>{scanState === "scanning" ? "প্রসেসিং হচ্ছে..." : "OMR স্ক্যান ও মার্কিং শুরু করুন"}</span>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Real-Time Scan Results & Error Diagnostics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>AI গ্রেডিং ও মার্কশিট</span>
                {scanState === "completed" && (
                  <Badge className="bg-emerald-600 text-white font-mono text-xs">
                    ২৩.৭৫ / ২৫.০০
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 pt-2 space-y-4">
              {scanState === "completed" ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border bg-emerald-500/10 p-2.5">
                      <div className="text-2xs text-muted-foreground">সঠিক উত্তর</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">২৪ টি</div>
                    </div>
                    <div className="rounded-xl border bg-rose-500/10 p-2.5">
                      <div className="text-2xs text-muted-foreground">ভুল (-০.২৫)</div>
                      <div className="text-lg font-bold text-rose-600 dark:text-rose-400">১ টি</div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-2.5">
                      <div className="text-2xs text-muted-foreground">অনুপস্থিত</div>
                      <div className="text-lg font-bold text-muted-foreground">০ টি</div>
                    </div>
                  </div>

                  {/* AI Diagnostic Warnings */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1.5">
                    <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-2xs">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>ভুল দাগানো সতর্কতা (Optical Flag):</span>
                    </div>
                    <p className="text-2xs text-foreground leading-relaxed font-medium">
                      প্রশ্ন ১৮: সঠিক উত্তর (গ) হলেও অপশনে (খ) ভরাট করা হয়েছিল।
                    </p>
                  </div>

                  <div className="rounded-xl border bg-card p-3 space-y-1.5">
                    <div className="text-2xs font-bold text-primary">স্পিড ও একিউরেসি মেট্রিক্স:</div>
                    <div className="flex justify-between text-muted-foreground text-2xs">
                      <span>নির্ভুলতার হার:</span>
                      <span className="font-bold font-mono text-foreground">৯৬.০%</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-2xs">
                      <span>বোর্ড স্ট্যান্ডিং প্রেডিকশন:</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">Top 1%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    আমাদের স্বয়ংক্রিয় OMR ভিশন সিস্টেম পেনসিল বা কলমের কালির ঘনত্ব (Optical Ink Density) এবং চার কোণার মার্কার ট্র্যাক করে নির্ভুলভাবে উত্তর মিলিয়ে দেয়।
                  </p>
                  <div className="rounded-xl border bg-muted/30 p-3 text-2xs space-y-1.5">
                    <div className="font-bold text-foreground">ব্যবহারের নিয়ম:</div>
                    <div>১. ওএমআর শিটটি সমতল স্থানে রাখুন।</div>
                    <div>২. পর্যাপ্ত আলোতে স্ক্যান বাটনে চাপুন।</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
