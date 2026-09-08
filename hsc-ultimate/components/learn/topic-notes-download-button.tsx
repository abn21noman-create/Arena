"use client";

// ===================================================================
// Topic Notes PDF ডাউনলোড বাটন — Downloadable PDF Notes ফিচার
// -------------------------------------------------------------------
// components/analytics/report-card-download-button.tsx এর একই
// প্যাটার্ন (blob + temporary anchor link) অনুসরণ করা হয়েছে।
// ===================================================================
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TopicNotesDownloadButton({ topicId }: { topicId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/notes-pdf`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "PDF তৈরি করা যায়নি");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = res.headers.get("Content-Disposition");
      const utf8Match = disposition?.match(/filename\*=UTF-8''([^;]+)/);
      const asciiMatch = disposition?.match(/filename="(.+?)"/);
      a.download = utf8Match
        ? decodeURIComponent(utf8Match[1])
        : (asciiMatch?.[1] ?? "HSC-Ultimate-Topic-Notes.pdf");

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("নোট PDF ডাউনলোড হয়েছে! এখন অফলাইনেও পড়তে পারবে।");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করো");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-1.5 shrink-0"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      PDF ডাউনলোড
    </Button>
  );
}
