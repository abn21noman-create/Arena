// ===================================================================
// Saved Topics — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/ui/page-shell";
import { Bookmark, Folder } from "lucide-react";
import { SavedTopicsPageClient } from "@/components/saved/saved-topics-page";
import { GlassCard } from "@/components/ui/glass-card";
import { CountUp } from "@/components/ui/count-up";

export default async function SavedTopicsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [bookmarks, folders] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        topic: {
          include: {
            chapter: { include: { subject: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookmarkFolder.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { bookmarks: true } } },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <PageShell
      title="Saved"
      titleBn="Topics"
      subtitle="পরে পড়ার জন্য যেসব টপিক সেভ করেছো — ফোল্ডারে সাজাও"
      iconKey="Bookmark"
      iconGradient="from-violet-500 via-fuchsia-500 to-pink-500"
      badge="Bookmarks"
    >
      {/* Stats Bento */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <GlassCard className="p-4 sm:p-5" variant="gradient-border">
          <Bookmark className="h-5 w-5 text-violet-500 mb-2" />
          <div className="text-2xl sm:text-3xl font-bold text-gradient">
            <CountUp end={bookmarks.length} duration={1500} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Saved topics</p>
        </GlassCard>
        <GlassCard className="p-4 sm:p-5" variant="gradient-border">
          <Folder className="h-5 w-5 text-fuchsia-500 mb-2" />
          <div className="text-2xl sm:text-3xl font-bold text-gradient">
            <CountUp end={folders.length} duration={1500} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Collections</p>
        </GlassCard>
      </div>

      <SavedTopicsPageClient initialBookmarks={bookmarks} initialFolders={folders} />
    </PageShell>
  );
}
