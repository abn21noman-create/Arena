"use client";

// ===================================================================
// Admin: Question ম্যানেজমেন্ট UI — একটা Topic এর প্রশ্ন লিস্ট,
// একক প্রশ্ন যোগ, এবং CSV দিয়ে bulk আপলোড
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2, Upload, FileQuestion, Tag, Eye, EyeOff } from "lucide-react";
import { CQQuestionManager } from "@/components/admin/cq-question-manager";
import { MathText } from "@/components/shared/math-text";
import { cn } from "@/lib/utils";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

interface Question {
  id: string;
  text: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: string;
  boardYear: number | null;
  boardName: string | null;
  misconceptionTag: string | null;
  // Simplified Item-Difficulty Calibration — প্রকৃত response-data থেকে
  // বের করা empirical difficulty (ঐচ্ছিক, server component থেকে আসে)
  empiricalDifficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  empiricalWrongPct?: number | null;
  empiricalTotalResponses?: number;
}

interface CQQuestion {
  id: string;
  stimulus: string;
  questionA: string;
  questionB: string;
  questionC: string;
  questionD: string;
  modelAnswerA: string | null;
  modelAnswerB: string | null;
  modelAnswerC: string | null;
  modelAnswerD: string | null;
  boardYear: number | null;
  boardName: string | null;
}

interface Topic {
  id: string;
  name: string;
  chapter: { name: string; subject: { name: string; colorHex: string } };
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "সহজ",
  MEDIUM: "মাঝারি",
  HARD: "কঠিন",
};

// Simplified Item-Difficulty Calibration — admin এর ম্যানুয়াল difficulty
// ট্যাগ থেকে আলাদা, প্রকৃত response-data থেকে বের করা empirical difficulty
const EMPIRICAL_DIFFICULTY_LABELS: Record<"EASY" | "MEDIUM" | "HARD", string> = {
  EASY: "সহজ",
  MEDIUM: "মাঝারি",
  HARD: "কঠিন",
};

// বাংলাদেশের শিক্ষা বোর্ডসমূহ — Previous-Year Board Question ট্যাগিং এর জন্য
const BOARD_NAMES = [
  "ঢাকা বোর্ড",
  "রাজশাহী বোর্ড",
  "কুমিল্লা বোর্ড",
  "চট্টগ্রাম বোর্ড",
  "সিলেট বোর্ড",
  "বরিশাল বোর্ড",
  "দিনাজপুর বোর্ড",
  "ময়মনসিংহ বোর্ড",
  "যশোর বোর্ড",
];

const CSV_EXAMPLE = `text,option1,option2,option3,option4,correctAnswer,explanation,difficulty,boardYear,boardName
"নিউটনের কততম সূত্র F=ma?",প্রথম,দ্বিতীয়,তৃতীয়,কোনোটিই নয়,দ্বিতীয়,"F=ma নিউটনের দ্বিতীয় সূত্র থেকে আসে",EASY,2023,ঢাকা বোর্ড`;

// Admin Question Manager এ MathText Preview মোড — Physics/Chemistry/
// Higher Math প্রশ্নে LaTeX সিনট্যাক্স ($...$/$$...$$) ব্যবহার করা হলে
// admin টাইপ করার সময়ই সাথে সাথে দেখতে পারবে সেটা কেমন রেন্ডার হবে,
// ভুল সিনট্যাক্স তৈরি করার আগেই ধরা পড়বে (KaTeX এর SafeMath এমনিতেই
// parse error হলে raw টেক্সট লাল করে দেখায়, crash করে না)
function MathPreviewBox({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed bg-muted/30",
        compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
      )}
    >
      <p className="text-xs text-muted-foreground mb-1">প্রিভিউ:</p>
      <MathText text={text} />
    </div>
  );
}

