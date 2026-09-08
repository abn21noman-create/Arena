// ===================================================================
// Live Study Presence — Generic Heartbeat API
// POST /api/live-activity/heartbeat
// Body: { activityType: "POMODORO" | "PRACTICE" | "CQ" | "FLASHCARD" | "READING_ROOM" | "MOCK_EXAM" }
// -------------------------------------------------------------------
// দীর্ঘ-সময় চলা activity (যেমন Pomodoro Timer, যেখানে ২৫ মিনিট ধরে কোনো
// submit event হয় না) থেকে periodic heartbeat পাঠানোর জন্য একটা
// generic, lightweight endpoint। established Reading Room heartbeat
// (session-id ভিত্তিক, focus-time accumulate করে) থেকে ইচ্ছাকৃতভাবে
// আলাদা — এটা কোনো সময় accumulate করে না, শুধু "এখন লাইভ" ফ্ল্যাগ
// রিফ্রেশ করে (lib/live-activity.ts এর markUserActive())।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markUserActive } from "@/lib/live-activity";
import { isValidEnumValue } from "@/lib/enum-validation";

const VALID_ACTIVITY_TYPES = ["PRACTICE", "CQ", "FLASHCARD", "POMODORO", "READING_ROOM", "MOCK_EXAM"] as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { activityType } = body as { activityType?: string };

  // 🐛 established non-race-condition bug hunt সিরিজের Enum Validation
  // ক্লাস অনুসরণ করে — client থেকে আসা enum-সদৃশ স্ট্রিং যাচাই না করলে
  // Prisma invalid-enum ৫০০ crash দিতে পারে
  if (!activityType || !isValidEnumValue(activityType, VALID_ACTIVITY_TYPES)) {
    return NextResponse.json(
      { error: "সঠিক activityType দাও (PRACTICE/CQ/FLASHCARD/POMODORO/READING_ROOM/MOCK_EXAM)" },
      { status: 400 }
    );
  }

  await markUserActive(session.user.id, activityType);

  return NextResponse.json({ ok: true });
}
