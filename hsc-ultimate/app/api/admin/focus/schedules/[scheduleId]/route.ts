import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { updateFocusScheduleStatus } from "@/lib/focus-schedule";
import { toFocusErrorResponse } from "@/lib/focus";

const schema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
  reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { scheduleId } = await params;
  try {
    const schedule = await updateFocusScheduleStatus({
      scheduleId,
      adminId: session.user.id,
      status: parsed.data.status,
      reason: parsed.data.reason,
    });
    return NextResponse.json({ schedule });
  } catch (error) {
    const response = toFocusErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
