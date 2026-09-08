// ===================================================================
// Public: System Settings (Maintenance Mode/Announcement Banner/Feature
// Flags) — শুধু পড়া, কোনো auth লাগে না (landing পেজেও maintenance
// banner দেখাতে হতে পারে, তাই login-gated না)
// GET /api/system-settings
// -------------------------------------------------------------------
// Admin-only sensitive ফিল্ড (updatedBy) এখানে বাদ দেওয়া হয়েছে —
// এই এন্ডপয়েন্ট সব ইউজার (এমনকি লগইন না করা ভিজিটরও) কল করতে পারে।
// ===================================================================
import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/system-settings";

export async function GET() {
  const settings = await getSystemSettings();

  return NextResponse.json({
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
    announcementEnabled: settings.announcementEnabled,
    announcementText: settings.announcementText,
    announcementId: settings.announcementId,
    featureFlags: settings.featureFlags,
  });
}
