import { LandingPage, type LandingStats } from "@/components/landing/landing-page";
import { prisma } from "@/lib/prisma";

// Public counts must come from the current database, never from marketing
// constants. If the database is unavailable the UI shows an em dash instead of
// inventing a fallback number.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getLandingStats(): Promise<LandingStats> {
  try {
    const [subjects, chapters, coreMcq, admissionMcq, cq, badges] = await Promise.all([
      prisma.subject.count(),
      prisma.chapter.count(),
      prisma.question.count(),
      prisma.admissionQuestion.count(),
      prisma.cQQuestion.count(),
      prisma.badge.count(),
    ]);
    return { subjects, chapters, coreMcq, admissionMcq, cq, badges };
  } catch {
    return {
      subjects: null,
      chapters: null,
      coreMcq: null,
      admissionMcq: null,
      cq: null,
      badges: null,
    };
  }
}

export default async function HomePage() {
  return <LandingPage stats={await getLandingStats()} />;
}
