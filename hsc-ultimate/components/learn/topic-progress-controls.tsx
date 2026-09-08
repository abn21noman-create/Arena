"use client";

// ===================================================================
// টপিকের Mastery Status পাল্টানোর জন্য বাটন গ্রুপ (Client Component)
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, BookOpen, Pencil, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { showNewBadgeToasts } from "@/lib/badge-toast";

type Status = "NOT_STARTED" | "LEARNING" | "PRACTICING" | "MASTERED";

const STATUS_OPTIONS: { value: Status; label: string; icon: typeof BookOpen }[] = [
  { value: "LEARNING", label: "শিখছি", icon: BookOpen },
  { value: "PRACTICING", label: "অনুশীলন করছি", icon: Pencil },
  { value: "MASTERED", label: "আয়ত্ত হয়েছে", icon: Trophy },
];

export function TopicProgressControls({
  topicId,
  currentStatus,
}: {
  topicId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: Status) {
    setLoading(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        toast.error("প্রগ্রেস আপডেট করতে সমস্যা হয়েছে");
        return;
      }

      const data = await res.json();

      setStatus(newStatus);
      if (newStatus === "MASTERED") {
        toast.success("🎉 দারুণ! তুমি এই টপিক আয়ত্ত করেছো। +20 XP পেয়েছো!");
      } else {
        toast.success("প্রগ্রেস সেভ হয়েছে");
      }
      showNewBadgeToasts(data.newBadges);
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        তোমার অগ্রগতি চিহ্নিত করো
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value;
          const Icon = opt.icon;
          return (
            <Button
              key={opt.value}
              variant={isActive ? "default" : "outline"}
              className={cn("flex-col h-auto py-3 gap-1.5", isActive && "ring-2 ring-primary/30")}
              onClick={() => updateStatus(opt.value)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="text-xs">{opt.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
