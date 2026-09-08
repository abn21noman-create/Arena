"use client";

// ===================================================================
// Push Notification — সাবস্ক্রাইব/আনসাবস্ক্রাইব কার্ড (Settings পেজে)
// -------------------------------------------------------------------
// MASTER_PLAN.md মূল ভিশনের একটা অসম্পূর্ণ আইটেম: "Push Notification
// (browser push, streak/exam reminder)"। এই কম্পোনেন্ট ব্রাউজারের
// Notification permission চায়, service worker এর মাধ্যমে
// PushManager.subscribe() কল করে VAPID public key দিয়ে, তারপর
// subscription সার্ভারে সেভ করে।
// -------------------------------------------------------------------
// components/pwa-install-prompt.tsx এর মতোই ব্রাউজার সাপোর্ট চেক করে
// (isPushSupported) — সাপোর্ট না থাকলে (যেমন কিছু iOS Safari ভার্সন,
// বা ব্রাউজার সেটিং এ ব্লক করা) UI graceful ভাবে হাইড হয়ে যায়।
// ===================================================================
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell, BellOff, Loader2, Send } from "lucide-react";
import { urlBase64ToUint8Array, isPushSupported } from "@/lib/push-client-utils";

type PermissionState = "granted" | "denied" | "default" | "unsupported";

export function PushNotificationCard() {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      if (!isPushSupported()) {
        setPermission("unsupported");
        setLoading(false);
        return;
      }

      setPermission(Notification.permission as PermissionState);

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();
        setSubscribed(!!existingSub);
      } catch {
        // silent fail — service worker এখনো রেজিস্টার না হয়ে থাকতে পারে
      } finally {
        setLoading(false);
      }
    }
    void checkStatus();
  }, []);

  async function handleSubscribe() {
    setToggling(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult as PermissionState);

      if (permissionResult !== "granted") {
        toast.error("নোটিফিকেশন অনুমতি দেওয়া হয়নি");
        return;
      }

      const keyRes = await fetch("/api/push/vapid-public-key");
      const keyData = await keyRes.json();
      if (!keyRes.ok) {
        toast.error(keyData.error ?? "পুশ নোটিফিকেশন কনফিগার করা নেই");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });

      const subJson = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      if (!res.ok) {
        toast.error("সাবস্ক্রিপশন সেভ করা যায়নি");
        return;
      }

      setSubscribed(true);
      toast.success("🔔 পুশ নোটিফিকেশন চালু হয়েছে!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setToggling(false);
    }
  }

  async function handleUnsubscribe() {
    setToggling(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      toast.success("পুশ নোটিফিকেশন বন্ধ করা হয়েছে");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setToggling(false);
    }
  }

  async function handleTestNotification() {
    setSendingTest(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "টেস্ট নোটিফিকেশন পাঠানো যায়নি");
        return;
      }
      toast.success("টেস্ট নোটিফিকেশন পাঠানো হয়েছে — চেক করো!");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSendingTest(false);
    }
  }

  if (loading) {
    return <Card className="p-6 h-24 animate-pulse bg-muted/30" />;
  }

  if (permission === "unsupported") {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <BellOff className="h-4 w-4 text-muted-foreground" />
          <Label className="font-medium text-sm">ব্রাউজার পুশ নোটিফিকেশন</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          তোমার ব্রাউজার/ডিভাইস পুশ নোটিফিকেশন সাপোর্ট করে না।
        </p>
      </Card>
    );
  }

  if (permission === "denied") {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <BellOff className="h-4 w-4 text-destructive" />
          <Label className="font-medium text-sm">ব্রাউজার পুশ নোটিফিকেশন</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          নোটিফিকেশন অনুমতি ব্লক করা আছে। চালু করতে ব্রাউজারের সাইট
          সেটিংস থেকে অনুমতি দাও।
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-primary" />
            <Label className="font-medium text-sm">ব্রাউজার পুশ নোটিফিকেশন</Label>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            ব্যাজ অর্জন, ফোরাম রিপ্লাই, streak freeze ব্যবহার ইত্যাদি
            নোটিফিকেশন এখন সরাসরি তোমার ডিভাইসে পুশ নোটিফিকেশন হিসেবেও
            আসবে (ব্রাউজার/অ্যাপ বন্ধ থাকলেও)।
          </p>
        </div>
        <Switch
          checked={subscribed}
          onCheckedChange={(checked) => (checked ? handleSubscribe() : handleUnsubscribe())}
          disabled={toggling}
        />
      </div>

      {subscribed && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={handleTestNotification}
          disabled={sendingTest}
        >
          {sendingTest ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          টেস্ট নোটিফিকেশন পাঠাও
        </Button>
      )}
    </Card>
  );
}
