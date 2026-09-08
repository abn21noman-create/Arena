// ===================================================================
// Pretest Taking পেজ (Client Component wrapper)
// -------------------------------------------------------------------
// components/practice/quiz-runner.tsx এর একই সার্ভার পেজ প্যাটার্ন
// অনুসরণ করা হয়েছে (auth চেক করে Client Runner রেন্ডার করা)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PretestRunner } from "@/components/practice/pretest-runner";

export default async function ChapterPretestPage({
  params,
}: {
  params: Promise<{ subjectId: string; chapterId: string }>;
}) {
  const { subjectId, chapterId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <PretestRunner subjectId={subjectId} chapterId={chapterId} />;
}
