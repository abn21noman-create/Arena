// ===================================================================
// Admin: একটা ইউজারের role পরিবর্তন করা
// PATCH /api/admin/users/[userId]
// Body: { role: "STUDENT" | "ADMIN" }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Chapter/Subject/Topic/Question/CQQuestion/Forum এর সাথে
// একই bug pattern, প্রোঅ্যাক্টিভ সিস্টেমেটিক অডিটে ধরা পড়েছে): আগে
// `previousUser` fetch করা হতো কিন্তু null চেক না করেই সরাসরি
// `update` কল করা হতো — অস্তিত্বহীন userId দিলে Prisma `update`
// P2025 throw করতো (৪০৪ এর বদলে ৫০০)।
//
// 🐛 বাগ ফিক্স #২ (এই একই ফাইলে পরে আবিষ্কৃত, Ban endpoint এর একই
// race-condition ক্লাস): existence check (`findUnique`) থাকলেও এটা
// এখনো read-then-write প্যাটার্ন — যদি concurrent `DELETE
// /api/admin/users/[userId]` কল একই মুহূর্তে ওই ইউজারকে ডিলিট করে
// দেয় (check ও update এর মাঝের window এ), তাহলে নিচের `update()`
// P2025 throw করতে পারে (৫০০ crash)। ম্যানুয়াল race টেস্টে (১০ বার
// concurrent role-change+delete) এই bug reproduce করা যায়নি (delete
// cascade ৩০+ টেবিলে বেশি সময় নেয় বলে role-update সবসময় আগে শেষ হয়ে
// যাচ্ছিল), কিন্তু Ban endpoint এ একই প্যাটার্নে সফলভাবে reproduce
// হয়েছিল — তাই consistency ও ভবিষ্যৎ নিরাপত্তার জন্য প্রতিরোধমূলকভাবে
// (defensive) একই `updateMany()` atomic-claim fix এখানেও প্রয়োগ করা
// হয়েছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { deleteUserAccount } from "@/lib/account-privacy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { userId } = await params;
  const body = await req.json().catch(() => ({}));
  const { role } = body;

  if (!["STUDENT", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "সঠিক role দিন" }, { status: 400 });
  }

  // নিজের role নিজে পরিবর্তন করে দুর্ঘটনাক্রমে নিজেকে admin থেকে বাদ দেওয়া আটকানো হচ্ছে
  if (session?.user?.id === userId) {
    return NextResponse.json(
      { error: "নিজের role নিজে পরিবর্তন করা যাবে না" },
      { status: 400 }
    );
  }

  const previousUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!previousUser) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  // atomic claim — update() এর বদলে updateMany() ব্যবহার করে P2025
  // এড়ানো হয়েছে (উপরের কমেন্টে বিস্তারিত)
  const claimResult = await prisma.user.updateMany({
    where: { id: userId },
    data: {
      role,
      authVersion: { increment: 1 },
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json(
      { error: "এই ইউজার ইতিমধ্যে ডিলিট হয়ে গেছে" },
      { status: 404 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      hscBatch: true,
      board: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Role পরিবর্তন সফল হয়েছে কিন্তু ইউজার তথ্য রিফ্রেশ করার সময় সমস্যা হয়েছে" },
      { status: 404 }
    );
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "USER_ROLE_CHANGE",
      targetType: "User",
      targetId: userId,
      metadata: { previousRole: previousUser?.role, newRole: role, targetEmail: user.email },
      req,
    });
  }

  return NextResponse.json({ user });
}

// ===================================================================
// Admin: একজন ইউজারের অ্যাকাউন্ট সম্পূর্ণভাবে ডিলিট করা (destructive,
// irreversible)
// DELETE /api/admin/users/[userId]
// -------------------------------------------------------------------
// ইউজার নিজের `/api/user/delete-account` এর মতোই
// `deleteUserAccount()` (lib/account-privacy.ts) পুনর্ব্যবহার করা
// হয়েছে — cascade delete সব একই ভাবে কাজ করে (৩০+টা টেবিল)। পার্থক্য:
// এখানে ইউজারের নিজের পাসওয়ার্ড ভেরিফাই করার দরকার নেই (admin অন্যের
// পক্ষ থেকে করছে), কিন্তু নিজেকে নিজে ডিলিট করা আটকানো হয়েছে
// (role-change endpoint এর একই safety প্যাটার্ন — ভুলবশত নিজের
// অ্যাকাউন্ট হারানো ঠেকাতে)।
// ===================================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const { userId } = await params;

  if (session?.user?.id === userId) {
    return NextResponse.json(
      { error: "নিজের অ্যাকাউন্ট নিজে ডিলিট করা যাবে না" },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  try {
    await deleteUserAccount(userId);
  } catch (err) {
    if (err instanceof Error && err.message === "ACCOUNT_ALREADY_DELETED") {
      // অন্য কোনো concurrent request (যেমন ইউজার নিজেই একই সময়ে
      // নিজের অ্যাকাউন্ট ডিলিট করে ফেলেছে) ততক্ষণে এই ইউজারকে
      // ডিলিট করে ফেলেছে
      return NextResponse.json({ error: "এই ইউজার ইতিমধ্যে ডিলিট হয়ে গেছে" }, { status: 404 });
    }
    console.error("Admin User Delete Error:", err);
    return NextResponse.json(
      { error: "ইউজার ডিলিট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "USER_DELETE",
      targetType: "DeletedUser",
      metadata: { targetRole: targetUser.role, targetDataRedacted: true },
      req,
    });
  }

  return NextResponse.json({ deleted: true });
}

