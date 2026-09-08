import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";
import {
  FOCUS_SUBJECT_LABELS,
  getEffectiveFocusMinutes,
  parseFocusRange,
  toDhakaDateKey,
} from "@/lib/focus-analytics";

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const admin = await auth();
  if (!admin?.user?.id) return new Response("Unauthorized", { status: 401 });
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:focus:export", admin.user.id)
  );
  if (limited) return limited;

  const range = parseFocusRange(new URL(request.url).searchParams.get("range"));
  const now = new Date();
  const earliest = new Date(now.getTime() - (range + 1) * 86_400_000);
  const sessions = await prisma.focusSession.findMany({
    where: {
      startedAt: { gte: earliest },
      user: { focusContract: { is: { shareAnalyticsWithAdmin: true } } },
    },
    orderBy: { startedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const header = [
    "Date (Asia/Dhaka)", "User", "Email", "Source", "Status", "Subject",
    "Session Label", "Scheduled Minutes", "Effective Minutes", "Started At", "Ended At",
  ];
  const rows = sessions.map((focus) => [
    toDhakaDateKey(focus.startedAt),
    focus.user.name,
    focus.user.email,
    focus.source,
    focus.status,
    FOCUS_SUBJECT_LABELS[focus.subjectCode ?? "GENERAL"] ?? focus.subjectCode ?? "General",
    focus.focusLabel,
    focus.durationMinutes,
    getEffectiveFocusMinutes(focus, now),
    focus.startedAt.toISOString(),
    (focus.completedAt ?? focus.emergencyExitedAt ?? focus.cancelledAt ?? focus.endsAt).toISOString(),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="focus-analytics-${range}d-${toDhakaDateKey(now)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
