"use client";

// ===================================================================
// Admin: Chapter ম্যানেজমেন্ট UI — একটা Subject এর ভেতরের চ্যাপ্টার লিস্ট
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Plus, Trash2, Loader2, ChevronRight } from "lucide-react";

interface Chapter {
  id: string;
  name: string;
  nameEn: string;
  order: number;
  _count: { topics: number };
}

interface Subject {
  id: string;
  name: string;
  nameEn: string;
  colorHex: string;
}

export function ChapterManager({
  subject,
  initialChapters,
}: {
  subject: Subject;
  initialChapters: Chapter[];
}) {
  const router = useRouter();
  const confirmAction = useConfirmDialog();
  const [chapters, setChapters] = useState(initialChapters);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", nameEn: "" });
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — student-facing ফর্মের একই প্যাটার্ন
  // এখন admin panel এও প্রয়োগ করা হলো
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; nameEn?: string }>({});

  function validate() {
    const errors: { name?: string; nameEn?: string } = {};
    if (!form.name.trim()) errors.name = "বাংলা নাম আবশ্যক";
    if (!form.nameEn.trim()) errors.nameEn = "ইংরেজি নাম আবশ্যক";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/subjects/${subject.id}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: chapters.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "তৈরি করা যায়নি");
        return;
      }
      setChapters((prev) => [...prev, { ...data.chapter, _count: { topics: 0 } }]);
      toast.success("চ্যাপ্টার তৈরি হয়েছে!");
      setOpen(false);
      setForm({ name: "", nameEn: "" });
      setFieldErrors({});
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      !(await confirmAction({
        description: "এই চ্যাপ্টার ডিলিট করলে এর সব টপিক/প্রশ্নও মুছে যাবে। নিশ্চিত?",
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    try {
      const res = await fetch(`/api/admin/chapters/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setChapters((prev) => prev.filter((c) => c.id !== id));
      toast.success("ডিলিট হয়েছে");
      router.refresh();
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button render={<Link href="/admin/subjects" />} variant="ghost" size="icon" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: subject.colorHex }}
        >
          {subject.nameEn.slice(0, 1)}
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{subject.name}</h1>
          <p className="text-xs text-muted-foreground">{subject.nameEn}</p>
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
                নতুন চ্যাপ্টার
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন চ্যাপ্টার তৈরি করো</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="chapter-name">নাম (বাংলা)</Label>
                <Input
                  id="chapter-name"
                  placeholder="যেমন: তাপগতিবিদ্যা"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "chapter-name-error" : undefined}
                />
                {fieldErrors.name && (
                  <p id="chapter-name-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="chapter-name-en">Name (English)</Label>
                <Input
                  id="chapter-name-en"
                  placeholder="e.g. Thermodynamics"
                  value={form.nameEn}
                  onChange={(e) => {
                    setForm({ ...form, nameEn: e.target.value });
                    if (fieldErrors.nameEn) setFieldErrors({ ...fieldErrors, nameEn: undefined });
                  }}
                  aria-invalid={!!fieldErrors.nameEn}
                  aria-describedby={fieldErrors.nameEn ? "chapter-nameEn-error" : undefined}
                />
                {fieldErrors.nameEn && (
                  <p id="chapter-nameEn-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.nameEn}
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
      </div>

      <div className="space-y-2">
        {chapters.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            এখনো কোনো চ্যাপ্টার নেই। উপরের বাটন দিয়ে যোগ করো।
          </p>
        )}
        {chapters.map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between gap-3">
            <Link href={`/admin/chapters/${c.id}`} className="flex items-center gap-3 min-w-0 flex-1 group">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {c.name}
                </p>
                <p className="text-xs text-muted-foreground">{c.nameEn}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {c._count.topics} টপিক
              </Badge>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <Button render={<Link href={`/admin/chapters/${c.id}`} />} variant="ghost" size="icon" className="h-8 w-8" aria-label="বিস্তারিত দেখো">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(c.id)}
                aria-label="মুছে ফেলো"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
