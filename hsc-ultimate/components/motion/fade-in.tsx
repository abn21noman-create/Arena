"use client";

// ===================================================================
// FadeIn — পুরো প্রজেক্টের জন্য একটাই reusable "scroll/mount হলে
// ধীরে ধীরে ভেসে আসে" মোশন র‍্যাপার (framer-motion উপরে বিল্ট, যা
// package.json এ ইতিমধ্যেই আছে — এতদিন শুধু ২টা কম্পোনেন্টে ব্যবহৃত
// হচ্ছিল review-runner.tsx ও breathing-exercise.tsx)।
// -------------------------------------------------------------------
// UI/UX Polish (প্রিমিয়াম থিম) ফিচার: Landing Page ও Dashboard এর
// স্ট্যাটিক কার্ড/সেকশনগুলোতে হালকা entrance animation যোগ করে আরও
// "প্রিমিয়াম SaaS" অনুভূতি আনা — Hugging Face/Linear/Vercel-স্টাইল
// সাইটগুলোতে যেমন কনটেন্ট স্ক্রল করলে বা পেজ লোড হলে হালকা fade+slide
// দেখা যায়।
//
// `useReducedMotion()` (framer-motion বিল্ট-ইন hook, OS-লেভেল
// prefers-reduced-motion সেটিং রেসপেক্ট করে) চেক করে reduced-motion
// ইউজারদের জন্য animation সম্পূর্ণ বন্ধ (তাৎক্ষণিক opacity:1, কোনো
// transform/delay ছাড়া) — globals.css এর CSS-level reduced-motion
// override এর পরিপূরক (JS-level animation props নিজেই স্কিপ হয়)।
//
// viewport={{ once: true }} — একবার দেখানোর পরে আর re-trigger হয় না
// (স্ক্রল আপ-ডাউন করলে বারবার animate না হয়ে বিরক্তিকর না লাগে)।
// ===================================================================
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type FadeDirection = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** কোন দিক থেকে ভেসে আসবে (ডিফল্ট: নিচ থেকে উপরে) */
  direction?: FadeDirection;
  /** সেকেন্ডে animation শুরু হওয়ার বিলম্ব (stagger effect এর জন্য) */
  delay?: number;
  /** সেকেন্ডে animation এর দৈর্ঘ্য */
  duration?: number;
  /** viewport এ কতটুকু ঢুকলে trigger হবে (0-1) */
  amount?: number;
  as?: "div" | "section" | "li";
}

const DISTANCE = 24;

function getOffset(direction: FadeDirection) {
  switch (direction) {
    case "up":
      return { y: DISTANCE };
    case "down":
      return { y: -DISTANCE };
    case "left":
      return { x: DISTANCE };
    case "right":
      return { x: -DISTANCE };
    default:
      return {};
  }
}

export function FadeIn({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.55,
  amount = 0.2,
  as = "div",
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, ...getOffset(direction) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const MotionTag = as === "section" ? motion.section : as === "li" ? motion.li : motion.div;

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

// ===================================================================
// StaggerGroup — একটা কনটেইনার যার সরাসরি children (StaggerItem) গুলো
// একে একে (delay-chained) ভেসে ওঠে — গ্রিড/লিস্ট আইটেমে ব্যবহারের জন্য
// ===================================================================
interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  /** প্রতিটা আইটেমের মধ্যে বিলম্বের ব্যবধান (সেকেন্ড) */
  staggerDelay?: number;
  amount?: number;
}

export function StaggerGroup({
  children,
  className,
  staggerDelay = 0.08,
  amount = 0.15,
}: StaggerGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerDelay },
    },
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: FadeDirection;
}) {
  const prefersReducedMotion = useReducedMotion();

  const itemVariants: Variants = {
    hidden: { opacity: 0, ...getOffset(direction) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
