// ===================================================================
// "আজকের পড়া" (Today's Focus) — আজকের আইটেম + বকেয়া (miss করা) আইটেম
// GET /api/study-plan/today
// -------------------------------------------------------------------
// Dashboard-এর "আজকের পড়া" কার্ডে ব্যবহৃত হয়। কোনো active StudyPlan
// না থাকলে plan: null রিটার্ন করে (ফ্রন্টএন্ড তখন "প্ল্যান বানাও" CTA
// দেখাবে)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTodayFocus } from "@/lib/today-focus";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const focus = await getTodayFocus(session.user.id);
  return NextResponse.json({ focus });
}
