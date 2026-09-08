import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSessionRevoked } from "@/lib/session-integrity";

/**
 * Admin authorization always uses the current database row. A role/ban/password
 * change increments authVersion, so an older JWT cannot retain privilege.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isBanned: true, authVersion: true },
  });
  if (isSessionRevoked(session.user.authVersion, current)) {
    return NextResponse.json(
      { error: "Session আর valid নয়—আবার login করুন", code: "SESSION_REVOKED" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (!current) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }
  if (current.role !== "ADMIN") {
    return NextResponse.json(
      { error: "এই কাজের জন্য Admin অনুমতি লাগবে" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }
  return null;
}
