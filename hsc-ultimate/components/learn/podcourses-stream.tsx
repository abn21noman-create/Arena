"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookmarkPlus,
  Volume2,
  FastForward,
  Rewind,
  BookOpen,
} from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

interface TranscriptLine {
  id: number;
  timeSec: number;
  speaker: string;
  text: string;
  hasFormula?: string;
}

interface PodCourse {
  id: string;
  title: string;
  subject: string;
  duration: string;
  totalSec: number;
  description: string;
  transcripts: TranscriptLine[];
}

const PODCOURSES: PodCourse[] = [
  {
    id: "pod-phys-1",
    title: "মহাকর্ষীয় ক্ষেত্র ও মহাকর্ষীয় প্রাবল্যের গভীর পর্যালোচনা",
    subject: "পদার্থবিজ্ঞান ১ম পত্র",
    duration: "৩:২০ মিনিট",
    totalSec: 200,
    description: "নিউটনের মহাকর্ষ সূত্র, মহাকর্ষীয় বিভব এবং ভূ-পৃষ্ঠ থেকে গভীরতায় g-এর পরিবর্তনের অডিও লেকচার।",
    transcripts: [
      { id: 1, timeSec: 0, speaker: "লেকচারার", text: "স্বাগতম সবাইকে। আজকে আমরা আলোচনা করব মহাকর্ষ ও অভিকর্ষ অধ্যায়ের অন্যতম গুরুত্বপূর্ণ টপিক—মহাকর্ষীয় ক্ষেত্র ও প্রাবল্য।" },
      { id: 2, timeSec: 15, speaker: "লেকচারার", text: "একটি ভর মহাবিশ্বে থাকলে তার চারপাশে একটি অঞ্চল জুড়ে তার মহাকর্ষীয় প্রভাব বিস্তৃত থাকে, যাকে মহাকর্ষ ক্ষেত্র বলে।", hasFormula: "$F = G \\frac{m_1 m_2}{r^2}$" },
      { id: 3, timeSec: 35, speaker: "লেকচারার", text: "মহাকর্ষীয় ক্ষেত্রে কোনো বিন্দুতে একক ভরের একটি বস্তু স্থাপন করলে সেটি যে বল অনুভব করে, তাকে ওই বিন্দুর মহাকর্ষীয় প্রাবল্য E বলে।", hasFormula: "$E = \\frac{GM}{r^2}$" },
      { id: 4, timeSec: 60, speaker: "লেকচারার", text: "মনে রাখবে, পৃথিবীর কেন্দ্রের দিকে মহাকর্ষীয় বিভবের মান ঋণাত্মক এবং অসীমে বিভবের মান সর্বোচ্চ শূন্য।" },
      { id: 5, timeSec: 90, speaker: "লেকচারার", text: "ভূ-পৃষ্ঠ থেকে h উচ্চতায় অভিকর্ষজ ত্বরণ g' = g(1 - 2h/R), যা ভর্তি পরীক্ষায় প্রচুর আসে।", hasFormula: "$g' = g\\left(1 - \\frac{2h}{R}\\right)$" },
    ],
  },
  {
    id: "pod-chem-1",
    title: "ইলেক্ট্রোফিলিক অ্যারোমেটিক প্রতিস্থাপন ও বেনজিন বলয়ের সক্রিয়তা",
    subject: "রসায়ন ২য় পত্র",
    duration: "২:৪৫ মিনিট",
    totalSec: 165,
    description: "বেনজিনের নাইট্রেশন, হ্যালোজিনেশন এবং অর্থো-প্যারা ও মেটা নির্দেশক মূলকের তুলনামূলক বিশ্লেষণ।",
    transcripts: [
      { id: 1, timeSec: 0, speaker: "লেকচারার", text: "জৈব রসায়নের বেনজিন বলয়ে পাই (π) ইলেকট্রনের ডিলোকালাইজেশনের কারণে এটি তীব্রভাবে ইলেক্ট্রোফাইলকে আকর্ষণ করে।" },
      { id: 2, timeSec: 20, speaker: "লেকচারার", text: "বেনজিনের নাইট্রেশনে গাঢ় HNO3 এবং গাঢ় H2SO4 এর মিশ্রণে তৈরি হয় শক্তিশালী ইলেক্ট্রোফাইল NO2+ আয়ন।", hasFormula: "$\\text{HNO}_3 + 2\\text{H}_2\\text{SO}_4 \\rightarrow \\text{NO}_2^+ + \\text{H}_3\\text{O}^+ + 2\\text{HSO}_4^-$" },
      { id: 3, timeSec: 45, speaker: "লেকচারার", text: "-OH ও -CH3 মূলকগুলো বেনজিন বলয়ে ইলেকট্রন ঘনত্ব বৃদ্ধি করে, তাই এরা অর্থো-প্যারা নির্দেশক।" },
    ],
  },
];

