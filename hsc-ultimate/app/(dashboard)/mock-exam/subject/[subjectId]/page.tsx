// ===================================================================
// Mock Exam Mode Selection পেজ — Full Timed vs Quick Practice বেছে নেওয়া
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { MockExamModeSelector } from "@/components/mock-exam/mode-selector";

export default async function MockExamModePage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        include: {
          topics: {
            include: {
              _count: { select: { questions: true, cqQuestions: true } },
            },
          },
        },
      },
    },
  });

  if (!subject) notFound();

  const mcqCount = subject.chapters.reduce(
    (sum, ch) => sum + ch.topics.reduce((s, t) => s + t._count.questions, 0),
    0
  );
  const cqCount = subject.chapters.reduce(
    (sum, ch) => sum + ch.topics.reduce((s, t) => s + t._count.cqQuestions, 0),
    0
  );

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/mock-exam" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-2xl font-bold">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">
            মোড বেছে নিয়ে পরীক্ষা শুরু করো
          </p>
        </div>
      </div>

      <MockExamModeSelector
        subjectId={subject.id}
        mcqAvailable={mcqCount}
        cqAvailable={cqCount}
      />
    </div>
  );
}
