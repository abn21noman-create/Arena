// ===================================================================
// Study Group API
// GET  /api/study-group  -> নিজের গ্রুপের তথ্য (সদস্য লিস্ট+র‍্যাংক সহ), না থাকলে null
// POST /api/study-group  -> নতুন গ্রুপ তৈরি করা
// Body (POST): { name: string, description?: string }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMyGroupMembership, createStudyGroup } from "@/lib/study-group";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const membership = await getMyGroupMembership(session.user.id);
  return NextResponse.json({ membership });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, description } = body as { name: string; description?: string };

  try {
    const group = await createStudyGroup(session.user.id, name, description);
    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "গ্রুপ তৈরি করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
