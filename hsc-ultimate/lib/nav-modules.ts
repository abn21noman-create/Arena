// ===================================================================
// শেয়ার্ড Module/Navigation তালিকা — HSC Ultimate এর সুসংগঠিত Navigation
// -------------------------------------------------------------------
// ৪টি পরিচ্ছন্ন ও মিনিমালিস্ট ক্যাটাগরি:
// ১. প্রধান — ড্যাশবোর্ড, লার্নিং হাব, AI ডাউট সলভার, অ্যানালিটিক্স
// ২. অনুশীলন হাব — MCQ ও স্মার্ট প্র্যাকটিস, CQ সৃজনশীল, মডেল টেস্ট,
//    মিস্টেক ভল্ট, ফ্ল্যাশকার্ড, ফর্মুলা সার্চ
// ৩. অ্যারেনা ও কমিউনিটি — কুইজ ব্যাটল (১v১ ও মাল্টিপ্লেয়ার), লিডারবোর্ড,
//    কমিউনিটি ফোরাম, স্টাডি গ্রুপ
// ৪. ফোকাস ও প্ল্যানার — Strict Focus, স্টাডি প্ল্যানার ও রুটিন
// ===================================================================
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  BookOpen,
  BarChart3,
  CalendarClock,
  Brain,
  BookX,
  PenLine,
  ClipboardCheck,
  Layers,
  Trophy,
  Users,
  UsersRound,
  Gamepad2,
  Calculator,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

export interface NavModuleItem {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  // Tailwind gradient ক্লাস (from-x-500 to-y-500) — আইকন বক্সে ব্যবহৃত
  color: string;
  isNew?: boolean;
}

export interface NavModuleGroup {
  label: string;
  items: NavModuleItem[];
}

export const NAV_GROUPS: NavModuleGroup[] = [
  {
    label: "প্রধান মেনু",
    items: [
      {
        href: "/dashboard",
        title: "ড্যাশবোর্ড",
        desc: "দৈনিক প্রস্তুতি, রুটিন ও সার্বিক প্রগ্রেস",
        icon: LayoutDashboard,
        color: "from-blue-600 to-indigo-700",
      },
      {
        href: "/learn",
        title: "লার্নিং হাব",
        desc: "এনসিটিবি চ্যাপ্টার, নোটস ও মাইন্ড ম্যাপ",
        icon: BookOpen,
        color: "from-violet-600 to-violet-800",
      },
      {
        href: "/ai-tutor",
        title: "AI ডাউট সলভার",
        desc: "যেকোনো প্রশ্নের তাৎক্ষণিক সমাধান ও গাইড",
        icon: Sparkles,
        color: "from-fuchsia-600 to-pink-700",
      },
      {
        href: "/analytics",
        title: "পারফরম্যান্স অ্যানালিটিক্স",
        desc: "অ্যাকুরেসি, দুর্বল টপিক ও প্রেডিক্টেড GPA",
        icon: BarChart3,
        color: "from-cyan-600 to-blue-700",
      },
    ],
  },
  {
    label: "অনুশীলন হাব",
    items: [
      {
        href: "/practice",
        title: "MCQ অনুশীলন",
        desc: "চ্যাপ্টারভিত্তিক ও অ্যাডাপ্টিভ স্মার্ট প্র্যাকটিস",
        icon: Brain,
        color: "from-indigo-600 to-violet-700",
      },
      {
        href: "/cq-practice",
        title: "CQ সৃজনশীল অনুশীলন",
        desc: "সৃজনশীল প্রশ্ন লেখা ও AI ভিত্তিক মূল্যায়ন",
        icon: PenLine,
        color: "from-pink-600 to-rose-700",
      },
      {
        href: "/mock-exam",
        title: "পূর্ণ মডেল টেস্ট ও এডমিশন",
        desc: "বোর্ড ও ভার্সিটি ফরম্যাটে পূর্ণাঙ্গ মক টেস্ট",
        icon: ClipboardCheck,
        color: "from-emerald-600 to-teal-700",
      },
      {
        href: "/mistake-vault",
        title: "মিস্টেক ভল্ট",
        desc: "সব ভুল করা প্রশ্ন সহজে এক জায়গায় রিভিশন",
        icon: BookX,
        color: "from-amber-600 to-orange-700",
      },
      {
        href: "/flashcards",
        title: "স্মার্ট ফ্ল্যাশকার্ড",
        desc: "বৈজ্ঞানিক FSRS স্পেসড রিপিটেশন রিভিশন",
        icon: Layers,
        color: "from-violet-600 to-purple-700",
      },
      {
        href: "/formula-search",
        title: "ফর্মুলা সার্চ ইঞ্জিন",
        desc: "পদার্থ, রসায়ন ও গণিতের সব সমীকরণ",
        icon: Calculator,
        color: "from-cyan-600 to-teal-700",
      },
    ],
  },
  {
    label: "অ্যারেনা ও কমিউনিটি",
    items: [
      {
        href: "/quiz-battle",
        title: "কুইজ ব্যাটল অ্যারেনা",
        desc: "বন্ধুদের সাথে ১v১ ডুয়েল ও লাইভ কুইজ প্রতিযোগিতা",
        icon: Gamepad2,
        color: "from-violet-600 to-fuchsia-700",
      },
      {
        href: "/leaderboard",
        title: "লিডারবোর্ড ও লিগ",
        desc: "সাপ্তাহিক ডায়মন্ড ও গোল্ড লিগ রেস",
        icon: Trophy,
        color: "from-amber-500 to-yellow-600",
      },
      {
        href: "/forum",
        title: "কমিউনিটি ফোরাম",
        desc: "প্রশ্নোত্তর আলোচনা ও সেরা সমাধান",
        icon: Users,
        color: "from-indigo-600 to-blue-700",
      },
      {
        href: "/study-group",
        title: "স্টাডি গ্রুপ ও লাউঞ্জ",
        desc: "বন্ধুদের সাথে দল বেঁধে রিডিং রুম ও পমোদোরো",
        icon: UsersRound,
        color: "from-emerald-600 to-teal-700",
      },
    ],
  },
  {
    label: "ফোকাস ও সময় ব্যবস্থাপনা",
    items: [
      {
        href: "/focus",
        title: "Strict Focus",
        desc: "ডিজিটাল ডিস্ট্রাকশন রোধে ডিপ স্টাডি মোড",
        icon: ShieldCheck,
        color: "from-rose-600 to-pink-700",
        isNew: true,
      },
      {
        href: "/planner",
        title: "স্টাডি প্ল্যানার",
        desc: "ডেইলি টাস্ক, রুটিন ও পরীক্ষার কাউন্টডাউন",
        icon: CalendarClock,
        color: "from-teal-600 to-emerald-700",
      },
    ],
  },
];

// Bottom Nav Bar (মোবাইল) এর ৪টা প্রধান ট্যাবে ইতিমধ্যে থাকা রুট
const ALREADY_IN_BOTTOM_TABS = new Set(["/dashboard", "/learn", "/practice", "/quiz-battle"]);

// Bottom Nav "আরও" শীটের জন্য ফ্ল্যাট তালিকা
export function getMoreMenuModules(): NavModuleItem[] {
  return NAV_GROUPS.flatMap((g) => g.items).filter(
    (item) => !ALREADY_IN_BOTTOM_TABS.has(item.href)
  );
}

/** Grouped mobile menu data from the same source of truth as the sidebar. */
export function getMoreMenuGroups(): NavModuleGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !ALREADY_IN_BOTTOM_TABS.has(item.href)),
  })).filter((group) => group.items.length > 0);
}
