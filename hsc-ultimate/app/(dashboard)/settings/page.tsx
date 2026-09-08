// ===================================================================
// HSC ULTIMATE — Premium Settings 2026
// -------------------------------------------------------------------
// Aurora glassmorphic design
// ===================================================================
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Palette, ShieldCheck } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      board: true,
      hscBatch: true,
      xp: true,
      level: true,
      streakCount: true,
      policyAcceptances: {
        orderBy: { acceptedAt: "desc" },
        take: 1,
        select: {
          privacyVersion: true,
          termsVersion: true,
          ageAssuranceVersion: true,
          source: true,
          acceptedAt: true,
        },
      },
    },
  });

  if (!user) redirect("/login");
  const { policyAcceptances, ...settingsUser } = user;

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" className="rounded-full shrink-0" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                <SettingsIcon className="h-3 w-3 mr-1" />
                Settings
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Profile, theme, notifications, privacy ও accessibility
            </p>
          </div>
        </div>

        {/* Quick Links Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: User, label: "Profile", color: "from-blue-500 to-cyan-500" },
            { icon: Palette, label: "Theme", color: "from-violet-500 to-fuchsia-500" },
            { icon: Bell, label: "Notifications", color: "from-amber-500 to-orange-500" },
            { icon: ShieldCheck, label: "Privacy", color: "from-cyan-500 to-violet-500" },
          ].map((item) => (
            <GlassCard key={item.label} className="p-3 sm:p-4 text-center" variant="subtle">
              <div className={`inline-flex h-9 w-9 rounded-xl bg-gradient-to-br ${item.color} items-center justify-center mb-2`}>
                <item.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-semibold">{item.label}</p>
            </GlassCard>
          ))}
        </div>

        <SettingsForm
          user={settingsUser}
          policyAcceptance={policyAcceptances[0]
            ? {
                ...policyAcceptances[0],
                acceptedAt: policyAcceptances[0].acceptedAt.toISOString(),
              }
            : null}
        />
      </div>
    </AuroraBackground>
  );
}
