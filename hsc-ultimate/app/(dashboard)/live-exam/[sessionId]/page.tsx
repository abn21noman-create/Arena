// ===================================================================
// Live Exam Runner পেজ (Server Component wrapper)
// -------------------------------------------------------------------
// 🔧 সম্প্রসারণ (এই সেশনে): established শুধু MCQ Runner রেন্ডার হতো।
// এখন সেশনের `questionType` চেক করে MCQ হলে established `LiveExamRunner`,
// CQ হলে নতুন `LiveExamCqRunner` রেন্ডার করা হয়। এই সার্ভার-সাইড চেক
// (client component এর ভেতরে না) একটা অতিরিক্ত নেটওয়ার্ক রাউন্ড-ট্রিপ
// বাঁচায় (সঠিক runner প্রথম রেন্ডারেই লোড হয়)।
// ===================================================================
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiveExamRunner } from "@/components/live-exam/live-exam-runner";
import { LiveExamCqRunner } from "@/components/live-exam/live-exam-cq-runner";

export default async function LiveExamRunnerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { sessionId } = await params;

  const liveExam = await prisma.liveExamSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    select: { questionType: true },
  });

  if (!liveExam) notFound();

  if (liveExam.questionType === "CQ") {
    return <LiveExamCqRunner sessionId={sessionId} />;
  }

  return <LiveExamRunner sessionId={sessionId} />;
}
