# Security & Abuse Testing 2.0

**মূল phase:** ৪ আগস্ট ২০২৬ · **Privacy route regression audit:** ৫ আগস্ট ২০২৬  
**Status:** Full API route manifest, global abuse baseline, mutation-origin guard, body caps and security headers complete

## API security inventory

Static route manifest:

```text
Total API routes:                 213
Admin routes:                      43
Admin guard gaps:                   0
Authenticated/Admin/Cron routes:  205
Intentional public routes:          9
Mutation-capable routes:           146
Private auth gaps:                   0
Private mutation auth gaps:          0
Route-specific rate limits:         26
Global API rate coverage:          213/213
```

## Intentional public routes

- Auth.js GET/POST
- Register
- Forgot password
- Reset password
- Health
- Public profile
- Public VAPID key
- User count
- Public system settings/feature status

Public auth mutations retain strict endpoint-specific IP limits। Cron is not public: missing/wrong Bearer secret returns 401/503।

## Global API abuse baseline

`proxy.ts` এখন সব `/api/:path*` match করে। প্রতিটি API request:

1. validated Content-Length absolute cap check;
2. browser mutation Origin validation;
3. authenticated user অথবা validated proxy IP scoped global rate limit;
4. তারপর endpoint-এর নিজস্ব auth/authorization/stricter limit।

Global limits:

- GET/HEAD/OPTIONS → read policy
- POST/PUT/PATCH/DELETE → create/mutation policy

Critical endpoints—login/register/reset, AI, Admin, Focus, Content Quality—নিজস্ব stricter limiter আগের মতো রাখে। Global limiter সেটি replace করে না; baseline defense-in-depth।

## Mutation Origin / CSRF defense

Browser mutation-এ explicit `Origin` থাকলে:

- request URL-এর same origin; অথবা
- configured `NEXT_PUBLIC_APP_URL`; অথবা
- configured `NEXTAUTH_URL`

হতে হবে। Cross-origin/malformed Origin → 403।

Origin না থাকা service-to-service request allowed, কারণ cron/server clients Origin পাঠায় না; তাদের Bearer/session/auth guard আলাদাভাবে বাধ্যতামূলক। GET/HEAD/OPTIONS origin-block হয় না।

Auth cookie SameSite behavior + route authorization + mutation-origin validation মিলিয়ে defense-in-depth।

## Request body limits

- Next proxy platform cap: **25 MB**
- Global declared Content-Length cap: **25 MB**
- Shared normal protected route: **1 MB**
- Shared AI route: **8 MB**
- Malformed/negative Content-Length: 400
- Over limit: 413 + no-store

Route-specific upload validation আরও ছোট/উপযুক্ত সীমা প্রয়োগ করতে পারে।

## Security headers

সব route-এ:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-DNS-Prefetch-Control: off`
- `X-Permitted-Cross-Domain-Policies: none`
- `Cross-Origin-Opener-Policy: same-origin`
- `Origin-Agent-Cluster: ?1`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- HSTS one year

CSP বর্তমানে **Report-Only**:

- default/base/object/frame/form/script/style/img/font/connect/worker/manifest policies
- বর্তমান app ভাঙানো ছাড়া third-party requirement inventory করার জন্য
- Public staging telemetry যাচাইয়ের পরে enforcing CSP করা যাবে

## Raw SQL audit

Unsafe raw-query files:

```text
lib/pdf-chat.ts
```

এটি pgvector unsupported type/operator-এর জন্য প্রয়োজন। সব document/vector/limit values `$1/$2/$3...` parameter placeholders দিয়ে bind হয়। অন্য কোনো unapproved `$queryRawUnsafe` / `$executeRawUnsafe` file নেই।

## Hard-coded secret scan

App/lib/components/proxy/config source scan:

```text
Private-key pattern: 0
OpenAI-style key:    0
Google API key:      0
GitHub token:        0
```

Actual `.env` values report/manifest-এ পড়া বা লেখা হয় না।

## Unit abuse tests

- same-origin mutation accept
- configured app origin accept
- cross-origin mutation reject
- malformed Origin reject
- GET with foreign Origin allowed
- origin-less cron/service request allowed
- oversized Content-Length 413
- malformed Content-Length 400
- in-budget/missing length allowed

Existing regression baseline এখনও cover করে:

- anonymous protected API 401
- student → Admin 403
- cross-user resource access rejection
- server-side quiz scoring
- duplicate submit/race protection
- Strict Focus consent/revoke/emergency path
- cron wrong/missing secret
- native command replay/session guard

## Automated strict gate

```bash
npm run audit:security
npm run audit:security:strict
```

Strict blocker:

- Admin route guard gap
- private route auth gap
- private mutation auth gap
- global API baseline missing
- required security header missing
- unapproved unsafe raw query
- unparameterized pgvector query
- hard-coded secret pattern

CI strict security report artifact হিসেবে upload করে।

## Result

```text
API security audit: PASS
Admin guard gaps: 0
Private auth gaps: 0
Mutation auth gaps: 0
Global rate coverage: 213/213
Security header gaps: 0
Unsafe raw violations: 0
Hardcoded secret patterns: 0
```

## Important limits

- Public staging URL ছাড়া real distributed DDoS/load test করা হয়নি
- CSP enforcing mode staging report analysis-এর পরে
- Missing Origin service requests auth/secret-এর উপর নির্ভর করে
- In-memory fallback multi-instance global guarantee দেয় না; Upstash activation external pending
- Security testing continuous process; zero static findings মানে absolute security guarantee নয়

## Final verification

- Strict API security audit: PASS
- Migrations: **33/33**
- TypeScript: 0 error
- ESLint: 0 warning
- Web unit tests: **106/106**
- API baseline security tests: 7/7
- Pure logic: 162/162
- Production vulnerabilities: 0
- Production build: compile + TypeScript + **181/181**, exit 0
- Existing Core/Focus E2E baseline: 46/46 + 37/37; Privacy E2E 16/16
- Preview/dev server: off

## Relevant files

- `proxy.ts`
- `lib/request-security.ts`
- `lib/api-security.ts`
- `lib/rate-limit.ts`
- `next.config.ts`
- `scripts/audit-api-security.ts`
- `tests/unit/api-security.test.ts`
- `.github/workflows/ci.yml`
- `reports/api-security-audit-2026-08-04.json`
