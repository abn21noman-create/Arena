// ===================================================================
// একটা Bookmark Folder rename/recolor ও ডিলিট করার API
// PATCH  /api/bookmark-folders/[folderId]  -> { name?, colorHex? }
// DELETE /api/bookmark-folders/[folderId]  -> ফোল্ডার ডিলিট (ভেতরের
//         bookmark গুলো মুছে যায় না, folderId null হয়ে যায় — DB-level
//         ON DELETE SET NULL constraint, established SetNull প্যাটার্ন)
// -------------------------------------------------------------------
// established race-condition-safe প্যাটার্ন (Habit এর মতো): existence+
// ownership check আলাদা করে না করে সরাসরি atomic updateMany/deleteMany
// ব্যবহার করা হচ্ছে যাতে concurrent PATCH/DELETE এ কোনো crash না হয়।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_FOLDER_NAME_LENGTH } from "@/lib/bookmark-folders";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { folderId } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, colorHex } = body as { name?: string; colorHex?: string };

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "ফোল্ডারের নাম দিন" }, { status: 400 });
  }
  if (name !== undefined && name.trim().length > MAX_FOLDER_NAME_LENGTH) {
    return NextResponse.json(
      { error: `নাম খুব বড় (সর্বোচ্চ ${MAX_FOLDER_NAME_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }

  const claimResult = await prisma.bookmarkFolder.updateMany({
    where: { id: folderId, userId: session.user.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(colorHex !== undefined && colorHex.trim() && { colorHex: colorHex.trim() }),
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "ফোল্ডার পাওয়া যায়নি" }, { status: 404 });
  }

  const updated = await prisma.bookmarkFolder.findUnique({ where: { id: folderId } });
  if (!updated) {
    return NextResponse.json(
      { error: "আপডেট সফল হয়েছে কিন্তু তথ্য রিফ্রেশ করার সময় সমস্যা হয়েছে" },
      { status: 404 }
    );
  }

  return NextResponse.json({ folder: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { folderId } = await params;

  const claimResult = await prisma.bookmarkFolder.deleteMany({
    where: { id: folderId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "ফোল্ডার পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
