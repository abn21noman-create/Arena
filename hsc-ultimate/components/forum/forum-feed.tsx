"use client";

// ===================================================================
// Forum Feed — সব পোস্ট দেখায়, ক্যাটাগরি/সাবজেক্ট ফিল্টার সহ
// -------------------------------------------------------------------
// 🎨 UI/UX রিডিজাইন (Reddit/Discord Forums থেকে গবেষণা করে অনুপ্রাণিত):
// আগে vote-score একটা প্লেইন সংখ্যা ছিল, category badge গুলো একই সারিতে
// গাদাগাদি করা ছিল, author কোনো avatar ছাড়া প্লেইন টেক্সট ছিল। এখন:
// - Reddit-স্টাইল vote column: গোলাকার আপ-অ্যারো বাটন লুক (up chevron)
//   + বড়, বোল্ড স্কোর সংখ্যা, নিজস্ব হালকা ব্যাকগ্রাউন্ড কলাম
// - Author এর জন্য ছোট Avatar initial badge (নাম শুধু টেক্সট না)
// - Category badge রঙিন ডট + লেবেল স্টাইলে (Discord ফোরাম ক্যাটাগরির
//   মতো), pinned/resolved স্ট্যাটাস আলাদা visual treatment
// - Filter pills বড়/স্পষ্ট, active state এ রঙিন আন্ডারলাইন-স্টাইল
// ===================================================================
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeOrDate } from "@/lib/format-date";
import {
  ArrowLeft,
  Plus,
  MessageCircle,
  Eye,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Pin,
  CheckCircle2,
  Loader2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerGroup, StaggerItem } from "@/components/motion/fade-in";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  subjectCode: string | null;
  isPinned: boolean;
  isResolved: boolean;
  viewCount: number;
  createdAt: string;
  author: { id: string; name: string };
  replyCount: number;
  voteScore: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  QUESTION: "প্রশ্ন",
  DISCUSSION: "আলোচনা",
  NOTE_SHARE: "নোট শেয়ার",
  ANNOUNCEMENT: "ঘোষণা",
};

// Discord ফোরাম ক্যাটাগরির মতো — রঙিন ডট + হালকা background ট্যাগ
// Violet Glass Theme — ৪টা ক্যাটাগরিই ব্র্যান্ড-সংলগ্ন থেকেও আলাদা করা
// যায়: violet → fuchsia → cyan এর ধাপ + ANNOUNCEMENT এ ইচ্ছাকৃত amber
// (semantic "মনোযোগ দিন" সংকেত, established Alert warning প্যাটার্নের
// সাথে সঙ্গতিপূর্ণ)
const CATEGORY_DOT: Record<string, string> = {
  QUESTION: "bg-violet-500",
  DISCUSSION: "bg-fuchsia-500",
  NOTE_SHARE: "bg-cyan-600",
  ANNOUNCEMENT: "bg-amber-500",
};

