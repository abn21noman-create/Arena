// ===================================================================
// Admin: Subject List + Create API
// GET  /api/admin/subjects
// POST /api/admin/subjects
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { chapters: true } },
    },
  });

  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const body = await req.json().catch(() => ({}));
  const { code, paper, name, nameEn, colorHex, order } = body;

  if (!code || !name || !nameEn) {
    return NextResponse.json({ error: "code, name, nameEn আবশ্যক" }, { status: 400 });
  }

  try {
    const subject = await prisma.subject.create({
      data: {
        code,
        paper: paper || "NONE",
        name,
        nameEn,
        colorHex: colorHex || "#6d28d9",
        order: order ?? 0,
      },
    });
    return NextResponse.json({ subject }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "এই code+paper কম্বিনেশন ইতিমধ্যে আছে" },
      { status: 409 }
    );
  }
}
