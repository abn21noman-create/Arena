"use client";

// ===================================================================
// Analytics Dashboard — পারফরম্যান্স গ্রাফ, দুর্বলতা বিশ্লেষণ
// -------------------------------------------------------------------
// Recharts দিয়ে subject-wise bar chart, progress trend line chart,
// time distribution pie chart, এবং weak topics লিস্ট দেখানো হয়।
// ===================================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PredictedGpaCard } from "@/components/analytics/predicted-gpa-card";
import { RetentionForecastCard } from "@/components/analytics/retention-forecast-card";
import { ReportCardDownloadButton } from "@/components/analytics/report-card-download-button";
import { SubjectWeaknessRadar } from "@/components/analytics/subject-weakness-radar";
import { MistakeRecoveryPlan } from "@/components/analytics/mistake-recovery-plan";
import { PrintableReportCardDialog } from "@/components/analytics/printable-report-card";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import { CognitiveHeatmap } from "@/components/analytics/cognitive-heatmap";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/fade-in";
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  TrendingUp,
  Clock,
  AlertTriangle,
  Trophy,
  Target,
  Flame,
  BookOpen,
  Brain,
  Gauge,
} from "lucide-react";

interface AnalyticsData {
  subjectPerformance: {
    subjectId: string;
    subjectName: string;
    avgScorePct: number;
    attemptCount: number;
    colorHex: string;
  }[];
  progressOverTime: { date: string; avgScorePct: number; attemptCount: number }[];
  timeDistribution: { subjectCode: string; label: string; totalMinutes: number }[];
  weakTopics: {
    topicId: string;
    topicName: string;
    subjectName: string;
    accuracyPct: number;
    totalAnswered: number;
  }[];
  overallStats: {
    totalXp: number;
    level: number;
    levelProgressPct: number;
    masteredTopicsCount: number;
    totalTopicsCount: number;
    masteryPct: number;
    quizAccuracyPct: number;
    totalQuizAttempts: number;
    totalStudyHours: number;
    currentStreak: number;
    longestStreak: number;
  };
  activityHeatmap: { date: string; count: number }[];
  misconceptionPatterns: {
    tag: string;
    wrongCount: number;
    totalAttempted: number;
    wrongRatePct: number;
    mcqWrongCount: number;
    cqWeakCount: number;
  }[];
  confidenceStats: {
    totalAnswered: number;
    sureCount: number;
    sureCorrectCount: number;
    sureWrongCount: number;
    notSureCount: number;
    notSureCorrectCount: number;
    sureAccuracyPct: number;
    notSureAccuracyPct: number;
  };
}

