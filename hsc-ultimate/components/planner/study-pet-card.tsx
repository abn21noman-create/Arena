"use client";

// ===================================================================
// Study Pet Card — Virtual Pet Pomodoro Gamification UI
// -------------------------------------------------------------------
// Forest/Study Bunny-অনুপ্রাণিত: পেঁচা মাসকট যা পোমোডোরো সেশন সম্পন্ন করলে
// বেড়ে ওঠে (৫টা evolution stage)। PomodoroTimer কম্পোনেন্ট থেকে
// window custom event ("study-pet-fed") পাঠিয়ে রিফ্রেশ ট্রিগার করা হয়।
// ===================================================================
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Pencil, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PetStage = "EGG" | "HATCHLING" | "OWLET" | "ADULT" | "SAGE";

interface PetData {
  id: string;
  name: string;
  stage: PetStage;
  carePoints: number;
  happiness: number;
  totalSessions: number;
}

interface ProgressData {
  isMaxStage: boolean;
  nextStage: PetStage | null;
  pointsNeeded: number;
  progressPct: number;
}

const STAGE_INFO: Record<PetStage, { label: string; emoji: string; description: string }> = {
  EGG: { label: "ডিম", emoji: "🥚", description: "নিয়মিত পোমোডোরো সেশন দিয়ে এটাকে ফোটাও!" },
  HATCHLING: { label: "ছানা পেঁচা", emoji: "🐣", description: "সদ্য ডিম ফুটে বের হয়েছে!" },
  OWLET: { label: "কিশোর পেঁচা", emoji: "🦉", description: "ডানা গজাতে শুরু করেছে!" },
  ADULT: { label: "পূর্ণবয়স্ক পেঁচা", emoji: "🦉", description: "পূর্ণবয়স্ক জ্ঞানী পেঁচা!" },
  SAGE: { label: "ঋষি পেঁচা", emoji: "🦉", description: "সর্বোচ্চ স্তরে পৌঁছে গেছে!" },
};

const STAGE_EMOJI_SIZE: Record<PetStage, string> = {
  EGG: "text-5xl",
  HATCHLING: "text-6xl",
  OWLET: "text-6xl",
  ADULT: "text-7xl",
  SAGE: "text-7xl",
};

export function StudyPetCard() {
  const [pet, setPet] = useState<PetData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const loadPet = useCallback(async () => {
    try {
      const res = await fetch("/api/study-pet");
      const data = await res.json();
      if (res.ok) {
        setPet(data.pet);
        setProgress(data.progress);
        setNameInput(data.pet.name);
      }
    } catch {
      // silent fail — পেট ডেটা optional এনরিচমেন্ট, মূল planner UI ব্লক করা ঠিক না
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPet();
    // PomodoroTimer সেশন সম্পন্ন করলে এই ইভেন্ট dispatch করে, তখন পেট রিফ্রেশ হবে
    const handler = () => void loadPet();
    window.addEventListener("study-pet-fed", handler);
    return () => window.removeEventListener("study-pet-fed", handler);
  }, [loadPet]);

  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || savingName) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/study-pet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "নাম পরিবর্তন করা যায়নি");
        return;
      }
      setPet(data.pet);
      setEditingName(false);
      toast.success("পেটের নাম পরিবর্তন হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSavingName(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-5 flex items-center justify-center h-full min-h-[220px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!pet || !progress) return null;

  const info = STAGE_INFO[pet.stage];

  return (
    <Card className="p-5 flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 mb-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        তোমার স্টাডি পেট
      </div>

      {/* নাম + এডিট */}
      {editingName ? (
        <div className="flex items-center gap-1.5 mb-2">
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={20}
            className="h-7 text-sm w-32"
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            autoFocus
            aria-label="স্টাডি পেটের নাম"
          />
          <Button
            size="icon"
            className="h-7 w-7"
            onClick={handleSaveName}
            disabled={savingName}
            aria-label="নাম সেভ করো"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditingName(true)}
          className="-mt-1 mb-1 flex min-h-8 items-center gap-1.5 rounded-md px-2 font-semibold transition-colors hover:bg-muted hover:text-primary"
          aria-label={`স্টাডি পেট ${pet.name}-এর নাম পরিবর্তন করো`}
        >
          {pet.name}
          <Pencil className="h-3 w-3 opacity-50" />
        </button>
      )}

      {/* Pet Emoji (evolution stage অনুযায়ী সাইজ বাড়ে) */}
      <div className={cn("mb-2 leading-none", STAGE_EMOJI_SIZE[pet.stage])}>{info.emoji}</div>
      <p className="text-xs font-medium text-primary mb-1">{info.label}</p>
      <p className="text-xs text-muted-foreground mb-3 px-2">{info.description}</p>

      {/* Happiness bar */}
      <div className="w-full mb-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-600 dark:text-rose-400" />
            সুখী
          </span>
          <span>{pet.happiness}%</span>
        </div>
        <Progress value={pet.happiness} className="h-1.5" />
      </div>

      {/* Evolution progress bar */}
      {!progress.isMaxStage && (
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>পরের ধাপ: {STAGE_INFO[progress.nextStage!].label}</span>
            <span>{progress.pointsNeeded} সেশন বাকি</span>
          </div>
          <Progress value={Math.max(0, progress.progressPct)} className="h-1.5" />
        </div>
      )}
      {progress.isMaxStage && (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          🏆 সর্বোচ্চ ধাপে পৌঁছে গেছো!
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        মোট {pet.totalSessions}টা ফোকাস সেশন সম্পন্ন হয়েছে
      </p>
    </Card>
  );
}
