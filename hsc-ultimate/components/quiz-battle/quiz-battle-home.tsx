"use client";

// ===================================================================
// Quiz Battle হোম — Room code দিয়ে যোগদান, অথবা নতুন Battle বানানোর লিংক
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Swords, DoorOpen, Plus, History, Loader2 } from "lucide-react";

export function QuizBattleHome() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleJoin() {
    if (!roomCode.trim() || joining) return;
    setJoining(true);
    try {
      const res = await fetch("/api/quiz-battle/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Battle এ যোগ দেওয়া যায়নি");
        return;
      }
      toast.success("🎮 Battle এ যোগ দিয়েছো!");
      router.push(`/quiz-battle/${data.battle.id}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Swords className="h-6 w-6 text-red-600 dark:text-red-400" /> কুইজ ব্যাটল
          </h1>
          <p className="text-sm text-muted-foreground">Room code দিয়ে বন্ধুদের সাথে MCQ প্রতিযোগিতা</p>
        </div>
      </div>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Quiz Battle আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-800 to-violet-900 p-5 mb-4 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Swords className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">গ্রুপে মজার MCQ প্রতিযোগিতা</p>
            <p className="text-sm opacity-90">Room code শেয়ার করে বন্ধুদের সাথে খেলো</p>
          </div>
        </div>
      </div>

      <Card className="mb-4 space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <DoorOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Room Code দিয়ে যোগ দাও
        </h2>
        <div>
          <Label htmlFor="room-code">৬-অক্ষরের কোড</Label>
          <Input
            id="room-code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="যেমন: ABC123"
            maxLength={6}
            className="text-center text-lg tracking-widest"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleJoin();
            }}
          />
        </div>
        <Button onClick={handleJoin} disabled={!roomCode.trim() || joining} className="w-full">
          {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          যোগ দাও
        </Button>
      </Card>

      <Card className="mb-4 flex items-center justify-between p-5">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <Plus className="h-5 w-5 text-violet-600 dark:text-violet-400" /> নতুন Battle বানাও
          </h2>
          <p className="text-sm text-muted-foreground">সাবজেক্ট ব্যাংক বা নিজের প্রশ্ন সেট দিয়ে</p>
        </div>
        <Button render={<Link href="/quiz-battle/create" />} variant="outline">তৈরি করো</Button>
      </Card>

      <Link href="/quiz-battle/history">
        <Card className="flex items-center gap-3 p-4 hover-lift cursor-pointer">
          <History className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">আমার Battle History</span>
        </Card>
      </Link>
    </div>
  );
}
