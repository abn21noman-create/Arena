// ===================================================================
// একটা Task আপডেট/ডিলিট করার API
// PATCH  /api/tasks/[taskId]  -> status/priority/title আপডেট
// DELETE /api/tasks/[taskId]  -> ডিলিট
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak } from "@/lib/streak";
import { checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { MAX_TASK_TITLE_LENGTH, MAX_TASK_DESCRIPTION_LENGTH } from "@/app/api/tasks/route";
import { isValidEnumValue, VALID_TASK_PRIORITIES, VALID_TASK_STATUSES } from "@/lib/enum-validation";
import { isValidDateString } from "@/lib/date-validation";

async function verifyOwnership(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  return task && task.userId === userId ? task : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { taskId } = await params;
  const existing = await verifyOwnership(taskId, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "টাস্ক পাওয়া যায়নি" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, description, dueDate, priority, status } = body;

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // POST endpoint এর মতো এখানেও max-length missing ছিল): PATCH এও
  // title/description এর জন্য একই limit প্রয়োগ করা হয়েছে (POST route
  // থেকে ইম্পোর্ট করে DRY রাখা হয়েছে)।
  if (title !== undefined && title.trim().length > MAX_TASK_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `টাস্কের নাম খুব বড় (সর্বোচ্চ ${MAX_TASK_TITLE_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }
  if (
    description !== undefined &&
    description?.trim() &&
    description.trim().length > MAX_TASK_DESCRIPTION_LENGTH
  ) {
    return NextResponse.json(
      { error: `বিবরণ খুব বড় (সর্বোচ্চ ${MAX_TASK_DESCRIPTION_LENGTH} অক্ষর)` },
      { status: 400 }
    );
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // POST endpoint এর একই enum-validation missing প্যাটার্ন): PATCH এ
  // priority/status অজানা ভ্যালু দিলে Prisma update() এ P2xxx না,
  // বরং `PrismaClientValidationError` throw করতো (৫০০ crash)।
  if (!isValidEnumValue(priority, VALID_TASK_PRIORITIES)) {
    return NextResponse.json({ error: "সঠিক priority (LOW/MEDIUM/HIGH) দিন" }, { status: 400 });
  }
  if (!isValidEnumValue(status, VALID_TASK_STATUSES)) {
    return NextResponse.json({ error: "সঠিক status (TODO/IN_PROGRESS/DONE) দিন" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // POST endpoint এর একই date-validation missing প্যাটার্ন): অবৈধ
  // dueDate স্ট্রিং দিলে `new Date()` Invalid Date বানায়, Prisma
  // update() এ পাস করলে `PrismaClientValidationError` throw করে
  // ৫০০ crash করতো।
  if (!isValidDateString(dueDate)) {
    return NextResponse.json({ error: "সঠিক তারিখ দিন" }, { status: 400 });
  }

  // 🐛 বাগ ফিক্স ধাপ ১ (আগে Documentation Debt এ known limitation হিসেবে
  // চিহ্নিত ছিল): আগে শুধু "আগের status DONE ছিল কিনা" (wasCompleted)
  // চেক হতো, যেটা শুধু একই status এ বারবার PATCH করা ঠেকাত (DONE→DONE
  // আবার পাঠালে ডাবল XP হতো না) — কিন্তু TODO→DONE→TODO→DONE এভাবে
  // toggle করলে প্রতিবার "আগে DONE ছিল না" শর্ত সত্যি হয়ে যেত, ফলে
  // প্রতিবার নতুন XP পাওয়া যেত (XP farming সম্ভব ছিল)। `Task.xpAwarded`
  // ফ্ল্যাগ যোগ করে এটা ফিক্স করা হয়েছিল।
  //
  // 🐛 বাগ ফিক্স ধাপ ২ (Forum Best Answer XP Farming বাগ অডিটের সময়
  // আবিষ্কৃত, একই ক্লাসের সমস্যা): ধাপ ১ এর ফিক্স read-then-write
  // প্যাটার্নে ছিল (`verifyOwnership()` দিয়ে read করে `existing.xpAwarded`
  // চেক করে, পরে আলাদা `update()` কল) — এটা race condition এর ঝুঁকিতে
  // ছিল। লাইভ টেস্টে ৫টা concurrent PATCH request পাঠিয়ে ২৫ XP পাওয়া
  // গেছে (প্রত্যাশিত ৫, প্রতিটা request stale `xpAwarded=false` দেখে
  // award করে ফেলেছে)। ফিক্স: single atomic
  // `UPDATE ... WHERE id=? AND xpAwarded=false` স্টেটমেন্ট দিয়ে
  // check+set একসাথে করা হয়েছে (Postgres row-level lock guarantee) —
  // শুধু matched (count>0) হলেই XP দেওয়া হয়।
  //
  // 🐛 বাগ ফিক্স ধাপ ৩ (Race Condition, Study Plan Item এর একই
  // "xpAwarded claim atomic করা সত্ত্বেও চূড়ান্ত write raw" ক্লাস, এই
  // সেশনে broad grep audit এ আবিষ্কৃত): ধাপ ২ এর xpAwarded claim এর
  // পরেও নিচে আলাদা raw `task.update({ where: { id: taskId } })` কল
  // করা হতো। concurrent `DELETE /api/tasks/[taskId]` (একই ইউজার
  // দুইটা ট্যাব/দ্রুত ডাবল-ক্লিক থেকে) এই টাস্ক মুছে দিলে এই
  // `update()` P2025 throw করে ৫০০ crash করতো। লাইভ টেস্টে concurrent
  // PATCH+DELETE পাঠিয়ে ৭/৮ (৮৭.৫%) iteration এ crash প্রমাণিত
  // হয়েছে। ফিক্স: চূড়ান্ত `update()` এর বদলে atomic `updateMany({
  // where: { id: taskId } })` ব্যবহার করা হয়েছে — matched count 0
  // হলে গ্রেসফুল ৪০৪ (কোনো crash সম্ভব না)।
  const willBeCompleted = status === "DONE";
  let shouldAwardXp = false;

  if (willBeCompleted) {
    const xpClaimResult = await prisma.task.updateMany({
      where: { id: taskId, userId: session.user.id, xpAwarded: false },
      data: { xpAwarded: true },
    });
    shouldAwardXp = xpClaimResult.count > 0;
  }

  const updateResult = await prisma.task.updateMany({
    where: { id: taskId, userId: session.user.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "টাস্ক পাওয়া যায়নি" }, { status: 404 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    // অত্যন্ত ছোট window হলেও updateMany() সফল হওয়ার ঠিক পরে delete
    // হয়ে যাওয়ার তাত্ত্বিক সম্ভাবনা আছে, crash না করে গ্রেসফুল ৪০৪
    return NextResponse.json({ error: "টাস্ক পাওয়া যায়নি" }, { status: 404 });
  }

  // টাস্ক সম্পূর্ণ করলে ছোট XP reward (সারাজীবনে একবারই এই টাস্কের জন্য,
  // বার বার toggle করে XP farm করা সম্পূর্ণভাবে ঠেকানো হয়েছে)
  let newBadges: { code: string; name: string; iconEmoji: string }[] = [];
  if (shouldAwardXp) {
    await awardXp(session.user.id, 5);
    await updateStreak(session.user.id);
    const awarded = await checkAndAwardBadges(session.user.id);
    newBadges = awarded.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji }));
  }

  return NextResponse.json({ task, newBadges });
}

// ===================================================================
// 🐛 বাগ ফিক্স (Race Condition, একই "existence check থাকা সত্ত্বেও
// read-then-write" ক্লাস — একই ফাইলে PATCH এর মতো এখানেও): আগে
// `verifyOwnership()` করার পরে আলাদা raw `task.delete()` কল করা হতো।
// concurrent double-DELETE (দ্রুত দুইবার click, বা দুইটা ট্যাব থেকে)
// করলে দ্বিতীয়টা P2025 throw করে ৫০০ crash করতো। লাইভ টেস্টে ৮/৮
// (১০০%) iteration এ crash প্রমাণিত হয়েছে। ফিক্স: `delete()` এর
// বদলে atomic `deleteMany({ where: { id, userId } })` (ownership
// double-check সহ) — কখনো throw করে না।
// ===================================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { taskId } = await params;

  const claimResult = await prisma.task.deleteMany({
    where: { id: taskId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "টাস্ক পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

