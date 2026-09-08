// ===================================================================
// Habit List + Create API
// GET  /api/habits  -> ইউজারের সব (আর্কাইভ না করা) habit + ৭ দিনের history
// POST /api/habits  -> নতুন habit তৈরি (সর্বোচ্চ MAX_HABITS_PER_USER টা)
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserHabits, MAX_HABITS_PER_USER, MAX_HABIT_NAME_LENGTH } from "@/lib/habit-tracker";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const habits = await getUserHabits(session.user.id);
  return NextResponse.json({ habits });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, emoji } = body as { name?: string; emoji?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Habit এর নাম দিন" }, { status: 400 });
  }
  if (name.trim().length > MAX_HABIT_NAME_LENGTH) {
    return NextResponse.json(
      { error: `নাম খুব বড় (সর্বোচ্চ ${MAX_HABIT_NAME_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Study Group/Quiz
  // Battle এর একই capacity-bypass race condition ক্লাস): আগে
  // `existingCount >= MAX_HABITS_PER_USER` চেক করে তারপর আলাদা `create()`
  // কল করা হতো (read-then-write) — লাইভ concurrency টেস্টে ৯টা বিদ্যমান
  // habit থাকা অবস্থায় ৫টা concurrent POST request পাঠিয়ে ৫টাই সফল
  // হয়েছে (প্রত্যাশিত ১টা, বাকি ৪টার "সর্বোচ্চ সীমা" এরর পাওয়ার কথা
  // ছিল) — চূড়ান্ত habit count হয়েছিল ১৪টা (MAX_HABITS_PER_USER=10
  // সম্পূর্ণ bypass)। ফিক্স: Study Group এর established প্যাটার্ন
  // অনুসরণ করে `SELECT ... FOR UPDATE` দিয়ে User row কে transaction এর
  // ভেতরে lock করা হয় (per-user resource limit, তাই User row lock করাই
  // সঠিক — একই ইউজারের concurrent request গুলো serialize হয়ে যায়,
  // capacity check+insert atomic হয়)।
  try {
    const habit = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${session.user.id} FOR UPDATE`;

      const existingCount = await tx.habit.count({
        where: { userId: session.user.id, isArchived: false },
      });
      if (existingCount >= MAX_HABITS_PER_USER) {
        throw new Error(`সর্বোচ্চ ${MAX_HABITS_PER_USER}টা habit যোগ করা যায়`);
      }

      return tx.habit.create({
        data: {
          userId: session.user.id,
          name: name.trim(),
          emoji: emoji?.trim() || "✅",
          order: existingCount,
        },
      });
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Habit তৈরি করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
