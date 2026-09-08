"use client";

import Link from "next/link";
import { BarChart3, Brain, Flame, Sparkles, Trophy } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { GlassCard } from "@/components/ui/glass-card";

interface DashboardMetricsV2Props {
  streakCount: number;
  streakFreezes: number;
  xp: number;
  level: number;
  levelProgressPct: number;
  weeklyXp: number;
  masteredTopics: number;
  totalTopics: number;
}

export function DashboardMetricsV2(props: DashboardMetricsV2Props) {
  const masteryPct = props.totalTopics > 0
    ? Math.round((props.masteredTopics / props.totalTopics) * 100)
    : 0;
  const metrics = [
    {
      label: "Study streak",
      value: props.streakCount,
      suffix: " দিন",
      detail: props.streakFreezes > 0 ? `${props.streakFreezes}টি freeze ready` : "আজ activity করুন",
      icon: Flame,
      color: "from-orange-500 to-rose-500",
      href: "/dashboard",
    },
    {
      label: "Total XP",
      value: props.xp,
      suffix: "",
      detail: `Level ${props.level}`,
      icon: Sparkles,
      color: "from-violet-500 to-fuchsia-500",
      href: "/analytics",
    },
    {
      label: "Level progress",
      value: props.levelProgressPct,
      suffix: "%",
      detail: `Level ${props.level + 1}-এর পথে`,
      icon: Trophy,
      color: "from-amber-500 to-orange-500",
      href: "/analytics",
    },
    {
      label: "Weekly momentum",
      value: props.weeklyXp,
      suffix: " XP",
      detail: "এই সপ্তাহে অর্জিত",
      icon: BarChart3,
      color: "from-emerald-500 to-cyan-500",
      href: "/leaderboard",
    },
    {
      label: "Topic mastery",
      value: masteryPct,
      suffix: "%",
      detail: `${props.masteredTopics}/${props.totalTopics} mastered`,
      icon: Brain,
      color: "from-cyan-500 to-blue-500",
      href: "/learn",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric) => (
        <Link key={metric.label} href={metric.href} className="group min-w-0">
          <GlassCard className="h-full overflow-hidden p-4 border border-border/70 hover:border-primary/40 transition-colors" variant="gradient-border" interactive>
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${metric.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-25`} />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${metric.color} text-white shadow-md`}>
                  <metric.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Live</span>
              </div>
              <p className="truncate text-2xl font-black tabular-nums sm:text-3xl text-foreground">
                <CountUp end={metric.value} duration={900} />
                <span className="ml-0.5 text-sm font-bold text-muted-foreground">{metric.suffix}</span>
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-foreground">{metric.label}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{metric.detail}</p>
              {(metric.label === "Level progress" || metric.label === "Topic mastery") && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                    style={{ width: `${Math.max(2, Math.min(100, metric.value))}%` }}
                  />
                </div>
              )}
            </div>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}
