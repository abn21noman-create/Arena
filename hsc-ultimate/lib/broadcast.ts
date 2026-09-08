/**
 * Broadcast Notification System
 * -------------------------------------------------
 * Admin real-time push notification system. Supports targeting,
 * multi-channel delivery (in-app, web push, email, native push).
 *
 * Usage:
 *   const result = await sendBroadcast({
 *     title: "পরীক্ষার ১ দিন বাকি!",
 *     body: "কাল পদার্থবিজ্ঞান পরীক্ষা। শেষ রিভিশন করো।",
 *     link: "/dashboard",
 *     icon: "📚",
 *     targetType: "ALL_USERS",
 *     sendInApp: true,
 *     sendPush: true,
 *   });
 */
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push-notification";
import { Prisma } from "@prisma/client";

export type BroadcastTargetType =
  | "ALL_USERS"
  | "BY_ROLE"
  | "BY_SUBJECT"
  | "BY_STREAK"
  | "BY_HSC_BATCH";

export interface BroadcastFilter {
  role?: "STUDENT" | "ADMIN";
  subjectCode?: "PHYSICS" | "CHEMISTRY" | "BIOLOGY" | "HIGHER_MATH" | "BANGLA" | "ENGLISH" | "ICT";
  streakMin?: number;
  streakMax?: number;
  hscBatch?: number;
}

export interface BroadcastInput {
  title: string;
  body: string;
  link?: string;
  icon?: string;
  targetType: BroadcastTargetType;
  targetFilter?: BroadcastFilter;
  sendInApp?: boolean;
  sendPush?: boolean;
  sentById?: string;
  templateVariables?: Record<string, string>;
}

export interface BroadcastResult {
  campaignId: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  duration: number;
}

/**
 * Get list of user IDs matching the target criteria.
 */
export async function getTargetedUsers(
  targetType: BroadcastTargetType,
  filter?: BroadcastFilter
): Promise<string[]> {
  const where: Prisma.UserWhereInput = {
    isBanned: false, // banned users পাবে না
  };

  switch (targetType) {
    case "ALL_USERS":
      // সব (active, non-banned) ইউজার — admin সহ (admin কেও notify পেতে পারে, useful for testing)
      break;

    case "BY_ROLE":
      if (filter?.role) where.role = filter.role;
      break;

    case "BY_SUBJECT":
      // যেসব ইউজার এই subject এ bookmark করেছে বা recent practice করেছে
      if (filter?.subjectCode) {
        // Bookmark matching
        where.bookmarks = {
          some: {
            topic: { chapter: { subject: { code: filter.subjectCode } } },
          },
        };
      }
      break;

    case "BY_STREAK": {
      const streakFilter: Prisma.IntFilter = {};
      if (filter?.streakMin !== undefined) streakFilter.gte = filter.streakMin;
      if (filter?.streakMax !== undefined) streakFilter.lte = filter.streakMax;
      if (Object.keys(streakFilter).length > 0) where.streakCount = streakFilter;
      break;
    }

    case "BY_HSC_BATCH":
      if (filter?.hscBatch) {
        where.hscBatch = filter.hscBatch;
      }
      break;
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });
  return users.map((u) => u.id);
}

/**
 * Apply template variables to body text.
 * Replaces {{varName}} with corresponding value.
 */
export function applyTemplateVariables(
  text: string,
  variables?: Record<string, string>
): string {
  if (!variables) return text;
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(placeholder, value);
  }
  return result;
}

/**
 * Send broadcast — main entry point.
 * Creates a campaign, finds recipients, sends via configured channels.
 */
