// ===================================================================
// Quiz Battle Core Logic — Room code দিয়ে multi-person (৩০+ জন পর্যন্ত)
// self-paced MCQ প্রতিযোগিতা
// -------------------------------------------------------------------
// বিদ্যমান QuizDuel (১-বনাম-১, ফিক্সড challengerId/opponentId কলাম) থেকে
// আলাদা মডেল — এখানে N-জন অংশগ্রহণকারী থাকতে পারে (QuizBattleParticipant
// junction table)। Self-paced: সবাই একই সময়ে প্রশ্ন দেখে না, প্রত্যেকে
// নিজের গতিতে এগোয় এবং জমা দেয়, কারো জন্য অপেক্ষা করতে হয় না।
// Leaderboard পোলিং-ভিত্তিক লাইভ আপডেট হয় (বিদ্যমান Duel প্যাটার্ন)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { pickRandom } from "@/lib/mock-exam";
import { awardXp } from "@/lib/league";

const QUESTIONS_PER_BATTLE = 10;
const XP_WINNER = 30;
const XP_PARTICIPANT = 10;
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // বিভ্রান্তিকর অক্ষর (0/O, 1/I) বাদ
const ROOM_CODE_LENGTH = 6;
export const MAX_BATTLE_PLAYERS = 50; // ইউজার সর্বোচ্চ যত সেট করতে পারবে তার হার্ড ক্যাপ

/** এলোমেলো ৬-অক্ষরের room code বানায় (সংঘর্ষ হলে আবার চেষ্টা করে) */
async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "";
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    const existing = await prisma.quizBattle.findUnique({ where: { roomCode: code } });
    if (!existing) return code;
  }
  throw new Error("রুম কোড তৈরি করা যায়নি, আবার চেষ্টা করো");
}

interface CreateBattleInput {
  ownerId: string;
  title: string;
  sourceType: "custom" | "question_bank";
  subjectId?: string;
  customSetId?: string;
  maxPlayers?: number;
}

