// ===================================================================
// Data Export API — নিজের সব ডেটা JSON ফাইল হিসেবে ডাউনলোড
// GET /api/user/export-data
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportUserData } from "@/lib/account-privacy";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  try {
    const data = await exportUserData(session.user.id);
    const json = JSON.stringify(data, null, 2);
    const filename = `hsc-ultimate-data-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Data Export Error:", err);
    return NextResponse.json({ error: "ডেটা এক্সপোর্ট করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
