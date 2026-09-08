// ===================================================================
// Exam Day Checklist Mode — Core Logic
// -------------------------------------------------------------------
// নতুন ফিচার: HSC পরীক্ষার আগের রাত ও পরীক্ষার দিনের জন্য একটা
// চেকলিস্ট (Admit Card ভুলে না যাওয়া, কলম/পেন্সিল রেডি রাখা,
// breathing exercise করা ইত্যাদি)। HSC পরীক্ষা একাধিক দিন ধরে চলে
// (প্রতিটা বিষয়ের জন্য আলাদা দিন), তাই একবার চেক করা আইটেম রিসেট
// করে পরের পরীক্ষার দিনের জন্য আবার ব্যবহার করা যায়।
// ===================================================================
import { prisma } from "@/lib/prisma";
import type { ExamChecklistCategory } from "@prisma/client";

export const MAX_CUSTOM_ITEMS_PER_USER = 20;
export const MAX_CHECKLIST_LABEL_LENGTH = 100;

// ডিফল্ট আইটেম — HSC পরীক্ষার প্রচলিত প্রয়োজনীয়তা অনুযায়ী (Deep
// Research/সাধারণ জ্ঞান ভিত্তিক, board exam context এ প্রাসঙ্গিক)
export const DEFAULT_CHECKLIST_ITEMS: {
  category: ExamChecklistCategory;
  label: string;
  order: number;
}[] = [
  // পরীক্ষার আগের রাত
  { category: "NIGHT_BEFORE", label: "প্রবেশপত্র (Admit Card) ব্যাগে রাখা হয়েছে", order: 0 },
  { category: "NIGHT_BEFORE", label: "রেজিস্ট্রেশন কার্ড সাথে রাখা হয়েছে", order: 1 },
  { category: "NIGHT_BEFORE", label: "কলম, পেন্সিল, রাবার, শার্পনার গোছানো হয়েছে", order: 2 },
  { category: "NIGHT_BEFORE", label: "ক্যালকুলেটর/জ্যামিতি বক্স (প্রযোজ্য হলে) রাখা হয়েছে", order: 3 },
  { category: "NIGHT_BEFORE", label: "পরীক্ষার কেন্দ্রের ঠিকানা ও রুট আরেকবার দেখে নেওয়া হয়েছে", order: 4 },
  { category: "NIGHT_BEFORE", label: "অ্যালার্ম ঠিকমতো সেট করা হয়েছে (একাধিক অ্যালার্ম ভালো)", order: 5 },
  { category: "NIGHT_BEFORE", label: "গুরুত্বপূর্ণ ফর্মুলা শীট শেষবারের মতো দেখা হয়েছে", order: 6 },
  { category: "NIGHT_BEFORE", label: "যথেষ্ট ঘুম নিশ্চিত করার জন্য তাড়াতাড়ি শুয়ে পড়া হয়েছে", order: 7 },

  // পরীক্ষার দিন
  { category: "EXAM_DAY", label: "হালকা ও পুষ্টিকর নাস্তা করা হয়েছে", order: 0 },
  { category: "EXAM_DAY", label: "প্রবেশপত্র ও রেজিস্ট্রেশন কার্ড সাথে আছে কিনা আবার চেক করা হয়েছে", order: 1 },
  { category: "EXAM_DAY", label: "পানির বোতল সাথে নেওয়া হয়েছে", order: 2 },
  { category: "EXAM_DAY", label: "সময়ের অন্তত ৩০ মিনিট আগে কেন্দ্রে পৌঁছানো হয়েছে", order: 3 },
  { category: "EXAM_DAY", label: "পরীক্ষার হলে ঢোকার আগে কয়েক মিনিট শ্বাস-প্রশ্বাসের ব্যায়াম করা হয়েছে", order: 4 },
  { category: "EXAM_DAY", label: "মোবাইল ফোন/ইলেকট্রনিক ডিভাইস জমা দেওয়ার নিয়ম মনে রাখা হয়েছে", order: 5 },
];

/**
 * ইউজারের জন্য ডিফল্ট চেকলিস্ট আইটেম lazily seed করে (প্রথমবার এই
 * ফিচার ব্যবহার করার সময়)। established `getOrCreateStudyPet()` এর
 * মতো idempotent — ইতিমধ্যে আইটেম থাকলে কিছুই করে না।
 *
 * 🐛 প্রতিরোধমূলক ফিক্স (established "Dual/Multi-Caller Shared
 * Function" নীতি অনুসরণ করে, প্রথম থেকেই সঠিকভাবে লেখা): শুধু
 * `count === 0` চেক করে `createMany()` কল করলে দুইজন concurrent
 * রিকোয়েস্ট (যেমন দুইটা ট্যাব থেকে একই সাথে প্রথমবার পেজ লোড) উভয়েই
 * `count === 0` দেখে duplicate সিড ডেটা তৈরি করতে পারত। এখানে কোনো
 * `@@unique` constraint নেই (label ইউজার-এডিটেবল বলে), তাই atomic
 * upsert সম্ভব না — এর বদলে transaction এর ভেতরে `SELECT ... FOR
 * UPDATE` দিয়ে User row lock করে সেই একই race window বন্ধ করা হয়েছে
 * (established Habit Tracker capacity-check প্যাটার্নের অনুরূপ)।
 */
export async function ensureDefaultChecklistSeeded(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId} FOR UPDATE`;

    const existingCount = await tx.examChecklistItem.count({ where: { userId } });
    if (existingCount > 0) return;

    await tx.examChecklistItem.createMany({
      data: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        userId,
        category: item.category,
        label: item.label,
        order: item.order,
        isCustom: false,
      })),
    });
  });
}
