"use client";

// ===================================================================
// Breathing Exercise Card — Planner পেজে বসানো "মানসিক বিশ্রাম" কার্ড
// (FEATURE_RESEARCH_V3.md Tier ১, আইটেম ৫: Exam Anxiety/Breathing Exercise)
// ===================================================================
import { Card } from "@/components/ui/card";
import { Wind } from "lucide-react";
import { BreathingExerciseDialog } from "@/components/shared/breathing-exercise-dialog";

export function BreathingExerciseCard() {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-linear-to-br from-sky-500 to-violet-500 flex items-center justify-center">
          <Wind className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">মানসিক বিশ্রাম</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            পড়াশোনার চাপ বা পরীক্ষার আগে নার্ভাসনেস লাগলে ১ মিনিটের Box
            Breathing ব্যায়াম করো — মন শান্ত হবে, ফোকাস বাড়বে।
          </p>
        </div>
      </div>
      <div className="mt-4">
        <BreathingExerciseDialog triggerLabel="শ্বাস-প্রশ্বাস শুরু করো" className="w-full" />
      </div>
    </Card>
  );
}
