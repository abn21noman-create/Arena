import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const targetType = z.enum(["ALL_USERS", "BY_ROLE", "BY_SUBJECT", "BY_STREAK", "BY_HSC_BATCH"]);
const optionalInternalLink = z.string().trim().max(500).refine(
  (value) => value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"),
  "শুধু internal /path link দিন"
).nullable().optional();
const templateFields = z.object({
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
  link: optionalInternalLink,
  icon: z.string().trim().max(16).optional(),
  targetType: targetType.default("ALL_USERS"),
  variables: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
}).strict();

async function adminSession() {
  const denied = await requireAdmin();
  if (denied) return { denied } as const;
  const session = await auth();
  if (!session?.user?.id) {
    return { denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  return { session } as const;
}

export async function GET() {
  const guard = await adminSession();
  if ("denied" in guard) return guard.denied;
  const templates = await prisma.broadcastTemplate.findMany({
    orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const guard = await adminSession();
  if ("denied" in guard) return guard.denied;
  const parsed = templateFields.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Template সঠিক নয়" }, { status: 400 });
  }
  const template = await prisma.broadcastTemplate.create({
    data: {
      ...parsed.data,
      icon: parsed.data.icon ?? "📚",
      createdById: guard.session.user.id,
    },
  });
  return NextResponse.json({ template }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await adminSession();
  if ("denied" in guard) return guard.denied;
  const parsed = templateFields.partial().extend({ id: z.string().cuid() }).safeParse(
    await req.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Template সঠিক নয়" }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  const claimed = await prisma.broadcastTemplate.updateMany({
    where: { id },
    data: { ...data, lastUsedAt: new Date(), usageCount: { increment: 1 } },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ error: "Template পাওয়া যায়নি" }, { status: 404 });
  }
  return NextResponse.json({
    template: await prisma.broadcastTemplate.findUnique({ where: { id } }),
  });
}

export async function DELETE(req: NextRequest) {
  const guard = await adminSession();
  if ("denied" in guard) return guard.denied;
  const id = z.string().cuid().safeParse(new URL(req.url).searchParams.get("id"));
  if (!id.success) {
    return NextResponse.json({ error: "Template ID সঠিক নয়" }, { status: 400 });
  }
  const deleted = await prisma.broadcastTemplate.deleteMany({ where: { id: id.data } });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Template পাওয়া যায়নি" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
