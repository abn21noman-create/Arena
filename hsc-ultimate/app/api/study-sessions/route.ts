// ===================================================================
// Study Session (Pomodoro) লগ করার API
// POST /api/study-sessions
// Body: { subjectCode?, type, startTime, endTime, durationSec }
// -------------------------------------------------------------------
// একটা Pomodoro সেশন শেষ হলে ফ্রন্টএন্ড থেকে এই API কল হয়, session
// history তে সেভ হয় এবং XP দেওয়া হয় (মনোযোগ দিয়ে পড়াশোনার পুরস্কার)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { feedStudyPet } from "@/lib/study-pet";
import { isValidEnumValue, VALID_STUDY_SESSION_TYPES, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

// প্রতি সম্পূর্ণ পোমোডোরো (২৫ মিনিট) সেশনে ১৫ XP
const XP_PER_COMPLETED_POMODORO = 15;

// একটা একক স্টাডি সেশন বাস্তবসম্মতভাবে সর্বোচ্চ এত সেকেন্ড (৬ ঘণ্টা)
// হতে পারে — এর বেশি হলে নিশ্চিতভাবে ভুল ইনপুট বা XP farming চেষ্টা
const MAX_DURATION_SEC = 6 * 60 * 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { subjectCode, type, durationSec } = body;

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Image/Text-Length/Enum/Date Validation এর একই "input validation
  // consistency" ক্লাস — এবার numeric ইনপুট): আগে `durationSec` এর
  // কোনো ভ্যালিডেশন ছিল না। লাইভ টেস্টে ৩টা সমস্যা প্রমাণিত হয়েছে:
  // (১) negative durationSec (-100) → ২০০ গৃহীত, `startTime` (যেটা
  // `endTime - durationSec*1000` থেকে হিসাব হয়) `endTime` এর পরে চলে
  // যায় (startTime > endTime ডেটা corruption), (২) string
  // durationSec ("not-a-number") → `(durationSec ?? 0) * 1000` এ
  // `NaN` তৈরি হয়ে `new Date(NaN)` Invalid Date বানায়, Prisma
  // `PrismaClientValidationError` throw করে ৫০০ crash করতো, (৩)
  // অবাস্তব বড় durationSec (999999999 = ৩১+ বছর) → ২০০ গৃহীত এবং
  // যেহেতু >=1500 সেকেন্ড শর্ত সত্যি হয়ে যায়, XP + Study Pet feed +
  // badge award সবই ট্রিগার হয়ে যেত (XP farming vector, একবারে একটা
  // API কলে অবাস্তব বড় "স্টাডি টাইম" দাবি করে)। ফিক্স: `durationSec`
  // finite non-negative number এবং `MAX_DURATION_SEC` এর মধ্যে
  // আছে কিনা যাচাই করা হচ্ছে DB write এর আগেই।
  if (durationSec !== undefined && durationSec !== null) {
    if (typeof durationSec !== "number" || !Number.isFinite(durationSec) || durationSec < 0) {
      return NextResponse.json({ error: "সঠিক durationSec (অ-ঋণাত্মক সংখ্যা) দিন" }, { status: 400 });
    }
    if (durationSec > MAX_DURATION_SEC) {
      return NextResponse.json(
        { error: `একটা সেশন সর্বোচ্চ ${MAX_DURATION_SEC / 3600} ঘণ্টার হতে পারে` },
        { status: 400 }
      );
    }
  }

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/enum-validation.ts এ বিস্তারিত): অজানা type/subjectCode দিলে
  // Prisma create() এ `PrismaClientValidationError` throw করে ৫০০
  // crash করতো। লাইভ টেস্টে প্রমাণিত।
  if (!isValidEnumValue(type, VALID_STUDY_SESSION_TYPES)) {
    return NextResponse.json({ error: "সঠিক session type দিন" }, { status: 400 });
  }
  if (!isValidEnumValue(subjectCode, VALID_SUBJECT_CODES)) {
    return NextResponse.json({ error: "সঠিক subjectCode দিন" }, { status: 400 });
  }

  const studySession = await prisma.studySession.create({
    data: {
      userId: session.user.id,
      subjectCode: subjectCode || null,
      type: type || "POMODORO",
      startTime: new Date(Date.now() - (durationSec ?? 0) * 1000),
      endTime: new Date(),
      durationSec: durationSec ?? 0,
    },
  });

  // পুরো ২৫ মিনিট (১৫০০ সেকেন্ড) সম্পন্ন করলেই XP দেওয়া হবে, আধাখেঁচড়া সেশনে না
  let xpEarned = 0;
  let newBadges: { code: string; name: string; iconEmoji: string }[] = [];
  let petResult: Awaited<ReturnType<typeof feedStudyPet>> | null = null;

  if ((durationSec ?? 0) >= 1500) {
    xpEarned = XP_PER_COMPLETED_POMODORO;
    await awardXp(session.user.id, xpEarned);
    await updateStreak(session.user.id);
    const awarded = await checkAndAwardBadges(session.user.id);
    newBadges = awarded.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji }));

    // পোমোডোরো টাইপের সেশন সম্পন্ন হলেই Study Pet কে "খাওয়ানো" হয় (carePoints/
    // happiness বাড়ে, প্রয়োজনে evolution ঘটে)
    if ((type || "POMODORO") === "POMODORO") {
      petResult = await feedStudyPet(session.user.id);
    }
  }

  return NextResponse.json({
    studySession,
    xpEarned,
    newBadges,
    pet: petResult
      ? { pet: petResult.pet, evolved: petResult.evolved, previousStage: petResult.previousStage }
      : null,
  });
}
