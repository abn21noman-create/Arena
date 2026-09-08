"use client";

// ===================================================================
// নতুন Forum Post তৈরির ফর্ম
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { ArrowLeft, Loader2, Send } from "lucide-react";

const CATEGORIES = [
  { value: "QUESTION", label: "প্রশ্ন — সাহায্য দরকার" },
  { value: "DISCUSSION", label: "আলোচনা" },
  { value: "NOTE_SHARE", label: "নোট/রিসোর্স শেয়ার" },
];

// ⚠️ base-ui Select.Item এ খালি স্ট্রিং ("") value দিলে সমস্যা হতে পারে
// (placeholder/unselected state এর সাথে গুলিয়ে যায়) — তাই "সাধারণ"
// অপশনের জন্য "NONE" sentinel ব্যবহার করা হয়েছে, ফর্ম state এ এটাই
// থাকে কিন্তু submit করার সময় "" এ রূপান্তর করা হয় (API আগের মতোই
// খালি স্ট্রিং আশা করে, no backend change দরকার)
const SUBJECTS = [
  { value: "NONE", label: "সাধারণ (কোনো নির্দিষ্ট সাবজেক্ট না)" },
  { value: "PHYSICS", label: "পদার্থবিজ্ঞান" },
  { value: "CHEMISTRY", label: "রসায়ন" },
  { value: "BIOLOGY", label: "জীববিজ্ঞান" },
  { value: "HIGHER_MATH", label: "উচ্চতর গণিত" },
  { value: "BANGLA", label: "বাংলা" },
  { value: "ENGLISH", label: "English" },
  { value: "ICT", label: "ICT" },
];


export function NewPostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "QUESTION",
    subjectCode: "NONE",
  });
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; content?: string }>({});

  // ট্যাব বন্ধ/রিফ্রেশ করার আগে সতর্ক করা যদি টাইটেল/কন্টেন্ট লেখা থাকে
  useUnsavedChangesWarning(!!(form.title.trim() || form.content.trim()));

  function validate() {
    const errors: { title?: string; content?: string } = {};
    if (!form.title.trim()) errors.title = "শিরোনাম আবশ্যক";
    if (!form.content.trim()) errors.content = "বিস্তারিত আবশ্যক";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // "NONE" sentinel কে API-এর প্রত্যাশিত খালি স্ট্রিং এ রূপান্তর
        body: JSON.stringify({
          ...form,
          subjectCode: form.subjectCode === "NONE" ? "" : form.subjectCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "পোস্ট করা যায়নি");
        return;
      }
      toast.success("পোস্ট হয়েছে! +3 XP পেয়েছো");
      router.push(`/forum/${data.post.id}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/forum" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <h1 className="text-xl font-bold">নতুন পোস্ট</h1>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="post-category">ক্যাটাগরি</Label>
            {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value দেখায়
                (label না) — `items` prop দিয়ে ম্যাপিং দেওয়া হয়েছে */}
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v ?? form.category })}
              items={CATEGORIES}
            >
              <SelectTrigger id="post-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-subject">সাবজেক্ট (ঐচ্ছিক)</Label>
            <Select
              value={form.subjectCode}
              onValueChange={(v) => setForm({ ...form, subjectCode: v ?? form.subjectCode })}
              items={SUBJECTS}
            >
              <SelectTrigger id="post-subject" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="post-title">শিরোনাম</Label>
          <Input
            id="post-title"
            placeholder="যেমন: নিউটনের ৩য় সূত্র বুঝতে সমস্যা হচ্ছে"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: undefined });
            }}
            aria-invalid={!!fieldErrors.title}
            aria-describedby={fieldErrors.title ? "post-title-error" : undefined}
          />
          {fieldErrors.title && (
            <p id="post-title-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="post-content">বিস্তারিত</Label>
          <Textarea
            id="post-content"
            placeholder="তোমার প্রশ্ন/আলোচনার বিষয় বিস্তারিত লেখো..."
            value={form.content}
            onChange={(e) => {
              setForm({ ...form, content: e.target.value });
              if (fieldErrors.content) setFieldErrors({ ...fieldErrors, content: undefined });
            }}
            rows={8}
            aria-invalid={!!fieldErrors.content}
            aria-describedby={fieldErrors.content ? "post-content-error" : undefined}
          />
          {fieldErrors.content && (
            <p id="post-content-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.content}
            </p>
          )}
        </div>

        <Button onClick={handleSubmit} className="w-full gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          পোস্ট করো
        </Button>
      </Card>
    </div>
  );
}
