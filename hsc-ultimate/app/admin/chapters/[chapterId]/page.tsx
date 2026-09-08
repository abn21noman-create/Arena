// ===================================================================
// Admin: Chapter Detail পেজ — টপিক লিস্ট ও ম্যানেজমেন্ট
// ===================================================================
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TopicManager } from "@/components/admin/topic-manager";

export default async function AdminChapterDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      subject: true,
      topics: {
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  if (!chapter) notFound();

  return <TopicManager chapter={chapter} initialTopics={chapter.topics} />;
}
