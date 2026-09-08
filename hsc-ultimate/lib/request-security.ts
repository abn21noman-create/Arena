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
