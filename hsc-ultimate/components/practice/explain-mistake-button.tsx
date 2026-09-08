"use client";

// ===================================================================
// AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake) বাটন
// -------------------------------------------------------------------
// Duolingo এর ২০২৬ "Explain My Answer" ফিচার থেকে অনুপ্রাণিত —
// Practice/Mock Exam/Admission Prep Result পেজে প্রতিটা ভুল MCQ
// উত্তরের নিচে দেখানো হয়। ক্লিক করলে AI ইউজারের নির্দিষ্ট ভুল উত্তর
// analyze করে personalized ব্যাখ্যা দেয় (on-demand, স্বয়ংক্রিয় না —
// AI cost বাঁচাতে)।
// -------------------------------------------------------------------
// 🔧 সম্প্রসারণ (এই সেশনে): আগে এই বাটন শুধু Practice Result পেজে
// ব্যবহার হতো, `endpoint` prop হার্ডকোড করা ছিল
// `/api/practice/answers/${answerId}/explain`। এখন `endpoint` prop
// হিসেবে যেকোনো explain API URL নেওয়া যায় — Mock Exam MCQ Review ও
// Admission Prep Result পেজেও এখন এই একই কম্পোনেন্ট পুনর্ব্যবহার করা
// হয়েছে (docs/MASTER_PLAN.md এ আগে থেকেই "ভবিষ্যতে চাইলে একই
// প্যাটার্নে সম্প্রসারণ করা যায়" — এই কাজেই সেটা করা হলো)।
// ===================================================================
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ExplainMistakeButton({ endpoint }: { endpoint: string }) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  async function handleExplain() {
    if (loading || explanation) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ব্যাখ্যা তৈরি করা যায়নি");
        return;
      }
      setExplanation(data.explanation);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (explanation) {
    return (
      <Alert className="mt-1.5 border-violet-500/20 bg-violet-500/5 text-xs">
        <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
        <AlertTitle className="text-violet-700 dark:text-violet-400">AI ব্যাখ্যা</AlertTitle>
        <AlertDescription className="text-muted-foreground leading-relaxed">
          {explanation}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="mt-1 h-7 gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 px-2"
      disabled={loading}
      onClick={handleExplain}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      {loading ? "AI ভাবছে..." : "AI দিয়ে ব্যাখ্যা বুঝি"}
    </Button>
  );
}
