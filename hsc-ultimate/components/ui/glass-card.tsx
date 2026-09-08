"use client";

/**
 * GlassCard — frosted glass card with subtle border + shadow
 * 2026 glassmorphism trend
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "subtle" | "elevated" | "gradient-border";
  interactive?: boolean;
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = "default", interactive, glow, ...props }, ref) => {
    const baseClass = variant === "subtle" ? "glass" :
                       variant === "gradient-border" ? "gradient-border" :
                       "glass-card";

    return (
      <div
        ref={ref}
        className={cn(
          baseClass,
          "relative rounded-2xl transition-all duration-300",
          interactive && "hover:scale-[1.02] hover:-translate-y-1 cursor-pointer hover-glow",
          glow && "shadow-[var(--shadow-glow)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

/* Convenience subcomponents */
export function GlassCardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-3 space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold leading-tight tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function GlassCardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function GlassCardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3 flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
