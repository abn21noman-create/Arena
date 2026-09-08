// ===================================================================
// Admission Prep — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { AdmissionHub } from "@/components/admission/admission-hub";

export default async function AdmissionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Admission"
      titleBn="Prep"
      subtitle="Medical, BUET, DU 'ক' ইউনিট — negative marking, exam simulation"
      iconKey="GraduationCap"
      iconGradient="from-cyan-500 via-teal-500 to-emerald-500"
      badge="Next Level"
    >
      <AdmissionHub />
    </PageShell>
  );
}
