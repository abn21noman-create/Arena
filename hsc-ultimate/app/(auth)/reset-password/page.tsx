"use client";

// ===================================================================
// Reset Password পেজ — URL এর ?token= প্যারামিটার দিয়ে নতুন পাসওয়ার্ড সেট
// ===================================================================
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate() {
    const errors: { password?: string; confirmPassword?: string } = {};
    if (!form.password) errors.password = "পাসওয়ার্ড আবশ্যক";
    else if (form.password.length < 6) errors.password = "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে";
    if (!form.confirmPassword) errors.confirmPassword = "পাসওয়ার্ড আবার লিখো";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "দুটো পাসওয়ার্ড মিলছে না";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("রিসেট লিংকটি সঠিক না");
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "পাসওয়ার্ড পরিবর্তন করা যায়নি");
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-destructive font-medium">
          এই লিংকটি সঠিক না বা মেয়াদ শেষ হয়ে গেছে
        </p>
        <Button render={<Link href="/forgot-password" />} variant="outline" className="w-full">
            নতুন রিসেট লিংক চাও
          </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="font-medium">পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!</p>
        <p className="text-sm text-muted-foreground">
          লগইন পেজে নিয়ে যাওয়া হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="অন্তত ৬ অক্ষর"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
          }}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          required
        />
        {fieldErrors.password && (
          <p id="password-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">পাসওয়ার্ড আবার লিখো</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="আবার লিখো"
          value={form.confirmPassword}
          onChange={(e) => {
            setForm({ ...form, confirmPassword: e.target.value });
            if (fieldErrors.confirmPassword)
              setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
          }}
          aria-invalid={!!fieldErrors.confirmPassword}
          aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
          required
        />
        {fieldErrors.confirmPassword && (
          <p id="confirm-password-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        পাসওয়ার্ড সেট করো
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-xl font-bold">নতুন পাসওয়ার্ড সেট করো</h1>
          <p className="text-sm text-muted-foreground mt-1">
            একটা শক্তিশালী পাসওয়ার্ড দাও যা মনে রাখতে পারবে
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </Card>
      </FadeIn>
    </div>
  );
}
