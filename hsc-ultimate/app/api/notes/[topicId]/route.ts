// ===================================================================
// Note Get/Save/Delete API (প্রতিটা টপিকে ইউজারের নিজস্ব একটা নোট)
// GET    /api/notes/[topicId] — নোট লোড করা (না থাকলে null)
// PUT    /api/notes/[topicId] — নোট তৈরি/আপডেট (upsert)
// DELETE /api/notes/[topicId] — নোট মুছে ফেলা
// Body (PUT): { content }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const note = await prisma.note.findUnique({
    where: { userId_topicId: { userId: session.user.id, topicId } },
  });

  return NextResponse.json({ note });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const { content, isPublic } = await req.json().catch(() => ({}));

  if (typeof content !== "string") {
    return NextResponse.json({ error: "নোটের কন্টেন্ট সঠিক না" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (Boolean Field Validation ক্লাস — সাইলেন্ট ডেটা
  // করাপশন, established Forum Resolve/Admin Pin endpoint এর একই `!!`
  // coercion bug, broad grep audit এ পাওয়া গেছে): `!!isPublic` দিয়ে
  // coerce করলে `{ isPublic: "false" }` (string) পাঠালে সাইলেন্টলি
  // `true` সেভ হয়ে যেত (নোট অনিচ্ছাকৃতভাবে পাবলিক হয়ে যেতে পারত —
  // privacy-sensitive bug)। ফিক্স: strict boolean-type চেক।
  if (!isValidOptionalBoolean(isPublic)) {
    return NextResponse.json({ error: "isPublic true/false হতে হবে" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  // Peer Note Sharing — isPublic ঐচ্ছিক (না দিলে অপরিবর্তিত থাকে,
  // backward compatible)
  const note = await prisma.note.upsert({
    where: { userId_topicId: { userId: session.user.id, topicId } },
    create: { userId: session.user.id, topicId, content, isPublic: isPublic ?? false },
    update: { content, ...(isPublic !== undefined && { isPublic }) },
  });

  return NextResponse.json({ note });
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
  await prisma.note.deleteMany({
    where: { userId: session.user.id, topicId },
  });

  return NextResponse.json({ success: true });
}
