import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali, Geist_Mono, Baloo_Da_2 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/app/providers";
import { PWARegister } from "@/components/pwa-register";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { OfflineSyncIndicator } from "@/components/shared/offline-sync-indicator";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AnnouncementBanner } from "@/components/shared/announcement-banner";
import { CapacitorInit } from "@/components/shared/capacitor-init";
import { FocusEnforcer } from "@/components/focus/focus-enforcer";
import { GlobalSearch } from "@/components/layout/global-search";
import { RouteExperience } from "@/components/layout/route-experience";
import { ScientificCalculatorDialog } from "@/components/shared/scientific-calculator";
import { KeyboardShortcutsDialog } from "@/components/shared/keyboard-shortcuts-dialog";
import { ConfettiCanvas } from "@/components/shared/confetti";

// ═══════════════════════════════════════════════════════════════
// টাইপোগ্রাফি স্ট্যাক — Inter Variable + Noto Sans Bengali Variable
// ───────────────────────────────────────────────────────────────
// আগে Anek Bangla ছিল। মাপা ফলাফলের ভিত্তিতে Noto Sans Bengali এ
// সরানো হলো (dark mode এ stroke coverage / "কালি%" পরিমাপ):
//
//   Noto Sans Bengali  1.30%  ← সর্বোচ্চ (সবচেয়ে স্পষ্ট)  প্রস্থ 1.00×
//   Anek Bangla        1.27%  (আগের ফন্ট)                  প্রস্থ 1.00×
//   Tiro Bangla        1.18%   ·  Baloo Da 2  1.16%
//   Mina               1.12%   ·  Hind Siliguri 1.07% ← সর্বনিম্ন
//
// কেন Noto Sans Bengali:
//   • Google এর অফিসিয়াল বাংলা ফন্ট — সম্পূর্ণ Unicode কভারেজ
//     (যুক্তাক্ষর, রেফ, হসন্ত সবই সঠিক রেন্ডার হয়)
//   • variable wght ১০০–৯০০ — আমাদের ৪০০/৫০০/৬০০/৭০০/৮০০ স্কেল কভার
//   • High-DPI/4K স্ক্রিনে শার্প, dark mode এ সবচেয়ে পরিষ্কার
//
// ⚠️ IBM Plex Sans Bengali ব্যবহার করা যায়নি — Google Fonts এ সেটা
//    **নেই** (HTTP 404 দিয়ে যাচাই করা; শুধু Devanagari সংস্করণ আছে)।
//
// লাতিন অক্ষর/সংখ্যার জন্য Inter — ফলব্যাক ক্রমে Inter আগে থাকায়
// ইংরেজি ও সংখ্যা Inter এ, বাংলা Noto Sans Bengali এ রেন্ডার হয়।
// ═══════════════════════════════════════════════════════════════
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// হেডিং-ও একই পরিবার (আলাদা CSS variable এ) — hierarchy তৈরি হয় শুধু
// weight/tracking দিয়ে, আলাদা display ফন্ট দিয়ে নয় (V16 কিটের রীতি)।
const notoSansBengaliHeading = Noto_Sans_Bengali({
  variable: "--font-heading-bangla",
  subsets: ["bengali", "latin"],
  weight: ["600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Baloo Da 2 — প্রিমিয়াম "Duolingo/Hugging-Face-স্টাইল" গোলগাল, বন্ধুত্বপূর্ণ
// কিন্তু আত্মবিশ্বাসী Display ফন্ট (বাংলা+লাতিন দুটোতেই সাপোর্ট করে, Google
// Fonts এর একমাত্র জনপ্রিয় বাংলা display typeface)। শুধু হেডিং/টাইটেল/CTA
// তে ব্যবহার করা হয় (body text এখনো Hind Siliguri — readability এর জন্য) —
// এই "double-font" প্যাটার্নটাই প্রিমিয়াম SaaS ব্র্যান্ডিং এর প্রচলিত রীতি
// (হেডলাইনে personality-heavy display font, বডিতে neutral readable font)।
const balooDa2 = Baloo_Da_2({
  variable: "--font-display-alt",
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "HSC Ultimate | HSC 2028 এর জন্য অল-ইন-ওয়ান প্রস্তুতি প্ল্যাটফর্ম",
    template: "%s | HSC Ultimate",
  },
  description:
    "Science Group HSC শিক্ষার্থীদের জন্য Learning, AI Doubt Solver, Practice, Flashcards, Planner ও Gamification — সব একসাথে।",
  manifest: "/manifest.webmanifest",
  applicationName: "HSC Ultimate",
  keywords: [
    "HSC",
    "HSC 2028",
    "Bangladesh",
    "Education",
    "SSC",
    "NCTB",
    "Physics",
    "Chemistry",
    "Biology",
    "Math",
    "Bangla",
    "PWA",
  ],
  authors: [{ name: "HSC Ultimate Team" }],
  creator: "HSC Ultimate",
  publisher: "HSC Ultimate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Open Graph (social sharing)
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://hsc-ultimate.app",
    siteName: "HSC Ultimate",
    title: "HSC Ultimate - HSC 2028 এর প্রস্তুতি",
    description: "AI-powered HSC preparation platform for Science Group students",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "HSC Ultimate Logo",
      },
    ],
  },
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "HSC Ultimate - HSC 2028",
    description: "AI-powered HSC preparation platform",
    images: ["/icons/icon-512.png"],
  },
  // PWA + iOS specific
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HSC Ultimate",
    startupImage: [
      // iPhone X/XS (1125x2436)
      { url: "/icons/apple-launch-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px)" },
      // iPhone XR (828x1792)
      { url: "/icons/apple-launch-828x1792.png", media: "(device-width: 414px) and (device-height: 896px)" },
    ],
  },
  // Other mobile-specific
  category: "Education",
  classification: "Education",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  // Essential for mobile responsive behavior
  // - width=device-width: respect device width (not desktop 980px)
  // - initialScale=1: prevent auto-zoom on page load
  // - maximumScale=5: allow zoom up to 5x (accessibility)
  // - userScalable=true: respect user zoom preferences
  // - viewportFit=cover: extend behind iOS notch (for full-screen PWA)
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  // Theme colors (for browser UI theming)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  // Color scheme (helps browser render form controls, scrollbars)
  colorScheme: "light dark",
};

