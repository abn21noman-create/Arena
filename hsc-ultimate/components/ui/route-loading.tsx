import {
  BookOpen,
  Bookmark,
  Brain,
  Calculator,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  Layers,
  LockKeyhole,
  PenLine,
  Settings2,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { PremiumLoading } from "@/components/ui/premium-loading";

type Accent = "violet" | "cyan" | "emerald" | "amber" | "rose";

export type LoadingProfile =
  | "dashboard"
  | "learning"
  | "practice"
  | "planner"
  | "focus"
  | "flashcards"
  | "exam"
  | "cq"
  | "leaderboard"
  | "duel"
  | "formula"
  | "saved"
  | "settings"
  | "result"
  | "admin";

interface Profile {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: Accent;
  tip: string;
  steps: { label: string; detail: string }[];
}

const PROFILES: Record<LoadingProfile, Profile> = {
  dashboard: {
    eyebrow: "COMMAND CENTER · LIVE SYNC",
    title: "আপনার dashboard সাজানো হচ্ছে",
    subtitle: "আজকের focus, streak, XP, weak topics এবং smart recommendations একসাথে প্রস্তুত হচ্ছে।",
    icon: Brain,
    accent: "violet",
    tip: "Dashboard-এর প্রথম recommendation-টি আপনার সাম্প্রতিক learning pattern থেকে আসে।",
    steps: [
      { label: "Profile", detail: "Goal ও preference sync" },
      { label: "Momentum", detail: "XP, streak ও league হিসাব" },
      { label: "Today", detail: "Priority action সাজানো" },
    ],
  },
  learning: {
    eyebrow: "LEARNING HUB · KNOWLEDGE MAP",
    title: "পাঠ্যজগৎ খুলে দেওয়া হচ্ছে",
    subtitle: "Subject, chapter, notes, formula এবং mastery progress সুন্দরভাবে সাজানো হচ্ছে।",
    icon: BookOpen,
    accent: "cyan",
    tip: "নতুন topic শুরু করার আগে chapter overview দেখলে recall ও connection দুটোই শক্ত হয়।",
    steps: [
      { label: "Syllabus", detail: "Subject ও chapter mapping" },
      { label: "Notes", detail: "Formula ও key concept প্রস্তুত" },
      { label: "Progress", detail: "Mastery অবস্থান sync" },
    ],
  },
  practice: {
    eyebrow: "PRACTICE ENGINE · ADAPTIVE MODE",
    title: "আপনার practice set প্রস্তুত হচ্ছে",
    subtitle: "Difficulty, question coverage এবং সাম্প্রতিক ভুলের pattern মিলিয়ে প্রশ্ন সাজানো হচ্ছে।",
    icon: Target,
    accent: "emerald",
    tip: "ভুল প্রশ্ন পুনরায় সমাধান করা নতুন প্রশ্নের চেয়ে দ্রুত score improve করে।",
    steps: [
      { label: "Question bank", detail: "Available MCQ যাচাই" },
      { label: "Difficulty", detail: "সঠিক challenge level নির্বাচন" },
      { label: "Review", detail: "Mistake pattern প্রস্তুত" },
    ],
  },
  planner: {
    eyebrow: "STUDY PLANNER · DAILY FLOW",
    title: "আজকের study rhythm তৈরি হচ্ছে",
    subtitle: "Exam countdown, tasks, Pomodoro, habits এবং Strict Focus এক timeline-এ আনা হচ্ছে।",
    icon: CalendarClock,
    accent: "emerald",
    tip: "দিনের সবচেয়ে কঠিন task-টি energy বেশি থাকা সময়ে রাখুন।",
    steps: [
      { label: "Schedule", detail: "Routine ও deadline sync" },
      { label: "Focus", detail: "Timer ও contract status" },
      { label: "Habits", detail: "Daily consistency প্রস্তুত" },
    ],
  },
  focus: {
    eyebrow: "STRICT FOCUS · DEEP STUDY",
    title: "Distraction-free zone প্রস্তুত হচ্ছে",
    subtitle: "Focus Contract, active timer, Android enforcement এবং emergency controls যাচাই হচ্ছে।",
    icon: LockKeyhole,
    accent: "violet",
    tip: "২০–৩০ মিনিটের কঠোর focus দিয়ে শুরু করুন; consistency duration-এর চেয়ে গুরুত্বপূর্ণ।",
    steps: [
      { label: "Consent", detail: "Focus Contract যাচাই" },
      { label: "Device", detail: "Android capability sync" },
      { label: "Safety", detail: "Emergency controls প্রস্তুত" },
    ],
  },
  flashcards: {
    eyebrow: "MEMORY LAB · FSRS",
    title: "আপনার memory queue তৈরি হচ্ছে",
    subtitle: "Due cards, retention strength এবং spaced-repetition schedule হিসাব হচ্ছে।",
    icon: Layers,
    accent: "violet",
    tip: "Due card আজ review করলে ভবিষ্যতের revision load কমে যায়।",
    steps: [
      { label: "Decks", detail: "Card library sync" },
      { label: "FSRS", detail: "Memory stability হিসাব" },
      { label: "Queue", detail: "Due order প্রস্তুত" },
    ],
  },
  exam: {
    eyebrow: "EXAM SIMULATOR · SECURE MODE",
    title: "Exam environment প্রস্তুত হচ্ছে",
    subtitle: "Question set, timer, marking rules এবং attempt integrity যাচাই হচ্ছে।",
    icon: ClipboardCheck,
    accent: "rose",
    tip: "Exam শুরু হলে প্রথমে নিশ্চিত প্রশ্নগুলো সমাধান করে confidence তৈরি করুন।",
    steps: [
      { label: "Paper", detail: "Question availability যাচাই" },
      { label: "Rules", detail: "Timer ও marking setup" },
      { label: "Attempt", detail: "Secure session তৈরি" },
    ],
  },
  cq: {
    eyebrow: "CREATIVE QUESTION · WRITING LAB",
    title: "CQ workspace প্রস্তুত হচ্ছে",
    subtitle: "উদ্দীপক, ক–ঘ প্রশ্ন, model structure এবং evaluation context আনা হচ্ছে।",
    icon: PenLine,
    accent: "amber",
    tip: "CQ উত্তরে knowledge-এর সঙ্গে application ও reasoning আলাদা paragraph-এ দেখান।",
    steps: [
      { label: "Stimulus", detail: "উদ্দীপক প্রস্তুত" },
      { label: "Structure", detail: "ক–ঘ answer space" },
      { label: "Evaluation", detail: "Rubric context sync" },
    ],
  },
  leaderboard: {
    eyebrow: "LEAGUE · WEEKLY MOMENTUM",
    title: "Leaderboard refresh হচ্ছে",
    subtitle: "Weekly XP, league tier, rank এবং active learners-এর অবস্থান হিসাব হচ্ছে।",
    icon: Trophy,
    accent: "amber",
    tip: "Rank-এর চেয়ে নিজের গত সপ্তাহের XP beat করাই সবচেয়ে কার্যকর লক্ষ্য।",
    steps: [
      { label: "Weekly XP", detail: "Current week normalize" },
      { label: "League", detail: "Tier members সাজানো" },
      { label: "Rank", detail: "আপনার অবস্থান হিসাব" },
    ],
  },
  duel: {
    eyebrow: "BATTLE ARENA · LIVE MATCH",
    title: "Challenge arena প্রস্তুত হচ্ছে",
    subtitle: "Room state, opponent, question order এবং score channel sync হচ্ছে।",
    icon: Swords,
    accent: "rose",
    tip: "দ্রুত উত্তর নয়—সঠিক উত্তর এবং steady pace battle জেতায়।",
    steps: [
      { label: "Room", detail: "Battle status sync" },
      { label: "Players", detail: "Participant যাচাই" },
      { label: "Questions", detail: "Fair order প্রস্তুত" },
    ],
  },
  formula: {
    eyebrow: "FORMULA VAULT · QUICK SEARCH",
    title: "Formula index প্রস্তুত হচ্ছে",
    subtitle: "Subject, chapter এবং keyword অনুযায়ী searchable formula collection তৈরি হচ্ছে।",
    icon: Calculator,
    accent: "cyan",
    tip: "সূত্রের সঙ্গে unit ও condition মনে রাখলে application error অনেক কমে।",
    steps: [
      { label: "Index", detail: "Formula sheet scan" },
      { label: "Subjects", detail: "Filter প্রস্তুত" },
      { label: "Search", detail: "Keyword map তৈরি" },
    ],
  },
  saved: {
    eyebrow: "PERSONAL LIBRARY · SAVED",
    title: "আপনার saved library আনা হচ্ছে",
    subtitle: "Bookmarks, folders এবং personal notes নিরাপদভাবে sync হচ্ছে।",
    icon: Bookmark,
    accent: "violet",
    tip: "Saved topic-গুলো exam-এর আগে ছোট revision collection হিসেবে ব্যবহার করুন।",
    steps: [
      { label: "Bookmarks", detail: "Saved topics sync" },
      { label: "Folders", detail: "Collection সাজানো" },
      { label: "Notes", detail: "Personal context প্রস্তুত" },
    ],
  },
  settings: {
    eyebrow: "CONTROL CENTER · PREFERENCES",
    title: "আপনার preferences আনা হচ্ছে",
    subtitle: "Profile, privacy, language, accessibility এবং notification settings sync হচ্ছে।",
    icon: Settings2,
    accent: "cyan",
    tip: "Accessibility ও language preference সব device-এ consistent রাখা যায়।",
    steps: [
      { label: "Profile", detail: "Account data যাচাই" },
      { label: "Privacy", detail: "Consent state sync" },
      { label: "Experience", detail: "Theme ও language প্রস্তুত" },
    ],
  },
  result: {
    eyebrow: "RESULT INTELLIGENCE · ANALYSIS",
    title: "আপনার result বিশ্লেষণ হচ্ছে",
    subtitle: "Score, accuracy, time, mistakes এবং next-step recommendation তৈরি হচ্ছে।",
    icon: FileCheck2,
    accent: "emerald",
    tip: "Result দেখার পর অন্তত একটি ভুল প্রশ্ন সঙ্গে সঙ্গে আবার সমাধান করুন।",
    steps: [
      { label: "Score", detail: "Marks যাচাই" },
      { label: "Mistakes", detail: "Wrong pattern বিশ্লেষণ" },
      { label: "Next step", detail: "Recommendation প্রস্তুত" },
    ],
  },
  admin: {
    eyebrow: "ADMIN CONSOLE · SECURE OPERATIONS",
    title: "Admin workspace প্রস্তুত হচ্ছে",
    subtitle: "Authorization, platform data, moderation queue এবং control surfaces sync হচ্ছে।",
    icon: ShieldCheck,
    accent: "violet",
    tip: "Sensitive action-এর আগে target ও audit context দুবার যাচাই করুন।",
    steps: [
      { label: "Authorization", detail: "Admin role যাচাই" },
      { label: "Platform", detail: "Live data sync" },
      { label: "Controls", detail: "Management tools প্রস্তুত" },
    ],
  },
};

export function RouteLoading({ profile }: { profile: LoadingProfile }) {
  const config = PROFILES[profile];
  return <PremiumLoading {...config} compact />;
}
