import { afterEach, describe, expect, it } from "vitest";
import {
  getNativePushRuntimeStatus,
  sendNativeFocusCommand,
} from "@/lib/native-push";

const ORIGINAL = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

function clearFirebaseEnvironment() {
  delete process.env.FIREBASE_PROJECT_ID;
  delete process.env.FIREBASE_CLIENT_EMAIL;
  delete process.env.FIREBASE_PRIVATE_KEY;
}

afterEach(() => {
  if (ORIGINAL.projectId === undefined) delete process.env.FIREBASE_PROJECT_ID;
  else process.env.FIREBASE_PROJECT_ID = ORIGINAL.projectId;
  if (ORIGINAL.clientEmail === undefined) delete process.env.FIREBASE_CLIENT_EMAIL;
  else process.env.FIREBASE_CLIENT_EMAIL = ORIGINAL.clientEmail;
  if (ORIGINAL.privateKey === undefined) delete process.env.FIREBASE_PRIVATE_KEY;
  else process.env.FIREBASE_PRIVATE_KEY = ORIGINAL.privateKey;
});

describe("Native push safe fallback", () => {
  it("reports unconfigured without exposing credential fields", () => {
    clearFirebaseEnvironment();
    const status = getNativePushRuntimeStatus();
    expect(status).toMatchObject({
      status: "unconfigured",
      configured: false,
      initialized: false,
    });
    const serialized = JSON.stringify(status);
    expect(serialized).not.toContain("privateKey");
    expect(serialized).not.toContain("clientEmail");
  });

  it("never throws or touches devices when Firebase is absent", async () => {
    clearFirebaseEnvironment();
    const result = await sendNativeFocusCommand({
      userId: "user-not-queried",
      sessionId: "session-not-queried",
      endsAt: new Date(Date.now() + 20 * 60_000),
      durationMinutes: 20,
    });
    expect(result).toEqual({
      configured: false,
      eligibleDevices: 0,
      sent: 0,
      failed: 0,
      disabled: 0,
      errorCode: "FIREBASE_NOT_CONFIGURED",
    });
  });

  it("detects partial server credential configuration", () => {
    clearFirebaseEnvironment();
    process.env.FIREBASE_PROJECT_ID = "partial-project";
    expect(getNativePushRuntimeStatus()).toMatchObject({
      status: "partial",
      configured: false,
    });
  });
});
