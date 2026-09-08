// ===================================================================
// আজকের জন্য Habit টগল করা (log করা/আনডু করা)
// POST /api/habits/[habitId]/toggle
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleHabitToday } from "@/lib/habit-tracker";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { habitId } = await params;
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });

  if (!habit) {
    return NextResponse.json({ error: "Habit পাওয়া যায়নি" }, { status: 404 });
  }
  if (habit.userId !== session.user.id) {
    return NextResponse.json({ error: "এই Habit তোমার না" }, { status: 403 });
  }

  const result = await toggleHabitToday(habitId, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "টগল করা যায়নি" }, { status: 500 });
  }

  return NextResponse.json(result);
}
