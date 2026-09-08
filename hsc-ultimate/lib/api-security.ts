import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requestBodyLimitResponse } from "@/lib/request-security";
import {
  enforceRateLimit,
  makeRateLimitKey,
  RATE_LIMITS,
} from "@/lib/rate-limit";

type RateLimitName = keyof typeof RATE_LIMITS;

type ApiGuardResult =
  | { ok: true; userId: string; session: Session }
  | { ok: false; response: Response };

/** Shared authentication + per-user/IP rate-limit guard for route handlers. */
export async function protectApiRoute(
  request: Request,
  limit: RateLimitName,
  scope: string
): Promise<ApiGuardResult> {
  const maxBodyBytes = limit === "aiChat" || limit === "aiGenerate"
    ? 8 * 1024 * 1024
    : 1024 * 1024;
  const bodyLimit = requestBodyLimitResponse(request, maxBodyBytes);
  if (bodyLimit) return { ok: false, response: bodyLimit };

  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 }),
    };
  }

  const identifier = makeRateLimitKey(request, scope, session.user.id);
  const limited = await enforceRateLimit(request, limit, identifier);
  if (limited) return { ok: false, response: limited };

  return { ok: true, userId: session.user.id, session };
}
