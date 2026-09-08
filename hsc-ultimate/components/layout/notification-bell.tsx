"use client";

// ===================================================================
// Notification Bell — Dropdown এ সাম্প্রতিক নোটিফিকেশন দেখায়
// -------------------------------------------------------------------
// প্রতি ৩০ সেকেন্ড পর পর background এ unread count পোল করা হয়, dropdown
// খুললে পুরো লিস্ট লোড হয়।
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeOrDate } from "@/lib/format-date";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = await res.json();
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silent fail — ব্যাকগ্রাউন্ড পোলিং, ইউজারকে বিরক্ত করার দরকার নেই
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  async function loadFullList() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      await loadFullList();
    }
  }

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  async function handleClick(n: NotificationItem) {
    if (!n.read) await markAsRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function deleteNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" });
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className="outline-none"
        render={
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 relative"
            aria-label={unreadCount > 0 ? `নোটিফিকেশন (${unreadCount}টি অপঠিত)` : "নোটিফিকেশন"}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-xs text-white flex items-center justify-center font-semibold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">নোটিফিকেশন</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              সব পড়া হয়েছে মার্ক করো
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">
              কোনো নোটিফিকেশন নেই
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b last:border-b-0 group relative",
                  !n.read && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className="flex-1 min-w-0 flex items-start gap-2 text-left px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-none"
                  >
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                    <div className={cn("flex-1 min-w-0", n.read && "pl-3.5")}>
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatRelativeOrDate(n.createdAt)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 mt-2.5 mr-2 rounded hover:bg-muted shrink-0"
                    aria-label="মুছে ফেলো"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="my-0" />
        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="block px-3 py-2.5 text-center text-xs font-medium text-primary hover:bg-muted/60 transition-colors"
        >
          সব নোটিফিকেশন দেখো
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
