"use client";

// ===================================================================
// Reading Room Dashboard — Virtual Study Room (Body Doubling)
// -------------------------------------------------------------------
// দুইটা মূল অবস্থা:
// ১. কোনো রুমে join করা নেই -> প্রি-সেট থিমড রুম লিস্ট (occupancy সহ)
//    বেছে নেওয়ার UI
// ২. একটা রুমে join করা আছে -> Active Room View (নিজের timer, activity
//    selector, goal caption, অন্য সবার presence card লিস্ট, ambient
//    sound toggle, leave বাটন)
//
// Presence + heartbeat polling: প্রতি ২৫ সেকেন্ডে heartbeat পাঠানো হয়
// (Quiz Battle/Duel এ প্রমাণিত প্যাটার্ন), সাথে সাথে presence লিস্টও
// রিফ্রেশ হয়। ট্যাব বন্ধ করার আগে sendBeacon দিয়ে leave কল করা হয়
// যাতে সেশন পরিষ্কারভাবে শেষ হয় (fallback: heartbeat miss হলে সার্ভার
// নিজে থেকেই stale সেশন auto-end করে দেয়)।
// ===================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Users,
  DoorOpen,
  Volume2,
  VolumeX,
  BookOpen,
  GraduationCap,
  Coffee,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playAmbientSound, stopAmbientSound, setAmbientVolume } from "@/lib/ambient-sound";
import { formatDurationBn } from "@/lib/format-duration";
import { SyncedPomodoroCard } from "@/components/reading-room/synced-pomodoro-card";

type RoomTheme = "LOFI_CAFE" | "DARK_ACADEMIA" | "COZY_LIBRARY" | "RAINY_WINDOW" | "SILENT_HALL";
type Activity = "SELF_STUDY" | "CLASS" | "BREAK";
type AmbientSoundType = "rain" | "cafe" | "fireplace" | "wind" | null;

interface RoomInfo {
  id: RoomTheme;
  name: string;
  emoji: string;
  description: string;
  ambientSound: AmbientSoundType;
  gradient: string;
  occupancy: number;
}

interface ActiveSessionData {
  id: string;
  room: RoomTheme;
  activity: Activity;
  goal: string | null;
  startedAt: string;
  lastHeartbeatAt: string;
  totalFocusSec: number;
}

interface PresenceItem {
  sessionId: string;
  userId: string;
  name: string;
  level: number;
  activity: Activity;
  goal: string | null;
  startedAt: string;
  isMe: boolean;
}

const ACTIVITY_INFO: Record<Activity, { label: string; emoji: string; icon: typeof BookOpen }> = {
  SELF_STUDY: { label: "একা পড়ছি", emoji: "📖", icon: BookOpen },
  CLASS: { label: "ক্লাস করছি", emoji: "🎓", icon: GraduationCap },
  BREAK: { label: "বিরতিতে আছি", emoji: "☕", icon: Coffee },
};

const HEARTBEAT_INTERVAL_MS = 25_000;
const GOAL_MAX_LENGTH = 100;

