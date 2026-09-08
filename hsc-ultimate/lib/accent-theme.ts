// ===================================================================
// Accent Color Theme — readingroombd.com এর ১০-থিম সিস্টেম থেকে
// অনুপ্রাণিত (docs/RESEARCH_UI_UX_READING_ROOM.md এ বিস্তারিত), কিন্তু
// architecturally নিরাপদ scope এ সীমাবদ্ধ করা হয়েছে।
// -------------------------------------------------------------------
// ⚠️ ডিজাইন সিদ্ধান্ত — কেন পুরো background/foreground palette না বদলে
// শুধু accent color (primary/ring/chart-1/sidebar-primary) বদলানো
// হচ্ছে: কোডবেসে ৭৩টা+ ফাইলে সরাসরি hardcoded `dark:` Tailwind variant
// আছে (dark:bg-input/30, dark:border-input ইত্যাদি) যেগুলো বর্তমান
// light/dark background/border architecture এর উপর নির্ভরশীল। পুরো
// নতুন color palette (নতুন background/card/border shade) চালু করলে এই
// hardcoded override গুলোর সাথে conflict/অসামঞ্জস্য হওয়ার ঝুঁকি
// থাকত। তাই শুধু accent (primary/ring/chart/sidebar-primary) — যেগুলো
// কোথাও `dark:` variant দিয়ে override হয় না (grep করে যাচাই করা
// হয়েছে) — পরিবর্তন করে নিরাপদে ৫টা curated রঙ অফার করা হচ্ছে।
//
// প্রতিটা রঙ Python এ OKLCH->sRGB কনভার্ট করে WCAG AA যাচাই করা হয়েছে
// (scripts/verify-theme-contrast.py এর অনুরূপ পদ্ধতি): primary-
// foreground vs primary >=4.5:1, primary vs background >=3:1 — light
// ও dark উভয় মোডে, সব ৫টা রঙে পাস করেছে।
//
// localStorage persist প্যাটার্ন lib/accessibility.ts এর সাথে
// সামঞ্জস্যপূর্ণ (আলাদা key তে, একই mount+applyToDocument কৌশল)।
// ===================================================================

export type AccentColorId = "default" | "indigo" | "amber" | "maroon" | "forest" | "ocean";

export const ACCENT_THEME_STORAGE_KEY = "hsc-ultimate-accent-color";

// ⚠️ গুরুত্বপূর্ণ: "default" এর light/dark null থাকার মানে এই accent
// system কোনো CSS variable override করে না — established platform এর
// আসল primary রঙ যা globals.css এর :root/.dark এ সেট করা আছে (V15/V16
// ডিজাইন কিট প্রয়োগের পরে এখন violet — light এ `#7c3aed` (violet-600),
// dark এ `#a78bfa` (violet-400)) সেটাই স্বয়ংক্রিয়ভাবে ব্যবহৃত হয়। তাই DEFAULT_ACCENT_COLOR
// অবশ্যই "default" হতে হবে (কোনো override প্রয়োগ না করা) — নাহলে
// বিদ্যমান সব ইউজারের জন্য কিছু না করা সত্ত্বেও UI এর রঙ হঠাৎ বদলে
// যেত, যা একটা silent visual regression হতো। "default" এর label/emoji/
// swatchHex শুধু Settings UI তে দেখানোর জন্য (কোনো CSS প্রভাব নেই),
// তাই globals.css এর primary পরিবর্তনের সাথে সাথে এগুলোও ম্যানুয়ালি
// আপডেট রাখতে হবে (নাহলে picker এ ভুল বর্ণনা দেখাবে)।
export const DEFAULT_ACCENT_COLOR: AccentColorId = "default";

interface AccentColorDefinition {
  id: AccentColorId;
  label: string;
  emoji: string;
  description: string;
  swatchHex: string; // পছন্দ-নির্বাচনের UI তে দেখানোর জন্য approximate hex
  light: { primary: string; ring: string; chart1: string } | null;
  dark: { primary: string; ring: string; chart1: string } | null;
}

