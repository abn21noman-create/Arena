// ===================================================================
// Web App Manifest — PWA "Add to Home Screen" এর জন্য প্রয়োজনীয় মেটাডেটা
// -------------------------------------------------------------------
// Next.js 16 এর native app/manifest.ts route — এটা স্বয়ংক্রিয়ভাবে
// /manifest.webmanifest এ সার্ভ হয়, <head> এ manifest link ট্যাগও
// স্বয়ংক্রিয়ভাবে যোগ হয় (আলাদা করে metadata তে বলার দরকার নেই)।
// ===================================================================
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HSC Ultimate — HSC 2028 প্রস্তুতি প্ল্যাটফর্ম",
    short_name: "HSC Ultimate",
    description:
      "Science Group HSC শিক্ষার্থীদের জন্য Learning, AI Doubt Solver, Practice, Flashcards, Planner ও Gamification — সব একসাথে।",
    start_url: "/dashboard",
    // "standalone" = no browser UI, app-like experience
    display: "standalone",
    // Allow URL manipulation (for deep links)
    display_override: ["window-controls-overlay", "standalone", "browser"],
    // Orientation preference
    orientation: "portrait-primary",
    // Theme colors (browser UI theming)
    background_color: "#0a0a0f",
    theme_color: "#8b5cf6",
    // Language
    lang: "bn",
    dir: "ltr",
    // App scope (prevents navigating outside)
    scope: "/",
    // Categories for app stores
    categories: ["education", "productivity", "books"],
    // App icons (multiple sizes for different devices)
    icons: [
      {
        src: "/icons/icon-72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // App shortcuts (long-press app icon → quick actions)
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "হোম",
        description: "তোমার ড্যাশবোর্ড দেখো",
        url: "/dashboard",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "AI Doubt Solver",
        short_name: "AI Tutor",
        description: "AI এর সাথে প্রশ্ন করো",
        url: "/ai-tutor",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Practice",
        short_name: "প্র্যাকটিস",
        description: "MCQ প্র্যাকটিস করো",
        url: "/practice",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Flashcards",
        short_name: "ফ্ল্যাশকার্ড",
        description: "ফ্ল্যাশকার্ড রিভিশন দাও",
        url: "/flashcards",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
    ],
    // Screenshot previews (for app stores)
    screenshots: [
      {
        src: "/screenshots/mobile-dashboard.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Dashboard (Mobile)",
      },
      {
        src: "/screenshots/desktop-dashboard.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "Dashboard (Desktop)",
      },
    ],
    // Non-standard Chromium-only manifest fields are intentionally omitted
    // so the manifest stays portable and fully typed across browsers.
  };
}
