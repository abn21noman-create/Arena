// ===================================================================
// Bookmark List + Create API
// GET  /api/bookmarks           — ইউজারের সব সেভ করা টপিক লিস্ট
// POST /api/bookmarks           — নতুন টপিক সেভ করা
// Body (POST): { topicId }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      topic: {
        include: {
          chapter: { include: { subject: true } },
        },
      },
      // Bookmark Collections/Folders ফিচার — কোন ফোল্ডারে আছে তা
      // সরাসরি রেসপন্সে দেওয়া হচ্ছে যাতে Saved Topics পেজ আলাদা কল
      // ছাড়াই গ্রুপ করে দেখাতে পারে
      folder: { select: { id: true, name: true, colorHex: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookmarks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await req.json().catch(() => ({}));
  if (!topicId) {
    return NextResponse.json({ error: "টপিক আইডি দিন" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  // ইতিমধ্যে সেভ করা থাকলে duplicate error না দিয়ে existing রেকর্ডই রিটার্ন করি
  const bookmark = await prisma.bookmark.upsert({
    where: {
      userId_topicId: { userId: session.user.id, topicId },
    },
    create: { userId: session.user.id, topicId },
    update: {},
  });

  return NextResponse.json({ bookmark }, { status: 201 });
}
