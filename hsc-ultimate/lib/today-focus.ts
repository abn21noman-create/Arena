// ===================================================================
// "আজকের পড়া" (Today's Focus) — ব্যবহারকারীর অনুরোধ অনুযায়ী নতুন ফিচার
// -------------------------------------------------------------------
// ব্যবহারকারীর মূল চাহিদা: Dashboard-এর উপরের দিকে প্রতিদিনের নির্দিষ্ট
// পড়া prominently দেখানো, complete করলে "শেষ" মার্ক করা যাবে, এবং কোনো
// দিন miss করলে (না পড়লে) সেটা পরের দিন "বকেয়া" হিসেবে stack হয়ে
// দেখাবে যতক্ষণ না শেষ করা হয়।
//
// ডিজাইন — কোনো নতুন "miss/rollover" ফিল্ড বা cron/background job
// লাগেনি, একটা সাধারণ query দিয়েই achieve করা হয়েছে (Python এ
// pre-verify করা হয়েছে, দেখো git history/test script):
//   date <= আজকের তারিখ (মধ্যরাত normalized)  AND  isCompleted = false
// এটা স্বয়ংক্রিয়ভাবে আজকের আইটেম + অতীতের যেকোনো অসম্পূর্ণ (miss করা)
// আইটেম একসাথে রিটার্ন করে — যেদিন miss হয়েছে সেই তারিখ অপরিবর্তিত
// থাকে (নতুন করে "আজকের তারিখে" কপি করা হয় না), তাই "কবে থেকে বকেয়া"
// তা UI তে দেখানো সম্ভব (formatOverdueLabel())।
// ===================================================================
import { prisma } from "@/lib/prisma";

export interface TodayFocusItem {
  id: string;
  date: Date;
  subjectCode: string;
  topicName: string | null;
  taskDescription: string;
  durationMinutes: number;
  priority: string;
  isCompleted: boolean;
  isOverdue: boolean; // date আজকের আগে হলে true (miss করা/বকেয়া আইটেম)
}

function getTodayMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * ইউজারের সক্রিয় StudyPlan থেকে "আজকের পড়া" আইটেম বের করে —
 * আজকের তারিখের আইটেম + অতীতের সব অসম্পূর্ণ (miss করা) আইটেম, একসাথে
 * সবার আগে বকেয়া (সবচেয়ে পুরনো আগে) তারপর আজকের আইটেম এই ক্রমে সাজানো।
 */
export async function getTodayFocus(userId: string): Promise<{
  planId: string | null;
  items: TodayFocusItem[];
  overdueCount: number;
  generationStatus: string | null;
  daysGenerated: number;
  durationDays: number;
} | null> {
  const plan = await prisma.studyPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!plan) return null;

  const today = getTodayMidnight();

  const items = await prisma.studyPlanItem.findMany({
    where: {
      studyPlanId: plan.id,
      date: { lte: today },
      isCompleted: false,
    },
    orderBy: { date: "asc" }, // সবচেয়ে পুরনো বকেয়া আগে, আজকেরটা সবার শেষে
  });

  const mapped: TodayFocusItem[] = items.map((item) => ({
    id: item.id,
    date: item.date,
    subjectCode: item.subjectCode,
    topicName: item.topicName,
    taskDescription: item.taskDescription,
    durationMinutes: item.durationMinutes,
    priority: item.priority,
    isCompleted: item.isCompleted,
    isOverdue: item.date.getTime() < today.getTime(),
  }));

  const overdueCount = mapped.filter((i) => i.isOverdue).length;

  return {
    planId: plan.id,
    items: mapped,
    overdueCount,
    generationStatus: plan.generationStatus,
    daysGenerated: plan.daysGenerated,
    durationDays: plan.durationDays,
  };
}
