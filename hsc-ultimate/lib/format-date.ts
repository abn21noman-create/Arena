// ===================================================================
// Date/Time ফরম্যাটিং ইউটিলিটি — সাম্প্রতিক সময়ের জন্য relative format
// (যেমন "৫ মিনিট আগে", "২ ঘন্টা আগে") এবং পুরনো তারিখের জন্য পূর্ণ তারিখ
// -------------------------------------------------------------------
// date-fns এ ইতিমধ্যে বাংলা locale (bn) বিল্ট-ইন আছে (বাংলা সংখ্যা+টেক্সট
// দুটোই সঠিকভাবে হ্যান্ডেল করে), তাই কোনো নতুন dependency লাগেনি।
// আগে প্ল্যাটফর্মজুড়ে forum/notification এ শুধু পূর্ণ তারিখ দেখানো হতো
// (যেমন "১৬ জুলাই, ২০২৬") — নতুন পোস্ট/নোটিফিকেশনের জন্য এটা কম useful,
// ইউজারকে মানসিকভাবে হিসাব করতে হতো কতক্ষণ আগে হয়েছে। এখন থেকে ৭ দিনের
// মধ্যে হলে relative ("৩ ঘন্টা আগে"), তার বেশি পুরনো হলে পূর্ণ তারিখ।
// ===================================================================
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { bn } from "date-fns/locale";

/**
 * সাম্প্রতিক (৭ দিনের মধ্যে) সময়ের জন্য relative ("৫ মিনিট আগে"),
 * পুরনো হলে পূর্ণ বাংলা তারিখ (day/month/year, ঐচ্ছিক সময় সহ)।
 */
export function formatRelativeOrDate(
  input: string | Date,
  options?: { withTime?: boolean; longMonth?: boolean }
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const daysDiff = differenceInDays(new Date(), date);

  if (daysDiff < 7) {
    return formatDistanceToNow(date, { addSuffix: true, locale: bn });
  }

  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: options?.longMonth ? "long" : "short",
    year: "numeric",
    ...(options?.withTime ? { hour: "2-digit" as const, minute: "2-digit" as const } : {}),
  });
}
