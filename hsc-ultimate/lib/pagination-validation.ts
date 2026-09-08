// ===================================================================
// Pagination Query Param Validation — শেয়ার্ড হেল্পার
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স: `page`/`pageSize` কোয়েরি প্যারামিটার `Number()`/
// `parseInt()` দিয়ে parse করার পর কোনো upper-bound/safe-integer চেক
// ছাড়াই সরাসরি Prisma `skip`/`take`-এ পাঠানো হতো। `?page=1e300` বা
// `?page=99999999999999999999`-এর মতো extreme মান দিলে সেটা
// PostgreSQL/Prisma-এর 64-bit signed integer সীমার বাইরে চলে যেত,
// ফলে `PrismaClientValidationError` হয়ে পুরো এন্ডপয়েন্ট ৫০০ ক্র্যাশ
// করত (Admin Users, Admin Audit Log, Notifications — ৩টা এন্ডপয়েন্ট)।
// এই হেল্পার `Number.isSafeInteger()` চেক করে invalid/unsafe মান
// পেলে চুপচাপ fallback (ডিফল্ট) ব্যবহার করে — কোনো ক্র্যাশ না, কোনো
// এরর-বার্তা লিক না (established fail-open প্যাটার্ন, GET Query Enum
// ফিক্সের মতো)।
// ===================================================================

/**
 * একটা pagination query param (page/pageSize/skip ইত্যাদি) স্ট্রিং কে
 * নিরাপদে সংখ্যায় পার্স করে — অবৈধ/asafe/non-integer মান পেলে fallback
 * রিটার্ন করে, কখনো crash করে না।
 */
export function parsePaginationParam(
  raw: string | null | undefined,
  fallback: number,
  opts?: { min?: number; max?: number }
): number {
  if (raw === null || raw === undefined || raw.trim() === "") return fallback;

  const n = Number(raw);

  // NaN, Infinity, non-integer (1.5), বা 64-bit safe range এর বাইরে
  // (যেমন 1e300, 99999999999999999999) — সব ক্ষেত্রে fallback।
  if (!Number.isSafeInteger(n)) return fallback;

  let value = n;
  if (opts?.min !== undefined) value = Math.max(opts.min, value);
  if (opts?.max !== undefined) value = Math.min(opts.max, value);
  return value;
}
