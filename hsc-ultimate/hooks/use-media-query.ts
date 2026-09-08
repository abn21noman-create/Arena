"use client";

// ===================================================================
// useMediaQuery — Responsive design hook
// -------------------------------------------------------------------
// Real-time reactive matchMedia hook for responsive components.
// Returns true if the media query matches, false otherwise.
//
// Usage:
//   const isMobile = useMediaQuery("(max-width: 768px)");
//   const isDark = useMediaQuery("(prefers-color-scheme: dark)");
//
// SSR-safe: returns initialValue during SSR, then updates on client.
// ===================================================================
import { useEffect, useState } from "react";

export function useMediaQuery(query: string, initialValue = false): boolean {
  const [matches, setMatches] = useState(initialValue);

  useEffect(() => {
    // Check if matchMedia is supported (SSR safety)
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern API
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use addEventListener (modern) instead of addListener (deprecated)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

// ===================================================================
// Predefined breakpoint hooks (Tailwind defaults)
// ===================================================================

/** Mobile: < 640px */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 639px)");
}

/** Tablet: 640px - 1023px */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
}

/** Mobile + Tablet (anything below desktop): < 1024px */
export function useIsMobileOrTablet(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

/** Desktop: >= 1024px */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

/** Large desktop: >= 1280px */
export function useIsLargeDesktop(): boolean {
  return useMediaQuery("(min-width: 1280px)");
}

/** User prefers dark mode */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

/** User prefers reduced motion (accessibility) */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Device is in landscape mode */
export function useIsLandscape(): boolean {
  return useMediaQuery("(orientation: landscape)");
}

/** Device is touch-capable (mobile/tablet) */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const legacyNavigator = navigator as Navigator & { msMaxTouchPoints?: number };
    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (legacyNavigator.msMaxTouchPoints ?? 0) > 0
    );
  }, []);
  return isTouch;
}

/** Network connection type (slow connections) */
export function useIsSlowConnection(): boolean {
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => {
    if (typeof navigator === "undefined" || !("connection" in navigator)) {
      return;
    }
    const networkNavigator = navigator as Navigator & {
      connection?: { effectiveType?: string };
      mozConnection?: { effectiveType?: string };
      webkitConnection?: { effectiveType?: string };
    };
    const connection =
      networkNavigator.connection ||
      networkNavigator.mozConnection ||
      networkNavigator.webkitConnection;
    if (!connection?.effectiveType) return;
    const slowTypes = ["slow-2g", "2g", "3g"];
    setIsSlow(slowTypes.includes(connection.effectiveType));
  }, []);
  return isSlow;
}
