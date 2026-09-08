// ===================================================================
// Protected Route Prefixes — শেয়ার্ড কনস্ট্যান্ট
// -------------------------------------------------------------------
// আগে এই লিস্টটা শুধু proxy.ts এ hardcoded ছিল। Bottom Navigation Bar
// ফিচারের জন্য client component (components/layout/bottom-nav-bar.tsx)
// এও একই তথ্য (কোন রুটগুলো লগইন-প্রয়োজন "মূল অ্যাপ" রুট) দরকার হয়েছে
// — DRY রাখতে এখানে একটা pure array হিসেবে বের করে আনা হলো (কোনো
// server-only import নেই, তাই Edge middleware ও client component
// দুটোতেই নিরাপদে import করা যায়)।
//
// ⚠️ সতর্কতা: নতুন কোনো protected রুট যোগ করলে এখানে যোগ করতে হবে,
// এবং proxy.ts এর `config.matcher` এও যোগ করতে হবে (আগে এই দুটো
// আলাদা জায়গায় maintain হতো এবং `/notifications` matcher এ মিস হয়ে
// গিয়েছিল — এই রিফ্যাক্টরের পরেও matcher আলাদা রাখতে হচ্ছে কারণ
// Next.js এর matcher স্ট্যাটিক্যালি analyzable string literal array
// প্রত্যাশা করে, রানটাইমে import করা variable থেকে জেনারেট করা যায় না)।
// ===================================================================
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/learn",
  "/practice",
  "/flashcards",
  "/planner",
  "/badges",
  "/leaderboard",
  "/ai-tutor", // chat history এখন DB তে persist হয়, তাই লগইন লাগবে
  "/analytics",
  "/cq-practice",
  "/forum",
  "/settings", // প্রোফাইল/পাসওয়ার্ড/থিম সেটিংস — লগইন লাগবে
  "/saved", // সেভ করা টপিক লিস্ট
  "/mock-exam", // Full Mock Exam
  "/study-group", // Study Group/Party System
  "/duel", // Peer Quiz Duel
  "/pdf-chat", // PDF Chat (RAG) — নিজের নোট/বই নিয়ে AI এর সাথে চ্যাট
  "/live-exam", // Custom Question Set + Solo Live Exam
  "/quiz-battle", // Multi-person room-code Quiz Battle
  "/adaptive-practice", // দুর্বল টপিক-ভিত্তিক Smart Practice
  "/drill", // Timed Drill Mode (speed practice)
  "/admission", // Admission Prep (Medical/BUET/DU) — HSC এর বাইরের আলাদা সেকশন
  "/notifications", // Notification Center — সম্পূর্ণ নোটিফিকেশন হিস্ট্রি (pagination+filter)
  "/reading-room", // Virtual Study Room (Body Doubling) — presence+heartbeat লগইন-নির্ভর
  // 🐛 বাগ ফিক্স (এই সেশনে আবিষ্কৃত, established `/notifications` matcher
  // bug এর একই ক্লাস): এই দুটো রুটের page.tsx এ page-level `redirect()`
  // থাকায় ডেটা leak হতো না, কিন্তু এই লিস্ট ও proxy.ts এর matcher এ
  // মিসিং থাকায় unauthenticated অ্যাক্সেসে middleware-level ৩০৭ redirect
  // এর বদলে HTTP ২০০ + client-side meta-refresh redirect হতো (ধীর, এবং
  // অন্য সব প্রোটেক্টেড রুটের সাথে ইনকনসিসটেন্ট আচরণ)।
  "/mistake-vault", // মিস্টেক ভল্ট — ভুল করা প্রশ্নের রিভিশন
  "/formula-search", // Formula Quick Search — সব বিষয়ের সূত্র এক জায়গা থেকে খোঁজা
  "/focus", // Consent-based Strict Focus / Android app blocker
] as const;
