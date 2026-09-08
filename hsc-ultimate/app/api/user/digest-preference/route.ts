// ===================================================================
// সাপ্তাহিক ইমেইল ডাইজেস্ট প্রেফারেন্স (চালু/বন্ধ)
// GET   /api/user/digest-preference  -> বর্তমান স্ট্যাটাস
// PATCH /api/user/digest-preference  -> চালু/বন্ধ করা
// Body (PATCH): { enabled: boolean }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition — Profile Update এর একই "নিজের রো
// concurrent delete-account এর সাথে race" ক্লাস, প্রতিরোধমূলকভাবে
// ফিক্স করা হয়েছে): `update()` এর বদলে atomic `updateMany()` claim।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailDigestEnabled: true, lastDigestSentAt: true },
  });

  return NextResponse.json({
    enabled: user?.emailDigestEnabled ?? true,
    lastSentAt: user?.lastDigestSentAt ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { enabled } = body as { enabled?: boolean };

  if (typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled অবশ্যই true/false হতে হবে" },
      { status: 400 }
    );
  }

  const claimResult = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { emailDigestEnabled: enabled },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ enabled });
}
