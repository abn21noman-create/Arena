// ===================================================================
// Timed Drill — client-safe constants
// -------------------------------------------------------------------
// এই কনস্ট্যান্টগুলো ক্লায়েন্ট কম্পোনেন্ট (`components/practice/drill-intro.tsx`)
// এবং সার্ভার কোড — দুই জায়গাতেই দরকার।
//
// কেন আলাদা ফাইল: `lib/drill-practice.ts` প্রিজমা (`@/lib/prisma`) import করে,
// যা `pg` → `dns` টেনে আনে। ক্লায়েন্ট কম্পোনেন্ট সেখান থেকে import করলে পুরো
// সার্ভার-অনলি চেইন ব্রাউজার বান্ডলে ঢুকে `Module not found: Can't resolve 'dns'`
// দিয়ে পেজ ক্র্যাশ করে। তাই শুধু কনস্ট্যান্টগুলো এই ফাইলে রাখা হলো — এখানে
// কোনো সার্ভার-অনলি dependency নেই।
// ===================================================================

export const DRILL_DURATIONS = [30, 60, 90] as const;
export type DrillDuration = (typeof DRILL_DURATIONS)[number];
export const DEFAULT_DRILL_DURATION: DrillDuration = 60;

export function isValidDrillDuration(value: unknown): value is DrillDuration {
  return DRILL_DURATIONS.includes(value as DrillDuration);
}
