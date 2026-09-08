import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protectApiRoute } from "@/lib/api-security";

const deviceSchema = z.object({
  token: z.string().trim().min(20).max(4096),
  platform: z.literal("android").default("android"),
  appVersion: z.string().trim().min(1).max(40).optional(),
  deviceModel: z.string().trim().min(1).max(120).optional(),
  remoteFocusCapable: z.boolean().optional(),
  accessibilityEnabled: z.boolean().optional(),
});

export async function GET(request: Request) {
  const guard = await protectApiRoute(request, "read", "native-device:list");
  if (!guard.ok) return guard.response;
  const devices = await prisma.nativeDevice.findMany({
    where: { userId: guard.userId },
    orderBy: { lastSeenAt: "desc" },
    take: 20,
    select: {
      id: true,
      platform: true,
      appVersion: true,
      deviceModel: true,
      remoteFocusCapable: true,
      accessibilityEnabled: true,
      lastSeenAt: true,
      lastPushSuccessAt: true,
      lastPushFailureAt: true,
      lastPushErrorCode: true,
      lastReceiptAt: true,
      lastReceiptStatus: true,
      disabledAt: true,
      disabledReason: true,
    },
  });
  return NextResponse.json({ devices }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const guard = await protectApiRoute(request, "update", "native-device:register");
  if (!guard.ok) return guard.response;
  const parsed = deviceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Device token সঠিক নয়" }, { status: 400 });
  }

  const existing = await prisma.nativeDevice.findUnique({ where: { token: parsed.data.token } });
  if (existing && existing.userId !== guard.userId) {
    return NextResponse.json({ error: "Device token অন্য account-এর সঙ্গে যুক্ত" }, { status: 409 });
  }

  const device = await prisma.nativeDevice.upsert({
    where: { token: parsed.data.token },
    create: { userId: guard.userId, ...parsed.data },
    update: {
      appVersion: parsed.data.appVersion,
      deviceModel: parsed.data.deviceModel,
      remoteFocusCapable: parsed.data.remoteFocusCapable,
      accessibilityEnabled: parsed.data.accessibilityEnabled,
      disabledAt: null,
      disabledReason: null,
      lastSeenAt: new Date(),
    },
  });
  return NextResponse.json({
    device: {
      id: device.id,
      platform: device.platform,
      remoteFocusCapable: device.remoteFocusCapable,
      accessibilityEnabled: device.accessibilityEnabled,
      disabled: device.disabledAt !== null,
    },
  });
}

export async function DELETE(request: Request) {
  const guard = await protectApiRoute(request, "update", "native-device:delete");
  if (!guard.ok) return guard.response;
  const token = z.string().trim().min(20).max(4096).safeParse(
    new URL(request.url).searchParams.get("token")
  );
  if (!token.success) return NextResponse.json({ error: "Token প্রয়োজন" }, { status: 400 });
  await prisma.nativeDevice.deleteMany({ where: { userId: guard.userId, token: token.data } });
  return NextResponse.json({ success: true });
}