/** নতুন Quiz Battle room তৈরি করে — owner নিজে থেকেই প্রথম participant হয়ে যায় */
export async function createQuizBattle(input: CreateBattleInput) {
  let questionIds: string[];

  if (input.sourceType === "custom") {
    if (!input.customSetId) throw new Error("customSetId আবশ্যক");
    const set = await prisma.customQuestionSet.findUnique({
      where: { id: input.customSetId },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!set || set.userId !== input.ownerId) throw new Error("সেট পাওয়া যায়নি");
    if (set.status !== "READY") throw new Error("এই সেট এখনো প্রস্তুত হয়নি");
    if (set.questionType !== "MCQ") throw new Error("শুধু MCQ সেট দিয়ে Battle বানানো যায়");
    if (set.questions.length === 0) throw new Error("এই সেটে কোনো প্রশ্ন নেই");

    questionIds = set.questions.map((q) => q.id);
  } else {
    if (!input.subjectId) throw new Error("subjectId আবশ্যক");
    const allMcq = await prisma.question.findMany({
      where: { topic: { chapter: { subjectId: input.subjectId } }, type: "MCQ" },
      select: { id: true },
    });
    if (allMcq.length < QUESTIONS_PER_BATTLE) {
      throw new Error(`এই সাবজেক্টে Battle এর জন্য যথেষ্ট প্রশ্ন নেই (কমপক্ষে ${QUESTIONS_PER_BATTLE}টা লাগবে)`);
    }
    questionIds = pickRandom(
      allMcq.map((q) => q.id),
      QUESTIONS_PER_BATTLE
    );
  }

  const roomCode = await generateUniqueRoomCode();
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Study Session durationSec এর একই numeric-validation-missing
  // ক্লাস): আগে `input.maxPlayers ?? 30` শুধু null/undefined হ্যান্ডল
  // করতো — কিন্তু `maxPlayers: "not-a-number"` (string type) পাঠালে
  // `??` ফলব্যাক ট্রিগার হতো না (string null/undefined না), এবং
  // `Math.max("not-a-number", 2)` জাভাস্ক্রিপ্টে `NaN` রিটার্ন করে
  // (Math.max কোয়ার্স করতে ব্যর্থ হলে)। `Math.min(NaN, ...)` ও `NaN`।
  // চূড়ান্ত `maxPlayers: NaN` Prisma create() এ পাঠালে
  // `PrismaClientValidationError` throw করতো — raw Prisma error
  // message ক্যাচ ব্লকে client কে leak হয়ে যাচ্ছিল (information
  // disclosure, internal file path/stack trace সহ)। ফিক্স: valid
  // finite number না হলে default (৩০) ব্যবহার করা হচ্ছে।
  const rawMaxPlayers =
    typeof input.maxPlayers === "number" && Number.isFinite(input.maxPlayers)
      ? input.maxPlayers
      : 30;
  const maxPlayers = Math.min(Math.max(rawMaxPlayers, 2), MAX_BATTLE_PLAYERS);

  return prisma.quizBattle.create({
    data: {
      ownerId: input.ownerId,
      title: input.title.trim().slice(0, 100) || "Quiz Battle",
      roomCode,
      subjectId: input.sourceType === "question_bank" ? input.subjectId : null,
      customSetId: input.sourceType === "custom" ? input.customSetId : null,
      questionIds,
      maxPlayers,
      participants: {
        create: { userId: input.ownerId },
      },
    },
    include: { subject: true, owner: { select: { id: true, name: true } }, participants: true },
  });
}

/** Room code দিয়ে একটা battle এ যোগ দেয় */
export async function joinQuizBattle(roomCode: string, userId: string) {
  const normalizedCode = roomCode.trim().toUpperCase();

  // 🐛 বাগ ফিক্স (XP/Reward Race Condition অডিট সিরিজের ধারাবাহিকতায়
  // আবিষ্কৃত — এবার "amount" ভুল হওয়া না, বরং **capacity constraint
  // bypass**): আগে `battle.participants.length >= battle.maxPlayers`
  // চেক করে তারপর আলাদা `create()` কল করা হতো (read-then-write) —
  // লাইভ concurrency টেস্টে ৫ জন একসাথে join করলে (maxPlayers=2 সেট
  // করে) সবাই stale participant-count দেখে সফলভাবে যোগ দিয়ে ফেলেছিল,
  // চূড়ান্ত participant count হয়েছিল ৬ (owner+৫ joiner), maxPlayers=2
  // সম্পূর্ণ bypass হয়ে গিয়েছিল।
  //
  // ফিক্স: Postgres `SELECT ... FOR UPDATE` দিয়ে battle row-কে
  // transaction এর ভেতরে lock করা হয় — একই battle এ concurrent join
  // request গুলো serialize হয়ে যায় (একটা শেষ না হওয়া পর্যন্ত পরেরটা
  // অপেক্ষা করে), তাই capacity check+insert একসাথে atomic হয়ে যায়।
  // ভিন্ন battle এ join করা independent থাকে (আলাদা row, আলাদা lock)।
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ id: string; status: string; maxPlayers: number }[]>`
      SELECT id, status, "maxPlayers" FROM "quiz_battles"
      WHERE "roomCode" = ${normalizedCode}
      FOR UPDATE
    `;
    const battleRow = locked[0];
    if (!battleRow) throw new Error("এই কোডে কোনো Battle পাওয়া যায়নি");
    if (battleRow.status === "COMPLETED") {
      throw new Error("এই Battle ইতিমধ্যে শেষ হয়ে গেছে");
    }

    const alreadyJoined = await tx.quizBattleParticipant.findUnique({
      where: { battleId_userId: { battleId: battleRow.id, userId } },
    });
    if (alreadyJoined) {
      return tx.quizBattle.findUniqueOrThrow({
        where: { id: battleRow.id },
        include: { subject: true, owner: { select: { id: true, name: true } }, participants: true },
      });
    }

    const participantCount = await tx.quizBattleParticipant.count({
      where: { battleId: battleRow.id },
    });
    if (participantCount >= battleRow.maxPlayers) {
      throw new Error("এই Battle room পূর্ণ হয়ে গেছে");
    }

    await tx.quizBattleParticipant.create({
      data: { battleId: battleRow.id, userId },
    });

    return tx.quizBattle.findUniqueOrThrow({
      where: { id: battleRow.id },
      include: { subject: true, owner: { select: { id: true, name: true } }, participants: true },
    });
  });
}

