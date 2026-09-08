# Premium Loading & Obsidian Prism Theme

## কী পরিবর্তন হয়েছে

- Minimal spinner-based global loading সম্পূর্ণ বাদ।
- Global + মোট ২৬টি route-level loading state একই premium system-এ আনা হয়েছে।
- Strict Focus-এর জন্য dedicated loading profile।
- মোট ১৫টি information-rich module profile: Dashboard, Learning, Practice, Planner, Focus, Flashcards, Exam, CQ, Leaderboard, Duel, Formula, Saved, Settings, Result ও Admin।
- Secure session, progress sync, module preparation—তিনটি meaningful status card।
- Study insight, privacy status, auto-save status ও workspace skeleton preview।
- Indeterminate progress animation—ভুয়া percentage দেখানো হয় না।
- Reduced-motion accessibility support।

## Theme polish

- Dark theme: deeper Obsidian background, violet/fuchsia/cyan prism accents।
- Light theme: pearl/lilac glass surface ও softer luminous border।
- Glass cards: layered translucent surface, top highlight, deeper shadow ও improved saturation।
- Skeleton: brand-tinted premium sweep animation।
- Aurora: তিনটি independent slow-moving glow field।
- Loading background: subtle grid + local embedded noise texture; কোনো external asset নেই।

## Preview fix

Cloud preview domain থেকে Next.js HMR block হওয়ায় page loading state-এ আটকে থাকতে পারত। `next.config.ts`-এ development-only `*.e2b.app` origin support যোগ করা হয়েছে। Preview restart-এর পরে HMR/client chunks স্বাভাবিকভাবে load করবে।

## যাচাই

- Incremental TypeScript: pass
- Cached ESLint: pass, 0 warning
- Unit tests: 25/25 pass
- Production build: 193/193 page generation, exit 0
- Temporary low-memory swap: auto-created and auto-cleaned
