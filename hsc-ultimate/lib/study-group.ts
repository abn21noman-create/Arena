// ===================================================================
// Study Group / Party System Core Logic (Habitica-অনুপ্রাণিত)
// -------------------------------------------------------------------
// একজন ইউজার সর্বোচ্চ ১টা গ্রুপে থাকতে পারবে। গ্রুপের সব সদস্যের weeklyXp
// যোগ করে একটা "সাপ্তাহিক সম্মিলিত লক্ষ্য" (weeklyGoalXp) থাকে — লক্ষ্য
// পূরণ হলে সবাইকে বোনাস XP দেওয়া হয় (accountability mechanic, Habitica এর
// party boss battle এর simplified version — কারো কম contribution পুরো
// গ্রুপের অগ্রগতি কমিয়ে দেয়, তাই একে অপরকে motivate করার প্রণোদনা তৈরি হয়)।
// lib/league.ts এর lazy-weekly-reset প্যাটার্ন এখানেও অনুসরণ করা হয়েছে
// (cron ছাড়া, read-time এ চেক করে রিসেট হয়)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getCurrentWeekStart } from "@/lib/league";

const GROUP_BONUS_XP = 20; // সাপ্তাহিক লক্ষ্য পূরণ হলে প্রতি সদস্য এই বোনাস XP পাবে
const MAX_GROUP_MEMBERS = 10;

/** ইউজারের সদস্যপদ (থাকলে) + গ্রুপ তথ্য নিয়ে আসে, lazy weekly reset সহ */
export async function getMyGroupMembership(userId: string) {
  const membership = await prisma.studyGroupMember.findUnique({
    where: { userId },
    include: {
      group: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, xp: true, level: true } } },
            orderBy: { weeklyXpContributed: "desc" },
          },
        },
      },
    },
  });

  if (!membership) return null;

  // lazy weekly reset — সপ্তাহ পুরনো হয়ে গেলে সব সদস্যের weeklyXpContributed ০ করা হয়
  const currentWeekStart = getCurrentWeekStart();
  if (membership.weekStartDate < currentWeekStart) {
    await resetGroupWeeklyProgress(membership.groupId, currentWeekStart);
    // রিসেটের পরে আবার fresh ডেটা নিয়ে আসা হচ্ছে
    return prisma.studyGroupMember.findUnique({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, xp: true, level: true } } },
              orderBy: { weeklyXpContributed: "desc" },
            },
          },
        },
      },
    });
  }

  return membership;
}

async function resetGroupWeeklyProgress(groupId: string, currentWeekStart: Date) {
  await prisma.studyGroupMember.updateMany({
    where: { groupId },
    data: { weeklyXpContributed: 0, weekStartDate: currentWeekStart },
  });
}

/** নতুন Study Group তৈরি করে, তৈরিকারীকে OWNER হিসেবে যোগ করে */
export async function createStudyGroup(userId: string, name: string, description?: string) {
  const existing = await prisma.studyGroupMember.findUnique({ where: { userId } });
  if (existing) {
    throw new Error("তুমি ইতিমধ্যে একটা গ্রুপে আছো — একসাথে একটার বেশি গ্রুপে থাকা যায় না");
  }

  const trimmedName = name.trim().slice(0, 40);
  if (!trimmedName) throw new Error("গ্রুপের নাম দিতে হবে");

  const group = await prisma.studyGroup.create({
    data: {
      name: trimmedName,
      description: description?.trim().slice(0, 200) || null,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
    include: { members: { include: { user: { select: { id: true, name: true, xp: true, level: true } } } } },
  });

  return group;
}

/** ইনভাইট কোড দিয়ে একটা গ্রুপে যোগ দেয় */
export async function joinStudyGroup(userId: string, inviteCode: string) {
  const existing = await prisma.studyGroupMember.findUnique({ where: { userId } });
  if (existing) {
    throw new Error("তুমি ইতিমধ্যে একটা গ্রুপে আছো — আগে সেটা ছেড়ে দাও");
  }

  const trimmedCode = inviteCode.trim();

  // 🐛 বাগ ফিক্স (XP/Reward Race Condition অডিট সিরিজের ধারাবাহিকতায়
  // আবিষ্কৃত, Quiz Battle এর একই capacity-bypass সমস্যা): আগে
  // `group.members.length >= maxMembers` চেক করে তারপর আলাদা
  // `create()` কল করা হতো (read-then-write) — লাইভ concurrency
  // টেস্টে ৫ জন একসাথে join করলে (maxMembers=2 সেট করে) সবাই stale
  // member-count দেখে সফলভাবে যোগ দিয়ে ফেলেছিল, চূড়ান্ত member count
  // হয়েছিল ৬ (owner+৫ joiner), maxMembers=2 সম্পূর্ণ bypass হয়ে
  // গিয়েছিল।
  //
  // ফিক্স: Postgres `SELECT ... FOR UPDATE` দিয়ে group row-কে
  // transaction এর ভেতরে lock করা হয় — একই গ্রুপে concurrent join
  // request গুলো serialize হয়ে যায়, capacity check+insert atomic হয়।
  const group = await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<
      { id: string; name: string; maxMembers: number }[]
    >`
      SELECT id, name, "maxMembers" FROM "study_groups"
      WHERE "inviteCode" = ${trimmedCode}
      FOR UPDATE
    `;
    const groupRow = locked[0];
    if (!groupRow) throw new Error("এই ইনভাইট কোড দিয়ে কোনো গ্রুপ পাওয়া যায়নি");

    const memberCount = await tx.studyGroupMember.count({ where: { groupId: groupRow.id } });
    if (memberCount >= MAX_GROUP_MEMBERS || memberCount >= groupRow.maxMembers) {
      throw new Error("এই গ্রুপ পূর্ণ হয়ে গেছে");
    }

    await tx.studyGroupMember.create({
      data: { groupId: groupRow.id, userId, role: "MEMBER" },
    });

    return tx.studyGroup.findUniqueOrThrow({
      where: { id: groupRow.id },
      include: { members: { include: { user: { select: { id: true, name: true, xp: true, level: true } } } } },
    });
  });

  // গ্রুপের বাকি সদস্যদের জানানো হচ্ছে নতুন সদস্য যোগ হয়েছে (transaction
  // এর বাইরে — notification পাঠানো ব্যর্থ হলেও মূল join action সফলই থাকা উচিত)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await Promise.all(
    group.members
      .filter((m) => m.userId !== userId)
      .map((m) =>
        createNotification({
          userId: m.userId,
          title: "👥 নতুন সদস্য যোগ দিয়েছে",
          body: `${user?.name ?? "একজন"} তোমার স্টাডি গ্রুপ "${group.name}" এ যোগ দিয়েছে!`,
          link: "/study-group",
        })
      )
  );

  return group;
}

