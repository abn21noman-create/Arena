// ===================================================================
// Admin: Subject লিস্ট পেজ (Server Component wrapper)
// ===================================================================
import { prisma } from "@/lib/prisma";
import { SubjectManager } from "@/components/admin/subject-manager";

export const dynamic = "force-dynamic";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { chapters: true } } },
  });

  return <SubjectManager initialSubjects={subjects} />;
}
