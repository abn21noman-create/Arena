// ===================================================================
// Study Pet API
// GET   /api/study-pet          -> বর্তমান পেটের অবস্থা (happiness decay সহ)
// PATCH /api/study-pet          -> পেটের নাম পরিবর্তন
// Body (PATCH): { name: string }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getStudyPetWithDecay,
  renameStudyPet,
  getNextStageProgress,
} from "@/lib/study-pet";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const pet = await getStudyPetWithDecay(session.user.id);
  const progress = getNextStageProgress(pet.carePoints, pet.stage);

  return NextResponse.json({ pet, progress });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name } = body as { name: string };

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "সঠিক নাম দিন" }, { status: 400 });
  }

  try {
    const pet = await renameStudyPet(session.user.id, name);
    return NextResponse.json({ pet });
  } catch (err) {
    const message = err instanceof Error ? err.message : "নাম পরিবর্তন করা যায়নি";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
