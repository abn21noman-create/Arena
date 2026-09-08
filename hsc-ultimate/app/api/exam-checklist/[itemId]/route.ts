// ===================================================================
// একটা Exam Checklist Item টগল/এডিট ও ডিলিট করার API
// PATCH  /api/exam-checklist/[itemId]  -> { isChecked?: boolean, label?: string }
// DELETE /api/exam-checklist/[itemId]  -> সম্পূর্ণ ডিলিট
// -------------------------------------------------------------------
// established Habit এর একই atomic updateMany/deleteMany প্যাটার্ন
// (existence+ownership একসাথে চেক, race-condition-safe)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_CHECKLIST_LABEL_LENGTH } from "@/lib/exam-checklist";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { itemId } = await params;
  const body = await req.json().catch(() => ({}));
  const { isChecked, label } = body as { isChecked?: unknown; label?: string };

  // 🐛 বাগ ফিক্স (Boolean Field Validation bug hunt): আগে এখানে শুধু
  // `typeof isChecked === "boolean"` চেক করে data spread করা হতো —
  // non-boolean দিলে সাইলেন্টলি no-op হয়ে যেত (কোনো error ছাড়াই
  // isChecked আপডেট হতো না, ইউজার বুঝতেই পারত না)। established
  // isValidOptionalBoolean() দিয়ে এখন explicit 400 Bad Request।
  if (!isValidOptionalBoolean(isChecked)) {
    return NextResponse.json(
      { error: "isChecked অবশ্যই true/false (boolean) হতে হবে" },
      { status: 400 }
    );
  }

  if (label !== undefined && !label.trim()) {
    return NextResponse.json({ error: "আইটেমের নাম দিন" }, { status: 400 });
  }
  if (label !== undefined && label.trim().length > MAX_CHECKLIST_LABEL_LENGTH) {
    return NextResponse.json(
      { error: `নাম খুব বড় (সর্বোচ্চ ${MAX_CHECKLIST_LABEL_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }

  const claimResult = await prisma.examChecklistItem.updateMany({
    where: { id: itemId, userId: session.user.id },
    data: {
      ...(typeof isChecked === "boolean" && { isChecked }),
      ...(label !== undefined && { label: label.trim() }),
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "আইটেম পাওয়া যায়নি" }, { status: 404 });
  }

  const updated = await prisma.examChecklistItem.findUnique({ where: { id: itemId } });
  if (!updated) {
    return NextResponse.json(
      { error: "আপডেট সফল হয়েছে কিন্তু তথ্য রিফ্রেশ করার সময় সমস্যা হয়েছে" },
      { status: 404 }
    );
  }

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { itemId } = await params;

  const claimResult = await prisma.examChecklistItem.deleteMany({
    where: { id: itemId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "আইটেম পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
