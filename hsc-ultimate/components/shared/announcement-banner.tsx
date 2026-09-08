"use client";

// ===================================================================
// Announcement Banner — Admin Panel Power-up ফিচার
// -------------------------------------------------------------------
// Admin `/admin` থেকে একটা ঘোষণা চালু করলে সব লগইন করা ইউজারের
// Dashboard এর উপরে এই ব্যানার দেখা যায় (dismissible)। ডিজাইন
// সিদ্ধান্ত:
// - `announcementId` (প্রতিবার নতুন announcement বানালে নতুন id)
//   client-side localStorage এ dismiss ট্র্যাক করার key হিসেবে
//   ব্যবহার হয় — তাই পুরনো announcement dismiss করা ইউজারও নতুন
//   announcement এলে আবার দেখতে পাবে, কিন্তু একই announcement বারবার
//   দেখতে হবে না।
// - Server round-trip lightweight (GET /api/system-settings, কোনো
//   auth-gated না, cache করা যায় ভবিষ্যতে দরকার হলে)।
// - Maintenance Mode চালু থাকলে (পুরো অ্যাপ ব্লক হয়ে যাচ্ছে) এই
//   ব্যানার না দেখানোই ভালো — MaintenanceGate সেটা আলাদাভাবে হ্যান্ডেল
//   করে, এই কম্পোনেন্ট তার উপরে/নিচে সবসময় mount হয়ে থাকতে পারে কারণ
//   MaintenanceGate নিজেই children রেন্ডার আটকে দেয় ব্যান/মেইনটেন্যান্স
//   থাকলে।
// ===================================================================
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Megaphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISS_KEY_PREFIX = "hsc-ultimate-announcement-dismissed-";

export function AnnouncementBanner() {
  const { status } = useSession();
  const [data, setData] = useState<{
    announcementEnabled: boolean;
    announcementText: string | null;
    announcementId: string | null;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/system-settings");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // silent fail — ব্যানার না দেখালেও অ্যাপের বাকি কাজ ঠিক থাকা উচিত
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    if (!data?.announcementId) return;
    const key = `${DISMISS_KEY_PREFIX}${data.announcementId}`;
    setDismissed(localStorage.getItem(key) === "1");
  }, [data?.announcementId]);

  if (status !== "authenticated" || !data || !data.announcementEnabled || !data.announcementText || dismissed) {
    return null;
  }

  function handleDismiss() {
    if (data?.announcementId) {
      localStorage.setItem(`${DISMISS_KEY_PREFIX}${data.announcementId}`, "1");
    }
    setDismissed(true);
  }

  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 px-4 py-2.5 text-sm bg-linear-to-r from-violet-600 to-violet-800 text-white"
      )}
      role="status"
    >
      <Megaphone className="h-4 w-4 shrink-0" />
      <p className="flex-1 min-w-0 font-medium">{data.announcementText}</p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="ঘোষণা বন্ধ করো"
        className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