export function ReadingRoomDashboard() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSessionData | null>(null);
  const [joining, setJoining] = useState<RoomTheme | null>(null);
  const [presence, setPresence] = useState<PresenceItem[]>([]);
  const [goalDraft, setGoalDraft] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [displaySec, setDisplaySec] = useState(0);

  const activeSessionRef = useRef<ActiveSessionData | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/reading-room/rooms");
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms ?? []);
        setActiveSession(data.activeSession ?? null);
        if (data.activeSession) {
          setGoalDraft(data.activeSession.goal ?? "");
          setDisplaySec(data.activeSession.totalFocusSec ?? 0);
        }
      }
    } catch {
      // silent fail — নিচে empty state দেখানো হবে
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const loadPresence = useCallback(async (room: RoomTheme) => {
    try {
      const res = await fetch(`/api/reading-room/rooms/${room}/presence`);
      const data = await res.json();
      if (res.ok) setPresence(data.presence ?? []);
    } catch {
      // silent fail
    }
  }, []);

  // Heartbeat + presence polling loop — active session থাকলেই চলবে
  useEffect(() => {
    if (!activeSession) {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      return;
    }

    void loadPresence(activeSession.room);

    async function tick() {
      const current = activeSessionRef.current;
      if (!current) return;
      try {
        const res = await fetch("/api/reading-room/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: current.id }),
        });
        const data = await res.json();
        if (!res.ok || data.ended) {
          toast.info("তোমার সেশন মেয়াদ শেষ হয়ে গেছে — আবার join করো");
          setActiveSession(null);
          stopAmbientSound();
          return;
        }
        setActiveSession(data.session);
        setDisplaySec(data.session.totalFocusSec);
        void loadPresence(current.room);
      } catch {
        // network glitch — পরের tick এ আবার চেষ্টা হবে
      }
    }

    heartbeatIntervalRef.current = setInterval(() => void tick(), HEARTBEAT_INTERVAL_MS);
    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.id]);

  // ডিসপ্লে টাইমার — heartbeat এর মধ্যেও UI তে স্মুথভাবে সময় বাড়তে দেখানোর জন্য
  useEffect(() => {
    if (!activeSession) {
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
      return;
    }
    displayIntervalRef.current = setInterval(() => {
      setDisplaySec((s) => s + 1);
    }, 1000);
    return () => {
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
    };
    // ইচ্ছাকৃতভাবে শুধু id — activeSession.id বদলালেই (নতুন join/leave) interval
    // রিস্টার্ট করা উচিত, প্রতি heartbeat এ object বদলালে না (নাহলে count থেমে যাবে)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.id]);

  // ট্যাব/পেজ বন্ধ করার আগে sendBeacon দিয়ে leave — clean session end
  useEffect(() => {
    function handleBeforeUnload() {
      const current = activeSessionRef.current;
      if (!current) return;
      const blob = new Blob([JSON.stringify({ sessionId: current.id })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/reading-room/leave", blob);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  async function handleJoin(room: RoomTheme) {
    if (joining) return;
    setJoining(room);
    try {
      const res = await fetch("/api/reading-room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room, activity: "SELF_STUDY" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "রুমে যোগ দেওয়া যায়নি");
        return;
      }
      setActiveSession(data.session);
      setGoalDraft("");
      setDisplaySec(0);
      toast.success("রুমে স্বাগতম! ফোকাস শুরু করো 🎯");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setJoining(null);
    }
  }

  async function handleLeave() {
    if (!activeSession) return;
    const sessionId = activeSession.id;
    stopAmbientSound();
    setSoundEnabled(false);
    setActiveSession(null);
    try {
      const res = await fetch("/api/reading-room/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok && data.xpEarned > 0) {
        toast.success(`🎉 আজকের ফোকাস সেশন শেষ! +${data.xpEarned} XP`);
      } else {
        toast.info("রুম ছেড়ে দিয়েছ");
      }
      void loadRooms();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে — তবে রুম থেকে বের হয়ে গেছ");
    }
  }

  async function handleActivityChange(activity: Activity) {
    if (!activeSession) return;
    setActiveSession({ ...activeSession, activity });
    try {
      await fetch("/api/reading-room/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id, activity }),
      });
      void loadPresence(activeSession.room);
    } catch {
      // পরের heartbeat এ আবার sync হবে
    }
  }

  async function handleGoalSave() {
    if (!activeSession) return;
    try {
      await fetch("/api/reading-room/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id, goal: goalDraft }),
      });
      toast.success("লক্ষ্য সেভ হয়েছে");
      void loadPresence(activeSession.room);
    } catch {
      toast.error("লক্ষ্য সেভ করা যায়নি");
    }
  }

  function toggleSound() {
    const roomInfo = rooms.find((r) => r.id === activeSession?.room);
    if (soundEnabled) {
      stopAmbientSound();
      setSoundEnabled(false);
      return;
    }
    if (roomInfo?.ambientSound) {
      playAmbientSound(roomInfo.ambientSound, 0.5);
      setAmbientVolume(0.5);
      setSoundEnabled(true);
    } else {
      toast.info("এই রুমে কোনো ambient sound নেই — সম্পূর্ণ নীরব পরিবেশ");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeRoomInfo = rooms.find((r) => r.id === activeSession?.room);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b glass-nav sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="ড্যাশবোর্ডে ফিরে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              📚 রিডিং রুম
            </h1>
            <p className="text-xs text-muted-foreground">
              বন্ধুদের সাথে নীরবে একসাথে পড়াশোনা করো — কেউ একা নও
            </p>
          </div>
          <Button render={<Link href="/reading-room/leaderboard" />} variant="outline" size="sm" className="gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              লিডারবোর্ড
            </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {!activeSession ? (
          <>
            {/* glassmorphism hero banner — established প্যাটার্ন
                (nav-modules.ts এর Reading Room আইটেম গ্রেডিয়েন্ট) */}
            <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-fuchsia-700 to-fuchsia-900 p-5 mb-4 text-white">
              <div
                aria-hidden
                className="glass-hero-orb h-32 w-32 bg-white/20"
                style={{ top: "-2rem", right: "-1.5rem" }}
              />
              <div className="relative z-10 flex items-center gap-3">
                <span className="glass-chip flex h-11 w-11 items-center justify-center rounded-full text-xl">
                  📚
                </span>
                <div>
                  <p className="font-bold">নীরবে একসাথে ফোকাস করো</p>
                  <p className="text-sm opacity-90">
                    {rooms.reduce((s, r) => s + r.occupancy, 0)} জন এখন বিভিন্ন রুমে পড়ছে
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              একটা রুম বেছে নাও — অন্য শিক্ষার্থীরা যারা একই সময়ে পড়ছে,
              তাদের সাথে (কোনো ক্যামেরা/মাইক ছাড়াই) নীরবে একসাথে ফোকাস করো।
              এটা honor-system — নিজেকে জবাবদিহি রাখার একটা টুল।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className="p-5 hover-lift cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  role="button"
                  tabIndex={0}
                  onClick={() => void handleJoin(room.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void handleJoin(room.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl mb-3",
                      room.gradient
                    )}
                  >
                    {room.emoji}
                  </div>
                  <h3 className="font-semibold mb-1">{room.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {room.occupancy} জন এখানে
                    </Badge>
                    {joining === room.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs text-primary font-medium">join করো →</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* বাম দিক: নিজের সেশন কন্ট্রোল */}
            <Card className="p-5 lg:col-span-1 h-fit">
              <div
                className={cn(
                  "h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-3xl mb-3",
                  activeRoomInfo?.gradient
                )}
              >
                {activeRoomInfo?.emoji}
              </div>
              <h2 className="font-bold text-lg mb-1">{activeRoomInfo?.name}</h2>
              <p className="text-xs text-muted-foreground mb-4">{activeRoomInfo?.description}</p>

              <div className="text-center py-4 bg-muted/50 rounded-lg mb-4">
                <p className="text-xs text-muted-foreground mb-1">আজকের ফোকাস সময়</p>
                <p className="text-3xl font-bold tabular-nums">{formatDurationBn(displaySec)}</p>
              </div>

              <div className="space-y-2 mb-4">
                <Label className="text-xs">তুমি এখন কী করছ?</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(ACTIVITY_INFO) as Activity[]).map((act) => {
                    const info = ACTIVITY_INFO[act];
                    const Icon = info.icon;
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => void handleActivityChange(act)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          activeSession.activity === act
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="goal-input" className="text-xs">
                  আজকের লক্ষ্য (ঐচ্ছিক)
                </Label>
                <div className="flex gap-1.5">
                  <Input
                    id="goal-input"
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value.slice(0, GOAL_MAX_LENGTH))}
                    placeholder="যেমন: পদার্থবিজ্ঞান অধ্যায় ৩ শেষ করব"
                    className="text-sm"
                    maxLength={GOAL_MAX_LENGTH}
                  />
                  <Button size="sm" variant="outline" onClick={() => void handleGoalSave()}>
                    সেভ
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={toggleSound}
                  aria-label={soundEnabled ? "Ambient sound বন্ধ করো" : "Ambient sound চালু করো"}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5" />
                  )}
                  Ambient
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => void handleLeave()}
                >
                  <DoorOpen className="h-3.5 w-3.5" />
                  রুম ছাড়ো
                </Button>
              </div>
            </Card>

            {/* ডান দিক: এই মুহূর্তে কারা রুমে আছে (Presence লিস্ট) */}
            <div className="lg:col-span-2">
              <div className="mb-3">
                <SyncedPomodoroCard />
              </div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                এই মুহূর্তে {presence.length} জন এই রুমে পড়ছে
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presence.length === 0 ? (
                  <Card className="p-5 sm:col-span-2 text-center text-sm text-muted-foreground">
                    এখনো কেউ নেই — তুমিই প্রথম! কিছুক্ষণের মধ্যে আরও কেউ যোগ দিতে পারে।
                  </Card>
                ) : (
                  presence.map((p) => {
                    const info = ACTIVITY_INFO[p.activity];
                    return (
                      <Card
                        key={p.sessionId}
                        className={cn(
                          "p-4",
                          p.isMe && "ring-2 ring-primary"
                        )}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="font-medium text-sm">
                            {p.name} {p.isMe && <span className="text-xs text-muted-foreground">(তুমি)</span>}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            Lv.{p.level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {info.emoji} {info.label}
                        </p>
                        {p.goal && (
                          <p className="text-xs italic text-muted-foreground truncate">
                            🎯 {p.goal}
                          </p>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
