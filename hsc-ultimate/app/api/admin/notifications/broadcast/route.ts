// ===================================================================
// Admin: সব ইউজারকে notification broadcast করা
// POST /api/admin/notifications/broadcast
// Body: { title, body, link? }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, লাইভ টেস্টে প্রমাণিত): আগে
// `prisma.user.findMany()` দিয়ে সব userId আনা হতো, তারপর সেই লিস্ট
// দিয়ে `prisma.notification.createMany()` কল করা হতো — এই দুই ধাপের
// মাঝের window এ (findMany() থেকে createMany() পর্যন্ত, বড় ইউজার
// বেস+ধীর network এ কয়েক সেকেন্ড পর্যন্ত লাগতে পারে) যদি কোনো ইউজার
// concurrent `DELETE /api/admin/users/[userId]` কল দিয়ে ডিলিট হয়ে
// যায়, তাহলে createMany() এর সেই userId এর FK constraint violate
// করতো (`notifications_userId_fkey`)। যেহেতু Prisma `createMany()`
// একটাই multi-row INSERT statement (all-or-nothing), একটা row এর FK
// violation পুরো ব্যাচ fail করে ৫০০ crash করতো — অর্থাৎ একজন ইউজার
// ঠিক সেই মুহূর্তে ডিলিট হলে বাকি হাজার হাজার ইউজারও কোনো notification
// পেত না। লাইভ concurrency টেস্টে (২০ iteration, padding user সহ
// broadcast ধীর করে) crash reproduce হয়েছিল।
//
// ফিক্স: read (userId লিস্ট) ও write (insert) কে একটামাত্র atomic SQL
// statement এ একত্রিত করা হয়েছে — `INSERT ... SELECT ... FROM users`।
// এতে দুই ধাপের মাঝে কোনো network round-trip window থাকে না; insert
// execution এর ঠিক সেই মুহূর্তে ডাটাবেসে যে ইউজাররা অস্তিত্বশীল (exist)
// থাকে শুধু তাদেরই notification তৈরি হয়, তাই কোনো FK violation সম্ভব না।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const { title, body: message, link } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "শিরোনাম ও বার্তা দুটোই দিতে হবে" },
      { status: 400 }
    );
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Habit/Task এর একই max-length প্যাটার্ন): আগে কোনো ব্যাকএন্ড length
  // limit ছিল না — এটা বিশেষভাবে গুরুত্বপূর্ণ কারণ broadcast সব
  // ইউজারের কাছে notification পাঠায় (ভুলবশত বিশাল টেক্সট পাঠালে সব
  // ইউজারের জন্য বড় notification row তৈরি হয়ে যেত, storage multiply
  // হয়ে যায় ইউজার সংখ্যা দিয়ে)।
  if (title.trim().length > 100) {
    return NextResponse.json(
      { error: "শিরোনাম খুব বড় (সর্বোচ্চ ১০০ অক্ষর)" },
      { status: 400 }
    );
  }
  if (message.trim().length > 1000) {
    return NextResponse.json(
      { error: "বার্তা খুব বড় (সর্বোচ্চ ১০০০ অক্ষর)" },
      { status: 400 }
    );
  }

  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();
  const trimmedLink = link?.trim() || null;

  // atomic INSERT ... SELECT — read (userId লিস্ট) ও write (insert)
  // একই SQL statement এ, কোনো read-then-write race window নেই
  const insertedCount = await prisma.$executeRaw`
    INSERT INTO notifications (id, "userId", title, body, link, read, "createdAt")
    SELECT gen_random_uuid()::text, id, ${trimmedTitle}, ${trimmedMessage}, ${trimmedLink}, false, now()
    FROM users
  `;

  if (insertedCount === 0) {
    return NextResponse.json(
      { error: "কোনো ইউজার পাওয়া যায়নি" },
      { status: 400 }
    );
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "NOTIFICATION_BROADCAST",
      metadata: { title: trimmedTitle, recipientCount: insertedCount },
      req,
    });
  }

  return NextResponse.json({ success: true, sentCount: insertedCount });
}
