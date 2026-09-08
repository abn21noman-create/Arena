// ===================================================================
// Mock Exam Runner পেজ — MCQ+CQ দুই ফেজ চালানোর client wrapper
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MockExamRunner } from "@/components/mock-exam/mock-exam-runner";

export default async function MockExamRunnerPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <MockExamRunner attemptId={attemptId} />;
}
