"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BookOpen,
  Calculator,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  MessageSquare,
  RotateCcw,
  Search,
  Sparkles,
  Swords,
  Timer,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { openScientificCalculator } from "@/components/shared/scientific-calculator";
import { openKeyboardShortcutsGuide } from "@/components/shared/keyboard-shortcuts-dialog";
import { sfx } from "@/lib/sound-effects";

interface SearchResultItem {
  id: string;
  type: "subject" | "topic" | "flashcard-deck" | "forum-post" | "action";
  title: string;
  subtitle?: string;
  href?: string;
  action?: () => void;
  icon?: typeof BookOpen;
}

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  subject: BookOpen,
  topic: FileText,
  "flashcard-deck": Layers,
  "forum-post": MessageSquare,
  action: Zap,
};

export const OPEN_GLOBAL_SEARCH_EVENT = "hsc-ultimate:open-global-search";

export function openGlobalSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_GLOBAL_SEARCH_EVENT));
  }
}

export function GlobalSearchButton({
  className,
  compact = false,
  label = "সব কনটেন্ট খুঁজুন বা জাম্প করুন",
  onBeforeOpen,
}: {
  className?: string;
  compact?: boolean;
  label?: string;
  onBeforeOpen?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "gap-2 text-muted-foreground justify-start",
        compact ? "h-9 w-9 px-0" : "h-10 w-full sm:w-60",
        className
      )}
      onClick={() => {
        onBeforeOpen?.();
        window.setTimeout(openGlobalSearch, onBeforeOpen ? 0 : 0);
      }}
      aria-label={compact ? label : undefined}
    >
      <Search className="h-4 w-4 shrink-0" />
      {!compact && <span className="truncate text-sm">{label}</span>}
      {!compact && (
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline-flex">
          Ctrl K
        </kbd>
      )}
    </Button>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: SearchResultItem[] = [
    {
      id: "qa-practice",
      type: "action",
      title: "স্মার্ট অ্যাডাপ্টিভ প্র্যাকটিস",
      subtitle: "তোমার বর্তমান লেভেল অনুযায়ী স্বয়ংক্রিয় প্রশ্ন",
      href: "/adaptive-practice",
      icon: Zap,
    },
    {
      id: "qa-calc",
      type: "action",
      title: "HSC সায়েন্টিফিক ক্যালকুলেটর ও ধ্রুবক",
      subtitle: "ফিজিক্স ও কেমিস্ট্রির জন্য ফর্মুলা ও ধ্রুবক শিট",
      action: () => openScientificCalculator(),
      icon: Calculator,
    },
    {
      id: "qa-mock-exam",
      type: "action",
      title: "পূর্ণাঙ্গ মডেল টেস্ট ও OMR",
      subtitle: "বোর্ড ও শীর্ষ কলেজের স্ট্যান্ডার্ড প্রশ্নপত্র",
      href: "/mock-exam",
      icon: FileText,
    },
    {
      id: "qa-mistake-vault",
      type: "action",
      title: "মিস্টেক ভল্ট (ভুল প্রশ্নের ব্যাংক)",
      subtitle: "ভুল হওয়া MCQ গুলো পুনরায় সমাধান করে রিভিশন দাও",
      href: "/mistake-vault",
      icon: RotateCcw,
    },
    {
      id: "qa-quiz-battle",
      type: "action",
      title: "কুইজ ব্যাটল অ্যারেনা (1v1)",
      subtitle: "বন্ধুদের সাথে লাইভ স্পিড কুইজ প্রতিযোগিতা",
      href: "/quiz-battle",
      icon: Swords,
    },
    {
      id: "qa-ai-tutor",
      type: "action",
      title: "AI ডাউট সলভার",
      subtitle: "যেকোনো কঠিন টপিক বা ম্যাথের তাৎক্ষণিক সমাধান",
      href: "/ai-tutor",
      icon: Sparkles,
    },
    {
      id: "qa-formula",
      type: "action",
      title: "সূত্রাবলি ও কনসেপ্ট সার্চ",
      subtitle: "পদার্থবিজ্ঞান, রসায়ন ও গণিতের সকল ফর্মুলা",
      href: "/formula-search",
      icon: BookOpen,
    },
    {
      id: "qa-focus",
      type: "action",
      title: "Strict Focus ও স্টাডি রুম",
      subtitle: "নীরব মনোযোগে পড়ার সময় ট্র্যাকিং",
      href: "/focus",
      icon: Timer,
    },
    {
      id: "qa-shortcuts",
      type: "action",
      title: "কীবোর্ড শর্টকাট সহায়িকা",
      subtitle: "দ্রুত প্র্যাকটিস করার কীবোর্ড শর্টকাটস",
      action: () => openKeyboardShortcutsGuide(),
      icon: HelpCircle,
    },
  ];

  const resetSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    requestIdRef.current += 1;
    setQuery("");
    setResults([]);
    setError(null);
    setLoading(false);
    setHighlightedIndex(0);
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        sfx.play("click");
        window.setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        resetSearch();
      }
    },
    [resetSearch]
  );

  useEffect(() => {
    function openPalette() {
      if (sessionStatus === "authenticated") handleOpenChange(true);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (
        sessionStatus === "authenticated" &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        openPalette();
      }
    }
    window.addEventListener(OPEN_GLOBAL_SEARCH_EVENT, openPalette);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener(OPEN_GLOBAL_SEARCH_EVENT, openPalette);
      window.removeEventListener("keydown", handleKeyDown);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [handleOpenChange, sessionStatus]);

  useEffect(() => {
    const element = document.getElementById(`search-result-${highlightedIndex}`);
    element?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const runSearch = useCallback(async (rawQuery: string) => {
    const normalizedQuery = rawQuery.trim();
    if (normalizedQuery.length < 2) {
      abortRef.current?.abort();
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      const data = (await response.json().catch(() => ({}))) as {
        results?: SearchResultItem[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "সার্চ সার্ভার এখন সাড়া দিচ্ছে না");
      }
      if (requestId !== requestIdRef.current) return;
      setResults(Array.isArray(data.results) ? data.results : []);
      setHighlightedIndex(0);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setError(caught instanceof Error ? caught.message : "সার্চ করা যায়নি");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setHighlightedIndex(0);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void runSearch(value), 300);
  }

  function handleSelect(item: SearchResultItem) {
    sfx.play("click");
    handleOpenChange(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  }

  const activeDisplayList = query.trim().length >= 2 ? results : quickActions;

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (activeDisplayList.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % activeDisplayList.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => (current - 1 + activeDisplayList.length) % activeDisplayList.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = activeDisplayList[highlightedIndex];
      if (item) handleSelect(item);
    }
  }

  const trimmedQuery = query.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[max(1rem,12vh)] max-h-[min(38rem,calc(100dvh-2rem))] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>সব কনটেন্ট খুঁজুন বা জাম্প করুন</DialogTitle>
          <DialogDescription>
            সাবজেক্ট, টপিক, টুলস, ফ্ল্যাশকার্ড এবং দ্রুত কমান্ড ব্যবহার করুন
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-14 items-center gap-2 border-b px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => handleInputChange(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="যেকোনো বিষয়, সূত্র, টুল বা টপিক খুঁজুন..."
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            role="combobox"
            aria-label="সব কনটেন্টে সার্চ"
            aria-expanded={activeDisplayList.length > 0}
            aria-controls="search-results-listbox"
            aria-activedescendant={
              activeDisplayList.length > 0 ? `search-result-${highlightedIndex}` : undefined
            }
            aria-autocomplete="list"
            aria-busy={loading}
          />
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-8"
            onClick={() => handleOpenChange(false)}
          >
            বন্ধ
          </Button>
        </div>

        <div className="min-h-56 max-h-[min(30rem,calc(100dvh-6rem))] overflow-y-auto" aria-live="polite">
          {trimmedQuery.length >= 2 && error ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center" role="alert">
              <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
              <p className="text-sm font-semibold">সার্চ সম্পন্ন হয়নি</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => void runSearch(query)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                আবার চেষ্টা করো
              </Button>
            </div>
          ) : trimmedQuery.length >= 2 && !loading && results.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <FileText className="mb-3 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">“{trimmedQuery}” এর জন্য কিছু পাওয়া যায়নি</p>
              <p className="mt-1 text-xs text-muted-foreground">বানান বা ছোট কোনো keyword দিয়ে চেষ্টা করো</p>
            </div>
          ) : (
            <div className="p-2" role="listbox" id="search-results-listbox">
              <div className="flex items-center justify-between px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">
                <span>{trimmedQuery.length >= 2 ? `${results.length}টি ফলাফল` : "⚡ দ্রুত শর্টকাট ও টুলস"}</span>
                <span className="text-xs">↑↓ দিয়ে নেভিগেট · ↵ নির্বাচন</span>
              </div>
              {activeDisplayList.map((item, index) => {
                const Icon = item.icon || TYPE_ICONS[item.type] || BookOpen;
                const highlighted = index === highlightedIndex;
                return (
                  <button
                    type="button"
                    key={`${item.type}-${item.id}`}
                    id={`search-result-${index}`}
                    role="option"
                    aria-selected={highlighted}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      highlighted ? "bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      item.type === "action" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
