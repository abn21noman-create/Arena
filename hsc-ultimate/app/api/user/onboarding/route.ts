// ===================================================================
// Onboarding তথ্য সেভ করার API
// POST /api/user/onboarding
// Body: { hscBatch, board }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition — Profile Update এর একই "নিজের রো
// concurrent delete-account এর সাথে race" ক্লাস, প্রতিরোধমূলকভাবে
// ফিক্স করা হয়েছে): `update()` এর বদলে atomic `updateMany()` claim।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidHscBatch } from "@/lib/numeric-validation";
import { isValidEnumValue, VALID_BOARDS } from "@/lib/enum-validation";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { hscBatch, board } = body;

    // 🐛 বাগ ফিক্স: আগে `Number(hscBatch)` সরাসরি কল করা হতো — Profile
    // Update এ পাওয়া একই bug (non-numeric string/array/object → NaN
    // crash, extreme digit-string → overflow crash, unrealistic মান
    // silently সেভ)। এখন `isValidHscBatch()` দিয়ে আগেই ভ্যালিডেট।
    if (hscBatch !== undefined && hscBatch !== null && !isValidHscBatch(hscBatch)) {
      return NextResponse.json(
        { error: "সঠিক HSC ব্যাচ বছর দিন (২০২০-২০৫০)" },
        { status: 400 }
      );
    }

    // 🐛 বাগ ফিক্স (Missing Enum Validation bug hunt সিরিজের ধারাবাহিকতা,
    // established Profile Update PATCH এ পাওয়া bug এর একই ক্লাস —
    // lib/enum-validation.ts এ বিস্তারিত): `board` কোনো ভ্যালিডেশন
    // ছাড়াই সরাসরি সেভ হতো।
    if (board !== undefined && board !== null && !isValidEnumValue(board, VALID_BOARDS)) {
      return NextResponse.json({ error: "সঠিক বোর্ড নির্বাচন করুন" }, { status: 400 });
    }

    const claimResult = await prisma.user.updateMany({
      where: { id: session.user.id },
      data: {
        hscBatch: isValidHscBatch(hscBatch) ? hscBatch : undefined,
        board: board || undefined,
      },
    });

    if (claimResult.count === 0) {
      return NextResponse.json(
        { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding Error:", err);
    return NextResponse.json(
      { error: "তথ্য সেভ করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
