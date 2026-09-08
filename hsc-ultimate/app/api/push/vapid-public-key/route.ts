// ===================================================================
// Push Notification — VAPID Public Key ফেচ করার API
// GET /api/push/vapid-public-key
// -------------------------------------------------------------------
// Client-side এ subscribe করার সময় applicationServerKey হিসেবে এই
// পাবলিক কী দরকার হয় (secret না, তাই যেকোনো লগইন করা ইউজার পেতে পারে)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVapidPublicKey } from "@/lib/push-notification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json(
      { error: "Push Notification এখনো কনফিগার করা হয়নি" },
      { status: 503 }
    );
  }

  return NextResponse.json({ publicKey });
}
