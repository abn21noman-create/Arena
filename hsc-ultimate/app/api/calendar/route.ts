// ===================================================================
// Calendar View API — নির্দিষ্ট মাসের সব ইভেন্ট (Task/Study Plan/
// Routine/Exam Date) একসাথে
// GET /api/calendar?year=2026&month=7
// -------------------------------------------------------------------
// month 1-indexed (1=জানুয়ারি, 12=ডিসেম্বর) — জাভাস্ক্রিপ্ট এর
// 0-indexed কনভেনশন এড়াতে ইচ্ছাকৃতভাবে human-friendly রাখা হয়েছে,
// lib/calendar.ts এর ভেতরে প্রয়োজনমতো রূপান্তর হয়।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCalendarEvents } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const yearParam = req.nextUrl.searchParams.get("year");
  const monthParam = req.nextUrl.searchParams.get("month");

  const now = new Date();

  // 🐛 বাগ ফিক্স (Boolean/Numeric Validation bug hunt সিরিজের ধারাবাহিকতা,
  // established Pagination Integer Overflow/hscBatch এর একই ক্লাস):
  // আগে `parseInt(param, 10)` + শুধু `Number.isNaN()` চেক ছিল — এটা
  // দুই ধরনের সমস্যা মিস করত। (১) extreme digit-string
  // (`year=99999999999999999999`) → `parseInt()` বড় কিন্তু finite
  // integer রিটার্ন করে (NaN হয় না), যা পরে `new Date()` তে আউট-অফ-
  // রেঞ্জ হয়ে **৫০০ crash** করত (লাইভ টেস্টে প্রমাণিত)। (২)
  // scientific-notation string (`year=1e300`) → `parseInt()` শুধু
  // leading digits পড়ে (`"1e300"` → `1`), silently ভুল/অর্থহীন বছর
  // (`year: 1`) দিয়ে খালি events array রিটার্ন করত কোনো error ছাড়াই
  // (silent data corruption, `month=1e300` এও একই সমস্যা `month: 1`
  // এ রূপান্তরিত হয়ে valid রেঞ্জে (১-১২) পড়ে যেত)। ফিক্স:
  // `parseInt()` এর বদলে `Number()` ব্যবহার (scientific-notation
  // পুরোপুরি বড় সংখ্যায় রূপান্তরিত হয়, truncate হয় না) + সাথে
  // `Number.isSafeInteger()` + বাস্তবসম্মত রেঞ্জ চেক।
  const MIN_CALENDAR_YEAR = 1900;
  const MAX_CALENDAR_YEAR = 2100;
  const year = yearParam ? Number(yearParam) : now.getFullYear();
  const month = monthParam ? Number(monthParam) : now.getMonth() + 1;

  const isValidYear =
    Number.isSafeInteger(year) && year >= MIN_CALENDAR_YEAR && year <= MAX_CALENDAR_YEAR;
  const isValidMonth = Number.isSafeInteger(month) && month >= 1 && month <= 12;

  if (!isValidYear || !isValidMonth) {
    return NextResponse.json({ error: "বছর/মাস সঠিক না" }, { status: 400 });
  }

  const events = await getCalendarEvents(session.user.id, year, month);

  return NextResponse.json({ year, month, events });
}
