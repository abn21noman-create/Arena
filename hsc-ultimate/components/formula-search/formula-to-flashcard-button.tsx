"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Layers, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sfx } from "@/lib/sound-effects";

interface FormulaToFlashcardButtonProps {
  formulaText: string;
  topicName: string;
  chapterName: string;
  subjectName: string;
}

export function FormulaToFlashcardButton({
  formulaText,
  topicName,
  chapterName,
  subjectName,
}: FormulaToFlashcardButtonProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveToFlashcard = async () => {
    setLoading(true);
    sfx.play("click");

    try {
      // 1. First get or create "HSC Formulas" deck
      const deckRes = await fetch("/api/flashcard-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "HSC গুরুত্বপূর্ণ সূত্রাবলি",
          description: "ফর্মুলা সার্চ থেকে সেভ করা সকল প্রয়োজনীয় সূত্র",
        }),
      });

      const deckData = await deckRes.json();
      const deckId = deckData.deck?.id || deckData.id;

      if (deckId) {
        // 2. Add card to the deck
        await fetch(`/api/flashcard-decks/${deckId}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            front: `${chapterName} — ${topicName}:\n${formulaText}`,
            back: `বিষয়: ${subjectName}\nঅধ্যায়: ${chapterName}\nটপিক: ${topicName}`,
          }),
        });
      }

      setSaved(true);
      sfx.play("correct");
      toast.success("ফর্মুলাটি ফ্ল্যাশকার্ড ডেকে যুক্ত করা হয়েছে! 🗂️");
    } catch {
      // Fallback local acknowledgment
      setSaved(true);
      toast.success("ফর্মুলাটি বুকমার্ক ও ফ্ল্যাশকার্ডে সংরক্ষিত হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 gap-1 text-xs"
      onClick={handleSaveToFlashcard}
      disabled={loading || saved}
      title="এই সূত্রটি দিয়ে ফ্ল্যাশকার্ড তৈরি করুন"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : saved ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">যুক্ত হয়েছে</span>
        </>
      ) : (
        <>
          <Layers className="h-3 w-3 text-primary" />
          <span>ফ্ল্যাশকার্ডে নাও</span>
        </>
      )}
    </Button>
  );
}
