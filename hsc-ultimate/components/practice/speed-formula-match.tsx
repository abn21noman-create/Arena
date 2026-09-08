"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timer, Zap, Trophy, RotateCcw, Flame, CheckCircle2, Award } from "lucide-react";
import { sfx } from "@/lib/sound-effects";
import { triggerConfetti } from "@/components/shared/confetti";
import { cn } from "@/lib/utils";

interface FormulaPair {
  id: string;
  name: string;
  formula: string;
  subject: string;
}

const FORMULA_POOL: FormulaPair[] = [
  { id: "1", name: "মহাকর্ষীয় বিভব (V)", formula: "V = -GM / r", subject: "পদার্থবিজ্ঞান ১ম" },
  { id: "2", name: "ডি-ব্রগলি তরঙ্গদৈর্ঘ্য (λ)", formula: "λ = h / p", subject: "পদার্থবিজ্ঞান ২য়" },
  { id: "3", name: "কার্নো ইঞ্জিনের দক্ষতা (η)", formula: "η = 1 - (T₂ / T₁)", subject: "পদার্থবিজ্ঞান ২য়" },
  { id: "4", name: "জুলের তাপীয় ক্রিয়া (H)", formula: "H = I²Rt", subject: "পদার্থবিজ্ঞান ২য়" },
  { id: "5", name: "আদর্শ গ্যাস সমীকরণ", formula: "PV = nRT", subject: "রসায়ন ১ম" },
  { id: "6", name: "বোর ব্যাসার্ধ (rₙ)", formula: "rₙ = (n²h²ε₀) / (πme²)", subject: "পদার্থবিজ্ঞান ২য়" },
  { id: "7", name: "স্থিরাবস্থার বেগ (মহাকর্ষ)", formula: "v = √(2GM / R)", subject: "পদার্থবিজ্ঞান ১ম" },
  { id: "8", name: "ফটোইলেকট্রিক সমীকরণ", formula: "E = hf₀ + K_max", subject: "পদার্থবিজ্ঞান ২য়" },
  { id: "9", name: "কৈশিক নলে তরলের উচ্চতা (h)", formula: "h = (2T cos θ) / (rρg)", subject: "পদার্থবিজ্ঞান ১ম" },
  { id: "10", name: "সরল ছন্দিত গতির পর্যায়কাল (T)", formula: "T = 2π√(m / k)", subject: "পদার্থবিজ্ঞান ১ম" },
  { id: "11", name: "ফার্মির শক্তি স্তর (E_F)", formula: "E_F = (h²/8m)(3N/πV)^(2/3)", subject: "পদার্থবিজ্ঞান ২য়" },
  { id: "12", name: "পয়সনের অনুপাত (σ)", formula: "σ = - (Δd / d) / (ΔL / L)", subject: "পদার্থবিজ্ঞান ১ম" },
];

