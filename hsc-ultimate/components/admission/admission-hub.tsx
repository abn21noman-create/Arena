"use client";

// ===================================================================
// Admission Prep Hub — Medical/BUET/DU 'ক' ইউনিট এর মধ্যে বেছে নেওয়ার
// স্ক্রিন (এটাই admission সেকশনের প্রধান প্রবেশদ্বার)
// ===================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  Stethoscope,
  Building2,
  Cog,
  AlertTriangle,
  Clock,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdmissionExamType } from "@prisma/client";
import { BreathingExerciseDialog } from "@/components/shared/breathing-exercise-dialog";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";

interface ExamConfig {
  examType: AdmissionExamType;
  label: string;
  shortLabel: string;
  subjects: { subject: string; label: string; questionCount: number }[];
  negativeMarkPerWrong: number;
  timeMinutes: number;
  passMark: number | null;
  disclaimer: string | null;
  idealQuestionCount: number;
  availableQuestionCount: number;
}

const EXAM_ICONS: Record<AdmissionExamType, React.ElementType> = {
  MEDICAL: Stethoscope,
  DU_A_UNIT: Building2,
  BUET: Cog,
};

const EXAM_COLORS: Record<AdmissionExamType, string> = {
  MEDICAL: "from-rose-500 to-pink-500",
  DU_A_UNIT: "from-blue-500 to-indigo-500",
  BUET: "from-amber-500 to-orange-500",
};

export function AdmissionHub() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admission/exams")
      .then((res) => res.json())
      .then((data) => setExams(data.exams ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart(examType: AdmissionExamType) {
    setStarting(examType);
    try {
      const res = await fetch("/api/admission/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "শুরু করা যায়নি");
        return;
      }
      if (data.warning) toast.warning(data.warning);
      sessionStorage.setItem("admission_session", JSON.stringify(data));
      router.push(`/admission/run/${data.attemptId}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setStarting(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <GraduationCap className="h-6 w-6 text-primary" />
              ভর্তি প্রস্তুতি
            </h1>
            <p className="text-sm text-muted-foreground">
              HSC পরের ভর্তি পরীক্ষার প্রস্তুতি — নেগেটিভ মার্কিং সহ বাস্তব সিমুলেশন
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BreathingExerciseDialog triggerLabel="শান্ত হও" />
          <Button render={<Link href="/admission/history" />} variant="outline" size="sm" className="gap-1.5">
              <History className="h-4 w-4" />
              ইতিহাস
            </Button>
        </div>
      </div>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Admission Prep আইটেম গ্রেডিয়েন্ট) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-900 to-fuchsia-900 p-5 mb-6 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <GraduationCap className="h-7 w-7 opacity-90" />
          <div>
            <p className="font-bold">Medical/BUET/DU-স্টাইল বাস্তব সিমুলেশন</p>
            <p className="text-sm opacity-90">নেগেটিভ মার্কিং সহ আসল পরীক্ষার অনুভূতি</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
          {exams.map((exam) => {
            const Icon = EXAM_ICONS[exam.examType];
            const noQuestions = exam.availableQuestionCount === 0;
            return (
              <StaggerItem key={exam.examType}>
              <Card className="flex flex-col p-5 h-full">
                <div
                  className={cn(
                    "mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br text-white",
                    EXAM_COLORS[exam.examType]
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 font-bold">{exam.shortLabel}</h3>
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  {exam.label}
                </p>

                <div className="mb-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {exam.timeMinutes} মিনিট
                  </Badge>
                  {exam.negativeMarkPerWrong > 0 ? (
                    <Badge className="bg-destructive/10 text-destructive text-xs hover:bg-destructive/10">
                      ভুলে -{exam.negativeMarkPerWrong}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      নেগেটিভ মার্কিং নেই
                    </Badge>
                  )}
                  {exam.passMark !== null && (
                    <Badge variant="outline" className="text-xs">
                      পাস {exam.passMark}
                    </Badge>
                  )}
                </div>

                {exam.disclaimer && (
                  <Alert variant="warning" className="mb-3 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
                      {exam.disclaimer}
                    </AlertDescription>
                  </Alert>
                )}

                <p className="mb-4 text-xs text-muted-foreground">
                  {exam.subjects.map((s) => `${s.label} ${s.questionCount}`).join(" • ")}
                </p>

                <Button
                  onClick={() => handleStart(exam.examType)}
                  disabled={noQuestions || starting === exam.examType}
                  className="mt-auto gap-1.5"
                >
                  {starting === exam.examType && <Loader2 className="h-4 w-4 animate-spin" />}
                  {noQuestions ? "প্রশ্ন নেই" : "মক টেস্ট শুরু করো"}
                </Button>
              </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}
    </div>
  );
}
