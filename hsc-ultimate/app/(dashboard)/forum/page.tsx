// ===================================================================
// Forum Hub — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { ForumFeed } from "@/components/forum/forum-feed";

export default async function ForumPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Community"
      titleBn="Forum"
      subtitle="সহপাঠীদের সাথে প্রশ্ন-উত্তর, peer learning, study groups"
      iconKey="MessageCircle"
      iconGradient="from-fuchsia-500 via-pink-500 to-rose-500"
      badge="Community"
    >
      <ForumFeed />
    </PageShell>
  );
}
