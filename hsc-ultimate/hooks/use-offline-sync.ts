"use client";

// ===================================================================
// Offline queue for explicitly integrated mutations — React Hook
// -------------------------------------------------------------------
// এই হুক দুটো জিনিস করে:
// ১. `offlineFetch()` — সাধারণ fetch() এর মতোই, কিন্তু নেটওয়ার্ক এরর
//    হলে (অফলাইন) রিকোয়েস্টটা IndexedDB queue তে সেভ করে দেয় এবং
//    একটা "queued" রেজাল্ট রিটার্ন করে (UI যেন optimistic আচরণ করতে
//    পারে, ইউজারকে ব্লক না করে)
// ২. পেজ লোড হওয়ার সময় ও window "online" ইভেন্টে queue প্রসেস করে
//    (ইন্টারনেট ফিরে এলে স্বয়ংক্রিয়ভাবে sync হয়ে যায়), সফল/ব্যর্থ
//    হলে toast দিয়ে জানায়
// ===================================================================
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { enqueueAction, getQueueCount } from "@/lib/offline-queue";
import { processQueue } from "@/lib/offline-sync";

interface OfflineFetchOptions {
  url: string;
  method: "POST" | "PATCH" | "DELETE";
  body?: unknown;
  label: string; // sync toast/queue UI তে দেখানোর জন্য মানুষ-পড়ার-উপযোগী বর্ণনা
}

export type OfflineFetchResult =
  | { status: "success"; response: Response }
  | { status: "queued" }
  | { status: "error"; response: Response };

/**
 * সব ওপেন ট্যাব/কম্পোনেন্টে queue count sync রাখার জন্য সাধারণ
 * pub-sub (module-level, React context এড়িয়ে সরল রাখা হয়েছে)
 */
type Listener = (count: number) => void;
const listeners = new Set<Listener>();
function notifyListeners(count: number) {
  listeners.forEach((l) => l(count));
}

export function useOfflineSync() {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const refreshQueueCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setQueueCount(count);
      notifyListeners(count);
    } catch {
      // IndexedDB না থাকলে (পুরনো ব্রাউজার) silent fail
    }
  }, []);

  const syncNow = useCallback(async () => {
    const result = await processQueue();
    if (result.succeeded.length > 0) {
      toast.success(
        `✅ ${result.succeeded.length}টা অফলাইন অ্যাকশন সফলভাবে সিঙ্ক হয়েছে!`
      );
    }
    if (result.abandoned.length > 0) {
      toast.error(
        `⚠️ ${result.abandoned.length}টা অফলাইন অ্যাকশন সিঙ্ক করা যায়নি (বাতিল করা হয়েছে)`
      );
    }
    await refreshQueueCount();
  }, [refreshQueueCount]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    void refreshQueueCount();

    function handleOnline() {
      setIsOnline(true);
      toast.info("🌐 ইন্টারনেট সংযোগ ফিরে এসেছে, সিঙ্ক করা হচ্ছে...");
      void syncNow();
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const listener: Listener = (count) => setQueueCount(count);
    listeners.add(listener);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      listeners.delete(listener);
    };
  }, [refreshQueueCount, syncNow]);

  const offlineFetch = useCallback(
    async ({ url, method, body, label }: OfflineFetchOptions): Promise<OfflineFetchResult> => {
      try {
        const res = await fetch(url, {
          method,
          headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (res.ok) return { status: "success", response: res };
        return { status: "error", response: res };
      } catch {
        // নেটওয়ার্ক এরর — অফলাইনে আছি, queue তে সেভ করা হচ্ছে
        await enqueueAction({
          url,
          method,
          body: body !== undefined ? JSON.stringify(body) : null,
          label,
        });
        await refreshQueueCount();
        toast.info(`📴 অফলাইনে আছো — "${label}" সংরক্ষণ করা হয়েছে, নেট ফিরলে সিঙ্ক হবে`);
        return { status: "queued" };
      }
    },
    [refreshQueueCount]
  );

  return { offlineFetch, queueCount, isOnline, syncNow };
}
