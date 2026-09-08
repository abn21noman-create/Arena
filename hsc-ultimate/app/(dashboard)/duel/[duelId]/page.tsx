// ===================================================================
// Active Duel পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DuelRoom } from "@/components/duel/duel-room";

export default async function DuelDetailPage({
  params,
}: {
  params: Promise<{ duelId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { duelId } = await params;

  return <DuelRoom duelId={duelId} currentUserId={session.user.id} />;
}
