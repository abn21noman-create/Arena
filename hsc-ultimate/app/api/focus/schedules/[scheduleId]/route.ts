import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/api-security";
import { cancelFocusSchedule } from "@/lib/focus-schedule";
import { toFocusErrorResponse } from "@/lib/focus";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  const guard = await protectApiRoute(request, "update", "focus:schedule:cancel");
  if (!guard.ok) return guard.response;
  const { scheduleId } = await params;
  try {
    const schedule = await cancelFocusSchedule({
      scheduleId,
      actorId: guard.userId,
      actorIsAdmin: guard.session.user.role === "ADMIN",
      reason: "User cancelled upcoming schedule",
    });
    return NextResponse.json({ schedule });
  } catch (error) {
    const response = toFocusErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
