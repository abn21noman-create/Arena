"use client";

// ===================================================================
// Onboarding পেজ — অ্যাকাউন্ট তৈরির পর একবারই দেখানো হবে
// ইউজারের HSC ব্যাচ ও বোর্ড জেনে নেওয়া হয়
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, Loader2, Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

const BOARDS = [
  "ঢাকা",
  "রাজশাহী",
  "চট্টগ্রাম",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "দিনাজপুর",
  "ময়মনসিংহ",
  "কুমিল্লা",
  "যশোর",
];

const BATCHES = [2026, 2027, 2028, 2029];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hscBatch, setHscBatch] = useState(2028);
  const [board, setBoard] = useState("ঢাকা");

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hscBatch, board }),
      });

      if (!res.ok) {
        toast.error("তথ্য সেভ করতে সমস্যা হয়েছে");
        setLoading(false);
        return;
      }

      toast.success("প্রোফাইল সেটআপ সম্পন্ন! এখন পড়াশোনা শুরু করা যাক 🚀");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-hidden px-4 py-8">
      <div className="aurora-bg" />
      <div className="grain-overlay" />
      <FadeIn duration={0.5}>
      <Card className="w-full max-w-lg p-8 glass-panel shadow-xl">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-3 glow-ring">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">তোমার প্রোফাইল সেটআপ করি</h1>
          <p className="text-sm text-muted-foreground mt-1">
            এই তথ্য দিয়ে আমরা তোমার জন্য পরিকল্পনা সাজাবো
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="mb-3 block">তোমার HSC ব্যাচ কোনটা?</Label>
            <div className="grid grid-cols-4 gap-2">
              {BATCHES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setHscBatch(b)}
                  className={cn(
                    "rounded-lg border py-2.5 text-sm font-medium transition-colors relative",
                    hscBatch === b
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {b}
                  {hscBatch === b && (
                    <Check className="h-3 w-3 absolute top-1 right-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">তোমার শিক্ষা বোর্ড</Label>
            <div className="grid grid-cols-3 gap-2">
              {BOARDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBoard(b)}
                  className={cn(
                    "rounded-lg border py-2 text-sm transition-colors",
                    board === b
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs leading-5 text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> তোমার data controls
            </p>
            <p className="mt-1">
              AI/PDF ব্যবহার করলে input configured provider-এ যেতে পারে। Strict Focus, Accessibility, push, public profile ও Admin analytics আলাদা opt-in; Settings থেকে export/delete করা যায়।
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacy</Link>
              <Link href="/terms" className="font-semibold text-primary hover:underline">Terms</Link>
              <Link href="/account-deletion" className="font-semibold text-primary hover:underline">Data controls</Link>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            শুরু করি
          </Button>
        </div>
      </Card>
      </FadeIn>
    </div>
  );
}
