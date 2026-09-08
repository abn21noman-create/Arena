// ===================================================================
// Adaptive Practice Preview — দুর্বল টপিক লিস্ট দেখায় (সেশন শুরু করার আগে)
// GET /api/adaptive-practice/preview
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWeakTopicsPreview } from "@/lib/adaptive-practice";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const weakTopics = await getWeakTopicsPreview(session.user.id);
  return NextResponse.json({ weakTopics });
}
