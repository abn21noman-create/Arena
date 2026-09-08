// ===================================================================
// শেয়ার্ড নেভিগেশন visibility/active-state হেল্পার
// -------------------------------------------------------------------
// আগে এই লজিক শুধু components/layout/bottom-nav-bar.tsx (মোবাইল) এ
// ছিল। এখন components/layout/app-sidebar.tsx (ডেস্কটপ/ট্যাবলেট) ও
// একই লজিক ব্যবহার করে — DRY রাখতে এক জায়গায় বের করে আনা হলো, যাতে
// দুটো নেভিগেশন UI কখনো ভিন্ন আচরণ না করে (যেমন quiz/exam চলাকালীন
// দুটোই hide হওয়া উচিত, একইভাবে)।
// ===================================================================

// এই প্রিফিক্সগুলোতে nav chrome (bottom nav / sidebar) দেখানো হয় না —
// focused full-screen অভিজ্ঞতা (পরীক্ষা/কুইজ চলাকালীন ভুলবশত ট্যাব
// চেপে বের হয়ে যাওয়া এড়াতে), অথবা ইতিমধ্যে নিজস্ব নেভিগেশন আছে
// (Admin sidebar)
export const NAV_HIDDEN_PREFIXES = [
  "/admin",
  "/ai-tutor",
  "/practice/result",
  "/mock-exam/attempt",
  "/mock-exam/result",
  "/adaptive-practice/run",
  "/drill/run",
  "/cq-practice/result",
  "/admission/run",
  "/admission/result",
  "/mistake-vault/run",
  "/duel/", // /duel/[duelId] লাইভ ম্যাচ — /duel ও /duel/history বাদে
  "/quiz-battle/", // /quiz-battle/[battleId] লাইভ ম্যাচ — লিস্ট পেজ বাদে
  "/live-exam/", // /live-exam/[sessionId] লাইভ পরীক্ষা — লিস্ট পেজ বাদে
  "/pdf-chat/", // /pdf-chat/[documentId] চ্যাট রুম — লিস্ট পেজ বাদে
];

// উপরের রুল অনুযায়ী trailing-slash প্যাটার্নের ব্যতিক্রম (লিস্ট/হিস্ট্রি
// পেজ, এগুলোতে nav chrome দেখানো উচিত)
export const NAV_EXCEPTION_EXACT_PATHS = [
  "/duel",
  "/duel/history",
  "/quiz-battle",
  "/quiz-battle/history",
  "/quiz-battle/create",
  "/live-exam",
  "/live-exam/start",
  "/pdf-chat",
];

export function shouldHideNavChrome(pathname: string): boolean {
  if (NAV_EXCEPTION_EXACT_PATHS.includes(pathname)) return false;
  return NAV_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
