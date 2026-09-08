// ===================================================================
// Admin: System Settings আপডেট (Maintenance Mode/Announcement
// Banner/Feature Flags)
// GET  /api/admin/system-settings — বর্তমান সেটিংস (updatedBy সহ)
// PATCH /api/admin/system-settings
// Body: {
//   maintenanceMode?: boolean, maintenanceMessage?: string,
//   announcementEnabled?: boolean, announcementText?: string,
//   featureFlags?: Record<string, boolean>
// }
// -------------------------------------------------------------------
// announcementText পরিবর্তন হলে নতুন `announcementId` (timestamp-based)
// generate করা হয় — client-side dismiss-tracking (localStorage) এ
// পুরনো id এর সাথে না মিললে নতুন announcement আবার দেখানো হয়, এমনকি
// আগে যে ইউজার আগের announcement dismiss করেছিল সেও।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { getSystemSettings } from "@/lib/system-settings";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const settings = await getSystemSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const {
    maintenanceMode,
    maintenanceMessage,
    announcementEnabled,
    announcementText,
    featureFlags,
  } = body as {
    maintenanceMode?: unknown;
    maintenanceMessage?: string | null;
    announcementEnabled?: unknown;
    announcementText?: string | null;
    featureFlags?: unknown;
  };

  // Boolean field validation — type-coercion bug এড়াতে (স্ট্রিং/অ্যারে/নাম্বার
  // পাঠালে যেন সাইলেন্টলি truthy-coerce না হয় বা Prisma crash না করে)
  if (!isValidOptionalBoolean(maintenanceMode)) {
    return NextResponse.json(
      { error: "maintenanceMode অবশ্যই true/false (boolean) হতে হবে" },
      { status: 400 },
    );
  }
  if (!isValidOptionalBoolean(announcementEnabled)) {
    return NextResponse.json(
      { error: "announcementEnabled অবশ্যই true/false (boolean) হতে হবে" },
      { status: 400 },
    );
  }
  // featureFlags: প্রতিটা value strict boolean হতে হবে (plain object চেক সহ)
  if (featureFlags !== undefined) {
    const isPlainObject =
      typeof featureFlags === "object" &&
      featureFlags !== null &&
      !Array.isArray(featureFlags);
    if (!isPlainObject) {
      return NextResponse.json(
        { error: "featureFlags অবশ্যই একটি অবজেক্ট হতে হবে" },
        { status: 400 },
      );
    }
    const invalidFlag = Object.entries(featureFlags as Record<string, unknown>).find(
      ([, v]) => typeof v !== "boolean",
    );
    if (invalidFlag) {
      return NextResponse.json(
        { error: `featureFlags.${invalidFlag[0]} অবশ্যই true/false (boolean) হতে হবে` },
        { status: 400 },
      );
    }
  }

  const previous = await getSystemSettings();

  // announcement টেক্সট বদলালে নতুন id — dismiss করা পুরনো ব্যানারও
  // আবার দেখানো উচিত যদি admin নতুন কিছু ঘোষণা করে
  const textChanged =
    announcementText !== undefined && announcementText !== previous.announcementText;

  const updated = await prisma.systemSetting.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      maintenanceMode: maintenanceMode ?? false,
      maintenanceMessage: maintenanceMessage ?? null,
      announcementEnabled: announcementEnabled ?? false,
      announcementText: announcementText ?? null,
      announcementId: announcementText ? `ann_${Date.now()}` : null,
      featureFlags: featureFlags ?? {},
      updatedBy: session?.user?.id ?? null,
    },
    update: {
      ...(maintenanceMode !== undefined && { maintenanceMode }),
      ...(maintenanceMessage !== undefined && { maintenanceMessage }),
      ...(announcementEnabled !== undefined && { announcementEnabled }),
      ...(announcementText !== undefined && { announcementText }),
      ...(textChanged && { announcementId: `ann_${Date.now()}` }),
      ...(featureFlags !== undefined && { featureFlags }),
      updatedBy: session?.user?.id ?? null,
    },
  });

  if (session?.user?.id) {
    await logAuditEvent({
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      action: "SYSTEM_SETTINGS_UPDATE",
      targetType: "SystemSetting",
      targetId: "global",
      metadata: {
        maintenanceMode: updated.maintenanceMode,
        announcementEnabled: updated.announcementEnabled,
        featureFlags: updated.featureFlags,
      },
      req,
    });
  }

  return NextResponse.json({
    settings: {
      maintenanceMode: updated.maintenanceMode,
      maintenanceMessage: updated.maintenanceMessage,
      announcementEnabled: updated.announcementEnabled,
      announcementText: updated.announcementText,
      announcementId: updated.announcementId,
      featureFlags: (updated.featureFlags as Record<string, boolean>) ?? {},
      updatedAt: updated.updatedAt,
      updatedBy: updated.updatedBy,
    },
  });
}
