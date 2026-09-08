"use client";

// ===================================================================
// Admin: CQ (সৃজনশীল প্রশ্ন) ম্যানেজমেন্ট UI — একটা Topic এর CQ লিস্ট,
// উদ্দীপক + ক/খ/গ/ঘ প্রশ্ন + মডেল উত্তর সহ যোগ/মুছা
// ===================================================================
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, PenLine, Tag, Eye, EyeOff } from "lucide-react";
import { MathText } from "@/components/shared/math-text";
import { cn } from "@/lib/utils";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

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
  // Misconception Tagging CQ-তে সম্প্রসারণ — MCQ Question.misconceptionTag
  // এর একই প্যাটার্ন, ঐচ্ছিক free-text ট্যাগ (দেখো prisma/schema.prisma)
  misconceptionTag?: string | null;
}

const EMPTY_FORM = {
  stimulus: "",
  questionA: "",
  questionB: "",
  questionC: "",
  questionD: "",
  modelAnswerA: "",
  modelAnswerB: "",
  modelAnswerC: "",
  modelAnswerD: "",
  boardYear: "",
  boardName: "",
  misconceptionTag: "",
};

// MathText প্রিভিউ বক্স — Admin Question Manager এর একই কম্পোনেন্ট প্যাটার্ন
function MathPreviewBox({ text }: { text: string }) {
  return (
    <div className={cn("rounded-md border border-dashed bg-muted/30 px-3 py-2 text-sm")}>
      <p className="text-xs text-muted-foreground mb-1">প্রিভিউ:</p>
      <MathText text={text} />
    </div>
  );
}

