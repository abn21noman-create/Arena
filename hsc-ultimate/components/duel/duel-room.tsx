"use client";

// ===================================================================
// Duel Room — একটা নির্দিষ্ট Duel এর সম্পূর্ণ জীবনচক্র হ্যান্ডল করে
// -------------------------------------------------------------------
// WAITING: চ্যালেঞ্জার প্রতিপক্ষের অপেক্ষায় (polling দিয়ে চেক করে opponent
//          যোগ দিয়েছে কিনা)
// ACTIVE: MCQ প্রশ্ন দেখানো হয়, উত্তর দিয়ে জমা দেওয়া যায়; জমা দেওয়ার পরে
//         প্রতিপক্ষের জমা দেওয়ার অপেক্ষায় polling করে
// COMPLETED: ফলাফল (win/loss/draw), স্কোর তুলনা দেখানো হয়
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Swords, Loader2, Trophy, Clock, X, Frown, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/shared/math-text";

type DuelStatus = "WAITING" | "ACTIVE" | "COMPLETED" | "EXPIRED";

interface DuelData {
  id: string;
  status: DuelStatus;
  subject: { id: string; name: string; colorHex: string } | null;
  displayName: string; // subject.name অথবা custom set এর title
  challenger: { id: string; name: string; level: number };
  opponent: { id: string; name: string; level: number } | null;
  challengerScore: number;
  opponentScore: number;
  challengerAnswers: Record<string, string> | null;
  opponentAnswers: Record<string, string> | null;
  winnerId: string | null;
  questionIds: string[];
}

interface Question {
  id: string;
  text: string;
  options: string[] | null;
  difficulty?: string; // custom set (CustomQuestion) এ এই ফিল্ড নেই, শুধু Subject question bank এ থাকে
}

const POLL_INTERVAL_MS = 3000;
const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"];

