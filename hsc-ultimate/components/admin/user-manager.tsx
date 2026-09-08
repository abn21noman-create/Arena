"use client";

// ===================================================================
// Admin: User Management UI (Power-up ভার্সন)
// -------------------------------------------------------------------
// আগে: শুধু সব ইউজারের ফ্ল্যাট লিস্ট + role toggle বাটন।
// এখন যোগ হয়েছে:
// - Search (নাম/ইমেইল), Role filter, Status filter (Active/Banned)
// - Sort (Join date/XP/Name/Last active)
// - Pagination (server-side)
// - Ban/Unban (কারণ সহ ডায়ালগ)
// - Admin Delete (Confirm ডায়ালগ, cascade delete)
// - User Detail ভিউ (একজনের সব কার্যক্রম পরিসংখ্যান একসাথে)
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Users,
  ShieldCheck,
  Shield,
  Search,
  Ban,
  ShieldOff,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  level: number;
  hscBatch: number;
  board: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  streakCount: number;
  isBanned: boolean;
  banReason: string | null;
  bannedAt: string | null;
}

interface UserDetail extends UserRow {
  longestStreak: number;
  leagueTier: string;
  weeklyXp: number;
  bannedBy: string | null;
}

interface DetailStats {
  quizAttemptsCount: number;
  cqAttemptsCount: number;
  mockExamAttemptsCount: number;
  forumPostsCount: number;
  forumRepliesCount: number;
  contentReportsAgainstCount: number;
}

