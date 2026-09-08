/**
 * React hooks for Capacitor native features.
 * Use these in client components to access native APIs.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { initCapacitor, isNative, platform, network, pushNotifications, app } from "@/lib/capacitor";

/**
 * Initialize Capacitor on app mount. Use in root layout.
 */
export function useCapacitorInit(): { ready: boolean; isNative: boolean; platform: string } {
  const [ready, setReady] = useState(false);
  const [isN, setIsN] = useState(false);
  const [plat, setPlat] = useState("web");

  useEffect(() => {
    (async () => {
      await initCapacitor();
      setIsN(isNative());
      setPlat(platform());
      setReady(true);
    })();
  }, []);

  return { ready, isNative: isN, platform: plat };
}

/**
 * Register for push notifications and return device token.
 */
export function usePushNotifications(): {
  token: string | null;
  permission: "granted" | "denied" | "default";
  register: () => Promise<void>;
} {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<"granted" | "denied" | "default">("default");

  const register = useCallback(async () => {
    const result = await pushNotifications.register();
    if (result) {
      setToken(result.token);
      setPermission(result.permission);
    }
  }, []);

  return { token, permission, register };
}

/**
 * Network status (online/offline).
 */
export function useNetworkStatus(): { online: boolean } {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    network.getStatus().then((s) => setOnline(s.connected));
    const cleanup = network.onChange((connected) => setOnline(connected));
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  return { online };
}

/**
 * App info (name, version).
 */
export function useAppInfo(): { name: string; version: string; build: string; platform: string } | null {
  const [info, setInfo] = useState<ReturnType<typeof useAppInfo>>(null);

  useEffect(() => {
    app.getInfo().then(setInfo);
  }, []);

  return info;
}
