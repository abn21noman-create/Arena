import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";

// ===================================================================
// Global 404 Not Found পেজ (App Router special file)
// -------------------------------------------------------------------
// কোনো route match না হলে (ভুল URL, ডিলিট করা রিসোর্স, ইত্যাদি) Next.js
// স্বয়ংক্রিয়ভাবে এই কম্পোনেন্ট রেন্ডার করে — এতদিন এই ফাইল না থাকায়
// Next.js এর ডিফল্ট বেয়ার (unstyled, ইংরেজি) 404 পেজ দেখাচ্ছিল, যেটা
// HSC Ultimate এর ব্র্যান্ডিং/ভাষার সাথে সামঞ্জস্যপূর্ণ ছিল না।
// এটা Server Component (কোনো "use client" দরকার নেই), তাই দ্রুত লোড হয়।
// ===================================================================
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <Compass className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-6xl font-bold tracking-tight mb-2">৪০৪</h1>
      <h2 className="text-xl font-semibold mb-2">পেজটি খুঁজে পাওয়া যায়নি</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        তুমি যে পেজটি খুঁজছো সেটা হয়তো মুছে ফেলা হয়েছে, নাম পরিবর্তন হয়েছে,
        অথবা সাময়িকভাবে অনুপলব্ধ।
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button render={<Link href="/dashboard" />} className="gap-2">
            <Home className="h-4 w-4" />
            ড্যাশবোর্ডে ফিরে যাও
          </Button>
        <Button render={<Link href="/" />} variant="outline">হোমপেজ</Button>
      </div>
    </div>
  );
}
