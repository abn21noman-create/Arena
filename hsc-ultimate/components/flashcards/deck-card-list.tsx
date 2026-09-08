"use client";

// ===================================================================
// Deck এর ভেতরের সব Flashcard এর লিস্ট (front/back প্রিভিউ + ডিলিট বাটন)
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Layers, Image as ImageIcon } from "lucide-react";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  cardType?: "BASIC" | "CLOZE" | "IMAGE_OCCLUSION";
  imageUrl?: string | null;
  dueDate: Date;
  repetitions: number;
}

export function DeckCardList({ cards }: { cards: FlashcardItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(cardId: string) {
    setDeletingId(cardId);
    try {
      const res = await fetch(`/api/flashcards/${cardId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("কার্ড ডিলিট করা যায়নি");
        return;
      }
      toast.success("কার্ড ডিলিট হয়েছে");
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setDeletingId(null);
    }
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          এই ডেকে এখনো কোনো কার্ড নেই। উপরের বাটন দিয়ে কার্ড যোগ করো।
        </p>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-2">
      {cards.map((card) => {
        const isDue = new Date(card.dueDate) <= now;
        return (
          <Card key={card.id} className="p-4 flex items-start justify-between gap-3">
            {card.cardType === "IMAGE_OCCLUSION" && card.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.imageUrl}
                alt=""
                className="h-14 w-14 rounded-md object-cover border shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              {card.cardType === "IMAGE_OCCLUSION" ? (
                <p className="text-sm font-medium truncate">ছবি-ঢাকা কার্ড</p>
              ) : (
                <>
                  <p className="text-sm font-medium truncate">{card.front}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {card.back}
                  </p>
                </>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {card.cardType === "CLOZE" && (
                  <Badge variant="outline" className="text-xs border-fuchsia-600 text-fuchsia-700 dark:text-fuchsia-300">
                    ফাঁকা-পূরণ
                  </Badge>
                )}
                {card.cardType === "IMAGE_OCCLUSION" && (
                  <Badge variant="outline" className="text-xs gap-1 border-amber-600 text-amber-600 dark:text-amber-400">
                    <ImageIcon className="h-2.5 w-2.5" />
                    ছবি-ঢাকা
                  </Badge>
                )}
                {isDue ? (
                  <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs">
                    আজ due
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    পরে দেখাবে
                  </Badge>
                )}
                {card.repetitions > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {card.repetitions}বার রিভিউ করেছো
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={deletingId === card.id}
              onClick={() => handleDelete(card.id)}
              aria-label="কার্ড মুছে ফেলো"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
