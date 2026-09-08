// ===================================================================
// Unread Notification Count — শুধু সংখ্যা (lightweight, ঘন ঘন পোলিং এর জন্য)
// GET /api/notifications/unread-count
// -------------------------------------------------------------------
// NotificationBell প্রতি ৩০ সেকেন্ডে ব্যাকগ্রাউন্ডে unread count চেক করে,
// আগে পুরো /api/notifications endpoint কল করা হতো যেটা সাম্প্রতিক ৩০টা
// নোটিফিকেশনের সম্পূর্ণ রেকর্ড (title/body/link) সহ আনত — অপ্রয়োজনীয়
// ডেটা ট্রান্সফার (dropdown বন্ধ থাকা অবস্থাতেও)। এই আলাদা endpoint শুধু
// COUNT কোয়েরি চালায়, dropdown খোলার সময়ই পুরো লিস্ট আনা হয়।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return NextResponse.json({ unreadCount });
}
