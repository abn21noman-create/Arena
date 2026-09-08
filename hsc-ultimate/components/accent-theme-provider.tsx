"use client";

// ===================================================================
// Accent Theme Provider — Context + localStorage persist
// -------------------------------------------------------------------
// AccessibilityProvider এর একই প্যাটার্ন অনুসরণ করে (mount হওয়ার পরে
// localStorage থেকে পছন্দ লোড, তারপর <html> এলিমেন্টে CSS variable
// বসানো)। এখানে অতিরিক্তভাবে next-themes এর resolvedTheme (light/dark)
// এর সাথেও সিঙ্ক করা হয় — কারণ প্রতিটা accent color এর আলাদা light ও
// dark ভ্যালু আছে, মোড বদলালে accent color ও পুনরায় প্রয়োগ হতে হবে।
// ===================================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTheme } from "next-themes";
import {
  ACCENT_THEME_STORAGE_KEY,
  DEFAULT_ACCENT_COLOR,
  applyAccentColor,
  type AccentColorId,
} from "@/lib/accent-theme";

interface AccentThemeContextValue {
  accentColor: AccentColorId;
  setAccentColor: (id: AccentColorId) => void;
  mounted: boolean;
}

const AccentThemeContext = createContext<AccentThemeContextValue | null>(null);

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [accentColor, setAccentColorState] = useState<AccentColorId>(DEFAULT_ACCENT_COLOR);
  const [mounted, setMounted] = useState(false);

  // প্রথমবার mount হওয়ার সময় localStorage থেকে পছন্দ লোড করা হয়
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACCENT_THEME_STORAGE_KEY);
      if (stored) {
        setAccentColorState(stored as AccentColorId);
      }
    } catch {
      // localStorage অ্যাক্সেস না থাকলে (private mode ইত্যাদি) silent fail
    }
    setMounted(true);
  }, []);

  // accentColor বা resolvedTheme (light/dark) বদলালে DOM এ প্রয়োগ করা হয়
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;
    applyAccentColor(accentColor, resolvedTheme === "dark");
    try {
      localStorage.setItem(ACCENT_THEME_STORAGE_KEY, accentColor);
    } catch {
      // silent fail
    }
  }, [accentColor, resolvedTheme, mounted]);

  const setAccentColor = useCallback((id: AccentColorId) => {
    setAccentColorState(id);
  }, []);

  const value = useMemo(
    () => ({ accentColor, setAccentColor, mounted }),
    [accentColor, setAccentColor, mounted]
  );

  return (
    <AccentThemeContext.Provider value={value}>{children}</AccentThemeContext.Provider>
  );
}

export function useAccentTheme() {
  const ctx = useContext(AccentThemeContext);
  if (!ctx) {
    throw new Error("useAccentTheme অবশ্যই AccentThemeProvider এর ভেতরে ব্যবহার করতে হবে");
  }
  return ctx;
}
