// ===================================================================
// Reset Password — টোকেন ভেরিফাই করে নতুন পাসওয়ার্ড সেট করা
// POST /api/auth/reset-password
// Body: { token, newPassword }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "passwordReset",
    makeRateLimitKey(req, "auth:reset-password")
  );
  if (limited) return limited;

  try {
    const { token, newPassword } = await req.json().catch(() => ({}));

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "টোকেন ও নতুন পাসওয়ার্ড দিন" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "এই লিংকটি সঠিক না" },
        { status: 400 }
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "এই লিংকটি ইতিমধ্যে ব্যবহৃত হয়ে গেছে" },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "এই লিংকের মেয়াদ শেষ হয়ে গেছে, আবার রিকোয়েস্ট করো" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "এই ইমেইলের কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          authVersion: { increment: 1 },
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন লগইন করো",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return NextResponse.json(
      { error: "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 500 }
    );
  }
}
