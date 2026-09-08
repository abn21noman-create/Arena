"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/components/accessibility-provider";
import { FONT_SIZE_LABELS, type FontSizeScale } from "@/lib/accessibility";
import { cn } from "@/lib/utils";
import { Type, Eye, Zap } from "lucide-react";

const FONT_SIZES: FontSizeScale[] = ["normal", "large", "xlarge"];

export function AccessibilityTab() {
  const {
    fontSize,
    highContrast,
    reducedMotion,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    mounted,
  } = useAccessibility();

  if (!mounted) return <Card className="h-64 animate-pulse bg-muted/30 p-6" />;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <Type className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">ফন্ট সাইজ</p>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          পুরো app-এর rem-based text সত্যিই ১৬, ১৮ বা ২০px root scale অনুযায়ী বড় হবে।
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              aria-pressed={fontSize === size}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                fontSize === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-muted"
              )}
            >
              {FONT_SIZE_LABELS[size]}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <Label htmlFor="high-contrast" className="cursor-pointer text-sm font-medium">
              হাই কনট্রাস্ট মোড
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Background, foreground, border ও muted text-এর contrast token বাড়ায়।
          </p>
        </div>
        <Switch id="high-contrast" checked={highContrast} onCheckedChange={toggleHighContrast} />
      </Card>

      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <Label htmlFor="reduced-motion" className="cursor-pointer text-sm font-medium">
              অ্যানিমেশন কমাও
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            App-level animation, transition এবং smooth scrolling প্রায় সম্পূর্ণ বন্ধ করে।
          </p>
        </div>
        <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={toggleReducedMotion} />
      </Card>
    </div>
  );
}
