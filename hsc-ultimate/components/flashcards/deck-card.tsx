"use client";

// ===================================================================
// একটা Deck এর প্রিভিউ কার্ড — Flashcards Hub পেজে দেখানো হয়
// ===================================================================
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Flame, ArrowRight } from "lucide-react";

interface DeckSummary {
  id: string;
  name: string;
  totalCards: number;
  dueCards: number;
}

export function DeckCard({ deck }: { deck: DeckSummary }) {
  return (
    <Link href={`/flashcards/${deck.id}`}>
      <Card className="p-5 h-full hover-lift cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="icon-pop h-10 w-10 rounded-xl bg-linear-to-br from-violet-700 to-fuchsia-700 flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          {deck.dueCards > 0 && (
            <Badge className="gap-1 bg-orange-500 hover:bg-orange-500 text-white text-xs">
              <Flame className="h-3 w-3" />
              {deck.dueCards} due
            </Badge>
          )}
        </div>
        <h3 className="font-semibold mb-1 flex items-center gap-1 group-hover:text-primary transition-colors truncate">
          {deck.name}
          <ArrowRight className="arrow-reveal h-3.5 w-3.5 shrink-0" />
        </h3>
        <p className="text-xs text-muted-foreground">{deck.totalCards} টি কার্ড</p>
      </Card>
    </Link>
  );
}
