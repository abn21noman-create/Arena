// ===================================================================
// মিস্টেক ভল্ট (Mistake Vault) API
// GET /api/mistake-vault              — সারসংক্ষেপ (মোট সংখ্যা + সাবজেক্ট-ভিত্তিক ভাঙন)
// GET /api/mistake-vault?start=true   — রিভিশনের জন্য প্রকৃত প্রশ্ন লিস্ট
// GET /api/mistake-vault?start=true&subjectCode=PHYSICS — নির্দিষ্ট সাবজেক্টে ফিল্টার
// -------------------------------------------------------------------
// docs/MASTER_PLAN.md এ বিস্তারিত গবেষণা+ডিজাইন — SATT Academy এর
// "Mistake Vault" ফিচার থেকে অনুপ্রাণিত, সম্পূর্ণ schema-free।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMistakeVaultSummary, getMistakeVaultQuestions } from "@/lib/mistake-vault";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const subjectCode = searchParams.get("subjectCode") ?? undefined;

  if (start === "true") {
    const questions = await getMistakeVaultQuestions(session.user.id, subjectCode);
    return NextResponse.json({ questions });
  }

  const summary = await getMistakeVaultSummary(session.user.id);
  return NextResponse.json(summary);
}
