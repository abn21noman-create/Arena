// ===================================================================
// Class Routine Slot Update/Delete API
// PATCH  /api/routine/[slotId] — আপডেট
// DELETE /api/routine/[slotId] — মুছে ফেলা
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, Notification/Habit এর একই "existence
// check থাকা সত্ত্বেও read-then-write" ক্লাস, লাইভ টেস্টে প্রমাণিত):
// আগে existence+ownership check (`findUnique`) করার পরে (এবং সেই
// রো থেকে `startTime`/`endTime` read করে validation এর জন্য ব্যবহার
// করে) আলাদা ধাপে `update()` কল করা হতো। concurrent `PATCH` ও
// `DELETE` একই স্লটে পাঠালে check ও update এর মাঝের window এ delete
// সম্পন্ন হয়ে গেলে PATCH এর `update()` P2025 throw করে ৫০০ crash
// করতো (১৫ iteration এ ৩টা crash লাইভে প্রমাণিত)।
//
// ফিক্স: শুধু `updateMany()` করলেই যথেষ্ট না — কারণ PATCH এ
// `startTime`/`endTime` order validation এর জন্য বিদ্যমান রো এর
// ভ্যালু পড়া দরকার, আর সেই read ও পরের write এর মাঝে যদি slot
// ডিলিট হয়ে যায় তাহলে validation ভুল ডেটার উপর হতে পারে। তাই CSV
// Bulk Question Upload এর established সমাধান ৩খ (heterogeneous
// row data হওয়ায়) অনুসরণ করে `$transaction` এর ভেতরে
// `SELECT ... FOR UPDATE` দিয়ে স্লট row লক করে read+validate+write
// পুরো সিকোয়েন্স atomic করা হয়েছে — concurrent delete লক ছাড়ার
// আগ পর্যন্ত block হয়ে থাকবে, আর যদি ইতিমধ্যে ডিলিট হয়ে থাকে তাহলে
// lock query ০টা রো পাবে এবং পরিষ্কারভাবে ৪০৪ রিটার্ন হবে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { RoutineSlot } from "@prisma/client";
import { isValidEnumValue, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { slotId } = await params;
  const body = await req.json().catch(() => ({}));
  const { dayOfWeek, startTime, endTime, subjectCode, label, colorHex } = body;

  if (label !== undefined && !label.trim()) {
    return NextResponse.json({ error: "লেবেল খালি রাখা যাবে না" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // POST /api/routine এর একই max-length প্যাটার্ন): PATCH এও label
  // এর জন্য একই limit প্রয়োগ করা হয়েছে।
  if (label !== undefined && label.trim().length > 100) {
    return NextResponse.json(
      { error: "লেবেল খুব বড় (সর্বোচ্চ ১০০ অক্ষর)" },
      { status: 400 }
    );
  }
  if (
    dayOfWeek !== undefined &&
    (typeof dayOfWeek !== "number" || dayOfWeek < 0 || dayOfWeek > 6)
  ) {
    return NextResponse.json({ error: "সঠিক বার (০-৬) দিন" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/enum-validation.ts এ বিস্তারিত): অজানা subjectCode দিলে
  // Prisma update() এ `PrismaClientValidationError` throw করে ৫০০
  // crash করতো (transaction এর ভেতরে হলেও, catch ব্লকে ধরা পড়তো না
  // কারণ সেটা শুধু SLOT_NOT_FOUND/INVALID_TIME_RANGE Error message
  // চেক করে, generic re-throw করে ৫০০ দিয়ে দিতো)।
  if (!isValidEnumValue(subjectCode, VALID_SUBJECT_CODES)) {
    return NextResponse.json({ error: "সঠিক subjectCode দিন" }, { status: 400 });
  }

  let updated: RoutineSlot;
  try {
    updated = await prisma.$transaction(async (tx) => {
      // ownership+existence যাচাই ও row lock — একই query তে
      const lockedSlot = await tx.$queryRaw<RoutineSlot[]>`
        SELECT * FROM "routine_slots" WHERE id = ${slotId} AND "userId" = ${session.user.id} FOR UPDATE
      `;
      if (lockedSlot.length === 0) {
        throw new Error("SLOT_NOT_FOUND");
      }
      const slot = lockedSlot[0];

      const effectiveStartTime = startTime !== undefined ? startTime : slot.startTime;
      const effectiveEndTime = endTime !== undefined ? endTime : slot.endTime;
      if ((startTime !== undefined || endTime !== undefined) && effectiveStartTime >= effectiveEndTime) {
        throw new Error("INVALID_TIME_RANGE");
      }

      return tx.routineSlot.update({
        where: { id: slotId },
        data: {
          dayOfWeek: dayOfWeek ?? undefined,
          startTime: startTime ?? undefined,
          endTime: endTime ?? undefined,
          subjectCode: subjectCode !== undefined ? subjectCode : undefined,
          label: label !== undefined ? label.trim() : undefined,
          colorHex: colorHex ?? undefined,
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_NOT_FOUND") {
      return NextResponse.json({ error: "স্লট পাওয়া যায়নি" }, { status: 404 });
    }
    if (err instanceof Error && err.message === "INVALID_TIME_RANGE") {
      return NextResponse.json(
        { error: "শেষ সময় শুরুর সময়ের পরে হতে হবে" },
        { status: 400 }
      );
    }
    throw err;
  }

  return NextResponse.json({ slot: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { slotId } = await params;

  const claimResult = await prisma.routineSlot.deleteMany({
    where: { id: slotId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "স্লট পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
