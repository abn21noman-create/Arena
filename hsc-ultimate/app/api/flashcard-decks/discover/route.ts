// ===================================================================
// Community Shared Deck — Discover API (AnkiWeb-অনুপ্রাণিত)
// GET /api/flashcard-decks/discover?subjectCode=PHYSICS
// -------------------------------------------------------------------
// সব isPublic=true ডেক দেখায় (নিজের deck সহ — নিজের শেয়ার করা ডেকও এখানে
// দেখা যাবে যাতে ইউজার নিশ্চিত হতে পারে ঠিকভাবে শেয়ার হয়েছে), জনপ্রিয়তা
// (importCount) অনুযায়ী sort করা।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEnumValue, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const subjectCode = req.nextUrl.searchParams.get("subjectCode");

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // forum/posts GET এর একই enum-validation-missing (query param)
  // ক্লাস): আগে `subjectCode as never` দিয়ে সরাসরি Prisma where
  // ক্লজে পাস করা হতো — অজানা subjectCode দিলে
  // `PrismaClientValidationError` throw করে ৫০০ crash করতো। ফিক্স:
  // ভ্যালিডেট করে অবৈধ হলে ফিল্টার উপেক্ষা করা হচ্ছে (fail-open,
  // read-only discover endpoint এ ব্লকিং এরর অপ্রয়োজনীয়)।
  const validSubjectCode = isValidEnumValue(subjectCode, VALID_SUBJECT_CODES) ? subjectCode : null;

  const decks = await prisma.flashcardDeck.findMany({
    where: {
      isPublic: true,
      ...(validSubjectCode ? { subjectCode: validSubjectCode } : {}),
    },
    orderBy: [{ importCount: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { flashcards: true } },
    },
    take: 100, // সহজ pagination-ফ্রি সীমা, ভবিষ্যতে cursor pagination যোগ করা যায়
  });

  const result = decks.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    subjectCode: d.subjectCode,
    importCount: d.importCount,
    cardCount: d._count.flashcards,
    createdAt: d.createdAt,
    isOwnDeck: d.user.id === session.user.id,
    ownerName: d.user.name,
  }));

  return NextResponse.json({ decks: result });
}
