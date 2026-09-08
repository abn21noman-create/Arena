import { NextResponse } from "next/server";
import { isValidCronAuthorization } from "@/lib/cron-auth";
import {
  FocusSchedulerRunError,
  runFocusScheduler,
} from "@/lib/focus-scheduler-ops";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Scheduler unavailable", code: "CRON_SECRET_MISSING" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (!isValidCronAuthorization(request.headers.get("authorization"), secret)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const run = await runFocusScheduler({ source: "CRON", limit: 50 });
    return NextResponse.json(
      {
        processed: run.processed,
        remindersSent: run.remindersSent,
        run,
        serverNow: new Date().toISOString(),
      },
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

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
