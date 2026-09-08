// ===================================================================
// Bookmark Delete + Status Check + Move-to-Folder API
// GET    /api/bookmarks/[topicId] — এই টপিক সেভ করা আছে কিনা চেক
// PATCH  /api/bookmarks/[topicId] — { folderId } — bookmark কে একটা
//         ফোল্ডারে সরানো (null দিলে ফোল্ডার থেকে বের করে "সব" এ আনা)
// DELETE /api/bookmarks/[topicId] — সেভ করা টপিক সরিয়ে ফেলা
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_topicId: { userId: session.user.id, topicId } },
  });

  return NextResponse.json({ bookmarked: !!bookmark });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const body = await req.json().catch(() => ({}));
  const { folderId } = body as { folderId?: string | null };

  // folderId দেওয়া হলে সেটা এই ইউজারেরই ফোল্ডার কিনা যাচাই — নাহলে
  // অন্য ইউজারের ফোল্ডার আইডি দিয়ে নিজের bookmark সেই ফোল্ডারের
  // (যেটা দেখতে পাবে না) সাথে ভুলভাবে associate হয়ে যেতে পারে (IDOR
  // প্রতিরোধ, established ownership-check প্যাটার্ন)।
  if (folderId) {
    const folder = await prisma.bookmarkFolder.findFirst({
      where: { id: folderId, userId: session.user.id },
    });
    if (!folder) {
      return NextResponse.json({ error: "ফোল্ডার পাওয়া যায়নি" }, { status: 404 });
    }
  }

  const claimResult = await prisma.bookmark.updateMany({
    where: { userId: session.user.id, topicId },
    data: { folderId: folderId ?? null },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "বুকমার্ক পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;

  // findUnique + delete না করে deleteMany ব্যবহার করছি যাতে বুকমার্ক না থাকলেও error না হয়
  await prisma.bookmark.deleteMany({
    where: { userId: session.user.id, topicId },
  });

  return NextResponse.json({ success: true });
}

