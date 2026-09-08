// ===================================================================
// Mock Exam Result পেজ (Server wrapper) — auth চেক করে client component দেয়
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MockExamResult } from "@/components/mock-exam/mock-exam-result";

export default async function MockExamResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <MockExamResult attemptId={attemptId} />;
}
