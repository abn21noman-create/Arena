"use client";

// ===================================================================
// Login পেজ
// -------------------------------------------------------------------
// 🔧 `useSearchParams()` (ban query param চেক করার জন্য) ব্যবহার করলে
// Next.js এ static generation এর জন্য একটা Suspense boundary লাগে —
// `app/(auth)/reset-password/page.tsx` এর established প্যাটার্ন
// অনুসরণ করে ফর্মটা একটা আলাদা child component এ বের করে আনা হয়েছে।
// ===================================================================
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  // ফর্ম ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Admin Panel Power-up — Ban হওয়া ইউজারকে proxy.ts mid-session
  // logout করার সময় ?banned=1 query param দিয়ে এখানে পাঠায়, একটা
  // স্পষ্ট (কিন্তু সংক্ষিপ্ত, ban reason প্রকাশ না করে) বার্তা দেখানো হয়
  useEffect(() => {
    if (searchParams.get("banned") === "1") {
      toast.error(
        "তোমার অ্যাকাউন্টটি স্থগিত (suspended) করা হয়েছে। বিস্তারিত জানতে সাপোর্টের সাথে যোগাযোগ করো।",
        { duration: 8000 }
      );
    }
  }, [searchParams]);

  function validate() {
    const errors: { email?: string; password?: string } = {};
    if (!form.email.trim()) errors.email = "ইমেইল আবশ্যক";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "সঠিক ইমেইল দাও";
    if (!form.password) errors.password = "পাসওয়ার্ড আবশ্যক";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        toast.error("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে");
        setLoading(false);
        return;
      }

      toast.success("সফলভাবে লগইন হয়েছে!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login submission error:", err);
      toast.error("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে, আবার চেষ্টা করো");
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">ইমেইল</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
            }}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            required
          />
          {fieldErrors.email && (
            <p id="email-error" role="alert" className="text-xs text-destructive">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছো?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="তোমার পাসওয়ার্ড"
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          লগইন করো
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        অ্যাকাউন্ট নেই?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          রেজিস্ট্রেশন করো
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="aurora-bg" />
      <div className="grain-overlay" />
      <FadeIn duration={0.5}>
        <Card className="w-full max-w-md p-8 glass-panel shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-3 glow-ring">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">আবার স্বাগতম!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              তোমার HSC Ultimate অ্যাকাউন্টে লগইন করো
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </Card>
      </FadeIn>
    </div>
  );
}