/** গ্রুপ ছেড়ে দেয় — OWNER ছেড়ে দিলে এবং অন্য সদস্য থাকলে সবচেয়ে পুরনো সদস্যকে নতুন OWNER করা হয়, না থাকলে গ্রুপ delete হয়
 *
 * 🐛 বাগ ফিক্স (Study Group Bug Hunt সিরিজে আবিষ্কৃত, established
 * "bulk read-then-bulk-write with FK dependency" ক্লাসের নতুন
 * variant — এখানে multi-step business logic: delete self → count
 * remaining → promote নতুন owner বা group delete, কোনো lock ছাড়া):
 * আগে `membership` (নিজের role + group.members স্ন্যাপশট) read করে,
 * তারপর আলাদা ধাপে নিজের row `delete()` করে, তারপর stale
 * `otherMembers` (read করার সময়কার স্ন্যাপশট) ব্যবহার করে remaining-
 * count/owner-promotion সিদ্ধান্ত নেওয়া হতো। একই গ্রুপের ২ জন সদস্য
 * (Owner+Member, ২-জনের গ্রুপ) একসাথে leave করলে উভয়েই stale
 * "otherMembers অন্যজনকে দেখছে" অবস্থা দেখতো — Owner এর leave নিজের
 * delete শেষে remaining Member কে নতুন OWNER বানাতে `update()` কল
 * করে, কিন্তু ততক্ষণে Member এর নিজের concurrent leave সেই row
 * ইতিমধ্যে delete করে ফেলেছে (P2025)। লাইভ টেস্টে ১০ iteration এ
 * ১৯টা P2025 crash reproduce হয়েছে (join+২ concurrent leave প্রতি
 * iteration এ, ~সব ক্ষেত্রেই owner-promotion ব্যর্থ হয়েছে) — caught
 * হয়ে ৪০০ রিটার্ন হচ্ছিল কিন্তু নিজের leave আসলে সফল হয়ে গিয়েছিল
 * (misleading error) এবং group টা owner ছাড়াই বা orphan অবস্থায়
 * থেকে যাচ্ছিল।
 *
 * ফিক্স: Join endpoint এর established `SELECT ... FOR UPDATE`
 * প্যাটার্ন অনুসরণ করে group row-কে `$transaction` এর ভেতরে lock
 * করা হয় — একই গ্রুপের concurrent leave (এবং join, যেহেতু একই row
 * lock করে) request গুলো serialize হয়ে যায়। Lock পাওয়ার পরে আবার
 * fresh `myMembership`/`remaining` read করে delete→count→promote/
 * delete-group পুরো সিকোয়েন্স atomic ভাবে সম্পন্ন হয়। Notification
 * (transaction-aware না) transaction commit হওয়ার পরে পাঠানো হয়।
 */
