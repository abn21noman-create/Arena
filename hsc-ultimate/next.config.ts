import type { NextConfig } from "next";

const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Agent/cloud preview hosts change per sandbox. Wildcard support keeps HMR
  // and client chunks working instead of leaving the browser on loading UI.
  allowedDevOrigins: ["*.e2b.app"],

  // Keep peak build memory below small CI/sandbox limits.
  experimental: {
    cpus: 1,
    webpackMemoryOptimizations: true,
    // Hard platform-level cap for proxy-matched API bodies; route guards apply
    // stricter 1/8 MB limits where appropriate.
    proxyClientMaxBodySize: "25mb",
  },

  // Docker runner copies `.next/standalone`; keep build output aligned.
  output: "standalone",

  // pdf-parse (PDF Chat ফিচারের জন্য) সার্ভারে ঠিকমতো worker ফাইল লোড করতে
  // পারার জন্য external package হিসেবে চিহ্নিত করা দরকার (Turbopack/Webpack
  // bundling এড়িয়ে সরাসরি node_modules থেকে require করার জন্য)
  serverExternalPackages: ["pdf-parse"],

  // Performance: ভারী components (recharts, framer-motion, math text) কে
  // dynamic import করা হবে যাতে initial bundle ছোট থাকে
  // (এগুলো প্রথম page load-এ দরকার নেই, lazy load হবে)
  // এটা app/*/*.tsx এ dynamic() দিয়ে করা হচ্ছে

  // Production: gzip/brotli compression enable (smaller response size)
  // Note: Next.js 13+ has built-in compression, but we ensure it's on
  compress: true,

  // Production source maps disable (smaller build, faster deploy)
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images aggressively
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Route-level caching hints (where safe)
  // Static assets: long cache, immutable
  // API responses: short cache with stale-while-revalidate
  async headers() {
    return [
      // Service Worker (no cache — নতুন deploy এ পুরনো SW ব্যবহার হতে পারে)
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },

      // Icons, images (30 days)
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // Security hardening (সব route-এ)
      {
        source: "/:path*",
        headers: [
          // Clickjacking protection
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // MIME-sniffing protection
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          // CSP starts report-only to inventory third-party requirements before
          // enforcement; it cannot break the current app/preview.
          { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
          // Referrer leak protection
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Camera/microphone/geolocation permissions
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          // HSTS (HTTPS-only, 1 year)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
