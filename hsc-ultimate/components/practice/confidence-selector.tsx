"use client";

// ===================================================================
// Confidence Selector — MCQ উত্তর দেওয়ার পর ঐচ্ছিকভাবে "কতটা নিশ্চিত?"
// বেছে নেওয়ার ছোট UI (FEATURE_RESEARCH_V3.md Tier ২, আইটেম ৭)
// -------------------------------------------------------------------
// সম্পূর্ণ ঐচ্ছিক — কিছু না বেছে নিলেও পরের প্রশ্নে যাওয়া যায় (স্কিপ করা
// যায়), তাই বিদ্যমান quiz flow এ কোনো বাধ্যবাধকতা যোগ হয় না।
// ===================================================================
import { CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/lib/confidence";

export function ConfidenceSelector({
  value,
  onChange,
}: {
  value: ConfidenceLevel | undefined;
  onChange: (level: ConfidenceLevel) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xs text-muted-foreground shrink-0">কতটা নিশ্চিত? (ঐচ্ছিক)</span>
      <button
        type="button"
        onClick={() => onChange("SURE")}
        className={cn(
          "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
          value === "SURE"
            ? "border-violet-600 bg-violet-500/10 text-violet-700 dark:text-violet-400 font-medium"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
        নিশ্চিত
      </button>
      <button
        type="button"
        onClick={() => onChange("NOT_SURE")}
        className={cn(
          "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
          value === "NOT_SURE"
            ? "border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <HelpCircle className="h-3 w-3" />
        অনুমান
      </button>
    </div>
  );
}
