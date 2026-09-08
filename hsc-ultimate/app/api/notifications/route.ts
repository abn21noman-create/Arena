// ===================================================================
// Notification List API
// GET /api/notifications                       — সাম্প্রতিক ৩০টা নোটিফিকেশন + unread count
//     (NotificationBell dropdown এর জন্য, backward compatible)
// GET /api/notifications?page=1&filter=unread   — Notification Center
//     পেজের জন্য (pagination + filter সহ)
// -------------------------------------------------------------------
// MASTER_PLAN.md এর মূল ভিশনের "In-app notification center" আইটেম
// পূরণ করতে page/filter query param যোগ করা হয়েছে — বিদ্যমান
// NotificationBell dropdown (query param ছাড়া কল করে) এর behavior
// অপরিবর্তিত রাখা হয়েছে (backward compatible)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePaginationParam } from "@/lib/pagination-validation";

const PAGE_SIZE = 20;
const DROPDOWN_LIMIT = 30;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const pageParam = req.nextUrl.searchParams.get("page");
  const filter = req.nextUrl.searchParams.get("filter"); // "unread" | null (সব)

  // page param না থাকলে পুরনো dropdown-compatible আচরণ (৩০টা, filter ছাড়া)
  if (!pageParam) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: DROPDOWN_LIMIT,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  }

  // Notification Center পেজের জন্য pagination + filter
  // 🐛 বাগ ফিক্স: `?page=99999999999999999999`-এর মতো extreme মান আগে
  // Prisma `skip`-এ গিয়ে ৫০০ ক্র্যাশ করাত — এখন safe-integer চেক করে fallback।
  const page = parsePaginationParam(pageParam, 1, { min: 1 });
  const where = {
    userId: session.user.id,
    ...(filter === "unread" ? { read: false } : {}),
  };

  const [notifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId: session.user.id, read: false },
    }),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount,
    totalCount,
    page,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  });
}

