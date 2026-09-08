"use client";

// ===================================================================
// Accent Color Picker — Settings এর "থিম" ট্যাবে ৬টা রঙের সোয়াচ
// (ডিফল্ট + ৫টা curated রঙ) দেখিয়ে বেছে নেওয়ার UI
// ===================================================================
import { useAccentTheme } from "@/components/accent-theme-provider";
import { ACCENT_COLORS } from "@/lib/accent-theme";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccentColorPicker() {
  const { accentColor, setAccentColor, mounted } = useAccentTheme();

  if (!mounted) {
    return <div className="h-20 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {ACCENT_COLORS.map((color) => {
        const isSelected = accentColor === color.id;
        return (
          <button
            key={color.id}
            type="button"
            onClick={() => setAccentColor(color.id)}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted"
            )}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ring-1 ring-black/10"
              style={{ backgroundColor: color.swatchHex }}
            >
              {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium truncate">
                {color.emoji} {color.label}
              </span>
              <span className="block text-xs text-muted-foreground truncate">
                {color.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
