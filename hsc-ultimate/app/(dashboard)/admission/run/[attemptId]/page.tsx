// ===================================================================
// Admission Mock Test Runner পেজ
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdmissionRunner } from "@/components/admission/admission-runner";

export default async function AdmissionRunPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { attemptId } = await params;
  return <AdmissionRunner attemptId={attemptId} />;
}
