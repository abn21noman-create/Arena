"use client";

// ===================================================================
// Duel History — সম্পন্ন হওয়া Duel এর তালিকা + win/loss/draw স্ট্যাটস
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, Loader2, Trophy, Frown, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface DuelHistoryItem {
  id: string;
  subject: { name: string; colorHex: string } | null;
  displayName: string; // subject.name অথবা custom set এর title
  challenger: { id: string; name: string };
  opponent: { id: string; name: string } | null;
  challengerScore: number;
  opponentScore: number;
  winnerId: string | null;
  completedAt: string;
}

interface Stats {
  wins: number;
  draws: number;
  losses: number;
  total: number;
}

export function DuelHistory({ currentUserId }: { currentUserId: string }) {
  const [duels, setDuels] = useState<DuelHistoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/duel/history");
        const data = await res.json();
        if (res.ok) {
          setDuels(data.duels);
          setStats(data.stats);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/duel" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            ডুয়েল ইতিহাস
          </h1>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-500">
              {stats.wins}
            </p>
            <p className="text-xs text-muted-foreground">জয়</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.draws}</p>
            <p className="text-xs text-muted-foreground">ড্র</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.losses}</p>
            <p className="text-xs text-muted-foreground">হার</p>
          </Card>
        </div>
      )}

      {duels.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          এখনো কোনো Duel সম্পন্ন করোনি — প্রথম Duel খেলে ইতিহাস তৈরি করো!
        </Card>
      ) : (
        <div className="space-y-2">
          {duels.map((d) => {
            const isChallenger = d.challenger.id === currentUserId;
            const myScore = isChallenger ? d.challengerScore : d.opponentScore;
            const oppScore = isChallenger ? d.opponentScore : d.challengerScore;
            const oppName = isChallenger ? d.opponent?.name : d.challenger.name;
            const isWinner = d.winnerId === currentUserId;
            const isDraw = d.winnerId === null;

            return (
              <Card key={d.id} className="p-3.5 flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                    isWinner && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    isDraw && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                    !isWinner && !isDraw && "bg-muted text-muted-foreground"
                  )}
                >
                  {isWinner ? (
                    <Trophy className="h-4 w-4" />
                  ) : isDraw ? (
                    <Handshake className="h-4 w-4" />
                  ) : (
                    <Frown className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">vs {oppName}</p>
                  <p className="text-xs text-muted-foreground">{d.displayName}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {myScore} - {oppScore}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
