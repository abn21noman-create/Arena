import type { ReactNode } from "react";
import Link from "next/link";
import { Brain, CalendarDays, ChevronLeft, FileCheck2, Scale, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Card } from "@/components/ui/card";

interface PolicyPageShellProps {
  kind: "privacy" | "terms" | "deletion";
  title: string;
  eyebrow: string;
  description: string;
  version: string;
  effectiveDate?: string;
  children: ReactNode;
}

const kindIcons = {
  privacy: ShieldCheck,
  terms: Scale,
  deletion: FileCheck2,
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(`${date}T00:00:00+06:00`));
}

export function PolicyPageShell({
  kind,
  title,
  eyebrow,
  description,
  version,
  effectiveDate,
  children,
}: PolicyPageShellProps) {
  const Icon = kindIcons[kind];
  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold" aria-label="HSC Ultimate হোম">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 shadow-lg shadow-violet-500/20">
              <Brain className="h-5 w-5 text-white" />
            </span>
            <span className="hidden sm:inline">HSC Ultimate</span>
          </Link>
          <nav aria-label="আইনি ও গোপনীয়তা নেভিগেশন" className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
            <Link href="/privacy" className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Terms
            </Link>
            <Link href="/account-deletion" className="hidden rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block">
              Data controls
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link href="/" className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> হোমে ফিরে যাও
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-card/75 p-6 shadow-2xl shadow-violet-500/5 backdrop-blur-xl sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="relative max-w-3xl">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Icon className="h-3.5 w-3.5" /> {eyebrow}
            </Badge>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border bg-background/70 px-3 py-1.5 font-medium">
                Version {version}
              </span>
              {effectiveDate && (
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" /> কার্যকর: {formatDate(effectiveDate)}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <article className="min-w-0 space-y-5">{children}</article>
          <aside className="order-first lg:order-last">
            <Card className="p-4 lg:sticky lg:top-20">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick links</p>
              <div className="mt-3 grid gap-1 text-sm">
                <Link href="/privacy" className="rounded-lg px-3 py-2 hover:bg-muted">গোপনীয়তা নীতি</Link>
                <Link href="/terms" className="rounded-lg px-3 py-2 hover:bg-muted">ব্যবহারের শর্তাবলি</Link>
                <Link href="/account-deletion" className="rounded-lg px-3 py-2 hover:bg-muted">Export ও account deletion</Link>
                <Link href="/settings" className="rounded-lg px-3 py-2 hover:bg-muted">Settings ও data controls</Link>
                <Link href="/focus" className="rounded-lg px-3 py-2 hover:bg-muted">Strict Focus controls</Link>
              </div>
              <p className="mt-4 border-t pt-4 text-xs leading-5 text-muted-foreground">
                এই নথি বর্তমান code/data flow বর্ণনা করে। Public launch বা Play Store submission-এর আগে operator identity, verified contact এবং আইনজীবীর review চূড়ান্ত করতে হবে।
              </p>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/10 py-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>© {new Date().getFullYear()} HSC Ultimate · শিক্ষা সহায়ক প্ল্যাটফর্ম</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/account-deletion" className="hover:text-foreground">Delete account</Link>
          </div>
        </div>
      </footer>
    </AuroraBackground>
  );
}

export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border bg-card/70 p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:pl-1 [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function PolicyCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-4 text-sm leading-6 text-foreground">
      {children}
    </div>
  );
}