export function PodcoursesStream() {
  const [selectedPod, setSelectedPod] = useState<PodCourse>(PODCOURSES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((t) => {
          if (t >= selectedPod.totalSec) {
            setIsPlaying(false);
            return 0;
          }
          return t + 1;
        });
      }, 1000 / playbackRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackRate, selectedPod.totalSec]);

  const handlePlayToggle = () => {
    sfx.play("click");
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (sec: number) => {
    sfx.play("pop");
    setCurrentTimeSec(sec);
  };

  // Find active transcript index
  const activeTranscriptIdx = selectedPod.transcripts.reduce(
    (acc, t, idx) => (currentTimeSec >= t.timeSec ? idx : acc),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-purple-500/10 via-card to-pink-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>অডিও পডকোর্স ও লাইভ সিঙ্ক ট্রান্সক্রিপ্ট</span>
                  <Badge variant="secondary" className="text-xs">
                    Commute Study Mode V3.0
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  যাতায়াত ও বিশ্রামের সময় হেডফোনে শুনুন এবং স্ক্রিনে লাইভ সূত্রের হাইলাইট দেখুন
                </p>
              </div>
            </div>

            {/* Course Selector */}
            <div className="flex gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
              {PODCOURSES.map((pod) => (
                <button
                  key={pod.id}
                  type="button"
                  onClick={() => {
                    sfx.play("click");
                    setSelectedPod(pod);
                    setCurrentTimeSec(0);
                    setIsPlaying(false);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition",
                    selectedPod.id === pod.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  {pod.subject}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audio Player Controller (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border shadow-2xs p-5 space-y-4 bg-card">
            <div className="space-y-1">
              <Badge variant="outline" className="text-3xs font-semibold">
                {selectedPod.subject}
              </Badge>
              <h3 className="font-bold text-base text-foreground leading-snug">
                {selectedPod.title}
              </h3>
              <p className="text-2xs text-muted-foreground">
                {selectedPod.description}
              </p>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-2xs font-mono font-bold text-muted-foreground">
                <span>{Math.floor(currentTimeSec / 60)}:{String(currentTimeSec % 60).padStart(2, "0")}</span>
                <span>{selectedPod.duration}</span>
              </div>
              <input
                type="range"
                min={0}
                max={selectedPod.totalSec}
                value={currentTimeSec}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 py-2">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-9 w-9"
                onClick={() => handleSeek(Math.max(0, currentTimeSec - 10))}
              >
                <Rewind className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-md"
                onClick={handlePlayToggle}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-9 w-9"
                onClick={() => handleSeek(Math.min(selectedPod.totalSec, currentTimeSec + 10))}
              >
                <FastForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center justify-between border-t pt-3 text-xs">
              <span className="font-bold text-muted-foreground">প্লেব্যাক স্পিড:</span>
              <div className="flex gap-1">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      sfx.play("pop");
                      setPlaybackRate(rate);
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-2xs font-mono font-bold transition",
                      playbackRate === rate ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Live Synchronized Transcript Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="border shadow-2xs p-5 space-y-3 bg-card">
            <CardTitle className="text-sm font-bold flex items-center gap-2 border-b pb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>ইন্টারঅ্যাকটিভ লাইভ ট্রান্সক্রিপ্ট (ট্যাপ করে শুনুন)</span>
            </CardTitle>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {selectedPod.transcripts.map((t, idx) => {
                const isActive = idx === activeTranscriptIdx;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSeek(t.timeSec)}
                    className={cn(
                      "p-3 rounded-xl border text-xs leading-relaxed transition cursor-pointer space-y-1.5",
                      isActive
                        ? "bg-purple-500/10 border-purple-500/50 shadow-xs ring-1 ring-purple-500/30"
                        : "bg-muted/10 hover:bg-muted/20 border-border/50 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between text-2xs font-mono">
                      <Badge variant="outline" className={cn("text-3xs font-bold", isActive && "bg-purple-600 text-white")}>
                        {Math.floor(t.timeSec / 60)}:{String(t.timeSec % 60).padStart(2, "0")}
                      </Badge>
                      <span className="font-bold text-foreground">{t.speaker}</span>
                    </div>

                    <p className={cn("font-medium", isActive && "text-foreground font-semibold")}>
                      {t.text}
                    </p>

                    {t.hasFormula && (
                      <div className="rounded-lg bg-card p-2 text-2xs font-mono font-bold text-primary border inline-block">
                        {t.hasFormula}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
