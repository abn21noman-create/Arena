// ===================================================================
// Percentile / Rank System — Mock Exam এ ইউজার সব অংশগ্রহণকারীর তুলনায়
// কোথায় আছে তা হিসাব করে (Testbook/Vedantu-স্টাইল rank analysis)।
// -------------------------------------------------------------------
// ডিজাইন নোট: একই Subject + Mode এর সব COMPLETED MockExamAttempt এর মধ্যে
// তুলনা করা হয় (প্রতিটা ইউজারের সর্বোচ্চ স্কোর ধরে, বার বার দিলে যেন rank
// কৃত্রিমভাবে ভালো/খারাপ না হয়ে যায়)। Percentile হিসাব করা হয়
// "আমার চেয়ে কম স্কোর করা শতাংশ" — অর্থাৎ percentile 90 মানে তুমি ৯০%
// পরীক্ষার্থীর চেয়ে ভালো করেছো।
// ===================================================================
import { prisma } from "@/lib/prisma";

export interface PercentileResult {
  rank: number; // ১-ইনডেক্সড (সেরা = ১)
  totalParticipants: number;
  percentile: number; // 0-100, "তোমার চেয়ে কম স্কোর করা শতাংশ ইউজার"
  myBestPercentage: number;
}

/**
 * একটা নির্দিষ্ট Subject+Mode এর জন্য সব ইউজারের সেরা স্কোর (percentage) বের
 * করে, তারপর দেওয়া userId এর rank ও percentile হিসাব করে।
 * প্রতিটা ইউজারকে একবারই গণনা করা হয় (তার সর্বোচ্চ percentage attempt দিয়ে)।
 */
export async function calculateMockExamPercentile(
  subjectId: string,
  mode: "FULL" | "QUICK",
  userId: string
): Promise<PercentileResult | null> {
  const attempts = await prisma.mockExamAttempt.findMany({
    where: { subjectId, mode, status: "COMPLETED" },
    select: {
      userId: true,
      mcqScore: true,
      mcqTotal: true,
      cqScore: true,
      cqTotal: true,
    },
  });

  if (attempts.length === 0) return null;

  // প্রতিটা ইউজারের সর্বোচ্চ percentage বের করা হচ্ছে
  const bestByUser = new Map<string, number>();
  for (const a of attempts) {
    const totalMarks = a.mcqTotal + a.cqTotal;
    const pct = totalMarks > 0 ? ((a.mcqScore + a.cqScore) / totalMarks) * 100 : 0;
    const existing = bestByUser.get(a.userId);
    if (existing === undefined || pct > existing) {
      bestByUser.set(a.userId, pct);
    }
  }

  const myBestPercentage = bestByUser.get(userId);
  if (myBestPercentage === undefined) return null;

  const allScores = Array.from(bestByUser.values()).sort((a, b) => b - a);
  const totalParticipants = allScores.length;

  // rank: আমার চেয়ে বেশি স্কোর করা কতজন আছে, তার + ১
  const betterCount = allScores.filter((s) => s > myBestPercentage).length;
  const rank = betterCount + 1;

  // percentile: আমার চেয়ে কম বা সমান স্কোর করা কত শতাংশ (নিজেকে বাদ দিয়ে)
  const worseOrEqualCount = totalParticipants - betterCount - 1; // নিজেকে বাদ
  const percentile =
    totalParticipants > 1
      ? Math.round((worseOrEqualCount / (totalParticipants - 1)) * 100)
      : 100;

  return {
    rank,
    totalParticipants,
    percentile: Math.max(0, Math.min(100, percentile)),
    myBestPercentage: Math.round(myBestPercentage),
  };
}
