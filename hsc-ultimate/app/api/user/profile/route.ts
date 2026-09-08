// ===================================================================
// Profile আপডেট API (নাম, বোর্ড, HSC ব্যাচ)
// PATCH /api/user/profile
// Body: { name?, board?, hscBatch? }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, নতুন সাব-ভ্যারিয়েন্ট — Class Routine
// Slot ইত্যাদির মতো "existence check-then-write" ক্লাস, কিন্তু এখানে
// আলাদা ownership guard লাগে না কারণ where ক্লজেই `session.user.id`
// থাকে; সমস্যা হলো নিজের ইউজার রো নিজেই মাঝপথে ডিলিট হয়ে যাওয়া): আগে
// কোনো existence check ছাড়াই সরাসরি `prisma.user.update({ where: {
// id: session.user.id } })` কল করা হতো। যদি ইউজার নিজে অন্য ট্যাব/
// ডিভাইস থেকে concurrent `POST /api/user/delete-account` কল করে
// একই মুহূর্তে নিজের অ্যাকাউন্ট ডিলিট করে, এই profile update `user.
// delete()` এর ঠিক পরে/মাঝে ঘটলে P2025 ("No record was found for
// an update") throw করে ৫০০ crash করতো (৪০৪ হওয়া উচিত ছিল, কারণ
// ইউজার নিজেই আর নেই)। লাইভ টেস্টে delete-account কে ~1.5s ধীর
// (cascade delete) হওয়ার সুযোগ নিয়ে profile-update কে ১.২ সেকেন্ড
// delay দিয়ে ২০/২০ iteration এ crash সরাসরি প্রমাণিত হয়েছে।
//
// ফিক্স: `update()` এর বদলে atomic `updateMany({ where: { id } })`
// claim — matched count 0 হলে (ইতিমধ্যে ডিলিট হয়ে গেছে ধরে নিয়ে)
// ৪০৪ রিটার্ন করা হয়, কোনো crash হয় না। এই একই bug class ও fix
// প্যাটার্ন `exam-date`, `target-gpa`, `ai-tutor-mode`, `digest-
// preference`, `change-password`, `onboarding` endpoint গুলোতেও
// (একই ফাইলে বাগ পাওয়ার পরে প্রতিরোধমূলকভাবে) প্রয়োগ করা হয়েছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidHscBatch } from "@/lib/numeric-validation";
import { isValidEnumValue, VALID_BOARDS, MAX_USER_NAME_LENGTH } from "@/lib/enum-validation";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, board, hscBatch } = body;

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json({ error: "নাম সঠিক না" }, { status: 400 });
    }
    // 🐛 বাগ ফিক্স (Missing Text Length Validation bug hunt সিরিজের
    // ধারাবাহিকতা, broad-grep এ আবিষ্কৃত, লাইভ টেস্টে প্রমাণিত): আগে
    // `name` এর কোনো max-length limit ছিল না — ৫০০০ অক্ষরের নাম
    // সরাসরি সেভ হয়ে গিয়েছিল, এবং সেটা NextAuth JWT session cookie
    // এত বড় করে দিয়েছিল যে established admin অ্যাকাউন্ট নিজেই HTTP
    // ৪৩১ "Request Header Fields Too Large" এ লগইন করতে ব্যর্থ হচ্ছিল
    // (self-lockout সাইড-ইফেক্ট)। lib/enum-validation.ts এ বিস্তারিত।
    if (name !== undefined && name.trim().length > MAX_USER_NAME_LENGTH) {
      return NextResponse.json(
        { error: `নাম সর্বোচ্চ ${MAX_USER_NAME_LENGTH} অক্ষরের হতে পারবে` },
        { status: 400 }
      );
    }

    // 🐛 বাগ ফিক্স (Missing Enum Validation bug hunt সিরিজের ধারাবাহিকতা,
    // broad-grep এ আবিষ্কৃত, লাইভ টেস্টে প্রমাণিত): আগে `board` কোনো
    // ভ্যালিডেশন ছাড়াই সরাসরি সেভ হতো — established ১০টা বোর্ডের
    // dropdown UI বাইপাস করে অজানা/অর্থহীন স্ট্রিং (এমনকি ১০,০০০+
    // অক্ষরের) সরাসরি DB তে সেভ হয়ে যাওয়া প্রমাণিত হয়েছে।
    if (!isValidEnumValue(board, VALID_BOARDS)) {
      return NextResponse.json({ error: "সঠিক বোর্ড নির্বাচন করুন" }, { status: 400 });
    }

    // 🐛 বাগ ফিক্স: আগে `Number(hscBatch)` সরাসরি কল করা হতো — non-numeric
    // string/array/object এ `NaN` তৈরি হয়ে Prisma `Int` ফিল্ডে ৫০০ crash
    // করত, extreme digit-string এ 64-bit overflow crash করত, আর
    // null/negative/unrealistic মান silently সেভ হয়ে যেত। এখন
    // `isValidHscBatch()` দিয়ে আগেই ভ্যালিডেট করা হচ্ছে।
    if (hscBatch !== undefined && !isValidHscBatch(hscBatch)) {
      return NextResponse.json(
        { error: "সঠিক HSC ব্যাচ বছর দিন (২০২০-২০৫০)" },
        { status: 400 }
      );
    }

    const claimResult = await prisma.user.updateMany({
      where: { id: session.user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        board: board !== undefined ? board : undefined,
        hscBatch: hscBatch !== undefined ? hscBatch : undefined,
      },
    });


    if (claimResult.count === 0) {
      return NextResponse.json(
        { error: "ইউজার পাওয়া যায়নি (হয়তো অ্যাকাউন্ট ইতিমধ্যে ডিলিট হয়ে গেছে)" },
        { status: 404 }
      );
    }

    // পুরো user object পাঠানো নিরাপদ না (passwordHash leak হতে পারে),
    // তাই explicit select দিয়ে শুধু দরকারি field গুলো নেওয়া হচ্ছে
    const updated = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        board: true,
        hscBatch: true,
        examDate: true,
        xp: true,
        level: true,
      },
    });

    if (!updated) {
      return NextResponse.json(
        { error: "আপডেট সফল হয়েছে কিন্তু তথ্য রিফ্রেশ করার সময় সমস্যা হয়েছে" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("Profile Update Error:", err);
    return NextResponse.json(
      { error: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
