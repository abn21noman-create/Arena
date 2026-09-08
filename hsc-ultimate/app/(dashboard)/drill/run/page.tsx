// ===================================================================
// Timed Drill Runner পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DrillRunner } from "@/components/practice/drill-runner";

export default async function DrillRunPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <DrillRunner />;
}
