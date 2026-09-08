// ===================================================================
// Admin Panel Power-up — System-level Control (Maintenance Mode,
// Announcement Banner, Feature Flags)
// -------------------------------------------------------------------
// একটামাত্র singleton row (id="global") — key-value স্টাইল না বানিয়ে
// structured row রাখা হয়েছে কারণ মাত্র ৩টা toggle দরকার। কোনো cron/
// background job লাগে না — Admin UI থেকে টগল করলেই effective হয়
// (প্রতি রিকোয়েস্টে DB থেকে read হয়, কোনো caching নেই — সাদাসিধা
// রাখা হয়েছে কারণ এই read খুব হালকা, high-traffic এ ভবিষ্যতে চাইলে
// in-memory cache+short TTL যোগ করা যায়)।
// ===================================================================
import { prisma } from "@/lib/prisma";

export interface SystemSettingsData {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  announcementEnabled: boolean;
  announcementText: string | null;
  announcementId: string | null;
  featureFlags: Record<string, boolean>;
  updatedAt: Date;
  updatedBy: string | null;
}

/** সব মডিউল যেগুলো Feature Flag দিয়ে toggle করা যায় (student-facing) */
export const TOGGLEABLE_MODULES: { key: string; label: string }[] = [
  { key: "ai-tutor", label: "AI Doubt Solver" },
  { key: "forum", label: "Community/Forum" },
  { key: "study-group", label: "Study Group" },
  { key: "reading-room", label: "Reading Room" },
  { key: "duel", label: "Quiz Duel" },
  { key: "quiz-battle", label: "Quiz Battle" },
  { key: "pdf-chat", label: "PDF Chat" },
  { key: "live-exam", label: "Live Exam" },
  { key: "focus", label: "Strict Focus" },
];

/**
 * singleton SystemSetting row বের করে আনে, না থাকলে ডিফল্ট ভ্যালু সহ
 * lazily তৈরি করে।
 *
 * 🔧 এই ফাংশনটা প্রায় প্রতিটা পেজ লোডে (dashboard layout এ maintenance
 * mode/announcement চেক করার জন্য) কল হবে — তাই `upsert()` ব্যবহার করা
 * হয়নি ইচ্ছাকৃতভাবে। `upsert()` row অলরেডি থাকলেও একটা UPDATE কুয়েরি
 * চালায় (এমনকি update payload `{}` খালি হলেও), আর Prisma এর
 * `@updatedAt` কলাম প্রতিটা UPDATE এ auto-bump হয় — ফলে শুধু read
 * করার সময়ও `updatedAt`/লেটেস্ট-পরিবর্তনের তথ্য ভুলভাবে বদলে যেত (Admin
 * UI তে "সর্বশেষ আপডেট" ভুল দেখাতো), এবং প্রতিটা পেজ লোডে অহেতুক একটা
 * write query চলতো (শুধু read দরকার সেখানে)। তাই আগে `findUnique()`
 * (শুধু read, কোনো write না) — row না থাকলে (প্রথমবার) `create()`।
 */
export async function getSystemSettings(): Promise<SystemSettingsData> {
  let setting = await prisma.systemSetting.findUnique({ where: { id: "global" } });

  if (!setting) {
    try {
      setting = await prisma.systemSetting.create({ data: { id: "global" } });
    } catch {
      // Race condition: দুইজন প্রায় একই সময়ে প্রথমবার এলে দ্বিতীয়জনের
      // create() P2002 (unique constraint) এ ব্যর্থ হবে — তখন যেটা
      // প্রথমজন বানিয়েছে সেটাই পড়ে নেওয়া হচ্ছে (soft retry, রিট্রি-লুপ
      // ছাড়া DB-level primitive এর উপর নির্ভর করে, established প্যাটার্ন)
      setting = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    }
  }

  if (!setting) {
    // এই অবস্থা বাস্তবে ঘটার কথা না (race resolve না হলেও দ্বিতীয়বার
    // read এ পাওয়া উচিত), কিন্তু TypeScript-safe fallback হিসেবে
    // ডিফল্ট ভ্যালু রিটার্ন করা হচ্ছে যাতে caller কখনো crash না করে
    return {
      maintenanceMode: false,
      maintenanceMessage: null,
      announcementEnabled: false,
      announcementText: null,
      announcementId: null,
      featureFlags: {},
      updatedAt: new Date(),
      updatedBy: null,
    };
  }

  return {
    maintenanceMode: setting.maintenanceMode,
    maintenanceMessage: setting.maintenanceMessage,
    announcementEnabled: setting.announcementEnabled,
    announcementText: setting.announcementText,
    announcementId: setting.announcementId,
    featureFlags: (setting.featureFlags as Record<string, boolean>) ?? {},
    updatedAt: setting.updatedAt,
    updatedBy: setting.updatedBy,
  };
}

/** একটা নির্দিষ্ট মডিউল feature-flag দিয়ে বন্ধ করা আছে কিনা চেক করে (opt-out ডিজাইন — flag না থাকলে চালু ধরা হয়) */
export function isModuleDisabled(featureFlags: Record<string, boolean>, moduleKey: string): boolean {
  return featureFlags[moduleKey] === false;
}
