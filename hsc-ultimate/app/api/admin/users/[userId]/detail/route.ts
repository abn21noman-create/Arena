// ===================================================================
// Admin: একজন নির্দিষ্ট ইউজারের বিস্তারিত প্রোফাইল + কার্যক্রম পরিসংখ্যান
// GET /api/admin/users/[userId]/detail
// ===================================================================
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getUserDetailStats } from "@/lib/admin-user-management";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      hscBatch: true,
      board: true,
      createdAt: true,
      lastActiveAt: true,
      streakCount: true,
      longestStreak: true,
      leagueTier: true,
      weeklyXp: true,
      isBanned: true,
      banReason: true,
      bannedAt: true,
      bannedBy: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  const stats = await getUserDetailStats(userId);

  return NextResponse.json({ user, stats });
}
