// ===================================================================
// HSC ULTIMATE — Premium Flashcards Hub 2026
// -------------------------------------------------------------------
// Aurora glassmorphic design with deck stats and progress
// ===================================================================
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Layers, Compass, Sparkles, Clock, BookOpen } from "lucide-react";
import { CreateDeckDialog } from "@/components/flashcards/create-deck-dialog";
import { DeckCard } from "@/components/flashcards/deck-card";
import { GlassCard } from "@/components/ui/glass-card";
import { CountUp } from "@/components/ui/count-up";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { EmptyState } from "@/components/ui/empty-state";

export default async function FlashcardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [decks, publicDecks] = await Promise.all([
    prisma.flashcardDeck.findMany({
      where: { userId: session.user.id },
      include: { flashcards: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.flashcardDeck.findMany({
      where: { isPublic: true },
      include: { _count: { select: { flashcards: true } } },
      orderBy: { importCount: "desc" },
      take: 5,
    }),
  ]);

  const now = new Date();
  const decksWithStats = decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    totalCards: deck.flashcards.length,
    dueCards: deck.flashcards.filter((c) => c.dueDate <= now).length,
  }));

  const totalCards = decksWithStats.reduce((s, d) => s + d.totalCards, 0);
  const totalDue = decksWithStats.reduce((s, d) => s + d.dueCards, 0);

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" className="rounded-full shrink-0" aria-label="পিছনে যাও">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                  <Layers className="h-3 w-3 mr-1" />
                  Flashcards
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                ফ্ল্যাশকার্ড <span className="text-gradient">Hub</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                FSRS Algorithm দিয়ে দীর্ঘমেয়াদী মনে রাখো
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button render={<Link href="/flashcards/discover" className="flex-1 sm:flex-initial" />} variant="outline" className="gap-1.5 w-full sm:w-auto">
                <Compass className="h-4 w-4" />
                Discover
              </Button>
            <div className="flex-1 sm:flex-initial">
              <CreateDeckDialog />
            </div>
          </div>
        </div>

        {decksWithStats.length > 0 ? (
          <>
            {/* Stats Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <GlassCard className="p-4 sm:p-5" variant="gradient-border">
                <Layers className="h-5 w-5 text-violet-500 mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-gradient">
                  <CountUp end={decksWithStats.length} duration={1500} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Decks</p>
              </GlassCard>

              <GlassCard className="p-4 sm:p-5" variant="gradient-border">
                <BookOpen className="h-5 w-5 text-blue-500 mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-gradient">
                  <CountUp end={totalCards} duration={1500} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total cards</p>
              </GlassCard>

              <GlassCard className="p-4 sm:p-5" variant="gradient-border">
                <Clock className="h-5 w-5 text-amber-500 mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-gradient">
                  <CountUp end={totalDue} duration={1500} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Due today</p>
              </GlassCard>

              <GlassCard className="p-4 sm:p-5" variant="gradient-border">
                <Sparkles className="h-5 w-5 text-emerald-500 mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-gradient">
                  <CountUp end={publicDecks.length} duration={1500} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Public decks</p>
              </GlassCard>
            </div>

            {/* Hero CTA — Study Now */}
            {totalDue > 0 && (
              <GlassCard
                className="p-5 sm:p-6 relative overflow-hidden"
                variant="gradient-border"
                glow
              >
                <div
                  aria-hidden
                  className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-gradient-to-br from-amber-500/30 via-orange-500/30 to-red-500/30 blur-3xl"
                />
                <div className="relative flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/30 shrink-0">
                    <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                      {totalDue} টি কার্ড review এর জন্য প্রস্তুত!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      FSRS algorithm অনুযায়ী এখনই পড়ো
                    </p>
                  </div>
                  <Button size="lg" className="gap-2 shrink-0">
                    <Sparkles className="h-4 w-4" />
                    Start Review
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Decks Grid */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Decks</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {decksWithStats.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <EmptyState
            illustration="data"
            title="No flashcards yet"
            description="Create your first deck to start memorizing. You can also discover public decks shared by the community."
            action={{ label: "Create your first deck", href: "#" }}
          />
        )}

        {/* Public Decks Preview */}
        {publicDecks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  Discover Public Decks
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  সম্প্রদায়ের শেয়ার করা ডেক থেকে শিখো
                </p>
              </div>
              <Link href="/flashcards/discover" className="text-sm text-primary hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {publicDecks.slice(0, 3).map((deck) => (
                <GlassCard key={deck.id} interactive className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                      <Layers className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{deck.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {deck._count.flashcards} cards • Used {deck.importCount}×
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Import
                  </Button>
                </GlassCard>
              ))}
            </div>
          </section>
        )}
      </div>
    </AuroraBackground>
  );
}
