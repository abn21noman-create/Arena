"use client";

// ===================================================================
// Notifications Tab — Settings পেজে নতুন ট্যাব
// -------------------------------------------------------------------
// সাপ্তাহিক ইমেইল ডাইজেস্ট (Notification Digest ফিচার) চালু/বন্ধ করার
// টগল। ডিফল্টে চালু (opt-out ডিজাইন — DB তে emailDigestEnabled default
// true), ইউজার এখান থেকে যেকোনো সময় বন্ধ করতে পারবে।
// ===================================================================
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { PushNotificationCard } from "@/components/settings/push-notification-card";

function formatDate(iso: string | null): string {
  if (!iso) return "এখনো পাঠানো হয়নি";
  const date = new Date(iso);
  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NotificationsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/digest-preference");
        const data = await res.json();
        setEnabled(data.enabled ?? true);
        setLastSentAt(data.lastSentAt ?? null);
      } catch {
        toast.error("সেটিংস লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleToggle(next: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/user/digest-preference", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "পরিবর্তন করা যায়নি");
        return;
      }
      setEnabled(data.enabled);
      toast.success(
        next ? "সাপ্তাহিক ইমেইল ডাইজেস্ট চালু হয়েছে!" : "সাপ্তাহিক ইমেইল ডাইজেস্ট বন্ধ হয়েছে"
      );
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card className="p-6 h-40 animate-pulse bg-muted/30" />;
  }

  return (
    <div className="space-y-4">
      <PushNotificationCard />

      <Card className="p-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-primary" />
            <Label className="font-medium text-sm">সাপ্তাহিক ইমেইল ডাইজেস্ট</Label>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            প্রতি সপ্তাহে তোমার প্র্যাকটিস সামারি (প্রশ্ন সংখ্যা, accuracy, স্টাডি
            টাইম, দুর্বল টপিক) ইমেইলে পাঠানো হবে। ডিফল্টে চালু আছে।
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} disabled={saving} />
      </Card>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground">
          সর্বশেষ ডাইজেস্ট পাঠানো হয়েছে: <span className="font-medium">{formatDate(lastSentAt)}</span>
        </p>
      </Card>

      {saving && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          সেভ হচ্ছে...
        </p>
      )}
    </div>
  );
}
