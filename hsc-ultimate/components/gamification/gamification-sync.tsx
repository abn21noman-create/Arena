"use client";

// ===================================================================
// Gamification Sync — Dashboard লোড হলে অদৃশ্যভাবে streak/level/badge
// সিঙ্ক করে, নতুন badge পেলে toast notification দেখায়
// ===================================================================
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewBadge {
  code: string;
  name: string;
  iconEmoji: string;
}

export function GamificationSync() {
  const router = useRouter();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    async function sync() {
      try {
        const res = await fetch("/api/gamification/sync", { method: "POST" });
        const data = await res.json();

        if (data.streak?.isNewDay && data.streak.streakCount > 1) {
          toast.success(`🔥 ${data.streak.streakCount} দিনের স্ট্রিক চলছে!`);
        }

        if (data.newBadges?.length > 0) {
          for (const badge of data.newBadges as NewBadge[]) {
            toast.success(`${badge.iconEmoji} নতুন ব্যাজ অর্জিত: ${badge.name}!`, {
              duration: 5000,
            });
          }
          router.refresh();
        }
      } catch {
        // silent fail — এটা background sync, ইউজার এক্সপেরিয়েন্স ব্যাহত করা ঠিক না
      }
    }

    void sync();
  }, [router]);

  return null;
}
