// ===================================================================
// Peer Quiz Duel Core Logic (Kahoot-অনুপ্রাণিত ১-বনাম-১ প্রতিযোগিতা)
// -------------------------------------------------------------------
// WebSocket ছাড়া polling-based approach — ফ্রন্টএন্ড নিয়মিত interval এ
// GET কল করে duel এর অবস্থা চেক করবে (opponent যোগ দিয়েছে কিনা, উভয়ে
// জমা দিয়েছে কিনা)। HSC Ultimate এর স্কেলে এটাই সবচেয়ে সরল ও নির্ভরযোগ্য
// পদ্ধতি (real-time WebSocket infrastructure ছাড়াই)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { awardXp } from "@/lib/league";
import { pickRandom } from "@/lib/mock-exam";

const QUESTIONS_PER_DUEL = 10;
const XP_WIN = 25;
const XP_LOSE = 5; // অংশগ্রহণের জন্যও কিছু XP (সম্পূর্ণ শূন্য দিলে demotivating হতে পারে)
const XP_DRAW = 15;

interface CreateDuelInput {
  challengerId: string;
  sourceType: "subject" | "custom";
  subjectId?: string;
  customSetId?: string;
}

/** নতুন Duel তৈরি করে — Subject question bank অথবা নিজের CustomQuestionSet
 * থেকে ১০টা (custom হলে সেটের সব) MCQ বেছে নেয়, WAITING অবস্থায় থাকে
 *
 * 🔧 সম্প্রসারণ (এই সেশনে, Smart Live Exam ভিশনের ধারাবাহিকতায়): আগে
 * শুধু subjectId (Subject question bank) সাপোর্ট করত। এখন Quiz Battle
 * এর established `sourceType: "custom" | "question_bank"` প্যাটার্ন
 * অনুসরণ করে নিজের ছবি থেকে AI-জেনারেটেড CustomQuestionSet (MCQ) দিয়েও
 * Duel চ্যালেঞ্জ তৈরি করা যায়।
 *
 * 🐛 বাগ ফিক্স (Mind Map/Flashcard AI-Generation audit এর ধারাবাহিকতায়
 * আরও Bug Hunt চালিয়ে আবিষ্কৃত, Study Group Create এর একই "check-
 * then-create own-invariant" ক্লাস): আগে `route.ts` এ "একজন ইউজার
 * একসাথে একটার বেশি active/waiting duel এ থাকতে পারবে না" ইনভ্যারিয়েন্ট
 * শুধু app-level `findFirst()` চেক করে (কোনো lock ছাড়া) এনফোর্স করা
 * হতো, তারপর আলাদা `create()`। লাইভ concurrency টেস্টে ৫টা concurrent
 * POST /api/duel পাঠিয়ে ১০/১০ iteration এ সবগুলোতেই ৫টা duel তৈরি হয়ে
 * গেছে (প্রত্যাশিত ১টা) — ইনভ্যারিয়েন্ট সম্পূর্ণ bypass।
 *
 * ফিক্স: Study Group Join/PDF Chat Upload এর established `SELECT ...
 * FOR UPDATE` প্যাটার্ন অনুসরণ করে challenger এর নিজের `users` row কে
 * `$transaction` এর ভেতরে lock করা হয়েছে — একই ইউজারের concurrent
 * duel-create request গুলো serialize হয়ে যায় (একটা শেষ না হওয়া
 * পর্যন্ত পরেরটা অপেক্ষা করে), তাই existing-duel check+create atomic
 * হয়ে যায়। ভিন্ন ইউজারের creation independent থাকে (আলাদা row lock)।
 */
