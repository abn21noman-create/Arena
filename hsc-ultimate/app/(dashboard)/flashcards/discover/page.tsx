// ===================================================================
// Community Shared Deck — Discover পেজ (AnkiWeb-অনুপ্রাণিত)
// ===================================================================
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft, Compass } from "lucide-react";
import { DiscoverDeckBrowser } from "@/components/flashcards/discover-deck-browser";

export default async function DiscoverDecksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/flashcards" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            ডেক খুঁজুন
          </h1>
          <p className="text-sm text-muted-foreground">
            অন্য শিক্ষার্থীদের শেয়ার করা ডেক দেখো, নিজের একাউন্টে কপি করো
          </p>
        </div>
      </div>

      <div className="mt-6">
        <DiscoverDeckBrowser />
      </div>
    </div>
  );
}
