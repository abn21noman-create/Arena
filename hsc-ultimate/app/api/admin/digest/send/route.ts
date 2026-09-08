// ===================================================================
// Admin: সাপ্তাহিক ডাইজেস্ট ইমেইল সব eligible ইউজারকে পাঠানো
// POST /api/admin/digest/send
// -------------------------------------------------------------------
// প্ল্যাটফর্মে এখনো কোনো cron/scheduled job ইনফ্রা নেই (deploy স্থগিত),
// তাই আপাতত admin ম্যানুয়ালি এই বাটনে ক্লিক করে সপ্তাহে একবার পাঠাবে।
// Deploy করার সময় এই একই লজিক Vercel Cron দিয়ে সপ্তাহে একবার
// অটোমেটিক কল করা যাবে (কোড পরিবর্তনের দরকার নেই, শুধু vercel.json এ
// cron entry যোগ করে এই এন্ডপয়েন্ট hit করলেই চলবে)।
// -------------------------------------------------------------------
// getEligibleDigestUserIds() নিজে থেকেই ডুপ্লিকেট-প্রতিরোধী (৭ দিনের কম
// গ্যাপে আবার পাঠাবে না), তাই বারবার ক্লিক করলেও নিরাপদ (idempotent-ish)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { getEligibleDigestUserIds, getWeeklyDigestData } from "@/lib/weekly-digest";
import { sendWeeklyDigestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const settingsUrl = `${baseUrl}/settings`;

  const eligibleUserIds = await getEligibleDigestUserIds();

  if (eligibleUserIds.length === 0) {
    return NextResponse.json({
      success: true,
      sentCount: 0,
      failedCount: 0,
      message: "এই মুহূর্তে পাঠানোর মতো কোনো eligible ইউজার নেই (সবাইকে গত ৭ দিনে পাঠানো হয়ে গেছে অথবা তারা ডাইজেস্ট বন্ধ রেখেছে)।",
    });
  }

  let sentCount = 0;
  let failedCount = 0;
  const failedEmails: string[] = [];

  // সিরিয়ালি পাঠানো হচ্ছে (bulk parallel এ Resend rate limit এ ধাক্কা
  // খাওয়ার ঝুঁকি আছে, ছোট ব্যাচে এটা যথেষ্ট দ্রুত)
  for (const userId of eligibleUserIds) {
    try {
      const digestData = await getWeeklyDigestData(userId);
      if (!digestData) {
        failedCount += 1;
        continue;
      }

      const result = await sendWeeklyDigestEmail(digestData, settingsUrl);
      if (result.success) {
        sentCount += 1;
        await prisma.user.update({
          where: { id: userId },
          data: { lastDigestSentAt: new Date() },
        });
      } else {
        failedCount += 1;
        failedEmails.push(digestData.email);
      }
    } catch (err) {
      console.error(`Weekly Digest ব্যর্থ (userId=${userId}):`, err);
      failedCount += 1;
    }
  }

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "WEEKLY_DIGEST_SEND",
      metadata: { sentCount, failedCount, eligibleCount: eligibleUserIds.length },
      req,
    });
  }

  return NextResponse.json({
    success: true,
    sentCount,
    failedCount,
    failedEmails,
  });
}
