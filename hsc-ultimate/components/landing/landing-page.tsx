"use client";

// ===================================================================
// HSC ULTIMATE — 2026 Ultra-Modern Minimalist & Eye-Catching Landing
// -------------------------------------------------------------------
// Design Philosophy:
//   - Minimalist Apple/Linear precision with high-contrast typography
//   - Ambient Aurora Glow & micro-gradients (Zero-lag GPU profile)
//   - Interactive Feature Showcase & Interactive Subject Pillars
//   - Bento Grid architecture with fluid hover micro-interactions
//   - Live-data transparency & WCAG AAA Dark/Light contrast
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import {
  Brain,
  BookOpen,
  Trophy,
  CalendarClock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Target,
  MessageCircle,
  Zap,
  Check,
  Sparkle,
  Sparkles,
  Users,
  Flame,
  Crown,
  BookMarked,
  BrainCircuit,
  LineChart,
  Database,
  Atom,
  FlaskConical,
  Binary,
  Compass,
  Cpu,
  ChevronRight,
  Play,
  Lightbulb,
} from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export interface LandingStats {
  subjects: number | null;
  chapters: number | null;
  coreMcq: number | null;
  admissionMcq: number | null;
  cq: number | null;
  badges: number | null;
}

const subjectsList = [
  { name: "পদার্থবিজ্ঞান", en: "Physics", icon: Atom, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-500 dark:text-blue-400" },
  { name: "রসায়ন", en: "Chemistry", icon: FlaskConical, color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", text: "text-emerald-500 dark:text-emerald-400" },
  { name: "উচ্চতর গণিত", en: "Higher Math", icon: Binary, color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30", text: "text-violet-500 dark:text-violet-400" },
  { name: "জীববিজ্ঞান", en: "Biology", icon: Brain, color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", text: "text-pink-500 dark:text-pink-400" },
  { name: "আইসিটি", en: "ICT", icon: Cpu, color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", text: "text-amber-500 dark:text-amber-400" },
  { name: "বাংলা ও ইংরেজি", en: "Bangla & English", icon: BookMarked, color: "from-indigo-500/20 to-blue-500/20", border: "border-indigo-500/30", text: "text-indigo-500 dark:text-indigo-400" },
] as const;

const bentoFeatures = [
  {
    href: "/ai-tutor",
    icon: BrainCircuit,
    tag: "Multi-AI 2026",
    title: "AI Doubt Solver & Socratic Tutor",
    desc: "যেকোনো কঠিন সূত্র বা প্রশ্নের সমাধান ধাপে ধাপে বুঝে নাও সোক্রাটিক ও ডিরেক্ট মেথডে।",
    badge: "Instant Step-by-Step",
    gradient: "from-blue-500 via-indigo-500 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.15)",
    span: "lg:col-span-2 lg:row-span-2",
    highlight: true,
  },
  {
    href: "/adaptive-practice",
    icon: Target,
    tag: "Smart Engine",
    title: "Adaptive Practice",
    desc: "দুর্বল টপিক চিহ্নিত করে স্বয়ংক্রিয়ভাবে পারসোনালাইজড প্রশ্ন সাজায়।",
    badge: "Personalized",
    gradient: "from-pink-500 to-rose-500",
    glowColor: "rgba(244, 63, 94, 0.15)",
    span: "lg:col-span-1",
    highlight: false,
  },
  {
    href: "/flashcards",
    icon: Layers,
    tag: "FSRS Spaced Repetition",
    title: "Smart Flashcards",
    desc: "স্মৃতিতে দীর্ঘস্থায়ী রাখতে বৈজ্ঞানিক FSRS অ্যালগরিদমে রিভিশন।",
    badge: "High Retention",
    gradient: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.15)",
    span: "lg:col-span-1",
    highlight: false,
  },
  {
    href: "/learn",
    icon: BookOpen,
    tag: "Curriculum Hub",
    title: "Learning Library & Mind Maps",
    desc: "বোর্ড ও চ্যাপ্টারভিত্তিক সাজানো নোটস, ফর্মুলা শীট ও কনসেপ্ট ম্যাপ।",
    badge: "Complete Notes",
    gradient: "from-violet-500 to-purple-500",
    glowColor: "rgba(139, 92, 246, 0.15)",
    span: "lg:col-span-1",
    highlight: false,
  },
  {
    href: "/planner",
    icon: CalendarClock,
    tag: "Focus & Routine",
    title: "Study Planner & Strict Focus",
    desc: "পরীক্ষার কাউন্টডাউন, পোমোডোরো টাইমার ও কনসেন্ট-বেজড ফোকাস মোড।",
    badge: "Productivity",
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.15)",
    span: "lg:col-span-1",
    highlight: false,
  },
  {
    href: "/quiz-battle",
    icon: Trophy,
    tag: "Gamified Battle",
    title: "1v1 Quiz Battle & Arena",
    desc: "বন্ধুদের সাথে রিয়েল-টাইম লাইভ কুইজ ও সাপ্তাহিক লিডারবোর্ড লীগ।",
    badge: "Multiplayer",
    gradient: "from-yellow-500 to-amber-500",
    glowColor: "rgba(234, 179, 8, 0.15)",
    span: "lg:col-span-2",
    highlight: false,
  },
  {
    href: "/analytics",
    icon: LineChart,
    tag: "Deep Insights",
    title: "Predicted GPA & Analytics",
    desc: "প্রতিদিনের প্র্যাকটিস থেকে রিয়েল-টাইম অ্যাকুরেসি ও বোর্ড প্রেডিকশন।",
    badge: "AI Metrics",
    gradient: "from-cyan-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.15)",
    span: "lg:col-span-2",
    highlight: false,
  },
] as const;

const trustPoints = [
  { icon: Database, title: "রিয়েল ডাটাবেজ", desc: "কোনো ডামি সংখ্যা নেই, সব সরাসরি লাইভ সিলেবাস থেকে গণনা করা" },
  { icon: ShieldCheck, title: "সম্পূর্ণ ইউজার কন্ট্রোল", desc: "এক ক্লিকে JSON এক্সপোর্ট ও যেকোনো সময় অ্যাকাউন্ট ডিলিট সুবিধা" },
  { icon: Zap, title: "সার্ভার-সাইড নির্ভুলতা", desc: "সব রেজাল্ট ও অ্যালগরিদম সুরক্ষিত সার্ভারে ভ্যালিডেট হয়" },
  { icon: Users, title: "গোপনীয়তা প্রথম", desc: "পাবলিক প্রোফাইল ও ফোকাস ডেটা ডিফল্টভাবে সম্পূর্ণ প্রাইভেট" },
] as const;

function displayCount(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("bn-BD").format(value);
}

export function LandingPage({ stats }: { stats: LandingStats }) {
  const statCards = [
    { value: displayCount(stats.subjects), label: "বিষয়", icon: BookMarked },
    { value: displayCount(stats.chapters), label: "অধ্যায়", icon: BookOpen },
    { value: displayCount(stats.coreMcq), label: "Core MCQ", icon: Target },
    { value: displayCount(stats.admissionMcq), label: "Admission MCQ", icon: Brain },
    { value: displayCount(stats.cq), label: "CQ প্রশ্ন", icon: MessageCircle },
    { value: displayCount(stats.badges), label: "ব্যাজ", icon: Trophy },
  ];

  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.1]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const interactiveDemos = [
    {
      title: "AI Doubt Solver",
      subtitle: "তাত্ক্ষণিক সোক্রাটিক গাইডেন্স",
      prompt: "আদর্শ গ্যাসের গতিতত্ত্বের সমীকরণটি প্রতিপাদন করতে পারছি না...",
      reply: "চলো ধাপে ধাপে দেখি! প্রথমে একটি পাত্রে $N$ সংখ্যক কণার প্রতিটির ভর $m$ ধরি। দেয়ালের সাথে স্থিতিস্থাপক সংঘর্ষে ভরবেগের পরিবর্তন কত হবে বল তো?",
      action: "AI Tutor ওপেন করো",
      href: "/ai-tutor",
    },
    {
      title: "Adaptive Practice",
      subtitle: "দুর্বলতা কাটানোর স্মার্ট পথ",
      prompt: "পদার্থবিজ্ঞান ১ম পত্র · তরঙ্গ ও শব্দ (অধ্যায় ৯)",
      reply: "তোমার বিগত ৩টি পরীক্ষায় ডপলার ক্রিয়ার প্রশ্নে accuracy ৬০%। আজকের সেটে ডপলার ক্রিয়া ও স্থির তরঙ্গের ওপর ৫টি বাছাইকৃত প্রশ্ন প্রস্তুত।",
      action: "স্মার্ট প্র্যাকটিস শুরু করো",
      href: "/adaptive-practice",
    },
    {
      title: "FSRS Flashcard",
      subtitle: "স্মৃতিশক্তি ধরে রাখার বৈজ্ঞানিক পদ্ধতি",
      prompt: "Question: লেনজের সূত্র কোন শক্তির সংরক্ষণশীলতা নীতি মেনে চলে?",
      reply: "Answer: শক্তির নিত্যতা সূত্র (Law of Conservation of Energy)। পরবর্তী রিভিশন: ৩ দিন পর।",
      action: "ফ্ল্যাশকার্ডে রিভিশন দাও",
      href: "/flashcards",
    },
  ];

  return (
    <AuroraBackground variant="vibrant" className="min-h-screen">
      {/* ===================== TOP NAVIGATION ===================== */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-background/80 border-b border-border/80 shadow-xs"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none">
                HSC <span className="text-gradient">Ultimate</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                Academic AI Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              render={<Link href="/login" className="hidden sm:inline-flex" />}
              variant="ghost"
              size="sm"
              className="font-medium hover:bg-muted"
            >
              লগইন
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                render={<Link href="/register" />}
                size="sm"
                className="font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20"
              >
                <span className="hidden sm:inline">অ্যাকাউন্ট তৈরি</span>
                <span className="sm:hidden">শুরু</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* ===================== HERO SECTION ===================== */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 sm:pt-16 md:pt-24 pb-16 sm:pb-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Live Beacon Badge */}
            <motion.div variants={fadeInUp} className="inline-block">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 backdrop-blur-md mb-6 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-wide">
                  HSC 2026 & 2027 ব্যাচের স্মার্ট একাডেমি
                </span>
              </div>
            </motion.div>

            {/* Display Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-display mb-6 tracking-tight font-black"
            >
              কঠোর পরিশ্রম নয়, এবার হবে{" "}
              <span className="text-gradient">স্মার্ট প্রস্তুতি।</span>
            </motion.h1>

            {/* Lead Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-lead mb-8 sm:mb-10 max-w-2xl mx-auto text-muted-foreground font-normal"
            >
              বাংলাদেশের HSC শিক্ষার্থীদের জন্য ডেডিকেটেড লার্নিং ইকোসিস্টেম। 
              সোক্রাটিক AI টিউটর, অ্যাডাপ্টিভ প্র্যাকটিস, স্মার্ট ফ্ল্যাশকার্ড ও স্টাডি প্ল্যানার—সব এক জায়গায়।
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  render={<Link href="/register" />}
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white shadow-xl shadow-violet-500/25 group"
                >
                  বিনামূল্যে শুরু করো
                  <ArrowRight className="h-4.5 w-4.5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  render={<Link href="/learn" />}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-card/60 hover:bg-muted border border-border"
                >
                  <Compass className="h-4 w-4 mr-2 text-primary" /> সিলেবাস এক্সপ্লোর করো
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Assurance */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> সম্পূর্ণ উন্মুক্ত ও ফ্রি
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> এনসিটিবি পূর্ণ সিলেবাস
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> নো-স্প্যাম গ্যারান্টি
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===================== INTERACTIVE LIVE DEMO PREVIEW ===================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mb-16 sm:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="p-1 sm:p-2 overflow-hidden border border-border shadow-2xl bg-card/70" variant="gradient-border">
            {/* Tab controls */}
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5 bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-muted-foreground hidden sm:inline">hsc-ultimate.live/preview</span>
              </div>
              <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border">
                {interactiveDemos.map((demo, idx) => (
                  <button
                    key={demo.title}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === idx
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {demo.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Mockup */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" /> {interactiveDemos[activeTab].subtitle}
                </Badge>
              </div>

              {/* User Prompt Box */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-sm font-medium">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">ইনপুট / প্রশ্ন</p>
                <p className="text-foreground">{interactiveDemos[activeTab].prompt}</p>
              </div>

              {/* AI / System Response Box */}
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5 text-sm space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <BrainCircuit className="h-4 w-4" /> ইন্টেলিজেন্ট ফিডব্যাক
                </div>
                <p className="text-foreground/90 leading-relaxed">{interactiveDemos[activeTab].reply}</p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  render={<Link href={interactiveDemos[activeTab].href} />}
                  size="sm"
                  className="gap-1.5"
                >
                  {interactiveDemos[activeTab].action}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* ===================== SUBJECT PILLARS ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-16 sm:mb-24">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 border-border bg-muted/70 text-foreground">
            <BookOpen className="h-3 w-3 mr-1.5 text-primary" /> পূর্ণাঙ্গ সিলেবাস
          </Badge>
          <h2 className="text-h2 font-bold tracking-tight">এইচএসসি বিজ্ঞান ও আবশ্যিক বিষয়সমূহ</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {subjectsList.map((subj, idx) => (
            <motion.div
              key={subj.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link href="/learn" className="block h-full">
                <GlassCard
                  interactive
                  className="p-4 h-full flex flex-col items-center text-center justify-center border border-border/70 hover:border-primary/50 transition-colors"
                >
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${subj.color} ${subj.border} border flex items-center justify-center mb-2.5 shadow-xs`}>
                    <subj.icon className={`h-5 w-5 ${subj.text}`} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-0.5">{subj.name}</h3>
                  <p className="text-xs text-muted-foreground">{subj.en}</p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-16 sm:mb-24">
        <GlassCard className="p-4 sm:p-6 border border-border" variant="gradient-border">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="text-center px-2 pt-2 sm:pt-0"
              >
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tabular-nums">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* ===================== BENTO FEATURES GRID ===================== */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-16">
        <div className="text-center mb-10 sm:mb-14">
          <Badge variant="secondary" className="mb-3 border-border bg-muted/70 text-foreground">
            <Zap className="h-3 w-3 mr-1.5 text-primary" /> Core Features
          </Badge>
          <h2 className="text-h1 mb-3 font-extrabold tracking-tight">
            এক প্ল্যাটফর্মে <span className="text-gradient">সব সুবিধা</span>
          </h2>
          <p className="text-lead max-w-2xl mx-auto">
            প্রতিটি ফিচার শিক্ষার্থীর প্রয়োজন অনুযায়ী অপ্টিমাইজড—যাতে সময় বাঁচে এবং রিভিশন হয় সর্বোচ্চ নিখুঁত।
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bentoFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className={f.span}
            >
              <Link href={f.href} className="block h-full">
                <GlassCard
                  interactive
                  className="h-full p-6 group relative overflow-hidden border border-border/80 hover:border-primary/50 transition-all"
                  variant="gradient-border"
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-md text-white`}>
                          <f.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="text-xs font-semibold bg-muted/80">
                          {f.tag}
                        </Badge>
                      </div>

                      <h3 className={`font-bold text-foreground mb-2 ${f.highlight ? "text-xl sm:text-2xl" : "text-lg"}`}>
                        {f.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {f.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-auto flex items-center justify-between text-xs font-semibold text-primary">
                      <span>{f.badge}</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== TRUST & INTEGRITY ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustPoints.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5 h-full border border-border/70" variant="subtle">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">{t.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="p-8 sm:p-14 text-center relative overflow-hidden border border-primary/30 shadow-2xl bg-gradient-to-b from-card via-card to-primary/5" variant="gradient-border" glow>
            <div className="relative z-10">
              <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
                <Crown className="h-6 w-6" />
              </div>
              <h2 className="text-h1 font-black mb-4 tracking-tight">
                তোমার স্বপ্নের ভার্সিটি ও বোর্ড <span className="text-gradient">শীর্ষস্থান নিশ্চিত করো</span>
              </h2>
              <p className="text-lead mb-8 max-w-xl mx-auto text-muted-foreground">
                আজই শুরু করো তোমার একাডেমিক রিভিশন ও প্র্যাকটিস। কোনো ফি বা জটিলতা নেই।
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Button
                  render={<Link href="/register" />}
                  size="lg"
                  className="px-10 py-6 text-base font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white shadow-xl shadow-violet-500/30 group"
                >
                  <Flame className="h-5 w-5 mr-2 text-amber-300 group-hover:animate-bounce" />
                  এখনই একাউন্ট তৈরি করো
                  <ArrowRight className="h-4.5 w-4.5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-border/80 py-10 sm:py-14 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <div className="flex items-center justify-center gap-2 font-extrabold text-lg mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white">
              <Brain className="h-4.5 w-4.5" />
            </div>
            HSC <span className="text-gradient">Ultimate</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1 font-medium">
            বাংলাদেশের HSC পরীক্ষার্থীদের সেরা প্রস্তুতির স্মার্ট সঙ্গী 🚀
          </p>
          <p className="text-xs text-muted-foreground/70">
            Next.js 16 · Prisma · PostgreSQL · Multi-AI Architecture
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">লগইন</Link>
            <span>·</span>
            <Link href="/register" className="hover:text-foreground transition-colors">রেজিস্ট্রেশন</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">গোপনীয়তা নীতি</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">ব্যবহারের শর্তাবলি</Link>
            <span>·</span>
            <Link href="/account-deletion" className="hover:text-foreground transition-colors">ডেটা নিয়ন্ত্রণ</Link>
          </div>
        </div>
      </footer>
    </AuroraBackground>
  );
}
