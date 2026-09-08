"use client";

// ===================================================================
// Premium Leaderboard — Global Tab with College & Board Filters
// ===================================================================
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Flame, Sparkles, School, Building2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound-effects";

export interface GlobalLeaderboardUser {
  id: string;
  name: string;
  xp: number;
  level: number;
  streakCount: number;
  college?: string | null;
  board?: string | null;
}

interface PremiumLeaderboardProps {
  users: GlobalLeaderboardUser[];
}

function getInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

const TOP_COLLEGES = [
  "সকল কলেজ",
  "নটর ডেম কলেজ",
  "ঢাকা কলেজ",
  "রাজউক উত্তরা মডেল কলেজ",
  "ভিকারুননিসা নূন কলেজ",
  "হলিক্রস কলেজ",
  "চট্টগ্রাম কলেজ",
  "রাজশাহী কলেজ",
  "ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ",
];

const BOARDS = [
  "সকল বোর্ড",
  "ঢাকা বোর্ড",
  "চট্টগ্রাম বোর্ড",
  "রাজশাহী বোর্ড",
  "কুমিল্লা বোর্ড",
  "সিলেট বোর্ড",
  "বরিশাল বোর্ড",
  "দিনাজপুর বোর্ড",
  "ময়মনসিংহ বোর্ড",
  "মাদ্রাসা বোর্ড",
];

export function PremiumLeaderboard({ users }: PremiumLeaderboardProps) {
  const [selectedCollege, setSelectedCollege] = useState("সকল কলেজ");
  const [selectedBoard, setSelectedBoard] = useState("সকল বোর্ড");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchCollege =
        selectedCollege === "সকল কলেজ" ||
        (u.college && u.college.toLowerCase().includes(selectedCollege.toLowerCase()));
      const matchBoard =
        selectedBoard === "সকল বোর্ড" ||
        (u.board && u.board.toLowerCase().includes(selectedBoard.toLowerCase()));
      return matchCollege && matchBoard;
    });
  }, [users, selectedCollege, selectedBoard]);

  return (
    <div className="space-y-4">
      {/* College & Board Filters */}
      <div className="flex flex-col sm:flex-row gap-2 rounded-xl border bg-card p-3 text-xs shadow-xs">
        <div className="flex-1 space-y-1">
          <label className="text-muted-foreground font-semibold flex items-center gap-1">
            <School className="h-3.5 w-3.5 text-primary" />
            <span>কলেজ অনুযায়ী ফিল্টার</span>
          </label>
          <select
            value={selectedCollege}
            onChange={(e) => {
              sfx.play("click");
              setSelectedCollege(e.target.value);
            }}
            className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
          >
            {TOP_COLLEGES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-muted-foreground font-semibold flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>শিক্ষা বোর্ড ফিল্টার</span>
          </label>
          <select
            value={selectedBoard}
            onChange={(e) => {
              sfx.play("click");
              setSelectedBoard(e.target.value);
            }}
            className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
          >
            {BOARDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          এই ফিল্টারে এখনো কোনো শিক্ষার্থী পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((u, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

            return (
              <Card
                key={u.id}
                className={cn(
                  "p-3.5 flex flex-row items-center gap-3 hover-lift transition",
                  isTop3
                    ? "border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent"
                    : "bg-card"
                )}
              >
                <span className="w-8 shrink-0 text-center text-sm font-bold text-muted-foreground">
                  {medal ?? `#${rank}`}
                </span>
                <Avatar
                  className={cn(
                    "h-10 w-10 shrink-0 border",
                    isTop3 ? "ring-2 ring-amber-400" : ""
                  )}
                >
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold text-white",
                      isTop3
                        ? "bg-gradient-to-br from-amber-500 to-amber-700"
                        : "bg-gradient-to-br from-violet-600 to-violet-800"
                    )}
                  >
                    {getInitial(u.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
                    {u.name}
                    {rank === 1 && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>লেভেল {u.level}</span>
                    {u.college && <span className="truncate">• {u.college}</span>}
                  </div>
                </div>
                {u.streakCount > 0 && (
                  <div className="flex items-center gap-1 text-orange-700 dark:text-orange-400 text-xs shrink-0">
                    <Flame className="h-3.5 w-3.5 fill-orange-500" />
                    <span className="font-mono font-bold">{u.streakCount}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-primary shrink-0">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-mono">{u.xp.toLocaleString("bn-BD")}</span> XP
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
