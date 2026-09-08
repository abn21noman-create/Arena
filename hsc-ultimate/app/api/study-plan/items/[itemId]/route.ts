// ===================================================================
// Study Plan Item সম্পূর্ণ/অসম্পূর্ণ টগল করা
// PATCH /api/study-plan/items/[itemId]
// Body: { isCompleted: boolean }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { isValidRequiredBoolean } from "@/lib/boolean-validation";

// প্রতিটা স্টাডি প্ল্যান আইটেম সম্পূর্ণ করলে ছোট XP reward
const XP_PER_ITEM = 5;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { itemId } = await params;
  const item = await prisma.studyPlanItem.findUnique({
    where: { id: itemId },
    include: { studyPlan: true },
  });

  if (!item || item.studyPlan.userId !== session.user.id) {
    return NextResponse.json({ error: "আইটেম পাওয়া যায়নি" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { isCompleted } = body as { isCompleted: unknown };

  // 🐛 বাগ ফিক্স (Boolean Field Validation ক্লাস, established
  // non-race-condition bug hunt সিরিজের নতুন ক্লাস): আগে `isCompleted`
  // এর কোনো টাইপ চেক ছিল না, সরাসরি `if (isCompleted)` truthy-check
  // দিয়ে branch নেওয়া হতো — `isCompleted: "false"` (string, truthy)
  // পাঠালে ভুলভাবে "সম্পূর্ণ করো" branch এ চলে যেত (XP award সহ),
  // ইউজার আসলে "অসম্পূর্ণ করো" চাইলেও। ফিক্স: strict boolean-type চেক।
  if (!isValidRequiredBoolean(isCompleted)) {
    return NextResponse.json({ error: "isCompleted true/false হতে হবে" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স ধাপ ১ (Task Manager এর একই xpAwarded প্যাটার্ন এখানেও
  // প্রয়োগ করা হয়েছে) — আগে isCompleted=true পাঠালেই (আগের state চেক
  // না করেই) প্রতিবার XP দেওয়া হতো, যা Task এর বাগের চেয়েও গুরুতর
  // ছিল। `StudyPlanItem.xpAwarded` ফ্ল্যাগ যোগ করে এটা ফিক্স করা
  // হয়েছিল।
  //
  // 🐛 বাগ ফিক্স ধাপ ২ (Forum Best Answer XP Farming বাগ অডিটের সময়
  // আবিষ্কৃত, একই ক্লাসের সমস্যা): ধাপ ১ এর ফিক্স read-then-write
  // প্যাটার্নে ছিল (এই ফাংশনের শুরুতে `findUnique()` দিয়ে read করা
  // `item.xpAwarded` চেক করে, পরে আলাদা `update()` কল) — race
  // condition এর ঝুঁকিতে ছিল। লাইভ টেস্টে ৫টা concurrent PATCH
  // request পাঠিয়ে ২৫ XP পাওয়া গেছে (প্রত্যাশিত ৫)। ফিক্স: single
  // atomic `UPDATE ... WHERE id=? AND xpAwarded=false` স্টেটমেন্ট
  // দিয়ে check+set একসাথে করা হয়েছে।
  // 🐛 বাগ ফিক্স ধাপ ৩ (Race Condition, Study Plan Regenerate এর সাথে
  // interaction — এই সেশনে আবিষ্কৃত broad grep audit এ): আগে ধাপ ২ এর
  // xpAwarded atomic claim এর পরেও নিচে আলাদা raw `update({ where: {
  // id: itemId }, data: { isCompleted } })` কল করা হতো। Study Plan
  // Regenerate (`POST /api/study-plan/generate`) পুরনো StudyPlan
  // `deleteMany()` করে দেয় (cascade এ সব StudyPlanItem ও মুছে যায়) —
  // যদি এটা এই PATCH এর xpAwarded-claim ও নিচের `update()` এর মাঝের
  // ছোট window এ ঘটে, `update()` P2025 throw করে ৫০০ crash করতো।
  // লাইভ টেস্টে regenerate চলাকালীন সময় জুড়ে বার বার PATCH পাঠিয়ে
  // ৪/৪ (১০০%) iteration এ crash প্রমাণিত হয়েছে (`No record was found
  // for an update`)। ফিক্স: চূড়ান্ত `update()` এর বদলে atomic
  // `updateMany({ where: { id: itemId } })` ব্যবহার করা হয়েছে (কখনো
  // throw করে না) — matched count 0 হলে গ্রেসফুল ৪০৪ রিটার্ন করা হয়
  // (XP ইতিমধ্যে claim হয়ে থাকলেও, item না থাকলে সেটা caller কে
  // জানানো হয়, কোনো crash ছাড়াই)।
  let shouldAwardXp = false;
  let claimResult;
  if (isCompleted) {
    // xpAwarded ও isCompleted একই atomic updateMany এ সেট করা হচ্ছে —
    // দুই ধাপে আলাদা write করলে মাঝের window এ race থেকে যায়
    claimResult = await prisma.studyPlanItem.updateMany({
      where: { id: itemId, xpAwarded: false },
      data: { xpAwarded: true, isCompleted: true },
    });
    shouldAwardXp = claimResult.count > 0;

    if (!shouldAwardXp) {
      // XP আগেই claim হয়ে গেছে (already xpAwarded=true) — তাও
      // isCompleted আপডেট করতে হবে, কিন্তু আইটেম ততক্ষণে ডিলিট হয়ে
      // থাকতে পারে, তাই এখানেও updateMany() (raw update() না)
      claimResult = await prisma.studyPlanItem.updateMany({
        where: { id: itemId },
        data: { isCompleted: true },
      });
    }
  } else {
    claimResult = await prisma.studyPlanItem.updateMany({
      where: { id: itemId },
      data: { isCompleted: false },
    });
  }

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "আইটেম পাওয়া যায়নি" }, { status: 404 });
  }

  const updated = await prisma.studyPlanItem.findUnique({ where: { id: itemId } });
  if (!updated) {
    // অত্যন্ত ছোট window হলেও updateMany() সফল হওয়ার ঠিক পরে delete
    // হয়ে যাওয়ার তাত্ত্বিক সম্ভাবনা আছে, crash না করে গ্রেসফুল ৪০৪
    return NextResponse.json({ error: "আইটেম পাওয়া যায়নি" }, { status: 404 });
  }

  let newBadges: { code: string; name: string; iconEmoji: string }[] = [];

  // সম্পূর্ণ করলে XP (সারাজীবনে একবারই এই আইটেমের জন্য, বার বার toggle
  // করে XP farm করা সম্পূর্ণভাবে ঠেকানো হয়েছে)
  if (shouldAwardXp) {
    await awardXp(session.user.id, XP_PER_ITEM);
    await updateStreak(session.user.id);
    const awarded = await checkAndAwardBadges(session.user.id);
    newBadges = awarded.map((b) => ({
      code: b.code,
      name: b.name,
      iconEmoji: b.iconEmoji,
    }));
  }

  return NextResponse.json({ item: updated, newBadges });
}
