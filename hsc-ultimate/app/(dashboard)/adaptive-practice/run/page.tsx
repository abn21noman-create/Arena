// ===================================================================
// Adaptive Practice Runner পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdaptivePracticeRunner } from "@/components/practice/adaptive-practice-runner";

export default async function AdaptivePracticeRunPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <AdaptivePracticeRunner />;
}
