"use client";

// ===================================================================
// Quiz Battle তৈরি করার ফর্ম — Subject/Custom Set বেছে, room তৈরি করে
// owner কে সাথে সাথে room পেজে পাঠায়
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { clampNumberInput } from "@/lib/clamp-number-input";
import { ArrowLeft, Swords, Loader2, FileText } from "lucide-react";

const MAX_PLAYERS_MIN = 2;
const MAX_PLAYERS_MAX = 50;
const MAX_PLAYERS_DEFAULT = 30;

interface Subject {
  id: string;
  name: string;
}

interface PreselectedCustomSet {
  id: string;
  title: string;
  questionCount: number;
}

export function QuizBattleCreateForm({
  subjects,
  preselectedCustomSet,
}: {
  subjects: Subject[];
  preselectedCustomSet: PreselectedCustomSet | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  // টাইপ করার সময় string হিসেবে রাখা হয় (খালি করে নতুন সংখ্যা লেখার
  // সময় controlled input যেন আগের ভ্যালুতে জোর করে ফিরে না যায়) —
  // চূড়ান্ত সংখ্যা `onBlur` এ ও submit করার সময় clamp করা হয়
  const [maxPlayersInput, setMaxPlayersInput] = useState(String(MAX_PLAYERS_DEFAULT));
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (creating) return;
    const maxPlayers = clampNumberInput(
      maxPlayersInput,
      MAX_PLAYERS_MIN,
      MAX_PLAYERS_MAX,
      MAX_PLAYERS_DEFAULT
    );
    setMaxPlayersInput(String(maxPlayers)); // ইউজারকে চূড়ান্ত clamp করা মান দেখানো
    setCreating(true);
    try {
      const res = await fetch("/api/quiz-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Quiz Battle",
          sourceType: preselectedCustomSet ? "custom" : "question_bank",
          customSetId: preselectedCustomSet?.id,
          subjectId: preselectedCustomSet ? undefined : subjectId,
          maxPlayers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Battle তৈরি করা যায়নি");
        return;
      }
      toast.success("🎮 Battle room তৈরি হয়েছে!");
      router.push(`/quiz-battle/${data.battle.id}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Button render={<Link href="/quiz-battle" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Swords className="h-5 w-5 text-red-600 dark:text-red-400" /> নতুন Battle তৈরি করো
        </h1>
      </div>

      <Card className="space-y-4 p-5">
        <div>
          <Label htmlFor="battle-title">Battle এর নাম</Label>
          <Input
            id="battle-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: ক্লাসের ফিজিক্স চ্যালেঞ্জ"
          />
        </div>

        {preselectedCustomSet ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <div>
              <p className="text-sm font-medium">{preselectedCustomSet.title}</p>
              <p className="text-xs text-muted-foreground">{preselectedCustomSet.questionCount}টা MCQ</p>
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="subject">সাবজেক্ট (১০টা এলোমেলো MCQ বাছাই হবে)</Label>
            {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value (id)
                দেখায়, নাম না — `items` prop দিয়ে ম্যাপিং দেওয়া হয়েছে */}
            <Select
              value={subjectId}
              onValueChange={(v) => v && setSubjectId(v)}
              items={subjects.map((s) => ({ value: s.id, label: s.name }))}
            >
              <SelectTrigger id="subject">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="max-players">সর্বোচ্চ প্লেয়ার সংখ্যা</Label>
          <Input
            id="max-players"
            type="number"
            min={MAX_PLAYERS_MIN}
            max={MAX_PLAYERS_MAX}
            value={maxPlayersInput}
            onChange={(e) => setMaxPlayersInput(e.target.value)}
            onBlur={(e) =>
              setMaxPlayersInput(
                String(clampNumberInput(e.target.value, MAX_PLAYERS_MIN, MAX_PLAYERS_MAX, MAX_PLAYERS_DEFAULT))
              )
            }
          />
        </div>

        <Button onClick={handleCreate} disabled={creating} className="w-full gap-2">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
          {creating ? "তৈরি হচ্ছে..." : "Room তৈরি করো"}
        </Button>
      </Card>
    </div>
  );
}
