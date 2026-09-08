// ===================================================================
// Notification Read/Delete API
// PATCH  /api/notifications/[notificationId] — read মার্ক করা
// DELETE /api/notifications/[notificationId] — মুছে ফেলা
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, Admin User Ban/Role-Change এর একই
// "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, লাইভ টেস্টে
// প্রমাণিত): আগে existence+ownership check (`findUnique`) করার পরে
// আলাদা ধাপে `update()`/`delete()` কল করা হতো — concurrent `PATCH`
// ও `DELETE` একই notification এ একসাথে পাঠালে check ও write এর
// মাঝের ছোট window এ একটা request অন্যটাকে delete করে দিলে, বাকি
// request টা (বিশেষত PATCH) Prisma P2025 ("No record was found for
// an update") throw করে ৫০০ crash করতো। লাইভ টেস্টে সরাসরি reproduce
// হয়েছে। ফিক্স: `update()` এর বদলে atomic `updateMany({ where: {
// id, userId } })` claim — matched count 0 হলে ৪০৪ (নিজের ownership
// চেক-ও একই where ক্লজে atomic ভাবে হয়ে যায়, আলাদা ownership চেক আর
// দরকার নেই)। `delete()` নিজে idempotent-নিরাপদ করার জন্য
// `deleteMany()` ব্যবহার করা হয়েছে (matched 0 হলেও চুপচাপ সফল ধরে
// নেওয়া হয় — ইতিমধ্যে ডিলিট হয়ে যাওয়া জিনিস আবার ডিলিট করতে চাওয়া
// idempotent হওয়া উচিত, এরর দেখানোর দরকার নেই)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { notificationId } = await params;

  // atomic claim — id ও userId দুটোই একই where ক্লজে থাকায় ownership
  // চেক ও existence চেক একসাথে atomic ভাবে হয়ে যায়, কোনো race window
  // থাকে না
  const claimResult = await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "নোটিফিকেশন পাওয়া যায়নি" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { notificationId } = await params;

  const claimResult = await prisma.notification.deleteMany({
    where: { id: notificationId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "নোটিফিকেশন পাওয়া যায়নি" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

