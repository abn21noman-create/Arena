"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headphones, Play, Pause, Volume2, VolumeX, Sparkles, CloudRain, Waves, Coffee, Wind, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface SoundTrack {
  id: string;
  nameBn: string;
  nameEn: string;
  icon: typeof CloudRain;
  type: "rain" | "waves" | "cafe" | "binaural" | "wind";
  description: string;
}

const SOUND_TRACKS: SoundTrack[] = [
  {
    id: "rain",
    nameBn: "টিনের চালে বৃষ্টি",
    nameEn: "Rain on Tin Roof",
    icon: CloudRain,
    type: "rain",
    description: "নস্টালজিক বৃষ্টির একটানা আরামদায়ক শব্দ যা মনোযোগ ধরে রাখতে সাহায্য করে",
  },
  {
    id: "waves",
    nameBn: "সমুদ্রের শান্ত ঢেউ",
    nameEn: "Ocean Waves",
    icon: Waves,
    type: "waves",
    description: "শান্ত ঢেউয়ের ছন্দময় ওঠা-নামা যা মস্তিষ্কের ক্লান্তি ও মানসিক চাপ কমায়",
  },
  {
    id: "binaural",
    nameBn: "৪০Hz গামা বাইনরাল বিটস",
    nameEn: "40Hz Gamma Focus",
    icon: Brain,
    type: "binaural",
    description: "বৈজ্ঞানিকভাবে প্রমাণিত ব্রেনওয়েভ ফ্রিকোয়েন্সি যা গভীর মেমোরি ধরে রাখতে সহায়ক",
  },
  {
    id: "cafe",
    nameBn: "লাইব্রেরি ও ক্যাফে অ্যাম্বিয়েন্স",
    nameEn: "Reading Cafe",
    icon: Coffee,
    type: "cafe",
    description: "মসৃণ ব্রাউন নয়েজ যা চারপাশের অনাকাঙ্ক্ষিত শব্দ দূর করে",
  },
  {
    id: "wind",
    nameBn: "মৃদু বনানীর বাতাস",
    nameEn: "Forest Breeze",
    icon: Wind,
    type: "wind",
    description: "শান্ত প্রকৃতির নির্মল হাওয়া যা দীর্ঘ স্টাডি সেশনে ফুরফুরে অনুভূতি দেয়",
  },
];

export function AmbientAudioPlayer() {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Web Audio Context References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<{ [key: string]: AudioNode }>({});

  const stopCurrentSound = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      sourceNodesRef.current = {};
    } catch {
      // ignore
    }
  };

  const playSound = (track: SoundTrack) => {
    stopCurrentSound();

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (track.type === "rain") {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1200;
        filter.Q.value = 1.2;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
      } else if (track.type === "binaural") {
        // 40Hz Gamma: Left 200Hz, Right 240Hz
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = "sine";
        oscL.frequency.value = 200;

        const oscR = ctx.createOscillator();
        oscR.type = "sine";
        oscR.frequency.value = 240;

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(masterGain);

        oscL.start();
        oscR.start();
      } else if (track.type === "waves" || track.type === "cafe" || track.type === "wind") {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = track.type === "wind" ? 400 : 800;

        brownNoise.connect(filter);
        filter.connect(masterGain);
        brownNoise.start();
      }

      setActiveSoundId(track.id);
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  const handleToggle = (track: SoundTrack) => {
    if (activeSoundId === track.id) {
      stopCurrentSound();
      setActiveSoundId(null);
    } else {
      playSound(track);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      stopCurrentSound();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border shadow-xs bg-linear-to-r from-violet-500/10 via-card to-cyan-500/10">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>অ্যাম্বিয়েন্ট ফোকাস লাউঞ্জ (Ambient Focus Audio)</span>
                  <Badge variant="secondary" className="text-xs">
                    🎧 100% Offline Synth
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  পড়াশোনার সময় মনোযোগ বাড়াতে প্রাকৃতিক শব্দ ও বৈজ্ঞানিক বাইনরাল বিটস শুনুন
                </p>
              </div>
            </div>

            {/* Master Volume Slider */}
            <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-rose-500" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-24 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sound Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOUND_TRACKS.map((track) => {
          const isPlaying = activeSoundId === track.id;
          const Icon = track.icon;

          return (
            <Card
              key={track.id}
              className={cn(
                "border transition-all duration-200 cursor-pointer relative overflow-hidden",
                isPlaying
                  ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/30 shadow-md"
                  : "bg-card hover:border-primary/40 hover:bg-muted/30"
              )}
              onClick={() => handleToggle(track)}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isPlaying ? "bg-violet-600 text-white animate-pulse" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <Button
                    size="sm"
                    variant={isPlaying ? "default" : "outline"}
                    className={cn("h-8 gap-1.5 text-xs font-bold", isPlaying && "bg-violet-600 hover:bg-violet-700")}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>বিরতি দিন</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>শুনুন</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center justify-between">
                    <span>{track.nameBn}</span>
                    {isPlaying && (
                      <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-ping" />
                    )}
                  </h4>
                  <p className="text-2xs text-muted-foreground font-medium">
                    {track.nameEn}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {track.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
