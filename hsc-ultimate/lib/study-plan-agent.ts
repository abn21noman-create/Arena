// ===================================================================
// Study Plan Agent — Continuous Monitoring (Static → Proactive Upgrade)
// -------------------------------------------------------------------
// আগে Auto Study Plan শুধু একবার generate হতো (ইউজার নিজে চাইলে), তারপর
// ৭ দিন সেটাই থেকে যেত — কোনো re-check/re-plan হতো না। এই ফিচার সেটাকে
// একটা হালকা "এজেন্ট" প্যাটার্নে upgrade করে: Duolingo League Reset ও
// Study Pet Happiness Decay এর মতোই **lazy-check** (কোনো cron job ছাড়া) —
// ইউজার active হলেই (gamification sync কল হলে) দুটো জিনিস চেক করা হয়:
//
// ১. **প্ল্যানের মেয়াদ শেষ**: আজকের তারিখ প্ল্যানের endDate পার হয়ে গেলে
//    একটা নোটিফিকেশন পাঠানো হয় ("তোমার ৭ দিনের প্ল্যান শেষ, নতুন প্ল্যান
//    বানাও") — `renewalSuggested` flag দিয়ে duplicate notification আটকানো হয়।
// ২. **নতুন গুরুতর দুর্বল টপিক**: বর্তমান active প্ল্যানে না থাকা এমন একটা
//    টপিক যদি খুব দুর্বল হয়ে যায় (accuracy < 50%, কমপক্ষে ৩টা উত্তর —
//    সাধারণ ৭০%/২টার চেয়ে কড়া থ্রেশহোল্ড, যাতে শুধু critical alert-ই আসে,
//    noise না) তাহলে একটা প্রোঅ্যাক্টিভ নোটিফিকেশন পাঠানো হয়
//    ("তুমি বারবার [টপিক] এ ভুল করছো, রিভিশন করা উচিত")।
//
// কোনো নতুন AI কল হয় না এখানে (শুধু existing getWeakTopics() ডেটা রিইউজ
// করা হয়), তাই এই monitoring সম্পূর্ণ ফ্রি (cost-conscious ডিজাইন)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { getWeakTopics } from "@/lib/analytics";
import { createNotification } from "@/lib/notifications";

const CRITICAL_ACCURACY_THRESHOLD = 50; // সাধারণ weak-topic থ্রেশহোল্ড (৭০%) এর চেয়ে কড়া
const CRITICAL_MIN_ANSWERS = 3;

export interface StudyPlanAgentResult {
  renewalNotified: boolean;
  criticalTopicNotified: string | null; // notify করা টপিকের নাম, না হলে null
}

/**
 * ইউজার active হলেই (gamification sync এ) কল হয় — lazy check, cron লাগে না।
 * Silent-safe: এই ফাংশনের ভেতরের কোনো ব্যর্থতা মূল sync flow কে থামাবে না।
 */
export async function runStudyPlanAgent(userId: string): Promise<StudyPlanAgentResult> {
  const result: StudyPlanAgentResult = { renewalNotified: false, criticalTopicNotified: null };

  try {
    const plan = await prisma.studyPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { select: { topicName: true } } },
    });

    // কোনো প্ল্যানই নেই — এজেন্টের কিছু করার নেই, ইউজার নিজে প্রথমবার বানাবে
    if (!plan) return result;

    const now = new Date();

    // ১. মেয়াদ শেষ হওয়া চেক (renewal reminder)
    if (now > plan.endDate && !plan.renewalSuggested) {
      await createNotification({
        userId,
        title: "📅 তোমার স্টাডি প্ল্যানের মেয়াদ শেষ",
        body: `তোমার ${plan.durationDays} দিনের প্ল্যান শেষ হয়ে গেছে। Planner পেজে গিয়ে নতুন প্ল্যান বানিয়ে নাও।`,
        link: "/planner",
      });
      await prisma.studyPlan.update({
        where: { id: plan.id },
        data: { renewalSuggested: true },
      });
      result.renewalNotified = true;
    }

    // ২. নতুন critical দুর্বল টপিক চেক (proactive alert) — শুধু active প্ল্যান
    // থাকা অবস্থায় (মেয়াদ শেষ না হলে) করা হয়, যাতে renewal reminder এর সাথে
    // না জড়িয়ে যায়
    if (now <= plan.endDate) {
      const weakTopics = await getWeakTopics(userId, 10);
      const planTopicNames = new Set(
        plan.items.map((i) => i.topicName).filter((t): t is string => !!t)
      );

      const criticalUnplannedTopic = weakTopics.find(
        (t) =>
          t.accuracyPct < CRITICAL_ACCURACY_THRESHOLD &&
          t.totalAnswered >= CRITICAL_MIN_ANSWERS &&
          !planTopicNames.has(t.topicName)
      );

      if (criticalUnplannedTopic) {
        // একই টপিকের জন্য বার বার নোটিফিকেশন এড়াতে — গত ৩ দিনে একই টাইটেলের
        // নোটিফিকেশন পাঠানো হয়েছে কিনা চেক করা হয় (idempotent-ish, কড়া
        // deduplication টেবিল ছাড়াই সহজ সমাধান)
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const alreadyNotified = await prisma.notification.findFirst({
          where: {
            userId,
            title: { contains: criticalUnplannedTopic.topicName },
            createdAt: { gte: threeDaysAgo },
          },
        });

        if (!alreadyNotified) {
          await createNotification({
            userId,
            title: `⚠️ "${criticalUnplannedTopic.topicName}" এ বারবার ভুল হচ্ছে`,
            body: `এই টপিকে তোমার accuracy মাত্র ${criticalUnplannedTopic.accuracyPct}% — এটা এখনকার প্ল্যানে নেই। একটু বাড়তি সময় দিয়ে Smart Practice এ এই টপিক রিভিশন করে নাও।`,
            link: "/adaptive-practice",
          });
          result.criticalTopicNotified = criticalUnplannedTopic.topicName;
        }
      }
    }
  } catch (err) {
    // Silent-safe — agent এর কোনো ব্যর্থতা মূল gamification sync ফ্লো থামাবে না
    console.error("Study Plan Agent এ সমস্যা হয়েছে:", err);
  }

  return result;
}
