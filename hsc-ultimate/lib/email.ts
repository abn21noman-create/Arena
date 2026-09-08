// ===================================================================
// Email Service — Resend দিয়ে ইমেইল পাঠানো (Forgot Password ইত্যাদির জন্য)
// -------------------------------------------------------------------
// Resend এর ফ্রি টায়ারে নিজের ভেরিফাই করা ডোমেইন না থাকলে "onboarding@resend.dev"
// থেকে ইমেইল পাঠানো যায় (শুধু নিজের রেজিস্টার করা ইমেইলে পাঠানো যাবে, টেস্টিং এর জন্য যথেষ্ট)
// ===================================================================
import { Resend } from "resend";
import type { WeeklyDigestData } from "@/lib/weekly-digest";

const resend = new Resend(process.env.RESEND_API_KEY);

// প্রোডাকশনে নিজের ডোমেইন ভেরিফাই করে এই ঠিকানা বদলে দিতে হবে
const FROM_ADDRESS = "HSC Ultimate <onboarding@resend.dev>";

/**
 * পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠায়
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY সেট করা নেই — ইমেইল পাঠানো যায়নি");
    return { success: false, error: "ইমেইল সার্ভিস কনফিগার করা নেই" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: "HSC Ultimate — পাসওয়ার্ড রিসেট করো",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #6d28d9;">পাসওয়ার্ড রিসেট রিকোয়েস্ট</h2>
          <p>তুমি HSC Ultimate এর পাসওয়ার্ড রিসেট করার রিকোয়েস্ট করেছো। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করো:</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              পাসওয়ার্ড রিসেট করো
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">এই লিংকটি ১ ঘণ্টা পর্যন্ত কার্যকর থাকবে। তুমি যদি এই রিকোয়েস্ট না করে থাকো, এই ইমেইলটি উপেক্ষা করো।</p>
          <p style="color: #999; font-size: 12px;">লিংক কাজ না করলে এটা কপি-পেস্ট করো: ${resetUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email Send Error:", err);
    return { success: false, error: "ইমেইল পাঠাতে সমস্যা হয়েছে" };
  }
}

/**
 * সাপ্তাহিক প্রগ্রেস ডাইজেস্ট ইমেইল পাঠায় (Notification Digest ফিচার)
 * — গত ৭ দিনের প্র্যাকটিস/স্টাডি সামারি, streak, দুর্বল টপিক রিমাইন্ডার।
 * settingsUrl দিয়ে ইউজার সরাসরি Settings পেজে গিয়ে বন্ধ করতে পারবে।
 */
export async function sendWeeklyDigestEmail(
  data: WeeklyDigestData,
  settingsUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY সেট করা নেই — ডাইজেস্ট ইমেইল পাঠানো যায়নি");
    return { success: false, error: "ইমেইল সার্ভিস কনফিগার করা নেই" };
  }

  const {
    name,
    email,
    weekQuestionsAnswered,
    weekCorrectAnswers,
    weekAccuracyPct,
    weekStudyMinutes,
    weekXpEarned,
    currentStreak,
    topWeakTopic,
    hasAnyActivity,
  } = data;

  const summaryHtml = hasAnyActivity
    ? `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; background: #f5f3ff; border-radius: 8px 0 0 8px; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #6d28d9;">${weekQuestionsAnswered}</div>
            <div style="font-size: 12px; color: #666;">প্রশ্ন উত্তর দেওয়া</div>
          </td>
          <td style="padding: 10px; background: #f0fdf4; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #16a34a;">${weekAccuracyPct}%</div>
            <div style="font-size: 12px; color: #666;">সঠিক উত্তরের হার</div>
          </td>
          <td style="padding: 10px; background: #fffbeb; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #d97706;">${weekStudyMinutes}</div>
            <div style="font-size: 12px; color: #666;">মিনিট পড়াশোনা</div>
          </td>
          <td style="padding: 10px; background: #fdf2f8; border-radius: 0 8px 8px 0; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #db2777;">+${weekXpEarned}</div>
            <div style="font-size: 12px; color: #666;">আনুমানিক XP</div>
          </td>
        </tr>
      </table>
      <p style="color: #444; font-size: 14px;">তুমি এই সপ্তাহে ${weekQuestionsAnswered}টা প্রশ্নের মধ্যে ${weekCorrectAnswers}টা সঠিক উত্তর দিয়েছো। বর্তমান স্ট্রিক: 🔥 ${currentStreak} দিন।</p>
      ${
        topWeakTopic
          ? `<p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 14px; border-radius: 6px; color: #991b1b; font-size: 14px;">⚠️ <strong>${topWeakTopic.name}</strong> টপিকে তোমার accuracy ছিল মাত্র ${topWeakTopic.accuracyPct}% — এই সপ্তাহে এটা নিয়ে বেশি প্র্যাকটিস করো!</p>`
          : ""
      }
    `
    : `
      <p style="color: #444; font-size: 14px;">এই সপ্তাহে তোমার কোনো প্র্যাকটিস অ্যাক্টিভিটি রেকর্ড হয়নি। HSC 2028 এর প্রস্তুতিতে ধারাবাহিকতা খুব গুরুত্বপূর্ণ — আজই কিছুক্ষণ প্র্যাকটিস করে স্ট্রিক শুরু করো!</p>
    `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: hasAnyActivity
        ? `📊 ${name}, তোমার এই সপ্তাহের HSC প্রগ্রেস রিপোর্ট`
        : `👋 ${name}, তোমাকে মিস করছি — এই সপ্তাহে ফিরে আসো!`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #6d28d9;">সাপ্তাহিক প্রগ্রেস সামারি — HSC Ultimate</h2>
          <p>হ্যালো ${name},</p>
          ${summaryHtml}
          <p style="margin: 24px 0;">
            <a href="${settingsUrl.replace("/settings", "/dashboard")}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              এখনই প্র্যাকটিস করো
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">
            এই সাপ্তাহিক ইমেইল বন্ধ করতে চাইলে <a href="${settingsUrl}" style="color: #6d28d9;">Settings</a> পেজে গিয়ে "সাপ্তাহিক ইমেইল ডাইজেস্ট" বন্ধ করে দাও।
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error (Weekly Digest):", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Weekly Digest Email Send Error:", err);
    return { success: false, error: "ডাইজেস্ট ইমেইল পাঠাতে সমস্যা হয়েছে" };
  }
}
