// ===================================================================
// Admin Dashboard — সামগ্রিক পরিসংখ্যান
// -------------------------------------------------------------------
// 🔧 UI/UX Polish:
// 1. স্ট্যাট কার্ডগুলো আগে শুধু সংখ্যা দেখাতো, কোনো লিংক ছিল না —
//    এখন প্রতিটা কার্ড সংশ্লিষ্ট Admin পেজে ক্লিক করে যাওয়া যায়
//    (যেমন "মোট ইউজার" কার্ডে ক্লিক করলে সরাসরি User Management এ)।
// 2. নতুন "অপেক্ষমাণ রিপোর্ট" স্ট্যাট কার্ড যোগ — Admin ড্যাশবোর্ডে
//    ঢুকেই বুঝতে পারবে কোনো জরুরি moderation কাজ বাকি আছে কিনা
//    (আগে এটা জানতে আলাদা করে Content Reports পেজে যেতে হতো)।
// ===================================================================
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Layers,
  FileQuestion,
  Brain,
  Sparkles,
  Flag,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalSubjects,
    totalChapters,
    totalTopics,
    totalQuestions,
    totalQuizAttempts,
    pendingReportsCount,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subject.count(),
    prisma.chapter.count(),
    prisma.topic.count(),
    prisma.question.count(),
    prisma.quizAttempt.count(),
    prisma.contentReport.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, xp: true, role: true, createdAt: true },
    }),
  ]);

  const stats = [
    {
      icon: Users,
      label: "মোট ইউজার",
      value: totalUsers,
      color: "text-violet-600 dark:text-violet-400",
      href: "/admin/users",
    },
    {
      icon: BookOpen,
      label: "সাবজেক্ট",
      value: totalSubjects,
      color: "text-violet-600 dark:text-violet-400",
      href: "/admin/subjects",
    },
    {
      icon: Layers,
      label: "চ্যাপ্টার",
      value: totalChapters,
      color: "text-fuchsia-600 dark:text-fuchsia-400",
      href: "/admin/subjects",
    },
    {
      icon: FileQuestion,
      label: "টপিক",
      value: totalTopics,
      color: "text-amber-600 dark:text-amber-400",
      href: "/admin/subjects",
    },
    {
      icon: Brain,
      label: "প্রশ্ন",
      value: totalQuestions,
      color: "text-rose-600 dark:text-rose-400",
      href: "/admin/subjects",
    },
    {
      icon: Sparkles,
      label: "কুইজ অ্যাটেম্পট",
      value: totalQuizAttempts,
      color: "text-fuchsia-700 dark:text-fuchsia-300",
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">
        HSC Ultimate প্ল্যাটফর্মের সামগ্রিক পরিসংখ্যান
      </p>

      {/* অপেক্ষমাণ রিপোর্ট থাকলে prominently দেখানো হয় (jরুরি action-needed) */}
      {pendingReportsCount > 0 && (
        <Link href="/admin/reports" className="block mb-6">
          <Card className="p-4 flex items-center gap-3 border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
              <Flag className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {pendingReportsCount}টা রিপোর্ট রিভিউয়ের অপেক্ষায় আছে
              </p>
              <p className="text-xs text-muted-foreground">
                ক্লিক করে Content Reports পেজে গিয়ে রিভিউ করো
              </p>
            </div>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-4 text-center hover-lift hover:border-primary/30 cursor-pointer h-full">
              <s.icon className={`h-5 w-5 mx-auto mb-1.5 ${s.color}`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">সাম্প্রতিক ইউজার</h2>
          <Link href="/admin/users" className="text-xs text-primary hover:underline">
            সব দেখো →
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">এখনো কোনো ইউজার নেই</p>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs">{u.xp} XP</p>
                  <p className="text-xs text-muted-foreground">
                    {u.role === "ADMIN" ? "🛡️ Admin" : "Student"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
