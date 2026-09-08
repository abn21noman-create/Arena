// ===================================================================
// Push Notification — Subscribe/Unsubscribe API
// POST   /api/push/subscribe   — নতুন সাবস্ক্রিপশন সেভ করা (upsert by endpoint)
// DELETE /api/push/subscribe   — সাবস্ক্রিপশন মুছে ফেলা (unsubscribe)
// Body (POST): { endpoint, keys: { p256dh, auth } }
// Body (DELETE): { endpoint }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { endpoint, keys } = body as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: "সঠিক subscription ডেটা দিন (endpoint, keys.p256dh, keys.auth)" },
      { status: 400 }
    );
  }

  // upsert by endpoint — একই ডিভাইস থেকে আবার subscribe করলে (browser
  // reset বা পুরনো subscription refresh) নতুন করে row তৈরি না হয়ে
  // আপডেট হয় (endpoint @unique)
  const subscription = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      userId: session.user.id, // অন্য ইউজার লগইন করে থাকলে ownership transfer হবে (শেয়ার্ড ডিভাইস)
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ subscription: { id: subscription.id } }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { endpoint } = body as { endpoint?: string };

  if (!endpoint) {
    return NextResponse.json({ error: "endpoint দিন" }, { status: 400 });
  }

  // শুধু নিজের subscription ডিলিট করা যাবে (deleteMany দিয়ে userId+endpoint
  // দুটোই ম্যাচ করানো হচ্ছে — অন্য ইউজারের subscription থাকলে কিছু হবে না)
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