// Violet Glass Theme — প্রথম স্লাইস (সবচেয়ে বড় অংশ) ব্র্যান্ড emerald
// দিয়ে অ্যাংকর করা, বাকিগুলো categorical (Pie chart এ প্রতিটা স্লাইস আলাদা
// চেনা যাওয়া দরকার, তাই ইচ্ছাকৃত hue বৈচিত্র্য — teal/cyan দিয়ে শুরু করে
// ধীরে ধীরে দূরের hue তে যায়, ব্র্যান্ড-সংলগ্ন থেকে distinguishable এ)
const PIE_COLORS = ["#8b5cf6", "#d946ef", "#06b6d4", "#f59e0b", "#ec4899", "#22c55e", "#3b82f6"];

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics");
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
        <p className="text-sm text-muted-foreground">অ্যানালাইসিস তৈরি হচ্ছে...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">ডেটা লোড করা যায়নি।</p>
      </div>
    );
  }

  const {
    subjectPerformance,
    progressOverTime,
    timeDistribution,
    weakTopics,
    overallStats,
    activityHeatmap,
    misconceptionPatterns,
    confidenceStats,
  } = data;
  const hasQuizData = subjectPerformance.length > 0;
  const hasTimeData = timeDistribution.length > 0;

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
      <FadeIn direction="down" duration={0.4}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="rounded-full p-2 hover:bg-muted transition-colors shrink-0" aria-label="পিছনে যাও">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                বিশ্লেষণ
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                তোমার পড়াশোনার পারফরম্যান্স ও দুর্বলতা বিশ্লেষণ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrintableReportCardDialog
              totalSolved={overallStats.totalQuizzesTaken * 15}
              overallAccuracy={overallStats.avgScorePct}
            />
            <ReportCardDownloadButton />
          </div>
        </div>
      </FadeIn>

      {/* glassmorphism hero banner — established প্যাটার্ন (nav-modules.ts এর
          Analytics আইটেম sky/blue থিম), সবচেয়ে গুরুত্বপূর্ণ সংখ্যা (মাস্টারি
          %) প্রমিনেন্টলি দেখানো — নিচের StatCard গ্রিড established
          নির্দেশিকা মেনে near-opaque রাখা হয়েছে (data-heavy অংশ) */}
      <div className="glass-hero glass-hero-card relative overflow-hidden rounded-2xl bg-linear-to-br from-fuchsia-800 to-violet-900 p-5 mb-6 text-white">
        <div
          aria-hidden
          className="glass-hero-orb h-40 w-40 bg-white/20"
          style={{ top: "-2.5rem", right: "-2rem" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <span className="glass-chip flex h-12 w-12 items-center justify-center rounded-full">
            <Gauge className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold">{overallStats.masteryPct}% মাস্টারি অর্জিত</p>
            <p className="text-sm opacity-90">
              {overallStats.masteredTopicsCount}/{overallStats.totalTopicsCount} টপিক আয়ত্ত হয়েছে • লেভেল {overallStats.level}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <StaggerGroup className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" staggerDelay={0.07}>
        <StaggerItem>
          <StatCard
            icon={Trophy}
            color="text-violet-600 dark:text-violet-400"
            value={`${overallStats.masteryPct}%`}
            label="মাস্টারি"
            sub={`${overallStats.masteredTopicsCount}/${overallStats.totalTopicsCount} টপিক`}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Target}
            color="text-violet-600 dark:text-violet-400"
            value={`${overallStats.quizAccuracyPct}%`}
            label="কুইজ নির্ভুলতা"
            sub={`${overallStats.totalQuizAttempts} বার অ্যাটেম্পট`}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Clock}
            color="text-fuchsia-600 dark:text-fuchsia-400"
            value={`${overallStats.totalStudyHours}`}
            label="ঘন্টা পড়াশোনা"
            sub="মোট রেকর্ড করা সময়"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Flame}
            color="text-orange-600 dark:text-orange-400"
            value={overallStats.currentStreak}
            label="বর্তমান স্ট্রিক"
            sub={`সর্বোচ্চ: ${overallStats.longestStreak} দিন`}
          />
        </StaggerItem>
      </StaggerGroup>

      {/* Activity Heatmap */}
      <Card className="p-5 mb-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          পড়াশোনার Activity (গত ৬ মাস)
        </h2>
        {activityHeatmap.some((d) => d.count > 0) ? (
          <ActivityHeatmap data={activityHeatmap} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            এখনো কোনো activity রেকর্ড হয়নি। Practice/CQ/Pomodoro করলে এখানে দেখা যাবে।
          </p>
        )}
      </Card>

      {/* Predicted GPA */}
      <PredictedGpaCard />

      {/* রিয়েল-টাইম কগনিটিভ হিটম্যাপ — Singularity Edition */}
      <div className="mb-6">
        <CognitiveHeatmap />
      </div>

      {/* Exam-Day Retention Forecast (FSRS-ভিত্তিক, নতুন) */}
      <RetentionForecastCard />

      {/* Progress over time */}
      <Card className="p-5 mb-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          গত ১৪ দিনের কুইজ স্কোর ট্রেন্ড
        </h2>
        {progressOverTime.some((p) => p.attemptCount > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${value}%`, "গড় স্কোর"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="avgScorePct"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="এখনো কোনো প্র্যাকটিস কুইজ দাওনি। কুইজ দিলে এখানে তোমার অগ্রগতি দেখা যাবে।" />
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Subject-wise performance */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            সাবজেক্ট অনুযায়ী পারফরম্যান্স
          </h2>
          {hasQuizData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectPerformance} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="subjectName"
                  type="category"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "গড় স্কোর"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="avgScorePct" radius={[0, 6, 6, 0]}>
                  {subjectPerformance.map((entry, index) => (
                    <Cell key={index} fill={entry.colorHex} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="প্র্যাকটিস কুইজ দাও, তাহলে সাবজেক্ট-ভিত্তিক পারফরম্যান্স দেখতে পারবে।" />
          )}
        </Card>

        {/* Time distribution */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            সময় বন্টন (মিনিট)
          </h2>
          {hasTimeData ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={timeDistribution}
                  dataKey="totalMinutes"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}`}
                  labelLine={false}
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} মিনিট`, "সময়"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Pomodoro Timer ব্যবহার করে পড়াশোনা করলে এখানে সময় বন্টন দেখা যাবে।" />
          )}
        </Card>
      </div>

      {/* Weak topics */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          দুর্বল টপিকসমূহ (ফোকাস করা দরকার)
        </h2>
        {weakTopics.length > 0 ? (
          <div className="space-y-3">
            {weakTopics.map((topic) => (
              <div key={topic.topicId}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium">{topic.topicName}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      ({topic.subjectName})
                    </span>
                  </div>
                  <span
                    className={
                      topic.accuracyPct < 50
                        ? "text-red-600 dark:text-red-400 font-semibold text-xs"
                        : "text-amber-700 dark:text-amber-400 font-semibold text-xs"
                    }
                  >
                    {topic.accuracyPct}%
                  </span>
                </div>
                <Progress value={topic.accuracyPct} className="h-1.5" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="কমপক্ষে ২টা প্রশ্নের উত্তর দেওয়া টপিক থাকলে এখানে দুর্বলতা দেখানো হবে। আরও প্র্যাকটিস করো!" />
        )}
      </Card>

      {/* Misconception Patterns — বারবার হওয়া একই ধরনের ভুল */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-1">
          <Brain className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          বারবার হওয়া ভুলের প্যাটার্ন
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          একই ধরনের ভুল ধারণার (misconception) কারণে বারবার ভুল হচ্ছে কিনা তা
          এখানে দেখা যায় — MCQ এর ভুল উত্তর ও CQ এর দুর্বল স্কোর (১০ এর
          মধ্যে ৪ এর কম/সমান) দুটোই একসাথে বিবেচনা করা হয়, কিছু প্রশ্নে
          admin এই ধরনের ট্যাগ দিয়ে রেখেছেন
        </p>
        {misconceptionPatterns.length > 0 ? (
          <div className="space-y-3">
            {misconceptionPatterns.map((pattern) => (
              <div key={pattern.tag}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="font-medium">{pattern.tag}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold text-xs">
                    {pattern.wrongCount}/{pattern.totalAttempted} বার ভুল ({pattern.wrongRatePct}%)
                  </span>
                </div>
                <Progress value={pattern.wrongRatePct} className="h-1.5" />
                {pattern.mcqWrongCount > 0 && pattern.cqWeakCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    MCQ: {pattern.mcqWrongCount}বার ভুল • CQ: {pattern.cqWeakCount}বার দুর্বল স্কোর
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="এখনো কোনো recurring misconception পাওয়া যায়নি। একই ট্যাগযুক্ত প্রশ্নে অন্তত ২ বার ভুল করলে এখানে দেখা যাবে।" />
        )}
      </Card>

      {/* Confidence-Based Answering — "নিশ্চিত" বলেও ভুল হওয়া উত্তর সবচেয়ে গুরুত্বপূর্ণ সিগন্যাল */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-1">
          <Gauge className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
          আত্মবিশ্বাসের নির্ভুলতা (Confidence Accuracy)
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          MCQ উত্তর দেওয়ার সময় &quot;কতটা নিশ্চিত?&quot; বেছে নিলে এখানে দেখা যাবে —
          &quot;নিশ্চিত&quot; বলেও ভুল হওয়া উত্তরগুলো সত্যিকারের misconception নির্দেশ করে
        </p>
        {confidenceStats.totalAnswered > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">নিশ্চিত ছিলে</p>
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                  {confidenceStats.sureAccuracyPct}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {confidenceStats.sureCorrectCount}/{confidenceStats.sureCount} সঠিক
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">অনুমান করেছিলে</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {confidenceStats.notSureAccuracyPct}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {confidenceStats.notSureCorrectCount}/{confidenceStats.notSureCount} সঠিক
                </p>
              </div>
            </div>
            {confidenceStats.sureWrongCount > 0 && (
              <Alert variant="destructive" className="text-xs">
                <Brain className="h-3.5 w-3.5" />
                <AlertDescription>
                  তুমি <strong>{confidenceStats.sureWrongCount}টা</strong> প্রশ্নে &quot;নিশ্চিত&quot; ছিলে
                  কিন্তু ভুল করেছো — এগুলো সত্যিকারের misconception, ভালো করে রিভিশন দাও।
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <EmptyState text='MCQ উত্তর দেওয়ার সময় "কতটা নিশ্চিত?" বেছে নিলে এখানে বিশ্লেষণ দেখা যাবে (সম্পূর্ণ ঐচ্ছিক)।' />
        )}
      </Card>

      {/* Subject Weakness Radar & Spider Chart Diagnostic */}
      <SubjectWeaknessRadar />

      {/* AI 7-Day Mistake Recovery Roadmap */}
      <MistakeRecoveryPlan />
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  value,
  label,
  sub,
}: {
  icon: typeof Trophy;
  color: string;
  value: string | number;
  label: string;
  sub: string;
}) {
  return (
    <Card className="p-4 text-center hover-lift h-full">
      <Icon className={`h-5 w-5 mx-auto mb-1.5 ${color}`} />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <BookOpen className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground max-w-xs">{text}</p>
    </div>
  );
}
