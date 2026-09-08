"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ACADEMIC_REPORT_REASONS,
  ACADEMIC_REPORT_REASON_LABELS,
  academicReportDetailsValid,
  type AcademicReportReasonValue,
} from "@/lib/academic-report-policy";

export type AcademicReportTargetType = "CORE_MCQ" | "ADMISSION_MCQ" | "CQ" | "TOPIC_NOTE";

const REASONS = ACADEMIC_REPORT_REASONS.map(
  (value) => [value, ACADEMIC_REPORT_REASON_LABELS[value]] as const
);

type Reason = AcademicReportReasonValue;

export function AcademicReportButton({
  targetType,
  targetId,
  compact = false,
  className,
}: {
  targetType: AcademicReportTargetType;
  targetId: string;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setReason(null);
    setDetails("");
  }

  async function submit() {
    if (!reason) {
      toast.error("সমস্যার ধরন নির্বাচন করো");
      return;
    }
    if (!academicReportDetailsValid(reason, details)) {
      toast.error("অন্য সমস্যাটি অন্তত ১০ অক্ষরে লিখো");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/academic-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) toast.info(data.error);
        else toast.error(data.error ?? "Report save হয়নি");
        return;
      }
      toast.success("Academic report জমা হয়েছে—Admin review queue-তে পাঠানো হয়েছে");
      reset();
      setOpen(false);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            size={compact ? "sm" : "default"}
            variant="ghost"
            className={cn("gap-1.5 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400", className)}
            aria-label="Academic content-এর ভুল রিপোর্ট করো"
          >
            <Flag className="h-3.5 w-3.5" />
            {compact ? "ভুল?" : "ভুল রিপোর্ট করো"}
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Academic content-এর সমস্যা রিপোর্ট করো</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REASONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setReason(value)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  reason === value
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`academic-report-${targetType}-${targetId}`}>কোথায়/কেন ভুল মনে হয়েছে?</Label>
            <Textarea
              id={`academic-report-${targetType}-${targetId}`}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1_000}
              rows={4}
              placeholder="যেমন: সঠিক উত্তরটি ২ হওয়া উচিত; NCTB বইয়ের ... অধ্যায়ে ..."
            />
            <p className="text-xs text-muted-foreground">
              Report exact current content hash-এর সঙ্গে সংরক্ষিত হবে। এটি auto-correction বা auto-approval করবে না।
            </p>
          </div>
          <Button onClick={() => void submit()} disabled={saving || !reason} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Admin review queue-তে পাঠাও
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
