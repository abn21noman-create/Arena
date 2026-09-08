// ===================================================================
// Push Notification — নিজের ডিভাইসে একটা টেস্ট নোটিফিকেশন পাঠানো
// POST /api/push/test
// -------------------------------------------------------------------
// Settings পেজে "টেস্ট নোটিফিকেশন পাঠাও" বাটনের জন্য — ইউজার subscribe
// করার পরে নিশ্চিত হতে পারে সবকিছু ঠিকভাবে কাজ করছে কিনা (in-app
// Notification তৈরি হয় না, শুধু push — তাই এটা lib/notifications.ts
// এর createNotification() ব্যবহার করে না, সরাসরি sendPushToUser() কল করে)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push-notification";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const subscriptionCount = await prisma.pushSubscription.count({
    where: { userId: session.user.id },
  });

  if (subscriptionCount === 0) {
    return NextResponse.json(
      { error: "কোনো ডিভাইসে সাবস্ক্রিপশন নেই, আগে পুশ নোটিফিকেশন চালু করো" },
      { status: 400 }
    );
  }

  await sendPushToUser(session.user.id, {
    title: "🔔 HSC Ultimate টেস্ট নোটিফিকেশন",
    body: "দারুণ! তোমার পুশ নোটিফিকেশন ঠিকভাবে কাজ করছে।",
    link: "/dashboard",
  });

  return NextResponse.json({ success: true });
}