export async function sendBroadcast(input: BroadcastInput): Promise<BroadcastResult> {
  const startTime = Date.now();
  const title = applyTemplateVariables(input.title, input.templateVariables);
  const body = applyTemplateVariables(input.body, input.templateVariables);
  const link = input.link
    ? applyTemplateVariables(input.link, input.templateVariables)
    : undefined;
  const userIds = await getTargetedUsers(input.targetType, input.targetFilter);
  const campaign = await prisma.broadcastCampaign.create({
    data: {
      sentById: input.sentById ?? null,
      title,
      body,
      link: link ?? null,
      icon: input.icon ?? null,
      targetType: input.targetType,
      targetFilter: input.targetFilter as Prisma.InputJsonValue,
      sendInApp: input.sendInApp !== false,
      sendPush: input.sendPush === true,
      sendNativePush: false,
      sendEmail: false,
      status: userIds.length === 0 ? "COMPLETED" : "SENDING",
      totalRecipients: userIds.length,
      scheduledFor: null,
      startedAt: new Date(),
      ...(userIds.length === 0 ? { completedAt: new Date() } : {}),
    },
  });

  if (userIds.length === 0) {
    return {
      campaignId: campaign.id,
      totalRecipients: 0,
      sentCount: 0,
      failedCount: 0,
      duration: Date.now() - startTime,
    };
  }

  await prisma.broadcastRecipient.createMany({
    data: userIds.map((userId) => ({ campaignId: campaign.id, userId })),
  });

  let sentCount = 0;
  let failedCount = 0;
  const BATCH_SIZE = 20;
  for (let index = 0; index < userIds.length; index += BATCH_SIZE) {
    const batch = userIds.slice(index, index + BATCH_SIZE);
    await Promise.all(
      batch.map(async (userId) => {
        let inAppDelivered = false;
        let pushDelivered = false;
        try {
          if (input.sendInApp !== false) {
            await prisma.notification.create({
              data: { userId, title, body, link: link ?? null },
            });
            inAppDelivered = true;
          }
          if (input.sendPush === true) {
            const push = await sendPushToUser(userId, { title, body, link });
            pushDelivered = push.sent > 0;
          }
          const delivered = inAppDelivered || pushDelivered;
          if (delivered) sentCount += 1;
          else failedCount += 1;
          await prisma.broadcastRecipient.update({
            where: { campaignId_userId: { campaignId: campaign.id, userId } },
            data: {
              inAppDelivered,
              pushDelivered,
              deliveredAt: delivered ? new Date() : null,
              failedReason: delivered ? null : "NO_REQUESTED_CHANNEL_DELIVERED",
            },
          });
        } catch {
          failedCount += 1;
          await prisma.broadcastRecipient.updateMany({
            where: { campaignId: campaign.id, userId },
            data: {
              inAppDelivered,
              pushDelivered,
              failedReason: "DELIVERY_PIPELINE_FAILED",
            },
          });
        }
      })
    );
  }

  await prisma.broadcastCampaign.update({
    where: { id: campaign.id },
    data: {
      status: sentCount === 0 ? "FAILED" : "COMPLETED",
      sentCount,
      failedCount,
      completedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: input.sentById ?? null,
      action: "NOTIFICATION_BROADCAST",
      targetType: "BroadcastCampaign",
      targetId: campaign.id,
      metadata: {
        targetType: input.targetType,
        totalRecipients: userIds.length,
        sentCount,
        failedCount,
        channels: {
          inApp: input.sendInApp !== false,
          webPush: input.sendPush === true,
        },
      },
    },
  }).catch(() => undefined);

  return {
    campaignId: campaign.id,
    totalRecipients: userIds.length,
    sentCount,
    failedCount,
    duration: Date.now() - startTime,
  };
}

/**
 * Get target audience size for preview (without actually sending).
 */
export async function getTargetAudienceSize(
  targetType: BroadcastTargetType,
  filter?: BroadcastFilter
): Promise<number> {
  const userIds = await getTargetedUsers(targetType, filter);
  return userIds.length;
}

/**
 * Mark broadcast as read (when user clicks in-app notification).
 */
export async function markBroadcastRead(
  campaignId: string,
  userId: string
): Promise<void> {
  await prisma.broadcastRecipient.update({
    where: { campaignId_userId: { campaignId, userId } },
    data: { inAppRead: true, readAt: new Date() },
  });
  await prisma.broadcastCampaign.update({
    where: { id: campaignId },
    data: { readCount: { increment: 1 } },
  }).catch(() => {});
}

/**
 * Get broadcast history (admin view).
 */
export async function getBroadcastHistory(limit = 50) {
  return prisma.broadcastCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      recipients: {
        select: {
          inAppDelivered: true,
          inAppRead: true,
          pushDelivered: true,
          emailDelivered: true,
        },
      },
    },
  });
}
