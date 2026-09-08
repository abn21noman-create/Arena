// ===================================================================
// Learning Hub — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { CountUp } from "@/components/ui/count-up";
import { BookOpen, ArrowRight, Atom, FlaskConical, Dna, Sigma, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  PHYSICS: Atom,
  CHEMISTRY: FlaskConical,
  BIOLOGY: Dna,
  HIGHER_MATH: Sigma,
};
const SUBJECT_GRADIENT: Record<string, string> = {
  PHYSICS: "from-blue-500 to-cyan-500",
  CHEMISTRY: "from-emerald-500 to-teal-500",
  BIOLOGY: "from-pink-500 to-rose-500",
  HIGHER_MATH: "from-violet-500 to-purple-500",
};

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      chapters: {
        include: {
          topics: {
            include: {
              topicProgress: {
                where: { userId: session.user.id },
              },
            },
          },
        },
      },
    },
  });

  const allTopicsAllSubjects = subjects.flatMap((s) =>
    s.chapters.flatMap((c) => c.topics)
  );
  const totalTopicsAll = allTopicsAllSubjects.length;
  const masteredTopicsAll = allTopicsAllSubjects.filter(
    (t) => t.topicProgress[0]?.status === "MASTERED"
  ).length;
  const overallProgressPct =
    totalTopicsAll > 0 ? Math.round((masteredTopicsAll / totalTopicsAll) * 100) : 0;

  return (
    <PageShell
      title="Learning"
      titleBn="Hub"
      subtitle="চ্যাপ্টার ও টপিক অনুযায়ী নোট, ফর্মুলা শীট, মাইন্ড ম্যাপ"
      iconKey="GraduationCap"
      iconGradient="from-blue-500 via-violet-500 to-purple-500"
      badge="Study Material"
    >
      {/* Overall Progress Hero */}
      <GlassCard className="p-5 sm:p-6 relative overflow-hidden" variant="gradient-border" glow>
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-gradient-to-br from-violet-500/30 via-fuchsia-500/30 to-pink-500/30 blur-3xl"
        />
        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 shrink-0">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs text-muted-foreground mb-1">সামগ্রিক অগ্রগতি</div>
            <div className="text-2xl sm:text-3xl font-bold mb-2">
              <span className="text-gradient">
                <CountUp end={masteredTopicsAll} duration={1500} />
              </span>{" "}
              / {totalTopicsAll} টপিক ({overallProgressPct}%)
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden max-w-md mx-auto sm:mx-0">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                style={{ width: `${overallProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Subjects Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {subjects.map((subject) => {
          const allTopics = subject.chapters.flatMap((c) => c.topics);
          const totalTopics = allTopics.length;
          const masteredTopics = allTopics.filter(
            (t) => t.topicProgress[0]?.status === "MASTERED"
          ).length;
          const progressPct =
            totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;
          const Icon = SUBJECT_ICONS[subject.code] || BookOpen;
          const gradient = SUBJECT_GRADIENT[subject.code] || "from-blue-500 to-violet-500";

          return (
            <Link key={subject.id} href={`/learn/${subject.id}`}>
              <GlassCard
                interactive
                className="p-5 sm:p-6 group relative overflow-hidden h-full"
                variant="gradient-border"
              >
                <div
                  aria-hidden
                  className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl group-hover:opacity-40 group-hover:scale-125 transition-all duration-700`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted/60 border border-border font-medium">
                      {subject.chapters.length} চ্যাপ্টার
                    </span>
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-1 group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {subject.nameEn}
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>প্রগ্রেস</span>
                      <span className="font-semibold">{masteredTopics}/{totalTopics}</span>
                    </div>
                    <Progress value={progressPct} className="h-1.5" />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Open chapters <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
