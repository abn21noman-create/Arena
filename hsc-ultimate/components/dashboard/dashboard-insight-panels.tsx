import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  BookX,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Layers,
  ListTodo,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export interface WeakTopicItem {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracyPct: number;
  totalAnswered: number;
}

export function PriorityInsightCard({ weakTopics }: { weakTopics: WeakTopicItem[] }) {
  const top = weakTopics[0];
  return (
    <GlassCard className="h-full overflow-hidden p-5" variant="gradient-border">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <p className="font-bold">Priority insight</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Weakness radar</p>
            </div>
          </div>
          {top && <Badge variant="outline">{top.accuracyPct}% accuracy</Badge>}
        </div>

        {!top ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="mt-2 text-sm font-bold">Weak topic শনাক্ত করার মতো data নেই</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">কয়েকটি MCQ practice করলে personalized insight দেখা যাবে।</p>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center gap-4">
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
                style={{ background: `conic-gradient(hsl(350 85% 58%) ${top.accuracyPct}%, hsl(230 18% 15%) 0)` }}
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-card text-lg font-black">{top.accuracyPct}%</div>
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-black">{top.topicName}</p>
                <p className="truncate text-xs text-muted-foreground">{top.subjectName}</p>
                <p className="mt-2 text-xs text-muted-foreground">{top.totalAnswered}টি answered question থেকে insight</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {weakTopics.slice(1, 3).map((topic) => (
                <div key={topic.topicId} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-3 py-2">
                  <span className="truncate text-xs">{topic.topicName}</span>
                  <span className="shrink-0 text-xs font-bold text-rose-500">{topic.accuracyPct}%</span>
                </div>
              ))}
            </div>
          </>
        )}
        <Button render={<Link href={top ? "/adaptive-practice" : "/practice"} />} size="sm" variant="outline" className="mt-4 w-full gap-1.5">
          {top ? "Targeted practice" : "Practice শুরু করুন"} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </GlassCard>
  );
}

interface RevisionPulseCardProps {
  dueCards: number;
  dueDecks: number;
  topDeck: { id: string; name: string; dueCount: number } | null;
  mistakeCount: number;
  bookmarkCount: number;
}

export function RevisionPulseCard(props: RevisionPulseCardProps) {
  const total = props.dueCards + props.mistakeCount;
  const primaryHref = props.topDeck ? `/flashcards/${props.topDeck.id}/review` : props.mistakeCount > 0 ? "/mistake-vault" : "/flashcards";
  return (
    <GlassCard className="h-full overflow-hidden p-5" variant="gradient-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <p className="font-bold">Revision pulse</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Memory maintenance</p>
          </div>
        </div>
        <span className="text-2xl font-black tabular-nums">{total}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Link href="/flashcards" className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 text-center hover:bg-white/[0.05]">
          <Layers className="mx-auto h-4 w-4 text-amber-500" />
          <p className="mt-2 text-lg font-black">{props.dueCards}</p>
          <p className="text-xs text-muted-foreground">Due cards</p>
        </Link>
        <Link href="/mistake-vault" className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 text-center hover:bg-white/[0.05]">
          <BookX className="mx-auto h-4 w-4 text-rose-500" />
          <p className="mt-2 text-lg font-black">{props.mistakeCount}</p>
          <p className="text-xs text-muted-foreground">Mistakes</p>
        </Link>
        <Link href="/saved" className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 text-center hover:bg-white/[0.05]">
          <BookOpen className="mx-auto h-4 w-4 text-cyan-500" />
          <p className="mt-2 text-lg font-black">{props.bookmarkCount}</p>
          <p className="text-xs text-muted-foreground">Saved</p>
        </Link>
      </div>
      <p className="mt-4 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {props.topDeck
          ? `“${props.topDeck.name}” ডেকে ${props.topDeck.dueCount}টি card এখন review করলে retention শক্ত থাকবে।`
          : props.mistakeCount > 0
            ? "Mistake Vault থেকে ভুলগুলো clear করলে weak-topic score দ্রুত improve করবে।"
            : "আজকের revision queue clear—নতুন deck বা saved topic review করতে পারেন।"}
      </p>
      <Button render={<Link href={primaryHref} />} size="sm" className="mt-4 w-full gap-1.5">
        Revision শুরু করুন <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </GlassCard>
  );
}

interface WeekMomentumCardProps {
  weeklyXp: number;
  studyMinutes: number;
  focusMinutes: number;
  quizCount: number;
  masteredCount: number;
  streak: number;
  archetype: { emoji: string; title: string } | null;
}

