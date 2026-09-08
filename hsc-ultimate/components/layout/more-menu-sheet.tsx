"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Bookmark,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMoreMenuGroups } from "@/lib/nav-modules";
import { Button } from "@/components/ui/button";
import { GlobalSearchButton } from "@/components/layout/global-search";

interface MobileMenuItem {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  isNew?: boolean;
}

interface MobileMenuGroup {
  label: string;
  items: MobileMenuItem[];
}

const UTILITY_ITEMS: MobileMenuItem[] = [
  {
    href: "/saved",
    title: "সেভ করা টপিক",
    desc: "Bookmark করা পড়া দ্রুত খুলুন",
    icon: Bookmark,
    color: "from-cyan-600 to-violet-700",
  },
  {
    href: "/settings",
    title: "সেটিংস",
    desc: "Profile, privacy ও accessibility",
    icon: Settings,
    color: "from-slate-600 to-violet-700",
  },
];

export function MoreMenuSheet({
  open,
  onOpenChange,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const groups = useMemo<MobileMenuGroup[]>(() => {
    const source: MobileMenuGroup[] = [
      ...getMoreMenuGroups(),
      { label: "লাইব্রেরি ও সেটিংস", items: UTILITY_ITEMS },
      ...(isAdmin
        ? [
            {
              label: "অ্যাডমিন",
              items: [
                {
                  href: "/admin",
                  title: "Admin Operations",
                  desc: "Users, content, reports ও system health",
                  icon: ShieldCheck,
                  color: "from-rose-600 to-violet-800",
                },
              ],
            },
          ]
        : []),
    ];

    const normalized = query.trim().toLocaleLowerCase("bn-BD");
    if (!normalized) return source;
    return source
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.title} ${item.desc}`.toLocaleLowerCase("bn-BD").includes(normalized)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [isAdmin, query]);

  const visibleCount = groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 isolate z-50 bg-black/40 duration-150 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[min(90dvh,52rem)] flex-col overflow-hidden rounded-t-3xl glass-nav text-popover-foreground ring-1 ring-foreground/10 duration-200 outline-none",
            "data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="shrink-0 border-b border-border/70 bg-background/95 px-4 pb-3 pt-2">
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-muted-foreground/30" aria-hidden="true" />
            <div className="flex min-h-11 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogPrimitive.Title className="font-heading text-base font-bold">
                  সব মডিউল
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-muted-foreground">
                  {visibleCount}টি real study tool ও account utility
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                render={<Button type="button" variant="ghost" size="icon-lg" aria-label="মেনু বন্ধ করো" />}
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="মডিউল খোঁজো..."
                  className="h-11 w-full rounded-xl border border-input bg-background/70 pl-9 pr-3 text-base outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                  aria-label="মডিউল খুঁজুন"
                />
              </label>
              <GlobalSearchButton
                compact
                label="Academic কনটেন্ট খোঁজো"
                className="h-11 w-11 rounded-xl"
                onBeforeOpen={() => onOpenChange(false)}
              />
            </div>
            <p className="mt-1.5 px-1 text-xs text-muted-foreground">
              বাঁয়ের ঘরে tool খুঁজুন · ডানের search-এ topic, deck ও post খুঁজুন
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
            {groups.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center" role="status">
                <Search className="mb-3 h-9 w-9 text-muted-foreground/50" />
                <p className="text-sm font-semibold">“{query.trim()}” নামে কোনো মডিউল নেই</p>
                <p className="mt-1 text-xs text-muted-foreground">অন্য keyword দিয়ে চেষ্টা করুন</p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setQuery("")}>
                  সব মডিউল দেখুন
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {groups.map((group, groupIndex) => (
                  <section key={group.label} aria-labelledby={`mobile-menu-group-${groupIndex}`}>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <h2
                        id={`mobile-menu-group-${groupIndex}`}
                        className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {group.label}
                      </h2>
                      <div className="h-px flex-1 bg-border/70" aria-hidden="true" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => onOpenChange(false)}
                          className="group relative flex min-h-24 items-start gap-2.5 rounded-2xl border border-border/70 bg-card/70 p-3 text-left shadow-sm transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {item.isNew && (
                            <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                              নতুন
                            </span>
                          )}
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br shadow-sm",
                              item.color
                            )}
                          >
                            <item.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className={cn("min-w-0 flex-1", item.isNew && "pt-5")}>
                            <p className="text-sm font-semibold leading-tight text-foreground">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
