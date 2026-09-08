"use client";

// ===================================================================
// Theme Toggle — 3-state (Light / Dark / System) with smooth animation
// -------------------------------------------------------------------
// Hydration mismatch এড়াতে mounted state ব্যবহার করা হয়েছে (server এ
// theme জানা যায় না, তাই client mount হওয়ার পরই আসল আইকন দেখানো হয়)।
// Smooth rotation animation between sun/moon/system icons।
// ===================================================================
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled
        aria-label="থিম পরিবর্তন করো"
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const current = theme || "system";

  // Cycle: light → dark → system → light
  const cycle = () => {
    if (current === "light") setTheme("dark");
    else if (current === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon = current === "system" ? Monitor : isDark ? Moon : Sun;
  const label =
    current === "system" ? "System theme" : isDark ? "Dark mode" : "Light mode";

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 relative overflow-hidden border border-border bg-card/80 hover:bg-muted text-foreground transition-all shadow-xs"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ y: -16, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
