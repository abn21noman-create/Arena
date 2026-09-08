"use client";

// ===================================================================
// Admin: Weekly Digest Email ম্যানুয়াল ট্রিগার
// -------------------------------------------------------------------
// প্ল্যাটফর্মে এখনো কোনো cron infra নেই (deploy স্থগিত), তাই admin
// সপ্তাহে একবার এই বাটনে ক্লিক করে সব eligible ইউজারকে (যাদের
// emailDigestEnabled=true এবং গত ৭ দিনে পাঠানো হয়নি) ডাইজেস্ট
// ইমেইল পাঠাতে পারবে। Deploy করার পর Vercel Cron দিয়ে এই একই
// এন্ডপয়েন্ট অটোমেটিক কল করা যাবে।
// ===================================================================
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Mail, Loader2, Send } from "lucide-react";

export function WeeklyDigestTrigger() {
  const confirmAction = useConfirmDialog();
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{
    sentCount: number;
    failedCount: number;
  } | null>(null);

  async function handleSend() {
    if (
      !(await confirmAction({
        description:
          "নিশ্চিত? এটা সব eligible ইউজারকে (যারা ডাইজেস্ট বন্ধ করেননি এবং গত ৭ দিনে পাঠানো হয়নি) সাপ্তাহিক প্রগ্রেস ইমেইল পাঠাবে।",
        confirmLabel: "পাঠাও",
        destructive: false,
      }))
    ) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/digest/send", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "পাঠানো যায়নি");
        return;
      }

      if (data.sentCount === 0 && data.message) {
        toast.info(data.message);
      } else {
        toast.success(
          `${data.sentCount} জনকে ডাইজেস্ট পাঠানো হয়েছে${
            data.failedCount > 0 ? ` (${data.failedCount} জনে ব্যর্থ)` : ""
          }`
        );
      }
      setLastResult({ sentCount: data.sentCount, failedCount: data.failedCount });
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-5 max-w-lg">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Weekly Digest Email</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        সব ইউজারকে (যারা বন্ধ করেননি) গত ৭ দিনের প্র্যাকটিস সামারি ইমেইল
        পাঠাও। যাদের গত ৭ দিনে ইতিমধ্যে পাঠানো হয়েছে তাদের বাদ দেওয়া হবে
        (ডুপ্লিকেট আটকাতে)।
      </p>
      <Button onClick={handleSend} disabled={sending} className="gap-2">
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        এখনই ডাইজেস্ট পাঠাও
      </Button>

      {lastResult && (
        <p className="text-xs text-muted-foreground mt-3">
          সর্বশেষ ব্যাচ: {lastResult.sentCount} জনকে সফলভাবে পাঠানো হয়েছে
          {lastResult.failedCount > 0 && `, ${lastResult.failedCount} জনে ব্যর্থ`}
        </p>
      )}
    </Card>
  );
}
