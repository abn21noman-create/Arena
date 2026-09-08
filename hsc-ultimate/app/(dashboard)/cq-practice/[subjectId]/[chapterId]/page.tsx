// ===================================================================
// CQ Practice — Answering পেজ (Client Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CQRunner } from "@/components/cq/cq-runner";

export default async function CQChapterPage({
  params,
}: {
  params: Promise<{ subjectId: string; chapterId: string }>;
}) {
  const { chapterId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <CQRunner chapterId={chapterId} />;
}
