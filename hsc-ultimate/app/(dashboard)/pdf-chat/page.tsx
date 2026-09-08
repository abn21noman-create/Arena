// ===================================================================
// PDF Chat — Premium 2026
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageShell } from "@/components/ui/page-shell";
import { PdfChatDashboard } from "@/components/pdf-chat/pdf-chat-dashboard";

export default async function PdfChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <PageShell
      title="PDF"
      titleBn="Chat"
      subtitle="তোমার নোট/বইয়ের PDF আপলোড করো — AI সেটা থেকে প্রশ্নের উত্তর দেবে"
      iconKey="FileText"
      iconGradient="from-rose-500 via-pink-500 to-fuchsia-500"
      badge="RAG"
    >
      <PdfChatDashboard />
    </PageShell>
  );
}
