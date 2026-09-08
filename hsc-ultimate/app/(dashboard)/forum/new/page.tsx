// ===================================================================
// New Forum Post — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { NewPostForm } from "@/components/forum/new-post-form";

export default async function NewForumPostPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="New"
      titleBn="Discussion"
      subtitle="নতুন প্রশ্ন বা আলোচনা শুরু করো"
      iconKey="PenLine"
      iconGradient="from-fuchsia-500 via-pink-500 to-rose-500"
      backHref="/forum"
    >
      <NewPostForm />
    </PageShell>
  );
}
