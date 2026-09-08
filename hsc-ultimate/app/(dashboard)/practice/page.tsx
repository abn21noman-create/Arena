// ===================================================================
// HSC ULTIMATE — Premium Practice Hub 2026
// -------------------------------------------------------------------
// - Aurora glassmorphic design
// - Bento grid for subjects
// - Quiz stats per subject
// - Animated counters
// - Premium hover effects
// ===================================================================
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/ui/glass-card";
import { CountUp } from "@/components/ui/count-up";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Brain, FileQuestion, Sparkles, Target,
  Zap, Trophy, Flame, ArrowRight, Atom, FlaskConical, Dna, Sigma,
  type LucideIcon,
} from "lucide-react";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  PHYSICS: Atom,
  CHEMISTRY: FlaskConical,
  BIOLOGY: Dna,
  HIGHER_MATH: Sigma,
};

const SUBJECT_GRADIENT: Record<string, string> = {
  PHYSICS: "from-blue-500 via-indigo-500 to-cyan-500",
  CHEMISTRY: "from-emerald-500 via-teal-500 to-cyan-500",
  BIOLOGY: "from-pink-500 via-rose-500 to-fuchsia-500",
  HIGHER_MATH: "from-violet-500 via-purple-500 to-pink-500",
  BANGLA: "from-amber-500 via-orange-500 to-red-500",
  ENGLISH: "from-sky-500 via-blue-500 to-indigo-500",
  ICT: "from-slate-500 via-gray-500 to-zinc-500",
};

