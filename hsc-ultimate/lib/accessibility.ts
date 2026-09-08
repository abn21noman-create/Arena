export type FontSizeScale = "normal" | "large" | "xlarge";

export interface AccessibilityPreferences {
  fontSize: FontSizeScale;
  highContrast: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPreferences = {
  fontSize: "normal",
  highContrast: false,
  reducedMotion: false,
};

export const ACCESSIBILITY_STORAGE_KEY = "hsc-ultimate-accessibility";

export const FONT_SIZE_LABELS: Record<FontSizeScale, string> = {
  normal: "স্বাভাবিক",
  large: "বড়",
  xlarge: "অতিরিক্ত বড়",
};

export const FONT_SIZE_PX: Record<FontSizeScale, number> = {
  normal: 16,
  large: 18,
  xlarge: 20,
};
