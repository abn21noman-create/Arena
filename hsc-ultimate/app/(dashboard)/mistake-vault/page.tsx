// ===================================================================
// Mistake Vault — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { MistakeVaultIntro } from "@/components/practice/mistake-vault-intro";

export default async function MistakeVaultPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Mistake"
      titleBn="Vault"
      subtitle="তোমার সব ভুল প্রশ্ন এক জায়গায় — দুর্বলতা চিহ্নিত করো"
      iconKey="AlertCircle"
      iconGradient="from-rose-500 via-red-500 to-orange-500"
      badge="Weak Topics"
    >
      <MistakeVaultIntro />
    </PageShell>
  );
}
