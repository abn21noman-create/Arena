"use client";

// ===================================================================
// Global Error Boundary (App Router special file: error.tsx)
// -------------------------------------------------------------------
// এই ফাইল একটা "use client" কম্পোনেন্ট হতে হবে (Next.js এর নিয়ম) —
// কারণ error boundary React এর client-side error catching mechanism
// ব্যবহার করে। কোনো পেজ/সেগমেন্টে রেন্ডারিং এর সময় unhandled error
// হলে (যেমন কোনো API রেসপন্স parse করতে ব্যর্থ হওয়া, undefined property
// অ্যাক্সেস ইত্যাদি) এই কম্পোনেন্ট রেন্ডার হয় সাদা স্ক্রিন/crash এর বদলে।
//
// নোট: এটা root segment (app/error.tsx) — root layout এর ভেতরের যেকোনো
// পেজে error হলে এটা catch করবে, কিন্তু layout.tsx নিজেই crash করলে
// এটা কাজ করবে না (তার জন্য global-error.tsx লাগে, সেটাও নিচে আলাদা
// ফাইলে যোগ করা হয়েছে)।
// ===================================================================
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ডেভেলপমেন্টে/প্রোডাকশনে কনসোলে error লগ করা হচ্ছে ডিবাগিং এর জন্য
    // (ভবিষ্যতে চাইলে এখানে external error-tracking সার্ভিসেও পাঠানো যাবে)
    console.error("HSC Ultimate — Unhandled Client Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold mb-2">একটি সমস্যা হয়েছে</h1>
      <p className="text-muted-foreground max-w-sm mb-8">
        দুঃখিত, পেজটি লোড করতে গিয়ে একটা অপ্রত্যাশিত সমস্যা হয়েছে। আবার
        চেষ্টা করো, সমস্যা থাকলে ড্যাশবোর্ডে ফিরে যাও।
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          আবার চেষ্টা করো
        </Button>
        <Button render={<Link href="/dashboard" />} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            ড্যাশবোর্ড
          </Button>
      </div>
    </div>
  );
}
