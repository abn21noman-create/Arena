// ===================================================================
// PDF Chat — একক ডকুমেন্ট: স্ট্যাটাস চেক (polling) + ডিলিট
// GET    /api/pdf-chat/[documentId]  -> ডকুমেন্টের বর্তমান স্ট্যাটাস
// DELETE /api/pdf-chat/[documentId]  -> ডকুমেন্ট ও তার chunk/chat ডিলিট
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedDocument(documentId: string, userId: string) {
  return prisma.pdfDocument.findFirst({ where: { id: documentId, userId } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { documentId } = await params;
  const document = await getOwnedDocument(documentId, session.user.id);
  if (!document) {
    return NextResponse.json({ error: "ডকুমেন্ট পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { documentId } = await params;
  const document = await getOwnedDocument(documentId, session.user.id);
  if (!document) {
    return NextResponse.json({ error: "ডকুমেন্ট পাওয়া যায়নি" }, { status: 404 });
  }

  // Cascade delete (schema তে onDelete: Cascade আছে chunks+chatMessages এর জন্য)
  await prisma.pdfDocument.delete({ where: { id: documentId } });

  return NextResponse.json({ success: true });
}
