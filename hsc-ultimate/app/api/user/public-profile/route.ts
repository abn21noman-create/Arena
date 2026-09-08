// ===================================================================
// Public Profile সেটিংস আপডেট API
// GET   /api/user/public-profile  -> বর্তমান স্ট্যাটাস (enabled/slug)
// PATCH /api/user/public-profile  -> চালু/বন্ধ করা + slug সেট/পরিবর্তন
// Body (PATCH): { enabled?: boolean, slug?: string }
// -------------------------------------------------------------------
// slug ছাড়া enabled=true করা যাবে না (প্রথমবার চালু করার সময় slug
// বাধ্যতামূলক দিতে হবে)। slug ইউনিক না হলে 409 রিটার্ন করে।
//
// 🐛 বাগ ফিক্স (User Settings vs Delete Account Race Condition অডিটে
// একটা মিসড instance হিসেবে আবিষ্কৃত — profile/exam-date/target-gpa/
// ai-tutor-mode/digest-preference/change-password/onboarding এই ৭টা
// endpoint আগেই ফিক্স হয়েছিল, কিন্তু এই public-profile PATCH একই
// প্যাটার্নের ভুক্তভোগী ছিল অথচ audit list এ ধরা পড়েনি): আগে কোনো
// existence check ছাড়াই সরাসরি `prisma.user.update({ where: { id } })`
// কল করা হতো। concurrent DELETE /api/user/delete-account (~1.5s নেয়,
// ৩০+ টেবিল cascade) মাঝামাঝি ইউজার রো মুছে ফেললে এই PATCH এর
// `update()` P2025 throw করে ৫০০ crash করতো। লাইভ টেস্টে ১.২s delay
// tune করে ২০/২০ (১০০%) crash rate প্রমাণিত হয়েছে।
//
// ফিক্স: `update()` এর বদলে atomic `updateMany({ where: { id } })`
// claim — matched count 0 হলে ৪০৪ (ইউজার আর নেই), কোনো crash সম্ভব
// না। রিটার্ন করার জন্য response value আগে থেকেই computed
// (finalEnabled/finalSlug) থেকে বানানো হচ্ছে (updateMany কোনো select
// রিটার্ন করে না), তাই আলাদা read-back লাগে না।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateSlugFormat } from "@/lib/public-profile";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { publicProfileEnabled: true, profileSlug: true },
  });

  return NextResponse.json({
    enabled: user?.publicProfileEnabled ?? false,
    slug: user?.profileSlug ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { enabled, slug } = body as { enabled?: unknown; slug?: string };

  // 🐛 বাগ ফিক্স (Boolean Field Validation ক্লাস, broad grep audit এ
  // পাওয়া গেছে): আগে `enabled` এর কোনো টাইপ চেক ছিল না, সরাসরি
  // Prisma `updateMany()` তে পাস করা হতো — non-boolean দিলে
  // `PrismaClientValidationError` ৫০০ crash করত।
  if (!isValidOptionalBoolean(enabled)) {
    return NextResponse.json({ error: "enabled true/false হতে হবে" }, { status: 400 });
  }

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { profileSlug: true },
  });

  // slug আপডেট করতে চাইলে ফরম্যাট+ইউনিকনেস যাচাই
  let finalSlug = current?.profileSlug ?? null;
  if (slug !== undefined) {
    const trimmedSlug = slug.trim().toLowerCase();
    const validation = validateSlugFormat(trimmedSlug);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (trimmedSlug !== current?.profileSlug) {
      const existing = await prisma.user.findUnique({
        where: { profileSlug: trimmedSlug },
        select: { id: true },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "এই নামটা ইতিমধ্যে অন্য কেউ ব্যবহার করছে" },
          { status: 409 }
        );
      }
    }
    finalSlug = trimmedSlug;
  }

  // enabled=true করতে গেলে slug অবশ্যই থাকতে হবে (এই রিকোয়েস্টে দেওয়া
  // হোক বা আগে থেকেই সেট করা থাকুক)
  if (enabled === true && !finalSlug) {
    return NextResponse.json(
      { error: "চালু করার আগে একটা প্রোফাইল নাম (slug) সেট করো" },
      { status: 400 }
    );
  }

  const claimResult = await prisma.user
    .updateMany({
      where: { id: session.user.id },
      data: {
        ...(enabled !== undefined && { publicProfileEnabled: enabled }),
        ...(slug !== undefined && { profileSlug: finalSlug }),
      },
    })
    .catch((err: unknown) => {
      // Race condition এ দুইজন একসাথে একই slug নিতে চাইলে DB unique
      // constraint এ ধরা পড়বে (উপরের explicit check race-safe না, তাই
      // এখানে defense-in-depth হিসেবে P2002 handle করা হচ্ছে)
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002"
      ) {
        return null;
      }
      throw err;
    });

  if (claimResult === null) {
    return NextResponse.json(
      { error: "এই নামটা ইতিমধ্যে অন্য কেউ ব্যবহার করছে" },
      { status: 409 }
    );
  }

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({
    enabled: enabled !== undefined ? enabled : undefined,
    slug: finalSlug,
  });
}
