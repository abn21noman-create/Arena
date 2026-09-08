// ===================================================================
// Formula Quick Search API
// GET /api/formula-search?q=sin&subjectCode=PHYSICS
// -------------------------------------------------------------------
// সব বিষয়ের formulaSheet একসাথে সার্চ করে নির্দিষ্ট সূত্রের এন্ট্রি
// (bullet/table-row/equation) খুঁজে বের করে। খুব ছোট query (২ অক্ষরের
// কম) হলে খালি রেজাল্ট দেয় (established Global Search প্যাটার্ন
// অনুসরণ করে, অপ্রয়োজনীয় DB scan এড়াতে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchFormulas } from "@/lib/formula-search";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const subjectCode = searchParams.get("subjectCode");

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchFormulas(query, subjectCode);

  return NextResponse.json({ results });
}
