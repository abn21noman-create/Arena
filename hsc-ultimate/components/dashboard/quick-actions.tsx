/**
 * Quick Actions — bento grid of most-used tools (6 items)
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, Target, Layers, BarChart3, CalendarClock, MessageCircle, LockKeyhole,
  Headphones, Atom, GraduationCap, FileQuestion,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

// Map of icon key → Lucide component (client-side, so we can pass strings from server)
const ICONS: Record<string, LucideIcon> = {
  Brain, Target, Layers, BarChart3, CalendarClock, MessageCircle, LockKeyhole,
  Headphones, Atom, GraduationCap, FileQuestion,
};

interface QuickActionsProps {
  actions: Array<{
    href: string;
    iconKey: string;
    title: string;
    desc: string;
    color: string;
  }>;
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">দ্রুত অ্যাকশন</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            সবচেয়ে বেশি ব্যবহৃত টুলস
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {actions.map((a, i) => {
          const Icon = ICONS[a.iconKey];
          if (!Icon) return null;
          return (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={a.href}>
                <GlassCard
                  interactive
                  className="p-4 sm:p-5 group relative overflow-hidden h-full"
                  variant="gradient-border"
                >
                  <div
                    aria-hidden
                    className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${a.color} opacity-20 blur-2xl group-hover:opacity-40 group-hover:scale-125 transition-all duration-700`}
                  />
                  <div className="relative">
                    <div className={`inline-flex h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br ${a.color} items-center justify-center mb-2.5 shadow-lg group-hover:rotate-6 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-0.5">{a.title}</h3>
                    <p className="text-xs sm:text-xs text-muted-foreground line-clamp-1">
                      {a.desc}
                    </p>
                    <ArrowRight className="h-3.5 w-3.5 mt-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
