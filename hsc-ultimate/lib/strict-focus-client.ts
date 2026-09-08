"use client";

import { Capacitor, registerPlugin } from "@capacitor/core";
import { DEFAULT_ANDROID_ALLOWLIST } from "@/lib/focus-constants";

interface StrictFocusPluginApi {
  start(options: { sessionId: string; endsAtEpochMs: number; allowedPackages: string[] }): Promise<{ active: boolean }>;
  stop(options: { sessionId: string; reason: string }): Promise<{ active: boolean }>;
  getStatus(): Promise<{
    active: boolean;
    accessibilityEnabled: boolean;
    remoteConsentEnabled: boolean;
    sessionId?: string;
    endsAtEpochMs?: number;
  }>;
  openAccessibilitySettings(): Promise<void>;
  openAllowedApp(options: { kind: "PHONE" | "CLOCK" }): Promise<void>;
  setRemoteConsent(options: { enabled: boolean }): Promise<{ enabled: boolean }>;
  getPendingRemoteReceipts(): Promise<{ receipts: NativeRemoteReceipt[] }>;
  clearPendingRemoteReceipts(): Promise<{ cleared: boolean }>;
}

export interface NativeRemoteReceipt {
  commandId: string;
  sessionId: string;
  type: "STRICT_FOCUS_START" | "STRICT_FOCUS_STOP";
  status:
    | "STARTED"
    | "STOPPED"
    | "REJECTED_NO_CONSENT"
    | "REJECTED_ACCESSIBILITY_DISABLED"
    | "REJECTED_EXPIRED"
    | "REJECTED_FUTURE_COMMAND"
    | "REJECTED_REPLAY"
    | "REJECTED_MALFORMED"
    | "REJECTED_SESSION_MISMATCH";
  occurredAtEpochMs: number;
}

const StrictFocus = registerPlugin<StrictFocusPluginApi>("StrictFocus");

export function isNativeStrictFocusAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export async function getNativeStrictFocusStatus() {
  if (!isNativeStrictFocusAvailable()) {
    return {
      available: false,
      active: false,
      accessibilityEnabled: false,
      remoteConsentEnabled: false,
    };
  }
  try {
    return { available: true, ...(await StrictFocus.getStatus()) };
  } catch {
    return {
      available: true,
      active: false,
      accessibilityEnabled: false,
      remoteConsentEnabled: false,
    };
  }
}

export async function startNativeStrictFocus(input: {
  sessionId: string;
  endsAt: string | Date;
}) {
  if (!isNativeStrictFocusAvailable()) return false;
  try {
    const result = await StrictFocus.start({
      sessionId: input.sessionId,
      endsAtEpochMs: new Date(input.endsAt).getTime(),
      allowedPackages: [...DEFAULT_ANDROID_ALLOWLIST],
    });
    return result.active;
  } catch {
    return false;
  }
}

export async function stopNativeStrictFocus(sessionId: string, reason: string) {
  if (!isNativeStrictFocusAvailable()) return false;
  try {
    const result = await StrictFocus.stop({ sessionId, reason });
    return !result.active;
  } catch {
    return false;
  }
}

export async function setNativeRemoteFocusConsent(enabled: boolean) {
  if (!isNativeStrictFocusAvailable()) return false;
  try {
    await StrictFocus.setRemoteConsent({ enabled });
    return true;
  } catch {
    return false;
  }
}

export async function syncNativeFocusReceipts() {
  if (!isNativeStrictFocusAvailable()) return { synced: 0, unmatched: 0 };
  try {
    const token = localStorage.getItem("hsc-native-push-token");
    if (!token) return { synced: 0, unmatched: 0 };
    const pending = await StrictFocus.getPendingRemoteReceipts();
    if (!pending.receipts.length) return { synced: 0, unmatched: 0 };
    const response = await fetch("/api/native-devices/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, receipts: pending.receipts }),
    });
    if (!response.ok) return { synced: 0, unmatched: pending.receipts.length };
    const result = await response.json();
    await StrictFocus.clearPendingRemoteReceipts();
    return {
      synced: Number(result.matched ?? 0),
      unmatched: Number(result.unmatched ?? 0),
    };
  } catch {
    return { synced: 0, unmatched: 0 };
  }
}

export async function openNativeAccessibilitySettings() {
  if (!isNativeStrictFocusAvailable()) return false;
  try {
    await StrictFocus.openAccessibilitySettings();
    return true;
  } catch {
    return false;
  }
}

export async function openNativeAllowedApp(kind: "PHONE" | "CLOCK") {
  if (!isNativeStrictFocusAvailable()) return false;
  try {
    await StrictFocus.openAllowedApp({ kind });
    return true;
  } catch {
    return false;
  }
}
