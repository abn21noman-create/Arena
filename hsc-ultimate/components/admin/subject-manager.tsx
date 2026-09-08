"use client";

// ===================================================================
// Admin: Subject ম্যানেজমেন্ট UI — লিস্ট, তৈরি, ডিলিট
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, Loader2, ChevronRight, BookOpen } from "lucide-react";

interface Subject {
  id: string;
  code: string;
  paper: string;
  name: string;
  nameEn: string;
  colorHex: string;
  order: number;
  _count: { chapters: number };
}

const SUBJECT_CODES = ["BANGLA", "ENGLISH", "ICT", "PHYSICS", "CHEMISTRY", "BIOLOGY", "HIGHER_MATH"];
const PAPERS = ["FIRST", "SECOND", "NONE"];

export function SubjectManager({ initialSubjects }: { initialSubjects: Subject[] }) {
  const router = useRouter();
  const confirmAction = useConfirmDialog();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "PHYSICS",
    paper: "FIRST",
    name: "",
    nameEn: "",
    colorHex: "#6d28d9",
  });
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল,
  // student-facing ফর্মের একই প্যাটার্ন এখন admin panel এও প্রয়োগ করা হলো)
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
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: subjects.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "তৈরি করা যায়নি");
        return;
      }
      setSubjects((prev) => [...prev, { ...data.subject, _count: { chapters: 0 } }]);
      toast.success("সাবজেক্ট তৈরি হয়েছে!");
      setOpen(false);
      setForm({ code: "PHYSICS", paper: "FIRST", name: "", nameEn: "", colorHex: "#6d28d9" });
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
        description: "এই সাবজেক্ট ডিলিট করলে এর সব চ্যাপ্টার/টপিক/প্রশ্নও মুছে যাবে। নিশ্চিত?",
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    try {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      toast.success("ডিলিট হয়েছে");
      router.refresh();
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            সাবজেক্ট ম্যানেজমেন্ট
          </h1>
          <p className="text-sm text-muted-foreground">
            সাবজেক্ট থেকে চ্যাপ্টার, টপিক, প্রশ্ন পর্যন্ত সব ম্যানেজ করো
          </p>
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
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                নতুন সাবজেক্ট
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন সাবজেক্ট তৈরি করো</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="subject-code-select">Subject Code</Label>
                  <Select
                    value={form.code}
                    onValueChange={(v) => setForm({ ...form, code: v ?? form.code })}
                  >
                    <SelectTrigger id="subject-code-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_CODES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject-paper-select">Paper</Label>
                  <Select
                    value={form.paper}
                    onValueChange={(v) => setForm({ ...form, paper: v ?? form.paper })}
                  >
                    <SelectTrigger id="subject-paper-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPERS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject-name">নাম (বাংলা)</Label>
                <Input
                  id="subject-name"
                  placeholder="যেমন: পরিসংখ্যান ১ম পত্র"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "subject-name-error" : undefined}
                />
                {fieldErrors.name && (
                  <p id="subject-name-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject-name-en">Name (English)</Label>
                <Input
                  id="subject-name-en"
                  placeholder="e.g. Statistics 1st Paper"
                  value={form.nameEn}
                  onChange={(e) => {
                    setForm({ ...form, nameEn: e.target.value });
                    if (fieldErrors.nameEn) setFieldErrors({ ...fieldErrors, nameEn: undefined });
                  }}
                  aria-invalid={!!fieldErrors.nameEn}
                  aria-describedby={fieldErrors.nameEn ? "subject-nameEn-error" : undefined}
                />
                {fieldErrors.nameEn && (
                  <p id="subject-nameEn-error" role="alert" className="text-xs text-destructive">
                    {fieldErrors.nameEn}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject-color-hex">রঙ (Hex)</Label>
                <Input
                  id="subject-color-hex"
                  type="color"
                  value={form.colorHex}
                  onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                  className="h-9 w-full"
                />
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
        {subjects.map((s) => (
          <Card key={s.id} className="p-4 flex items-center justify-between gap-3">
            <Link
              href={`/admin/subjects/${s.id}`}
              className="flex items-center gap-3 min-w-0 flex-1 group"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: s.colorHex }}
              >
                {s.nameEn.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground">{s.nameEn}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {s._count.chapters} চ্যাপ্টার
              </Badge>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <Button render={<Link href={`/admin/subjects/${s.id}`} />} variant="ghost" size="icon" className="h-8 w-8" aria-label="বিস্তারিত দেখো">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(s.id)}
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
