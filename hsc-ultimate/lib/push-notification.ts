// ===================================================================
// Push Notification — Core Server-Side Logic (Web Push API, VAPID)
// -------------------------------------------------------------------
// MASTER_PLAN.md এর মূল ভিশনের একটা অসম্পূর্ণ আইটেম: "Push Notification
// (browser push, streak/exam reminder)" — এই সেশনে বাস্তবায়ন।
//
// ডিজাইন — কোনো cron job লাগে না (event-driven):
// বিদ্যমান `createNotification()` (lib/notifications.ts) ফাংশন যেখানে
// যেখানে কল হয় (badge award, forum reply, streak freeze, best answer
// ইত্যাদি) — সবগুলো জায়গাতেই এখন স্বয়ংক্রিয়ভাবে push notification-ও
// পাঠানো হবে, কারণ `sendPushToUser()` কল করা হয়েছে `createNotification()`
// এর ভেতর থেকেই। তাই নতুন কোনো call-site যোগ করার দরকার নেই — বিদ্যমান
// ১০+ জায়গার সব notification event এখনই push এর জন্য প্রস্তুত।
//
// Web Push সম্পূর্ণ ফ্রি (VAPID, কোনো তৃতীয় পক্ষ সাবস্ক্রিপশন সার্ভিস
// লাগে না) — `web-push` npm প্যাকেজ ব্যবহার করা হয়েছে।
// ===================================================================
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:hscultimate@example.com";

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn(
      "Push Notification কনফিগার করা নেই (VAPID keys .env.local এ নেই) — push skip হচ্ছে"
    );
    return false;
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  isConfigured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  link?: string;
}

export interface PushDeliveryResult {
  configured: boolean;
  subscriptions: number;
  sent: number;
  failed: number;
  removedInvalid: number;
}

/** Sends web push and reports the real per-subscription outcome. */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<PushDeliveryResult> {
  if (!ensureConfigured()) {
    return { configured: false, subscriptions: 0, sent: 0, failed: 0, removedInvalid: 0 };
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
    if (subscriptions.length === 0) {
      return { configured: true, subscriptions: 0, sent: 0, failed: 0, removedInvalid: 0 };
    }
    const payloadStr = JSON.stringify(payload);
    const outcomes = await Promise.all(
      subscriptions.map(async (sub): Promise<"sent" | "failed" | "removed"> => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payloadStr
          );
          return "sent";
        } catch (err) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
            return "removed";
          }
          console.error("Push notification পাঠাতে সমস্যা হয়েছে");
          return "failed";
        }
      })
    );
    return {
      configured: true,
      subscriptions: subscriptions.length,
      sent: outcomes.filter((outcome) => outcome === "sent").length,
      failed: outcomes.filter((outcome) => outcome === "failed").length,
      removedInvalid: outcomes.filter((outcome) => outcome === "removed").length,
    };
  } catch {
    console.error("sendPushToUser pipeline ব্যর্থ হয়েছে");
    return { configured: true, subscriptions: 0, sent: 0, failed: 1, removedInvalid: 0 };
  }
}

export function getVapidPublicKey(): string | null {
  return VAPID_PUBLIC_KEY ?? null;
}
