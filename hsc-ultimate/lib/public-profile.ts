// ===================================================================
// Public Profile/Portfolio Share — Helper Functions
// -------------------------------------------------------------------
// Seesaw-অনুপ্রাণিত ফিচার: ইউজার চাইলে নিজের badge/streak/XP/level একটা
// শেয়ারযোগ্য পাবলিক লিংকে (/u/[slug]) দেখাতে পারবে। ডিফল্টে বন্ধ
// (privacy-first) — ইউজার নিজে চালু করে এবং একটা ইউনিক slug বেছে নেয়।
// slug এ কোনো ব্যক্তিগত তথ্য (email, real ID) থাকে না — সম্পূর্ণ
// ইউজার-নির্বাচিত (যেমন "rafi-hsc28")।
// ===================================================================
import { prisma } from "@/lib/prisma";

// শুধু lowercase ইংরেজি অক্ষর, সংখ্যা, হাইফেন অনুমোদিত — URL-safe রাখার জন্য
const SLUG_PATTERN = /^[a-z0-9-]{3,30}$/;

// রিজার্ভড slug — সিস্টেম রুটের সাথে সংঘর্ষ এড়াতে (যেমন কেউ "admin" slug
// নিলে /u/admin তৈরি হতো যা বিভ্রান্তিকর, যদিও /u/ প্রিফিক্স আলাদা তবুও
// safety হিসেবে রাখা হলো)
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "register",
  "dashboard",
  "settings",
  "new",
  "null",
  "undefined",
]);

export interface SlugValidationResult {
  valid: boolean;
  error?: string;
}

/** slug ফরম্যাট ভ্যালিড কিনা যাচাই করে (DB uniqueness চেক আলাদা) */
export function validateSlugFormat(slug: string): SlugValidationResult {
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return {
      valid: false,
      error: "শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও হাইফেন (৩-৩০ অক্ষর) ব্যবহার করা যাবে",
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, error: "এই নামটা ব্যবহার করা যাবে না, অন্য কিছু বেছে নাও" };
  }
  return { valid: true };
}

/**
 * নাম থেকে একটা suggested slug বানায় (যেমন "রাফি" বা "Rafi Ahmed" থেকে
 * "rafi-ahmed" জাতীয় কিছু) — শুধু ইংরেজি অক্ষর থাকলে কাজ করে, বাংলা নাম
 * হলে খালি স্ট্রিং রিটার্ন করে (ইউজারকে নিজে টাইপ করতে হবে)।
 */
export function suggestSlugFromName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
  return cleaned.length >= 3 ? cleaned : "";
}

/**
 * পাবলিক প্রোফাইল পেজের জন্য প্রয়োজনীয় সব ডেটা fetch করে। slug দিয়ে খোঁজে,
 * publicProfileEnabled=false হলে বা slug না পেলে null রিটার্ন করে
 * (privacy enforcement — বন্ধ থাকলে কখনো ডেটা লিক হবে না)।
 */
export async function getPublicProfileBySlug(slug: string) {
  const user = await prisma.user.findUnique({
    where: { profileSlug: slug },
    select: {
      id: true,
      name: true,
      image: true,
      hscBatch: true,
      board: true,
      xp: true,
      level: true,
      streakCount: true,
      longestStreak: true,
      leagueTier: true,
      publicProfileEnabled: true,
      createdAt: true,
      userBadges: {
        select: {
          earnedAt: true,
          badge: {
            select: { code: true, name: true, iconEmoji: true, description: true },
          },
        },
        orderBy: { earnedAt: "desc" },
      },
    },
  });

  if (!user || !user.publicProfileEnabled) return null;

  return user;
}
