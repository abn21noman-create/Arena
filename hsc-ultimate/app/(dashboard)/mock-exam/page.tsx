import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/ui/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MockExamHubPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      chapters: {
        include: {
          topics: {
            include: { _count: { select: { questions: true, cqQuestions: true } } },
          },
        },
      },
    },
  });

  return (
    <PageShell
      title="Mock"
      titleBn="Exam"
      subtitle="Board format simulation — MCQ + CQ with timer"
      iconKey="ClipboardCheck"
      iconGradient="from-indigo-500 via-blue-500 to-cyan-500"
      badge="Board Format"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const counts = subject.chapters.reduce(
            (total, chapter) => {
              for (const topic of chapter.topics) {
                total.mcq += topic._count.questions;
                total.cq += topic._count.cqQuestions;
              }
              return total;
            },
            { mcq: 0, cq: 0 }
          );
          const hasQuestions = counts.mcq > 0 || counts.cq > 0;

          return (
            <Card key={subject.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: subject.colorHex }}
                >
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{subject.name}</h2>
                  <p className="truncate text-xs text-muted-foreground">{subject.nameEn}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{counts.mcq} MCQ</Badge>
                <Badge variant="outline">{counts.cq} CQ</Badge>
              </div>
              <Button render={<Link href={`/mock-exam/subject/${subject.id}`} />} disabled={!hasQuestions}>
                {hasQuestions ? "মোড বেছে নাও" : "প্রশ্ন নেই"}
                {hasQuestions && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
