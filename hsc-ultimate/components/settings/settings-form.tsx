"use client";

// ===================================================================
// Settings ফর্ম — প্রোফাইল এডিট (নাম/বোর্ড/ব্যাচ), পাসওয়ার্ড পরিবর্তন,
// থিম টগল — সব এক জায়গায় ট্যাব আকারে
// ===================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccentColorPicker } from "@/components/settings/accent-color-picker";
import { AccessibilityTab } from "@/components/settings/accessibility-tab";
import { PublicProfileTab } from "@/components/settings/public-profile-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { DangerZoneTab } from "@/components/settings/danger-zone-tab";
import { PrivacyControlsTab } from "@/components/settings/privacy-controls-tab";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  User,
  KeyRound,
  Palette,
  Check,
  Accessibility,
  Globe,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    board: string | null;
    hscBatch: number;
    xp: number;
    level: number;
    streakCount: number;
  };
  policyAcceptance: {
    privacyVersion: string;
    termsVersion: string;
    ageAssuranceVersion: string;
    source: string;
    acceptedAt: Date | string;
  } | null;
}

export function SettingsForm({ user, policyAcceptance }: SettingsFormProps) {
  const router = useRouter();

  // Profile tab state
  const [profileLoading, setProfileLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [board, setBoard] = useState(user.board ?? "ঢাকা");
  const [hscBatch, setHscBatch] = useState(user.hscBatch);
  // ফিল্ড-লেভেল ভ্যালিডেশন এরর — কীবোর্ড/স্ক্রিন-রিডার ইউজারদের জন্য
  // aria-invalid+aria-describedby দিয়ে ইনলাইন ফিডব্যাক (আগে শুধু toast এ ছিল)
  const [profileErrors, setProfileErrors] = useState<{ name?: string }>({});

  // Password tab state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  function validateProfile() {
    const errors: { name?: string } = {};
    if (!name.trim()) errors.name = "নাম আবশ্যক";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validatePassword() {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "বর্তমান পাসওয়ার্ড আবশ্যক";
    if (!passwordForm.newPassword) errors.newPassword = "নতুন পাসওয়ার্ড আবশ্যক";
    else if (passwordForm.newPassword.length < 6)
      errors.newPassword = "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে";
    if (!passwordForm.confirmPassword) errors.confirmPassword = "পাসওয়ার্ড আবার লিখো";
    else if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = "নতুন পাসওয়ার্ড দুটো মিলছে না";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateProfile()) return;
    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, board, hscBatch }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "প্রোফাইল আপডেট করা যায়নি");
        return;
      }

      toast.success("প্রোফাইল আপডেট হয়েছে!");
      router.refresh();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "পাসওয়ার্ড পরিবর্তন করা যায়নি");
        return;
      }

      toast.success("পাসওয়ার্ড পরিবর্তন হয়েছে—নিরাপত্তার জন্য আবার login করুন");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      await signOut({ redirectTo: "/login?session=revoked" });
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setPasswordLoading(false);
    }
  }

  const initial = user.name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            প্রোফাইল ও সেটিংস
          </h1>
          <p className="text-sm text-muted-foreground">
            তোমার অ্যাকাউন্টের তথ্য পরিবর্তন করো
          </p>
        </div>
      </div>

      {/* 🎨 UI/UX রিডিজাইন: GitHub/Linear-স্টাইল বড় প্রোফাইল হেডার কার্ড —
          আগে সরাসরি ট্যাব দিয়ে শুরু হতো, কোনো প্রোফাইল সামারি ছিল না।
          এখন বড় Avatar + নাম + ব্যাচ/বোর্ড + XP/Level/Streak স্ট্যাট
          একসাথে দেখা যায় (Public Profile পেজের একই ভিজ্যুয়াল ভাষা
          পুনর্ব্যবহার করে সামঞ্জস্যপূর্ণ রাখা হয়েছে)। */}
      <Card className="mb-6 overflow-hidden p-0 border-none">
        <div className="glass-hero relative bg-linear-to-br from-violet-700 via-fuchsia-700 to-fuchsia-800 px-6 pt-8 pb-16 text-white">
          {/* প্রিমিয়াম glassmorphism — ভাসমান blur orb (established
              `.glass-hero-orb`), গ্র্যাডিয়েন্ট ব্যাকগ্রাউন্ডের সাথে
              মিশে "living" গভীরতা তৈরি করে (Apple visionOS/macOS Big
              Sur স্টাইল প্যাটার্ন, গবেষণা থেকে অনুপ্রাণিত) */}
          <div className="glass-hero-orb h-56 w-56 bg-violet-300/25" style={{ top: "-5rem", left: "-3rem" }} />
          <div className="glass-hero-orb h-40 w-40 bg-fuchsia-200/20" style={{ bottom: "-2rem", right: "10%" }} />
          <div className="relative z-10 flex items-center gap-4">
            <Avatar className="avatar-glow h-16 w-16 shrink-0 ring-4 ring-white/30">
              <AvatarFallback className="glass-chip text-2xl font-bold text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-heading text-lg font-bold truncate">{user.name}</p>
              <p className="text-xs text-white/80 truncate">{user.email}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
                <GraduationCap className="h-3.5 w-3.5" />
                HSC {user.hscBatch} ব্যাচ {user.board && `• ${user.board} বোর্ড`}
              </p>
            </div>
          </div>
        </div>
        {/* স্ট্যাট স্ট্রিপ — হেডারের গ্রেডিয়েন্ট থেকে ওভারল্যাপ করে ভাসমান
            কার্ডের মতো দেখায় (Linear settings summary strip প্যাটার্ন)।
            🐛 এখানে established glassmorphism নির্দেশিকা মেনে ইচ্ছাকৃতভাবে
            পূর্ণ `.glass-chip` (স্বচ্ছ) ব্যবহার করা হয়নি — প্রথমবার
            পূর্ণ glass দিয়ে টেস্ট করার সময় দেখা গেছে card-টার নিচের
            অংশ গ্রেডিয়েন্ট হেডারের বাইরে সাদা page-background এর উপর
            পড়ে যায়, ফলে সাদা টেক্সট সাদা glass-এর উপর অদৃশ্য হয়ে
            যাচ্ছিল (established নীতি: "Data surfaces should NOT be
            full glass, near-opaque রাখতে হবে সংখ্যা পড়ার জন্য")। তাই
            near-opaque `bg-card/95` + `backdrop-blur` — হালকা glass
            touch কিন্তু background যাই হোক না কেন সবসময় readable। */}
        <div className="relative z-10 -mt-10 mx-4 mb-4 grid grid-cols-3 gap-2 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur-md sm:mx-6">
          <div className="text-center">
            <Sparkles className="mx-auto mb-1 h-4 w-4 text-primary" />
            <p className="text-sm font-bold">{user.level}</p>
            <p className="text-xs text-muted-foreground">লেভেল</p>
          </div>
          <div className="border-x text-center">
            <Flame className="mx-auto mb-1 h-4 w-4 text-orange-600 dark:text-orange-400" />
            <p className="text-sm font-bold">{user.streakCount}</p>
            <p className="text-xs text-muted-foreground">দিনের স্ট্রিক</p>
          </div>
          <div className="text-center">
            <span className="mx-auto mb-1 block text-base leading-none">⚡</span>
            <p className="text-sm font-bold">{user.xp}</p>
            <p className="text-xs text-muted-foreground">মোট XP</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 mb-6">
          <TabsList className="w-max min-w-full sm:w-fit">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            প্রোফাইল
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-1.5">
            <KeyRound className="h-3.5 w-3.5" />
            পাসওয়ার্ড
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            থিম
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="gap-1.5">
            <Accessibility className="h-3.5 w-3.5" />
            অ্যাক্সেসিবিলিটি
          </TabsTrigger>
          <TabsTrigger value="public-profile" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            পাবলিক প্রোফাইল
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            ইমেইল নোটিফিকেশন
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="danger-zone" className="gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            ডেটা ও অ্যাকাউন্ট
          </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">ইমেইল</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">
                  ইমেইল পরিবর্তন করা যাবে না
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">নাম</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (profileErrors.name) setProfileErrors({});
                  }}
                  aria-invalid={!!profileErrors.name}
                  aria-describedby={profileErrors.name ? "name-error" : undefined}
                  required
                />
                {profileErrors.name && (
                  <p id="name-error" role="alert" className="text-xs text-destructive">
                    {profileErrors.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">তোমার বোর্ড</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {BOARDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBoard(b)}
                      aria-pressed={board === b}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                        board === b
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:bg-muted"
                      )}
                    >
                      {board === b && <Check className="h-3 w-3" />}
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">HSC ব্যাচ</Label>
                <div className="grid grid-cols-4 gap-2">
                  {BATCHES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setHscBatch(b)}
                      aria-pressed={hscBatch === b}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                        hscBatch === b
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:bg-muted"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={profileLoading} className="gap-2">
                {profileLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                সেভ করো
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
                <PasswordInput
                  id="currentPassword"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    });
                    if (passwordErrors.currentPassword)
                      setPasswordErrors({ ...passwordErrors, currentPassword: undefined });
                  }}
                  aria-invalid={!!passwordErrors.currentPassword}
                  aria-describedby={
                    passwordErrors.currentPassword ? "current-password-error" : undefined
                  }
                  required
                />
                {passwordErrors.currentPassword && (
                  <p id="current-password-error" role="alert" className="text-xs text-destructive">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                <PasswordInput
                  id="newPassword"
                  autoComplete="new-password"
                  placeholder="অন্তত ৬ অক্ষর"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    });
                    if (passwordErrors.newPassword)
                      setPasswordErrors({ ...passwordErrors, newPassword: undefined });
                  }}
                  aria-invalid={!!passwordErrors.newPassword}
                  aria-describedby={
                    passwordErrors.newPassword ? "new-password-error" : undefined
                  }
                  required
                />
                {passwordErrors.newPassword && (
                  <p id="new-password-error" role="alert" className="text-xs text-destructive">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">নতুন পাসওয়ার্ড আবার লিখো</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    });
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                  }}
                  aria-invalid={!!passwordErrors.confirmPassword}
                  aria-describedby={
                    passwordErrors.confirmPassword ? "confirm-password-error" : undefined
                  }
                  required
                />
                {passwordErrors.confirmPassword && (
                  <p id="confirm-password-error" role="alert" className="text-xs text-destructive">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={passwordLoading} className="gap-2">
                {passwordLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                পাসওয়ার্ড পরিবর্তন করো
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">থিম মোড</p>
                <p className="text-sm text-muted-foreground">
                  লাইট বা ডার্ক মোড বেছে নাও (সিস্টেম সেটিংস অনুযায়ীও চলতে পারে)
                </p>
              </div>
              <ThemeToggle />
            </div>
          </Card>

          <Card className="p-6">
            <p className="font-medium mb-1">অ্যাকসেন্ট রঙ</p>
            <p className="text-sm text-muted-foreground mb-4">
              প্ল্যাটফর্মের প্রধান রঙ (বাটন/লিংক/হাইলাইট) নিজের পছন্দমতো বেছে
              নাও — Reading Room এর থিমের সাথে মিলিয়ে ডিজাইন করা হয়েছে
            </p>
            <AccentColorPicker />
          </Card>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility">
          <AccessibilityTab />
        </TabsContent>

        {/* Public Profile Tab */}
        <TabsContent value="public-profile">
          <PublicProfileTab />
        </TabsContent>

        {/* Notifications Tab (Weekly Email Digest) */}
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        {/* Versioned policies + optional processing controls */}
        <TabsContent value="privacy">
          <PrivacyControlsTab initialAcceptance={policyAcceptance} />
        </TabsContent>

        {/* Danger Zone Tab (Data Export + Account Deletion) */}
        <TabsContent value="danger-zone">
          <DangerZoneTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
