// ===================================================================
// Dynamic Sitemap — SEO-এর জন্য
// -------------------------------------------------------------------
// শুধু public, index-যোগ্য URL অন্তর্ভুক্ত করা হয়েছে।
// Student dashboard, admin, API routes বাদ — এগুলো auth-gated এবং
// search engine-এর জন্য কোনো মূল্য নেই।
// Public profile (`/u/[slug]`) আপাতত list করা হচ্ছে না কারণ
// Prisma query ব্যয়বহুল হবে build-time এ — প্রয়োজন হলে আলাদা
// dynamic route হিসেবে যোগ করা যাবে।
// ===================================================================
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://hsc-ultimate.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/forgot-password`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2026-08-05"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date("2026-08-05"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/account-deletion`,
      lastModified: new Date("2026-08-05"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
