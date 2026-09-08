import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { VALID_SUBJECT_CODES } from "@/lib/enum-validation";
import { sendNativeFocusCommand } from "@/lib/native-push";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";
import {
  FOCUS_CONSENT_VERSION,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
  startFocusSession,
  toFocusErrorResponse,
} from "@/lib/focus";

const startSchema = z.object({
  userId: z.string().cuid(),
  durationMinutes: z.number().int().min(MIN_FOCUS_MINUTES).max(MAX_FOCUS_MINUTES),
  subjectCode: z.enum(VALID_SUBJECT_CODES).nullable().optional(),
  focusLabel: z.string().trim().max(120).nullable().optional(),
  nativeEnforcementRequested: z.boolean().default(true),
});

async function getAdmin(request: Request) {
  const denied = await requireAdmin();
  if (denied) return { denied } as const;
  const session = await auth();
  if (!session?.user?.id) {
    return { denied: NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 }) } as const;
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:focus", session.user.id)
  );
  if (limited) return { denied: limited } as const;
  return { session } as const;
}

export async function GET(request: Request) {
  const admin = await getAdmin(request);
  if ("denied" in admin) return admin.denied;

  const now = new Date();
  await prisma.focusSession.updateMany({
    where: { status: "ACTIVE", endsAt: { lte: now } },
    data: { status: "COMPLETED", completedAt: now },
  });

  const [contracts, activeSessions] = await Promise.all([
    prisma.focusContract.findMany({
      where: {
        allowAdminStart: true,
        revokedAt: null,
        consentedAt: { not: null },
        consentVersion: FOCUS_CONSENT_VERSION,
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        user: {
          select: { id: true, name: true, email: true, isBanned: true, currentActivityAt: true },
        },
      },
    }),
    prisma.focusSession.findMany({
      where: { status: "ACTIVE" },
      orderBy: { endsAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        initiatedBy: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({ contracts, activeSessions, serverNow: now });
}

export async function POST(request: Request) {
  const admin = await getAdmin(request);
  if ("denied" in admin) return admin.denied;

  const parsed = startSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "তথ্য সঠিক নয়" },
      { status: 400 }
    );
  }

  try {
    const focusSession = await startFocusSession({
      userId: parsed.data.userId,
      initiatedById: admin.session.user.id,
      source: "ADMIN",
      durationMinutes: parsed.data.durationMinutes,
      subjectCode: parsed.data.subjectCode,
      focusLabel: parsed.data.focusLabel,
      nativeEnforcementRequested: parsed.data.nativeEnforcementRequested,
    });

    const [, nativePush] = await Promise.all([
      createNotification({
        userId: parsed.data.userId,
        title: "🔒 Strict Focus শুরু হয়েছে",
        body: `Admin ${parsed.data.durationMinutes} মিনিটের Deep Focus session শুরু করেছেন${parsed.data.focusLabel ? ` — ${parsed.data.focusLabel}` : ""}। Emergency ও অনুমোদিত app চালু থাকবে।`,
        link: "/focus",
      }),
      sendNativeFocusCommand({
        userId: parsed.data.userId,
        sessionId: focusSession.id,
        endsAt: focusSession.endsAt,
        durationMinutes: focusSession.durationMinutes,
      }),
    ]);

    return NextResponse.json({ session: focusSession, nativePush }, { status: 201 });
  } catch (error) {
    const response = toFocusErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
