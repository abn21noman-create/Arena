"use client";

// ===================================================================
// PWA Install Prompt — "Add to Home Screen" এর জন্য কাস্টম ব্যানার
// -------------------------------------------------------------------
// ব্যবহারকারী মোবাইলে Native App এর মতো experience চান কিন্তু
// deploy না হওয়া পর্যন্ত real app store এ পাবলিশ করা যাবে না। PWA
// "Add to Home Screen" এখনই সম্পূর্ণ ফ্রি ও কার্যকর বিকল্প — এই
// কম্পোনেন্ট ব্রাউজারের `beforeinstallprompt` ইভেন্ট শোনে এবং একটা
// দৃষ্টিনন্দন কাস্টম ব্যানার দেখায় (browser এর ডিফল্ট mini-infobar এর
// চেয়ে বেশি discoverable, কারণ অনেক ইউজার সেটা খেয়াল করে না)।
// -------------------------------------------------------------------
// আচরণ:
//   - Chrome/Edge/Android এ `beforeinstallprompt` ইভেন্ট সাপোর্ট করে
//     — ব্যানার দেখায়, ক্লিক করলে নেটিভ ইনস্টল ডায়ালগ ওপেন হয়
//   - iOS Safari এ এই ইভেন্ট সাপোর্ট নেই (Apple এর সীমাবদ্ধতা) —
//     পরিবর্তে ম্যানুয়াল "শেয়ার বাটন → Add to Home Screen" নির্দেশনা
//     দেখানো হয় (iOS ডিটেক্ট করে)
//   - ইতিমধ্যে ইনস্টল করা থাকলে (standalone mode) ব্যানার দেখানো হয় না
//   - ইউজার "পরে করব" চাপলে ৭ দিনের জন্য localStorage এ মনে রাখা হয়
//     (বারবার বিরক্ত না করার জন্য)
// ===================================================================
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";

const DISMISS_KEY = "hsc-ultimate-pwa-install-dismissed-at";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari এ standalone মোড আলাদাভাবে detect করতে হয়
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;
  const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS এ beforeinstallprompt সাপোর্ট নেই, তাই আলাদাভাবে ম্যানুয়াল hint দেখানো
    if (isIOS()) {
      setShowIOSHint(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    // 🔧 Bottom Navigation Bar (মোবাইলে fixed, ৩.৫rem উচ্চতা + safe-area)
    // এর সাথে ওভারল্যাপ এড়াতে মোবাইলে bottom offset বাড়ানো হয়েছে,
    // sm ব্রেকপয়েন্টের উপরে (যেখানে bottom nav hidden) আগের bottom-4 ই থাকে
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm lg:bottom-4">
      <div className="flex items-center gap-3 rounded-xl border bg-card shadow-lg p-4">
        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">HSC Ultimate ইনস্টল করো</p>
          {showIOSHint ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
              নিচের <Share className="h-3 w-3 inline shrink-0" /> শেয়ার বাটনে ট্যাপ করে
              &ldquo;Add to Home Screen&rdquo; বেছে নাও
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              হোম স্ক্রিনে যোগ করে অ্যাপের মতো ব্যবহার করো, অফলাইনেও কিছু ফিচার চলবে
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!showIOSHint && (
            <Button size="sm" onClick={handleInstallClick} className="gap-1.5">
              ইনস্টল
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            aria-label="বন্ধ করো"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
