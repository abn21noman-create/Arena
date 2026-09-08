// ===================================================================
// Study Pet Core Logic — Forest/Study Bunny-অনুপ্রাণিত Virtual Pet
// Pomodoro Gamification
// -------------------------------------------------------------------
// ডিজাইন দর্শন: প্রতিটা সম্পূর্ণ পোমোডোরো সেশন পেটের "carePoints" বাড়ায়,
// যা পেটকে ৫টা evolution stage এর মধ্য দিয়ে বড় করে তোলে (Egg→Hatchling→
// Owlet→Adult→Sage — একটা পেঁচা, বাংলাদেশে জ্ঞানের প্রতীক হিসেবে পরিচিত)।
// এছাড়া "happiness" স্ট্যাট আছে যা প্রতিদিন একটু কমে (miss করলে পেট মন খারাপ
// করে, কিন্তু কখনো "মারা" যায় না — Duolingo streak এর মতো কঠোর penalty না
// দিয়ে Finch app এর "non-punishing" দর্শন অনুসরণ করা হয়েছে, যাতে anxiety
// তৈরি না হয়)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import type { PetStage } from "@prisma/client";

export const PET_STAGE_ORDER: PetStage[] = ["EGG", "HATCHLING", "OWLET", "ADULT", "SAGE"];

export const PET_STAGE_INFO: Record<
  PetStage,
  { label: string; emoji: string; threshold: number; description: string }
> = {
  EGG: {
    label: "ডিম",
    emoji: "🥚",
    threshold: 0,
    description: "একটা রহস্যময় ডিম — নিয়মিত পোমোডোরো সেশন দিয়ে এটাকে ফোটাও!",
  },
  HATCHLING: {
    label: "ছানা পেঁচা",
    emoji: "🐣",
    threshold: 4, // ৪টা সেশন (~১০০ মিনিট ফোকাস) পরে ডিম ফুটে বাচ্চা বের হয়
    description: "সদ্য ডিম ফুটে বের হয়েছে! এখনো চোখ পুরোপুরি খোলেনি।",
  },
  OWLET: {
    label: "কিশোর পেঁচা",
    emoji: "🦉",
    threshold: 12,
    description: "ডানা গজাতে শুরু করেছে, উড়তে শিখছে!",
  },
  ADULT: {
    label: "পূর্ণবয়স্ক পেঁচা",
    emoji: "🦉✨",
    threshold: 30,
    description: "পূর্ণবয়স্ক জ্ঞানী পেঁচা — তোমার নিয়মিত পরিশ্রমের ফসল!",
  },
  SAGE: {
    label: "ঋষি পেঁচা",
    emoji: "🦉👑",
    threshold: 60,
    description: "সর্বোচ্চ স্তরে পৌঁছে গেছে — তুমি সত্যিকারের একজন Dedicated Learner!",
  },
};

// প্রতি সম্পূর্ণ পোমোডোরো সেশনে এত carePoints ও happiness যোগ হয়
const CARE_POINTS_PER_SESSION = 1;
const HAPPINESS_GAIN_PER_SESSION = 15;
const MAX_HAPPINESS = 100;
// প্রতিদিন (miss হলে) happiness এত কমে (কঠোর না, ধীরে ধীরে কমে)
const HAPPINESS_DECAY_PER_DAY = 5;
const MIN_HAPPINESS = 20; // কখনো এর নিচে নামবে না (anxiety-inducing না করার জন্য)

