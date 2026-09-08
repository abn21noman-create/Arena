// ===================================================================
// Flashcard Review পেজ (Client Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ReviewRunner } from "@/components/flashcards/review-runner";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <ReviewRunner deckId={deckId} />;
}
