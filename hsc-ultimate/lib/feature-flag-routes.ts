const PAGE_PREFIXES: Record<string, string> = {
  "ai-tutor": "/ai-tutor",
  forum: "/forum",
  "study-group": "/study-group",
  "reading-room": "/reading-room",
  duel: "/duel",
  "quiz-battle": "/quiz-battle",
  "pdf-chat": "/pdf-chat",
  "live-exam": "/live-exam",
  focus: "/focus",
};

const API_PREFIXES: Record<string, string[]> = {
  "ai-tutor": ["/api/ai-chat", "/api/user/ai-tutor-mode"],
  forum: ["/api/forum"],
  "study-group": ["/api/study-group"],
  "reading-room": ["/api/reading-room"],
  duel: ["/api/duel"],
  "quiz-battle": ["/api/quiz-battle"],
  "pdf-chat": ["/api/pdf-chat"],
  "live-exam": ["/api/live-exam", "/api/custom-question-sets"],
  focus: ["/api/focus", "/api/native-devices"],
};

/** Returns the operational feature flag for both page and student API paths. */
export function getFeatureFlagForPath(pathname: string): string | null {
  for (const [key, prefix] of Object.entries(PAGE_PREFIXES)) {
    if (pathname.startsWith(prefix)) return key;
  }
  for (const [key, prefixes] of Object.entries(API_PREFIXES)) {
    if (prefixes.some((prefix) => pathname.startsWith(prefix))) return key;
  }
  return null;
}

export const TOGGLEABLE_FEATURE_KEYS = Object.freeze(Object.keys(PAGE_PREFIXES));
