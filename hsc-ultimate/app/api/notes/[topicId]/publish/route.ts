// ===================================================================
// Peer Note Sharing — নিজের নোট পাবলিশ/আনপাবলিশ টগল
// POST /api/notes/[topicId]/publish
// Body: { isPublic: boolean }
// -------------------------------------------------------------------
// আলাদা রুট রাখা হয়েছে যাতে সাধারণ নোট সেভ (PUT /api/notes/[topicId])
// এর সাথে না গুলিয়ে UI তে স্পষ্ট "শেয়ার করো/আনশেয়ার করো" বাটন বানানো যায়।
//
// 🐛 বাগ ফিক্স (Race Condition, Admin Content Management এর একই
// "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, broad grep
// audit এ আবিষ্কৃত): আগে existence check (`findUnique`, খালি-কন্টেন্ট
// validation এর জন্য read করা) এর পরে আলাদা raw `note.update()` কল
// করা হতো। concurrent `DELETE /api/notes/[topicId]` (established
// `deleteMany()`, safe) যদি এই নোট মুছে দেয় ঠিক এই দুই ধাপের মাঝে,
// `update()` P2025 throw করে ৫০০ crash করতে পারতো। ফিক্স: `update()`
// এর বদলে atomic `updateMany({ where: { userId, topicId } })` —
// matched count 0 হলে গ্রেসফুল ৪০৪ (নোট concurrent delete হয়ে গেছে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const { isPublic } = await req.json().catch(() => ({}));

  if (typeof isPublic !== "boolean") {
    return NextResponse.json({ error: "isPublic বুলিয়ান হতে হবে" }, { status: 400 });
  }

  const existing = await prisma.note.findUnique({
    where: { userId_topicId: { userId: session.user.id, topicId } },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "শেয়ার করার আগে নোট সেভ করতে হবে" },
      { status: 404 }
    );
  }

  if (!existing.content.trim()) {
    return NextResponse.json({ error: "খালি নোট শেয়ার করা যাবে না" }, { status: 400 });
  }

  const updateResult = await prisma.note.updateMany({
    where: { userId: session.user.id, topicId },
    data: { isPublic },
  });

  if (updateResult.count === 0) {
    return NextResponse.json(
      { error: "নোট পাওয়া যায়নি (হয়তো ততক্ষণে ডিলিট হয়ে গেছে)" },
      { status: 404 }
    );
  }

  const note = await prisma.note.findUnique({
    where: { userId_topicId: { userId: session.user.id, topicId } },
  });

  if (!note) {
    return NextResponse.json(
      { error: "নোট পাওয়া যায়নি (হয়তো ততক্ষণে ডিলিট হয়ে গেছে)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ note });
}
