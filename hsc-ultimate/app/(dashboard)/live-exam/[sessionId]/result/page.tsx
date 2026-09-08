// ===================================================================
// Live Exam Result পেজ (Server Component wrapper) — auth চেক করে client
// component দেয় (established Mock Exam Result পেজের একই প্যাটার্ন)
// -------------------------------------------------------------------
// 🔧 সম্প্রসারণ (এই সেশনে): আগে এই পেজেই সরাসরি Prisma দিয়ে স্কোর/
// পার্সেন্টেজ ফেচ করে দেখাতো (কোনো প্রশ্ন-ভিত্তিক রিভিউ ছিল না)। এখন
// established Practice/Mock Exam Result এর মতো পূর্ণাঙ্গ MCQ রিভিউ +
// AI ব্যাখ্যা বাটন দেখানোর জন্য client component
// (`LiveExamResult`) কে দায়িত্ব দেওয়া হয়েছে, যেটা নতুন
// `/api/live-exam/[sessionId]/result` endpoint কল করে।
// ===================================================================
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LiveExamResult } from "@/components/live-exam/live-exam-result";

export default async function LiveExamResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { sessionId } = await params;

  return <LiveExamResult sessionId={sessionId} />;
}
