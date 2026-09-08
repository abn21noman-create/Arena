// ===================================================================
// CQ Practice — Chapter Selection পেজ
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Play } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/fade-in";

export default async function CQSubjectPage({
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
        orderBy: { order: "asc" },
        include: {
          topics: { include: { _count: { select: { cqQuestions: true } } } },
        },
      },
    },
  });

  if (!subject) notFound();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
      <FadeIn direction="down" duration={0.4}>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/cq-practice" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: subject.colorHex }}
          >
            {subject.nameEn.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{subject.name}</h1>
            <p className="text-xs text-muted-foreground">চ্যাপ্টার বেছে CQ অনুশীলন শুরু করো</p>
          </div>
        </div>
      </FadeIn>

      <StaggerGroup className="space-y-3" staggerDelay={0.04}>
        {subject.chapters.map((chapter) => {
          const cqCount = chapter.topics.reduce((sum, t) => sum + t._count.cqQuestions, 0);

          return (
            <StaggerItem key={chapter.id}>
            <Card className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{chapter.name}</h3>
                <Badge variant="outline" className="mt-1 text-xs gap-1">
                  <FileText className="h-3 w-3" />
                  {cqCount} CQ
                </Badge>
              </div>
              {cqCount > 0 ? (
                <Button render={<Link href={`/cq-practice/${subject.id}/${chapter.id}`} />} size="sm" className="gap-1.5 shrink-0">
                    <Play className="h-3.5 w-3.5" />
                    শুরু করো
                  </Button>
              ) : (
                <Button size="sm" variant="outline" disabled className="shrink-0">
                  শীঘ্রই আসছে
                </Button>
              )}
            </Card>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}
