"use client";

// ===================================================================
// Community Shared Deck — Discover Browser (AnkiWeb-অনুপ্রাণিত)
// -------------------------------------------------------------------
// সব পাবলিক ডেক দেখায়, সাবজেক্ট ফিল্টার সহ, importCount অনুযায়ী sort।
// নিজের শেয়ার করা ডেকে "তোমার ডেক" ব্যাজ + import বাটন disabled থাকে
// (নিজের ডেক নিজে import করার দরকার নেই)।
// ===================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";
import { Loader2, Download, Compass, User2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoverDeck {
  id: string;
  name: string;
  description: string | null;
  subjectCode: string | null;
  importCount: number;
  cardCount: number;
  isOwnDeck: boolean;
  ownerName: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  BANGLA: "বাংলা",
  ENGLISH: "ইংরেজি",
  ICT: "আইসিটি",
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  HIGHER_MATH: "উচ্চতর গণিত",
};

const SUBJECTS = Object.keys(SUBJECT_LABELS);

export function DiscoverDeckBrowser() {
  const router = useRouter();
  const [decks, setDecks] = useState<DiscoverDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  async function loadDecks(subject: string | null) {
    setLoading(true);
    try {
      const url = subject
        ? `/api/flashcard-decks/discover?subjectCode=${subject}`
        : "/api/flashcard-decks/discover";
      const res = await fetch(url);
      const data = await res.json();
      setDecks(data.decks ?? []);
    } catch {
      toast.error("ডেক লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDecks(subjectFilter);
  }, [subjectFilter]);

  async function handleImport(deckId: string) {
    setImportingId(deckId);
    try {
      const res = await fetch(`/api/flashcard-decks/${deckId}/import`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "কপি করা যায়নি");
        return;
      }

      toast.success("তোমার একাউন্টে ডেক কপি হয়েছে!");
      router.push(`/flashcards/${data.deck.id}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSubjectFilter(null)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
            subjectFilter === null
              ? "bg-primary text-primary-foreground border-primary"
              : "border-input hover:bg-muted"
          )}
        >
          সব
        </button>
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setSubjectFilter(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
              subjectFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-muted"
            )}
          >
            {SUBJECT_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-16">
          <Compass className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            এই ফিল্টারে এখনো কোনো পাবলিক ডেক নেই। তোমার একটা ডেক শেয়ার করে প্রথম হও!
          </p>
        </div>
      ) : (
        <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.05}>
          {decks.map((deck) => (
            <StaggerItem key={deck.id}>
            <Card className="p-4 flex flex-col h-full">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm truncate flex-1">{deck.name}</h3>
                {deck.isOwnDeck && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    তোমার ডেক
                  </Badge>
                )}
              </div>
              {deck.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {deck.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <User2 className="h-3 w-3" />
                  {deck.ownerName}
                </span>
                <span>{deck.cardCount} কার্ড</span>
                {deck.importCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    {deck.importCount}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant={deck.isOwnDeck ? "outline" : "default"}
                disabled={deck.isOwnDeck || importingId === deck.id}
                onClick={() => handleImport(deck.id)}
                className="gap-1.5 mt-auto w-full"
              >
                {importingId === deck.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {deck.isOwnDeck ? "নিজের ডেক" : "কপি করো"}
              </Button>
            </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
