// ===================================================================
// Duel Lobby — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/ui/page-shell";
import { DuelLobby } from "@/components/duel/duel-lobby";

export default async function DuelPage({
  searchParams,
}: {
  searchParams: Promise<{ customSetId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { customSetId } = await searchParams;

  const [subjects, customSet] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, nameEn: true, colorHex: true },
    }),
    customSetId
      ? prisma.customQuestionSet.findFirst({
          where: { id: customSetId, userId: session.user.id, status: "READY", questionType: "MCQ" },
          include: { _count: { select: { questions: true } } },
        })
      : null,
  ]);

  return (
    <PageShell
      title="Quiz"
      titleBn="Duel"
      subtitle="1v1 challenge — public lobby তে চ্যালেঞ্জ খোঁজো বা নতুন বানাও"
      iconKey="Swords"
      iconGradient="from-rose-500 via-red-500 to-orange-500"
      badge="1v1"
    >
      <DuelLobby
        subjects={subjects}
        preselectedCustomSet={
          customSet ? { id: customSet.id, title: customSet.title, questionCount: customSet._count.questions } : null
        }
      />
    </PageShell>
  );
}
