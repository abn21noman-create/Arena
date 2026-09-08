// ===================================================================
// সাধারণ Numeric Input Validation — শেয়ার্ড হেল্পার
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
// Pagination Integer Overflow Crash এর একই "safe-integer" ক্লাস, কিন্তু
// এবার ব্যবসায়িক-ডোমেইন ফিল্ড `hscBatch`-এ): `Profile`/`Onboarding`
// endpoint এ `hscBatch: hscBatch ? Number(hscBatch) : undefined` লেখা
// ছিল। এটা তিন ধরনের সমস্যা তৈরি করত:
// (১) non-numeric string/array/object ("abc", [1,2,3], {}) →
//     `Number()` `NaN` রিটার্ন করে, Prisma `Int` ফিল্ডে `NaN` পাঠালে
//     `PrismaClientValidationError` throw করে unhandled ৫০০ crash।
// (২) extreme digit-string/scientific-notation ("99999999999999999999",
//     "1e300") → 64-bit integer সীমার বাইরে চলে গিয়ে একই crash
//     (established Pagination Integer Overflow bug এর মতো)।
// (৩) valid-but-unrealistic মান (hscBatch=null → falsy → Number(null)
//     আসলে `?` কন্ডিশনে undefined হয়ে যেত না বরং `0` হয়ে যেত যদি
//     `!== undefined` চেক থাকত, hscBatch=-5, hscBatch=1) — কোনো ৫০০
//     crash না কিন্তু silently ভুল ডেটা সেভ হয়ে যাচ্ছিল (exam
//     countdown, batch-based UI সব ভেঙে যেতে পারে)।
// ফিক্স: `isValidHscBatch()` — `typeof === "number"` +
// `Number.isSafeInteger()` + বাস্তবসম্মত বছরের রেঞ্জ (২০২০-২০৫০)
// সবগুলো একসাথে চেক করে।
// ===================================================================

// HSC ব্যাচ বছরের বাস্তবসম্মত রেঞ্জ — UI তে বর্তমানে ২০২৬-২০২৯ বাটন
// দেখানো হয় কিন্তু ভবিষ্যতে নতুন ব্যাচ যোগ হতে পারে, তাই একটু বেশি
// রক্ষণশীল রেঞ্জ (fixed hardcoded বছর UI-তে না বেঁধে) ব্যবহার করা হলো।
export const MIN_HSC_BATCH = 2020;
export const MAX_HSC_BATCH = 2050;

/**
 * `hscBatch` ফিল্ডের জন্য নিরাপদ ভ্যালিডেশন — শুধু `typeof number` ও
 * `Number.isFinite()` যথেষ্ট না (extreme মান/non-safe-integer এখনো
 * Prisma `Int` ফিল্ডে ক্র্যাশ করাতে পারে), তাই `Number.isSafeInteger()`
 * ও বাস্তবসম্মত রেঞ্জ — দুটোই চেক করা হচ্ছে।
 */
export function isValidHscBatch(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= MIN_HSC_BATCH &&
    value <= MAX_HSC_BATCH
  );
}

// ===================================================================
// 🐛 বাগ ফিক্স (hscBatch Numeric Validation এর একই ক্লাস, কিন্তু
// এবার Question/CQQuestion.boardYear ফিল্ডে — broad-grep দিয়ে বাকি
// `Number()` conversion call cross-check করার সময় আবিষ্কৃত):
// Admin Question/CQ Question create/update/bulk-CSV endpoint গুলোতে
// `boardYear: boardYear ? Number(boardYear) : null` প্যাটার্ন ছিল।
// লাইভ টেস্টে তিন ধরনের সমস্যা প্রমাণিত —
// (১) extreme digit-string/scientific-notation ("1e300",
//     "99999999999999999999") → 64-bit integer সীমার বাইরে গিয়ে
//     Prisma **৫০০ crash** (`create question`/`PATCH question`/
//     `PATCH cq-question`/`bulk CSV` সবগুলোতেই প্রমাণিত)।
// (২) non-numeric string/array ("abc", [1,2,3]) → `Number()` `NaN`
//     রিটার্ন করে, JSON.stringify() `NaN`-কে `null`-এ রূপান্তর করে
//     ফেলায় Prisma কে `null` পাঠানো হয় (crash হয় না) — কিন্তু এটা
//     established real content-এর `boardYear` কে **নীরবে মুছে
//     দেয়** (silent data loss, admin বুঝতেই পারে না)। লাইভ টেস্টে
//     established প্রশ্ন ("SI পদ্ধতিতে বলের একক কী?") এ
//     `boardYear: "abc"` PATCH করে boardYear null হয়ে যাওয়া
//     প্রমাণিত হয়েছে (পরে restore করা হয়েছে)।
// (৩) negative/unrealistic মান (boardYear=-50, boardYear=1) — কোনো
//     crash না কিন্তু ভুল ডেটা সেভ (UI তে "📅 ঢাকা বোর্ড -50" এর
//     মতো অর্থহীন ব্যাজ দেখাবে)।
// ফিক্স: `isValidOptionalBoardYear()` — `undefined`/`null` (ঐচ্ছিক
// ফিল্ড, বোর্ড পরীক্ষার প্রশ্ন না হলে খালি রাখা যায়) অথবা প্রকৃত
// `number` + `Number.isSafeInteger()` + বাস্তবসম্মত রেঞ্জ একসাথে
// চেক করে।
// ===================================================================

// বোর্ড পরীক্ষার বছরের বাস্তবসম্মত রেঞ্জ — SSC/HSC board question
// archive সাধারণত বহু পুরনো বছরও কভার করতে পারে, তাই একটু বেশি
// রক্ষণশীল নিচের সীমা, উপরের সীমা বর্তমান বছরের কাছাকাছি ভবিষ্যতেও
// একটু flexibility রেখে।
export const MIN_BOARD_YEAR = 1990;
export const MAX_BOARD_YEAR = 2035;

/**
 * `boardYear` ফিল্ডের জন্য নিরাপদ ভ্যালিডেশন — `undefined`/`null`
 * বৈধ (ঐচ্ছিক ফিল্ড), নাহলে অবশ্যই `Number.isSafeInteger()` +
 * বাস্তবসম্মত রেঞ্জের মধ্যে একটা `number` হতে হবে।
 */
export function isValidOptionalBoardYear(
  value: unknown
): value is number | null | undefined {
  if (value === undefined || value === null) return true;
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= MIN_BOARD_YEAR &&
    value <= MAX_BOARD_YEAR
  );
}
