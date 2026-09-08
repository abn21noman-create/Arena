"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
} from "lucide-react";
import {
  ACCENT_COLORS,
  getStoredAccentColor,
  setStoredAccentColor,
  type AccentColorId,
} from "@/lib/accent-theme";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound-effects";
import { toast } from "sonner";

export function ThemeCustomizerButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentAccent, setCurrentAccent] = useState<AccentColorId>("default");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentAccent(getStoredAccentColor());
  }, []);

  if (!mounted) return null;

  const handleAccentChange = (id: AccentColorId, label: string) => {
    sfx.play("click");
    setStoredAccentColor(id);
    setCurrentAccent(id);
    toast.success(`থিম কালার পরিবর্তন: ${label}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border border-border bg-card/80 hover:bg-muted text-foreground transition-all shadow-xs"
          title="কালার থিম কাস্টমাইজ করুন"
          aria-label="কালার থিম কাস্টমাইজ করুন"
        >
          <Palette className="h-4 w-4 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b">
            <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              থিম ও কালার স্টুডিও
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">ডিসপ্লে মোড:</span>
            <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setTheme("light");
                }}
                className={cn(
                  "flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition",
                  theme === "light"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>লাইট</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setTheme("dark");
                }}
                className={cn(
                  "flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition",
                  theme === "dark"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>ডার্ক</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("click");
                  setTheme("system");
                }}
                className={cn(
                  "flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition",
                  theme === "system"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>অটো</span>
              </button>
            </div>
          </div>

          {/* Accent Color Palette */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-muted-foreground font-semibold">অ্যাকসেন্ট কালার:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {ACCENT_COLORS.map((c) => {
                const isSelected = currentAccent === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleAccentChange(c.id, c.label)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-1.5 rounded-xl border text-center transition",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <div
                      className="h-5 w-5 rounded-full border shadow-2xs flex items-center justify-center"
                      style={{ backgroundColor: c.swatchHex }}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white drop-shadow-xs" />}
                    </div>
                    <span className="text-xs font-medium truncate max-w-full">
                      {c.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