export function UserManager({
  initialUsers,
  initialTotalCount,
}: {
  initialUsers: UserRow[];
  initialTotalCount?: number;
}) {
  const { data: session } = useSession();
  const [users, setUsers] = useState(initialUsers);
  const [totalCount, setTotalCount] = useState(initialTotalCount ?? initialUsers.length);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const confirmAction = useConfirmDialog();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [banDialogUser, setBanDialogUser] = useState<UserRow | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banSubmitting, setBanSubmitting] = useState(false);

  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ user: UserDetail; stats: DetailStats } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce search — প্রতিটা কীস্ট্রোকে API কল না করে ৪০০ms অপেক্ষা
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        sortBy,
        sortOrder,
      });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (role !== "ALL") params.set("role", role);
      if (status !== "ALL") params.set("status", status);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotalCount(data.totalCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("ইউজার লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, debouncedSearch, role, status]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // ফিল্টার/সার্চ পরিবর্তন হলে পেজ ১ এ ফিরে যাওয়া উচিত
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status, sortBy, sortOrder]);

  async function toggleRole(user: UserRow) {
    const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";
    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "আপডেট করা যায়নি");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      toast.success(`${user.name} এখন ${newRole === "ADMIN" ? "Admin" : "Student"}`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoadingId(null);
    }
  }

  async function submitBan() {
    if (!banDialogUser) return;
    setBanSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${banDialogUser.id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: true, reason: banReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ব্যান করা যায়নি");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === banDialogUser.id
            ? { ...u, isBanned: true, banReason: data.user.banReason, bannedAt: data.user.bannedAt }
            : u
        )
      );
      toast.success(`${banDialogUser.name} কে ব্যান করা হয়েছে`);
      setBanDialogUser(null);
      setBanReason("");
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setBanSubmitting(false);
    }
  }

  async function unban(user: UserRow) {
    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "আনব্যান করা যায়নি");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: false, banReason: null, bannedAt: null } : u))
      );
      toast.success(`${user.name} কে আনব্যান করা হয়েছে`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(user: UserRow) {
    if (
      !(await confirmAction({
        title: "ইউজার ডিলিট করবে?",
        description: `"${user.name}" (${user.email}) এর অ্যাকাউন্ট ও সব ডেটা (কুইজ, ফোরাম পোস্ট, ব্যাজ ইত্যাদি) স্থায়ীভাবে মুছে যাবে। এই কাজ আর ফেরানো যাবে না।`,
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;

    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ডিলিট করা যায়নি");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotalCount((prev) => prev - 1);
      toast.success(`${user.name} এর অ্যাকাউন্ট ডিলিট হয়েছে`);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setLoadingId(null);
    }
  }

  async function openDetail(userId: string) {
    setDetailUserId(userId);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/detail`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "বিস্তারিত লোড করা যায়নি");
        return;
      }
      setDetail(data);
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
        <Users className="h-6 w-6 text-primary" />
        ইউজার ম্যানেজমেন্ট
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        মোট {totalCount} জন ইউজার — সার্চ/ফিল্টার/সর্ট করে খুঁজে নাও
      </p>

      {/* Search + Filters */}
      <Card className="p-4 mb-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="নাম/ইমেইল দিয়ে খুঁজো..."
              aria-label="নাম বা ইমেইল দিয়ে ইউজার খুঁজো"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          {/* ⚠️ base-ui Select ডিফল্টভাবে trigger এ raw value দেখায়
              (label না) — নিচের তিনটা Select এই `items` prop দিয়ে
              ম্যাপিং দেওয়া হয়েছে যাতে raw enum ("STUDENT", "ACTIVE",
              "createdAt:desc") এর বদলে readable বাংলা/ইংরেজি লেবেল
              দেখায় */}
          <Select
            value={role}
            onValueChange={(v) => setRole(v ?? "ALL")}
            items={[
              { value: "ALL", label: "সব Role" },
              { value: "STUDENT", label: "Student" },
              { value: "ADMIN", label: "Admin" },
            ]}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">সব Role</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v ?? "ALL")}
            items={[
              { value: "ALL", label: "সব স্ট্যাটাস" },
              { value: "ACTIVE", label: "সক্রিয়" },
              { value: "BANNED", label: "ব্যানড" },
            ]}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">সব স্ট্যাটাস</SelectItem>
              <SelectItem value="ACTIVE">সক্রিয়</SelectItem>
              <SelectItem value="BANNED">ব্যানড</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={`${sortBy}:${sortOrder}`}
            onValueChange={(v) => {
              if (!v) return;
              const [field, order] = v.split(":");
              setSortBy(field);
              setSortOrder(order);
            }}
            items={[
              { value: "createdAt:desc", label: "নতুন যোগ হওয়া আগে" },
              { value: "createdAt:asc", label: "পুরনো যোগ হওয়া আগে" },
              { value: "xp:desc", label: "XP (বেশি থেকে কম)" },
              { value: "xp:asc", label: "XP (কম থেকে বেশি)" },
              { value: "name:asc", label: "নাম (A-Z)" },
              { value: "lastActiveAt:desc", label: "সাম্প্রতিক সক্রিয়" },
            ]}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="সর্ট" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">নতুন যোগ হওয়া আগে</SelectItem>
              <SelectItem value="createdAt:asc">পুরনো যোগ হওয়া আগে</SelectItem>
              <SelectItem value="xp:desc">XP (বেশি থেকে কম)</SelectItem>
              <SelectItem value="xp:asc">XP (কম থেকে বেশি)</SelectItem>
              <SelectItem value="name:asc">নাম (A-Z)</SelectItem>
              <SelectItem value="lastActiveAt:desc">সাম্প্রতিক সক্রিয়</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          কোনো ইউজার পাওয়া যায়নি
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const isSelf = session?.user?.id === u.id;
            return (
              <Card key={u.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
                    {u.name}
                    {isSelf && (
                      <Badge variant="outline" className="text-xs">
                        তুমি
                      </Badge>
                    )}
                    {u.isBanned && (
                      <Badge className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive gap-1">
                        <Ban className="h-2.5 w-2.5" />
                        ব্যানড
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    HSC {u.hscBatch} • {u.board ?? "বোর্ড নেই"} • লেভেল {u.level} • {u.xp} XP
                  </p>
                  {u.isBanned && u.banReason && (
                    <p className="text-xs text-destructive mt-1">কারণ: {u.banReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => void openDetail(u.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={u.role === "ADMIN" ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    disabled={isSelf || loadingId === u.id}
                    onClick={() => toggleRole(u)}
                  >
                    {u.role === "ADMIN" ? (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Shield className="h-3.5 w-3.5" />
                    )}
                    {u.role === "ADMIN" ? "Admin" : "Student"}
                  </Button>
                  {u.role !== "ADMIN" && (
                    <>
                      {u.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={isSelf || loadingId === u.id}
                          onClick={() => void unban(u)}
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          আনব্যান
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-destructive hover:text-destructive"
                          disabled={isSelf || loadingId === u.id}
                          onClick={() => setBanDialogUser(u)}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          ব্যান
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={isSelf || loadingId === u.id}
                    onClick={() => void handleDelete(u)}
                  >
                    {loadingId === u.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            পেজ {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Ban Dialog */}
      <Dialog open={!!banDialogUser} onOpenChange={(open) => !open && setBanDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{banDialogUser?.name} কে ব্যান করবে?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              ব্যান করলে এই ইউজার আর লগইন করতে পারবে না (ইতিমধ্যে লগইন থাকলে
              পরের রিকোয়েস্টেই লগআউট হয়ে যাবে)। ডেটা মুছে যাবে না — পরে চাইলে
              আনব্যান করে দিতে পারবে।
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="ban-reason">কারণ (ঐচ্ছিক, শুধু admin দের জন্য দৃশ্যমান)</Label>
              <Textarea
                id="ban-reason"
                placeholder="যেমন: বারবার স্প্যাম/আপত্তিকর পোস্ট"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogUser(null)}>
              বাতিল
            </Button>
            <Button
              variant="destructive"
              onClick={() => void submitBan()}
              disabled={banSubmitting}
            >
              {banSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              ব্যান করো
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={!!detailUserId} onOpenChange={(open) => !open && setDetailUserId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ইউজার বিস্তারিত</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <div className="space-y-4 pt-1">
              <div>
                <p className="font-semibold">{detail.user.name}</p>
                <p className="text-xs text-muted-foreground">{detail.user.email}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <Badge variant="outline" className="text-xs">
                    {detail.user.role}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    HSC {detail.user.hscBatch}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {detail.user.leagueTier} লিগ
                  </Badge>
                  {detail.user.isBanned && (
                    <Badge className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive">
                      ব্যানড
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">{detail.user.xp}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">{detail.user.level}</p>
                  <p className="text-xs text-muted-foreground">লেভেল</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-lg font-bold">{detail.user.streakCount}</p>
                  <p className="text-xs text-muted-foreground">স্ট্রিক</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border p-2.5">
                  <p className="font-semibold">{detail.stats.quizAttemptsCount}</p>
                  <p className="text-xs text-muted-foreground">MCQ Attempt</p>
                </div>
                <div className="rounded-lg border p-2.5">
                  <p className="font-semibold">{detail.stats.cqAttemptsCount}</p>
                  <p className="text-xs text-muted-foreground">CQ Attempt</p>
                </div>
                <div className="rounded-lg border p-2.5">
                  <p className="font-semibold">{detail.stats.mockExamAttemptsCount}</p>
                  <p className="text-xs text-muted-foreground">Mock Exam</p>
                </div>
                <div className="rounded-lg border p-2.5">
                  <p className="font-semibold">
                    {detail.stats.forumPostsCount + detail.stats.forumRepliesCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Forum পোস্ট/রিপ্লাই</p>
                </div>
              </div>

              {detail.stats.contentReportsAgainstCount > 0 && (
                <Alert variant="warning">
                  <AlertTriangle />
                  <AlertDescription>
                    এই ইউজারের কনটেন্টের বিরুদ্ধে {detail.stats.contentReportsAgainstCount}
                    টা রিপোর্ট এসেছে (Content Reports প্যানেলে বিস্তারিত দেখো)
                  </AlertDescription>
                </Alert>
              )}

              {detail.user.isBanned && (
                <Alert variant="destructive">
                  <Ban />
                  <AlertDescription>
                    ব্যান করা হয়েছে: {detail.user.banReason ?? "কারণ উল্লেখ নেই"}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">লোড করা যায়নি</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
