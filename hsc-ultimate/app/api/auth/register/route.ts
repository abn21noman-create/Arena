// ===================================================================
// User Registration API
// POST /api/auth/register
// Body: { name, email, password, policyAccepted, ageAssuranceConfirmed,
//         privacyVersion, termsVersion, ageAssuranceVersion }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { MAX_USER_NAME_LENGTH } from "@/lib/enum-validation";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";
import {
  CURRENT_AGE_ASSURANCE_VERSION,
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "@/lib/privacy-compliance";

// 🐛 বাগ ফিক্স (Missing Text Length Validation bug hunt সিরিজের
// ধারাবাহিকতা, established Profile Update PATCH এ পাওয়া bug এর একই
// ক্লাস — defense-in-depth হিসেবে registration এও যোগ করা হলো, যেহেতু
// এটাই `User.name` তৈরি হওয়ার প্রথম জায়গা): `.max()` না থাকায় খুব বড়
// নাম দিয়ে রেজিস্ট্রেশন করা সম্ভব ছিল, যা পরে NextAuth JWT session
// cookie কে অতিরিক্ত বড় করে HTTP ৪৩১ self-lockout এর ঝুঁকি তৈরি করত।
const registerSchema = z.object({
  name: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে").max(
    MAX_USER_NAME_LENGTH,
    `নাম সর্বোচ্চ ${MAX_USER_NAME_LENGTH} অক্ষরের হতে পারবে`
  ),
  email: z.string().trim().toLowerCase().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
  policyAccepted: z.literal(true, { error: "Privacy Policy ও Terms মেনে নিতে হবে" }),
  ageAssuranceConfirmed: z.literal(true, {
    error: "বয়স ও guardian assurance নিশ্চিত করতে হবে",
  }),
  privacyVersion: z.literal(CURRENT_PRIVACY_VERSION),
  termsVersion: z.literal(CURRENT_TERMS_VERSION),
  ageAssuranceVersion: z.literal(CURRENT_AGE_ASSURANCE_VERSION),
});


export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "register",
    makeRateLimitKey(req, "auth:register")
  );
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: { id: true, name: true, email: true },
      });
      await tx.policyAcceptance.create({
        data: {
          userId: created.id,
          privacyVersion: CURRENT_PRIVACY_VERSION,
          termsVersion: CURRENT_TERMS_VERSION,
          ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
          source: "REGISTRATION",
        },
      });
      return created;
    });

    return NextResponse.json(
      {
        user,
        policyAcceptance: {
          privacyVersion: CURRENT_PRIVACY_VERSION,
          termsVersion: CURRENT_TERMS_VERSION,
          ageAssuranceVersion: CURRENT_AGE_ASSURANCE_VERSION,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register Error:", err);
    return NextResponse.json(
      { error: "রেজিস্ট্রেশন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন" },
      { status: 500 }
    );
  }
}
