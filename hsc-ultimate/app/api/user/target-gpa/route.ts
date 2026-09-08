// ===================================================================
// Personal GPA Target সেট/আপডেট/মুছে ফেলার API (Goal Setting ফিচার)
// POST   /api/user/target-gpa   — টার্গেট সেট/আপডেট করা
// Body: { targetGpa: number | null }  (null দিলে টার্গেট মুছে ফেলা হয়)
// -------------------------------------------------------------------
// MASTER_PLAN.md এর মূল ভিশনের "Goal Setting (weekly/monthly targets,
// GPA target)" আইটেম — Study Group এ ইতিমধ্যে collective weekly XP
// target আছে, এই endpoint দিয়ে individual/personal GPA target যোগ
// করা হচ্ছে।
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition — Profile Update এর একই "নিজের রো
// concurrent delete-account এর সাথে race" ক্লাস, প্রতিরোধমূলকভাবে
// ফিক্স করা হয়েছে): `update()` এর বদলে atomic `updateMany()` claim।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_GPA = 0;
const MAX_GPA = 5;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { targetGpa } = body as { targetGpa?: number | null };

  // null দিয়ে টার্গেট মুছে ফেলা যাবে (ইউজার চাইলে সেট না রাখতে পারবে)
  if (targetGpa !== null && targetGpa !== undefined) {
    if (typeof targetGpa !== "number" || Number.isNaN(targetGpa)) {
      return NextResponse.json({ error: "সঠিক GPA দিন" }, { status: 400 });
    }
    if (targetGpa < MIN_GPA || targetGpa > MAX_GPA) {
      return NextResponse.json(
        { error: `টার্গেট GPA ${MIN_GPA} থেকে ${MAX_GPA} এর মধ্যে হতে হবে` },
        { status: 400 }
      );
    }
  }

  const claimResult = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { targetGpa: targetGpa ?? null },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ targetGpa: targetGpa ?? null });
}
