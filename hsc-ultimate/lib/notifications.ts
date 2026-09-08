// ===================================================================
// Notification Helper — সিস্টেম নোটিফিকেশন তৈরি করার কেন্দ্রীভূত ফাংশন
// -------------------------------------------------------------------
// badge award, forum reply, best answer ইত্যাদি ঘটনায় এই ফাংশন কল
// করে ইউজারকে নোটিফাই করা হয়। silent fail করে (নোটিফিকেশন ব্যর্থ হলেও
// মূল অ্যাকশন যেন থেমে না যায়)।
// -------------------------------------------------------------------
// Push Notification ইন্টিগ্রেশন (event-driven, cron-free): In-app
// Notification তৈরি হওয়ার সাথে সাথেই একই ইভেন্টের জন্য push
// notification-ও পাঠানো হয় (ইউজারের ব্রাউজার/ডিভাইসে সাবস্ক্রিপশন
// থাকলে) — lib/push-notification.ts এর sendPushToUser() কল করা হয়।
// এতে বিদ্যমান সব call-site (badge/streak/forum/mock-exam ইত্যাদি)
// স্বয়ংক্রিয়ভাবে push এর জন্য প্রস্তুত হয়ে গেছে, কোনো নতুন কল-সাইট
// যোগ করার দরকার হয়নি।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push-notification";

interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  link?: string;
}

export async function createNotification({
  userId,
  title,
  body,
  link,
}: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId, title, body, link },
    });
  } catch (err) {
    console.error("Notification তৈরি করতে সমস্যা হয়েছে:", err);
    // silent fail — এটা secondary effect, মূল ফ্লো ব্যাহত করা ঠিক না
  }

  // Push notification আলাদাভাবে try/catch করা হয়েছে যাতে in-app
  // notification সফল হলেও push ব্যর্থ হলে (বা VAPID কনফিগার না থাকলে)
  // কোনো এরর উপরে propagate না হয়
  try {
    await sendPushToUser(userId, { title, body, link });
  } catch (err) {
    console.error("Push notification পাঠাতে সমস্যা হয়েছে:", err);
  }
}

