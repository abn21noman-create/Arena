import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PROTECTED_PREFIXES } from "@/lib/protected-routes";
import { prisma } from "@/lib/prisma";
import { getFeatureFlagForPath } from "@/lib/feature-flag-routes";
import {
  isTrustedMutationOrigin,
  requestBodyLimitResponse,
} from "@/lib/request-security";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";
import { isSessionRevoked } from "@/lib/session-integrity";

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete("authjs.session-token");
  response.cookies.delete("__Secure-authjs.session-token");
  return response;
}

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = Boolean(req.auth?.user?.id);
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isApiRoute = pathname.startsWith("/api/");
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isApiRoute) {
    const bodyLimit = requestBodyLimitResponse(req, 25 * 1024 * 1024);
    if (bodyLimit) return bodyLimit;
    if (!isTrustedMutationOrigin(req)) {
      return NextResponse.json(
        { error: "Cross-origin mutation অনুমোদিত নয়" },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }
    const readOnly = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";
    const limited = await enforceRateLimit(
      req,
      readOnly ? "read" : "create",
      makeRateLimitKey(
        req,
        `api:global:${readOnly ? "read" : "mutation"}`,
        req.auth?.user?.id
      )
    );
    if (limited) return limited;
  }

  if ((isProtectedRoute || isAdminPage) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  // Every authenticated API/protected-page request validates the live account.
  // This makes ban/delete/password/role changes effective without waiting for a
  // JWT to expire. Auth callbacks without an existing session skip this block.
  let currentUser: {
    role: "STUDENT" | "ADMIN";
    isBanned: boolean;
    authVersion: number;
  } | null = null;
  if (req.auth?.user?.id && (isApiRoute || isProtectedRoute || isAdminPage)) {
    try {
      currentUser = await prisma.user.findUnique({
        where: { id: req.auth.user.id },
        select: { role: true, isBanned: true, authVersion: true },
      });
    } catch {
      if (isApiRoute) {
        return NextResponse.json(
          { error: "Account verification unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.rewrite(new URL("/maintenance", req.nextUrl.origin));
    }

    if (isSessionRevoked(req.auth.user.authVersion, currentUser)) {
      if (isApiRoute) {
        return clearSessionCookies(
          NextResponse.json(
            { error: "Session আর valid নয়—আবার login করুন", code: "SESSION_REVOKED" },
            { status: 401, headers: { "Cache-Control": "no-store" } }
          )
        );
      }
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("session", "revoked");
      return clearSessionCookies(NextResponse.redirect(loginUrl));
    }
  }

  if (isAdminApi && currentUser?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "এই কাজের জন্য Admin অনুমতি লাগবে" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (isAdminPage && currentUser?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // A disabled module must close its student API too; otherwise a hidden page
  // is not a real kill switch. During maintenance, authenticated student
  // mutations pause while read-only/status/auth/Admin endpoints remain usable.
  if (isApiRoute && currentUser?.role !== "ADMIN" && currentUser) {
    const readOnly = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS";
    const flagKey = getFeatureFlagForPath(pathname);
    if (!readOnly || flagKey) {
      try {
        const setting = await prisma.systemSetting.findUnique({
          where: { id: "global" },
          select: { maintenanceMode: true, featureFlags: true },
        });
        if (setting?.maintenanceMode && !readOnly) {
          return NextResponse.json(
            { error: "রক্ষণাবেক্ষণ চলছে—mutation সাময়িকভাবে বন্ধ" },
            { status: 503, headers: { "Cache-Control": "no-store" } }
          );
        }
        const flags = (setting?.featureFlags as Record<string, boolean> | null) ?? {};
        if (flagKey && flags[flagKey] === false) {
          return NextResponse.json(
            { error: "এই feature সাময়িকভাবে বন্ধ", code: "FEATURE_DISABLED" },
            { status: 503, headers: { "Cache-Control": "no-store" } }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Operational control check unavailable" },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        );
      }
    }
  }

  if (isProtectedRoute && currentUser?.role !== "ADMIN") {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { id: "global" },
        select: { maintenanceMode: true, featureFlags: true },
      });
      if (setting?.maintenanceMode) {
        return NextResponse.rewrite(new URL("/maintenance", req.nextUrl.origin));
      }
      const flagKey = getFeatureFlagForPath(pathname);
      const featureFlags = (setting?.featureFlags as Record<string, boolean> | null) ?? {};
      if (flagKey && featureFlags[flagKey] === false) {
        return NextResponse.rewrite(new URL("/feature-disabled", req.nextUrl.origin));
      }
    } catch {
      // Account authorization above is fail-closed. Optional maintenance and
      // feature-control reads remain fail-open during a transient settings error.
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/learn/:path*",
    "/practice/:path*",
    "/flashcards/:path*",
    "/planner/:path*",
    "/badges/:path*",
    "/leaderboard/:path*",
    "/ai-tutor/:path*",
    "/analytics/:path*",
    "/admin/:path*",
    "/cq-practice/:path*",
    "/forum/:path*",
    "/settings/:path*",
    "/saved/:path*",
    "/mock-exam/:path*",
    "/study-group/:path*",
    "/duel/:path*",
    "/pdf-chat/:path*",
    "/live-exam/:path*",
    "/quiz-battle/:path*",
    "/adaptive-practice/:path*",
    "/drill/:path*",
    "/admission/:path*",
    "/notifications/:path*",
    "/reading-room/:path*",
    "/mistake-vault/:path*",
    "/formula-search/:path*",
    "/focus/:path*",
  ],
};
