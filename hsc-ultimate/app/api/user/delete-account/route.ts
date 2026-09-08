// ===================================================================
// Account Deletion API — নিজের অ্যাকাউন্ট সম্পূর্ণভাবে মুছে ফেলা
// POST /api/user/delete-account
// Body: { password, confirmationText }
// -------------------------------------------------------------------
// নিরাপত্তা: এটা irreversible/destructive action, তাই দুটো স্তরের
// নিশ্চিতকরণ লাগে — (১) বর্তমান পাসওয়ার্ড ভেরিফাই (bcrypt.compare,
// change-password endpoint এর একই প্যাটার্ন), (২) "ডিলিট করো" এই
// নির্দিষ্ট বাংলা টেক্সট টাইপ করে নিশ্চিত করা (accidental click থেকে
// রক্ষা, GitHub/GitLab এর repo-delete পপুলার প্যাটার্ন অনুসরণ করা)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUserAccount } from "@/lib/account-privacy";

const CONFIRMATION_TEXT = "ডিলিট করো";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { password, confirmationText } = body as { password?: string; confirmationText?: string };

  if (!password) {
    return NextResponse.json({ error: "পাসওয়ার্ড দিতে হবে" }, { status: 400 });
  }

  if (confirmationText !== CONFIRMATION_TEXT) {
    return NextResponse.json(
      { error: `নিশ্চিত করতে "${CONFIRMATION_TEXT}" ঠিক এভাবে টাইপ করো` },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "পাসওয়ার্ড ভুল" }, { status: 400 });
  }

  try {
    const result = await deleteUserAccount(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "ACCOUNT_ALREADY_DELETED") {
      // অন্য কোনো concurrent request (যেমন admin থেকে) ততক্ষণে এই
      // অ্যাকাউন্টটা ডিলিট করে ফেলেছে
      return NextResponse.json(
        { error: "তোমার অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে" },
        { status: 404 }
      );
    }
    console.error("Account Deletion Error:", err);
    return NextResponse.json({ error: "অ্যাকাউন্ট ডিলিট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