export function DuelRoom({ duelId, currentUserId }: { duelId: string; currentUserId: string }) {
  const [duel, setDuel] = useState<DuelData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // useRef(0) দিয়ে শুরু করা হচ্ছে (Date.now() render এর মধ্যে সরাসরি কল করা
  // impure — React এর নিয়ম ভাঙে), আসল সময় প্রশ্ন লোড হওয়ার useEffect এ সেট হয়
  const startTimeRef = useRef<number>(0);
  const questionsLoadedRef = useRef(false);

  const loadDuel = useCallback(async () => {
    try {
      const res = await fetch(`/api/duel/${duelId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Duel পাওয়া যায়নি");
        return;
      }
      setDuel(data.duel);

      // প্রশ্ন একবারই লোড করা হয় (ACTIVE/COMPLETED হলে)
      if (
        !questionsLoadedRef.current &&
        (data.duel.status === "ACTIVE" || data.duel.status === "COMPLETED")
      ) {
        questionsLoadedRef.current = true;
        const qRes = await fetch(`/api/duel/${duelId}/questions`);
        const qData = await qRes.json();
        if (qRes.ok) setQuestions(qData.questions);
        startTimeRef.current = Date.now();
      }

      const submitted = data.duel.challenger.id === currentUserId
        ? data.duel.challengerAnswers !== null
        : data.duel.opponentAnswers !== null;
      setHasSubmitted(submitted);
    } catch {
      // silent fail — পোলিং
    } finally {
      setLoading(false);
    }
  }, [duelId, currentUserId]);

  useEffect(() => {
    void loadDuel();
    const interval = setInterval(() => void loadDuel(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadDuel]);

  async function handleSubmit() {
    if (submitting || hasSubmitted) return;
    setSubmitting(true);
    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await fetch(`/api/duel/${duelId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTakenSec }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "জমা দেওয়া যায়নি");
        return;
      }
      setDuel(data.duel);
      setHasSubmitted(true);
      toast.success("উত্তর জমা হয়েছে! প্রতিদ্বন্দ্বীর অপেক্ষা করছি...");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    try {
      await fetch(`/api/duel/${duelId}/cancel`, { method: "POST" });
      toast.success("Duel বাতিল করা হয়েছে");
      window.location.href = "/duel";
    } catch {
      toast.error("বাতিল করা যায়নি");
    }
  }

  if (loading || !duel) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/duel" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            {duel.displayName} ডুয়েল
          </h1>
        </div>
      </div>

      {/* WAITING state */}
      {duel.status === "WAITING" && (
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="font-medium mb-1">প্রতিদ্বন্দ্বীর অপেক্ষা করা হচ্ছে...</p>
          <p className="text-sm text-muted-foreground mb-5">
            কেউ Lobby থেকে তোমার Challenge গ্রহণ করলেই Duel শুরু হয়ে যাবে
          </p>
          <Button variant="outline" onClick={handleCancel} className="gap-1.5">
            <X className="h-3.5 w-3.5" />
            বাতিল করো
          </Button>
        </Card>
      )}

      {/* ACTIVE state */}
      {duel.status === "ACTIVE" && (
        <>
          {hasSubmitted ? (
            <Card className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="font-medium mb-1">উত্তর জমা হয়েছে!</p>
              <p className="text-sm text-muted-foreground">
                প্রতিদ্বন্দ্বীর উত্তর জমা দেওয়ার অপেক্ষা করা হচ্ছে...
              </p>
            </Card>
          ) : questions.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{answeredCount} / {questions.length} উত্তর দেওয়া হয়েছে</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    সময় গুনছে...
                  </span>
                </div>
                <Progress value={(answeredCount / questions.length) * 100} className="h-1.5" />
              </div>

              <div className="space-y-4 mb-5">
                {questions.map((q, i) => (
                  <Card key={q.id} className="p-4">
                    <p className="text-sm font-medium mb-3">
                      {i + 1}. <MathText text={q.text} />
                    </p>
                    <div className="space-y-1.5">
                      {(q.options ?? []).map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className={cn(
                            "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                            answers[q.id] === opt
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input hover:bg-muted"
                          )}
                        >
                          <span className="font-medium mr-1.5">{OPTION_LABELS[idx]}.</span>
                          <MathText text={opt} />
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || answeredCount === 0}
                className="w-full gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                উত্তর জমা দাও ({answeredCount}/{questions.length})
              </Button>
            </div>
          )}
        </>
      )}

      {/* COMPLETED state */}
      {duel.status === "COMPLETED" && (
        <DuelResult duel={duel} currentUserId={currentUserId} />
      )}

      {duel.status === "EXPIRED" && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          এই Duel বাতিল হয়ে গেছে।
        </Card>
      )}
    </div>
  );
}

function DuelResult({ duel, currentUserId }: { duel: DuelData; currentUserId: string }) {
  const isChallenger = duel.challenger.id === currentUserId;
  const myScore = isChallenger ? duel.challengerScore : duel.opponentScore;
  const opponentScore = isChallenger ? duel.opponentScore : duel.challengerScore;
  const opponentName = isChallenger ? duel.opponent?.name : duel.challenger.name;

  const isWinner = duel.winnerId === currentUserId;
  const isDraw = duel.winnerId === null;

  return (
    <Card
      className={cn(
        "p-8 text-center",
        isWinner && "bg-gradient-to-br from-amber-500/10 to-yellow-500/10",
        isDraw && "bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
      )}
    >
      {isWinner ? (
        <Trophy className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
      ) : isDraw ? (
        <Handshake className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
      ) : (
        <Frown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      )}

      <h2 className="text-xl font-bold mb-1">
        {isWinner ? "🏆 তুমি জিতেছো!" : isDraw ? "🤝 ড্র হয়েছে!" : "তুমি এবার হেরেছো"}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {opponentName} এর বিরুদ্ধে
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-2xl font-bold text-primary">{myScore}</p>
          <p className="text-xs text-muted-foreground mt-1">তোমার স্কোর</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-2xl font-bold">{opponentScore}</p>
          <p className="text-xs text-muted-foreground mt-1">প্রতিদ্বন্দ্বীর স্কোর</p>
        </div>
      </div>

      <Badge variant="outline" className="mb-6">
        {isWinner ? "+25 XP অর্জিত" : isDraw ? "+15 XP অর্জিত" : "+5 XP অর্জিত"}
      </Badge>

      <div className="flex gap-3">
        <Button render={<Link href="/duel" className="flex-1" />} variant="outline" className="w-full">
            আরেকটা Duel খেলো
          </Button>
        <Button render={<Link href="/dashboard" className="flex-1" />} className="w-full">ড্যাশবোর্ডে ফিরে যাও</Button>
      </div>
    </Card>
  );
}
