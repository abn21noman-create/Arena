// ===================================================================
// Premium Leaderboard — Global Tab (সর্বকালের XP ranking)
// -------------------------------------------------------------------
// `app/(dashboard)/leaderboard/page.tsx` Global tab-এ ব্যবহৃত হয়।
// প্রতিটা row তে avatar + name + XP + level + streak দেখায়।
// `any` type ব্যবহার করা হচ্ছে না — Prisma select result থেকে
// proper type derive করা হয়েছে।
// ===================================================================
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Flame, Sparkles } from "lucide-react";

/** Prisma user.findMany({ orderBy: { xp: "desc" }, take: 50, select: {...} }) এর return type */
export interface GlobalLeaderboardUser {
  id: string;
  name: string;
  xp: number;
  level: number;
  streakCount: number;
}

interface PremiumLeaderboardProps {
  users: GlobalLeaderboardUser[];
}

function getInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

export function PremiumLeaderboard({ users }: PremiumLeaderboardProps) {
  if (users.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        এখনো কেউ গ্লোবাল র‍্যাংকিং-এ নেই — প্রথম হও!
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((u, idx) => {
        const rank = idx + 1;
        const isTop3 = rank <= 3;
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

        return (
          <Card
            key={u.id}
            className={`p-3.5 flex flex-row items-center gap-3 hover-lift ${
              isTop3 ? "border-amber-400/40 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20" : ""
            }`}
          >
            <span className="w-8 shrink-0 text-center text-sm font-bold text-muted-foreground">
              {medal ?? `#${rank}`}
            </span>
            <Avatar className={`h-10 w-10 shrink-0 border ${isTop3 ? "ring-2 ring-amber-400" : ""}`}>
              <AvatarFallback
                className={`text-sm font-semibold text-white ${
                  isTop3
                    ? "bg-gradient-to-br from-amber-500 to-amber-700"
                    : "bg-gradient-to-br from-violet-600 to-violet-800"
                }`}
              >
                {getInitial(u.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate flex items-center gap-1.5">
                {u.name}
                {rank === 1 && <Crown className="h-3.5 w-3.5 text-amber-500" />}
              </p>
              <p className="text-xs text-muted-foreground">লেভেল {u.level}</p>
            </div>
            {u.streakCount > 0 && (
              <div className="flex items-center gap-1 text-orange-700 dark:text-orange-400 text-xs shrink-0">
                <Flame className="h-3.5 w-3.5" />
                {u.streakCount}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm font-bold text-primary shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
              {u.xp.toLocaleString("bn-BD")} XP
            </div>
          </Card>
        );
      })}
    </div>
  );
}
