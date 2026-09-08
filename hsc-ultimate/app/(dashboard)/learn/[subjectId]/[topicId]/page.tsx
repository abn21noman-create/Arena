// ===================================================================
// Topic Detail পেজ — ভিডিও, নোট, ফর্মুলা শীট এবং Mastery স্ট্যাটাস বাটন
// ===================================================================
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Star, Sparkles } from "lucide-react";
import { TopicProgressControls } from "@/components/learn/topic-progress-controls";
import { BookmarkButton } from "@/components/learn/bookmark-button";
import { TopicNoteEditor } from "@/components/learn/topic-note-editor";
import { TextToSpeechButton } from "@/components/learn/text-to-speech-button";
import { TopicNotesDownloadButton } from "@/components/learn/topic-notes-download-button";
import { PeerNotesBrowser } from "@/components/learn/peer-notes-browser";
import { MindMapCard } from "@/components/shared/mind-map-card";
import type { MindMapNode } from "@/components/shared/mind-map-tree";
import { MarkdownLite } from "@/components/shared/markdown-lite";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcademicReportButton } from "@/components/shared/academic-report-button";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ subjectId: string; topicId: string }>;
}) {
  const { subjectId, topicId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      chapter: { include: { subject: true } },
      topicProgress: { where: { userId: session.user.id } },
    },
  });

  if (!topic || topic.chapter.subjectId !== subjectId) notFound();

  const currentStatus = topic.topicProgress[0]?.status ?? "NOT_STARTED";

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/learn/${subjectId}`} className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">
            {topic.chapter.subject.name} • {topic.chapter.name}
          </p>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {topic.name}
            {topic.isImportant && (
              <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
            )}
          </h1>
        </div>
        <AcademicReportButton targetType="TOPIC_NOTE" targetId={topic.id} compact />
        <TopicNotesDownloadButton topicId={topic.id} />
        <BookmarkButton topicId={topic.id} />
      </div>

      {/* Video placeholder */}
      {topic.videoUrl ? (
        <Card className="aspect-video mb-6 overflow-hidden">
          <iframe
            src={topic.videoUrl}
            className="w-full h-full"
            allowFullScreen
          />
        </Card>
      ) : (
        <Card className="aspect-video mb-6 flex flex-col items-center justify-center bg-muted/50 text-center px-6">
          <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            এই টপিকের ভিডিও লেসন শীঘ্রই যোগ করা হবে
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ({topic.nameEn})
          </p>
        </Card>
      )}

      {/* Notes */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm text-muted-foreground">নোট</h2>
          {topic.notesMarkdown && (
            <TextToSpeechButton text={topic.notesMarkdown} label="নোট শুনো" />
          )}
        </div>
        {topic.notesMarkdown ? (
          <div className="prose prose-sm max-w-none">
            <MarkdownLite text={topic.notesMarkdown} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            এই টপিকের বিস্তারিত নোট শীঘ্রই যোগ করা হবে। আপাতত AI প্রশ্নোত্তর
            ব্যবহার করে এই বিষয়ে প্রশ্ন করতে পারো।
          </p>
        )}
      </Card>

      {/* Formula Sheet — 🐛 বাগ ফিক্স: এই ফিল্ড schema তে আগে থেকেই ছিল
          কিন্তু কখনো এই পেজে রেন্ডার হতো না (Downloadable PDF Notes
          ফিচারের সময় আবিষ্কৃত ও ঠিক করা হয়েছে) */}
      {topic.formulaSheet?.trim() && (
        <Card className="p-5 mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground mb-2">
            ফর্মুলা শীট
          </h2>
          <div className="prose prose-sm max-w-none bg-muted/40 rounded-md p-3">
            <MarkdownLite text={topic.formulaSheet} />
          </div>
        </Card>
      )}

      <MindMapCard
        generateUrl={`/api/topics/${topic.id}/mind-map`}
        initialMindMap={topic.mindMap as MindMapNode | null}
        disabled={!topic.notesMarkdown?.trim()}
        disabledMessage="নোট যোগ হলে এই টপিকের mind map বানানো যাবে"
      />

      {/* Ask AI shortcut */}
      <Button render={<Link href="/ai-tutor" />} variant="outline" className="w-full mb-6 gap-2">
          <Sparkles className="h-4 w-4" />
          এই টপিক নিয়ে AI কে জিজ্ঞেস করো
        </Button>

      {/* My Note */}
      <div className="mb-6">
        <TopicNoteEditor topicId={topic.id} />
      </div>

      {/* Peer Note Sharing — সহপাঠীদের শেয়ার করা নোট */}
      <PeerNotesBrowser topicId={topic.id} />

      {/* Mastery controls */}
      <TopicProgressControls topicId={topic.id} currentStatus={currentStatus} />
    </div>
  );
}
