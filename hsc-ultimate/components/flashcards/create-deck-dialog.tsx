"use client";

// ===================================================================
// নতুন Flashcard Deck তৈরি করার Dialog
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function CreateDeckDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [nameError, setNameError] = useState<string | undefined>();

  function validate() {
    if (!name.trim()) {
      setNameError("ডেকের নাম দাও");
      return false;
    }
    setNameError(undefined);
    return true;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/flashcard-decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "ডেক তৈরি করা যায়নি");
        return;
      }

      toast.success("নতুন ডেক তৈরি হয়েছে!");
      setOpen(false);
      setName("");
      router.push(`/flashcards/${data.deck.id}`);
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
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            নতুন ডেক
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>নতুন Flashcard Deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="deck-name">ডেকের নাম</Label>
            <Input
              id="deck-name"
              placeholder="যেমন: পদার্থবিজ্ঞান সূত্রাবলী"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "deck-name-error" : undefined}
            />
            {nameError && (
              <p id="deck-name-error" role="alert" className="text-xs text-destructive">
                {nameError}
              </p>
            )}
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            তৈরি করো
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
