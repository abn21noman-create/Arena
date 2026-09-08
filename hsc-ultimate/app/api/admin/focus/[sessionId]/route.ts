import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { cancelFocusSessionByAdmin, toFocusErrorResponse } from "@/lib/focus";
import { sendNativeFocusStopCommand } from "@/lib/native-push";

const cancelSchema = z.object({ reason: z.string().trim().min(3).max(500) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }
  const { sessionId } = await params;
  const parsed = cancelSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Cancel reason লিখুন" }, { status: 400 });
  }

  try {
    const focusSession = await cancelFocusSessionByAdmin({
      sessionId,
      adminId: session.user.id,
      reason: parsed.data.reason,
    });
    const nativePush = await sendNativeFocusStopCommand({
      userId: focusSession.userId,
      sessionId: focusSession.id,
      reason: parsed.data.reason,
    });
    return NextResponse.json({ session: focusSession, nativePush });
  } catch (error) {
    const response = toFocusErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
