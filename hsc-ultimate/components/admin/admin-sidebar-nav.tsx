"use client";

// ===================================================================
// Admin Panel Sidebar Navigation — UI/UX Polish
// -------------------------------------------------------------------
// আগে Admin sidebar এর ৩টা bug/rough-edge ছিল (ব্যবহারকারীর "UI/UX
// polish" নির্দেশে এই সেশনে ধরা পড়েছে ও ফিক্স করা হলো):
// 1. **কোনো Active-Route Highlighting ছিল না** — Admin কোন পেজে আছে
//    বোঝার কোনো ভিজ্যুয়াল ইঙ্গিত ছিল না (student-facing AppSidebar এ
//    এটা আগে থেকেই ছিল, Admin sidebar এ ছিল না — অসামঞ্জস্য)।
// 2. **সম্পূর্ণ Non-Responsive** — `w-60` ফিক্সড sidebar ছোট স্ক্রিনে
//    (মোবাইল/ট্যাবলেট) ভেঙে পড়তো (কোনো hide/hamburger-menu লজিক
//    ছিল না) — Admin কে যদি কখনো মোবাইল থেকে অ্যাক্সেস করতে হয়
//    (জরুরি ban/delete/maintenance-mode toggle), UI ব্যবহারযোগ্য
//    ছিল না।
// 3. **Dark Mode brightness আপডেট থেকে বাদ পড়েছিল** — Student
//    dashboard এর sidebar/dark-mode brightness overhaul (আগের সেশন)
//    এ `--sidebar`/`--sidebar-foreground` ইত্যাদি ভেরিয়েবল আপডেট
//    হয়েছিল, কিন্তু Admin sidebar `bg-muted/30` ব্যবহার করতো (আলাদা
//    ভেরিয়েবল) — তাই সেই brightness fix থেকে উপকৃত হয়নি। এখন একই
//    `bg-sidebar`/`text-sidebar-foreground` ভেরিয়েবল ব্যবহার করা
//    হচ্ছে, তাই ভবিষ্যতে dark mode আরও পরিবর্তন হলে দুটো sidebar
//    (student+admin) একসাথে আপডেট হবে।
// -------------------------------------------------------------------
// ডিজাইন: ≥768px (md) এ sticky sidebar (student AppSidebar এর একই
// `sticky top-0 h-dvh` প্যাটার্ন), তার নিচে (মোবাইল) header এ hamburger
// বাটন যা bottom-sheet (base-ui Dialog, `more-menu-sheet.tsx` এর একই
// প্রমাণিত প্যাটার্ন) খোলে — এইভাবে কোনো নতুন navigation paradigm
// শেখার দরকার নেই, বিদ্যমান established প্যাটার্নই পুনর্ব্যবহার করা
// হয়েছে।
// ===================================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeft,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Megaphone,
  Flag,
  History,
  Settings2,
  Menu,
  X,
  LockKeyhole,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavItemActive } from "@/lib/nav-visibility";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

const NAV_ITEMS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/subjects", label: "সাবজেক্ট/চ্যাপ্টার/টপিক", icon: BookOpen },
  { href: "/admin/content-quality", label: "Academic Content Quality", icon: ClipboardCheck },
  { href: "/admin/users", label: "ইউজার ম্যানেজমেন্ট", icon: Users },
  { href: "/admin/analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
  { href: "/admin/forum", label: "Forum Moderation", icon: MessageSquare },
  { href: "/admin/reports", label: "Content Reports", icon: Flag },
  { href: "/admin/broadcast", label: "Broadcast Notifications", icon: Megaphone },
  { href: "/admin/focus", label: "Strict Focus Control", icon: LockKeyhole },
  { href: "/admin/focus/analytics", label: "Focus Analytics", icon: BarChart3 },
  { href: "/admin/audit-log", label: "Audit Log", icon: History },
  { href: "/admin/system", label: "System Control", icon: Settings2 },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 flex-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        // "/admin" এর জন্য exact match লাগবে (নাহলে সব admin/* রুটেই
        // ড্যাশবোর্ড লিংক active দেখাতো, isNavItemActive() এর
        // startsWith চেক এর কারণে)
        const active =
          item.href === "/admin" || item.href === "/admin/focus"
            ? pathname === item.href
            : isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            )}
          >
            <item.icon
              className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-sidebar-muted-foreground")}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebarNav({ name, email }: { name: string; email: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ডেস্কটপ/ট্যাবলেট (≥768px) — sticky sidebar, student AppSidebar
          এর একই layout প্যাটার্ন (sticky top-0 h-dvh) */}
      <aside className="hidden md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:flex md:flex-col md:border-r md:bg-sidebar md:text-sidebar-foreground md:p-4">
        <div className="flex items-center justify-between gap-2 mb-6 px-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <span className="font-bold text-sm truncate">Admin Panel</span>
          </div>
          {/* Theme Toggle — আগে Admin Panel এ কোথাও ছিল না (student
              header এ ThemeToggle আছে, Admin sidebar এ বাদ পড়েছিল —
              ছাত্র dark mode এ থেকে /admin এ গেলে থিম পরিবর্তনের কোনো
              উপায় ছিল না) */}
          <ThemeToggle />
        </div>
        <NavLinks />
        <div className="border-t border-sidebar-border pt-3 mt-2 shrink-0 flex items-center gap-2.5">
          <UserMenu name={name} email={email} isAdmin />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{name}</p>
            <p className="text-xs text-sidebar-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/60 transition-colors text-sidebar-muted-foreground shrink-0 mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
          মূল অ্যাপে ফিরে যাও
        </Link>
      </aside>

      {/* মোবাইল/ছোট ট্যাবলেট (<768px) — sticky header + hamburger,
          bottom-sheet এ সব নেভিগেশন আইটেম (more-menu-sheet.tsx এর
          established base-ui Dialog bottom-sheet প্যাটার্ন) */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-sidebar px-4 py-3 text-sidebar-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <span className="font-bold text-sm truncate">Admin Panel</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Admin মেনু খোলো"
            className="rounded-full p-2 hover:bg-sidebar-accent/60 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 isolate z-50 bg-black/20 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 md:hidden" />
          <DialogPrimitive.Popup
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-sidebar text-sidebar-foreground p-4 ring-1 ring-foreground/10 duration-150 outline-none md:hidden",
              "data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom"
            )}
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-sidebar-accent absolute left-1/2 -translate-x-1/2 top-2" aria-hidden="true" />
              <DialogPrimitive.Title className="font-heading text-sm font-semibold text-sidebar-muted-foreground px-1 mt-3">
                Admin মেনু
              </DialogPrimitive.Title>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="মেনু বন্ধ করো"
                className="rounded-full p-1.5 hover:bg-sidebar-accent/60 transition-colors mt-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-sidebar-border pt-3 mt-2 px-1">
              <p className="text-xs font-medium truncate">{name}</p>
              <p className="text-xs text-sidebar-muted-foreground truncate">{email}</p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/60 transition-colors text-sidebar-muted-foreground mt-1"
            >
              <ArrowLeft className="h-4 w-4" />
              মূল অ্যাপে ফিরে যাও
            </Link>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
