"use client";

// ===================================================================
// Admin Forum Moderation Panel — সব পোস্ট দেখা, পিন/আনপিন, ডিলিট করা
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Pin, PinOff, Trash2, MessageSquare, ExternalLink, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForumPostAdmin {
  id: string;
  title: string;
  category: string;
  isPinned: boolean;
  isResolved: boolean;
  viewCount: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  _count: { replies: number; votes: number };
}

interface ModerationScanResult {
  category: "SPAM" | "OFFENSIVE" | "HARASSMENT" | "CLEAN";
  confidence: "high" | "medium" | "low";
  reason: string;
  shouldBlock: boolean;
  aiFailed: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  QUESTION: "প্রশ্ন",
  DISCUSSION: "আলোচনা",
  NOTE_SHARE: "নোট শেয়ার",
  ANNOUNCEMENT: "ঘোষণা",
};

const MODERATION_CATEGORY_LABELS: Record<string, string> = {
  SPAM: "স্প্যাম",
  OFFENSIVE: "আপত্তিকর ভাষা",
  HARASSMENT: "হয়রানিমূলক",
  CLEAN: "ঠিক আছে (Clean)",
};


export function ForumModerationPanel() {
  const confirmAction = useConfirmDialog();
  const [posts, setPosts] = useState<ForumPostAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<Record<string, ModerationScanResult>>({});

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/forum/posts");
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      toast.error("পোস্ট লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function togglePin(post: ForumPostAdmin) {
    setActioningId(post.id);
    try {
      const res = await fetch(`/api/admin/forum/posts/${post.id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });
      if (!res.ok) throw new Error();
      setPosts((prev) =>
        prev
          .map((p) => (p.id === post.id ? { ...p, isPinned: !p.isPinned } : p))
          .sort((a, b) =>
            a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1
          )
      );
      toast.success(post.isPinned ? "আনপিন করা হয়েছে" : "পিন করা হয়েছে");
    } catch {
      toast.error("করা যায়নি");
    } finally {
      setActioningId(null);
    }
  }

  // AI Content Moderation — বিদ্যমান পোস্ট on-demand স্ক্যান করা (নতুন
  // পোস্টে automatic moderation চলে, এটা পুরনো পোস্ট/রিপোর্ট হওয়া পোস্ট
  // ম্যানুয়ালি re-check করার জন্য)
  async function handleScan(postId: string) {
    setScanningId(postId);
    try {
      const res = await fetch(`/api/admin/forum/posts/${postId}/scan`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "স্ক্যান করা যায়নি");
        return;
      }
      setScanResults((prev) => ({ ...prev, [postId]: data.moderation }));
      if (data.moderation.aiFailed) {
        toast.warning("AI প্রোভাইডার সাড়া দেয়নি, পরে আবার চেষ্টা করো");
      } else if (data.moderation.category === "CLEAN") {
        toast.success("স্ক্যান সম্পন্ন — কোনো সমস্যা পাওয়া যায়নি");
      } else {
        toast.warning(`সন্দেহজনক কন্টেন্ট: ${MODERATION_CATEGORY_LABELS[data.moderation.category]}`);
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setScanningId(null);
    }
  }

  async function handleDelete(postId: string) {
    if (
      !(await confirmAction({
        description: "এই পোস্ট ডিলিট করবে? এটা ফেরানো যাবে না।",
        confirmLabel: "ডিলিট করো",
      }))
    )
      return;
    setActioningId(postId);
    try {
      const res = await fetch(`/api/admin/forum/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("পোস্ট ডিলিট হয়েছে");
    } catch {
      toast.error("ডিলিট করা যায়নি");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        Forum Moderation
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        সব পোস্ট দেখুন, পিন করুন, বা অনুপযুক্ত পোস্ট ডিলিট করুন
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          এখনো কোনো পোস্ট নেই
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {post.isPinned && (
                      <Pin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[post.category] ?? post.category}
                    </Badge>
                    {post.isResolved && (
                      <Badge className="text-xs bg-violet-500 hover:bg-violet-500">
                        সমাধান হয়েছে
                      </Badge>
                    )}
                  </div>
                  <Link
                    href={`/forum/${post.id}`}
                    target="_blank"
                    className="text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    {post.title}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.user.name} ({post.user.email}) • {post._count.replies} রিপ্লাই •{" "}
                    {post._count.votes} ভোট • {post.viewCount} ভিউ
                  </p>
                  {scanResults[post.id] && (
                    <Alert
                      variant={scanResults[post.id].category === "CLEAN" ? "success" : "destructive"}
                      className="mt-2 text-xs"
                    >
                      <ScanSearch className="h-3.5 w-3.5" />
                      <AlertDescription
                        className={cn(
                          scanResults[post.id].category === "CLEAN"
                            ? "text-violet-700 dark:text-violet-400"
                            : "text-destructive"
                        )}
                      >
                        <strong>{MODERATION_CATEGORY_LABELS[scanResults[post.id].category]}</strong>
                        {" "}(confidence: {scanResults[post.id].confidence})
                        {scanResults[post.id].reason && ` — ${scanResults[post.id].reason}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={scanningId === post.id}
                          onClick={() => handleScan(post.id)}
                          aria-label="AI দিয়ে স্ক্যান করো"
                        >
                          {scanningId === post.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ScanSearch className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      }
                    />
                    <TooltipContent>AI দিয়ে স্ক্যান করো</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={actioningId === post.id}
                          onClick={() => togglePin(post)}
                          aria-label={post.isPinned ? "আনপিন করো" : "পিন করো"}
                        >
                          {post.isPinned ? (
                            <PinOff className="h-3.5 w-3.5" />
                          ) : (
                            <Pin className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      }
                    />
                    <TooltipContent>{post.isPinned ? "আনপিন করো" : "পিন করো"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-8 w-8 text-muted-foreground hover:text-destructive"
                          )}
                          disabled={actioningId === post.id}
                          onClick={() => handleDelete(post.id)}
                          aria-label="ডিলিট করো"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <TooltipContent>ডিলিট করো</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
