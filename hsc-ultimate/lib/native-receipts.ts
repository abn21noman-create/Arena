import { prisma } from "@/lib/prisma";

export type NativeReceiptStatus =
  | "STARTED"
  | "STOPPED"
  | "REJECTED_NO_CONSENT"
  | "REJECTED_ACCESSIBILITY_DISABLED"
  | "REJECTED_EXPIRED"
  | "REJECTED_FUTURE_COMMAND"
  | "REJECTED_REPLAY"
  | "REJECTED_MALFORMED"
  | "REJECTED_SESSION_MISMATCH";

export interface NativeFocusReceipt {
  commandId: string;
  sessionId: string;
  type: "STRICT_FOCUS_START" | "STRICT_FOCUS_STOP";
  status: NativeReceiptStatus;
  occurredAtEpochMs: number;
}

export class NativeReceiptDeviceNotFoundError extends Error {
  constructor() {
    super("Registered native device not found");
    this.name = "NativeReceiptDeviceNotFoundError";
  }
}

export async function processNativePushReceipts(input: {
  userId: string;
  token: string;
  receipts: NativeFocusReceipt[];
}) {
  const device = await prisma.nativeDevice.findFirst({
    where: { userId: input.userId, token: input.token },
    select: { id: true },
  });
  if (!device) throw new NativeReceiptDeviceNotFoundError();

  const sorted = [...input.receipts].sort(
    (left, right) => left.occurredAtEpochMs - right.occurredAtEpochMs
  );
  return prisma.$transaction(async (tx) => {
    let matched = 0;
    let latestMatched: NativeFocusReceipt | null = null;

    for (const receipt of sorted) {
      const receiptAt = new Date(receipt.occurredAtEpochMs);
      const updated = await tx.nativePushDelivery.updateMany({
        where: {
          commandId: receipt.commandId,
          deviceId: device.id,
          sessionId: receipt.sessionId,
          type: receipt.type,
        },
        data: {
          status: receipt.status,
          receiptAt,
          errorCode: receipt.status.startsWith("REJECTED_") ? receipt.status : null,
        },
      });
      if (updated.count !== 1) continue;
      matched += 1;
      latestMatched = receipt;

      if (receipt.status === "STARTED" && receipt.type === "STRICT_FOCUS_START") {
        const receivedAt = new Date();
        await tx.focusSession.updateMany({
          where: {
            id: receipt.sessionId,
            userId: input.userId,
            status: "ACTIVE",
            endsAt: { gt: receivedAt },
          },
          data: {
            nativeEnforcementActive: true,
            lastHeartbeatAt: receivedAt,
          },
        });
      } else {
        await tx.focusSession.updateMany({
          where: { id: receipt.sessionId, userId: input.userId },
          data: { nativeEnforcementActive: false },
        });
      }
    }

    if (latestMatched) {
      await tx.nativeDevice.update({
        where: { id: device.id },
        data: {
          lastSeenAt: new Date(),
          lastReceiptAt: new Date(latestMatched.occurredAtEpochMs),
          lastReceiptStatus: latestMatched.status,
        },
      });
    }
    return { matched, unmatched: sorted.length - matched };
  });
}
