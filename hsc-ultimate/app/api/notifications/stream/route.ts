/**
 * Server-Sent Events (SSE) endpoint for real-time notification delivery.
 *
 * Clients connect with: `new EventSource("/api/notifications/stream")`
 * Receive events:
 *   - "notification" — new in-app notification
 *   - "broadcast" — admin broadcast (real-time)
 *   - "ping" — keep-alive every 25s
 *
 * Polls DB every 5s for new notifications since last check.
 * Lightweight — keeps single connection per tab.
 */
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_INTERVAL = 5000; // 5s
const PING_INTERVAL = 25000; // 25s

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  // Track last seen notification ID
  let lastNotificationId: string | null = null;
  let lastBroadcastId: string | null = null;

  // Read initial state
  const initial = await prisma.notification.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  lastNotificationId = initial?.id ?? null;

  const initialBroadcast = await prisma.broadcastRecipient.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { campaignId: true },
  });
  lastBroadcastId = initialBroadcast?.campaignId ?? null;

  // SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Client disconnected
          console.log("[SSE] Client disconnected");
        }
      };

      // Initial hello
      send("connected", { userId, ts: Date.now() });

      // Polling loop
      const poll = setInterval(async () => {
        try {
          // 1. Check for new notifications
          const newNotifs = await prisma.notification.findMany({
            where: {
              userId,
              ...(lastNotificationId ? { id: { gt: lastNotificationId } } : {}),
            },
            orderBy: { createdAt: "asc" },
            take: 10,
          });
          if (newNotifs.length > 0) {
            lastNotificationId = newNotifs[newNotifs.length - 1].id;
            for (const n of newNotifs) {
              send("notification", {
                id: n.id,
                title: n.title,
                body: n.body,
                link: n.link,
                read: n.read,
                createdAt: n.createdAt,
              });
            }
          }

          // 2. Check for new broadcasts
          const newBroadcasts = await prisma.broadcastRecipient.findMany({
            where: {
              userId,
              inAppDelivered: true,
              ...(lastBroadcastId ? { campaignId: { gt: lastBroadcastId } } : {}),
            },
            orderBy: { createdAt: "asc" },
            take: 5,
            include: { campaign: true },
          });
          if (newBroadcasts.length > 0) {
            lastBroadcastId = newBroadcasts[newBroadcasts.length - 1].campaignId;
            for (const b of newBroadcasts) {
              send("broadcast", {
                campaignId: b.campaignId,
                title: b.campaign.title,
                body: b.campaign.body,
                link: b.campaign.link,
                icon: b.campaign.icon,
                sentBy: b.campaign.sentById,
                sentAt: b.campaign.createdAt,
              });
            }
          }
        } catch (err) {
          console.error("[SSE] Polling error:", err);
        }
      }, POLL_INTERVAL);

      // Keep-alive ping
      const ping = setInterval(() => {
        send("ping", { ts: Date.now() });
      }, PING_INTERVAL);

      // Cleanup on disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(poll);
        clearInterval(ping);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // nginx compat
    },
  });
}
