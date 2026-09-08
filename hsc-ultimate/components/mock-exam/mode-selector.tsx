"use client";

// ===================================================================
// Mock Exam Mode Selector — Full Timed vs Quick Practice
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Zap, Loader2, FileQuestion, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { BreathingExerciseDialog } from "@/components/shared/breathing-exercise-dialog";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";

const MODES = [
  {
    key: "FULL" as const,
    title: "পূর্ণ বোর্ড ফরম্যাট",
    icon: Clock,
    color: "from-violet-600 to-fuchsia-700",
    mcqCount: 25,
    cqCount: 5,
    timeLabel: "MCQ ২৫ মিনিট + CQ আড়াই ঘণ্টা",
    desc: "বাস্তব HSC পরীক্ষার মতো সম্পূর্ণ সময়সীমা ও প্রশ্নসংখ্যা",
  },
  {
    key: "QUICK" as const,
    title: "সংক্ষিপ্ত প্র্যাকটিস",
    icon: Zap,
    color: "from-violet-700 to-fuchsia-700",
    mcqCount: 10,
    cqCount: 2,
    timeLabel: "MCQ ১০ মিনিট + CQ ৩০ মিনিট",
    desc: "দ্রুত অনুশীলনের জন্য কম সময়ে ছোট পরীক্ষা",
  },
];

export function MockExamModeSelector({
  subjectId,
  mcqAvailable,
  cqAvailable,
}: {
  subjectId: string;
  mcqAvailable: number;
  cqAvailable: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function startExam(mode: "FULL" | "QUICK") {
    setLoading(mode);
    try {
      const res = await fetch("/api/mock-exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, mode }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "পরীক্ষা শুরু করা যায়নি");
        setLoading(null);
        return;
      }

      toast.success("পরীক্ষা শুরু হচ্ছে! প্রথমে MCQ অংশ...");
      router.push(`/mock-exam/attempt/${data.attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
            <FileQuestion className="h-3.5 w-3.5" />
            {mcqAvailable}টা MCQ প্রশ্ন উপলব্ধ
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
            <PenLine className="h-3.5 w-3.5" />
            {cqAvailable}টা CQ প্রশ্ন উপলব্ধ
          </div>
        </div>
        <BreathingExerciseDialog triggerLabel="শান্ত হও" />
      </div>

      <StaggerGroup className="space-y-4" staggerDelay={0.1}>
        {MODES.map((mode) => {
          const effectiveMcq = Math.min(mode.mcqCount, mcqAvailable);
          const effectiveCq = Math.min(mode.cqCount, cqAvailable);
          const isScaled = effectiveMcq < mode.mcqCount || effectiveCq < mode.cqCount;
          const isDisabled = effectiveMcq === 0 && effectiveCq === 0;

          return (
            <StaggerItem key={mode.key}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "h-11 w-11 rounded-xl bg-linear-to-br flex items-center justify-center shrink-0",
                      mode.color
                    )}
                  >
                    <mode.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{mode.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mode.desc}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⏱️ {mode.timeLabel}
                    </p>
                    {isScaled && !isDisabled && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        ⚠️ পর্যাপ্ত প্রশ্ন না থাকায় {effectiveMcq} MCQ +{" "}
                        {effectiveCq} CQ দিয়ে চলবে
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  disabled={isDisabled || loading !== null}
                  onClick={() => startExam(mode.key)}
                >
                  {loading === mode.key && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {isDisabled ? "পর্যাপ্ত প্রশ্ন নেই" : "শুরু করো"}
                </Button>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}
