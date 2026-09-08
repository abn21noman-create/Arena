// ===================================================================
// Audit Logging — Admin Action Trail
// -------------------------------------------------------------------
// প্রতিটা destructive/sensitive admin action (role change, user delete,
// question bulk delete, broadcast notification ইত্যাদি) DB তে লগ রাখা হয়,
// যাতে পরে কোনো ভুল/অপব্যবহার হলে ট্র্যাক করা যায় ("কে, কখন, কী করেছে")।
// লগিং কখনো মূল action কে ব্যর্থ করবে না (fire-and-forget, try/catch দিয়ে
// wrap করা) — audit log লেখা fail করলেও ইউজারের রিকোয়েস্ট স্বাভাবিকভাবে
// সম্পন্ন হবে।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export type AuditAction =
  | "USER_ROLE_CHANGE"
  | "USER_DELETE"
  | "USER_BAN"
  | "USER_UNBAN"
  | "QUESTION_DELETE"
  | "QUESTION_BULK_UPLOAD"
  | "QUESTION_UPDATE"
  | "CQ_QUESTION_DELETE"
  | "SUBJECT_DELETE"
  | "CHAPTER_DELETE"
  | "TOPIC_DELETE"
  | "FORUM_POST_DELETE"
  | "FORUM_POST_PIN"
  | "NOTIFICATION_BROADCAST"
  | "CONTENT_REPORT_RESOLVE"
  | "CONTENT_REPORT_DISMISS"
  | "WEEKLY_DIGEST_SEND"
  | "SYSTEM_SETTINGS_UPDATE";

interface AuditLogParams {
  actorId: string;
  actorName?: string | null;
  actorEmail?: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  req?: NextRequest;
}

function getIpFromRequest(req?: NextRequest): string | null {
  if (!req) return null;
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
}

/**
 * একটা admin action লগ করে। কখনো throw করে না (fire-and-forget প্যাটার্ন) —
 * ব্যর্থ হলে শুধু console এ error লগ হবে, মূল request প্রভাবিত হবে না।
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorName: params.actorName ?? null,
        actorEmail: params.actorEmail ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        ipAddress: getIpFromRequest(params.req),
      },
    });
  } catch (err) {
    console.error("Audit log লেখা ব্যর্থ হয়েছে:", err);
  }
}
