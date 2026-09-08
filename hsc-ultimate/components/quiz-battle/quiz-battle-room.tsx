"use client";

// ===================================================================
// Quiz Battle Room — সম্পূর্ণ জীবনচক্র হ্যান্ডল করে (multi-person, self-paced)
// -------------------------------------------------------------------
// WAITING: room code শেয়ার করা, participant লিস্ট, owner "শুরু করো" চাপবে
// ACTIVE: প্রতিটা participant নিজের গতিতে MCQ উত্তর দেয়, জমা দেওয়ার পর
//         নিজের রেজাল্ট দেখে কিন্তু চাইলে live leaderboard দেখতে থাকে
//         (polling), owner "শেষ করো" চাপলে battle সম্পূর্ণ হয়
// COMPLETED: চূড়ান্ত leaderboard/rank দেখানো হয়
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Copy,
  Users,
  PlayCircle,
  StopCircle,
  Trophy,
  Crown,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/clipboard";
import { MathText } from "@/components/shared/math-text";
import { sfx } from "@/lib/sound-effects";

type BattleStatus = "WAITING" | "ACTIVE" | "COMPLETED";

interface Participant {
  id: string;
  userId: string;
  score: number;
  timeTakenSec: number | null;
  submittedAt: string | null;
  user: { id: string; name: string; level: number };
}

interface BattleData {
  id: string;
  title: string;
  roomCode: string;
  status: BattleStatus;
  ownerId: string;
  maxPlayers: number;
  subject: { name: string } | null;
  owner: { id: string; name: string };
  participants: Participant[];
}

interface Question {
  id: string;
  text: string;
  options: string[] | null;
}

const FALLBACK_POLL_INTERVAL_MS = 4000; // SSE ব্যর্থ হলে ফলব্যাক পোলিং ইন্টারভাল
const LIVE_INDICATOR_TIMEOUT_MS = 6000; // এই সময়ে কোনো SSE ইভেন্ট না এলে "লাইভ" ব্যাজ সরিয়ে ফেলা হয়

