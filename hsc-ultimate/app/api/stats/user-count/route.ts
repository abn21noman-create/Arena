import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ১. মোট রেজিস্টার্ড ইউজার সংখ্যা
    const totalUsers = await prisma.user.count();
    
    // ২. বর্তমানে কতজন অনলাইনে আছে (গত ১০ মিনিটের অ্যাক্টিভিটি দেখে)
    const onlineUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
        }
      }
    });

    return NextResponse.json({
      ok: true,
      totalUsers,
      onlineUsers,
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ ok: false, totalUsers: 0, onlineUsers: 0 });
  }
}
