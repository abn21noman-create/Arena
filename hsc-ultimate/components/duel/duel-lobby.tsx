"use client";

// ===================================================================
// Duel Lobby — নতুন Challenge তৈরি করা ও Public Lobby তে থাকা Duel এ যোগ দেওয়া
// -------------------------------------------------------------------
// Polling: প্রতি ৫ সেকেন্ডে lobby রিফ্রেশ হয়, এবং নিজের active duel পাওয়া
// গেলে স্বয়ংক্রিয়ভাবে সেই duel পেজে রিডাইরেক্ট হয়ে যায়।
// ===================================================================
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Swords, Loader2, Trophy, History, FileText } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";

interface Subject {
  id: string;
  name: string;
  nameEn: string;
  colorHex: string;
}

interface OpenDuel {
  id: string;
  subject: Subject;
  challenger: { id: string; name: string; level: number };
  createdAt: string;
}

interface PreselectedCustomSet {
  id: string;
  title: string;
  questionCount: number;
}

const POLL_INTERVAL_MS = 5000;

export function DuelLobby({
  subjects,
  preselectedCustomSet = null,
}: {
  subjects: Subject[];
  preselectedCustomSet?: PreselectedCustomSet | null;
}) {
  const router = useRouter();
  const [openDuels, setOpenDuels] = useState<OpenDuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadLobby = useCallback(async () => {
    try {
      const res = await fetch("/api/duel");
      const data = await res.json();
      if (res.ok) {
        setOpenDuels(data.openDuels ?? []);
        // নিজের কোনো active/waiting duel থাকলে সরাসরি সেই পেজে নিয়ে যাওয়া হচ্ছে
        if (data.myActiveDuel) {
          router.push(`/duel/${data.myActiveDuel.id}`);
          return;
        }
      }
    } catch {
      // silent fail — পোলিং, একবার fail হলেও পরের বার আবার চেষ্টা হবে
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadLobby();
    const interval = setInterval(() => void loadLobby(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadLobby]);

  async function handleCreate(subjectId: string) {
    if (creatingFor) return;
    setCreatingFor(subjectId);
    try {
      const res = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Duel তৈরি করা যায়নি");
        return;
      }
      toast.success("⚔️ Duel Challenge তৈরি হয়েছে! প্রতিদ্বন্দ্বীর অপেক্ষা করো");
      router.push(`/duel/${data.duel.id}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setCreatingFor(null);
    }
  }

  async function handleCreateWithCustomSet() {
    if (creatingCustom || !preselectedCustomSet) return;
    setCreatingCustom(true);
    try {
      const res = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customSetId: preselectedCustomSet.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Duel তৈরি করা যায়নি");
        return;
      }
      toast.success("⚔️ Duel Challenge তৈরি হয়েছে! লিংক শেয়ার করে বন্ধুকে ডাকো");
      router.push(`/duel/${data.duel.id}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setCreatingCustom(false);
    }
  }

  async function handleJoin(duelId: string) {
    if (joiningId) return;
    setJoiningId(duelId);
    try {
      const res = await fetch(`/api/duel/${duelId}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "যোগ দেওয়া যায়নি");
        return;
      }
      toast.success("⚔️ Duel শুরু হয়েছে!");
      router.push(`/duel/${duelId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Swords className="h-6 w-6 text-primary" />
              কুইজ ডুয়েল
            </h1>
            <p className="text-sm text-muted-foreground">
              বন্ধুর সাথে ১-বনাম-১ MCQ প্রতিযোগিতায় নামো
            </p>
          </div>
        </div>
        <Button render={<Link href="/duel/history" />} variant="outline" size="sm" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            হিস্ট্রি
          </Button>
      </div>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Quiz Duel আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-800 to-fuchsia-900 p-5 mb-6 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-36 w-36 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <Swords className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">১-বনাম-১ রিয়েল-টাইম MCQ ডুয়েল</p>
            <p className="text-sm opacity-90">
              {openDuels.length > 0
                ? `${openDuels.length}টা ওপেন লবিতে অপেক্ষা করছে`
                : "নতুন Challenge তৈরি করে শুরু করো"}
            </p>
          </div>
        </div>
      </div>

      {/* নিজের CustomQuestionSet দিয়ে Duel (ছবি আপলোড → Custom Question Set
          Dashboard থেকে "Duel চ্যালেঞ্জ" বাটনে ক্লিক করে এলে দেখানো হয়) */}
      {preselectedCustomSet && (
        <Card className="mb-6 border-violet-500/30 bg-violet-500/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <div>
              <p className="text-sm font-semibold">{preselectedCustomSet.title}</p>
              <p className="text-xs text-muted-foreground">
                {preselectedCustomSet.questionCount}টা MCQ — তোমার নিজের তৈরি প্রশ্ন দিয়ে
                বন্ধুকে চ্যালেঞ্জ করো
              </p>
            </div>
          </div>
          <Button onClick={handleCreateWithCustomSet} disabled={creatingCustom} className="w-full gap-2">
            {creatingCustom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
            {creatingCustom ? "তৈরি হচ্ছে..." : "এই সেট দিয়ে Duel Challenge বানাও"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            নিজের প্রশ্ন সেট দিয়ে বানানো Duel পাবলিক লবিতে দেখানো হয় না — লিংক
            কপি করে সরাসরি বন্ধুকে পাঠাতে হবে
          </p>
        </Card>
      )}

      {/* Create Challenge (Subject question bank) */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">
            {preselectedCustomSet ? "অথবা সাবজেক্ট থেকে Challenge তৈরি করো" : "নতুন Challenge তৈরি করো"}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          একটা সাবজেক্ট বেছে নাও — ১০টা এলোমেলো MCQ প্রশ্ন দিয়ে Duel শুরু হবে
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subjects.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              size="sm"
              disabled={creatingFor !== null}
              onClick={() => handleCreate(s.id)}
              className="justify-start gap-1.5 h-auto py-2"
            >
              {creatingFor === s.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              ) : (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.colorHex }}
                />
              )}
              <span className="truncate text-xs">{s.name}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Open Lobby */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          চ্যালেঞ্জের অপেক্ষায় থাকা Duel সমূহ
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : openDuels.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            এই মুহূর্তে কেউ Duel Challenge খুলে রাখেনি — উপরে থেকে নিজেই একটা তৈরি করো!
          </Card>
        ) : (
          <StaggerGroup className="space-y-2" staggerDelay={0.05}>
            {openDuels.map((d) => (
              <StaggerItem key={d.id} direction="left">
                <Card className="p-3.5 flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: d.subject.colorHex }}
                  >
                    {d.subject.nameEn.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.challenger.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        লেভেল {d.challenger.level}
                      </Badge>
                      {d.subject.name}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={joiningId !== null}
                    onClick={() => handleJoin(d.id)}
                    className="gap-1.5 shrink-0"
                  >
                    {joiningId === d.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Swords className="h-3.5 w-3.5" />
                    )}
                    গ্রহণ করো
                  </Button>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}
