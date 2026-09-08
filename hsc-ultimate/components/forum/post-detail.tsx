"use client";

// ===================================================================
// Forum Post Detail — পোস্ট, সব রিপ্লাই, ভোটিং, সেরা উত্তর নির্বাচন
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatRelativeOrDate } from "@/lib/format-date";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  CheckCircle2,
  Loader2,
  Send,
  Trash2,
  Award,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/forum/report-dialog";

interface Author {
  id: string;
  name: string;
}

interface Reply {
  id: string;
  content: string;
  isBestAnswer: boolean;
  createdAt: string;
  user: Author;
  voteScore: number;
  myVote: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  subjectCode: string | null;
  isResolved: boolean;
  viewCount: number;
  createdAt: string;
  user: Author;
  voteScore: number;
  myVote: number;
  replies: Reply[];
}

const CATEGORY_LABELS: Record<string, string> = {
  QUESTION: "প্রশ্ন",
  DISCUSSION: "আলোচনা",
  NOTE_SHARE: "নোট শেয়ার",
  ANNOUNCEMENT: "ঘোষণা",
};

export function PostDetail({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string;
}) {
  const confirmAction = useConfirmDialog();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}`);
      const data = await res.json();
      if (res.ok) setPost(data.post);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function handleVotePost(value: 1 | -1) {
    const res = await fetch(`/api/forum/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) void loadPost();
  }

  async function handleVoteReply(replyId: string, value: 1 | -1) {
    const res = await fetch(`/api/forum/replies/${replyId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) void loadPost();
  }

  async function handleSubmitReply() {
    if (!replyText.trim()) {
      toast.error("উত্তর লেখো");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      if (!res.ok) {
        toast.error("রিপ্লাই করা যায়নি");
        return;
      }
      toast.success("উত্তর দেওয়া হয়েছে! +5 XP");
      setReplyText("");
      void loadPost();
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkBestAnswer(replyId: string) {
    const res = await fetch(`/api/forum/replies/${replyId}/best-answer`, {
      method: "PATCH",
    });
    if (res.ok) {
      toast.success("সেরা উত্তর নির্বাচন করা হয়েছে!");
      void loadPost();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "সমস্যা হয়েছে");
    }
  }

  async function handleDeletePost() {
    if (!(await confirmAction({ description: "এই পোস্ট ডিলিট করবে?", confirmLabel: "ডিলিট করো" })))
      return;
    const res = await fetch(`/api/forum/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("পোস্ট ডিলিট হয়েছে");
      window.location.href = "/forum";
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">পোস্ট পাওয়া যায়নি।</p>
      </div>
    );
  }

  const isPostOwner = post.user.id === currentUserId;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/forum" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-xs">{CATEGORY_LABELS[post.category]}</Badge>
          {post.isResolved && (
            <Badge className="text-xs gap-1 bg-violet-500 hover:bg-violet-500 text-white">
              <CheckCircle2 className="h-3 w-3" />
              সমাধান হয়েছে
            </Badge>
          )}
        </div>
      </div>

      {/* Main post */}
      <Card className="p-5 mb-6">
        <div className="flex gap-4">
          {/* Vote column */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button onClick={() => handleVotePost(1)}>
              <ArrowBigUp
                className={cn(
                  "h-6 w-6",
                  post.myVote === 1 ? "fill-primary text-primary" : "text-muted-foreground"
                )}
              />
            </button>
            <span className="text-sm font-bold">{post.voteScore}</span>
            <button onClick={() => handleVotePost(-1)}>
              <ArrowBigDown
                className={cn(
                  "h-6 w-6",
                  post.myVote === -1 ? "fill-destructive text-destructive" : "text-muted-foreground"
                )}
              />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold mb-2">{post.title}</h1>
            <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>{post.user.name}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.viewCount}
                </span>
                <span>{formatRelativeOrDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {!isPostOwner && <ReportDialog postId={post.id} />}
                {isPostOwner && (
                  <button
                    onClick={handleDeletePost}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="পোস্ট মুছে ফেলো"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Replies */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        {post.replies.length} টি উত্তর
      </h2>
      <div className="space-y-3 mb-6">
        {post.replies.map((reply) => (
          <Card
            key={reply.id}
            className={cn("p-4", reply.isBestAnswer && "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20")}
          >
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <button onClick={() => handleVoteReply(reply.id, 1)}>
                  <ArrowBigUp
                    className={cn(
                      "h-5 w-5",
                      reply.myVote === 1 ? "fill-primary text-primary" : "text-muted-foreground"
                    )}
                  />
                </button>
                <span className="text-xs font-bold">{reply.voteScore}</span>
                <button onClick={() => handleVoteReply(reply.id, -1)}>
                  <ArrowBigDown
                    className={cn(
                      "h-5 w-5",
                      reply.myVote === -1 ? "fill-destructive text-destructive" : "text-muted-foreground"
                    )}
                  />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                {reply.isBestAnswer && (
                  <Badge className="mb-1.5 gap-1 bg-violet-500 hover:bg-violet-500 text-white text-xs">
                    <Award className="h-3 w-3" />
                    সেরা উত্তর
                  </Badge>
                )}
                <p className="text-sm whitespace-pre-wrap mb-2">{reply.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {reply.user.name} · {formatRelativeOrDate(reply.createdAt)}
                  </span>
                  <div className="flex items-center gap-2.5">
                    {isPostOwner && !reply.isBestAnswer && (
                      <button
                        onClick={() => handleMarkBestAnswer(reply.id)}
                        className="text-primary hover:underline text-xs"
                      >
                        সেরা উত্তর নির্বাচন করো
                      </button>
                    )}
                    {reply.user.id !== currentUserId && <ReportDialog replyId={reply.id} />}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reply form */}
      <Card className="p-4">
        <p className="text-sm font-medium mb-2">তোমার উত্তর দাও</p>
        <Textarea
          placeholder="সাহায্য করো..."
          aria-label="তোমার উত্তর"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={3}
          className="mb-3"
        />
        <Button onClick={handleSubmitReply} disabled={submitting} className="gap-2">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          উত্তর দাও
        </Button>
      </Card>
    </div>
  );
}
