"use client";

// ===================================================================
// Study Group Dashboard — Habitica-অনুপ্রাণিত Party System UI
// -------------------------------------------------------------------
// দুইটা অবস্থা:
// ১. ইউজার কোনো গ্রুপে নেই -> Create/Join ফর্ম দেখানো হয়
// ২. ইউজার গ্রুপে আছে -> সদস্য র‍্যাংকিং, সাপ্তাহিক সম্মিলিত লক্ষ্যের
//    progress bar, ইনভাইট কোড শেয়ার, Leave বাটন
// ===================================================================
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import {
  ArrowLeft,
  Users,
  Loader2,
  Crown,
  Copy,
  LogOut,
  Target,
  Plus,
  DoorOpen,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberData {
  userId: string;
  role: "OWNER" | "MEMBER";
  weeklyXpContributed: number;
  user: { id: string; name: string; xp: number; level: number };
}

// Reading Room থিমের emoji lookup — lib/reading-room.ts (server-only,
// Prisma import করে) এর বদলে এখানে locally define করা হয়েছে, ঠিক
// reading-room-dashboard.tsx এর একই প্যাটার্ন অনুসরণ করে (client
// component এ server lib import করলে bundle এ Prisma চলে আসত)
const ROOM_EMOJI: Record<string, string> = {
  LOFI_CAFE: "🎧",
  DARK_ACADEMIA: "🕯️",
  COZY_LIBRARY: "📚",
  RAINY_WINDOW: "🌧️",
  SILENT_HALL: "🤫",
};

const ACTIVITY_EMOJI: Record<string, string> = {
  SELF_STUDY: "📖",
  CLASS: "🎓",
  BREAK: "☕",
};

interface GroupReadingStatus {
  userId: string;
  name: string;
  isInReadingRoom: boolean;
  room: string | null;
  activity: string | null;
  goal: string | null;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  weeklyGoalXp: number;
  members: MemberData[];
}

interface MembershipData {
  userId: string;
  role: "OWNER" | "MEMBER";
  group: GroupData;
}

export function StudyGroupDashboard() {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Create form state
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  // Join form state
  const [inviteCode, setInviteCode] = useState("");

  // Study Group কে "live session" মোডে upgrade — গ্রুপের সদস্যরা এখন কে
  // কোন Reading Room এ পড়ছে তা এখানে দেখানো হয় (polling-based, Quiz
  // Battle এর প্রমাণিত প্যাটার্ন)
  const [readingStatus, setReadingStatus] = useState<GroupReadingStatus[]>([]);

  const loadMembership = useCallback(async () => {
    try {
      const res = await fetch("/api/study-group");
      const data = await res.json();
      if (res.ok) setMembership(data.membership);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReadingStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/study-group/reading-room-status");
      const data = await res.json();
      if (res.ok) setReadingStatus(data.members ?? []);
    } catch {
      // silent fail — এই তথ্য না পেলেও বাকি dashboard কাজ করবে
    }
  }, []);

  useEffect(() => {
    void loadMembership();
  }, [loadMembership]);

  // গ্রুপে থাকা অবস্থায় প্রতি ৩০ সেকেন্ডে Reading Room status রিফ্রেশ
  // (Reading Room heartbeat এর ২৫s interval এর কাছাকাছি রাখা হয়েছে)
  useEffect(() => {
    if (!membership) return;
    void loadReadingStatus();
    const interval = setInterval(() => void loadReadingStatus(), 30_000);
    return () => clearInterval(interval);
  }, [membership, loadReadingStatus]);

  async function handleCreate() {
    if (!groupName.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/study-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, description: groupDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "গ্রুপ তৈরি করা যায়নি");
        return;
      }
      toast.success("🎉 গ্রুপ তৈরি হয়েছে! বন্ধুদের ইনভাইট কোড শেয়ার করো");
      void loadMembership();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/study-group/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "গ্রুপে যোগ দেওয়া যায়নি");
        return;
      }
      toast.success(`🎉 "${data.group.name}" গ্রুপে যোগ দিয়েছো!`);
      void loadMembership();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/study-group/leave", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "গ্রুপ ছাড়া যায়নি");
        return;
      }
      toast.success("তুমি গ্রুপ ছেড়ে দিয়েছো");
      setMembership(null);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  }

  async function copyInviteCode(code: string) {
    const ok = await copyToClipboard(code);
    if (ok) toast.success("ইনভাইট কোড কপি হয়েছে!");
    else toast.error("কপি করা যায়নি, ম্যানুয়ালি লিখে নাও");
  }

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
        <Link href="/dashboard" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            স্টাডি গ্রুপ
          </h1>
          <p className="text-sm text-muted-foreground">
            বন্ধুদের সাথে দল বেঁধে একসাথে সাপ্তাহিক লক্ষ্য অর্জন করো
          </p>
        </div>
      </div>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Study Group আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-700 to-fuchsia-800 p-5 mb-6 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Users className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">দল বেঁধে একসাথে এগিয়ে যাও</p>
            <p className="text-sm opacity-90">
              {membership ? "তুমি একটা গ্রুপের সদস্য" : "নতুন গ্রুপ তৈরি করো অথবা কোডে যোগ দাও"}
            </p>
          </div>
        </div>
      </div>

      {!membership ? (
        <div className="space-y-5">
          {/* Create Group */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">নতুন গ্রুপ তৈরি করো</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="group-name" className="text-xs mb-1.5 block">
                  গ্রুপের নাম
                </Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="যেমন: HSC 2028 Physics Squad"
                  maxLength={40}
                />
              </div>
              <div>
                <Label htmlFor="group-desc" className="text-xs mb-1.5 block">
                  বিবরণ (ঐচ্ছিক)
                </Label>
                <Input
                  id="group-desc"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="আমরা একসাথে HSC এর জন্য প্রস্তুতি নিচ্ছি"
                  maxLength={200}
                />
              </div>
              <Button onClick={handleCreate} disabled={actionLoading || !groupName.trim()} className="w-full gap-2">
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                গ্রুপ তৈরি করো
              </Button>
            </div>
          </Card>

          {/* Join Group */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DoorOpen className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">ইনভাইট কোড দিয়ে যোগ দাও</h2>
            </div>
            <div className="flex gap-2">
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ইনভাইট কোড পেস্ট করো"
                aria-label="ইনভাইট কোড"
              />
              <Button onClick={handleJoin} disabled={actionLoading || !inviteCode.trim()} variant="outline">
                যোগ দাও
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Group Header */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="font-bold text-lg">{membership.group.name}</h2>
                {membership.group.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {membership.group.description}
                  </p>
                )}
              </div>
              {membership.role === "OWNER" && (
                <Badge className="gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 shrink-0">
                  <Crown className="h-3 w-3" />
                  অ্যাডমিন
                </Badge>
              )}
            </div>

            {/* Weekly Goal Progress */}
            {(() => {
              const totalXp = membership.group.members.reduce(
                (sum, m) => sum + m.weeklyXpContributed,
                0
              );
              const goal = membership.group.weeklyGoalXp;
              const pct = Math.min(100, Math.round((totalXp / goal) * 100));
              return (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      সাপ্তাহিক গ্রুপ লক্ষ্য
                    </span>
                    <span>
                      {totalXp} / {goal} XP
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  {pct >= 100 && (
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-1.5">
                      🎉 এই সপ্তাহের লক্ষ্য পূরণ হয়ে গেছে!
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={membership.group.inviteCode}
                className="text-xs h-8"
                aria-label="তোমার গ্রুপের ইনভাইট কোড"
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyInviteCode(membership.group.inviteCode)}
                      aria-label="ইনভাইট কোড কপি করো"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>ইনভাইট কোড কপি করো</TooltipContent>
              </Tooltip>
            </div>
          </Card>

          {/* Reading Room এ যোগ দেওয়ার শর্টকাট — কেউ সদস্য অনলাইনে থাকলে বা না থাকলেও */}
          <Link href="/reading-room">
            <Card className="p-3 flex items-center justify-between gap-3 hover-lift cursor-pointer">
              <span className="text-sm flex items-center gap-2">
                <Radio className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                {readingStatus.some((r) => r.isInReadingRoom)
                  ? `${readingStatus.filter((r) => r.isInReadingRoom).length} জন সদস্য এখন Reading Room এ আছে`
                  : "Reading Room এ গিয়ে একসাথে পড়ো"}
              </span>
              <span className="text-xs text-primary font-medium">যাও →</span>
            </Card>
          </Link>

          {/* Member Ranking */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              সদস্য র‍্যাংকিং (এই সপ্তাহের XP অনুযায়ী)
            </h3>
            <div className="space-y-2">
              {membership.group.members.map((m, idx) => {
                const readingInfo = readingStatus.find((r) => r.userId === m.userId);
                return (
                  <Card
                    key={m.userId}
                    className={cn(
                      "p-3 flex items-center gap-3",
                      m.userId === membership.userId && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate flex items-center gap-1.5">
                        {m.user.name}
                        {m.userId === membership.userId && (
                          <span className="text-primary text-xs">(তুমি)</span>
                        )}
                        {m.role === "OWNER" && <Crown className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                      </p>
                      <p className="text-xs text-muted-foreground">লেভেল {m.user.level}</p>
                      {readingInfo?.isInReadingRoom && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1 mt-0.5">
                          <Radio className="h-3 w-3 animate-pulse" />
                          {readingInfo.room && ROOM_EMOJI[readingInfo.room]}{" "}
                          {readingInfo.activity && ACTIVITY_EMOJI[readingInfo.activity]}{" "}
                          এখন Reading Room এ পড়ছে
                          {readingInfo.goal && ` — ${readingInfo.goal}`}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-bold text-primary shrink-0">
                      {m.weeklyXpContributed} XP
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLeave}
            disabled={actionLoading}
            className="w-full gap-2 text-destructive hover:text-destructive"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            গ্রুপ ছেড়ে দাও
          </Button>
        </div>
      )}
    </div>
  );
}
