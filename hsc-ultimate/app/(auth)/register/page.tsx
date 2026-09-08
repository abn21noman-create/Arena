"use client";

// ===================================================================
// Registration পেজ — নতুন অ্যাকাউন্ট তৈরি করার জন্য
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import {
  CURRENT_AGE_ASSURANCE_VERSION,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  POLICY_METADATA,
} from "@/lib/privacy-compliance";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [ageAssuranceConfirmed, setAgeAssuranceConfirmed] = useState(false);
  // ফর্ম ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    policy?: string;
    age?: string;
  }>({});

  function validate() {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      policy?: string;
      age?: string;
    } = {};
    if (!form.name.trim()) errors.name = "নাম আবশ্যক";
    if (!form.email.trim()) errors.email = "ইমেইল আবশ্যক";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "সঠিক ইমেইল দাও";
    if (!form.password) errors.password = "পাসওয়ার্ড আবশ্যক";
    else if (form.password.length < 6) errors.password = "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে";
    if (!policyAccepted) errors.policy = "Privacy Policy ও Terms মেনে নিতে হবে";
    if (!ageAssuranceConfirmed) {
      errors.age = "বয়স ও guardian assurance নিশ্চিত করতে হবে";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          policyAccepted,
          ageAssuranceConfirmed,
          privacyVersion: CURRENT_PRIVACY_VERSION,
          termsVersion: CURRENT_TERMS_VERSION,
          ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
        setLoading(false);
        return;
      }

      // রেজিস্ট্রেশনের পর অটোমেটিক লগইন করিয়ে দেওয়া হচ্ছে
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/onboarding",
      });

      if (signInRes?.error) {
        toast.error("অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু লগইন করতে সমস্যা হয়েছে। ম্যানুয়ালি লগইন করুন।");
        router.push("/login");
        return;
      }

      toast.success("স্বাগতম! এখন তোমার প্রোফাইল সেটআপ করি চলো।");
      router.push("/onboarding");
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
      <Card className="w-full max-w-md p-8 glass-panel shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-3 glow-ring">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">নতুন অ্যাকাউন্ট তৈরি করো</h1>
          <p className="text-sm text-muted-foreground mt-1">
            HSC Ultimate এ তোমার যাত্রা শুরু হোক
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">নাম</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="তোমার নাম"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
              }}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              required
            />
            {fieldErrors.name && (
              <p id="name-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.name}
              </p>
            )}
          </div>
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
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="কমপক্ষে ৬ অক্ষর"
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

          <div className="space-y-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-violet-500" />
              Privacy ও age assurance
            </div>
            <label className="flex items-start gap-2.5 text-xs leading-5">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-violet-600"
                checked={policyAccepted}
                onChange={(event) => {
                  setPolicyAccepted(event.target.checked);
                  if (fieldErrors.policy) {
                    setFieldErrors({ ...fieldErrors, policy: undefined });
                  }
                }}
                aria-invalid={!!fieldErrors.policy}
                aria-describedby={fieldErrors.policy ? "policy-error" : "policy-version"}
              />
              <span>
                আমি <Link href="/privacy" className="font-semibold text-primary hover:underline">গোপনীয়তা নীতি</Link> (v{CURRENT_PRIVACY_VERSION}) পড়েছি এবং <Link href="/terms" className="font-semibold text-primary hover:underline">ব্যবহারের শর্তাবলি</Link> (v{CURRENT_TERMS_VERSION}) মেনে নিচ্ছি।
              </span>
            </label>
            {fieldErrors.policy && <p id="policy-error" role="alert" className="text-xs text-destructive">{fieldErrors.policy}</p>}
            <label className="flex items-start gap-2.5 text-xs leading-5">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-violet-600"
                checked={ageAssuranceConfirmed}
                onChange={(event) => {
                  setAgeAssuranceConfirmed(event.target.checked);
                  if (fieldErrors.age) setFieldErrors({ ...fieldErrors, age: undefined });
                }}
                aria-invalid={!!fieldErrors.age}
                aria-describedby={fieldErrors.age ? "age-error" : undefined}
              />
              <span>
                আমার বয়স অন্তত {POLICY_METADATA.ageAssurance.minimumAge} বছর; ১৮ বছরের কম হলে parent/legal guardian-এর awareness ও permission আছে।
              </span>
            </label>
            {fieldErrors.age && <p id="age-error" role="alert" className="text-xs text-destructive">{fieldErrors.age}</p>}
            <p id="policy-version" className="text-xs leading-4 text-muted-foreground">
              Acceptance-এর exact version/time record হবে; optional Focus, Accessibility, push ও public profile-এর consent আলাদা।
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            অ্যাকাউন্ট তৈরি করো
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            লগইন করো
          </Link>
        </p>
      </Card>
      </FadeIn>
    </div>
  );
}
