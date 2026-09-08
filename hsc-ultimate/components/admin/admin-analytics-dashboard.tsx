"use client";

// ===================================================================
// Admin Analytics Dashboard — ইউজার এনগেজমেন্ট (DAU/WAU/MAU) ও কন্টেন্ট
// পপুলারিটি (সাবজেক্ট/টপিক-ভিত্তিক) দেখায়
// ===================================================================
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
  Users,
  TrendingUp,
  Brain,
  PenLine,
  ClipboardCheck,
  MessageSquare,
  Flame,
} from "lucide-react";

interface AnalyticsData {
  engagement: { dau: number; wau: number; mau: number; totalUsers: number };
  activityCounts: {
    quizAttempts: number;
    cqAttempts: number;
    mockExamAttempts: number;
    forumPosts: number;
  };
  subjectPopularity: {
    subjectId: string;
    subjectName: string;
    attemptCount: number;
    avgAccuracyPct: number;
  }[];
  mostPracticedTopics: {
    topicId: string;
    topicName: string;
    answerCount: number;
  }[];
  signupTrend: { date: string; count: number }[];
}

export function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">অ্যানালিটিক্স তৈরি হচ্ছে...</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">ডেটা লোড করা যায়নি।</p>;
  }

  const { engagement, activityCounts, subjectPopularity, mostPracticedTopics, signupTrend } =
    data;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Admin Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">
        ইউজার এনগেজমেন্ট ও কন্টেন্ট পপুলারিটি বিশ্লেষণ
      </p>

      {/* Engagement Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-1.5 text-violet-600 dark:text-violet-400" />
          <p className="text-2xl font-bold">{engagement.dau}</p>
          <p className="text-xs text-muted-foreground">DAU (আজ একটিভ)</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1.5 text-violet-600 dark:text-violet-400" />
          <p className="text-2xl font-bold">{engagement.wau}</p>
          <p className="text-xs text-muted-foreground">WAU (৭ দিনে)</p>
        </Card>
        <Card className="p-4 text-center">
          <Flame className="h-5 w-5 mx-auto mb-1.5 text-orange-600 dark:text-orange-400" />
          <p className="text-2xl font-bold">{engagement.mau}</p>
          <p className="text-xs text-muted-foreground">MAU (৩০ দিনে)</p>
        </Card>
        <Card className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-1.5 text-fuchsia-700 dark:text-fuchsia-300" />
          <p className="text-2xl font-bold">{engagement.totalUsers}</p>
          <p className="text-xs text-muted-foreground">মোট ইউজার</p>
        </Card>
      </div>

      {/* Activity Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Brain className="h-5 w-5 mx-auto mb-1.5 text-rose-600 dark:text-rose-400" />
          <p className="text-xl font-bold">{activityCounts.quizAttempts}</p>
          <p className="text-xs text-muted-foreground">MCQ কুইজ অ্যাটেম্পট</p>
        </Card>
        <Card className="p-4 text-center">
          <PenLine className="h-5 w-5 mx-auto mb-1.5 text-fuchsia-600 dark:text-fuchsia-400" />
          <p className="text-xl font-bold">{activityCounts.cqAttempts}</p>
          <p className="text-xs text-muted-foreground">CQ অ্যাটেম্পট</p>
        </Card>
        <Card className="p-4 text-center">
          <ClipboardCheck className="h-5 w-5 mx-auto mb-1.5 text-red-600 dark:text-red-400" />
          <p className="text-xl font-bold">{activityCounts.mockExamAttempts}</p>
          <p className="text-xs text-muted-foreground">Mock Exam সম্পন্ন</p>
        </Card>
        <Card className="p-4 text-center">
          <MessageSquare className="h-5 w-5 mx-auto mb-1.5 text-fuchsia-700 dark:text-fuchsia-300" />
          <p className="text-xl font-bold">{activityCounts.forumPosts}</p>
          <p className="text-xs text-muted-foreground">Forum পোস্ট</p>
        </Card>
      </div>

      {/* Signup trend */}
      <Card className="p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">গত ৭ দিনের নতুন রেজিস্ট্রেশন</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={signupTrend}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d: string) => d.slice(5)}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Subject popularity */}
      <Card className="p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">সাবজেক্ট-ভিত্তিক প্র্যাকটিস পপুলারিটি</h2>
        {subjectPopularity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            এখনো কোনো প্র্যাকটিস ডেটা নেই
          </p>
        ) : (
          <div className="space-y-2">
            {subjectPopularity.map((s) => (
              <div
                key={s.subjectId}
                className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
              >
                <span>{s.subjectName}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{s.attemptCount}টা অ্যাটেম্পট</span>
                  <span>গড় নির্ভুলতা {s.avgAccuracyPct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Most practiced topics */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold mb-4">সবচেয়ে বেশি প্র্যাকটিস হওয়া টপিক</h2>
        {mostPracticedTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            এখনো কোনো প্র্যাকটিস ডেটা নেই
          </p>
        ) : (
          <div className="space-y-2">
            {mostPracticedTopics.map((t, i) => (
              <div
                key={t.topicId}
                className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
              >
                <span>
                  {i + 1}. {t.topicName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t.answerCount}বার উত্তর দেওয়া হয়েছে
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
