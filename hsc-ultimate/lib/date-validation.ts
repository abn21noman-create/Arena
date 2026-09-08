// ===================================================================
// Date String Validation — শেয়ার্ড হেল্পার
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
// lib/enum-validation.ts/lib/image-validation.ts এর একই "input
// validation consistency" ক্লাস): ইউজার থেকে আসা date স্ট্রিং (যেমন
// Task `dueDate`, User `examDate`) কোনো validity চেক ছাড়াই সরাসরি
// `new Date(userInput)` করে Prisma create/update এ পাস করা হতো।
// একটা invalid স্ট্রিং (যেমন "garbage-date") `new Date()` কে
// `Invalid Date` অবজেক্ট তৈরি করতে বাধ্য করে (throw করে না, কিন্তু
// `.getTime()` NaN রিটার্ন করে) — Prisma এই Invalid Date অবজেক্ট
// পেলে `PrismaClientValidationError` throw করে, যেটা unhandled থেকে
// generic ৫০০ crash হয়ে যেত (৪০০ Bad Request হওয়া উচিত ছিল)। লাইভ
// টেস্টে Task dueDate ও User examDate উভয়েই প্রমাণিত হয়েছে। ফিক্স:
// `new Date()` করার আগেই `isValidDateString()` দিয়ে ভ্যালিডেট করা।
// ===================================================================

/**
 * একটা স্ট্রিং বৈধ পার্স-যোগ্য তারিখ কিনা যাচাই করে। `undefined`/
 * `null`/খালি স্ট্রিং কে বৈধ ধরা হয় (optional field, caller নিজে
 * প্রয়োজন হলে আলাদাভাবে required চেক করবে) — শুধু "truthy কিন্তু
 * Date হিসেবে পার্স করা যায় না" এমন ভ্যালু reject করা হয়।
 */
export function isValidDateString(value: unknown): value is string {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}
