import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Check,
  Cloud,
  Database,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStep {
  label: string;
  detail: string;
  icon?: LucideIcon;
}

interface PremiumLoadingProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: "violet" | "cyan" | "emerald" | "amber" | "rose";
  steps?: LoadingStep[];
  tip?: string;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

const ACCENTS = {
  violet: {
    icon: "from-violet-500 via-fuchsia-500 to-cyan-400",
    glow: "bg-violet-500/20",
    text: "text-violet-700 dark:text-violet-300",
    line: "from-violet-500 via-fuchsia-500 to-cyan-400",
  },
  cyan: {
    icon: "from-cyan-500 via-blue-500 to-violet-500",
    glow: "bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-300",
    line: "from-cyan-500 via-blue-500 to-violet-500",
  },
  emerald: {
    icon: "from-emerald-500 via-teal-500 to-cyan-400",
    glow: "bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-300",
    line: "from-emerald-500 via-teal-500 to-cyan-400",
  },
  amber: {
    icon: "from-amber-500 via-orange-500 to-rose-500",
    glow: "bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-300",
    line: "from-amber-500 via-orange-500 to-rose-500",
  },
  rose: {
    icon: "from-rose-500 via-fuchsia-500 to-violet-500",
    glow: "bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-300",
    line: "from-rose-500 via-fuchsia-500 to-violet-500",
  },
} as const;

const DEFAULT_STEPS: LoadingStep[] = [
  { label: "Secure session", detail: "আপনার account যাচাই হচ্ছে", icon: LockKeyhole },
  { label: "Sync progress", detail: "সর্বশেষ study data প্রস্তুত হচ্ছে", icon: Database },
  { label: "Build workspace", detail: "Module ও recommendations সাজানো হচ্ছে", icon: WandSparkles },
];

export function PremiumLoading({
  eyebrow = "HSC ULTIMATE · LEARNING OS",
  title = "আপনার study space প্রস্তুত হচ্ছে",
  subtitle = "Progress, preferences এবং learning tools নিরাপদভাবে একসাথে সাজানো হচ্ছে।",
  icon: Icon = Brain,
  accent = "violet",
  steps = DEFAULT_STEPS,
  tip = "ছোট ছোট consistent session-ই long-term mastery তৈরি করে।",
  children,
  className,
  compact = false,
}: PremiumLoadingProps) {
  const tone = ACCENTS[accent];

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "premium-loading relative isolate w-full overflow-hidden",
        compact ? "min-h-[70svh]" : "min-h-[100svh]",
        className
      )}
    >
      <div className="premium-loading-grid absolute inset-0 -z-30" aria-hidden />
      <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden>
        <div className="loading-aurora loading-aurora-one" />
        <div className="loading-aurora loading-aurora-two" />
        <div className="loading-aurora loading-aurora-three" />
      </div>
      <div className="premium-noise absolute inset-0 -z-10" aria-hidden />

      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">HSC Ultimate</p>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Focused learning system
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xl sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Private · Secure · Synced
          </div>
        </div>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="loading-emblem relative mb-7 h-28 w-28 sm:h-32 sm:w-32" aria-hidden>
              <div className="loading-orbit loading-orbit-outer" />
              <div className="loading-orbit loading-orbit-inner" />
              <div className={cn("absolute inset-5 rounded-[2rem] blur-2xl", tone.glow)} />
              <div className={cn(
                "absolute inset-7 flex items-center justify-center rounded-[1.65rem] bg-linear-to-br text-white shadow-2xl",
                tone.icon
              )}>
                <Icon className="h-9 w-9" strokeWidth={1.8} />
              </div>
              <span className="loading-orbit-dot" />
            </div>

            <p className={cn("mb-3 text-xs font-black uppercase tracking-[0.28em]", tone.text)}>
              {eyebrow}
            </p>
            <h1 className="max-w-xl text-balance text-3xl font-black leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
              {subtitle}
            </p>

            <div className="mt-7 w-full max-w-xl">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="loading-live-dot" /> Live preparation
                </span>
                <span>একটু অপেক্ষা করুন</span>
              </div>
              <div className="loading-track h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className={cn("loading-progress h-full w-2/5 rounded-full bg-linear-to-r", tone.line)} />
              </div>
            </div>

            <div className="mt-6 grid w-full max-w-xl gap-2.5 sm:grid-cols-3">
              {steps.slice(0, 3).map((step, index) => {
                const StepIcon = step.icon ?? Check;
                return (
                  <div
                    key={step.label}
                    className="premium-loading-step rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 text-left backdrop-blur-xl"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br text-white",
                        index === 0 ? tone.icon : "from-slate-600 to-slate-700"
                      )}>
                        <StepIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                    </div>
                    <p className="text-xs font-bold">{step.label}</p>
                    <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{step.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="premium-loading-preview relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-white/[0.035] p-3 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:p-5">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-bold">Workspace preview</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Layout স্থির রেখে content sync হচ্ছে</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              </div>
            </div>

            {children ?? <PremiumLoadingPreview />}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 backdrop-blur-xl">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Study insight</p>
              <p className="mt-1 text-xs leading-5 text-foreground/80">{tip}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Cloud className="h-3.5 w-3.5" />
            Auto-save enabled
          </div>
        </div>
      </div>
    </section>
  );
}

export function PremiumLoadingPreview() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="premium-skeleton-panel rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="premium-skeleton h-12 w-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="premium-skeleton h-3.5 w-2/5 rounded-full" />
            <div className="premium-skeleton h-2.5 w-3/5 rounded-full" />
          </div>
          <div className="premium-skeleton h-8 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((item) => (
          <div key={item} className="premium-skeleton-panel rounded-2xl p-3.5">
            <div className="premium-skeleton mb-5 h-8 w-8 rounded-xl" />
            <div className="premium-skeleton h-4 w-1/2 rounded-full" />
            <div className="premium-skeleton mt-2 h-2.5 w-4/5 rounded-full" />
          </div>
        ))}
      </div>
      <div className="premium-skeleton-panel rounded-2xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="premium-skeleton h-3.5 w-32 rounded-full" />
          <div className="premium-skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[72, 45, 88, 60].map((height, index) => (
            <div key={index} className="flex h-28 items-end rounded-xl bg-white/[0.025] p-2">
              <div className="premium-skeleton w-full rounded-lg" style={{ height: `${height}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
