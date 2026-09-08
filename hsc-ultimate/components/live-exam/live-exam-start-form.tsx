"use client";

// ===================================================================
// Live Exam শুরু করার ফর্ম — Custom Set (প্রি-সিলেক্টেড হলে) অথবা Subject
// question bank বেছে, সময়সীমা সেট করে সেশন তৈরি করে ও রানার পেজে পাঠায়
// -------------------------------------------------------------------
// 🔧 সম্প্রসারণ (এই সেশনে, Smart Live Exam ভিশনের ধারাবাহিকতায়): আগে
// শুধু MCQ সাপোর্ট ছিল। এখন Subject question bank থেকে শুরু করলে
// ইউজার MCQ/CQ টগল করে বেছে নিতে পারে (established `questionType`
// select — Custom Question Set Dashboard এর একই MCQ/CQ toggle
// প্যাটার্ন)। Custom set দিয়ে শুরু করলে সেটের questionType (MCQ/CQ)
// অনুযায়ী স্বয়ংক্রিয়ভাবে সঠিক রানার পেজে পাঠানো হয় (ইউজার টগল করতে
// পারে না, established "আলাদা এন্ট্রি পয়েন্ট থেকে আসে" ডিজাইন
// সিদ্ধান্ত অক্ষত)।
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { clampNumberInput } from "@/lib/clamp-number-input";
import { ArrowLeft, PlayCircle, Loader2, FileText, BookOpen } from "lucide-react";
import { BreathingExerciseDialog } from "@/components/shared/breathing-exercise-dialog";

const MCQ_COUNT_MIN = 5;
const MCQ_COUNT_MAX = 30;
const MCQ_COUNT_DEFAULT = 10;
const CQ_COUNT_MIN = 1;
const CQ_COUNT_MAX = 10;
const CQ_COUNT_DEFAULT = 3;
const DURATION_MIN = 5;
const DURATION_MAX = 180;
const MCQ_DURATION_DEFAULT = 15;
const CQ_DURATION_DEFAULT = 60; // CQ লিখতে বেশি সময় লাগে, established Mock Exam CQ ফেজের মতো

interface Subject {
  id: string;
  name: string;
}

interface PreselectedCustomSet {
  id: string;
  title: string;
  questionCount: number;
  questionType: "MCQ" | "CQ";
}