export function QuestionManager({
  topic,
  initialQuestions,
  initialCqQuestions,
}: {
  topic: Topic;
  initialQuestions: Question[];
  initialCqQuestions: CQQuestion[];
}) {
  const router = useRouter();
  const confirmAction = useConfirmDialog();
  const [questions, setQuestions] = useState(initialQuestions);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Single question form state
  const [form, setForm] = useState({
    text: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "",
    explanation: "",
    difficulty: "MEDIUM",
    boardYear: "",
    boardName: "",
    misconceptionTag: "",
  });

  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — Subject/Chapter/Topic Manager এ প্রতিষ্ঠিত
  // একই প্যাটার্ন (aria-invalid+aria-describedby সহ ইনলাইন এরর মেসেজ),
  // এখন Question Manager এও প্রয়োগ করা হলো (আগে শুধু generic toast ছিল)
  const [fieldErrors, setFieldErrors] = useState<{
    text?: string;
    options?: string;
    correctAnswer?: string;
  }>({});

  // প্রতিটা প্রশ্নের ইনলাইন misconception ট্যাগ এডিটিং state (questionId -> draft value)
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});
  const [savingTagId, setSavingTagId] = useState<string | null>(null);

  // MathText Preview মোড — Physics/Chemistry/Higher Math প্রশ্নে প্রায়ই
  // LaTeX সূত্র ($x^2$, $$\frac{a}{b}$$) থাকে, কিন্তু admin ফর্মে টাইপ
  // করার সময় raw সিনট্যাক্স দেখা যায়, ভুল সিনট্যাক্স/টাইপো লেখা প্রশ্ন
  // তৈরি হওয়ার আগে বোঝা যেত না। এই টগল চালু করলে প্রশ্ন/অপশন/ব্যাখ্যা
  // এর নিচে সাথে সাথে রেন্ডার হওয়া প্রিভিউ দেখায় (ডিফল্টে বন্ধ, কারণ
  // বেশিরভাগ প্রশ্নে LaTeX থাকে না)।
  const [showPreview, setShowPreview] = useState(false);

  // Bulk CSV state
  const [csvText, setCsvText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Unsaved Changes Warning — Topic Manager এর একই প্যাটার্ন, ডায়ালগ
  // খোলা অবস্থায় ফর্মের কোনো ফিল্ডে টাইপ করা থাকলে সক্রিয় হয় (single
  // question ফর্মের জন্য; CSV bulk ট্যাবের জন্য নিচে আলাদা করে যোগ করা)
  const singleFormHasChanges =
    open &&
    (form.text.trim() !== "" ||
      form.option1.trim() !== "" ||
      form.option2.trim() !== "" ||
      form.option3.trim() !== "" ||
      form.option4.trim() !== "" ||
      form.correctAnswer.trim() !== "" ||
      form.explanation.trim() !== "");
  useUnsavedChangesWarning(singleFormHasChanges || (open && csvText.trim() !== ""));

  function validateSingle(options: string[]) {
    const errors: { text?: string; options?: string; correctAnswer?: string } = {};
    if (!form.text.trim()) errors.text = "প্রশ্নের টেক্সট আবশ্যক";
    if (options.length < 2) errors.options = "অন্তত ২টা অপশন দিতে হবে";
    if (!form.correctAnswer.trim()) errors.correctAnswer = "সঠিক উত্তর আবশ্যক";
    else if (options.length >= 2 && !options.includes(form.correctAnswer.trim())) {
      errors.correctAnswer = "সঠিক উত্তর অবশ্যই উপরের অপশনগুলোর একটার সাথে হুবহু মিলতে হবে";
    }
    return errors;
  }

  async function handleCreateSingle() {
    const options = [form.option1, form.option2, form.option3, form.option4].filter((o) => o.trim());
    const errors = validateSingle(options);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/topics/${topic.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: form.text,
          options,
          correctAnswer: form.correctAnswer,
          explanation: form.explanation,
          difficulty: form.difficulty,
          boardYear: form.boardYear || null,
          boardName: form.boardName || null,
          misconceptionTag: form.misconceptionTag || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "তৈরি করা যায়নি");
        return;
      }
      setQuestions((prev) => [data.question, ...prev]);
      toast.success("প্রশ্ন যোগ হয়েছে!");
      setOpen(false);
      setForm({
        text: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswer: "",
        explanation: "",
        difficulty: "MEDIUM",
        boardYear: "",
        boardName: "",
        misconceptionTag: "",
      });
      setFieldErrors({});
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkUpload() {
    if (!csvText.trim()) {
      toast.error("CSV টেক্সট দাও");
      return;
    }
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, csvText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "আপলোড করা যায়নি");
        return;
      }
      toast.success(`${data.count}টি প্রশ্ন সফলভাবে আপলোড হয়েছে!`);
      setCsvText("");
      router.refresh();
      // পুনরায় লোড না করে সরাসরি রিফ্রেশ করলেই questions আপডেট হবে (server component)
      window.location.reload();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirmAction({ description: "এই প্রশ্ন ডিলিট করবে?", confirmLabel: "ডিলিট করো" })))
      return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("ডিলিট হয়েছে");
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  }

  // বিদ্যমান প্রশ্নে ইনলাইনে misconception ট্যাগ সেভ করা (Wrong-Answer
  // Misconception Tagging ফিচার — Analytics Dashboard এ এই ট্যাগ দিয়ে
  // ইউজারের বার বার হওয়া ভুলের প্যাটার্ন দেখানো হয়)
  async function handleSaveTag(id: string) {
    const value = (tagDrafts[id] ?? "").trim();
    setSavingTagId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ misconceptionTag: value || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "সেভ করা যায়নি");
        return;
      }
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, misconceptionTag: data.question.misconceptionTag } : q))
      );
      toast.success("মিসকনসেপশন ট্যাগ সেভ হয়েছে");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSavingTagId(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button render={<Link href={`/admin/chapters`} />} variant="ghost" size="icon" onClick={() => history.back()} aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            {topic.chapter.subject.name} • {topic.chapter.name}
          </p>
          <h1 className="text-lg font-bold">{topic.name}</h1>
        </div>
      </div>

      <Tabs defaultValue="mcq">
        <TabsList className="mb-4">
          <TabsTrigger value="mcq" className="gap-1.5">
            <FileQuestion className="h-3.5 w-3.5" />
            MCQ প্রশ্নসমূহ ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="cq" className="gap-1.5">
            CQ (সৃজনশীল) প্রশ্নসমূহ ({initialCqQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cq">
          <CQQuestionManager
            topicId={topic.id}
            initialCqQuestions={initialCqQuestions}
          />
        </TabsContent>

        <TabsContent value="mcq">
      <div className="flex justify-end mb-4">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setFieldErrors({});
          }}
        >
          <DialogTrigger
            render={
              <Button className="gap-1.5" size="sm">
                <Plus className="h-4 w-4" />
                প্রশ্ন যোগ করো
              </Button>
            }
          />
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle>প্রশ্ন যোগ করো</DialogTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground"
                  onClick={() => setShowPreview((v) => !v)}
                >
                  {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPreview ? "প্রিভিউ বন্ধ করো" : "MathText প্রিভিউ দেখো"}
                </Button>
              </div>
            </DialogHeader>
            <Tabs defaultValue="single" className="pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="single" className="flex-1">
                  একক প্রশ্ন
                </TabsTrigger>
                <TabsTrigger value="bulk" className="flex-1">
                  CSV Bulk Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-3 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="q-text">প্রশ্ন</Label>
                  <Textarea
                    id="q-text"
                    placeholder="প্রশ্নটি লেখো... (LaTeX এর জন্য $x^2$ বা $$\frac{a}{b}$$ ব্যবহার করো)"
                    value={form.text}
                    onChange={(e) => {
                      setForm({ ...form, text: e.target.value });
                      if (fieldErrors.text) setFieldErrors({ ...fieldErrors, text: undefined });
                    }}
                    rows={2}
                    aria-invalid={!!fieldErrors.text}
                    aria-describedby={fieldErrors.text ? "q-text-error" : undefined}
                  />
                  {fieldErrors.text && (
                    <p id="q-text-error" role="alert" className="text-xs text-destructive">
                      {fieldErrors.text}
                    </p>
                  )}
                  {showPreview && form.text.trim() && (
                    <MathPreviewBox text={form.text} />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="অপশন ১"
                    aria-label="অপশন ১"
                    value={form.option1}
                    onChange={(e) => {
                      setForm({ ...form, option1: e.target.value });
                      if (fieldErrors.options) setFieldErrors({ ...fieldErrors, options: undefined });
                    }}
                    aria-invalid={!!fieldErrors.options}
                  />
                  <Input
                    placeholder="অপশন ২"
                    aria-label="অপশন ২"
                    value={form.option2}
                    onChange={(e) => {
                      setForm({ ...form, option2: e.target.value });
                      if (fieldErrors.options) setFieldErrors({ ...fieldErrors, options: undefined });
                    }}
                    aria-invalid={!!fieldErrors.options}
                  />
                  <Input
                    placeholder="অপশন ৩"
                    aria-label="অপশন ৩"
                    value={form.option3}
                    onChange={(e) => setForm({ ...form, option3: e.target.value })}
                  />
                  <Input
                    placeholder="অপশন ৪"
                    aria-label="অপশন ৪"
                    value={form.option4}
                    onChange={(e) => setForm({ ...form, option4: e.target.value })}
                  />
                </div>
                {fieldErrors.options && (
                  <p role="alert" className="text-xs text-destructive -mt-2">
                    {fieldErrors.options}
                  </p>
                )}
                {showPreview &&
                  [form.option1, form.option2, form.option3, form.option4].some((o) => o.trim()) && (
                    <div className="grid grid-cols-2 gap-2">
                      {[form.option1, form.option2, form.option3, form.option4].map(
                        (opt, i) =>
                          opt.trim() && (
                            <MathPreviewBox key={i} text={opt} compact />
                          )
                      )}
                    </div>
                  )}
                <div className="space-y-1.5">
                  <Label htmlFor="q-correct">সঠিক উত্তর (উপরের অপশনগুলোর একটা হুবহু লেখো)</Label>
                  <Input
                    id="q-correct"
                    placeholder="সঠিক অপশনটি হুবহু লেখো"
                    value={form.correctAnswer}
                    onChange={(e) => {
                      setForm({ ...form, correctAnswer: e.target.value });
                      if (fieldErrors.correctAnswer)
                        setFieldErrors({ ...fieldErrors, correctAnswer: undefined });
                    }}
                    aria-invalid={!!fieldErrors.correctAnswer}
                    aria-describedby={fieldErrors.correctAnswer ? "q-correct-error" : undefined}
                  />
                  {fieldErrors.correctAnswer && (
                    <p id="q-correct-error" role="alert" className="text-xs text-destructive">
                      {fieldErrors.correctAnswer}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-explanation">ব্যাখ্যা (ঐচ্ছিক)</Label>
                  <Textarea
                    id="q-explanation"
                    placeholder="কেন এটাই সঠিক উত্তর..."
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    rows={2}
                  />
                  {showPreview && form.explanation.trim() && (
                    <MathPreviewBox text={form.explanation} />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-difficulty">কঠিনতার মাত্রা</Label>
                  {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value
                      দেখায় (label না) — `items` prop দিয়ে ম্যাপিং দেওয়া
                      হয়েছে যাতে "EASY" এর বদলে "সহজ" দেখায় */}
                  <Select
                    value={form.difficulty}
                    onValueChange={(v) => setForm({ ...form, difficulty: v ?? form.difficulty })}
                    items={[
                      { value: "EASY", label: "সহজ" },
                      { value: "MEDIUM", label: "মাঝারি" },
                      { value: "HARD", label: "কঠিন" },
                    ]}
                  >
                    <SelectTrigger id="q-difficulty" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">সহজ</SelectItem>
                      <SelectItem value="MEDIUM">মাঝারি</SelectItem>
                      <SelectItem value="HARD">কঠিন</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-board-year">বোর্ড তথ্য (ঐচ্ছিক — এটা কোনো বোর্ড পরীক্ষার প্রশ্ন হলে)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="q-board-year"
                      type="number"
                      placeholder="বছর (যেমন 2023)"
                      value={form.boardYear}
                      onChange={(e) => setForm({ ...form, boardYear: e.target.value })}
                    />
                    {/* ⚠️ base-ui Select.Item এ খালি স্ট্রিং value দিলে সমস্যা
                        হয়, তাই "কোনো বোর্ড না" এর জন্য "NONE" sentinel
                        ব্যবহার করা হয়েছে — কিন্তু ফর্ম state এ আসল ভ্যালু
                        হিসেবে খালি স্ট্রিং ("") ই রাখা হয় (onValueChange এ
                        "NONE"→"" রূপান্তর করে), তাই handleSubmit এর বিদ্যমান
                        `form.boardName || null` লজিক অপরিবর্তিত থাকে।
                        `items` prop দিয়ে trigger এ raw value ("NONE") এর
                        বদলে readable label ("বোর্ড বেছে নাও") দেখানো
                        নিশ্চিত করা হয়েছে (base-ui এর ডিফল্ট সীমাবদ্ধতা) */}
                    <Select
                      value={form.boardName || "NONE"}
                      onValueChange={(v) =>
                        setForm({ ...form, boardName: v === "NONE" ? "" : (v ?? form.boardName) })
                      }
                      items={[
                        { value: "NONE", label: "বোর্ড বেছে নাও" },
                        ...BOARD_NAMES.map((b) => ({ value: b, label: b })),
                      ]}
                    >
                      <SelectTrigger aria-label="বোর্ডের নাম" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">বোর্ড বেছে নাও</SelectItem>
                        {BOARD_NAMES.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="q-misconception-tag">
                    মিসকনসেপশন ট্যাগ (ঐচ্ছিক — ভুল হলে সাধারণত কোন ভুল ধারণার
                    কারণে হয়)
                  </Label>
                  <Input
                    id="q-misconception-tag"
                    placeholder='যেমন: "চিহ্ন ভুল করা", "সূত্র গুলিয়ে ফেলা"'
                    value={form.misconceptionTag}
                    onChange={(e) => setForm({ ...form, misconceptionTag: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateSingle} className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  যোগ করো
                </Button>
              </TabsContent>


              <TabsContent value="bulk" className="space-y-3 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="q-csv-text">CSV টেক্সট পেস্ট করো</Label>
                  <Textarea
                    id="q-csv-text"
                    placeholder={CSV_EXAMPLE}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={8}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    ফরম্যাট: text,option1,option2,option3,option4,correctAnswer,explanation,difficulty,boardYear,boardName{"\n"}
                    শেষ দুইটা (boardYear, boardName) ঐচ্ছিক — বোর্ড পরীক্ষার প্রশ্ন না হলে খালি রাখতে পারো।{"\n"}
                    কমা থাকলে ডাবল-কোট (&quot;) দিয়ে ঘিরে দাও। প্রথম লাইন হেডার হিসেবে বাদ যাবে।
                  </p>
                </div>
                <Button
                  onClick={handleBulkUpload}
                  className="w-full gap-2"
                  disabled={bulkLoading}
                >
                  {bulkLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  আপলোড করো
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {questions.length === 0 && (
          <div className="text-center py-10">
            <FileQuestion className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              এখনো কোনো প্রশ্ন নেই। উপরের বাটন দিয়ে যোগ করো।
            </p>
          </div>
        )}
        {questions.map((q) => (
          <Card key={q.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-medium flex-1">
                <MathText text={q.text} />
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {q.boardName && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    📅 {q.boardName} {q.boardYear ?? ""}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {DIFFICULTY_LABELS[q.difficulty] ?? q.difficulty}
                </Badge>
                {q.empiricalDifficulty && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      q.empiricalDifficulty === "EASY" &&
                        "bg-violet-500/10 text-violet-700 dark:text-violet-400",
                      q.empiricalDifficulty === "MEDIUM" &&
                        "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                      q.empiricalDifficulty === "HARD" && "bg-red-500/10 text-red-700 dark:text-red-400"
                    )}
                    title={`${q.empiricalTotalResponses ?? 0}টা উত্তরের মধ্যে ${q.empiricalWrongPct ?? 0}% ভুল হয়েছে`}
                  >
                    empirical: {EMPIRICAL_DIFFICULTY_LABELS[q.empiricalDifficulty]}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(q.id)}
                  aria-label="প্রশ্ন মুছে ফেলো"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(q.options ?? []).map((opt, i) => (
                <Badge
                  key={i}
                  variant={opt === q.correctAnswer ? "default" : "outline"}
                  className="text-xs"
                >
                  <MathText text={opt} />
                </Badge>
              ))}
            </div>
            {q.explanation && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 mb-2">
                💡 <MathText text={q.explanation} />
              </p>
            )}
            <div className="flex items-center gap-1.5 pt-1.5 border-t">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                placeholder="মিসকনসেপশন ট্যাগ (ঐচ্ছিক)"
                aria-label="মিসকনসেপশন ট্যাগ"
                value={tagDrafts[q.id] ?? q.misconceptionTag ?? ""}
                onChange={(e) => setTagDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                className="h-7 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs shrink-0"
                disabled={savingTagId === q.id}
                onClick={() => handleSaveTag(q.id)}
              >
                {savingTagId === q.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "সেভ"
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
