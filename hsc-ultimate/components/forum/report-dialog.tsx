"use client";

// ===================================================================
// Content Report Dialog — Forum Post/Reply রিপোর্ট করার জন্য
// -------------------------------------------------------------------
// postId অথবা replyId এর একটা দিয়ে ব্যবহার করা হয় (কখনো দুটো একসাথে না)।
// ===================================================================
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const REASONS: { value: string; label: string }[] = [
  { value: "SPAM", label: "স্প্যাম/বিজ্ঞাপন" },
  { value: "OFFENSIVE", label: "অশ্লীল/আপত্তিকর ভাষা" },
  { value: "MISINFORMATION", label: "ভুল তথ্য" },
  { value: "HARASSMENT", label: "হয়রানি/ব্যক্তিগত আক্রমণ" },
  { value: "OTHER", label: "অন্য কারণ" },
];

export function ReportDialog({
  postId,
  replyId,
}: {
  postId?: string;
  replyId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setReason(null);
    setDetails("");
  }

  async function handleSubmit() {
    if (!reason) {
      toast.error("একটা কারণ বেছে নাও");
      return;
    }
    if (reason === "OTHER" && !details.trim()) {
      toast.error('"অন্য কারণ" বেছে নিলে বিস্তারিত লেখো');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/forum/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, replyId, reason, details: details.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "রিপোর্ট করা যায়নি");
        return;
      }

      toast.success("রিপোর্ট জমা হয়েছে, ধন্যবাদ! Admin টিম রিভিউ করবে।");
      resetForm();
      setOpen(false);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <button
                  aria-label="রিপোর্ট করো"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Flag className="h-3.5 w-3.5" />
                </button>
              }
            />
          }
        />
        <TooltipContent>রিপোর্ট করো</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>রিপোর্ট করো</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label>কারণ বেছে নাও</Label>
            <div className="grid grid-cols-1 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                    reason === r.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-muted"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {reason === "OTHER" && (
            <div className="space-y-1.5">
              <Label htmlFor="report-details">বিস্তারিত লেখো</Label>
              <Textarea
                id="report-details"
                placeholder="সমস্যাটা কী তা লেখো..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full" disabled={loading} variant="destructive">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            রিপোর্ট জমা দাও
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
