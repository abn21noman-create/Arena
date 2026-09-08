# 🏗️ HSC Ultimate — Architecture

HSC Ultimate is built as a modern Next.js 16 application with server-side
rendering, edge-ready deployment, and a clean modular architecture.

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser/PWA)                    │
│  Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (HSTS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS 16 (Vercel/Docker)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              App Router (React Server Components)         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ Pages (RSC) │  │ API Routes    │  │ Middleware      │  │  │
│  │  │             │  │ (214 routes)  │  │ (proxy.ts)      │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    lib/ (Business Logic)                  │  │
│  │  • auth (NextAuth)        • gamification                │  │
│  │  • ai-provider (multi)    • flashcard-gen               │  │
│  │  • spaced-repetition      • analytics                   │  │
│  │  • email (Resend)         • streak                      │  │
│  │  • pdf-chat (RAG)         • admin-auth                  │  │
│  │  • push-notification      • rate-limit (NEW)            │  │
│  │  • logger (NEW)           • ...                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Supabase        │ │   AI Providers   │ │   Email (Resend) │
│  PostgreSQL      │ │ • Groq (primary) │ │                  │
│  (with pgvector) │ │ • Mistral         │ │                  │
│                  │ │ • Cerebras        │ │                  │
│                  │ │ • OpenRouter      │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        │
        ▼
┌──────────────────┐
│  Cloud Storage   │
│  (future: S3)    │
└──────────────────┘
```

## 🧩 Component Layers

### 1. **Presentation Layer** (`app/`, `components/`)
- **Pages** — Server Components (RSC) for data fetching + Client Components for interactivity
- **UI Components** — shadcn/ui primitives + custom glassmorphism design
- **Feature Components** — Feature-specific (CQ runner, Quiz battle, etc.)

### 2. **API Layer** (`app/api/`)
- **RESTful** — Standard HTTP methods
- **Auth-gated** — Most routes require valid session via `auth()`
- **Role-gated** — Admin routes require `role: "ADMIN"`
- **Type-safe** — Zod validation on critical endpoints
- **Rate-limited** — Production endpoints use rate limiting (planned)

### 3. **Business Logic** (`lib/`)
- **Pure functions** — No side effects, easily testable
- **Reusable** — Used across multiple API routes and components
- **Domain-organized** — `lib/auth/`, `lib/gamification/`, etc. (loose)

### 4. **Data Layer** (`prisma/`)
- **Prisma ORM** — Type-safe database access
- **PostgreSQL** — Via Supabase (managed)
- **pgvector** — For PDF Chat RAG (vector embeddings)
- **Migrations** — Version-controlled schema changes
- **Seeds** — Initial data (subjects, chapters, topics, badges)

### 5. **Infrastructure** (External)
- **Vercel/Docker** — Hosting
- **Supabase** — Database + Auth + Storage
- **Groq / Mistral / Cerebras / OpenRouter** — AI inference
- **Resend** — Transactional email
- **VAPID/Web Push** — Browser push notifications

## 🔐 Security Model

### Defense in Depth (5 layers)

```
Layer 1: Edge (CDN/Firewall)
   └─ DDoS protection, rate limiting (planned: Cloudflare)

Layer 2: Next.js Middleware (proxy.ts)
   └─ Route protection, auth checks, role verification
   └─ Ban check, maintenance mode check

Layer 3: API Route Guards
   └─ Session check (auth())
   └─ Role check (requireAdmin())
   └─ Rate limiting (rate-limit.ts)
   └─ Input validation (Zod)
   └─ Resource ownership check (userId === session.user.id)

Layer 4: Database
   └─ Prisma parameterized queries (SQL injection safe)
   └─ Row-Level Security (RLS) — planned via Supabase

Layer 5: Response
   └─ Security headers (X-Frame, HSTS, etc.)
   └─ No sensitive data leakage in errors
```

## 🔄 Data Flow Example: User Mastery

```
User clicks "Mark as Mastered" on Topic page
            │
            ▼
   Client Component (button onClick)
            │
            ▼
   fetch('/api/topics/[id]/progress', { method: 'POST', body: { status: 'MASTERED' } })
            │
            ▼
   API Route Handler (app/api/topics/[topicId]/progress/route.ts)
            │
            ├─ 1. auth() — verify session
            ├─ 2. validate body (Zod)
            ├─ 3. findUnique (existence check) — race condition prevention
            ├─ 4. update topic progress (transaction)
            ├─ 5. award XP (league.ts)
            ├─ 6. check badges (gamification.ts)
            ├─ 7. update user XP/level/streak
            ├─ 8. createNotification (badge unlock)
            ├─ 9. audit log (if admin)
            │
            ▼
   Response: { progress, newXp, newBadges, newLevel }
            │
            ▼
   Client updates UI (XP bar, badge notification, toast)
```

## 🧠 AI Architecture

### Multi-Provider Fallback Chain

```
User asks AI question
        │
        ▼
   lib/ai-provider.ts: getAIResponse()
        │
        ├─ Try Groq (fastest, most reliable)
        │   └─ Success? Return response
        │   └─ Failure? ↓
        │
        ├─ Try Mistral (good Bangla, has vision)
        │   └─ Success? Return response
        │   └─ Failure? ↓
        │
        ├─ Try Cerebras (ultra fast)
        │   └─ Success? Return response
        │   └─ Failure? ↓
        │
        ├─ Try OpenRouter (many models)
        │   └─ Success? Return response
        │   └─ Failure? Return error
        │
        ▼
   Save to DB (chat history)
        │
        ▼
   Return response to user
```

### RAG Pipeline (PDF Chat)

```
User uploads PDF
        │
        ▼
   pdf-parse (extract text)
        │
        ▼
   Chunk text (512 tokens with overlap)
        │
        ▼
   Mistral Embeddings (mistral-embed, 1024-dim)
        │
        ▼
   Store in PdfChunk table (pgvector column)
        │
        ▼
   User asks question
        │
        ▼
   Embed question (same model)
        │
        ▼
   Cosine similarity search (HNSW index)
        │
        ▼
   Top-K chunks retrieved
        │
        ▼
   LLM with context (Groq)
        │
        ▼
   Streamed response with citations
```

## 📁 Project Structure

```
hsc-ultimate/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (route group)
│   ├── (dashboard)/              # Protected pages
│   ├── admin/                    # Admin-only pages
│   ├── api/                      # 214 API routes
│   ├── u/                        # Public profile
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui (20 components)
│   ├── shared/                   # Cross-feature reusable
│   ├── admin/                    # Admin-only
│   ├── dashboard/                # Dashboard widgets
│   ├── learning/                 # Learning Hub
│   ├── practice/                 # Practice Engine
│   ├── flashcards/               # Flashcards
│   ├── planner/                  # Planner
│   ├── forum/                    # Community Forum
│   ├── quiz/                     # Quiz components
│   └── ... (27 feature dirs)
│
├── lib/                          # Business logic (126 modules)
│   ├── prisma.ts                 # Prisma singleton
│   ├── auth.ts                   # NextAuth config
│   ├── ai-provider.ts            # Multi-AI fallback
│   ├── gamification.ts           # XP/Level/Badge logic
│   ├── spaced-repetition.ts      # SM-2 algorithm
│   ├── fsrs.ts                   # FSRS algorithm (newer)
│   ├── logger.ts                 # Production logger (NEW)
│   ├── rate-limit.ts             # Rate limiting (NEW)
│   └── ... (118 more)
│
├── prisma/                       # Database
│   ├── schema.prisma             # 52 models
│   ├── migrations/               # 20 migrations
│   ├── seed*.ts                  # 41 seed scripts
│   └── seed.ts                   # Main seed
│
├── public/                       # Static assets
│   ├── icons/                    # PWA icons
│   ├── fonts/                    # OpenDyslexic, etc.
│   ├── sw.js                     # Service worker
│   └── offline.html              # Offline fallback
│
├── hooks/                        # Custom React hooks
│   └── use-mcq-keyboard-nav.ts
│
├── types/                        # TypeScript types
│
├── docs/                         # Documentation
│   ├── MASTER_PLAN.md
│   ├── PERFORMANCE.md            # (NEW)
│   ├── SYSTEM_OVERVIEW.md
│   └── ... (18 more)
│
├── scripts/                      # Build/maintenance scripts
│   ├── start.sh                  # Production start (NEW)
│   └── ... (14 more)
│
├── .github/                      # GitHub config (NEW)
│   ├── workflows/ci.yml          # CI/CD (NEW)
│   └── ISSUE_TEMPLATE/           # Issue templates (NEW)
│
├── Dockerfile                    # Production container (NEW)
├── .dockerignore                 # Docker ignore (NEW)
├── docker-compose.yml            # Compose file (NEW)
│
├── LICENSE                       # MIT (NEW)
├── CONTRIBUTING.md               # Dev guide (NEW)
├── CODE_OF_CONDUCT.md            # Community rules (NEW)
├── SECURITY.md                   # Vuln reporting (NEW)
├── ARCHITECTURE.md               # This file (NEW)
├── PERFORMANCE.md                # Perf guide (already in docs/)
│
└── ... (config files)
```

## 🛠️ Tech Stack Decisions

### Why Next.js 16?
- **App Router** — Modern RSC + streaming
- **Server Components** — Less JS shipped to client
- **Built-in optimizations** — Image, font, script loading
- **API routes** — No separate backend needed
- **Vercel-ready** — Zero-config deployment

### Why Prisma?
- **Type-safe** — Generated TypeScript types
- **Migrations** — Version-controlled schema
- **Connection pooling** — Works with PgBouncer
- **pgvector support** — For RAG embeddings

### Why Supabase?
- **Managed PostgreSQL** — No DevOps
- **Real-time** — Built-in subscriptions (future)
- **Auth** — Could replace NextAuth (future)
- **Storage** — File uploads (future)

### Why Multi-AI Provider?
- **Reliability** — One fails, others continue
- **Cost optimization** — Choose cheapest for each task
- **Quality** — Different models for different tasks
- **No vendor lock-in** — Easy to swap providers

## 🚀 Deployment Architecture

### Option 1: Vercel (Recommended)
```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Vercel  │ ───→ │  Build   │ ───→ │   Edge   │
│  (GitHub)│      │  (Next)  │      │  Network │
└──────────┘      └──────────┘      └──────────┘
                                            │
                                            ▼
                                    ┌──────────┐
                                    │ Supabase │
                                    │ (DB/API) │
                                    └──────────┘
```

### Option 2: Docker (Self-Hosted)
```
┌──────────┐      ┌──────────┐      ┌──────────┐
│   AWS/   │ ───→ │  Docker  │ ───→ │ Next.js │
│   GCP/   │      │ Container│      │ Standalone│
│  Digital │      │          │      │   Server │
│  Ocean   │      └──────────┘      └──────────┘
└──────────┘            │                  │
                       │              ┌──────────┐
                       └─────────────→│ Supabase │
                                      └──────────┘
```

### Option 3: Hybrid
- Vercel for app hosting
- Supabase for database
- Cloudflare for CDN + DDoS protection
- Upstash Redis for rate limiting

## 📈 Performance Optimizations

See [docs/PERFORMANCE.md](docs/PERFORMANCE.md) for details.

Key optimizations:
- Dynamic imports for heavy components (Recharts, KaTeX)
- Static asset caching (1 year immutable)
- Image optimization (AVIF/WebP, responsive sizes)
- Compression (gzip/brotli)
- Security headers (HSTS, CSP-ready)
- Bundle splitting (route-based)

## 🔍 Observability

### Health Check
`GET /api/health` returns:
- Database connectivity
- Memory usage
- Uptime
- Environment variables
- Version info

### Logging
`lib/logger.ts` provides:
- Structured JSON logs (production)
- Human-readable (development)
- PII redaction
- Request context
- Performance timing

### Recommended Tools
- **Sentry** — Error tracking
- **LogRocket** — Session replay
- **Plausible** — Privacy-friendly analytics
- **UptimeRobot** — Uptime monitoring

## 🌍 Internationalization (Future)

Currently **Bangla-first** with English support. Planned:
- `next-intl` integration
- Multi-language UI
- AI response language selection
- Locale-specific content (BD vs India vs other)

## 🔮 Future Architecture

- **Microservices** — Split AI features into separate service
- **Redis caching** — Global search, leaderboard
- **WebSockets** — Real-time features (currently polling)
- **CDN for images** — Cloudinary/imgix
- **Background jobs** — BullMQ for AI generation
- **GraphQL** — If API complexity grows

---

**Last updated:** 2026-08-02