// প্রতিটা OKLCH ভ্যালু "L C H" ফরম্যাটে — Reading Room এর ৫টা থিমের
// emoji/নামের সাথে সামঞ্জস্যপূর্ণ রাখা হয়েছে (একই ব্র্যান্ডিং ভাষা)।
// "default" এর light/dark null মানে কোনো CSS variable override হবে না
// (globals.css এর মূল violet primary অপরিবর্তিত থাকবে)।
export const ACCENT_COLORS: AccentColorDefinition[] = [
  {
    id: "default",
    label: "ডিফল্ট (ভায়োলেট)",
    emoji: "🟣",
    description: "প্ল্যাটফর্মের মূল ভায়োলেট ব্র্যান্ড থিম",
    swatchHex: "#6d28d9",
    light: null,
    dark: null,
  },
  {
    id: "indigo",
    label: "ক্লাসিক ইন্ডিগো",
    emoji: "🔷",
    description: "প্রাণবন্ত, পেশাদার নীলচে-বেগুনি রঙ",
    swatchHex: "#4f46e5",
    light: { primary: "0.45 0.19 264", ring: "0.55 0.19 264", chart1: "0.45 0.19 264" },
    dark: { primary: "0.72 0.17 264", ring: "0.72 0.17 264", chart1: "0.72 0.17 264" },
  },
  {
    id: "amber",
    label: "Lo-fi অ্যাম্বার",
    emoji: "🎧",
    description: "উষ্ণ, কোজি ক্যাফের অনুভূতি (Reading Room এর Lo-fi ক্যাফে থিমের রঙ)",
    swatchHex: "#b55000",
    light: { primary: "0.55 0.16 55", ring: "0.55 0.16 55", chart1: "0.55 0.16 55" },
    dark: { primary: "0.75 0.14 60", ring: "0.75 0.14 60", chart1: "0.75 0.14 60" },
  },
  {
    id: "maroon",
    label: "ডার্ক একাডেমিয়া",
    emoji: "🕯️",
    description: "গভীর, রহস্যময় লাইব্রেরির অনুভূতি",
    swatchHex: "#8d1a1e",
    light: { primary: "0.42 0.15 25", ring: "0.42 0.15 25", chart1: "0.42 0.15 25" },
    dark: { primary: "0.68 0.14 30", ring: "0.68 0.14 30", chart1: "0.68 0.14 30" },
  },
  {
    id: "forest",
    label: "ফরেস্ট গ্রিন",
    emoji: "📚",
    description: "শান্ত, প্রশান্তিদায়ক (Reading Room এর কোজি লাইব্রেরি থিমের রঙ)",
    swatchHex: "#00682a",
    light: { primary: "0.45 0.13 150", ring: "0.45 0.13 150", chart1: "0.45 0.13 150" },
    dark: { primary: "0.72 0.13 150", ring: "0.72 0.13 150", chart1: "0.72 0.13 150" },
  },
  {
    id: "ocean",
    label: "ওশান ব্লু",
    emoji: "🌧️",
    description: "সতেজ, ফোকাসড অনুভূতি (Reading Room এর বৃষ্টিভেজা জানালা থিমের রঙ)",
    swatchHex: "#005eb3",
    light: { primary: "0.48 0.16 250", ring: "0.48 0.16 250", chart1: "0.48 0.16 250" },
    dark: { primary: "0.72 0.13 235", ring: "0.72 0.13 235", chart1: "0.72 0.13 235" },
  },
];

export function getAccentColorById(id: string): AccentColorDefinition {
  return ACCENT_COLORS.find((c) => c.id === id) ?? ACCENT_COLORS[0];
}

/**
 * বর্তমান light/dark mode অনুযায়ী accent color এর CSS variable গুলো
 * <html> এলিমেন্টে বসিয়ে দেয়। "default" হলে কোনো override না করে
 * বিদ্যমান inline override (থাকলে) মুছে ফেলে (resetAccentColor এর
 * সমতুল্য) — যাতে থিম বদলানোর সময় আগেরটা "লেগে" না থাকে।
 * primary-foreground ও sidebar-primary-foreground সবসময় উচ্চ-কনট্রাস্ট
 * সাদা/কালোতে রাখা হয় (primary এর lightness অনুযায়ী স্বয়ংক্রিয়ভাবে
 * নির্বাচিত — গাণিতিকভাবে pre-verify করা হয়েছে সব ৫টা রঙে AA পাস করে)।
 */
export function applyAccentColor(accentId: AccentColorId, isDark: boolean) {
  const accent = getAccentColorById(accentId);
  const mode = isDark ? accent.dark : accent.light;

  if (!mode) {
    resetAccentColor();
    return;
  }

  const root = document.documentElement;
  const primaryValue = `oklch(${mode.primary})`;
  const ringValue = `oklch(${mode.ring})`;
  const chart1Value = `oklch(${mode.chart1})`;

  // primary এর lightness অনুযায়ী foreground টেক্সট রঙ নির্ধারণ (contrast maximize)
  const lightness = parseFloat(mode.primary.split(" ")[0]);
  const foregroundValue = lightness < 0.6 ? "oklch(0.98 0 0)" : "oklch(0.15 0 0)";

  root.style.setProperty("--primary", primaryValue);
  root.style.setProperty("--primary-foreground", foregroundValue);
  root.style.setProperty("--ring", ringValue);
  root.style.setProperty("--chart-1", chart1Value);
  root.style.setProperty("--sidebar-primary", primaryValue);
  root.style.setProperty("--sidebar-primary-foreground", foregroundValue);
  root.style.setProperty("--sidebar-ring", ringValue);
}


/** ডিফল্টে ফিরিয়ে আনতে (globals.css এর মূল :root/.dark ভ্যালুতে) — inline style সরিয়ে দেয় */
export function resetAccentColor() {
  const root = document.documentElement;
  for (const prop of [
    "--primary",
    "--primary-foreground",
    "--ring",
    "--chart-1",
    "--sidebar-primary",
    "--sidebar-primary-foreground",
    "--sidebar-ring",
  ]) {
    root.style.removeProperty(prop);
  }
}

export function getStoredAccentColor(): AccentColorId {
  if (typeof window === "undefined") return DEFAULT_ACCENT_COLOR;
  const stored = localStorage.getItem(ACCENT_THEME_STORAGE_KEY) as AccentColorId;
  return ACCENT_COLORS.some((c) => c.id === stored) ? stored : DEFAULT_ACCENT_COLOR;
}

export function setStoredAccentColor(color: AccentColorId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCENT_THEME_STORAGE_KEY, color);
}

