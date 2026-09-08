"use client";

// ===================================================================
// Offline supported-mutation queue — গ্লোবাল ইন্ডিকেটর (কতগুলো অ্যাকশন সিঙ্ক
// হওয়ার অপেক্ষায় আছে)
// -------------------------------------------------------------------
// App layout এ একবার মাউন্ট করা হয় (fixed position ব্যাজ) — pending
// queue থাকলেই দেখা যায়, নাহলে সম্পূর্ণ হাইড থাকে।
// ===================================================================
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function OfflineSyncIndicator() {
  const { queueCount, isOnline, syncNow } = useOfflineSync();

  if (queueCount === 0) return null;

  return (
    // 🔧 Bottom Navigation Bar এর সাথে ওভারল্যাপ এড়াতে মোবাইলে bottom
    // offset বাড়ানো হয়েছে (pwa-install-prompt.tsx এর একই প্যাটার্ন)
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 z-50 flex items-center gap-2 rounded-full bg-amber-500 text-white text-xs font-medium px-3 py-2 shadow-lg lg:bottom-4">
      <CloudOff className="h-3.5 w-3.5" />
      <span>
        {queueCount}টা অ্যাকশন {isOnline ? "সিঙ্ক হওয়ার অপেক্ষায়" : "অফলাইনে সংরক্ষিত"}
      </span>
      {isOnline && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 text-white hover:bg-white/20 hover:text-white"
                onClick={() => void syncNow()}
                aria-label="এখনই সিঙ্ক করো"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            }
          />
          <TooltipContent>এখনই সিঙ্ক করো</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