const CATEGORY_TAG_STYLE: Record<string, string> = {
  QUESTION: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  DISCUSSION: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  NOTE_SHARE: "bg-cyan-50 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300",
  ANNOUNCEMENT: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const SUBJECT_LABELS: Record<string, string> = {
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  HIGHER_MATH: "উচ্চতর গণিত",
  BANGLA: "বাংলা",
  ENGLISH: "English",
  ICT: "ICT",
};

const CATEGORY_FILTERS = [
  { value: "সব", label: "সব" },
  { value: "QUESTION", label: "🔵 প্রশ্ন" },
  { value: "DISCUSSION", label: "🟣 আলোচনা" },
  { value: "NOTE_SHARE", label: "🟢 নোট শেয়ার" },
  { value: "ANNOUNCEMENT", label: "🟡 ঘোষণা" },
];

function getInitial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

export function ForumFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("সব");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalItems: 0, totalPages: 1 });

  const loadPosts = useCallback(async (category: string, requestedPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(requestedPage) });
      if (category !== "সব") params.set("category", category);
      const res = await fetch(`/api/forum/posts?${params}`, { cache: "no-store" });
      const data = await res.json();
      setPosts(data.posts ?? []);
      setPagination(data.pagination ?? { page: requestedPage, totalItems: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts(activeCategory, page);
  }, [activeCategory, loadPosts, page]);

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/dashboard" className="rounded-full p-2 hover:bg-muted transition-colors" aria-label="পিছনে যাও">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            কমিউনিটি
          </h1>
          <p className="text-sm text-muted-foreground">
            একে অপরকে সাহায্য করো, প্রশ্ন করো, নোট শেয়ার করো
          </p>
        </div>
      </div>

      {/* প্রিমিয়াম glassmorphism হিরো ব্যানার — vibrant gradient +
          ভাসমান blur orb + glass CTA বাটন (established `.glass-hero`/
          `.glass-hero-orb`/`.glass-chip` recipe, ব্যবহারকারীর
          "aro premium design" ও "glass morphin" অনুরোধ অনুযায়ী) */}
      <div className="glass-hero glass-hero-card relative mb-5 overflow-hidden rounded-2xl bg-linear-to-br from-violet-600 via-fuchsia-700 to-fuchsia-900 p-5 text-white shadow-xl">
        <div className="glass-hero-orb h-48 w-48 bg-white/20" style={{ top: "-4rem", right: "-2rem" }} />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-heading text-lg font-bold">সহপাঠীদের সাথে যুক্ত থাকো</p>
            <p className="mt-0.5 text-xs text-white/80">
              প্রশ্ন করো, একে অপরকে সাহায্য করো, নোট শেয়ার করো — সবাই মিলে এগিয়ে যাও
            </p>
          </div>
          <Button render={<Link href="/forum/new" />} className="glass-chip gap-1.5 border-0 text-white hover:bg-white/25">
              <Plus className="h-4 w-4" />
              নতুন পোস্ট
            </Button>
        </div>
      </div>

      {/* Category filters — pill স্টাইল, active হলে ভরাট রঙিন */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setActiveCategory(cat.value);
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border",
              activeCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি তুমিই করো!
          </p>
          <Button render={<Link href="/forum/new" />} className="gap-1.5">
              <Plus className="h-4 w-4" />
              নতুন পোস্ট করো
            </Button>
        </div>
      ) : (
        <StaggerGroup className="space-y-3" staggerDelay={0.04}>
          {posts.map((post) => (
            <StaggerItem key={post.id}>
            <Link href={`/forum/${post.id}`}>
              <Card
                className={cn(
                  "overflow-hidden p-0 hover-lift cursor-pointer flex flex-row",
                  post.isPinned && "border-amber-400/60 dark:border-amber-500/40"
                )}
              >
                {/* Reddit-স্টাইল Vote Column */}
                <div className="flex flex-col items-center justify-center gap-0.5 shrink-0 w-14 bg-muted/40 py-4">
                  <ChevronUp
                    className={cn(
                      "h-5 w-5",
                      post.voteScore > 0 ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-base font-bold">{post.voteScore}</span>
                  <span className="text-xs text-muted-foreground">ভোট</span>
                </div>

                <div className="min-w-0 flex-1 p-4">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <Pin className="h-3 w-3" />
                        পিন করা
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                        CATEGORY_TAG_STYLE[post.category]
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[post.category])} />
                      {CATEGORY_LABELS[post.category]}
                    </span>
                    {post.subjectCode && (
                      <Badge variant="outline" className="text-xs">
                        {SUBJECT_LABELS[post.subjectCode] ?? post.subjectCode}
                      </Badge>
                    )}
                    {post.isResolved && (
                      <Badge className="text-xs gap-1 bg-violet-500 hover:bg-violet-500 text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        সমাধান হয়েছে
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2.5">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Avatar className="h-4.5 w-4.5">
                        <AvatarFallback className="bg-linear-to-br from-violet-600 to-violet-800 text-xs font-semibold text-white">
                          {getInitial(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      {post.author.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.replyCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.viewCount}
                    </span>
                    <span>{formatRelativeOrDate(post.createdAt)}</span>
                  </div>
                </div>
              </Card>
            </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> আগের
          </Button>
          <span className="text-xs text-muted-foreground">
            {page}/{pagination.totalPages} · {pagination.totalItems} পোস্ট
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            পরের <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
