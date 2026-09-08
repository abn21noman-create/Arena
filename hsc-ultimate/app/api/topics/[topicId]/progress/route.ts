// ===================================================================
// Topic Progress আপডেট করার API
// POST /api/topics/[topicId]/progress
// Body: { status: "NOT_STARTED" | "LEARNING" | "PRACTICING" | "MASTERED" }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স ধাপ ১ (Task/StudyPlanItem এর একই xpAwarded প্যাটার্ন
// এখানেও প্রয়োগ করা হয়েছে, প্রোঅ্যাক্টিভ XP-double-award অডিটে
// আবিষ্কৃত): আগে MASTERED status পাঠালেই (আগের state চেক না করে)
// প্রতিবার ২০ XP দেওয়া হতো — LEARNING↔MASTERED বার বার টগল করে অসীম
// XP farming সম্ভব ছিল। `TopicProgress.xpAwarded` ফ্ল্যাগ যোগ করে
// এটা ফিক্স করা হয়েছিল।
//
// 🐛 বাগ ফিক্স ধাপ ২ (Forum Best Answer XP Farming বাগ অডিটের সময়
// আবিষ্কৃত, একই ক্লাসের সমস্যা): ধাপ ১ এর ফিক্স read-then-write
// প্যাটার্নে ছিল (`findUnique()` দিয়ে read করে `existing?.xpAwarded`
// চেক করে, পরে একই `upsert()` কলে xpAwarded সেট করা) — race condition
// এর ঝুঁকিতে ছিল। লাইভ টেস্টে ৫টা concurrent POST request পাঠিয়ে ১০০
// XP পাওয়া গেছে (প্রত্যাশিত ২০)। ফিক্স: state আপডেট (upsert) ও XP
// claim কে আলাদা করা হয়েছে — XP claim এখন single atomic
// `UPDATE ... WHERE userId=? AND topicId=? AND xpAwarded=false`
// স্টেটমেন্ট দিয়ে (Postgres row-level lock guarantee), শুধু matched
// (count>0) হলেই XP দেওয়া হয়।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";

const VALID_STATUSES = ["NOT_STARTED", "LEARNING", "PRACTICING", "MASTERED"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "সঠিক status দিন" }, { status: 400 });
  }

  try {
    const willBeMastered = status === "MASTERED";
    const completedPct =
      status === "MASTERED" ? 100 : status === "PRACTICING" ? 60 : status === "LEARNING" ? 30 : 0;

    // state (status/completedPct) আপডেট — এটা XP লজিক থেকে সম্পূর্ণ আলাদা,
    // যতবার খুশি toggle করা যায় (শুধু "বর্তমান progress state" ট্র্যাক করে)
    const progress = await prisma.topicProgress.upsert({
      where: {
        userId_topicId: { userId: session.user.id, topicId },
      },
      update: { status, completedPct },
      create: { userId: session.user.id, topicId, status, completedPct },
    });

    // XP claim সম্পূর্ণ আলাদা atomic ধাপে — upsert এর আগেই রেকর্ড নিশ্চিত
    // হয়ে গেছে, এখন শুধু `xpAwarded=false` থাকলেই claim করা হয় (single
    // atomic UPDATE...WHERE, row-level lock guarantee, race-condition-প্রুফ)
    let shouldAwardXp = false;
    if (willBeMastered) {
      const xpClaimResult = await prisma.topicProgress.updateMany({
        where: { userId: session.user.id, topicId, xpAwarded: false },
        data: { xpAwarded: true },
      });
      shouldAwardXp = xpClaimResult.count > 0;
    }

    // যদি টপিক MASTERED হয়, তাহলে ইউজারকে কিছু XP দেওয়া হচ্ছে (সারাজীবনে
    // একবারই এই টপিকের জন্য, বার বার toggle করে XP farm করা সম্পূর্ণভাবে
    // ঠেকানো হয়েছে)
    let newBadges: { code: string; name: string; iconEmoji: string }[] = [];
    if (shouldAwardXp) {
      await awardXp(session.user.id, 20);
    }

    await updateStreak(session.user.id);
    const awarded = await checkAndAwardBadges(session.user.id);
    newBadges = awarded.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji }));

    return NextResponse.json({ progress, newBadges });
  } catch (err) {
    console.error("Progress Update Error:", err);
    return NextResponse.json(
      { error: "প্রগ্রেস আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

