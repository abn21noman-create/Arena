// ===================================================================
// Boolean Field Validation — শেয়ার্ড হেল্পার
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt সিরিজের নতুন
// ক্লাস, established Enum/Numeric Validation এর একই "input validation
// consistency" দর্শন — এবার boolean ইনপুট): ইউজার থেকে সরাসরি আসা
// boolean-সদৃশ ফিল্ড (isPublic, isArchived, isCompleted, isChecked,
// isResolved, enabled ইত্যাদি) দুই ধরনের bug pattern এ পাওয়া গেছে:
//
// (১) **Crash bug**: কোনো টাইপ চেক ছাড়াই সরাসরি Prisma তে পাস করা
//     (`{ isPublic }` স্প্রেড করে) — non-boolean (string/number/array)
//     দিলে Prisma `PrismaClientValidationError` throw করে ৫০০ crash
//     করে। লাইভ টেস্টে প্রমাণিত: `PATCH /api/habits/[id]` এ
//     `isArchived: []`/`isArchived: "false"`/`isArchived: 0` — প্রতিটাই
//     ৫০০ crash দিয়েছে। একই bug `PATCH /api/flashcard-decks/[deckId]`
//     এর `isPublic` ফিল্ডেও প্রমাণিত (`isPublic: []` → ৫০০)।
//
// (২) **সাইলেন্ট ডেটা করাপশন bug (ক্র্যাশের চেয়েও খারাপ)**: `!!value`
//     দিয়ে coerce করা endpoint এ — জাভাস্ক্রিপ্টে যেকোনো non-empty
//     string (এমনকি `"false"` বা `"0"`) truthy, তাই `!!"false"` ===
//     `true`। লাইভ টেস্টে প্রমাণিত: `PATCH /api/forum/posts/[id]/
//     resolve` এ `{ isResolved: "false" }` (string) পাঠালে ২০০ সফল
//     রেসপন্স দিয়েছে কিন্তু `isResolved: true` সেভ হয়েছে — ইউজার
//     "resolved বাতিল করো" চাইলেও উল্টো ফলাফল, কোনো error ছাড়াই।
//
// ফিক্স: `isValidOptionalBoolean()` দিয়ে "undefined (না দিলে ঠিক আছে)
// বা প্রকৃত boolean (true/false)" ছাড়া অন্য কিছু হলে সরাসরি ৪০০
// Bad Request রিটার্ন করা — established `isValidEnumValue()` এর একই
// "allow undefined, strictly validate the rest" দর্শন।
// ===================================================================

/**
 * `value` যদি `undefined` (ফিল্ড দেওয়া হয়নি, তাই বৈধ — অপরিবর্তিত
 * থাকবে) অথবা প্রকৃত `boolean` (true/false) হয় তবেই `true` রিটার্ন করে।
 * string ("true"/"false"/"1"), number (0/1), array, object, null — এসব
 * ক্ষেত্রে `false` রিটার্ন করে (caller কে ৪০০ Bad Request দিতে বলে)।
 *
 * established `isValidEnumValue()` এর মতোই ব্যবহার করা হয়:
 * ```ts
 * if (!isValidOptionalBoolean(isPublic)) {
 *   return NextResponse.json({ error: "isPublic true/false হতে হবে" }, { status: 400 });
 * }
 * ```
 */
export function isValidOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === "boolean";
}

/**
 * `value` অবশ্যই একটা প্রকৃত `boolean` হতে হবে (undefined গ্রহণযোগ্য
 * না — এই ফিল্ড বাধ্যতামূলক এমন endpoint এর জন্য, যেমন Admin Ban যেখানে
 * `banned` ছাড়া কল করা অর্থহীন)।
 */
export function isValidRequiredBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