/** Owner battle শুরু করে দেয় (WAITING → ACTIVE), এরপর participant রা উত্তর দিতে পারবে */
export async function startQuizBattle(battleId: string, userId: string) {
  const battle = await prisma.quizBattle.findUnique({ where: { id: battleId } });
  if (!battle) throw new Error("Battle পাওয়া যায়নি");
  if (battle.ownerId !== userId) throw new Error("শুধু room owner Battle শুরু করতে পারবে");

  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ bug-hunt অডিটে আবিষ্কৃত, একই ফাইলে
  // ইতিমধ্যে fix করা submitBattleAnswers()/finalizeBattle() এর একই
  // race-condition ক্লাস — এই startQuizBattle() টাই তখন miss হয়ে
  // গিয়েছিল): আগে `battle.status !== "WAITING"` read-then-write
  // প্যাটার্নে ছিল, যা owner এর concurrent একাধিক ক্লিকে `startedAt`
  // বারবার reset হওয়ার ঝুঁকি রাখত (কম গুরুতর — কোনো XP/AI cost জড়িত
  // না, কিন্তু ধারাবাহিকতার জন্য একই atomic claim প্যাটার্ন প্রয়োগ)।
  const claimResult = await prisma.quizBattle.updateMany({
    where: { id: battleId, status: "WAITING" },
    data: { status: "ACTIVE", startedAt: new Date() },
  });

  if (claimResult.count === 0) {
    throw new Error("এই Battle ইতিমধ্যে শুরু হয়ে গেছে");
  }

  return prisma.quizBattle.findUniqueOrThrow({ where: { id: battleId } });
}

/** Battle এর বিস্তারিত অবস্থা + leaderboard নিয়ে আসে (polling endpoint এর জন্য) */
export async function getBattleDetail(battleId: string, userId: string) {
  const battle = await prisma.quizBattle.findUnique({
    where: { id: battleId },
    include: {
      subject: true,
      owner: { select: { id: true, name: true } },
      participants: {
        include: { user: { select: { id: true, name: true, level: true } } },
        orderBy: [{ score: "desc" }, { timeTakenSec: "asc" }],
      },
    },
  });
  if (!battle) return null;

  const isParticipant = battle.participants.some((p) => p.userId === userId);
  if (!isParticipant) throw new Error("তুমি এই Battle এর অংশগ্রহণকারী না");

  return battle;
}

/** Room code দিয়ে battle খুঁজে বের করে (join পেজে preview দেখানোর জন্য) */
export async function findBattleByRoomCode(roomCode: string) {
  return prisma.quizBattle.findUnique({
    where: { roomCode: roomCode.trim().toUpperCase() },
    include: {
      subject: true,
      owner: { select: { id: true, name: true } },
      _count: { select: { participants: true } },
    },
  });
}

interface SubmitBattleAnswersInput {
  battleId: string;
  userId: string;
  answers: Record<string, string>;
  timeTakenSec: number;
}

/** Participant নিজের উত্তর জমা দেয় (self-paced — অন্যদের জন্য অপেক্ষা করতে হয় না) */
export async function submitBattleAnswers({
  battleId,
  userId,
  answers,
  timeTakenSec,
}: SubmitBattleAnswersInput) {
  const battle = await prisma.quizBattle.findUnique({ where: { id: battleId } });
  if (!battle) throw new Error("Battle পাওয়া যায়নি");
  if (battle.status !== "ACTIVE") throw new Error("এই Battle এখন সক্রিয় না");

  const participant = await prisma.quizBattleParticipant.findUnique({
    where: { battleId_userId: { battleId, userId } },
  });
  if (!participant) throw new Error("তুমি এই Battle এর অংশগ্রহণকারী না");

  // সার্ভার-সাইড স্কোরিং — ক্লায়েন্টকে বিশ্বাস করা হয় না
  const questionIds = battle.questionIds as string[];
  let questions: { id: string; correctAnswer: string }[];

  if (battle.customSetId) {
    const custom = await prisma.customQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });
    questions = custom.map((q) => ({ id: q.id, correctAnswer: q.correctAnswer ?? "" }));
  } else {
    questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true },
    });
  }
  const questionMap = new Map(questions.map((q) => [q.id, q.correctAnswer]));

  let score = 0;
  for (const [qId, userAnswer] of Object.entries(answers)) {
    if (questionMap.get(qId) === userAnswer) score++;
  }

  // 🐛 বাগ ফিক্স (Task/StudyPlanItem/TopicProgress XP Race Condition
  // অডিটের ধারাবাহিকতায় আবিষ্কৃত, একই ক্লাসের সমস্যা): আগে
  // `if (participant.submittedAt) throw ...` দিয়ে read-then-write চেক
  // হতো — লাইভ concurrency টেস্টে ৫টা concurrent submit request পাঠিয়ে
  // ৫০ XP পাওয়া গেছে (প্রত্যাশিত ১০, প্রতিটা request stale
  // `submittedAt=null` দেখে independently award করেছে)। ফিক্স: single
  // atomic `UPDATE ... WHERE id=? AND submittedAt IS NULL` স্টেটমেন্ট
  // দিয়ে check+set একসাথে করা হয়েছে (Postgres row-level lock
  // guarantee) — শুধু matched (count>0) হলেই XP দেওয়া হয়, নাহলে
  // "ইতিমধ্যে জমা দিয়েছো" error থ্রো করা হয়।
  const claimResult = await prisma.quizBattleParticipant.updateMany({
    where: { id: participant.id, submittedAt: null },
    data: { answers, score, timeTakenSec, submittedAt: new Date() },
  });

  if (claimResult.count === 0) {
    throw new Error("তুমি ইতিমধ্যে উত্তর জমা দিয়েছো");
  }

  const updated = await prisma.quizBattleParticipant.findUniqueOrThrow({
    where: { id: participant.id },
  });

  // অংশগ্রহণের জন্য XP — বিজয়ী নির্ধারণ battle শেষ হওয়ার পরে (owner এন্ড করলে) হবে
  await awardXp(userId, XP_PARTICIPANT);

  return updated;
}

