export interface RouteLabelRule {
  prefix: string;
  label: string;
}

const EXACT_ROUTE_LABELS: Record<string, string> = {
  "/": "HSC Ultimate",
  "/login": "লগইন",
  "/register": "অ্যাকাউন্ট তৈরি",
  "/forgot-password": "পাসওয়ার্ড পুনরুদ্ধার",
  "/reset-password": "নতুন পাসওয়ার্ড",
  "/onboarding": "প্রোফাইল সেটআপ",
  "/dashboard": "ড্যাশবোর্ড",
  "/learn": "পড়াশোনা",
  "/learn/mindmap": "চ্যাপ্টার মাইন্ড ম্যাপ",
  "/learn/smart-book": "স্মার্ট বুক ও হাইলাইটার",
  "/learn/formula-dictionary": "ফর্মুলা ডিকশনারি",
  "/learn/podcourses": "অডিও পডকোর্স ও ট্রান্সক্রিপ্ট",
  "/learn/knowledge-graph": "কনসেপ্ট নলেজ গ্রাফ",
  "/learn/biology-mnemonics": "বায়োলজি নেমোনিক ভল্ট",
  "/practice": "MCQ অনুশীলন",
  "/practice/custom": "কাস্টম এক্সাম মেকার",
  "/practice/formula-match": "স্পিড সূত্র ম্যাচ",
  "/practice/cq-architect": "CQ আর্কিটেক্ট",
  "/practice/cq-evaluator": "AI লিখিত খাতা মূল্যায়ন",
  "/practice/omr": "OMR ও চিট-শিট",
  "/practice/omr-scanner": "স্মার্ট ক্যামেরা OMR স্ক্যানার",
  "/practice/voice-viva": "AI প্র্যাকটিক্যাল ভাইভা",
  "/practice/medical-drill": "মেডিকেল জিকে ও ইংলিশ ড্রিল",
  "/practice/olympiad": "মেগা অলিম্পিয়াড হাব",
  "/adaptive-practice": "স্মার্ট অনুশীলন",
  "/drill": "সময়-নির্ধারিত ড্রিল",
  "/mistake-vault": "মিস্টেক ভল্ট",
  "/cq-practice": "CQ অনুশীলন",
  "/admission": "ভর্তি প্রস্তুতি",
  "/admission/cutoff-predictor": "ভর্তি কাট-অফ প্রেডিক্টর",
  "/mock-exam": "পূর্ণ মডেল টেস্ট",
  "/flashcards": "ফ্ল্যাশকার্ড",
  "/flashcards/ai-generator": "AI ফ্ল্যাশকার্ড জেনারেটর",
  "/formula-search": "ফর্মুলা খোঁজ",
  "/focus": "Strict Focus",
  "/focus/ambient": "অ্যাম্বিয়েন্ট ফোকাস লাউঞ্জ",
  "/focus/study-cafe": "ভার্চুয়াল স্টাডি ক্যাফে",
  "/focus/analytics": "Focus Analytics",
  "/planner": "প্ল্যানার",
  "/planner/sprint": "৩০ দিনের রিভিশন স্প্রিন্ট",
  "/analytics": "পারফরম্যান্স বিশ্লেষণ",
  "/analytics/admission-predictor": "ভর্তি চান্স প্রেডিক্টর",
  "/analytics/circadian": "স্লিপ ও সার্কাডিয়ান রিদম",
  "/lab/periodic-table": "পর্যায় সারণি ল্যাব",
  "/lab/physics": "পদার্থবিজ্ঞান সিমুলেটর ল্যাব",
  "/lab/organic-mechanism": "জৈব বিক্রিয়া মেকানিজম",
  "/lab/conics": "কনিক্স গ্রাফার ল্যাব",
  "/lab/genetics": "জিনতত্ত্ব ও মেন্ডেল ল্যাব",
  "/lab/circuit": "তড়িৎ বর্তনী সার্কিট ল্যাব",
  "/lab/atom-spectrum": "বোর পরমাণু ও স্পেকট্রাম ল্যাব",
  "/lab/le-chatelier": "লা-শাতেলিয়ার নীতি ল্যাব",
  "/lab/matrix": "ম্যাট্রিক্স ও নির্ণায়ক ল্যাব",
  "/lab/satellite": "স্যাটেলাইট ও মহাকর্ষ ল্যাব",
  "/lab/molecular-3d": "3D আণবিক গঠন ল্যাব",
  "/lab/vector-mechanics": "ভেক্টর মেকানিক্স ল্যাব",
  "/badges": "ব্যাজ",
  "/leaderboard": "লিডারবোর্ড",
  "/saved": "সেভ করা টপিক",
  "/notifications": "নোটিফিকেশন",
  "/settings": "সেটিংস",
  "/forum": "কমিউনিটি",
  "/study-group": "স্টাডি গ্রুপ",
  "/study-group/whiteboard": "লাইভ হোয়াইটবোর্ড ও ডাউট রুম",
  "/reading-room": "রিডিং রুম",
  "/reading-room/leaderboard": "রিডিং রুম লিডারবোর্ড",
  "/duel": "কুইজ ডুয়েল",
  "/duel/history": "ডুয়েল ইতিহাস",
  "/quiz-battle": "কুইজ ব্যাটল",
  "/quiz-battle/create": "কুইজ ব্যাটল তৈরি",
  "/quiz-battle/history": "কুইজ ব্যাটল ইতিহাস",
  "/live-exam": "লাইভ পরীক্ষা",
  "/live-exam/start": "লাইভ পরীক্ষা শুরু",
  "/pdf-chat": "PDF চ্যাট",
  "/ai-tutor": "AI প্রশ্নোত্তর",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/account-deletion": "অ্যাকাউন্ট মুছে ফেলা",
  "/feature-disabled": "ফিচার অনুপলব্ধ",
  "/maintenance": "রক্ষণাবেক্ষণ চলছে",
  "/admin": "Admin Dashboard",
  "/admin/analytics": "Admin Analytics",
  "/admin/audit-log": "Audit Log",
  "/admin/broadcast": "Broadcast Center",
  "/admin/content-quality": "Academic Content Quality",
  "/admin/focus": "Focus Operations",
  "/admin/focus/analytics": "Focus Analytics",
  "/admin/forum": "Forum Moderation",
  "/admin/notifications": "Admin Notifications",
  "/admin/reports": "Report Operations",
  "/admin/subjects": "Subject Management",
  "/admin/system": "System Operations",
  "/admin/users": "User Management",
};