export default async function PracticePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [subjects, userStats] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: {
        chapters: {
          include: {
            topics: { include: { _count: { select: { questions: true } } } },
          },
        },
      },
    }),
    prisma.quizAttempt.aggregate({
      where: { userId: session.user.id },
      _count: { id: true },
      _sum: { score: true, totalMarks: true },
    }),
  ]);

  const totalQuestions = subjects.reduce(
    (sum, s) =>
      sum + s.chapters.reduce((cs, ch) => cs + ch.topics.reduce((ts, t) => ts + t._count.questions, 0), 0),
    0
  );
  const totalScore = userStats._sum.score ?? 0;
  const totalMarks = userStats._sum.totalMarks ?? 0;
  const userAccuracy = totalMarks > 0
    ? Math.round((totalScore / totalMarks) * 100)
    : 0;

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button render={<Link href="/dashboard" />} variant="ghost" size="icon" className="rounded-full h-9 w-9" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                <Brain className="h-3 w-3 mr-1" />
                Practice Hub
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              MCQ <span className="text-gradient">অনুশীলন</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Adaptive practice + board questions + mastery tracking
            </p>
          </div>
        </div>

        {/* Hero Stats Bento */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <GlassCard className="p-4 sm:p-5" variant="gradient-border">
            <FileQuestion className="h-5 w-5 text-blue-500 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gradient">
              <CountUp end={totalQuestions} duration={1500} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total MCQ</p>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5" variant="gradient-border">
            <Trophy className="h-5 w-5 text-amber-500 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gradient">
              <CountUp end={userStats._count.id || 0} duration={1500} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">তোমার attempts</p>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5" variant="gradient-border">
            <Target className="h-5 w-5 text-emerald-500 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gradient">
              <CountUp end={userAccuracy} duration={1500} suffix="%" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5" variant="gradient-border">
            <Flame className="h-5 w-5 text-orange-500 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-gradient">
              <CountUp end={subjects.length} duration={1500} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Subjects</p>
          </GlassCard>
        </div>

        {/* Hero CTA — Smart Practice */}
        <GlassCard className="p-6 sm:p-8 relative overflow-hidden" variant="gradient-border" glow>
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-500/30 via-violet-500/30 to-cyan-500/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/20 via-orange-500/20 to-amber-500/20 blur-3xl"
          />
          <div className="relative flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 min-w-0">
              <Badge className="mb-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" /> Data-driven
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                <span className="text-gradient">Smart Adaptive Practice</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-xl">
                তোমার real attempt history, ভুল উত্তর ও topic progress থেকে targeted প্রশ্ন বাছাই করা হয়।
                কোনো বানানো score বা simulated weakness ব্যবহার করা হয় না।
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button render={<Link href="/adaptive-practice" />} size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 font-semibold">
                  <Zap className="h-4 w-4" />
                  Smart Practice
                </Button>
                <Button render={<Link href="/mistake-vault" />} size="lg" variant="outline" className="gap-2 bg-card/60 hover:bg-muted border border-border">
                  <Flame className="h-4 w-4 text-amber-500" />
                  Mistake Vault
                </Button>
                <Button render={<Link href="/mock-exam" />} size="lg" variant="outline" className="gap-2 bg-card/60 hover:bg-muted border border-border">
                  <Trophy className="h-4 w-4 text-primary" />
                  মডেল টেস্ট
                </Button>
                <Button render={<Link href="/cq-practice" />} size="lg" variant="ghost" className="gap-2">
                  <FileQuestion className="h-4 w-4 text-primary" />
                  CQ অনুশীলন
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 rotate-3 hover:rotate-0 transition-transform">
                <Brain className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Subjects Grid — Bento */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">All Subjects</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pick a subject to start practicing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {subjects.map((subject) => {
              const questionCount = subject.chapters.reduce(
                (sum, ch) =>
                  sum + ch.topics.reduce((s, t) => s + t._count.questions, 0),
                0
              );
              const Icon = SUBJECT_ICONS[subject.code] || Brain;
              const gradient = SUBJECT_GRADIENT[subject.code] || "from-blue-500 to-purple-500";
              const chapterCount = subject.chapters.length;

              return (
                <Link
                  key={subject.id}
                  href={questionCount > 0 ? `/practice/${subject.id}` : "/practice"}
                  className={questionCount === 0 ? "pointer-events-none" : ""}
                >
                  <GlassCard
                    interactive
                    className="p-5 sm:p-6 group relative overflow-hidden h-full"
                    variant="gradient-border"
                  >
                    {/* Animated gradient blob */}
                    <div
                      aria-hidden
                      className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl group-hover:opacity-40 group-hover:scale-125 transition-all duration-700`}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        {questionCount > 0 && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <FileQuestion className="h-3 w-3" />
                            {questionCount}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-lg sm:text-xl mb-1 group-hover:text-primary transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {subject.nameEn}
                      </p>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <FileQuestion className="h-3 w-3" />
                          {questionCount} প্রশ্ন
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Brain className="h-3 w-3" />
                          {chapterCount} চ্যাপ্টার
                        </span>
                      </div>

                      {questionCount > 0 && (
                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          Start practicing <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                      {questionCount === 0 && (
                        <Badge variant="outline" className="mt-4 text-xs">
                          Coming soon
                        </Badge>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA — Other Practice Modes */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">More Practice Modes</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { href: "/adaptive-practice", icon: Sparkles, title: "Adaptive", desc: "AI picks for you", color: "from-violet-500 to-fuchsia-500" },
              { href: "/drill", icon: Zap, title: "Timed Drill", desc: "Race the clock", color: "from-amber-500 to-orange-500" },
              { href: "/quiz-battle", icon: Trophy, title: "Battle", desc: "Multiplayer", color: "from-emerald-500 to-teal-500" },
              { href: "/duel", icon: Target, title: "Duel", desc: "1v1 Challenge", color: "from-pink-500 to-rose-500" },
              { href: "/mock-exam", icon: FileQuestion, title: "Mock Exam", desc: "Full simulation", color: "from-indigo-500 to-blue-500" },
              { href: "/mistake-vault", icon: Brain, title: "Mistakes", desc: "Review errors", color: "from-red-500 to-orange-500" },
              { href: "/cq-practice", icon: Sparkles, title: "CQ Practice", desc: "Creative Q", color: "from-cyan-500 to-blue-500" },
              { href: "/adaptive-practice", icon: Target, title: "Weak Topics", desc: "Focus on gaps", color: "from-yellow-500 to-amber-500" },
            ].map((mode) => (
              <Link key={mode.title} href={mode.href}>
                <GlassCard interactive className="p-4 sm:p-5 group h-full">
                  <div className={`inline-flex h-10 w-10 rounded-xl bg-gradient-to-br ${mode.color} items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                    <mode.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">{mode.title}</h3>
                  <p className="text-xs sm:text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AuroraBackground>
  );
}
