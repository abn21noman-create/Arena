// ===================================================================
// Forum Post Detail — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PostDetail } from "@/components/forum/post-detail";

export default async function ForumPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // PostDetail already has its own premium UI — no wrapper needed
  return <PostDetail postId={postId} currentUserId={session.user.id} />;
}
