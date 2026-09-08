/**
 * CapacitorInit — Client-side component that initializes native features
 * on app mount. Use in root layout (already added).
 */
"use client";

import { useEffect } from "react";
import { initCapacitor, isNative } from "@/lib/capacitor";

export function CapacitorInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isNative()) return; // Skip in web
    initCapacitor().catch(console.error);
  }, []);

  return null;
}