export function CQQuestionManager({
  topicId,
  initialCqQuestions,
}: {
  topicId: string;
  initialCqQuestions: CQQuestion[];
}) {
  const confirmAction = useConfirmDialog();
  const [cqQuestions, setCqQuestions] = useState(initialCqQuestions);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — MCQ Question Manager/Subject/Chapter/Topic
  // Manager এ প্রতিষ্ঠিত একই প্যাটার্ন (আগে শুধু generic toast ছিল)
  const [fieldErrors, setFieldErrors] = useState<{
    stimulus?: string;
    questionA?: string;
    questionB?: string;
    questionC?: string;
    questionD?: string;
  }>({});

  // প্রতিটা CQ প্রশ্নের ইনলাইন misconception ট্যাগ এডিটিং state (MCQ
  // Question Manager এর একই প্রমাণিত প্যাটার্ন পুনর্ব্যবহার)
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});
  const [savingTagId, setSavingTagId] = useState<string | null>(null);

  // MathText Preview মোড — MCQ Question Manager এর একই প্যাটার্ন,
  // উদ্দীপক/ক-খ-গ-ঘ/মডেল উত্তরে LaTeX সূত্র থাকলে টাইপ করার সময়ই
  // রেন্ডার হওয়া প্রিভিউ দেখায়
  const [showPreview, setShowPreview] = useState(false);

  // Unsaved Changes Warning — MCQ Question Manager/Topic Manager এর একই
  // প্যাটার্ন, ডায়ালগ খোলা অবস্থায় ফর্মে কিছু লেখা থাকলে সক্রিয় হয়
  const formHasChanges =
    open &&
    Object.entries(form).some(([, v]) => v.trim() !== "");
  useUnsavedChangesWarning(formHasChanges);

  function validate() {
    const errors: {
      stimulus?: string;
      questionA?: string;
      questionB?: string;
      questionC?: string;
      questionD?: string;
    } = {};
    if (!form.stimulus.trim()) errors.stimulus = "উদ্দীপক আবশ্যক";
    if (!form.questionA.trim()) errors.questionA = "ক প্রশ্ন আবশ্যক";
    if (!form.questionB.trim()) errors.questionB = "খ প্রশ্ন আবশ্যক";
    if (!form.questionC.trim()) errors.questionC = "গ প্রশ্ন আবশ্যক";
    if (!form.questionD.trim()) errors.questionD = "ঘ প্রশ্ন আবশ্যক";
    return errors;
  }

  async function handleCreate() {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("উদ্দীপক এবং ক/খ/গ/ঘ চারটা প্রশ্ন লিখতে হবে");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/topics/${topicId}/cq-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "তৈরি করা যায়নি");
        return;
      }
      setCqQuestions((prev) => [data.cqQuestion, ...prev]);
      toast.success("CQ প্রশ্ন যোগ হয়েছে!");
      setOpen(false);
      setForm(EMPTY_FORM);
      setFieldErrors({});
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  // বিদ্যমান CQ প্রশ্নে ইনলাইনে misconception ট্যাগ সেভ করা (MCQ Question
  // Manager এর handleSaveTag() এর সাথে সম্পূর্ণ সমরূপ)
  async function handleSaveTag(id: string) {
    const value = (tagDrafts[id] ?? "").trim();
    setSavingTagId(id);
    try {
      const res = await fetch(`/api/admin/cq-questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ misconceptionTag: value || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "সেভ করা যায়নি");
        return;
      }
      setCqQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, misconceptionTag: data.cqQuestion.misconceptionTag } : q))
      );
      toast.success("মিসকনসেপশন ট্যাগ সেভ হয়েছে");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSavingTagId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirmAction({ description: "এই CQ প্রশ্ন ডিলিট করবে?", confirmLabel: "ডিলিট করো" })))
      return;
    try {
      const res = await fetch(`/api/admin/cq-questions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setCqQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("ডিলিট হয়েছে");
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          মোট {cqQuestions.length}টা CQ প্রশ্ন
        </p>
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
                CQ যোগ করো
              </Button>
            }
          />
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle>নতুন সৃজনশীল প্রশ্ন (CQ)</DialogTitle>
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
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="cq-stimulus">উদ্দীপক (স্টিমুলাস)</Label>
                <Textarea
                  id="cq-stimulus"
                  placeholder="উদ্দীপকটি লেখো..."
                  value={form.stimulus}
                  onChange={(e) => {
                    setForm({ ...form, stimulus: e.target.value });
                    if (fieldErrors.stimulus) setFieldErrors({ ...fieldErrors, stimulus: undefined });
                  }}
                  rows={3}
                  aria-invalid={!!fieldErrors.stimulus}
                  aria-describedby={fieldErrors.stimulus ? "cq-stimulus-error" : undefined}
                />
                {fieldErrors.stimulus && (
                  <p id="cq-stimulus-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.stimulus}
                  </p>
                )}
                {showPreview && form.stimulus.trim() && <MathPreviewBox text={form.stimulus} />}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cq-qa">ক. জ্ঞানমূলক (১ নম্বর)</Label>
                <Textarea
                  id="cq-qa"
                  placeholder="ক. প্রশ্ন লেখো..."
                  value={form.questionA}
                  onChange={(e) => {
                    setForm({ ...form, questionA: e.target.value });
                    if (fieldErrors.questionA) setFieldErrors({ ...fieldErrors, questionA: undefined });
                  }}
                  rows={1}
                  aria-invalid={!!fieldErrors.questionA}
                  aria-describedby={fieldErrors.questionA ? "cq-qa-error" : undefined}
                />
                {fieldErrors.questionA && (
                  <p id="cq-qa-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.questionA}
                  </p>
                )}
                {showPreview && form.questionA.trim() && <MathPreviewBox text={form.questionA} />}
                <Input
                  placeholder="মডেল উত্তর (ঐচ্ছিক)"
                  aria-label="ক নং প্রশ্নের মডেল উত্তর"
                  value={form.modelAnswerA}
                  onChange={(e) => setForm({ ...form, modelAnswerA: e.target.value })}
                />
                {showPreview && form.modelAnswerA.trim() && <MathPreviewBox text={form.modelAnswerA} />}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cq-qb">খ. অনুধাবনমূলক (২ নম্বর)</Label>
                <Textarea
                  id="cq-qb"
                  placeholder="খ. প্রশ্ন লেখো..."
                  value={form.questionB}
                  onChange={(e) => {
                    setForm({ ...form, questionB: e.target.value });
                    if (fieldErrors.questionB) setFieldErrors({ ...fieldErrors, questionB: undefined });
                  }}
                  rows={1}
                  aria-invalid={!!fieldErrors.questionB}
                  aria-describedby={fieldErrors.questionB ? "cq-qb-error" : undefined}
                />
                {fieldErrors.questionB && (
                  <p id="cq-qb-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.questionB}
                  </p>
                )}
                {showPreview && form.questionB.trim() && <MathPreviewBox text={form.questionB} />}
                <Textarea
                  placeholder="মডেল উত্তর (ঐচ্ছিক)"
                  aria-label="খ নং প্রশ্নের মডেল উত্তর"
                  value={form.modelAnswerB}
                  onChange={(e) => setForm({ ...form, modelAnswerB: e.target.value })}
                  rows={2}
                />
                {showPreview && form.modelAnswerB.trim() && <MathPreviewBox text={form.modelAnswerB} />}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cq-qc">গ. প্রয়োগ (৩ নম্বর)</Label>
                <Textarea
                  id="cq-qc"
                  placeholder="গ. প্রশ্ন লেখো..."
                  value={form.questionC}
                  onChange={(e) => {
                    setForm({ ...form, questionC: e.target.value });
                    if (fieldErrors.questionC) setFieldErrors({ ...fieldErrors, questionC: undefined });
                  }}
                  rows={1}
                  aria-invalid={!!fieldErrors.questionC}
                  aria-describedby={fieldErrors.questionC ? "cq-qc-error" : undefined}
                />
                {fieldErrors.questionC && (
                  <p id="cq-qc-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.questionC}
                  </p>
                )}
                {showPreview && form.questionC.trim() && <MathPreviewBox text={form.questionC} />}
                <Textarea
                  placeholder="মডেল উত্তর (ঐচ্ছিক)"
                  aria-label="গ নং প্রশ্নের মডেল উত্তর"
                  value={form.modelAnswerC}
                  onChange={(e) => setForm({ ...form, modelAnswerC: e.target.value })}
                  rows={2}
                />
                {showPreview && form.modelAnswerC.trim() && <MathPreviewBox text={form.modelAnswerC} />}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cq-qd">ঘ. উচ্চতর দক্ষতা (৪ নম্বর)</Label>
                <Textarea
                  id="cq-qd"
                  placeholder="ঘ. প্রশ্ন লেখো..."
                  value={form.questionD}
                  onChange={(e) => {
                    setForm({ ...form, questionD: e.target.value });
                    if (fieldErrors.questionD) setFieldErrors({ ...fieldErrors, questionD: undefined });
                  }}
                  rows={1}
                  aria-invalid={!!fieldErrors.questionD}
                  aria-describedby={fieldErrors.questionD ? "cq-qd-error" : undefined}
                />
                {fieldErrors.questionD && (
                  <p id="cq-qd-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.questionD}
                  </p>
                )}
                {showPreview && form.questionD.trim() && <MathPreviewBox text={form.questionD} />}
                <Textarea
                  placeholder="মডেল উত্তর (ঐচ্ছিক)"
                  aria-label="ঘ নং প্রশ্নের মডেল উত্তর"
                  value={form.modelAnswerD}
                  onChange={(e) => setForm({ ...form, modelAnswerD: e.target.value })}
                  rows={2}
                />
                {showPreview && form.modelAnswerD.trim() && <MathPreviewBox text={form.modelAnswerD} />}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="বোর্ডের বছর (যেমন 2024, ঐচ্ছিক)"
                  aria-label="বোর্ডের বছর"
                  value={form.boardYear}
                  onChange={(e) => setForm({ ...form, boardYear: e.target.value })}
                />
                <Input
                  placeholder="বোর্ডের নাম (ঐচ্ছিক)"
                  aria-label="বোর্ডের নাম"
                  value={form.boardName}
                  onChange={(e) => setForm({ ...form, boardName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cq-misconception-tag">
                  মিসকনসেপশন ট্যাগ (ঐচ্ছিক — কম নম্বর পেলে সাধারণত কোন ভুল
                  ধারণার কারণে হয়)
                </Label>
                <Input
                  id="cq-misconception-tag"
                  placeholder='যেমন: "যুক্তি সাজাতে না পারা", "সূত্র প্রয়োগে ভুল"'
                  value={form.misconceptionTag}
                  onChange={(e) => setForm({ ...form, misconceptionTag: e.target.value })}
                />
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                যোগ করো
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {cqQuestions.length === 0 && (
          <div className="text-center py-10">
            <PenLine className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              এখনো কোনো CQ প্রশ্ন নেই। উপরের বাটন দিয়ে যোগ করো।
            </p>
          </div>
        )}
        {cqQuestions.map((cq) => (
          <Card key={cq.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm bg-muted/50 rounded-md p-2 flex-1 whitespace-pre-wrap">
                <MathText text={cq.stimulus} />
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {cq.boardName && (
                  <Badge variant="outline" className="text-xs">
                    {cq.boardName} {cq.boardYear}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(cq.id)}
                  aria-label="প্রশ্ন মুছে ফেলো"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">ক.</span> <MathText text={cq.questionA} />
              </p>
              <p>
                <span className="font-medium text-foreground">খ.</span> <MathText text={cq.questionB} />
              </p>
              <p>
                <span className="font-medium text-foreground">গ.</span> <MathText text={cq.questionC} />
              </p>
              <p>
                <span className="font-medium text-foreground">ঘ.</span> <MathText text={cq.questionD} />
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-1.5 mt-2 border-t">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                placeholder="মিসকনসেপশন ট্যাগ (ঐচ্ছিক)"
                aria-label="মিসকনসেপশন ট্যাগ"
                value={tagDrafts[cq.id] ?? cq.misconceptionTag ?? ""}
                onChange={(e) => setTagDrafts((prev) => ({ ...prev, [cq.id]: e.target.value }))}
                className="h-7 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs shrink-0"
                disabled={savingTagId === cq.id}
                onClick={() => handleSaveTag(cq.id)}
              >
                {savingTagId === cq.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "সেভ"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
