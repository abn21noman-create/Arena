"use client";

// ===================================================================
// AI দিয়ে নোট থেকে অটো-ফ্ল্যাশকার্ড জেনারেট করার Dialog
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export function AIGenerateDialog({ deckId }: { deckId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!notes.trim() || notes.trim().length < 30) {
      toast.error("অন্তত ৩০ অক্ষরের নোট দাও, যাতে AI ভালো ফ্ল্যাশকার্ড বানাতে পারে");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/flashcard-decks/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, notes }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "ফ্ল্যাশকার্ড তৈরি করা যায়নি");
        return;
      }

      toast.success(`🎉 AI ${data.count}টি ফ্ল্যাশকার্ড তৈরি করেছে!`);
      setNotes("");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            AI দিয়ে বানাও
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI দিয়ে ফ্ল্যাশকার্ড তৈরি করো</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="notes">তোমার নোট পেস্ট করো</Label>
            <Textarea
              id="notes"
              placeholder="যেমন: সালোকসংশ্লেষণ একটি জৈবিক প্রক্রিয়া যেখানে উদ্ভিদ সূর্যালোক ব্যবহার করে..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              AI স্বয়ংক্রিয়ভাবে ৫-৮টা প্রশ্ন-উত্তর জোড়া তৈরি করে দেবে
            </p>
          </div>
          <Button onClick={handleGenerate} className="w-full gap-2" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "তৈরি হচ্ছে..." : "ফ্ল্যাশকার্ড তৈরি করো"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
