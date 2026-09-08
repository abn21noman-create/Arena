// ===================================================================
// AI Tutor Mode টগল করার API — DIRECT (সরাসরি উত্তর) বনাম SOCRATIC
// (Khanmigo-স্টাইল গাইডেড প্রশ্ন) মোডের মধ্যে সুইচ করা
// PATCH /api/user/ai-tutor-mode
// Body: { mode: "DIRECT" | "SOCRATIC" }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition — Profile Update এর একই "নিজের রো
// concurrent delete-account এর সাথে race" ক্লাস, প্রতিরোধমূলকভাবে
// ফিক্স করা হয়েছে): `update()` এর বদলে atomic `updateMany()` claim।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_MODES = ["DIRECT", "SOCRATIC"];

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { mode } = body as { mode: string };

  if (!VALID_MODES.includes(mode)) {
    return NextResponse.json({ error: "সঠিক মোড দিন (DIRECT/SOCRATIC)" }, { status: 400 });
  }

  const claimResult = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { aiTutorMode: mode as "DIRECT" | "SOCRATIC" },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
      { status: 404 }
    );
  }

  return NextResponse.json({ aiTutorMode: mode });
}
