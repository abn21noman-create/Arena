"use client";

// ===================================================================
// PWA Service Worker Registration — শুধু production build এ কাজ করে
// -------------------------------------------------------------------
// Development মোডে service worker রেজিস্টার করা হয় না কারণ Turbopack
// এর HMR (Hot Module Reload) এর সাথে conflict করতে পারে, এবং dev এ
// caching আসলেই সমস্যা তৈরি করতে পারে (পুরনো কোড cache হয়ে যাওয়া)।
// ===================================================================
import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => {
        console.error("Service Worker রেজিস্ট্রেশন ব্যর্থ হয়েছে:", err);
      });
  }, []);

  return null;
}
