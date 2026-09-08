import { randomUUID } from "node:crypto";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type SendResponse } from "firebase-admin/messaging";
import { prisma } from "@/lib/prisma";

const PUSH_TTL_MS = 60_000;
const DEVICE_STALE_DAYS = 90;
const DELIVERY_RETENTION_DAYS = 90;

export type NativePushRuntimeStatus = {
  status: "unconfigured" | "partial" | "ready" | "degraded";
  configured: boolean;
  initialized: boolean;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastErrorCode: string | null;
};

export interface NativePushResult {
  configured: boolean;
  commandId?: string;
  eligibleDevices: number;
  sent: number;
  failed: number;
  disabled: number;
  errorCode?: string;
}

type FocusPushType = "STRICT_FOCUS_START" | "STRICT_FOCUS_STOP";

type FocusDevice = {
  id: string;
  token: string;
};

const runtimeState: {
  initialized: boolean;
  lastSuccessAt: Date | null;
  lastFailureAt: Date | null;
  lastErrorCode: string | null;
} = {
  initialized: false,
  lastSuccessAt: null,
  lastFailureAt: null,
  lastErrorCode: null,
};

function firebaseConfiguration() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim() ?? "";
  const present = [projectId, clientEmail, privateKey].filter(Boolean).length;
  return {
    projectId,
    clientEmail,
    privateKey,
    complete: present === 3,
    partial: present > 0 && present < 3,
  };
}

function recordRuntimeFailure(code: string) {
  runtimeState.lastFailureAt = new Date();
  runtimeState.lastErrorCode = code;
}

function recordRuntimeSuccess() {
  runtimeState.lastSuccessAt = new Date();
  runtimeState.lastErrorCode = null;
}

function getFirebaseApp(): { app: App | null; errorCode?: string } {
  const config = firebaseConfiguration();
  if (!config.complete) {
    return {
      app: null,
      errorCode: config.partial ? "FIREBASE_CONFIG_PARTIAL" : "FIREBASE_NOT_CONFIGURED",
    };
  }
  try {
    const app = getApps()[0] ?? initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
    });
    runtimeState.initialized = true;
    return { app };
  } catch {
    recordRuntimeFailure("FIREBASE_INITIALIZATION_FAILED");
    return { app: null, errorCode: "FIREBASE_INITIALIZATION_FAILED" };
  }
}

export function getNativePushRuntimeStatus(): NativePushRuntimeStatus {
  const config = firebaseConfiguration();
  let status: NativePushRuntimeStatus["status"];
  if (config.partial) status = "partial";
  else if (!config.complete) status = "unconfigured";
  else if (runtimeState.lastErrorCode) status = "degraded";
  else status = "ready";
  return {
    status,
    configured: config.complete,
    initialized: runtimeState.initialized,
    lastSuccessAt: runtimeState.lastSuccessAt?.toISOString() ?? null,
    lastFailureAt: runtimeState.lastFailureAt?.toISOString() ?? null,
    lastErrorCode: runtimeState.lastErrorCode,
  };
}

/** Consent/device-capability filter; stale or soft-disabled tokens are not contacted. */
async function getFocusDevices(userId: string): Promise<FocusDevice[]> {
  const freshSince = new Date(Date.now() - DEVICE_STALE_DAYS * 24 * 60 * 60_000);
  return prisma.nativeDevice.findMany({
    where: {
      userId,
      platform: "android",
      remoteFocusCapable: true,
      accessibilityEnabled: true,
      disabledAt: null,
      lastSeenAt: { gte: freshSince },
    },
    select: { id: true, token: true },
    take: 100,
  });
}

function safeMessagingErrorCode(response: SendResponse): string {
  const code = response.error?.code;
  return typeof code === "string" && code.length > 0
    ? code.slice(0, 100)
    : "MESSAGING_SEND_FAILED";
}

function isInvalidTokenCode(code: string): boolean {
  return code === "messaging/registration-token-not-registered" ||
    code === "messaging/invalid-registration-token";
}

async function createDeliveryAttempts(input: {
  devices: FocusDevice[];
  commandId: string;
  sessionId: string;
  type: FocusPushType;
  issuedAt: Date;
  expiresAt: Date;
}) {
  await prisma.nativePushDelivery.createMany({
    data: input.devices.map((device) => ({
      commandId: input.commandId,
      deviceId: device.id,
      sessionId: input.sessionId,
      type: input.type,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
    })),
  });
  await prisma.nativeDevice.updateMany({
    where: { id: { in: input.devices.map((device) => device.id) } },
    data: {
      lastPushAttemptAt: input.issuedAt,
      lastCommandId: input.commandId,
    },
  });
}

