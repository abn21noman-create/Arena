import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";
import { adaptPreviewCookies } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  return adaptPreviewCookies(request, await handlers.GET(request));
}

export async function POST(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  if (pathname.includes("/callback/credentials")) {
    const limited = await enforceRateLimit(
      request,
      "auth",
      makeRateLimitKey(request, "auth:credentials")
    );
    if (limited) return limited;
  }
  return adaptPreviewCookies(request, await handlers.POST(request));
}
