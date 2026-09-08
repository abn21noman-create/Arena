"use client";

/**
 * EmptyState — beautiful "no data" placeholder with illustration + CTA
 */
import { type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
  illustration?: "default" | "search" | "data" | "celebration" | "error";
  className?: string;
}

const ILLUSTRATIONS = {
  default: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="empty-grad-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(220 90% 56%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(280 80% 60%)" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#empty-grad-1)" />
      <circle cx="100" cy="100" r="50" stroke="hsl(220 90% 56%)" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 4" />
      <path d="M85 90 Q100 70 115 90 L115 110 Q100 120 85 110 Z" fill="hsl(220 90% 56%)" fillOpacity="0.6" />
      <line x1="100" y1="105" x2="100" y2="125" stroke="hsl(220 90% 56%)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="90" cy="90" r="40" stroke="hsl(220 90% 56%)" strokeWidth="3" fill="hsl(220 90% 56% / 0.1)" />
      <line x1="120" y1="120" x2="150" y2="150" stroke="hsl(220 90% 56%)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <rect x="40" y="100" width="20" height="60" rx="4" fill="hsl(220 90% 56%)" fillOpacity="0.6" />
      <rect x="70" y="70" width="20" height="90" rx="4" fill="hsl(220 90% 56%)" fillOpacity="0.8" />
      <rect x="100" y="40" width="20" height="120" rx="4" fill="hsl(280 80% 60%)" />
      <rect x="130" y="80" width="20" height="80" rx="4" fill="hsl(220 90% 56%)" fillOpacity="0.5" />
    </svg>
  ),
  celebration: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <path d="M50 100 L100 50 L150 100 L100 150 Z" fill="hsl(38 92% 50%)" fillOpacity="0.6" />
      <circle cx="100" cy="100" r="20" fill="hsl(38 92% 50%)" />
      <path d="M30 50 L40 60 M170 50 L160 60 M30 150 L40 140 M170 150 L160 140" stroke="hsl(38 92% 50%)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="60" fill="hsl(0 84% 60% / 0.1)" />
      <circle cx="100" cy="100" r="40" stroke="hsl(0 84% 60%)" strokeWidth="2" fill="none" />
      <text x="100" y="115" textAnchor="middle" fontSize="50" fill="hsl(0 84% 60%)" fontWeight="bold">!</text>
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  illustration = "default",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-4",
      className
    )}>
      <div className="w-32 h-32 mb-4 opacity-90">
        {icon || ILLUSTRATIONS[illustration]}
      </div>
      <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {action && (
        "href" in action ? (
          <Button render={<Link href={action.href} />}>
            {action.label}
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
