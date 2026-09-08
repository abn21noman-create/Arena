// ===================================================================
// একটা Habit আর্কাইভ/আনআর্কাইভ ও ডিলিট করার API
// PATCH  /api/habits/[habitId]  -> { isArchived: boolean } বা { name, emoji }
// DELETE /api/habits/[habitId]  -> সম্পূর্ণ ডিলিট (cascade: সব HabitLog মুছবে)
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, Notification Read/Delete ও Admin User
// Ban এর একই "existence check থাকা সত্ত্বেও read-then-write" ক্লাস,
// প্রতিরোধমূলক ফিক্স): আগে existence+ownership check (`findUnique`)
// করার পরে আলাদা ধাপে `update()`/`delete()` কল করা হতো — concurrent
// `PATCH` ও `DELETE` একই habit এ পাঠালে P2025 crash হতে পারতো (একই
// প্যাটার্নের bug class Notification endpoint এ লাইভ টেস্টে সরাসরি
// প্রমাণিত হয়েছে)। ফিক্স: `update()`/`delete()` এর বদলে atomic
// `updateMany()`/`deleteMany({ where: { id, userId } })` claim —
// existence ও ownership চেক একসাথে একই where ক্লজে atomic ভাবে হয়,
// matched count 0 হলে ৪০৪ (আগে ownership mismatch এ ৪০৩ দেখানো হতো,
// এখন existence/ownership দুটোই একসাথে ৪০৪ — নিরাপত্তার দিক থেকে
// এটা ভালো, কারণ "habit আছে কিন্তু তোমার না" এই তথ্য leak করে না)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";
import { MAX_HABIT_NAME_LENGTH } from "@/lib/habit-tracker";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { habitId } = await params;
  const body = await req.json().catch(() => ({}));
  const { isArchived, name, emoji } = body as {
    isArchived?: boolean;
    name?: string;
    emoji?: string;
  };

  // 🐛 বাগ ফিক্স (Boolean Field Validation ক্লাস, লাইভ টেস্টে প্রমাণিত):
  // আগে `isArchived` এর কোনো টাইপ চেক ছাড়াই সরাসরি Prisma তে পাস করা
  // হতো। `isArchived: "false"`/`isArchived: 0`/`isArchived: []`
  // পাঠালে Prisma `PrismaClientValidationError` throw করে ৫০০ crash
  // করত (established `isValidEnumValue()` এর একই "input validation
  // consistency" দর্শন, এখানে boolean ইনপুটের জন্য)।
  if (!isValidOptionalBoolean(isArchived)) {
    return NextResponse.json({ error: "isArchived true/false হতে হবে" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স (Missing Text Length Validation bug hunt সিরিজের
  // ধারাবাহিকতা, broad-grep এ আবিষ্কৃত, লাইভ টেস্টে প্রমাণিত): আগে
  // এই PATCH এ (habit rename করার সময়) কোনো max-length limit ছিল না,
  // যদিও established POST /api/habits এ ১০০ অক্ষরের limit ছিল —
  // "একই লজিক্যাল ইনভ্যারিয়েন্ট, create ও update endpoint এ ভিন্নভাবে
  // (একটাতে limit, অন্যটাতে না) implement হওয়া" এই bug class এর
  // আরেকটা উদাহরণ। ৫০০০ অক্ষরের নাম দিয়ে PATCH করে সরাসরি সেভ হয়ে
  // যাওয়া লাইভ টেস্টে প্রমাণিত হয়েছে।
  if (name !== undefined && name.trim().length > MAX_HABIT_NAME_LENGTH) {
    return NextResponse.json(
      { error: `নাম খুব বড় (সর্বোচ্চ ${MAX_HABIT_NAME_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }

  const claimResult = await prisma.habit.updateMany({
    where: { id: habitId, userId: session.user.id },
    data: {
      ...(isArchived !== undefined && { isArchived }),
      ...(name !== undefined && name.trim() && { name: name.trim() }),
      ...(emoji !== undefined && emoji.trim() && { emoji: emoji.trim() }),
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "Habit পাওয়া যায়নি" }, { status: 404 });
  }

  // findUniqueOrThrow না ব্যবহার করে findUnique (non-throwing) — আরও
  // এক স্তর ডিফেন্সিভ, অত্যন্ত ছোট window এ যদি updateMany() এর পরেও
  // তাত্ক্ষণিক delete হয়ে যায় তাহলে crash না করে graceful ৪০৪
  const updated = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!updated) {
    return NextResponse.json(
      { error: "আপডেট সফল হয়েছে কিন্তু তথ্য রিফ্রেশ করার সময় সমস্যা হয়েছে" },
      { status: 404 }
    );
  }

  return NextResponse.json({ habit: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { habitId } = await params;

  const claimResult = await prisma.habit.deleteMany({
    where: { id: habitId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "Habit পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
