"use client";

// ===================================================================
// Admin: Topic ম্যানেজমেন্ট UI — একটা Chapter এর ভেতরের টপিক লিস্ট
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Downloadable PDF Notes ফিচারের সময় আবিষ্কৃত): আগে এই
// ফর্মে `formulaSheet` ফিল্ডের কোনো ইনপুট ছিল না, যদিও Prisma schema তে
// `Topic.formulaSheet` কলাম আগে থেকেই ছিল এবং docs এ "Formula Sheet"
// ফিচারকে ভুলভাবে ✅ সম্পন্ন মার্ক করা হয়েছিল। এছাড়া Topic Edit করার
// কোনো UI-ই ছিল না (শুধু Create+Delete)। দুটোই এখানে ঠিক করা হলো।
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2, ChevronRight, Star, Pencil, Eye, EyeOff } from "lucide-react";
import { MarkdownLite } from "@/components/shared/markdown-lite";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

interface Topic {
  id: string;
  name: string;
  nameEn: string;
  isImportant: boolean;
  videoUrl: string | null;
  notesMarkdown: string | null;
  formulaSheet: string | null;
  _count: { questions: number };
}

interface Chapter {
  id: string;
  name: string;
  nameEn: string;
  subject: { id: string; name: string; colorHex: string };
}

const EMPTY_FORM = {
  name: "",
  nameEn: "",
  isImportant: false,
  videoUrl: "",
  notesMarkdown: "",
  formulaSheet: "",
};

