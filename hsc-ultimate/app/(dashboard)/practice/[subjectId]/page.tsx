// ===================================================================
// Practice — Chapter Selection পেজ
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion, Play, ClipboardCheck } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/fade-in";

export default async function PracticeSubjectPage({
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
          topics: {
            include: {
              _count: { select: { questions: true } },
              // Previous-Year Board Question ফিচার — কতগুলো প্রশ্ন বোর্ড
              // পরীক্ষার (boardYear/boardName ট্যাগ করা) তা গণনা করার জন্য
              questions: {
                where: { OR: [{ boardYear: { not: null } }, { boardName: { not: null } }] },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!subject) notFound();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
      <FadeIn direction="down" duration={0.4}>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/practice" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
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
            <p className="text-xs text-muted-foreground">চ্যাপ্টার বেছে নিয়ে অনুশীলন শুরু করো</p>
          </div>
        </div>
      </FadeIn>

      <StaggerGroup className="space-y-3" staggerDelay={0.04}>
        {subject.chapters.map((chapter) => {
          const questionCount = chapter.topics.reduce(
            (sum, t) => sum + t._count.questions,
            0
          );
          const boardQuestionCount = chapter.topics.reduce(
            (sum, t) => sum + t.questions.length,
            0
          );
          // Pretest to Skip Known Topics — একাধিক টপিক থাকলেই ডায়াগনস্টিক
          // টেস্টের মানে হয় (১টা টপিকে "কোন টপিক জানো" প্রশ্নের প্রাসঙ্গিকতা
          // কম), তাই কমপক্ষে ২টা টপিকে প্রশ্ন থাকলে বাটন দেখানো হয়
          const topicsWithQuestionsCount = chapter.topics.filter(
            (t) => t._count.questions > 0
          ).length;

          return (
            <StaggerItem key={chapter.id}>
            <Card className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{chapter.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge variant="outline" className="text-xs gap-1">
                    <FileQuestion className="h-3 w-3" />
                    {questionCount} প্রশ্ন
                  </Badge>
                  {boardQuestionCount > 0 && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      📅 {boardQuestionCount}টা বোর্ড প্রশ্ন
                    </Badge>
                  )}
                </div>
              </div>
              {questionCount > 0 ? (
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button render={<Link href={`/practice/${subject.id}/${chapter.id}`} />} size="sm" className="gap-1.5 w-full">
                      <Play className="h-3.5 w-3.5" />
                      শুরু করো
                    </Button>
                  {boardQuestionCount > 0 && (
                    <Button render={<Link href={`/practice/${subject.id}/${chapter.id}?onlyBoard=1`} />} size="sm" variant="outline" className="gap-1.5 w-full text-xs">
                        📅 শুধু বোর্ড প্রশ্ন
                      </Button>
                  )}
                  {topicsWithQuestionsCount >= 2 && (
                    <Button render={<Link href={`/practice/${subject.id}/${chapter.id}/pretest`} />} size="sm" variant="outline" className="gap-1.5 w-full text-xs">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        প্রি-টেস্ট দাও (জানা টপিক স্কিপ করো)
                      </Button>
                  )}
                </div>
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
