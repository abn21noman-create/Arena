import { NextResponse } from "next/server";
import { z } from "zod";
import { protectApiRoute } from "@/lib/api-security";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { processDueFocusSchedules } from "@/lib/focus-schedule";
import {
  getFocusState,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
  startFocusSession,
  toFocusErrorResponse,
} from "@/lib/focus";

const startSchema = z.object({
  durationMinutes: z.number().int().min(MIN_FOCUS_MINUTES).max(MAX_FOCUS_MINUTES),
  subjectCode: z.enum(VALID_SUBJECT_CODES).nullable().optional(),
  focusLabel: z.string().trim().max(120).nullable().optional(),
  nativeEnforcementRequested: z.boolean().default(false),
});

export async function GET(request: Request) {
  const guard = await protectApiRoute(request, "read", "focus:session");
  if (!guard.ok) return guard.response;

  await processDueFocusSchedules({ userId: guard.userId, limit: 5 });
  const state = await getFocusState(guard.userId);
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const guard = await protectApiRoute(request, "create", "focus:session:start");
  if (!guard.ok) return guard.response;

  const parsed = startSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়" },
      { status: 400 }
    );
  }

  try {
    const session = await startFocusSession({
      userId: guard.userId,
      initiatedById: guard.userId,
      source: "SELF",
      durationMinutes: parsed.data.durationMinutes,
      subjectCode: parsed.data.subjectCode,
      focusLabel: parsed.data.focusLabel,
      nativeEnforcementRequested: parsed.data.nativeEnforcementRequested,
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const response = toFocusErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
