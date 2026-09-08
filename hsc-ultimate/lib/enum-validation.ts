// ===================================================================
// Prisma Enum Validation — শেয়ার্ড হেল্পার
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
// Image Upload Size Validation/Missing Text Length Validation এর একই
// "input validation consistency" ক্লাস): ইউজার থেকে সরাসরি আসা enum
// ভ্যালু (যেমন `priority`, `category`, `subjectCode`, `type`) কোনো
// ভ্যালিডেশন ছাড়াই সরাসরি Prisma create/update এ পাস করা হতো (শুধু
// `value || "DEFAULT"` fallback দিয়ে undefined/null হ্যান্ডল করা হতো,
// কিন্তু invalid-but-truthy স্ট্রিং যেমন "URGENT_INVALID" ফিল্টার হতো
// না)। Prisma অজানা enum ভ্যালু পেলে `PrismaClientValidationError`
// throw করে, যেটা unhandled থেকে generic ৫০০ crash হয়ে যেত (৪০০ Bad
// Request হওয়া উচিত ছিল)। লাইভ টেস্টে ৪টা endpoint এ (Task priority,
// Forum Post category, Study Session type, Routine subjectCode)
// এই একই bug pattern প্রমাণিত হয়েছে। ফিক্স: প্রতিটা enum এর বৈধ
// ভ্যালু লিস্ট এখানে কেন্দ্রীভূত করে একটা জেনেরিক `isValidEnumValue()`
// হেল্পার দিয়ে সব caller এ ভ্যালিডেট করা হচ্ছে।
// ===================================================================

export const VALID_SUBJECT_CODES = [
  "BANGLA",
  "ENGLISH",
  "ICT",
  "PHYSICS",
  "CHEMISTRY",
  "BIOLOGY",
  "HIGHER_MATH",
] as const;

export const VALID_TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export const VALID_TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

export const VALID_POST_CATEGORIES = [
  "QUESTION",
  "DISCUSSION",
  "NOTE_SHARE",
  "ANNOUNCEMENT",
] as const;

export const VALID_STUDY_SESSION_TYPES = [
  "POMODORO",
  "READING",
  "PRACTICE",
  "FLASHCARD_REVIEW",
] as const;

// 🐛 বাগ ফিক্স (Missing Enum/Text Length Validation bug hunt সিরিজের
// ধারাবাহিকতা, broad-grep এ আবিষ্কৃত): `User.board` ফিল্ডে
// `components/settings/settings-form.tsx` এর established `BOARDS`
// ড্রপডাউন লিস্টের বাইরে কোনো ভ্যালিডেশন ছিল না — `PATCH
// /api/user/profile` এ সরাসরি `board` স্ট্রিং নেওয়া হতো কোনো
// enum/length চেক ছাড়াই। লাইভ টেস্টে প্রমাণিত: `board:
// "INVALID_BOARD_XYZ_123"` ও `board: "ক".repeat(10000)` উভয়ই ২০০
// সফল রেসপন্স দিয়ে সরাসরি সেভ হয়ে গেছে (established admin
// অ্যাকাউন্টে সরাসরি প্রমাণিত, পরে restore করা হয়েছে)। এই লিস্ট
// ফ্রন্টএন্ডের `BOARDS` array এর সাথে মিরর করা — কোনো একটাতে
// পরিবর্তন হলে অন্যটাও আপডেট করতে হবে।
export const VALID_BOARDS = [
  "ঢাকা",
  "রাজশাহী",
  "চট্টগ্রাম",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "দিনাজপুর",
  "ময়মনসিংহ",
  "কুমিল্লা",
  "যশোর",
] as const;

// একই bug hunt এ পাওয়া গেছে `User.name` ফিল্ডেও (Profile Update PATCH)
// কোনো max-length limit ছিল না — লাইভ টেস্টে ৫০০০ অক্ষরের নাম সরাসরি
// সেভ হয়ে যাওয়া প্রমাণিত (established admin অ্যাকাউন্টের real নাম
// একটি দীর্ঘ test name প্রতিস্থাপিত হয়ে গিয়েছিল, পরে raw SQL দিয়ে
// restore করতে হয়েছে কারণ বিশাল নাম NextAuth JWT session cookie কে
// এত বড় করে দিয়েছিল যে পরবর্তী লগইন attempt নিজেই HTTP ৪৩১ "Request
// Header Fields Too Large" দিয়ে ব্যর্থ হচ্ছিল — একটা "self-lockout"
// সাইড-ইফেক্ট যা established Text Length Validation bug hunt এর
// অন্য কোনো ফিল্ডে দেখা যায়নি, কারণ `name` সরাসরি JWT payload এ থাকে)।
export const MAX_USER_NAME_LENGTH = 100;

/**
 * একটা ভ্যালু একটা নির্দিষ্ট বৈধ enum ভ্যালুর লিস্টে আছে কিনা যাচাই
 * করে (undefined/null কে বৈধ ধরা হয়, কারণ optional field এ সেটা
 * default ব্যবহার করার সংকেত — caller নিজে required হলে আলাদাভাবে
 * `!value` চেক করবে)।
 */
export function isValidEnumValue<T extends string>(
  value: unknown,
  validValues: readonly T[]
): value is T {
  if (value === undefined || value === null) return true;
  return typeof value === "string" && (validValues as readonly string[]).includes(value);
}
