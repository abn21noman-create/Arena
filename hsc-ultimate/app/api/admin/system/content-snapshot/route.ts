import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { buildAcademicContentSnapshot } from "@/lib/content-snapshot";
import { enforceRateLimit, makeRateLimitKey } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = await enforceRateLimit(
    request,
    "admin",
    makeRateLimitKey(request, "admin:system:content-snapshot", session.user.id)
  );
  if (limited) return limited;

  try {
    const snapshot = await buildAcademicContentSnapshot();
    const date = snapshot.generatedAt.slice(0, 10);
    return new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="hsc-ultimate-academic-content-${date}.json"`,
        "Cache-Control": "no-store",
        "X-Snapshot-SHA256": snapshot.checksum.value,
        "X-Snapshot-Schema": String(snapshot.schemaVersion),
        "X-Snapshot-Items": String(
          snapshot.counts.coreMcq +
          snapshot.counts.admissionMcq +
          snapshot.counts.cq +
          snapshot.counts.topics
        ),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Academic content snapshot তৈরি করা যায়নি" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
