"use client";

// ===================================================================
// PDF Audio Overview কার্ড — AI দিয়ে PDF এর সারাংশ জেনারেট করে, বিদ্যমান
// TextToSpeechButton (Web Speech API) দিয়ে শোনার সুযোগ দেয়।
// NotebookLM এর "Audio Overview" ফিচার থেকে অনুপ্রাণিত (সরলীকৃত সংস্করণ —
// podcast-স্টাইল দুই-হোস্ট অডিও ফাইলের বদলে একটা well-structured টেক্সট
// সারাংশ, যেটা বিদ্যমান ফ্রি TTS দিয়ে শোনা যায়, কোনো নতুন cost ছাড়াই)।
// ===================================================================
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextToSpeechButton } from "@/components/learn/text-to-speech-button";
import { toast } from "sonner";
import { Headphones, Loader2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface PdfSummaryCardProps {
  documentId: string;
  initialSummary: string | null;
}

export function PdfSummaryCard({ documentId, initialSummary }: PdfSummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleGenerate(regenerate = false) {
    setLoading(true);
    try {
      const url = `/api/pdf-chat/${documentId}/summary${regenerate ? "?regenerate=1" : ""}`;
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "সারাংশ বানানো যায়নি");
        return;
      }
      setSummary(data.summary);
      setExpanded(true);
      if (!data.cached) toast.success("সারাংশ তৈরি হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (!summary) {
    return (
      <Card className="p-4 mb-3 flex items-center justify-between gap-3 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900">
        <div className="flex items-center gap-2 min-w-0">
          <Headphones className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium">🎧 Audio Overview</p>
            <p className="text-xs text-muted-foreground truncate">
              পুরো PDF এর একটা সারাংশ শুনে নাও (AI জেনারেটেড)
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => handleGenerate(false)} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Headphones className="h-3.5 w-3.5" />}
          বানাও
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-3 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900">
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          className="flex items-center gap-2 text-sm font-medium min-w-0"
          onClick={() => setExpanded((e) => !e)}
        >
          <Headphones className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
          🎧 Audio Overview
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <TextToSpeechButton text={summary} label="শুনো" />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => handleGenerate(true)}
            disabled={loading}
            aria-label="নতুন করে বানাও"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      {expanded && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{summary}</p>
      )}
    </Card>
  );
}
