"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Sparkles, CheckCircle2, Gift, Zap, ShieldCheck } from "lucide-react";
import { getDailyQuests, type DailyQuest } from "@/lib/daily-quests";
import { triggerConfetti } from "@/components/shared/confetti";
import { sfx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export function DailyQuestsCard() {
  const [quests, setQuests] = useState<DailyQuest[]>(() => getDailyQuests());
  const [xpBoostActive, setXpBoostActive] = useState<boolean>(true);
  const [boostMinutesRemaining, setBoostMinutesRemaining] = useState<number>(14);

  const handleClaim = (questId: string, xpReward: number) => {
    sfx.play("reward_claim");
    triggerConfetti();
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
    );
  };

  const allCompleted = quests.every((q) => q.completed);

  return (
    <Card className="border shadow-xs bg-card relative overflow-hidden">
      {/* 2X XP Booster Active Indicator */}
      {xpBoostActive && (
        <div className="bg-linear-to-r from-amber-500/20 via-primary/20 to-amber-500/20 border-b border-amber-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
            <Zap className="h-3.5 w-3.5 fill-current animate-pulse" />
            <span>2X XP বুস্টার সক্রিয়! ({boostMinutesRemaining} মিনিট বাকি)</span>
          </div>
          <Badge variant="outline" className="text-2xs border-amber-500/40 text-amber-600 dark:text-amber-400">
            ডাবল রিওয়ার্ড
          </Badge>
        </div>
      )}

      <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gift className="h-4 w-4" />
            </div>
            <span>দৈনিক মিশন ও কোয়েস্ট (Daily Quests)</span>
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {quests.filter((q) => q.completed).length}/{quests.length} সম্পন্ন
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 sm:p-5 sm:pt-2 space-y-3">
        {quests.map((quest) => {
          const percentage = Math.min(100, Math.round((quest.current / quest.target) * 100));
          const canClaim = quest.completed && !quest.claimed;

          return (
            <div
              key={quest.id}
              className={cn(
                "rounded-xl border p-3 transition-all",
                quest.claimed
                  ? "bg-muted/20 border-border/40 opacity-75"
                  : canClaim
                  ? "border-primary/40 bg-primary/5 shadow-xs"
                  : "bg-card"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                    {quest.claimed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span>{quest.titleBangla}</span>
                  </div>
                  <p className="text-2xs sm:text-xs text-muted-foreground">{quest.description}</p>
                </div>

                {canClaim ? (
                  <Button
                    size="sm"
                    className="h-7 text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white shadow-xs animate-bounce"
                    onClick={() => handleClaim(quest.id, quest.xpReward)}
                  >
                    <Gift className="h-3 w-3" />
                    +{quest.xpReward} XP নিন
                  </Button>
                ) : quest.claimed ? (
                  <Badge variant="outline" className="text-2xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    সংগৃহীত ✓
                  </Badge>
                ) : (
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {quest.current}/{quest.target} {quest.unit}
                  </span>
                )}
              </div>

              {!quest.claimed && (
                <div className="space-y-1">
                  <Progress value={percentage} className="h-1.5" />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
