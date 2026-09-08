// ===================================================================
// Peer Quiz Duel — Lobby ও Create API
// GET  /api/duel        -> Public lobby তে থাকা WAITING duel লিস্ট + নিজের active duel (থাকলে)
// POST /api/duel        -> নতুন Duel Challenge তৈরি
// Body (POST): { sourceType: "subject"|"custom", subjectId?, customSetId? }
// 🔧 সম্প্রসারণ (এই সেশনে): আগে শুধু { subjectId } নিতো, এখন Quiz
// Battle এর sourceType প্যাটার্ন অনুসরণ করে custom set সাপোর্ট যোগ
// হয়েছে (backward-compat: sourceType না দিলে subjectId আছে এমন পুরনো
// রিকোয়েস্টও কাজ করে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDuel, listOpenDuels } from "@/lib/quiz-duel";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const [openDuels, myActiveDuel] = await Promise.all([
    listOpenDuels(session.user.id),
    prisma.quizDuel.findFirst({
      where: {
        status: { in: ["WAITING", "ACTIVE"] },
        OR: [{ challengerId: session.user.id }, { opponentId: session.user.id }],
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ openDuels, myActiveDuel });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { subjectId, customSetId } = body as { subjectId?: string; customSetId?: string };
  // backward-compat: sourceType না পাঠালেও customSetId/subjectId যেটা
  // থাকে সেটা দিয়েই ধরে নেওয়া হয় (পুরনো ক্লায়েন্ট কোড ভাঙবে না)
  const sourceType: "subject" | "custom" = customSetId ? "custom" : "subject";

  if (sourceType === "subject" && !subjectId) {
    return NextResponse.json({ error: "সাবজেক্ট বেছে নিন" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স: আগে এখানে existence check (findFirst) করে তারপর
  // আলাদা createDuel() কল করা হতো — race condition এ bypass হতো।
  // এখন পুরো check+create atomic ভাবে createDuel() এর ভেতরে
  // $transaction+FOR UPDATE দিয়ে হয় (lib/quiz-duel.ts দেখো)।
  try {
    const duel = await createDuel({ challengerId: session.user.id, sourceType, subjectId, customSetId });
    return NextResponse.json({ duel }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Duel তৈরি করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