function daysBetween(a: Date, b: Date): number {
  const startOfA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const startOfB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((startOfB.getTime() - startOfA.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateStage(carePoints: number): PetStage {
  let stage: PetStage = "EGG";
  for (const s of PET_STAGE_ORDER) {
    if (carePoints >= PET_STAGE_INFO[s].threshold) stage = s;
  }
  return stage;
}

/**
 * নির্দিষ্ট ইউজারের StudyPet নিয়ে আসে, না থাকলে নতুন তৈরি করে (lazy creation)।
 *
 * 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, Forum Vote/Forum
 * Report এর একই race-condition ক্লাস — "lazy create on unique field"):
 * আগে `findUnique()` দিয়ে চেক করে `null` হলে `create()` কল করা হতো —
 * নতুন ইউজারের প্রথমবার `/api/study-pet` GET কল করার সময় (Planner পেজ
 * লোড হলে) concurrent একাধিক request (যেমন React StrictMode double-render,
 * বা একই মুহূর্তে দুইটা ট্যাব/দ্রুত রিফ্রেশ) দুটোই `pet === null` দেখে
 * দুটোই `create()` কল করার চেষ্টা করত — `StudyPet.userId` এর
 * `@unique` constraint এ দ্বিতীয়টা Prisma P2002 crash করে ৫০০ Internal
 * Server Error দিত। লাইভ টেস্টে ৫টা concurrent request পাঠিয়ে ৪টা
 * crash (৫০০) প্রমাণিত হয়েছে। ফিক্স: ForumVote এর established প্যাটার্ন
 * অনুসরণ করে Prisma `upsert()` ব্যবহার করা হয়েছে — এটা Postgres এ single
 * `INSERT ... ON CONFLICT (userId) DO UPDATE` স্টেটমেন্টে কম্পাইল হয়
 * (DB-level atomic, কোনো race window থাকে না)। `update: {}` (খালি) —
 * বিদ্যমান পেট থাকলে কিছুই পরিবর্তন করে না, শুধু বিদ্যমান রো রিটার্ন করে।
 */
export async function getOrCreateStudyPet(userId: string) {
  return prisma.studyPet.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

/**
 * Happiness এর lazy decay হিসাব করে (প্রতিদিন miss করলে কমে, কিন্তু
 * MIN_HAPPINESS এর নিচে নামে না)। এটা read-time এ calculate করা হয়,
 * cron ছাড়াই — যখনই পেটের ডেটা দেখানো হয় তখন আপডেট হয়।
 */
export async function getStudyPetWithDecay(userId: string) {
  const pet = await getOrCreateStudyPet(userId);
  const now = new Date();
  const daysSinceCare = daysBetween(pet.lastCareAt, now);

  if (daysSinceCare <= 0) {
    return pet;
  }

  const decayedHappiness = Math.max(
    MIN_HAPPINESS,
    pet.happiness - daysSinceCare * HAPPINESS_DECAY_PER_DAY
  );

  if (decayedHappiness === pet.happiness) {
    return pet;
  }

  const updated = await prisma.studyPet.update({
    where: { userId },
    data: { happiness: decayedHappiness },
  });
  return updated;
}

export interface PetCareResult {
  pet: Awaited<ReturnType<typeof getOrCreateStudyPet>>;
  evolved: boolean;
  previousStage: PetStage;
}

/**
 * একটা সম্পূর্ণ পোমোডোরো সেশন শেষ হলে কল করা হয় — carePoints/happiness/
 * totalSessions বাড়ায় এবং প্রয়োজনে evolution ঘটায় (ও নোটিফিকেশন পাঠায়)।
 */
export async function feedStudyPet(userId: string): Promise<PetCareResult> {
  const pet = await getStudyPetWithDecay(userId);
  const previousStage = pet.stage;

  const newCarePoints = pet.carePoints + CARE_POINTS_PER_SESSION;
  const newHappiness = Math.min(MAX_HAPPINESS, pet.happiness + HAPPINESS_GAIN_PER_SESSION);
  const newStage = calculateStage(newCarePoints);
  const evolved = newStage !== previousStage;

  const updated = await prisma.studyPet.update({
    where: { userId },
    data: {
      carePoints: newCarePoints,
      happiness: newHappiness,
      totalSessions: { increment: 1 },
      stage: newStage,
      lastCareAt: new Date(),
    },
  });

  if (evolved) {
    const info = PET_STAGE_INFO[newStage];
    await createNotification({
      userId,
      title: `${info.emoji} তোমার স্টাডি পেট বড় হয়েছে!`,
      body: `অভিনন্দন! তোমার পেট এখন "${info.label}" — ${info.description}`,
      link: "/planner",
    });
  }

  return { pet: updated, evolved, previousStage };
}

/** পেটের নাম পরিবর্তন করে */
export async function renameStudyPet(userId: string, name: string) {
  const trimmed = name.trim().slice(0, 20);
  if (!trimmed) throw new Error("নাম খালি রাখা যাবে না");
  await getOrCreateStudyPet(userId); // নিশ্চিত করা পেট আছে
  return prisma.studyPet.update({ where: { userId }, data: { name: trimmed } });
}

/** পরের evolution stage এ যেতে আর কত carePoints লাগবে তার তথ্য */
export function getNextStageProgress(carePoints: number, stage: PetStage) {
  const idx = PET_STAGE_ORDER.indexOf(stage);
  if (idx === PET_STAGE_ORDER.length - 1) {
    return { isMaxStage: true, nextStage: null, pointsNeeded: 0, progressPct: 100 };
  }
  const nextStage = PET_STAGE_ORDER[idx + 1];
  const currentThreshold = PET_STAGE_INFO[stage].threshold;
  const nextThreshold = PET_STAGE_INFO[nextStage].threshold;
  const pointsNeeded = nextThreshold - carePoints;
  const progressPct = Math.round(
    ((carePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  );
  return { isMaxStage: false, nextStage, pointsNeeded, progressPct };
}
