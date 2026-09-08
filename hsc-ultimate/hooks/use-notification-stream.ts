"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface StreamNotification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string | Date;
}

interface StreamBroadcast {
  campaignId: string;
  title: string;
  body: string;
  link: string | null;
  icon: string | null;
  sentBy: string | null;
  sentAt: string | Date;
}

type StreamEvent =
  | { type: "notification"; data: StreamNotification }
  | { type: "broadcast"; data: StreamBroadcast };

interface NotificationStreamOptions {
  onNotification?: (notification: StreamNotification) => void;
  onBroadcast?: (broadcast: StreamBroadcast) => void;
  showToasts?: boolean;
  enabled?: boolean;
}

export function useNotificationStream({
  onNotification,
  onBroadcast,
  showToasts = true,
  enabled = true,
}: NotificationStreamOptions) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<StreamEvent | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    esRef.current?.close();

    const eventSource = new EventSource("/api/notifications/stream");
    esRef.current = eventSource;

    eventSource.addEventListener("connected", () => setConnected(true));
    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data) as StreamNotification;
        setLastEvent({ type: "notification", data });
        onNotification?.(data);
        if (showToasts) {
          toast(data.title, {
            description: data.body,
            action: data.link
              ? { label: "Open", onClick: () => { window.location.href = data.link!; } }
              : undefined,
          });
        }
      } catch (error) {
        console.error("[SSE] Notification parse error:", error);
      }
    });
    eventSource.addEventListener("broadcast", (event) => {
      try {
        const data = JSON.parse(event.data) as StreamBroadcast;
        setLastEvent({ type: "broadcast", data });
        onBroadcast?.(data);
        if (showToasts) {
          toast(`${data.icon || "📢"} ${data.title}`, {
            description: data.body,
            action: data.link
              ? { label: "Open", onClick: () => { window.location.href = data.link!; } }
              : undefined,
          });
        }
      } catch (error) {
        console.error("[SSE] Broadcast parse error:", error);
      }
    });
    eventSource.onerror = () => {
      // Native EventSource automatically reconnects using the server retry value.
      setConnected(false);
    };
  }, [enabled, onBroadcast, onNotification, showToasts]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);

  return { connected, lastEvent };
}
