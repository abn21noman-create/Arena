"use client";

// ===================================================================
// Breathing Exercise Dialog — যেকোনো পরীক্ষা শুরুর আগে ঐচ্ছিকভাবে খোলা
// যায় এমন একটা reusable trigger বাটন + Dialog wrapper
// (Mock Exam / Admission / Live Exam / Planner — সব জায়গায় reuse হয়)
// ===================================================================
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wind } from "lucide-react";
import { BreathingExercise } from "@/components/shared/breathing-exercise";
import { cn } from "@/lib/utils";

export function BreathingExerciseDialog({
  triggerLabel = "শান্ত হও (১ মিনিট)",
  triggerVariant = "outline",
  className,
}: {
  triggerLabel?: string;
  triggerVariant?: "outline" | "ghost" | "default" | "secondary";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={triggerVariant} className={cn("gap-1.5", className)}>
            <Wind className="h-4 w-4" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            শ্বাস-প্রশ্বাস ব্যায়াম
          </DialogTitle>
          <DialogDescription>
            পরীক্ষার আগে নার্ভাস লাগছে? Box Breathing পদ্ধতিতে (৪ সেকেন্ড শ্বাস
            নাও, ৪ সেকেন্ড ধরে রাখো, ৪ সেকেন্ড ছাড়ো, ৪ সেকেন্ড ধরে রাখো) কয়েক
            চক্র করলে মন শান্ত হবে ও ফোকাস বাড়বে।
          </DialogDescription>
        </DialogHeader>
        <BreathingExercise onSkip={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
