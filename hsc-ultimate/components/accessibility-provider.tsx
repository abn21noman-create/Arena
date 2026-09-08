"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFS,
  FONT_SIZE_PX,
  type AccessibilityPreferences,
  type FontSizeScale,
} from "@/lib/accessibility";

interface AccessibilityContextValue extends AccessibilityPreferences {
  setFontSize: (size: FontSizeScale) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  mounted: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function applyToDocument(prefs: AccessibilityPreferences) {
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-size", `${FONT_SIZE_PX[prefs.fontSize]}px`);
  root.classList.toggle("high-contrast", prefs.highContrast);
  root.classList.toggle("reduced-motion", prefs.reducedMotion);
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(DEFAULT_ACCESSIBILITY_PREFS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AccessibilityPreferences>;
        setPrefs({
          fontSize: parsed.fontSize ?? DEFAULT_ACCESSIBILITY_PREFS.fontSize,
          highContrast: parsed.highContrast ?? false,
          reducedMotion: parsed.reducedMotion ?? false,
        });
      }
    } catch {
      // Invalid/blocked local storage falls back to safe defaults.
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyToDocument(prefs);
    try {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Preferences remain active for this page even when persistence fails.
    }
  }, [prefs, mounted]);

  const setFontSize = useCallback((fontSize: FontSizeScale) => {
    setPrefs((current) => ({ ...current, fontSize }));
  }, []);
  const toggleHighContrast = useCallback(() => {
    setPrefs((current) => ({ ...current, highContrast: !current.highContrast }));
  }, []);
  const toggleReducedMotion = useCallback(() => {
    setPrefs((current) => ({ ...current, reducedMotion: !current.reducedMotion }));
  }, []);

  const value = useMemo(
    () => ({ ...prefs, setFontSize, toggleHighContrast, toggleReducedMotion, mounted }),
    [prefs, setFontSize, toggleHighContrast, toggleReducedMotion, mounted]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const value = useContext(AccessibilityContext);
  if (!value) throw new Error("useAccessibility অবশ্যই AccessibilityProvider-এর ভেতরে ব্যবহার করতে হবে");
  return value;
}
