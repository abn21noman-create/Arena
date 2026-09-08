// ===================================================================
// Live Exam শুরু করার কনফিগারেশন পেজ — Subject বা Custom Set বাছাই +
// সময়সীমা সেট করে সেশন শুরু করে
// -------------------------------------------------------------------
// 🔧 সম্প্রসারণ (এই সেশনে): আগে শুধু MCQ custom set খোঁজা হতো
// (`questionType: "MCQ"` hardcoded)। এখন custom set এর questionType
// যাই হোক (MCQ অথবা CQ) সেটাই preselect করে ফর্মে পাঠানো হয় — ফর্ম
// নিজে থেকে সঠিক UI (MCQ অপশন-বাছাই বনাম CQ টেক্সট-উত্তর) দেখাবে।
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiveExamStartForm } from "@/components/live-exam/live-exam-start-form";

export default async function LiveExamStartPage({
  searchParams,
}: {
  searchParams: Promise<{ customSetId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { customSetId } = await searchParams;

  const [subjects, customSet] = await Promise.all([
    prisma.subject.findMany({ orderBy: { order: "asc" } }),
    customSetId
      ? prisma.customQuestionSet.findFirst({
          where: { id: customSetId, userId: session.user.id, status: "READY" },
          include: { _count: { select: { questions: true } } },
        })
      : null,
  ]);

  return (
    <LiveExamStartForm
      subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      preselectedCustomSet={
        customSet
          ? {
              id: customSet.id,
              title: customSet.title,
              questionCount: customSet._count.questions,
              questionType: customSet.questionType,
            }
          : null
      }
    />
  );
}

