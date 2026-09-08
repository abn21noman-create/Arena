"use client";

// ===================================================================
// Bottom Navigation Bar (মোবাইল) — Duolingo/Instagram-স্টাইল ৫-আইকন
// bottom tab bar, শুধু মোবাইল স্ক্রিনে (sm ব্রেকপয়েন্টের নিচে) দেখা যায়
// -------------------------------------------------------------------
// ডিজাইন সিদ্ধান্ত:
// - ৫টা মূল শর্টকাট: হোম (Dashboard), শেখো (Learn), প্র্যাকটিস
//   (Practice), প্ল্যানার, আরও (More — বাকি সব মডিউলের ফুল মেনু)।
//   HSC Ultimate এ ৩০+টা মডিউল আছে (AI Tutor, Flashcards, Forum,
//   Study Group, Reading Room ইত্যাদি) — সবগুলো ৫-আইকন bar এ রাখা
//   সম্ভব না, তাই সবচেয়ে বেশি ব্যবহৃত ৪টা (Dashboard/Learn/Practice/
//   Planner) + একটা "আরও" শীট যেখানে বাকি সব দেখা যায়।
// - `usePathname()` + `useSession()` দিয়ে conditionally রেন্ডার করা
//   হয়: (ক) লগইন করা না থাকলে (landing/login/register পেজে) দেখানো
//   হয় না, (খ) Admin Panel এ দেখানো হয় না (সেখানে ইতিমধ্যে নিজস্ব
//   sidebar আছে), (গ) `/ai-tutor`, quiz/exam/drill/duel/battle এর
//   "run"/"attempt" সাব-রুটে দেখানো হয় না (focused full-screen UI,
//   বিভ্রান্তিকর নেভিগেশন এড়াতে — student ভুলবশত চাপ দিয়ে পরীক্ষা
//   থেকে বের হয়ে যেতে পারে)।
// - Active route হাইলাইট করা হয় (`isActive` চেক, nested রুটেও কাজ
//   করে যেমন `/learn/[subjectId]` তে "শেখো" ট্যাব active থাকবে)।
// - কীবোর্ড/স্ক্রিন-রিডার অ্যাক্সেসিবিলিটি: প্রতিটা ট্যাব আসল
//   `<Link>` (নেটিভ anchor, keyboard-focusable + Enter কাজ করে),
//   `aria-current="page"` active ট্যাবে, `role="navigation"` +
//   `aria-label` কন্টেইনারে।
// - Safe-area padding: iOS/Android এর home-indicator/gesture-bar এর
//   সাথে ওভারল্যাপ এড়াতে `env(safe-area-inset-bottom)` ব্যবহার করা
//   হয়েছে।
// ===================================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, BookOpen, Brain, Gamepad2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoreMenuSheet } from "@/components/layout/more-menu-sheet";
import { shouldHideNavChrome, isNavItemActive } from "@/lib/nav-visibility";

const TABS = [
  { href: "/dashboard", label: "হোম", icon: Home },
  { href: "/learn", label: "শেখো", icon: BookOpen },
  { href: "/practice", label: "প্র্যাকটিস", icon: Brain },
  { href: "/quiz-battle", label: "ব্যাটল", icon: Gamepad2 },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [moreOpen, setMoreOpen] = useState(false);

  // লগইন করা না থাকলে (landing/login/register পেজে, অথবা session
  // লোড হওয়ার সময়) দেখানো হয় না
  if (status !== "authenticated" || !session?.user?.id) return null;
  if (shouldHideNavChrome(pathname)) return null;

  const isMoreActive = ![...TABS.map((t) => t.href)].some((href) =>
    isNavItemActive(pathname, href)
  );

  return (
    <>
      <nav
        role="navigation"
        aria-label="মূল নেভিগেশন"
        className="fixed inset-x-0 bottom-0 z-40 border-t glass-nav lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 h-14">
          {TABS.map((tab) => {
            const active = isNavItemActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active tab indicator — Duolingo/Instagram-স্টাইল একটা ছোট
                    pill যেটা layoutId এর মাধ্যমে ট্যাব বদলানোর সময় স্প্রিং
                    অ্যানিমেশনে এক ট্যাব থেকে আরেক ট্যাবে "স্লাইড" করে যায় */}
                {active && (
                  <motion.div
                    layoutId="bottom-nav-active-pill"
                    className="absolute top-1 h-1 w-6 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon className={cn("h-5 w-5 mt-1", active && "fill-primary/10")} />
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="আরও মেনু খোলো"
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Menu className="h-5 w-5" />
            আরও
          </button>
        </div>
      </nav>

      <MoreMenuSheet open={moreOpen} onOpenChange={setMoreOpen} isAdmin={session.user.role === "ADMIN"} />

      {/* Content এর নিচে bottom nav এর সমান জায়গা রাখা হচ্ছে যাতে কোনো
          পেজের নিচের অংশ bottom nav এ ঢাকা না পড়ে (শুধু মোবাইলে, sm এ
          bottom nav নিজেই hidden তাই এই spacer ও hidden)

          🐛 চাক্ষুষ QA ফিক্স (৩৯০×৮৪৪ মোবাইল স্ক্রিনশটে ধরা পড়েছে):
          আগে spacer এর উচ্চতা ছিল ঠিক nav-এর সমান (3.5rem)। ফলে
          কনটেন্ট ঢাকা পড়ত না ঠিকই, কিন্তু পেজের **শেষ কার্ডটা
          bottom nav এর গায়ে একদম লেগে থাকত** (মাপা গ্যাপ ছিল
          −1px) — দেখতে দমবন্ধ লাগত ও ভুল করে nav ট্যাপ হওয়ার
          ঝুঁকি থাকত। এখন ১rem শ্বাস-জায়গা যোগ করা হয়েছে, যা
          পেজগুলোর নিজস্ব `py-8` (2rem) এর সাথে সামঞ্জস্যপূর্ণ। */}
      <div
        className="lg:hidden"
        style={{ height: "calc(3.5rem + 1rem + env(safe-area-inset-bottom))" }}
        aria-hidden="true"
      />
    </>
  );
}
