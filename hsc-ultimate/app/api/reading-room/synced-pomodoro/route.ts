// ===================================================================
// Synced (Shared) Pomodoro — বর্তমান global synced চক্রের অবস্থা
// GET /api/reading-room/synced-pomodoro
// -------------------------------------------------------------------
// readingroombd.com/StudyClock এর "সবাই একসাথে ব্রেক নেয়" ধারণা থেকে
// অনুপ্রাণিত। কোনো DB write/broadcast ছাড়াই — সার্ভারের wall-clock
// থেকে deterministically হিসাব করা হয়, তাই সব ইউজার একই মুহূর্তে কল
// করলে একই mode/secondsLeft পাবে (lib/reading-room.ts এ গাণিতিকভাবে
// pre-verify করা লজিক)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSyncedPomodoroState } from "@/lib/reading-room";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const state = getSyncedPomodoroState();
  return NextResponse.json(state);
}
