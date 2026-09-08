// ===================================================================
// Deck Detail পেজ — কার্ড লিস্ট + নতুন কার্ড যোগ + AI Generate + Review শুরু
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { AddCardDialog } from "@/components/flashcards/add-card-dialog";
import { AIGenerateDialog } from "@/components/flashcards/ai-generate-dialog";
import { OcrGenerateDialog } from "@/components/flashcards/ocr-generate-dialog";
import { DeckCardList } from "@/components/flashcards/deck-card-list";
import { ShareDeckDialog } from "@/components/flashcards/share-deck-dialog";
import { PrintableFlashcardsDialog } from "@/components/flashcards/printable-flashcards";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: { flashcards: { orderBy: { createdAt: "asc" } } },
  });

  if (!deck || deck.userId !== session.user.id) notFound();

  const now = new Date();
  const dueCount = deck.flashcards.filter((c) => c.dueDate <= now).length;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/flashcards" className="rounded-full p-2 hover:bg-muted transition-colors shrink-0" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate">{deck.name}</h1>
              {deck.isPublic && (
                <Badge variant="outline" className="gap-1 text-xs shrink-0">
                  <Globe className="h-3 w-3" />
                  পাবলিক
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {deck.flashcards.length} টি কার্ড • {dueCount} টি আজকের জন্য due
              {deck.isPublic && deck.importCount > 0 && ` • ${deck.importCount} বার কপি হয়েছে`}
            </p>
          </div>
        </div>
        {dueCount > 0 && (
          <Button render={<Link href={`/flashcards/${deck.id}/review`} />} className="gap-1.5 shrink-0">
              <Play className="h-4 w-4" />
              রিভিউ করো
            </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <AddCardDialog deckId={deck.id} />
        <AIGenerateDialog deckId={deck.id} />
        <OcrGenerateDialog deckId={deck.id} />
        <PrintableFlashcardsDialog deckTitle={deck.name} cards={deck.flashcards} />
        <ShareDeckDialog
          deckId={deck.id}
          initialIsPublic={deck.isPublic}
          initialDescription={deck.description}
        />
      </div>

      <DeckCardList cards={deck.flashcards} />
    </div>
  );
}
