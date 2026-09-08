// ===================================================================
// Report Card Data Aggregator — PDF এক্সপোর্টের জন্য ইউজারের সব
// পারফরম্যান্স ডেটা একসাথে জোগাড় করে একটা structured object বানায়
// -------------------------------------------------------------------
// বিদ্যমান lib/analytics.ts ও lib/gpa-predictor.ts এর ফাংশনগুলো পুনরায়
// ব্যবহার করা হয়েছে (কোনো ডুপ্লিকেট লজিক লেখা হয়নি) — এটা শুধু সেগুলোর
// আউটপুট একটা "Report Card" আকারে সাজায়।
// ===================================================================
import { prisma } from "@/lib/prisma";
import {
  getOverallStats,
  getSubjectPerformance,
  getWeakTopics,
  type OverallStats,
  type SubjectPerformance,
  type WeakTopic,
} from "@/lib/analytics";
import { getPredictedGpaSummary, type PredictedGpaSummary } from "@/lib/gpa-predictor";
import { getGpaRemark } from "@/lib/gpa";

export interface ReportCardData {
  user: {
    name: string;
    email: string;
    hscBatch: number;
    board: string | null;
    level: number;
    xp: number;
  };
  generatedAt: string; // বাংলা তারিখ ফরম্যাটে
  overallStats: OverallStats;
  subjectPerformance: SubjectPerformance[];
  weakTopics: WeakTopic[];
  gpaSummary: PredictedGpaSummary;
  gpaRemark: string | null;
}

/** নির্দিষ্ট ইউজারের সম্পূর্ণ Report Card ডেটা একসাথে জোগাড় করে */
export async function getReportCardData(userId: string): Promise<ReportCardData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [overallStats, subjectPerformance, weakTopics, gpaSummary] = await Promise.all([
    getOverallStats(userId),
    getSubjectPerformance(userId),
    getWeakTopics(userId, 5),
    getPredictedGpaSummary(userId),
  ]);

  const gpaRemark = gpaSummary.gpaResult
    ? getGpaRemark(gpaSummary.gpaResult.gpa, gpaSummary.gpaResult.isPass)
    : null;

  return {
    user: {
      name: user.name,
      email: user.email,
      hscBatch: user.hscBatch,
      board: user.board,
      level: user.level,
      xp: user.xp,
    },
    generatedAt: new Date().toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    overallStats,
    subjectPerformance,
    weakTopics,
    gpaSummary,
    gpaRemark,
  };
}
