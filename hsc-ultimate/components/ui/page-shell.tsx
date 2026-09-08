/**
 * PageShell — reusable wrapper that applies the premium design system
 * to any page instantly. Wraps with AuroraBackground + premium header
 * (back button + gradient title + optional subtitle + optional actions).
 *
 * Usage:
 *   <PageShell
 *     title="Practice"
 *     titleBn="অনুশীলন"
 *     subtitle="MCQ practice + board questions"
 *     icon={Brain}
 *     backHref="/dashboard"
 *   >
 *     ... page content ...
 *   </PageShell>
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageShellProps {
  title: string;
  titleBn?: string;
  subtitle?: string;
  /** Icon name (string key) — resolved inside client component to avoid
   *  Server→Client function-serialization error (passing React component
   *  as prop from a server component to a client component is forbidden). */
  iconKey?: string;
  backHref?: string;
  actions?: React.ReactNode;
  badge?: string;
  /** CSS gradient classes, e.g. "from-blue-500 to-cyan-500" */
  iconGradient?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

// Icon registry — resolve by string name to avoid Server→Client component prop issue
import {
  Trophy, Bookmark, Bell, CalendarClock, Brain, Sparkles, Atom,
  FlaskConical, Dna, Sigma, BookOpen, Layers, Swords, Crown,
  Target, Zap, BarChart3, GraduationCap, Search, MessageCircle, Users,
  AlertCircle, ArrowRight, ClipboardCheck, FileText, PenLine,
  Star, Award, Lightbulb, ShieldCheck, type LucideIcon,
} from "lucide-react";
const ICON_REGISTRY: Record<string, LucideIcon> = {
  Trophy, Bookmark, Bell, CalendarClock, Brain, Sparkles, Atom,
  FlaskConical, Dna, Sigma, BookOpen, Layers, Swords, Crown,
  Target, Zap, BarChart3, GraduationCap, Search, MessageCircle, Users,
  AlertCircle, ArrowRight, ClipboardCheck, FileText, PenLine,
  Star, Award, Lightbulb, ShieldCheck,
};

export function PageShell({
  title,
  titleBn,
  subtitle,
  iconKey,
  backHref = "/dashboard",
  actions,
  badge,
  iconGradient = "from-blue-500 via-violet-500 to-cyan-500",
  children,
  className,
  compact = false,
}: PageShellProps) {
  const Icon = iconKey ? ICON_REGISTRY[iconKey] : null;
  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div
        className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${
          compact ? "py-4 sm:py-6" : "py-6 sm:py-8"
        } space-y-6 ${className || ""}`}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 sm:gap-4"
        >
          <Button render={<Link href={backHref} />} variant="ghost"
              size="icon"
              className="rounded-full shrink-0 h-9 w-9"
              aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>

          {Icon && (
            <div
              className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg shrink-0`}
            >
              <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {badge && (
              <Badge variant="secondary" className="text-xs uppercase tracking-wider mb-1">
                {badge}
              </Badge>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              {titleBn ? (
                <>
                  {title}{" "}
                  <span className="text-gradient">{titleBn}</span>
                </>
              ) : (
                <span className="text-gradient">{title}</span>
              )}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div className="flex gap-2 shrink-0 flex-wrap">{actions}</div>}
        </motion.div>

        {/* Content */}
        {children}
      </div>
    </AuroraBackground>
  );
}

/**
 * EmptyPage — convenient empty state wrapper
 */
export function EmptyPage({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard
      className={`p-8 sm:p-12 text-center ${className || ""}`}
      variant="gradient-border"
    >
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">{description}</p>
      )}
      {action && "href" in action ? (
        <Button render={<Link href={action.href} />}>{action.label}</Button>
      ) : action ? (
        <Button onClick={action.onClick}>{action.label}</Button>
      ) : null}
    </GlassCard>
  );
}
