import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCountdown } from "@/lib/exam-countdown";
import { getFocusState } from "@/lib/focus";
import { getLevelProgress } from "@/lib/gamification";
import { getWeakTopics } from "@/lib/analytics";
import { getReviewQueueSummary } from "@/lib/flashcard-review-queue";
import { getMistakeVaultSummary } from "@/lib/mistake-vault";
import { getTodayFocus } from "@/lib/today-focus";
import { getWeeklyRecap } from "@/lib/weekly-recap";
import { getCurrentWeekStart } from "@/lib/league";
import { GamificationSync } from "@/components/gamification/gamification-sync";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeCustomizerButton } from "@/components/shared/theme-customizer";
import { NotificationBell } from "@/components/layout/notification-bell";
import { GlobalSearchButton } from "@/components/layout/global-search";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { DashboardCommandHero } from "@/components/dashboard/dashboard-command-hero";
import { DashboardMetricsV2 } from "@/components/dashboard/dashboard-metrics-v2";
import { DailyMissionCard, type DailyMissionItem } from "@/components/dashboard/daily-mission-card";
import { FocusStatusCard } from "@/components/dashboard/focus-status-card";
import {
  PriorityInsightCard,
  RecentActivityCard,
  RevisionPulseCard,
  SubjectMasteryGrid,
  UpcomingTasksCard,
  WeekMomentumCard,
  type DashboardActivityItem,
  type DashboardTaskItem,
  type SubjectMasteryItem,
} from "@/components/dashboard/dashboard-insight-panels";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DailyAIBriefing } from "@/components/dashboard/daily-ai-briefing";
import { ExamCountdownQuota } from "@/components/dashboard/exam-countdown-quota";
import { StreakFreezeCard } from "@/components/dashboard/streak-freeze-card";

