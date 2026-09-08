import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import {
  sendBroadcast,
  getTargetAudienceSize,
  getBroadcastHistory,
} from "@/lib/broadcast";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const targetTypeSchema = z.enum([
  "ALL_USERS",
  "BY_ROLE",
  "BY_SUBJECT",
  "BY_STREAK",
  "BY_HSC_BATCH",
]);
const targetFilterSchema = z.object({
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
  subjectCode: z.enum([
    "PHYSICS",
    "CHEMISTRY",
    "BIOLOGY",
    "HIGHER_MATH",
    "BANGLA",
    "ENGLISH",
    "ICT",
  ]).optional(),
  streakMin: z.number().int().min(0).max(3650).optional(),
  streakMax: z.number().int().min(0).max(3650).optional(),
  hscBatch: z.number().int().min(2020).max(2050).optional(),
}).strict();

function internalLink(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
}

const sendSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(1000),
  link: z.string().trim().max(500).refine(internalLink, "শুধু internal /path link দিন").optional(),
  icon: z.string().trim().max(16).optional(),
  targetType: targetTypeSchema,
  targetFilter: targetFilterSchema.optional(),
  sendInApp: z.boolean().default(true),
  sendPush: z.boolean().default(false),
  templateVariables: z.record(z.string().max(80), z.string().max(200)).optional(),
}).strict().refine((value) => value.sendInApp || value.sendPush, {
  message: "অন্তত একটি বাস্তব delivery channel নির্বাচন করুন",
});

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Broadcast data সঠিক নয়" },
      { status: 400 }
    );
  }
  try {
    const result = await sendBroadcast({ ...parsed.data, sentById: session.user.id });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Broadcast delivery ব্যর্থ হয়েছে" }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  if (searchParams.get("preview") === "true") {
    const targetType = targetTypeSchema.safeParse(searchParams.get("targetType"));
    if (!targetType.success) {
      return NextResponse.json({ error: "Target type সঠিক নয়" }, { status: 400 });
    }
    let rawFilter: unknown = undefined;
    const encoded = searchParams.get("targetFilter");
    if (encoded) {
      try {
        rawFilter = JSON.parse(encoded);
      } catch {
        return NextResponse.json({ error: "Target filter JSON সঠিক নয়" }, { status: 400 });
      }
    }
    const filter = rawFilter === undefined
      ? { success: true as const, data: undefined }
      : targetFilterSchema.safeParse(rawFilter);
    if (!filter.success) {
      return NextResponse.json({ error: "Target filter সঠিক নয়" }, { status: 400 });
    }
    return NextResponse.json({
      audienceSize: await getTargetAudienceSize(targetType.data, filter.data),
    });
  }

  const requested = Number(searchParams.get("limit") ?? 20);
  const limit = Number.isSafeInteger(requested) ? Math.min(100, Math.max(1, requested)) : 20;
  return NextResponse.json({ campaigns: await getBroadcastHistory(limit) });
}
