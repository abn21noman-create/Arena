// ===================================================================
// Robots.txt — Search engine crawler rules
// -------------------------------------------------------------------
// Public pages (landing, auth, public profile) crawl-যোগ্য।
// Student dashboard / admin / API সব disallow — auth লাগে, index
// করার দরকার নেই এবং SEO-তে ক্ষতিকর (duplicate, low-value)।
// ===================================================================
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/privacy",
          "/terms",
          "/account-deletion",
          "/u/",
        ],
        disallow: [
          "/dashboard",
          "/learn",
          "/practice",
          "/flashcards",
          "/planner",
          "/settings",
          "/saved",
          "/badges",
          "/leaderboard",
          "/analytics",
          "/ai-tutor",
          "/cq-practice",
          "/mock-exam",
          "/live-exam",
          "/duel",
          "/quiz-battle",
          "/study-group",
          "/reading-room",
          "/pdf-chat",
          "/admission",
          "/mistake-vault",
          "/drill",
          "/adaptive-practice",
          "/notifications",
          "/forum",
          "/formula-search",
          "/admin",
          "/api",
        ],
      },
    ],
    sitemap: `${process.env.NEXTAUTH_URL || "https://hsc-ultimate.app"}/sitemap.xml`,
  };
}