// Specific routes must come before their parent module prefix.
const PREFIX_ROUTE_LABELS: RouteLabelRule[] = [
  { prefix: "/practice/result/", label: "অনুশীলনের ফলাফল" },
  { prefix: "/practice/", label: "MCQ অনুশীলন" },
  { prefix: "/learn/", label: "পড়াশোনা" },
  { prefix: "/adaptive-practice/run", label: "স্মার্ট অনুশীলন চলছে" },
  { prefix: "/drill/run", label: "সময়-নির্ধারিত ড্রিল চলছে" },
  { prefix: "/mistake-vault/run", label: "মিস্টেক রিভিশন" },
  { prefix: "/cq-practice/result/", label: "CQ ফলাফল" },
  { prefix: "/cq-practice/", label: "CQ অনুশীলন" },
  { prefix: "/admission/result/", label: "ভর্তি মকের ফলাফল" },
  { prefix: "/admission/run/", label: "ভর্তি মক চলছে" },
  { prefix: "/admission/", label: "ভর্তি প্রস্তুতি" },
  { prefix: "/mock-exam/result/", label: "মডেল টেস্টের ফলাফল" },
  { prefix: "/mock-exam/attempt/", label: "মডেল টেস্ট চলছে" },
  { prefix: "/mock-exam/subject/", label: "মডেল টেস্ট নির্বাচন" },
  { prefix: "/flashcards/", label: "ফ্ল্যাশকার্ড ডেক" },
  { prefix: "/forum/new", label: "নতুন কমিউনিটি পোস্ট" },
  { prefix: "/forum/", label: "কমিউনিটি আলোচনা" },
  { prefix: "/duel/", label: "কুইজ ডুয়েল রুম" },
  { prefix: "/quiz-battle/", label: "কুইজ ব্যাটল রুম" },
  { prefix: "/live-exam/", label: "লাইভ পরীক্ষা" },
  { prefix: "/pdf-chat/", label: "PDF চ্যাট রুম" },
  { prefix: "/u/", label: "Public Study Profile" },
  { prefix: "/admin/subjects/", label: "Subject Management" },
  { prefix: "/admin/chapters/", label: "Chapter Management" },
  { prefix: "/admin/topics/", label: "Topic Management" },
  { prefix: "/admin/", label: "Admin Operations" },
];

export function normalizeRoutePath(pathname: string): string {
  if (!pathname) return "/";
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || "/";
  if (withoutQuery === "/") return "/";
  return withoutQuery.replace(/\/+$/, "") || "/";
}

export function getRouteLabel(pathname: string): string {
  const normalized = normalizeRoutePath(pathname);
  const exact = EXACT_ROUTE_LABELS[normalized];
  if (exact) return exact;
  return PREFIX_ROUTE_LABELS.find((rule) => normalized.startsWith(rule.prefix))?.label ?? "HSC Ultimate";
}

export function getRouteDocumentTitle(pathname: string): string {
  const label = getRouteLabel(pathname);
  return label === "HSC Ultimate" ? "HSC Ultimate" : `${label} | HSC Ultimate`;
}
