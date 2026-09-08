// ===================================================================
// Planner — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/ui/page-shell";
import { ExamCountdownCard } from "@/components/planner/exam-countdown-card";
import { TaskManager } from "@/components/planner/task-manager";
import { PomodoroTimer } from "@/components/planner/pomodoro-timer";
import { StudyPetCard } from "@/components/planner/study-pet-card";
import { ClassRoutine } from "@/components/planner/class-routine";
import { StudyPlanCard } from "@/components/planner/study-plan-card";
import { BreathingExerciseCard } from "@/components/planner/breathing-exercise-card";
import { ExamChecklistCard } from "@/components/planner/exam-checklist-card";
import { CalendarView } from "@/components/planner/calendar-view";
import { HabitTracker } from "@/components/planner/habit-tracker";
import { StrictFocusCard } from "@/components/planner/strict-focus-card";
import { getUserHabits } from "@/lib/habit-tracker";

export default async function PlannerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const habits = await getUserHabits(session.user.id);

  return (
    <PageShell
      title="Study"
      titleBn="Planner"
      subtitle="রুটিন, countdown, Pomodoro, study plan — সব এক জায়গায়"
      iconKey="CalendarClock"
      iconGradient="from-emerald-500 via-teal-500 to-cyan-500"
      badge="Productivity"
    >
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        <ExamCountdownCard
          hscBatch={user.hscBatch}
          examDate={user.examDate?.toISOString() ?? null}
        />
        <PomodoroTimer />
        <StrictFocusCard />
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        <StudyPetCard />
        <BreathingExerciseCard />
      </div>

      <ExamChecklistCard />
      <StudyPlanCard />
      <ClassRoutine />
      <TaskManager initialTasks={tasks} />
      <HabitTracker initialHabits={habits} />
      <CalendarView />
    </PageShell>
  );
}
