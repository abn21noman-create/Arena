// ===================================================================
// Calendar View — MASTER_PLAN.md এর মূল ভিশনের একটা অসম্পূর্ণ আইটেম
// ("Calendar View (মাসিক/সাপ্তাহিক) — সব ক্লাস, exam, deadline এক
// জায়গায়") — এই সেশনে schema-free ভাবে বাস্তবায়ন।
// -------------------------------------------------------------------
// বিদ্যমান ৪টা সোর্স থেকে ডেটা একত্রিত করে একটা নির্দিষ্ট মাসের
// প্রতিটা দিনে কী কী ইভেন্ট আছে তা বের করে:
//   ১. Task.dueDate (deadline)
//   ২. StudyPlanItem.date (AI Auto Study Plan এর টাস্ক)
//   ৩. RoutineSlot (সাপ্তাহিক পুনরাবৃত্ত ক্লাস রুটিন, dayOfWeek থেকে
//      মাসের প্রতিটা মিলে যাওয়া তারিখে expand করা হয়)
//   ৪. User.examDate (HSC পরীক্ষা শুরুর দিন, সেট করা থাকলে ও এই মাসে
//      পড়লে)
// কোনো নতুন DB model লাগেনি — সবগুলোই বিদ্যমান মডেল থেকে on-the-fly
// aggregate করা হয়।
// ===================================================================
import { prisma } from "@/lib/prisma";

export type CalendarEventType = "task" | "study_plan" | "routine" | "exam";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  /** "YYYY-MM-DD" ফরম্যাট (লোকাল ডেট, timezone সমস্যা এড়াতে) */
  date: string;
  /** RoutineSlot এর জন্য সময় রেঞ্জ, অন্যদের জন্য null */
  timeLabel: string | null;
  colorHex: string;
  /** Task/StudyPlanItem এর জন্য সম্পন্ন হয়েছে কিনা (routine/exam এ প্রযোজ্য না, তাই null) */
  isCompleted: boolean | null;
  href: string | null;
}

function toDateKey(d: Date): string {
  // লোকাল টাইমজোনে YYYY-MM-DD (UTC তে convert করলে date shift হতে পারে,
  // তাই getFullYear/getMonth/getDate ব্যবহার করা হচ্ছে, toISOString না)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#a855f7",
};

/**
 * নির্দিষ্ট একটা মাসের (year, month 1-indexed) সব ক্যালেন্ডার ইভেন্ট
 * একত্রিত করে রিটার্ন করে।
 */
export async function getCalendarEvents(
  userId: string,
  year: number,
  month: number // 1-12
): Promise<CalendarEvent[]> {
  const monthStart = new Date(year, month - 1, 1, 0, 0, 0);
  const monthEnd = new Date(year, month, 0, 23, 59, 59); // মাসের শেষ দিন

  const [tasks, studyPlanItems, routineSlots, user] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: monthStart, lte: monthEnd },
      },
      select: { id: true, title: true, dueDate: true, priority: true, status: true },
    }),
    prisma.studyPlanItem.findMany({
      where: {
        studyPlan: { userId },
        date: { gte: monthStart, lte: monthEnd },
      },
      select: {
        id: true,
        date: true,
        taskDescription: true,
        subjectCode: true,
        isCompleted: true,
      },
    }),
    prisma.routineSlot.findMany({
      where: { userId },
      select: { id: true, dayOfWeek: true, startTime: true, endTime: true, label: true, colorHex: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { examDate: true } }),
  ]);

  const events: CalendarEvent[] = [];

  // ১. Task deadlines
  for (const t of tasks) {
    if (!t.dueDate) continue;
    events.push({
      id: `task-${t.id}`,
      type: "task",
      title: t.title,
      date: toDateKey(t.dueDate),
      timeLabel: null,
      colorHex: PRIORITY_COLORS[t.priority] ?? "#a855f7",
      isCompleted: t.status === "DONE",
      href: "/planner",
    });
  }

  // ২. Study Plan Items
  for (const item of studyPlanItems) {
    events.push({
      id: `plan-${item.id}`,
      type: "study_plan",
      title: item.taskDescription,
      date: toDateKey(item.date),
      timeLabel: null,
      colorHex: "#6d28d9",
      isCompleted: item.isCompleted,
      href: "/planner",
    });
  }

  // ৩. Routine Slots — dayOfWeek থেকে এই মাসের প্রতিটা মিলে যাওয়া
  // তারিখে expand করা হচ্ছে (recurring event pattern)
  if (routineSlots.length > 0) {
    const daysInMonth = monthEnd.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dow = currentDate.getDay(); // 0=রবি ... 6=শনি (JS ও আমাদের schema একই কনভেনশন)

      for (const slot of routineSlots) {
        if (slot.dayOfWeek !== dow) continue;
        events.push({
          id: `routine-${slot.id}-${toDateKey(currentDate)}`,
          type: "routine",
          title: slot.label,
          date: toDateKey(currentDate),
          timeLabel: `${slot.startTime}-${slot.endTime}`,
          colorHex: slot.colorHex,
          isCompleted: null,
          href: "/planner",
        });
      }
    }
  }

  // ৪. Exam Date (সেট করা থাকলে ও এই মাসে পড়লে)
  if (user?.examDate && user.examDate >= monthStart && user.examDate <= monthEnd) {
    events.push({
      id: "exam-date",
      type: "exam",
      title: "HSC পরীক্ষা শুরু 📝",
      date: toDateKey(user.examDate),
      timeLabel: null,
      colorHex: "#dc2626",
      isCompleted: null,
      href: "/planner",
    });
  }

  // তারিখ অনুযায়ী sort (একই দিনে একাধিক ইভেন্ট থাকলে UI predictable order পাবে)
  events.sort((a, b) => a.date.localeCompare(b.date));

  return events;
}