/** Owner battle শেষ করে দেয় (ACTIVE → COMPLETED), বিজয়ীকে বোনাস XP দেয় */
export async function endQuizBattle(battleId: string, userId: string) {
  const battle = await prisma.quizBattle.findUnique({
    where: { id: battleId },
    include: { participants: true },
  });
  if (!battle) throw new Error("Battle পাওয়া যায়নি");
  if (battle.ownerId !== userId) throw new Error("শুধু room owner Battle শেষ করতে পারবে");
  if (battle.status !== "ACTIVE") throw new Error("এই Battle সক্রিয় অবস্থায় নেই");

  // 🐛 বাগ ফিক্স (একই ক্লাসের race condition, submitBattleAnswers এর
  // সাথে একই অডিটে আবিষ্কৃত): আগে `if (battle.status !== "ACTIVE")
  // throw` দিয়ে read-then-write চেক হতো, তারপর আলাদা `update()` কলে
  // বিজয়ীকে XP দেওয়া হতো — লাইভ concurrency টেস্টে owner এর ৫টা
  // concurrent "end" রিকোয়েস্টে বিজয়ী ১৫০ XP পেয়েছে (প্রত্যাশিত ৩০)।
  // ফিক্স: single atomic `UPDATE ... WHERE id=? AND status="ACTIVE"`
  // দিয়ে status ট্রানজিশন claim করা হয় — শুধু matched (count>0) হলেই
  // বিজয়ী নির্ধারণ+XP দেওয়া হয়, নাহলে battle ইতিমধ্যে অন্য একটা
  // concurrent request দ্বারা শেষ করা হয়ে গেছে ধরে নিয়ে idempotent
  // ভাবে বর্তমান battle state রিটার্ন করা হয়।
  const claimResult = await prisma.quizBattle.updateMany({
    where: { id: battleId, status: "ACTIVE" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  if (claimResult.count === 0) {
    // অন্য একটা concurrent request রেস জিতে battle ইতিমধ্যে শেষ করে
    // ফেলেছে — আবার winner নির্ধারণ/XP না দিয়ে বর্তমান state রিটার্ন
    return prisma.quizBattle.findUniqueOrThrow({ where: { id: battleId } });
  }

  const submitted = battle.participants.filter((p) => p.submittedAt !== null);
  if (submitted.length > 0) {
    const sorted = [...submitted].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.timeTakenSec ?? Infinity) - (b.timeTakenSec ?? Infinity);
    });
    const winner = sorted[0];
    await awardXp(winner.userId, XP_WINNER);
  }

  return prisma.quizBattle.findUniqueOrThrow({ where: { id: battleId } });
}

/** ইউজারের তৈরি করা/যোগ দেওয়া সাম্প্রতিক battle history */
export async function getMyBattleHistory(userId: string) {
  const participations = await prisma.quizBattleParticipant.findMany({
    where: { userId, battle: { status: "COMPLETED" } },
    include: {
      battle: {
        include: {
          subject: true,
          participants: { orderBy: [{ score: "desc" }, { timeTakenSec: "asc" }] },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
    take: 20,
  });

  return participations.map((p) => {
    const rank = p.battle.participants.findIndex((x) => x.userId === userId) + 1;
    return {
      battleId: p.battle.id,
      title: p.battle.title,
      subjectName: p.battle.subject?.name ?? null,
      score: p.score,
      totalParticipants: p.battle.participants.length,
      rank,
      completedAt: p.battle.completedAt,
    };
  });
}