const quickActions = [
  { href: "/focus", iconKey: "LockKeyhole", title: "Strict Focus", desc: "ডিপ স্টাডি মোড", color: "from-violet-600 to-fuchsia-600" },
  { href: "/practice", iconKey: "Target", title: "MCQ অনুশীলন", desc: "স্মার্ট ও চ্যাপ্টার প্র্যাকটিস", color: "from-rose-500 to-orange-500" },
  { href: "/ai-tutor", iconKey: "Brain", title: "AI ডাউট সলভার", desc: "তাত্ক্ষণিক সমাধান ও গাইড", color: "from-cyan-500 to-blue-600" },
  { href: "/flashcards", iconKey: "Layers", title: "স্মার্ট ফ্ল্যাশকার্ড", desc: "FSRS স্পেসড রিভিশন", color: "from-amber-500 to-orange-500" },
  { href: "/planner", iconKey: "CalendarClock", title: "স্টাডি প্ল্যানার", desc: "ডেইলি রুটিন ও টাস্ক", color: "from-emerald-500 to-teal-500" },
  { href: "/analytics", iconKey: "BarChart3", title: "অ্যানালিটিক্স", desc: "পারফরম্যান্স ও প্রেডিক্টেড GPA", color: "from-fuchsia-500 to-violet-600" },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      hscBatch: true,
      board: true,
      examDate: true,
      targetGpa: true,
      xp: true,
      streakCount: true,
      streakFreezes: true,
      weeklyXp: true,
    },
  });
  if (!user) redirect("/login");

  const weekStart = getCurrentWeekStart();
  const [
    focusState,
    weakTopics,
    reviewQueue,
    mistakeVault,
    weeklyRecap,
    todayFocus,
    upcomingTasks,
    recentCompletedTasks,
    recentAttempts,
    recentStudySessions,
    subjectRows,
    bookmarkCount,
    completedFocusSessions,
  ] = await Promise.all([
    getFocusState(user.id),
    getWeakTopics(user.id, 3),
    getReviewQueueSummary(user.id),
    getMistakeVaultSummary(user.id),
    getWeeklyRecap(user.id),
    getTodayFocus(user.id),
    prisma.task.findMany({
      where: { userId: user.id, status: { not: "DONE" } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 4,
      select: { id: true, title: true, dueDate: true, priority: true, subjectCode: true },
    }),
    prisma.task.findMany({
      where: { userId: user.id, status: "DONE" },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, quizType: true, score: true, totalMarks: true, totalQuestions: true, createdAt: true },
    }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, type: true, durationSec: true, subjectCode: true, createdAt: true },
    }),
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        nameEn: true,
        colorHex: true,
        chapters: {
          select: {
            topics: {
              select: {
                id: true,
                topicProgress: {
                  where: { userId: user.id },
                  select: { status: true, completedPct: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.bookmark.count({ where: { userId: user.id } }),
    prisma.focusSession.findMany({
      where: { userId: user.id, status: "COMPLETED", completedAt: { gte: weekStart } },
      select: { durationMinutes: true },
    }),
  ]);

  const levelProgress = getLevelProgress(user.xp);
  const countdown = getCountdown(user.examDate, user.hscBatch);
  const activeFocus = focusState.activeSession
    ? {
        id: focusState.activeSession.id,
        source: focusState.activeSession.source,
        endsAt: focusState.activeSession.endsAt.toISOString(),
        durationMinutes: focusState.activeSession.durationMinutes,
        nativeEnforcementRequested: focusState.activeSession.nativeEnforcementRequested,
      }
    : null;

  const dailyItems: DailyMissionItem[] = (todayFocus?.items ?? []).map((item) => ({
    id: item.id,
    date: item.date.toISOString(),
    subjectCode: item.subjectCode,
    topicName: item.topicName,
    taskDescription: item.taskDescription,
    durationMinutes: item.durationMinutes,
    priority: item.priority,
    isOverdue: item.isOverdue,
  }));

  const subjects: SubjectMasteryItem[] = subjectRows.map((subject) => {
    const topics = subject.chapters.flatMap((chapter) => chapter.topics);
    const totalTopics = topics.length;
    const masteredTopics = topics.filter((topic) => topic.topicProgress[0]?.status === "MASTERED").length;
    const totalProgress = topics.reduce(
      (sum, topic) => sum + (topic.topicProgress[0]?.completedPct ?? 0),
      0
    );
    return {
      id: subject.id,
      name: subject.name,
      nameEn: subject.nameEn,
      colorHex: subject.colorHex,
      totalTopics,
      masteredTopics,
      progressPct: totalTopics > 0 ? Math.round(totalProgress / totalTopics) : 0,
    };
  });
  const totalTopics = subjects.reduce((sum, subject) => sum + subject.totalTopics, 0);
  const masteredTopics = subjects.reduce((sum, subject) => sum + subject.masteredTopics, 0);

  const tasks: DashboardTaskItem[] = upcomingTasks.map((task) => ({
    id: task.id,
    title: task.title,
    dueDate: task.dueDate?.toISOString() ?? null,
    priority: task.priority,
    subjectCode: task.subjectCode,
  }));

  const activities: DashboardActivityItem[] = [
    ...recentAttempts.map((attempt) => ({
      id: attempt.id,
      type: "QUIZ" as const,
      title: `${attempt.quizType.replaceAll("_", " ")} · ${attempt.score}/${attempt.totalMarks || attempt.totalQuestions}`,
      detail: `${attempt.totalQuestions}টি question answered`,
      occurredAt: attempt.createdAt.toISOString(),
      href: "/analytics",
    })),
    ...recentStudySessions.map((study) => ({
      id: study.id,
      type: "STUDY" as const,
      title: `${study.type.replaceAll("_", " ")} session`,
      detail: `${Math.max(1, Math.round(study.durationSec / 60))} মিনিট · ${study.subjectCode ?? "General"}`,
      occurredAt: study.createdAt.toISOString(),
      href: "/planner",
    })),
    ...focusState.recentSessions
      .filter((focus) => focus.status !== "ACTIVE")
      .slice(0, 3)
      .map((focus) => ({
        id: focus.id,
        type: "FOCUS" as const,
        title: `${focus.durationMinutes} মিনিট Strict Focus`,
        detail: focus.status === "COMPLETED" ? "Session completed" : focus.status.replaceAll("_", " "),
        occurredAt: focus.startedAt.toISOString(),
        href: "/focus",
      })),
    ...recentCompletedTasks.map((task) => ({
      id: task.id,
      type: "TASK" as const,
      title: task.title,
      detail: "Task completed",
      occurredAt: task.updatedAt.toISOString(),
      href: "/planner",
    })),
  ]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 6);

  const focusMinutes = completedFocusSessions.reduce((sum, focus) => sum + focus.durationMinutes, 0);
  const firstMission = dailyItems[0]
    ? {
        title: dailyItems[0].taskDescription,
        durationMinutes: dailyItems[0].durationMinutes,
        overdue: dailyItems[0].isOverdue,
      }
    : null;

  return (
    <AuroraBackground variant="subtle" className="min-h-screen">
      <div className="mx-auto w-full max-w-[1480px] space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
        <GamificationSync />

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 sm:max-w-md"><GlobalSearchButton /></div>
          <NotificationBell />
          <ThemeCustomizerButton />
          <ThemeToggle />
          <UserMenu name={user.name} email={user.email} isAdmin={user.role === "ADMIN"} />
        </div>

        <DashboardCommandHero
          userName={user.name}
          hscBatch={user.hscBatch}
          board={user.board}
          role={user.role}
          examDaysLeft={countdown.daysLeft}
          examIsPast={countdown.isPast}
          targetGpa={user.targetGpa}
          activeFocus={activeFocus ? { source: activeFocus.source, endsAt: activeFocus.endsAt } : null}
          nextMission={firstMission}
        />

        <DashboardMetricsV2
          streakCount={user.streakCount}
          streakFreezes={user.streakFreezes}
          xp={user.xp}
          level={levelProgress.level}
          levelProgressPct={levelProgress.progressPct}
          weeklyXp={user.weeklyXp}
          masteredTopics={masteredTopics}
          totalTopics={totalTopics}
        />

        <DailyAIBriefing userName={user.name} />

        <ExamCountdownQuota
          targetExamDate={user.examDate?.toISOString() || "2026-11-01"}
          streakDays={user.streakCount}
          streakFreezeTokens={user.streakFreezes}
        />

        <StreakFreezeCard currentStreak={user.streakCount} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="lg:col-span-7">
            <DailyMissionCard
              planId={todayFocus?.planId ?? null}
              initialItems={dailyItems}
              overdueCount={todayFocus?.overdueCount ?? 0}
              generationStatus={todayFocus?.generationStatus ?? null}
            />
          </div>
          <div className="lg:col-span-5">
            <FocusStatusCard
              initialSession={activeFocus}
              contractEnabled={focusState.contract?.allowAdminStart ?? false}
              nativeEnforcementEnabled={focusState.contract?.nativeEnforcementEnabled ?? false}
            />
          </div>

          <div className="lg:col-span-4">
            <PriorityInsightCard weakTopics={weakTopics} />
          </div>
          <div className="lg:col-span-4">
            <RevisionPulseCard
              dueCards={reviewQueue.totalDueCards}
              dueDecks={reviewQueue.deckCount}
              topDeck={reviewQueue.topDeck}
              mistakeCount={mistakeVault.totalCount}
              bookmarkCount={bookmarkCount}
            />
          </div>
          <div className="lg:col-span-4">
            <WeekMomentumCard
              weeklyXp={weeklyRecap?.weeklyXp ?? user.weeklyXp}
              studyMinutes={weeklyRecap?.studyMinutes ?? 0}
              focusMinutes={focusMinutes}
              quizCount={weeklyRecap?.quizAttemptsCount ?? 0}
              masteredCount={weeklyRecap?.topicsMasteredThisWeek ?? 0}
              streak={user.streakCount}
              archetype={weeklyRecap?.archetype ?? null}
            />
          </div>

          <div className="lg:col-span-6">
            <UpcomingTasksCard tasks={tasks} />
          </div>
          <div className="lg:col-span-6">
            <RecentActivityCard activities={activities} />
          </div>
        </div>

        <QuickActions actions={quickActions} />
        <SubjectMasteryGrid subjects={subjects} />
      </div>
    </AuroraBackground>
  );
}
