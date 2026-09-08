// ===================================================================
// Admin: একজন ইউজারকে Ban/Unban করা
// PATCH /api/admin/users/[userId]/ban
// Body: { banned: boolean, reason?: string }
// -------------------------------------------------------------------
// Ban করা মানে soft-block — ইউজারের ডেটা মুছে যায় না, শুধু login
// আটকে যায় (lib/auth.ts এর authorize() এ চেক)। ভুলবশত ban হলে unban
// করলেই সব আগের মতো ফিরে আসে (destructive delete এর বিপরীতে নিরাপদ)।
//
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, established
// "P2025 500-instead-of-404" race-condition ক্লাস — Chapter/Subject/
// Topic/Question/CQQuestion/Forum/User-role-change endpoint এ আগেই
// পাওয়া গিয়েছিল ও ফিক্স হয়েছিল, কিন্তু এই Ban endpoint সেই অডিটে
// miss হয়ে গিয়েছিল): আগে `findUnique()` দিয়ে existence check করার
// পরে আলাদা `update()` কল করা হতো (read-then-write) — যদি কোনো admin
// একই সময়ে ওই ইউজারকে `DELETE /api/admin/users/[userId]` দিয়ে ডিলিট
// করে দেয় (check ও update এর মাঝের ছোট window এ), তাহলে `update()`
// P2025 ("No record was found for an update") throw করে ৪০৪ এর বদলে
// ৫০০ crash দিত। **লাইভ প্রুফ**: concurrent PATCH-ban ও DELETE একই
// userId তে পাঠিয়ে ban request ৫০০ error দিয়েছে (delete request ২০০
// সফল হয়েছে)। ফিক্স: আসল `update()` এর বদলে `updateMany({ where: {
// id: userId } })` ব্যবহার করে atomic claim — `count === 0` হলে
// ইউজার আর নেই বুঝে ৪০৪ রিটার্ন করা হয় (P2025 exception এর সুযোগই
// থাকে না, কারণ updateMany() কখনো throw করে না, শুধু matched
// count রিটার্ন করে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { userId } = await params;
  const body = await req.json().catch(() => ({}));
  const { banned, reason } = body as { banned?: boolean; reason?: string };

  if (typeof banned !== "boolean") {
    return NextResponse.json({ error: "banned (true/false) দিতে হবে" }, { status: 400 });
  }

  // নিজেকে নিজে ban করে লগইন থেকে বাদ পড়া আটকানো হচ্ছে (role-change
  // endpoint এর একই safety প্যাটার্ন)
  if (session?.user?.id === userId) {
    return NextResponse.json(
      { error: "নিজেকে নিজে ব্যান করা যাবে না" },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isBanned: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  // একজন Admin আরেকজন Admin কে ban করতে পারবে না (accidental/malicious
  // admin lockout প্রতিরোধ — শুধু role change দিয়ে আগে STUDENT বানিয়ে
  // তারপর ban করতে হবে, ইচ্ছাকৃত extra friction)
  if (targetUser.role === "ADMIN") {
    return NextResponse.json(
      { error: "অন্য Admin কে সরাসরি ব্যান করা যাবে না — আগে Student বানাও" },
      { status: 400 }
    );
  }

  // atomic claim — update() এর বদলে updateMany() ব্যবহার করে P2025
  // এড়ানো হয়েছে (উপরের কমেন্টে বিস্তারিত)
  const claimResult = await prisma.user.updateMany({
    where: { id: userId },
    data: {
      isBanned: banned,
      banReason: banned ? (reason?.trim() || "কারণ উল্লেখ করা হয়নি") : null,
      bannedAt: banned ? new Date() : null,
      bannedBy: banned ? (session?.user?.id ?? null) : null,
      authVersion: { increment: 1 },
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "এই ইউজার ইতিমধ্যে ডিলিট হয়ে গেছে" },
      { status: 404 }
    );
  }

  // findUniqueOrThrow না ব্যবহার করে findUnique (non-throwing) ব্যবহার
  // করা হয়েছে — updateMany() সফল হওয়ার পরেও (অত্যন্ত ছোট window হলেও)
  // তাত্ক্ষণিকভাবে delete হয়ে যাওয়ার তাত্ত্বিক সম্ভাবনা আছে, সেক্ষেত্রে
  // crash না করে graceful ৪০৪ রিটার্ন করা হয়
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      banReason: true,
      bannedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "ব্যান সফল হয়েছে কিন্তু ইউজার তথ্য রিফ্রেশ করার সময় সমস্যা হয়েছে" },
      { status: 404 }
    );
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: banned ? "USER_BAN" : "USER_UNBAN",
      targetType: "User",
      targetId: userId,
      metadata: { targetEmail: targetUser.email, reason: reason ?? null },
      req,
    });
  }

  return NextResponse.json({ user });
}
