"use client";

// ===================================================================
// Quiz Battle History — রank/স্কোর সহ সাম্প্রতিক battle গুলোর তালিকা
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";

interface HistoryItem {
  battleId: string;
  title: string;
  subjectName: string | null;
  score: number;
  totalParticipants: number;
  rank: number;
  completedAt: string;
}

export function QuizBattleHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quiz-battle/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button render={<Link href="/quiz-battle" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <h1 className="text-xl font-bold">🏆 ব্যাটল ইতিহাস</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : history.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">এখনো কোনো Battle খেলোনি।</Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.battleId} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subjectName ?? "কাস্টম সেট"}</p>
              </div>
              <div className="text-right">
                <Badge variant={item.rank === 1 ? "default" : "secondary"} className="gap-1">
                  {item.rank === 1 && <Trophy className="h-3 w-3" />}
                  র‍্যাংক #{item.rank} / {item.totalParticipants}
                </Badge>
                <p className="mt-1 text-sm font-semibold">স্কোর: {item.score}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
