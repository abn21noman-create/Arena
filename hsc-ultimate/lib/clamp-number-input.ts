// ===================================================================
// Number Input ভ্যালিডেশন হেল্পার — খালি/NaN/আউট-অফ-রেঞ্জ ভ্যালু হ্যান্ডেল
// -------------------------------------------------------------------
// আগে কিছু ফর্মে (Quiz Battle max players, Live Exam question count/
// duration) সরাসরি `Number(e.target.value)` করে state এ বসানো হতো —
// ইউজার input খালি করলে (`Number("")` === 0) বা backspace করে মাঝপথে
// অক্ষর মুছলে NaN/0 এর মতো অপ্রত্যাশিত ভ্যালু state এ চলে যেত।
//
// ⚠️ গুরুত্বপূর্ণ ডিজাইন সিদ্ধান্ত: `onChange` এ সরাসরি clamp করলে একটা
// খারাপ UX bug হয় — ইউজার field খালি করে নতুন সংখ্যা টাইপ করতে গেলে
// controlled input তাৎক্ষণিক আগের ভ্যালুতে "ফিরে" যায় (কারণ প্রতি
// keystroke এ empty string detect হয়ে fallback এ চলে যায়), ফলে ইউজার
// backspace/retype করতেই পারে না। তাই এই hook ব্যবহারকারী কম্পোনেন্ট
// input value স্ট্রিং হিসেবে রাখে (টাইপ করার সময় স্বাধীনভাবে বদলাতে
// দেয়), আর এই `clampNumberInput()` ফাংশন শুধু `onBlur` (ফোকাস হারানোর
// সময়) ও submit করার মুহূর্তে ব্যবহার করে চূড়ান্ত ভ্যালু নির্ধারণ করে।
// ===================================================================
export function clampNumberInput(
  rawValue: string,
  min: number,
  max: number,
  fallback: number
): number {
  if (rawValue.trim() === "") return fallback;
  const parsed = Number(rawValue);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}
