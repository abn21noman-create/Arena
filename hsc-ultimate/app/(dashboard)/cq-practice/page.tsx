import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PenLine } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/ui/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function CQPracticePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      chapters: {
        include: {
          topics: { include: { _count: { select: { cqQuestions: true } } } },
        },
      },
    },
  });

  return (
    <PageShell
      title="Creative"
      titleBn="Questions"
      subtitle="CQ practice with AI grading — বোর্ড পরীক্ষার স্টাইলে উত্তর লেখো"
      iconKey="PenLine"
      iconGradient="from-purple-500 via-violet-500 to-fuchsia-500"
      badge="CQ"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const cqCount = subject.chapters.reduce(
            (chapterTotal, chapter) =>
              chapterTotal +
              chapter.topics.reduce((topicTotal, topic) => topicTotal + topic._count.cqQuestions, 0),
            0
          );

          return (
            <Card key={subject.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: subject.colorHex }}
                >
                  <PenLine className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{subject.name}</h2>
                  <p className="truncate text-xs text-muted-foreground">{subject.nameEn}</p>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">{cqCount}টি CQ</Badge>
              <Button render={<Link href={`/cq-practice/${subject.id}`} />} disabled={cqCount === 0}>
                {cqCount > 0 ? "চ্যাপ্টার বেছে নাও" : "শীঘ্রই আসছে"}
                {cqCount > 0 && <ArrowRight className="ml-1 h-4 w-4" />}
              </Button>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
