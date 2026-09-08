"use client";

// ===================================================================
// Wrong-Answer → Flashcard বাটন — Practice Result পেজে দেখানো হয়
// (MASTER_PLAN.md এর মূল ভিশনের একটা আইটেম: "প্রতিটি ভুল উত্তরকে
// flashcard এ কনভার্ট করার সাজেশন")
// -------------------------------------------------------------------
// কোনো ভুল উত্তর না থাকলে (percentage 100%) এই বাটনই দেখানো হয় না
// (parent component এ কন্ডিশনালি রেন্ডার করা হয়)।
// ===================================================================
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Layers, Loader2, ArrowRight, Sparkles } from "lucide-react";

export function WrongAnswersToFlashcardsButton({
  attemptId,
  wrongCount,
}: {
  attemptId: string;
  wrongCount: number;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ deckId: string; deckName: string; count: number } | null>(
    null
  );

  async function handleConvert() {
    setLoading(true);
    try {
      const res = await fetch(`/api/practice/result/${attemptId}/wrong-to-flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "কনভার্ট করা যায়নি");
        return;
      }

      toast.success(`🎉 ${data.count}টি ভুল উত্তর ফ্ল্যাশকার্ডে কনভার্ট হয়েছে!`);
      setResult({ deckId: data.deck.id, deckName: data.deck.name, count: data.count });
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <Alert variant="success" className="mb-6">
        <Sparkles className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-2 text-sm text-violet-700 dark:text-violet-400">
          <span>
            🎉 &ldquo;{result.deckName}&rdquo; ডেকে {result.count}টি কার্ড যোগ হয়েছে
          </span>
          <Link
            href={`/flashcards/${result.deckId}`}
            className="font-medium hover:underline flex items-center gap-1 shrink-0"
          >
            দেখো
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full gap-2 mb-6"
      onClick={handleConvert}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
      {loading
        ? "ফ্ল্যাশকার্ড তৈরি হচ্ছে..."
        : `${wrongCount}টি ভুল উত্তর ফ্ল্যাশকার্ডে কনভার্ট করো`}
    </Button>
  );
}
