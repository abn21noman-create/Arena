# HSC Ultimate — Multi-Language System

**তারিখ:** 2026-08-03
**Status:** ✅ Live, 3 languages, persistent

---

## 🌍 যে ৩টি language support করে

| Locale | Native Name | Flag | Description |
|---|---|---|---|
| **`bn`** | বাংলা | 🇧🇩 | পুরো বাংলা — UI + সব content বাংলায় |
| **`en`** | English | 🇬🇧 | Full English — professional tone |
| **`banglish`** | Banglish | 🔤 | Mixed (HSC students' popular) — technical terms English + rest বাংলা |

## 🎯 কেন ৩টা

- **Bengali** — বাংলাদেশের national language, default expectation
- **English** — international standard, professional
- **Banglish** — HSC students এর মধ্যে অনেক popular (textbook, guide books সব Banglish-e lekha), relatable

## 📁 Files Created/Modified (12)

### Core
- `lib/i18n.ts` (200+ lines) — locale definitions, `t()` translator, browser detection, localStorage helpers
- `locales/en.json` — full English translations
- `locales/bn.json` — full Bengali translations
- `locales/banglish.json` — full Banglish translations

### React
- `components/i18n/language-provider.tsx` — React Context, sync to DB, auto-detect
- `components/i18n/language-toggle.tsx` — 3-state toggle (cycle + dropdown)

### Database
- `prisma/schema.prisma` — `User.preferredLanguage String @default("banglish")`

### API
- `app/api/user/language/route.ts` — GET (fetch) + PATCH (update)

### Layout
- `app/layout.tsx` — `<LanguageProvider>` wrapper
- `app/page.tsx` — Language toggle in nav
- `app/(dashboard)/dashboard/page.tsx` — Language toggle in dashboard top bar
- `components/dashboard/dashboard-hero.tsx` — Uses `t()` for greeting + CTA

---

## 🛠️ কিভাবে কাজ করে

### 1. First Visit (no preference)
```
Browser opens
   ↓
LanguageProvider mounts
   ↓
getStoredLocale() → null
   ↓
detectBrowserLocale():
  - "bn-BD" → "bn"
  - "en-US" → "en"
  - default → "banglish"
   ↓
setLocale(detected) → save to localStorage
   ↓
UI re-renders in detected language
```

### 2. User Toggles Language
```
User clicks LanguageToggle
   ↓
setLocale("en") (or "bn" or "banglish")
   ↓
localStorage.hsc-locale = "en"
   ↓
document.documentElement.lang = "en"
   ↓
fetch PATCH /api/user/language (if logged in)
   ↓
DB User.preferredLanguage = "en"
   ↓
UI re-renders with new translations
```

### 3. Subsequent Visits
```
Browser opens
   ↓
LanguageProvider mounts
   ↓
getStoredLocale() → "en" (from localStorage)
   ↓
setLocale("en") — instant, no flicker
   ↓
[If logged in, server provides initialLocale from DB]
```

---

## 🧪 Verified Tests

| Test | Result |
|---|---|
| Default language on new user | ✅ "banglish" |
| GET /api/user/language | ✅ Returns current language |
| PATCH to "en" | ✅ Saved to DB |
| PATCH to "bn" | ✅ Saved to DB |
| Verify after switch | ✅ Reads back correctly |
| Invalid language ("french") | ✅ 400 error |
| Language toggle in nav | ✅ Renders with flag emoji |
| Dashboard language toggle | ✅ Renders in top bar |
| Hero greeting uses t() | ✅ Translates per locale |
| Smooth icon animation | ✅ AnimatePresence with scale |

---

## 🎨 Toggle UI Features

- **3-state cycle**: BN → EN → Banglish → BN (1 click)
- **Dropdown menu**: Right-click for direct selection
- **Animated flag emoji**: Smooth scale + rotation on switch
- **Glassmorphic dropdown**: Backdrop blur, glass effect
- **Active state indicator**: Check mark + primary color highlight
- **Native name + English name**: বাংলা / Bengali format
- **Hover + click feedback**: 44px+ touch target

---

## 📝 Translation Coverage

Implemented in `locales/{bn,en,banglish}.json`:
- ✅ Common (app name, loading, save, cancel, etc.) — 14 keys
- ✅ Navigation (12 routes) — 12 keys
- ✅ Auth (login, register, etc.) — 9 keys
- ✅ Home (hero, features, trust, CTA) — 9 keys
- ✅ Dashboard (greeting, stats, sections) — 11 keys
- ✅ Subjects (7 HSC subjects) — 7 keys
- ✅ Actions (view, start, etc.) — 4 keys
- ✅ Settings (language, theme) — 6 keys

**Total:** 72 translation keys × 3 locales = 216 translations

## 🔮 Next Steps (Optional)

- Translate content (questions, notes, formulas) — auto-translate via AI
- Per-user content language (different from UI)
- Date/number localization
- RTL support for any future languages
- Translation memory (don't re-translate same strings)
- Crowdsource translations (community)
