"use client";

// ===================================================================
// Forgot Password পেজ — ইমেইল দিয়ে রিসেট লিংক চাওয়া
// ===================================================================
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক
  const [emailError, setEmailError] = useState<string | undefined>();

  function validate() {
    if (!email.trim()) {
      setEmailError("ইমেইল আবশ্যক");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("সঠিক ইমেইল দাও");
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // ইউজার এনুমারেশন এড়াতে, error হলেও UI তে success ই দেখাবো
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 200) {
        toast.error(data.error ?? "কিছু একটা সমস্যা হয়েছে");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="aurora-bg" />
      <div className="grain-overlay" />
      <FadeIn duration={0.5}>
      <Card className="w-full max-w-md p-8 glass-panel shadow-xl">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-3 glow-ring">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">পাসওয়ার্ড ভুলে গেছো?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            চিন্তা নেই! তোমার ইমেইল দাও, আমরা রিসেট লিংক পাঠিয়ে দিচ্ছি
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
              <MailCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium">ইমেইল পাঠানো হয়েছে!</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">{email}</span> এ যদি অ্যাকাউন্ট
                থাকে, একটা রিসেট লিংক পাঠানো হয়েছে। ইনবক্স (ও স্প্যাম ফোল্ডার)
                চেক করো।
              </p>
            </div>
            <Button render={<Link href="/login" />} variant="outline" className="w-full gap-2 mt-2">
                <ArrowLeft className="h-4 w-4" />
                লগইন পেজে ফিরে যাও
              </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(undefined);
                }}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                required
              />
              {emailError && (
                <p id="email-error" role="alert" className="text-xs text-destructive">
                  {emailError}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              রিসেট লিংক পাঠাও
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              লগইন পেজে ফিরে যাও
            </Link>
          </form>
        )}
      </Card>
      </FadeIn>
    </div>
  );
}
