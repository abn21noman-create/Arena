"use client";

// ===================================================================
// Report Card ডাউনলোড বাটন — API থেকে PDF ফেচ করে ব্রাউজারে ডাউনলোড
// ট্রিগার করে (blob + temporary anchor link প্যাটার্ন)।
// ===================================================================
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ReportCardDownloadButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch("/api/report-card");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "রিপোর্ট কার্ড তৈরি করা যায়নি");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Content-Disposition হেডার থেকে ফাইলনেম বের করা — filename* (UTF-8,
      // বাংলা নাম সহ) আগে চেষ্টা করা হয়, না পেলে সাধারণ filename ব্যবহার হয়
      const disposition = res.headers.get("Content-Disposition");
      const utf8Match = disposition?.match(/filename\*=UTF-8''([^;]+)/);
      const asciiMatch = disposition?.match(/filename="(.+?)"/);
      a.download = utf8Match
        ? decodeURIComponent(utf8Match[1])
        : (asciiMatch?.[1] ?? "HSC-Ultimate-Report-Card.pdf");

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("রিপোর্ট কার্ড ডাউনলোড হয়েছে!");
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
      রিপোর্ট কার্ড PDF
    </Button>
  );
}
