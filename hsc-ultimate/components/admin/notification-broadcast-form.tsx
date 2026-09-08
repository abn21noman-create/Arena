"use client";

// ===================================================================
// Admin Notification Broadcast — সব ইউজারকে একসাথে নোটিফিকেশন পাঠানো
// -------------------------------------------------------------------
// যেমন: নতুন কন্টেন্ট যোগ হলে, exam routine আপডেট হলে, বা কোনো
// গুরুত্বপূর্ণ ঘোষণা থাকলে সব ইউজারকে একসাথে জানানো যায়।
// ===================================================================
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Megaphone, Loader2, Send } from "lucide-react";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

export function NotificationBroadcastForm() {
  const confirmAction = useConfirmDialog();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);
  const [lastSentCount, setLastSentCount] = useState<number | null>(null);
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — Subject/Chapter/Topic/Question Manager এ
  // প্রতিষ্ঠিত একই প্যাটার্ন (আগে শুধু generic toast ছিল)
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; body?: string }>({});

  // Unsaved Changes Warning — এটা dialog না, পুরো পেজ, তাই লেখা অবস্থায়
  // ভুলবশত রিফ্রেশ/ট্যাব বন্ধ করলে দীর্ঘ ঘোষণা হারিয়ে যাওয়া থেকে রক্ষা
  useUnsavedChangesWarning(title.trim() !== "" || body.trim() !== "" || link.trim() !== "");

  async function handleSend() {
    const errors: { title?: string; body?: string } = {};
    if (!title.trim()) errors.title = "শিরোনাম আবশ্যক";
    if (!body.trim()) errors.body = "বার্তা আবশ্যক";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("শিরোনাম ও বার্তা দুটোই লিখতে হবে");
      return;
    }

    if (
      !(await confirmAction({
        description: "নিশ্চিত? এই নোটিফিকেশনটি প্ল্যাটফর্মের সব ইউজারের কাছে পাঠানো হবে।",
        confirmLabel: "পাঠাও",
        destructive: false,
      }))
    ) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, link: link || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "পাঠানো যায়নি");
        return;
      }

      toast.success(`${data.sentCount} জন ইউজারকে নোটিফিকেশন পাঠানো হয়েছে!`);
      setLastSentCount(data.sentCount);
      setTitle("");
      setBody("");
      setLink("");
      setFieldErrors({});
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Megaphone className="h-6 w-6 text-primary" />
        Notification Broadcast
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        সব ইউজারের কাছে একসাথে একটা ঘোষণা/নোটিফিকেশন পাঠান
      </p>

      <Card className="p-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="broadcast-title">শিরোনাম</Label>
            <Input
              id="broadcast-title"
              placeholder="যেমন: নতুন Mock Exam যোগ হয়েছে!"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: undefined });
              }}
              aria-invalid={!!fieldErrors.title}
              aria-describedby={fieldErrors.title ? "broadcast-title-error" : undefined}
            />
            {fieldErrors.title && (
              <p id="broadcast-title-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.title}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="broadcast-body">বার্তা</Label>
            <Textarea
              id="broadcast-body"
              placeholder="বিস্তারিত বার্তা লেখো..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (fieldErrors.body) setFieldErrors({ ...fieldErrors, body: undefined });
              }}
              rows={4}
              aria-invalid={!!fieldErrors.body}
              aria-describedby={fieldErrors.body ? "broadcast-body-error" : undefined}
            />
            {fieldErrors.body && (
              <p id="broadcast-body-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.body}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="broadcast-link">লিংক (ঐচ্ছিক)</Label>
            <Input
              id="broadcast-link"
              placeholder="যেমন: /mock-exam"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              নোটিফিকেশনে ক্লিক করলে এই পেজে নিয়ে যাবে (ঐচ্ছিক)
            </p>
          </div>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="w-full gap-2"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            সবাইকে পাঠাও
          </Button>

          {lastSentCount !== null && (
            <p className="text-xs text-center text-muted-foreground">
              সর্বশেষ {lastSentCount} জন ইউজারকে পাঠানো হয়েছিল
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
