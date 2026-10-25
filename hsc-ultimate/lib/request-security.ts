import { NextResponse } from "next/server";

export function requestBodyLimitResponse(
  request: Request,
  maxBodyBytes: number
): Response | null {
  const rawLength = request.headers.get("content-length");
  if (!rawLength) return null;
  const contentLength = Number(rawLength);
  if (!Number.isFinite(contentLength) || contentLength < 0) {
    return NextResponse.json({ error: "Invalid Content-Length" }, { status: 400 });
  }
  if (contentLength <= maxBodyBytes) return null;
  return NextResponse.json(
    { error: "Request body খুব বড়" },
    { status: 413, headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * Rewrites Auth.js `Set-Cookie` headers to `SameSite=None; Secure; Partitioned`
 * when serving inside an HTTPS `*.e2b.app` cloud preview iframe so modern
 * browsers accept session and CSRF cookies in a cross-site iframe context.
 */
export function adaptPreviewCookies(request: Request, response: Response): Response {
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    ?.trim();
  const proto = (request.headers.get("x-forwarded-proto") || "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  const isCrossSiteHttpsPreview = proto === "https" && Boolean(host?.endsWith(".e2b.app"));
  if (!isCrossSiteHttpsPreview) return response;

  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length === 0) return response;

  const rewriteCookie = (cookie: string) => {
    let updated = cookie.replace(/;\s*SameSite=Lax/gi, "; SameSite=None");
    if (!/;\s*SameSite=/i.test(updated)) updated += "; SameSite=None";
    if (!/;\s*Secure\b/i.test(updated)) updated += "; Secure";
    if (!/;\s*Partitioned\b/i.test(updated)) updated += "; Partitioned";
    return updated;
  };

  try {
    response.headers.delete("set-cookie");
    for (const cookie of setCookies) {
      response.headers.append("set-cookie", rewriteCookie(cookie));
    }
    return response;
  } catch {
    const headers = new Headers(response.headers);
    headers.delete("set-cookie");
    for (const cookie of setCookies) {
      headers.append("set-cookie", rewriteCookie(cookie));
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

/**
 * Resolves the public-facing origin for a request, accounting for trusted
 * reverse proxies (Vercel, Docker/Nginx, Arena cloud preview) that terminate TLS
 * and forward `x-forwarded-proto` / `x-forwarded-host` / `host`.
 */
export function getPublicRequestOrigin(request: Request): string | null {
  try {
    const parsedUrl = new URL(request.url);
    const rawHost =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host")?.split(",")[0]?.trim();
    const rawProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
    const proto =
      rawProto === "https" || rawProto === "http"
        ? `${rawProto}:`
        : parsedUrl.protocol;

    if (rawHost && /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(rawHost)) {
      return new URL(`${proto}//${rawHost}`).origin;
    }
    return parsedUrl.origin;
  } catch {
    return null;
  }
}

/**
 * Browser mutation requests with an explicit Origin must be same-origin (or an
 * explicitly configured app origin). Missing Origin remains allowed for trusted
 * service-to-service clients such as cron; those endpoints still require auth.
 */
export function isTrustedMutationOrigin(
  request: Request,
  configuredOrigins: Array<string | undefined> = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
  ]
): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowed = new Set<string>();
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    return false;
  }
  const publicOrigin = getPublicRequestOrigin(request);
  if (publicOrigin) allowed.add(publicOrigin);
  for (const value of configuredOrigins) {
    if (!value) continue;
    try {
      allowed.add(new URL(value).origin);
    } catch {
      // Invalid configured URL is handled by environment checks, never trusted.
    }
  }
  try {
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}
