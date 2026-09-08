// ===================================================================
// Bookmark Folder List + Create API
// GET  /api/bookmark-folders  — ইউজারের সব ফোল্ডার + প্রতিটাতে কতগুলো bookmark আছে
// POST /api/bookmark-folders  — নতুন ফোল্ডার তৈরি (সর্বোচ্চ MAX_BOOKMARK_FOLDERS_PER_USER টা)
// Body (POST): { name, colorHex? }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_BOOKMARK_FOLDERS_PER_USER, MAX_FOLDER_NAME_LENGTH } from "@/lib/bookmark-folders";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const folders = await prisma.bookmarkFolder.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { bookmarks: true } } },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, colorHex } = body as { name?: string; colorHex?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "ফোল্ডারের নাম দিন" }, { status: 400 });
  }
  if (name.trim().length > MAX_FOLDER_NAME_LENGTH) {
    return NextResponse.json(
      { error: `নাম খুব বড় (সর্বোচ্চ ${MAX_FOLDER_NAME_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }

  // established Habit Tracker প্যাটার্ন — `SELECT ... FOR UPDATE` দিয়ে
  // User row lock করে capacity check+insert একটা atomic transaction এ
  // একত্র করা হচ্ছে, যাতে concurrent POST দিয়ে MAX_BOOKMARK_FOLDERS_PER_USER
  // সীমা bypass করা না যায় (read-then-write race condition প্রতিরোধ)।
  try {
    const folder = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${session.user.id} FOR UPDATE`;

      const existingCount = await tx.bookmarkFolder.count({
        where: { userId: session.user.id },
      });
      if (existingCount >= MAX_BOOKMARK_FOLDERS_PER_USER) {
        throw new Error(`সর্বোচ্চ ${MAX_BOOKMARK_FOLDERS_PER_USER}টা ফোল্ডার তৈরি করা যায়`);
      }

      return tx.bookmarkFolder.create({
        data: {
          userId: session.user.id,
          name: name.trim(),
          colorHex: colorHex?.trim() || "#6d28d9",
          order: existingCount,
        },
      });
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ফোল্ডার তৈরি করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
