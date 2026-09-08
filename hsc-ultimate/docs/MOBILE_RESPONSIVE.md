# 📱 Mobile & Responsive Design Guide

HSC Ultimate is built mobile-first, ensuring excellent experience on
phones, tablets, and desktops. This guide explains our approach.

## 🎯 Design Philosophy

**Mobile-first**, then enhanced for larger screens:
1. **Phones** (320-640px) — primary use case (60%+ of Bangladeshi users)
2. **Tablets** (640-1024px) — secondary (study at home)
3. **Desktops** (1024px+) — full layout with sidebar

## 📐 Tailwind Breakpoints

```javascript
// Tailwind defaults
sm: 640px   // Small tablets, large phones (landscape)
md: 768px   // Tablets
lg: 1024px  // Desktops, small laptops
xl: 1280px  // Large desktops
2xl: 1536px // Extra large screens
```

## 🏗️ Layout Strategy

### Mobile (< 1024px)
- **Bottom navigation bar** (Duolingo-style) — 5 main shortcuts
- **Hamburger menu** for full navigation
- **Single column** layouts
- **Stacked cards** (vertical)
- **Full-width** buttons
- **Bottom sheets** for modals

### Desktop (≥ 1024px)
- **Sidebar navigation** (collapsible)
- **Multi-column** grids
- **Floating action buttons** (FAB)
- **Modal dialogs** centered
- **Table layouts** for data

## 📁 File Structure (Mobile-Responsive)

```
components/
├── layout/
│   ├── bottom-nav-bar.tsx     # Mobile only (lg:hidden)
│   ├── app-sidebar.tsx        # Desktop only (hidden lg:block)
│   ├── global-search.tsx      # Both
│   └── notification-bell.tsx  # Both
├── motion/
│   └── fade-in.tsx           # Animations (respects prefers-reduced-motion)
└── shared/
    └── mobile-detect.tsx      # Client-side mobile detection hook
```

## 🎯 Mobile-Specific Components

### BottomNavBar (`components/layout/bottom-nav-bar.tsx`)
- 5 main shortcuts: Home, Learn, Practice, Planner, More
- `hidden lg:hidden` — only shows on mobile
- Safe area inset for iOS notch
- `aria-label` and `aria-current` for accessibility
- Keyboard navigation support

### AppSidebar (`components/layout/app-sidebar.tsx`)
- `hidden lg:block` — only shows on desktop
- Collapsible on smaller screens
- Categorized navigation (Practice / Learning / Social / Tools)

### MoreMenuSheet
- Mobile: bottom sheet
- Desktop: dropdown menu
- All 30+ modules accessible

## 🛠️ Mobile Optimization Techniques

### 1. iOS Auto-Zoom Prevention
```css
input, textarea, select, button {
  font-size: max(16px, 1rem);  /* iOS won't zoom on focus */
}
```

### 2. Touch Target Sizing (WCAG 2.1)
- Minimum 44x44px (`.touch-target` class)
- Buttons: `h-11 w-11` (44px) minimum
- Spacing: `min-h-[44px]`

### 3. Safe Area Support
```css
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
```
Used in bottom nav for iPhone notch / home indicator.

### 4. Tap Highlight
```css
-webkit-tap-highlight-color: rgba(16, 185, 129, 0.1);
```
Subtle green tap feedback (matches theme).

### 5. Scroll Snap
```css
.scroll-snap {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```
Smooth momentum scrolling on iOS.

## 🎨 Viewport Configuration

```typescript
// app/layout.tsx
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,           // Allow zoom (accessibility)
  userScalable: true,        // Respect user preferences
  viewportFit: "cover",      // iOS notch support
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  colorScheme: "light dark",
};
```

## 📲 PWA (Progressive Web App)

### Install Capabilities
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS (Safari 16.4+)
- ✅ Desktop (Chrome, Edge, Safari)
- ✅ Windows (Edge, Chrome)

### Manifest Features
```json
{
  "name": "HSC Ultimate",
  "short_name": "HSC Ultimate",
  "display": "standalone",  // No browser UI
  "orientation": "portrait-primary",
  "theme_color": "#8b5cf6",
  "background_color": "#0a0a0f",
  "icons": [...10 sizes 72-512px],
  "shortcuts": [Dashboard, AI Tutor, Practice, Flashcards],
  "categories": ["education", "productivity"]
}
```

