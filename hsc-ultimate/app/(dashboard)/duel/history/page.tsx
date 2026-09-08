// ===================================================================
// Duel History পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DuelHistory } from "@/components/duel/duel-history";

export default async function DuelHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <DuelHistory currentUserId={session.user.id} />;
}
