import { NextResponse } from "next/server";
import { z } from "zod";
import { protectApiRoute } from "@/lib/api-security";
import {
  completeFocusSession,
  emergencyExitFocusSession,
  heartbeatFocusSession,
  toFocusErrorResponse,
} from "@/lib/focus";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("HEARTBEAT"),
    nativeEnforcementActive: z.boolean().default(false),
  }),
  z.object({ action: z.literal("COMPLETE") }),
  z.object({
    action: z.literal("EMERGENCY_EXIT"),
    reason: z.string().trim().min(3).max(500),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const guard = await protectApiRoute(request, "update", "focus:session:update");
  if (!guard.ok) return guard.response;
  const { sessionId } = await params;
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Action সঠিক নয়" },
      { status: 400 }
    );
  }

  try {
    let session;
    if (parsed.data.action === "HEARTBEAT") {
      session = await heartbeatFocusSession({
        sessionId,
        userId: guard.userId,
        nativeEnforcementActive: parsed.data.nativeEnforcementActive,
      });
    } else if (parsed.data.action === "COMPLETE") {
      session = await completeFocusSession(sessionId, guard.userId);
    } else {
      session = await emergencyExitFocusSession({
        sessionId,
        userId: guard.userId,
        reason: parsed.data.reason,
      });
    }
    return NextResponse.json({ session });
  } catch (error) {
    const response = toFocusErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
