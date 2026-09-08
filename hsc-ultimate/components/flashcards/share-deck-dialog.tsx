"use client";

// ===================================================================
// Community Shared Deck — নিজের ডেক পাবলিক/প্রাইভেট টগল করার Dialog
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Share2 } from "lucide-react";

export function ShareDeckDialog({
  deckId,
  initialIsPublic,
  initialDescription,
}: {
  deckId: string;
  initialIsPublic: boolean;
  initialDescription: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcard-decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "সেভ করা যায়নি");
        return;
      }

      toast.success(
        isPublic ? "ডেক পাবলিক করা হয়েছে! Discover পেজে দেখা যাবে।" : "ডেক প্রাইভেট করা হয়েছে"
      );
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
            <Share2 className="h-4 w-4" />
            শেয়ার করো
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Community তে শেয়ার করো</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">পাবলিক ডেক</p>
              <p className="text-xs text-muted-foreground">
                চালু করলে সবাই Discover পেজ থেকে দেখে নিজের একাউন্টে কপি করতে পারবে
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deck-description">বিবরণ (ঐচ্ছিক)</Label>
            <Textarea
              id="deck-description"
              placeholder="এই ডেকে কী আছে সংক্ষেপে লেখো..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            সেভ করো
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
