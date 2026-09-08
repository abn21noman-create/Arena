// ===================================================================
// একক PDF এর চ্যাট পেজ (Server Component wrapper)
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PdfChatRoom } from "@/components/pdf-chat/pdf-chat-room";

export default async function PdfChatRoomPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { documentId } = await params;
  return <PdfChatRoom documentId={documentId} />;
}
