// ===================================================================
// Admission Mock Test Result পেজ
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdmissionResult } from "@/components/admission/admission-result";

export default async function AdmissionResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { attemptId } = await params;
  return <AdmissionResult attemptId={attemptId} />;
}