### App Shortcuts (long-press app icon)
- 🏠 Dashboard
- 🤖 AI Tutor
- 📚 Practice
- 🃏 Flashcards

## ♿ Accessibility (a11y)

### Implemented
- ✅ Skip to main content link
- ✅ Focus visible (`:focus-visible`)
- ✅ ARIA labels on icons
- ✅ `lang="bn"` for Bangla content
- ✅ Semantic HTML (`<main>`, `<header>`, `<nav>`, `<article>`)
- ✅ Color contrast WCAG AA
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ `prefers-reduced-motion` support
- ✅ `prefers-color-scheme` support
- ✅ `prefers-contrast: more` enhanced borders

### Hooks for Responsive Behavior
```typescript
import {
  useIsMobile,        // < 640px
  useIsTablet,        // 640-1023px
  useIsDesktop,       // >= 1024px
  useIsTouchDevice,   // touch-capable
  useIsLandscape,     // orientation
  usePrefersDarkMode, // color scheme
  usePrefersReducedMotion, // accessibility
  useIsSlowConnection, // save data
} from "@/hooks/use-media-query";
```

## 📊 Performance Optimizations (Mobile-specific)

### CSS
- Disabled `.aurora-bg` animation on mobile (battery saving)
- Reduced `backdrop-filter` blur on small screens
- `print` media query to disable expensive effects

### JavaScript
- Dynamic imports for heavy components (Recharts, KaTeX)
- Lazy loading via `next/dynamic`
- Service worker caching (1 year for static assets)

### Images
- AVIF/WebP formats (smaller than JPEG/PNG)
- Responsive sizes (`deviceSizes` in next.config.ts)
- 30-day image cache

## 🧪 Testing Across Devices

### Manual Testing Checklist
- [ ] iPhone SE (375x667) — iOS Safari
- [ ] iPhone 14 (390x844) — iOS Safari
- [ ] iPhone 14 Pro Max (430x932) — iOS Safari
- [ ] Samsung Galaxy S22 (360x800) — Android Chrome
- [ ] iPad (768x1024) — iPadOS Safari
- [ ] iPad Pro (1024x1366) — iPadOS Safari
- [ ] MacBook (1280x800) — Safari
- [ ] Desktop (1920x1080) — Chrome
- [ ] 4K (3840x2160) — Chrome

### Tools
- **Chrome DevTools** — Device mode (Cmd+Shift+M)
- **Firefox** — Responsive Design Mode
- **BrowserStack** — Real device testing
- **Lighthouse** — Mobile performance audit
- **axe DevTools** — Accessibility audit

## 🐛 Common Mobile Pitfalls (Avoided)

| Pitfall | Our Solution |
|---------|--------------|
| iOS auto-zoom on input | `font-size: max(16px, 1rem)` |
| Tap highlight too aggressive | Custom `-webkit-tap-highlight-color` |
| Horizontal scroll on mobile | `overflow-x: hidden` on body |
| Sticky elements behind iOS notch | `env(safe-area-inset-*)` padding |
| Oversized buttons in bottom nav | `min-h-[44px] min-w-[44px]` |
| Text selection on UI controls | `.no-select` utility class |
| Rubber-band scroll on modals | `overscroll-behavior: contain` |
| Auto-play audio/video | Default: requires user gesture |
| Modal scroll lock issues | `body-scroll-lock` pattern |

## 📱 Performance Targets (Mobile)

### Lighthouse Mobile Score
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95
- PWA: ✅ Installable

### Core Web Vitals (Mobile)
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

## 🔄 Responsive Testing Workflow

```bash
# 1. Local dev with network throttling
npm run dev
# Chrome DevTools → Network → "Slow 3G"

# 2. Test on real devices
# - Use ngrok for HTTPS testing
ngrok http 3000

# 3. Run Lighthouse mobile audit
npx lighthouse https://your-url.com \
  --preset=mobile \
  --view

# 4. Check Core Web Vitals
npx unlighthouse --site https://your-url.com

# 5. Real device testing (optional)
# - BrowserStack
# - Sauce Labs
# - Real phones via local network
```

## 📚 Resources

- [Web.dev Mobile Guide](https://web.dev/mobile/)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Tailwind Responsive](https://tailwindcss.com/docs/responsive-design)
- [PWA Best Practices](https://web.dev/pwa/)
- [iOS Safe Area](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

**Last updated:** 2026-08-02
