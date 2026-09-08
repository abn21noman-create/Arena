"use client";

// ===================================================================
// Notification Center — সম্পূর্ণ নোটিফিকেশন হিস্ট্রি (pagination+filter)
// (MASTER_PLAN.md এর মূল ভিশনের "In-app notification center" আইটেম)
// -------------------------------------------------------------------
// NotificationBell dropdown এর max-height স্ক্রল সীমার বিপরীতে —
// এখানে unread/all ফিল্টার + page-based pagination সহ সব নোটিফিকেশন
// দেখা যায়।
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bell,
  Check,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
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

function formatDate(iso: string): string {
  return formatRelativeOrDate(iso, { withTime: true, longMonth: true });
}

export function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${page}&filter=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "নোটিফিকেশন লোড করা যায়নি");
        return;
      }
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      setTotalCount(data.totalCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  function handleFilterChange(next: string) {
    setFilter(next as "all" | "unread");
    setPage(1); // ফিল্টার বদলালে প্রথম পাতায় ফিরে যাওয়া
  }

  async function handleClick(n: NotificationItem) {
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
    }
    if (n.link) router.push(n.link);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const wasUnread = notifications.find((n) => n.id === id)?.read === false;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotalCount((c) => Math.max(0, c - 1));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" });
    if (filter === "unread") void loadNotifications();
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            নোটিফিকেশন সেন্টার
          </h1>
          <p className="text-sm text-muted-foreground">
            মোট {totalCount}টা নোটিফিকেশন{unreadCount > 0 && ` • ${unreadCount}টা অপঠিত`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5 shrink-0">
            <Check className="h-3.5 w-3.5" />
            সব পড়া হয়েছে
          </Button>
        )}
      </div>

      {/* glassmorphism hero banner — established প্যাটার্ন, ব্র্যান্ড
          ভায়োলেট থিম (নোটিফিকেশন কোনো নির্দিষ্ট module-color নেই, তাই
          ব্র্যান্ড identity রঙ ব্যবহার করা হয়) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-600 to-violet-800 p-5 mb-6 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-32 w-32 bg-white/20"
          style={{ top: "-2rem", right: "-1.5rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <span className="glass-chip flex h-11 w-11 items-center justify-center rounded-full">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold">{totalCount}টা নোটিফিকেশন</p>
            <p className="text-sm opacity-90">
              {unreadCount > 0 ? `${unreadCount}টা এখনো অপঠিত` : "সব পড়া হয়ে গেছে ✓"}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={filter} onValueChange={handleFilterChange} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">সব</TabsTrigger>
          <TabsTrigger value="unread">অপঠিত{unreadCount > 0 && ` (${unreadCount})`}</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-10 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === "unread" ? "কোনো অপঠিত নোটিফিকেশন নেই" : "কোনো নোটিফিকেশন নেই"}
          </p>
        </Card>
      ) : (
        <StaggerGroup className="space-y-2 mb-6" staggerDelay={0.03}>
          {notifications.map((n) => (
            <StaggerItem key={n.id}>
            <Card
              className={cn(
                "p-0 overflow-hidden group relative",
                !n.read && "bg-primary/5 border-primary/20"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className="flex-1 min-w-0 flex items-start gap-3 text-left p-4 cursor-pointer hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  <div className={cn("flex-1 min-w-0", n.read && "pl-5")}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                </button>
                <button
                  onClick={(e) => handleDelete(n.id, e)}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1.5 mt-3 mr-3 rounded hover:bg-muted shrink-0"
                  aria-label="মুছে ফেলো"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            আগের
          </Button>
          <span className="text-xs text-muted-foreground">
            পাতা {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="gap-1"
          >
            পরের
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