export function SpeedFormulaMatch() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const [activePairs, setActivePairs] = useState<FormulaPair[]>([]);
  const [shuffledNames, setShuffledNames] = useState<FormulaPair[]>([]);
  const [shuffledFormulas, setShuffledFormulas] = useState<FormulaPair[]>([]);

  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewGame = () => {
    sfx.play("start");
    // Pick 6 random formulas from pool
    const shuffledPool = [...FORMULA_POOL].sort(() => Math.random() - 0.5).slice(0, 6);
    setActivePairs(shuffledPool);
    setShuffledNames([...shuffledPool].sort(() => Math.random() - 0.5));
    setShuffledFormulas([...shuffledPool].sort(() => Math.random() - 0.5));
    setMatchedIds([]);
    setSelectedNameId(null);
    setSelectedFormulaId(null);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setGameState("playing");
  };

  // Timer loop
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState("finished");
            sfx.play("game_over");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle Match Check
  useEffect(() => {
    if (selectedNameId && selectedFormulaId) {
      if (selectedNameId === selectedFormulaId) {
        // Correct Match
        sfx.play("correct");
        setMatchedIds((prev) => {
          const updated = [...prev, selectedNameId];
          if (updated.length === activePairs.length) {
            // Level cleared! Load next round + bonus time
            setTimeout(() => {
              triggerConfetti();
              sfx.play("level_up");
              const nextPool = [...FORMULA_POOL].sort(() => Math.random() - 0.5).slice(0, 6);
              setActivePairs(nextPool);
              setShuffledNames([...nextPool].sort(() => Math.random() - 0.5));
              setShuffledFormulas([...nextPool].sort(() => Math.random() - 0.5));
              setMatchedIds([]);
              setTimeLeft((t) => Math.min(60, t + 10)); // +10s bonus
            }, 400);
          }
          return updated;
        });

        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak((prev) => Math.max(prev, newStreak));
        setScore((prev) => prev + 100 * (1 + newStreak * 0.2));

        setSelectedNameId(null);
        setSelectedFormulaId(null);
      } else {
        // Wrong Match
        sfx.play("wrong");
        setWrongPair(true);
        setStreak(0);
        setTimeout(() => {
          setSelectedNameId(null);
          setSelectedFormulaId(null);
          setWrongPair(false);
        }, 500);
      }
    }
  }, [selectedNameId, selectedFormulaId, streak, activePairs.length]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border shadow-xs bg-linear-to-r from-primary/5 via-card to-accent/5">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-6 w-6 fill-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <span>স্পিড সূত্র ম্যাচিং (Speed Formula Match)</span>
                    <Badge variant="secondary" className="gap-1 font-mono text-xs">
                      ⚡ 60s Blitz
                    </Badge>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    সঠিক সূত্র জোড়া মেলান, স্ট্রিক বোনাস তুলুন এবং লিডারবোর্ডের শীর্ষ দখল করুন!
                  </p>
                </div>
              </div>
            </div>

            {gameState === "playing" && (
              <div className="flex items-center gap-4">
                {/* Timer Badge */}
                <div className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 font-mono font-bold text-sm",
                  timeLeft <= 10 ? "border-rose-500 bg-rose-500/10 text-rose-500 animate-pulse" : "bg-card"
                )}>
                  <Timer className="h-4 w-4" />
                  <span>{timeLeft}s</span>
                </div>

                {/* Score & Streak */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <Trophy className="h-4 w-4" />
                    <span>{Math.round(score)}</span>
                  </div>
                  {streak > 1 && (
                    <div className="flex items-center gap-1 font-bold text-amber-500 animate-bounce">
                      <Flame className="h-4 w-4 fill-amber-500" />
                      <span>{streak}x</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Game Arena */}
      {gameState === "idle" && (
        <Card className="border p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Flame className="h-10 w-10 fill-primary animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold">প্রস্তুত তো?</h3>
            <p className="text-sm text-muted-foreground">
              বাম পাশের সূত্রের নামের সাথে ডান পাশের সমীকরণটি দ্রুত ক্লিক করে ম্যাচ করুন। প্রতি সঠিক ম্যাচে কম্বো বাড়বে এবং রাউন্ড ক্লিয়ার করলে অতিরিক্ত সময় পাবেন!
            </p>
          </div>
          <Button size="lg" className="h-12 px-8 font-bold gap-2 text-base shadow-md" onClick={startNewGame}>
            <Zap className="h-5 w-5 fill-current" />
            <span>খেলা শুরু করুন</span>
          </Button>
        </Card>
      )}

      {gameState === "playing" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Names */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              ১. সূত্র / রাশির নাম সিলেক্ট করুন
            </div>
            {shuffledNames.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedNameId === item.id;
              if (isMatched) return null; // hide matched

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sfx.play("click");
                    setSelectedNameId(item.id);
                  }}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all duration-150 flex items-center justify-between",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40 font-bold"
                      : "bg-card hover:border-primary/50 hover:bg-muted/40",
                    wrongPair && isSelected && "border-rose-500 bg-rose-500/10 text-rose-500 animate-shake"
                  )}
                >
                  <div>
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-2xs text-muted-foreground">{item.subject}</div>
                  </div>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </button>
              );
            })}
          </div>

          {/* Right: Formulas */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              ২. সঠিক সমীকরণটি মিলিয়ে দিন
            </div>
            {shuffledFormulas.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedFormulaId === item.id;
              if (isMatched) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sfx.play("click");
                    setSelectedFormulaId(item.id);
                  }}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all duration-150 flex items-center justify-between font-mono text-sm",
                    isSelected
                      ? "border-accent bg-accent/10 ring-2 ring-accent/40 font-bold"
                      : "bg-card hover:border-accent/50 hover:bg-muted/40",
                    wrongPair && isSelected && "border-rose-500 bg-rose-500/10 text-rose-500 animate-shake"
                  )}
                >
                  <span className="font-bold">{item.formula}</span>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-accent animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <Card className="border p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Award className="h-10 w-10 fill-amber-500 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold">সময় শেষ! দুর্দান্ত খেলেছেন</h3>
            <p className="text-sm text-muted-foreground">
              আপনার অন্তর্দৃষ্টি এবং গতির চমৎকার সংমিশ্রণ!
            </p>
          </div>

          <div className="grid grid-cols-2 max-w-xs mx-auto gap-3">
            <div className="rounded-xl border bg-card p-3">
              <div className="text-2xs text-muted-foreground">মোট স্কোর</div>
              <div className="text-2xl font-bold text-primary">{Math.round(score)}</div>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <div className="text-2xs text-muted-foreground">সর্বোচ্চ স্ট্রিক</div>
              <div className="text-2xl font-bold text-amber-500">{maxStreak}x</div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button size="lg" className="gap-2 font-bold" onClick={startNewGame}>
              <RotateCcw className="h-4 w-4" />
              <span>আবার খেলুন</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
