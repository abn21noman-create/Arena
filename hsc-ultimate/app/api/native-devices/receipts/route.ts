import { NextResponse } from "next/server";
import { z } from "zod";
import { protectApiRoute } from "@/lib/api-security";
import {
  NativeReceiptDeviceNotFoundError,
  processNativePushReceipts,
} from "@/lib/native-receipts";

const receiptStatus = z.enum([
  "STARTED",
  "STOPPED",
  "REJECTED_NO_CONSENT",
  "REJECTED_ACCESSIBILITY_DISABLED",
  "REJECTED_EXPIRED",
  "REJECTED_FUTURE_COMMAND",
  "REJECTED_REPLAY",
  "REJECTED_MALFORMED",
  "REJECTED_SESSION_MISMATCH",
]);

const receiptSchema = z.object({
  token: z.string().trim().min(20).max(4096),
  receipts: z.array(z.object({
    commandId: z.string().trim().min(16).max(64),
    sessionId: z.string().trim().min(10).max(80),
    type: z.enum(["STRICT_FOCUS_START", "STRICT_FOCUS_STOP"]),
    status: receiptStatus,
    occurredAtEpochMs: z.number().int().positive(),
  })).min(1).max(10),
});

export async function POST(request: Request) {
  const guard = await protectApiRoute(request, "update", "native-device:receipts");
  if (!guard.ok) return guard.response;
  const parsed = receiptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Native receipt সঠিক নয়" }, { status: 400 });
  }

  const now = Date.now();
  const oldestAllowed = now - 7 * 24 * 60 * 60_000;
  const newestAllowed = now + 5 * 60_000;
  if (parsed.data.receipts.some((receipt) =>
    receipt.occurredAtEpochMs < oldestAllowed || receipt.occurredAtEpochMs > newestAllowed
  )) {
    return NextResponse.json({ error: "Receipt timestamp গ্রহণযোগ্য নয়" }, { status: 400 });
  }

  try {
    const result = await processNativePushReceipts({
      userId: guard.userId,
      token: parsed.data.token,
      receipts: parsed.data.receipts,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof NativeReceiptDeviceNotFoundError) {
      return NextResponse.json({ error: "Registered device পাওয়া যায়নি" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Native receipt sync ব্যর্থ" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