export function QuizBattleRoom({ battleId, currentUserId }: { battleId: string; currentUserId: string }) {
  const confirmAction = useConfirmDialog();
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [isLive, setIsLive] = useState(false); // SSE সংযোগ সক্রিয় কিনা (UI তে "লাইভ" ব্যাজ দেখানোর জন্য)
  const questionsLoadedRef = useRef(false);
  const startTimeRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadQuestionsIfNeeded = useCallback(
    async (status: BattleStatus) => {
      if (questionsLoadedRef.current || status === "WAITING") return;
      questionsLoadedRef.current = true;
      try {
        const qRes = await fetch(`/api/quiz-battle/${battleId}/questions`);
        const qData = await qRes.json();
        if (qRes.ok) setQuestions(qData.questions);
        startTimeRef.current = Date.now();
      } catch {
        // silent fail — পরের রিফ্রেশে আবার চেষ্টা হবে (questionsLoadedRef রিসেট না করলে চেষ্টা হবে না, কিন্তু network issue এ মূল battle data ঠিকই আসবে)
        questionsLoadedRef.current = false;
      }
    },
    [battleId]
  );

  const applyBattleUpdate = useCallback(
    (data: BattleData) => {
      setBattle(data);
      setLoading(false);
      void loadQuestionsIfNeeded(data.status);
    },
    [loadQuestionsIfNeeded]
  );

  // ফলব্যাক: SSE কানেকশন ব্যর্থ হলে এক-বারের মতো সরাসরি ফেচ করে ফিক্সড-ইন্টারভাল পোলিং শুরু করে
  const fetchBattleOnce = useCallback(async () => {
    try {
      const res = await fetch(`/api/quiz-battle/${battleId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Battle পাওয়া যায়নি");
        return;
      }
      applyBattleUpdate(data.battle);
    } catch {
      // silent fail — পরের পোলিং সাইকেলে আবার চেষ্টা
    }
  }, [battleId, applyBattleUpdate]);

  const startFallbackPolling = useCallback(() => {
    if (fallbackTimerRef.current) return; // ইতিমধ্যে চলছে
    void fetchBattleOnce();
    fallbackTimerRef.current = setInterval(() => void fetchBattleOnce(), FALLBACK_POLL_INTERVAL_MS);
  }, [fetchBattleOnce]);

  const stopFallbackPolling = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  // Server-Sent Events দিয়ে রিয়েল-টাইম আপডেট — প্রায় তাৎক্ষণিক leaderboard/status
  // রিফ্রেশ (আগে ফিক্সড ৪ সেকেন্ড পোলিং ছিল)। কানেকশন ব্যর্থ হলে বা ব্রাউজার
  // EventSource সাপোর্ট না করলে (খুবই পুরনো ব্রাউজার) স্বয়ংক্রিয়ভাবে ফিক্সড-
  // ইন্টারভাল পোলিং ফলব্যাকে চলে যায়।
  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      startFallbackPolling();
      return () => stopFallbackPolling();
    }

    const es = new EventSource(`/api/quiz-battle/${battleId}/stream`);
    eventSourceRef.current = es;

    function markLive() {
      setIsLive(true);
      if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);
      liveTimeoutRef.current = setTimeout(() => setIsLive(false), LIVE_INDICATOR_TIMEOUT_MS);
    }

    es.addEventListener("battle", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as BattleData;
        applyBattleUpdate(data);
        markLive();
        stopFallbackPolling(); // SSE কাজ করছে, ফলব্যাক পোলিং লাগবে না
      } catch {
        // পার্স এরর — উপেক্ষা করা, পরের ইভেন্টের জন্য অপেক্ষা
      }
    });

    es.addEventListener("error", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { message?: string };
        if (data?.message) toast.error(data.message);
      } catch {
        // "error" ইভেন্ট নেটওয়ার্ক-লেভেল হতে পারে (JSON না), সেক্ষেত্রে নিচের onerror হ্যান্ডল করবে
      }
    });

    es.addEventListener("done", () => {
      es.close();
      setIsLive(false);
    });

    es.onerror = () => {
      // কানেকশন ভেঙে গেছে (নেটওয়ার্ক সমস্যা/সার্ভার রিস্টার্ট ইত্যাদি) —
      // EventSource নিজে থেকেই reconnect চেষ্টা করবে, কিন্তু ততক্ষণ UI যেন
      // স্থবির না থাকে তাই ফলব্যাক পোলিং চালু করা হয়
      setIsLive(false);
      startFallbackPolling();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      stopFallbackPolling();
      if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);
    };
  }, [battleId, applyBattleUpdate, startFallbackPolling, stopFallbackPolling]);

  const loadBattle = fetchBattleOnce; // handleStart/handleEnd/handleSubmit এর পরে ম্যানুয়াল রিফ্রেশের জন্য (SSE একটু দেরি হলেও তাৎক্ষণিক UI আপডেট)

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch(`/api/quiz-battle/${battleId}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "শুরু করা যায়নি");
        return;
      }
      sfx.play("streak");
      toast.success("🚀 Battle শুরু হয়েছে!");
      void loadBattle();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setStarting(false);
    }
  }

  async function handleEnd() {
    if (ending) return;
    if (!(await confirmAction({ description: "Battle এখনই শেষ করতে চাও?", confirmLabel: "শেষ করো" })))
      return;
    setEnding(true);
    try {
      const res = await fetch(`/api/quiz-battle/${battleId}/end`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "শেষ করা যায়নি");
        return;
      }
      toast.success("🏁 Battle শেষ হয়েছে!");
      void loadBattle();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setEnding(false);
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await fetch(`/api/quiz-battle/${battleId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTakenSec }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "জমা দেওয়া যায়নি");
        return;
      }
      sfx.play("levelUp");
      toast.success(`✅ জমা দিয়েছো! স্কোর: ${data.result.score}/${questions.length}`);
      void loadBattle();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyRoomCode() {
    if (!battle) return;
    sfx.play("click");
    const ok = await copyToClipboard(battle.roomCode);
    if (ok) toast.success("রুম কোড কপি হয়েছে!");
    else toast.error("কপি করা যায়নি, ম্যানুয়ালি লিখে নাও");
  }

  function selectAnswer(questionId: string, option: string) {
    sfx.play("click");
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  if (loading || !battle) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isOwner = battle.ownerId === currentUserId;
  const myParticipant = battle.participants.find((p) => p.userId === currentUserId);
  const hasSubmitted = !!myParticipant?.submittedAt;
  const sortedLeaderboard = [...battle.participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.timeTakenSec ?? Infinity) - (b.timeTakenSec ?? Infinity);
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Button render={<Link href="/quiz-battle" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{battle.title}</h1>
          <p className="text-xs text-muted-foreground">
            {battle.subject?.name ?? "কাস্টম প্রশ্ন সেট"} • {battle.participants.length}/{battle.maxPlayers} জন
          </p>
        </div>
        {battle.status !== "COMPLETED" && (
          <Badge
            variant={isLive ? "default" : "secondary"}
            className={cn("gap-1.5 text-xs", isLive && "bg-violet-500 hover:bg-violet-500")}
            title={isLive ? "রিয়েল-টাইম সংযোগ সক্রিয়" : "সংযোগ স্থাপন হচ্ছে / পুনরায় চেষ্টা করা হচ্ছে"}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isLive ? "animate-pulse bg-white" : "bg-muted-foreground"
              )}
            />
            {isLive ? "লাইভ" : "সংযোগ হচ্ছে..."}
          </Badge>
        )}
      </div>

      {/* WAITING অবস্থা */}
      {battle.status === "WAITING" && (
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <p className="mb-2 text-sm text-muted-foreground">রুম কোড শেয়ার করো</p>
            <button
              onClick={copyRoomCode}
              className="mx-auto flex items-center gap-2 rounded-lg border-2 border-dashed px-6 py-3 text-3xl font-bold tracking-widest transition-colors hover:border-primary"
              aria-label={`রুম কোড ${battle.roomCode} কপি করো`}
            >
              {battle.roomCode}
              <Copy className="h-5 w-5 text-muted-foreground" />
            </button>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4" /> অংশগ্রহণকারী ({battle.participants.length})
            </h2>
            <div className="space-y-1.5">
              {battle.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  {p.userId === battle.ownerId && <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                  <span>{p.user.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {isOwner ? (
            <Button onClick={handleStart} disabled={starting} className="w-full gap-2">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Battle শুরু করো
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Room owner শুরু করার অপেক্ষায় আছো...
            </p>
          )}
        </div>
      )}

      {/* ACTIVE অবস্থা */}
      {battle.status === "ACTIVE" && !hasSubmitted && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            প্রশ্ন {currentIdx + 1} / {questions.length}
          </p>
          {questions[currentIdx] && (
            <Card className="p-5">
              <p className="mb-4 font-medium">
                <MathText text={questions[currentIdx].text} />
              </p>
              <div className="space-y-2">
                {(questions[currentIdx].options ?? []).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(questions[currentIdx].id, opt)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                      answers[questions[currentIdx].id] === opt
                        ? "border-primary bg-primary/10 font-medium"
                        : "hover:bg-muted"
                    )}
                  >
                    <MathText text={opt} />
                  </button>
                ))}
              </div>
            </Card>
          )}
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
            >
              আগের
            </Button>
            {currentIdx < questions.length - 1 ? (
              <Button onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}>
                পরের
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                জমা দাও
              </Button>
            )}
          </div>
          {isOwner && (
            <Button variant="destructive" size="sm" onClick={handleEnd} disabled={ending} className="w-full gap-2">
              <StopCircle className="h-4 w-4" /> সবার জন্য Battle শেষ করো
            </Button>
          )}
        </div>
      )}

      {/* উত্তর দিয়ে দিয়েছে, battle এখনো ACTIVE — leaderboard দেখতে থাকবে */}
      {battle.status === "ACTIVE" && hasSubmitted && (
        <div className="space-y-4">
          <Card className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-medium">তুমি জমা দিয়েছো! স্কোর: {myParticipant?.score}/{questions.length}</p>
              <p className="text-xs text-muted-foreground">অন্যরা এখনো উত্তর দিচ্ছে, লাইভ র‍্যাংকিং দেখো</p>
            </div>
          </Card>
          <LeaderboardCard participants={sortedLeaderboard} currentUserId={currentUserId} />
          {isOwner && (
            <Button variant="destructive" size="sm" onClick={handleEnd} disabled={ending} className="w-full gap-2">
              <StopCircle className="h-4 w-4" /> সবার জন্য Battle শেষ করো
            </Button>
          )}
        </div>
      )}

      {/* COMPLETED অবস্থা */}
      {battle.status === "COMPLETED" && (
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <Trophy className="mx-auto mb-2 h-10 w-10 text-amber-600 dark:text-amber-400" />
            <p className="font-bold">Battle শেষ হয়ে গেছে!</p>
          </Card>
          <LeaderboardCard participants={sortedLeaderboard} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  );
}

function LeaderboardCard({
  participants,
  currentUserId,
}: {
  participants: Participant[];
  currentUserId: string;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" /> লাইভ লিডারবোর্ড
      </h2>
      <div className="space-y-1.5">
        {participants.map((p, idx) => (
          <div
            key={p.id}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
              p.userId === currentUserId ? "bg-primary/10 font-medium" : "bg-muted/40"
            )}
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 justify-center">
                {idx + 1}
              </Badge>
              <span>{p.user.name}</span>
              {!p.submittedAt && <span className="text-xs text-muted-foreground">(দিচ্ছে...)</span>}
            </div>
            <span className="font-semibold">{p.score}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
