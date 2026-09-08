import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import {
  FocusSchedulerRunError,
  getFocusSchedulerHealth,
  runFocusScheduler,
} from "@/lib/focus-scheduler-ops";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

async function adminGuard(request: Request) {
  const denied = await requireAdmin();
  if (denied) return { denied } as const;
  const session = await auth();
  if (!session?.user?.id) {
    return { denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:focus:scheduler-ops", session.user.id)
  );
  if (limited) return { denied: limited } as const;
  return { session } as const;
}

export async function GET(request: Request) {
  const guard = await adminGuard(request);
  if ("denied" in guard) return guard.denied;
  const health = await getFocusSchedulerHealth();
  return NextResponse.json(
    { health },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  const guard = await adminGuard(request);
  if ("denied" in guard) return guard.denied;

  try {
    const run = await runFocusScheduler({ source: "ADMIN", limit: 50 });
    await prisma.auditLog.create({
      data: {
        actorId: guard.session.user.id,
        action: "FOCUS_SCHEDULER_MANUAL_RUN",
        targetType: "FocusSchedulerState",
        targetId: "global",
        metadata: {
          status: run.status,
          remindersSent: run.remindersSent,
          dueCandidates: run.dueCandidates,
          processed: run.processed,
          sessionsStarted: run.sessionsStarted,
          scheduleFailures: run.scheduleFailures,
          durationMs: run.durationMs,
        },
      },
    });
    const health = await getFocusSchedulerHealth();
    return NextResponse.json(
      { run, health },
      {
        status: run.status === "SKIPPED_OVERLAP" ? 202 : 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    const code = error instanceof FocusSchedulerRunError
      ? error.code
      : "SCHEDULER_EXECUTION_FAILED";
    return NextResponse.json(
      { error: "Scheduler run failed", code },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