export function LiveExamStartForm({
  subjects,
  preselectedCustomSet,
}: {
  subjects: Subject[];
  preselectedCustomSet: PreselectedCustomSet | null;
}) {
  const router = useRouter();
  // preselectedCustomSet থাকলে সবসময় "custom" সোর্স, নাহলে সাবজেক্ট ব্যাংক —
  // বর্তমান ডিজাইনে ইউজার এটা টগল করতে পারে না (আলাদা এন্ট্রি পয়েন্ট থেকে আসে)
  const sourceType: "custom" | "question_bank" = preselectedCustomSet ? "custom" : "question_bank";
  // custom set হলে সেটের questionType অনুযায়ী ফিক্সড, question_bank হলে
  // ইউজার নিজে বেছে নিতে পারে (ডিফল্ট MCQ)
  const [questionType, setQuestionType] = useState<"MCQ" | "CQ">(
    preselectedCustomSet?.questionType ?? "MCQ"
  );
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  // টাইপ করার সময় string হিসেবে রাখা হয় (খালি করে নতুন সংখ্যা লেখার
  // সময় controlled input যেন আগের ভ্যালুতে জোর করে ফিরে না যায়) —
  // চূড়ান্ত সংখ্যা `onBlur` এ ও submit করার সময় clamp করা হয়
  const [mcqCountInput, setMcqCountInput] = useState(String(MCQ_COUNT_DEFAULT));
  const [cqCountInput, setCqCountInput] = useState(String(CQ_COUNT_DEFAULT));
  const [durationInput, setDurationInput] = useState(String(MCQ_DURATION_DEFAULT));
  const [starting, setStarting] = useState(false);

  function handleQuestionTypeChange(v: "MCQ" | "CQ") {
    setQuestionType(v);
    // টাইপ পরিবর্তনে ডিফল্ট সময়সীমা সেই টাইপের জন্য উপযুক্ত মানে রিসেট
    // করা হয় (CQ লিখতে বেশি সময় লাগে) — ইউজার আবার নিজের মতো পরিবর্তন
    // করতে পারবে
    setDurationInput(String(v === "CQ" ? CQ_DURATION_DEFAULT : MCQ_DURATION_DEFAULT));
  }

  async function handleStart() {
    if (starting) return;
    const questionCount =
      questionType === "MCQ"
        ? clampNumberInput(mcqCountInput, MCQ_COUNT_MIN, MCQ_COUNT_MAX, MCQ_COUNT_DEFAULT)
        : clampNumberInput(cqCountInput, CQ_COUNT_MIN, CQ_COUNT_MAX, CQ_COUNT_DEFAULT);
    const durationMinutes = clampNumberInput(durationInput, DURATION_MIN, DURATION_MAX, MCQ_DURATION_DEFAULT);
    if (questionType === "MCQ") setMcqCountInput(String(questionCount));
    else setCqCountInput(String(questionCount));
    setDurationInput(String(durationMinutes));
    setStarting(true);
    try {
      const res = await fetch("/api/live-exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          questionType,
          customSetId: sourceType === "custom" ? preselectedCustomSet?.id : undefined,
          subjectId: sourceType === "question_bank" ? subjectId : undefined,
          questionCount,
          durationMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Live Exam শুরু করা যায়নি");
        return;
      }
      router.push(`/live-exam/${data.liveExam.id}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button render={<Link href="/live-exam" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <h1 className="text-xl font-bold">⏱️ Live Exam শুরু করো</h1>
        </div>
        <BreathingExerciseDialog triggerLabel="শান্ত হও" />
      </div>

      <Card className="space-y-4 p-5">
        {preselectedCustomSet ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <div>
              <p className="text-sm font-medium">{preselectedCustomSet.title}</p>
              <p className="text-xs text-muted-foreground">
                {preselectedCustomSet.questionCount}টা {preselectedCustomSet.questionType === "MCQ" ? "MCQ" : "CQ"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="question-type">প্রশ্নের ধরন</Label>
              {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value দেখায়
                  (label না) — `items` prop দিয়ে ম্যাপিং দেওয়া হয়েছে */}
              <Select
                value={questionType}
                onValueChange={(v) => v && handleQuestionTypeChange(v as "MCQ" | "CQ")}
                items={[
                  { value: "MCQ", label: "MCQ (বহুনির্বাচনী)" },
                  { value: "CQ", label: "CQ (সৃজনশীল)" },
                ]}
              >
                <SelectTrigger id="question-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">MCQ (বহুনির্বাচনী)</SelectItem>
                  <SelectItem value="CQ">CQ (সৃজনশীল)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">সাবজেক্ট</Label>
              <Select
                value={subjectId}
                onValueChange={(v) => v && setSubjectId(v)}
                items={subjects.map((s) => ({ value: s.id, label: s.name }))}
              >
                <SelectTrigger id="subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {questionType === "MCQ" ? (
              <div>
                <Label htmlFor="q-count">প্রশ্ন সংখ্যা</Label>
                <Input
                  id="q-count"
                  type="number"
                  min={MCQ_COUNT_MIN}
                  max={MCQ_COUNT_MAX}
                  value={mcqCountInput}
                  onChange={(e) => setMcqCountInput(e.target.value)}
                  onBlur={(e) =>
                    setMcqCountInput(
                      String(clampNumberInput(e.target.value, MCQ_COUNT_MIN, MCQ_COUNT_MAX, MCQ_COUNT_DEFAULT))
                    )
                  }
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="cq-count">প্রশ্ন সংখ্যা</Label>
                <Input
                  id="cq-count"
                  type="number"
                  min={CQ_COUNT_MIN}
                  max={CQ_COUNT_MAX}
                  value={cqCountInput}
                  onChange={(e) => setCqCountInput(e.target.value)}
                  onBlur={(e) =>
                    setCqCountInput(
                      String(clampNumberInput(e.target.value, CQ_COUNT_MIN, CQ_COUNT_MAX, CQ_COUNT_DEFAULT))
                    )
                  }
                />
              </div>
            )}
          </>
        )}

        <div>
          <Label htmlFor="duration">সময়সীমা (মিনিট)</Label>
          <Input
            id="duration"
            type="number"
            min={DURATION_MIN}
            max={DURATION_MAX}
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            onBlur={(e) =>
              setDurationInput(
                String(
                  clampNumberInput(
                    e.target.value,
                    DURATION_MIN,
                    DURATION_MAX,
                    questionType === "CQ" ? CQ_DURATION_DEFAULT : MCQ_DURATION_DEFAULT
                  )
                )
              )
            }
          />
        </div>

        <Button onClick={handleStart} disabled={starting} className="w-full gap-2">
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          {starting ? "শুরু হচ্ছে..." : "পরীক্ষা শুরু করো"}
        </Button>

        {!preselectedCustomSet && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            সাবজেক্ট ব্যাংক থেকে এলোমেলো {questionType === "MCQ" ? "MCQ" : "CQ"} বাছাই হবে
          </p>
        )}
      </Card>
    </div>
  );
}
