import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { StrictFocusDashboard } from "@/components/focus/strict-focus-dashboard";

export default async function FocusPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="Strict"
      titleBn="Focus"
      subtitle="Deep Study mode — ২০ মিনিট থেকে ২ ঘণ্টা distraction block"
      iconKey="ShieldCheck"
      iconGradient="from-violet-600 via-fuchsia-600 to-rose-600"
      badge="Deep Focus"
    >
      <StrictFocusDashboard />
    </PageShell>
  );
}
