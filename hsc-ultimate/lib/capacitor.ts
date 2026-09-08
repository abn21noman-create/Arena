/**
 * Capacitor Native Bridge — Push Notifications + Native APIs
 *
 * This module wraps Capacitor plugins so the Next.js web app can use native
 * features on Android/Windows builds. When running in a browser (PWA/dev),
 * it gracefully falls back to web APIs.
 *
 * Usage:
 *   import { initCapacitor, pushNotifications, haptics, network } from "@/lib/capacitor";
 *   await initCapacitor();
 *   await pushNotifications.register();
 *   await haptics.impact("medium");
 */
import { Capacitor } from "@capacitor/core";

// Detect if running in native (Capacitor) vs web
export const isNative = (): boolean => {
  if (typeof window === "undefined") return false;
  return Capacitor.isNativePlatform();
};

export const platform = (): "ios" | "android" | "web" => {
  if (typeof window === "undefined") return "web";
  return Capacitor.getPlatform() as "ios" | "android" | "web";
};

// ==================== Initialization ====================

let initialized = false;

export async function initCapacitor(): Promise<void> {
  if (initialized) return;
  if (!isNative()) {
    console.log("[Capacitor] Running in web mode — native APIs unavailable");
    initialized = true;
    return;
  }
  console.log(`[Capacitor] Initialized for platform: ${platform()}`);

  // Initialize StatusBar
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a0a0f" });
  } catch (e) {
    console.warn("[Capacitor] StatusBar not available:", e);
  }

  // Initialize SplashScreen (auto-hide)
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    // Splash already hidden by default config
  }

  // Listen for app state changes
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("appStateChange", ({ isActive }) => {
      console.log(`[Capacitor] App ${isActive ? "active" : "background"}`);
      // TODO: Pause/resume background sync, save state, etc.
    });

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (e) {
    console.warn("[Capacitor] App events not available:", e);
  }

  initialized = true;
}

// ==================== Push Notifications ====================

export const pushNotifications = {
  /**
   * Request permission and register for push notifications.
   * Returns the FCM/APNs device token to send to backend.
   */
  async register(): Promise<{ token: string; permission: "granted" | "denied" } | null> {
    if (!isNative()) {
      // Web fallback — use Web Push API (already configured with VAPID)
      if ("Notification" in window && "serviceWorker" in navigator) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          return { token: "", permission: "denied" };
        }
        // Use existing VAPID subscription from service worker
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          return { token: JSON.stringify(sub), permission: "granted" };
        }
      }
      return null;
    }

    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      // Request permission (iOS only, Android 13+)
      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive === "denied") {
        console.warn("[Push] Permission denied");
        return { token: "", permission: "denied" };
      }

      // Register with FCM/APNs
      await PushNotifications.register();

      // Wait for token
      return new Promise((resolve) => {
        PushNotifications.addListener("registration", async (token) => {
          try {
            localStorage.setItem("hsc-native-push-token", token.value);
            const { App } = await import("@capacitor/app");
            const appInfo = await App.getInfo().catch(() => null);
            const response = await fetch("/api/native-devices", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: token.value,
                platform: "android",
                appVersion: appInfo?.version,
              }),
            });
            if (response.ok) {
              const data = await response.json();
              if (data.device?.id) {
                localStorage.setItem("hsc-native-device-id", data.device.id);
              }
            }
          } catch {
            // Registration will be retried from Strict Focus settings.
          }
          resolve({ token: token.value, permission: "granted" });
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("[Push] Registration error:", err);
          resolve(null);
        });
      });
    } catch (e) {
      console.error("[Push] Plugin not available:", e);
      return null;
    }
  },

  /**
   * Get delivered notifications (notification center).
   */
  async getDelivered(): Promise<unknown[]> {
    if (!isNative()) return [];
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const result = await PushNotifications.getDeliveredNotifications();
      return result.notifications;
    } catch {
      return [];
    }
  },

  /**
   * Remove a specific notification by id.
   */
  async remove(id: string): Promise<void> {
    if (!isNative()) return;
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      await PushNotifications.removeDeliveredNotifications({ notifications: [{ id, data: {} as Record<string, string> }] });
    } catch (e) {
      console.warn("[Push] Failed to remove notification:", e);
    }
  },
};

