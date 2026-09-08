// ===================================================================
// Password পরিবর্তন API (লগইন অবস্থায়, current password ভেরিফাই করে)
// POST /api/user/change-password
// Body: { currentPassword, newPassword }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition — Profile Update এর একই "নিজের রো
// concurrent delete-account এর সাথে race" ক্লাস, প্রতিরোধমূলকভাবে
// ফিক্স করা হয়েছে, কিন্তু এখানে read (passwordHash verify) ও write
// এর মাঝে bcrypt.hash() (তুলনামূলক ধীর, ~১০০ms) থাকায় Class Routine
// Slot এর মতো `updateMany()` claim যথেষ্ট — কোনো read-existing-value
// validation নেই যেটার জন্য transaction+FOR UPDATE লাগবে, শুধু
// existence guard দরকার): `update()` এর বদলে atomic `updateMany({
// where: { id } })` claim — matched count 0 হলে ইউজার ইতিমধ্যে
// ডিলিট হয়ে গেছে ধরে ৪০৪ রিটার্ন করা হয়।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json().catch(() => ({}));

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "বর্তমান ও নতুন পাসওয়ার্ড দিন" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "ইউজার খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "বর্তমান পাসওয়ার্ড ভুল" },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const claimResult = await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        authVersion: { increment: 1 },
      },
    });

    if (claimResult.count === 0) {
      return NextResponse.json(
        { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে",
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    return NextResponse.json(
      { error: "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
