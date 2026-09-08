// ===================================================================
// মিস্টেক ভল্ট রিভিশন Runner পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MistakeVaultRunner } from "@/components/practice/mistake-vault-runner";

export default async function MistakeVaultRunPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <MistakeVaultRunner />;
}
