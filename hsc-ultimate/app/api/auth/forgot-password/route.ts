// ===================================================================
// Forgot Password — রিসেট টোকেন তৈরি করে ইমেইলে পাঠানো
// POST /api/auth/forgot-password
// Body: { email }
// -------------------------------------------------------------------
// নিরাপত্তার জন্য: ইমেইল খুঁজে না পেলেও একই সাফল্য বার্তা দেখানো হয়
// (user enumeration attack প্রতিরোধ — কারো ইমেইল আছে কিনা বাইরে থেকে
// বোঝা যাবে না)
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "passwordReset",
    makeRateLimitKey(req, "auth:forgot-password")
  );
  if (limited) return limited;

  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "ইমেইল দিন" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // ইউজার না থাকলেও একই বার্তা দেখাবো (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "যদি এই ইমেইলে অ্যাকাউন্ট থাকে, রিসেট লিংক পাঠানো হয়েছে",
      });
    }

    // পুরনো unused token গুলো invalidate করে দিচ্ছি (একই সময়ে একাধিক valid token না থাকুক)
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // ১ ঘণ্টা

    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const result = await sendPasswordResetEmail(normalizedEmail, resetUrl);

    if (!result.success) {
      console.error("Reset email failed:", result.error);
      // ইউজারকে জানাতে হবে না যে ইমেইল পাঠাতে সমস্যা হয়েছে, কিন্তু server log এ রাখলাম
    }

    return NextResponse.json({
      success: true,
      message: "যদি এই ইমেইলে অ্যাকাউন্ট থাকে, রিসেট লিংক পাঠানো হয়েছে",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return NextResponse.json(
      { error: "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 500 }
    );
  }
}
