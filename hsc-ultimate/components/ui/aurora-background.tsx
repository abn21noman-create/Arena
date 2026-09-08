"use client";

/**
 * AuroraBackground — the signature "Aurora Glass 2026" background
 * Slow animated mesh gradient that responds to scroll
 */
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
  variant?: "subtle" | "vibrant" | "mesh";
}

export function AuroraBackground({ children, className, variant = "subtle" }: AuroraBackgroundProps) {
  const opacity = variant === "vibrant" ? 0.9 : variant === "mesh" ? 0.7 : 0.5;

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {/* Layer 1: Base gradient mesh */}
      <div
        className="absolute inset-0 -z-30"
        style={{ background: "var(--gradient-mesh)", opacity }}
        aria-hidden
      />
      {/* Layer 2: Aurora spots */}
      <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden>
        <div className="aurora-spot aurora-spot-blue" />
        <div className="aurora-spot aurora-spot-purple" />
        <div className="aurora-spot aurora-spot-cyan" />
      </div>
      {/* Layer 3: Subtle grain texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