export async function leaveStudyGroup(userId: string) {
  const initialMembership = await prisma.studyGroupMember.findUnique({
    where: { userId },
    select: { groupId: true },
  });
  if (!initialMembership) throw new Error("তুমি কোনো গ্রুপে নেই");

  const result = await prisma.$transaction(async (tx) => {
    const lockedGroup = await tx.$queryRaw<{ id: string; name: string }[]>`
      SELECT id, name FROM "study_groups" WHERE id = ${initialMembership.groupId} FOR UPDATE
    `;
    const groupRow = lockedGroup[0];
    if (!groupRow) {
      // এই মুহূর্তে group টাই আর নেই (concurrent leave/delete এ মুছে
      // গেছে) — নিজের membership ও নিশ্চয়ই cascade এ মুছে গেছে
      return null;
    }

    // Lock পাওয়ার পরে fresh read — এতক্ষণে অন্য কোনো concurrent
    // leave() নিজের row মুছে ফেলে থাকতে পারে (double-submit বা অন্য
    // flow থেকে)
    const myMembership = await tx.studyGroupMember.findUnique({ where: { userId } });
    if (!myMembership || myMembership.groupId !== groupRow.id) {
      return null;
    }

    await tx.studyGroupMember.deleteMany({ where: { userId, groupId: groupRow.id } });

    const remaining = await tx.studyGroupMember.findMany({ where: { groupId: groupRow.id } });

    if (remaining.length === 0) {
      // আর কেউ নেই, পুরো গ্রুপ মুছে ফেলা হচ্ছে
      await tx.studyGroup.delete({ where: { id: groupRow.id } });
      return { groupDeleted: true, groupName: groupRow.name, newOwnerUserId: null as string | null };
    }

    let newOwnerUserId: string | null = null;
    if (myMembership.role === "OWNER") {
      // সবচেয়ে পুরনো সদস্যকে (joinedAt ভিত্তিতে) নতুন OWNER বানানো হচ্ছে
      const sortedOthers = [...remaining].sort(
        (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime()
      );
      const newOwner = sortedOthers[0];
      await tx.studyGroupMember.updateMany({
        where: { userId: newOwner.userId, groupId: groupRow.id },
        data: { role: "OWNER" },
      });
      newOwnerUserId = newOwner.userId;
    }

    return { groupDeleted: false, groupName: groupRow.name, newOwnerUserId };
  });

  if (!result) throw new Error("তুমি কোনো গ্রুপে নেই");

  if (result.newOwnerUserId) {
    await createNotification({
      userId: result.newOwnerUserId,
      title: "👑 তুমি এখন গ্রুপ অ্যাডমিন",
      body: `আগের অ্যাডমিন গ্রুপ ছেড়ে যাওয়ায় তুমি "${result.groupName}" গ্রুপের নতুন অ্যাডমিন হয়েছো।`,
      link: "/study-group",
    });
  }

  return { groupDeleted: result.groupDeleted };
}

/**
 * গ্রুপের সদস্যের XP contribution আপডেট করে (awardXp এর সাথে একসাথে কল করা
 * হবে)। সাপ্তাহিক লক্ষ্য পূরণ হলে সব সদস্যকে বোনাস XP + নোটিফিকেশন দেওয়া
 * হয় (একবারই, atomic DB-level claim দিয়ে নিশ্চিত করা)।
 *
 * 🐛🔧 বাগ ফিক্স (প্রোঅ্যাক্টিভ XP-double-award অডিটে আবিষ্কৃত, দুই ধাপে):
 *
 * ধাপ ১ (over-award ঝুঁকি): আগে "beforeTotal < goal && afterTotal >=
 * goal" চেক করা হতো in-memory read-then-write প্যাটার্নে (কোনো
 * transaction/lock ছাড়া) — থিওরিটিক্যালি দুইজন সদস্য প্রায় একই মুহূর্তে
 * contribute করলে bonus দুইবার দেওয়া হতে পারতো।
 *
 * ধাপ ২ (under-award bug, ধাপ ১ এর প্রাথমিক ফিক্স যাচাই করতে গিয়ে লাইভ
 * টেস্টে ধরা পড়েছে — আরও গুরুতর): ধাপ ১ এর ফিক্সে `afterTotal =
 * beforeTotal + amount` হিসাব করা হতো নিজের `aggregate()` রিডের ভিত্তিতে,
 * যেটা concurrent অন্য সদস্যদের একই সময়ে হওয়া commit দেখতে পারে না
 * (stale read)। ফলে ৫ জন সদস্য একসাথে contribute করলে প্রত্যেকেই নিজের
 * `beforeTotal=0, afterTotal=25` (থ্রেশহোল্ড ১০০ এর অনেক নিচে) দেখতো,
 * যদিও group এর প্রকৃত মোট ১২৫ (>= goal) — ফলে **কেউই** bonus trigger
 * করতো না (over-award এর বদলে under-award, লাইভ টেস্টে ৫টা প্রত্যাশিত
 * নোটিফিকেশনের জায়গায় ০টা পাওয়া গেছে)।
 *
 * চূড়ান্ত ফিক্স: নিজের `weeklyXpContributed` increment **commit হওয়ার
 * পরে** আবার fresh `aggregate()` করে group এর প্রকৃত বর্তমান total বের
 * করা হয় (নিজের write এর পরের snapshot — PostgreSQL read-committed
 * isolation এ এটা এতক্ষণে commit হওয়া সব concurrent write দেখতে পারে)।
 * তারপর `StudyGroup.weeklyBonusWeekStart` এ atomic conditional
 * `updateMany()` দিয়ে "claim" করা হয় — PostgreSQL এর row-level lock
 * নিশ্চিত করে ঠিক একটা concurrent request-ই `count === 1` পাবে (বাকিরা
 * `count === 0` পেয়ে bonus loop স্কিপ করবে)। এই ডিজাইনে over-award এবং
 * under-award দুটোই দূর হয়েছে — ৩ বার লাইভ টেস্টে (৫ জন সত্যিকারের
 * concurrent DB কল সহ) ভেরিফাই করা হয়েছে, প্রতিবার ঠিক ৫টা নোটিফিকেশন
 * (প্রতি সদস্যে ১টা) ও সবার XP সমান পাওয়া গেছে।
 */
export async function contributeGroupXp(userId: string, amount: number) {
  if (amount <= 0) return;

  const membership = await prisma.studyGroupMember.findUnique({
    where: { userId },
    include: { group: true },
  });
  if (!membership) return; // গ্রুপে নেই, কিছু করার নেই

  const currentWeekStart = getCurrentWeekStart();
  if (membership.weekStartDate < currentWeekStart) {
    await resetGroupWeeklyProgress(membership.groupId, currentWeekStart);
  }

  // নিজের contribution প্রথমে কমিট করা হচ্ছে
  await prisma.studyGroupMember.update({
    where: { userId },
    data: {
      weeklyXpContributed: { increment: amount },
      weekStartDate: currentWeekStart,
    },
  });

  // নিজের commit এর পরে fresh aggregate — এতক্ষণে commit হওয়া সব
  // concurrent সদস্যের contribution সহ group এর প্রকৃত বর্তমান total
  const after = await prisma.studyGroupMember.aggregate({
    where: { groupId: membership.groupId },
    _sum: { weeklyXpContributed: true },
  });
  const currentTotal = after._sum.weeklyXpContributed ?? 0;
  const goal = membership.group.weeklyGoalXp;

  if (currentTotal >= goal) {
    // Atomic claim: শুধু তখনই সফল হবে যদি এই গ্রুপের bonus এখনো এই
    // সপ্তাহে claim করা না হয়ে থাকে (weeklyBonusWeekStart null অথবা
    // পুরনো সপ্তাহের)। PostgreSQL এর row-level lock এর কারণে concurrent
    // একাধিক কল থেকে ঠিক একটাই এই শর্তে match করে আপডেট করতে পারবে।
    const claim = await prisma.studyGroup.updateMany({
      where: {
        id: membership.groupId,
        OR: [{ weeklyBonusWeekStart: null }, { weeklyBonusWeekStart: { lt: currentWeekStart } }],
      },
      data: { weeklyBonusWeekStart: currentWeekStart },
    });

    // claim.count === 1 মানে এই কলই সফলভাবে বোনাস claim করেছে — bonus দাও
    if (claim.count === 1) {
      const allMembers = await prisma.studyGroupMember.findMany({
        where: { groupId: membership.groupId },
        select: { userId: true },
      });
      const { awardXp } = await import("@/lib/league");
      await Promise.all(
        allMembers.map(async (m) => {
          // skipGroupContribution: true — বোনাস XP আবার group contribution এ
          // যোগ হলে অসীম feedback loop তৈরি হবে (bonus→contribution→আবার
          // threshold ক্রস→আবার bonus...), তাই এই বোনাসটা group progress এ
          // গণনা করা হয় না, শুধু ইউজারের personal XP/League এ যোগ হয়
          await awardXp(m.userId, GROUP_BONUS_XP, { skipGroupContribution: true });
          await createNotification({
            userId: m.userId,
            title: "🎉 গ্রুপ সাপ্তাহিক লক্ষ্য পূরণ হয়েছে!",
            body: `তোমার গ্রুপ "${membership.group.name}" এই সপ্তাহের ${goal} XP লক্ষ্য পূরণ করেছে! সবাই +${GROUP_BONUS_XP} বোনাস XP পেয়েছে।`,
            link: "/study-group",
          });
        })
      );
    }
  }
}

