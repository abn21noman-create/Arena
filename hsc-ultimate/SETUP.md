# 🛠️ HSC Ultimate — Setup Guide

Complete step-by-step setup guide for local development and production deployment.

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Local Development Setup](#-local-development-setup)
3. [Production Setup](#-production-setup)
4. [Docker Deployment](#-docker-deployment)
5. [Vercel Deployment](#-vercel-deployment)
6. [Troubleshooting](#-troubleshooting)

## ✅ Prerequisites

### Required Software
- **Node.js** 20+ ([nodejs.org](https://nodejs.org))
- **npm** 10+ or **pnpm** 9+
- **Git**
- **Supabase account** (free tier OK) — [supabase.com](https://supabase.com)
- **AI provider API key** (at least one):
  - [Groq](https://console.groq.com) (recommended, free tier)
  - [Mistral AI](https://console.mistral.ai) (free tier, has vision)
  - [Cerebras](https://cloud.cerebras.ai) (free tier)
  - [OpenRouter](https://openrouter.ai) (pay-per-use)
- **Resend account** (for emails) — [resend.com](https://resend.com) (free tier)

### Recommended Tools
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - Error Lens
- **Postico / pgAdmin** — Database GUI
- **Insomnia / Postman** — API testing
- **TablePlus** — Multi-DB GUI

## 🏠 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/hsc-ultimate.git
cd hsc-ultimate
```

### Step 2: Install Dependencies

```bash
# Reproducible install from package-lock.json
npm ci
```

### Step 3: Set Up Supabase

1. **Create a new Supabase project:**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose a name (e.g., "hsc-ultimate-dev")
   - Set a strong database password (save it!)
   - Choose the closest region
   - Wait for project to be ready (~2 minutes)

2. **Get your connection strings:**
   - Go to Project Settings → Database
   - Under "Connection string", select "Transaction" mode
   - Copy the **Pooled connection** (port 6543) — this is `DATABASE_URL`
   - Select "Session" mode
   - Copy the **Direct connection** (port 5432) — this is `DIRECT_URL`

3. **Enable pgvector extension:**
   - Go to Database → Extensions
   - Search for "vector"
   - Click "Enable" on `vector` extension
   - Required for PDF Chat feature

### Step 4: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Required variables:**

```bash
# Database
DATABASE_URL="postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-0-REGION.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# AI (at least one — Groq recommended)
GROQ_API_KEY="gsk_..."
MISTRAL_API_KEY="..."  # Optional
CEREBRAS_API_KEY="..."  # Optional
OPENROUTER_API_KEY="..."  # Optional

# Email
RESEND_API_KEY="re_..."

# Push notifications (generate with web-push library)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:your-email@example.com"
```

**Generate VAPID keys:**
```bash
node -e "const wp = require('web-push'); console.log(JSON.stringify(wp.generateVAPIDKeys()))"
```

### Step 5: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate deploy

# Seed initial data (13 subjects, 89 chapters, 185 topics, 14 badges)
npm run db:seed
```

### Step 6: Create Admin Account

```bash
# Register a user through the UI at http://localhost:3000/register

# Or use the API:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"Admin12345!"}'

# Then promote to admin:
npm run make-admin admin@example.com
```

### Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 8: Verify Everything Works

- [ ] Homepage loads
- [ ] Can register a new user
- [ ] Can login
- [ ] Dashboard shows
- [ ] Can browse subjects in Learning Hub
- [ ] AI Doubt Solver responds
- [ ] `/api/health` returns 200

## 🌐 Production Setup

### Pre-Deployment Checklist

- [ ] All env vars set in production environment
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` is unique (NOT dev value)
- [ ] Database is backed up
- [ ] All API keys rotated (never use dev keys in prod)
- [ ] Admin password is strong (16+ chars)
- [ ] Email sender domain verified in Resend
- [ ] PWA icons generated
- [ ] `robots.txt` and `sitemap.xml` configured
- [ ] Security headers verified (HSTS, X-Frame-Options, etc.)
- [ ] Health check endpoint working: `https://yourdomain.com/api/health`
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Monitoring set up (UptimeRobot, etc.)
- [ ] Backups automated (daily Supabase snapshots)

### Build for Production

```bash
# Install production dependencies only
npm ci --production

# Generate Prisma Client
npx prisma generate

# Build Next.js
npm run build

# The build output is in .next/ directory
# Standalone server: .next/standalone (with output: 'standalone' in next.config.ts)
```

## 🐳 Docker Deployment

### Build the Image

```bash
docker build -t hsc-ultimate:latest .
```

### Run with Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    image: hsc-ultimate:latest
    container_name: hsc-ultimate
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - MISTRAL_API_KEY=${MISTRAL_API_KEY}
      - CEREBRAS_API_KEY=${CEREBRAS_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
      - VAPID_SUBJECT=${VAPID_SUBJECT}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Run:
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f app
```

## ☁️ Vercel Deployment (Recommended)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/hsc-ultimate)

### Manual Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Link project:**
   ```bash
   vercel link
   ```

4. **Set environment variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add DIRECT_URL
   vercel env add NEXTAUTH_SECRET
   # ... (add all from .env.example)
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Vercel-Specific Configuration

Create `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    }
  ],
  "crons": []
}
```

## 🔧 Troubleshooting

### "Prisma Client not generated" Error

```bash
npx prisma generate
```

### "Connection refused" to Database

1. Check `DATABASE_URL` is correct
2. Verify Supabase project is active (not paused)
3. Check IP allowlist in Supabase (allow all for testing)
4. Test connection:
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```

### "NEXTAUTH_SECRET missing" Error

```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="<generated-secret>"
```

### AI Provider Returns 401 Unauthorized

1. Check API key is correct
2. Verify key has proper permissions
3. Check provider's dashboard for usage limits
4. Test with curl:
   ```bash
   curl -X POST https://api.groq.com/openai/v1/chat/completions \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama-3.1-70b-versatile","messages":[{"role":"user","content":"test"}]}'
   ```

### Build Fails with "Module not found"

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
```

### Push Notifications Don't Work

1. **Generate new VAPID keys:**
   ```bash
   node -e "const wp=require('web-push');console.log(JSON.stringify(wp.generateVAPIDKeys()))"
   ```

2. **Test locally** (use HTTP, not HTTPS, for testing):
   - Some browsers require HTTPS for push
   - Use ngrok or similar for local HTTPS testing

### PDF Upload Fails

1. **Check pgvector extension** is enabled in Supabase
2. **Check file size** — max 10MB by default
3. **Check file type** — only PDF supported
4. **Check Mistral API key** — used for embeddings

### PWA Install Not Showing

1. **HTTPS required** — service workers only work on HTTPS (or localhost)
2. **manifest.webmanifest** must be valid (test with [PWA Builder](https://www.pwabuilder.com/))
3. **Icons** must be present in `/public/icons/`

## 📊 Health Check

After deployment, verify:

```bash
curl https://yourdomain.com/api/health
```

Should return 200 with:

```json
{
  "status": "healthy",
  "timestamp": "2026-08-02T...",
  "uptime": 3600,
  "version": "0.1.0",
  "checks": {
    "database": { "status": "up", "latencyMs": 45 },
    "environment": { "status": "ok", "missing": [] },
    "memory": { "used": 85, "total": 128, "percentage": 66 }
  }
}
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture
- [PERFORMANCE.md](docs/PERFORMANCE.md) — Performance guide
- [CONTRIBUTING.md](CONTRIBUTING.md) — Development guide
- [SECURITY.md](SECURITY.md) — Security policy

## 💬 Getting Help

- 📖 Check this SETUP.md and [README.md](README.md)
- 🐛 [Open an issue](https://github.com/your-username/hsc-ultimate/issues)
- 💬 [Start a discussion](https://github.com/your-username/hsc-ultimate/discussions)
- 📧 Email: abn21.noman@gmail.com

---

**Happy deploying! 🚀**
