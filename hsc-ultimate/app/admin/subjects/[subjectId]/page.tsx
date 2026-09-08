// ===================================================================
// Admin: Subject Detail পেজ — চ্যাপ্টার লিস্ট ও ম্যানেজমেন্ট
// ===================================================================
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChapterManager } from "@/components/admin/chapter-manager";

export default async function AdminSubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { _count: { select: { topics: true } } },
      },
    },
  });

  if (!subject) notFound();

  return <ChapterManager subject={subject} initialChapters={subject.chapters} />;
}
