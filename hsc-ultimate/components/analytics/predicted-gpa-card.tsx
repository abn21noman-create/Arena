"use client";

// ===================================================================
// Predicted GPA Card — Analytics Dashboard এ দেখানো হয়
// -------------------------------------------------------------------
// ইউজারের Practice/Mock Exam/CQ ডেটা থেকে প্রতিটা বিষয়ে সম্ভাব্য গ্রেড ও
// সামগ্রিক GPA দেখায়। যথেষ্ট ডেটা না থাকলে কোন কোন বিষয়ে আরও প্র্যাকটিস
// দরকার তা জানিয়ে দেয়।
// -------------------------------------------------------------------
// Personal Goal Setting (GPA Target) — MASTER_PLAN.md এর মূল ভিশনের
// আইটেম। ইউজার নিজের টার্গেট GPA সেট করে target-vs-actual (predicted)
// comparison দেখতে পারবে — টার্গেটের চেয়ে এগিয়ে/পিছিয়ে থাকলে সেটা
// রঙ-কোডেড ভাবে (emerald/amber) দেখানো হয়।
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, GraduationCap, Info, Target, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectPrediction {
  subjectCode: string;
  subjectName: string;
  predictedPercentage: number | null;
  grade: string | null;
  gradePoint: number | null;
  dataPointCount: number;
  confidence: "high" | "medium" | "low" | "none";
}

interface GpaResult {
  gpa: number;
  isPass: boolean;
  optionalBonus: number;
}

interface PredictedGpaData {
  subjects: SubjectPrediction[];
  gpaResult: GpaResult | null;
  missingSubjects: string[];
  remark: string | null;
  targetGpa: number | null;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-violet-500",
  A: "bg-green-500",
  "A-": "bg-lime-500",
  B: "bg-blue-500",
  C: "bg-amber-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};

export function PredictedGpaCard() {
  const [data, setData] = useState<PredictedGpaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics/predicted-gpa");
        const json = await res.json();
        setData(json);
        setTargetInput(json.targetGpa != null ? String(json.targetGpa) : "");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSaveTarget() {
    const parsed = targetInput.trim() === "" ? null : parseFloat(targetInput);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0 || parsed > 5)) {
      toast.error("টার্গেট GPA ০ থেকে ৫ এর মধ্যে হতে হবে");
      return;
    }

    setSavingTarget(true);
    try {
      const res = await fetch("/api/user/target-gpa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetGpa: parsed }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "সেভ করা যায়নি");
        return;
      }
      setData((prev) => (prev ? { ...prev, targetGpa: json.targetGpa } : prev));
      setEditingTarget(false);
      toast.success(parsed !== null ? "টার্গেট GPA সেভ হয়েছে!" : "টার্গেট মুছে ফেলা হয়েছে");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSavingTarget(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-5 mb-5 flex items-center justify-center min-h-32">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!data) return null;

  const diff =
    data.gpaResult && data.targetGpa != null
      ? Math.round((data.gpaResult.gpa - data.targetGpa) * 100) / 100
      : null;

  return (
    <Card className="p-5 mb-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          প্রেডিক্টেড GPA
        </h2>
        {!editingTarget && (
          <button
            onClick={() => setEditingTarget(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Target className="h-3 w-3" />
            {data.targetGpa != null ? "টার্গেট পরিবর্তন" : "টার্গেট সেট করো"}
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        তোমার Practice, Mock Exam ও CQ পারফরম্যান্স থেকে সম্ভাব্য ফলাফল
        (এটা একটা অনুমান, প্রকৃত বোর্ড ফলাফল ভিন্ন হতে পারে)
      </p>

      {editingTarget && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50">
          <Target className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="number"
            step="0.01"
            min="0"
            max="5"
            placeholder="যেমন: 5.00"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            className="h-8 text-sm"
            aria-label="টার্গেট জিপিএ"
          />
          <Button
            size="sm"
            className="h-8 gap-1"
            onClick={handleSaveTarget}
            disabled={savingTarget}
            aria-label="লক্ষ্য সেভ করো"
          >
            {savingTarget ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => {
              setEditingTarget(false);
              setTargetInput(data.targetGpa != null ? String(data.targetGpa) : "");
            }}
            aria-label="বাতিল করো"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {data.gpaResult ? (
        <div className="flex items-center gap-4 mb-3 p-4 rounded-xl bg-linear-to-br from-violet-500/10 to-fuchsia-500/10">
          <div>
            <p className="text-3xl font-bold text-primary">
              {data.gpaResult.gpa.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">সম্ভাব্য GPA (৫.০০ এর মধ্যে)</p>
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            {data.remark}
          </div>
        </div>
      ) : (
        <Alert variant="warning" className="mb-3 text-sm">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            সামগ্রিক GPA দেখতে{" "}
            <span className="font-medium">
              {data.missingSubjects.join(", ")}
            </span>{" "}
            বিষয়ে আরও প্র্যাকটিস/Mock Exam দাও।
          </AlertDescription>
        </Alert>
      )}

      {/* Target vs Actual comparison — Personal Goal Setting */}
      {data.targetGpa != null && (
        <Alert
          variant={diff === null ? "default" : diff >= 0 ? "success" : "warning"}
          className={cn(
            "mb-4 text-sm",
            diff === null && "border-transparent bg-muted/50 text-foreground"
          )}
        >
          <Target className="h-4 w-4" />
          <AlertDescription
            className={cn(
              diff === null
                ? "text-foreground"
                : diff >= 0
                  ? "text-violet-700 dark:text-violet-400"
                  : "text-amber-700 dark:text-amber-400"
            )}
          >
            {diff === null ? (
              <span>
                তোমার টার্গেট: <span className="font-semibold">{data.targetGpa.toFixed(2)}</span> —
                সামগ্রিক GPA দেখতে আরও ডেটা দরকার
              </span>
            ) : diff >= 0 ? (
              <span>
                টার্গেট ({data.targetGpa.toFixed(2)}) থেকে{" "}
                <span className="font-semibold">{diff.toFixed(2)}</span> এগিয়ে আছো! দারুণ চালিয়ে যাও 🎉
              </span>
            ) : (
              <span>
                টার্গেট ({data.targetGpa.toFixed(2)}) থেকে{" "}
                <span className="font-semibold">{Math.abs(diff).toFixed(2)}</span> পিছিয়ে আছো —
                আরও প্র্যাকটিস দরকার 💪
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {editingTarget === false && data.targetGpa == null && !data.gpaResult && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <Pencil className="h-3 w-3" />
          একটা টার্গেট GPA সেট করে নিজের লক্ষ্য ট্র্যাক করতে পারো
        </p>
      )}

      <div className="space-y-2">
        {data.subjects.map((s) => (
          <div
            key={s.subjectCode}
            className="flex items-center justify-between text-sm py-1.5"
          >
            <span className="text-muted-foreground">{s.subjectName}</span>
            {s.predictedPercentage !== null ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {s.predictedPercentage}%
                </span>
                <Badge
                  className={cn(
                    "text-white text-xs",
                    GRADE_COLORS[s.grade!] ?? "bg-muted"
                  )}
                >
                  {s.grade}
                </Badge>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                ডেটা নেই
              </span>
            )}
          </div>
        ))}
      </div>

      <Link
        href="/mock-exam"
        className="block text-center text-xs text-primary hover:underline mt-4"
      >
        Mock Exam দিয়ে আরও নির্ভুল প্রেডিকশন পাও →
      </Link>
    </Card>
  );
}
