// ===================================================================
// Admission Mock Test History পেজ
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdmissionHistory } from "@/components/admission/admission-history";

export default async function AdmissionHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <AdmissionHistory />;
}
