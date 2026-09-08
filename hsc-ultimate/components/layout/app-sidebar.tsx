"use client";

// ===================================================================
// App Sidebar (ডেস্কটপ/লার্জ স্ক্রিন) — ব্যবহারকারীর ফিডব্যাক অনুযায়ী
// নতুন যোগ করা হয়েছে: "Tools gula side bar a rakba jate full
// professional hoi ... jegula thake oigula sidebar a rakba"
// -------------------------------------------------------------------
// ডিজাইন সিদ্ধান্ত:
// - সব ২০টা মডিউল/টুল এখন `lib/nav-modules.ts` এর NAV_GROUPS থেকে
//   ৩টা ক্যাটাগরিতে (প্রধান / স্টাডি টুলস / সোশ্যাল ও প্রতিযোগিতা)
//   ভাগ করে দেখানো হয় — dashboard-preview.html mockup এর সাথে
//   সামঞ্জস্যপূর্ণ।
// - শুধু `lg` ব্রেকপয়েন্টের (≥1024px) উপরে দেখা যায় — ছোট স্ক্রিনে
//   (মোবাইল/ট্যাবলেট) বিদ্যমান BottomNavBar + "আরও" শীট প্যাটার্নই
//   ব্যবহার হয় (`lib/nav-visibility.ts` এর একই hide-logic শেয়ার করা
//   হয়েছে যাতে দুটো নেভিগেশন কখনো ভিন্ন আচরণ না করে)।
// - `sticky top-0 h-dvh overflow-y-auto` — flex sibling হিসেবে বসানো
//   (fixed positioning না, তাই আলাদা margin/padding hack লাগে না),
//   পেজ স্ক্রল করলে sidebar নিজের জায়গায় আটকে থেকে নিজেই স্ক্রল হয়।
// - Active route হাইলাইট (nested রুটেও কাজ করে)।
// - লগইন করা না থাকলে, বা quiz/exam/admin এর মতো focused full-screen
//   রুটে (`shouldHideNavChrome`) sidebar দেখানো হয় না।
// ===================================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { GraduationCap, LogOut, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/nav-modules";
import { shouldHideNavChrome, isNavItemActive } from "@/lib/nav-visibility";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlobalSearchButton } from "@/components/layout/global-search";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user?.id) return null;
  if (shouldHideNavChrome(pathname)) return null;

  const name = session.user.name ?? "শিক্ষার্থী";
  const email = session.user.email ?? "";
  const isAdmin = session.user.role === "ADMIN";
  const initial = name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <aside
      data-glass-nav="sidebar"
      className="hidden lg:flex lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:border-r glass-nav lg:text-sidebar-foreground"
      aria-label="মূল টুল নেভিগেশন"
    >
      {/* Brand */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border shrink-0 group"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
          <GraduationCap className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold leading-tight truncate">HSC Ultimate</p>
          <p className="text-xs text-sidebar-muted-foreground leading-tight">HSC প্রস্তুতি প্ল্যাটফর্ম</p>
        </div>
      </Link>

      <div className="shrink-0 border-b border-sidebar-border px-3 py-3">
        <GlobalSearchButton className="h-9 w-full bg-sidebar/40 text-xs" label="কনটেন্ট খোঁজো" />
      </div>

      {/* Nav groups — স্ক্রল হওয়া অংশ */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-xs font-bold uppercase tracking-wide text-sidebar-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all group",
                      active
                        ? "bg-primary/15 text-primary font-semibold shadow-xs"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    <div
                      className={cn(
                        "h-6.5 w-6.5 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0 shadow-xs",
                        item.color
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="flex-1 min-w-0 truncate">{item.title}</span>
                    {item.isNew && (
                      <span className="shrink-0 rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white leading-none">
                        নতুন
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — user profile shortcut */}
      <div className="border-t border-sidebar-border p-2.5 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-sidebar-accent/60 transition-colors">
              <Avatar className="h-8 w-8 border shrink-0">
                <AvatarFallback className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white text-xs font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold truncate">{name}</p>
                <p className="text-xs text-sidebar-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="h-4 w-4" />
              প্রোফাইল ও সেটিংস
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem render={<Link href="/admin" />}>
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ redirectTo: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              লগআউট
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