// ... (Metadata and Fonts keep same)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansBengali.variable} ${notoSansBengaliHeading.variable} ${geistMono.variable} ${balooDa2.variable} h-full antialiased`}
    >
      <head>
        {/* Theme bootstrap — runs BEFORE React hydrates, prevents FOUC
            (Flash of Unstyled Content / wrong theme flash on load).
            Reads localStorage "theme" or falls back to system preference.
            Adds .dark or .light class on <html> before any CSS is applied. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored || 'system';
                  var resolved;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } else {
                    resolved = theme;
                  }
                  if (resolved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else if (resolved === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                  document.documentElement.style.colorScheme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
        <div className="aurora-bg" />
        <a href="#main-content" className="skip-to-content">
          মূল কনটেন্টে যাও
        </a>
        <Providers>
          <div className="flex flex-1 min-h-full w-full relative z-10">
            <AppSidebar />
            <div id="main-content" tabIndex={-1} className="flex-1 min-w-0 flex flex-col">
              <AnnouncementBanner />
              {children}
            </div>
          </div>
          <RouteExperience />
          <GlobalSearch />
          <ScientificCalculatorDialog />
          <KeyboardShortcutsDialog />
          <ConfettiCanvas />
          <Toaster richColors position="top-center" />
          <CapacitorInit />
          <PWARegister />
          <PWAInstallPrompt />
          <OfflineSyncIndicator />
          <FocusEnforcer />
          <BottomNavBar />
        </Providers>
      </body>
    </html>
  );
}