// ==================== Haptics ====================

export const haptics = {
  async impact(style: "light" | "medium" | "heavy" = "medium"): Promise<void> {
    if (!isNative()) {
      if ("vibrate" in navigator) navigator.vibrate(10);
      return;
    }
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      const styleMap = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
      await Haptics.impact({ style: styleMap[style] });
    } catch {
      if ("vibrate" in navigator) navigator.vibrate(10);
    }
  },

  async notification(type: "success" | "warning" | "error" = "success"): Promise<void> {
    if (!isNative()) {
      if ("vibrate" in navigator) navigator.vibrate(type === "error" ? [50, 50, 50] : 30);
      return;
    }
    try {
      const { Haptics, NotificationType } = await import("@capacitor/haptics");
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };
      await Haptics.notification({ type: typeMap[type] });
    } catch {
      if ("vibrate" in navigator) navigator.vibrate(30);
    }
  },

  async selection(): Promise<void> {
    if (!isNative()) {
      if ("vibrate" in navigator) navigator.vibrate(5);
      return;
    }
    try {
      const { Haptics } = await import("@capacitor/haptics");
      await Haptics.selectionStart();
    } catch {}
  },
};

// ==================== Network ====================

export const network = {
  async getStatus(): Promise<{ connected: boolean; type: string }> {
    if (!isNative()) {
      return { connected: navigator.onLine, type: "unknown" };
    }
    try {
      const { Network } = await import("@capacitor/network");
      const status = await Network.getStatus();
      return { connected: status.connected, type: status.connectionType };
    } catch {
      return { connected: navigator.onLine, type: "unknown" };
    }
  },

  onChange(callback: (connected: boolean) => void): () => void {
    if (!isNative()) {
      const onlineHandler = () => callback(true);
      const offlineHandler = () => callback(false);
      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);
      return () => {
        window.removeEventListener("online", onlineHandler);
        window.removeEventListener("offline", offlineHandler);
      };
    }
    (async () => {
      try {
        const { Network } = await import("@capacitor/network");
        const handler = await Network.addListener("networkStatusChange", (status) => {
          callback(status.connected);
        });
        return () => { handler.remove(); };
      } catch {
        return () => {};
      }
    })();
    return () => {};
  },
};

// ==================== Preferences (persistent storage) ====================

export const prefs = {
  async set(key: string, value: string): Promise<void> {
    if (!isNative()) {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key, value });
    } catch {
      try { localStorage.setItem(key, value); } catch {}
    }
  },

  async get(key: string): Promise<string | null> {
    if (!isNative()) {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      try { return localStorage.getItem(key); } catch { return null; }
    }
  },

  async remove(key: string): Promise<void> {
    if (!isNative()) {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.remove({ key });
    } catch {
      try { localStorage.removeItem(key); } catch {}
    }
  },
};

// ==================== Share ====================

export const share = {
  async share(opts: { title?: string; text?: string; url?: string; dialogTitle?: string }): Promise<void> {
    // Try Web Share API first (works in PWA + modern browsers)
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(opts);
        return;
      } catch {
        // User cancelled or not supported, fall through
      }
    }
    if (!isNative()) return;
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share(opts);
    } catch (e) {
      console.warn("[Share] failed:", e);
    }
  },
};

// ==================== App Info ====================

export const app = {
  async getInfo(): Promise<{ name: string; version: string; build: string; platform: string }> {
    if (!isNative()) {
      return { name: "HSC Ultimate", version: "0.1.0", build: "web", platform: "web" };
    }
    try {
      const { App } = await import("@capacitor/app");
      const info = await App.getInfo();
      return { name: info.name, version: info.version, build: info.build, platform: Capacitor.getPlatform() };
    } catch {
      return { name: "HSC Ultimate", version: "0.1.0", build: "?", platform: "?" };
    }
  },

  async openUrl(url: string): Promise<void> {
    if (!isNative()) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url });
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  },
};

const capacitorUtils = {
  isNative,
  platform,
  init: initCapacitor,
  pushNotifications,
  haptics,
  network,
  prefs,
  share,
  app,
};

export default capacitorUtils;
