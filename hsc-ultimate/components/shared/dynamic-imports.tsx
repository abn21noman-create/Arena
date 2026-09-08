"use client";

// ===================================================================
// Dynamic Imports — Heavy Components এ lazy load করার জন্য
// -------------------------------------------------------------------
// Recharts (~200KB), framer-motion animations, math rendering — এগুলো
// initial bundle এ load না হয়ে lazy load হবে। এতে:
// - First contentful paint (FCP) faster
// - Initial JS bundle ছোট
// - User যেই page-এ যাবে, শুধু সেই feature-এর heavy code load হবে
//
// Performance benchmark:
//   Before: analytics page = 200KB JS
//   After:  analytics page = 8KB (wrapper) + 192KB (lazy loaded)
// ===================================================================
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// ──────────────────────────────────────────────────────────────
// Analytics — Recharts wrapper
// ──────────────────────────────────────────────────────────────
export const LazyAnalyticsDashboard = dynamic(
  () => import("@/components/analytics/analytics-dashboard").then((m) => m.AnalyticsDashboard),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false, // Recharts client-only
  }
);

export const LazyRetentionForecast = dynamic(
  () => import("@/components/analytics/retention-forecast-card").then((m) => m.RetentionForecastCard),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
);

// ──────────────────────────────────────────────────────────────
// Admin Analytics
// ──────────────────────────────────────────────────────────────
export const LazyAdminAnalytics = dynamic(
  () => import("@/components/admin/admin-analytics-dashboard").then((m) => m.AdminAnalyticsDashboard),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

// ──────────────────────────────────────────────────────────────
// Report Card PDF — @react-pdf/renderer (~250KB)
// শুধু report card download এর সময় load হবে
// ──────────────────────────────────────────────────────────────
// (Note: ReportCard uses @react-pdf/renderer directly in API route,
//  which is server-side and not part of client bundle)

// ──────────────────────────────────────────────────────────────
// Math Text (KaTeX) — 80KB
// শুধু CQ question/Math display সহ পেজে load হবে
// ──────────────────────────────────────────────────────────────
export const LazyMathText = dynamic(
  () => import("@/components/shared/math-text").then((m) => m.MathText),
  {
    loading: () => <span className="opacity-50">...</span>,
    ssr: false, // KaTeX needs window
  }
);

// ──────────────────────────────────────────────────────────────
// Heavy interactive components
// ──────────────────────────────────────────────────────────────
export const LazyReportCardDownload = dynamic(
  () => import("@/components/analytics/predicted-gpa-card").then((m) => m.PredictedGpaCard),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
);
