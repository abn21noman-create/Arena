"use client";

// ===================================================================
// Flashcard Review Runner — Anki-স্টাইল flip card + SM-2 রেটিং বাটন
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Loader2, RotateCcw, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewRating } from "@/lib/spaced-repetition";
import { showNewBadgeToasts } from "@/lib/badge-toast";
import { OcclusionViewer } from "@/components/flashcards/occlusion-viewer";
import type { OcclusionBox } from "@/lib/image-occlusion";
import { sfx } from "@/lib/sound-effects";

interface DueCard {
  id: string;
  front: string;
  back: string;
  cardType?: "BASIC" | "CLOZE" | "IMAGE_OCCLUSION";
  imageUrl?: string | null;
  occlusionBoxes?: OcclusionBox[] | null;
}

const RATING_BUTTONS: {
  value: ReviewRating;
  label: string;
  color: string;
}[] = [
  { value: "again", label: "আবার", color: "bg-red-500 hover:bg-red-600" },
  { value: "hard", label: "কঠিন", color: "bg-orange-500 hover:bg-orange-600" },
  { value: "good", label: "মোটামুটি", color: "bg-blue-500 hover:bg-blue-600" },
  { value: "easy", label: "সহজ", color: "bg-violet-500 hover:bg-violet-600" },
];

export function ReviewRunner({ deckId }: { deckId: string }) {
  const [loading, setLoading] = useState(true);
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadDueCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcard-decks/${deckId}/due`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "কার্ড লোড করা যায়নি");
        return;
      }

      if (data.cards.length === 0) {
        setError("আজকের জন্য কোনো কার্ড due নেই। পরে আবার এসো!");
        return;
      }

      setDeckName(data.deckName);
      setCards(data.cards);
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    void loadDueCards();
  }, [loadDueCards]);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;
  const isDone = cards.length > 0 && currentIndex >= cards.length;

  async function handleRate(rating: ReviewRating) {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    if (rating === "easy" || rating === "good") {
      sfx.play("correct");
    } else {
      sfx.play("incorrect");
    }

    try {
      const res = await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error("রিভিউ সেভ করা যায়নি");
        return;
      }

      setTotalXp((xp) => xp + data.xpEarned);
      showNewBadgeToasts(data.newBadges);
      setIsFlipped(false);

      if (isLastCard) {
        sfx.play("levelUp");
        setCurrentIndex((i) => i + 1); // done state এ যাবে
      } else {
        setCurrentIndex((i) => i + 1);
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">কার্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button render={<Link href={`/flashcards/${deckId}`} />} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            ডেকে ফিরে যাও
          </Button>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <PartyPopper className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">দারুণ! রিভিউ শেষ 🎉</h2>
        <p className="text-muted-foreground mb-1">
          তুমি {cards.length}টি কার্ড রিভিউ করেছো
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-6">
          +{totalXp} XP অর্জিত হয়েছে
        </p>
        <div className="flex gap-3">
          <Button render={<Link href={`/flashcards/${deckId}`} className="flex-1" />} variant="outline" className="w-full">
              ডেকে ফিরে যাও
            </Button>
          <Button render={<Link href="/flashcards" className="flex-1" />} className="w-full">সব ডেক</Button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/flashcards/${deckId}`} className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{deckName}</p>
          <p className="text-sm font-medium">
            {currentIndex + 1} / {cards.length}
          </p>
        </div>
      </div>

      <Progress value={(currentIndex / cards.length) * 100} className="h-1.5 mb-8" />

      {/* Flip Card অথবা Image Occlusion Viewer */}
      {currentCard.cardType === "IMAGE_OCCLUSION" && currentCard.imageUrl ? (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            {isFlipped ? "উত্তর দেখানো হচ্ছে" : "ঢাকা অংশে কী আছে মনে করার চেষ্টা করো"}
          </p>
          <div
            className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            onClick={() => setIsFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? "উত্তর ঢেকে দাও" : "উত্তর দেখাও"}
            onKeyDown={(e) => {
              // কীবোর্ড অ্যাক্সেসিবিলিটি — Enter/Space চাপলে ছবি ফ্লিপ হবে
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsFlipped((f) => !f);
              }
            }}
          >
            <OcclusionViewer
              imageUrl={currentCard.imageUrl}
              boxes={currentCard.occlusionBoxes ?? []}
              isRevealed={isFlipped}
            />
          </div>
        </div>
      ) : (
        <div className="perspective-distant mb-6" style={{ perspective: "1200px" }}>
          <motion.div
            className="relative w-full h-64 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setIsFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? "কার্ড উল্টাও (প্রশ্ন দেখাও)" : "কার্ড উল্টাও (উত্তর দেখাও)"}
            onKeyDown={(e) => {
              // কীবোর্ড অ্যাক্সেসিবিলিটি — Enter/Space চাপলে কার্ড ফ্লিপ হবে
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsFlipped((f) => !f);
              }
            }}
          >
            {/* Front */}
            <Card
              className="absolute inset-0 flex items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div>
                <p className="text-xs text-muted-foreground mb-3">
                  {currentCard.cardType === "CLOZE"
                    ? "ফাঁকা পূরণ করো (ক্লিক করো উত্তর দেখতে)"
                    : "প্রশ্ন (ক্লিক করো উত্তর দেখতে)"}
                </p>
                <p className="text-lg font-medium leading-relaxed">{currentCard.front}</p>
              </div>
            </Card>

            {/* Back */}
            <Card
              className="absolute inset-0 flex items-center justify-center p-8 text-center bg-muted/50"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div>
                <p className="text-xs text-muted-foreground mb-3">
                  {currentCard.cardType === "CLOZE" ? "সম্পূর্ণ উত্তর" : "উত্তর"}
                </p>
                <p className="text-lg font-medium leading-relaxed">{currentCard.back}</p>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="flip-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              className="w-full gap-2"
              size="lg"
              variant="outline"
              onClick={() => setIsFlipped(true)}
            >
              <RotateCcw className="h-4 w-4" />
              উত্তর দেখাও
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="rating-btns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-4 gap-2"
          >
            {RATING_BUTTONS.map((btn) => (
              <Button
                key={btn.value}
                className={cn("text-white flex-col h-auto py-3 gap-1", btn.color)}
                disabled={submitting}
                onClick={() => handleRate(btn.value)}
              >
                <span className="text-xs">{btn.label}</span>
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