async function recordMulticastResults(input: {
  devices: FocusDevice[];
  commandId: string;
  responses: SendResponse[];
  sentAt: Date;
}) {
  let disabled = 0;
  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < input.devices.length; index += 1) {
      const device = input.devices[index];
      const response = input.responses[index];
      if (!response) continue;
      if (response.success) {
        await Promise.all([
          tx.nativePushDelivery.updateMany({
            where: { commandId: input.commandId, deviceId: device.id },
            data: { status: "SENT", sentAt: input.sentAt, errorCode: null },
          }),
          tx.nativeDevice.update({
            where: { id: device.id },
            data: {
              lastPushSuccessAt: input.sentAt,
              lastPushErrorCode: null,
            },
          }),
        ]);
        continue;
      }

      const errorCode = safeMessagingErrorCode(response);
      const invalid = isInvalidTokenCode(errorCode);
      if (invalid) disabled += 1;
      await Promise.all([
        tx.nativePushDelivery.updateMany({
          where: { commandId: input.commandId, deviceId: device.id },
          data: { status: "FAILED", sentAt: input.sentAt, errorCode },
        }),
        tx.nativeDevice.update({
          where: { id: device.id },
          data: {
            lastPushFailureAt: input.sentAt,
            lastPushErrorCode: errorCode,
            ...(invalid
              ? {
                  remoteFocusCapable: false,
                  disabledAt: input.sentAt,
                  disabledReason: errorCode,
                }
              : {}),
          },
        }),
      ]);
    }
  });
  return disabled;
}

async function recordBatchFailure(input: {
  devices: FocusDevice[];
  commandId: string;
  errorCode: string;
}) {
  const failedAt = new Date();
  await prisma.$transaction([
    prisma.nativePushDelivery.updateMany({
      where: { commandId: input.commandId },
      data: { status: "FAILED", sentAt: failedAt, errorCode: input.errorCode },
    }),
    prisma.nativeDevice.updateMany({
      where: { id: { in: input.devices.map((device) => device.id) } },
      data: {
        lastPushFailureAt: failedAt,
        lastPushErrorCode: input.errorCode,
      },
    }),
  ]);
}

async function pruneOldDeliveries() {
  const cutoff = new Date(Date.now() - DELIVERY_RETENTION_DAYS * 24 * 60 * 60_000);
  await prisma.nativePushDelivery.deleteMany({ where: { createdAt: { lt: cutoff } } });
}

async function sendFocusCommand(input: {
  userId: string;
  sessionId: string;
  type: FocusPushType;
  data: Record<string, string>;
}): Promise<NativePushResult> {
  const firebase = getFirebaseApp();
  if (!firebase.app) {
    return {
      configured: false,
      eligibleDevices: 0,
      sent: 0,
      failed: 0,
      disabled: 0,
      errorCode: firebase.errorCode,
    };
  }

  try {
    const devices = await getFocusDevices(input.userId);
    if (devices.length === 0) {
      return {
        configured: true,
        eligibleDevices: 0,
        sent: 0,
        failed: 0,
        disabled: 0,
      };
    }

    const commandId = randomUUID();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + PUSH_TTL_MS);
    await pruneOldDeliveries().catch(() => undefined);
    await createDeliveryAttempts({
      devices,
      commandId,
      sessionId: input.sessionId,
      type: input.type,
      issuedAt,
      expiresAt,
    });

    try {
      const response = await getMessaging(firebase.app).sendEachForMulticast({
        tokens: devices.map((device) => device.token),
        data: {
          ...input.data,
          type: input.type,
          commandId,
          issuedAtEpochMs: String(issuedAt.getTime()),
        },
        android: {
          priority: "high",
          ttl: PUSH_TTL_MS,
        },
      });
      const sentAt = new Date();
      const disabled = await recordMulticastResults({
        devices,
        commandId,
        responses: response.responses,
        sentAt,
      });
      if (response.successCount > 0) recordRuntimeSuccess();
      if (response.failureCount > 0) recordRuntimeFailure("FCM_PARTIAL_FAILURE");
      return {
        configured: true,
        commandId,
        eligibleDevices: devices.length,
        sent: response.successCount,
        failed: response.failureCount,
        disabled,
        ...(response.failureCount > 0 ? { errorCode: "FCM_PARTIAL_FAILURE" } : {}),
      };
    } catch {
      const errorCode = "FCM_BATCH_SEND_FAILED";
      await recordBatchFailure({ devices, commandId, errorCode }).catch(() => undefined);
      recordRuntimeFailure(errorCode);
      return {
        configured: true,
        commandId,
        eligibleDevices: devices.length,
        sent: 0,
        failed: devices.length,
        disabled: 0,
        errorCode,
      };
    }
  } catch {
    const errorCode = "NATIVE_PUSH_PIPELINE_FAILED";
    recordRuntimeFailure(errorCode);
    return {
      configured: true,
      eligibleDevices: 0,
      sent: 0,
      failed: 0,
      disabled: 0,
      errorCode,
    };
  }
}

/** Sends a consent-gated, data-only FCM command to registered Android devices. */
export async function sendNativeFocusCommand(input: {
  userId: string;
  sessionId: string;
  endsAt: Date;
  durationMinutes: number;
}): Promise<NativePushResult> {
  return sendFocusCommand({
    userId: input.userId,
    sessionId: input.sessionId,
    type: "STRICT_FOCUS_START",
    data: {
      sessionId: input.sessionId,
      endsAt: input.endsAt.toISOString(),
      endsAtEpochMs: String(input.endsAt.getTime()),
      durationMinutes: String(input.durationMinutes),
    },
  });
}

export async function sendNativeFocusStopCommand(input: {
  userId: string;
  sessionId: string;
  reason: string;
}): Promise<NativePushResult> {
  return sendFocusCommand({
    userId: input.userId,
    sessionId: input.sessionId,
    type: "STRICT_FOCUS_STOP",
    data: {
      sessionId: input.sessionId,
      reason: input.reason.slice(0, 100),
    },
  });
}