export async function createDuel(input: CreateDuelInput) {
  const { challengerId, sourceType } = input;
  let questionIds: string[];

  if (sourceType === "custom") {
    if (!input.customSetId) throw new Error("customSetId আবশ্যক");
    const set = await prisma.customQuestionSet.findUnique({
      where: { id: input.customSetId },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!set || set.userId !== challengerId) throw new Error("সেট পাওয়া যায়নি");
    if (set.status !== "READY") throw new Error("এই সেট এখনো প্রস্তুত হয়নি");
    if (set.questionType !== "MCQ") throw new Error("শুধু MCQ সেট দিয়ে Duel বানানো যায়");
    if (set.questions.length === 0) throw new Error("এই সেটে কোনো প্রশ্ন নেই");

    questionIds = set.questions.map((q) => q.id);
  } else {
    if (!input.subjectId) throw new Error("সাবজেক্ট বেছে নিন");
    const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } });
    if (!subject) throw new Error("সাবজেক্ট পাওয়া যায়নি");

    const allMcq = await prisma.question.findMany({
      where: { topic: { chapter: { subjectId: input.subjectId } }, type: "MCQ" },
      select: { id: true },
    });

    if (allMcq.length < QUESTIONS_PER_DUEL) {
      throw new Error(
        `এই সাবজেক্টে Duel এর জন্য যথেষ্ট প্রশ্ন নেই (কমপক্ষে ${QUESTIONS_PER_DUEL}টা লাগবে)`
      );
    }

    questionIds = pickRandom(
      allMcq.map((q) => q.id),
      QUESTIONS_PER_DUEL
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${challengerId} FOR UPDATE`;

    const existing = await tx.quizDuel.findFirst({
      where: {
        status: { in: ["WAITING", "ACTIVE"] },
        OR: [{ challengerId }, { opponentId: challengerId }],
      },
    });
    if (existing) {
      throw new Error("তুমি ইতিমধ্যে একটা Duel এ আছো — আগে সেটা শেষ করো বা বাতিল করো");
    }

    return tx.quizDuel.create({
      data: {
        subjectId: sourceType === "subject" ? input.subjectId : null,
        customSetId: sourceType === "custom" ? input.customSetId : null,
        challengerId,
        questionIds,
        status: "WAITING",
      },
      include: { subject: true, challenger: { select: { id: true, name: true } } },
    });
  });
}

/** Duel এর নাম/লেবেল বের করে — Subject হলে subject.name, custom set হলে
 * সেটের title (নোটিফিকেশন বার্তা/UI তে দেখানোর জন্য) — subject এখন
 * ঐচ্ছিক হওয়ায় (custom set support যোগ হওয়ার পরে) দুই ক্ষেত্রেই কাজ করা
 * একটা কেন্দ্রীয় হেল্পার দরকার হয়েছে
 */
async function getDuelDisplayName(duel: { subjectId: string | null; customSetId: string | null; subject?: { name: string } | null }): Promise<string> {
  if (duel.subject?.name) return duel.subject.name;
  if (duel.customSetId) {
    const set = await prisma.customQuestionSet.findUnique({
      where: { id: duel.customSetId },
      select: { title: true },
    });
    if (set) return set.title;
  }
  return "Quiz";
}

/** Public lobby তে থাকা WAITING duel গুলো লিস্ট করে (নিজের তৈরি করা বাদে)
 *
 * ⚠️ নোট: শুধু subjectId থাকা (Subject question bank) duel গুলোই public
 * lobby তে দেখানো হয় — customSetId থাকা duel গুলো ব্যক্তিগত AI-generated
 * প্রশ্ন দিয়ে বানানো, শুধু direct link শেয়ার করে বন্ধুকে ডাকা উচিত (Quiz
 * Battle এর roomCode প্যাটার্নের মতো ব্যক্তিগত/ঐচ্ছিক), public lobby তে
 * অচেনা কেউ custom set এর প্রশ্ন দেখতে/খেলতে পারবে না।
 */
export async function listOpenDuels(userId: string) {
  return prisma.quizDuel.findMany({
    where: { status: "WAITING", challengerId: { not: userId }, subjectId: { not: null } },
    include: { subject: true, challenger: { select: { id: true, name: true, level: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

/**
 * একটা WAITING duel এ opponent হিসেবে যোগ দেয় — ACTIVE করে দেয়।
 *
 * 🐛 বাগ ফিক্স (Habit Tracker/Forum Vote/Content Report/Peer Note
 * Helpful Vote race condition অডিট সিরিজের ধারাবাহিকতায় আবিষ্কৃত, Study
 * Group/Quiz Battle capacity bug এর একই ক্লাস): আগে
 * `duel.status !== "WAITING"` চেক করে আলাদা `update()` কল করা হতো
 * (read-then-write) — একটা WAITING duel এ concurrent একাধিক ইউজার
 * join করার চেষ্টা করলে সবাই একই সাথে `status === "WAITING"` (stale
 * read) দেখে, সবাই সফলভাবে `opponentId` সেট করে ফেলে (শেষ write জিতে
 * যায়, কিন্তু প্রতিটা request-ই caller কে ২০০ সফল রেসপন্স দেয়) —
 * opponent slot মাত্র ১টা হওয়া সত্ত্বেও। লাইভ টেস্টে ৫ জন ভিন্ন ইউজার
 * concurrently join করে **সবাই সফল হয়েছে** (প্রত্যাশিত ছিল ঠিক ১ জন)
 * প্রমাণ হিসেবে।
 *
 * ফিক্স: Forum Best Answer XP fix এর established single-field atomic
 * conditional update প্যাটার্ন — `updateMany({ where: { id, status:
 * "WAITING" }, data: {...} })` — Postgres এই conditional UPDATE কে
 * row-level lock নিয়ে atomic ভাবে execute করে, তাই দুটো concurrent
 * request একই duel এ একসাথে এলেও একটাই matched হবে (count=1, join
 * সফল), বাকিগুলোর WHERE condition আর ম্যাচ করবে না (count=0, "এই Duel
 * এ আর যোগ দেওয়া যাবে না" error)। Study Group/Habit Tracker এর
 * `SELECT...FOR UPDATE` এর চেয়ে সহজ কারণ এখানে multi-row capacity
 * count লাগে না, শুধু single-field boolean-like স্টেট চেক যথেষ্ট।
 */
export async function joinDuel(duelId: string, userId: string) {
  const duel = await prisma.quizDuel.findUnique({ where: { id: duelId } });
  if (!duel) throw new Error("Duel পাওয়া যায়নি");
  if (duel.status !== "WAITING") throw new Error("এই Duel এ আর যোগ দেওয়া যাবে না");
  if (duel.challengerId === userId) throw new Error("নিজের তৈরি করা Duel এ নিজে যোগ দেওয়া যায় না");

  // Atomic conditional update — শুধু তখনই সফল হবে যদি এই মুহূর্তেও
  // status="WAITING" থাকে (অন্য কোনো concurrent request ইতিমধ্যে জিতে
  // না গিয়ে থাকে)
  const claimResult = await prisma.quizDuel.updateMany({
    where: { id: duelId, status: "WAITING" },
    data: { opponentId: userId, status: "ACTIVE", startedAt: new Date() },
  });

  if (claimResult.count === 0) {
    throw new Error("এই Duel এ আর যোগ দেওয়া যাবে না");
  }

  const updated = await prisma.quizDuel.findUniqueOrThrow({
    where: { id: duelId },
    include: { subject: true, challenger: { select: { id: true, name: true } } },
  });

  const displayName = await getDuelDisplayName(updated);
  await createNotification({
    userId: duel.challengerId,
    title: "⚔️ তোমার Duel Challenge গৃহীত হয়েছে!",
    body: `একজন প্রতিদ্বন্দ্বী তোমার "${displayName}" Duel Challenge গ্রহণ করেছে — এখনই উত্তর দেওয়া শুরু করো!`,
    link: `/duel/${duelId}`,
  });

  return updated;
}

/**
 * নিজের তৈরি করা WAITING duel বাতিল করে দেয়।
 *
 * 🐛 বাগ ফিক্স (joinDuel() এর race condition ফিক্সের সাথে সামঞ্জস্য
 * রাখতে): আগে blind `update()` দিয়ে সরাসরি status="EXPIRED" সেট করা
 * হতো — owner cancel করার ঠিক সেই মুহূর্তে অন্য কেউ concurrently join
 * করে ফেললে (join জিতে গিয়ে status="ACTIVE"+real opponentId সেট হয়ে
 * গেলেও), cancel এর blind update সেটাকে ভুলভাবে আবার "EXPIRED" করে
 * দিতে পারতো — ফলে duel টা ACTIVE game state (বাস্তব opponent সহ)
 * থাকা সত্ত্বেও EXPIRED দেখাতো, উভয় খেলোয়াড়ের জন্য একটা confusing/broken
 * অবস্থা তৈরি হতো। এখন `updateMany({ where: { id, status: "WAITING" } })`
 * দিয়ে শুধু তখনই cancel সফল হয় যখন duel এখনো সত্যিই WAITING অবস্থায়
 * আছে (joinDuel() এর একই atomic conditional update প্যাটার্ন)।
 */
export async function cancelDuel(duelId: string, userId: string) {
  const duel = await prisma.quizDuel.findUnique({ where: { id: duelId } });
  if (!duel) throw new Error("Duel পাওয়া যায়নি");
  if (duel.challengerId !== userId) throw new Error("শুধু তৈরিকারীই বাতিল করতে পারবে");
  if (duel.status !== "WAITING") throw new Error("শুধু WAITING অবস্থায় বাতিল করা যায়");

  const result = await prisma.quizDuel.updateMany({
    where: { id: duelId, status: "WAITING" },
    data: { status: "EXPIRED" },
  });

  if (result.count === 0) {
    throw new Error("শুধু WAITING অবস্থায় বাতিল করা যায়");
  }
}

interface SubmitAnswersInput {
  duelId: string;
  userId: string;
  answers: Record<string, string>;
  timeTakenSec: number;
}

/**
 * একজন অংশগ্রহণকারী উত্তর জমা দিলে কল হয় — সার্ভার-সাইড স্কোরিং করে।
 * উভয়ে জমা দেওয়ার পরেই duel COMPLETED হয়ে বিজয়ী নির্ধারণ+XP বিতরণ হয়।
 */
export async function submitDuelAnswers({ duelId, userId, answers, timeTakenSec }: SubmitAnswersInput) {
  const duel = await prisma.quizDuel.findUnique({ where: { id: duelId } });
  if (!duel) throw new Error("Duel পাওয়া যায়নি");
  if (duel.status !== "ACTIVE") throw new Error("এই Duel এখন সক্রিয় না");

  const isChallenger = duel.challengerId === userId;
  const isOpponent = duel.opponentId === userId;
  if (!isChallenger && !isOpponent) throw new Error("তুমি এই Duel এর অংশগ্রহণকারী না");

  // সার্ভার-সাইড স্কোরিং — সঠিক উত্তরের সাথে মিলিয়ে (ক্লায়েন্টকে বিশ্বাস করা হয় না)
  // 🔧 সম্প্রসারণ: customSetId থাকলে CustomQuestion টেবিল থেকে, না হলে
  // established Question (Subject question bank) টেবিল থেকে সঠিক উত্তর
  // আনা হয় (Quiz Battle এর submitBattleAnswers() এর একই প্যাটার্ন)।
  const questionIds = duel.questionIds as string[];
  let correctAnswerMap: Map<string, string>;
  if (duel.customSetId) {
    const customQuestions = await prisma.customQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });
    correctAnswerMap = new Map(customQuestions.map((q) => [q.id, q.correctAnswer ?? ""]));
  } else {
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });
    correctAnswerMap = new Map(questions.map((q) => [q.id, q.correctAnswer]));
  }

  let score = 0;
  for (const [qId, userAnswer] of Object.entries(answers)) {
    if (correctAnswerMap.get(qId) === userAnswer) score++;
  }

  const updateData = isChallenger
    ? { challengerAnswers: answers, challengerScore: score, challengerTimeSec: timeTakenSec }
    : { opponentAnswers: answers, opponentScore: score, opponentTimeSec: timeTakenSec };

  // 🐛 বাগ ফিক্স (Task/StudyPlanItem/TopicProgress/QuizBattle XP Race
  // Condition অডিটের ধারাবাহিকতায় আবিষ্কৃত, একই ক্লাসের সমস্যা): আগে
  // `if (isChallenger && duel.challengerAnswers) throw ...` দিয়ে
  // read-then-write চেক হতো — একই ইউজারের ২টা concurrent submit
  // request stale `challengerAnswers=null` state দেখে দুটোই score
  // আপডেট করে ফেলতে পারতো (একই score দিয়ে হলেও, downstream এ
  // `bothSubmitted` চেক দুইবার true হয়ে `finalizeDuel()` দুইবার কল
  // হওয়ার ঝুঁকি তৈরি করত)। ফিক্স: single atomic
  // `UPDATE ... WHERE id=? AND challengerAnswers IS NULL` (বা
  // opponentAnswers) স্টেটমেন্ট দিয়ে check+set একসাথে করা হয়েছে।
  const nullFieldGuard = isChallenger
    ? { challengerAnswers: { equals: Prisma.DbNull } }
    : { opponentAnswers: { equals: Prisma.DbNull } };
  const claimResult = await prisma.quizDuel.updateMany({
    where: { id: duelId, ...nullFieldGuard },
    data: updateData,
  });

  if (claimResult.count === 0) {
    throw new Error("তুমি ইতিমধ্যে উত্তর জমা দিয়েছো");
  }

  let updated = await prisma.quizDuel.findUniqueOrThrow({ where: { id: duelId } });

  // উভয়েই জমা দিয়ে থাকলে (এই আপডেটের পরে) duel সম্পূর্ণ করে বিজয়ী নির্ধারণ করা হয়
  const bothSubmitted = updated.challengerAnswers !== null && updated.opponentAnswers !== null;
  if (bothSubmitted && updated.status === "ACTIVE") {
    updated = await finalizeDuel(updated.id);
  }

  return updated;
}

/** উভয়ে জমা দেওয়ার পরে বিজয়ী নির্ধারণ করে, XP দেয়, নোটিফিকেশন পাঠায় */
async function finalizeDuel(duelId: string) {
  // 🐛 বাগ ফিক্স (একই অডিটে আবিষ্কৃত): status ট্রানজিশন এখন atomic
  // `UPDATE ... WHERE id=? AND status="ACTIVE"` দিয়ে claim করা হয় —
  // দুটো concurrent path (যদি কোনোভাবে একসাথে ট্রিগার হয়) এর মধ্যে
  // শুধু একটাই matched হবে, বাকিটা "already finalized" ধরে নিয়ে
  // idempotent ভাবে বর্তমান state রিটার্ন করবে (আবার winner
  // নির্ধারণ/XP award না করে)।
  const duel = await prisma.quizDuel.findUnique({ where: { id: duelId } });
  if (!duel || !duel.opponentId) throw new Error("Duel অসম্পূর্ণ");

  let winnerId: string | null = null;

  if (duel.challengerScore > duel.opponentScore) {
    winnerId = duel.challengerId;
  } else if (duel.opponentScore > duel.challengerScore) {
    winnerId = duel.opponentId;
  } else {
    // স্কোর সমান হলে কম সময় নেওয়া জন জিতবে (tie-breaker)
    const cTime = duel.challengerTimeSec ?? Infinity;
    const oTime = duel.opponentTimeSec ?? Infinity;
    if (cTime < oTime) winnerId = duel.challengerId;
    else if (oTime < cTime) winnerId = duel.opponentId;
    // দুটোই সমান হলে winnerId null থেকে যাবে (সত্যিকারের ড্র)
  }

  const claimResult = await prisma.quizDuel.updateMany({
    where: { id: duelId, status: "ACTIVE" },
    data: { status: "COMPLETED", completedAt: new Date(), winnerId },
  });

  if (claimResult.count === 0) {
    // অন্য একটা concurrent path ইতিমধ্যে finalize করে ফেলেছে — আবার
    // XP/notification না দিয়ে বর্তমান state রিটার্ন
    return prisma.quizDuel.findUniqueOrThrow({ where: { id: duelId }, include: { subject: true } });
  }

  const updated = await prisma.quizDuel.findUniqueOrThrow({
    where: { id: duelId },
    include: { subject: true },
  });

  const displayName = await getDuelDisplayName(updated);

  // XP বিতরণ ও নোটিফিকেশন
  if (winnerId === null) {
    await awardXp(duel.challengerId, XP_DRAW);
    await awardXp(duel.opponentId, XP_DRAW);
    await Promise.all(
      [duel.challengerId, duel.opponentId].map((uid) =>
        createNotification({
          userId: uid,
          title: "🤝 Duel ড্র হয়েছে!",
          body: `"${displayName}" Duel এ উভয়ে সমান স্কোর করেছো — দুজনেই +${XP_DRAW} XP পেয়েছো।`,
          link: `/duel/${duelId}`,
        })
      )
    );
  } else {
    const loserId = winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
    await awardXp(winnerId, XP_WIN);
    await awardXp(loserId, XP_LOSE);
    await createNotification({
      userId: winnerId,
      title: "🏆 তুমি Duel জিতেছো!",
      body: `"${displayName}" Duel এ জয়ী হয়েছো! +${XP_WIN} XP পেয়েছো।`,
      link: `/duel/${duelId}`,
    });
    await createNotification({
      userId: loserId,
      title: "⚔️ Duel শেষ হয়েছে",
      body: `"${displayName}" Duel এ এবার হেরেছো, কিন্তু অংশগ্রহণের জন্য +${XP_LOSE} XP পেয়েছো। আবার চেষ্টা করো!`,
      link: `/duel/${duelId}`,
    });
  }

  return updated;
}

/** নির্দিষ্ট duel এর বিস্তারিত অবস্থা নিয়ে আসে (polling endpoint এর জন্য)
 *
 * 🔧 সম্প্রসারণ: subject এখন ঐচ্ছিক (custom set support যোগ হওয়ার পরে) —
 * তাই একটা `displayName` ফিল্ড যোগ করা হয়েছে যেটা subject.name অথবা
 * custom set এর title (getDuelDisplayName() হেল্পার দিয়ে) রিটার্ন করে,
 * ফ্রন্টএন্ডকে দুই ক্ষেত্রেই আলাদা করে হ্যান্ডল করতে হয় না।
 */
export async function getDuelDetail(duelId: string, userId: string) {
  const duel = await prisma.quizDuel.findUnique({
    where: { id: duelId },
    include: {
      subject: true,
      challenger: { select: { id: true, name: true, level: true } },
      opponent: { select: { id: true, name: true, level: true } },
    },
  });
  if (!duel) return null;
  if (duel.challengerId !== userId && duel.opponentId !== userId) {
    throw new Error("তুমি এই Duel এর অংশগ্রহণকারী না");
  }
  const displayName = await getDuelDisplayName(duel);
  return { ...duel, displayName };
}

/** ইউজারের সাম্প্রতিক duel history (win/loss/draw record সহ)
 *
 * 🔧 সম্প্রসারণ: প্রতিটা duel এ `displayName` যোগ করা হয়েছে (subject.name
 * অথবা custom set title) — history UI তে subject না থাকলে (custom set
 * দিয়ে খেলা Duel) কিছু একটা অর্থবহ নাম দেখানোর জন্য।
 */
export async function getMyDuelHistory(userId: string) {
  const duels = await prisma.quizDuel.findMany({
    where: {
      status: "COMPLETED",
      OR: [{ challengerId: userId }, { opponentId: userId }],
    },
    include: {
      subject: true,
      challenger: { select: { id: true, name: true } },
      opponent: { select: { id: true, name: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  const duelsWithDisplayName = await Promise.all(
    duels.map(async (d) => ({ ...d, displayName: await getDuelDisplayName(d) }))
  );

  const wins = duels.filter((d) => d.winnerId === userId).length;
  const draws = duels.filter((d) => d.winnerId === null).length;
  const losses = duels.length - wins - draws;

  return { duels: duelsWithDisplayName, stats: { wins, draws, losses, total: duels.length } };
}