export function WeekMomentumCard(props: WeekMomentumCardProps) {
  const goalMinutes = 300;
  const effectiveMinutes = props.studyMinutes + props.focusMinutes;
  const pct = Math.min(100, Math.round((effectiveMinutes / goalMinutes) * 100));
  return (
    <GlassCard className="h-full overflow-hidden p-5" variant="gradient-border">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300">
              <Flame className="h-4 w-4" />
            </span>
            <div>
              <p className="font-bold">Week momentum</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Sunday → today</p>
            </div>
          </div>
          {props.archetype && <Badge variant="secondary">{props.archetype.emoji} {props.archetype.title}</Badge>}
        </div>
        <div className="mt-5 flex items-center gap-5">
          <div
            className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
            style={{ background: `conic-gradient(hsl(292 82% 58%) ${pct}%, hsl(230 18% 15%) 0)` }}
          >
            <div className="grid h-19 w-19 place-items-center rounded-full bg-card text-center">
              <div><p className="text-xl font-black">{pct}%</p><p className="text-xs text-muted-foreground">5h goal</p></div>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
            <div><p className="text-lg font-black">{effectiveMinutes}m</p><p className="text-xs text-muted-foreground">Study + focus</p></div>
            <div><p className="text-lg font-black">{props.weeklyXp}</p><p className="text-xs text-muted-foreground">Weekly XP</p></div>
            <div><p className="text-lg font-black">{props.quizCount}</p><p className="text-xs text-muted-foreground">Quiz attempts</p></div>
            <div><p className="text-lg font-black">{props.masteredCount}</p><p className="text-xs text-muted-foreground">Topics mastered</p></div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Flame className="h-3 w-3 text-orange-500" /> Current streak</span>
          <span className="font-bold">{props.streak} দিন</span>
        </div>
        <Link href="/analytics" className="-mx-1 mt-2 inline-flex min-h-8 items-center gap-1 rounded-md px-1 text-xs font-semibold text-primary hover:underline">
          Full analytics <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </GlassCard>
  );
}

export interface DashboardTaskItem {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  subjectCode: string | null;
}

export function UpcomingTasksCard({ tasks }: { tasks: DashboardTaskItem[] }) {
  return (
    <GlassCard className="h-full p-5 sm:p-6" variant="gradient-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
            <ListTodo className="h-4 w-4" />
          </span>
          <div><p className="font-bold">Upcoming tasks</p><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Next actions</p></div>
        </div>
        <Badge variant="outline">{tasks.length} pending</Badge>
      </div>
      {tasks.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed p-5 text-center">
          <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />
          <p className="mt-2 text-sm font-bold">Task inbox clear</p>
          <p className="mt-1 text-xs text-muted-foreground">Planner-এ পরবর্তী study action যোগ করুন।</p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {tasks.map((task) => (
            <Link key={task.id} href="/planner" className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5 hover:bg-white/[0.035]">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${task.priority === "HIGH" ? "bg-rose-500" : task.priority === "LOW" ? "bg-cyan-500" : "bg-amber-500"}`} />
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{task.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{task.subjectCode ?? "General"}</span></span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString("bn-BD", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" }) : "No date"}
              </span>
            </Link>
          ))}
        </div>
      )}
      <Button render={<Link href="/planner" />} variant="outline" size="sm" className="mt-4 w-full gap-1.5">
        Planner খুলুন <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </GlassCard>
  );
}

export interface DashboardActivityItem {
  id: string;
  type: "QUIZ" | "FOCUS" | "TASK" | "STUDY";
  title: string;
  detail: string;
  occurredAt: string;
  href: string;
}

const ACTIVITY_STYLE = {
  QUIZ: { icon: Brain, color: "text-violet-500", bg: "bg-violet-500/10" },
  FOCUS: { icon: Clock3, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  TASK: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  STUDY: { icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
};

export function RecentActivityCard({ activities }: { activities: DashboardActivityItem[] }) {
  return (
    <GlassCard className="h-full p-5 sm:p-6" variant="gradient-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><Activity className="h-4 w-4" /></span>
          <div><p className="font-bold">Recent activity</p><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Learning timeline</p></div>
        </div>
        <Link href="/analytics" className="-mx-1 inline-flex min-h-8 items-center rounded-md px-1 text-xs font-semibold text-primary hover:underline">View all</Link>
      </div>
      {activities.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed p-6 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-violet-500" />
          <p className="mt-2 text-sm font-bold">Activity timeline অপেক্ষা করছে</p>
          <p className="mt-1 text-xs text-muted-foreground">Practice, Focus অথবা task complete করলে এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <div className="relative mt-5 space-y-1 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-px before:bg-border">
          {activities.map((activity) => {
            const style = ACTIVITY_STYLE[activity.type];
            const Icon = style.icon;
            return (
              <Link key={`${activity.type}-${activity.id}`} href={activity.href} className="relative flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/[0.035]">
                <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.color}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{activity.title}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{activity.detail}</span></span>
                <span className="shrink-0 text-xs text-muted-foreground">{new Date(activity.occurredAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" })}</span>
              </Link>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

export interface SubjectMasteryItem {
  id: string;
  name: string;
  nameEn: string;
  colorHex: string;
  totalTopics: number;
  masteredTopics: number;
  progressPct: number;
}

export function SubjectMasteryGrid({ subjects }: { subjects: SubjectMasteryItem[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><p className="text-lg font-black sm:text-xl">Subject mastery</p><p className="mt-1 text-xs text-muted-foreground">Syllabus-এর কোথায় আছেন—real progress থেকে</p></div>
        <Link href="/learn" className="-mx-1 inline-flex min-h-8 items-center gap-1 rounded-md px-1 text-xs font-semibold text-primary hover:underline">সব subject <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/learn/${subject.id}`} className="group">
            <GlassCard interactive className="h-full p-4" variant="gradient-border">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl text-sm font-black text-white shadow-lg" style={{ backgroundColor: subject.colorHex }}>
                  {subject.nameEn.slice(0, 1)}
                </span>
                <span className="text-lg font-black tabular-nums">{subject.progressPct}%</span>
              </div>
              <p className="mt-4 truncate text-sm font-bold group-hover:text-primary">{subject.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subject.masteredTopics}/{subject.totalTopics} topics mastered</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, subject.progressPct)}%`, backgroundColor: subject.colorHex }} />
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
