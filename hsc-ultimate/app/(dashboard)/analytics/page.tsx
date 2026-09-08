// ===================================================================
// HSC ULTIMATE — Premium Analytics 2026
// -------------------------------------------------------------------
// Aurora glassmorphic design with premium analytics dashboard
// ===================================================================
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ArrowLeft, BarChart3, TrendingUp, Target, Brain } from "lucide-react";
import { LazyAnalyticsDashboard } from "@/components/shared/dynamic-imports";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" className="rounded-full shrink-0" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                <BarChart3 className="h-3 w-3 mr-1" />
                Analytics
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              তোমার <span className="text-gradient">Performance</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              প্রগ্রেস গ্রাফ, দুর্বল টপিক, প্রেডিক্টেড GPA, accuracy trends
            </p>
          </div>
        </div>

        {/* Quick Stats Preview (full dashboard loaded dynamically) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: TrendingUp, label: "Overall progress", color: "from-blue-500 to-cyan-500" },
            { icon: Target, label: "Weak topics", color: "from-rose-500 to-orange-500" },
            { icon: Brain, label: "Predicted GPA", color: "from-violet-500 to-fuchsia-500" },
            { icon: BarChart3, label: "Accuracy", color: "from-emerald-500 to-teal-500" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card p-4 sm:p-5 rounded-2xl"
            >
              <div className={`inline-flex h-10 w-10 rounded-xl bg-gradient-to-br ${item.color} items-center justify-center mb-2 shadow-lg`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Lazy loaded dashboard */}
        <LazyAnalyticsDashboard />
      </div>
    </AuroraBackground>
  );
}
