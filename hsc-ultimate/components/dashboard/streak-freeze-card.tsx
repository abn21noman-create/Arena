"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Sparkles, Flame, Plus } from "lucide-react";
import { getStreakFreezeTokens, addStreakFreezeToken } from "@/lib/streak-freeze";
import { toast } from "sonner";
import { sfx } from "@/lib/sound-effects";

export function StreakFreezeCard({ currentStreak = 12 }: { currentStreak?: number }) {
  const [tokens, setTokens] = useState(2);

  useEffect(() => {
    setTokens(getStreakFreezeTokens());
  }, []);

  const handleClaimToken = () => {
    sfx.play("correct");
    const updated = addStreakFreezeToken(1);
    setTokens(updated);
    toast.success("🛡️ ১টি নতুন Streak Freeze টোকেন যুক্ত হয়েছে!");
  };

  return (
    <Card className="border bg-gradient-to-r from-blue-500/10 via-card to-card p-3.5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                স্ট্রিক প্রোটেকশন শিল্ড
              </h4>
              <Badge variant="secondary" className="font-mono text-xs text-blue-600 dark:text-blue-400">
                {tokens}টি টোকেন অবশিষ্ট
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              কোনোদিন কুইজ দিতে ভুলে গেলেও তোমার {currentStreak} দিনের স্ট্রিক নিরাপদ থাকবে
            </p>
          </div>
        </div>

        {tokens < 3 && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={handleClaimToken}
          >
            <Plus className="h-3 w-3" />
            <span>টোকেন সংগ্রহ করো</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