export function TopicManager({
  chapter,
  initialTopics,
}: {
  chapter: Chapter;
  initialTopics: Topic[];
}) {
  const router = useRouter();
  const confirmAction = useConfirmDialog();
  const [topics, setTopics] = useState(initialTopics);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — student-facing ফর্মের একই প্যাটার্ন
  // এখন admin panel এও প্রয়োগ করা হলো (Create+Edit উভয় ফর্মেই)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; nameEn?: string }>({});

  // Edit ডায়ালগের state — editingId null মানে edit dialog বন্ধ
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  // Edit ফর্মের "সেভ করা" (মূল) মান — Unsaved Changes Warning এর জন্য
  // তুলনার ভিত্তি (topic-note-editor.tsx এর hasChanges প্যাটার্ন অনুসরণ করে)
  const [editSavedForm, setEditSavedForm] = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<{ name?: string; nameEn?: string }>({});

  // Unsaved Changes Warning — notesMarkdown/formulaSheet এ অনেকটা লেখার
  // পরে ভুলবশত ট্যাব বন্ধ/রিফ্রেশ করলে সতর্ক করা (topic-note-editor.tsx
  // এর একই প্যাটার্ন, এখন admin panel এও প্রয়োগ করা হলো — আগে থেকে
  // স্বীকৃত transparency নোট gap সম্পূর্ণ করা)। শুধু dialog খোলা অবস্থায়
  // সক্রিয় থাকে (open/editingId চেক), যাতে dialog বন্ধ থাকা অবস্থায়
  // অপ্রাসঙ্গিক সতর্কতা না দেখায়।
  const createHasChanges =
    open &&
    (form.name.trim() !== "" ||
      form.nameEn.trim() !== "" ||
      form.videoUrl.trim() !== "" ||
      form.notesMarkdown.trim() !== "" ||
      form.formulaSheet.trim() !== "");
  const editHasChanges =
    editingId !== null &&
    (editForm.name !== editSavedForm.name ||
      editForm.nameEn !== editSavedForm.nameEn ||
      editForm.isImportant !== editSavedForm.isImportant ||
      editForm.videoUrl !== editSavedForm.videoUrl ||
      editForm.notesMarkdown !== editSavedForm.notesMarkdown ||
      editForm.formulaSheet !== editSavedForm.formulaSheet);
  useUnsavedChangesWarning(createHasChanges || editHasChanges);

  function validate(f: { name: string; nameEn: string }) {
    const errors: { name?: string; nameEn?: string } = {};
    if (!f.name.trim()) errors.name = "বাংলা নাম আবশ্যক";
    if (!f.nameEn.trim()) errors.nameEn = "ইংরেজি নাম আবশ্যক";
    return errors;
  }

  // MarkdownLite+MathText Preview মোড — notesMarkdown/formulaSheet এ
  // markdown+LaTeX (headers, bullet list, table, $...$) থাকে, admin
  // এডিট করার সময় সাথে সাথে দেখতে পারবে ছাত্র-facing পেজে এটা কেমন
  // রেন্ডার হবে (Admin Question Manager এর MathText Preview মোড এর
  // একই প্যাটার্ন)
  const [showPreview, setShowPreview] = useState(false);

  async function handleCreate() {
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chapters/${chapter.id}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: topics.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "তৈরি করা যায়নি");
        return;
      }
      setTopics((prev) => [...prev, { ...data.topic, _count: { questions: 0 } }]);
      toast.success("টপিক তৈরি হয়েছে!");
      setOpen(false);
      setForm(EMPTY_FORM);
      setFieldErrors({});
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(t: Topic) {
    setEditingId(t.id);
    setEditFieldErrors({});
    const snapshot = {
      name: t.name,
      nameEn: t.nameEn,
      isImportant: t.isImportant,
      videoUrl: t.videoUrl ?? "",
      notesMarkdown: t.notesMarkdown ?? "",
      formulaSheet: t.formulaSheet ?? "",
    };
    setEditForm(snapshot);
    setEditSavedForm(snapshot);
  }

  async function handleUpdate() {
    if (!editingId) return;
    const errors = validate(editForm);
    setEditFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/topics/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "আপডেট করা যায়নি");
        return;
      }
      setTopics((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...data.topic } : t))
      );
      toast.success("টপিক আপডেট হয়েছে!");
      setEditSavedForm(editForm); // সেভ হয়ে গেছে, তাই hasChanges false হবে dialog বন্ধ করার সময়
      setEditingId(null);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      !(await confirmAction({
        description: "এই টপিক ডিলিট করলে এর সব প্রশ্নও মুছে যাবে। নিশ্চিত?",
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTopics((prev) => prev.filter((t) => t.id !== id));
      toast.success("ডিলিট হয়েছে");
      router.refresh();
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button render={<Link href={`/admin/subjects/${chapter.subject.id}`} />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{chapter.subject.name}</p>
          <h1 className="text-lg font-bold">{chapter.name}</h1>
        </div>
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
                নতুন টপিক
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন টপিক তৈরি করো</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <Label htmlFor="topic-name">নাম (বাংলা)</Label>
                <Input
                  id="topic-name"
                  placeholder="যেমন: তাপগতিবিদ্যার সূত্রাবলি"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "topic-name-error" : undefined}
                />
                {fieldErrors.name && (
                  <p id="topic-name-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic-name-en">Name (English)</Label>
                <Input
                  id="topic-name-en"
                  placeholder="e.g. Laws of Thermodynamics"
                  value={form.nameEn}
                  onChange={(e) => {
                    setForm({ ...form, nameEn: e.target.value });
                    if (fieldErrors.nameEn) setFieldErrors({ ...fieldErrors, nameEn: undefined });
                  }}
                  aria-invalid={!!fieldErrors.nameEn}
                  aria-describedby={fieldErrors.nameEn ? "topic-nameEn-error" : undefined}
                />
                {fieldErrors.nameEn && (
                  <p id="topic-nameEn-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.nameEn}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic-video-url">ভিডিও URL (ঐচ্ছিক)</Label>
                <Input
                  id="topic-video-url"
                  placeholder="https://youtube.com/embed/..."
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic-notes-markdown">নোট (Markdown, ঐচ্ছিক)</Label>
                <Textarea
                  id="topic-notes-markdown"
                  placeholder="টপিকের বিস্তারিত নোট লেখো..."
                  value={form.notesMarkdown}
                  onChange={(e) => setForm({ ...form, notesMarkdown: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic-formula-sheet">ফর্মুলা শীট (ঐচ্ছিক)</Label>
                <Textarea
                  id="topic-formula-sheet"
                  placeholder="এই টপিকের গুরুত্বপূর্ণ সূত্রগুলো লেখো..."
                  value={form.formulaSheet}
                  onChange={(e) => setForm({ ...form, formulaSheet: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="topic-is-important-create"
                  checked={form.isImportant}
                  onCheckedChange={(checked) => setForm({ ...form, isImportant: checked === true })}
                />
                <label htmlFor="topic-is-important-create" className="text-sm cursor-pointer">
                  বোর্ড পরীক্ষায় গুরুত্বপূর্ণ টপিক হিসেবে চিহ্নিত করো ⭐
                </label>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                তৈরি করো
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {topics.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            এখনো কোনো টপিক নেই। উপরের বাটন দিয়ে যোগ করো।
          </p>
        )}
        {topics.map((t) => (
          <Card key={t.id} className="p-4 flex items-center justify-between gap-3">
            <Link href={`/admin/topics/${t.id}`} className="flex items-center gap-2 min-w-0 flex-1 group">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                  {t.name}
                  {t.isImportant && <Star className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />}
                </p>
                <p className="text-xs text-muted-foreground">{t.nameEn}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {t._count.questions} প্রশ্ন
              </Badge>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEdit(t)}
                      aria-label="টপিক এডিট করো"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                <TooltipContent>টপিক এডিট করো</TooltipContent>
              </Tooltip>
              <Button render={<Link href={`/admin/topics/${t.id}`} />} variant="ghost" size="icon" className="h-8 w-8" aria-label="বিস্তারিত দেখো">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(t.id)}
                aria-label="মুছে ফেলো"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit ডায়ালগ */}
      <Dialog
        open={editingId !== null}
        onOpenChange={(v) => {
          if (!v) {
            setEditingId(null);
            setEditFieldErrors({});
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle>টপিক এডিট করো</DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "প্রিভিউ বন্ধ করো" : "প্রিভিউ দেখো"}
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="topic-edit-name">নাম (বাংলা)</Label>
              <Input
                id="topic-edit-name"
                value={editForm.name}
                onChange={(e) => {
                  setEditForm({ ...editForm, name: e.target.value });
                  if (editFieldErrors.name) setEditFieldErrors({ ...editFieldErrors, name: undefined });
                }}
                aria-invalid={!!editFieldErrors.name}
                aria-describedby={editFieldErrors.name ? "topic-edit-name-error" : undefined}
              />
              {editFieldErrors.name && (
                <p id="topic-edit-name-error" role="alert" className="text-xs text-destructive">
                  {editFieldErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic-edit-name-en">Name (English)</Label>
              <Input
                id="topic-edit-name-en"
                value={editForm.nameEn}
                onChange={(e) => {
                  setEditForm({ ...editForm, nameEn: e.target.value });
                  if (editFieldErrors.nameEn) setEditFieldErrors({ ...editFieldErrors, nameEn: undefined });
                }}
                aria-invalid={!!editFieldErrors.nameEn}
                aria-describedby={editFieldErrors.nameEn ? "topic-edit-nameEn-error" : undefined}
              />
              {editFieldErrors.nameEn && (
                <p id="topic-edit-nameEn-error" role="alert" className="text-xs text-destructive">
                  {editFieldErrors.nameEn}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic-edit-video-url">ভিডিও URL (ঐচ্ছিক)</Label>
              <Input
                id="topic-edit-video-url"
                placeholder="https://youtube.com/embed/..."
                value={editForm.videoUrl}
                onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic-edit-notes-markdown">নোট (Markdown, ঐচ্ছিক — # হেডার, **bold**, - বুলেট, LaTeX $...$ সাপোর্টেড)</Label>
              <Textarea
                id="topic-edit-notes-markdown"
                value={editForm.notesMarkdown}
                onChange={(e) => setEditForm({ ...editForm, notesMarkdown: e.target.value })}
                rows={5}
              />
              {showPreview && editForm.notesMarkdown.trim() && (
                <div className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">প্রিভিউ:</p>
                  <MarkdownLite text={editForm.notesMarkdown} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic-edit-formula-sheet">ফর্মুলা শীট (ঐচ্ছিক)</Label>
              <Textarea
                id="topic-edit-formula-sheet"
                placeholder="এই টপিকের গুরুত্বপূর্ণ সূত্রগুলো লেখো..."
                value={editForm.formulaSheet}
                onChange={(e) => setEditForm({ ...editForm, formulaSheet: e.target.value })}
                rows={5}
              />
              {showPreview && editForm.formulaSheet.trim() && (
                <div className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">প্রিভিউ:</p>
                  <MarkdownLite text={editForm.formulaSheet} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="topic-is-important-edit"
                checked={editForm.isImportant}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isImportant: checked === true })}
              />
              <label htmlFor="topic-is-important-edit" className="text-sm cursor-pointer">
                বোর্ড পরীক্ষায় গুরুত্বপূর্ণ টপিক হিসেবে চিহ্নিত করো ⭐
              </label>
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={editLoading}>
              {editLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              সেভ করো
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
