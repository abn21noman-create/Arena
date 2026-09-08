// ===================================================================
// Subject Detail পেজ — একটা সাবজেক্টের সব Chapter ও Topic দেখায়
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Circle, Star, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "শুরু হয়নি",
  LEARNING: "শিখছো",
  PRACTICING: "অনুশীলন করছো",
  MASTERED: "আয়ত্ত হয়েছে",
};

export default async function SubjectPage({
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
            orderBy: { order: "asc" },
            include: {
              topicProgress: { where: { userId: session.user.id } },
            },
          },
        },
      },
    },
  });

  if (!subject) notFound();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/learn" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
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
          <p className="text-xs text-muted-foreground">{subject.nameEn}</p>
        </div>
      </div>

      <div className="space-y-5 mt-6">
        {subject.chapters.map((chapter, idx) => {
          // Reading Progress Bar (per chapter completion %) — MASTER_PLAN.md
          // এর মূল ভিশনের আইটেম, Subject-level progress এর একই সংজ্ঞা
          // অনুসরণ করে (MASTERED টপিক / মোট টপিক) — schema-free, বিদ্যমান
          // TopicProgress ডেটা থেকে on-the-fly গণনা করা হচ্ছে
          const totalTopics = chapter.topics.length;
          const masteredTopics = chapter.topics.filter(
            (t) => t.topicProgress[0]?.status === "MASTERED"
          ).length;
          const chapterProgressPct =
            totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

          return (
          <Card key={chapter.id} className="p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <h2 className="font-semibold flex-1 min-w-0 truncate">{chapter.name}</h2>
              <span className="text-xs text-muted-foreground shrink-0">
                {masteredTopics}/{totalTopics} আয়ত্ত
              </span>
            </div>
            <Progress value={chapterProgressPct} className="h-1.5 mb-3 ml-8" />
            <div className="space-y-1.5 pl-8">
              {chapter.topics.map((topic) => {
                const status = topic.topicProgress[0]?.status ?? "NOT_STARTED";
                return (
                  <Link
                    key={topic.id}
                    href={`/learn/${subject.id}/${topic.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {status === "MASTERED" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm truncate group-hover:text-primary transition-colors">
                        {topic.name}
                      </span>
                      {topic.isImportant && (
                        <Star className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          status === "MASTERED" &&
                            "border-violet-600 text-violet-600 dark:text-violet-400"
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </Badge>
                      <PlayCircle className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
}
