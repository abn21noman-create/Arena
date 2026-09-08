# 🤝 Contributing to HSC Ultimate

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to HSC Ultimate. These
are mostly guidelines, not rules. Use your best judgment, and feel free to
propose changes to this document in a pull request.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Quick Start](#-quick-start)
- [Development Workflow](#-development-workflow)
- [Coding Standards](#-coding-standards)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Features](#-suggesting-features)
- [Translation](#-translation)
- [Documentation](#-documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected
to uphold this code. Please report unacceptable behavior to
abn21.noman@gmail.com.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([nodejs.org](https://nodejs.org))
- **npm** 10+ or **pnpm** 9+
- **Git**
- **Supabase account** (for database) — [supabase.com](https://supabase.com)
- **AI provider accounts** (at least one):
  - [Groq](https://console.groq.com) (free tier, recommended)
  - [Mistral AI](https://console.mistral.ai) (free tier, has vision)
  - [Cerebras](https://cloud.cerebras.ai) (free tier)
  - [OpenRouter](https://openrouter.ai) (pay-per-use)
- **Resend account** (for emails) — [resend.com](https://resend.com) (free tier)

### Local Setup

```bash
# 1. Fork the repository, then clone
git clone https://github.com/your-username/hsc-ultimate.git
cd hsc-ultimate

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see SETUP.md for details)

# 4. Set up Supabase
# - Create a new Supabase project
# - Run migrations: npx prisma migrate deploy
# - Seed initial data: npm run db:seed

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

### Recommended VS Code Extensions

- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Tailwind CSS IntelliSense** — Tailwind class autocomplete
- **Prisma** — Prisma schema syntax highlighting
- **Error Lens** — Inline error display
- **GitLens** — Git blame and history
- **Bengali Wiktionary** (optional) — Bengali language support

## 🔄 Development Workflow

### Branch Naming

- `feature/short-description` — New features
- `fix/short-description` — Bug fixes
- `refactor/short-description` — Code refactoring
- `docs/short-description` — Documentation changes
- `test/short-description` — Test additions/changes
- `chore/short-description` — Build/tooling changes

Examples:
- `feature/leaderboard-pagination`
- `fix/forum-vote-double-submit`
- `refactor/api-error-handling`

### Commit Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature

# 2. Make your changes (commit often!)
git add .
git commit -m "feat: add leaderboard pagination"

# 3. Keep your branch in sync with main
git fetch origin
git rebase origin/main

# 4. Push and open PR
git push origin feature/your-feature
```

## 📏 Coding Standards

### TypeScript

- **Strict mode enabled** — no implicit `any`
- **Use proper types** over `any` — prefer `unknown` for true unknowns
- **Export types** alongside implementations
- **Use Zod** for runtime validation at API boundaries

```typescript
// ❌ Bad
function processUser(user: any) {
  return user.email;
}

// ✅ Good
function processUser(user: User): string {
  return user.email;
}

// ✅ Also good (for truly unknown data)
function processData(data: unknown): string {
  if (typeof data === 'object' && data && 'email' in data) {
    return String(data.email);
  }
  throw new Error('Invalid data');
}
```

### Naming Conventions

- **Files:** `kebab-case.ts` or `PascalCase.tsx` (for components)
- **Variables:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Components:** `PascalCase`
- **Types/Interfaces:** `PascalCase`
- **API routes:** `kebab-case` (folder names)

### File Organization

```
app/
├── (auth)/          # Auth-related pages (route group)
│   ├── login/
│   └── register/
├── (dashboard)/     # Authenticated pages (route group)
│   ├── dashboard/
│   └── settings/
├── api/              # API routes
│   └── users/
│       └── [id]/
│           └── route.ts
└── page.tsx          # Home page

components/
├── ui/               # shadcn/ui components (don't edit manually)
├── shared/           # Reusable cross-feature components
├── admin/            # Admin-only components
└── feature-name/     # Feature-specific components

lib/                   # Business logic, utilities, integrations
hooks/                 # Custom React hooks
prisma/                # Database schema and migrations
docs/                  # Documentation
scripts/               # Build/utility scripts
```

### Comments

We use **Bangla** in comments where helpful for context (this is a Bangla-first
platform!), but **English** for technical documentation and code identifiers.

```typescript
// ✅ Good
// ইউজারের XP ক্যালকুলেট করে (১ প্রশ্ন সঠিক = ৫ XP)
const xp = correctAnswers * 5;

// ✅ Also good
// Calculate user XP (5 XP per correct answer)
const xp = correctAnswers * 5;
```

### Error Handling

- Use **try/catch** in all API routes
- Return **proper HTTP status codes** (4xx for client, 5xx for server)
- Use **Bangla error messages** for user-facing errors
- Log errors with context (userId, action, etc.)

```typescript
// ✅ Good API route
try {
  const result = await prisma.user.create({ data });
  return NextResponse.json({ user: result }, { status: 201 });
} catch (error) {
  console.error("User create error:", { error, data });
  return NextResponse.json(
    { error: "ইউজার তৈরি করতে সমস্যা হয়েছে" },
    { status: 500 }
  );
}
```

## 📝 Commit Guidelines

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style (formatting, semicolons, etc.)
- `refactor:` — Code refactoring (no behavior change)
- `perf:` — Performance improvement
- `test:` — Adding/updating tests
- `chore:` — Build/tooling/config changes
- `ci:` — CI/CD changes

### Examples

```bash
feat(forum): add post reactions
fix(auth): prevent session token bloat on long names
docs(readme): update local setup instructions
perf(analytics): lazy load recharts components
test(notifications): add race condition tests
```

## 🔍 Pull Request Process

1. **Update documentation** if you change APIs or add features
2. **Add tests** for new functionality (when test setup exists)
3. **Run lint and type check** before pushing:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
4. **Update CHANGELOG.md** with a brief description
5. **Ensure CI passes** (when CI is set up)
6. **Request review** from a maintainer
7. **Address review comments** — push additional commits to your branch
8. **Squash merge** will be used to keep history clean

### PR Title Format

Same as commit message: `feat(scope): description`

### PR Description Template

```markdown
## What

Brief description of changes

## Why

Motivation / problem solved

## How

Implementation approach (link issues, reference discussions)

## Testing

- [ ] Manual testing done
- [ ] Automated tests added (if applicable)
- [ ] Edge cases considered

## Screenshots (if UI change)

[Attach screenshots / recordings]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed my own code
- [ ] Commented hard-to-understand areas
- [ ] Updated documentation
- [ ] No new warnings introduced
- [ ] Added tests (or explained why not)
```

## 🐛 Reporting Bugs

**Before submitting a bug report:**

1. **Search existing issues** to avoid duplicates
2. **Use the latest version** to ensure the bug still exists
3. **Test in isolation** — disable other extensions/related features

**Submit a bug report with:**

- **Clear title** (e.g., "Forum vote fails on rapid double-click")
- **Steps to reproduce** (numbered)
- **Expected behavior**
- **Actual behavior**
- **Screenshots/recordings** (if applicable)
- **Environment** (browser, OS, Node version)
- **Additional context** (any workarounds you found)

## ✨ Suggesting Features

We love feature suggestions! Before submitting:

1. **Search existing issues** for similar suggestions
2. **Consider the project's scope** (educational, focused, Bangla-first)
3. **Think about maintenance** — every feature is a long-term commitment

**Submit a feature request with:**

- **Problem it solves** (not just the solution)
- **User stories** (who benefits, how)
- **Proposed implementation** (optional, just for context)
- **Alternatives considered**
- **Mockups/wireframes** (for UI features)

## 🌐 Translation

Currently, the platform is **Bangla-first** with some English support. To
help with translation:

1. Strings are mostly inline in components (not yet extracted)
2. AI responses are in Bangla by default
3. Future: i18n support using `next-intl` or similar

If you want to add another language, please open an issue first to discuss.

## 📚 Documentation

- **Code comments** — Add for complex logic
- **JSDoc** — Add for exported functions/types
- **README** — Update if user-facing behavior changes
- **CHANGELOG** — Add entry for user-visible changes
- **docs/** — Add guides, architecture decisions, etc.

### Documentation Style

- **Clear and concise** — don't repeat yourself
- **Examples** — show, don't just tell
- **Up-to-date** — outdated docs are worse than no docs
- **Bilingual** (when helpful) — Bangla for users, English for devs

## 🏆 Recognition

Contributors are recognized in:
- [README.md](README.md) contributors section
- Release notes (CHANGELOG.md)
- Special thanks for significant contributions

## 📞 Questions?

- **General questions:** Open a GitHub Discussion
- **Security issues:** abn21.noman@gmail.com (see [SECURITY.md](SECURITY.md))
- **Code of Conduct violations:** abn21.noman@gmail.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).

---

**Thank you for contributing to HSC Ultimate!** 🎓✨

— The HSC Ultimate Team
